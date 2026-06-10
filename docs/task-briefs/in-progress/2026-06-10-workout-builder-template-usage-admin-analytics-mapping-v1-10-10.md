# Task Brief: Workout Builder Template Usage Admin Analytics Mapping V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-10`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
  - `docs/architecture/workout-builder-template-identity-selection-contract.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-builder-template-usage-admin-analytics-mapping-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@a4cb0f6f` after Workout Builder Template Usage Instrumentation V1 PR `#1061`, repo-managed closeout PR `#1062`, and clean `npm run post-merge:preflight`
- `audit_status`: `ready`
- `decision`: Execute this bounded child after the owner explicitly approved implementation of this named brief.
- `reason`: The owner requested implementation on `2026-06-10`; `workout_builder_template_selected` now exists as a typed, privacy-safe event emitted only from the registry-backed `Use template` action, while Admin Analytics still intentionally renders template usage as dashboard-mapping-missing/not instrumented.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, analytics event taxonomy, `ANALYTICS_EVENT_NAMES`, `lib/analytics/workout-builder.ts`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, `components/admin/AdminHelpCenter.tsx`, `/api/admin/analytics/insights`, `lib/workouts/templates.ts`, workout-builder template selection surfaces, Admin Analytics Help/Guide contracts, API/architecture contracts, screenshot handoff rules, or route/label/support sweep rules change before implementation starts.

## Goal

Map the existing `workout_builder_template_selected` first-party event into a compact read-only Admin Analytics template usage module without inferring template usage from adjacent builder, generator, save, or commercial activity.

## Pre-Implementation Owner Explanation

Vi lager en tydelig plan for aa vise ekte template usage i Admin Analytics. Det betyr at dashboardet senere kan telle naar brukere faktisk velger en konkret Workout Builder-mal, basert paa eventen som allerede finnes. Dette er viktig fordi produktvalg og eventuell kommersiell plassering ikke bor bygges paa gjetting. Utenfor scope er nye events, ny template-UX, checkout, priser, Stripe, finance, export, tredjeparts analytics, raw event-drilldown og endringer i builder/generator-opplevelsen.

Forward-compatibility-intent: nye templates fra samme registry-kontrakt skal kunne telles trygt gjennom stabil `templateKey` og vises som kjente eller ukjente templateverdier. Nye template sources, kommersielle steg, eksport, finance, vendor forwarding eller lokaliserte admin-labels krever eksplisitt mapping, Help/Guide-kopi og tester.

## Decision Gate Before Runtime Work

Implementation must start with a mapping-support audit before UI or aggregation work:

1. Confirm that `workout_builder_template_selected` is present in `ANALYTICS_EVENT_NAMES` and still emitted only from the explicit `Use template` action.
2. Confirm that persisted payload values are bounded and privacy-safe:
   - `templateKey`,
   - `templateSource`,
   - safe builder/session dimensions if already emitted.
3. Confirm that the dashboard can derive aggregate template usage without exposing raw payload JSON to Admin UI.
4. Confirm that template labels come from the workout-template registry/contract, not from persisted raw payload labels or user-editable workout text.
5. If the event, payload contract, or registry source has changed, stop and refresh this brief before implementation.

Supported V1 mapping if the audit passes:

- `Template selections`: count of `workout_builder_template_selected` rows in the selected date range.
- `Template breakdown`: aggregate by safe `templateKey`, with labels resolved from the current registry where possible.
- `Unknown template`: valid event rows with missing, deprecated, or unmapped template keys render as a safe unknown bucket, not as a known template.
- `Template source`: optionally show or filter only the scoped `workout_builder_v1` source when present; unknown sources are excluded from dedicated V1 template usage until explicitly mapped.

Forbidden inference:

- Do not infer template usage from `sessionType`, `sourceKind`, `workout_builder_saved`, `workout_builder_started`, `session_draft_generated`, generator block toggles, visible `Use template` copy, draft creation, or adjacent user activity.
- Do not calculate unique-user conversion, checkout conversion, revenue, entitlement truth, Stripe reconciliation, export success, finance reporting, or product-quality score from this metric.
- Do not display raw payload JSON, workout titles, notes, raw workout text, raw URLs/referrers, emails, IPs, user agents, user IDs, visitor IDs, payment/cart data, Stripe IDs, or template labels copied from analytics payloads.

