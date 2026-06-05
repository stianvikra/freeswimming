# Task Brief: AW-006 My Library Calendar Period Comparison (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-my-library-calendar-period-comparison-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-05`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `seeded_by`: `docs/task-briefs/done/2026-06-04-aw-006-habits-history-calendar-10-10.md`
- `branch`: `aw-006-my-library-calendar-period-comparison`

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@ab088c1`
- `audit_status`: `ready`
- `decision`: Execute the bounded shared My Library period-comparison slice now.
- `reason`: `main` is clean/synced after Habits post-merge polish PR `#987` and repo-managed closeout PR `#988`; fresh re-audit found the shared calendar source/date contract already in `lib/my-library/calendar.ts`, Habits as the first source consumer, and the remaining deferred Habits items (`litres`, midnight auto-complete, sound/preferences, Advanced Motivation) requiring separate data or product decisions.
- `must_refresh_before_execution_if`: Refresh if My Library calendar source filters, Habits history route params, Micro Sessions/Dryland/Swimming event contracts, analytics/dashboard scope, support diagnostics, screenshot rules, or scorecard categories change.

## Pre-Implementation Owner Explanation

Vi lager en egen kalender/innsikt-slice for aa sammenligne uker, maaneder og aar paa tvers av My Library-kilder.

Hvorfor det betyr noe: brukeren skal kunne se trender som denne uken mot forrige uke eller denne maaneden mot forrige maaned, uten at Habits bygger sin egen analysemodell som konkurrerer med en felles My Library-kalender.

Utenfor scope naa: nye check-in-regler, global kalenderlagring, swim/dryland/micro-planlegging, reminders, sound/preferences, export, `litres`-migrering, midnight auto-complete, og builder target semantics.

Fremoverkompatibilitet: period comparison skal bruke delte `source`, `period`, `range`, og `compareTo`-konsepter. Nye kilder skal enten fungere via samme mapping eller falle trygt ut som `unmapped` til eier bestemmer hvordan de skal telles.

## Goal

Implement a shared My Library calendar insight surface that compares weeks, months, and years across supported activity sources without creating a Habits-only analytics model.

## Selected Active Scope

- Reuse the My Library calendar source filter contract: `All`, `Habits`, `Micro Sessions`, `Dryland`, and `Swimming`.
- Define a period contract for `week`, `month`, and `year`.
- Define a comparison contract for `current`, `previous`, and explicit `compareTo` ranges.
- Show clear period labels including ISO week number/year where week-based.
- Keep source-specific metrics mapped explicitly:
  - Habits: check-in completion, perfect days, rest/slip/timed totals from existing Habits snapshot helpers.
  - Micro Sessions: completed/skipped units from saved micro-plan block history.
  - Dryland: completed saved sessions from existing dryland completion timestamps.
  - Swimming: safe not-mapped state until saved swim sessions have a canonical completed-on date.
- Add empty/unmapped source states that explain why a source is absent from comparison.
- Present the comparison as insight-first, not table-first: strongest trend, key takeaways, and source signals must appear before secondary detailed numbers.
- Show Habits trust details in the Habits source card: active habit count, included habit names, and tracked days.
- Add tests for period boundaries, comparison ranges, source mapping, unknown values, and no-data states.
- Preserve Habits as the first source consumer by keeping its week overview aligned to ISO Monday-Sunday weeks, preventing current-week future-day clicks, and avoiding misleading same-week `Next week` navigation.

## Out Of Scope

- Full external calendar sync.
- Scheduling swim, dryland, micro, or habit events into a calendar.
- New persisted global calendar tables.
- Habit builder target semantics, `litres`, midnight auto-complete, reminders, sound/preferences, export, or shareable reports.
- Revenue, checkout, entitlement, admin content, or public SEO changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - existing source-specific tables remain canonical; this slice adds no table and no migration.
  - Habits comparison reads existing owner-scoped habit definitions/check-ins through the protected Habits loader/server contracts.
- Local data:
  - selected period/source/compare state lives in URL params, not localStorage.
- Derived data:
  - period ranges, comparison summaries, source labels, ISO week labels, month/year labels, delta labels, and no-data states are derived view-models.
- Sync policy:
  - authenticated comparison pages are dynamic; source data refreshes through existing owner-scoped server loaders.
  - no local writes, background mutations, or automatic check-in creation happen in this slice.
- Unknown values:
  - unknown source, period, range, or metric values fail closed to no-data/unmapped states and must not be counted as Habits.

## Identity And Rename Contract

- Canonical IDs remain owned by each source domain.
- Period identifiers are date/range identifiers, not mutable entities.
- Source labels are display labels, not storage identities.
- New source IDs require explicit mapping and tests before appearing in comparison filters.
- Historical aliases must not silently repurpose old source IDs.

## Forward Compatibility Contract

