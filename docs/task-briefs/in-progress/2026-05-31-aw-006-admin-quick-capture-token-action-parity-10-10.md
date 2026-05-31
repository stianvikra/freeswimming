# Task Brief: AW-006 Admin Quick Capture Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-quick-capture-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner approval`
- `branch`: `aw-006-admin-quick-capture-token-action-parity`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@bbbd8c2`
- `audit_status`: `ready`
- `decision`: Execute this AW-006 UI slice as the active Admin Quick Capture Token/Action Parity pass.
- `reason`: `main` is clean and synced after PR `#922` and repo-managed closeout PR `#923`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminNoteQuickCaptureLauncher` as a high-frequency admin notes utility that already has feedback-state parity but still uses older local `rounded-*`/`slate`/`blue` panel, trigger, form, image-tool, and action styling while adjacent admin notes surfaces now use the current `fs-*` token/action hierarchy. The owner approved this slice on `2026-05-31`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminNoteQuickCaptureLauncher`, `AdminNoteClipboardPasteButton`, `AdminNotesManager`, `AdminManagerState`, admin notes upload/recovery behavior, quick-capture draft-store behavior, Help/Guide assertions, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the admin quick-capture trigger, collapsed rail tab, panel shell, locked-context card, image tools, staged-image rows, form controls, and visible actions with the current AW-006 admin token/action hierarchy without changing note save behavior, image upload/retry/remove behavior, draft restore, route context, category loading, API/auth behavior, labels, Help/Guide, or support procedures.

## Pre-Implementation Owner Explanation

Vi rydder den lille "Quick note"-skuffen som admin bruker for raske notater, slik at den matcher samme visuelle spraak som Notes manager, Context Notes og screenshot capture. Det betyr noe fordi dette er en hyppig admin-handling, og den staar igjen med eldre blaa/slate/lokale knapper og paneler. Utenfor scope er notatlagring, bilder, draft recovery, API, auth, Help/Guide og hvilke sider quick capture vises paa.

Fremoverkompatibilitet: nye quick-capture-hostflater skal kunne bruke samme trigger/panel/action-stil uten egne lokale blaa/slate-knapper; nye notatfelt, recovery-handlinger eller workflows maa fortsatt mappes eksplisitt med tester og docs-vurdering foer release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Admin workflow and editability`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminNoteQuickCaptureLauncher` presentation and keep the AW-006 queue/design inventory accurate after #922/#923.                                      | active brief + queue/inventory diff + changed-files review | `5/5`                   |
| UX flow clarity                               | `target`     | Quick-capture open, collapse, resume, locked-context review, image staging, retry upload, discard, save, and open-in-notes actions remain easier to scan with no changed order.   | screenshot handoff + component tests + diff review         | `5/5`                   |
| Visual design quality                         | `target`     | The trigger, rail tab, panel, nested cards, form controls, and actions reuse current `fs-*` card/action/token direction and avoid older one-off rounded blue/slate treatment.     | screenshot handoff + DOM/class review                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Note-save payloads, image upload/retry/remove behavior, draft restore, route context, category fetch, and `onSaved` callback remain unchanged.                                    | focused component tests + diff review                      | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still create, collapse, resume, discard, save, retry uploads, remove images, and open saved notes with no added click or changed action meaning.                       | component tests + screenshot handoff                       | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, aria labels, live feedback, disabled states, form labels, links, collapsed resume affordance, and keyboard reachable actions remain semantically clear.                  | Testing Library assertions + screenshot/manual review      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: token/class/icon reuse adds no dependency, fetch path, repeated render loop, image payload, or material `/admin` payload increase.                               | package diff + pre-pr gate                                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin notes/attachments remain server-canonical; quick-capture draft text, locked context, pending images, previews, and recovery state remain existing local/draft-store state.  | data/sync contract + focused tests + diff review           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                     | cache scope rationale                                      | `N/A`                   |
| Reliability and failure handling              | `target`     | Save errors, attachment upload failures, retry upload, remove image, context mismatch warning, draft restore, and close/discard behavior remain deterministic.                    | focused recovery/error tests + diff review                 | `5/5`                   |
| Security and authz                            | `target`     | Protected admin note API routes, same-origin uploads, role gates, credentials, cookies, secrets, storage behavior, and authz boundaries remain untouched.                         | unchanged auth/API diff review + existing security gates   | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because quick notes/images may contain private admin/member data; the slice must not expose extra note/image content, logs, raw URLs, or storage paths.                | privacy/upload diff review                                 | `4/5`                   |
| Content governance                            | `target`     | Existing quick-capture copy, labels, support procedures, Help/Guide boundaries, AW-006 queue, and design inventory are preserved or updated for this slice.                       | copy-preservation diff review + docs update                | `5/5`                   |
| Admin workflow and editability                | `target`     | Quick capture remains an admin notes utility with the same create, image attach, retry, discard, save, context, and Notes handoff contract.                                       | targeted tests + changed-files review                      | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                      | SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                               | AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                           | diff review                                                | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                              | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting because admin notes may support incident work, but this slice preserves quick-capture workflow labels, recovery behavior, runbook paths, and support procedures.       | route/label/support sweep + copy-preservation diff review  | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                          | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin labels and avoids tight fixed-width assumptions.              | copy-preservation diff + screenshot text-fit review        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current admin `fs-*` token/action direction, existing `AdminManagerState`, and existing quick-capture client/draft APIs; add no dependency.                                 | component diff + package diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused unit coverage for quick-capture token/action classes and preserved behavior; run targeted tests, brief lint, sweep, screenshot handoff, and broad gates later. | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because future quick-capture hosts should inherit the same local treatment without extra services, infrastructure, or recurring cost.                                  | component rendering diff review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                         | git diff review + validation gates                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `AdminNotesManager` after PR `#920`, `AdminContextNotesPanel` after PR `#914`, `AdminNoteScreenshotCaptureButton` after PR `#922`, and `AdminManagerState`.
  - `AdminNoteQuickCaptureLauncher` stays a client component and retains portal ownership.
  - Route/action/API boundary remains unchanged: `/api/admin/notes`, note attachment routes, note category fetches, and admin auth boundaries are not moved.
  - Cache/revalidation behavior remains unchanged; no fetch policy, route cache, or invalidation behavior is added.
