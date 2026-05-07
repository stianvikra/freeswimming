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
