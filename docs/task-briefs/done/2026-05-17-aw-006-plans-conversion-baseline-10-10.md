# Task Brief: AW-006 Plans Conversion Baseline (10/10)

## Metadata

- `id`: `2026-05-17-aw-006-plans-conversion-baseline-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-17`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `execution mode`: `end-to-end implementation after owner explicitly requested the next small PR-sized AW-006 UX/UI slice`

## Brief Audit Record

- `last_audited`: `2026-05-17`
- `base`: `main@6724077`
- `audit_status`: `ready`
- `decision`: Use the review queue's next unshipped child slice, `Plans conversion baseline`, as the next small AW-006 PR.
- `reason`: `Course desktop player polish` shipped through `#735/#736`, leaving `/plans` conversion clarity as the next recommended UX/UI queue item; the scope can improve value, proof, and checkout expectation copy without changing Stripe mechanics.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, screenshot handoff rules, `/plans`, `CheckoutButton`, Stripe Checkout/session payloads, commerce catalog contracts, payment copy, mobile bottom nav, scorecard categories, or verification lanes change before completion.

## Goal

Make `/plans` easier to evaluate and trust before checkout by showing clearer value, proof, and secure one-time purchase expectations while preserving existing Stripe Checkout behavior.

## Product Decisions

- This slice improves the existing paid-offers hub; it does not redesign the full commerce funnel, add price storage, change Stripe API calls, or alter entitlements.
- Price transparency is handled as an expectation baseline: the final price, promo code field, and payment details are confirmed inside secure Stripe Checkout before payment. Exact app-side prices remain out of scope because the current catalog stores Stripe price IDs, not display prices.
- Checkout remains Stripe-hosted `mode: "payment"` for one-time purchases with invoice creation already enabled by the existing checkout payload.
- Use `/plans` as the reference surface for this slice and reuse existing `PageTemplate`, `PageIntro`, analytics trackers, catalog availability, and `CheckoutButton`.
- Screenshot handoff is required before `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge`. This is a screenshot approval stop.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- UX flow clarity
- Visual design quality
- Commerce and revenue ops
- Accessibility (a11y)
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/plans` must remain a paid-offers hub where visitors can compare available offers and decide whether to open checkout.                                                                   | unit test + screenshot handoff                    | `5/5`                   |
| UX flow clarity                               | `target`     | Each offer must communicate who it is for, what the buyer gets, and what happens when checkout opens, with no dead-end states for unavailable products.                                   | unit test + screenshot handoff                    | `5/5`                   |
| Visual design quality                         | `target`     | Cards must have clearer hierarchy, comparison cues, stable spacing, and responsive readability on desktop and mobile without changing the broader design language.                        | desktop/mobile screenshots                        | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: product availability, active state, checkout request payload, cancel tracking, and analytics events must stay unchanged.                                                 | targeted tests + code review                      | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, product CRUD, catalog publishing, contextual notes, or operator editing workflow.                                                         | explicit admin scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Product cards, checkout buttons, unavailable notices, and support links must remain keyboard-accessible with meaningful names and readable text contrast.                                 | role assertions + screenshot review               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/plans` route targets remain `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`; add no dependency or heavy client runtime.                                   | dependency diff + broad gate evidence             | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no new local state, server-canonical state, storage, sync, conflict handling, or sensitive data boundary.                                               | explicit data-boundary scope rationale            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no catalog override cache mode, route cache, API response cache, revalidation, mutation, or stale-data policy.                                                   | explicit cache scope rationale                    | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: existing fallback for missing checkout config and checkout start errors must continue to provide a next action.                                                          | targeted test + code review                       | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no protected route, authz check, cookie/session behavior, checkout endpoint authorization, input validation, or secret handling.                                 | explicit security scope rationale                 | `N/A`                   |
| Privacy and compliance                        | `supporting` | Supporting only: copy must not request payment details in-app or expose sensitive data; payment entry remains hosted by Stripe.                                                           | copy review                                       | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: offer copy stays route-local for this baseline; no CMS/admin ownership model changes.                                                                                    | code review + parent queue reference              | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, product editing field, moderation path, or operator mutation changes.                                                                         | explicit admin workflow scope rationale           | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public `/plans` semantic content becomes clearer; no metadata, sitemap, robots, canonical, or structured data changes are in scope.                                      | rendered content review                           | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: product value and checkout expectations become clearer in crawlable text; no structured entity model changes.                                                            | rendered content review                           | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing `plans_viewed`, `upsell_presented`, `upsell_accepted`, `checkout_started`, and checkout-cancel analytics stay intact; no new taxonomy is introduced.            | unit test + code review                           | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Copy must accurately describe one-time Stripe-hosted checkout, final price confirmation before payment, promo code support, invoice/receipt expectation, and no app-side payment capture. | Stripe payload review + unit test + screenshot QA | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this conversion-copy slice changes no support workflow, runbook, alert path, operational diagnostic, recovery behavior, or incident response process.                                | explicit support-ops scope rationale              | `N/A`                   |
| Finance and reporting operations              | `supporting` | Supporting only: one-time Checkout and invoice expectations are described accurately, but no billing, invoice, payout, refund, entitlement, reconciliation, or finance data changes.      | checkout payload review                           | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new English strings must be concise, grouped, and avoid grammar coupling that would block later localization.                                                            | copy review                                       | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next route, commerce catalog, `CheckoutButton`, analytics components, and Tailwind patterns; add no dependency and avoid a broader design-system refactor.                 | architecture review + dependency diff             | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit coverage for the improved plans content and checkout label/cancel-path behavior; run screenshot handoff before broad gates.                                             | targeted Vitest + screenshot artifacts + gates    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: copy/layout changes add no backend calls, polling, storage, external service, image, job, or traffic-dependent platform cost.                                            | implementation review                             | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal docs/component/test revert with no migration, config, or provider change; screenshot evidence must make the visual delta reviewable.                | git diff + screenshot artifacts + gate logs       | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface is the existing `/plans` route in `app/plans/page.tsx`.
  - Keep the current server route boundary and existing client `CheckoutButton`.
  - Do not change checkout API routes, server actions, route cache, revalidation, or catalog override cache behavior.
