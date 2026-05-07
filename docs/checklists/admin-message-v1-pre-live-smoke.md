# Admin Message V1 Pre-Live Smoke Checklist

## Purpose

Verify Admin Messages v1 as an e-mail-first intake safety net before inviting test swimmers.

## Scope

- Public intake storage.
- Admin message triage and diagnostics.
- Provider notification evidence.
- Normal email inbox replies.
- Rollback readiness.

Dashboard reply composition, inbound email ingestion, CRM assignment, SLA automation, and marketing email are out of scope for v1.

## Environment Evidence

Record one row per environment. Keep values non-sensitive.

| Date (UTC)       | Environment  | Operator         | Provider key              | Contact allowed origin | Recipient configured | Sender configured | Result  | Notes                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------ | ---------------- | ------------------------- | ---------------------- | -------------------- | ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-07 07:58 | `preview`    | Codex automation | `smtp_one_com_compatible` | present                | present              | present           | partial | Preview contact, goals coaching, and preview notify submissions returned `200`; admin API/browser smoke showed rows, redacted diagnostics, delivery attempts, and reversible status workflow; owner mailbox receipt/reply confirmation still pending.                                                    |
| 2026-05-07 08:22 | `production` | Codex automation | `smtp_one_com_compatible` | present                | present              | present           | pass    | Production redeploy `dpl_7vwxhecjct57GmKcD1Ad13hhQ1SA` is `READY`; contact, goals coaching, and preview notify returned `200`, admin rows show `accepted_by_provider`, reversible status workflow passed, owner confirmed One.com receipt, and admin API confirmed the real Production row is `Replied`. |

## Smoke Steps

1. Submit `/api/contact` from an allowed origin with a normal contact message.
2. Submit goals coaching intake from the public flow.
3. Submit preview-access notify intake if that entrypoint is enabled.
4. Confirm each user-facing success happened only after durable app storage.
5. Open `/admin?tab=messages` as an admin or editor.
6. Confirm the new row shows submitter, source, message or structured intake, and privacy-safe diagnostics.
7. Confirm delivery attempts show provider state without raw secrets, raw SMTP/API transcript, or copied free-text message body.
8. Mark one row `Needs reply`.
9. Reply from the normal email inbox.
10. Return to Messages and mark the row `Replied`.
11. Archive a completed row, then restore it.
12. Move a test row to `Deleted`, confirm the soft-delete prompt, then restore it.

## Failure Probes

1. Temporarily disable provider config in a non-production environment and submit a test message.
2. Confirm the app stores the message and records notification status as disabled or failed.
3. Confirm the user still sees success only because app storage succeeded.
4. Trigger invalid origin and invalid payload probes against `/api/contact`.
5. Confirm failed probes return deterministic errors and do not create dashboard work items.

## Pass Criteria

- No request can be silently lost while showing success.
- Email remains the only daily reply inbox for v1.
- Admin Messages can answer whether the app received the request and whether notification delivery was accepted, disabled, retryable, or failed.
- Rollback can disable provider delivery without deleting stored intake history.
