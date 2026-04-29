# Task Brief: Stripe Fresh Sandbox Purchase Invoice Verification (10/10)

## Metadata

- `id`: `2026-04-26-stripe-fresh-sandbox-purchase-invoice-verification-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-26`
- `updated`: `2026-04-29`

## Goal

Complete the carried-forward billing confidence check: create or inspect one fresh Stripe sandbox payment-mode Checkout purchase after PR #517 (`bd3a9e5`) and verify that invoice creation now works for the current checkout contract.

## Why This Brief Exists

- PR #517 enabled `invoice_creation.enabled=true` for future one-time Checkout purchases.
- Older sandbox purchases remain receipt/charge-only and do not retroactively gain invoices.
- The maintenance baseline deliberately carried this verification forward before live billing confidence is claimed.
- This slice should prove the current checkout path creates invoice-backed Stripe evidence, or document the exact blocker without changing unrelated billing behavior.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Commerce and revenue ops`
- `Finance and reporting operations`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Live-billing readiness has a clear yes/deferred outcome for fresh sandbox invoice visibility.                                 | Stripe sandbox verification summary           | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: if app or portal UI is exercised, user-facing billing copy must not overpromise invoice history.             | route/portal review or explicit N/A           | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice does not redesign app UI; Stripe-hosted screenshots are evidence only, not product UI changes.         | explicit scope rationale                      | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Fresh Checkout Session has `mode=payment`, `payment_status=paid`, `invoice_creation.enabled=true`, and an invoice reference.  | Stripe API evidence                           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this does not change admin content editing or publishing flows.                                                   | explicit scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this verification does not alter app UI semantics.                                                                | explicit scope rationale                      | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this verification does not alter runtime bundle, route payload, or CWV budget.                                    | explicit scope rationale                      | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Stripe remains source of truth for checkout/customer/invoice; app entitlements remain a mirror only if webhook/claim runs.    | data-boundary review                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: portal/session state should be freshly read from Stripe for verification, not inferred from stale app state. | API query timestamps                          | `4/5`                   |
| Reliability and failure handling              | `target`     | If invoice visibility cannot be confirmed, the blocker is classified as env, webhook, portal, customer, or Stripe state.      | blocker log or PASS evidence                  | `5/5`                   |
| Security and authz                            | `target`     | No raw Stripe secrets, full customer IDs, full emails, or invoice URLs are committed; portal/customer access remains scoped.  | redacted evidence + route review              | `5/5`                   |
| Privacy and compliance                        | `target`     | Evidence avoids PII and records only redacted Stripe references needed for finance/support confidence.                        | redaction review                              | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: carry-forward notes in maintenance/Stripe docs are resolved or left explicit with rationale.                 | brief/runbook update                          | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow changes.                                                                            | explicit scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because checkout and billing portal surfaces are private/Stripe-hosted and not crawlable product content.                 | explicit scope rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content or structured data changes.                                                     | explicit scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: checkout/portal events should remain unchanged unless a bug is found and explicitly scoped.                  | diff review                                   | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Fresh sandbox purchase is reconcilable as paid and invoice-backed, or deferral states the exact missing dependency.           | Stripe checkout/invoice evidence              | `5/5`                   |
| Incident response and support operations      | `target`     | Support can distinguish legacy no-invoice purchases from current invoice-backed purchases.                                    | support/runbook or brief closeout evidence    | `5/5`                   |
| Finance and reporting operations              | `target`     | Finance reconciliation can identify the fresh session invoice fields without manual guessing.                                 | `finance:reconcile` or direct Stripe evidence | `5/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice does not change locale routing, translations, or billing copy.                                         | explicit scope rationale                      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Stripe SDK, Checkout payload, portal route, and finance tooling; add no dependency.                              | dependency diff                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Existing checkout/portal/finance tests stay green; docs-only closeout uses docs-only lane if no runtime code changes.         | targeted tests + verify gates                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: verification should avoid noisy repeated sandbox purchases and preserve a reusable evidence pattern.         | execution log                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | If no code changes, rollback is docs-only; if code changes are needed, they stay isolated with a normal release gate.         | PR scope + validation                         | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - Stripe Checkout Session, Customer, PaymentIntent, Charge, and Invoice records.
- App mirror:
  - `entitlements` rows only if webhook/claim flow creates or attaches them.
