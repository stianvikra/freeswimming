# Task Brief: AW-006 Plans Comparison Purchase-Model Ready Card Parity (10/10)

## Metadata

- `id`: `2026-05-23-aw-006-plans-comparison-purchase-model-ready-card-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `execution mode`: `end-to-end implementation after owner explicitly requested the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@e48afaa`
- `audit_status`: `closed`
- `decision`: Execute the next bounded AW-006 UI slice on `/plans` by adding a clearer comparison surface and aligning product cards with the established public token direction while preserving today's checkout behavior.
- `reason`: PR `#822` and repo-managed closeout `#823` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `/plans` still has route-local rounded card styling and no compact comparison surface, while `/programs` already provides the mature public token/card reference. The owner also flagged likely future package/subscription changes, so this slice must avoid locking public copy to one-time purchases as a permanent product model.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/plans`, `app/programs/page.tsx`, `app/globals.css` token utilities, `CheckoutButton`, commerce catalog contracts, Stripe checkout/session behavior, package/subscription product decisions, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make `/plans` easier to compare and more consistent with the token-backed public product surfaces, while keeping today's Stripe Checkout, catalog, analytics, prices, and entitlement behavior unchanged and leaving room for future package/subscription models.

## Pre-Implementation Owner Explanation

Jeg skal gjøre `/plans` lettere å sammenligne og visuelt mer lik de modne offentlige produktflatene. Det betyr noe fordi siden skal selge dagens guider/feedback bedre uten å bli låst hvis pakkene senere blir abonnement eller andre kjøpsmodeller. Utenfor scope er Stripe/API, priser, entitlements, checkout-logikk og nye betalingsmodeller. Fremoverkompatibilitet ivaretas ved at synlig kjøpsmodell-copy får en trygg fallback og produktlisten fortsatt drives av katalogen.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Commerce and revenue ops
- Stack-fit and dependency discipline
- Testing and QA automation

Accessibility (a11y) is also a `target` category for this UI slice and closed at `5/5`; it is tracked in the scorecard and closeout tables below.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | `/plans` remains the paid-offers hub and adds a compact comparison path so visitors can choose between rendered catalog products.                                      | unit tests + screenshot handoff                        | `5/5`                   |
| UX flow clarity                               | `target`     | Each rendered product must show who it fits, what model it uses today, what the buyer receives, and what happens at checkout without adding dead ends.                 | unit tests + screenshot handoff                        | `5/5`                   |
| Visual design quality                         | `target`     | Product cards and comparison rows use the established public token/card direction with stable 8px cards, responsive text, and no mobile nav overlap.                   | desktop/mobile screenshots + e2e safe-area check       | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Product availability, active state, checkout request payload, cancel-path tracking, and analytics events remain unchanged.                                             | targeted tests + code review                           | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, product CRUD, catalog publishing, contextual notes, or operator editing workflow.                                      | explicit admin scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Comparison content, product cards, checkout buttons, unavailable notices, and support links remain semantic, keyboard reachable, and clearly named.                    | role assertions + screenshot review                    | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/plans` route targets remain `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`; no dependency or heavy client runtime is added.           | dependency diff + broad gate evidence                  | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no new local state, server-canonical state, browser storage, sync behavior, conflict handling, or sensitive data boundary.           | explicit data-boundary scope rationale                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no catalog override cache mode, route cache, API response cache, revalidation, mutation, or stale-data policy.                                | explicit cache scope rationale                         | `N/A`                   |
| Reliability and failure handling              | `supporting` | Existing unavailable product fallback and checkout-start feedback remain recoverable and clear.                                                                        | targeted tests + code review                           | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no protected route, authz check, cookie/session behavior, checkout endpoint authorization, input validation, or secret handling.              | explicit security scope rationale                      | `N/A`                   |
| Privacy and compliance                        | `supporting` | Supporting only: copy must not request payment details in-app or expose sensitive data; payment entry remains hosted by Stripe.                                        | copy review                                            | `4/5`                   |
| Content governance                            | `target`     | The canonical AW-006 queue records this active slice and purchase-model-ready rationale.                                                                               | queue diff + active brief                              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, product editing field, moderation path, or operator mutation changes.                                                      | explicit admin workflow scope rationale                | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/plans` public semantic content becomes clearer; no metadata, sitemap, robots, canonical, or structured data changes are in scope.                   | rendered content review                                | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: product value, purchase model, and checkout expectations become clearer in crawlable text; no structured entity model changes.                        | rendered content review                                | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Existing `plans_viewed`, `upsell_presented`, `upsell_accepted`, `checkout_started`, and checkout-cancel analytics payloads stay intact; no new taxonomy is introduced. | unit test + code review                                | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Today's one-time checkout copy remains accurate, but the UI must not hardcode one-time purchase as the permanent platform model; unknown future models use safe copy.  | unit tests + Stripe best-practice note + screenshot QA | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this UI slice changes no support workflow, runbook, alert path, operational diagnostic, recovery behavior, or incident response process.                          | explicit support-ops scope rationale                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this UI slice changes no billing mode, invoice, payout, refund, entitlement, revenue report, reconciliation surface, or finance data.                             | explicit finance scope rationale                       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new English strings are concise, grouped, and avoid grammar-coupled layout assumptions that would block later localization.                           | copy review + responsive screenshot review             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next route, commerce catalog, `CheckoutButton`, analytics components, Tailwind, and global token utilities; add no dependency.                          | architecture review + dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit coverage, mobile safe-area check, brief lint, and screenshot handoff cover the changed route before broad gates.                                         | Vitest + Playwright + screenshot artifacts             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: rendering remains static/server-side with no new backend calls, polling, external services, assets, jobs, or traffic-dependent cost.                  | implementation review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal docs/UI/test revert with no migration, config, provider, or data repair requirement.                                             | git diff + screenshot artifacts + gate logs            | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `app/programs/page.tsx` public token-backed cards and the existing `/plans` route.
  - Keep `/plans` as a server component using the existing catalog load and existing client `CheckoutButton`.
  - Do not change route cache mode, API routes, server actions, checkout endpoints, or revalidation behavior.
