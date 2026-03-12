import { describe, expect, it } from "vitest";
import {
  lintAdminAuditChecklistText,
  lintAdminAuditFindingsText,
  lintAdminAuditGateBundleFile,
} from "../../scripts/lint-admin-audit-checklist.mjs";

function buildChecklist(evidenceCell: string) {
  return `
# Full Admin Audit Gate Checklist

## Critical Workflow Matrix

| ID | Workflow | Route/API Surface | Expected Coverage | Evidence |
| --- | --- | --- | --- | --- |
| \`A1\` | Access gate | /admin | Negative auth checks | ${evidenceCell} |
`.trim();
}

function buildFindings({
  scoreWorkflowId = "A1",
  findingWorkflowId = "A1",
  scoreValue = "5",
} = {}) {
  return `
# Full Admin Audit Findings Log

## Workflow Scores (0-5)

| ID | Workflow | Score (0-5) | Evidence | Gap Summary | Status |
| --- | --- | --- | --- | --- | --- |
| \`${scoreWorkflowId}\` | Access gate | \`${scoreValue}\` | \`tests/e2e/admin-foundation.spec.ts\` | No baseline gap | \`pass\` |

## Findings Register

| Finding ID | Severity (P0/P1/P2) | Workflow ID | Gap Summary | Owner | Target Date | Evidence To Close | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| \`F001\` | \`P2\` | \`${findingWorkflowId}\` | Follow-up detail | \`owner\` | \`2026-03-19\` | Linked PR | \`open\` |
`.trim();
}

describe("lintAdminAuditChecklistText", () => {
  it("passes when matrix row references existing e2e evidence files", () => {
    const markdown = buildChecklist("`tests/e2e/admin-foundation.spec.ts`");
    const fileMap = new Map([
      ["tests/e2e/admin-foundation.spec.ts", "test.describe('admin foundation', () => {});"],
    ]);

    const result = lintAdminAuditChecklistText(markdown, {
      fileExists: (path: string) => fileMap.has(path),
      readText: (path: string) => fileMap.get(path) ?? "",
    });

    expect(result.errors).toEqual([]);
    expect(result.rowCount).toBe(1);
    expect(result.evidenceCount).toBe(1);
  });

  it("fails when evidence path is outside tests/e2e", () => {
    const markdown = buildChecklist("`tests/unit/admin-foundation.test.ts`");

    const result = lintAdminAuditChecklistText(markdown, {
      fileExists: () => true,
      readText: () => "test('placeholder', () => {});",
    });

    expect(result.errors.join("\n")).toContain("has no parsable *.spec.ts evidence paths");
  });

  it("fails when evidence file does not exist", () => {
    const markdown = buildChecklist("`tests/e2e/admin-help-center.spec.ts`");

    const result = lintAdminAuditChecklistText(markdown, {
      fileExists: () => false,
      readText: () => "",
    });

    expect(result.errors.join("\n")).toContain("evidence file does not exist");
  });

  it("fails when evidence file has no playwright test definitions", () => {
    const markdown = buildChecklist("`tests/e2e/admin-help-center.spec.ts`");

    const result = lintAdminAuditChecklistText(markdown, {
      fileExists: () => true,
      readText: () => "const value = 1;",
    });

    expect(result.errors.join("\n")).toContain("has no Playwright test definitions");
  });
});

describe("lintAdminAuditFindingsText", () => {
  it("passes when findings log includes aligned workflow rows", () => {
    const markdown = buildFindings();

    const result = lintAdminAuditFindingsText(markdown, {
      expectedWorkflowIds: ["A1"],
    });

    expect(result.errors).toEqual([]);
    expect(result.scoreRowCount).toBe(1);
    expect(result.findingRowCount).toBe(1);
  });

  it("fails when score table misses checklist workflow ids", () => {
    const markdown = buildFindings({ scoreWorkflowId: "A2" });

    const result = lintAdminAuditFindingsText(markdown, {
      expectedWorkflowIds: ["A1"],
    });

    expect(result.errors.join("\n")).toContain("missing ids from checklist matrix: A1");
  });

  it("fails when findings row references workflow id not in checklist matrix", () => {
    const markdown = buildFindings({ findingWorkflowId: "A2" });

    const result = lintAdminAuditFindingsText(markdown, {
      expectedWorkflowIds: ["A1"],
    });

    expect(result.errors.join("\n")).toContain(
      'references workflow id "A2" not present in checklist matrix'
    );
  });

  it("fails when score is outside 0-5 range", () => {
    const markdown = buildFindings({ scoreValue: "8" });

    const result = lintAdminAuditFindingsText(markdown, {
      expectedWorkflowIds: ["A1"],
    });

    expect(result.errors.join("\n")).toContain('has invalid score "8"');
  });
});

describe("lintAdminAuditGateBundleFile", () => {
  it("combines checklist and findings validation into one result", () => {
    const fileMap = new Map<string, string>([
      [
        "docs/checklists/admin-full-audit-gate-checklist.md",
        buildChecklist("`tests/e2e/admin-foundation.spec.ts`"),
      ],
      ["docs/checklists/admin-full-audit-findings-log.md", buildFindings()],
      ["tests/e2e/admin-foundation.spec.ts", "test.describe('admin foundation', () => {});"],
    ]);

    const result = lintAdminAuditGateBundleFile(
      "docs/checklists/admin-full-audit-gate-checklist.md",
      "docs/checklists/admin-full-audit-findings-log.md",
      {
        readMarkdown: (path: string) => fileMap.get(path) ?? "",
        fileExists: (path: string) => fileMap.has(path),
        readText: (path: string) => fileMap.get(path) ?? "",
      }
    );

    expect(result.errors).toEqual([]);
    expect(result.checklistRowCount).toBe(1);
    expect(result.findingsScoreRowCount).toBe(1);
    expect(result.findingsRegisterRowCount).toBe(1);
  });
});
