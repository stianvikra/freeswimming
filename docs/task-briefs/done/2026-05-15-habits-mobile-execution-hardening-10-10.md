# Task Brief: Habits Mobile Execution Hardening (10/10)

## Metadata

- `id`: `2026-05-15-habits-mobile-execution-hardening-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-15`
- `updated`: `2026-05-16`
- `execution mode`: `end-to-end implementation after owner explicitly asked to execute brief`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@f145992`
- `audit_status`: `ready`
- `decision`: Create a new focused Habits follow-up brief instead of reusing older in-progress briefs.
- `reason`: Existing in-progress briefs are admin, backlog, content-production, or workout-builder workstreams and are marked `revise-before-use`; the completed Habits row polish brief explicitly left persistent timer sessions and reload resume behavior out of scope.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, scorecard categories, `/my-library/habits`, habit domain contracts, PWA storage policy, verification lanes, route labels, Help/Guide, support runbooks, or screenshot handoff rules change.

## Goal

Make Habits execution on mobile feel reliable and obvious by preserving local timer progress across app restarts, making habit creation visible and focused, clarifying `Mark done` versus completed `Done` state, and sorting open habits by nearest deadline.

## Product Decisions

- Habit timer progress is local execution state, not business truth.
- Local timer state may survive installed PWA or browser restarts when it is scoped to the current user, habit, and local calendar date.
- No server completion is written because a local timer was restored; server-canonical completion still requires the existing explicit save/mark-done mutation.
- `Add habit` must open a visible focused creation flow on mobile and an immediately visible focused form on desktop.
- After create, the user lands on the new habit card, not on a detached success message.
- A pre-completion action should say `Mark done`; completed state should say `Done`, `Done today`, `Done this week`, or equivalent.
- Open habits should sort by shortest deadline first: due today/daily first, then weekly, then monthly or longer interval.

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

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                                                                                                                  | Evidence                                                                                        | Expected Closeout Score |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | Habits remains an execution-first route where create, complete, save, timer, and due-order decisions are visible in the right place with no detached success state.                                                                 | product audit + screenshot handoff + owner QA                                                   | `5/5`                   |
| UX flow clarity                               | `target` | Mobile create flow opens in viewport; create returns to the new habit; pre-completion actions say `Mark done`; restored timers clearly show running, paused, resume, reset, or completion state.                                    | component tests + Playwright mobile flow + screenshot review                                    | `5/5`                   |
| Visual design quality                         | `target` | Habit cards, inline success, timer controls, action labels, and due-order groups fit mobile and desktop without overlap, bottom-nav obstruction, crowding, or ambiguous color use.                                                  | before/after screenshots across mobile and desktop                                              | `5/5`                   |
| Business logic correctness and data integrity | `target` | Local timer restore never writes server completion by itself; existing server-canonical habit definition/check-in mutations remain the only source of completion truth; due sorting is deterministic.                               | domain/component tests + mutation-path review                                                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`    | N/A because this changes authenticated user Habits execution and creation UI, not admin editing, publishing, moderation, or operator CRUD.                                                                                          | explicit admin editor scope rationale                                                           | `N/A`                   |
| Accessibility (a11y)                          | `target` | Add form, new-card focus, inline success, `Mark done`, `Undo`, timer pause/resume/reset, details, and due groups have keyboard access, labels, focus order, live-region semantics, and contrast-safe status colors.                 | Testing Library assertions + Playwright keyboard smoke + screenshot review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | No new dependency; `/my-library/habits` keeps existing route budgets; timer restore uses bounded localStorage reads/writes and at most one active interval.                                                                         | dependency diff + code review + build/perf gate evidence                                        | `5/5`                   |
| Data placement and sync boundaries            | `target` | Habit definitions/check-ins remain server-canonical; timer elapsed/started/paused state, add-form visibility, new-card highlight, and focus target are local-only with explicit retention and cleanup rules.                        | data-boundary review + tests                                                                    | `5/5`                   |
| Caching and invalidation strategy             | `target` | Successful create, save, mark-done, undo, and timer-save mutations refresh the affected habit snapshot without stale `Action needed`, `Done`, or due-order placement.                                                               | route/component tests + manual refresh QA                                                       | `5/5`                   |
| Reliability and failure handling              | `target` | Restart, reload, pause restore, localStorage parse failure, storage denial, stale habit id, day boundary, failed create, failed save, and failed mark-done leave recoverable UI and do not corrupt completion.                      | negative-path tests + failure-mode review                                                       | `5/5`                   |
| Security and authz                            | `target` | Local timer or add-flow state cannot bypass authenticated owner-scoped APIs; protected writes remain fail-closed with input validation and no trust in client-only elapsed time beyond submitted habit payload rules.               | existing route tests + targeted negative-path additions if protected contracts change           | `5/5`                   |
| Privacy and compliance                        | `target` | Local timer persistence stores only user/habit/date/timer metadata, not habit titles, notes, or private labels; analytics/logs avoid raw habit content.                                                                             | storage-key review + analytics/log payload review + tests where events change                   | `5/5`                   |
| Content governance                            | `target` | `Mark done`, `Done`, `Done today`, `Habit added`, due-group labels, and timer recovery copy have one code/test/docs contract and are reflected in support/user-flow docs where relevant.                                            | route/label/support sweep + docs/test assertions                                                | `5/5`                   |
| Admin workflow and editability                | `N/A`    | N/A because no admin role, support console, publish workflow, admin mutation, or operator editability changes in this slice.                                                                                                        | explicit admin workflow scope rationale                                                         | `N/A`                   |
| SEO and crawlability                          | `N/A`    | N/A because `/my-library/habits` is authenticated/private and this brief changes no public metadata, robots, sitemap, canonical, or crawlable content.                                                                              | explicit private-route rationale                                                                | `N/A`                   |
| AI discoverability                            | `N/A`    | N/A because this brief creates no public AI-discoverable content, structured data, public docs page, or crawl-safe entity surface.                                                                                                  | explicit private-route rationale                                                                | `N/A`                   |
| Analytics and KPI observability               | `target` | Existing first-party events remain safe and can distinguish create, mark-done, save, undo, timer-save, and timer restore/error paths if instrumentation is touched; no private habit labels are emitted.                            | event taxonomy review + analytics payload tests if events change                                | `5/5`                   |
| Commerce and revenue ops                      | `N/A`    | N/A because this changes no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation.                                                                                                            | explicit commerce scope rationale                                                               | `N/A`                   |
| Incident response and support operations      | `target` | Support/runbook notes can diagnose missing restored timers, stale local timer state, hidden add form, misplaced new habit, ambiguous done state, due-order confusion, failed create/save, and storage fallback.                     | `docs/runbooks/auth-account-support.md` update or explicit no-change rationale + support sweep  | `5/5`                   |
| Finance and reporting operations              | `N/A`    | N/A because private habit execution UI has no finance, payout, refund, entitlement, invoice, subscription, reporting export, or reconciliation impact.                                                                              | explicit finance scope rationale                                                                | `N/A`                   |
| i18n operational readiness                    | `target` | New or changed labels remain short and locale-ready: `Mark done`, `Done`, `Done today`, `Habit added`, `Resume`, `Pause`, `Reset`, `Create habit`, and due-group labels avoid grammar-coupled string composition.                   | copy review + component tests for label presence                                                | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Reuse `HabitPerfectDayHub`, habit shared domain helpers, existing mutation routes, current Tailwind/UI primitives, and current test stack; add no dependency.                                                                       | architecture review + no-dependency diff                                                        | `5/5`                   |
| Testing and QA automation                     | `target` | Unit/component/domain tests cover timer restore, cleanup, create focus/scroll, inline success, label semantics, and deadline sorting; Playwright/screenshot handoff covers mobile-first create and execution flows before PR gates. | targeted Vitest + targeted Playwright + screenshot handoff + `verify:pre-pr`/`verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target` | Timer persistence and due sorting remain bounded by the current habit snapshot; no polling, broad history scans, service-worker timer loops, or new persisted timer event stream.                                                   | code review + tests for bounded local state                                                     | `5/5`                   |
| DevOps and rollback readiness                 | `target` | Prefer no migration; rollback is a UI/domain revert with localStorage cleanup compatibility; if a schema/type change becomes unavoidable, use additive migration and generated type evidence.                                       | no-migration review or migration/rollback notes + gate logs                                     | `5/5`                   |

