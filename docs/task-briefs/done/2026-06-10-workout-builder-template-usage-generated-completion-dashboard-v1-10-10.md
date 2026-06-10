# Task Brief: Workout Builder Template Usage / Generated Completion Dashboard V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-10`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-builder-template-generated-completion-dashboard-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@69618263` after Workout Builder Source Breakdown Dashboard V1 PR `#1053` and repo-managed closeout PR `#1054`
- `audit_status`: `ready`
- `decision`: Execute the supported dashboard subset after owner said `implementer Workout Builder Template Usage / Generated Completion Dashboard V1` on `2026-06-10`.
- `reason`: Existing first-party events can expose generated drafts through `session_draft_generated` and generated saves through `workout_builder_saved` with safe `sourceKind = ai_session_v1`; no dedicated reusable-template usage event or stable template identity exists in the current event taxonomy, so this implementation renders template usage as `Not instrumented` instead of inferring it.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, analytics event taxonomy, `ANALYTICS_EVENT_NAMES`, `lib/analytics/workout-builder.ts`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, `components/my-library/generator/SessionGeneratorPanel.tsx`, `components/my-library/generator/GeneratorIntakeHub.tsx`, `/api/admin/analytics/insights`, generator intake/session draft instrumentation, workout save payloads, Admin Help/Guide, or route/label/support sweep rules change before implementation starts.

## Goal

Admin Analytics either shows a compact, read-only, evidence-backed module for generated-session completion and template usage, or the implementation records that template usage is not safely measurable yet and creates a narrower instrumentation follow-up instead of inferring unsupported metrics.

## Pre-Implementation Owner Explanation

Vi gjør Admin Analytics tydeligere for AI-genererte swim sessions. Først sjekker vi hva eksisterende data faktisk kan bevise; deretter viser vi genererte utkast, genererte lagringer og completion-rate, mens malbruk vises som ikke instrumentert fordi dagens telemetry ikke har ekte mal-ID eller malvalg. Dette betyr tryggere produktvalg for vi vurderer CTA, checkout eller betalt flyt. Utenfor scope er nye kommersielle plasseringer, Stripe, priser, export, finance-rapportering, tredjeparts analytics og endringer i builder/generator-opplevelsen.

Forward-compatibility-intent: nye template-, generator- og builder-steg skal enten vises trygt i generiske event-lister, som `Unknown` i en dedikert modul, eller kreve eksplisitt mapping, Help/Guide-kopi og tester for de blir egne KPI-er.

## Decision Gate Before Runtime Work

Implementation must start with a telemetry-support audit, before UI work:

1. Confirm which existing events and safe dimensions can answer the product question:
   - `session_draft_generated` currently carries safe draft dimensions such as `sessionType`, `environment`, `sizeMode`, and `hasCss`.
   - `workout_builder_saved` currently carries safe save dimensions such as `sourceKind`, `saveKind`, `sessionType`, `sizeMode`, `environment`, `stepCount`, `totalDistanceM`, and `estimatedDurationMin`.
   - `generator_intake_viewed` and `generator_intake_block_toggled` can describe intake availability/selection activity, but they do not by themselves prove generated-session completion.
2. If the existing dimensions are enough, build only the supported dashboard slice:
   - generated drafts,
   - generated saves,
   - generated completion rate as generated saves / generated drafts,
   - optional supported breakdowns by explicitly shared safe dimensions such as `sessionType`, `sizeMode`, or `environment`.
3. Template usage may be rendered only if an existing safe event or persisted dimension proves a real template identity or template-selection action.
4. If template usage is not safely measurable, do not label session type, generator blocks, or draft creation as template usage. Instead, create a follow-up instrumentation child brief and keep this dashboard limited to generated completion only, or stop before runtime work if the owner decision is needed.

Forbidden inference:

