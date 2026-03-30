# Task Brief: Real Passkeys Architecture Decision And Rollout Gate (10/10)

## Metadata

- `id`: `2026-03-30-real-passkeys-architecture-decision-and-rollout-gate-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-30`
- `updated`: `2026-03-30`

## Goal

Choose a production-safe path for real passkeys on freeswimming.org, with explicit go/no-go criteria, recovery rules, and rollout gates strong enough that a later implementation can truthfully claim 10/10.

## Why This Brief Exists

- The current hosted Supabase-auth path does not deliver the real passkey/WebAuthn user flow we originally aimed for.
- The product now truthfully says `email code today`, but passkeys remain a real product goal for later.
- Auth is high-stakes scope, so the next step cannot be "try another UI polish"; it must be an architecture decision with explicit security, recovery, and rollback rules.
- This brief exists to prevent a risky half-custom auth layer from slipping into production without a clear relying-party contract, recovery model, and operator plan.

## Security Risk Position

- Building "real passkeys" ourselves is possible, but it is security-critical scope, not a normal feature.
- A future self-built path is only acceptable if freeswimming.org uses a maintained FIDO/WebAuthn server-side library and keeps custom code limited to orchestration, storage, recovery, UX, and policy decisions.
- A future self-built path is not acceptable if freeswimming.org hand-rolls low-level WebAuthn verification, challenge handling, origin / RP ID validation, or cryptographic parsing by itself.
- Account recovery, fallback sign-in, credential revocation, admin step-up, and support tooling must be designed together with passkey login; a "secure primary path + weak recovery path" is not acceptable.

## Current Decision Recommendation

- Recommended now:
  - keep `email code` as the live user sign-in method now,
  - let the current auth-cleanup stand as the truthful contract,
  - use this brief to lock the future direction before new auth implementation starts,
  - prefer `Clerk` if freeswimming.org decides to ship real passkeys as the next serious auth slice,
  - start passkeys with paying subscribers / members first to keep scope, migration risk, and support load controlled,
  - preserve `email code` fallback during phased rollout until passkeys are proven reliable on real devices.
  - if the recommended path is chosen, hand off implementation planning to `docs/task-briefs/planned/2026-03-30-clerk-passkeys-paying-members-first-10-10.md`.
- Secondary recommendation:
  - consider `TOTP` only for stronger admin/security needs in the current stack while real passkeys stay deferred.
- Do not start a "quick custom WebAuthn" implementation from product momentum alone.
- A custom WebAuthn path may proceed only if this brief's strict 10/10 gates are fully satisfied and the later implementation brief preserves email-code fallback during rollout.

## Current Vendor Shortlist

- First candidate: `Clerk`
  - reason: best current balance of security, speed, and lower implementation risk for freeswimming.org.
  - reason: strong Next.js/App Router fit.
  - reason: passkeys are already a first-class product feature instead of something we would need to force through the current stack.
  - reason: cost remains small relative to plausible subscription revenue if rollout starts with paying members only.
  - recommendation: treat Clerk as the default future path unless the comparison work finds a concrete blocker.
- Second candidate: `WorkOS AuthKit`
  - reason: first-class passkeys with low protocol burden, but passkeys are currently tied to hosted AuthKit UI and WorkOS recommends a custom domain before production rollout.
  - role: keep as the main fallback if Clerk shows a product-fit or pricing blocker.
- Third candidate: `Stytch`
  - reason: strong passkey/auth primitives and pricing flexibility, but more of the auth UX/orchestration burden stays with freeswimming.org than with Clerk.
  - role: reserve for a deliberate "more API control, more implementation ownership" choice.
- De-prioritized candidate: `Auth0`
  - reason: credible passkey support, but likely more product/ops complexity than needed for the current freeswimming.org shape unless broader enterprise identity needs emerge.
- Short-term recommendation for this brief:
  - compare `Clerk` vs `WorkOS` first,
  - keep `Stytch` as the API-heavy fallback only if freeswimming.org intentionally wants more custom auth control,
  - do not start a custom WebAuthn build unless the provider-native options are explicitly rejected for documented reasons,
  - if no blocker is found, select `Clerk` and scope the first rollout to paying subscribers / members only.

## Pricing And Rollout Assumption

