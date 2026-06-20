# Task Brief: My Library Calendar Plan View Swim Comeback (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-plan-view-swim-comeback-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `runtime implementation`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@1b8f87da`
- `audit_status`: `ready`
- `decision`: Implement this runtime child on branch `feat/calendar-plan-anchor-child-a`; scope is a persisted program start-date anchor, persisted planned workout instances, and the Calendar Plan view.
- `reason`: The owner confirmed that, because there are no live users and the frontend is still closed, the first Plan-view slice should add a real server-canonical calendar anchor and materialized planned workout instances instead of a temporary projection model. Current code has `/my-library/calendar` as a private `Comparison Report`, canonical saved programs with week/day assignments, and no persisted program calendar start date or planned-session instance table.
- `must_refresh_before_execution_if`: Refresh before runtime work if `app/my-library/calendar/page.tsx`, `components/my-library/CalendarPeriodComparisonHub.tsx`, `components/my-library/programs/ProgramBuilderHub.tsx`, `lib/my-library/calendar*.ts`, `lib/programs/*`, `docs/quality/platform-10-10-scorecard.md`, Help/Guide contracts, route labels, screenshot rules, verification lanes, or training-history scope change.

## Goal

Add a persisted program start-date anchor, materialized planned workout instances, and a bounded `Plan` mode to the existing private `/my-library/calendar` route so a signed-in user can inspect date-bound planned swim sessions while keeping actual completion/history separate.

## Pre-Implementation Owner Explanation

Codex skal bygge en ny `Plan`-visning i den eksisterende kalenderen, datofeste programmer med en lagret startuke, og opprette egne planlagte øktinstanser fra eksisterende workouts. Dette er viktig fordi en kalenderøkt da blir en ekte datert forekomst som senere kan få status, faktisk utførelse, redigering og Garmin-kobling uten å omskrive grunnmodellen. Utenfor scope er markering som ferdig/avlyst/flyttet, Garmin-runtime, AI-generering, performance-ratchet, per-økt dato-overstyring utenfor programmet og `Ja.docx`.

## Approved Runtime Scope

Owner-approved scope direction:

- Use a minimal persisted calendar anchor now.
- Add `programs.starts_on` as a server-canonical date field.
- Require/normalize `starts_on` as the Monday start date for program week 1.
- Materialize each program assignment as a `planned_workout_instances` row that references the existing workout and stores the planned date.
- Derive each materialized planned date from `starts_on + weekIndex * 7 + assignment.dayIndex` during program save/sync.
- Add `view=plan|compare` on `/my-library/calendar`.
- Let `date=YYYY-MM-DD` choose the visible Monday-Sunday calendar week, then show saved programs whose derived assignment dates land in that week.
- Let `programId` optionally filter/highlight one saved program, but do not require `weekId` for normal calendar use once `starts_on` exists.
- Default the owner's first QA target to the week beginning Monday, `2026-06-22`, without hardcoding that date into product logic.

Why this is recommended:

- There are no live users yet and the closed frontend reduces migration rollout risk.
- Program-level `starts_on` fits the existing week/day assignment model, while planned instances give each calendar occurrence a stable row for future status/history/provider links.
- It gives future reminders, plan-vs-actual, exports, and training-history reconciliation a stable planned-date source.
- A later child can add per-instance move/override semantics only when completion/history rules define how moved planned sessions reconcile.

Owner explicitly said `implementer Child A`; runtime implementation may proceed within this brief scope.

## Current Repo State

- Existing calendar route:
  - `app/my-library/calendar/page.tsx`
  - authenticated route; anonymous users redirect to `/auth/sign-in?next=%2Fmy-library%2Fcalendar`.
  - currently renders `CalendarPeriodComparisonHub` and loads `loadMyLibraryCalendarComparison`.
- Existing comparison reference:
  - `components/my-library/CalendarPeriodComparisonHub.tsx`
  - source/period/date helpers live in `lib/my-library/calendar.ts`.
- Existing canonical program foundation:
  - `lib/programs/shared.ts`
  - `lib/programs/server.ts`
  - `components/my-library/programs/ProgramBuilderHub.tsx`
  - `app/my-library/programs/[programId]/page.tsx`
  - program identity uses `program.id`, `week.id`, and `assignment.id`.
- Current limitation:
  - program weeks have labels and weekday assignments, but no server-canonical calendar start date.
