# Task Brief: AW-006 Program Builder Route Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-program-builder-route-feedback-semantics-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-program-builder-route-feedback-semantics`
- `execution_mode`: `implemented through targeted validation, screenshot handoff, pre-PR verification, CI, pre-merge verification, and PR #862 merge`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@289ea86`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#859` and repo-managed closeout PR `#861` are merged, `main` is clean at `289ea86`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `ProgramBuilderHub` still renders route-level schema/load/missing-workout/action/empty guidance as local cards while the same surface already has an accessible export feedback reference.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `ProgramBuilderHub`, program library snapshot shape, program save/export routes, workout assignment behavior, Help/Guide rules, screenshot handoff rules, or verification lanes change before execution.

## Goal

Make Program Builder route-level feedback use a consistent program-local feedback contract while preserving program data, planner behavior, and export behavior.

## Pre-Implementation Owner Explanation

Jeg skal rydde beskjedene i Program Builder. Det betyr at meldinger som "program kunne ikke lastes", "mangler treningsokt", "lagret" og "kunne ikke lagre" skal se og oppfore seg mer likt resten av My Library. Det betyr noe fordi brukeren raskere forstar om noe er lagret, mangler eller krever handling.

Utenfor scope er programdata, uke/dag-plassering, lagringspayload, PDF, Garmin JSON, eksport-ruter, innlogging, betaling, API-er, analytics, Help/Guide og supportflyt.

