# Task Brief: Admin Message Delivery Provider Contract (10/10)

## Metadata

- `id`: `2026-05-06-admin-message-delivery-provider-contract-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-06`

## Goal

Define and implement the provider-independent delivery contract for admin message notifications and replies so the platform can use One.com/SMTP now and switch to Resend or another provider later without losing in-app message history.

## Dependency Order

- Parent: `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Must follow or be executed with:
  - `docs/task-briefs/done/2026-05-05-external-service-contract-observability-hardening-10-10.md`
- Must finish before:
  - `docs/task-briefs/done/2026-05-06-contact-intake-message-storage-10-10.md`
  - `docs/task-briefs/deferred/2026-05-06-admin-message-reply-outbound-log-10-10.md`

## Target Provider Strategy

- Provider adapter interface:
  - accepts normalized message/reply delivery payloads,
  - returns normalized `accepted_by_provider` / `failed` result,
  - stores provider message ID only when available,
  - never exposes raw secrets or unredacted provider payloads.
- Initial providers:
  - `smtp` for One.com or any compatible mailbox provider,
  - `resend` as existing/future API provider if configured.
- Provider configuration:
  - selected by server-only env,
  - validated at startup/request boundary,
  - missing or invalid config is visible as deterministic delivery failure, not false success.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                            | Evidence                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Delivery provider contract clearly separates in-app messages from external email delivery.                                    | service contract doc + code review         | `5/5`                   |
| UX flow clarity                               | `target`     | Delivery statuses distinguish stored, queued, accepted by provider, failed, and retryable states.                             | status/error matrix                        | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this child defines provider plumbing and service state, not visible UI beyond later status consumers.             | explicit scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Provider attempts are append-only/auditable and never overwrite canonical message/reply content.                              | unit tests + DB contract review            | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin status labels must be understandable when surfaced in inbox UI or any future reply UI.                 | label/status review                        | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: later visible delivery status UI must use accessible alert/status semantics.                                 | UI child requirements                      | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Provider calls are server-side, bounded, and never block public page rendering beyond submit response requirements.           | route timing/code review                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Provider config, app message records, and delivery attempt records have explicit ownership and sync rules.                    | data contract + migration review           | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Delivery mutations use no-store/private paths and refresh affected admin status views when later implemented.                 | route/cache review                         | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing config, provider timeout, SMTP/API rejection, duplicate retry, and transient failure have deterministic states.       | negative-path tests                        | `5/5`                   |
| Security and authz                            | `target`     | Secrets stay server-only; provider adapters reject client use; admin-only retries fail closed.                                | secret boundary review + route tests       | `5/5`                   |
| Privacy and compliance                        | `target`     | Logs and attempt records redact free text, secrets, tokens, and sensitive provider response bodies.                           | log/payload tests + code review            | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: delivered copy comes from canonical message/reply records or templates, not provider-specific ad hoc copies. | contract review                            | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: retry/mark-resolved hooks are defined for later admin workflow.                                              | interface review                           | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because server-side delivery providers do not affect crawlable routes, metadata, sitemap, or robots.                      | explicit scope rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this provider contract introduces no public AI-discoverable content.                                              | explicit scope rationale                   | `N/A`                   |
| Analytics and KPI observability               | `target`     | Delivery success/failure/retry events use typed safe payloads and exclude message free text.                                  | event tests/catalog                        | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no commerce delivery is changed, but the adapter pattern must not break future receipt/support emails.       | explicit commerce scope rationale          | `4/5`                   |
| Incident response and support operations      | `target`     | Operators can identify provider misconfiguration, outage, failed attempts, and retry path from redacted diagnostics.          | service runbook + diagnostics review       | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance records change; future finance-related emails must remain provider-independent and auditable.     | explicit finance scope rationale           | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: status keys and provider errors are stable and localizable later.                                            | status key review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Prefer existing fetch/API or small SMTP dependency only if justified; official provider docs baseline is recorded.            | package diff + docs baseline               | `5/5`                   |
| Testing and QA automation                     | `target`     | Adapter tests cover success, missing config, provider failure, timeout/retry, redaction, and duplicate retry behavior.        | unit/route tests + verify gate             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Retry count, timeout, and rate/cost guardrails are bounded per provider.                                                      | cost/rate-limit review                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Provider can be disabled or swapped through env/config without data loss or schema rewrite.                                   | rollback checklist + env parity validation | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- External services:
  - record official provider docs baseline before implementation,
  - keep provider adapters server-only,
  - use least-privilege credentials,
  - define timeout, retry, and redaction rules.
- TypeScript:
  - define `MessageDeliveryProvider`, `MessageDeliveryPayload`, `MessageDeliveryResult`, and provider error types.
- Supabase:
  - delivery attempts are server-canonical and append-only unless redacted/deleted by explicit admin policy.
- Tests:
  - mock provider adapters in unit/route tests,
  - no real provider call in CI unless an explicit smoke test is later approved.

## Data Placement And Sync Contract

- Server-canonical:
  - delivery attempts and normalized provider result.
- Provider-canonical:
  - provider message ID and provider delivery lifecycle if exposed.
- Local-only:
  - none.
- Sync policy:
  - create attempt before or during provider call,
  - update attempt with accepted/failed result,
  - retry creates a new attempt or increments explicit attempt metadata without losing history.
- Retention and sensitivity:
  - store redacted provider errors only,
  - never persist secrets or raw SMTP/API credentials.
- Cache/invalidation:
  - no public caching; admin delivery status refreshes after attempt state changes.

## Identity And Rename Contract

- Canonical stable ID:
  - internal delivery attempt ID.
- Human-readable identifiers:
  - provider display name is mutable metadata.
- Mutability rules:
  - provider key is versioned when semantics change.
- Rename vs repurpose:
  - rename provider display labels in place; create a new provider key for materially different behavior.
- Compatibility:
  - historical attempts remain readable after provider migration.
- Observability and repair:
  - failed attempts are visible through logs/admin diagnostics and retryable where safe.

## Scope

- Provider abstraction and config contract.
- SMTP/One.com-compatible and Resend-compatible delivery strategy.
- Delivery attempt state model.
- Redacted diagnostics and retry contract.

## Implementation Slice

- Add `lib/admin/message-delivery.ts` as the server-side provider boundary for Admin Messages v1.
- Define:
  - provider keys, delivery targets, statuses, error codes, payload, result, provider, config, and attempt-record types,
  - env resolver for `disabled`, `resend_api`, `resend_smtp`, and `smtp_one_com_compatible`,
  - sender default resolver for `MESSAGE_DELIVERY_FROM_EMAIL` / `MESSAGE_DELIVERY_REPLY_TO_EMAIL`,
  - Resend API delivery with attempt-scoped idempotency key and no-store fetch,
  - SMTP delivery through a small `nodemailer` dependency with deterministic `Message-ID` from attempt ID,
  - redacted diagnostics that strip secrets, email addresses, subject/body/message fields, and raw provider payloads.
- Keep this slice non-visual and do not change `/api/contact` runtime behavior; DB-first intake belongs to the next child brief.
- Update `docs/architecture/external-service-contract-matrix.md`, `docs/runbooks/environment-config-and-secret-parity.md`, and `docs/checklists/admin-access-and-secret-rotation.md` with the runtime env contract.
- Screenshot handoff: `N/A` because no rendered UI, copy, layout, or product export surface changes in this provider-contract slice.
- New dependency justification: `nodemailer` is a small server-side SMTP transport dependency needed to support One.com-compatible SMTP without hand-rolling SMTP protocol behavior.

## Route Label Support Surface Impact Sweep

- Sweep identifiers searched:
  - `docs/task-briefs/done/2026-05-06-admin-message-delivery-provider-contract-10-10.md`
  - `MESSAGE_DELIVERY_`
  - `message_delivery`
  - `accepted_by_provider`
  - `failed_retryable`
  - `failed_final`
  - `smtp_one_com_compatible`
  - `resend_api`
  - `resend_smtp`
  - `CONTACT_TO_EMAIL`
  - `RESEND_API_KEY`
- Directories/surfaces checked:
  - `app/`
  - `components/`
  - `lib/`
  - `tests/`
  - `docs/architecture/`
  - `docs/runbooks/`
  - `docs/checklists/`
  - Admin Messages parent/child briefs in `docs/task-briefs/`
- Fallout handled:
  - moved provider child references from `planned/` to `in-progress/`,
  - updated external-service matrix with runtime env names and provider status contract,
  - updated environment parity runbook with message-delivery config rows,
  - updated admin access/secret rotation checklist with Admin Messages delivery secret group.
- Help/Guide impact:
  - `N/A` because no active admin labels, user/admin workflow actions, recovery copy, visible tab, or Help/Guide content changes in this provider-only slice.

## Out Of Scope

- Admin inbox UI.
- Public contact form redesign.
- Inbound email parsing.
- Newsletter/marketing campaign tooling.

## Acceptance Criteria

1. Provider adapter contract is documented and typed before message UI work starts.
2. One.com/SMTP can be supported without coupling message history to that provider.
3. Provider swap to Resend or another provider requires config/adapter changes only, not message data migration.
4. Missing provider config cannot produce a false delivered/sent state.

## Validation

- `npm run lint:briefs`
- targeted unit/route tests when implemented
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Completion Record

- `merged_pr`: `#621`
- `merge_commit`: `ea6c66c`
- `completed`: `2026-05-06`
- `validation`: targeted unit/static checks PASS; `npm run verify:pre-pr` PASS full lane; `npm run verify:pre-merge` PASS full lane; GitHub required checks PASS.
- `screenshot_handoff`: N/A because this provider-contract slice changed no rendered UI, print, layout, branding, or export surface.
- `perf_budget_decision`: `hold` after tighten recommendation because this slice is server-only provider plumbing with no public route payload/layout budget change.
- `10/10 claim`: yes for this Admin Messages delivery provider-contract child slice.