- TypeScript/domain contracts:
  - Preserve `CatalogProductAvailability`, product IDs, slugs, kinds, active/available resolution, analytics source contracts, and checkout cancel-path behavior.
  - Add only route-local presentation helpers for purchase-model copy and comparison rows.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated DB type, storage, or Supabase query changes.
- External services/tools:
  - Stripe remains hosted Checkout Sessions for today's one-time payments.
  - Future recurring products should use Stripe Billing APIs with Checkout Sessions `mode: "subscription"` and Prices, not manual renewal loops or deprecated plan objects.
  - This slice changes only public explanatory copy; no SDK/API/secret/webhook/idempotency/retry behavior is touched.
- UI system:
  - Reuse `fs-program-card`, `fs-program-card-highlight`, `fs-cta-primary`, `fs-cta-secondary`, and existing public token variables where practical.
  - Screenshot handoff type is `before/after` for `/plans` desktop and mobile.
- Testing:
  - Update `tests/unit/plans-page.test.tsx` for comparison/purchase-model-ready copy and analytics preservation.
  - Keep `tests/unit/checkout-button.test.tsx` green.
  - Run the existing mobile safe-area Playwright check for `/plans`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no new state, local persistence, server-canonical data, sync behavior, conflict handling, retention rule, or sensitive data handling. Existing checkout and entitlement state remains server/Stripe canonical and unchanged.

## Identity And Rename Contract

N/A with rationale: this changes no persisted product ID, slug, title identity contract, route parameter, analytics identity, alias, redirect, or rename/repurpose behavior.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: commerce catalog products rendered on `/plans`, public product-specific copy, purchase-model presentation copy, checkout expectation copy, and analytics payload preservation.
  - Not touched: Stripe API mode, product schema, entitlements, admin product editing, checkout session payload, webhooks, finance/reporting.
- Source of truth:
  - Product rendering, availability counts, product ID lists, and unavailable state continue to derive from `getCatalogProductsWithAvailability(process.env, catalogOverrides)`.
  - Product-specific marketing copy remains an explicit route-local mapping because future offers need human-reviewed sales copy before launch.
- Additive behavior:
  - Newly rendered catalog products can still appear as cards with safe generic copy through the existing default copy path.
  - Analytics counts and product ID lists continue to derive from the actual rendered product list.
  - Purchase-model summary uses a safe generic fallback when a product model is not explicitly mapped.
- Explicit mapping requirements:
  - New packages, bundles, subscriptions, trials, seats, usage-based pricing, finance promises, or support commitments require explicit copy/test/doc review before release.
  - Subscription launch requires a separate Stripe Billing/Checkout `mode: "subscription"` implementation brief and finance/support review.