## Completion Record

- `completed`: `2026-05-16`
- `merged_pr`: `#720`
- `merge_commit`: `fed28c1`
- `implementation_commit`: `46ffebe`
- `closeout_branch`: `closeout/habits-mobile-execution-hardening`
- `10/10 claim`: yes for the Habits Mobile Execution Hardening scope; all critical target categories are scored `5/5`.
- `screenshot_artifacts`: `output/habits-mobile-execution-hardening-2026-05-15-220958`
- `visual_capture`: Captured `2026-05-15 22:14` Europe/Oslo; owner approved the refreshed mobile/desktop handoff before PR gates.
- `local_gates`: `npm run verify:pre-pr` PASS on `46ffebe`; `npm run verify:pre-merge` PASS on `46ffebe` before merge.
- `ci_gates`: GitHub `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, CodeQL, and Vercel all PASS before merge.
- `remaining_gaps`: none for this scoped brief. Perf trend tightening was intentionally deferred to a separate performance-governance follow-up because it is not a Habits UI correctness requirement.
- `rollback`: `git revert fed28c1`.

| Category                                      | Achieved Score | Evidence                                                                                                                                          | Gaps / Notes                                                      |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #720 shipped the focused Habits execution flow: visible create, inline success, timer restore, clearer action labels, and due-order sorting.   | No remaining scoped gap.                                          |
| UX flow clarity                               | `5/5`          | Screenshot handoff plus component tests cover add-form visibility, new-card return, `Mark done`, timer pause/resume/reset, and restored state.    | No remaining scoped gap.                                          |
| Visual design quality                         | `5/5`          | Owner-approved screenshots cover mobile add form, desktop add form, create success, completed state, and one-exit add-form cleanup.               | No rendering files changed after approved capture.                |
| Business logic correctness and data integrity | `5/5`          | Timer restore is local-only, never auto-writes server completion; due sorting is deterministic and covered by unit tests.                         | No schema migration required.                                     |
| Accessibility (a11y)                          | `5/5`          | Focus return, inline `role=status`, button labels, keyboard-reachable controls, and status copy are covered by Testing Library and visual review. | No remaining scoped gap.                                          |
| Performance (CWV + payloads)                  | `5/5`          | No dependency added; full `verify:pre-pr` build and perf budgets passed for current HEAD.                                                         | Perf target tightening deferred to separate governance follow-up. |
| Data placement and sync boundaries            | `5/5`          | Brief and implementation define server-canonical habits/check-ins and local-only timer metadata, add-form state, focus, and highlight state.      | No remaining scoped gap.                                          |
| Caching and invalidation strategy             | `5/5`          | Successful create/save/mark-done paths refresh state; tests cover cleanup and new-card success placement.                                         | No remaining scoped gap.                                          |
| Reliability and failure handling              | `5/5`          | Tests cover paused/running restore, cleanup after timed save, stale/invalid storage handling, and safe fallback behavior.                         | No remaining scoped gap.                                          |
| Security and authz                            | `5/5`          | No protected route contract changed; local timer state cannot bypass existing authenticated server mutations.                                     | Existing fail-closed route tests remained green.                  |
| Privacy and compliance                        | `5/5`          | Timer persistence stores metadata only, not habit titles, notes, or private labels; no new analytics payloads were added.                         | No remaining scoped gap.                                          |
| Content governance                            | `5/5`          | Route/label/support sweep updated code, tests, user-flow docs, support runbook, and brief around `Mark done`, `Done`, and `Habit added`.          | No remaining scoped gap.                                          |
| Analytics and KPI observability               | `5/5`          | No analytics contract changed; existing event paths remain free of raw habit content.                                                             | No new KPI instrumentation required for this UI hardening slice.  |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` now covers timer restore, stale local state, hidden form, misplaced success, and due-order confusion.     | No remaining scoped gap.                                          |
| i18n operational readiness                    | `5/5`          | Changed labels are short, explicit, and tested: `Build`, `Mark done`, `Done`, `Habit added`, `Resume`, `Pause`, `Reset`, and due group labels.    | Full localization remains outside current platform scope.         |
| Stack-fit and dependency discipline           | `5/5`          | Reused `HabitPerfectDayHub`, shared habit domain helpers, current mutation routes, Tailwind/UI patterns, Vitest, and Playwright; no dependency.   | No remaining scoped gap.                                          |
| Testing and QA automation                     | `5/5`          | Targeted unit tests plus full `verify:pre-pr`, CI `verify`, and `verify:pre-merge` passed on the merged implementation.                           | No remaining scoped gap.                                          |
| Scalability and cost efficiency               | `5/5`          | Timer persistence and due sorting are bounded by current habit snapshot and one active interval; no polling or event stream added.                | No remaining scoped gap.                                          |
| DevOps and rollback readiness                 | `5/5`          | PR #720 merged as `fed28c1`; rollback is a single revert; post-merge preflight surfaced this docs-only closeout.                                  | Closeout PR is docs-only and non-runtime.                         |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface is `components/my-library/habits/HabitPerfectDayHub.tsx`.
  - Keep the route boundary at `/my-library/habits`; use client state for add-mode, focus, timer restore, and inline highlight.
  - Keep server loading and authenticated mutations on existing route/API boundaries.
  - Sweep Home and My Library routine summaries only if changed action labels or done semantics surface there.