- Do not treat `sessionType` as reusable-template usage unless an explicit mapping brief says those values are templates.
- Do not treat a generated draft as a saved/completed workout.
- Do not treat `generator_intake_block_toggled` as template selection or workout completion.
- Do not treat counts as unique users, checkout conversion, export success, revenue, entitlement truth, Stripe reconciliation, or finance reporting.

Telemetry-support audit result on `2026-06-10`:

- Supported with existing telemetry:
  - `Generated drafts`: `session_draft_generated`.
  - `Generated saves`: `workout_builder_saved` where safe server-side payload `sourceKind = ai_session_v1`.
  - `Generated completion rate`: generated saves / generated drafts, rendered as `Not counted` when generated drafts are `0`.
- Not supported with existing telemetry:
  - real reusable-template usage, because there is no explicit template identity, template-selection event, or template usage dimension in `ANALYTICS_EVENT_NAMES`, generator intake events, session draft analytics payloads, or workout save payloads.
- Implementation decision:
  - render the supported generated-completion metrics in Admin Analytics,
  - render `Template usage` as `Not instrumented`,
  - do not add new events in this child,
  - defer template usage instrumentation to a later child if owner needs that KPI.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                        | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics answers one bounded question only: whether existing telemetry can show generated-session completion and real template usage without expanding into commercial UI.                         | telemetry audit + view-model/component tests             | `5/5`                   |