Critical target categories for `10/10` claim all achieved `5/5`:

- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Testing and QA automation

| Category                                      | Achieved Score | Evidence                                                                                                                                              | Remaining Gap                                      |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Provider-independent contract separates app-canonical messages/replies from external email provider acceptance.                                       | Later child briefs wire runtime callers.           |
| UX flow clarity                               | `5/5`          | Typed statuses distinguish disabled, queued, provider accepted, retryable failure, and final failure without exposing provider internals.             | Later visible admin UI owns presentation.          |
| Business logic correctness and data integrity | `5/5`          | Attempt records are deterministic, append-friendly, provider IDs are optional, and raw message body/subject are excluded from diagnostics.            | DB-backed attempts belong to later child briefs.   |
| Performance (CWV + payloads)                  | `5/5`          | Provider calls are server-only, bounded by configured timeout, no-store, and not connected to public route rendering in this slice.                   | None for provider boundary.                        |
| Data placement and sync boundaries            | `5/5`          | Contract defines server-canonical attempt/result state, provider-canonical message IDs, and no local-only delivery state.                             | Persistence schema remains a later child concern.  |
| Caching and invalidation strategy             | `5/5`          | Provider fetch is no-store and admin delivery state remains private/server-side; later admin status refresh is explicitly owned by UI children.       | None in non-visual slice.                          |
| Reliability and failure handling              | `5/5`          | Tests cover disabled/missing config, provider rejection, retryable 429, SMTP auth failure, invalid payload, and deterministic redaction.              | Real-provider smoke intentionally deferred.        |
| Security and authz                            | `5/5`          | Server-only env resolver, no client boundary, no secret persistence, and redaction for tokens/passwords/auth/provider payloads.                       | Route-level admin retry authz is later child work. |
| Privacy and compliance                        | `5/5`          | Redaction strips email addresses, subject/body/message text, raw provider payloads, and sensitive diagnostic fields from attempts/log payloads.       | None for this boundary.                            |
| Analytics and KPI observability               | `5/5`          | Stable status/error keys and safe attempt record shape support later typed events without message free text.                                          | Event emission is later child work.                |
| Incident response and support operations      | `5/5`          | Env matrix, secret checklist, status labels, provider keys, and redacted diagnostics give operators misconfig/outage/retry evidence without secrets.  | Runbook workflow content closes in ops child.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused fetch for Resend API and added `nodemailer` only for SMTP protocol handling; no hand-rolled SMTP or broad provider dependency.                 | None.                                              |
| Testing and QA automation                     | `5/5`          | 12 focused unit tests plus lint/typecheck/env parity/quality gates, full `verify:pre-pr`, full `verify:pre-merge`, and green GitHub CI.               | None for provider contract.                        |
| Scalability and cost efficiency               | `5/5`          | Timeout, retryable status, 429 handling, deterministic attempts, and disabled provider mode bound provider cost/retry behavior.                       | Rate-limit persistence belongs to later DB slice.  |
| DevOps and rollback readiness                 | `5/5`          | Provider can be disabled or swapped by env; rollback is `git revert ea6c66c`; env/runbook/checklist docs describe config and secret rotation posture. | None.                                              |

