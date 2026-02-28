# Task Brief: Garmin Training API Partner Integration (10/10)

## Metadata

- `id`: `2026-02-28-garmin-training-api-partner-integration-10-10`
- `status`: `blocked`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

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

## Platform 10/10 Target Categories

- UX flow clarity (`target`): connect + send in minimal steps.
- Security and authz (`target`): token handling and permission hardening.
- Reliability and failure handling (`target`): retry/visibility without silent failure.
- DevOps and rollback readiness (`target`): safe disable and recovery path.
- Testing and QA automation (`target`): integration stubs + e2e happy/failure paths.

## Risks

- API capability mismatch with planned step model.
- Rate limits or throughput constraints.
- Consent/compliance gaps if token scope is too broad.

## Validation (post-unblock)

- `npm run verify:pre-pr`
- integration tests with Garmin adapter stubs
- staged end-to-end send test in preview env
