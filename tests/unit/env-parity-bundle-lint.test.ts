import { describe, expect, it } from "vitest";

import {
  lintEnvParityBundleTexts,
  lintEnvParityChecklistText,
  lintEnvParityRunbookText,
} from "../../scripts/lint-env-parity-bundle.mjs";

const validRunbook = `# Environment Config And Secret Parity Runbook

## Runtime Env Matrix

Matrix.

## Admin Access Troubleshooting (Deterministic)

Troubleshoot.

## Vercel Update Order (Preview/Production)

1. Record smoke evidence in:
   - docs/checklists/admin-access-and-secret-rotation.md

## Brief Closeout Gate

1. Manual smoke evidence table has \`pass\` for both \`preview\` and \`production\`.
`;

const checklistWithTemplates = `# Admin Access And Secret Rotation Checklist

## Manual Smoke Evidence (Required Before Brief Closeout)

| Date (UTC) | Environment  | Operator | /auth/sign-in | /api/runtime/flags (\`ok: true\`) | dashboardVisible=true (signed-in admin) | /admin | /api/contact (allowed origin) | /api/checkout/session (app flow) | Result  | Notes |
| ---------- | ------------ | -------- | ------------- | --------------------------------- | --------------------------------------- | ------ | ----------------------------- | -------------------------------- | ------- | ----- |
| TBD        | \`preview\`    | TBD      | pending       | pending                           | pending                                 | pending | pending                       | pending                          | pending |       |
| TBD        | \`production\` | TBD      | pending       | pending                           | pending                                 | pending | pending                       | pending                          | pending |       |

Closeout rule:

- Keep brief \`in-progress\` until both \`preview\` and \`production\` rows are \`pass\`.
- Template TBD rows must be replaced or removed before brief closeout.
`;

const checklistWithPassingRows = `# Admin Access And Secret Rotation Checklist

## Manual Smoke Evidence (Required Before Brief Closeout)

| Date (UTC)           | Environment  | Operator     | /auth/sign-in | /api/runtime/flags (\`ok: true\`) | dashboardVisible=true (signed-in admin) | /admin | /api/contact (allowed origin) | /api/checkout/session (app flow) | Result | Notes               |
| -------------------- | ------------ | ------------ | ------------- | --------------------------------- | --------------------------------------- | ------ | ----------------------------- | -------------------------------- | ------ | ------------------- |
| 2026-03-13T09:00:00Z | \`preview\`    | \`stianvikra\` | pass          | pass                              | pass                                    | pass   | pass                          | pass                             | pass   | preview smoke pass  |
| 2026-03-13T09:15:00Z | \`production\` | \`stianvikra\` | pass          | pass                              | pass                                    | pass   | pass                          | pass                             | pass   | production smoke pass |

Closeout rule:

- Keep brief \`in-progress\` until both \`preview\` and \`production\` rows are \`pass\`.
- Template TBD rows must be replaced or removed before brief closeout.
`;

const inProgressBrief = `# Task Brief

## Metadata

- \`status\`: \`in-progress\`

See:
- \`docs/runbooks/environment-config-and-secret-parity.md\`
- \`docs/checklists/admin-access-and-secret-rotation.md\`
`;

const doneBrief = `# Task Brief

## Metadata

- \`status\`: \`done\`

See:
- \`docs/runbooks/environment-config-and-secret-parity.md\`
- \`docs/checklists/admin-access-and-secret-rotation.md\`
`;

describe("env parity bundle lint", () => {
  it("accepts runbook structure when required sections exist", () => {
    expect(lintEnvParityRunbookText(validRunbook).errors).toEqual([]);
  });

  it("allows template checklist rows while brief is still in progress", () => {
    const result = lintEnvParityBundleTexts({
      briefText: inProgressBrief,
      checklistText: checklistWithTemplates,
      runbookText: validRunbook,
      briefPath:
        "docs/task-briefs/in-progress/2026-02-19-environment-config-and-secret-parity-audit.md",
    });

    expect(result.errors).toEqual([]);
    expect(result.closeoutRequired).toBe(false);
  });

  it("fails closeout when checklist still contains placeholder rows", () => {
    const result = lintEnvParityBundleTexts({
      briefText: doneBrief,
      checklistText: checklistWithTemplates,
      runbookText: validRunbook,
      briefPath: "docs/task-briefs/done/2026-02-19-environment-config-and-secret-parity-audit.md",
    });

    expect(result.closeoutRequired).toBe(true);
    expect(result.errors.join("\n")).toContain('placeholder smoke-evidence row(s) for "preview"');
    expect(result.errors.join("\n")).toContain(
      'placeholder smoke-evidence row(s) for "production"'
    );
  });

  it("passes closeout when preview and production rows are fully recorded as pass", () => {
    const result = lintEnvParityBundleTexts({
      briefText: doneBrief,
      checklistText: checklistWithPassingRows,
      runbookText: validRunbook,
      briefPath: "docs/task-briefs/done/2026-02-19-environment-config-and-secret-parity-audit.md",
    });

    expect(result.errors).toEqual([]);
    expect(result.closeoutRequired).toBe(true);
  });

  it("fails when manual smoke table is missing required columns", () => {
    const brokenChecklist = checklistWithPassingRows.replace(
      "| Notes               |",
      "| Extra |"
    );
    const result = lintEnvParityChecklistText(brokenChecklist, { requireCloseout: true });

    expect(result.errors.join("\n")).toContain('missing required column "notes"');
  });
});
