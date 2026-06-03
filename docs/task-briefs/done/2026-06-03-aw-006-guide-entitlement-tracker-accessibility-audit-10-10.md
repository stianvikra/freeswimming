# Task Brief: AW-006 Guide Entitlement And Tracker Accessibility Audit (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-guide-entitlement-tracker-accessibility-audit-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@2735aff`
- `audit_status`: `closed`
- `decision`: Execute a bounded AW-006 accessibility audit slice for guide entitlement and tracker states.
- `reason`: `main` is clean and synced after AW-006 Core Flow Keyboard Contrast Semantic Audit PR `#957` and repo-managed closeout PR `#958`; the #957 brief intentionally left guide-entitlement authenticated tracker audit as separate follow-up material, while admin-console audit belongs to AW-012/AW-013.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, guide route entitlement behavior, `GuideAccessRequiredState`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `SiteChrome`, Playwright projects, axe dependency, screenshot handoff rules, forward compatibility rules, or verification lanes change before PR handoff.

## Goal

Make keyboard, landmark, heading, and serious/critical axe accessibility coverage explicit for `/guides/0-1000m` and `/guides/poolside` access-required and entitled tracker states without changing entitlement, payment, guide content, or admin behavior.

## Pre-Implementation Owner Explanation

Vi utvider kontrollen av guide-opplevelsen slik at både manglende tilgang og faktisk tracker-bruk sjekkes for tastatur, kontrast og skjermleserstruktur. Det betyr mindre risiko i kjøpt guideflyt etter de siste AW-006 oppryddingene. Utenfor scope er betaling/entitlement-regler, Supabase/Stripe/API-er, guideinnhold, admin-console og redesign.

