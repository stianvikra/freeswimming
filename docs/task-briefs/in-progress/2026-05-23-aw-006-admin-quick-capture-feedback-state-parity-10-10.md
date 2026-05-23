# Task Brief: AW-006 Admin Quick Capture Feedback State Parity (10/10)

## Metadata

- `id`: `2026-05-23-aw-006-admin-quick-capture-feedback-state-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-23-aw-006-post-dryland-queue-inventory-closeout-metadata-repair-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-quick-capture-feedback-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@96c55b6`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded admin quick-capture feedback state parity pass for `AdminNoteQuickCaptureLauncher`.
- `reason`: `main` is clean after PR `#820` and repo-managed closeout PR `#821`; `npm run post-merge:preflight` was reported green with no pending closeout. A fresh queue/design/code re-audit found no selected AW-006 product slice and a small mature UI gap where quick-capture saved, warning, and error feedback still uses route-local markup instead of the existing admin-local `AdminManagerState` primitive.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminNoteQuickCaptureLauncher`, `AdminManagerState`, admin notes quick-capture behavior, admin notes Help/Guide contracts, notice/empty-state inventory, forward-compatibility rules, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring admin quick-capture saved, context-warning, and error feedback into parity with the existing admin-local state primitive without changing note save, image upload, retry, draft restore, route context, category loading, authz, API, database, Help/Guide, or support behavior.

## Pre-Implementation Owner Explanation

Vi rydder opp i tilbakemeldingene i "Quick capture" for admin-notater, slik at lagret-melding, varsel om laast kontekst og feil vises med samme etablerte admin-monster som resten av AW-006-adminflatene. Det betyr noe fordi admin faar mer forutsigbare meldinger naar raske notater lagres eller bildeopplasting maa rettes opp. Utenfor scope er notat-API, bildeopplasting, retry-logikk, hvilke sider quick capture finnes paa, Help/Guide, kategorier, tillatelser og datalagring.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                    | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminNoteQuickCaptureLauncher` feedback rendering and keep the AW-006 canonical queue accurate after `#820/#821`.                                         | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Quick-capture saved feedback, context-mismatch warning, and action errors remain visible, specific, and close to the panel action that caused them.                                   | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated quick-capture feedback uses the existing `AdminManagerState` visual contract and matches the admin state family without panel redesign.                                      | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Note-save payloads, image upload/retry/remove behavior, draft restore, route context, category fetch, and callback behavior remain unchanged.                                         | focused component tests + diff review                              | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still get clear saved/retry/fallback feedback in quick capture without extra clicks or changed action labels.                                                                  | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic saved/error feedback uses appropriate live-region semantics, context warnings are readable without noisy static announcements, and no unlabeled controls are added.           | component tests for role/aria + screenshot/manual review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                       | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The slice documents that server-canonical notes/attachments and local quick-capture drafts keep their existing ownership and sync/retention behavior.                                 | data contract + unchanged draft/API diff review                    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                         | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Feedback remains deterministic from existing `savedNotice`, `createdCaptureRecovery`, `currentSurfaceMatchesDraftContext`, and `error` state; retry and removal behavior stay stable. | component tests for recovery/error rendering                       | `5/5`                   |
| Security and authz                            | `target`     | Protected admin note API routes, credentials, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                         | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no note content exposure, image payload exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                        | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing quick-capture copy, queue, and design inventory are preserved or explicitly updated for this slice only.                                                                     | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Quick-capture open/collapse/close, save, discard, retry upload, remove image, open-in-notes, and locked-context behavior keep existing labels and behavior.                           | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                     | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                   | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin quick-capture actions continue to use current behavior.                                               | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin quick-capture feedback only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.           | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                         | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                              | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                      | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, keep the helper API unchanged, and add no dependency.                                                       | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for quick-capture feedback; run targeted tests, brief lint, screenshot handoff, and broad gates after screenshot approval.                             | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                               | helper reuse in one bounded quick-capture area                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                             | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially `AdminNotesManager`, `AdminContextNotesPanel`, and `AdminNoteScreenshotCaptureButton`.
  - Reuse `components/admin/AdminManagerState.tsx` inside `AdminNoteQuickCaptureLauncher`; do not move quick-capture state, portal ownership, callbacks, note-save logic, image upload/retry logic, or draft-store ownership.
  - Route/action/API boundary: `/api/admin/notes`, note attachment routes, category fetches, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve `QuickCaptureFormState`, `QuickCaptureLockedContext`, `QuickCapturePendingImage`, `QuickCaptureSavedNotice`, `AdminNoteItem`, `AdminNotePriority`, and existing fallback error strings.
  - Deterministic invariant: feedback renders only from existing `savedNotice`, `createdCaptureRecovery`, `currentSurfaceMatchesDraftContext`, and `error` state and does not alter save/upload/draft decisions.
- Supabase/data layer:
  - N/A; no schema, migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and keep the primitive admin-local.
  - Screenshot handoff comparison type: `after/reference`, comparing changed quick-capture feedback with mature admin manager state references where practical.
- Testing:
  - Add focused unit/component tests for saved, warning, error, and unchanged request payload/retry behavior.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin notes and attachments remain server-canonical through the existing admin API routes.
  - Note IDs, attachment IDs, note titles, context refs, and priority/category values are not changed by this slice.
- Local data:
  - Quick-capture draft text, locked context snapshot, pending image previews, and created-capture recovery state remain local browser state/draft-store data exactly as today.
