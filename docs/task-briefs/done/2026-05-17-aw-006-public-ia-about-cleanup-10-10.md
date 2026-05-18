# Task Brief: AW-006 Public IA About Cleanup (10/10)

## Metadata

- `id`: `2026-05-17-aw-006-public-ia-about-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-18`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `ux/about-ia-cleanup`
- `execution mode`: `end-to-end implementation requested for the next small PR-sized AW-006 UX/UI slice; screenshot approval stop before verify:pre-pr; stop before merge`

## Brief Audit Record

- `last_audited`: `2026-05-17`
- `base`: `main@3eeba4c`
- `audit_status`: `ready`
- `decision`: Execute the AW-006 `Public IA / about cleanup` slice now and park the lower-ROI contextual sign-in audit for the next nearby auth/commerce touch.
- `reason`: The repo has a real `app/about` page that is shadowed by `next.config.ts`, while the redirect points to missing `/how-we-teach`; `/our-method` is the canonical indexed method route in nav, sitemap, and metadata.
- `must_refresh_before_execution_if`: Refresh if public nav, `/about`, `/our-method`, redirects, sitemap, metadata, app-knowledge book route inventory, scorecard categories, screenshot rules, or verification lanes change before merge.

## Goal

Make public method/about IA deterministic by retiring the stale `/about` page surface, redirecting legacy `/about` traffic to canonical `/our-method`, and making the canonical method landing credible on desktop and mobile.

## Product Decisions

