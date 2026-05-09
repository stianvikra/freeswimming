# Task Brief: Admin Incident Alerts And Status Ops (10/10)

## Metadata

- `id`: `2026-05-09-admin-incident-alerts-and-status-ops-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Notify admin about critical user-facing failures with enough safe diagnostic context to fix the issue quickly without collecting unnecessary user data.

## Product Decision

Build this as a separate ops/incident slice, not inside the Supabase egress hotfix and not inside admin user management.

The system should deduplicate critical alerts, send actionable admin email, and optionally support a user-facing status/banner later. It should prioritize anonymous aggregate failure context over user-identifying data. Concrete user identifiers should only be captured when required for an authenticated support case or a user-owned account workflow.

First target incident categories:

- `auth_sign_in_service_restricted`
- `auth_sign_in_email_delivery_failed`
- `preview_access_unlock_failed`
- `checkout_unavailable`
- `save_export_failed`

## Relevance Assessment Before Scoring

Relevant categories are incident response, admin workflow, reliability, privacy, security, observability, and cost/scalability. Visual design is supporting unless a status/banner UI is included. Commerce and finance are supporting only because checkout alerts may be covered, but reconciliation/reporting is not changed in V1.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Analytics and KPI observability
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                    | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin can understand what failed, where to look, and what to do next without entering unrelated admin surfaces.                       | admin workflow QA + runbook                  | `5/5`                   |
| UX flow clarity                               | `target`     | User-facing errors remain calm and non-technical; admin-facing alert has clear next action.                                           | screenshot/copy review where UI changes      | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting unless a status/banner UI is included; any UI must reuse existing admin/status primitives.                                 | screenshot handoff if UI changes             | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Alerts are deduplicated by category/window, do not double-send on retries, and preserve event counts.                                 | unit tests + integration tests               | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin email and/or admin surface gives one concise action path, including Codex-ready diagnostic prompt and runbook link.             | admin QA + email snapshot                    | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting: any status/banner/admin UI keeps labels, focus order, and readable contrast.                                              | a11y review if UI changes                    | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Alert instrumentation must not add heavy client payload or block critical user actions.                                               | bundle/build review                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Incident events are server-canonical; client only sends safe category/context where needed; no browser-local source of truth.         | data-boundary review + tests                 | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting: dedupe windows and status state have explicit TTL/cache behavior; user/auth/admin routes keep existing cache contracts.   | cache/TTL review                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Alert delivery failures degrade safely, do not break user flow, and are retryable/idempotent.                                         | negative-path tests                          | `5/5`                   |
| Security and authz                            | `target`     | Only authorized admins can manage status/alert settings; alert endpoints fail closed.                                                 | authz tests                                  | `5/5`                   |
| Privacy and compliance                        | `target`     | Default payload excludes raw email, tokens, cookies, IP, and provider secrets; user identifiers require explicit support-case reason. | privacy review + tests                       | `5/5`                   |
| Content governance                            | `supporting` | Supporting: status/banner messages, if included, have owner, publish/unpublish, and rollback path.                                    | admin/status review                          | `4/5`                   |
| Admin workflow and editability                | `target`     | Admin can view current critical incident category, suppression state, and last alert timestamp.                                       | admin QA                                     | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because incident emails/status ops do not change public crawlable route metadata or sitemap behavior in V1.                       | explicit scope rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this is internal ops/support workflow and does not add public AI-discoverable content.                                    | explicit scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `target`     | Critical failures emit safe event category, count, first/last seen, and affected flow for admin review.                               | event tests + admin/email evidence           | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting: checkout incident category may alert admin, but pricing, invoices, entitlements, refunds, and reporting are unchanged.    | checkout alert negative-path test if touched | `4/5`                   |
| Incident response and support operations      | `target`     | Admin receives deduped actionable email and runbook gives exact diagnostic path and Codex prompt.                                     | email snapshot + runbook                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not change finance reports, invoices, payouts, refunds, or reconciliation.                                | explicit scope rationale                     | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting: user/status copy remains concise and structurally localizable; internal admin emails may remain English in V1.            | copy review                                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing admin message/email provider patterns, Upstash/Supabase where already established, and no new vendor without rationale.  | architecture review + dependency diff        | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/integration tests cover dedupe, privacy redaction, authz, delivery failure, and representative incident categories.              | tests + `verify:pre-pr` + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Alerts are rate-limited/deduped and cannot spam email or create unbounded incident rows.                                              | load/dedupe tests + code review              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Feature can be disabled by config/flag; rollback path does not affect auth/checkout/save core flows.                                  | flag/rollback evidence + runbook             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Alert ingestion should happen server-side near critical failure handlers.
  - Any admin/status UI must reuse existing admin surfaces and primitives.
- TypeScript/domain contracts:
  - Define typed incident categories, severity, dedupe key, and safe diagnostic payload.
  - Redaction must be deterministic and tested.
- Supabase/data layer:
  - If persisted, use explicit migration, RLS/admin-only access, indexes for category/window, and generated DB type update.
  - If using Upstash for dedupe, document TTL and fallback behavior.
- External services:
  - Use existing email provider contract.
  - Email delivery must be idempotent/deduped.
- UI system:
  - User-facing copy is optional V1; if included, screenshot handoff is required.
- Testing:
  - Unit tests for redaction/dedupe.
  - Route/integration tests for representative incident ingestion and admin authz.

## Data Placement And Sync Contract

- Server-canonical:
  - incident category, severity, count, first seen, last seen, dedupe window, delivery status.
- Local data:
  - none.
- Sync policy:
  - failures enqueue/record incident server-side and return the normal safe user-facing error.
  - delivery retry must not duplicate admin email within the dedupe window.
- Retention and sensitivity:
  - default incident payload excludes raw email, IP, tokens, cookies, and provider secrets.
  - concrete user linkage requires explicit support-case reason.
- Cache/invalidation:
  - dedupe TTL/window is explicit; admin status view uses no-store or short server cache.

## Identity And Rename Contract

- Canonical stable ID:
  - incident event id or dedupe key composed from category + environment + affected flow + window.
- Human-readable identifiers:
  - incident title/category is renameable only through compatibility mapping if persisted.
- Mutability rules:
  - event rows are append-only where persisted; incident aggregate status may update counts/timestamps.
- Rename vs repurpose:
  - materially different failure class gets a new category.
- Compatibility:
  - legacy category names remain readable through aliases if changed.
- Observability:
  - unresolved category payloads fail closed to `unknown_critical_failure` without PII.

## Scope

- Incident category contract.
- Dedupe/rate-limited admin email alert.
- Privacy-safe diagnostic payload.
- Runbook and Codex-ready prompt template.
- Optional admin/status surface only if scoped explicitly during implementation.

## Out Of Scope

- Full admin user management.
- Full public status page.
- User-specific support ticketing system.
- Billing plan changes.
- Broad analytics dashboard.

## Acceptance Criteria

1. Critical failure can trigger one deduped admin email with safe diagnostic context.
2. Repeated failures in the dedupe window increment count but do not spam email.
3. Email includes affected flow, category, first/last seen, environment, log query hint, runbook link, and Codex-ready prompt.
4. Raw user email, tokens, cookies, IP, provider secrets, and allowlists are not included by default.
5. Admin route/settings, if included, are admin-only and fail closed.
6. Runbook explains how admin should triage and resolve the incident.

## Validation

- `npm run lint:briefs`
- unit tests for category/dedupe/redaction
- route/integration tests for alert ingestion
- email snapshot test
- authz negative-path tests if admin UI/API is included
- screenshot handoff if UI/status banner changes
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

Update relevant runbooks for any incident categories shipped in V1. Help/Guide end-user content is optional unless a user-facing status/banner is included.

## Route / Label / Support Surface Sweep

Search targets:

- `Could not request sign-in email`
- `exceed_egress_quota`
- `preview access`
- `checkout`
- `save image`
- `export`
- `admin_messages`
- `message_delivery`
- `incident`
- `alert`

## Checkpoint Log

- `2026-05-09` - Planned after Supabase egress incident showed auth could fail without admin receiving proactive alert. Next: schedule after Supabase egress hotfix and before broad public launch.
