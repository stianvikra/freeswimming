# Task Brief: Workout Builder And Poolside Execution UX (10/10)

## Metadata

- `id`: `2026-02-28-workout-builder-and-poolside-execution-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-24`

## Goal

Ship a Garmin-familiar manual session builder and poolside execution experience that is fast, clear, reliable on mobile, and aligned to the canonical Garmin-ready workout contract.

## Scope

- Current runtime implementation slice under this brief:
  - keep the dedicated authenticated canonical workout editor route for already-saved workouts,
  - reuse the same editable workout model the AI session generator now writes into,
  - link accepted AI workouts into that dedicated route from Generator Intake and My Library,
  - add first-party manual blank-workout creation into the canonical builder flow with a truthful `manual` source kind and a sensible starter scaffold,
  - add first-class repeat scaffolds with canonical repeat metadata and grouped builder controls,
  - add the first Garmin-familiar structured step modes for `fixed rest`, `lap button press`, `send-off`, `CSS-based send-off`, `target pace`, and `CSS-based target pace`,
  - add step-level stroke, drill-focus, and equipment authoring so Garmin-familiar swim-step context is editable in the canonical builder,
  - add broader pool-length presets plus exact custom pool-length entry for manual pool workouts,
  - switch the always-open step forms to summary-first Garmin-familiar step cards with explicit `Edit step` / `Done` controls,
  - add deterministic canonical-editor dirty-state feedback plus a reset-to-last-saved path so builder edits are obviously local until saved,
  - add local confirm + undo recovery for destructive step and repeat removals so builder editing stays safe before canonical save,
  - add local duplicate actions for single steps and repeat blocks so manual authoring can branch an existing pattern without rebuilding every field by hand,
  - add contextual insert-after actions for single steps and repeat blocks so new starter scaffolds can be placed exactly where the next set belongs,
  - keep poolside execution deferred while the richer step contract continues to stabilize.

- Manual workout/session authoring for user-built training sessions.
- Editing surface for accepted single-session AI drafts after they become canonical workouts, without moving generation logic into this brief.
- Builder UI patterns:
  - workout-level metadata editing,
  - step cards,
  - first-class `Add Step` and `Add Repeat` actions with no hidden advanced mode for core Garmin-familiar authoring,
  - explicit starter scaffolds for `Add Step` and `Add Repeat` when defaults are used, so users edit from a sensible swim-session skeleton instead of raw empty shells,
  - compact step-card summaries that surface duration, stroke/target, rest/open state, and step totals before opening full edit,
  - add step,
  - add repeat block,
  - reorder/remove,
  - section totals.
- Workout-level metadata editing:
  - title/name,
  - environment (`pool` or `open_water`),
  - when `pool`, `pool_length_m` as a numeric field with sensible presets plus custom entry so Garmin-like broader pool-size workflows are not blocked by a narrow enum,
  - session intent/type,
  - total target by distance and/or estimated time,
  - overall effort preset,
  - editable summary/description.
- Garmin-familiar structured step authoring:
  - Garmin Connect-style authoring labels such as `warmup`, `main`, `cooldown`, `rest`, and generic `swim`, without pretending those visible labels are the exact provider enums,
  - separate intensity handling aligned to Garmin-documented `WorkoutIntensity` semantics such as `active`, `warmup`, `cooldown`, `rest`, `recovery`, and `interval`,
  - Garmin-documented fixed `time`, fixed `distance`, and `open` duration behavior,
  - Garmin Connect UI duration choices such as `Lap Button Press`, `Fixed Rest Time`, `Send-Off Time`, and `CSS-Based Send-Off Time`, with explicit internal mapping instead of pretending those labels are public API enums,
  - duration + target pairing,
  - explicit standalone `rest` steps plus repeated active/rest sequences,
  - swim stroke targeting where Garmin-documented (`freestyle`, `backstroke`, `breaststroke`, `butterfly`, `drill`, `mixed`, `IM`),
  - if UI convenience options such as `Choice`, `IM by Round`, or `Reverse IM Order (RIMO)` are shown, they must map through explicit FreeSwimming aliases/composition rules rather than being assumed public Garmin API enums,
  - Garmin Connect-style target modes such as `no target`, `effort-based`, `target pace`, and `CSS-based target pace`, with explicit canonical mapping,
  - lap-swim vs open-water semantics kept explicit, including pool-length handling when the workout is lap swimming,
  - drill and equipment selectors where the workout shape needs them, with mapping constraints called out when provider parity is not confirmed in public docs,
  - repeat/interval block editing,
  - rest editing,
  - compatibility hints where a step shape cannot map cleanly downstream.
