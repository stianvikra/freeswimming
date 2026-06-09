# Task Brief: Workout Builder Funnel Instrumentation V1 (10/10)

## Metadata

- `id`: `2026-06-09-workout-builder-funnel-instrumentation-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-09`
- `updated`: `2026-06-09`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `execution_mode`: `end-to-end`
- `branch`: `workout-builder-funnel-instrumentation-v1`

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: clean synced `main@d4ef5331` after PR `#1047` and repo-managed closeout PR `#1048`
- `audit_status`: `ready`
- `decision`: Execute this bounded child instead of the full legacy AW-022 commercial funnel brief.
- `reason`: First-party analytics persistence, admin dashboard, and rollup lifecycle are now shipped. The next smallest useful commercial-analytics step is to instrument workout-builder start/save behavior without changing CTAs, checkout, pricing, exports, vendors, or dashboard architecture.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, verification lanes, `ANALYTICS_EVENT_NAMES`, `/api/analytics/event`, `lib/analytics/persistence.ts`, workout save routes, manual workout builder entrypoints, admin analytics dashboard contract, public analytics privacy docs, or route/label/support sweep rules change before PR handoff.

## Goal

Persist privacy-safe first-party events for the first workout-builder funnel slice: manual builder start and canonical workout save/update.

## Pre-Implementation Owner Explanation

Vi maaler hvor folk faktisk starter, lager, lagrer og oppdaterer treningsokter for vi legger inn nye salgs- eller upsell-grep. Det betyr at kommersielle valg senere kan bygge paa reelle data, ikke antakelser. Utenfor scope er nye CTA-er, pris/checkout-endringer, CSV-export, finance-rapportering, tredjeparts analytics, scheduled deletion og kobling av anonym trafikk til brukerprofiler.

Forward-compatibility-intent: nye workout-maler, builder-entrypoints og fremtidige workout-kilder skal kunne bruke samme stabile funnel-steg og trygge ID-er; nye kommersielle plasseringer, KPI-moduler eller route-kategorier krever eksplisitt mapping, brief og tester.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-022 has a bounded child that measures builder start/save before any commercial CTA or upsell behavior changes.                                                         | active brief + parent checkpoint               | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: existing builder flows and feedback remain unchanged; analytics failures must not block navigation or save actions.                                      | component/API tests + diff review              | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because no rendered UI, style, layout, print, brand, screenshot, or visible workflow copy changes are in scope.                                                       | explicit visual scope rationale                | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Start event fires only after a valid manual builder href is prepared; save event fires only after successful canonical create/update.                                     | component + route tests                        | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin dashboard can see the new event names through existing top-event lists; no admin edit/export workflow changes.                                     | dashboard view-model label test + scope review | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no keyboard flow, focus order, label, contrast, semantic markup, or rendered state changes.                                                                   | explicit a11y scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Client start analytics is best-effort/keepalive and server save persistence remains fail-soft without adding dependencies or heavy payloads.                              | analytics tests + full verify                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics events remain server-canonical in `analytics_events`; client/local builder state remains unchanged and does not store analytics state.                          | data contract + tests                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: analytics event route and workout save routes stay no-store; admin insights continue no-store reads.                                                     | route contract review                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Analytics failure cannot block builder navigation or workout save responses; invalid save paths do not emit successful save events.                                       | negative-path tests                            | `5/5`                   |
| Security and authz                            | `target`     | Workout save events remain behind existing authenticated owner routes; unauthenticated/invalid requests fail closed and emit no save event.                               | route auth/negative tests                      | `5/5`                   |
| Privacy and compliance                        | `target`     | Payloads include only safe workflow dimensions and aggregate counts; no title, notes, raw URL, email, IP, user agent, payment data, or raw workout text.                  | payload helper tests + privacy docs            | `5/5`                   |
| Content governance                            | `target`     | Event taxonomy and interpretation caveats are documented in API/analytics docs and parent brief status.                                                                   | docs diff + route/label/support sweep          | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow labels, buttons, role model, or edit behavior changes.                                                                                 | Help/Guide impact rationale                    | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, or crawler-facing content changes.                                                                 | explicit SEO scope rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-facing crawl surface changes.                                                                              | explicit AI-discoverability scope rationale    | `N/A`                   |
| Analytics and KPI observability               | `target`     | New typed events expose `workout_builder_started` and `workout_builder_saved` with stable safe dimensions for dashboard/event-count rollups.                              | analytics/event/route tests + admin label test | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: this provides pre-commerce builder funnel signals without changing Stripe, checkout, entitlement, pricing, refund, payout, invoice, or accounting truth. | commerce scope review                          | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: failures use existing analytics persistence diagnostics; no new alert, runbook, or support workflow is introduced.                                       | diagnostics scope rationale                    | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: builder events are product signals, not finance reconciliation, revenue recognition, payout, refund, invoice, or accounting data.                        | explicit finance scope rationale               | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: event identity is typed English machine names; future visible labels or locale dashboards need explicit mapping.                                         | event-label fallback test + scope rationale    | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing analytics client, persistence, workout routes, TypeScript helpers, and Vitest tests; add no dependency or vendor.                                          | changed-files review + package diff            | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted analytics helper, client entry, route success/negative-path, and dashboard label tests pass before full `verify:pre-pr`.                                         | targeted Vitest + full gates                   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: two low-cardinality event names and bounded scalar payload fields avoid high-cardinality cost growth.                                                    | payload contract review                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration or external service change; rollback is revert of event names/call sites/docs.                                                                               | diff review + PR summary + verify gates        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `CreateManualWorkoutButton` for manual builder start instrumentation.
  - Use existing `/api/analytics/event` client event route through `sendClientAnalyticsEvent`.
  - Reuse existing authenticated workout save routes for server-side save instrumentation.
  - No rendered UI route, layout, or cache behavior changes.