- `/our-method` is the canonical public method page because it is in the main menu, sitemap, mobile screenshot baseline, and has route metadata/canonical URL.
- `/about` is a legacy alias only. It should not be indexed, navigated to, or maintained as a duplicate page.
- Because the product is not live yet, `/about` should use a temporary redirect to `/our-method`; a permanent redirect can be revisited at launch.
- `/how-we-teach` is not a real route in this repo; do not keep redirecting users there.
- Screenshot review found the existing `/our-method` presentation under-quality for a canonical method page. This slice includes a narrow method-page polish: remove the misplaced Olympics contrast line, remove the logo-heavy intro treatment, make the method itself the first-viewport signal, use blue for the primary course CTA, avoid black action/accent treatment, and keep the fixed mobile bottom nav off this content page so it does not cover method cards.
- This slice does not change sitemap inclusion for `/our-method`, introduce a new About page, or redesign the global brand/header/nav system.
- Screenshot handoff is required because public route behavior and visible method-page landing are user-facing.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- SEO and crawlability
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                           | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/our-method` is documented and tested as the canonical method page; `/about` is documented and tested as a legacy redirect only.                                                                            | redirect test + docs sweep                    | `5/5`                   |
| UX flow clarity                               | `target`     | Visiting `/about` must land on real method content with no missing `/how-we-teach` dead end.                                                                                                                 | Playwright redirect assertion + screenshot    | `5/5`                   |
| Visual design quality                         | `target`     | `/our-method` must remove the misplaced Olympics quote/logo-heavy intro, use blue primary actions with no black action/accent treatment, avoid mobile nav overlap, and present a calmer method-first layout. | before/after screenshot handoff               | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this route cleanup changes no mutations, persisted data, validation, entitlements, user state, or business truth.                                                                                | explicit route-only scope rationale           | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, content CRUD, publishing, notes, or operator editing workflow is changed.                                                                                                       | explicit admin editor scope rationale         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | `/our-method` keeps one visible H1, ordered method steps, keyboard-focusable course/contact links, header menu access, and mobile tap targets at least 44px high.                                            | role assertions + mobile nav regression test  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: removing duplicate `/about` client files should not add JS or payload; no dependency or new asset is introduced.                                                                            | dependency/file diff + broad gates            | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no local-only state, server-canonical state, browser storage, sync, retention, or conflict behavior.                                                                       | explicit state scope rationale                | `N/A`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing static redirect behavior in `next.config.ts` is updated; no route cache, revalidation, or data fetch policy changes.                                                               | redirect config review                        | `4/5`                   |
| Reliability and failure handling              | `target`     | Legacy `/about` requests must not route users to a missing page; redirect target must be an existing route.                                                                                                  | Playwright redirect test                      | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no protected route, auth check, cookie/session behavior, secret handling, user input, or authorization boundary.                                                                    | explicit security scope rationale             | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this changes no personal data, consent, policy copy, logs, payment data, auth data, or sensitive UI.                                                                                             | explicit privacy scope rationale              | `N/A`                   |
| Content governance                            | `target`     | Route inventory docs and AW-006 queue must record the canonical `/our-method` and legacy `/about` redirect decision.                                                                                         | docs updates                                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, status, mutation, Help/Guide surface, or operator editability path changes.                                                                                             | explicit admin workflow scope rationale       | `N/A`                   |
| SEO and crawlability                          | `target`     | `/our-method` remains in sitemap and canonical metadata; `/about` remains out of sitemap and temporarily redirects to `/our-method` before launch.                                                           | sitemap test + redirect test + metadata check | `5/5`                   |
| AI discoverability                            | `supporting` | Supporting only: canonical public method content becomes less ambiguous for crawlers and AI readers; no structured data model is introduced.                                                                 | route/docs review                             | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, or KPI threshold.                                                                                                     | explicit analytics scope rationale            | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no checkout, entitlement, billing, pricing, invoice, refund, portal, payout, or revenue workflow.                                                                                   | explicit commerce scope rationale             | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no support workflow, alert path, incident response process, recovery behavior, or operator diagnostic surface.                                                                             | explicit support-ops scope rationale          | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no finance data, reconciliation report, invoices, refunds, payouts, billing records, or revenue reporting.                                                                                 | explicit finance scope rationale              | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: route alias cleanup reduces one future translation/canonical-route ambiguity; no locale routing or translation workflow is introduced.                                                      | route/docs review                             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js static redirects and existing `/our-method` route; remove duplicate dead `/about` component files; add no dependency.                                                                            | code review + dependency diff                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted Playwright coverage for `/about` redirect and keep sitemap assertions aligned; run screenshot handoff before broad gates.                                                                       | targeted e2e + screenshot artifacts           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: retiring duplicate route files reduces maintenance cost and adds no runtime calls, storage, jobs, polling, or external services.                                                            | implementation review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR revert restores prior redirect/files; no migration, config secret, provider, data repair, or deploy sequencing is required.                                                                           | PR diff + rollback note                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Use the existing `/our-method` page as the reference surface and canonical destination.
  - Update the `next.config.ts` redirect from `/about` to `/our-method` as a temporary pre-launch alias.
  - Remove duplicate `app/about` route files instead of maintaining shadowed route-local markup.
  - No server action, API route, cache revalidation, or data fetch behavior changes.
- TypeScript/domain contracts:
  - No domain model changes.
  - Keep route constants as literal paths already used by nav, sitemap, and tests.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data query change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email, analytics, webhook, secret, or SDK change.
- UI system:
  - Keep `SiteChrome` as the page shell.
  - Replace the logo-heavy `PageIntro`/CTA-card stack with route-local, method-first markup because the canonical method page needs a stronger first viewport than the shared intro pattern provides.
  - Align visible actions with the established app rule: blue primary action, neutral secondary action, no black action/accent treatment unless explicitly justified.
  - Use `mobileNavMode="hidden"` on `/our-method`; it is a public content page with header menu access, and the default fixed bottom nav obscures method cards in mobile/full-page capture.
  - Keep cards shallow, use 8px radii, avoid nested cards, and make desktop/mobile layouts stable with responsive grid constraints.
  - Screenshot handoff type is `before/after` for `/about` resolving to method content and `/our-method` canonical view.
- Testing:
  - Add targeted Playwright redirect coverage.
  - Reuse existing sitemap assertions that include `/our-method` and exclude `/about`.

## Data Placement And Sync Contract

N/A with rationale: this route/IA cleanup introduces no local-only data, server-canonical data, browser storage, sync behavior, cache mutation, retention rule, or sensitive data handling.

## Identity And Rename Contract

Route identity contract:

- Canonical stable route: `/our-method`.
- Human-readable legacy alias: `/about`.
- Mutability: `/our-method` is the canonical route for method content in this slice; `/about` is not maintained as a distinct page.
- Rename vs repurpose policy: do not repurpose `/about` for different content without a new brief that updates nav, sitemap, metadata, redirects, and docs together.
- Compatibility contract: legacy `/about` temporarily redirects to `/our-method` before launch; `/how-we-teach` is not introduced in this slice.
- Observability and repair: Playwright redirect coverage and sitemap assertions catch accidental reintroduction of `/about` as indexable or dead-end route.

## Help / Guide Impact

N/A with rationale: this changes public route/IA docs and app-knowledge route inventory only. It changes no user/admin workflow labels, Help/Guide runtime content, support recovery behavior, or operator-facing admin instructions.

## Route / Label / Support Surface Sweep

- Required before broad gates because route redirects and route inventory docs are touched.
- Identifiers searched:
  - `/about`
  - `/how-we-teach`
  - `/our-method`
  - `About`
  - `Our Method`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - `docs/app-knowledge-book/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - `next.config.ts`, retired `app/about` files, `app/our-method/OurMethodClient.tsx`, targeted e2e redirect/mobile-nav tests, app-knowledge route inventory/unknowns, architecture route list, and AW-006 queue/brief.
  - No nav label change, sitemap inclusion change for `/our-method`, metadata change for `/our-method`, Help/Guide runtime change, or support runbook change unless implementation finds a direct contradiction.

