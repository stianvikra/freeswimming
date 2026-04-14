# Task Brief: Swim Session Builder Pool Unit Toggle Defaults (10/10)

## Metadata

- `id`: `2026-04-14-swim-session-builder-pool-unit-toggle-defaults-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-14`
- `updated`: `2026-04-14`

## Goal

Make the swim-session-builder pool-unit toggle predictable by switching authoring mode to a clear default state instead of converting the current exact pool-size value across units.

## Why This Brief Exists

- The current pool-size control supports both `Meters` and `Yards`, but the active toggle behavior still reads like a technical unit-conversion tool instead of a human authoring choice.
- The owner feedback is specific:
  - switching between `Meters` and `Yards` should not convert the current exact value,
  - clicking `Meters` should land in a clear `25m` default state,
  - clicking `Yards` should land in a clear `25yd` default state.
- This is not a dryland, generator, or program-builder problem.
- This should be treated as a narrow swim-builder child brief:
  - preserve the existing meter-canonical save/export contract,
  - keep the shipped pool-size parity work intact,
  - and change only the authoring interaction model for the pool-unit toggle.

## Dependencies And Boundaries

- Parent swim-session builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Relevant shipped pool-size child briefs this slice must extend rather than reopen:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-pool-size-rest-and-support-surface-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-pool-size-rest-and-support-surface-polish-10-10.md)
- Primary implementation surfaces expected in scope when this brief is executed:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/generator/SessionGeneratorPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/generator/SessionGeneratorPanel.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/session-generator-panel.test.tsx](/Users/stianvikra/freeswimming/tests/unit/session-generator-panel.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no yard-native persistence,
  - no save/export/handoff model rewrite,
  - no dryland-builder changes,
  - no generator prompt or program-planner UX work,
  - no session-action wording cleanup in this slice.

## Product Direction Locked By This Brief

1. The pool-unit toggle is an authoring-mode switch, not a low-value conversion tool.
2. Clicking `Meters` should always land on a fresh meter default state.
3. Clicking `Yards` should always land on a fresh yard default state.
4. Common presets and exact input should remain synchronized inside the active unit.
5. Canonical save/export data remains meter-based even when the builder is authored in yards.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Pool-size authoring clearly communicates that unit selection chooses a new active authoring mode and default starting point.                                             | brief review + manual QA             | `5/5`                   |
| UX flow clarity                               | `target`     | Switching `Meters` / `Yards` is immediately understandable with no surprising value conversion; the active preset and exact input always match the chosen unit.          | targeted unit/e2e + manual QA        | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: the visible control should remain visually coherent, but this slice does not primarily redesign layout or spacing.                                      | screenshot review + code review      | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Pool-unit toggle behavior, preset selection, exact input state, save/reload, and meter-canonical persistence remain deterministic with no hidden conversion corruption.  | targeted tests + code review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated owner-facing swim builder, not an admin editor workflow.                                                                | explicit scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Unit buttons, preset buttons, exact input, and state announcements remain keyboard-usable and clearly labeled after the interaction change.                              | targeted QA + code review            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the new toggle behavior must not add heavy conversion logic, expensive rerenders, or measurable builder-route lag.                                      | `npm run build` + interaction QA     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief explicitly preserves local authoring state vs server-canonical meter persistence and defines how unit/default changes affect only the local editor until save. | brief contract + implementation diff | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing save/reload invalidation rules remain authoritative; this slice should not introduce new cache behavior.                                       | workflow review                      | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid exact input, unit switching, reload, and legacy meter-default reads remain deterministic and never strand the editor in a mismatched unit/preset state.          | targeted tests + manual QA           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: this slice stays inside existing owner-scoped builder routes and does not change protected write-path authorization.                                    | route review                         | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice introduces no new personal-data collection, sharing, retention, or logging behavior.                                                              | explicit scope rationale             | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: visible labels remain product copy, but no content-source-of-truth workflow changes here.                                                               | copy review                          | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow, publish state, or admin mutation model changes here.                                                                             | explicit scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library route with no public crawl/index contract.                                                                               | explicit scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata, structured content, or public route semantics.                                                                        | explicit scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not add or change analytics events; it only refines local builder interaction semantics.                                                     | explicit scope rationale             | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, or billing surface changes are involved.                                                                                  | explicit scope rationale             | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this interaction change does not alter support tooling, runbooks, or incident recovery paths beyond normal builder QA.                                       | explicit scope rationale             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, refund, payout, or reporting workflow changes in this slice.                                                                                     | explicit scope rationale             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice stays within private English builder labels and does not introduce a new localization blocker or routing model.                                   | explicit scope rationale             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The slice must reuse the current builder/editor state model and add no dependency or parallel pool-size abstraction.                                                     | dependency diff + code review        | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit and e2e coverage prove the toggle-default contract, shared-editor behavior, and save/reload continuity; `verify:pre-pr` and `verify:pre-merge` must pass.           | updated tests + verify outputs       | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this slice changes no background jobs, query plan, or cost-bearing runtime architecture.                                                                     | explicit scope rationale             | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this should remain a straightforward code rollback with no schema or migration repair path.                                                             | diff review + validation notes       | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - workout row identity,
  - canonical workout draft payload,
  - persisted pool length in meters,
  - any existing saved unit/pool-size compatibility fields already in the builder contract.
- Local-only data:
  - active authoring unit in the editor before save,
  - active preset selection,
  - current exact-input text state,
  - immediate default-state reset caused by clicking `Meters` or `Yards`.
- Sync policy:
  - clicking the unit toggle mutates only local editor state until save,
  - save continues to normalize into the existing meter-canonical contract,
  - reload must restore the canonical saved workout state through the existing compatibility rules.
- Retention and sensitivity:
  - no new retained data is introduced,
  - no hidden persistence of discarded exact-input values across unit switches is required in this slice.
- Cache/invalidation:
  - save/delete/list refresh remains unchanged,
  - the new unit-toggle behavior must not require a new cache layer or alternate editor snapshot source.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the canonical stable identity for saved session routes and writes.
- Human-readable identifiers:
  - `Meters`, `Yards`, `25m`, and `25yd` are mutable UI labels only, not identifiers.
- Mutability rules:
  - authoring unit, active preset, and exact input remain editable in place before save,
  - saved workout identity and route param behavior remain unchanged.
- Rename vs repurpose policy:
  - switching the toggle changes current local authoring mode only,
  - it must not silently repurpose the saved workout into a different canonical entity.
- Compatibility contract:
  - legacy workouts without explicit unit continue to load through the existing meter-default read path,
  - this slice must not break older saved workouts that already depend on current compatibility behavior.
- Observability and repair:
  - unit/preset/input mismatches should be detectable through targeted tests and manual QA on both newly created and older saved workouts.

## Scope

- Update the pool-unit toggle behavior in the manual swim-session builder:
  - clicking `Meters` sets the pool-size control to the meter default state,
  - clicking `Yards` sets the pool-size control to the yard default state,
  - unit switching no longer converts the current exact pool-size value into the other unit.
- Define the default state explicitly:
  - `Meters` -> `25m` preset active, exact input `25`, suffix `m`,
  - `Yards` -> `25yd` preset active, exact input `25`, suffix `yd`.
- Keep exact input and preset buttons synchronized inside the active unit after the toggle reset.
- Preserve support for uncommon pool sizes through exact input in the active unit.
- Preserve the existing meter-canonical save/export/handoff contract.
- Update targeted tests for the shared builder/editor contract.

## Out Of Scope

- Rewording session actions such as `Discard changes` or `Delete session`.
- Autosave, revision history, or local draft persistence changes.
- Generator prompt changes, dryland builder, or program-builder scope.
- Yard-native persistence or export payload redesign.
- Step-distance conversion redesign beyond existing shared builder behavior.

## Acceptance Criteria

1. Clicking `Meters` always lands on the meter default state with `25m` active and exact input `25`.
2. Clicking `Yards` always lands on the yard default state with `25yd` active and exact input `25`.
3. Switching units no longer converts the current exact value across units.
4. Preset selection and exact input remain synchronized within the active unit after switching.
5. Saving and reloading the workout remains deterministic and meter-canonical.
6. Older saved workouts still load safely through the existing compatibility path.
7. Shared editor behavior remains aligned across the dedicated saved-workout route and any generator handoff surface that uses the same editor.
8. Relevant unit/e2e coverage and `verify:pre-pr` / `verify:pre-merge` pass before merge.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/session-generator-panel.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run build`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>?entry=manual-pool`
- Preview:
  - Vercel preview URL from the PR checks.
- Recommended browser/device matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit

## Constraints

- Keep all visible UI copy in English.
- Treat the unit toggle as an authoring-mode choice, not a calculator.
- Do not add hidden complexity just to preserve cross-unit custom exact values.
- Preserve the current canonical save contract and existing route identity.
- Keep the slice narrow and child-brief sized.

## 10/10 Quality Bar

- The pool-size control should feel immediately predictable on first use.
- No surprising cross-unit math should happen when the user is just changing authoring mode.
- The active unit, active preset, exact input, and visible suffix must always agree.
- Required states remain clear:
  - loading: unchanged,
  - empty: unchanged,
  - error: invalid exact input remains visible and recoverable,
  - retry: save failures keep the local editor state intact,
  - offline: no silent data loss or hidden conversion behavior.
- Accessibility expectations:
  - unit buttons, preset buttons, and exact input remain keyboard reachable,
  - visual state and accessible labels stay aligned after the toggle reset behavior.
- Business-logic expectations:
  - deterministic local state transitions,
  - no silent corruption of saved pool length,
  - no mismatch between visible unit state and persisted meter-canonical workout values.

## Checkpoint Log

- `2026-04-14 | planning | created a dedicated child brief for pool-unit-toggle defaults after owner feedback clarified that the current meter/yard switch reads like a pointless conversion tool instead of a clear authoring-mode choice | next: implement the toggle-default contract as a narrow shared-editor slice with targeted builder tests`
- `2026-04-14 | in-progress | moved the brief into execution, updated the shared workout editor so unit switches reset to explicit 25m/25yd defaults instead of converting the current exact value, and added targeted hub/generator/e2e coverage for the new toggle contract | next: run targeted validation, full verify gates, then prepare PR handoff`
- `2026-04-14 | in-progress | validation passed across targeted vitest, targeted desktop Playwright, lint:briefs:all, and npm run verify:pre-pr; refreshed one stale merge-preflight unit fixture so repo-wide verification reflects the current brief lifecycle on main | next: commit, push, open the PR, watch CI, run npm run verify:pre-merge, and summarize merge readiness`
