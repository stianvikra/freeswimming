import { describe, expect, it } from "vitest";

import {
  buildCommandChecklist,
  buildPreMergeEvidenceLine,
  buildVerifyPrePrLine,
} from "../../scripts/generate-pr-body.mjs";

describe("generate-pr-body verification lane evidence", () => {
  it("includes lane in pre-PR evidence line when present", () => {
    const line = buildVerifyPrePrLine({
      status: "PASS",
      runDir: "artifacts/test-runs/latest",
      lane: "docs-only",
      summaryLines: [],
    });

    expect(line).toContain("lane: docs-only");
  });

  it("builds docs-only checklist without runtime gates", () => {
    const checklist = buildCommandChecklist({
      docsOnlyChecklist: true,
      verifyRun: {
        status: "PASS",
        lane: "docs-only",
        runDir: "artifacts/test-runs/latest",
        summaryLines: [],
      },
      verifyPreMergeEvidence: {
        checked: true,
        line: "pass",
      },
    });

    expect(checklist).toContain("- [x] `npm run verify:docs-only`");
    expect(checklist).toContain("- [ ] `npm run lint:briefs:all`");
    expect(checklist.some((line) => line.includes("`npm run build`"))).toBe(false);
    expect(checklist.some((line) => line.includes("`npm run test:e2e`"))).toBe(false);
  });

  it("builds full checklist with runtime gates", () => {
    const checklist = buildCommandChecklist({
      docsOnlyChecklist: false,
      verifyRun: {
        status: "PASS",
        lane: "full-public",
        runDir: "artifacts/test-runs/latest",
        summaryLines: [],
      },
      verifyPreMergeEvidence: {
        checked: false,
        line: "pending",
      },
    });

    expect(checklist).toContain("- [ ] `npm run build`");
    expect(checklist).toContain("- [ ] `npm run test:e2e` (or explain why skipped)");
    expect(checklist.some((line) => line.includes("`npm run verify:docs-only`"))).toBe(false);
  });

  it("includes lane and mode in pre-merge PASS evidence", () => {
    const evidence = buildPreMergeEvidenceLine(
      {
        status: "PASS",
        shortSha: "abcdef1",
        timestampUtc: "2026-04-11T18:00:00Z",
        verificationLane: "docs-only",
        privateGateMode: "skipped-docs-only",
        shaMatches: true,
      },
      "abcdef1"
    );

    expect(evidence.checked).toBe(true);
    expect(evidence.line).toContain("lane: docs-only");
    expect(evidence.line).toContain("mode: skipped-docs-only");
  });
});