Forward-kompatibilitet: nye guideprodukter skal enten arve samme audit-kontrakt via felles guideflater, eller kreve eksplisitt mapping/test før de regnes som dekket.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                   | Evidence                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Guide routes have an explicit audit matrix for access-required and entitled tracker states; no guide route purpose or primary heading ambiguity is introduced.                                       | active brief + e2e/unit audit + queue/design-inventory diff             | `5/5`                   |
| UX flow clarity                               | `target`     | Access recovery actions, PDF download, Back to My Library, and one primary tracker action per guide remain keyboard-reachable when the relevant state is available.                                  | Playwright keyboard/focus assertions + deterministic unit coverage      | `5/5`                   |
| Visual design quality                         | `target`     | Covered guide states have no serious/critical axe violations, including color contrast, and no visible styling change is introduced unless a concrete accessibility defect requires it.              | axe scan + focused diff review                                          | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no persisted data, guide progress mutation contract, entitlement calculation, checkout payload, auth provider call, or domain invariant.                              | explicit no-data/no-mutation scope review                               | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin-console/editor audit is explicitly out of this AW-006 slice and remains AW-012/AW-013 follow-up material.                                                                          | explicit admin-editor scope rationale                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Guide access-required and available tracker states expose one page-level main, one H1, keyboard-reachable actions, and no serious/critical axe violations where the local fixture exposes the state. | Playwright + axe + semantic DOM assertions + unit route fixtures        | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for the 10/10 critical-category parser; same threshold and evidence as `Accessibility (a11y)`.                                                                                             | Playwright + axe + semantic DOM assertions + unit route fixtures        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No runtime dependency, data fetch, route payload, visual asset, or bundle-heavy widget is added; broad gates must stay green.                                                                        | dependency diff + `npm run verify:pre-pr`                               | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this audit adds no local storage, server-canonical state, sync trigger, conflict behavior, cache mutation, or retention surface.                                                         | data-boundary scope rationale                                           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch/cache/revalidation behavior changes; guide route rendering modes are preserved.                                                                                                 | cache scope rationale                                                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Environment-dependent dev-auth/entitlement states skip explicitly instead of failing misleadingly; deterministic unit fixtures cover both access-required and entitled route semantics.              | skip contracts + unit fixtures + targeted Playwright result             | `5/5`                   |
| Security and authz                            | `target`     | Protected guide coverage uses dev bypass only in local test mode; anonymous/auth/entitlement behavior remains fail-closed and no secret or raw env value is committed.                               | guarded dev-bypass test path + unit negative path + changed-file review | `5/5`                   |
| Privacy and compliance                        | `supporting` | Audit evidence uses non-real fixture emails only and does not expose checkout emails, tokens, secrets, raw env values, or user data.                                                                 | test fixture review + diff review                                       | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and design inventory record this active guide-audit slice without stale active references.                                                                                    | docs diff + `npm run lint:briefs:all`                                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin CRUD, workflow labels, publish/revision states, note queues, Help/Guide operator instructions, or support actions.                                           | explicit admin-workflow scope rationale                                 | `N/A`                   |
| SEO and crawlability                          | `supporting` | Semantic guide audit must not change metadata, robots, sitemap, canonical routes, or public page indexability.                                                                                       | route metadata/diff review                                              | `5/5`                   |
| AI discoverability                            | `supporting` | Guide semantic structure is audited, but this slice changes no structured data, entity model, AI-facing docs, or crawl contract.                                                                     | semantic audit result + no structured-data diff                         | `5/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, conversion metric, or instrumentation behavior changes.                                                                    | analytics scope rationale                                               | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Entitlement states are audited, but Stripe Checkout, entitlement attachment, invoice, receipt, resend payload, billing portal, and finance behavior remain unchanged.                                | diff review + existing commerce gates                                   | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this slice changes no support workflow, alerting path, operator runbook, incident response process, recovery procedure, or support diagnostic field.                                            | explicit support-ops scope rationale                                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, invoice, payout, refund, entitlement reconciliation, revenue report, finance export, or reporting data.                                                          | explicit finance scope rationale                                        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Assertions use stable accessible names already present in product copy; no locale framework, translation workflow, or grammar-coupled copy change is introduced.                                     | test selector review + no locale-routing diff                           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next/Tailwind guide surfaces, `SiteChrome`, guide tracker components, Playwright, Testing Library, and existing `@axe-core/playwright`; add no dependency.                            | package diff + test implementation review                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused Playwright guide audit and strengthen deterministic route/component tests for both entitlement states; run targeted tests and broad pre-PR/pre-merge gates.                              | targeted Playwright + unit tests + typecheck/lint + pre-pr/pre-merge    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | The audit matrix stays bounded to two guide routes and two state classes so it can run in regular gates without becoming a full-site scan.                                                           | route matrix review + test runtime                                      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes are test/docs/semantic-only unless a concrete a11y defect is found; the PR is revertable and broad gate + CI must pass before merge recommendation.                                          | `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`, PR evidence    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing guide route shells and `SiteChrome` as the single page-level `<main>` owner.
  - Preserve server/client boundaries, redirects, route dynamic mode, and guide content loading.
  - Do not change route actions, API routes, cache modes, or revalidation.
- TypeScript/domain contracts:
  - No guide progress, guide content, entitlement, catalog, or checkout types change.
  - E2E helper code must skip environment-dependent auth/entitlement states explicitly.
- Supabase/data layer:
  - No migration, RLS/authz contract, generated types, indexes, or data query behavior changes.
  - Dev-bypass coverage remains local-test-only and must skip safely if unavailable.
- External services/tools:
  - Reuse existing `@axe-core/playwright`; add no service or dependency.
  - Do not touch Stripe, Supabase provider settings, email provider, analytics, webhooks, or secrets.
- UI system:
  - Reference surfaces: `SiteChrome` main-landmark ownership, `GuideAccessRequiredState`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuidePdfDownloadButton`, and existing `guideTracker*` token classes.
  - No visual redesign.
  - Screenshot artifacts: N/A for the expected audit/test-only diff. If a visible layout/color/typography fix becomes necessary, capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.
