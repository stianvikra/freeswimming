# Task Brief: Preview Access Copy Truthfulness Follow-Up (10/10)

## Metadata

- `id`: `2026-03-31-preview-access-copy-truthfulness-followup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-31`
- `updated`: `2026-03-31`

## Goal

Make `/preview-access` fully reflect the live contract in calm, present-tense language: admin sign-in first, then shared preview password, with no future-looking passkey or device-unlock emphasis on the route itself.

## Why This Brief Exists

- The broader auth truthfulness cleanup is already merged, but `/preview-access` still contains a few phrases that frame the current password flow as a temporary fallback to a future device-based path.
- That wording is no longer the best UX for the locked-site entry surface:
  - it adds roadmap noise where the user mainly needs one clear next step,
  - it subtly reintroduces the idea that a stronger unlock exists somewhere today when it does not,
  - it weakens the simplicity of the current admin unlock contract.
- Real passkeys remain a separate planned architecture and rollout decision:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-30-real-passkeys-architecture-decision-and-rollout-gate-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-30-clerk-passkeys-paying-members-first-10-10.md`
- This brief intentionally keeps scope small and does not reopen real-passkeys implementation work.

## Dependencies And Boundaries

- Current truthful auth baseline remains authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-30-passkey-first-sign-in-and-admin-site-lock-unlock-10-10.md`
- In-scope implementation files:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
  - `/Users/stianvikra/freeswimming/components/auth/AdminPreviewUnlockCard.tsx`
  - related targeted tests for the preview-access UI contract.
- This slice owns:
  - route copy hierarchy on `/preview-access`,
  - admin unlock card messaging,
  - test assertions that protect the truthful current unlock copy.
- This slice does not own:
  - real passkeys,
  - Account & Security page copy outside `/preview-access`,
  - site-lock backend behavior,
  - admin-notes ergonomics follow-up work.

## Admin Notes Triage Disposition