Mapping-support audit result on `2026-06-10`:

- `workout_builder_template_selected` is present in `ANALYTICS_EVENT_NAMES`.
- The only runtime call site found is the explicit `Use template` action in `components/my-library/workouts/WorkoutBuilderHub.tsx`.
- The payload helper in `lib/analytics/workout-builder.ts` emits only active registry-backed templates and safe scalar dimensions: `templateKey`, `templateSource`, `builderMode`, `environment`, `sessionType`, and `sizeMode`.
- `templateKey` is validated by `parseWorkoutTemplateKey` and resolved through `lib/workouts/templates.ts`; display labels for the dashboard must come from that registry, not from analytics payload labels.
- Admin Analytics can aggregate `analytics_events` rows server-side and return counts, known-template buckets, and unknown-template counts without exposing raw payload JSON.
- Implementation decision: proceed with the dashboard mapping; add no new event, payload field, call site, migration, vendor, export, checkout, finance, or builder/generator UX change.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics answers one bounded question only: how often explicit workout-builder templates are selected, before any CTA, checkout, finance, or vendor work.                 | mapping-support audit + dashboard/view-model tests        | `5/5`                   |
| UX flow clarity                               | `target`     | Template usage is labeled as product telemetry, separated from generated completion/source breakdown, and never presented as unique-user or commerce conversion.                 | component tests + Help/Guide assertion + screenshot QA    | `5/5`                   |
| Visual design quality                         | `target`     | UI reuses existing Admin Analytics card/KPI/list language and fits desktop/mobile without clipped, overlapping, or unstable metric text.                                         | after/reference screenshot handoff                        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Counts use only `workout_builder_template_selected` and safe mapped dimensions; unknown keys/sources are deterministic and no adjacent events are counted.                       | insights/view-model tests + unknown/future fixtures       | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin Analytics remains read-only and no admin edit/config workflow is introduced.                                                                              | admin scope rationale                                     | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Module heading, metric labels, unknown/empty/capped states, and caveats have accessible names and preserve keyboard/screen-reader flow.                                          | Testing Library assertions + screenshot/keyboard QA       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No chart dependency, vendor script, new route, or extra client fetch; server-side derivation remains bounded by existing admin insights row caps.                                | dependency diff + build/perf gate                         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics rows remain server-canonical; Admin UI receives aggregate counts/buckets only; no local analytics identity or persisted dashboard preference is added.                 | data-boundary review + unsafe-field tests                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing no-store Admin Analytics read behavior remains unchanged; range changes refetch the same endpoint and do not cache stale template usage values.                         | route/component review + tests                            | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing/malformed payload dimensions, unknown keys, duplicate telemetry, zero rows, capped reads, schema-missing, no-data, and fetch failures render deterministic safe states.  | zero/unknown/capped/schema/error tests                    | `5/5`                   |
| Security and authz                            | `target`     | Dashboard stays behind existing admin viewer+ boundary and no new API, wider data access, mutation, or raw payload read path is exposed to the browser.                          | auth boundary review + route tests where touched          | `5/5`                   |
| Privacy and compliance                        | `target`     | Module renders aggregate counts/buckets only and never exposes raw payload JSON, workout/user/payment identifiers, raw URLs, IPs, user agents, or editable labels from payloads. | unsafe-field tests + privacy review                       | `5/5`                   |
| Content governance                            | `target`     | Help/Guide, API/architecture contracts, and parent/child checkpoints explain what template usage means and what it does not mean.                                                | Help/Guide diff + docs assertions + checkpoint log        | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow action, role, recovery path, or edit behavior changes; labels must be clear for read-only inspection and support handoff.                     | Help/Guide impact review                                  | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes only protected Admin Analytics and no public route, metadata, sitemap, robots, canonical URL, or crawlable content.                                     | explicit SEO scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic content, structured data, public entity page, or AI-facing crawl surface.                                                               | explicit AI-discoverability scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Admin can inspect explicit template-selection counts/breakdowns without SQL/JSON and with clear caveats for duplicates, unknown keys, and non-commerce interpretation.           | insights/view-model/component tests + screenshot handoff  | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Template usage remains pre-commerce product telemetry and must not be labeled as checkout conversion, revenue attribution, pricing signal, entitlement truth, or finance truth.  | commerce boundary review + Help/Guide caveat              | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing dashboard trust states remain the support diagnostic path; no new alert, on-call path, incident workflow, or support recovery flow is introduced.      | support-surface sweep + scope rationale                   | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reconciliation, revenue recognition, payout, refund, invoice, accounting export, or Stripe reporting surface changes.                                | explicit finance scope rationale                          | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: visible labels stay short and structurally localizable; future localized admin copy requires explicit mapping when locale infrastructure exists.                | copy/layout review + scope rationale                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Admin Analytics component, view-model contracts, insights route, analytics helpers, template registry, and tests; add no dependency or vendor.                    | changed-files review + package diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted admin insights/view-model/component tests, Help/Guide assertion, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge` cover the slice.                       | targeted tests + screenshot artifacts + verify gates + CI | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Uses existing bounded analytics reads over low-cardinality event names/template keys; no materialized view, export job, warehouse query, or chart bundle is added.               | query/view-model review + dependency diff                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Dashboard-only implementation has no migration/env/provider/job change; rollback is a revert of dashboard/view-model/docs/tests only.                                            | PR summary + verify gates + rollback note                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx` and existing Admin Analytics hierarchy.
  - Preserve the existing client range/retry boundary and `/api/admin/analytics/insights` no-store fetch behavior.
  - Do not add a new route, dashboard tab, modal, chart library, raw-event drilldown, export action, or dashboard builder.
