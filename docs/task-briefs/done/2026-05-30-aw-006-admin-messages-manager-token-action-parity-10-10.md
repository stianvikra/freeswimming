# Task Brief: AW-006 Admin Messages Manager Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-30-aw-006-admin-messages-manager-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-30`
- `updated`: `2026-05-30`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner explicitly requested execute`
- `branch`: `aw-006-admin-messages-manager-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-30`
- `base`: `main@d0a491d`
- `audit_status`: `ready`
- `decision`: Execute this as the active AW-006 UI slice.
- `reason`: `main` is clean and synced after PR `#910` and repo-managed closeout PR `#911`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice, confirmed admin management panels are now closed through Email Templates, identified `AdminMessagesManager` as the next small admin presentation gap, and the owner explicitly requested execution on `2026-05-30`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminMessagesManager.tsx`, `AdminManagerState`, admin message API/status/source/action contracts, One.com inbox shortcut behavior, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the Admin Messages manager shell, filters, stored-request list, selected-message detail panel, diagnostics panels, delivery-attempt panels, and visible workflow actions with the current AW-006 `fs-library-card` and action-token direction without changing message data, status transitions, filters, API behavior, One.com inbox behavior, Help/Guide content, email delivery, or support procedures.

## Pre-Implementation Owner Explanation

Vi gjor Messages-panelet i admin visuelt likt de nye admin-flatene, slik at innkommende meldinger, filter, detaljvisning og handlinger blir enklere aa skanne. Det betyr mindre visuell restgjeld etter de siste admin-slicene. Utenfor scope er meldingsdata, API-er, statusregler, One.com-lenke, Help/Guide-innhold, e-postlevering og supportprosedyrer.

Fremoverkompatibilitet: nye meldingsrader, kilder, diagnostikk og leveringsforsoek boer automatisk arve samme layout; nye statusverdier eller workflow-handlinger krever eksplisitt mapping og Help/Guide-vurdering.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                         | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminMessagesManager` presentation and keep the AW-006 queue/design inventory accurate after #910/#911.                                                                        | planned/active brief + queue/inventory diff + changed-files review | `5/5`                   |
| UX flow clarity                               | `target`     | Message search, source/status filtering, refresh, stored-request selection, One.com inbox shortcut, workflow actions, confirmation, load older, and no-selection states are easier to scan with same flow. | screenshot handoff + component tests + diff review                 | `5/5`                   |
| Visual design quality                         | `target`     | The manager reuses current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and quiet/destructive action direction without broad redesign.      | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Message GET/PATCH payloads, filters, pagination cursor, selected-message update/removal behavior, restore/delete confirmation, and diagnostics rendering remain unchanged.                                 | targeted unit tests + diff review                                  | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still refresh, search, filter, inspect, open inbox, mark read/unread, needs reply, replied, archive, delete, restore, and load older with no added workflow step.                               | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, links, labels, search, select, status filters, selected-row state, action disabled states, confirmation, loading/error/empty states, and live regions remain keyboard and screen-reader clear.    | Testing Library assertions + screenshot/manual review              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, or material payload increase.                                                                                     | package diff + pre-pr gate                                         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin messages remain server-canonical; search/filter/selection/confirmation are component-local UI state; no browser storage, sync, retention, or conflict policy changes.                                | data/sync contract + diff review                                   | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing `cache: "no-store"` admin message fetch/update behavior remains unchanged; manual refresh and load-older behavior remain the invalidation/reload controls.                                        | fetch call assertions + diff review                                | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing loading, schema warning, load error+retry, action-error, action-notice, empty/no-results, no-selection, pagination loading, and delete-confirmation behavior remains deterministic.               | targeted state tests + diff review                                 | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, same-origin credentials, role-gated mutation visibility, message PII display boundaries, and secret handling remain untouched.                                    | unchanged auth/API diff review + existing security coverage        | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting because admin messages can contain personal intake data; the slice must not expose additional fields, logs, analytics, raw provider errors, or storage paths.                                   | PII field diff review + tests                                      | `4/5`                   |
| Content governance                            | `target`     | Existing message workflow labels, Help/Guide behavior, support procedures, admin-message runbook references, and AW-006 docs source of truth are preserved or updated for this slice only.                 | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Message workflow status edits remain available through the same controls and API calls; this PR changes shell/card/action presentation only.                                                               | targeted tests + changed-files review                              | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                               | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                        | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                    | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                       | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior; existing admin-message support references are preserved.     | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                   | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because message source/status labels may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                             | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API boundaries unchanged, and add no dependency or new global primitive.                                                     | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for Messages manager token/action classes, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.              | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`         | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven message rows, diagnostic entries, and delivery-attempt entries should inherit the same treatment without extra services, infrastructure, or recurring cost.                 | row/detail rendering diff review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                  | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, Commerce/Operations manager parity from PR `#904`, QR Registry manager parity from PR `#906`, Categories manager parity from PR `#908`, Email Templates manager parity from PR `#910`, and `AdminManagerState`.
  - `AdminMessagesManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/messages` and `/api/admin/messages/[id]`.
  - Cache/revalidation behavior remains unchanged; existing `cache: "no-store"` fetches are preserved.