- Unknown or deprecated values:
  - Unknown product IDs use generic product copy and generic checkout-detail wording rather than claiming one-time/subscription behavior.
  - Unavailable products remain disabled with the existing support fallback.
- Test/evidence:
  - Unit coverage asserts the comparison surface and today's purchase model copy while preserving analytics payloads.
  - Route/label/support sweep checks `/plans`, checkout labels, one-time wording, subscription wording, and Stripe copy before broad gates.

## Help / Guide Impact

N/A with rationale: this changes public marketing/comparison copy only. It does not change user/admin workflow labels, support recovery behavior, Help/Guide assertions, operator-facing instructions, checkout recovery behavior, or billing support procedures.

## Route / Label / Support Surface Sweep

Required before broad gates because `/plans`, commerce copy, and checkout entry labels are touched.

- Identifiers to sweep:
  - `Plans`
  - `/plans`
  - `Open secure checkout`
  - `One-time`
  - `subscription`
  - `Stripe Checkout`
  - `purchase model`
  - `plans_viewed`
  - `upsell_presented`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/runbooks/`
  - `docs/api-contracts.md`
- Expected fallout:
  - `/plans` route, targeted tests, active brief, canonical AW-006 queue, and screenshot artifacts only.
  - No Help/Guide, Stripe API, database, route metadata, admin workflow, or runbook update unless implementation discovers a direct contradiction.
- Executed sweep evidence:
  - identifiers searched: `Plans`, `/plans`, `Open secure checkout`, `One-time`, `subscription`, `Stripe Checkout`, `purchase model`, `plans_viewed`, `upsell_presented`.
  - surfaces checked: `app/`, `components/`, `tests/`, `docs/task-briefs/`, `docs/runbooks/`, and `docs/api-contracts.md`; fallout handled in `/plans`, targeted tests, active brief, canonical AW-006 queue, and screenshot artifacts only.

## Scope

- `/plans` public paid-offers page hierarchy, comparison summary, product card token alignment, and purchase-model-ready copy.
- Route-local presentation helpers only.
- Targeted unit tests and narrow E2E selector updates if required.
- Canonical AW-006 queue refresh to record this active slice.
- Screenshot handoff artifacts.

## Out Of Scope

- Stripe API/session payloads, checkout mode changes, exact price display, product catalog schema, Supabase migrations, webhook fulfillment, entitlements, refunds, invoices, finance reports, subscription launch, paid-offer admin tooling, analytics taxonomy changes, `/programs` redesign, broad design-system refactor, new dependencies, Help/Guide updates, and merge without explicit owner approval.

## Acceptance Criteria

1. `/plans` includes a compact comparison surface that helps visitors distinguish rendered offers.
2. Product cards use the established public token/card direction and 8px radius where practical.
3. Today's one-time checkout expectation remains accurate without implying all future packages must be one-time purchases.
4. Unknown or future products have safe generic copy rather than broken or false model-specific claims.
5. Available products still call existing checkout through `CheckoutButton` with unchanged product ID, cancel path tracking, and analytics source.
6. Unavailable products still expose a disabled state and support fallback.
7. Existing `/plans` analytics payloads stay intact.
8. Mobile first viewport keeps the first purchase/support action clear of the fixed bottom nav.
9. Targeted tests and screenshot handoff evidence are complete before broad gates.

## Validation

- Targeted:
  - `./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx`
  - `env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright-plans SITE_LOCK_ENABLED=0 STRIPE_PRICE_ID_0_1000M_GUIDE=price_1000 STRIPE_PRICE_ID_POOLSIDE_GUIDE=price_poolside STRIPE_PRICE_ID_ANALYSIS=price_analysis npm exec playwright -- test tests/e2e/mobile-bottom-nav-safe-area.spec.ts --project=mobile-chromium -g "plans primary action"`
  - `npm run typecheck`
  - `npm run lint:briefs:all`
  - `git diff --check`
- Screenshot handoff before `npm run verify:pre-pr`:
  - artifact folder: `output/plans-purchase-model-parity-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - filenames: `before-plans-purchase-model-desktop-1440.png`, `after-plans-purchase-model-desktop-1440.png`, `before-plans-purchase-model-mobile-390.png`, `after-plans-purchase-model-mobile-390.png`
- Owner screenshot approval or correction pass before PR creation/update and broad gates.
- After screenshot approval:
  - `npm run verify:pre-pr`
  - commit and push
  - open/update PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@402776c after PR #822 and repo-managed closeout #823; owner approved end-to-end execution of the next AW-006 /plans slice with future package/subscription concerns included; branch aw-006-plans-purchase-model-parity created and active brief opened | next: implement /plans comparison and purchase-model-ready token card parity, run targeted QA, then capture screenshot handoff before broad gates`