- Current planning assumption:
  - a first real passkey rollout should target paying subscribers / members only, not the full anonymous/public surface.
- Why:
  - it keeps migration smaller,
  - it reduces support and recovery risk,
  - it limits auth-provider cost exposure while the flow is still new,
  - it lets freeswimming.org validate passkey reliability where the business value is highest.
- Current preferred pricing interpretation for planning:
  - `Clerk Pro` is a realistic baseline cost for future passkey rollout,
  - the included monthly usage is large relative to the likely early paid-member population,
  - auth-provider cost is therefore not the primary blocker at the current product stage.
- Implementation brief requirement later:
  - record the exact chosen plan, monthly cost assumptions, included-user interpretation, and overage model before rollout starts.

## Admin Notes Triage Disposition

- This is a planned decision brief, not a new implementation slice.
- It inherits the same-day auth/security production-note review already recorded in [2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md): no open production admin note was found to directly own passkey, WebAuthn, sign-in, or site-lock auth scope at that review time.
- Before any implementation starts under this planned brief, production admin-note triage must be rerun against the live queue and recorded explicitly in the implementation brief.

## Dependencies And Boundaries

- Current truthful auth copy and live UX baseline were established by [2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md).
- This brief owns:
  - architecture comparison,
  - security/recovery/rollback decision criteria,
  - provider recommendation and rejection rationale,
  - implementation-entry gates for any future passkey work.
- This brief does not own:
  - shipping new auth UI,
  - migrating user accounts,
  - changing live entitlements,
  - replacing the current email-code path before a separate implementation brief is accepted.
- If `Clerk` remains the chosen provider, the future rollout/migration work passes to [2026-03-30-clerk-passkeys-paying-members-first-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-30-clerk-passkeys-paying-members-first-10-10.md).
- If the recommendation changes away from `Clerk`, create or update a separate provider-specific implementation brief before starting code changes.

## Scope

- Evaluate and compare at least these architecture paths:
  - keep current email-code path + optional TOTP for stronger auth and defer passkeys,
  - adopt an auth/provider path with first-class passkey support,
  - build a custom WebAuthn relying-party layer around the current account system.
- Define the recommended path with explicit rejection rationale for the non-chosen options.
- Define the end-to-end auth contract for:
  - first-time account bootstrap,
  - returning passkey sign-in,
  - adding a passkey after email bootstrap,
  - lost-device / new-device recovery,
  - unsupported browser/device fallback,
  - admin-sensitive reauthentication / step-up,
  - passkey removal and device management.
- Define the future data model and security model:
  - credential metadata,
  - challenge lifecycle,
  - audit trail,
  - recovery factors,
  - admin unlock policy,
  - analytics/support diagnostics.
- Define rollout, migration, and rollback gates for a future implementation brief.

## Out Of Scope

- Shipping real passkeys in production from this brief alone.
- Replacing the entire user/account model in this brief.
- Native-app auth work.
- Non-auth redesign of My Library, Athlete Profile, or site-lock IA.
- Changing pricing, entitlement, or subscription policy.

## Data Placement And Sync Contract

- Server-canonical:
  - account identity,
  - passkey credential metadata,
  - challenge issuance and consumption,
  - recovery-factor state,
  - admin step-up policy,
  - audit log entries for enroll, verify, revoke, and recovery actions.
- Local-only:
  - transient browser capability checks,
  - non-sensitive UX state such as remembered email hint or "try another way" expansion,
  - optional device nickname draft before save.
- Sync behavior:
  - every registration/authentication ceremony uses a one-time server-issued challenge with short TTL,
  - credential changes are only canonical after server verification succeeds,
  - device removal/revocation invalidates future use immediately on the server,
  - unsupported-device hints must never be treated as canonical auth state.
- Retention and sensitivity:
  - private keys and raw biometric material are never stored by freeswimming.org,
  - only public-key credential data and needed verification metadata are retained,
  - attestation data stays minimized unless explicitly required by the chosen trust model,
  - logs and analytics must redact challenge/credential payloads.
- Cache / invalidation:
  - sign-in, account-security, and admin-step-up surfaces stay dynamic,
  - credential add/remove/rename actions invalidate security pages immediately,
  - recovery-factor changes invalidate stale settings views and support dashboards.

