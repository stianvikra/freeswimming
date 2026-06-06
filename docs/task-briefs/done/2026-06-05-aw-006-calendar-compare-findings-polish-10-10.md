# Task Brief: AW-006 Calendar Compare Findings Polish (10/10)

## Metadata

- `id`: `2026-06-05-aw-006-calendar-compare-findings-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-05`
- `updated`: `2026-06-06`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_planned_brief`: `docs/task-briefs/planned/2026-06-05-aw-006-habits-advanced-motivation-history-depth-10-10.md`
- `route`: `/my-library/calendar`
- `execution_mode`: `end-to-end after owner approval`

## Brief Audit Record

- `last_audited`: `2026-06-05`
- `base`: `main@69bddfc7`
- `audit_status`: `ready`
- `decision`: Execute this Calendar Compare polish now; keep the future real calendar, swim planning, and Habits Advanced Motivation work separate.
- `reason`: Fresh audit confirms `/my-library/calendar` is currently a private period-comparison surface across My Library sources, not a specific calendar grid. Owner explicitly asked to make this part 10/10 after listing clarity, terminology, and motivation findings.
- `must_refresh_before_execution_if`: Refresh if `CalendarPeriodComparisonHub`, `lib/my-library/calendar-comparison.ts`, My Library source contracts, Dryland saved-session fields, Micro Session block contracts, Habits summary rules, screenshot handoff rules, scorecard categories, or verification lanes change before completion.

## Goal

Make `/my-library/calendar` read as a clear, motivating Comparison Report surface with understandable labels, clean numbers, and honest source readiness.

## Pre-Implementation Owner Explanation

Vi gjor denne siden tydeligere som sammenligning/trend, ikke som den fremtidige ekte kalenderen. Brukeren skal forst se hva rapporten viser, hvilken periode som sammenlignes, og hvilken kilde som faktisk trekker opp eller ned.

Hvorfor det betyr noe: dagens tekst som `One area needs attention`, `-36 pp` og `units` er for teknisk og lite motiverende. En bruker skal forstaa hva som endret seg uten aa tolke produkt-språk.

Utenfor scope er selve kalendergridet, ny swim planning/logging, nye dryland strength/stretch datamodeller, Habits Advanced Motivation runtime, reminders, midnight auto-complete og nye databaserader.

Fremoverkompatibilitet: nye kilder og nye metrics skal enten gaa gjennom den typed Calendar comparison source-kontrakten automatisk, eller kreve eksplisitt mapping med trygg fallback som sier at kilden ikke er telt ennå.

## Scope

- Reframe `/my-library/calendar` as Comparison Report while preserving the existing private route.
- Move source/period view options above the insight so users know what they are looking at before reading the result.
- Replace vague insight copy with source/metric-specific copy.
- Replace technical deltas like `-36 pp` and percentage-point wording with direct comparisons such as `30% vs 66%`.
- Remove floating-point noise from metric labels and deltas.
- Rename Micro Session `units` to `micro blocks`, because the current data contract counts saved plan blocks.
- Clarify Dryland as saved sessions and training minutes only; strength sets/reps/load and stretching hold time remain unmapped until a future data contract exists.
- Clarify Swimming as waiting for canonical completed-on dates.
- Update focused unit tests and support/user-flow docs touched by the visible labels.
- Capture screenshot handoff before `verify:pre-pr`.

## Out Of Scope

- A real calendar grid, day details, drag/drop scheduling, or global calendar storage.
- New Dryland strength/stretch storage for exercises, sets, reps, load, hold time, or per-series details.
- New Swim planning/logging comparison.
- Habits Advanced Motivation implementation.
- New notifications, reminder schedules, midnight auto-complete, sounds, haptics, or analytics dashboards.
- New dependencies.
- Merge without explicit owner approval.

## Data Placement And Sync Contract

- Server-canonical data:
  - existing owner-scoped Habits definitions/check-ins,
  - existing Dryland saved session completion dates and durations,
  - existing Micro Session plan block completion/skip timestamps.
- Local data:
  - query-string UI selection only (`source`, `period`, `date`, optional `compareTo`).
- Sync policy:
  - read-only comparison; no writes, no conflict resolution, and no background sync introduced.
- Retention and sensitivity:
  - all compared activity remains private and authenticated; no private names, notes, or raw sensitive values are added to logs or public surfaces.
- Cache/invalidation:
  - preserve `dynamic = "force-dynamic"` route behavior; data freshness follows the existing server load for the selected period.

## Identity And Rename Contract

- Canonical stable IDs:
  - Habits, Dryland sessions, and Micro Session plans/blocks keep their existing backend identities.
- Human-readable identifiers:
  - route and labels are display/UI copy only; no new slug or persisted identifier is introduced.
- Mutability:
  - source labels can be renamed only through the Calendar source label mapping and tests.
- Compatibility:
  - unknown route params already normalize to safe defaults or unmapped problem states.
- Observability and repair:
  - support diagnosis uses source, date range, period, and redacted owner-scoped records, not public data.

## Forward Compatibility Contract

- Extensibility surfaces:
  - source filters, period filters, source statuses, metric labels, metric units, comparison tones, route params, Help/Guide/support labels, and future locales.
- Source of truth:
  - visible source filter labels come from `lib/my-library/calendar.ts`.
  - comparison rows come from `MyLibraryCalendarSourceComparison`.
- Additive behavior:
  - a future mapped source can appear by adding a typed source comparison with metrics and status.
  - future metrics inherit cleaned number formatting through shared metric helpers.
- Explicit mapping requirements:
  - new source statuses, new units, dryland strength/stretch metrics, swim completion dates, new metric tone semantics, or analytics payloads require explicit code/test/doc mapping before they affect the report.
- Unknown or deprecated values:
  - unknown sources/periods fail to unmapped or default comparison states with user-facing copy.
  - unmapped sources show `Not included yet` style copy instead of fabricated progress.
- Test/evidence:
  - focused unit tests for labels, deltas, source readiness, and decimal formatting.
  - screenshot handoff verifies scan order and visual fit on desktop/mobile.

## Help / Guide Impact

- Required: update support/user-flow docs that describe `/my-library/calendar`, source inclusion, and diagnosis.
- Admin Help Center impact: `N/A` because this changes no admin workflow, role-gated action, recovery action, or publish/edit surface.

## Route / Label / Support Surface Sweep

Required before broad gates:

- `/my-library/calendar`
- `Calendar`
- `Comparison Report`
- `Calendar insight`
- `One area needs attention`
- `View options`
- `Micro Sessions`
- `units`
- `Dryland`
- `Swimming`
- `Targets hit`
- `percentage points`
- `source=`
- `period=`
- support docs and user-flow docs that mention My Library Calendar behavior.
- Identifiers searched: `/my-library/calendar`, `Calendar`, `Comparison Report`, `Progress Compare`, `Calendar insight`, `Comparison insight`, `One area needs attention`, `View options`, `Comparison view`, `Micro Sessions`, `units`, `Dryland`, `Swimming`, `Average on target`, `Targets hit`, `percentage points`, `source=`, and `period=`.
- Directories/surfaces checked: `app/`, `components/`, `lib/my-library/`, `tests/unit/`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, `docs/design/notice-empty-state-pattern-inventory.md`, active AW-006 task briefs, and planned AW-006 task briefs.
- Fallout handled: runtime labels, source metric labels, support docs, user-flow docs, design inventory, tests, and the active queue row now use `Comparison Report`, `Targets hit`, direct percent comparisons, and source-readiness language.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `CalendarPeriodComparisonHub`; keep route as server-rendered private page with existing `SiteChrome`.
  - preserve query-param navigation and dynamic route behavior.
- Reference surface:
  - reference surface remains the existing `CalendarPeriodComparisonHub` plus My Library workspace/card/action primitives.
  - the change reuses the shared view-model contract `MyLibraryCalendarComparisonModel` / `MyLibraryCalendarSourceComparison` and adapts labels/formatting in place; no new renderer or dependency was introduced.
- TypeScript/domain contracts:
  - keep metrics in `MyLibraryCalendarComparisonMetric`.
  - centralize number/unit formatting in `lib/my-library/calendar-comparison.ts`.
  - do not infer Dryland strength/stretch details from duration-only rows.
- Supabase/data layer:
  - no migration, RLS, generated types, or schema changes.
  - preserve owner-scoped reads already in the loader.
- External services:
  - none touched.
- UI system:
  - reuse existing My Library cards, tokens, focus states, links, badges, and responsive grids.
  - screenshot handoff is `after/reference`: after screenshots of changed route plus source-detail states.
- Testing:
  - update focused unit tests for labels/formatting and run targeted tests before screenshot handoff.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Route must clearly present itself as Comparison Report/trends, not the future specific calendar grid.                                                                    | brief + screenshots + user-flow docs    | `5/5`                   |
| UX flow clarity                               | `target`     | Source/period context appears before insight; primary insight names the exact source/metric and plain comparison.                                                        | component screenshot + tests            | `5/5`                   |
| Visual design quality                         | `target`     | Changed UI uses existing tokens, avoids nested-card clutter, fits long labels on mobile/desktop, and keeps scan-first order.                                             | responsive screenshot handoff           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No fabricated strength/stretch/swim metrics; deltas are rounded deterministically and source readiness is truthful.                                                      | unit tests + code review                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                               | explicit admin-editor scope rationale   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Filters, nav actions, detail table, badges, and details disclosure preserve labels, semantics, focus visibility, and non-color-only meaning.                             | component/test review + screenshots     | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                  | component/test review + screenshots     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, polling, heavy charts, or large client bundle; route remains server-rendered.                                                        | build/diff review                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Brief and implementation preserve read-only owner-scoped server data; no local metric truth or new writes.                                                               | data contract + code review             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: preserve existing dynamic private route behavior and query-param navigation.                                                                            | route diff review                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Unmapped/error/syncing/no-data states remain understandable and do not produce misleading insight copy.                                                                  | unit tests + manual screenshot review   | `5/5`                   |
| Security and authz                            | `target`     | Private route stays authenticated and owner-scoped; no new public access path or unsafe query trust.                                                                     | route/code review                       | `5/5`                   |
| Privacy and compliance                        | `target`     | No private habit names, notes, quit details, or raw sensitive fields are added to public pages, unsafe logs, or analytics.                                               | privacy diff review                     | `5/5`                   |
| Content governance                            | `target`     | Active brief plus support/user-flow docs accurately explain Comparison Report scope and deferred future calendar/swim/dryland mapping.                                   | docs diff + `npm run lint:briefs`       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, editable admin fields, role-gated CRUD, recovery action, or operator support action surface.                          | explicit admin-workflow scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/calendar` is private/authenticated and this changes no public metadata, sitemap, robots, canonical URL, or structured data.                     | private-route SEO rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, public semantic page copy, structured data, or AI-facing public docs surface.                                | AI-discoverability scope rationale      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: preserve existing no-new-event behavior; any future trend analytics must avoid raw private activity labels.                                             | analytics diff review                   | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                    | commerce scope rationale                | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs must explain how to diagnose Calendar Compare ranges, source inclusion, and unmapped source complaints.                                                     | support doc diff                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.                | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Plain-language labels must avoid compact English-only abbreviations such as `pp`, and layouts must tolerate longer translated labels.                                    | tests + responsive screenshots          | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Calendar compare model/component, My Library UI tokens, and current test stack; add no dependency.                                                        | code/dependency diff review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit tests cover source terminology, decimal rounding, percent delta copy, and existing source calculations; visual screenshot handoff completed before PR gate. | targeted tests + screenshot handoff     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new unbounded query, polling, background job, or expensive all-history scan.                                                                         | loader diff review                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration; rollback is reverting the UI/model/docs commit. Required local gates and CI must pass before merge readiness.                                              | `verify:pre-pr`, CI, `verify:pre-merge` | `5/5`                   |