- TypeScript/domain contracts:
  - Preserve `AdminMessageItem`, status/source filter types, message response unions, delivery diagnostics, selected-message fallback behavior, and existing safe fallback/error strings.
  - Deterministic invariant: every returned message row renders one selectable request row with the same source identifiers, workflow status, delivery diagnostics, detail fields, and permitted actions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - Preserve One.com inbox URL behavior and email delivery/provider diagnostic rendering.
  - No provider SDK, webhook, secret, retry, observability, or outbound delivery behavior changes.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and manager-local quiet/destructive action classes aligned to the same radius/focus/token direction.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Messages states inside `/admin` to the current tokenized `/admin` shell and nearby admin manager surfaces.
- Testing:
  - Add or update focused unit tests for Messages manager token/action classes plus existing state and mutation behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Admin message rows, workflow status, source labels, request diagnostics, notification status, delivery attempts, timestamps, and mutation outcomes remain owned by the existing admin message API/storage layer.
- Local data:
  - Search draft, deferred query, source/status filters, selected message ID, pending confirmation, pagination loading, action notice/error, and updating IDs remain component-local UI state.
  - No browser storage, persistence key, local draft, or cross-device sync behavior is introduced.
- Sync policy:
  - Manual refresh and load-older still fetch from `/api/admin/messages`.
  - Successful PATCH responses still update or remove the current row according to the active filters.
  - Failures remain visible through existing error/notice states; no optimistic persistence or conflict policy changes.
- Retention and sensitivity:
  - Message retention, soft-delete/restore semantics, PII boundaries, redacted provider errors, and support diagnostics remain unchanged.
- Cache/invalidation:
  - Existing `cache: "no-store"` fetch/update calls remain the freshness boundary.

## Identity And Rename Contract

This slice does not change identity behavior. Message `id` remains the canonical stable identifier for selection, update, restore/delete, and list reconciliation. Human-readable fields such as submitter name, email, source label, status label, notification label, and diagnostic labels remain display values from existing API rows. Workflow statuses remain intentionally mutable through the existing message actions; a materially different intake request must remain a separate message row rather than repurposing an existing row.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Message rows, message source labels, status filters, workflow actions, notification statuses, request diagnostics, delivery attempts, pagination, selected-message panels, and admin role behavior.
- Source of truth:
  - Messages come from `/api/admin/messages`.
  - Message mutations go through `/api/admin/messages/${messageId}`.
  - Status/source labels and action availability come from existing admin message domain helpers and component logic.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New message rows returned by the existing API should render through the same list/detail treatment without code changes.
  - New diagnostic and delivery-attempt entries returned by the existing API should render through the same detail-panel treatment without code changes.
  - Existing loading, schema warning, error, empty, no-selection, action notice, and action error states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New message sources, status buckets, workflow actions, role capabilities, notification statuses, support runbook flows, or Help/Guide instructions require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown API failures remain handled by current error states.
  - Unknown typed status/action/source values must fail type review or receive an explicit fallback label/class mapping before release.
