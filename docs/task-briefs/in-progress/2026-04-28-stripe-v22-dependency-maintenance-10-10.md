# Task Brief: Stripe v22 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-28-stripe-v22-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-28`
- `updated`: `2026-04-28`

## Goal

Evaluate and ship Dependabot PR `#363` (`stripe` `18.5.0` -> `22.1.0`) only if the current checkout, webhook, billing portal, invoice, and finance-reconciliation contracts remain stack-fit under the Stripe v22 SDK.

## Why This Brief Exists

- After the controlled GitHub Actions, dev/test dependency, Node types, and ESLint gate slices, the remaining dependency queue is mostly higher-risk work.
- PR `#363` is the narrowest remaining runtime dependency candidate: a single production package update for the Stripe SDK.
- Stripe is commerce-critical, so the slice must explicitly validate checkout session creation, webhook payload typing, billing portal session creation, invoice metadata, and finance reconciliation helpers before merge recommendation.
- This is a non-UI dependency-maintenance change; screenshot handoff is `N/A`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Commerce and revenue ops`
- `Finance and reporting operations`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                           | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dependency maintenance continues one narrow PR at a time without changing product IA or purchase entry semantics.                                        | PR queue review + diff review                      | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: checkout and portal UI entry points must keep their existing request/redirect contracts, but no copy or UI changes are in scope.        | unit/API contract tests                            | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, brand, print, screenshot, or visual assets.                                                                | explicit visual scope rationale                    | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Checkout metadata, invoice creation metadata, webhook discount payloads, entitlement customer lookup, and finance session fields remain deterministic.   | targeted commerce/finance tests + typecheck        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                                              | explicit admin editor scope rationale              | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered controls, semantics, focus behavior, or browser interaction changes.                                                             | explicit a11y scope rationale                      | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: Stripe v22 removes the old production `qs` transitive dependency and must not regress build/test gates.                                 | package-lock diff + verify gates                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | No server-canonical entitlement, Stripe customer ID, invoice, or checkout session persistence boundary changes.                                          | code review + unit tests                           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache, revalidation, CDN policy, or artifact cache strategy changes.                                                              | explicit cache scope rationale                     | `N/A`                   |
| Reliability and failure handling              | `target`     | Checkout, portal, and webhook routes preserve existing fail-closed/non-sensitive error behavior under Stripe v22 types.                                  | typecheck + portal/checkout negative-path coverage | `5/5`                   |
| Security and authz                            | `target`     | Protected portal behavior and webhook signature path remain unchanged; unauthenticated/invalid requests still return deterministic non-sensitive errors. | targeted unit/e2e/full verify gates                | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new data processor or payload shape is introduced; existing Stripe customer/session metadata is preserved.                           | diff review + policy-impact check                  | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: the dependency decision and Stripe 22 compatibility evidence are documented in this brief and PR body.                                  | brief + PR handoff                                 | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                                         | explicit admin workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                                                  | explicit SEO scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                                             | explicit AI discovery scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: checkout analytics event shape must remain unchanged when sessions are created or cancelled.                                            | checkout/button/webhook tests                      | `4/5`                   |
| Commerce and revenue ops                      | `target`     | One-time Checkout, invoice creation, billing portal, webhook fulfillment, and discount metadata behavior remain compatible with Stripe v22.              | checkout, portal, webhook, finance tests           | `5/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing verify/CI artifacts remain the diagnostic source; no support runbook or incident workflow changes.                             | gate artifacts                                     | `4/5`                   |
| Finance and reporting operations              | `target`     | Finance reconciliation helpers still collect Stripe session, invoice, and invoice_creation fields with current async iterable/list assumptions.          | `tests/unit/finance-reconciliation.test.ts`        | `5/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                                         | explicit i18n scope rationale                      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Stripe v22 must support repo Node 20, install cleanly with npm 10, and require only narrow compatibility fixes.                                          | npm metadata + install/typecheck evidence          | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted Stripe tests, local `verify:pre-pr`, local `verify:pre-merge`, and required GitHub checks pass before merge recommendation.                     | local logs + GitHub checks                         | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: SDK dependency count is reduced by removing Stripe's prior `qs` runtime dependency without adding new runtime packages.                 | package-lock diff                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-PR revert of the Stripe dependency bump, test type compatibility fix, and this brief; no migration or secret rotation is required.     | PR diff + rollback note                            | `5/5`                   |

## Data Placement And Sync Contract

- No database schema, RLS, entitlement ownership, invoice persistence, or Stripe customer ID ownership boundary changes.
- Stripe remains server-only through existing API routes and helpers.
- Existing checkout metadata keys remain unchanged:
  - `fs_product_id`
  - `fs_product_slug`
  - `fs_product_kind`
  - `fs_user_id` when available
- Existing portal customer resolution remains server-canonical through owned entitlement rows before email fallback.

## Identity And Rename Contract

- `N/A` for app entities because no persisted product, route, slug, customer, entitlement, or operator-visible identifier is introduced or renamed.
- Package identity changes only for the existing `stripe` dependency version range.

## Scope

- Rebase/sync Dependabot PR `#363` onto current `main`.
- Keep the Stripe SDK bump from `18.5.0` to `22.1.0`.
- Apply only narrow type/test compatibility changes required by Stripe v22.
- Add this task brief and run the required local/CI gates.

