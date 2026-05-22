# Task Brief: AW-006 Admin Note Screenshot Capture Feedback State Parity (10/10)

## Metadata

- `id`: `2026-05-22-aw-006-admin-note-screenshot-capture-feedback-state-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-22-aw-006-admin-qr-registry-asset-feedback-state-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-screenshot-feedback-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@2f41bb6`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded admin note screenshot-capture feedback parity pass for `AdminNoteScreenshotCaptureButton`.
- `reason`: `main` is clean after PR `#802` and repo-managed closeout `#803`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code re-audit found no selected AW-006 slice, one stale queue phrase about the completed QR Registry pass, and a small mature UI gap where screenshot-capture recovery/save-error feedback still uses route-local markup instead of the existing admin-local `AdminManagerState` primitive.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminNoteScreenshotCaptureButton`, `AdminManagerState`, admin notes screenshot capture behavior, admin notes Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring admin note screenshot-capture recovery and save-error feedback into parity with the existing admin-local state primitive without changing screenshot capture, crop, upload, note attachment, recovery, authz, API, database, or support behavior.

## Pre-Implementation Owner Explanation

Vi gjor screenshot-feilmeldingene i admin-notater mer like resten av adminsystemet, slik at feilstater blir tydeligere og mer tilgjengelige. Dette er en liten kvalitetsslice rundt meldingsvisning, ikke en endring i hvordan screenshots tas, klippes, lastes opp eller lagres. Utenfor scope er note-upload/recovery-logikk, QR, content APIs, database, auth, Stripe, analytics og bred redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminNoteScreenshotCaptureButton` feedback rendering and keep the AW-006 canonical queue accurate after `#802/#803`.                                  | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Permission-denied/cancelled/unsupported/capture-error and save-error feedback remains visible, specific, and close to the screenshot capture action.                              | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated screenshot feedback uses the existing `AdminManagerState` visual contract and matches the admin state family without broad modal redesign.                               | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Screenshot support detection, browser capture, crop-to-file, save callback, close behavior, and note attachment handoff remain unchanged.                                         | focused component tests + diff review                              | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still get clear retry/fallback feedback while using screenshot capture without extra clicks or changed action labels.                                                      | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic screenshot recovery/save-error feedback uses appropriate live-region semantics and introduces no unlabeled controls, focus traps, or noisy static states.                 | component tests for role/aria + screenshot/manual review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                   | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                     | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                     | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Screenshot feedback remains deterministic from existing `phase` and `message` state; retry, fallback, save failure, and close behavior are not changed.                           | component tests for recovery/save-error rendering                  | `5/5`                   |
| Security and authz                            | `target`     | Protected admin note APIs, credentials, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                           | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no screenshot payload, user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                           | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin notes screenshot copy, queue, and design inventory are preserved or explicitly updated for this slice only.                                                        | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Screenshot capture, retry, use-image-upload fallback, preview, crop, full-capture reset, cancel, and save screenshot actions keep existing labels, disabled states, and behavior. | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                 | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                               | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin screenshot actions continue to use current behavior.                                              | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin note screenshot feedback only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.     | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                              | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                   | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                  | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, keep the helper API unchanged, and add no dependency.                                                   | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for screenshot feedback; run targeted tests, brief lint, screenshot handoff, and broad gates after screenshot approval.                            | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                           | helper reuse in one bounded screenshot-capture area                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                         | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially existing `AdminManagerState` recovery/error feedback consumers.
  - Reuse `components/admin/AdminManagerState.tsx` inside `AdminNoteScreenshotCaptureButton`; do not move capture state, modal ownership, callbacks, or screenshot driver logic.
  - Route/action/API boundary: admin notes APIs, screenshot capture client helpers, and auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve `AdminScreenshotCapturePhase`, `AdminScreenshotFrame`, `AdminScreenshotSelection`, screenshot error classification, crop-to-file behavior, and `onCaptureReady` callback semantics.
  - Deterministic invariant: feedback renders only from existing `phase` and `message` state and does not alter capture/save decisions.
- Supabase/data layer:
  - N/A; no schema, migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and keep the primitive admin-local.
  - Screenshot handoff comparison type: `after/reference`, comparing changed screenshot-capture feedback with mature admin manager state references where practical.
