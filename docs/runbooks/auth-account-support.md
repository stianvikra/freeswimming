# Auth And Account Support

Use this runbook when users ask where account, sign-in, billing, or recovery actions live.

## Current Product Contract

- `My Library` is the account home.
- The signed-in email is shown on `My Library`.
- `Manage billing` lives on `My Library` and opens the Stripe Billing Portal for the authenticated user's Stripe customer.
- `Sign out` lives on `My Library`.
- `/auth/sign-in` owns secure email-link sign-in plus one-time-code fallback, resend, cooldown, and spam/junk-folder guidance.
- `/auth/sign-in` uses safe `next` and `source` query context for explanation copy only. It does not grant admin, billing, entitlement, or download access.
- `/preview-access` owns private preview unlock guidance when site-lock is enabled.
- `/my-library/security` is a legacy protected route that redirects signed-in users to `My Library`.

## My Library IA

- Signed-in Home has two direct routine actions under `Free course`: `Micro Sessions` for the active weekly micro plan or creation state, and `Habits` for today's check-ins or add-habit state. Mobile Home entries prioritize execution: active micro plans open in compact `Bubbles` mode and Habits opens the active habit rows before weekly stats.
- `My Routines` sits under `Free Course` on `My Library` as one simple `Open` row. It opens `/my-library/routines`, where users switch between `Micro Sessions` and `Habits`. `Micro Sessions` `Open` jumps to the full active/setup Micro Sessions surface; `Edit` opens micro-plan editing.
- Mobile navigation uses the topbar hamburger as the global menu everywhere. The floating mobile nav is contextual: public pages use `Home / Course / Programs`, routine pages use `Library / Micro / Habits`, and other My Library pages use `Library / Routines / <current section>`. `Home` is not relabelled as `Back`; local back links keep deterministic parent fallbacks.
- `My Swim Profile` holds swimmer identity, CSS, preferences, personal records, and optional advanced generator limits. First-use opens one recommended setup action; other sections remain reachable from the readiness summary and section toggles.
- `Goals` (`/my-library/goals`) is the compact long-term target surface. Users work from the current goal list, use the single `Active`/`Achieved`/`Archived`/`All` filter, open `Add goal` for template/custom creation, and open a goal's `Details` for `Use as focus`, `Add note`, `Archive`, `Restore`, or `Clear best result`. `Request coaching schedule` is one footer CTA to `/contact?source=goals_coaching`.
- `My Training` (`/my-library/training`) is retained for contextual goals-to-focus links and notes, but it is not a top-level My Library card while focus/observations are being moved closer to session and history workflows.
- `Habits` (`/my-library/habits`) holds the private `My Perfect Day` habit setup, daily check-ins, reset behavior, and small weekly consistency summary. It is reached from signed-in Home or `/my-library/routines`, not a duplicate top-level My Library card.
- `My Swim Sessions` (`/my-library/workouts`) is the saved swim-session list and swim builder entrypoint.
- `Dryland Sessions` (`/my-library/dryland`) is the saved strength/stretching list, dryland builder entrypoint, and compact weekly `Micro Sessions` execution surface. The default route shows create actions and saved sessions before the weekly Micro Session panel; micro-focused query links prioritize the Micro Session surface. Saved sessions show normal `Edit`/`Open`/`Delete` actions by default; Micro Session source checkboxes appear only inside explicit create/edit mode.
- `Program builder` is optional and only for placing saved swim sessions into week/day slots.

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
- If a sign-in email does not arrive: ask them to check spam/junk, wait for any cooldown, then request a new sign-in email on `/auth/sign-in`.
- If the secure email link does not open: ask them to enter the one-time code from the same email on `/auth/sign-in`.
- If an iPhone Home Screen app user says the email link opens in Safari or Safari denies the sign-in:
  ask them to return to the Home Screen app and enter the one-time code from the same email.
