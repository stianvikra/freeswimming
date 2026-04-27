# Task Brief: CodeQL Action v4 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-27-codeql-action-v4-dependency-maintenance-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Bring the CodeQL workflow action references from `github/codeql-action@v3` to `@v4` on current `main`, with the narrowest possible dependency-maintenance scope and green local/CI gates.

## Why This Brief Exists

- Several open Dependabot PRs are stale or behind current `main`.
- The lowest-risk first dependency-maintenance slice is CodeQL because it touches one security-analysis workflow and no app runtime code.
- PR `#1` already contains the intended Dependabot update, but it must be rebased onto current `main` and validated before any merge recommendation.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                           | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The dependency-maintenance sequence starts with one clearly scoped, low-risk workflow update before broader package/runtime migrations.  | PR scope + brief rationale           | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice does not change user-facing flows, routes, labels, loading, empty, error, or retry states.                        | explicit scope rationale             | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice does not change UI, layout, branding, print, or visual assets.                                                    | explicit scope rationale             | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no application business logic, data model, persistence, or entitlement behavior changes.                                     | explicit scope rationale             | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow or content operation changes.                                                                       | explicit scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI semantics or interaction behavior changes.                                                                    | explicit scope rationale             | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no app bundle, route payload, CWV budget, or runtime server path changes.                                                    | explicit scope rationale             | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this workflow update introduces no stateful product data boundary or sync behavior.                                          | explicit scope rationale             | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this workflow update does not change runtime reads, caches, revalidation, or artifact cache policy.                          | explicit scope rationale             | `N/A`                   |
| Reliability and failure handling              | `target`     | CodeQL workflow remains runnable on pull requests and scheduled scans after rebasing onto current `main`.                                | CI CodeQL check + local verify gates | `5/5`                   |
| Security and authz                            | `target`     | Static analysis stays enabled with the same least-privilege workflow permissions and `javascript-typescript` language coverage.          | workflow diff + CodeQL CI check      | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: the workflow update must not add new data collection, secrets, logs, or external processors beyond GitHub CodeQL.       | diff review                          | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: the active brief documents why this stale/behind dependency PR is safe to revive after rebase and validation.           | brief + PR handoff                   | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow or operator editing surface changes.                                                           | explicit scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, robots, or crawl behavior changes.                                                        | explicit scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                             | explicit scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                         | explicit scope rationale             | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, portal, refund, or catalog behavior changes.                                              | explicit scope rationale             | `N/A`                   |
| Incident response and support operations      | `target`     | Security scanning remains visible in required PR checks and scheduled CodeQL analysis after the action upgrade.                          | GitHub checks + workflow review      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, revenue reports, payouts, invoices, or finance exports.                           | explicit finance scope rationale     | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice does not alter locale routing, translation content, metadata, or future i18n data models.                         | explicit i18n scope rationale        | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Only `github/codeql-action` references move from `v3` to `v4`; no package dependency, runtime dependency, or workflow redesign is added. | dependency diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed workflow branch passes local `verify:pre-pr`, local `verify:pre-merge`, and GitHub required checks including CodeQL.             | local logs + GitHub checks           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the update preserves one CodeQL matrix job and does not add extra CI jobs or redundant scans.                           | workflow diff                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert from `@v4` back to `@v3`; no migration, secret, or runtime rollout is required.                          | PR diff + rollback note              | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` because this slice does not create, move, persist, cache, sync, or delete product data.
- GitHub Actions artifacts and CodeQL results remain GitHub-hosted CI/security outputs under the existing workflow contract.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Workflow job names remain stable: `CodeQL` / `Analyze`.

## Scope

- Rebase PR `#1` onto current `main`.
- Update `.github/workflows/codeql.yml` CodeQL action references from `@v3` to `@v4`.
- Add this in-progress task brief with scorecard mapping and validation evidence.
- Run local release gates and monitor GitHub checks.

## Out Of Scope

- Merging without explicit owner approval.
- Updating `actions/github-script`, `actions/upload-artifact`, npm packages, TypeScript, ESLint, Tailwind, Stripe SDK, or grouped dependencies.
- Changing CodeQL languages, permissions, schedule, runner, matrix, or build strategy.
- Product UI, runtime API, data model, secrets, policy text, or Help/Guide changes.

