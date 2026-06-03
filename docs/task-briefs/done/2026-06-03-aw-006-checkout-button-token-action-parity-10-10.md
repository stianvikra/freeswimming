# Task Brief: AW-006 Checkout Button Token And Action Parity (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-checkout-button-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-checkout-button-token-action-parity`
- `execution_mode`: `owner-approved implementation; stop after screenshot handoff for owner approval before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@d257804`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice through screenshot handoff.
- `reason`: `main` is clean and synced after Program Builder Inner Planner And Export Panel Token/Input/Action Parity PR `#973` and repo-managed closeout PR `#974`; post-merge preflight was reported green with no active AW-006 product/UI slice. A fresh queue/design/code re-audit found `CheckoutButton` still using route-local `rounded-xl bg-blue-600` styling while adjacent commerce and recovery surfaces already use `fs-cta-*` token/action classes.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/plans`, `/my-library`, `CheckoutButton`, commerce catalog/checkout/portal/download-resend contracts, Stripe integration rules, mobile action layout rules, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff.

## Goal

Align the shared `CheckoutButton` primary action presentation with the current AW-006 token/action hierarchy on `/plans` and My Library explore, and make the `/plans` visible purchase CTA product-specific without changing checkout behavior.

## Pre-Implementation Owner Explanation

Vi rydder kjopsknappen slik at den bade ser ut som resten av appens moderne primarknapper og sier tydeligere hva kunden kjoper, for eksempel `Buy Poolside guide`. Det betyr noe fordi checkout er en tillitskritisk flate, og gammel knappetekst forklarte teknikken bak betalingen mer enn verdien kunden velger.

Utenfor scope er Stripe/API, priser, produkter, entitlements, analytics, checkout-flyt, forklaringstekster rundt Stripe/trygghet, supportflyt, `PortalButton`, `DownloadResendForm`, unavailable-produktknappen, Habits-funn og bred commerce-polish.

Fremoverkompatibilitet: nye produkter som bruker `CheckoutButton` skal automatisk arve samme token-stil og mobilbredde, og `/plans` skal automatisk lage `Buy <produktnavn>` fra produktets katalogtittel. Nye betalingsmodeller, checkout-destinasjoner, produktkort-redesign, analytics payloads eller recovery-flyter krever eksplisitt mapping, tester og screenshot-evidence senere.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Commerce and revenue ops`
- `Finance and reporting operations`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/plans` remains the public purchase-comparison route and My Library explore remains the member upsell surface; this slice only changes the shared checkout action style.         | component diff + screenshots                | `5/5`                   |
| UX flow clarity                               | `target`     | Available products still expose one clear product-specific checkout action; pending/error feedback and checkout handoff status labels remain unchanged.                           | focused unit tests + screenshot QA          | `5/5`                   |
| Visual design quality                         | `target`     | `CheckoutButton` uses `fs-cta-primary`, current focus/disabled treatment, and mobile `w-full sm:w-auto` behavior with no desktop/mobile text overflow.                            | class assertions + before/after screenshots | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Product ID, cancel path tracking, pending/error state, response handling, and `window.location.assign` behavior are unchanged.                                                    | focused unit tests + changed-files review   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this commerce UI slice changes no admin editor, CRUD workflow, publish flow, operator queue, or admin action surface.                                                 | explicit admin-editor scope rationale       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Button name, disabled state, focus-visible ring, feedback `aria-describedby`, `role=status`, and `aria-live=polite` stay intact.                                                  | Testing Library assertions + screenshot QA  | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for the 10/10 critical-category parser; same threshold and evidence as `Accessibility (a11y)`.                                                                          | Testing Library assertions + screenshot QA  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, API call, polling, state model, or route payload growth beyond class consolidation in an existing client component.                                   | dependency diff + broad gate                | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local storage, server-canonical data, sync trigger, conflict policy, cache invalidation, retention, or sensitive data boundary changes.                            | data-boundary scope review                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, mutation response, or stale-data behavior changes.                                                             | changed-files review                        | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing checkout pending and recoverable API-error feedback still render; failed checkout start still resets pending and preserves retry ability.                                | focused unit tests                          | `5/5`                   |
| Security and authz                            | `target`     | Existing checkout API route, auth/entitlement boundaries, hosted checkout destination validation, and client-side redirect behavior are untouched.                                | changed-files review + existing test scope  | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this changes no user data fields, logs, legal copy, consent behavior, telemetry payloads, secrets, provider data, or sensitive diagnostics.                           | privacy scope rationale                     | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected checkout-button parity slice without stale active-slice references.                           | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable admin field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support step.        | explicit admin-workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public metadata, sitemap, robots, canonical URL, structured page copy, route availability, or indexability.                                           | SEO scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                        | AI-discoverability scope rationale          | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing `upsell_accepted` payload and checkout cancel tracking parameters stay unchanged; no event taxonomy or payload expansion is introduced.                                  | focused unit tests + changed-files review   | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Existing hosted Checkout Sessions path, product ID, cancel path, available-product behavior, and unavailable-product behavior remain unchanged.                                   | focused unit tests + Stripe scope review    | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                     | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `target`     | No Stripe API/session payload, price, entitlement, invoice, refund, payout, report, or reconciliation behavior changes; finance truth remains exactly as before.                  | changed-files review + Stripe scope review  | `5/5`                   |
| i18n operational readiness                    | `target`     | Default, custom, and product-title-derived checkout labels remain layout-safe on mobile and desktop through full-width mobile action behavior and no fixed-width copy assumption. | screenshot text-fit review + class tests    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `CheckoutButton`, `fs-cta-primary`, Tailwind variables, Testing Library tests, and current Stripe-hosted checkout integration; add no dependency.                  | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused `CheckoutButton` tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, then stop before `verify:pre-pr` until approval.           | test commands + screenshots + later gates   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: shared button presentation scales to additional catalog products without adding service calls, storage, polling, providers, or traffic-dependent cost.           | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                             | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/plans` as the public purchase-comparison route and My Library explore as the existing member upsell surface.
  - Reuse `CheckoutButton` as the shared client component; do not move checkout state, analytics, cancel-path tagging, fetch logic, or redirect behavior into route-local wrappers.
  - Preserve route rendering, catalog loading, checkout API route, cache behavior, and existing analytics mount/cancel tracking.
