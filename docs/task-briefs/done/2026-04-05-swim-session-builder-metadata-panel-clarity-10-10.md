# Task Brief: Swim Session Builder Metadata Panel Clarity (10/10)

## Metadata

- `id`: `2026-04-05-swim-session-builder-metadata-panel-clarity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-05`
- `updated`: `2026-04-12`

## Goal

The manual swim-session builder keeps only truthful, necessary metadata controls visible, with calmer copy and labels that match how coaches actually author a session.

## Why This Brief Exists

- The create-vs-edit builder slice shipped on `2026-04-05`, and that removed the biggest entry confusion.
- The remaining friction is now concentrated inside the metadata panel of the manual builder:
  - the heading `Title through equipment` is awkward,
  - the collapsed helper copy still reads like leftover scaffolding,
  - open production note `2d2cb8af` still asks for the duplicate builder-shell copy to be removed,
  - new production note `172c63c6` asks whether `Session type`, `Description`, and `Effort` are actually needed in the manual builder at all.
- This is a smaller and safer next slice than reopening builder entry IA again.

## Dependencies And Boundaries

- Parent builder brief that remains authoritative for the broader swim-session wave:
- `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Recently shipped builder entry clarity slice:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md`
- Primary implementation files likely touched:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Relevant contract review surfaces before hiding/removing fields:
  - existing manual workout draft shape and canonical workout persistence,
  - Garmin/export adapters and any builder assumptions around session metadata,
  - generated-session flow if it reuses the same editor component.

## Admin Notes Triage Disposition

- `172c63c6-1e6c-4c70-ac6a-0a2cd45e601e` `Session Builder items`
  - disposition: owned by this brief.
  - reason: this is the clearest expression of the remaining manual-builder metadata-panel work.
- `2d2cb8af-b65b-48c0-8d7d-0e5d9cd58daf` `Swim session builder`
  - disposition: partially still open and owned by this brief.
  - reason: most shell-level copy was already removed, but the metadata-panel heading and collapsed helper copy still match the note's remaining complaint.
- `0655d28e-8fa8-4077-8d20-0bc34309671c` `Swim session builder`
  - disposition: closed on `2026-04-05`.
  - reason: the latest-saved chooser and `Continue latest saved session` wording no longer exist after the three-action overview shipped.
