# Task Brief: Account Security Simplification And Auth Surface Audit (10/10)

## Metadata

- `id`: `2026-04-21-account-security-simplification-and-auth-surface-audit-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-23`

## Goal

Audit whether the current Account & Security surface provides necessary user value, then simplify or remove it without weakening auth, privacy, logout, email identity, or recovery behavior.

## Sequencing Lock

- Run before removing Account & Security entrypoints from My Swim Profile.
- Run before maintenance baseline unless explicitly deferred.
- Treat this as security/auth-adjacent work, not visual cleanup.

## Why This Brief Exists

- The current Account & Security page may not give enough value to justify a dedicated surface.
- Email identity might belong in My Swim Profile or a minimal account area instead.
- One-time-code login guidance may belong in sign-in/help copy rather than a permanent account page.
- Future Face ID/passkey work is out of scope until auth architecture supports it cleanly.

## Implementation Decision

- Remove the dedicated `Account & Security` UI and entrypoints for this live slice.
- Keep `/my-library/security` as a protected legacy route:
  - signed-out users go to `/auth/sign-in?next=/my-library`,
  - signed-in users go to `/my-library`.
- Keep current auth/account jobs in their stronger existing locations:
  - signed-in email, billing, and sign-out stay on `My Library`,
  - one-time-code recovery/spam-junk guidance stays on `/auth/sign-in`,
  - preview unlock stays on `/preview-access`.
- Do not add passkeys, Face ID, change-email, or new auth provider behavior in this slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                     | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Account/security entrypoints either map to real user jobs or are removed/moved with a documented replacement.                      | route audit and IA decision log        | `5/5`                   |
| UX flow clarity                               | `target`     | Users can still understand login identity, logout/recovery path, and one-time-code behavior without dead-end account UI.           | manual QA and Help/Guide review        | `5/5`                   |
| Visual design quality                         | `target`     | Any remaining account UI matches current My Library/builder form and action hierarchy without extra explanatory clutter.           | screenshots                            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Session state, logged-in email, logout, protected route access, and profile links behave exactly as intended after simplification. | auth tests and protected route QA      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this affects owner account/auth surfaces, not admin editing or publishing flows.                                       | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Remaining auth/account actions have clear labels, focus states, keyboard access, and no icon-only ambiguity.                       | semantic review                        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: simplification should not add auth client weight or slow protected route transitions.                             | build and route QA                     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Email/session identity remains auth-provider/server-canonical; no sensitive account data is moved to unsafe local storage.         | code review                            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Auth/session changes cannot show stale user identity or stale logged-in/logged-out state.                                          | auth transition QA                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing session, expired one-time code, logout, and protected redirect states fail closed with clear user recovery.                | negative-path tests                    | `5/5`                   |
| Security and authz                            | `target`     | No protected path becomes public, logout remains available if currently supported, and auth checks fail closed.                    | negative auth tests and route review   | `5/5`                   |
| Privacy and compliance                        | `target`     | Email identity and account details are minimized and shown only to the authenticated owner; no PII appears in logs/errors.         | privacy review                         | `5/5`                   |
| Content governance                            | `target`     | One-time-code/spam/junk guidance has a single source of truth in sign-in/help copy if page copy is removed.                        | Help/Guide/content review              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status/publish workflow changes.                                                                         | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because account/security routes are authenticated/private and should not be indexed.                                           | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content surface changes.                                                                     | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if auth/account events exist, removed route/action names must not break event assumptions.                        | event diff review                      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: simplification must not remove billing-management access if it is routed through account UI.                      | billing link audit                     | `4/5`                   |
| Incident response and support operations      | `target`     | Support can still tell a user where to find login email, logout, and one-time-code recovery guidance after simplification.         | support/help note                      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief changes auth/account surface only and does not modify billing, invoices, payouts, or reporting data.        | explicit scope rationale tied to scope | `N/A`                   |
| i18n operational readiness                    | `target`     | Remaining auth/account copy uses stable labels suitable for later translation and avoids duplicate wording across routes.          | copy inventory review                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing auth/session APIs and UI components; add no auth dependency or passkey/Face ID integration in this slice.             | dependency diff and code review        | `5/5`                   |
| Testing and QA automation                     | `target`     | Authenticated, unauthenticated, logout, expired/missing session, and protected route paths have targeted coverage.                 | unit/e2e tests and verify gates        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: fewer low-value account surfaces reduce support and maintenance overhead.                                         | IA review                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Any removed route/entrypoint has a clear rollback and no schema/migration dependency.                                              | PR plan and rollback notes             | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - auth session,
  - account email identity,
  - entitlement/billing links if present.
- Local-only:
  - transient UI state only.
- Sync policy:
  - auth state must refresh after login/logout and route transitions.
- Retention and sensitivity:
  - do not store raw auth secrets or one-time codes.
- Cache/invalidation:
  - protected routes must not render stale authenticated data after logout.

## Identity And Rename Contract

- Canonical stable ID:
  - auth provider user ID / server-side user ID, as currently implemented.
- Human-readable identifier:
  - email address is display identity, not a mutable route identifier.
- Rename policy:
  - email change is out of scope unless existing auth provider support is already implemented and tested.
- Compatibility:
  - existing account/profile routes must redirect or be removed deliberately with tests.

## Scope

- Audit Account & Security route, buttons, links, tests, and user jobs.
- Decide whether to remove, hide, or reduce Account & Security.
- Preserve necessary logout, email identity, billing access, and recovery guidance.
- Move one-time-code/spam/junk guidance to sign-in/help copy if needed.

