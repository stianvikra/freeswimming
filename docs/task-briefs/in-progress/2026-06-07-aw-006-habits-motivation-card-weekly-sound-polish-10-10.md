# Task Brief: AW-006 Habits Motivation Card Weekly Sound Polish (10/10)

## Metadata

- `id`: `2026-06-07-aw-006-habits-motivation-card-weekly-sound-polish-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-07`
- `updated`: `2026-06-07`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `plan only until owner explicitly says kjør`
- `screenshot_required`: `yes; UI/copy/layout/sound-control work`
- `target_findings`: `new owner findings captured 2026-06-07 after PR #1009/#1010`

## Brief Audit Record

- `last_audited`: `2026-06-07`
- `base`: clean synced `main@45908764`
- `audit_status`: `ready`
- `decision`: Use this as the next Habits child slice if the owner approves implementation.
- `reason`: PR `#1009` shipped Reset stats and PR `#1010` closed it out. The owner then found a coherent follow-up polish set: clearer Habits stats copy, consistent closed-card motivation, less duplicate weekly/header UI, better What counts text, per-habit saved feedback placement, and a sound regression.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, Habits sound/local preference code, Habits summary/domain logic, weekly overview UI, Calendar Comparison, support docs, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before implementation.

## Goal

Make Habits feel calmer, more consistent, and more motivating by removing duplicate status text, making closed cards useful, clarifying stat language, fixing sound feedback, and tightening the weekly overview/header layout without changing the core reset-stats contract.

## Pre-Implementation Owner Explanation

Vi samler de siste Habits-funnene i en egen polish-slice. Codex skal rydde tekst, kortlayout, weekly overview, feedbackmeldinger og lyd slik at Habits blir lettere aa forstaa og mer motiverende aa bruke hver dag.

Hvorfor det betyr noe: Habits er en motivasjonsflate. Hvis samme informasjon vises flere steder, hvis streak/status er utydelig, eller hvis lyd/lagret-feedback ikke virker der brukeren handler, mister brukeren tillit og flyt.

Utenfor scope er ny databasemodell, reminders, midnight auto-complete, sletting av historikk, restore/edit av arkiverte vaner, Micro Sessions-kobling, brede grafer, og ny Calendar Comparison-funksjonalitet.

Fremoverkompatibilitet: nye habit cadences, modes, units og labels skal enten flyte gjennom eksisterende typed view-models og generiske copy-regler, eller kreve eksplisitt mapping med tester. Ukjente cadence/status-verdier skal ikke gi falsk streak, perfect-day credit eller lydfeedback.

## Product Decisions And 10/10 Solutions

### Habit Cards, Details Closed

- Closed habit cards should use one consistent layout across habit types.
- Details-closed state should show the primary motivation signal, not a random mix of pills/text.
- Preferred signal:
  - daily habits: current streak in days, for example `2 day streak`;
  - weekly habits: current streak in weeks, for example `2 week streak`;
  - monthly habits: current streak in months, for example `2 month streak`.
- If current streak is `0`, show action-oriented copy instead of a dead zero:
  - daily: `Complete today to start your streak`;
  - weekly: `Complete this week to start your streak`;
  - monthly: `Complete this month to start your streak`.
- Avoid percent and dense ratio copy in closed cards. Keep percentages and range ratios in Details/stat sections.

### Per-Habit Details Copy

- Change `Progress` to `Habit stats`.
- Change `DAYS HIT` to `DAYS COMPLETED`.
- Remove duplicate small bottom copy such as `20/26 days hit`.
- Remove `No check-in` helper text where the primary action already says `Mark done`.
- Remove `Last tracked <date>` from the open Details stats block unless a clear implementation audit proves it is needed for a specific non-duplicate support reason.
- Keep one open Details metadata line, for example `Daily · Started Jun 7, 2026`; include the year.
- Remove setup/status/category/target-type pills from open Details, for example `Do`, `Open`, `Other`, and `Done only`. Add/Edit owns those setup choices after creation.
- Make `Habit stats` a stronger section heading so it reads as the start of the stats block.
- Change `Reset these habit stats` to `Reset habit stats`.
- Change `Archive this habit` to `End habit and move to History`.
- Keep `Edit this habit`.
- Keep completed undo copy explicit, for example `Undo complete`.