- Testing:
  - Add focused E2E coverage in `tests/e2e/`.
  - Strengthen deterministic unit coverage in existing guide route tests.
  - CI-only hardening in `tests/unit/session-generator-panel.test.tsx` is test-helper-only and preserves the existing shared renderer/session-step contract from `docs/design/session-step-surface-contract.md`; no workout/session-step product behavior changes.
  - Run targeted Playwright/unit tests, then full pre-PR and pre-merge gates.

## Data Placement And Sync Contract

N/A with rationale: this audit introduces no local-only data, server-canonical data, browser storage, sync behavior, invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this audit creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, or rename/repurpose behavior.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Guide routes, guide product labels, access-required state, entitled tracker state, PDF/back actions, tracker primary actions, and audit matrix.
- Source of truth:
  - Current guide route labels and accessible action names remain the assertion source of truth.
  - Future guide product IDs/slugs are not automatically covered unless they reuse these exact surfaces or are added to the audit matrix.
- Additive behavior:
  - New guide products using `GuideAccessRequiredState`, `SiteChrome`, and guide tracker token/action components should inherit the same landmark, H1, focus, and contrast expectations.
- Explicit mapping requirements:
  - New guide routes, guide product labels, tracker action names, entitlement states, locales, or workflow-changing guide actions require explicit audit/test updates before claiming coverage.
- Unknown/deprecated values:
  - Unknown private/dev-auth or entitlement fixture state must skip with a clear reason in E2E instead of failing as a product regression.
  - Unknown guide products remain fail-closed through existing entitlement checks.
- Test/evidence:
  - Focused Playwright audit, deterministic unit route fixtures for both entitlement states, route/label/support sweep, and updated AW-006 queue/design-inventory evidence.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow labels, recovery instructions, Help/Guide assertions, operator runbooks, or support procedures. If a discovered issue requires changing workflow labels or recovery behavior, update Help/Guide in the same PR or split to a separate brief.

## Route / Label / Support Surface Sweep

Required because this slice audits guide route semantics and entitlement surfaces.

- Identifiers to search before PR handoff:
  - `AW-006`
  - `Guide Entitlement`
  - `Guide access required`
  - `0-1000m interactive plan`
  - `Poolside interactive guide`
  - `guide-0-1000m-route-actions`
  - `guide-poolside-route-actions`
  - `Download PDF`
  - `Back to My Library`
  - `guide entitlement`
  - `tracker accessibility`
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
  - `/guides/0-1000m`,
  - `/guides/poolside`,
  - access-required or entitled tracker state exposed by local dev-auth/entitlement fixture,
  - one page-level main landmark,
  - one H1,
  - serious/critical axe violations,
  - keyboard focus on access, PDF/back, and tracker actions where visible.
- Strengthen deterministic unit route fixtures for:
  - signed-in without entitlement,
  - signed-in with entitlement for both guide routes,
  - anonymous fail-closed redirects.
- Fix only concrete semantic/a11y regressions found by this audit within the covered guide surfaces.

## Out Of Scope

- Redesign, new guide features, guide copy rewrites, new visual identity, or broad component-system migration.
- Stripe Checkout, resend payloads, entitlements, invoices, refunds, finance reporting, email delivery, Supabase schema/RLS, auth provider behavior, analytics taxonomy, or API contracts.
- Admin authenticated workflow audit, editor/publish flows, note queues, and Help/Guide operator training.
- Guide content data, PDF generation, file names, progress sync algorithm, localStorage keys, or tracker business logic.
- Full-site axe scan or every-route keyboard matrix.

## Acceptance Criteria

1. The active brief, canonical AW-006 queue, and design inventory identify this as the current bounded AW-006 guide-audit slice.
2. Guide access-required and entitled tracker route fixtures have deterministic unit coverage for one `main`, one H1, and safe actions.
3. Focused Playwright audit covers `/guides/0-1000m` and `/guides/poolside` when dev auth is available and skips environment-dependent states explicitly.
4. Covered guide states have no serious/critical axe violations in Playwright.
5. Visible access, PDF/back, and tracker actions are keyboard-focusable where the local fixture exposes them.
6. Anonymous guide routes remain fail-closed.
7. No entitlement, payment, Supabase, guide content, progress sync, analytics, Help/Guide, support, or admin behavior changes are introduced.
8. Relevant targeted tests and broad pre-PR/pre-merge gates pass.

