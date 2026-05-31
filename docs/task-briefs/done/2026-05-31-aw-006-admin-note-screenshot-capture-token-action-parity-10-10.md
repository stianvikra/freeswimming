# Task Brief: AW-006 Admin Note Screenshot Capture Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-note-screenshot-capture-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner said continue`
- `branch`: `aw-006-admin-screenshot-capture-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@c54bffb`
- `audit_status`: `completed`
- `decision`: Completed this AW-006 UI slice through PR `#922`.
- `reason`: `main` is clean and synced after PR `#920` and repo-managed closeout PR `#921`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminNoteScreenshotCaptureButton` as a small admin notes utility that already has state-primitive parity but still uses older local `rounded-2xl`/`slate`/`blue` action and modal styling inside the screenshot capture dialog.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminNoteScreenshotCaptureButton.tsx`, `AdminNotesManager`, `AdminManagerState`, screenshot capture client behavior, admin notes upload/recovery behavior, Help/Guide assertions, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the admin note screenshot capture trigger, dialog shell, preview panels, crop controls, and visible actions with the current AW-006 admin token/action hierarchy without changing browser capture, crop math, upload handoff, note attachment behavior, recovery behavior, API/auth behavior, labels, Help/Guide, or support procedures.

## Pre-Implementation Owner Explanation

Vi gjor screenshot-flyten i admin-notater visuelt lik resten av den nye adminflaten, slik at knapper, dialog og preview blir enklere aa skanne. Det betyr mindre visuell restgjeld rundt en nyttig hverdagsfunksjon. Utenfor scope er hvordan screenshots tas, klippes, lastes opp eller knyttes til notater, samt API-er, auth, database, labels, Help/Guide og supportprosedyrer.

Fremoverkompatibilitet: nye screenshot-feil, note-vedlegg og opplastingsutfall skal bruke samme lokale status/action-moenster eller faa eksplisitt mapping/test. Nye workflow-handlinger eller capture-faser krever owner-beslutning, Help/Guide-vurdering og fallback foer release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Admin workflow and editability`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                       | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminNoteScreenshotCaptureButton` presentation and keep the AW-006 queue/design inventory accurate after #920/#921.                                          | active brief + queue/inventory diff + changed-files review | `5/5`                   |
| UX flow clarity                               | `target`     | Capture start, permission recovery, unsupported fallback, preview guidance, region reset, cancel, and save screenshot actions remain easier to scan with no changed step order.          | screenshot handoff + component tests + diff review         | `5/5`                   |
| Visual design quality                         | `target`     | The dialog and controls reuse current `fs-*` card/action/token direction and avoid the older one-off rounded blue/slate treatment without broad redesign.                                | screenshot handoff + DOM/class review                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Browser support detection, hidden capture target handling, capture driver calls, selection math, crop-to-file, save callback, close behavior, and attachment handoff remain unchanged.   | focused unit tests + diff review                           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still capture, retry, use upload fallback, drag-crop, reset to full capture, cancel, and save with no added click or changed action meaning.                                  | component tests + screenshot handoff                       | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dialog label, buttons, live feedback, disabled states, image alt text, pointer surface, and keyboard reachable actions remain semantically clear.                                        | Testing Library assertions + screenshot/manual review      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: token/class reuse adds no dependency, fetch path, repeated render loop, image payload, or material `/admin` payload increase.                                           | package diff + pre-pr gate                                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Screenshot frame, crop selection, message, phase, and preview URL remain component-local/transient; cropped files are still handed to the existing parent upload path only.              | data/sync contract + focused tests + diff review           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                            | cache scope rationale                                      | `N/A`                   |
| Reliability and failure handling              | `target`     | Permission denied, cancelled, unsupported, generic capture error, save error, retry, fallback, and disabled saving states remain deterministic.                                          | focused recovery/save-error tests + diff review            | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route/API/authz, same-origin uploads, screenshot file handling, secrets, cookies, and role boundaries remain untouched.                                                  | unchanged auth/API diff review + existing security gates   | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because screenshots may contain private admin/member data; the slice must not expose extra screenshot data, logs, raw URLs, or storage paths beyond existing authorized flow. | privacy/attachment diff review                             | `4/5`                   |
| Content governance                            | `target`     | Existing screenshot capture copy, labels, admin notes recovery runbook references, support procedures, and AW-006 docs source of truth are preserved or updated for this slice.          | copy-preservation diff review + docs update                | `5/5`                   |
| Admin workflow and editability                | `target`     | Screenshot capture remains an admin notes utility action with the same capture, crop, fallback, save, and parent upload contract.                                                        | targeted tests + changed-files review                      | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                             | SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                      | AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                  | diff review                                                | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                     | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting because admin notes may support incident work, but this slice preserves screenshot workflow labels, recovery behavior, runbook paths, and support procedures.                 | route/label/support sweep + copy-preservation diff review  | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                 | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin labels and avoids tight fixed-width assumptions.                     | copy-preservation diff + screenshot text-fit review        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current admin `fs-*` token/action direction and existing `AdminManagerState`; keep screenshot client/helper APIs unchanged and add no dependency.                                  | component diff + package diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused unit coverage for screenshot token/action classes and preserved behavior; run targeted tests, brief lint, sweep, screenshot handoff, and broad gates after approval.  | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because future screenshot preview states should inherit the same local treatment without extra services, infrastructure, or recurring cost.                                   | component rendering diff review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                | git diff review + validation gates                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `AdminNotesManager` after PR `#920`, nearby admin manager token/action slices, and `AdminManagerState`.
  - `AdminNoteScreenshotCaptureButton` stays a client component.
  - Route/action/API boundary remains unchanged; the parent note form still owns upload/attachment behavior.
  - Cache/revalidation behavior remains unchanged; no fetch or route cache behavior is added.
