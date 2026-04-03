# Task Brief: Workout Builder Drill And Kick Taxonomy Follow-Up (10/10)

## Metadata

- `id`: `2026-04-02-workout-builder-drill-kick-taxonomy-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-02`
- `updated`: `2026-04-02`

## Goal

Make drill and kick handling in the manual swim-session builder explicit enough that authors can understand the category, stroke-pattern, and focus-tag relationship without losing any existing builder input fields.

## Why This Brief Exists

- The production admin-notes umbrella still carries one explicit builder follow-up:
  - `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up`
- The parent builder brief already shipped calmer saved-session flow, lighter browse density, and earlier taxonomy guidance.
- The remaining gap is narrower:
  - the step editor still relies on labels that can blur `category`, `stroke`, and `drill/kick/pull` meaning,
  - default focus-tag behavior is not explicit enough when a step becomes a `kick` or `drill`,
  - summary output should stay truthful without duplicating obvious `Kick` or `Drill` tags.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Parent builder brief:
  - `docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Main product surfaces in scope:
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
- This slice owns:
  - step-taxonomy labels,
  - recommended focus-tag defaults for kick/drill cases,
  - non-duplicative summary rendering for implied kick/drill tags,
  - regression coverage and brief updates.
- This slice does not own:
  - builder notice placement or audience policy,
  - generator-route IA changes,
  - removal of any manual swim-session builder input fields.

## Triage Disposition

- `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up`
  - disposition: owned by this brief.
  - reason: the note maps directly to step-editor taxonomy clarity and explicit drill/kick handling.
- `854d3f39-9275-4d80-a624-a687e47db320` `Workout builder notice placement and audience follow-up`
  - disposition: out of scope for this slice.
  - reason: notice placement should land separately from taxonomy so the model/UI change stays small and easy to QA.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                        | Evidence                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Step authoring clearly separates category, stroke pattern, and focus tag without implying hidden taxonomy rules.                    | UI review + unit coverage               |
| UX flow clarity                               | `target`     | Authors can understand how `kick` and `drill` steps should be tagged in one pass through the step editor.                           | targeted unit tests + manual QA         |
| Visual design quality                         | `supporting` | Supporting only: updated labels/help text must feel like a natural continuation of the existing builder language.                   | screenshot review + copy review         |
| Business logic correctness and data integrity | `target`     | Kick/drill defaults stay deterministic, do not remove inputs, and do not create duplicate summary labels for implied tags.          | unit tests + typecheck                  |
| Admin editor ergonomics                       | `supporting` | Supporting only: the builder remains easier to edit without introducing a second taxonomy control or extra workflow steps.          | scope review + manual QA                |
| Accessibility (a11y)                          | `supporting` | Supporting only: changed labels remain explicit and screen-reader friendly with existing form semantics.                             | Testing Library queries + code review   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this slice changes step-form labels/defaults only and adds no route payload, async fetch, or rendering fan-out.        | explicit scope rationale                |
| Data placement and sync boundaries            | `target`     | Taxonomy defaults stay local until save; canonical workout persistence and IDs remain unchanged.                                     | brief contract + code review            |
| Caching and invalidation strategy             | `N/A`        | N/A because the slice changes no fetch path, cache boundary, or invalidation rule.                                                   | explicit scope rationale                |
| Reliability and failure handling              | `supporting` | Supporting only: deterministic defaults must avoid silent state confusion when the author changes category or stroke.               | unit tests + manual QA                  |
| Security and authz                            | `N/A`        | N/A because no auth boundary, role check, or protected API behavior changes in this taxonomy-only slice.                            | explicit scope rationale                |
| Privacy and compliance                        | `N/A`        | N/A because this slice only adjusts owner-scoped workout authoring labels/defaults and does not change personal-data handling.      | explicit scope rationale                |
| Content governance                            | `supporting` | Supporting only: label changes must stay aligned with the canonical workout authoring model.                                         | copy review + parent-brief alignment    |
| Admin workflow and editability                | `supporting` | Supporting only: the owner can keep using the same step editor without relearning where kick/drill notation lives.                  | targeted QA                             |
| SEO and crawlability                          | `N/A`        | N/A because the swim-session builder is an authenticated/private route and the slice adds no crawl surface.                         | explicit scope rationale                |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public content, schema, or metadata.                                                                | explicit scope rationale                |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy or KPI wiring changes in this step-editor-only follow-up.                                              | explicit scope rationale                |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or billing behavior changes.                                                                    | explicit scope rationale                |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no support workflow or runbook boundary beyond private builder labels.                                | explicit scope rationale                |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow is affected by the step-taxonomy clarification.                                         | explicit scope rationale                |
| i18n operational readiness                    | `N/A`        | N/A because the slice is confined to small English builder labels and does not change locale infrastructure or content contracts.    | explicit scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing session-draft model and builder UI with no new dependencies or parallel taxonomy state.                          | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Coverage proves label clarity, kick/drill default behavior, and regression safety, and the slice passes `npm run verify:pre-pr`.   | unit tests + gate output                |
| Scalability and cost efficiency               | `N/A`        | N/A because no new storage, background job, or repeated network cost is introduced.                                                  | explicit scope rationale                |
| DevOps and rollback readiness                 | `supporting` | Supporting only: taxonomy changes remain reversible in one editor component path with no schema drift.                               | rollback note + PR summary              |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout rows,
  - canonical workout IDs,
  - persisted step category, stroke, and focus-tag values after save.
- Local-only:
  - recommended kick/drill focus defaults before save,
  - any unsaved label/help-text interpretation state.
- Sync policy:
  - category/stroke changes update local draft state immediately,
  - canonical persistence remains unchanged and only happens through normal save.
- Retention and sensitivity:
  - no new data is stored,
  - no new sensitive fields are introduced.
- Cache/invalidation:
  - unchanged; normal workout save continues to refresh canonical workout state.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical identity for the saved session.
- Human-readable identifiers:
  - step names and workout titles remain editable labels only.
- Mutability rules:
  - this slice changes only label/help-text semantics and deterministic draft defaults.
- Rename vs repurpose policy:
  - out of scope; no entity rename behavior changes.
- Compatibility contract:
  - existing saved workouts and step data remain valid with the same builder route and save model.
- Observability and repair:
  - unit regression coverage must catch cases where taxonomy defaults drift or summary rendering duplicates implied tags.

## Scope

- Rename the step-taxonomy labels so the role of each control is clearer.
- Add deterministic kick/drill focus-tag defaults when the category or stroke pattern implies them.
- Keep summary rendering truthful by avoiding duplicate implied `Kick` or `Drill` tags.
- Update active brief/checkpoint notes for this slice.

## Out Of Scope

- Any removal of manual `Swim session builder` authoring fields/input boxes.
- Builder notice placement, support-panel placement, or audience policy changes.
- Generator-route IA changes or swim-session flow card changes.
- New schema fields or a second workout-step taxonomy model.

## Acceptance Criteria

1. The step form uses clearer labels than `Primary stroke` / `Drill / kick / pull focus`.
2. Changing a step to `kick` or `drill` recommends and applies the corresponding focus tag when the field was previously unset.
3. Authors can still override the focus tag after the default is applied.
4. Step summaries do not duplicate obvious implied `Kick` or `Drill` labels.
5. No manual swim-session builder input field is removed in this slice.
6. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root/worktree with the shared dependency set available.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<workoutId>`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep the change scoped to taxonomy clarity inside the existing step editor.
- Do not add new step fields or remove existing step fields.
- Preserve the canonical workout save contract and existing route structure.

