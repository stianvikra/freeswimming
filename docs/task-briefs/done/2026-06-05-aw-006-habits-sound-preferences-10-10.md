# Task Brief: AW-006 Habits Sound Preferences And Date Navigation Scroll Stability (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-habits-sound-preferences-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-05`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `active implementation after owner said execute Child J`
- `planned_resolved_findings`: `H-005`, `H-006`, `H-039`, and the optional-sound part of `H-010`
- `deferred_findings`: `H-028` midnight auto-complete, Habits Advanced Motivation/history-dashboard, reminders, micro-session audio, user-selected/uploaded sounds, server-stored preferences, native notifications, and broad analytics remain out of scope.
- `return_checkpoint`: update the Habits parent before this child is closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@f3b51e51`
- `audit_status`: `ready`
- `decision`: Implement Child J now after the owner explicitly said `execute Child J`, with the visual screenshot approval stop before `npm run verify:pre-pr`.
- `reason`: Fresh re-audit after PR `#993` and repo-managed closeout PR `#994` found `main` clean/synced, no active AW-006 slice selected, and Habits parent findings `H-005`/`H-006` still deferred. Owner also reported that changing a day scrolls away from the weekly overview; code audit found Habits day links still target `#today-habits`, which can anchor the viewport down to the list. `HabitPerfectDayHub` already owns local timer state, same-day completion actions, and date/week navigation, but no sound or audio preference contract exists. Productive's official habit creation help includes a notification sound choice for reminders, while MDN documents that web audio/media playback may be blocked unless started from a user gesture, so the sound part should be local, opt-in, and fail-soft.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, Habits local timer storage, check-in/completion semantics, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, browser audio/autoplay guidance, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Add a small, opt-in Habits sound preference and keep date/week navigation anchored around the weekly overview so completion feedback improves without making the Habits surface jump away from the user's calendar context.

## Pre-Implementation Owner Explanation

Vi planlegger en liten valgfri lyd i Habits og en liten navigasjonsfix: brukeren kan skru lyd paa lokalt, teste lyden, og dagbytte skal bli ved ukesoversikten i stedet for aa hoppe ned til listen.

Hvorfor det betyr noe: lyd kan gi tydelig mestringsfeedback, spesielt hvis timeren gaar mens brukeren ser bort fra skjermen. Dagbytte uten scroll-hopp er viktig fordi ukesoversikten er selve kontrollen brukeren jobber i.

Utenfor scope er reminders, varsler, serverlagrede preferences, egne opplastede lyder, micro-session audio, midnight auto-complete, habit score, historikkdashboard, analytics-dashboard, databaseendringer, bred Habits-redesign og ny kalender-IA.

Fremoverkompatibilitet: nye lydhendelser skal ikke begynne aa spille automatisk. De maa mappes eksplisitt til en opt-in trigger, ha testdekning, og feile stille hvis nettleseren blokkerer lyd.

## Re-Audit Summary

- `HabitPerfectDayHub` is a client component with existing same-day local timer state in `localStorage` under `freeswimming:habits:v3:timers`.
- Completion paths already exist in `saveCheckIn`, `saveTimedSources`, `finishTimer`, `saveManualTime`, `logLapse`, `markRestDay`, and `resetCheckIn`.
- Date/week navigation currently builds day links with `#today-habits`; owner screenshot shows that changing day can scroll away from the weekly overview toward the Habits list.
- No current `audio`, `sound`, `AudioContext`, or Habits preference helper exists in runtime Habits code.
- Sound should be a local UX preference, not server-canonical data, because it does not affect habit truth, history, reporting, or support repair.
- Browser audio can be blocked until a user gesture, so the UI needs an explicit opt-in/test action and playback failures must not block habit completion.
- Productive's official help shows notification sound as a habit setting for reminders; this brief intentionally narrows FreeSwimming's first pass to in-app completion/timer feedback, not reminder notification sound.

## Benchmark Refresh

