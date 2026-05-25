# Task Brief: AW-006 AI Session Generator Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-ai-session-generator-feedback-semantics-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-25`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-ai-session-generator-feedback-semantics`
- `execution_mode`: `merged via PR #843; repo-managed docs-only closeout records completion evidence`

## Brief Audit Record

- `last_audited`: `2026-05-25`
- `base`: `main@3c72407`
- `audit_status`: `ready`
- `decision`: Execute the approved bounded `AW-006 AI Session Generator Feedback Semantics` slice now.
- `reason`: PR `#840` and repo-managed closeout PR `#841` are merged, `main` is clean at `3c72407`, `npm run post-merge:preflight` was reported green, and the fresh queue/design/code re-audit found `GeneratorIntakeHub` and `SessionGeneratorPanel` still rendering draft recovery, stale source, load, schema, generate/save error, and success feedback with repeated route-local markup while adjacent member surfaces now have clearer accessible feedback contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, generator-intake contracts, session-generator route contracts, workout save contracts, My Swim Sessions builder feedback semantics, screenshot handoff rules, or verification lanes change before screenshot handoff.

## Goal

Make `/my-library/generator` feedback states consistent, accessible, and easy to extend while preserving generator intake data, generated draft behavior, workout save APIs, editor behavior, analytics, auth, routes, Help/Guide, and support procedures.

## Pre-Implementation Owner Explanation

Jeg skal rydde meldingene i AI session generator naar utkast gjenopprettes, lagrede data er gamle, lasting feiler, generering/lagring feiler, eller lagring lykkes. Det betyr noe fordi brukeren raskere forstaar hva som skjedde og hva som er trygt neste steg, og skjermlesere faar riktig status/feil-semantikk. Utenfor scope er generatorlogikk, workout-data, API-er, eksport, analytics, auth, Supabase, Help/Guide og bred member notice-primitive.

