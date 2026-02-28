# Task Brief: Workout Data Contract And Step Engine (10/10)

## Metadata

- `id`: `2026-02-28-workout-data-contract-and-step-engine-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

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

## Platform 10/10 Scorecard Mapping

| Category                                      | Class    | Target threshold                                                 | Evidence               |
| --------------------------------------------- | -------- | ---------------------------------------------------------------- | ---------------------- |
| Business logic correctness and data integrity | `target` | Invalid workouts rejected deterministically; no silent coercion. | Unit/integration tests |
| Data placement and sync boundaries            | `target` | All canonical workout data server-owned.                         | API contract tests     |
| Caching and invalidation strategy             | `target` | Post-write reads return canonical normalized payload.            | Integration tests      |
| Security and authz                            | `target` | Unauthorized writes return `401/403` not `500`.                  | Negative-path tests    |
| Testing and QA automation                     | `target` | Schema/engine rules fully covered.                               | CI                     |

## Acceptance Criteria

- Canonical schema documented and implemented in TS + DB.
- Step payloads are validated and normalized before persistence.
- Totals (`meters`, step count, interval count) are deterministic.
- Invalid combinations return actionable validation errors.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- targeted integration tests for API writes and negative paths
- `npm run verify:pre-pr`
