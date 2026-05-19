# Task Brief: AW-006 Admin Management Feedback And List-State Primitive Pilot (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-shared-notice-empty-state-pattern-inventory-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-state-primitive`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@20320df`
- `audit_status`: `ready`
- `decision`: Execute the next canonical AW-006 UX/UI implementation slice as a bounded admin-local primitive pilot.
- `reason`: `main` is clean after PR `#760` and repo-managed closeout PR `#761`; `npm run post-merge:preflight` reports no pending closeout, and the canonical AW-006 queue promotes `Admin management feedback and list-state primitive pilot` as the next implementation slice.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin manager surfaces, admin Help/Guide contracts, notice/empty-state inventory, design tokens, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Create one small admin-local feedback/list-state helper and migrate a low-risk subset of admin management surfaces without changing admin data, authz, retry behavior, mutation behavior, or operator-facing copy.

## Pre-Implementation Owner Explanation

Dette slicen lager en liten felles admin-hjelper for typiske listetilstander: lasting, advarsel, feil med retry, tom liste og ingen treff. Det betyr noe fordi admin-flatene blir mer konsekvente og lettere å lese uten at hver side må ha sin egen variant av samme melding. Utenfor scope er admin-logikk, auth, data, skjema, mutasjoner, recovery-flyt, Help/Guide, bred designsystem-migrering og store admin-notes/content-flater.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Accessibility (a11y)`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                           | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The pilot must stay inside admin management feedback/list states and leave the canonical AW-006 queue with this implementation slice clearly tracked.                                        | active brief + canonical queue update + diff review                | `5/5`                   |
| UX flow clarity                               | `target`     | Migrated surfaces must preserve existing loading, warning, error+retry, action feedback, empty, and no-results jobs without dead-end states.                                                 | component diff + targeted unit tests + screenshot handoff          | `5/5`                   |
| Visual design quality                         | `target`     | The helper must keep the existing admin visual language, use consistent spacing/color/radius across migrated states, and avoid broad redesign.                                               | screenshot handoff + component snapshots from DOM assertions       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fetch paths, retry callbacks, product/flag/QR mutation payloads, schema warning behavior, and derived list filters must remain unchanged.                                                    | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins must still see clear refresh/retry/action feedback and empty-state next actions on the migrated manager surfaces.                                                                     | migrated manager tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback keeps polite status semantics, blocking recoverable errors remain announced, and static empty states do not become noisy live regions.                       | helper unit tests for roles/aria + screenshot/manual review        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` should add no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond a tiny local helper.                                 | package diff + bundle/build gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because the helper introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                                               | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load errors must keep visible retry controls wired to the same callbacks; empty/no-results states must remain deterministic from existing list state.                            | component tests for retry, empty, and no-results states            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected admin APIs and authz boundaries are untouched; no secrets, tokens, roles, cookies, or request inputs are changed.                                                 | code review + unchanged API routes                                 | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                          | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | The implementation must preserve existing admin copy and record the primitive pilot decision in the active brief and canonical AW-006 queue.                                                 | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Product, runtime-flag, and QR-link management must keep their existing operator actions, controls, and recovery actions while gaining the shared state helper.                               | migrated manager tests + screenshot handoff                        | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                            | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                          | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin actions continue to use their current fetch/mutation behavior.                                               | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting because `AdminCommerceManager` is in scope, but product catalog truth, Stripe identifiers, entitlements, checkout, pricing, finance reporting, and reconciliation stay unchanged. | commerce manager tests + unchanged API/contracts                   | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                     | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this intentionally preserves existing English admin strings and changes no locale routing, translation workflow, metadata text, or grammar-coupled content model.                       | explicit i18n scope rationale                                      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use a small React/TypeScript helper inside `components/admin/`, reuse existing Tailwind/admin classes, and add no dependency or broad design-system abstraction.                             | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit/component coverage for the helper and migrated manager states; run targeted tests, brief lint, and required broad gates after screenshot approval.                          | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the pilot reduces future admin UI duplication without adding runtime services, infrastructure, or recurring cost.                                                         | helper reuse across bounded pilot surfaces                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                    | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the admin management panel family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, with `AdminCommerceManager`, `AdminOperationsManager`, and `AdminQrLinksManager` as the first low-risk consumers.
  - Implement one client-side helper under `components/admin/` and pass existing copy/callbacks into it; do not move fetches, mutations, route boundaries, or server/client ownership.
  - Route/action/API boundary: `/api/admin/products`, `/api/admin/operations/flags`, and `/api/admin/qr-links` remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Use a narrow typed prop contract for visual state rendering.
  - Preserve current response types, row types, mutation payloads, derived filters, and fallback error strings.
  - Keep deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty/no-results derive from existing array/filter state.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe SDK/API behavior, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use existing admin Tailwind classes and AW-006 state-color direction.
  - Keep the primitive admin-local until this pilot proves the contract.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated admin management states to the reference/pilot surfaces where practical.