- Local-only:
  - redacted evidence artifacts under ignored output/artifact paths.
- Sync policy:
  - do not infer invoice visibility from old sandbox purchases,
  - verify fresh post-`bd3a9e5` session state directly from Stripe,
  - only record redacted identifiers in committed docs.

## Identity And Rename Contract

- Stripe IDs are external immutable identifiers and must not be repurposed.
- Committed evidence may use short redacted forms only, for example `cs_...abcd`.
- No app route params, slugs, or product identifiers are renamed in this slice.

## Scope

- Create or inspect one fresh sandbox Checkout purchase created after PR #517.
- Verify invoice creation status and invoice reference for that fresh session.
- Verify whether current finance reconciliation/export fields can see the invoice evidence.
- Update the brief/runbook carry-forward status with a PASS or an explicit blocker.

## Out Of Scope

- Stripe live-mode purchases.
- Stripe major SDK upgrade.
- Pricing, product catalog, entitlement redesign, or portal UI redesign.
- Broad finance reporting rebuild.
- Committing raw Stripe/Supabase exports, secrets, emails, portal URLs, or full IDs.

## Acceptance Criteria

1. A fresh post-`bd3a9e5` sandbox Checkout Session is classified as paid+invoice-backed, or the blocker is documented precisely.
2. Evidence confirms `invoice_creation.enabled=true` for the fresh session.
3. Evidence confirms an invoice ID exists for the fresh session, or identifies the exact Stripe/state reason it is missing.
4. No secrets, raw emails, full Stripe IDs, or portal URLs are committed.
5. Existing checkout/portal/finance tests remain green if touched or used as validation.
6. `npm run verify:pre-pr` and `npm run verify:pre-merge` pass before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
- Targeted Stripe/finance verification command(s), redacted in final handoff.
- Existing targeted tests if code/runtime paths are touched:
  - `npx vitest run tests/unit/checkout-session-payload.test.ts tests/unit/portal-route.test.ts tests/unit/portal-utils.test.ts tests/unit/finance-reconciliation.test.ts`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `npm run lint:briefs:all`: PASS for all `195` brief files.
- `npx vitest run tests/unit/finance-reconciliation.test.ts`: PASS, `11` tests.
- `npx vitest run tests/unit/checkout-session-payload.test.ts tests/unit/portal-route.test.ts tests/unit/portal-utils.test.ts`: PASS, `8` tests.
- `NODE_OPTIONS=--max-old-space-size=8192 npm run verify:pre-pr`: PASS full lane,
  including lint, typecheck, unit, build, perf budgets, and Playwright E2E (`112`
  passed, `344` skipped). Log:
  `artifacts/test-runs/20260426-210712/verify.log`.
- `env NODE_OPTIONS=--max-old-space-size=8192 npm run verify:pre-merge`: PASS full
  lane before PR #524 merge, with `112` E2E passed / `344` skipped. Log:
  `artifacts/test-runs/20260426-212930/verify.log`; marker:
  `artifacts/verify-pre-merge/20260426-194632.json`.
- GitHub CI for PR #524: PASS for CodeQL, Vercel preview, size-check,
  e2e-smoke, site-lock-smoke, and verify.
- The heap flag was used only to avoid the local Next test-server memory restart observed in
  an earlier full pre-PR run; no test selection was narrowed and no failures were skipped.

## Implementation Notes

- Fresh purchase path exercised on `2026-04-26` through local `/plans` and the app
  `/api/checkout/session` route, using Stripe test mode only.
