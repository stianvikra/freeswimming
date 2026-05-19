# Task Brief: AW-006 Auth Feedback Source Of Truth Cleanup (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-auth-feedback-source-of-truth-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-admin-messages-state-primitive-second-wave-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-auth-feedback-source-of-truth`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@53b569b`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a narrow auth feedback source-of-truth cleanup.
- `reason`: `main` is clean after PR `#772` and repo-managed closeout PR `#773`; `npm run post-merge:preflight` reports no pending closeout. The canonical AW-006 queue asked for a short re-audit before the next slice, and the notice/empty-state inventory still points at auth feedback as a later candidate while `AuthErrorNotice` is unused and overlaps with the live `AuthRequestStatus` contract.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/auth/sign-in`, auth feedback components, sign-in cooldown helpers, sign-in context copy, auth Help/Guide contracts, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make `/auth/sign-in` feedback have one maintained UI source of truth for sent, cooldown, and error states without changing the actual sign-in flow.

## Pre-Implementation Owner Explanation

Dette slicen rydder sign-in-feedbacken slik at innlogging har en tydelig kilde for sendt-, cooldown- og feilmeldinger. Det betyr mindre risiko for motstridende auth-tekst og enklere videre arbeid. Utenfor scope er innloggingslogikk, OTP/magic-link-regler, redirects, passkeys, Stripe/entitlements og bred redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `/auth/sign-in` feedback ownership and update the AW-006 queue/inventory after `#772/#773`.                                                                                            | active brief + canonical queue diff + inventory diff               | `5/5`                   |
| UX flow clarity                               | `target`     | Sent, cooldown, expired-cooldown, and error feedback remain deterministic and continue to guide the user without contradictory states.                                                                            | component/unit tests + existing auth e2e                           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: this cleanup should preserve the current auth feedback appearance; screenshot handoff is required only if rendered `/auth/sign-in` output changes.                                               | diff review + targeted tests                                       | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Sign-in state derivation, cooldown countdown math, request/resend flow, `next` handling, and form actions remain unchanged.                                                                                       | helper/component tests + unchanged action/API diff review          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this touches public/member sign-in feedback only and changes no admin editor workflow, CRUD flow, or operator data entry surface.                                                                     | admin scope review                                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Live auth feedback keeps polite status semantics for dynamic sent/cooldown/error states, and absent idle feedback remains silent.                                                                                 | component tests for role/aria                                      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency or route fetch change; deleting unused UI code must not add JS or route payload.                                                                                                   | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                                                                          | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                                     | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable auth feedback states remain explicit: cooldown message starts hydration-safe, counts down after client mount, expired cooldown no longer blocks retry guidance, and non-cooldown errors stay visible. | helper/component tests + existing auth e2e                         | `5/5`                   |
| Security and authz                            | `target`     | Auth provider calls, server actions, protected routes, credentials, cookies, redirects, rate limits, and raw provider error handling remain untouched.                                                            | unchanged action/API diff review + auth tests                      | `5/5`                   |
| Privacy and compliance                        | `target`     | Feedback must not expose secrets, raw provider diagnostics, tokens, payment details, or sign-in codes beyond the existing safe user-facing messages.                                                              | copy/diff review + tests                                           | `5/5`                   |
| Content governance                            | `target`     | Auth feedback ownership is documented in the AW-006 queue/inventory, and unused overlapping component code is removed or clearly retired.                                                                         | docs diff + changed-file review                                    | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable content state, approval flow, or operator action changes.                                                                                                           | workflow scope review                                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                                                       | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                               | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, logging, dashboard, or KPI definition changes.                                                                                                             | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches auth feedback only and changes no Stripe identifier, pricing, entitlement, checkout, invoice, refund, payout, or revenue data.                                                           | commerce scope rationale                                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostic, runbook procedure, or support escalation behavior.                                                                      | support-ops scope rationale                                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                          | finance scope rationale                                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because auth feedback contains user copy, but this slice preserves existing English strings and changes no translation workflow.                                                                       | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js/React auth components and `lib/auth/sign-in-ui-state` helpers; add no dependency, route rewrite, or app-wide primitive.                                                                      | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for live auth feedback semantics and run targeted auth tests plus required broad gates.                                                                                            | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because cleanup reduces duplicate maintenance surface without adding runtime services, infrastructure, or recurring cost.                                                                              | deleted/retired duplicate code review                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                         | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: live `/auth/sign-in` uses `components/auth/AuthRequestStatus.tsx`, `components/auth/AuthResendButton.tsx`, and `lib/auth/sign-in-ui-state.ts`.
  - Keep the server route `app/auth/sign-in/page.tsx` and server actions in `app/auth/sign-in/actions.ts` unchanged unless tests expose a direct ownership bug.
  - Route/action/API boundary: no auth callback, sign-in server action, Supabase, cookie, redirect, or rate-limit behavior changes.
  - Cache/revalidation: no cache, dynamic route, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve `SignInRequestState`, cooldown timestamp math, fallback strings, deterministic state ordering, and keep countdown text hydration-safe by starting the ticking clock after client mount.
  - The active source of truth for rendered request feedback remains `AuthRequestStatus`.
- Supabase/data layer:
  - N/A; no schema, RLS, authz policy, generated DB type, storage, or query change.
- External services/tools:
  - N/A; no Supabase provider setting, email provider, Stripe, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Preserve current auth feedback visual treatment unless a test reveals an accessibility issue that requires a minimal semantic-only adjustment.
  - Screenshot handoff comparison type: only required if final diff changes rendered `/auth/sign-in` output; otherwise document no visual/rendering change.
