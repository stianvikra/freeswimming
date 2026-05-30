# Task Brief: AW-006 Admin Commerce And Operations Manager Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-29-aw-006-admin-commerce-operations-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-29`
- `updated`: `2026-05-29`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-commerce-operations-token-action-parity`

## Brief Audit Record

- `last_audited`: `2026-05-29`
- `base`: `main@f11342e`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded Admin Commerce and Operations manager token/action parity pass.
- `reason`: `main` is clean and synced after PR `#902` and repo-managed closeout PR `#903`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminCommerceManager` and `AdminOperationsManager` as small remaining admin manager presentation gaps after `/admin` shell parity shipped.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminCommerceManager.tsx`, `components/admin/AdminOperationsManager.tsx`, `AdminManagerState`, admin product/runtime flag API contracts, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Align the Admin Commerce and Operations manager shells, row cards, and visible actions with the current AW-006 `fs-library-card` and action-token direction without changing product catalog data, Stripe identifiers, runtime flags, site-lock behavior, APIs, authz, Help/Guide content, or support procedures.

## Pre-Implementation Owner Explanation

Jeg rydder to små admin-paneler, Commerce og Operations, slik at kort og knapper ser ut som resten av den nye admin-flaten. Det gjør admin lettere å skanne etter at hovedskallet ble pusset. Utenfor scope er produkter, priser, Stripe, runtime-flagg, site-lock, API-er, roller, lagring, Help/Guide og faktisk admin-logikk.

Fremoverkompatibilitet: nye produkter og runtime-flagg skal fortsatt komme fra eksisterende data/API-er og arve samme visuelle radmønster automatisk; nye produktspesifikke handlinger, supportregler eller betalingsmodeller krever eksplisitt mapping senere.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Security and authz`
- `Commerce and revenue ops`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                            | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminCommerceManager` and `AdminOperationsManager` presentation and keep the AW-006 queue/design inventory accurate.                                                              | active brief + queue/inventory diff + changed-files review  | `5/5`                   |
| UX flow clarity                               | `target`     | Commerce product rows and Operations flag/site-lock rows are easier to scan, while refresh/save/toggle/link labels and click paths stay unchanged.                                                            | screenshot handoff + component tests + diff review          | `5/5`                   |
| Visual design quality                         | `target`     | The two managers reuse current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, and `fs-cta-secondary` direction without broad admin redesign.                         | screenshot handoff + DOM/class review                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Product GET/PATCH payloads, draft dirty checks, active flag toggles, runtime flag GET/PATCH payloads, and site-lock read-only facts remain unchanged.                                                         | targeted unit tests + diff review                           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still refresh Commerce/Operations, edit product title/active status, inspect Stripe price IDs, open site-lock links, and toggle runtime flags with no extra workflow step.                         | component tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, links, labels, checkboxes, inputs, status states, and disabled states remain keyboard reachable and screen-reader clear.                                                                             | Testing Library assertions + screenshot/manual review       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, or material payload increase.                                                                                        | package diff + pre-pr gate                                  | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI cleanup introduces no local-only data, server-canonical data, browser storage, sync, conflict, retention, or sensitive-data behavior. Existing local draft state remains component-local. | data/sync scope rationale                                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                                       | cache scope rationale                                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing loading, warning, error, empty, action-error, save, and retry behavior remains deterministic and still uses `AdminManagerState` where already established.                                           | targeted state tests + diff review                          | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, credentials mode, cookies, secrets, Stripe identifiers, and runtime flag auth boundaries remain untouched.                                                           | unchanged auth/API diff review + existing security coverage | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                                           | privacy scope rationale                                     | `N/A`                   |
| Content governance                            | `target`     | Existing admin labels, site-lock runbook links, Help/Guide behavior, support procedures, and AW-006 docs source of truth are preserved or updated for this slice only.                                        | copy-preservation diff review + docs update                 | `5/5`                   |
| Admin workflow and editability                | `target`     | Commerce and Operations workflows remain editable through the same controls and API calls; this PR changes shell/card/action presentation only.                                                               | targeted tests + changed-files review                       | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                                  | SEO scope rationale                                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                           | AI-discoverability scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                       | diff review                                                 | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Product IDs, slugs, titles, active status, Stripe price IDs, checkout assumptions, entitlements, billing, and finance-relevant data remain unchanged by the presentation pass.                                | Commerce manager tests + API/payload diff review            | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                                 | explicit support-ops scope rationale                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                      | explicit finance scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                                               | copy-preservation diff review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API boundaries unchanged, and add no dependency or new global primitive.                                                        | component diff + package diff                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for the two managers, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.                                      | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven product and runtime-flag rows should inherit the same treatment without extra services, infrastructure, or recurring cost.                                                     | row-rendering diff review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                     | git diff review + validation gates                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, `AdminManagerState`, and AW-006 tokenized My Library/admin card/action classes.
  - `AdminCommerceManager` and `AdminOperationsManager` stay client components.
  - Route/action/API boundary remains unchanged: `/api/admin/products`, `/api/admin/products/[id]`, `/api/admin/operations/flags`, and `/api/admin/operations/flags/[key]`.
  - Cache/revalidation behavior remains unchanged; existing `cache: "no-store"` fetches are preserved.
