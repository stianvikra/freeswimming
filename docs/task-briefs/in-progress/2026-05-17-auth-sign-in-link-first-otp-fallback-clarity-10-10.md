# Task Brief: Auth Sign-In Link-First OTP Fallback Clarity (10/10)

## Metadata

- `id`: `2026-05-17-auth-sign-in-link-first-otp-fallback-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-17`
- `parent_backlog`: `AW-002` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `branch`: `ux/auth-sign-in-link-first-otp-fallback-2026-05-17`

## Brief Audit Record

- `last_audited`: `2026-05-17`
- `base`: `main@eae8817`
- `audit_status`: `ready`
- `decision`: Use this fresh child brief now instead of reviving the older broad AW-002 planned brief directly.
- `reason`: The repo is clean after PRs `#730/#731`; post-merge preflight reported no required closeout, and this child scope is small enough for one UI PR.
- `must_refresh_before_execution_if`: Refresh if auth route behavior, Supabase OTP provider behavior, scorecard categories, screenshot handoff policy, Help/Guide support wording, or validation lane requirements change before merge.

## Goal

Make `/auth/sign-in` read as a sign-in-link-first flow, while keeping the one-time code form as an explicit fallback with deterministic resend/cooldown recovery.

## Scope

- Update `/auth/sign-in` copy and hierarchy only:
  - request state should say a secure sign-in link is emailed,
  - sent state should tell users to open the link first,
  - the code input should be labelled as fallback for clients where the link does not work,
  - resend/cooldown copy should keep the existing deterministic behavior.
- Update adjacent auth-entry labels only when the route-label sweep finds copy that contradicts
  the link-first/code-fallback contract.
- Hide the default fixed mobile nav on `/auth/sign-in` if screenshot QA shows it covering the code
  fallback form.
- Make the code fallback explicit for iPhone Home Screen app users because email links can open in
  Safari instead of the installed app.
- Harden `/auth/callback` cookie application by using the route-handler Supabase helper and applying
  pending auth cookies to redirect responses.
- Update auth UX tests and support/app-knowledge docs that describe the sign-in contract.
- Capture desktop/mobile screenshot handoff before `verify:pre-pr`.

## Out Of Scope

- Replacing Supabase Auth, changing deployed provider settings, adding passkeys, or changing OTP
  verification semantics.
- Adding clipboard automation, code-in-URL prefill, or any raw one-time-code persistence.
- Redesigning the broader auth page, header, private gate, claim flow, or account security surfaces.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                 | Evidence                                      | Expected |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------- |
| Product goals and IA                          | `target`     | Sign-in hierarchy is explicit: email link first, code fallback second, one route owner.                          | e2e assertions + screenshot handoff           | `5/5`    |
| UX flow clarity                               | `target`     | Sent/cooldown/error states give one concrete next action with no code-only ambiguity.                            | e2e auth scenarios                            | `5/5`    |
| Visual design quality                         | `target`     | Changed auth panel keeps existing spacing/tokens and remains readable on desktop and mobile.                     | screenshot handoff                            | `5/5`    |
| Business logic correctness and data integrity | `target`     | Existing request, resend, cooldown, and verify state transitions remain unchanged and covered.                   | unit/e2e tests + code review                  | `5/5`    |
| Admin editor ergonomics                       | `N/A`        | N/A because this is end-user auth UX and changes no admin editor surface.                                        | explicit scope rationale                      | `N/A`    |
| Accessibility (a11y)                          | `target`     | Email/code inputs, status region, and buttons retain labels, keyboard access, and live status semantics.         | e2e role/label assertions + screenshot review | `5/5`    |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: copy/layout tweaks add no dependency or meaningful payload to `/auth/sign-in`.                  | dependency diff + verify gates                | `4/5`    |
| Data placement and sync boundaries            | `target`     | Raw codes remain user-entered only; auth truth stays provider/server-canonical; local state stays non-sensitive. | data contract + code review                   | `5/5`    |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache mode changes; resend/verify redirects continue to own UI state invalidation.           | route/action review                           | `4/5`    |
| Reliability and failure handling              | `target`     | Cooldown, send failure, and invalid-code recovery copy stays non-dead-end and deterministic.                     | e2e + unit tests                              | `5/5`    |
| Security and authz                            | `target`     | No auth endpoint broadening, code leakage, account enumeration, or raw token persistence is introduced.          | code review + existing negative-path coverage | `5/5`    |
| Privacy and compliance                        | `target`     | UI/docs do not ask users to share sign-in links or one-time codes and do not add sensitive logging/persistence.  | support doc review + diff review              | `5/5`    |
| Content governance                            | `supporting` | Supporting only: support/app-knowledge docs stay aligned with the visible auth contract.                         | docs diff                                     | `4/5`    |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, label, or mutation surface changes.                                               | explicit scope rationale                      | `N/A`    |
| SEO and crawlability                          | `supporting` | Supporting only: metadata can mention sign-in link/code without changing sitemap or robots behavior.             | metadata review                               | `4/5`    |
| AI discoverability                            | `N/A`        | N/A because `/auth/sign-in` is not a public AI-discovery content surface and no structured data changes.         | explicit scope rationale                      | `N/A`    |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy change; existing auth diagnostics remain intact.                              | code review                                   | `4/5`    |
| Commerce and revenue ops                      | `supporting` | Supporting only: claim/download routes keep using the same auth entry path; no entitlement logic changes.        | route link review                             | `4/5`    |
| Incident response and support operations      | `target`     | Support runbook reflects link-first plus code fallback diagnostics for missing email, cooldown, and failed code. | runbook update                                | `5/5`    |
| Finance and reporting operations              | `N/A`        | N/A because this auth-copy slice does not change billing, invoices, payouts, refunds, or revenue reports.        | explicit finance scope rationale              | `N/A`    |
| i18n operational readiness                    | `supporting` | Supporting only: changed English strings remain plain, grouped, and future-locale friendly.                      | copy review                                   | `4/5`    |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next server page, client auth status/buttons, Tailwind tokens, and Playwright/Vitest stack.       | dependency diff + code review                 | `5/5`    |
| Testing and QA automation                     | `target`     | Auth UX unit/e2e coverage plus `verify:pre-pr`, CI, and `verify:pre-merge` pass before merge.                    | test logs + CI                                | `5/5`    |
| Scalability and cost efficiency               | `supporting` | Supporting only: copy clarity should not increase auth-provider request volume or runtime cost.                  | no provider-call diff                         | `4/5`    |
| DevOps and rollback readiness                 | `target`     | One PR revert restores the prior sign-in surface without migrations or data repair.                              | PR diff + rollback note                       | `5/5`    |

