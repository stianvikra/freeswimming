# Task Brief: AW-006 Admin Email Templates Manager Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-30-aw-006-admin-email-templates-manager-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-30`
- `updated`: `2026-05-30`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-email-templates-manager-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-30`
- `base`: `main@bc313d1`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded Admin Email Templates manager token/action parity pass.
- `reason`: `main` is clean and synced after PR `#908` and repo-managed closeout PR `#909`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminEmailTemplatesManager` as the remaining admin manager presentation gap after `/admin` shell parity, Commerce/Operations parity, QR Registry parity, and Categories parity shipped.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminEmailTemplatesManager.tsx`, `AdminManagerState`, email template API/status/placeholder contracts, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the Admin Email Templates manager shell, create/edit panels, template rows, revision history panel, form fields, and visible actions with the current AW-006 `fs-library-card` and action-token direction without changing template data, status transitions, placeholder validation, preview rendering, APIs, authz, Help/Guide content, email delivery, or support procedures.

## Pre-Implementation Owner Explanation

Vi rydder Email Templates-panelet slik at kort, skjema, rader, historikk og knapper ser ut som resten av den nye admin-flaten. Det betyr at admin blir enklere å skanne og foeles mindre som en gammel restflate. Utenfor scope er template-data, statusregler, placeholder-validering, preview-rendering, API-er, auth, Help/Guide-tekst og faktisk e-postlogikk.

Fremoverkompatibilitet: nye template-rader, keys og locales boer automatisk arve samme visuelle moenster; nye workflow-statuser eller handlingslabels maa faa eksplisitt mapping og Help/Guide-vurdering.

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
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                             | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminEmailTemplatesManager` presentation and keep the AW-006 queue/design inventory accurate.                                                                                      | planned/active brief + queue/inventory diff + changed-files review | `5/5`                   |
| UX flow clarity                               | `target`     | Email template create/edit, status transition, refresh, retry, preview, and history actions are easier to scan while labels and click paths stay unchanged.                                                    | screenshot handoff + component tests + diff review                 | `5/5`                   |
| Visual design quality                         | `target`     | The manager reuses current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and local quiet/destructive action direction without broad redesign.    | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Template GET/POST/PATCH/status payloads, placeholder validation, preview rendering, status transition guards, revision loading, and edit/create reset behavior remain unchanged.                               | targeted unit tests + diff review                                  | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still create, edit, preview, move status, show/hide history, refresh history, and refresh the manager with no extra workflow step.                                                                  | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, labels, inputs, selects, textareas, preview warnings, status states, history states, disabled states, and retry actions remain keyboard reachable and screen-reader clear.                            | Testing Library assertions + screenshot/manual review              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, or material payload increase.                                                                                         | package diff + pre-pr gate                                         | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI cleanup introduces no local-only data, server-canonical data, browser storage, sync, conflict, retention, or sensitive-data behavior. Existing form/history state remains component-local. | data/sync scope rationale                                          | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                                        | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing loading, schema warning, load error, retry, action-error, action-notice, preview error, missing preview value, history loading, history error, and empty-history behavior remains deterministic.      | targeted state tests + diff review                                 | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, credentials mode, cookies, secrets, role-gated publish behavior, and placeholder validation boundaries remain untouched.                                              | unchanged auth/API diff review + existing security coverage        | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                                            | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing template workflow labels, Help/Guide behavior, support procedures, email-template runbook references, and AW-006 docs source of truth are preserved or updated for this slice only.                   | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Email template workflows remain editable through the same controls and API calls; this PR changes shell/card/action presentation only.                                                                         | targeted tests + changed-files review                              | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                                   | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                            | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                        | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                           | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                                  | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                       | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because template locales and admin strings may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                           | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API boundaries unchanged, and add no dependency or new global primitive.                                                         | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for Email Templates manager token/action classes, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.           | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`         | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven template rows and revision entries should inherit the same treatment without extra services, infrastructure, or recurring cost.                                                 | row/history rendering diff review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                      | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, Commerce/Operations manager parity from PR `#904`, QR Registry manager parity from PR `#906`, Categories manager parity from PR `#908`, and `AdminManagerState`.
  - `AdminEmailTemplatesManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/email-templates`, `/api/admin/email-templates/[id]`, and `/api/admin/email-templates/[id]/revisions`.
  - Cache/revalidation behavior remains unchanged; existing `cache: "no-store"` fetches are preserved.
- TypeScript/domain contracts:
  - Preserve `AdminEmailTemplateRow`, `AdminEmailTemplateStatus`, create/edit form state, preview helpers, placeholder validation helpers, response unions, and existing fallback/error strings.
  - Deterministic invariant: every returned template row renders one row card with the same source identifiers, status actions, preview output, edit controls, and history controls.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no email provider behavior, Stripe, Supabase provider setting, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and manager-local quiet/destructive action classes aligned to the same radius/focus/token direction.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Email Templates states inside `/admin` to the current tokenized `/admin` shell and nearby admin manager surfaces.
- Testing:
  - Add or update focused unit tests for Email Templates manager token/action classes plus existing state behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this presentation cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Existing create/edit form state, action status, and revision-history state remain component-local UI state derived from server-canonical admin email template APIs.

## Identity And Rename Contract