- TypeScript/domain contracts:
  - Preserve `AdminProductRow`, `ProductDraft`, `AdminRuntimeFlagRow`, site-lock snapshot shape, response unions, and existing fallback/error strings.
  - Deterministic invariant: every returned product and runtime flag row renders one editable row with the same source identifiers and actions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe API, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, and `fs-cta-secondary`.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed managers inside `/admin` to the current `/admin` shell and nearby tokenized admin surfaces.
- Testing:
  - Add or update focused unit tests for Commerce token/action classes and Operations token/action classes plus existing state behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this presentation cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Existing product draft state and runtime flag updating state remain component-local UI state derived from server-canonical admin APIs.

## Identity And Rename Contract

This slice does not change identity behavior. Product `id`, `slug`, `title`, `kind`, `stripe_price_id`, and runtime flag `key` remain displayed from existing API rows. Product titles and active flags keep the existing edit-in-place behavior; slugs, Stripe price IDs, runtime flag keys, site-lock fields, and route/action identifiers are not changed.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin product catalog rows, runtime flag rows, site-lock read-only facts, row-level actions, and manager-local status states.
- Source of truth:
  - Products come from `/api/admin/products`.
  - Runtime flags and site-lock snapshot come from `/api/admin/operations/flags`.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New product rows should render through the same product row card without code changes.
  - New runtime flag rows should render through the same flag row card without code changes.
  - Empty/error/warning states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New product-specific admin actions, new commerce statuses, new billing models, new finance/reporting procedures, new runtime flag categories, or new support/runbook flows require explicit owner-approved mapping, tests, and Help/Guide/runbook review before release.
- Unknown or deprecated values:
  - Unknown product kinds and runtime flag keys continue to display their raw safe labels/hints from existing data; unsupported API failures remain handled by current error states.
- Test/evidence:
  - Focused unit tests verify row/action class parity and unchanged fetch/retry/save/toggle behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, site-lock runbook links, support procedures, Help/Guide assertions, and operator instructions. Help/Guide or runbook updates are required only if implementation changes action meaning, recovery behavior, auth, payments, support procedure, or finance workflow; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/commerce/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Commerce`
  - `Operations`
  - `Refresh`
  - `Save product`
  - `Product id`
  - `Stripe price id`
  - `Private Access Gate`
  - `Open lock operations workflow`
  - `Open unlock page`
  - `Sign out this browser`
  - `Runtime flag`
  - `Enable`
  - `Disable`
  - `AdminCommerceManager`
  - `AdminOperationsManager`
- Surfaces to check:
  - `components/admin/AdminCommerceManager.tsx`
  - `components/admin/AdminOperationsManager.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `tests/unit/admin-commerce-manager-state.test.tsx`
  - `tests/unit/admin-workspace-shell.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Commerce/Operations card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminCommerceManager.tsx` shell, product row cards, Refresh, Retry, and Save product actions with current AW-006 token/action direction.
