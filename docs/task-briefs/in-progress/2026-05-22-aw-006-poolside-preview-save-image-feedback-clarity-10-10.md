# Task Brief: AW-006 Poolside Preview Save Image Feedback Clarity (10/10)

## Metadata

- `id`: `2026-05-22-aw-006-poolside-preview-save-image-feedback-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-poolside-save-image-feedback`

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@6237ebe`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI/export-adjacent slice as a bounded Poolside preview save-image feedback clarity pass.
- `reason`: `main` is clean after Commerce Action Feedback Semantics PR `#810` and repo-managed closeout PR `#811`; `npm run post-merge:preflight` was reported green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `PoolsidePreviewPageClient` save-image feedback as a small isolated rest surface in the notice/export inventory.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, Poolside preview/export behavior, `PoolsidePreviewPageClient`, poolside image export driver, screenshot handoff rules, visual/export high-cost debug rules, or verification lanes change before PR handoff.

## Goal

Make Poolside preview `Save image` pending, success, and failure feedback clearer, accessible, and visually consistent without changing PNG capture, native share/download behavior, filenames, PDF/print layout, data, or APIs.

## Pre-Implementation Owner Explanation

Vi gjor tilbakemeldingen rundt `Save image` paa Poolside preview tydeligere naar bildet klargjores, lagres/deles eller feiler. Det betyr noe fordi bildeeksport er en tillitskritisk handling der brukeren maa skjonne om noe faktisk skjedde. Utenfor scope er selve PNG-genereringen, PDF/print-layout, native share/download-logikk, filnavn, data/API, Stripe, auth, analytics og bred designsystem-utrulling.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                         | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Poolside preview keeps the same export/print controls and makes the existing save-image action status clearer near the action.                                             | component diff + screenshot handoff                     | `5/5`                   |
| UX flow clarity                               | `target`     | Save-image pending, success/share, cancelled-share, not-ready, and failure outcomes remain understandable with no dead-end after failure.                                  | unit tests + screenshot/export handoff                  | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses the existing member/poolside visual language, stable spacing, readable contrast, and no broad route redesign.                                                | screenshot handoff + class review                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Image capture driver, readiness polling, native share preference, cancelled-share handling, download trigger, generated filename, and object URL cleanup remain unchanged. | focused unit tests + diff review                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publish, notes, QR, or operator workflow.                                                                      | changed-files review                                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Pending/success/error feedback uses appropriate live-region semantics, button labels remain accessible, and disabled not-ready state stays understandable.                 | unit tests + screenshot/DOM review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, route data fetch, media asset, heavy client library, or measurable JS-heavy pattern is introduced.                                                      | dependency diff + typecheck/build gates                 | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because the only state is transient client UI feedback for an existing export button; no persisted local/server data or sync behavior changes.                         | data contract section                                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, data read, mutation response, revalidation, or invalidation behavior changes.                                                | cache scope rationale                                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Capture failures and not-ready failures still produce deterministic safe feedback and allow another click attempt after recovery.                                          | focused tests + export-adjacent QA                      | `5/5`                   |
| Security and authz                            | `target`     | Protected member access, session assumptions, export driver trust boundary, and browser APIs remain unchanged; no sensitive diagnostics are exposed.                       | route-boundary/diff review                              | `5/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include user identifiers, entitlement details, raw provider diagnostics, secrets, env values, or image contents.                                         | copy/error review                                       | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this bounded Poolside preview feedback slice.                                                               | docs diff                                               | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin labels, Help/Guide operator procedure, recovery action, edit workflow, or support procedure.                                             | Help/Guide rationale                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, robots, canonical URL, structured data, or crawlable content changes.                                                       | changed-files review                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity model, structured data, crawl-safe docs page, or AI-facing metadata changes.                                                         | changed-files review                                    | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                         | analytics scope rationale                               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                               | explicit commerce scope rationale                       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident alert path, support workflow, operator diagnostic path, escalation path, runbook, or support recovery procedure.                | explicit support-ops scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.      | explicit finance scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English UI feedback stays short and layout-safe; no locale routing, translation workflow, or metadata localization changes.                       | copy/layout review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `PoolsidePreviewPageClient`, image export client, Tailwind patterns, and focused tests; add no package, API, provider, or architecture dependency.          | changed-files/dependency diff                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused component tests, run targeted validation, capture screenshot/export handoff, then run broad gates after screenshot approval.                            | test commands + screenshot handoff + later verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: runtime/export cost remains unchanged because feedback rendering adds no service call, asset, background job, or infrastructure.                          | diff review                                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                          | git diff + validation evidence                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `components/guides/GuidePdfDownloadButton.tsx` for recent download feedback clarity and `PoolsidePreviewPageClient` as the owning export surface.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` was considered and is intentionally N/A for implementation because this slice changes only Poolside preview export-action feedback chrome; session-step rendering, shared renderer contracts, and poolside note content rendering stay unchanged.
  - Server/client boundary: keep the change inside the existing client component; do not alter route/server data or print/PDF rendering.
  - Route/action/API boundary: no API route, action, auth, entitlement, or cache boundary changes.
  - Cache/revalidation: no fetch/cache behavior changes.
- TypeScript/domain contracts:
  - Preserve existing save-image state fields, readiness checks, file naming helper calls, export driver contract, browser share/download behavior, and fallback error model.
  - Deterministic invariants: pending starts when export starts, error/notice clear on a new attempt, cancelled native share does not show a false success, and a failed capture can be retried.
- Supabase/data layer:
  - N/A; no schema, migration, RLS/authz, generated type, index, storage, or data access behavior change.
