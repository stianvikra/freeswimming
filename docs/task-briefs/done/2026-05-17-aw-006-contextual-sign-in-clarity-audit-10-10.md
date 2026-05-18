# Task Brief: AW-006 Contextual Sign-In Clarity Audit (10/10)

## Metadata

- `id`: `2026-05-17-aw-006-contextual-sign-in-clarity-audit-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-18`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `parking_decision`: Unparked on `2026-05-18` as the next small PR-sized UX/UI slice after Programs Poolside PDF token polish shipped.

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@c6e0657`
- `audit_status`: `ready`
- `decision`: Execute this as the current AW-006 UX/UI slice.
- `reason`: Programs Poolside PDF token polish and closeout shipped through `#744/#745`, leaving this as the next small PR-sized item in the canonical AW-006 UX/UI queue.
- `must_refresh_before_execution_if`: Refresh if `/auth/sign-in`, auth callback behavior, checkout success, claim/download recovery, billing portal entry, support runbooks, scorecard categories, screenshot handoff rules, or verification lanes change before merge.

## Goal

Make `/auth/sign-in` explain why the user is signing in for the current entry context while preserving the existing secure email-link-first and one-time-code fallback behavior.

## Product Decisions

- This is a contextual copy and recovery slice, not an auth architecture change.
- The primary auth method remains the secure email link; the one-time code remains the fallback for Home Screen app/Safari handoff failures.
- Admin copy must not imply that signing in grants admin access; admin authorization remains checked after identity is verified.
- Checkout/claim copy may tell users to use the checkout email, but must not promise that a purchase exists or that billing access is available before entitlement checks complete.
- Billing portal recovery stays tied to signed-in `My Library`; this slice may clarify support/user recovery copy but does not change Stripe Portal authorization.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- UX flow clarity
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Commerce and revenue ops
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/auth/sign-in` must name the current destination context for admin, My Library, checkout success, and claim/download entry without changing route ownership.           | helper tests + e2e assertions + screenshots         | `5/5`                   |
| UX flow clarity                               | `target`     | Users must see one clear reason to sign in and one next action for link-first, code fallback, cooldown, and error states.                                               | e2e auth scenarios                                  | `5/5`                   |
| Visual design quality                         | `target`     | Context copy must fit the existing auth card on desktop and mobile without crowding the form or reintroducing mobile bottom-nav overlap.                                | desktop/mobile screenshot handoff                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing request, resend, callback, cooldown, and one-time-code state transitions remain unchanged; any context query state is non-authoritative UI copy only.          | unit/e2e tests + code review                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes admin sign-in context copy only, not admin editor CRUD, publishing, notes, or operator editing workflow.                                 | explicit admin editor scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Headings, labels, status region, inputs, and buttons retain keyboard and screen-reader semantics while adding context text.                                             | role/label e2e assertions + screenshot review       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: small server-rendered copy/helper changes add no dependency and no meaningful client payload to `/auth/sign-in`.                                       | dependency diff + broad gates                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Context/source query values stay local to UI/redirect copy; auth truth remains Supabase/server-canonical and raw one-time codes remain user-entered only.               | data contract + code review                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no route cache, revalidation, or mutation invalidation change; auth redirects continue to own UI state.                                                | route/action review                                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Failed callback, invalid code, cooldown, and resend states preserve the same recoverable destination context when safe.                                                 | callback/helper/e2e tests                           | `5/5`                   |
| Security and authz                            | `target`     | Context/source params must not broaden redirects, grant admin/billing access, expose secrets, persist raw codes, or weaken fail-closed auth checks.                     | safe-source helper tests + auth code review         | `5/5`                   |
| Privacy and compliance                        | `target`     | Copy must not ask users to share sign-in links, one-time codes, session cookies, raw auth errors, or payment details in app.                                            | support doc review + diff review                    | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: auth/support/app-knowledge wording stays aligned with visible sign-in behavior; no CMS ownership model changes.                                        | docs diff                                           | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow action, label, mutation, role workflow, Help/Guide surface, or operator edit path changes.                                                | explicit admin workflow scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/auth/sign-in` remains a utility auth route and this slice changes no metadata, sitemap, robots, canonical URL, or structured public content.              | explicit SEO scope rationale                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the changed auth utility route is not an AI-discovery content surface and no structured data/entity content is introduced.                                  | explicit AI-discoverability scope rationale         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy or payload change; existing auth and commerce analytics remain intact.                                                               | code review                                         | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout/claim/billing context copy must be accurate: use checkout email, attach access only after checks, and keep billing portal ownership checks unchanged.          | e2e/unit assertions + portal/claim code review      | `5/5`                   |
| Incident response and support operations      | `target`     | Support docs must explain admin, My Library, checkout/claim, billing portal, failed-link, cooldown, and code-fallback recovery without asking for secrets.              | runbook update                                      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, invoice, payout, refund, entitlement, revenue report, reconciliation surface, Stripe dashboard config, or finance data.             | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new English strings stay concise, grouped, and avoid grammar coupling that would block later localization.                                             | copy review                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing Next server page, auth actions, auth callback route, shared auth components, Tailwind style, and current Vitest/Playwright stack; add no dependency. | architecture review + dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted helper/unit/e2e coverage for context copy and safe context preservation; run screenshot handoff before broad gates.                                        | targeted tests + screenshot artifacts + later gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: server-rendered copy and safe query parsing add no backend call, polling, storage, external service, image, job, or traffic-dependent cost.            | implementation review                               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR revert restores prior auth copy/links without migrations, data repair, config change, or provider action; screenshot evidence documents the visual delta.        | git diff + screenshot artifacts + gate logs         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface is the existing `/auth/sign-in` server route and shared auth components: `AuthRequestStatus`, `AuthSubmitButton`, and `AuthResendButton`.
  - Keep server actions in `app/auth/sign-in/actions.ts`; do not introduce API routes or client state for context copy.
  - Preserve `SiteChrome mobileNavMode="hidden"` on auth.
