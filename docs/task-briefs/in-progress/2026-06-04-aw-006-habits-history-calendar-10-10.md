# Task Brief: AW-006 Habits History Calendar (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-habits-history-calendar-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-04`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-history-calendar`

## Brief Audit Record

- `last_audited`: `2026-06-04`
- `base`: `main@6ef89bd`
- `audit_status`: `ready`
- `decision`: Execute Child C as the first Habits history/calendar slice, with a thin shared My Library calendar contract before UI changes.
- `reason`: `main` was clean and synced after Habits Mobile Card Polish PR `#981` and repo-managed closeout PR `#982`; post-merge preflight was reported green. Owner approved Child C, then clarified that the slice must not accidentally create a competing Habits-only calendar before the system-level calendar direction is understood.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, My Library calendar direction, route params, Habits check-in API semantics, screenshot handoff rules, route/label/support sweep rules, or verification lanes change.

## Goal

Make Habits history useful through a selected-day and week navigation model while establishing the first shared My Library calendar contract that can later support Habits, Micro Sessions, Dryland, Swimming, and All filters.

## Pre-Implementation Owner Explanation

Vi bygger ikke en stor systemkalender forst. Vi lager en liten felles kalenderkontrakt og lar Habits bruke den forst, slik at dagens Habits-historikk kan fa tydelige datoer, uke-navigasjon og valgt dag uten aa lage en konkurrerende kalender.

Hvorfor det betyr noe: brukeren skal kunne rette gamle Habits-dager og forsta hvilken dato de ser paa, samtidig som fremtidig My Library-kalender kan samle Habits, Micro Sessions, Dryland og Swimming uten dobbel datamodell.

Utenfor scope er global calendar storage, swim/dryland/micro-planlegging i kalender, sound/reminders, export, analytics-redesign, builder target semantics som `Any amount`/litres/glasses, og jobb/ikke-jobb kalenderregler. Jobb/ikke-jobb tas videre som fremtidig `context`/filter, ikke som egen kalender.

Fremoverkompatibilitet: nye kalenderkilder skal kobles paa via felles source/filter-kontrakt. Ukjente kilder skal ikke telle som Habits, og nye context-verdier som jobb/fri krever eksplisitt mapping og tester.

## Product Audit Snapshot

Official or primary sources checked on `2026-06-04`:

| Source                                                                                                                             | Pattern                                                                                                                                                                                           | Implication                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Habitify progress, `https://intercom.help/habitify-app/en/articles/11203360-view-the-progress-of-a-habit-on-website-desktop-app`   | Habit-specific progress supports month/year filters, manual progress logging for a date, monthly report cards, side-by-side calendars, streak history, and charts grouped by day/week/month/year. | FreeSwimming should separate selected-day correction from later aggregate analytics and keep period filters extensible. |
| Productive statistics, `https://support.productiveapp.io/hc/en-us/articles/26920754719633-How-to-read-statistics`                  | Monthly stats use weekday/date labels, done/partial/skipped/ignored status, total perfect days, streaks, total habits done, and average completion.                                               | Habits needs clear dates and status rules before heavier charts.                                                        |
| Productive previous days, `https://support.productiveapp.io/hc/en-us/articles/26920673789585-How-to-mark-habits-for-previous-days` | Previous days can be corrected only after the habit existed.                                                                                                                                      | Child C should allow past check-in correction for existing habits, not arbitrary future or pre-existence logging.       |
| Habitify Time of Day, `https://intercom.help/habitify-app/en/articles/7990118-manage-the-time-of-day`                              | Time-of-day blocks are filters/organization for the daily list and do not change the daily reset.                                                                                                 | Work/off-work should be future context/filter metadata, not a separate calendar.                                        |
| Loop Habit Tracker, `https://play.google.com/store/apps/details?gl=US&hl=en_US&id=org.isoron.uhabits`                              | Loop emphasizes complete history, detailed charts/statistics, flexible schedules, habit score, privacy, offline, and export.                                                                      | This slice should keep the data model open for charts/score/export later without adding them now.                       |

## Selected Scope

