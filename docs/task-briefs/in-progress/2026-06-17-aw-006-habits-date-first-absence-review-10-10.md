# Task Brief: AW-006 Habits Date-First Absence Review (10/10)

## Metadata

- `id`: `2026-06-17-aw-006-habits-date-first-absence-review-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-17`
- `updated`: `2026-06-17`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_intake`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `parent_child`: Child V
- `execution_mode`: `owner said "ok enig gjor det"; implement scoped runtime/docs/tests end-to-end on branch aw-006-habits-date-first-absence-review`
- `strict_10_10_mode`: `yes; screenshot approval stop is required before PR gates`

## Brief Audit Record

- `last_audited`: `2026-06-17`
- `base`: clean synced `main@cc859079`; local `Ja.docx` remains untracked and out of scope.
- `audit_status`: `ready`
- `decision`: Replace the just-shipped habit-first recovery cleanup with a simpler date-first absence review flow.
- `reason`: Owner review found that returning after time away should present the days that need attention as a list of dates, then let the user edit each date, check it off, move automatically to the next date, and finish the review without automatic history writes.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, Habits check-in/reset APIs, Help/Guide/support copy, screenshot rules, scorecard categories, or AW-006 parent scope change before completion.

## Goal

Make Habits recovery after absence a date-first review checklist: users see which dates need checking, edit a date, use normal habit controls, check the day off, move directly to the next unchecked date, and finish the review without hidden habit writes.

## Pre-Implementation Owner Explanation

Vi erstatter den habit-forst recovery-oppryddingen med en enkel dato-liste. Brukeren skal se hvilke dager som trenger sjekk, ga til en dato, redigere som vanlig, markere datoen som gjennomgatt, og ga videre til neste dato.

Hvorfor det betyr noe: nar noen har vaert borte, tenker de "hvilke dager ma jeg sjekke?", ikke "hvilke habit-kort ma jeg rydde?". Denne flyten gjor historikktrygg rydding mer forstaelig.

Utenfor scope: reminders, vacation mode, ny motivasjonsmodell, store dashboard-endringer, automatisk backfill, ny habit-datamodell, og endret Micro Sessions-regelverk.

Fremoverkompatibilitet: nye habit-typer, statuser og kilder skal automatisk kunne dukke opp som datoer som trenger review nar de mangler trygg historikk. Ukjente typer skal falle tilbake til date-level `Edit`, ikke direkte `Done`/`Rest`-handlinger.

## Product Direction

1. Remove the current habit-first catch-up panels from each habit card.
2. Add one top-level absence review summary when Today has past dates that need attention:
   - `5 days to check`;
   - short reassurance that nothing was marked failed automatically;
   - compact date list with weekday/date rows, habit count, checked state, and `Edit`.
3. On a historical review date, show the normal Habits editor and add a compact bottom `Review days` panel:
   - full review date list;
   - dates before Today only; Today is never listed for review;
   - selected date highlighted without a separate `Current date` chip;
   - `Check` / `Checked` state per date;
   - `Done with this day` moves directly to the next unchecked date.
4. Show `Close review` as the primary action on the last unchecked date and return to Today.
5. `Done with this day` and `Close review` must not write `Done`, `Rest day`, `Missed`, or slip history.
6. Keep list copy compact enough for mobile and desktop scanning.
7. Keep `Restart stats` out of the absence review list; existing reset behavior remains elsewhere.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for 10/10: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility, Data placement and sync boundaries, Reliability and failure handling, Privacy and compliance, Stack-fit and dependency discipline, Testing and QA automation.

| Category                                      | Mapping    | Threshold for this brief                                                                                                                | Evidence                              | Expected score |
| --------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------- |
| Product goals and IA                          | target     | Absence recovery is date-first, top-level, and does not compete with daily logging or per-habit editing.                                | screenshots + component tests         | 5/5            |
| UX flow clarity                               | target     | User can start review, edit a date, return to the review list, check it off, auto-move to next date, and finish with no ambiguous copy. | component tests + screenshot approval | 5/5            |
| Visual design quality                         | target     | Mobile/desktop use compact hierarchy, no nested card clutter, no repeated action wall, no text overlap.                                 | screenshot handoff                    | 5/5            |
| Business logic correctness and data integrity | target     | Review actions acknowledge dates only and never write habit completion, rest, missed, slip, or reset history.                           | component tests + fetch assertions    | 5/5            |
| Admin editor ergonomics                       | N/A        | No admin editor changes; Admin notes remain intake evidence only.                                                                       | explicit scope review                 | N/A            |
| Accessibility (a11y)                          | target     | Review list and bottom panel use labeled regions, selected-row state, status text, keyboard-safe links/buttons, and live feedback.      | Testing Library assertions            | 5/5            |
| Performance (CWV + payloads)                  | supporting | No new dependency, no heavy charting, and no extra server query beyond the existing Habits snapshot.                                    | dependency/build review               | 5/5            |
| Data placement and sync boundaries            | target     | Server remains canonical for habit history; local state only tracks review acknowledgement for this slice.                              | brief contract + tests                | 5/5            |
| Caching and invalidation strategy             | target     | Date navigation and review acknowledgement reconcile against the active loaded snapshot without stale habit writes.                     | component tests                       | 5/5            |
| Reliability and failure handling              | target     | Failed date navigation keeps current context; local acknowledgement failure degrades safely without corrupting history.                 | component tests + fallback review     | 5/5            |
| Security and authz                            | supporting | Protected habit mutation routes remain unchanged and owner-scoped; no new protected write route is added in this slice.                 | route diff review                     | 5/5            |
| Privacy and compliance                        | target     | Analytics/support payloads avoid habit notes/free text and include only safe dates/counts/modes when needed.                            | analytics payload review              | 5/5            |
| Content governance                            | target     | Help/Guide/support docs describe review acknowledgement separately from habit history changes.                                          | docs diff + route/label/support sweep | 5/5            |
| Admin workflow and editability                | N/A        | No admin CRUD/workflow changes; support copy remains user-flow guidance only.                                                           | explicit scope review                 | N/A            |
| SEO and crawlability                          | N/A        | Private authenticated Habits route; no public metadata, sitemap, robots, canonical URL, or structured data changes.                     | private-route SEO rationale           | N/A            |
| AI discoverability                            | N/A        | No public AI-discoverable content surface changes.                                                                                      | explicit scope rationale              | N/A            |
| Analytics and KPI observability               | supporting | Existing Habits analytics remain privacy-safe; new review events are optional and must use safe counts/dates only.                      | analytics diff review                 | 5/5            |
| Commerce and revenue ops                      | N/A        | No checkout, entitlement, pricing, product, refund, payout, or revenue path changes.                                                    | explicit commerce scope rationale     | N/A            |
| Incident response and support operations      | target     | Support can explain `Edit`, `Done with this day`, and `Close review` without implying automatic habit-history writes.                   | support docs update                   | 5/5            |
| Finance and reporting operations              | N/A        | Scope does not touch invoices, payouts, refunds, accounting, finance reports, or finance-relevant data.                                 | explicit finance scope rationale      | N/A            |
| i18n operational readiness                    | target     | Labels are short and layout-safe; future locales require explicit copy mapping before claiming 10/10.                                   | copy review + mobile screenshots      | 5/5            |
| Stack-fit and dependency discipline           | target     | Reuse `HabitPerfectDayHub`, existing Habits snapshot/view-model helpers, route date navigation, UI tokens, and no new dependency.       | code review + dependency diff         | 5/5            |
| Testing and QA automation                     | target     | Focused component tests cover top list, date route, bottom panel, review acknowledgement, finish gating, and no history writes.         | Vitest + screenshot + verify gates    | 5/5            |
| Scalability and cost efficiency               | supporting | Review dates derive from already-loaded bounded calendar-window data; no unbounded day queries.                                         | code/query review                     | 5/5            |
| DevOps and rollback readiness                 | target     | Revert restores previous recovery UI and drops local acknowledgement state without data cleanup or migration rollback.                  | rollback note + verify gates          | 5/5            |

## Stack / Architecture Best-Practice Gate

Radar result:

| Surface                 | Finding                                                                                                                  | Severity | Recommended Type               | Owner Decision Needed                                                  | Follow-Up Brief Path     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------ | ---------------------------------------------------------------------- | ------------------------ |
| Habits recovery IA      | Current recovery UI is still habit-first; owner selected date-first review as the next bounded child.                    | high     | bounded implementation child   | no                                                                     | this brief               |
| Data persistence        | Durable review acknowledgement would ideally be server-canonical, but current safe slice can be local-only and no-write. | medium   | deferred architecture decision | no for this slice; revisit if cross-device acknowledgement is required | TBD after owner decision |
| Screenshot/review gates | This is visible UI work and must stop after screenshot handoff before pre-PR gates.                                      | medium   | safe process/docs update       | no                                                                     | N/A                      |

Stack surfaces:

- React/Next.js: reuse `/my-library/habits` and `HabitPerfectDayHub`; no new route.
- TypeScript/domain: reuse existing catch-up/date helpers, reduce habit-first branching, and keep review state keyed by ISO date.
- Supabase/API: no migration and no new protected write route in this slice; existing check-in/reset routes remain unchanged.
- UI: reuse Habits token/action classes, existing date navigation, lucide icons, labeled regions, and compact mobile-first layout.
- Analytics: if events change, use safe counts/dates only; no habit notes or free-text labels.
- Testing: focused `tests/unit/habit-perfect-day-hub.test.tsx` plus route/label/support sweep and screenshot handoff.

## Data Placement And Sync Contract

- Server-canonical: `habit_definitions`, `habit_check_ins`, `habit_motivation_resets`, and source-backed Micro Session credits remain the only habit-history truth.
- Local-only: date review acknowledgements for this slice, keyed by user/date/review window. They do not change stats or history.
- Sync: date navigation reloads the selected snapshot through the existing route; acknowledgement updates only the local review checklist.
- Conflict behavior: if local storage is unavailable, the review list still renders from current snapshot and the user can use `Edit`; acknowledgement simply cannot persist after reload.
- Retention/sensitivity: local state stores only ISO dates and no habit titles, notes, quantities, or personal free text.
- Cache/invalidation: `/my-library/habits` remains private/dynamic; existing write-through snapshot behavior for habit edits is unchanged.

## Identity And Rename Contract

- Review item identity: ISO date within the loaded Habits review window.
- Habit IDs remain canonical for actual habit history and are not used as the primary review-list key.
- Habit titles remain editable display labels only.
- Acknowledging a date does not repurpose habit identity or rewrite history.
- Unknown habit modes/statuses fail closed into date review/navigation only.

## Forward Compatibility Contract

- Extensibility surfaces: habit modes, habit types, check-in statuses, source providers, cadence periods, review labels, analytics events, and future locales.
- Source of truth: review dates derive from the loaded Habits snapshot and shared date/catch-up eligibility helpers.
- Additive behavior: new eligible habit types automatically contribute to date review counts when they appear as missing past evidence.
- Explicit mapping requirements: direct per-habit recovery actions, durable cross-device review acknowledgement, new source-backed rules, or new locales require copy/test/doc updates before release.
- Unknown/deprecated values: show only date-level `Edit` review; do not expose direct `Done`, `Rest day`, or auto-complete actions.
- Evidence: component tests must include the no-write review path and route/label/support sweep evidence.

## Help/Guide Impact

Required in this PR:

- Explain `Edit`, `Done with this day`, and `Close review`.
- Confirm review acknowledgement is separate from habit history.
- Confirm `Done with this day` does not mark any habit done, rested, missed, or slipped.

## Scope

In scope:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- Habits support/user-flow docs that mention recovery cleanup.
- Parent Habits UX findings brief child status.

Out of scope:

- Database migration or server-canonical review acknowledgement.
- New reminders, vacation mode, notifications, exports, permanent delete, setup assistant, or broader Motivation redesign.
- Changed Micro Sessions linkage rules.
- Changing existing check-in/reset API semantics.

## Acceptance Criteria

1. Today view shows one top-level date-first absence review list when 2+ past review dates need attention.
2. Habit cards no longer render habit-first catch-up cleanup panels.
3. `Edit` opens the selected Habits date using existing route navigation.
4. Historical review dates show a bottom `Review days` panel with the full compact list, selected-row state, and auto-next behavior without a duplicate back-to-list control.
5. `Done with this day` acknowledges only the selected date, navigates to the next unchecked date, and does not call the check-in or reset APIs.
6. `Close review` appears on the last unchecked date, returns to Today, and does not write habit history.
7. Review copy clearly distinguishes review acknowledgement from `Done`, `Rest day`, `Missed`, `Slip`, and `Restart stats`.
8. The current Today date is excluded from the absence review list.
9. Mobile and desktop screenshots show no repeated action wall, overlap, or text-heavy clutter.

## Validation

- Focused route/label/support sweep for `Clean up missed days`, `Clean up`, `Review days`, `Edit`, `Done with this day`, `Close review`, `missed days`, `days to check`, `/my-library/habits`.
- Focused Vitest: `npx vitest run tests/unit/habit-perfect-day-hub.test.tsx`.
- `npm run lint:briefs`.
- Screenshot handoff before `npm run verify:pre-pr`.
- After owner screenshot approval: `npm run verify:pre-pr`, commit, push, PR, CI, and `npm run verify:pre-merge`.

## Screenshot Handoff Requirements

Required because this changes visible UI.

- Comparison type: `after/reference` if old UI cannot be captured before implementation; otherwise `before/after`.
- Artifact folder: `output/habits-date-first-absence-review-YYYY-MM-DD-HHMMSS`.
- Required screenshots:
  - `after-habits-absence-review-list-mobile.*`
  - `after-habits-absence-review-selected-date-mobile.*`
  - `after-habits-absence-review-finish-ready-mobile.*`
  - `after-habits-absence-review-list-desktop.*`
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

## Route/Label/Support Impact Sweep Evidence

- `identifiers searched`: `Clean up missed days`, `Clean up`, `Review days`, `Edit`, `Back to review list`, `Done with this day`, `Close review`, `missed days`, `days to check`, `Leave missed`, `Restart stats`, `Open day`, `Done today`, `/my-library/habits`.
- `directories/surfaces checked`: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/task-briefs/done/`, `scripts/`, `package.json`.
- `fallout handled`: `HabitPerfectDayHub`, focused component/analytics tests, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, `docs/api-contracts.md`, parent Habits UX intake, and this active brief.
- `intentional leftovers`: historical done-brief references to Child S/Child U behavior remain as archived evidence; generic non-Habits `Clean up` references remain unrelated; `Done today` remains valid completion-state copy outside the absence review.
- `targeted validation`: `npx eslint components/my-library/habits/HabitPerfectDayHub.tsx tests/unit/habit-perfect-day-hub.test.tsx` passed; `npx vitest run tests/unit/habit-perfect-day-hub.test.tsx tests/unit/analytics-events.test.ts` passed `79/79`; `npm run typecheck` passed; `npm run lint:briefs:all` passed; `git diff --check` passed; route/label/support sweep reran for old and new Habits review labels/actions.
- `screenshot evidence`: captured `after/reference` artifacts at `output/habits-date-first-absence-review-2026-06-17-234334` for mobile Today review list, mobile selected date, mobile final unchecked date, and desktop Today review list; screenshot data sets Today to May 9 and proves May 9 is excluded from the review list; temporary local visual harness was removed after capture.

