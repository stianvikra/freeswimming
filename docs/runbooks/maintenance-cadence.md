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

## Continuous Learning Loop

Maintenance is also where repo lessons become durable process improvements. When a PR, CI run, screenshot handoff, support incident, or release gate exposes a repeatable pattern, record it in the narrowest durable place instead of relying on chat memory:

- update the active brief checkpoint or PR body for one-off evidence and explicit `tighten` / `hold` / `revert` decisions,
- update this runbook or the monthly checklist for recurring maintenance workflow changes,
- update testing, architecture, security, billing, or UI-debug runbooks when the lesson belongs to a specific operating surface,
- open a planned brief when the lesson requires product, architecture, or toolchain work that should not be bundled into the current PR.

Keep the change small and place it where the next operator will naturally look before repeating the same work.

## Triage Rules

- Patch/minor dependency PRs: merge when CI and local release gates are green.
- High/critical production advisories: prioritize immediately, keep the PR narrow, and run `npm audit --omit=dev --audit-level=high`.
- Major dependency changes: do not batch into routine maintenance; open or update a planned brief first.
- Workflow/runtime/tooling changes: full validation lane is required.
- Pure docs/governance updates: docs-only lane is allowed when the verification scripts select it.

## Dependency PR Promotion Gate

Use this order before merging routine dependency PRs:

1. Start from a clean, up-to-date `main`.
2. Review open PRs and classify each as:
   - `auto-dependency`: Dependabot or another trusted automation,
   - `human/agent`: owner or agent-created feature/docs work,
   - `superseded`: replaced by newer merged work,
   - `dirty/stale`: cannot be rebased or merged without product review.
3. Close `superseded` PRs with a comment that names the replacing PR, brief, or current `main` evidence. Do not delete branches unless the owner explicitly asks.
4. Hold `dirty/stale` human or agent PRs out of dependency maintenance. Either close as superseded or reopen as a fresh named brief.
5. Promote only one dependency PR at a time:
   - rebase onto current `main`,
   - confirm the PR body/gate evidence is current,
   - run the local release gate before merge recommendation.
6. If local full-lane E2E fails on unrelated tests:
   - keep the dependency PR open,
   - run the failing specs as a targeted baseline pack from `main`,
   - fix or document the baseline blocker before promoting the next dependency PR.

Dependabot PRs are created automatically. They should be treated as a queue of proposals, not as merge-ready work. The right time to promote them is during weekly/monthly maintenance after the baseline gates are green, or immediately for high/critical production security advisories.

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

The Stripe sandbox invoice follow-up is not part of routine maintenance cadence. It was resolved on `2026-04-26` with one fresh post-`bd3a9e5` sandbox purchase that confirmed invoice-backed Checkout, finance reconciliation, and Billing Portal invoice-history evidence. Repeat this check before live billing confidence only if the checkout, portal, webhook, or finance reconciliation contract changes.

## Release Gate

Before opening or updating a maintenance PR:

```bash
npm run verify:pre-pr
```

Before merge:

```bash
npm run verify:pre-merge
```

For local Playwright-heavy gates, use the repo's normal Node runtime from `.nvmrc`. Playwright's managed Next devserver defaults to `8192` MB through `playwright.config.ts` after the Tailwind 4 migration. If a local machine needs a different ceiling, override it with:

```bash
PW_NEXT_DEV_MAX_OLD_SPACE_SIZE_MB=8192 npm run verify:pre-merge
```
