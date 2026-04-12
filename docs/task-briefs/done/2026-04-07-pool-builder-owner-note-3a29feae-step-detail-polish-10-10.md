# Task Brief: Pool Builder Owner Note 3A29FEAE Step And Detail Polish (10/10)

## Metadata

- `id`: `2026-04-07-pool-builder-owner-note-3a29feae-step-detail-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-07`
- `updated`: `2026-04-08`

## Goal

The pool session builder removes the remaining small authoring seams from owner note `3A29FEAE-C00D-4088-B72F-C265F8253CA2` so step editing feels calmer, more Garmin-familiar in semantics, and less cluttered during real manual workout building.

## Why This Brief Exists

- The pool Garmin-parity wave shipped on `main` on `2026-04-06`, but live manual use immediately surfaced smaller builder-polish issues inside the saved-session editor.
- Owner note `3A29FEAE-C00D-4088-B72F-C265F8253CA2` groups a coherent set of low-risk, high-frequency friction points on `/my-library/workouts/8082725f-26de-4efe-876f-9e84148bba45`.
- The note is not asking for a new Garmin implementation slice. It is asking for owner-led polish on top of the shipped pool builder:
  - calmer copy,
  - better delete placement,
  - one-line expandable note fields,
  - removal of pool-only redundant or unclear step fields.
- This is safer to handle as one bounded child brief now than to scatter the note into more micro-fixes while manual builder review is still active.

## Dependencies And Boundaries

- Parent builder live-review brief:
- `docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Recently shipped pool builder lineage that stays authoritative:
  - `docs/task-briefs/done/2026-04-06-pool-swim-builder-field-parity-10-10.md`
  - `docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `docs/task-briefs/done/2026-04-06-pool-swim-builder-garmin-parity-10-10.md`
- Metadata-panel lineage that this slice builds on:
  - `docs/task-briefs/done/2026-04-05-swim-session-builder-metadata-panel-clarity-10-10.md`
- Parked follow-up that must remain parked in this chat:
  - `docs/task-briefs/planned/2026-04-07-pool-swim-builder-garmin-follow-up-map-10-10.md`
