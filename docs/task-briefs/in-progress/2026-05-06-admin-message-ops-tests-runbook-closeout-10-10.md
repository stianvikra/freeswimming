# Task Brief: Admin Message Ops, Tests, And Runbook Closeout (10/10)

## Metadata

- `id`: `2026-05-06-admin-message-ops-tests-runbook-closeout-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-07`

## Goal

Close out Admin Messages v1 with launch-grade e-mail-first operations, test coverage, env parity, runbooks, support diagnostics, and rollback evidence before test swimmers use the intake flow.

## Dependency Order

- Parent: `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Must follow:
  - `docs/task-briefs/done/2026-05-06-admin-message-delivery-provider-contract-10-10.md`
  - `docs/task-briefs/done/2026-05-06-contact-intake-message-storage-10-10.md`
  - `docs/task-briefs/done/2026-05-06-admin-message-inbox-10-10.md`
- Explicitly deferred:
  - `docs/task-briefs/deferred/2026-05-06-admin-message-reply-outbound-log-10-10.md`

## Closeout Target

- Implemented message-management child slices have evidence, and dashboard reply/outbound logging is explicitly deferred.
- Env parity covers the selected delivery provider without exposing secrets.
- Support runbook answers:
  - did we receive the request,
  - did admin read it,
  - did provider accept the admin notification email,
  - how admin replies from the normal email inbox and marks the app row,
  - what failed and how to recover/rollback.
- Pre-live smoke checklist is ready at `docs/checklists/admin-message-v1-pre-live-smoke.md` before any test swimmer invitation.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                  | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Messages v1 has a clear e-mail-first closeout checklist and no open blocker before test swimmer intake.                       | closeout audit                        | `5/5`                   |
| UX flow clarity                               | `target`     | Public/admin failure and success states are verified end to end and no copy overclaims delivery.                                    | E2E/manual QA                         | `5/5`                   |
| Visual design quality                         | `target`     | Final inbox screenshots show polished admin UI, and closeout confirms no second dashboard inbox is introduced for v1.               | screenshot handoff + scope audit      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Intake, status, archive/delete, notification attempts, and deferred reply scope are covered by deterministic evidence.              | test evidence + data audit            | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can complete high-frequency triage in the dashboard while replying from the single normal email inbox.                        | manual admin QA + runbook audit       | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Public/contact and admin message surfaces have no known serious/critical a11y regression.                                           | component/e2e a11y evidence           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Public contact route and admin message routes meet route-level budget/no-regression checks.                                         | build/perf/budget evidence            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Closeout confirms server-canonical/local/provider boundaries match implemented behavior.                                            | data-boundary audit                   | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Closeout confirms no-store/private cache behavior and deterministic refresh after message mutations.                                | cache/header tests                    | `5/5`                   |
| Reliability and failure handling              | `target`     | DB, provider notification, authz, validation, rate-limit, and rollback failure modes are tested and documented.                     | negative-path tests + runbook         | `5/5`                   |
| Security and authz                            | `target`     | RLS/admin-only access, public abuse controls, provider secret boundaries, and log redaction are verified.                           | security tests + secret/log review    | `5/5`                   |
| Privacy and compliance                        | `target`     | Retention/delete/redaction policy and PII-safe diagnostics are documented and tested where practical.                               | privacy checklist + tests             | `5/5`                   |
| Content governance                            | `target`     | Message lifecycle, source variants, statuses, and provider notification evidence have one governed source of truth.                 | lifecycle audit                       | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin operations and Help/Guide/runbook content are aligned with implemented labels/actions/recovery behavior.                      | Help/Guide impact sweep               | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because final closeout verifies private/admin and POST behavior; no public crawlability changes are intended.                   | explicit scope rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because message content remains private and no public AI-discoverable surface is introduced.                                    | explicit scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Safe event taxonomy and admin/ops counts exist for intake, triage, notification failure, archive/delete; reply events are deferred. | event tests/dashboardability review   | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: closeout confirms no checkout/entitlement/revenue path changed and commerce inquiries remain messages.             | explicit commerce scope rationale     | `4/5`                   |
| Incident response and support operations      | `target`     | Runbook, diagnostics, env parity, and escalation paths are complete for missing intake and delivery failures.                       | runbook + ops walkthrough             | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reports change; closeout confirms messages are not treated as finance records.                          | explicit finance scope rationale      | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: status keys/copy are not a blocker for later localization; no locale system ships in v1.                           | copy/status audit                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Closeout confirms no unnecessary provider/UI dependency and all stack surfaces follow repo patterns.                                | package/code architecture review      | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit, route, admin E2E, contact E2E, provider adapter, migration/RLS, and screenshot evidence are complete.                         | test matrix + verify gates            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Rate limits, pagination, indexes, retry bounds, and provider cost controls are verified.                                            | scale/cost checklist                  | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback, feature flags/provider disable path, migrations, env restoration, and smoke checks are documented.                        | rollback runbook + pre-live checklist | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Docs/runbooks:
  - update environment config parity, admin support runbooks, and Help/Guide if workflow labels change.
- Testing:
  - closeout cannot rely only on one happy path.
  - provider failures and storage failures must be deterministic in tests.
- DevOps:
  - selected provider config is verified by presence/status only, never by printing secrets.
  - rollback plan must preserve stored messages.

## Data Placement And Sync Contract

- Server-canonical:
  - final closeout confirms inbound messages, statuses, and notification delivery attempts are canonical in app storage.
- Provider-canonical:
  - provider IDs/statuses are secondary references only.
- Local-only:
  - public form drafts and admin filters/selection only.
- Sync policy:
  - verified against implemented routes and tests.
- Retention and sensitivity:
  - closeout confirms archive/delete/redaction policy and log/event redaction.
- Cache/invalidation:
  - closeout confirms no-store/private cache paths and refresh behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - message and delivery attempt IDs.
- Human-readable identifiers:
  - source/status/provider labels.
- Mutability rules:
  - verified against implemented workflows.
- Rename vs repurpose:
  - status/provider semantic changes require versioning/migration.
- Compatibility:
  - provider migration does not rewrite historical message identity.
- Observability and repair:
  - runbook defines repair for failed notification attempts, missing provider config, and stuck statuses.

## Scope

- Final docs/runbook/env/test closeout for Admin Messages v1.
- Help/Guide impact sweep.
- Pre-live smoke checklist.
- PR/merge readiness evidence.

## Out Of Scope

- New feature expansion beyond v1.
- Inbound email ingestion.
- CRM/team assignment/SLA automation.
- Marketing automation.

## Acceptance Criteria

1. All child briefs are implemented or explicitly deferred with owner-approved rationale.
2. No message intake path can silently lose a request while showing success.
3. Admin can diagnose intake and notification provider status from dashboard/runbooks while email remains the reply workspace.
4. Env parity and rollback path are documented without exposing secrets.
5. Final closeout states achieved score per target category.

## Implementation Evidence

- Reference surface / shared UI contract:
  - reused the existing `AdminMessagesManager` and `AdminHelpCenter` surfaces from the Admin Message Inbox slice,
  - kept the typed `lib/admin/messages.ts` view-model contract unchanged,
  - changed copy only; no new admin renderer, dashboard reply state, or outbound-log surface was introduced.
- Route/label/support sweep identifiers searched:
  - `tab=messages`,
  - `admin-tab-messages`,
  - `Messages`,
  - `Stored requests`,
  - `Needs reply`,
  - `Mark replied`,
  - `normal email inbox`,
  - `dashboard reply`,
  - `admin-message-v1-pre-live-smoke`,
  - `admin-message-inbox`.
- Surfaces checked / directories:
  - `app/`,
  - `components/`,
  - `tests/`,
  - `docs/`,
  - `docs/runbooks/`,
  - `docs/checklists/`,
  - active/planned/done/deferred Admin Message task briefs.
- Fallout handled:
  - Help/Guide copy now says email remains the v1 reply workspace,
  - Admin Messages copy says reply from the normal email inbox in v1,
  - runbook/env parity/checklist evidence defines provider diagnostics and e-mail-first recovery,
  - deferred reply/outbound brief remains out of scope.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- relevant targeted unit/route/component/e2e tests from child slices
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Gate Evidence

- Targeted unit/component/route regression:
  - `npm exec vitest run tests/unit/admin-messages-manager.test.tsx tests/unit/admin-messages-routes.test.ts tests/unit/contact-api-route.test.ts tests/unit/admin-messages.test.ts tests/unit/admin-message-delivery.test.ts tests/unit/contact-intake.test.ts`
  - passed: 6 files, 38 tests.
- Brief governance:
  - `npm run lint:briefs:all` passed.
  - `npm run lint:quality-gates` passed after adding explicit reference-surface and support-sweep evidence.
- Screenshot handoff:
  - before/after artifacts captured at `output/admin-message-ops-closeout-2026-05-07-065040`.
  - owner approved on 2026-05-07.
  - no product-rendering files changed after capture.
- Pre-PR release gate:
  - `npm run verify:pre-pr` passed full lane on 2026-05-07 after the quality-gate evidence fix.
  - unit: 178 files, 958 tests passed.
  - e2e: 82 passed, 374 skipped.
  - build and performance budgets passed.
- Performance budget trend:
  - `verify:pre-pr` reported tighten recommendation after 4 consecutive weekly green runs.
  - decision for this non-performance Admin Messages closeout: hold budgets here; prompt owner to tighten one stretch target in the next performance-governance or performance-sensitive slice.

## Checkpoint Log

- `2026-05-07 | pre-pr-pass | npm run verify:pre-pr passed full lane after quality-gate evidence fix: unit 178 files / 958 tests, e2e 82 passed / 374 skipped, build and performance budgets passed; perf trend recommended tighten after 4 weekly green runs, decision hold for this non-performance closeout and prompt next performance-relevant slice | next: rerun npm run verify:pre-pr after this evidence-only brief update, then commit/push/PR`
- `2026-05-07 | pre-pr-gate-fix | npm run verify:pre-pr failed at lint:quality-gates because active brief lacked explicit sweep identifiers/surfaces and reference surface evidence; added implementation evidence without changing product UI after screenshot capture | next: rerun npm run verify:pre-pr`
- `2026-05-07 | screenshot-approved | owner approved before/after screenshot handoff at output/admin-message-ops-closeout-2026-05-07-065040 after structured-intake fixture clarification; no product-rendering files changed after capture | next: run npm run verify:pre-pr`
- `2026-05-07 | screenshot-handoff-ready | e-mail-first Help/Guide and Messages copy updated, ops runbook/env parity/pre-live smoke checklist added, targeted unit tests passed (6 files, 38 tests), lint:briefs:all passed, route/label/support sweep completed, and before/after screenshot artifacts captured at output/admin-message-ops-closeout-2026-05-07-065040 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-07 | in-progress | branch admin-message-ops-tests-runbook-closeout-10-10 opened from clean synced main after PR #628; brief moved to in-progress and scope is e-mail-first v1 ops/tests/runbook closeout with dashboard replies deferred | next: update Help/Guide, runbooks, env parity, and targeted tests before local verification`
- `2026-05-07 | scope-corrected | dashboard reply/outbound child deferred because email should remain the single daily inbox for first test swimmers; closeout now validates Admin Messages as form-submission safety net plus notification diagnostics | next: execute e-mail-first ops/tests/runbook closeout`
- `2026-05-06 | planned | created as final child for Admin Messages v1 to ensure ops, tests, runbooks, env parity, rollback, and 10/10 closeout are not left implicit before test swimmers | next: execute after provider, intake, inbox, and reply children`