- TypeScript/domain contracts:
  - Reuse existing `HabitDefinitionView`, `HabitSnapshot`, `HabitMode`, `HabitType`, cadence, priority, and check-in helpers.
  - Add deterministic helpers for due-order sorting or timer persistence only where they reduce repeated component logic.
  - Timer restore must be typed, parse-safe, and discard invalid records.
- Supabase/data layer:
  - Expected path is no migration.
  - If implementation audit proves a data contract gap, use additive migration, fail-closed RLS/authz, generated DB type updates, and negative-path tests.
- External services/tools:
  - No push notifications, Apple Health, wearable, background sync, or external analytics vendor.
  - Existing first-party analytics only, with sensitive labels redacted.
- UI system:
  - Use current Tailwind/button/chip visual language.
  - Blue remains active action color; green remains completion/status color; outline remains secondary/recovery action.
  - Screenshot handoff is before/after for Habits mobile and desktop.
- Testing:
  - Component tests for timer restore/cleanup, add-flow focus/scroll, inline `Habit added`, `Mark done` labels, done status colors/semantics, and due-order sorting.
  - Playwright mobile flow for add habit, create return-to-new-card, and timer restart/resume behavior where practical.
  - Route/API tests only if protected mutation contracts change.

## Data Placement And Sync Contract

