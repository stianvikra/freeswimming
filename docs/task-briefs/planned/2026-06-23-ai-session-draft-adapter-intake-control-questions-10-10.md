# Task Brief: AI Session Draft Adapter Intake And Control Questions (10/10)

## Metadata

- `id`: `2026-06-23-ai-session-draft-adapter-intake-control-questions-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- `prerequisite_audit`: `docs/task-briefs/in-progress/2026-06-23-ai-session-draft-app-data-readiness-audit-v1-10-10.md`
- `mode`: `plan only / implementation-ready child brief`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@869e7040`
- `audit_status`: `ready`
- `decision`: Use this child as the implementation contract before any GPT-5.5-backed single-session draft adapter is built.
- `reason`: The parent AI readiness brief is current, the existing app has a deterministic protected `rule_engine_v1` session generator, and the owner clarified that 10/10 AI generation must collect enough swimmer goal/current-state/drill data plus explicit control-question answers before prompting.
- `must_refresh_before_execution_if`: Refresh if OpenAI model/API docs, Responses API behavior, Structured Outputs rules, OpenAI data-retention controls, `SessionDraft`, generator intake, Swim Profile, Goals, course/guide drill catalogs, workout save flow, Help/Guide, scorecard categories, verification lanes, or owner AI/product policy changes.

## Goal

Define the first runtime child for GPT-5.5-assisted single swim-session drafts: collect the right input, ask concise control questions, prompt through a standardized schema-bound adapter, validate output against FreeSwimming rules, and return only a reviewable draft.

## Pre-Implementation Owner Explanation

Codex skal lage en tydelig child-plan for AI som foreslar en enkelt svommeokt. Planen sier hvilke data FreeSwimming kan hente fra profilen, hvilke sporsmal brukeren ma svare pa nar data mangler, og hvordan AI-prompten ma standardiseres.

Hvorfor det betyr noe: AI blir bare nyttig hvis den vet om brukeren trener mot konkurranse, CSS, en bestemt distanse, teknikk, kontinuerlig crawl eller generell progresjon. Uten dette gjetter den, og da kan oktene bli feil.

Utenfor scope er runtime-kode, OpenAI-nokler, live API-kall, UI-endringer, database-migrasjoner, Garmin/provider-data, full programgenerering, auto-lagring og advanced eksterne drills uten FreeSwimming-forklaring.

Fremoverkompatibilitet: nye modeller, maltyper, drills, kursinnhold, session-typer og profile-felter skal enten flyte gjennom typed contracts/catalogs eller kreve eksplisitt mapping med trygg fallback.

## Product Decision

Recommended V1:

1. Build a single-session draft adapter only, not a program generator.
2. Use the existing generator intake and `SessionDraft` review/save flow as the product boundary.
3. Add a dedicated AI intake/control-question contract before prompting.
4. Let the user choose per data field: import from existing FreeSwimming source, enter manually, or mark as not sure.
5. Default drills to FreeSwimming-known course/guide drills only.
6. Reject unknown generated drill names unless mapped to a known drill catalog row or marked as future advanced/pro-only scope by a separate brief.
7. Use `rule_engine_v1` as fallback and invariant oracle, not as something the model replaces.
8. Keep model output provisional until deterministic validation passes and the user saves through existing workout routes.

Do not start with multi-week or multi-month AI plans. Competition peaking, taper, progression, recovery weeks, and calendar placement belong in later program children after one-session generation is safe.

## Official OpenAI Source Baseline

Checked from official OpenAI documentation on `2026-06-23`:

- Latest model / GPT-5.5 guide: https://developers.openai.com/api/docs/guides/latest-model
- Responses API migration/guide surface: https://developers.openai.com/api/docs/guides/migrate-to-responses
- Structured Outputs guide: https://developers.openai.com/api/docs/guides/structured-outputs
- Prompt guidance: https://developers.openai.com/api/docs/guides/prompt-guidance
- Data controls: https://developers.openai.com/api/docs/guides/your-data
- Models reference: https://developers.openai.com/api/docs/models

Implementation interpretation for this child:

