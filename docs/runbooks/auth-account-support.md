# Auth And Account Support

Use this runbook when users ask where account, sign-in, billing, or recovery actions live.

## Current Product Contract

- `My Library` is the account home.
- The signed-in email is shown on `My Library`.
- `Manage billing` lives on `My Library` and opens the Stripe Billing Portal for the authenticated user's Stripe customer.
- `Sign out` lives on `My Library`.
- `/auth/sign-in` owns one-time email-code sign-in, resend, cooldown, and spam/junk-folder guidance.
- `/preview-access` owns private preview unlock guidance when site-lock is enabled.
- `/my-library/security` is a legacy protected route that redirects signed-in users to `My Library`.

## My Library IA

- `My Swim Profile` holds swimmer identity, CSS, preferences, and personal records.
- `My Training` (`/my-library/training`) holds goals-to-focus workflow, focus cues, and poolside notes.
- `My Swim Sessions` (`/my-library/workouts`) is the saved swim-session list and swim builder entrypoint.
- `Dryland Sessions` (`/my-library/dryland`) is the saved strength/stretching list, dryland builder entrypoint, and weekly `Micro Sessions` exercise-block completion surface.
- `Program builder preview` is optional and only for placing saved swim sessions into week/day slots.

## Support Answers

- If a user asks which email is signed in: send them to `My Library`.
- If a user wants to sign out: use `Sign out` on `My Library`.
- If a user needs billing or invoices: use `Manage billing` on `My Library`.
- If the Stripe Billing Portal says there is no invoice history after a one-time Checkout purchase:
  - verify the authenticated app user owns an entitlement row with the same `stripe_customer_id` as the Stripe customer opened in the portal,
  - do not open a Stripe customer found by email unless the app user already owns an entitlement that needs its missing `stripe_customer_id` repaired,
  - verify the Checkout Session has `payment_status=paid`,
  - verify `invoice_creation.enabled=true` and an invoice ID exists for the session,
  - treat older sandbox purchases made before invoice creation was enabled as receipt/charge-only records; they do not retroactively gain portal invoice history.
- If a sign-in code does not arrive: ask them to check spam/junk, wait for any cooldown, then request a new code on `/auth/sign-in`.
- If a code expires or fails: request a new code from `/auth/sign-in`.
- If preview access is blocked while the site is private: use `/preview-access`; admin sign-in and preview-password behavior stay separate from normal My Library sign-in.
- If `Micro Sessions` shows "still syncing" under `Dryland Sessions`: verify the linked Supabase environment has applied `20260508101500_dryland_micro_plans.sql`, then confirm `dryland_micro_plans` RLS allows owner-scoped authenticated reads/writes. Saved dryland sessions should remain available while this is repaired.

## Security Rules

- Do not ask users to send sign-in codes, session cookies, or raw auth errors.
- Do not expose another user's email, Stripe customer, invoice, or entitlement data while diagnosing support cases.
- Account email is display identity, not a route identifier or authorization key by itself.
- Passkeys and Face ID are not live account-management features until a separate auth architecture brief ships them.