- Productive Help, `https://support.productiveapp.io/hc/en-us/articles/26920632424081-How-to-create-a-habit`: supports choosing a notification sound while creating a habit reminder.
- Productive Help, `https://support.productiveapp.io/hc/en-us/articles/26920738331665-Timer-and-its-functions`: confirms timer-focused habit flows are a normal habit-app surface.
- MDN Web Audio best practices, `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices`: web audio should be created or resumed from a user gesture.
- MDN `HTMLMediaElement.play()`, `https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play`: media playback can reject when autoplay/script playback is not allowed.

## Selected Scope

- Add a Habits-level local sound preference:
  - default `off`;
  - persisted only in browser `localStorage`;
  - includes an explicit `Test sound` action so the user can hear and unlock playback by gesture;
  - safely handles unavailable `window`, unavailable `localStorage`, reduced browser permissions, and rejected playback.
- Add one short, non-verbal completion sound for mapped events:
  - successful habit completion state transition caused by a user action;
  - same-day timed habit target reached while a local timer is running.
- Ensure sound plays at most once per habit/date/target crossing until the relevant local state resets.
- Do not play sound for slip, rest day, reset, archive, undo, manual-time save that does not complete a target, failed mutations, page load, hydration, route navigation, or historical date corrections unless the action truly completes the selected day.
- Keep visible copy compact and non-invasive; no large settings panel or global account preference surface.
- Stabilize Habits date/week navigation:
  - changing day from the weekly overview must keep the weekly overview in view or return focus/scroll to the relevant calendar context;
  - URL/date state still updates correctly for selected day, pending state, failed-date fallback, previous/next week, Today, swipe, and browser back/forward;
  - do not force-scroll to `#today-habits` from calendar/day controls on desktop or mobile unless a separate explicit "jump to habits" action is added later.
- Update `docs/user-flow-map.md` and `docs/runbooks/auth-account-support.md` for the local preference, browser-blocked playback, and support diagnosis.
- Update parent, AW-006 queue, and design inventory lifecycle references.
- Add focused component tests for default-off behavior, opt-in persistence, test-sound behavior, completion trigger, timed target trigger, no-sound negative triggers, playback rejection, and `localStorage` failure.
- Capture screenshot handoff before `npm run verify:pre-pr` because this changes visible Habits UI.

## Out Of Scope

- Reminder notifications, browser Notification API, push notifications, scheduled reminders, or native app notification sounds.
- Server-stored preferences, Supabase migrations, generated DB types, or account-level settings.
- User-selected/uploaded sound files, sound library management, volume sliders, vibration/haptics, or device-level audio routing.
- Micro Sessions audio, training-balloon audio, guide/course video audio, or any non-Habits sound surface.
- Midnight auto-complete, background check-in creation, habit score, best streak dashboard, notes/history dashboard, exports, or broad analytics.
- Broad calendar redesign, new calendar route contracts, global calendar storage, or changing selected-day/history edit rules beyond scroll/focus stability.
- Changing Habits truth, check-in API payloads, event taxonomy, timer/manual source totals, rest/slip semantics, calendar comparison, or route auth boundaries.
- Merging without explicit owner approval.

## Data Placement And Sync Contract

- Server-canonical data:
  - No new server-canonical data in this slice.
  - `habit_definitions`, `habit_check_ins`, timer/manual persisted source fields, and day summaries remain unchanged.
- Local data:
  - `soundEnabled` preference stored in `localStorage` under a versioned Habits sound key.
  - transient audio-unlocked/playback state in component memory.
  - per habit/date target-reached markers may be local-only to avoid repeated target sounds.
- Derived view-model:
  - trigger eligibility derives from current/previous Habits snapshot state, selected date, local timer progress, target seconds, and opt-in preference.
  - selected-day scroll/focus derives from the initiating navigation context, not from a hardcoded habit-list anchor.