## Identity And Rename Contract

- Canonical stable ID:
  - the account principal remains the stable user identifier (`auth.users.id` or an explicitly chosen replacement if architecture changes).
- Human-readable identifiers:
  - user email is presentation and recovery input, not the credential identifier,
  - passkey device labels are editable display labels only,
  - credential IDs are opaque protocol identifiers and never user-facing slugs.
- Mutability rules:
  - account principal id is immutable,
  - credential ID is immutable once issued,
  - device nickname is renameable in place,
  - recovery method labels are editable copy, not security truth.
- Rename vs repurpose policy:
  - a device rename edits metadata in place,
  - a materially different credential requires a new credential row, not reuse of an old ID,
  - a recovered account must not silently "take over" an old credential record without explicit revocation/audit trail.
- Compatibility contract:
  - email-code bootstrap remains available until the new passkey path proves safe enough to become optional or secondary,
  - future passkey rollout must preserve a documented fallback and support path,
  - admin-sensitive unlock must retain a stronger-verification path even if primary user login becomes passkey-first.
- Observability and repair:
  - unresolved credential reads, stale credential IDs, recovery resets, and suspicious step-up failures must be logged with redacted, support-usable diagnostics.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode applies to this brief:

- every scorecard category in this brief is treated as `target`,
- every target category must close at `5/5` before this decision brief is considered complete enough to authorize implementation.

