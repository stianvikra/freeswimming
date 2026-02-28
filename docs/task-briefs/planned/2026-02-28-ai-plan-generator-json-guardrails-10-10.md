# Task Brief: AI Plan Generator JSON Guardrails (10/10)

## Metadata

- `id`: `2026-02-28-ai-plan-generator-json-guardrails-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Generate editable swim plans via AI while keeping deterministic safety, schema correctness, and predictable quality.

## Scope

- Input contract:
  - user goal,
  - test values (CSS/1000m),
  - available time/sessions,
  - constraints.
- Output contract:
  - strict JSON schema only,
  - weeks -> sessions -> steps.
- Guardrails:
  - progression caps,
  - recovery rules,
  - step-count budget for export compatibility.
- Fallback UX when AI response is invalid/unavailable.

## Out Of Scope

- Fine-tuning custom model.
- Full coaching recommendation engine.

## Platform 10/10 Scorecard Mapping

| Category                                      | Class    | Target threshold                                      | Evidence          |
| --------------------------------------------- | -------- | ----------------------------------------------------- | ----------------- |
| Business logic correctness and data integrity | `target` | Invalid AI output never reaches canonical data store. | schema tests      |
| Reliability and failure handling              | `target` | Users always get actionable fallback on AI failure.   | e2e + integration |
| Security and authz                            | `target` | AI endpoints rate-limited and input-validated.        | API tests         |
| Testing and QA automation                     | `target` | Golden tests for representative prompt classes.       | CI                |

## Acceptance Criteria

- AI output always passes schema/invariant checks before save.
- Users can edit generated plan without data loss.
- Failures are explicit and recoverable.

## Validation

- golden JSON tests + schema tests
- integration for generate->validate->save
- `npm run verify:pre-pr`