- TypeScript/domain contracts:
  - Add a small typed helper for safe sign-in context/source copy if needed.
  - Preserve `getSafeNextPath`, email normalization, cooldown, resend, and OTP verification semantics.
- Supabase/data layer:
  - N/A; no migrations, RLS/authz, generated types, storage, or Supabase schema changes.
- External services/tools:
  - Supabase Auth and Stripe remain unchanged. Do not alter OTP provider settings, Checkout Sessions, webhooks, portal creation, secrets, retries, or idempotency.
- UI system:
  - Preserve the existing auth card visual language and labelled form controls.
  - Screenshot handoff type is `before/after` for `/auth/sign-in` desktop and mobile contexts.
- Testing:
  - Add targeted helper/unit tests and extend `tests/e2e/auth-sign-in-ux.spec.ts`.
  - After owner screenshot approval, run `npm run verify:pre-pr`, push/open PR, monitor CI, then run `npm run verify:pre-merge`.

## Data Placement And Sync Contract

- Server-canonical data: Supabase Auth owns sign-in email generation, callback verification, session issuance, and final auth state.
- Local/UI data: `next` and optional safe `source` query values only select explanatory copy and are never used as authorization, entitlement, billing, or admin truth.
- Sync policy: auth actions continue to redirect with deterministic query-param UI state; context is preserved only when it is a known safe source.
- Retention and sensitivity: raw one-time codes remain user-entered and are not persisted; support docs continue to forbid collecting sign-in links, codes, cookies, raw auth errors, or payment details.
- Cache/invalidation: no cache mode changes; redirects and auth cookies remain the state boundary.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, slug, route parameter, human-readable identifier, operator-visible object, alias, redirect, rename, or repurpose behavior.

## Help / Guide Impact

Update `docs/runbooks/auth-account-support.md` and the app-knowledge auth chapter only where support/operator wording must match the contextual sign-in contract. No Admin Help Center runtime copy is changed.

## Route / Label / Support Surface Sweep

- Required before broad gates because auth, admin, checkout/claim, and billing support wording are touched.
- Identifiers searched:
  - `/auth/sign-in`
  - `Sign in to My Library`
  - `Sign in to Admin`
  - `secure sign-in link`
  - `one-time code`
  - `checkout email`
  - `claim`
  - `Manage billing`
  - `billing portal`
  - `source=checkout_success`
  - `source=claim_entry`
- Surfaces checked:
  - `app/`
  - `components/`
  - `lib/`
  - `tests/`
  - `docs/runbooks/`
  - `docs/app-knowledge-book/`
  - active/planned/done task briefs touched by AW-006 queue status.
- Expected fallout:
  - auth page/action/callback context copy and tests,
  - checkout success/claim links if they need a safe context source,
  - support/app-knowledge docs,
  - canonical AW-006 queue refresh.
  - no Stripe API, Supabase provider setting, entitlement, route class, sitemap, metadata, Admin Help Center, or database change.

