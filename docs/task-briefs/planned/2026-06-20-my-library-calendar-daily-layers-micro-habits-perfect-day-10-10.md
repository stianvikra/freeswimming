# Task Brief: My Library Calendar Daily Layers For Micro, Habits, Perfect Day (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-daily-layers-micro-habits-perfect-day-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-21`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `E`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@4b7d7aee`
- `audit_status`: `ready`
- `decision`: Use this as the next bounded Calendar child only after explicit runtime approval; the first runtime pass must implement a typed read-only daily-layer adapter from the existing Habits, Micro Sessions, and Perfect Day source contracts.
- `reason`: Calendar children `A`, `B`, `C`, and `D` have shipped planned swim identity, month/day-detail placement, planned-only actions, and manual completed swim events. Existing repo helpers already expose Habits/Perfect Day daily summaries and Micro Sessions block history, but the Calendar still needs a typed layer view-model so compact day signals do not become a second editor or a second source of truth.
- `must_refresh_before_execution_if`: Refresh if `app/my-library/calendar/page.tsx`, `components/my-library/CalendarPlanWeekHub.tsx`, `components/my-library/CalendarPeriodComparisonHub.tsx`, `lib/my-library/calendar.ts`, `lib/my-library/calendar-plan.ts`, `lib/my-library/calendar-comparison.ts`, `lib/habits/shared.ts`, `lib/habits/server.ts`, `lib/dryland/micro-plans.ts`, `components/my-library/habits/HabitPerfectDayHub.tsx`, `components/my-library/dryland/DrylandMicroPlanPanel.tsx`, completed swim event contracts, Help/Guide/support surfaces, scorecard categories, screenshot rules, or verification lanes change before implementation starts.

## Goal

Add compact daily calendar layers for completed micro sessions, habits overview, and Perfect Day score so the calendar becomes a whole-day training overview without becoming the editor for those source systems.

## Pre-Implementation Owner Explanation

Codex skal legge micro sessions, habits og Perfect Day inn i kalenderen som enkle dags-signaler. Det gir oversikt over hele dagen, men detaljene og redigeringen skal fortsatt ligge i de eksisterende flatene. Utenfor scope er å bygge om habits, micro sessions, Perfect Day scoring, Garmin, swim completion, Stats Swimming-sammenligning, performance-ratchet og `Ja.docx`.

## Current Repo State

- `/my-library/calendar` has `Plan` and `Stats` modes.
- `Plan` reads owner-scoped `planned_workout_instances`, renders a desktop month grid and selected-day detail, and can manually mark eligible planned swims complete through `completed_activity_events`.
- `Stats` already compares `Habits`, `Micro Sessions`, and `Dryland`; `Swimming` remains intentionally unmapped in Stats until completed swim events get a separate comparison mapping.
- `lib/habits/shared.ts` exposes `buildHabitDaySummary`, including scheduled habit count, Perfect Day item count, satisfied Perfect Day item count, completion percent, Perfect Day boolean, timed minutes, and count totals.
- `lib/my-library/calendar-comparison.ts` already loads owner-scoped Habits check-ins and micro-plan rows for a bounded date range.
- Micro Sessions comparison currently parses `dryland_micro_plans.blocks` and counts completed/skipped blocks by `completedAt`/`skippedAt`; there is not yet a dedicated Calendar daily-layer adapter for those blocks.
- Home/Today already turns a single-day Habits/Perfect Day snapshot into a compact progress surface; Calendar should reuse that source contract rather than inventing new habit math.

## Online Reference Baseline

Checked on `2026-06-21`:

- W3C WAI-ARIA APG Date Picker Dialog example: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
- WCAG 2.2 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WCAG 2.2 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- Dashboard Design Patterns research paper: https://arxiv.org/abs/2205.00757
- Dashboard pattern catalog: https://dashboarddesignpatterns.github.io/

Implementation interpretation:

- Calendar layer controls and selected-day detail must stay keyboard usable, have clear names/roles/states, and preserve focus feedback.
- If the month grid uses abbreviated day or layer labels, full meaning must still be available through accessible names or nearby text.
- Compact chips/controls in month cells and layer filters must meet WCAG target-size/spacing expectations or have an equivalent larger control in selected-day detail.
- The month view should act as a glanceable dashboard: aggregate only the strongest daily signals in cells, keep source/status context explicit, and move details/actions into selected-day detail.

## Source Summary Contract

| Layer           | Canonical source                                                                             | Calendar summary fields                                                                        | Details/edit link                                                                      | Must not count or infer                                                                        |
| --------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Planned swims   | `planned_workout_instances` plus `completed_activity_events` from Child `D`                  | planned/completed/review state, session count, selected-day item links                         | program/workout editor and Calendar completion action already owned by Child `D`       | provider send state, labels as identity, or Stats Swimming totals                              |
| Habits overview | `habit_definitions`, `habit_check_ins`, and `habit_motivation_resets` through Habits helpers | scheduled habits, satisfied/due progress, rest/slip/error/no-data state where available        | `/my-library/habits?date=YYYY-MM-DD`                                                   | future dates, inactive/deleted habits as active, reset markers as completed habits             |
| Perfect Day     | `buildHabitDaySummary` Perfect Day fields                                                    | satisfied Perfect Day items, total Perfect Day items, completion percent, is-perfect-day state | `/my-library/habits?date=YYYY-MM-DD`                                                   | non-Perfect-Day habits unless the source summary explicitly includes them                      |
| Micro Sessions  | `dryland_micro_plans.blocks` via a typed daily adapter                                       | completed block count, skipped block count, active/no-data/schema/error state                  | `/my-library/dryland` or source-specific micro-session route/hash if already supported | queued future blocks, open/unfinished blocks, unknown block statuses, paused habit-link credit |

## Scope

- Define a typed calendar layer view-model for daily summaries.
- Add a Micro Sessions daily adapter from saved micro-plan block history, counting only completed/skipped blocks whose timestamps fall on the calendar date.
- Add a Habits overview layer from canonical Habits daily summary data.
- Add a Perfect Day layer from the same Habits daily summary, without duplicating scoring logic.
- Add layer filters/toggles only if needed to keep the month grid readable; otherwise prefer one stable selected-day detail grouping.
- Link each layer to its owning source surface for edits/details.
- Keep month cells compact and move source details, support copy, and source links into selected-day detail.
- Preserve current `Plan`/`Stats` route behavior and current planned/completed swim actions.
- Add deterministic loading, empty, schema-missing, source-error, unknown-source, and no-data states.
- Add tests for source adapters, unknown values, auth/owner scope where touched, component rendering, and route/query compatibility.

## Out Of Scope

- Editing habit check-ins, micro sessions, or Perfect Day rules in the calendar.
- Creating completion events for swims.
- Mapping completed swim events into `Stats`/`Compare`.
- Replacing or redesigning the Habits, Perfect Day, Micro Sessions, Dryland, or Calendar reference surfaces.
- New analytics/dashboard vendor integration.
- Garmin/provider sync.
- Replacing Compare analytics.
- New Supabase tables unless the runtime audit proves the existing source-owned tables cannot support the read-only layer safely.
- Performance-ratchet tightening before at least two new green weekly cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical:
  - source-owned micro-plan block history,
  - source-owned habit definitions/check-ins/reset markers,
  - source-owned Perfect Day fields derived from Habits summary helpers,
  - existing planned/completed swim state from prior Calendar children.
- Calendar-owned:
  - read-only daily layer view-model,
  - source-kind mapping,
  - selected-day grouping and display order,
  - optional visible-layer filter state.
- Local/URL state:
  - selected date,
  - current Calendar view,
  - optional layer filter/toggle state if added.
