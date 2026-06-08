# Task Brief: AW-006 Habits Timer Completion Copy Polish (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-habits-timer-completion-copy-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `must_start_after`: Micro Sessions recurring Habit runtime is merged, any repo-managed closeout is complete, `main` is synced, and post-merge preflight is green.

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: `main@9894de96` after Micro Sessions recurring Habit runtime PR `#1017` and repo-managed closeout PR `#1018`
- `audit_status`: `in-progress-direct-next-child`
- `decision`: Use this as the direct next Habits child after the Micro Sessions recurring Habit runtime workstream.
- `reason`: Owner confirmed the timer/copy findings are valuable and clarified that the shared completion sound must become meditative and positive rather than a short thump.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, habits routes, timer storage, sound helper, scorecard categories, screenshot rules, route/label/support sweep rules, or validation lanes change.

## Goal

Make timed Habits hands-free at target, easier to finish, reversible after accidental completion, and consistent in completion/streak copy.

## Pre-Implementation Owner Explanation

Vi rydder timer-Habits etter Micro/Habit-slicen. Timere skal telle opp til maal, stoppe og lagre rolig naar maalet er naadd, og gi enkel undo hvis noe ble feil.

Hvorfor det betyr noe: brukeren skal kunne slappe av, jobbe eller trene uten aa stirre paa telefonen for aa stoppe akkurat riktig tidspunkt. Samtidig maa meldinger, streaks og knapper vaere konsekvente.

Utenfor scope er reminders, notification APIs, nytt sound-valg, serverlagret sound preference, full history/export/dashboard-redesign, ny timer-event-tabell, hard delete og Micro Sessions rollover/logikk.

Fremoverkompatibilitet: nye timed Habit-varianter skal bruke samme typed timer/view-model-kontrakt; nye habit modes, timerkilder eller completion-statusverdier maa eksplisitt mappes og fail-closed hvis de ikke er kjent.

## Product Decisions