- Sync policy:
  - local preference never syncs to Supabase.
  - local sound failure must not roll back or delay a successful habit mutation.
  - clearing browser storage resets sound preference to off.
  - playback rejection is fail-soft and can expose concise local guidance near the preference control, not a blocking route error.
- Retention and sensitivity:
  - do not persist habit names, notes, raw health-adjacent values, or exact completion history in the sound preference key.
  - local target-reached markers, if needed, should use habit ID/date only and be bounded/cleared with normal local timer cleanup.
- Cache/invalidation:
  - no route/data cache behavior changes.
  - Habits remains dynamic/no-store through existing server/API contracts.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID remains the stable local trigger key for per-habit/date sound suppression.
- Human-readable identifiers:
  - habit title is editable and must not key sound preference or playback markers.
  - labels such as `Sound`, `Test sound`, and completion notices are workflow labels, not identity.
- Mutability:
  - local sound preference is intentionally user-toggleable and resettable by clearing browser storage.
  - habit rename keeps local trigger behavior attached to the same habit ID.
- Rename vs repurpose:
  - repurposing a habit keeps the same habit ID and therefore any same-day local sound marker; this is acceptable because markers are day-bound and non-canonical.
- Compatibility:
  - old browsers or blocked storage/audio fall back to sound off/no playback without affecting habit data.
- Observability and repair:
  - support diagnosis should ask whether sound is enabled, whether `Test sound` works, browser/device, mute mode, and whether local storage/audio is blocked. Do not ask for private habit names.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Habits workflow actions, completion statuses, timer source events, local preference keys, browser audio APIs, route labels, Help/Guide labels, and analytics payloads.
- Source of truth:
  - playable events derive from explicit local mapping, not from every success notice string.
  - habit completion truth remains the returned Habits snapshot/API state.
- Additive behavior:
  - new Habits rows with existing mapped completion behavior should inherit the local sound preference automatically.
  - new dates should inherit the default-off preference but not stale per-date target-reached markers.
- Explicit mapping requirements:
  - new sounds, trigger events, haptics, reminders, native notifications, server preferences, per-habit preferences, analytics events, or multi-device sync require explicit mapping, tests, support docs, and owner decision before release.
- Unknown or deprecated values:
  - unknown statuses/actions do not play sound.
  - blocked audio/localStorage fails silently or with non-blocking preference guidance.
- Test/evidence:
  - component tests must include an unmapped action/status negative path and a playback rejection path.

## Help / Guide Impact

Required because this changes a member-facing preference and support diagnosis:

- update `docs/user-flow-map.md` with sound preference default-off behavior, trigger rules, and browser-block fallback;
- update `docs/runbooks/auth-account-support.md` with local sound troubleshooting;
- no admin Help Center update is required because this changes no admin workflow or operator action.

## Route / Label / Support Surface Sweep

Required search terms before broad gates:

- `/my-library/habits`
- `Sound`
- `Test sound`
- `soundEnabled`
- `AudioContext`
- `HTMLMediaElement`
- `play()`
- `localStorage`
- `Mark done`
- `Finish`
- `#today-habits`
- `weekly overview`
- `router.push`
- `hash`
- `scrollIntoView`
- `Timer time saved`
- `Manual time saved`
- `Rest day`
- `Slip logged`
- `habit_timer_saved`
- `habit_check_in_logged`

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `lib/habits/shared.ts`
- `app/api/my-library/habits/check-ins/route.ts` for unchanged analytics/API boundary review
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `tests/unit/habits.test.ts` if helper behavior moves to domain code
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
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Sound improves Habits completion/timer feedback and date navigation preserves weekly overview context without creating a new settings destination or changing the route job.         | brief scope + screenshot handoff              | `5/5`                   |
| UX flow clarity                               | `target`     | Sound is opt-in/testable/default-off, and day/week navigation does not jump away from the calendar control the user just used.                                                       | component tests + screenshot handoff          | `5/5`                   |
| Visual design quality                         | `target`     | Preference control fits existing Habits UI, and date switching keeps weekly overview/card hierarchy stable on mobile/desktop.                                                        | responsive screenshots + text-fit review      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Sound triggers only on mapped successful events, and date navigation preserves selected/pending/failure semantics while changing only scroll/focus behavior.                         | component tests + trigger/navigation review   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                                           | explicit admin-editor scope rationale         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Preference controls have accessible labels and date navigation preserves keyboard/focus semantics without audio-only or scroll-only required information.                            | component tests + screenshot/manual QA        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, no audio asset larger than a tiny generated tone or bundled minimal asset, and no polling/write loop.                                                | dependency diff + build/perf gate             | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Brief and implementation keep sound preference local-only and separate from server-canonical habit truth.                                                                            | data contract + component tests               | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route/API cache behavior stays unchanged; preference hydration is client-local.                                                                                     | route diff review                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Blocked audio/localStorage failures fail softly, and repeated date clicks/back-forward/week navigation do not leave the viewport in a misleading list position.                      | negative-path component tests                 | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no API/authz path changes; protected Habits mutations remain owner-scoped and fail-closed.                                                                          | API diff review + existing tests              | `4/5`                   |
| Privacy and compliance                        | `target`     | No habit names, notes, health-adjacent values, or raw completion details are added to logs, analytics, or persistent sound preference storage.                                       | privacy/analytics diff review                 | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, design inventory, user-flow map, support runbook, and child brief accurately record the local sound contract.                                                         | docs diff + `npm run lint:briefs`             | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, support queue, admin notes behavior, or operator actions.                                                                         | explicit admin-workflow scope rationale       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.                             | private-route SEO rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no crawl-safe public entity model, structured data, AI-facing page copy, or public docs surface.                                                      | AI discoverability scope rationale            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: preserve existing Habits analytics taxonomy; if local sound interactions are instrumented later, payloads must avoid raw habit data.                                | analytics diff review                         | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                          | commerce scope rationale                      | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs explain local sound preference diagnosis, browser audio blocking, mute/device checks, and safe fallback.                                                                | support doc diff                              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this child changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation. | explicit finance scope rationale              | `N/A`                   |
| i18n operational readiness                    | `target`     | New labels are short, avoid fixed-width assumptions, and scroll/focus behavior does not depend on English-only anchor labels.                                                        | responsive screenshots + component assertions | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, existing localStorage patterns, browser-native audio APIs, lucide/icon tokens if needed, and current tests; add no dependency.                           | code/dependency diff review                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused tests cover sound preference/trigger failures plus date-change scroll/anchor stability before screenshot and broad gates.                                                    | Vitest + screenshots + broad gates            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no server writes, no polling, no remote audio fetch, and no unbounded local storage growth.                                                                         | implementation diff review                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is rollback-safe because it is local-only, dependency-free, and has no migration; disabling/removing the preference returns users to silent behavior.                         | rollback notes + verification gates           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `/my-library/habits` and `HabitPerfectDayHub`.
  - Keep the feature client-only inside the existing Habits component or a small Habits-local helper.
  - Reuse the existing My Library calendar href/date contract and avoid introducing a new route, server action, or API endpoint.
  - Preserve existing `force-dynamic`/no-store route behavior.
- TypeScript/domain:
  - Prefer typed trigger helpers over string-matching success notices.
  - Define a narrow preference type and storage parser with fail-safe defaults.
  - Trigger invariants: default off; opt-in only; mapped successes only; once per target crossing; no destructive/failure actions.
  - Date navigation invariant: selected/pending/failure state changes must not rely on `#today-habits` forcing the viewport away from the weekly overview.
- Supabase/data:
  - No migration, no generated type update, no RLS change.
  - Habits check-in API contract remains unchanged.
- Browser audio:
  - Use browser-native APIs only.
  - Playback must be initiated/unlocked from a user gesture where practical.
  - Treat rejected playback as non-blocking.
