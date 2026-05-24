# Task Brief: AW-006 My Training Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-24-aw-006-my-training-feedback-semantics-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-24`
- `updated`: `2026-05-24`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-training-feedback-semantics`
- `execution mode`: `end-to-end implementation after owner approved the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-24`
- `base`: `main@cb65648`
- `audit_status`: `ready`
- `decision`: Execute a bounded member/My Training feedback semantics slice on `/my-library/training`.
- `reason`: PR `#832` and repo-managed closeout `#833` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `TrainingContextHub` still renders schema warning, offline warning, load error+retry, goal-context message, action error, action success, and empty/no-results feedback with repeated route-local markup and without focused semantic tests while adjacent member surfaces now have clearer accessible feedback contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/training`, `TrainingContextHub`, training-context storage/API contracts, Goals bridge links, My Library reference surfaces, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make My Training schema/offline/load/action/context/empty feedback consistent, accessible, and easy to extend without changing training-context data, API behavior, local drafts, Goals bridge links, analytics, focus/note workflow rules, or support procedures.

## Pre-Implementation Owner Explanation

Jeg skal bare rydde opp i meldingene som vises i My Training naar siden synker, er offline, feiler, lagrer, eller har tomme Focus/Notes-lister. Det betyr noe fordi brukeren raskere forstar hva som skjedde og hva som er trygt neste steg, mens skjermlesere faar riktigere status/feil-semantikk. Utenfor scope er Training Context API-er, Supabase, localStorage-nokler, analytics, Goals-koblinger, focus/note-statusregler, layout-redesign, Help/Guide-copy og bred member notice-primitive. Fremoverkompatibilitet ivaretas ved at nye focus/note/goal-rader fortsatt kommer fra eksisterende Training Context snapshot og filtre; denne slicen standardiserer bare feedback-visningen og krever eksplisitt mapping for nye feedback-toner eller workflow-handlinger.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/training` remains the canonical private My Training surface; feedback stays attached to existing focus/note/refresh/goal-context jobs without new route or workflow. | focused tests + screenshot handoff                 | `5/5`                   |
| UX flow clarity                               | `target`     | Schema warning, offline warning, load error+retry, context message, action error, action success, first-run empty, and filtered no-results states are clear and not dead ends.    | focused tests + screenshot handoff                 | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses consistent member-library styling, stable spacing, readable contrast, and no broad My Training redesign or layout churn.                                            | screenshot handoff + class review                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Focus/note create/update/status payloads, refresh behavior, draft persistence, filters, and Goals bridge context remain unchanged.                                                | focused unit tests + diff review                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing, notes, QR, or operator editing workflow.                                                                  | changed-files review                               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | User-action success/context feedback uses polite status semantics; actionable errors use alert/assertive semantics; static empty states are not noisy live regions.               | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                                | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route fetch, polling loop, or heavy client library is added; `/my-library/training` keeps existing route budgets.                          | dependency diff + broad gates                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical training context and local-only focus/note drafts remain in existing boundaries; this slice adds only transient presentation markup/state helpers.               | data contract review + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, mutation response, revalidation, or invalidation behavior changes.                                                                  | cache scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Failure messages keep retry or recovery visible where existing flows allow it and do not hide current focus, notes, drafts, selected goal, or active filters.                     | focused failure tests                              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and owner-scoped Training Context APIs remain unchanged; feedback exposes no raw diagnostics, secrets, or cross-user details.            | diff review + route-boundary review                | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include private focus/note values beyond existing user-entered UI, user identifiers, entitlement details, raw provider diagnostics, secrets, or env values.     | copy/error review                                  | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active My Training feedback semantics slice.                                                                  | docs diff                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                           | explicit admin workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this touches a protected/member utility UI and changes no public metadata, sitemap, robots, canonical URL, or structured public content.                              | changed-files review                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected member surface changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                        | changed-files review                               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                                | analytics scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                      | explicit commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                           | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                          | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched feedback strings stay existing/short and avoid layout assumptions that block later localization; no locale routing or translation workflow changes.      | copy/layout review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `TrainingContextHub`, My Library/member feedback references, Tailwind tokens, and focused tests; add no package, API layer, or broad primitive.                    | changed-files/dependency diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                                  | test commands + screenshot handoff + later gates   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                          | diff review                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                                 | git diff + validation evidence                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: existing `TrainingContextHub` route state, member feedback semantics from `GoalsHub`, `AthleteProfileHub`, `DrylandFeedback`, and `MyLibraryNewContentNotice`.
  - Keep implementation inside `components/my-library/training/TrainingContextHub.tsx` or a training-local helper.
  - Do not change route boundaries, server components, API routes, auth redirects, cache mode, or training-context snapshot loading.
- TypeScript/domain contracts:
  - Preserve `TrainingContextSnapshot`, `TrainingFocusView`, `TrainingNoteView`, status labels, note filters, focus/note drafts, API payload parsing, and Goals prefill behavior.
  - Add only local presentation helpers/types for feedback tone/message semantics if needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing My Library/member visual language and recent AW-006 feedback semantics.
  - Do not create a broad app-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed My Training feedback to mature My Library/member feedback references where practical.
- Testing:
  - Update focused Vitest coverage for success/error/offline/empty live-region semantics and unchanged training behavior.
  - Keep existing e2e aligned unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

- Server-canonical data:
  - Focuses, notes, goal options, primary focus state, counters, and snapshot load/schema state remain server-canonical through existing authenticated Training Context routes and helpers.
- Local data:
  - Focus draft, note draft, selected goal context, composer disclosure state, note filters, and edit state remain local component/browser state exactly as before.
  - This slice adds no new persisted local data.
- Sync policy:
  - Existing create, update, status, refresh, and prefill flows remain unchanged.
  - Failed actions keep current UI context and preserve drafts/filters for retry.
- Retention and sensitivity:
  - Existing data retention behavior stays unchanged; feedback must not expose raw diagnostics, secrets, or cross-user details.
- Cache/invalidation:
  - `/my-library/training` keeps existing dynamic page load and client refresh behavior; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing focus IDs, note IDs, goal IDs, labels, statuses, and Goals bridge query parameters remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: My Training feedback states for schema warning, offline warning, load error+retry, goal-context message, action error, action success, first-run empty goals/focus/notes, primary-focus warning, and filtered no-results notes.
  - Not touched: Training Context data contracts, API routes, analytics payloads, route labels, Goals bridge behavior, auth, Supabase, Help/Guide, or support procedures.
- Source of truth:
  - Focus rows, note rows, goal options, counters, statuses, and labels remain the typed `TrainingContextSnapshot` data model and existing filter helpers.
  - Feedback tone is derived from local UI state (`schemaReady`, `loadError`, `isOnline`, `contextMessage`, `actionError`, `actionSuccess`, row counts, and active filters), not hardcoded focus/note row IDs.
- Additive behavior:
  - New focus, note, and goal option rows should automatically render through the same list and feedback shell.
  - New note statuses using the existing label helper and filters can render with the same empty/no-results fallback.
- Explicit mapping requirements:
  - New training workflow actions, feedback tones, destructive recovery paths, route labels, analytics events, or support promises require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown training values must keep existing safe generic copy and must not invent success states from unknown API payloads.
  - Deprecated actions remain recoverable through existing API failure feedback until removed in a separate scoped brief.
- Test/evidence:
  - Focused tests assert feedback semantics for success, error, offline, schema/load, first-run empty, and filtered no-results paths while preserving existing training actions.
  - Route/label/support sweep checks My Training feedback identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing My Training feedback. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted member/My Training feedback sweep because this slice changes user-facing feedback semantics.

- Identifiers to search before broad gates:
  - `TrainingContextHub`
  - `My Training`
  - `Focus`
  - `Notes`
  - `My Training is syncing`
  - `You are offline. Existing Focus and Notes`
  - `Could not refresh Focus and Notes`
  - `Could not save focus`
  - `Could not update focus`
  - `Could not save note`
  - `Could not update note`
  - `Focus saved`
  - `Focus updated`
  - `Note updated`
  - `No active goals are available`
  - `No open focus yet`
  - `No notes yet`
  - `No notes match the current filters`
- Surfaces to check:
  - `components/my-library/training/TrainingContextHub.tsx`
  - `tests/unit/training-context-hub.test.tsx`
  - `tests/e2e/` if selectors/semantics change
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - My Training component, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No Training Context API, Supabase, auth, analytics, Help/Guide, support-procedure, Goals data, commerce, or admin workflow fallout.

## Scope

- Improve `components/my-library/training/TrainingContextHub.tsx` feedback presentation and accessibility semantics for existing schema warning, offline warning, load error+retry, context message, action error, action success, first-run empty, primary-focus warning, and filtered no-results messages.
- Preserve focus/note create/update/status/refresh payloads, local drafts, filters, selected goal context, composer disclosure behavior, Goals bridge links, and existing copy meaning.
- Update focused tests in `tests/unit/training-context-hub.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Training Context data model, API routes, Supabase, generated database types, migrations, auth, analytics, route labels, Goals bridge behavior, note filters/ordering, focus/note status/action taxonomy, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.

