# Task Brief: AW-006 Habits Date And Motivation Clarity (10/10)

## Metadata

- `id`: `2026-06-06-aw-006-habits-date-motivation-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-06`
- `updated`: `2026-06-06`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `execution_mode`: `end-to-end until required screenshot approval stop`

## Brief Audit Record

- `last_audited`: `2026-06-06`
- `base`: `main@1beeed8a`
- `audit_status`: `ready`
- `decision`: Execute as a focused Habits clarity slice before any Child K reset implementation.
- `reason`: Owner found that the Habits selected date and Motivation history range are unclear on mobile, and that top-level Motivation must use perfect-day streaks instead of ambiguous aggregate labels or black-box score.
- `must_refresh_before_execution_if`: Refresh if Habits selected-date routing, `HabitPerfectDayHub`, Habits motivation summary helpers, AW-006 parent scope, screenshot handoff rules, or scorecard categories change before execution.

## Goal

Make Habits clearly show the active logging date and make Motivation stats understandable with selectable time ranges and inline definitions.

## Pre-Implementation Owner Explanation

Vi gjør en liten Habits-forbedring som viser hvilken dato du logger på, lar Motivation bytte mellom uke, måned, 3 måneder, 6 måneder, år og all historikk, og gjør top-level Motivation til perfect-day streaks i stedet for utydelige samleord eller score.

Hvorfor det betyr noe: på telefon skal du raskt vite om du logger på riktig dag, og Motivation skal føles som nyttig status, ikke tekniske tall.

Utenfor scope: `Reset these habit stats` reset, sletting av historikk, nye databasefelter, reminders, eksport, full dashboard/graf-redesign og Calendar Comparison-endringer.

Fremoverkompatibilitet: periodefilteret og datoetiketten skal følge eksisterende `selectedDate` og canonical Habits snapshot-data. Nye aktive Perfect Day habits og check-in-rader skal automatisk inngå i perfect-day streak/consistency; nye ukjente metric-typer krever eksplisitt mapping/copy/test.

## Scope

- Show selected Habits date in the top Habits header/action area, including a clear Today distinction.
- Add Motivation range controls: `Week`, `Month`, `3 months`, `6 months`, `Year`, `All`.
- Default Motivation to `Month`; label `All` explicitly as all-time.
- Rename/reshape the stats toggle so it reads as `Stats` with a chevron and uses full-width mobile behavior when appropriate.
- Make top-level Motivation streaks mean perfect-day streaks: days where every scheduled Perfect Day habit was completed.
- Remove visible `Habit score` and `On track` copy from the Habits Motivation UI.
- Add a compact `What counts?` disclosure that defines perfect-day streak, best perfect-day streak, perfect days, consistency, and rest days.
- Update component tests and user/support docs for the new visible behavior.
- Capture screenshot handoff before broader PR gates.

## Out Of Scope

- Per-habit `Reset these habit stats` reset implementation.
- Persisted user preference for Motivation range.
- Database, Supabase migration, RLS, generated database type, or API contract changes.
- Calendar Comparison metric/marker changes.
- New analytics events, graphs, exports, reminders, notification APIs, or archived restore/edit.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Habits top area shows the selected date on desktop and mobile without requiring Week overview or Calendar.
2. Today is visually and textually clear when selected; non-today dates show the selected date and keep the existing Today control available.
3. Motivation defaults to `Month` and can switch to `Week`, `3 months`, `6 months`, `Year`, and `All` without changing persisted data.
4. Motivation range copy explains whether the visible stats are period-limited or all-time.
5. Stats toggle uses clear `Stats` naming and is mobile-width-safe.
6. `What counts?` disclosure defines the visible metrics in plain language and avoids black-box score or ambiguous aggregate labels.
7. Existing Habits logging, date navigation, correction, sound, timed/manual, and archived-history behavior stay unchanged.
8. Responsive screenshots prove top date, Motivation range controls, Stats disclosure, and mobile layout.

## Data Placement And Sync Contract

- Server-canonical data:
  - unchanged `habit_definitions` and `habit_check_ins`;
  - unchanged route-selected `selectedDate`.
- Local data:
  - Motivation open/closed state;
  - `What counts?` disclosure state owned by browser DOM only;
  - selected Motivation range in component state only, not persisted.