- Use GPT-5.5 only if an execution-time docs refresh confirms availability and support for the required schema.
- Use Responses API for future runtime unless the refreshed official docs recommend a different API for this exact workload.
- Use Structured Outputs with strict JSON schema instead of embedding schema-only instructions in free text.
- Keep prompts outcome-first: expected result, constraints, allowed side effects, evidence rules, and output shape.
- Keep static prompt sections first and dynamic swimmer data last when practical for prompt caching.
- Set `store: false` or the current official equivalent in every OpenAI request unless an owner-approved retention policy says otherwise.
- Benchmark accuracy, invalid-output rate, latency, and token/cost bucket before enabling broader rollout.

## Current App Audit

Audited on `2026-06-23` from local repo files:

| Surface          | Evidence                                                                                                                                                                                                                            | Impact for this child                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Protected route  | `app/api/my-library/generator/session-draft/route.ts` authenticates the user, loads owner-scoped intake, returns `no-store`, rejects invalid JSON, rejects program target, validates input, builds one draft, and validates output. | Keep this route boundary or add a sibling adapter behind the same auth/no-store/owner-scoped pattern.                                                   |
| Generator intake | `lib/generator-intake/shared.ts` includes preferences, CSS, personal records, goals, capability limits, selected/omitted blocks, and overrides for target type/session count/minutes/focus/constraints. `notesIncluded` is false.   | Extend through named intake/control-question data, not ad hoc profile queries or raw notes.                                                             |
| Session contract | `lib/session-generator-v1/shared.ts` defines typed environments, pool lengths, session types, effort, strokes, equipment, step categories, duration modes, target modes, repeats, pool units, and `SessionDraft`.                   | Model output must target this contract or a strict successor schema and reject unknown enum values.                                                     |
| Generator source | `SessionDraft.generatorKind` is currently `"rule_engine_v1"` only.                                                                                                                                                                  | Runtime child needs an explicit model-assisted generator kind without weakening existing rule-engine fixtures.                                          |
| Rule engine      | `lib/session-generator-v1/server.ts` applies guardrails, estimates pace/distance/time, builds steps/repeats/rests, and validates output.                                                                                            | Keep rule engine as fallback, comparison baseline, and deterministic invariant oracle.                                                                  |
| Course drills    | `app/course/courseData.ts` defines course lessons with drill titles/steps and lesson experience variants such as `water_drill`.                                                                                                     | AI must prefer FreeSwimming-known drills when generating drill blocks.                                                                                  |
| Guide drills     | `lib/guides/guide-poolside.ts` defines `GUIDE_POOLSIDE_DRILLS` with stable IDs, setup, focus cues, and visual paths. `lib/guides/guide-0-1000m.ts` defines progression sessions.                                                    | V1 drill catalog can use these known entries before any external drill expansion.                                                                       |
| Tests            | `tests/unit/session-generator-route.test.ts` covers auth fail-closed, one owner draft, program deferral, and deterministic validation errors.                                                                                       | Runtime child needs adapter tests, schema/golden tests, mocked OpenAI failures/timeouts, no-raw-prompt diagnostics, and existing route tests preserved. |

## Data Collection Contract

The AI adapter must build a minimal `AiSessionDraftIntake` from named, typed fields. Every field must have an explicit source:

- `imported_from_profile`
- `imported_from_goals`
- `imported_from_generator_intake`
- `entered_manually`
- `not_sure`
- `not_applicable`

No raw profile dump, notes dump, Garmin/provider payload, or free-form training history is allowed.

### Required V1 Fields