- UI system:
  - Reuse existing Habits token/action/input classes and mobile action layout contract.
  - If an icon is used, prefer lucide.
  - Screenshot handoff type: `after/reference` or `before/after` for the changed Habits preference control, representative completion/timer state, and date-change weekly overview position.
- Testing:
  - Primary: `tests/unit/habit-perfect-day-hub.test.tsx`.
  - Add helper/domain tests only if sound helpers are extracted.
  - Broad validation remains `npm run verify:pre-pr` before PR and `npm run verify:pre-merge` before merge.

## Scope

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- possible small Habits-local helper under `components/my-library/habits/` or `lib/habits/` if it reduces component complexity
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory lifecycle docs.

## Out Of Scope

- `supabase/`, `types/database.ts`, auth, Stripe, checkout, public SEO, admin workflows, guide/course/dryland/micro-session audio, global settings pages, notification APIs, and new dependencies.

## Acceptance Criteria

1. Habits sound preference is default off and local-only.
2. The user can enable/disable sound and run `Test sound` without completing a habit.
3. Completion sound only fires after successful mapped completion behavior.
4. Timed target sound only fires once when a same-day running timer crosses the target.
5. No sound fires on slip, rest day, reset, archive, failed mutations, route load, or unmapped actions.
6. Browser audio/localStorage failures do not block check-ins or timers.
7. Clicking/swiping previous dates, previous/next week, Today, and browser back/forward keeps the weekly overview in context instead of scrolling down to the Habits list.
8. New visible controls have accessible names and keyboard behavior.
9. Mobile/desktop layout remains stable and screenshot-reviewed.
10. User-flow/support docs describe the local preference, troubleshooting, and date navigation behavior.
11. Parent, AW-006 queue, and design inventory remain accurate before closeout.

## Validation

Required before screenshot handoff:

- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted Vitest for Habits component/helper tests

Required because this changes visible UI:

- Screenshot artifact handoff before `npm run verify:pre-pr`.
- Screenshot artifacts: `output/habits-sound-scroll-2026-06-05-170105/` with `after-habits-desktop-sound-off-overview.png`, `after-habits-desktop-sound-on-test.png`, `after-habits-desktop-day-change-week-overview.png`, `after-habits-mobile-active-week-overview.png`, and `screenshot-metrics.json`.
- Screenshot metrics confirmed desktop day change kept `scrollY` at `0` and URL changed to `/my-library/habits?date=2026-06-04` without `#today-habits`.
- Owner visual approval: owner accepted the handoff, requested both mobile sound buttons grouped below the `Completion sound` label, explicitly said no new screenshots were needed after that layout correction, and then approved proceeding to merge after good tests.

Required before PR/merge if implemented:

- `npm run verify:pre-pr`
- PR CI green
- `npm run verify:pre-merge`

## Route / Label / Support Sweep Evidence

- Identifiers searched: `#today-habits`, `today-habits`, `Completion sound`, `Sound on`, `Sound off`, `Test sound`, `habits sound`, `Micro Sessions`, `micro-session`, and `micro session`.
- Surfaces checked: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/user-flow-map.md`, planned/in-progress/done task briefs, and Help/Guide/support assertions in the support runbook.
- Fallout handled: Habits internal date/week navigation no longer adds `#today-habits`; global entrypoints that intentionally jump to Today's Habits still keep the anchor; `docs/user-flow-map.md` and `docs/runbooks/auth-account-support.md` document local-only sound, blocked-audio troubleshooting, no Micro Sessions bubble sound, and weekly overview scroll stability.

## Manual QA Environments

- Local Habits route at `http://127.0.0.1:3000/my-library/habits` with site lock disabled for screenshot/QA where needed.
- Mobile and desktop screenshots for:
  - sound preference off/default;
  - sound preference on/testable;
  - representative completion or timed-target state.
  - day-change state with weekly overview still visible.
- Manual browser check should include at least one Chromium-family browser and Safari/WebKit because audio policies differ by browser.

## Constraints

