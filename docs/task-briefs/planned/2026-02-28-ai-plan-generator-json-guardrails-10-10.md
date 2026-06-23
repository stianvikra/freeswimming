# Task Brief: AI Session And Program Generator GPT-5.5 Readiness (10/10)

## Metadata

- `id`: `2026-02-28-ai-plan-generator-json-guardrails-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-06-23`
- `mode`: `plan only / docs-only app audit and OpenAI docs readiness`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@bca17f5a`
- `audit_status`: `ready`
- `decision`: Use this refreshed brief as the planning contract before any GPT-5.5/OpenAI-backed session or program generation runtime.
- `reason`: The existing app has a protected, deterministic `rule_engine_v1` AI session generator with strong typed validation and canonical workout save flow, but no OpenAI runtime, no Responses API integration, no live model prompts, and no enabled program generation. Official OpenAI docs checked on `2026-06-23` identify GPT-5.5 as the current latest-model guide and point to Responses API, prompt guidance, and Structured Outputs as the right implementation baseline.
- `must_refresh_before_execution_if`: Refresh if OpenAI model docs, Responses API behavior, Structured Outputs schema rules, OpenAI SDK/API versions, model availability/pricing, app generator routes, Program Builder contracts, workout/session step schema, `SessionDraft`, `training_activity_events`, privacy/export/delete routes, Help/Guide surfaces, scorecard categories, or verification lanes change.

## Goal

Define how FreeSwimming should move from the current local session generator toward GPT-5.5-assisted swim session and program generation without creating invalid workouts, leaking sensitive training context, bypassing canonical builders, or hardcoding today's model or schema assumptions.

## Pre-Implementation Owner Explanation

Codex skal lage en oppdatert plan, ikke AI-runtime. Vi sjekker hvordan appen allerede lager og lagrer AI-okt-forslag, og sammenligner det med dagens OpenAI-dokumentasjon for GPT-5.5, Responses API og schema-sikre svar. Det betyr noe fordi AI kan gi bedre okter og treningsprogrammer, men forslagene ma fortsatt valideres, redigeres og lagres som vanlige FreeSwimming-okter/programmer. Utenfor scope er OpenAI-nokler, live API-kall, UI-endringer, database-migrasjoner, Garmin, provider-data, adaptive historikkfeedback og habits-smatterier.

## Product Decision

Recommendation: resume AI generation before Garmin runtime, but do it in a staged way.

Preferred sequence:

1. This refreshed docs-only readiness brief.
2. A future `GPT-5.5 session draft adapter` child that can call OpenAI only for a single swim-session draft and must output the existing `SessionDraft` contract.
3. A future `AI session eval/golden-output hardening` child that compares GPT output against deterministic rule-engine invariants before broader rollout.
4. A future `weekly-pattern program proposal` child that creates program proposals from reviewed session drafts and converges into the canonical Program Builder.
5. A future `full AI program planning` child only after one-session generation, Program Builder editing, Calendar planned-instance sync, and planned-vs-actual history are stable.

Do not start with full multi-month program generation. A full program contains weeks, days, sessions, steps, progression, recovery, taper, and calendar assumptions. That is too much blast radius before GPT-generated single sessions pass schema, coaching-quality, cost, privacy, and save-flow gates.

Do not create a second AI-only planning system. AI output remains a proposal until the user reviews and accepts it into normal FreeSwimming entities.

## Current App Audit

Audited on `2026-06-23` from local repo files.

| Surface                | Current evidence                                                                                                                                                                                                                                                                       | Readiness implication                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generator route        | `app/api/my-library/generator/session-draft/route.ts` is authenticated, returns `no-store` JSON, loads owner-scoped generator intake, validates request input, builds one draft, validates generated output, and returns `401`/`400`/`422` for expected failure paths.                 | Good route boundary for a future AI adapter, but no OpenAI call belongs there until prompt/schema/rate-limit/secret handling are defined.                  |
| Program target         | The same route rejects `targetType = program` with `422`: "Program generation stays deferred in this slice."                                                                                                                                                                           | Program generation is intentionally blocked and must stay blocked until a separate program-proposal child exists.                                          |
| Generator intake       | `lib/generator-intake/shared.ts` builds a versioned handoff from preferences, CSS pace, personal records, goals, capability limits, target type, desired count/minutes, focus text, and constraints; notes are explicitly `notesIncluded: false`.                                      | Strong prompt-input boundary. Future GPT prompts should use this minimized handoff, not query raw My Library entities ad hoc.                              |
| Session draft contract | `lib/session-generator-v1/shared.ts` defines typed inputs, environments, pool lengths, session types, effort presets, strokes, equipment, step categories, duration modes, target modes, repeats, pool units, and `SessionDraft`.                                                      | GPT output should target this contract or a strict schema-derived successor, with unknown values rejected or mapped explicitly.                            |
| Generator kind         | `SessionDraft.generatorKind` is currently only `"rule_engine_v1"`.                                                                                                                                                                                                                     | Future model output needs an explicit generator/source contract, for example a typed model-assisted kind, without weakening existing rule-engine fixtures. |
| Rule engine            | `lib/session-generator-v1/server.ts` builds deterministic drafts, applies open-water guardrails, estimates pace/distance/duration, builds steps/repeats/rests, and validates output.                                                                                                   | Keep this as fallback and invariant oracle. Do not replace it with raw model output.                                                                       |
| Save flow              | `components/my-library/generator/SessionGeneratorPanel.tsx` previews the generated draft and saves through normal workout routes; accepted sessions become My Swim Sessions, not AI-only records.                                                                                      | Correct canonical ownership. GPT output must preserve review/edit/save and not auto-save.                                                                  |
| Tests                  | `tests/unit/session-generator-route.test.ts`, `tests/unit/session-generator-server.test.ts`, `tests/unit/session-generator-panel.test.tsx`, and `tests/e2e/my-library-generator-intake.spec.ts` cover auth, program deferral, generation, validation, preview, save, and reopen flows. | Future GPT work must add model-adapter tests, schema/golden tests, mocked OpenAI failures, and no-secret/no-raw-prompt assertions.                         |
| OpenAI runtime         | `rg` found no OpenAI SDK/API runtime, model config, Responses API calls, live prompts, or OpenAI env handling in app code.                                                                                                                                                             | Runtime starts from zero and needs explicit secret, cost, disable, retry, observability, and fallback design.                                              |

## Official OpenAI Source Baseline

Checked online from official OpenAI documentation on `2026-06-23`:

- Latest model guide / GPT-5.5: https://developers.openai.com/api/docs/guides/latest-model
- GPT-5.5 prompting guide: https://developers.openai.com/api/docs/guides/prompt-guidance
- Responses API guide: https://developers.openai.com/api/docs/guides/responses
- Structured Outputs guide: https://developers.openai.com/api/docs/guides/structured-outputs
- API models reference: https://platform.openai.com/docs/models

Current interpretation:

- GPT-5.5 is the current official latest-model guidance target as of this audit.
- Future implementation should use the Responses API unless an execution-time official-doc refresh gives a better OpenAI-recommended surface.
- Generated sessions/programs must use Structured Outputs or equivalent strict schema enforcement rather than free-form JSON parsing.
- Prompts should be short, outcome-first, and explicit about validation boundaries; older long prompts should not be copied forward unchanged.
- A model ID is a replaceable runtime/config decision, not canonical product identity.
- Implementation must re-check availability, model name, SDK/API shape, limits, pricing/cost exposure, and structured-output support before code starts.

This docs baseline is enough to plan. It is not permission to add live OpenAI calls, keys, model config, SDK dependencies, billing assumptions, prompt logs, or production rollout.

## Target Architecture

### Runtime Shape

Future GPT runtime should be a small adapter behind existing app contracts:

1. Load the existing generator intake handoff.
2. Build a minimized prompt payload from included blocks only.
3. Call OpenAI through a server-only adapter with a disable flag and timeout.
4. Request strict structured output matching a schema-owned draft contract.
5. Normalize and validate the model output using existing FreeSwimming invariants.
6. Return a provisional draft only.
7. Save only after user review through canonical workout/program routes.
8. Fall back to `rule_engine_v1` or a clear retry/error state when model generation fails.

### Model Policy

- First implementation target: `gpt-5.5`, only after execution-time doc refresh confirms availability and the owner approves live OpenAI runtime.
- Model config must live in a typed server-only config boundary.
- Unknown, unavailable, deprecated, or unauthorized model values fail closed to disabled/error state.
- The app must not store raw prompts, raw model responses, API keys, request IDs containing sensitive data, or full training context in product tables.
- Logs and diagnostics may include redacted status, schema version, model label, latency bucket, token/cost bucket, and failure class only.

### Schema Policy

- GPT output must be narrower than product state.
- Required session output: title suggestion, coach rationale, warnings, and steps using the current `SessionDraft` child levels.
- Required program output, future only: program proposal metadata plus weeks, days, sessions, and steps that can be reviewed before Program Builder save.
- Free-text coach rationale is advisory copy, not canonical logic.
- All distances, durations, rest, repeat counts, targets, strokes, equipment, and pool/open-water assumptions must pass deterministic validation before preview/save.

## Domain Granularity Contract

User's mental objects:

- "An AI-suggested swim session I can inspect, edit, and save."
- Later: "An AI-suggested training program I can inspect, edit, schedule, and save."

Canonical objects:

- Current draft object: `SessionDraft` from `lib/session-generator-v1/shared.ts`.
- Current accepted session: normal workout/My Swim Session record saved through existing workout routes.
- Future accepted program: normal Program Builder program and planned workout instances.
- Future history feedback: `training_activity_events`, out of scope here.

Child object levels:

| Level                     | Active/future support                                     | Decision                                                                                       |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Generator intake block    | `view`, future `prompt-input`                             | Use existing handoff and included/omitted block flags; no raw ad hoc queries.                  |
| Session summary           | `view`, future `edit` before save                         | AI can suggest title/rationale/warnings, but save uses canonical workout routes.               |
| Session step              | `view`, future `edit`, `reorder` through existing builder | Every generated step must be visible and valid; no summary-only session acceptance.            |
| Repeat/rest target        | `view`, future `edit`                                     | GPT output must preserve repeat/rest semantics that exports/builders can understand.           |
| Program week/day/session  | future `view`, `edit`, `reorder`                          | Program generation remains blocked until a dedicated child proves Program Builder convergence. |
| Calendar placement        | future `view`, `edit`                                     | No hidden date/taper assumptions; date windows require explicit user input.                    |
| Training-history feedback | `out of scope`                                            | No adaptive replanning or actual-history evaluation in this brief.                             |
| Garmin/provider context   | `out of scope`                                            | Garmin remains paused/blocked by provider facts packet.                                        |

Mature reference surfaces:

- Session generator: `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`.
- Workout persistence/edit: existing My Swim Sessions/workout builder routes.
- Program convergence: Program Builder and `/api/my-library/programs`.
- Step contract: workout/session step model and `SessionDraft` typed helpers.

10/10 granularity rule:

- A GPT session or program cannot claim 10/10 if the review UI, tests, or schema only proves a summary while the trusted object is made of steps, repeats, rests, weeks, days, and sessions.

## Data Placement And Sync Contract

Server-canonical future data:

- accepted workouts/programs only after explicit user save;
- validated generator metadata such as schema version, generator source kind, model label, status, latency bucket, and validation outcome if a future child adds persistence.

Local/provisional data:

- current generated draft preview,
- user edits before save,
- selected generator intake blocks and one-run constraints,
- transient retry/error state.

Not stored in repo or hot product tables:

- OpenAI API keys or raw env values,
- raw prompts,
- raw model responses,
- raw sensitive profile/training context,
- raw provider/Garmin data,
- token-level traces or full request/response bodies.

Sync/conflict policy:

- AI output never mutates canonical workouts/programs until explicit save.
- Regeneration does not overwrite a saved workout/program unless the user explicitly edits and saves the same canonical object.
- Program proposals do not create planned instances until accepted through the Program Builder contract.
- Model failure, invalid schema, unsafe values, or unsupported horizon returns retry/fallback and cannot create canonical data.

Retention and sensitivity:

- Provisional drafts should be short-lived unless explicitly saved.
- Any future persisted generation diagnostics must be redacted and retention-bounded.
- User profile, goals, CSS, capability limits, and program/history context are private training data and must be minimized before prompts.

Cache/invalidation:

- Protected AI generation routes must be dynamic/no-store.
- Accepted workout/program saves invalidate the existing builder/library/calendar reads through their current save paths.

## Identity And Rename Contract

- Canonical stable ID: existing workout/program IDs after user save.
- AI draft identity: transient draft only; not a durable product ID unless a later brief creates a versioned draft table.
- Model ID: runtime/config metadata, never app identity.
- Human-readable titles: editable suggestions only.
- Program week labels and session labels: presentation only; not keys.
- Rename vs repurpose: materially regenerated sessions/programs should remain new proposals unless a future workflow explicitly confirms in-place edit of the same canonical object.
- Compatibility: existing `rule_engine_v1` drafts and tests must keep working while GPT is introduced behind a separate source path or feature flag.
- Repair: unresolved schema versions, unknown model kinds, invalid generated references, and rejected outputs must be measurable and support-visible.

## Forward Compatibility Contract

Future values expected:

- new OpenAI models,
- new Responses API parameters,
- new structured-output schema capabilities,
- new session types, strokes, equipment, step durations, target modes, pool units, planning horizons, program shapes, locales, analytics events, and generator sources.

Automatic behavior:

- New models can be mapped through server config when they support the same schema and tests.
- New optional prompt context can be added as named intake blocks without changing canonical save identity.
- New generated copy can remain draft/advisory when schema-valid.

Explicit mapping required:

- any new model default,
- any new schema version,
- any new generated field that reaches saved workouts/programs,
- any new sport or non-swim program type,
- any adaptive history feedback,
- any provider/Garmin-derived prompt input,
- any new analytics payload value,
- any new visible Help/Guide label.

Safe fallback:

- unknown model/config/schema values fail closed to disabled/error;
- unknown generated enum values are rejected, not coerced silently;
- unsupported program horizons stay blocked;
- provider/Garmin data remains excluded until the Garmin facts packet unblocks it.

Proof required in future runtime:

- schema/golden tests,
- mocked OpenAI success/failure/timeout tests,
- prompt payload minimization tests,
- validation rejection tests for unknown values,
- save-flow tests proving canonical workout/program ownership,
- no-secret/no-raw-prompt logging checks.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this docs-only readiness brief: every `target` category must close at `5/5`.

Critical target categories:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Brief defines staged AI session/program generation and keeps AI proposals inside canonical builder/save flows.                                                                   | product decision + domain contract          | `5/5`                   |
| UX flow clarity                               | `target`     | User states are explicit: intake, generate, preview, invalid, retry/fallback, edit, save, and program-deferred.                                                                  | target architecture + acceptance criteria   | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: future UI must reuse generator/workout/program surfaces, but this docs-only refresh changes no rendered layout.                                                 | UI reference-surface rule                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Model output remains provisional and must pass typed schema plus deterministic invariants before preview/save.                                                                   | schema policy + data contract               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes no admin editor, admin CRUD, publish workflow, or operator edit surface.                                                                          | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future generator UI changes need accessible controls/states and screenshot handoff; no UI changes now.                                                          | future UI rule                              | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Future runtime must define timeout, payload minimization, no-store protected routes, and no core-route JS bloat before code.                                                     | stack gate + target architecture            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Drafts, prompts, model metadata, accepted workouts/programs, and history/provider data have separate ownership.                                                                  | data placement contract                     | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Future AI routes are private/no-store; accepted saves invalidate through existing workout/program save paths.                                                                    | cache/invalidation section                  | `5/5`                   |
| Reliability and failure handling              | `target`     | Timeout, invalid schema, unsupported horizon, model unavailable, and config errors fail closed to retry/fallback with no save.                                                   | runtime shape + safe fallback               | `5/5`                   |
| Security and authz                            | `target`     | Future routes must be authenticated, owner-scoped, server-only for secrets, input-validated, and negative-path tested.                                                           | stack gate + current route audit            | `5/5`                   |
| Privacy and compliance                        | `target`     | Prompt payloads are minimized, raw prompts/responses/secrets are not stored, and provider data stays excluded.                                                                   | data placement + model policy               | `5/5`                   |
| Content governance                            | `target`     | AI-generated coaching copy remains advisory until accepted into canonical workout/program content.                                                                               | schema policy + identity contract           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or operator editability changes in this docs-only readiness slice.                                                                                 | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because generated sessions/programs are private authenticated data and no public crawl surface changes.                                                                      | private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this governs private AI generation, not public AI-discoverable pages, schema markup, or crawlable docs.                                                              | private AI workflow rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Future runtime must define safe events/status buckets for generate, validation fail, fallback, accept, and program deferral.                                                     | acceptance criteria + forward compatibility | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, pricing, invoice, refund, payout, or revenue workflow changes.                                                                             | explicit commerce non-scope rationale       | `N/A`                   |
| Incident response and support operations      | `target`     | Future runtime must include disable flag, redacted diagnostics, failure classes, cost/latency buckets, and rollback path.                                                        | stack radar + support rules                 | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only brief does not mutate finance, reporting, invoices, payouts, refunds, entitlements, or accounting data; model cost is a future ops budget input only. | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Future visible generated labels/errors must use typed labels and locale-ready copy boundaries; generated free text is user draft content.                                        | forward compatibility + schema policy       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next route, TypeScript validation, generator handoff, workout/program save contracts, and official OpenAI docs; no dependency added in this brief.                  | app audit + OpenAI baseline                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only brief passes brief lint; future runtime requires schema/golden, mocked API, negative-path, save-flow, and no-secret tests.                                             | validation section                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Future runtime must bound payload size, retries, output size, timeout, rate limits, and model-cost exposure before release.                                                      | target architecture + acceptance criteria   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | GPT runtime must be disable-able, fallback-capable, config-gated, and rollback-safe before production.                                                                           | model policy + safe fallback                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, workout builder, and Program Builder surfaces;
  - future API route remains protected, server-only, `no-store`, and owner-scoped;
  - no client-side OpenAI calls or exposed API keys.
- TypeScript/domain:
  - keep typed allowlists for every generated enum;
  - use schema validation before preview and before save;
  - treat unknown values as validation failures.
- Supabase/data:
  - no migration in this docs-only brief;
  - future persistence for diagnostics/drafts needs migration, RLS, generated types, export/delete review, and negative-path tests.
- External services:
  - use official OpenAI docs and SDK/API shape at execution time;
  - secrets stay server-only;
  - define timeout, retry, idempotency, rate-limit, cost, observability, and disable behavior before runtime.
- UI system:
  - future visible generator changes require screenshot handoff;
  - preserve existing My Library workspace visual language and accessible controls.
- Testing:
  - docs-only: task-brief lint and diff checks;
  - future runtime: unit/schema/golden tests, mocked OpenAI failure tests, e2e preview/save, authz negative paths, no-secret diagnostics checks, and `verify:pre-pr`.

## Codex Skill / Stack Readiness Radar

Capability audit:

- Available now: local shell, `rg`, repo brief linting, `openai-docs` skill, official OpenAI web fallback, existing app generator tests.
- Not needed now: browser/screenshot tooling, Stripe plugin, Garmin/provider credentials, OpenAI API key, live model calls.
- Install/config changes: none unless owner explicitly approves.

Systemic findings:

| Surface            | Finding                                                                                | Severity | Recommended Type                 | Owner Decision Needed                                  | Follow-Up Brief Path                         |
| ------------------ | -------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| OpenAI runtime     | App has no OpenAI adapter/config/secret boundary today.                                | `high`   | `bounded implementation child`   | yes, approve live OpenAI runtime and model/cost policy | future `GPT-5.5 session draft adapter` brief |
| Program generation | Program target exists in intake but is intentionally rejected by route.                | `high`   | `deferred architecture decision` | yes, choose weekly-pattern vs full-program first child | future AI program proposal brief             |
| Prompt/privacy     | Generator intake is minimized, but raw prompts/responses would be sensitive if stored. | `high`   | `bounded implementation child`   | yes, approve prompt retention/diagnostic policy        | future OpenAI runtime brief                  |

Return path:

- Parent: this planned brief.
- Related done roadmap: `docs/task-briefs/done/2026-05-01-ai-swim-coach-roadmap-alignment-10-10.md`.
- Related runtime foundation: `docs/task-briefs/done/2026-03-20-ai-session-generator-v1-garmin-minimum-draft-review-10-10.md`.
- Garmin/provider path remains paused at `docs/task-briefs/planned/2026-06-23-garmin-provider-facts-collection-packet-v1-10-10.md`.
- Next planning step after this docs refresh: owner decides whether to execute a bounded GPT-5.5 session-draft adapter child or look at small Habits items.

## Help/Guide And Support Impact

Current docs-only refresh:

- No Help/Guide update required because no visible workflow, label, route, or support behavior changes.

Future runtime:

- Update Help/Guide and support runbooks when AI labels, generation failures, fallback behavior, saved-session provenance, program proposal status, or user recovery behavior changes.
- Include user-safe copy for AI limitations, retry/fallback, generated draft review, and no auto-save/no auto-replan.

## Route / Label / Support Surface Sweep

No route/label/support sweep is required for this docs-only refresh.

Before any future runtime/UI child, run a targeted sweep for:

- `AI session generator`, `AI swim session generator`, `generatorKind`, `rule_engine_v1`, `targetType`, `program generation`, `SessionDraft`, `coach rationale`, `OpenAI`, `GPT`, `Responses API`, `Structured Outputs`, `model`, `prompt`, `fallback`, `retry`, `save to My Swim Sessions`, `Program Builder`, `Help/Guide`, and support runbooks.

## Scope

- Refresh this planned AI generator brief for current repo rules.
- Add local app audit of existing generator/intake/save/test surfaces.
- Add official online OpenAI docs baseline for GPT-5.5, Responses API, prompt guidance, and Structured Outputs.
- Define readiness gates for session and program generation.
- Keep future implementation blocked until the owner explicitly asks to execute a bounded child.

## Out Of Scope

- Runtime code.
- OpenAI API calls.
- OpenAI SDK/package changes.
- API keys, env changes, billing setup, or model configuration.
- UI changes or screenshots.
- Database migrations.
- Program Builder runtime changes.
- Garmin/provider contact, Garmin runtime, provider samples, or provider-derived prompt input.
- Retrospective history evaluation or adaptive replanning.
- Habits fixes.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Brief states the current app audit and correctly identifies the deterministic `rule_engine_v1` generator boundary.
2. Brief records the current official OpenAI docs baseline and requires refresh before runtime.
3. Brief defines a staged path from single-session GPT generation to future program proposals.
4. Brief preserves canonical workout/program ownership and rejects AI-only identity.
5. Brief requires Structured Outputs or equivalent strict schema enforcement, plus deterministic validation.
6. Brief blocks raw prompt/response/secrets storage and provider/Garmin prompt input.
7. Brief includes scorecard mapping, app stack gate, radar findings, data placement, identity, domain granularity, and forward compatibility.
8. Changed brief passes task-brief lint and diff checks.

## Validation

Docs-only validation required for this brief refresh:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Optional PR packaging validation:

- `npm run verify:docs-only`
- `npm run verify:pre-pr` docs-only lane before PR update.
- `npm run verify:pre-merge` docs-only lane before merge recommendation.

Future runtime validation:

- schema/golden tests for valid/invalid GPT output,
- mocked OpenAI success/failure/timeout tests,
- no-secret/no-raw-prompt diagnostic tests,
- authz negative-path tests,
- e2e preview/edit/save tests,
- route/label/support sweep,
- screenshot handoff for UI changes,
- full `npm run verify:pre-pr`.

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

`N/A`; this is a docs-only refresh with no UI, runtime route, browser behavior, deployment behavior, print/export rendering, or visible route behavior changes.

No screenshot handoff is required now. Future generator UI changes require screenshot handoff before PR gates.

## Constraints

- Do not add OpenAI runtime from this brief.
- Do not commit API keys, env values, raw prompts, raw model responses, user training context dumps, provider payloads, or secrets.
- Do not weaken existing `rule_engine_v1` tests.
- Do not enable program generation in the existing route until a dedicated program proposal child exists.
- Do not auto-save or auto-replan from model output.
- Do not use Garmin/provider data while Garmin remains paused.
- Do not touch `Ja.docx`.

## Session Continuity And Recovery

Canonical recovery order:

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this brief and the done AI roadmap alignment brief.
4. Reopen `app/api/my-library/generator/session-draft/route.ts`, `lib/generator-intake/shared.ts`, `lib/session-generator-v1/shared.ts`, and `lib/session-generator-v1/server.ts`.
5. Refresh official OpenAI docs before runtime.

## Checkpoint Log

- `2026-03-19 | planning | clarified that this brief owns AI-authored session/program draft generation from generator-intake handoff, while manual workout/program building remains separate and downstream editing/review can happen after generation | next: request owner detail later on first generator scope, goal model, and generated-draft review/edit expectations before implementation starts`
- `2026-03-20 | planning | aligned AI generation requirements to the canonical Garmin-style step model and shared threshold-based swim-zone method, and kept retrospective completed-session analysis explicitly out of this generation brief | next: request owner detail later on whether the first AI slice should generate one session, one week, or a longer program`
- `2026-03-20 | planning | expanded generator UX to require an explicit planning-horizon choice (`session`, `week`, `month`, `three_months`, `six_months`, `twelve_months`, `date_range`, or `to_competition_date`), added calendar-window inputs for date-range planning, and kept competition-date generation on explicit peak/taper intent instead of hidden AI assumptions | next: decide which subset of the full horizon matrix ships first and keep the data contract/builder/history briefs aligned to the same plan-intent metadata`
- `2026-03-20 | planning | added explicit generation-intent expectations for environment, pool length, duration mode, session/program intent, effort presets, drills/kick inclusion, and editable draft-first naming so the first AI session slice can stay Garmin-familiar without forcing raw zone-picking UX on day one | next: land a dedicated AI session generator v1 brief that turns these assumptions into one implementation-ready child slice`
- `2026-05-01 | roadmap alignment | captured the canonical program roadmap from owner coaching notes: manual builder, weekly-pattern builder, and AI-assisted program generation should be different entrypoints into one canonical Program Builder, with full AI program planning deferred until one-session AI, program editing, and planned-vs-actual history are stable | next: keep V1 AI session implementation small and preserve these V2/V3 constraints for later program/history work`
- `2026-06-23 | GPT-5.5 readiness refresh | owner asked to postpone retrospective/Garmin work and look at AI generation of sessions/programs using ChatGPT/GPT-5.5, with app audit and online docs check included; refreshed this planned brief from clean synced main@bca17f5a with current app audit, official OpenAI docs baseline, staged session-before-program recommendation, and explicit no-runtime constraints | next: validate docs-only brief, then wait for owner decision on whether to execute a bounded GPT-5.5 session-draft adapter child or look at small Habits items`
- `2026-06-23 | child planned | owner approved the recommended GPT-5.5 single-session path and added required 10/10 intake details: data collected, import/manual/not-sure control questions, competition/date/form-peak, CSS, specific distance, continuous crawl capacity, weekly/session load, drill volume, and FreeSwimming-known drill policy; created child brief docs/task-briefs/planned/2026-06-23-ai-session-draft-adapter-intake-control-questions-10-10.md as the next implementation contract while keeping runtime, program generation, Garmin/provider data, and Habits out of scope | next: validate docs-only child brief and wait for explicit owner approval before runtime implementation`
- `2026-06-23 | app data audit child done | owner requested execution of docs/task-briefs/done/2026-06-23-ai-session-draft-app-data-readiness-audit-v1-10-10.md before runtime; audit result maps current app sources to use_now/fallback_only/create_new/catalog_map_first/deferred_history/deferred_provider/do_not_use, keeps Garmin/provider/history prompt input deferred, and adds the audit as a prerequisite for the downstream AI adapter child | next: decide whether to execute the AI single-session adapter runtime child`
