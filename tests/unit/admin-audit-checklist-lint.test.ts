import { describe, expect, it } from "vitest";
import { lintAdminAuditChecklistText } from "../../scripts/lint-admin-audit-checklist.mjs";

function buildChecklist(evidenceCell: string) {
  return `
# Full Admin Audit Gate Checklist

## Critical Workflow Matrix

| ID | Workflow | Route/API Surface | Expected Coverage | Evidence |
| --- | --- | --- | --- | --- |
| \`A1\` | Access gate | /admin | Negative auth checks | ${evidenceCell} |
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
