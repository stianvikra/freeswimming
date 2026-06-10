# Task Brief: Workout Builder Source Breakdown Dashboard V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-10`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-builder-source-breakdown-dashboard-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: branch `workout-builder-source-breakdown-dashboard-v1` from clean synced `main@f68a9554` with parent brief refresh carried into this implementation workstream
- `audit_status`: `ready`
- `decision`: Execute this bounded child after owner said `mplementer Workout Builder Source Breakdown Dashboard V1` on `2026-06-10`.
- `reason`: PR `#1049` persists privacy-safe `workout_builder_started`, `workout_builder_saved`, and existing generator events such as `session_draft_generated`; PR `#1051` provides the Admin Analytics dashboard pattern. The owner explicitly requested implementation, and the scope remains bounded to read-only Admin Analytics source breakdown without checkout, CTA, export, finance, vendor, or builder/generator UX behavior changes.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, verification lanes, `ANALYTICS_EVENT_NAMES`, `lib/analytics/workout-builder.ts`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, `/api/admin/analytics/insights`, `session_draft_generated` instrumentation, workout save payloads, Admin Help/Guide, route/label/support sweep rules, or parent brief scope change before implementation starts.

## Goal

Admin Analytics shows a compact read-only source breakdown that separates manual builder starts/saves from generated-session drafts/saves for the selected range.

## Pre-Implementation Owner Explanation

Vi lager en plan for neste lille dashboard-steg, ikke kode enna. Malet er at Admin Analytics skal kunne vise om lagrede swim sessions kommer mest fra manuell builder eller fra AI-genererte utkast. Det betyr bedre produktbeslutninger for vi vurderer CTA, checkout eller betalt flyt. Utenfor scope er nye events hvis eksisterende data holder, nye kommersielle plasseringer, Stripe, priser, export, finance-rapportering, tredjeparts analytics og endringer i selve builder/generator-opplevelsen.

