# Task Brief: AW-006 My Swim Sessions Builder Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-my-swim-sessions-builder-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-25`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-swim-sessions-builder-feedback-semantics`
- `execution_mode`: `end-to-end implementation after owner approved the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-25`
- `base`: `main@2e86a43`
- `audit_status`: `ready`
- `decision`: Execute a bounded member/My Swim Sessions builder feedback semantics slice on `/my-library/workouts`.
- `reason`: PR `#838` and repo-managed closeout PR `#839` are merged, `main` is clean at `2e86a43`, `npm run post-merge:preflight` was reported green, and the owner approved this slice after a fresh queue/design/code re-audit found `WorkoutBuilderHub` still rendering schema warning, load error, action error, action success, local-draft recovery, empty, and missing-session feedback with repeated route-local markup while adjacent member surfaces now have clearer accessible feedback contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/workouts`, `WorkoutBuilderHub`, workout storage/API contracts, manual local draft behavior, Workout Editor export behavior, My Library reference surfaces, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make My Swim Sessions builder schema/load/action/local-draft/empty feedback consistent, accessible, and easy to extend without changing workout data, APIs, local drafts, exports, editor behavior, analytics, routes, Help/Guide, or support procedures.

## Pre-Implementation Owner Explanation

Jeg skal rydde opp i meldingene paa My Swim Sessions-byggeren naar lagring synker, lasting feiler, handlinger lykkes/feiler, lokale utkast gjenopprettes, eller listen er tom. Det betyr noe fordi brukeren raskere forstaar hva som skjedde og hva som er trygt neste steg, og skjermlesere faar riktig status/feil-semantikk. Utenfor scope er workout-data, API-er, eksport/PDF, editor-logikk, generator-route, lagringsregler, analytics, Help/Guide og bred member notice-primitive.

Fremoverkompatibilitet: feedback skal foelge eksisterende `WorkoutLibrarySnapshot`, builder-state og typed workout rows, slik at nye oekter og flere rows bruker samme generiske feedback-visning. Nye workflow-handlinger, feedback-toner, eksportformater eller recovery-regler krever eksplisitt mapping og test foer release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Privacy and compliance
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                           | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/workouts` remains the canonical private My Swim Sessions builder/list surface; feedback stays attached to existing save/delete/local-draft/empty jobs.          | focused tests + screenshot handoff                 | `5/5`                   |
| UX flow clarity                               | `target`     | Schema warning, load error, action error, action success, local-draft recovery, first-run empty, and missing-session states are clear and not dead ends.                     | focused tests + screenshot handoff                 | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses consistent member-library styling, stable spacing, readable contrast, and no broad workout builder/editor redesign or layout churn.                            | screenshot handoff + class review                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Workout save/delete/bulk-delete payloads, local draft persistence, selected workout handling, recent-workout ordering, and editor/export handoff remain unchanged.           | focused unit tests + diff review                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing, notes, QR, or operator editing workflow.                                                             | changed-files review                               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | User-action success/recovery feedback uses polite status semantics; actionable errors use alert/assertive semantics; static empty states are not noisy live regions.         | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                           | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route fetch, polling loop, or heavy client library is added; `/my-library/workouts` keeps existing route budgets.                     | dependency diff + broad gates                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical saved workouts and local-only manual drafts remain in existing boundaries; this slice adds only transient presentation markup/state helpers.                | data contract review + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, mutation response, revalidation, or invalidation behavior changes.                                                             | cache scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Failure messages keep retry or recovery visible where existing flows allow it and do not hide the current draft, selected workout, list, or delete confirmation context.     | focused failure tests                              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and owner-scoped workout APIs remain unchanged; feedback exposes no raw diagnostics, secrets, or cross-user details.                | diff review + route-boundary review                | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include private workout values beyond existing user-entered UI, user identifiers, entitlement details, raw provider diagnostics, secrets, or env values.   | copy/error review                                  | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active My Swim Sessions builder feedback semantics slice.                                                | docs diff                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                      | explicit admin workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this touches a protected/member utility UI and changes no public metadata, sitemap, robots, canonical URL, or structured public content.                         | changed-files review                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected member surface changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                   | changed-files review                               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                           | analytics scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                 | explicit commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                      | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                     | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched feedback strings stay existing/short and avoid layout assumptions that block later localization; no locale routing or translation workflow changes. | copy/layout review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `WorkoutBuilderHub`, My Library/member feedback references, Tailwind tokens, and focused tests; add no package, API layer, or broad primitive.                | changed-files/dependency diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                             | test commands + screenshot handoff + later gates   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                     | diff review                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                            | git diff + validation evidence                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: member-local route feedback from `DrylandFeedback`, `GoalsHub`, `TrainingContextHub`, and `MyLibraryNewContentNotice`.
  - Keep implementation inside `components/my-library/workouts/WorkoutBuilderHub.tsx` or a workout-builder-local helper.
  - Do not change route boundaries, server components, API routes, auth redirects, cache mode, or workout snapshot loading.
