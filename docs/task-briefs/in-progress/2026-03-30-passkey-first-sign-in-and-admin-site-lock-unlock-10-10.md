# Task Brief: Passkey-First Sign-In And Admin Site-Lock Unlock (10/10)

## Metadata

- `id`: `2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-30`
- `updated`: `2026-03-30`

## Goal

Define a deterministic 10/10 implementation contract for phased passkey rollout: email-code bootstrap now, passkey-backed future sign-ins on trusted devices, and admin-only site-lock unlock with safe recovery fallbacks.

## Why This Brief Exists

- Current `/auth/sign-in` is email-code / magic-link driven and current `/preview-access` uses a shared password flow.
- The next quality bar is lower-friction, higher-trust authentication that can use device-native platform authenticators:
  - Touch ID / Face ID where available,
  - Android fingerprint / device unlock,
  - Windows Hello,
  - desktop platform authenticator or passcode/PIN fallback where the platform chooses it.
- On the web, the correct primitive is passkeys/WebAuthn, not a custom vendor-specific Face ID API.
- This is high-stakes auth/security scope, so it needs a scorecard-complete planned brief before implementation starts.
- Relevant production admin-note triage is complete, and this brief now owns the passkey/site-lock implementation track.

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
    - reason: matched only because the note body mentions authz/noise limits for quick-note rollout; no passkey/site-lock scope.
- Triage conclusion:
  - this brief may proceed without linking an existing production admin note,
  - any newly discovered production auth/security friction during implementation must still be triaged explicitly before scope expands.

## Scope

- Define the recommended current auth contract for `/auth/sign-in`:
  - first sign-in remains email magic link / one-time code bootstrap,
  - passkeys are presented as the recommended follow-up for faster future sign-ins on trusted devices,
  - copy uses platform-neutral `passkey` language rather than hardcoded `Face ID` / `Touch ID` labels.
  - full unauthenticated `passkey-first` entry remains deferred until the provider/runtime stack supports it cleanly and safely.
- Define passkey registration and management contract:
  - existing signed-in users can add a passkey after successful fallback sign-in,
  - passkey management lives in `My Library` under a dedicated `Account & Security` surface (or clearly separated security card inside profile), not mixed into athlete-performance data fields,
  - users manage passkeys by adding/removing devices and recovery methods, not by a vague generic on/off switch,
  - users can see and remove registered passkeys safely.
- Define admin-only site-lock unlock contract for `/preview-access`:
  - public visitors see locked-state information only,
  - admin users can unlock via authenticated admin identity plus passkey-backed flow,
  - shared preview password can remain as explicit ops fallback only until removal criteria are met.
- Define cross-platform support expectations:
  - Apple, Android, Windows, and desktop browsers are validated against passkey/platform-authenticator behavior,
  - unsupported browsers/devices get deterministic fallback to email sign-in without dead ends.
- Define security, testing, rollout, and rollback requirements for introducing passkeys on top of the current auth stack.

## Out Of Scope

- Full replacement of Supabase user/session management.
- Native app work.
- Non-admin public early-access/tester program redesign.
- Broader account-settings redesign outside passkey/security management.
- Password-based end-user auth introduction.

## Data Placement And Sync Contract

- Server-canonical:
  - user identity, session issuance, admin role checks, site-lock bypass eligibility, and registered passkey credential records.
  - WebAuthn challenge generation/verification state and anti-replay guarantees.
- Local-only:
  - transient browser capability detection,
  - in-progress sign-in UI state,
  - non-sensitive optimistic affordances such as `passkey available` or `falling back to email`.
- Sync behavior:
  - passkey registration, removal, and sign-in success are server-confirmed before UI claims success,
  - admin site-lock unlock is derived from authenticated admin identity plus valid site-lock/admin session issuance,
  - fallback email/code state must not silently overwrite passkey registration state.
- Retention and sensitivity:
  - credential public keys / ids may be stored server-side,
  - no raw biometric material is ever stored by freeswimming.org,
  - error logs must redact email, challenge, and credential identifiers where not operationally necessary.
- Cache / invalidation:
  - auth and site-lock surfaces remain dynamic,
  - passkey management views refresh after registration/removal,
  - admin role or site-lock policy changes invalidate unlock eligibility immediately.

## Identity And Rename Contract

- Canonical stable ID:
  - Supabase `auth.users.id` remains the canonical user identifier.
  - each registered passkey credential must have a stable server-side credential row/id linked to a user id.
- Human-readable identifiers:
  - passkey display labels are user-editable convenience labels only and are never auth-critical.
  - browser/device-provided authenticator names are presentation-only and may vary by platform.
- Mutability rules:
  - user id is immutable,
  - passkey credential id is immutable once created,
  - display label may be renamed safely without changing the credential itself.
