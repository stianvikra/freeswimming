import { describe, expect, it } from "vitest";

import {
  classifyVerificationLane,
  explainVerificationScope,
  isDocsOnlyEligibleChangeSet,
  isDocsOnlyEligiblePath,
} from "../../scripts/verification-scope.mjs";

describe("verification scope", () => {
  it("allows docs and governance paths in the docs-only lane", () => {
    expect(isDocsOnlyEligiblePath("docs/task-briefs/done/example.md")).toBe(true);
    expect(isDocsOnlyEligiblePath("AGENTS.md")).toBe(true);
    expect(isDocsOnlyEligiblePath(".github/pull_request_template.md")).toBe(true);
  });

  it("rejects non-docs paths from the docs-only lane", () => {
    expect(isDocsOnlyEligiblePath("components/workouts/foo.tsx")).toBe(false);
    expect(isDocsOnlyEligiblePath("scripts/run-verify-pre-merge.sh")).toBe(false);
    expect(isDocsOnlyEligiblePath("package.json")).toBe(false);
  });

  it("classifies pure docs/governance diffs as docs-only", () => {
    const changedFiles = [
      "docs/task-briefs/done/2026-04-11-example.md",
      ".github/pull_request_template.md",
    ];

    expect(isDocsOnlyEligibleChangeSet(changedFiles)).toBe(true);
    expect(classifyVerificationLane(changedFiles)).toBe("docs-only");
  });

  it("classifies mixed diffs as full", () => {
    const changedFiles = [
      "docs/runbooks/local-verify-and-test-artifacts.md",
      "components/ui/button.tsx",
    ];

    expect(isDocsOnlyEligibleChangeSet(changedFiles)).toBe(false);
    expect(classifyVerificationLane(changedFiles)).toBe("full");
  });

  it("fails closed to full when forced explicitly", () => {
    const changedFiles = ["docs/task-briefs/done/2026-04-11-example.md"];
    const result = explainVerificationScope(changedFiles, {
      env: { VERIFY_FORCE_FULL: "1" },
    });

    expect(result.lane).toBe("full");
    expect(result.reason).toContain("VERIFY_FORCE_FULL=1");
  });

  it("reports disallowed paths when docs-only is not eligible", () => {
    const result = explainVerificationScope(["docs/foo.md", "tests/unit/example.test.ts"]);

    expect(result.lane).toBe("full");
    expect(result.disallowedPaths).toEqual(["tests/unit/example.test.ts"]);
  });

  it("ignores local artifacts when classifying docs-only scope", () => {
    const result = explainVerificationScope([
      "artifacts/perf-budgets/trend-log.ndjson",
      "docs/foo.md",
    ]);

    expect(result.lane).toBe("docs-only");
    expect(result.changedFiles).toEqual(["docs/foo.md"]);
  });
});
