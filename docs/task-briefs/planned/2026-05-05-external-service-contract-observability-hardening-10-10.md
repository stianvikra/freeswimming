# Task Brief: External Service Contract And Observability Hardening (10/10)

## Metadata

- `id`: `2026-05-05-external-service-contract-observability-hardening-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-06`

## Goal

Create one external-service contract matrix for Stripe, Resend, analytics, QR/export delivery, Supabase operational diagnostics, and future AI providers so integrations have explicit official-docs baselines, secrets boundaries, idempotency/retry behavior, observability, and rollback rules.

## Why This Brief Exists

The platform architecture audit found release-safe service usage, but no single service matrix. Current service surfaces include:

- Stripe Checkout, portal, webhook, entitlements, invoice/billing reconciliation,
- Resend contact/download resend email delivery,
- first-party analytics events,
- QR redirect and export artifacts,
- Supabase diagnostics and egress response,
- future AI/provider boundaries for swim session/program generation.

This brief is now also a prerequisite for the Admin Message Management parent:

- `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`

The message-management driver makes the Resend/email-service contract concrete: the platform must support One.com/SMTP or another delivery provider without making provider delivery the source of truth for inbound messages, admin replies, or support diagnostics.

## Admin Message Delivery Dependency

- The external-service matrix must include a `message_delivery` service entry before Admin Messages v1 implementation starts.
- The `message_delivery` entry must define:
  - current provider choice (`smtp`/One.com-compatible, Resend, or another provider),
  - official docs baseline for the selected provider,
  - server-only secret boundary,
  - provider adapter contract,
  - timeout and retry rules,
  - redacted error/log fields,
  - support-visible diagnostics,
  - disable/swap/rollback behavior.
- Provider delivery must not be the only copy of any inbound request or admin reply.
- User-facing copy must distinguish "request stored in the platform" from "email accepted by provider".

Stripe review used the repo's Stripe best-practice skill guidance: one-time web checkout should prefer Checkout Sessions, webhook fulfillment should verify signatures, and finance/reconciliation paths should remain explicit.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Security and authz`
- `Privacy and compliance`
- `Commerce and revenue ops`
- `Incident response and support operations`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                             | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Each external service has an owner, product purpose, fallback, and launch-criticality classification.                          | service matrix                         | `5/5`                   |
| UX flow clarity                               | `target`     | User-facing failure states for checkout, portal, email, export, analytics, and future AI calls are recoverable or explicit.    | flow/error review                      | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this service-contract slice changes no UI unless a later implementation child adds failure-state UI.               | explicit scope rationale               | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Service side effects are idempotent or safely repeatable; entitlement, email, export, and analytics records stay consistent.   | contract tests + reconciliation notes  | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin service controls should remain understandable if operations/commerce tabs are touched.                  | admin QA scope review                  | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: changed service failure UI, if any, must preserve accessible status/alert semantics.                          | component/E2E tests if UI changes      | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Service calls avoid blocking public route rendering unless required; retries/backoff cannot create runaway traffic.            | route/perf review                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Each service entry states what is repo/server-canonical, provider-canonical, local-only, and transient.                        | service matrix                         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Provider state, entitlement state, export state, and analytics state have explicit freshness/invalidation rules.               | cache/freshness matrix                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Timeouts, provider failures, invalid webhooks, duplicate events, and retryable errors have deterministic behavior.             | negative-path tests + runbook          | `5/5`                   |
| Security and authz                            | `target`     | Secrets remain server-only; webhooks/signatures/authz fail closed; no raw env values or tokens appear in logs/docs.            | secret/log review + tests              | `5/5`                   |
| Privacy and compliance                        | `target`     | Emails, prompts, analytics, logs, exports, and diagnostics minimize PII and sensitive free text.                               | payload review                         | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: provider-generated or delivered content should map to existing source-of-truth rules.                         | matrix review                          | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin service controls keep current role gates and recovery affordances if touched.                           | admin route review                     | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: service changes should not alter public metadata/crawl posture unless explicitly scoped.                      | scope review                           | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: future AI provider prompts and outputs are private by default and must not leak public crawl content.         | AI service boundary notes              | `4/5`                   |
| Analytics and KPI observability               | `target`     | Events keep a stable typed taxonomy, safe payloads, and support-visible success/failure diagnostics.                           | event catalog + tests                  | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Stripe checkout, portal, webhook, entitlement, invoice/refund evidence, and reconciliation rules remain explicit.              | finance checklist + Stripe route tests | `5/5`                   |
| Incident response and support operations      | `target`     | Each critical service has diagnostics, escalation, disable/rollback, and owner path.                                           | runbook/service matrix                 | `5/5`                   |
| Finance and reporting operations              | `target`     | Revenue, entitlement, refund, invoice, and customer IDs remain reconcilable and redacted in support artifacts.                 | finance reconciliation evidence        | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: service error/status copy should remain localizable later; no locale routing is changed.                      | explicit i18n scope rationale          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use official SDK/docs and existing repo helpers; no new service dependency without explicit owner approval.                    | package diff + docs baseline           | `5/5`                   |
| Testing and QA automation                     | `target`     | High-risk service paths have unit/route tests for success, deny, invalid payload, duplicate/retry, and provider failure cases. | test matrix + verify gate              | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Provider calls, retries, analytics, AI prompts, and export operations have cost/rate-limit guardrails.                         | cost/rate-limit review                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Services can be disabled, rolled back, or temporarily upgraded without data corruption.                                        | rollback/runbook notes                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- External services:
  - use official SDK/docs baselines where practical,
  - keep secrets server-only,
  - document idempotency/retry/webhook verification,
  - keep redacted diagnostics and support evidence.
