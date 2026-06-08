# Task Brief: AW-006 Habits Fixed-Period Motivation Stats (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-habits-fixed-period-motivation-stats-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `planned; execute after Micro Sessions mobile linked-Habit polish is merged/closed`
- `target_findings`: `H-053`, `H-054`, `H-055`

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@235c753d`
- `audit_status`: `ready-after-child-p`
- `decision`: Use this as the next Habits logic child after the active Micro Sessions mobile polish child is complete.
- `reason`: Owner chose fixed fresh-start Motivation periods for better motivation. Code audit found current labels/context describe rolling windows (`Last 7/30/90/180/365 days`) in `HabitPerfectDayHub` and range starts in `lib/habits/shared.ts`, with `Slips` derived in the same Motivation summary path.
- `must_refresh_before_execution_if`: Refresh if `lib/habits/shared.ts`, `lib/habits/server.ts`, `HabitPerfectDayHub`, Habits tests, Calendar Comparison stats, reset-boundary behavior, selected-date/timezone contracts, scorecard categories, or validation lanes change after Child P.

## Goal

Make Habits Motivation periods feel like fresh starts by using fixed current calendar periods and proving slips use the same boundaries.

## Pre-Implementation Owner Explanation

Vi endrer motivasjonsstatistikk fra rullerende dato-vinduer til faste perioder: denne uken, denne måneden, dette kvartalet og dette halvåret.

Hvorfor det betyr noe: faste perioder gir en tydelig ny start når en uke, måned, kvartal eller halvår begynner, som er bedre for motivasjon enn å alltid dra med gamle dager.

Utenfor scope er Micro Sessions-layout, linked-Habit knapper, nye grafer, eksport, reminders, databaseendringer og bred Calendar-redesign.

Fremoverkompatibilitet: nye motivasjonsperioder må defineres i ett typed range-contract med eksplisitte grenser, labels, tests og fail-closed fallback for ukjente verdier.

## Product Decisions

- `Week` means the current ISO-style week, Monday through Sunday, containing the selected date.
- `Month` means the current calendar month containing the selected date.
- `3 months` should become `This quarter` or equivalent fixed-period label.
- `6 months` should become `This half-year` or equivalent fixed-period label.
- Rolling 7/30/90/180-day windows are out of scope for Motivation and may return later only as a separate Trends/History view.
- `Slips` are counted only inside the selected fixed period and must not count future scheduled days.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Testing and QA automation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                  | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Motivation periods read as fresh-start periods, not analytics/trend windows.                                                                        | UI labels + tests                           | `5/5`                   |
| UX flow clarity                               | `target`     | Period labels and range context make fixed week/month/quarter/half-year boundaries understandable.                                                  | component tests + screenshot if needed      | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: labels may change, but no layout redesign is intended.                                                                             | component screenshots only if layout shifts | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Period start/end boundaries are deterministic, reset-aware, timezone-safe for selected dates, and `Slips` use the same boundaries.                  | domain tests                                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                          | admin-editor scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: changed labels remain readable and controls keep existing accessible names.                                                        | component tests / markup review             | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No new dependency or heavier query; calculations remain in existing summary helpers.                                                                | package/query diff review                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Stats remain derived from server-canonical Habits/check-ins/resets; no new local truth.                                                             | data contract + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing Habits load/cache behavior remains unchanged.                                                                                              | route diff review                           | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid/unknown range values fail closed to known defaults and never count future days as slips.                                                    | negative-path/domain tests                  | `5/5`                   |
| Security and authz                            | `supporting` | No protected route/authz change; existing owner-scoped data reads remain.                                                                           | API diff review                             | `4/5`                   |
| Privacy and compliance                        | `target`     | No private Habit names/notes added to logs or analytics; stats remain private route data.                                                           | code review                                 | `5/5`                   |
| Content governance                            | `target`     | Parent, child, docs, and PR body agree on fixed-period semantics and deferred rolling trends.                                                       | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, role-gated CRUD, audit trail, or operator editability surface.                                    | admin-workflow scope rationale              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this affects authenticated My Library surfaces only and changes no public metadata, sitemap, robots, canonical URL, or structured data. | SEO scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity, structured data, AI-facing page copy, or public docs surface.                                 | AI scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Existing analytics remain unchanged unless the implementation audit proves a typed range payload needs a label update.                              | analytics diff or no-new-event rationale    | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, billing, invoice, payout, or revenue flow.                                      | commerce scope rationale                    | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs can explain how a user got a period/slip count and why it reset at the calendar boundary.                                              | support docs/user-flow update               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance provider data, billing records, reports, payouts, entitlements, or reconciliation surfaces change.             | finance scope rationale                     | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels avoid fixed-width English assumptions and can later be localized as period concepts.                                                         | component tests + screenshot if needed      | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Habits domain helpers, selected-date utilities, and tests; add no dependency.                                                        | code/package diff                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component tests cover week/month/quarter/half-year boundaries, labels, reset interaction, slips, and future-day exclusion.                     | targeted tests + gates                      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | No new storage/event volume; calculations stay bounded to existing loaded check-ins.                                                                | diff review                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Runtime-only rollback is normal git revert; no migration rollback required.                                                                         | pre-pr/pre-merge gates                      | `5/5`                   |

## Stack / Data / Identity / Forward Compatibility

Reference surfaces are `lib/habits/shared.ts`, `lib/habits/server.ts`, and `HabitPerfectDayHub`. Habit definitions, check-ins, and reset events remain server-canonical; Motivation summaries remain derived view-model state. No identity, rename, route, database, RLS, or external service changes are planned. Future ranges require typed range values, labels, period-boundary helpers, tests, support copy, and a safe default for unknown values. Rolling analytics must use a separate future `Trends`/`History` label so Motivation stays fresh-start oriented.

## Scope And Acceptance

Update Motivation range start/end behavior from rolling windows to fixed current periods for week, month, quarter, and half-year; update visible labels/context copy so `3 months`/`6 months` no longer imply rolling `Last` windows; keep `All` all-time and evaluate whether `Year` remains fixed current calendar year or is deferred/renamed by the implementation audit. Prove `Slips` and rest/perfect-day counts use the same fixed period boundaries, reset boundaries still clamp correctly, future dates do not create slips, and selected-date/local date contracts stay deterministic.

Acceptance criteria:

1. `Week` starts Monday and ends Sunday around the selected date.
2. `Month` starts on day 1 and ends on the last day of the selected month.
3. `3 months`/quarter starts on the current calendar quarter boundary.
4. `6 months`/half-year starts Jan 1 or Jul 1 depending on selected date.
5. Labels/context copy no longer says `Last 90 days` or `Last 180 days`.
6. `Slips` use the same fixed selected period and never count future scheduled days.
7. Reset boundaries still clamp Motivation stats without deleting earlier history.
8. Relevant targeted tests pass before PR handoff.

## Out Of Scope

Micro Sessions mobile UI, linked-Habit card/CTA behavior, button styling, schema migrations unless a fresh audit proves they are required, rolling trend dashboards, graph dependencies, exports, reminders, notification APIs, public pages, commerce, and merge without owner approval.

## Validation

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx`
- `npm run typecheck`
- `git diff --check`
- `npm run verify:pre-pr`
- CI required checks
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-08 | planned | created as sibling child after owner chose fixed fresh-start Motivation periods and asked to check slips; execution waits until Child P visual/mobile polish is merged and closed | next: after Child P closeout, refresh audit and move this child to in-progress only when explicitly executed`
