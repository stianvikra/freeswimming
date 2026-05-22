# Task Brief: AW-006 Admin QR Registry Asset Feedback State Parity (10/10)

## Metadata

- `id`: `2026-05-22-aw-006-admin-qr-registry-asset-feedback-state-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-22-aw-006-admin-content-manager-course-structure-feedback-state-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-qr-assets-feedback-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@37736ae`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded QR Registry asset-generation feedback parity pass for `AdminQrLinksManager`.
- `reason`: `main` is clean after PR `#800` and repo-managed closeout `#801`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code re-audit found no selected AW-006 slice and identified QR preview asset loading/error feedback in `AdminQrLinksManager` that still uses route-local markup even though the surrounding manager already uses `AdminManagerState`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminQrLinksManager`, `AdminManagerState`, QR asset generation, admin QR Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring `AdminQrLinksManager` QR asset-generation feedback into parity with the existing admin-local state primitive without changing QR APIs, stable links, slug/status behavior, create/update/delete workflows, SVG/PNG download behavior, authz, or support procedures.

## Pre-Implementation Owner Explanation

Vi gjor QR Registry litt mer konsekvent: meldingen som vises mens QR-bilder lages, og feilen hvis det feiler, skal se ut og oppfore seg som resten av admin-panelets feedback. Det betyr tydeligere visuell kvalitet og bedre tilgjengelighetssemantikk for admin. Utenfor scope er QR-lenker, API-er, database, status/slug-regler, nedlasting, auth, Stripe, analytics og bred admin-redesign.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminQrLinksManager` QR preview asset feedback rendering and keep the AW-006 canonical queue accurate after `#800/#801`.                     | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | QR asset loading and generation-failure feedback remains visible, specific, and close to the QR preview action.                                                          | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated QR asset feedback uses the existing `AdminManagerState` visual contract and matches the admin manager family without broad layout redesign.                     | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | QR fetches, create/update/delete payloads, status toggles, stable-link generation, SVG/PNG asset generation, and download behavior remain unchanged.                     | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still get clear local feedback while opening QR preview or retrying asset generation without extra clicks or changed action labels.                               | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic QR asset loading/error feedback uses appropriate live-region semantics and introduces no unlabeled controls, focus traps, or noisy static empty-state roles.     | component tests for role/aria + screenshot/manual review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.          | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.            | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                            | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | QR asset feedback remains deterministic from existing `qrAssetState`; retry, asset generation, loading, and download paths are not changed.                              | component tests for loading/error/retry rendering                  | `5/5`                   |
| Security and authz                            | `target`     | Protected admin QR API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                         | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                      | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing QR admin copy, status model, queue, and design inventory are preserved or explicitly updated for this slice only.                                               | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | QR preview, retry, download SVG, download PNG, create, update, delete, status, and copied-link actions keep existing labels, disabled states, and behavior.              | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                        | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                      | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing QR admin actions continue to use current behavior.                                             | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin QR preview feedback only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data. | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                            | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                 | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.         | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, keep the helper API unchanged, and add no dependency.                                          | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for QR asset feedback; run targeted tests, brief lint, screenshot handoff, and broad gates after screenshot approval.                     | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                  | helper reuse across one bounded QR manager area                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially `AdminQrLinksManager` top-level state rendering and `AdminContextQrPanel`.
  - Reuse `components/admin/AdminManagerState.tsx` inside the QR preview asset feedback slots; do not move fetches, mutations, route boundaries, QR asset generation, or server/client ownership.
  - Route/action/API boundary: `/api/admin/qr-links`, `/api/admin/content`, `/go/v/[slug]`, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve `QrRedirectLinkRow`, `QrAssetState`, stable-link formatting, `generateQrAssets`, fallback strings, status filters, and disabled action rules.
  - Deterministic invariant: QR asset feedback renders only from existing `qrAssetState` and does not alter generation success/failure decisions.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and keep the primitive admin-local.
  - Screenshot handoff comparison type: `after/reference`, comparing changed QR preview feedback with mature admin manager state references where practical.
- Testing:
  - Add focused unit/component tests for QR asset loading, error, and retry semantics.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. QR link rows remain server-canonical through existing admin API routes; generated QR asset data URLs remain transient component state as they already are.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing QR IDs, slugs, stable redirect paths, destinations, statuses, and placement identifiers are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing QR asset feedback rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Generating QR assets`
  - `Could not generate QR assets right now`
  - `QR preview`
  - `Download SVG`
  - `Download PNG`
  - `qrAssetState`
  - `ensureQrAssets`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminQrLinksManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-qr-links-manager-state.test.tsx`
  - `tests/unit/admin-manager-state.test.tsx`
  - `tests/unit/qr-codegen.test.ts`
  - `tests/e2e/admin-foundation.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - selected QR asset feedback states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminQrLinksManager.tsx` to `AdminManagerState`:
  - QR asset generation loading,
  - QR asset generation error with retry action.