## Out Of Scope

- Stripe API redesign, checkout UX changes, billing portal UX changes, invoice behavior changes, webhook event expansion, entitlement schema changes, sandbox purchase retesting, pricing changes, secret/config changes, or refund/reporting workflow changes.
- TypeScript 6, Tailwind 4, broad npm grouped updates, or unrelated dependency upgrades.
- Suppressing tests, weakening auth checks, or changing security-sensitive error behavior to make the dependency pass.

## Compatibility Review

- PR `#363` updates `stripe` from `18.5.0` to `22.1.0`.
- `stripe@22.1.0` declares `node >=18` and `@types/node >=18`; this repo runs Node `20.20.2`.
- `stripe@22.1.0` has no runtime dependencies; the update removes the old Stripe `qs` production transitive dependency from the lockfile.
- After rebase, `npm install` under Node `20.20.2` / npm `10.8.2` completed without lockfile churn.
- Stripe v22 no longer exposes `Stripe.Checkout.Session.TotalDetails` as a namespace type; the unit fixture now derives the type from `Stripe.Checkout.Session["total_details"]`.

## Acceptance Criteria

1. PR `#363` is rebased/synced onto current `main`.
2. `stripe` is updated to `^22.1.0` without unrelated package updates.
3. Checkout session payload behavior remains unchanged, including `invoice_creation.enabled=true` and metadata propagation.
4. Billing portal server path still uses owned entitlement Stripe customer IDs and ignores caller-provided customer IDs.
5. Webhook discount payload typing and analytics behavior remain compatible with Stripe v22.
6. Finance reconciliation helpers still parse Stripe session invoice fields.
7. Local targeted Stripe unit tests pass.
8. Local `npm run verify:pre-pr` passes.
9. Local `npm run verify:pre-merge` passes before merge recommendation.
10. Required GitHub checks pass before merge recommendation.

## Validation Plan

- `npm install` under Node `20.20.2`.
- `npm run typecheck`
- `npm run lint`
- `npx vitest run tests/unit/checkout-session-payload.test.ts tests/unit/stripe-webhook-analytics.test.ts tests/unit/portal-route.test.ts tests/unit/portal-utils.test.ts tests/unit/finance-reconciliation.test.ts tests/unit/checkout-button.test.tsx tests/unit/portal-button.test.tsx`
- `npm audit --omit=dev --json`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`
- GitHub PR checks:
  - `verify`
  - `size-check`
  - `deploy-preview`
  - `e2e-smoke`
  - `site-lock-smoke`
  - `CodeQL`
  - `Analyze (javascript-typescript)`
  - Vercel

## Validation Evidence

- PR queue review on `2026-04-28` found remaining dependency PRs: `#539` broad npm non-major group, `#367` TypeScript 6, `#366` Tailwind 4, and `#363` Stripe 22.
- PR `#363` was selected because it is the narrowest remaining single-package runtime dependency candidate.
- PR `#363` rebased onto current `main` without conflicts.
- `npm install` under Node `20.20.2` / npm `10.8.2`: PASS, no lockfile churn after rebase.
- `npm view stripe@22.1.0 version engines peerDependencies dependencies --json`: PASS; confirms version `22.1.0`, `node >=18`, `@types/node >=18`, and no runtime dependencies.
- `npm run lint`: PASS after Stripe v22 install.
- Targeted Stripe unit tests: PASS, 7 files / 24 tests.
- First `npm run typecheck`: FAIL only in `tests/unit/stripe-webhook-analytics.test.ts` because `Stripe.Checkout.Session.TotalDetails` is no longer a namespace type in Stripe v22.
- Compatibility fix: changed the test fixture type to `NonNullable<Stripe.Checkout.Session["total_details"]>`.
- Retried `npm run typecheck`: PASS.
- Retried `npx vitest run tests/unit/stripe-webhook-analytics.test.ts`: PASS, 1 file / 2 tests.
- `npm audit --omit=dev --json`: reports production advisories only for `next`/bundled `postcss` (moderate), no Stripe advisory in the audit result; not changed in this Stripe SDK slice.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, browser runtime behavior, or visible user-facing output.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-28 | in-progress | selected PR #363 as the narrowest remaining runtime dependency candidate, rebased it onto main, validated install metadata, found and fixed one Stripe v22 test type compatibility issue, and passed lint/typecheck/targeted Stripe unit coverage | next: run full verify:pre-pr, push PR updates, monitor CI, run verify:pre-merge, and summarize merge readiness`
