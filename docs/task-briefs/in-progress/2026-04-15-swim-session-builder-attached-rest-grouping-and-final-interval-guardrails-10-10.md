# Task Brief: Swim Session Builder Attached Rest Grouping And Final Interval Guardrails (10/10)

## Metadata

- `id`: `2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the manual pool builder treat single-step rest like attached parent-step behavior instead of a separate top-level card, while also making repeat final-interval-rest choices clearer and safer without changing the canonical workout schema.

## Why This Brief Exists

- The builder currently mixes two mental models:
  - single steps render as one work card plus a separate top-level rest card,
  - repeat blocks already summarize `Interval rest` and `Set rest` as part of one parent block.
- That creates poor scanability and misleading hierarchy:
  - `WARMUP`
  - then a separate `WARMUP REST` card
  - even though swimmers read that as one warmup block.
- Top-level block actions also become semantically fragile when rest is visually separate:
  - `Move`, `Add step after`, `Duplicate`, and `Delete` can conceptually split work from its attached rest.
- The repeat editor still uses the old wording:
  - `Last rest interval`
  - `Use last rest interval`
  - `Skip last rest interval`
    which is weaker and less precise than the agreed final wording.
- When a repeat block keeps the final interval rest and also has a separate post-set rest step, the builder currently lacks a calm explicit guardrail for the resulting double-rest setup.
- The owner-approved direction is locked:
  - top-level single-step rest should be shown and edited as attached to the parent step,
  - the overview must show the actual rest duration directly in the parent summary,
  - attached rest must be addable, editable, and removable inside the parent editor,
  - final repeat wording must change to `Final interval rest`,
  - conflict handling for double rest must be inline-first, with explicit confirmation only before auto-removing another step,
  - repeat overview summaries must include the work-stroke when it is explicit and useful for scanning,
  - the `Repeat block` pill should only appear while the repeat editor itself is open, not in passive overview mode,
  - switching `Meters` / `Yards` must not silently recalculate existing step overview summaries,
  - canonical step persistence and Garmin/export structure must stay intact.

## Dependencies And Boundaries

- Parent builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Relevant delivered briefs this slice extends:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-header-delete-and-rest-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-header-delete-and-rest-clarity-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts](/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts)
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no canonical DB/schema change,
  - no API contract change,
  - no Garmin adapter format change,
  - no poolside note visual redesign beyond truthful rest wording if needed to match canonical output,
  - no new dependency.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                              | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The manual pool builder must present single-step work plus attached rest as one coherent top-level block, not two competing sections.                                           | brief review + unit/e2e                     | `5/5`                   |
| UX flow clarity                               | `target`     | Parent summaries must show exact rest duration inline, block actions must preserve parent/rest attachment, and repeat final-rest choices must explain double-rest outcomes.     | targeted unit/e2e + local QA                | `5/5`                   |
| Visual design quality                         | `target`     | Attached rest must read as secondary to the work step without becoming hidden or card-within-card clutter.                                                                      | screenshot review + local QA                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Canonical rest steps remain separate persisted steps, but block-level editing and downstream summaries must stay truthful and deterministic.                                    | code review + unit tests                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated owner swim-session builder, not an admin editorial surface.                                                                    | explicit scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Inline rest controls and final-rest conflict choices must remain keyboard reachable, clearly labeled, and screen-reader understandable.                                         | code review + targeted QA                   | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no heavy state machine or dependency should be introduced for this builder-only UX refinement.                                                                 | `npm run build` + interaction QA            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief must preserve server-canonical step persistence while defining attached-rest UI as a derived local grouping over separate canonical steps.                            | brief contract + implementation diff        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new fetch/cache behavior is introduced because all changes stay inside existing local draft editing and save flows.                                         | code review                                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Add/remove/edit rest operations and repeat conflict resolution must stay deterministic, undoable through existing local save/discard semantics, and not orphan canonical steps. | targeted unit/e2e + manual QA               | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth boundary changes; existing owner-only save routes remain intact.                                                                                       | route review                                | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this builder UX slice changes no personal-data collection or sharing behavior.                                                                                      | explicit scope rationale                    | `N/A`                   |
| Content governance                            | `target`     | Builder wording must consistently use `Rest`, `Interval rest`, `Set rest`, and `Final interval rest` with no stale `last rest interval` copy.                                   | copy review + targeted tests                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin moderation, publishing, or operator-only flow changes here.                                                                                                | explicit scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library surface.                                                                                                                        | explicit scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private builder slice changes no public semantic surface.                                                                                                      | explicit scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no new analytics contract is required for this builder refinement.                                                                                                  | explicit scope rationale                    | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no entitlement, checkout, or billing path changes here.                                                                                                             | explicit scope rationale                    | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice does not change support tooling, incident paths, or runbook flows.                                                                                       | explicit scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting system is touched.                                                                                                                          | explicit scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice standardizes private English builder copy only and does not alter localization architecture.                                                             | explicit scope rationale                    | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the current React/Tailwind builder patterns and helper functions without adding new packages.                                                                             | dependency diff + code review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage must protect attached-rest summaries, block-level actions, final-interval-rest wording, and double-rest guardrails.                                           | updated tests + `verify:pre-pr` / pre-merge | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this slice adds no server cost, no background jobs, and no new storage.                                                                                             | explicit scope rationale                    | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback stays straightforward because the slice is UI/state-logic only with no migration.                                                                     | diff review + `verify:pre-merge` evidence   | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout identity and save/delete flow,
  - canonical ordered `draft.steps`,
  - top-level rest steps as distinct canonical rows,
  - repeat-group relationships and `repeatEndingRestMode`,
  - downstream Garmin/export/handoff/poolside derivation from canonical steps.
- Local-only data:
  - top-level block grouping that attaches a rest step to its parent work step in the builder UI,
  - local open/closed edit state,
  - inline final-rest conflict guidance/confirmation state.
- Sync policy:
  - adding attached rest creates a canonical rest step directly after the parent step inside the local draft,
  - removing attached rest deletes that canonical rest step from the local draft only until save,
  - parent-block move/duplicate/delete/add-after operations must preserve or intentionally remove the attached canonical rest step with the parent block.
- Retention and sensitivity:
  - no new local storage,
  - no new sensitive data,
  - existing save/discard behavior remains the retention boundary.
- Cache/invalidation:
  - unchanged from current local draft save flow.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the saved-session identity,
  - canonical `step.id` and `repeatGroupId` remain the source-of-truth identifiers.
- Human-readable identifiers:
  - step labels, rest labels, summary lines, and repeat copy are presentation-only and may change in place.
- Mutability rules:
  - UI wording is mutable,
  - canonical IDs are unchanged,
  - canonical rest rows remain separate rows even when rendered as attached UI.
- Rename vs repurpose policy:
  - improve presentation in place,
  - do not repurpose canonical rest rows into inline-only metadata fields.
- Compatibility contract:
  - Garmin/export/handoff/poolside code must continue to derive from canonical steps,
  - if `Keep both` is chosen for repeat final-rest conflicts, downstream summaries must stay truthful to both rests instead of silently suppressing one.
- Observability and repair:
  - tests must catch orphaned rest-step regressions, stale labels, and false downstream summary suppression.

## Scope

- In manual pool edit mode, treat a top-level work step plus its immediate following top-level rest step as one visual/edit block.
- Show attached single-step rest duration directly in the parent summary, for example:
  - `400m · Freestyle · Easy · Rest 0:30`
- Stop rendering that linked top-level rest as a separate sibling card in edit mode.
- In repeat overview summaries, include the work stroke when it is explicit and helpful, for example:
  - `4 x 50m · Freestyle · Interval rest 0:20 · Set rest 0:30`
- Hide the `Repeat block` pill in passive overview/view states and show it only while the repeat block is open in edit mode.
- Inside the parent edit form:
  - show attached rest controls,
  - allow add, edit, and remove,
  - keep rest configuration secondary to the main step.
- Make top-level block actions parent-rest aware:
  - move,
  - add step after,
  - duplicate,
  - delete.
- Preserve each step's authored distance unit across a global `Meters` / `Yards` switch unless that step is explicitly re-authored in the new unit:
  - summary lines stay stable,
  - custom distance inputs and presets inside the step editor stay in the authored unit too.
- Ensure the final top-level single step does not auto-seed a trailing rest by default when adding a new single step at the end of the session.
- Rename repeat copy:
  - `Final interval rest`
  - `Skip final interval rest`
  - `Include final interval rest`
- When `Include final interval rest` is selected while a separate post-set rest still exists:
  - show inline conflict guidance,
  - offer:
    - `Keep set rest only`
    - `Use final interval rest instead`
    - `Keep both`
  - require explicit confirmation before auto-removing the separate post-set rest step.
- Keep downstream summaries truthful when both interval rest and set rest exist.

## Out Of Scope

- Poolside note composition/layout redesign.
- Full-session PDF visual redesign.
- New schema fields or migrations.
- Changing Garmin readiness policy for `use_last_rest` beyond making the surfaced data truthful.
- New undo/history beyond current local draft semantics.

## Acceptance Criteria

1. In manual pool edit mode, a top-level work step with a linked rest renders as one top-level card, not two sibling cards.
2. That parent card summary shows the actual rest duration or rest mode inline.
3. Opening the parent card exposes an attached rest editor with `Add rest` when absent and `Remove rest` when present.
4. Removing attached rest deletes the canonical adjacent top-level rest step without orphaning the block.
5. Top-level `Move`, `Add step after`, `Duplicate`, and `Delete` operate on the parent block plus its attached rest together.
6. Adding a new top-level single step at the end of the session no longer auto-creates a trailing rest step by default.
7. Repeat wording changes to `Final interval rest`, `Skip final interval rest`, and `Include final interval rest`.
8. Selecting `Include final interval rest` while a separate post-set rest exists shows inline conflict handling instead of an immediate popup.
9. Choosing to auto-remove the separate post-set rest requires explicit confirmation first.
10. Choosing `Keep both` preserves both rest segments in builder summaries and downstream handoff/poolside derivation.
11. Canonical step schema and Garmin/export payload structure remain intact.
12. Repeat overview summaries include an explicit work stroke when the repeat work step has one.
13. The `Repeat block` pill is absent in passive overview/view states and appears only while the repeat editor is open.
14. Switching global pool units resets pool-size defaults but does not silently convert existing step overview summaries or authored step distance inputs.
15. Relevant tests and `verify:pre-pr` / `verify:pre-merge` pass.

## Validation

- `npm run lint:briefs`
- targeted `vitest`:
  - `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - Vercel preview URL from PR checks.
