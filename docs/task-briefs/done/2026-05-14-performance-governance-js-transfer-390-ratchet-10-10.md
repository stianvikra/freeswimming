# Task Brief: Performance Governance JS Transfer 390 Ratchet (10/10)

## Metadata

- `id`: `2026-05-14-performance-governance-js-transfer-390-ratchet-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-14`
- `updated`: `2026-05-14`
- `mode`: `post-merge closeout`

## Goal

Tighten the core-route JS transfer budget one conservative stretch step after repeated green performance trend evidence, while preserving measurable headroom and an auditable rollback path.

## Why This Brief Exists

- `npm run test:perf:trend` on `2026-05-14` reports `tighten` for the public profile.
- Current local trend evidence shows `5` consecutive weekly green runs with `19.6%` worst margin against the existing `400kb` JS transfer budget.
- The latest ratchet was `2026-05-04`, so the "wait for two new weekly green runs" hold condition is now satisfied by the trend output.
- A repeated `25kb` step from `400kb` to `375kb` is not recommended because the latest home-route JS transfer margin would likely fall below the repo's `15%` tighten-headroom rule.
- Owner approved the recommended scope on `2026-05-14`: implement JS transfer `400kb -> 390kb`.

## Approved Scope

Implementation scope:

- Tighten default JS transfer budget in `scripts/run-perf-budget-check.mjs` from `400kb` to `390kb`.
- Update canonical performance governance docs:
  - `docs/runbooks/pagespeed-lighthouse-gated-governance.md`
  - `docs/runbooks/maintenance-cadence.md`
  - `docs/testing-strategy.md`
  - `docs/testing-coverage-scorecard.md`