- Sync behavior:
  - Calendar summaries refresh after source-owned mutations through existing route refresh/navigation behavior,
  - Calendar never mutates Habits, Perfect Day, Micro Sessions, or completed swim history for this child,
  - unknown/missing source rows fail closed to no-data/error/review states and do not create counts.
- Retention and sensitivity:
  - layer payloads must minimize private data to counts, status, stable IDs, and source links,
  - no private habit notes, raw provider data, prompt text, or unrelated profile data belongs in Calendar layer payloads.
- Cache/invalidation:
  - reads must stay bounded to the visible Calendar window,
  - implementation must document whether the route remains dynamic/no-store or reuses existing page cache behavior,
  - source-owned mutations should invalidate or refresh only affected date windows.

## Identity Contract

- Canonical stable IDs:
  - planned swim IDs remain `planned_workout_instances.id`,
  - completed swim truth remains `completed_activity_events.id`,
  - habit IDs remain `habit_definitions.id`,
  - habit check-in IDs remain source-owned check-in IDs where exposed,
  - Micro Sessions block identity must use the best existing source-owned identifier or a deterministic source tuple documented in the runtime child; visual order is not identity.
- Human-readable identifiers:
  - layer labels, chip copy, habit titles, workout titles, and micro-session labels are presentation only.
- Mutability rules:
  - Calendar may link to source edit/detail surfaces but does not rename, repurpose, or edit source entities.
- Rename vs repurpose:
  - source surfaces own whether a habit, dryland session, micro plan, or workout may be renamed or must be recreated;
  - Calendar must follow stable IDs and source-owned links.
- Compatibility:
  - older Calendar links with `view=compare`/`source`/`period` continue to work;
  - new layer source IDs must not break existing `Plan` selected-day actions.

## Forward Compatibility Contract

- Extensibility surfaces:
  - calendar layer source kinds,
  - layer statuses,
  - habit modes/types/cadence values,
  - Micro Sessions block statuses,
  - Perfect Day score states,
  - source route links,
  - analytics event values if events are added,
  - future locales.
- Source of truth:
  - layer values derive from source-owned server data and typed adapters, not hardcoded display labels.
- Additive behavior:
  - new source rows using mapped source kinds/statuses should appear automatically in the selected date window;
  - future calendar layers can plug into the same daily-layer view-model without changing planned swim identity.
- Explicit mapping requirements:
  - new layer source kinds, unknown habit modes, unknown micro block statuses, new Perfect Day states, new source routes, and any new analytics event values require typed mapping, support copy, and tests before they count in Calendar.
- Unknown or deprecated values:
  - fail closed to hidden/unmapped/review states,
  - never count as completed/satisfied/perfect,
  - expose support-visible diagnostics without leaking private notes or raw source payloads.
