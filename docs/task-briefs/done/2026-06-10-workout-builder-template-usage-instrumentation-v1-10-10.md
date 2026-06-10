# Task Brief: Workout Builder Template Usage Instrumentation V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10`
- `status`: `done`
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
  - `docs/architecture/workout-builder-template-identity-selection-contract.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-builder-template-usage-instrumentation-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@c2171772` after Workout Builder Template Runtime Source / Selection Surface V1 PR `#1059` and repo-managed closeout PR `#1060`
- `audit_status`: `ready`
- `decision`: Resume runtime implementation now that PR `#1059` shipped a registry-backed workout-template source and explicit `Use template` selection surface that satisfy `docs/architecture/workout-builder-template-identity-selection-contract.md`.
- `reason`: The previous blocker is resolved by `lib/workouts/templates.ts` and `components/my-library/workouts/WorkoutBuilderHub.tsx`, where active templates use stable write-once `templateKey` values and the user explicitly selects `Use template` to start a local editable workout draft.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, analytics event taxonomy, `ANALYTICS_EVENT_NAMES`, `lib/analytics/workout-builder.ts`, `lib/analytics/events.ts`, `lib/analytics/persistence.ts`, `/api/analytics/event`, workout-builder/generator template surfaces, `lib/session-generator-v1/`, `components/my-library/generator/`, `components/my-library/workouts/`, `/api/admin/analytics/insights`, Admin Analytics dashboard/template usage contract, Help/Guide contract, or route/label/support sweep rules change before implementation starts.

Current unblock contract:

- `docs/architecture/workout-builder-template-identity-selection-contract.md` defines the conservative decision: runtime template selection must use immutable `templateId` or write-once `templateKey`, selection requires an explicit `Use template`-equivalent action that starts or populates a draft, and unknown/deprecated values fail closed.
- `docs/task-briefs/done/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md` is merged and validated as the real runtime source/selection surface. This child may now add `workout_builder_template_selected` only to the explicit `Use template` selection action.

## Goal

Persist one privacy-safe first-party signal for real workout-builder template usage only when a stable workout-builder template identity and explicit template-selection action exist.

## Pre-Implementation Owner Explanation

Vi lager en trygg maleplan for ekte malbruk i Workout Builder. Poenget er aa telle naar en bruker faktisk velger en konkret workout-mal, ikke gjette fra session type, generator-blokker eller at et AI-utkast ble laget. Dette gjor senere Admin Analytics mer paalitelig for produktvalg. Utenfor scope er ny template-UI, nytt template-datasystem, CTA, checkout, Stripe, priser, finance, export, tredjeparts analytics, vendor forwarding og bred builder/generator-UX.

Forward-compatibility-intent: nye workout templates skal kunne telles gjennom en stabil template-ID/key dersom de kommer fra samme kontrakt. Nye template-kilder, template-typer, dashboard-KPI-er, kommersielle plasseringer eller lokaliserte admin-labels krever eksplisitt mapping, Help/Guide-kopi og tester.

## Decision Gate Before Runtime Work

Implementation must start with a template-support audit before adding an event or call site:

1. Identify the exact workout-builder template source of truth:
   - stable template ID/key,
   - whether the ID is immutable, write-once, or renameable,
   - whether the human label/title can change,
   - where the user explicitly chooses the template.
2. Confirm that the surface belongs to workout-builder/session creation, not unrelated goal templates, email templates, admin incident templates, route templates, or marketing templates.
3. If a stable template identity and explicit selection action exist, instrument only that action with a new typed event.
4. If no stable workout-builder template identity exists, do not emit a fake event and do not infer template usage from:
   - `sessionType`,
   - `generator_intake_block_toggled`,
   - `session_draft_generated`,
   - `workout_builder_saved`,
   - generated/manual `sourceKind`,
   - button labels or display copy.
5. If the product decision is to create a new reusable workout-template system first, stop and create a separate planned brief for that data/product slice before implementation.

Template-support audit result on `2026-06-10` before runtime source existed:

- Runtime implementation is blocked.
- No stable workout-builder template source of truth was found in current runtime code.
- No explicit user action currently selects a workout-builder template.
- Existing generator intake choices in `components/my-library/generator/GeneratorIntakeHub.tsx` are profile/data block toggles, not reusable workout-template selection.
- Existing generated draft telemetry in `components/my-library/generator/SessionGeneratorPanel.tsx` records `sessionType`, `environment`, `sizeMode`, and `hasCss` after draft generation, not template usage.
- Existing workout save telemetry in `app/api/my-library/workouts/**` and `lib/analytics/workout-builder.ts` records `sourceKind`, `saveKind`, builder/session dimensions, and totals after canonical create/update, not template identity.
- `lib/workouts/shared.ts` currently defines `WORKOUT_SOURCE_KINDS` as `ai_session_v1` and `manual`; neither value is a reusable template identity.
- Current `template` surfaces found by route/label/support sweep are unrelated to this KPI:
  - goal templates in `lib/goals/mvp.ts` and `components/my-library/goals/GoalsHub.tsx`,
  - admin email templates in `app/api/admin/email-templates/**` and `components/admin/AdminEmailTemplatesManager.tsx`,
  - admin incident quick templates in `components/admin/AdminNotesManager.tsx`,
  - public route templates in `lib/analytics/public.ts`,
  - course copy and future/planned brief references.
- The in-progress parent `docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md` references future persisted workout/step/template identity from the data-contract slice, but that is not available as a current runtime source for this instrumentation child.
- Implementation decision:
  - do not add `workout_builder_template_selected`,
  - do not add a payload helper or call site,
  - keep Admin Analytics template usage as `not_instrumented`,
  - require a separate product/data decision for a real workout-template identity and selection contract before this instrumentation can resume.

Refresh audit result on `2026-06-10` after PR `#1059` / `#1060`:

- Runtime implementation may resume.
- `lib/workouts/templates.ts` is the V1 repo-canonical source of truth for active workout-builder template identity.
- `templateKey` is the stable write-once low-cardinality identity for V1 instrumentation.
- `components/my-library/workouts/WorkoutBuilderHub.tsx` exposes the explicit `Use template` action that starts a local editable workout draft.
- Instrument only that selection action.
- Continue to keep Admin Analytics template usage as `not_instrumented` until a later dashboard mapping child decides how to aggregate and label the event.

Event name:

- `workout_builder_template_selected`

Allowed payload shape:

- `source`: `workout_builder`
- `surface`: `my_library_workouts`
- `templateId` or `templateKey`: stable low-cardinality machine ID only
- `templateSource`: safe bounded source such as `workout_builder_v1`
- `builderMode`: existing builder mode where available
- `environment`, `sessionType`, or `sizeMode`: only if they are already safe canonical values

Forbidden payload values:

- template title/label when user-editable,
- workout title,
- notes,
- raw workout text,
- raw URL/referrer,
- email,
- IP,
- user agent,
- user ID,
- payment/cart/customer data,
- Stripe IDs,
- visitor IDs,
- raw payload JSON in Admin UI.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The child answers one product question only: did a user explicitly select a real workout-builder template before later dashboard or commercial decisions.                         | template-support audit + implementation diff            | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: existing builder/generator flows remain unchanged and analytics failures must not block navigation, template selection, draft creation, or save.                 | component/call-site tests + diff review                 | `4/5`                   |
| Visual design quality                         | `supporting` | Supporting only: this slice updates Admin Analytics/Help interpretation copy without layout, CSS, card structure, print, brand, or workflow UI changes.                           | screenshot handoff + copy diff                          | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Event emits only for an explicit template-selection action with a stable workout-builder template ID/key; no inferred or adjacent activity is counted as template usage.          | payload helper tests + call-site tests + audit record   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin Analytics remains read-only and no admin edit/config workflow is introduced.                                                                               | admin scope rationale                                   | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: updated text remains in existing semantic Help/Admin containers; no keyboard flow, focus order, aria label, or interactive state changes.                        | component tests + screenshot review                     | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Event is best-effort, low-cardinality, dependency-free, and does not add charting, vendor scripts, extra route loads, or large payloads.                                          | payload tests + package diff + verify gate              | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics rows remain server-canonical in `analytics_events`; template truth stays in the existing workout-template source; no local analytics identity is added.                 | data contract + tests                                   | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing analytics ingestion and admin insight reads remain no-store; no cache/revalidation behavior changes.                                                    | route/cache review                                      | `4/5`                   |
| Reliability and failure handling              | `target`     | Analytics failure fails soft and cannot block template use, generator handoff, builder navigation, draft creation, or workout save; missing template identity does not emit.      | negative-path tests                                     | `5/5`                   |
| Security and authz                            | `target`     | Protected user/template surfaces retain existing auth boundaries; unauthorized or invalid template actions do not create trusted template-usage events.                           | auth boundary review + negative-path tests              | `5/5`                   |
| Privacy and compliance                        | `target`     | Payload includes only safe scalar workflow dimensions and stable non-sensitive template IDs; no raw titles/text/URLs, personal identifiers, payment data, or raw payload UI.      | sanitizer/payload tests + privacy docs                  | `5/5`                   |
| Content governance                            | `target`     | Event taxonomy, template-identity caveats, unsupported inference rules, and parent/child checkpoint logs stay aligned before implementation.                                      | docs/API contract + route/label/support sweep           | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow action, role, recovery path, or edit behavior changes; Help/Admin interpretation copy is updated to avoid stale template-usage guidance.       | Help/Guide assertions + screenshot handoff              | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable content.                                                        | explicit SEO scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic content, public entity page, structured data, or AI-facing crawl surface.                                                                | explicit AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `target`     | Template usage becomes observable only through a typed, privacy-safe event with stable identity; dashboard template-count claims remain out of scope until a later mapping child. | event tests + API/docs contract + admin fallback review | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Template usage remains pre-commerce product telemetry and is not checkout conversion, revenue attribution, entitlement truth, Stripe reconciliation, or finance reporting.        | commerce boundary review + docs caveat                  | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing analytics diagnostics remain enough; no new alert, on-call path, incident workflow, or support recovery flow is introduced.                             | diagnostics scope rationale                             | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: this slice changes no finance reconciliation, refunds, payouts, invoices, revenue recognition, accounting export, or Stripe reporting.                           | explicit finance scope rationale                        | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: event IDs are machine names; future visible admin labels/localized dashboard copy require explicit mapping and tests.                                            | event-label fallback test or scope rationale            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing analytics helpers, event taxonomy, workout-builder/template source, route boundaries, and test stack; add no dependency, vendor, migration, or dashboard library.  | changed-files review + package diff                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted taxonomy, payload, call-site, sanitizer, and negative-path tests pass before full `verify:pre-pr`; merge readiness requires `verify:pre-merge` and green CI.             | targeted tests + verify gates + CI                      | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Low-cardinality event and bounded scalar dimensions avoid per-title/per-user/per-workout cardinality growth and require no warehouse/export job.                                  | payload/cardinality review + query/rollup review        | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration, provider, env, secret, or external service change; rollback is revert of additive event/call-site/docs/tests only.                                                  | PR summary + verify gates + rollback note               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: reuse the existing `components/my-library/workouts/WorkoutBuilderHub.tsx` template selection surface, `components/admin/AdminHelpCenter.tsx`, and `lib/analytics/admin-dashboard.ts` view-model/caveat structure rather than creating a new UI surface.
  - Use the existing `/api/analytics/event` client route through `sendClientAnalyticsEvent` for client-side template selection, or existing server analytics persistence only if the selection is server-confirmed.
  - Do not add a new route, modal, dashboard tab, chart, export action, or dashboard builder.
  - Do not change route cache behavior; analytics ingestion/admin reads remain no-store.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` remains unchanged; this slice does not alter session-step rendering, shared renderer behavior, step editing, repeat groups, or workout draft semantics.
- TypeScript/domain contracts:
  - Add `workout_builder_template_selected` to `ANALYTICS_EVENT_NAMES` only after the audit proves a valid call site.
  - Add or extend a narrow workout-builder analytics helper so payload shape is typed, sanitized, bounded, and testable.
  - Validate stable template IDs/keys with a low-cardinality safe identifier rule.
  - Unknown or invalid template identity must return `null`/no-event rather than a misleading `unknown` template usage success.
- Supabase/data layer:
  - Prefer existing `analytics_events` persistence; no migration, generated DB type update, RLS change, index, rollup job, materialized view, or raw payload admin read is in scope.
  - Existing authenticated user boundaries for the template surface must remain unchanged.
  - Raw payload JSON must never be returned to Admin UI.
- External services/tools:
  - No Plausible, GA4, Meta, Hotjar, Clarity, tag manager, cookie, visitor ID, webhook, SDK, secret, Stripe, checkout, or finance integration change.
- UI system:
  - Shared component reuse: keep the existing Admin Analytics cards/lists and Help/Guide sections; update only the interpretation copy needed to avoid stale template-usage guidance.
  - No visible layout, CSS, card structure, print, brand, route, or workflow action change is planned.
  - Because visible Admin Analytics/Help text changes, screenshot handoff is required before `npm run verify:pre-pr`.
- Testing:
  - Unit tests for event taxonomy and payload helper.
  - Component/call-site tests for explicit template selection when a valid stable ID exists.
  - Negative-path tests for no event on missing/invalid template identity, unrelated template surfaces, denied actions, and analytics failure.
  - Sanitizer/privacy tests proving titles, notes, raw URLs, emails, IPs, user agents, user IDs, payment data, and raw workout text are excluded.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted analytics rows in `analytics_events`.
  - The stable workout-builder template source of truth identified in the audit, if it exists.
- Server-only derived data:
  - Admin insights may later aggregate event counts, but this instrumentation slice does not add a dedicated template-usage dashboard module.
  - Raw payload JSON remains server-only.
- Local/browser:
  - Existing builder/generator transient UI state only.
  - No analytics visitor ID, localStorage analytics key, cookie, admin preference, or public-to-user attribution bridge is added.
- Sync policy:
  - Client template-selection telemetry is best-effort and may duplicate on retry; it is product telemetry, not business truth.
  - Analytics persistence failures fail soft.
  - Missing or invalid template identity emits no template-usage event.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Payloads must not include raw workout text, workout titles, notes, raw URLs/referrers, emails, IPs, user agents, user IDs, visitor IDs, payment/cart/shipping data, Stripe customer IDs, or editable template display labels.
- Cache/invalidation:
  - Analytics event route and Admin Analytics insights remain no-store.
  - No template cache invalidation or revalidation behavior changes in this instrumentation-only slice.

## Identity And Rename Contract

- Canonical stable ID:
  - Event identity is `event_name`: proposed `workout_builder_template_selected`.
  - Template identity must be a stable workout-builder template ID/key from the source of truth identified in the audit.
- Human-readable identifiers:
  - Template title/label is display-only and may be renamed without changing analytics identity.
  - Admin labels are display-only and may be renamed when event meaning is unchanged.
- Mutability rules:
  - Shipped event names are append-only.
  - Template IDs/keys used in analytics should be immutable or write-once; changing the meaning of a template ID is repurpose.
- Rename vs repurpose:
  - Renaming a template title is allowed if the underlying template remains the same.
  - Reusing a template ID/key for a materially different workout template is repurpose and requires a new ID/key or explicit migration/alias brief.
- Compatibility contract:
  - Unknown future event names continue through generic Admin Analytics event lists.
  - Unknown or deprecated template IDs are not eligible for dedicated template-specific KPI modules until mapped by a later brief.
- Observability and repair:
  - Invalid/missing template IDs are detectable through no-event negative tests and analytics diagnostics.
  - Deprecated template IDs require an alias/migration decision before they are counted in dedicated dashboard breakdowns.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Workout-builder template IDs/keys, template source kinds, builder modes, environments, session types, size modes, analytics event names, payload fields, admin dashboard labels, Help/Guide copy, future locales, export formats, commerce funnel modules, and future product IDs.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Template identity must come from the audited workout-builder template source, not display copy or current button labels.
  - Analytics counts come from `analytics_events` and `/api/admin/analytics/insights`, not client storage or hardcoded fixtures.
- Additive behavior:
  - New templates from the same stable template source can emit the same event automatically when they provide valid safe IDs/keys.
  - Generic Admin Analytics top-event lists can show the new event before a dedicated KPI module exists.
  - Existing generated-completion metrics continue to render template usage as not instrumented until a later dashboard child maps this event.
- Explicit mapping requirements:
  - New template sources, template families, generated-plan completion stages, dedicated template usage dashboard modules, commercial CTA placement, checkout attribution, export formats, finance reporting, vendor forwarding, public-to-user attribution, or localized admin copy require explicit mapping, docs, tests, and owner decision.
- Unknown or deprecated values:
  - Invalid template IDs emit no event.
  - Valid but unmapped template IDs remain aggregate template-selected events only; future template-specific breakdowns must define `unknown_template` or alias behavior before release.
  - Deprecated event names require alias/migration handling before they affect dedicated ratios.
- Test/evidence:
  - Include fixtures for valid template ID, missing template ID, invalid/free-text template ID, renamed template label, unrelated template surface, analytics failure, duplicate selection, and future-safe template source values.
  - Run route/label/support sweep for event taxonomy, template identity, Help/Guide, API contracts, privacy docs, and analytics dashboard caveats.

## Help / Guide Impact

Required because this implementation adds the `workout_builder_template_selected` event while keeping the dedicated Admin Analytics template usage KPI unmapped. Admin Help/Guide and Admin Analytics caveats must say template usage is not dashboard-mapped yet, not that the event is missing. No admin workflow action, role, recovery path, or edit behavior changes.

## Screenshot / Visual Impact

Screenshot artifact handoff is required because visible Admin Analytics/Help interpretation copy changes. No rendered layout, CSS, print, brand, responsive behavior, card structure, button text, or user-facing workout workflow state should change.

- Screenshot artifacts: required after targeted implementation QA is stable.
- Screenshot comparison naming: `after/reference`, focused on Admin Analytics and Help/Guide interpretation copy.
- Owner screenshot approval stop: required before `npm run verify:pre-pr`, PR update, and `npm run verify:pre-merge`.

Captured on `2026-06-10 20:18`:

- Artifacts folder: `output/workout-builder-template-usage-instrumentation-2026-06-10-201809`
- Handoff type: `after/reference`.
- Screenshots:
  - `after-admin-analytics-template-mapping-desktop.png`
  - `after-admin-help-analytics-copy-desktop.png`
  - `after-admin-help-analytics-copy-mobile.png`
  - `reference-admin-analytics-dashboard-shell-desktop.png`
- Capture note: local `/dev/login` was blocked by the Supabase egress guard, so screenshots used a temporary local-only harness route that rendered the production Admin Analytics/Help components with deterministic fixture data; the harness route was removed after capture. No scoped product-rendering files changed after capture.

## Route / Label / Support Surface Sweep

Required because analytics taxonomy and template-identity contracts change.

Search at minimum:

- `workout_builder_template_selected`
- `templateUsage`
- `Template usage`
- `template-selection`
- `template selected`
- `session_draft_generated`
- `generator_intake_block_toggled`
- `workout_builder_saved`
- `workout_builder_started`
- `ANALYTICS_EVENT_NAMES`
- `/api/analytics/event`
- `/api/admin/analytics/insights`
- `sourceKind`
- `sessionType`
- `finance reporting`
- `Stripe reconciliation`
- `CSV export`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/session-generator-v1/`
- `lib/workouts/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/done analytics, workout, commerce, and AW-022 briefs.

Executed on `2026-06-10`:

- Identifiers: `workout_builder_template_selected`, `Template usage`, `Use template`, `templateKey`, `templateId`, `Admin Analytics`, `Help/Guide`, `sourceKind`, and `sessionType`.
- Fallout handled: added typed event taxonomy, added privacy-safe payload helper, instrumented only the explicit `Use template` action, updated Admin Analytics generic event label, updated Admin Analytics/Help/API/architecture support interpretation from event-missing to dashboard-mapping-missing, and kept generated-completion template usage as `not_instrumented`.
- Deferred fallout: no dedicated template usage dashboard aggregation, no Admin Analytics template-count KPI, no raw payload drilldown, no CSV/export, no checkout/pricing/Stripe/finance/vendor analytics, no persisted template table, no RLS/migration/generated DB type change, and no inference from session type, generator toggles, source kind, save events, or visible labels.

## Scope

- Record the refreshed audit that `lib/workouts/templates.ts` and `Use template` now satisfy the resume condition.
- Add a typed, privacy-safe `workout_builder_template_selected` event for explicit workout-builder template selection.
- Add a narrow payload helper that accepts only stable bounded template identity and safe canonical workout-builder dimensions.
- Emit the event best-effort from the existing template selection action only.
- Update Admin Analytics/Help interpretation copy so `not_instrumented` means not dashboard-mapped yet, not that the event is missing.
- Keep Admin Analytics template usage as `not_instrumented`.
- Record route/label/support sweep evidence and parent checkpoint status.

## Out Of Scope

- Creating a new workout-template product system or database schema.
- Treating goal templates, email templates, admin incident templates, route templates, session type, generator block toggles, draft generation, or source kind as workout-builder template usage.
- Dedicated Admin Analytics template usage dashboard module.
- CSV/export.
- Raw event drilldown.
- Public analytics vendor activation.
- Cookies, visitor IDs, tag manager, GA4/Plausible forwarding, or third-party analytics.
- CTA placement, upsell copy, checkout, pricing, entitlements, Stripe, refunds, payouts, finance reporting, accounting export, or revenue attribution.
- Builder/generator UX redesign.
- Migrations, RLS changes, generated DB type changes, rollup jobs, materialized views, or new dependencies.

## Acceptance Criteria

1. Runtime work begins with a recorded audit of the real workout-builder template source and explicit selection action.
2. `workout_builder_template_selected` is added only after the stable `templateKey` source and `Use template` action are confirmed.
3. Payload helper rejects missing, invalid, deprecated, editable, raw, or high-cardinality template/workout/user values and returns no event for invalid identity.
4. The template selection call site emits best-effort telemetry without blocking draft creation or navigation when analytics fails.
5. Existing Admin Analytics generated-completion/template state is not relabeled as counted template usage in this child.
6. Route/label/support sweep is recorded with no fake template inference from adjacent surfaces.
7. Screenshot handoff covers the visible Admin Analytics/Help interpretation copy before `npm run verify:pre-pr`.
8. Changed briefs pass `npm run lint:briefs`, targeted tests, `npm run typecheck`, `npm run lint:quality-gates`, `git diff --check`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`.

