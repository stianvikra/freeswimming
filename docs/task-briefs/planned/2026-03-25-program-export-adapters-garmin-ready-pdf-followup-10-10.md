# Task Brief: Program Export Adapters Garmin-Ready + PDF Follow-up (10/10)

## Metadata

- `id`: `2026-03-25-program-export-adapters-garmin-ready-pdf-followup-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-25`
- `updated`: `2026-03-25`

## Goal

Build the remaining program-level export adapters so canonical programs can produce truthful Garmin-ready and printable outputs without mutating canonical program or workout identity.

## Dependencies And Boundaries

- Workout-level export foundation already shipped in:
  - `docs/task-briefs/done/2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10.md`
- Upstream canonical workout/entity contract:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
- Upstream program builder/calendar contract:
  - `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Blocked live Garmin provider delivery remains separate:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
- This follow-up owns:
  - canonical program -> `garmin-ready` intermediate bundle,
  - canonical program -> printable PDF/print flow,
  - deterministic program ordering/identity rules in export output.
- This follow-up does not own:
  - already-shipped workout-level exports except narrow shared-helper reuse,
  - live Garmin push or OAuth,
  - program builder authoring UX beyond export affordances,
  - training-history ingestion.

## Scope

- Export adapter layer:
  - canonical program -> `garmin-ready` intermediate format,
  - canonical program -> printable PDF model.
- Program export UX:
  - clear export entry point from the canonical program surface,
  - truthful status/source labeling,
  - poolside/coach-readable program output.
- Validation:
  - preserve deterministic program ordering and nested workout identity,
  - surface actionable diagnostics for unsupported program/export combinations,
  - reuse workout-level export contracts where possible instead of forking rules.

## Out Of Scope

- Manual workout/session/program building.
- AI generation of workout/session/program drafts.
- Reworking already-shipped workout-level Garmin-ready or PDF exports beyond shared fixes.
- Live Garmin push.
- OAuth token handling.
- Garmin Activity API completion/history ingestion.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - canonical program payload remains owned by the program/data-contract slices,
  - export job/output metadata is server-canonical only if persisted later.
- Local-only:
  - transient export UI state,
  - selected output mode,
  - local preview/download state before final export completion.
- Sync behavior:
  - program exports are read-only transforms from canonical program input,
  - export must never mutate canonical program/workout identity or ordering as a side effect,
  - retry behavior must be deterministic and must not duplicate canonical writes.
- Invalidation:
  - canonical program changes invalidate downstream export previews and cached adapter output.

## Identity And Rename Contract

- Canonical stable IDs:
  - adapter input must resolve programs and nested workouts/steps by canonical IDs from the upstream slices.
- Human-readable identifiers:
  - exported program/workout labels may be presentation-friendly, but adapter correctness must not depend on mutable titles or sort labels.
- Mutability rules:
  - export flows are read-only against canonical entities; no export action may rewrite canonical IDs.
- Rename vs repurpose:
  - if source program/workout naming changes, exports should reflect new presentation text while preserving canonical entity linkage.
- Compatibility contract:
  - future Garmin-ready/export formats may carry external identifiers, but those must never replace FreeSwimming canonical IDs as source-of-truth.
- Observability and repair:
  - unsupported mappings and unresolved source IDs must fail with actionable diagnostics rather than silently coercing output.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                             | Evidence                             |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Program export choices and output models stay aligned with the canonical program model and future Garmin-ready direction.    | adapter contract + UX notes          |
| UX flow clarity                               | `target`     | User can export a canonical program in <= 30 seconds with clear status, ordering, and actionable failure guidance.           | e2e/manual QA                        |
| Visual design quality                         | `supporting` | Supporting only: program PDF/export presentation should feel consistent with the shipped workout-level export surfaces.      | PDF QA + scope rationale             |
| Business logic correctness and data integrity | `target`     | Program export output is deterministic for the same canonical input and never mutates source program/workout identity/state. | contract tests                       |
| Admin editor ergonomics                       | `supporting` | Supporting only: no primary admin editing workflow is introduced in this program-export slice.                               | scope rationale                      |
| Accessibility (a11y)                          | `supporting` | Supporting only: export controls and status messaging must remain accessible on changed UI surfaces.                         | scope rationale + QA                 |
| Performance (CWV + payloads)                  | `supporting` | Program export action stays responsive and non-blocking with no obvious route regression.                                    | perf checks                          |
| Data placement and sync boundaries            | `target`     | Program export is explicitly read-only against canonical program state, with output metadata ownership documented.           | data contract + integration tests    |
| Caching and invalidation strategy             | `supporting` | Supporting only: canonical program changes invalidate stale export previews deterministically.                               | cache notes + scope rationale        |
| Reliability and failure handling              | `target`     | Unsupported or failed program exports surface retry/recover guidance without corrupting canonical data.                      | negative-path tests + e2e            |
| Security and authz                            | `supporting` | Supporting only: protected export endpoints/downloads must remain authenticated and fail closed where required.              | auth review + scope rationale        |
| Privacy and compliance                        | `supporting` | Supporting only: exported content must not leak unrelated sensitive account data.                                            | payload review + scope rationale     |
| Content governance                            | `supporting` | Supporting only: canonical program governance belongs upstream, but export must honor it.                                    | linked brief + scope rationale       |
| Admin workflow and editability                | `supporting` | Supporting only: no primary admin workflow change beyond possible later export diagnostics.                                  | scope rationale                      |
| SEO and crawlability                          | `supporting` | Supporting only: export output is not a primary public crawl surface in this slice.                                          | scope rationale                      |
| AI discoverability                            | `supporting` | Supporting only: adapter outputs are not the primary AI-discoverability mechanism.                                           | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: export usage/failure events should remain available with stable canonical references.                       | event notes + scope rationale        |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct commerce mutation, though export value proposition may support future offers.                     | scope rationale                      |
| Incident response and support operations      | `supporting` | Supporting only: export failures need operator-readable diagnostics and support guidance.                                    | runbook note + scope rationale       |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation in this export-only slice.                                                    | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: exported labels/copy should remain locale-extensible later.                                                 | copy review + scope rationale        |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: prefer stack-native export patterns before adding heavy adapter dependencies.                               | dependency review                    |
| Testing and QA automation                     | `target`     | Program adapter contract tests and key export-flow coverage pass before merge.                                               | tests + verify outputs               |
| Scalability and cost efficiency               | `supporting` | Supporting only: export generation should avoid obvious cost spikes for repeated/download-heavy usage.                       | perf/cost notes + scope rationale    |
| DevOps and rollback readiness                 | `target`     | Program export changes stay isolated from canonical schema writes and remain easy to disable or roll back.                   | code/test review + release checklist |

## Acceptance Criteria

- Program export renders consistently and readably in printable form.
- Program export preserves deterministic nested workout ordering and canonical identity.
- Garmin-ready program export produces truthful mapped payload structure for future Training API submission.
- Unsupported program/export combinations fail with actionable errors instead of silent coercion.
- Workout-level exports remain intact after program-export changes.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- program export adapter contract tests
- program PDF rendering checks (where stable)
- targeted builder/program export e2e coverage
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Help/Guide And Operator Training Contract

- `N/A` for this follow-up unless the eventual program export UI introduces a new non-self-explanatory operator/admin workflow outside the existing user-side program surfaces.

## Checkpoint Log

- `2026-03-25 | planning | created residual follow-up after workout-level Garmin-ready JSON export merged as \`2c4fcd8\` and workout PDF print export merged as \`e938560\`; remaining open scope is canonical program-level export structure and printable output, while live Garmin partner delivery remains separately blocked | next: implement program export adapters from updated \`main\` without reopening the shipped workout-level export slice`
