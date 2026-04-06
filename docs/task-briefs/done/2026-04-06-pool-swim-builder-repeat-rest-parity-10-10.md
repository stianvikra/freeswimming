# Task Brief: Pool Swim Builder Repeat/Rest Parity (10/10)

## Metadata

- `id`: `2026-04-06-pool-swim-builder-repeat-rest-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-06`
- `updated`: `2026-04-06`

## Goal

Pool repeat blocks in the manual builder expose Garmin-like final-rest behavior and keep saved totals, summaries, handoff/export output, and poolside text truthful when the last rest interval is used or skipped.

## Why This Brief Exists

- The pool builder field/entry slices are already shipped, but the biggest remaining Garmin parity gap is still behavioral rather than visual.
- Garmin's official pool-workout guidance explicitly allows swimmers to choose whether the last rest interval in a repeat block is used, which is not modeled in FreeSwimming yet.
- FreeSwimming currently repeats every step in a repeat block the full `repeatCount`, so a block ending with a rest step always counts the last rest interval even when the intended workout semantics are "rest between rounds, not after the final round".
- That gap leaks beyond the editor:
  - derived totals overcount rest time,
  - repeat summaries imply every round uses the final rest interval,
  - handoff/export output cannot express the final-rest choice,
  - poolside notes cannot distinguish between "use" and "skip" for the last rest interval.

Reference source:

- Garmin support: `Pool Swim Workouts` states that after adding a repeat block rest interval, the swimmer can choose whether the last rest interval is used in the block.

## Dependencies And Boundaries