- TypeScript/domain contracts:
  - Derive dashboard data in typed helpers in `lib/analytics/admin-insights.ts` and `lib/analytics/admin-dashboard.ts`, not ad hoc JSX.
  - Count only `workout_builder_template_selected`.
  - Resolve known template labels from `lib/workouts/templates.ts` or the contract-backed registry surface, not from raw analytics payload labels.
  - Unknown or invalid template keys must render as a safe unknown/unmapped bucket or be excluded from dedicated V1 source counts according to the implementation audit.
- Supabase/data layer:
  - Prefer existing `analytics_events` reads through the admin insights endpoint.
  - No migration, RLS change, generated database type update, index, rollup job, materialized view, retention job, or raw payload admin read is in scope.
  - Raw payload JSON may be inspected server-side for safe scalar dimensions but must never be returned to Admin UI.
- External services/tools:
  - No Plausible, GA4, Meta, Hotjar, Clarity, tag manager, cookie, visitor ID, webhook, SDK, secret, Stripe, checkout, finance, or vendor forwarding change.
- UI system:
  - Reuse existing Admin Analytics metric/list/card styling and `AdminManagerState` trust states.
  - Use compact operational copy; no tutorial, marketing, CTA, finance, or sales language.
  - Screenshot comparison type: `after/reference`, comparing changed Admin Analytics template usage module to existing Admin Analytics dashboard/reference state.
- Testing:
  - Unit tests for insights aggregation, view-model derivation, zero rows, duplicate telemetry, unknown/deprecated template keys, unknown source values, capped/no-data/schema-missing/fetch-failed states, and unsafe raw field exclusion.
  - Component tests for rendered module, accessible labels, Help/Guide interpretation copy, and no export/edit/checkout affordance.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows.
  - Workout-builder template identity contract and current template registry/source.
- Server-only derived data:
  - Template usage metrics are derived from event name plus safe persisted scalar dimensions/payload values.
  - Raw payload JSON remains server-only.
- Local/browser:
  - Existing dashboard range UI state only.
  - No analytics event write, browser storage key, visitor ID, cookie, admin preference, or source-breakdown persisted state is added in this dashboard mapping slice.