Fremoverkompatibilitet: nye programmer og nye manglende workout-referanser skal arve samme feedback-monter via eksisterende snapshot/state. Helt nye program-workflow-stater eller eksporttyper krever eksplisitt mapping og test for release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/programs/[programId]` keeps the same program-builder job while route-level feedback becomes easier to scan and distinguish.                                       | screenshot handoff + focused tests           | `5/5`                   |
| UX flow clarity                               | `target`     | Schema warning, load error, missing scheduled workouts, save error/success, and no-loaded-program guidance clearly state the next safe action.                                 | Testing Library assertions + screenshots     | `5/5`                   |
| Visual design quality                         | `target`     | Changed feedback uses a single program-local shell, stable spacing, no nested cards, and no text overflow on mobile/desktop.                                                   | after/reference screenshots + diff review    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Save, reset, week/day assignment, recent-program updates, missing-workout detection, and export preview/download/open behavior remain unchanged.                               | focused tests + payload assertions           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, admin CRUD, publishing workflow, operator queue, or admin action surface.                                                      | explicit admin-editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic feedback uses appropriate role/live semantics, static empty guidance is not noisy, and actions keep named controls/described state.                                    | Testing Library role/aria assertions         | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                             | Testing Library role/aria assertions         | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, fetch, polling, heavy client state, or route payload growth beyond existing component markup/classes.                                              | dependency diff + broad gate evidence later  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical programs/workouts and client-local draft/editor state stay unchanged; no new storage or sync boundary is introduced.                                          | data-boundary review + unchanged payloads    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, fetch cache, revalidation, invalidation trigger, CDN behavior, or stale-data policy.                                       | explicit cache scope rationale               | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable unavailable/missing/load/save states remain visible and do not hide the editor, remove retry paths, or create dead-end actions.                                    | unit tests + visual review                   | `5/5`                   |
| Security and authz                            | `target`     | Existing member route/API auth boundaries remain untouched, and no UI copy exposes protected IDs, provider diagnostics, raw errors, or secrets.                                | changed-files review + route boundary review | `5/5`                   |
| Privacy and compliance                        | `target`     | Changed copy must not expose user IDs, program IDs beyond existing route context, raw API errors, provider diagnostics, health data beyond visible editor content, or secrets. | copy/error review                            | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/state inventory record the approved slice without stale active references.                                               | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, mutation, Help/Guide action, operator recovery behavior, or editability path.                                                | explicit admin-workflow scope rationale      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated member tool surface and changes no metadata, sitemap, robots, canonical URL, structured data, or public indexability contract.            | explicit SEO scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                     | explicit AI-discoverability scope rationale  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no event taxonomy, analytics payload, dashboard, KPI threshold, or event persistence.                                                                 | explicit analytics scope rationale           | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, product access, subscription, invoice, refund, or revenue workflow.                                        | explicit commerce scope rationale            | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, runbook procedure, support escalation, or on-call flow.                  | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data.        | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English strings stay route-local and layout-safe so future locale work can map program-builder copy deliberately.                                     | copy/layout review                           | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `ProgramBuilderHub`, the existing export-feedback reference, React/TypeScript, Tailwind, and local program-builder tests; add no dependency or app-wide primitive.       | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/refresh focused unit coverage, run targeted program-builder tests, run brief/quality gates, then stop at screenshot handoff before `verify:pre-pr`.                        | test output + screenshot artifacts           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: local feedback consolidation adds no service call, storage, job, polling, or traffic-dependent cost.                                                          | implementation review                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migrations, env changes, dependency changes, workflows, provider settings, or feature flags are required.               | git diff + validation evidence               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep work inside the existing client-owned Program Builder member route surface.
  - Reuse the local `ProgramExportFeedback` semantics as the mature reference, but do not change export behavior.
  - Preserve the server component route boundary in `app/my-library/programs/[programId]/page.tsx`.
  - No route handler, server action, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve `ProgramLibrarySnapshot`, `ProgramEditorRecord`, `ProgramAssignment`, `WorkoutSummary`, program IDs, workout IDs, and week/day assignment contracts.
  - No parser, validation, save API, export adapter, filename, or error model changes.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, storage, index, or Supabase query change.
- External services/tools:
  - No Stripe, Supabase provider config, email, analytics, webhook, secret, SDK, retry, or idempotency behavior changes.
- UI system:
  - Reference surface is the already-shipped Program Builder export feedback semantics in `ProgramBuilderHub`.
  - Keep feedback program-local; do not promote a shared app-wide member notice primitive in this slice.
  - `docs/design/session-step-surface-contract.md` is reviewed as N/A for this slice because no session-step, manual pool session builder, `Edit`/`Rearrange`/`View` workout step surface, or shared renderer is changed.
  - Screenshot handoff type is `after/reference` for `/my-library/programs/[programId]` desktop and mobile states because a true before capture would require reverting the active worktree; the reference is the already-shipped Program Builder export feedback on the same surface.
- Testing:
  - Extend `tests/unit/program-builder-hub.test.tsx` for role/aria/tone semantics and unchanged save/export payload behavior.
  - Run targeted program-builder unit tests and route/label/support sweep before screenshots.

## Data Placement And Sync Contract

- Server-canonical data:
  - `programs` remains canonical for saved program title/week/day assignment state.
  - saved workouts remain canonical for assignable scheduled workout summaries.
- Local data:
  - Existing in-memory React draft state remains local until save.
  - This slice introduces no localStorage/sessionStorage key, cookie, optimistic server state, or persisted local draft.
- Sync policy:
  - Existing save `PATCH`, route refresh assumptions, recent-program summary updates, and export preview fetch behavior remain unchanged.
  - Missing scheduled workout references continue to be derived from `ProgramLibrarySnapshot.missingWorkoutIds`.
- Retention and sensitivity:
  - No new user data, secret, provider diagnostic, or health detail is stored or logged.
- Cache/invalidation:
  - No route/data cache or invalidation behavior changes.

## Identity And Rename Contract

No identity changes. Existing stable program IDs, workout IDs, week IDs, assignment IDs, and export filenames remain the canonical identifiers. Titles remain human-readable and renameable through existing flows only. This slice adds no slug, alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: Program Builder route-level feedback presentation for schema unavailable, load error, missing scheduled workouts, action success/error, and no-loaded-program guidance.
  - Not touched: route params, program APIs, export APIs, workout assignment model, analytics, Help/Guide, support runbooks, or product catalog behavior.
- Source of truth:
  - Existing `ProgramLibrarySnapshot` and component state remain the source of truth.
  - Feedback tone is derived from existing UI state (`schemaReady`, `loadError`, `missingWorkoutIds`, `error`, `success`, `selectedProgramMissing`, `savedProgram`), not hardcoded program/workout IDs.
- Additive behavior:
  - New saved programs, missing workout references, and existing save outcomes should automatically use the same feedback shell when they flow through `ProgramBuilderHub`.
  - Additional copy inside the same warning/error/success/empty shape can reuse the program-local feedback helper without adding a new primitive.
- Explicit mapping requirements:
  - New program workflow states, export formats, planner modes, workout source types, analytics events, support procedures, or Help/Guide claims require explicit code/test/docs updates before release.
- Unknown or deprecated values:
  - Unknown program/workout values must keep existing safe generic copy, disabled actions, or route-owned warnings; this slice must not infer success from unknown payloads.
- Test/evidence:
  - Focused tests cover current feedback semantics and unchanged save/export behavior.
  - Route/label/support sweep includes `ProgramBuilderHub`, `ProgramBuilderFeedback`, `programLibrary.loadError`, `missingWorkoutIds`, `selectedProgramMissing`, and `/my-library/programs`.

## Help / Guide Impact

N/A with rationale: this changes presentation only for existing Program Builder route feedback. It does not rename routes, workflow actions, recovery behavior, Help/Guide content, support procedures, admin instructions, API behavior, export behavior, or assignment rules.

## Route / Label / Support Surface Sweep

Required because member workflow feedback and visible action guidance are touched.

- Identifiers searched:
  - `ProgramBuilderHub`
  - `ProgramBuilderFeedback`
  - `programLibrary.loadError`
  - `missingWorkoutIds`
  - `selectedProgramMissing`
  - `No saved program is open here`
  - `Program saved`
  - `/my-library/programs`
- Surfaces to check:
  - `components/my-library/programs/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `ProgramBuilderHub` presentation only,
  - focused program-builder tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/state inventory,
  - no API contracts, Help/Guide, support runbook, analytics, storage, Supabase, route, save, assignment, or export behavior fallout unless implementation discovers a direct contradiction.

