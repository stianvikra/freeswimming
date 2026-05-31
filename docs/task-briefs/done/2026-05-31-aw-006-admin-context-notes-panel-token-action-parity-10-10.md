# Task Brief: AW-006 Admin Context Notes Panel Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-context-notes-panel-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@b4b3d83`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice.
- `reason`: `main` is clean and synced after Admin Messages Manager Token/Action Parity PR `#912` and repo-managed closeout PR `#913`; `npm run post-merge:preflight` passed with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminContextNotesPanel` as the clearest remaining admin surface with state parity already done but panel, field, row, attachment, and visible action styling still using older local blue/slate/rose classes instead of the current admin token/action direction.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContextNotesPanel`, admin notes API/authz/upload behavior, admin context-note category/priority contracts, `AdminManagerState`, admin token/action references, Help/Guide impact rules, screenshot handoff rules, forward compatibility rules, or verification lanes change before PR handoff.

## Goal

Align the contextual admin notes panel with the current AW-006 admin token/action hierarchy while preserving note data, context filtering, upload/retry/delete behavior, authz, labels, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

Jeg skal gjøre contextual admin notes-panelet visuelt og handlingsmessig likt de nyere admin-panelene, slik at operatørflater ikke føles som flere ulike systemer. Det betyr tryggere og mer forutsigbar bruk. Utenfor scope er note-data, API-er, opplasting/sletting, autorisasjon, Quick Capture-dialogen og bred redesign.

Fremoverkompatibilitet: framtidige note-prioriteter, kategorier og kontekster skal fortsatt komme fra eksisterende data og typed contracts; denne slicen skal ikke hardkode dagens innhold i UI-stylingen.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `Stack-fit and dependency discipline`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                  | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The active AW-006 queue and design inventory must identify this contextual admin notes token/action parity slice without stale active references.                                   | queue/inventory diff + active brief                    | `5/5`                   |
| UX flow clarity                               | `target`     | Context note expand/collapse, create, edit, upload, open, done, delete, retry, and read-only actions remain visible and predictable with no dead-end states.                        | focused unit tests + screenshot handoff                | `5/5`                   |
| Visual design quality                         | `target`     | Changed contextual notes shell, rows, forms, attachments, and visible actions use current admin card/action/token classes and preserve responsive wrapping.                         | code diff + screenshot handoff                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Note create/update/delete, done toggles, image upload/delete, related-note links, context filters, and form payloads must be behaviorally unchanged.                                | focused unit tests + changed-files review              | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Editors can still create, scan, edit, mark done, attach evidence, open queue links, and delete notes with the same or fewer visual ambiguities.                                     | focused unit tests + screenshot handoff                | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Existing labels, aria-live states, keyboard-operable buttons/links, visible focus styles, and semantic lists/forms remain intact.                                                   | focused unit tests + screenshot handoff + code review  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this slice changes classes/markup locally and must add no dependencies or large client behavior.                                                                   | dependency diff + targeted tests                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical admin notes/attachments remain unchanged; local component state remains transient UI/edit/upload state only.                                                       | active brief data contract + changed-files review      | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no fetch cache mode, revalidation, invalidation trigger, API route, or persisted read path.                                                          | changed-files review                                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing loading, warning, error, retry, action-error, action-success, empty, upload-recovery, and read-only handling stays deterministic.                                          | focused unit tests + changed-files review              | `5/5`                   |
| Security and authz                            | `target`     | Role-gated mutation behavior remains fail-closed: viewer/read-only users cannot get create/edit/delete controls from this panel change.                                             | focused unit/read-only coverage + changed-files review | `5/5`                   |
| Privacy and compliance                        | `target`     | Admin-only note text, images, signed URLs, and operator-only context remain on existing admin surfaces with no new public exposure or logging.                                      | changed-files review + no API/logging diff             | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, notice/state inventory, and active brief must describe this slice and protected areas accurately.                                                           | docs diff + brief lint                                 | `5/5`                   |
| Admin workflow and editability                | `target`     | Existing contextual note workflow labels and queue jump links remain intact; only visual/action styling changes.                                                                    | focused unit tests + route/label/support sweep         | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this admin-only authenticated component changes no public route, metadata, sitemap, robots, canonical URL, or crawl-safe content.                                       | explicit scope review                                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this admin-only component changes no public semantic entity surface, structured data, or AI-facing content.                                                             | explicit scope review                                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics taxonomy, event payload, dashboard, KPI persistence, or instrumentation.                                                                | changed-files review                                   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, billing portal, invoice, refund, or revenue-relevant flow.                                                        | explicit scope review                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with rationale: this slice changes no incident path, support runbook, recovery procedure, alerting, or operator support workflow labels; contextual note behavior is preserved. | explicit support-surface review                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with rationale: this slice changes no finance data, revenue reports, invoices, payouts, refunds, reconciliation, Stripe behavior, or entitlement reporting.                     | explicit finance scope review                          | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: existing English operator labels are preserved; responsive token/action classes must not introduce layout assumptions that block later translation.                | screenshot handoff + changed-files review              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React client component, admin token classes, `AdminManagerState`, local helpers, and no new dependencies or broad shared primitive refactor.                           | code diff + dependency diff                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Update/add focused tests for token/action classes and preserved behavior; run targeted unit tests, brief lint, lint/typecheck as practical before screenshot handoff.               | commands + logs                                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: style consolidation should reduce future admin UI maintenance cost without changing runtime data volume or storage.                                                | code diff                                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Visual-only/admin-component diff can be reverted normally; UI screenshot approval must happen before pre-PR/PR/merge gates.                                                         | git diff + screenshot handoff + gate order             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse the existing client component `AdminContextNotesPanel`; do not change route boundaries, server/client ownership, API routes, or cache behavior.
  - Reference surfaces: `AdminMessagesManager`, `AdminCategoriesManager`, `AdminEmailTemplatesManager`, and `AdminWorkspace` token/action classes.