- TypeScript/domain contracts:
  - Preserve `productId`, `cancelPath`, `analyticsSource`, `label`, and `className` props.
  - Generate `/plans` CTA copy from the product title with a safe generic fallback, not from today-only product IDs.
  - Preserve `CheckoutResponse` interpretation, pending/error transitions, and fallback error text.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - Stripe best-practice baseline remains hosted Checkout Sessions for the existing one-time purchase flow.
  - No Stripe SDK/API version, Checkout Session payload, webhook, idempotency, retry, secret, finance, or entitlement behavior changes.
- UI system:
  - Mature reference surfaces: `PortalButton`, `DownloadResendForm`, `/checkout/success`, `/claim`, My Library token actions, `fs-cta-primary`, `fs-cta-secondary`, and `components/ui/actionLayout.ts`.
  - Use shared token classes instead of route-local `rounded-xl bg-blue-600`.
  - Screenshot handoff type: `before/after` for `/plans` desktop and mobile. My Library explore is covered by unit tests unless local dev-auth fixture is already straightforward during screenshot capture.
- Testing:
  - Update `tests/unit/checkout-button.test.tsx` for token classes, full-width mobile behavior, focus/disabled class continuity, feedback semantics, analytics, and unchanged checkout request body.
  - Preserve existing commerce route tests; add no e2e unless focused validation reveals a behavior regression.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, or rename/repurpose behavior. Existing `productId` values pass through unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Commerce catalog products rendered through `CheckoutButton`.
  - Existing checkout default label, `/plans` product-title CTA labels, cancel-path source tags, and analytics source values.
- Source of truth:
  - Product availability, titles, IDs, prices, purchase models, and Stripe mappings remain owned by the existing commerce catalog/server/API contracts.
  - `CheckoutButton` remains the shared presentation and action handoff for available products.
- Additive behavior:
  - New catalog products that render `CheckoutButton` inherit `fs-cta-primary`, mobile full-width behavior, focus styles, disabled styles, pending/error feedback, analytics call, and cancel-path tagging.
  - New `/plans` catalog products get `Buy <product title>` CTA copy automatically when the title is present.
- Explicit mapping requirements:
  - New payment models, checkout destinations, destructive payment actions, analytics source values, non-product-title checkout copy changes, unavailable-product behavior, or non-hosted Stripe UI require explicit mapping, tests, and docs before release.
- Unknown or deprecated values:
  - Existing checkout API and catalog guards remain the fail-closed behavior for unavailable or unmapped products; this slice does not add a new fallback path.