Fremoverkompatibilitet: feedback skal avledes fra eksisterende typed generator/workout state, ikke dagens hardkodede produkt- eller rad-ID-er. Nye generatorhandlinger, feedback-toner, recovery-regler eller workflow-loefter krever eksplisitt mapping og test foer release.

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
- `Privacy and compliance`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/generator` remains the private AI session generator that hands reviewed drafts into My Swim Sessions; feedback stays attached to existing generator and save jobs.      | focused tests + screenshot handoff                 | `5/5`                   |
| UX flow clarity                               | `target`     | Draft recovery, stale-source warning, generator/load/schema errors, generate/save success, selected-workout missing, and unavailable save states each show one clear state.          | focused tests + screenshot handoff                 | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses consistent member-library styling, stable spacing, readable contrast, and no broad generator/editor redesign or layout churn.                                          | screenshot handoff + class review                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Generator validation, session-draft payloads, workout create/update payloads, local generator draft restore/reset, selected workout hydration, and editor behavior remain unchanged. | focused unit tests + diff review                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, CRUD surface, publishing workflow, admin notes, QR, content manager, or operator workflow.                                           | explicit admin scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic success/recovery feedback uses polite status semantics; actionable errors use alert/assertive semantics; static warnings avoid noisy live regions unless state changes.      | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                                   | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route fetch, polling loop, or heavy client library is added; `/my-library/generator` keeps existing route budgets.                            | no-dependency diff + broad gates later             | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical saved workouts and local-only generator choices keep existing boundaries; this slice adds only transient presentation markup/state helpers.                         | data contract review + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route cache mode, fetch cache, mutation response, revalidation, invalidation behavior, CDN behavior, or stale-data policy.                               | explicit cache scope rationale                     | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable generator/load/save failures remain visible near the generator surface and do not hide current form, draft, saved workout, or editor context.                            | focused failure tests                              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and owner-scoped generator/workout APIs remain unchanged; feedback exposes no raw diagnostics, secrets, or cross-user details.              | diff review + unchanged protected APIs             | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback exposes no private workout values beyond the already-visible private UI, user identifiers, entitlement details, raw provider diagnostics, secrets, or env values.           | copy/error review                                  | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active AI session generator feedback semantics slice.                                                            | docs diff                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                              | explicit admin-workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this protected member route changes no public metadata, sitemap, robots, canonical URL, or structured public content.                                                    | explicit SEO scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected member utility changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                           | explicit AI-discoverability scope rationale        | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing generator and workout analytics taxonomy/payloads stay unchanged; no new event, dashboard, KPI, or consent behavior is introduced.                         | analytics scope review                             | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                       | explicit commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                              | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                             | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English strings stay concise and route-local; no locale routing or translation workflow is introduced.                                                      | copy/layout review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `GeneratorIntakeHub`, `SessionGeneratorPanel`, My Library/member feedback references, Tailwind tokens, and focused tests; add no dependency or broad primitive.       | changed-files/dependency diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                                     | test commands + screenshot handoff + later gates   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                             | implementation review                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, provider settings, or production settings.                              | git diff + validation evidence                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces are recent member-local feedback contracts in `WorkoutBuilderHub`, `GoalsHub`, `TrainingContextHub`, `HabitPerfectDayHub`, and `MyLibraryNewContentNotice`.
  - Keep `/my-library/generator` as a server-authenticated route with client-rendered `GeneratorIntakeHub` and `SessionGeneratorPanel`.
  - Do not change route boundaries, server components, API routes, auth redirects, cache mode, or snapshot loading.
- TypeScript/domain contracts:
  - Preserve `GeneratorIntakeSnapshot`, `GeneratorIntakeHandoffPayload`, `SessionGeneratorFormState`, `SessionDraft`, `WorkoutLibrarySnapshot`, and workout save response handling.
  - Add only route-local presentation helpers/types for feedback tone/message semantics if needed.
  - Session-step reference contract remains unchanged; generated drafts continue through `WorkoutEditor` and `SessionStepSurfaceRenderer`.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or Supabase query behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing My Library/member visual language and recent AW-006 feedback semantics.
  - Do not create a broad app-wide or member-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed AI generator feedback to mature My Swim Sessions/member feedback references where practical.
- Testing:
  - Update focused Vitest coverage for generator draft recovery, stale-source/load/schema/action success/error semantics, and unchanged generator/workout payload behavior.
  - Keep existing e2e aligned unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

- Server-canonical data:
  - Generator intake snapshot values, saved workouts, selected workout records, accepted timestamps, source kind, status, and workout draft payloads remain server-canonical through existing authenticated routes and helpers.
- Local data:
  - Generator choices and one-session overrides remain local-only browser/device state via the existing storage key.
  - Form settings, generated draft, saved-workout editor state, action feedback, and discard undo stay transient component state.
  - This slice adds no new persisted local data.
- Sync policy:
  - Existing generator-intake load, local draft read/write/reset, session draft generation, workout create/update, selected workout hydration, and editor behavior remain unchanged.
  - Failed actions keep current UI context and preserve form/draft/editor state for retry.
- Retention and sensitivity:
  - Existing data retention behavior stays unchanged; feedback must not expose raw diagnostics, secrets, or cross-user details.
- Cache/invalidation:
  - `/my-library/generator` keeps existing dynamic page load and client behavior; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing workout IDs, draft titles, source kinds, statuses, filenames, and route params remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: AI generator feedback states for generator draft recovery, stale source, generator-intake load error, workout load error, selected-workout missing, schema/save unavailable, generate/save error, and save success.
  - Not touched: generator algorithms, generator-intake data contracts, API routes, export formats, analytics payloads, route labels, auth, Supabase, Help/Guide, or support procedures.
- Source of truth:
  - Feedback tone derives from typed local UI state, `GeneratorIntakeSnapshot`, `WorkoutLibrarySnapshot`, generator validation/API outcomes, and workout save outcomes, not hardcoded workout row IDs.
- Additive behavior:
  - Additional saved workouts, source blocks, and ordinary generator/save errors should render through the same generator-local feedback treatment.
- Explicit mapping requirements:
  - New generator workflow actions, feedback tones, destructive recovery paths, export formats, route labels, analytics events, support promises, or cross-route recovery flows require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown API errors keep existing safe generic copy and must not invent success states from unknown payloads.
  - Deprecated actions remain recoverable through existing API failure feedback until removed in a separate scoped brief.
- Test/evidence:
  - Focused tests assert feedback semantics for success, error, recovery, stale-source, schema/load, and missing-workout paths while preserving existing generator and workout actions.
  - Route/label/support sweep checks AI generator feedback identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing AI session generator feedback. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted member/AI generator feedback sweep because this slice changes user-facing feedback semantics.

- Identifiers to search before broad gates:
  - `GeneratorIntakeHub`
  - `SessionGeneratorPanel`
  - `AI session generator`
  - `Generator draft settings restored`
  - `Saved generator choices were restored`
  - `Could not generate a session draft`
  - `Could not save workout`
  - `Session saved to My Swim Sessions`
  - `That saved session could not be found`
  - `Saving to My Swim Sessions is still syncing`
  - `role="alert"`
  - `role="status"`
  - `aria-live`
- Surfaces to check:
  - `components/my-library/generator/GeneratorIntakeHub.tsx`
  - `components/my-library/generator/SessionGeneratorPanel.tsx`
  - `tests/unit/generator-intake-hub.test.tsx`
  - `tests/unit/session-generator-panel.test.tsx`
  - `tests/e2e/my-library-generator-intake.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - Generator components, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No generator API, workout API, Supabase, auth, analytics, Help/Guide, support-procedure, export, commerce, or admin workflow fallout.