## Scope

- Retire the duplicate/shadowed `app/about` route files.
- Redirect `/about` temporarily to `/our-method` for the pre-launch repo state.
- Apply a narrow `/our-method` visual cleanup: remove the misplaced Olympics quote, remove the logo-heavy intro/CTA-card treatment, present the Learn/Drill/Swim method in a cleaner desktop/mobile layout, use blue primary action treatment instead of black, and hide the default fixed mobile nav on this content page while preserving header menu access.
- Add targeted redirect coverage and keep sitemap coverage aligned.
- Update app-knowledge/architecture docs that currently treat `/about` or `/how-we-teach` as unresolved.
- Keep the parked sign-in follow-up visible in the AW-006 queue.
- Screenshot handoff artifacts.

## Out Of Scope

- Broader `/our-method` content strategy, changing main navigation labels, adding `/how-we-teach`, adding a new About page, changing sitemap inclusion for `/our-method`, changing metadata/canonical for `/our-method`, analytics instrumentation, SEO structured data, app-wide design tokens, auth, commerce, admin, Supabase, Stripe, and new dependencies.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge without explicit owner approval.

## Acceptance Criteria

1. `/about` temporarily redirects to `/our-method`.
2. `/how-we-teach` is no longer referenced as the intended `/about` redirect target in repo docs or config.
3. Duplicate `app/about` route files are removed so there is no shadowed public route surface.
4. `/our-method` remains the canonical visible method page in nav, sitemap, metadata, and screenshots.
5. App-knowledge and architecture docs no longer list the `/about` redirect as an unresolved unknown.
6. `/our-method` no longer includes the Olympics contrast line and reads as the method page, not a generic/logo page, on desktop and mobile.
7. `/our-method` primary CTA uses blue action treatment; no changed method-page action or step accent uses black as the action/accent color.
8. `/our-method` mobile rendering has no fixed bottom-nav overlap and still exposes the header menu.
9. Targeted redirect/sitemap/mobile-nav tests pass.
10. Screenshot handoff covers the changed legacy redirect and canonical method surface before broad gates.

## Validation

- `npm run lint:briefs`
- Targeted:
  - `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx`
  - `npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/sitemap.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/mobile-nav.spec.ts -g "method page hides fixed mobile nav" --project=mobile-chromium`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/public-ia-about-cleanup-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - filenames: `before-about-legacy-redirect-desktop-1440.png`, `after-about-legacy-redirect-desktop-1440.png`, `before-our-method-mobile-390.png`, `after-our-method-mobile-390.png`