- Server-canonical data:
  - Habit definitions, habit check-ins, cadence fields, start dates, status, sort order, and completed/saved facts.
- Local-only data:
  - Add-form visibility/focus target.
  - New habit highlight id and short-lived `Habit added` presentation state.
  - Timer state per `userId`, `habitId`, and local `YYYY-MM-DD`: elapsed seconds, running/paused flag, started timestamp when running, target seconds, and storage version.
  - Temporary pending/error UI.
- Sync policy:
  - Create, save, mark-done, and undo become truth only after successful authenticated mutation and snapshot refresh.
  - Restored timer state may prefill local elapsed time but must not write check-ins or completion automatically.
  - Saving a timed habit uses the current validated local elapsed seconds through the existing save path.
  - Marking a habit done clears matching local timer state after server success.
  - If server snapshot no longer contains the habit, or the local date no longer matches today, discard the local timer state.
- Conflict policy:
  - If the habit is completed elsewhere, refresh and remove the stale local timer rather than double-writing.
  - If localStorage is unavailable or corrupted, show normal non-restored timer UI and keep mutations usable.
  - If create succeeds but scroll/focus fails, keep the new habit in the list with inline success when possible and no detached bottom message.
- Retention and sensitivity:
  - Do not store habit titles, notes, descriptions, or raw private labels in timer persistence.
  - Timer state is cleared on completion, day rollover, habit disappearance, or explicit reset.