- Keep audio short, non-verbal, and non-looping.
- Do not autoplay on page load.
- Do not make audio the only feedback.
- Do not introduce a dependency or remote audio fetch.
- Do not store sensitive habit details in local sound preference state.

## Debugging And Handoff Contract

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for screenshot/layout/audio-browser debugging.
- Use `docs/runbooks/route-label-support-surface-impact-sweep.md` before broad gates because this adds user-facing labels and support behavior.
- If audio fails in one browser, verify autoplay/user-gesture, mute/device settings, `AudioContext`/`play()` rejection, and localStorage preference state before patching by intuition.

## 10/10 Quality Bar

- The preference and date navigation behavior are understandable without a help paragraph.
- Completion remains visually confirmed even when sound is off or blocked.
- Audio never surprises the user: off by default, explicit opt-in, testable.
- Trigger logic is deterministic and covered by negative tests.
- Date changes keep the weekly overview in context.
- UI fits mobile and desktop without crowding existing Habits actions.

## Help/Guide And Operator Training Contract

- Update `docs/user-flow-map.md` for user-facing behavior.
- Update `docs/runbooks/auth-account-support.md` for support diagnosis.
- Admin Help/Guide is `N/A` because no admin workflow or operator UI changes.

## Security, Privacy, and Compliance

- No secrets.
- No server writes.
- No raw habit names, notes, health-adjacent values, or completion quantities in logs/analytics/local preference storage.
- Existing protected Habits APIs remain unchanged and owner-scoped.

## Observability and KPI Contract

- No new analytics event is required.
- If implementation touches existing Habits analytics review, preserve safe payload rules and do not emit sound preference or raw habit data without a separate analytics decision.

## Session Continuity and Recovery

- Canonical source of truth: this brief path plus implementation branch `aw-006-habits-sound-scroll-stability`.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Scoped branch: `aw-006-habits-sound-scroll-stability` from `main@f3b51e51`.
- Commit/push after implementation, focused validation, screenshot approval, and broad gates according to repo automation-first rules.
- Do not merge without explicit owner approval.

## Automation Mode

- Implementation mode now: automation-first after owner explicitly said `execute Child J`, with the visual screenshot approval stop before `verify:pre-pr`.

## Branch Hygiene Defaults

- Implementation branch should be deleted locally/remotely after merge and post-merge sync.
- No branch cleanup is part of this planning-only brief creation.

## PR Browser Rule

- PR/review/merge links should open in Safari through the repo-preferred script when available.

## Manual QA URL Rule

- QA URLs should be opened in Safari for owner review unless owner asks otherwise.

## Implementation Checkpoint Log

- `2026-06-05 | planned | created planned Child J after fresh re-audit on clean main@f3b51e51 and owner confirmation; no implementation has started | next: wait for explicit owner execute/build/implement before moving to in-progress`
- `2026-06-05 | planned | owner added screenshot finding that changing days scrolls down away from the weekly overview; code audit found day links using #today-habits, so Child J now includes date navigation scroll stability alongside sound because it is the same Habits component and screenshot surface | next: wait for explicit owner execute/build/implement before moving to in-progress`
- `2026-06-05 | in-progress | owner said execute Child J; moved brief to in-progress on branch aw-006-habits-sound-scroll-stability with scope limited to local Habits sound preference and date navigation scroll stability | next: implement targeted runtime/docs/tests, run focused validation, capture screenshot handoff, and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-05 | in-progress | implemented local-only Habits completion sound controls, Web Audio fail-soft playback, mapped completion/timed-target triggers, hash-free Habits date/week controls, and user-flow/support docs; npm run typecheck and npx vitest run tests/unit/habit-perfect-day-hub.test.tsx passed | next: run brief lint/diff check, capture screenshot handoff, and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-05 | in-progress | owner requested the two mobile sound buttons be grouped below the Completion sound label and explicitly said no new screenshots were needed; updated the responsive layout and reran npm run typecheck, npx vitest run tests/unit/habit-perfect-day-hub.test.tsx, and git diff --check successfully | next: owner approval, then npm run verify:pre-pr`
- `2026-06-05 | in-progress | owner approved the visual checkpoint and authorized merge after good tests; proceeding through npm run verify:pre-pr, commit, PR, CI, npm run verify:pre-merge, and merge if all required gates are green | next: run npm run verify:pre-pr`
- `2026-06-05 | pre-pr | npm run verify:pre-pr passed full lane after evidence repair; unit suite passed 1383/1383, perf budgets passed, Playwright passed with 106 run and 530 expected environment skips | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`

