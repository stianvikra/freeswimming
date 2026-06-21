# Task Brief: Workout Data Contract And Step Engine (10/10)

## Metadata

- `id`: `2026-02-28-workout-data-contract-and-step-engine-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-06-21`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief predates the Brief Audit Record standard and was not fully re-audited in this governance slice; current scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support-surface impact must be checked before use.
- `must_refresh_before_execution_if`: Always refresh before use, and refresh again if AGENTS.md, scorecard categories, verification lanes, route labels, Help/Guide, runbooks, support surfaces, provider facts, or relevant repo paths change.

## Goal

Define a canonical, Garmin-compatible workout schema and deterministic step engine so manual builders, AI generators, poolside execution, export, and later Garmin delivery all use the same trusted data contract.

## Garmin And Swim-Zone Alignment

- Canonical steps must map cleanly to Garmin-familiar structured workout concepts:
  - duration,
  - target,
  - rest,
  - repeat/interval grouping.
- Canonical step semantics must keep observed Garmin Connect authoring labels separate from Garmin-documented provider semantics:
  - public developer anchors include `WorkoutIntensity`, `WorkoutStepDurationType`, `WorkoutStepTargetType`, `SubSport`, and `SwimStrokeType`,
  - Garmin Connect UI labels such as `Main`, `Lap Button Press`, `Fixed Rest Time`, `Send-Off Time`, `CSS-Based Send-Off Time`, `Choice`, `IM by Round`, and `Reverse IM Order (RIMO)` must be treated as mapping-layer vocabulary until partner/API mapping is explicitly confirmed.
- Canonical duration semantics must explicitly cover Garmin-documented fixed `time`, fixed `distance`, and `open` step behavior, while still being able to represent Garmin Connect UI concepts like `Lap Button Press`, fixed rest, and send-off workflows without a parallel model later.
- Canonical target semantics must explicitly cover Garmin-documented `open`, pace/speed-derived targeting, and `swim_stroke` targeting, while still being able to map Garmin Connect UI concepts like `Effort-Based`, `Target Pace`, and `CSS-Based Target Pace` deterministically.
- Repeat semantics must support ordered step sequences with explicit rest steps or active/rest interval pairing, because Garmin swim workouts are not limited to single-step repeats.
- Swim intensity targeting must support threshold-based swim zones derived from supported threshold tests, not ad hoc zone naming invented per feature.
- The contract should normalize threshold inputs from either:
  - `1000m test`,
  - `CSS 400m + 200m`.
- Product wording should describe these as `threshold-based swim zones`, not as universal or official swim-zone truth.

## Scope

- Define canonical entities:
  - `drill`, `workout_template`, `workout`, `plan`, `plan_session`, `training_history_entry`.
- Define canonical workout/session metadata:
  - environment:
    - `pool`,
    - `open_water`,
  - when environment is `pool`, `pool_length_m` must remain a canonical numeric value rather than a narrow enum so FreeSwimming can support the broader Garmin Connect preset/custom pool-size model without schema churn,
  - session intent/type such as:
    - `recovery`,
    - `endurance`,
    - `technique`,
    - `threshold_css`,
    - `speed`,
    - `race_pace`,
  - user-facing effort preset metadata:
    - `easy`,
    - `moderate`,
    - `hard`,
    - `very_hard`,
    - `race_pace`,
  - primary planning unit:
    - `distance`,
    - `estimated_time`,
  - normalized workout totals:
    - `target_distance_m`,
    - `estimated_duration_sec`,
  - editable workout title/summary fields that are presentation, not identity.
- Define canonical plan metadata:
  - `planning_horizon` enum:
    - `session`,
    - `week`,
    - `month`,
    - `three_months`,
    - `six_months`,
    - `twelve_months`,
    - `date_range`,
    - `to_competition_date`,
  - optional calendar-window metadata:
    - `start_date`,
    - `end_date`,
    - explicit rule for whether omitted `start_date` defaults to generation date / `today`,
  - optional competition intent metadata:
    - `competition_date`,
    - optional competition label,
    - explicit `peak_for_competition` boolean or equivalent structured intent field,
    - optional explicit competition-plan start date when different from default `today`.
- Define canonical `steps` JSON schema:
  - structure type that distinguishes `single_step` vs `repeat_block`,
  - UI-facing section/authoring label such as `warmup`, `main`, `cooldown`, `rest`, or `swim`, kept separate from provider mapping,
  - canonical intensity field aligned to Garmin-documented `WorkoutIntensity` semantics such as `active`, `warmup`, `cooldown`, `rest`, `recovery`, and `interval`,
  - duration object with explicit canonical `duration_type` such as `time`, `distance`, `open`, and supported repeat-until variants, plus enough structured metadata to map observed Garmin Connect UI cases like `Lap Button Press`, fixed rest, and send-off workflows deterministically,
  - target object with explicit canonical `target_type` such as `open`, `threshold_zone`, `pace_range`, `swim_stroke`, `rpe`, and `rest`, plus enough structured metadata to map observed Garmin Connect UI cases like `Effort-Based`, `Target Pace`, and `CSS-Based Target Pace` deterministically,
  - swim context fields that can preserve Garmin-documented `SPORT_SWIMMING` plus `SUB_SPORT_LAP_SWIMMING` vs `SUB_SPORT_OPEN_WATER` semantics where relevant,
  - repeat blocks that preserve ordered child-step sequences and can represent explicit rest steps instead of assuming rest is only metadata,
  - stroke/equipment, with observed Garmin Connect conveniences like `Choice`, `IM by Round`, `Reverse IM Order (RIMO)`, and equipment pickers treated as explicit mapping cases rather than assumed public API enums,
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
  - deterministic zone-band projection rules for workout targeting and export mapping,
  - user-facing generator/builder flows may start from simpler effort presets, but canonical storage must still preserve deterministic mapping into the threshold-based method when threshold context exists.
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
  - week labels, phase labels such as `build`/`taper`, date-window labels, and competition display names are presentation only unless a separate canonical field explicitly owns that meaning.