| UX flow clarity                               | `target`     | Any rendered module is read-only, range-aware, and clearly separates supported metrics from unsupported template usage so admins do not overread weak telemetry.                                          | component tests + Help/Guide assertions + screenshot QA  | `5/5`                   |
| Visual design quality                         | `target`     | UI reuses existing Admin Analytics card/KPI/list language and fits desktop/mobile without clipped, overlapping, or unstable metric text.                                                                  | after/reference screenshot handoff                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Counts use only explicitly mapped event names and shared safe dimensions; unsupported template usage is shown as not instrumented or deferred, never inferred from adjacent events.                       | admin insights/view-model tests                          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin Analytics remains read-only; no admin edit/config workflow changes.                                                                                                                | admin scope rationale                                    | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Module heading, metric labels, unsupported-data states, caveats, and non-happy states have accessible names and preserve keyboard/screen-reader flow.                                                     | Testing Library assertions + screenshot/keyboard QA      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No chart dependency, vendor script, new route, or extra client fetch; server-side derivation remains bounded by the existing admin insights row cap.                                                      | dependency diff + build/perf gate                        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics rows remain server-canonical; selected range remains local/query-only; this slice writes no events unless a separate instrumentation child is created and approved.                             | data-boundary review + tests                             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing no-store Admin Analytics read behavior remains unchanged; range changes refetch the same endpoint and do not cache stale generated-completion values.                                            | route/component review + tests                           | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing/malformed payload dimensions, zero denominators, duplicate telemetry, capped reads, schema-missing, no-data, fetch failures, and unsupported template data render deterministic safe states.      | zero/unknown/capped/schema/error tests                   | `5/5`                   |
| Security and authz                            | `target`     | Dashboard stays behind existing admin viewer+ boundary and no new API or wider data access is introduced for dashboard-only implementation.                                                               | auth boundary review + route tests where touched         | `5/5`                   |
| Privacy and compliance                        | `target`     | Module renders aggregate counts/rates only and never exposes raw payload JSON, workout titles, notes, raw URLs, emails, IPs, user agents, user IDs, payment data, visitor IDs, or workout row IDs.        | unsafe-field tests + privacy review                      | `5/5`                   |
| Content governance                            | `target`     | Help/Guide explains which metrics are supported, which template signals are not instrumented, and why the module is product telemetry only.                                                               | Help/Guide diff + assertion                              | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin edit workflow changes; labels must be clear enough for read-only inspection and support handoff.                                                                                | Help/Guide impact review                                 | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes only a protected admin dashboard and no public route, metadata, sitemap, robots, canonical URL, or crawlable content.                                                            | explicit SEO scope rationale                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic content, structured data, public entity page, or AI-facing crawl surface.                                                                                        | explicit AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Admin can inspect supported generated-session completion signals without raw SQL/JSON, and unsupported template usage remains explicitly not counted until mapped.                                        | insights/view-model/component tests + screenshot handoff | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Generated-completion and template signals remain pre-commerce product telemetry and must not be labeled as checkout conversion, revenue attribution, pricing signal, entitlement truth, or finance truth. | commerce boundary review + Help/Guide caveat             | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing dashboard trust states remain the support diagnostic path; no new alert or incident workflow is required.                                                                       | support-surface sweep + scope rationale                  | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reconciliation, revenue recognition, payout, refund, invoice, accounting export, or Stripe reporting surface changes.                                                         | explicit finance scope rationale                         | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: visible labels stay short and structurally localizable; future localized admin copy requires explicit mapping when locale infrastructure exists.                                         | copy/layout review + scope rationale                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Admin Analytics component, view-model contracts, admin insights route, analytics helpers, and tests; add no dependency or vendor.                                                          | changed-files review + package diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted admin insights/view-model/component tests, Help/Guide assertion, screenshot handoff for any UI, and full pre-PR/pre-merge gates cover the slice.                                                 | targeted tests + screenshot artifacts + verify gates     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Uses existing bounded analytics reads over low-cardinality event names/dimensions; no materialized view, export job, warehouse query, or chart bundle is added.                                           | query/view-model review + dependency diff                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Dashboard-only implementation has no migration/env/provider/job change; rollback is a revert of dashboard/view-model/docs/tests only.                                                                     | PR summary + verify gates + rollback note                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx`.
  - Do not add a new route, dashboard tab, modal, chart library, raw-event drilldown, export action, or dashboard builder.
  - Preserve the existing client range/retry boundary and `/api/admin/analytics/insights` no-store fetch behavior.
- TypeScript/domain contracts:
  - Add narrow typed generated-completion/template-support shapes in `lib/analytics/admin-insights.ts` and `lib/analytics/admin-dashboard.ts` only if the audit proves existing events can support them.
  - Derived completion rates must define zero-denominator behavior and render `Not counted` when the denominator is `0`.
  - Unsupported template usage must have an explicit state such as `Not instrumented`, not a fake `0%` rate.
  - Dashboard-specific KPI derivation belongs in typed view-model/helpers, not JSX.
- Supabase/data layer:
  - No migration, RLS, generated database type, retention, rollup, or query expansion beyond reading already-sanitized analytics rows through the existing admin insights endpoint.
  - If payload JSON is inspected server-side for safe dimensions, raw payload JSON must remain server-only and never be returned to Admin UI.
  - Existing admin viewer+ auth boundary remains the only data access path.
- External services/tools:
  - No Plausible, GA4, Meta, Hotjar, Clarity, tag manager, cookie, visitor ID, webhook, SDK, Stripe, checkout, finance, or secret change.
- UI system:
  - Reuse existing Admin Analytics metric/list/card styling and `AdminManagerState` trust states.
  - Use compact operational copy; no tutorial, marketing, or CTA language.
  - Screenshot comparison type: `after/reference`, comparing changed Admin Analytics dashboard to current Admin Analytics/admin workspace reference.
- Testing:
  - Unit tests for insight/view-model derivation, zero denominators, unsupported template usage, unknown future dimensions, malformed/missing payload values, capped/no-data/schema-missing states, and no unsafe raw field rendering.
  - Component tests for rendered module, accessible labels, range-aware text, and no export/edit/checkout affordance.
  - Help/Guide assertion for interpretation copy.
  - Screenshot handoff before `npm run verify:pre-pr` if UI is rendered.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows and aggregate `/api/admin/analytics/insights` response.
- Server-only derived data:
  - Generated-completion/template-support metrics are derived from event name plus safe persisted dimensions/payload values.
  - Raw payload JSON must not be returned to the browser.
- Local/browser:
  - Existing dashboard range UI state only.
  - No analytics event write, browser storage key, visitor ID, cookie, admin preference, or source-breakdown persisted state is added in dashboard-only implementation.
- Sync policy:
  - Dashboard loads and refetches bounded aggregate data for the selected range.
  - Failed reads show existing retry behavior and do not infer fallback counts.
  - Missing or malformed template/generator dimensions are counted as unknown/not instrumented rather than reassigned.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - The module must not display raw payload JSON, workout titles, notes, raw workout text, raw URLs/referrers, emails, IPs, user agents, user IDs, payment/cart/shipping data, Stripe customer IDs, visitor IDs, or workout row IDs.
- Cache/invalidation:
  - Preserve no-store dashboard/API reads.
  - Freshness and capped caveats remain visible through existing dashboard health state.

## Identity And Rename Contract

- Canonical stable ID:
  - Event identity is `event_name`, currently including `session_draft_generated`, `workout_builder_saved`, `generator_intake_viewed`, and `generator_intake_block_toggled`.
  - Generated-save identity uses safe payload `sourceKind = ai_session_v1`.
  - Any template identity requires an explicit stable template ID/key if implementation proves one exists; session labels are not template IDs by default.
- Human-readable identifiers:
  - Dashboard labels such as `Generated drafts`, `Generated saves`, `Completion rate`, `Template usage`, and `Not instrumented` are display-only and may be renamed without changing event identity.
- Mutability rules:
  - Shipped event names and source kind meanings are append-only; changing event/source meaning requires a new event/source or explicit migration/alias brief.
  - Template IDs, if later introduced, must be stable and separate from editable template titles.
- Rename vs repurpose:
  - Label rename is allowed when meaning is unchanged.
  - Counting a materially different workflow as completion or template usage is repurpose and requires a new brief.
- Compatibility contract:
  - Unknown future event names continue to appear in generic top-event lists.
  - Unknown future template/source/session values appear as unknown/unmapped and are not included in dedicated rates until mapped.
- Observability and repair:
  - Zero or missing generated/template data renders as zero, `Not counted`, or `Not instrumented`, not hidden success.
  - Capped/stale/schema-missing/fetch-failed states remain visible so admin can separate quiet traffic from data collection issues.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics event names, generator workflow stages, generator block keys, session types, size modes, environments, template IDs/keys, source kinds, save kinds, admin metric labels, range options, Help/Guide copy, future locale copy, export formats, commerce funnel modules, and future product IDs.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Save source kinds come from `WORKOUT_SOURCE_KINDS`.
  - Counts come from `/api/admin/analytics/insights`, not client storage or hardcoded fixtures.
  - Template identity must come from a stable template source of truth if/when one exists; it must not be inferred from display copy.
- Additive behavior:
  - New approved events continue to appear in generic top-event lists through existing formatting.
  - Existing generated draft/save counts keep working while V1 event and `sourceKind` identities remain valid.
  - Unknown generator dimensions can render as unknown/unmapped list items if they pass safe identifier rules.
- Explicit mapping requirements:
  - New template IDs, reusable workout templates, generated-plan completion stages, handoff definitions, upsell, checkout, CTA interaction, export, finance reporting, vendor forwarding, public-to-user attribution, or localized admin copy require a new brief, mapping, docs, and tests.
- Unknown or deprecated values:
  - Unknown events render safely in generic lists and are not counted in dedicated template/completion modules until mapped.
  - Unknown/deprecated template or generator values render as unknown/unmapped and are excluded from source-specific rates.
- Test/evidence:
  - Include fixtures for generated-only, generated-save-only, mixed manual/generated saves, zero denominator, unknown future session/template values, malformed payload, missing payload, capped/no-data/schema-missing states, and duplicate telemetry.

## Dashboard UX / Readability Contract

- Placement:
  - Add one compact generated-completion/template-support module inside the existing Admin Analytics hierarchy only if the telemetry audit proves a supported metric set.
  - Preferred placement: below or adjacent to the current Workout Builder source breakdown so admin can read starts/saves, source split, and generated completion together.
- Required values when supported:
  - `Generated drafts`: count of `session_draft_generated`.
  - `Generated saves`: count of `workout_builder_saved` where `sourceKind = ai_session_v1`.
  - `Generated completion rate`: generated saves / generated drafts, rendered as a whole percentage; render `Not counted` when generated drafts are `0`.
  - `Template usage`: render only when an explicit safe template identity or template-selection event exists; otherwise render `Not instrumented` with a short caveat.
  - Optional safe breakdowns: `sessionType`, `sizeMode`, `environment`, or `hasCss` only when numerator and denominator share the same safe dimension.
- Required interpretation:
  - Label the module as product telemetry.
  - Make clear that duplicate drafts/saves can exist and rates are not unique-user conversion, checkout conversion, revenue, export success, Stripe reconciliation, entitlement truth, or finance reporting.
  - Preserve existing capped/schema-missing/no-data/fetch-failed states.
- Desktop/mobile requirements:
  - No horizontal scroll.
  - No clipped metric labels or rate text.
  - Keep metric dimensions stable when values change from `0` to large counts, `Not counted`, or `Not instrumented`.
  - Use lightweight CSS only; no chart library.

## Help / Guide Impact

Required if implementation changes visible Admin Analytics labels or interpretation.

- Update Admin Help/Guide or linked runbook with:
  - what generated drafts, generated saves, generated completion rate, and any template usage state mean,
  - which template signals are not currently instrumented if applicable,
  - why duplicate telemetry can exist,
  - why the module is product telemetry only,
  - why it is not unique-user conversion, checkout conversion, revenue attribution, finance reporting, Stripe reconciliation, export success, or entitlement truth,
  - how empty/capped/stale/schema-missing/fetch-failed/unknown-template states should be interpreted.
- Add or update a Help/Guide assertion.

## Screenshot / Visual Impact

Required if this child renders a visible Admin Analytics module.

- Capture folder: `output/workout-builder-template-generated-completion-dashboard-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-workout-builder-template-generated-completion-dashboard-desktop.png`
  - `after-workout-builder-template-generated-completion-dashboard-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - one non-happy state: `after-workout-builder-template-generated-completion-dashboard-empty-desktop.png`, `after-workout-builder-template-generated-completion-dashboard-capped-desktop.png`, `after-workout-builder-template-generated-completion-dashboard-schema-missing-desktop.png`, or `after-workout-builder-template-generated-completion-dashboard-not-instrumented-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`.

