# Task Brief: Calendar Trends Swim Actuals Mapping V1 (10/10)

## Metadata

- `id`: `2026-06-23-calendar-stats-swim-actuals-mapping-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `end-to-end implementation after explicit owner execution approval`
- `parent_brief`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `prerequisite_briefs`:
  - `docs/task-briefs/planned/2026-06-23-training-history-multi-sport-activity-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@37179e90`
- `audit_status`: `ready`
- `decision`: Execute this bounded runtime slice now after owner said `execute Calendar Stats swim actuals mapping v1`.
- `reason`: `training_activity_events` now provides a private owner-scoped generic history foundation with a compatibility adapter, while Calendar Trends still renders Swimming as unmapped in `lib/my-library/calendar-comparison.ts`.
- `must_refresh_before_execution_if`: Refresh if `lib/my-library/calendar-comparison.ts`, `lib/my-library/calendar.ts`, `components/my-library/CalendarPeriodComparisonHub.tsx`, `lib/my-library/training-activity-events.ts`, `completed_activity_events`, `training_activity_events`, generated Supabase types, Calendar Plan, Review Actual, provider evidence, support docs, scorecard categories, or verification lanes change before execution.

## Goal

Map trusted manual swim actuals into Calendar Trends so `Swimming` compares completed swim history without allowing provider, unmapped, unsupported, or non-swim activities to count.

## Pre-Implementation Owner Explanation

Codex skal senere koble godkjente, manuelle svommeokter inn i Calendar `Trends`. Det betyr noe fordi appen allerede kan lagre faktisk svommehistorikk, men Trends sier fortsatt at svømming ikke er inkludert. Utenfor scope er Garmin/OAuth/import/FIT, Health API, provider reconciliation, AI-retrospektiv, non-swim dashboards, performance-ratchet og bred redesign.

## Product Decision

Recommended execution path:

1. Keep Calendar Plan and Review Actual as the mature planned-swim correction surfaces.
2. Use the generic activity-history adapter from `lib/my-library/training-activity-events.ts` as the boundary into Trends, not raw provider evidence.
3. Count only owner-scoped manual swim activities with trusted mapping states and supported completed/actual outcomes.
4. Keep provider evidence, non-swim rows, unknown sports, unsupported details, duplicates, orphaned rows, and `needs_review`/`unmapped` rows visible only as safe fallback/support diagnostics, not Trends totals.
5. Replace the current Swimming unmapped message only when the Trends source has deterministic swim metrics and tests.

This keeps FreeSwimming swimming-first while avoiding the old swim-only table assumption.

## Current Interface Evidence

| Surface                   | Current evidence                                                                                                                                                 | Implication for this slice                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Calendar Trends model     | Before this implementation, `lib/my-library/calendar-comparison.ts` had `swimming` in `MAPPED_SOURCE_FILTERS` but returned an unmapped Swimming support message. | The UI already has a Swimming source slot; this slice should fill that slot, not add a new route.                               |
| Generic activity adapter  | `lib/my-library/training-activity-events.ts` normalizes `training_activity_events` and `completed_activity_events` into `TrainingActivityHistoryView`.           | Trends should read through this boundary so old planned swim actuals and future canonical rows share one contract.              |
| Completed activity events | `completed_activity_events` remains planned manual swim actual truth.                                                                                            | Existing manual swim actuals may count only through the compatibility adapter and only for trusted swim outcomes.               |
| Provider evidence         | Provider evidence rows are private evidence only and can contain generic activity metadata.                                                                      | Provider evidence must not count in Trends until a later reconciliation child confirms canonical actual truth.                  |
| Multi-sport contract      | Future sports and provider aliases must fail closed until explicitly mapped.                                                                                     | Run/ride/walk/strength/yoga rows stay out of Swimming and out of All totals unless a future source mapping brief supports them. |

## Scope

Future implementation scope after explicit owner approval:

- Add a Calendar Trends Swimming source builder that uses the generic training activity history view-model.
- Count only trusted manual swim actual rows in the selected current/comparison windows.
- Include metrics that can be derived deterministically from current data:
  - completed swim activities,
  - swim distance where normalized meters exist,
  - swim duration/training minutes where duration seconds exist,
  - actual outcome mix for completed/changed/partial/cancelled/review-needed states as reported-only detail.
- Preserve existing Habits, Micro Sessions, Dryland, `All`, period, and comparison behavior.
- Keep `All` source totals source-based and explicit; `Swimming` should be included only when the Swimming source itself is trusted/mapped.
- Add unknown/future-value tests proving non-swim and provider rows do not count.
- Update support/API/docs only where the Trends behavior and diagnostics change.
- Capture screenshot handoff before PR gates because this changes user-facing Trends output/copy.

## Out Of Scope

- Garmin OAuth, Garmin Activity API runtime, Garmin Training API runtime, Health API, FIT/GPX/TCX parsing, provider jobs, webhooks, provider secrets, or Garmin attribution UI.
- Provider reconciliation, matching thresholds, sent-vs-received comparisons, or review actions.
- Manual non-swim logging, non-swim dashboards, sport filters beyond the existing `Swimming` source, or multi-sport segment handling.
- Changing Calendar Plan completion behavior, Review Actual editor behavior, planned workout mutation rules, or source workout/program authoring.
- AI-retrospective evaluation or adaptive replanning.
- Finance/reporting, commerce, public SEO/AI-discoverable pages, performance-budget ratchet, or `Ja.docx`.

## Domain Granularity Contract

User's mental object:

- "My completed swim training in Trends for this period."

Canonical objects:

- `training_activity_events.id` for future canonical generic history rows.
- `completed_activity_events.id` through the compatibility adapter for existing planned manual swim actuals.
- `planned_workout_instances.id`, `workout_id`, and `program_id` only as optional context, not Trends identity.

Mature reference surfaces:

- Trends source model: `lib/my-library/calendar-comparison.ts` and `CalendarPeriodComparisonHub`.
- Planned swim correction: `ReviewActualEditor`, `lib/my-library/review-actual.ts`, and `/my-library/calendar/actuals/[instanceId]`.
- Generic history adapter: `lib/my-library/training-activity-events.ts`.

Child object levels:

| Level                        | Meaning                                                                     | Active slice support                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Trends source summary        | One Swimming source card in Calendar Trends.                                | `view`                                                                                                                    |
| Activity summary             | One trusted swim actual with date, outcome, duration, distance, and source. | `view` for aggregate metrics; no row drilldown in this slice                                                              |
| Planned link                 | Optional context linking an actual to a planned swim.                       | `support-only`; no plan mutation                                                                                          |
| Swim session child structure | Steps/repeats from actual session snapshots.                                | `out of scope`; this source compares summary metrics only and links/reuses Review Actual for child-level correction later |
| Provider evidence            | Raw/summary received provider activity evidence.                            | `out of scope` for counting; `support-only` as explicit non-counting rationale                                            |
| Unknown/non-swim activity    | Activity with unsupported sport/source/mapping state.                       | `view` only as fail-closed test/support rationale, not Trends totals                                                      |

10/10 granularity gate:

- This slice may claim 10/10 for Trends source-level comparison only if tests prove the counted source rows are trusted swim summaries and unsupported child detail does not become trusted totals.
- It must not claim 10/10 for full swim-session review because detailed step/repeat review remains owned by Review Actual.

## Data Placement And Sync Contract

Server-canonical data:

- `training_activity_events` and read-through `completed_activity_events` rows are the activity-history source.
- Calendar Trends reads private owner-scoped rows; it does not create, edit, delete, reconcile, or backfill history.

Local-only data:

- Existing Calendar Trends selected source/period/query state only.
- No new local persistence.

Sync/conflict policy:

- Planned rows stay planning truth.
- Manual actual rows stay actual truth.
- Provider evidence stays evidence until a future reconciliation child maps it to canonical history.
- Unknown, non-swim, duplicate, orphaned, unsupported, schema-drift, or needs-review rows stay out of Swimming totals and trusted All-source comparisons.

Retention and sensitivity:

- Activity history remains private health/fitness-adjacent data.
- No raw provider files, biometric detail, tokens, or provider payloads are read for Trends.

Cache/invalidation:

- The authenticated Calendar Trends route remains private/dynamic through the existing route model.
- Future writes that change actual history must invalidate Calendar Trends through the same Calendar/history invalidation path documented by the implementation child.

## Identity And Rename Contract

- Canonical stable ID: activity-history row ID (`training_activity_events.id` or compatibility ID for `completed_activity_events`).
- Human-readable labels: `Swimming`, source labels, workout titles, and outcome labels are display-only and may change.
- Rename vs repurpose: renaming a workout/program preserves historical context; materially repurposed workouts/programs require new canonical entities before future history attaches.
- Compatibility: old planned swim actuals must remain resolvable through the compatibility adapter and must not require a backfill to count.
- Observability/repair: schema-missing, orphaned planned refs, unsupported detail, duplicate provider alias, unmapped sport/source, and malformed date/unit values must have deterministic fallback tests or support diagnostics.

## Forward Compatibility Contract

Data-driven automatically:

- Additional trusted manual swim rows with normalized duration/distance can be counted by the Swimming source without hardcoding today's row IDs or workout labels.
- Existing planned swim actuals can count through the compatibility adapter when their normalized source/sport/outcome/mapping states are trusted.

Explicit mapping required:

- Running, cycling, walking, strength, yoga, mobility, dryland, multi-sport/composite activities, provider-specific aliases, provider evidence, raw file detail, new outcome states, new source filters, Help/Guide labels, analytics/KPI events, and locale strings.

Safe fallback:

- Unknown, deprecated, ambiguous, duplicate, unsupported, non-swim, provider-evidence-only, or needs-review rows do not count as Swimming.
- Missing or inconsistent date/time/unit values keep the row out of trusted comparison metrics until normalized.
- Unknown source filters return unmapped/source-not-ready copy rather than false zero-success totals.

Future proof evidence:

- Unit fixtures for trusted swim, changed swim, partial swim, cancelled-as-actual, needs-review swim, non-swim rows, provider evidence rows, unknown sport/source, duplicate/orphaned rows, and missing unit/date values.
- Calendar Trends source mapping tests for `Swimming` and `All`.
- Route/label/support sweep for changed user-facing copy.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a future 10/10 claim: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Analytics and KPI observability, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                   | Evidence                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Calendar Trends `Swimming` becomes a clear swim-history comparison source without expanding FreeSwimming into a generic sport dashboard.             | source model tests + screenshot handoff    | `5/5`                   |
| UX flow clarity                               | `target`     | Users can distinguish mapped Swimming data from no-data, unmapped, unsupported, and needs-review states with no dead-end copy.                       | component tests + screenshot handoff       | `5/5`                   |
| Visual design quality                         | `target`     | Changed Trends source/card/copy matches existing CalendarPeriodComparisonHub spacing, typography, and responsive behavior.                           | screenshot handoff desktop/mobile          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Only trusted manual swim actuals count; provider, non-swim, unknown, duplicate, orphaned, unsupported, and needs-review rows fail closed.            | unit/invariant tests                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD surface, publishing flow, or operator editing task changes.                                                        | explicit admin-editor scope rationale      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Changed Trends content keeps semantic headings, links, labels, and keyboard-readable controls intact.                                                | component tests + screenshot/a11y review   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Trends reads are date-window bounded, avoid raw provider payloads/files, and do not add a new route bundle or heavyweight dependency.                | query review + perf gate                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Trends reads canonical activity history only and never mutates planned rows, actual rows, or provider evidence.                                      | data contract + tests                      | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Authenticated Calendar Trends freshness and future actual-history invalidation responsibilities are documented and preserved.                        | route/cache review + tests if paths change | `5/5`                   |
| Reliability and failure handling              | `target`     | Schema missing, malformed dates/units, empty ranges, unknown filters, and unsupported rows produce deterministic safe output, not unexpected `500`s. | negative-path tests                        | `5/5`                   |
| Security and authz                            | `target`     | Calendar Trends remains owner-scoped and rejects/cannot count cross-user rows through provider aliases or client-provided IDs.                       | authz/data-access tests                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Trends output is minimized summary data and does not expose raw provider payloads, files, tokens, or sensitive diagnostics.                          | privacy review + tests                     | `5/5`                   |
| Content governance                            | `target`     | Parent, multi-sport contract, support docs, and Trends copy agree on what Swimming counts and what remains unmapped.                                 | docs diff + route/support sweep            | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support diagnostics may change, but no admin workflow or editability surface changes.                                               | support runbook review                     | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because Calendar Trends is private authenticated data and creates no public crawl surface or metadata change.                                    | private-route rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private training history and Trends output are not public AI-discoverable content.                                                       | private-data rationale                     | `N/A`                   |
| Analytics and KPI observability               | `target`     | No new sport/source/status may enter KPI/Trends totals without typed mapping; Swimming metrics use stable source IDs.                                | source mapping tests                       | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice does not change pricing, checkout, entitlement, invoice, refund, payout, or revenue operation behavior.                       | explicit commerce scope rationale          | `N/A`                   |
| Incident response and support operations      | `target`     | Support can explain Swimming counted/not-counted states, schema-missing behavior, and why provider/non-swim rows are excluded.                       | support runbook/docs updates               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no revenue, refunds, payouts, invoices, entitlements, accounting, or finance reporting data changes.                                     | explicit finance scope rationale           | `N/A`                   |
| i18n operational readiness                    | `target`     | Source/outcome labels use typed mappings and unknown-safe copy so later locale expansion is not blocked by DB identity strings.                      | label mapping tests/review                 | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Calendar Trends and generic history adapter patterns; no new dependency, provider SDK, or parallel metrics system.                    | architecture review + package diff         | `5/5`                   |
| Testing and QA automation                     | `target`     | Include targeted source-builder tests, component tests, unknown/fail-closed tests, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.  | validation outputs                         | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Range-bounded owner/date reads avoid scanning raw provider payloads and scale with indexed activity history.                                         | query/index review + perf gate             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a reversible Trends mapping/copy change with no migration or provider runtime dependency.                                                | PR rollback note + gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `CalendarPeriodComparisonHub`; do not add a new route.
  - Preserve existing source/period query behavior and authenticated route boundary.
- TypeScript/domain:
  - Reuse `TrainingActivityHistoryView` and typed training activity normalizers.
  - Add a small Swimming source builder with deterministic filters for source kind, sport, mapping status, outcome, date, duration, and distance.
  - Unknown values normalize to safe exclusion, not success.
- Supabase/data:
  - Prefer existing read paths/adapter helpers; no migration expected.
  - If implementation requires direct DB reads, they must be owner-scoped, window-bounded, type-safe, and covered by negative-path tests.
- External services:
  - No provider SDK/docs/runtime in this slice.
  - Garmin/Health/FIT work remains blocked by separate online-audit/runtime briefs.
- UI system:
  - Reference surface is existing Calendar Trends source cards and controls.
  - Screenshot handoff is required because user-facing Trends copy and source content changes.
- Testing:
  - Unit tests for Swimming source builder and fail-closed rows.
  - Component tests for mapped/no-data/unmapped states.
  - Existing Calendar page/component tests for Plan/Trends navigation.
  - Screenshot handoff before broad PR gates.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, `rg`, repo task-brief linting, current `playwright` skill for future screenshot handoff.
- Evaluate later: no Codex plugin install needed; future provider runtime still needs a fresh official-doc/provider-sample audit.
- Install/config changes: none.

Systemic findings:

| Surface            | Finding                                                                                              | Severity | Recommended Type                 | Owner Decision Needed           | Follow-Up Brief Path           |
| ------------------ | ---------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------- | ------------------------------ |
| Calendar Trends    | Swimming source slot already exists but is unmapped despite manual swim actual history now existing. | `high`   | `bounded implementation child`   | no, if owner chooses this slice | this brief                     |
| Provider evidence  | Provider rows can contain activity metadata but are not completion truth.                            | `high`   | `do not do` for this slice       | no, keep blocked                | blocked Garmin/provider briefs |
| Multi-sport Trends | Non-swim activity values need explicit sport/source mappings before any totals.                      | `medium` | `deferred architecture decision` | yes, later supported sport set  | future multi-sport Stats child |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: PR `#1219` and docs-only closeout PR `#1220`, with `main@37179e90` clean and synced.
- Current active child: this brief is in `docs/task-briefs/in-progress/` on branch `calendar-stats-swim-actuals-v1` after owner explicitly said to execute the Trends mapping implementation.