- Preserve existing copy, QR preview open/close behavior, stable link, asset generation, SVG/PNG download actions, create/update/delete/status actions, authz, APIs, and support procedures.
- Add focused unit/component tests under `tests/unit/admin-qr-links-manager-state.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API.
- QR API changes.
- QR slug/status behavior changes.
- Stable redirect behavior, `/go/v/[slug]`, asset generation internals, or SVG/PNG download behavior changes.
- Content API changes, Context Notes, Context QR, admin content editor redesign, admin notes upload/recovery behavior.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminQrLinksManager` uses the existing `AdminManagerState` helper for QR asset loading and error feedback while preserving copy, callbacks, generation, download actions, and sibling workflows.
2. Accessibility semantics are explicit: dynamic QR asset loading/error feedback uses live-region semantics appropriate to the state.
3. Focused tests cover QR asset loading, error, and retry behavior.
4. Canonical AW-006 queue and notice/empty-state inventory record this active slice accurately.
5. Screenshot handoff includes `after/reference` artifacts for representative changed QR Registry feedback before `npm run verify:pre-pr`.
6. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-qr-links-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx tests/unit/qr-codegen.test.ts`
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - `npm run lint`
  - `npm run typecheck`
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

### Completed Local Evidence Before Screenshot Approval

- `./node_modules/.bin/vitest run tests/unit/admin-qr-links-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx tests/unit/qr-codegen.test.ts` -> PASS (`3` files, `9` tests) after correcting the test expectation to the existing local stable-link origin.
- `npm run lint:briefs` -> PASS; changed-brief selector reported no changed task briefs before staging.
- `npm run lint:briefs:all` -> PASS (`339` task briefs).
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS.
- targeted route/label/support sweep -> PASS; hits were expected component/test/docs references only, with no Help/Guide, runbook, API, or e2e contract fallout.
- `git diff --check` -> PASS.
- screenshot handoff captured against `http://127.0.0.1:3000` with comparison type `after/reference`:
  - `/Users/stianvikra/freeswimming/output/aw-006-admin-qr-assets-feedback-2026-05-22-091403`
  - Captured: `2026-05-22 09:14`
  - Files: `after-admin-qr-assets-error-desktop.png`, `after-admin-qr-assets-error-mobile.png`, `reference-admin-qr-empty-state-desktop.png`.
  - Temporary local visual route/script were removed after capture; `components/admin/AdminQrLinksManager.tsx` has not changed after the capture.
- owner screenshot approval -> PASS (`2026-05-22 09:17`, chat approval: `godkjent`).
- `npm run verify:pre-pr` -> PASS (full public lane; branch current with `origin/main@37736ae`; `206` unit-test files, production build, performance budgets, and Playwright e2e `98` passed / `478` skipped; log: `artifacts/test-runs/20260522-091721/verify.log`).
- staged `npm run verify:pre-pr` -> PASS (same full public lane and branch-current result; `206` unit-test files, production build, performance budgets, and Playwright e2e `98` passed / `478` skipped; log: `artifacts/test-runs/20260522-092403/verify.log`). The changed-brief selector still reported no changed task briefs, so `npm run lint:briefs:all` remains the explicit full-brief-format evidence for this new brief.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-22 | in-progress | started from clean main@37736ae after PR #800 and repo-managed closeout #801; post-merge preflight was reported green with no pending closeout; short queue/design/code re-audit selected Admin QR Registry asset feedback state parity as the next bounded AW-006 UI slice and repaired the preceding done-brief metadata | next: update queue/inventory, migrate scoped QR asset feedback rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-22 | screenshot-review | migrated QR asset loading/error feedback to AdminManagerState, added focused unit coverage, updated AW-006 queue/inventory, passed targeted local validation, captured after/reference screenshot artifacts, and removed the temporary local visual route/script before handoff | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-22 | screenshot-approved | owner approved the screenshot handoff in chat (`godkjent`), allowing the workstream to continue into the pre-PR gate sequence | next: run npm run verify:pre-pr`
- `2026-05-22 | pre-pr-gate | npm run verify:pre-pr passed the full public lane after screenshot approval and again after staging the worktree | next: commit, push, and open the PR`
