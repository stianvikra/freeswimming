# Task Brief: Privacy-Safe Analytics Persistence And Admin Insights V1 (10/10)

## Metadata

- `id`: `2026-06-09-privacy-safe-analytics-persistence-admin-insights-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-09`
- `updated`: `2026-06-09`
- `branch`: `analytics-persistence-admin-insights-v1`
- `base`: `main@addea9e0`
- `execution_mode`: `owner explicitly said implement on 2026-06-09`

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: `main@addea9e0`
- `audit_status`: `ready`
- `decision`: Execute a bounded V1 child slice for privacy-safe first-party analytics persistence and admin-only JSON insights.
- `reason`: Public analytics foundation is complete in PR `#1041` and closeout `#1042`, while durable event storage, rollups, and dashboard UI were explicitly deferred. The scorecard recommends first-party persistence/admin insights before new vendor complexity.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, Supabase auth/RLS patterns, `/api/analytics/event`, `lib/analytics/events.ts`, public analytics privacy assessment, admin auth helpers, privacy/cookie copy, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Persist sanitized first-party analytics events through a server-owned table and expose a small admin-only insights JSON contract without adding third-party analytics, cookies, visitor IDs, or a new visible dashboard.

## Pre-Implementation Owner Explanation

Vi lagrer trygge maalehendelser slik at admin senere kan se hva som faktisk skjer, i stedet for at hendelser bare forsvinner i logger. Det betyr noe fordi public analytics-grunnmuren naa finnes, men tallene maa kunne telles og forklares trygt foer de blir nyttige. Utenfor scope er Plausible/GA4/Meta/Hotjar/Clarity, cookies, visitor-ID, full admin Users UI, store grafer, CSV-export, finance reporting og kobling av anonym public trafikk til brukerprofil.

Forward-compatibility-intent: nye offentlige sider, produkter, kurs og events skal flyte gjennom eksisterende typed route/product/event contracts og ukjente verdier skal fail-closed eller `not counted`, ikke hardkodes til dagens sider.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                            | Evidence                                           | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | V1 answers one admin/product question set through a documented JSON insights contract without introducing dashboard navigation.             | API contract + route tests                         | `4/5`             |
| UX flow clarity                               | `supporting` | Supporting only: no visible UI changes; JSON states must still expose clear `ok`, `schemaReady`, `warning`, and capped/freshness fields.    | route tests                                        | `4/5`             |
| Visual design quality                         | `N/A`        | N/A because no rendered UI, print, layout, brand, or visual asset changes are in scope.                                                     | explicit scope rationale                           | `N/A`             |
| Business logic correctness and data integrity | `target`     | Sanitized event records persist deterministically, keep public events unlinked from users, and store bounded safe dimensions for queries.   | unit tests + route tests + migration review        | `5/5`             |
| Admin editor ergonomics                       | `supporting` | Supporting only: V1 exposes admin-readable insight data but no editor/dashboard workflow.                                                   | API response shape review                          | `4/5`             |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered interactive UI or semantic markup changes.                                                                          | explicit scope rationale                           | `N/A`             |
| Performance (CWV + payloads)                  | `target`     | Event write is best-effort/non-blocking for user flows; admin reads are bounded by range and row cap with indexed columns.                  | route tests + migration indexes + verify           | `4/5`             |
| Data placement and sync boundaries            | `target`     | Server-canonical event rows and local-only filter state boundaries are explicit; no browser visitor IDs or public profile bridge.           | data contract + tests                              | `5/5`             |
| Caching and invalidation strategy             | `target`     | Analytics ingestion and admin insights routes are `force-dynamic`/`no-store`; admin response includes freshness/cap status.                 | route headers/tests                                | `4/5`             |
| Reliability and failure handling              | `target`     | Persistence failures are logged and fail soft; expected malformed request/admin deny paths return deterministic non-500 responses.          | negative-path route tests                          | `5/5`             |
| Security and authz                            | `target`     | Admin insights fail closed to authenticated viewer+ admins; direct public table access is not granted; service writes use sanitized rows.   | RLS migration + admin route tests                  | `5/5`             |
| Privacy and compliance                        | `target`     | No raw URLs, emails, free text, IPs, user agents, cookies, visitor IDs, or public-to-user joins are stored by this slice.                   | sanitizer/persistence tests + privacy sweep        | `5/5`             |
| Content governance                            | `supporting` | Supporting only: API contracts/runbook notes identify metric caveats and deferred dashboard/rollup work.                                    | docs diff                                          | `4/5`             |
| Admin workflow and editability                | `supporting` | Supporting only: no new admin workflow; endpoint is a foundation for later admin UI.                                                        | scope rationale                                    | `4/5`             |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonical URL, structured data, or crawl behavior changes.                                 | explicit scope rationale                           | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured public entity output, or AI-facing page changes.                                         | explicit scope rationale                           | `N/A`             |
| Analytics and KPI observability               | `target`     | Client ingestion, checkout, discount, and entitlement events become queryable through a stable admin insights V1 contract.                  | unit tests + API contract                          | `5/5`             |
| Commerce and revenue ops                      | `supporting` | Supporting only: commerce event persistence supports funnel insight but does not change checkout, entitlement, accounting, or Stripe truth. | diff review + route tests                          | `4/5`             |
| Incident response and support operations      | `supporting` | Supporting only: failures log explicit analytics persistence/admin insights messages; no live alerting is added in V1.                      | log/error-path review                              | `4/5`             |
| Finance and reporting operations              | `supporting` | Supporting only: checkout/entitlement event persistence aids later reporting but is not finance reconciliation or revenue recognition.      | scope rationale                                    | `4/5`             |
| i18n operational readiness                    | `supporting` | Supporting only: analytics identity uses event names and route/product IDs rather than translated labels.                                   | contract tests                                     | `4/5`             |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js route handlers, TypeScript contracts, Supabase migrations/RLS, admin auth helpers, and tests; add no dependency.       | dependency diff + code review                      | `5/5`             |
| Testing and QA automation                     | `target`     | Persistence builder, ingestion route, admin insights route, and migration/contract behavior are covered before PR.                          | targeted Vitest + `npm run verify:pre-pr`          | `5/5`             |
| Scalability and cost efficiency               | `target`     | V1 uses indexed append-only rows and bounded admin reads; full rollups remain a later explicit slice.                                       | migration indexes + cap tests                      | `4/5`             |
| DevOps and rollback readiness                 | `target`     | Migration is additive; runtime persistence is fail-soft; rollback path and deferred rollup/dashboard gap are documented.                    | migration review + PR summary + `verify:pre-merge` | `4/5`             |