## Checkpoint Log

- `2026-06-17 | in-progress | owner selected date-first absence review after discussing that returning users should see a date list, open a date, edit normally, mark reviewed, move directly to the next date, and finish review; created branch aw-006-habits-date-first-absence-review from main@cc859079; local Ja.docx remains out of scope | next: implement scoped UI/tests/docs and capture screenshot handoff before pre-PR gates`
- `2026-06-17 | in-progress | implemented date-first absence review UI, removed habit-first cleanup panels, added local-only reviewed-date acknowledgement, updated support/user-flow/API docs and analytics event contract, and passed focused Vitest, typecheck, brief lint, route-label/support sweep, and diff check | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-17 | in-progress | owner reviewed first screenshot handoff and requested tighter mobile/desktop list density, Edit labels, removal of current-date and selected-date noise, checked-state copy, and one-click auto-next/finish behavior; updating UI/tests/docs and regenerating screenshot handoff before pre-PR gates | next: focused validation and refreshed screenshot handoff`
- `2026-06-17 | screenshot-review | refined copy/actions to 5 days to check, compact Edit rows, Check/Checked state, Done with this day auto-next, Close review on the last unchecked date, no extra selected-review heading, no duplicate Back to review list button, and selected-date context beside Today status; validation passed before latest visual refinement and screenshots need refresh | next: rerun focused validation and refresh screenshot handoff before npm run verify:pre-pr`
- `2026-06-17 | screenshot-review | owner confirmed keeping reset/fresh-start messaging out of this slice; captured refreshed screenshot artifacts at output/habits-date-first-absence-review-2026-06-17-232532 showing Today date context, no Today row in review list, no Back to review list button, compact rows, Done with this day, and Close review | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-17 | screenshot-review | owner caught that the prior screenshot scenario made May 9 appear in the review list; added regression coverage for excluding Today from the review list, changed historical header copy from Today to This day, and refreshed screenshot artifacts at output/habits-date-first-absence-review-2026-06-17-234334 with Today May 9 and review dates May 5-8 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-17 | screenshot-approved | owner approved refreshed artifacts at output/habits-date-first-absence-review-2026-06-17-234334 | next: run npm run verify:pre-pr, commit, push, and open PR`
- `2026-06-17 | pre-pr-green | npm run verify:pre-pr passed the full lane, including lint, typecheck, unit tests, build, performance budgets, and Playwright e2e; performance budget trend reported 10 consecutive weekly green runs with 17.9% margin and recommends tightening one stretch target, but this UX slice records hold/defer so the budget decision can be made in the next performance-budget workstream | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge`