## Out Of Scope

- Face ID/passkeys.
- Change-email implementation.
- New auth provider integration.
- Billing portal verification.
- Profile data schema changes.

## Acceptance Criteria

1. Account & Security either has a clear retained purpose or is removed/reduced with documented replacements.
2. User can still identify logged-in email if that is currently supported and useful.
3. User can still log out if logout exists today.
4. One-time-code recovery guidance remains available in the correct sign-in/help context.
5. Protected routes still fail closed.
6. No private account data leaks into public UI, logs, or errors.

## Validation

- `npm run lint:briefs`
- auth/account route tests
- protected route negative-path tests
- mobile/desktop screenshot handoff for changed surfaces
- owner approval before PR gate
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local and Vercel preview.
- Logged-in owner.
- Logged-out user.
- Expired/missing session where practical.
- Mobile and desktop.

## Design Constraints

- Follow current My Library/swim builder action hierarchy.
- No icon-only security actions unless labels remain accessible.
- Keep security copy plain and actionable.

## Help/Guide Impact

- Required if Account & Security copy is removed.
- Help/Guide must cover one-time-code email, spam/junk reminder, and recovery path if those are no longer visible in-page.
- Support/runbook replacement:
  - [auth-account-support.md](/Users/stianvikra/freeswimming/docs/runbooks/auth-account-support.md)

## Closeout

- Merged PR: `#502`
- Merge commit: `7daf9532a0eb4bac079b7394faea0219183febaa`
- Final status: done on `2026-04-23`
- Final implementation:
  - removed the low-value Account & Security entrypoints and retired the old hub components,
  - preserved `/my-library/security` as a protected legacy route,
  - kept email, billing, and sign-out on `My Library`,
  - moved support guidance to [auth-account-support.md](/Users/stianvikra/freeswimming/docs/runbooks/auth-account-support.md),
  - hardened the related poolside save-image e2e probe so the full lane stayed green.
- Final validation:
  - `npm run lint:briefs:all`: PASS on `2026-04-22`
  - targeted auth/account/security e2e checks: PASS on `2026-04-22`
  - `npx playwright test tests/e2e/poolside-save-image-export.spec.ts --project=mobile-chromium`: PASS on `2026-04-23`
  - `npm run verify:pre-merge`: PASS full lane on `2026-04-23`
  - GitHub required checks for PR `#502`: PASS before merge
  - Vercel preview private-gate smoke QA: PASS on `2026-04-23`
- Deferred note:
  - perf-budget stretch-target tightening remains deferred to the maintenance/perf-baseline workstream, not this auth/product slice.

## Final 10/10 Score Outcome

Critical target categories confirmed `5/5`:

- Business logic correctness and data integrity: `5/5`
- Reliability and failure handling: `5/5`
- Security and authz: `5/5`
- Privacy and compliance: `5/5`
- Testing and QA automation: `5/5`

Additional target categories:

- Product goals and IA: `5/5`
- UX flow clarity: `5/5`
- Visual design quality: `5/5`
- Accessibility (a11y): `5/5`
- Data placement and sync boundaries: `5/5`
- Caching and invalidation strategy: `5/5`
- Content governance: `5/5`
- Incident response and support operations: `5/5`
- i18n operational readiness: `5/5`
- Stack-fit and dependency discipline: `5/5`
- DevOps and rollback readiness: `5/5`

Remaining gaps: none inside this brief scope.

## Checkpoint Log

- `2026-04-21 | planned | created from owner finding that Account & Security may be low-value and needs a 10/10 auth/security audit before removal | next: implement or defer before maintenance baseline`
- `2026-04-22 | in-progress | moved brief to in-progress, chose to remove the low-value Account & Security surface while preserving a protected legacy redirect; account jobs now stay on My Library, auth recovery on sign-in, preview unlock on preview-access | next: run targeted auth/UI tests, screenshots, then owner approval before PR gate`
- `2026-04-22 | in-progress | implementation complete and owner-approved: removed Account & Security entrypoints, protected legacy route redirects to My Library, and support guidance now lives in docs/runbooks/auth-account-support.md; screenshots captured in output/playwright/account-security-simplification/ and approved | next: commit, push, open PR, monitor CI`
- `2026-04-22 | validation | targeted auth/security checks passed: account-security-simplification, auth-sign-in-ux, api-security-negative-paths, and isolated poolside-save-image-export flake rerun; npm run verify:pre-pr passed lint/typecheck/unit/build/perf and failed only on a confirmed isolated wide e2e navigation flake in poolside-save-image-export | next: record flake in PR risk notes and rely on CI/pre-merge for final full-lane signal`
- `2026-04-22 | perf-budget | perf gate recommended tightening one stretch target after two weekly green runs; decision: hold in this auth/product slice and defer the tighten/hold/revert decision to the maintenance/perf-baseline brief | next: include defer note in PR summary`
- `2026-04-23 | validation | hardened the unrelated poolside save-image e2e probe against transient preview navigation/context reloads; local pre-merge then exposed stale Help/Guide quick-note copy for the retired security hub plus a tab-click race in the admin help e2e | next: update Help/Guide contract, commit/push, and rerun final gates`
- `2026-04-23 | done | PR #502 merged at 7daf9532a0eb4bac079b7394faea0219183febaa after full local pre-merge, green required CI, and Vercel preview smoke QA | next: run closeout docs PR and then execute the planned route/label/support-surface impact-sweep governance brief`
