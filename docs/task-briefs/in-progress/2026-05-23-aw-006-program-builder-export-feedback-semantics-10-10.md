# Task Brief: AW-006 Program Builder Export Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-23-aw-006-program-builder-export-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-program-builder-export-feedback`
- `execution mode`: `end-to-end implementation after owner approved the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@c18d11c`
- `audit_status`: `ready`
- `decision`: Execute a bounded member/export feedback slice on Program Builder export actions.
- `reason`: PR `#824` and repo-managed closeout `#825` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `ProgramBuilderHub` still renders Garmin-ready JSON and Program PDF export notices as plain route-local text, while Guide PDF and Poolside image export already provide mature accessible feedback references.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `ProgramBuilderHub`, program export route behavior, program PDF/JSON artifact contracts, Guide PDF feedback, Poolside image export feedback, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make Program Builder JSON/PDF export feedback clearer, accessible, and visually consistent without changing program data, export routes, generated artifact formats, filenames, auth, or persistence behavior.

## Pre-Implementation Owner Explanation

Jeg skal gjore programbyggerens eksportmeldinger tydeligere naar brukeren laster ned Garmin-ready JSON eller apner program-PDF. Det betyr noe fordi eksport/print er tillitskritiske handlinger: brukeren maa se om handlingen jobber, er ferdig eller feilet. Utenfor scope er programdata, API-er, PDF/JSON-format, filnavn, auth, Supabase, Stripe, planner-logikk, workout-editor-endringer og bred designsystem-refaktor. Fremoverkompatibilitet ivaretas ved at feedbacken knyttes til eksport-typen og kan gi trygg generisk fallback for nye program-eksporter uten aa endre data- eller API-kontrakt.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Program Builder remains the saved canonical program planning/export route; JSON/PDF feedback stays near the existing export actions with no new route or workflow fork.  | unit tests + screenshot handoff                  | `5/5`                   |
| UX flow clarity                               | `target`     | JSON download pending/success/error and PDF opened/blocked outcomes are visible, named, recoverable, and do not create a dead end.                                       | focused tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses existing member/export visual language, stable spacing, readable contrast, and no broad builder redesign.                                                  | screenshot handoff + class review                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Program save state, export preview fetch, JSON download payload, object URL cleanup, PDF route, popup behavior, filenames, and canonical program identity remain intact. | focused unit/e2e tests + diff review             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing, notes, QR, or operator editing workflow.                                                         | changed-files review                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Export feedback uses appropriate `status`/`alert` live-region semantics, export buttons keep accessible names, and described-by wiring points to active feedback only.   | unit tests + screenshot/DOM review               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route data fetch, heavy client library, or background job is added; `/my-library/programs/[programId]` keeps existing budgets.    | dependency diff + broad gates                    | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because the only new state is transient client UI feedback for existing export actions; no local storage, server-canonical data, or sync boundary changes.           | data contract section                            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, export fetch cache policy, mutation response, revalidation, or invalidation behavior changes.                                           | cache scope rationale                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Export download failures and blocked PDF popups produce deterministic safe feedback and allow retry without corrupting saved program state.                              | focused tests + export QA                        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and export route authorization remain unchanged; no sensitive diagnostics or raw server details are exposed in feedback.        | diff review + route-boundary review              | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include user identifiers, entitlement details, raw provider diagnostics, secrets, env values, or private program contents beyond existing filenames.   | copy/error review                                | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active Program Builder export feedback slice.                                                        | docs diff                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                  | explicit admin workflow scope rationale          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this touches a protected member route and changes no public metadata, sitemap, robots, canonical URL, or structured public content.                          | changed-files review                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected utility/member surface changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                       | changed-files review                             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                       | analytics scope rationale                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                             | explicit commerce scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no support workflow, alert path, incident response process, recovery procedure, runbook, or operator diagnostic surface.                  | explicit support-ops scope rationale             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.    | explicit finance scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English UI strings are short, grouped by export type, and avoid grammar-coupled layout assumptions that would block later localization.         | copy/layout review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `ProgramBuilderHub`, Tailwind/member export patterns, Guide PDF/Poolside feedback references, and focused tests; add no package or API layer.             | changed-files/dependency diff                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, targeted e2e where relevant, brief lint, route/label/support sweep, and screenshot handoff cover the changed surface before broad gates.          | test commands + screenshot handoff + later gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                 | diff review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                        | git diff + validation evidence                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `GuidePdfDownloadButton` for compact download pending/error semantics and `PoolsidePreviewPageClient` for export-adjacent status cards.
  - Keep implementation inside the existing client component `ProgramBuilderHub`.
  - Do not change route boundaries, server actions, API routes, auth redirects, export route ownership, or route cache behavior.
  - Session-step reference contract: this slice does not change scheduled workout step rendering, `ScheduledWorkoutStepPreview`, the shared renderer, or `docs/design/session-step-surface-contract.md`; existing session-step/domain parity remains governed by that contract.
