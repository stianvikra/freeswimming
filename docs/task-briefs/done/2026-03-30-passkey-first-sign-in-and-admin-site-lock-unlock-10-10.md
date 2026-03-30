# Task Brief: Passkey-First Sign-In And Admin Site-Lock Unlock (10/10)

## Metadata

- `id`: `2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-30`
- `updated`: `2026-03-30`

## Goal

Restore a truthful 10/10 auth/security experience for the current stack: email-code sign-in today, shared preview-password unlock today, and an explicit defer of real passkeys until a supported future architecture is chosen.

## Why This Brief Exists

- `/auth/sign-in` and `My Library > Account & Security` were shaped around a passkey-forward story that current hosted Supabase auth does not actually support in the way we assumed.
- Live device testing on iPhone exposed the real problem: the product promised passkeys, but the environment returned `Passkeys are not enabled in this Supabase environment yet.`
- Current hosted Supabase MFA guidance supports TOTP and phone for this path, not the ordinary user-facing passkey/WebAuthn rollout we were aiming for.
- Auth/security is high-stakes scope, so the immediate quality bar is honesty, recovery clarity, and safe future optionality instead of pushing a fake passkey promise.
- Relevant production admin-note triage is complete, and this brief continues to own the current auth/security cleanup plus the later strong-auth decision point.

## Admin Notes Triage Disposition

Production admin notes reviewed against this brief on `2026-03-30`:

- Open production queue reviewed directly against the production database (`12` open notes at review time).
- No currently open production admin note directly owns passkey, WebAuthn, sign-in, preview/site-lock unlock, or related auth-security UX scope.
- No currently open production admin note conflicts with this brief's ownership or requires a residual split before implementation starts.
- False-positive keyword matches were inspected and excluded:
  - `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up`
    - disposition: not owned by this brief.
    - reason: matched only because the note body mentions `authz` in a different builder context; no auth/sign-in/site-lock scope.
  - `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
    - disposition: not owned by this brief.
    - reason: matched only because the note body mentions authz/noise limits for quick-note rollout; no auth/sign-in/site-lock scope.
- Triage conclusion:
  - this brief may proceed without linking an existing production admin note,
  - any newly discovered production auth/security friction during implementation must still be triaged explicitly before scope expands.

## Scope

- Define the truthful current auth contract for `/auth/sign-in`:
  - first sign-in remains email magic link / one-time code bootstrap,
  - auth copy must not imply that users can add or use passkeys in the current stack,
  - device/browser capability messaging may stay informational, but it must clearly say that freeswimming is not using device-based sign-in yet.
- Define the truthful current `My Library > Account & Security` contract:
  - security remains clearly separated from swimmer profile/training setup,
  - users can see how sign-in and preview access work today,
  - current UI must not present add/remove/manage passkey controls that cannot succeed.
- Define the truthful current admin site-lock contract for `/preview-access`:
  - public visitors see locked-state information only,
  - admins sign in with their admin email first,
  - admins use the shared preview password today,
  - any stronger device-based admin unlock remains explicitly deferred.
- Define the future decision boundary:
  - real passkeys remain a product goal,
  - a future slice must choose either a supported auth provider/stack or an explicit custom WebAuthn architecture before passkeys return to user-facing UI.
- Define security, testing, rollout, and rollback requirements for removing false passkey promises without weakening current auth/site-lock safety.

## Out Of Scope

- Shipping real passkey registration or passkey-first login on the current hosted Supabase auth path.
- Shipping admin passkey unlock in the current stack.
- Full replacement of Supabase user/session management in this cleanup slice.
- Native app work.
- Non-admin public early-access/tester program redesign.
- Broader account-settings redesign outside current auth/security clarity.
- Password-based end-user auth introduction.

## Data Placement And Sync Contract

- Server-canonical:
  - user identity and session issuance,
  - admin role checks,
  - site-lock bypass eligibility and preview-access cookie issuance,
  - preview password validation and site-lock session tokens.
- Local-only:
  - transient browser capability detection,
  - in-progress sign-in UI state,
  - non-sensitive informational copy such as `email code today` and `device-based sign-in deferred`.
- Sync behavior:
  - sign-in success is server-confirmed before UI claims success,
  - admin preview unlock remains server-confirmed through current password/session flow,
  - local device-capability checks must never be treated as proof that sign-in methods are actually enabled server-side.
- Retention and sensitivity:
  - no device biometric material is stored by freeswimming.org,
  - no passkey credential records are part of the live current contract,
  - error logs and analytics must not imply or leak unsupported WebAuthn challenge/credential payloads.
- Cache / invalidation:
  - auth and site-lock surfaces remain dynamic,
  - account-security and preview-access surfaces must reflect current sign-in/site-lock state on reload,
  - site-lock policy changes invalidate preview unlock eligibility immediately.

## Identity And Rename Contract

- Canonical stable ID:
  - Supabase `auth.users.id` remains the canonical user identifier.
- Human-readable identifiers:
  - user email is presentation-only and may change through normal auth/account operations,
  - `Account & Security`, `Preview Access`, and related labels are operator-facing UI labels only.
- Mutability rules:
  - user id is immutable,
  - current sign-in method copy is mutable product copy, not server identity state.
- Rename vs repurpose policy:
  - current security labels may be edited in place as UX copy evolves,
  - future real passkey/device identifiers are deferred until a supported architecture exists.
- Compatibility contract:
  - email magic-link / OTP fallback remains the live user sign-in path,
  - shared preview password remains the live admin unlock path while site lock is active,
  - any future stronger factor must preserve a documented fallback/recovery path.
- Observability and repair:
  - unresolved auth or preview unlock failures must log enough redacted support detail to distinguish user error, admin-role failure, site-lock policy, and unsupported-architecture assumptions.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- Business logic correctness and data integrity
- Security and authz
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold                                                                                                                                               | Evidence                                                 |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Product goals and IA                          | `target`     | Auth and site-lock IA are explicit: `email code today`, `shared preview password today`, and `stronger device-based auth deferred`, with no false promises.    | IA contract + route copy review + e2e route matrix       |
| UX flow clarity                               | `target`     | Users always see one clear next action on sign-in, account-security, and preview-access surfaces with no dead-end unsupported-device messaging.                | e2e auth/site-lock flows + manual matrix QA              |
| Visual design quality                         | `target`     | Auth and lock surfaces maintain consistent trust cues and state hierarchy across phone/tablet/desktop with no visually misleading passkey affordances.         | preview screenshots + manual UI review                   |
| Business logic correctness and data integrity | `target`     | Current auth and preview unlock behavior are deterministic, and UI never claims a sign-in path that the server/runtime cannot actually fulfill.                | unit tests + route assertions + runtime invariants       |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin editing is not the main scope, but admin preview access guidance must stay low-friction and deterministic.                              | scope rationale + admin unlock QA                        |
| Accessibility (a11y)                          | `target`     | Email-code sign-in, preview password fallback, and admin guidance remain keyboard/focus/label accessible with no serious or critical violations.               | e2e a11y checks + manual keyboard QA                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no meaningful regression on `/auth/sign-in`, `/preview-access`, `/`, or `/my-library` from auth-clarity copy and lightweight status UI.       | perf budgets + build artifacts                           |
| Data placement and sync boundaries            | `target`     | Local capability checks and server-canonical auth/preview state are explicit and enforced; unsupported passkey state is never treated as canonical.            | data placement contract + tests                          |
| Caching and invalidation strategy             | `supporting` | Supporting only: changed auth and site-lock reads stay dynamic with explicit invalidation after sign-in and preview-unlock state changes.                      | route/data contract + tests                              |
| Reliability and failure handling              | `target`     | Unsupported-device, unsupported-stack, bad-password, and unauthorized-admin states recover without misleading success copy or unexpected `500`s.               | negative-path tests + manual matrix notes                |
| Security and authz                            | `target`     | Email sign-in, preview password validation, and admin-only preview eligibility fail closed and do not broaden access through misleading fallback logic.        | security tests + role-gate assertions + redaction review |
| Privacy and compliance                        | `target`     | No raw biometric material is stored, and current logs/errors do not imply unsupported WebAuthn payload handling.                                               | payload/log review + test assertions                     |
| Content governance                            | `supporting` | Supporting only: no content source-of-truth model changes.                                                                                                     | scope rationale                                          |
| Admin workflow and editability                | `supporting` | Supporting only: labels and recovery text stay clear for admins, but no broader admin CRUD workflow changes are introduced.                                    | scope rationale + manual QA                              |
| SEO and crawlability                          | `supporting` | Supporting only: locked-site routing and auth metadata remain correct and non-indexing behavior stays deterministic while site lock is on.                     | metadata tests + private-gate regression checks          |
| AI discoverability                            | `supporting` | Supporting only: no public AI discoverability contract change beyond preserving correct locked/public route semantics.                                         | scope rationale                                          |
| Analytics and KPI observability               | `target`     | Auth/security events and support diagnostics describe the real current flow and do not emit misleading passkey-success assumptions.                            | analytics contract + event assertions                    |
| Commerce and revenue ops                      | `supporting` | Supporting only: auth change must not break entitlement access to My Library after sign-in.                                                                    | claim/library regression coverage                        |
| Incident response and support operations      | `target`     | Runbooks and support guidance cover email sign-in, preview password recovery, unsupported passkey assumptions, and rollback triggers for auth regressions.     | runbook updates + ops checklist                          |
| Finance and reporting operations              | `N/A`        | N/A for this auth/security scope because no pricing, billing, refunds, reconciliation, or payout data path changes are introduced.                             | scope rationale                                          |
| i18n operational readiness                    | `supporting` | Supporting only: auth/security copy stays locale-extensible and avoids platform-specific wording that blocks future localization.                              | string inventory review + scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Current UX only claims capabilities that the chosen stack actually supports, and future real passkeys require an explicit architecture decision before return. | architecture decision + dependency diff                  |
| Testing and QA automation                     | `target`     | Unit, e2e, private-gate, and negative-path coverage validate the truthful current flow; `verify:pre-pr` and `verify:pre-merge` stay green.                     | gate logs + CI checks + targeted auth/site-lock suites   |
| Scalability and cost efficiency               | `supporting` | Supporting only: cleanup slice does not add runaway DB, auth, or third-party operational cost.                                                                 | architecture review + implementation notes               |
| DevOps and rollback readiness                 | `target`     | Current auth/security messaging can be rolled back cleanly without orphaning users or leaving hidden stronger-auth dependencies behind.                        | rollout plan + rollback notes + runbook                  |

## Acceptance Criteria

- The active brief remains scorecard-complete and lintable while reflecting the truthful current auth contract.
- `/auth/sign-in`, `Account & Security`, and `/preview-access` no longer promise live passkey/device-based sign-in in the current stack.
- `Account & Security` stays clearly separate from swimmer profile data and explains current sign-in plus preview-access recovery honestly.
- Current admin preview access is documented as `admin email sign-in + shared preview password` with no fake stronger-factor CTA in normal flow.
- The brief explicitly records that real passkeys remain a future architecture decision, not an environment toggle we simply forgot to enable.
- Security, rollback, and future decision requirements remain explicit enough to support a later real-WebAuthn brief without weakening today’s auth posture.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`
- implementation phase must also require:
  - targeted unit tests for auth/security truthfulness and negative paths
  - targeted Playwright coverage for `/auth/sign-in` and `/preview-access`
  - password-backed private-gate coverage while preview password remains the live unlock path

