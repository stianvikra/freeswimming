# Task Brief: Admin Message Inbox (10/10)

## Metadata

- `id`: `2026-05-06-admin-message-inbox-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-06`

## Goal

Build the admin inbox for stored platform messages so admin can read, filter, search, status, archive, delete, and diagnose inbound messages from the dashboard without adding more chaos to existing admin managers.

## Dependency Order

- Parent: `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Must follow:
  - `docs/task-briefs/in-progress/2026-05-05-admin-workspace-contract-decomposition-10-10.md` enough to establish the admin message module boundary.
  - `docs/task-briefs/planned/2026-05-06-contact-intake-message-storage-10-10.md`
- Feeds:
  - `docs/task-briefs/planned/2026-05-06-admin-message-reply-outbound-log-10-10.md`

## Admin Workflow Target

- Inbox list:
  - status tabs/filter: `new`, `read`, `needs_reply`, `replied`, `archived`,
  - source filters: early access, contact, video analysis, goals coaching,
  - search by email/name/source/message excerpt,
  - newest-first pagination.
- Detail view:
  - message content,
  - structured intake fields,
  - delivery/notification state,
  - status history,
  - actions: mark read/unread, needs reply, archive, delete/restore.
- Delete policy:
  - archive is the default reversible admin action,
  - hard delete or redaction requires explicit role/confirmation and audit policy.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Admin editor ergonomics`
- `Admin workflow and editability`
- `Security and authz`
- `Privacy and compliance`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                          | Evidence                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin messages have a clear dashboard entrypoint, list/detail hierarchy, and no duplicate admin navigation model.           | admin IA review + route sweep                     | `5/5`                   |
| UX flow clarity                               | `target`     | Read, triage, archive, delete, restore, empty, loading, error, and retry states have obvious next actions.                  | admin E2E + manual QA                             | `5/5`                   |
| Visual design quality                         | `target`     | Inbox matches admin workspace density/tokens and avoids nested-card clutter or oversized marketing layout.                  | screenshot handoff desktop/mobile                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Status transitions are deterministic; archive/delete do not corrupt message content or reply history.                       | unit/route tests                                  | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can triage common messages quickly with minimal clicks, clear filters, and visible failure/notification state.        | admin workflow QA                                 | `5/5`                   |
| Accessibility (a11y)                          | `target`     | List/detail/actions preserve keyboard flow, labels, focus, dialogs, aria-live alerts, and contrast.                         | component/e2e a11y checks                         | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Admin list is paginated/search-bounded and does not materially regress admin route payload or interaction latency.          | build/perf review + request count review          | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical messages/statuses are separated from local filters, selection, and pending action state.                   | data-boundary review                              | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin reads are private/no-store or explicitly refreshed; mutations refresh affected list/detail state.                     | route/cache tests                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Fetch/status/archive/delete failures are recoverable and do not lose current selection or local UI context.                 | failure-path tests                                | `5/5`                   |
| Security and authz                            | `target`     | Admin inbox and actions fail closed with `401`/`403`; public users cannot read messages.                                    | authz negative-path tests                         | `5/5`                   |
| Privacy and compliance                        | `target`     | Inbox masks/minimizes sensitive metadata where practical; delete/archive policy is explicit; logs avoid message free text.  | privacy/log review                                | `5/5`                   |
| Content governance                            | `target`     | Message status, source, audit, archive/delete, and read-state changes have one source of truth.                             | schema/workflow review                            | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin can safely read, status, archive, delete/restore, and diagnose messages according to role permissions.                | admin route/component tests                       | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because admin inbox is private and must not be crawlable or added to sitemap/metadata surfaces.                         | explicit scope rationale                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private message content must not be exposed to AI-discoverable public surfaces.                                 | explicit scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `target`     | Admin triage/status/archive/delete events use safe payloads and support KPI counts without message body leakage.            | event catalog/tests                               | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: messages may include sales inquiries, but this inbox changes no checkout, entitlement, invoice, or refund. | explicit commerce scope rationale                 | `4/5`                   |
| Incident response and support operations      | `target`     | Inbox exposes enough diagnostics to answer "did we receive it?" and "did notification fail?" quickly.                       | support runbook + manual operator walkthrough     | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reporting changes; commerce-related messages remain inquiries, not revenue records.             | explicit finance scope rationale                  | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels/status keys are structured for later localization; no locale routing ships in this child.           | copy/status key review                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing admin primitives, typed view-models, route handlers, Supabase RLS, and no new UI/state dependency.             | package diff + architecture review                | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/route/E2E/screenshot coverage protects filters, details, status actions, archive/delete, authz, and failure states.    | targeted tests + screenshot handoff + verify gate | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pagination, indexes, search bounds, and request batching avoid unbounded admin queries.                                     | query/index review                                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Inbox can roll back without losing stored messages; migrations and UI routes have safe fallback behavior.                   | rollback notes + migration review                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - use a typed admin message module boundary,
  - avoid adding inbox state to oversized existing admin managers,
  - route handlers own admin mutations.
- UI:
  - reuse current admin workspace primitives and table/list/detail patterns,
  - screenshot handoff required.
- Supabase:
  - admin-only reads and writes through RLS/role gates,
  - indexes for list/filter/search.
- Testing:
  - component/unit tests for state transitions,
  - E2E for admin inbox flows,
  - negative-path route tests for `401`/`403`/not found.

## Data Placement And Sync Contract

- Server-canonical:
  - message rows, admin status, archive/delete markers, read markers, diagnostic fields.
- Local-only:
  - current filter, search input, pagination cursor, selected row, pending confirmation state.
- Sync policy:
  - explicit admin mutation -> server confirmation -> refresh list/detail,
  - failed mutation leaves prior server state visible and recoverable.
- Retention and sensitivity:
  - archive is reversible,
  - hard delete/redaction policy must be explicit and role-gated.
- Cache/invalidation:
  - admin message reads use private no-store or deterministic refresh after mutation.

## Identity And Rename Contract

- Canonical stable ID:
  - internal message ID.
- Human-readable identifiers:
  - source label, subject/excerpt, submitter name/email are display/search metadata.
- Mutability rules:
  - content immutable except redaction/delete,
  - status/archive/delete markers mutable by role-gated admin actions.
- Rename vs repurpose:
  - status labels may rename; status semantics require migration/versioning if changed materially.
- Compatibility:
  - older message variants remain visible with fallback labels.
- Observability and repair:
  - invalid/missing messages return deterministic errors and produce redacted diagnostics.

## Scope

- Admin inbox route/module boundary.
- Message list/detail UI.
- Status, archive, delete/restore admin actions.
- Help/Guide/runbook impact for new admin workflow.

## Out Of Scope

- Sending replies.
- Inbound email parsing.
- Team assignment/SLA/macros.
- Marketing message campaigns.

## Acceptance Criteria

1. Admin can find and inspect all stored public intake messages.
2. Admin can status, archive, delete/restore messages safely.
3. Unauthorized users cannot read or mutate messages.
4. Inbox UI is screenshot-reviewed and does not worsen admin workspace complexity.

## Validation

- `npm run lint:briefs`
- targeted admin unit/component tests
- targeted admin route negative-path tests
- targeted admin E2E + screenshot handoff
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-06 | planned | created as the admin workflow child after owner requested dashboard management for messages before test swimmers; depends on admin workspace boundary work to avoid adding another large admin manager | next: execute after contact intake storage and admin workspace contract dependency`
