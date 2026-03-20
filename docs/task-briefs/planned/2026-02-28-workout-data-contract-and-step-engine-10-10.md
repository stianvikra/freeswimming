# Task Brief: Workout Data Contract And Step Engine (10/10)

## Metadata

- `id`: `2026-02-28-workout-data-contract-and-step-engine-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-20`

## Goal

Define a canonical, Garmin-compatible workout schema and deterministic step engine so manual builders, AI generators, poolside execution, export, and later Garmin delivery all use the same trusted data contract.

## Garmin And Swim-Zone Alignment

- Canonical steps must map cleanly to Garmin-familiar structured workout concepts:
  - duration,
  - target,
  - rest,
  - repeat/interval grouping.
- Swim intensity targeting must support threshold-based swim zones derived from supported threshold tests, not ad hoc zone naming invented per feature.
- The contract should normalize threshold inputs from either:
  - `1000m test`,
  - `CSS 400m + 200m`.
- Product wording should describe these as `threshold-based swim zones`, not as universal or official swim-zone truth.

## Scope

- Define canonical entities:
  - `drill`, `workout_template`, `workout`, `plan`, `plan_session`, `training_history_entry`.
- Define canonical plan metadata:
  - `planning_horizon` enum:
    - `session`,
    - `week`,
    - `month`,
    - `six_months`,
    - `to_competition_date`,
  - optional competition intent metadata:
    - `competition_date`,
    - optional competition label,
    - explicit `peak_for_competition` boolean or equivalent structured intent field.
- Define canonical `steps` JSON schema:
  - step types (`warmup`, `drill`, `main`, `cooldown`, `rest`, `repeat_block`),
  - duration and distance target,
  - target mode (`open`, `threshold_zone`, `pace_range`, `rpe`, `rest`),
  - stroke/equipment,
  - rest,
  - optional notes.
- Define Garmin-compatible structured-step semantics:
  - single step,
  - repeat/interval block,
  - target + duration pairing,
  - deterministic totals.
- Define threshold-based swim-zone support:
  - normalized `threshold_sec_per_100`,
  - supported threshold source metadata,
  - deterministic zone-band projection rules for workout targeting and export mapping.
- Add invariant rules:
  - max step count,
  - repeat nesting constraints,
  - progression guardrails,
  - totals consistency,
  - Garmin-ready mapping constraints for unsupported target/duration combinations.
- Add server-side validation (Zod + DB constraints) and deterministic normalization.

## Out Of Scope

- Visual builder UI.
- AI generation prompts.
- OAuth integrations.
- Garmin Training API partner auth/send workflow.
- Garmin Activity API completion reconciliation and history review UX.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - canonical drill/template/workout/plan/session/history entities,
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
  - any canonical entity write invalidates dependent builder, planner, AI, export, and history reads that consume the normalized contract.

## Identity And Rename Contract

- Canonical stable IDs:
  - every persisted `drill`, `workout_template`, `workout`, `plan`, `plan_session`, and `training_history_entry` row gets an immutable canonical ID that is independent of display title, slug, week/day position, and sort order.
- Human-readable identifiers:
  - titles/slugs/labels are operator-facing and may be renameable where product UX needs it,
  - human-readable fields must never be the sole canonical key for progress, notes, exports, analytics, or plan references,
  - week labels, phase labels such as `build`/`taper`, and competition display names are presentation only unless a separate canonical field explicitly owns that meaning.
- Mutability rules:
  - canonical IDs are write-once,
  - reorder operations change ordering fields only,
  - title/slug edits must not mutate canonical IDs.
- Rename vs repurpose:
  - rename in place is allowed only when the underlying drill/template/workout/plan object is still semantically the same,
  - materially different content should create a new entity instead of overwriting an existing canonical ID,
  - changing a saved plan from one planning horizon to another or changing its target competition/peak intent should default to new/versioned plan semantics rather than silent in-place repurpose.
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
- Canonical plan/program entities support explicit planning-horizon metadata and optional competition-date/peak intent without relying on titles or week labels.
- Step payloads are validated and normalized before persistence.
- Totals (`meters`, step count, interval count) are deterministic.
- Canonical step model can express Garmin-familiar single steps, repeats, and interval sets without ambiguous translation.
- Threshold-based swim-zone targets are normalized from supported threshold sources into deterministic pace/zone references.
- Invalid combinations return actionable validation errors.
- Canonical identity rules are documented for all persisted entities before implementation starts.
- Product language and schema avoid claiming universal "official swim zones" when the contract is a published threshold-based method.
- Brief is scorecard-complete and lintable before implementation starts.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- targeted integration tests for API writes and negative paths
- targeted contract tests for Garmin-ready target/duration/repeat normalization and threshold-zone derivation
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-20 | planning | aligned the canonical workout contract to Garmin-style duration/target/repeat semantics and threshold-based swim-zone normalization from 1000m or CSS sources so manual builder, AI generator, export, and later Garmin delivery share the same language | next: keep downstream builder/generator/export briefs pinned to this contract and avoid parallel zone systems`
- `2026-03-20 | planning | added explicit plan-intent metadata expectations for planning horizon and competition-date/peak intent so AI generation, planner editing, export, and later history evaluation do not infer those semantics from mutable labels | next: keep builder/generator/history briefs pinned to these canonical plan metadata fields before implementation starts`