## 10/10 Quality Bar

- Taxonomy should feel obvious without adding UI clutter.
- The labels should help the owner understand intent before reading helper text.
- Required states stay explicit:
  - `default swim step`
  - `kick step`
  - `drill step`
  - `manual focus-tag override`
  - `saved summary`
- The builder must stay form-first and low-friction.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because no Help/Guide workflow contract changes; the work is limited to owner-scoped swim-session step authoring labels/defaults.

## Security, Privacy, and Compliance

- Authentication and owner-scoped routing remain unchanged.
- No new storage, secrets, or sensitive payload fields are introduced.

## Observability And KPI Contract

- Success signal for this slice:
  - the owner can author kick/drill steps without guessing whether the meaning belongs in `Category`, `Stroke pattern`, or `Focus tag`.
- No new instrumentation is required in this slice.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated taxonomy slice.
- Open/update PR after `npm run verify:pre-pr` is green.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-02 | working tree | created the drill/kick taxonomy child slice under the production admin-notes umbrella and parent builder brief so the remaining builder taxonomy follow-up can land separately from the notice-placement slice | next: implement clearer labels, deterministic kick/drill focus defaults, and regression coverage`
- `2026-04-02 | working tree | implemented the taxonomy cleanup in WorkoutEditor, added deterministic recommended focus defaults for kick/drill paths, and passed targeted vitest + typecheck locally | next: run npm run lint:briefs and npm run verify:pre-pr, then commit/push/open the PR if the full gate stays green`
