# Task Brief: AW-006 Admin Content Manager All Content Token/Input/Action Parity (10/10)

## Metadata

- `id`: `2026-06-09-aw-006-admin-content-manager-all-content-token-input-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-09`
- `updated`: `2026-06-09`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `active implementation; screenshot approved with caveat; continue through gates and merge on green tests`
- `branch`: `aw-006-admin-content-manager-all-content-parity`

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: `main@c03aa8fb`
- `audit_status`: `active`
- `decision`: Owner explicitly selected this bounded AW-006 design-parity implementation slice on `2026-06-09`; screenshot handoff was approved with caveat and owner authorized merge when local gates and CI are green.
- `reason`: Main is clean and synced after PR `#1031` and repo-managed closeout PR `#1032`; post-merge preflight was reported green with no pending closeout. The closed design-parity reaudit identified one remaining bounded design-parity candidate in `components/admin/AdminContentManager.tsx`: All Content create form fields/actions, All Content row action/edit controls, and revision restore controls still use older route-local rounded/slate/blue styling after Course Workspace parity shipped in PR `#928`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminContentManager.tsx`, `tests/unit/admin-content-manager-state.test.tsx`, `tests/e2e/admin-foundation.spec.ts`, `AdminManagerState`, admin content API/authz/course-structure behavior, Context Notes/QR placement, Help/Guide assertions, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align Admin Content Manager All Content create/edit/revision controls with the current AW-006 admin token/input/action hierarchy without changing content data, APIs, authz, course structure, Context Notes/QR, revision restore behavior, labels, Help/Guide, or support procedures.

## Pre-Implementation Owner Explanation

Vi strammer opp All Content-delen i Content Manager slik at oppretting, redigering og revisjonsknapper ser ut og oppfoerer seg som resten av Admin. Det betyr roligere og mer konsekvent operator-UI paa den siste tydelige design-parity-flaten etter Course Workspace-arbeidet.

Hvorfor det betyr noe: denne flaten brukes til ekte innholdsarbeid, og gamle knapper/felt gjoer adminopplevelsen mer rotete og lettere aa mistolke.

Utenfor scope er ny innholdslogikk, API-er, database, auth, kursstruktur, Context Notes/QR, revisjonsdata, Help/Guide-tekst, supportprosedyrer, Habits/Micro Sessions backlog, PR, merge og full admin-redesign.

Fremoverkompatibilitet: nye content rows, statuser og eksisterende content types som kommer fra dagens API-er skal arve samme tokeniserte felt/action-behandling. Nye content types, workflow actions, labels, supportflyter eller ukjente statusverdier krever eksplisitt mapping, tester og docs-vurdering foer release.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                         | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` All Content create/edit/revision presentation and keep AW-006 queue/design inventory accurate.                                                                                                            | active brief + queue/inventory diff + changed-files review | `5/5`                   |
| UX flow clarity                               | `target`     | All Content create form, row action strip, inline edit action strip, revision panel actions, disabled states, and admin click paths remain easier to scan with unchanged action names and workflow order.                                                  | screenshot handoff + focused tests + diff review           | `5/5`                   |
| Visual design quality                         | `target`     | Changed controls reuse current `fs-library-card`, `fs-library-card-muted`, `fs-cta-primary`, `fs-cta-secondary`, `compact*ActionClass`, `compactFieldClass`, `textAreaClass`, token radius, focus, and quiet/destructive action direction where practical. | screenshot handoff + DOM/class review                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Content GET/POST/PATCH/DELETE payloads, status transitions, sort/order behavior, course-structure follow-up, revision fetch/restore payloads, Context Notes/QR, and local preferences remain unchanged.                                                    | targeted unit tests + existing e2e coverage + diff review  | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still create content, filter All Content, edit inline, cancel dirty forms, move module/lesson rows, change status, open previews/lessons, create QR links, open revisions, restore revisions, and delete through the same controls.             | focused tests + screenshot handoff                         | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, links, selects, inputs, textarea, dirty/error states, disabled controls, and revision restore controls remain keyboard reachable, labeled, and screen-reader clear.                                                                               | Testing Library assertions + screenshot/manual review      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, image payload, or material route payload increase.                                                                                                                | package diff + pre-pr gate                                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin content, categories, course structure, and revisions remain server-canonical; All Content view/filter/edit/create UI state remains component-local or existing localStorage-backed preference state.                                                 | data/sync contract + diff review                           | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing admin content/category fetches, manual refresh, mutation reload/update behavior, revision fetch, and cache policy remain unchanged.                                                                                                               | fetch/payload assertions + diff review                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing loading, schema warning, load error+retry, action notice/error, dirty edit, edit error, revision loading/error/empty, restore disabled, and pending states remain deterministic.                                                                  | targeted state tests + diff review                         | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, credentials mode, cookies, secrets, admin-only Context Notes/QR boundaries, preview href behavior, and revision restore authorization remain untouched.                                                           | unchanged auth/API diff review + existing coverage         | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because admin content may include private operational data; this slice must not expose extra fields, logs, analytics, raw IDs beyond existing UI, secrets, or storage paths.                                                                    | field/log diff review                                      | `4/5`                   |
| Content governance                            | `target`     | Existing labels, status semantics, slug/runtime ID guidance, Help/Guide assertions, support procedures, and AW-006 docs source of truth are preserved or updated for this slice.                                                                           | copy-preservation diff review + docs update                | `5/5`                   |
| Admin workflow and editability                | `target`     | Content workflow edits remain available through the same controls and API calls; implementation changes presentation only.                                                                                                                                 | targeted tests + changed-files review                      | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                                                                               | SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                                                                        | AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                                                                    | diff review                                                | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                                                                       | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                                                                              | explicit support-ops scope rationale                       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                                                                   | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin labels may later become locale-sensitive; this slice preserves existing English admin labels and must keep long labels fitting on mobile/desktop without changing translation workflow.                                           | copy-preservation diff review + screenshots                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local constants and global `fs-*`/`ui-field` token direction, keep client/API boundaries unchanged, and add no dependency or broad shared primitive.                                                                                  | component diff + package diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused unit coverage for All Content create/edit/revision token/input/action classes and preserved behavior; run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after screenshot approval.         | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven content rows, statuses, filters, and form controls should inherit the same treatment without extra services, infrastructure, or cost.                                                                                       | row/form rendering diff review                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                                                                  | git diff review + validation gates                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `AdminContentManager` Course Workspace from PR `#928`, admin manager token/action slices for Email Templates (`#910`), Messages (`#912`), Context Notes (`#914`), Notes (`#920`), Quick Capture (`#924`), Context QR (`#926`), and `AdminManagerState`.
  - `AdminContentManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/content`, `/api/admin/content/[id]`, `/api/admin/content/[id]/revisions`, `/api/admin/content/course-structure`, categories route, Context Notes, Context QR, and preview routes.
  - Cache/revalidation behavior remains unchanged; existing fetch, revision load, and mutation refresh behavior is preserved.
