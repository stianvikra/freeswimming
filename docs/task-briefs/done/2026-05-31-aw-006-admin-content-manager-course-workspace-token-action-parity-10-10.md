# Task Brief: AW-006 Admin Content Manager Course Workspace Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-content-manager-course-workspace-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `completed via PR #928; repo-managed closeout`
- `branch`: `aw-006-admin-content-manager-course-workspace-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@525c79a`
- `audit_status`: `closed`
- `decision`: Completed through PR `#928` and closeout.
- `reason`: `main` is clean and synced after PR `#926` and repo-managed closeout PR `#927`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice, confirmed recent admin token/action slices are done, and identified `AdminContentManager` Course Workspace plus adjacent content shell/filter/action controls as the clearest remaining admin presentation gap after state/utility parity work.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminContentManager.tsx`, `AdminManagerState`, admin content API/authz/course-structure behavior, Context Notes/QR placement, Help/Guide assertions, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Align the Admin Content Manager Course Workspace, primary content tabs, nearby filters, module/lesson cards, create-in-context form, and visible course workspace actions with the current AW-006 admin token/action hierarchy without changing content data, course structure behavior, Context Notes/QR, revision history, APIs, authz, labels, Help/Guide, or support procedures.

## Pre-Implementation Owner Explanation

Vi gjor Content Manager mer lik resten av Admin, spesielt Course Workspace, filterne, radene og knappene. Det betyr at den viktigste innholdsflaten blir roligere, lettere aa skanne og mer konsekvent med adminflatene som allerede er pusset. Utenfor scope er API-er, innholdslogikk, Notes/QR/revisjoner, workflow-labels, database, auth og supportprosedyrer.

Fremoverkompatibilitet: nye innholdsrader, moduler, leksjoner, statuser og filterverdier som allerede kommer fra eksisterende API-er skal arve samme visuelle behandling. Nye innholdstyper, statuser, workflow-handlinger eller supportprosedyrer krever eksplisitt mapping, tester og dokumentvurdering foer release.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                  | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` Course Workspace and adjacent content shell/filter/action presentation while keeping AW-006 queue/design inventory accurate.                                       | active brief + queue/inventory diff + changed-files review | `5/5`                   |
| UX flow clarity                               | `target`     | Course Workspace tabs, filters, module overview, focused module scope, lesson rows, create-in-context form, preview/open/edit/move actions, and refresh remain easier to scan with unchanged click paths.           | screenshot handoff + component tests + diff review         | `5/5`                   |
| Visual design quality                         | `target`     | The changed surface reuses current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, token radius, focus, field, and quiet/destructive action direction.  | screenshot handoff + DOM/class review                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Content GET/POST/PATCH/DELETE payloads, course order/move/delete behavior, module scope, lesson creation, preview URLs, filters, local preferences, Context Notes/QR, and revisions remain unchanged.               | targeted unit tests + diff review                          | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still switch Course Workspace/All Content, focus a module, create lessons, move lessons, edit/open/preview/delete modules and lessons, normalize order, refresh, and filter with no extra workflow step. | component tests + screenshot handoff                       | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, links, selects, search, checkboxes, tabs, disabled states, status chips, state messages, and create form controls remain keyboard reachable and screen-reader clear.                                       | Testing Library assertions + screenshot/manual review      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, image payload, or material route payload increase.                                                                         | package diff + pre-pr gate                                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin content and course structure remain server-canonical; primary view/filter/module/create form state remains component-local; localStorage keys and sync behavior remain unchanged.                             | data/sync contract + diff review                           | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing admin content/category fetches, manual refresh, mutation reload/update behavior, and cache policy remain unchanged.                                                                                        | fetch/payload assertions + diff review                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing loading, warning, error+retry, action notice/error, empty/no-results, course-structure warning/message, disabled pending, and create error states remain deterministic.                                    | targeted state tests + diff review                         | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, credentials mode, cookies, secrets, content ownership, preview URL safety, and admin-only Context Notes/QR boundaries remain untouched.                                    | unchanged auth/API diff review + existing coverage         | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because admin content can include private operational data; the slice must not expose extra fields, logs, analytics, raw IDs beyond existing UI, secrets, or storage paths.                              | field/log diff review                                      | `4/5`                   |
| Content governance                            | `target`     | Existing labels, status semantics, slug/runtime ID guidance, Help/Guide assertions, support procedures, and AW-006 docs source of truth are preserved or updated for this slice.                                    | copy-preservation diff review + docs update                | `5/5`                   |
| Admin workflow and editability                | `target`     | Content workflow edits remain available through the same controls and API calls; this PR changes presentation only.                                                                                                 | targeted tests + changed-files review                      | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                                        | SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                                 | AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                             | diff review                                                | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                                | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                                       | explicit support-ops scope rationale                       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                            | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin labels may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                                                      | copy-preservation diff review                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API boundaries unchanged, and add no dependency or new global primitive.                                                              | component diff + package diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for Content Manager Course Workspace token/action classes, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.       | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven content rows, modules, lessons, statuses, and filters should inherit the same treatment without extra services, infrastructure, or cost.                                             | row/form rendering diff review                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                           | git diff review + validation gates                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, Commerce/Operations manager parity from PR `#904`, QR Registry parity from PR `#906`, Categories parity from PR `#908`, Email Templates parity from PR `#910`, Messages parity from PR `#912`, Context Notes parity from PR `#914`, Help/Guide parity from PR `#918`, Notes parity from PR `#920`, Quick Capture parity from PR `#924`, Context QR parity from PR `#926`, and `AdminManagerState`.
  - `AdminContentManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/content`, `/api/admin/content/[id]`, revision routes, course-structure helpers, categories route, Context Notes, Context QR, and preview routes.
  - Cache/revalidation behavior remains unchanged; existing fetch and mutation refresh behavior is preserved.