- Future additions should be data-driven through shared source/period/range contracts when they match existing source categories.
- New source categories, metrics, context filters like work/off-work, and external calendars require explicit owner mapping.
- Unknown values use an `unmapped` state with support-safe copy and no analytics emission until mapped.
- Tests must prove that the comparison layer does not hardcode only today's Habits values and that unmapped sources are not silently counted as Habits.

## Help / Guide Impact

Required:

- update `docs/user-flow-map.md` with comparison source/period behavior;
- update `docs/runbooks/auth-account-support.md` with period/source diagnostics;
- update active parent/queue/design-inventory docs with selected source and deferred mappings;
- add screenshot handoff before pre-PR because UI changes.

## Route, Label, And Support-Surface Impact Sweep

- Runbook used: `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- Identifiers searched: `/my-library/calendar`, `source`, `period`, `date`, `compareTo`, `calendar period`, `period comparison`, `Mapped sources`, `Current vs compare`, `Mapped`, `Not mapped`, `Week overview`, `perfect days`, `Week 23`, `Jun 1 - Jun 7`, `ISO Monday`, and `Monday-Sunday`.
- Directories/surfaces checked: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/task-briefs/done/`, `scripts/`, and `package.json`.
- Fallout handled: My Library dashboard entry, `/my-library/calendar` route docs, auth/account support diagnostics, Habits week-copy docs, unit locator expectations, old table-first labels, and `Mapped`/`Not mapped` product copy replaced by `Included`/`Not included` where this surface renders comparison status.
- Intentional leftovers: generic admin/content test fixtures using `Mapped ...` are unrelated to this calendar status label and were left unchanged.

## Gate Evidence