- Primary implementation files likely touched:
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/my-library-workout-builder.spec.ts`
- Boundary decisions for this brief:
  - no new Garmin slice,
  - no open-water contract decisions,
  - no schema migration,
  - no broad export/handoff redesign beyond what is required to keep hidden pool-only fields truthful.

## Admin Notes Triage Disposition

- `3a29feae-c00d-4088-b72f-c265f8253ca2` `Swim Session Builder`
  - disposition: owned by this brief.
  - reason: the note is one coherent pool-builder polish bundle on the saved-session route and can be implemented safely without reopening broader builder architecture.
  - scope adopted from the note:
    - remove the top metadata helper sentence,
    - move `Delete session` beside the details toggle,
    - make `Session note` one-line by default with auto-growth,
    - remove the manual-pool `Pool Size` helper copy,
    - remove manual-pool `Step name`,
    - rename `Editable draft steps` to `Session builder`,
    - remove the manual-pool stroke/drill helper copy,
    - make `Step note` one-line by default with auto-growth,
    - remove repeat helper copy,
    - remove the duplicate top-level `Effort cue`,
    - remove manual-pool `Target notes`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                 | Evidence                                |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | The saved pool builder reads as one coherent session-authoring surface, with step labels/actions that match real manual coaching jobs without leftover filler. | manual QA + code review + targeted e2e  |
| UX flow clarity                               | `target`     | Pool step editing shows only one obvious control for each authoring concept, and session/delete actions are visible where the owner expects them.              | targeted e2e + manual QA                |
| Visual design quality                         | `target`     | The metadata header, repeat cards, and pool step editor feel calmer after helper-copy removal and note-field density reduction.                                | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Hiding `Step name` and `Target notes` from the pool UI does not leave stale hidden labels in save/export flows; pool step titles remain generated truthfully.  | unit tests + implementation review      |
| Admin editor ergonomics                       | `target`     | High-frequency pool session edits require fewer unnecessary fields and less scrolling while preserving clear destructive-action placement.                     | timed manual QA + targeted e2e          |
| Accessibility (a11y)                          | `supporting` | Supporting only: moved buttons, renamed sections, and auto-growing note fields remain labeled, keyboard reachable, and screen-reader compatible.               | code review + targeted tests            |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the route remains within current builder expectations and this slice adds no heavy client dependency.                                         | dependency diff + typecheck             |
| Data placement and sync boundaries            | `target`     | The brief explicitly keeps the canonical workout draft as server truth while limiting this slice to presentation and safe pool-step compatibility mapping.     | brief contract + code review            |
| Caching and invalidation strategy             | `supporting` | Supporting only: save/delete still reuse the existing builder refresh path with no second draft store or extra cache layer.                                    | implementation review                   |
| Reliability and failure handling              | `target`     | Save/delete/removal flows stay deterministic after control movement and pool-only field removal; no new dead-end or hidden-state failure path is introduced.   | unit/e2e coverage + manual QA           |
| Security and authz                            | `supporting` | Supporting only: this slice keeps the current authenticated owner-only workout route and action boundaries unchanged.                                          | existing auth boundaries + scope review |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes only owner-facing pool-builder UI and note density, not sensitive-data policy or disclosure.                                    | explicit scope rationale                |
| Content governance                            | `supporting` | Supporting only: copy and labels must stay aligned with the shipped pool builder contract and not imply unsupported Garmin or open-water behavior.             | copy review + brief alignment           |
| Admin workflow and editability                | `target`     | The owner can reopen a saved pool session and edit steps/details with fewer redundant controls and clearer destructive-action placement.                       | manual QA + targeted tests              |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/workouts/[workoutId]` is an authenticated owner surface with no public crawl contract.                                                | explicit scope rationale                |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, metadata, or AI-facing document surface.                                                                       | explicit scope rationale                |
| Analytics and KPI observability               | `supporting` | Supporting only: session-edit and delete behavior stays observable through existing route-level builder usage without new event dependencies.                  | scope review                            |
| Commerce and revenue ops                      | `N/A`        | N/A because no entitlement, billing, pricing, or revenue path changes.                                                                                         | explicit scope rationale                |
| Incident response and support operations      | `N/A`        | N/A because this slice is limited to owner-facing builder copy/layout polish and does not change runbook-worthy failure or support workflows.                  | explicit scope rationale                |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, or reporting flow changes in this builder polish slice.                                                                | explicit scope rationale                |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English builder copy only and does not change localization architecture or locale routing.                             | explicit scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Reuse the current workout-builder stack and component model; do not add new dependencies or a second step-storage contract.                                    | dependency diff + architecture review   |
| Testing and QA automation                     | `target`     | Unit and e2e coverage protect the new pool-builder visibility contract, delete placement, and hidden-field compatibility rules.                                | targeted tests + `verify:pre-pr`        |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice reduces operator friction without adding extra fetch churn, polling, or preview generation cost.                                    | code review                             |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice is reversible through normal UI/component rollback with no schema drift.                                                            | diff review + rollback note             |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - the saved workout draft payload in the existing workouts table,
  - canonical step arrays, notes, and builder metadata already persisted through the current workout save route.
- Local-only:
  - metadata-panel open/closed state,
  - pending delete confirmation state,
  - note field height/auto-grow presentation,
  - local undo/removal presentation state.
- Sync policy:
  - canonical save still occurs only through the existing `PATCH /api/my-library/workouts/[id]` flow,
  - this brief does not add a second draft entity or local-only persisted step model,
  - for manual pool editing, hidden `step.name` and `targetSummary` values may remain in the stored draft schema for compatibility, but the editor must keep them synchronized to generated pool-step titles and cleared target-summary values so hidden stale copy does not leak into downstream save/export surfaces.
- Retention and sensitivity:
  - no new sensitive data class is introduced,
  - note text remains owner-authored workout content under the existing retention model.
- Cache/invalidation:
  - current route refresh and recent-workout summary updates remain authoritative after save/delete.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical identity for saved swim sessions.
- Human-readable identifiers:
  - session title and visible step summaries are editable or generated display strings, not stable identifiers.