- Test/evidence:
  - Focused `CheckoutButton` unit tests prove product ID/cancel-path/analytics behavior is not hardcoded to today-only products and that presentation is shared through the component.

## Help / Guide Impact

N/A with rationale: this changes only the public `/plans` purchase CTA label; it changes no Help/Guide assertion, user/admin workflow label, support recovery behavior, operator-facing instruction, support procedure, or Stripe/payment explanation copy.

## Route / Label / Support Surface Sweep

Required as a route/label/support and commerce-surface impact sweep before broad gates.

- Identifiers searched:
  - `CheckoutButton`
  - `Open secure checkout`
  - `Buy now`
  - `Buy 0-1000m guide`
  - `Buy Poolside guide`
  - `Buy Video analysis`
  - `upsell_accepted`
  - `Commerce action feedback`
  - `AW-006`
- Surfaces checked:
  - `app/plans/`
  - `components/my-library/`
  - `components/commerce/`
  - `tests/unit/`
  - `docs/task-briefs/`
  - `docs/design/`
- Fallout handled:
  - canonical AW-006 queue and design inventory only,
  - no Help/Guide, runbook, Stripe, finance, API, entitlement, analytics-taxonomy, or support-procedure update.

## Scope

- `components/my-library/CheckoutButton.tsx`
- `app/plans/page.tsx`
- `app/plans/plansPresentation.ts`
- `tests/unit/checkout-button.test.tsx`
- `tests/unit/plans-page.test.tsx`
- `tests/e2e/mobile-bottom-nav-safe-area.spec.ts`
- canonical AW-006 queue/inventory docs
- this task brief
- screenshot artifacts for `/plans` desktop/mobile before/after

## Out Of Scope

- Stripe API, Checkout Session payloads, webhooks, SDK version, secrets, idempotency, retries, or provider settings.
- Prices, product catalog data, purchase-model explanatory copy, Stripe/payment expectation copy, support copy, Help/Guide, analytics taxonomy, entitlement logic, finance reporting, refunds, invoices, payouts, and unavailable-product behavior.
- `PortalButton`, `DownloadResendForm`, post-purchase recovery, broad commerce card redesign, Habits product/UI findings, app-wide button primitive refactors, and app-wide danger/remove/delete migrations.

## Acceptance Criteria

1. `CheckoutButton` uses the current primary action token styling without changing pending state, feedback semantics, request body, analytics payload, or redirect behavior.
2. `/plans` can still pass route-specific `className` without duplicating route-local primary button styling.
3. `/plans` purchase CTA labels are generated from product titles with a safe fallback instead of the old generic `Open secure checkout` label.
4. My Library explore checkout buttons inherit mobile full-width primary styling through `CheckoutButton`.
5. Focused unit coverage proves token classes, product-title CTA copy, and unchanged checkout/analytics behavior.
6. Canonical AW-006 queue and design inventory identify this as the active selected slice.
7. Screenshot handoff provides before/after `/plans` desktop/mobile evidence before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/checkout-button.test.tsx tests/unit/plans-page.test.tsx`
- targeted route/label/support sweep with the terms above
- `git diff --check`
- screenshot handoff before broad gates
- after owner screenshot approval:
  - `npm run verify:pre-pr`
- before merge recommendation:
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- UI screenshot capture uses `SITE_LOCK_ENABLED=0` and local Next dev server per `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@d257804 after Program Builder Inner Planner And Export Panel Token/Input/Action Parity #973 and repo-managed closeout #974; owner approved doing the recommended Checkout Button Token/Action Parity slice; no runtime implementation completed yet | next: implement focused CheckoutButton token/action parity, update tests/docs, run targeted validation, then capture screenshot handoff before npm run verify:pre-pr`
- `2026-06-03 | screenshot-handoff | implemented shared CheckoutButton token/action parity, updated focused unit tests and AW-006 queue/inventory docs, captured before/after /plans desktop/mobile artifacts at output/aw-006-checkout-button-token-parity-2026-06-03-212408; validation passed: ./node_modules/.bin/vitest run tests/unit/checkout-button.test.tsx, npm run lint:briefs:all, git diff --check, and targeted route/label/support sweep with expected hits only | next: owner screenshot approval before npm run verify:pre-pr, commit, push, and PR`
- `2026-06-03 | copy-feedback | owner correctly flagged Open secure checkout as weak purchase CTA copy; expanded the same slice to generate product-specific /plans labels from catalog titles while preserving Stripe/API, prices, checkout payloads, analytics payloads, entitlements, finance/reporting, and support behavior | next: rerun focused validation and regenerate screenshot handoff before npm run verify:pre-pr`
- `2026-06-03 | refreshed-screenshot-handoff | updated /plans CTA labels to product-title-derived Buy labels, updated unit/e2e coverage and AW-006 docs, and captured superseding before/after /plans desktop/mobile artifacts at output/aw-006-checkout-button-copy-parity-2026-06-03-214631; validation passed: ./node_modules/.bin/vitest run tests/unit/checkout-button.test.tsx tests/unit/plans-page.test.tsx, npm run lint:briefs:all, git diff --check, targeted route/label/support sweep, and env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright-plans SITE_LOCK_ENABLED=0 STRIPE_PRICE_ID_0_1000M_GUIDE=price_1000 STRIPE_PRICE_ID_POOLSIDE_GUIDE=price_poolside STRIPE_PRICE_ID_ANALYSIS=price_analysis npm exec playwright -- test tests/e2e/mobile-bottom-nav-safe-area.spec.ts --project=mobile-chromium -g "plans primary action" | next: owner screenshot approval before npm run verify:pre-pr, commit, push, and PR`
- `2026-06-03 | closeout | Checkout Button Token And Action Parity shipped in PR #975 as squash commit ef5c177; this repo-managed closeout moves its brief to done and clears the active AW-006 queue/design-inventory references | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`