## Acceptance Criteria

- `/my-library/calendar` title/copy makes the route purpose clear as Comparison Report.
- View options appear before the insight summary.
- Primary insight names the exact source and metric, with plain-language up/down/no-change wording.
- No metric shows raw floating-point artifacts.
- Habits percent comparison uses direct values such as `30% vs 66%`, not `pp`, percentage points, or ambiguous relative-percent wording.
- Micro Sessions say `micro blocks`, not generic `units`.
- Dryland and Swimming copy truthfully state what is and is not included.
- Focused unit tests cover the changed labels and number formatting.
- Docs explain the compare route and deferred real-calendar/source-mapping scope.
- Screenshot handoff is captured and approved before `verify:pre-pr`.

## Validation

- Completed before screenshot approval stop:
  - `npx vitest run tests/unit/my-library-calendar-comparison.test.ts tests/unit/calendar-period-comparison-hub.test.tsx tests/unit/my-library-calendar-page.test.tsx` - pass, 3 files / 8 tests.
  - `npm run lint:briefs:all` - pass.
- Before PR update after screenshot approval:
  - `npm run verify:pre-pr` - pass at `artifacts/test-runs/20260605-225727/verify.log`, full public lane, 229 unit files / 1384 tests, build, perf budgets, and E2E 106 passed / 530 expected skips.