## Validation

- targeted unit/component tests for analytics taxonomy, payload helper, template call site, sanitizer/privacy exclusions, and negative paths
- route/label/support-surface sweep
- screenshot handoff for Admin Analytics/Help interpretation copy
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Done child path: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- Done unblock path: `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
- Done runtime source path: `docs/task-briefs/done/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md`
- Contract path: `docs/architecture/workout-builder-template-identity-selection-contract.md`
- Current status: done; PR `#1061` shipped the privacy-safe `workout_builder_template_selected` event for the registry-backed `templateKey` source and explicit `Use template` action created by PR `#1059`.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child and its parent, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | planned child created | created planned child brief from clean synced main@99acbbb5 after PR #1055 and closeout PR #1056; implementation is not approved yet and must begin with a workout-builder template-support audit so template usage is not inferred from unsupported signals | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation on branch workout-builder-template-usage-instrumentation-v1; lifecycle moved from planned to in-progress and parent marked the child active before the required template-support audit | next: audit runtime template support before adding any event or call site`
- `2026-06-10 | blocked by audit | route/label/support sweep found no current runtime workout-builder template entity, stable template ID/key, or explicit template-selection action; existing generator intake blocks, session draft generation, workout save source kinds, goal templates, email templates, admin incident templates, and route templates are not valid template-usage sources | next: owner decision on whether to create a workout-template identity/selection contract before resuming instrumentation`
- `2026-06-10 | unblock brief planned | created docs/task-briefs/planned/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md as the product/data contract that must decide template source-of-truth, stable ID/key, rename/repurpose behavior, and explicit selection action before this instrumentation can resume | next: wait for owner implementation approval or scope edits on the unblock brief`
- `2026-06-10 | unblock contract implemented | docs/architecture/workout-builder-template-identity-selection-contract.md now defines the required future identity/selection rules and confirms current runtime template selection is not supported; this instrumentation child remains blocked until a runtime source and explicit selection surface are implemented under that contract | next: do not resume instrumentation until a dedicated runtime template source/selection child exists`
- `2026-06-10 | unblock contract merged | PR #1057 closed the identity/selection contract at docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md; this instrumentation child remains blocked because the contract deliberately did not create a runtime template source or explicit selection surface | next: create a separate runtime template source/selection child before instrumentation resumes`
- `2026-06-10 | runtime source merged | PR #1059 and closeout PR #1060 shipped the registry-backed template source and explicit Use-template selection surface; child moved back to in-progress from clean main@c2171772 | next: implement the typed privacy-safe workout_builder_template_selected event only on the explicit template selection action`
- `2026-06-10 | implementation + targeted tests | added the typed workout_builder_template_selected event, bounded template payload helper, explicit Use-template call site, Admin Analytics/Help/API interpretation updates, route/label/support sweep evidence, and targeted Vitest coverage; targeted tests passed for analytics events, workout-builder analytics, workout-builder hub, Admin Analytics view model/dashboard, and Admin Help Center | next: run typecheck/lint gates, capture screenshot handoff, and stop for owner visual approval before verify:pre-pr`
- `2026-06-10 | screenshot handoff stop | typecheck, lint:quality-gates, lint:briefs -- --all, and git diff --check passed; captured after/reference screenshot artifacts at output/workout-builder-template-usage-instrumentation-2026-06-10-201809 using a temporary local-only harness route because /dev/login was blocked by the Supabase egress guard; harness route removed after capture and no scoped product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-10 | screenshot approved | owner approved the screenshot handoff in chat; no scoped product-rendering files changed after capture | next: run npm run verify:pre-pr`
- `2026-06-10 | pre-PR gate passed | npm run verify:pre-pr passed locally on the full lane after screenshot approval; Playwright skipped authenticated/dev-login-dependent cases where the local Supabase auth endpoint returned the expected unavailable HTML response | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
- `2026-06-10 | implementation merged | PR #1061 merged at squash commit 6d87eb68 after green local verify:pre-pr, green required CI, and npm run verify:pre-merge; the child moved to done in this repo-managed closeout | next: finish docs-only closeout PR and rerun post-merge-preflight`