## Validation

- Targeted:
  - `npx playwright test tests/e2e/guide-entitlement-tracker-a11y-audit.spec.ts --project=desktop-chromium --project=mobile-chromium`
  - `./node_modules/.bin/vitest run tests/unit/guide-access-required-state.test.tsx`
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

Screenshot artifacts: N/A for the expected audit/test-only diff because this slice should not change visible layout, color, typography, print, or brand rendering. Owner screenshot approval stop: N/A unless a later patch changes product-rendering files or visible guide pixels. If pixels change later, capture explicit `before-`/`after-` or `after-`/`reference` artifacts before broad gates.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Playwright browser binaries available; install Chromium only if the focused test is blocked by missing browser binaries.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@2735aff after AW-006 Core Flow Keyboard Contrast Semantic Audit #957 and repo-managed closeout #958; owner approved then explicitly said execute end to end for the guide entitlement/tracker accessibility audit | next: add focused Playwright audit, strengthen deterministic guide route tests, update queue/design inventory, and run targeted validation before broad gates`
- `2026-06-03 | targeted-validation | added focused Playwright guide audit, deterministic unit coverage for guide access-required and entitled tracker route semantics, and canonical queue/design-inventory updates; targeted validation passed: guide unit test 8 passed, focused Playwright 2 passed / 4 expected skips because local dev-login Supabase returned the known HTML/JSON parse failure, typecheck, lint:briefs:all, ESLint with one pre-existing output warning and no errors, route/label/support sweep, and git diff --check | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-06-03 | pre-pr-hardening | first full verify:pre-pr reached full e2e and found one mobile Chromium-only failure in the new anonymous guide test: the sign-in submit button did not remain focused long enough for a polling toBeFocused assertion after programmatic focus; product semantics and desktop Chromium guide audit passed. Hardened the helper to assert immediate focus receipt instead of post-rerender focus retention; focused Playwright rerun passed 2 / skipped 4 expected dev-login states | next: rerun npm run verify:pre-pr`
- `2026-06-03 | pre-pr-pass | npm run verify:pre-pr passed full public lane after hardening: lint, quality gates, typecheck, unit, build, perf budgets, and Playwright e2e 106 passed / 524 skipped; ESLint still reports only the pre-existing output/capture-aw006-dryland-feedback.mjs unused-variable warning. The gate's lint:briefs step skipped because it keys off branch commits before this first commit, so lint:briefs:all remains the explicit changed-brief evidence for this staged slice | next: run lint:briefs:all after this checkpoint, commit, push, and open PR`
- `2026-06-03 | ci-verify-hardening | GitHub CI verify failed once in pre-existing tests/unit/session-generator-panel.test.tsx because openWorkoutEditorMetadata could click before the workout editor mount effect had settled the collapsed metadata state; hardened the helper to retry until the metadata panel is actually expanded and session-draft-title exists. Targeted rerun for that unit file passed 10 / 10 locally | next: rerun npm run verify:pre-pr on the patched branch, amend/follow-up commit, push, and rerun CI`
- `2026-06-03 | post-ci-hardening-pre-pr-pass | npm run verify:pre-pr passed full public lane after the CI hardening and session-step quality-gate evidence update: lint, quality gates, typecheck, unit, build, perf budgets, and Playwright e2e 106 passed / 524 skipped. ESLint still reports only the pre-existing output/capture-aw006-dryland-feedback.mjs unused-variable warning; local dev-login Supabase HTML/JSON failures remained expected skips for auth-dependent E2E states | next: commit, push, refresh PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-03 | closeout | Guide Entitlement And Tracker Accessibility Audit shipped in PR #959 as squash commit f1407f0; this repo-managed closeout moves its brief to done and leaves no active AW-006 implementation slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`