- TypeScript/domain contracts:
  - Preserve `AdminScreenshotCapturePhase`, `AdminScreenshotFrame`, `AdminScreenshotSelection`, screenshot error classification, capture driver override contract, and `onCaptureReady` callback semantics.
  - Deterministic invariant: styling changes cannot alter phase transitions, selection bounds, crop-to-file payload, or close/save decisions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, storage bucket, signed URL, index, or query shape change.
- External services/tools:
  - Preserve browser capture API use through the existing capture driver abstraction.
  - No provider SDK, webhook, secret, retry, observability, or outbound delivery behavior changes.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, CSS variables, and local quiet/destructive action classes where practical.
  - Keep the change utility-local; do not introduce a broad shared Button/Card/Dialog primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed screenshot capture dialog states to current tokenized Notes/admin manager references.
- Testing:
  - Update focused unit tests for screenshot capture class/token expectations and preserved capture/save/cancel behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - None changed. Saved admin note rows and attachments remain owned by existing admin note APIs/storage through the parent manager.
- Local data:
  - Dialog open state, phase, screenshot frame blob, preview URL, crop selection, pointer start, and message remain component-local/transient.
  - No browser storage, persistence key, local draft, or cross-device sync behavior is introduced.
- Sync policy:
  - Successful crop/save still calls `onCaptureReady(file)` and lets the parent flow own upload/sync.
  - Failures remain visible through existing phase/message states with retry/fallback behavior.
- Retention and sensitivity:
  - Preview URL revocation, transient Blob/File handling, and admin-only screenshot flow remain unchanged.
- Cache/invalidation:
  - N/A; this component has no route/data cache behavior.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing note IDs, attachment IDs, screenshot file names, and admin route contexts are not changed.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Screenshot capture phases, recovery messages, preview crop controls, capture action labels, and parent upload outcomes.
- Source of truth:
  - Phase values and capture error classification come from `@/lib/admin/screenshot-capture`.
  - Visual treatment comes from current admin `fs-*` tokens and `AdminManagerState`.
  - Upload/attachment outcomes remain owned by the parent admin notes manager and existing upload helpers.
- Additive behavior:
  - Existing permission, cancellation, unsupported, generic error, save error, preview, and saving states should inherit the same tokenized shell/action treatment.