## Acceptance Criteria

1. PR `#1` is no longer stale/behind current `main`.
2. The workflow diff is limited to CodeQL action version references plus this governance brief.
3. CodeQL permissions stay `actions: read`, `contents: read`, and `security-events: write`.
4. Local `npm run verify:pre-pr` passes on the updated branch.
5. Local `npm run verify:pre-merge` passes before merge recommendation.
6. GitHub checks for PR `#1`, including CodeQL, are green before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`
- GitHub PR checks:
  - `CodeQL`
  - `Analyze (javascript-typescript)`
  - `verify`
  - smoke/site-lock/preview/size checks as configured for the PR

## Validation Evidence

- `env NODE_OPTIONS=--max-old-space-size=8192 npm run verify:pre-pr`: PASS full lane
  because `.github/workflows/codeql.yml` is a `full-only` path. Artifact:
  `artifacts/test-runs/20260427-081516`; Playwright result `112` passed /
  `344` skipped.
- `env NODE_OPTIONS=--max-old-space-size=8192 npm run verify:pre-merge`: PASS.
  Marker: `artifacts/verify-pre-merge/20260427-063511.json`.
- GitHub CI for PR #1: PASS for `verify` (12m58s), `CodeQL`, `Analyze
(javascript-typescript)`, `e2e-smoke`, `site-lock-smoke`, `size-check`,
  `deploy-preview`, Vercel, and Vercel Preview Comments.
- Screenshot handoff: N/A because this changed only CI workflow configuration and
  governance docs.
- Perf-budget note: local full gate again recommended tightening one stretch target
  after consecutive green runs. That remains a carry-forward item for the
  maintenance-baseline/perf-budget slice, not a CodeQL dependency change.

## Implementation Notes

- Selected PR `#1` first because it is the narrowest open dependency-maintenance PR:
  one workflow file, no runtime package lock churn, and no app code.
- Verified GitHub release source through `gh api repos/github/codeql-action/releases/latest`
  before execution; current public CodeQL bundle is available under the CodeQL action release stream.
- Rebased the Dependabot branch onto `main` at `7108421` on `2026-04-27` after PR #526.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, or browser runtime behavior.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Closeout Summary

- Shipped via PR #1 and merged to `main` as `3d3c64f`.
- Updated the CodeQL workflow action references for `init`, `autobuild`, and
  `analyze` from `github/codeql-action@v3` to `@v4`.
- Kept workflow permissions, language matrix, schedule, runner, and app runtime
  behavior unchanged.
- Rebased the stale Dependabot branch onto current `main` after PR #526, refreshed
  local/full CI evidence, resolved the branch-policy review block through owner
  approval, and merged only after green GitHub CI.
- No UI, product runtime, schema, package dependency, billing, analytics, Help/Guide,
  or policy behavior changed.

## Closeout Scores

- `Product goals and IA`: `5/5`.
- `Reliability and failure handling`: `5/5`.
- `Security and authz`: `5/5`.
- `Incident response and support operations`: `5/5`.
- `Stack-fit and dependency discipline`: `5/5`.
- `Testing and QA automation`: `5/5`.
- `DevOps and rollback readiness`: `5/5`.
- 10/10 claim: all critical target categories are `5/5`.

## Checkpoint Log

- `2026-04-27 | in-progress | selected PR #1 as the first dependency-maintenance slice because it is a one-file CodeQL workflow update; rebased branch onto current main after PR #524 | next: add brief, run local gates, push, monitor PR checks`
- `2026-04-27 | in-progress | npm run lint:briefs:all passed all 196 brief files and env NODE_OPTIONS=--max-old-space-size=8192 npm run verify:pre-pr passed full lane with 113 E2E passed and 343 expected skips | next: commit, force-push rebased PR branch, monitor CI, run pre-merge gate`
- `2026-04-27 | in-progress | resumed after PR #526, rebased PR #1 branch onto main 7108421, and marked earlier local validation as superseded | next: commit the refreshed checkpoint, run current full pre-PR gate, then force-push the updated Dependabot branch`
- `2026-04-27 | done | PR #1 merged as 3d3c64f after green local full gates, green GitHub CI, and owner-approved review; lifecycle closeout moved this brief to done | next: continue controlled dependency-maintenance promotion one PR at a time`
