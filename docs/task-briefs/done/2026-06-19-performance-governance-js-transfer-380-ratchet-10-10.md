# Task Brief: Performance Governance JS Transfer 380 Ratchet (10/10)

## Metadata

- `id`: `2026-06-19-performance-governance-js-transfer-380-ratchet-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `mode`: `maintenance implementation`

## Goal

Tighten the core-route JS transfer budget one conservative stretch step after repeated green performance trend evidence, while preserving measurable headroom and a simple rollback path.

## Why This Brief Exists

- `npm run test:perf:trend` on `2026-06-19` recommends `tighten` for the public profile.
- Current local trend evidence shows `10` consecutive weekly green runs with `17.8%` worst margin against the existing `390kb` JS transfer budget.
- The previous ratchet was `2026-05-14`, so the "wait for two new weekly green runs" hold condition is satisfied.
- Owner approved the recommended scope on `2026-06-19`: implement JS transfer `390kb` -> `380kb`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Performance (CWV + payloads)`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One clear governance outcome exists: public core-route JS transfer default moves from `390kb` to `380kb` with no product IA change.                                | brief scope + docs diff                                                   | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice does not change user workflows, states, labels, or navigation.                                                                              | explicit non-UI scope rationale                                           | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice does not change UI, layout, print, export, or brand rendering.                                                                              | explicit non-visual scope rationale                                       | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: performance script behavior should continue to measure the same core routes and metrics, with only the JS transfer threshold changing.            | diff review + perf budget output                                          | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not touch admin editing surfaces or workflows.                                                                                         | explicit scope rationale                                                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice does not change rendered UI or accessibility semantics.                                                                                     | explicit non-UI scope rationale                                           | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | `npm run test:perf:budgets` passes with JS transfer default `380kb` for `/`, `/plans`, `/course`, and `/my-library`; trend decision is recorded as `tighten`.      | `npm run test:perf:trend` + `npm run test:perf:budgets` + `verify:pre-pr` | `5/5`                   |
| Performance                                   | `target`     | Alias for the canonical `Performance (CWV + payloads)` target so closeout lint can bind the critical-category shorthand to the same evidence.                      | same as `Performance (CWV + payloads)`                                    | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product state, persistence, sync, or local/server data ownership changes.                                                                           | explicit stateless governance-slice rationale                             | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation trigger, or data freshness behavior changes.                                                                         | explicit scope rationale                                                  | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: the perf gate should fail clearly if any core route exceeds the tightened threshold.                                                              | perf budget failure contract remains unchanged + targeted run             | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, RBAC, protected route, input validation, or secret-handling behavior changes.                                                                 | explicit security scope rationale                                         | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data collection, retention, logs, consent, or compliance copy changes.                                                                     | explicit privacy scope rationale                                          | `N/A`                   |
| Content governance                            | `target`     | Canonical performance docs and this brief state the current `380kb` JS transfer default and the latest `2026-06-19` ratchet decision.                              | docs/runbooks + testing docs + brief checkpoint                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow or editability surface changes.                                                                                          | explicit admin scope rationale                                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonicals, or public semantic structure changes.                                                                  | explicit SEO scope rationale                                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public page content model, structured data, or crawl-safe semantic route behavior changes.                                                          | explicit AI-discoverability scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI logging, persistence, or event payload changes.                                                                       | explicit analytics scope rationale                                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, billing, refund, or revenue operation changes.                                                                      | explicit commerce scope rationale                                         | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this performance governance slice updates validation thresholds/docs only and does not change support recovery paths, alerts, or incident ownership.   | explicit support/incident scope rationale                                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, invoice, entitlement-reporting, or revenue data behavior changes.                                                  | explicit finance scope rationale                                          | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, metadata localization, or user-facing copy contract changes.                                                     | explicit i18n scope rationale                                             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use the existing Next/Playwright performance budget script and repo docs; add no dependency and do not introduce a new measurement system.                         | script diff + package diff review                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted perf trend/budget checks pass, changed brief passes lint, and the branch passes `npm run verify:pre-pr`; before merge, `npm run verify:pre-merge` passes. | command logs + CI green                                                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | The tighter JS payload gate preserves at least `15%` practical headroom on the latest public profile and catches future bundle growth before route slowdown.       | trend margin + fresh perf budget report                                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The change is one reversible threshold step (`380kb` back to `390kb`) plus docs updates; no migration or deployment choreography is required.                      | reversible diff + rollback note + `verify:pre-pr`                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no component, route, metadata, server/client boundary, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - no domain model changes; the existing JavaScript perf-budget runner remains the reference implementation.
- Supabase/data layer:
  - `N/A`; no schema, RLS, generated type, auth, or data access changes.
- External services/tools:
  - no new external services or SDKs; use the existing Playwright/Next production-start perf script.
- UI system:
  - `N/A`; no UI primitives, visual states, responsive behavior, or screenshot handoff required.
- Testing:
  - use the existing script tests/gates: `npm run test:perf:trend`, `npm run test:perf:budgets`, `npm run lint:briefs`, `npm run lint:quality-gates`, `npm run verify:pre-pr`, and `npm run verify:pre-merge`.