- Parent parity direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Already shipped prerequisite slices:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-field-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-metadata-panel-clarity-10-10.md`
- Primary code surfaces likely touched:
  - `/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-server.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`

## Product Direction Locked By This Brief

- This slice is `pool`-specific parity work.
- `open water` must keep its current separate non-parity path and must not inherit this repeat/rest control unless a later brief chooses that deliberately.
- Repeat blocks that end on a rest step should expose an explicit final-rest policy in pool mode:
  - `Use last rest interval`
  - `Skip last rest interval`
- The final-rest policy must be truthful all the way through:
  - builder summary,
  - derived totals,
  - saved canonical workout draft,
  - Garmin-ready export payload,
  - handoff text,
  - PDF/poolside note text where the semantics matter.
- Backward compatibility rule:
  - legacy saved repeat blocks without explicit final-rest metadata must continue to load safely and preserve current behavior by default.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                      | Evidence                                  |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `target`     | Pool repeat blocks clearly expose the Garmin-like final-rest choice without reopening the older generic-builder confusion.                                        | manual QA + targeted e2e                  |
| UX flow clarity                               | `target`     | A swimmer editing a pool repeat block can tell whether the last rest interval is used or skipped without mentally simulating the set.                             | targeted e2e + manual QA                  |
| Visual design quality                         | `supporting` | Supporting only: the new repeat-rest control fits the existing calm builder layout and does not feel bolted on.                                                   | screenshot review + manual QA             |
| Business logic correctness and data integrity | `target`     | Repeat blocks with `skip last rest interval` save deterministically and no longer overcount the final rest interval in canonical totals or derived summaries.     | unit tests + integration review           |
| Admin editor ergonomics                       | `target`     | The owner can build Garmin-like pool repeats without manual workaround steps such as extra post-block cleanup or mental translation of repeated rest semantics.   | targeted tests + manual QA                |
| Accessibility (a11y)                          | `supporting` | Supporting only: the final-rest control is label-clear, keyboard reachable, and screen-reader legible in the repeat-block header.                                | code review + targeted tests              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the repeat-rest parity logic does not materially regress `/my-library` or workout detail responsiveness.                                         | targeted review + verify                  |
| Data placement and sync boundaries            | `target`     | Final-rest policy is persisted only in the canonical workout draft model and maps deterministically into all downstream summaries/exports.                        | brief contract + code review              |
| Caching and invalidation strategy             | `supporting` | Supporting only: repeat-rest edits continue to use existing local-draft and canonical-save invalidation behavior without a second shadow state.                   | integration review                        |
| Reliability and failure handling              | `target`     | Invalid mixed repeat metadata or legacy blocks fail closed with explicit validation errors instead of silently drifting to ambiguous rest behavior.                | negative-path tests + manual QA           |
| Security and authz                            | `supporting` | Supporting only: workout editing remains owner-scoped and authenticated; this slice changes no permission boundary.                                                | existing auth coverage                    |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes owner-scoped workout semantics only and introduces no new personal-data surface or disclosure path.                                | explicit scope rationale                  |
| Content governance                            | `target`     | Garmin parity wording for final-rest behavior stays centralized and consistent across builder copy, summaries, and exports.                                       | parity review + code review               |
| Admin workflow and editability                | `target`     | The owner can repeatedly build, save, reopen, and export pool repeat blocks without losing or reinterpreting the chosen last-rest behavior.                      | unit/e2e + manual QA                      |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated My Library routes with no public indexing contract.                                                                            | explicit scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, metadata, or AI-facing discoverability contract.                                                                  | explicit scope rationale                  |
| Analytics and KPI observability               | `supporting` | Supporting only: pool repeat semantics remain inspectable through existing builder state and exported payloads even without new analytics instrumentation.         | scope review                              |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, checkout, or revenue-reporting path changes.                                                                        | explicit scope rationale                  |
| Incident response and support operations      | `supporting` | Supporting only: exported/handoff wording should be clear enough that support can diagnose whether a repeat block intentionally skips its final rest interval.     | docs/output review                        |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payouts, billing, or operator reporting path changes in this workout-builder slice.                                        | explicit scope rationale                  |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes internal English builder wording only and must avoid hard-coding parity logic into non-structural copy.                            | explicit scope rationale                  |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout draft model and shared helper stack; do not introduce a new persistence layer or external dependency for repeat semantics.             | dependency diff + architecture review     |
| Testing and QA automation                     | `target`     | Coverage protects builder control state, canonical persistence, derived totals, and exported repeat summaries before PR update.                                   | unit/e2e coverage + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Supporting only: the new repeat metadata remains a small deterministic extension to existing JSON payloads and does not add runtime churn or extra write paths.  | code review                               |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice remains reversible as an additive workout-draft compatibility change without destructive schema migration.                              | rollback note + diff review               |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`
  - canonical workout draft rows
  - repeat step metadata including final-rest policy once a workout is saved
- Local-only:
  - unsaved repeat-rest selection changes before save
  - open/closed editor UI state
  - transient validation/help text tied to the repeat header
- Sync policy:
  - repeat-rest selection updates the local draft immediately
  - canonical save writes the same repeat metadata through the existing workout save API
  - derived totals and support/export previews recompute from the same local draft state before save
  - reopened saved workouts read the persisted repeat metadata and render the same selection
- Retention and sensitivity:
  - no new sensitive data class
  - repeat-rest policy lives inside existing owner-scoped workout draft data
- Cache/invalidation:
  - existing local-draft state remains authoritative between edits and save
  - no new cache layer is introduced

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only workout identity across builder, exports, PDFs, and poolside note output.
- Human-readable identifiers:
  - repeat-block labels and final-rest wording are mutable UI labels only.
- Mutability rules:
  - repeat-rest policy is editable in place on the canonical workout draft.
- Rename vs repurpose policy:
  - changing final-rest behavior is an in-place edit to the same workout, not a new workout entity.
- Compatibility contract:
  - legacy repeat blocks with no explicit final-rest metadata read through as `Use last rest interval`.
- Observability and repair:
  - invalid mixed repeat metadata must raise an explicit validation error instead of silently normalizing to a guessed value.

## Scope

