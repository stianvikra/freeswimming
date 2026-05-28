# Task Brief: AW-006 Auth Sign-In Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-28-aw-006-auth-sign-in-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-28`
- `updated`: `2026-05-28`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-auth-sign-in-token-parity`
- `execution_mode`: `in-progress; owner explicitly said execute`

## Brief Audit Record

- `last_audited`: `2026-05-28`
- `base`: `main@2de4733`
- `audit_status`: `ready`
- `decision`: Execute this as the current AW-006 PR-sized visual slice through screenshot handoff.
- `reason`: `main` is clean and synced at `2de4733`; PR `#884` and repo-managed closeout PR `#885` are merged; `npm run post-merge:preflight` was reported green with no pending closeout. A fresh queue/design/code re-audit found no active AW-006 slice selected and found `/auth/sign-in` still using older local rounded blue-card/action styling while the current My Library and recovery surfaces use newer AW-006 token/action hierarchy. The owner approved this slice by saying `godkjent` and then explicitly said `execute`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/auth/sign-in`, `AuthRequestStatus`, `AuthResendButton`, `AuthSubmitButton`, sign-in context copy, auth server actions, auth callback behavior, support/runbook requirements, screenshot handoff rules, forward compatibility rules, or verification lanes change before implementation.

## Goal

Make the `/auth/sign-in` route shell, form panel, request status placement, and submit/resend actions visually align with the current AW-006 token/action hierarchy while preserving all auth behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi gjør innloggingssiden visuelt roligere og mer lik resten av My Library.

Hvorfor det betyr noe: Dette er inngangen til private kjøp, bibliotek og admin, og en eldre innloggingsflate svekker helhetsfølelsen.

Utenfor scope: Vi endrer ikke innloggingslogikk, e-postlenker, engangskode, cooldown, redirects, Supabase/Auth, Stripe, entitlements, analytics, Help/Guide eller supportflyt.

Fremoverkompatibilitet: Nye trygge sign-in-kontekster skal arve samme side- og knappestruktur automatisk. Nye auth-metoder eller nye `source`-kontekster krever eksplisitt mapping, tester og screenshot-evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | `/auth/sign-in` remains the single sign-in route for My Library, admin identity confirmation, checkout recovery, and claim contexts with the same destinations.                  | route review + auth e2e assertions                     | `5/5`                   |
| UX flow clarity                               | `target`     | Email-link-first, one-time-code fallback, sent, cooldown, error, and resend states stay easier to scan without changing workflow meaning.                                        | screenshot handoff + focused auth tests                | `5/5`                   |
| Visual design quality                         | `target`     | Route shell, main panel, nested form panel, status placement, and submit/resend actions use AW-006 token/action language with stable mobile/desktop spacing and no text overlap. | before/after screenshots + class assertions            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to request/resend/verify server actions, callback behavior, cooldown math, `next` handling, safe source filtering, cookies, sessions, or provider payloads.           | changed-files review + existing auth tests             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, admin content, or admin mutation surface.                                                      | explicit admin-editor scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible H1 remains; labels, inputs, status region, submit/resend controls, focus rings, keyboard order, and touch targets remain accessible.                                 | Testing Library/e2e role assertions + screenshot QA    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, extra fetch, polling loop, provider call, route cache change, or meaningful JS payload growth.                                                   | dependency diff + build/pre-PR gate                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | UI state remains derived from existing URL/search params and server-action outcomes; Supabase Auth remains server/provider canonical.                                            | data contract + auth code review                       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because route dynamic behavior, auth redirects, callback freshness, cookies, and mutation invalidation remain unchanged.                                                     | cache scope rationale                                  | `N/A`                   |
| Reliability and failure handling              | `target`     | Sent, cooldown, expired cooldown, resend disabled state, and non-cooldown errors continue to render deterministically through the existing auth feedback source of truth.        | auth request status/resend tests + e2e                 | `5/5`                   |
| Security and authz                            | `target`     | UI styling must not broaden safe redirects, grant access, reveal provider diagnostics, expose codes/secrets, weaken rate limits, or alter fail-closed auth checks.               | unchanged action/API diff review + auth tests          | `5/5`                   |
| Privacy and compliance                        | `target`     | Copy and feedback must not expose raw provider errors, tokens, sign-in links, one-time codes, payment details, session cookies, or purchase ownership.                           | copy/diff review + existing privacy-safe auth coverage | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this brief, and design inventory record the approved planned slice without marking implementation active before execution.                               | docs diff + brief lint                                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, role workflow, or admin mutation changes.                                | explicit admin-workflow scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/auth/sign-in` remains a utility auth route and this slice changes no metadata, sitemap, robots, canonical URL, indexability, or structured public content.         | explicit SEO scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the auth utility route is not an AI-discovery content surface and no crawl-safe entity content, structured data, or AI-facing docs change.                           | explicit AI-discoverability scope rationale            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, logging, dashboard, KPI definition, or consent behavior changes.                                                               | analytics scope rationale                              | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: checkout/claim sign-in contexts must remain truthful, but this slice changes no Stripe, checkout, entitlement, invoice, refund, payout, or revenue behavior.    | auth/commerce context review                           | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, support diagnostic, recovery workflow, runbook procedure, or support escalation behavior.                     | explicit support-ops scope rationale                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.    | explicit finance scope rationale                       | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing auth labels and context text remain layout-safe under the token shell, without fixed-width assumptions that block later localization.                                   | mobile/desktop screenshot text-fit review              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next server route, auth components, `AuthRequestStatus`, `AuthSubmitButton`, `AuthResendButton`, Tailwind, and AW-006 CSS tokens; add no dependency.              | changed-files/dependency diff                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused assertions for token/action classes and preserve existing auth state/e2e coverage; screenshot handoff must happen before broad gates.                      | targeted Vitest/e2e + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, background job, polling, traffic-dependent cost, or vendor dependency.                                       | implementation review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, config, package, feature flag, provider setting, or production rollback procedure is needed.                   | git diff + validation evidence                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/auth/sign-in` as the existing server route.
  - Preserve `SiteChrome mobileNavMode="hidden"`.
  - Reuse `AuthRequestStatus`, `AuthSubmitButton`, and `AuthResendButton`; do not move auth state into a new client boundary.
  - Do not change `app/auth/sign-in/actions.ts`, auth callback routes, redirects, route cache behavior, or Supabase Auth calls.