## Checkpoint Log

- `2026-05-06 | done | PR #621 merged as ea6c66c after green local verify:pre-pr, green local verify:pre-merge, and green required GitHub CI; post-merge preflight requested repo-managed docs-only closeout, moved this brief to done, and recorded achieved score/evidence | next: commit closeout PR, merge it, sync main, rerun post-merge preflight`
- `2026-05-06 | pre-pr-pass | npm run verify:pre-pr passed full lane with branch current against origin/main, 931 unit tests, build, perf budgets, and 82 e2e passed / 374 skipped; verify log artifact artifacts/test-runs/20260506-175931/verify.log; npm audit --omit=dev --audit-level=high passed with no high/critical runtime advisories, while existing moderate Next/PostCSS advisory remains outside this slice; perf trend recommended tighten after 4 weekly green runs, decision: hold because this slice adds server-only provider plumbing and no public route payload/layout budget change, and prompt owner to tighten one stretch target in the next perf-governance or performance-relevant slice | next: inspect diff, commit, push, open PR`
- `2026-05-06 | targeted-validation | implemented lib/admin/message-delivery.ts with Resend API + SMTP provider contract, env/address resolvers, redaction, attempt-record shape, nodemailer dependency, env/runbook/checklist updates, and child-brief path sweep; targeted unit test passed (tests/unit/admin-message-delivery.test.ts, 12 tests) and npm run typecheck passed | next: run lint/brief gates, route/support sweep, then npm run verify:pre-pr`
- `2026-05-06 | in-progress | branch admin-message-delivery-provider-contract-10-10 opened from clean synced main after PR #620 closeout; implementation scoped to server-only provider contract/types/config/redaction/tests with no visible UI or real provider smoke call | next: inspect existing contact/email code, implement adapter contract, run targeted tests`
- `2026-05-06 | planned | created as child of admin message management parent to own provider-independent One.com/SMTP/Resend delivery before contact intake and admin replies are implemented | next: execute after external-service contract hardening`