- Sync policy:
  - Dashboard loads and refetches bounded aggregate data for the selected range.
  - Failed reads show existing retry behavior and do not infer fallback counts.
  - Duplicate template-selection telemetry is counted as duplicate product telemetry, not deduplicated into unique users.
  - Missing, malformed, unknown, or deprecated template keys render deterministic safe states rather than being reassigned to known templates.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - The module must not display raw payload JSON, workout titles, notes, raw workout text, raw URLs/referrers, emails, IPs, user agents, user IDs, payment/cart/shipping data, Stripe customer IDs, visitor IDs, or workout row IDs.
- Cache/invalidation:
  - Preserve no-store dashboard/API reads.
  - Freshness and capped caveats remain visible through existing dashboard health state.

## Identity And Rename Contract

- Canonical stable ID:
  - Event identity is `event_name`: `workout_builder_template_selected`.
  - Template identity is the stable write-once `templateKey` from the workout-template registry/contract.
- Human-readable identifiers:
  - Template titles and Admin Analytics labels are display-only and may be renamed without changing event or template identity.
  - Analytics payload labels, if any exist later, must not become source of truth for display names without a separate mapping decision.
- Mutability rules:
  - Shipped event names are append-only.
  - `templateKey` values counted by this module must be immutable or write-once.
  - Changing the meaning of a `templateKey` is repurpose, not rename.
- Rename vs repurpose:
  - Renaming a template title is allowed if the underlying template remains the same.
  - Reusing a `templateKey` for a materially different workout template requires a new key or explicit migration/alias brief.
- Compatibility contract:
  - Unknown future event names continue to appear in generic Admin Analytics lists.
  - Unknown or deprecated template keys render as unknown/unmapped and are not silently folded into known templates.
  - New template sources require explicit mapping before they affect the dedicated V1 template usage module.
- Observability and repair:
  - Unknown/deprecated keys should be visible as safe unknown states where practical so admin/support can distinguish real unmapped data from quiet traffic.
  - Deprecated keys require an alias/migration decision before they are counted under a renamed known template.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Analytics event names, template keys, template sources, template labels, builder modes, session dimensions, admin metric labels, range options, Help/Guide copy, future locale copy, export formats, commerce funnel modules, future product IDs, and future vendor forwarding.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Template identity and display labels come from the workout-template registry/contract, not button text or raw analytics payload labels.
  - Counts come from `/api/admin/analytics/insights`, not client storage or hardcoded fixtures.
- Additive behavior:
  - New templates added to the same registry with valid stable `templateKey` values should appear automatically in aggregate selection counts and known-template breakdowns.
  - Generic Admin Analytics top-event lists continue to show future approved events through existing formatting.
  - Existing generated-completion and source-breakdown modules keep working while their V1 event identities remain valid.
- Explicit mapping requirements:
  - New template sources, persisted template tables, template families, deprecated-key aliases, generated-plan completion stages, commercial CTA placement, checkout attribution, export formats, finance reporting, vendor forwarding, public-to-user attribution, or localized admin copy require explicit mapping, docs, tests, and owner decision.
- Unknown or deprecated values:
  - Unknown events render safely in generic lists and are not counted in this dedicated module.
  - Unknown/deprecated template keys render as unknown/unmapped and are excluded from known-template labels until mapped.
  - Unknown template sources are excluded from V1 template source-specific counts until explicitly mapped.
- Test/evidence:
  - Include fixtures for known template key, unknown future key, deprecated/unmapped key, missing key, invalid/free-text key, unknown template source, duplicate event, zero rows, capped reads, schema-missing, fetch-failed, and unsafe raw field attempts.
  - Run a route/label/support sweep for event taxonomy, dashboard labels, Help/Guide, API contracts, privacy docs, and analytics dashboard caveats.

## Dashboard UX / Readability Contract

- Placement:
  - Add one compact template usage module inside the existing Admin Analytics hierarchy.
  - Preferred placement: near the current generated-completion/source-breakdown area so admin can read manual/generated/template signals together.
- Required values:
  - `Template selections`: count of `workout_builder_template_selected` in the selected range.
  - `Templates selected`: number of known template keys selected in the range when safe to derive.
  - `Top templates` or compact breakdown: known template labels from registry plus `Unknown template` bucket when present.
  - `Template usage`: switch from not dashboard-mapped to counted only when the audit proves the event and payload contract still match this brief.
