# Task Brief: Performance Governance JS Transfer Ratchet (10/10)

## Metadata

- `id`: `2026-05-04-performance-governance-js-transfer-ratchet-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-04`
- `updated`: `2026-05-04`

## Goal

Tighten the core-route JS transfer budget one conservative stretch step after repeated green performance trend evidence, while keeping the performance governance trail auditable and reversible.

## Why This Brief Exists

- `npm run test:perf:trend` on `2026-05-04` recommends `tighten` for the public profile.
- Current trend evidence shows `4` consecutive weekly green runs with `25.1%` worst margin against the existing `425kb` JS transfer budget.
- The `2026-04-29` maintenance audit held the previous recommendation because the `2026-04-26` ratchet was too recent; that hold condition has now been satisfied by additional green weekly cycles.
- This brief keeps the ratchet out of unrelated feature work and records the decision in the canonical performance governance docs.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Performance (CWV + payloads)`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                      | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One clear governance outcome exists: public core-route JS transfer default moves from `425kb` to `400kb` with no product IA change.                                 | brief scope + docs diff                                                   | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice does not change user workflows, states, labels, or navigation.                                                                               | explicit non-UI scope rationale                                           | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice does not change UI, layout, print, export, or brand rendering.                                                                               | explicit non-visual scope rationale                                       | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: performance script behavior should continue to measure the same core routes and metrics, with only the JS transfer threshold changing.             | diff review + perf budget output                                          | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not touch admin editing surfaces or workflows.                                                                                          | explicit scope rationale                                                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice does not change rendered UI or accessibility semantics.                                                                                      | explicit non-UI scope rationale                                           | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | `npm run test:perf:budgets` passes with JS transfer default `400kb` for `/`, `/plans`, `/course`, and `/my-library`; trend decision is recorded as `tighten`.       | `npm run test:perf:trend` + `npm run test:perf:budgets` + `verify:pre-pr` | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product state, persistence, sync, or local/server data ownership changes.                                                                            | explicit stateless governance-slice rationale                             | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation trigger, or data freshness behavior changes.                                                                          | explicit scope rationale                                                  | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: the perf gate should fail clearly if any core route exceeds the tightened threshold.                                                               | perf budget failure contract remains unchanged + targeted run             | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, RBAC, protected route, input validation, or secret-handling behavior changes.                                                                  | explicit security scope rationale                                         | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data collection, retention, logs, consent, or compliance copy changes.                                                                      | explicit privacy scope rationale                                          | `N/A`                   |
| Content governance                            | `target`     | Canonical performance docs and maintenance scorecard references all state the current `400kb` JS transfer default and `2026-05-04 tighten` decision.                | docs/runbooks + testing docs + brief checkpoint                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow or editability surface changes.                                                                                           | explicit admin scope rationale                                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonicals, or public semantic structure changes.                                                                   | explicit SEO scope rationale                                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public page content model, structured data, or crawl-safe semantic route behavior changes.                                                           | explicit AI-discoverability scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI logging, persistence, or event payload changes.                                                                        | explicit analytics scope rationale                                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, billing, refund, or revenue operation changes.                                                                       | explicit commerce scope rationale                                         | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this performance governance slice updates validation thresholds/docs only and does not change support recovery paths, alerts, or incident ownership.    | explicit support/incident scope rationale                                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, invoice, entitlement-reporting, or revenue data behavior changes.                                                   | explicit finance scope rationale                                          | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, metadata localization, or user-facing copy contract changes.                                                      | explicit i18n scope rationale                                             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use the existing Next/Playwright performance budget script and repo docs; add no dependency and do not introduce a new measurement system.                          | script diff + package diff review                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted perf trend/budget checks pass, changed brief passes lint, and the branch passes `npm run verify:pre-pr`; before merge, `npm run verify:pre-merge` passes.  | command logs + CI green                                                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | The tighter JS payload gate preserves at least `15%` headroom on the latest public profile and helps catch future bundle growth before user-visible route slowdown. | trend margin + fresh perf budget report                                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The change is one reversible threshold step (`400kb` back to `425kb`) plus docs updates; no migration or deployment choreography is required.                       | reversible diff + rollback note + `verify:pre-pr`                         | `5/5`                   |

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

## Data Placement And Sync Contract

`N/A` because this slice is stateless governance/tooling work. It does not create or modify server-canonical entities, local browser storage, sync triggers, retention rules, cache invalidation, or sensitive data handling.

## Identity And Rename Contract

`N/A` because this slice does not create, rename, repurpose, or route any persisted product entity, slug, title, route param, import/export identifier, or operator-visible identifier.

## Scope

- Tighten default JS transfer budget in `scripts/run-perf-budget-check.mjs` from `425kb` to `400kb`.
- Replace stale `AW-010` action wording in the perf-budget recommendation output with active-brief wording.
- Update canonical performance governance docs:
  - `docs/runbooks/pagespeed-lighthouse-gated-governance.md`
  - `docs/runbooks/maintenance-cadence.md`
  - `docs/testing-strategy.md`
  - `docs/testing-coverage-scorecard.md`
- Record trend rationale and validation checkpoints in this brief.

## Out Of Scope

- Changing LCP, CLS, TBT, CSS transfer, or request-count budgets.
- Changing measured routes or perf collection logic.
- Adding Lighthouse/PageSpeed tooling or new dependencies.
- UI, route, Help/Guide, support workflow, analytics, commerce, auth, data, or i18n changes.
- Merging without explicit owner approval.

## Acceptance Criteria

1. JS transfer default threshold is `400kb`.
2. `npm run test:perf:budgets` passes on the current branch with the tightened default.
3. Governance docs consistently describe the latest `2026-05-04 tighten` decision.
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
- Keep rollback simple: revert `400kb` to `425kb` and update the ratchet notes if fresh evidence contradicts the tighten.

## Help/Guide And Operator Training Contract

`N/A` because no admin/user workflow labels, actions, recovery behavior, Help/Guide content, or support-surface behavior changes. Maintenance/performance runbooks are updated because they are the canonical owner docs for this threshold.

## Security, Privacy, And Compliance

- No secrets, tokens, credentials, auth paths, data retention, privacy copy, or compliance behavior changes.
- Perf artifacts must not include bypass tokens; this slice uses the public profile by default.

## 10/10 Quality Bar

- The threshold should be tight enough to catch future JS payload drift but still leave the latest public-profile route measurements with meaningful margin.
- Evidence must be SHA-bound through normal perf/verify artifacts, not only copied from older trend history.
- The docs must make the current default and latest tighten/hold/revert decision unambiguous.
- Rollback must be a single-threshold reversal with no migration or cleanup burden.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth
  - Canonical performance runbook and maintenance cadence docs own the budget and ratchet history.
- Identity and rename safety
  - `N/A`; no persisted identifiers or route params change.
- Taxonomy and category management
  - `N/A`; no product taxonomy changes.
- Workflow and publishing safety
  - Existing release gates remain the publishing safety path.
- Business logic correctness and data integrity
  - Perf runner keeps the same route/metric semantics; only the JS threshold changes.
- RBAC and auditability
  - `N/A`; no auth or admin mutation surface changes.
- UX/UI quality contract
  - `N/A`; no rendered UI changes.
- Admin editor ergonomics
  - `N/A`; no admin editor changes.
- Performance contract
  - `/`, `/plans`, `/course`, and `/my-library` must pass JS transfer `<= 400kb` plus existing LCP/CLS/TBT/CSS/request budgets.
- Data placement and sync boundaries
  - `N/A`; no stateful product data changes.
- Caching and invalidation strategy
  - `N/A`; no cache behavior changes.
- Testing contract
  - Targeted perf checks plus full verify gates.
- Observability and KPI tracking
  - Perf trend log remains the operational evidence trail; no product analytics change.
- Incident response and support operations
  - `N/A`; no incident/support workflow changes.
- Finance and reporting operations
  - `N/A`; no finance/reporting behavior changes.
- i18n operational readiness
  - `N/A`; no locale/content model changes.
- Stack-fit and dependency discipline
  - Existing scripts/docs only; no dependencies.
- Scalability and cost efficiency
  - Lower JS budget reduces future payload drift risk.
- Migration and rollback readiness
  - One reversible config constant plus docs.
- Definition of done quant targets
  - JS transfer default `400kb`, fresh perf budget PASS, full pre-PR and pre-merge gates PASS.
- Help/Guide and operator training documentation
  - `N/A`; canonical maintenance/performance runbooks updated instead.

## Checkpoint Log

- `2026-05-04 | in-progress | started performance-governance ratchet from clean main 19175a2 after post-merge preflight; trend recommendation was tighten with 4 weekly green runs and 25.1% worst margin | next: tighten JS transfer default to 400kb, update governance docs, and run targeted perf validation`
- `2026-05-04 | in-progress | tightened JS transfer default to 400kb, refreshed governance docs, and ran targeted validation: npm run lint:quality-gates PASS, npm run lint:briefs:all PASS, npm run test:perf:trend recommended tighten, npm run test:perf:budgets PASS with worst margin 20.4% and route JS medians / 318.4kb, /plans 270.3kb, /course 297.3kb, /my-library 269.4kb | next: rerun targeted lint after final script wording polish, then npm run verify:pre-pr`
- `2026-05-04 | in-progress | npm run verify:pre-pr PASS on full lane for commit aea7610: branch-current, lint:briefs, lint:quality-gates, admin/env/PR-body lint, lint, typecheck, 168 unit files / 879 tests, build, perf budgets with JS transfer 400kb and 20.4% worst margin, and Playwright 107 passed / 349 skipped | next: amend checkpoint, rerun verify:pre-pr on final commit, push, and open PR`
