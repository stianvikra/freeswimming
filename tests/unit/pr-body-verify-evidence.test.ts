import { describe, expect, it } from "vitest";

import { validatePullRequestBody } from "../../scripts/lint-pr-body-sections.mjs";

const HEAD_SHA = "abcdef1234567890abcdef1234567890abcdef12";

function buildBody(testEvidenceLines: string[]) {
  return `
## Summary

- Plain-language done summary: This PR keeps the live product unchanged while improving repo tooling evidence.
- Recommended next step: Monitor required checks, then run \`npm run verify:pre-merge\` before merge.
- User-visible changes: No runtime behavior changes.
- Technical changes: Updated repo tooling and docs only.
- Policy impact: no (tooling-only scope)
- Policy version note: N/A (no policy-impacting scope detected)
- Brief link(s): docs/task-briefs/in-progress/2026-04-18-tooling-friction-hardening-pre-live-10-10.md

## Scope

- In scope: tooling hardening only.
- Out of scope: runtime features and database changes.

## Risk

- Main risk: strict PR-body parsing can block malformed evidence lines.
- Rollback plan: revert this commit.

## Test Evidence

${testEvidenceLines.join("\n")}

## Checklist

- [ ] Acceptance criteria are met
`.trim();
}

describe("validatePullRequestBody verify evidence parsing", () => {
  it("ignores prose mentions and accepts the later structured evidence line", () => {
    const errors = validatePullRequestBody(
      buildBody([
        "- Merge note: rerun npm run verify:pre-merge before merge if HEAD changes.",
        "- `npm run verify:pre-pr`: PASS (artifacts/test-runs/latest)",
        `- \`npm run verify:pre-merge\`: PENDING for \`${HEAD_SHA.slice(0, 7)}\` (required before merge to \`main\`).`,
        "- Policy-impact checklist: N/A (no policy-impacting scope detected in changed files)",
      ]),
      {
        headSha: HEAD_SHA,
        changedFiles: ["scripts/lint-pr-body-sections.mjs"],
      }
    );

    expect(errors).toEqual([]);
  });

  it("fails with a precise format error when verify evidence is only mentioned in prose", () => {
    const errors = validatePullRequestBody(
      buildBody([
        "- `npm run verify:pre-pr`: PASS (artifacts/test-runs/latest)",
        "- Merge note: rerun npm run verify:pre-merge before merge if HEAD changes.",
        "- Policy-impact checklist: N/A (no policy-impacting scope detected in changed files)",
      ]),
      {
        headSha: HEAD_SHA,
        changedFiles: ["scripts/lint-pr-body-sections.mjs"],
      }
    );

    expect(errors).toContain(
      'Section "## Test Evidence" mentions `npm run verify:pre-merge` but not in the required evidence format. Use: - `npm run verify:pre-merge`: **PASS|FAIL|PENDING|NOT RUN** ...'
    );
  });
});
