import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function writeExecutable(filePath: string, content: string) {
  writeFileSync(filePath, content, "utf8");
  chmodSync(filePath, 0o755);
}

function runShell(script: string, env: Record<string, string | undefined> = {}) {
  return execFileSync("/bin/bash", ["--noprofile", "--norc", "-c", script], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env,
    },
    encoding: "utf8",
  }).trim();
}

describe("resolve-gh-cli helper", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prefers GH_BIN override when executable", () => {
    const dir = mkdtempSync(join(tmpdir(), "gh-cli-override-"));
    tempDirs.push(dir);
    const fakeGh = join(dir, "gh");
    writeExecutable(fakeGh, "#!/usr/bin/env bash\nexit 0\n");

    const resolved = runShell("source ./scripts/lib/resolve-gh-cli.sh; resolve_gh_bin", {
      GH_BIN: fakeGh,
      PATH: "/usr/bin:/bin",
    });

    expect(resolved).toBe(fakeGh);
  });

  it("uses gh from PATH when available", () => {
    const dir = mkdtempSync(join(tmpdir(), "gh-cli-path-"));
    tempDirs.push(dir);
    const fakeGh = join(dir, "gh");
    writeExecutable(fakeGh, "#!/usr/bin/env bash\nexit 0\n");

    const resolved = runShell("source ./scripts/lib/resolve-gh-cli.sh; resolve_gh_bin", {
      PATH: `${dir}:/usr/bin:/bin`,
    });

    expect(resolved).toBe(fakeGh);
  });

  it("falls back to configured Homebrew-style path list when gh is not on PATH", () => {
    const dir = mkdtempSync(join(tmpdir(), "gh-cli-fallback-"));
    tempDirs.push(dir);
    const fakeGh = join(dir, "gh");
    writeExecutable(fakeGh, "#!/usr/bin/env bash\nexit 0\n");

    const resolved = runShell("source ./scripts/lib/resolve-gh-cli.sh; resolve_gh_bin", {
      PATH: "/usr/bin:/bin",
      GH_FALLBACK_PATHS: fakeGh,
      GH_SKIP_PATH_LOOKUP: "1",
    });

    expect(resolved).toBe(fakeGh);
  });

  it("fails when gh is unavailable everywhere", () => {
    expect(() =>
      runShell("source ./scripts/lib/resolve-gh-cli.sh; resolve_gh_bin", {
        PATH: "/usr/bin:/bin",
        GH_FALLBACK_PATHS: "/definitely/missing/gh",
        GH_BIN: "",
        GH_SKIP_PATH_LOOKUP: "1",
      })
    ).toThrow();
  });

  it("checks auth status using the resolved binary path", () => {
    const dir = mkdtempSync(join(tmpdir(), "gh-cli-auth-"));
    tempDirs.push(dir);
    const fakeGh = join(dir, "gh");
    writeExecutable(
      fakeGh,
      [
        "#!/usr/bin/env bash",
        'if [ "$1" = "auth" ] && [ "$2" = "status" ]; then',
        "  exit 0",
        "fi",
        "exit 1",
        "",
      ].join("\n")
    );

    const result = runShell(
      'source ./scripts/lib/resolve-gh-cli.sh; gh_cli_is_authenticated "$GH_BIN" && echo ok',
      {
        GH_BIN: fakeGh,
        PATH: "/usr/bin:/bin",
      }
    );

    expect(result).toBe("ok");
  });

  it("keeps pr-create-safari --print deterministic when gh is unavailable", () => {
    const result = runShell("bash ./scripts/pr-create-safari.sh --print feature/test-branch", {
      PATH: "/usr/bin:/bin",
      GH_FALLBACK_PATHS: "/definitely/missing/gh",
      GH_BIN: "",
      GH_SKIP_PATH_LOOKUP: "1",
    });

    expect(result).toBe(
      "https://github.com/stianvikra/freeswimming/pull/new/feature%2Ftest-branch"
    );
  });

  it("lets pr-create-safari resolve an existing PR through fallback gh paths", () => {
    const dir = mkdtempSync(join(tmpdir(), "gh-cli-script-"));
    tempDirs.push(dir);
    const fakeGh = join(dir, "gh");
    writeExecutable(
      fakeGh,
      [
        "#!/usr/bin/env bash",
        'if [ "$1" = "auth" ] && [ "$2" = "status" ]; then',
        "  exit 0",
        "fi",
        'if [ "$1" = "pr" ] && [ "$2" = "list" ]; then',
        '  printf "%s\\n" "https://github.com/stianvikra/freeswimming/pull/999"',
        "  exit 0",
        "fi",
        "exit 1",
        "",
      ].join("\n")
    );

    const result = runShell("bash ./scripts/pr-create-safari.sh --print feature/test-branch", {
      PATH: "/usr/bin:/bin",
      GH_FALLBACK_PATHS: fakeGh,
      GH_SKIP_PATH_LOOKUP: "1",
    });

    expect(result).toBe("https://github.com/stianvikra/freeswimming/pull/999");
  });

  it("explains when open-pr-safari resolves a PR through the discovered gh binary", () => {
    const dir = mkdtempSync(join(tmpdir(), "gh-cli-open-script-"));
    tempDirs.push(dir);
    const fakeGh = join(dir, "gh");
    const fakeOsascript = join(dir, "osascript");

    writeExecutable(
      fakeGh,
      [
        "#!/usr/bin/env bash",
        'if [ "$1" = "auth" ] && [ "$2" = "status" ]; then',
        "  exit 0",
        "fi",
        'if [ "$1" = "pr" ] && [ "$2" = "list" ]; then',
        '  printf "%s\\n" "https://github.com/stianvikra/freeswimming/pull/321"',
        "  exit 0",
        "fi",
        "exit 1",
        "",
      ].join("\n")
    );
    writeExecutable(fakeOsascript, "#!/usr/bin/env bash\nexit 0\n");

    const result = runShell("bash ./scripts/open-pr-safari.sh feature/test-branch", {
      PATH: `${dir}:/usr/bin:/bin`,
      GH_FALLBACK_PATHS: fakeGh,
    });

    expect(result).toContain("[open-pr-safari] Resolved PR URL via GitHub CLI");
    expect(result).toContain(
      "[open-pr-safari] Opened: https://github.com/stianvikra/freeswimming/pull/321"
    );
  });
});
