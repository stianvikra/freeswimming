# Task Brief: Clerk Passkeys For Paying Members First (10/10)

## Metadata

- `id`: `2026-03-30-clerk-passkeys-paying-members-first-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-30`
- `updated`: `2026-03-30`

## Goal

Ship a production-safe first real passkey rollout using Clerk for paying subscribers / members first, while preserving email-code fallback, protecting entitlements, and keeping the migration reversible.

## Why This Brief Exists

- The current stack truthfully stops at `email code today`; real passkeys were deferred after live validation showed hosted Supabase was not delivering the intended product path.
- The decision brief now recommends `Clerk` as the best first-class passkey candidate if freeswimming.org later ships true passkeys.
- Rolling passkeys out first to paying members keeps business value high while containing migration, recovery, and support risk.
- This brief exists so that a future implementation can start from a concrete, strict, 10/10 migration contract rather than a vague "add Clerk later" idea.

## Relationship To Decision Brief

- This brief depends on [2026-03-30-real-passkeys-architecture-decision-and-rollout-gate-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-30-real-passkeys-architecture-decision-and-rollout-gate-10-10.md).
- Do not move this brief to `in-progress` until the decision brief has been explicitly accepted and the provider choice remains `Clerk`.

## Admin Notes Triage Disposition

- This is a future implementation brief only.
- Before implementation starts:
  - rerun production admin-note triage directly against the live production queue,
  - record every relevant auth/security/member-access note disposition,
  - create residual notes if recovery, entitlement migration, or admin support scope expands.

## Dependencies And Boundaries

- This brief depends on [2026-03-30-real-passkeys-architecture-decision-and-rollout-gate-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-30-real-passkeys-architecture-decision-and-rollout-gate-10-10.md) being explicitly accepted with `Clerk` still chosen.
- Current truthful auth behavior baseline was established by [2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md) and stays the live contract until this rollout actually starts.
- This brief owns:
  - provider-specific member migration planning,
  - identity/entitlement linkage rules,
  - paying-members-first rollout gates,
  - support/runbook/rollback expectations for the Clerk path.
- This brief does not own:
  - public-anonymous auth replacement on day one,
  - unrelated billing/product-pricing changes,
  - admin/site-lock redesign unless explicitly split back in later.

## Scope

- Introduce `Clerk` as the passkey-capable auth layer for paying subscribers / members first.
- Keep public marketing pages and non-member traffic outside the first rollout scope.
- Keep `email code` available as fallback during rollout.
- Implement a staged member auth contract:
  - initial bootstrap / first sign-in,
  - passkey setup prompt after successful member sign-in,
  - returning passkey sign-in on supported devices,
  - fallback email-code flow on unsupported/new devices,
  - lost-device recovery,
  - passkey management in `My Library > Account & Security`.
- Preserve entitlement access:
  - members with active subscriptions must keep access during migration,
  - login-provider change must not strand active paid members.
- Keep current admin preview unlock path stable in the first Clerk rollout unless a separate admin step-up slice is explicitly added.
- Add analytics, support diagnostics, runbooks, and rollback controls for the new member-auth path.

## Out Of Scope

- Replacing all auth for anonymous/public visitors in the first rollout.
- Shipping a raw custom WebAuthn implementation.
- Rebuilding all admin auth and site-lock operations in the same slice unless explicitly rescoped later.
- Native app auth.
- Password-based primary auth.
- Broad redesign of billing, product catalog, or subscription pricing.

## Data Placement And Sync Contract

- Server-canonical:
  - internal member account identity,
  - subscription/entitlement status,
  - Clerk user identity linkage,
  - passkey credential metadata exposed through Clerk-managed auth state,
  - fallback/recovery eligibility,
  - audit logs for enroll, sign-in, revoke, recovery, and support actions.
- Local-only:
  - transient device/browser capability checks,
  - optimistic UI state during sign-in/setup,
  - non-sensitive "this device is ready" or "try email code instead" messaging,
  - optional device nickname draft before save.
