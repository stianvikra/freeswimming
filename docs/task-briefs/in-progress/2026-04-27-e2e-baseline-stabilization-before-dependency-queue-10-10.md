# Task Brief: E2E Baseline Stabilization Before Dependency Queue (10/10)

## Metadata

- `id`: `2026-04-27-e2e-baseline-stabilization-before-dependency-queue-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Restore a trustworthy local E2E baseline so dependency-maintenance PRs can be evaluated one at a time without unrelated full-lane failures blocking merge readiness.

## Why This Brief Exists

- PR #1 is a narrow CodeQL dependency-maintenance PR with green GitHub CI, but local `npm run verify:pre-merge` exposed unrelated E2E baseline failures.
- The observed blockers were outside the CodeQL diff:
  - `tests/e2e/poolside-save-image-export.spec.ts` mobile PNG export,
  - `tests/e2e/api-security-negative-paths.spec.ts` admin notes/categories negative path,
  - `tests/e2e/my-library-program-export.spec.ts` desktop program export.
- The dependency queue should stay paused until the local baseline is deterministic enough to distinguish real dependency regressions from stale/flaky gate coverage.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `N/A`        | N/A because this stabilizes release-gate tests and does not change product IA or route hierarchy.                             | explicit scope rationale                  | `N/A`                   |
| UX flow clarity                               | `supporting` | Supporting only: export/browser flows must remain user-truthful while test waits become more deterministic.                   | targeted Playwright evidence              | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because no intentional UI, layout, branding, or visual styling changes are in scope.                                      | explicit scope rationale                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Stabilization must not loosen assertions around exported artifacts, unauthorized API behavior, or saved program/session data. | targeted tests + diff review              | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin negative-path tests should stay deterministic without changing admin workflow behavior.                | targeted admin API negative-path run      | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no accessibility surface or semantics are changed.                                                                | explicit scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: test hardening must not add runtime payload or extra route work.                                             | dependency/runtime diff review            | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this brief must not change persistence, local storage, sync, conflict, or cache ownership.                        | explicit no-data-change review            | `N/A`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route-entry and export waits should respect existing cache/readiness behavior.                               | targeted browser test runs                | `4/5`                   |
| Reliability and failure handling              | `target`     | Expected deny/failure paths return deterministic non-sensitive responses; export tests wait for actual ready/download states. | targeted Playwright + route evidence      | `5/5`                   |
| Security and authz                            | `target`     | Negative-path coverage for admin notes/categories remains fail-closed and checks `401`/`403`, not accidental `500`.           | targeted negative-path Playwright run     | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: failure logs and artifacts must not expose secrets, raw env values, or private cross-user data.              | artifact/log review                       | `4/5`                   |
| Content governance                            | `N/A`        | N/A because no content model, source-of-truth, publishing, or revision workflow is changed.                                   | explicit scope rationale                  | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because this does not alter admin CRUD, publishing, labels, or operator actions.                                          | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, or crawl behavior changes.                                                   | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content or structured data changes.                                                     | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: test hardening must not remove existing analytics assertions or event coverage.                              | diff review                               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, billing, entitlement, invoice, or revenue path changes are in scope.                                 | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `target`     | Document the baseline failure pattern and next operational rule for dependency PR timing.                                     | brief checkpoint + final PR summary       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this stabilization does not modify finance reconciliation, payouts, invoices, refunds, or reporting data.         | explicit scope rationale tied to no scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no user-facing copy, locale routing, translation contract, or content model changes are in scope.                 | explicit scope rationale tied to no scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Playwright/test helpers and add no new dependency.                                                               | package diff + code review                | `5/5`                   |
| Testing and QA automation                     | `target`     | Reproduce or explain each observed blocker; targeted tests pass; `npm run verify:pre-pr` passes before PR handoff.            | command logs                              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: avoid broad retries or expensive sleeps that increase full-lane runtime without proving readiness.           | test runtime review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes are small, reversible, and isolated from dependency PR #1 and Dependabot branches.                                    | PR diff + rollback note                   | `5/5`                   |

## Data Placement And Sync Contract

N/A. This brief must not change storage ownership, browser persistence, server-canonical data, sync/conflict behavior, retention, or cache invalidation policy.

## Identity And Rename Contract

N/A. This brief must not change persisted entity IDs, slugs, titles, route params, export identifiers, or operator-visible labels.

## Scope

- Stabilize only the E2E/test or minimal runtime failure handling needed for:
  - poolside PNG export readiness,
  - admin notes/categories unauthorized negative paths,
  - My Library program export readiness.
- Close superseded stale PRs that are already replaced by current `main` so dependency maintenance stays readable.
- Keep PR #1 open and untouched.

## Out Of Scope

- Merging or closing active Dependabot PRs.
- Dependency upgrades.
- UI redesign, route rename, copy cleanup, billing changes, schema migrations, or product behavior changes.
- Broad full-suite rewrites or blanket retries.

## Acceptance Criteria

1. #161 and #334 are closed only if confirmed superseded by current `main`.
2. Observed E2E blockers are reproduced, classified, or fixed with the smallest targeted change.
3. Targeted Playwright runs for changed/affected specs pass locally.
4. `npm run lint:briefs` passes for this brief.
5. `npm run verify:pre-pr` passes before PR creation/update.
6. PR handoff explains how future automatic dependency PRs should be queued and promoted.

## Validation

- `npm run lint:briefs`
- targeted Playwright runs for affected specs
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's existing `nvm` bootstrap.
- Playwright available through the repo dependency stack.

## Manual QA Environments

- N/A for screenshot handoff unless implementation changes visible UI or exported visual output behavior.
- If an export-rendering fix changes actual PNG/PDF output, provide artifact handoff before PR gate.

## Constraints

- Keep changes minimal and evidence-driven.
- Do not merge #1 or any dependency PR in this brief.
- Do not weaken security assertions or hide failures with broad retries.
- Prefer deterministic readiness checks over fixed sleeps.

## Debugging And Handoff Contract

- Follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for export/browser failures.
- If a reusable flake pattern is confirmed, update `docs/runbooks/high-cost-debug-log.md` or explicitly explain why it is not reusable.
- Final handoff must include:
  - closed/superseded PRs,
  - affected tests,
  - validation results,
  - dependency-queue recommendation.

## 10/10 Quality Bar

- The release gate should make dependency PR risk clearer, not noisier.
- Security negative-path tests must continue to prove fail-closed behavior.
- Export tests must validate actual artifact availability/readiness, not only route navigation.
- No new dependencies, secrets, or product scope drift.

## Checkpoint Log

- `2026-04-27 | in-progress | created after PR #1 CodeQL validation showed GitHub CI green but local full-lane E2E blocked by unrelated baseline failures; #161 and #334 are being evaluated for supersede closure before dependency work continues | next: close confirmed superseded PRs, reproduce targeted blockers from main, then patch the smallest deterministic failure mode`
- `2026-04-27 | triage | closed PR #161 as superseded by newer env-parity governance on main and PR #334 as superseded by PR #335 plus later My Library/My Training IA reconciliation; branches were left intact for history | next: validate targeted E2E blockers and update maintenance cadence so stale PRs are caught earlier`
- `2026-04-27 | validation | targeted admin negative-path, poolside PNG export, and program export specs passed individually; combined failure pack also passed with 3 passed / 3 skipped, so no product/test-code patch was made from non-reproduced full-suite failures | next: run docs validation, commit, push, and open a docs/process PR`
