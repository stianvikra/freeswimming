# Task Brief: Admin Preview Bypass And Sign-In Scanability (10/10)

## Metadata

- `id`: `2026-05-09-admin-preview-bypass-and-sign-in-scanability-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Let authenticated admins bypass the shared preview password while making the sign-in page faster to scan.

## Product Decision

Do this as the first small auth/access slice. For now, preview bypass is admin-only. Approved tester bypass belongs to the Admin Test User Access Controls child brief, because it needs durable user access grants and admin management.

Remove the `What works on this device` sign-in card unless it is replaced by a materially useful recovery state. The current card is low-value copy and hurts scanability.

## Relevance Assessment Before Scoring

Relevant target categories are auth/security, preview-gate reliability, sign-in UX, accessibility, support operations, testing, and rollback. Admin editor CRUD, commerce, finance, public SEO, public AI discoverability, and content governance are not primary because this slice changes access flow and sign-in UI only.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                             | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin path from sign-in to private preview route is clear and does not require the shared preview password after valid admin auth.             | owner QA + route flow review                       | `5/5`                   |
| UX flow clarity                               | `target`     | Sign-in page has one clear primary job, no `What works on this device` card, and no duplicate preview-password prompt for authenticated admin. | screenshot handoff + Playwright flow               | `5/5`                   |
| Visual design quality                         | `target`     | Sign-in layout is calmer, scan-first, responsive, and consistent with current My Library/auth visual language.                                 | before/after screenshot handoff                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Preview access cookie is issued only after server-confirmed admin auth and does not mutate user/profile data.                                  | unit tests + route tests                           | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admins get lower-friction preview access, but no admin editor CRUD is changed.                                                | admin access QA                                    | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Removed card does not remove required labels/help; focus order, headings, errors, and form controls remain accessible.                         | Testing Library + Playwright a11y assertions       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Auth/sign-in route removes or keeps neutral UI weight and does not add new client dependency or payload growth.                                | build/perf budget + dependency diff                | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Auth session and site-lock cookie are server-canonical; no local-only admin bypass flag is trusted.                                            | data-boundary review + route tests                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Preview gate/auth routes remain dynamic and never cache admin bypass decisions across users.                                                   | route cache review + tests                         | `5/5`                   |
| Reliability and failure handling              | `target`     | Expired session, non-admin user, missing role source, and cookie write failure produce deterministic redirect/error behavior without loops.    | negative-path route tests + private-gate e2e       | `5/5`                   |
| Security and authz                            | `target`     | Bypass fails closed for anonymous, non-admin, editor/viewer unless explicitly allowed, stale sessions, and forged cookies.                     | negative-path tests + security review              | `5/5`                   |
| Privacy and compliance                        | `target`     | Auth errors and logs do not expose email lists, role metadata, preview passwords, or tokens.                                                   | code/log review                                    | `5/5`                   |
| Content governance                            | `N/A`        | N/A because no editable content, publishing workflow, content revision, or content ownership model changes.                                    | explicit scope rationale                           | `N/A`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin workflow improves by removing preview-password friction, but no admin data editing flow changes.                        | admin route QA                                     | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: site-lock metadata/robots behavior must remain unchanged while private preview routing changes.                               | metadata/private-gate regression                   | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this is private/auth UI and no public AI-discoverable route, structured data, or crawlable content changes.                        | explicit scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics taxonomy expansion required, but auth/access failures should remain support-diagnosable.                         | safe diagnostic review                             | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, subscription, entitlement, catalog, refund, payout, or revenue operation changes.                                     | explicit scope rationale                           | `N/A`                   |
| Incident response and support operations      | `target`     | Support can distinguish admin bypass success, non-admin denial, expired session, and preview cookie failure.                                   | auth runbook update + deterministic error evidence | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance, invoice, payout, subscription, entitlement reconciliation, or reporting impact.                         | explicit scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: changed auth copy remains structurally localizable and does not add hard-coded locale assumptions.                            | copy review                                        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js route/proxy/site-lock/auth helpers and Tailwind primitives; add no dependency.                                            | architecture review + dependency diff              | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit, route, private-gate, and screenshot coverage protect admin bypass, non-admin denial, and sign-in scanability.                            | targeted tests + screenshot handoff + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Admin bypass checks are request-bounded and do not introduce polling, remote fan-out, or costly background jobs.                               | implementation review                              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Feature can be rolled back to password-only preview gate by reverting the slice; private-gate tests document expected behavior.                | rollback note + pre-pr/pre-merge gates             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse existing auth/sign-in route structure and shared UI primitives,
  - keep preview-gate decisions server-side,
  - avoid trusting client-only state for bypass,
  - preserve private gate metadata and route behavior.
- TypeScript/domain contracts:
  - use existing admin-role resolver contracts,
  - model bypass result as explicit `allowed`, `denied`, or `needsPreviewPassword`.
- Supabase/data layer:
  - no schema migration expected for admin-only bypass,
  - use existing auth session/user role source,
  - keep fail-closed behavior when role source is unavailable.
- UI system:
  - reference surface: reuse the existing `/auth/sign-in` card/form layout, `AuthRequestStatus`,
    `AuthSubmitButton`, `AuthResendButton`, `PageTemplate`, and `SiteChrome` instead of
    introducing a new auth visual system,
  - remove the sign-in device-support card,
  - keep one primary auth action and concise support/retry copy,
  - screenshot handoff is before/after for desktop and mobile.
- Testing:
  - unit/route tests for admin, non-admin, anonymous, expired session,
  - private-gate Playwright coverage with admin-auth bypass,
  - screenshot handoff before broad verification.

## Data Placement And Sync Contract

- Server-canonical:
  - Supabase auth session, resolved admin role, site-lock preview cookie issuance.
- Local/browser:
  - only normal secure cookies/session storage handled by existing auth/site-lock flow.
- Sync policy:
  - preview bypass is evaluated per request/session,
  - no local bypass preference is persisted.
- Retention and sensitivity:
  - do not log preview passwords, auth tokens, cookie values, or allowlist contents.
- Cache/invalidation:
  - auth/preview-gate routes stay dynamic and session-bound.

## Identity And Rename Contract

- Canonical stable ID:
  - authenticated user id and resolved admin role.
- Human-readable identifiers:
  - email may be shown only where already appropriate for signed-in account context.
- Mutability rules:
  - admin role source remains existing role/allowlist mechanism in this slice.
- Compatibility contract:
  - password-based preview access remains available for non-authenticated preview access.
- Observability and repair:
  - support logs distinguish missing role source, denied role, and cookie write failure without
    sensitive values,
  - no unexpected 500 path is introduced for anonymous/non-admin admin-unlock attempts; those
    failure-mode paths deterministically return preview-page redirects or JSON denial, while auth
    lookup errors stay fail-closed.

## Scope

- Sign-in page scanability cleanup.
- Admin-only preview bypass for authenticated admins.
- Tests and runbook/help updates for changed auth/preview behavior.

## Out Of Scope

- Test user management.
- Admin user-management UI.
- New roles or persistent access grant schema.
- Passkey architecture changes.
- Public launch/site-lock removal.

## Acceptance Criteria

1. `What works on this device` is removed from the sign-in page.
2. Authenticated admin can reach private preview content without entering the shared preview password.
3. Anonymous and non-admin users still hit the preview gate and cannot bypass it.
4. Existing preview-password path still works.
5. No preview password, auth token, or allowlist data is logged.
6. Screenshot handoff covers sign-in desktop/mobile before/after.

## Validation

- `npm run lint:briefs`
- targeted unit/route tests for admin preview bypass
- private-gate Playwright coverage
- screenshot handoff before PR update
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Closeout Evidence

- Merged PR: `#655`
- Merge commit: `acc191b`
- Screenshot artifacts: `output/admin-preview-bypass-sign-in-scanability-2026-05-09-083728`
- `npm run verify:pre-pr`: PASS, full lane, `artifacts/test-runs/20260509-090902`
- `npm run verify:pre-merge`: PASS, `artifacts/verify-pre-merge/20260509-073847.json`
- CI: PASS for `verify`, `site-lock-smoke`, `e2e-smoke`, CodeQL, Vercel, deploy preview, and size check.
- Performance budget decision: hold for this auth/access slice; CI/local gates reported continued green margin, but budget tightening belongs in a dedicated performance-governance slice.
- `10/10 claim`: yes - all critical target categories are scored `5/5`, and no target category is below `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                 | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #655 merged; admin preview bypass works through server-confirmed admin auth.          | None         |
| UX flow clarity                               | `5/5`          | Removed low-value sign-in card, duplicate helper copy, and preview-page app Back button. | None         |
| Visual design quality                         | `5/5`          | Owner-approved screenshot handoff in the listed artifact folder.                         | None         |
| Business logic correctness and data integrity | `5/5`          | Route/unit tests prove admin-only cookie issue and non-admin/anonymous denial.           | None         |
| Accessibility (a11y)                          | `5/5`          | Existing labelled email/code form remains; removed non-essential card only.              | None         |
| Performance (CWV + payloads)                  | `5/5`          | No dependency added; removed UI weight; perf gates passed.                               | None         |
| Data placement and sync boundaries            | `5/5`          | Auth session, role check, and preview cookie remain server-canonical.                    | None         |
| Caching and invalidation strategy             | `5/5`          | Preview/auth decisions stay request/session-bound.                                       | None         |
| Reliability and failure handling              | `5/5`          | Anonymous/non-admin flows redirect or deny deterministically without unexpected 500.     | None         |
| Security and authz                            | `5/5`          | Admin-only `minimumRole` and negative-path tests cover forbidden bypasses.               | None         |
| Privacy and compliance                        | `5/5`          | No preview passwords, tokens, or allowlist values exposed in UI/log copy.                | None         |
| Incident response and support operations      | `5/5`          | Auth/support/private-access runbooks updated for admin auto-unlock and fallback paths.   | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Next/Supabase/site-lock helpers and UI patterns; no dependency added.    | None         |
| Testing and QA automation                     | `5/5`          | Targeted unit/e2e, full `verify:pre-pr`, full CI verify, and `verify:pre-merge` passed.  | None         |
| Scalability and cost efficiency               | `5/5`          | Request-bounded role/cookie check; no polling, fan-out, or background job.               | None         |
| DevOps and rollback readiness                 | `5/5`          | Rollback is revert of PR #655; pre-pr/pre-merge/CI gates passed.                         | None         |

## Help / Guide Impact

Update `docs/runbooks/auth-account-support.md` and any preview-access support copy that currently says admin sign-in and preview-password behavior are fully separate.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `preview access`, `site lock`, `preview password`, `What works on this device`, `Email code today`, `admin unlock`, `/preview-access`, `/auth/sign-in`, and `/dev/login`.

Identifiers searched: `preview access`, `site lock`, `preview password`, `What works on this device`,
`Email code today`, `admin unlock`, `/preview-access`, `/auth/sign-in`, `/dev/login`, `pushState`,
`popstate`, `history.back`, `replaceState`, and `display: standalone`.

Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/runbooks/`,
`docs/architecture/`, and the active task brief. Fallout handled in this slice: sign-in UI,
preview access UI, admin operations copy, auth account support runbook, private access runbook,
authz/cache contract registry, and route/e2e/unit tests.

