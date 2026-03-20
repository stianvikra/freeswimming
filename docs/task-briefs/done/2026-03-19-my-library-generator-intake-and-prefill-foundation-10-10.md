# Task Brief: My Library Generator Intake And Prefill Foundation (10/10)

## Metadata

- `id`: `2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-20`

## Goal

Users can start a later AI session/program generator from a private intake step that preloads trusted My Library context, makes included inputs explicit, and allows safe per-run overrides without mutating the underlying source data.

## Why This Brief Exists

- The My Library foundations now on `main` already cover:
  - athlete profile,
  - training metrics and preferences,
  - personal records,
  - goals, focus, and notes.
- The next highest-value move is no longer more isolated profile data.
- The next highest-value move is to prove that these foundations can become a trustworthy generator input contract.
- This slice is intentionally not:
  - the full session builder,
  - the AI plan generator,
  - the workout step engine,
  - or the weekly program calendar.
- The correct bridge move is:
  - aggregate the right user-owned signals,
  - show clearly what the generator will use,
  - let the swimmer keep/remove/override inputs for this run,
  - and hand off a deterministic payload to later AI generator work.

## Dependencies And Boundaries

- Upstream My Library foundations already on `main`:
  - `docs/task-briefs/done/2026-03-19-my-library-athlete-profile-foundation-10-10.md`
  - `docs/task-briefs/done/2026-03-19-my-library-training-metrics-and-preferences-foundation-10-10.md`
  - `docs/task-briefs/done/2026-03-19-my-library-personal-records-foundation-10-10.md`
  - `docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
- Parent direction still governing the profile side of this work:
  - `docs/task-briefs/done/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md`
- Nearby implementation surfaces and server contracts this slice should reuse rather than replace:
  - `app/my-library/page.tsx`
  - `app/my-library/profile/page.tsx`
  - `app/my-library/training/page.tsx`
  - `components/my-library/profile/AthleteProfileHub.tsx`
  - `components/my-library/training/TrainingContextHub.tsx`
  - `lib/athlete-profile/server.ts`
  - `lib/training-context/server.ts`
- Downstream planned work this slice should unblock:
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
  - `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- This slice is for:
  - canonical generator-intake context assembly,
  - user-reviewed prefill selection,
  - local-only per-run overrides,
  - deterministic handoff to later generator flows.
- This slice is not for:
  - generated workout/program output,
  - builder editing,
  - plan/session persistence,
  - or new profile/training-context source entities.

## Product Model

- `My Library source data`
  - the already-saved user-owned truth:
    - athlete profile,
    - CSS,
    - training preferences,
    - personal records,
    - open goals,
    - active focus.
- `Generator intake snapshot`
  - a read-only aggregated view of generator-relevant source data.
  - this is not a second source of truth.
- `Prefill selection state`
  - local-only controls for deciding which available context to send forward.
- `Per-run overrides`
  - local-only adjustments for this generation attempt only.
  - these must never silently edit My Library source records.
- `Generator handoff payload`
  - a deterministic serialized input object for later AI generator slices.

This is not the same as:

- `My Library editing`
  - saving profile, records, goals, or preferences.
- `Session builder`
  - editing concrete workout/session steps.
- `AI plan generation`
  - requesting, validating, or saving generated output.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                | Evidence                                |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Users can distinguish `generator intake` from `My Library editing`, `session builder`, and `generated output`, with one clear entrypoint and one clear continue action.       | IA review + brief contract + e2e plan   |
