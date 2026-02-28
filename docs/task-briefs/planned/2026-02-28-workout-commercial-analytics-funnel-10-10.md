# Task Brief: Workout Commercial + Analytics Funnel (10/10)

## Metadata

- `id`: `2026-02-28-workout-commercial-analytics-funnel-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Define and implement the workout-builder growth funnel so UX, conversion, and observability support revenue without hurting user trust.

## Scope

- Funnel events:
  - start builder,
  - template used,
  - plan generated,
  - first completion,
  - upsell interaction.
- Placement rules for support/commercial cards.
- CTA policy by lesson stage (avoid over-selling early intro stages).
- Dashboard metrics for product decisions.

## Out Of Scope

- Payment provider architecture changes.
- New billing models.

## Platform 10/10 Scorecard Mapping

| Category                        | Class    | Target threshold                                              | Evidence                |
| ------------------------------- | -------- | ------------------------------------------------------------- | ----------------------- |
| Analytics and KPI observability | `target` | Full builder funnel trackable end-to-end with no PII leakage. | event tests + dashboard |
| UX flow clarity                 | `target` | Commercial prompts are contextual and non-disruptive.         | UX QA                   |
| Commerce and revenue ops        | `target` | Measurable conversion points defined and instrumented.        | KPI review              |
| Privacy and compliance          | `target` | Event payloads redact personal/sensitive fields.              | tests + review          |

## Acceptance Criteria

- Funnel event taxonomy documented and implemented.
- Support/commercial placements can be configured by lesson/program context.
- KPI panel/reporting enables weekly product decision loop.

## Validation

- telemetry unit tests
- targeted e2e for event emission on key funnels
- `npm run verify:pre-pr`