- Rename vs repurpose policy:
  - renaming a passkey label edits metadata in place,
  - moving a credential between users is forbidden; a new registration is required.
- Compatibility contract:
  - email magic-link / OTP fallback remains available while passkey rollout matures,
  - legacy site-lock password unlock may remain as explicit ops fallback until decommissioned.
- Observability and repair:
  - unresolved credential reads, duplicate-registration attempts, and stale challenge failures must be logged with redacted identifiers and clear support diagnostics.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- Business logic correctness and data integrity
- Security and authz
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold                                                                                                                                    | Evidence                                                 |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Product goals and IA                          | `target`     | Sign-in and locked-site IA is explicit: `passkey first`, `email fallback`, `admin-only unlock`, with no route ambiguity between auth and site-lock. | IA contract + route copy review + e2e route matrix       |
| UX flow clarity                               | `target`     | Users always see one clear next action on supported and unsupported platforms; no dead-end auth or unlock state on required device/browser matrix.  | e2e auth/site-lock flows + manual matrix QA              |
| Visual design quality                         | `target`     | Auth and lock surfaces maintain consistent hierarchy, trust cues, and state styling across phone/tablet/desktop with no unfinished seams.           | preview screenshots + manual UI review                   |
| Business logic correctness and data integrity | `target`     | WebAuthn challenge, credential binding, admin unlock eligibility, and fallback state transitions are deterministic and free of silent corruption.   | unit tests + route assertions + runtime invariants       |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin editing is not the primary scope, but admin unlock flows must remain low-friction and deterministic.                         | scope rationale + admin unlock QA                        |
| Accessibility (a11y)                          | `target`     | Passkey, fallback email/code, and locked-site admin actions remain keyboard/focus/label accessible with no serious or critical violations.          | e2e a11y checks + manual keyboard QA                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no meaningful regression on `/auth/sign-in`, `/preview-access`, `/`, or `/my-library` from auth capability detection or new UI.    | perf budgets + build artifacts                           |
| Data placement and sync boundaries            | `target`     | Local vs server-canonical ownership for passkeys, sessions, and fallback state is explicit and enforced in implementation and tests.                | data placement contract + tests                          |
| Caching and invalidation strategy             | `supporting` | Supporting only: changed auth and site-lock reads stay dynamic with explicit invalidation after credential/session changes.                         | route/data contract + tests                              |
| Reliability and failure handling              | `target`     | Unsupported browser, cancelled biometric prompt, stale challenge, offline, and fallback-email failures all recover without unexpected `500`s.       | negative-path tests + manual matrix notes                |
| Security and authz                            | `target`     | Passkey registration/login and admin-only site-lock unlock fail closed, enforce admin role checks, and do not expose shared-admin bypass to public. | security tests + role-gate assertions + redaction review |
| Privacy and compliance                        | `target`     | No raw biometric material is stored; logs/events/errors avoid sensitive passkey payload leakage.                                                    | payload/log review + test assertions                     |
| Content governance                            | `supporting` | Supporting only: no content source-of-truth model changes.                                                                                          | scope rationale                                          |
| Admin workflow and editability                | `supporting` | Supporting only: admin unlock and security management labels/actions stay clear, but no broader admin CRUD workflow changes.                        | scope rationale + manual QA                              |
| SEO and crawlability                          | `supporting` | Supporting only: locked-site routing and auth route metadata remain correct and non-indexing behavior stays deterministic while site lock is on.    | metadata tests + private-gate regression checks          |
| AI discoverability                            | `supporting` | Supporting only: no public AI discoverability contract change beyond preserving correct locked/public route semantics.                              | scope rationale                                          |
| Analytics and KPI observability               | `target`     | Passkey registration, sign-in success/failure, fallback usage, and admin unlock attempts emit safe, actionable event/log taxonomy.                  | analytics contract + event assertions                    |
| Commerce and revenue ops                      | `supporting` | Supporting only: auth change must not break entitlement access to My Library after sign-in.                                                         | claim/library regression coverage                        |
| Incident response and support operations      | `target`     | Support/runbooks cover failed registration, lost-device recovery, admin unlock issues, and rollback triggers for auth regressions.                  | runbook updates + ops checklist                          |
| Finance and reporting operations              | `N/A`        | N/A for this auth/security scope because no pricing, billing, refunds, or reconciliation data path changes are introduced.                          | scope rationale                                          |
| i18n operational readiness                    | `supporting` | Supporting only: auth/security copy must remain locale-extensible and avoid platform-specific wording that blocks future localization.              | string inventory review + scope rationale                |
| Stack-fit and dependency discipline           | `target`     | Solution uses stack-native browser WebAuthn patterns and explicit rationale for any auth-library addition; no dependency sprawl.                    | architecture decision + dependency diff                  |
| Testing and QA automation                     | `target`     | Unit, e2e, private-gate, and negative-path coverage exist for supported/fallback auth flows; `verify:pre-pr` and `verify:pre-merge` stay green.     | gate logs + CI checks + targeted auth/site-lock suites   |
| Scalability and cost efficiency               | `supporting` | Supporting only: challenge/session storage and verification paths avoid runaway DB or third-party auth costs.                                       | architecture review + implementation notes               |
| DevOps and rollback readiness                 | `target`     | Rollout can be feature-flagged and reverted cleanly to email fallback + current lock behavior without orphaning users.                              | rollout plan + rollback notes + runbook                  |

