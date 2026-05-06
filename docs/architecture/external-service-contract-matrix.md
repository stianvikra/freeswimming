# External Service Contract Matrix

## Purpose

This matrix is the canonical contract for external and provider-like services used by
Freeswimming. Use it before adding or changing any route, background task, admin workflow, or
runbook that touches:

- payment, billing, entitlement, refund, or finance evidence,
- email or message delivery,
- analytics and KPI events,
- QR redirects or export artifacts,
- Supabase operational diagnostics,
- future AI/model providers.

The route-level auth/cache registry stays canonical for individual route handlers:
`docs/architecture/data-access-authz-cache-contract-registry.md`.

## Official Docs Baseline

Verified on `2026-05-06`. Re-check the linked official docs before changing provider behavior,
secrets, webhook handling, idempotency, retries, or finance reporting.

| Provider / surface      | Official baseline                                                                                                                                                                                                                                                        | Repo interpretation                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stripe Checkout         | [Create a Checkout Session](https://docs.stripe.com/api/checkout/sessions/create), [Idempotent requests](https://docs.stripe.com/api/idempotent_requests), [Webhook signatures](https://docs.stripe.com/webhooks/signature)                                              | Use Stripe-hosted Checkout Sessions for one-time web checkout unless a later brief justifies another API. Keep webhook signature verification and session/customer/invoice reconciliation.       |
| Stripe Billing Portal   | [Customer Portal Sessions](https://docs.stripe.com/api/customer_portal/sessions), [Customer portal guide](https://docs.stripe.com/customer-management)                                                                                                                   | Create portal sessions on demand for the authenticated user's resolved Stripe customer only. Do not accept customer IDs from the browser.                                                        |
| Resend API / SMTP       | [Send Email API](https://resend.com/docs/api-reference/emails), [Send emails with SMTP](https://resend.com/docs/send-with-smtp), [Receiving emails](https://resend.com/docs/dashboard/receiving/introduction)                                                            | Current contact email uses the API route-local fetch implementation. Future provider adapters may use Resend API or SMTP with provider IDs and idempotency keys where available.                 |
| One.com SMTP-compatible | [Can I use your SMTP server to send emails?](https://help.one.com/hc/en-us/articles/115005594305-Can-I-use-your-SMTP-server-to-send-emails), [Can I send emails from my website?](https://help.one.com/hc/en-us/articles/115005594345-Can-I-send-emails-from-my-website) | For Vercel/app-server delivery, use mailbox SMTP settings such as `send.one.com` with authenticated mailbox credentials. Do not rely on `mailout.one.com` unless the website is hosted there.    |
| Supabase diagnostics    | [Manage egress usage](https://supabase.com/docs/guides/platform/manage-your-usage/egress), [Logging](https://supabase.com/docs/guides/platform/logs), [Storage bandwidth and egress](https://supabase.com/docs/guides/storage/serving/bandwidth)                         | Supabase remains data/auth/storage provider; diagnostics and usage are provider-canonical, while app data and incident decisions are repo/server-canonical.                                      |
| Future AI providers     | Provider TBD. The child brief must record official docs for model API, structured output, safety, privacy, retention, rate limits, and pricing before implementation starts.                                                                                             | No external AI runtime provider is selected by this matrix. Future provider work must define prompt minimization, schema validation, cost ceilings, disable/rollback, and accepted-output state. |

## Service Identity And Data Placement

| Service key                     | Current surfaces                                                                                                                                | Owner / product purpose                                               | Canonical state boundary                                                                                                                                                                           | Launch criticality |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `stripe_commerce`               | `/api/checkout/session`, `/api/portal`, `/api/stripe/webhook`, `scripts/reconcile-finance-entitlements.mjs`, admin commerce checks              | Commerce owner; payment, billing portal, entitlement grant, finance   | Stripe-canonical: checkout session, customer, invoice, payment status. Server-canonical: products, entitlements, purchaser mapping, reconciliation evidence.                                       | `P0`               |
| `contact_notification_email`    | `/api/contact`                                                                                                                                  | Support owner; notify owner about contact/analysis/goals intake       | Current pre-message-system state: provider delivery is the notification channel. Future state: inbound message row is server-canonical and email is a delivery attempt only.                       | `P1`               |
| `message_delivery`              | Planned Admin Messages v1 delivery provider boundary                                                                                            | Support owner; notify admins and send admin replies                   | Server-canonical: inbound messages, replies, delivery attempts. Provider-canonical: accepted provider message ID/status only when exposed. Provider delivery is never the only message/reply copy. | `P0` before v1     |
| `download_access_link_delivery` | `/api/download/resend`, Supabase Auth OTP email                                                                                                 | Commerce/support owner; resend access link without disclosing account | Server-canonical: entitlement and claim intent. Supabase Auth/provider-canonical: OTP email delivery lifecycle. Browser copy remains generic to avoid account enumeration.                         | `P1`               |
| `analytics_events`              | `lib/analytics/events.ts`, `/api/analytics/event`, server-side `trackAnalyticsEvent` calls                                                      | Product/ops owner; typed product and operational event taxonomy       | Repo-canonical: event names, safe payload schema, emitted console record. No third-party analytics provider is selected.                                                                           | `P1`               |
| `qr_redirects`                  | `/go/v/[slug]`, `/go/unavailable`, admin QR link routes, `docs/runbooks/qr-redirect-operations.md`                                              | Content/ops owner; stable QR destinations and fallback diagnostics    | Server-canonical: QR link registry and safe destination rules. Provider-like external state: destination host availability, not app data.                                                          | `P1`               |
| `exports_and_handoff`           | Guide PDF routes, workout/program PDF HTML routes, Garmin-ready JSON routes, poolside image/export surfaces                                     | Product/support owner; owner-scoped artifact handoff                  | Server-canonical: entitlement/workout/program rows and export display models. Local/browser-canonical only for unsaved draft previews.                                                             | `P1`               |
| `supabase_operational_diag`     | Supabase usage/logs, egress guard scripts, `docs/runbooks/supabase-egress-response.md`, `docs/runbooks/environment-config-and-secret-parity.md` | Ops owner; availability, cost, and data-access diagnostics            | Supabase-canonical: usage meters and provider logs. Repo-canonical: redacted incident notes, after-metrics, guardrail decisions, env parity rules.                                                 | `P0`               |
| `future_ai_generation`          | Planned future provider for swim session/program generation, current app-local generator contracts                                              | Product owner; structured generation after explicit provider decision | Server-canonical: accepted saved workouts/programs. Provider-canonical: transient request/response metadata only if explicitly stored and redacted. Prompts are minimized and private by default.  | `P1` planned       |

## Operational Contract

| Service key                     | Secret boundary                                                                                                                         | Idempotency / retry contract                                                                                                                                                                                              | Timeout and failure states                                                                                                                                     | Observability and support diagnostics                                                                                                                                                                          | Disable, swap, rollback                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stripe_commerce`               | `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only. Price IDs are server config. No browser-selected price/customer trust. | Checkout creation should use stable metadata/client reference. Webhook fulfillment is safe to repeat because entitlement upsert keys stay stable by Stripe session/product/user/email. Manual retries use reconciliation. | Provider create/portal failures return deterministic `500`; invalid webhooks fail `400`; ignored events return `200`; missing user paths defer safely.         | Logs include route prefix, event type, session/customer/product IDs where needed, no raw secrets. Finance evidence lives in reconciliation reports and admin commerce notes.                                   | Disable product/catalog entry, rollback deploy, rotate webhook secret, or repair entitlement from Stripe evidence. Do not delete historical Stripe/internal IDs.             |
| `contact_notification_email`    | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` are server-only. Free-text request body must not enter analytics.            | Current route performs one provider send after validation/rate limit. Future DB-first intake must create app message before delivery and use adapter idempotency keys where provider supports them.                       | Validation/origin/rate paths are deterministic. Provider send failure currently returns retryable user error. Missing recipient is dev/pre-live fallback only. | Current logs include `[ContactForm]` provider failure. Future support view must show app message stored vs provider accepted/failed separately.                                                                | Disable notification delivery by config only when app intake storage exists. Swap provider through `message_delivery`; do not migrate historical messages for provider swap. |
| `message_delivery`              | Server-only provider env controls provider key, SMTP/API host, port, auth user/password/API key, from address, reply-to, and timeout.   | Adapter must create or update an append-only delivery attempt. Initial + one bounded retry is the default ceiling unless a child brief proves a queue. SMTP retries must use deterministic `Message-ID`/attempt ID.       | Default provider timeout target: `10s`; hard ceiling: `15s`. Results: `queued`, `accepted_by_provider`, `failed_retryable`, `failed_final`, `disabled`.        | Logs and attempt rows may include internal message ID, reply ID, attempt ID, provider key, provider message ID, status, error code. No body text, credentials, raw SMTP transcript, or full provider response. | Provider can be disabled, swapped from `smtp_one_com_compatible` to `resend_api`/`resend_smtp`, or rolled back by env/config without rewriting message/reply rows.           |
| `download_access_link_delivery` | Supabase keys are server-only. Request email is hashed in logs. Browser response stays generic where account existence must be hidden.  | Rate limit is IP + email-hash scoped. OTP send is one call; retry is a new user request under the limiter. App entitlement lookup is safe to repeat.                                                                      | Invalid email `400`, rate limit `429`, provider/account lookup failures return generic success except explicit Supabase rate-limit errors.                     | Logs include `[DownloadResend]`, source, email hash, next path where safe, and provider error message only after redaction by source. Analytics emits safe source/nextPath.                                    | Roll back route, disable claim entry, or repair entitlement. Do not disclose account existence to unblock support.                                                           |
| `analytics_events`              | No analytics secret today. Optional user ID attachment uses cookie-gated server helper only.                                            | Event names are typed. Payload sanitizer redacts sensitive key names and drops complex values. Retrying client events is safe only as duplicate telemetry, not source-of-truth data.                                      | Invalid content type/JSON/name fails `415`/`400`; route is no-store and force-dynamic.                                                                         | Console record has `type`, event name, timestamp, channel, optional user ID, sanitized payload. No email/token/secret/password/cookie/authorization values.                                                    | Disable new event call sites by code/flag. Adding a vendor requires a new matrix row and privacy review before sending payloads externally.                                  |
| `qr_redirects`                  | `QR_REDIRECT_ALLOWED_HOSTS` is server config. Destination validation parses URL and validates exact protocol/hostname.                  | Redirect lookup is read-only. Admin create/update/delete follows admin route idempotency and status history. Redirect hit analytics are safe duplicate signals.                                                           | Invalid/missing/unsafe destination redirects to fallback with reason; do not hot-patch allowlists blindly.                                                     | Fallback logs include structured reason and slug. Events: `qr_redirect_hit`, `qr_link_created`, `qr_link_updated`, `qr_link_status_changed`.                                                                   | Disable QR link, restore previous destination, rollback deploy, or update allowlist after exact-host review. Keep slug stable where printed assets exist.                    |
| `exports_and_handoff`           | Protected artifact routes use auth/entitlement or owner-scoped session. Asset path overrides are server-only and repo-relative.         | Export reads are safely repeatable. Garmin-ready/PDF handoff does not mutate saved workouts unless the owning route explicitly saves first.                                                                               | Missing auth/entitlement/data returns `401`, `403`, `404`, or `503` by route contract. Export artifacts use no-store/private no-store.                         | Support evidence should name owner-scoped internal IDs and route, not raw HTML exports with personal notes unless needed and redacted.                                                                         | Roll back deploy, disable affected action, restore asset path, or repair canonical workout/program row. Avoid deleting user data for export failures.                        |
| `supabase_operational_diag`     | Supabase service-role key is server-only. Production Supabase opt-in is guarded by exact origin checks and `FS_ALLOW_PROD_SUPABASE`.    | Diagnostics are read-only unless an explicit repair/delete script owns the mutation. Local/CI production smoke requires single-command opt-in and after-metrics.                                                          | Egress thresholds: watch at `50%`, contain at `80%`, protect availability on warning/grace/`402` risk.                                                         | Use Logs Explorer and after-metrics with redacted counts, route names, and source classes only. Do not copy raw headers, IPs, cookies, tokens, emails, or user IDs.                                            | Stop local/CI traffic, rollback deploy, temporary plan upgrade, tighten caching/helper usage, or run scoped repair with evidence.                                            |
| `future_ai_generation`          | Provider API keys stay server-only. Prompts, source notes, and generated drafts are private by default.                                 | Provider calls require schema validation, deterministic retry/disable rules, and accepted-output persistence only after validation. Prompt/cost idempotency must be defined per provider.                                 | Missing provider/config returns deterministic disabled state. Invalid model output is rejected, not partially saved.                                           | Logs may include request class, schema version, token/cost bucket, provider status, redacted error code. No raw prompts or user notes in logs/analytics.                                                       | Runtime disable flag, provider swap, model rollback, cost ceiling, and fallback to manual builder must be in the child brief before launch.                                  |

## Message Delivery Adapter Contract

Admin Messages v1 must implement provider delivery behind a server-only adapter boundary. This is the minimum contract that the child brief must type and test before UI work consumes statuses.

```ts
type MessageDeliveryProviderKey =
  | "smtp_one_com_compatible"
  | "resend_api"
  | "resend_smtp"
  | "disabled";

type MessageDeliveryTarget = "inbound_notification" | "admin_reply" | "system_notice";

type MessageDeliveryStatus =
  | "queued"
  | "accepted_by_provider"
  | "failed_retryable"
  | "failed_final"
  | "disabled";

type MessageDeliveryPayload = {
  attemptId: string;
  target: MessageDeliveryTarget;
  messageId: string;
  replyId?: string;
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
};

type MessageDeliveryResult = {
  providerKey: MessageDeliveryProviderKey;
  status: MessageDeliveryStatus;
  providerMessageId?: string;
  errorCode?: string;
  retryAfterSeconds?: number;
};
```

Rules:

- The app must persist the inbound message or admin reply before provider delivery starts.
- Provider delivery can update only delivery-attempt state and redacted diagnostics.
- User-facing copy must distinguish `request stored in the platform` from
  `email accepted by provider`.
- Missing or disabled provider config must never produce a `sent`, `delivered`, or
  `accepted_by_provider` state.
- Provider swap must require config/adapter changes only, not message/reply data migration.

## Redaction Rules

Allowed in logs, delivery attempts, support notes, PR summaries, and runbooks:

- internal IDs,
- provider key,
- provider message ID when not secret,
- redacted/hashing-safe email marker,
- route/surface,
- status,
- provider error code,
- bounded count, timestamp, and severity.

Not allowed unless explicitly owner-approved and redacted in an incident artifact:

- raw env values, API keys, SMTP passwords, webhook secrets, tokens, cookies,
- full email addresses in logs or public artifacts,
- message body/free text, prompts, personal notes, raw provider response bodies,
- Stripe portal URLs, checkout URLs, or full payment method data.

## Change Gate

Before changing a service in this matrix:

1. Re-check official provider docs and record any changed baseline in the active brief.
2. Update the service row for owner, canonical state, idempotency/retry, diagnostics, finance/support impact, and rollback.
3. Update the route registry if a route handler changes.
4. Add or update the cheapest matching tests for success, deny, invalid input, duplicate/retry, and provider failure.
5. For UI/print/export-visible changes, follow the screenshot handoff rule before PR/gate continuation.