## Completion Record

- `completed`: `2026-06-05`
- `merged_pr`: `#995`
- `squash_commit`: `6c519e42`
- `result`: Closed Child J by adding a local, opt-in Habits completion sound with an explicit test action, same-day timed-target sound, fail-soft browser-audio/localStorage behavior, and date/week navigation that keeps the weekly overview in context instead of jumping down to the Habits list.
- `validation`: `npm run typecheck` passed; `npx vitest run tests/unit/habit-perfect-day-hub.test.tsx` passed with `58/58`; `npm run verify:pre-pr` passed the full lane from `artifacts/test-runs/20260605-172026` with unit suite `1383/1383`, build, perf budgets, and Playwright `106` passed / `530` expected skips; PR `#995` CI passed; `npm run gate:pre-merge` passed with marker `artifacts/verify-pre-merge/20260605-153537.json`.
- `screenshot_artifacts`: `output/habits-sound-scroll-2026-06-05-170105/`
- `10/10 claim`: yes - all critical target categories reached `5/5` for the scoped local-only Habits sound and scroll-stability slice.

| Category                                      | Achieved Score | Evidence                                                                                                                                                            | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#995`; brief acceptance criteria; parent return status.                                                                                                         | None.        |
| UX flow clarity                               | `5/5`          | Sound is off by default, explicitly testable, and date navigation keeps week context; screenshot metrics confirmed `scrollY` stayed `0`.                            | None.        |
| Visual design quality                         | `5/5`          | Screenshot handoff in `output/habits-sound-scroll-2026-06-05-170105/`; owner approved and waived new screenshots after the mobile sound-button grouping correction. | None.        |
| Business logic correctness and data integrity | `5/5`          | Targeted tests cover success, no-sound negative triggers, failed actions, timed-target once, and browser failure paths.                                             | None.        |
| Accessibility (a11y)                          | `5/5`          | Button controls keep accessible names and keyboard semantics through existing Habits button patterns.                                                               | None.        |
| Data placement and sync boundaries            | `5/5`          | Preference is local-only under `freeswimming:habits:v1:sound`; no server writes or schema changes.                                                                  | None.        |
| Reliability and failure handling              | `5/5`          | Audio and localStorage failures are non-blocking and covered by tests.                                                                                              | None.        |
| Privacy and compliance                        | `5/5`          | No raw habit data, health-adjacent values, analytics payloads, or server-stored sound state added.                                                                  | None.        |
| Content governance                            | `5/5`          | User-flow/support docs, parent, AW-006 queue, and design inventory were updated in PR `#995` and this closeout.                                                     | None.        |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` documents local preference, blocked audio troubleshooting, and Micro Sessions non-scope.                                    | None.        |
| i18n operational readiness                    | `5/5`          | Labels are plain, bounded UI strings; future user-selected sounds/server preferences require explicit mapping.                                                      | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Used native Web Audio and existing Habits component patterns; no dependency, API, migration, or config changes.                                                     | None.        |
| Testing and QA automation                     | `5/5`          | Focused Vitest, typecheck, full `verify:pre-pr`, CI, and `gate:pre-merge` passed.                                                                                   | None.        |
| DevOps and rollback readiness                 | `5/5`          | Normal revert rollback; no migrations, env vars, packages, workflows, or provider changes.                                                                          | None.        |
