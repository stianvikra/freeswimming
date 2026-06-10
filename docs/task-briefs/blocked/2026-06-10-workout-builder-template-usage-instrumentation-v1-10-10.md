# Task Brief: Workout Builder Template Usage Instrumentation V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10`
- `status`: `blocked`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-10`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md`
- `blocked_by`:
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
  - `docs/architecture/workout-builder-template-identity-selection-contract.md`
  - `docs/task-briefs/in-progress/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-builder-template-usage-instrumentation-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@99acbbb5` after Workout Builder Template Usage / Generated Completion Dashboard V1 PR `#1055` and repo-managed closeout PR `#1056`
- `audit_status`: `blocked`
- `decision`: Block runtime implementation after the required template-support audit; do not add `workout_builder_template_selected` until a stable workout-builder template source of truth and explicit selection action exist and satisfy `docs/architecture/workout-builder-template-identity-selection-contract.md`.
- `reason`: The audit found generator intake blocks, session generator inputs, manual workout scaffolds, saved workout `sourceKind`, goal templates, email templates, admin incident templates, route templates, and future-planning brief references, but no current runtime workout-builder template entity, stable template ID/key, or explicit user action that selects a workout-builder template.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, analytics event taxonomy, `ANALYTICS_EVENT_NAMES`, `lib/analytics/workout-builder.ts`, `lib/analytics/events.ts`, `lib/analytics/persistence.ts`, `/api/analytics/event`, workout-builder/generator template surfaces, `lib/session-generator-v1/`, `components/my-library/generator/`, `components/my-library/workouts/`, `/api/admin/analytics/insights`, Admin Analytics dashboard/template usage contract, Help/Guide contract, or route/label/support sweep rules change before implementation starts.

Current unblock contract:

- `docs/architecture/workout-builder-template-identity-selection-contract.md` defines the conservative decision: runtime template selection must use immutable `templateId` or write-once `templateKey`, selection requires an explicit `Use template`-equivalent action that starts or populates a draft, and unknown/deprecated values fail closed.
- This instrumentation child remains blocked until `docs/task-briefs/in-progress/2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10.md` is merged and validated as the real runtime source/selection surface. After that merge, refresh this brief before adding `workout_builder_template_selected`.

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

Template-support audit result on `2026-06-10`:

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

Proposed event name after a successful audit:

- `workout_builder_template_selected`

Allowed payload shape after a successful audit:

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
| Visual design quality                         | `N/A`        | N/A because instrumentation-only implementation must not change rendered layout, CSS, card structure, print, brand, or visible workflow UI.                                       | explicit visual scope rationale                         | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Event emits only for an explicit template-selection action with a stable workout-builder template ID/key; no inferred or adjacent activity is counted as template usage.          | payload helper tests + call-site tests + audit record   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin Analytics remains read-only and no admin edit/config workflow is introduced.                                                                               | admin scope rationale                                   | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no keyboard flow, focus order, aria label, semantic markup, contrast, or rendered state is changed.                                                                   | explicit a11y scope rationale                           | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Event is best-effort, low-cardinality, dependency-free, and does not add charting, vendor scripts, extra route loads, or large payloads.                                          | payload tests + package diff + verify gate              | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Analytics rows remain server-canonical in `analytics_events`; template truth stays in the existing workout-template source; no local analytics identity is added.                 | data contract + tests                                   | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing analytics ingestion and admin insight reads remain no-store; no cache/revalidation behavior changes.                                                    | route/cache review                                      | `4/5`                   |
| Reliability and failure handling              | `target`     | Analytics failure fails soft and cannot block template use, generator handoff, builder navigation, draft creation, or workout save; missing template identity does not emit.      | negative-path tests                                     | `5/5`                   |
| Security and authz                            | `target`     | Protected user/template surfaces retain existing auth boundaries; unauthorized or invalid template actions do not create trusted template-usage events.                           | auth boundary review + negative-path tests              | `5/5`                   |
| Privacy and compliance                        | `target`     | Payload includes only safe scalar workflow dimensions and stable non-sensitive template IDs; no raw titles/text/URLs, personal identifiers, payment data, or raw payload UI.      | sanitizer/payload tests + privacy docs                  | `5/5`                   |
| Content governance                            | `target`     | Event taxonomy, template-identity caveats, unsupported inference rules, and parent/child checkpoint logs stay aligned before implementation.                                      | docs/API contract + route/label/support sweep           | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow label, action, role, recovery path, or edit behavior changes.                                                                                  | Help/Guide impact rationale                             | `4/5`                   |
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
  - Reuse the existing workout-builder/generator component where a real template selection occurs.
  - Use the existing `/api/analytics/event` client route through `sendClientAnalyticsEvent` for client-side template selection, or existing server analytics persistence only if the selection is server-confirmed.
  - Do not add a new route, modal, dashboard tab, chart, export action, or dashboard builder.
  - Do not change route cache behavior; analytics ingestion/admin reads remain no-store.
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
  - No visible UI/layout change is planned.
  - If implementation changes visible Admin Analytics labels, Help/Guide text, layout, or a rendered template surface, screenshot handoff becomes required before `npm run verify:pre-pr`.
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

N/A for the planned instrumentation-only slice with rationale: this child should not change visible admin/user workflow labels, Help/Guide surfaces, recovery paths, support procedures, or dashboard template-usage claims. If implementation adds visible Admin Analytics labels, a dedicated template usage dashboard module, Help/Guide copy, or support interpretation, that same PR must update Help/Guide assertions and provide screenshot handoff before `npm run verify:pre-pr`.

## Screenshot / Visual Impact

No screenshot artifact handoff is planned for instrumentation-only implementation because no rendered markup, CSS, layout, print, brand, responsive behavior, visible card/button text, or user-facing workflow state should change.

- Screenshot artifacts: N/A for the intended non-visual analytics instrumentation.
- Screenshot comparison naming: N/A unless implementation changes a rendered UI surface.
- Owner screenshot approval stop: required only if visible UI/Help/Guide/Admin Analytics rendering changes.

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

## Scope

- Audit whether a real workout-builder template source of truth and explicit template-selection action exist.
- If the audit fails, stop without adding runtime event names, payload helpers, call sites, dashboard labels, or fake tests.
- Record the blocker, route/label/support sweep evidence, and parent checkpoint status.
- Keep Admin Analytics template usage as `not_instrumented`.
- Define the exact resume condition for future implementation.

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
2. If no stable workout-builder template identity exists, implementation stops without adding fake telemetry and records the blocker/follow-up.
3. `workout_builder_template_selected` is not added until a stable source/action exists.
4. Existing Admin Analytics generated-completion/template state is not relabeled as counted template usage in this child.
5. Route/label/support sweep is recorded with the blocking evidence.
6. Parent checkpoint log reflects that implementation is blocked on a product/data decision, not a code/test failure.
7. Changed briefs pass `npm run lint:briefs` and `git diff --check`.

## Validation

For this blocked closeout:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

For future implementation after unblock:

- targeted unit/component tests for analytics taxonomy, payload helper, template call site, sanitizer/privacy exclusions, and negative paths
- route/label/support-surface sweep
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Blocked child path: `docs/task-briefs/blocked/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- Done unblock path: `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
- Contract path: `docs/architecture/workout-builder-template-identity-selection-contract.md`
- Current status: blocked; runtime instrumentation is not safe until a stable workout-builder template identity and explicit selection action exist.
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