- TypeScript/domain contracts:
  - Preserve `getSafeNextPath`, `getSignInContextCopy`, safe source handling, email field behavior, one-time-code field behavior, cooldown timestamp parsing, and `lib/auth/sign-in-ui-state` contracts.
  - Deterministic invariant: `next` and `source` values explain UI context only; they never authorize admin, entitlement, billing, or library access.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, query, storage, index, or data access change.
- External services/tools:
  - N/A; no Supabase provider setting, email provider, Stripe, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Reference surface: current `MyLibraryHub`, My Routines, guide access state, checkout/claim recovery pages, and recently aligned AW-006 My Library route shells.
  - Use `fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, `fs-cta-primary`, and `fs-cta-secondary` where they fit.
  - Keep the change route/auth-component scoped; do not create a broad app-wide auth primitive unless needed to remove real duplication inside this slice.
  - Screenshot handoff type: `before/after` for `/auth/sign-in` desktop and mobile contexts.
- Testing:
  - Add or update unit/component/e2e assertions for route shell/action classes and unchanged auth states.
  - Preserve existing sign-in context, callback, cooldown, request status, resend, and mobile no-bottom-nav coverage.

## Data Placement And Sync Contract

- Server-canonical data:
  - Supabase Auth remains the source of truth for sign-in email generation, one-time-code verification, callback verification, session issuance, and final auth state.
- Local/UI data:
  - `next`, known safe `source`, `sent`, `email`, `error`, and `cooldownUntil` search params continue to drive UI copy and state only.
- Sync policy:
  - Server actions continue to redirect with deterministic query-param UI state; this slice changes presentation only.
- Retention and sensitivity:
  - Raw sign-in links, one-time codes, session cookies, provider diagnostics, and secrets are not persisted or newly exposed.
- Cache/invalidation:
  - No cache, invalidation, revalidation, or freshness behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, rename rule, or migration behavior. Existing email identity and Supabase Auth provider identifiers are untouched.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - `/auth/sign-in` route shell,
  - safe sign-in context copy rendered from existing helpers,
  - request status, submit, and resend action presentation.
- Source of truth:
  - Known sign-in contexts continue to come from `lib/auth/sign-in-context.ts`.
  - Auth request states continue to come from `AuthRequestStatus`, `AuthResendButton`, and `lib/auth/sign-in-ui-state.ts`.
- Additive behavior:
  - Existing and future safe contexts that use the same route shell should inherit the aligned visual hierarchy automatically.
  - Existing sent/cooldown/error/resend states should keep rendering through the same feedback source of truth.
- Explicit mapping requirements:
  - New auth methods, new `source` values, provider-specific recovery states, passkey flows, admin-specific auth recovery, or checkout/claim semantics require explicit copy, tests, screenshot evidence, and support/Help impact review.
- Unknown or deprecated values:
  - Unknown `source` values must continue to fall back to generic safe sign-in copy and must not grant access or reveal protected context.
  - Unknown auth errors must continue to use the existing safe error handling path.
- Test/evidence:
  - Focused tests should prove token/action class adoption and unchanged safe source behavior.
  - Existing auth negative-path/context tests should keep covering unsafe source fallback.
  - Route/label/support sweep covers changed labels, contexts, and auth support surfaces.

## Help / Guide Impact

N/A with rationale: this planned slice preserves visible auth labels, recovery behavior, support procedures, provider diagnostics, checkout/claim behavior, and private-gate behavior. Help/Guide or runbook updates are required only if implementation changes labels, workflow meaning, recovery behavior, support procedure, payments, or private-gate behavior.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice touches `/auth/sign-in` visual hierarchy and auth action presentation.

- Identifiers to search:
  - `/auth/sign-in`
  - `Sign in to My Library`
  - `Sign in to claim access`
  - `Sign in to continue`
  - `Email sign-in link`
  - `Check your email`
  - `One-time code`
  - `Email sign-in link`
  - `Sign in with code`
  - `Resend sign-in email`
  - `AuthRequestStatus`
  - `AuthSubmitButton`
  - `AuthResendButton`
  - `auth-request-status`
  - `auth-submit-request`
  - `auth-submit-code`
  - `auth-resend-button`
- Surfaces to check:
  - `app/auth/sign-in/page.tsx`
  - `app/auth/sign-in/actions.ts`
  - `components/auth/`
  - `lib/auth/`
  - `tests/unit/`
  - `tests/e2e/auth-sign-in-ux.spec.ts`
  - `docs/runbooks/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - planned/in-progress brief,
  - canonical AW-006 queue,
  - design inventory,
  - auth route/component tests,
  - screenshot artifacts,
  - no API, server action, callback, Supabase provider, Stripe, entitlement, analytics, Help/Guide, or support-procedure change unless implementation discovers label/support fallout.
