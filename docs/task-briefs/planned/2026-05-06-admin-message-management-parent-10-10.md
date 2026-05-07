# Task Brief: Admin Message Management Parent (10/10)

## Metadata

- `id`: `2026-05-06-admin-message-management-parent-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-07`

## Goal

Create the parent contract for a provider-independent admin message management system where inbound requests are stored in the app first, admin can diagnose and triage from the dashboard, email remains the daily reply surface for v1, and email providers can change later without losing intake history.

## Product Phase

- Pre-live, no test users yet.
- Optimize for correct platform foundation before first test swimmer intake.
- The system must be honest: no user-facing success state unless the request is durably accepted by the platform.

## Planned Execution Order

1. Create this parent and child brief set.
2. Execute `docs/task-briefs/planned/2026-05-05-external-service-contract-observability-hardening-10-10.md` with message delivery as a concrete driver.
3. Build on `docs/task-briefs/done/2026-05-05-admin-workspace-contract-decomposition-10-10.md`, which established the safe admin message module boundary.
4. Implement the message-management child briefs in order:
   - `docs/task-briefs/done/2026-05-06-admin-message-delivery-provider-contract-10-10.md`
   - `docs/task-briefs/done/2026-05-06-contact-intake-message-storage-10-10.md`
   - `docs/task-briefs/done/2026-05-06-admin-message-inbox-10-10.md`
   - `docs/task-briefs/deferred/2026-05-06-admin-message-reply-outbound-log-10-10.md`
   - `docs/task-briefs/done/2026-05-06-admin-message-ops-tests-runbook-closeout-10-10.md`

## Core Architecture Decision

- Server-canonical app data is the source of truth.
- Email is a delivery channel, not the message system.
- For v1, email is also the single daily reply workspace; Admin Messages is the safety net and diagnostic record.
- Provider-specific delivery is handled through an adapter boundary.
- Current provider may be One.com/SMTP or Resend, but provider choice must not affect stored message identity, admin workflow, or audit evidence.
- Provider secrets stay outside the repo and are never persisted in message records.

## Message Domain Model Target

- Inbound message entity:
  - stable internal ID,
  - source variant (`contact`, `preview_access_notify`, `analysis`, `goals_coaching`, future sources),
  - submitter name/email,
  - message body and structured intake fields,
  - intake status,
  - privacy-safe request metadata,
  - created/updated timestamps.
- Deferred outbound reply entity:
  - stable internal ID,
  - parent message ID,
  - admin author ID,
  - reply body,
  - status (`draft`, `queued`, `accepted_by_provider`, `failed`, `cancelled`),
  - created/updated/sent-at timestamps.
