# Task Brief: Contact Intake Message Storage (10/10)

## Metadata

- `id`: `2026-05-06-contact-intake-message-storage-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-06`

## Goal

Change public contact and early-access intake so submissions are stored in the app before user success, with delivery notification treated as secondary provider work.

## Dependency Order

- Parent: `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Should follow:
  - `docs/task-briefs/planned/2026-05-06-admin-message-delivery-provider-contract-10-10.md`
- Feeds:
  - `docs/task-briefs/planned/2026-05-06-admin-message-inbox-10-10.md`

## Current Problem

- `/contact?source=preview_access_notify` maps to `preview_access_notify` and posts to `/api/contact`.
- `/api/contact` currently uses email as the delivery path.
- If `CONTACT_TO_EMAIL` is missing, the route logs server-side and still returns `ok: true`.
- That can show a false user success state even when no operator receives the request.

## Target User-Facing Truth Contract

- Success copy means: "The platform received and stored the request."
- It must not mean: "Email was sent" unless email delivery is separately proven.
- If storage fails, the user sees a clear retryable error.
- If storage succeeds but notification email fails, the user may see success, while admin/ops sees `notification_failed`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                         | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contact, early access, analysis, and goals coaching intake have one canonical storage path and source classification.      | route/API contract review                | `5/5`                   |
| UX flow clarity                               | `target`     | User-facing success/error copy is honest for stored, validation failed, rate limited, and storage failed states.           | copy matrix + form tests                 | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: copy/state changes preserve existing contact form visual language unless a child UI polish is opened.     | screenshot only if visual layout changes | `4/5`                   |
| Business logic correctness and data integrity | `target`     | API inserts message before returning success; duplicate/invalid inputs do not corrupt or silently drop requests.           | route tests + migration/RLS review       | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: stored records include fields needed for later admin triage without admin UI in this child.               | schema review                            | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Form errors and success states preserve labels, focus movement, aria-live semantics, and keyboard operation.               | component/e2e a11y tests                 | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Public submit path stays lightweight and does not add client JS bloat; DB/provider work is bounded.                        | build/perf review + route timing         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Public form draft is local-only; submitted message is server-canonical; notification attempt is separate.                  | data contract + tests                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | `/api/contact` remains no-store; admin message lists later refresh from server-canonical storage.                          | route headers/cache review               | `5/5`                   |
| Reliability and failure handling              | `target`     | Validation, origin deny, rate limit, DB failure, provider failure, and unexpected errors return deterministic status/copy. | negative-path tests                      | `5/5`                   |
| Security and authz                            | `target`     | Public route keeps origin/content/rate/honeypot checks; admin reads are not exposed; service-role usage is minimal.        | security tests + RLS review              | `5/5`                   |
| Privacy and compliance                        | `target`     | PII/free text are stored intentionally, minimized in logs/events, and covered by retention/delete policy.                  | log/event privacy review                 | `5/5`                   |
| Content governance                            | `target`     | Intake records preserve source variant and structured fields without ad hoc email-only formatting as source of truth.      | schema/domain tests                      | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: records include status fields needed for inbox workflows implemented later.                               | schema contract                          | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes private POST behavior and form states, not public metadata, sitemap, robots, or indexability.     | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because contact submissions are private and not AI-discoverable public content.                                        | explicit scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `target`     | Intake accepted/failed/rate-limited/provider-notification-failed events use safe payloads and no free text.                | event tests/catalog                      | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: goals/video inquiries may become sales signals, but no checkout, entitlement, or finance state changes.   | explicit commerce scope rationale        | `4/5`                   |
| Incident response and support operations      | `target`     | Operators can diagnose missing intake, DB failures, provider notification failures, and env misconfiguration.              | runbook + admin/ops diagnostics          | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance ledger/reporting changes; stored inquiries must not be treated as revenue records.             | explicit finance scope rationale         | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: success/error/status copy should use stable keys or centralized constants for later localization.         | copy review                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js route handlers, Supabase migrations/RLS, TypeScript validation, and provider adapter contract.        | code review + package diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/route/e2e tests cover valid submit, preview notify, missing config, DB fail, provider fail, authz, and rate limit.    | tests + verify gate                      | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Rate limits, indexes, payload size limits, and notification retries prevent abuse/cost blowups.                            | schema/index/rate-limit review           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration, env, feature-flag/rollback path, and pre-live smoke checks are documented.                                      | migration rollback notes + env parity    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep public contact form as existing client surface unless copy/failure states require small changes,
  - route handler owns canonical validation and storage.
- TypeScript/domain:
  - centralize intake variant and message payload validation.
- Supabase:
  - explicit migration for message storage,
  - RLS blocks non-admin reads,
  - indexes for created_at, status, source variant, email where needed.
- External services:
  - use delivery provider contract for admin notification after DB insert.
- Testing:
  - contact API negative-path tests must include storage failure and provider notification failure.

## Data Placement And Sync Contract

- Server-canonical:
  - inbound message row and normalized structured intake fields.
- Local-only:
  - unsent form draft, validation focus state, UI status before server response.
- Sync policy:
  - submit -> validate -> insert message -> attempt notification -> return honest result,
  - storage success is sufficient for user success,
  - notification failure updates delivery attempt/admin diagnostics.
- Retention and sensitivity:
  - store only necessary request data,
  - redact logs and analytics,
  - deletion/archive policy is owned by inbox/ops children.
- Cache/invalidation:
  - POST responses are no-store,
  - admin lists refresh after insert/status changes later.

## Identity And Rename Contract

- Canonical stable ID:
  - internal message ID.
- Human-readable identifiers:
  - source labels and submitter names are editable display/search fields only if later admin workflow allows correction.
- Mutability rules:
  - original submitted content is immutable except redaction/delete.
- Rename vs repurpose:
  - source variant labels may rename; semantic source keys require migration/versioning if repurposed.
- Compatibility:
  - current variants remain readable: `contact`, `preview_access_notify`, `analysis`, `goals_coaching`.
- Observability and repair:
  - failed inserts return user error; failed notifications are visible to admin/ops.

## Scope

- `/api/contact` behavior and contract.
- Public contact/preview notify success/error copy if needed.
- Supabase message storage schema and RLS.
- Notification attempt creation through provider contract.

## Out Of Scope

- Admin inbox UI.
- Admin reply UI.
- Inbound email parsing.
- Marketing/newsletter flows.

## Acceptance Criteria

1. Public intake returns success only after durable app storage.
2. Missing email provider config cannot cause silent data loss or false delivery claim.
3. Existing contact variants are preserved and classified in stored records.
4. Admin can later read records through admin-only paths without schema rework.

## Validation

- `npm run lint:briefs`
- targeted contact API route tests
- targeted contact form e2e/component tests if copy/state changes
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-06 | planned | created after preview access/contact triage showed current email-only delivery can return success without configured recipient; this child owns DB-first intake and honest public success states | next: execute after provider contract child`