- Add a shared My Library calendar contract for source filters and date-window helpers.
- Expose `/my-library/habits?date=YYYY-MM-DD` as the selected-day contract.
- Keep `view=active` compatible for signed-in Home/Mobile routine entrypoints.
- Add previous/next week and Today navigation around the existing Habits 7-day history window.
- Add clearer selected-date, ISO week number/year, date-range labels, and selected-day state in the week strip.
- Define edit rules in UI:
  - today: check-ins and habit setup can be managed;
  - past dates: existing habits can be corrected for that date;
  - past dates: add/edit/archive habit setup stays on Today;
  - future dates: not selectable through UI and clamped server-side to Today.
- Preserve existing owner-scoped Habits storage, check-in API, cadence, rest/slip, timer/manual, and analytics behavior.
- Update parent/queue/inventory/support docs with exact Child C status.
- Add focused tests for date route loading, calendar contract helpers, selected-day UI, historical edit rules, and past check-in payloads.
- Capture screenshot handoff before `npm run verify:pre-pr`.

## Out Of Scope

- Full My Library calendar route or global calendar storage.
- Scheduling swim, dryland, or micro sessions in a calendar.
- Month calendar, year heatmap, week/month/year comparison, habit score, best streak dashboard, export, or chart analytics. Period comparison is captured as planned system-calendar follow-up `docs/task-briefs/planned/2026-06-04-aw-006-my-library-calendar-period-comparison-10-10.md`.
- Habit notes per log.
- Sound, reminders, notifications, native integrations, HealthKit, Apple Watch.
- Builder target semantics for `Any amount`, litres, glasses, or no-fixed-amount count habits.
- Job/off-work calendar rules, work calendars, location calendars, or time-of-day block management.
- Supabase schema migrations, generated DB type updates, RLS changes, or new API routes.

## Finding Disposition

| ID    | Disposition                           | Rationale                                                                                                                                           |
| ----- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-001 | Not affected                          | Timed additive manual/time semantics were resolved by Child B.                                                                                      |
| H-002 | Not affected                          | Manual-time labels were resolved by Child B.                                                                                                        |
| H-003 | Supporting                            | Calendar history keeps existing motivation labels but does not add best streak/habit score.                                                         |
| H-004 | Supporting                            | Rest-day status remains available when correcting eligible past days.                                                                               |
| H-005 | Deferred                              | Sound remains a future preference/sound child.                                                                                                      |
| H-006 | Deferred                              | Sound remains a future preference/sound child.                                                                                                      |
| H-007 | Supporting                            | Weekly/monthly target-met semantics are preserved while browsing selected dates.                                                                    |
| H-008 | Not affected                          | Mobile spacing was resolved by Child D.                                                                                                             |
| H-009 | Satisfied for this child              | Current audit checked Productive, Habitify, Loop, and Streaks/App Store signals before implementation.                                              |
| H-010 | Partially in scope                    | Calendar/history day correction and summary labels are in scope; best streak, score, notes, reminders, export, and global calendar remain deferred. |
| H-011 | Not affected                          | Duplicate timed timer display was resolved by Child B.                                                                                              |
| H-012 | Not affected                          | One-active-timer behavior was resolved by Child B.                                                                                                  |
| H-013 | Not affected                          | Card chip hierarchy was resolved by Child D.                                                                                                        |
| H-014 | Ongoing                               | New owner findings are captured here and should return to the parent after this child.                                                              |
| H-015 | Not affected                          | `Do` user label was resolved by Child D.                                                                                                            |
| H-016 | Not affected                          | Streak copy readability was resolved by Child D.                                                                                                    |
| H-017 | Not affected                          | Count progress copy was resolved by Child D.                                                                                                        |
| H-018 | Resolved by this child when validated | Mobile and desktop get selected-day/week navigation beyond merely revealing today's week overview.                                                  |
| H-019 | Deferred                              | Water-style target semantics belong to Child F.                                                                                                     |
| H-020 | In scope                              | Date labels, previous/next week controls, selected-day behavior, and edit rules are the core Child C scope.                                         |

## Data Placement And Sync Contract

- Server-canonical data:
  - `habit_definitions` and `habit_check_ins` remain the only Habits truth.
  - `habit_check_ins.check_in_date` stores the selected day being corrected.
- Local data:
  - same-day timer localStorage remains local-only.
  - selected date is a URL param, not browser storage.
- Derived view-model data:
  - calendar source filters, selected-day label, ISO week number/year, week-window range label, previous/next/Today hrefs, historical edit-copy, and future disabled state.
- Sync policy:
  - changing `date` reloads the authenticated route snapshot.
  - check-in mutations continue to write through existing Habits API and return a refreshed snapshot for the selected date.
  - past check-in correction is allowed only for existing/scheduled rows surfaced by the snapshot.
  - habit setup changes are restricted to Today to avoid accidental backdated definition changes.
