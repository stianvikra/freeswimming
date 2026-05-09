# Task Brief: Admin Test User Access Controls (10/10)

## Metadata

- `id`: `2026-05-09-admin-test-user-access-controls-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Let admins approve test users and choose exactly which finished or beta surfaces each tester can see.

## Product Decision

This is a child brief under `docs/task-briefs/planned/2026-05-09-admin-user-management-foundation-10-10.md`. Do not build test-user access as a standalone hack. It should reuse the same user identity, access-grant, audit, and admin workflow foundation.

Test users should be able to bypass the preview password only after they are known to the system through invite, approved account, or explicit admin grant. Anonymous visitors cannot be treated as test users.

## Relevance Assessment Before Scoring

Relevant target categories are access UX, admin workflow, authz, data integrity, privacy, support operations, testing, and rollback. Visual quality is relevant because testers/admins need clear access states. Public SEO/AI discoverability, finance, and direct commerce operations are not primary in this child scope.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
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
| Product goals and IA                          | `target`     | Admin can create/approve tester access and choose visible surfaces without confusing test access with normal user/admin roles.                                | IA review + owner QA                             | `5/5`                   |
| UX flow clarity                               | `target`     | Tester lifecycle is clear: invited, pending, approved, active, limited, revoked, expired; testers understand what they can access.                            | admin/tester e2e + screenshot handoff            | `5/5`                   |
| Visual design quality                         | `target`     | Tester access controls use compact, scan-friendly status chips/toggles and avoid card-heavy clutter.                                                          | screenshot handoff                               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Surface grants, preview bypass, invite state, expiry, revoke, and feature visibility are deterministic and audit-logged.                                      | domain/API tests + DB constraints                | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can approve/revoke testers and choose visible surfaces quickly with confirmation and clear summary.                                                     | admin workflow QA                                | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Grant toggles, checklists, status filters, invites, and confirmations are keyboard/screen-reader usable.                                                      | a11y assertions + keyboard e2e                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Surface gating checks are bounded, cached only safely, and do not add heavy client dependencies or per-request fan-out.                                       | performance/query review                         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Tester status, preview bypass, surface grants, and expiry are server-canonical; local UI cannot unlock surfaces.                                              | data-boundary review + route tests               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Access changes invalidate/refetch tester capability state so revoked access disappears promptly.                                                              | cache/invalidation tests                         | `5/5`                   |
| Reliability and failure handling              | `target`     | Expired invite, revoked tester, stale capability cache, and missing grant table fail closed with actionable feedback.                                         | negative-path tests                              | `5/5`                   |
| Security and authz                            | `target`     | Only admins can manage tester grants; testers cannot self-escalate or see ungranted beta/admin/private surfaces.                                              | API/e2e negative-path tests                      | `5/5`                   |
| Privacy and compliance                        | `target`     | Tester records minimize PII and expose only needed access state; invite/access logs avoid secrets/tokens.                                                     | privacy/log review                               | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: surface grants may expose beta content, but this brief does not change editorial publish/revision workflows.                                 | content exposure review                          | `4/5`                   |
| Admin workflow and editability                | `target`     | Admin can safely update tester access, see before/after, and audit who changed access.                                                                        | admin e2e + audit evidence                       | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: granted tester access must not make private/beta routes crawlable or sitemap-visible.                                                        | private route metadata regression                | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because tester-gated surfaces are private and no public AI-discoverable pages or structured data are added.                                               | explicit scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: persist safe audit/status fields for later tester cohort analytics; no stats dashboard ships here.                                           | audit field review                               | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: tester access must not accidentally grant paid entitlements unless explicitly mapped; no checkout/subscription flow changes.                 | entitlement boundary review                      | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose why a tester cannot access a surface and revoke access quickly if needed.                                                                | runbook/help update + deterministic errors       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not change invoices, payouts, revenue reporting, refunds, or finance reconciliation; paid entitlement grants remain out of scope. | explicit scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: tester status labels and invite/access copy remain structurally localizable, but no locale routing ships here.                               | copy/status enum review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Admin User Management access-grant model, existing admin workspace, Supabase/RLS patterns, and no new dependency unless justified.                      | architecture review + dependency diff            | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage protects invite/approve/revoke/expiry/surface-gating/preview-bypass for admin, tester, non-tester, and anonymous users.                              | targeted tests + private-gate e2e + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Surface-grant checks scale with indexed user/grant rows and do not require expensive route-by-route manual branching.                                         | query/index review                               | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Feature flag/rollback can disable tester bypass/gating and return to admin-only/password preview without orphaning access records.                            | migration/rollback note + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - build on the Admin User Management `Users` surface,
  - expose tester controls in user detail/access section,
  - gate app surfaces server-side or through a shared capability contract.
- TypeScript/domain contracts:
  - define tester lifecycle statuses, surface grant ids, preview-bypass eligibility, expiry, and revoke semantics,
  - keep feature/surface identifiers stable and typed.
- Supabase/data layer:
  - use explicit migrations/RLS for tester grants if not provided by the parent foundation,
  - indexes for `(user_id, surface_key)` and status/expiry lookups,
  - generated types updated in the same PR.
- UI system:
  - use compact checklists/toggles/status chips,
  - no large explanatory cards in high-frequency admin workflow,
  - screenshot handoff covers admin controls and tester-visible access state.
- Testing:
  - unit tests for grant resolution and expiry,
  - API tests for unauthorized/self-escalation/cross-user attempts,
  - Playwright for tester preview bypass and denied surface.

## Data Placement And Sync Contract

- Server-canonical:
  - tester status, invite record, preview-bypass grant, surface/feature grants, expiry, revoke state, and audit log.
- Local/browser:
  - selected filters, pending toggles, and tester-view UI state only.
- Sync policy:
  - admin mutations write access grants and audit events,
  - user capability state is refreshed after sign-in and after relevant access changes,
  - revoked/expired access wins over cached local state.
- Retention and sensitivity:
  - keep audit history for access changes,
  - minimize tester PII in list views,
  - do not expose invite tokens or raw capability internals.
- Cache/invalidation:
  - capability reads must be user-scoped and invalidated after grant/revoke/expiry.

## Identity And Rename Contract

- Canonical stable ID:
  - user id, tester grant id, surface key, and audit event id.
- Human-readable identifiers:
  - email/display name and surface labels are editable display/search labels, not grant identity.
- Mutability rules:
  - surface keys are immutable after use,
  - access labels can be renamed with compatibility aliases if needed.
- Rename vs repurpose policy:
  - never repurpose a surface key for a different route/feature,
  - create a new grant key when meaning changes materially.
- Compatibility contract:
  - existing admin-only preview bypass remains valid,
  - tester grants are additive and can be disabled without removing the parent user record.
- Observability and repair:
  - denied access includes a safe reason code such as `not_approved`, `expired`, `surface_not_granted`, or `revoked`.

## Scope

- Tester status and lifecycle as a child of Admin User Management.
- Admin controls for approved tester, preview bypass, visible surfaces, expiry, and revoke.
- Tester-facing capability gating for preview/private/beta surfaces selected in the grant model.
- Audit and support diagnostics.

## Out Of Scope

- Full user-management foundation if the parent is not already shipped.
- Paid entitlement management.
- Public launch or site-lock removal.
- Editing user-owned swim/training data.
- Analytics dashboards and habit/statistics reporting.

## Acceptance Criteria

1. Admin can mark an existing user as approved tester.
2. Admin can choose which surfaces/features the tester can see.
3. Approved tester can bypass the preview password only after sign-in/invite recognition.
4. Tester cannot see ungranted surfaces.
5. Revoked or expired tester loses access promptly.
6. Every tester grant/revoke/expiry change is audit-logged.
7. Anonymous visitors cannot become testers without invite/account recognition.

## Validation

- `npm run lint:briefs`
- targeted domain/API tests for tester grants
- private-gate Playwright tests for approved, revoked, expired, anonymous, and ungranted surface states
- screenshot handoff before PR update
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

Update admin Help/Guide and `docs/runbooks/auth-account-support.md` with tester approval, preview bypass, surface grants, revoke, and support troubleshooting.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `test user`, `tester`, `approved tester`, `preview bypass`, `surface grant`, `beta`, `feature flag`, `site lock`, `/preview-access`, `/admin`, and Help/Guide surfaces.

## Checkpoint Log

- `2026-05-09` - Planned after owner clarified that test users should be a child of Admin User Management and admins must choose what testers can see. Next: execute only after the parent user-management foundation or explicitly scope a minimal grant primitive into the first tester slice.
