# Task Brief: AW-006 Habits Post-Merge Polish (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-habits-post-merge-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-04`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-post-merge-polish`
- `resolved_findings`: `H-029`, `H-030`, `H-031`, `H-032`, `H-033`, `H-034`, `H-035` pending merge
- `deferred_findings`: persisted `litres`, midnight auto-complete, sound/preferences, Habits Advanced Motivation, and My Library Calendar Period Comparison
- `return_checkpoint`: update parent, queue, and design inventory before closeout
- `next_return_target`: return to the Habits parent or explicitly select My Library Calendar Period Comparison after merge/closeout

## Brief Audit Record

- `last_audited`: `2026-06-04`
- `base`: `main@2d0abcf`
- `audit_status`: `ready`
- `decision`: Execute a bounded post-merge Habits polish slice before My Library Calendar Period Comparison.
- `reason`: Owner found seven small Habits regressions after PR `#985`/closeout `#986`: open count rows need a safe `0-100` input range, open count `Value`/`Save` controls are duplicated inside `Details`, desktop `Mark done` wraps to two lines because the shared peer action width is too narrow, Habits week navigation/back-forward can leave the visible week stale after the URL changes, desktop pills drift away from the heading, open count `Save` can overlap or sit behind `Details`, and peer row controls do not share the same height.
- `must_refresh_before_execution_if`: Refresh if `/my-library/habits`, `HabitPerfectDayHub`, Habits API/check-in validation, My Library token/action classes, screenshot rules, scorecard categories, or route/support guidance changes before screenshot handoff.

## Pre-Implementation Owner Explanation

Vi fikser de små Habits-tingene etter siste merge: count-input skal trygt gå fra `0` til `100`, `Value`/`Save` skal ikke vises dobbelt når `Details` åpnes, `Mark done` skal ikke brekke over to linjer på desktop, sveip/tilbake/frem skal faktisk oppdatere synlig Habits-uke, pills skal ligge rett etter heading, `Save` skal ikke havne bak `Details`, og peer-knappene skal ha lik høyde.

Det betyr noe fordi Habits skal føles ryddig og trygg i daglig bruk før vi bygger større kalenderinnsikt.

Utenfor scope er kalender comparison, `litres`-migrering, midnight auto-complete, lyd/preferences, reminders, eksport og avansert motivasjon.

Fremoverkompatibilitet: patchen bevarer dagens Habits-kontrakter, databasegrenser og `Do`/`Quit`/`Timed` mapping. Nye habit units, statuses eller actions må fortsatt ha eksplisitt mapping og tester før de telles som suksess.

## Goal

Make the current Habits row controls and selected-week navigation feel deliberate and safe after the last merge without changing Habits persistence, target semantics, timers, history, or calendar scope.

## Scope

- Update `components/my-library/habits/HabitPerfectDayHub.tsx`.
- Update focused Habits component tests.
- Update Habits parent/queue/design inventory lifecycle docs.
- Capture screenshot handoff for the changed desktop/mobile Habits surfaces before pre-PR verification.

## Out Of Scope

- Persisted `litres` or any Supabase migration.
- Midnight auto-complete/background check-in creation.
- Sound/preferences/reminders/export.
- Advanced motivation, habit score, best streak, notes, archive-history changes.
- My Library Calendar Period Comparison.
- New analytics events, checkout, entitlement, admin, public SEO, or API contract changes.

## Data Placement And Sync Contract

- Server-canonical data: Habits definitions and check-ins remain source-of-truth through existing protected API routes.
- Local data: only the existing in-memory check-in input value and existing timer localStorage remain local; this slice adds no storage key.
- Sync policy: `Save` continues to POST through the existing check-in route and refreshes from the returned snapshot. URL/history navigation keeps using the server-provided `initialSnapshot`, and the client view must resync its local snapshot when that prop changes.
- Retention and sensitivity: no new retention, logging, analytics, or public data exposure.
- Cache/invalidation: authenticated Habits route remains dynamic; mutation refresh behavior is unchanged, and App Router back-forward/URL changes must not leave stale client-only selected-day state behind.

## Identity And Rename Contract

- Canonical stable IDs: existing habit IDs and check-in IDs remain unchanged.
- Human-readable identifiers: habit titles remain renameable only through existing `Edit`.
- Rename vs repurpose: no identity, slug, route param, or alias behavior changes.
- Compatibility: existing check-ins and legacy habit rows read through unchanged.

## Forward Compatibility Contract

