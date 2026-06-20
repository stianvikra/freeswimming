# Task Brief: My Library Calendar Desktop Month Overview And Today Marker (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-desktop-month-today-overview-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `B`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@1b8f87da`
- `audit_status`: `ready_after_child_a`
- `decision`: Execute only after Child `A` has shipped planned workout instances and the Calendar Plan route.
- `reason`: The month overview should reuse `planned_workout_instances` instead of deriving calendar dates from labels or duplicating planned-session identity.
- `must_refresh_before_execution_if`: Refresh if Child `A` changes `planned_workout_instances`, `/my-library/calendar`, calendar helper contracts, program/workout identity, route labels, screenshot rules, or the parent capability matrix.

## Goal

Add a desktop month overview with a clear today marker, "Go to today" affordance, and selected-day detail panel while preserving mobile week/day readability.

## Pre-Implementation Owner Explanation

Codex skal gjøre kalenderen mer lik Garmin på desktop: en måned skal kunne skannes raskt, dagens dato skal være tydelig, og en valgt dag skal vise detaljene uten at månedscellene blir fulle av knapper. Dette betyr bedre oversikt over kommende planlagte økter. Utenfor scope er markering som utført, Garmin-sync, micro sessions, habits, Perfect Day og endring av planinstanser.

## Scope

- Add `view=plan` support for desktop month overview when viewport/layout allows it.
- Mark today using deterministic calendar helpers, not a hardcoded date.
- Add "Go to today" when the selected month/week does not include today.
- Keep mobile week/day-first so buttons and text remain readable.
- Add selected-day detail for planned swim sessions using `planned_workout_instances`.
- Preserve `Compare` behavior and current authenticated route boundary.
- Add responsive screenshots before PR gates.

## Out Of Scope

- Completion mutation, `mark done`, `skipped`, `missed`, or `rescheduled` actions.
- Editing plan instances from the month cells.
- Micro sessions, habits, Perfect Day, Garmin, AI planning, drag/drop, recurrence, or provider sync.
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
| DevOps and rollback readiness                 | `target`     | Month overview can be reverted without corrupting planned instances or Compare behavior.                               | rollback notes + PR validation              | `5/5`                   |

## Acceptance Criteria

- Desktop shows a month grid and marks today.
- Selecting a day opens day detail with planned swim sessions.
- Mobile preserves readable week/day behavior.
- `Compare` still works.
- Screenshots are approved before PR gates.

## Validation Plan

- `npm run lint:briefs`
- Focused unit/component/page tests for month/today/date behavior.
- Screenshot handoff across desktop and mobile.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created after owner asked to systematize Garmin-style desktop month, today marker, and 10/10 calendar roadmap | next: execute only after Child A is merged`
