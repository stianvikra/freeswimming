# Task Brief: Analytics Retention And Rollup Lifecycle V1 (10/10)

## Metadata

- `id`: `2026-06-09-analytics-retention-and-rollup-lifecycle-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-09`
- `updated`: `2026-06-09`
- `parent_brief`: `docs/task-briefs/deferred/2026-02-18-analytics-persistence-and-admin-insights.md`
- `execution_mode`: `end-to-end`
- `branch`: `analytics-retention-rollup-lifecycle-v1`

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: clean synced `main@6384086a` after PR `#1045` and repo-managed closeout PR `#1046`
- `audit_status`: `ready`
- `decision`: Execute this bounded child after Admin Analytics Dashboard Read-Only V1 because retention cleanup and rollup readiness were the next deferred analytics lifecycle gap.
- `reason`: PR `#1043/#1044` shipped privacy-safe `analytics_events` persistence and admin JSON insights. PR `#1045/#1046` shipped the read-only admin dashboard over bounded raw reads. The remaining lifecycle risk is unbounded raw event growth and no rollup/retention control plane; CSV export, finance reporting, vendors, and public-to-user joins remain too broad for this slice.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, verification lanes, `analytics_events` schema, Supabase migration discipline, generated DB types, `/api/admin/analytics/insights`, `lib/analytics/*`, admin dashboard API contract, Help/Guide analytics copy, privacy/cookie policy behavior, or route/label/support sweep rules change before PR handoff.

## Goal

Add a privacy-safe analytics lifecycle foundation so raw first-party event rows can be summarized into daily rollups and pruned later through explicit, tested, service-role-only operations without changing collection behavior or adding analytics vendors.

## Pre-Implementation Owner Explanation

Vi gir analytics-dataene en ryddig livssyklus: nye tall kan samles i daglige summer, og gamle ra event-rader kan slettes senere nar de er trygt oppsummert. Det betyr noe fordi dashboardet na er nyttig, men databasen bor ikke vokse uendelig eller bli tregere etter hvert som trafikken oker. Utenfor scope er CSV-export, finance-grade rapportering, nye kommersielle CTA-er/funnel-endringer, tredjeparts analytics, cookies/visitor-ID og kobling mellom anonym public trafikk og brukerprofil.