- Step editor:
  - section label / authoring role (`warmup`, `main`, `cooldown`, `rest`, `swim`),
  - intensity selection aligned to Garmin-documented workout-intensity semantics,
  - duration type that can represent Garmin-documented `time` / `distance` / `open` semantics and Garmin Connect UI labels for lap-button, fixed-rest, and send-off workflows,
  - distance with common presets plus custom entry where needed,
  - stroke,
  - drill type,
  - equipment,
  - intensity target,
  - explicit rest-mode handling when a step is a recovery/open-rest step,
  - threshold-based swim zone target when threshold context exists,
  - notes.
- Poolside mode:
  - one primary action per screen (`Next`/`Done`),
  - large tap targets,
  - progress visibility,
  - clear completion confirmation.
- Autosave + undo/confirm patterns for destructive changes.

## Out Of Scope

- AI session/program generation.
- Selecting planning horizon or competition-date peak intent for a new AI generation run.
- Goal-based automatic session creation.
- Weekly program/calendar authoring beyond the single-workout builder flow.
- Garmin API push.
- Canonical training history review, cancellation flows, and retrospective evaluation after completion.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - persisted workout, step, template, and completion state from the data-contract slice.
- Local-only:
  - transient edit buffers, drag state, unsaved draft UI, undo windows, and poolside temporary execution UI state.
- Sync behavior:
  - autosave may improve UX, but server-acknowledged payload remains canonical,
  - stale writes must return deterministic refresh/retry guidance,
  - local reorder/edit operations must reconcile against canonical IDs, not visible card order.
- Invalidation:
  - save/delete/reorder operations invalidate builder summaries, poolside resume state, and any cached workout detail views for the affected workout.

## Identity And Rename Contract

- Canonical stable IDs:
  - builder state must operate on canonical workout/step/template IDs from the data-contract slice, not on transient card order or display labels.
- Human-readable identifiers:
  - step titles, drill labels, and poolside display copy are user-facing and may change without rewriting canonical IDs.
- Mutability rules:
  - drag/drop reorder, insert, duplicate, and delete actions must preserve canonical IDs for unchanged items and create new IDs only for genuinely new entities.
- Rename vs repurpose:
  - editing step copy or workout title in place is allowed for the same underlying object,
  - replacing a step/template with materially different content should create a new object reference rather than silently mutating historical identity.
- Compatibility contract:
  - autosave, undo, poolside resume, and deep-link/open-last-session flows must rehydrate by canonical IDs rather than by display order.
- Observability and repair:
  - stale draft references or missing canonical IDs must fail with explicit recovery guidance, not be rebound to the wrong visible card.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                              | Evidence                               |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Product goals and IA                          | `target`     | Builder and poolside IA keep create/edit/execute flow understandable from first entry to completion.          | UX spec + e2e journey                  |