## Scope

- `components/my-library/programs/ProgramBuilderHub.tsx`
- `tests/unit/program-builder-hub.test.tsx`
- canonical AW-006 queue and notice/state inventory updates
- after/reference screenshot handoff artifacts

## Out Of Scope

- Program or workout API changes.
- Supabase migrations, RLS, generated DB type, storage, or route handler changes.
- Program save payload, week/day assignment logic, recent-program summary behavior, or missing-workout derivation.
- Program export route, generated JSON/PDF schema, generated filename, PDF/print layout, popup behavior, or object URL cleanup.
- Workout data model, Workout Builder, Dryland, My Routines, analytics taxonomy, Help/Guide, support procedures, admin workflow, commerce, finance, auth, dependencies, configs, workflows, or broad app-wide feedback primitives.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `ProgramBuilderHub` schema, load, missing-workout, save action, and no-loaded-program feedback use a program-local feedback contract with correct tone semantics.
2. Static empty guidance does not announce as an assertive error.
3. Dynamic load/save errors are accessible and preserve the existing copy and safe next action.
4. Existing save, reset, assignment, export preview, JSON download, and PDF open behavior remains unchanged.
5. No program API, workout API, Supabase, analytics, Help/Guide, support, route, dependency, or export artifact change is introduced.
6. Canonical AW-006 queue and notice/state inventory record this active slice without stale active references.
7. Targeted tests and screenshot handoff evidence are complete.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/program-builder-hub.test.tsx`
- `npm run typecheck`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for Program Builder feedback identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
- `docs/runbooks/ui-debug-hypothesis-and-handoff.md` path used for screenshot setup; artifact-level validation inspected the actual captured PNG artifacts under `output/program-builder-route-feedback-20260526-143111`.
- Export copy/test updates are limited to Program Builder route preview/status text; no actual consumed artifact schema, JSON payload, PDF route, generated filename, or print HTML output changes are included.
- Screenshot capture uses a temporary local harness rendering `ProgramBuilderHub` with mock data because local dev-login is blocked by the Supabase egress guard when `.env.local` points at a cloud project; no `FS_ALLOW_PROD_SUPABASE=1` capture or Supabase write is used.
- Owner waived new screenshots after the follow-up copy correction from internal `canonical program` language to user-facing saved-program language.
- Owner screenshot approval stop: stop after screenshot handoff and wait for owner approval before `npm run verify:pre-pr`, PR creation/update, CI monitoring, or `npm run verify:pre-merge`.

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.

## Checkpoint Log

- `2026-05-26 | in-progress | started from clean main@289ea86 after Dryland Session Editor Feedback Semantics #859 and closeout #861; owner approved Program Builder Route Feedback Semantics end-to-end and explicitly said stop for screenshots | next: implement feedback semantics, run targeted validation, capture screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-05-26 | screenshot-stop | implemented Program Builder route feedback semantics, targeted tests/typecheck/quality/brief/diff/sweep checks passed, and after/reference screenshots were captured in output/program-builder-route-feedback-20260526-143111 | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | copy-correction | replaced user-facing route feedback copy that said canonical program with saved-program language; owner explicitly waived new screenshots after this copy-only correction | next: rerun targeted validation and continue to npm run verify:pre-pr`
- `2026-05-26 | merged | PR #862 merged as 4ea9a49 after local full verify, required CI checks, and pre-merge verification passed | next: complete repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-05-26`
- `merged_pr`: `#862`
- `squash_commit`: `4ea9a49`
- `result`: Closed AW-006 Program Builder Route Feedback Semantics by making Program Builder route-level warning/error/success/empty feedback use a consistent program-local semantic shell while preserving program data, save payloads, assignment behavior, exports, auth, analytics, Help/Guide, and support behavior.
- `validation`: `./node_modules/.bin/vitest run tests/unit/program-builder-hub.test.tsx` pass; `npm run typecheck` pass; `npm run lint:briefs:all` pass; `npm run lint:quality-gates` pass; `git diff --check` pass; targeted route/label/support sweep pass; screenshot artifacts captured under `output/program-builder-route-feedback-20260526-143111` with owner waiver for copy-only recapture; `npm run verify:pre-pr` pass at `artifacts/test-runs/20260526-152248/verify.log`; required CI checks `verify`, `Analyze (javascript-typescript)`, and `size-check` pass on PR #862; `npm run verify:pre-merge` pass with marker `artifacts/verify-pre-merge/20260526-134638.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility, Reliability and failure handling, Testing and QA automation, and DevOps and rollback readiness.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #862 kept the slice scoped to Program Builder route feedback and left routes, APIs, exports, Help/Guide, and support behavior unchanged.                                                    | None.        |
| UX flow clarity                               | `5/5`          | Save/load/missing/empty route feedback now uses clear warning/error/success/empty language, including the owner-requested saved-program copy correction.                                       | None.        |
| Visual design quality                         | `5/5`          | Screenshot artifacts in `output/program-builder-route-feedback-20260526-143111` captured after/reference desktop and mobile states; owner waived recapture after copy-only wording correction. | None.        |
| Business logic correctness and data integrity | `5/5`          | Focused unit tests preserved save payload behavior and E2E coverage preserved saved-program export behavior and internal canonical state attributes.                                           | None.        |
| Accessibility (a11y)                          | `5/5`          | Unit tests assert `role`, `aria-live`, `aria-atomic`, and tone semantics for error, warning, success, and static empty states.                                                                 | None.        |
| Accessibility                                 | `5/5`          | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility evidence.                                                                                        | None.        |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency, network request, route, export artifact, or large asset was added; full verify/perf lane passed.                                                                            | None.        |
| Data placement and sync boundaries            | `5/5`          | Brief and implementation keep existing `ProgramLibrarySnapshot`, component state, save `PATCH`, and refresh boundaries as the source of truth.                                                 | None.        |
| Reliability and failure handling              | `5/5`          | Schema unavailable, load error, missing workouts, save error, save success, selected-missing, and empty states have deterministic feedback tests.                                              | None.        |
| Security and authz                            | `5/5`          | No auth, API route, Supabase, RLS, storage, token, or permission behavior changed; CI and pre-merge passed.                                                                                    | None.        |
| Privacy and compliance                        | `5/5`          | No new user data, logs, exports, analytics values, provider diagnostics, or persisted fields were introduced.                                                                                  | None.        |
| Content governance                            | `5/5`          | User-facing copy was corrected from internal canonical language to saved-program language, and Help/Guide impact stayed N/A with rationale.                                                    | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Used a program-local helper and existing React/TypeScript/Tailwind patterns with no new dependencies or shared primitive churn.                                                                | None.        |
| Testing and QA automation                     | `5/5`          | Targeted unit/E2E updates, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` all passed.                                                                                    | None.        |
| DevOps and rollback readiness                 | `5/5`          | Single scoped PR #862 merged cleanly on current `main`; rollback is the squash commit `4ea9a49`.                                                                                               | None.        |
