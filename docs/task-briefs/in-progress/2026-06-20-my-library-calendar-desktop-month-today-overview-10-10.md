# Task Brief: My Library Calendar Desktop Month Overview And Today Marker (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-desktop-month-today-overview-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `B`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@9aeafba7`
- `audit_status`: `execution_started_after_child_a`
- `decision`: Execute after Child `A` shipped planned workout instances and the Calendar route with `Plan` mode.
- `reason`: The month overview should reuse `planned_workout_instances` instead of deriving calendar dates from labels or duplicating planned-session identity.
- `must_refresh_before_execution_if`: Refresh if Child `A` changes `planned_workout_instances`, `/my-library/calendar`, calendar helper contracts, program/workout identity, route labels, screenshot rules, or the parent capability matrix.

## Goal

Add a desktop month overview with a clear today marker, `Previous`/`Today`/`Next` navigation, and selected-day detail panel while preserving mobile week/day readability.

## Pre-Implementation Owner Explanation

Codex skal gjøre kalenderen mer lik Garmin på desktop: en måned skal kunne skannes raskt, dagens dato skal være tydelig, og en valgt dag skal vise detaljene uten at månedscellene blir fulle av knapper. Dette betyr bedre oversikt over kommende planlagte økter. Utenfor scope er markering som utført, Garmin-sync, micro sessions, habits, Perfect Day og endring av planinstanser.

## Scope

- Add `view=plan` support for desktop month overview when viewport/layout allows it.
- Use a wider Calendar-only app workspace on Plan and add a Garmin-style `Week total` column after Sunday for every visible calendar week.
- Mark today using deterministic calendar helpers, not a hardcoded date.
- Add a `Today` action that returns the selected date to today.
- Keep mobile week/day-first so buttons and text remain readable.
- Add selected-day detail for planned swim sessions using `planned_workout_instances`.
- Preserve compare-backed `Stats` behavior and current authenticated route boundary.
- Defer a shared app workspace width standard for other routes to `docs/task-briefs/planned/2026-06-20-app-workspace-width-standard-10-10.md`.
- Add responsive screenshots before PR gates.

## Out Of Scope

- Completion mutation, `mark done`, `skipped`, `missed`, or `rescheduled` actions.
- Editing plan instances from the month cells.
- Drag/drop, date moves, and reschedule/undo behavior; defer to a separate child after the read-only month overview is stable.
- Micro sessions, habits, Perfect Day, Garmin, AI planning, recurrence, or provider sync.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical: `planned_workout_instances`, programs, workouts.
- Local/URL state: selected date, month/week mode, selected day, filters.
- Today source: injected/current local date normalized through shared helpers; tests must use deterministic dates.
- Sync behavior: month/day detail refreshes from planned instances after program save/edit/delete through the authenticated dynamic calendar route.

## Identity And Forward Compatibility Contract

