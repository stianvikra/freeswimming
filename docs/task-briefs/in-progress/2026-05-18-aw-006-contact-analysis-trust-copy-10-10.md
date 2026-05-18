# Task Brief: AW-006 Contact And Analysis Trust Copy (10/10)

## Metadata

- `id`: `2026-05-18-aw-006-contact-analysis-trust-copy-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-18`
- `updated`: `2026-05-18`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-contact-analysis-trust-copy`

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@b9f3b7d`
- `audit_status`: `ready`
- `decision`: Execute the next small AW-006 UX/UI slice on the public `/contact` and `/analysis` request surfaces.
- `reason`: Contextual sign-in clarity and closeout shipped through `#746/#747`, leaving the AW-006 phase-plan item "Strengthen contact/analysis trust copy, response expectation, and input guidance" as a small public UX slice with limited route/component/test scope.
- `must_refresh_before_execution_if`: Refresh if `/contact`, `/analysis`, `ContactForm`, contact API contracts, mobile nav safe-area rules, AW-006 scope, scorecard categories, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make `/contact` and `/analysis` clearer and more trustworthy by stating expected reply timing, safe information boundaries, and useful input guidance without changing contact submission behavior.

## Mature Reference Surfaces

- `/programs` and `/our-method` are the public AW-006 references for unframed page layout, token-backed cards/actions, and 8px controls.
- Existing `ContactForm` validation, labels, focus behavior, and anti-spam payload contract are the behavior reference and must stay intact.
- `preview_access_notify` and `goals_coaching` variants are compatibility references; this slice should avoid changing their flow except for shared non-breaking presentation primitives when unavoidable.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/contact` remains the general request path and `/analysis` remains the video-feedback request path, with clearer purpose and no route identity change.                  | contact/analysis e2e assertions + screenshots              | `5/5`                   |
| UX flow clarity                               | `target`     | Users see reply expectation, what to include, and safe information boundaries before submitting; primary submit actions remain obvious on desktop/mobile.                | unit/e2e copy assertions + screenshot review               | `5/5`                   |
| Visual design quality                         | `target`     | Changed public request surfaces use unframed layout, token-backed 8px cards/actions where touched, no nested-card composition for contact/analysis, and no clipped text. | computed-style e2e + before/after screenshots              | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: form validation, honeypot, payload shape, API route, and submission variants must remain unchanged while copy/layout changes.                           | contact unit tests + API/security tests by gate            | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, admin content CRUD, publishing, notes, or operator editing workflow is touched.                                                             | explicit admin editor scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | H1s, labels, helper text, error region, keyboard focus, button names, and mobile tap targets remain accessible with no new serious/critical a11y issue.                  | contact-form e2e + role/label assertions + screenshots     | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Add no dependency, no image/media asset, no API call, and no new client component boundary beyond existing `ContactForm` usage.                                          | package diff review + build/pre-pr gates                   | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no new local-only data, server-canonical data, browser storage, sync, conflict handling, or data retention behavior.                   | data contract review                                       | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, mutation response, or invalidation behavior changes.                                                  | cache scope review                                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing validation, retryable send failure, and success states remain deterministic; new copy must not hide or weaken recovery/error messaging.                         | unit tests + contact-form a11y e2e                         | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: public form remains unprotected, but user-facing copy must not request passwords, sign-in codes, payment details, or secrets.                           | copy assertions + contact API security gate                | `4/5`                   |
| Privacy and compliance                        | `target`     | Request guidance explicitly discourages payment details, sign-in codes, and passwords; no sensitive data is added to logs/events/UI diagnostics.                         | visible-copy tests + diff review                           | `5/5`                   |
| Content governance                            | `target`     | AW-006 queue and this brief record the active slice, truthful response expectations, and no API/delivery guarantee beyond existing support contract.                     | brief + canonical queue update                             | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, status, mutation, Help/Guide surface, or operator edit path changes.                                                                | explicit admin workflow scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route copy and H1s remain crawlable; no metadata, sitemap, robots, canonical, or structured data change.                                         | route markup review + public route tests                   | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public request page semantics become clearer, but no structured data/entity contract or AI-facing documentation changes.                                | route copy review                                          | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics payload, dashboard, logging, or funnel instrumentation changes.                                                                 | analytics scope review                                     | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: `/analysis` lead-gen copy becomes clearer, but no pricing, checkout, entitlement, invoice, refund, payout, or revenue reporting behavior changes.       | route/CTA review                                           | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this public copy/layout slice changes no alert path, support workflow, recovery behavior, support diagnostics, or incident runbook.                                 | explicit support-ops scope rationale                       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, or provider financial data.                                    | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new English copy stays short, grouped, and avoids grammar-coupled dynamic fragments; no locale routing or translation workflow is introduced.           | copy review                                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, `ContactForm`, `PressButton`, existing token utilities/Tailwind, and current Vitest/Playwright stack; add no dependency.                             | architecture review + package diff review                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Update targeted unit/e2e coverage for visible copy, safe-area, and token-backed radii; capture screenshot handoff before broad gates.                                    | targeted tests + screenshot handoff + later gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: static copy/layout changes add no storage, polling, external service use, media asset, or traffic-dependent cost pattern.                               | diff review                                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR revert restores prior public request surfaces; no migration, dependency, env, provider, or release flag rollback is required.                                     | git diff review + pre-pr/pre-merge gates after screenshots | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/contact` and `/analysis` as route-local public pages using `SiteChrome`.
  - Move only the default `/contact` and `/analysis` presentation to the public unframed layout pattern; keep `preview_access_notify` and `goals_coaching` compatibility behavior intact.
  - Do not introduce server actions, API routes, redirects, metadata, sitemap, cache, or revalidation changes.