- Before merge readiness:
  - `npm run verify:pre-merge` - pass, reused current-HEAD full-public verify artifact and recorded `artifacts/verify-pre-merge/20260606-065144.json`.
- CI:
  - PR `#999` - all required checks passed: `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, CodeQL analyze, Vercel, and Vercel Preview Comments.
- Screenshot handoff:
  - `output/aw-006-calendar-compare-polish-2026-06-05-223605` - owner approved as acceptable for now before PR gates.

## Checkpoint Log

- `2026-06-05`: Created in-progress brief after owner approved execution of Calendar Compare findings polish.
- `2026-06-05`: Implemented Comparison Report copy/IA polish, deterministic number formatting, source-readiness language, docs/tests, and screenshot artifacts at `output/aw-006-calendar-compare-polish-2026-06-05-220357`. Stopped before `verify:pre-pr` for required visual approval.
- `2026-06-05`: Applied owner-requested visual/copy polish: `Comparison view`, normalized control height/min-width, habit-consistency insight wording, and softer source-history copy. Targeted unit tests passed again. Updated screenshot artifacts at `output/aw-006-calendar-compare-polish-2026-06-05-221704`.
- `2026-06-05`: Applied owner-requested naming and percent-copy correction: title is `Comparison Report`, habit insight drops repeated source/period words, period copy uses `last week/month/year`, and habit percentage changes show direct `current vs comparison` values instead of percentage points. Updated screenshot artifacts at `output/aw-006-calendar-compare-polish-2026-06-05-223605`.
- `2026-06-06`: PR `#999` merged as squash commit `d7449cdb`; post-merge preflight surfaced this repo-managed docs-only closeout.

