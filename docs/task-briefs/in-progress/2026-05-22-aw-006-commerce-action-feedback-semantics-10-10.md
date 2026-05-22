# Task Brief: AW-006 Commerce Action Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-22-aw-006-commerce-action-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-commerce-action-feedback-semantics`

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@016b2e5`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 slice as a bounded commerce action feedback semantics pass.
- `reason`: `main` is clean after PR `#808` and repo-managed closeout `#809`; post-merge preflight was reported green with no pending closeout. The queue/design/code re-audit found checkout start, billing portal, and download access resend feedback still using local inline text without consistent status/error semantics while the flows already have focused tests and can be improved without touching Stripe/API behavior.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, checkout/portal/download resend APIs, Stripe integration behavior, commerce recovery copy, `DownloadResendForm`, `CheckoutButton`, `PortalButton`, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make commerce action feedback easier to perceive and more accessible on checkout start, billing portal, and access-link resend actions without changing payment, entitlement, email, analytics, or API behavior.

## Pre-Implementation Owner Explanation

Vi rydder opp i sma meldinger rundt kjop og tilgang: nar checkout apnes, fakturaportalen apnes, eller brukeren ber om ny tilgangslenke pa e-post. Det betyr noe fordi brukeren skal forsta om noe jobber, gikk bra, eller feilet, uten a bli usikker pa om betaling eller tilgang er odelagt. Utenfor scope er Stripe, priser, betaling, tilgangsrettigheter, e-postsending, API-er, analytics og produktflyt; vi endrer bare hvordan eksisterende feedback vises og leses av skjermleser.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Commerce and revenue ops`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Checkout, billing portal, and access-link resend feedback stays attached to the existing commerce actions and does not add new navigation or decision points.             | component diff + route screenshots                                    | `5/5`                   |
| UX flow clarity                               | `target`     | Pending, success, and error states for the scoped actions are visible, specific, and recoverable without dead-end states or contradictory payment/access claims.          | focused component tests + screenshot handoff                          | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses restrained existing commerce/member styling and consistent spacing/tone without redesigning cards, routes, or checkout presentation.                        | screenshot handoff + class review                                     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fetch URLs, request methods, request payloads, redirect/navigation calls, analytics event name/payload, resend normalization, and error fallbacks remain unchanged.       | component tests + diff review                                         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches public/member commerce action feedback only and changes no admin editor, admin workflow, or operator CRUD surface.                         | admin scope rationale                                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic pending/success/error feedback is exposed through explicit status or alert semantics, with no noisy live region when no feedback exists.                          | unit assertions for roles/aria-live + screenshot/manual review        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, no new route, no additional fetch, and no material JS payload increase beyond local markup/class changes.                             | package diff + pre-pr gate                                            | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI feedback cleanup introduces no new browser storage, server-canonical data, sync, conflict, retention, or sensitive-data behavior.                     | data contract section                                                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, revalidation trigger, stale-data policy, or invalidation behavior changes.                                             | cache scope rationale                                                 | `N/A`                   |
| Reliability and failure handling              | `target`     | API failures still surface the existing safe fallback messages; pending state clears on failure; successful resend feedback remains non-enumerating.                      | focused failure tests                                                 | `5/5`                   |
| Security and authz                            | `target`     | Protected checkout/portal/download-resend routes, authz checks, cookies, credentials, secrets, customer IDs, and entitlement boundaries remain untouched and fail-closed. | unchanged API diff review + existing route tests remain in broad gate | `5/5`                   |
| Privacy and compliance                        | `target`     | Feedback must not reveal whether an email owns a purchase and must not expose customer, session, entitlement, or provider details.                                        | resend tests + copy/diff review                                       | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: user-visible feedback copy changes stay local to commerce action components and require no Help/Guide update unless workflow labels change.              | component copy diff + Help/Guide impact rationale                     | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, admin editability, publish status, or operator recovery procedure changes.                                                          | admin workflow scope rationale                                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                         | SEO scope rationale                                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract.                                  | AI-discoverability scope rationale                                    | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing analytics event name and payload for checkout start remain unchanged; no new analytics taxonomy or PII payload is introduced.                                    | checkout button tests + diff review                                   | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout session creation, cancel path tagging, portal session creation, resend request payload, entitlement recovery expectations, and Stripe handoff stay unchanged.    | focused tests + route/API diff review                                 | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                             | support-ops scope rationale                                           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                  | finance scope rationale                                               | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: changed strings remain simple component-local English copy; no translation workflow or locale route contract changes.                                    | copy review                                                           | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React client components, Tailwind/token classes, Testing Library, and Stripe-hosted checkout/Customer Portal patterns; add no dependency.                  | package diff + component diff                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused component coverage for pending/success/error semantics; run targeted tests, brief lint, screenshot handoff, and broad gates after screenshot approval. | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge`    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the slice improves local UX states without adding runtime services, polling, infrastructure, provider calls, or recurring cost.                        | no new dependency/service diff                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                 | git diff review + validation gates                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `GuidePdfDownloadButton` for compact action feedback semantics, `DownloadResendForm` route-owned recovery usage on `/checkout/success` and `/claim`, and existing `/plans`/`/my-library` commerce action placement.
  - Keep `CheckoutButton`, `PortalButton`, and `DownloadResendForm` as client components; do not move server/client boundaries.
  - Route/action/API boundary: `/api/checkout/session`, `/api/portal`, and `/api/download/resend` remain unchanged.
  - Cache/revalidation: no cache, revalidation, or route data behavior changes.