- Test/evidence:
  - Focused unit tests verify shell/list/detail/action/filter class parity and unchanged fetch, filter, mutation, confirm delete, restore, inbox link, retry, and pagination behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing Messages workflow labels, recovery action labels, Help/Guide assertions, admin-message inbox runbook references, support procedures, and operator instructions. Help/Guide or runbook updates are required if implementation changes action meaning, recovery behavior, auth, status behavior, inbox procedure, email delivery behavior, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Messages`
  - `Stored requests`
  - `Open hello inbox`
  - `Search messages`
  - `Source`
  - `All sources`
  - `Needs reply`
  - `Mark replied`
  - `Move to deleted`
  - `Confirm delete`
  - `Load older`
  - `AdminMessagesManager`
- Surfaces to check:
  - `components/admin/AdminMessagesManager.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-message-inbox.md`
  - `tests/unit/admin-messages-manager.test.tsx`
  - `tests/unit/admin-messages.test.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Messages card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates after execution begins.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminMessagesManager.tsx` shell, refresh/inbox actions, search/source/status filters, stored-request list, selected-message detail panel, message body panel, structured intake cards, request diagnostics, delivery attempts, workflow action group, delete confirmation, load-older action, and state wrappers with current AW-006 token/action direction.
- Preserve message fetch/update behavior, filters, pagination, selected-message behavior, role-gated mutation visibility, One.com inbox link, status transition actions, delete confirmation, restore behavior, diagnostics rendering, and all API/auth behavior.
- Add or update focused tests for Messages token/action classes and preserved behavior.
- Update this brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Admin message API changes, status/source/action semantics, delivery provider behavior, outbound email behavior, One.com URL behavior, reply workflow, admin authz, RLS, migrations, generated DB types, cookies, credentials, secrets, environment variables, or storage retention.
- Admin workspace shell, admin content, Commerce, Operations, QR Registry, Email Templates, Notes, Categories, Help Center, or other manager internals beyond the scoped Messages manager.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. Messages manager shell, filters, stored-request list, selected-message detail, diagnostics, delivery attempts, delete confirmation, load-older action, and workflow actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. Message row data, GET/PATCH payloads, filters, status transitions, role-gated actions, selection behavior, pagination, confirmation, restore/delete behavior, and One.com inbox link remain unchanged.
3. Buttons, links, search, selects, status filters, selected row, badges, disabled states, loading/error/empty/no-selection states, and live regions remain keyboard reachable and semantically clear.
4. Future message rows, source labels, diagnostic rows, and delivery attempts returned by existing APIs inherit the same list/detail treatment without hardcoded today-only values.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-messages-manager.test.tsx tests/unit/admin-messages.test.ts`
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

Done via PR `#912` after owner explicitly approved merge when tests were good and cleanup was complete.

## Checkpoint Log

- `2026-05-30 | planned | created from clean main@d0a491d after PR #910 and repo-managed closeout #911; post-merge preflight passed with no closeout remaining; owner approved AW-006 Admin Messages Manager Token/Action Parity as the next planned slice after fresh queue/design/code re-audit | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress and changing product code`
- `2026-05-30 | in-progress | owner explicitly said execute; moved brief to in-progress on branch aw-006-admin-messages-manager-token-parity with planned queue/design updates carried over | next: implement scoped Messages manager token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-30 | targeted-qa | latest commit d0a491d; AdminMessagesManager shell, filters, list, selected detail, panels, and visible actions now use scoped AW-006 token/action classes; added focused DOM coverage and preserved message behavior; targeted Vitest passed for admin messages manager/domain tests | next: run brief lint, route/label/support sweep, diff check, then capture screenshot handoff before stopping for owner visual approval`
- `2026-05-30 | screenshot-handoff-ready | latest commit d0a491d; targeted Vitest, targeted ESLint, lint:briefs:all, route/label/support sweep, and git diff --check passed; captured after/reference screenshots in output/aw-006-admin-messages-token-parity-2026-05-30-125949 at 2026-05-30 12:59 with a temporary local visual route and mocked admin message/email template responses; temporary visual route/script were removed afterward, and no scoped product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, push, PR creation, CI, and pre-merge gates`
- `2026-05-30 | screenshot-approved | owner approved screenshot handoff; owner also approved merge after tests are good and cleanup; no scoped product-rendering files changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge and clean up when gates are green`
- `2026-05-30 | pre-pr-ready | latest commit d0a491d; npm run verify:pre-pr passed full lane from artifacts/test-runs/20260530-130701 after screenshot approval, including branch-current, quality/admin/env/pr-body lint, ESLint, typecheck, unit tests, build, performance budgets, and Playwright e2e | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge and clean up when gates are green`
- `2026-05-30 | merged | PR #912 shipped as squash commit abf82eb after npm run verify:pre-pr passed full lane from artifacts/test-runs/20260530-132023, required CI passed, and npm run verify:pre-merge recorded PASS at artifacts/verify-pre-merge/20260530-113407.json | next: repo-managed docs-only closeout moves this brief to done and clears active queue/inventory references`