- Add canonical repeat final-rest metadata to the workout draft contract.
- Expose a pool-only repeat-block control for `Use last rest interval` vs `Skip last rest interval` when the block ends with a rest step.
- Apply the final-rest policy to derived totals so time is no longer overcounted when the last rest is skipped.
- Make repeat summaries and support output truthful when the final rest is skipped.
- Extend Garmin-ready export payloads so the final-rest policy is machine-readable downstream.
- Add/update tests for:
  - normalization and validation
  - totals/persistence
  - builder UI state
  - handoff/export summary text
  - targeted end-to-end pool builder coverage

## Out Of Scope

- Additional pool field-label parity work already covered in the previous slice.
- Full Garmin step-cap enforcement.
- Send-off/device compatibility semantics beyond the final-rest repeat behavior.
- Open-water builder redesign or parity behavior.
- Schema migrations outside the additive workout draft JSON contract.

## Acceptance Criteria

1. Pool repeat blocks that end in a rest step expose a clear final-rest control in the editor.
2. New repeat starter blocks save with deterministic final-rest metadata.
3. Legacy repeat blocks without the new metadata still load and preserve current behavior safely.
4. When `Skip last rest interval` is selected, derived workout totals no longer count the final rest interval.
5. Repeat summaries, handoff text, PDF summaries, and Garmin-ready export output reflect the selected final-rest behavior truthfully.
6. Canonical save/load keeps the selected final-rest behavior intact after reopen.
7. Open-water builder behavior remains unchanged.
8. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workouts-server.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the data-model change additive and backward-compatible.
- Do not change open-water authoring behavior in this slice.
- Do not imply unsupported Garmin semantics beyond the documented final-rest behavior.
- Keep builder copy compact; prefer one explicit control over extra explanatory prose.

## 10/10 Quality Bar

- The repeat-block header should make the final-rest decision obvious without expanding all steps.
- Required states stay clear:
  - loading: existing builder loading state remains unchanged
  - empty: new pool drafts still open with a valid editable step state
  - error: invalid repeat metadata explains the fix
  - retry: existing save retry path remains unchanged
  - offline: existing save failure UI remains truthful
- Accessibility:
  - the final-rest control has a clear accessible label
  - keyboard users can change it without opening unrelated UI
- Performance:
  - no material regression on `/my-library` or workout-detail rendering
- Business logic:
  - last-rest behavior is deterministic across local draft, save, reopen, PDF, handoff, and export
  - legacy payloads default safely instead of crashing or silently dropping the block

## Checkpoint Log

- `2026-04-06 | in progress | created the repeat/rest parity brief after the field-parity slice closed; Garmin-backed gap is now narrowed to explicit final-rest handling for pool repeat blocks | next: implement additive repeat metadata, pool editor control, truthful totals/summaries/export behavior, and targeted validation`
- `2026-04-06 | implementation + targeted validation | added additive repeat-ending-rest metadata, exposed pool-only last-rest control in repeat headers, made totals/handoff/PDF/export/poolside output truthful when the final rest is skipped, and passed npm run typecheck, targeted vitest, targeted desktop-chromium Playwright, npm run lint, and npm run lint:briefs:all | next: commit the slice and rerun npm run verify:pre-pr on the committed diff so PR-body lint targets the right branch delta`
- `2026-04-06 | checkpoint c553578 + full gate | committed the slice as \`feat(workouts): add pool repeat rest parity\`, then passed npm run verify:pre-pr end to end with 96 passed / 318 skipped, including full lint, typecheck, build, perf budgets, and Playwright matrix coverage; perf trend recommendation remained hold (runs: 1/2, worst margin 36.2%) | next: push branch, open PR, and monitor required CI before pre-merge gate`
- `2026-04-06 | merged + closeout | PR #374 merged to \`main\` as \`29ed755\`; npm run verify:pre-merge passed with 96 passed / 318 skipped and required GitHub checks were green before merge | next: none`
