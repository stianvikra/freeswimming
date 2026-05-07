# Task Brief: Admin Message Lifecycle And Upstash Closeout (10/10)

## Metadata

- `id`: `2026-05-07-admin-message-lifecycle-upstash-closeout-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Goal

Make the Admin Messages v1 closeout docs internally consistent after PRs `#633` and `#634`, and record a non-secret Upstash rate-limit defer decision so the next workstream can start from a clean operational state.

## Why This Brief Exists

- `main` is clean after the Admin Messages One.com shortcut and repo-managed closeout PRs.
- The done brief files moved to `docs/task-briefs/done/`, but their metadata still said `in-progress`.
- The contact email smoke brief still treated Upstash `401` as unresolved even though storage, SMTP acceptance, admin diagnostics, and Production mailbox reply were verified.
- Upstash repair requires real control-plane secret values, so this slice must not guess or record those values in git.

## Upstash Plain-English Contract

Upstash is a hosted/serverless Redis service. In this repo it is used as a shared rate-limit store so public abuse controls can work consistently across serverless instances. When Upstash returns `401`, the configured REST URL/token pair is unauthorized or mismatched; the app falls back to in-memory rate limiting, which is deterministic but weaker across multiple deployed instances.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

## Completion Record

- `completed`: `2026-05-07`
- `merged_pr`: `#635`
- `merge_url`: `https://github.com/stianvikra/freeswimming/pull/635`
- `squash_commit`: `56d5fc1`
- `implementation_commit`: `64e1812`
- `10/10 claim`: yes - all critical target categories are scored `5/5` for this docs-only closeout scope, with Upstash documented as a non-secret external rate-limit service and no runtime, credential, UI, schema, or provider behavior changes.

Plain-language done summary:

- Admin Messages v1 closeout docs now match the merged repo state after PRs `#633` and `#634`.
- Upstash is explicitly listed as the `rate_limit_store` external service with secret boundaries, fallback behavior, diagnostics, and rollback/repair ownership.
- The remaining Upstash `401` repair is deferred to secrets/config governance, while message storage, delivery evidence, and operator workflow stay closed for Admin Messages v1.

| Category                                 | Achieved Score | Evidence                                                                                                                       | Gaps / Notes                                                                                      |
| ---------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Reliability and failure handling         | `5/5`          | Upstash `401`, timeout, network, and command failures are documented as deterministic in-memory fallback, not app `500` paths. | Shared rate-limit repair remains deferred to the planned secrets/config governance track.         |
| Security and authz                       | `5/5`          | Docs name only env variable keys and official docs; no URL, token, SMTP, Supabase, cookie, or admin auth secret is recorded.   | Control-plane rotation still requires owner credentials outside git.                              |
| Privacy and compliance                   | `5/5`          | Closeout evidence avoids message body text, submitter email, raw provider transcript, IP, cookie, token, and secret values.    | No privacy runtime changed.                                                                       |
| Incident response and support operations | `5/5`          | Env/runbook and external-service matrix explain fallback interpretation, safe diagnostics, and repair/defer path.              | Operational repair remains a follow-up owner track, not a blocker for Admin Messages v1 closeout. |
| Testing and QA automation                | `5/5`          | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed.          | Docs-only lane by design.                                                                         |
| DevOps and rollback readiness            | `5/5`          | PR #635 merged as `56d5fc1`; rollback is `git revert 56d5fc1`; docs-only scope is isolated.                                    | No runtime rollback needed.                                                                       |

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                        | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Messages v1 parent and child brief lifecycle states match merged reality, with one clear next operational owner for Upstash repair. | docs diff + parent checkpoint                  | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no product UI changes; operator docs clarify what Upstash affects and does not affect.                                   | runbook diff                                   | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs/ops slice changes no UI, layout, print, brand, or screenshot surface.                                               | explicit scope rationale                       | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Closeout text must not imply message storage depends on email or Upstash; server-canonical intake remains the source of truth.            | brief/runbook review                           | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: existing admin workflow remains unchanged; docs preserve the e-mail-first operator path.                                 | admin message runbook review                   | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered interface, focus order, labels, or semantics change.                                                              | explicit scope rationale                       | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime bundle, route, or payload behavior changes.                                                                        | explicit scope rationale                       | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Docs state that Upstash is an external rate-limit helper, not canonical message storage, and no secret values move into the repo.         | Upstash defer note + env runbook               | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no cache mode, freshness, or invalidation behavior.                                                        | explicit scope rationale                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Upstash `401` is classified as a weaker-rate-limit fallback, not an intake/delivery blocker, with follow-up ownership.                    | contact smoke closeout + runbook note          | `5/5`                   |
| Security and authz                            | `target`     | No Upstash URL/token, SMTP credential, mailbox credential, cookie, or admin auth value is recorded; repair remains a control-plane task.  | docs review + grep/lint                        | `5/5`                   |
| Privacy and compliance                        | `target`     | Closeout evidence avoids message body text, submitter email, raw provider transcript, IP, cookie, token, and secret values.               | docs diff review                               | `5/5`                   |
| Content governance                            | `target`     | Done briefs include completion records and explicit `10/10 claim` lines; parent checkpoint records current lifecycle truth.               | brief lint                                     | `5/5`                   |
| Admin workflow and editability                | `target`     | Docs keep the v1 workflow unchanged: triage in Admin Messages, reply in One.com email, then mark `Replied`.                               | runbook and done brief review                  | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private docs/ops slice changes no sitemap, robots, public metadata, or crawlable content.                                | explicit scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice adds no public AI-readable content or AI-generated output.                                                         | explicit scope rationale                       | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics taxonomy changes; operational evidence clarifies `contact_intake_accepted` remains independent of Upstash.  | contact smoke closeout review                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, entitlement, invoice, refund, payout, ledger, or revenue reporting workflow.                  | explicit commerce scope rationale              | `N/A`                   |
| Incident response and support operations      | `target`     | Runbook explains how to interpret Upstash rate-limit fallback and where to repair/defer it without exposing secrets.                      | env parity runbook diff                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because Admin Messages closeout and Upstash rate-limit config do not affect finance or reporting records.                             | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes operational docs only and introduces no locale routing, public copy model, or translation blocker.         | explicit i18n scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use repo-native docs/brief/runbook updates only; no dependency, runtime code, schema, provider SDK, or config-file change.                | package/code diff review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint and docs-only verification gates; no runtime tests are required because runtime behavior is unchanged.     | `lint:briefs`, `lint:briefs:all`, verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: Upstash repair remains the production-grade rate-limit hardening path before broader traffic.                            | planned secrets/config follow-up               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only changes are revertible; Upstash control-plane repair path remains outside git and owned by secrets/config governance.           | git diff + runbook/brief notes                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no runtime route, component, action, or cache behavior changes.
- TypeScript/domain:
  - no type, validator, or domain invariant changes.
