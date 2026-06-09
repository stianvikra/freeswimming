# Task Brief: AW-006 Admin Note Clipboard Paste Button Token Fallback Parity (10/10)

## Metadata

- `id`: `2026-06-09-aw-006-admin-note-clipboard-paste-button-token-fallback-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-09`
- `updated`: `2026-06-09`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end implementation requested; screenshot approval stop before verify:pre-pr`
- `branch`: `aw-006-admin-note-clipboard-button-parity`

## Brief Audit Record

- `last_audited`: `2026-06-09`
- `base`: `main@59774930`
- `audit_status`: `ready`
- `decision`: Execute this bounded AW-006 design-parity child now.
- `reason`: Main is clean and synced after PR `#1035` and repo-managed closeout PR `#1036`; the post-#1034 docs/code audit identifies one remaining bounded follow-up: the shared `AdminNoteClipboardPasteButton` still has an older local button fallback while admin note image-intake call sites use the newer token/action direction.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminNoteClipboardPasteButton.tsx`, `components/ui/actionLayout.ts`, admin note image-intake call sites, `readAdminNoteClipboardImageFromNavigator`, admin note attachment limits, Help/Guide assertions, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff or PR handoff.

## Goal

Make the shared admin note `Paste image from clipboard` button fallback token-native so all admin note image-intake surfaces inherit the current AW-006 admin action styling without changing clipboard, upload, attachment, support, Help/Guide, API, or auth behavior.

## Pre-Implementation Owner Explanation

Vi gjor `Paste image from clipboard`-knappen i admin-notater visuelt lik de andre admin-knappene. Det betyr mindre design-drift paa tvers av adminflater.

Utenfor scope er clipboard-lesing, bildeopplasting, lagring, feilmeldinger, Help/Guide, supportflyt, API, auth og Habits/Micro Sessions-produktbacklog.

Fremoverkompatibilitet: fremtidige admin-note bildeinntak skal arve samme knappefallback automatisk. Nye handlingstyper, destruktive valg eller nye operatorflyter krever egen mapping, tester og docs-vurdering.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Admin workflow and editability`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                 | Evidence                                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Scope stays inside the shared admin note clipboard-paste action fallback and existing admin note image-intake usage points; AW-006 queue/design inventory identify the active child.               | active brief + queue/inventory diff + changed-files review   | `5/5`                   |
| UX flow clarity                               | `target`     | `Paste image from clipboard` remains adjacent to Upload controls, uses unchanged labels/loading/disabled behavior, and image-intake action widths follow the shared mobile action layout contract. | screenshot handoff + focused tests + diff review             | `5/5`                   |
| Visual design quality                         | `target`     | The shared fallback reuses current `fs-cta-secondary`, token radius, quiet secondary styling, focus, disabled, and sizing direction instead of old local slate/white chrome.                       | screenshot handoff + DOM/class review                        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Clipboard read, file creation, pending-image staging, saved-note upload handoff, attachment limits, error callbacks, success callbacks, and disabled/loading guards remain unchanged.              | focused unit tests + existing e2e coverage + diff review     | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still paste or upload image evidence from Notes, Context Notes, and Quick Capture with the same click paths and recovery states.                                                        | focused tests + screenshot handoff                           | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Button remains a semantic button with stable accessible name, keyboard activation, focus treatment, loading label, disabled state, and no hidden label regression.                                 | Testing Library assertions + screenshot/manual review        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class fallback reuse adds no dependency, fetch path, render loop, media payload, or material route payload increase.                                                              | package diff + pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin note records and attachments remain server-canonical; staged pre-save images and clipboard-derived files remain existing browser-local UI state until existing save/upload.                  | data/sync contract + diff review                             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing admin notes fetch, mutation refresh, saved-note upload, and local pending image invalidation behavior remain unchanged.                                                                   | fetch/payload assertions + diff review                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Unsupported browser, insecure context, permission denied, no image found, thrown read errors, upload disabled, and loading reset behavior remain deterministic.                                    | focused unit tests + existing e2e blocked-clipboard coverage | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, admin notes APIs, credentials mode, cookies, secrets, storage paths, and authz boundaries remain untouched.                                                          | unchanged auth/API diff review + existing coverage           | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because pasted images may contain private operational evidence; this slice must not expose extra data, logs, raw image data, analytics, secrets, or storage paths.                      | field/log diff review                                        | `4/5`                   |
| Content governance                            | `target`     | Existing Help/Guide assertions, support copy, admin note image-intake labels, recovery wording, and AW-006 docs source of truth are preserved or updated for this slice only.                      | copy-preservation diff review + docs update                  | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin note create/edit/context/quick-capture image-intake workflows remain available through the same controls; implementation changes presentation fallback only.                                 | targeted tests + changed-files review                        | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                       | SEO scope rationale                                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                | AI-discoverability scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, KPI behavior, or telemetry path changes.                                                                            | diff review                                                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                               | explicit commerce scope rationale                            | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                      | explicit support-ops scope rationale                         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                           | explicit finance scope rationale                             | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin labels may later become locale-sensitive; this slice preserves existing English labels and keeps the longest label fitting on mobile/desktop.                             | copy-preservation diff review + screenshots                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing shared component, caller-provided class extension, and global `fs-*` token direction; add no dependency or broad Button primitive.                                              | component diff + package diff                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused unit coverage for fallback token classes and preserved clipboard behavior; run targeted tests, brief lint, route/label/support sweep, screenshot handoff, gates.                | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because future admin note image-intake usages should inherit the shared fallback without extra services, infrastructure, or cost.                                                       | component reuse diff review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                          | git diff review + validation gates                           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: Admin Notes Manager token/action parity (`#920`), Context Notes token/action parity (`#914/#915`), Quick Capture token/action parity (`#924`), and current admin compact secondary action classes.
  - `AdminNoteClipboardPasteButton` stays a client component.
  - Route/action/API boundary remains unchanged: no admin note API, attachment upload, category, route, or auth path changes.
  - Cache/revalidation behavior remains unchanged; existing note load/save/upload refresh behavior is preserved.