- Fresh paid session evidence, redacted:
  - created `2026-04-26T17:51:45.000Z`,
  - session `cs_...uT9CS6`,
  - product `guide_0_1000m`,
  - `mode=payment`,
  - `status=complete`,
  - `payment_status=paid`,
  - `invoice_creation.enabled=true`,
  - invoice `in_...Nz9ezn`,
  - invoice status `paid`,
  - customer `cus_...UmWkZU`.
- Stripe Billing Portal session for the same customer opened on `billing.stripe.com` and
  exposed invoice-history and paid-state labels; it did not show the old `No invoice history`
  state.
- `finance:reconcile -- --collect-live --from 2026-04-26 --to 2026-04-26` collected into
  `/tmp/freeswimming-stripe-fresh-20260426`, not repo artifacts:
  - Stripe rows collected: `3`,
  - Stripe paid sessions: `1`,
  - Entitlement sessions: `1`,
  - skipped unpaid Stripe rows: `2`,
  - missing/orphan/duplicate counts: `0`,
  - result: `PASS`.
- The two unpaid same-day Stripe rows came from browser automation retries before the final paid
  checkout; they are explicitly skipped by the finance paid-session filter.
- Runtime finding fixed in this slice: `scripts/reconcile-finance-entitlements.mjs` used
  `autoPagingIterable()`, which is not present on the Stripe SDK object available in this repo.
  The script now consumes the SDK list object directly as an async iterable and has unit coverage
  for invoice field collection.
- `npm run test:perf:budgets` again recommended `tighten` after green budget history. This
  Stripe slice records that signal as out-of-scope carry-forward for the next performance-budget
  maintenance decision; it does not change perf budgets.
- No raw Stripe secret, full Stripe ID, full email, portal URL, or raw finance export is committed.

## Manual QA / Owner Steps

- Prefer API/Playwright automation when sandbox credentials are available locally.
- If Stripe Checkout or Billing Portal requires browser owner credentials, pause and give exactly one manual step at a time.
- Screenshots are optional evidence for this verification and must avoid exposing customer PII, full IDs, invoice URLs, or payment details.

## Checkpoint Log

- `2026-04-26 | in-progress | started after maintenance baseline closeout merged as 437d101; scope is one fresh post-bd3a9e5 Stripe sandbox invoice verification before live billing confidence | next: inspect sandbox capability, create/verify fresh session, and record redacted evidence`
- `2026-04-26 | in-progress | Stripe test-mode checkout completed through local /plans; fresh paid session cs_...uT9CS6 has invoice_creation.enabled=true and paid invoice in_...Nz9ezn; Billing Portal for the same customer shows invoice-history/paid state instead of no-invoice-history | next: fix finance collect runtime issue, validate, and open PR`
- `2026-04-26 | in-progress | fixed finance live collect for Stripe SDK async iterable support; finance:reconcile collected today's Stripe/Supabase exports into /tmp and passed with one paid invoice-backed session, one entitlement, and zero unexplained mismatches | next: run full pre-PR gate and prepare PR`
- `2026-04-26 | in-progress | first npm run verify:pre-pr full lane passed lint/typecheck/unit/build/perf but failed two unrelated E2E timeouts: mobile iPhone preview-notify menu dialog and desktop Firefox dev-login navigation; targeted rerun of those exact tests passed 3/3 with 1 expected project skip | next: rerun full pre-PR gate before commit/PR`
- `2026-04-26 | in-progress | final NODE_OPTIONS=--max-old-space-size=8192 npm run verify:pre-pr full lane passed with 112 E2E passed and 344 expected skips; heap flag avoided local Next test-server memory restart without narrowing test scope | next: commit, push, open PR, then run pre-merge gate`
- `2026-04-29 | done | PR #524 merged as d086258 after full verify:pre-pr, full verify:pre-merge, and green GitHub checks; fresh sandbox Checkout invoice creation, Billing Portal invoice-history visibility, and finance reconciliation were confirmed with redacted evidence | next: repeat only if checkout, portal, webhook, or finance reconciliation contracts change`
