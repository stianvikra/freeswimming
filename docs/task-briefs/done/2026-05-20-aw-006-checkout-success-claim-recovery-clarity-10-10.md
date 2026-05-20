# Task Brief: AW-006 Checkout Success And Claim Recovery Clarity (10/10)

## Metadata

- `id`: `2026-05-20-aw-006-checkout-success-claim-recovery-clarity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-20`
- `updated`: `2026-05-20`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-guide-tracker-sync-state-clarity-10-10.md`
- `branch`: `aw-006-checkout-claim-recovery-clarity`

## Brief Audit Record

- `last_audited`: `2026-05-20`
- `base`: `main@7529c73`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded checkout success and claim recovery clarity pass.
- `reason`: `main` is clean after Guide Tracker Sync State Clarity PR `#776` and repo-managed closeout PR `#777`; `npm run post-merge:preflight` reports no pending closeout. The canonical AW-006 queue still points at the now-done guide tracker slice, while the review queue keeps post-purchase expectation/recovery flow as an explicit Phase 3 gap.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/checkout/success`, `/claim`, `DownloadResendForm`, auth sign-in context, checkout/session payloads, entitlement/webhook behavior, support runbooks, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make the post-purchase success and claim-access recovery surfaces clearer, calmer, and more trustworthy without changing Stripe, auth, entitlement, email, or database behavior.

## Pre-Implementation Owner Explanation

