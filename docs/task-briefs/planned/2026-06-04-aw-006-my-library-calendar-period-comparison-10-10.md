# Task Brief: AW-006 My Library Calendar Period Comparison (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-my-library-calendar-period-comparison-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-04`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `seeded_by`: `docs/task-briefs/in-progress/2026-06-04-aw-006-habits-history-calendar-10-10.md`
- `branch`: `TBD`

## Brief Audit Record

- `last_audited`: `2026-06-04`
- `base`: `main@6ef89bd`
- `audit_status`: `planned`
- `decision`: Keep week/month/year comparison out of Habits Child C and capture it as a future system-calendar slice.
- `reason`: Child C should make selected-day/week Habits history useful. Comparing weeks, months, and years is analytics/history-dashboard scope and needs a shared My Library calendar contract that can later serve Habits, Micro Sessions, Dryland, Swimming, and All.
- `must_refresh_before_execution_if`: Refresh if My Library calendar source filters, Habits history route params, Micro Sessions/Dryland/Swimming event contracts, analytics/dashboard scope, support diagnostics, screenshot rules, or scorecard categories change.

## Pre-Implementation Owner Explanation

Dette skal ikke bygges i Child C. Senere lager vi en egen kalender/innsikt-slice for aa sammenligne uker, maaneder og aar paa tvers av kilder.

Hvorfor det betyr noe: brukeren skal kunne se trender som denne uken mot forrige uke eller denne maaneden mot forrige maaned, uten at Habits bygger sin egen analysemodell som konkurrerer med en felles My Library-kalender.

Utenfor scope for den fremtidige slicen til den blir valgt: nye check-in-regler, global kalenderlagring uten egen dataavklaring, swim/dryland/micro-planlegging, reminders, sound, export, og builder target semantics.

Fremoverkompatibilitet: period comparison skal bruke delte `source`, `period`, `range`, og `compareTo`-konsepter. Nye kilder skal enten fungere via samme mapping eller falle trygt ut som `unmapped` til eier bestemmer hvordan de skal telles.

## Goal

Define and later implement a shared My Library calendar insight surface that compares weeks, months, and years across supported activity sources without creating a Habits-only analytics model.

## Selected Future Scope

- Reuse the My Library calendar source filter contract: `All`, `Habits`, `Micro Sessions`, `Dryland`, and `Swimming`.
- Define a period contract for `week`, `month`, and `year`.
- Define a comparison contract for `current`, `previous`, and explicit `compareTo` ranges.
- Show clear period labels including ISO week number/year where week-based.
- Keep source-specific metrics mapped explicitly:
  - Habits: check-in completion, perfect days, rest/slip/timed totals.
  - Micro Sessions: completed/skipped/open units and active plan status.
  - Dryland: completed saved-session/micro-session training work where canonical.
  - Swimming: completed saved/session-program work where canonical.
- Add empty/unmapped source states that explain why a source is absent from comparison.
- Add tests for period boundaries, comparison ranges, source mapping, unknown values, and no-data states.

## Out Of Scope Until Execution

- Full external calendar sync.
- Scheduling swim, dryland, micro, or habit events into a calendar.
- New persisted global calendar tables unless the execution audit proves they are needed.
- Habit builder target semantics, reminders, sound, export, or shareable reports.
- Revenue, checkout, entitlement, admin content, or public SEO changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - source-specific activity tables remain canonical until a future migration explicitly creates shared calendar storage.
- Local data:
  - selected period/source/compare state may live in URL params, not localStorage.
- Derived data:
  - comparison summaries, source labels, ISO week labels, month/year labels, and no-data states are derived view-models.
- Sync policy:
  - source data refreshes through existing authenticated loaders/API contracts unless a future brief scopes a shared query layer.
- Unknown values:
  - unknown source, period, range, or metric values must fail closed to no-data/unmapped states and must not be counted as Habits.

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
- Tests must prove that the comparison layer does not hardcode only today's Habits values.

## Help / Guide Impact

Required at execution:

- update `docs/user-flow-map.md` with comparison source/period behavior;
- update `docs/runbooks/auth-account-support.md` with period/source diagnostics;
- update active parent/queue docs with selected source and deferred mappings;
- add screenshot handoff before pre-PR if UI changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a future `10/10` claim:

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
| Product goals and IA                          | `target` | Comparison is a shared My Library calendar insight surface, not Habits-only analytics.                                        | future brief refresh + IA screenshots               |
| UX flow clarity                               | `target` | User can choose source, period, range, and compare target without dead ends.                                                  | component/e2e tests + screenshots                   |
| Visual design quality                         | `target` | Period comparison follows My Library visual tokens and avoids dashboard clutter.                                              | screenshot handoff                                  |
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

## Acceptance Criteria For Future Execution

1. Source filters support `All`, `Habits`, `Micro Sessions`, `Dryland`, and `Swimming`.
2. Period comparison supports week, month, and year ranges with clear labels.
3. Week views use ISO week number/year consistently.
4. Unknown or unmapped sources do not get counted as Habits.
5. Empty/no-data states explain what is missing without exposing private labels.
6. Focused tests cover period boundaries, source mapping, compare ranges, and unknown values.
7. Screenshot handoff is delivered before `npm run verify:pre-pr`.

## Validation Plan For Future Execution

- `npm run lint:briefs`
- Targeted unit/component tests for period/source contracts
- Relevant Playwright or screenshot handoff for changed UI
- `npm run verify:pre-pr` after owner screenshot approval

## Checkpoint Log

- `2026-06-04 | planned | created from Child C owner clarification: week/month/year comparison belongs in a future shared My Library calendar insight slice, not the Habits selected-day/week implementation | next: keep deferred until owner explicitly selects this brief after Child C closes`