- TypeScript/domain contracts:
  - Preserve `AdminNoteClipboardPasteButton` props, `readAdminNoteClipboardImageFromNavigator` contract, `File` handoff, callback timing, and existing fallback error strings.
  - Deterministic invariant: every caller receives the same file/error/success/disabled/loading behavior before and after the presentation fallback change.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse global `fs-cta-secondary`, `getMobileActionGroupClass`, `mobileActionItemClass`, and current compact secondary action direction.
  - Keep the change in the existing shared admin note clipboard component; do not introduce a broad shared Button primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed clipboard-paste actions to sibling Upload actions and/or tokenized admin note image-intake surfaces.
- Testing:
  - Update `tests/unit/admin-note-clipboard-paste-button.test.tsx` for token fallback classes and preserved success/failure behavior.
  - Existing admin notes e2e coverage should continue to cover successful paste and blocked clipboard recovery; do not add a slow e2e unless unit coverage cannot prove the scoped contract.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin notes, attachments, categories, contextual note links, and upload outcomes remain owned by existing admin APIs/storage.
- Local data:
  - Clipboard-derived `File` objects, pending pre-save images, loading state, action notices/errors, and form state remain existing browser-local UI state until existing save/upload behavior runs.
- Sync policy:
  - Saved-note uploads keep using existing upload handoff and mutation refresh behavior.
  - Pre-save staged images keep existing save-time attachment upload behavior.
  - Failures remain visible through existing callback-driven error states; no optimistic persistence or conflict policy changes.
- Retention and sensitivity:
  - Attachment retention, admin-only visibility, support diagnostics, and evidence privacy remain unchanged.
- Cache/invalidation:
  - Existing fetch/mutation/upload freshness behavior remains the invalidation boundary.

## Identity And Rename Contract

N/A with rationale: this slice changes no persisted entity identity, slug, route param, operator-visible identifier, note ID, attachment ID, category, or rename/repurpose behavior. Existing admin note IDs and attachment IDs remain the stable identifiers for stored note evidence.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin note image-intake usage points, caller-provided action classes, button labels/loading labels, disabled states, clipboard error states, and future admin note surfaces.
- Source of truth:
  - Clipboard parsing remains owned by `readAdminNoteClipboardImageFromNavigator`.
  - Visual fallback comes from `AdminNoteClipboardPasteButton` plus global `fs-cta-secondary` tokens, shared mobile action item width classes, and optional caller-provided class names.
  - Attachment limits and upload behavior remain owned by existing admin note surfaces.
- Additive behavior:
  - Future admin note image-intake usages that render `AdminNoteClipboardPasteButton` without a custom class should inherit token-native secondary styling automatically.
  - Existing usages with compact or surface-specific class names should continue to compose on top of the shared fallback.
- Explicit mapping requirements:
  - New destructive image actions, new non-image clipboard payload types, new workflow labels, new upload recovery behavior, Help/Guide instructions, support runbook flows, or route/label changes require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown clipboard errors continue through the existing generic recovery copy.
  - Unknown visual variants should fall back to secondary action treatment, not route-local hardcoded colors.
- Test/evidence:
  - Focused unit tests verify fallback token classes and preserved success/error behavior.
  - Route/label/support sweep checks no workflow label, Help/Guide assertion, or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin note workflow labels, image-intake instructions, clipboard recovery behavior, Help/Guide assertions, runbook guidance, support procedures, and operator instructions. Help/Guide or runbook updates are required if implementation changes action meaning, recovery behavior, auth, upload behavior, labels, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `AdminNoteClipboardPasteButton`
  - `Paste image from clipboard`
  - `Upload images`
  - `Upload image`
  - `clipboard`
  - `Clipboard access was blocked`
  - `This browser cannot read clipboard images`
  - `Image evidence`
  - `Images`
