# Task Brief: AW-006 Workout Editor Export And Handoff Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-24-aw-006-workout-editor-export-handoff-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-24`
- `updated`: `2026-05-24`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-workout-editor-export-feedback`
- `execution mode`: `end-to-end implementation after owner approved the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-24`
- `base`: `main@671efda`
- `audit_status`: `ready`
- `decision`: Execute a bounded member/export feedback slice on Workout Editor PDF, Poolside PDF, Garmin-ready JSON, and handoff actions.
- `reason`: PR `#826` and repo-managed closeout `#827` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `WorkoutEditor` still renders export and handoff success/error outcomes as plain route-local text, while Program Builder, Guide PDF, and Poolside image export now provide mature accessible feedback references.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `WorkoutEditor`, workout export adapter contracts, workout PDF/Poolside preview behavior, Program Builder export feedback, Guide PDF feedback, Poolside image export feedback, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make Workout Editor PDF, Poolside PDF, Garmin-ready JSON, and text handoff feedback clearer, accessible, and visually consistent without changing workout data, export artifacts, filenames, adapter behavior, or persistence.

## Pre-Implementation Owner Explanation

Jeg skal gjore eksport- og handoff-meldingene i Workout Editor tydeligere naar brukeren apner PDF/Poolside PDF, laster ned Garmin-ready JSON, kopierer handoff eller laster ned handoff-tekst. Det betyr noe fordi eksport og print er tillitskritiske handlinger: brukeren maa se om handlingen gikk bra, feilet, eller kan proves igjen. Utenfor scope er treningsdata, PDF/JSON-format, filnavn, eksportadaptere, API-er, auth, Supabase, Stripe, analytics, planner/programmer og bred redesign. Fremoverkompatibilitet ivaretas ved at feedbacken knyttes til eksporttype/action, slik at nye workout-eksporter kan bruke samme generiske pending/success/error-form uten aa endre artifact-kontrakter.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Workout Editor remains the canonical manual session editing/export surface; feedback stays near the existing PDF, Poolside PDF, JSON, and handoff actions with no new route fork. | unit tests + screenshot handoff                  | `5/5`                   |
| UX flow clarity                               | `target`     | Export/handoff success and failure outcomes are visible, named, recoverable, and do not create dead-end states.                                                                   | focused tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses the existing member/export visual language, stable spacing, readable contrast, and no broad builder redesign.                                                       | screenshot handoff + class review                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Workout save state, local/saved draft state, PDF popup behavior, Poolside preview draft storage, JSON/text download payloads, filenames, and object URL cleanup remain intact.    | focused unit tests + diff review                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing, notes, QR, or operator editing workflow.                                                                  | changed-files review                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Feedback uses appropriate `status`/`alert` live-region semantics, export buttons keep accessible names, and described-by wiring points to active feedback only where practical.   | unit tests + screenshot/DOM review               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route data fetch, heavy client library, polling loop, or background job is added; `/my-library/workouts` keeps existing budgets.           | dependency diff + broad gates                    | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because the only new state is transient client UI feedback for existing export actions; no storage, server-canonical data, or sync boundary changes.                          | data contract section                            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, mutation response, revalidation, or invalidation behavior changes.                                                                  | cache scope rationale                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Download/copy/popup failures produce deterministic safe feedback and allow retry without corrupting workout draft or saved state.                                                 | focused tests + export QA                        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and export route behavior remain unchanged; feedback exposes no raw diagnostics, secrets, or provider internals.                         | diff review + route-boundary review              | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include user identifiers, entitlement details, raw provider diagnostics, secrets, env values, or private workout contents beyond existing generated filenames.  | copy/error review                                | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active Workout Editor export/handoff feedback slice.                                                          | docs diff                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                           | explicit admin workflow scope rationale          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this touches protected/member utility UI and changes no public metadata, sitemap, robots, canonical URL, or structured public content.                                | changed-files review                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected utility/member surface changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                | changed-files review                             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                                | analytics scope rationale                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                      | explicit commerce scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                           | explicit support-ops scope rationale             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                          | explicit finance scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English UI strings are short, grouped by export action, and avoid grammar-coupled layout assumptions that would block later localization.                | copy/layout review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `WorkoutEditor`, Tailwind/member export patterns, Program Builder/Guide/Poolside feedback references, and focused tests; add no package or API layer.              | changed-files/dependency diff                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                                  | test commands + screenshot handoff + later gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                          | diff review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                                 | git diff + validation evidence                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `ProgramBuilderHub` export feedback for structured cards and live-region semantics, `GuidePdfDownloadButton` for compact download pending/error semantics, and `PoolsidePreviewPageClient` for artifact-adjacent status cards.
  - Keep implementation inside the existing client component `WorkoutEditor`.
  - Do not change route boundaries, server actions, API routes, auth redirects, export adapter ownership, or route cache behavior.
  - Session-step reference contract: this slice does not change scheduled workout step rendering, `SessionStepSurfaceRenderer`, draft mutation behavior, or `docs/design/session-step-surface-contract.md`.