- External services/tools:
  - N/A; no Stripe, Supabase provider, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing Tailwind/member visual language and the recent guide download feedback direction where it fits.
  - Do not create a broad app-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, with full-resolution artifacts for representative Poolside preview save-image states.
- Testing:
  - Focused Vitest coverage for desktop download success, native share success/cancel behavior where practical, capture error feedback, not-ready disabled state, and live-region semantics.
  - Screenshot/export-adjacent handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no persisted local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive-data handling. The only state remains transient React UI state for one existing image export action.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing generated file naming behavior must remain unchanged.

## Help / Guide Impact

N/A with rationale: this slice changes only visual/accessibility treatment of an existing Poolside preview save-image action. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted export/action sweep because this slice changes a user-facing save-image action.

- Identifiers to search before broad gates:
  - `PoolsidePreviewPageClient`
  - `poolside-preview-save-image`
  - `poolside-preview-save-image-notice`
  - `poolside-preview-save-image-error`
  - `Preparing image`
  - `Save image`
  - `Image ready to share`
  - `Could not save the poolside note image`
  - `Poolside note is not ready to export yet`
- Surfaces to check:
  - `components/my-library/workouts/PoolsidePreviewPageClient.tsx`
  - `tests/unit/poolside-preview-page-client.test.tsx`
  - `tests/e2e/poolside-save-image-export.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
- Expected fallout:
  - shared Poolside preview client, focused unit tests, AW-006 docs, screenshot artifacts only.
  - no PDF/print layout, generated image artifact contract, export driver, entitlement/auth, analytics, API, Help/Guide, or support-procedure fallout.

## Scope

- Improve `components/my-library/workouts/PoolsidePreviewPageClient.tsx` save-image pending/success/error feedback presentation and accessibility semantics.
- Update focused unit tests in `tests/unit/poolside-preview-page-client.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot/export handoff before broad gates.

## Out Of Scope

- PNG capture driver changes.
- `buildWorkoutPoolsideImageFileName` behavior or generated filenames.
- Native share eligibility/preference logic, cancellation behavior, fallback download mechanics, object URL cleanup, or browser API polyfills.
- PDF/print layout, iframe rendering, print controls, preview settings, Poolside note content, workout step rendering, route data, auth, entitlement, Supabase, Stripe, analytics, database, workflow, package, or environment changes.
- Broad app-wide notice/empty-state primitive rollout.
- Guide PDF download button, dryland/micro-session states, admin state primitive work, or admin note recovery flows.

## Acceptance Criteria

1. Poolside preview `Save image` keeps the same successful image export behavior, native share/download behavior, generated filename, object URL cleanup, and retry capability.
2. Pending feedback is visible near the action and politely announced without layout instability.
3. Success/share and capture failure feedback are visually clear, safely worded, accessible, and clear when the next attempt starts.
4. The not-ready disabled state remains deterministic and does not call the export driver before the embedded note is ready.
5. Focused unit tests cover the changed feedback semantics and unchanged export behavior.
6. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
7. Screenshot/export handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `npx vitest run tests/unit/poolside-preview-page-client.test.tsx`
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
- required PR CI checks green
- before merge recommendation:
  - `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture Poolside preview save-image idle reference, pending feedback, success/share or saved feedback, and error feedback where practical.
- Use `after/reference` naming because the handoff compares the changed save-image feedback to the existing Poolside preview/export surface rather than a true pre-change artifact.
- For export-adjacent validation, inspect the rendered full-resolution screenshot artifacts and keep focused unit coverage around the actual export/download behavior. No generated PNG pixel contract change is intended.
- High-cost UI/export debug path: if a fix attempt fails twice or exported artifact behavior contradicts the claimed fix, switch to the ranked hypothesis loop in `docs/runbooks/ui-debug-hypothesis-and-handoff.md` and log reusable findings in `docs/runbooks/high-cost-debug-log.md`.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-22 | in-progress | started from clean main@6237ebe after PR #810 and repo-managed closeout PR #811; post-merge preflight was reported green with no closeout remaining; fresh queue/design/code re-audit selected Poolside Preview Save Image Feedback Clarity as the bounded AW-006 UI/export-adjacent slice | next: implement Poolside preview feedback, update tests/docs, run targeted QA, then capture screenshot/export handoff`
- `2026-05-22 | in-progress | implemented Poolside preview save-image pending/success/error feedback semantics, updated focused unit coverage, queue, and notice inventory; targeted checks passed: ./node_modules/.bin/vitest run tests/unit/poolside-preview-page-client.test.tsx, npm run lint, npm run typecheck, npm run lint:briefs:all, git diff --check | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-22 | in-progress | captured after/reference screenshot handoff in output/aw-006-poolside-save-image-feedback-2026-05-22-224945 at 2026-05-22 22:49 using a temporary local capture route; removed capture-only route/script before handoff; product component did not change after capture | next: wait for owner visual approval`
- `2026-05-22 | in-progress | owner approved screenshot handoff; first npm run verify:pre-pr stopped at quality-gate because the brief lacked explicit session-step reference contract rationale; added N/A implementation rationale because this slice leaves session-step rendering and shared renderer contracts unchanged | next: rerun npm run verify:pre-pr`
- `2026-05-22 | in-progress | npm run verify:pre-pr passed full lane after the brief rationale fix: lint/quality gates/admin/env/pr-body, lint, typecheck, unit, build, perf budgets, and Playwright E2E passed; perf budget trend recommended hold because worst margin was 14.4% against a 15.0% tighten threshold | next: commit, push, open PR, monitor CI`
