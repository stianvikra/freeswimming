# Task Brief: AW-006 Admin Console Accessibility Audit + Bounded Fixes (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-admin-console-accessibility-audit-bounded-fixes-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@5898f57`
- `audit_status`: `ready`
- `decision`: Execute a bounded AW-006 admin-console accessibility audit with permission for small deterministic fixes only when the audit finds serious/critical accessibility defects.
- `reason`: `main` is clean and synced after AW-006 Guide Entitlement And Tracker Accessibility Audit PR `#959` and repo-managed closeout PR `#960`; post-merge preflight is green with no active AW-006 product/UI/audit slice. The two latest AW-006 accessibility audits intentionally left authenticated admin-console coverage outside their scope, while the design inventory records admin-console audit as the remaining separate fixture-backed gap.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `app/admin/layout.tsx`, `components/admin/AdminWorkspace.tsx`, admin tab IDs/labels, admin dev-login fixture behavior, Playwright projects, axe dependency, screenshot handoff rules, forward compatibility rules, or verification lanes change before PR handoff.

## Goal

Make keyboard, landmark, heading, active-section, and serious/critical axe accessibility coverage explicit for the authenticated `/admin` shell and main admin tabs without changing admin data, workflow labels, API behavior, or operator training content.

## Pre-Implementation Owner Explanation

Vi sjekker admin-konsollen for alvorlige tilgjengelighetsfeil etter alle de siste AW-006-endringene. Det gjør verktøyet tryggere for operatører som bruker tastatur, skjermleser eller høy kontrast. Utenfor scope er redesign, tekst/workflow-endringer, nye admin-funksjoner, API/database-endringer, Stripe/Supabase og Help/Guide-innhold.

Forward-kompatibilitet: nye admin-tabber skal legges inn i audit-matrisen før de regnes som dekket; tabber som gjenbruker samme admin-shell, tab-knapper og state/action-mønstre skal arve baseline-kravene der mulig.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                             | Evidence                                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/admin` shell and every current top-level admin tab have an explicit audit matrix with stable page purpose, active-section label, and no hidden landmark ambiguity.                                           | active brief + e2e audit + queue/design-inventory diff               | `5/5`                   |
| UX flow clarity                               | `target`     | Admin section choices are keyboard-focusable and switchable; active tab/section state remains clear for Content, QR Links, Commerce, Operations, Email templates, Messages, Notes, Categories, and Help/Guide. | Playwright keyboard/focus/tab assertions                             | `5/5`                   |
| Visual design quality                         | `target`     | Covered admin states have no serious/critical axe violations, including contrast; no visible styling change is introduced unless required by a concrete P0/P1 a11y finding.                                    | axe scan + diff/screenshot-decision review                           | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice is read-only by default and changes no persisted admin data, mutation payload, validation contract, publish state, note relation, QR slug, commerce setting, or domain invariant.       | explicit no-data/no-mutation scope review                            | `N/A`                   |
| Admin editor ergonomics                       | `target`     | The audit covers top-level admin navigation ergonomics and must not introduce extra clicks, dead ends, or broken tab switching for existing operator workflows.                                                | Playwright tab-navigation audit + changed-files review               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Admin shell and covered tabs expose one page-level `main`, one H1, keyboard-focusable admin tabs/actions, clear active state, and no serious/critical axe violations when dev-admin fixture is available.      | Playwright + axe + semantic DOM assertions                           | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for the 10/10 critical-category parser; same threshold and evidence as `Accessibility (a11y)`.                                                                                                       | Playwright + axe + semantic DOM assertions                           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No dependency, data-fetch path, visual asset, or bundle-heavy widget should be added; broad gates must stay green.                                                                                             | package diff + `npm run verify:pre-pr`                               | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this audit adds no local storage, server-canonical state, sync trigger, conflict behavior, cache mutation, retention rule, or sensitive data handling.                                             | data-boundary scope rationale                                        | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch/cache/revalidation behavior changes; admin route dynamic mode and API caching behavior are preserved.                                                                                     | cache scope rationale                                                | `N/A`                   |
| Reliability and failure handling              | `target`     | Environment-dependent dev-login/admin-role states skip explicitly instead of failing misleadingly; tab audit waits for active section state deterministically.                                                 | guarded skip contracts + targeted Playwright result                  | `5/5`                   |
| Security and authz                            | `target`     | Authenticated admin coverage uses `/dev/login` only in local test mode, skips when not allowlisted, and commits no secret/raw env value; admin route/authz behavior remains fail-closed.                       | dev-login guard + no-secret diff review + existing admin guard tests | `5/5`                   |
| Privacy and compliance                        | `supporting` | Audit evidence must not expose real user data, admin secrets, raw env values, tokens, email payloads, screenshots of private records, or support-sensitive note contents.                                      | read-only audit design + changed-file review                         | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and design inventory record this active admin-console audit slice and protected out-of-scope areas without stale active references.                                                     | docs diff + `npm run lint:briefs:all`                                | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: existing admin workflows are audited for navigation/accessibility, but CRUD labels, publish/revision flows, note queues, Help/Guide content, and support procedures are unchanged.            | explicit no-workflow-change review                                   | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/admin` is protected/dynamic and this slice changes no public metadata, sitemap, robots, canonical route, or crawlable entity surface.                                                            | SEO scope rationale                                                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public semantic content model, structured data, canonical entity page, or AI-facing documentation contract.                                                                  | AI-discoverability scope rationale                                   | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, conversion metric, or instrumentation behavior changes.                                                                              | analytics scope rationale                                            | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Commerce tab may be audited for semantics, but Stripe Checkout, product catalog truth, entitlement attachment, billing portal, invoices, refunds, and revenue reporting remain unchanged.                      | changed-file review + existing commerce gates                        | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: Notes/Messages/Operations/Help tabs may be audited, but no support workflow, alerting path, operator runbook, incident response process, or support diagnostic field changes.                 | explicit support-ops no-change review                                | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: Commerce tab semantics may be audited, but no billing, invoice, payout, refund, entitlement reconciliation, revenue report, finance export, or reporting data changes.                        | explicit finance no-change review                                    | `5/5`                   |
| i18n operational readiness                    | `supporting` | Assertions use current accessible labels and tab IDs; no locale framework, translation workflow, or grammar-coupled copy change is introduced.                                                                 | selector review + no locale-routing diff                             | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next/Tailwind admin surfaces, `AdminWorkspace`, Playwright, and existing `@axe-core/playwright`; add no dependency or broad primitive.                                                          | package diff + implementation review                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Add a focused Playwright admin-console audit and run targeted validation plus broad pre-PR/pre-merge gates; do not rely on manual inspection for the covered a11y contract.                                    | targeted Playwright + type/lint/pre-pr/pre-merge gates               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | The audit matrix stays bounded to the current top-level admin tabs so it can run in regular gates without becoming a full admin mutation suite.                                                                | route matrix review + test runtime                                   | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes are test/docs and bounded semantic fixes only; any visible fix triggers screenshot stop; broad gate and CI must pass before merge recommendation.                                                      | `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`, PR evidence | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing `/admin` route, `SiteChrome`, and `AdminWorkspace` shell.
  - Preserve server/client boundaries, role resolution, route redirects, dynamic route mode, and API boundaries.
  - Do not change cache, revalidation, actions, or mutation routes.