Critical target categories for any 10/10 claim: Business logic correctness and data integrity, Security and authz, Privacy and compliance, Reliability and failure handling, Analytics and KPI observability, Testing and QA automation.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - No new rendered admin UI in V1; screenshot handoff is N/A with rationale because no visual surface changes.
  - Reuse existing API route patterns: `force-dynamic`, `nodejs` where needed, `no-store` JSON, `createRouteHandlerSupabaseClient`, and `requireAdminRoleFromSupabase`.
  - Keep `/api/analytics/event` non-blocking for user-facing actions.
- TypeScript/domain contracts:
  - Reuse `AnalyticsEventName`, `AnalyticsEventRecord`, and `sanitizeAnalyticsPayload`.
  - Add a narrow persistence mapper that derives safe dimensions from already-sanitized scalar payloads.
  - Unknown or unsafe dimensions fall back to `null`/not counted; raw URL/referrer/user-agent/IP/free-text payloads remain stripped before persistence.
- Supabase/data layer:
  - Add one additive migration for `analytics_events`.
  - RLS is enabled; admin select is viewer+ only through profile roles; direct anon/auth inserts are not granted.
  - Add indexes for event/date/user/public/product/route query paths.
  - Update generated TypeScript DB contracts manually for the new table.
- External services/tools:
  - No new vendor, script, SDK, cookie, tag manager, or DPA activation.
  - Existing Stripe/entitlement truth remains unchanged; analytics persistence reads only existing safe event payloads.
- UI system:
  - N/A for V1; later dashboard UI must use current admin manager patterns and screenshot handoff.
- Testing:
  - Unit tests for persistence mapping, unsafe values, public aggregate classification, admin insights aggregation, route authz/negative paths, and fail-soft persistence.

## Data Placement And Sync Contract

- Server-canonical:
  - `analytics_events` rows: sanitized event name, channel, optional user ID, safe scalar payload, safe dimensions, public aggregate flag, and timestamps.
  - Admin insights V1 response is derived from server rows and not client-authored truth.
- Local/browser:
  - No new browser storage.
  - No analytics visitor ID, public-site cookie, localStorage key, or ad click ID.
- Sync policy:
  - Ingestion is best-effort and non-blocking; failed persistence logs diagnostics and still returns the existing analytics route success when validation passed.
  - Public aggregate events stay unlinked from `user_id`, even with an auth cookie.
  - Public anonymous traffic is not joined to logged-in user profiles.
