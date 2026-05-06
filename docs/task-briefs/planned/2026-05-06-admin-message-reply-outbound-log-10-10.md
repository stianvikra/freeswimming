# Task Brief: Admin Message Reply And Outbound Log (10/10)

## Metadata

- `id`: `2026-05-06-admin-message-reply-outbound-log-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-06`

## Goal

Allow admin to reply to stored messages from the dashboard while saving replies and outbound delivery attempts in the app before provider delivery, with honest status and retry handling.

## Dependency Order

- Parent: `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Must follow:
  - `docs/task-briefs/done/2026-05-06-admin-message-delivery-provider-contract-10-10.md`
  - `docs/task-briefs/in-progress/2026-05-06-admin-message-inbox-10-10.md`

## Reply Truth Contract

- "Reply saved" means the app has the reply.
- "Accepted by provider" means provider accepted the send request, not necessarily inbox delivery.
- "Failed" means the reply remains in app history and can be retried or cancelled.
- Provider failure must not delete reply body or hide it from admin.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                      | Evidence                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Reply workflow fits message detail view and outbound log without creating a separate CRM model.                         | IA review + route sweep            | `5/5`                   |
| UX flow clarity                               | `target`     | Compose, save, send, provider accepted, failed, retry, cancel, and replied states have clear next actions.              | admin E2E + manual QA              | `5/5`                   |
| Visual design quality                         | `target`     | Reply composer/log uses admin workspace density and avoids nested modal/card clutter.                                   | screenshot handoff                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Reply record is saved before provider call; delivery attempts are auditable; retries do not duplicate hidden messages.  | unit/route tests                   | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can reply, see history, retry failed sends, and understand provider state without leaving dashboard.              | admin workflow QA                  | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Composer, errors, retry controls, confirmations, and status logs are keyboard and screen-reader accessible.             | component/e2e a11y tests           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Reply UI/log fetches are bounded; provider send does not block unrelated admin interactions.                            | request/perf review                | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Reply drafts, saved replies, and provider attempts have explicit local/server boundaries.                               | data contract + tests              | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Reply save/send/retry refreshes message detail and list status deterministically.                                       | route/cache tests                  | `5/5`                   |
| Reliability and failure handling              | `target`     | Save failure, provider failure, retry failure, stale message, and unauthorized send have deterministic behavior.        | negative-path tests                | `5/5`                   |
| Security and authz                            | `target`     | Only authorized admins can draft/send/retry/cancel replies; destination email is validated and auditable.               | admin authz tests                  | `5/5`                   |
| Privacy and compliance                        | `target`     | Reply content is stored intentionally, logs redact free text, and outbound data is limited to needed recipient/content. | privacy/log review                 | `5/5`                   |
| Content governance                            | `target`     | Reply lifecycle, status history, and delivery attempts are governed by app records, not provider inbox state.           | workflow/schema review             | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin can create, review, send, retry, cancel, and inspect replies safely with clear confirmations.                     | admin tests + manual QA            | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because admin reply surfaces are private and must not affect crawlable public pages.                                | explicit scope rationale           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because reply content is private support/admin content and not public AI-discoverable material.                     | explicit scope rationale           | `N/A`                   |
| Analytics and KPI observability               | `target`     | Reply saved/sent/failed/retried events use safe metadata and no reply body.                                             | event tests/catalog                | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: replies may support sales questions but do not create payment, entitlement, or invoice state.          | explicit commerce scope rationale  | `4/5`                   |
| Incident response and support operations      | `target`     | Operators can diagnose "did we reply?" and "did provider accept it?" from outbound log/runbook.                         | runbook + diagnostic review        | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance records change; commerce-related replies remain support communications.                     | explicit finance scope rationale   | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: status labels and future template hooks remain localizable; no translated reply system ships now.      | copy/status review                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing admin UI, route handlers, Supabase, and delivery provider adapter; no CRM/mailbox dependency by default.   | package diff + code review         | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover draft/save/send/retry/fail/authz/stale states and provider adapter failures.                                | unit/route/E2E tests + verify gate | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Reply send/retry is rate-limited and bounded; log pagination avoids unbounded history fetches.                          | rate-limit/query review            | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Reply feature can be disabled/rolled back without deleting stored messages or replies.                                  | feature flag/rollback notes        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reply composer lives inside admin message module boundary,
  - server actions/API routes own save/send/retry.
- TypeScript/domain:
  - reply lifecycle and provider result types are explicit.
- Supabase:
  - reply and delivery-attempt tables are role-gated and indexed by message ID.
- External services:
  - use provider adapter only after reply is saved.
- Testing:
  - provider failures are mocked and deterministic.

## Data Placement And Sync Contract

- Server-canonical:
  - saved replies and outbound delivery attempts.
- Local-only:
  - unsaved compose text until explicit save/send,
  - optimistic pending UI only.
- Sync policy:
  - save reply -> attempt provider send -> update delivery attempt -> refresh detail/list,
  - failed provider send keeps saved reply and exposes retry.
- Retention and sensitivity:
  - reply content is private support/admin data,
  - logs/events exclude reply body.
- Cache/invalidation:
  - admin detail and list refresh after reply status changes.

## Identity And Rename Contract

- Canonical stable ID:
  - reply ID and delivery attempt ID.
- Human-readable identifiers:
  - subject/status labels are display metadata.
- Mutability rules:
  - sent/accepted replies are immutable except redaction/delete workflow,
  - failed drafts may be edited/retried according to workflow policy.
- Rename vs repurpose:
  - status label renames are allowed; status semantics need migration if changed.
- Compatibility:
  - historical replies remain visible after provider migration.
- Observability and repair:
  - failed attempts are retryable and visible from message detail.

## Scope

- Admin reply composer and outbound log.
- Reply save/send/retry/cancel routes.
- Provider adapter integration for reply delivery.
- Reply status copy and diagnostics.

## Out Of Scope

- Inbound email threading.
- Shared team inbox assignment/SLA.
- Marketing templates/campaigns.
- User-facing authenticated inbox.

## Acceptance Criteria

1. Admin can send replies from stored messages.
2. Reply history remains in the app even if provider delivery fails.
3. Provider status is honest and does not overclaim final inbox delivery.
4. Unauthorized reply/send/retry attempts fail closed.

## Validation

- `npm run lint:briefs`
- targeted admin route tests
- targeted admin component/e2e tests
- screenshot handoff for reply UI
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-06 | planned | created as child of admin message management parent to own dashboard replies and outbound delivery log after provider contract and inbox exist | next: execute after admin inbox child`