- Testing:
  - Add focused component tests for sent, cooldown, error, expired cooldown, and idle feedback semantics.
  - Run existing sign-in state/e2e coverage before broad gates.

## Data Placement And Sync Contract

N/A with rationale: this cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Auth request state continues to derive from existing URL/search params and server-action outcomes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing email identity and auth provider identifiers are untouched.

## Help / Guide Impact

N/A with rationale: this slice preserves existing sign-in labels, recovery actions, user-facing copy, and support procedures. Help/Guide or runbook updates are required only if implementation changes auth workflow labels, recovery behavior, provider diagnostics, support procedure, payments, or private-gate behavior; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted auth-surface sweep because this slice removes or retires overlapping feedback code and updates the canonical AW-006 queue.

- Identifiers searched before broad gates:
  - `AuthErrorNotice`
  - `AuthRequestStatus`
  - `auth-request-status`
  - `Sign-in email sent`
  - `Please wait`
  - `You can request a new sign-in email now`
  - `role="status"`
  - `aria-live="polite"`
- Surfaces checked:
  - `app/auth/sign-in/page.tsx`
  - `components/auth/`
  - `lib/auth/sign-in-ui-state.ts`
  - `tests/unit/`
  - `tests/e2e/auth-sign-in-ux.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/runbooks/`
- Fallout handled:
  - auth feedback has one live rendered component,
  - focused component tests,
  - active brief checkpoint updates,
  - canonical AW-006 queue and design inventory refresh,
  - no Help/Guide/runtime update unless labels or recovery behavior change.

## Scope

- Remove or explicitly retire unused overlapping auth feedback code:
  - `components/auth/AuthErrorNotice.tsx`
- Preserve live auth feedback behavior in:
  - `components/auth/AuthRequestStatus.tsx`
  - `components/auth/AuthResendButton.tsx`
  - `lib/auth/sign-in-ui-state.ts`
  - `app/auth/sign-in/page.tsx`
- Add focused unit/component coverage for `AuthRequestStatus`.
- Update this active brief, the canonical AW-006 queue, and the notice/empty-state inventory.

## Out Of Scope

- Auth server actions, Supabase auth provider calls, email delivery, OTP generation/verification, callback redirects, cookies, rate limits, passkeys, private-gate unlock behavior, entitlements, Stripe/commerce, analytics, database schema/RLS, migrations, workflows, packages, environment variables, secrets, or merge to `main`.
- Changing sign-in copy, labels, recovery behavior, cooldown cadence, error classification, provider diagnostics, `next` routing, Help/Guide, support procedures, or broad app-wide notice primitives.
- Admin notes/content upload recovery, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or admin state primitive expansion.

## Acceptance Criteria

1. `/auth/sign-in` has one maintained rendered request-feedback component for sent, cooldown, and error states.
2. The unused overlapping auth feedback component is removed or clearly retired with no imports left behind.
3. Existing sign-in state derivation, cooldown math, resend behavior, server actions, redirects, auth provider calls, and user-facing strings remain unchanged.
4. Cooldown feedback and resend labels start from hydration-safe markup and then count down after client mount, avoiding server/client countdown drift.
5. Accessibility semantics are explicit: dynamic request feedback is a polite status region, idle feedback is silent, and expired cooldown falls back deterministically.
6. Targeted unit/component tests cover sent, cooldown, error, expired-cooldown, idle feedback, and resend cooldown behavior.
7. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npx vitest run tests/unit/sign-in-ui-state.test.ts tests/unit/auth-request-status.test.tsx tests/unit/auth-resend-button.test.tsx`
  - `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium`
  - targeted route/label/support sweep
  - `git diff --check`
- Visual gate:
  - Capture representative after/reference screenshot artifacts for `/auth/sign-in` because auth feedback UI files are touched.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.
- Broad gates:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server/Playwright commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@53b569b after PR #772 and repo-managed closeout PR #773; post-merge preflight found no pending closeout; created branch aw-006-auth-feedback-source-of-truth and active brief for the auth feedback source-of-truth cleanup | next: remove or retire unused overlapping auth feedback code, refresh the AW-006 queue/design inventory, and add targeted tests`
- `2026-05-19 | in-progress | removed unused AuthErrorNotice, refreshed the canonical AW-006 queue and design inventory, added AuthRequestStatus component coverage for idle, sent, cooldown, expired-cooldown, and error states, and after screenshot capture exposed a cooldown hydration drift caused by client/server Date.now differences; adjusted AuthRequestStatus and AuthResendButton to render hydration-safe cooldown markup first and start ticking after client mount without changing cooldown cadence, primary strings after hydration, server actions, redirects, provider calls, or auth state derivation | next: rerun targeted tests, regenerate screenshot artifacts, and stop for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-19 | screenshot-review | targeted Vitest, npm run lint, npm run typecheck, targeted auth Playwright desktop, npm run lint:briefs:all, npm run lint:quality-gates, route/label/support sweep, and git diff --check passed; regenerated after/reference screenshot artifacts in output/aw-006-auth-feedback-2026-05-19-213512 at 2026-05-19 21:35 after the hydration-safe cooldown fix, with no hydration mismatch in the devserver log; no product-rendering files changed after this capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
- `2026-05-19 | pre-pr | owner approved screenshot handoff; npm run verify:pre-pr passed the full lane, including lint, typecheck, unit, build, performance budgets, and Playwright; no product-rendering files changed after screenshot capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