## Help/Guide And Support Impact

Future implementation requires:

- Update `docs/runbooks/auth-account-support.md` if the visible support explanation for Calendar Trends `Swimming` changes.
- Update `docs/user-flow-map.md` if Calendar Trends source behavior is described there.
- Help/Guide runtime copy is required only if the app has Help/Guide assertions for Calendar Trends source labels; otherwise record an explicit `N/A` rationale in the implementation PR.

## Route / Label / Support Surface Sweep

Required before broad gate if this brief is executed:

- `rg -n "Swimming will be included|Stats|Calendar Trends|completed swim|completed_activity_events|training_activity_events|Review actual|provider evidence|unmapped|needs review" app components lib tests docs`
- Check at minimum `app/`, `components/`, `lib/`, `tests/`, `types/`, `docs/api-contracts.md`, `docs/runbooks/auth-account-support.md`, `docs/user-flow-map.md`, active/planned/blocked/done task briefs, and Help/Guide assertions when relevant.

Execution evidence:

- Identifiers searched: `Swimming will be included`, `Stats`, `Calendar Trends`, `completed swim`, `completed_activity_events`, `training_activity_events`, `Review actual`, `provider evidence`, `unmapped`, and `needs review`.
- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/api-contracts.md`, `docs/runbooks/auth-account-support.md`, `docs/user-flow-map.md`, active/planned/blocked/done task briefs, and relevant Help/Guide assertion references found by the sweep.
- Fallout handled: runtime/support/API/user-flow copy now says Swimming counts trusted manual swim actuals only; stale dated task-brief history entries were left as historical evidence of the pre-mapping state.

## Quality-Gate Evidence Contract

Triggered classes expected:

- `data_integrity`: Trends source must prove trusted swim-only inclusion and fail-closed exclusions.
- `security_privacy`: private activity history remains owner-scoped and minimized.
- `performance_cost`: Calendar Trends reads must remain bounded and payload-light.
- `route_label_support`: changed source/copy/support labels require sweep and support docs.
- `print_export_screenshot`: screenshot handoff required because user-facing Trends output changes.

## Acceptance Criteria

1. Calendar Trends `Swimming` is mapped from trusted manual swim actuals through the generic activity-history boundary.
2. Provider, non-swim, unknown, unsupported, duplicate, orphaned, schema-drift, and needs-review rows do not count.
3. `All` includes Swimming only through the same trusted mapped source behavior and does not collapse unknown activity values into totals.
4. Empty/no-data states distinguish "no trusted swim actuals in range" from "source unmapped/unsupported".
5. Calendar Plan and Review Actual behavior remain unchanged.
6. Support/docs explain what Swimming counts and why provider/non-swim rows remain excluded.
7. Screenshot handoff shows changed Trends surface on representative desktop/mobile viewports before PR gates.
8. Targeted tests, route/support sweep, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

Planning validation for this brief:

- `npm run lint:briefs`
- `git diff --check`

Future implementation validation:

- targeted unit tests for Swimming source metrics and fail-closed filters,
- targeted component tests for mapped/no-data/unmapped Trends states,
- Calendar page/navigation regression tests,
- screenshot handoff and owner approval before `verify:pre-pr`,
- `npm run verify:pre-pr`,
- required CI,
- `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-23 | planned | created from clean synced main@37179e90 after PR #1219 and closeout #1220; selected as the next recommended bounded runtime candidate because generic activity history now exists and Calendar Trends still shows Swimming as unmapped | next: wait for explicit owner instruction before moving to in-progress or implementing`
- `2026-06-23 | in-progress | owner said "execute Calendar Stats swim actuals mapping v1"; branch calendar-stats-swim-actuals-v1 created and brief moved to in-progress | next: audit Calendar Trends/activity-history data flow, implement the bounded Swimming source mapping, run targeted tests, then stop for screenshot handoff before pre-PR gates`
- `2026-06-23 | in-progress | implemented a bounded Swimming Trends source builder, loader reads for training_activity_events plus completed_activity_events compatibility rows, dedupe for completed aliases, fail-closed filters for provider/non-swim/unknown/duplicate/orphaned/unsupported/needs-review rows, and support/user-flow/API docs updates | validation: targeted Calendar comparison/component Vitest passed | next: run broader targeted validation, then capture screenshot handoff`
- `2026-06-23 | in-progress | completed route/label/support sweep across app, components, lib, tests, docs, support docs, user-flow map, API contracts, and task-brief history; runtime/support fallout is updated and dated historical task-brief notes are intentionally left as old-state evidence | validation: npm run lint passed with existing output-script warnings; npm run lint:briefs:all passed | next: rerun quality-gate evidence, then capture screenshot handoff`
- `2026-06-23 | in-progress | added loader coverage proving owner-scoped, date-bounded Swimming reads and completed_activity_events compatibility dedupe; captured after-only screenshot handoff in output/calendar-stats-swim-actuals-v1-2026-06-23-035335 with a temporary local visual harness rendering the real CalendarPeriodComparisonHub and deterministic mock data, then removed the harness route from the diff | validation: targeted Vitest 4 files/23 tests passed, typecheck passed, lint:quality-gates passed | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, push, PR, CI, and verify:pre-merge`
- `2026-06-23 | in-progress | owner flagged desktop Source and Period controls were vertically misaligned; fixed CalendarPeriodComparisonHub desktop control grid with lg:items-end and regenerated after-only screenshot handoff in output/calendar-stats-swim-actuals-v1-2026-06-23-035957, then removed the temporary harness route again | validation: calendar-period-comparison-hub Vitest passed | next: wait for next owner visual finding or screenshot approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner flagged single-source Source signals card did not fill the available desktop width; changed CalendarPeriodComparisonHub to use the two-column source grid only when multiple sources are shown, added component coverage for single-source full-width vs multi-source grid behavior, and regenerated after-only screenshot handoff in output/calendar-stats-swim-actuals-v1-2026-06-23-040211, then removed the temporary harness route | validation: calendar-period-comparison-hub Vitest passed | next: wait for next owner visual finding or screenshot approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner clarified this surface reads as motivation/trend stats and real swim statistics require Garmin/provider integration later; changed user-facing Calendar comparison copy from Stats/Source signals/Detailed numbers to Trends/Training summary/Comparison details while preserving the view=compare route and current manual-actual-only data boundary; regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-040921, then removed the temporary harness route | validation: targeted Vitest 4 files/23 tests passed, typecheck passed, route/label sweep found no active stale Stats labels except exact owner quotes/history | next: wait for next owner visual finding or screenshot approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner completed visual findings pass; changed partial week copy to selected range/this week so far/last week same days, shortened insight copy to this week vs last week, renamed Swim activities to Completed swims, replaced Trusted rows/Outcome mix/Excluded rows with Counted swims/Session status/Not counted, changed single-source comparison cards to Ready/Nothing dropped copy, and added a mobile Source dropdown while keeping Period as segmented buttons; regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-042450, then removed the temporary harness route | validation: targeted Vitest 4 files/23 tests passed, component Vitest passed after final copy tweak, typecheck passed, lint passed with existing output-script warnings, lint:briefs:all passed | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner flagged that "+1 completed swim" duplicated the metric label; changed Completed swims delta to display only "+1" while keeping the metric/body labels explicit, regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-043027, then removed the temporary harness route | validation: targeted Vitest 4 files/23 tests passed, typecheck passed | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner asked why last week shows only five days; explained that selected Friday uses this-week-so-far against the same weekdays last week for a fair 5-day vs 5-day trend, and owner chose to keep that behavior for now | validation: lint passed with existing output-script warnings after latest copy change; targeted tests/typecheck/brief-lint/diff-check were green after the screenshot refresh | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner refined the Swimming Trends readout: hero title is now neutral Completed Swim Sessions, hero body is compact this-week-vs-last-week copy, duplicate selected-range/summary copy is removed from the main Swimming card, Completed swims is not repeated as a row, Training minutes is renamed Swimming minutes, Session status and Not counted move into the details drawer, metric rows use "This week ... vs ... last week", and comparison details labels now name the active source for single-source views | validation: targeted Calendar comparison/component Vitest passed, typecheck passed, lint passed with existing output-script warnings, lint:briefs:all passed, git diff --check passed | next: regenerate screenshot handoff before npm run verify:pre-pr`
- `2026-06-23 | in-progress | tightened the mobile hero layout and changed the mobile comparison-details metrics from a narrow four-column table to stacked metric cards while preserving the desktop table; regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-094756 with a temporary local visual harness using deterministic mock swim data, then removed the harness route from the diff | validation: component Vitest passed and typecheck passed before final validation rerun | next: send screenshot handoff and wait for owner approval before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner requested the Swimming view be less generic and easier to scan; removed the three generic single-source insight cards for Swimming, changed the hero to "+1 Completed swims" with natural no-colon copy, converted Training summary into three compact metric columns, and reduced Swim comparison details to diagnostic Session status/Not counted information without duplicating the main metrics; regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-102836 with a temporary local visual harness, then removed the harness route from the diff | validation: component Vitest passed, typecheck passed, lint passed with existing output-script warnings, git diff --check passed before screenshot capture | next: rerun clean validation and send screenshot handoff before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner requested final Swimming polish: removed the duplicate "Completed swims" label beside the +1 hero value, vertically centered the hero explanation against the value, kept metric deltas on the same line as their values when space allows, renamed details to Session completion status and Sessions not counted, expanded the completion status wording to completed as planned / partial completion, and added cleaner details separators; regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-110000 with a temporary local visual harness, then removed the harness route from the diff | validation: targeted Vitest passed, typecheck passed, lint passed with existing output-script warnings, git diff --check passed before screenshot capture | next: rerun clean validation and send screenshot handoff before npm run verify:pre-pr`
- `2026-06-23 | in-progress | owner approved the final readability simplification: kept What changed, removed the redundant single-source Completed Swim Sessions heading, renamed Training summary to Swim summary, removed the inner Swimming headings from the summary and details cards, renamed the drawer to Swim calculation details, and shortened the diagnostic labels to Session completion and Excluded sessions; regenerated after-only screenshot handoff in output/calendar-trends-swim-actuals-v1-2026-06-23-111440 with a temporary local visual harness, then removed the harness route from the diff | validation: targeted Calendar comparison/component Vitest passed, typecheck passed, lint passed with existing output-script warnings, git diff --check passed before screenshot capture | next: send screenshot handoff and wait for owner approval before npm run verify:pre-pr`
- `2026-06-23 | done | PR #1221 merged to main as squash commit a6f70b7576ebb4d305f045b4767de9f82c4b12d2; regenerated final screenshot evidence after commit formatting in output/calendar-trends-swim-actuals-v1-2026-06-23-115050, owner approved the visual result, and post-merge preflight surfaced this repo-managed docs-only closeout | validation: CI green after one isolated unit-test flake rerun, npm run verify:pre-merge passed | next: close this brief in done`

