## Summary

- What changed and why?
- User-visible changes:
- Technical changes:
- Policy impact: yes/no (short rationale)
- Policy version note: YYYY-MM-DD.rev or N/A (with rationale)

## Scope

- In scope:
- Out of scope:

## Risk

- Main risk:
- Rollback plan:

## Test Evidence

- Policy-impact checklist: PASS/FAIL/PENDING/N/A (use `docs/checklists/policy-impact-release-review.md`)
- [ ] `npm run lint:briefs`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:unit`
- [ ] `npm run build`
- [ ] `npm run test:e2e` (or explain why skipped)
- [ ] `npm run verify:pre-pr`
- [ ] `npm run verify:pre-merge` (must be `PASS` on current HEAD SHA before merge)
- [ ] Local manual QA done on dev URL (list URL + browser/device in PR description)
- [ ] Vercel preview manual QA done (paste preview URL + browser/device in PR description)
- [ ] QA covered relevant matrix for this change (mobile, tablet, desktop browsers)

## UI Evidence

- [ ] Screenshot(s) attached (if UI changed)
- [ ] Mobile behavior checked (if UI changed)

## Checklist

- [ ] Acceptance criteria are met
- [ ] Docs updated for behavior/contract changes
- [ ] Changed task briefs include full 10/10 scorecard mapping (all categories marked target/supporting/N/A)
- [ ] Every `target` scorecard row has measurable threshold + evidence source
- [ ] If claiming `10/10`: critical target categories are listed and each is scored `5/5`
- [ ] PR is <= 500 changed lines, or intentionally split/explained
- [ ] No secrets or sensitive data added

## Owner Merge Step

- Merge from this PR page when checks and QA are complete.
- Direct URL pattern: `https://github.com/stianvikra/freeswimming/pull/<PR_NUMBER>`
- [ ] Required checks are green
- [ ] Local QA + Vercel preview QA are completed
- [ ] `Squash and merge` clicked by repo owner

## Post-Merge Local Sync (owner terminal steps)

- [ ] `git checkout main`
- [ ] `git pull --ff-only origin main`
- [ ] `git branch -d <merged-branch>`
- [ ] Optional: `git fetch --prune`
