# Policy-Impact Release Review Checklist

Use this checklist when a PR may change policy-relevant behavior.

## Trigger Check

Mark `yes` if PR touches one or more:

- auth/sign-in/session/account behavior
- analytics/tracking payloads or consent boundaries
- user export/delete/privacy rights flow
- third-party processor usage (Stripe/Supabase/Resend/Vercel)

If all are `no`, this checklist can be marked `N/A` in PR with one-line rationale.

## Evidence Checklist

- Policy-impact scope statement added in PR summary.
- Current policy surfaces reviewed:
  - `/privacy`
  - `/cookies`
  - `docs/runbooks/gdpr-data-rights.md`
- Behavior-to-policy mapping reviewed for changed scope.
- Policy version note updated (or `N/A` rationale documented).
- Release gates passed for current HEAD SHA:
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge` (or `npm run gate:pre-merge`)

## Result Log (Per PR)

| Date (UTC) | PR      | Policy impact | Reviewer | Version note            | Result            | Notes |
| ---------- | ------- | ------------- | -------- | ----------------------- | ----------------- | ----- |
| TBD        | `#<PR>` | yes/no        | TBD      | `YYYY-MM-DD.rev` or N/A | pass/pending/fail |       |

## Failure Handling

If result is `fail`:

1. Block merge.
2. Open follow-up patch or rollback PR with explicit policy mapping fix.
3. Re-run this checklist and gates on updated HEAD.