- TypeScript/domain contracts:
  - Preserve `WorkoutLibrarySnapshot`, `WorkoutEditorRecord`, `WorkoutSummary`, manual draft types, save/delete API response handling, and recent-workout ordering.
  - Add only local presentation helpers/types for feedback tone/message semantics if needed.
  - Session-step reference contract: this slice does not change `docs/design/session-step-surface-contract.md`, `SessionStepSurfaceRenderer`, workout step view models, step editing, rearrange mode, repeat rendering, or export step display. Feedback changes stay around the builder shell only, and focused `WorkoutBuilderHub` tests keep existing editor/session-step behavior covered.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing My Library/member visual language and recent AW-006 feedback semantics.
  - Do not create a broad app-wide or member-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed My Swim Sessions builder feedback to mature My Library/member feedback references where practical.
- Testing:
  - Update focused Vitest coverage for success/error/local-draft/empty live-region semantics and unchanged workout save/delete behavior.
  - Keep existing e2e aligned unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

- Server-canonical data:
  - Saved workouts, selected workout records, recent workouts, accepted timestamps, source kind, status, and workout draft payloads remain server-canonical through existing authenticated workout routes and helpers.
- Local data:
  - Manual local workout drafts remain local-only browser/device state via existing local draft helpers.
  - Delete confirmation, discard confirmation, action feedback, and recovered-draft flags remain transient component state.
  - This slice adds no new persisted local data.
- Sync policy:
  - Existing create, save, update, delete, bulk delete, local draft write/clear, and `router` navigation/refresh behavior remain unchanged.
  - Failed actions keep current UI context and preserve drafts/list state for retry.
- Retention and sensitivity:
  - Existing data retention behavior stays unchanged; feedback must not expose raw diagnostics, secrets, or cross-user details.
- Cache/invalidation:
  - `/my-library/workouts` keeps existing dynamic page load and client route/navigation behavior; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing workout IDs, draft titles, source kinds, statuses, filenames, and route params remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: My Swim Sessions builder feedback states for schema warning, load error, action error, action success, local-draft recovery, first-run empty, selected-workout missing, and no-loaded-session guidance.
  - Not touched: workout data contracts, API routes, export formats, analytics payloads, route labels, auth, Supabase, Help/Guide, or support procedures.
- Source of truth:
  - Workout rows, selected workout, recent workouts, schema/load state, and missing-selected-workout state remain the typed `WorkoutLibrarySnapshot` data model.
  - Feedback tone is derived from local UI state (`schemaReady`, `loadError`, `error`, `success`, `localDraftRecovered`, `recentWorkouts`, `selectedWorkoutMissing`, and local draft mode), not hardcoded workout row IDs.
- Additive behavior:
  - New workout rows should automatically render through the existing list/editor and the same feedback shell.
  - Additional saved workouts or future source kinds should not need new feedback markup for current schema/load/action states.
- Explicit mapping requirements:
  - New workout workflow actions, feedback tones, destructive recovery paths, export formats, route labels, analytics events, or support promises require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown workout values must keep existing safe generic copy and must not invent success states from unknown API payloads.
  - Deprecated actions remain recoverable through existing API failure feedback until removed in a separate scoped brief.
- Test/evidence:
  - Focused tests assert feedback semantics for success, error, local draft recovery, schema/load, empty, and missing-session paths while preserving existing workout actions.
  - Route/label/support sweep checks My Swim Sessions builder feedback identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing My Swim Sessions builder feedback. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted member/My Swim Sessions feedback sweep because this slice changes user-facing feedback semantics.

- Identifiers to search before broad gates:
  - `WorkoutBuilderHub`
  - `My Swim Sessions`
  - `Swim session builder`
  - `Canonical workout save is still syncing`
  - `Could not load`
  - `Could not save workout`
  - `Could not delete workout`
  - `No saved sessions yet`
  - `That saved swim session could not be found`
  - `No saved swim session is loaded`
  - `Recovered your unsaved local`
  - `role="alert"`
  - `role="status"`
  - `aria-live`
- Surfaces to check:
  - `components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/` if selectors/semantics change
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - My Swim Sessions builder component, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No workout API, Supabase, auth, analytics, Help/Guide, support-procedure, export, commerce, or admin workflow fallout.

## Scope