### Motivation Summary Copy

- Change the top eyebrow from `PROGRESS SUMMARY` to `HABIT STATS`.
- Keep the main heading `Motivation`.
- Do not use `Habit Summary Stats`; it is heavier and duplicative.

### Top Header And Weekly Overview

- Remove the duplicate `Today` container that repeats week/date/explanatory copy.
- Move previous/today/next controls into the bottom of the `Weekly Overview` container.
- Change `WEEK OVERVIEW` to `WEEKLY OVERVIEW`.
- Remove instructional copy such as `Today - manage habit setup and log today's check-ins here.`
- Make the main Habits header compact:
  - heading: `Habits`;
  - one meta row under it;
  - left side: `2/9 on target`;
  - right side: `Today · Jun 7`.
- On narrow mobile, the meta row may wrap, but the intended layout is a single balanced row with date right-aligned.

### Perfect Day And Cadence Semantics

- Daily habits count toward the Perfect Day for each scheduled date.
- Weekly/monthly `any day` habits should not make earlier days in the still-open period imperfect.
- When a weekly/monthly habit is completed, it contributes positively on the date it was completed.
- If a weekly/monthly obligation is not completed by period end, the last day of that period is the missed obligation day for Perfect Day purposes.
- Do not auto-create fake check-ins. Missed period obligations should be derived from schedule/period state, not stored as completed actions.

### What Counts Copy

Use this order and content:

1. `Perfect days are days where every habit scheduled for that day was completed.`
2. `Perfect-day streak is days in a row where every habit scheduled for each day was completed.`
3. `Best perfect-day streak is the longest perfect-day streak in the selected period.`
4. `Consistency is the percent of days in this range that were perfect days.`
5. `0/0 means there were no scheduled Perfect Day habits in the selected period.`
6. `Rest days are intentional skips. They are excluded from the habit target for the day, but kept in history.`
7. `Slips are logged misses for Quit habits. They stay in history and do not delete progress before or after the slip.`
8. `Reset habit stats restarts motivation stats from the selected reset date. Earlier check-ins stay saved and can be reviewed in Calendar Comparison.`

Remove:

- `Early data means this period has fewer than 7 days that could count toward Perfect Days. The numbers are a first signal.`
- `Micro Sessions are tracked separately and do not count toward Perfect Days. Make a separate habit to track it as a habit.`
- any remaining `Start fresh` copy.
- `Before reset` wording in user explanation copy.

### Saved Feedback

- Move `Check-in saved.` into the habit container where the save action happened.
- Prefer per-habit feedback over a global bottom message.
- Place it near the action row that caused it, for example under `Mark done`, `Save`, or `Rest day`.
- Keep it brief: `Saved` or `Check-in saved`.
- Multiple quick saves must not cause one habit's saved state to appear attached to another habit.

### Sound Regression And Control Layout

- Treat current sound behavior as a regression from the earlier sound improvement.
- Keep the existing bell/sound icon style, including the slashed-off state when sound is off.
- When the user turns sound on, play a short preview sound immediately.
- When sound is on, habit completion/save/rest-day feedback should play the intended sound after user action.
- Sound must never block visual success feedback.
- On iPhone, silent mode/volume may still prevent audible output, but the app must still toggle state and show visual feedback correctly.
- In Micro Sessions, place `Edit`, `Clear`, and sound toggle on one action row:
  - `Edit` and `Clear` are flexible buttons and share the remaining width;
  - sound toggle is a fixed square icon button on the right;
  - the row spans 100% width;
  - do not place sound next to the progress stat.

## Scope