## Checkpoint Log

- `2026-05-09` - Planned after owner reported preview-password friction and sign-in scanability issue. Next: execute this small admin-only slice before broader user-management/test-user work.
- `2026-05-09` - Moved to in-progress for admin-only preview bypass and sign-in scanability implementation. Next: targeted tests, screenshot handoff, then owner visual approval before broad gates.
- `2026-05-09` - Implemented sign-in scanability cleanup and admin-only preview-cookie issue route. Targeted validation: `npx vitest run tests/unit/preview-access-admin-unlock-route.test.ts tests/unit/sign-in-ui-state.test.ts`, `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium`, `npm run typecheck`, `npm run lint:briefs:all`, and screenshot artifacts in `output/admin-preview-bypass-sign-in-scanability-2026-05-09-083728`. Next: owner screenshot approval before `npm run verify:pre-pr`, commit/PR, and pre-merge gate.
- `2026-05-09` - Owner correction applied: removed the redundant sign-in intro sentence and removed the Back button from anonymous preview access. Regenerated screenshot artifacts in the same handoff folder and reran targeted unit tests, sign-in Playwright, and `npm run typecheck`. Next: owner visual approval before broad gates.
- `2026-05-09` - Owner correction applied: removed duplicate helper text under `Enter code` because the green sent-status already carries that instruction. Local browser-back audit found no `pushState`/`popstate` history hijacking; current browser-chrome hiding comes only from installed PWA `display: standalone`, while normal browser tabs retain native controls. Next: regenerate screenshot handoff.
- `2026-05-09` - PR #655 merged to `main` as `acc191b` after owner screenshot approval, local `npm run verify:pre-pr`, green GitHub checks, and local `npm run verify:pre-merge`. Post-merge preflight surfaced this repo-managed docs-only closeout. Next: merge closeout PR, then return to dryland in a fresh chat.