- Derived view-model:
  - period-limited Motivation summary is derived from existing canonical snapshot items and dates;
  - top-level streak/consistency uses active Perfect Day habits and existing check-ins for the selected period;
  - `All` preserves existing full-summary behavior.
- Sync policy:
  - date navigation still refreshes through existing URL/snapshot boundaries;
  - range switching is local presentation over already loaded summary data.
- Cache/invalidation:
  - no route cache, API, or mutation invalidation behavior changes.

## Identity And Rename Contract

N/A: this slice changes no persisted entity identity, route param, slug, analytics identifier, or operator-visible stable ID. Habit titles remain display-only and existing habit IDs stay canonical.

## Forward Compatibility Contract

- Automatically supported:
  - new habits and archived habits already present in the canonical Habits snapshot;
  - selected-date URL changes;
  - longer localized date and metric labels within the responsive layout.
- Requires explicit mapping:
  - new Motivation metric types;
  - new habit status/mode labels that need user-facing definitions;
  - future persisted range preference or analytics taxonomy.
- Safe fallback:
  - unsupported or missing summary data hides Motivation as today;
  - range calculations clamp to available `historyStartDate`/`historyEndDate`;
  - unknown future check-in statuses continue to fail closed through existing helpers.
- Test/evidence:
  - component tests cover date label, range default/switching, all-time copy, and definitions disclosure.

## Help / Guide Impact

Required:

- update `docs/user-flow-map.md` with selected-date and Motivation range behavior;
- update `docs/runbooks/auth-account-support.md` so support can explain Motivation periods and perfect-day streaks.

## Route / Label / Support Surface Sweep

Required before broad gates:

- `/my-library/habits`
- `Today`
- `Stats`
- `What counts?`
- `Perfect-day streak`
- `Perfect days`
- `Habit score`
- `On track`
- `Month`
- `3 months`
- `6 months`
- `Year`
- `All`
- `Progress summary`
- `Motivation`

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `lib/habits/shared.ts` only if helper behavior must change
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent/AW-006 queue/design inventory only if scope state changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Testing and QA automation`
- `i18n operational readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                             | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits must clearly show the active logging date and make Motivation ranges/perfect-day streaks understandable without opening Calendar.       | component tests + screenshots                       | `5/5`                   |
| UX flow clarity                               | `target`     | User can identify Today vs selected date, choose a Motivation range, and read perfect-day metric definitions from the same surface.            | component tests + screenshot handoff                | `5/5`                   |
| Visual design quality                         | `target`     | Date label, range controls, Stats toggle, and disclosure match existing Habits tokens and do not overflow mobile/desktop.                      | responsive screenshots + text-fit review            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Range switching derives perfect-day streaks from existing snapshot data and does not mutate check-ins, definitions, URL date, or server state. | unit/component tests + diff review                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, admin CRUD, publish workflow, operator queue, or admin action surface.                               | explicit admin-editor scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Range controls, Stats toggle, and What counts disclosure are keyboard/screen-reader usable with clear names and states.                        | Testing Library assertions + screenshot/manual QA   | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: local range filtering must not add dependencies, network reads, polling, or heavy client payloads.                            | build/perf gate + diff review                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Selected range is local presentation state; selected date and check-ins remain canonical through existing Habits snapshot.                     | brief contract + component tests                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache or invalidation behavior changes; existing Habits route freshness stays in place.                                    | diff review                                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing Motivation summary still hides the section; range math clamps to available history without impossible ranges.                          | component tests + helper review                     | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no new protected route or mutation; existing private Habits route/auth stays unchanged.                                       | diff review                                         | `4/5`                   |
| Privacy and compliance                        | `target`     | No habit names, notes, private reasons, or raw history are added to logs/events; definitions use generic copy only.                            | diff/analytics review                               | `5/5`                   |
| Content governance                            | `target`     | Brief, user-flow map, and support runbook describe the date/range/definition contract.                                                         | docs diff + `npm run lint:briefs`                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, role-gated CRUD, admin recovery action, or operator editing surface.                        | explicit admin-workflow scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this changes no public metadata, sitemap, robots, canonical URL, or schema.      | private-route SEO rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, public semantic page copy, structured data, or AI-facing public docs surface.      | AI-discoverability scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics event; existing events must remain unchanged and private-safe.                                               | analytics diff review                               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                          | commerce scope rationale                            | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs must explain selected date, Motivation ranges, and perfect-day streaks without exposing private habit names or notes.             | support doc diff                                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement, or revenue op.   | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `target`     | Date/range labels and metric definitions tolerate longer future localized strings without layout breakage on mobile.                           | responsive screenshots + component assertions       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, existing Habits view-models, icons/tokens, and current test stack; add no dependency.                              | code/dependency diff review                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover selected date label, range controls, default Month behavior, All copy, Stats toggle, and What counts disclosure.                   | targeted Vitest + broad gates after visual approval | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: range filtering stays bounded to already loaded summary items and does not add unbounded server queries.                      | implementation review                               | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is code-only; no migration/data cleanup required.                                                                    | pre-PR/pre-merge gates after screenshot approval    | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `HabitPerfectDayHub` and the existing Habits snapshot contract;
  - keep new controls inside the existing client component;
  - do not add route/API/cache behavior.
