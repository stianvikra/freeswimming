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

- `My routines` sits under `Free Course` on `My Library` and lets users switch between `Micro Sessions` and `Habits` with `Open` and `Edit` actions.
- `My Swim Profile` holds swimmer identity, CSS, preferences, and personal records.
- `My Training` (`/my-library/training`) is retained for contextual goals-to-focus links and notes, but it is not a top-level My Library card while focus/observations are being moved closer to session and history workflows.
- `Habits` (`/my-library/habits`) holds the private `My Perfect Day` habit setup, daily check-ins, reset behavior, and small weekly consistency summary. It is reached from `My routines`, not a duplicate top-level My Library card.
- `My Swim Sessions` (`/my-library/workouts`) is the saved swim-session list and swim builder entrypoint.
- `Dryland Sessions` (`/my-library/dryland`) is the saved strength/stretching list, dryland builder entrypoint, and compact weekly `Micro Sessions` execution surface. Saved sessions show normal `Edit`/`Open`/`Delete` actions by default; Micro Session source checkboxes appear only inside explicit create/edit mode.
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
- If `/auth/sign-in` shows "Sign-in is temporarily unavailable because a service limit was reached":
  - check Vercel logs for `[Auth] Could not request sign-in email` with `kind: "service_restricted"`,
  - confirm the admin incident alert `auth_sign_in_service_restricted` was sent or intentionally disabled by `INCIDENT_ALERTS_ENABLED=0`,
  - check Supabase Dashboard -> Organization Usage -> Egress for `exceed_egress_quota` or Fair Use restrictions,
  - do not ask the user to retry repeatedly until Supabase usage/billing restriction is resolved,
  - tell the user sign-in is temporarily unavailable and that we are resolving a service limit.
- If `/auth/sign-in` shows "Email code could not be sent right now":
  - check Vercel logs for `[Auth] Could not request sign-in email` with `kind: "email_delivery"`,
  - confirm the admin incident alert `auth_sign_in_email_delivery_failed` was sent or intentionally disabled,
  - inspect `MESSAGE_DELIVERY_*`/Supabase email provider state before asking the user to retry.
- If a code expires or fails: request a new code from `/auth/sign-in`.
- If preview access is blocked while the site is private: authenticated admins should be issued access automatically through `/preview-access/admin-unlock`; anonymous visitors and non-admin testers still use `/preview-access` until the test-user access brief ships. A `preview_access_unlock_failed` incident alert means an authenticated admin passed the admin gate, but strong session claims could not be verified.
- If the `My routines` window on `My Library` looks stale: diagnose the underlying `Habits` and `Dryland Sessions` data separately. `My routines` has local-only tab state and no reminder table, push subscription, background job, or persisted pinning state in V1.
- If `Micro Sessions` shows "still syncing" under `Dryland Sessions`: verify the linked Supabase environment has applied `20260508101500_dryland_micro_plans.sql`, then confirm `dryland_micro_plans` RLS allows owner-scoped authenticated reads/writes. Saved dryland sessions should remain available while this is repaired.
- If a user cannot find the normal `Edit`/`Open`/`Delete` saved-session actions under `Dryland Sessions`: check whether Micro Session create/edit source-selection mode is open. In that mode, the same saved sessions are shown as compact source checkboxes with direct `Edit` links; update or cancel the Micro Session edit to return to the normal saved-session list.
- If a user asks where the old dryland `Focus cue` went: dryland authoring no longer exposes or writes it. Historical values are preserved only as read-only legacy data and appear in authenticated account exports as `drylandSessions[].legacyFocusText` when present.
- If a Micro Session is stale, complete, wrong, empty, or no longer relevant: use `Clear micro session`. This clears the active weekly surface only; it does not delete saved Dryland Sessions.
- If a user asks why there is no default `Skip set` action: unfinished units now stay open. The supported cleanup path is `Clear micro session` at plan level when the plan should no longer be active.
- If a user edits a saved Dryland Session that feeds the current Micro Session: explain that `Save` applies to future Micro Sessions by default. Use `Update current micro session` only after saving when they deliberately want remaining queued units rebuilt; completed/skipped units are preserved.
- If a user reports that `Available units` or `Done` disappeared while editing a Micro Session: confirm they are in edit mode. Edit mode is configuration-only; training execution actions return after `Update micro session`, `Cancel`, or `Close edit`.
- If a user asks what happened to `Manual release`: it is no longer offered when creating or editing a Micro Session. Existing legacy manual-release units remain readable and can still use `Release now`; ask the user to choose `Available now` or `Weekday release` before saving edits to a legacy manual plan.
- If a user reports that a Micro Sessions bubble did not pop or complete: first confirm whether they are in `Ordered` or `Bubbles` mode under `Dryland Sessions`. In `Bubbles`, the first tap/click or `Enter` arms the bubble with `Mark done?`, the second confirms completion, and `Escape` cancels. Double-tap/double-click is only a shortcut through the same path. Bubbles use the same owner-scoped set-unit update as ordered mode; completed bubbles leave the open board, and the stable `Undo` button restores completed units in reverse order. If the bubble remains visible with an error, diagnose the existing micro-plan `PATCH` path and do not look for stored drag/pop/audio/haptic telemetry because bubble presentation state is not persisted.
- If `Habits` shows "still syncing": verify the linked Supabase environment has applied `20260510153000_habits_perfect_day_foundation.sql`, then confirm `habit_definitions` and `habit_check_ins` RLS allow only owner-scoped authenticated reads/writes.
- If a habit check-in is wrong for today: use `Reset` on the habit row, then log the correct count, minutes, time, or done state again. Duplicate same-day check-ins should update the same `user_id` + `habit_id` + `check_in_date` row, not create multiple competing facts.
- If a user asks whether habit labels such as weight-loss, sugar, wake time, or reading habits are used for public analytics: treat habit names and check-ins as private training/life data. Do not ask the user to send sensitive habit details; diagnose with row existence, timestamps, status, and schema/RLS state instead.

## Security Rules

- Do not ask users to send sign-in codes, session cookies, or raw auth errors.
- Do not expose another user's email, Stripe customer, invoice, or entitlement data while diagnosing support cases.
- Account email is display identity, not a route identifier or authorization key by itself.
- Passkeys and Face ID are not live account-management features until a separate auth architecture brief ships them.
