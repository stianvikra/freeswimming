# Task Brief: Admin User Management Foundation (10/10)

## Metadata

- `id`: `2026-05-09-admin-user-management-foundation-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Give admins a safe, auditable foundation for viewing and managing user access across all users.

## Product Decision

This is the parent brief for user access management. It should manage all users, not only testers. Test users are a child capability built on top of this foundation.

First version should focus on access governance, not full customer support CRM. Admin should be able to find users, understand account/access state, grant or remove roles/access flags, and audit changes. Deep editing of user-owned swim/training data is out of scope.

## Relevance Assessment Before Scoring

Relevant target categories are admin workflow, authz, privacy, data integrity, auditability, support operations, performance, and rollback because this creates a sensitive admin surface over user identity/access. Public SEO/AI discoverability, commerce, and finance are not primary unless later entitlement/payment access is added.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- Admin editor ergonomics
- Business logic correctness and data integrity
- Admin workflow and editability
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                            | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Admin has a clear `Users` area with user search, user detail, access state, and safe next actions.                                                            | IA review + screenshot handoff                   | `5/5`                   |
| UX flow clarity                               | `target`     | Admin can distinguish identity, role, tester status, preview access, beta access, disabled status, and audit history without ambiguity.                       | owner QA + component/e2e tests                   | `5/5`                   |
| Visual design quality                         | `target`     | Users table/detail view is dense, scan-friendly, responsive, and consistent with admin workspace patterns.                                                    | screenshot handoff                               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Role/access grants have deterministic state transitions, idempotent mutations, and no silent cross-user data mutation.                                        | domain/API tests + DB constraints                | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can find a user and change safe access flags with minimal clicks, clear confirmation, and undo/revoke path where appropriate.                           | admin workflow QA + e2e                          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Search, table, detail drawer/modal, confirmation dialogs, and status badges are keyboard/screen-reader usable.                                                | a11y assertions + keyboard e2e                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Admin Users route uses pagination/search, avoids loading all users at once, and adds no heavy client dependency.                                              | API pagination tests + build/perf review         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | User identity, access grants, roles, tester status, and audit events are server-canonical; local UI state is presentation-only.                               | data-boundary review + route tests               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin user reads are dynamic/admin-scoped; mutations invalidate/refetch affected user rows and audit history.                                                 | route/cache review + tests                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Partial failures, stale user rows, role-source mismatch, disabled accounts, and mutation conflicts fail closed with retryable admin feedback.                 | negative-path tests                              | `5/5`                   |
| Security and authz                            | `target`     | Only admin can manage users; editor/viewer/non-admin cannot escalate roles or access; service-role usage is server-only and least-privilege guarded.          | API negative-path tests + RLS/authz review       | `5/5`                   |
| Privacy and compliance                        | `target`     | User table minimizes PII, masks sensitive values, avoids secret/token exposure, and documents retention/deletion boundaries.                                  | privacy review + log review                      | `5/5`                   |
| Content governance                            | `N/A`        | N/A because this foundation manages user/access records, not editorial content, publish states, revisions, or content rollback.                               | explicit scope rationale                         | `N/A`                   |
| Admin workflow and editability                | `target`     | Admin role/access mutations are safe, confirmed, reversible where possible, and audit-logged.                                                                 | admin e2e + audit tests                          | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because admin user management is private/admin-only and must not become crawlable or sitemap-visible.                                                     | explicit scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable page, structured data, or public semantic entity surface is introduced.                                                 | explicit scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: audit events are required; product analytics dashboards are deferred unless access operations need KPI reporting later.                      | audit event review                               | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: user management must not break existing entitlement/checkout assumptions; paid access controls are out of scope until explicitly added.      | entitlement impact review                        | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose wrong role, lost access, disabled tester, preview bypass, and failed grant/revoke without raw DB edits.                                  | runbook update + deterministic error codes       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not change invoice, payout, revenue recognition, refund, or finance reporting data; entitlement reconciliation remains unchanged. | explicit scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: admin labels/statuses remain structurally localizable, but no locale routing or translation workflow ships here.                             | copy/status enum review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing admin workspace, Supabase, TypeScript validation, RLS/authz, and audit patterns; add no dependency unless strongly justified.                    | architecture review + dependency diff            | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/API/component/e2e coverage protects search, detail, grant, revoke, deny paths, audit log, and pagination.                                                | targeted tests + verify gates                    | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Search/pagination/indexes keep user management bounded as user count grows; no full-table client loads.                                                       | query/index review + performance tests           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Schema changes are migration-backed, RLS fail closed, generated types updated, and rollback leaves current allowlist/admin path usable.                       | migration/rollback plan + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - add an Admin Workspace `Users` surface using existing admin layout/tab patterns,
  - keep sensitive reads/mutations in protected admin API routes or server actions,
  - use pagination/search instead of client-side full-user loads.
- TypeScript/domain contracts:
  - define typed access grants, role grants, tester status, preview-bypass state, and audit events,
  - validate every mutation with deterministic error codes.
- Supabase/data layer:
  - use explicit migrations for access grants/audit records if existing profile role metadata is insufficient,
  - preserve compatibility with existing `ADMIN_EMAIL_ALLOWLIST` fallback,
  - RLS/authz must fail closed and protect cross-user access.
- UI system:
  - reuse admin table/detail/toolbar patterns,
  - keep destructive changes behind confirmation,
  - screenshot handoff is after/reference against existing admin workspace.
- Testing:
  - unit tests for access state transitions,
  - route tests for admin/non-admin/editor/viewer,
  - e2e for user search + grant/revoke + audit feedback.

## Data Placement And Sync Contract

- Server-canonical:
  - auth user identity, admin/user roles, access grants, tester status, preview-bypass eligibility, beta/surface grants, audit log.
- Local/browser:
  - search input, selected row, open drawer/modal, and optimistic pending UI only.
- Sync policy:
  - mutations write server-canonical grants/audit records,
  - UI refetches affected user/access records after mutation,
  - stale mutations fail with a deterministic conflict/retry message.
- Retention and sensitivity:
  - keep audit history for access changes,
  - minimize PII in list view,
  - never expose tokens, raw password data, or service-role secrets.
- Cache/invalidation:
  - admin user routes stay dynamic/admin-scoped,
  - mutation invalidates user detail and list row state.

## Identity And Rename Contract

- Canonical stable ID:
  - Supabase `auth.users.id` or explicitly chosen internal user id.
- Human-readable identifiers:
  - email/display name are searchable labels, not identity.
- Mutability rules:
  - user id is immutable,
  - email/display name may change according to auth provider rules,
  - access grant ids are stable audit references.
- Rename vs repurpose policy:
  - do not repurpose a user record for another person,
  - create/reinvite instead of rewriting identity.
- Compatibility contract:
  - existing allowlist/admin metadata remains readable until migrated,
  - migration must not strand current admin access.
- Observability and repair:
  - unresolved role/grant conflicts are logged with safe ids and surfaced in admin support copy.

## Scope

- Admin `Users` IA and foundation data contract.
- User search/list/detail.
- Role/access grant read model.
- Safe grant/revoke mutations for defined access flags.
- Audit history for access changes.
- Help/runbook updates.

## Out Of Scope

- Editing user-owned swim/training data.
- Deleting users or GDPR export/delete workflows unless needed for access safety.
- Billing/entitlement management.
- Test-user surface gating beyond foundation primitives.
- Passkey provider migration.

## Acceptance Criteria

1. Admin can open a `Users` admin surface and search users safely.
2. Admin can see each user's role/access/tester/preview-bypass state.
3. Admin can grant/revoke approved access flags with confirmation.
4. Every mutation creates an audit record with actor, target user, action, before/after, and timestamp.
5. Non-admin, editor/viewer, anonymous, and cross-user direct API attempts fail closed.
6. Existing admin allowlist fallback still works during and after rollout.
7. Query path is paginated/indexed and does not load all users client-side.

## Validation

- `npm run lint:briefs`
- targeted unit/domain tests
- targeted admin API negative-path tests
- targeted admin e2e for search/grant/revoke/audit
- screenshot handoff before PR update
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

Update admin Help/Guide and runbooks to explain user access roles, tester status, preview bypass, and recovery when an admin loses access.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `admin role`, `allowlist`, `Users`, `user management`, `tester`, `preview bypass`, `access grant`, `role`, `ADMIN_EMAIL_ALLOWLIST`, `/admin`, and related runbooks/tests.

## Checkpoint Log

- `2026-05-09` - Planned after owner identified that test users should be a child of a broader admin user-management system. Next: execute only after the smaller admin preview-bypass/sign-in polish slice or when user-access management becomes the active priority.
