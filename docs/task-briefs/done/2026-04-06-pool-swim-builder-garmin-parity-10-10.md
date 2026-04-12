# Task Brief: Pool Swim Builder Garmin Parity (10/10)

## Metadata

- `id`: `2026-04-06-pool-swim-builder-garmin-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-06`
- `updated`: `2026-04-06`

## Goal

FreeSwimming gets a dedicated `pool` manual swim-session builder that matches Garmin Connect pool-swim authoring closely in fields, choices, wording, repeat/rest behavior, and builder constraints, while `open water` is routed into a separate non-parity flow.

## Why This Brief Exists

- The current manual swim-session builder is now calmer and clearer, but it is still best described as `Garmin-familiar`, not `Garmin-parity`.
- Live review after the create-vs-edit and metadata-panel slices exposed a more specific next target:
  - `pool` and `open water` should no longer share one blended authoring form,
  - `pool` should move toward Garmin Connect parity instead of a generic swim builder,
  - `open water` should stay available, but through a separate temporary path until its own contract is defined.
- Verified parity gaps from code review plus Garmin support material include:
  - Garmin-specific pool builder wording such as `Pool Swim`, `Pool Size`, `Send-off Time`, and step-note semantics do not yet match FreeSwimming wording,
  - Garmin's explicit repeat-rest behavior, especially the ability to use or skip the final rest step in a repeat block, is not modeled in FreeSwimming today,
  - Garmin has pool-workout-specific constraints and semantics that should not be hidden inside a generic `pool/open water` form,
  - Garmin's documented workout compatibility and swim-workout authoring behavior is clear for `Pool Swim`, but not yet sufficiently confirmed for a full `Open Water Swim` parity claim.

## Product Direction Locked By This Brief

- `Pool` and `Open water` become separate manual-authoring modes.
- The owner-chosen approach for the next UX step is:
  - `Build pool session`
  - `Build open water session`
- `Pool` owns the Garmin parity target.
- `Open water` is not part of this parity brief and must not distort pool-builder choices.
- The dedicated pool builder should match Garmin Connect behavior as closely as practical in:
  - top-level fields,
  - step-level fields,
  - repeat/rest semantics,
  - labels and wording,
  - constraints and validation rules,
  - export-preview semantics where those semantics affect what the user believes the watch will do.

## Open Water Guardrails

- `Open water` remains available to users, but through a separate flow or form.
- This brief does not attempt to prove Garmin parity for `open water`.
- Temporary allowed path:
  - route `Build open water session` into the current generalized swim-session builder contract, or a lightly wrapped variant of it, as long as it is visually and behaviorally separate from the new pool parity builder.
- Explicit non-goal for this brief:
  - do not force `open water` into pool-builder wording, pool-size assumptions, repeat-rest semantics, or Garmin-specific pool terminology.
- A later dedicated open-water brief must decide:
  - whether the target is Garmin parity,
  - which fields belong in the open-water form,
  - which current generic-builder concepts remain valid there.

## Dependencies And Boundaries

- Epic lineage:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-02-28-workout-builder-garmin-familiar-epic-10-10.md`
- Active builder parent that still owns the broader swim-session UX wave:
- `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Recently shipped builder slices that this brief builds on:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-metadata-panel-clarity-10-10.md`
- Existing implementation surfaces likely touched first:
  - `/Users/stianvikra/freeswimming/app/my-library/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/CreateManualWorkoutButton.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/manual.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
- Relevant downstream contracts that must stay truthful:
  - canonical workout persistence in the workouts table,
  - Garmin-ready export payload and PDF/poolside note output,
  - saved-session browse/edit routing through canonical workout IDs,
  - My Library recent-workout summaries and program assignment references.

## Garmin Parity Contract

Parity in this brief means all of the following for the `pool` builder:

- field parity:
  - the top-level setup fields align to Garmin's documented pool-swim workout authoring model,
- choice parity:
  - step types, stroke patterns, focus/drill tags, rest behavior, pool-size choices, repeat choices, and supported duration/target modes align as closely as practical,
- wording parity:
  - user-facing labels should favor Garmin-like pool-workout wording where that wording is documented and fits the product,
- behavior parity:
  - repeat blocks, rest placement, send-off behavior, open/lap-button behavior, and step validation should express Garmin-like swim-workout semantics rather than generic builder semantics,