- Testing:
  - Add focused unit/component tests for helper roles, aria behavior, retry callback, empty/no-results action slots, and migrated manager behavior.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI primitive introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin products, runtime flags, and QR links remain server-canonical through their existing API routes; the helper only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing product IDs, runtime flag keys, and QR link IDs/slugs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, and support procedures. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading product catalog`
  - `Loading operations state`
  - `Loading QR registry`
  - `Could not load products`
  - `Could not load operations data`
  - `Could not load QR links`
  - `Retry`
  - `Product catalog is empty`
  - `No QR links yet`
  - `No QR links match current filters`
  - `schemaReady`
  - `actionError`
  - `actionNotice`
  - `role="status"`
  - `role="alert"`
- Surfaces to check:
  - `components/admin/`
  - `tests/unit/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/runbooks/`
- Expected fallout:
  - new admin-local helper,
  - migrated low-risk manager surfaces,
  - focused tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide runtime update unless a workflow label changes.

## Scope

- Add one admin-local feedback/list-state helper under `components/admin/`.
- Migrate these low-risk pilot surfaces where the repeated pattern is already shared:
  - `components/admin/AdminCommerceManager.tsx`
  - `components/admin/AdminOperationsManager.tsx`
  - `components/admin/AdminQrLinksManager.tsx`
- Add focused unit/component tests under `tests/unit/`.
- Update this active brief and the canonical AW-006 queue.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- Admin notes/content/message recovery migrations.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, or public visual redesign.
- Admin API behavior, authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.
- Changing admin copy, workflow labels, retry callbacks, mutation payloads, schema warning meaning, or support procedures.

## Acceptance Criteria

1. A typed admin-local helper renders loading, warning, error+retry, inline action feedback, empty, and no-results variants with consistent existing admin styling.
2. `AdminCommerceManager`, `AdminOperationsManager`, and `AdminQrLinksManager` use the helper for their low-risk repeated states while preserving copy, callbacks, fetches, mutations, and derived list conditions.
3. Accessibility semantics are explicit: dynamic status/action feedback uses polite status semantics, recoverable errors remain announced, and static empty/no-results states are not live regions.
4. Focused tests cover helper variants and at least one migrated manager's loading/error+retry/empty/no-results behavior.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin surfaces before `npm run verify:pre-pr`.
6. `npm run lint:briefs`, targeted tests, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - targeted `vitest` for new and touched admin component tests
  - `git diff --check`
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before PR gates
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@20320df after PR #760 and repo-managed closeout #761; post-merge preflight found no pending closeout; created branch aw-006-admin-state-primitive and active brief for the canonical Admin management feedback/list-state primitive pilot | next: implement the admin-local helper, migrate the bounded manager surfaces, and add targeted tests`
- `2026-05-19 | in-progress | added the admin-local AdminManagerState helper, migrated Commerce, Operations, and QR registry loading/warning/error/action/empty/no-results states without API or mutation changes, and added targeted component tests; targeted vitest passed for admin-manager-state, admin-commerce-manager-state, and admin-qr-links-manager-state | next: run brief lint, type/lint checks, route-label sweep, and screenshot handoff before pre-pr`
- `2026-05-19 | in-progress | lint:briefs:all, lint, typecheck, lint:quality-gates, git diff --check, targeted route/label sweep, and targeted vitest passed; captured after/reference screenshots in output/admin-state-primitive-2026-05-19-112017 at 2026-05-19 11:30 with API data mocked for visual states and dev-login enabled only for local admin access | next: wait for owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-19 | in-progress | owner approved the after/reference screenshot handoff for Commerce empty, QR no-results, Operations error+retry, and Email templates loading reference | next: run npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-19 | in-progress | first npm run verify:pre-pr failed on an unrelated public IA Playwright image-load race; the isolated test passed, then the assertion was hardened to wait for loaded image dimensions and the isolated test passed again | next: rerun npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-19 | in-progress | npm run verify:pre-pr passed on the full public lane after the Playwright image-load hardening: lint, typecheck, unit, build, perf budgets, and E2E all green | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge when CI is green`