- Retention and sensitivity:
  - no new retained data.
  - habit names, quit/lapse data, check-ins, and dates remain private and must not be logged in analytics or support notes.
- Cache/invalidation:
  - `/my-library/habits` remains `force-dynamic`.
  - no static cache or revalidation path is added.

## Identity And Rename Contract

- Canonical stable ID:
  - habit IDs remain the source of truth for check-ins, local timer recovery, and support diagnosis.
- Human-readable identifiers:
  - habit titles remain editable labels, not route identifiers.
  - calendar source labels (`Habits`, `Micro Sessions`, `Dryland`, `Swimming`, `All`) are display filters, not storage identities.
- Mutability rules:
  - `date` selects a check-in date only.
  - habit setup add/edit/archive remains a Today workflow in this slice.
- Rename vs repurpose policy:
  - renaming a habit keeps history attached.
  - materially repurposing a habit remains a product/support decision before history is reused.
- Compatibility contract:
  - existing routes without `date` load Today.
  - invalid or future `date` values fail safe by loading Today.
  - future calendar sources require explicit mapping before they can appear as selectable filters.
- Observability and repair:
  - support diagnoses selected-day issues through owner-scoped habit ID, `check_in_date`, schema/RLS state, and redacted timestamps.

## Forward Compatibility Contract

- Extensibility surfaces:
  - calendar source filters, view mode, date params, selected-day summaries, status values, context filters, route params, support labels, and future analytics payloads.
- Source of truth:
  - Habits history derives from existing owner-scoped Habits data.
  - shared calendar source filters are defined once and reused by Habits first.
- Additive behavior:
  - future Micro Sessions, Dryland, Swimming, and All views can use the same source identifiers without changing Habits storage.
  - new Habits returned by the current snapshot inherit selected-day rendering automatically.
- Explicit mapping requirements:
  - new calendar sources, context filters like work/off-work, month/year views, event types, external calendars, exports, reminders, or analytics events require mapping, tests, and support docs.
  - week/month/year comparison requires the planned system-calendar follow-up `docs/task-briefs/planned/2026-06-04-aw-006-my-library-calendar-period-comparison-10-10.md`, using shared `source`, `period`, `range`, and `compareTo` concepts rather than a Habits-only analytics model.
- Unknown or deprecated values:
  - unknown sources are not shown and must not be counted as Habits.
  - invalid/future date params resolve to Today rather than creating future editable state.
- Test/evidence:
  - contract tests cover date normalization, ISO week number/year, range links, and source filters.
  - component/route tests cover selected-date rendering and historical edit rules.

## Help / Guide Impact

Required because Habits date selection and support behavior change:

- update `docs/user-flow-map.md` with selected-day/week behavior and edit rules;
- update `docs/runbooks/auth-account-support.md` with support diagnosis for historical check-in correction;
- update parent/queue/design inventory with active Child C references.

## Route / Label / Support Surface Sweep

Required search terms:

- `/my-library/habits`
- `date=`
- `Week overview`
- `Previous week`
- `Next week`
- `Today`
- `selectedDate`
- `check_in_date`
- `Rest day`
- `Manual time`
- `Micro Sessions`
- `Dryland`
- `Swimming`
- `All`
- `work`
- `off-work`

Required surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- `docs/user-flow-map.md`

Sweep evidence:

- `2026-06-04`: searched `/my-library/habits`, `date=`, `Week overview`, `Previous week`, `Next week`, `Today`, `selectedDate`, `check_in_date`, `Rest day`, `Manual time`, `Micro Sessions`, `Dryland`, `Swimming`, `All`, `work`, and `off-work` across `app/`, `components/`, `lib/`, `tests/`, `docs/task-briefs/`, `docs/design/`, `docs/runbooks/`, and `docs/user-flow-map.md`.
- Fallout handled in this slice: route date loading, `HabitPerfectDayHub` calendar controls/history rules, shared `lib/my-library/calendar.ts` source/date contract, focused tests, user/support docs, parent queue, AW-006 queue, and notice/empty-state inventory.
- Intentional deferrals preserved: global My Library calendar storage, swim/dryland/micro planning, month/year dashboard, export, reminders/sound, analytics redesign, builder target semantics, and work/off-work context filters.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Content governance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Habits gets useful selected-day/week history without creating a competing global calendar.                                                                                | brief scope + UI tests + screenshots | `5/5`                   |
| UX flow clarity                               | `target`     | User can identify selected date, ISO week number/year, date range, previous/next week, Today, and whether the selected day is editable.                                   | component tests + screenshots        | `5/5`                   |
| Visual design quality                         | `target`     | Calendar controls and selected-day states fit mobile/desktop and preserve My Library token/action hierarchy.                                                              | screenshot handoff                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Past check-ins write the selected date; future dates are not selectable; setup edits stay on Today.                                                                       | route/component tests + diff review  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD, publish workflow, or operator queue changes.                                                                                           | explicit scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Date controls have accessible names, current-date/current-selection state, keyboard links/buttons, and visible focus.                                                     | component tests + screenshot QA      | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                   | component tests + screenshot QA      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency; avoid meaningful JS/CSS growth on `/my-library/habits`.                                                                               | diff review + targeted tests         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | URL-selected date, server-canonical check-ins, local timer recovery, and derived calendar labels are separated.                                                           | data contract + tests                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route remains dynamic and mutation snapshot freshness is unchanged.                                                                                      | diff review                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid/future dates fail safe to Today and historical setup changes cannot accidentally mutate definitions.                                                              | tests + support docs                 | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected route/API authz is unchanged; no new unauthenticated mutation path.                                                                            | route/API diff review                | `4/5`                   |
| Privacy and compliance                        | `target`     | No new logging/analytics/public exposure of private habit names, dates, quit goals, lapses, or check-ins.                                                                 | diff review + docs                   | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, inventory, support docs, and this child record the shared-calendar guardrail and H-ID status.                                                              | docs diff + brief lint               | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support diagnosis changes, but admin workflows/actions do not.                                                                                           | support docs diff                    | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and no public metadata, sitemap, robots, canonical URL, or structured data changes.                             | private-route rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, or AI-facing public copy.                                                                    | private-route rationale              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy/payload changes; future calendar analytics require explicit mapping.                                                                   | diff review                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow changes.                                                          | commerce scope rationale             | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs define historical check-in correction, Today-only setup changes, and selected-date diagnosis.                                                                | support docs diff                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation changes. | explicit finance scope rationale     | `N/A`                   |
| i18n operational readiness                    | `target`     | Date/range labels and source labels avoid tight fixed widths and keep mapping centralized.                                                                                | screenshots + tests                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, existing Habits loader/API, My Library tokens, lucide icons, and local tests; no dependency added.                                            | diff review                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused route/component/contract tests pass, changed briefs pass lint, and visual work gets screenshot handoff before broad gates.                                        | test commands + screenshots          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new storage, polling, per-day event duplication, or external calendar sync cost.                                                                      | diff review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Runtime diff has no migration/flag and rolls back by git revert; broad gates happen only after screenshot approval.                                                       | PR diff + gates after approval       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `/my-library/habits` and `HabitPerfectDayHub` after PR `#981`.
  - Keep the authenticated server route boundary.
  - Parse `date` in the route and pass the normalized selected date into `loadHabitSnapshot`.
  - Keep the client component responsible for calendar controls and transient UI only.
- TypeScript/domain contracts:
  - Add a small shared My Library calendar helper for filters, dates, ranges, and hrefs.
  - Preserve `HabitSnapshot`, `HabitDaySummary`, and `HabitCheckInRequestBody` semantics.
  - Invalid/future dates fail safe to Today.
- Supabase/data layer:
  - No migration.
  - Existing `habit_check_ins` owner-scoped unique date row remains the write contract.
- External services/tools:
  - No external calendar SDK, Google Calendar, Apple Calendar, reminder provider, sound library, or analytics vendor.
- UI system:
  - Reuse `fs-library-card`, `fs-cta-*`, `ui-field`, lucide icons, and mobile action layout rules.
  - Screenshot handoff type: `after/reference` against current Habits route states where practical.
- Testing:
  - Unit tests for calendar helper contract.
  - Route test for `date` loading.
  - Component tests for selected-day UI, historical edit rules, and selected-date check-in payloads.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Acceptance Criteria