- Separate actual-outcome owner:
  - `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`

## Scope

- Add persisted program date anchoring:
  - migration adds `programs.starts_on` as an ISO `date` field;
  - server/shared program contracts expose `startsOn`;
  - create/save validation requires a valid Monday `startsOn` for active calendar planning;
  - existing/null programs show a recoverable "choose start week" state rather than silently guessing dates.
- Add persisted planned workout instances:
  - migration adds a user-owned `planned_workout_instances` table;
  - each row references `program.id`, `program_week.id`, `program_assignment.id`, and `workout.id`;
  - each row stores `planned_on`, `position`, and initial `status='planned'`;
  - program create/save reconciles planned rows for planned-only assignments idempotently.
- Add a calendar mode contract for the existing route:
  - `view=plan` for upcoming planned sessions.
  - `view=compare` for the existing comparison report.
  - unsupported `view` values fail safely to a supported default or explicit unmapped state.
- Preserve the current `Comparison Report` behavior under `Compare`.
- Build a read-only Plan view-model from canonical planned workout instances:
  - program ID,
  - program `startsOn`,
  - program week ID,
  - assignment ID,
  - workout ID,
  - persisted planned date,
  - weekday/day position,
  - workout title and safe summary fields.
- Render date-bound planned sessions for the selected Monday-Sunday week, including the comeback QA target and future dates.
- Show planned swim sessions as planned-only rows.
- Show explicit "history not connected yet" copy for actual outcomes.
- Link edit actions back to existing program/workout editor surfaces.
- Add or adapt program editor UI so start week can be set deliberately.
- Reuse current My Library layout, action classes, cards, route shell, and program step-preview/display patterns where practical.
- Update user/support docs if new route labels or recovery copy need explanation.
- Add tests and screenshot handoff when this brief later moves to implementation.

## Out Of Scope

- A second calendar route.
- Runtime completion actions, `mark done`, `cancel`, `partial`, `moved`, comments, adherence, retrospective evaluation, or actual history storage.
- Garmin sync, provider delivery, external activity import, or AI-generated planning.
- Per-assignment date overrides, drag/drop rescheduling, split-week programs, timezone-specific workout timestamps, or recurrence rules.
- Reworking `CalendarPeriodComparisonHub` metric semantics beyond making it available as `Compare`.
- Broad My Library redesign.
- Performance-budget ratchet changes before at least two new green weekly cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Child Roadmap And Dependency Table

This brief is Child `A`. It must make later calendar capabilities possible, but it must not ship them in the same runtime slice.

| Child | Working title                                        | Status                 | Owner scope                                                                                                                                                                                                                | Depends on                                                                                                                        | Explicitly out of Child `A`                                                     |
| ----- | ---------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `A`   | Calendar Plan Anchor And Swim Comeback Week          | `this brief`           | Add `programs.starts_on`, materialize `planned_workout_instances` from program week/day assignments, add `/my-library/calendar?view=plan`, preserve `Compare`, edit links, missing-start recovery, screenshots, and tests. | canonical program foundation                                                                                                      | actual completion actions, Garmin, AI, reminders, ad hoc per-instance overrides |
| `B`   | Desktop Month Overview And Today Marker              | `planned follow-up`    | Add desktop month overview, today marker, "Go to today", selected-day detail, and mobile week/day fallback using existing planned instances.                                                                               | Child `A`                                                                                                                         | completion mutation, Garmin sync, habits/micro/Perfect Day layers               |
| `C`   | Planned Instance Edit And Status Actions             | `planned follow-up`    | Let users edit, move, skip, delete, and recover planned-only instances before completion, with explicit status and rename/repurpose rules.                                                                                 | Child `A`; Child `B` if month/day-detail placement is used                                                                        | actual completion events, provider sync, recurring drag/drop                    |
| `D`   | Completion Events And Manual Mark Done               | `planned follow-up`    | Add canonical completed activity events, manual "mark as done", planned-vs-completed linkage, and safe status rendering.                                                                                                   | Child `A`; `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md` | Garmin reconciliation, habits aggregation, finance/admin dashboards             |
| `E`   | Calendar Daily Layers For Micro, Habits, Perfect Day | `planned follow-up`    | Add compact daily calendar layers for completed micro sessions, habits overview, and Perfect Day score using each source's canonical summary contract.                                                                     | Child `D` or explicit source contracts for completed events/daily summaries                                                       | editing source details inside calendar, provider sync                           |
| `F`   | Plan Vs Actual Reconciliation And Insights           | `future child`         | Match planned sessions to actual outcomes, show missed/rescheduled/completed states, and add bounded overload/hole signals.                                                                                                | Child `D`; Child `E` for cross-layer daily summaries                                                                              | changing program/workout identity, Garmin delivery                              |
| `G`   | Garmin Plan Export Or Sync                           | `blocked future child` | Send planned workouts/programs to Garmin and reconcile imported provider activities when partner/API scope, auth, idempotency, mapping, and support diagnostics are concrete.                                              | Child `A`; Garmin partner/API unblock; likely Child `D`/`F` for reconciliation                                                    | blocked partner assumptions, activity import without history contract           |

