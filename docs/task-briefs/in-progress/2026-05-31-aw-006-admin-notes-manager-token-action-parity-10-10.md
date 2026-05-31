# Task Brief: AW-006 Admin Notes Manager Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-notes-manager-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner explicitly requested execute`
- `branch`: `aw-006-admin-notes-manager-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@bd0dff8`
- `audit_status`: `ready`
- `decision`: Execute this as the active AW-006 UI slice.
- `reason`: `main` is clean and synced after PR `#918` and repo-managed closeout PR `#919`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice, confirmed the latest admin token/action slices are done, and identified `AdminNotesManager` as the clearest remaining admin manager with state parity already done but shell, filters, note rows, attachment panels, related-note panels, edit/create forms, and visible actions still using older local `rounded-2xl`/`slate`/`blue`/`rose` styling.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminNotesManager.tsx`, `AdminManagerState`, admin notes API/authz/upload behavior, note category/priority/context contracts, Help/Guide assertions, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the Admin Notes manager shell, filters, note cards, attachment/related-note panels, edit/create forms, incident template cards, and visible actions with the current AW-006 admin token/action hierarchy without changing note data, filters, uploads, related notes, context linking, status behavior, API behavior, Help/Guide content, or support procedures.

## Pre-Implementation Owner Explanation

Vi gjor admin-notater-siden visuelt lik de nye admin-flatene, slik at notater, filtre, bilder, relaterte notater og handlinger blir enklere aa skanne. Det betyr mindre visuell restgjeld paa en daglig arbeidsflate. Utenfor scope er note-data, API-er, opplasting, relaterte notater, statuslogikk, labels, Help/Guide og supportprosedyrer.

Fremoverkompatibilitet: nye notater, kategorier, prioriteringer, context-maal, bilder og relaterte notater skal arve samme layout fra eksisterende data; nye workflow-handlinger, statuser eller context-typer krever eksplisitt mapping og Help/Guide-vurdering.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                      | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminNotesManager` presentation and keep the AW-006 queue/design inventory accurate after #918/#919.                                                                        | active brief + queue/inventory diff + changed-files review  | `5/5`                   |
| UX flow clarity                               | `target`     | Notes search, status/category/priority/context filters, refresh, done toggle, edit, delete, image upload, related-note linking, incident templates, and save actions remain easier to scan.             | screenshot handoff + component tests + diff review          | `5/5`                   |
| Visual design quality                         | `target`     | The manager reuses current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and quiet/destructive action direction without broad redesign.   | screenshot handoff + DOM/class review                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Notes GET/POST/PATCH/DELETE payloads, filtering, sorting, done toggles, attachment upload/delete, related-note link/unlink, context selection, and recovery behavior remain unchanged.                  | targeted unit/e2e-relevant tests + diff review              | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still refresh, filter, create, edit, mark done, delete, attach images, retry staged uploads, link/unlink related notes, and apply incident templates with no added workflow step.            | component tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, labels, selects, search, status filters, checkboxes, file upload controls, attachment links, related-note buttons, disabled states, and live feedback remain keyboard and screen-reader clear. | Testing Library assertions + screenshot/manual review       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, image payload, or material route payload increase.                                                             | package diff + pre-pr gate                                  | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin notes remain server-canonical; filter/search/edit/link/upload form state remains component-local; no browser storage, sync, retention, or conflict policy changes.                                | data/sync contract + diff review                            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing `cache: "no-store"` admin note/content/product/category fetches remain unchanged; manual refresh and mutation reload/update behavior remain the invalidation controls.                         | fetch call assertions + diff review                         | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing loading, warning, error+retry, action-error, action-notice, empty/no-results, upload recovery, staged-image retry, and disabled pending states remain deterministic.                           | targeted state tests + diff review                          | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, same-origin credentials, note PII/admin-only image boundaries, signed URL display, and secret handling remain untouched.                                       | unchanged auth/API diff review + existing security coverage | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because notes may contain private operational data; the slice must not expose extra fields, logs, analytics, raw storage paths, or image URLs beyond existing authorized rendering.          | PII/attachment field diff review + tests                    | `4/5`                   |
| Content governance                            | `target`     | Existing note labels, incident guidance, Help/Guide behavior, admin-notes recovery runbook references, support procedures, and AW-006 docs source of truth are preserved or updated for this slice.     | copy-preservation diff review + docs update                 | `5/5`                   |
| Admin workflow and editability                | `target`     | Notes workflow edits remain available through the same controls and API calls; this PR changes shell/card/action presentation only.                                                                     | targeted tests + changed-files review                       | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                            | SEO scope rationale                                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                     | AI-discoverability scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                 | diff review                                                 | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                    | explicit commerce scope rationale                           | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting because incident quick templates are visible, but their wording, severity mapping, owner cadence, runbook paths, and support procedures must remain unchanged.                               | copy-preservation diff review + route/label/support sweep   | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                | explicit finance scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin note labels may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                                     | copy-preservation diff review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API/upload boundaries unchanged, and add no dependency or new global primitive.                                           | component diff + package diff                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for Notes manager token/action classes, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.              | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven note rows, attachments, related-note rows, category options, and context rows should inherit the same treatment without extra services, infrastructure, or cost.         | row/form rendering diff review                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                               | git diff review + validation gates                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, Commerce/Operations manager parity from PR `#904`, QR Registry manager parity from PR `#906`, Categories manager parity from PR `#908`, Email Templates manager parity from PR `#910`, Messages manager parity from PR `#912`, Context Notes panel parity from PR `#914`, Help/Guide parity from PR `#918`, and `AdminManagerState`.
  - `AdminNotesManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/notes`, `/api/admin/notes/[id]`, note attachment routes, note related-link routes, `/api/admin/content`, `/api/admin/products`, and `/api/admin/categories/notes`.
  - Cache/revalidation behavior remains unchanged; existing `cache: "no-store"` fetches are preserved.
