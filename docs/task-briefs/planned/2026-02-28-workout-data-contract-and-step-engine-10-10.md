# Task Brief: Workout Data Contract And Step Engine (10/10)

## Metadata

- `id`: `2026-02-28-workout-data-contract-and-step-engine-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-16`

## Goal

Define a canonical, Garmin-compatible workout schema and deterministic step engine so all builder, AI, poolside, and export flows use the same trusted data contract.

## Scope

- Define canonical entities:
  - `drill`, `workout_template`, `workout`, `plan`, `plan_session`, `completed_session`.
- Define canonical `steps` JSON schema:
  - step types (`warmup`, `drill`, `main`, `cooldown`, `rest`, `repeat_block`),
  - distance/duration target,
  - stroke/equipment,
  - rest,
  - optional notes.
- Add invariant rules:
  - max step count,
  - repeat nesting constraints,
  - progression guardrails,
  - totals consistency.
- Add server-side validation (Zod + DB constraints) and deterministic normalization.

## Out Of Scope

- Visual builder UI.
- AI generation prompts.
- OAuth integrations.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - canonical drill/template/workout/plan/session/completion entities,
  - normalized `steps` payload,
  - schema version metadata and validation outcome.
- Local-only:
  - transient builder draft state before explicit save,
  - temporary import preview or validation-inspection UI state.
- Sync behavior:
  - every persisted write must validate and normalize server-side before commit,
  - post-write reads must return canonical normalized payload,
  - stale or invalid client payloads must fail deterministically with actionable repair guidance.
- Invalidation:
  - any canonical entity write invalidates dependent builder, planner, AI, and export reads that consume the normalized contract.

## Identity And Rename Contract

- Canonical stable IDs:
  - every persisted `drill`, `workout_template`, `workout`, `plan`, `plan_session`, and `completed_session` row gets an immutable canonical ID that is independent of display title, slug, week/day position, and sort order.
- Human-readable identifiers:
  - titles/slugs/labels are operator-facing and may be renameable where product UX needs it,
  - human-readable fields must never be the sole canonical key for progress, notes, exports, analytics, or plan references.
- Mutability rules:
  - canonical IDs are write-once,
  - reorder operations change ordering fields only,
  - title/slug edits must not mutate canonical IDs.
- Rename vs repurpose:
  - rename in place is allowed only when the underlying drill/template/workout/plan object is still semantically the same,
  - materially different content should create a new entity instead of overwriting an existing canonical ID.
- Compatibility contract:
  - import/AI/export flows must preserve canonical IDs for existing entities or create explicit new entities,
  - no production logic may infer canonical identity from editable labels or ordinal strings alone.
- Observability and repair:
  - unresolved legacy/foreign identifiers must fail deterministically and be surfaced in validation or import logs rather than silently coerced.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                           | Evidence                               |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Product goals and IA                          | `target`     | Canonical schema supports builder, planner, AI, and export use-cases without parallel identity models.     | schema contract + architecture notes   |
| UX flow clarity                               | `supporting` | Supporting only: this data-contract slice must make later builder/planner UX deterministic, not own UI.    | scope rationale + downstream contracts |
| Visual design quality                         | `supporting` | Supporting only: no direct UI delivered in this schema/engine slice.                                       | scope rationale                        |
| Business logic correctness and data integrity | `target`     | Invalid workouts rejected deterministically; no silent coercion or ambiguous normalized output.            | unit/integration invariants            |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin CRUD ergonomics belong to later drill/template workflows.                           | scope rationale                        |
| Accessibility (a11y)                          | `supporting` | Supporting only: no primary user-facing UI shipped in this schema slice.                                   | scope rationale                        |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: validation/normalization must avoid obvious API latency or payload bloat regressions.     | perf notes + integration timing        |
| Data placement and sync boundaries            | `target`     | All canonical workout data is server-owned with explicit local draft boundaries.                           | brief contract + API tests             |
| Caching and invalidation strategy             | `target`     | Post-write reads return canonical normalized payload with deterministic invalidation rules.                | integration tests + cache notes        |
| Reliability and failure handling              | `target`     | Validation/import failures are retry-safe and never leave ambiguous partial canonical state.               | negative-path tests + error contract   |
| Security and authz                            | `target`     | Unauthorized writes return `401/403`, inputs are validated, and malformed schema writes fail closed.       | negative-path API tests                |
| Privacy and compliance                        | `supporting` | Supporting only: workout schema must avoid storing unnecessary sensitive fields.                           | schema review + scope rationale        |
| Content governance                            | `target`     | Canonical entity ownership, revision semantics, and identity rules are explicit before implementation.     | schema docs + identity contract        |
| Admin workflow and editability                | `supporting` | Supporting only: admin edit flow depends on this contract but is delivered in later workflow slices.       | scope rationale                        |
| SEO and crawlability                          | `supporting` | Supporting only: this backend contract does not directly alter public crawlable pages.                     | scope rationale                        |
| AI discoverability                            | `supporting` | Supporting only: AI discoverability depends on later public surfaces, not this schema slice.               | scope rationale                        |
| Analytics and KPI observability               | `supporting` | Supporting only: schema must keep stable identifiers available for later telemetry.                        | event contract notes                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct commerce mutation ships here, but workout identity must stay compatible later.  | scope rationale                        |
| Incident response and support operations      | `supporting` | Supporting only: validation/import failures must produce operator-readable diagnostics for future support. | error contract + scope rationale       |
| Finance and reporting operations              | `supporting` | Supporting only: no finance ledger/reporting mutation in this schema-only slice.                           | scope rationale                        |
| i18n operational readiness                    | `supporting` | Supporting only: schema must not block future localized workout labels/metadata.                           | schema review + scope rationale        |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js/TypeScript/Supabase patterns; no unnecessary dependency added for schema validation.  | dependency diff + implementation notes |
| Testing and QA automation                     | `target`     | Schema/engine rules, negative paths, and normalization invariants are covered before merge.                | unit/integration matrix + verify       |
| Scalability and cost efficiency               | `supporting` | Supporting only: schema and engine rules prevent runaway step nesting or excessive write amplification.    | invariant review + scope rationale     |
| DevOps and rollback readiness                 | `target`     | Schema rollout includes migration safety notes, backward compatibility expectations, and rollback path.    | migration notes + release checklist    |

## Acceptance Criteria

- Canonical schema documented and implemented in TS + DB.
- Step payloads are validated and normalized before persistence.
- Totals (`meters`, step count, interval count) are deterministic.
- Invalid combinations return actionable validation errors.
- Canonical identity rules are documented for all persisted entities before implementation starts.
- Brief is scorecard-complete and lintable before implementation starts.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- targeted integration tests for API writes and negative paths
- `npm run verify:pre-pr`