Captured on `2026-06-10 14:27` local time:

- Capture folder: `output/workout-builder-template-generated-completion-dashboard-v1-2026-06-10-142604`.
- Handoff type: `after/reference`.
- Files:
  - `after-workout-builder-template-generated-completion-dashboard-desktop.png`
  - `after-workout-builder-template-generated-completion-dashboard-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - `after-workout-builder-template-generated-completion-dashboard-not-instrumented-desktop.png`
- Visual checks completed: desktop and mobile generated-completion module, Admin Analytics reference source-breakdown card, and no-data/not-instrumented state.
- Screenshot approval status: owner approved on `2026-06-10`; `npm run verify:pre-pr` may run before PR handoff.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this changes admin analytics labels and Help/Guide interpretation if implemented.

Search at minimum:

- `session_draft_generated`
- `workout_builder_saved`
- `generator_intake_viewed`
- `generator_intake_block_toggled`
- `generator_intake_handoff_prepared`
- `sourceKind`
- `saveKind`
- `sessionType`
- `sizeMode`
- `environment`
- `template`
- `Template usage`
- `Generated completion`
- `Generated drafts`
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
- active/planned/deferred/done analytics, workout, commerce, and AW-006/AW-022 briefs.

Record executed identifiers, checked surfaces, fallout handled, and deferred fallout in this brief before `verify:pre-pr`.

- Executed sweep on `2026-06-10`.
- Identifiers searched: `session_draft_generated`, `workout_builder_saved`, `generator_intake_viewed`, `generator_intake_block_toggled`, `generator_intake_handoff_prepared`, `sourceKind`, `saveKind`, `sessionType`, `sizeMode`, `environment`, `template`, `Template usage`, `Generated completion`, `Generated drafts`, `Generated saves`, `Admin Analytics`, `analytics dashboard`, `/api/admin/analytics/insights`, `ANALYTICS_EVENT_NAMES`, `finance reporting`, `Stripe reconciliation`, and `CSV export`.
- Directories/surfaces checked: `app/`, `components/`, `lib/analytics/`, `lib/workouts/`, `lib/session-generator-v1/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, Help/Guide source/tests, active/planned/deferred/done analytics, workout, commerce, and AW-006/AW-022 briefs.
- Fallout handled: added aggregate `workoutBuilderTemplateGeneratedCompletion` to admin insights, added Admin Analytics view-model/UI rendering for `Generated drafts`, `Generated saves`, `Completion rate`, and `Template usage: Not instrumented`, updated Admin Help/Guide interpretation, updated API contract, data-access/authz/cache registry, external-service matrix, parent/active briefs, and added targeted unit/component assertions.
- Deferred fallout: no new template usage event, template taxonomy, generator completion stage beyond draft->save, CTA/upsell/checkout/pricing/entitlement/Stripe change, CSV/export, finance-grade reporting, vendor tracking, cookies, visitor IDs, raw-event drilldown, migration, RLS change, rollup job, retention job, or workout-builder/generator UX change.