- Cache/invalidation:
  - Authenticated route behavior remains dynamic/no-store as today.
  - Successful mutations refresh the affected habit snapshot and route state.

## Identity And Rename Contract

- Canonical stable ID:
  - Habit identity remains `habit_definitions.id`.
  - Habit check-in identity remains `habit_check_ins.id`.
- Human-readable identifiers:
  - Habit titles, type chips, group headings, button labels, and status labels are display-only and renameable.
- Mutability rules:
  - Add-flow placement, inline success, `Mark done`, and due-order sorting change presentation and execution flow only.
  - Local timer records are tied to stable habit id, user id, and local date, not title or position.
- Rename vs repurpose policy:
  - Renaming a habit preserves the same local timer only when the stable habit id and date match.
  - Materially repurposing a habit still requires a new habit identity rather than rewriting history.
- Compatibility contract:
  - Existing count, duration/timed, binary/done-only, time-of-day, and avoidance habits remain readable.
  - Existing localStorage keys outside this slice remain untouched unless they match this slice's timer namespace and are invalid.
- Observability and repair:
  - Support diagnostics should distinguish storage unavailable, invalid local timer record, stale habit id, day rollover cleanup, failed create, failed mark-done, and due-order confusion without exposing private labels.

## Scope

- Habits timer persistence:
  - Persist running and paused timed habit state locally per user, habit, and local date.
  - Restore running timers using wall-clock elapsed time; restore paused timers without advancing.
  - Add reset/cleanup behavior for completion, undo where relevant, day rollover, missing habit, and invalid storage.
- Habit creation flow:
  - Mobile: `Add habit` opens a focused add view in viewport with `Create habit` and `Cancel`.
  - Desktop/tablet: add form opens visibly near the top of the Habits surface with focus on the first field.
  - Prevent bottom navigation from covering form actions.
- Create success placement:
  - After successful create, close the form, scroll/focus to the new habit card, and render `Habit added` inside that card.
  - Remove detached global success copy below the list.
- Done/action semantics:
  - Rename pre-completion binary/done-only action from `Done` to `Mark done`.
  - Use green only for completed/status state, such as `Done`, `Done today`, and `Done this week`.
  - Use outline/secondary style for `Undo` and `Details`.
  - Replace the `Do` chip with a clearer habit type label such as `Build`, unless implementation audit finds a better existing contract.
- Due-order sorting:
  - Sort unfinished habits by nearest deadline: daily/today first, timed due today in the appropriate due group, weekly next, then monthly or longer intervals.
  - Keep completed habits out of active due-order competition and in completion-specific groups.
  - Keep quit/status habits lower-interruption unless they need action.
- Documentation/support:
  - Update user-flow/support docs if labels, recovery behavior, or Help/Guide assertions change.
  - Record route/label/support sweep in the implementation brief checkpoint.