- TypeScript/domain contracts:
  - Preserve `AdminContentItemRow`, `AdminContentStatus`, `AdminContentType`, `ContentPrimaryView`, edit/create form state, lesson body edit state, revision response unions, status labels, and existing fallback/error strings.
  - Deterministic invariant: every returned All Content row renders the same identity, status, sort order, parent relationship, runtime lesson ID, preview URL, revision permission, and permitted actions before and after this presentation pass.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse existing manager-local `compactFieldClass`, `textAreaClass`, `compactPrimaryActionClass`, `compactSecondaryActionClass`, `compactDangerActionClass`, `compactWarningActionClass`, `compactSuccessActionClass`, `rowCardClass`, `workspacePanelClass`, `nestedPanelClass`, and global `fs-*`/`ui-field` direction where practical.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed All Content states inside `/admin` to tokenized sibling admin manager surfaces and/or the already-tokenized Content Manager Course Workspace.
- Testing:
  - Add/update focused unit tests in `tests/unit/admin-content-manager-state.test.tsx` for create form fields/submit, row edit/save/cancel, All Content row action strip, revision retry/restore actions, and unchanged behavior.
  - Existing `tests/e2e/admin-foundation.spec.ts` should continue to cover create/edit/status/revision behavior; do not add a new slow e2e unless unit coverage cannot prove the scoped contract.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin content rows, categories, course module/lesson structure, status, sort order, parent links, runtime IDs, revision history, Context Notes/QR links, and mutation outcomes remain owned by existing admin APIs/storage.