- Retention and sensitivity:
  - V1 migration stores sanitized rows only; detailed retention cleanup is explicitly deferred to the rollup/retention child slice.
  - Payloads may not store email, token, secret, password, cookie, raw URL, raw referrer, query string, IP, User-Agent, free text, notes, habit names, cart notes, shipping/payment/customer details, or nested objects.
- Cache/invalidation:
  - Ingestion and admin insights routes are dynamic/no-store.
  - Admin insights response includes `generatedAt`, `rangeDays`, `lastEventAt`, and cap/caveat fields.

## Identity And Rename Contract

- Canonical stable IDs:
  - `analytics_events.id` is the row identity.
  - `event_name` uses `AnalyticsEventName`.
  - `user_id` is optional and never attached to public aggregate client events.
  - Public route identity uses `route_template`, not raw URL.
  - Commerce identity uses canonical `productId`/`productType` when present in sanitized payloads.
- Human-readable identifiers:
  - Display labels, page titles, product titles, route slugs, and translated copy are not analytics identity.
- Mutability rules:
  - Event names and route/product IDs are stable contract values; labels may change without splitting identity.
- Rename vs repurpose:
  - Rename labels in place only when the underlying event/product/route meaning is unchanged.
  - Materially different business meaning requires a new event/dimension mapping and tests.
- Compatibility contract:
  - Deprecated/unmapped values remain queryable as historical rows but unknown future values must fail closed or use explicit safe fallback fields.
- Observability and repair:
  - Admin insights reports capped reads and last event timestamp so missing/freshness issues are visible.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics events, public routes/templates/categories, product IDs/types, checkout/entitlement events, admin insight metrics.
- Source of truth:
  - Events come from `ANALYTICS_EVENT_NAMES`; public route/product dimensions come from the public analytics registry and canonical catalog/Stripe payloads when available.
- Additive behavior:
  - New approved event names can persist automatically once added to the typed event list and sanitizer contract.
  - New public pages/products can be counted through existing route/product payload helpers when they emit safe route/product dimensions.
- Explicit mapping requirements:
  - New public route categories, new vendor forwarding, rollups/retention cleanup, dashboard UI, CSV export, finance reporting, and any public-to-user bridge require explicit brief/code/docs/tests.
- Unknown or deprecated values:
  - Invalid event names are rejected.
  - Unsafe payload keys/values are stripped/redacted before persistence.
  - Unknown route/product dimensions remain `null` or not counted rather than using raw labels.
- Test/evidence:
  - Persistence mapping tests for future-safe dimensions and unsafe payload stripping.
  - Route tests proving public events keep `userId: null`, admin endpoint fails closed, and read caps are explicit.

## Help/Guide Impact

N/A with rationale: V1 adds no visible admin/user workflow, label, recovery behavior, or Help/Guide surface. Later dashboard UI or operational support flows must update Help/Guide/runbooks in that PR.

## Route, Label, And Support-Surface Sweep

Required because analytics API contracts and admin support diagnostics change. Sweep at minimum: `app/`, `components/`, `lib/analytics/`, `tests/`, `docs/api-contracts.md`, `docs/runbooks/`, and active/planned/deferred analytics briefs for `analytics_events`, `/api/analytics/event`, `/api/admin/analytics/insights`, `public_page_viewed`, `checkout_started`, `checkout_completed`, `entitlement_granted`, `Plausible`, `GA4`, `Meta`, `Hotjar`, and `Clarity`.

- Identifiers searched: `analytics_events`, `/api/analytics/event`, `/api/admin/analytics/insights`, `public_page_viewed`, `checkout_started`, `checkout_completed`, `entitlement_granted`, `Plausible`, `GA4`, `Meta`, `Hotjar`, and `Clarity`.
- Surfaces checked: `app/`, `components/`, `lib/analytics/`, `tests/unit/`, `docs/api-contracts.md`, `docs/runbooks/`, `docs/architecture/`, and active/planned/deferred analytics briefs.
- Fallout handled: API contract docs, data-access/authz/cache registry, external-service matrix, public analytics privacy assessment, deferred analytics brief, and active implementation brief are updated in this PR.

## Failure-Mode Evidence

- No unexpected 500 behavior is introduced for expected request failures:
  - `/api/analytics/event` keeps `415` for unsupported content type, `400` for invalid JSON/name, and `200` for accepted sanitized events even if persistence fails soft.
  - `/api/admin/analytics/insights` keeps `401` unauthenticated, `403` forbidden, `200` with `schemaReady: false` when the migration is missing, and only uses `500` for unexpected read failures.