- TypeScript/domain contracts:
  - Preserve response shapes, request bodies, analytics event payloads, redirect/navigation calls, resend email normalization, and fallback error strings.
  - Deterministic invariants: pending feedback appears only while pending, errors appear only after failure/validation failure, success appears only after resend success, and absent feedback has no live-region noise.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - Stripe best-practice baseline: continue using Stripe-hosted Checkout Sessions and Customer Portal; no SDK/API version, webhook, secret, retry, idempotency, or provider behavior changes.
  - Email/resend behavior remains behind the existing app API route.
- UI system:
  - Use existing Tailwind classes and commerce/member token direction.
  - Do not introduce an app-wide notice primitive; this is a bounded commerce action semantics pass.
  - Screenshot handoff comparison type: `after/reference`, comparing scoped commerce feedback states to the recently polished guide PDF action feedback where practical.
- Testing:
  - Update focused component tests for `CheckoutButton`, `PortalButton`, and `DownloadResendForm`.
  - Screenshot handoff is required before `npm run verify:pre-pr` because rendered UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI feedback cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Existing checkout, portal, and download-resend API contracts remain the only source of commerce truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing product IDs, Stripe customer/session identifiers, entitlement identities, and resend source values are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing commerce workflow labels, recovery action meaning, support procedures, Help/Guide assertions, Stripe behavior, and entitlement recovery behavior. Help/Guide or runbook updates are required only if implementation changes workflow labels, action meaning, recovery behavior, auth, payments, or support procedures; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted commerce surface sweep because this slice changes visible feedback semantics near purchase/recovery actions without changing workflow behavior.

- Terms to sweep before broad gates:
  - `Could not start checkout.`
  - `Opening checkout...`
  - `Could not open billing portal right now. Please try again.`
  - `Opening billing...`
  - `Email me access link`
  - `Sending...`
  - `RESEND_DOWNLOAD_GENERIC_MESSAGE`
  - `DownloadResendForm`
  - `CheckoutButton`
  - `PortalButton`
