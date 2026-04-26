# Task Brief: Stripe Sandbox Invoice History And Billing Portal Verification (10/10)

## Metadata

- `id`: `2026-04-21-stripe-sandbox-invoice-history-and-billing-portal-verification-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-26`

## Goal

Verify why Stripe Billing Portal shows no invoice history after a sandbox purchase and make the app, Stripe setup, and support expectations consistent before live billing trust is needed.

## Sequencing Lock

- Run before pre-live maintenance baseline if billing confidence is required before launch.
- Keep this as billing verification and contract hardening, not broad commerce redesign.
- Coordinate with Account & Security only if billing access currently depends on that page.

## Why This Brief Exists

- Owner observed `No invoice history` in Stripe Billing Portal after a previous sandbox purchase.
- The cause may be valid sandbox behavior, incomplete payment/subscription state, portal configuration, customer mismatch, or webhook/app-state drift.
- Billing flows must be 10/10 in finance/reporting/support categories before launch.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Security and authz`
- `Commerce and revenue ops`
- `Finance and reporting operations`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Billing entrypoints and portal expectations clearly match what sandbox/live users can actually see.                                 | billing flow audit and screenshots     | `5/5`                   |
| UX flow clarity                               | `target`     | User can understand Manage billing outcomes and is not promised invoice history when Stripe cannot show one.                        | portal QA and copy review              | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: any app-side billing copy/link changes match current My Library action style.                                      | screenshot review                      | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Stripe customer, checkout/session, subscription/payment, invoice, entitlement, and portal records reconcile for the tested user.    | Stripe API/dashboard reconciliation    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this does not change admin content editing or publishing flows.                                                         | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: app-side billing links/buttons keep clear labels and focus states.                                                 | semantic review                        | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: billing link verification should not add client payload or slow My Library.                                        | route diff review                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Stripe remains source of truth for billing/customer/invoice data; app entitlement mirror rules are documented.                      | data contract review                   | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Billing/entitlement state cannot stay stale after checkout, portal return, webhook, or manual refresh.                              | webhook/route QA                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing invoice, incomplete checkout, customer mismatch, and portal errors produce diagnosable outcomes, not silent confusion.      | negative-path QA and logs              | `5/5`                   |
| Security and authz                            | `target`     | Billing portal access is owner-scoped and cannot expose another user's Stripe customer or invoice data.                             | authz tests and code review            | `5/5`                   |
| Privacy and compliance                        | `target`     | Billing PII is minimized in app logs/UI and Stripe-hosted pages are the source for sensitive payment method data.                   | privacy review                         | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: billing copy and support guidance have one source of truth.                                                        | help/runbook review                    | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow changes.                                                                                  | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because billing portal and My Library billing routes are authenticated/private and not crawlable.                               | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content changes.                                                                              | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Checkout/portal/invoice state has enough safe logging or events to support reconciliation without PII leakage.                      | event/log review                       | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout, customer portal, invoice history expectations, and entitlements reconcile for sandbox test purchase.                      | Stripe dashboard/API evidence          | `5/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose `No invoice history`, missing payment method, incomplete purchase, and customer mismatch.                      | support runbook/checklist              | `5/5`                   |
| Finance and reporting operations              | `target`     | Sandbox purchase/invoice/payment records are reconcilable, or documented as intentionally absent with exact Stripe reason.          | finance reconciliation notes           | `5/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief does not change locale architecture; billing copy remains current-language only for this verification slice. | explicit scope rationale tied to scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Stripe SDK/routes/configuration; add no billing dependency unless required and justified.                              | dependency diff                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover portal/customer ownership and webhook/checkout state where repo supports deterministic test coverage.                   | targeted tests and verify gates        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: reconciliation approach should support future billing growth without manual guessing.                              | ops review                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Config or code changes have rollback notes and do not require destructive Stripe data changes.                                      | PR/runbook notes                       | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - Stripe customer, checkout, subscription/payment, invoice, payment method.
- App-canonical/mirror:
  - entitlement state only if existing app logic mirrors Stripe state.
- Local-only:
  - transient portal redirect state.
- Sync policy:
  - webhook and portal-return behavior must be documented and tested where possible.
- Retention and sensitivity:
  - no raw card/payment data in the app.
- Cache/invalidation:
  - post-checkout and post-portal state must refresh or be explicitly manually refreshed.

## Identity And Rename Contract

- Canonical stable ID:
  - app user ID mapped to Stripe customer ID.
- Human-readable identifier:
  - email is display/contact identity, not a billing authorization key by itself.
- Compatibility:
  - detect and document orphaned or duplicate sandbox customers if found.

## Scope

- Audit Stripe sandbox purchase history for the test user.
- Verify portal invoice history behavior.
- Verify Stripe customer mapping and app billing route.
- Verify webhook/entitlement state where implemented.
- Update support/runbook/help copy if the current behavior is expected.

## Out Of Scope

- New pricing model.
- Payment method redesign.
- Live-mode billing migration.
- Account & Security redesign except billing-link dependency audit.

## Acceptance Criteria

1. We know exactly why portal shows no invoice history.
2. The tested user maps to the expected Stripe customer.
3. Checkout/payment/subscription/invoice state is reconciled or documented as intentionally absent.
4. App copy does not overpromise invoice visibility.
5. Billing portal access is owner-scoped.
6. Support has a deterministic troubleshooting path.

## Validation

- `npm run lint:briefs`
- Stripe sandbox dashboard/API evidence captured in PR summary without secrets
- targeted billing route/auth tests where applicable
- targeted webhook/entitlement tests where applicable
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local where Stripe sandbox env is available.
- Vercel preview if sandbox env is available.
- Stripe test dashboard and customer portal.

## Constraints

- Never commit Stripe secrets or raw env values.
- Do not use email alone as an authorization boundary.
- Do not change live billing data.

## Help/Guide Impact

- Required if the user-facing Manage billing expectation changes.
- Support notes must include how to diagnose missing invoice history.

## Implementation Notes

- Root cause from code audit and Stripe documentation: the app used one-time Checkout Sessions (`mode=payment`) without `invoice_creation.enabled=true`; Stripe only auto-generates invoices for subscriptions, while one-time Checkout purchases need explicit invoice creation.
- Read-only Stripe test API evidence on `2026-04-26`: inspected 10 recent Checkout Sessions, all 10 were payment-mode, 5 were paid, 6 had a customer, 0 had an invoice, 0 had invoice creation enabled, and 5 paid sessions had no invoice. No raw secret, email, or full Stripe ID was output.
- Billing Portal can show invoices for the authenticated user's Stripe customer, but older sandbox one-time purchases created without invoice creation remain receipt/charge-only and do not retroactively gain portal invoice history.
- `/api/portal` does not accept a customer ID from the browser; it resolves the Stripe customer from the authenticated Supabase user and owned entitlement records, with email only used for best-effort guest-entitlement attachment and repairing an already owned entitlement missing `stripe_customer_id`.
- App-side `Manage billing` copy does not promise invoice history; support guidance now documents the exact missing-invoice checks.
- `finance:reconcile -- --collect-live` now includes invoice and invoice-creation fields from Stripe Checkout Sessions so sandbox exports can prove whether invoices are intentionally absent or created.

## Closeout Summary

- Shipped via PR #517 and merged to `main` as `bd3a9e5`.
- Scope completed:
  - one-time Stripe Checkout Sessions now request invoice creation for future sandbox/live payment-mode purchases,
  - `/api/portal` remains owner-scoped and no browser request can choose a Stripe customer,
  - support and finance guidance now explain why older sandbox purchases can show no invoice history,
  - finance reconciliation exports now include invoice and invoice-creation fields.
- Known limitation: older sandbox one-time purchases created before `invoice_creation.enabled=true` remain receipt/charge-only and will not retroactively gain invoices in Stripe Billing Portal.
- Carry-forward verification resolved on `2026-04-26`: a fresh post-`bd3a9e5` sandbox
  Checkout purchase (`cs_...uT9CS6`) completed as paid with `invoice_creation.enabled=true`,
  invoice `in_...Nz9ezn`, and Billing Portal invoice-history/paid-state evidence for the same
  customer. The raw Stripe IDs, customer email, portal URL, and finance exports were not committed.
- Carry-forward maintenance item: `npm run test:perf:budgets` again recommended tightening one stretch target after two consecutive weekly green runs; budget ratchet decision remains deferred to the maintenance baseline brief.
- No screenshot handoff was required because this slice changed backend, tests, and docs only, not app UI/layout.

## Closeout Validation

- Targeted tests: `npx vitest run tests/unit/checkout-session-payload.test.ts tests/unit/portal-route.test.ts tests/unit/portal-utils.test.ts tests/unit/finance-reconciliation.test.ts` PASS, 18 tests.
- `npm run verify:pre-pr`: PASS on implementation branch, full lane, 838 unit tests, build, perf budgets, 112 E2E passed / 344 skipped, log `artifacts/test-runs/20260426-075810/verify.log`.
- Later `npm run verify:pre-pr` rerun hit an unrelated `poolside-save-image-export` mobile Chromium client-ready timeout; targeted rerun of that exact test passed 1/1 and the same test passed in final pre-merge.
- GitHub CI for PR #517: PASS for `verify`, `e2e-smoke`, `site-lock-smoke`, `CodeQL`, `size-check`, `deploy-preview`, and Vercel.
- `npm run verify:pre-merge`: PASS on `afd052caadb140c66e928b993ac4534087b0e782`, full lane, 838 unit tests, build, perf budgets, 113 E2E passed / 343 skipped, marker `artifacts/verify-pre-merge/20260426-072711.json`.
- Merge: PR #517 squashed into `bd3a9e5` on `2026-04-26`.

## Checkpoint Log

- `2026-04-21 | planned | created from owner finding that Stripe Billing Portal showed no invoice history after sandbox purchase | next: implement or defer before maintenance baseline`
- `2026-04-26 | in-progress | branch stripe-sandbox-invoice-portal-verification from main ecbc6ba; Stripe docs confirmed one-time Checkout purchases require invoice_creation.enabled=true for paid invoices | next: implement checkout payload, support runbook, targeted tests`
- `2026-04-26 | in-progress | implemented Checkout invoice_creation payload, owner-scoped portal fallback guard, invoice-aware finance export fields, and support/checklist guidance; targeted Vitest passed for checkout payload, portal route, portal utils, and finance reconciliation | next: run verify:pre-pr, push PR, then pre-merge gate after CI`
- `2026-04-26 | in-progress | npm run verify:pre-pr PASS (full lane; 838 unit tests, build, perf budgets, 112 E2E passed / 344 skipped; log artifacts/test-runs/20260426-075810/verify.log); Stripe test API summary confirmed 0/10 recent payment sessions had invoice_creation enabled and 5 paid sessions had no invoice | next: commit, push, open PR`
- `2026-04-26 | in-progress | final pre-PR rerun after docs checkpoint reached E2E and hit one unrelated mobile Chromium client-ready timeout in poolside-save-image-export; targeted rerun of that exact test passed (1/1), matching the earlier full green run | next: commit, push, open PR with flake note`
- `2026-04-26 | done | PR #517 merged as bd3a9e5 after green CI and local verify:pre-merge; brief moved to done in docs-only closeout | next: continue to maintenance baseline with sandbox re-test and perf-budget ratchet decision carried forward`