## Scope

- Improve `components/my-library/generator/GeneratorIntakeHub.tsx` feedback presentation and accessibility semantics for existing draft recovery, stale-source warning, and load error states.
- Improve `components/my-library/generator/SessionGeneratorPanel.tsx` feedback presentation and accessibility semantics for existing workout load error, selected-workout missing, save-unavailable warning, generate/save errors, and save success.
- Preserve generator validation, session-draft payloads, workout save/update payloads, local generator draft behavior, selected workout handling, editor behavior, route destinations, and existing copy meaning.
- Update focused tests in `tests/unit/generator-intake-hub.test.tsx` and `tests/unit/session-generator-panel.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Generator algorithm/domain changes, generator-intake API routes, workout API routes, Supabase migrations/RLS/types, generated database types, auth, analytics, route labels, editor step behavior, localStorage key changes, export/PDF/Poolside/Garmin/handoff behavior, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. AI generator draft recovery, stale-source, load error, selected-workout missing, save-unavailable, action error, and action success states use one generator-local feedback contract/helper.
2. Action/load errors are announced as alert/assertive live regions and keep retry or the current action recoverable.
3. Success and recovered-draft feedback is announced politely and does not disrupt current form/draft/editor context.
4. Static warning/informational states avoid unnecessary live-region noise unless they reflect a user-triggered state change.
5. Existing generator validation, session-draft payloads, workout save/update payloads, local generator draft behavior, selected workout handling, route destinations, and editor behavior remain unchanged.
6. Focused unit tests cover changed feedback semantics and unchanged generator/workout behavior.
7. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
8. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/generator-intake-hub.test.tsx tests/unit/session-generator-panel.test.tsx`
- `npm run typecheck`
- `git diff --check`
- `npm run lint:briefs:all`
- targeted route/label/support sweep for AI generator feedback identifiers

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

- Capture AI session generator feedback on desktop and mobile/tablet where practical:
  - after/reference draft recovery or generator load warning state,
  - after save success/action feedback state,
  - after forced action error or existing tested error state where practical,
  - My Swim Sessions/member feedback reference surface where practical.
- Use `after/reference` naming because the handoff compares changed AI generator feedback to mature My Swim Sessions/member feedback references rather than a true before-state.

## Local Tooling Prerequisite

Node.js/npm should be loaded through the repo's normal `nvm use --silent` path before npm commands. For Codex, release-gate/dev-server commands use escalation-first strategy per repo instructions.

## Screenshot Handoff

Required because this is a user-facing UI state rendering change. Stop after targeted implementation QA and screenshot artifacts; do not run `npm run verify:pre-pr`, open/update PR, or run pre-merge until owner approves or waives the screenshot handoff.

- `status`: captured and owner-approved before broad gates
- `captured`: `2026-05-25 09:13 CEST`
- `comparison_type`: `after/reference`
- `artifacts`: `output/aw-006-ai-generator-feedback-2026-05-25-091342`
- `notes`: Captured with deterministic one-state local screenshot fixtures because the local dev-login path was blocked by the Supabase egress guard. The handoff shows separate realistic states instead of stacking all feedback at once. The fixture and capture script were removed after capture; no shipped product-rendering files, styles, assets, or export HTML changed after the approved artifacts.

## Checkpoint Log