- Explicit mapping requirements:
  - New screenshot phases, destructive capture actions, upload workflows, capture providers, attachment kinds, support runbook flows, or Help/Guide instructions require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown thrown errors continue through existing capture error classification or save-error fallback.
  - Unknown typed phase values must fail type review or receive explicit fallback rendering before release.
- Test/evidence:
  - Focused unit tests verify token/action class expectations and unchanged capture, hide-target restore, recovery, save-error, and cancel behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing screenshot capture workflow labels, action meaning, recovery behavior, Help/Guide assertions, admin-notes recovery runbook references, support procedures, and operator instructions. Help/Guide or runbook updates are required if implementation changes capture action meaning, recovery behavior, auth, upload behavior, incident procedure, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Capture screenshot`
  - `Screenshot capture`
  - `Capture did not start`
  - `Capture is not available here`
  - `Retry capture`
  - `Use image upload instead`
  - `Use full capture`
  - `Save screenshot`
  - `AdminNoteScreenshotCaptureButton`
  - `admin-notes-recovery`
- Surfaces to check:
  - `components/admin/AdminNoteScreenshotCaptureButton.tsx`
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-notes-recovery.md`
  - `tests/unit/admin-note-screenshot-capture-button.test.tsx`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Screenshot capture dialog/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminNoteScreenshotCaptureButton.tsx` trigger action, dialog header, permission guidance, recovery action group, preview guidance, preview surface, selected-region detail, full-capture/reset action, cancel action, and save action with the current AW-006 admin token/action direction.
- Preserve screenshot support detection, hidden target behavior, browser capture, crop selection math, `cropToFile`, `onCaptureReady`, modal close behavior, preview URL cleanup, labels, Help/Guide, support procedures, and all API/auth behavior.
- Add or update focused tests for screenshot token/action classes and preserved behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Screenshot capture internals, crop math, capture driver behavior, file naming, upload behavior, note attachment behavior, staged-image recovery behavior, admin notes APIs, admin note schema, category/context APIs, storage, signed URL behavior, admin authz, RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, or storage retention.
- Admin notes manager broader shell/cards/forms, Context Notes, Context QR, Commerce, Operations, QR Registry, Email Templates, Messages, Categories, Help Center, or other manager internals beyond the scoped screenshot capture utility.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. Screenshot capture trigger, dialog shell, preview guidance, preview surface, selected-region panel, and visible actions use the current AW-006 admin token/action direction while preserving labels, disabled states, and user flow.
2. Browser support detection, hidden-target hiding/restoration, capture driver calls, selection math, crop-to-file, save callback, preview URL cleanup, close behavior, and parent upload handoff remain unchanged.
3. Buttons, image alt text, dialog label, live feedback, disabled states, pointer selection surface, and fallback actions remain keyboard/screen-reader clear.
4. Future screenshot phases or upload outcomes must either use the same local status/action treatment or require explicit mapping with tests before release.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-note-screenshot-capture-button.test.tsx`
  - targeted ESLint for changed TSX/test files if needed
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Completion Mode

Stop at screenshot handoff for owner visual approval before broad PR gates. Continue through PR/CI/pre-merge only after screenshot approval.

## Checkpoint Log

- `2026-05-31 | in-progress | started from clean main@c54bffb after PR #920 and repo-managed closeout #921; post-merge preflight passed with no closeout remaining; owner said continue after the Norwegian non-programmer explanation, so Admin Note Screenshot Capture Token/Action Parity was selected on branch aw-006-admin-screenshot-capture-token-parity | next: update queue/inventory, implement scoped screenshot capture token/action parity, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-31 | targeted-qa | implemented scoped screenshot capture token/action parity for the trigger, modal header, recovery actions, preview panel, selected-region panel, and reset/cancel/save actions while preserving capture driver, hidden-target restore, crop-to-file, save callback, close behavior, and labels; targeted Vitest, targeted ESLint, typecheck, lint:briefs:all, route/label/support sweep, and git diff --check passed | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot-handoff | captured after/reference visual artifacts against local Next dev at output/aw-006-admin-screenshot-capture-token-parity-2026-05-31-122431: recovery desktop, recovery mobile, save-error desktop, and admin state reference desktop; the first capture set was discarded because it included the Next dev indicator, the final set hides dev overlay, and the temporary fixture route was removed after capture with no scoped product-rendering source changes after the final screenshots | next: owner visual approval or corrections before npm run verify:pre-pr`
- `2026-05-31 | screenshot-approved | owner approved the screenshot handoff in output/aw-006-admin-screenshot-capture-token-parity-2026-05-31-122431; no scoped product-rendering source changed after the final screenshots | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-05-31 | pre-pr-green | npm run verify:pre-pr passed on branch aw-006-admin-screenshot-capture-token-parity after owner screenshot approval; full lane included lint, typecheck, unit tests, build, performance budgets, and Playwright E2E with 102 passed / 492 skipped | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness handoff`
- `2026-05-31 | merged | PR #922 merged to main as squash commit 786e62e after CI and npm run verify:pre-merge passed; post-merge preflight surfaced this repo-managed docs-only closeout | next: move brief to done, record completion evidence, update queue/inventory fallout, validate docs-only closeout, and auto-merge closeout PR if gates stay green`