- No open admin note is needed to own this copy-only follow-up.
- The planned admin-notes follow-up remains separate and unchanged:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-27-admin-notes-ergonomics-multi-image-and-route-surface-followup-10-10.md`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                | Evidence                                        |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Product goals and IA                          | `target`     | `/preview-access` explains the live unlock contract in one scan: admin sign-in first, shared preview password second, with no misleading stronger-factor cue. | copy review + route QA + unit/e2e assertions    |
| UX flow clarity                               | `target`     | The locked-route page presents one obvious next step for admins and one obvious password entry path without roadmap detours or false future-state emphasis.   | unit tests + manual QA + targeted e2e           |
| Visual design quality                         | `target`     | Copy hierarchy stays calm and trustworthy, and the password section reads as the normal current path instead of a degraded fallback.                          | screenshot review + route QA                    |
| Business logic correctness and data integrity | `target`     | UI text matches actual runtime behavior exactly and never implies a sign-in or unlock capability that the current stack cannot perform.                       | code review + targeted tests                    |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches preview unlock guidance only, not admin content editing or publishing workflows.                                               | explicit scope rationale                        |
| Accessibility (a11y)                          | `supporting` | Supporting only: wording changes must preserve existing labels, form semantics, and readable status hierarchy on the route.                                   | existing semantics + targeted route QA          |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: copy cleanup must not add new client logic or meaningful payload/render cost.                                                                | diff review                                     |
| Data placement and sync boundaries            | `target`     | Server-canonical unlock state stays unchanged; this slice only clarifies local presentation of that state.                                                    | brief contract + code review                    |
| Caching and invalidation strategy             | `supporting` | Supporting only: `/preview-access` remains dynamic and reflects current auth/site-lock state with no cache-policy changes.                                    | route review                                    |
| Reliability and failure handling              | `target`     | Error and locked states remain explicit and deterministic, and the route still guides admins correctly when sign-in or password validation has not happened.  | targeted tests + manual QA                      |
| Security and authz                            | `target`     | Copy changes do not broaden access and continue to fail closed by describing admin eligibility plus shared-password unlock truthfully.                        | code review + existing protected-route coverage |
| Privacy and compliance                        | `supporting` | Supporting only: the route continues not to expose secrets, credential internals, or misleading sensitive-state messaging.                                    | code review                                     |
| Content governance                            | `supporting` | Supporting only: the done auth brief remains the source of truth, and this follow-up keeps route copy aligned to it.                                          | brief alignment review                          |
| Admin workflow and editability                | `supporting` | Supporting only: signed-in admins should understand the unlock order immediately, but no broader admin workflow is changed.                                   | route QA                                        |
| SEO and crawlability                          | `supporting` | Supporting only: `/preview-access` remains private/noindex and this copy cleanup does not alter metadata or crawler behavior.                                 | existing metadata contract                      |
| AI discoverability                            | `N/A`        | N/A because this slice only changes a private locked-route surface and introduces no public AI-facing discoverability change.                                 | explicit scope rationale                        |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics contract change is required as long as the UI contract remains truthful and no new events are introduced.                       | scope rationale + code review                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, entitlements, or paid-access logic changes in this preview-access copy cleanup.                                                       | explicit scope rationale                        |
| Incident response and support operations      | `N/A`        | N/A because unlock behavior and operator recovery steps do not change; this slice only removes misleading future-looking emphasis from the UI copy.           | explicit scope rationale                        |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect finance reporting, reconciliation, payouts, or entitlement accounting.                                                 | explicit scope rationale                        |
| i18n operational readiness                    | `N/A`        | N/A because this copy-only cleanup stays on one private English-language route and does not change the app's localization model or routing shape.             | explicit scope rationale                        |
| Stack-fit and dependency discipline           | `target`     | The slice reuses existing route/component structure with no new dependencies or auth-stack changes.                                                           | dependency diff + code review                   |
| Testing and QA automation                     | `target`     | Targeted test coverage protects the truthful preview-access copy and confirms no passkey/device-unlock affordance reappears on the locked route.              | unit + targeted e2e + `npm run lint:briefs`     |
| Scalability and cost efficiency               | `supporting` | Supporting only: copy cleanup introduces no new runtime, storage, or support-cost pattern.                                                                    | diff review                                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice is low-risk, copy-only, and trivially reversible without data or runtime migration.                                                | git diff review                                 |

## Data Placement And Sync Contract

- Server-canonical:
  - admin session state,
  - admin-role eligibility,
  - preview-password validation,
  - site-lock session token issuance.
- Local-only:
  - the copy hierarchy and explanatory text shown on `/preview-access`.
- Sync policy:
  - no server writes or sync semantics change,
  - route text must reflect current server-confirmed behavior only.
- Retention and sensitivity:
  - no new sensitive data is stored,
  - this slice must not expose plain preview passwords or internal auth details in copy.
- Cache/invalidation:
  - `/preview-access` remains dynamic and should still reflect current auth and site-lock state on reload.

## Identity And Rename Contract

- N/A because this slice does not create or rename persisted/linkable domain entities; it only updates route copy and labels around an existing lock/unlock flow.

## Scope

- Remove or de-emphasize future-looking `device-based`, `passkey`, and `deferred` language from the `/preview-access` UI.
- Reframe the password section as the live current path, not a fallback waiting for a stronger factor.
- Keep the truthful two-step contract explicit:
  - admin sign-in first,
  - shared preview password second.
- Update targeted tests to protect the new copy contract.

## Out Of Scope

- Implementing passkeys or device-native unlock.
- Changing preview-password validation logic or admin-role checks.
- Broad auth copy cleanup outside `/preview-access`.
- Admin-notes follow-up implementation.

## Acceptance Criteria

1. `/preview-access` no longer describes the shared password flow as a temporary fallback to device-based admin unlock.
2. The admin unlock card makes the current two-step flow obvious without mentioning unavailable passkey/device paths.
3. The password section heading/body read as the normal current unlock method.
4. Targeted tests are updated to guard the truthful preview-access contract.
5. `npm run lint:briefs` and targeted tests for changed scope pass.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/admin-preview-unlock-card.test.tsx`
- `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD="<password>" npx playwright test tests/e2e/private-access-gate.spec.ts --project=desktop-chromium`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/preview-access?next=%2F`
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - iPhone Safari-width viewport
  - desktop Chromium

## Constraints

- Keep the slice minimal and route-scoped.
- Preserve the existing visual language and unlock behavior.
- Do not introduce roadmap copy that suggests real passkeys are one hidden toggle away.

## 10/10 Quality Bar

- The route should feel calmer and more trustworthy in one scan.
- The primary next step for admins should be explicit without extra explanation burden.
- Required changed states remain clear:
  - locked state,
  - signed-out admin,
  - signed-in non-admin,
  - signed-in admin,
  - invalid password error.
- Accessibility semantics for the existing form and status copy must remain intact.
- Business logic truthfulness must be exact: no copy may imply a capability that does not exist today.

## Help/Guide And Operator Training Contract

- `N/A` because the unlock workflow, runbook steps, and recovery contract do not change; this slice only removes misleading future-looking emphasis from the route copy.

## Security, Privacy, and Compliance

- The route must continue to fail closed for non-admin or unauthenticated visitors.
- No secret value may appear in copy, tests, logs, or repository files.
- Copy must not imply a stronger-factor path that could mislead operators into unsafe assumptions.

## Observability and KPI Contract

- No new instrumentation is required.
- Existing auth/site-lock diagnostics remain sufficient because runtime behavior is unchanged.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch,
  - this brief path.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit after validation for this isolated slice.
- Push and open/update PR after the slice is verified locally.

## Automation Mode

- `automation-first`

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Default UI QA link for this slice:
  - `/preview-access?next=%2F`

## Checkpoint Log

- `2026-03-31 | working tree | created a dedicated preview-access copy follow-up brief so the locked-route cleanup can land separately from the planned real-passkeys architecture and admin-notes follow-up work | next: move brief to in-progress, update preview-access copy, and rerun targeted tests`
- `2026-03-31 | working tree | removed future-looking fallback/device-unlock emphasis from /preview-access, updated route/card assertions, and validated the live contract with brief lint, targeted vitest, password-backed private-gate Playwright, and a full pre-PR gate rerun on isolated Playwright port 3102 after an existing long-running local dev server occupied port 3100; cleaned temporary verify artifacts and restored tsconfig after Next added temporary dist-type includes | validation: npm run lint:briefs:all; npx vitest run tests/unit/admin-preview-unlock-card.test.tsx; password-backed npx playwright test tests/e2e/private-access-gate.spec.ts --project=desktop-chromium; PW_PORT=3102 NEXT_DIST_DIR=.next-playwright-verify-prepr PW_OUTPUT_DIR=/tmp/freeswimming-playwright-results-verify-prepr npm run verify:pre-pr | next: commit, push, and open the PR for review`
- `2026-03-31 | d39d888 (main) | merged via PR #328 after local password-backed private-gate coverage, local npm run verify:pre-pr, a clean local SITE_LOCK_ENABLED=1 PW_PORT=3104 npm run verify:pre-merge PASS, and all required GitHub checks green; achieved critical target categories Product goals and IA 5/5, UX flow clarity 5/5, Business logic correctness and data integrity 5/5, and Testing and QA automation 5/5, with supporting target categories also holding 5/5 for this slice | next: keep real passkeys deferred to the planned architecture briefs and take the admin-notes ergonomics follow-up as the next scoped production slice`