## Completion Record

- `completed`: `2026-06-10`
- `merged_pr`: `#1061`
- `squash_commit`: `6d87eb68`
- `result`: Closed Workout Builder Template Usage Instrumentation V1 by adding a typed first-party template-selection event for the explicit registry-backed `Use template` action while keeping Admin Analytics template usage unmapped until a later dashboard child.
- `validation`: Targeted Vitest coverage passed for event taxonomy, payload helper, call site, Admin Analytics view model/dashboard, and Admin Help Center; `npm run verify:pre-pr` passed on full lane; PR CI passed; `npm run verify:pre-merge` passed.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                    | Gaps / Notes                                                           |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#1061`, route/label/support sweep, parent checkpoint                                                                                                    | No gap in slice; dashboard mapping remains a later child.              |
| Business logic correctness and data integrity | `5/5`          | Payload helper tests and call-site tests prove only explicit valid template selection emits.                                                                | None.                                                                  |
| Performance (CWV + payloads)                  | `5/5`          | Dependency-free best-effort event, bounded scalar payload, full `verify:pre-pr` perf gate.                                                                  | None.                                                                  |
| Data placement and sync boundaries            | `5/5`          | Existing `analytics_events` ingestion and registry-backed template identity; no migration or local analytics identity.                                      | None.                                                                  |
| Reliability and failure handling              | `5/5`          | Analytics failure remains best-effort; invalid/missing template identity emits no event.                                                                    | None.                                                                  |
| Security and authz                            | `5/5`          | Existing protected workout-builder/auth boundaries retained; no trusted event for invalid template identity.                                                | None.                                                                  |
| Privacy and compliance                        | `5/5`          | Payload excludes raw titles, notes, URLs, user identifiers, payment data, and high-cardinality workout values.                                              | None.                                                                  |
| Content governance                            | `5/5`          | API/architecture/Help/Admin Analytics contracts updated; parent and child checkpoints aligned.                                                              | None.                                                                  |
| Analytics and KPI observability               | `5/5`          | Typed `workout_builder_template_selected` event exists; Admin Analytics still states dashboard mapping is not present.                                      | Dedicated template usage dashboard aggregation intentionally deferred. |
| Commerce and revenue ops                      | `5/5`          | Docs preserve boundary that template usage is product telemetry, not checkout conversion, revenue attribution, Stripe reconciliation, or finance reporting. | None.                                                                  |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing analytics helpers, event taxonomy, template registry, Admin Analytics view model, and Vitest/Testing Library stack.                         | None.                                                                  |
| Testing and QA automation                     | `5/5`          | Targeted tests, `npm run lint:briefs -- --all`, `npm run verify:pre-pr`, green CI, and `npm run verify:pre-merge`.                                          | None.                                                                  |
| Scalability and cost efficiency               | `5/5`          | Low-cardinality event dimensions; no warehouse/export job, dependency, vendor, or new aggregation table.                                                    | None.                                                                  |
| DevOps and rollback readiness                 | `5/5`          | Additive event/call-site/docs/tests only; rollback is reverting PR `#1061`.                                                                                 | None.                                                                  |