| Field                                        | Why it matters                                                                                                    | Source options                                        | Safe fallback                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `goalIntent`                                 | Separates competition peaking, CSS improvement, distance focus, continuous crawl, technique, and general fitness. | open goal import or manual multiple choice            | Ask user; do not infer from vague focus text alone.          |
| `horizon`                                    | Distinguishes next session, weeks to target, date range, and competition date.                                    | goal target date or manual date/weeks                 | If unknown, generate only the next session.                  |
| `competitionDate` and `competitionDistanceM` | Needed for taper/peaking decisions later.                                                                         | goal import or manual                                 | V1 may use as context but cannot build taper/program.        |
| `primaryDistanceM`                           | Needed for distance-specific work such as 400m, 1000m, 1500m, or open-water goal.                                 | personal record/goal import or manual                 | Use general endurance/technique session.                     |
| `currentCssSecondsPer100m`                   | Needed for CSS/threshold targets and send-offs.                                                                   | Swim Profile CSS import or manual                     | Use rule-engine baseline pace and mark CSS unknown.          |
| `bestTimes`                                  | Helps infer race profile without raw history.                                                                     | personal records import or manual                     | Optional; never block next-session generation.               |
| `continuousFreestyleCapacity`                | Prevents giving too-long uninterrupted crawl sets.                                                                | capability limit import or manual distance/time       | Cap long continuous reps and ask for smaller repeats.        |
| `typicalWeeklyMeters`                        | Prevents sudden overload.                                                                                         | manual or future profile/stat import                  | Use conservative volume.                                     |
| `typicalSessionsPerWeek`                     | Helps size one session relative to weekly load.                                                                   | preferences import or manual                          | Use existing preferred weekly count or ask.                  |
| `typicalSessionMinutes`                      | Sizes session duration.                                                                                           | preferences import or manual                          | Use existing generator default or ask.                       |
| `longestRecentSessionMeters`                 | Bounds single-session ambition.                                                                                   | manual or future history import                       | Keep target within conservative range.                       |
| `largestRecentWeekMeters`                    | Bounds overload risk.                                                                                             | manual or future history import                       | Do not exceed typical weekly assumptions.                    |
| `availablePoolLength`                        | Required for pool session structure.                                                                              | preferences import or manual                          | Ask; default only if existing generator default is present.  |
| `environment`                                | Pool/open water changes drill and safety rules.                                                                   | generator input/manual                                | Pool default only if current UI default is explicit.         |
| `equipmentAvailable`                         | Prevents unusable drill/kick/pull work.                                                                           | generator input/manual                                | Generate no-equipment session unless user allows equipment.  |
| `injuryOrLimitNotes`                         | Protects shoulders, breathing limits, medical constraints, and skill gaps.                                        | capability limit import or short manual text          | If sensitive/unclear, keep conservative and advise review.   |
| `drillVolumePreference`                      | Controls how much of the session may be drill work.                                                               | manual multiple choice                                | Moderate only when session type is technique; otherwise low. |
| `drillCatalogPolicy`                         | Ensures drills are explainable in-app.                                                                            | product default plus optional user/admin choice later | V1 uses FreeSwimming-known drills only.                      |

### Optional Later Fields

- recent completed swim actuals from `training_activity_events`,
- planned-vs-actual deltas,
- manually entered RPE/fatigue,
- stroke-rate/stroke-count trends,
- available training days for program proposals,
- open-water conditions,
- coach-assigned drill restrictions,
- locale-specific coaching copy.

These are out of scope for V1 runtime unless a later brief explicitly maps them.

## Control Questions

The intake UI/API contract must support compact questions that can be answered by import, manual entry, or `not sure`.

Recommended V1 question flow:

1. What are you training toward right now?
   - Competition/date target
   - Lower CSS / threshold speed
   - Better at a specific distance
   - Swim farther without stopping
   - Technique improvement
   - General fitness / getting started
2. When should this be better or ready?
   - Next session only
   - In a number of weeks
   - By a specific date
   - Competition date
   - Not sure
3. What is your current level?
   - Import from Swim Profile
   - Enter CSS/best times manually
   - Enter longest continuous crawl distance/time
   - Not sure
4. What can you realistically train now?
   - Import preferences from Swim Profile
   - Enter sessions per week, minutes per session, typical meters per week
   - Not sure; keep it conservative
5. What is the one priority for this session?
   - Technique
   - CSS/threshold
   - Speed
   - Endurance
   - Race pace
   - Recovery
6. How much drill work should this session include?
   - Little
   - Moderate
   - A lot
   - None today
7. Which drills may AI use?
   - FreeSwimming course/guide drills only
   - FreeSwimming drills plus advanced mapped drills
   - No drills

Question rules:

- Do not ask for a field already imported with current, available source evidence unless the user chooses to override it.
- If the user says `not sure`, generation must reduce ambition and explain the assumption in `warnings`.
- Manual free text must be bounded and sanitized like existing `focusText`/`constraintText`.
- Competition/form-peak answers may affect a single session's intensity/recovery choice, but V1 cannot create taper weeks or a full periodization plan.

## Drill Policy

V1 default:

- AI may use only FreeSwimming-known drills from course/guide catalogs that have stable IDs, titles, setup/cues, and an in-app explanation path.
- Generated drill steps must reference a known `drillId`/catalog source in the adapter output schema or be rejected before preview.
- Generic step categories such as `drill`, `kick`, or `pull` remain allowed only when the underlying drill instruction is mapped to an allowed catalog item or the step is a simple non-drill skill block already supported by the session contract.
- Unknown drill names are not silently accepted.
- Advanced/pro external drills require a later catalog expansion brief with Help/Guide impact, safety notes, owner review, and tests.

Rationale:

- The user can inspect how FreeSwimming wants the drill performed.
- The generated workout stays aligned with the course method.
- Support and Help/Guide can explain why the drill appears.
- Future pro/advanced drills can be added through catalog data rather than prompt-only text.

## Prompt Standard

Future runtime must use a versioned prompt bundle, for example `ai_session_draft_prompt_v1`, with these layers:

1. Static system/developer policy:
   - generate one provisional swim session only;
   - do not create a program, taper plan, diagnosis, or medical advice;
   - use only allowed enum values and allowed drill IDs;
   - never auto-save or claim the session is already accepted;
   - return only schema-conforming output.
2. Static FreeSwimming building blocks:
   - allowed `SessionDraft` fields and child step levels;
   - allowed session types, efforts, strokes, equipment, duration modes, target modes, repeat bounds, and drill catalog IDs;
   - deterministic constraints for pool/open-water, volume, rest, repeat counts, and unknown values.
3. Dynamic user goal/intake payload:
   - only the minimized `AiSessionDraftIntake`;
   - included/omitted source block flags;
   - explicit source for every field;
   - manual answers and `not_sure` states.
4. Output contract:
   - Structured Outputs strict JSON schema;
   - model output narrower than saved workout state;
   - title suggestion, rationale, warnings, and validated steps;
   - drill references by stable catalog IDs, not unbounded names.
5. Validator feedback loop:
   - if schema-valid but domain-invalid, the adapter may run one bounded repair attempt with the validation error class only;
   - no raw prompt/response persistence;
   - fallback to `rule_engine_v1` or clear retry/error if invalid after repair.

Prompt text must not duplicate schema definitions that belong in Structured Outputs except for short human-readable outcome and constraint descriptions.

## Target Runtime Shape

Future implementation should ship behind a disabled-by-default server flag until owner-approved:

1. Authenticate and load owner-scoped generator intake.
2. Build the AI intake/control-question payload.
3. Validate minimum answers and source flags.
4. Build the prompt payload from allowed blocks only.
5. Call OpenAI server-side with typed config, timeout, `store: false`, and no client-exposed secret.
6. Require strict structured output.
7. Normalize and validate output against `SessionDraft`/step invariants.
8. Reject unknown enums, unknown drill IDs, impossible distance/time/rest, unsafe volume jumps, unsupported target horizon, and program output.
9. Return a provisional draft with warnings and model metadata buckets only.
10. Save only through the existing user-reviewed workout save flow.

## 10/10 Definition For This Child

The implementation child can claim 10/10 only if:

- the intake collects or explicitly marks unknown the user's goal, horizon, current level, weekly capacity, session capacity, drill preference, drill catalog policy, pool/environment, equipment, and limits;
- competition/form-peak intent is recognized but kept to single-session behavior until a program/taper child exists;
- CSS improvement and specific-distance improvement are distinct goal modes;
- continuous crawl capacity can limit long uninterrupted sets;
- weekly/session load inputs prevent sudden unrealistic volume jumps;
- missing profile data creates questions or conservative assumptions, not silent guesses;
- prompt construction is versioned and standardized;
- OpenAI output uses strict schema and no free-form JSON parsing;
- unknown generated enums/drills are rejected;
- FreeSwimming-known drills are the default and include stable source IDs;
- no raw prompt, raw response, API key, Garmin/provider data, or sensitive free-text profile dump is stored;
- mocked success/failure/timeout/schema-invalid/cost-bucket tests pass;
- existing `rule_engine_v1` behavior and tests remain green.

## Domain Granularity Contract

User's mental object:

- "An AI-suggested swim session I can inspect, adjust, and save."

Canonical objects:

- Provisional draft: future model-assisted draft matching `SessionDraft` or a strict successor.
- Accepted session: existing saved workout/My Swim Session after explicit user save.
- Drill reference: FreeSwimming course/guide drill catalog entry with stable ID.

Child levels:

| Level                    | Active/future support                                     | Decision                                                         |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------- |
| Intake source block      | `view`, future `prompt-input`                             | Existing generator intake remains the source boundary.           |
| Control question answer  | `view`, future `edit` before generate                     | Answers are provisional input, not canonical workout state.      |
| Session summary          | `view`, future `edit` before save                         | AI may suggest title/rationale/warnings only.                    |
| Session step             | `view`, future `edit`, `reorder` through existing builder | Every generated step must be visible and valid.                  |
| Repeat/rest/target       | `view`, future `edit`                                     | Must preserve structured semantics accepted by builders/exports. |
| Drill reference          | `view`, future `edit`/replace                             | Must point to a known FreeSwimming drill catalog ID in V1.       |
| Program week/day/taper   | `out of scope`                                            | Program/taper remains blocked until a dedicated child.           |
| Garmin/provider evidence | `out of scope`                                            | Garmin remains paused.                                           |

Mature reference surfaces:

- `/my-library/generator`
- `GeneratorIntakeHub`
- `SessionGeneratorPanel`
- existing My Swim Sessions/workout builder save flow
- `SessionDraft` helpers in `lib/session-generator-v1/shared.ts`
- course/guide drill catalogs in `app/course/courseData.ts`, `lib/guides/guide-poolside.ts`, and `lib/guides/guide-0-1000m.ts`

## Data Placement And Sync Contract

Server-canonical future data:

- accepted workouts only after explicit save;
- optional redacted generation diagnostics if a future child adds persistence;
- course/guide drill catalog IDs as the source of truth for allowed drills.

Local/provisional data:

- control-question answers before generation;
- generated draft preview;
- user edits before save;
- transient retry/error state.

Not stored:

- OpenAI API keys or raw env values;
- raw prompts;
- raw model responses;
- raw sensitive training/profile dumps;
- Garmin/provider payloads;
- raw notes;
- token-level traces.

Sync/conflict:

- generation never mutates canonical workouts;
- regenerating creates a new provisional draft unless a future workflow explicitly edits the same draft;
- saved workouts keep existing invalidation through workout save routes;
- unknown/invalid schema or unsafe generated values cannot create canonical state.

Cache/invalidation:

- future protected AI route must be dynamic/no-store;
- accepted save invalidates through existing workout/library paths.

Retention:

- provisional drafts should be short-lived unless explicitly saved;
- diagnostics, if persisted later, must be redacted and retention-bounded.

## Identity And Rename Contract

- Canonical stable ID: existing workout ID after user save.
- AI draft identity: transient unless a later draft table is approved.
- Prompt bundle ID: versioned technical identifier, for example `ai_session_draft_prompt_v1`.
- Model ID: runtime/config metadata, not product identity.
- Drill ID: stable FreeSwimming catalog ID; title is human-readable and renameable only through catalog rules.
- Session title: editable suggestion, not stable identity.
- Rename vs repurpose: materially different regenerated sessions are new proposals unless future UX explicitly edits the same saved workout.
- Compatibility: `rule_engine_v1` remains supported and test fixtures must continue to pass.
- Repair: unknown model kinds, schema versions, drill IDs, enum values, or stale catalog references fail closed with support-visible diagnostics.

## Forward Compatibility Contract

Future values expected:

- OpenAI model IDs,
- prompt bundle versions,
- structured-output schema versions,
- session types,
- strokes,
- equipment,
- duration/target modes,
- drill catalogs,
- course lessons,
- guide products,
- goal types,
- competition formats,
- pool units,
- locales,
- analytics payload values,
- support failure classes.

Automatic behavior:

- new FreeSwimming drill catalog rows can become eligible when they expose stable ID, title, setup/cues, safety notes, and allowed-scope metadata;
- new optional intake fields can be added as named blocks with source flags;
- new model IDs can be mapped through typed server config if schema support and tests pass;
- new user-visible copy remains draft/advisory until saved.

Explicit mapping required:

- default model change;
- new schema version;
- external/advanced drill source;
- competition taper/program planning;
- provider/Garmin-derived context;
- adaptive history feedback;
- new analytics event name;
- new Help/Guide label;
- saved workout field expansion.