| UX flow clarity                               | `target`     | Workout can be built from scratch in <= 2 minutes median with no dead-end save/execute state.                 | e2e + timed QA                         |
| Visual design quality                         | `target`     | Builder and poolside layouts remain readable and intentionally structured on phone, tablet, and desktop.      | visual QA matrix                       |
| Business logic correctness and data integrity | `target`     | Reorder/edit/autosave flows preserve canonical item identity with deterministic state transitions.            | unit/integration tests                 |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin CRUD for drills/templates is owned by the dedicated library/admin slice.               | scope rationale                        |
| Accessibility (a11y)                          | `target`     | Keyboard/focus/labels complete for builder forms, destructive actions, and poolside primary controls.         | a11y tests + manual keyboard QA        |
| Performance (CWV + payloads)                  | `target`     | No blocking lag during add/reorder/edit actions and no material builder-route payload regression.             | perf checks + interaction QA           |
| Data placement and sync boundaries            | `target`     | Local draft/autosave boundaries vs server-canonical workout state are explicit and enforced.                  | data contract + integration tests      |
| Caching and invalidation strategy             | `target`     | Save/delete/reorder operations refresh canonical builder and poolside reads deterministically.                | cache notes + integration tests        |
| Reliability and failure handling              | `target`     | Draft is recoverable after transient save failures and poolside state always offers retry/recover path.       | integration + e2e                      |
| Security and authz                            | `target`     | Protected write paths fail closed and malformed builder payloads do not mutate persisted state.               | negative-path API tests                |
| Privacy and compliance                        | `supporting` | Supporting only: builder drafts/analytics must avoid leaking sensitive personal notes beyond defined scope.   | payload review + scope rationale       |
| Content governance                            | `supporting` | Supporting only: canonical workout identity/governance comes from the data-contract slice.                    | linked brief + scope rationale         |
| Admin workflow and editability                | `supporting` | Supporting only: no primary admin workflow is changed in this end-user execution slice.                       | scope rationale                        |
| SEO and crawlability                          | `supporting` | Supporting only: builder/poolside authenticated surfaces are not primary crawl targets.                       | scope rationale                        |
| AI discoverability                            | `supporting` | Supporting only: this slice consumes canonical workout data but does not define public AI-discoverable pages. | scope rationale                        |
| Analytics and KPI observability               | `supporting` | Supporting only: stable builder/execute events should remain available for later funnel instrumentation.      | event contract notes                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct checkout/entitlement logic changes in this slice.                                  | scope rationale                        |
| Incident response and support operations      | `supporting` | Supporting only: failed autosave/execute states must leave support-visible diagnostics and recovery guidance. | error-state contract + scope rationale |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation in this builder UX slice.                                      | scope rationale                        |
| i18n operational readiness                    | `supporting` | Supporting only: builder labels and validation copy must remain locale-extensible.                            | copy contract + scope rationale        |
| Stack-fit and dependency discipline           | `target`     | Use existing React/Next.js patterns and avoid unnecessary drag/save-state dependencies.                       | dependency diff + code review          |
| Testing and QA automation                     | `target`     | Critical builder/edit/execute/failure paths are covered in unit+integration+e2e gates.                        | test matrix + verify outputs           |
| Scalability and cost efficiency               | `supporting` | Supporting only: autosave/reorder behavior must avoid excessive write amplification.                          | perf notes + scope rationale           |
| DevOps and rollback readiness                 | `target`     | Builder/poolside rollout includes safe disable/rollback path if canonical save behavior regresses.            | rollout notes + release checklist      |

## Acceptance Criteria