Forward-compatibility-intent: nye builder-kilder og generator-steg skal vises trygt som generiske event-rader eller som `Unknown` i breakdown til de far eksplisitt mapping, Help/Guide-kopi og tester. Nye produkter, CTA-er, checkout-steg, export-formater eller finance-tolkninger krever egen child-brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                   | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics answers one question only: manual builder vs generated-session contribution to starts/drafts and saves for the selected range.                                                       | insights/view-model/component tests + screenshot handoff  | `5/5`                   |
| UX flow clarity                               | `target`     | Module is read-only, range-aware, and explains source counts without implying unique-user, checkout, revenue, or finance conversion.                                                                 | component tests + Help/Guide assertions + screenshot QA   | `5/5`                   |
| Visual design quality                         | `target`     | UI reuses existing Admin Analytics KPI/card/list language and fits desktop/mobile without clipped, overlapping, or unstable metric text.                                                             | after/reference screenshot handoff                        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Counts use only explicitly mapped event names and safe dimensions: manual starts, generated drafts, manual saves, generated saves, unknown saves, and source-specific rates with safe zero handling. | admin insights/view-model tests                           | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin Analytics remains read-only; no admin edit/config workflow changes.                                                                                                           | admin scope rationale                                     | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Module heading, source labels, counts, rates, caveats, and non-happy states have accessible names and preserve keyboard/screen-reader flow.                                                          | Testing Library assertions + screenshot/keyboard QA       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No chart dependency, vendor script, new route, or extra client fetch; server-side derivation remains bounded by the existing admin insights row cap.                                                 | dependency diff + build/perf gate                         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics rows remain server-canonical; selected range remains local/query-only; this slice writes no events, preferences, cookies, visitor IDs, or dashboard state.                                 | data-boundary review + tests                              | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing no-store Admin Analytics read behavior remains unchanged; range changes refetch the same endpoint and do not cache stale source breakdown values.                                           | route/component review + tests                            | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing/malformed payload dimensions, zero denominators, duplicate telemetry, capped reads, schema-missing, no-data, and fetch failures render deterministic safe states.                            | zero/unknown/capped/schema/error tests                    | `5/5`                   |
| Security and authz                            | `target`     | Dashboard stays behind existing admin viewer+ boundary and no new API or wider data access is introduced.                                                                                            | auth boundary review + existing route tests where touched | `5/5`                   |
| Privacy and compliance                        | `target`     | Module renders aggregate counts/rates only and never exposes raw payload JSON, workout titles, notes, raw URLs, emails, IPs, user agents, user IDs, payment data, or workout row IDs.                | unsafe-field tests + privacy review                       | `5/5`                   |
| Content governance                            | `target`     | Help/Guide explains source breakdown meaning and distinguishes product telemetry from unique-user, checkout, Stripe, finance, and export truth.                                                      | Help/Guide diff + assertion                               | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin edit workflow changes; labels must be clear enough for read-only inspection and support handoff.                                                                           | Help/Guide impact review                                  | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes only a protected admin dashboard and no public route, metadata, sitemap, robots, canonical URL, or crawlable content.                                                       | explicit SEO scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic content, structured data, public entity page, or AI-facing crawl surface.                                                                                   | explicit AI-discoverability scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Admin can compare manual starts/saves and generated drafts/saves for the selected range without raw SQL, JSON, or top-event interpretation.                                                          | insights/view-model/component tests + screenshot handoff  | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: source breakdown is pre-commerce product telemetry and must not be labeled as checkout conversion, revenue attribution, entitlement truth, pricing signal, or finance truth.        | commerce boundary review + Help/Guide caveat              | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing dashboard trust states remain the support diagnostic path; no new alert or incident workflow is required.                                                                  | support-surface sweep + scope rationale                   | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reconciliation, revenue recognition, payout, refund, invoice, accounting export, or Stripe reporting surface changes.                                                    | explicit finance scope rationale                          | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: visible labels stay short and structurally localizable; future localized admin copy requires explicit mapping when locale infrastructure exists.                                    | copy/layout review + scope rationale                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Admin Analytics component, view-model contracts, admin insights route, analytics helpers, and tests; add no dependency or vendor.                                                     | changed-files review + package diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted admin insights/view-model/component tests, Help/Guide assertion, screenshot handoff, and full pre-PR/pre-merge gates cover the slice.                                                       | targeted tests + screenshot artifacts + verify gates      | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Uses existing bounded analytics reads over low-cardinality event names/dimensions; no materialized view, export job, warehouse query, or chart bundle is added.                                      | query/view-model review + dependency diff                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/env/provider/job change; rollback is a revert of dashboard/view-model/docs/tests only.                                                                                                  | PR summary + verify gates + rollback note                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx`.
  - Do not add a new route, dashboard tab, modal, chart library, raw-event drilldown, export action, or dashboard builder.
  - Preserve the existing client range/retry boundary and `/api/admin/analytics/insights` no-store fetch behavior.
- TypeScript/domain contracts:
  - Add a narrow typed source-breakdown shape in `lib/analytics/admin-insights.ts` and `lib/analytics/admin-dashboard.ts`.
  - Derive manual starts from current `workout_builder_started` semantics, which V1 emits only from manual builder entries.
  - Derive generated drafts from `session_draft_generated`.
  - Derive manual/generated saves from `workout_builder_saved` safe payload `sourceKind` values:
    - `manual`
    - `ai_session_v1`
  - Track malformed/missing/unmapped `sourceKind` as `unknown` or `unmapped`, not as manual or generated.
  - Source rates:
    - manual save rate = manual saves / manual starts.
    - generated save rate = generated-session saves / generated drafts.
    - render `Not counted` when denominator is `0`.
  - Do not reinterpret counts as unique users, workout quality, checkout conversion, entitlement truth, revenue, or finance reporting.
- Supabase/data layer:
  - No migration, RLS, generated database type, retention, rollup, or query expansion beyond reading already-sanitized analytics event rows through the existing admin insights endpoint.
  - If implementation reads the sanitized `payload` JSON server-side to inspect `sourceKind`, raw payload JSON must remain server-only and never be returned to Admin UI.
  - Existing admin viewer+ auth boundary remains the only data access path.
- External services/tools:
  - No Plausible, GA4, Meta, Hotjar, Clarity, tag manager, cookie, visitor ID, webhook, SDK, Stripe, checkout, finance, or secret change.
- UI system:
  - Reuse existing Admin Analytics metric/list/card styling and `AdminManagerState` trust states.
  - Use compact operational copy; no tutorial, marketing, or CTA language.
  - Screenshot comparison type: `after/reference`, comparing changed Admin Analytics dashboard to current Admin Analytics/admin workspace reference.
- Testing:
  - Unit tests for insights/view-model source derivation, zero denominators, unknown future source kinds, malformed/missing payload values, capped/no-data/schema-missing states, and no unsafe raw field rendering.
  - Component tests for rendered module, accessible labels, range-aware text, and no export/edit/checkout affordance.
  - Help/Guide assertion for interpretation copy.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows and aggregate `/api/admin/analytics/insights` response.
- Server-only derived data:
  - Source breakdown derived from event name plus safe persisted dimensions/payload values.
  - Raw payload JSON must not be returned to the browser.
- Local/browser:
  - Existing dashboard range UI state only.
  - No analytics event write, browser storage key, visitor ID, cookie, admin preference, or source-breakdown persisted state is added.
- Sync policy:
  - Dashboard loads and refetches bounded aggregate data for the selected range.
  - Failed reads show existing retry behavior and do not infer fallback counts.
  - Missing or malformed `sourceKind` values are counted as unknown/unmapped rather than reassigned.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - The module must not display raw payload JSON, workout titles, notes, raw URLs/referrers, emails, IPs, user agents, user IDs, payment/cart/shipping data, Stripe customer IDs, visitor IDs, or workout row IDs.
- Cache/invalidation:
  - Preserve no-store dashboard/API reads.
  - Freshness and capped caveats remain visible through existing dashboard health state.

## Identity And Rename Contract

- Canonical stable ID:
  - Event identity is `event_name`: `workout_builder_started`, `workout_builder_saved`, and `session_draft_generated`.
  - Source identity for saves is safe payload `sourceKind`: `manual` or `ai_session_v1`.
- Human-readable identifiers:
  - Dashboard labels such as `Manual builder`, `Generated drafts`, `Manual saves`, and `Generated saves` are display-only and may be renamed without changing event/source identity.
- Mutability rules:
  - Shipped event names and source kind meanings are append-only; changing event/source meaning requires a new event/source or explicit migration/alias brief.
- Rename vs repurpose:
  - Label rename is allowed when meaning is unchanged.
  - Counting a materially different workflow as manual or generated is repurpose and requires a new brief.
- Compatibility contract:
  - Unknown future event names continue to appear in generic top-event lists.
  - Unknown future `sourceKind` values appear as unknown/unmapped and are not included in manual/generated source-specific rates until mapped.
- Observability and repair:
  - Zero or missing source data renders as zero/`Not counted`, not hidden success.
  - Capped/stale/schema-missing/fetch-failed states remain visible so admin can separate quiet traffic from data collection issues.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics event names, builder source kinds, generator stages, builder modes, save kinds, admin metric labels, range options, Help/Guide copy, future locale copy, export formats, commerce funnel modules, and future product IDs.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Save source kinds come from `WORKOUT_SOURCE_KINDS`.
  - Counts come from `/api/admin/analytics/insights`, not client storage or hardcoded fixtures.
- Additive behavior:
  - New approved events continue to appear in generic top-event lists through existing formatting.
  - Existing manual/generated source breakdown keeps working while V1 event and `sourceKind` identities remain valid.
- Explicit mapping requirements:
  - New source kinds, generator stages, template usage, generated plan completion, upsell, checkout, CTA interaction, export, finance reporting, vendor forwarding, or public-to-user attribution require a new brief, mapping, docs, and tests.
- Unknown or deprecated values:
  - Unknown events render safely in generic lists and are not counted in the dedicated source breakdown until mapped.
  - Unknown/deprecated `sourceKind` values render as unknown/unmapped and are excluded from manual/generated source-specific rates.
- Test/evidence:
  - Include fixtures for manual-only, generated-only, mixed, zero denominator, unknown source kind, malformed payload, missing payload, capped/no-data/schema-missing states, and duplicate telemetry.

## Dashboard UX / Readability Contract

- Placement:
  - Add one compact source-breakdown module inside the existing Admin Analytics hierarchy.
  - Preferred placement: directly below or adjacent to the current Workout Builder funnel module, so starts/saves and source split are read together.
- Required values:
  - `Manual starts`: count of current `workout_builder_started` manual builder starts.
  - `Generated drafts`: count of `session_draft_generated`.
  - `Manual saves`: count of `workout_builder_saved` where `sourceKind = manual`.
  - `Generated saves`: count of `workout_builder_saved` where `sourceKind = ai_session_v1`.
  - `Manual save rate`: manual saves / manual starts, `Not counted` when manual starts are `0`.
  - `Generated save rate`: generated saves / generated drafts, `Not counted` when generated drafts are `0`.
  - Optional safe caveat: `Unknown saves` for missing, malformed, deprecated, or unmapped save source values.
- Required interpretation:
  - Label the module as product telemetry.
  - Make clear that duplicate drafts/saves can exist and rates are not unique-user conversion, checkout conversion, revenue, export success, Stripe reconciliation, or finance truth.
  - Preserve existing capped/schema-missing/no-data/fetch-failed states.
- Desktop/mobile requirements:
  - No horizontal scroll.
  - No clipped metric labels or rate text.
  - Keep metric dimensions stable when values change from `0` to large counts or `Not counted`.
  - Use lightweight CSS only; no chart library.

## Help / Guide Impact

Required because this changes visible admin analytics labels and interpretation.

- Update Admin Help/Guide or linked runbook with:
  - what manual starts, generated drafts, manual saves, generated saves, and source rates mean,
  - why duplicate telemetry can exist,
  - why the source breakdown is product telemetry only,
  - why it is not unique-user conversion, checkout conversion, revenue attribution, finance reporting, Stripe reconciliation, export success, or entitlement truth,
  - how empty/capped/stale/schema-missing/fetch-failed/unknown-source states should be interpreted.
- Add or update a Help/Guide assertion.

## Screenshot / Visual Impact

Required because this changes visible admin UI.

- Capture folder: `output/workout-builder-source-breakdown-dashboard-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-workout-builder-source-breakdown-dashboard-desktop.png`
  - `after-workout-builder-source-breakdown-dashboard-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - one non-happy state: `after-workout-builder-source-breakdown-dashboard-empty-desktop.png`, `after-workout-builder-source-breakdown-dashboard-capped-desktop.png`, `after-workout-builder-source-breakdown-dashboard-schema-missing-desktop.png`, or `after-workout-builder-source-breakdown-dashboard-unknown-source-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`.