Forward-compatibility-intent: nye godkjente events, ruter og produkter skal kunne telles via eksisterende typed analytics-kontrakter og generiske rollup-dimensjoner; nye KPI-moduler, export-formater, finance-regler eller route-kategorier krever eksplisitt mapping, brief og tester.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold                                                                                                                                                        | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Parent analytics scope shows persistence, dashboard, and lifecycle child status clearly, with CSV/finance/vendor work still deferred.                                   | parent brief + active brief diff            | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: this slice changes API/data diagnostics, not visible user/admin controls; existing dashboard empty/error states stay intact.                           | dashboard tests + diff review               | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, print, layout, branding, or visual-rendering file is changed.                                                                                        | explicit visual scope rationale             | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Rollups must aggregate deterministic safe dimensions and raw pruning must require existing rollup coverage before deleting rows.                                        | migration review + lifecycle helper tests   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin dashboard can keep reading current insights while lifecycle diagnostics become API-visible; no edit workflow changes.                            | admin insights tests + API contract         | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI, keyboard flow, labels, focus order, contrast, or screen-reader surface changes.                                                             | explicit a11y scope rationale               | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Event ingestion remains non-blocking; admin insights stay bounded to 90 days/5000 rows and lifecycle queries read bounded rollup metadata.                              | route tests + full verify/perf gate         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Raw events remain server-canonical; daily rollups become server-canonical aggregates; local/browser state remains unchanged.                                            | data contract + generated DB types          | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin lifecycle diagnostics stay `no-store`; rollup refresh/prune operations are explicit service-role operations, not cached client state.                             | route registry/API docs + route tests       | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing rollup schema, missing raw schema, stale rollups, and query failures have deterministic non-raw-payload diagnostics.                                            | negative-path tests                         | `5/5`                   |
| Security and authz                            | `target`     | Rollup and prune SQL functions are service-role-only; admin insights remain viewer+ and fail closed for `401`/`403`.                                                    | migration grants + route tests              | `5/5`                   |
| Privacy and compliance                        | `target`     | Rollups store only sanitized dimensions and counts; no cookies, visitor IDs, raw URLs, emails, IPs, User-Agent, or anonymous-user bridge.                               | migration columns + privacy docs + tests    | `5/5`                   |
| Content governance                            | `target`     | API contracts, architecture registry, external service matrix, privacy assessment, and parent brief document lifecycle limits and caveats.                              | docs diff + route/label/support sweep       | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin edit/export/raw-event workflow ships; lifecycle operations are operator/service-role maintenance only.                                        | scope review + Help/Guide impact rationale  | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, or crawlability behavior changes.                                                                | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or crawler-facing surface changes.                                                                      | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `target`     | Admin insights expose lifecycle readiness metadata and tests prove rollup status is derived without raw payload display.                                                | insights tests + API contract               | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: checkout/entitlement proxy event rollups may support later product review, but no checkout, entitlement, Stripe, or billing change.                    | finance/commerce scope review               | `4/5`                   |
| Incident response and support operations      | `target`     | Operators can diagnose raw schema missing, rollup schema missing, stale/missing rollups, and prune safety from docs/API metadata.                                       | runbook/API docs + tests                    | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: revenue-proxy counts remain explicitly not finance reconciliation, revenue recognition, payout, refund, invoice, or accounting data.                   | explicit finance scope rationale + docs     | `4/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because this internal data lifecycle slice adds no locale routes, translated strings, or user-facing copy; future dashboard copy still needs normal locale mapping. | explicit i18n scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js route, TypeScript helper, Supabase migration/RLS, and Vitest patterns; add no dependency or vendor.                                                | changed-files review + package diff         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted lifecycle/admin insights/migration tests plus `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` pass.                                             | test outputs + CI + gate artifacts          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Daily rollups and service-role prune safety bound long-term storage/query growth without deleting unrolled raw data.                                                    | migration/function tests + docs             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration is additive; no automatic deletion job ships; rollback and manual operation boundaries are documented.                                                        | migration review + PR summary + docs        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing `/api/admin/analytics/insights` route and no-store JSON pattern.
  - No rendered UI changes in V1; existing admin dashboard remains the reference consumer.
- TypeScript/domain contracts:
  - Add typed lifecycle/rollup helpers under `lib/analytics/`.
  - Keep unknown or missing lifecycle schema as explicit status, not raw error display.
- Supabase/data layer:
  - Add explicit migration for daily rollup storage, run history, service-role refresh/prune functions, RLS, grants, comments, and indexes.
  - Update generated DB type contract in `types/database.ts`.
  - Prune function must fail closed by requiring existing rollup coverage before raw row deletion.
- External services/tools:
  - No third-party analytics vendor, SDK, cookie, tag manager, webhook, or secret change.
  - Supabase service-role remains server-only.
- UI system:
  - N/A; no UI files change.
- Testing:
  - Add unit coverage for lifecycle status builder and admin insights rollup metadata.
  - Add migration contract tests for service-role-only functions, rollup table/RLS, and prune safety.

## Data Placement And Sync Contract

- Server-canonical:
  - `analytics_events` remains the raw sanitized first-party event source.
  - `analytics_event_daily_rollups` stores derived daily aggregate counts only.
  - `analytics_event_rollup_runs` stores maintenance operation evidence only.
- Local-only:
  - No new browser storage, cookies, localStorage, user preferences, or client cache.
- Sync behavior:
  - Event ingestion remains fail-soft and non-blocking.
  - Rollup refresh is an explicit service-role maintenance operation.
  - Raw pruning is a separate explicit service-role operation that deletes only rows from days already represented by rollups.
- Retention and sensitivity:
  - V1 defines a raw retention target of `180` days and a rollup window target of `400` days.
  - No automatic deletion job ships; operators must run the service-role function after rollup refresh until a future scheduled job is approved.
  - Rollups must not store payload JSON, `user_id`, email, raw URL, IP, User-Agent, visitor ID, or private training/user content.
- Cache/invalidation:
  - Admin insights remain `force-dynamic` and `Cache-Control: no-store`.
  - Rollup refresh/prune immediately affects future no-store admin lifecycle diagnostics.

## Identity And Rename Contract

- Canonical stable IDs:
  - Analytics event identity remains `event_name` from `ANALYTICS_EVENT_NAMES`.
  - Product identity remains safe `product_id` from existing catalog/Stripe payload helpers.
  - Route identity remains safe `route_template`.
- Human-readable identifiers:
  - Dashboard labels are derived display labels and may be renamed without changing rollup identity.
- Mutability rules:
  - Rollup dimensions preserve historical event names/product IDs/route templates as recorded.
  - Renaming display labels must not split historical rollups.
- Rename vs repurpose:
  - Repurposing an event name, product ID, route template, or route category requires a new mapping/update brief, alias plan, and tests.
- Compatibility contract:
  - Unknown/deprecated event/product/route values remain counted under their safe recorded identifiers or unknown fallback.
  - Unsafe dimensions are never rolled up because they were stripped before persistence.
- Observability and repair:
  - Admin lifecycle metadata exposes rollup readiness/staleness without raw payload drilldown.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics event names, route templates/categories, product IDs/types, channels, public aggregate flags, daily rollup dimensions, retention windows, export formats, finance reporting, and future vendor forwarding.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Safe dimensions come from existing analytics sanitizer/persistence helpers.
  - Rollups come from `analytics_events`, not route-local labels or dashboard formatting.
- Additive behavior:
  - New approved events/products/routes that persist safe dimensions should roll up automatically through the generic grouped dimensions.
  - Existing dashboard list modules can continue reading generic counts without hardcoding today's event set.
- Explicit mapping requirements:
  - New KPI modules, route-category-specific reporting, CSV/export formats, finance-grade reporting, vendor forwarding, public-to-user profile bridges, consent/cookie behavior, and scheduled retention jobs require explicit brief/code/docs/tests and owner decision.
- Unknown or deprecated values:
  - Unknown safe identifiers are counted but labeled generically by existing dashboard/view-model fallback.
  - Unsafe/unmapped values must not be copied into rollups or docs.
- Test/evidence:
  - Tests must include at least one future-safe event/dimension fixture and one missing/stale rollup state.

## Help / Guide Impact

N/A with rationale: this slice changes no visible admin workflow labels, buttons, tabs, user-facing recovery flow, or Help/Guide operating instructions. It updates API/architecture/privacy/runbook contracts for operator-level analytics lifecycle behavior. If a future slice adds a visible Rollups/Retention admin control, export button, or support workflow label, Help/Guide must be updated in that PR.

## Route / Label / Support Surface Sweep

Required because analytics API contracts, support diagnostics, lifecycle docs, and operator-visible data-retention rules change.

Search at minimum:

- `analytics_events`
- `analytics_event_daily_rollups`
- `analytics_event_rollup_runs`
- `/api/admin/analytics/insights`
- `retention`
- `rollup`
- `CSV export`
- `finance reconciliation`
- `Plausible`
- `GA4`
- `Meta`
- `Hotjar`
- `Clarity`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `tests/`
- `types/database.ts`
- `supabase/migrations/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/deferred/planned/done analytics briefs.

