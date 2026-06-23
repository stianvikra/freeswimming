# Task Brief: AI Session Draft App/Data Readiness Audit V1 (10/10)

## Metadata

- `id`: `2026-06-23-ai-session-draft-app-data-readiness-audit-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `plan only / docs-only app and data readiness audit`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- `downstream_child`: `docs/task-briefs/planned/2026-06-23-ai-session-draft-adapter-intake-control-questions-10-10.md`
- `related_deferred_provider_briefs`:
  - `docs/task-briefs/planned/2026-06-23-garmin-provider-facts-collection-packet-v1-10-10.md`
  - `docs/task-briefs/planned/2026-06-23-garmin-provider-data-scope-retention-ai-audit-10-10.md`
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@36b95993`
- `audit_status`: `ready`
- `decision`: Use this docs-only audit before implementing the AI single-session draft adapter, so the runtime child starts from a concrete app/data map instead of assumptions.
- `reason`: The repo has a protected deterministic session generator, profile/goals/capability data, known drill catalogs, generic activity-history/provider-evidence foundations, and a paused Garmin packet. It still needs a single audit that says what AI may use now, what must be built new, and which Garmin/provider inputs stay deferred.
- `must_refresh_before_execution_if`: Refresh if generator routes, `SessionDraft`, Swim Profile, Goals, Training History, provider evidence, Garmin packet status, OpenAI docs/model/runtime guidance, Help/Guide contracts, scorecard categories, or verification lanes change.

## Goal

Create a docs-only readiness audit that maps current FreeSwimming app/data surfaces to the future AI single-session adapter and defines the exact 10/10 gaps before runtime.

## Pre-Implementation Owner Explanation

Codex skal lage en audit-plan, ikke AI-kode. Den skal vise hvilke deler av appen AI kan bruke trygt i dag, hva som ma bygges nytt, og hva som ma markeres som utsatt, spesielt Garmin-data.

Hvorfor det betyr noe: en AI-okt blir bare god hvis den bygger pa riktig profil, mal, kapasitet, treningsmengde og drillkatalog. Hvis Garmin eller historikk blandes inn for tidlig, kan appen dobbelttelle, lagre for mye sensitiv data eller gi feil forslag.

Utenfor scope er runtime-kode, OpenAI-kall, Garmin-kontakt, Garmin-runtime, API-nokler, UI-endringer, migrasjoner, screenshots, PR til live runtime og endringer i `Ja.docx`.

## Product Decision

Recommended sequence:

1. Run this docs-only app/data readiness audit.
2. Update the downstream AI adapter child if the audit finds scope gaps.
3. Only then execute the AI single-session draft adapter child.

Do not start OpenAI runtime directly from the existing adapter child until this audit has answered:

- what current app sources are safe as model input;
- what current sources are useful for deterministic fallback only;
- what source flags and manual questions are still missing;
- what Garmin/provider/history data is deferred;
- what must be created before a 10/10 runtime claim.

## Current App/Data Surfaces To Audit

| Surface                   | Current evidence                                                                                                                                                                                                       | Audit decision needed                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Protected generator route | `app/api/my-library/generator/session-draft/route.ts` authenticates the user, loads owner-scoped intake, uses `no-store`, rejects invalid JSON, rejects program target, builds `rule_engine_v1`, and validates output. | Keep as reference route boundary; decide whether AI adapter is a sibling route or behind explicit server flag on this route. |
| Generator intake handoff  | `lib/generator-intake/shared.ts` includes preferences, CSS, personal records, goals, capability limits, selected/omitted blocks, and overrides. `notesIncluded` is false.                                              | Use as initial prompt-input boundary; add AI-specific source flags/control answers separately.                               |
| Swim Profile              | `lib/athlete-profile/server.ts` exposes CSS, pool preferences, weekly sessions, session duration, personal records, and swim capability limits.                                                                        | Mark as `use now` when selected by user; missing values create questions or conservative defaults.                           |
| Goals                     | `lib/goals/mvp.ts` exposes active/on-track/at-risk goals, goal type, target date, target distance, target time, and template/custom source.                                                                            | Use active goals only as typed context; do not infer competition/taper unless user confirms intent.                          |
| Session draft contract    | `lib/session-generator-v1/shared.ts` defines environments, session types, efforts, strokes, equipment, duration/target modes, repeats, pool units, `SessionDraft`, and `generatorKind: "rule_engine_v1"`.              | Add model-assisted generator kind and any drill-reference field only through a typed contract change.                        |
| Rule engine               | `lib/session-generator-v1/server.ts` builds and validates deterministic drafts.                                                                                                                                        | Keep as fallback, invariant oracle, and regression baseline.                                                                 |
| Generator UI/review/save  | `components/my-library/generator/GeneratorIntakeHub.tsx` and `SessionGeneratorPanel.tsx` preview drafts and save through existing workout routes.                                                                      | Reuse this review/save flow; no auto-save or AI-only entity.                                                                 |
| Known drills              | `lib/guides/guide-poolside.ts`, `lib/guides/guide-0-1000m.ts`, and `app/course/courseData.ts` contain in-app drill/course data.                                                                                        | Audit which rows have stable IDs, explanation paths, safety notes, and AI eligibility.                                       |
| Manual actual history     | `lib/my-library/training-activity-events.ts` includes generic activity-history unions and read model; existing planned swim actuals remain separate compatibility truth.                                               | Use only after a later history/retrospective child; not input for V1 session draft unless explicitly mapped.                 |
| Provider evidence         | `lib/my-library/provider-evidence.ts` defines provider keys, evidence states, import runs, file states, and redacted summaries.                                                                                        | Deferred for AI input; can inform future provider audit only after facts packet is resolved.                                 |
| Garmin/provider packets   | Planned/blocked Garmin briefs keep partner access, payloads, FIT, retention, AI allowance, attribution, and reconciliation unresolved.                                                                                 | Mark all Garmin-derived AI input as deferred/provider-blocked.                                                               |

