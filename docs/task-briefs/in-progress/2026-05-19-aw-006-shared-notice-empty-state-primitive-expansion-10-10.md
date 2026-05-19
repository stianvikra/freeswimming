# Task Brief: AW-006 Shared Notice Empty-State Primitive Expansion (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-shared-notice-empty-state-primitive-expansion-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-shared-state-expansion`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@d0f978c`
- `audit_status`: `ready`
- `decision`: Execute the next canonical AW-006 UX/UI implementation slice as a bounded expansion of the proven admin notice/list-state helper.
- `reason`: `main` is clean after PR `#766` and repo-managed closeout PR `#767`; `npm run post-merge:preflight` reports no pending closeout, and the canonical AW-006 queue promotes `Shared notice/empty-state primitive expansion` as the next implementation candidate.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin email template surfaces, admin Help/Guide contracts, notice/empty-state inventory, design tokens, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Apply the proven admin notice/list-state helper to one additional bounded admin surface without changing admin data, authz, retry behavior, mutation behavior, revision-history behavior, or operator-facing copy.

## Pre-Implementation Owner Explanation

Dette slicen utvider den nye, ryddige meldingsstandarden til Email templates i Admin. Det betyr noe fordi admin får samme tydelige behandling av lasting, feil, tomme lister og handlingsmeldinger her som i de andre nylig ryddede admin-flatene. Utenfor scope er bred designsystem-ombygging, auth, betaling, Supabase/data, workflow-labels, Help/Guide-endringer, e-postlevering og store admin-notes/content-flater.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                          | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The expansion must stay inside one bounded admin email-template surface and keep the AW-006 canonical queue clearly tracked.                                                                | active brief + canonical queue update + diff review                | `5/5`                   |
| UX flow clarity                               | `target`     | Email-template loading, schema warning, load error+retry, action feedback, empty list, and revision-history states must remain visible, specific, and recoverable where applicable.         | component diff + targeted unit tests + screenshot handoff          | `5/5`                   |
| Visual design quality                         | `target`     | Migrated states must use the existing `AdminManagerState` visual contract, match the admin manager family, and avoid broad redesign.                                                        | screenshot handoff + DOM/class assertions where practical          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fetch paths, retry callbacks, create/update payloads, status transitions, revision-history fetches, derived summaries, schema warning behavior, and fallback strings must remain unchanged. | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins must still see clear refresh/retry/action feedback, empty guidance, and revision-history state feedback in Email templates.                                                          | email-template manager tests + screenshot handoff                  | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback keeps polite status semantics, recoverable load errors remain announced, and static empty/no-results states are not noisy live regions.                     | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` should add no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                       | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                               | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                               | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load and revision-history errors must keep retry controls wired to the same loaders; empty states must remain deterministic from existing arrays.                               | component tests for retry, empty, and history states               | `5/5`                   |
| Security and authz                            | `target`     | Protected admin API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles must be untouched; the component may only reuse already-fetched state.          | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                         | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin email-template copy and queue/documentation source of truth must be preserved or explicitly updated for this slice only.                                                     | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Email-template create, edit, quick-status, refresh, and revision-history actions must keep existing labels, disabled states, and recovery behavior.                                         | manager tests + screenshot handoff                                 | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                           | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                         | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin actions continue to use current fetch/mutation behavior.                                                    | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches email-template state rendering only and changes no product catalog truth, Stripe identifiers, entitlements, checkout, pricing, finance reporting, or revenue data. | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                               | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                    | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because email templates have locale fields, but this slice preserves existing English admin UI strings and changes no locale routing, translation workflow, or metadata text.    | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, existing Tailwind/admin classes, and no new dependency or app-wide primitive.                                     | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for the migrated Email templates states; run targeted tests, brief lint, and required broad gates after screenshot approval.                                 | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the expansion reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                                       | helper reuse across one additional bounded surface                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                   | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the admin management panel family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, with the already-migrated `AdminCommerceManager`, `AdminOperationsManager`, and `AdminQrLinksManager` as the mature helper consumers.
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminEmailTemplatesManager.tsx`; do not move fetches, mutations, route boundaries, or server/client ownership.
  - Route/action/API boundary: `/api/admin/email-templates`, `/api/admin/email-templates/[id]`, and `/api/admin/email-templates/[id]/revisions` remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current response types, form states, row types, mutation payloads, status-transition rules, preview parsing, revision row type, and fallback error strings.
  - Keep deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty derives from `items.length`, revision history states derive from existing per-template history maps.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no email provider, Stripe SDK/API behavior, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and AW-006 state-color direction.
  - Keep the primitive admin-local; this is one bounded expansion, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Email templates states to already-migrated admin manager reference states where practical.