- constraint parity:
  - builder limits and invalid combinations should fail in the same spirit as Garmin where those constraints are documented,
- truthfulness:
  - if FreeSwimming intentionally diverges from Garmin on any point, the brief or slice implementation must document the reason explicitly instead of implying parity.

## Initial Parity Matrix To Lock Before Implementation

The first implementation slice under this brief must turn this matrix into a concrete checked list:

1. Entry split:
   - Garmin reference: pool workouts are a dedicated swim-workout mode.
   - FreeSwimming now: one shared swim form with `pool/open water` environment choice.
   - target: separate `Build pool session` and `Build open water session` entrypoints.
2. Top-level pool metadata:
   - Garmin reference: pool-workout-first labels and pool-size semantics.
   - FreeSwimming now: `Session note`, `Environment`, `Pool length`, secondary `Training profile`.
   - target: pool-authoring labels reviewed one by one against Garmin pool language.
3. Pool size:
   - Garmin reference: explicit `Pool Size`, including `Unspecified`.
   - FreeSwimming now: preset metric pool lengths plus exact numeric input, no `Unspecified`.
   - target: documented decision on `Unspecified`, meter/yard handling, and compatibility wording.
4. Repeat/rest semantics:
   - Garmin reference: repeat blocks can explicitly use or skip the final rest interval.
   - FreeSwimming now: repeat groups are contiguous repeated steps, with no explicit last-rest toggle.
   - target: deterministic Garmin-like repeat/rest behavior for pool workouts.
5. Step authoring:
   - Garmin reference: swim-step, rest-step, open/time-based step, send-off behavior, step notes.
   - FreeSwimming now: broader generic step model with extra metadata and some non-Garmin wording.
   - target: pool-step builder reflects Garmin-like choices and terminology as closely as practical.
6. Limits and invalid states:
   - Garmin reference: documented step limits and compatibility constraints.
   - FreeSwimming now: repeat-count limits exist, but not the same documented total-step limits.
   - target: constraints audited and aligned where docs support it.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                | Evidence                                  |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `target`     | `Pool` and `open water` are separate manual entry choices, and the `pool` route clearly behaves as the Garmin-parity path rather than a generic swim builder.                 | IA review + manual QA + e2e               |
| UX flow clarity                               | `target`     | A swimmer can enter the pool builder and recognize Garmin-like pool-workout concepts without guessing whether they are in a generic swim form.                                | manual QA + targeted e2e                  |
| Visual design quality                         | `target`     | The parity builder feels intentional and coherent rather than like a patched generic form with many conditional controls.                                                     | screenshot review + manual QA             |
| Business logic correctness and data integrity | `target`     | Repeat/rest behavior, step validation, and saved workout persistence stay deterministic while moving from a generic swim model toward a Garmin-like pool-workout model.       | unit tests + integration review           |
| Admin editor ergonomics                       | `target`     | Repeated manual workout authoring in the pool builder is faster and less ambiguous because labels, choices, and repeat semantics match the intended Garmin mental model.      | timed manual QA + targeted e2e            |
| Accessibility (a11y)                          | `supporting` | Supporting only: the split pool/open-water entry and any new repeat-rest controls remain keyboard- and screen-reader-friendly.                                                | targeted tests + code review              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the pool builder split and parity controls do not materially regress `/my-library` or workout-detail responsiveness.                                         | targeted review + verify                  |
| Data placement and sync boundaries            | `target`     | The pool-parity builder still writes through the existing canonical workout boundary, and any Garmin-like UI controls map deterministically into that contract.               | brief contract + code review              |
| Caching and invalidation strategy             | `supporting` | Supporting only: the split entry routes and saved-session edit flow continue to use deterministic refresh/invalidation without a second shadow state model.                   | integration review                        |
| Reliability and failure handling              | `target`     | Invalid repeat/rest combinations, unsupported pool-size states, and save failures fail clearly instead of leaving the user in an ambiguous workout state.                     | negative-path tests + manual QA           |
| Security and authz                            | `supporting` | Supporting only: all changed workout routes and APIs remain owner-scoped and authenticated.                                                                                   | existing auth boundaries + negative paths |
| Privacy and compliance                        | `N/A`        | N/A because this brief changes owner-scoped workout authoring behavior and labels, not privacy policy or public-data disclosure.                                              | explicit scope rationale                  |
| Content governance                            | `target`     | Garmin-like wording and parity claims stay centralized in one audited pool contract so the product does not drift into undocumented half-parity language.                     | parity matrix + code review               |
| Admin workflow and editability                | `target`     | The owner can build and verify Garmin-like pool sessions repeatedly without mentally translating generic FreeSwimming-specific builder concepts.                              | manual QA + targeted tests                |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated My Library surfaces with no public crawl contract.                                                                                        | explicit scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public AI-facing route, metadata, or discoverability contract.                                                                              | explicit scope rationale                  |
| Analytics and KPI observability               | `supporting` | Supporting only: route/action usage still makes pool-vs-open-water authoring behavior interpretable even if no new analytics vendor instrumentation is added.                 | scope review                              |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, checkout, or subscription reporting path changes.                                                                               | explicit scope rationale                  |
| Incident response and support operations      | `supporting` | Supporting only: if pool-builder labels and recovery semantics change, Help/Guide and runbook language must describe the split pool/open-water model truthfully.              | docs update or explicit rationale         |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payouts, billing, or operator reporting flows change in this builder parity work.                                                      | explicit scope rationale                  |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes internal English builder wording only and should not block future localization architecture, but it must avoid embedding parity logic in copy. | explicit scope rationale                  |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout stack and route model first; do not add a parallel persistence layer or unnecessary dependencies in the first parity slices.                       | dependency diff + architecture review     |
| Testing and QA automation                     | `target`     | Coverage protects pool/open-water route split, parity field visibility, repeat-rest rules, and documented Garmin-like constraints before PR update.                           | unit/e2e coverage + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Supporting only: parity improvements should reduce authoring friction without adding unnecessary save churn, route duplication cost, or runaway output complexity.            | code review + manual QA                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the pool/open-water split and parity-field changes remain reversible without destructive schema migration in the first slices.                               | rollback note + diff review               |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - canonical saved workout rows and draft payloads in the workouts table,
  - saved-session summaries and downstream export/handoff payloads.