## Audit Result

Execution result on `2026-06-23`: the app is ready for a bounded AI single-session runtime only after the downstream child builds explicit AI intake/source flags, model-adapter boundaries, drill-catalog mapping, privacy-safe diagnostics, and failure/fallback contracts. No Garmin/provider or generic history data is prompt-ready.

Recommended next runtime sequence:

1. Keep this audit as the source map.
2. Refresh the downstream child with this result before runtime if any code changes land first.
3. Build AI single-session draft adapter only.
4. Keep program/taper/history/Garmin/provider inputs deferred.

## Audit Output Matrix

The audit must produce a concrete table with these classifications:

| Classification      | Meaning                                                                                            | Examples expected now                                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `use_now`           | Typed, owner-scoped, minimized data can be used by V1 AI after user import/manual/not-sure choice. | CSS, pool length, weekly sessions, session minutes, personal records, active goals, swim capability limits, generator overrides.                                |
| `fallback_only`     | Useful to validate, compare, or bound AI output, but not direct model authority.                   | `rule_engine_v1`, deterministic draft validation, existing workout save flow, session step invariants.                                                          |
| `create_new`        | Missing contract/runtime/support surface required before adapter implementation.                   | `AiSessionDraftIntake`, source flags, control-question answers, prompt bundle ID, strict schema, model-assisted `generatorKind`, failure classes, disable flag. |
| `catalog_map_first` | Existing data may be used only after stable IDs/allowed-scope mapping exist.                       | Guide/course drills, drill explanation links, possible future advanced drills.                                                                                  |
| `deferred_history`  | Useful later but not safe for V1 generation yet.                                                   | `training_activity_events`, planned-vs-actual deltas, fatigue/RPE, recent load trends.                                                                          |
| `deferred_provider` | Blocked until provider facts, consent, retention, mapping, and support decisions exist.            | Garmin Activity API, FIT/GPX/TCX files, Health API, Training API send state, provider evidence.                                                                 |
| `do_not_use`        | Must not enter prompts or diagnostics for this track.                                              | Raw notes dumps, raw prompts/responses, raw provider payloads/files, secrets, OAuth tokens, exact GPS traces, unsupported health/women's-health data.           |

### Source Classification Results

