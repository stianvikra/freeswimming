# Task Brief: AW-006 Core Flow Keyboard Contrast Semantic Audit (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-core-flow-keyboard-contrast-semantic-audit-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@2ed810a`
- `audit_status`: `ready`
- `decision`: Execute a bounded AW-006 audit slice for keyboard, contrast, and semantic regressions across core flows.
- `reason`: `main` is clean and synced after My Library Dashboard Desktop Value Hierarchy PR `#955` and repo-managed closeout PR `#956`; post-merge preflight is green with no active AW-006 product/UI slice. The canonical queue still lists keyboard, contrast, and semantic audit as remaining advanced refinement work after the smaller token/action and desktop hierarchy slices.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `SiteChrome`, `Modal`, `MenuDrawer`, `MobileSegmentedNav`, auth/recovery route semantics, My Library dev-auth test setup, Playwright projects, axe dependency, screenshot handoff rules, forward compatibility rules, or verification lanes change before PR handoff.

## Goal

Make keyboard operability, visible focus, semantic landmarks/headings, and serious/critical contrast accessibility regressions measurable for the current core route set without changing business behavior.

## Pre-Implementation Owner Explanation

Vi går gjennom de viktigste brukerflytene med tastatur, fokus, skjermleser-semantikk og kontrast etter alle siste visuelle oppryddinger. Det betyr automatisert kontroll av de mest brukte sidene og små semantikkfikser der testen finner konkrete feil. Utenfor scope er redesign, nye funksjoner, Stripe/Supabase/API-endringer, betalings-/entitlement-logikk, adminrolledata og bred Help/Guide-omskriving.