Dette slicen gjør "takk for betalingen" og "claim access"-sidene tydeligere, roligere og mer på linje med AW-006-designet. Det betyr noe fordi brukeren akkurat har betalt og må forstå neste steg: gå til My Library, signere inn med riktig e-post, eller få tilsendt tilgangslenke på nytt. Utenfor scope er Stripe-API, webhooks, priser, entitlements, faktura, auth-logikk, e-postlevering, database, analytics-taxonomy og bred redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Commerce and revenue ops`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/checkout/success` and `/claim` must clearly separate payment received, My Library access, sign-in, and resend/claim recovery jobs.                                                 | route render tests + screenshot handoff + support runbook diff | `5/5`                   |
| UX flow clarity                               | `target`     | Signed-in and signed-out users must see an obvious primary next step plus a safe recovery path, with no copy promising entitlement before checks complete.                           | route render tests + screenshot handoff                        | `5/5`                   |
| Visual design quality                         | `target`     | Both routes use the AW-006 token direction and stable responsive layout without crowded mobile actions or broad redesign.                                                            | desktop/mobile screenshot handoff                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Search params, signed-in redirect behavior, safe sign-in source context, resend payloads, session reference handling, and current server helpers remain deterministic and unchanged. | unit tests + code review                                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, moderation path, confirmation, recovery action, or operator workflow.                                                 | admin scope rationale                                          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Headings, landmark flow, form label, links, buttons, and dynamic resend feedback remain semantic and keyboard reachable.                                                             | Testing Library role assertions + screenshot/manual review     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: changed routes add no dependency, image, extra fetch, heavy client runtime, or route-cache change.                                                                  | package diff + build/pre-pr gate                               | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no new local state, server-canonical data, storage key, sync trigger, retention rule, or conflict behavior.                                        | explicit data-boundary scope rationale                         | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because route cache behavior, checkout success freshness, resend API cache behavior, and entitlement invalidation remain unchanged.                                              | cache scope rationale                                          | `N/A`                   |
| Reliability and failure handling              | `target`     | Recovery copy must preserve the existing non-enumerating resend behavior and give users a useful fallback when access email or sign-in is needed.                                    | route tests + resend form tests + support runbook diff         | `5/5`                   |
| Security and authz                            | `target`     | UI/copy must not imply checkout/session ID, email, source query, or sign-in context grants access; auth/entitlement checks remain fail-closed and untouched.                         | code review + existing auth/download tests + route tests       | `5/5`                   |
| Privacy and compliance                        | `target`     | Recovery copy must preserve privacy-safe generic responses and avoid exposing whether an email owns a purchase.                                                                      | route tests + `DownloadResendForm` contract review             | `5/5`                   |
| Content governance                            | `target`     | The canonical AW-006 queue, active brief, design inventory, and support runbook must reflect the new current slice and completed guide tracker slice.                                | docs diff + brief lint                                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable content state, approval flow, dashboard action, or operator support action.                                               | admin workflow scope rationale                                 | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/claim` public semantic copy becomes clearer; `/checkout/success` remains a transactional route and no metadata/sitemap/robots contract changes are scoped.        | route content review                                           | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public structured data, crawl-safe entity model, canonical AI-facing content, or documentation ingestion contract.                                       | AI-discoverability scope rationale                             | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing checkout-cancel, resend, and sign-in source values remain intact; no event taxonomy or payload change is introduced.                                       | diff review + existing analytics tests                         | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Stripe-hosted Checkout Sessions, invoice/receipt expectations, checkout success URL, claim/resend recovery, and My Library next step remain truthful and reconcilable.               | Stripe skill review + route tests + support runbook diff       | `5/5`                   |
| Incident response and support operations      | `target`     | Support guidance must describe the updated post-purchase and claim recovery user path without changing escalation or diagnostic procedures.                                          | `docs/runbooks/auth-account-support.md` diff                   | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: copy may mention receipt/invoice expectations, but no billing, invoice creation, payout, refund, reconciliation, or finance data behavior changes.                  | checkout/finance scope review                                  | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new English strings must stay concise, grouped, and avoid fragile grammar-coupled layout assumptions; no locale routing or translation workflow changes.            | copy review + responsive screenshot review                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next routes, `SiteChrome`, `DownloadResendForm`, auth helpers, AW-006 CSS tokens, and Stripe Checkout Sessions direction; add no dependency.                          | changed-files/package diff                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused route render coverage for signed-in/signed-out success and claim recovery, run targeted tests, screenshot handoff, and broad gates after owner approval.                 | targeted Vitest + screenshot artifacts + verify gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the change adds static route markup and tests only, with no extra API call, polling, job, vendor, media, or runtime cost pattern.                                   | implementation review                                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change must be reversible by normal git revert and must require no migration, config, package, workflow, deployment setting, or external service change.                             | git diff review + validation gates                             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: AW-006 token-backed public/member surfaces (`/plans`, `/programs`, `MyLibraryHub`) plus the existing checkout success and claim route contracts.
  - Keep `/checkout/success` and `/claim` as server routes.
  - Keep `SiteChrome` and `DownloadResendForm`; do not introduce new route boundaries, server actions, API routes, cache behavior, or redirects beyond existing signed-in claim redirect.
- TypeScript/domain contracts:
  - Preserve `getSafeNextPath`, `getServerSupabaseUserIfAuthCookiePresent`, safe sign-in source values, `DownloadResendForm` props, and `session_id` sanitization.
  - Deterministic invariant: query context and session references explain recovery only; they never grant entitlement, billing, or download access.
- Supabase/data layer:
  - N/A; no migration, RLS/authz policy, generated DB type, query, storage, or schema work.
- External services/tools:
  - Stripe best-practice baseline: keep one-time payments on Stripe-hosted Checkout Sessions; this slice changes no SDK call, Checkout Session payload, price ID, webhook, idempotency, retry, secret, portal, invoice creation, or observability behavior.
- UI system:
  - Use existing AW-006 CSS token classes (`fs-library-card`, `fs-cta-primary`, `fs-cta-secondary`) where practical.
  - Avoid app-wide component primitive rollout; keep the surface route-local unless a tiny helper removes real duplication.
  - Screenshot handoff comparison type: `before/after` for `/checkout/success` and `/claim` desktop/mobile.
- Testing:
  - Add focused Testing Library coverage for route rendering, signed-in/signed-out variants, safe links, resend form presence, and no entitlement-overpromise copy.
  - Run targeted tests, route/support sweep, screenshot handoff, then stop for owner approval before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no new local-only state, server-canonical data, browser storage, sync queue, conflict policy, retention rule, cache invalidation, or sensitive data handling. Existing checkout, entitlement, email-resend, auth, and My Library data ownership remains unchanged.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or compatibility mapping. Existing Stripe session IDs remain external references shown only as optional support context.

## Help / Guide Impact

Support runbook update required because this slice changes post-purchase and claim recovery presentation. Help/Guide product assertions are otherwise N/A because no admin/user workflow label, auth behavior, checkout behavior, entitlement behavior, or support procedure changes.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice touches public/transactional route copy, claim recovery, and support-facing post-purchase expectations.

- Identifiers searched:
  - `checkout_success`
  - `claim_entry`
  - `/checkout/success`
  - `/claim`
  - `DownloadResendForm`
  - `Email me access link`
  - `Session reference`
  - `Sign in to My Library`
  - `Claim your purchases`
  - `post-purchase`
- Surfaces checked:
  - `app/checkout/success/page.tsx`
  - `app/claim/page.tsx`
  - `components/commerce/DownloadResendForm.tsx`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/runbooks/auth-account-support.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - active brief,
  - canonical AW-006 queue,
  - design inventory lifecycle note,
  - support runbook,
  - two route files,
  - focused route tests,
  - screenshots,
  - no API, auth, Stripe, Supabase, analytics, checkout payload, entitlement, email provider, or migration change.
- Sweep evidence:
  - `2026-05-20`: ran `rg -n "checkout_success|claim_entry|/checkout/success|/claim|DownloadResendForm|Email me access link|Session reference|Payment reference|Sign in to My Library|Claim your purchases|post-purchase|Guide tracker sync-state clarity|Checkout success and claim recovery" app/checkout/success/page.tsx app/claim/page.tsx components/commerce/DownloadResendForm.tsx tests/unit docs/runbooks/auth-account-support.md docs/design/notice-empty-state-pattern-inventory.md docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done -S`.
  - Fallout handled: active brief, canonical queue, design inventory lifecycle note, support runbook, two route files, and focused tests. Historical done-brief references were left unchanged as lifecycle evidence.

## Scope

- Create this active AW-006 child brief.
- Update the canonical AW-006 queue after Guide Tracker Sync State Clarity `#776/#777`.
- Update the notice/empty-state inventory so it no longer names Guide Tracker Sync State Clarity as active.
- Update support guidance for checkout success and claim recovery expectations.
- Improve UI/copy/layout for:
  - `app/checkout/success/page.tsx`
  - `app/claim/page.tsx`