- TypeScript/domain contracts:
  - No admin data/domain type changes.
  - Test helper code must keep typed tab IDs and explicit skip behavior for unavailable dev-login/admin-role fixtures.
- Supabase/data layer:
  - No migration, RLS/authz contract, generated types, indexes, storage, or data query behavior changes.
  - Dev-login coverage remains local-test-only and must skip safely if unavailable.
- External services/tools:
  - Reuse existing `@axe-core/playwright`.
  - Do not touch Stripe, Supabase provider settings, email provider, analytics, webhooks, secrets, or deployment settings.
- UI system:
  - Mature reference surfaces: `AdminWorkspace` top-level shell, existing admin tab buttons, `SiteChrome` main-landmark ownership, and existing admin manager state/action patterns.
  - Screenshot artifacts: N/A for audit/test-only or non-visual semantic fixes. If any visible layout/color/typography fix becomes necessary, capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.
- Testing:
  - Add focused E2E coverage in `tests/e2e/`.
  - Run targeted Playwright first, then type/brief/diff/sweep checks, then broad gates.

## Data Placement And Sync Contract

N/A with rationale: this audit introduces no local-only data, server-canonical data, browser storage, sync behavior, invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this audit creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, or rename/repurpose behavior.

## Forward Compatibility Contract

- Extensibility surfaces:
  - `/admin` shell, top-level admin tab IDs/labels, active-section panel, admin tab navigation, and admin manager route semantics.
- Source of truth:
  - `TAB_LABELS` in `components/admin/AdminWorkspace.tsx` remains the source of truth for current tab IDs and labels.
  - The audit matrix mirrors those public operator labels in the test so drift is visible.
- Additive behavior:
  - New admin surfaces that reuse `AdminWorkspace`, `SiteChrome`, and existing admin manager state/action patterns inherit the same landmark, H1, active-state, keyboard, and contrast expectations after they are added to the audit matrix.
- Explicit mapping requirements:
  - New admin tabs, renamed tab labels, new operator workflows, new locales, or workflow-changing actions require explicit test/brief/inventory updates before claiming coverage.
- Unknown/deprecated values:
  - Unknown `tab` query values should continue to fall back through `parseAdminTab` to Content.
  - Missing dev-login/admin-role fixtures must skip with a clear reason instead of failing as a product regression.
- Test/evidence:
  - Focused Playwright audit, route/label/support sweep, and updated AW-006 queue/design-inventory evidence.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow labels, recovery instructions, Help/Guide assertions, operator runbooks, or support procedures. If a discovered issue requires changing workflow labels or recovery behavior, update Help/Guide in the same PR or split to a separate brief.