- TypeScript/domain contracts:
  - Preserve `AdminNoteItem`, `AdminNotePriority`, `AdminNoteContextType`, category loading, attachment contracts, and existing error/fallback handling.
  - No new validation layer or domain invariant is introduced.
- Supabase/data layer:
  - N/A; no migrations, RLS policies, storage bucket behavior, generated types, indexes, or server data contracts change.
- External services/tools:
  - N/A; no Stripe, email provider, analytics vendor, SDK, webhook, secret, or deployment setting changes.
- UI system:
  - Use current AW-006 card/action/token classes (`fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, `fs-cta-primary`, `fs-cta-secondary`, token radius/border variables) where they fit.
  - Keep colored status/destructive treatments only where they communicate actual note state or risk.
  - Screenshot handoff type: `after/reference`, comparing changed Context Notes to mature admin manager/reference surfaces.
- Testing:
  - Update focused unit coverage for token/action classes and preserved editor/read-only behavior.
  - Capture representative desktop and mobile screenshots before broad PR gates.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin notes, categories, related notes, and attachments remain server-canonical through existing admin APIs and storage behavior.
- Local data:
  - Component state remains transient UI state only: expanded/collapsed state, draft form values, edit form values, staged image previews, pending upload/delete IDs, action messages, and loading/error states.
- Sync policy:
  - Existing explicit create/update/delete/upload/delete-attachment calls remain unchanged; successful responses continue to update local lists from returned server payloads.
  - Existing retry behavior for load/upload recovery is preserved.
- Retention and sensitivity:
  - No retention, deletion, signed URL, or admin-only visibility rule changes.
- Cache/invalidation:
  - No route cache or revalidation behavior changes.

## Identity And Rename Contract

- Canonical stable ID:
  - `AdminNoteItem.id`, attachment IDs, and related-note IDs remain the stable identifiers for operations and queue links.
- Human-readable identifiers:
  - Note titles, categories, priorities, dates, file names, and context labels remain display/edit values only and do not become routing-critical in this slice.
- Mutability rules:
  - Existing note title/category/date/priority/body/done mutability is preserved.
- Rename vs repurpose policy:
  - No rename/repurpose behavior changes; materially different note behavior remains outside scope.
- Compatibility contract:
  - Existing admin queue jump links and context filters continue to use current helpers.
- Observability and repair:
  - No new logging or repair workflow; existing API/support behavior remains the diagnostic source.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin note categories, priorities, context types, attachment metadata, related notes, role labels, and contextual admin surfaces.
- Source of truth:
  - Categories continue to load from `/api/admin/categories/notes`.
  - Priorities and context types continue to use existing typed contracts.
  - Note/attachment rendering continues to derive from `AdminNoteItem` data.
- Additive behavior:
  - New categories should render automatically through existing datalist/data flow.
  - New note rows, related notes, attachments, and contexts should inherit the same token/action styling as long as they use the existing component contract.
- Explicit mapping requirements:
  - New priority values, new mutation actions, new role semantics, or new context types with different support meaning require explicit code/copy/test/doc review before release.
- Unknown or deprecated values:
  - Existing typed/format helpers remain the boundary; this slice must not add unsafe string parsing or hardcoded today's-only values.
- Test/evidence:
  - Focused unit coverage for class/token expectations plus route/label/support sweep proves the active slice is styling the existing data contract rather than replacing it.

## Help / Guide Impact

N/A with rationale: this slice changes visual/action styling only and preserves existing admin note workflow labels, recovery behavior, support procedures, and Help/Guide assertions. If implementation discovers label/workflow copy must change, Help/Guide impact must be re-audited before PR handoff.

## Route / Label / Support Surface Sweep

Required because this slice touches an admin workflow surface and visible actions.

- Terms:
  - `AdminContextNotesPanel`
  - `Admin Context Notes`
  - `Admin notes`
  - `Quick note`
  - `Open in Notes`
  - `Upload images`
  - `Delete image`
  - `Mark as done`
  - `AW-006`
- Surfaces:
  - `components/admin/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/design/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/runbooks/`
- Expected fallout:
  - queue/inventory active slice updates only,
  - no Help/Guide or runbook copy update unless labels/workflows change.

## Scope

- Create and maintain this active brief.
- Update `components/admin/AdminContextNotesPanel.tsx` for contextual panel, create/edit forms, note rows, attachment displays, and visible actions.
- Update focused unit coverage in `tests/unit/admin-context-notes-panel.test.tsx`.
- Update canonical AW-006 queue and notice/state inventory.
- Run targeted tests/lint and capture screenshot handoff before broad PR gates.

## Out Of Scope

- Admin notes API, authz, storage, attachment upload/delete behavior, signed URL handling, categories API, related-note linking logic, or data contracts.
- `AdminNoteQuickCaptureLauncher` modal internals.
- `AdminNoteScreenshotCaptureButton` modal.
- Broad app-wide Button/Card/Field primitive refactor.
- Help/Guide/runbook text unless labels or recovery behavior change.
- Supabase, Stripe, auth, analytics, performance budgets, route metadata, or public UI changes.

## Acceptance Criteria

1. Canonical AW-006 queue and notice/state inventory identify this slice as active with no stale active references.
2. `AdminContextNotesPanel` uses current admin token/card/action classes for the shell, create/edit panels, note rows, attachment rows, and visible actions where applicable.
3. Existing note create/edit/done/delete/upload/delete-attachment/read-only behavior is preserved.
4. Focused unit tests cover token/action class expectations and preserved contextual note behavior.
5. Screenshot handoff includes representative `after/reference` artifacts and stops for owner approval before `npm run verify:pre-pr`.

## Validation Plan

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/admin-context-notes-panel.test.tsx`
- `npm run lint`
- `npm run typecheck`
- targeted route/label/support sweep
- `git diff --check`
- screenshot handoff before `npm run verify:pre-pr`

## Checkpoint Log

- `2026-05-31 | in-progress | started from clean main@b4b3d83 after PR #912 and closeout #913; post-merge preflight passed with no closeout remaining; owner approved and executed Admin Context Notes Panel Token/Action Parity | next: implement contextual admin notes token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff`
- `2026-05-31 | in-progress | implemented component-local contextual notes token/action styling, focused unit coverage, queue update, and design inventory update; local evidence passed: vitest admin-context-notes-panel, lint:briefs:all, lint with one pre-existing output warning, typecheck, git diff --check, and targeted route/label/support sweep | next: capture screenshot handoff and wait for owner visual approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot-review | captured required after/reference screenshots at output/aw-006-admin-context-notes-token-parity-2026-05-31-080323 at 2026-05-31 08:09 using a temporary local route with mocked contextual notes/categories/messages responses; temporary product route was removed after capture, no scoped product-rendering file changed after the final capture, and post-capture typecheck/diff-check plus eslint for the capture script passed | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, CI, or npm run verify:pre-merge`
- `2026-05-31 | screenshot-approved | owner approved the after/reference screenshot handoff; no product-rendering file changed after final screenshot capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge recommendation`
- `2026-05-31 | pre-pr-ready | npm run verify:pre-pr first run exposed a session-generator unit-test order flake; the isolated test passed, and the permitted rerun passed full lane at artifacts/test-runs/20260531-081448/verify.log with lint, typecheck, 1298 unit tests, build, performance budgets, and Playwright 102 passed / 492 skipped; performance trend recommendation was hold because worst margin was 13.8% below the 15.0% tighten threshold | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge recommendation`
- `2026-05-31 | final-screenshot-refresh | pre-commit formatting touched the UI component after the first screenshot capture, so final after/reference screenshot evidence was regenerated at output/aw-006-admin-context-notes-token-parity-2026-05-31-082217 at 2026-05-31 08:40 using the same temporary local route and mocked API responses; temporary product route was removed again, and no product-rendering file changed after this final capture | next: rerun npm run verify:pre-pr on the amended final commit before push`
- `2026-05-31 | pre-pr-passed | npm run verify:pre-pr passed full lane on the final code commit at artifacts/test-runs/20260531-084153/verify.log with branch-current, lint:briefs, quality gate, lint, typecheck, 1298 unit tests, build, performance budgets, and Playwright 102 passed / 492 skipped; performance trend recommendation remained hold because worst margin was 13.8% below the 15.0% tighten threshold | next: amend this evidence-only brief checkpoint, push, open PR, monitor CI, and run npm run verify:pre-merge before merge recommendation`

## Completion Record

- `completed`: `2026-05-31`
- `merged_pr`: `#914`
- `squash_commit`: `34c7afd`
- `result`: Closed AW-006 Admin Context Notes Panel Token/Action Parity by aligning the contextual admin notes shell, forms, rows, attachments, and visible actions with the current admin token/action hierarchy while preserving note data, context filters, upload/retry/delete behavior, authz, labels, Help/Guide, and support behavior.
- `validation`: `./node_modules/.bin/vitest run tests/unit/admin-context-notes-panel.test.tsx` passed; `npm run lint:briefs:all` passed; `npm run lint` passed with one pre-existing output warning; `npm run typecheck` passed; `git diff --check` passed; targeted route/label/support sweep completed; screenshot handoff approved; `npm run verify:pre-pr` passed full lane at `artifacts/test-runs/20260531-084854/verify.log`; PR #914 CI passed; `npm run verify:pre-merge` passed at `artifacts/verify-pre-merge/20260531-070304.json`.
- `screenshot_artifacts`: `output/aw-006-admin-context-notes-token-parity-2026-05-31-082217` captured `2026-05-31 08:40`, owner approved, and no product-rendering files changed after final capture.
- `10/10 claim`: yes - all critical target categories reached `5/5` within this slice.

Critical target categories confirmed `5/5`: UX flow clarity, Visual design quality, Business logic correctness and data integrity, Admin editor ergonomics, Reliability and failure handling, Security and authz, Testing and QA automation, Stack-fit and dependency discipline.

| Category                                      | Achieved Score | Evidence                                                                                                                                        | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | AW-006 queue/inventory diff, active brief, PR #914 merge, closeout queue update.                                                                | None.        |
| UX flow clarity                               | `5/5`          | Focused contextual notes tests, screenshot handoff, PR #914 CI, `npm run verify:pre-pr`.                                                        | None.        |
| Visual design quality                         | `5/5`          | Final after/reference screenshots at `output/aw-006-admin-context-notes-token-parity-2026-05-31-082217`, owner approval, code diff.             | None.        |
| Business logic correctness and data integrity | `5/5`          | Focused unit coverage, unchanged API/data contracts, `npm run verify:pre-pr`, PR #914 CI.                                                       | None.        |
| Admin editor ergonomics                       | `5/5`          | Screenshot handoff, token/action coverage, preserved create/edit/done/upload/open/delete actions.                                               | None.        |
| Accessibility (a11y)                          | `5/5`          | Existing semantic labels/forms preserved, focused tests, screenshot review, `npm run verify:pre-pr`.                                            | None.        |
| Data placement and sync boundaries            | `5/5`          | Brief data contract, changed-files review, no API/storage/cache diff.                                                                           | None.        |
| Reliability and failure handling              | `5/5`          | Focused tests and changed-files review for preserved loading, warning, error, retry, action, upload-recovery, and read-only handling.           | None.        |
| Security and authz                            | `5/5`          | Viewer/read-only unit coverage, no authz/API diff, PR #914 CI.                                                                                  | None.        |
| Privacy and compliance                        | `5/5`          | No public exposure, logging, retention, signed URL, storage, or policy-impact diff; PR body policy impact N/A.                                  | None.        |
| Content governance                            | `5/5`          | Brief lint, AW-006 queue update, design inventory update, completion record.                                                                    | None.        |
| Admin workflow and editability                | `5/5`          | Route/label/support sweep, focused tests, unchanged workflow labels and Help/Guide impact N/A.                                                  | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing `AdminContextNotesPanel`, local admin token/action classes, no new dependencies or broad primitive refactor.                    | None.        |
| Testing and QA automation                     | `5/5`          | Focused unit tests, lint/typecheck, `npm run verify:pre-pr`, PR #914 CI, `npm run verify:pre-merge`.                                            | None.        |
| DevOps and rollback readiness                 | `5/5`          | PR #914 clean merge, rollback by reverting `34c7afd`, pre-merge marker `artifacts/verify-pre-merge/20260531-070304.json`, post-merge preflight. | None.        |