## Acceptance Criteria

1. My Training schema, offline, load error, context, action error, action success, empty, primary-focus warning, and filtered no-results feedback use one training-local feedback contract/helper.
2. Action and load errors are announced as alert/assertive live regions and keep retry or the current action recoverable.
3. Success and context feedback is announced politely and does not disrupt current focus/note/filter context.
4. Static empty states are not announced as live regions.
5. Existing focus/note create/update/status/refresh payloads, local drafts, filters, selected goal context, and Goals bridge behavior remain unchanged.
6. Focused unit tests cover changed feedback semantics and unchanged training behavior.
7. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
8. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/training-context-hub.test.tsx`
- `npm run typecheck`
- `git diff --check`
- `npm run lint:briefs:all`
- targeted route/label/support sweep for My Training feedback identifiers

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

- Capture My Training feedback on desktop and mobile/tablet where practical:
  - after/reference empty or no-results state,
  - after action success state,
  - after forced action error or existing tested error state where practical,
  - My Library/member feedback reference surface where practical.
- Use `after/reference` naming because the handoff compares changed My Training feedback to mature My Library/member feedback references rather than a true before-state.

## Checkpoint Log

- `2026-05-24 | in-progress | owner approved the AW-006 My Training Feedback Semantics slice after fresh queue/design/code re-audit on clean main@cb65648; created branch aw-006-my-training-feedback-semantics and active brief; next: implement the training-local feedback helper and focused tests, then capture screenshot handoff before broad gates`
- `2026-05-24 | implemented + targeted validation | added a training-local feedback renderer for schema warning, offline warning, load error+retry, context message, action error, action success, first-run empty, primary-focus warning, and filtered no-results states; updated focused unit assertions for polite status, assertive alert, and static empty semantics; updated AW-006 queue/inventory; targeted checks passed: ./node_modules/.bin/vitest run tests/unit/training-context-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check; targeted route/label/support sweep found expected fallout in TrainingContextHub, focused tests, AW-006 docs, this active brief, existing admin-notes strings with matching generic copy, Training Context API error strings, and support/runbook references | next: capture required screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-05-24 | screenshot handoff ready | captured after/reference screenshot artifacts in output/aw-006-my-training-feedback-2026-05-24-192826 for success, action error, mobile empty, and Goals reference feedback; capture used a temporary local fixture route with seeded props and mocked fetch responses to avoid writing real Training Context data; fixture route/script were removed after capture and targeted validation passed again with ./node_modules/.bin/vitest run tests/unit/training-context-hub.test.tsx, npm run typecheck, and git diff --check; no shipped product-rendering files changed after capture | next: owner screenshot approval before verify:pre-pr`
- `2026-05-24 | screenshot approved + pre-pr green | owner approved screenshot handoff; npm run verify:pre-pr passed the full lane on aw-006-my-training-feedback-semantics with lint, typecheck, unit tests, build, perf budgets, and Playwright; perf trend recommendation stayed hold because worst margin was 14.6% against the 15.0% tighten threshold | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-05-24 | done | PR #834 merged as 5a7430d after green CI and npm run verify:pre-merge; repo-managed closeout moves this brief to done and records final evidence | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`