- TypeScript/domain contracts:
  - Preserve `AdminContentItemRow`, `AdminContentStatus`, `AdminContentType`, `ContentPrimaryView`, course workspace rows, mirror metrics, edit form state, response unions, and existing fallback/error strings.
  - Deterministic invariant: every returned course module/lesson renders the same identity, status, sort order, parent relationship, runtime lesson ID, preview URL, and permitted actions before and after this presentation pass.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, tokenized field/label/card classes, and manager-local quiet/destructive/status action classes aligned to the same radius/focus/token direction.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Content Manager Course Workspace states inside `/admin` to tokenized sibling admin manager surfaces.
- Testing:
  - Add or update focused unit tests for Content Manager token/action classes plus existing state behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin content rows, course module/lesson structure, status, sort order, parent links, runtime IDs, revision history, Context Notes/QR links, and mutation outcomes remain owned by existing admin APIs/storage.
- Local data:
  - Primary view, All Content scope preference, search/filter/sort state, focused module state, create-in-context form state, move-target select state, pending IDs, action notice/error, and edit form state remain component-local or existing localStorage-backed UI preference state.
- Sync policy:
  - Manual refresh still fetches content and categories through existing paths.
  - Successful create/edit/delete/move/normalize actions keep using existing local update/reload behavior.
  - Failures remain visible through existing error/notice/recovery states; no optimistic persistence or conflict policy changes.
- Retention and sensitivity:
  - Content retention, revision history, admin-only visibility, Context Notes/QR placement, and support diagnostics remain unchanged.
- Cache/invalidation:
  - Existing fetch/mutation freshness behavior remains the invalidation boundary.

## Identity And Rename Contract

This slice does not change identity behavior. Content row `id` remains the canonical stable identifier for updates, deletion, revision history, Context Notes/QR attachment, and course-structure operations. Course lesson runtime IDs remain locked identifiers for `/course` progress, notes, preview links, and lesson routing. Slug/title/category remain human-readable editable fields under the existing rename guidance; materially different learning objects must still be created as new rows rather than repurposing an existing row.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin content rows, content types, statuses, course modules, course lessons, module parent links, runtime lesson IDs, preview links, filters, sort modes, Context Notes/QR placements, and course-structure actions.
- Source of truth:
  - Content rows come from `/api/admin/content`.
  - Categories come from `/api/admin/categories/content`.
  - Course structure derives from existing `lib/admin/course-structure` and `lib/admin/course-workspace` helpers.
  - Preview URLs derive from `buildCoursePreviewHref` and current runtime ID helpers.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New course modules and lessons returned by existing APIs should render through the same cards/actions without code changes.
  - New counts, empty states, errors, warnings, and no-results states should continue to use existing `AdminManagerState` surfaces.
- Explicit mapping requirements:
  - New content types, statuses, preview modes, workflow actions, support runbook flows, Help/Guide instructions, or route/label changes require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown API failures remain handled by current error states.
  - Unknown typed content/status values must fail type review or receive explicit fallback label/class mapping before release.
