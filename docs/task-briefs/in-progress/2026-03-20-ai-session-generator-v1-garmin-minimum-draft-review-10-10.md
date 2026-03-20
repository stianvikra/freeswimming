# Task Brief: AI Session Generator V1 Garmin-Minimum Draft Review (10/10)

## Metadata

- `id`: `2026-03-20-ai-session-generator-v1-garmin-minimum-draft-review-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-20`
- `updated`: `2026-03-20`

## Goal

Generate one Garmin-familiar swim-session draft from reviewed generator-intake context plus explicit user choices, then hand that draft into the same editable workout flow as a manual workout while keeping it in `draft` state until the swimmer reviews and accepts it.

## Why This Brief Exists

- The broad AI generator parent brief is intentionally larger than the first safe implementation slice.
- The right first proof is not a full week/month/program generator.
- The right first proof is one editable session draft that:
  - respects My Library intake context,
  - asks the swimmer what kind of session they want,
  - produces Garmin-minimum structured swim steps,
  - stays editable in the same builder model as manual workouts,
  - and remains `draft` until approved.
- This lets product, UX, data contract, and Garmin alignment harden on the smallest meaningful unit before longer-horizon planning adds progression, tapering, and history feedback loops.

## Dependencies And Boundaries

- Upstream intake handoff:
  - `docs/task-briefs/done/2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10.md`