- TypeScript/domain contracts:
  - Preserve workout draft types, saved workout identity, export filename helpers, handoff text generation, Garmin-ready export preview, PDF HTML generation, Poolside preview draft storage, and object URL cleanup.
  - Add only route-local presentation state/shape for feedback tone/title/message when needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing Tailwind/member export visual language and recent AW-006 export feedback direction.
  - Do not create a broad app-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Workout Editor export/handoff feedback to Program Builder/Poolside export feedback references.
- Testing:
  - Update focused Vitest coverage for success/error live-region semantics and unchanged PDF/Poolside PDF/JSON/handoff behavior.
  - Keep existing export e2e aligned unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no persisted local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive-data handling. The only state remains transient React UI state for existing Workout Editor export/handoff actions. Existing Poolside preview draft storage continues unchanged.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing workout IDs, workout titles, draft-state labels, and generated filename behavior must remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: Workout Editor feedback for standard PDF, Poolside PDF, Garmin-ready JSON download, handoff copy, and handoff text download.
  - Not touched: export adapter contracts, artifact schemas, filenames, workout IDs, draft data, auth, analytics, API shape, provider integrations, or Poolside preview rendering.
- Source of truth:
  - Export availability and copy continue to derive from the currently loaded `draft`, `savedWorkout`, `handoffDraftState`, and existing filename/export helper outputs.
- Additive behavior:
  - New Workout Editor export actions can reuse the same pending/success/error feedback shape without changing workout data or artifact contracts.
  - Unknown future export types should use generic export copy until they receive explicit type-specific labels.
- Explicit mapping requirements:
  - New export formats, provider delivery, downloadable artifacts, print views, support promises, or user-facing workflow labels require explicit copy/test/doc review before release.
  - Any export format that changes artifact schema, filename, auth, provider behavior, or support procedure requires a separate implementation brief.
- Unknown or deprecated values:
  - Unknown export actions must fail safely with generic "export failed" feedback or remain unavailable; they must not claim a generated artifact exists unless the existing action completed.
  - Deprecated export paths should preserve route-owned errors and show recoverable feedback without exposing raw diagnostics.
- Test/evidence:
  - Focused tests assert feedback semantics for successful and failed existing export/handoff actions while preserving the same filenames, payloads, popup behavior, and preview draft state.
  - Route/label/support sweep checks Workout Editor export identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing Workout Editor export and handoff actions. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted export/action sweep because this slice changes user-facing Workout Editor export and handoff feedback.

- Identifiers to search before broad gates:
  - `WorkoutEditor`
  - `workout-editor-pdf`
  - `workout-editor-poolside-pdf`
  - `workout-editor-garmin-export`
  - `workout-editor-handoff`
  - `Garmin-ready JSON`
  - `Workout handoff`
  - `Download .json`
  - `Download .txt`
  - `Copy handoff`
  - `Could not download the Garmin-ready JSON`
  - `Could not open the full-session PDF`
  - `Could not open the poolside note PDF`