Forward-compatibility intent:

- Child `A` establishes `starts_on`, stable program/week/assignment/workout IDs, and `planned_workout_instances.id` as the planned-date contract.
- Later completion, edit-before-complete, Garmin, reminders, and plan-vs-actual features must attach to planned instances instead of replacing them.
- Unknown future outcome/provider states must fail closed and never count as completed until a mapped child owns them.

### Calendar Capability Matrix For Follow-Up Ownership

| Capability                       | First owning child | Child `A` behavior                                                                 |
| -------------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| Planned swim sessions            | `A`                | Implement from `planned_workout_instances`.                                        |
| Today marker and "Go to today"   | `B`                | Out of scope; current week navigation remains date-param based.                    |
| Desktop month overview           | `B`                | Out of scope; current Plan view remains week-list based.                           |
| Selected-day detail              | `B`                | Out of scope beyond current day cards in the week list.                            |
| Edit planned session before done | `C`                | Links to existing program/workout surfaces only; no inline mutation.               |
| Status rendering                 | `C`/`D`            | Shows planned-only/history-not-connected state; no completed/skipped/missed truth. |
| Manual mark done                 | `D`                | Out of scope; no completion API or mutation.                                       |
| Completed micro sessions layer   | `E`                | Out of scope; Compare remains available separately.                                |
| Habits overview layer            | `E`                | Out of scope; Compare remains available separately.                                |
| Perfect Day overview layer       | `E`                | Out of scope until a daily summary contract exists.                                |
| Plan-vs-actual insights          | `F`                | Out of scope; planned rows are ready for later linkage.                            |
| Garmin export/import/reconcile   | `G`                | Out of scope; planned instance identity is prepared for future provider mapping.   |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                                                                   | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/calendar` has clear `Plan` and `Compare` modes; `Compare` preserves the existing report and `Plan` is clearly planned-only.                                                                                         | route/page tests + screenshot handoff       | `5/5`                   |
| UX flow clarity                               | `target`     | A signed-in user can select or reach the comeback week, inspect planned sessions, see history-not-connected state, and reach edit links without docs.                                                                            | e2e + copy review + manual QA               | `5/5`                   |
| Visual design quality                         | `target`     | Plan view reuses My Library/program-builder visual language, keeps dense week scanning, has no nested-card clutter, and has no mobile text overflow.                                                                             | screenshot handoff + responsive checks      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Planned instances are materialized only from canonical `program.startsOn`, program/week/assignment/workout IDs, and deterministic week/day math; no calendar-local completion truth or title-based identity is introduced.       | unit/view-model tests + invariant fixtures  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes an end-user My Library calendar flow and no admin editing surface.                                                                                                                                | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Keyboard and screen-reader users can switch modes, navigate the week, inspect planned sessions, and activate edit links with no serious/critical issue.                                                                          | component/e2e a11y checks + keyboard QA     | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library/calendar` stays within existing private-route budgets and avoids material client bundle growth from the Plan mode.                                                                                                  | build/bundle review + `verify:pre-pr`       | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Program start date and planned instances remain server-canonical; selected `view`, `date`, and optional `programId` are URL/local read state; actual outcomes remain external to this slice.                                     | data contract + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar Plan reads refresh after program start-date save, schedule edit, or delete; current dynamic authenticated route behavior remains explicit.                                                                              | loader/cache review + page tests            | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing schema, missing `startsOn`, missing/sync-stale planned instances, missing program, missing workout references, empty program weeks, unsupported params, and load failures show recoverable states with no false success. | unit/component negative-path tests          | `5/5`                   |
| Security and authz                            | `target`     | Anonymous users fail closed through the existing redirect, and program/workout reads never expose another user's references.                                                                                                     | page/API negative-path tests                | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: Plan payloads must include only private owner-scoped planning data and no unrelated profile notes, prompts, provider payloads, or admin data.                                                                   | payload review + scope rationale            | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: canonical workout/program ownership remains upstream; this brief adds display and recovery copy only.                                                                                                           | linked foundation brief + docs review       | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, operator actions, role-gated CRUD, or admin Help/Guide surfaces change.                                                                                                                    | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/calendar` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.                                                                       | private-route SEO rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the Plan view is private user planning data and creates no public AI-discoverable content.                                                                                                                           | private-data AI discoverability rationale   | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if mode-inspection events are added, they must use stable canonical IDs and emit no completion KPI before history exists; no-new-event is acceptable if explicit.                                               | event review or no-new-event rationale      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Plan mode must not mutate checkout, entitlements, billing, paid access, or product catalog truth.                                                                                                               | scope rationale + route review              | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: user-facing recovery copy and logs should distinguish missing schema, missing start week, missing references, empty week, and history-not-connected states.                                                     | support-copy review + route-label sweep     | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not change checkout, revenue recognition, invoices, refunds, payouts, entitlement reporting, or accounting data.                                                                                     | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | `Plan`, `Compare`, weekday/date copy, planned/actual labels, and unknown-state copy avoid identity coupling and remain ready for later localization.                                                                             | copy review + responsive text tests         | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js App Router, TypeScript, Supabase helpers, Tailwind, My Library primitives, calendar helpers, and program contracts; add no dependency for calendar basics.                                                         | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include focused schema/contract tests, unit/component tests, route/page tests, auth/missing-data negative paths, e2e Plan/Compare navigation, screenshot handoff, `verify:pre-pr`, CI, `verify:pre-merge`.                       | test matrix + gate outputs                  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: Plan loader should avoid N+1 program/workout reads and stay bounded by selected program/week/window.                                                                                                            | loader review + targeted tests              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The nullable `starts_on` migration and Plan mode have explicit rollback notes and can be reverted without corrupting programs, comparison reports, or future history records.                                                    | reversible diff + PR rollback notes         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `app/my-library/calendar/page.tsx` as the single route boundary;
  - add mode normalization before loading mode-specific data;
  - render `CalendarPeriodComparisonHub` only for `Compare`;
  - introduce a focused Plan component only if the view-model cannot be cleanly rendered in the route;
  - keep server/client split minimal and do not move private data loading into a client-only fetch unless needed.
