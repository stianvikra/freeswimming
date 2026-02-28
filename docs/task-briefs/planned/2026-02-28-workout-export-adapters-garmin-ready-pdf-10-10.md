# Task Brief: Workout Export Adapters Garmin-Ready + PDF (10/10)

## Metadata

- `id`: `2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Build export adapters so workouts are usable immediately (PDF/poolside) and technically ready for Garmin Training API mapping later.

## Scope

- Export adapter layer:
  - canonical workout -> `garmin-ready` intermediate format,
  - canonical workout -> printable PDF model.
- PDF export UX:
  - clear, professional layout,
  - poolside legibility,
  - QR-ready if needed later.
- Validation:
  - enforce Garmin-compatible bounds in adapter.

## Out Of Scope

- Live Garmin push.
- OAuth token handling.

## Platform 10/10 Scorecard Mapping

| Category                                      | Class        | Target threshold                                       | Evidence         |
| --------------------------------------------- | ------------ | ------------------------------------------------------ | ---------------- |
| UX flow clarity                               | `target`     | User can export a workout in <= 20 seconds.            | e2e/manual QA    |
| Business logic correctness and data integrity | `target`     | Adapter output deterministic for same canonical input. | contract tests   |
| Performance (CWV + payloads)                  | `supporting` | Export action stays responsive and non-blocking.       | perf checks      |
| DevOps and rollback readiness                 | `target`     | Adapter changes isolated from canonical schema writes. | code/test review |

## Acceptance Criteria

- PDF export renders consistently and readable on phone print view.
- Garmin-ready adapter produces valid mapped payload for future API submission.
- Adapter rejects unsupported step combos with actionable errors.

## Validation

- adapter contract tests
- pdf rendering snapshot tests (where stable)
- `npm run verify:pre-pr`
