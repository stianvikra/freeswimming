# Task Brief: Workout Builder And Poolside Execution UX (10/10)

## Metadata

- `id`: `2026-02-28-workout-builder-and-poolside-execution-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-20`

## Goal

Ship a Garmin-familiar manual session builder and poolside execution experience that is fast, clear, reliable on mobile, and aligned to the canonical Garmin-ready workout contract.

## Scope

- Manual workout/session authoring for user-built training sessions.
- Builder UI patterns:
  - step cards,
  - add step,
  - add repeat block,
  - reorder/remove,
  - section totals.
- Garmin-familiar structured step authoring:
  - duration + target pairing,
  - repeat/interval block editing,
  - rest editing,
  - compatibility hints where a step shape cannot map cleanly downstream.
- Step editor:
  - duration type,
  - distance,
  - stroke,
  - drill type,
  - equipment,
  - intensity target,
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
- Users can author Garmin-familiar target/duration/repeat structures without learning a hidden export model later.
- Threshold-based swim zone targets, when shown, use the shared published method rather than a separate builder-only zone system.
- Poolside mode supports clean execution with minimal cognitive load.
- Save/cancel/dirty-state behavior is deterministic.
- Builder is Garmin-familiar in structure without brand cloning.
- Reorder and autosave flows do not corrupt canonical item identity.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- unit tests for builder state transitions
- e2e on mobile/tablet/desktop for full build->execute path
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-19 | planning | clarified that this brief owns manual workout/session building and poolside execution only; AI generation and weekly program authoring remain separate briefs | next: request owner detail later on exact manual-builder ergonomics, save model, and Garmin-export handoff expectations before implementation starts`
- `2026-03-20 | planning | tightened this brief into the explicit manual session builder track, added Garmin-familiar target/duration/repeat authoring requirements, and aligned swim-intensity editing to the shared threshold-based zone method | next: request owner detail later on exact builder editing ergonomics and how much compatibility guidance should be visible before export/send exists`