- Evidence wording for gate:
  - identifiers searched: `/auth/sign-in`, sign-in titles, auth action labels, auth component names, and auth test IDs listed above.
  - surfaces checked: `app/auth/sign-in`, `components/auth`, `lib/auth`, unit/e2e auth tests, runbooks, design inventory, and planned/in-progress/done task briefs listed above.
  - fallout handled: only route/component tests, design inventory, canonical queue, active brief, and screenshot artifacts required updates; no API, callback, Supabase, Stripe, entitlement, analytics, Help/Guide, or support-procedure fallout.

## Scope

- `app/auth/sign-in/page.tsx` route shell, main card, form panel, and action class presentation.
- `components/auth/AuthSubmitButton.tsx` only if needed to support token/action classes without changing behavior.
- `components/auth/AuthResendButton.tsx` action class presentation only.
- `components/auth/AuthRequestStatus.tsx` only if needed for spacing/class alignment without changing state logic or copy.
- Focused unit/e2e assertions for token/action classes and unchanged auth states.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Auth server actions, Supabase auth provider settings, email delivery, OTP generation/verification, callback redirects, cookies, rate limits, passkeys, private-gate unlock behavior, entitlements, Stripe/commerce, billing portal, analytics, database schema/RLS, migrations, packages, environment variables, secrets, route metadata, sitemap/robots, Help/Guide updates, support procedure changes, broad app-wide notice/action primitives, and merge without explicit owner approval.
- Changing sign-in copy, labels, recovery behavior, cooldown cadence, error classification, provider diagnostics, safe `next` routing, or visible checkout/claim/admin context meaning.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/auth/sign-in` keeps the same signed-in redirect, safe `next` handling, safe `source` handling, request/resend/verify form actions, and mobile bottom-nav hidden behavior.
2. Email-link request mode, sent/code-entry mode, cooldown, expired cooldown, error, and resend states remain semantically unchanged.
3. The sign-in route shell, form card, request status placement, submit action, and resend action visually align with current AW-006 token/action hierarchy.
4. Auth UI remains keyboard reachable, labelled, and screen-reader friendly.
5. No auth, Supabase, Stripe, entitlement, analytics, Help/Guide, support, API, callback, or provider behavior changes are introduced.
6. Focused tests and before/after screenshot handoff are completed before broad gates.
7. Canonical AW-006 queue and design inventory record this in-progress slice without stale planned-only references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/sign-in-page.test.tsx tests/unit/sign-in-context.test.ts tests/unit/auth-callback-route.test.ts tests/unit/sign-in-ui-state.test.ts tests/unit/auth-request-status.test.tsx tests/unit/auth-resend-button.test.tsx` - PASS, 6 files / 29 tests.
- `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium` - PASS, 5 passed / 2 expected project skips.
- `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=mobile-chromium` - PASS, 2 passed / 5 expected project skips.
- `npm run lint:briefs:all` - PASS, 380 files.
- targeted route/label/support sweep with identifiers listed above - PASS, expected docs/tests/component/route hits only; no API, callback, Supabase, Stripe, entitlement, analytics, Help/Guide, or support-procedure fallout found.
- `npm run typecheck` - PASS.
- `git diff --check` - PASS.
- `npm run verify:pre-pr` - PASS full lane after owner screenshot approval; included lint, quality gates, admin/env/pr-body lints, ESLint with one pre-existing warning in ignored `output/`, typecheck, 219 unit files / 1280 tests, production build, perf budgets, and Playwright e2e 101 passed / 487 expected skips.
- Performance budget trend decision: hold; verification reported 7/2 green runs but worst margin `14.0%` is below the `15.0%` tighten threshold.