Identifiers searched: `analytics_event_daily_rollups`, `analytics_event_rollup_runs`, `/api/admin/analytics/insights`, `retention`, `rollup`, `CSV export`, `finance reconciliation`, `Plausible`, `GA4`, `Meta`, `Hotjar`, and `Clarity`.

Surfaces checked: `app/`, `components/`, `lib/analytics/`, `tests/`, `types/database.ts`, `supabase/migrations/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, `docs/task-briefs/deferred/`, `docs/task-briefs/in-progress/`, `docs/task-briefs/planned/`, and `docs/task-briefs/done/`.

Fallout handled: API contract lifecycle fields, data-access/authz/cache route registry, external-service matrix, public analytics privacy assessment, deferred analytics parent brief, active implementation brief, generated DB types, admin insights tests, lifecycle tests, and migration contract tests. No public privacy/cookie page, visible Help/Guide UI, third-party vendor, finance/export surface, or admin visual screenshot handoff is required for this non-visual data lifecycle slice.

## Failure-Mode Evidence

- No unexpected 500 behavior is introduced for expected lifecycle request failures:
  - `/api/admin/analytics/insights` still returns `401` for unauthenticated users and `403` for forbidden users through the existing admin gate.
  - Missing raw `analytics_events` schema still returns `200` with `schemaReady: false` setup guidance.
  - Missing `analytics_event_daily_rollups` schema keeps bounded raw insights available and sets `lifecycle.rollup.status = "schema-missing"`.
  - Unexpected rollup status query failures fail soft into `lifecycle.rollup.status = "query-failed"` without raw SQL or payload details.
  - Raw analytics read failures remain the only scoped `500` path because the primary insights cannot be loaded.
- Migration failure mode:
  - `prune_analytics_events` raises an exception when the cutoff would retain fewer than 30 days of raw events.
  - `prune_analytics_events` deletes only raw rows whose UTC day exists in `analytics_event_daily_rollups`, so unrolled days fail closed by preserving raw rows.

## Scope

- Add additive Supabase migration for analytics daily rollups, operation run history, service-role refresh/prune functions, grants, RLS, indexes, and comments.
- Update generated DB type contract.
- Add typed lifecycle status helpers.
- Extend admin analytics insights response with lifecycle metadata while keeping raw reads bounded and no-store.
- Update API/architecture/privacy/parent brief docs.
- Add targeted unit/migration tests.

## Out Of Scope

- CSV export, BI warehouse, finance-grade reporting, revenue recognition, refunds, payouts, invoice reconciliation, Stripe report integration, or accounting workflows.
- Third-party analytics vendors, pixels, tag managers, cookies, localStorage visitor IDs, session replay, heatmaps, ad retargeting, consent UI, or public analytics vendor activation.
- Public anonymous traffic to user-profile bridge.
- New dashboard charts, new admin controls, raw-event drilldown, export UI, or visual redesign.
- Automatic scheduled cron/job execution for retention.
- New event taxonomy, new CTA placement, new commerce funnel behavior, new auth/library KPI modules, or route-category remapping.
- Deleting production data during implementation.
- Merge to `main` without explicit owner approval.

## Acceptance Criteria

1. Daily rollup table stores only safe aggregate dimensions and counts; no raw payload or user ID is stored.
2. Refresh function rebuilds deterministic daily rollups for a bounded date range and records run evidence.
3. Prune function deletes raw events only for days with existing rollup coverage and records run evidence.
4. Rollup/prune functions are service-role-only; admin route remains viewer+ and fail-closed for unauthenticated/forbidden callers.
5. Admin insights response includes lifecycle metadata for raw retention target, rollup window target, rollup schema readiness, latest/oldest rollup day, total rolled events, and stale/missing status.
6. Missing raw schema and missing rollup schema produce deterministic non-raw-payload diagnostics.
7. API/architecture/privacy/parent docs describe lifecycle behavior, finance/vendor/export caveats, and future scheduled-job boundary.
8. Targeted tests and full gates pass.

## Validation

Targeted:

- `npm exec vitest run tests/unit/analytics-lifecycle.test.ts tests/unit/admin-analytics-insights.test.ts tests/unit/analytics-migration-contract.test.ts`
- `npm run typecheck`
- `npm run lint:briefs:all`
- `npm run lint:quality-gates`
- route/label/support-surface sweep listed above
- `git diff --check`

Broad gates:

- apply additive Supabase migration to linked remote if `verify:pre-pr` surfaces migration drift
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Canonical source of truth:
  - this brief path and branch `analytics-retention-rollup-lifecycle-v1`.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Implementation flow:
  - branch from clean synced `main`,
  - active brief in `in-progress`,
  - implement migration/helpers/API/docs/tests,
  - run targeted validation,
  - run `npm run verify:pre-pr`,
  - commit, push, open/update PR,
  - monitor CI,
  - run `npm run verify:pre-merge`,
  - summarize merge readiness without merging.

## Automation Mode

Automation-first after owner explicitly said `implementer Analytics Retention And Rollup Lifecycle V1`. The assistant owns implementation, tests, git, PR prep, CI monitoring, and merge-readiness summary unless blocked by sandbox approval, credentials, missing context that cannot be safely discovered, or a real product decision.

## PR Browser Rule

Use the repo-standard Safari PR flow, preferably `npm run pr:create:safari`, unless owner explicitly requests otherwise.

## Checkpoint Log

- `2026-06-09 | in-progress | owner explicitly said implementer Analytics Retention And Rollup Lifecycle V1; branch analytics-retention-rollup-lifecycle-v1 created from clean synced main@6384086a after PR #1045/#1046; scope is additive analytics rollup/retention lifecycle without UI, vendor, cookie, export, finance, scheduled job, or public-to-user bridge work | next: inspect analytics helpers/schema/tests, implement migration/helpers/API/docs/tests, then run targeted validation`
- `2026-06-09 | implemented + targeted validation | added additive analytics daily rollup/run-history migration, service-role-only refresh/prune SQL functions, generated DB type contract, lifecycle status helper, admin insights lifecycle metadata, API/architecture/privacy/parent docs, and targeted tests; validation passed: targeted Vitest 5 files / 21 tests and npm run typecheck; route/label/support sweep for analytics_event_daily_rollups, analytics_event_rollup_runs, /api/admin/analytics/insights, retention, rollup, CSV export, finance reconciliation, Plausible, GA4, Meta, Hotjar, and Clarity found expected analytics/docs/privacy/legacy-brief references only with no extra vendor, cookie, finance, export, or UI scope required | next: run lint:briefs:all, lint:quality-gates, git diff --check, apply migration remotely if drift gate requires it, then run npm run verify:pre-pr`
- `2026-06-09 | remote migration applied | npx supabase db push --linked applied 20260609223000_analytics_rollup_retention_lifecycle.sql successfully with expected first-run drop-policy notices for new rollup policies; targeted validation remains green and npm run lint passed with only pre-existing output/ artifact warnings | next: run npm run verify:pre-pr`
- `2026-06-09 22:44 CEST | verify:pre-pr passed | final full pre-PR gate passed after checkpoint update on branch analytics-retention-rollup-lifecycle-v1 with branch-current, Supabase migration drift, quality gates, admin audit lint, env parity lint, PR body lint, eslint, typecheck, unit tests, build, performance budgets, and Playwright open checks green; E2E summary was 106 passed / 530 skipped, performance trend recommendation was hold, and evidence is in artifacts/test-runs/20260609-223835/verify.log | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`