- Sync policy:
  - Save and attachment retry continue to use the existing explicit user actions; this slice does not add background sync, retry/backoff, conflict handling, or invalidation behavior.
- Retention and sensitivity:
  - Local draft and preview retention stay governed by the existing quick-capture draft-store lifecycle and clear/remove actions.
- Cache/invalidation:
  - No route cache, API cache, revalidation, or refresh behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing note IDs, titles, categories, context refs, attachment IDs, and route contexts are not changed.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin route/context values (`contextType`, `contextRef`, `contextLabel`), note categories from `/api/admin/categories/notes`, note priority values from `ADMIN_NOTE_PRIORITY_VALUES`, and future quick-capture host surfaces.
- Source of truth:
  - Context values continue to come from `AdminNoteQuickCaptureLauncher` props and the quick-capture draft store.
  - Category suggestions continue to come from the notes category API.
  - Priority options continue to come from the canonical typed values in `@/lib/admin/notes`.
- Additive behavior:
  - New admin surfaces that pass valid context props should keep the same generic locked-context, saved, and error feedback without new hardcoded route checks.
  - New active note categories should appear through the category API without UI code changes.
  - New priority values added to the canonical typed list should render through the existing option map and label formatter.
- Explicit mapping requirements:
  - Product-specific support guidance, new Help/Guide instructions, new recovery actions, new workflow labels, or new context-type-specific copy require an explicit mapping/update and tests before release.
- Unknown or deprecated values:
  - Unknown context labels still render through generic locked-context copy.
  - Unknown category strings remain plain text in the category input.
  - Unknown future priority values must be added to the canonical type/list before they can be selected in this UI.
- Test/evidence:
  - Focused tests should prove current context props and request payloads remain data-driven rather than hardcoded to `/plans`.
  - Route/label/support sweep should confirm no Help/Guide or runbook fallout when labels and recovery behavior are preserved.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and the Admin Notes recovery runbook. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing quick-capture feedback rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Quick note saved`
  - `Ready for another note`
  - `You are viewing another page`
  - `This draft will still save`
  - `Retry upload`
  - `Could not upload images`
  - `Could not save note`
  - `AdminNoteQuickCaptureLauncher`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminNoteQuickCaptureLauncher.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `tests/e2e/admin-contextual-notes.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-notes-recovery.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - selected quick-capture feedback states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminNoteQuickCaptureLauncher.tsx` to `AdminManagerState`:
  - saved quick-note feedback inside the open panel,
  - saved quick-note feedback below the launcher trigger,
  - locked-context warning when the current surface differs from the draft context,
  - action/error feedback inside the panel.
- Preserve existing copy, open/collapse/close behavior, save payloads, category fetch, draft restore, retry upload, remove image, image preview, open-in-notes link, `onSaved` callback, and request behavior.
- Add focused unit/component tests under `tests/unit/admin-note-quick-capture-launcher.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API.
- Admin notes API changes.
- Attachment upload, staged image recovery, retry, remove, or file naming behavior changes.
- Quick-capture route matrix or host surface changes.
- Admin Help/Guide copy or recovery runbook changes.
- Admin note category model, priority model, related-note behavior, Context Notes, Context QR, QR APIs, content APIs, admin content editor layout, or screenshot capture behavior.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminNoteQuickCaptureLauncher` uses the existing `AdminManagerState` helper for the scoped saved/warning/error feedback while preserving copy, callbacks, save/upload/draft behavior, context ownership, and sibling actions.
2. Accessibility semantics are explicit: dynamic saved/error feedback uses polite status semantics, context warnings remain readable, and static helper content is not noisy.
3. Focused tests cover saved feedback, context warning feedback, error feedback, and unchanged request payload/retry behavior.
4. Canonical AW-006 queue and notice/empty-state inventory record this active slice accurately.
5. Screenshot handoff includes `after/reference` artifacts for representative changed quick-capture feedback before `npm run verify:pre-pr`.
6. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-note-quick-capture-launcher.test.tsx tests/unit/admin-manager-state.test.tsx`
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

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate and local server commands should use escalation-first strategy per repo instructions.

## Session Continuity and Recovery

- Canonical source of truth: branch `aw-006-admin-quick-capture-feedback-state-parity` and this active brief path.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Automation Mode

Automation-first, with the required visual-work exception: implement and run targeted QA directly, then stop at screenshot handoff for owner approval before `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@96c55b6 after PR #820 and repo-managed closeout #821; post-merge preflight was reported green with no pending closeout; owner approved AW-006 Admin Quick Capture Feedback State Parity after the required non-programmer explanation and fresh queue/design/code re-audit | next: update queue/inventory, migrate scoped quick-capture feedback rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-23 | screenshot-review | updated the canonical AW-006 queue and design inventory, migrated quick-capture saved/context-warning/error feedback to the existing admin-local AdminManagerState helper, and preserved note-save/image-upload/draft behavior; validation passed: targeted Vitest for quick-capture/AdminManagerState (2 files / 18 tests), npm run lint:briefs:all, npm run lint with one pre-existing output-script warning, npm run typecheck, targeted route/label/support sweep, and git diff --check; captured after/reference screenshot artifacts in output/aw-006-admin-quick-capture-feedback-20260523-135817 using a temporary local screenshot route that was removed after capture, with no committed product-rendering file changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