- `f271ea91-a7f7-4687-937f-6e6f64e68b27` `Swim session builder edit-entry clarity`
  - disposition: closed on `2026-04-05`.
  - reason: create-vs-edit boundaries, manual-vs-AI split, and copy-removal requests were shipped in the overview/create-vs-edit slice.
  - note: `Delete current draft` was intentionally not adopted because the current model still edits a canonical saved workout row, so `Delete session` remains more truthful than `draft`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`
- `Product goals and IA`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                            | Evidence                                 |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product goals and IA                          | `target`     | Manual builder metadata reads like one coherent authoring surface, with labels and visible controls that match the owner's real manual-session workflow.                  | copy review + manual QA + e2e            |
| UX flow clarity                               | `target`     | The metadata panel no longer contains awkward or scaffolding-like wording, and hidden/removed fields do not leave the user unsure what belongs in session setup.          | manual QA + targeted e2e                 |
| Visual design quality                         | `target`     | The metadata panel feels calmer and more intentional after heading/helper-copy cleanup and any unnecessary field removal.                                                 | screenshot review + manual QA            |
| Business logic correctness and data integrity | `target`     | Any field removed or hidden from the manual UI is either proven unnecessary for canonical save/export behavior or safely preserved behind the existing data contract.     | code review + unit tests + export review |
| Admin editor ergonomics                       | `target`     | The owner can start a manual session and understand the top metadata block immediately without reading explanatory filler text.                                           | timed manual QA + e2e                    |
| Accessibility (a11y)                          | `supporting` | Supporting only: metadata toggles, labels, and any remaining fields stay keyboard- and screen-reader-friendly.                                                            | targeted tests + code review             |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: metadata cleanup does not materially regress `/my-library/workouts/[workoutId]` responsiveness or payload.                                               | typecheck + targeted review              |
| Data placement and sync boundaries            | `target`     | The brief explicitly states whether metadata changes are UI-only or schema-affecting, and manual-builder edits still save through the current canonical workout boundary. | brief contract + implementation review   |
| Caching and invalidation strategy             | `supporting` | Supporting only: metadata changes continue to use the current save + refresh path without adding a second sync layer.                                                     | integration review                       |
| Reliability and failure handling              | `target`     | Save/delete/error states remain truthful if fields are hidden, renamed, or re-ordered; no partial-state confusion is introduced.                                          | unit/e2e coverage + manual QA            |
| Security and authz                            | `supporting` | Supporting only: owner-scoped workout routes and APIs remain unchanged.                                                                                                   | existing auth boundaries                 |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes authenticated builder UI labels/fields, not privacy or disclosure policy.                                                                  | explicit scope rationale                 |
| Content governance                            | `supporting` | Supporting only: renamed fields and helper text must stay aligned with the canonical workout model and any downstream export semantics.                                   | copy review + contract review            |
| Admin workflow and editability                | `target`     | Manual authors can set up a workout with less ambiguity at the top of the editor, and field visibility matches real authoring needs.                                      | manual QA + targeted tests               |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library surface with no public crawl contract.                                                                                    | explicit scope rationale                 |
| AI discoverability                            | `N/A`        | N/A because this slice does not change public AI entry metadata or public AI-facing routes.                                                                               | explicit scope rationale                 |
| Analytics and KPI observability               | `supporting` | Supporting only: any field-visibility change should still leave session creation/edit behavior interpretable through existing route-level usage patterns.                 | scope review                             |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or subscription workflow changes.                                                                                           | explicit scope rationale                 |
| Incident response and support operations      | `supporting` | Supporting only: if builder-field meaning changes, related Help/Guide or runbook guidance must stay truthful or be marked N/A explicitly.                                 | docs impact review                       |
| Finance and reporting operations              | `N/A`        | N/A because no billing, payout, reconciliation, or finance reporting path changes in this slice.                                                                          | explicit scope rationale                 |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes internal English builder copy only and does not alter localization architecture.                                                           | explicit scope rationale                 |
| Stack-fit and dependency discipline           | `target`     | Reuse the current workout-editor component and canonical workout stack; do not add new dependencies or parallel metadata persistence.                                     | dependency diff + architecture review    |
| Testing and QA automation                     | `target`     | Coverage protects metadata heading/copy, field visibility decisions, and any builder-save/export invariants affected by metadata changes.                                 | unit/e2e coverage + `verify:pre-pr`      |
| Scalability and cost efficiency               | `supporting` | Supporting only: metadata simplification should reduce operator friction without increasing save churn or duplicative builder branching.                                  | code review + manual QA                  |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays reversible through a normal UI/copy rollback and should not require a destructive migration.                                             | rollback note + diff review              |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - the canonical workout draft payload stored through the current workouts table,
  - any metadata fields already persisted on that draft.
- Local-only:
  - metadata-panel open/closed UI state,
  - transient inline save/delete error messages,
  - any local presentation-only field grouping or helper text.
- Sync policy:
  - this slice should prefer UI-only simplification first,
  - if `Session type`, `Description`, or `Effort` stay required for save/export correctness, they may stay in the canonical draft contract even if their presentation changes,
  - if a field is removed from the manual UI entirely, the brief must document why that does not break canonical save, generated-session edit continuity, or export behavior.
- Retention and sensitivity:
  - no new private data class is introduced,
  - the slice only changes how existing workout metadata is presented and, if justified, edited.
- Cache/invalidation:
  - existing save and route-refresh behavior remains authoritative,
  - no second local draft store is introduced.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical swim-session identity.
- Human-readable identifiers:
  - metadata labels such as `Session details`, `Build your swim session`, `Session note`, and field labels are mutable UI copy, not identifiers.
- Mutability rules:
  - UI labels may change in place,
  - underlying canonical field names should stay stable unless a separate explicit data-contract slice changes them.
- Rename vs repurpose policy:
  - preferred path is to rename or hide presentation affordances before changing the underlying schema,
  - if `Description` becomes `Session note`, it should remain the same stored field unless a dedicated schema brief decides otherwise.
- Compatibility contract:
  - saved workouts, exports, and generated-session editing must keep working against the current workout entity and route contract.
- Observability and repair:
  - any removed or hidden field that affects export or generated-session edit behavior must be covered by deterministic tests or explicit fallback mapping.

## Scope

- Rework the manual-builder metadata panel heading and helper text so it no longer says `Title through equipment` or uses filler copy that reads like scaffolding.
- Review whether these controls should remain visible in the manual builder:
  - `Session type`
  - `Description`
  - `Effort`
- If one or more of those controls remain:
  - rename or reposition them so they read truthfully for manual authoring.
- If one or more of those controls are hidden or removed from the manual UI:
  - preserve canonical save/export behavior and document the reason clearly in implementation.
- Update targeted tests for the chosen metadata-panel contract.

## Out Of Scope

- Reopening the create-vs-edit or manual-vs-AI entry architecture.
- Changing the delete-action truthfulness back to a `draft` label without a new underlying draft model.
- Reworking the AI generator intake flow beyond any editor-field coupling that must remain compatible.
- Introducing a new workout schema, migration, or separate local-only draft entity unless a later brief explicitly approves it.
- Reworking dryland builder metadata in this slice.

## Acceptance Criteria

1. The metadata panel no longer uses the heading `Title through equipment`.
2. The collapsed metadata helper copy is removed or rewritten so it sounds intentional and truthful.
3. The brief's chosen contract for `Session type`, `Description`, and `Effort` is reflected in the manual builder UI.
4. Any field hidden or removed from the manual builder is proven unnecessary for canonical save/export behavior, or a safe compatibility mapping is kept.
5. The manual builder still opens, saves, and exports correctly after metadata-panel cleanup.
6. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - any additional unit tests needed for metadata-field visibility or export compatibility
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the slice small and truthful.
- Do not remove fields from the manual builder just because they feel noisy; first confirm whether canonical save/export or generated-session edit flow depends on them.
- Prefer UI simplification and copy cleanup before schema changes.
- If external Garmin documentation is needed to justify a removal, treat that as supporting evidence, not an excuse to guess.

## 10/10 Quality Bar

- A coach opening the manual builder should understand the metadata block at a glance.
- The top metadata section should feel purposeful, not like leftover implementation copy.
- Any remaining field in manual builder should earn its place by supporting real manual authoring or proven downstream contract needs.
- Required states stay clear:
  - loading: existing builder readiness/loading states stay intact,
  - empty: no-session state remains truthful,
  - error: save/delete failures still explain what happened,
  - retry: existing retry path remains the normal save-again flow.

## Checkpoint Log

- `2026-04-12 | docs reconciliation | removed a stale in-progress duplicate of this brief; this done file remains the authoritative closeout record for the metadata-panel slice`
- `2026-04-05 | planning | created a dedicated follow-up brief after the create-vs-edit builder slice shipped; closed prod notes 0655d28e and f271ea91 as covered, kept 2d2cb8af open for its metadata-panel residual, and grouped that residual with new prod note 172c63c6 so the next slice can focus only on manual-builder metadata labels, field visibility, and truthfulness | next: implement the metadata-panel cleanup, then decide with code/test evidence whether Session type, Description, and Effort should stay visible in the manual builder`
- `2026-04-05 | in-progress | started implementation in a clean worktree from origin/main; confirmed Session type and Effort are still part of the canonical handoff/PDF/export contract, so this slice will simplify the manual-builder presentation without removing those fields from the stored workout model | next: land the metadata-panel UI/test changes, then run lint:briefs, targeted tests, and verify:pre-pr`
- `2026-04-05 | implementation + local validation | manual-builder metadata now uses calmer copy, the Description field is presented as Session note, manual sessions keep Session type + Effort behind a secondary Training profile toggle, and user-visible handoff/PDF output matches the renamed note label; passed lint:briefs:all, targeted vitest, targeted Playwright for /my-library/workouts create flow, typecheck, and full npm run verify:pre-pr (95 passed / 319 skipped) | next: commit, push, open PR, and wait for CI before merge`
- `2026-04-05 | brief closeout staged for merge | moved this child brief from in-progress to done after PR #357 reached all-green required checks and local npm run verify:pre-merge passed for the metadata-panel slice | next: merge PR #357 to main, then close the remaining admin notes owned by this brief`