## Completion Record

- `completed`: `2026-05-24`
- `merged_pr`: `#834`
- `squash_commit`: `5a7430da63a45fbf6a5316a3edf6c9d55084e5dc`
- `result`: Closed AW-006 My Training Feedback Semantics. My Training feedback now uses clearer, accessible status/error/empty-state semantics while preserving existing Training Context data, API payloads, local drafts, Goals bridge links, analytics, focus/note workflow rules, and support scope.
- `validation`: Targeted My Training unit tests, `npm run typecheck`, `npm run lint:briefs:all`, `git diff --check`, route/label/support sweep, owner-approved screenshot handoff, `npm run verify:pre-pr`, GitHub CI for PR `#834`, and `npm run verify:pre-merge`.
- `screenshot_artifacts`: `output/aw-006-my-training-feedback-2026-05-24-192826`
- `10/10 claim`: yes - all critical target categories reached `5/5`; no target category remains below release threshold.

| Category                                      | Achieved Score | Evidence                                                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | `/my-library/training` stayed the canonical My Training surface; PR `#834`; diff review.                                                       | None.        |
| UX flow clarity                               | `5/5`          | Focused tests and screenshot handoff covered schema, offline, load, context, action success/error, first-run empty, and no-results states.     | None.        |
| Visual design quality                         | `5/5`          | Owner-approved `after/reference` screenshot handoff in `output/aw-006-my-training-feedback-2026-05-24-192826`.                                 | None.        |
| Business logic correctness and data integrity | `5/5`          | Unit tests preserved focus/note create, update, status, refresh, local draft, filter, selected-goal, and Goals bridge behavior.                | None.        |
| Accessibility (a11y)                          | `5/5`          | Testing Library role/aria assertions cover polite status, assertive alert, and static empty semantics.                                         | None.        |
| Accessibility                                 | `5/5`          | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility evidence.                                        | None.        |
| Data placement and sync boundaries            | `5/5`          | Diff review confirmed server-canonical Training Context data and local-only drafts/state stayed in existing boundaries.                        | None.        |
| Reliability and failure handling              | `5/5`          | Failure-path unit coverage keeps retry/recovery visible without hiding current focus, notes, drafts, selected goal, or active filters.         | None.        |
| Privacy and compliance                        | `5/5`          | Copy/error review confirmed no secrets, raw diagnostics, identifiers, entitlement details, provider diagnostics, or new private data exposure. | None.        |
| Content governance                            | `5/5`          | AW-006 queue and notice/empty-state inventory updated with shipped slice state.                                                                | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused `TrainingContextHub`, route-local helper, Tailwind tokens, and existing tests; no new dependency.                                       | None.        |
| Testing and QA automation                     | `5/5`          | `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` all passed.                                                                 | None.        |
| DevOps and rollback readiness                 | `5/5`          | Normal revert rollback; no migrations, package changes, env changes, provider changes, or workflow changes.                                    | None.        |
