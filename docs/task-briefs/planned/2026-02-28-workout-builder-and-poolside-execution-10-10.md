# Task Brief: Workout Builder And Poolside Execution UX (10/10)

## Metadata

- `id`: `2026-02-28-workout-builder-and-poolside-execution-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Ship a Garmin-familiar builder and poolside execution experience that is fast, clear, and reliable on mobile.

## Scope

- Builder UI patterns:
  - step cards,
  - add step,
  - add repeat block,
  - reorder/remove,
  - section totals.
- Step editor:
  - duration type, distance, stroke, drill type, equipment, intensity target, notes.
- Poolside mode:
  - one primary action per screen (`Next`/`Done`),
  - large tap targets,
  - progress visibility,
  - clear completion confirmation.
- Autosave + undo/confirm patterns for destructive changes.

## Out Of Scope

- AI plan generation internals.
- Garmin API push.

## Platform 10/10 Scorecard Mapping

| Category                         | Class    | Target threshold                                                        | Evidence          |
| -------------------------------- | -------- | ----------------------------------------------------------------------- | ----------------- |
| UX flow clarity                  | `target` | Workout can be built from scratch in <= 2 minutes median.               | E2E + timed QA    |
| Visual design quality            | `target` | Builder and poolside layouts remain readable on phone, tablet, desktop. | matrix QA         |
| Accessibility (a11y)             | `target` | Keyboard/focus/labels complete for builder forms and actions.           | a11y tests        |
| Reliability and failure handling | `target` | Draft is recoverable after transient save failures.                     | integration + e2e |
| Performance (CWV + payloads)     | `target` | No blocking lag during step add/reorder/edit actions.                   | perf checks       |

## Acceptance Criteria

- Users can create, reorder, repeat, and save workouts without confusion.
- Poolside mode supports clean execution with minimal cognitive load.
- Save/cancel/dirty-state behavior is deterministic.
- Builder is Garmin-familiar in structure without brand cloning.

## Validation

- unit tests for builder state transitions
- e2e on mobile/tablet/desktop for full build->execute path
- `npm run verify:pre-pr`