| Source / surface                                                                          | Classification              | Evidence                                                                                                                                                                                               | Runtime decision                                                                                                                                          |
| ----------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generator selected blocks and overrides                                                   | `use_now`                   | `GeneratorIntakeHandoffPayload` records included/omitted blocks, `targetType`, desired session count/minutes, focus text, and constraint text; free text is bounded.                                   | AI V1 may use selected blocks and bounded manual focus/constraint text after source flags are copied into `AiSessionDraftIntake`.                         |
| CSS pace                                                                                  | `use_now`                   | `TrainingMetricView` exposes `metricKey: "css"`, `unit: "seconds_per_100m"`, value, label, recorded date, source note, and timestamps.                                                                 | Use as imported current-level field when selected; if missing or stale, ask/mark `not_sure` and keep conservative pace assumptions.                       |
| Pool/training preferences                                                                 | `use_now`                   | `TrainingPreferencesView` exposes pool length, available days, weekly session count, and preferred session duration.                                                                                   | Use pool length/session minutes/sessions per week when selected; available days are context only and cannot create a program/calendar plan in V1.         |
| Personal records                                                                          | `use_now`                   | `PersonalRecordView` exposes distance, stroke, course, time, recorded date, source note, and event label.                                                                                              | Use as optional race/current-level context; never infer competition/taper without explicit user answer.                                                   |
| Swim capability limits                                                                    | `use_now`                   | `SwimCapabilityLimitView` exposes drill/kick/stroke max repeat, max total, and target total distances.                                                                                                 | Use to cap continuous sets, drill volume, stroke load, and ambition; missing limits create conservative defaults/questions.                               |
| Active goals                                                                              | `use_now` with confirmation | `GoalView` exposes active goal type, status, target date, target distance, target time, target count, and target ref.                                                                                  | Use as goal candidates, but goal intent must still be selected/confirmed by control questions.                                                            |
| Existing route auth/no-store                                                              | `fallback_only`             | Session-draft route authenticates through Supabase, returns `401` for unauthenticated, `400` for invalid input, `422` for deferred program target, and `Cache-Control: no-store`.                      | Reuse route boundary or sibling pattern; AI runtime must preserve fail-closed auth and no-store behavior.                                                 |
| `rule_engine_v1`                                                                          | `fallback_only`             | `SessionDraft.generatorKind` is currently only `"rule_engine_v1"` and server validation checks environment, pool size, target distance/time, strokes, equipment, drill/kick volume, and stroke limits. | Keep as invariant oracle and fallback; do not let model output bypass deterministic validation.                                                           |
| Existing generator preview/save                                                           | `fallback_only`             | `SessionGeneratorPanel` previews drafts and saves through existing workout routes; route tests cover authenticated owner draft and program deferral.                                                   | AI output remains provisional until the same review/save flow accepts it.                                                                                 |
| Poolside guide drills                                                                     | `catalog_map_first`         | `GUIDE_POOLSIDE_DRILLS` has stable `D01`-style IDs, title, summary, setup, focus cues, visual path, and alt text.                                                                                      | Best first AI drill catalog candidate, but `SessionDraftStep` needs a stable drill-reference field before model output can cite IDs.                      |
| 0-1000m guide sessions                                                                    | `catalog_map_first`         | `GUIDE_0_TO_1000M_SESSIONS` has stable session IDs, week numbers, title, focus, and target set text.                                                                                                   | Useful later for progression context; V1 single-session AI should not import multi-week progression unless mapped to one allowed session/drill reference. |
| Course lesson drills                                                                      | `catalog_map_first`         | `CourseLesson` contains IDs, lesson type, drill title/steps, lesson experience, water practice, safety notes, and canonical runtime ID helpers.                                                        | Needs an explicit AI-eligible catalog adapter before prompt use because not every lesson drill is a safe session-step drill.                              |
| AI source/control contract                                                                | `create_new`                | Existing generator intake has block selection but not field-level import/manual/not-sure/not-applicable sources.                                                                                       | Build `AiSessionDraftIntake` and source flags before any model prompt.                                                                                    |
| Goal intent contract                                                                      | `create_new`                | Existing goals have typed goal rows, but no AI-specific distinction for competition/form peak, CSS, distance, continuous crawl, technique, or general fitness.                                         | Build goal intent mapping and require user confirmation.                                                                                                  |
| Model adapter/config                                                                      | `create_new`                | Repo has no OpenAI runtime, Responses API callsite, model config, SDK dependency, prompt bundle, disable flag, or cost/latency buckets.                                                                | Build server-only adapter behind disabled-by-default flag after official-doc refresh; no client keys.                                                     |
| Strict schema and generator kind                                                          | `create_new`                | `SessionDraft` currently has only `generatorKind: "rule_engine_v1"` and no strict model-output schema version.                                                                                         | Add model-assisted generator kind, prompt/schema version, strict validation, and unknown-value failure classes.                                           |
| Diagnostics/privacy                                                                       | `create_new`                | Existing route tests do not cover model payload minimization, raw prompt/response suppression, token/cost bucket redaction, or timeout class.                                                          | Add mocked OpenAI failure/timeout/no-raw-prompt/no-secret tests in runtime child.                                                                         |
| Manual/generic activity history                                                           | `deferred_history`          | `training_activity_events` supports manual/provider/system source kinds, sport/sub-sport mapping statuses, outcomes, timestamps, metrics, and provider evidence links.                                 | Do not use for V1 prompt; later history-input child must decide trusted rows, windows, load math, and privacy.                                            |
| Planned swim actuals                                                                      | `deferred_history`          | `completed_activity_events` remain planned swim actual truth and Review Actual stores full `actualSessionDraft` after user correction.                                                                 | Do not use for V1 prompt; later plan-vs-actual input must prevent double-counting and silent plan mutation.                                               |
| Provider evidence                                                                         | `deferred_provider`         | Provider evidence supports `garmin_activity_api`, file states, redacted summaries, import runs, unmapped/unsupported/duplicate statuses.                                                               | Not prompt-ready; can only become candidate context after provider facts, consent, retention, AI allowance, and mapping are resolved.                     |
| Garmin Activity/FIT/Training/Health data                                                  | `deferred_provider`         | Garmin packet records missing approval, scopes, sample payloads/FIT, attribution, retention, AI/model processor allowance, duplicate/correlation rules.                                                | Fully blocked for AI V1. Do not contact Garmin, import, parse, prompt, or display Garmin-derived data.                                                    |
| Raw notes, raw prompts/responses, raw provider files, secrets, unsupported health context | `do_not_use`                | Existing generator intake has `notesIncluded: false`; provider packet bans raw files/secrets; OpenAI parent bans raw prompt/response storage.                                                          | Must never enter model prompt, diagnostics, analytics, fixtures, or repo docs except as redacted field inventories after approval.                        |