Captured on `2026-06-10 12:58`:

- Artifact folder: `output/workout-builder-source-breakdown-dashboard-v1-2026-06-10-125853`.
- Handoff type: `after/reference`.
- Files:
  - `after-workout-builder-source-breakdown-dashboard-desktop.png`
  - `after-workout-builder-source-breakdown-dashboard-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - `after-workout-builder-source-breakdown-dashboard-schema-missing-desktop.png`
- Capture method: local Next dev on `http://127.0.0.1:3000` with a temporary dev-only Admin Analytics screenshot harness plus Playwright route fulfillment for `/api/admin/analytics/insights`; the harness and capture script were removed after artifact generation and are not part of the PR diff.
- Visual inspection: desktop and mobile source breakdown use the existing Admin Analytics panel language, no observed clipping/overlap/horizontal scroll, schema-missing state shows all source metrics as `Not counted`, and the reference image compares the existing Workout Builder funnel card style.
- Screenshot approval status: owner approved the screenshot handoff and merge-on-good-tests path on `2026-06-10`; no shipped visual/rendering files changed after capture.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this changes admin analytics labels and Help/Guide interpretation.

Search at minimum:

- `workout_builder_started`
- `workout_builder_saved`
- `session_draft_generated`
- `sourceKind`
- `saveKind`
- `builderMode`
- `WORKOUT_SOURCE_KINDS`
- `Workout builder`
- `Source breakdown`
- `Manual starts`
- `Generated drafts`
- `Manual saves`
- `Generated saves`
- `Admin Analytics`
- `analytics dashboard`
- `/api/admin/analytics/insights`
- `ANALYTICS_EVENT_NAMES`
- `finance reporting`
- `Stripe reconciliation`
- `CSV export`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/workouts/`
- `lib/session-generator-v1/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/deferred/done analytics, workout, commerce, AW-006, and AW-022 briefs.