- Test/evidence:
  - Focused unit tests verify shell/tab/filter/module/lesson/create-form/action class parity and unchanged fetch, view preference, module focus, lesson create, move, preview/open, empty, warning, and error behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing Content Manager workflow labels, Course Workspace labels, Help/Guide assertions, content governance guidance, support procedures, and operator instructions. Help/Guide or runbook updates are required if implementation changes action meaning, recovery behavior, auth, status behavior, course structure behavior, labels, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Content items`
  - `Course Workspace`
  - `All Content`
  - `Course workspace overview`
  - `Open module scope`
  - `Show all modules`
  - `Add lesson`
  - `Add lesson in this module`
  - `Move up`
  - `Move down`
  - `Move to module`
  - `Open preview`
  - `Open lesson`
  - `AdminContentManager`
- Surfaces to check:
  - `components/admin/AdminContentManager.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `components/admin/AdminContextNotesPanel.tsx`
  - `components/admin/AdminContextQrPanel.tsx`
  - `tests/unit/admin-content-manager-state.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Content Manager Course Workspace card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminContentManager.tsx` manager header, primary Course Workspace/All Content tabs, nearby All Content filters/chips, audit/focus/mirror utility action wrappers where they border the workspace, Course Workspace overview, module cards, lesson preview rows, focused module scope panel, create-in-context form, lesson rows, retry/normalize/open/edit/move/delete/preview actions, and tokenized fields with current AW-006 admin token/action direction.
- Preserve content fetch/create/update/delete behavior, course structure normalize/move/delete behavior, filter and local preference behavior, preview URL generation, Context Notes/QR rendering, revision history, labels, Help/Guide, support procedures, and all API/auth behavior.
- Add or update focused tests for Content Manager Course Workspace token/action classes and preserved behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates.

## Out Of Scope

- Admin content API changes, course structure algorithm changes, content schema, category API, revision API, Context Notes/QR APIs, authz, RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, preview route behavior, or storage retention.
- Full All Content edit form redesign, revision-history redesign, Context Notes/QR redesign, admin workspace shell changes, Notes, Commerce, Operations, QR Registry, Email Templates, Messages, Categories, Help Center, Quick Capture, Screenshot Capture, or other manager internals beyond the scoped Content Manager course-workspace presentation.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. Content Manager Course Workspace shell, tabs, filters, module overview, focused module panel, create-in-context form, lesson rows, fields, and visible actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. Content row data, filters, local view preferences, create/edit payloads, course structure normalize/move/delete behavior, preview/open links, Context Notes/QR placement, and revision behavior remain unchanged.
3. Buttons, links, inputs, selects, checkboxes, status chips, disabled states, and state messages remain keyboard reachable and semantically clear.
4. Future modules, lessons, statuses, and filter results returned by existing APIs inherit the same card/action treatment without hardcoded today-only values.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx`
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

- `2026-05-31 | in-progress | started from clean main@525c79a after PR #926 and repo-managed closeout #927; post-merge preflight passed with no closeout remaining; owner approved AW-006 Admin Content Manager Course Workspace Token/Action Parity after fresh queue/design/code re-audit | next: implement scoped Content Manager Course Workspace token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-31 | implementation QA | tokenized AdminContentManager header, Course Workspace shell, primary tabs, All Content filters, module/lesson cards, create-in-context form, fields, and visible course-workspace actions; updated focused unit coverage and AW-006 queue/inventory docs. Local evidence: ./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx PASS (15 tests), npx eslint components/admin/AdminContentManager.tsx tests/unit/admin-content-manager-state.test.tsx PASS, npm run lint:briefs:all PASS (401 briefs), route/label/support rg sweep showed expected references only, git diff --check PASS | next: capture required after/reference screenshot handoff before npm run verify:pre-pr`
- `2026-05-31 | screenshot handoff | captured after/reference screenshot artifacts at output/aw-006-admin-content-manager-course-workspace-token-parity-2026-05-31-161520 using the production AdminContentManager with deterministic local API mocks because local /dev/login returned 500 from the known Supabase/dev-login environment constraint; temporary preview route and capture script were removed after capture. Artifact evidence includes desktop Course Workspace overview/focus, All Content filters, mobile Course Workspace overview, and Admin Notes Manager reference. No scoped product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot refresh | regenerated after/reference screenshot artifacts at output/aw-006-admin-content-manager-course-workspace-token-parity-2026-05-31-162003 after owner asked whether the Admin console header was intentionally omitted. The refreshed set includes full admin-shell desktop/mobile context with Admin console header, plus Content Manager element captures and Admin Notes shell reference. Local /dev/login still returned 500, so capture used the same temporary local preview route with production AdminWorkspace/AdminContentManager and deterministic API mocks; temporary preview route and capture script were removed after capture. This supersedes the 16:15 artifact set. No scoped product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot approved | owner approved refreshed 16:20 screenshot handoff in chat; no visual/rendering files changed after the approved capture | next: run npm run verify:pre-pr, then commit/push/open PR if green`
- `2026-05-31 | pre-pr verified | npm run verify:pre-pr PASS full lane for code-touching diff: branch current with origin/main@525c79a, quality gates/admin audit/env parity/generated PR body/lint/typecheck/unit/build/perf/e2e passed; unit suite passed 1303 tests, Playwright passed 102 tests with 492 local env-driven skips, and perf trend recommendation stayed hold. Screenshot artifacts remain the approved 16:20 after/reference set at output/aw-006-admin-content-manager-course-workspace-token-parity-2026-05-31-162003; no scoped product-rendering files changed after capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-31 | merged | PR #928 merged to main as ad342a6 after green CI and npm run verify:pre-merge PASS full lane; post-merge preflight surfaced this repo-managed docs-only closeout | next: complete closeout PR and rerun post-merge preflight`