- TypeScript/domain contracts:
  - Preserve `ContactForm` variant names, validation, status model, honeypot, and `POST /api/contact` payload shape.
  - Static copy/view data may be typed inside `ContactForm`.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, or database path changes.
- External services/tools:
  - Contact delivery/provider behavior remains unchanged. Do not alter SMTP/One.com/Resend config, Upstash rate limiting, retries, idempotency, secrets, or diagnostics.
- UI system:
  - Reuse AW-006 public token utilities and 8px card/control radii where this slice touches cards/actions.
  - No nested cards for default `/contact` or `/analysis`.
  - Screenshot handoff type: `before/after` for `/contact` mobile/desktop and `/analysis` mobile/desktop.
- Testing:
  - Unit: `ContactForm` visible copy, validation, and unchanged payload behavior.
  - E2E: labels/a11y, public copy, token radii, mobile safe-area.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no local-only state beyond existing form fields, no new server-canonical data, no browser storage, no sync/conflict policy, no data retention change, and no cache invalidation behavior.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename policy, alias, or redirect behavior.

## Help / Guide Impact

N/A with rationale: this slice changes public request-page guidance only. It changes no admin/user workflow label, auth recovery behavior, payment flow, Help/Guide assertion, runbook instruction, or operator-facing support surface.

## Route / Label / Support Surface Sweep

Required because public request-page labels, trust copy, and mobile layout are touched.