- `/my-library/habits` header, weekly overview, habit cards, Details sections, Motivation/What counts copy, and per-habit saved feedback.
- Habits view-model/domain logic where needed for closed-card streak copy, cadence-aware streak units, and weekly/monthly Perfect Day semantics.
- Habits sound preference/toggle/playback behavior and tests.
- Micro Sessions action row layout only for the sound/Edit/Clear alignment issue described above.
- Help/Guide/support docs only where changed labels or troubleshooting language require it.
- Unit/component/e2e/screenshot coverage for changed UI, copy, sound, and cadence semantics.

## Out Of Scope

- New database tables, migrations, or reset-stats contract changes unless implementation audit proves a small typed-domain fix is required for correctness.
- Deleting, rewriting, or anonymizing historical check-ins.
- Reminders, notifications, midnight auto-complete, backfill redesign, restore/edit archived habits, export reports, or new analytics dashboards.
- Calendar Comparison redesign beyond keeping reset/Perfect Day wording consistent if touched.
- Micro Sessions feature redesign beyond the one action-row layout/sound-control adjustment.
- New external sound libraries or media dependencies.
- New habit modes, new check-in statuses, or new persisted cadence concepts.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Closed habit cards show one consistent, cadence-aware motivation signal and no duplicate progress text.
2. Zero-streak cards use action-oriented copy that tells the user how to start the streak.
3. Per-habit Details uses a stronger `Habit stats` heading, `Days completed`, `Reset habit stats`, and `End habit and move to History`.
4. Open Details shows one cadence/start-date metadata line with year and does not repeat setup/status pills such as `Do`, `Open`, `Other`, or `Done only`.
5. Duplicate `No check-in`, bottom `days hit`, and unnecessary `Last tracked` copy are removed from the selected surfaces.
6. Motivation top eyebrow is `HABIT STATS`, with heading `Motivation`.
7. `What counts?` uses the approved ordered copy and removes `Early data`, Micro Sessions, `Start fresh`, and `Before reset` explanations.
8. The duplicate `Today` container is removed and the weekly navigation controls live inside `Weekly Overview`.
9. Habits header meta row balances `2/9 on target` with `Today · Jun 7` on the same row where space allows.
10. `Weekly Overview` spelling is used.
11. Per-habit saved feedback appears inside the relevant habit container after the action that created it.
12. Sound toggle plays a preview when turned on, and enabled sound plays after habit actions without blocking visual feedback.
13. Micro Sessions `Edit`, `Clear`, and sound toggle share one full-width row with sound as a fixed icon button.
14. Weekly/monthly any-day habits do not make earlier open-period days imperfect, but missed obligations count on the period end date.
15. No fake completion check-ins are created to satisfy period-end Perfect Day logic.
16. Screenshot handoff proves mobile and desktop layout for header, Weekly Overview, closed cards, open Details, What counts, per-habit saved feedback, and Micro Sessions action row.

## Data Placement And Sync Contract

- Server-canonical data:
  - existing habit definitions, schedules, check-ins, reset events, and archive state remain the source of truth.
  - Perfect Day and cadence-aware streak output derives from server-canonical schedules/check-ins and selected date/period.
- Local data:
  - sound preference remains local-only if current implementation is local-only.
  - transient saved-feedback display state is local UI state only.
  - no local-only truth for completion, rest, slip, streak, or Perfect Day.
- Sync policy:
  - after check-in/save/rest-day mutation, refresh or update the relevant Habits snapshot through the existing route/client boundary.
  - failed mutations must not show durable success state or play completion sound as if saved.
  - sound preview can play on local toggle because it is not data truth.
- Retention and sensitivity:
  - no new private data fields.
  - do not log private habit names or user notes in sound/failure diagnostics.
- Cache/invalidation:
  - preserve existing `/my-library/habits` freshness model unless audited otherwise.
  - weekly overview and closed-card stats must reflect the same selected date/week snapshot.

## Identity And Rename Contract

- Canonical stable ID:
  - existing habit ID remains the identity for all per-habit feedback, stats, saved messages, archive labels, and reset-stats links.
- Human-readable identifiers:
  - habit title is display-only and renameable.
  - changed button labels must not become storage keys.