## Completion Record

- `completed`: `2026-05-31`
- `merged_pr`: `#928`
- `squash_commit`: `ad342a6`
- `result`: Closed AW-006 Admin Content Manager Course Workspace Token/Action Parity. Content Manager and Course Workspace now use the same calmer admin token/action hierarchy as adjacent admin managers while preserving content data, course-structure behavior, Context Notes/QR, revision history, labels, Help/Guide, support procedures, APIs, authz, and data contracts.
- `validation`: targeted unit PASS (15 tests), targeted eslint PASS, route/label/support sweep expected-only, `git diff --check` PASS, approved after/reference screenshot handoff at `output/aw-006-admin-content-manager-course-workspace-token-parity-2026-05-31-162003`, `npm run verify:pre-pr` PASS full lane, PR #928 CI PASS, `npm run verify:pre-merge` PASS full lane.
- `10/10 claim`: yes - all critical target categories reached `5/5`; supporting categories stayed in scope with no release-blocking gap.

| Category                                      | Achieved Score | Evidence                                                                      | Gaps / Notes                       |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| Product goals and IA                          | `5/5`          | Scoped PR #928 diff + queue/inventory closeout.                               | None.                              |
| UX flow clarity                               | `5/5`          | Screenshot handoff + targeted unit coverage + unchanged workflow labels.      | None.                              |
| Visual design quality                         | `5/5`          | Approved 16:20 after/reference screenshots + token/class review.              | None.                              |
| Business logic correctness and data integrity | `5/5`          | Targeted tests + unchanged API/payload/course-structure diff review.          | None.                              |
| Admin editor ergonomics                       | `5/5`          | Screenshot handoff + tests for workspace/actions/create flow.                 | None.                              |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions + full-lane e2e/a11y coverage.                     | None.                              |
| Data placement and sync boundaries            | `5/5`          | Data/sync contract preserved; no server/local boundary changes.               | None.                              |
| Caching and invalidation strategy             | `5/5`          | Fetch/mutation/cache behavior unchanged in diff review and gates.             | None.                              |
| Reliability and failure handling              | `5/5`          | Existing loading/warning/error/empty/create feedback states preserved.        | None.                              |
| Security and authz                            | `5/5`          | Auth/API surfaces unchanged; CI and pre-merge negative-path coverage green.   | None.                              |
| Content governance                            | `5/5`          | Labels, Help/Guide, support scope preserved; queue/inventory updated.         | None.                              |
| Admin workflow and editability                | `5/5`          | Same edit/open/preview/move/delete/create paths with tokenized presentation.  | None.                              |
| Stack-fit and dependency discipline           | `5/5`          | Reused local/global `fs-*` tokens; no dependency/package/config changes.      | None.                              |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot approval, `verify:pre-pr`, CI, `verify:pre-merge`. | None.                              |
| DevOps and rollback readiness                 | `5/5`          | Normal squash merge `ad342a6`; no migration/config/runtime setting changes.   | Revert PR #928 if rollback needed. |