## Failure-Mode Evidence

- No unexpected `500` path is introduced in this slice. Callback failure, invalid email, cooldown, invalid code, and unsafe `source` inputs continue to redirect or render recoverable sign-in states.
- Failure-mode coverage:
  - `tests/unit/auth-callback-route.test.ts` covers failed callback recovery with safe source preservation and unsafe source dropping.
  - `tests/unit/sign-in-context.test.ts` covers safe context parsing, generic fallback copy, and callback URL source filtering.
  - `tests/e2e/auth-sign-in-ux.spec.ts` covers visible error/cooldown/sent/code fallback states plus admin, claim, and checkout context copy.

## Scope

- `/auth/sign-in` context copy for `next=/admin`, My Library/protected member paths, checkout success, and claim/download entry contexts.
- Safe source/context preservation through request/resend/callback failure redirects when it only affects UI copy.
- `app/checkout/success/page.tsx` and `app/claim/page.tsx` link context only if needed for accurate sign-in copy.
- Targeted unit/e2e tests.
- Support/app-knowledge wording alignment.
- Refresh the AW-006 canonical queue to show plans as shipped and this slice as active.
- Screenshot handoff artifacts.

## Out Of Scope

- Supabase Auth provider settings, email template changes, callback success semantics, OTP verification semantics, passkeys, native iOS/Universal Links work, admin authorization, billing portal authorization, Stripe Checkout/Portal APIs, entitlements, download resend mechanics, route metadata, sitemap/robots, analytics taxonomy, design-token foundation, and new dependencies.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge without explicit owner approval.

## Acceptance Criteria

1. `/auth/sign-in?next=%2Fadmin` explains that sign-in confirms identity and admin access is checked after sign-in.
2. `/auth/sign-in?next=%2Fmy-library` and protected My Library paths explain that users return to their library/member page after verification.
3. Checkout success and claim/download entry contexts tell users to use the checkout email without promising entitlement or billing access before checks complete.
4. Safe context/source query values survive request, resend, and failed callback recovery only as UI copy; unsafe values are ignored.
5. Existing link-first, code fallback, resend, cooldown, invalid-code, and redirect behavior remain unchanged.
6. Support/app-knowledge docs reflect the contextual sign-in and billing/claim recovery contract.
7. Desktop and mobile screenshots make the visible auth delta reviewable before broad gates.

## Validation

- `npm run lint:briefs`
- Targeted:
  - `./node_modules/.bin/vitest run tests/unit/sign-in-context.test.ts tests/unit/auth-callback-route.test.ts`
  - `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=mobile-chromium`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/contextual-sign-in-clarity-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - representative filenames: `before-auth-sign-in-admin-desktop-1440.png`, `after-auth-sign-in-admin-desktop-1440.png`, `before-auth-sign-in-checkout-mobile-390.png`, `after-auth-sign-in-checkout-mobile-390.png`
- Owner screenshot approval or correction pass before PR creation/update and broad gates.
- After screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-18 | in-progress | started from clean main@c6e0657 after Programs token polish #744 and closeout #745; post-merge preflight found no repo-managed closeout; branch ux/contextual-sign-in-clarity created; scope limited to contextual auth copy, safe source preservation, targeted tests/docs, canonical AW-006 queue refresh, and screenshot handoff | next: finish implementation, run targeted validation, then capture after screenshots before broad gates`
- `2026-05-18 | validation | implemented contextual sign-in helper/copy, preserved safe source context through request/resend/callback recovery, updated checkout/claim entry links plus support/app-knowledge docs, and refreshed AW-006 queue; targeted validation passed: npm run lint:briefs, npm run lint:briefs:all, ./node_modules/.bin/vitest run tests/unit/sign-in-context.test.ts tests/unit/auth-callback-route.test.ts, npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium, and npx playwright test tests/e2e/auth-sign-in-ux.spec.ts --project=mobile-chromium; before/after screenshot artifacts captured in output/contextual-sign-in-clarity-2026-05-18-125759 and owner approved the handoff | next: run npm run verify:pre-pr, then commit/push/open PR`
- `2026-05-18 | validation | npm run verify:pre-pr passed full lane after brief evidence wording was tightened for failure-mode and route/support sweep evidence; perf trend recommended tightening one stretch target after 6 consecutive weekly green runs, but this UX/UI auth-copy slice holds budgets unchanged and records the tighten prompt for PR/follow-up rather than changing performance thresholds in this PR | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