## Completion Record

- `completed`: `2026-06-23`
- `merged_pr`: `#1221`
- `squash_commit`: `a6f70b7576ebb4d305f045b4767de9f82c4b12d2`
- `result`: Closed Calendar Trends Swim Actuals Mapping V1. Calendar Trends now maps `Swimming` from trusted manual swim actuals, keeps provider/non-swim/needs-review/unmapped/unsupported rows excluded, and presents the single-source swim comparison with shorter, clearer summary and calculation details.
- `validation`: Targeted Calendar comparison/page/component Vitest passed; `npm run typecheck` passed; `npm run lint` passed with pre-existing `output/*` warnings only; `npm run lint:briefs:all` passed; `npm run verify:pre-pr` passed on `4c5575c1`; PR #1221 CI passed after one isolated session-generator unit-test flake rerun; `npm run verify:pre-merge` passed and recorded `artifacts/verify-pre-merge/20260623-095225.json`.
- `screenshot_evidence`: `output/calendar-trends-swim-actuals-v1-2026-06-23-115050` captured `2026-06-23 11:50`, after-only desktop/mobile and details screenshots from the committed UI code.
- `10/10 claim`: yes for the scoped Calendar Trends swim source-level comparison. All critical target categories reached `5/5`; this does not claim 10/10 for Garmin/provider runtime reconciliation, FIT parsing, Health API integration, or full swim-session step/repeat review.