Critical target categories for `10/10` claim: `Product goals and IA`, `UX flow clarity`, `Business logic correctness and data integrity`, `Accessibility (a11y)`, `Reliability and failure handling`, `Security and authz`, `Privacy and compliance`, `Incident response and support operations`, `Stack-fit and dependency discipline`, `Testing and QA automation`, `DevOps and rollback readiness`.

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse `app/auth/sign-in/page.tsx` and existing auth client components; keep server
  action boundaries in `app/auth/sign-in/actions.ts` unchanged unless tests expose a direct bug.
  Route-handler auth redirects should use `createRouteHandlerSupabaseClient()` when cookies must be
  written to the redirect response.
- TypeScript/domain contracts: keep `deriveSignInRequestState`, cooldown helpers, and email normalization semantics unchanged.
- Supabase/data layer: no migrations, RLS changes, provider setting changes, or generated type updates.
- External services/tools: Supabase Auth remains provider-canonical; no new SDK, webhook, or secret handling change.
- UI system: preserve current auth card, Tailwind tokens, labelled inputs, `role="status"` live region, and responsive constraints; screenshot handoff is before/after for `/auth/sign-in`.
- Testing: update `tests/e2e/auth-sign-in-ux.spec.ts`; run targeted auth tests before screenshot handoff and full gates after approval.

## Data Placement And Sync Contract

- Server-canonical data: Supabase Auth owns OTP generation, magic-link verification, session issuance, cooldown/provider outcomes, and final sign-in success.
- Local/browser data: only form input and rendered query-param status hints; raw one-time codes are never persisted by this slice.
- Sync policy: request/resend/verify server actions redirect back with deterministic status params; no local false-success state is allowed.
- Retention and sensitivity: support docs continue to forbid asking users for sign-in links, one-time codes, cookies, or raw auth errors.
- Cache/invalidation: no cache mode changes; auth actions and callback redirects remain the invalidation boundary.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted domain entity, slug, route parameter, operator-visible identifier, or renameable object.

## Help/Guide And Support-Surface Impact

Update `docs/runbooks/auth-account-support.md` and app-knowledge auth chapter wording so operator support matches the visible link-first/code-fallback contract.

## Quality Gate Evidence