- Local data:
  - Primary view, All Content scope preference, search/filter/sort state, edit/create form state, pending IDs, revision panel state, action notice/error, and focused UI state remain component-local or existing localStorage-backed UI preference state.
- Sync policy:
  - Manual refresh still fetches content and categories through existing paths.
  - Successful create/edit/delete/move/status/restore actions keep using existing local update/reload behavior.
  - Failures remain visible through existing error/notice/recovery states; no optimistic persistence or conflict policy changes.
- Retention and sensitivity:
  - Content retention, revision history, admin-only visibility, Context Notes/QR placement, and support diagnostics remain unchanged.
- Cache/invalidation:
  - Existing fetch/mutation/revision freshness behavior remains the invalidation boundary.

## Identity And Rename Contract

This slice does not change identity behavior. Content row `id` remains the canonical stable identifier for updates, deletion, revision history, Context Notes/QR attachment, and course-structure operations. Course lesson runtime IDs remain locked identifiers for `/course` progress, notes, preview links, and lesson routing. Slug/title/category remain human-readable editable fields under the existing rename guidance; materially different learning objects must still be created as new rows rather than repurposing an existing row. Revision `id` remains the restore target for revision POST payloads.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin content rows, content types, statuses, course modules, course lessons, module parent links, runtime lesson IDs, preview links, filters, sort modes, revision restore availability, Context Notes/QR placements, and course-structure actions.
- Source of truth:
  - Content rows come from `/api/admin/content`.
  - Categories come from `/api/admin/categories/content`.
  - Revision history and restore permissions come from `/api/admin/content/[id]/revisions`.
  - Preview URLs derive from existing preview/runtime ID helpers.
  - Visual treatment comes from existing `fs-*` tokens and admin-local constants in `AdminContentManager`.
- Additive behavior:
  - New content rows and existing known content types/statuses returned by current APIs should render through the same card/field/action treatment without code changes.
  - New revision entries returned by the existing API should inherit the same revision row and restore action treatment.
- Explicit mapping requirements:
  - New content types, statuses, preview modes, workflow actions, revision actions, support runbook flows, Help/Guide instructions, or route/label changes require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown API failures remain handled by current error states.
  - Unknown typed content/status/revision values must fail type review or receive explicit fallback label/class mapping before release.
- Test/evidence:
  - Focused unit tests verify All Content create/edit/revision token/input/action class parity and unchanged create/edit/restore behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing Content Manager workflow labels, All Content labels, Help/Guide assertions, content governance guidance, support procedures, and operator instructions. Help/Guide or runbook updates are required if implementation changes action meaning, recovery behavior, auth, status behavior, course structure behavior, labels, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Content items`
  - `Course Workspace`
  - `All Content`
  - `Create content item`
  - `Save content item`
  - `Save changes`
  - `Cancel`
  - `Edit`
  - `Edit (soon)`
  - `Move up`
  - `Move down`
  - `Open preview`
  - `Open preview (no lessons)`
  - `Create QR link`
  - `Open lesson`
  - `Revisions`
  - `Hide revisions`
  - `Restore`
  - `Delete`
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
  - `docs/task-briefs/done/`
- Expected fallout:
  - All Content create/edit/revision presentation aligns with current AW-006 admin token/input/action direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates after implementation starts.
  - Canonical AW-006 queue and design inventory updates.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminContentManager.tsx` All Content create panel shell, create form labels, selects, inputs, textarea, category datalist field, schema/action feedback placement where present, and `Save content item` action with current AW-006 admin token/input/action direction.
