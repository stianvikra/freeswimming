# Task Brief: Swim Session Builder Action Clarity And Safe Discard (10/10)

## Metadata

- `id`: `2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-14`
- `updated`: `2026-04-15`

## Goal

Make the swim-session-builder action area clearer and safer by removing internal implementation wording, replacing `Reset to last saved` with a better discard action, and separating discard from delete with a reversible local undo flow.

## Why This Brief Exists

- The builder header still exposes too much implementation framing and too little user-facing action clarity:
  - internal phrases like `canonical workout` and `canonical full-session PDF` leak system language into the main owner flow,
  - `Reset to last saved` is technically accurate but does not read like a normal user action,
  - `Delete session` competes visually with the primary edit actions.
- The owner feedback is explicit:
  - all visible wording here should be English-only and user-facing,
  - `Reset to last saved` should become `Discard changes`,
  - the best UX variant is a reversible discard flow with `Undo`.
- This is a swim-builder follow-up slice, not a new umbrella:
  - preserve existing save/delete semantics,
  - do not pretend there is a second persisted draft entity,
  - and keep the work focused on action clarity, recovery, and danger hierarchy.

## Dependencies And Boundaries

- Parent swim-session builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Relevant shipped builder child briefs this slice must extend rather than duplicate:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-builder-owner-note-3a29feae-step-detail-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-builder-owner-note-3a29feae-step-detail-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-10-swim-session-builder-helper-copy-and-delete-copy-cleanup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-10-swim-session-builder-helper-copy-and-delete-copy-cleanup-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-pool-size-rest-and-support-surface-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-pool-size-rest-and-support-surface-polish-10-10.md)
- Current truthfulness constraint this brief must preserve:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md#L211)
- Primary implementation surfaces expected in scope when this brief is executed:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/generator/SessionGeneratorPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/generator/SessionGeneratorPanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/session-generator-panel.test.tsx](/Users/stianvikra/freeswimming/tests/unit/session-generator-panel.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no autosave,
  - no revision-history feature,
  - no delete API or delete-confirmation model rewrite beyond location/copy hierarchy,
  - no new persisted draft entity,
  - no pool-unit behavior changes in this slice.

## Product Direction Locked By This Brief

1. Visible builder copy must be user-facing English, not internal system language.
2. `Discard changes` is the correct action label for reverting unsaved local edits back to the saved session state.
3. `Delete session` must be visually and structurally separate from normal edit actions.
4. The best discard UX for this builder is:
   - click `Discard changes`,
   - revert to last saved state,
   - show toast `Changes discarded`,
   - provide `Undo` as a local-only recovery action.
5. `Undo` restores the immediately discarded local editor state only; it is not save history and must not imply a separate persistent draft store.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                           | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The main builder action area clearly separates continue editing, discard unsaved edits, view output, and permanently delete the session.                                     | brief review + manual QA             | `5/5`                   |
| UX flow clarity                               | `target`     | Users can immediately understand the difference between `Save changes`, `Discard changes`, `Undo`, and `Delete session` without reading technical helper text.               | targeted unit/e2e + manual QA        | `5/5`                   |
| Visual design quality                         | `target`     | The action area reads as a calm primary toolbar plus a clearly separated danger action, with no visible implementation-language clutter.                                     | screenshot review + preview QA       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Discard restores the last saved state, undo restores only the just-discarded local state, and delete remains the only permanent destructive action on the saved session row. | targeted tests + code review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated owner-facing builder, not an admin editor workflow.                                                                         | explicit scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Action labels, focus order, toast recovery action, and danger-area placement remain keyboard-usable and screen-reader-clear after the action hierarchy changes.              | targeted QA + code review            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: discard/undo must remain instantaneous and local without adding heavy history infrastructure or blocking rerenders.                                         | interaction QA + `npm run build`     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief explicitly defines server-canonical saved workout state vs local unsaved editor state vs local-only undo snapshot state.                                           | brief contract + implementation diff | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: save/delete invalidation stays unchanged; discard/undo must remain entirely local and not trigger unintended fetch/reset behavior.                          | workflow review                      | `4/5`                   |
| Reliability and failure handling              | `target`     | Discard, undo, save failure, reload, and navigation behavior remain deterministic, with no accidental permanent loss of a saved session and no ambiguous destructive action. | targeted tests + manual QA           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: delete remains an authenticated owner action through the existing protected path; this slice does not widen authz scope.                                    | route review                         | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice introduces no new personal-data collection, retention, or exposure behavior.                                                                          | explicit scope rationale             | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: visible wording becomes more truthful and user-facing, but no content governance workflow or source-of-truth model changes.                                 | copy review                          | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow, publish state, or admin mutation model changes in this slice.                                                                        | explicit scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library route with no public crawl/index contract.                                                                                   | explicit scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata, semantic public content, or AI-discoverable route.                                                                        | explicit scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not require a new analytics contract; it is a local action-clarity and recovery improvement only.                                                | explicit scope rationale             | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, pricing, or billing behavior changes here.                                                                                             | explicit scope rationale             | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice does not alter incident tooling or support runbooks beyond normal UI recovery QA; no new support workflow is introduced.                              | explicit scope rationale             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, or reporting path changes are involved.                                                                                      | explicit scope rationale             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice standardizes private English builder copy and does not change routing or localization architecture.                                                   | explicit scope rationale             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The slice must reuse the current shared builder/editor state model and add no dependency or full history subsystem.                                                          | dependency diff + code review        | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit and e2e coverage protect dirty-state visibility, discard, undo, save, and delete separation across shared builder surfaces; `verify:pre-pr` / `verify:pre-merge` pass.  | updated tests + verify outputs       | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because discard/undo remains local-only and introduces no new server cost pattern, job, or long-lived data model.                                                        | explicit scope rationale             | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this remains a straightforward UI rollback with no schema or migration dependency.                                                                          | diff review + validation notes       | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout row identity,
  - canonical workout draft payload that currently exists on the server,
  - delete/save semantics for the saved session.
- Local-only data:
  - unsaved editor state before save,
  - dirty/not-dirty status,
  - one-shot discard/undo snapshot in memory after the user clicks `Discard changes`,
  - toast visibility and action state.
- Sync policy:
  - `Save changes` writes server-canonical state through the existing save path,
  - `Discard changes` reverts only the local editor state to the current saved server snapshot,
  - `Undo` restores only the immediately discarded local state and does not write to the server,
  - reload/navigation clears the temporary undo snapshot.
- Retention and sensitivity:
  - undo state is in-memory only and expires on save, reload, navigation, or a new destructive/discard action,
  - no new persistent local draft storage is introduced in this slice.
- Cache/invalidation:
  - save/delete continue to drive existing refresh and invalidation behavior,
  - discard/undo must not invalidate caches or trigger unnecessary server reads.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the canonical saved-session identity.
- Human-readable identifiers:
  - `Save changes`, `Discard changes`, `Undo`, `View PDF`, and `Delete session` are mutable UI labels only.
- Mutability rules:
  - visible action labels may change in place,
  - saved workout identity and route structure do not change.
- Rename vs repurpose policy:
  - `Discard changes` is a local editor recovery action only,
  - `Delete session` remains the only action that removes the canonical saved entity,
  - this brief must not blur those meanings through copy or placement.
- Compatibility contract:
  - existing saved workouts must continue to load and use the same underlying save/delete model,
  - shared builder surfaces must stay aligned on the same action truthfulness.
- Observability and repair:
  - discard/undo/delete differences must be verifiable through targeted tests and manual QA so regressions are caught before merge.

## Scope

- Replace the visible builder action label `Reset to last saved` with `Discard changes`.
- Remove visible internal implementation copy from the standard builder action area, including:
  - `All builder changes are saved to the canonical workout.`
  - `CANONICAL FULL-SESSION PDF`
- Keep visible action copy fully English and user-facing.
- Show `Discard changes` only when the editor has unsaved changes.
- Implement the recommended recovery UX:
  - click `Discard changes`,
  - revert to the last saved session state,
  - show toast `Changes discarded`,
  - provide `Undo` as a local-only recovery action.
- Define undo behavior:
  - restores the immediately discarded local editor state,
  - clears on save,
  - clears on reload,
  - clears on navigation,
  - clears on a new discard/destructive action that supersedes the previous snapshot.
- Move `Delete session` out of the primary action row into a separate danger area inside the details surface.
- Keep `Save changes` and `View PDF` as the standard primary/secondary actions.
- Update targeted tests for both the saved-workout route and any shared generator handoff surface using the same editor.

## Out Of Scope

- Autosave or background save.
- Full revision history or multi-step undo.
- Delete-session API redesign or new delete-confirmation backend behavior.
- Pool-unit toggle behavior changes.
- New local persistent draft storage.

## Acceptance Criteria

1. The standard builder header no longer exposes visible internal phrases such as `canonical workout` or `canonical full-session PDF`.
2. `Reset to last saved` is replaced with `Discard changes`.
3. `Discard changes` only appears when there are unsaved local edits.
4. Clicking `Discard changes` restores the last saved session state in the editor.
5. After discard, the UI shows `Changes discarded` with `Undo`.
6. Clicking `Undo` restores the immediately discarded local state without saving it.
7. `Delete session` is clearly separated from the main save/discard/PDF action cluster and no longer competes visually with it.
8. The builder does not imply a separate persistent local draft entity that does not actually exist.
9. Shared editor surfaces remain aligned on the same discard/undo/delete semantics.
10. Relevant unit/e2e coverage and `verify:pre-pr` / `verify:pre-merge` pass before merge.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/session-generator-panel.test.tsx`
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
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - Vercel preview URL from the PR checks.
- Recommended browser/device matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit

## Constraints

- Keep all visible builder copy in English.
- Prefer user-facing action language over implementation-language explanation.
- Do not imply a persistent hidden draft store that does not exist in the current model.
- Keep discard and delete visually and semantically distinct.
- Keep the undo model small, local, and explicit rather than introducing a large history feature.

## 10/10 Quality Bar

- The action area should read immediately:
  - `View PDF`
  - `Discard changes`
  - `Save changes`
  - separate danger action for `Delete session`
- The user should never need to mentally translate system terms like `canonical` to understand what an action does.
- Discard must feel safe because it is reversible once, immediately, and locally.
- Delete must feel clearly more dangerous and clearly not equivalent to discard.
- Required states remain clear:
  - loading: existing behavior remains intact,
  - empty: unchanged,
  - error: save/delete failures remain explicit and recoverable,
  - retry: undo/discard/save paths remain understandable after failure,
  - offline: local unsaved edits remain visible until the user explicitly discards them.
- Accessibility expectations:
  - danger area remains reachable and clearly labeled,
  - toast + `Undo` can be reached by keyboard,
  - focus and announcements remain understandable after discard.
- Business-logic expectations:
  - discard restores saved state only,
  - undo restores only the just-discarded local state,
  - delete remains the only permanent destructive action.

## Checkpoint Log

- `2026-04-14 | planning | created a dedicated child brief for builder action clarity after owner feedback confirmed that the current action row still leaks implementation language and that `Reset to last saved`should become`Discard changes` with a better local undo recovery pattern | next: implement the shared-editor action rewrite and test discard/undo/delete separation end to end`
- `2026-04-15 | implementation | rewrote the saved-session action area to use user-facing save/PDF copy, made `Discard changes`visible only for dirty state, added a local undo toast, moved`Delete session`into a separate danger zone, and updated unit + builder e2e coverage to lock the new contract | next: run`npm run verify:pre-pr`, push the branch, and open the PR`
- `2026-04-15 | validation | `npm run verify:pre-pr`passed on the full lane, including build, perf budgets, and full Playwright; perf trend recommended tightening one stretch target step, and the decision for this slice is`hold` because no route-budget target changed here and the recommendation should be handled in the dedicated performance-governance thread/PR summary | next: commit, push, and open the PR`