- TypeScript/domain contracts:
  - reuse `ProgramEditorRecord`, `ProgramWeek`, `ProgramAssignment`, `WorkoutSummary`, `PROGRAM_WEEKDAY_LABELS`, and existing calendar date helpers;
  - add `startsOn` to shared program editor/save/summary contracts;
  - add typed planned workout instance contracts and keep them separate from actual history contracts;
  - create typed allowlists for `view` and optional `programId` behavior where needed;
  - validate `startsOn` as a stable ISO Monday date before deriving planned dates;
  - unknown modes, missing IDs, and invalid dates must fail safely.
- Supabase/data layer:
  - add explicit migrations for nullable `programs.starts_on date` and owner-scoped `planned_workout_instances`;
  - update generated DB types if this repo requires generated type refresh for migrations;
  - keep RLS/user ownership behavior unchanged and fail closed;
  - read authenticated user's programs and referenced workouts through `lib/programs/server.ts` patterns;
  - cross-user program/workout references must remain rejected or invisible.
- External services:
  - `N/A`; no Garmin, AI provider, Stripe, Vercel, or external SDK behavior belongs in this child.
- UI system:
  - reuse `SiteChrome`, My Library route width/padding, `fs-library-card`, action layout helpers, and the existing program-builder scheduled workout display language;
  - `CalendarPeriodComparisonHub` is the reference for `Compare`;
  - `ProgramBuilderHub` is the reference for how scheduled assignments and workout previews are presented;
  - if step-preview logic is needed outside `ProgramBuilderHub`, extract a small shared renderer/helper instead of copying private logic blindly.
- Testing:
  - add focused tests for view normalization, Plan view-model, page mode routing, missing data, and Plan/Compare navigation;
  - use screenshot handoff because this is visible UI work.

