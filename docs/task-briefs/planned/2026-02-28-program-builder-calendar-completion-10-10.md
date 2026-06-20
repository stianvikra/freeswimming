# Task Brief: Program Builder Calendar And Completion Tracking (10/10)

## Metadata

- `id`: `2026-02-28-program-builder-calendar-completion-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-06-20`
- `mode`: `parent refresh / plan only`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@1b8f87da`
- `audit_status`: `ready`
- `decision`: Use this refreshed brief as the parent contract only; create a narrower child brief before runtime implementation.
- `reason`: Current `main` already has canonical programs, `/my-library/programs/[programId]`, program export, and `/my-library/calendar` as a private comparison report. The next safe calendar step is a bounded `Plan` view inside the existing calendar route with a persisted program start-date anchor, while completion/history remains owned by the separate training-history brief.
- `must_refresh_before_execution_if`: Refresh again if `app/my-library/calendar/page.tsx`, `components/my-library/CalendarPeriodComparisonHub.tsx`, `components/my-library/programs/ProgramBuilderHub.tsx`, `lib/my-library/calendar*.ts`, `lib/programs/*`, `docs/quality/platform-10-10-scorecard.md`, Help/Guide contracts, route labels, verification lanes, or training-history scope change before a child slice starts.

## Goal

Enable users to plan upcoming swim sessions in one My Library calendar surface while keeping planned schedule state separate from actual training-history outcomes.

## Pre-Implementation Owner Explanation

Codex skal friske opp kalender-briefen slik at neste arbeid kan starte trygt uten å bygge en ny parallell kalender. Det betyr at eksisterende `/my-library/calendar` blir den planlagte kalenderflaten med egne visninger for `Plan` og `Compare`, mens program-builder fortsatt eier selve planleggingen av økter. Utenfor scope nå er runtime-kode, completion/historikk, Garmin, AI-programmering, performance-ratchet og `Ja.docx`.

## Current Repo State

- Existing user calendar route:
  - `app/my-library/calendar/page.tsx`
  - currently renders a private `Comparison Report` using `CalendarPeriodComparisonHub`.
- Existing calendar helpers:
  - `lib/my-library/calendar.ts`
  - `lib/my-library/calendar-comparison.ts`
  - current comparison sources include `habits`, `micro_sessions`, `dryland`, and a placeholder for `swimming`.
- Existing canonical program foundation:
  - `lib/programs/shared.ts`
  - `lib/programs/server.ts`
  - `components/my-library/programs/ProgramBuilderHub.tsx`
  - `app/my-library/programs/[programId]/page.tsx`
  - shipped by `docs/task-briefs/done/2026-03-25-canonical-program-foundation-and-library-shell-10-10.md`.
- Separate history/completion owner:
  - `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`.

## Product Direction

- Use one calendar route, not a second competing calendar:
  - `/my-library/calendar?view=plan` for upcoming planned sessions,
  - `/my-library/calendar?view=compare` for the existing trend comparison report.
- The calendar may show both planned and actual layers later, but it must not become the source of truth for actual completion.
- Planned sessions come from canonical saved programs and assignments.
- Program-level calendar anchoring should use a server-canonical start date and planned workout instances before later completion/history work depends on planned dates.
- Actual outcomes come from canonical training-history entries when that slice exists.
- Program-builder remains the edit/create surface for scheduling workouts into week/day slots.
- Calendar `Plan` view should link users back to the relevant program/workout editor for edits rather than duplicating all editor controls.
- Desktop should move toward a Garmin-style month overview once planned instance identity exists, with the selected day/week opening denser details instead of cramming every action into each month cell.
- Mobile should stay day/week-first so controls remain readable and reachable.
- Today must become a first-class calendar concept: mark today, provide a "Go to today" affordance when outside the current window, and avoid date math based on labels.
- Micro sessions, habits, and Perfect Day belong as calendar layers/summaries after their canonical completed/summary data contracts are explicit; they should not be folded into swim-plan rows.

## Recommended First Child Slice

Suggested child path:

- `docs/task-briefs/planned/2026-06-20-my-library-calendar-plan-view-swim-comeback-10-10.md`

First child scope:

- Add a `Plan` view/mode to existing `/my-library/calendar`.
- Add a persisted `programs.starts_on` calendar anchor so program week 1 has a real Monday start date.
- Materialize planned workout instances from existing program assignments so each calendar occurrence has a stable row.
- Reuse existing calendar date/window helpers and program-builder contracts.
- Show planned swim sessions from canonical planned instances whose `planned_on` dates land in the selected week.
- Keep the current comparison report available as `Compare`.
- Show an explicit "history not connected yet" or equivalent empty/waiting state for actual outcomes.
- Link edit actions to existing program/workout surfaces.
- Do not add `mark done`, `cancel`, `partial`, comments, Garmin sync, AI generation, or new history storage.

Why this is the safe first step:

- It gives the owner a useful swim comeback planning view for the week beginning Monday, June 22, 2026.
- It reuses the shipped program foundation and adds a durable date anchor plus planned instances instead of relying on temporary display-only schedule state.
- The frontend is still closed and there are no live users, so the small nullable migration is lower risk now than after history/reminders depend on plan dates.
- It leaves the higher-risk planned-vs-actual truth to the history foundation brief.

## Child Roadmap And Dependency Table

| Child | Working title                                        | Owner scope                                                                                                                                                                                          | Depends on                                                                                                  | Must not include                                                               |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `A`   | Calendar Plan Anchor And Swim Comeback Week          | Add `programs.starts_on`, materialize `planned_workout_instances` from program week/day assignments, add `/my-library/calendar?view=plan`, preserve `Compare`, and show history-not-connected state. | canonical program foundation                                                                                | completion mutation, Garmin sync, AI generation, ad hoc per-instance overrides |
| `B`   | Desktop Month Overview And Today Marker              | Add desktop month overview, today marker, "Go to today", selected-day detail, and mobile week/day fallback using existing planned instances.                                                         | Child `A`                                                                                                   | completion mutation, Garmin sync, habits/micro/Perfect Day layers              |
| `C`   | Planned Instance Edit And Status Actions             | Let users edit, move, skip, delete, and recover planned-only instances before completion, with explicit status and rename/repurpose rules.                                                           | Child `A`; Child `B` if month/day-detail placement is used                                                  | actual completion events, provider sync, recurring drag/drop                   |
| `D`   | Completion Events And Manual Mark Done               | Add canonical completed activity events, manual "mark as done", planned-vs-completed linkage, and safe status rendering.                                                                             | Child `A`; training-history brief                                                                           | Garmin reconciliation, habits aggregation, finance/admin dashboards            |
| `E`   | Calendar Daily Layers For Micro, Habits, Perfect Day | Add compact daily calendar layers for completed micro sessions, habits overview, and Perfect Day score using each source's canonical summary contract.                                               | Child `D` or explicit source contracts for completed events/daily summaries                                 | editing source details inside calendar, provider sync                          |
| `F`   | Plan Vs Actual Reconciliation And Insights           | Match planned sessions to actual outcomes, show missed/rescheduled/completed states, and add bounded overload/hole signals.                                                                          | Child `D`; Child `E` for cross-layer daily summaries                                                        | changing program/workout identity, Garmin delivery                             |
| `G`   | Garmin Plan Export Or Sync                           | Send planned workouts/programs to Garmin and reconcile imported provider activities only when partner/API scope, auth, mapping, idempotency, and support diagnostics are concrete.                   | Garmin partner brief unblocked, Child `A`; likely Child `D`/`F` for completion and reconciliation semantics | blocked partner assumptions, importing activities without history contract     |

Forward-compatibility intent: Child `A` must establish `starts_on`, stable program/week/assignment/workout IDs, and `planned_workout_instances.id` so later completion, edit-before-complete, Garmin, reminders, and plan-vs-actual features attach without replacing identity or duplicating schedule truth.

## Calendar Capability Matrix

| Capability                       | Canonical source of truth                                                 | First owning child | UI expectation                                                                                           | Guardrail                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Planned swim sessions            | `planned_workout_instances` linked to program/week/assignment/workout IDs | `A`                | Week list now; later month/day detail reads the same rows.                                               | No title/date-label identity and no completion truth in planned rows.                       |
| Today marker and "Go to today"   | Local date normalized through calendar helpers                            | `B`                | Desktop month and mobile week/day clearly mark today and can jump back to it.                            | Do not hardcode the current date; tests use deterministic injected dates.                   |
| Desktop month overview           | Planned instances plus later activity layers                              | `B`                | Garmin-style month grid for scanning load, gaps, and upcoming sessions.                                  | Month cells stay compact; detailed actions live in day detail or existing editors.          |
| Selected-day detail              | Planned instances and later source summaries filtered by date             | `B`                | Opens the day's sessions and summary chips with links to source surfaces.                                | Do not duplicate full program/workout/habit editors in the calendar.                        |
| Edit planned session before done | Planned instance row plus source program/workout IDs                      | `C`                | Move, skip, delete, or revise planned-only sessions before completion.                                   | Completed/history-linked rows need explicit compatibility rules before mutation.            |
| Status rendering                 | Planned instance status plus completed activity events                    | `C`/`D`            | `planned`, `completed`, `skipped`, `missed`, `rescheduled`, and unknown states render deterministically. | Unknown statuses fail closed and never count as completed.                                  |
| Manual mark done                 | `completed_activity_events` / training-history contract                   | `D`                | User can mark a planned swim as completed without Garmin.                                                | Actual completion is separate from planned row identity.                                    |
| Completed micro sessions layer   | Canonical micro session completion records or daily summary               | `E`                | Compact count/chip per day and day-detail links to micro-session source.                                 | Calendar displays summary only; source owns editing.                                        |
| Habits overview layer            | Habit check-in/daily summary contract                                     | `E`                | Compact `x/y habits` daily signal with day detail.                                                       | Avoid per-habit editing inside month cells.                                                 |
| Perfect Day overview layer       | Perfect Day daily score/summary contract                                  | `E`                | Daily score or badge that helps explain overall day quality.                                             | Score logic stays with Perfect Day owner, not the calendar renderer.                        |
| Plan-vs-actual insights          | Planned instances plus completed events                                   | `F`                | Missed/rescheduled/completed signals and bounded load/gap indicators.                                    | No provider-specific assumptions; reconcile by canonical IDs/date rules.                    |
| Garmin export/import/reconcile   | Provider sync tables plus planned/completed canonical records             | `G`                | Sync status, conflicts, and repair affordances after local truth is stable.                              | Official provider docs/SDK, least privilege, idempotency, retries, and support diagnostics. |

## Dependencies And Boundaries

- Upstream shipped foundation:
  - `docs/task-briefs/done/2026-03-25-canonical-program-foundation-and-library-shell-10-10.md`
- Upstream canonical workout contract:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
- Downstream actual-outcome owner:
  - `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Related AI generation guardrail:
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- Related epic:
  - `docs/task-briefs/planned/2026-02-28-workout-builder-garmin-familiar-epic-10-10.md`

This parent brief owns calendar/program planning UX and the planner-to-history boundary. It does not own training-history persistence, provider reconciliation, AI generation, or Garmin delivery.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in implementation child slices:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                        | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Calendar IA uses one My Library calendar route with distinct `Plan` and `Compare` modes; planner editing stays in program-builder.                                                    | child UX contract + route tests                        | `5/5`                   |
| UX flow clarity                               | `target`     | A signed-in user can see the selected week's planned swim sessions and understand that actual history is not connected yet without reading docs.                                      | e2e + copy review + manual QA                          | `5/5`                   |
| Visual design quality                         | `target`     | Changed calendar UI reuses existing My Library cards, action layout, tokens, and responsive density with no nested-card clutter or text overflow.                                     | screenshot handoff + component tests                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Planned rows resolve from canonical program/week/assignment/workout IDs; no planner-local completion truth or inferred identity from labels is introduced.                            | unit/integration invariants                            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because calendar planning is an end-user My Library flow and does not change admin editing, publishing, or operator CRUD surfaces.                                                | explicit admin non-scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Keyboard and screen-reader users can switch calendar modes, navigate periods, inspect planned sessions, and reach edit links without serious/critical issues.                         | e2e a11y + manual keyboard QA                          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library/calendar` and `/my-library` stay within existing route budgets and avoid material client bundle growth from the Plan view.                                               | perf budget/bundle review + `verify:pre-pr`            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Program schedule remains server-canonical; unsaved UI filters/mode/date params are local/URL state; actual outcomes remain external to this slice until training-history exists.      | data contract + integration tests                      | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar plan reads refresh deterministically after program save/edit; comparison reads keep their current dynamic/no-store behavior unless deliberately changed.                     | route/cache review + loader tests                      | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing program schema, missing referenced workouts, empty weeks, and load failures show recoverable states with no false success.                                                    | component tests + e2e failure states                   | `5/5`                   |
| Security and authz                            | `target`     | Protected calendar plan reads fail closed for anonymous users and never expose another user's program/workout references.                                                             | route/API negative-path tests                          | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: calendar plan surfaces must not leak unrelated profile notes, private comments, prompt data, or provider metadata.                                                   | payload review + scope rationale                       | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: canonical workout/program ownership remains upstream; this brief preserves references and recovery copy for missing data.                                            | linked foundation brief + copy review                  | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, Help/Guide admin flows, or operator editability change in this calendar parent.                                                        | explicit admin workflow non-scope rationale            | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: authenticated My Library calendar pages are not public crawl targets; no sitemap/canonical public metadata change is expected.                                       | route metadata review                                  | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: calendar plan data is private user planning data and does not create public AI-discoverable content.                                                                 | scope rationale                                        | `4/5`                   |
| Analytics and KPI observability               | `target`     | Mode-switch and plan-inspection events, if added, use stable taxonomy and safe canonical references; no completion KPI is emitted before history exists.                              | event catalog/tests or explicit no-new-event rationale | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: calendar plan views must not mutate checkout, entitlement, billing, or paid-access truth.                                                                            | scope rationale + route review                         | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: user-facing recovery copy and logs should distinguish schema-sync, missing reference, and history-not-connected states for support triage.                           | error contract + support-copy review                   | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this calendar parent does not change checkout, revenue recognition, invoices, refunds, payouts, entitlement reporting, or accounting data.                                | explicit finance non-scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: `Plan`, `Compare`, planned/actual labels, weekday/date copy, and unknown-state copy must remain ready for future localization without identity coupling.             | copy contract + responsive text QA                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js App Router, TypeScript, Supabase, Tailwind, My Library primitives, calendar helpers, and program view-models; add no dependency for calendar basics.           | package diff + architecture review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Child implementation includes targeted unit/component tests, auth negative paths where touched, relevant e2e, screenshot handoff for UI, `verify:pre-pr`, CI, and `verify:pre-merge`. | test matrix + gate outputs                             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: plan reads should avoid N+1 workout/program loading and stay bounded by selected calendar window.                                                                    | loader review + targeted tests                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Calendar Plan view and the nullable start-date anchor can be disabled or reverted without corrupting programs, comparison reports, or future history records.                         | reversible diff + rollback notes + PR validation       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `app/my-library/calendar/page.tsx` as the route boundary;
  - keep `CalendarPeriodComparisonHub` as the reference for the existing `Compare` mode;
  - adapt program data into a new shared plan-calendar view-model instead of adding route-local ad hoc data shapes;
  - keep protected calendar route behavior aligned with current `/auth/sign-in?next=%2Fmy-library%2Fcalendar` redirect.
- TypeScript/domain contracts:
  - reuse `ProgramEditorRecord`, `ProgramWeek`, `ProgramAssignment`, `WorkoutSummary`, and calendar window helpers;
  - normalize any future `view`, `source`, or `period` params through typed allowlists;
  - unknown values must fail safely to a supported mode or explicit unmapped state.
- Supabase/data layer:
  - Child `A` uses explicit migrations for nullable `programs.starts_on` and owner-scoped `planned_workout_instances`;
  - later children must use explicit migrations for completed activity events, source summaries, provider sync rows, and status transitions;
  - read only authenticated user's programs, planned instances, completed events, summaries, and referenced workouts through owner-scoped server helpers;
  - cross-user references must stay rejected/fail-closed.
- External services:
  - `N/A`; no Garmin, AI provider, Stripe, Vercel, or external SDK behavior belongs in the first Plan-view child.
- UI system:
  - reuse My Library token shell, action layout, card/list styles, and existing route actions;
  - because child implementation changes UI, screenshot handoff is required before PR update.
- Testing:
  - parent refresh: `npm run lint:briefs` and docs-only gates;
  - child implementation: unit/component tests for view-model and rendering, e2e for signed-in calendar plan view, negative-path auth/load tests, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, existing repo lint/verify scripts, `playwright` skill for future UI screenshots/e2e, current app code references for calendar/program surfaces.
- Evaluate later: no new Codex skills/plugins are needed for this docs-only refresh; future UI child may use the existing `playwright` skill per screenshot rules.
- Install/config changes: none; do not install or configure local Codex capabilities for this slice.

Systemic findings:

| Surface                     | Finding                                                                                                                         | Severity | Recommended Type                 | Owner Decision Needed | Follow-Up Brief Path                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Calendar route IA           | `/my-library/calendar` already exists as comparison report, so the safe path is `Plan`/`Compare` modes in the same route.       | `medium` | `bounded implementation child`   | `no`                  | `docs/task-briefs/planned/2026-06-20-my-library-calendar-plan-view-swim-comeback-10-10.md`                             |
| Program scheduling data     | Canonical programs and assignments already exist and should be reused as plan source rather than creating calendar-local state. | `high`   | `bounded implementation child`   | `no`                  | same child brief                                                                                                       |
| Training history/completion | Actual done/cancel/partial/moved outcomes are not calendar-owned and need the separate training-history slice before mutation.  | `high`   | `deferred architecture decision` | `no`                  | `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md` |

Return path:

- Last merged workstream: PR `#1184` and docs-only closeout PR `#1185`, with `main@3891d188` clean and synced.
- Current parent: this refreshed brief remains in `docs/task-briefs/planned/`.
- Exact next planning step: create the bounded Plan-view child brief before any runtime code changes.

## Data Placement And Sync Contract

- Server-canonical:
  - canonical `programs` rows,
  - program start-date anchors,
  - nested program week and assignment IDs,
  - referenced canonical workouts,
  - future training-history entries when the history slice exists.
- Local-only / URL state:
  - selected calendar mode (`Plan`/`Compare`),
  - selected date/window/source/period query params,
  - transient UI filters, expanded rows, and unsaved controls.
- Sync policy:
  - calendar Plan view reads saved program state and does not create independent schedule truth;
  - edit links send users to program/workout editor surfaces;
  - future history mutations must invalidate plan/status summaries but stay owned by training-history APIs.
- Retention and sensitivity:
  - planned swim sessions are private user-owned training planning data;
  - no unrelated profile notes, prompts, comments, provider payloads, or admin data should be embedded into calendar plan payloads.
- Cache/invalidation:
  - `/my-library/calendar` is currently dynamic and authenticated;
  - future plan reads must refresh after program save/edit/delete and missing-workout repair;
  - future history reads must refresh after canonical history mutation.

## Identity And Rename Contract

- Canonical stable IDs:
  - `program.id`, `program_week.id`, `program_assignment.id`, and referenced `workout.id` remain the source-of-truth identifiers for planned sessions.
  - future `training_history_entry.id` remains the source-of-truth identifier for actual outcomes.
- Human-readable identifiers:
  - program titles, workout titles, week labels, day labels, and calendar headings are presentation only.
- Mutability rules:
  - moving a planned assignment between days must preserve its assignment ID when it remains the same scheduled slot;
  - renaming a program/workout must not break calendar display or future history linkage.
- Rename vs repurpose:
  - rename in place only when the underlying program/workout/assignment intent is still the same;
  - materially replacing a plan or workout intent should create a new canonical entity/assignment before future history exists.
- Compatibility contract:
  - calendar links, exports, analytics, and future history must resolve canonical IDs, not titles or ordinal labels.
- Observability and repair:
  - missing workout references, duplicate assignment IDs, unsupported calendar modes, and future unknown history states must surface deterministic user/support copy and logs.

## Forward Compatibility Contract

- Extensibility surfaces:
  - calendar modes,
  - calendar views (`week`, `month`, day detail),
  - calendar layers,
  - calendar comparison sources,
  - program source kinds,
  - workout/session intents,
  - future history outcome states,
  - planned instance statuses,
  - completed activity event source kinds,
  - export formats,
  - analytics event values,
  - localized labels.
- Source of truth:
  - planned sessions derive from canonical program/workout data;
  - planned calendar occurrences derive from `planned_workout_instances`;
  - actual outcomes derive from completed activity events/training-history contracts;
  - daily layer summaries derive from their owning source contracts;
  - comparison sources derive from `lib/my-library/calendar.ts`;
  - future actual outcomes derive from training-history entries.
- Additive behavior:
  - new programs, weeks, assignments, and workouts should appear in Plan view automatically when they use canonical program/workout contracts;
  - new layer source kinds should remain hidden or render as unknown/unmapped until a child explicitly maps their summary contract;
  - new comparison sources should remain isolated to Compare unless explicitly mapped into Plan;
  - new history outcomes should render through a generic actual-status renderer once the history slice exists.
- Explicit mapping requirements:
  - new calendar modes, provider states, history outcomes, export formats, or analytics event values require typed union/copy/test updates;
  - product-specific swim comeback recommendations require an explicit product decision and should not be hardcoded into the calendar parent.
- Unknown or deprecated values:
  - unsupported route params fail to a safe default or unmapped state;
  - unknown program source kinds render as generic saved programs or are blocked with recovery copy;
  - unknown future history outcomes must not be counted as completed.
- Test/evidence:
  - this docs-only refresh is validated by brief lint;
  - future child slices must include unknown-value and future-value fixtures for mode/source/outcome behavior where touched.

## Help/Guide And Operator Training Contract

- This docs-only parent refresh does not change visible Help/Guide content.
- Future Plan-view implementation changes user workflow labels and therefore must either:
  - update relevant My Library/help copy in the same PR, or
  - include explicit `N/A` rationale if the changed UI is self-explanatory and no support docs exist for that area yet.
- Future history/completion actions require Help/Guide/runbook impact review because they affect user recovery behavior.

## Route, Label, And Support-Surface Impact Sweep

Future child slices must run the targeted route/label/support sweep before broad gates if they add or rename:

- calendar modes such as `Plan` or `Compare`,
- links into program/workout editors,
- Help/Guide references,
- empty/error/recovery labels,
- history outcome labels,
- analytics event names.

Minimum sweep surfaces:

- `app/`
- `components/`
- `lib/my-library/`
- `lib/programs/`
- `tests/`
- `docs/`
- active/planned/done task briefs that mention calendar, program builder, training history, or My Library.

## Manual QA And Screenshot Contract

- This parent refresh is docs-only; no screenshot handoff is required.
- Future Plan-view implementation is UI work and must follow the screenshot handoff rule:
  - capture `after/reference` artifacts comparing the new Plan mode against the existing Compare mode and relevant program-builder reference surface where practical;
  - pause for owner visual approval before `verify:pre-pr`, PR creation/update, and `verify:pre-merge`.

## Scope

Parent scope:

- Define the durable calendar/program/history boundary.
- Refresh scorecard, stack, forward-compatibility, Help/Guide, and validation expectations.
- Identify the next safe child slice for a swim comeback planning view.

Implementation scope for future children:

- Weekly calendar/program planning.
- Calendar Plan view for scheduled swim sessions.
- Planner-visible status display only after training-history source exists.
- Links from calendar to program/workout editing surfaces.
- Summary metrics such as weekly meters and session counts when derived from canonical workouts.

## Out Of Scope

- Runtime implementation in this parent refresh.
- Creating a second calendar route.
- AI-generated program creation.
- Choosing planning horizon, competition date, or peak/taper intent for a new AI generation run.
- Goal-based automatic planning.
- External activity imports.
- Garmin partner sync.
- Canonical training-history persistence, manual done/cancel/comments, partial/moved outcomes, and retrospective evaluation logic.
- Owning planned-vs-actual truth locally inside the calendar or planner.
- A second AI-specific program builder or program identity model.
- Performance-budget ratchet changes before at least two new post-`2026-06-19` green weekly cycles.
- Touching `Ja.docx`.

## Acceptance Criteria

For this parent refresh:

- Brief audit is current to `main@3891d188`.
- Existing repo state and shipped program/calendar surfaces are named.
- The first implementation child is bounded to Plan view in the existing calendar route.
- The calendar/history boundary is explicit.
- Scorecard mapping includes all canonical categories with measurable target thresholds.
- Data placement, identity, forward-compatibility, Help/Guide, route-label sweep, and screenshot contracts are explicit.
- `npm run lint:briefs` passes.

For future implementation children:

- Users can view upcoming planned swim sessions in `/my-library/calendar` without a parallel calendar.
- The existing comparison report remains available.
- Planned schedule rows derive from canonical program start dates, program/week/assignment IDs, and workout IDs.
- Calendar Plan view does not implement actual completion truth before training-history foundation.
- Empty, loading, error, schema-sync, and missing-reference states are recoverable and accessible.
- Relevant tests and screenshot handoff are completed before PR update.

## Validation

Parent docs-only refresh:

- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge`

Future Plan-view child:

- targeted unit/component tests for calendar mode/view-model/rendering
- targeted loader tests for program/workout references and missing data
- auth negative-path coverage if route/API behavior changes
- e2e for signed-in calendar Plan/Compare navigation
- screenshot handoff before PR update
- `npm run verify:pre-pr`
- required CI checks
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Git Rhythm Defaults

- This refresh is docs-only.
- Future runtime child work requires a fresh branch from current `main`, targeted tests, screenshot handoff for UI, `verify:pre-pr`, commit, push, PR, CI monitoring, and `verify:pre-merge`.
- No merge without explicit owner approval.

## 10/10 Quality Bar

- Calendar must help the owner plan real upcoming swims without creating a fragile second source of truth.
- The first child must be small enough to validate end-to-end and revert cleanly.
- A future `10/10` claim requires all critical target categories listed above to score `5/5`.

## Checkpoint Log

- `2026-03-09 | working tree | upgraded planned brief to canonical 10/10 scorecard mapping with explicit state-boundary contract and measurable target thresholds | next: use this brief as source when implementation branch starts`
- `2026-03-16 | working tree | added explicit identity-and-rename contract so future program-builder implementation cannot couple canonical IDs to week/day order, editable labels, or reschedule flows | next: carry the same contract into implementation slices before schema/UI work starts`
- `2026-03-19 | planning | clarified product direction that this brief owns manual program building from user-authored workouts, while AI goal-based session/program generation stays in a separate generator brief | next: request owner detail later on how AI-generated plans should hand off into editable builder/program flows`
- `2026-03-20 | planning | narrowed this brief to the manual program builder and planner-status track, and moved canonical done/cancel/comments/history ownership into a separate training-history brief so scheduling truth and outcome truth stay cleanly separated | next: keep planner UI aligned to canonical history state instead of adding planner-local completion flags`
- `2026-03-20 | planning | clarified that accepted AI-generated plans across supported fixed-duration, date-range, and competition-date horizons should still converge into this same editable planner after canonical save, while horizon selection and competition intent remain upstream generator concerns | next: keep later planner implementation compatible with AI-authored plan metadata without turning this brief into a generation brief`
- `2026-03-25 | planning | split the minimal canonical program entity/API/editor bootstrap into the narrower \`docs/task-briefs/done/2026-03-25-canonical-program-foundation-and-library-shell-10-10.md\` so this brief can stay focused on richer planner calendar UX, summaries, and completion/history handoff after the base program surface exists | next: layer planner-specific UX and status behavior on top of the canonical foundation instead of recreating persistence contracts here`
- `2026-05-01 | roadmap alignment | recorded the owner-driven program model: keep one canonical Program Builder with manual, weekly-pattern, and accepted AI proposal entrypoints; do not store completion truth as planner-local flags; planned days remain flexible guidance while actual done/moved/skipped outcomes come from the training-history brief | next: implement planner improvements only after V1 AI session and relevant history contracts are scoped`
- `2026-06-20 | docs/calendar-brief-refresh-2026-06-20 | refreshed parent brief against clean \`main@3891d188\`; recorded existing calendar comparison route, canonical program foundation, Plan/Compare IA direction, first bounded Plan-view child, and explicit training-history boundary; no runtime code, performance budgets, scripts, or \`Ja.docx\` changes | next: run brief lint/docs gates, then package docs-only PR`
- `2026-06-20 | planning | updated roadmap after owner confirmed there are no live users and the closed frontend makes a durable start-date anchor preferable now; parent now names Child A through F so completion/history, plan-vs-actual, edit-before-complete, direct reschedule, and Garmin sync are captured without expanding the first runtime slice | next: execute Child A only after explicit owner implementation instruction`
- `2026-06-20 | planning | owner chose to make Child A persist planned workout instances now, not just virtual plan rows, because there are no live users and this gives future completion/Garmin/history work a stable row identity | next: complete Child A implementation on feature branch`
- `2026-06-20 | planning | owner asked how to systematize a 10/10 calendar including desktop month, today marker, micro sessions, habits, Perfect Day, edit-before-done, and Garmin; added calendar capability matrix and expanded roadmap to Child A-G without expanding Child A runtime scope | next: keep Child A focused, then execute Child B/C/D/E briefs in order after approval`