- Local-only:
  - transient builder open/closed UI state,
  - temporary route entry context such as `pool` vs `open water` authoring mode,
  - unsaved local edits before save confirmation,
  - transient preview notices and validation messages.
- Sync policy:
  - the parity builder continues to create or update canonical workouts through the existing authenticated workout APIs,
  - parity controls must map deterministically into the canonical workout draft shape or a documented compatibility extension,
  - invalid repeat/rest combinations must fail before mutation and explain the fix clearly.
- Retention and sensitivity:
  - no new sensitive data class is introduced,
  - the brief only changes workout authoring semantics and route split, not retention policy.
- Cache/invalidation:
  - existing `router.push`/`router.refresh` and canonical save flows remain authoritative,
  - no parallel hidden draft store is introduced in the first parity slices.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical workout identity across pool builder, saved-session browse, export, and later program assignment.
- Human-readable identifiers:
  - labels such as `Build pool session`, `Build open water session`, `Pool Size`, `Send-off Time`, and similar parity wording are mutable UI labels, not identifiers.
- Mutability rules:
  - workout titles remain editable in place,
  - builder labels may change in place,
  - route-level authoring mode labels do not change canonical workout identity.
- Rename vs repurpose policy:
  - changing a pool workout title or notes is an in-place edit,
  - a materially different swim session should still be a new workout row rather than silently repurposing an unrelated saved workout.
- Compatibility contract:
  - existing saved pool workouts remain editable even if the pool builder UI becomes more Garmin-like,
  - old saved workouts lacking future parity metadata must still load via compatibility mapping or explicit guarded fallback.
- Observability and repair:
  - legacy or invalid workout payloads should surface explicit loadError guidance rather than crashing route render,
  - parity-specific validation failures must be testable and logged clearly enough for repair.

## Scope

- Add a dedicated `pool` manual-builder direction with a clear route/entry split from `open water`.
- Define and implement the Garmin parity matrix for the `pool` builder.
- Audit and update top-level `pool` fields and wording to align with Garmin's documented pool-workout model.
- Audit and update step-level pool authoring choices and wording to align with Garmin where documented.
- Implement explicit repeat/rest semantics for `pool`, including the final-rest decision in repeat blocks.
- Audit documented Garmin pool-workout constraints and encode supported constraints in the builder and validators.
- Keep saved-session persistence, export, and poolside output truthful after the parity changes.
- Add or update tests for:
  - pool/open-water entry split,
  - pool field parity decisions,
  - repeat/rest behavior,
  - documented constraints and failure states.

