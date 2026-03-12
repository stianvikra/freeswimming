import { describe, expect, it } from "vitest";
import { validatePullRequestBody } from "../../scripts/lint-pr-body-sections.mjs";

const HEAD_SHA = "abcdef1234567890abcdef1234567890abcdef12";

function buildPrBody(options?: {
  policyImpact?: string;
  policyVersionNote?: string;
  policyChecklist?: string;
}) {
  const policyImpact = options?.policyImpact ?? "no (docs/scripting scope only)";
  const policyVersionNote =
    options?.policyVersionNote ?? "N/A (no policy-impacting scope detected)";
  const policyChecklist =
    options?.policyChecklist ?? "N/A (no policy-impacting scope detected in changed files)";

  return `
## Summary

- User-visible changes: No runtime behavior changes.
- Technical changes: Updated automation/docs scripts only.
- Policy impact: ${policyImpact}
- Policy version note: ${policyVersionNote}
- Brief link(s): docs/task-briefs/in-progress/2026-03-10-aw-011-terms-privacy-compliance-lifecycle-10-10.md

## Scope

- In scope: docs/scripts policy-governance automation.
- Out of scope: runtime feature behavior and DB migrations.

## Risk

- Main risk: validator strictness can block incomplete PR bodies.
- Rollback plan: revert this commit.

## Test Evidence

- Policy-impact checklist: ${policyChecklist}
- \`npm run verify:pre-pr\`: PASS (artifacts/test-runs/latest)
- \`npm run verify:pre-merge\`: PASS for \`${HEAD_SHA.slice(0, 7)}\` (2026-03-12T09:00:00Z, mode: skipped).

## Checklist

- [ ] Acceptance criteria are met
`.trim();
}

describe("validatePullRequestBody policy-impact enforcement", () => {
  it("passes for non-policy scope with explicit no + N/A rationale", () => {
    const errors = validatePullRequestBody(buildPrBody(), {
      headSha: HEAD_SHA,
      changedFiles: ["docs/runbooks/admin-email-template-governance.md"],
    });

    expect(errors).toEqual([]);
  });

  it("fails when policy impact is declared no but changed files include policy-impact paths", () => {
    const errors = validatePullRequestBody(buildPrBody(), {
      headSha: HEAD_SHA,
      changedFiles: ["app/api/user/delete/route.ts"],
    });

    expect(errors.join("\n")).toContain("Summary declares `Policy impact: no`");
  });

  it("fails when policy impact is yes but checklist is N/A", () => {
    const errors = validatePullRequestBody(
      buildPrBody({
        policyImpact: "yes (auth/session paths changed)",
        policyChecklist: "N/A (left blank by mistake)",
      }),
      {
        headSha: HEAD_SHA,
        changedFiles: ["app/auth/sign-in/page.tsx"],
      }
    );

    expect(errors).toContain("`Policy impact: yes` cannot use `Policy-impact checklist: N/A`.");
  });

  it("passes when policy impact is yes with structured evidence", () => {
    const errors = validatePullRequestBody(
      buildPrBody({
        policyImpact: "yes (auth/session paths changed)",
        policyVersionNote: "N/A (policy text unchanged after review against current behavior)",
        policyChecklist:
          "PASS (docs/checklists/policy-impact-release-review.md run on current scope)",
      }),
      {
        headSha: HEAD_SHA,
        changedFiles: ["app/auth/sign-in/page.tsx"],
      }
    );

    expect(errors).toEqual([]);
  });

  it("fails when policy-impact summary line is missing", () => {
    const body = buildPrBody().replace(/^- Policy impact:.*\n/m, "");
    const errors = validatePullRequestBody(body, {
      headSha: HEAD_SHA,
      changedFiles: ["docs/runbooks/admin-email-template-governance.md"],
    });

    expect(errors).toContain(
      'Section "## Summary" is missing a filled `Policy impact` line (`yes` or `no` + rationale).'
    );
  });
});