- Future count-like habit rows that use the shared `NumberStepperField` can opt into explicit min/max bounds and shared peer-action height without inventing route-local input code.
- New habit types/actions must still choose whether inline and Details editors are both needed; unknown actions must not become visible success states by default.
- Unknown or deprecated habit units/statuses continue to fail through existing Habits mapping instead of being counted as success.
- Evidence: focused component tests cover bounded count input, duplicate editor prevention, no-wrap/equal-height action layout, row pill placement, and client resync when router history provides a new snapshot.

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse `HabitPerfectDayHub` and current My Library action/token classes; no new route or server component boundary.
- TypeScript/domain contracts: keep existing Habits view-model and API payload contracts; add only typed UI props for max-bounded number steppers.
- Supabase/data layer: no migration, generated type update, RLS change, or DB query change.
- External services/tools: N/A; no SDK, provider, or secret changes.
- UI system: reuse existing `fs-cta-*`, `ui-field`, `NumberStepperField`, and Habits card layout; screenshot handoff type is `before/after` when practical or `after/reference` if before capture is not available.
- Testing: focused component tests plus broad gates after owner screenshot approval.

## Help / Guide Impact

N/A for Help/Guide copy because no user-facing label, workflow meaning, recovery path, or support procedure changes. The visible labels stay `Mark done`, `Save`, and `Details`; the fix changes bounds/layout only.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                    | Evidence                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Habits remains the daily tracking workspace; the patch removes control confusion without changing route purpose.                                                                      | screenshot handoff + diff review        |
| UX flow clarity                               | `target`     | Count rows expose one value/save surface, `0-100` bounds are predictable, `Mark done` remains one readable command, and existing Habits week navigation updates the visible day/week. | component tests + screenshots           |
| Visual design quality                         | `target`     | Desktop/mobile row actions keep stable no-wrap labels, equal peer heights, no overlap, heading-adjacent pills, and current My Library token/action styling.                           | screenshot handoff + class assertions   |
| Business logic correctness and data integrity | `target`     | Count input clamps to `0-100` before save, `0` is accepted as an explicit value, selected-week state resyncs from the server snapshot, and no unsupported units/schema changes ship.  | focused component/API-payload assertion |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a member-facing Habits surface, not an admin editor or publish workflow.                                                                                          | explicit admin scope rationale          |
| Accessibility (a11y)                          | `target`     | Stepper buttons and inputs keep labels; `Mark done`, `Save`, and `Details` remain keyboard-accessible buttons with readable names.                                                    | component tests + screenshot/DOM review |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no route, data fetch, dependency, or heavy client payload change.                                                                                                    | dependency/diff review                  |
| Data placement and sync boundaries            | `target`     | No new server/local data boundary; existing check-in save path remains canonical and local UI state follows the latest route snapshot.                                                | data contract + diff review             |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing dynamic Habits route and mutation refresh behavior remain unchanged.                                                                                        | route/cache diff review                 |
| Reliability and failure handling              | `target`     | Invalid/out-of-range count edits fail safely through clamping, and back-forward/swept week navigation cannot strand the user on a stale visible week.                                 | component tests                         |
| Security and authz                            | `supporting` | Supporting only: protected Habits APIs/authz are untouched; no new endpoint or permission path.                                                                                       | changed-files review                    |
| Privacy and compliance                        | `supporting` | Supporting only: no new analytics/logging/storage of private habit labels or values.                                                                                                  | changed-files review                    |
| Content governance                            | `target`     | Parent, AW-006 queue, and design inventory record the post-merge polish slice and remaining deferrals.                                                                                | docs diff + brief lint                  |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, role-gated CRUD, operator labels, or admin recovery path changes.                                                                                      | explicit admin workflow rationale       |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is authenticated/private and no public metadata, sitemap, robots, or crawlable content changes.                                                      | private-route rationale                 |
| AI discoverability                            | `N/A`        | N/A because this creates no public crawl-safe entity, schema, or structured data.                                                                                                     | private-route rationale                 |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing `habits_viewed` remains unchanged.                                                                          | analytics diff review                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, entitlement, checkout, invoice, refund, or revenue operation changes.                                                                                          | commerce scope rationale                |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: no support procedure, incident path, recovery runbook, or operational diagnostic changes.                                                                   | explicit support scope rationale        |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance, billing, payout, invoice, refund, entitlement truth, or revenue reporting data changes.                                                         | explicit finance rationale              |
| i18n operational readiness                    | `target`     | Changed action layout avoids fixed-width wrapping/overlap for existing short labels and does not add non-localizable strings.                                                         | screenshot/class review                 |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, shared number stepper, My Library token classes, and current test stack; add no dependency.                                                               | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Focused Habits component tests, brief lint, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge` pass before merge recommendation.                                         | command output + screenshot artifacts   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new query, storage, polling, background job, or event-volume path.                                                                                                | diff review                             |
| DevOps and rollback readiness                 | `target`     | No migration; rollback is a normal revert of component/test/docs changes with no data cleanup.                                                                                        | rollback note + gates                   |

## Acceptance Criteria

1. Open count habits can be set to `0` and `100`.
2. Count stepper decrement stops at `0`; increment stops at `100`.
3. Saving `0` sends an explicit `valueNumeric` payload rather than treating it as missing.
4. Opening `Details` for an open count row does not duplicate `Value`/`Save`.
5. Desktop `Mark done` stays on one line.
6. Existing week swipe, previous week, next week, and browser back-forward route updates resync the visible selected day/week from the new snapshot.
7. Existing timed manual time, timer finish, rest day, edit, archive, selected-day history, and calendar controls remain unchanged.
8. Desktop habit pills sit immediately after the heading where space allows.
9. Open count `Save` and `Details` do not overlap.
10. Peer row controls share a stable visual height, and count steppers render as one segmented `- | input | +` control rather than detached buttons.

## Validation Plan

- Focused `HabitPerfectDayHub` component test.
- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `git diff --check`
- screenshot handoff before broad gates
- after owner screenshot approval: `npm run verify:pre-pr`, PR/CI, and `npm run verify:pre-merge`

## Route / Label / Support Sweep

Run before broad gate for:

- `Mark done`
- `Value`
- `Save`
- `Details`
- `Wall Slides`
- `NumberStepperField`
- `Previous week`
- `Next week`
- `date=`
- `/my-library/habits`

Surfaces: `app/`, `components/`, `tests/`, `docs/runbooks/`, `docs/task-briefs/`, `docs/design/`, and `docs/user-flow-map.md`.

Sweep evidence:

- `2026-06-04`: searched `Mark done`, `Value`, `Save`, `Details`, `Wall Slides`, `NumberStepperField`, `Previous week`, `Next week`, `date=`, and `/my-library/habits` across `app/`, `components/`, `tests/`, `docs/runbooks/`, `docs/task-briefs/`, `docs/design/`, and `docs/user-flow-map.md`.
- Fallout handled in `HabitPerfectDayHub`, focused Habits component tests, parent/queue/design inventory, this brief, and `docs/user-flow-map.md`.
- No Help/Guide or support runbook copy update required because labels and recovery behavior did not change.

## Checkpoint Log

- `2026-06-04 | in-progress | owner explicitly selected Habits post-merge polish after PR #985/#986; branch created from clean main@2d0abcf; scope is bounded to count input 0-100, duplicate Value/Save removal in Details, and no-wrap Mark done desktop action | next: finish implementation, run targeted validation, capture screenshot handoff, then stop for owner visual approval before verify:pre-pr`
- `2026-06-04 | implemented | fixed the shared number formatter that collapsed 10/100 to 1, added optional max-bounded steppers for open count check-ins, hid duplicate open check-in editors from Details when the row editor is already visible, and widened/no-wrapped peer actions so Mark done stays one line | validation: HabitPerfectDayHub component test PASS 43/43; targeted Habits unit pack PASS 6 files/78 tests; lint:quality-gates PASS; git diff --check PASS; lint:briefs -- --all PASS | next: capture screenshot handoff and stop for owner visual approval before verify:pre-pr`
- `2026-06-04 | implemented | owner added H-032: Habits swipe/previous/next/browser back-forward could change the URL without refreshing the visible selected week; resynced local Habits state from new route snapshots and added regression coverage | validation: HabitPerfectDayHub component test PASS 44/44 | next: rerun targeted Habits pack, docs lint, quality gates, diff check, then capture screenshot handoff`
- `2026-06-04 | implemented | owner added H-033/H-034/H-035 from desktop screenshots: pills should sit after the heading, open count Save must not overlap Details, and peer row controls should share one height; adjusted the row heading, quick editor grid, and shared Habits peer/stepper heights | next: rerun focused validation and regenerate screenshot handoff before owner visual approval`
- `2026-06-04 | screenshot-review | focused validation is green after the H-033/H-034/H-035 patch: HabitPerfectDayHub component test PASS 44/44, targeted Habits unit pack PASS 5 files/75 tests, eslint PASS, lint:briefs -- --all PASS, lint:quality-gates PASS, git diff --check PASS; refreshed screenshot artifacts are at output/habits-post-merge-polish-2026-06-04-23-08-34 | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot-review | owner correctly flagged that the mobile screenshot handoff used the standard route state instead of the `view=active` mobile entry state, making the calendar look always open and Add habit look too small; added mobile regression assertions for full-width Add habit plus Show/Hide week overview and refreshed artifacts at output/habits-post-merge-polish-2026-06-04-23-18-05 | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot-review | owner flagged that count stepper minus/plus still looked vertically detached from the input; converted the number stepper into one segmented control with shared border/radius and refreshed artifacts at output/habits-post-merge-polish-2026-06-04-23-26-35 | next: rerun focused validation and wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot-approved | owner approved the refreshed visual handoff and explicitly approved merge on good tests; focused validation after the segmented stepper patch is green: targeted Habits unit pack PASS 5 files/75 tests, eslint PASS, lint:briefs -- --all PASS, lint:quality-gates PASS, git diff --check PASS | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, and merge only if all gates stay green`
- `2026-06-04 | pre-pr-green | npm run verify:pre-pr PASS on the full public lane: branch-current PASS, lint/quality/env/pr-body/eslint/typecheck PASS, unit PASS 226 files/1349 tests, build PASS, perf budgets PASS, Playwright PASS 106 passed/530 skipped | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
