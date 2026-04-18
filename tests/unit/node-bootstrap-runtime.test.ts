import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function getShellErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const stderr =
    "stderr" in error && typeof error.stderr === "string" && error.stderr.trim().length > 0
      ? error.stderr.trim()
      : "";
  return stderr || error.message;
}

describe("bootstrap-node helper", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads node and npm through repo-standard nvm bootstrap via default alias when .nvmrc is absent", () => {
    const nvmDir = mkdtempSync(join(tmpdir(), "node-bootstrap-nvm-"));
    const fakeBin = join(nvmDir, "fake-bin");
    tempDirs.push(nvmDir);
    mkdirSync(fakeBin, { recursive: true });

    writeExecutable(join(fakeBin, "node"), "#!/usr/bin/env bash\nexit 0\n");
    writeExecutable(join(fakeBin, "npm"), "#!/usr/bin/env bash\nexit 0\n");
    writeFileSync(
      join(nvmDir, "nvm.sh"),
      [
        "#!/usr/bin/env bash",
        "nvm() {",
        '  if [ "${1:-}" = "use" ] && [ "${2:-}" = "--silent" ] && [ $# -eq 2 ]; then',
        "    return 1",
        "  fi",
        '  if [ "${1:-}" = "use" ] && [ "${2:-}" = "--silent" ] && [ "${3:-}" = "default" ]; then',
        '    export PATH="${FAKE_BIN}:${PATH}"',
        "    return 0",
        "  fi",
        "  return 1",
        "}",
        "",
      ].join("\n"),
      "utf8"
    );

    const output = runShell(
      [
        "source ./scripts/lib/bootstrap-node.sh",
        'require_npm_runtime "[test]"',
        "command -v node",
        "command -v npm",
      ].join("\n"),
      {
        PATH: "/usr/bin:/bin",
        NVM_DIR: nvmDir,
        FAKE_BIN: fakeBin,
      }
    );

    expect(output).toContain(join(fakeBin, "node"));
    expect(output).toContain(join(fakeBin, "npm"));
  });

  it("fails with the shared repo hint when node is still unavailable", () => {
    try {
      runShell('source ./scripts/lib/bootstrap-node.sh\nrequire_node_runtime "[test]"', {
        PATH: "/usr/bin:/bin",
        NVM_DIR: join(repoRoot, "definitely-missing-nvm"),
      });
      throw new Error("Expected helper to fail when node is unavailable.");
    } catch (error) {
      expect(getShellErrorMessage(error)).toContain("Run `nvm use --silent default`");
    }
  });

  it("keeps an existing node on PATH even when npm is unavailable", () => {
    const binDir = mkdtempSync(join(tmpdir(), "node-bootstrap-node-only-"));
    tempDirs.push(binDir);
    writeExecutable(join(binDir, "node"), "#!/usr/bin/env bash\nexit 0\n");

    const output = runShell(
      [
        "source ./scripts/lib/bootstrap-node.sh",
        'require_node_runtime "[test]"',
        "command -v node",
      ].join("\n"),
      {
        PATH: `${binDir}:/usr/bin:/bin`,
        NVM_DIR: join(repoRoot, "definitely-missing-nvm"),
      }
    );

    expect(output).toBe(join(binDir, "node"));
  });
});