- TypeScript/domain contracts:
  - use typed range options and deterministic date helpers;
- derive period summaries from existing `HabitMotivationSummary`/items;
- keep top-level streaks tied to perfect-day completion, not the largest single-habit streak;
  - keep unknown check-in status fail-closed behavior unchanged.
- Supabase/data layer:
  - N/A for this slice; no migration, RLS, generated DB types, or persisted values.
- External services/tools:
  - N/A; no external SDK/service.
- UI system:
  - reuse Habits buttons, chips, panels, icons, spacing, and mobile action layout;
  - screenshot handoff is `before/after` if practical.
- Testing:
  - update focused component tests and run targeted Vitest before screenshot handoff.

## Validation

Before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx` - pass
- `./node_modules/.bin/vitest run tests/unit/habits-page.test.tsx tests/unit/habits.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx` - pass after mobile active spacing fix
- `npm run lint:briefs:all` - pass
- `npm run typecheck` - pass
- `npm run lint -- --max-warnings=0 app/my-library/habits/page.tsx tests/unit/habits-page.test.tsx components/my-library/habits/HabitPerfectDayHub.tsx lib/habits/shared.ts lib/habits/server.ts tests/unit/habits.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx` - pass
- Failure-mode evidence: no mutation route, API handler, database write, authz branch, or error-response code changed; `lib/habits/server.ts` only adds derived read-only Motivation range summaries to existing snapshot assembly, so there is no new unexpected 500 path.
- Route/label/support sweep identifiers searched: `Today`, `Stats`, `What counts?`, `Perfect-day streak`, `Perfect days`, removed `Habit score`/`On track`, `Week`, `Month`, `3 months`, `6 months`, `Year`, `All`, `Progress summary`, and `Motivation`.
- Route/label/support surfaces checked: `app/my-library/habits/page.tsx`, `components/my-library/habits/HabitPerfectDayHub.tsx`, `lib/habits/shared.ts`, `lib/habits/server.ts`, `tests/unit/habits-page.test.tsx`, `tests/unit/habit-perfect-day-hub.test.tsx`, `tests/unit/habits.test.ts`, `tests/unit/habits-server.test.ts`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, AW-006 queue, parent brief, planned Child K brief, and design inventory; fallout handled in the same diff.
- Route/label/support sweep result: pass; old removed labels remain only in negative test assertions and this brief's removal scope notes.

After owner screenshot approval and before PR update:

- `npm run verify:pre-pr` - pass; full lane selected and completed lint, typecheck, unit, build, perf budgets, and E2E (`106` passed, `530` skipped).

Before merge:

- required CI checks green - pass for PR `#1005`: `Analyze (javascript-typescript)`, `CodeQL`, `Vercel`, `Vercel Preview Comments`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`, `size-check`, and `verify`
- `npm run verify:pre-merge` - pass; full lane selected and completed lint, quality gates, typecheck, unit, build, perf budgets, and E2E (`106` passed, `530` skipped)

## Screenshot Requirements

Required because this changes visible Habits UI.

Handoff must include:

- desktop Habits top/date and Motivation controls;
- mobile Habits top/date and Motivation controls;
- `What counts?` disclosure;
- clickable `Screenshot artifacts` folder link and `Captured: YYYY-MM-DD HH:MM`;
- explicit note that reset and persisted data were not changed.

Screenshot handoff evidence:

- `Captured`: `2026-06-06 22:22`
- `Artifacts`: `output/habits-date-motivation-clarity-2026-06-06-222249`
- `Type`: `after`
- `Files`: `after-habits-date-motivation-desktop.png`, `after-habits-what-counts-desktop.png`, `after-habits-active-mobile.png`, `after-habits-stats-mobile.png`
- `Status`: approved by owner in chat on `2026-06-06`; owner explicitly waived new screenshots after the mobile active top-spacing fix.

## Checkpoint Log

- `2026-06-06 | in-progress | owner approved Habits date + Motivation clarity as a 10/10 slice; created in-progress brief on branch aw-006-habits-date-motivation-clarity | next: implement focused UI, tests, docs, targeted QA, then screenshot handoff approval stop`
- `2026-06-06 | screenshot approval stop | implemented selected-date chip, Motivation range controls, Stats disclosure, What counts definitions, perfect-day top-level Motivation summaries, tests, and docs; targeted Vitest, lint:briefs:all, typecheck, ESLint, and route/label/support sweep passed; screenshot artifacts captured in output/habits-date-motivation-clarity-2026-06-06-222249 | next: owner visual approval, then npm run verify:pre-pr`
- `2026-06-06 | visual approved | owner approved screenshots, flagged excess mobile active top spacing, approved no new screenshot, and approved merge on good tests; mobile active route padding reduced while desktop route spacing remains unchanged; targeted page/component/domain tests, typecheck, and targeted ESLint passed | next: npm run verify:pre-pr`
- `2026-06-06 | pre-pr green | npm run verify:pre-pr passed full lane, including E2E 106 passed / 530 skipped | next: commit, push, open PR, monitor CI, then npm run verify:pre-merge`
- `2026-06-06 | merged | PR #1005 merged as squash commit 7e4062a1 after CI and npm run verify:pre-merge passed | next: repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-06-06`
- `merged_pr`: `#1005`
- `squash_commit`: `7e4062a1`
- `result`: Closed AW-006 Habits Date And Motivation Clarity. Habits now shows the selected logging date at the Habits heading, defaults Motivation to Month, offers fast range choices, uses `Stats` and `What counts?`, and frames top-level motivation around perfect-day streaks, perfect days, and consistency instead of unclear score or aggregate labels.
- `validation`: Targeted Vitest, targeted ESLint, typecheck, `npm run lint:briefs:all`, owner-approved screenshot handoff, `npm run verify:pre-pr`, PR #1005 CI, and `npm run verify:pre-merge` all passed.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                               | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | Selected-date chip, Month default, range controls, tests, screenshots, PR `#1005`, and pre-merge pass. | None.        |
| UX flow clarity                               | `5/5`          | `Stats`, `What counts?`, perfect-day copy, owner screenshot approval, and component tests.             | None.        |
| Visual design quality                         | `5/5`          | Responsive screenshot handoff and mobile active spacing fix approved by owner.                         | None.        |
| Business logic correctness and data integrity | `5/5`          | Read-only range summaries, perfect-day calculations, no mutation/schema changes, and unit tests.       | None.        |
| Accessibility (a11y)                          | `5/5`          | Keyboard/screen-reader named controls covered by Testing Library and full gates.                       | None.        |
| Data placement and sync boundaries            | `5/5`          | Range stays local presentation state; selected date/check-ins remain existing canonical snapshot data. | None.        |
| Reliability and failure handling              | `5/5`          | Missing summaries fail closed, range math clamps to available history, and no new unexpected 500 path. | None.        |
| Privacy and compliance                        | `5/5`          | No new logging/events and only generic metric definition copy added.                                   | None.        |
| Content governance                            | `5/5`          | User-flow map, support runbook, parent/queue brief, active brief, and closeout updated.                | None.        |
| Incident response and support operations      | `5/5`          | Support docs explain selected date, ranges, and perfect-day metrics without private habit details.     | None.        |
| i18n operational readiness                    | `5/5`          | Responsive controls tolerate longer future labels and tests assert visible control names.              | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused `HabitPerfectDayHub` and existing Habits view-models; no dependency added.                      | None.        |
| Testing and QA automation                     | `5/5`          | Targeted unit/component tests plus `verify:pre-pr`, CI, and `verify:pre-merge` passed.                 | None.        |