Safe fallback:

- unknown model/config/schema fails closed to disabled/error;
- unknown generated enum/drill ID is rejected;
- unknown goal type falls back to control question or conservative single-session draft;
- unsupported date horizon does not create a program;
- provider/Garmin context remains excluded.

Proof required in future runtime:

- future-value fixture for unknown goal/drill/model/schema;
- mocked OpenAI success/failure/timeout tests;
- strict schema/golden tests;
- prompt payload minimization tests;
- no-raw-prompt/no-secret diagnostics tests;
- save-flow tests proving canonical workout ownership.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this child brief: every `target` category must close at `5/5`.

Critical target categories:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Single-session AI has a clear job, distinct goal modes, and no program/taper overreach.                                                                                     | goal/control-question contract + scope      | `5/5`                   |
| UX flow clarity                               | `target`     | User can import, enter, or mark unknown for required inputs; no hidden guesses.                                                                                             | control questions + future UI tests         | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: future UI must reuse generator surfaces and screenshot handoff; this brief changes no UI.                                                                  | visual gate                                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Generated output remains provisional, schema-bound, drill-catalog-bound, and deterministically validated before preview/save.                                               | schema/prompt/runtime contract              | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only if future drill catalog/admin content mapping changes; this child does not change admin CRUD.                                                               | admin non-scope + drill catalog policy      | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future control-question UI must use accessible forms/labels; no rendered change now.                                                                       | future UI acceptance criteria               | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Future runtime must set timeout, payload minimization, no-store private route, and no core-route JS bloat.                                                                  | runtime shape + perf acceptance             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Imported/manual/unknown inputs, drafts, prompts, diagnostics, saved workouts, and drills have explicit ownership.                                                           | data contract                               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Future AI route is private/no-store; accepted saves use existing workout invalidation.                                                                                      | cache/invalidation contract                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Timeout, invalid schema, unsafe volume, unknown drill, missing config, and model unavailable fail closed to retry/fallback.                                                 | runtime shape + tests required              | `5/5`                   |
| Security and authz                            | `target`     | Future route remains authenticated, owner-scoped, server-only for secrets, input validated, and negative-path tested.                                                       | route audit + future tests                  | `5/5`                   |
| Privacy and compliance                        | `target`     | Prompt payload is minimized; raw prompts/responses/secrets/provider data are not stored; `store: false` required.                                                           | data controls + diagnostics tests           | `5/5`                   |
| Content governance                            | `target`     | Drills and coaching copy use FreeSwimming catalog/contract; model text remains advisory until user save.                                                                    | drill policy + identity contract            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this planned runtime child changes no admin workflow, status queue, publish action, or operator edit surface.                                                   | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because AI session drafts are private authenticated data and no public metadata/sitemap/crawl surface changes.                                                          | private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this is private generation, not public structured data or crawlable AI-discoverable content.                                                                    | private AI workflow rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Future runtime must define safe event/status buckets for intake started, missing data, generated, invalid, fallback, accepted, and rejected.                                | acceptance criteria + forward compatibility | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no pricing, checkout, entitlement, invoice, payout, refund, or revenue workflow.                                                             | explicit commerce non-scope rationale       | `N/A`                   |
| Incident response and support operations      | `target`     | Future runtime must include disable flag, redacted diagnostics, failure classes, timeout/cost buckets, and fallback path.                                                   | radar + runtime shape                       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not mutate finance, reporting, invoices, payouts, refunds, entitlements, or accounting data; model cost is handled as runtime cost bucket only. | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Future visible labels/errors must be typed/locale-ready; generated free text is user draft content.                                                                         | prompt/control-question contract            | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next route pattern, generator intake, `SessionDraft`, rule engine, drill catalogs, and official OpenAI docs; no dependency until runtime child proves need.  | stack gate + diff review                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Future runtime requires schema/golden, mocked OpenAI, negative-path, drill rejection, payload minimization, save-flow, and no-secret tests.                                 | validation plan                             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Bound payload size, output size, retries, timeout, rate limits, model choice, and token/cost bucket before release.                                                         | runtime contract + observability tests      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Feature is config/flag gated, fallback-capable, disabled by default, and rollback-safe without DB dependency in V1.                                                         | runtime shape + acceptance criteria         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, and existing workout save flow;
  - keep all OpenAI calls server-only;
  - route must be authenticated, owner-scoped, `no-store`, and fail closed;
  - no client OpenAI SDK or key exposure.