- Sync policy:
  - login and credential status are only canonical after server confirmation,
  - entitlement checks remain server authoritative,
  - member migration state must update deterministically after successful Clerk linkage,
  - credential removal/revocation invalidates future device use immediately,
  - stale security/account pages refresh after add/remove/rename/recovery actions.
- Retention and sensitivity:
  - no private keys or biometric material stored by freeswimming.org,
  - only the minimum provider/account metadata needed for support, auditing, and entitlement mapping is retained,
  - recovery and support logs must redact secrets, challenges, tokens, and sensitive payloads.
- Cache / invalidation:
  - `/auth/sign-in`, `/my-library/security`, member gateways, and member account surfaces remain dynamic,
  - entitlement or auth-state changes invalidate access decisions immediately,
  - stale migration or recovery state must not remain cached across navigation or reload.

## Identity And Rename Contract

- Canonical stable ID:
  - introduce or preserve a provider-agnostic internal `app_user_id` / member principal as the long-term canonical identity for business data.
- External provider identifiers:
  - `clerk_user_id` is an auth-provider linkage, not the canonical business identifier.
  - any legacy `supabase auth.users.id` still referenced by existing data becomes a compatibility alias during migration, not the long-term primary identity.
- Human-readable identifiers:
  - email is mutable recovery/contact input,
  - device/passkey labels are editable display values only,
  - subscription product names/labels are operator-facing only.
- Mutability rules:
  - canonical internal account id is immutable,
  - provider linkage rows are write-once then revoke/replace, not repurposed silently,
  - device labels are renameable in place.
- Rename vs repurpose policy:
  - rename device label in place,
  - add a new credential/device as a new linked authenticator,
  - do not recycle or overwrite one credential identity to represent another.
- Compatibility contract:
  - active paid members must be able to complete sign-in through either migrated passkey flow or email-code fallback during rollout,
  - no entitlement row may become unreadable because a provider id changed,
  - legacy account lookups must remain repairable during migration.
- Observability and repair:
  - unresolved identity links, duplicate linkage attempts, stale aliases, and entitlement mismatches must be logged with redacted diagnostics and support playbooks.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode applies:

- every scorecard category in this brief is a `target`,
- every target category must close at `5/5` before the rollout may claim 10/10 readiness.