## Scope

- Audit existing first-party event names and safe dimensions for generated-session completion and real template usage.
- If supported, add a compact read-only Admin Analytics module using existing analytics rows and events.
- Derive generated draft/save/completion values only from `session_draft_generated` and `workout_builder_saved` with `sourceKind = ai_session_v1`.
- Render template usage only when an explicit safe template identity or template-selection event exists.
- Preserve existing range selection, refresh/retry behavior, admin-only access, no-store reads, trust states, row cap, and privacy boundary.
- Add targeted tests for insights/view-model derivation, rendered dashboard, interpretation copy, unsupported template usage, and safe fallbacks.
- Update Help/Guide or linked runbook plus parent/child checkpoint logs as needed.
- Capture and hand off screenshots before pre-PR validation if UI is implemented.

## Out Of Scope

- New event names or payload fields unless the telemetry audit proves existing data cannot answer the approved question and the owner approves a separate instrumentation child.
- CTA placement, upsell copy, checkout/pricing/entitlement/Stripe behavior, product catalog change, export/CSV, finance-grade reporting, third-party vendor, cookie, visitor ID, raw payload drilldown, migration, RLS change, rollup job, retention job, or workout-builder/generator UX change.
- Treating session type, generator block toggles, generated draft creation, or handoff preparation as template usage without an explicit mapping.
- Unique-user conversion, attribution, revenue, finance, support automation, or product-quality scoring.