## Out Of Scope

- Server-persisted timer sessions.
- Native background timers, notifications, sound, haptics, widgets, service-worker timer loops, or offline completion sync.
- Auto-completing a habit on app open because a restored timer reached a target.
- Micro Sessions bubble timer changes.
- Habit schema redesign beyond a small additive change if implementation audit proves one unavoidable.
- New reminder system, calendar integration, Apple Health/Garmin/Strava/Fitbit integration, or analytics dashboard.
- Admin, commerce, public SEO, or entitlement changes.
- Merge or release without explicit owner approval.

## Acceptance Criteria

1. Starting a timed habit, closing/restarting the installed PWA or browser, and returning on the same local date restores the timer state.
2. A running timer advances by wall-clock time while the app was closed, without writing server completion automatically.
3. A paused timer restores paused with the same elapsed time.
4. Timer state is cleared when the timed habit is successfully saved/completed.
5. Timer state is discarded on day rollover, missing habit id, user mismatch, invalid target, or corrupted storage.
6. Storage unavailable or localStorage parse failure does not block normal Habits use.
7. On mobile, `Add habit` opens a focused add view in the viewport without requiring scroll hunting.
8. On desktop/tablet, `Add habit` opens an immediately visible form near the top of the Habits surface.
9. `Cancel` returns from create mode to the Habits list without losing existing habit state.
10. Successful create closes the form and scrolls/focuses to the new habit card.
11. `Habit added` appears inside the new habit card, not as a detached message below the list.
12. The new-card success state moves to the latest created habit if multiple habits are created.
13. The new-card success state clears after a relevant user action or navigation.
14. No pre-completion primary habit action is labelled only `Done`; binary/done-only pre-completion action is `Mark done`.
15. Completed habits show green status such as `Done`, `Done today`, or `Done this week`.
16. `Undo` and `Details` remain secondary actions.
17. Habit type chips are semantically clearer than `Do`, with `Build`, `Timed`, and `Quit` or an implementation-approved equivalent.
18. Unfinished daily/today habits sort above unfinished weekly habits.
19. Weekly habits sort above monthly or longer-interval habits.
20. Completed habits do not compete with unfinished due-order groups.
21. Quit/status habits remain low-interruption unless they require a direct action.
22. Keyboard focus, screen-reader labels/live regions, and reduced-motion behavior remain accessible for changed interactions.
23. No new dependency is added.
24. Screenshot handoff covers mobile and desktop Habits create and execution states before `npm run verify:pre-pr`.

## Validation

Planning/brief validation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Implementation validation before PR update:

- Targeted unit/component/domain tests:
  - `tests/unit/habit-perfect-day-hub.test.tsx`
  - `tests/unit/habits.test.ts`
  - `tests/unit/my-library-today.test.ts` if Home/routine labels or counts change
  - `tests/unit/today-tabs-panel.test.tsx` if Today tabs labels or counts change
  - route tests if protected mutation contracts change
- Targeted Playwright:
  - `tests/e2e/my-library-habits.spec.ts`
  - relevant Home/routines entrypoint test if summary actions change
- Route/label/support sweep before broad gates:
  - `Mark done`
  - `Done`
  - `Done today`
  - `Done this week`
  - `Habit added`
  - `Add habit`
  - `Create habit`
  - `Do`
  - `Build`
  - `Pause`
  - `Resume`
  - `Reset`
  - `Weekly - any day`
  - `Action needed`
  - `Timed today`
  - `Quit status`
  - `/my-library/habits`
- Screenshot handoff:
  - before/after mobile Habits create flow,
  - before/after mobile new-card success placement,
  - before/after mobile `Mark done` and completed status state,
  - before/after desktop Habits create placement,
  - timer restore state where practical.
- Required gates:
  - `npm run verify:pre-pr` after owner approves screenshot handoff,
  - `npm run verify:pre-merge` before merge recommendation,
  - required CI checks green.