- Record the `2026-05-14` trend result and final tighten/hold/revert decision in this brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Performance (CWV + payloads)`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                        | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One clear governance outcome exists: public core-route JS transfer default either moves from `400kb` to `390kb` or an explicit `hold` decision is recorded with no product IA change. | brief scope + docs diff                                                   | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice does not change user workflows, states, labels, or navigation.                                                                                                 | explicit non-UI scope rationale                                           | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice does not change UI, layout, print, export, or brand rendering.                                                                                                 | explicit non-visual scope rationale                                       | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: performance script behavior should continue to measure the same core routes and metrics, with only the JS transfer threshold changing if approved.                   | diff review + perf budget output                                          | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not touch admin editing surfaces or workflows.                                                                                                            | explicit scope rationale                                                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice does not change rendered UI or accessibility semantics.                                                                                                        | explicit non-UI scope rationale                                           | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | If approved, `npm run test:perf:budgets` passes with JS transfer default `390kb` for `/`, `/plans`, `/course`, and `/my-library`; final decision is recorded as `tighten` or `hold`.  | `npm run test:perf:trend` + `npm run test:perf:budgets` + `verify:pre-pr` | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product state, persistence, sync, or local/server data ownership changes.                                                                                              | explicit stateless governance-slice rationale                             | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation trigger, or data freshness behavior changes.                                                                                            | explicit scope rationale                                                  | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: the perf gate should fail clearly if any core route exceeds the tightened threshold.                                                                                 | perf budget failure contract remains unchanged + targeted run             | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, RBAC, protected route, input validation, or secret-handling behavior changes.                                                                                    | explicit security scope rationale                                         | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data collection, retention, logs, consent, or compliance copy changes.                                                                                        | explicit privacy scope rationale                                          | `N/A`                   |
| Content governance                            | `target`     | Canonical performance docs and this brief state the current JS transfer default, the latest `2026-05-14` trend evidence, and the final ratchet decision.                              | docs/runbooks + testing docs + brief checkpoint                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow or editability surface changes.                                                                                                             | explicit admin scope rationale                                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonicals, or public semantic structure changes.                                                                                     | explicit SEO scope rationale                                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public page content model, structured data, or crawl-safe semantic route behavior changes.                                                                             | explicit AI-discoverability scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI logging, persistence, or event payload changes.                                                                                          | explicit analytics scope rationale                                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, billing, refund, or revenue operation changes.                                                                                         | explicit commerce scope rationale                                         | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this performance governance slice updates validation thresholds/docs only and does not change support recovery paths, alerts, or incident ownership.                      | explicit support/incident scope rationale                                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, invoice, entitlement-reporting, or revenue data behavior changes.                                                                     | explicit finance scope rationale                                          | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, metadata localization, or user-facing copy contract changes.                                                                        | explicit i18n scope rationale                                             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use the existing Next/Playwright performance budget script and repo docs; add no dependency and do not introduce a new measurement system.                                            | script diff + package diff review                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted perf trend/budget checks pass, changed brief passes lint, and the branch passes `npm run verify:pre-pr`; before merge, `npm run verify:pre-merge` passes.                    | command logs + CI green                                                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | The tighter JS payload gate preserves at least `15%` practical headroom on the latest public profile and catches future bundle growth before user-visible route slowdown.             | trend margin + fresh perf budget report                                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The change is one reversible threshold step (`390kb` back to `400kb`) plus docs updates; no migration or deployment choreography is required.                                         | reversible diff + rollback note + `verify:pre-pr`                         | `5/5`                   |

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
  - identifiers searched: `JS transfer`, `400kb`, `390kb`, `Current Budget Defaults`, `Current ratchet`, `Latest ratchet decision`.
  - surfaces checked: `scripts/run-perf-budget-check.mjs`, `docs/runbooks/pagespeed-lighthouse-gated-governance.md`, `docs/runbooks/maintenance-cadence.md`, `docs/testing-strategy.md`, `docs/testing-coverage-scorecard.md`, and this brief.
  - fallout handled: no route, user/admin label, Help/Guide content, recovery path, or operator support action changes are in scope.

## Data Placement And Sync Contract

`N/A` because this slice is stateless governance/tooling work. It does not create or modify server-canonical entities, local browser storage, sync triggers, retention rules, cache invalidation, or sensitive data handling.

## Identity And Rename Contract

`N/A` because this slice does not create, rename, repurpose, or route any persisted product entity, slug, title, route param, import/export identifier, or operator-visible identifier.

## Scope

- Recommended implementation: JS transfer default `400kb` -> `390kb`.
- Update only the existing perf-budget script constant and canonical performance governance docs.
- Record trend rationale and validation checkpoints in this brief.

## Out Of Scope

- Tightening JS transfer from `400kb` to `375kb` unless explicitly approved after acknowledging the likely loss of the `15%` headroom rule.
- Changing LCP, CLS, TBT, CSS transfer, or request-count budgets.
- Changing measured routes or perf collection logic.
- Adding Lighthouse/PageSpeed tooling or new dependencies.
- UI, route, Help/Guide, support workflow, analytics, commerce, auth, data, or i18n changes.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Owner approval for `tighten JS transfer 400kb -> 390kb` is recorded before implementation.
2. JS transfer default threshold is `390kb`.
3. `npm run test:perf:budgets` passes on the current branch with the approved threshold.
4. Governance docs consistently describe the latest `2026-05-14` tighten/hold/revert decision.
5. Changed brief passes scorecard lint and quality-gate evidence checks.
6. `npm run verify:pre-pr` passes before PR update/push.
7. Required CI checks are green and `npm run verify:pre-merge` passes before merge-readiness handoff.

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
- Keep rollback simple: revert `390kb` to `400kb` and update the ratchet notes if fresh evidence contradicts the tighten.

## Help/Guide And Operator Training Contract

`N/A` because no admin/user workflow labels, actions, recovery behavior, Help/Guide content, or support-surface behavior changes. Maintenance/performance runbooks are updated because they are the canonical owner docs for this threshold.

## Security, Privacy, And Compliance

- No secrets, tokens, credentials, auth paths, data retention, privacy copy, or compliance behavior changes.
- Perf artifacts must not include bypass tokens; this slice uses the public profile by default.

## Observability And KPI Contract

- Existing perf-budget trend log remains the operational evidence trail.
- No product analytics, KPI event taxonomy, dashboards, or persistence behavior changes.

## Session Continuity And Recovery

- Canonical source of truth: branch `chore/performance-budget-ratchet-2026-05-14` and this brief.
- Checkpoint cadence: commit after scoped implementation and validation if owner approves execution.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Automation-first after owner approves scope:
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

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth:
  - canonical performance runbook and maintenance cadence docs own the budget and ratchet history.
- Identity and rename safety:
  - `N/A`; no persisted identifiers or route params change.
- Taxonomy and category management:
  - `N/A`; no product taxonomy changes.
- Workflow and publishing safety:
  - existing release gates remain the publishing safety path.
- Business logic correctness and data integrity:
  - perf runner keeps the same route/metric semantics; only the JS threshold changes if approved.
- RBAC and auditability:
  - `N/A`; no auth or admin mutation surface changes.
- UX/UI quality contract:
  - `N/A`; no rendered UI changes.
- Admin editor ergonomics:
  - `N/A`; no admin editor changes.
- Performance contract:
  - `/`, `/plans`, `/course`, and `/my-library` must pass JS transfer `<= 390kb` if approved, plus existing LCP/CLS/TBT/CSS/request budgets.
- Data placement and sync boundaries:
  - `N/A`; no stateful product data changes.
- Caching and invalidation strategy:
  - `N/A`; no cache behavior changes.
- Testing contract:
  - targeted perf checks plus full verify gates.
- Observability and KPI tracking:
  - perf trend log remains the operational evidence trail; no product analytics change.
- Incident response and support operations:
  - `N/A`; no incident/support workflow changes.
- Finance and reporting operations:
  - `N/A`; no finance/reporting behavior changes.
- i18n operational readiness:
  - `N/A`; no locale/content model changes.
- Stack-fit and dependency discipline:
  - existing scripts/docs only; no dependencies.
- Scalability and cost efficiency:
  - lower JS budget reduces future payload drift risk.
- Migration and rollback readiness:
  - one reversible config constant plus docs.
- Definition of done quant targets:
  - JS transfer default `390kb` if approved, fresh perf budget PASS, full pre-PR and pre-merge gates PASS.
- Help/Guide and operator training documentation:
  - `N/A`; canonical maintenance/performance runbooks updated instead.

## Closeout Evidence

- `merged PR`: #706 as `df2b31b` on `2026-05-14`.
- `10/10 claim`: yes for the approved performance governance ratchet scope.
- Critical target categories are all `5/5`: Performance, Content governance, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.
- Remaining gaps: none within the approved scope.
- Screenshot handoff: `N/A`; no UI, print, layout, export, or brand rendering changed.
- Help/Guide impact: `N/A`; no admin/user workflow labels, actions, recovery behavior, or Help/Guide content changed.

| Target Category                     | Achieved Score | Evidence                                                                                                          |
| ----------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                | `5/5`          | JS transfer default moved from `400kb` to `390kb`; no product IA behavior changed.                                |
| Performance (CWV + payloads)        | `5/5`          | `npm run test:perf:budgets` passed at `390kb`; worst post-ratchet margin remained `17.6%`.                        |
| Content governance                  | `5/5`          | Canonical performance runbook, maintenance cadence, testing docs, and this brief record the `2026-05-14` ratchet. |
| Stack-fit and dependency discipline | `5/5`          | Existing performance budget script/docs were reused; no dependencies or new measurement system were added.        |
| Testing and QA automation           | `5/5`          | Targeted checks, `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` passed for PR #706.           |
| Scalability and cost efficiency     | `5/5`          | Tighter JS transfer gate catches future payload drift while preserving the repo's `15%` headroom rule.            |
| DevOps and rollback readiness       | `5/5`          | Rollback remains a single threshold revert from `390kb` back to `400kb` plus docs note updates.                   |

## Checkpoint Log

- `2026-05-14 | planning | audit started from clean main 7fddf9e after PR #704 and repo-managed closeout PR #705 were merged; npm run test:perf:trend reported public latest PASS at 9ad31161953d, 5 consecutive weekly green runs, 19.6% worst margin, recommendation tighten | next: get owner scope decision before changing performance thresholds`
- `2026-05-14 | in-progress | owner approved recommended scope: implement JS transfer default 400kb -> 390kb, update canonical governance docs, run targeted perf validation and full pre-PR/pre-merge gates | next: implement threshold/docs changes`
- `2026-05-14 | in-progress | implemented JS transfer default 390kb and governance docs; targeted validation passed: npm run lint:briefs:all PASS, npm run lint:quality-gates PASS after adding explicit sweep evidence, npm run test:perf:trend reported tighten with 5 weekly green runs and 19.6% pre-ratchet margin, npm run test:perf:budgets PASS with 17.6% worst post-ratchet margin and JS medians / 321.5kb, /plans 273.5kb, /course 300.4kb, /my-library 272.0kb | next: run npm run verify:pre-pr`
- `2026-05-14 | done | PR #706 merged as df2b31b after green GitHub checks and green local npm run verify:pre-merge; post-merge preflight surfaced this repo-managed docs-only lifecycle closeout, moved brief to done, and recorded achieved 10/10 target evidence | next: validate, merge, sync, and rerun post-merge preflight for the closeout PR`