Critical target categories for `10/10` claim in this brief:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Security and authz
- Admin workflow and editability
- Analytics and KPI observability
- Commerce and revenue ops
- Reliability and failure handling
- Privacy and compliance
- Incident response and support operations
- i18n operational readiness
- Testing and QA automation
- Stack-fit and dependency discipline
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping  | Target Threshold                                                                                                                                                        | Evidence                                                          |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Product goals and IA                          | `target` | The chosen architecture defines one coherent user/system model for bootstrap, sign-in, recovery, account settings, and admin step-up with no ambiguous route purpose.   | decision memo + route map + future IA contract                    |
| UX flow clarity                               | `target` | The recommendation includes explicit primary/fallback flows for supported, unsupported, lost-device, and "try another way" states with no dead-end state.               | flow diagrams + recovery matrix + manual scenario review          |
| Visual design quality                         | `target` | The decision includes a security-UX contract that avoids misleading passkey affordances, overclaims, and confusing fallback hierarchy across device classes.            | design contract + annotated wireframe/state inventory             |
| Business logic correctness and data integrity | `target` | Registration, authentication, revocation, recovery, and admin step-up invariants are explicit, deterministic, and reject ambiguous account-linking outcomes.            | state model + sequence diagrams + invariant checklist             |
| Admin editor ergonomics                       | `target` | Admin and support operators can add/remove/revoke credentials, guide recovery, and handle step-up incidents with low-friction flows and explicit confirmations.         | operator workflow inventory + support-flow review                 |
| Accessibility (a11y)                          | `target` | Chosen flows preserve keyboard, focus, labels, and screen-reader clarity for passkey, fallback, recovery, and admin reauth surfaces.                                    | a11y acceptance checklist + future test plan                      |
| Performance (CWV + payloads)                  | `target` | Recommended architecture sets route budgets for `/auth/sign-in`, `/my-library/security`, and `/preview-access` with no heavy auth JS bundle regression.                 | route budget table + architecture comparison                      |
| Data placement and sync boundaries            | `target` | Server/local ownership, challenge TTL, revocation timing, rename behavior, and stale-view invalidation rules are explicit and testable.                                 | data contract + invalidation plan                                 |
| Caching and invalidation strategy             | `target` | Security surfaces define dynamic-read policy and deterministic invalidation triggers after sign-in, credential changes, recovery changes, and admin unlock.             | cache contract + route config plan                                |
| Reliability and failure handling              | `target` | The decision covers unsupported browsers, provider outages, lost devices, replay attempts, stale challenges, and recovery failure without unsafe fallback.              | failure-mode matrix + incident scenarios                          |
| Security and authz                            | `target` | The chosen path verifies challenge, origin, RP ID, signature, UV/UP policy, step-up boundaries, and admin-only actions fail closed across all negative paths.           | threat model + library/provider assessment + negative-path matrix |
| Privacy and compliance                        | `target` | The decision minimizes retained credential data, avoids biometric/raw private-key storage, and defines recovery/support logging with redaction rules.                   | privacy data map + logging contract                               |
| Content governance                            | `target` | Auth documentation, runbooks, and support guidance become explicit source-of-truth for chosen flows, ownership, and rollback policy before implementation starts.       | brief contract + runbook ownership plan                           |
| Admin workflow and editability                | `target` | Admin unlock, support recovery, credential revocation, and account-help workflows have explicit operator UX and safe confirmation/recovery rules.                       | operator runbook + admin flow inventory                           |
| SEO and crawlability                          | `target` | The recommendation preserves correct auth/private route metadata, noindex behavior, and crawl-safe public semantics during phased rollout and fallback states.          | metadata contract + rollout review                                |
| AI discoverability                            | `target` | The recommendation keeps public/private route semantics and structured public identity pages stable enough that future auth changes do not damage AI visibility.        | route semantics review + architecture memo                        |
| Analytics and KPI observability               | `target` | The decision defines required events and support diagnostics for enroll success/failure, auth success/failure, fallback use, recovery, and admin step-up.               | event taxonomy + KPI checklist                                    |
| Commerce and revenue ops                      | `target` | The chosen auth path must preserve entitlement access and not strand paying users behind a broken migration or unsupported-device path.                                 | entitlement-risk assessment + rollback/fallback plan              |
| Incident response and support operations      | `target` | The decision includes runbooks for passkey failures, lost-device recovery, provider/library incidents, suspicious auth events, and rollback triggers.                   | runbook plan + support escalation matrix                          |
| Finance and reporting operations              | `target` | The decision records how auth migration affects entitlement reporting, support reconciliation, and incident accounting so finance-facing errors are diagnosable.        | reporting-impact note + reconciliation checklist                  |
| i18n operational readiness                    | `target` | The decision avoids auth copy, device labels, and fallback rules that block future locale expansion or hardcode Apple-only language.                                    | copy contract + string inventory plan                             |
| Stack-fit and dependency discipline           | `target` | The recommendation must justify provider-native vs custom WebAuthn using clear stack-fit, maintenance, and security tradeoffs; raw protocol hand-rolling is disallowed. | architecture comparison + dependency decision memo                |
| Testing and QA automation                     | `target` | The decision defines the future unit/e2e/device/security matrix needed before rollout, including negative-path and recovery coverage.                                   | test plan + matrix + gate requirements                            |
| Scalability and cost efficiency               | `target` | The chosen path has sustainable per-auth cost, operational load, and support burden for consumer-scale sign-in and device growth.                                       | cost model + support load estimate                                |
| DevOps and rollback readiness                 | `target` | The decision defines rollout phases, migration checkpoints, kill-switch/rollback strategy, and safe coexistence with email-code fallback during migration.              | rollout plan + rollback matrix + ops checklist                    |

## Acceptance Criteria

