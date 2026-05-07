# Admin Message Inbox Runbook

Last updated: 2026-05-07

## Purpose

Use this runbook when an operator needs to confirm whether a public intake request was received, why an admin notification did or did not send, how to reply from the normal email inbox, or how to recover from an accidental inbox status change.

## Source Of Truth

- `admin_messages` is the server-canonical inbound message record.
- `admin_message_delivery_attempts` is provider diagnostic evidence.
- Email delivery is not the message system. A disabled or failed notification does not mean the request was lost.
- For v1, the normal email inbox remains the daily reply workspace. `/admin?tab=messages` is the form-submission safety net and diagnostic view.

## Triage

1. Open `/admin?tab=messages`.
2. Start with the `New` filter, then use `Source` and search by submitter or message excerpt.
3. Open the message detail and verify stored content, structured intake, and request diagnostics.
4. If a response is needed, set `Needs reply` and reply from the normal email inbox.
5. After replying in email, mark the row `Replied`.
6. If no response is needed, use `Archive`.
7. Use `Move to deleted` only for intentionally removed workflow items; restore returns the row to `New`.

## E-mail-First Reply Rule

- Do not compose, send, or log replies inside `/admin?tab=messages` for v1.
- Use the normal support mailbox as the single daily reply inbox.
- Use `Needs reply` only to make response intent visible in the dashboard.
- Use `Replied` only after the response was sent from email.
- If an email thread is missing, keep the app row as the intake source of truth and reply from email using the stored submitter address.

## Notification Diagnosis

- `Accepted`: provider accepted the notification attempt.
- `Queued`: attempt exists but has not been finalized.
- `Disabled`: provider or recipient configuration is disabled/missing.
- `Retryable failure`: provider failed in a way that may be retried later.
- `Failed`: provider rejected or failed finally.

Escalate with message ID, source, status, notification status, delivery error code, and deployment/environment. Do not paste message free text into logs, analytics, or GitHub unless the owner explicitly approves that disclosure.

## Recovery

- Wrong status: use the matching action to move it back, or restore archived/deleted rows.
- Missing row: confirm the public submit path returned success after storage, then check `/api/contact` and Supabase migration/env readiness.
- Notification failed: keep the message row as received, fix provider config or follow the ops closeout recovery path. Do not create a dashboard reply workflow in v1.

## Env Parity

Confirm these are present in Preview and Production before inviting test swimmers:

- `CONTACT_TO_EMAIL`
- `CONTACT_ALLOWED_ORIGINS`
- `MESSAGE_DELIVERY_PROVIDER`
- `MESSAGE_DELIVERY_FROM_EMAIL`
- provider-specific secret group for the selected provider:
  - `MESSAGE_DELIVERY_RESEND_API_KEY` for `resend_api`,
  - `MESSAGE_DELIVERY_SMTP_HOST`, `MESSAGE_DELIVERY_SMTP_USER`, and `MESSAGE_DELIVERY_SMTP_PASSWORD` for SMTP providers.

Do not print or paste secret values. Record only presence/status and provider key in PR or incident evidence.

## Pre-Live Smoke

Use `docs/checklists/admin-message-v1-pre-live-smoke.md` before first test swimmer intake.

Minimum pass condition:

- public contact/preview/goals intake returns success only after storage,
- `/admin?tab=messages` opens for an admin or editor,
- message row shows stored content and privacy-safe diagnostics,
- notification state is `Accepted`, `Disabled`, `Retryable failure`, or `Failed` with no raw secrets or message text in logs,
- admin can set `Needs reply`, reply from email, then mark `Replied`,
- archive/delete/restore behavior is reversible except intentional future redaction workflows.

## Rollback

If message intake or notification delivery regresses:

1. Preserve stored `admin_messages` rows; do not delete intake history during rollback.
2. Disable or swap provider config with `MESSAGE_DELIVERY_PROVIDER=disabled` if provider delivery is the failing layer.
3. Redeploy the last known-good app version if storage, authz, or validation regressed.
4. Re-run the pre-live smoke checklist and append incident evidence with message IDs only, not message body text.