## Acceptance Criteria

1. Brief is in-progress only after the owner explicitly approved implementation of this named child.
2. Implementation begins with a documented telemetry-support audit.
3. Unsupported template usage is not inferred; it is rendered as not instrumented or moved into a follow-up instrumentation brief.
4. Generated completion counts and rates use only explicitly mapped event names and safe dimensions.
5. Missing, malformed, unknown, duplicate, capped, schema-missing, no-data, and fetch-failed states render deterministic safe UI.
6. Admin Help/Guide explains metric meaning and non-meaning before PR handoff if visible labels change.
7. UI implementation includes screenshot handoff and owner approval before `npm run verify:pre-pr`.
8. Commercial CTA, checkout, Stripe, entitlement, export, vendor, and finance work stay out of this child.
9. Changed brief passes `npm run lint:briefs`.

## Validation

Planning-only brief creation:

- `npm run lint:briefs`
- `git diff --check`

Implementation validation:

- `./node_modules/.bin/vitest run tests/unit/admin-analytics-insights.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx` - passed, `4` files and `21` tests.
- `npm run typecheck` - passed.
- `npm run lint:briefs` - skipped because the new in-progress brief was still untracked at that moment.
- `npm run lint:quality-gates` - passed with expected human-judgment caveats.
- `git diff --check` - passed.
- `npm run lint:briefs -- --all` - passed.
- Screenshot handoff captured and visually inspected; owner approved on `2026-06-10`.
- `npm run verify:pre-pr` - passed full lane on `2026-06-10`: branch-current, quality gates, admin/env/PR-body lint, ESLint with existing output warnings only, typecheck, `238` unit test files / `1493` tests, build, perf budgets, and Playwright E2E `106` passed / `530` skipped.
- `npm run verify:pre-pr` on committed `HEAD add696cd` - passed full lane at `artifacts/test-runs/20260610-144841`, including branch-current, brief/quality/admin/env/PR-body lint, ESLint with existing output warnings only, typecheck, `238` unit test files / `1493` tests, build, perf budgets, and Playwright E2E `106` passed / `530` skipped.
- PR `#1055` CI - passed: `verify` `5m32s`, `e2e-smoke` `1m34s`, `site-lock-smoke` `3s`, `deploy-preview` `1m38s`, `size-check`, `CodeQL`, Vercel, and Vercel Preview Comments.
- `npm run verify:pre-merge` - passed on `2026-06-10`, full lane scope, reused public verify PASS for current `HEAD add696cd`, skipped private-gate regression because `SITE_LOCK_ENABLED!=1`, and recorded `artifacts/verify-pre-merge/20260610-130328.json`.
- PR `#1055` merged on `2026-06-10` at squash commit `0e61938b`.