- Identifiers searched:
  - `/contact`
  - `/analysis`
  - `Video Analysis`
  - `Send message`
  - `Send`
  - `24-48 hours`
  - `payment details`
  - `sign-in code`
  - `ContactForm`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/app-knowledge-book/`
  - `docs/runbooks/`
- Expected fallout:
  - `app/contact/page.tsx`
  - `app/analysis/page.tsx`
  - `components/ContactForm.tsx`
  - targeted contact/IA/mobile tests
  - this brief and the canonical AW-006 queue
  - no contact API, provider, secrets, Help/Guide runtime, sitemap, metadata, Stripe, Supabase, or admin workflow changes

## Failure-Mode Evidence

- Existing required-field, invalid-email, send-failure, and success behavior must remain visible and recoverable.
- Copy must not make response timing look like a delivery guarantee or ask for sensitive information.
- Targeted tests should cover validation focus, unchanged preview notify behavior, visible trust guidance, and safe-area clearance.

## Scope

- Create this in-progress child brief.
- Refresh the canonical AW-006 UX/UI queue to mark Contextual Sign-In shipped and this slice active.
- Update default `/contact` and `/analysis` layout/copy to improve trust, reply expectation, privacy boundary, and message guidance.
- Keep `preview_access_notify` and `goals_coaching` behavior compatible.
- Add/update targeted unit/e2e tests.
- Capture before/after desktop and mobile screenshots for `/contact` and `/analysis`.

## Out Of Scope

- Contact API validation, spam/rate limiting, provider delivery, admin messages, SMTP/One.com/Resend, Upstash, Supabase, Stripe, checkout, entitlements, analytics, metadata/sitemap/robots, Help/Guide runtime, app-wide design-system rollout, new dependencies, and new assets.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge to `main`.

## Acceptance Criteria

1. `/contact` and `/analysis` show clear reply expectation and useful input guidance before submission.
2. Visible guidance tells users not to send payment details, sign-in codes, or passwords.
3. Default `/contact` and `/analysis` avoid nested-card composition and use token-backed 8px cards/actions where changed.
4. Existing labels, focus-on-validation, success state, and submission payload behavior remain unchanged.
5. `preview_access_notify` remains minimal and still submits without a message.
6. Mobile submit actions clear the fixed bottom nav, and desktop/mobile screenshots show no overlapping text or clipped controls.
7. Targeted unit/e2e validation and `git diff --check` pass before screenshot handoff.
8. `npm run verify:pre-pr`, PR/CI, and `npm run verify:pre-merge` run only after owner screenshot approval.

## Validation

- Targeted:
  - `./node_modules/.bin/vitest run tests/unit/contact-form.test.tsx tests/unit/design-token-contract.test.ts`
  - `npx playwright test tests/e2e/contact-form-a11y.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/mobile-bottom-nav-safe-area.spec.ts --project=mobile-chromium`
  - `npm run lint:briefs`
  - `git diff --check`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/contact-analysis-trust-copy-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - representative filenames: `before-contact-mobile-390.png`, `after-contact-mobile-390.png`, `before-analysis-desktop-1440.png`, `after-analysis-desktop-1440.png`
- Owner screenshot approval or correction pass before PR creation/update and broad gates.
- After screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-18 | in-progress | started from clean main@b9f3b7d after Contextual Sign-In Clarity #746 and closeout #747; post-merge preflight found no repo-managed closeout; branch aw-006-contact-analysis-trust-copy created; selected the AW-006 phase-plan contact/analysis trust-copy slice because it is public, visual, and isolated from contact API/provider behavior | next: refresh queue, implement copy/layout, run targeted tests, then capture screenshot handoff before broad gates`
- `2026-05-18 | screenshot-review | refreshed the AW-006 queue, implemented public unframed `/contact`and`/analysis`request layouts, added reply expectation/trust/privacy/input guidance, preserved preview notify and contact payload behavior, and updated targeted tests; targeted validation passed with ./node_modules/.bin/vitest run tests/unit/contact-form.test.tsx tests/unit/design-token-contract.test.ts, npm run lint, npm run typecheck, npm run lint:briefs:all, git diff --check, npx playwright test tests/e2e/contact-form-a11y.spec.ts --project=desktop-chromium, npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium, and npx playwright test tests/e2e/mobile-bottom-nav-safe-area.spec.ts --project=mobile-chromium after updating the contact safe-area assertion to the same scrolled-into-view contract as analysis; route-label/support sweep searched /contact, /analysis, Video Analysis, Send message, 24-48 hours, payment details, sign-in code, and ContactForm across app, components, tests, docs/task-briefs, docs/app-knowledge-book, and docs/runbooks with expected fallout only in public routes, ContactForm, targeted tests, and AW-006 briefs; owner flagged the squeezed PageIntro logo as a systemic bug, so PageIntro now uses a symbol-ratio container and the public IA test asserts`/analysis`brand natural/rendered ratio to prevent recurring route-by-route fixes; regenerated before/after screenshots plus after mobile submit-position screenshots in output/contact-analysis-trust-copy-2026-05-18-141600 after the PageIntro fix, with`/analysis` logo natural ratio 1.617 and rendered ratio 1.583 | next: get owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | screenshot-approved | owner approved screenshot handoff in output/contact-analysis-trust-copy-2026-05-18-141600; no product-rendering files changed after screenshot capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-18 | pre-pr-pass | npm run verify:pre-pr passed full lane on code/test/doc diff with lint, typecheck, unit, build, perf budgets, and E2E (98 passed, 472 skipped); perf trend reported 6 consecutive weekly green runs and recommended tightening one stretch target, recorded as out-of-scope for this contact/analysis UI slice and to carry in the PR summary | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