- TypeScript/domain:
  - add typed `AiSessionDraftIntake`, source flags, goal intent union, drill policy union, prompt bundle ID, schema version, and model-assisted generator kind;
  - use schema validation before model call and deterministic validation after model output;
  - unknown values reject or ask a control question.
- Supabase/data:
  - V1 should not need a migration if drafts remain transient;
  - any future persisted diagnostics/drafts need migration, RLS, generated types, export/delete review, and negative-path tests.
- External services:
  - official OpenAI docs refresh at execution time;
  - typed server config, no committed secrets, least-privilege env names, timeout, retry cap, `store: false`, and redacted observability.
- UI system:
  - future control-question UI must reuse My Library generator visual language and accessible inputs;
  - screenshot handoff required for UI work before `verify:pre-pr`.
- Testing:
  - unit/domain tests for intake normalization, missing data, and source flags;
  - adapter tests with mocked OpenAI success/failure/timeout/schema invalid;
  - route tests for auth/fail-closed/no-store/program deferral;
  - component/e2e tests for preview/edit/save if UI changes;
  - no-secret/no-raw-prompt logging assertions.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell, `rg`, task-brief linting, `openai-docs` skill, official OpenAI web fallback, existing session generator tests.
- Evaluate later: `playwright` skill for future UI/screenshot handoff, security review skill if runtime starts storing diagnostics or secrets.
- Not needed now: Stripe plugin, Garmin/provider credentials, OpenAI API key, browser screenshots, MCP install/config changes.
- Install/config changes: none unless owner explicitly approves.

Systemic findings:

| Surface        | Finding                                                                                                                                     | Severity | Recommended Type               | Owner Decision Needed                                      | Follow-Up Brief Path                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ---------------------------------------------------------- | ---------------------------------------- |
| AI intake      | Existing intake lacks explicit current-level/control-question fields for competition, CSS, distance, continuous crawl, and weekly capacity. | `high`   | `bounded implementation child` | yes, approve runtime child                                 | this brief                               |
| Drill catalog  | FreeSwimming has known course/guide drills, but session generator output currently has generic drill fields rather than stable drill IDs.   | `high`   | `bounded implementation child` | yes, approve drill catalog mapping behavior                | this brief or future drill-catalog child |
| OpenAI runtime | App has no OpenAI adapter/config/secret boundary today.                                                                                     | `high`   | `bounded implementation child` | yes, approve live runtime, model, cost, and privacy policy | this brief                               |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- Current status: child planned, no runtime active.
- Garmin/provider path remains paused and out of scope.
- Next planning step after this docs slice: owner explicitly says execute/build/implement this child before any runtime code begins.

## Help/Guide And Support Impact

This docs-only planning slice requires no Help/Guide update.

Future runtime requires Help/Guide/support updates if it changes:

- visible AI labels,
- generated draft provenance,
- missing-data prompts,
- fallback/retry behavior,
- drill explanation links,
- saved-session provenance,
- user recovery copy,
- support diagnostics.

## Route / Label / Support Surface Sweep

Before future runtime, run a targeted sweep for:

- `AI session generator`
- `SessionDraft`
- `generatorKind`
- `rule_engine_v1`
- `targetType`
- `OpenAI`
- `GPT`
- `Responses API`
- `Structured Outputs`
- `prompt`
- `store: false`
- `drill`
- `guide_drill`
- `course_lesson`
- `GUIDE_POOLSIDE_DRILLS`
- `CSS`
- `competition`
- `taper`
- `save to My Swim Sessions`
- `Help/Guide`
- support runbooks

Surfaces to check: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, planned/in-progress/done task briefs, and Help/Guide assertions when relevant.

## Scope

- Create the implementation-ready AI single-session child brief.
- Define data collected by import/manual/unknown source.
- Define user control questions and multiple-choice import behavior.
- Define goal modes: competition/form peak, CSS, specific distance, continuous crawl, technique, general fitness.
- Define current-state metrics: CSS, best times, continuous crawl capacity, weekly meters, largest recent week, sessions/week, minutes/session, longest session, pool/environment, equipment, limits.
- Define drill policy: FreeSwimming course/guide drills first; unknown external drills rejected.
- Define standardized prompt/runtime/schema contract.
- Define 10/10 gates, scorecard mapping, stack gate, domain granularity, data placement, identity, forward compatibility, Help/Guide impact, and validation.