- TypeScript/domain contracts:
  - Preserve `AdminNoteItem`, `AdminNoteFormState`, filter state types, context type values, priority values, incident severity values, attachment contracts, related-note contracts, response unions, and existing safe fallback/error strings.
  - Deterministic invariant: every returned note row renders one editable note card with the same ID, category, priority, body, context, attachments, related notes, done state, and permitted actions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage bucket, signed URL, or query shape change.
- External services/tools:
  - Preserve image staging/upload behavior and signed URL rendering through existing helpers.
  - No provider SDK, webhook, secret, retry, observability, or outbound delivery behavior changes.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and manager-local quiet/destructive action classes aligned to the same radius/focus/token direction.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Notes states inside `/admin` to the current tokenized `/admin` shell and nearby admin manager surfaces.
- Testing:
  - Add or update focused unit tests for Notes manager token/action classes plus existing state and behavior assertions.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin note rows, done state, priority, category, date, body, context links, image attachments, related-note links, and mutation outcomes remain owned by the existing admin note API/storage layer.
- Local data:
  - Search draft, deferred query, filters, create form state, edit form state, pending staged images, upload/delete/link/update IDs, action notice/error, and recovery state remain component-local UI state.
  - No browser storage, persistence key, local draft, or cross-device sync behavior is introduced.
- Sync policy:
  - Manual refresh still fetches from `/api/admin/notes`.
  - Successful create/edit/delete/upload/link/unlink/toggle actions keep using the existing local update/reload behavior.
  - Failures remain visible through existing error/notice/recovery states; no optimistic persistence or conflict policy changes.
- Retention and sensitivity:
  - Note retention, soft workflow expectations, admin-only image display, signed URL handling, and support diagnostics remain unchanged.
- Cache/invalidation:
  - Existing `cache: "no-store"` fetch/update calls remain the freshness boundary.

## Identity And Rename Contract

This slice does not change identity behavior. Note `id` remains the canonical stable identifier for updates, done toggles, deletion, attachment operations, related-note linking, and related-note jump search. Human-readable fields such as title, category, context label, priority label, file name, and related-note title remain editable/display values from existing API rows and helpers. A materially different operational note must remain a separate note row rather than repurposing an existing row.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Note rows, category values, priority values, context type/ref values, incident severities, image attachments, related-note rows, filter controls, and admin note workflow actions.
- Source of truth:
  - Notes come from `/api/admin/notes`.
  - Note mutations go through the existing admin note route handlers and client helpers.
  - Category suggestions come from `/api/admin/categories/notes`.
  - Context labels/options come from `buildAdminNoteContextCatalog` and `resolveAdminNoteContextLabel`.
  - Priority and incident labels come from existing admin note domain constants/helpers.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New note rows, categories, context refs, attachments, and related-note links returned by existing APIs should render through the same card/form treatment without code changes.
  - Existing loading, warning, error, empty, no-results, action notice, action error, and upload recovery states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New context types, priority values, incident severities, workflow actions, attachment kinds, support runbook flows, or Help/Guide instructions require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown API failures remain handled by current error states.
  - Unknown typed context/priority/severity values must fail type review or receive an explicit fallback label/class mapping before release.
