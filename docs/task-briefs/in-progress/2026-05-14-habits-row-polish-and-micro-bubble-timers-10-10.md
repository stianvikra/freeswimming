# Task Brief: Habits Row Polish And Micro Bubble Timers (10/10)

## Metadata

- `id`: `2026-05-14-habits-row-polish-and-micro-bubble-timers-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-14`
- `updated`: `2026-05-14`
- `execution mode`: `end-to-end implementation after owner explicitly asked to execute end-to-end`

## Goal

Make daily routine execution quieter and more practical by simplifying Habits rows, adding a no-quantity build habit path, and adding lightweight countdown behavior to timed Micro Session bubbles.

## Product Decision

This is one daily-execution polish slice with two tightly related surfaces:

- Habits active rows should prioritize what the user can do now, not management controls.
- Micro Sessions bubbles should support a minimal timer for time-based exercises without becoming a large detail view.

Habits decisions:

- Move the top-level `Edit` action inside `Details` for compact habit rows.
- Keep the primary row focused on the current action: `Done`, `Save`, `Undo`, timer controls, or status.
- Add a `Done only` build target option for habits such as `Drink water every morning`, where quantity is not useful in real life.
- `Done only` should use the existing binary habit concept where practical; avoid schema changes unless implementation audit proves the current contract cannot express it safely.
- Replace copy such as `1x/week any days` with calmer cadence labels:
  - `Weekly - any day` for one flexible weekly completion,
  - `3x/week - any days` for multiple flexible weekly completions,
  - `Weekly - fixed days` or weekday-specific copy for fixed schedules.
- After a habit is completed, do not place it under `Later` without a completion-specific status.
- Use status groups that reflect the user's mental model:
  - `Action needed`,
  - `Timed today`,
  - `Quit status`,
  - `Done today`,
  - `Done this week`,
  - `Later`.
- Within non-urgent groups, sort shorter cadence first and longer interval lower: daily, weekly, monthly.

Micro Sessions decisions:

- Bubbles remain small and lightweight. No notes/details panel in this slice.
- Tapping a timed bubble makes that bubble slightly larger/active in place, not a full overlay.
- Only one bubble can be active at a time.
- Timed bubbles show `Start`; once started they show a countdown.
- When the countdown reaches `0`, the unit is completed through the same server-confirmed mutation path as existing completion.
- If the user taps `Done` before the countdown reaches `0`, ask for a small confirmation before completing.
- Non-timed bubbles keep the existing direct completion confirmation pattern.
- Completion truth remains server-canonical; timer ticks are local UI state only.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this brief:

- every `target` category must close at `5/5`,
- no target category may close at `4/5` and still claim 10/10.

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

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                                                                              | Evidence                                                                                        | Expected Closeout Score |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | Habits rows and Micro Session bubbles remain execution-first surfaces; management controls move behind details, and timed bubbles do not become a separate workflow.                            | product audit + screenshot handoff + owner QA                                                   | `5/5`                   |
| UX flow clarity                               | `target` | Users can mark a no-quantity build habit done, understand weekly/daily completion status, start a timed bubble, and finish early only through confirmation.                                     | component tests + Playwright flow + screenshot review                                           | `5/5`                   |
| Visual design quality                         | `target` | Mobile rows fit without crowded action bars; active bubbles grow only enough to expose timer controls; no text overlap, oversized overlays, or nested-card clutter.                             | before/after screenshots across mobile and desktop                                              | `5/5`                   |
| Business logic correctness and data integrity | `target` | Done-only habits map deterministically to binary completion; completed habits are grouped by actual cadence status; timer completion uses the existing server-confirmed Micro Session mutation. | domain/component/API tests + mutation-path review                                               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`    | N/A because this changes authenticated user execution surfaces, not admin editing, publishing, moderation, or operator CRUD.                                                                    | explicit admin editor scope rationale                                                           | `N/A`                   |
| Accessibility (a11y)                          | `target` | Details/edit access, done-only controls, grouped statuses, active bubble timer controls, countdown text, keyboard interaction, focus state, and reduced-motion behavior remain accessible.      | Testing Library assertions + Playwright keyboard smoke + screenshot review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | No new dependency; `/my-library/habits`, Home routine summary, and Micro Sessions keep existing budgets; countdown uses at most one active interval and cleans up on state change/unmount.      | dependency diff + build/perf budgets + code review                                              | `5/5`                   |
| Data placement and sync boundaries            | `target` | Habit definitions/check-ins and Micro Session completion remain server-canonical; open Details, active bubble, countdown seconds, and early-done confirmation are local-only transient state.   | data-boundary review + tests                                                                    | `5/5`                   |
| Caching and invalidation strategy             | `target` | Habit check-ins, undo/reset, and micro-unit completion refresh affected snapshots without stale `Action needed`, `Done today`, `Done this week`, or bubble board state.                         | route/component tests + manual refresh QA                                                       | `5/5`                   |
| Reliability and failure handling              | `target` | Failed habit saves, failed early-done confirmation, failed auto-complete at timer zero, timer cancellation, and reload during timer state leave recoverable UI and do not corrupt completion.   | negative-path tests + failure-mode review                                                       | `5/5`                   |
| Security and authz                            | `target` | No client-only timer or habit action can bypass existing authenticated owner-scoped APIs; protected writes remain fail-closed with input validation.                                            | existing route tests + targeted negative-path additions if touched                              | `5/5`                   |
| Privacy and compliance                        | `target` | Habit labels remain private; timer and done-only analytics/logs contain mode/cadence/action metadata only, not raw habit titles or notes.                                                       | analytics/log payload review + tests where events change                                        | `5/5`                   |
| Content governance                            | `target` | Product labels for cadence, completion groups, done-only target, and bubble timer actions have one code/test/docs contract and are reflected in support/user-flow docs where relevant.          | route/label/support sweep + docs/test assertions                                                | `5/5`                   |
| Admin workflow and editability                | `N/A`    | N/A because no admin role, support console, publish workflow, admin mutation, or operator editability changes in this slice.                                                                    | explicit admin workflow scope rationale                                                         | `N/A`                   |
| SEO and crawlability                          | `N/A`    | N/A because `/my-library/habits` and `/my-library/dryland` Micro Sessions are authenticated/private and no public metadata, robots, sitemap, canonical, or crawlable content changes.           | explicit private-route rationale                                                                | `N/A`                   |
| AI discoverability                            | `N/A`    | N/A because this brief creates no public AI-discoverable content, structured data, public docs page, or crawl-safe entity surface.                                                              | explicit private-route rationale                                                                | `N/A`                   |
| Analytics and KPI observability               | `target` | Existing first-party events can distinguish done-only habit completion, cadence status, timer started, timer auto-completed, and early done confirmation without sensitive labels.              | event taxonomy review + analytics payload tests if events change                                | `5/5`                   |
| Commerce and revenue ops                      | `N/A`    | N/A because this changes no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation.                                                                        | explicit commerce scope rationale                                                               | `N/A`                   |
| Incident response and support operations      | `target` | Support/runbook notes can diagnose hidden edit access, stale completion grouping, done-only habit confusion, timer not completing, failed early completion, and undo/retry behavior.            | `docs/runbooks/auth-account-support.md` update or explicit no-change rationale + support sweep  | `5/5`                   |
| Finance and reporting operations              | `N/A`    | N/A because private habit and micro-session execution UI has no finance, payout, refund, entitlement, invoice, subscription, reporting export, or reconciliation impact.                        | explicit finance scope rationale                                                                | `N/A`                   |
| i18n operational readiness                    | `target` | Labels remain short and locale-ready: `Done only`, `Weekly - any day`, `Done today`, `Done this week`, `Start`, countdown, `Done`, and confirmation copy avoid grammar-coupled strings.         | copy review + component tests for label presence                                                | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Reuse `HabitPerfectDayHub`, habit shared domain helpers, `DrylandMicroPlanPanel`, existing Micro Session mutation helpers, Tailwind/UI primitives, and current test stack; add no dependency.   | architecture review + no-dependency diff                                                        | `5/5`                   |
| Testing and QA automation                     | `target` | Unit/component/domain tests cover new habit labels/grouping/done-only path and bubble timer state; Playwright/screenshot handoff covers the changed mobile-first flows before PR gates.         | targeted Vitest + targeted Playwright + screenshot handoff + `verify:pre-pr`/`verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target` | Habit grouping remains computed from bounded snapshots; only one active bubble countdown interval exists; no polling, broad history scan, or new persisted timer event stream is introduced.    | code review + tests for one-active-bubble behavior                                              | `5/5`                   |
| DevOps and rollback readiness                 | `target` | Prefer no migration; if audit requires a schema or type change, make it additive with generated types, rollback notes, and schema drift evidence; otherwise keep rollback to UI/domain revert.  | migration/no-migration review + gate logs                                                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces are `components/my-library/habits/HabitPerfectDayHub.tsx` and `components/my-library/dryland/DrylandMicroPlanPanel.tsx`.
  - Keep route boundaries unchanged: `/my-library/habits` for Habits and `/my-library/dryland` Micro Sessions for bubbles.
  - Keep server loading in current route loaders; use client state only for row expansion, active bubble, countdown, and pending confirmation.
  - Sweep Home and My Library routine summaries only if habit grouping/status labels leak into those surfaces.
- TypeScript/domain contracts:
  - Reuse existing `HabitMode`, `HabitType`, `HabitCadencePeriod`, `HabitPriorityGroup`, and dryland micro-plan unit types.
  - Add deterministic helpers only where they reduce duplicate status/grouping logic.
  - Done-only build habits should map to existing binary semantics if possible.
  - Timer state must not become business truth until the existing completion mutation succeeds.
- Supabase/data layer:
  - Expected path is no migration.
  - If implementation audit proves a data contract gap, use additive migration, fail-closed RLS/authz, generated DB type updates, and negative-path tests.
- External services/tools:
  - No Garmin, Apple Health, push notifications, reminders, or external analytics vendor.
  - Existing first-party analytics only, with sensitive labels redacted.
- UI system:
  - Use current Tailwind/button/chip visual language.
  - Habit rows should avoid top-level management clutter on mobile.
  - Active timed bubbles should scale in place modestly, not open a large overlay.
  - Screenshot handoff is before/after for Habits and Micro Sessions mobile/desktop where practical.
- Testing:
  - Component tests for habit row actions, details/edit placement, done-only build creation/rendering, completed group labels, and cadence sort.
  - Component tests for bubble active state, countdown, early-done confirmation, auto-complete, one-active-bubble behavior, keyboard path, and failure recovery.
  - Route/API tests only if implementation touches protected mutation contracts.

## Data Placement And Sync Contract

- Server-canonical data:
  - Habit definitions, habit check-ins, cadence fields, start dates, status, and sort order.
  - Dryland micro-plan units, completion status, skipped/completed facts, and undoable completion state through existing Micro Session APIs.
- Local-only data:
  - Habit Details expansion state.
  - Add/edit form draft state before save.
  - Active bubble id.
  - Countdown remaining seconds.
  - Timer started/paused state if pause is included.
  - Early-done confirmation state.
  - Temporary pending/error UI.
- Sync policy:
  - Habit done/save/undo mutations become truth only after successful API response and snapshot refresh.
  - Timed bubble auto-completion becomes truth only after existing server mutation succeeds.
  - Early `Done` uses the same completion mutation after confirmation.
  - Timer ticks are discarded on reload; the user can restart or mark done.
- Conflict policy:
  - If a completion mutation fails, keep the habit/bubble visible with recoverable error copy and retry path.
  - If the unit has already been completed elsewhere, refresh and remove/demote the bubble rather than double-writing.
  - If a habit is no longer active, refresh and avoid presenting stale `Done`/`Save`.
- Retention and sensitivity:
  - No raw habit titles, notes, or private exercise notes in analytics/logs introduced by this slice.
  - Existing export/delete contracts remain unchanged unless a data-model audit introduces new fields.
- Cache/invalidation:
  - Authenticated routes remain dynamic/no-store as today.
  - Successful mutations refresh the affected habit snapshot or micro-plan state.
  - Home/My Library summaries must not show stale counts if touched.

## Identity And Rename Contract

- Canonical stable ID:
  - Habit identity remains `habit_definitions.id`.
  - Habit check-in identity remains `habit_check_ins.id`.
  - Micro-plan/unit identity remains the existing micro-plan block/unit identifier used by current completion mutations.
- Human-readable identifiers:
  - Habit titles, exercise labels, cadence labels, group headings, and button text are display-only and renameable.
- Mutability rules:
  - Moving `Edit` into `Details` changes presentation only.
  - Done-only target selection may edit an existing build habit when it preserves the same user intent.
  - Materially repurposing a habit still requires a new habit identity rather than rewriting history.
- Rename vs repurpose policy:
  - `Drink water` to `Drink water every morning` is an edit.
  - `Drink water` to `Avoid sugar` is a new habit.
- Compatibility contract:
  - Existing count/duration/binary/time-of-day/avoidance habits remain readable.
  - Existing micro-session bubbles without durations keep current completion behavior.
  - Existing timed/duration micro units gain timer affordance without changing their saved identity.
- Observability and repair:
  - Support diagnostics should distinguish stale UI grouping, missing habit target type, failed completion mutation, and local timer interruption without exposing private labels.

## Scope

- Create/update this planned task brief only until owner explicitly asks to implement.
- Habits:
  - Move row-level `Edit` into `Details`.
  - Add or clarify `Done only`/binary build target option for no-quantity habits.
  - Remove numeric input and `Save` from done-only build rows.
  - Improve cadence label copy for flexible weekly habits.
  - Replace completed-but-not-due `Later` placement with completion-specific status groups.
  - Sort non-urgent groups daily, weekly, monthly.
- Micro Sessions:
  - Add minimal active bubble state for timed units.
  - Add countdown start and display for units with seconds/duration targets.
  - Auto-complete at zero through existing mutation.
  - Add confirmed early `Done`.
  - Keep non-timed bubbles on existing completion confirmation path.
- Documentation/support:
  - Update user-flow/support docs if labels or recovery behavior change.
  - Record route/label/support sweep in the implementation brief checkpoint.

## Out Of Scope

- Large bubble overlay, notes, full exercise detail drawer, technique content, or coaching copy.
- Persistent timer sessions, pause/resume across reloads, background timers, notifications, sound, haptics, widgets, or native app behavior.
- New habit reminder system.
- New analytics dashboard.
- Garmin/Apple Health/Strava/Fitbit integration.
- Micro Session scheduling/release model changes.
- Habit schema redesign beyond a small additive change if implementation audit proves one unavoidable.
- Admin, commerce, public SEO, or entitlement changes.
- Merge or release without explicit owner approval.

## Acceptance Criteria

1. Compact Habits rows no longer show top-level `Edit`; edit remains reachable inside `Details`.
2. Habit management actions stay keyboard reachable and labelled after being moved into `Details`.
3. A build habit can be configured as `Done only` with no quantity/unit input.
4. A done-only habit row shows a direct `Done` action before completion and `Undo`/done status after completion.
5. Existing count habits such as glasses/times still support numeric input and save.
6. Flexible weekly cadence no longer renders as `1x/week any days`; it renders as `Weekly - any day` or equivalent approved copy.
7. Completed daily habits do not move to a generic `Later` group; they show `Done today` or equivalent completion status.
8. Weekly target-met habits show `Done this week` or equivalent weekly status.
9. Non-urgent habits sort daily before weekly before monthly.
10. Quit habits remain low-interruption and do not compete with click-required build/timed actions.
11. Timed Micro Session bubbles modestly expand in place when active and expose only timer controls needed for execution.
12. Timed bubbles show `Start` before countdown and countdown text after start.
13. Timed bubbles auto-complete via existing server-confirmed completion when countdown reaches zero.
14. Tapping `Done` before countdown completion requires confirmation before marking the unit complete.
15. Non-timed bubbles keep the existing direct completion confirmation behavior.
16. Only one bubble can be active/counting down at a time.
17. Failed auto-complete or early completion keeps the bubble visible with a recoverable retry path.
18. Reduced-motion and keyboard access remain supported for bubble interaction.
19. No new dependency is added.
20. Screenshot handoff covers Habits row polish and Micro Sessions timed bubble flow before `npm run verify:pre-pr`.

## Validation

Planning/brief validation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Implementation validation before PR update:

- Targeted unit/component tests:
  - `tests/unit/habit-perfect-day-hub.test.tsx`
  - `tests/unit/habits.test.ts`
  - `tests/unit/my-library-today.test.ts`
  - `tests/unit/today-tabs-panel.test.tsx` if summaries change
  - `tests/unit/dryland-micro-plan-panel.test.tsx`
  - `tests/unit/dryland-micro-plans.test.ts` if shared domain helpers change
  - route tests if protected mutation contracts change.
- Targeted Playwright:
  - `tests/e2e/my-library-habits.spec.ts`
  - relevant Home/routines entrypoint test if summary labels change
  - dryland/micro-session flow covering timed bubble countdown where local auth allows.
- Broad gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run build`
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`

UI screenshot gate:

- Required because this is user-facing UI/layout behavior.
- Stop after targeted implementation QA and before `npm run verify:pre-pr`.
- Provide `Screenshot artifacts`, `Captured: YYYY-MM-DD HH:MM`, and 2-4 representative screenshots.
- Use `before/after` filenames where possible:
  - `before-habits-mobile.*`
  - `after-habits-mobile.*`
  - `before-micro-bubbles-mobile.*`
  - `after-micro-bubbles-mobile.*`
- Include desktop screenshots if implementation changes desktop layout beyond incidental responsive behavior.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/habits`
  - `http://127.0.0.1:3000/my-library/dryland?view=micro`
  - `http://127.0.0.1:3000/my-library/routines` if summary links/labels change.