- TypeScript/domain contracts:
  - Preserve `QuickCaptureFormState`, `QuickCaptureLockedContext`, `QuickCapturePendingImage`, `QuickCaptureSavedNotice`, `AdminNoteItem`, `AdminNotePriority`, category response types, and fallback error strings.
  - Deterministic invariant: styling changes cannot alter save payloads, draft-store ownership, image upload/retry/remove decisions, context locking, or panel state transitions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, storage bucket, signed URL, index, or query shape change.
- External services/tools:
  - No provider SDK, webhook, secret, retry, observability, analytics vendor, email, Stripe, or outbound delivery behavior changes.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, `fs-cta-primary`, `fs-cta-secondary`, CSS variables, and local quiet/destructive action classes where practical.
  - Use lucide icons for button/tool affordances where the app already uses lucide in adjacent admin notes utilities.
  - Keep the change quick-capture-local; do not introduce a broad shared Button/Card/Dialog primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed quick-capture panel states to current tokenized Notes/admin utility references.
- Testing:
  - Update focused unit tests for quick-capture class/token expectations and preserved save/retry/draft/context behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin notes and attachments remain server-canonical through the existing admin note APIs/storage.
  - Note IDs, attachment IDs, note titles, context refs, priority values, and category values are not changed by this slice.
- Local data:
  - Quick-capture draft text, locked context snapshot, pending image previews, collapsed/open state, and created-capture recovery state remain existing local browser state/draft-store data.
- Sync policy:
  - Save and attachment retry continue to use existing explicit user actions; this slice does not add background sync, retry/backoff, conflict handling, or invalidation behavior.
- Retention and sensitivity:
  - Local draft and image preview retention stay governed by the existing quick-capture draft-store lifecycle and clear/remove actions.
- Cache/invalidation:
  - No route cache, API cache, revalidation, or refresh behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing note IDs, titles, categories, context refs, attachment IDs, route contexts, and admin tab/query params are not changed.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin route/context values (`contextType`, `contextRef`, `contextLabel`), note categories from `/api/admin/categories/notes`, note priority values from `ADMIN_NOTE_PRIORITY_VALUES`, staged image states, and future quick-capture host surfaces.
- Source of truth:
  - Context values continue to come from `AdminNoteQuickCaptureLauncher` props and the quick-capture draft store.
  - Category suggestions continue to come from the notes category API.
  - Priority options continue to come from the canonical typed values in `@/lib/admin/notes`.
  - Visual treatment follows current admin `fs-*` tokens and adjacent admin notes action classes.
- Additive behavior:
  - New admin surfaces that pass valid context props should keep the same generic locked-context, image, form, saved, and error treatment without new hardcoded route checks.
  - New active note categories should appear through the category API without UI code changes.
  - New priority values added to the canonical typed list should render through the existing option map and label formatter.