- `2026-05-25 | in-progress | owner approved AW-006 AI Session Generator Feedback Semantics after clean main@3c72407 and fresh queue/design/code re-audit; created branch aw-006-ai-session-generator-feedback-semantics and this active brief | next: update queue/inventory, implement generator feedback helper, run targeted tests, then capture screenshot handoff before broad gates`
- `2026-05-25 | targeted-qa | implemented generator-local feedback semantics for draft recovery, stale-source, load, selected-workout missing, save-unavailable, action error, and action success states; preserved generator validation, session-draft payloads, workout save/update payloads, local generator draft behavior, selected workout handling, and editor behavior; targeted validation passed: ./node_modules/.bin/vitest run tests/unit/generator-intake-hub.test.tsx tests/unit/session-generator-panel.test.tsx (14 tests), npm run lint:briefs:all, npm run lint:quality-gates, npm run typecheck, git diff --check, and targeted route/label/support sweep | next: capture after/reference screenshot handoff before broad gates`
- `2026-05-25 | screenshot-handoff | captured after/reference screenshots for separate realistic AI generator feedback states and My Swim Sessions reference state in output/aw-006-ai-generator-feedback-2026-05-25-091342; owner approved screenshot handoff; removed temporary screenshot route/script after capture with no shipped rendering changes after capture | next: npm run verify:pre-pr and PR flow`
- `2026-05-25 | pre-pr-green | npm run verify:pre-pr passed full lane after stale Next dev type-cache from the temporary screenshot route was regenerated/removed: branch-current, quality gates, lint, typecheck, 207 unit files / 1224 tests, build, performance budgets, and Playwright E2E 99 passed / 483 skipped | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge before approved merge`
- `2026-05-25 | merged | PR #843 merged as 4c0f01e after local verify:pre-pr PASS, required CI PASS, and npm run verify:pre-merge PASS | next: repo-managed docs-only closeout PR`

## Completion Record

- `completed`: `2026-05-25`
- `merged_pr`: `#843`
- `squash_commit`: `4c0f01e`
- `result`: Closed AW-006 AI Session Generator Feedback Semantics by standardizing `/my-library/generator` feedback treatment for recovered drafts, stale source data, load failures, missing saved workouts, save-unavailable states, action errors, and action success without changing generator data, workout save APIs, editor behavior, analytics, routes, Help/Guide, auth, or support procedures.
- `validation`: Focused unit tests passed for `tests/unit/generator-intake-hub.test.tsx` and `tests/unit/session-generator-panel.test.tsx`; approved after/reference screenshot handoff in `output/aw-006-ai-generator-feedback-2026-05-25-091342`; `npm run verify:pre-pr` passed full lane on committed HEAD `9455a96` with branch-current, quality gates, lint, typecheck, 207 unit files / 1224 tests, build, performance budgets, and Playwright E2E 99 passed / 483 skipped; PR #843 required CI checks all passed, including `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, CodeQL, and Vercel; `npm run verify:pre-merge` passed and reused the current full-public local verify artifact.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                             | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Feedback stayed attached to existing `/my-library/generator` and My Swim Sessions handoff states; PR #843 shipped no route or IA change.             | None         |
| UX flow clarity                               | `5/5`          | Separate semantics for recovery, stale-source, load, missing-workout, save-unavailable, action error, and action success; screenshot approved.       | None         |
| Visual design quality                         | `5/5`          | Approved after/reference screenshots in `output/aw-006-ai-generator-feedback-2026-05-25-091342`; no shipped visual files changed afterward.          | None         |
| Business logic correctness and data integrity | `5/5`          | Focused tests and full verify preserved generator validation, draft payloads, workout create/update payloads, local draft behavior, and editor flow. | None         |
| Accessibility (a11y)                          | `5/5`          | Tests assert `role`, `aria-live`, `aria-atomic`, and non-noisy warning behavior for the changed feedback states.                                     | None         |
| Accessibility                                 | `5/5`          | Same evidence as `Accessibility (a11y)` alias row required by brief-lint normalization.                                                              | None         |
| Data placement and sync boundaries            | `5/5`          | No new persisted data, localStorage keys, API routes, cache behavior, Supabase schema, or sync boundaries changed.                                   | None         |
| Reliability and failure handling              | `5/5`          | Failure states remain visible near the generator surface and preserve current form/draft/editor context for retry.                                   | None         |
| Privacy and compliance                        | `5/5`          | Feedback exposes no raw diagnostics, secrets, user identifiers, entitlement details, or cross-user data.                                             | None         |
| Content governance                            | `5/5`          | Active brief, canonical AW-006 queue, notice inventory, and this closeout record document the shipped slice.                                         | None         |
| Stack-fit and dependency discipline           | `5/5`          | Added a generator-local helper using existing React/Tailwind patterns; no dependency, package, route-boundary, or broad primitive change.            | None         |
| Testing and QA automation                     | `5/5`          | Focused unit tests, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` passed.                                                     | None         |
| DevOps and rollback readiness                 | `5/5`          | Single squash commit `4c0f01e`; no migrations, env changes, package changes, workflow changes, or production setting changes.                        | None         |