- Preserve `DownloadResendForm` behavior while using it in clearer recovery context.
- Add focused unit/component tests for both routes.
- Capture screenshot handoff artifacts before broad PR gates.

## Out Of Scope

- Stripe API/session payloads, prices, products, discounts, invoices, receipts, portal behavior, webhooks, idempotency, retries, SDK/API version, payment methods, secrets, dashboards, finance exports, entitlement upserts, refunds, payouts, reconciliation, Supabase schema/RLS/data access, auth provider behavior, email delivery/provider templates, `DownloadResendForm` request contract, analytics taxonomy, `/plans` offer cards, My Library ownership rendering, broad design-system primitives, new assets, new dependencies, CI workflows, or merge to `main`.

## Acceptance Criteria

1. The canonical AW-006 queue records Guide Tracker Sync State Clarity as shipped through `#776/#777`.
2. `/checkout/success` clearly says payment was received, access is checked/attached through existing systems, and the next useful step is My Library or sign-in.
3. Signed-out checkout users see a safe claim/resend recovery path that tells them to use the checkout email without promising access before checks complete.
4. `/claim` clearly explains checkout-email recovery, generic privacy-safe responses, sign-in fallback, and My Library destination.
5. Existing signed-in `/claim` redirect to safe `next` remains unchanged.
6. Existing `DownloadResendForm` API payload shape and allowed `source` values remain unchanged.
7. No checkout/session payload, Stripe, entitlement, auth, Supabase, email, analytics, or route-cache behavior changes.
8. Focused tests cover signed-in/signed-out success rendering, claim rendering, safe links, and recovery form context.
9. Screenshot handoff includes desktop/mobile `before/after` artifacts for `/checkout/success` and `/claim` before `npm run verify:pre-pr`.
10. `npm run lint:briefs`, targeted tests, route/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`: pass.
  - `npm run lint:briefs:all`: pass across 327 brief files.
  - `./node_modules/.bin/vitest run tests/unit/checkout-success-page.test.tsx tests/unit/claim-page.test.tsx tests/unit/download-resend-form.test.tsx tests/unit/sign-in-context.test.ts`: pass, 4 files / 12 tests.
  - targeted route/label/support sweep: pass; fallout handled in route files, active brief, canonical queue, design inventory, support runbook, and focused tests.
  - `npm run lint`: pass.
  - `npm run typecheck`: pass.
  - `npm run lint:quality-gates`: pass.
  - `git diff --check`: pass.
- Visual gate:
  - Capture `before/after` screenshot artifacts for `/checkout/success` and `/claim`.
  - Artifact folder: `output/aw-006-checkout-claim-recovery-YYYY-MM-DD-HHMMSS`
  - Required filenames include:
    - `before-checkout-success-desktop.png`
    - `after-checkout-success-desktop.png`
    - `before-checkout-success-mobile.png`
    - `after-checkout-success-mobile.png`
    - `before-claim-desktop.png`
    - `after-claim-desktop.png`
    - `before-claim-mobile.png`
    - `after-claim-mobile.png`
  - Captured artifact folder: `output/aw-006-checkout-claim-recovery-2026-05-20-060420`.
  - Known visual caveat: mobile full-page screenshots show the existing fixed bottom navigation overlaying content at the viewport bottom in both before and after images; this is not introduced by the slice.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`: pass; full lane selected, 204 unit test files / 1151 tests passed, build passed, perf budgets passed, Playwright E2E passed with 98 passed / 478 skipped.
  - Perf budget recommendation from the gate: `hold`, because the weekly green-run count is met but worst margin is 14.7% against the 15.0% tighten threshold.
  - PR required CI checks: pass on PR `#778`, including `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `CodeQL`, `size-check`, Vercel, and Vercel Preview Comments.
  - `npm run verify:pre-merge`: pass; full lane selected, 204 unit test files / 1151 tests passed, build passed, perf budgets passed, Playwright E2E passed with 98 passed / 478 skipped; private-gate regression skipped because `SITE_LOCK_ENABLED!=1`.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands, local dev server, and Playwright screenshot commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-20 | in-progress | started from clean main@7529c73 after PR #776 and repo-managed closeout PR #777; post-merge preflight found no pending closeout; owner approved implementing the AW-006 Checkout Success And Claim Recovery Clarity slice after a short queue/review re-audit | next: update canonical queue/design inventory/support runbook, implement route-local UI/copy, add focused tests, and capture screenshot handoff before pre-pr`
- `2026-05-20 | in-progress | implemented route-local checkout success and claim recovery clarity, updated AW-006 queue/design inventory/support runbook, added focused route tests, passed targeted validation, and captured before/after desktop/mobile screenshot artifacts in output/aw-006-checkout-claim-recovery-2026-05-20-060420 | next: owner screenshot review before verify:pre-pr`
- `2026-05-20 | in-progress | owner approved screenshot handoff; no visual/rendering files changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-20 | in-progress | npm run verify:pre-pr passed in full lane; perf budget gate recommended hold because margin is 14.7% against the 15.0% tighten threshold | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-20 | done | PR #778 merged at main@c2d1caa after green local pre-merge and CI checks; repo-managed closeout moved this brief to done | next: post-merge preflight should report no pending closeout`
