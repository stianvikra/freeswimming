# Task Brief: Workout Export Adapters Garmin-Ready + PDF (10/10)

## Metadata

- `id`: `2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-22`

## Goal

Build export adapters so canonical workouts/programs are usable immediately (PDF/poolside) and technically ready for Garmin Training API publish mapping later.

## Dependencies And Boundaries

- Upstream canonical workout/entity contract:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
- Upstream manual authoring flow:
  - `docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- Upstream AI-authored draft flow:
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- Export should consume canonical workouts after they exist, regardless of whether they were authored manually or accepted from AI-generated drafts.
- This brief is not responsible for:
  - manual builder UX,
  - AI generation behavior,
  - or live Garmin API delivery.

## Scope

- Export adapter layer:
  - canonical workout/program -> `garmin-ready` intermediate format,
  - canonical workout/program -> printable PDF model.
- PDF export UX:
  - clear, professional layout,
  - poolside legibility,
  - QR-ready if needed later.
- Validation:
  - enforce Garmin-compatible bounds in adapter,
  - preserve or explicitly reject Garmin-documented `WorkoutIntensity`, `time`, `distance`, `open`, `swim_stroke`, and lap/open-water sub-sport semantics, plus observed Garmin Connect UI swim concepts like `Main`, lap-button, fixed-rest, send-off, CSS-based pacing, `Choice`, and `RIMO` workflows, with actionable diagnostics,
  - enforce threshold-based swim-zone target mapping or explicit rejection when unsupported.

## Out Of Scope

- Manual workout/session/program building.
- AI generation of workout/session/program drafts.
- Live Garmin push.
- OAuth token handling.
- Garmin Activity API completion/history ingestion.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - canonical workout payload remains owned by the workout data-contract slice,
  - adapter configuration and export job/output metadata are server-canonical if persisted.
- Local-only:
  - transient export UI state, selected format, and local preview/download state before final export completion.
- Sync behavior:
  - adapters are read-only transforms from canonical workout input,
  - exports must never mutate canonical workout identity/state as a side effect,
  - export retry behavior must be deterministic and not duplicate canonical writes.
- Invalidation:
  - canonical workout changes invalidate downstream export previews and cached adapter output.

## Identity And Rename Contract

- Canonical stable IDs:
  - adapter input must resolve workouts/steps by canonical IDs from the data-contract slice.
- Human-readable identifiers:
  - exported labels/titles may be presentation-friendly, but adapter correctness must not depend on mutable titles or sort labels.
- Mutability rules:
  - export flows are read-only against canonical entities; no export action may rewrite canonical IDs.
- Rename vs repurpose:
  - if source workout naming changes, exports should reflect new presentation text while preserving canonical entity linkage.
- Compatibility contract:
  - future Garmin-ready/export formats may carry external identifiers, but those must never replace FreeSwimming canonical IDs as source-of-truth.
- Observability and repair:
  - unsupported mappings and unresolved source IDs must fail with actionable diagnostics rather than silently coercing output.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                  | Evidence                             |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Export choices and output models stay aligned with the canonical workout model and future Garmin-ready direction. | adapter contract + UX notes          |
| UX flow clarity                               | `target`     | User can export a workout in <= 20 seconds with clear status and actionable failure guidance.                     | e2e/manual QA                        |
| Visual design quality                         | `supporting` | Supporting only: PDF layout quality is important, but broader builder/page visual system is owned elsewhere.      | PDF QA + scope rationale             |
| Business logic correctness and data integrity | `target`     | Adapter output is deterministic for the same canonical input and never mutates source workout identity/state.     | contract tests                       |
| Admin editor ergonomics                       | `supporting` | Supporting only: no primary admin editing workflow is introduced in this export slice.                            | scope rationale                      |
| Accessibility (a11y)                          | `supporting` | Supporting only: export controls and status messaging must remain accessible on changed UI surfaces.              | scope rationale + QA                 |
| Performance (CWV + payloads)                  | `supporting` | Export action stays responsive and non-blocking with no obvious route regression.                                 | perf checks                          |
| Data placement and sync boundaries            | `target`     | Export is explicitly read-only against canonical workout state, with output metadata ownership documented.        | data contract + integration tests    |
| Caching and invalidation strategy             | `supporting` | Supporting only: canonical workout changes invalidate stale export previews deterministically.                    | cache notes + scope rationale        |
| Reliability and failure handling              | `target`     | Unsupported or failed exports surface retry/recover guidance without corrupting canonical data.                   | negative-path tests + e2e            |
| Security and authz                            | `supporting` | Supporting only: protected export endpoints/downloads must remain authenticated and fail closed where required.   | auth review + scope rationale        |
| Privacy and compliance                        | `supporting` | Supporting only: exported content must not leak unrelated sensitive account data.                                 | payload review + scope rationale     |
| Content governance                            | `supporting` | Supporting only: canonical workout governance belongs upstream, but export must honor it.                         | linked brief + scope rationale       |
| Admin workflow and editability                | `supporting` | Supporting only: no primary admin workflow change beyond possible later export diagnostics.                       | scope rationale                      |
| SEO and crawlability                          | `supporting` | Supporting only: export output is not a primary public crawl surface in this slice.                               | scope rationale                      |
| AI discoverability                            | `supporting` | Supporting only: adapter outputs are not the primary AI-discoverability mechanism.                                | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: export usage/failure events should remain available with stable canonical references.            | event notes + scope rationale        |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct commerce mutation, though export value proposition may support future offers.          | scope rationale                      |
| Incident response and support operations      | `supporting` | Supporting only: export failures need operator-readable diagnostics and support guidance.                         | runbook note + scope rationale       |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation in this export-only slice.                                         | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: exported labels/copy should remain locale-extensible later.                                      | copy review + scope rationale        |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: prefer stack-native PDF/export patterns before adding heavy adapter dependencies.                | dependency review                    |
| Testing and QA automation                     | `target`     | Adapter contract tests and key export-flow coverage pass before merge.                                            | tests + verify outputs               |
| Scalability and cost efficiency               | `supporting` | Supporting only: export generation should avoid obvious cost spikes for repeated/download-heavy usage.            | perf/cost notes + scope rationale    |
| DevOps and rollback readiness                 | `target`     | Adapter changes are isolated from canonical schema writes and are easy to disable/roll back.                      | code/test review + release checklist |

## Acceptance Criteria

- PDF export renders consistently and readable on phone print view.
- Garmin-ready adapter produces valid mapped workout/program payloads for future Training API submission.
- Garmin-ready adapter preserves or explicitly rejects unsupported Garmin-documented `WorkoutIntensity`, `open`, `swim_stroke`, and lap/open-water sub-sport semantics and Garmin Connect UI swim concepts like `Main`, lap-button, fixed-rest, send-off, CSS-based pacing, `Choice`, `RIMO`, and rest/repeat workflows with actionable errors instead of silent coercion.
- Threshold-based swim-zone targets either map deterministically into export output or fail with actionable errors.
- Adapter rejects unsupported step combos with actionable errors.
- Adapter/output identity stays derived from canonical workout IDs, not mutable labels.
- Export works from canonical workouts regardless of whether the source draft was created manually or originated from an accepted AI-generated draft.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- adapter contract tests
- pdf rendering snapshot tests (where stable)
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-19 | planning | clarified that export is downstream of canonical workouts from either manual builder or accepted AI-generated drafts, while live Garmin push remains a separate later slice | next: keep export adapter rules aligned with the canonical workout contract and future Garmin partner mapping`
- `2026-03-20 | planning | expanded export scope to cover Garmin-ready workout/program mapping and threshold-based zone target handling, while keeping live send and activity-history ingestion outside this adapter brief | next: align later export adapters with the exact Training API publish model once partner docs and supported step matrix are finalized`
- `2026-03-22 | planning | tightened adapter expectations around observed Garmin swim-builder behavior so later export must handle or explicitly reject Garmin-documented `WorkoutIntensity`, `open`, `swim_stroke`, and lap/open-water sub-sport semantics plus Garmin Connect UI concepts like `Main`, lap-button, fixed-rest, send-off, CSS-based pacing, `Choice`, `RIMO`, and explicit rest/repeat swim sets rather than flattening them silently | next: keep adapter tests and blocked Garmin mapping matrix tied to these concrete swim-workout semantics`