- Mutability:
  - copy changes do not alter persisted identifiers.
  - archived/history state remains tied to the existing persisted habit state.
- Rename vs repurpose:
  - renaming a habit preserves history and stats.
  - materially repurposing a habit remains a separate product decision outside this slice.
- Compatibility:
  - legacy habits without check-ins should render zero/open motivation copy safely.
  - unknown cadence/status should fall back to generic safe copy and must not award false Perfect Day credit.

## Forward Compatibility Contract

- Automatically supported:
  - future habit titles and categories;
  - existing supported modes (`build`/Do, `quit`, timed, count, done-only) through shared view-model helpers;
  - renamed habits;
  - date ranges where no Perfect Day habits are scheduled.
- Requires explicit mapping:
  - new cadence types beyond daily/weekly/monthly;
  - new check-in statuses;
  - new sound event types;
  - new archive/history states;
  - future locale/i18n extraction;
  - new Calendar marker meanings.
- Safe fallback:
  - unknown cadence uses generic `Complete to start your streak` copy and is excluded from cadence-specific Perfect Day shortcuts until mapped.
  - unknown check-in status does not count as completed.
  - failed sound playback never blocks save/check-in UI.
- Test/evidence:
  - fixtures for daily, weekly, monthly, zero-streak, completed-period, missed-period-end, unknown cadence/status, and sound-on/off paths.
  - route/label/support sweep before broad gates.

## Help / Guide Impact

Required if implementation changes user-facing workflow labels or support wording:

- update relevant Help/Guide or docs surfaces for:
  - `Reset habit stats`;
  - `End habit and move to History`;
  - `Weekly Overview`;
  - Perfect Day / What counts wording;
  - sound troubleshooting if support docs mention Habits sound.
- If no Help/Guide page currently owns these labels, document explicit `N/A` rationale in closeout.

## Route / Label / Support Surface Sweep

Run before broad gates:

- `Progress`
- `Habit stats`
- `PROGRESS SUMMARY`
- `HABIT STATS`
- `DAYS HIT`
- `DAYS COMPLETED`
- `days hit`
- `No check-in`
- `Last tracked`
- `Reset these habit stats`
- `Reset habit stats`
- `Archive this habit`
- `End habit and move to History`
- `WEEK OVERVIEW`
- `WEEKLY OVERVIEW`
- `Today - manage habit setup`
- `What counts?`
- `Early data`
- `Start fresh`
- `Before reset`
- `Micro Sessions are tracked separately`
- `Check-in saved`
- sound preference/toggle helpers
- `Perfect days`
- `Perfect-day streak`
- `Consistency`
- `Rest days`
- `Slips`

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- Habits view-model/domain helpers in `lib/habits/`
- Habits route/API tests where changed mutations or authz boundaries are touched
- Motivation/Calendar comparison helpers if Perfect Day semantics change
- Micro Sessions component containing `Edit`, `Clear`, and sound toggle
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `tests/unit/habits.test.ts`
- relevant sound/unit tests
- e2e/screenshot coverage for changed surfaces
- docs/runbooks/user-flow/support surfaces if label contracts change

Evidence before broad gates:

- Identifiers searched: the label/support identifiers listed above plus final owner additions `Do`, `Open`, `Other`, `Done only`, and `Started`.
- Surfaces checked / directories-surfaced checked: `components/`, `lib/habits/`, `tests/unit/`, `docs/runbooks/`, `docs/user-flow-map.md`, and this active task brief.
- Fallout handled: product UI, Habits/Micro unit tests, user-flow docs, and support runbook were updated in the same branch; no public route, admin editor, commerce, or database migration fallout was found.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse the current Habits hub/card/details component and existing Micro Sessions component.
  - avoid creating a new card system.
  - keep browser-only sound playback in client components.
- TypeScript/domain contracts:
  - add or reuse typed view-model helpers for cadence-aware copy and Perfect Day semantics.
  - avoid ad hoc string checks in UI where canonical cadence/status helpers exist.
  - unknown statuses/cadences fail safe.
