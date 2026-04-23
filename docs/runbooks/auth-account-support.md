# Auth And Account Support

Use this runbook when users ask where account, sign-in, billing, or recovery actions live.

## Current Product Contract

- `My Library` is the account home.
- The signed-in email is shown on `My Library`.
- `Manage billing` lives on `My Library` and opens the Stripe Billing Portal.
- `Sign out` lives on `My Library`.
- `/auth/sign-in` owns one-time email-code sign-in, resend, cooldown, and spam/junk-folder guidance.
- `/preview-access` owns private preview unlock guidance when site-lock is enabled.
- `/my-library/security` is a legacy protected route that redirects signed-in users to `My Library`.

## Support Answers

- If a user asks which email is signed in: send them to `My Library`.
- If a user wants to sign out: use `Sign out` on `My Library`.
- If a user needs billing or invoices: use `Manage billing` on `My Library`.
- If a sign-in code does not arrive: ask them to check spam/junk, wait for any cooldown, then request a new code on `/auth/sign-in`.
- If a code expires or fails: request a new code from `/auth/sign-in`.
- If preview access is blocked while the site is private: use `/preview-access`; admin sign-in and preview-password behavior stay separate from normal My Library sign-in.

## Security Rules

- Do not ask users to send sign-in codes, session cookies, or raw auth errors.
- Do not expose another user's email, Stripe customer, invoice, or entitlement data while diagnosing support cases.
- Account email is display identity, not a route identifier or authorization key by itself.
- Passkeys and Face ID are not live account-management features until a separate auth architecture brief ships them.