- Mutability rules:
  - canonical IDs are write-once,
  - reorder operations change ordering fields only,
  - title/slug edits must not mutate canonical IDs.
- Rename vs repurpose:
  - rename in place is allowed only when the underlying drill/template/workout/plan object is still semantically the same,
  - materially different content should create a new entity instead of overwriting an existing canonical ID,
  - changing a saved plan from one planning horizon to another, changing its calendar window, or changing its target competition/peak intent should default to new/versioned plan semantics rather than silent in-place repurpose.
- Compatibility contract:
  - import/AI/export flows must preserve canonical IDs for existing entities or create explicit new entities,
  - no production logic may infer canonical identity from editable labels or ordinal strings alone.
- Observability and repair:
  - unresolved legacy/foreign identifiers must fail deterministically and be surfaced in validation or import logs rather than silently coerced.

## Workout Revision And Shared Reference Contract

Decision captured on `2026-06-21` from Calendar actual-history review:

- A saved `workout` can be referenced by multiple plans, planned instances, Garmin send jobs, and actual-history rows.
- Editing a shared workout in place can unintentionally change the meaning of older plans or future reused plans.
- `workout_template` is reserved for a reusable template/source pattern and must not be used as a label for every concrete saved workout.
- Future plan instances should be able to point to a specific workout revision or immutable workout snapshot, not only the mutable workout ID.
- When a workout already has plan usage, send-job usage, actual-history usage, or multiple references, the edit flow should default to `Save as new revision`.
- `Update shared workout` should be an explicit advanced choice that tells the user it changes every future/planned reference that still points to the mutable shared workout.
- Existing actual-history and provider evidence must keep their original planned/workout snapshot semantics even if the source workout later receives a new revision.
- Calendar should avoid implying that a planned workout edit is safe until this revision model exists; route actions should prefer view/read labels such as `View workout` for shared references, with actual edits happening in the dedicated workout editor under revision rules.
- Acceptance criteria for this contract must include tests proving that:
  - a plan instance can remain attached to the revision it was created with,
  - saving a new revision does not rewrite older actual-history evidence,
  - updating the shared workout requires explicit user intent,
  - labels/slugs are not used as revision identity.

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
- Canonical plan/program entities support explicit planning-horizon metadata, optional calendar-window metadata, and optional competition-date/peak intent without relying on titles or week labels.
- Canonical workout/session entities support explicit environment, pool length, session intent/type, effort preset metadata, and normalized time/distance totals without relying on free-text notes.
- Step payloads are validated and normalized before persistence.
- Totals (`meters`, step count, interval count) are deterministic.
- Canonical step model can express Garmin-familiar single steps, repeats, and interval sets without ambiguous translation.
- Canonical step model can express Garmin-documented intensity, fixed-duration, fixed-distance, `open`, swim-sub-sport, and `swim_stroke` semantics plus explicit rest steps and repeated swim sets, while also preserving enough structure to map Garmin Connect UI variants like `Main`, `Lap Button Press`, fixed rest, send-off, `Choice`, and `RIMO` workflows without ambiguous translation.
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
- `2026-03-20 | planning | added explicit plan-intent metadata expectations for planning horizon, optional calendar windows, and competition-date/peak intent so AI generation, planner editing, export, and later history evaluation do not infer those semantics from mutable labels | next: keep builder/generator/history briefs pinned to these canonical plan metadata fields before implementation starts`
- `2026-03-20 | planning | expanded the canonical workout/session metadata to cover pool vs open-water context, supported pool lengths, session intent, effort presets, and normalized time/distance totals so the first AI session generator and later manual builder can share one editable model | next: keep AI session input UX simple while still mapping canonically onto threshold-based targeting and Garmin-ready step data`
- `2026-03-22 | planning | aligned the step contract more tightly to observed Garmin swim-builder behavior and official Garmin developer docs so Garmin-documented `WorkoutIntensity`, `time`, `distance`, `open`, `swim_stroke`, and lap/open-water sub-sport remain clearly separated from Garmin Connect UI labels like `Main`, `Lap Button Press`, fixed rest, send-off, `Choice`, and `RIMO` workflows that still need an explicit mapping matrix | next: keep manual builder, export, and blocked Garmin partner mapping matrix pinned to these concrete semantics rather than only generic Garmin-ready language`