Visual gate:

- Capture `before/after` screenshot artifacts for `/auth/sign-in` desktop and mobile contexts - PASS.
- Artifact folder: `output/aw-006-auth-sign-in-token-action-2026-05-28-193652`
- Captured: `2026-05-28 19:38`
- Captured representative filenames:
  - `before-auth-sign-in-default-desktop.png`
  - `after-auth-sign-in-default-desktop.png`
  - `before-auth-sign-in-sent-desktop.png`
  - `after-auth-sign-in-sent-desktop.png`
  - `before-auth-sign-in-checkout-mobile.png`
  - `after-auth-sign-in-checkout-mobile.png`
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge`.
- Owner screenshot approval: PASS in chat on `2026-05-28`.

Broad gates after screenshot approval:

- `npm run verify:pre-pr`
- PR required CI checks green
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands, local dev server, and Playwright screenshot commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-28 | planned | created from clean main@2de4733 after PR #884 and repo-managed closeout #885; owner approved Auth Sign-In Token And Action Hierarchy Parity as the next AW-006 PR-sized slice after fresh queue/design/code re-audit, but did not request execution | next: wait for explicit execute/build/implement before moving this brief to in-progress`
- `2026-05-28 | in-progress | owner explicitly said execute; created branch aw-006-auth-sign-in-token-parity and moved this brief to in-progress | next: implement screenshot-reviewed /auth/sign-in token/action parity before npm run verify:pre-pr`
- `2026-05-28 | in-progress | implemented /auth/sign-in token/action parity while preserving auth behavior; targeted Vitest, desktop/mobile auth e2e, typecheck, full brief lint, diff check, and route/label/support sweep are green | next: capture required before/after screenshot handoff and wait for owner visual approval`
- `2026-05-28 | screenshot gate | captured before/after screenshot artifacts in output/aw-006-auth-sign-in-token-action-2026-05-28-193652 | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-28 | screenshot approved | owner approved screenshot handoff in chat | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-05-28 | pre-pr gate | npm run verify:pre-pr passed full lane after screenshot approval; perf budget trend recommendation is hold because worst margin is 14.0% against 15.0% tighten threshold | next: rerun npm run verify:pre-pr after this evidence-only brief update, then commit/push/open PR`