## Data Placement And Sync Contract

- Server-canonical:
  - `programs` rows,
  - `program.startsOn` / `programs.starts_on`,
  - `program.id`,
  - `program_week.id`,
  - `program_assignment.id`,
  - referenced `workout.id`,
  - `planned_workout_instances` rows,
  - future training-history entries when the history slice exists.
- Derived during program save/sync:
  - planned instance `planned_on` = `program.startsOn + weekIndex * 7 + assignment.dayIndex`.
- Local-only / URL state:
  - selected calendar mode (`view=plan|compare`),
  - selected `date`,
  - optional selected `programId`,
  - expanded rows and transient UI filters.
- Sync policy:
  - Program save/sync materializes planned instances from saved program state and `startsOn`;
  - Plan view reads planned instances as the calendar truth for planned-only sessions;
  - edit links take users to existing program/workout editors;
  - program start-date or schedule edits invalidate/reload Plan view through existing dynamic private route behavior;
  - actual outcomes remain absent until the training-history brief provides canonical data.
- Retention and sensitivity:
  - planned sessions are private user-owned planning data;
  - no unrelated notes, provider payloads, admin data, prompts, or comments should be embedded in Plan payloads.
- Cache/invalidation:
  - keep `/my-library/calendar` dynamic/authenticated unless implementation proves a stricter cache contract;
  - reads must refresh after program save/edit/delete and missing-workout repair.

## Identity And Rename Contract

- Canonical stable IDs:
  - `planned_workout_instances.id`, `program.id`, `program_week.id`, `program_assignment.id`, and `workout.id` identify planned sessions.
- Human-readable identifiers:
  - program title, workout title, week label, weekday label, and calendar date headings are presentation only.
- Mutability rules:
  - renaming a program/workout does not change calendar identity;
  - changing `program.startsOn` deliberately reschedules planned-only instances for the whole program while preserving program/week/assignment IDs;
  - moving an assignment should preserve `assignment.id` and update the same planned instance when it is the same planned slot;
  - changing a referenced workout must not be treated as a completed-session rewrite because completion is out of scope.
- Rename vs repurpose:
  - edit in place only when the same plan/workout intent remains;
  - materially different plan intent should become a new program or assignment before future history is attached;
  - after future history exists, changing `startsOn` for a program with linked actual outcomes will need explicit compatibility rules in the training-history brief.
- Compatibility contract:
  - Plan links, tests, analytics, exports, and future history must resolve IDs rather than titles or ordinal labels.
- Observability and repair:
  - unsupported modes, missing program/week/workout references, duplicate assignment IDs, and future unknown actual-status values must produce deterministic copy/logs.

## Forward Compatibility Contract

- Extensibility surfaces:
  - calendar modes,
  - date/week params,
  - program `startsOn`,
  - program source kinds,
  - program week/assignment fields,
  - workout summary fields,
  - future history outcome states,
  - analytics event values,
  - localized labels.
- Source of truth:
  - planned sessions persist as canonical instances derived from programs, `startsOn`, weeks, assignments, and workouts;
  - comparison sources derive from existing calendar comparison helpers;
  - actual outcomes later derive from training-history entries.
- Additive behavior:
  - new saved programs with `startsOn`, weeks, assignments, and workouts should create/update matching planned instances automatically when they follow canonical contracts;
  - new dates should work through date helpers rather than one-off comeback-week logic.
- Explicit mapping requirements:
  - per-assignment date overrides, provider states, new history outcomes, edit-before-complete semantics, Garmin sync statuses, reminders, new calendar modes, export formats, or analytics event values require typed mapping/copy/test updates before release.
- Unknown or deprecated values:
  - unknown `view` fails to a safe mode or explicit unsupported state;
  - missing/null `startsOn` shows a choose-start-week recovery state and is not silently projected;
  - unknown program source kinds render as generic saved programs or show recovery copy;
  - unknown history outcomes must not be counted as completed.
- Test/evidence:
  - include future-date fixtures beyond `2026-06-22`;
  - include unknown-mode and missing-reference tests;
  - route/label/support sweep must cover `/my-library/calendar`, `Plan`, `Compare`, and related support docs.

## Help/Guide And Operator Training Contract