## Quality-Gate Evidence Contract

- Triggered classes expected:
  - `performance_cost`: performance budget and payload evidence must be explicit.
  - `devops_tooling`: tooling validation, `verify:pre-pr`, and reversible rollback/devops evidence must be explicit.
  - `docs_governance`: content governance and testing evidence must be explicit.
  - `route_label_support`: this is a runbook/docs update only; route-label-support-surface-impact-sweep is `N/A` because no route, label, Help/Guide surface, recovery path, or support action is removed, renamed, or consolidated.
- Required evidence language:
  - performance budget and cost/scale evidence,
  - targeted tests and script tests,
  - rollback/devops reversible threshold step,
  - Help/Guide and support surface `N/A` rationale.
- Route/label/support sweep evidence:
  - identifiers searched: `JS transfer`, `390kb`, `380kb`, `Current Budget Defaults`, `Current ratchet`, `Latest ratchet decision`.
  - surfaces checked: `scripts/run-perf-budget-check.mjs`, `docs/runbooks/pagespeed-lighthouse-gated-governance.md`, `docs/runbooks/maintenance-cadence.md`, `docs/testing-strategy.md`, `docs/testing-coverage-scorecard.md`, and this brief.
  - fallout handled: no route, user/admin label, Help/Guide content, recovery path, or operator support action changes are in scope.

## Data Placement And Sync Contract

`N/A` because this slice is stateless governance/tooling work. It does not create or modify server-canonical entities, local browser storage, sync triggers, retention rules, cache invalidation, or sensitive data handling.

## Identity And Rename Contract

`N/A` because this slice does not create, rename, repurpose, or route any persisted product entity, slug, title, route param, import/export identifier, or operator-visible identifier.

## Forward Compatibility Contract

- Future bundle growth is data-independent and should be caught automatically by the existing route-level perf budget gate.
- New measured routes, metrics, profiles, or compression/CDN verification require an explicit mapping/update in the perf runbook and scripts.
- Unknown future route behavior fails through the existing budget gate rather than being silently accepted.
- Evidence: fresh `npm run test:perf:budgets` and release gates must pass with the tightened threshold.

## Scope

- Tighten default JS transfer budget in `scripts/run-perf-budget-check.mjs` from `390kb` to `380kb`.
- Update canonical performance governance docs:
  - `docs/runbooks/pagespeed-lighthouse-gated-governance.md`
  - `docs/runbooks/maintenance-cadence.md`
  - `docs/testing-strategy.md`
  - `docs/testing-coverage-scorecard.md`
- Record trend rationale and validation checkpoints in this brief.

## Out Of Scope

- Changing LCP, CLS, TBT, CSS transfer, or request-count budgets.
- Changing measured routes or perf collection logic.
- Adding compression/CDN header checks, Lighthouse/PageSpeed tooling, bundle analyzers, or new dependencies.
- Optimizing or splitting existing JavaScript bundles.
- UI, route, Help/Guide, support workflow, analytics, commerce, auth, data, or i18n changes.
- Merging without explicit owner approval.

## Acceptance Criteria

1. JS transfer default threshold is `380kb`.
2. `npm run test:perf:budgets` passes on the current branch with the tightened default.
3. Governance docs consistently describe the latest `2026-06-19 tighten` decision.
4. Changed brief passes scorecard lint and quality-gate evidence checks.
5. `npm run verify:pre-pr` passes before PR update/push.
6. Required CI checks are green and `npm run verify:pre-merge` passes before merge-readiness handoff.

## Validation

- `npm run test:perf:trend`
- `npm run test:perf:budgets`
- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

- `N/A`; no UI, browser workflow, deployment behavior, install flow, print/export rendering, or visible route behavior changes.
- No screenshot handoff required because this is a script/docs governance slice.

## Constraints

- Keep the ratchet to one metric and one conservative step only.
- Do not weaken or bypass perf gates to make the new threshold pass.
- Do not change trend history artifacts by hand.
- Keep rollback simple: revert `380kb` to `390kb` and update the ratchet notes if fresh evidence contradicts the tighten.
- Do not touch `Ja.docx`.

## Help/Guide And Operator Training Contract

`N/A` because no admin/user workflow labels, actions, recovery behavior, Help/Guide content, or support-surface behavior changes. Maintenance/performance runbooks are updated because they are the canonical owner docs for this threshold.

## Security, Privacy, And Compliance

- No secrets, tokens, credentials, auth paths, data retention, privacy copy, or compliance behavior changes.
- Perf artifacts must not include bypass tokens; this slice uses the public profile by default.

## Observability And KPI Contract

- Existing perf-budget trend log remains the operational evidence trail.
- No product analytics, KPI event taxonomy, dashboards, or persistence behavior changes.

## Session Continuity And Recovery

- Canonical source of truth: branch `chore/performance-budget-js-transfer-380-2026-06-19` and this brief.
- Checkpoint cadence: commit after scoped implementation and validation.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Automation-first after owner approved scope:
  - implement the approved threshold/docs changes,
  - run targeted validation,
  - run `npm run verify:pre-pr`,
  - commit, push, open/update PR,
  - monitor CI,
  - run `npm run verify:pre-merge`,
  - summarize merge readiness.