- Supabase/data layer:
  - no migration expected.
  - if implementation audit finds a persisted data gap, pause and refresh this brief before adding schema work.
- External services/tools:
  - no new dependency.
  - sound should use current browser audio implementation.
- UI system:
  - reuse existing button, pill, icon, disclosure, and card styles.
  - keep sound icon as an icon button, not text-heavy UI.
  - preserve mobile bottom-nav spacing and stable button dimensions.
- Testing:
  - unit tests for copy/view-model/domain semantics.
  - component tests for visible labels and feedback placement.
  - e2e/screenshot handoff for mobile and desktop surfaces.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for 10/10 claim: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Reliability and failure handling, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Threshold                                                                                                                                  | Evidence source                                                                              | Expected score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------- |
| Product goals and IA                          | `target`     | Habits header, Weekly Overview, Details stats, Motivation, What counts, and Micro Sessions action row each have a clear single purpose.    | Screenshot handoff, component assertions, owner review.                                      | 5              |
| UX flow clarity                               | `target`     | Primary actions, saved feedback, reset/archive/edit labels, sound toggle, and closed-card motivation are obvious with no duplicate states. | Component tests, screenshot handoff, targeted e2e/manual QA.                                 | 5              |
| Visual design quality                         | `target`     | Mobile and desktop layouts use consistent spacing, stable button widths, balanced header meta row, and no overlapping or orphaned text.    | Screenshot artifacts across mobile/desktop.                                                  | 5              |
| Business logic correctness and data integrity | `target`     | Cadence-aware streak/Perfect Day semantics are deterministic and create no fake check-ins or false completion credit.                      | Unit/domain tests for daily/weekly/monthly, missed period end, unknown status/cadence.       | 5              |
| Admin editor ergonomics                       | `N/A`        | Scope is member Habits and Micro Sessions UI, not admin editor workflows.                                                                  | Diff review confirms no admin editor surface changes.                                        | N/A            |
| Accessibility (a11y)                          | `target`     | Changed buttons/disclosures/sound toggle keep accessible names, keyboard operation, focus order, and non-audio visual feedback.            | Testing Library assertions, Playwright/accessibility checks where relevant.                  | 5              |
| Performance (CWV + payloads)                  | `supporting` | No new dependency or heavy media payload; sound preview uses existing lightweight implementation.                                          | Bundle/build output and dependency diff.                                                     | 4              |
| Data placement and sync boundaries            | `target`     | Completion truth remains server-canonical; sound preference and saved flash are local-only; failed saves do not show durable success.      | Brief contract, unit/component tests, implementation review.                                 | 5              |
| Caching and invalidation strategy             | `target`     | Weekly overview, closed-card stats, and saved feedback refresh from the same selected-date snapshot after mutations.                       | Unit/component tests and route/cache review.                                                 | 5              |
| Reliability and failure handling              | `target`     | Sound playback failure does not block saves; failed mutations do not show saved state or completion sound.                                 | Unit/component tests with audio failure and mutation failure mocks.                          | 5              |
| Security and authz                            | `target`     | Existing protected habit mutations remain owner-scoped; no new unauthenticated path or cross-owner read/write is introduced.               | Route/API tests if touched, quality-gate review, no secrets diff.                            | 5              |
| Privacy and compliance                        | `supporting` | No private habit names/notes are logged in sound or feedback diagnostics.                                                                  | Code review and tests/log search where relevant.                                             | 4              |
| Content governance                            | `target`     | User-facing labels and What counts definitions are updated consistently across product/docs/support surfaces.                              | Route/label/support sweep, docs diff, component tests.                                       | 5              |
| Admin workflow and editability                | `N/A`        | Scope does not add or change admin workflow/editability.                                                                                   | Diff review.                                                                                 | N/A            |
| SEO and crawlability                          | `N/A`        | Private authenticated Habits UI only; no public route metadata or crawlable content changes.                                               | Diff review.                                                                                 | N/A            |
| AI discoverability                            | `N/A`        | Private authenticated Habits UI only; no public AI/crawl surface changes.                                                                  | Diff review.                                                                                 | N/A            |
| Analytics and KPI observability               | `supporting` | Existing analytics are not broken; no new event taxonomy unless implementation audit proves one is necessary.                              | Analytics event tests if touched, otherwise explicit N/A rationale in PR.                    | 4              |
| Commerce and revenue ops                      | `N/A`        | Scope does not touch pricing, checkout, entitlements, refunds, payouts, or commerce reporting.                                             | Diff review confirms no commerce files changed.                                              | N/A            |
| Incident response and support operations      | `target`     | Support-facing wording remains accurate for reset stats, sound troubleshooting, History/archive, and Perfect Day definitions.              | Support/doc sweep and updated runbook/Help rationale.                                        | 5              |
| Finance and reporting operations              | `N/A`        | Scope does not affect revenue, refunds, entitlements, payouts, or finance reconciliation data.                                             | Diff review confirms no finance/reporting surfaces changed.                                  | N/A            |
| i18n operational readiness                    | `target`     | New labels are concise, not layout-breaking, and cadence-specific strings have an explicit future locale mapping requirement.              | Component/screenshot tests and forward-compatibility contract.                               | 5              |
| Stack-fit and dependency discipline           | `target`     | Reuse current Habits/Micro Sessions components, typed helpers, current audio implementation, and existing tests; add no dependency.        | Diff review, dependency diff, test coverage.                                                 | 5              |
| Testing and QA automation                     | `target`     | Relevant unit/component/e2e/screenshot coverage proves copy, layout, sound, saved feedback, and cadence semantics.                         | Targeted tests, `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`, screenshot handoff. | 5              |
| Scalability and cost efficiency               | `supporting` | No polling loop, large asset, new provider, or expensive recomputation pattern is introduced.                                              | Code review and performance/build gate.                                                      | 4              |
| DevOps and rollback readiness                 | `target`     | No migration expected; rollback is a normal PR revert; screenshots and gates document visual/runtime readiness.                            | PR body, screenshot artifacts, verify gates, rollback note.                                  | 5              |