- Users can create, reorder, repeat, and save workouts without confusion.
- Users can manually author their own workouts without being routed through AI generation.
- Accepted AI-generated single-session drafts can be edited through the same canonical workout editor once they exist, without forking identity rules.
- The same editor can change workout-level metadata such as pool/open-water context, pool length, title, effort preset, session intent, and total target after AI generation or manual creation.
- Users can author Garmin-familiar target/duration/repeat structures without learning a hidden export model later.
- Users can author fixed rest and `open`/lap-button drill/rest steps without leaving the main builder flow.
- Users can author send-off and CSS-based send-off style steps without learning a second advanced export-only vocabulary later.
- If the UI exposes Garmin Connect-like labels such as `Main`, `Choice`, `IM by Round`, or `RIMO`, their internal mapping stays explicit and truthfully documented rather than implied as public Garmin provider fields.
- Threshold-based swim zone targets, when shown, use the shared published method rather than a separate builder-only zone system.
- Poolside mode supports clean execution with minimal cognitive load.
- Save/cancel/dirty-state behavior is deterministic.
- Builder is Garmin-familiar in structure without brand cloning.
- `Add Step` and `Add Repeat` are first-class entry actions, and step cards show compact Garmin-familiar summaries before edit.
- If the builder uses starter default steps or starter repeat scaffolds, those defaults are explicit, quick to overwrite, and never trap the user in hidden assumptions.
- Reorder and autosave flows do not corrupt canonical item identity.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- unit tests for builder state transitions
- e2e on mobile/tablet/desktop for full build->execute path
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-19 | planning | clarified that this brief owns manual workout/session building and poolside execution only; AI generation and weekly program authoring remain separate briefs | next: request owner detail later on exact manual-builder ergonomics, save model, and Garmin-export handoff expectations before implementation starts`
- `2026-03-20 | planning | tightened this brief into the explicit manual session builder track, added Garmin-familiar target/duration/repeat authoring requirements, and aligned swim-intensity editing to the shared threshold-based zone method | next: request owner detail later on exact builder editing ergonomics and how much compatibility guidance should be visible before export/send exists`
- `2026-03-20 | planning | clarified that accepted AI-generated single-session drafts should hand off into this same editor after canonical save, while horizon selection and competition intent remain upstream generator concerns | next: keep later implementation focused on canonical workout editing and avoid mixing generation controls into the manual builder UI`
- `2026-03-20 | planning | added explicit workout-level metadata editing expectations for environment, pool length, session intent, effort preset, and normalized distance/time totals so AI-authored drafts and manual workouts can truly share the same editor instead of only the same step cards | next: keep future builder implementation centered on one canonical workout form that can edit both metadata and steps`
- `2026-03-20 | working tree | moved this brief to in-progress and narrowed the first runtime slice to a dedicated canonical workout editor route for already-accepted workouts, while manual blank-workout creation and poolside execution remain deferred | next: extract the shared workout editor out of Generator Intake, wire `/my-library/workouts/[workoutId]`, and point accepted workout links there`
- `2026-03-20 | working tree | extracted the shared workout editor, added the dedicated `/my-library/workouts/[workoutId]` route plus My Library entrypoint, and covered generator -> builder handoff with unit + e2e validation | next: commit this slice on its own branch and rerun full repo gates from branch HEAD so PR-body/brief automation evaluates the current diff instead of falling back to the previous merge commit`
- `2026-03-22 | planning | tightened the builder brief against observed Garmin swim-builder patterns and official Garmin developer docs so future manual-builder slices must treat `Add Step`, `Add Repeat`, starter scaffolds, Garmin-documented `WorkoutIntensity`, `open`, `swim_stroke`, lap/open-water context, and Garmin Connect UI concepts like `Main`, `Lap Button Press`, fixed rest, send-off, `Choice`, and `RIMO` as first-class UX with explicit mapping rather than export-only details | next: resume builder implementation with manual blank-workout creation and richer step authoring before jumping to weekly calendar planning`
- `2026-03-22 | working tree | added the next manual-builder slice: My Library and Workout Builder can now create a canonical manual workout directly, the save API persists `source_kind = manual`, the starter draft includes a swim-friendly scaffold with explicit rest steps, and the new create flow is covered with unit + desktop e2e validation | next: run full `verify:pre-pr`, then commit/push/open the PR if the repo gate stays green`
- `2026-03-22 | perf trend decision: hold | \`npm run verify:pre-pr\` reported two consecutive weekly green perf-budget runs and recommended tightening one stretch target step; decision is \`hold\` for this manual-builder slice because it does not change the public budget routes governed by AW-010, so the tighten choice should be recorded again in PR handoff and revisited in the next perf-focused checkpoint | next: keep builder implementation moving while carrying the AW-010 tighten/hold note forward`
- `2026-03-23 | working tree | added the next builder slice: workout steps can now carry canonical repeat metadata, the editor exposes a grouped `Add Repeat` scaffold with repeat-count controls and group-safe movement, and targeted unit + desktop e2e validation for repeat save/load behavior is green | next: run full \`verify:pre-pr\`, then commit/push/open the PR if the repo gate stays green`
- `2026-03-23 | perf trend decision: hold | \`npm run verify:pre-pr\` reported three consecutive weekly green perf-budget runs and recommended tightening one stretch target step; decision is \`hold\` for this repeat-block builder slice because it does not materially change the public perf-budget routes owned by AW-010 | next: carry the same tighten/hold note into PR handoff and revisit tightening in the next perf-focused checkpoint`
- `2026-03-23 | working tree | added the next builder slice: workout steps now support canonical `fixed_rest`and`lap_button`duration modes plus structured`effort`, `target_pace`, and `css_target_pace` targets; the editor exposes these modes directly, route validation rejects incomplete target metadata, and targeted unit + desktop e2e coverage are green | next: carry the green \`verify:pre-pr\` evidence into commit/push/PR handoff for this slice`
- `2026-03-23 | perf trend decision: hold | \`npm run verify:pre-pr\` again reported the AW-010 tighten recommendation after another green perf-budget run; decision remains \`hold\` for this builder-step-mode slice because it does not materially change the public perf-budget routes owned by AW-010 | next: record the same hold rationale in PR handoff and revisit tightening at the next perf-focused checkpoint`
- `2026-03-23 | working tree | added the next builder slice: workout steps now carry step-level Garmin-familiar stroke, drill-focus, and equipment context, the editor keeps session stroke/equipment lists truthfully synced to in-use step metadata, and targeted unit + desktop e2e coverage is being refreshed for the richer step editor flow | next: run targeted validation, then full \`verify:pre-pr\`, and carry the merge-ready evidence into the PR handoff if the repo gate stays green`
- `2026-03-23 | working tree | added the next builder slice: workout steps now support explicit `send_off`and`css_send_off` duration modes, the editor exposes Garmin-familiar send-off inputs and CSS send-off selectors, and targeted lint + unit + typecheck + desktop e2e validation are green | next: run full \`verify:pre-pr\`, then carry the gate evidence into commit/push/PR handoff if the repo gate stays green`
- `2026-03-23 | working tree | full \`verify:pre-pr\` passed for the send-off slice; desktop Chromium builder e2e is green inside the full matrix, and no new deterministic regressions were found while extending the canonical step contract with `send_off` and `css_send_off` | next: commit this slice, push the branch, and open the PR in Safari`
- `2026-03-23 | perf trend decision: hold | full \`verify:pre-pr\` again reported the AW-010 tighten recommendation after another green perf-budget run; decision remains \`hold\` for this send-off builder slice because it still does not materially change the public perf-budget routes owned by AW-010 | next: repeat the tighten/hold checkpoint in the PR summary and revisit tightening on the next perf-focused route slice`
- `2026-03-23 | working tree | added the next builder slice: manual pool workouts now support broader Garmin-familiar preset pool sizes plus exact custom pool-length entry, and the canonical workout save/load path is being refreshed so non-standard pool lengths round-trip truthfully through the builder | next: run targeted validation, then full \`verify:pre-pr\`, and carry the gate evidence into the PR handoff if the repo gate stays green`
- `2026-03-23 | working tree | completed the custom pool-length builder slice: draft/editor/runtime now support broader preset pool sizes plus exact custom pool lengths, the workouts schema detector no longer mislabels constraint failures as schema-sync outages, and Supabase migration \`20260323113500_workouts_custom_pool_lengths.sql\` was applied to the linked project so non-standard pool lengths can persist end-to-end | next: commit this slice, rerun branch-head gates so the changed brief is linted from commit diff, then open the PR in Safari`
- `2026-03-23 | perf trend decision: hold | full \`verify:pre-pr\` again reported the AW-010 tighten recommendation after another green perf-budget run; decision remains \`hold\` for this custom pool-length builder slice because it still does not materially change the public perf-budget routes owned by AW-010 | next: repeat the tighten/hold checkpoint in the PR summary and revisit tightening on the next perf-focused route slice`
- `2026-03-23 | working tree | added the next builder slice: step cards now move toward the Garmin-style editing flow by staying summary-first until opened, new steps/repeats open directly into edit mode, and explicit \`Edit step\` / \`Done\` controls are being wired without changing the canonical workout contract | next: rerun targeted builder unit + desktop e2e validation, then carry the evidence into full \`verify:pre-pr\` if the flow stays green`
- `2026-03-23 | working tree | added the next builder slice: distance-authored steps now use Garmin-familiar preset distance choices plus exact custom distance entry, so step-level distance editing matches the observed Garmin flow without constraining the canonical workout contract to presets only | next: rerun targeted builder unit + desktop e2e validation, then carry the evidence into full \`verify:pre-pr\` if preset/custom distance persistence stays green`
- `2026-03-23 | working tree | full \`verify:pre-pr\` passed for the step-distance slice; targeted and full-matrix builder/generator flows stayed green while preset and exact custom step distances round-tripped through the canonical workout save path | next: commit this slice, push the branch, and open the PR in Safari`
- `2026-03-23 | perf trend decision: hold | full \`verify:pre-pr\` again reported the AW-010 tighten recommendation after another green perf-budget run; decision remains \`hold\` for this step-distance builder slice because it still does not materially change the public perf-budget routes owned by AW-010 | next: repeat the tighten/hold checkpoint in the PR summary and revisit tightening on the next perf-focused route slice`
- `2026-03-23 | working tree | added the next builder slice: step-level stroke authoring now includes Garmin-familiar convenience choices such as \`IM by Round\` and \`Reverse IM Order (RIMO)\`, with explicit internal aliases that persist canonically on the step while keeping session-level allowed-stroke lists limited to real swim strokes; targeted lint + unit + desktop e2e validation are green | next: run full \`verify:pre-pr\`, then carry the branch-head gate evidence into commit/push/PR handoff if the repo gate stays green`
- `2026-03-24 | working tree | added deterministic dirty-state builder controls: canonical workout editor now shows when changes are unsaved, disables save when nothing changed, and exposes reset-to-last-saved recovery in both the dedicated workout route and generator handoff; targeted unit coverage and desktop builder e2e should be rerun before the next PR handoff | next: run targeted validation, then \`npm run verify:pre-pr\` once the local tree is ready for a clean builder checkpoint`
- `2026-03-24 | working tree | full \`verify:pre-pr\` passed for the dirty-state builder slice: local gates were green end-to-end (`lint:briefs` skipped because the builder brief change is still uncommitted on branch, eslint PASS, typecheck PASS, 124/124 vitest files PASS, build PASS, perf budgets PASS, Playwright PASS with 92 passed / 262 skipped) and the focused builder flows stayed green while dirty-state, reset-to-saved, and save-disabled-when-clean behavior were added to both canonical editor entrypoints | next: stage only the scoped builder files, commit on the builder branch, push, and open/update the PR without mixing in the separate admin-notes triage docs`
- `2026-03-24 | perf trend decision: hold | full \`verify:pre-pr\` recommended \`hold\` again after the perf-budget run (`runs: 1/2`, worst margin `36.7%`); decision remains \`hold\` for this dirty-state builder slice because it does not materially change the public perf-budget routes owned by AW-010 | next: repeat the tighten/hold rationale in the PR handoff and revisit tightening in the next perf-focused route slice`
- `2026-03-24 | working tree | added local destructive-edit recovery to the canonical workout editor: step and repeat removals now require explicit confirmation, save/reset stay blocked while a destructive confirmation is pending, and both removal paths offer a pre-save undo restore path with targeted unit + desktop e2e coverage being refreshed | next: run targeted validation, then \`npm run verify:pre-pr\` once this slice is ready for a clean PR checkpoint`
- `2026-03-24 | working tree | added local duplication controls to the canonical workout editor: single steps and full repeat blocks can now be duplicated directly after the source pattern with fresh local identities, and targeted unit + desktop e2e coverage are being refreshed for the new authoring path | next: run targeted validation, then \`npm run verify:pre-pr\` once this slice is ready for a clean PR checkpoint`
- `2026-03-24 | working tree | added contextual insert-after controls to the canonical workout editor: single steps and repeat blocks can now place new starter steps or repeat scaffolds directly after the active authoring context, while repeat-step insertion keeps the new blank step inside the same repeat group with the same round count | next: run targeted validation, then \`npm run verify:pre-pr\` once this slice is ready for a clean PR checkpoint`