- Align `components/admin/AdminOperationsManager.tsx` shell, site-lock card, runtime flag row cards, Refresh, Retry, site-lock links, and Enable/Disable actions with current AW-006 token/action direction.
- Preserve product catalog fetch/update behavior, draft state, active flag semantics, Stripe price ID display, runtime flag fetch/toggle behavior, site-lock facts, external runbook/workflow links, and all API/auth behavior.
- Add or update focused tests for Commerce and Operations manager token/action classes and preserved behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates.

## Out Of Scope

- Product catalog API changes, Stripe API changes, checkout changes, entitlement changes, prices, invoices, refunds, payouts, or finance/reporting behavior.
- Runtime flag API changes, site-lock environment behavior, unlock flow behavior, credentials, cookies, secrets, authz, RLS, migrations, or generated DB types.
- Admin workspace shell, admin content, QR, email templates, messages, notes, categories, Help Center, or other manager internals beyond the two scoped managers.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, environment variables, or merge to `main`.

## Acceptance Criteria

1. Commerce and Operations manager shells/cards/actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. Product row data, draft edit/save behavior, active checkbox behavior, Stripe price ID display, and product API payloads remain unchanged.
3. Runtime flag row data, toggle behavior, site-lock read-only facts, site-lock links, and operations API payloads remain unchanged.
4. Buttons, links, inputs, checkboxes, status states, and disabled states remain keyboard reachable and semantically clear.
5. Future product/runtime-flag rows returned by existing APIs inherit the same row/card treatment without hardcoded today-only values.
6. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
7. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-commerce-manager-state.test.tsx tests/unit/admin-operations-manager-state.test.tsx`
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

Completed before screenshot handoff on `2026-05-29`:

- `./node_modules/.bin/vitest run tests/unit/admin-commerce-manager-state.test.tsx tests/unit/admin-operations-manager-state.test.tsx` - PASS, `2` files / `7` tests.
- `npm run lint:briefs:all` - PASS, all `389` brief files passed.
- `git diff --check` - PASS.
- Targeted route/label/support sweep across the scoped Admin Commerce/Operations managers, admin workspace/help references, targeted tests, design inventory, and AW-006 queue/active brief - PASS; no Help/Guide, runbook, API, workflow-label, or support-procedure fallout found.
- Screenshot handoff captured against `http://127.0.0.1:3000` with `FS_ALLOW_PROD_SUPABASE=1` only for this local smoke screenshot because the egress guard blocks cloud Supabase in local dev by default: `output/aw-006-admin-commerce-operations-token-action-parity-2026-05-29-215309`. Current smoke data has no runtime flag rows, so Operations row-card parity is validated by focused unit coverage and the screenshot covers the manager header, site-lock card, and site-lock actions.

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Checkpoint Log

- `2026-05-29 | in-progress | started from clean main@f11342e after PR #902 and repo-managed closeout #903; post-merge preflight passed with no closeout remaining; owner approved AW-006 Admin Commerce And Operations Manager Token/Action Parity after a fresh queue/design/code re-audit | next: implement scoped manager token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-29 | in-progress | implemented scoped Commerce/Operations token/action parity, added focused manager tests, updated AW-006 queue/design inventory, and passed targeted tests, brief lint, diff check, and route/label/support sweep | next: capture screenshot handoff and stop for owner visual approval before verify:pre-pr`
- `2026-05-29 | screenshot handoff | captured after/reference artifacts in output/aw-006-admin-commerce-operations-token-action-parity-2026-05-29-215309; no runtime flag rows exist in current smoke data, so flag row rendering remains covered by unit tests | next: owner visual approval, then run npm run verify:pre-pr`