## Completion Record

- `completed`: `2026-06-06`
- `merged_pr`: `#999`
- `squash_commit`: `d7449cdb`
- `result`: Closed AW-006 Calendar Compare Findings Polish. `/my-library/calendar` now reads as a private Comparison Report instead of a future calendar grid, puts view context before the insight, uses plain-language habit comparisons instead of `pp`, cleans number formatting, and states source readiness honestly for Habits, Micro Sessions, Dryland, and Swimming.
- `validation`: Targeted unit tests, `npm run lint:briefs:all`, two full-public `npm run verify:pre-pr` passes, PR `#999` CI success, `npm run verify:pre-merge`, and screenshot handoff at `output/aw-006-calendar-compare-polish-2026-06-05-223605`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; supporting/N/A categories remained within scoped rationale.

| Category                                      | Achieved Score | Evidence                                                                                                        | Gaps / Notes                                           |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | Route title/copy, My Library entry copy, docs, screenshots, PR `#999`                                           | No remaining gap in this slice                         |
| UX flow clarity                               | `5/5`          | View options moved before insight; direct source/period/metric copy; screenshots                                | Future real calendar remains separate                  |
| Visual design quality                         | `5/5`          | Existing tokens/primitives reused; desktop/mobile screenshots approved                                          | Owner approved current visual state for now            |
| Business logic correctness and data integrity | `5/5`          | Unit tests cover formatting, source readiness, direct habit comparisons, and source calculations                | No fabricated Dryland strength/stretch or swim metrics |
| Accessibility (a11y)                          | `5/5`          | Existing semantics preserved for filters, nav, details disclosure, badges, and responsive screenshots           | No new a11y gap found                                  |
| Accessibility                                 | `5/5`          | Lifecycle-lint alias for canonical a11y category                                                                | No new a11y gap found                                  |
| Data placement and sync boundaries            | `5/5`          | Brief and code preserve read-only owner-scoped server data; query params remain local UI state                  | No new writes or sync path                             |
| Reliability and failure handling              | `5/5`          | Unmapped/not-included source copy and deterministic number formatting covered by tests                          | No remaining gap in this slice                         |
| Security and authz                            | `5/5`          | Private route/auth boundary unchanged; owner-scoped reads preserved; CI/security checks passed                  | No new public access path                              |
| Privacy and compliance                        | `5/5`          | No new public logging/analytics/raw private labels; docs keep diagnosis redacted                                | No remaining gap in this slice                         |
| Content governance                            | `5/5`          | Active queue, support docs, user-flow docs, design inventory, and done brief updated                            | No remaining gap in this slice                         |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` updated with Comparison Report source/range/readiness diagnosis         | No admin support action changed                        |
| i18n operational readiness                    | `5/5`          | Removed compact `pp` wording; direct comparison copy and button sizing tolerate longer labels                   | Full localization remains future platform work         |
| Stack-fit and dependency discipline           | `5/5`          | Existing `CalendarPeriodComparisonHub`, typed comparison model, shared My Library primitives; no new dependency | No remaining gap in this slice                         |
| Testing and QA automation                     | `5/5`          | Targeted unit tests, full local gates, CI checks, and screenshot handoff completed                              | No remaining gap in this slice                         |
| DevOps and rollback readiness                 | `5/5`          | No migration; rollback is reverting squash commit `d7449cdb`; `verify:pre-merge` passed before merge            | No remaining gap in this slice                         |