- Do not add a count-up/countdown selector in this pass.
- Timed Habits count up toward the target.
- At target, the same-day running timer plays the shared calm completion sound, pauses local timing, and saves completion.
- The shared `softSuccessChime` is generated locally in `lib/audio/client-sound.ts` and must sound meditative/positive: soft attack, low gain, long release, and at least about 1.2 seconds total duration. It must not be a short percussive thump.
- `Finish` outside `Details` saves elapsed timer time before target.
- Timed progress copy uses one status line in the timer box, for example `2:05 / 8:00 today`; timer controls stay action-only (`Start`, `Pause`, `Resume`, `Finish`) and do not show live time inside buttons.
- On desktop, timed action buttons align visually with the timer box; on mobile they remain stacked below the timer box.
- Everyday `Details` should not show timer/manual source breakdown text.
- `Manual time` stays visible in the manual input box.
- Undo after target auto-save or `Finish` reverts only the latest timed completion source for the selected day and preserves unrelated manual time/history.
- Successful completion/check-in feedback uses `Completion saved.` and disappears after about 3 seconds; errors persist.
- Remove `N days streak.` variants; keep `Streak: N days.`.
- Fix double punctuation such as `Morning Drink Water..`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Data placement and sync boundaries, Reliability and failure handling, Testing and QA automation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                         | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Pass when timed completion is hands-free at target and primary finish is visible without opening Details.                                  | component tests + screenshots                 | `5/5`                   |
| UX flow clarity                               | `target`     | Pass when start, pause/resume, auto-complete, Finish, manual save, and undo have one clear path each.                                      | component tests + screenshots                 | `5/5`                   |
| Visual design quality                         | `target`     | Pass when timer actions fit mobile/desktop and streak/completion copy is consistent without row crowding.                                  | responsive screenshot handoff                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Pass when auto-save, Finish, manual time, and undo preserve selected-date truth and unrelated check-ins.                                   | unit/API/component tests                      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor CRUD, publishing, or operator content editing.                                                    | scope rationale                               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Pass when controls have clear labels, focus states, disabled states, and polite status announcements without relying sound.                | component tests + markup review               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No new dependency; timer interval behavior remains bounded and local.                                                                      | package diff + review                         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Pass when check-ins stay server-canonical and running timer/success state stays local until save/undo.                                     | data contract + tests                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing no-store mutation responses remain and successful saves update the snapshot.                                                      | route/component tests                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Pass when save, undo, audio, localStorage, stale date, and unsupported source failures cannot corrupt history or play sound when disabled. | negative-path tests                           | `5/5`                   |
| Security and authz                            | `target`     | Pass when all timer/undo mutations remain authenticated and owner-scoped.                                                                  | route tests / authz review                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Pass when logs/analytics avoid private Habit titles/notes and no secrets are added.                                                        | code review + analytics assertions if touched | `5/5`                   |
| Content governance                            | `target`     | Pass when brief/docs/PR agree on timer behavior, message copy, streak copy, and deferred items.                                            | docs diff + brief lint                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, action, role-gated CRUD, audit trail, or operator editability surface.                   | scope rationale                               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this affects authenticated My Library surfaces only.                                                                           | SEO scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity, structured data, or public semantic content.                                         | AI scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Existing timer/check-in events remain first-party, title-free, and typed unless implementation changes the boundary.                       | analytics diff or no-new-event rationale      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, billing, invoice, payout, or revenue flow.                             | commerce scope rationale                      | `N/A`                   |
| Incident response and support operations      | `target`     | Pass when support can diagnose save/undo outcomes from redacted habit ID, selected date, source kind, and error class.                     | support docs + tests                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance provider data, billing records, reports, or reconciliation surfaces change.                           | finance scope rationale                       | `N/A`                   |
| i18n operational readiness                    | `target`     | Pass when labels avoid fixed-width English assumptions and punctuation is generated safely.                                                | component tests + screenshots                 | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Pass when existing Habits view-models, routes, timer storage, sound helper, and UI tokens are reused with no dependency or media asset.    | code/package diff                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Pass when tests cover auto-target save, Finish, manual display, undo, timeout, and streak-copy sweep.                                      | targeted tests + verify gates                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Store one selected-date check-in update per save/undo; no high-volume timer event stream.                                                  | data diff + tests                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Pass when rollback preserves existing check-ins and disables only the new UI/runtime behavior if needed.                                   | gates + rollback note                         | `5/5`                   |

## Stack / Data / Identity / Forward Compatibility

Reference surface is `components/my-library/habits/HabitPerfectDayHub.tsx`. Habit definitions, selected-date check-ins, timer seconds, manual minutes, status, and completed timestamp stay server-canonical; same-day running timer state, elapsed seconds before save, transient feedback, and local sound preference stay local-only. The shared completion sound stays code-generated in `lib/audio/client-sound.ts`; no external sound file, license decision, server preference, or new asset pipeline is introduced. `habit_definitions.id` + `check_in_date` identify completion; Habit title is display-only and renameable. Legacy numeric timed rows remain readable. Unknown source/status values render recovery copy and do not improve completion, streak, or consistency. New timer source/event tables, countdown mode, reminders, notification actions, global sound settings, user-selected sounds, exports, and new habit modes require explicit mappings.

## Scope And Acceptance

