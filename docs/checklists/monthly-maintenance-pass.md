# Monthly Maintenance Pass Checklist

Use this checklist for the monthly issue created by `.github/workflows/monthly-maintenance-reminder.yml`.

## Scope

- Month: `YYYY-MM`
- Owner:
- Related PRs:
- Final result: `pass` / `deferred` / `blocked`

## Preflight

- [ ] Confirm local `main` is clean and up to date.
- [ ] Review open Dependabot PRs and group by patch/minor/major.
- [ ] Review GitHub security alerts, CodeQL status, nightly E2E, and admin E2E status.
- [ ] Run or review `npm audit --omit=dev --audit-level=high`.

## Runtime And Tooling

- [ ] Confirm `.nvmrc`, `package.json` `engines.node`, and `packageManager` still match the intended runtime contract.
- [ ] Confirm GitHub Actions still use `node-version-file: .nvmrc`.
- [ ] Document any required runtime/tooling change as its own PR.

## Performance Budget Ratchet

- [ ] Run `npm run test:perf:trend`.
- [ ] Record recommendation: `tighten` / `hold` / `revert`.
- [ ] If `tighten`, adjust one metric one step only and run `npm run test:perf:budgets`.
- [ ] If `hold` or `revert`, record rationale and owner.

## Dependency Hygiene

- [ ] Patch/minor updates are merged only after required gates are green.
- [ ] Major updates are deferred to planned briefs unless explicitly approved as the monthly slice.
- [ ] High/critical production advisories are prioritized before routine cleanup.

## Billing Carry-Forward

- [ ] If checkout, portal, webhook, or finance reconciliation changed this month, repeat the fresh Stripe sandbox purchase invoice-visibility check.
- [ ] If not in scope, record the deferral and do not claim live billing confidence.

## Closeout

- [ ] Each merged PR has a rollback note.
- [ ] `npm run verify:pre-pr` evidence is recorded for implementation PRs.
- [ ] `npm run verify:pre-merge` evidence is recorded before merge.
- [ ] Deferred items have an owner, planned brief, or explicit next monthly checkpoint.