- Surfaces to check:
  - `components/admin/AdminNoteClipboardPasteButton.tsx`
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminContextNotesPanel.tsx`
  - `components/admin/AdminNoteQuickCaptureLauncher.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `tests/unit/admin-note-clipboard-paste-button.test.tsx`
  - `tests/unit/admin-context-notes-panel.test.tsx`
  - `tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `docs/runbooks/admin-notes-recovery.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - Shared clipboard button fallback aligns with current AW-006 admin token/action direction.
  - Focused unit coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates.
  - Canonical AW-006 queue and design inventory updates.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminNoteClipboardPasteButton.tsx` fallback class with current AW-006 admin secondary action token direction and shared mobile action item width behavior.
- Preserve caller-provided `className` composition for compact/action-specific surfaces.
- Update existing admin note image-intake call sites only where needed to remove duplicated/conflicting local fallback styling and apply shared mobile action group widths to Paste/Upload pairs.
- Preserve existing button label, loading label, disabled behavior, callback behavior, error handling, and `buttonTestId`.
- Add/update focused unit tests for fallback token classes and preserved clipboard success/failure behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Admin note API changes, attachment upload behavior, clipboard parsing behavior, attachment limits, storage, authz, RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, Help/Guide copy, support procedures, analytics taxonomy, packages, workflows, public visual redesign, Habits/Micro Sessions product backlog, PR merge, or broad admin redesign.
- Admin Note Screenshot Capture behavior or styling unless directly needed as screenshot reference.
- New iconography, new button variants, new shared Button primitive, destructive action changes, or workflow label changes.

## Acceptance Criteria

1. `AdminNoteClipboardPasteButton` fallback uses current AW-006 admin secondary action token direction and shared mobile action item width behavior while preserving label, loading, disabled, focus, success, and error behavior.
2. Existing Notes, Context Notes, and Quick Capture image-intake surfaces keep the same paste/upload click paths, staged-image behavior, saved-note upload handoff, attachment limits, and recovery copy.
3. Button remains keyboard reachable and semantically clear with stable accessible names and disabled state.
4. Future admin note image-intake usages that omit `className` inherit the same token-native secondary action fallback automatically.
5. Screenshot handoff includes `after/reference` artifacts for representative admin note image-intake states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-note-clipboard-paste-button.test.tsx tests/unit/admin-context-notes-panel.test.tsx tests/unit/admin-note-quick-capture-launcher.test.tsx`
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

In progress. Owner approved screenshot handoff after the mobile action width correction. Continue through PR creation, required CI checks, and `npm run verify:pre-merge`; do not merge without explicit owner approval.

## Checkpoint Log

- `2026-06-09 | in-progress | owner requested execution from clean synced main@59774930 after PR #1035 and repo-managed closeout PR #1036; branch aw-006-admin-note-clipboard-button-parity created; scope is limited to shared AdminNoteClipboardPasteButton token fallback parity with clipboard/upload/help/support/API/auth behavior preserved | next: implement component/test/docs updates, run targeted validation, capture after/reference screenshot handoff, and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-09 | in-progress | first screenshot review exposed unequal mobile action widths in image-intake Paste/Upload pairs; scope remains the same shared admin note image-intake workflow, now explicitly applying the existing mobile action layout contract with full-width stacked mobile actions and auto-width desktop actions | next: rerun targeted tests/lints, regenerate after/reference screenshots, and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-09 | screenshot-review | targeted validation passed after width fix: ./node_modules/.bin/vitest run tests/unit/admin-note-clipboard-paste-button.test.tsx tests/unit/admin-context-notes-panel.test.tsx tests/unit/admin-note-quick-capture-launcher.test.tsx, npm run lint:briefs:all, route/label/support rg sweep, stale local-style rg sweep with no matches, and git diff --check; regenerated after/reference artifacts at output/admin-note-clipboard-button-parity-2026-06-09-084213 using a temporary local screenshot fixture that was removed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, push, PR, CI, and npm run verify:pre-merge`
- `2026-06-09 | screenshot-approved | owner approved the screenshot handoff after the mobile action width correction; no scoped product-rendering files changed after final capture, only this checkpoint note | next: run npm run verify:pre-pr`
- `2026-06-09 | pre-pr-green | npm run verify:pre-pr passed full lane on branch aw-006-admin-note-clipboard-button-parity: branch-current, quality gates, lint, typecheck, unit tests, build, perf budgets, and Playwright e2e; local dev-login-dependent e2e cases were skipped by existing environment guards while open/security coverage passed | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-09 | visual-evidence-refreshed | after commit/lint-staged formatting, regenerated after/reference screenshot artifacts at output/admin-note-clipboard-button-parity-2026-06-09-085353 and recorded DOM class evidence for the shared mobile action width/token classes; no scoped product-rendering files changed after this capture, only temporary screenshot fixture cleanup and this docs checkpoint | next: amend checkpoint into the implementation commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