This slice does not change identity behavior. Email template `id`, `template_key`, `locale`, `version`, `status`, placeholder lists, subject/body, preview sample values, and revision identifiers remain displayed from existing API rows. Template key and locale identity semantics, status mutability, revision history, and rollback/audit behavior remain owned by the existing email-template API/domain layer.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Email template rows, template keys, locales, statuses, placeholder lists, preview sample values, revision-history entries, row-level actions, and manager-local status states.
- Source of truth:
  - Templates come from `/api/admin/email-templates`.
  - Revisions come from `/api/admin/email-templates/${templateId}/revisions`.
  - Status transition permissions come from existing `canTransitionAdminEmailTemplateStatus` / `nextQuickStatusOptions` logic.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New template rows returned by the existing API should render through the same template row card without code changes.
  - New revision entries returned by the existing API should render through the same history list treatment without code changes.
  - Empty/error/warning/preview/history states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New template statuses, new status transitions, new workflow actions, new placeholder semantics, new locale routing behavior, new support/runbook flows, or new Help/Guide instructions require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown API failures remain handled by current error states.
  - Unknown status values are out of current typed contract and must fail type review or receive an explicit fallback label/class mapping before release.
- Test/evidence:
  - Focused unit tests verify shell/row/action/form/history class parity and unchanged fetch, create, edit, status transition, preview, retry, and history behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing Email Templates workflow labels, recovery action labels, Help/Guide assertions, runbook references, support procedures, and operator instructions. Help/Guide or runbook updates are required only if implementation changes action meaning, recovery behavior, auth, template status behavior, publish/rollback procedure, email delivery behavior, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Email templates`
  - `Create template`
  - `Edit`
  - `Close editor`
  - `Show history`
  - `Hide history`
  - `Refresh history`
  - `Move to`
  - `Save changes`
  - `Template key`
  - `Preview sample values`
  - `AdminEmailTemplatesManager`
- Surfaces to check:
  - `components/admin/AdminEmailTemplatesManager.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-email-template-governance.md`
  - `tests/unit/admin-email-templates-manager-state.test.tsx`
  - `tests/unit/admin-email-templates.test.ts`
  - `tests/e2e/admin-email-templates-preview.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Email Templates card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates after execution begins.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminEmailTemplatesManager.tsx` shell, create form panel, edit panel, template row cards, status action group, refresh/retry actions, save actions, preview panels, revision history panel, history retry action, and form fields with current AW-006 token/action direction.
- Preserve email template fetch/create/update/status behavior, preview rendering, placeholder parsing/validation, missing preview value warnings, revision history fetch/retry behavior, status transition guards, form reset behavior, and all API/auth behavior.
- Add or update focused tests for Email Templates token/action classes and preserved behavior.
- Update this brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Email template API changes, status transition behavior, placeholder validation rules, preview rendering logic, revision history API, email provider behavior, outbound email delivery, admin authz, RLS, migrations, generated DB types, cookies, credentials, secrets, or environment variables.
- Admin workspace shell, admin content, Commerce, Operations, QR Registry, messages, notes, categories, Help Center, or other manager internals beyond the scoped Email Templates manager.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. Email Templates manager shell, create/edit panels, rows, preview blocks, history panel, and actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. Template row data, create payloads, edit payloads, status transitions, placeholder validation, preview rendering, revision history fetch/retry behavior, and form reset behavior remain unchanged.
3. Buttons, inputs, selects, textareas, status states, preview warnings, history states, and disabled states remain keyboard reachable and semantically clear.
4. Future template rows and revision entries returned by existing APIs inherit the same row/history treatment without hardcoded today-only values.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-email-templates-manager-state.test.tsx tests/unit/admin-email-templates.test.ts`
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

End-to-end implementation after owner explicitly said `execute`. Because this is visual UI work, stop after screenshot handoff for owner approval before `npm run verify:pre-pr`, PR creation, CI, or `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-05-30 | planned | created from clean main@bc313d1 after PR #908 and repo-managed closeout #909; post-merge preflight passed with no closeout remaining; owner approved AW-006 Admin Email Templates Manager Token/Action Parity after fresh queue/design/code re-audit | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress and changing product code`
- `2026-05-30 | in-progress | owner explicitly said execute; moved brief to in-progress on branch aw-006-admin-email-templates-manager-token-parity with planned queue/design updates carried over | next: implement scoped Email Templates manager token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-30 | in-progress | implemented scoped Email Templates manager token/action parity in AdminEmailTemplatesManager and added focused class assertions for header, create panel, rows, status actions, edit actions, and history actions; targeted Vitest passed for tests/unit/admin-email-templates-manager-state.test.tsx and tests/unit/admin-email-templates.test.ts with 23 tests | next: run brief lint, route/label/support sweep, git diff whitespace check, then capture screenshot handoff before broad PR gates`
- `2026-05-30 | in-progress | targeted validation is green: Vitest passed for tests/unit/admin-email-templates-manager-state.test.tsx and tests/unit/admin-email-templates.test.ts with 23 tests, npm run lint:briefs:all passed including this in-progress brief, route/label/support sweep found no required Help/Guide or runbook fallout because labels/workflows are unchanged, and git diff --check passed; npm run lint:briefs currently skips because the branch has no committed brief diff yet and will be covered again in pre-PR gates after commit | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-05-30 | screenshot-review | captured required after/reference screenshot handoff at output/aw-006-admin-email-templates-manager-token-action-parity-2026-05-30-115101 at 2026-05-30 11:51 using a temporary local dev-only route with mocked Email Templates and Commerce API responses; temporary route/script were removed before handoff and git diff --check still passes | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, CI, or npm run verify:pre-merge`
- `2026-05-30 | pre-pr | owner approved screenshot handoff and then approved merge/cleanup once tests are good; npm run verify:pre-pr passed the full lane on working tree with lint, typecheck, 1295 unit tests, build, performance budgets, and Playwright e2e 102 passed / 492 skipped | next: commit, push, open PR, monitor required CI, run npm run verify:pre-merge, then merge and clean up if green`
