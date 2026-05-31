# Task Brief: AW-006 Admin Context QR Panel Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-admin-context-qr-panel-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-context-qr-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@d70735c`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice.
- `reason`: `main` is clean and synced after Admin Quick Capture Token/Action Parity PR `#924` and repo-managed closeout PR `#925`; `npm run post-merge:preflight` passed with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminContextQrPanel` as the clearest remaining admin surface with state parity already done but panel, row, form, field, and visible action styling still using older local `rounded-lg`/`slate`/`blue` classes instead of the current admin token/action direction used by full QR Registry, Context Notes, Quick Capture, and Notes Manager.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContextQrPanel`, `AdminQrLinksManager`, QR API/authz contracts, QR slug/status/redirect behavior, admin content edit context, `AdminManagerState`, admin token/action references, Help/Guide impact rules, screenshot handoff rules, forward compatibility rules, or verification lanes change before PR handoff.

## Goal

Align the contextual QR panel embedded in Admin Content editing with the current AW-006 admin token/action hierarchy while preserving QR link data, stable redirects, create/update/delete/copy behavior, authz, labels, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

Jeg skal gjøre QR-panelet inne i Content Manager visuelt likt resten av adminverktøyet. Det betyr samme kort, knapper, felt og handlingstyper som hoved-QR-registeret. Det er viktig fordi operatøren da slipper at inline-QR føles som et eldre, separat verktøy. Utenfor scope er QR-API, `/go/v/[slug]`, lagre/slette/kopiere-logikk, auth, database, Help/Guide-labels og supportflyt.

Fremoverkompatibilitet: nye innholdsobjekter og QR-rader skal arve samme styling automatisk via eksisterende `AdminContextQrPanel`-dataflyt; nye QR-statusverdier eller nye workflow-handlinger må få eksplisitt mapping/test før release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                 | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The active AW-006 queue and design inventory must identify this contextual QR token/action parity slice without stale active references.                                                           | active brief + queue/inventory diff + changed-files review  | `5/5`                   |
| UX flow clarity                               | `target`     | Context QR create, edit, copy, open redirect, open destination, activate/disable, delete, reset defaults, and full-registry entry remain visible and predictable with unchanged labels.            | focused unit tests + screenshot handoff + diff review       | `5/5`                   |
| Visual design quality                         | `target`     | The contextual QR panel shell, rows, create/edit forms, fields, status chips, and visible actions use current admin card/action/token classes and preserve responsive wrapping.                    | code diff + screenshot handoff                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | QR GET/POST/PATCH/DELETE payloads, stable link construction, copy behavior, status toggle behavior, delete confirmation, prefill defaults, and content edit placement remain unchanged.            | focused unit tests + changed-files review                   | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Editors can still manage attached QR links from the content edit flow without switching tabs, while the inline panel matches the rest of the admin workspace.                                      | focused unit tests + screenshot handoff                     | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Existing labels, buttons, links, inputs, selects, status states, disabled states, focus styles, and `AdminManagerState` live-region semantics remain intact.                                       | Testing Library assertions + screenshot/code review         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this slice changes local classes/markup and must add no dependency, new fetch, render loop, or material client payload.                                                           | dependency diff + broad gate                                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical QR rows remain unchanged; local component state remains transient form/edit/loading/copy UI state only.                                                                           | active brief data contract + changed-files review           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no fetch cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy.                                                           | cache scope rationale                                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing warning, loading, load error + retry, action error, action notice, empty state, and mutation failure behavior remains deterministic.                                                      | focused unit tests + changed-files review                   | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, QR API authz, credentials mode, cookies, secrets, redirect policy, and destination validation boundaries remain untouched.                                           | unchanged auth/API diff review + existing security coverage | `5/5`                   |
| Privacy and compliance                        | `target`     | Admin-only content context, QR owner/user identifiers, stable links, and operator-only panel state remain on existing admin surfaces with no new public exposure or logging.                       | changed-files review + no API/logging diff                  | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, design inventory, and active brief describe this slice and protected areas accurately.                                                                                     | docs diff + brief lint                                      | `5/5`                   |
| Admin workflow and editability                | `target`     | Existing QR workflow labels and content-editor placement remain intact; only visual/action styling changes.                                                                                        | focused unit tests + route/label/support sweep              | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this admin-only component changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                  | explicit scope review                                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this admin-only component changes no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract.                                      | explicit AI-discoverability scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, persistence, dashboard, KPI behavior, or instrumentation.                                                                     | changed-files review                                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                               | explicit commerce scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with rationale: this slice changes no incident path, support runbook, recovery procedure, alerting, or operator support workflow labels; contextual QR behavior is preserved.                  | explicit support-surface review                             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with rationale: this slice changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, revenue recognition, or finance data.             | explicit finance scope review                               | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: existing English operator labels are preserved; responsive token/action classes must not introduce layout assumptions that block later translation.                               | screenshot handoff + changed-files review                   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React client component, full QR Registry/reference token classes, `AdminManagerState`, local helpers, and no new dependency or broad shared primitive refactor.                       | code diff + dependency diff                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused tests for token/action classes and preserved QR behavior; run targeted unit tests, brief lint, route/label/support sweep, diff check, and screenshot handoff before broad PR gates. | commands + logs                                             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because future content-linked QR rows should inherit the same treatment through the existing row renderer without extra services, infrastructure, or recurring cost.                    | row-rendering diff review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, packages, config, workflow, or deployment setting changes are allowed, and visual approval must happen before `verify:pre-pr`. | git diff + screenshot handoff + gate order                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `AdminQrLinksManager` token/action parity from PR `#906`, `AdminContextNotesPanel` parity from PR `#914`, `AdminWorkspace` shell after PR `#900`, and current `AdminManagerState` usage.
  - `AdminContextQrPanel` stays a client component embedded from `AdminContentManager`; do not change route boundaries, server/client ownership, API routes, or cache behavior.
  - Route/API boundary remains unchanged: `/api/admin/qr-links`, `/api/admin/qr-links/[id]`, content-edit context helpers, and `/go/v/[slug]`.
