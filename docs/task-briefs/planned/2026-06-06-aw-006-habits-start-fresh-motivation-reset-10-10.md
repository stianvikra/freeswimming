# Task Brief: AW-006 Habits Start Fresh Motivation Reset (10/10)

## Metadata

- `id`: `2026-06-06-aw-006-habits-start-fresh-motivation-reset-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-06`
- `updated`: `2026-06-06`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `plan only until owner explicitly says execute/build/implement`
- `target_findings`: `H-040`
- `planned_resolved_findings`: Habits per-habit motivation reset / Start fresh workflow.
- `deferred_findings`: Midnight auto-complete, reminders, notification APIs, exported reset reports, broad analytics dashboard, restore/edit archived habits, and destructive history deletion remain out of scope unless a later owner-approved brief selects them.
- `return_checkpoint`: update the Habits parent before this child is considered closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-06`
- `base`: `aw-006-habits-advanced-motivation-history@owner-review` based on `main@5460f188`
- `audit_status`: `ready`
- `decision`: Keep this as a planned follow-up; do not execute inside the active read-only motivation/history PR unless the owner explicitly revises scope.
- `reason`: During screenshot review for Habits Advanced Motivation And History Depth, the owner selected a systemic future reset direction. Reset is a write-flow with database/API/Calendar/support impact, so it must be tracked as its own child brief rather than hidden inside the read-only motivation slice.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, the Habits parent, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habits API/storage contracts, Supabase migration/RLS rules, My Library Calendar contracts, support runbooks, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Add a safe per-habit `Start fresh` workflow so users can restart motivation metrics without deleting or rewriting historical Habits check-ins.

## Pre-Implementation Owner Explanation

Vi planlegger en trygg `Start fresh`-funksjon for Habits. Den skal la brukeren starte per-habit streak, days hit og consistency paa nytt for en enkelt vane, uten at gamle logger slettes.

Hvorfor det betyr noe: motivasjon kan trenge en ny start etter sykdom, pause eller endret rutine, men brukerens historikk maa fortsatt vaere bevart og forklarbar.

Utenfor scope er hard sletting av historikk, account-wide reset, reminders, midnight auto-complete, eksport, restore/edit av arkiverte vaner og full dashboard-redesign.

Fremoverkompatibilitet: reset maa vaere en egen typed, server-canonical event/kontrakt som Calendar, support og fremtidige metrics kan lese. Nye reset-typer eller ukjente reset-grunner skal ikke endre streak/days-hit/consistency uten eksplisitt mapping, tester og dokumentasjon.

## Product Decision

- Use `Start fresh`, not `Reset streak`, as the user-facing concept.
- The action is per habit, not global.
- Old `habit_check_ins` stay intact.
- Motivation metrics use the latest valid reset effective date as the lower bound.
- Default Motivation view shows current post-reset metrics; history before the latest reset remains available as preserved history, for example `Before reset`.
- Multiple resets must be deterministic: latest valid reset drives current metrics, older reset periods remain explainable by dated boundaries, and none of them delete check-ins.
- Calendar Comparison may show a `Habit reset` marker, but must not treat reset as a completed check-in.
- Reset must be auditable and reversible enough for support; it must not be a silent overwrite of old metric truth.

## Selected Architecture Direction

Future implementation should prefer an append-only reset event model:

- new server-canonical reset event row, for example `habit_motivation_resets`;
- owner-scoped `habit_id`;
- `effective_date`;
- optional typed reason enum or nullable note only if product-approved;
- `created_at` / `created_by` for audit;
- latest active reset event drives motivation windows;
- no mutation of historical check-ins;
- no local-only metric reset flag.

If implementation audit proves a column-based model is safer for the current schema, the brief must explicitly document why it still preserves auditability, Calendar markers, support diagnosis, and future multiple-reset behavior.

## Scope

- Add a per-habit `Start fresh` workflow inside the habit Details surface.
- Add a confirmation flow that clearly says old logs stay saved and motivation metrics restart from the selected effective date.
- Persist reset state in a server-canonical, owner-scoped, typed way.
- Recompute per-habit current streak, best streak, days hit, and consistency from the reset date forward.
- Keep totals and preserved history explainable before and after reset.
- Support repeated `Start fresh` use by preserving each reset boundary as dated history instead of overwriting the prior event.
- Add a visible `Since <date>` or equivalent label where reset affects motivation metrics.
- Add Calendar Comparison reset marker support only through explicit mapping from the reset contract.
- Update support docs/runbooks so operators can diagnose reset questions without private habit names or raw notes.
- Add unit, route/API, component, and screenshot coverage for reset creation, metric recomputation, Calendar marker mapping, and negative authz paths.

## Out Of Scope

- Deleting, truncating, rewriting, or anonymizing historical `habit_check_ins`.
- Account-wide reset across all habits.
- Reset for Calendar, Dryland, Micro Sessions, Swimming, goals, course progress, or exports.
- Midnight auto-complete, reminders, notification APIs, user-selected sounds, micro-session audio, restore/edit archived habits, broad analytics dashboard, or export downloads.
- New habit modes, new check-in statuses, or new notes schema unless required for the reset event contract and explicitly owner-approved before execution.
- Merging without explicit owner approval.

## Acceptance Criteria

1. A user can start fresh for one active habit without affecting other habits.
2. Reset creates a server-canonical owner-scoped reset record and does not delete or rewrite historical check-ins.
3. Motivation metrics show a clear reset boundary such as `Since Jun 6, 2026`.
4. Per-habit streak, best streak, days hit, and consistency derive from the reset boundary forward.
5. Preserved pre-reset history remains readable as `Before reset` and is not counted as post-reset progress.
6. Multiple resets keep deterministic dated boundaries; the latest valid reset drives current Motivation metrics and earlier periods remain explainable.
7. Calendar Comparison shows reset as a marker only, not as a done/rest/slip check-in.
8. Unauthorized users cannot create, read, or apply resets for another owner.
9. Support docs explain how to diagnose reset state using redacted owner-scoped IDs and dates.
10. Screenshot handoff proves Details workflow, confirmation copy, post-reset summary, repeated-reset state, and mobile layout.

## Data Placement And Sync Contract

- Server-canonical data:
  - existing `habit_definitions`;
  - existing `habit_check_ins`;
  - new reset event contract selected during implementation audit;
  - stable habit IDs;
  - reset effective date and audit metadata.
- Local data:
  - confirmation modal open/closed state only;
  - no local-only reset truth;
  - no localStorage reset flag.
- Derived view-model:
  - motivation summary uses canonical check-ins plus the latest valid reset event for the habit.
  - raw history totals remain available separately from post-reset motivation metrics.
- Sync policy:
  - reset creation is a mutation with success/error feedback;
  - after success, refresh Habits snapshot and Calendar comparison data through existing route/cache boundaries;
  - failed reset must leave all metrics unchanged.
- Retention and sensitivity:
  - reset records are private owner data;
  - do not log habit names, raw notes, or private reasons;
  - support diagnostics use redacted `habit_id`, `reset_id`, `effective_date`, `created_at`, and status.
- Cache/invalidation:
  - preserve `/my-library/habits` dynamic/no-store behavior unless audited otherwise;
  - Calendar marker freshness must follow the same canonical server read path as Habits metrics.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID remains the identity for reset events, metrics, support repair, Calendar markers, and future exports.
- Human-readable identifiers:
  - habit title is display-only and renameable;
  - reset must never key off title text.
- Mutability:
  - reset event ID is immutable after creation;
  - effective date mutability must be explicit: either create a replacement event or support a typed update with audit.
- Rename vs repurpose:
  - renaming a habit preserves reset and history boundaries;
  - materially repurposing a habit should create a new habit if the user wants a clean identity.
- Compatibility:
  - legacy habits without reset events use full available history;
  - unknown reset event types or statuses fail closed and do not change metrics until mapped.
- Observability and repair:
  - invalid reset rows should be detectable through route tests/support probes and ignored fail-closed.

## Forward Compatibility Contract

- Automatically supported:
  - new supported check-ins after a reset;
  - renamed habit titles;
  - existing supported habit modes and units;
  - multiple future resets if the event model is implemented as append-only and latest-active event is selected deterministically.
- Requires explicit mapping:
  - new reset event types, statuses, reasons, undo policies, Calendar marker styles, export fields, analytics payloads, locales, or external integrations.
- Safe fallback:
  - missing reset means use existing full-history motivation behavior;
  - malformed or unauthorized reset means ignore the reset and show neutral/error feedback where appropriate;
  - unknown reset status must not improve streak, days hit, or consistency.
- Test/evidence:
  - fixtures must cover no reset, one reset, multiple resets, reset before first check-in, reset after archived date, unknown reset status, and cross-owner denial.

## Help / Guide Impact

Required:

- update `docs/user-flow-map.md` with `Start fresh` behavior;
- update `docs/runbooks/auth-account-support.md` with reset diagnosis and privacy-safe support language;
- update Help/Guide only if future implementation exposes admin/operator workflow labels or recovery behavior.

## Route / Label / Support Surface Sweep

Required before broad gates:

- `/my-library/habits`
- `/my-library/calendar`
- `Start fresh`
- `Reset`
- `Since`
- `Before reset`
- `Habit reset`
- `Archived`
- `Past habits`
- `habit_check_ins`
- `habit_definitions`
- future reset table/contract name
- `habits_viewed`
- `source=habits`
- account export references if export wording changes

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `lib/habits/shared.ts`
- `lib/habits/server.ts`
- `lib/habits/schema.ts`
- Habits API routes
- Supabase migrations/RLS/generated types if a persisted reset contract is added
- `lib/my-library/calendar.ts` and `lib/my-library/calendar-comparison.ts`
- `tests/unit/habits.test.ts`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- route/API tests for authz and reset validation
- Calendar tests if a marker mapping is added
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                    | Evidence                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `Start fresh` must help motivation without deleting history, replacing check-ins, or duplicating Calendar comparison.                                                 | product copy + screenshots + route review                        | `5/5`                   |
| UX flow clarity                               | `target`     | User understands old logs stay saved, metrics restart from the selected date, and reset is per habit.                                                                 | component tests + screenshot handoff                             | `5/5`                   |
| Visual design quality                         | `target`     | Details action, confirmation, reset boundary, and post-reset labels fit existing Habits tokens on mobile and desktop without overflow.                                | responsive screenshots + text-fit review                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Reset creates typed owner-scoped reset truth and recomputes motivation metrics without modifying historical check-ins.                                                | unit/integration/API tests + migration review                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface unless future execution revises scope.                      | explicit admin-editor scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Action, confirmation dialog, success/error feedback, reset labels, and Calendar marker are keyboard/screen-reader usable and not color-only.                          | component tests + screenshot/manual QA                           | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                               | component tests + screenshot/manual QA                           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: reset contract must not add heavy dashboards, polling, or unbounded client payloads.                                                                 | build/perf gate + diff review                                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Reset truth is server-canonical; local state is UI-only; failed reset leaves metrics unchanged.                                                                       | data contract + route/API tests                                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Habits and Calendar views refresh deterministically after reset while preserving private no-store boundaries unless explicitly audited.                               | route/server diff review + tests                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing, malformed, duplicate, unauthorized, or unknown reset rows fail closed and do not improve streak, days hit, or consistency.                                   | negative-path tests + support docs                               | `5/5`                   |
| Security and authz                            | `target`     | Reset APIs fail closed for unauthenticated/cross-owner requests and never expose another user's reset or habit data.                                                  | route/API negative-path tests                                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Habit names, notes, reasons, and private check-ins are not logged, public, or added to unsafe analytics payloads.                                                     | privacy/analytics diff review                                    | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, design inventory, user-flow docs, support docs, and child brief record reset behavior and deferred hard-delete/export scope.                           | docs diff + `npm run lint:briefs`                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, editable admin fields, role-gated CRUD, recovery action, or operator support action surface by default.            | explicit admin-workflow scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.              | private-route SEO rationale                                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no crawl-safe public entity model, public semantic page copy, structured data, or AI-facing public docs surface.                       | AI-discoverability scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: any future reset analytics must avoid habit names, notes, reasons, and raw private history values.                                                   | analytics diff review                                            | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                           | commerce scope rationale                                         | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs must explain how to diagnose reset questions with redacted reset/habit IDs and dates, plus what data remains preserved.                                  | support doc diff                                                 | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.             | explicit finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels like `Start fresh`, `Since`, `Before reset`, and confirmation copy must tolerate longer localized strings without layout breakage.                             | responsive screenshots + component assertions                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Habits domain helpers/server loader, existing UI primitives/tokens, Supabase migrations, and current test stack; add no dependency.                             | code/dependency diff review                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover reset creation, metric recomputation, no-history deletion, Calendar marker mapping, cross-owner denial, unsupported reset status, screenshots, and gates. | unit/route/component/Calendar tests + broad gates                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration/API rollout must be reversible or forward-safe, with reset records ignored fail-closed if rollback removes UI access before data cleanup.                   | migration review + rollback notes + pre-merge gate               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: reset lookup must be indexed/bounded and not require full-history recomputation on every route beyond existing Habits history windows.               | implementation/perf review + index/migration evidence if touched | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `HabitPerfectDayHub` Details surface and the active Habits snapshot contract;
  - keep mutation UI inside client component boundaries already used by Habits;
  - preserve private route/auth behavior.
- TypeScript/domain contracts:
  - add typed reset view-model helpers rather than route-local string matching;
  - recompute metrics through deterministic helpers;
  - unknown reset values fail closed.
- Supabase/data layer:
  - use explicit migration and generated type updates if a reset table/column is added;
  - enforce owner-scoped RLS/authz;
  - add indexes for `owner_id`, `habit_id`, and `effective_date` as needed.
- External services/tools:
  - no external SDK/service is expected.
- UI system:
  - reuse existing Habits tokens, buttons, feedback, confirmation/dialog patterns, and mobile action layout;
  - screenshot handoff must be `before/after` or `after/reference`.
- Testing:
  - include domain, route/API, component, Calendar marker, negative authz, and screenshot evidence.

## Validation

Before future PR update:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted unit/domain tests for reset metric boundaries
- targeted route/API tests for reset mutation/authz
- targeted component tests for Details/confirmation UI
- Calendar tests if reset marker mapping is implemented
- route/label/support sweep from this brief
- screenshot handoff and owner visual approval before `npm run verify:pre-pr`
- `npm run verify:pre-pr`

Before future merge:

- required CI checks green
- `npm run verify:pre-merge`

## Screenshot Requirements

Required because future execution changes visible Habits UI and Calendar marker UI.

Handoff must include:

- habit Details before/after or after/reference for `Start fresh`;
- confirmation dialog;
- post-reset metric boundary label;
- Calendar marker if implemented in the same PR;
- mobile and desktop screenshots;
- clickable `Screenshot artifacts` folder link and `Captured: YYYY-MM-DD HH:MM`.

## Checkpoint Log

- `2026-06-06 | planned | created as systemic follow-up from owner screenshot review during active Habits Advanced Motivation And History Depth slice; reset/start-fresh is intentionally not implemented in the active read-only PR because it requires server-canonical write, Calendar marker, support, migration/RLS/authz, and screenshot coverage | next: keep planned until owner explicitly selects this child for execution`