- TypeScript/domain contracts:
  - Add typed event names to `ANALYTICS_EVENT_NAMES`.
  - Add a narrow `lib/analytics/workout-builder.ts` helper so payload shape is explicit and testable.
  - Unknown future builder values must fall back to safe strings rather than raw free text.
- Supabase/data layer:
  - No migration. Existing `analytics_events` persistence stores sanitized event rows.
  - Workout save auth/RLS boundary remains unchanged.
- External services/tools:
  - No Plausible, GA4, Meta, Hotjar, Clarity, tag manager, cookie, visitor ID, webhook, SDK, or secret change.
  - Stripe/checkout are explicitly out of scope.
- UI system:
  - No visual/UI implementation; no screenshot handoff required.
  - Admin dashboard event labels may recognize the two new machine event names through existing view-model formatting only.
  - Session-step reference contract: this slice does not change `docs/design/session-step-surface-contract.md`, the shared renderer, step display models, workout editor markup, or session-step UX semantics; it only reads validated `SessionDraft` scalar dimensions for analytics payloads.
- Testing:
  - Unit tests for payload helper and analytics taxonomy.
  - Component test for client start event.
  - Route tests for successful create/update event emission and no emission on unauth/invalid/not-found paths.
  - Admin dashboard view-model label test.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted analytics rows in `analytics_events`.
  - Canonical saved workouts remain in `workouts`.
- Local/browser:
  - Existing local manual workout drafts remain unchanged.
  - No analytics visitor ID, localStorage analytics key, cookie, or admin preference is added.
- Sync behavior:
  - `workout_builder_started` is best-effort client telemetry and may be duplicated on retry; it is not business truth.
  - `workout_builder_saved` is emitted server-side only after successful create/update.
  - Analytics persistence failures fail soft and must not roll back workout saves.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Payloads must not include workout title, notes, raw URL/referrer, email, IP, User-Agent, payment data, cart data, or raw workout free text.
- Cache/invalidation:
  - Analytics event route and admin insights remain no-store.
  - Workout save route responses remain no-store.

## Identity And Rename Contract

- Canonical stable ID:
  - Event identity is `event_name`: `workout_builder_started` and `workout_builder_saved`.
  - Workout row ID is intentionally not copied into the analytics payload in V1 to minimize private cross-linking.
- Human-readable identifiers:
  - Admin dashboard labels are display-only and may be renamed without changing event identity.
- Mutability rules:
  - Event names are append-only once shipped; repurposing requires a new event name or alias/migration brief.
- Rename vs repurpose:
  - Renaming dashboard copy is allowed; changing what a builder event means is a repurpose and requires a new brief.
- Compatibility contract:
  - Unknown future event names remain visible through the existing dashboard fallback label.
- Observability and repair:
  - Unexpected or deprecated event names appear in admin event counts and rollups through generic identifiers.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Builder modes, workout source kinds, session environments, session types, size modes, save kinds, analytics payload fields, admin dashboard labels, and future product/upsell funnel modules.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Workout source kinds come from `WORKOUT_SOURCE_KINDS`.
  - Session dimensions come from the canonical `SessionDraft` fields after normal workout validation.
