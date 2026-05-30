# Task Brief: AW-006 Admin Categories Manager Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-30-aw-006-admin-categories-manager-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-30`
- `updated`: `2026-05-30`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-categories-manager-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-30`
- `base`: `main@9f08c77`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded Admin Categories manager token/action parity pass.
- `reason`: `main` is clean and synced after PR `#906` and repo-managed closeout PR `#907`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminCategoriesManager` as a small remaining admin manager presentation gap after `/admin` shell parity, Commerce/Operations parity, and QR Registry manager parity shipped.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminCategoriesManager.tsx`, `AdminManagerState`, category API contracts, admin category identity rules, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before implementation or PR handoff.

## Goal

Align the Admin Categories manager shell, scope cards, category rows, create panel, and visible actions with the current AW-006 `fs-library-card` and action-token direction without changing category data, scopes, slugs, sort order, active/deactivated behavior, APIs, authz, Help/Guide content, or support procedures.

## Pre-Implementation Owner Explanation

Vi rydder opp i Categories-delen i adminpanelet slik at den ser og oppfører seg likt som de nyeste admin-delene vi nettopp har forbedret. Categories brukes til å organisere innhold og adminnotater. Når knapper, kort, feilmeldinger og valg ser like ut på tvers av adminpanelet, blir det enklere og tryggere å bruke uten å lure på om en del fungerer annerledes.

Utenfor scope: vi endrer ikke hva kategorier er, hvordan de lagres, hvem som har tilgang, eller hvordan opprett/slett/aktiver fungerer. Dette er kun visuell og bruksmessig opprydding.

Fremoverkompatibilitet: nye kategorier eller scopes skal fortsatt følge samme visuelle mønster automatisk; hvis en helt ny type admin-kategori innføres senere, bør den kobles på samme mønster i stedet for å få egen styling.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                    | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminCategoriesManager` presentation and keep the AW-006 queue/design inventory accurate.                                                                                 | active brief + queue/inventory diff + changed-files review  | `5/5`                   |
| UX flow clarity                               | `target`     | Category scope selection, refresh, category rows, activate/deactivate, delete, and create entry are easier to scan while labels and click paths stay unchanged.                                       | screenshot handoff + component tests + diff review          | `5/5`                   |
| Visual design quality                         | `target`     | The manager reuses current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and local destructive action direction without broad redesign. | screenshot handoff + DOM/class review                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Category GET/POST/PATCH/DELETE payloads, scope switching, sort behavior, active-state toggles, delete confirmation, and form reset behavior remain unchanged.                                         | targeted unit tests + diff review                           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still refresh, switch notes/content scopes, create categories, activate/deactivate rows, and delete rows with no extra workflow step.                                                      | component tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, labels, inputs, active scope buttons, status states, disabled states, and destructive actions remain keyboard reachable and screen-reader clear.                                             | Testing Library assertions + screenshot/manual review       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, or material payload increase.                                                                                | package diff + pre-pr gate                                  | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI cleanup introduces no local-only data, server-canonical data, browser storage, sync, conflict, retention, or sensitive-data behavior. Existing UI state remains component-local.  | data/sync scope rationale                                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                               | cache scope rationale                                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing loading, warning, error, empty, action-error, saving, deleting, and retry behavior remains deterministic.                                                                                    | targeted state tests + diff review                          | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, credentials mode, cookies, secrets, category scope validation, and destructive confirmation boundaries remain untouched.                                     | unchanged auth/API diff review + existing security coverage | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                                   | privacy scope rationale                                     | `N/A`                   |
| Content governance                            | `target`     | Existing category labels, Help/Guide behavior, support procedures, and AW-006 docs source of truth are preserved or updated for this slice only.                                                      | copy-preservation diff review + docs update                 | `5/5`                   |
| Admin workflow and editability                | `target`     | Category workflows remain editable through the same controls and API calls; this PR changes shell/card/action presentation only.                                                                      | targeted tests + changed-files review                       | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                          | SEO scope rationale                                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                   | AI-discoverability scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                               | diff review                                                 | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                  | explicit commerce scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                         | explicit support-ops scope rationale                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                              | explicit finance scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                                       | copy-preservation diff review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API boundaries unchanged, and add no dependency or new global primitive.                                                | component diff + package diff                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for Categories manager token/action classes, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.       | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven category rows should inherit the same treatment without extra services, infrastructure, or recurring cost.                                                             | row-rendering diff review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                             | git diff review + validation gates                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, `AdminManagerState`, Commerce/Operations manager parity from PR `#904`, QR Registry manager parity from PR `#906`, and AW-006 tokenized admin card/action classes.
  - `AdminCategoriesManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/categories/[scope]` and `/api/admin/categories/[scope]/[id]`.
  - Cache/revalidation behavior remains unchanged; existing `cache: "no-store"` fetches are preserved.
- TypeScript/domain contracts:
  - Preserve `AdminCategoryRow`, `AdminCategoryScope`, response unions, `FormState`, scope options, and existing fallback/error strings.
  - Deterministic invariant: every returned category row renders one row card with the same source identifiers and actions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and manager-local quiet/destructive action classes aligned to the same radius/focus/token direction.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Categories states inside `/admin` to the current tokenized `/admin` shell and nearby admin manager surfaces.
- Testing:
  - Add or update focused unit tests for Categories manager token/action classes plus existing state behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this presentation cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Existing scope/form/update/delete state remains component-local UI state derived from server-canonical admin category APIs.