- `2026-05-23 | screenshot-review | implemented /plans comparison and purchase-model-ready token card parity by adding route-local presentation helpers, token-backed plan cards, per-offer purchase model copy, generic fallback copy for unmapped future products, and canonical AW-006 queue linkage; preserved checkout payloads, Stripe/API behavior, product IDs, availability handling, and analytics payloads; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check, and env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright-plans SITE_LOCK_ENABLED=0 STRIPE_PRICE_ID_0_1000M_GUIDE=price_1000 STRIPE_PRICE_ID_POOLSIDE_GUIDE=price_poolside STRIPE_PRICE_ID_ANALYSIS=price_analysis npm exec playwright -- test tests/e2e/mobile-bottom-nav-safe-area.spec.ts --project=mobile-chromium -g "plans primary action"; route/label/support sweep searched Plans, /plans, Open secure checkout, One-time, subscription, Stripe Checkout, purchase model, plans_viewed, and upsell_presented across app, components, tests, docs/task-briefs, docs/runbooks, and docs/api-contracts with expected fallout only in /plans code, targeted tests, and AW-006 docs; before/after screenshots captured in output/plans-purchase-model-parity-2026-05-23-191156 | next: owner screenshot approval before npm run verify:pre-pr, commit, push, PR, CI, and npm run verify:pre-merge`
- `2026-05-23 | screenshot-approved | owner approved the before/after screenshot handoff in output/plans-purchase-model-parity-2026-05-23-191156 | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-23 | pre-pr-green | npm run verify:pre-pr passed full lane after explicit route/label/support sweep evidence was added to the brief; full gate included lint, typecheck, unit, build, perf budgets, and Playwright E2E with 98 passed / 478 skipped | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-23 | merged | PR #824 merged as e48afaa after owner approved merge; CI and local npm run verify:pre-merge were green | next: repo-managed docs-only closeout moves this brief to done and clears the AW-006 queue pointer`

## Completion Record

- `completed`: `2026-05-23`
- `merged_pr`: `#824`
- `squash_commit`: `e48afaa`
- `result`: Closed AW-006 Plans Comparison Purchase-Model Ready Card Parity. `/plans` now presents the paid offers as clearer token-backed comparison cards with purchase-model-ready copy, while preserving today's Stripe Checkout behavior and keeping future package/subscription copy explicit instead of hardcoded.
- `validation`: `./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx`; mobile safe-area Playwright for `/plans`; `npm run typecheck`; `npm run lint:briefs:all`; `git diff --check`; `npm run verify:pre-pr` full lane; `npm run verify:pre-merge` full lane; PR #824 CI all green (`verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, `CodeQL`, Vercel).
- `screenshot_artifacts`: `output/plans-purchase-model-parity-2026-05-23-191156`
- `10/10 claim`: yes - all critical target categories reached `5/5`; no remaining release-blocking gaps inside this slice.

| Category                            | Achieved Score | Evidence                                                                                                                         | Gaps / Notes |
| ----------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                | `5/5`          | `/plans` comparison surface shipped in #824 with screenshot approval and full local/CI gates.                                    | None.        |
| UX flow clarity                     | `5/5`          | Product cards show fit, model, received value, and checkout expectation; unit tests and screenshots covered the flow.            | None.        |
| Visual design quality               | `5/5`          | Before/after desktop/mobile screenshot handoff approved; token-backed 8px card direction used.                                   | None.        |
| Accessibility (a11y)                | `5/5`          | Semantic content/buttons preserved; targeted tests and full Playwright suite passed.                                             | None.        |
| Content governance                  | `5/5`          | Active brief, queue link, route/label/support sweep, and this closeout record are complete.                                      | None.        |
| Commerce and revenue ops            | `5/5`          | Existing checkout payloads, product IDs, analytics, prices, and Stripe behavior unchanged; future models use safe fallback copy. | None.        |
| Stack-fit and dependency discipline | `5/5`          | Reused existing catalog, `CheckoutButton`, public token utilities, Tailwind, and route-local helpers; no dependency added.       | None.        |
| Testing and QA automation           | `5/5`          | Targeted Vitest, safe-area Playwright, full `verify:pre-pr`, full `verify:pre-merge`, and CI all passed.                         | None.        |