## Out Of Scope

- Runtime code.
- OpenAI API calls.
- OpenAI SDK/package changes.
- API keys, env changes, billing setup, or model config.
- UI changes or screenshots.
- Database migrations.
- Program generation, competition taper weeks, calendar scheduling, or full periodization.
- Garmin/provider contact, runtime, samples, or prompt input.
- Retrospective history/adaptive replanning.
- Habits work.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Brief defines exactly what data AI may collect from FreeSwimming sources and control questions.
2. Brief includes import/manual/not-sure source behavior for each important field.
3. Brief distinguishes competition/form peak, CSS improvement, specific distance, continuous crawl, technique, and general fitness goals.
4. Brief requires capacity/load questions: weekly meters, longest week, sessions/week, minutes/session, longest session, continuous crawl capacity.
5. Brief requires a FreeSwimming-known drill catalog default and rejects unknown generated drill names/IDs.
6. Brief standardizes prompt layers, schema use, validator feedback, and `store: false`.
7. Brief keeps output to one provisional session draft and blocks program/taper/runtime overreach.
8. Brief includes scorecard mapping, app stack gate, radar findings, domain granularity, data placement, identity, forward compatibility, Help/Guide impact, route/support sweep, and validation.
9. Changed briefs pass docs-only validation.

## Validation

Docs-only validation required for this planning slice:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:docs-only`
- `npm run verify:pre-pr` docs-only lane before PR update
- `npm run verify:pre-merge` docs-only lane before merge recommendation

Future runtime validation:

- unit tests for intake/source flags/control-question normalization;
- schema/golden tests for valid/invalid GPT output;
- mocked OpenAI success/failure/timeout tests;
- no-secret/no-raw-prompt/no-raw-response diagnostic tests;
- unknown drill/model/schema/goal negative-path tests;
- authz fail-closed route tests;
- preview/edit/save tests proving canonical workout ownership;
- route/label/support sweep;
- screenshot handoff for UI changes;
- full `npm run verify:pre-pr`.

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

`N/A`; this is a docs-only planning brief with no UI, route, runtime, deployment, print/export, or visible behavior changes.

Future UI/runtime changes require screenshot handoff if the generator surface changes visually.

## Constraints

- Do not add OpenAI runtime from this docs-only brief.
- Do not commit API keys, env values, raw prompts, raw model responses, user training context dumps, provider payloads, or secrets.
- Do not weaken existing `rule_engine_v1` tests.
- Do not enable program generation in the existing route.
- Do not auto-save or auto-replan from model output.
- Do not use Garmin/provider data while Garmin remains paused.
- Do not invent drill names that the user cannot inspect in FreeSwimming.
- Do not touch `Ja.docx`.

## Session Continuity And Recovery

Canonical recovery order:

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this brief and parent AI brief.
4. Reopen `app/api/my-library/generator/session-draft/route.ts`, `lib/generator-intake/shared.ts`, `lib/session-generator-v1/shared.ts`, `lib/session-generator-v1/server.ts`, `app/course/courseData.ts`, and `lib/guides/guide-poolside.ts`.
5. Refresh official OpenAI docs before runtime.

## Checkpoint Log

- `2026-06-23 | planned | created after owner clarified that 10/10 AI session generation must collect goal/current-state/load/drill data, offer import/manual/not-sure control-question choices, standardize prompting, use FreeSwimming-known drills first, and keep GPT runtime blocked until a bounded single-session child is explicitly executed | next: validate docs-only brief, open PR, then wait for owner approval before runtime implementation`
- `2026-06-23 | prerequisite audit in progress | linked docs/task-briefs/in-progress/2026-06-23-ai-session-draft-app-data-readiness-audit-v1-10-10.md after owner requested an app/data readiness audit before runtime; downstream implementation must read that audit result first and keep Garmin/provider/history data deferred unless a later child explicitly unblocks it | next: wait for audit PR to close before AI adapter runtime execution`