### Downstream Runtime Contract

The downstream AI adapter child should treat this audit as resolved input and build only these implementation surfaces:

- `AiSessionDraftIntake` with field-level source flags;
- goal intent/control-question mapping;
- FreeSwimming drill catalog adapter with stable allowed IDs;
- model-assisted generator kind and prompt/schema version;
- server-only OpenAI adapter boundary with disabled-by-default flag;
- strict schema, deterministic validation, one bounded repair attempt, and `rule_engine_v1` fallback/retry;
- redacted diagnostics/failure classes/cost buckets;
- tests for source normalization, schema, unknown values, mocked model paths, authz, privacy, fallback, and save ownership.

It should not build:

- program generation;
- taper/periodization;
- history-derived load/feedback;
- Garmin/provider/FIT/Health input;
- new persisted draft/diagnostic tables;
- raw prompt/response storage;
- UI redesign beyond necessary control-question/review changes.

## Garmin / Provider Deferred Contract

This audit must not contact Garmin and must not start Garmin runtime.

Garmin data can only move from deferred to candidate input after the Garmin/provider packet answers:

- API family and approved scopes;
- consent, disconnect, delete, export, retention, and attribution;
- sample pool/open-water swim payloads and FIT/file rules;
- source provenance, duplicate/source-precedence behavior, and alias/correlation;
- whether normalized summaries may enter AI/model processor context;
- support diagnostics, disable flag, replay, and rollback.

Until then:

- Garmin Activity API/FIT/Health/Training data is `deferred_provider`;
- provider evidence can be mentioned only as a future boundary, not used as AI input;
- Calendar/Stats/manual actual truth must not be changed by this audit or the downstream AI V1 child;
- AI prompt payloads must exclude provider data and raw history by default.

## Required 10/10 Gap List

The completed audit must produce a short gap list with owner-readable status:

| Gap                        | Expected status after audit           | Runtime implication                                                                                                                 |
| -------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| AI intake/source flags     | `must_build` or `ready_with_contract` | Blocks model prompt until every field has import/manual/not-sure/not-applicable source.                                             |
| Goal intent mapping        | `must_build` or `ready_with_contract` | Must separate competition/form peak, CSS, distance, continuous crawl, technique, and general fitness.                               |
| Current level/load mapping | `must_build` or `ready_with_contract` | Must bound volume, continuous reps, weekly load, and session size.                                                                  |
| Drill catalog eligibility  | `must_build` or `ready_with_contract` | Unknown drills must be rejected before preview.                                                                                     |
| Model adapter boundary     | `must_build`                          | Requires server-only config, disable flag, timeout, `store: false` or current official equivalent, strict schema, and mocked tests. |
| Diagnostics/privacy        | `must_build`                          | No raw prompt/response/secrets/provider payloads in logs or persistence.                                                            |
| Fallback/retry             | `must_build`                          | Rule engine fallback or clear retry/error must be deterministic.                                                                    |
| Help/Guide/support copy    | `must_update_in_runtime_child`        | Visible AI labels, provenance, missing-data recovery, and failure classes need user-safe copy.                                      |
| Analytics/cost buckets     | `must_define_before_runtime`          | Safe status buckets only; no sensitive payload.                                                                                     |
| Garmin/provider            | `deferred_provider_blocked`           | No AI input until provider packet is resolved.                                                                                      |

## Domain Granularity Contract

User's mental objects:

- "An AI-suggested swim session I can inspect, adjust, and save."
- "My profile/goals/history data that might help AI generate that session."
- Later only: "A provider/Garmin activity that might influence coaching."

Canonical objects:

- `SessionDraft` provisional draft, then saved workout/My Swim Session after explicit save.
- Swim Profile records: `training_metrics`, `training_preferences`, `personal_records`, and `swim_capability_limits`.
- Goals: `goals` rows with active/on-track/at-risk statuses.
- Activity history: `training_activity_events` and compatibility `completed_activity_events`, out of V1 prompt scope unless later mapped.
- Provider evidence: `provider_connections`, `provider_import_runs`, and `provider_activity_evidence`, deferred.