- Additive behavior:
  - Future workout source kinds and session types can still be counted through the same `workout_builder_saved` event if they provide canonical draft dimensions.
  - Admin top-event lists continue to show unknown safe event identifiers even before a custom label is added.
- Explicit mapping requirements:
  - New commercial CTA placement, upsell events, dedicated builder funnel dashboard modules, route-category reporting, CSV/export formats, finance-grade reporting, vendor forwarding, and public-to-user profile bridges require explicit brief/code/docs/tests and owner decision.
- Unknown or deprecated values:
  - Unknown builder/source/session values are serialized only as safe scalar dimensions and otherwise fall back to `unknown`.
  - Unsafe/unmapped values are dropped by the analytics sanitizer/persistence dimension guard.
- Test/evidence:
  - Tests include future-safe source/session fixtures, invalid/no-emission save paths, and dashboard label fallback/known-label assertions.

## Help / Guide Impact

N/A with rationale: this slice adds invisible analytics instrumentation only. It changes no admin/user workflow labels, buttons, tabs, recovery paths, Help/Guide surfaces, runbooks, or support procedures. If a future slice adds a visible builder funnel dashboard module, CSV export, or support workflow label, Help/Guide must be updated in that PR.

## Screenshot / Visual Impact

No screenshot artifact handoff required with rationale: this slice changes no rendered markup, CSS, layout, print, brand, responsive behavior, visible button/card text, or user-facing workflow state. `CreateManualWorkoutButton` is touched only to call the existing analytics client after a valid href is prepared; its rendered output remains unchanged.

- Screenshot artifacts: N/A because there is no visual/rendering delta to capture.
- Screenshot comparison naming: N/A; no `before/after` or `after/reference` screenshot set is required for this non-visual analytics instrumentation.
- Owner screenshot approval stop: N/A because there is no visual review stop for this scope.

## Route / Label / Support Surface Sweep

Required because analytics taxonomy and API/docs contracts change.

Search at minimum:

- `workout_builder_started`
- `workout_builder_saved`
- `Workout Builder Funnel`
- `workout-builder funnel`
- `analytics_events`
- `ANALYTICS_EVENT_NAMES`
- `/api/analytics/event`
- `/api/my-library/workouts`
- `workout commercial`
- `finance reconciliation`
- `CSV export`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/workouts/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/deferred/done analytics and AW-022 briefs.

Identifiers searched on `2026-06-09`: `workout_builder_started`, `workout_builder_saved`, `Workout Builder Funnel`, `workout-builder funnel`, `analytics_events`, `ANALYTICS_EVENT_NAMES`, `/api/analytics/event`, `/api/my-library/workouts`, `workout commercial`, `finance reconciliation`, and `CSV export`.