## Completion Record

- `completed`: `2026-05-31`
- `merged_pr`: `#922`
- `squash_commit`: `786e62e`
- `result`: Closed AW-006 Admin Note Screenshot Capture Token/Action Parity by aligning the admin note screenshot capture trigger, dialog, preview, crop reset, cancel, retry, upload fallback, and save actions with the current admin token/action hierarchy while preserving capture, crop, upload handoff, attachment, recovery, API/auth, labels, Help/Guide, and support behavior.
- `validation`: targeted Vitest, targeted ESLint, typecheck, `npm run lint:briefs:all`, route/label/support sweep, `git diff --check`, screenshot handoff + owner approval, refreshed screenshot artifacts after pre-commit formatting, `npm run verify:pre-pr`, PR #922 CI, and `npm run verify:pre-merge`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.
- `screenshot_artifacts`: `output/aw-006-admin-screenshot-capture-token-parity-2026-05-31-130128`

| Category                                      | Achieved Score | Evidence                                                                                                                      | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #922 changed only the scoped screenshot capture utility, focused tests, queue, inventory, and active brief.                | None.        |
| UX flow clarity                               | `5/5`          | Screenshot handoff and unit tests preserved capture start, retry, upload fallback, full capture reset, cancel, and save flow. | None.        |
| Visual design quality                         | `5/5`          | Refreshed `after/reference` screenshots in `output/aw-006-admin-screenshot-capture-token-parity-2026-05-31-130128`.           | None.        |
| Business logic correctness and data integrity | `5/5`          | Capture driver, crop math, save callback, upload handoff, and attachment behavior were unchanged; unit tests passed.          | None.        |
| Admin editor ergonomics                       | `5/5`          | Visible admin actions now use the same token/action hierarchy without adding steps or changing labels.                        | None.        |
| Accessibility (a11y)                          | `5/5`          | Dialog label, live status, image alt text, disabled states, and button semantics preserved; broad E2E a11y gate passed.       | None.        |
| Data placement and sync boundaries            | `5/5`          | Component-local transient screenshot state stayed local-only; no server/API/storage boundary changed.                         | None.        |
| Reliability and failure handling              | `5/5`          | Permission denied, unsupported, save-error, retry, fallback, preview cleanup, and cancel paths retained focused coverage.     | None.        |
| Security and authz                            | `5/5`          | Admin route/API/auth/storage behavior was untouched; CI security gates passed.                                                | None.        |
| Content governance                            | `5/5`          | Labels, Help/Guide, support copy, queue, and inventory were preserved or updated in scope.                                    | None.        |
| Admin workflow and editability                | `5/5`          | Existing admin screenshot workflow remains editable and recovery-safe with no changed operational procedure.                  | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing admin-local component patterns, `fs-*` token/action direction, and lucide icons already in the project.       | None.        |
| Testing and QA automation                     | `5/5`          | Targeted tests, full pre-PR, PR CI, and full pre-merge all passed.                                                            | None.        |
| DevOps and rollback readiness                 | `5/5`          | Single scoped squash commit `786e62e`; rollback is isolated to one component, one unit test, and docs.                        | None.        |