Child object levels:

| Level                            | Audit support                           | Decision                                                                                                                        |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Intake block                     | `view`, `classify`                      | Each existing block becomes `use_now`, `fallback_only`, `create_new`, `deferred_history`, `deferred_provider`, or `do_not_use`. |
| Control question answer          | `define`, future `edit`                 | Audit defines fields and source flags; runtime UI comes later.                                                                  |
| Session summary                  | `view`, future `edit`                   | AI may suggest title/rationale/warnings only after schema validation.                                                           |
| Session step/repeat/rest/target  | `view`, future `edit`, future `reorder` | Must stay child-level visible through existing generator/workout surfaces.                                                      |
| Drill reference                  | `classify`, future `view`               | Must use stable catalog IDs or stay rejected/deferred.                                                                          |
| Manual actual/history row        | `classify` only                         | No V1 AI use until a later history-input child.                                                                                 |
| Provider evidence/Garmin payload | `deferred_provider` only                | No prompt input, no runtime, no reconciliation.                                                                                 |
| Program week/day/taper           | `out of scope`                          | Program generation remains blocked.                                                                                             |

Mature reference surfaces:

- `/my-library/generator`
- `GeneratorIntakeHub`
- `SessionGeneratorPanel`
- existing workout save/edit routes
- `SessionDraft` helpers in `lib/session-generator-v1/shared.ts`
- `ReviewActualEditor` and `training_activity_events` only as future-history references
- provider evidence helpers only as deferred provider boundary

## Data Placement And Sync Contract

Server-canonical data audited now:

- profile, preferences, CSS, personal records, capability limits, goals, saved workouts, existing activity-history rows, and provider-evidence rows.

Local/provisional data for future runtime:

- control-question answers before generation;
- generated draft preview;
- retry/error state;
- user edits before save.

Not stored or used:

- raw OpenAI prompts/responses;
- OpenAI API keys or raw env values;
- Garmin/provider raw payloads/files/tokens;
- raw notes dumps;
- full sensitive training-history dumps;
- unsupported health or women's-health context.

Sync/conflict:

- this audit has no runtime sync;
- future AI generation never mutates canonical workouts/history/provider rows;
- saved sessions use existing workout save invalidation;
- provider/history input stays blocked until separately mapped and tested.

Cache/invalidation:

- docs-only audit changes no route cache;
- future AI route must remain protected and `no-store`;
- accepted workout saves continue through existing invalidation paths.

## Identity And Rename Contract

- Audit file ID: `2026-06-23-ai-session-draft-app-data-readiness-audit-v1-10-10`.
- Downstream prompt bundle IDs must be versioned, for example `ai_session_draft_prompt_v1`.
- Future model-assisted generator kind must be explicit and separate from `rule_engine_v1`.
- Drill IDs must be stable catalog IDs; drill titles are human-readable and may be renamed only through catalog rules.
- Saved workout ID remains the canonical identity after user save.
- Provider IDs and Garmin activity IDs remain provider aliases only and cannot become FreeSwimming canonical identity.
- Unknown model, schema, drill, goal, provider, sport, or source values must fail closed or be marked unmapped/deferred.

## Forward Compatibility Contract

Future values expected:

- OpenAI model IDs, prompt bundle versions, schema versions, generator kinds, goal types, drill catalog rows, session types, strokes, equipment, activity sports, provider keys, provider statuses, analytics buckets, support failure classes, and locales.

Automatic behavior expected:

- new profile/goals fields can become named intake candidates only when they have source flags and safe fallback;
- new known drill rows can become eligible only when they expose stable ID, explanation path, safety/allowed-scope metadata, and tests;
- new provider evidence values remain unmapped/deferred until explicit mapping exists.

Explicit mapping required:

- default model or API surface change;
- new AI schema version;
- new generated saved-workout field;
- any provider/Garmin or activity-history prompt input;
- any advanced/external drill source;
- any Help/Guide label, analytics event, or support diagnostic visible to users/operators.

Safe fallback:

- unknown app data source is excluded and logged as an audit gap;
- unknown generated enum/drill/schema/model fails closed;
- unknown provider/history/source values stay `deferred_provider`, `deferred_history`, `unmapped`, or `needs_review`;
- unsupported program/taper horizon stays blocked.

Proof required:

- completed audit matrix;
- future-value/unknown-value rows in the audit;
- route/label/support sweep before runtime;
- linted brief evidence;
- later runtime tests for schema, adapter, failure, privacy, and save-flow.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this docs-only audit: every `target` category must close at `5/5`.