Forward-kompatibilitet: nye kjerneflyter skal enten arve eksisterende semantikk og knapp-/feltmønstre automatisk, eller legges eksplisitt inn i audit-matrisen før de regnes som dekket.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                         | Evidence                                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Core public/auth/recovery/member entry flows have a named audit matrix and no hidden route-purpose or landmark ambiguity in covered routes.                                                | audit spec + queue/design-inventory diff + route review                | `5/5`                   |
| UX flow clarity                               | `target`     | Header menu, primary recovery/auth actions, and My Library entrypoints remain keyboard-visible and not dead-ended on covered flows; existing mobile nav semantics remain unchanged.        | Playwright keyboard assertions + route assertions + broad mobile tests | `5/5`                   |
| Visual design quality                         | `target`     | Covered routes have no serious/critical axe violations, including color-contrast violations, and no visible focus regression from the scoped fixes.                                        | axe scan + focused visual/focus review                                 | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no persisted data, mutation contract, entitlement calculation, checkout payload, auth provider call, or domain invariant.                                   | explicit no-data/no-mutation scope review                              | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin operator edit/publish workflows and admin role data are outside this AW-006 core-flow audit; authenticated admin-console audit belongs to AW-012/AW-013 follow-up scope. | explicit admin-editor scope rationale                                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Covered routes pass serious/critical axe checks; header menu is keyboard open/closeable with focus restoration; nested-main regressions are removed.                                       | Playwright + axe + semantic DOM assertions                             | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for the 10/10 critical-category parser; same threshold and evidence as `Accessibility (a11y)`.                                                                                   | Playwright + axe + semantic DOM assertions                             | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No runtime dependency, route data fetch, bundle-heavy widget, or visual asset is added; broad pre-PR perf budgets must remain green.                                                       | dependency diff + `npm run verify:pre-pr`                              | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice adds no local storage, server-canonical state, sync trigger, conflict behavior, cache mutation, or retention surface.                                               | data-boundary scope rationale                                          | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch/cache/revalidation behavior changes; route rendering modes are preserved.                                                                                             | cache scope rationale                                                  | `N/A`                   |
| Reliability and failure handling              | `target`     | The audit must skip environment-dependent private flows explicitly, not fail with misleading errors; public/auth/recovery coverage must be deterministic in local Playwright.              | test skip contracts + targeted Playwright result                       | `5/5`                   |
| Security and authz                            | `target`     | Protected My Library coverage may use dev bypass only in local test mode; anonymous/auth/admin redirects remain fail-closed and no secret or raw env value is committed.                   | dev-bypass guarded test path + changed-file review                     | `5/5`                   |
| Privacy and compliance                        | `supporting` | Recovery copy and generic privacy behavior are preserved; audit evidence must not reveal checkout emails, tokens, secrets, raw env values, or real user data.                              | test fixtures use non-real placeholder emails + diff review            | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and design inventory record this active audit slice and protected out-of-scope areas without stale active references.                                               | docs diff + `npm run lint:briefs:all`                                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice does not change admin CRUD, workflow labels, publish/revision states, note queues, Help/Guide operator instructions, or support actions.                            | explicit admin-workflow scope rationale                                | `N/A`                   |
| SEO and crawlability                          | `supporting` | Semantic landmark cleanup must not change metadata, robots, sitemap, canonical routes, or public page indexability.                                                                        | route metadata/diff review                                             | `5/5`                   |
| AI discoverability                            | `supporting` | Public semantic structure is audited, but this slice changes no structured data, entity model, AI-facing docs, or crawl contract.                                                          | semantic audit result + no structured-data diff                        | `5/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, conversion metric, or instrumentation behavior changes.                                                          | analytics scope rationale                                              | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Checkout/recovery semantics may be audited, but Stripe Checkout, entitlement attachment, invoice, receipt, resend payload, and finance behavior remain unchanged.                          | diff review + existing commerce tests/gates                            | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this slice changes no support workflow, alerting path, operator runbook, incident response process, recovery procedure, or support diagnostic field.                                  | explicit support-ops scope rationale                                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, invoice, payout, refund, entitlement reconciliation, revenue report, finance export, or reporting data.                                                | explicit finance scope rationale                                       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Covered selectors and assertions should rely on stable accessible names already present in product copy; no new locale framework or translation workflow is introduced.                    | test selector review + no locale-routing diff                          | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next/Tailwind semantics, `SiteChrome`, `Modal`, `MobileSegmentedNav`, Playwright, and existing `@axe-core/playwright`; add no dependency.                                   | package diff + test implementation review                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add a focused Playwright audit for core routes, keyboard menu behavior, and optional dev-bypass My Library coverage; keep existing mobile nav tests as supporting regression coverage.     | targeted Playwright + typecheck/lint + pre-PR/pre-merge gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | The audit matrix must stay small and bounded so it can run in regular gates without turning AW-006 into an expensive full-site scan.                                                       | route matrix review + test runtime                                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes are test/docs/semantic-only and revertable in one PR; broad gate and CI must pass before merge recommendation.                                                                     | `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`, PR evidence   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing route shells and components.
  - Preserve `SiteChrome` as the single page-level `<main>` landmark.
  - Do not change server/client boundaries, route cache modes, redirects, or actions.
- TypeScript/domain contracts:
  - No domain types or validation contracts change.
  - E2E helper code must keep deterministic skip behavior for environment-dependent auth flows.
- Supabase/data layer:
  - No migration, RLS/authz contract, generated types, indexes, or data query behavior changes.
  - Dev-bypass coverage remains local-test-only and must skip safely if unavailable.
- External services/tools:
  - Reuse existing `@axe-core/playwright`; add no service or dependency.
  - Do not touch Stripe, Supabase provider settings, email provider, analytics, webhooks, or secrets.
- UI system:
  - Reference surface: `SiteChrome` owns the single page-level `main` landmark; `Modal`/`MenuDrawer` own the labelled navigation dialog and focus trap; `MobileSegmentedNav` owns active mobile nav semantics.
  - No visual redesign.
  - Use existing token classes and keep route styling unchanged.
  - Screenshot artifacts: N/A for this implementation because the scoped route changes replace nested child `<main>` tags with same-class `<section>` tags only; no visible layout, color, typography, print, or brand pixels change.
  - Owner screenshot approval stop: N/A for this semantic-only pass. If any visible layout/color change becomes necessary, capture screenshot handoff and stop for owner screenshot approval before `npm run verify:pre-pr`.
  - Screenshot comparison naming: N/A because there is no before/after or after/reference visual comparison for the final scoped diff; if pixels change later, use `before-`/`after-` or `after-`/`reference-` filenames per repo rule.
- Testing:
  - Add focused E2E coverage in `tests/e2e/`.
  - Run targeted Playwright on desktop/mobile where applicable, then full pre-PR and pre-merge gates.

## Data Placement And Sync Contract

N/A with rationale: this audit introduces no local-only data, server-canonical data, browser storage, sync behavior, invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this audit creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, or rename/repurpose behavior.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Core route audit matrix, accessible route headings, header menu semantics, supporting mobile nav active semantics, and optional signed-in My Library test entry.
- Source of truth:
  - Current route labels and accessible names remain the source of truth for assertions.
  - Future core routes are not automatically covered unless they are added to the audit matrix.
- Additive behavior:
  - New buttons/links inside covered route shells should inherit existing keyboard/focus and contrast guarantees from shared primitives.
  - New mobile nav items should expose `aria-current="page"` through `MobileSegmentedNav` when active.
- Explicit mapping requirements:
  - New primary public routes, new auth/recovery routes, new admin operator surfaces, guide-entitlement fixtures, locales, or workflow-changing actions require explicit audit matrix/test updates before claiming coverage.
- Unknown/deprecated values:
  - Unknown private/dev-auth state must skip with a clear reason rather than failing as a product regression.
  - Unknown route destinations must stay fail-closed through existing auth redirect behavior.
- Test/evidence:
  - Focused Playwright audit, route/label/support sweep, and updated AW-006 queue/design-inventory evidence.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow labels, recovery instructions, Help/Guide assertions, operator runbooks, or support procedures. If a discovered issue requires changing workflow labels or recovery behavior, update Help/Guide in the same PR or split to a separate brief.

## Route / Label / Support Surface Sweep

Required because this slice audits route semantics and recovery/auth surfaces.

- Identifiers searched before PR handoff:
  - `AW-006`
  - `core flow`
  - `keyboard`
  - `contrast`
  - `semantic`
  - `aria-current`
  - `Navigation menu`
  - `checkout-success-page`
  - `claim-page`
  - `auth-sign-in`
  - `my-library`
- Directories/surfaces checked:
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
  - serious/critical axe violations on covered routes,
  - one visible heading and one page-level main landmark contract,
  - keyboard-open/close behavior for the header navigation menu,
  - existing mobile nav active semantics as supporting evidence through the broad gate,
  - optional signed-in My Library coverage through guarded dev bypass.
- Fix only concrete semantic/a11y regressions found by this audit within the covered routes.

## Out Of Scope

- Redesign, new features, copy rewrites, new visual identity, or broad component-system migration.
- Stripe Checkout, resend payloads, entitlements, invoices, refunds, finance reporting, email delivery, Supabase schema/RLS, auth provider behavior, analytics taxonomy, or API contracts.
- Admin authenticated workflow audit, editor/publish flows, note queues, and Help/Guide operator training.
- Guide-entitlement authenticated tracker audit; that requires owned entitlement fixtures and should be a separate slice.
- Full-site axe scan or every-route keyboard matrix.

## Acceptance Criteria

1. The active brief, canonical AW-006 queue, and design inventory identify this as the current bounded AW-006 audit slice.
2. Covered public/auth/recovery routes have no serious/critical axe violations in the focused Playwright audit.
3. Covered route shells expose a single page-level `main` landmark through `SiteChrome`; nested route-level `<main>` regressions are removed where found.
4. Header navigation menu opens with keyboard, exposes a labelled dialog, closes with Escape, and restores focus to the trigger.
5. Existing mobile bottom-nav semantics remain unchanged and covered by the broad Playwright gate.
6. Signed-in My Library audit runs through dev bypass when available and skips with an explicit reason when unavailable.
7. No visual redesign, business logic, auth, Stripe, Supabase, analytics, Help/Guide, or support behavior changes are introduced.
8. Relevant targeted tests and broad pre-PR/pre-merge gates pass.

## Validation

- Targeted:
  - `npx playwright test tests/e2e/core-flow-a11y-audit.spec.ts --project=desktop-chromium --project=mobile-chromium`
  - `npm run typecheck`
  - `npm run lint:briefs:all`
  - `git diff --check`
  - route/label/support sweep terms listed above
- Before PR update:
  - `npm run verify:pre-pr`
- Before merge recommendation:
  - required GitHub CI green
  - `npm run verify:pre-merge`

## Screenshot / Visual Handoff

Screenshot artifacts: N/A for the current final diff because the product-rendering change is semantic-only (`main` to same-class `section` on recovery routes) and the targeted Playwright audit verifies the original failure mode directly through landmarks and axe. Owner screenshot approval stop: N/A unless a later patch changes visible layout, color, typography, print, or brand rendering. Screenshot comparison naming: N/A because there is no before/after or after/reference visual artifact set for this semantic-only change; if pixels change later, capture explicit `before-`/`after-` or `after-`/`reference-` artifacts before broad gates.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Playwright browser binaries available; install Chromium only if the focused test is blocked by missing browser binaries.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@2ed810a after My Library Dashboard Desktop Value Hierarchy #955 and repo-managed closeout #956; selected Core Flow Keyboard Contrast Semantic Audit as the next AW-006 slice after owner explicitly said execute | next: add focused Playwright audit, fix scoped semantic regressions if found, update queue/design inventory, then run targeted validation before broad gates`
- `2026-06-03 | targeted-validation | added focused Playwright axe/keyboard/semantic audit, removed nested route-level main landmarks from checkout success and claim recovery while preserving styling, updated canonical queue/design inventory, and passed targeted Playwright (2 passed / 4 expected skips), typecheck, lint:briefs:all, route/label/support sweep, and git diff --check | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-06-03 | merged | PR #957 merged as squash commit 9f6f8e5 after local pre-PR, CI, and pre-merge gates passed | next: repo-managed docs-only closeout moves this brief to done and clears stale active queue/inventory references`