- Failure-mode evidence: `/my-library/calendar` requires an authenticated user before loading source data; invalid/unknown `source`, `period`, `date`, or `compareTo` values fail closed to an unmapped/not-included model, not Habits counts. Unit tests cover invalid params and the no-user route path; no unexpected 500 is expected for bad comparison params.
- Screenshot artifact handoff: owner approved the `after/reference` screenshot set in artifact folder `output/my-library-calendar-period-comparison-2026-06-05-072704`.
- Screenshot comparison naming: artifacts use `after-calendar-desktop.png`, `after-calendar-mobile.png`, `after-habits-week-overview-mobile.png`, and `reference-my-library-dashboard-desktop.png`.
- Screenshot caveat: deterministic dev-capture route was used only for screenshots because local authenticated data depends on Supabase/login state; the temporary route/script were removed after capture.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Incident response and support operations`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                            | Evidence                                            |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Product goals and IA                          | `target` | Comparison is a shared My Library calendar insight surface, not Habits-only analytics.                                        | brief refresh + IA screenshots                      |
| UX flow clarity                               | `target` | User can choose source, period, range, and compare target without dead ends, and sees the main trend before detailed numbers. | component/e2e tests + screenshots                   |
| Visual design quality                         | `target` | Period comparison follows My Library visual tokens, avoids dashboard clutter, and does not lead with a spreadsheet table.     | screenshot handoff                                  |
| Business logic correctness and data integrity | `target` | Week/month/year boundaries, source metrics, and compare ranges are deterministic and tested.                                  | unit tests for period/source mapping                |
| Admin editor ergonomics                       | `N/A`    | N/A because no admin editor, publish workflow, or operator content editing is planned.                                        | explicit admin scope rationale                      |
| Accessibility (a11y)                          | `target` | Filters, tabs, summaries, and charts/tables have keyboard and screen-reader semantics.                                        | a11y-focused tests + screenshot QA                  |
| Performance (CWV + payloads)                  | `target` | Comparison avoids heavy client chart payload unless justified and meets route budget.                                         | bundle/perf evidence                                |
| Data placement and sync boundaries            | `target` | Source-specific canonical data and derived comparison summaries are separated.                                                | data contract + tests                               |
| Caching and invalidation strategy             | `target` | Authenticated comparison freshness and invalidation are documented per source.                                                | loader/API diff evidence                            |
| Reliability and failure handling              | `target` | Unknown/no-data/offline/source-error states fail safely.                                                                      | negative-path tests                                 |
| Security and authz                            | `target` | Authenticated source data remains owner-scoped and fail-closed.                                                               | authz review + negative-path tests                  |
| Privacy and compliance                        | `target` | Private habit/training labels are not exposed in public logs or analytics payloads.                                           | diff review + support docs                          |
| Content governance                            | `target` | Queue, parent, runbook, and source mapping docs stay synchronized.                                                            | docs diff + brief lint                              |
| Admin workflow and editability                | `N/A`    | N/A because comparison is member-facing read-only scope with no admin workflow.                                               | explicit workflow rationale                         |
| SEO and crawlability                          | `N/A`    | N/A because My Library comparison is private/authenticated and not crawlable.                                                 | private-route rationale                             |
| AI discoverability                            | `N/A`    | N/A because this creates no public crawl-safe entity or structured data.                                                      | private-route rationale                             |
| Analytics and KPI observability               | `target` | Any analytics event uses source/period/range safe payloads with no private labels.                                            | event contract tests or explicit no-event rationale |
| Commerce and revenue ops                      | `N/A`    | N/A because no Stripe, entitlement, checkout, invoice, refund, or revenue operation changes.                                  | commerce scope rationale                            |
| Incident response and support operations      | `target` | Support can diagnose missing source data, unmapped values, and period boundaries.                                             | support runbook update                              |
| Finance and reporting operations              | `N/A`    | N/A with scope rationale: no finance, billing, payout, invoice, refund, entitlement truth, or revenue reporting data changes. | explicit finance rationale                          |
| i18n operational readiness                    | `target` | Period labels and source labels are centralized and avoid fixed-width assumptions.                                            | mapping tests + screenshots                         |
| Stack-fit and dependency discipline           | `target` | Reuse Next/React/My Library contracts and avoid new chart/calendar dependency unless proven necessary.                        | dependency diff + architecture notes                |
| Testing and QA automation                     | `target` | Period/source/unknown-value tests, UI tests, and screenshot handoff pass before PR.                                           | local gates + CI                                    |
| Scalability and cost efficiency               | `target` | Comparison queries avoid duplicate event storage and unbounded per-day polling.                                               | query/data review                                   |
| DevOps and rollback readiness                 | `target` | No migration without rollback plan; feature can revert without corrupting source data.                                        | rollback notes + gates                              |

## Acceptance Criteria

1. Source filters support `All`, `Habits`, `Micro Sessions`, `Dryland`, and `Swimming`.
2. Period comparison supports week, month, and year ranges with clear labels.
3. Week views use ISO week number/year consistently.
4. Unknown or unmapped sources do not get counted as Habits.
5. Empty/no-data states explain what is missing without exposing private labels.
6. Focused tests cover period boundaries, source mapping, compare ranges, and unknown values.
7. Screenshot handoff is delivered before `npm run verify:pre-pr`.
8. Habits week overview starts on Monday, ends on Sunday, and does not make future current-week days clickable.
9. Calendar comparison leads with a human-readable insight and key takeaways; detailed metric tables are secondary.
10. Habits comparison shows active habit count, included habit names, and tracked days so the headline metric is explainable.

## Validation Plan

- `npm run lint:briefs`
- Targeted unit/component tests for period/source contracts
- Targeted route/component tests for `/my-library/calendar`
- Targeted Habits week overview tests for ISO Monday-Sunday and future-day disabled behavior
- Relevant Playwright or screenshot handoff for changed UI
- `npm run verify:pre-pr` after owner screenshot approval

## Checkpoint Log

- `2026-06-04 | planned | created from Child C owner clarification: week/month/year comparison belongs in a future shared My Library calendar insight slice, not the Habits selected-day/week implementation | next: keep deferred until owner explicitly selects this brief after Child C closes`
- `2026-06-05 | in-progress | owner explicitly said "Execute My Library Calendar Period Comparison"; moved brief to in-progress on branch aw-006-my-library-calendar-period-comparison from clean main@ab088c1 after PR #987/#988 and post-merge preflight green | next: audit source loaders/contracts, implement bounded comparison, run targeted validation, then capture screenshot handoff before verify:pre-pr`
- `2026-06-05 | implemented | added shared period/source/compare helpers, a bounded calendar comparison loader, `/my-library/calendar`, a My Library dashboard entry, and docs/support updates; Habits, Micro Sessions, and Dryland are mapped from existing owner-scoped data while Swimming remains not mapped until a completed-on contract exists | validation: targeted calendar unit/component/page tests PASS 4 files/14 tests | next: run typecheck/lint/brief lint, route-label-support sweep, then screenshot handoff`
- `2026-06-05 | fallout-fixed | owner reported Habits week overview started on Saturday and day clicks felt like week shifts; fixed shared seven-day calendar windows, Habits week summaries, and Habits snapshot query bounds to use ISO Monday-Sunday weeks while disabling current-week future-day clicks | validation: targeted calendar + Habits Vitest PASS 8 files/83 tests; typecheck PASS | next: refresh route/support sweep and capture screenshot handoff`
- `2026-06-05 | redesigning | owner challenged the table-first calendar comparison as not good enough for a habit/user insight surface; re-scoped the UI to insight-first while keeping the same data model, routes, source mappings, and Habits fallout fix | validation: CalendarPeriodComparisonHub Vitest PASS 1 file/1 test | next: run targeted calendar/Habits tests, typecheck/lint/brief lint, then regenerate screenshot handoff`
- `2026-06-05 | trust-details | owner asked whether active/included Habits should be visible; added optional source details to the comparison view-model and renders Habits active habit count, included habit names, and tracked days in the source signal card without adding trend graphs or new storage | validation: calendar comparison + hub Vitest PASS 2 files/4 tests | next: run full targeted calendar/Habits validation, typecheck/lint/brief lint, then regenerate screenshot handoff`