## Route / Label / Support Surface Sweep

Required because this slice audits admin route semantics and operator-facing tab labels.

- Identifiers to search before PR handoff:
  - `AW-006`
  - `Admin Console Accessibility`
  - `Admin console`
  - `Admin sections`
  - `admin-tab-content`
  - `admin-tab-qr-links`
  - `admin-tab-commerce`
  - `admin-tab-operations`
  - `admin-tab-email-templates`
  - `admin-tab-messages`
  - `admin-tab-notes`
  - `admin-tab-categories`
  - `admin-tab-help`
  - `Help/Guide`
- Directories/surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - no Help/Guide/support copy change unless a real workflow label changes,
  - queue/design-inventory update required,
  - no Stripe/Supabase/API/support behavior changes.

## Scope

- Create this in-progress brief.
- Update canonical AW-006 queue and design inventory.
- Add focused Playwright audit coverage for:
  - authenticated `/admin` shell,
  - top-level admin tabs: Content, QR Links, Commerce, Operations, Email templates, Messages, Notes, Categories, Help/Guide,
  - one page-level `main`,
  - one H1,
  - keyboard focus and switching on admin tabs,
  - clear active tab/section state,
  - serious/critical axe violations.
- Fix only concrete P0/P1 accessibility findings discovered by the audit, limited to semantic/focus/contrast issues in the covered admin surfaces.

## Out Of Scope

- Redesign, new admin features, copy rewrites, route/label renames, or broad token/card/layout polish.
- Admin data creation/deletion/mutation coverage in this audit.
- Stripe Checkout, resend payloads, entitlements, invoices, refunds, finance reporting, email delivery, Supabase schema/RLS, auth provider behavior, analytics taxonomy, or API contracts.
- Admin Help/Guide content changes unless a scoped a11y fix requires a label/workflow update.
- Full-site axe scan, every nested admin workflow, or every mutation form state.

## Acceptance Criteria

1. The active brief, canonical AW-006 queue, and design inventory identify this as the current bounded AW-006 admin-console audit slice.
2. Focused Playwright audit covers `/admin` shell and every current top-level admin tab when dev-login/admin-role fixture is available.
3. Covered admin state exposes one page-level `main`, one H1, keyboard-focusable tab choices, deterministic active tab/section state, and no serious/critical axe violations.
4. Environment-dependent dev-login/admin-role states skip with explicit reasons instead of failing misleadingly.
5. No admin data, workflow labels, API behavior, authz, Supabase, Stripe, analytics, Help/Guide, support, or finance behavior changes are introduced.
6. Any visible fix triggers screenshot handoff before `npm run verify:pre-pr`; no screenshot handoff is required for final test/docs-only or non-visual semantic diff.
7. Relevant targeted tests and broad pre-PR/pre-merge gates pass.

## Validation

- Targeted:
  - `npx playwright test tests/e2e/admin-console-a11y-audit.spec.ts --project=desktop-chromium`
  - `./node_modules/.bin/vitest run tests/unit/admin-workspace-shell.test.tsx`
  - `npm run typecheck`
  - `npm run lint:briefs:all`
  - `git diff --check`
  - route/label/support sweep terms listed above
- Before PR update:
  - `npm run verify:pre-pr` - pass (`106 passed`, `530 skipped`, `[verify-open] PASS`; skips are expected for browser/viewport/auth-dependent coverage in the local matrix).
- Before merge recommendation:
  - required GitHub CI green
  - `npm run verify:pre-merge`

## Screenshot / Visual Handoff

Screenshot artifacts: N/A for the expected audit/test-only or non-visual semantic diff because this slice should not change visible layout, color, typography, print, or brand rendering. Owner screenshot approval stop: N/A unless a later patch changes product-rendering files or visible admin pixels. If pixels change later, capture explicit `before-`/`after-` or `after-`/`reference` artifacts before broad gates.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Playwright browser binaries available; install Chromium only if the focused test is blocked by missing browser binaries.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@5898f57 after AW-006 Guide Entitlement And Tracker Accessibility Audit #959 and repo-managed closeout #960; owner explicitly requested AW-006 Admin Console Accessibility Audit + Bounded Fixes | next: add active docs, implement focused admin-console Playwright/axe audit, fix only concrete P0/P1 findings, then run targeted validation before broad gates`
- `2026-06-03 | targeted-validation | added focused admin-console Playwright/axe audit plus deterministic AdminWorkspace unit semantics coverage; local Playwright run skipped explicitly because dev-login/Supabase test auth is unavailable in this environment, while unit shell semantics, typecheck, lint:briefs:all, ESLint on changed tests, route/label/support sweep, and git diff --check passed; no visible UI/style/product-rendering files changed, so screenshot handoff is not required | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-06-03 | pre-pr-green | npm run verify:pre-pr passed full lane on branch aw-006-admin-console-a11y-audit; full Playwright matrix ended with 106 passed and 530 expected skips, including local auth-dependent admin skips; no visible product-rendering/style files changed after targeted validation, so screenshot handoff remains N/A | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
