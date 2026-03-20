# Task Brief: AI Plan Generator JSON Guardrails (10/10)

## Metadata

- `id`: `2026-02-28-ai-plan-generator-json-guardrails-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-20`

## Goal

Generate AI-authored swim session/program drafts that help users reach goals while keeping deterministic safety, schema correctness, Garmin-ready step structure, and predictable quality.

## Dependencies And Boundaries

- Upstream bridge slice for user-reviewed generator input:
  - `docs/task-briefs/done/2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10.md`
- Upstream canonical workout/entity contract:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
- This brief should consume a deterministic generator-intake handoff payload rather than querying raw My Library source entities ad hoc.
- This brief owns AI generation behavior, not manual workout/session/program building.
- This brief is not responsible for:
  - defining My Library prefill UX,
  - editing athlete profile/goals/preferences/personal records,
  - manual builder ergonomics for user-authored sessions/programs,
  - or deciding which saved user context should be included for a specific generation run.

## Scope

- Input contract:
  - canonical generator-intake handoff payload,
  - selected goal/focus/profile/metric/preference context from intake,
  - available time/sessions,
  - per-run constraints.
- Output contract:
  - strict JSON schema only,
  - weeks -> sessions -> steps,
  - Garmin-compatible duration/target/repeat semantics,
  - threshold-based swim-zone or pace targets when threshold context is available.
- Guardrails:
  - progression caps,
  - recovery rules,
  - step-count budget for export compatibility,
  - no unsupported ad hoc zone system outside the canonical threshold-based method.
- Fallback UX when AI response is invalid/unavailable.

## Out Of Scope

- Fine-tuning custom model.
- Full coaching recommendation engine.
- Retrospective AI evaluation of completed history entries after execution.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - validated generated plans/sessions/steps that are explicitly accepted for persistence,
  - schema version, validation outcome, and any canonical entity references used during save.
- Local-only:
  - accepted generator-intake handoff for the current run,
  - prompt draft input derived from that handoff,
  - transient preview of generated output,
  - temporary user edits before save/confirm.
- Sync behavior:
  - AI output remains provisional until schema/invariant validation and explicit save succeed,
  - invalid or stale generated output must never be treated as canonical,
  - regeneration must not silently overwrite an accepted canonical plan without explicit user workflow.
- Invalidation:
  - accepting/regenerating/deleting a generated plan invalidates dependent planner/builder/export reads for the affected plan.

## Identity And Rename Contract

- Canonical stable IDs:
  - AI-generated plans/sessions/steps must either create new canonical IDs explicitly or map to existing canonical IDs via validated references; the model must never invent implicit identity from titles or week labels alone.
- Human-readable identifiers:
  - generated titles/labels are editable presentation fields and must not be treated as canonical keys during later edits/saves.
- Mutability rules:
  - post-generation edits may change titles/copy without rewriting canonical IDs for already-persisted entities.
- Rename vs repurpose:
  - regenerating or materially replacing a plan/session should create a new entity/version unless the workflow explicitly confirms in-place overwrite against the same canonical object.
- Compatibility contract:
  - generate -> validate -> save flows must reject unresolved references deterministically; no silent rebinding of AI output onto the wrong existing entity.
- Observability and repair:
  - unresolved IDs, dropped references, and schema-driven rewrites must be logged/measured so operator support can see when AI output was corrected or rejected.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                     | Evidence                              |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | AI plan generation fits a clear generate -> inspect -> edit -> accept workflow with no ambiguity about save.         | UX contract + flow diagrams           |