- Required non-happy states:
  - `0` rows: render as no template selections in this range, not as instrumentation missing.
  - schema missing/fetch failed/capped/stale: preserve existing trust-state caveats.
  - unknown key/source: render safe unknown/unmapped state, not a known label.
- Required interpretation:
  - Label the module as product telemetry.
  - State that duplicates can exist and counts are not unique users.
  - State that the module is not checkout conversion, revenue, entitlement truth, Stripe reconciliation, export success, finance reporting, or product-quality score.
- Desktop/mobile requirements:
  - No horizontal scroll.
  - No clipped metric labels or count text.
  - Stable dimensions when counts move from `0` to large values or unknown states.
  - Lightweight CSS only; no chart library.

## Help / Guide Impact

Required if implementation changes visible Admin Analytics labels or interpretation.

- Update Admin Help/Guide or linked runbook with:
  - what template selections mean,
  - why counts may include duplicate telemetry,
  - how known vs unknown template keys should be read,
  - why the module is product telemetry only,
  - why it is not unique-user conversion, checkout conversion, revenue attribution, finance reporting, Stripe reconciliation, export success, entitlement truth, or support-quality scoring,
  - how empty/capped/stale/schema-missing/fetch-failed/unknown-template states should be interpreted.
- Add or update a Help/Guide assertion.

## Screenshot / Visual Impact

Required because this child will render a visible Admin Analytics module if implemented.

- Capture folder: `output/workout-builder-template-usage-admin-analytics-mapping-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-workout-builder-template-usage-admin-analytics-mapping-desktop.png`
  - `after-workout-builder-template-usage-admin-analytics-mapping-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - one non-happy state: `after-workout-builder-template-usage-admin-analytics-mapping-empty-desktop.png`, `after-workout-builder-template-usage-admin-analytics-mapping-capped-desktop.png`, `after-workout-builder-template-usage-admin-analytics-mapping-schema-missing-desktop.png`, or `after-workout-builder-template-usage-admin-analytics-mapping-unknown-template-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`.

Captured on `2026-06-10 21:38` local time:

- Capture folder: `output/workout-builder-template-usage-admin-analytics-mapping-v1-2026-06-10-212800`.
- Handoff type: `after/reference`.
- Files:
  - `after-workout-builder-template-usage-admin-analytics-mapping-desktop.png`
  - `after-workout-builder-template-usage-admin-analytics-mapping-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - `after-workout-builder-template-usage-admin-analytics-mapping-unknown-template-desktop.png`
- Visual checks completed: desktop template usage module, mobile stacked layout, existing Admin Analytics reference state, and unknown-template non-happy state.
- Capture note: screenshots used a temporary local-only harness route that rendered the production Admin Analytics component with deterministic fixture data; the harness route was removed after capture.
- Product-rendering files changed after capture: none.
- Screenshot approval status: previous capture approved by owner on `2026-06-10`.

Regenerated on `2026-06-10 21:58` local time after pre-commit formatting touched the committed diff:

- Capture folder: `output/workout-builder-template-usage-admin-analytics-mapping-v1-2026-06-10-215814`.
- Handoff type: `after/reference`.
- Files:
  - `after-workout-builder-template-usage-admin-analytics-mapping-desktop.png`
  - `after-workout-builder-template-usage-admin-analytics-mapping-mobile.png`
  - `reference-admin-analytics-dashboard-desktop.png`
  - `after-workout-builder-template-usage-admin-analytics-mapping-unknown-template-desktop.png`
- Visual checks completed: desktop template usage module, mobile stacked layout, existing Admin Analytics reference state, and unknown-template non-happy state.
- Capture note: screenshots used a temporary local-only harness route that rendered the production Admin Analytics component with deterministic fixture data; the harness route was removed after capture.
- Product-rendering files changed after regenerated capture: none.
- Latest screenshot approval status: approved by owner on `2026-06-10`; proceed to final `npm run verify:pre-pr`, push, PR handoff, CI monitoring, and `npm run verify:pre-merge`.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this changes Admin Analytics labels, Help/Guide interpretation, and dashboard mapping of `workout_builder_template_selected`.