- Stripe:
  - keep one-time checkout on Checkout Sessions unless a later brief justifies another Stripe API,
  - keep webhook signature verification and entitlement reconciliation explicit.
- Resend / SMTP / message delivery:
  - keep email calls server-side and rate-limited,
  - treat provider delivery as an adapter behind app-canonical messages/replies,
  - allow provider swap without data migration for historical messages.
- Analytics:
  - keep first-party typed event names before adding vendors.
- AI:
  - future provider work must define prompt minimization, disable/rollback, cost ceilings, and schema validation.

## Data Placement And Sync Contract

- Provider-canonical:
  - Stripe payment/customer/session/invoice records and provider email delivery status.
- Server-canonical:
  - entitlements, product mapping, analytics records, download resend attempts, Admin Message inbound/reply records, delivery attempts, QR/export state, and accepted AI outputs when future AI is implemented.
- Local-only:
  - transient UI state and client event dispatch attempts before server acceptance.
- Sync policy:
  - service side effects must be idempotent or safely repeatable and reconcilable.
- Cache/invalidation:
  - provider state freshness and local entitlement visibility must be documented per service.

## Identity And Rename Contract

- Canonical stable ID:
  - provider IDs such as Stripe session/customer IDs and internal entitlement/product IDs remain immutable references.
- Human-readable identifiers:
  - product titles, email copy, analytics labels, export filenames, and future AI labels are presentation fields.
- Rename vs repurpose:
  - product/payment or provider intent changes require new mapping/versioning rather than silent repurpose.
- Compatibility:
  - reconciliation and support must resolve historical provider/internal IDs after label changes.

## Scope

- Service matrix for Stripe, Resend/SMTP/message delivery, analytics, QR/export, Supabase diagnostics, and future AI providers.
- Runtime tests only where the matrix identifies an immediate high-risk gap.
- Runbook/checklist updates for launch-critical services.

## Out Of Scope

- Replacing Stripe or Resend as part of this architecture brief.
- Implementing Admin Messages runtime behavior; that belongs to the Admin Message Management child briefs.
- Adding a new analytics or AI vendor.
- Redesigning checkout, contact, or export UI.
- Schema changes unless a child implementation slice explicitly owns them.

## Acceptance Criteria

1. A canonical external-service matrix exists with owner, docs baseline, secrets, idempotency/retry, observability, support, finance, and rollback fields.
2. Stripe/commerce paths have explicit reconciliation and failure-mode evidence.
3. Resend/contact/download resend/message-delivery paths have explicit rate-limit, fallback, provider-swap, and privacy rules.
4. Future AI provider work cannot start without prompt/data/cost/rollback entries in the matrix.

## Validation

- `npm run lint:briefs`
- targeted route/unit tests if runtime behavior changes
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-05-06 | planned-update | Admin Message Management parent and child briefs now depend on this brief for provider-independent message delivery; service matrix must include message_delivery before contact intake/reply implementation | next: execute this architecture slice before Admin Messages runtime work`
- `2026-05-05 | planned | created by platform architecture audit to consolidate service integration contracts before launch scope, finance ops, and future AI provider work expand | next: execute after or alongside pre-live secrets/config governance`