- Align All Content row action strip controls inside each `admin-content-item`, including inline `Edit`/`Editing`/`Edit (soon)`, move actions, preview/open/QR links, revisions toggle, status transition buttons, destructive delete action, and disabled/pending states where they still use route-local button styling.
- Align inline edit form action strip, especially `Save changes` and `Cancel`, while preserving dirty warning and edit error state behavior.
- Align revision history panel/action controls, including retry and `Restore`, with existing admin token/action direction while preserving revision loading/error/empty state semantics.
- Preserve content fetch/create/update/delete behavior, status transition behavior, course structure normalize/move/delete behavior, filter and local preference behavior, preview URL generation, Context Notes/QR rendering, revision fetch/restore behavior, labels, Help/Guide, support procedures, and all API/auth behavior.
- Add or update focused tests for All Content token/input/action classes and preserved behavior.
- Update this planned brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Admin content API changes, course structure algorithm changes, content schema, category API, revision API behavior, Context Notes/QR APIs, authz, RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, preview route behavior, or storage retention.
- Course Workspace redesign, module/lesson workflow redesign, full All Content IA redesign, Help Center redesign, Context Notes/QR redesign, admin workspace shell changes, Notes, Commerce, Operations, QR Registry, Email Templates, Messages, Categories, Quick Capture, Screenshot Capture, or other manager internals beyond the scoped Content Manager All Content presentation.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, Habits/Micro Sessions product backlog, PR creation, or merge to `main`.

## Acceptance Criteria

1. All Content create form shell, labels, fields, textarea, submit action, row actions, inline edit actions, and revision restore/retry actions use the current AW-006 admin token/input/action direction while preserving labels, destinations, disabled states, and user flow.
2. Content row data, filters, local view preferences, create/edit/status/delete payloads, course structure normalize/move/delete behavior, preview/open links, Context Notes/QR placement, and revision restore behavior remain unchanged.
3. Buttons, links, inputs, selects, textarea, status chips, disabled states, dirty/error states, and revision states remain keyboard reachable and semantically clear.
4. Future content rows, known content types/statuses, and revision entries returned by existing APIs inherit the same card/action treatment without hardcoded today-only row IDs or labels.
5. Screenshot handoff includes `after/reference` artifacts for representative changed All Content admin states before `npm run verify:pre-pr`.
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

Active implementation. This brief has moved to `in-progress` on branch `aw-006-admin-content-manager-all-content-parity`; scoped changes and screenshot handoff are complete. Owner approved the screenshot handoff with caveat and authorized merge when `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` are green.

## Checkpoint Log

- `2026-06-09 | planned | created from clean main@c03aa8fb after PR #1031 and repo-managed closeout #1032; post-merge preflight was reported green with no pending closeout; brief is scoped to AdminContentManager All Content create/edit/revision token/input/action parity only, with Habits/Micro Sessions backlog intentionally excluded | next: wait for explicit owner execute/build/implement before moving this brief to in-progress and changing product code`
- `2026-06-09 | in-progress | owner requested execution in /Users/stianvikra/freeswimming and branch aw-006-admin-content-manager-all-content-parity was created from main@c03aa8fb with the planned brief/inventory/queue updates carried forward; implemented scoped AdminContentManager All Content create/edit/revision token/input/action parity and added focused unit coverage | next: run targeted lint/sweeps, capture after/reference screenshot handoff, and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-09 | screenshot-review | targeted validation passed: ./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx, npm run lint:briefs (changed-brief lane skipped because the moved brief is not staged yet), npm run lint:briefs:all, targeted route/label/support rg sweep, and git diff --check; screenshot handoff captured at output/admin-content-all-content-parity-2026-06-09-010321 using deterministic local API mocks and a temporary admin-layout fixture because /dev/login is blocked locally by the Supabase egress guard; temporary fixture/script were removed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-09 | screenshot-approved | owner approved the screenshot handoff with caveat: accepted as token/action parity for the current design direction, while button stacking, visual weight, and later polish will be handled when the surfaces are used further; owner authorized merge when tests/gates are green | next: run npm run verify:pre-pr`
- `2026-06-09 | pre-pr-green | npm run verify:pre-pr passed full lane on branch aw-006-admin-content-manager-all-content-parity: branch-current, quality gates, lint, typecheck, unit tests, build, perf budgets, and Playwright e2e; local dev-login-dependent e2e cases were skipped by existing environment guards while open/security coverage passed | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-09 | screenshot-refresh | regenerated final after/reference screenshot artifacts at output/admin-content-all-content-parity-2026-06-09-012824 after pre-commit formatting touched the rendering file; artifacts include desktop overview, desktop edit/revisions, mobile overview, and Course Workspace reference; temporary fixture/script were removed and no scoped product-rendering files changed after this final capture | next: amend commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