- Improve `components/my-library/workouts/WorkoutBuilderHub.tsx` feedback presentation and accessibility semantics for existing schema warning, load error, action error, action success, local-draft recovery, first-run empty, selected-workout missing, and no-loaded-session messages.
- Preserve workout save/delete/bulk-delete payloads, local drafts, selected workout handling, recent-workout ordering, editor behavior, export/handoff behavior, route destinations, and existing copy meaning.
- Update focused tests in `tests/unit/workout-builder-hub.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Workout data model, API routes, Supabase, generated database types, migrations, auth, analytics, route labels, editor step behavior, saved workout sorting rules, localStorage keys, export/PDF/Poolside/Garmin/handoff behavior, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.

## Acceptance Criteria

1. My Swim Sessions builder schema, load error, action error, action success, local-draft recovery, first-run empty, selected-workout missing, and no-loaded-session feedback use one workout-builder-local feedback contract/helper.
2. Action/load errors are announced as alert/assertive live regions and keep retry or the current action recoverable.
3. Success and recovered-draft feedback is announced politely and does not disrupt current draft/list/editor context.
4. Static empty states are not announced as live regions.
5. Existing workout save/delete/bulk-delete payloads, local drafts, selected workout handling, recent-workout ordering, route destinations, and editor/export behavior remain unchanged.
6. Focused unit tests cover changed feedback semantics and unchanged workout behavior.
7. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
8. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/workout-builder-hub.test.tsx`
- `npm run typecheck`
- `git diff --check`
- `npm run lint:briefs:all`
- targeted route/label/support sweep for My Swim Sessions builder feedback identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr`
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture My Swim Sessions builder feedback on desktop and mobile/tablet where practical:
  - after/reference empty or missing-session state,
  - after action success state,
  - after forced action error or existing tested error state where practical,
  - My Library/member feedback reference surface where practical.
- Use `after/reference` naming because the handoff compares changed My Swim Sessions builder feedback to mature My Library/member feedback references rather than a true before-state.

## Checkpoint Log

- `2026-05-25 | in-progress | owner approved the AW-006 My Swim Sessions Builder Feedback Semantics slice after fresh queue/design/code re-audit on clean main@2e86a43; created branch aw-006-my-swim-sessions-builder-feedback-semantics and active brief; next: implement the workout-builder-local feedback helper and focused tests, then capture screenshot handoff before broad gates`
- `2026-05-25 | screenshot-review | implemented workout-builder-local feedback semantics for schema, load, action, local-draft, empty, missing-session, and no-loaded-session states; updated focused unit tests plus AW-006 queue/inventory docs; targeted validation passed: vitest workout-builder-hub, typecheck, lint:quality-gates, lint:briefs:all, and git diff --check; captured after/reference screenshot artifacts in output/aw-006-my-swim-sessions-feedback-2026-05-25-055813 at 2026-05-25 05:58 using a temporary local fixture route/script that were removed after capture; no shipped product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
- `2026-05-25 | screenshot-approved | owner approved screenshot handoff at 2026-05-25 06:05; no shipped product-rendering files changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness handoff`
- `2026-05-25 | pre-pr-green | npm run verify:pre-pr passed full lane at 2026-05-25 06:12: branch-current, quality gates, lint, typecheck, unit, build, perf budgets, and Playwright e2e all green; e2e summary 99 passed, 483 skipped | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`

## Completion Record

- `completed`: `2026-05-25`
- `merged_pr`: `#840`
- `squash_commit`: `b4ddec3`
- `result`: Closed AW-006 My Swim Sessions Builder Feedback Semantics; `/my-library/workouts` builder now uses a local feedback contract with consistent visual treatment and screen-reader semantics for warning, error, success, recovered-draft, empty, missing-session, and no-loaded-session states while preserving workout data/actions/export/editor behavior.
- `validation`: Targeted vitest/typecheck/diff/lint gates passed; screenshot after/reference handoff approved; `npm run verify:pre-pr` full lane passed on commit `ef71b55`; CI for `#840` passed; `npm run verify:pre-merge` passed and reused full-public artifact `artifacts/test-runs/20260525-061851`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                   | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | PR `#840`, screenshots, and queue/inventory closeout prove feedback stays attached to the existing My Swim Sessions builder/list workflow. | None.        |
| UX flow clarity                               | `5/5`          | Schema, load, action, local-draft, empty, missing-session, and no-loaded-session states covered by focused tests and screenshot handoff.   | None.        |
| Visual design quality                         | `5/5`          | After/reference desktop and mobile screenshots approved; no shipped rendering files changed after capture.                                 | None.        |
| Business logic correctness and data integrity | `5/5`          | Workout save/delete/bulk-delete payloads, local drafts, selected workout handling, recent ordering, and editor/export behavior preserved.  | None.        |
| Accessibility (a11y)                          | `5/5`          | Alert/assertive errors, polite status feedback, and non-live static empty states covered by Testing Library role/aria assertions.          | None.        |
| Accessibility                                 | `5/5`          | Same accessibility evidence as the canonical `Accessibility (a11y)` row, retained for closeout normalization.                              | None.        |
| Data placement and sync boundaries            | `5/5`          | Server-canonical saved workouts and local-only manual drafts keep their existing boundaries; this slice adds only presentation semantics.  | None.        |
| Reliability and failure handling              | `5/5`          | Error states keep retry or current-action recovery visible without hiding draft, list, selected-workout, or delete-confirmation context.   | None.        |
| Privacy and compliance                        | `5/5`          | Feedback exposes no user identifiers, entitlement details, raw provider diagnostics, secrets, or env values.                               | None.        |
| Content governance                            | `5/5`          | Done brief, canonical AW-006 queue, and notice/empty-state inventory record the shipped state.                                             | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Existing `WorkoutBuilderHub`, route-local React/Tailwind patterns, and focused tests reused; no dependency, API, or broad primitive added. | None.        |
| Testing and QA automation                     | `5/5`          | Focused tests, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate passed.                      | None.        |
| DevOps and rollback readiness                 | `5/5`          | No migrations, config, package, workflow, env, or generated asset changes; normal git revert is sufficient rollback.                       | None.        |