- Test/evidence:
  - Focused unit tests verify shell/filter/note-row/form/action class parity and unchanged fetch, filter, create, edit, done toggle, attachment, related-note, incident-template, and no-results behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing Notes workflow labels, incident quick-template guidance, Help/Guide assertions, admin-notes recovery runbook references, support procedures, and operator instructions. Help/Guide or runbook updates are required if implementation changes action meaning, recovery behavior, auth, status behavior, upload behavior, incident procedure, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Notes`
  - `Work queue filters`
  - `Create note`
  - `Incident quick templates`
  - `Admin-only images`
  - `Related notes`
  - `Done archive`
  - `Save note`
  - `Retry upload`
  - `AdminNotesManager`
  - `admin-notes-recovery`
- Surfaces to check:
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `components/admin/AdminContextNotesPanel.tsx`
  - `docs/runbooks/admin-notes-recovery.md`
  - `tests/unit/admin-notes-manager-state.test.tsx`
  - `tests/unit/admin-notes-manager-related-links.test.tsx`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Notes card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates after execution begins.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminNotesManager.tsx` shell, refresh action, filters, note rows, done/edit/delete actions, attachment preview panels, related-note panels, edit form, image/related-note edit utilities, create form, incident template cards, upload actions, staged-image cards, save action, retry action, and state wrappers with current AW-006 token/action direction.
- Preserve note fetch/create/update/delete behavior, filters, sorting, done toggles, attachment upload/delete behavior, staged-image recovery, related-note linking/unlinking, context selection, incident template payloads, labels, Help/Guide, support procedures, and all API/auth behavior.
- Add or update focused tests for Notes token/action classes and preserved behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Admin notes API changes, note schema, category API, content/product context API, attachment storage, signed URL behavior, related-note data model, incident severity mapping, admin authz, RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, or storage retention.
- Admin workspace shell, admin content, Context Notes, Context QR, Commerce, Operations, QR Registry, Email Templates, Messages, Categories, Help Center, or other manager internals beyond the scoped Notes manager.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. Notes manager shell, filters, note rows, attachment panels, related-note panels, edit/create forms, incident templates, upload/retry controls, and visible actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. Note row data, GET/POST/PATCH/DELETE payloads, filters, context linking, attachments, related-note behavior, incident template payloads, staged-image recovery, and done/delete/edit behavior remain unchanged.
3. Buttons, links, search, selects, checkboxes, upload controls, file inputs, attachment links, related-note buttons, disabled states, loading/error/empty/no-results states, and live regions remain keyboard reachable and semantically clear.
4. Future notes, category values, context refs, attachment rows, and related-note rows returned by existing APIs inherit the same treatment without hardcoded today-only values.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-notes-manager-state.test.tsx tests/unit/admin-notes-manager-related-links.test.tsx tests/unit/admin-notes-manager.test.ts`
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

- `2026-05-31 | in-progress | started from clean main@bd0dff8 after PR #918 and repo-managed closeout #919; post-merge preflight passed with no closeout remaining; owner approved and explicitly executed Admin Notes Manager Token/Action Parity after fresh queue/design/code re-audit | next: update queue/inventory, implement scoped Notes manager token/action parity, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-31 | targeted-qa | implemented scoped AdminNotesManager token/action parity for shell, filters, note rows, attachment/related-note panels, edit/create forms, incident template cards, upload/retry/save/delete actions, queue/design-inventory docs, and focused class assertions while preserving notes data/API behavior; targeted Vitest passed for admin notes manager tests, targeted ESLint passed, npm run typecheck passed, npm run lint:briefs:all passed, route/label/support sweep completed, and git diff --check passed | next: capture after/reference screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot-handoff | captured after/reference visual artifacts against local Next dev at output/aw-006-admin-notes-manager-token-action-parity-2026-05-31-112657: Notes desktop, Notes edit desktop, Notes mobile, and Messages desktop reference; temporary capture route/script removed after capture, with no scoped product-rendering file changes after the final screenshots | next: owner visual approval or corrections before npm run verify:pre-pr`
- `2026-05-31 | pre-pr | owner approved screenshot handoff; npm run verify:pre-pr passed full lane with lint, typecheck, unit, build, performance budgets, and Playwright E2E (102 passed, 492 expected skips) | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