- API/server actions failure-mode evidence: request, resend, callback, and verify semantics stay on
  the existing redirect/status path; changed strings clarify recovery. Existing classified send
  errors still route through `classifySignInEmailError()`, cooldowns still use deterministic helper
  copy, invalid fallback codes redirect to `/auth/sign-in` with a recoverable error, and the callback
  route keeps a no unexpected 500 path by redirecting failed verification to a new sign-in email.
  Successful callback redirects now apply pending Supabase cookies through the route-handler helper.
- Route/label/support sweep identifiers searched: `sign-in code`, `login code`, `Email code`,
  `Send code`, `Get a code`, `one-time code`, `sign-in email`, `secure email link`, `Magic Link`,
  `ConfirmationURL`, and `Token`.
- Route/label/support sweep surfaces checked: `app/`, `components/`, `lib/`, `tests/`,
  `docs/runbooks/`, `docs/app-knowledge-book/`, active task briefs, and planned backlog briefs.
  Fallout handled in `/auth/sign-in`, claim-entry copy, auth helper strings, tests, support runbook,
  and app-knowledge auth chapter; unrelated token references such as site-lock/dev tokens remain
  unchanged.
- UI reference surface/shared component evidence: the reference surface is the existing
  `/auth/sign-in` auth card and its shared auth components (`AuthRequestStatus`,
  `AuthResendButton`, `AuthErrorNotice`). This slice reuses that shared component contract and adds
  no new auth layout abstraction; `SiteChrome` is reused only to suppress the fixed mobile nav where
  screenshot QA showed it covering the fallback form.

## Acceptance Criteria

1. `/auth/sign-in` request copy and sent state present the emailed sign-in link as the primary path.
2. The one-time-code form is visibly and semantically a fallback, including explicit recovery for
   iPhone Home Screen app users whose email links open in Safari.
3. Resend/cooldown/error behavior remains deterministic and tested.
4. Support docs tell operators to guide users through link-first, code fallback, cooldown, and failed-code recovery without asking for secrets.
5. Before/after screenshots cover desktop and mobile sign-in states and receive owner approval before `verify:pre-pr`.

## Validation

- Targeted before screenshot capture.
- `npm run lint:briefs`
- `npm run test:unit -- sign-in`
- `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium`
- `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=mobile-chromium`
- Screenshot handoff before `verify:pre-pr`.
- After owner screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - monitor CI
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-17 | in-progress | created fresh AW-002 child brief from clean main@eae8817 after post-merge preflight; scope limited to link-first sign-in copy, OTP fallback clarity, support docs, tests, and screenshot handoff | next: implement auth UI/docs/tests, run targeted validation, then capture before/after screenshots`
- `2026-05-17 | screenshot-review | implemented link-first sign-in copy, explicit one-time-code fallback, claim/support wording alignment, and mobile auth bottom-nav suppression after screenshot QA showed overlap; targeted unit tests, desktop/mobile auth E2E, and all-brief lint passed; screenshot artifacts captured at /Users/stianvikra/freeswimming/output/auth-sign-in-link-first-2026-05-17-032604 | next: owner screenshot approval before verify:pre-pr`
- `2026-05-17 | owner-approved | owner approved the visible auth direction and brand/email-template decision: primary Supabase Magic Link button via {{ .ConfirmationURL }}, fallback one-time code via {{ .Token }}, hosted PNG lockup-domain-blue logo, and no click-to-copy promise in email | next: run verify:pre-pr, then commit/push/open PR`
- `2026-05-17 | blocker-found | owner reported iPhone Home Screen sign-in email opened in Safari and denied login; paused PR flow, stopped the in-flight pre-PR gate, and expanded scope to make Home Screen code fallback explicit plus harden callback cookie application | next: run targeted callback/auth UI tests, refresh screenshots, then restart pre-PR gate after owner review if visual copy changed`
- `2026-05-17 | screenshot-approved | refreshed screenshots at /Users/stianvikra/freeswimming/output/auth-sign-in-pwa-fallback-2026-05-17-124859 after PWA/Safari fallback copy and callback cookie hardening; owner approved the refreshed screenshot handoff; follow-up native iOS shell + Universal Links brief created at docs/task-briefs/planned/2026-05-17-ios-native-shell-universal-links-auth-10-10.md so the non-code-fallback iPhone path is tracked separately | next: run verify:pre-pr, commit, push, and open PR`
- `2026-05-17 | pre-pr-green | npm run verify:pre-pr passed full lane after runtime/test/docs changes; perf budget reported 5 consecutive weekly green runs, with ratchet decision held out of this auth PR to keep scope narrow and prompt owner after merge/readiness | next: commit, push, open PR, monitor CI, then run verify:pre-merge`