- Testing:
  - Add focused unit/component tests for screenshot recovery and save-error feedback semantics.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive data handling, or cache invalidation. Screenshot frames and cropped files remain transient browser memory as they already are.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing note IDs, attachment IDs, screenshot file names, and admin route contexts are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing screenshot feedback rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Capture did not start`
  - `Capture is not available here`
  - `Retry capture`
  - `Use image upload instead`
  - `Could not upload screenshot`
  - `Could not save screenshot`
  - `AdminNoteScreenshotCaptureButton`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminNoteScreenshotCaptureButton.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-note-screenshot-capture-button.test.tsx`
  - `tests/unit/admin-manager-state.test.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - selected screenshot feedback states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminNoteScreenshotCaptureButton.tsx` to `AdminManagerState`:
  - capture permission/cancelled/unsupported/error recovery feedback,
  - preview save-error feedback.
- Preserve existing copy, modal open/close behavior, retry callback, fallback button, preview/crop behavior, full-capture reset, cancel, save callback, and screenshot driver behavior.
- Add focused unit/component tests under `tests/unit/admin-note-screenshot-capture-button.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API.
- Admin note screenshot capture internals, crop math, capture driver behavior, upload behavior, note attachment behavior, recovery draft behavior, or file naming.
- Admin notes APIs, Context Notes, Context QR, QR APIs, content APIs, admin content editor layout, quick-capture redesign, or admin notes upload/recovery behavior.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminNoteScreenshotCaptureButton` uses the existing `AdminManagerState` helper for capture recovery and preview save-error feedback while preserving copy, callbacks, driver behavior, crop behavior, and sibling actions.
2. Accessibility semantics are explicit: dynamic screenshot recovery/save-error feedback uses live-region semantics appropriate to the state.
3. Focused tests cover permission recovery, unsupported fallback, save-error feedback, and unchanged save/cancel behavior.
4. Canonical AW-006 queue and notice/empty-state inventory record this active slice accurately and remove stale completed-QR active phrasing.
5. Screenshot handoff includes `after/reference` artifacts for representative changed screenshot feedback before `npm run verify:pre-pr`.
6. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-note-screenshot-capture-button.test.tsx tests/unit/admin-manager-state.test.tsx`
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - `npm run lint`
  - `npm run typecheck`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
  - UI debug path: use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; inspect the actual consumed artifact folder before handoff and discard captures with dev overlays or other tool artifacts.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

## Completion Record

- `completed`: `2026-05-22`
- `merged_pr`: `#804`
- `squash_commit`: `8782543`
- `closeout_pr`: repo-managed docs-only closeout for `#804`
- `closeout_commit`: recorded by `main` after closeout merge
- `result`: Shipped the bounded Admin Note Screenshot Capture feedback parity slice: screenshot-capture recovery and preview save-error feedback now reuse the admin-local `AdminManagerState` primitive while screenshot support detection, browser capture, crop-to-file, save callback, modal close behavior, note attachment handoff, authz, APIs, and support behavior stayed unchanged.
- `screenshot_artifacts`: `output/aw-006-admin-screenshot-feedback-2026-05-22-104419`
- `screenshot_comparison`: `after/reference`
- `final_visual_note`: no product-rendering files changed after the approved screenshot capture; this repo-managed closeout is docs-only.
- `10/10 claim`: yes for the bounded screenshot-capture feedback state parity scope; all critical target categories were validated at `5/5`.