Search at minimum:

- `workout_builder_template_selected`
- `workoutBuilderTemplate`
- `templateUsage`
- `Template usage`
- `Template selections`
- `Templates selected`
- `Top templates`
- `Unknown template`
- `Use template`
- `templateKey`
- `templateSource`
- `session_draft_generated`
- `workout_builder_saved`
- `workout_builder_started`
- `sourceKind`
- `sessionType`
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

Executed on `2026-06-10`:

- Identifiers searched: `workout_builder_template_selected`, `workoutBuilderTemplate`, `templateUsage`, `Template usage`, `Template selections`, `Templates selected`, `Top templates`, `Unknown template`, `Use template`, `templateKey`, `templateSource`, `session_draft_generated`, `workout_builder_saved`, `workout_builder_started`, `sourceKind`, `sessionType`, `Admin Analytics`, `analytics dashboard`, `/api/admin/analytics/insights`, `ANALYTICS_EVENT_NAMES`, `finance reporting`, `Stripe reconciliation`, and `CSV export`.
- Directories/surfaces checked: `app/`, `components/`, `lib/analytics/`, `lib/workouts/`, `lib/session-generator-v1/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, Help/Guide sources and assertions, active/planned/deferred/done analytics, workout, commerce, and AW-006/AW-022 briefs.
- Fallout handled: added aggregate `workoutBuilderTemplateUsage` to admin insights, mapped generated-completion template usage from `not_instrumented` to explicit selection count, added Admin Analytics template usage UI, updated Help/Guide interpretation, updated API/architecture contracts, updated parent/active briefs, and added targeted unit/component assertions.
- Deferred fallout: no new event, no new payload field, no new template call site, no persisted template table/admin template CRUD, no CTA/upsell/checkout/pricing/entitlement/Stripe change, no CSV/export, no finance-grade reporting, no vendor forwarding, no cookies/visitor IDs/tag manager, no raw event drilldown, no migration/RLS/generated DB type/rollup/retention job, and no workout-builder/generator UX change.

## Scope

- Audit the existing `workout_builder_template_selected` event, payload helper, explicit `Use template` call site, and template registry contract before mapping.
- Add a compact read-only Admin Analytics module or extend the existing generated-completion/template area to show template selections from the explicit event.
- Derive template usage only from `workout_builder_template_selected` and safe mapped `templateKey`/`templateSource` values.
- Resolve display labels from the workout-template registry/contract, not raw analytics payload labels.
- Preserve existing range selection, refresh/retry behavior, admin-only access, no-store reads, trust states, row cap, and privacy boundary.
- Add targeted tests for insights/view-model derivation, rendered dashboard, interpretation copy, unknown/unmapped template keys, unsafe raw field filtering, and safe fallbacks.
- Update Help/Guide, API/architecture contracts, and parent/child checkpoint logs as needed.
- Capture and hand off screenshots before pre-PR validation.

## Out Of Scope

- Adding new analytics events, new payload fields, or new template instrumentation call sites.
- Creating a new workout-template product system, persisted template table, admin template CRUD, or database schema.
- Treating goal templates, email templates, admin incident templates, route templates, session type, generator block toggles, draft generation, source kind, save events, button text, or display labels as workout-builder template usage.
- CTA placement, upsell copy, checkout/pricing/entitlement/Stripe behavior, refunds, payouts, finance reporting, accounting export, product catalog change, export/CSV, third-party vendor analytics, cookie, visitor ID, tag manager, raw payload drilldown, migration, RLS change, generated DB type update, rollup job, retention job, or workout-builder/generator UX change.
- Unique-user conversion, attribution, revenue, support automation, product-quality scoring, or finance-grade reporting.

## Acceptance Criteria

1. Brief moves to `in-progress` only after the owner explicitly approves implementation of this named child.
2. Implementation begins with a recorded mapping-support audit of event taxonomy, payload safety, template registry identity, and explicit selection call site.
3. Template usage counts derive only from `workout_builder_template_selected`.
4. Missing, malformed, unknown, deprecated, duplicate, capped, schema-missing, no-data, stale, and fetch-failed states render deterministic safe UI.
5. Admin Help/Guide explains metric meaning and non-meaning before PR handoff.
6. UI implementation includes screenshot handoff and owner approval before `npm run verify:pre-pr`.
7. Commercial CTA, checkout, Stripe, entitlement, export, vendor, and finance work stay out of this child.
8. Changed briefs pass `npm run lint:briefs`.

## Validation

Planning-only brief creation:

- `npm run lint:briefs`
- `git diff --check`

Implementation validation:

- `./node_modules/.bin/vitest run tests/unit/admin-analytics-insights.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx` - passed, `4` files and `22` tests.
- route/label/support-surface sweep - completed on `2026-06-10`; fallout recorded above.
- screenshot handoff for Admin Analytics module and one non-happy state - captured on `2026-06-10 21:38` in `output/workout-builder-template-usage-admin-analytics-mapping-v1-2026-06-10-212800`; owner approved on `2026-06-10`.
- regenerated screenshot handoff after pre-commit formatting - captured on `2026-06-10 21:58` in `output/workout-builder-template-usage-admin-analytics-mapping-v1-2026-06-10-215814`; owner approved on `2026-06-10`.
- `npm run typecheck` - passed.
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr` - passed full lane on `2026-06-10`; included lint, typecheck, `239` unit test files / `1505` tests, production build, perf budgets, and Playwright e2e (`106` passed, `536` skipped by existing environment guards).
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Canonical child path: `docs/task-briefs/in-progress/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md`
- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Latest completed child path: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- Contract path: `docs/architecture/workout-builder-template-identity-selection-contract.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child and the parent brief, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | planned child created | created this planned Admin Analytics mapping child from clean synced main@a4cb0f6f after PR #1061 and closeout PR #1062; implementation is not approved yet and must begin with a mapping-support audit so template usage is counted only from workout_builder_template_selected and not inferred from adjacent builder/generator/save/commercial activity | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation on branch workout-builder-template-usage-admin-analytics-mapping-v1; lifecycle moved from planned to in-progress and parent marked the child active before the required mapping-support audit | next: audit event taxonomy, payload safety, template registry identity, and explicit selection call site before dashboard mapping`
- `2026-06-10 | implementation + targeted tests | mapping-support audit passed; added server-side template usage aggregation, Admin Analytics view-model/UI, Help/Guide/API/architecture contract updates, route/label/support sweep evidence, and targeted tests; targeted Vitest and typecheck passed | next: run lint gates, capture screenshot handoff, and stop for owner visual approval before verify:pre-pr`
- `2026-06-10 | screenshot handoff stop | lint:quality-gates, lint:briefs -- --all, and git diff --check passed; captured after/reference screenshot artifacts in output/workout-builder-template-usage-admin-analytics-mapping-v1-2026-06-10-212800 using a temporary local-only harness route; harness route removed after capture and no product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-10 | screenshot approved | owner approved the screenshot handoff; no product-rendering files changed after capture | next: run npm run verify:pre-pr before commit, push, and PR handoff`
- `2026-06-10 | pre-pr gate passed | npm run verify:pre-pr passed full lane with branch-current, lint, typecheck, unit, build, perf budgets, and Playwright e2e; no tracked gate artifacts changed | next: commit, push, and open PR`
- `2026-06-10 | regenerated screenshot handoff stop | pre-commit formatting touched the committed diff after the first screenshot approval, so screenshots were regenerated in output/workout-builder-template-usage-admin-analytics-mapping-v1-2026-06-10-215814 against committed HEAD with the temporary local-only harness removed afterward; no product-rendering files changed after the regenerated capture | next: wait for owner approval before push, PR, and pre-merge gate`
- `2026-06-10 | regenerated screenshot approved | owner approved the regenerated after/reference screenshot handoff; no product-rendering files changed after the regenerated capture | next: amend commit with approval evidence, run final npm run verify:pre-pr, push, and open PR`