## Completion Record

- `completed`: `2026-06-09`
- `merged_pr`: `#1047`
- `squash_commit`: `0b5e3217`
- `result`: Closed Analytics Retention And Rollup Lifecycle V1 by adding privacy-safe daily rollups, service-role-only refresh/prune functions, lifecycle diagnostics, API/docs coverage, and tests while keeping scheduled deletion, finance reporting, exports, vendors, and UI changes out of scope.
- `validation`: `npx supabase db push --linked` applied the additive migration; targeted Vitest and typecheck passed; `npm run verify:pre-pr` passed full lane on HEAD `b56d94a7` with E2E `106 passed / 530 skipped`; PR #1047 CI passed `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, CodeQL, and Vercel; `npm run verify:pre-merge` passed and recorded `artifacts/verify-pre-merge/20260609-210010.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                        | Gaps / Notes |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Parent brief and PR #1047 now show persistence, dashboard, and lifecycle child status distinctly.               | None.        |
| Business logic correctness and data integrity | `5/5`          | Migration and tests validate deterministic aggregate dimensions and prune safety by rollup coverage.            | None.        |
| Performance (CWV + payloads)                  | `5/5`          | Full `verify:pre-pr` performance budgets passed on unchanged public route budgets.                              | None.        |
| Data placement and sync boundaries            | `5/5`          | Raw events and daily rollups are server-canonical; no local/browser state boundary changed.                     | None.        |
| Caching and invalidation strategy             | `5/5`          | Admin lifecycle diagnostics remain `no-store`; refresh/prune remain explicit service-role ops.                  | None.        |
| Reliability and failure handling              | `5/5`          | Tests cover missing raw schema, missing rollup schema, stale/missing rollups, and query failures.               | None.        |
| Security and authz                            | `5/5`          | SQL functions are service-role-only; admin insights stay viewer+ and fail closed for `401`/`403`.               | None.        |
| Privacy and compliance                        | `5/5`          | Rollups store sanitized dimensions/counts only, with no cookies, visitor IDs, raw URLs, or bridge.              | None.        |
| Content governance                            | `5/5`          | API contract, architecture registry, service matrix, privacy runbook, and parent brief were updated.            | None.        |
| Analytics and KPI observability               | `5/5`          | Admin insights expose lifecycle readiness metadata with tests proving raw payloads are not shown.               | None.        |
| Incident response and support operations      | `5/5`          | API metadata and docs identify schema-missing, stale, and prune-safety states for operators.                    | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Existing Next.js route, TypeScript helper, Supabase migration/RLS, and Vitest patterns were reused.             | None.        |
| Testing and QA automation                     | `5/5`          | Targeted tests, full `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                                     | None.        |
| Scalability and cost efficiency               | `5/5`          | Daily rollups and prune guards bound long-term storage/query growth without deleting unrolled data.             | None.        |
| DevOps and rollback readiness                 | `5/5`          | Migration is additive; automatic deletion was not shipped; operation and rollback boundaries remain documented. | None.        |