- Month cells must key sessions by `planned_workout_instances.id`, not title or displayed date text.
- New planned workouts should appear automatically when Child `A` materializes them.
- Future layers must be additive to the month/day renderer and hidden until explicitly mapped.
- Unknown planned statuses render as unmapped/review states and do not count as completed.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                         | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Desktop users can scan a month, identify today, open day detail, and still access week/day planning.                   | route/component tests + screenshot handoff  | `5/5`                   |
| UX flow clarity                               | `target`     | Today, selected day, selected month, and empty days are visually distinct without explanatory docs.                    | screenshots + component tests               | `5/5`                   |
| Visual design quality                         | `target`     | Month grid reuses My Library tokens, avoids crowded month cells, and keeps actions in day detail.                      | responsive screenshot handoff               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Month/day sessions resolve from `planned_workout_instances.id` and deterministic date helpers.                         | loader/view-model tests                     | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an end-user My Library calendar view and no admin editor changes.                                  | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Keyboard and screen-reader users can switch months, jump to today, select days, and inspect sessions.                  | a11y tests + keyboard QA                    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library/calendar` stays within route budgets and avoids loading data outside the visible month/detail window.     | bundle/load review + `verify:pre-pr`        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Month and selected-day state remain URL/local; planned session truth stays server-canonical.                           | data contract + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar month reads refresh after program/planned-instance changes and preserve current private dynamic behavior.     | cache review + loader tests                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Empty months, missing references, invalid dates, and schema/load failures have deterministic recovery states.          | negative-path tests                         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous users fail closed and owner-scoped reads never expose another user's planned instances.                      | auth negative-path tests                    | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: month payloads include private owner-scoped planning data only.                                       | payload review                              | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: this child displays canonical program/workout names but does not own source content.                  | scope review                                | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin labels, workflows, or operator CRUD change.                                                       | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/calendar` is private/authenticated and no public metadata changes.                            | private-route SEO rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the month overview is private user planning data and creates no public AI-discoverable content.            | private-data rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: any month/today interaction events must use stable taxonomy; no event is required for first release.  | event review or no-new-event rationale      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: calendar month view must not mutate checkout, billing, or entitlement truth.                          | scope review                                | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can distinguish no-data, invalid-date, missing-reference, and schema-sync states.             | support-copy review                         | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not touch revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.  | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: month, today, selected-day, and empty-state labels avoid identity coupling for later localization.    | copy review + responsive tests              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js, TypeScript, existing calendar helpers, Tailwind tokens, and My Library components; add no calendar lib. | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include date-helper, view-model, component, route, responsive screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`. | validation outputs                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: reads stay bounded to month/day windows and avoid N+1 workout/program loading.                        | loader tests                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Month overview can be reverted without corrupting planned instances or compare-backed Stats behavior.                  | rollback notes + PR validation              | `5/5`                   |

## Acceptance Criteria

- Desktop shows a month grid and marks today.
- Desktop month view uses the extra app width for a `Week total` column after Sunday, with one total cell per visible calendar week.
- Selecting a day opens day detail with planned swim sessions.
- Mobile preserves readable week/day behavior.
- `Stats` preserves the existing compare-backed route behavior.
- Screenshots are approved before PR gates.

## Validation Plan

- `npm run lint:briefs`
- Focused unit/component/page tests for month/today/date behavior.
- Screenshot handoff across desktop and mobile.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created after owner asked to systematize Garmin-style desktop month, today marker, and 10/10 calendar roadmap | next: execute only after Child A is merged`
- `2026-06-20 | in-progress | owner confirmed recommended scope: read-only desktop month overview now, drag/drop/reschedule deferred to a later child | base: main@9aeafba7 | next: map current calendar route, helpers, and tests`
- `2026-06-20 | in-progress | implemented deterministic month window, desktop month overview, today marker, Go to today, selected-day detail, mobile week fallback, unknown-status review state, and route/page loader wiring | targeted tests: npm exec vitest run tests/unit/my-library-calendar.test.ts tests/unit/my-library-calendar-plan.test.ts tests/unit/my-library-calendar-page.test.tsx tests/unit/calendar-plan-week-hub.test.tsx = 16 passed | next: visual screenshot handoff before broad PR gates`
- `2026-06-20 | support sweep | searched Calendar Plan, Plan week, Month overview, Selected day, Go to today, Review status, planned swim sessions, and planned workout instances across app/components/tests/docs/scripts/package.json | updated docs/user-flow-map.md and docs/runbooks/auth-account-support.md | historical done briefs intentionally left as PR history`
- `2026-06-20 | visual handoff | captured after-only desktop/tablet/mobile screenshots under output/playwright/calendar-month-today-2026-06-20-135204 | real dev-login was blocked by the local Supabase egress guard, so screenshots used a temporary local visual harness with deterministic mock data; harness route was removed before validation | validation: targeted calendar tests 16 passed, typecheck passed, lint passed with unrelated existing output/ warnings, lint:briefs:all passed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | visual correction | owner rejected cramped month grid because workout titles were unreadable; revised Plan workspace to use 1440px desktop width, moved selected-day detail below the month overview, enlarged month cells, and removed workout-title truncation | recaptured screenshots under output/playwright/calendar-month-today-rework-2026-06-20-150043 using temporary harness removed before validation | validation: targeted calendar tests 16 passed, typecheck passed, lint passed with unrelated existing output/ warnings | next: owner screenshot re-approval before npm run verify:pre-pr`
- `2026-06-20 | visual correction | owner said the session pills and overall calendar design were not 10/10 and approved a design rework; renamed the user-facing plan page to Calendar, simplified navigation labels to Previous/Today/Next, made today distinct from selected day, reduced empty-day noise, and replaced cramped session pills with calmer event rows | habits, micro sessions, and completed activity layers remain deferred to a separate daily-activity child | next: rerun targeted validation and recapture screenshot handoff before npm run verify:pre-pr`
- `2026-06-20 | visual handoff | captured after-only desktop/tablet/mobile screenshots under output/playwright/calendar-design-10-10-2026-06-20-152924 after the design rework; screenshot-only harness was used because real dev-login remains blocked by local Supabase egress guard, and the temporary route was removed before validation | validation: targeted calendar tests 16 passed, typecheck passed, lint passed with unrelated existing output/ warnings, lint:briefs:all passed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | visual correction | owner flagged wide-header balance, mobile top spacing, stacked mobile Previous/Today/Next buttons, double-blue today/selected styling, and left-heavy desktop detail actions | corrected the page header to balance text left and controls right on desktop, reduced mobile top spacing, made mobile calendar navigation a single three-button row, kept today to a badge-only signal unless selected, and moved selected-day actions to the right on desktop | screenshots captured under output/playwright/calendar-design-corrections-2026-06-20-175719 using the same removed screenshot-only harness | validation: targeted calendar tests 16 passed, typecheck passed after clearing stale .next/dev/types from the removed harness route, lint passed with unrelated existing output/ warnings | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | visual correction | owner approved removing Back to My Library and renaming the visible Compare tab to Stats while preserving the existing compare-backed route | removed the local back button, kept Calendar text left with Plan/Stats to the right on desktop and below the title on mobile, changed the comparison surface eyebrow/ARIA labels to Stats, and updated support docs | screenshots captured under output/playwright/calendar-header-stats-no-back-2026-06-20-183205 using the same removed screenshot-only harness | validation: targeted calendar tests 17 passed, typecheck passed, lint passed with unrelated existing output/ warnings, lint:briefs:all passed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | visual correction | owner asked whether selected day should avoid a blue date dot and reserve the blue date dot for today | moved the blue month-cell date dot to Today only, removed the Today text badge from month cells, and left selected day as a blue cell border/background with a normal date number | screenshots captured under output/playwright/calendar-today-selected-marker-2026-06-20-185532 using the same removed screenshot-only harness | validation: targeted calendar tests 17 passed before screenshot, typecheck passed before/after harness removal, calendar-plan-week-hub test passed after harness removal | next: owner decision on wide-desktop app workspace before further visual corrections`
- `2026-06-20 | superseded visual attempt | tried a Calendar-only 1680px Plan workspace with a separate very-wide right rail for selected-week totals plus selected-day detail; owner rejected it because Garmin-style week totals should be a column after Sunday, one total per visible week | screenshots captured under output/playwright/calendar-wide-rail-2026-06-20-195429 as rejected evidence | next: replace rail with in-grid Week total column`
- `2026-06-20 | visual correction | replaced the rejected selected-week rail with a Garmin-style Week total column after Sunday in the month table; each visible Monday-Sunday row now summarizes sessions, distance, time, and review count from that row's planned instances | global app workspace width standard remains deferred to docs/task-briefs/planned/2026-06-20-app-workspace-width-standard-10-10.md | next: validate and recapture screenshots before npm run verify:pre-pr`
- `2026-06-20 | visual handoff | captured after/reference screenshots under output/playwright/calendar-week-total-column-2026-06-20-200940; desktop/laptop show Mon-Sun plus Week total column, mobile keeps week/day cards, and the rejected rail screenshot is included as reference evidence | validation: targeted calendar tests 17 passed, typecheck passed, lint passed with unrelated existing output/ warnings, lint:briefs:all passed before capture; post-harness targeted calendar tests 17 passed and typecheck passed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | route-label-support-surface-impact-sweep | identifiers searched: Calendar, Plan, Stats, Week total, Selected day, Today, Previous, Next, planned_workout_instances, past date, date dot, Review status, Help, Guide, support surface | surfaces checked: app/, components/, lib/, tests/, docs/, docs/runbooks/, active/planned/done task briefs, scripts, package.json, and Help/Guide-adjacent references surfaced by rg | fallout handled: updated docs/user-flow-map.md and docs/runbooks/auth-account-support.md for the Garmin-style Week total column and muted past-date numbers; no Help/Guide runtime assertions, admin workflow docs, SEO metadata, sitemap, analytics taxonomy, API route, auth, payment, or recovery-path update required because this slice changes a private My Library visual calendar surface only | next: screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | visual handoff | captured after/reference screenshots under output/playwright/calendar-past-date-muted-2026-06-20-201946; desktop/laptop show muted date numbers for days before today, Today keeps the blue date dot, future/selected dates remain readable, and mobile remains week/day cards | validation: calendar-plan-week-hub test passed, typecheck passed before and after screenshot-only harness removal | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-20 | local validation | npm run lint:briefs:all passed; targeted calendar unit/component/page tests passed 17/17; npm run typecheck passed; npm run lint passed with 7 existing output/ warnings and 0 errors | rendering files unchanged after the latest screenshot capture; only docs/brief evidence was updated | next: owner screenshot approval before npm run verify:pre-pr`