| Category                                      | Achieved Score | Evidence                                                                                       | Gaps / Notes                                                                  |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #1221, screenshot handoff, Calendar Trends source tests                                     | FreeSwimming remains swim-first; no generic multi-sport dashboard expansion.  |
| UX flow clarity                               | `5/5`          | Owner-reviewed screenshot handoff and component tests for mapped/no-data states                | None for this Trends source slice.                                            |
| Visual design quality                         | `5/5`          | Final desktop/mobile screenshots in `output/calendar-trends-swim-actuals-v1-2026-06-23-115050` | None after owner-approved readability polish.                                 |
| Business logic correctness and data integrity | `5/5`          | `tests/unit/my-library-calendar-comparison.test.ts` trusted/excluded row coverage              | Provider runtime truth remains deferred.                                      |
| Accessibility (a11y)                          | `5/5`          | Component tests plus semantic control/heading review                                           | None for changed controls and disclosure.                                     |
| Performance (CWV + payloads)                  | `5/5`          | Date-window bounded reads, no provider payload reads, `npm run verify:pre-pr` perf gate        | Performance-ratchet tightening remains a separate maintenance slice.          |
| Data placement and sync boundaries            | `5/5`          | Read-only Calendar Trends mapping through canonical activity history                           | No writes/sync behavior changed.                                              |
| Caching and invalidation strategy             | `5/5`          | Authenticated Calendar route behavior preserved; no new cache layer                            | Future provider ingestion invalidation remains out of scope.                  |
| Reliability and failure handling              | `5/5`          | Fail-closed tests for non-swim, needs-review, duplicate, missing-date, and unsupported rows    | None for active slice.                                                        |
| Security and authz                            | `5/5`          | Owner-scoped loader coverage and no client-provided provider alias trust                       | None for active slice.                                                        |
| Privacy and compliance                        | `5/5`          | Minimized summary output; no raw provider payloads, tokens, files, or diagnostics exposed      | None for active slice.                                                        |
| Content governance                            | `5/5`          | `docs/api-contracts.md`, support runbook, user-flow map, and parent brief updates              | Historical dated task-brief notes intentionally remain as old-state evidence. |
| Analytics and KPI observability               | `5/5`          | Stable source/metric IDs and typed mapping tests                                               | Future non-swim sport totals require explicit mapping.                        |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` explains counted/excluded swim states                  | None for active slice.                                                        |
| i18n operational readiness                    | `5/5`          | Labels remain typed/centralized and unknown-safe                                               | Full locale extraction remains future platform work, not required here.       |
| Stack-fit and dependency discipline           | `5/5`          | Reused Calendar Trends hub and generic activity-history adapter; no new dependency             | None for active slice.                                                        |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`                | One unrelated CI unit-test flake was rerun once after local pass.             |
| Scalability and cost efficiency               | `5/5`          | Range-bounded owner/date history reads; no raw provider file scan                              | None for active slice.                                                        |
| DevOps and rollback readiness                 | `5/5`          | Squash PR #1221, no migration, reversible Trends mapping/copy change, green pre-merge gate     | Rollback is reverting `a6f70b7576ebb4d305f045b4767de9f82c4b12d2`.             |