1. `/my-library/habits?date=YYYY-MM-DD` loads that selected day when the date is valid and not future.
2. Invalid or future dates load Today and do not create future editable state.
3. Habits UI shows selected date, ISO week number/year, date range, previous/next week controls, Today, and selected day in the week strip.
4. Past selected days allow correcting eligible check-ins for existing habits.
5. Past selected days do not expose `Add habit`, `Edit`, or `Archive` setup actions.
6. Existing Habits API/storage/timer/rest/slip/cadence semantics remain unchanged.
7. Shared calendar source filters include `All`, `Habits`, `Micro Sessions`, `Dryland`, and `Swimming` without adding global calendar storage.
8. Focused tests pass and screenshot handoff is delivered before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/my-library-calendar.test.ts tests/unit/habits-page.test.tsx tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits.test.ts` - passed on `2026-06-04` (`4` files, `64` tests).
- `npm run typecheck` - passed on `2026-06-04`.
- `npm run lint:briefs` - passed/skipped on `2026-06-04` because the new active brief is still untracked before commit.
- `npm run lint:briefs:all` - passed on `2026-06-04`, including this active brief.
- `git diff --check` - passed on `2026-06-04`.

After owner screenshot approval:

- Owner approved the screenshot handoff in chat on `2026-06-04`.
- `npm run verify:pre-pr` - passed on `2026-06-04` in full lane:
  - branch current with `origin/main@6ef89bd`;
  - quality gates passed;
  - unit suite passed (`226` files, `1345` tests);
  - production build passed;
  - perf budgets passed;
  - Playwright passed (`106` passed, `530` skipped by existing environment/auth gating).
- PR creation/update and `npm run verify:pre-merge` remain pending.

Screenshot handoff evidence:

- `output/aw006-habits-child-c-2026-06-04-160424`
- `Captured: 2026-06-04 16:04`
- Files:
  - `after-habits-calendar-today-desktop.png`
  - `after-habits-calendar-history-desktop.png`
  - `after-habits-calendar-today-mobile-active-week.png`
  - `after-habits-calendar-history-mobile-active-week.png`
- Capture method: temporary deterministic local route rendered production-like `/my-library/habits` route shell, `SiteChrome`, and `HabitPerfectDayHub` with representative Today/history snapshots; the temporary route was removed after capture.
- Mobile capture caveat: global fixed mobile nav and Next dev overlay were hidden via capture-only CSS so the changed Habits calendar controls and week labels are visible in the artifact.
- No final product-rendering files were changed after the final screenshot capture; only the temporary capture route was removed and this brief evidence was updated.

## Checkpoint Log

- `2026-06-04 | in-progress | created Child C brief on branch aw-006-habits-history-calendar after owner approved the shared-calendar guardrail; scope is thin My Library calendar contract plus Habits selected-day/week history as first consumer | next: implement helper/route/component/docs/tests, then screenshot handoff before pre-PR gate`
- `2026-06-04 | in-progress | implemented shared calendar helper, Habits route date normalization, selected-day/week controls, historical edit rules, focused tests, and support/queue docs; targeted Vitest passed | next: run brief/diff validation, capture screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-06-04 | validation | targeted Vitest, typecheck, lint:briefs/all, and git diff --check passed before screenshot capture; lint:briefs skipped the new untracked brief as expected, so lint:briefs:all was used as the hard brief validation | next: capture screenshot handoff and wait for owner approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot-handoff | captured after-only desktop/mobile Today/history screenshots in output/aw006-habits-child-c-2026-06-04-154710 using a temporary deterministic production-component harness that was removed after capture; mobile artifacts hide only global fixed nav/dev overlay so calendar controls and week labels are inspectable | superseded by owner-correction refresh`
- `2026-06-04 | owner-correction | owner requested week number/year and confirmed week/month/year comparison should become a separate future calendar brief; added ISO week/year to the shared calendar contract and recorded period comparison as planned system-calendar follow-up | next: regenerate screenshot handoff with corrected production-like mobile shell before npm run verify:pre-pr`
- `2026-06-04 | screenshot-refresh | regenerated after-only desktop/mobile Today/history screenshots in output/aw006-habits-child-c-2026-06-04-160424 with ISO Week 19, 2026 labels and a production-like mobile active shell that does not show the route-level Back to My Library action; temporary harness removed after capture | next: owner visual approval before npm run verify:pre-pr`
- `2026-06-04 | pre-pr | owner approved screenshot handoff; npm run verify:pre-pr passed in full lane with quality gates, unit suite, build, perf budgets, and Playwright public matrix | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge`
