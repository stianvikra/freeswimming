# Task Brief: Garmin Training API Partner Integration (10/10)

## Metadata

- `id`: `2026-02-28-garmin-training-api-partner-integration-10-10`
- `status`: `blocked`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-16`

## Goal

Integrate one-click "Send to Garmin" using Garmin Training API once partner access and operational prerequisites are approved.

## Why Blocked

This work requires external prerequisites not guaranteed by code alone:

- Garmin partner/application approval.
- API credentials and environment configuration.
- Confirmed scope/limits for swim workout upload.
- Legal/policy confirmation for data usage and terms.

## Unblock Criteria

All of the following must be true:

1. Garmin partner status approved.
2. Production and preview credentials provisioned securely.
3. Supported workout step-mapping matrix signed off.
4. Rollback/runbook approved by owner.

## Planned Scope After Unblock

- OAuth connect/disconnect flow with encrypted token storage.
- Send workout endpoint with queue/retry handling.
- Sync status model (`queued`, `sent`, `failed`, `needs-attention`).
- Deterministic failure UX and admin/audit visibility.

## Data Placement And Sync Contract (Post-Unblock)

- Server-canonical:
  - connection status, encrypted Garmin tokens, export/send job state, audit history, and canonical workout references.
- Local-only:
  - transient connect/send UI state and temporary retry banners.
- Sync behavior:
  - Garmin provider state never overrides FreeSwimming canonical workout identity,
  - send/retry status remains server-canonical,
  - failed provider sync must not mutate canonical workout completion or structure state.
- Invalidation:
  - connect/disconnect/send/retry operations invalidate provider status and any pending export/send queue views.

## Identity And Rename Contract (Post-Unblock)

- Canonical stable IDs:
  - FreeSwimming workout IDs remain the source-of-truth for send targets and audit history.
- Human-readable identifiers:
  - Garmin-facing workout titles may be presentation-friendly, but cannot replace canonical local IDs.
- Mutability rules:
  - provider tokens, provider workout IDs, and send-job IDs are integration identifiers, not canonical workout identity.
- Rename vs repurpose:
  - renaming a workout in FreeSwimming must not create a new local canonical entity; any provider-side remap needs explicit integration rules.
- Compatibility contract:
  - if Garmin returns external IDs or sync references, they must be stored as foreign aliases only and resolved back to canonical FreeSwimming IDs deterministically.
- Observability and repair:
  - unresolved provider mappings, duplicate sends, and provider ID drift must be measurable and supportable before this brief can leave `blocked`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                               | Evidence                              |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | Connect + send flow is understandable in minimal steps once unblock prerequisites are met.                     | post-unblock UX flow spec             |
| UX flow clarity                               | `target`     | Provider connect, send, retry, and needs-attention states have clear next actions and no dead ends.            | staged e2e + manual QA                |
| Visual design quality                         | `supporting` | Supporting only: detailed visual polish belongs to implementation after unblock.                               | scope rationale                       |
| Business logic correctness and data integrity | `target`     | Provider sync status and external references never corrupt canonical local workout identity.                   | integration tests + identity contract |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin diagnostics UX is secondary to core connection/send safety in this blocked phase.       | scope rationale                       |
| Accessibility (a11y)                          | `supporting` | Supporting only: connect/send UI must meet a11y requirements when implemented post-unblock.                    | downstream implementation contract    |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: provider integration must avoid obvious route or queue latency regressions.                   | perf notes + scope rationale          |
| Data placement and sync boundaries            | `target`     | FreeSwimming canonical workout state vs Garmin provider state ownership is explicit before implementation.     | data contract                         |
| Caching and invalidation strategy             | `supporting` | Supporting only: connect/send/retry invalidation rules must be defined before unblock implementation starts.   | scope rationale                       |
| Reliability and failure handling              | `target`     | Retry/visibility paths avoid silent provider failure and preserve deterministic local status.                  | staged integration tests              |
| Security and authz                            | `target`     | Token handling, permission boundaries, and send endpoints remain hardened and fail closed.                     | security review + negative-path tests |
| Privacy and compliance                        | `target`     | Token scope, stored provider metadata, and consent/legal expectations are explicit before launch.              | legal/security checklist              |
| Content governance                            | `supporting` | Supporting only: canonical workout governance is upstream, but provider mapping must honor it.                 | linked brief + scope rationale        |
| Admin workflow and editability                | `supporting` | Supporting only: admin audit/visibility requirements are part of post-unblock implementation.                  | scope rationale                       |
| SEO and crawlability                          | `supporting` | Supporting only: provider integration is not a primary crawl/index surface.                                    | scope rationale                       |
| AI discoverability                            | `supporting` | Supporting only: no AI discoverability contract change in this provider-integration brief.                     | scope rationale                       |
| Analytics and KPI observability               | `supporting` | Supporting only: send success/failure/connect metrics should be instrumented after unblock.                    | event contract notes                  |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct billing change, though feature value may affect commercial packaging later.         | scope rationale                       |
| Incident response and support operations      | `target`     | Runbook, escalation path, and provider-failure diagnostics are defined before activation.                      | unblock checklist + runbook           |
| Finance and reporting operations              | `supporting` | Supporting only: no direct finance reporting mutation in this integration brief.                               | scope rationale                       |
| i18n operational readiness                    | `supporting` | Supporting only: provider UI/status copy should remain locale-extensible when implemented.                     | scope rationale                       |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: integration should prefer existing job/auth patterns and avoid unnecessary provider wrappers. | architecture review                   |
| Testing and QA automation                     | `target`     | Integration stubs plus happy/failure-path coverage are mandatory post-unblock before merge.                    | staged test plan                      |
| Scalability and cost efficiency               | `supporting` | Supporting only: queue/retry behavior must not create obvious provider or infra cost blowups.                  | scope rationale                       |
| DevOps and rollback readiness                 | `target`     | Safe disable, token revocation, and recovery path are approved before launch.                                  | rollback/runbook checklist            |

## Risks

- API capability mismatch with planned step model.
- Rate limits or throughput constraints.
- Consent/compliance gaps if token scope is too broad.

## Validation (post-unblock)

- `npm run verify:pre-pr`
- integration tests with Garmin adapter stubs
- staged end-to-end send test in preview env