## Completion Record

- `completed`: `2026-06-03`
- `merged_pr`: `#957`
- `squash_commit`: `9f6f8e5`
- `result`: Closed AW-006 Core Flow Keyboard Contrast Semantic Audit by making keyboard operation, semantic landmarks, H1 structure, and serious/critical axe accessibility regressions measurable for core public/auth/recovery flows. Removed nested route-level `main` landmarks on checkout success and claim recovery while preserving visible styling and business behavior.
- `validation`: Targeted Playwright audit passed (`2 passed / 4 expected skips`); `npm run typecheck`, `npm run lint:briefs:all`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, PR #957 CI, and `npm run verify:pre-merge` all passed before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                            | Achieved Score | Evidence                                                                                            | Gaps / Notes |
| ----------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                | `5/5`          | Core route audit matrix, PR #957 diff, queue/design inventory update, and green gates.              | None.        |
| UX flow clarity                     | `5/5`          | Header menu keyboard open/close/focus restoration assertions and broad E2E gate.                    | None.        |
| Visual design quality               | `5/5`          | Serious/critical axe checks covered contrast; no visible styling changed.                           | None.        |
| Accessibility (a11y)                | `5/5`          | Playwright/axe route audit, single-main assertions, H1 assertions, and keyboard coverage.           | None.        |
| Accessibility                       | `5/5`          | Alias closeout row for the 10/10 critical-category parser; same evidence as `Accessibility (a11y)`. | None.        |
| Reliability and failure handling    | `5/5`          | Environment-dependent signed-in audit skips explicitly when dev auth is unavailable.                | None.        |
| Security and authz                  | `5/5`          | Dev-bypass path remains guarded; auth redirects and protected behavior were preserved.              | None.        |
| Content governance                  | `5/5`          | Brief, queue, and design inventory record the completed audit slice.                                | None.        |
| Stack-fit and dependency discipline | `5/5`          | Reused existing Playwright/axe and route semantics; no dependency was added.                        | None.        |
| Testing and QA automation           | `5/5`          | Focused E2E audit plus full local/CI/pre-merge validation passed.                                   | None.        |
| DevOps and rollback readiness       | `5/5`          | One squash commit, no migration/config/dependency change, and green merge gates.                    | None.        |