| UX flow clarity                               | `target`     | Users always understand whether output is draft, invalid, accepted, or needs retry.                                  | e2e + manual QA                       |
| Visual design quality                         | `supporting` | Supporting only: visual presentation of generated output is owned by later builder/planner UI slices.                | scope rationale                       |
| Business logic correctness and data integrity | `target`     | Invalid AI output never reaches canonical data store and accepted plans preserve canonical identity rules.           | schema tests + save invariants        |
| Admin editor ergonomics                       | `supporting` | Supporting only: no direct admin editing workflow is introduced in this slice.                                       | scope rationale                       |
| Accessibility (a11y)                          | `supporting` | Supporting only: user-facing review UI belongs to downstream workflow slices, but error states must stay accessible. | scope rationale + downstream contract |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: generation latency and preview payloads must not obviously degrade core builder flows.              | perf notes + scope rationale          |
| Data placement and sync boundaries            | `target`     | Generated output remains local/provisional until validated save; server-canonical ownership is explicit.             | data contract + integration tests     |
| Caching and invalidation strategy             | `supporting` | Supporting only: accepted/regenerated output must define deterministic invalidation of stale preview state.          | flow contract + scope rationale       |
| Reliability and failure handling              | `target`     | Users always get actionable fallback on AI failure and no dead-end invalid-output state.                             | e2e + integration                     |
| Security and authz                            | `target`     | AI endpoints are input-validated, rate-limited where needed, and protected save paths fail closed.                   | API tests                             |
| Privacy and compliance                        | `supporting` | Supporting only: prompts and telemetry must avoid unnecessary sensitive data leakage.                                | payload review + scope rationale      |
| Content governance                            | `supporting` | Supporting only: canonical plan/workout governance is defined by data-contract and program-builder slices.           | linked brief + scope rationale        |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow is directly changed in this AI guardrail slice.                                   | scope rationale                       |
| SEO and crawlability                          | `supporting` | Supporting only: generated plans are not primary public crawl surfaces in this slice.                                | scope rationale                       |
| AI discoverability                            | `supporting` | Supporting only: this slice governs AI generation safety, not public AI-discoverable content surfaces.               | scope rationale                       |
| Analytics and KPI observability               | `supporting` | Supporting only: generation success/failure/acceptance events must stay available with safe payloads.                | event contract notes                  |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct commerce mutation ships in this AI generation guardrail slice.                            | scope rationale                       |
| Incident response and support operations      | `supporting` | Supporting only: rejected/rewritten AI output must leave support-visible diagnostics and operator guidance.          | error contract + scope rationale      |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation in this AI-only slice.                                                | scope rationale                       |
| i18n operational readiness                    | `supporting` | Supporting only: generated labels and validation copy must remain locale-extensible later.                           | copy/schema review + scope rationale  |
| Stack-fit and dependency discipline           | `target`     | Use existing schema-validation and app stack patterns; avoid unnecessary AI orchestration dependencies.              | dependency diff + code review         |
| Testing and QA automation                     | `target`     | Golden tests, schema tests, and generate->validate->save integration coverage pass before merge.                     | CI + verify outputs                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: generation flow should avoid obvious runaway retries or oversized prompt/output churn.              | scope rationale + usage notes         |
| DevOps and rollback readiness                 | `target`     | AI generation can be disabled or rolled back without corrupting canonical saved plans.                               | rollout notes + release checklist     |

## Acceptance Criteria

- AI output always passes schema/invariant checks before save.
- AI generation consumes canonical generator-intake handoff payloads without re-guessing raw My Library context or mutable labels.
- AI goal-based generation remains a distinct flow from manual workout/session/program building.
- Generated sessions/programs use the canonical Garmin-compatible step model and do not invent incompatible repeat/target structures.
- When threshold context is available, generated intensity targets use the shared threshold-based swim-zone/pace model rather than a parallel AI-only zone scheme.
- Users can edit generated plan without data loss.
- Failures are explicit and recoverable.
- AI output never mutates canonical entity identity implicitly through renamed labels or reordered weeks/sessions.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- golden JSON tests + schema tests
- integration for generate->validate->save
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-19 | planning | clarified that this brief owns AI-authored session/program draft generation from generator-intake handoff, while manual workout/program building remains separate and downstream editing/review can happen after generation | next: request owner detail later on first generator scope, goal model, and generated-draft review/edit expectations before implementation starts`
- `2026-03-20 | planning | aligned AI generation requirements to the canonical Garmin-style step model and shared threshold-based swim-zone method, and kept retrospective completed-session analysis explicitly out of this generation brief | next: request owner detail later on whether the first AI slice should generate one session, one week, or a longer program`
