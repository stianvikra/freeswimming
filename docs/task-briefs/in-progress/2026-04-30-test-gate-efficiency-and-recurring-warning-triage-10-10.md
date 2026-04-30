# Task Brief: Test Gate Efficiency And Recurring Warning Triage (10/10)

## Metadata

- `id`: `2026-04-30-test-gate-efficiency-and-recurring-warning-triage-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-30`
- `updated`: `2026-04-30`

## Goal

Reduce wasted local/CI gate time before the next session-builder slice by
classifying the recent full-suite failures and recurring warnings into durable
test-gate guidance, without changing product behavior or weakening coverage.

## Why This Brief Exists

- PR #559 passed targeted builder/generator/poolside checks, then a full
  `verify:pre-pr` run exposed My Library route-readiness and stale test-contract
  failures under full-suite load.
- The same slice later passed full `verify:pre-pr`, full `verify:pre-merge`, and
  CI after targeted harness fixes.
- The repo already has maintenance cadence and hydration-warning policy, but it
  needs a narrow operator runbook for deciding what to run first, what to rerun,
  and what to document when broad gates emit non-failing warnings.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Testing and QA automation`
- `Scalability and cost efficiency`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                   | Evidence                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: release gates become easier to use before feature work without changing product IA.                 | runbook + brief evidence                   | `4/5`                   |
| UX flow clarity                               | `N/A`        | N/A because no user-facing workflow, copy, or interaction changes are in scope.                                      | explicit scope rationale                   | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this is docs/process guidance only; no layout, brand, print, or UI surface changes.                      | explicit scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: guidance must not encourage weakening assertions around saved sessions, exports, or canonical data. | diff review                                | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing surface or admin workflow action changes.                                               | explicit scope rationale                   | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no runtime controls, labels, focus behavior, or semantic HTML changes.                                   | explicit scope rationale                   | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: guidance keeps perf-budget ratchets in maintenance cadence and does not alter runtime budgets here. | testing-strategy/runbook review            | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local/server data ownership, sync, retention, or persistence behavior changes.                        | explicit scope rationale                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache, CDN, revalidation, or freshness contract changes.                                        | explicit scope rationale                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Recent full-gate failures are classified with a deterministic fix/rerun/watch/document/ignore decision model.        | runbook + high-cost debug log              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: guidance preserves fail-closed security tests and does not mark auth failures as benign flakes.     | runbook review                             | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user-data collection, logging, policy, retention, export, or processor behavior changes.              | explicit scope rationale                   | `N/A`                   |
| Content governance                            | `target`     | Reusable gate lessons are placed in the narrow durable docs surface instead of remaining in chat.                    | new runbook + testing-strategy link        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, editorial, publishing, or recovery workflow changes.                                      | explicit scope rationale                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, route, sitemap, robots, or indexing behavior changes.                                | explicit scope rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-readable route changes.                               | explicit scope rationale                   | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: gate evidence remains visible in briefs/PR bodies; no product analytics taxonomy changes.           | PR/brief evidence                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because checkout, entitlements, invoices, billing portal, refunds, and revenue reporting are unchanged.          | explicit commerce scope rationale          | `N/A`                   |
| Incident response and support operations      | `target`     | High-cost debugging log records the reusable full-suite My Library route-readiness pattern and future prevention.    | high-cost-debug-log entry                  | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting mutation, reconciliation, payout, refund, or ledger behavior changes.               | explicit finance/reporting scope rationale | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no user-visible copy, locale routing, translation model, or metadata fallback behavior changes.          | explicit i18n scope rationale              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Stay inside repo-native docs/runbook/test strategy; add no dependency and no toolchain behavior change.              | dependency diff + docs review              | `5/5`                   |
| Testing and QA automation                     | `target`     | Define targeted preflight packs, warning triage rules, and PR-body/gate hygiene before the next implementation PR.   | runbook + docs-only gates                  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Guidance reduces redundant full-gate reruns by running only relevant targeted packs before broad gates.              | runbook order + evidence classification    | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only change is reversible and preserves existing `verify:pre-pr`, `verify:pre-merge`, and CI behavior.          | docs-only diff + local gates               | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - GitHub CI and local release-gate artifacts remain canonical evidence for
    merge readiness.
- Local-only:
  - local `artifacts/test-runs/*` and `artifacts/verify-pre-merge/*` evidence,
  - operator notes in active briefs and PR bodies.
- Sync policy:
  - no new sync channel or artifact retention model.
  - runbook guidance explains how to interpret existing local/CI evidence.

## Identity And Rename Contract

- `N/A`
- Rationale: this docs/process slice changes no persisted domain entity,
  route-param, slug, title, or operator-visible product identifier.

## Scope

- Review recent #559/#560 local gate artifacts and CI state.
- Create a test-gate efficiency and recurring warning triage runbook.
- Link the runbook from the testing strategy.
- Record the reusable full-suite route-readiness pattern in the high-cost debug
  log.
- Keep this PR docs/process-only unless evidence reveals a small deterministic
  harness bug still present on current `main`.

## Out Of Scope

- Product/runtime behavior changes.
- New dependencies or toolchain changes.
- Global Playwright project reordering.
- Weakening or skipping `verify:pre-pr`, `verify:pre-merge`, CI, security tests,
  or hydration warning coverage.
- Perf-budget ratchet changes.

## Acceptance Criteria

1. Recent #559 full-gate failures are classified by cause and follow-up decision.
2. The repo has a durable runbook for targeted preflight packs, warning
   classification, and PR-body/gate hygiene.
3. High-cost debug log records the reusable My Library full-suite
   route-readiness pattern.
4. Testing strategy points operators to the new runbook.
5. `npm run lint:briefs` and `npm run verify:pre-pr` pass before PR handoff.
6. If the final diff remains docs-only, no screenshot handoff is required.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Findings And Decisions

| Signal                                                                                 | Decision   | Rationale                                                                                              | Owner / Next checkpoint                         |
| -------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `20260430-143439` failed My Library route/workout-builder tests under full-suite load. | `document` | Same area passed targeted reruns and later full gates after #559 harness fixes.                        | high-cost debug log + new runbook               |
| Next dev `ECONNRESET`/aborted requests appeared in passing full gates.                 | `watch`    | Non-failing dev-server noise; promote only if it correlates with a test failure.                       | monthly maintenance recurring-warning review    |
| React hydration warnings on builder/poolside surface.                                  | `fix now`  | Fixed in #559 with hydration-console guards; no extra change needed here.                              | covered by #559 done brief                      |
| PR-body required-section failures from earlier flow.                                   | `document` | Already systematized by generated PR body and CI lint; runbook now says refresh body before merge.     | use `npm run gate:pre-merge` or refresh command |
| Perf-budget repeated `tighten` recommendation.                                         | `watch`    | Already governed as `hold` until two new weekly green cycles after the 2026-04-26 ratchet.             | maintenance cadence                             |
| Global Playwright project/test ordering.                                               | `hold`     | Full-gate order should stay canonical; use targeted preflight packs instead of reordering broad gates. | revisit only after repeated same-class failures |

## Checkpoint Log

- `2026-04-30 | in-progress | started after PR #559/#560 closeout to make the learned gate-friction patterns durable before the next session-builder implementation slice | next: add runbook, testing strategy pointer, high-cost debug log entry, then run docs gates`
- `2026-04-30 | in-progress | added test-gate efficiency runbook, testing strategy pointer, and high-cost debug log entry for the My Library full-suite route-readiness pattern | next: run docs-only gates, commit, and open PR`