- No merge without explicit owner approval.

## 10/10 Quality Bar

- The threshold must be tight enough to catch future JS payload drift but still leave the latest public-profile route measurements with meaningful margin.
- Evidence must be SHA-bound through normal perf/verify artifacts, not only copied from older trend history.
- The docs must make the current default and latest tighten/hold/revert decision unambiguous.
- Rollback must be a single-threshold reversal with no migration or cleanup burden.

## Checkpoint Log

- `2026-06-19 | in-progress` - owner approved execution of the planned performance-budget ratchet; branch created from clean `main` at `4ba926a7`; implementation sets JS transfer default `390kb` -> `380kb` and updates canonical perf-governance docs; next: run targeted validation and `npm run verify:pre-pr`.
- `2026-06-19 | targeted validation` - `npm run test:perf:trend` PASS/recommended `tighten` with `10` weekly green runs and `17.8%` worst margin; `npm run lint:quality-gates` PASS; `npm run lint:briefs:all` PASS including this new brief; safe dummy-Supabase `npm run build` PASS; safe dummy-Supabase `npm run test:perf:budgets` PASS with JS medians `/` `282.0kb`, `/plans` `283.7kb`, `/course` `320.5kb`, `/my-library` `281.6kb`, worst margin `15.7%` under the new `380kb` threshold; next: run `npm run verify:pre-pr`.
- `2026-06-19 | pre-pr gate` - safe dummy-Supabase `npm run verify:pre-pr` PASS full lane from `origin/main@4ba926a7`; evidence log `artifacts/test-runs/20260619-071441/verify.log`; included branch-current, migration drift skip, quality gates, admin/env/pr-body lint, ESLint with existing output-script warnings only, typecheck, `249` unit files / `1625` tests, build, perf budgets with `/course` JS `320.5kb` and worst margin `15.7%`, and Playwright E2E `111` passed / `567` skipped in local public dummy-env; next: commit, push, open PR, monitor CI, then run `npm run verify:pre-merge`.
- `2026-06-19 | merged` - PR #1169 merged to `main` as squash commit `f66c3339b18b330843cf71df9aa393a5ee9ef75c`; CI PASS for `verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, Vercel, Vercel Preview Comments, deploy-preview, and size-check; safe dummy-Supabase `npm run verify:pre-merge` PASS full lane with branch-current, full verification, perf budgets at `380kb`, and Playwright E2E `111` passed / `567` skipped; post-merge preflight requested docs-only closeout only.

## Completion Record

- `completed`: `2026-06-19`
- `merged_pr`: `#1169`
- `squash_commit`: `f66c3339b18b330843cf71df9aa393a5ee9ef75c`
- `result`: Closed Performance Governance JS Transfer 380 Ratchet. The default public core-route JS transfer budget now fails at `380kb` instead of `390kb`, with governance docs aligned to the `2026-06-19` tighten decision.
- `validation`: `npm run test:perf:trend` PASS; safe dummy-Supabase `npm run test:perf:budgets` PASS with `/course` JS `320.5kb` and worst margin `15.7%`; `npm run lint:briefs:all` PASS; `npm run verify:pre-pr` PASS full lane; PR #1169 CI PASS; safe dummy-Supabase `npm run verify:pre-merge` PASS full lane.
- `10/10 claim`: yes - all critical target categories reached `5/5` within the scoped performance-governance slice.

| Category                            | Achieved Score | Evidence                                                                                                                                      | Gaps / Notes                                  |
| ----------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Product goals and IA                | `5/5`          | One scoped governance outcome shipped: JS transfer default `390kb` -> `380kb`; no IA or workflow change.                                      | No gap.                                       |
| Performance (CWV + payloads)        | `5/5`          | `npm run test:perf:budgets` PASS at `380kb`; route medians stayed below threshold with worst margin `15.7%`.                                  | No gap; wait for two new weekly green cycles. |
| Performance                         | `5/5`          | Alias row for the critical-category parser; same evidence as `Performance (CWV + payloads)`.                                                  | No gap.                                       |
| Content governance                  | `5/5`          | Performance runbook, maintenance cadence, testing strategy, testing coverage scorecard, and this closeout record state the new budget.        | No gap.                                       |
| Stack-fit and dependency discipline | `5/5`          | Existing perf-budget script and docs were reused; no new dependency, route, runtime system, or measurement framework added.                   | No gap.                                       |
| Testing and QA automation           | `5/5`          | `lint:briefs:all`, `verify:pre-pr`, PR #1169 CI, and `verify:pre-merge` all passed.                                                           | No gap.                                       |
| Scalability and cost efficiency     | `5/5`          | The tighter threshold catches future JS growth earlier while preserving the documented `15%` practical headroom rule on latest route metrics. | No gap.                                       |
| DevOps and rollback readiness       | `5/5`          | Rollback remains a one-line threshold reversal from `380kb` to `390kb` plus docs note; no migration, data cleanup, or release choreography.   | No gap.                                       |
