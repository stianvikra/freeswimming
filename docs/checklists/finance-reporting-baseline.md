# Finance Reporting Baseline Checklist

Use this weekly to confirm commerce/entitlement/reporting consistency for current catalog and core user flows.

## Cadence And Owner

- Cadence: weekly (minimum) and after any commerce-affecting deploy.
- Owner: admin/operations owner for the week.

## Inputs

- Production admin UI: `/admin` (`Commerce` tab).
- Public sales surface: `/plans`.
- Stripe dashboard export/report for the same date range.
- App operational notes/checkpoint entry for recorded anomalies.

## Weekly Checks

- Active catalog consistency:
  - `Commerce` tab active products/titles/prices match intended live offer set.
  - No duplicate or stale product entries marked active by mistake.
- Checkout-to-entitlement sanity:
  - Sample at least one successful checkout path per active product.
  - Confirm entitlement appears in `My Library` for the test account.
- Cancel/refund path sanity:
  - Verify known cancel/refund cases remain traceable with stable IDs.
  - Confirm no orphaned entitlement remains active after intended revocation.
- Reporting reconciliation:
  - Count of successful checkouts in Stripe report equals expected order count for the period.
  - Investigate and log differences above threshold (`>= 1` unexplained mismatch).
- Safety posture:
  - No manual data edits performed without a tracked note (who/when/why).

## Automated Session-ID Reconciliation (Required)

Preferred mode: collect live Stripe + Supabase rows directly for the date range:

```bash
npm run finance:reconcile -- \
  --collect-live \
  --from <YYYY-MM-DD> \
  --to <YYYY-MM-DD> \
  --collect-dir artifacts/finance-exports/live-<period> \
  --write artifacts/finance-reconciliation/latest.json \
  --max-unexplained 0
```

- Required env: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Date window is UTC and inclusive (`--from..--to`).
- Command auto-collects Stripe checkout sessions + entitlement rows, writes JSON exports, then runs deterministic mismatch checks.
- Stripe session exports include customer ID, invoice ID, `invoice_creation.enabled`, `client_reference_id`, and product metadata so missing Billing Portal invoice history can be classified as either pre-invoice-creation legacy behavior or a current checkout bug.

Fallback mode: stage both exports in one folder using filename hints:

- Stripe export filename includes `stripe` (for example: `stripe-checkout-2026-w10.csv`)
- Entitlement export filename includes `entitlement` or `entitlements` (for example: `entitlements-2026-w10.csv`)

Run reconciliation from that input folder:

```bash
npm run finance:reconcile -- \
  --input-dir <path-to-weekly-exports-folder> \
  --write artifacts/finance-reconciliation/latest.json \
  --max-unexplained 0
```

- Optional override: pass explicit `--stripe` and `--entitlements` file paths instead of `--input-dir`.
- Command compares paid Stripe checkout session IDs to entitlement `stripe_checkout_session_id`.
- Command fails with non-zero exit code when unexplained mismatch count exceeds threshold.
- Store the JSON report path in the weekly evidence note.

## Evidence Log Template

| Date       | Owner | Period checked         | Catalog OK | Entitlement sample OK | Stripe match OK | Mismatch count | Automation report                         | Notes/links     |
| ---------- | ----- | ---------------------- | ---------- | --------------------- | --------------- | -------------- | ----------------------------------------- | --------------- |
| YYYY-MM-DD | name  | YYYY-MM-DD..YYYY-MM-DD | yes/no     | yes/no                | yes/no          | 0              | `artifacts/finance-reconciliation/*.json` | link to note/PR |

## Escalation Thresholds

- `P0`:
  - entitlement granted to wrong user,
  - paid order with missing entitlement and no workaround,
  - irreversible reporting mismatch with unknown source.
- `P1`:
  - repeatable mismatch with workaround,
  - product state drift requiring manual correction.
- `P2`:
  - documentation/process improvement with no current user impact.

## Follow-Up Protocol

1. Log incident/checkpoint entry with severity and owner.
2. Link failing case to a task brief when structural fix is needed.
3. Keep reconciliation notes for audit traceability.