- Recommended matrix:
  - iPhone Safari
  - Desktop Safari
  - Desktop Chrome

## Constraints

- Builder copy stays in English.
- Preserve the canonical rest-step model and Garmin/export compatibility.
- Keep attached-rest UI calm and secondary; do not create a nested card stack that fights the main step.
- Do not hide rest existence behind `Edit`; the summary must stay truthful.
- Keep changes scoped to this builder/rest slice.

## 10/10 Quality Bar

- Single-step top-level blocks must scan as clearly as repeat blocks.
- Rest belongs visually to the step it follows, but must remain easy to remove or adjust.
- The builder must not let block-level actions silently split work from its rest.
- Final-interval-rest conflict handling must be calm, local, and explicit.
- Required states remain clear:
  - loading: unchanged,
  - empty: unchanged,
  - error: existing save flow unchanged,
  - retry: explicit confirmation before auto-removing another step,
  - offline: unchanged.

## Checkpoint Log

- `2026-04-15 | planning | created the attached-rest grouping and final-interval-rest guardrail brief from owner-approved scope: group top-level rest under parent steps in manual pool edit mode, make block actions preserve that grouping, and add inline repeat double-rest conflict handling without changing canonical schema | next: implement builder/state changes, update tests, and run repo gates`
- `2026-04-15 | implementation | attached top-level rest is now grouped under its parent step in manual pool edit mode, repeat wording/guardrails were updated, and downstream summaries keep both rests truthful when chosen | validation: npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts; npx playwright test tests/e2e/my-library-workout-builder.spec.ts; npm run lint:briefs:all; npm run verify:pre-pr | next: commit, push, open/update PR, monitor CI, and run verify:pre-merge before merge recommendation`
- `2026-04-15 | implementation | added explicit repeat-work stroke summaries, hid the passive repeat pill outside open repeat editing, and preserved authored step units in both summaries and custom distance inputs across global pool-unit toggles | validation: npx eslint components/my-library/workouts/WorkoutEditor.tsx tests/unit/workout-builder-hub.test.tsx tests/e2e/my-library-workout-builder.spec.ts; npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts; env NEXT_DIST_DIR=.next-playwright-builder-full-rerun npx playwright test tests/e2e/my-library-workout-builder.spec.ts | next: run npm run verify:pre-pr, then commit/push/update PR`
- `2026-04-15 | validation | full builder-targeted validation is green; npm run verify:pre-pr reached the full lane and only failed on an unrelated flaky rerun of tests/e2e/my-library-program-export.spec.ts while all builder coverage passed; isolated rerun of that export spec then passed cleanly, so builder scope is PR-ready but the broader repo gate should still be watched on CI | validation: npm run verify:pre-pr; env NEXT_DIST_DIR=.next-playwright-program-export-rerun npx playwright test tests/e2e/my-library-program-export.spec.ts --project=desktop-chromium | next: stage scoped files, open/update PR, and monitor CI before merge recommendation`