Surfaces checked: `app/`, `components/`, `lib/analytics/`, `lib/workouts/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, active task briefs, planned AW-022 brief, deferred analytics parent brief, and relevant done analytics briefs.

Fallout handled: new typed event names, workout-builder payload helper, client start call, authenticated workout create/update save calls, admin dashboard event-label formatting, API contract, data-access/authz/cache registry, external-service matrix, public analytics privacy assessment, analytics parent pointer, AW-022 parent pointer, targeted tests, and this active brief. No Help/Guide UI, route rename, visible admin workflow, vendor, cookie, export, finance, checkout, pricing, or scheduled retention fallout was required.

## Failure-Mode Evidence

- No unexpected 500 behavior is introduced for expected analytics instrumentation failures:
  - `sendClientAnalyticsEvent` remains best-effort and catches client fetch failures without blocking builder navigation.
  - `trackAndPersistAnalyticsEvent` uses existing fail-soft analytics persistence; workout save success is not rolled back by analytics insert failure.
  - `/api/my-library/workouts` still returns `401` for unauthenticated users, `400` for invalid payloads, `503` for missing workout schema, and `500` for actual workout insert failures.
  - `/api/my-library/workouts/[workoutId]` still returns `400` for invalid IDs/body, `401` for unauthenticated users, `404` for not-found owner-scoped rows, `503` for missing workout schema, and `500` for actual workout update failures.
- Successful-save analytics events are emitted only after the canonical workout create/update returns data.
- Negative-path route tests prove unauthenticated, invalid, validation-failed, and not-found paths do not emit `workout_builder_saved`.

## Scope

- Add typed workout-builder funnel event names.
- Add safe payload helper for builder start/save dimensions.
- Emit a client event for valid manual builder start.
- Emit a server event after successful canonical workout create/update.
- Add targeted tests and update analytics/API/architecture/parent docs.

## Out Of Scope

- New UI, visual design, screenshots, chart modules, admin controls, raw-event drilldown, CSV export, BI warehouse, finance-grade reporting, revenue recognition, refunds, payouts, invoice reconciliation, or accounting workflows.
- Third-party analytics vendors, pixels, tag managers, cookies, localStorage visitor IDs, session replay, heatmaps, ad retargeting, consent UI, or public analytics vendor activation.
- New commercial CTA placement, upsell copy, pricing, checkout, entitlement, Stripe, or product catalog changes.
- Automatic scheduled retention jobs or pruning production data.
- Linking anonymous public traffic to user profiles.
- Workout data model migrations or changes to builder UX/save semantics.
- Merge to `main` without explicit owner approval.

## Acceptance Criteria

1. `workout_builder_started` is typed, safe, and emitted only when a manual builder href is successfully prepared.
2. `workout_builder_saved` is typed, safe, and emitted only after successful authenticated create/update.
3. Analytics payloads include stable low-cardinality dimensions and exclude titles, notes, raw URLs, emails, IPs, user agents, payment/cart data, and raw workout text.
4. Unauthenticated, invalid, validation-failed, schema-missing, failed insert/update, and not-found save paths do not emit successful save events.
5. Existing builder navigation/save behavior remains unchanged and analytics failure remains fail-soft.
6. Docs explain V1 event meaning and keep commercial/finance/export/vendor boundaries explicit.
7. Targeted tests and full gates pass.

## Validation

Targeted:

- `npm exec vitest run tests/unit/workout-builder-analytics.test.ts tests/unit/analytics-events.test.ts tests/unit/analytics-persistence.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/create-manual-workout-button.test.tsx tests/unit/workouts-routes.test.ts`
- `npm run typecheck`
- `npm run lint:briefs`
- `npm run lint:quality-gates`
- route/label/support-surface sweep listed above
- `git diff --check`

Broad gates:

- `npm run verify:pre-pr` - passed `2026-06-09 23:24 CEST`; full lane selected, branch current with `origin/main`, build passed, perf budgets passed with hold recommendation, Playwright E2E passed `106` and skipped `530`, and `[verify-open] PASS`.
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Canonical source of truth:
  - this brief path and branch `workout-builder-funnel-instrumentation-v1`.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Implementation flow:
  - branch from clean synced `main`,
  - active brief in `in-progress`,
  - implement scoped analytics/docs/tests,
  - run targeted validation,
  - run `npm run verify:pre-pr`,
  - commit, push, open/update PR,
  - monitor CI,
  - run `npm run verify:pre-merge`,
  - summarize merge readiness without merging.

## Automation Mode

Automation-first after owner explicitly said `implementer Workout Builder Funnel Instrumentation V1`. The assistant owns implementation, tests, git, PR prep, CI monitoring, and merge-readiness summary unless blocked by sandbox approval, credentials, missing context that cannot be safely discovered, or a real product decision.

## PR Browser Rule

Use the repo-standard Safari PR flow, preferably `npm run pr:create:safari`, unless owner explicitly requests otherwise.

## Checkpoint Log

- `2026-06-09 | in-progress | owner explicitly said implementer Workout Builder Funnel Instrumentation V1; branch workout-builder-funnel-instrumentation-v1 created from clean synced main@d4ef5331 after PR #1047/#1048; scope is first-party workout-builder start/save analytics only, without UI, checkout, pricing, export, vendor, scheduled job, or finance changes | next: implement analytics helper/event names/client/server call sites/docs/tests, then run targeted validation`
- `2026-06-09 | implemented + targeted validation | added typed workout_builder_started/workout_builder_saved events, workout-builder payload helper, client manual-builder start event, server-side successful create/update save event, admin dashboard event labels, API/architecture/privacy/parent docs, and targeted tests; validation passed: targeted Vitest 6 files / 37 tests, npm run typecheck, npm run lint:quality-gates, npm run lint:briefs:all, git diff --check, and route/label/support sweep for workout_builder_started, workout_builder_saved, Workout Builder Funnel, workout-builder funnel, analytics_events, ANALYTICS_EVENT_NAMES, /api/analytics/event, /api/my-library/workouts, workout commercial, finance reconciliation, and CSV export | next: run npm run verify:pre-pr`
- `2026-06-09 | pre-pr gate passed | npm run verify:pre-pr passed at 23:24 CEST on the full lane; branch was current with origin/main, build passed, performance budgets passed with hold recommendation, Playwright E2E passed 106 and skipped 530, and [verify-open] PASS; no visual/rendering files changed after the non-visual analytics instrumentation, so screenshot handoff remains N/A for this slice | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