- TypeScript/domain contracts:
  - Preserve `CatalogProductAvailability`, product IDs/slugs/kinds, active/available resolution, checkout cancel path tracking, and analytics source contracts.
  - If card copy needs structure, keep it route-local and typed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated DB type, storage, or Supabase query changes.
- External services/tools:
  - Stripe remains hosted Checkout Sessions for one-time payments. This slice reviews the existing payload but does not change SDK calls, price IDs, webhooks, idempotency, retries, secrets, or observability.
- UI system:
  - Reuse `PageTemplate`, `PageIntro`, `TrackedLink`, `TrackEventOnMount`, `TrackCheckoutCancel`, and `CheckoutButton`.
  - Keep cards responsive and stable; no nested page-section cards or global token work.
  - Screenshot handoff type is `before/after` for `/plans` desktop and mobile first viewport.
- Testing:
  - Add targeted Vitest render coverage for `/plans`.
  - Extend checkout button coverage only if the visible checkout label contract changes.
  - Update existing mobile safe-area selector if the button label changes.
  - After owner screenshot approval, run `npm run verify:pre-pr`, update PR, monitor CI, then run `npm run verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no new state, local persistence, server-canonical data, sync behavior, conflict handling, retention rule, or sensitive data handling. Existing checkout and entitlement state remains server/Stripe canonical and unchanged.

## Identity And Rename Contract

N/A with rationale: this changes no persisted product ID, slug, title identity contract, route parameter, analytics identity, alias, redirect, or rename/repurpose behavior.

## Help / Guide Impact

N/A with rationale: this changes public marketing/checkout-expectation copy only. It does not change user/admin workflow labels, recovery behavior, support diagnostics, Help/Guide assertions, or operator-facing instructions. Existing support guidance for checkout/invoice recovery remains valid because API and finance behavior are unchanged.

## Route / Label / Support Surface Sweep

- Required before broad gates because `/plans`, commerce copy, and checkout entry labels are touched.
- Identifiers searched:
  - `Plans conversion`
  - `Buy now`
  - `Open secure checkout`
  - `Final price`
  - `one-time`
  - `promo code`
  - `invoice`
  - `Stripe Checkout`
  - `/plans`
- Surfaces checked:
  - `app/plans/page.tsx`
  - `components/my-library/CheckoutButton.tsx`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/task-briefs/`
  - `docs/runbooks/`
- Fallout handled:
  - product code, targeted tests, mobile safe-area selector, active brief, and canonical AW-006 queue refresh only,
  - no Help/Guide, Stripe API, database, route, SEO metadata, admin workflow, or runbook update unless implementation discovers a direct contradiction.

## Scope