| UX flow clarity                               | `target`     | Users can review available context, understand missing context, keep/remove prefills, add per-run overrides, and continue without dead-end states.                            | UX review + e2e                         |
| Visual design quality                         | `target`     | Intake UI fits existing My Library language, avoids generic settings-sprawl, and clearly separates saved source data from one-run overrides.                                  | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Handoff payload is deterministic, source records stay immutable unless edited in their own flows, and deselect/override actions never silently mutate source data.            | unit tests + runtime guards             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user generator intake, not admin/editor workflows.                                                                                 | scope rationale only                    |
| Accessibility (a11y)                          | `target`     | Include/exclude controls, summaries, override fields, and continue/retry actions remain keyboard/touch accessible with correct labels and focus behavior.                     | Playwright + manual QA                  |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: intake aggregation must avoid obvious waterfall or payload regressions on authenticated My Library routes.                                                   | build + perf review                     |
| Data placement and sync boundaries            | `target`     | Canonical source data remains server-owned; intake selection/override state is local-only, explicit, recoverable enough for retry, and never mistaken as saved profile state. | contract review + tests                 |
| Caching and invalidation strategy             | `target`     | Intake reads use deterministic freshness rules, and refresh/re-entry after source-data edits never show stale CSS/PR/goal/focus summaries without explicit reload.            | integration tests + invalidation review |
| Reliability and failure handling              | `target`     | Missing data, offline, auth expiry, and downstream handoff failures produce recoverable non-500 states with no silent context loss or mixed-source confusion.                 | negative-path tests + manual QA         |
| Security and authz                            | `target`     | Generator intake only reads owner-scoped private data, protected reads fail closed (`401/403`), and handoff payload creation cannot expose another user's context.            | API negative-path tests                 |
| Privacy and compliance                        | `target`     | Only generator-relevant private data is included, no unnecessary private text leaks via logs/query params/events, and users can explicitly exclude context blocks.            | scope contract + log review + tests     |
| Content governance                            | `N/A`        | N/A because this slice consumes private user data and introduces no editorial content governance model.                                                                       | scope rationale only                    |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow is introduced in this intake foundation.                                                                                               | scope rationale only                    |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated private route/surface with no public index contract.                                                                                     | scope rationale only                    |
| AI discoverability                            | `N/A`        | N/A because this slice prepares private generator input, not public AI-discoverable pages or metadata.                                                                        | scope rationale only                    |
| Analytics and KPI observability               | `target`     | Intake view, continue, and context-include/remove usage are measurable with safe payloads so we can evaluate which My Library fields are actually used.                       | event contract + analytics assertions   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or checkout behavior changes in this bridge slice.                                                                                       | scope rationale only                    |
| Incident response and support operations      | `supporting` | Supporting only: support/recovery guidance should explain stale or missing source context and how to refresh without exposing private values.                                 | Help/Guide or runbook note              |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, or reporting logic is introduced by generator intake prefill alone.                                                                   | explicit scope rationale                |
| i18n operational readiness                    | `supporting` | Supporting only: labels, units, and source summaries must remain locale-extensible for later multilingual rollout.                                                            | copy/schema review                      |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing Next.js/TypeScript/Supabase/test patterns and avoids new orchestration/state dependencies without strong evidence.                               | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Critical snapshot assembly, include/exclude behavior, override isolation, authz, failure states, and handoff serialization are covered before merge.                          | tests + verify outputs                  |
| Scalability and cost efficiency               | `supporting` | Supporting only: aggregated reads should stay cheap for normal personal use and avoid repeated redundant fetches during one intake session.                                   | query review + scope rationale          |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollout must be safe even if downstream generator routes are not yet fully enabled, with a clear disable/defer path.                                         | rollout notes + release checklist       |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical:
  - existing saved `athlete_profile`, `training_metrics`, `training_preferences`, `personal_records`, `goals`, and `training_focuses` source entities,
  - canonical read models built from those entities for intake display,
  - any downstream accepted generator entities remain out of scope for this slice.
- Local-only:
  - intake include/exclude choices,
  - per-run override fields,
  - one current intake draft,
  - dismissed hints and expanded/collapsed UI state,
  - temporary handoff object before downstream route/step consumes it.
- Sync policy:
  - intake loads from fresh authenticated source reads,
  - local intake changes never write back to My Library source data,
  - explicit refresh/re-entry rehydrates from latest server state,
  - if source entities changed after draft start, stale draft/handoff must be surfaced clearly and be retry-safe.
- Retention and sensitivity:
  - local intake drafts should be short-lived and easy to reset,
  - private values must not be serialized into public URLs or error logs,
  - free-text per-run overrides must avoid analytics/log payload leakage.