- A separate planned brief exists for real passkeys and passes brief lint.
- Every scorecard category in this brief is treated as a 10/10 target, not a supporting afterthought.
- The brief compares at least three architecture options and records one recommended direction plus explicit rejection rationale for the others.
- The brief records a clear security position on self-built WebAuthn: allowed only with maintained server-side libraries and explicit recovery/rollback design; forbidden as raw hand-rolled protocol logic.
- The brief defines future bootstrap, returning sign-in, recovery, unsupported-device, admin-step-up, and credential-management flows.
- The brief defines future data placement, identity, audit, invalidation, and support contracts for real passkeys.
- The brief sets strict 10/10 mode for all scorecard categories so a later implementation cannot claim readiness with partial security, recovery, operations, or rollout coverage.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all` or equivalent full-brief validation when this planned brief is still untracked
- before any implementation begins from this brief:
  - rerun production admin-note triage and record disposition,
  - produce an architecture comparison memo,
  - produce a threat model and recovery matrix,
  - create a new implementation brief or move this brief to `in-progress` only after the decision gate is complete.

## Constraints

- Do not assume hosted Supabase can be toggled into the required passkey UX if official product support does not actually cover the needed flow.
- Do not hand-roll raw WebAuthn verification or custom crypto parsing in production.
- Do not remove email-code bootstrap or support fallback until the new path is proven across supported device/browser matrix.
- Do not design recovery that is weaker than the primary sign-in path.
- Do not allow admin unlock/security-sensitive actions to silently piggyback on a weaker consumer fallback.

## 10/10 Quality Bar

- The later implementation must feel simpler than email-code sign-in, not more confusing.
- Every supported device must show one honest primary action and one honest fallback.
- Lost-device recovery must be fast for real users but hard for attackers.
- Credential add/remove/rename flows must be understandable without leaking protocol detail.
- Admin-sensitive actions must have explicit fresh-verification rules and support diagnostics.
- The rollout plan must allow safe coexistence with current email-code login until passkeys have proven reliability on real devices.

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Docs-only validation should run from the repo root:
  - `npm run lint:briefs:all` while this brief is still untracked,
  - `npm run lint:briefs` after the brief is committed and tracked.

## Manual QA Environments

- Current docs-only refinement:
  - no live-product QA is required because this brief does not change shipped UI or runtime behavior.
- Future implementation planning baseline:
  - `/auth/sign-in`
  - `/my-library/security`
  - `/preview-access` if admin/security recovery or site-lock unlock behavior changes
- Recommended future matrix before rollout:
  - iPhone Safari
  - Android Chromium
  - desktop Chromium
  - desktop Safari/WebKit

## Help/Guide And Operator Training Contract

- Current docs-only refinement:
  - no live Help/Guide copy changes are required in this commit because behavior is not changing.
- Before any implementation brief moves to `in-progress`:
  - update member-auth Help/Guide, support runbooks, and incident-response guidance in the same PR,
  - document the chosen recovery/fallback path in operator-facing source-of-truth docs,
  - add at least one automated assertion that protects the updated help contract once implementation exists.

## Security, Privacy, and Compliance

- Provider-native or library-backed passkey architecture must remain fail-closed for auth, recovery, and admin-only actions.
- freeswimming.org must never store private keys, raw biometric data, or unredacted challenge/signature payloads.
- Any future allowlist logic for relying-party/origin checks must validate exact hostnames/protocols, not substring matches.
- Support and audit logs must preserve incident usefulness while redacting secrets, recovery tokens, and credential payloads.

## Observability And KPI Contract

- Required future events/logs:
  - passkey enroll started/succeeded/failed,
  - auth attempt succeeded/failed,
  - fallback path used,
  - recovery requested/completed/blocked,
  - admin step-up succeeded/failed,
  - suspicious or policy-blocked auth events.
- Success KPI for this decision brief:
  - a later implementation can start without reopening the core provider, recovery, rollback, and entitlement-risk questions.

## Session Continuity And Recovery

- Canonical source of truth: git branch + this brief path.
- Checkpoint cadence:
  - update the checkpoint log at each meaningful decision/doc milestone,
  - record the latest validated commit hash once implementation planning begins in code-bearing work.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated decision-doc batch or implementation slice.
- Open/update PR after one coherent architecture-decision batch or after `2-4` validated checkpoint commits, whichever comes first.

## Automation Mode

- `automation-first`
  - assistant handles docs updates, validation, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or an explicit owner decision.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- When future auth/security QA URLs are part of implementation, open them in Safari before requesting owner confirmation.

## Checkpoint Log

- `2026-03-30 | working tree | refined the planned decision brief to make ownership boundaries, future docs obligations, and repo-standard execution defaults explicit before any provider-specific implementation starts | next: keep this planned until the provider decision is accepted or deeper comparison work is requested`
- `2026-03-30 | working tree | created planned 10/10 decision brief for real passkeys later: compare provider-native vs custom WebAuthn vs defer, forbid raw protocol hand-rolling, and require explicit recovery/rollback gates before implementation starts | next: decide whether to pursue TOTP-only strengthening first or schedule a dedicated architecture decision slice for real passkeys`
- `2026-03-30 | working tree | tightened this planned brief to strict 10/10 across the full scorecard: all categories now carry target-level thresholds, and the current recommendation explicitly defers quick custom WebAuthn until a first-class stack or fully gated dedicated epic is chosen | next: decide whether to keep email code + optional TOTP for longer or start the deeper passkey architecture decision work`