- Delivery attempt entity:
  - stable internal ID,
  - target entity (`inbound_notification`, `admin_reply`, future system mail),
  - provider key,
  - provider message ID when available,
  - attempt status,
  - redacted error code/message,
  - retry metadata.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Security and authz`
- `Privacy and compliance`
- `Admin workflow and editability`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                  | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Message management has one parent contract, one child sequence, and a clear admin/public boundary before implementation starts.                     | brief set review + dependency order                | `5/5`                   |
| UX flow clarity                               | `target`     | User/admin success, failure, retry, and partial-delivery states are named and cannot imply false email delivery.                                    | flow state matrix                                  | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting now: later UI children must preserve admin visual language and provide screenshot handoff.                                               | child UI brief requirements                        | `4/5`                   |
| Business logic correctness and data integrity | `target`     | DB-first intake is implemented for v1; reply persistence is explicitly deferred so provider attempts cannot become the only source of truth.        | domain model + child acceptance criteria           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can triage, read, archive, delete, and mark reply status without leaving the dashboard while email remains the single reply inbox.            | parent workflow contract + inbox/ops child briefs  | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting now: all later admin message UI must preserve labels, keyboard flow, focus, alerts, and modal semantics.                                 | child UI test requirements                         | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Message reads/writes must avoid public route payload bloat and define admin pagination/search before large datasets exist.                          | data/page-size contract + child briefs             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical messages and delivery attempts are separated from local form/admin UI state; future reply storage is deferred.                     | data placement contract                            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Public intake uses no-store writes; admin lists/details use private no-store or explicit refresh after mutations.                                   | cache policy in child briefs                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Storage failure, provider notification failure, duplicate submit, and manual reply-status recovery have deterministic states.                       | failure matrix + negative-path test requirements   | `5/5`                   |
| Security and authz                            | `target`     | Public intake is rate-limited and validated; admin surfaces fail closed with role checks and no cross-user data exposure.                           | RLS/authz contract + tests required                | `5/5`                   |
| Privacy and compliance                        | `target`     | PII and free text are minimized in logs, provider attempts are redacted, deletion/retention behavior is defined.                                    | privacy/logging contract + runbook child           | `5/5`                   |
| Content governance                            | `target`     | Message bodies, statuses, and provider delivery evidence have one source of truth; future reply lifecycle is deferred.                              | domain lifecycle contract                          | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin message operations have explicit status transitions, safe delete/archive semantics, and clear e-mail-first reply handling.                    | workflow state machine + child acceptance criteria | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because message management is private/admin and public form behavior changes no crawlable metadata or sitemap rules.                            | explicit scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief introduces no public AI-readable content or AI-generated message surfaces.                                                   | explicit scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `target`     | Intake, admin triage, archive/delete, and provider-failure events are defined with safe payloads; dashboard reply events are deferred.              | event taxonomy requirement                         | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: message channels may include commerce questions later, but this parent changes no checkout, entitlement, or revenue.               | explicit commerce scope rationale                  | `4/5`                   |
| Incident response and support operations      | `target`     | Admin must be able to diagnose missing intake rows, missing notifications, provider outages, and e-mail-first reply workflow from runbook evidence. | ops/runbook child brief                            | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance ledger changes; future commerce-related messages must remain searchable without becoming revenue data.                  | explicit finance scope rationale                   | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: status keys and user-visible copy must be localizable later without changing message identity.                                     | copy/status-key contract                           | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js route handlers, TypeScript validators, Supabase migrations/RLS, and a small provider adapter before adding dependencies.                | stack gate + package diff review                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Parent requires unit/route/admin E2E/negative-path coverage across all child slices before 10/10 claim.                                             | child validation matrix + verify gates             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pagination, rate limiting, retry bounds, and provider call ceilings are defined before usage grows.                                                 | scale/cost guardrail checklist                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Schema, provider config, feature flags, rollback, and migration safety are split into child slices with closeout gates.                             | rollout/rollback notes in child briefs             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - public forms keep client validation but server acceptance is canonical,
  - admin message surfaces must enter through a typed admin module boundary instead of adding state to oversized managers,
  - route handlers return deterministic JSON errors.
- TypeScript/domain:
  - define message, delivery-attempt, status, and provider adapter types before broad UI work,
  - defer reply entity/types until dashboard replies become the chosen operational workflow,
  - validate all public/admin payloads with deterministic error codes.
- Supabase/data:
  - use explicit migrations,
  - generated DB types must be updated in implementation children,
  - RLS must fail closed for admin-only message reads/replies.
- External services:
  - provider adapters are server-only,
  - no raw provider errors or secret values in logs,
  - notification retries are bounded and observable.
- UI:
  - admin inbox and detail surfaces require screenshot handoff,
  - use existing admin workspace primitives and density.
- Testing:
  - child briefs must include unit, route, admin E2E, public form, provider failure, and migration/RLS negative-path coverage.

## Data Placement And Sync Contract

- Server-canonical:
  - inbound messages,
  - admin statuses,
  - delivery attempts,
  - audit metadata.
- Provider-canonical:
  - provider delivery IDs and any delivery lifecycle states the provider exposes.
- Local-only:
  - public form draft state,
  - admin filters and current selection.
- Sync policy:
  - public submit succeeds only after server-canonical message insert,
  - provider delivery is attempted after durable app state exists,
  - provider failure updates delivery state but must not delete the message.
- Retention and sensitivity:
  - message deletion/archival must be explicit,
  - logs use redacted metadata only,
  - free text must not be copied into analytics.
- Cache/invalidation:
  - public intake responses are `no-store`,
  - admin lists/details refresh after status, archive, and delete mutations.

## Identity And Rename Contract

- Canonical stable ID:
  - internal message ID and delivery attempt ID.
- Human-readable identifiers:
  - subject/source labels and submitter names are display metadata only.
- Mutability rules:
  - message body is immutable after intake except for redaction/deletion workflows,
  - admin status and archive/delete markers are mutable,
  - provider key may change for future sends without rewriting historical attempts.
- Rename vs repurpose:
  - changing a provider display name is a rename,
  - changing delivery semantics requires a new provider key/version.
- Compatibility:
  - historical messages remain readable after provider migration,
  - provider IDs are optional references, not routing identity.
- Observability and repair:
  - unresolved provider attempts are visible in admin/ops diagnostics and repairable by retry or mark-resolved action.

## Scope

- Parent architecture and child brief sequence for admin message management.
- Dependencies on external-service and admin-workspace architecture briefs.
- Provider-independent message and delivery-attempt contracts, plus deferred reply contract.

## Out Of Scope

- Runtime implementation in this parent brief.
- Full CRM replacement.
- Inbound email reply ingestion.
- Team assignment, SLA automation, macros, or bulk campaigns.
- Marketing email/newsletter tooling.

## Acceptance Criteria

1. Parent brief defines the provider-independent architecture and execution sequence.
2. Child briefs exist for delivery provider contract, DB-first intake, admin inbox, deferred reply/outbound log, and ops/tests/runbook closeout.
3. Existing external-service and admin-workspace architecture briefs name this message-management work as a driver/dependency.
4. All briefs include platform scorecard mapping and pass brief lint.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-07 | secrets-config-governance-started | started the first Secrets And Config Governance Pre-Live slice from clean main; Admin Messages v1 remains closed for storage, delivery, diagnostics, and e-mail-first reply workflow, while Upstash shared-rate-limit value repair is still a non-secret control-plane step before broader public launch | next: merge the inventory/readiness PR, then perform owner-controlled Upstash repair and smoke when secret values are available`
- `2026-05-07 | lifecycle-upstash-closeout | Admin Messages v1 child briefs are in done after PR #633 and #634; contact intake, SMTP acceptance, admin diagnostics, One.com Production receipt/reply, and inbox shortcut are closed for v1, while Upstash shared-rate-limit repair is explicitly deferred to secrets/config governance before broader public launch | next: execute secrets/config governance or another owner-approved planned workstream from clean main`
- `2026-05-07 | pre-live-smoke-started | started Contact Email Pre-Live Smoke on branch contact-email-pre-live-smoke-10-10; Vercel Preview/Production env listings currently lack the required contact/message-delivery group, so live smoke is blocked until env values are configured and redeployed | next: configure env group, run smoke, then update parent lifecycle`
- `2026-05-07 | closeout-done | Admin Message Ops, Tests, And Runbook Closeout merged as PR #629 / a7d0c0f and moved to done by post-merge closeout; Admin Messages v1 is e-mail-first with dashboard replies/outbound log deferred | next: reassess parent lifecycle after docs-only closeout merge`
- `2026-05-07 | closeout-started | Admin Message Ops, Tests, And Runbook Closeout moved to in-progress on branch admin-message-ops-tests-runbook-closeout-10-10; scope remains e-mail-first v1 safety net plus diagnostics | next: finish closeout child and return parent lifecycle after merge`
- `2026-05-07 | scope-corrected | owner identified that dashboard replies would create a second operational inbox alongside email; parent now treats Admin Messages v1 as form-submission safety net and diagnostics, with dashboard reply/outbound log deferred | next: execute ops/tests/runbook closeout as e-mail-first v1`
- `2026-05-06 | planned | created parent brief after dryland closeout and contact-intake triage showed Vercel mail env was absent and current /api/contact could return success without delivery; owner chose a 10/10 admin message-management foundation before test swimmers | next: create child briefs and update external-service/admin-workspace architecture dependencies`