## Session Continuity And Recovery

- Canonical child path: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md`
- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child and the parent brief, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | planned child created | created this audit-first planned child from clean main@69618263 after PR #1053 and repo-managed closeout PR #1054; scope requires proving template usage from existing safe telemetry before any dashboard label can claim it, and otherwise defers to a separate instrumentation child | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | moved to in-progress | owner requested implementation on branch workout-builder-template-generated-completion-dashboard-v1; telemetry audit found generated draft/save/completion metrics are supported but template usage is not safely measurable, so the runtime slice must render template usage as Not instrumented and avoid new events | next: finish UI/docs/tests, then capture screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-06-10 | screenshot handoff ready | implemented generated-completion UI/docs/tests, captured after/reference screenshots in output/workout-builder-template-generated-completion-dashboard-v1-2026-06-10-142604, and completed targeted unit/type/brief/quality/diff checks | next: wait for owner screenshot approval or visual corrections before npm run verify:pre-pr`
- `2026-06-10 | pre-pr gate passed | owner approved screenshot handoff and merge on good tests; npm run verify:pre-pr passed the full lane with unit/build/perf/e2e coverage, so the branch is ready for commit, push, PR creation, CI monitoring, and pre-merge gate | next: commit and open PR`
- `2026-06-10 | merged | committed add696cd, opened PR #1055, passed required CI, passed npm run verify:pre-merge, and merged at squash commit 0e61938b; repo-managed closeout moved this child to done and parent now has no active child | next: finish closeout PR and rerun post-merge-preflight`

## Completion Record