- Explicit mapping requirements:
  - Product-specific support guidance, new Help/Guide instructions, new recovery actions, new workflow labels, new context-type-specific copy, new priority semantics, or new attachment workflows require an explicit mapping/update and tests before release.
- Unknown or deprecated values:
  - Unknown context labels still render through generic locked-context copy.
  - Unknown category strings remain plain text in the category input.
  - Unknown future priority values must be added to the canonical type/list before they can be selected in this UI.
- Test/evidence:
  - Focused tests prove current context props and request payloads remain data-driven rather than hardcoded to one route.
  - Route/label/support sweep confirms no Help/Guide or runbook fallout when labels and recovery behavior are preserved.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and the Admin Notes recovery runbook. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Quick note`
  - `Quick capture`
  - `Admin note`
  - `Locked context`
  - `Images`
  - `Upload images`
  - `Paste image from clipboard`
  - `Retry upload`
  - `Remove image`
  - `Discard`
  - `Save`
  - `Open in Notes`
  - `AdminNoteQuickCaptureLauncher`
  - `AdminNoteClipboardPasteButton`
- Surfaces to check:
  - `components/admin/AdminNoteQuickCaptureLauncher.tsx`
  - `components/admin/AdminNoteClipboardPasteButton.tsx`
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-notes-recovery.md`
  - `tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `tests/e2e/admin-contextual-notes.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Quick-capture panel/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminNoteQuickCaptureLauncher.tsx` trigger action, collapsed resume rail, panel header, locked-context panel, image-tools panel, staged-image rows, form controls, checkbox row, footer actions, and visible save/retry/remove/discard/open actions with the current AW-006 admin token/action direction.
- Preserve existing copy, open/collapse/resume/close behavior, save payloads, category fetch, draft restore, retry upload, remove image, image preview, open-in-notes link, `onSaved` callback, and request behavior.
- Add or update focused tests for quick-capture token/action classes and preserved behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Admin notes API changes, attachment upload/retry/recovery behavior changes, file naming, quick-capture route matrix or host-surface changes, Help/Guide or runbook copy changes, category model changes, priority model changes, related-note behavior, Context Notes, Context QR, QR APIs, content APIs, admin content editor layout, screenshot capture behavior, authz, Supabase schema/RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, storage retention, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.
- Broad app-wide Button/Card/Dialog/Notice primitives.
- New or changed `AdminManagerState` API.

## Acceptance Criteria

1. Quick-capture trigger, collapsed rail, panel shell, nested panels, form controls, image rows, and visible actions use the current AW-006 admin token/action direction while preserving labels, disabled states, and user flow.
2. Note-save payloads, image upload/retry/remove behavior, draft restore, route context, category fetch, `onSaved`, and open-in-notes behavior remain unchanged.
3. Buttons, form labels, links, live feedback, static context warning, disabled states, and collapsed resume affordance remain keyboard/screen-reader clear.
4. Future quick-capture hosts, categories, and priority values either flow from existing canonical data or require explicit mapping with tests before release.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - targeted ESLint for changed TSX/test files if needed
  - `npm run typecheck`
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

- `2026-05-31 | in-progress | started from clean main@bbbd8c2 after PR #922 and repo-managed closeout #923; post-merge preflight passed with no closeout remaining; owner approved Admin Quick Capture Token/Action Parity after the Norwegian non-programmer explanation and fresh queue/design/code re-audit | next: update queue/inventory, implement scoped quick-capture token/action parity, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-31 | targeted-qa | implemented scoped Quick Capture token/action parity for the trigger, collapsed rail, panel shell, locked-context card, image tools, staged-image rows, form controls, retry/remove/discard/save actions, queue, inventory, and focused class assertions while preserving note save, upload/retry/remove, draft, context, category, and open-in-notes behavior; targeted Vitest, targeted ESLint, typecheck, lint:briefs:all, route/label/support sweep, and git diff --check passed | next: capture after/reference screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot-handoff | captured after/reference artifacts in output/aw-006-admin-quick-capture-token-parity-2026-05-31-133300 covering open desktop, image-upload recovery desktop, context warning mobile, and screenshot-capture reference preview; removed temporary local handoff route/script after capture, with no scoped product-rendering files changed after the final screenshots | next: wait for owner visual approval or correction request before npm run verify:pre-pr`
- `2026-05-31 | pre-pr-green | owner approved screenshot handoff; npm run verify:pre-pr passed full lane on branch aw-006-admin-quick-capture-token-action-parity with lint, typecheck, unit tests, build, performance budgets, and Playwright e2e green; screenshot artifacts remain unchanged since capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