## Completion Record

- `completed`: `2026-06-03`
- `merged_pr`: `#975`
- `squash_commit`: `ef5c177`
- `result`: Closed AW-006 Checkout Button Token And Action Parity; checkout purchase actions now use the shared primary action token and `/plans` says what the customer buys instead of the generic secure-checkout wording.
- `validation`: Targeted Vitest, targeted mobile Playwright, route/label/support sweep, `npm run lint:briefs:all`, `git diff --check`, screenshot handoff at `output/aw-006-checkout-button-copy-parity-2026-06-03-214631`, `npm run verify:pre-pr` PASS on `d03322d`, GitHub CI PASS on PR `#975`, and `npm run verify:pre-merge` PASS on `d03322d`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                            | Gaps / Notes |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#975`, screenshot handoff, `/plans` tests                                                       | None         |
| UX flow clarity                               | `5/5`          | Product-title CTA helper tests, focused checkout tests, screenshot approval                         | None         |
| Visual design quality                         | `5/5`          | `fs-cta-primary` class tests, before/after screenshots, owner approval                              | None         |
| Business logic correctness and data integrity | `5/5`          | Checkout request/redirect/analytics unit assertions, changed-files review                           | None         |
| Accessibility (a11y)                          | `5/5`          | Feedback semantics assertions and full `verify:pre-pr` Playwright gate                              | None         |
| Accessibility                                 | `5/5`          | Alias closeout row for the 10/10 critical-category parser; same evidence as `Accessibility (a11y)`. | None         |
| Performance (CWV + payloads)                  | `5/5`          | No dependency/assets added; perf budgets PASS in `verify:pre-pr`                                    | None         |
| Reliability and failure handling              | `5/5`          | Pending/error/retry checkout tests and unchanged API error handling                                 | None         |
| Security and authz                            | `5/5`          | Stripe/API/auth boundaries untouched; CI security/API negative paths remained green                 | None         |
| Content governance                            | `5/5`          | Brief, queue, and design inventory closeout plus `npm run lint:briefs:all`                          | None         |
| Analytics and KPI observability               | `5/5`          | Existing `upsell_accepted` payload asserted unchanged                                               | None         |
| Commerce and revenue ops                      | `5/5`          | Checkout Sessions handoff, product IDs, and unavailable-product behavior preserved                  | None         |
| Finance and reporting operations              | `5/5`          | No Stripe payload, price, entitlement, invoice, payout, reconciliation, or report behavior changed  | None         |
| i18n operational readiness                    | `5/5`          | Product-title labels remain layout-safe through mobile full-width action behavior                   | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused `CheckoutButton`, `fs-cta-primary`, existing tests, and current Stripe-hosted integration    | None         |
| Testing and QA automation                     | `5/5`          | Targeted unit/e2e tests, full `verify:pre-pr`, CI, and `verify:pre-merge` PASS                      | None         |
| DevOps and rollback readiness                 | `5/5`          | No migration/config/dependency change; normal revert restores previous copy/styling                 | None         |