- If `/auth/sign-in?next=/admin` is shown: explain that sign-in confirms identity only. Admin access is checked after sign-in by the app's admin authorization layer.
- If the user lands on sign-in from My Library: they should verify with the email they use for the app, then return to My Library or the member page they opened.
- If the user lands on sign-in from checkout success or claim/download recovery: ask them to use the same email they used at checkout. Do not promise that a purchase, invoice, billing portal access, entitlement, or download exists until the normal checks complete.
- If a checkout/claim link fails and returns to sign-in: the visible context copy may persist through a safe `source` value, but support should still diagnose entitlement, billing, and download ownership separately.
- If a user is on `/checkout/success` or `/claim`: the supported recovery path is `Continue to My Library` or `Sign in to My Library` first, then the access-link resend form with the checkout email if they still cannot open owned items. The resend response is intentionally generic and does not confirm whether that email has a purchase.
- If the email only contains a code and no button/link: check the Supabase Magic Link email template
  includes both `{{ .ConfirmationURL }}` and `{{ .Token }}` plus the hosted PNG brand lockup.
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
- If a one-time code expires or fails: request a new sign-in email from `/auth/sign-in`.
- If preview access is blocked while the site is private: authenticated admins should be issued access automatically through `/preview-access/admin-unlock`; anonymous visitors and non-admin testers still use `/preview-access` until the test-user access brief ships. A `preview_access_unlock_failed` incident alert means an authenticated admin passed the admin gate, but strong session claims could not be verified.
- If the `My Routines` route looks stale: diagnose the underlying `Habits` and `Dryland Sessions` data separately. `My Routines` has local-only tab state and no reminder table, push subscription, background job, or persisted pinning state in V1.
- If a user cannot find `Use as focus`, `Add note`, `Archive`, `Restore`, or `Clear best result` on `Goals`: ask them to open the goal row's `Details`. The visible row keeps one primary action; management and My Training bridge actions are intentionally tucked behind `Details`.
- If a user says `My Swim Profile` is hiding profile setup: ask them to use the `Profile readiness` summary at the top, then open the recommended action or the relevant section toggle. Unsaved local drafts keep their section open and show restored-draft copy; saved state is still the owner-scoped server data.
- If advanced generator limits fail to save on `My Swim Profile`: verify the linked Supabase environment has applied `20260502120000_swim_capability_limits.sql` and `20260516120000_replace_swim_capability_limits_rpc.sql`, then confirm the authenticated owner can execute `replace_swim_capability_limits(jsonb)`. Do not ask the user for raw profile values or capability details; diagnose with schema/RLS/RPC state, redacted timestamps, and whether previous limits remain intact after the failed save.
- If `Micro Sessions` shows "still syncing" under `Dryland Sessions`: verify the linked Supabase environment has applied `20260508101500_dryland_micro_plans.sql`, then confirm `dryland_micro_plans` RLS allows owner-scoped authenticated reads/writes. Saved dryland sessions should remain available while this is repaired.
- If an iPhone Home Screen user sees `No internet`: ask them to reconnect and tap `Retry`. The installed app has an offline fallback page because standalone iOS web apps do not expose Safari's normal refresh button.
- If a user cannot find the normal `Edit`/`Open`/`Delete` saved-session actions under `Dryland Sessions`: check whether Micro Session create/edit source-selection mode is open. In that mode, the same saved sessions are shown as compact source checkboxes with direct `Edit` links; update or cancel the Micro Session edit to return to the normal saved-session list.
- If a user asks where the old dryland `Focus cue` went: dryland authoring no longer exposes or writes it. Historical values are preserved only as read-only legacy data and appear in authenticated account exports as `drylandSessions[].legacyFocusText` when present.
- If a Micro Session is stale, complete, wrong, empty, or no longer relevant: use `Clear micro session`. This clears the active weekly surface only; it does not delete saved Dryland Sessions.
- If a user asks why there is no default `Skip set` action: unfinished units now stay open. The supported cleanup path is `Clear micro session` at plan level when the plan should no longer be active.
- If a user edits a saved Dryland Session that feeds the current Micro Session: explain that `Save` applies to future Micro Sessions by default. Use `Update current micro session` only after saving when they deliberately want remaining queued units rebuilt; completed/skipped units are preserved.
- If a user reports that `Available units` or `Done` disappeared while editing a Micro Session: confirm they are in edit mode. Edit mode is configuration-only; training execution actions return after `Update micro session`, `Cancel`, or `Close edit`.
- If a user asks what happened to `Manual release`: it is no longer offered when creating or editing a Micro Session. Existing legacy manual-release units remain readable and can still use `Release now`; ask the user to choose `Available now` or `Weekday release` before saving edits to a legacy manual plan.
- If a user reports that a Micro Sessions bubble did not pop or complete: first confirm whether they are in `Ordered` or `Bubbles` mode under `Dryland Sessions`. In `Bubbles`, reps-based units still use the two-step `Complete?` path: first tap/click or `Enter` arms the bubble, the second confirms completion, and `Escape` cancels. Duration-based bubbles first open in place with `Start`; after start, the bubble shows a local countdown and auto-completes through the same owner-scoped micro-plan `PATCH` path when it reaches zero. If the user taps a running timed bubble before zero, the UI asks for `Complete?`; if they do not confirm within about one second, the countdown resumes. Completed bubbles leave the open board, and the stable `Undo` button restores completed units in reverse order. If the bubble remains visible with an error, diagnose the existing micro-plan `PATCH` path and do not look for stored timer/drag/pop/audio/haptic telemetry because bubble presentation and countdown state are not persisted.
- If `Habits` shows "still syncing": verify the linked Supabase environment has applied `20260510153000_habits_perfect_day_foundation.sql`, `20260512103000_habits_v2_build_quit_timed_tracking.sql`, and `20260513213000_habits_cadence_priority_contract.sql`, then confirm `habit_definitions` and `habit_check_ins` RLS allow only owner-scoped authenticated reads/writes.
- Habits now support user-facing `Build`, `Quit`, and `Timed` modes plus explicit cadence fields: `cadence_period`, `cadence_target_count`, `cadence_day_policy`, and legacy-compatible `schedule_days`. `Build` is stored internally as `habit_mode = build` for compatibility. `Add habit` opens a focused create surface in view on mobile and near the top of the Habits surface on desktop; after `Create habit`, the new row receives focus and shows `Habit added` inside the card. `Build` habits support no-quantity `Done only` check-ins plus count/time variants; the pre-completion binary action is `Mark done`, completed rows show green `Done` / `Done today` status, and row-level `Edit` is inside `Details` so the active row stays execution-first. `Rest day` is available from `Details` for non-quit habits and persists as `habit_check_ins.status = skipped`; it is not counted as done, not counted as missed, and is excluded from the current day's perfect-day denominator. `Quit` habits show days since the selected quit date until a slip exists; after a slip, they show consistency such as `9/10 days on track` plus `Current streak 0 days`, and only write rows when the user opens details and logs a user-facing `Log slip` action. `Timed` habits show one daily total from saved duration minutes plus any running/paused local timer. `Finish` saves the timer total as today's duration, `Manual time` / `Add manual time` adds external minutes to the existing total, and starting another timed habit pauses the current timer locally. Habit row cadence chips such as `Daily`, `Weekly - any day`, or `Weekly - 2 fixed days` describe the target schedule; `Done this week/month` means the cadence target is already met for the period, while `7-day minutes` and `7-day count` are report rollups, not weekly goals.
- If habit ordering looks wrong: unfinished active rows are intentionally grouped by nearest deadline: due today/daily `Build`, due today `Timed`, `This week`, `This month`, then lower-interruption `Quit status`, completion groups, and later/not-due rows. Stable `sort_order` is the tie-breaker inside the same deadline group. Weekly cadence labels use a calendar week; rolling 7-day summary cards stay labelled `7-day`.
- If cadence diagnostics show impossible values: reject or repair rows where monthly fixed dates are present, weekly targets are outside `1..7`, monthly targets are outside `1..31`, daily rows are not `1` fixed daily target, or fixed-day rows have empty/invalid `schedule_days`. Do not expose raw private habit names in support notes.
- If a habit check-in is wrong for today: use `Reset`, `Undo`, or `Undo rest day` on the habit row, then log the correct count, minutes, time, done state, or rest day again. Duplicate same-day build/timed/rest check-ins should update the same `user_id` + `habit_id` + `check_in_date` row, not create multiple competing facts.
- If a quit habit shows the wrong days-since or consistency count: verify `habit_definitions.start_date`, `habit_definitions.last_lapse_date`, and owner-scoped `habit_check_ins.value_boolean = false` lapse rows from the quit date through the selected date. Use `Undo slip` if today was logged by mistake; do not ask the user to describe the sensitive habit label.
- If a timed habit timer fails or the browser closes before saving: same-day running/paused timer state is persisted locally per user, habit, and date, but remains local-only until `Finish` or `Add manual time` writes a check-in. If local storage is unavailable, corrupted, stale, or from a previous date, the UI falls back to the saved duration minutes and the user can add observed external minutes through `Manual time`. Diagnose server truth by checking the owner-scoped `habit_check_ins` row for that date; the visible total may include unsaved local timer state, so do not treat local timer state alone as completion evidence.
- If a user asks whether habit labels such as weight-loss, sugar, chips, smoking, wake time, or reading habits are used for public analytics: treat habit names, quit goals, lapses, notes, and check-ins as private training/life data. Do not ask the user to send sensitive habit details; diagnose with row existence, timestamps, status, mode, schema/RLS state, and redacted analytics payloads instead.

## Security Rules

- Do not ask users to send sign-in links, one-time codes, session cookies, or raw auth errors.
- Do not expose another user's email, Stripe customer, invoice, or entitlement data while diagnosing support cases.
- Account email is display identity, not a route identifier or authorization key by itself.
- Passkeys and Face ID are not live account-management features until a separate auth architecture brief ships them.