- Failure-mode tests cover unauthenticated admin access, missing schema guidance, bounded admin reads, Supabase insert rejection, unsafe dimension stripping, and public aggregate no-user persistence.

## Scope

- Add additive Supabase migration for `analytics_events`.
- Add typed persistence/insights helpers under `lib/analytics/`.
- Persist sanitized client ingestion events from `/api/analytics/event`.
- Persist key server commerce/funnel events already emitted from checkout/webhook/entitlement paths.
- Add admin-only JSON insights route under `/api/admin/analytics/insights`.
- Update tests, API/docs/runbook references, and generated DB contracts.

## Out Of Scope

- Plausible, Simple Analytics, GA4, Meta, GTM, Hotjar, Clarity, pixels, tag managers, cookies, localStorage visitor IDs, session replay, heatmaps, or ad retargeting.
- Full admin Users module.
- Rendered admin analytics dashboard, charts, CSV export, or visible admin tab.
- Public anonymous traffic to user-profile bridge.
- Detailed cart, shipping, payment, raw Stripe customer data, video analytics, full clickstream, or private habit/note/profile content.
- Retention cleanup job and materialized rollups beyond V1 bounded reads.
- Finance reconciliation or revenue-recognition reporting.

## Acceptance Criteria

1. Sanitized analytics events persist best-effort to `analytics_events` without blocking user flows.
2. Public aggregate client events still store `user_id = null` even when an auth cookie exists.
3. Unsafe payload keys/values are stripped or redacted before persistence.
4. Admin insights route requires viewer+ admin auth and fails closed for unauthenticated/forbidden users.
5. Admin insights response includes date range, event counts, public/client/server split, product/route summaries, latest event timestamp, and capped-read caveat.
6. Migration is additive with RLS and indexes.
7. No third-party analytics vendor or browser tracking storage is added.
8. API/docs/briefs describe deferred dashboard/rollup/retention work.

## Validation

- Targeted Vitest:
  - `tests/unit/analytics-events.test.ts`
  - `tests/unit/analytics-event-route.test.ts`
  - new analytics persistence/admin insights tests
- `npm run typecheck`
- `npm run lint:briefs:all`
- `npm run lint:quality-gates`
- `git diff --check`
- `npm run verify:pre-pr`
- PR CI
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-09 | in-progress | started from clean synced main@addea9e0 after PR #1041 and closeout #1042; owner explicitly said implement Privacy-safe Analytics Persistence And Admin Insights V1; branch analytics-persistence-admin-insights-v1 created; scope narrowed to non-visual persistence plus admin-only JSON insights endpoint | next: implement migration, typed helpers, route persistence, admin insights route, docs, and targeted tests`
- `2026-06-09 | implemented + targeted validation | added additive analytics_events migration/RLS/indexes, typed persistence and admin insights helpers, fail-soft event persistence for client ingestion plus checkout/webhook commerce events, admin-only insights JSON route, API/architecture/runbook docs, generated DB contract, and targeted tests; validation passed: targeted Vitest 6 files / 27 tests, npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, git diff --check | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-06-09 | remote migration applied | initial npm run verify:pre-pr correctly failed on pending Supabase migration drift for 20260609183000_analytics_events_persistence.sql; applied the additive linked Supabase migration with npx supabase db push --linked, which completed successfully with only the expected first-run drop-policy notice | next: rerun npm run verify:pre-pr`
- `2026-06-09 | pre-pr pass + noise hardening | npm run verify:pre-pr passed after remote migration sync, including full lane unit/build/perf/E2E with expected local dummy Supabase auth skips; observed analytics persistence fail-soft noise against example.com during E2E and added an example Supabase URL skip so dummy backend runs stay quiet while localhost/real Supabase still persists; validation passed: npm exec vitest run tests/unit/analytics-persistence.test.ts tests/unit/analytics-event-route.test.ts tests/unit/admin-analytics-insights.test.ts tests/unit/supabase-env.test.ts (4 files / 25 tests) | next: rerun npm run verify:pre-pr after the final guard change`
- `2026-06-09 | final pre-pr gate green | npm run verify:pre-pr passed on full lane after the example Supabase URL guard; evidence artifact: artifacts/test-runs/20260609-181720/verify.log; covered migration drift, quality gates, lint, typecheck, 233 unit files / 1466 tests, build, perf budgets (PASS, hold recommendation), and Playwright E2E 106 passed / 530 expected local dummy-auth skips | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