- TypeScript/domain contracts:
  - Preserve `ProgramEditorRecord`, `ProgramLibrarySnapshot`, export filename helpers, export route paths, preview retry model, and JSON/PDF response assumptions.
  - Add only route-local presentation state for feedback tone/title/message.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing Tailwind/member visual language and the recent export feedback direction.
  - Do not create a broad app-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Program Builder export feedback to the mature Poolside/Guide export feedback references.
- Testing:
  - Update focused Vitest coverage for success/error live-region semantics and unchanged JSON/PDF behavior.
  - Keep existing program export e2e aligned.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no persisted local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive-data handling. The only state remains transient React UI state for existing program export actions.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing program IDs, program titles, and generated filename behavior must remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: Program Builder export feedback for Garmin-ready JSON preview/download and Program PDF open action.
  - Not touched: export route contracts, artifact schemas, filenames, program IDs, planner data, auth, analytics, API shape, or provider integrations.
- Source of truth:
  - Export availability and route paths continue to derive from the currently loaded canonical `savedProgram`.
  - Export filenames continue to derive from existing `buildProgramGarminReadyExportFileName` and `buildProgramPdfFileName` helpers.
- Additive behavior:
  - New Program Builder export actions can reuse the same pending/success/error feedback shape without changing program data or route contracts.
  - Unknown future export types should use generic export copy until they receive explicit type-specific labels.
- Explicit mapping requirements:
  - New export formats, provider delivery, downloadable artifacts, print views, or support promises require explicit copy/test/doc review before release.
  - Any export format that changes artifact schema, filename, auth, or provider behavior requires a separate implementation brief.
- Unknown or deprecated values:
  - Unknown export formats must fail safely with generic "export failed" feedback or remain unavailable; they must not claim a generated artifact exists unless the route returns it.
  - Deprecated export routes should preserve existing route-owned errors and show recoverable feedback without exposing raw diagnostics.
- Test/evidence:
  - Focused tests assert feedback semantics for successful and failed existing export actions while preserving the same routes and filenames.
  - Route/label/support sweep checks Program Builder export identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing Program Builder export actions. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted export/action sweep because this slice changes user-facing Program Builder export feedback.

- Identifiers to search before broad gates:
  - `ProgramBuilderHub`
  - `program-editor-garmin-export`
  - `program-editor-pdf`
  - `Garmin-ready JSON`
  - `Program PDF`
  - `Download .json`
  - `Open print view`
  - `Could not download the program export`
  - `Could not open the program PDF print view`
- Surfaces to check:
  - `components/my-library/programs/ProgramBuilderHub.tsx`
  - `tests/unit/program-builder-hub.test.tsx`
  - `tests/e2e/my-library-program-export.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - Program Builder component, focused unit/e2e tests if needed, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No PDF/JSON artifact contract, export route, entitlement/auth, analytics, API, Help/Guide, support-procedure, or admin workflow fallout.

## Scope

- Improve `components/my-library/programs/ProgramBuilderHub.tsx` JSON/PDF export feedback presentation and accessibility semantics.
- Preserve program export preview retry behavior, JSON download behavior, PDF popup behavior, routes, filenames, and object URL cleanup.
- Update focused tests in `tests/unit/program-builder-hub.test.tsx` and e2e expectations only if selectors/semantics require it.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Program data model, planner behavior, saved program identity, week/day assignment behavior, API routes, export route payloads, generated JSON/PDF schemas, filenames, PDF/print layout, workout-editor export UI, Supabase, auth, entitlements, Stripe, analytics, database migrations, packages, new dependencies, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, and merge without explicit owner approval.

## Acceptance Criteria

1. Garmin-ready JSON download keeps the same route, payload, filename, object URL cleanup, and retry behavior.
2. JSON download pending, success, and failure feedback is visible near the action, semantically announced, and connected to the button with `aria-describedby` only while present.
3. Program PDF open success and blocked-popup failure feedback is visible, semantically announced, and does not change PDF route behavior.
4. Export preview retry/loading/error behavior remains deterministic.
5. Existing saved program edit/save behavior remains unchanged.
6. Focused unit tests cover changed feedback semantics and unchanged export behavior.
7. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
8. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/program-builder-hub.test.tsx`
- `npm run lint:briefs`
- `npm run typecheck`
- targeted route/label/support sweep
- `git diff --check`