- `/plans` public paid-offers page hierarchy, product card copy, proof/value cues, and checkout expectation copy.
- Optional `CheckoutButton` visible label prop if needed for clearer checkout entry.
- Targeted unit tests and any narrow selector updates needed by existing E2E coverage.
- Refresh the canonical AW-006 UX/UI queue to reflect that `Course desktop player polish` has shipped and this slice is active.
- Screenshot handoff artifacts.

## Out Of Scope

- Exact price display in app, Stripe API/session payload changes, price IDs, product catalog schema, Supabase migrations, webhook fulfillment, entitlements, refunds, invoices, checkout success/claim flows, paid-offer admin tooling, analytics taxonomy changes, `/programs` redesign, full design-token foundation, and new dependencies.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge without explicit owner approval.

## Acceptance Criteria

1. `/plans` clearly explains the paid-offer value before the checkout buttons.
2. Each offer communicates format, best-fit use case, buyer deliverables, and one proof/trust cue.
3. Checkout expectation copy states that Stripe securely shows the final price and payment details before payment, supports promo codes where configured, and handles one-time purchase confirmation/receipt/invoice.
4. Available products still call the existing checkout endpoint with the same product ID, cancel path tracking, and analytics source.
5. Unavailable products still expose a clear disabled state and support fallback.
6. Mobile first viewport keeps the first purchase/support action clear of the fixed bottom nav.
7. No Stripe API, catalog, entitlement, database, route metadata, or dependency change is introduced.
8. Targeted tests and screenshot handoff evidence are complete before broad gates.

## Validation

- `npm run lint:briefs`
- Targeted:
  - `./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/plans-conversion-baseline-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - filenames: `before-plans-conversion-desktop-1440.png`, `after-plans-conversion-desktop-1440.png`, `before-plans-conversion-mobile-390.png`, `after-plans-conversion-mobile-390.png`
- Owner screenshot approval or correction pass before PR creation/update and broad gates.
- After screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-17 | in-progress | started from clean main@6724077 after Course desktop player polish #735 and closeout #736; post-merge preflight found no repo-managed closeout; branch aw-006-plans-conversion-baseline created; scope limited to /plans conversion copy/layout, targeted tests, canonical AW-006 queue refresh, and screenshot handoff | next: implement product cards and tests, then capture before/after screenshots before broad gates`
- `2026-05-17 | screenshot-review | implemented /plans conversion baseline with compact trust strip, clearer product card comparison details, mobile-first checkout action placement, and CheckoutButton label override; route/label/support sweep found no Help/Guide, Stripe API, database, route, SEO metadata, admin workflow, or runbook fallout; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx and npm run lint:briefs:all; before/after screenshots captured in output/plans-conversion-baseline-2026-05-17-191811 | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-17 | screenshot-review | targeted mobile safe-area E2E initially caught the first checkout button below the fixed nav in Playwright's mobile project; moved the checkout action earlier in each product card DOM, reran ./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx and env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright-plans SITE_LOCK_ENABLED=0 STRIPE_PRICE_ID_0_1000M_GUIDE=price_1000 STRIPE_PRICE_ID_POOLSIDE_GUIDE=price_poolside STRIPE_PRICE_ID_ANALYSIS=price_analysis npm exec playwright -- test tests/e2e/mobile-bottom-nav-safe-area.spec.ts --project=mobile-chromium -g "plans primary action" successfully, regenerated after screenshots in output/plans-conversion-baseline-2026-05-17-191811, and removed the temporary before-screenshot worktree | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-17 | screenshot-correction | owner rejected the first screenshot handoff because the Plans intro logo was squeezed and the mobile text under Plans was poor; applied the same scoped PageIntro logo proportion fix used by course via brandMarkClassName="h-auto w-full", shortened the Plans subtitle to "Guides and feedback.", tightened the below-divider copy, reran targeted Vitest and the plans mobile safe-area Playwright test successfully, regenerated after screenshots in output/plans-conversion-baseline-2026-05-17-191811, and removed generated Playwright state | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-17 | screenshot-approved | owner approved the corrected /plans screenshots in output/plans-conversion-baseline-2026-05-17-191811; no rendering files changed after the approved capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-17 | pre-pr-green | npm run verify:pre-pr passed the full lane after screenshot approval, including lint, typecheck, unit tests, build, perf budgets, and Playwright E2E (90 passed, 438 skipped); perf trend recommendation was hold (runs: 5/2, worst margin 14.8%/15.0%), so no budget-tightening change in this slice | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