Critical target categories confirmed `5/5`:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Admin workflow and editability`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Achieved Score | Evidence                                                                                                                       | Remaining Gap / Recommendation |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Product goals and IA                          | `5/5`          | PR `#804` stayed inside admin note screenshot feedback parity and updated the AW-006 queue/design inventory.                   | No remaining gap.              |
| UX flow clarity                               | `5/5`          | Recovery/save-error feedback remains visible, specific, and close to the screenshot capture action.                            | No remaining gap.              |
| Visual design quality                         | `5/5`          | Approved `after/reference` screenshots show screenshot feedback aligned to the admin manager state pattern.                    | No remaining gap.              |
| Business logic correctness and data integrity | `5/5`          | Focused tests and diff review confirm browser capture, crop-to-file, save callback, close behavior, and handoff stayed stable. | No remaining gap.              |
| Admin editor ergonomics                       | `5/5`          | Retry/fallback, preview, full-capture reset, cancel, and save screenshot actions kept existing labels and flow.                | No remaining gap.              |
| Accessibility (a11y)                          | `5/5`          | Component coverage verifies polite live-region semantics for dynamic recovery/save-error feedback.                             | No remaining gap.              |
| Reliability and failure handling              | `5/5`          | Feedback remains deterministic from existing `phase` and `message` state with retry/fallback behavior preserved.               | No remaining gap.              |
| Security and authz                            | `5/5`          | No admin API, credential, authz, secret, cookie, or protected-route behavior changed.                                          | No remaining gap.              |
| Content governance                            | `5/5`          | Queue, design inventory, and brief evidence were kept aligned with the bounded UI slice and closeout.                          | No remaining gap.              |
| Admin workflow and editability                | `5/5`          | Screenshot capture, fallback upload handoff, preview, crop, cancel, and save actions stayed stable.                            | No remaining gap.              |
| Stack-fit and dependency discipline           | `5/5`          | Reused `AdminManagerState`, added no dependency, and kept the helper API unchanged.                                            | No remaining gap.              |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot approval, `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                                    | No remaining gap.              |
| DevOps and rollback readiness                 | `5/5`          | No migrations/config/workflows/packages changed; rollback is a normal git revert of PR `#804`.                                 | No remaining gap.              |

Remaining gaps: none for this bounded slice.

Defer/fix recommendation: none; no target category is below `4/5`.

### Completed Local Evidence Before Screenshot Approval

- `./node_modules/.bin/vitest run tests/unit/admin-note-screenshot-capture-button.test.tsx tests/unit/admin-manager-state.test.tsx` -> PASS (`2` files, `10` tests).
- `npm run lint:briefs:all` -> PASS.
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS.
- targeted route/label/support sweep -> PASS; hits were expected component/test/docs references only, with no Help/Guide, runbook, API, or e2e contract fallout.
- `git diff --check` -> PASS.
- screenshot handoff captured against `http://127.0.0.1:3000` with comparison type `after/reference`:
  - `/Users/stianvikra/freeswimming/output/aw-006-admin-screenshot-feedback-2026-05-22-104419`
  - Captured: `2026-05-22 10:44`
  - Files: `after-screenshot-capture-recovery-desktop.png`, `after-screenshot-capture-save-error-desktop.png`, `after-screenshot-capture-recovery-mobile.png`, `reference-admin-manager-state-contract-desktop.png`.
  - Temporary local visual route/script were removed after capture; product-rendering files did not change after owner approval.
- owner screenshot approval -> PASS (`2026-05-22`, chat approval: `godkjent`).
- `npm run verify:pre-pr` -> PASS (full public lane on commit `3aab180`; log: `artifacts/test-runs/20260522-114005/verify.log`).
- PR `#804` required CI -> PASS (`verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, Vercel, `deploy-preview`, and `size-check`).
- `npm run verify:pre-merge` -> PASS before merge (marker: `artifacts/verify-pre-merge/20260522-100431.json`).
- PR `#804` merged to `main` as squash commit `8782543`.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate and local server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-22 | in-progress | started from clean main@2f41bb6 after PR #802 and repo-managed closeout #803; post-merge preflight was reported green with no pending closeout; short queue/design/code re-audit selected Admin Note Screenshot Capture Feedback State Parity as the next bounded AW-006 UI slice and found one stale completed-QR active phrase to repair in the queue | next: update queue/inventory, migrate scoped screenshot feedback rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-22 | targeted validation | updated the canonical queue and notice/empty-state inventory, migrated screenshot-capture recovery/save-error feedback to the existing admin-local AdminManagerState helper, and preserved screenshot capture/crop/upload behavior; targeted validation passed for Vitest screenshot/admin-state tests, lint:briefs:all, lint, typecheck, route/label/support sweep, and git diff --check | next: capture after/reference screenshot handoff and stop for owner visual approval before verify:pre-pr`
- `2026-05-22 | screenshot approval | captured after/reference screenshot handoff in output/aw-006-admin-screenshot-feedback-2026-05-22-104419, inspected the actual consumed artifact folder for dev overlays/layout breakage, and owner approved the visual handoff; first verify:pre-pr attempt failed only because the brief lacked explicit ui-debug-hypothesis-and-handoff evidence, so this checkpoint records the missing quality-gate evidence without changing runtime scope | next: rerun verify:pre-pr`
- `2026-05-22 | merged | PR #804 merged to main as 8782543; post-merge preflight opened this repo-managed docs-only lifecycle closeout | next: validate and merge closeout PR`