Critical target categories:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Audit clearly separates AI V1 session generation, future history inputs, future provider/Garmin inputs, and program generation.                                                      | audit matrix + downstream child impact note | `5/5`                   |
| UX flow clarity                               | `target`     | Audit defines import/manual/not-sure/deferred states so future UI has no hidden guesses.                                                                                             | control-question gap list                   | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no UI changes now; future UI must reuse generator surfaces and screenshot handoff.                                                                                  | explicit visual non-scope                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No source is allowed into future AI prompt unless it is typed, source-flagged, bounded, and validated or explicitly deferred.                                                        | source classification + invariant list      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this docs-only audit changes no admin editor, admin CRUD, publish flow, or operator edit surface.                                                                        | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no rendered controls change; future question UI must use accessible form patterns.                                                                                  | future UI acceptance note                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Audit must identify payload-minimization, timeout, no-store route, and no core-route JS-bloat requirements for runtime.                                                              | runtime gap list                            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical, local/provisional, not-stored, deferred-history, and deferred-provider data are explicitly separated.                                                              | data placement section                      | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Audit confirms no docs route cache change now and future AI route/save invalidation requirements.                                                                                    | cache/invalidation section                  | `5/5`                   |
| Reliability and failure handling              | `target`     | Runtime blockers include missing source, missing config, timeout, invalid schema, unknown drill/provider/history values, fallback, and retry.                                        | 10/10 gap list + radar                      | `5/5`                   |
| Security and authz                            | `target`     | Audit keeps future AI route owner-scoped/server-only and excludes secrets/raw provider data.                                                                                         | security/privacy contract                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Prompt payloads stay minimized; raw prompts/responses, Garmin/provider files, secrets, and sensitive history dumps are blocked.                                                      | not-stored list + Garmin deferred contract  | `5/5`                   |
| Content governance                            | `target`     | AI copy remains advisory; drills must come from governed FreeSwimming catalogs or be rejected/deferred.                                                                              | drill/catalog governance section            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status queue, admin action, or operator editability changes in this audit.                                                                            | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because AI session generation and this audit are private/repo docs work with no public route, metadata, sitemap, or crawl behavior change.                                       | private/docs-only rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this is private AI generation readiness, not public structured data or crawl-safe AI-discoverable content.                                                               | private AI workflow rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Audit names safe status/cost/failure buckets needed before runtime and blocks sensitive payload analytics.                                                                           | analytics/cost gap row                      | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this audit changes no pricing, checkout, entitlement, invoice, payout, refund, or revenue workflow.                                                                      | explicit commerce non-scope rationale       | `N/A`                   |
| Incident response and support operations      | `target`     | Audit must define disable/fallback/support-diagnostic expectations and keep Garmin/provider incidents deferred until packet is resolved.                                             | support/runtime gap rows                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this audit does not mutate finance, reporting, invoices, payouts, refunds, entitlements, or accounting data; future model cost is only a runtime ops bucket.             | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Future visible AI labels/errors must be typed/locale-ready; generated free text stays draft content.                                                                                 | forward compatibility + i18n note           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Audit must reuse existing Next route, generator intake, SessionDraft, rule engine, drill catalogs, provider evidence contracts, and official OpenAI guidance; no dependency changes. | stack gate + changed-files review           | `5/5`                   |
| Testing and QA automation                     | `target`     | Audit defines required future unit/schema/adapter/negative/privacy/save-flow tests and passes docs lint now.                                                                         | validation section                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Audit requires payload, output, retry, timeout, rate-limit, token/cost bucket, and raw provider-file exclusion before runtime.                                                       | cost/perf gap rows                          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Future runtime must be disabled by default, fallback-capable, no-secret, no-migration unless approved, and rollback-safe.                                                            | runtime unblock checklist                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - audit only; no route/UI changes now;
  - future runtime must reuse `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, and existing workout save routes;
  - future route must be server-only, protected, owner-scoped, and `no-store`.
- TypeScript/domain:
  - audit must identify typed unions and missing contracts for source flags, goal intent, drill policy, generator kind, schema version, failure class, and prompt bundle ID;
  - unknown values must fail closed or be deferred.
- Supabase/data:
  - no migration in this docs-only audit;
  - future persisted diagnostics/drafts/provider inputs require migration, RLS, generated DB types, export/delete review, and negative-path tests.
- External services:
  - no OpenAI or Garmin calls in this audit;
  - future OpenAI work must refresh official docs, keep secrets server-only, set timeout/retry/disable behavior, and avoid raw prompt/response storage;
  - Garmin remains blocked until provider facts packet resolves.
- UI system:
  - no visual changes now;
  - future question UI requires generator-surface reuse, accessible controls, and screenshot handoff.
- Testing:
  - docs-only validation now;
  - future runtime tests must cover intake normalization, source flags, schema/golden outputs, mocked OpenAI success/failure/timeout, drill rejection, authz, no-secret/no-raw-prompt diagnostics, fallback, and save-flow ownership.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell, `rg`, task-brief linting, `openai-docs` skill, existing app generator tests, existing provider/history tests.
- Evaluate later: `playwright` skill only if future UI/screenshot work starts; security review skill only if AI diagnostics or provider/history data persistence is added.
- Not needed now: Stripe plugin, Garmin/provider credentials, OpenAI API key, live browser screenshots, MCP install/config changes.
- Install/config changes: none unless owner explicitly approves.

Systemic findings:

| Surface                  | Finding                                                                                                                                    | Severity | Recommended Type                 | Owner Decision Needed                        | Follow-Up Brief Path                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| AI app/data readiness    | Current sources are spread across generator intake, profile, goals, drills, activity history, provider evidence, and paused Garmin briefs. | `high`   | `safe process/docs update`       | no, this audit owns the map                  | this brief                                                |
| Drill catalog contract   | Existing generator supports generic drill steps, but 10/10 AI needs stable allowed drill IDs and explanation paths.                        | `high`   | `bounded implementation child`   | yes, approve mapping behavior before runtime | downstream AI adapter child or future drill-catalog child |
| Garmin/provider AI input | Provider evidence and Garmin facts exist only as deferred/blocked contracts, not prompt-ready user context.                                | `high`   | `deferred architecture decision` | yes, resume Garmin/provider packet first     | Garmin facts/data-scope briefs                            |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- Current planned downstream child: `docs/task-briefs/planned/2026-06-23-ai-session-draft-adapter-intake-control-questions-10-10.md`
- Last merged AI workstream: PR `#1230`, commit `36b95993`
- Next planning step: execute this docs-only audit, then decide whether to update the downstream adapter child or start implementation.

