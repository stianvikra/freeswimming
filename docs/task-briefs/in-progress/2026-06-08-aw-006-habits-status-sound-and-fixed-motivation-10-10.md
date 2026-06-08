# Task Brief: AW-006 Habits Status, Sound, And Fixed Motivation (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-habits-status-sound-and-fixed-motivation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-status-sound-motivation`
- `execution_mode`: `end-to-end after explicit owner "kjor pa" approval`
- `target_findings`: `H-053`, `H-054`, `H-055`, `H-056`, `H-057`, `H-058`

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@605a28ca`
- `audit_status`: `ready`
- `decision`: Execute one combined Habits slice for fixed Motivation periods, truthful header status, improved target/completion sound, and timed target signal behavior.
- `reason`: Code audit found Motivation still uses rolling `Last 7/30/90/180/365 days` labels and rolling start dates; Habits header `x/y on target` reads like all habits but is only today's Perfect Day count; `softSuccessChime` is long/quiet/ambient; timed target crossing auto-saves enough timer seconds to mark the habit complete instead of only pausing/signalling.
- `must_refresh_before_execution_if`: Refresh if `lib/habits/shared.ts`, `lib/habits/server.ts`, `lib/audio/client-sound.ts`, `HabitPerfectDayHub`, Habits tests, Calendar Comparison stats, reset-boundary behavior, local timer persistence, selected-date/timezone contracts, scorecard categories, screenshot handoff rules, or validation lanes change before completion.

## Goal

Make Habits status and motivation trustworthy by using fixed fresh-start Motivation periods, showing Today/Week/Month status truthfully, replacing the current ambient sound with a short positive ding, and making timed targets signal/pause without auto-completing the habit.

## Pre-Implementation Owner Explanation

Vi samler statuslinje, motivasjonsperioder, lyd og timed target-adferd i en Habits-endring. Appen skal vise riktigere status, bruke faste perioder for motivasjon, gi et kort positivt signal naar et tidsmaal naas, og ikke fullfore pusting/timed habits for brukeren selv gjor det.

Hvorfor det betyr noe: Habits maa folels paalitelig. Naar appen viser feil periode, feil status eller fullforer noe brukeren bare har naadd minimumstid paa, mister brukeren kontroll.

Utenfor scope er databaseendringer, Micro Sessions-layout, nye grafer, reminders/notifications, eksport, bred Habits-redesign og merge uten eksplisitt owner-godkjenning.

Fremoverkompatibilitet: nye Motivation ranges, cadence-perioder, timer-kilder, sound-profiler og statuslabels maa gaa gjennom typed contracts/view-model helpers med fail-closed fallback for ukjente verdier.

## Product Decisions

- `Week` Motivation means the current ISO-style week, Monday through Sunday, containing the selected date.
- `Month` Motivation means the current calendar month containing the selected date.
- `3 months` becomes a fixed current-quarter concept with a visible `Quarter` or `This quarter` label.
- `6 months` becomes a fixed current half-year concept with a visible `Half-year` or `This half-year` label.
- `Year` remains a fixed current calendar year unless the implementation audit proves it must be deferred.
- Rolling 7/30/90/180/365-day windows are out of scope for Motivation and may return only as a separate Trends/History view.
- `Slips` are counted only inside the selected fixed period and must not count future scheduled days.
- Timed target crossing is local feedback: pause the running timer and play the enabled sound. It must not create or update the server-canonical check-in and must not mark the habit complete.
- Completing/saving a timed habit remains an explicit user action through `Finish` or manual time save.
- Habit sound remains local-only, opt-in, default off, and fail-soft if browser audio or localStorage is blocked.
- The Habits header should distinguish today's Perfect Day status from period target status: `Today: x/y` plus `Week: a/b` and/or `Month: c/d` only when active weekly/monthly habits exist for the selected period.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Testing and QA automation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                            | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Habits Motivation and header status read as fresh-start, truthful progress states rather than rolling analytics or ambiguous all-habit counts.                                                | UI labels + component tests + screenshot handoff | `5/5`                   |
| UX flow clarity                               | `target`     | Timed target crossing gives signal/pause without completing; range controls and header status make Today/Week/Month/Quarter/Half-year meaning clear.                                          | component tests + screenshot handoff             | `5/5`                   |
| Visual design quality                         | `target`     | Header status text fits mobile/desktop Habits layout and range labels remain scan-friendly without broad redesign.                                                                            | screenshot artifacts                             | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fixed period start/end boundaries are deterministic, reset-aware, timezone-safe for selected dates; timed target signal creates no check-in; Week/Month counts use existing cadence progress. | domain/component tests                           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                                                    | admin-editor scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Sound controls, status text, progressbars, and range controls keep accessible names/states and readable labels.                                                                               | component tests + markup review                  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No new dependency or heavier query; calculations remain in existing loaded Habits/check-ins helpers.                                                                                          | package/query diff review                        | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Motivation/header status are derived view-model state; check-ins remain server-canonical; running timer and sound preference remain local-only until explicit save.                           | data contract + tests                            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing Habits load/cache behavior remains unchanged; explicit save paths keep existing snapshot refresh.                                                                                    | route diff review                                | `4/5`                   |
| Reliability and failure handling              | `target`     | Unknown ranges fail closed to known defaults; audio failures do not block work; target signal cannot repeatedly fire or write unintended completion.                                          | negative-path/component tests                    | `5/5`                   |
| Security and authz                            | `supporting` | No protected route/authz change; existing owner-scoped data reads/writes remain.                                                                                                              | API diff review                                  | `4/5`                   |
| Privacy and compliance                        | `target`     | No private habit names/notes/check-ins added to logs or analytics; audio/local timer state stays local-only.                                                                                  | code review                                      | `5/5`                   |
| Content governance                            | `target`     | Parent, child, docs, tests, and PR body agree on fixed-period semantics, timed target signal behavior, and deferred rolling trends.                                                           | docs diff + brief lint                           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, role-gated CRUD, audit trail, or operator editability surface.                                                                              | admin-workflow scope rationale                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Habits is authenticated/private and no public metadata, sitemap, robots, canonical URL, or structured data changes.                                                               | private-route rationale                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity, structured data, AI-facing page copy, or public docs surface.                                                                           | AI scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Existing analytics remain unchanged; no new event payload values are introduced unless implementation audit proves otherwise.                                                                 | analytics no-new-event rationale                 | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, billing, invoice, payout, or revenue flow.                                                                                | commerce scope rationale                         | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs can explain fixed Motivation boundaries, why timed target signal is not completion, and how sound preference behaves.                                                            | support/user-flow updates                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance provider data, billing records, reports, payouts, entitlements, or reconciliation surfaces change.                                                       | finance scope rationale                          | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels avoid fixed-width English assumptions and can later be localized as period concepts/status fragments.                                                                                  | component tests + screenshot review              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Habits domain helpers, selected-date utilities, local sound module, and tests; add no dependency.                                                                              | code/package diff                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component tests cover fixed boundaries, labels, slips, target signal without auto-save, sound profile, and header Week/Month status.                                                     | targeted tests + gates                           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | No new storage/event volume; calculations stay bounded to existing loaded check-ins.                                                                                                          | diff review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Runtime-only rollback is normal git revert; no migration rollback required.                                                                                                                   | pre-pr/pre-merge gates                           | `5/5`                   |

## Stack / Data / Identity / Forward Compatibility

Reference surfaces are `lib/habits/shared.ts`, `lib/habits/server.ts`, `lib/audio/client-sound.ts`, and `components/my-library/habits/HabitPerfectDayHub.tsx`.

- React/Next.js:
  - Reuse `HabitPerfectDayHub` as the mature Habits renderer.
  - Preserve `/my-library/habits` authenticated route boundaries.
  - Keep header status and Motivation range labels in local view-model helpers rather than scattered JSX.
- TypeScript/domain contracts:
  - `HabitMotivationRange`, cadence helpers, timer helpers, `HabitDayItem`, and `HabitMotivationSummary` remain the typed contracts.
  - Unknown ranges/statuses must not count as done or target-met.
- Supabase/data:
  - No schema migration or RLS change.
  - Habit definitions, check-ins, reset events, and explicit `Finish`/manual saves remain server-canonical.
- Local data:
  - Running/paused timer state remains local-only until explicit save.
  - Target-reached signal state remains local-only per selected date/habit/target.
  - Sound preference remains local-only and default off.
- Sync/failure:
  - Timed target crossing pauses local timer and plays optional sound without fetch.
  - Browser audio/localStorage failures fail softly and must not block logging.
  - Explicit saves keep existing mutation/snapshot refresh behavior.
- Identity:
  - Habit row IDs remain canonical.
  - Habit titles remain editable user labels.
  - Period labels, sound profile names, and status fragments are not identity.
- Forward compatibility:
  - Future Motivation ranges require typed range values, labels, period-boundary helpers, tests, support copy, and safe fallback.
  - Future cadence periods or target status lines require explicit mapping for header summaries.
  - Future sound profiles require tests for duration/volume/frequency bounds and opt-in behavior.
  - Rolling analytics must use a future `Trends`/`History` label so Motivation stays fresh-start oriented.

## Scope And Acceptance

Update the active Habits surface and domain helpers so:

1. `Week` Motivation starts Monday and ends Sunday around the selected date.
2. `Month` Motivation starts on day 1 and ends on the last day of the selected month.
3. Quarter starts on the current calendar quarter boundary and labels no longer say `3 months` / `Last 90 days`.
4. Half-year starts Jan 1 or Jul 1 depending on selected date and labels no longer say `6 months` / `Last 180 days`.
5. `Year` uses the current calendar year or is explicitly deferred with tests/docs if not kept.
6. `Slips`, rest days, perfect days, and per-habit Motivation stats use the same fixed selected period and never count future days.
7. Reset boundaries still clamp Motivation stats without deleting earlier history.
8. Timed target crossing pauses the local timer and plays the enabled sound, but does not call the check-in API, does not clear local timer state as saved completion, and does not move the row to `Done today`.
9. The user can still explicitly `Finish` to save timed progress/completion.
10. Sound profile becomes a short positive ding-style profile, louder than the current ambient chime but still non-harsh and opt-in.
11. Habits header status distinguishes `Today` from active weekly/monthly target status and only shows Week/Month fragments when such active habits exist.
12. Relevant support/user-flow docs and parent/queue checkpoint are updated.
13. Relevant targeted tests pass before screenshot handoff.

## Out Of Scope

Micro Sessions mobile UI, linked-Habit card/CTA behavior, schema migrations, rolling trend dashboards, graph dependencies, exports, reminders, notification APIs, user-selected/uploaded sounds, server-stored sound preferences, public pages, commerce, unrelated Calendar Comparison redesign, broad Habits redesign, and merge without owner approval.

## Help / Guide / Support Impact

Required because visible labels, sound behavior, and timer completion semantics change:

- update `docs/user-flow-map.md` for fixed Motivation periods, header status, sound profile behavior, and timed target signal semantics;
- update relevant support/runbook content if it currently says timed target auto-completes or `Last` rolling Motivation windows.

## Route / Label / Support Sweep

Required before broad gates because this changes visible labels and support-sensitive workflow semantics.

Minimum search terms: `/my-library/habits`, `HabitPerfectDayHub`, `Last 30 days`, `Last 90 days`, `Last 180 days`, `3 months`, `6 months`, `on target`, `Completion saved`, `Finish`, `timer target`, `softSuccessChime`, `Sound`, `Motivation`, `Slips`.

Minimum surfaces: `app/`, `components/`, `lib/habits/`, `lib/audio/`, `tests/`, `docs/task-briefs/`, `docs/runbooks/`, `docs/user-flow-map.md`.

Route-label-support-surface-impact-sweep evidence: identifiers searched included `/my-library/habits`, `HabitPerfectDayHub`, `Last 30 days`, `Last 90 days`, `Last 180 days`, `3 months`, `6 months`, `on target`, `Completion saved`, `Finish`, `timer target`, `softSuccessChime`, `Sound`, `Motivation`, and `Slips`. Surfaces checked included `app/`, `components/`, `lib/habits/`, `lib/audio/`, `tests/`, `docs/task-briefs/`, `docs/runbooks/`, and `docs/user-flow-map.md`. Fallout handled in the active component, domain helpers, audio helper, targeted tests, parent/queue/inventory docs, user-flow map, and support runbook; remaining legacy `softSuccessChime` references are intentional because Micro Sessions/shared surfaces still use that profile, and remaining historical `3 months` / `6 months` references are outside the active Habits Motivation label contract.

## Screenshot Handoff

Required because the Habits header/status and Motivation range controls are visible UI.

- Capture after/reference or after-only screenshots for desktop and mobile `/my-library/habits`.
- Include Motivation range controls and Habits header status in at least one artifact.
- Stop for owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

Owner screenshot approval stop completed on 2026-06-08 after artifacts were captured at `output/aw006-habits-status-sound-motivation-2026-06-08-170538`.

## Validation

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/client-sound.test.ts tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx`
- `npm run typecheck`
- `git diff --check`
- screenshot handoff + owner approval
- `npm run verify:pre-pr`
- CI required checks
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-08 | planned | created as sibling child after owner chose fixed fresh-start Motivation periods and asked to check slips; execution waited until Child P closeout | next: refresh audit when selected`
- `2026-06-08 | in-progress | owner asked to combine fixed Motivation periods, Habits header status, sound profile, and timed target signal behavior into one recommended slice; branch aw-006-habits-status-sound-motivation started from clean main@605a28ca; fresh code audit found rolling range starts/labels, ambiguous x/y on target copy, ambient softSuccessChime, and timed target auto-save/full completion | next: update parent/queue, implement scoped runtime/tests/docs, then screenshot handoff before broad gates`
- `2026-06-08 | in-progress | scoped runtime/tests/docs implemented; targeted Vitest, typecheck, diff check, and full brief lint passed; screenshot artifacts captured at output/aw006-habits-status-sound-motivation-2026-06-08-170538 and owner approved visual handoff | next: run npm run verify:pre-pr, then commit/push/open PR and continue merge gates`
- `2026-06-08 | in-progress | npm run verify:pre-pr passed full lane: quality gates, lint, typecheck, 1441 unit tests, build, performance budgets, and 106 E2E passed with 530 skipped in safe public env | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