- Surfaces to check:
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - relevant e2e specs if selectors/semantics change
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - Workout Editor component, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No PDF/JSON/text artifact contract, export adapter, Poolside preview rendering, entitlement/auth, analytics, API, Help/Guide, support-procedure, or admin workflow fallout.

## Scope

- Improve `components/my-library/workouts/WorkoutEditor.tsx` feedback presentation and accessibility semantics for:
  - standard PDF open success/error,
  - Poolside PDF/print preview open success/error,
  - Garmin-ready JSON download success/error,
  - handoff copy success/error,
  - handoff text download success/error.
- Preserve workout draft editing, save/delete/discard behavior, export preview behavior, JSON/text download payloads, PDF popup behavior, Poolside preview draft storage, filenames, and object URL cleanup.
- Update focused tests in `tests/unit/workout-builder-hub.test.tsx` and e2e expectations only if selectors/semantics require it.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Workout data model, step rendering, session-step shared renderer, save/delete/discard logic, generator behavior, export adapter payloads, generated JSON/PDF/text schemas, filenames, PDF/print layout, Poolside preview rendering/capture, Program Builder, Supabase, auth, entitlements, Stripe, analytics, database migrations, packages, new dependencies, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, and merge without explicit owner approval.

## Acceptance Criteria

1. Standard PDF and Poolside PDF actions keep the same popup/print-preview behavior, draft-state source, filenames, and Poolside preview draft storage.
2. Garmin-ready JSON download keeps the same payload, filename, object URL cleanup, and preview behavior.
3. Handoff copy/download keeps the same text content, filename, clipboard behavior, object URL cleanup, and preview behavior.
4. Success and failure feedback is visible near the relevant actions, semantically announced, and connected to active buttons with `aria-describedby` where practical.
5. Existing workout edit/save/delete/discard behavior remains unchanged.
6. Focused unit tests cover changed feedback semantics and unchanged export/handoff behavior.
7. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
8. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/workout-builder-hub.test.tsx` passed on 2026-05-24.
- `npm run typecheck` passed on 2026-05-24.
- `git diff --check` passed on 2026-05-24.
- `npm run lint:briefs:all` passed on 2026-05-24 after active queue wording cleanup.
- targeted route/label/support sweep found only expected Workout Editor/export feedback fallout.

Visual/export-adjacent gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Captured representative `after/reference` screenshots against `http://127.0.0.1:3000` in `output/aw-006-workout-editor-export-feedback-2026-05-24-114744`.
- Owner screenshot approval stop completed on 2026-05-24 before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr`
- commit and push
- open/update PR
- required PR CI checks green
- before merge recommendation:
  - `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture Workout Editor export/handoff states on desktop and mobile/tablet where practical:
  - reference idle Workout Editor support tools,
  - after handoff copy/download success,
  - after Garmin-ready JSON success,
  - after PDF open success,
  - after PDF/export error where practical.
- Use `after/reference` naming because the handoff compares changed Workout Editor export feedback to mature Program Builder/Poolside/Guide export feedback references rather than a true before-state.
- For export-adjacent validation, inspect full-resolution artifacts and keep focused unit coverage around actual PDF/Poolside PDF/JSON/handoff behavior. No generated artifact contract change is intended.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Session Continuity And Recovery

- Canonical source of truth: branch `aw-006-workout-editor-export-feedback` and this brief.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-05-24 | in-progress | started from clean main@671efda after PR #826 and repo-managed closeout #827; post-merge preflight was reported green with no closeout remaining; owner approved Workout Editor Export And Handoff Feedback Semantics as the next bounded AW-006 UI/export-adjacent slice; branch aw-006-workout-editor-export-feedback created | next: implement Workout Editor export/handoff feedback, update tests/docs, run targeted QA, then capture screenshot handoff before broad gates`
- `2026-05-24 | in-progress | implemented Workout Editor structured export/handoff feedback, focused unit coverage, queue/design doc updates, targeted QA, and after/reference screenshot handoff; owner screenshot approval stop completed | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