Update timed Habit card behavior in `HabitPerfectDayHub`: move `Finish` outside `Details`, align desktop timed actions with the timer box, use compact timer progress copy such as `2:05 / 8:00 today`, add count-up-to-target auto-pause/save with shared calm sound, hide everyday source breakdown from `Details`, keep manual input visible, add undo for latest timed completion, use `Completion saved.` with about 3-second success dismissal, standardize `Streak: N days.`, remove `N days streak.`, and fix double punctuation. Replace the current short-thump `softSuccessChime` oscillator profile with a more meditative positive sound generated in the existing sound helper. Update support/user-flow docs only where route/label sweep proves impact; search `app/`, `components/`, `tests/`, `docs/`, runbooks, and task briefs for `Finish`, `Timer time saved`, `Check-in saved`, `Completion saved`, `Manual time`, `Timer`, `Streak:`, `days streak`, `streak.`, `Morning Drink Water`, and `softSuccessChime`. Pass targeted tests, screenshot handoff, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`.

## Out Of Scope

Micro Sessions runtime, weekly rollover, reminders, notification APIs, server/global sound preferences, user-selected/uploaded sounds, external sound files, countdown-mode toggle, new timer-source event table unless scope is refreshed, full history/export/dashboard redesign, graphs, calendar comparison changes, hard delete, payments, entitlements, admin workflows, and public route changes.

## Validation

Run `npm run lint:briefs`; `./node_modules/.bin/vitest run tests/unit/client-sound.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habits-server.test.ts`; responsive screenshot QA for `/my-library/habits`; `npm run verify:pre-pr`; CI required checks; and `npm run verify:pre-merge`.

## Quality Gate Evidence

- API/server unexpected 500/failure-mode evidence: `tests/unit/habits-routes.test.ts` covers timed-completion undo preservation and deletion paths plus conflict/invalid input behavior; the route returns typed 400 errors for unsupported combinations such as `clearTimedCompletion` with other check-in values, non-timed habits, missing timer completion, skipped rows, and failed Supabase ownership-scoped reads/writes instead of leaking unexpected 500s.
- Route-label-support-surface-impact-sweep: searched `app/`, `components/`, `tests/`, `docs/`, runbooks, active/planned/done task briefs, and support/user-flow docs for timer/completion labels and sound identifiers.
- Identifiers searched: `Finish`, `Timer time saved`, `Check-in saved`, `Completion saved`, `Manual time`, `Timer`, `Time sources`, `Streak:`, `days streak`, `streak.`, `Morning Drink Water`, `softSuccessChime`, `of 8:00 today`, and `/ 8:00 today`.
- Surfaces checked / fallout handled: runtime Habits card/details, check-in API route, shared Habit view-model copy, sound helper, unit/API tests, `docs/runbooks/auth-account-support.md`, `docs/user-flow-map.md`, active brief, and screenshot handoff artifacts. Historical done-brief references were treated as past implementation records unless they created active support/runtime fallout.

## Checkpoint Log

- `2026-06-08 | in-progress | owner confirmed fresh scope and clarified the shared completion sound should be meditative and positive, not a short thump; moved brief from planned to in-progress on branch aw006-habits-timer-completion-copy-polish | next: implement timed auto-save/undo/copy/sound changes and run targeted validation before screenshot handoff`
- `2026-06-08 | screenshot handoff pending | implemented meditative generated completion sound, card-level Finish, timed target auto-save, timed-only undo, Completion saved. auto-dismiss, streak copy cleanup, API undo preservation, tests, support docs, and user-flow docs; targeted Vitest, typecheck, lint, and brief lint were green; captured after/reference screenshots in output/aw006-habits-timer-completion-copy-polish-2026-06-08-132239 after local dev-login returned 500, using a temporary production-component harness that was removed after capture | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-08 | screenshot handoff refreshed | owner approved cleaner timer UI direction; updated timer copy to elapsed / target today, kept buttons action-only, aligned desktop actions with the timer box, refreshed support/user-flow docs, reran targeted Habits component tests, typecheck, lint, and brief lint, and regenerated screenshots in output/aw006-habits-timer-completion-copy-polish-2026-06-08-134423 using the same temporary production-component harness that was removed after capture | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-08 | pre-pr evidence repair | npm run verify:pre-pr reached quality-gate and failed only for missing brief evidence on unexpected 500/failure-mode handling and route/label/support sweep identifiers/surfaces; added explicit Quality Gate Evidence section | next: rerun quality-gate then npm run verify:pre-pr`
- `2026-06-08 | pre-pr gate green | owner approved refreshed screenshot handoff; npm run verify:pre-pr passed full lane with branch current at origin/main@9894de96, quality gates, lint, typecheck, unit tests, build, performance budget, and Playwright e2e green/skipped as environment-gated | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