## Help/Guide And Support Impact

This docs-only audit requires no Help/Guide update because no visible workflow, label, error state, route, or support action changes.

Future runtime requires Help/Guide/support updates if it changes:

- visible AI labels;
- missing-data prompts;
- generated draft provenance;
- fallback/retry behavior;
- saved-session provenance;
- drill explanation links;
- safe limitations copy;
- support diagnostics.

## Route / Label / Support Surface Sweep

Before completing the audit, run a targeted sweep for:

- `AI session generator`
- `AI swim session generator`
- `SessionDraft`
- `generatorKind`
- `rule_engine_v1`
- `sourceKind`
- `ai_session_v1`
- `training_activity_events`
- `completed_activity_events`
- `provider_activity_evidence`
- `garmin_activity_api`
- `OpenAI`
- `GPT`
- `Responses API`
- `Structured Outputs`
- `prompt`
- `drill`
- `GUIDE_POOLSIDE_DRILLS`
- `courseData`
- `CSS`
- `competition`
- `taper`
- `save to My Swim Sessions`
- `Help/Guide`
- support runbooks

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/`, `docs/runbooks/`, active/planned/blocked/done task briefs, and Help/Guide assertions when relevant.

### Sweep Result

Executed on `2026-06-23`:

```bash
rg -n "AI session generator|AI swim session generator|SessionDraft|generatorKind|rule_engine_v1|sourceKind|ai_session_v1|training_activity_events|completed_activity_events|provider_activity_evidence|garmin_activity_api|OpenAI|GPT|Responses API|Structured Outputs|prompt|drill|GUIDE_POOLSIDE_DRILLS|courseData|CSS|competition|taper|save to My Swim Sessions|Help/Guide" app components lib tests types supabase docs
```

Findings:

- Generator references are concentrated in `/my-library/generator`, `SessionDraft`, `rule_engine_v1`, generator tests, and the existing AI parent/downstream child briefs.
- `ai_session_v1` exists as workout analytics/source-kind vocabulary, not as a model-assisted generator kind.
- Drill references are broad: Poolside guide tracker has stable guide-drill IDs, session generator has generic drill volume/step support, and course lessons have drill content but no AI eligibility adapter.
- `training_activity_events`, `completed_activity_events`, and `provider_activity_evidence` are present in API contracts, types, migrations, tests, and runbooks, but current docs keep them separate from AI generation.
- Garmin appears in provider evidence, blocked/planned provider briefs, workout export tests, and Review Actual negative-path coverage; no result justifies Garmin prompt input now.
- Help/Guide/support impact is future-only because this docs-only audit changes no visible label, route, or recovery behavior.

Required fallout:

- Keep the downstream AI adapter child scoped to single-session generation.
- Add drill-catalog mapping before allowing AI-generated drill IDs.
- Add model-assisted source/generator kind before runtime.
- Keep Garmin/provider/history data deferred until their own briefs unblock them.

## Scope

- Create the app/data readiness audit plan.
- Map current app surfaces to `use_now`, `fallback_only`, `create_new`, `catalog_map_first`, `deferred_history`, `deferred_provider`, and `do_not_use`.
- Define what can be imported from current FreeSwimming sources.
- Define what must be created before runtime.
- Define what Garmin/provider data must remain deferred.
- Define 10/10 gaps for the downstream AI adapter.
- Include scorecard mapping, stack gate, radar, domain granularity, data placement, identity, forward compatibility, Help/Guide impact, route/support sweep, and validation.

## Out Of Scope

- Runtime code.
- OpenAI API calls.
- OpenAI SDK/package changes.
- API keys, env changes, billing setup, or model config.
- Garmin contact, Garmin runtime, provider OAuth, provider imports, FIT parsing, raw storage, or sample fixtures.
- UI changes, screenshots, or visual QA.
- Database migrations.
- Program generation, taper weeks, calendar scheduling, or full periodization.
- Habits work.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Brief defines the docs-only readiness audit and links parent/downstream/Garmin-deferred briefs.
2. Brief lists current app/data surfaces with concrete repo evidence.
3. Brief defines source classifications: `use_now`, `fallback_only`, `create_new`, `catalog_map_first`, `deferred_history`, `deferred_provider`, and `do_not_use`.
4. Brief states which FreeSwimming data can be imported now, which contracts must be built, and which Garmin/provider data stays deferred.
5. Brief includes a required 10/10 gap list for downstream AI runtime.
6. Brief includes scorecard mapping, stack gate, radar, domain granularity, data placement, identity, forward compatibility, Help/Guide impact, route/support sweep, validation, and continuity.
7. Changed brief passes docs-only validation.

## Validation

Docs-only validation required for this in-progress brief:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:docs-only` before PR if this brief is packaged as a PR
- `npm run verify:pre-pr` docs-only lane before PR update if owner asks to package it
- `npm run verify:pre-merge` docs-only lane before merge recommendation if owner asks to merge it