- Upstream AI generator parent:
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- Upstream canonical workout contract:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
- Downstream editing handoff:
  - `docs/task-briefs/planned/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- This brief owns:
  - one-session AI generation,
  - single-run user input UX for that generation,
  - draft review/save rules for one generated session.
- This brief does not own:
  - multi-session program generation,
  - calendar planning,
  - competition-date taper/peak logic,
  - Garmin send/publish,
  - completed-history reconciliation,
  - or a separate AI-only editor.

## Product Assumptions For V1

- Supported environments:
  - `pool`
  - `open_water`
- Supported pool lengths when environment is `pool`:
  - `12.5m`
  - `25m`
  - `50m`
- Supported session types in v1:
  - `recovery`
  - `endurance`
  - `technique`
  - `threshold_css`
  - `speed`
  - `race_pace`
- Supported user-facing effort choices in v1:
  - `easy`
  - `moderate`
  - `hard`
  - `very_hard`
  - `race_pace`
- Supported primary sizing modes in v1:
  - `distance`
  - `estimated_time`
- Supported extra structure preferences in v1:
  - include drills
  - include kick work
  - allowed strokes the swimmer is comfortable using
  - optional allowed-equipment list:
    - `kickboard`
    - `pull_buoy`
    - `fins`
    - `paddles`
    - `snorkel`
- Naming:
  - AI provides one or more editable title suggestions.
  - Title is never fixed or identity-bearing.

## UX Direction For V1

- Ask for the minimum information that materially shapes one session:
  - session type,
  - effort,
  - pool vs open water,
  - pool length when relevant,
  - distance or estimated-time target,
  - whether drills/kick should appear,
  - which strokes can be used,
  - optional equipment constraints.
- Do not force the swimmer to pick raw threshold zones as the primary UX.
- If threshold/CSS context exists, use it behind the scenes to shape pace/zone targets in the generated workout.
- Keep advanced exact-zone editing in the later manual workout editor rather than in the first AI input form.
- Default generated pool sessions should include:
  - an easy warmup,
  - a main set matched to session type and effort,
  - a cooldown,
  - unless a documented short-session or open-water rule intentionally changes that structure.

## Scope

- Authenticated AI session-generation entrypoint for `planning_horizon = session`.
- Current runtime implementation slice under this brief:
  - generate one local session draft from prepared intake context on `/my-library/generator`,
  - support full review/editing of that draft on the same page,
  - accept one reviewed draft into a first canonical owner-scoped workout entity,
  - reopen and update accepted workouts through the same editable model on `/my-library/generator`,
  - keep the dedicated manual workout-builder route and richer poolside execution flow deferred until the broader workout-entity and builder track lands.
- Input contract for one generated session:
  - intake handoff payload,
  - selected session type,
  - selected effort preset,
  - selected environment,
  - selected pool length when environment is `pool`,
  - selected primary sizing mode:
    - `distance`
    - or `estimated_time`,
  - explicit `target_distance_m` or `target_time_min`,
  - include-drills flag,
  - include-kick flag,
  - allowed strokes list,
  - optional equipment allowlist,
  - optional one-run notes/constraints.
- Generation rules:
  - Garmin-familiar structured step output only,
  - deterministic warmup/main/cooldown structure rules,
  - simple effort UX mapped to canonical threshold-based targeting when threshold context exists,
  - deterministic fallback when threshold context does not exist,
  - avoid incompatible step shapes for later export/send,
  - constrain incompatible combinations explicitly:
    - e.g. `open_water` plus drill-heavy or kick-heavy requests may need guardrails or reduced support.
- Output rules:
  - create one generated workout draft,
  - keep draft separate from accepted canonical workout state until review/accept,
  - show editable title suggestion(s),
  - preserve generation metadata needed for later review and analytics,
  - hand accepted draft into the same canonical workout payload shape later manual-builder work will reuse.
- Review/edit handoff:
  - swimmer can edit the full generated session before accepting it,
  - title, metadata, steps, targets, strokes, notes, and equipment stay editable,
  - no AI-only hidden fields should be required to keep the workout valid,
  - accepted workouts can be reopened and updated without regenerating from scratch.

## Out Of Scope

- Multi-session week/month/date-range/program generation.
- Competition-date generation and taper/peak orchestration.
- Automatic calendar scheduling.
- Automatic send to Garmin.
- Full manual workout-builder route and poolside execution UX.
- Completed-history ingestion or retrospective AI analysis.
- Public sharing or SEO surfaces.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - accepted canonical workout entities after explicit save/accept,
  - validated normalized step payload,
  - canonical workout metadata such as environment, pool length, session intent, totals, and title.
- Local-only:
  - current generation form state,
  - transient generated preview,
  - draft review edits before acceptance,
  - discarded draft variants,
  - temporary title suggestions.
- Sync behavior:
  - generation output is provisional until explicit accept/save succeeds,
  - regeneration must not silently overwrite a previously accepted workout,
  - draft review edits must survive transient generate/save failures where practical,
  - accepted AI sessions must re-enter later reads as normal canonical workouts, not AI-special cases,
  - accepted workouts reopened for editing must patch the same canonical entity rather than creating silent duplicates.
- Invalidation:
  - accept/delete/regenerate invalidates workout-detail, builder, and export reads for the affected draft/workout.

## Identity And Rename Contract

- Canonical stable IDs:
  - generated previews may use ephemeral client IDs,
  - accepted workouts and steps receive canonical immutable IDs from the shared workout contract.
- Human-readable identifiers:
  - generated workout titles and section labels are editable display fields only.
- Mutability rules:
  - rename/edit after generation must not rewrite canonical IDs for already-accepted entities.
- Rename vs repurpose:
  - materially regenerating a session should create a new draft version rather than silently mutating an already-accepted workout in place.
- Compatibility contract:
  - the manual workout editor, program planner, history, and export surfaces must consume the accepted output through the shared canonical workout contract, not through an AI-only adapter.
- Observability and repair:
  - rejected output, invalid schema rewrites, and unresolved step mappings must be logged/measured with support-visible diagnostics.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                                | Evidence                              |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | Users can generate one swim session from explicit choices and clearly understand `draft` vs `accepted` state with no hidden AI assumptions.     | UX flow + route/state contract        |
| UX flow clarity                               | `target`     | Users can request, review, and hand off one generated session for editing in <= 2 minutes median without documentation.                         | e2e + timed manual QA                 |
| Visual design quality                         | `supporting` | Supporting only: visual language should align with My Library/workout flows, but broader UI system ownership is downstream.                     | scope rationale + downstream QA       |
| Business logic correctness and data integrity | `target`     | Generated output always validates against the canonical workout contract before acceptance and never mutates accepted workouts implicitly.      | schema tests + integration invariants |
| Admin editor ergonomics                       | `supporting` | Supporting only: no direct admin/editor workflow is introduced in this user-facing generator slice.                                             | scope rationale                       |
| Accessibility (a11y)                          | `target`     | Session-type, effort, pool-length, stroke, and review controls are keyboard/touch accessible with clear labels and focus recovery.              | a11y checks + e2e                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: one-session generation flow should avoid obvious payload bloat or blocking regressions on authenticated routes.                | scope rationale + perf review         |
| Data placement and sync boundaries            | `target`     | Generated previews stay local/provisional until accepted, and accepted workouts become normal canonical workouts with no AI-only storage model. | data contract + integration tests     |
| Caching and invalidation strategy             | `supporting` | Supporting only: regenerate/accept/delete actions must invalidate stale preview and workout reads deterministically.                            | cache notes + scope rationale         |
| Reliability and failure handling              | `target`     | Invalid output, missing threshold context, and AI failures all produce recoverable states with no dead-end draft confusion.                     | negative-path tests + e2e             |
| Security and authz                            | `target`     | Protected generation/save flows fail closed and cannot expose or save another user's private intake context or workout draft.                   | API negative-path tests               |
| Privacy and compliance                        | `supporting` | Supporting only: prompts, constraints, and analytics must avoid leaking unnecessary private free text.                                          | payload review + scope rationale      |
| Content governance                            | `supporting` | Supporting only: canonical workout governance is inherited from the shared workout contract and builder slices.                                 | linked brief + scope rationale        |
| Admin workflow and editability                | `supporting` | Supporting only: editability is owned by the shared workout editor rather than a dedicated admin surface.                                       | scope rationale                       |
| SEO and crawlability                          | `supporting` | Supporting only: authenticated generator drafts are not primary public crawl surfaces.                                                          | scope rationale                       |
| AI discoverability                            | `supporting` | Supporting only: this slice is about private AI generation safety, not public AI-discoverable publishing.                                       | scope rationale                       |
| Analytics and KPI observability               | `supporting` | Supporting only: generation start/success/failure/acceptance events should remain available with safe payloads.                                 | event contract notes                  |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct billing/entitlement mutation ships in this session-generator slice.                                                  | scope rationale                       |
| Incident response and support operations      | `supporting` | Supporting only: AI rejection and save-failure states must leave support-visible diagnostics and recovery guidance.                             | runbook/error contract                |
| Finance and reporting operations              | `N/A`        | N/A because this slice introduces no finance/reporting mutation or ledger-affecting behavior.                                                   | explicit scope rationale              |
| i18n operational readiness                    | `supporting` | Supporting only: labels such as session type, effort, and generated guidance must remain locale-extensible later.                               | copy review + scope rationale         |
| Stack-fit and dependency discipline           | `target`     | Use existing app validation, storage, and test patterns; avoid new orchestration dependencies unless clearly justified.                         | dependency diff + code review         |
| Testing and QA automation                     | `target`     | Generate/review/accept/edit handoff, invalid-output fallback, and protected negative paths are covered before merge.                            | unit/integration/e2e + verify         |
| Scalability and cost efficiency               | `supporting` | Supporting only: one-session generation should avoid runaway retries, oversized prompts, or oversized JSON output.                              | scope rationale + usage notes         |
| DevOps and rollback readiness                 | `target`     | The session generator can be disabled or rolled back without corrupting saved canonical workouts or manual-builder reads.                       | rollout notes + release checklist     |

## Acceptance Criteria

- Users can generate exactly one swim-session draft from explicit session choices without choosing a longer planning horizon.
- Supported v1 inputs include pool/open-water environment, supported pool lengths, duration by distance or estimated time, session type, effort, drills/kick inclusion, and allowed strokes.
- If threshold/CSS context exists, the generator uses it for pacing/zone shaping without forcing raw zone-picking as the primary UX.
- If threshold/CSS context does not exist, generation still succeeds with deterministic simpler targeting guidance.
- Generated pool sessions default to including easy warmup and cooldown structure unless documented rules intentionally exempt a special case.
- Generated output meets the Garmin-minimum structured-workout contract and is editable through the same workflow as a manually built workout.
- Generated title suggestions remain editable.
- Generated output stays in `draft` state until the user reviews and accepts it.
- Regeneration does not silently overwrite an already accepted workout.
- Brief is scorecard-complete and lintable before implementation starts.

## Validation

- `npm run lint:briefs`
- targeted schema tests for one-session generation contract
- targeted integration tests for generate -> review/edit -> accept handoff
- targeted negative-path tests for invalid/unauthorized generation and save flows
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-20 | planning | created a dedicated first-slice brief for AI session generation so the team can prove one Garmin-familiar editable workout draft before expanding into week/month/program generation | next: keep parent AI brief, workout contract, and manual builder aligned to this one-session draft-first workflow`
- `2026-03-20 | planning | set v1 assumptions to support pool and open water, supported pool lengths, distance or estimated-time sizing, explicit session types, simple effort presets, drills/kick preferences, stroke selection, and optional minimal equipment constraints | next: validate these assumptions with owner feedback later and only then start implementation work`
- `2026-03-20 | planning | kept threshold zones in the canonical model while deferring direct raw zone-picking as the primary generator UX, so v1 can stay simple for swimmers without breaking later advanced editing/export | next: use this brief to decide whether the first implementation slice should start with session-only generation UI or with the underlying generation/save contract`
- `2026-03-20 | checkpoint | perf trend during verify recommended tighten after consecutive weekly green runs; decision for this docs-only planning slice is hold because no route-performance implementation changed | next: revisit tightening in the next performance-owning implementation or PR summary that changes route budgets directly`
- `2026-03-20 | working tree | moved this brief to in-progress and narrowed the first runtime implementation to a truthful draft-review slice on /my-library/generator: authenticated session-draft generation API, deterministic Garmin-familiar draft output, and full local draft editing while canonical save/accept stays deferred until shared workout entities land | next: implement route, UI, tests, and run local verify gates before PR handoff`
- `2026-03-20 | working tree | implemented the first runtime slice on /my-library/generator with server-validated session drafting, program-deferred messaging, full local draft editing, route/runbook updates, and new unit + e2e coverage; targeted unit suites and desktop generator e2e passed | next: package for PR after local gate review and note that canonical save/accept into the shared workout builder is still deferred`
- `2026-03-20 | working tree | local npm run verify:pre-pr reached full Playwright and failed only on the known unrelated desktop athlete-profile flake (`tests/e2e/my-library-athlete-profile.spec.ts`); targeted rerun of that exact spec passed immediately afterward, while the new generator flow also passed in the full matrix and in targeted reruns | next: cite the athlete-profile flake in PR validation notes and keep this slice focused on generator delivery unless that legacy flake needs its own follow-up`
- `2026-03-20 | working tree | continued the slice into first canonical workout acceptance by adding the owner-scoped workouts table contract, save/open/update APIs, same-page reopen flow on /my-library/generator, export/runbook updates, and focused unit coverage for routes/server/panel behavior | next: rerun desktop generator e2e against live Supabase-backed workouts persistence and then run repo gates`
- `2026-03-20 | supabase | applied only 20260320191500_workouts_foundation_and_ai_session_accept.sql to the linked project and recorded that version in migration history without pushing the older unrelated 20260311100000 admin-email-template migration; linked DB now answers on public.workouts | next: finish verify:pre-pr and verify:pre-merge before PR handoff`
- `2026-03-20 | working tree | perf trend during the implementation gate again recommended tighten after consecutive weekly green runs; decision for this generator slice is hold because no new public-route budget target was deliberately tightened in this PR and the active workstream is primarily workflow/contract delivery | next: revisit one stretch-target ratchet in the next perf-owning PR summary or brief update`
- `2026-03-20 | working tree | continuing the same brief with the next narrow runtime slice: first canonical workout persistence for accepted AI session drafts, plus reopen/update on /my-library/generator, while still deferring the separate manual builder route, calendar/program flows, and history reconciliation | next: ship workouts schema + owner-scoped APIs + generator-page save/open/update UX, then rerun local gates`
