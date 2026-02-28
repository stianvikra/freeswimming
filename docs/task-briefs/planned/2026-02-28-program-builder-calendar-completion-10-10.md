# Task Brief: Program Builder Calendar And Completion Tracking (10/10)

## Metadata

- `id`: `2026-02-28-program-builder-calendar-completion-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Enable users to convert workouts into clear weekly programs with deterministic completion tracking and review.

## Scope

- Weekly calendar/program builder:
  - assign workouts to days,
  - simple progression controls,
  - rest day support.
- Completion logging:
  - manual `done`,
  - notes on completed sessions,
  - completion source metadata.
- Program summary:
  - weekly meters,
  - intensity distribution,
  - consistency indicators.

## Out Of Scope

- External activity imports.
- Garmin partner sync.

## Platform 10/10 Scorecard Mapping

| Category                                      | Class    | Target threshold                                             | Evidence            |
| --------------------------------------------- | -------- | ------------------------------------------------------------ | ------------------- |
| UX flow clarity                               | `target` | Users can schedule 1-week plan in <= 3 minutes.              | E2E + manual timing |
| Business logic correctness and data integrity | `target` | Completion and schedule state remain consistent under edits. | unit/integration    |
| Analytics and KPI observability               | `target` | Completion and adherence events emitted with safe payloads.  | event tests         |
| Reliability and failure handling              | `target` | No orphan/duplicate completion records on retries.           | integration tests   |

## Acceptance Criteria

- Users can build and edit weekly programs quickly.
- Completion status is reliable and audit-friendly.
- Program metrics align with canonical workout data.

## Validation

- targeted unit/integration tests for schedule + completion state
- e2e for schedule/edit/complete flow
- `npm run verify:pre-pr`