## Validation

Before implementation PR:

- targeted unit/component tests for changed Habits/Micro Sessions logic;
- targeted sound playback tests/mocks if available;
- targeted e2e or Playwright coverage for changed user flow where stable;
- screenshot handoff before broad gates;
- owner screenshot approval stop: explicitly waived by owner on 2026-06-07 (`trenger ikke godkjenne nye skjermbilder`), so screenshots are still captured as evidence but execution continues to gates and merge.
- `npm run lint:briefs`;
- `npm run verify:pre-pr`.

Before merge:

- required CI checks green;
- `npm run verify:pre-merge`;
- owner approval after screenshot handoff unless explicitly waived.

## Screenshot Handoff Requirements

Capture `before/after` or `after/reference` artifacts for:

- Habits mobile header and `Weekly Overview`;
- closed habit cards for daily, weekly, and zero-streak examples;
- open Details with `Habit stats`, `Days completed`, and updated actions;
- Motivation `HABIT STATS` and `What counts?`;
- per-habit saved feedback placement;
- Micro Sessions `Edit` / `Clear` / sound row;
- desktop reference for any layout that behaves differently from mobile.

## Checkpoint Log

- `2026-06-07 | planned | owner findings captured after PR #1009/#1010: closed-card motivation, copy cleanup, weekly overview/header consolidation, What counts rewrite, per-habit saved feedback, and sound regression/layout | next: owner can review scope and say kjør to implement`
- `2026-06-07 | in-progress | implementation complete for Habits labels/layout, weekly/monthly any-day Perfect Day semantics, per-habit feedback, Micro Sessions sound row, support docs, and targeted tests | validation: targeted Vitest 121/121, typecheck pass | next: screenshot handoff, pre-PR gate, PR, CI, pre-merge, merge`
- `2026-06-07 | in-progress | final Details cleanup added: setup pills removed from open Details, start metadata includes year, and Habit stats heading strengthened | validation: pending refreshed targeted tests and screenshots | next: run gates and merge on green per owner approval`