- TypeScript/domain contracts:
  - Preserve `QrRedirectLinkRow`, `QrLinkStatus`, form/edit state shapes, response unions, and existing fallback/error strings.
  - Deterministic invariant: every returned contextual QR row renders one inline row with stable link, destination, placement, status, and the same actions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse current admin token/action classes (`fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, `fs-cta-primary`, `fs-cta-secondary`, token radius/border variables) where they fit.
  - Keep contextual QR-specific status color only where it communicates actual QR status or destructive risk.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Context QR to full QR Registry/reference admin surfaces.
- Testing:
  - Update focused unit coverage in `tests/unit/admin-context-qr-panel.test.tsx` for token/action classes and preserved behavior.
  - Capture representative desktop and mobile screenshots before broad PR gates.

## Data Placement And Sync Contract

- Server-canonical data:
  - QR links remain server-canonical through existing admin QR APIs.
- Local data:
  - Component state remains transient UI state only: loading/error/warning, form values, edit form values, submitting/saving/deleting IDs, copied-link ID, and action messages.
- Sync policy:
  - Existing explicit create/update/delete calls remain unchanged; successful responses continue to update local `items` from returned server payloads.
  - Existing retry behavior for load failures is preserved.
- Retention and sensitivity:
  - No retention, deletion, signed URL, admin visibility, or sensitive-data rule changes.
- Cache/invalidation:
  - Existing `cache: "no-store"` load behavior remains unchanged; no route cache or revalidation behavior changes.

## Identity And Rename Contract

- Canonical stable ID:
  - `QrRedirectLinkRow.id` remains the stable identifier for update/delete operations.
- Human-readable identifiers:
  - `slug`, `destination_url`, `status`, `content_label`, and `placement_key` remain displayed/editable values from existing QR contracts.
- Mutability rules:
  - Existing slug/status/destination/placement edit behavior is preserved.
- Rename vs repurpose policy:
  - No rename/repurpose behavior changes; materially different redirect policy or slug compatibility remains outside scope.
- Compatibility contract:
  - Stable `/go/v/[slug]` routing, legacy compatibility, redirect behavior, and content identity are not changed.
- Observability and repair:
  - No new logging or repair workflow; existing API/support behavior remains the diagnostic source.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Contextual QR rows, QR statuses, content attachments, destination paths, placement keys, stable link actions, and status/action feedback.
- Source of truth:
  - QR rows come from `/api/admin/qr-links?contentItemId=...`.
  - Context defaults come from `resolveAdminContentEditQrContext`.
  - Stable links continue to derive from current origin and `/go/v/${slug}`.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New content items and QR rows should render through the same contextual QR row/form contract without code changes.
  - Existing empty/error/warning/action states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New QR statuses, new QR row actions, new redirect behavior, new content attachment types, new workflow labels, or new support/runbook procedures require explicit owner-approved mapping, tests, and Help/Guide/runbook review before release.
- Unknown or deprecated values:
  - Existing typed/fallback helpers remain the boundary; this slice must not add unsafe string parsing or hardcoded today's-only values.
- Test/evidence:
  - Focused unit coverage for class/token expectations plus route/label/support sweep proves the active slice styles the existing data contract rather than replacing it.

## Help / Guide Impact

N/A with rationale: this slice changes visual/action styling only and preserves existing QR workflow labels, recovery behavior, support procedures, and Help/Guide assertions. If implementation discovers label/workflow copy must change, Help/Guide impact must be re-audited before PR handoff.

## Route / Label / Support Surface Sweep

Required because this slice touches an admin workflow surface and visible actions.

- Terms:
  - `AdminContextQrPanel`
  - `Admin Context QR`
  - `QR links`
  - `Open full QR registry`
  - `Create QR link`
  - `Reset defaults`
  - `Copy stable link`
  - `Open redirect`
  - `Open destination`
  - `Edit QR`
  - `Set active`
  - `Disable`
  - `Delete`
  - `AW-006`
- Surfaces:
  - `components/admin/AdminContextQrPanel.tsx`
  - `components/admin/AdminQrLinksManager.tsx`
  - `components/admin/AdminContentManager.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `tests/unit/admin-context-qr-panel.test.tsx`
  - `tests/unit/admin-qr-links-manager-state.test.tsx`
  - `tests/e2e/`
  - `docs/design/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/runbooks/`
- Expected fallout:
  - queue/inventory active slice updates,
  - focused unit coverage,
  - screenshot artifacts,
  - no Help/Guide or runbook copy update unless labels/workflows change.

## Scope

- Create and maintain this active brief.
- Update `components/admin/AdminContextQrPanel.tsx` for panel shell, row cards, create/edit forms, fields, status chips, and visible actions.
- Update focused unit coverage in `tests/unit/admin-context-qr-panel.test.tsx`.
- Update canonical AW-006 queue and notice/state inventory.
- Run targeted tests/lint and capture screenshot handoff before broad PR gates.

## Out Of Scope

- QR API changes, QR slug/status behavior changes, `/go/v/[slug]` redirect behavior, QR asset generation/download behavior, generated filenames, content API changes, content edit context mapping changes, authz, RLS, migrations, generated DB types, cookies, credentials, secrets, or environment variables.
- Full QR Registry changes beyond reference comparison.
- Admin Content Manager layout redesign.
- Admin notes/quick-capture/screenshot-capture internals.
- Help/Guide/runbook text unless labels or recovery behavior change.
- Supabase, Stripe, auth, analytics, performance budgets, route metadata, public UI, or merge to `main`.

## Acceptance Criteria

1. Canonical AW-006 queue and notice/state inventory identify this slice as active with no stale active references.
2. `AdminContextQrPanel` uses current admin token/card/action classes for the shell, QR rows, create/edit panels, form fields, and visible actions where applicable.
3. Existing QR load, create, update, status toggle, delete, copy stable link, registry prefill link, and reset-defaults behavior is preserved.
4. Focused unit tests cover token/action class expectations and preserved contextual QR behavior.
5. Screenshot handoff includes representative `after/reference` artifacts and stops for owner approval before `npm run verify:pre-pr`.

## Validation Plan

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/admin-context-qr-panel.test.tsx`
- `npm run lint`
- `npm run typecheck`
- targeted route/label/support sweep
- `git diff --check`
- screenshot handoff before `npm run verify:pre-pr`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Checkpoint Log

- `2026-05-31 | in-progress | started from clean main@d70735c after PR #924 and closeout #925; post-merge preflight passed with no closeout remaining; owner approved Admin Context QR Panel Token/Action Parity after fresh queue/design/code re-audit | next: implement contextual QR token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-31 | implemented + targeted validation | aligned AdminContextQrPanel panel shell, QR rows, fields, create/edit controls, status chips, registry link, and visible row actions with the current admin token/action hierarchy; updated focused unit coverage and AW-006 queue/inventory state; local evidence passed: ./node_modules/.bin/vitest run tests/unit/admin-context-qr-panel.test.tsx, npm run lint:briefs:all, npm run typecheck, git diff --check, targeted route/label/support sweep, and npm run lint with one pre-existing output warning | next: capture required after/reference screenshot handoff and wait for owner approval before npm run verify:pre-pr`
- `2026-05-31 | screenshot-review | captured after/reference screenshot artifacts in output/aw-006-admin-context-qr-token-parity-2026-05-31-143343 at 2026-05-31 14:47 using a temporary local route with mocked QR/content responses; capture script hid only the Next dev indicator, the temporary route was removed after capture, and no scoped product-rendering file changed after the final capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, CI, or npm run verify:pre-merge`
- `2026-05-31 | pre-pr ready | owner approved the screenshot handoff; npm run verify:pre-pr passed the full lane, including brief/quality/admin/env/pr-body lint, eslint with the pre-existing output warning, typecheck, 222 unit files / 1303 unit tests, production build, perf budgets, and Playwright E2E with 102 passed / 492 environment-gated skips | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness handoff`

## Completion Record

- `completed`: `2026-05-31`
- `merged_pr`: `#926`
- `squash_commit`: `72c22c8`
- `result`: Closed AW-006 Admin Context QR Panel Token/Action Parity by aligning the contextual QR panel shell, QR rows, create/edit controls, form fields, status chips, and visible actions with the current admin token/action hierarchy while preserving the QR workflow.
- `validation`: `./node_modules/.bin/vitest run tests/unit/admin-context-qr-panel.test.tsx`; `npm run lint:briefs:all`; `npm run typecheck`; `npm run lint`; `git diff --check`; targeted route/label/support sweep; screenshot handoff in `output/aw-006-admin-context-qr-token-parity-2026-05-31-143343`; owner screenshot approval; `npm run verify:pre-pr`; PR #926 CI; `npm run verify:pre-merge`.
- `10/10 claim`: yes - all critical target categories reached `5/5` for this bounded styling/parity slice.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                   | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | PR #926 kept the contextual QR workflow in the existing admin content edit placement and updated the AW-006 queue/inventory closeout state.                                                | None.        |
| UX flow clarity                               | `5/5`          | Screenshot handoff and focused unit coverage confirmed the shell, rows, edit/create forms, and visible actions use the current action hierarchy without changing labels or workflow order. | None.        |
| Visual design quality                         | `5/5`          | `after/reference` screenshot artifacts compare the contextual QR panel against the mature QR Registry reference; owner approved the handoff before broad gates.                            | None.        |
| Business logic correctness and data integrity | `5/5`          | Focused unit tests and full `npm run verify:pre-pr` / `npm run verify:pre-merge` passed while preserving QR create/update/delete/status/copy behavior.                                     | None.        |
| Admin editor ergonomics                       | `5/5`          | Panel, row, field, status, registry, and action controls now use consistent admin token/action classes while preserving existing operator actions.                                         | None.        |
| Accessibility (a11y)                          | `5/5`          | Existing labels and button text were preserved; full Playwright E2E and quality-gate evidence passed.                                                                                      | None.        |
| Data placement and sync boundaries            | `5/5`          | No data boundary changed; QR rows still come from `/api/admin/qr-links`, and stable links still resolve through `/go/v/[slug]`.                                                            | None.        |
| Reliability and failure handling              | `5/5`          | Existing `AdminManagerState` load/error/action feedback behavior remained in place and full verification passed.                                                                           | None.        |
| Security and authz                            | `5/5`          | No API/authz/RLS behavior changed; admin QR endpoints and protected workflow tests remained covered by full gates.                                                                         | None.        |
| Privacy and compliance                        | `5/5`          | No personal data, credentials, analytics payloads, or export content changed.                                                                                                              | None.        |
| Content governance                            | `5/5`          | Labels, Help/Guide content, runbooks, and support procedures were preserved; route/label/support sweep found no copy fallout requiring updates.                                            | None.        |
| Admin workflow and editability                | `5/5`          | Edit/create/toggle/delete/copy/reset/default registry actions stayed editable and covered by focused tests.                                                                                | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing React component structure, `cx`, admin `fs-*` token classes, and focused Testing Library coverage; no dependencies added.                                                  | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, lint/typecheck, full pre-PR gate, CI, and full pre-merge gate passed.                                                                                                     | None.        |
| DevOps and rollback readiness                 | `5/5`          | PR #926 is a bounded component/test/docs change with green CI and pre-merge evidence; rollback is a single squash commit revert.                                                           | None.        |