## Completion Record

- `completed`: `2026-05-30`
- `merged_pr`: `#912`
- `squash_commit`: `abf82eb`
- `result`: Closed AW-006 Admin Messages Manager Token/Action Parity. The admin Messages manager now visually matches the newer admin management surfaces for shell, filters, stored requests, detail panels, diagnostics, delivery attempts, and visible actions while preserving message data, API behavior, status transitions, One.com inbox behavior, Help/Guide, email delivery, and support procedures.
- `validation`: targeted Vitest and ESLint during implementation; `npm run lint:briefs:all`; route/label/support sweep; `git diff --check`; owner-approved after/reference screenshot handoff at `output/aw-006-admin-messages-token-parity-2026-05-30-125949`; `npm run verify:pre-pr` full lane PASS at `artifacts/test-runs/20260530-132023`; PR #912 CI PASS including CodeQL, Vercel, deploy-preview, e2e-smoke, site-lock-smoke, size-check, and verify; `npm run verify:pre-merge` PASS marker at `artifacts/verify-pre-merge/20260530-113407.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; supporting categories remained at their scoped `4/5` targets because this slice intentionally avoided broader analytics, commerce, i18n, privacy, performance, or scalability changes.

| Category                                      | Achieved Score | Evidence                                                                                                                        | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #912 scope, queue closeout, design inventory closeout, and no active AW-006 slice left selected after closeout.              | None.        |
| UX flow clarity                               | `5/5`          | Owner-approved screenshot handoff and component tests covering filters, list, detail, actions, delete confirmation, and states. | None.        |
| Visual design quality                         | `5/5`          | `fs-*` token/action parity implementation plus after/reference screenshots against current admin reference surfaces.            | None.        |
| Business logic correctness and data integrity | `5/5`          | Focused unit tests and diff review preserved GET/PATCH payloads, filters, pagination, restore/delete, and diagnostics.          | None.        |
| Admin editor ergonomics                       | `5/5`          | Existing refresh, search, filter, inspect, inbox, status, archive, delete, restore, and load-older workflows were preserved.    | None.        |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions, preserved labels/roles/live regions, and screenshot review for desktop/mobile states.               | None.        |
| Data placement and sync boundaries            | `5/5`          | No server/local data boundary changes; admin messages remain server-canonical with component-local UI state.                    | None.        |
| Caching and invalidation strategy             | `5/5`          | Existing `cache: "no-store"`, manual refresh, and load-older behavior were unchanged.                                           | None.        |
| Reliability and failure handling              | `5/5`          | Loading, schema warning, retry, action feedback, empty/no-results, no-selection, pagination, and confirmation paths preserved.  | None.        |
| Security and authz                            | `5/5`          | Admin route/API/authz boundaries, credentials, role-gated mutation visibility, and PII display boundaries were untouched.       | None.        |
| Content governance                            | `5/5`          | Workflow labels, Help/Guide behavior, runbook references, and support procedures were preserved; closeout clears docs fallout.  | None.        |
| Admin workflow and editability                | `5/5`          | Same workflow status edits and API calls remain available through the same controls.                                            | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing admin-local state helper and global `fs-*` tokens; no dependency or broad primitive added.                      | None.        |
| Testing and QA automation                     | `5/5`          | Targeted tests, full local pre-PR, required CI, and local pre-merge all passed.                                                 | None.        |
| DevOps and rollback readiness                 | `5/5`          | Normal squash commit/revert path; no migrations, config, package, workflow, or deployment-setting changes.                      | None.        |