Future runtime validation, outside this audit:

- unit tests for AI intake/source flags/control questions;
- schema/golden tests for model output;
- mocked OpenAI success/failure/timeout tests;
- unknown drill/model/schema/goal/provider/history negative-path tests;
- no-secret/no-raw-prompt/no-raw-response diagnostics tests;
- authz fail-closed route tests;
- preview/edit/save tests proving canonical workout ownership;
- route/label/support sweep;
- screenshot handoff for UI changes;
- full `npm run verify:pre-pr`.

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

`N/A`; this is a docs-only audit brief with no UI, route, runtime, deployment, print/export, or visible behavior changes.

Future UI/runtime changes require screenshot handoff if the generator surface changes visually.

## Constraints

- Do not implement runtime from this audit.
- Do not contact Garmin.
- Do not start Garmin runtime.
- Do not add OpenAI runtime, SDK, env values, or API keys.
- Do not commit secrets, raw prompts, raw responses, raw provider payloads, raw FIT/GPX/TCX files, OAuth tokens, or sensitive history dumps.
- Do not weaken existing `rule_engine_v1` behavior.
- Do not enable program generation.
- Do not auto-save or auto-replan from AI output.
- Do not touch `Ja.docx`.

## Session Continuity And Recovery

Canonical recovery order:

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this brief.
4. Reopen the parent AI brief and downstream adapter child.
5. Reopen `app/api/my-library/generator/session-draft/route.ts`, `lib/generator-intake/shared.ts`, `lib/session-generator-v1/shared.ts`, `lib/session-generator-v1/server.ts`, `lib/athlete-profile/server.ts`, `lib/goals/mvp.ts`, `lib/my-library/training-activity-events.ts`, `lib/my-library/provider-evidence.ts`, `app/course/courseData.ts`, and `lib/guides/guide-poolside.ts`.
6. Keep Garmin/provider work paused unless owner explicitly resumes it.

## Checkpoint Log

- `2026-06-23 | planned | created after owner asked whether to audit current app shape, reused surfaces, new contracts, Garmin import/deferred boundaries, and remaining 10/10 gaps before AI runtime; no runtime, UI, OpenAI, or Garmin work started | next: owner decides whether to execute this docs-only audit or move directly to the downstream AI adapter child`
- `2026-06-23 | in-progress | owner requested execution on branch ai-app-data-readiness-audit-v1; moved this brief to in-progress and completed local app/data audit across generator route, generator intake, SessionDraft/rule-engine validation, Swim Profile, Goals, guide/course drills, training_activity_events, provider evidence, Garmin packets, API docs, and tests; result keeps profile/goals/capability data as use_now, rule_engine_v1 as fallback_only, drill catalogs as catalog_map_first, history as deferred_history, and all Garmin/provider data as deferred_provider | next: validate docs-only lane, commit, push, open PR, monitor CI, and run pre-merge gate`