- Testing:
  - Add focused unit/component tests for Email templates loading, load error+retry, empty state, action feedback semantics, and revision-history states.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Email templates and revisions remain server-canonical through their existing API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing email-template IDs, template keys, locales, and revision IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, and support procedures. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading email templates`
  - `Could not load email templates`
  - `Could not create email template`
  - `Could not update email template`
  - `Could not update template status`
  - `Loading template history`
  - `Could not load template history`
  - `No templates created yet`
  - `No revision entries yet`
  - `Retry`
  - `actionError`
  - `actionNotice`
  - `role="status"`
  - `role="alert"`
- Surfaces to check:
  - `components/admin/AdminEmailTemplatesManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/runbooks/`
- Expected fallout:
  - Email templates manager reuses the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide runtime update unless a workflow label changes.

## Scope

- Migrate these state renderings in `components/admin/AdminEmailTemplatesManager.tsx` to `AdminManagerState`:
  - schema warning,
  - top-level loading,
  - top-level load error + retry,
  - action error,
  - action notice,
  - empty email-template list,
  - revision-history loading,
  - revision-history error + retry,
  - empty revision-history list.
- Add focused unit/component tests under `tests/unit/`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API unless a tiny compatibility adjustment is required by Email templates.
- Admin notes/content/message recovery migrations.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or email-provider delivery behavior.
- Admin API behavior, authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.
- Changing admin copy, workflow labels, retry callbacks, mutation payloads, schema warning meaning, revision-history behavior, or support procedures.

## Acceptance Criteria

1. `AdminEmailTemplatesManager` uses the existing `AdminManagerState` helper for the scoped feedback/list-state renderings while preserving copy, callbacks, fetches, mutations, and derived list/history conditions.
2. Accessibility semantics are explicit: dynamic status/action feedback uses polite status semantics, recoverable errors remain announced, and static empty states are not live regions.
3. Focused tests cover loading, load error+retry, empty template list, action feedback, and revision-history loading/error/empty behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Email templates states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - targeted `vitest` for new and touched admin component tests
  - targeted route/label/support sweep
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

- `2026-05-19 | in-progress | started from clean main@d0f978c after PR #766 and repo-managed closeout #767; post-merge preflight found no pending closeout; created branch aw-006-shared-state-expansion and active brief for the canonical Shared notice/empty-state primitive expansion slice | next: migrate the bounded Email templates manager state renderings to AdminManagerState and add targeted tests`
- `2026-05-19 | in-progress | migrated AdminEmailTemplatesManager loading, warning, load error+retry, action feedback, empty, and revision-history states to the existing AdminManagerState helper without API/mutation changes; added targeted component tests; targeted vitest, lint:briefs:all, lint, typecheck, git diff --check, and route/label sweep passed | next: capture required after/reference screenshot handoff before verify:pre-pr`
- `2026-05-19 | screenshot-review | captured after/reference screenshots in output/aw-006-email-state-expansion-2026-05-19-161232 at 2026-05-19 16:12 using a temporary local dev-only route that rendered the production AdminWorkspace with mocked browser API responses; the temporary route was removed before validation; targeted vitest, lint:briefs:all, and git diff --check passed after cleanup | next: wait for owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-19 | screenshot-approved | owner approved the after/reference screenshot handoff for Email templates empty, load error, revision-history error, and Commerce empty reference states | next: run npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-19 | pre-pr-ready | npm run verify:pre-pr passed on branch aw-006-shared-state-expansion; full lane covered lint, typecheck, unit tests, build, performance budgets, and Playwright with local environment skips only | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