## Identity And Rename Contract

This slice does not change identity behavior. Category `id`, `scope`, `title`, `slug`, `sort_order`, and `is_active` remain displayed from existing API rows. Slug input and title input keep the existing create-only behavior in this component; activate/deactivate and delete keep their current edit/delete behavior. Category identity, compatibility, and any legacy references remain owned by the existing category API/domain layer.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Category rows, category scopes, category titles/slugs, sort order, active/deactivated state, create form fields, and manager-local status states.
- Source of truth:
  - Category rows come from `/api/admin/categories/${scope}`.
  - Supported scopes come from the existing `CATEGORY_SCOPES` typed options.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New category rows returned by an existing scope should render through the same category row card without code changes.
  - Empty/error/warning and action-error states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New category scopes, new category workflow actions, new identity rules, new support/runbook flows, or new Help/Guide instructions require explicit owner-approved mapping, tests, and docs review before release.
- Unknown or deprecated values:
  - Unknown API failures remain handled by current error states.
  - Unsupported scope values are not introduced by this component because scope options stay typed and local; if future deep-linkable scopes are added, they must be validated by the category API and mapped in `CATEGORY_SCOPES`.
- Test/evidence:
  - Focused unit tests verify shell/row/action class parity and unchanged fetch, scope switch, create, update, delete, and retry behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing category workflow labels, recovery action labels, Help/Guide assertions, support procedures, and operator instructions. Help/Guide or runbook updates are required only if implementation changes action meaning, recovery behavior, auth, category scope behavior, support procedure, or category operational workflow; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `Categories`
  - `Notes categories`
  - `Content categories`
  - `Create category`
  - `Save category`
  - `Deactivate`
  - `Activate`
  - `Delete category`
  - `AdminCategoriesManager`
- Surfaces to check:
  - `components/admin/AdminCategoriesManager.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `tests/unit/admin-categories-manager-state.test.tsx`
  - `tests/unit/admin-workspace-shell.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Categories card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates after execution begins.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminCategoriesManager.tsx` shell, scope selector cards, category row cards, row actions, retry action, create form panel, fields, and submit action with current AW-006 token/action direction.
- Preserve category fetch/create/update/delete behavior, scope switching, sort behavior, active-state toggles, delete confirmation, create form reset, and all API/auth behavior.
- Add or update focused tests for Categories token/action classes and preserved behavior.
- Update this brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates after implementation starts.

## Out Of Scope

- Category API changes, category scope behavior changes, slug/title/sort-order rules, delete semantics, active-state semantics, admin authz, RLS, migrations, generated DB types, cookies, credentials, secrets, or environment variables.
- Admin workspace shell, admin content, Commerce, Operations, QR Registry, email templates, messages, notes, Help Center, or other manager internals beyond the scoped Categories manager.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. Categories manager shell, scope cards, rows, create form, and actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. Category row data, scope switching, create payloads, active/deactivated behavior, delete confirmation, delete behavior, and retry behavior remain unchanged.
3. Buttons, inputs, status states, scope selectors, and disabled states remain keyboard reachable and semantically clear.
4. Future category rows returned by existing APIs inherit the same row/card treatment without hardcoded today-only values.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-categories-manager-state.test.tsx`
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

## Execution Mode

End-to-end implementation is now active on branch `aw-006-admin-categories-manager-token-parity`. Implement the scoped changes, run targeted validation, capture screenshot handoff, wait for screenshot approval, then continue through the normal PR gates.

## Checkpoint Log

- `2026-05-30 | planned | created from clean main@9f08c77 after PR #906 and repo-managed closeout #907; post-merge preflight passed with no closeout remaining; owner approved AW-006 Admin Categories Manager Token/Action Parity after fresh queue/design/code re-audit | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress and changing product code`
- `2026-05-30 | in-progress | owner explicitly said execute; moved brief to in-progress on branch aw-006-admin-categories-manager-token-parity with planned queue/design updates carried over | next: implement scoped Categories manager token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-30 | in-progress | implemented Categories manager token/action parity in AdminCategoriesManager, updated focused unit assertions for header/scope/row/create/action classes, and passed ./node_modules/.bin/vitest run tests/unit/admin-categories-manager-state.test.tsx | next: run brief lint, route/label/support sweep, git diff whitespace check, then capture screenshot handoff before broad PR gates`
- `2026-05-30 | screenshot-review | npm run lint:briefs:all, targeted route/label/support sweep, and git diff --check passed; captured after/reference screenshots at output/aw-006-admin-categories-manager-token-action-parity-2026-05-30-102031 using a temporary local dev-only route with mocked Categories/Commerce API responses; the temporary route and script were removed before handoff | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, CI, and npm run verify:pre-merge`
- `2026-05-30 | screenshot-approved | owner approved the after/reference screenshot handoff; no product-rendering files changed after screenshot capture | next: run npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-30 | pre-pr-ready | npm run verify:pre-pr passed full lane against origin/main@9f08c77 with lint, quality gates, admin/env/PR-body lint, eslint, typecheck, 1294 unit tests, build, performance budgets, and Playwright 102 passed / 492 skipped; verify log artifacts/test-runs/20260530-103043/verify.log; performance trend recommendation was hold, not tighten, because worst margin was 13.9% versus 15.0% tighten threshold | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