- Mutability rules:
  - session title and note fields remain editable in place,
  - pool step display titles become generated from canonical step fields in the builder instead of hand-authored `Step name` input,
  - workout deletion still removes the saved workout entity instead of repurposing it.
- Rename vs repurpose policy:
  - step-summary display changes are presentation cleanup on the same step entity,
  - no new step identity or alias model is introduced in this slice.
- Compatibility contract:
  - existing saved workouts still load through the same route and draft contract,
  - hidden `step.name` stays schema-compatible for now, but the manual pool editor must stop depending on it as a user-authored field.
- Observability and repair:
  - if a hidden legacy field would become stale, the pool editor should overwrite it with generated step naming before save rather than leave invisible drift.

## Scope

- Move the saved-session `Delete session` action from the top route header into the metadata/details header beside the details toggle.
- Remove the open metadata helper sentence that reads like scaffolding.
- Rename the pool step section heading from `Editable draft steps` to `Session builder`.
- Remove these controls or helper blocks from the manual pool editor only:
  - `Step name`,
  - the duplicate top-level `Effort cue`,
  - `Target notes`,
  - stroke/drill helper paragraphs,
  - repeat helper copy,
  - manual `Pool Size` helper copy.
- Make these fields one-line by default with auto-growth while typing:
  - `Session note`,
  - `Step note`.
- Keep pool-step visible titles/summaries truthful after `Step name` removal by generating them from canonical step fields.
- Update targeted tests for the new manual-pool builder contract.

## Out Of Scope

- Starting a new Garmin slice or reopening the parked Garmin follow-up brief.
- Any open-water builder contract or layout decisions.
- Schema migration or permanent removal of `step.name` / `targetSummary` from stored workout drafts.
- Broad export, PDF, handoff, or API redesign beyond the compatibility mapping required by this note.
- Dryland or AI-generated builder changes beyond shared-component compatibility.

## Acceptance Criteria

1. The saved pool builder shows `Delete session` beside the details toggle instead of beside `My Swim Sessions`.
2. The pool metadata panel no longer shows the sentence `Keep the top-level setup here while you shape the workout steps below.`
3. The pool builder section is labeled `Session builder`.
4. Manual pool step editing no longer shows `Step name`, the duplicate top `Effort cue`, or `Target notes`.
5. Manual pool `Session note` and `Step note` start as one-line textareas and grow while typing.
6. Hidden legacy pool fields do not leave stale generic step names or target-summary copy in the current save/export contract.
7. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep this slice explicitly pool-only.
- Prefer truthful UI cleanup and compatibility mapping over deeper schema changes.
- Do not introduce a broader "same as Garmin visually" goal; this is about calmer FreeSwimming-native UI with Garmin-familiar semantics where already shipped.
- Do not break the current canonical save route or downstream export surfaces while removing visible fields.

## 10/10 Quality Bar

- A coach reopening a saved pool session should understand the page structure without filler text.
- The step editor should show only one control per pool authoring concept where possible.
- Hidden compatibility fields must not leak stale or generic labels into save/export behavior.
- Required states remain clear:
  - loading: current client-ready/canonical-save readiness states remain unchanged,
  - empty: no-session state remains truthful,
  - error: save/delete failures still explain what happened,
  - retry: existing save-again/delete-again flow remains the recovery path.

## Checkpoint Log

- `2026-04-07 | planning | created a dedicated child brief from owner note 3A29FEAE on the shipped pool builder route; scoped it to UI/detail polish only, explicitly kept the parked Garmin follow-up out of scope, and documented that hidden pool step fields must stay compatibility-safe without turning this into a schema migration | next: implement the pool-builder UI cleanup, update targeted tests, and run lint:briefs + targeted validation + verify:pre-pr`
- `2026-04-08 | shipped | merged PR #388 to main as squash commit def4b42 after rebasing, targeted unit/e2e fixes, local verify:pre-merge PASS, and green required GitHub checks; moved this brief to done and normalized repo-relative references for long-term traceability | next: continue collecting owner-led builder-polish findings under the parent live-review thread`