## Screenshot Handoff Requirement

This brief changes visible mobile and desktop UI. The implementation must stop after screenshot handoff and owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

The handoff must include:

- clickable `Screenshot artifacts` folder link,
- `Captured: YYYY-MM-DD HH:MM` local time,
- before/after screenshots with explicit filenames,
- short explanation per screenshot,
- known visual caveats or judgment calls.

## Checkpoint Log

- `2026-05-15 | planned | created after owner reported five Habits mobile execution findings: timer/pause lost after PWA restart, add form hidden out of viewport, create success detached from new habit, pre-completion `Done` label ambiguity, and due-order sorting by shortest deadline | next: owner reviews brief or explicitly asks to execute/build/implement this brief end-to-end`
- `2026-05-15 | in-progress | owner said "execute brief"; started branch `feature/habits-mobile-execution-hardening`from synced`main@f145992`, moved brief to in-progress, and kept the required UI screenshot stop before `npm run verify:pre-pr` | next: audit HabitPerfectDayHub and habit domain helpers before scoped implementation`
- `2026-05-15 | implementation checkpoint | implemented local user/date-scoped timer restore, focused add-habit surface, create-return-to-new-card with inline `Habit added`, `Build`mode chip,`Mark done`pre-completion action, weekly/monthly due grouping, and nearest-deadline sorting; validation passed:`npm exec vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx`, `npm run lint`, `npm run typecheck`, `git diff --check`, and `npm run lint:briefs:all`; after mobile scroll target refinement and owner-flagged duplicate close/cancel cleanup, targeted Vitest passed again | next: screenshot handoff before `npm run verify:pre-pr``
- `2026-05-15 | route-label-support sweep | identifiers searched across `app/`, `components/`, `lib/`, `tests/`, `docs/`, docs runbooks, active/planned/done task briefs, and route/API references: `/my-library/habits`, `Mark done`, `Done`, `Done today`, `Done this week`, `Habit added`, `Add habit`, `Create habit`, `Do`, `Build`, `Pause`, `Resume`, `Reset`, `Weekly - any day`, `This week`, `This month`, `Action needed`, `Timed today`, and `Quit status`; fallout handled in `HabitPerfectDayHub`, habit shared helpers, the habits page route, unit tests, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and this brief | next: owner screenshot approval stop`
- `2026-05-15 | screenshot handoff prepared | before/after artifacts captured in `output/habits-mobile-execution-hardening-2026-05-15-220958`; after screenshots were regenerated after the duplicate close/cancel cleanup so visible UI now has one add-form exit action (`Cancel`); timer restore is covered by component tests instead of visual capture because same-day local timer persistence is localStorage state and should not force a server write during screenshot setup | next: wait for owner visual approval or correction request before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge``
- `2026-05-15 | screenshot approved | owner approved the refreshed screenshot handoff in `output/habits-mobile-execution-hardening-2026-05-15-220958`, including the one-exit add-form cleanup | next: run `npm run verify:pre-pr`, commit, push, open PR, monitor CI, then run `npm run verify:pre-merge` when PR checks are green`
- `2026-05-15 | pre-pr gate passed | `npm run verify:pre-pr` passed full lane: branch-current, quality gates, lint, typecheck, 191 unit files / 1085 tests, production build, perf budgets, and Playwright E2E with 84 passed / 408 skipped in open public mode; perf trend recommended tightening one stretch target after 5 green runs, decision: hold tightening out of this UI slice and recommend a separate performance-governance follow-up | next: commit, push, open PR, and monitor CI`
- `2026-05-16 | done | PR #720 merged to main as `fed28c1`after owner approval, green required CI, green local`verify:pre-pr`, and green local `verify:pre-merge`; post-merge preflight surfaced this repo-managed docs-only closeout, moved brief from in-progress to done, and recorded achieved scores/evidence | next: docs-only closeout PR`
