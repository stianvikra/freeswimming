# Task Brief: AW-006 Admin Messages State Primitive Second-Wave (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-admin-messages-state-primitive-second-wave-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-admin-categories-state-primitive-completion-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-messages-state-primitive`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@c9fb29d`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded second-wave migration of Admin Messages state rendering.
- `reason`: `main` is clean after PR `#770` and repo-managed closeout PR `#771`; `npm run post-merge:preflight` reports no pending closeout. The canonical queue and design inventory still showed Admin Categories as current, while `AdminMessagesManager` remains the next admin-local state surface with route-local loading, warning, error, action feedback, empty, and no-selection markup.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin message surfaces, admin Help/Guide contracts, message delivery diagnostics, notice/empty-state inventory, `AdminManagerState`, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Apply the proven admin-local state helper to the primary Admin Messages feedback/list states without changing stored message data, authz, API behavior, delivery diagnostics, workflow labels, or support procedures.

## Pre-Implementation Owner Explanation

Dette slicen gjor meldingsflaten i Admin mer konsekvent nar meldinger laster, feiler, er tomme, ikke har valgt melding, eller viser handlingsbeskjeder. Det betyr at admin far samme ryddige meldingsstandard her som i Commerce, Operations, QR, Email templates og Categories. Utenfor scope er nye meldingsfunksjoner, API/data/auth-endringer, delivery-logikk, workflow-labels, Help/Guide og bred designsystem-utrulling.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside Admin Messages and update the AW-006 canonical queue after `#770/#771`.                                                                       | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Message loading, schema warning, load error+retry, action feedback, empty list, and no-selection states remain visible, specific, and recoverable where applicable.      | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated states use the existing `AdminManagerState` visual contract and match the admin manager family without broad redesign.                                          | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fetch paths, retry callbacks, pagination, filters, status mutation payloads, selection behavior, delete confirmation, and fallback strings remain unchanged or additive. | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still see clear refresh/retry/action feedback and no-selection guidance while managing inbound messages.                                                          | messages manager tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback uses polite status semantics, recoverable load errors remain announced, and static empty/no-selection states are not noisy live regions. | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.          | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.            | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                            | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load errors keep retry wired to the same loader; empty/no-selection states remain deterministic from existing arrays and selected-message state.             | component tests for retry, empty, and no-selection states          | `5/5`                   |
| Security and authz                            | `target`     | Protected admin API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                            | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                      | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin message copy and queue/documentation source of truth are preserved or explicitly updated for this slice only.                                             | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Message refresh, filtering, selection, status changes, delete confirmation, restore, and external inbox link keep existing labels, disabled states, and behavior.        | manager tests + screenshot handoff                                 | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                        | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                      | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin actions continue to use current fetch/mutation behavior.                                 | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches message state rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.   | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                            | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                 | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin messages contain user copy, but this slice preserves existing English admin UI strings and changes no translation workflow.                     | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, existing Tailwind/admin classes, and no new dependency or app-wide primitive.                  | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for migrated Admin Messages states; run targeted tests, brief lint, and required broad gates after screenshot approval.                   | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the migration reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                    | helper reuse across one additional bounded surface                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin management family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially `AdminCommerceManager`, `AdminOperationsManager`, `AdminQrLinksManager`, `AdminEmailTemplatesManager`, and `AdminCategoriesManager`.
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminMessagesManager.tsx`; do not move fetches, mutations, route boundaries, or server/client ownership.
  - Route/action/API boundary: `/api/admin/messages` and `/api/admin/messages/[id]` remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current response types, row type, mutation payloads, status transitions, filtering, pagination, selection behavior, confirmation behavior, and fallback error strings.
  - Keep deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty derives from `items.length`, and no-selection derives from `selectedItem`.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no email provider, Stripe, Supabase provider setting, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and AW-006 state-color direction.
  - Keep the primitive admin-local; this is a second-wave admin surface, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Messages states to already-migrated admin manager reference states where practical.
- Testing:
  - Add focused unit/component tests for Admin Messages loading, warning, load error+retry, empty list, no-selection, and action feedback semantics.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin messages remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing message IDs, status buckets, delivery attempts, and source labels are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, and support procedures. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading messages`
  - `Could not load messages`
  - `Could not update message`
  - `No messages match`
  - `Select a message`
  - `Message storage is not ready`
  - `actionError`
  - `notice`
  - `role="status"`
  - `role="alert"`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminMessagesManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-messages-manager.test.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/runbooks/`
- Expected fallout:
  - Admin Messages manager reuses the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - Admin Categories done-brief status metadata cleanup,
  - no Help/Guide runtime update unless a workflow label changes.

## Scope

- Migrate these state renderings in `components/admin/AdminMessagesManager.tsx` to `AdminManagerState`:
  - schema warning,
  - top-level load error + retry,
  - action error,
  - action notice,
  - messages-list loading,
  - message storage not-ready warning,
  - empty/no-results list,
  - no selected message state.
- Add focused unit/component tests under `tests/unit/`.
- Update this active brief, the canonical AW-006 queue, the design inventory, and stale Admin Categories brief metadata where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- Admin message API behavior, authz, storage, delivery diagnostics, provider notifications, reply workflow, support runbooks, or Help/Guide content.
- Admin notes/content upload recovery migrations.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or email-provider delivery behavior.
- Supabase schema/RLS, Stripe/commerce truth, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.
- Changing admin copy, workflow labels, retry callbacks, mutation payloads, delete confirmation meaning, status transitions, pagination behavior, delivery diagnostics, or support procedures.

## Acceptance Criteria

1. `AdminMessagesManager` uses the existing `AdminManagerState` helper for the scoped feedback/list-state renderings while preserving copy, callbacks, fetches, mutations, filters, selection behavior, and derived message conditions.
2. Accessibility semantics are explicit: dynamic loading/action feedback uses polite status semantics, recoverable load errors remain announced, and static empty/no-selection states are not live regions.
3. Focused tests cover loading, warning, load error+retry, empty/no-results list, no-selection, success feedback, and action-error behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Messages states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npx vitest run tests/unit/admin-messages-manager.test.tsx tests/unit/admin-manager-state.test.tsx`
  - targeted route/label/support sweep
  - `git diff --check`
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and pre-merge gates
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@c9fb29d after PR #770 and repo-managed closeout #771; post-merge preflight found no pending closeout; created branch aw-006-admin-messages-state-primitive and active brief for the Admin Messages state primitive second-wave slice | next: migrate AdminMessagesManager state renderings to AdminManagerState, refresh the AW-006 queue/design inventory, and add targeted tests`
- `2026-05-19 | screenshot-review | migrated AdminMessagesManager warning, load error+retry, action feedback, list loading, storage-not-ready warning, empty/no-results, and no-selection states to AdminManagerState; added targeted component tests; lint:briefs:all, targeted vitest, lint, typecheck, route/label sweep, and git diff --check passed; captured after/reference screenshots in output/aw-006-admin-messages-state-2026-05-19-201053 at 2026-05-19 20:10 using a temporary local dev-only route that rendered the production AdminWorkspace with mocked browser API responses; the temporary route/script were removed before handoff | next: wait for owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-19 | screenshot-approved | owner approved the after/reference screenshot handoff for Messages empty, load error, warning, and Commerce empty reference states; no product-rendering files changed after screenshot capture | next: run npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-19 | pre-pr-ready | npm run verify:pre-pr passed on the full-public lane with exit-code 0; evidence: artifacts/test-runs/20260519-201323/verify.log and artifacts/test-runs/20260519-201323/meta.json; unit suite reported 200 files / 1136 tests passed, build passed, E2E reported 98 passed / 478 skipped under local auth config, and performance budgets held with a hold recommendation because worst margin was 14.7% | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