## Acceptance Criteria

- A scorecard-complete, lintable planned brief exists for passkey-first auth + admin-only site-lock unlock.
- The brief explicitly defines passkey-first sign-in, email fallback, and admin-only preview unlock as separate but connected user jobs.
- The brief explicitly places passkey management in `My Library > Account & Security` (or an equally separate security area), not inside athlete data/profile fields.
- Cross-platform support expectations are explicit for Apple, Android, Windows, and desktop browsers.
- The brief states that device biometrics/PIN are platform-managed passkey unlock methods, not data stored by freeswimming.org.
- Security and rollback requirements are explicit enough to implement without weakening current auth/site-lock guarantees.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`
- implementation phase must also require:
  - `SITE_LOCK_ENABLED=1 npm run test:e2e:private-gate`
  - `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD=\"<password>\" npm run test:e2e:private-gate` until password fallback is intentionally removed or deprecated

## Constraints

- Use `passkey` as the primary user-facing term; do not hardcode vendor-specific labels like `Face ID` unless the platform itself presents them.
- Keep email magic-link / one-time-code recovery until passkey enrollment, lost-device recovery, and unsupported-browser cases are fully covered.
- Do not assume current Supabase auth primitives provide a turnkey passkey path; architecture choice must be explicit and security-reviewed.
- Keep site-lock public posture safe: no admin-only unlock affordance should accidentally broaden access for non-admin visitors.

## 10/10 Quality Bar

- Primary auth action is obvious and trustworthy on every supported device.
- Unsupported/cancelled/offline states always expose a clear fallback and recovery path.
- Admin unlock while site is private feels low-friction for the owner/admin, but impossible to confuse with public access.
- No silent auth/session state drift between passkey, fallback email sign-in, and site-lock unlock.
- Security, recovery, and rollback expectations are explicit and testable before implementation begins.

## Checkpoint Log

- `2026-03-30 | working tree | created canonical planned 10/10 brief for passkey-first sign-in and admin-only site-lock unlock; next: triage relevant production admin notes, decide custom WebAuthn vs provider-native architecture, and then move brief to in-progress before implementation`
- `2026-03-30 | working tree | production admin-note triage completed directly against prod queue: no currently open note directly owns or conflicts with passkey/site-lock scope; brief moved to in-progress so implementation can start under explicit ownership | next: decide architecture path (provider-native vs custom WebAuthn orchestration), then cut the first implementation slice`
- `2026-03-30 | working tree | chose provider-native Supabase WebAuthn MFA as the first secure foundation: new My Library Account & Security surface, admin preview unlock route/card on /preview-access, analytics taxonomy, and site-lock runbook updates shipped locally while keeping email sign-in + shared preview password as explicit fallbacks; hardened sanitize-next-build-artifacts to clear stale .next/server output before build | validation: npm run typecheck, targeted vitest, isolated dryland Playwright rerun, npm run verify:pre-pr (green) | next: commit, push, open PR, and wait for CI before npm run verify:pre-merge`
- `2026-03-30 | working tree | hardened the incidental dryland e2e save assertion discovered during passkey-slice verify by waiting on the PATCH response and stable saved-state badge instead of a transient toast; reran isolated dryland Playwright and full npm run verify:pre-pr successfully on the updated tree | next: commit the verify hardening, push the branch, and open/update the PR`
- `2026-03-30 | working tree | confirmed current provider-native Supabase WebAuthn support in this stack is session-bound MFA/step-up, not a standalone unauthenticated passkey sign-in primitive; updated /auth/sign-in to a passkey-aware email-code flow with explicit device support status, less email-heavy copy, and honest recovery framing instead of a fake passkey button | validation: npm run typecheck, npx vitest run tests/unit/auth-passkey-readiness-card.test.tsx tests/unit/sign-in-ui-state.test.ts tests/unit/sign-in-request.test.ts, npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium | next: run npm run verify:pre-pr on this slice, then open PR if green`
- `2026-03-30 | working tree | owner chose the recommended phased rollout over true passkey-first entry: keep email-code bootstrap, then guide newly signed-in users toward adding a passkey on the current device from My Library > Account & Security; next slice now owns My Library onboarding clarity and security-page setup guidance so the recommended path is obvious in-product | next: implement the onboarding card and setup callout, then rerun targeted tests + verify:pre-pr`