Record executed identifiers, checked surfaces, fallout handled, and deferred fallout in this brief before `verify:pre-pr`.

Executed on `2026-06-10` before screenshot handoff:

- Identifiers searched: `workout_builder_started`, `workout_builder_saved`, `session_draft_generated`, `sourceKind`, `saveKind`, `builderMode`, `WORKOUT_SOURCE_KINDS`, `Workout builder`, `Source breakdown`, `Manual starts`, `Generated drafts`, `Manual saves`, `Generated saves`, `Admin Analytics`, `analytics dashboard`, `/api/admin/analytics/insights`, `ANALYTICS_EVENT_NAMES`, `finance reporting`, `Stripe reconciliation`, and `CSV export`.
- Surfaces checked: `app/`, `components/`, `lib/analytics/`, `lib/workouts/`, `lib/session-generator-v1/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, Help/Guide sources/assertions, and active/planned/blocked/done task briefs for analytics, workout, commerce, AW-006, and AW-022 references.
- Fallout handled in this slice: Admin Analytics view-model/UI labels, Admin Help/Guide interpretation copy, API contract, data-access/authz/cache contract, external service matrix, public analytics privacy runbook, parent brief checkpoint/status, and targeted unit/component assertions.
- Expected out-of-scope references only: existing workout save/generator instrumentation, workout route tests, generic sourceKind usage in non-workout domains, historical completed briefs, and explicit finance/Stripe/CSV exclusions.
- Deferred fallout: none for this slice. Future source kinds, generator stages, checkout/CTA/export/finance mappings, localized admin copy, or vendor forwarding still require their own explicit brief, mapping, Help/Guide copy, and tests.

## Scope

- Add a compact read-only Admin Analytics source-breakdown module using existing analytics rows and safe dimensions.
- Derive manual starts, generated drafts, manual saves, generated saves, source-specific save rates, and unknown/unmapped save source counts.
- Preserve existing range selection, refresh/retry behavior, admin-only access, no-store reads, trust states, row cap, and privacy boundary.
- Add targeted tests for insights, view-model, rendered dashboard, interpretation copy, and safe fallbacks.
- Update Help/Guide or linked runbook plus parent/child checkpoint as needed.
- Capture and hand off screenshots before pre-PR validation.

## Out Of Scope

- New analytics events unless existing data cannot safely answer the source split after implementation review.
- Changes to workout-builder start/save instrumentation unless required only for a safe bug fix discovered during implementation.
- New CTA, commercial placement, upsell copy, pricing, checkout, entitlement, Stripe, product catalog, or payment behavior.
- CSV/export, BI warehouse, finance-grade reporting, revenue recognition, refunds, payouts, invoices, accounting, or Stripe reconciliation.
- Third-party analytics vendors, scripts, pixels, cookies, visitor IDs, session replay, heatmaps, ad attribution, or public-to-user profile bridge.
- Raw event drilldown, delete/edit analytics, custom dashboard builder, chart dependency, materialized rollup, retention job, migration, RLS change, or generated database type update.
- Changes to workout creation/editing/saving/generation UX semantics.
- Merge to `main` without explicit owner approval.

## Acceptance Criteria

1. Admin Analytics renders a read-only source-breakdown module for the selected range.
2. Values are derived from explicitly mapped existing events and safe source dimensions only.
3. Manual/generated source-specific rates render clear safe fallbacks when denominators are `0`.
4. Unknown/malformed/missing source values are counted as unknown/unmapped and never reassigned to manual/generated.
5. Empty, capped, stale/quiet, schema-missing, fetch-failed, and duplicate telemetry states remain deterministic and visible.
6. The module never renders raw payload JSON or sensitive/private fields.
7. UI is responsive and accessible on desktop and mobile without clipped or overlapping text.
8. Help/Guide or linked runbook explains the interpretation boundary.
9. Screenshot handoff is owner-approved or explicitly waived before `npm run verify:pre-pr`.

## Validation

Brief creation:

- `npm run lint:briefs`
- `git diff --check`

Later implementation:

- targeted unit/component tests for `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, and `components/admin/AdminAnalyticsDashboard.tsx` as touched
- Help/Guide assertion update
- route/label/support-surface sweep listed above
- screenshot handoff with `after/reference` artifacts before `npm run verify:pre-pr`
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Implementation validation so far:

- `npm exec vitest run tests/unit/admin-analytics-insights.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx` passed on `2026-06-10` (`4` files, `21` tests).
- `npm run typecheck` passed on `2026-06-10`.
- Route/label/support-surface sweep above completed with no deferred same-slice fallout.
- `npm run lint:quality-gates`, `git diff --check`, and `npm run lint:briefs:all` passed on `2026-06-10`; `npm run lint:briefs` reported no changed task briefs in this branch/index shape, so all-brief lint was used as the validating fallback.
- Screenshot handoff artifacts were captured on `2026-06-10 12:58`; owner approved the screenshot handoff and merge-on-good-tests path on `2026-06-10`.
- `npm run verify:pre-pr` passed on `2026-06-10` on the full lane: branch current with `origin/main@f68a9554`, lint/typecheck/unit/build/performance budgets passed, and Playwright E2E passed with `106` passed / `530` skipped. Expected local auth-admin/dev-login Example Domain warnings were non-blocking and the gate result was `PASS`.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin?tab=analytics`
  - desktop Chromium screenshot
  - mobile viewport screenshot
  - one non-happy state screenshot through test harness or deterministic fixture if production data does not naturally provide it
- Vercel preview:
  - verify protected admin access, range switching, visible source-breakdown module, no raw payload rendering, and clear unknown/unmapped source interpretation.

## Session Continuity And Recovery

- Canonical source of truth:
  - this brief path and implementation branch once created.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Implementation flow:
  - branch created from clean synced `main`,
  - this brief moved to `in-progress`,
  - implement the bounded Admin Analytics source-breakdown UI/view-model/docs/tests slice,
  - run targeted tests,
  - pause after screenshot handoff,
  - after owner approval, run `npm run verify:pre-pr`,
  - commit, push, open/update PR, monitor CI,
  - run `npm run verify:pre-merge` before merge recommendation.

## Automation Mode

Automation-first only after owner explicitly says `implementer Workout Builder Source Breakdown Dashboard V1` or equivalent. The assistant owns implementation, tests, git, PR prep, CI monitoring, and merge-readiness summary unless blocked by sandbox approval, credentials, missing context that cannot be safely discovered, screenshot approval stop, or a real product decision.

## Branch Hygiene Defaults

- Post-merge:
  - sync `main`,
  - prune deleted refs,
  - run post-merge preflight,
  - complete any repo-managed docs-only closeout if surfaced and eligible,
  - perform mandatory chat-handoff assessment before starting another brief.

## PR Browser Rule

Use the repo-standard Safari PR flow, preferably `npm run pr:create:safari`, unless owner explicitly requests otherwise.

## Checkpoint Log

- `2026-06-10 | planned | created from clean synced main@f68a9554 with parent brief refresh in the same planning diff; scope is read-only Admin Analytics source breakdown for manual starts/saves and generated drafts/saves using existing privacy-safe first-party analytics data where possible; no CTA, checkout, export, finance, vendor, migration, or workout-builder/generator UX changes | next: wait for owner to explicitly say execute/build/implement before moving to in-progress and creating the implementation branch`
- `2026-06-10 | in-progress | owner said "mplementer Workout Builder Source Breakdown Dashboard V1"; branch workout-builder-source-breakdown-dashboard-v1 created from main@f68a9554, and this brief moved to in-progress with parent docs carried forward; scope remains read-only Admin Analytics source breakdown using existing safe first-party analytics data where possible | next: implement insights/view-model/UI/Help tests, run targeted validation and route-label-support sweep, then capture screenshot handoff before verify:pre-pr`
- `2026-06-10 | implemented + targeted validation | added source-breakdown aggregation, Admin Analytics view-model/UI panel, Help/Guide copy, API/architecture/privacy docs, parent checkpoint update, and targeted tests; validation passed: targeted Vitest 4 files / 21 tests, npm run typecheck, and route/label/support sweep for the listed source/funnel/admin/finance/export identifiers with no deferred same-slice fallout | next: run lint:briefs, lint:quality-gates, git diff --check, then capture screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-06-10 | screenshot handoff ready | captured after/reference artifacts in output/workout-builder-source-breakdown-dashboard-v1-2026-06-10-125853 using deterministic local Admin Analytics fixtures; visual inspection found no clipping, overlap, horizontal scroll, or schema-missing label gaps; temporary capture harness was removed and no shipped visual/rendering files changed after capture | next: wait for owner screenshot approval or visual corrections before npm run verify:pre-pr`
- `2026-06-10 | pre-pr gate passed | owner approved screenshot handoff and merge-on-good-tests path; npm run verify:pre-pr passed on the full lane with branch current to origin/main@f68a9554, lint/typecheck/unit/build/perf budgets green, and Playwright E2E 106 passed / 530 skipped | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge`