- Owner screenshot approval or correction pass before PR creation/update and broad gates.
- After screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-17 | in-progress | started from clean main@3eeba4c after Plans conversion baseline #737 and closeout #738; post-merge preflight found no repo-managed closeout; contextual sign-in audit was parked as planned follow-up; branch ux/about-ia-cleanup created; scope limited to /about legacy redirect, /our-method canonical IA, targeted tests/docs, and screenshot handoff | next: implement redirect/files/docs/tests, run targeted validation, then capture before/after screenshots before broad gates`
- `2026-05-17 | screenshot-review | implemented /about legacy redirect cleanup by pointing /about to /our-method, deleting the shadowed app/about route files, adding targeted public IA redirect coverage, and updating app-knowledge/architecture docs so /how-we-teach is no longer the intended route target; route-label/support sweep searched /about, /how-we-teach, /our-method, About, and Our Method across app, components, tests, docs, app-knowledge, architecture, and AW-006 briefs; targeted validation passed with npm run lint:briefs:all, npx playwright test tests/e2e/sitemap.spec.ts --project=desktop-chromium, npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium after a locator-only test fix, and git diff --check; before/after screenshots captured in output/public-ia-about-cleanup-2026-05-17-211645 using main@3eeba4c as the before worktree | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-17 | screenshot-correction | owner rejected the first /our-method visual quality and flagged the Olympics quote as misplaced; corrected the slice to use a temporary pre-launch /about redirect, replace the logo-heavy method page with a method-first desktop/mobile layout, remove the Olympics contrast line, and hide the fixed mobile bottom nav on /our-method while preserving header menu access; targeted validation passed with npm run lint:briefs:all, npm run typecheck after clearing stale generated Next validators, git diff --check, npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium, npx playwright test tests/e2e/sitemap.spec.ts --project=desktop-chromium, and npx playwright test tests/e2e/mobile-nav.spec.ts -g "method page hides fixed mobile nav" --project=mobile-chromium; regenerated before/after screenshots in output/public-ia-about-cleanup-2026-05-17-213857 using main@3eeba4c as the before worktree and Webpack for after-capture after a Turbopack generated-CSS corruption | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-17 | screenshot-correction-2 | owner correctly flagged that the primary CTA still used black action treatment, which violates the established visual rule that primary actions should be blue and black should not be used as an action/accent color without explicit justification; changed the method-page primary CTA to the app blue gradient, kept the contact CTA neutral, converted the third step badge away from dark slate, and documented the no-black action/accent acceptance criterion; targeted validation passed with npm run lint:briefs:all, npm run typecheck, git diff --check, npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium, npx playwright test tests/e2e/sitemap.spec.ts --project=desktop-chromium, and PW_PORT=3102 npx playwright test tests/e2e/mobile-nav.spec.ts -g "method page hides fixed mobile nav" --project=mobile-chromium after one expected port-collision rerun; regenerated before/after screenshots in output/public-ia-about-cleanup-2026-05-17-215131 with direct assertions for no Olympics copy, blue gradient primary CTA, and no fixed mobile nav on /our-method | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | screenshot-approved | owner approved refreshed before/after screenshot handoff in output/public-ia-about-cleanup-2026-05-17-215131; no product-rendering files changed after that capture before broad gate start | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
- `2026-05-18 | pre-pr-repair | first npm run verify:pre-pr stopped in tests/unit/dryland-micro-plan-panel.test.tsx because the fixed test plan week ended at 2026-05-18T00:00:00.000Z and current Date.now made the component render its earlier-week collapsed state; hardened that unit fixture with a Date.now stub inside the active week without changing product behavior; targeted repair validation passed with ./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx | next: rerun npm run verify:pre-pr`
- `2026-05-18 | pre-pr-green | npm run verify:pre-pr passed on the full lane after the date-sensitive unit repair: lint/quality gates, typecheck, 1098 unit tests, production build, performance budgets, and Playwright e2e with 93 passed / 447 expected skipped; no product-rendering files changed after screenshot capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-18 | merged | PR #740 merged as ea1d71f after GitHub CI passed, including verify in 12m44s, and npm run verify:pre-merge passed locally on the full lane; post-merge preflight surfaced this repo-managed docs-only closeout, so the brief moved from in-progress to done | next: no follow-up inside this closed brief; continue from the AW-006 planned queue`