- Viewports:
  - mobile phone width,
  - tablet width where practical,
  - desktop width.
- Browsers:
  - Chromium automated screenshots,
  - Safari/WebKit spot check where practical because this is mobile-first execution UX.
- QA scenarios:
  - done-only habit before and after done,
  - count habit still showing input/save,
  - weekly any-day habit before and after completion,
  - fixed-day not-due habit,
  - quit habit status row,
  - timed bubble start/countdown/auto-complete,
  - timed bubble early done confirmation,
  - non-timed bubble completion,
  - failed completion recovery if easy to simulate.

## Help / Guide Impact

Required if implementation changes user-facing workflow labels or recovery behavior:

- update `docs/user-flow-map.md` for Habits row states and Micro Sessions timed bubbles,
- update `docs/runbooks/auth-account-support.md` with support diagnostics for:
  - edit moved into details,
  - done-only habit setup,
  - stale completion group/status,
  - timer auto-complete failure,
  - early done confirmation and undo/retry.

If implementation audit finds no Help/Guide-facing change beyond private labels already covered by tests, record explicit N/A rationale in the checkpoint log and PR summary.

## Route / Label / Support Surface Sweep

Required before broad verification because this changes labels, workflow actions, and support-visible recovery behavior.

Search targets:

- `Edit`
- `Details`
- `Done only`
- `Any`
- `1x/week any days`
- `Weekly - any day`
- `Done today`
- `Done this week`
- `Later`
- `Action needed`
- `Timed today`
- `Quit status`
- `Bubbles`
- `Complete?`
- `Done`
- `Start`
- `Timer`
- `countdown`
- `Undo`
- `/my-library/habits`
- `/my-library/dryland`
- `Micro Sessions`

Surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs
- Help/Guide assertions when relevant.

## Checkpoint Log

- `2026-05-14 | planned | created after owner manual review of Habits mobile rows and discussion of lightweight Micro Sessions bubble timers; scope is plan-only until owner explicitly asks to implement | next: owner reviews scope/categories or asks to execute this brief end-to-end`
- `2026-05-14 | in-progress | owner said "execute end to end"; started branch `feature/habits-row-polish-micro-bubble-timers`from synced`main`at`b3ee4c9`, moved brief to in-progress, and kept the required UI screenshot stop before `npm run verify:pre-pr` | next: audit Habits and Micro Sessions bubble surfaces before scoped implementation`
- `2026-05-14 | implemented core | reused existing Habits binary semantics for `Done only`with no migration, moved row`Edit`into`Details`, added `Done today`/ period-done habit groups and calmer cadence labels, suppressed quick numeric/timer controls after completion, and added local-only timed bubble countdown state that auto-completes through the existing owner-scoped Micro Session completion mutation at zero with confirmed early done | validation: targeted Vitest for habits domain/component and dryland micro panel PASS (3 files, 43 tests) | next: route-label/support sweep, lint/typecheck, screenshot capture, then stop before`npm run verify:pre-pr``
- `2026-05-14 | route-label-support-sweep | identifiers searched: Edit, Details, Done only, Any, 1x/week any days, Weekly - any day, Done today, Done this week, Done this month, Later, Action needed, Timed today, Quit status, Bubbles, Complete?, Done, Start, Timer, countdown, Undo, /my-library/habits, /my-library/dryland, and Micro Sessions | surfaces checked: app/, components/, lib/, tests/, docs/runbooks/, docs/user-flow-map.md, active/planned/done task briefs, and analytics/mutation references | fallout handled in HabitPerfectDayHub, habit shared helpers, DrylandMicroPlanPanel, unit tests, user-flow map, auth support runbook, and this brief; old-label hits in historical done briefs intentionally remain as evidence | validation: npm run lint PASS, npm run typecheck PASS, npm run lint:briefs:all PASS, targeted Vitest PASS, git diff --check PASS | next: screenshot handoff before `npm run verify:pre-pr``
- `2026-05-14 | screenshot-approved | captured after/reference mobile screenshot handoff at `/Users/stianvikra/freeswimming/output/habits-row-polish-micro-bubble-timers-20260514-103531`showing Habits execution groups,`Edit`inside`Details`, timed bubble countdown, and non-timed bubble confirmation; owner screenshot approval recorded, and owner asked not to regenerate | validation: local Next preview + Playwright Chromium capture PASS; screenshot approval stop satisfied before `npm run verify:pre-pr`; temporary preview route/script removed afterward with no product-rendering code changed after the approved capture | next: run `npm run verify:pre-pr`, commit, push, open PR, monitor CI`