- This child changes visible user workflow labels on `/my-library/calendar`.
- Implementation must update relevant user-flow/support docs in the same PR unless the owner explicitly accepts an `N/A` rationale after seeing the final copy.
- Required support distinction:
  - `Plan` shows planned sessions only.
  - `Compare` shows historical trend comparison.
  - actual swim completion remains not connected until the training-history slice ships.

## Route, Label, And Support-Surface Impact Sweep

Run the targeted sweep before broad gates when implementing:

- identifiers:
  - `/my-library/calendar`
  - `Comparison Report`
  - `Plan`
  - `Compare`
  - `view=plan`
  - `view=compare`
  - `history not connected`
  - `programId`
  - `starts_on`
  - `startsOn`
  - `planned_workout_instances`
  - `plannedOn`
  - `start week`
- surfaces:
  - `app/`
  - `components/`
  - `lib/my-library/`
  - `lib/programs/`
  - `tests/`
  - `docs/`
  - active/planned/done briefs that mention calendar, program builder, training history, Habits analysis, or My Library.

Implementation evidence:

- identifiers searched: `/my-library/calendar`, `Comparison Report`, `Plan`, `Compare`, `view=plan`, `view=compare`, `history not connected`, `programId`, `starts_on`, `startsOn`, `planned_workout_instances`, `plannedOn`, `start week`, `Open Plan`, and `Edit Plan`.
- surfaces checked: `app/`, `components/`, `lib/my-library/`, `lib/programs/`, `tests/`, `docs/`, active task briefs, planned task briefs, done task briefs with calendar/program/history references, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and `docs/architecture/data-access-authz-cache-contract-registry.md`.
- fallout handled: Calendar route copy, My Library dashboard copy, support/runbook copy, architecture registry, comparison links, Plan/Compare params, program save routes, generated DB types, and unit/page tests were updated in the same branch.
- no unexpected 500 / failure-mode evidence: program create/update routes return explicit `503` when planned-instance schema is not ready, `500` for planned-instance sync failures, and preserve existing auth/validation failure behavior; calendar Plan loader returns recoverable schema/load/missing-reference states instead of treating failures as success.

## Manual QA And Screenshot Contract

- UI work requires screenshot handoff before `verify:pre-pr`, PR update, and `verify:pre-merge`.
- Capture `after/reference` artifacts:
  - `after-calendar-plan-desktop`
  - `after-calendar-plan-mobile`
  - `reference-calendar-compare-desktop`
  - `reference-program-builder-schedule-desktop` where practical.
- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` and the local Freeswimming screenshot defaults.
- Stop for owner visual approval after screenshot handoff.
- owner screenshot approval stop: completed after screenshot handoff at `output/calendar-plan-child-a-2026-06-20-052215`; owner approved the visual state before `verify:pre-pr` and approved merge only after green tests.
- screenshot approval stop evidence: no `verify:pre-pr`, PR update, or merge step was run until the owner approved the final screenshot round.

## Acceptance Criteria

- Existing `/my-library/calendar` supports a clear `Plan` mode and preserves the existing `Compare` report.
- Migrations add `programs.starts_on date` and `planned_workout_instances`; shared/generated types are updated; program create/save/load contracts include `startsOn`.
- Program week 1 is anchored to a valid Monday `startsOn`; planned instances are created/updated deterministically from `startsOn`, week index, and `dayIndex`.
- `view=compare` or existing comparison links continue to show the current comparison report with source/period/date behavior intact.
- `view=plan` shows a selected Monday-Sunday week and planned swim sessions whose persisted `planned_on` dates land in that week.
- The comeback QA date `2026-06-22` is covered as a fixture or screenshot target, but product logic remains date-driven for future weeks.
- Plan rows use canonical program/week/assignment/workout IDs and do not infer identity from labels.
- Plan rows have a stable planned-instance ID for future completion/history/provider attachment.
- Empty, loading, schema-sync, missing start week, missing program, missing workout, unsupported mode, and history-not-connected states are recoverable and accessible.
- Edit actions link to existing program/workout editor surfaces.
- No completion/history mutation exists in this child.
- Relevant docs/support copy are updated or explicitly documented as `N/A`.
- Screenshot handoff is approved before PR gates.

## Validation

Plan-only brief creation:

- `npm run lint:briefs`
- `git diff --check`

Future implementation:

- migration validation and generated DB type update where applicable
- targeted unit tests for `startsOn` validation, assignment-date derivation, and planned-instance materialization
- targeted unit tests for view normalization and Plan view-model loading from planned instances
- targeted component tests for Plan rendering and failure states
- page tests for auth redirect, Plan/Compare mode routing, and preserved comparison params
- e2e for signed-in Plan/Compare navigation
- route/label/support-surface sweep
- screenshot handoff and owner visual approval
- `npm run verify:pre-pr`
- required CI checks
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Git Rhythm Defaults

- This child is currently in runtime implementation on `feat/calendar-plan-anchor-child-a`.
- Runtime implementation started from current `main`.
- Do not merge without explicit owner approval.
- Continue runtime only within Child `A` scope; do not merge without explicit owner approval.

## Checkpoint Log

- `2026-06-20 | planning | created proposed child brief from parent contract after confirming clean synced main at 1b8f87da, existing comparison route, canonical program foundation, and no persisted calendar start-date field; initial draft considered a no-migration read-only projection, then owner challenged that because there are no live users yet | next: revise toward persisted program calendar anchor before runtime implementation`
- `2026-06-20 | planning | owner confirmed that because there are no live users and the frontend is closed, the first Plan-view slice should use a real persisted program calendar anchor; revised scope to add nullable `programs.starts_on`, validate it as the Monday start of program week 1, derive assignment dates from canonical week/day structure, and keep completion/history out of scope | next: wait for explicit execute/implement instruction before runtime branch work`
- `2026-06-20 | planning | added explicit child roadmap and dependency table so completion/history, plan-vs-actual, edit-before-complete, direct reschedule, and Garmin sync are captured as follow-on children without expanding Child A runtime scope | next: execute Child A only after explicit owner implementation instruction`
- `2026-06-20 | in-progress | owner said `implementer Child A`; moved brief to `in-progress` and started runtime implementation on branch `feat/calendar-plan-anchor-child-a` with existing parent roadmap changes carried forward | next: add `programs.starts_on` migration/contracts, implement Calendar Plan view, update docs/tests, then produce screenshot handoff before broad PR gates`
- `2026-06-20 | in-progress | owner chose option 2: make planning proper now by materializing each planned calendar workout as a persisted instance of an existing workout; Child A scope updated from virtual plan rows to `planned_workout_instances` while keeping completion/Garmin/history runtime out of scope | next: add planned-instance migration/contracts, sync on program save, render Calendar Plan from instances, then produce screenshot handoff before broad PR gates`
- `2026-06-20 | in-progress | owner asked to systematize the broader 10/10 calendar and requested visual corrections after screenshot handoff: title-case `Open Plan`, equal-width plan/week controls, and consistently aligned `Edit Plan` actions | next: update roadmap/child briefs, apply the visual corrections, refresh screenshots, and stop again for owner visual approval before `verify:pre-pr``
- `2026-06-20 | in-progress | owner approved screenshot handoff at `output/calendar-plan-child-a-2026-06-20-052215` and approved merge when tests are green; Child A remains scoped to planned instances and Plan view while follow-up month/status/completion/layers work is tracked in planned child briefs | next: run `npm run verify:pre-pr`, commit, push, open/update PR, monitor CI, run `npm run verify:pre-merge`, and merge only if all gates are green`
- `2026-06-20 | in-progress | pre-PR gate found the new Supabase migration pending on linked remote; ran `npx supabase db push --linked --yes`, applied `20260620120000_programs_start_date_anchor.sql`, and verified migration history shows local/remote parity | next: rerun `npm run verify:pre-pr``
- `2026-06-20 | in-progress | `npm run verify:pre-pr` passed on the full lane after migration parity and quality-gate evidence fixes: lint, typecheck, unit, build, performance budgets, and Playwright gate passed (`111 passed`, `567 skipped` where dev-login/browser coverage is intentionally unavailable locally); performance script recommended tightening after consecutive green runs, but ratchet remains held by the separate post-2026-06-19 weekly-cycle rule | next: commit, push, open/update PR, monitor CI, then run `npm run verify:pre-merge` before merge`
- `2026-06-20 | in-progress | prepared the Child A commit with planned instances, Plan/Compare route mode, start-week UI, migration/types, tests, screenshots, support docs, and follow-up child briefs | next: push branch, open/update PR, monitor CI, then run `npm run verify:pre-merge` before merge`