- Cache/invalidation:
  - authenticated intake reads should use deterministic fresh-read behavior (`no-store` or equivalent),
  - source-data edits from profile/training flows invalidate related intake reads,
  - local draft reset/continue actions must not leave stale summary badges behind.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable IDs:
  - source entities keep their existing canonical IDs:
    - `athlete_profile.id`
    - `training_metric.id`
    - `training_preferences.id`
    - `personal_record.id`
    - `goal.id`
    - `training_focus.id`
  - generator handoff payload references canonical IDs plus normalized values where needed.
- Human-readable identifiers:
  - display names, goal titles, focus titles, and event labels are editable presentation copy only,
  - they must not be used as the sole key for handoff identity.
- Mutability rules:
  - intake selection and override actions are local-only,
  - source-entity edits must still happen in their owning My Library flows,
  - a handoff draft is ephemeral until a downstream generator slice accepts it.
- Rename vs repurpose:
  - source label/title changes are in-place edits to the same canonical source entity,
  - materially different generator inputs for a new run create a new local intake draft rather than rewriting My Library truth.
- Compatibility contract:
  - downstream generator/builder slices must tolerate missing IDs or omitted context blocks gracefully,
  - if a previously selected source entity is deleted or becomes unavailable, intake must drop it explicitly rather than silently rebinding to another label.
- Observability and repair:
  - unresolved IDs, stale references, and invalid serialized handoff payloads must surface deterministic non-500 recovery states and be measurable in logs/events.

## Scope

- Add a private generator-intake foundation that sits between My Library source data and later generator/builder flows.
- Introduce one authenticated intake surface or first-step route for generator entry.
- Aggregate generator-relevant context from existing My Library sources:
  - athlete profile summary,
  - CSS,
  - training preferences,
  - personal records,
  - open goals,
  - active focus.
- Let users explicitly choose which context blocks are included for this run.
- Allow local-only generator-facing overrides where useful, such as:
  - focus for this run,
  - session/program planning defaults,
  - freeform constraint text for this run only.
- Define a deterministic generator handoff payload that later slices can consume without re-guessing units, identity, or missing-state behavior.
- Keep the intake foundation compatible with both later single-session and later multi-session/program generator work.
- Add analytics/events needed to understand whether prefills are being used or removed in practice.
- If a user-visible intake entrypoint ships, update Help/Guide in the same PR.

## Out Of Scope

- AI generation of sessions or plans.
- Workout step-engine or canonical generated workout persistence.
- Session builder/editor UI.
- Weekly program calendar/completion tracking.
- Saving generated output.
- Editing profile/goals/preferences/personal records inside the intake surface.
- Automatic inclusion of `Notes` as canonical generator prefill in phase 1.
- Public sharing, SEO surfaces, pricing, or admin workflows.

## Acceptance Criteria

1. A signed-in user can open a private generator-intake surface and see which My Library signals are available for prefill now.
2. Intake clearly distinguishes:
   - saved source data,
   - context excluded for this run,
   - and local one-run overrides.
3. Intake can read current athlete profile, CSS, preferences, personal records, open goals, and active focus without requiring any new source-data model.
4. A user can keep/remove available prefills without mutating underlying My Library records.
5. A user can apply local-only per-run overrides without those values silently becoming saved profile/training data.
6. Missing profile/context data produces explicit empty guidance and still allows deterministic continuation where appropriate.
7. Handoff payload uses canonical IDs and normalized values, not mutable labels alone.
8. If selected source data becomes stale/unavailable, the user gets explicit repair/review guidance instead of silent rebinding or silent loss.
9. Unauthorized access to another user's generator intake context is not possible.
10. Analytics/logging for this flow avoid leaking unnecessary private text or source data.
11. `Notes` remain out of default generator-prefill scope in phase 1 unless a later child slice explicitly changes that contract.
12. `npm run lint:briefs`, relevant tests, and `npm run verify:pre-pr` must pass before PR update when implementation starts.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - intake snapshot assembly,
  - include/exclude serialization,
  - override isolation from source data,
  - stale-reference detection,
  - authz negative paths
