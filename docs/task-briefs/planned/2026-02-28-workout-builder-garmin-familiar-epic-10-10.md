# Task Brief: Workout Builder Garmin-Familiar Epic (10/10)

## Metadata

- `id`: `2026-02-28-workout-builder-garmin-familiar-epic-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

Deliver a Garmin-familiar workout-builder experience in FreeSwimming that is easy to use for swimmers, commercially useful, and technically compatible with future Garmin Training API export.

## Product Positioning And UX Direction

- Use **Garmin-familiar interaction patterns** (steps, repeats, distance/rest, pool size, notes).
- Do **not** clone Garmin branding/look 1:1. Keep FreeSwimming visual identity.
- Optimize for:
  - quick workout creation,
  - poolside execution,
  - future export compatibility,
  - upsell paths (coaching/products) without harming lesson UX.

## Scope Orchestration

This epic is split into dedicated briefs for delivery quality and rollback safety:

1. `2026-02-28-workout-data-contract-and-step-engine-10-10.md`
2. `2026-02-28-drill-library-templates-and-favorites-10-10.md`
3. `2026-02-28-workout-builder-and-poolside-execution-10-10.md`
4. `2026-02-28-program-builder-calendar-completion-10-10.md`
5. `2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
6. `2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10.md`
7. `2026-02-28-workout-commercial-analytics-funnel-10-10.md`
8. `2026-02-28-garmin-training-api-partner-integration-10-10.md` (`blocked` until partner/API readiness)

## Out Of Scope (Current)

- Full Strava integration (explicitly deferred for now).
- Garmin Health detailed biometrics ingestion.
- Multi-tenant coach/club architecture.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Class        | Target threshold                                                                       | Evidence                       |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------- | ------------------------------ |
| UX flow clarity                               | `target`     | Create runnable workout in <= 2 minutes median.                                        | E2E + timed manual QA          |
| Visual design quality                         | `target`     | Garmin-familiar interaction with FreeSwimming brand consistency across mobile/desktop. | Design QA matrix               |
| Business logic correctness and data integrity | `target`     | Deterministic step math/progression rules and schema validation on all writes.         | Unit + integration tests       |
| Admin workflow and editability                | `target`     | Admin can manage drill/template data without code edits.                               | Admin E2E                      |
| Security and authz                            | `target`     | All write paths role-gated and fail closed.                                            | Negative-path API tests        |
| Performance (CWV + payloads)                  | `target`     | No material regressions on `/course`, builder routes, and admin workflows.             | verify + budget checks         |
| Analytics and KPI observability               | `target`     | Funnel and completion metrics emitted deterministically.                               | event tests + dashboard checks |
| Testing and QA automation                     | `target`     | Each slice ships with unit + targeted e2e coverage.                                    | CI                             |
| Commerce and revenue ops                      | `supporting` | Upsell/support actions configurable and trackable.                                     | QA + analytics review          |

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - drills, templates, workouts, plans, completion logs, export job state.
- Local-only:
  - transient editor state, temporary unsaved drafts.
- Sync policy:
  - explicit save/autosave with server acknowledgement,
  - deterministic refresh after mutation,
  - conflict handling: server wins + explicit re-edit flow.

## Milestones

1. Data contract + drill/template foundation.
2. Builder + poolside experience.
3. Program planner + AI generation.
4. Export adapters (Garmin-ready format + PDF).
5. Commercial analytics and conversion hooks.
6. Garmin partner integration when unblocked.

## Success KPIs

- median time to first complete workout <= 2 minutes.
- template/favorite reuse >= 70% of active builder users after stabilization.
- measurable conversion lift on support/coaching CTA placement.

## Validation Gate

- per implementation slice: `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Completion Criteria For Epic

- All planned slice briefs merged (or explicitly deferred with owner/date).
- Blocked Garmin brief either unblocked and started or recorded with concrete unblock prerequisites.