## Out Of Scope

- Full `open water` authoring redesign or Garmin parity for open water.
- Reworking dryland builder flows.
- Reopening AI generator internals beyond entry/linking impacts.
- Introducing a second persistence model or local-only shadow workout entity.
- Blindly cloning Garmin branding or visual design 1:1.
- Claiming parity on undocumented Garmin behavior without source-backed rationale.

## Acceptance Criteria

1. My Library manual swim entry exposes distinct pool and open-water actions.
2. `Pool` routes into a dedicated parity-oriented builder path instead of a generic shared form.
3. The brief's parity matrix is converted into explicit implementation decisions before field-level coding drifts.
4. Pool repeat/rest authoring supports the documented Garmin final-rest behavior rather than forcing users to approximate it manually.
5. Pool top-level fields, step fields, and core wording are aligned to Garmin pool-workout semantics closely enough that any remaining differences are documented deliberately.
6. Existing saved workouts still load, save, and export safely after the parity work.
7. Open water remains available through a separate clearly non-parity path.
8. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
  - any new parity-focused unit tests for repeat/rest semantics and pool-size constraints
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

- Keep `pool` and `open water` separate in UI and behavior once this brief starts implementation; do not slip back to one shared environment form as the primary pool authoring surface.
- Treat Garmin support/documented behavior as the primary parity reference, not memory or assumptions.
- Prefer truthful compatibility mapping over silent mutation for old saved workouts.
- Do not remove user-visible capabilities from `open water` without a separate open-water brief.
- Keep the first parity slices stack-native and rollback-safe.

## 10/10 Quality Bar

- A swimmer familiar with Garmin pool workouts should recognize the pool builder's structure quickly.
- The builder must make repeat blocks and rest behavior explicit enough that users do not need to mentally simulate hidden semantics.
- Required states stay clear:
  - loading: saved workout or parity controls load without route crashes,
  - empty: starting a new pool session makes the next step obvious,
  - error: invalid parity combinations explain what to change,
  - retry: users can correct the workout and save again without losing work.
- Accessibility and clarity must not regress while improving parity.
- Business logic must remain deterministic:
  - no ambiguous repeat boundaries,
  - no silent invalid rest behavior,
  - no hidden conversion of saved workouts without explicit compatibility handling.

## Help/Guide Impact

- Required in the same implementation PR when workflow labels or repeat/rest behavior ship:
  - update any Help/Guide or runbook references that describe manual swim-session entry so they explain the pool/open-water split and any Garmin-like repeat/rest semantics truthfully.

## Checkpoint Log

- `2026-04-06 | planning | created a dedicated pool-parity brief after manual review showed the current swim builder is Garmin-familiar but not Garmin-parity; locked the next direction as separate `pool`and`open water`manual entry paths, with`pool`owning the parity target and`open water` explicitly scoped out into a separate temporary flow | next: turn the initial parity matrix into the first implementation slice, starting with entry split plus audited field/wording decisions for the pool builder`
- `2026-04-06 | implementation start | created a clean worktree from origin/main, split manual entry into separate pool/open-water create actions, locked manual workout metadata to the chosen environment surface, and started updating unit/e2e coverage to the new entry contract | next: finish targeted test alignment, run brief lint plus targeted validation, then execute `verify:pre-pr` before opening the PR`
- `2026-04-06 | targeted validation complete | updated the My Library overview and workout browse surfaces to expose separate pool/open-water manual entry, added environment-specific empty drafts plus metadata locking in the manual builder, refreshed runbook text, and passed targeted unit + desktop Playwright coverage for the changed workout/program flows | next: commit the first slice, rerun full `npm run verify:pre-pr`, then open the PR with the generated body on current branch state`
- `2026-04-06 | merged as f494a55 via PR #370 | shipped the first pool-parity slice: `Build pool session`and`Build open water session`now create separate manual entry paths, manual workouts open in environment-locked builder surfaces, runbook language was updated,`npm run verify:pre-pr`passed locally, required CI checks passed, and`npm run verify:pre-merge` passed locally before merge | next: continue the pool parity brief with field/wording parity and Garmin-specific repeat/rest semantics in a follow-up slice`