## Constraints

- Do not present passkeys, Face ID, Touch ID, or device-based admin unlock as live setup paths in the current hosted Supabase auth stack.
- Keep email magic-link / one-time-code recovery as the live user sign-in path until a supported stronger-auth architecture is chosen and implemented.
- Keep site-lock public posture safe: no admin-only unlock affordance should accidentally broaden access for non-admin visitors.
- Treat future real passkeys as a separate architecture decision, not as a hidden dashboard toggle or plan-tier upsell assumption.

## 10/10 Quality Bar

- Primary auth action is obvious and trustworthy on every supported device today.
- Unsupported-stack states are honest and calm instead of promising broken setup.
- Admin unlock while the site is private feels simple and recoverable for the owner/admin, but impossible to confuse with public access.
- No silent auth/session state drift exists between email sign-in, preview-password unlock, and any deferred future device-based auth ambition.
- Security, recovery, and rollback expectations are explicit and testable before a future stronger-auth implementation begins.

## Checkpoint Log

- `2026-03-30 | working tree | created canonical planned 10/10 brief for passkey-first sign-in and admin-only site-lock unlock; next: triage relevant production admin notes, decide custom WebAuthn vs provider-native architecture, and then move brief to in-progress before implementation`
- `2026-03-30 | working tree | production admin-note triage completed directly against prod queue: no currently open note directly owns or conflicts with passkey/site-lock scope; brief moved to in-progress so implementation can start under explicit ownership | next: decide architecture path (provider-native vs custom WebAuthn orchestration), then cut the first implementation slice`
- `2026-03-30 | working tree | chose provider-native Supabase WebAuthn MFA as the first secure foundation: new My Library Account & Security surface, admin preview unlock route/card on /preview-access, analytics taxonomy, and site-lock runbook updates shipped locally while keeping email sign-in + shared preview password as explicit fallbacks; hardened sanitize-next-build-artifacts to clear stale .next/server output before build | validation: npm run typecheck, targeted vitest, isolated dryland Playwright rerun, npm run verify:pre-pr (green) | next: commit, push, open PR, and wait for CI before npm run verify:pre-merge`
- `2026-03-30 | working tree | hardened the incidental dryland e2e save assertion discovered during passkey-slice verify by waiting on the PATCH response and stable saved-state badge instead of a transient toast; reran isolated dryland Playwright and full npm run verify:pre-pr successfully on the updated tree | next: commit the verify hardening, push the branch, and open/update the PR`
- `2026-03-30 | working tree | confirmed current provider-native Supabase WebAuthn support in this stack is session-bound MFA/step-up, not a standalone unauthenticated passkey sign-in primitive; updated /auth/sign-in to a passkey-aware email-code flow with explicit device support status, less email-heavy copy, and honest recovery framing instead of a fake passkey button | validation: npm run typecheck, npx vitest run tests/unit/auth-passkey-readiness-card.test.tsx tests/unit/sign-in-ui-state.test.ts tests/unit/sign-in-request.test.ts, npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium | next: run npm run verify:pre-pr on this slice, then open PR if green`
- `2026-03-30 | working tree | owner chose the recommended phased rollout over true passkey-first entry: keep email-code bootstrap, then guide newly signed-in users toward adding a passkey on the current device from My Library > Account & Security; next slice now owns My Library onboarding clarity and security-page setup guidance so the recommended path is obvious in-product | next: implement the onboarding card and setup callout, then rerun targeted tests + verify:pre-pr`
- `2026-03-30 | working tree | live iPhone validation exposed that current hosted Supabase auth does not support the promised passkey flow in this product path; cleanup slice now removes false passkey/setup promises, restores truthful email-code + preview-password guidance, and records real passkeys as a future architecture decision instead of an environment-toggle assumption | next: update tests/brief/runbooks to the honest contract, rerun targeted auth suites, then run full verify:pre-pr`
- `2026-03-30 | 1db55c1 | merged via PR #325 after required CI checks passed; auth truthfulness cleanup is now on main and this brief moves to done | next: use the done auth contract as the baseline for later real-passkeys decision and rollout planning`