- Test/evidence:
  - include unknown-source and unknown-status fixtures,
  - include future-value adapter tests,
  - include route/label/support sweep evidence if source labels, actions, or recovery copy change.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/calendar` as the route boundary;
  - reuse current `Plan` selected-day detail as the detail/action placement;
  - reuse `CalendarPeriodComparisonHub` source-card semantics only as a reference, not as a replacement for Plan daily layers;
  - keep month cells scan-first and selected-day detail action-first;
  - avoid creating a second calendar route or source editor.
- TypeScript/domain contracts:
  - add a typed daily-layer view-model with explicit source/status unions;
  - normalize unknown source/status values through allowlists;
  - expose deterministic empty/error/review states.
- Supabase/data layer:
  - prefer existing owner-scoped source tables and helpers;
  - if implementation discovers a required persisted contract gap, stop and refresh this brief before adding a migration;
  - any data read must be owner-scoped and covered by negative-path tests where protected helpers/routes are touched.
- External services:
  - `N/A`; no Garmin, Stripe, OpenAI, analytics vendor, webhook, or provider SDK belongs in this child.
- UI system:
  - reuse My Library/Calendar tokens, action density, selected-day detail patterns, and source chip styling;
  - use compact visual summaries in month cells and fuller labels in selected-day detail;
  - meet WCAG target-size/spacing expectations for interactive chips/filters.
- Testing:
  - source adapter unit tests,
  - component/page rendering tests,
  - protected read/authz tests if loaders/routes change,
  - unknown/future value tests,
  - screenshot handoff before broad gates because runtime implementation changes visible UI.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo lint/verify scripts, `playwright` skill for future screenshot handoff, official web sources for accessibility and dashboard references.
- Evaluate later: no new Codex skills/plugins are needed for this audit or the likely runtime child.
- Install/config changes: none; do not install or configure local Codex capabilities for this slice.

Systemic findings:

| Surface                         | Finding                                                                                                                                                            | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------ | --------------------- | -------------------- |
| Calendar daily layer contract   | Habits/Perfect Day and Micro Sessions already have source-owned data, but Calendar needs one typed read-only adapter before rendering them together.               | `high`   | `bounded implementation child` | `no`                  | this brief           |
| Micro Sessions source semantics | Micro Sessions daily counts currently come from block JSON timestamps; implementation must document block identity/status handling before claiming data integrity. | `medium` | `bounded implementation child` | `no`                  | this brief           |
| Visual density and a11y         | Month cells can become crowded if every layer becomes a chip/action surface; use glanceable counts in cells and move controls/details to selected-day detail.      | `medium` | `bounded implementation child` | `no`                  | this brief           |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Previous shipped child: Child `D`, `docs/task-briefs/done/2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10.md`, PR `#1194` plus closeout PR `#1195`.
- Next product step after this audit: owner may explicitly approve runtime implementation of Child `E`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                            | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Calendar shows planned/completed swims plus micro, Habits, and Perfect Day daily summaries without becoming their editor.                                 | route/component tests + screenshot handoff  | `5/5`                   |
| UX flow clarity                               | `target`     | Users can distinguish swim plan/completion, completed micro blocks, Habits progress, Perfect Day score, no-data, and source-error states.                 | copy review + component tests + screenshots | `5/5`                   |
| Visual design quality                         | `target`     | Layers remain compact in month cells, readable in selected-day detail, and free of overlap on mobile/tablet/desktop.                                      | responsive screenshot handoff               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Each layer reads canonical source data, excludes unknown statuses from counts, and never infers source truth from labels or visual chips.                 | source adapter + unknown-value tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes end-user calendar summaries, not admin editing.                                                                            | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Layer filters/chips/day detail are keyboard and screen-reader usable with named controls, clear focus, and WCAG target-size/spacing coverage.             | a11y tests + screenshot/manual QA           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Layer reads stay bounded to the visible window, avoid N+1 by day/source, and avoid material client bundle growth.                                         | query/bundle review + perf gate             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Calendar renders read-only source summaries; Habits, Perfect Day, Micro Sessions, and swim completion sources own mutations and scoring.                  | data contract + adapter tests               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar refreshes layer summaries after source-owned updates without stale mixed-source states or overbroad cache invalidation.                          | invalidation/cache review + tests           | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing schema, source load errors, unknown layers, unknown statuses, partial source failures, empty days, and no-data states render deterministically.   | negative-path tests                         | `5/5`                   |
| Security and authz                            | `target`     | Owner-scoped layer reads fail closed and never expose another user's habits, micro plans, Perfect Day data, or completed swims.                           | authz tests or no-new-route rationale       | `5/5`                   |
| Privacy and compliance                        | `target`     | Calendar layer payloads exclude private notes, raw provider files, prompts, and unrelated profile data not needed for day summaries.                      | payload/log review                          | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: source labels remain governed by their owning systems.                                                                                   | source contract review                      | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, operator actions, or role-gated CRUD change.                                                                        | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because private daily layer data is not public crawl content.                                                                                         | private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because daily layers are private user data and not public AI-discoverable content.                                                                    | private-data rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: layer toggles/events, if added, use stable source-kind taxonomy and no double-counting across source layers.                             | event review or no-new-event rationale      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: daily layers do not affect checkout, billing, entitlement, or product catalog truth.                                                     | scope review                                | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can distinguish schema missing, source load failure, no-data, unmapped layer, and unknown-status states.                         | support-copy/log review                     | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not touch revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.                                     | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Layer labels, counts, date copy, scores, and unknown states avoid source identity coupling and tolerate copy expansion.                                   | copy review + responsive tests              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing source contracts, App Router, TypeScript, Tailwind tokens, My Library components, and Calendar helpers; add no dependency.                 | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include source adapter, view-model, component/page, unknown-value, authz/no-new-route rationale, screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`. | validation outputs                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Summary reads are window-bounded, batched by source, and avoid N+1 per day/source while keeping micro block parsing scoped.                               | query tests/review                          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Layer rendering can be disabled or reverted without corrupting source data or planned swim rows.                                                          | rollback notes + PR validation              | `5/5`                   |

## Help/Guide And Support-Surface Impact

- Runtime implementation changes user-facing Calendar summary labels and recovery states, so run the route/label/support-surface impact sweep before broad gates.
- Update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and Help/Guide assertions if source labels, recovery copy, source routes, or support diagnostics change.
- If implementation only adds read-only layer summaries and no support-facing recovery label changes, record the explicit `N/A` rationale in the active checkpoint.

## Screenshot Contract

- This is UI work when implemented.
- Capture `after/reference` screenshots comparing:
  - Calendar month grid with new daily layers,
  - selected-day detail with source layer summaries and links,
  - current swim planned/completed reference state from Child `D`,
  - mobile selected week/day detail with layer summaries.
- Pause for owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.
- Month-cell screenshots must prove the layer treatment is glanceable and does not overlap date numbers, today marker, selected-day border, week totals, or swim status.

## Acceptance Criteria

- Calendar shows compact daily signals for completed/skipped Micro Sessions blocks, Habits progress, and Perfect Day progress when source data exists.
- Calendar keeps swim plan/completion state separate from Habits, Micro Sessions, and Perfect Day layers.
- Month cells stay scan-first; selected-day detail provides full labels, source links, and recovery/no-data states.
- Empty, missing schema, source-error, unknown-source, unknown-status, and future-value states are deterministic and do not count as completed or satisfied.
- Source details link to the owning surfaces for editing/details.
- The runtime patch adds no new dependency.
- If a migration becomes necessary, implementation stops and refreshes this brief before changing schema.
- Accessibility and target-size expectations are covered for filters/chips/day detail.
- Route/label/support sweep is completed before broad gates when labels or recovery copy change.

## Validation Plan For This Audit

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`

## Validation Plan For Runtime Implementation

- Source adapter and view-model tests.
- Unknown/future-value negative tests.
- Component/page tests.
- Authz/protected read tests or explicit no-new-route/no-new-helper rationale.
- Route-label/support-surface impact sweep.
- Screenshot handoff and owner visual approval.
- `npm run verify:pre-pr`
- GitHub CI required checks.
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created as Child E after owner asked whether completed micro sessions, habits overview, and Perfect Day overview belong in the calendar | next: refresh source daily summary contracts before execution`
- `2026-06-21 | audit-refresh | refreshed on branch child-e-calendar-daily-layers-audit from clean main@4b7d7aee after Calendar Child D and closeout PR #1195 merged; confirmed repo source contracts for Habits/Perfect Day daily summaries and Micro Sessions block history, added online a11y/dashboard reference baseline, tightened source-summary, forward-compatibility, support, screenshot, and validation contracts | next: run docs-only brief validation, then wait for explicit runtime approval before implementation`