Critical target categories for `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Admin workflow and editability
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping  | Target Threshold                                                                                                                                                | Evidence                                                          |
| --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Product goals and IA                          | `target` | Member-only passkey rollout has clear route purpose: bootstrap, sign-in, setup, recovery, and account management each have one unambiguous job.                 | IA map + route inventory + rollout doc                            |
| UX flow clarity                               | `target` | Paying members always see one clear next action on supported, unsupported, new-device, and lost-device states, with honest fallback to email code.              | flow specs + e2e matrix + manual device QA                        |
| Visual design quality                         | `target` | Clerk-integrated auth surfaces match freeswimming trust cues, spacing, and hierarchy with no third-party seams or misleading state affordances.                 | visual QA + screenshots + design review                           |
| Business logic correctness and data integrity | `target` | Identity linking, entitlement mapping, fallback sign-in, and passkey management are deterministic and never orphan or duplicate paying-member access.           | invariant tests + migration checks + runtime guards               |
| Admin editor ergonomics                       | `target` | Admin/support operators can inspect member auth status, recovery state, and entitlement linkage with low-friction diagnostics and explicit safe actions.        | operator workflow review + support runbook                        |
| Accessibility (a11y)                          | `target` | Bootstrap, passkey prompt, fallback email code, and account-security management remain keyboard, focus, label, and screen-reader clean across supported matrix. | automated a11y + manual keyboard/screen-reader QA                 |
| Performance (CWV + payloads)                  | `target` | `/auth/sign-in`, `/my-library/security`, and paying-member entry routes stay within defined speed budgets despite provider integration.                         | perf budgets + bundle diff + preview measurements                 |
| Data placement and sync boundaries            | `target` | Internal member identity, provider linkage, entitlements, and credential-management boundaries are explicit and enforced.                                       | data contract + code review + tests                               |
| Caching and invalidation strategy             | `target` | Sign-in, entitlement, and security-state changes invalidate immediately with no stale member-access decisions.                                                  | route cache contract + invalidation tests                         |
| Reliability and failure handling              | `target` | Provider outage, lost device, unsupported browser, revoked credential, stale linkage, and recovery failures degrade safely without blocking paying members.     | failure-mode matrix + negative-path tests + drills                |
| Security and authz                            | `target` | Only paying members with valid entitlement gain migrated access, passkey/fallback flows fail closed, and admin/security actions require explicit authorization. | threat model + negative-path tests + audit review                 |
| Privacy and compliance                        | `target` | The rollout stores only necessary provider/account metadata, redacts logs, and documents retention/support handling clearly.                                    | privacy data map + logging tests + runbook                        |
| Content governance                            | `target` | Auth/help/runbook content becomes source-of-truth for the new member rollout, with explicit ownership and update rules.                                         | doc inventory + ownership map                                     |
| Admin workflow and editability                | `target` | Support/admin flows for recovery, revoke, re-link, and entitlement mismatch handling are explicit, safe, and fast enough for real operations.                   | admin flow QA + runbook + support checklist                       |
| SEO and crawlability                          | `target` | Member-auth rollout does not accidentally index protected routes or damage public metadata/canonical behavior.                                                  | metadata tests + robots/sitemap checks                            |
| AI discoverability                            | `target` | Public AI-discoverable surfaces keep stable semantics and do not expose protected member auth routes as crawlable/public content.                               | route review + metadata contract                                  |
| Analytics and KPI observability               | `target` | The rollout emits safe, useful events for bootstrap, passkey adoption, fallback use, failure modes, recovery, and entitlement issues.                           | analytics taxonomy + event tests                                  |
| Commerce and revenue ops                      | `target` | Subscription/entitlement access continues to work through migration, and paying members are never silently locked out by provider change.                       | entitlement regression tests + migration rehearsal                |
| Incident response and support operations      | `target` | Support can diagnose member login failures, device loss, provider outages, and migration issues quickly through updated runbooks and operator tools.            | runbooks + incident checklist + support drills                    |
| Finance and reporting operations              | `target` | Auth migration preserves reconciliation visibility for who should have member access, which users were migrated, and which access failures affect paid users.   | reporting checklist + entitlement reconciliation plan             |
| i18n operational readiness                    | `target` | Auth and recovery copy stay locale-extensible and avoid Apple-only or vendor-specific language that blocks future translation.                                  | string inventory + copy review                                    |
| Stack-fit and dependency discipline           | `target` | Clerk integration uses stack-native Next.js patterns, keeps dependency growth intentional, and avoids a second custom auth system hidden beside it.             | architecture review + dependency diff + implementation guardrails |
| Testing and QA automation                     | `target` | Unit, integration, e2e, device-matrix, and negative-path coverage prove the paying-member rollout and keep `verify:pre-pr`/`verify:pre-merge` green.            | test plan + gate logs + CI suite                                  |
| Scalability and cost efficiency               | `target` | Paying-members-first rollout stays well within forecast provider cost and support load while leaving room for later growth.                                     | pricing assumptions + member growth model + support estimate      |
| DevOps and rollback readiness                 | `target` | The rollout includes feature gating, migration checkpoints, kill switch, rollback path, and coexistence with current email-code flow.                           | rollout plan + rollback drills + release checklist                |

## Acceptance Criteria

- A separate planned brief exists for Clerk-based passkeys for paying members first and remains scorecard-complete at strict 10/10 level.
- The brief defines Clerk as the concrete preferred provider path for real passkeys later.
- The brief defines a paying-members-first rollout rather than full public auth replacement on day one.
- The brief preserves `email code` as bootstrap and fallback during phased rollout.
- The brief defines identity, entitlement, migration, recovery, admin-support, and rollback contracts clearly enough that later implementation can start without reopening the architecture question.
- The brief treats every scorecard category as `target`, including finance/reporting, support operations, and i18n readiness.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all` or equivalent full-brief validation while this planned brief is still untracked
- before implementation begins:
  - rerun production admin-note triage,
  - produce a Clerk-vs-current-stack migration checklist,
  - produce a threat model and recovery matrix,
  - produce an entitlement-linking migration rehearsal plan,
  - move this brief to `in-progress` only after the decision brief remains accepted.