- Surfaces to check:
  - `components/my-library/CheckoutButton.tsx`
  - `components/my-library/PortalButton.tsx`
  - `components/commerce/DownloadResendForm.tsx`
  - `app/plans/page.tsx`
  - `app/checkout/success/page.tsx`
  - `app/claim/page.tsx`
  - `components/my-library/MyLibraryHub.tsx`
  - `tests/unit/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
- Expected fallout:
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide update unless workflow labels or recovery instructions change.

## Scope

- Improve scoped feedback semantics in:
  - `components/my-library/CheckoutButton.tsx`
  - `components/my-library/PortalButton.tsx`
  - `components/commerce/DownloadResendForm.tsx`
- Update focused unit/component tests under `tests/unit/`.
- Update this active brief, the canonical AW-006 queue, and design inventory where needed.
- Capture screenshot handoff artifacts before PR gates.

## Out Of Scope

- Stripe Checkout Session API behavior, Customer Portal API behavior, webhook behavior, entitlement upserts, checkout session payloads, portal session payloads, resend API payload shape, email delivery, finance reporting, refunds, invoices, payouts, tax, pricing, product catalog, auth, Supabase, analytics taxonomy, package dependencies, migrations, environment variables, secrets, workflows, or merge to `main`.
- Route redesigns for `/plans`, `/my-library`, `/checkout/success`, or `/claim`.
- Changing purchase, billing, resend, or recovery workflow labels or support procedures.
- App-wide notice/empty-state primitive rollout.
- Poolside export/image/PDF generation.

## Acceptance Criteria

1. Checkout start, billing portal, and download access resend feedback expose pending/success/error states with explicit, appropriate status/alert semantics.
2. Existing requests, payloads, redirects, analytics event payloads, fallback errors, resend privacy behavior, and button labels remain unchanged.
3. Focused tests cover pending and error semantics for checkout/portal plus validation, pending, success, and error semantics for download resend.
4. Screenshot handoff includes representative changed commerce feedback states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`: passed on 2026-05-22; changed-brief detector skipped in this local state.
  - `npm run lint:briefs:all`: passed on 2026-05-22 after queue wording cleanup.
  - `npm exec vitest run tests/unit/checkout-button.test.tsx tests/unit/portal-button.test.tsx tests/unit/download-resend-form.test.tsx`: passed, 3 files / 11 tests.
  - `npm run typecheck`: passed on 2026-05-22.
  - targeted route/label/support sweep: completed for scoped commerce terms and expected surfaces.
  - `git diff --check`: passed on 2026-05-22.
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before `npm run verify:pre-pr`
  - Captured artifact folder: `output/aw-006-commerce-feedback-2026-05-22-213908`
  - Captured: `2026-05-22 21:43`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-commerce-checkout-pending-desktop.png`
    - `after-commerce-portal-error-desktop.png`
    - `after-commerce-resend-success-mobile.png`
    - `reference-guide-pdf-pending-desktop.png`
  - Known visual caveat: screenshots use a temporary local visual route with mocked commerce/PDF API responses so the scoped states can be compared without real Stripe, auth, email, entitlement, or PDF calls. The temporary route and capture script were removed after capture; no scoped product components or styles changed after the final capture.
- Broad gates after screenshot approval:
  - owner approved screenshot handoff on 2026-05-22.
  - `npm run verify:pre-pr`: passed on 2026-05-22; full lane, including lint, typecheck, unit, build, performance budgets, and E2E; log `artifacts/test-runs/20260522-214744/verify.log`.
  - required PR CI checks
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-22 | in-progress | created active AW-006 commerce action feedback semantics brief on branch aw-006-commerce-action-feedback-semantics from clean main@016b2e5; scope limited to existing checkout start, billing portal, and download access resend feedback semantics | next: implement bounded component/test changes and capture screenshot handoff before broad gates`
- `2026-05-22 | in-progress | implemented commerce-local feedback semantics, updated focused tests, passed targeted validation, and captured after/reference screenshot artifacts in output/aw-006-commerce-feedback-2026-05-22-213908 | next: wait for owner screenshot approval before npm run verify:pre-pr and PR handoff`
- `2026-05-22 | in-progress | owner approved screenshot handoff and npm run verify:pre-pr passed on the full lane with log artifacts/test-runs/20260522-214744/verify.log | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