- Supabase/data:
  - no migration, RLS, generated type, or stored data change.
- External services:
  - Upstash is documented as a Redis-backed rate-limit helper.
  - the external-service matrix must register Upstash as the `rate_limit_store` provider-like service because it has secrets, provider state, cost limits, and deterministic fallback behavior.
  - no Upstash secret values are read, printed, or committed.
  - repair belongs to the planned secrets/config governance track.
- UI:
  - screenshot handoff is `N/A`; no visual surface changes.
- Testing:
  - docs-only lane plus changed-brief linting are the correct validation level.

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_messages` and `admin_message_delivery_attempts` remain the message truth.
- External control-plane:
  - Upstash Redis state is only shared rate-limit state.
  - Vercel stores the Upstash REST URL/token values when enabled.
- Local-only:
  - no new local state is introduced.
- Sync policy:
  - no data sync changes; Upstash fallback does not mutate stored messages.
- Retention and sensitivity:
  - no secret values, message free text, submitter email, raw provider responses, cookies, or tokens are recorded.
- Cache/invalidation:
  - N/A for runtime cache; no cache behavior changes.

## Identity And Rename Contract

- Canonical stable IDs:
  - task brief IDs, PR numbers, and Admin Messages entity IDs remain unchanged.
- Human-readable identifiers:
  - `Upstash`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` are operator-facing config names.
- Mutability rules:
  - secret values rotate in control planes, not in repo docs.
- Rename vs repurpose:
  - if a future provider replaces Upstash for rate limiting, create a new config-family entry instead of repurposing the Upstash variable names.
- Compatibility:
  - existing in-memory fallback remains the compatibility behavior while Upstash is deferred.
- Observability and repair:
  - future repair evidence should record only presence/status and log outcome, never URL/token values.

## Scope

- Create this in-progress docs-only brief.
- Update Admin Messages done brief metadata and closeout records.
- Update the parent Admin Message Management checkpoint.
- Add Upstash to the canonical external-service matrix as the `rate_limit_store` service.
- Update environment config/runbook notes for Upstash fallback.
- Link the Upstash repair to the planned secrets/config governance track.

## Out Of Scope

- Editing Vercel env values.
- Printing or committing Upstash, SMTP, Supabase, Vercel, mailbox, cookie, or admin auth secrets.
- Runtime code, tests, schema, RLS, UI, provider adapter, or dashboard reply changes.
- Claiming app-wide secrets/config governance is complete.

## Acceptance Criteria

1. Done brief metadata matches the `done/` lifecycle folder.
2. Changed done briefs include completion records, closeout scores for target categories, and explicit `10/10 claim` lines.
3. Upstash `401` is documented as a deferred rate-limit hardening issue with deterministic in-memory fallback, not as a message storage/delivery blocker.
4. `docs/architecture/external-service-contract-matrix.md` lists Upstash as the `rate_limit_store` service with official docs baseline, secret boundary, canonical state, failure mode, diagnostics, and rollback/repair behavior.
5. Parent Admin Message Management checkpoint names the current closed Admin Messages v1 state and the next owner track.
6. Docs-only validation passes.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `2026-05-07`: `npm run lint:briefs:all` passed.
- `2026-05-07`: `npm run verify:pre-pr` passed docs-only lane with artifact log `artifacts/test-runs/20260507-120629/verify.log`.
- `2026-05-07`: PR #635 CI passed: `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, `CodeQL`, Vercel, and preview comments.
- `2026-05-07`: `npm run verify:pre-merge` passed docs-only lane with marker `artifacts/verify-pre-merge/20260507-100911.json`.

## Checkpoint Log

- `2026-05-07 | 56d5fc1 | PR #635 squash-merged, local main synced, and post-merge preflight surfaced this single repo-managed docs-only lifecycle closeout | next: move this brief to done, validate, open/monitor closeout PR, run pre-merge, auto-merge, sync main, rerun post-merge preflight, then chat-handoff assessment`
- `2026-05-07 | 64e1812 | Upstash added to the external-service matrix and PR #635 updated; local pre-pr, CI, and pre-merge gates passed before squash merge | next: merge PR #635 and run post-merge preflight`
- `2026-05-07 | pre-pr-pass | docs-only verify:pre-pr passed and quality gates classified the slice as docs/governance with external-service and support-surface impact only | next: commit, push, open PR, then run pre-merge validation`
- `2026-05-07 | in-progress | started from clean main after PR #633 and #634 merged; scope is docs-only lifecycle consistency plus non-secret Upstash defer documentation | next: update done briefs, parent checkpoint, env runbook, then run docs-only gates`