## Constraints

- Keep the first rollout scoped to paying subscribers / members.
- Keep `email code` fallback live until passkeys prove stable across real devices and support load is acceptable.
- Do not allow provider migration to redefine the canonical business identity as a vendor-specific identifier.
- Do not weaken admin/site-lock safety in the first paying-member rollout.
- Do not ship Clerk passkeys without clear cost assumptions, support runbooks, and entitlement-reconciliation tooling.

## 10/10 Quality Bar

- Paying members should feel that login got easier, not riskier.
- A user who loses a device should still recover safely without support panic.
- Support/admin operators should be able to explain exactly what happened in any auth failure.
- Entitlement access should survive provider migration cleanly.
- The rollout should be reversible at any stage without stranding paid members.
- Vendor integration should feel native to freeswimming.org, not bolted on.

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Docs-only validation should run from the repo root:
  - `npm run lint:briefs:all` while this brief is still untracked,
  - `npm run lint:briefs` after the brief is committed and tracked.

## Manual QA Environments

- Current docs-only refinement:
  - no live-product QA is required because this planned brief does not change runtime behavior yet.
- Future implementation baseline:
  - `http://127.0.0.1:3000/auth/sign-in`
  - `http://127.0.0.1:3000/my-library/security`
  - member entry routes affected by entitlement gating
  - PR preview URL after branch push
- Recommended future matrix before rollout:
  - iPhone Safari
  - Android Chromium
  - desktop Chromium
  - desktop Safari/WebKit

## Help/Guide And Operator Training Contract

- Current docs-only refinement:
  - no live Help/Guide changes are required in this commit because the product contract is unchanged.
- Before implementation moves to `in-progress`:
  - update member-auth Help/Guide, support runbooks, entitlement-recovery guidance, and rollback notes in the same PR,
  - document paying-member migration rules and email-code fallback expectations clearly,
  - add at least one automated assertion that validates the updated help contract once implementation exists.

## Security, Privacy, and Compliance

- Clerk rollout must remain fail-closed for entitlement access, credential management, recovery, and any admin/support override.
- freeswimming.org must never store private keys, raw biometric data, or unredacted provider secrets/tokens in repo or logs.
- Exact hostname/protocol validation is required for any callback, origin, redirect, or allowlist logic.
- Support tooling must expose enough redacted diagnostics to repair identity-linking problems without leaking sensitive auth payloads.

## Observability And KPI Contract

- Required future events/logs:
  - Clerk bootstrap completed/abandoned,
  - passkey enrollment succeeded/failed,
  - email-code fallback used,
  - entitlement mismatch detected/resolved,
  - recovery path started/completed/blocked,
  - provider outage or migration rollback invoked.
- Success KPI for this planned rollout:
  - paying members can adopt passkeys without access loss, and support can resolve migration or recovery failures deterministically.

## Session Continuity And Recovery

- Canonical source of truth: git branch + this brief path.
- Checkpoint cadence:
  - update the checkpoint log at each meaningful planning or implementation milestone,
  - record the latest validated commit hash once code-bearing rollout work starts.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated migration/rollout slice.
- Open/update PR after one coherent rollout slice or after `2-4` validated checkpoint commits, whichever comes first.

## Automation Mode

- `automation-first`
  - assistant handles implementation, tests, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or an explicit owner decision.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- When future auth/member QA URLs are part of implementation, open them in Safari before requesting owner confirmation.

## Checkpoint Log

- `2026-03-30 | working tree | refined the planned Clerk rollout brief to make dependency boundaries, future operator-doc obligations, and repo-standard execution defaults explicit before any migration work begins | next: keep this planned until the decision brief remains accepted and a member rollout window is chosen`
- `2026-03-30 | working tree | created planned strict-10/10 Clerk migration brief for real passkeys later, scoped to paying subscribers / members first with email-code fallback, entitlement safety, and rollback-first rollout rules | next: keep this planned until the passkey decision brief is explicitly accepted and a future implementation window is chosen`
