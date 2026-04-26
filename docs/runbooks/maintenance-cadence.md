# Maintenance Cadence Runbook

## Purpose

Keep dependency hygiene, runtime pinning, performance budgets, and release-gate evidence on a predictable rhythm instead of relying on memory during feature work.

## Cadence

| Rhythm    | Owner action                                                                 | Evidence location                                                                            |
| --------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Weekly    | Review Dependabot PRs, security alerts, CodeQL, nightly E2E, and audit risk. | GitHub PRs/checks plus active maintenance issue if work is needed.                           |
| Monthly   | Complete one maintenance issue from the monthly reminder workflow.           | GitHub issue created by `.github/workflows/monthly-maintenance-reminder.yml`.                |
| Quarterly | Review deferred majors and decide whether to open fresh planned briefs.      | `docs/task-briefs/planned/2026-04-04-dependency-and-tooling-modernization-backlog-10-10.md`. |

## Monthly Issue Flow

1. Use the auto-created `Monthly maintenance pass - YYYY-MM` issue.
2. If the issue was not created, run `Monthly Maintenance Reminder` manually from GitHub Actions.
3. Work the checklist in `docs/checklists/monthly-maintenance-pass.md`.
4. Open narrow PRs only for concrete changes.
5. Record each PR, decision, and validation result in the monthly issue.
6. Close the issue only after deferrals have owners or planned briefs.

## Triage Rules

- Patch/minor dependency PRs: merge when CI and local release gates are green.
- High/critical production advisories: prioritize immediately, keep the PR narrow, and run `npm audit --omit=dev --audit-level=high`.
- Major dependency changes: do not batch into routine maintenance; open or update a planned brief first.
- Workflow/runtime/tooling changes: full validation lane is required.
- Pure docs/governance updates: docs-only lane is allowed when the verification scripts select it.

## Perf-Budget Ratchet

- Run `npm run test:perf:trend` during monthly maintenance.
- If the recommendation is `tighten`, tighten one metric one step, then run `npm run test:perf:budgets` and the normal release gate.
- If the recommendation is `hold`, record the reason and keep thresholds unchanged.
- If the recommendation is `revert`, stop the maintenance pass and triage the regression before merging unrelated changes.

Current ratchet baseline:

| Date       | Decision  | Metric              | Change             | Rationale                                                                                                                  |
| ---------- | --------- | ------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-26 | `tighten` | JS transfer default | `450kb` -> `425kb` | Multiple green weekly runs kept the worst margin above the tighten threshold; recent route medians remained about `305kb`. |

Do not take another stretch-target step until at least two weekly green runs have accumulated after the latest threshold change.

## Billing Carry-Forward

The Stripe sandbox invoice follow-up is not part of routine maintenance cadence. Before live billing confidence is claimed, create one fresh sandbox purchase after `bd3a9e5` and confirm invoice visibility in Stripe/customer portal evidence, or keep that item explicitly deferred.

## Release Gate

Before opening or updating a maintenance PR:

```bash
npm run verify:pre-pr
```

Before merge:

```bash
npm run verify:pre-merge
```

For local Playwright-heavy gates, use the repo's normal Node runtime from `.nvmrc`. If Next dev-server memory restarts cause `ERR_EMPTY_RESPONSE` flakes, rerun with:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run verify:pre-merge
```