- `completed`: `2026-06-10`
- `merged_pr`: `#1055`
- `squash_commit`: `0e61938b`
- `result`: Closed Workout Builder Template Usage / Generated Completion Dashboard V1 by shipping a read-only Admin Analytics module for generated drafts, generated saves, and generated completion rate while explicitly showing template usage as `Not instrumented` until a real template identity exists.
- `validation`: targeted Vitest, typecheck, brief/quality/diff checks, owner-approved after/reference screenshots, `npm run verify:pre-pr` full lane, PR `#1055` CI, and `npm run verify:pre-merge`.
- `10/10 claim`: yes - all critical target categories reached `5/5`: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Performance (CWV + payloads), Data placement and sync boundaries, Caching and invalidation strategy, Reliability and failure handling, Security and authz, Privacy and compliance, Analytics and KPI observability, Stack-fit and dependency discipline, Testing and QA automation, and DevOps and rollback readiness.

| Category                                      | Achieved Score | Evidence                                                                                                                                    | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#1055` shipped only the approved generated-completion dashboard subset and kept commercial UI deferred.                                 | No gap.      |
| UX flow clarity                               | `5/5`          | Admin Analytics UI and Help/Guide copy label generated drafts, generated saves, completion rate, and unsupported template usage clearly.    | No gap.      |
| Visual design quality                         | `5/5`          | Owner-approved after/reference screenshots in `output/workout-builder-template-generated-completion-dashboard-v1-2026-06-10-142604`.        | No gap.      |
| Business logic correctness and data integrity | `5/5`          | View-model and insights tests cover generated draft/save/rate derivation and unsupported template usage fallback.                           | No gap.      |
| Accessibility (a11y)                          | `5/5`          | Reused existing Admin Analytics semantic card patterns; PR CI and full Playwright lane passed.                                              | No gap.      |
| Performance (CWV + payloads)                  | `5/5`          | `npm run verify:pre-pr` full lane passed build and perf budgets; no new dependency or payload-heavy client surface.                         | No gap.      |
| Data placement and sync boundaries            | `5/5`          | Metrics remain server-canonical read-only admin insights from existing first-party analytics rows; no local persistence.                    | No gap.      |
| Caching and invalidation strategy             | `5/5`          | Existing Admin Analytics range/refresh/no-store behavior preserved and covered by targeted tests.                                           | No gap.      |
| Reliability and failure handling              | `5/5`          | Schema-missing, no-data, zero-denominator, and not-instrumented states have deterministic safe rendering.                                   | No gap.      |
| Security and authz                            | `5/5`          | Existing admin-only insights route and viewer+ boundary unchanged; no raw payload or access-control expansion.                              | No gap.      |
| Privacy and compliance                        | `5/5`          | Aggregated counts only; no emails, IPs, user agents, visitor IDs, raw workout text, raw URLs, payment details, or raw payload JSON exposed. | No gap.      |
| Content governance                            | `5/5`          | Help/Guide and API/architecture contracts updated in the same PR.                                                                           | No gap.      |
| Analytics and KPI observability               | `5/5`          | Generated-completion KPI is mapped to explicit safe events; template usage is not inferred and is marked not instrumented.                  | No gap.      |
| Commerce and revenue ops                      | `5/5`          | CTA, checkout, pricing, entitlement, Stripe, export, and finance-grade reporting stayed out of scope.                                       | No gap.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Next.js/Admin Analytics/view-model/test patterns; no dependency changes.                                                    | No gap.      |
| Testing and QA automation                     | `5/5`          | Targeted unit/component tests, `npm run verify:pre-pr`, PR `#1055` CI, and `npm run verify:pre-merge` passed.                               | No gap.      |
| Scalability and cost efficiency               | `5/5`          | Uses existing capped analytics fetch/aggregation path and adds no rollup job, migration, vendor, or background cost.                        | No gap.      |
| DevOps and rollback readiness                 | `5/5`          | Small scoped PR, docs contracts, green CI, pre-merge PASS marker, and no schema/runtime config migration needed.                            | No gap.      |