- targeted e2e for:
  - generator intake load/review/continue flow,
  - empty-state continuation,
  - refresh/retry/error/offline states,
  - distinction between saved My Library data and per-run overrides
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/profile`
  - `http://127.0.0.1:3000/my-library/training`
  - implemented generator-intake route/surface
- Preview:
  - Vercel preview URL from PR checks
- Recommended matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

- Keep this slice clearly separate from session builder and generated-output editing.
- Keep this slice clearly separate from manual session builder and manual program builder flows.
- Do not introduce a second source of truth for profile/training context.
- Do not let local generator overrides silently write back into My Library foundations.
- Keep the input contract useful for both later session generation and later program generation.
- Avoid pulling `Notes` into default canonical prefill until signal quality and UX purpose are explicit.
- Avoid query-parameter leakage of private profile/training data.
- Use existing stack patterns and avoid new dependencies.

## 10/10 Quality Bar (Required For User-Facing Work)

- Users must immediately understand:
  - what data is coming from My Library,
  - what is optional for this run,
  - and what is only a temporary override.
- The intake surface must have explicit:
  - `loading`,
  - `empty`,
  - `error`,
  - `offline`,
  - `retry`,
  - `stale source`,
  - and `continue` states.
- Accessibility must remain strong for mobile and desktop:
  - keyboard navigation,
  - focus management,
  - labeled controls,
  - touch-safe toggle targets,
  - and no ambiguous summary-only controls.
- Visual quality must feel like a real private training-product surface, not a settings dump or developer checklist.
- Business logic must stay deterministic:
  - no silent handoff of deselected context,
  - no silent source mutation from overrides,
  - no silent fallback from one canonical entity to another by matching labels,
  - no unexpected `500` for expected missing-data or auth-failure paths.

## Help/Guide And Operator Training Contract (Required For Workflow Changes)

- Required in the same PR if this slice ships a user-visible intake entrypoint or new recovery copy.
- Help/Guide update must explain:
  - which My Library data can prefill generator intake,
  - that include/exclude and override actions do not edit saved My Library records,
  - how to refresh or repair stale/missing context.
- If implementation remains behind a non-user-visible flag or stub, the PR may mark Help/Guide `N/A` with explicit rationale.

## Checkpoint Log

- `2026-03-19 | planning | created bridge brief to connect shipped My Library foundations with later generator work via a private intake/prefill step; full builder, AI generation, and program flows remain intentionally deferred | next: decide whether to implement this intake as its own route or as the first step of the first generator surface`
- `2026-03-20 | implementation started | moved brief to in-progress and locked route direction to its own private /my-library/generator surface with a deterministic handoff preview, explicit include/exclude controls, local-only overrides, and notes kept out of v1 prefill | next: ship snapshot loader, intake hub UI, auth-protected route, and targeted tests`
- `2026-03-20 | validation checkpoint | shipped /my-library/generator + /api/my-library/generator-intake with aggregated snapshot loading, local draft restore, stale-source review, deterministic handoff preview, analytics, My Library entrypoint, inline help copy, and runbook update in docs/runbooks/core-flow-incident-response.md; targeted unit/e2e and full npm run verify:pre-pr are green | next: commit, open PR, and decide whether to tighten one stretch perf target after the latest second consecutive green perf-budget run`
- `2026-03-20 | ci hardening | split generator-intake shared contracts from server-only loading so webpack production build no longer pulls node-only crypto into the client graph; also hardened the mobile install-prompt done-gate helper with a force-check fallback after label click misses | next: rerun verify:pre-pr, push PR refresh, and recheck required CI`
- `2026-03-20 | perf target decision | hold the next stretch-target tightening step for this slice because it introduces a new authenticated no-store generator-intake route and we want one more green baseline cycle before reducing route-level budget headroom | next: revisit tighten/hold at the next generator-adjacent perf checkpoint`
- `2026-03-20 | eda1d03 (main) | child slice shipped via PR #244 with authenticated /my-library/generator intake, deterministic handoff payload assembly, local-only include/exclude and override controls, My Library entrypoint, analytics, and green local + CI gates including npm run verify:pre-merge | next: use this bridge as the fixed upstream contract for the first AI session/program generator slice`