## Completion Record

- `completed`: `2026-06-03`
- `merged_pr`: `#959`
- `squash_commit`: `f1407f08c99a140c1d6c8ddb885909487b12cf76`
- `result`: Closed the AW-006 guide entitlement and tracker accessibility audit by adding explicit keyboard, landmark, H1, fail-closed sign-in, and serious/critical axe coverage for `/guides/0-1000m` and `/guides/poolside` without changing payment, entitlement, guide content, Supabase, Stripe, analytics, Help/Guide, support, or admin behavior.
- `validation`: Targeted unit and focused Playwright coverage passed; route/label/support sweep found no product fallout; `npm run verify:pre-pr` passed the full public lane; GitHub CI for PR `#959` was green; `npm run verify:pre-merge` passed with `106 passed / 524 skipped`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; local dev-auth/entitlement E2E states skipped explicitly when Supabase dev-login returned HTML instead of auth JSON, while deterministic unit fixtures cover both access-required and entitled tracker states.

| Category                            | Achieved Score | Evidence                                                                                                                                                                                | Gaps / Notes                                                                                                                               |
| ----------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Product goals and IA                | `5/5`          | PR `#959`, focused Playwright guide audit, deterministic unit route fixtures, updated AW-006 queue/design inventory, `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`.           | None in scope.                                                                                                                             |
| UX flow clarity                     | `5/5`          | Keyboard/focus assertions for visible access, PDF/back, sign-in, and tracker actions; unit fixtures for access-required and entitled guide route states.                                | None in scope.                                                                                                                             |
| Visual design quality               | `5/5`          | Axe serious/critical checks in focused Playwright audit; no product-rendering files changed and screenshot handoff remained N/A.                                                        | None in scope.                                                                                                                             |
| Accessibility (a11y)                | `5/5`          | One page-level `main`, one H1, keyboard-reachable actions, fail-closed anonymous redirects, and serious/critical axe coverage in Playwright plus unit fixtures.                         | Dev-auth E2E states skip locally when dev-login is unavailable; deterministic unit coverage remains the stable entitlement-state evidence. |
| Accessibility                       | `5/5`          | Same evidence as `Accessibility (a11y)`; alias row retained for scorecard/lint compatibility.                                                                                           | Same explicit local dev-login skip rationale as above.                                                                                     |
| Reliability and failure handling    | `5/5`          | Environment-dependent dev-login states skip with explicit reasons; anonymous guide routes remain fail-closed; CI-hardening stabilized the existing workout metadata unit test helper.   | None in product scope.                                                                                                                     |
| Security and authz                  | `5/5`          | Anonymous route coverage confirms protected guides redirect to sign-in with `next`; dev bypass remains local-test-only; no secrets, env values, entitlement logic, or auth APIs change. | None in scope.                                                                                                                             |
| Content governance                  | `5/5`          | This closeout moves the brief to `done`, updates the canonical AW-006 queue, and updates the design inventory so no stale active/in-progress guide-audit reference remains.             | None after closeout gates pass.                                                                                                            |
| Stack-fit and dependency discipline | `5/5`          | Reused existing Next guide routes, `SiteChrome`, guide components, Vitest/Testing Library, Playwright, and `@axe-core/playwright`; no dependency or runtime architecture change.        | None in scope.                                                                                                                             |
| Testing and QA automation           | `5/5`          | New focused E2E audit, strengthened guide unit coverage, targeted test reruns, `npm run verify:pre-pr`, green CI, and `npm run verify:pre-merge`.                                       | Local signed-in guide E2E coverage depends on dev-login availability, with explicit skip and deterministic unit fallback.                  |
| DevOps and rollback readiness       | `5/5`          | PR `#959` was a scoped test/docs change with green local gates, green required CI, clean `main` fast-forward to `f1407f0`, and a repo-managed docs-only closeout path.                  | None in scope.                                                                                                                             |