Visual/export-adjacent gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr`
- commit and push
- open/update PR
- required PR CI checks green
- before merge recommendation:
  - `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture Program Builder export action states on desktop and mobile/tablet where practical:
  - reference idle Program Builder export controls,
  - after JSON export success,
  - after PDF open success,
  - after export error or popup-blocked feedback where practical.
- Use `after/reference` naming because the handoff compares changed Program Builder export feedback to existing mature export feedback references rather than a true before-state.
- For export-adjacent validation, inspect full-resolution artifacts and keep focused unit coverage around actual JSON/PDF behavior. No generated JSON or PDF artifact contract change is intended.

## Screenshot Evidence

- `captured`: `2026-05-23 20:21`
- `artifacts`: `/Users/stianvikra/freeswimming/output/program-builder-export-feedback-2026-05-23-202105`
- `comparison_type`: `after/reference`
- `files`:
  - `reference-program-builder-export-preview-desktop-1440.png`
  - `after-program-builder-json-success-desktop-1440.png`
  - `after-program-builder-json-error-mobile-390.png`
  - `after-program-builder-pdf-blocked-mobile-390.png`
- `capture_note`: Captured through a temporary local fixture route with route-intercepted export responses; the temporary route and script were removed before handoff.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Session Continuity And Recovery

- Canonical source of truth: branch `aw-006-program-builder-export-feedback` and this brief.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@c18d11c after PR #824 and repo-managed closeout #825; post-merge preflight was reported green with no closeout remaining; owner approved Program Builder Export Feedback Semantics as the next bounded AW-006 UI/export-adjacent slice; branch aw-006-program-builder-export-feedback created | next: implement Program Builder export feedback, update tests/docs, run targeted QA, then capture screenshot handoff before broad gates`
- `2026-05-23 | in-progress | implemented route-owned Program Builder export feedback cards for JSON pending/success/error, preview error, and PDF opened/blocked states; updated focused unit coverage, canonical AW-006 queue, and notice inventory; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/program-builder-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, and git diff --check; route/label/support sweep searched ProgramBuilderHub, program-editor-garmin-export, program-editor-pdf, Garmin-ready JSON, Program PDF, Download .json, Open print view, and program export/PDF error copy across components, app, tests, docs/task-briefs, docs/design, and docs/runbooks with expected fallout only in ProgramBuilderHub, focused tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts | next: capture screenshot handoff before npm run verify:pre-pr`
- `2026-05-23 | in-progress | captured screenshot handoff at output/program-builder-export-feedback-2026-05-23-202105 after dev-server QA against a temporary fixture route; removed temporary route and capture script; final targeted validation passed with ./node_modules/.bin/vitest run tests/unit/program-builder-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check, and npm run lint; lint has one pre-existing warning in output/capture-aw006-dryland-feedback.mjs and no errors | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-23 | in-progress | owner approved screenshot handoff; first npm run verify:pre-pr attempt stopped in quality-gate evidence because program/workout-domain changes require explicit session-step reference contract evidence; brief now records that scheduled workout step rendering, shared renderer behavior, and docs/design/session-step-surface-contract.md are unchanged by this export-feedback slice | next: rerun npm run verify:pre-pr`
- `2026-05-23 | in-progress | npm run verify:pre-pr passed on second attempt after evidence fix; full lane covered quality gates, admin/env/pr-body lints, lint with one pre-existing output/capture-aw006-dryland-feedback.mjs warning and no errors, typecheck, 1205 unit tests, production build, perf budgets, and Playwright with 98 passed / 478 skipped; perf-budget recommendation was hold because worst margin was 14.5% against the 15.0% tighten threshold | next: rerun npm run verify:pre-pr after this checkpoint-only brief update, then commit and push`
