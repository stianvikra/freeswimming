# Task Brief: AW-006 Programs Poolside PDF Token Polish (10/10)

## Metadata

- `id`: `2026-05-18-aw-006-programs-poolside-pdf-token-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-18`
- `updated`: `2026-05-18`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-programs-token-polish`

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@7778eca`
- `audit_status`: `ready`
- `decision`: Execute the next small AW-006 UX/UI slice on `/programs` by applying the new token proof to the Poolside PDF/public programs card surface.
- `reason`: Public IA cleanup and the first design token proof are shipped through `#740/#741` and `#742/#743`; `/programs` is a public AW-006 route, already appears in the mobile screenshot matrix, and the before screenshot shows the fixed mobile nav overlapping the Poolside PDF CTA.
- `must_refresh_before_execution_if`: Refresh if `/programs`, `SiteChrome` mobile nav behavior, token utilities in `app/globals.css`, screenshot handoff rules, AW-006 scope, or scorecard categories change before PR handoff.

## Goal

Make `/programs` feel like a credible Poolside PDF/program surface by using the AW-006 token foundation, removing the mobile bottom-nav overlap, and preserving the public route/CTA contract.

## Mature Reference Surfaces

- Poolside Guide and Poolside/PDF print are the primary reference surfaces for content intent and visual credibility.
- `/our-method` is the route-local token proof reference for public-page token usage and 8px cards/actions.
- Swim session builder, micro sessions, dryland training, and habits remain quality references only; this slice does not migrate those surfaces.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/programs` remains the public Swim Programs page, with Poolside PDF and Video Analysis paths still visible and route identity unchanged.                                | public IA e2e + screenshot review                     | `5/5`                   |
| UX flow clarity                               | `target`     | Mobile `/programs` has no fixed bottom-nav overlap on cards or CTAs; header menu remains available; CTA labels and destinations stay understandable.                     | mobile-nav e2e + before/after screenshots             | `5/5`                   |
| Visual design quality                         | `target`     | Program cards and CTAs use the token foundation, 8px card/control radii, calm hierarchy, and no nested-card composition or clipped text on desktop/mobile.               | token unit test + computed-style e2e + screenshots    | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no mutations, persisted data, validation, entitlements, checkout, guide progress, or business truth.                                      | explicit UI-only scope rationale                      | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor surface, admin CRUD, content publishing, or operator workflow is touched.                                                                    | scope review                                          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | `/programs` keeps one visible H1, semantic sections/lists, keyboard-focusable links, header menu access, and 44px minimum touch targets.                                 | public IA e2e + mobile-nav e2e + screenshot review    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/programs` adds no dependency, no image/media asset, no API call, and no new client bundle surface beyond existing route-local React and CSS.                           | package diff review + pre-pr/build gates              | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local-only data, server-canonical data, browser storage, sync, conflict handling, or cache mutation is introduced.                                        | data contract review                                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, or invalidation behavior changes.                                                                     | cache scope review                                    | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: route remains static and rollback is simple; no loading/error/retry behavior is introduced.                                                             | diff review + broad gates                             | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, auth boundary, cookie/token handling, input surface, or API route changes.                                                               | security scope review                                 | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, analytics payload, consent/legal text, PII, logs, or raw env values are touched.                                                               | privacy scope review                                  | `N/A`                   |
| Content governance                            | `target`     | Public copy remains truthful about Poolside PDF/offline guide intent and video analysis; canonical AW-006 queue records this active slice.                               | brief + canonical queue update + screenshot review    | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, status, mutation, Help/Guide surface, or operator editability path changes.                                                         | explicit admin workflow scope rationale               | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/programs` remains crawlable with unchanged route and H1; no metadata, sitemap, robots, canonical, or structured data change.                          | public IA e2e + diff review                           | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: visible program content becomes clearer for AI/crawlers, but no structured data or AI-facing documentation contract changes.                            | route markup review                                   | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, tracking payload, dashboard, funnel, or logging behavior changes.                                                                         | analytics scope review                                | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: public paid/lead-gen CTAs remain present, but no pricing, checkout, entitlement, invoice, refund, payout, or revenue reporting behavior changes.        | CTA href assertions + scope review                    | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this public visual slice changes no alert path, support workflow, recovery behavior, support diagnostics, or incident runbook.                                      | explicit support-ops scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, or provider financial data.                                    | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this slice changes only existing English public route copy and introduces no locale routing, translation workflow, or grammar-coupled dynamic string contract.      | explicit i18n scope rationale                         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next/React route-local markup, `SiteChrome`, `PressLink`, `cx`, CSS custom properties, and Tailwind classes; add no dependency or design library.           | diff review + package diff review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted token/unit coverage, public IA coverage, mobile-nav coverage, screenshot handoff before broad gates, then run `verify:pre-pr` only after screenshot review. | targeted tests + screenshot handoff + later gates     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token reuse reduces future public-route styling drift; no runtime cost model, storage, polling, or external service usage changes.                      | CSS/token review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is reversible by reverting `/programs`, token utility additions, tests, and this brief; no migration, dependency, or release flag rollback is needed.             | git diff review + pre-pr/pre-merge gates after review | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference route: `/our-method` for token-backed public-page composition.
  - Keep `/programs` as route-local client markup with no server action, API route, redirect, cache, metadata, or sitemap change.
  - Use `SiteChrome mobileNavMode="hidden"` so this public content page does not render a fixed nav over its CTA surface; header menu remains the navigation affordance.
- TypeScript/domain contracts:
  - No domain types, parsers, mutations, validation, or error models change.
  - Static display arrays may be used for card content.
- Supabase/data layer:
  - N/A; no schema, migration, RLS/authz, generated type, or storage path changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email, analytics, webhook, SDK, secret, or deployment setting changes.
- UI system:
  - Reuse the AW-006 token foundation from `app/globals.css`.
  - Program card/action radii must stay at 8px via token-backed classes.
  - No nested cards; sections are route-local cards on an unframed public layout.
  - Screenshot handoff type: `before/after` for `/programs` desktop and mobile.
- Testing:
  - Unit: token utility contract.
  - E2E: `/programs` IA/CTA/token radius and mobile fixed-nav absence/header menu access.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive data handling, cache invalidation, or route data fetch.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, or redirect behavior.

## Help / Guide Impact

N/A with rationale: this slice changes a public marketing/content route only. It changes no admin/user workflow label, recovery behavior, Help/Guide assertion, auth flow, payment flow, runbook instruction, or operator-facing support surface.

## Route / Label / Support Surface Sweep

Required because `/programs` visible route content and mobile nav behavior change.

- Identifiers searched before PR handoff:
  - `/programs`
  - `Swim Programs`
  - `Poolside PDF`
  - `mobile-nav-programs`
  - `fs-program-card`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/app-knowledge-book/`
  - `docs/runbooks/`
- Expected fallout:
  - route-local `/programs` markup,
  - token contract test,
  - public IA/mobile-nav tests,
  - this brief and the canonical AW-006 queue.
  - no Help/Guide runtime update.

## Scope

- Create this in-progress child brief.
- Refresh the canonical AW-006 UX/UI queue to mark Public IA and Design Token proof shipped and this slice active.
- Update `/programs` route-local visual hierarchy, cards, CTAs, and mobile nav mode.
- Add token-backed program card utilities in `app/globals.css`.
- Add/update targeted tests.
- Capture before/after desktop and mobile screenshots for `/programs`.

## Out Of Scope

- Poolside Guide entitlement logic, PDF generation, print/PDF artifact layout, checkout, Stripe, Supabase, analytics, admin content, Help/Guide, sitemap/metadata, app-wide design-system rollout, and migration of swim session builder, micro sessions, dryland training, habits, Poolside Guide, or PDF/print internals.
- New images/assets or dependencies.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge to `main`.

## Acceptance Criteria

1. `/programs` still exposes one visible `Swim Programs` H1.
2. Poolside PDF and Video Analysis cards remain visible with truthful copy and correct CTA destinations.
3. Changed cards and CTAs use token-backed 8px radii.
4. Mobile `/programs` no longer renders the fixed bottom nav over content and still exposes the header menu.
5. Desktop and mobile `/programs` screenshots show no overlapping text, clipped controls, or incoherent fixed UI.
6. Targeted token, public IA, mobile-nav tests and `git diff --check` pass before screenshot handoff.
7. `npm run verify:pre-pr`, PR/CI, and `npm run verify:pre-merge` run only after owner screenshot approval.

## Validation

- Targeted:
  - `npx vitest run tests/unit/design-token-contract.test.ts`
  - `npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/mobile-nav-state.spec.ts --project=mobile-chromium`
  - `npm run lint:briefs`
  - `git diff --check`
- Screenshot:
  - `before/after` `/programs` desktop and mobile screenshots in `output/programs-token-polish-2026-05-18-100027/`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-18 | in-progress | started from clean main@7778eca after AW-006 design token proof closeout #743; post-merge preflight found no closeout; created branch aw-006-programs-token-polish; selected /programs as the next small AW-006 public UX/UI slice because public IA and design-token proof are already shipped and before screenshots show fixed mobile nav overlap on the Poolside PDF CTA | next: implement tokenized /programs layout, targeted tests, and after screenshots before owner screenshot approval`
- `2026-05-18 | screenshot-review | implemented route-local /programs token polish by replacing the nested PageTemplate card stack with an unframed public layout, applying token-backed 8px cards/CTAs, and hiding the default fixed mobile nav on /programs while preserving header menu access; targeted validation passed with npx vitest run tests/unit/design-token-contract.test.ts, npm run lint:briefs:all, git diff --check, npx playwright test tests/e2e/mobile-nav-state.spec.ts --project=mobile-chromium, env PW_PORT=3101 NEXT_DIST_DIR=.next-playwright-public npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium, and npm run typecheck; route-label/support sweep searched /programs, Swim Programs, Poolside PDF, mobile-nav-programs, and fs-program-card across app, components, tests, docs/task-briefs, docs/app-knowledge-book, and docs/runbooks with expected fallout only in route markup, tests, token utilities, and AW-006 briefs; before/after screenshots captured in output/programs-token-polish-2026-05-18-100027 | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | screenshot-correction | owner asked whether the original Swim Programs lockup structure should be preserved; adjusted the unframed hero to use the FreeSwimming symbol on the left, Swim Programs as the H1, and Learn. Drill. Swim. beneath it while keeping the lighter route layout, token-backed cards, and hidden mobile bottom nav; targeted validation reran and passed with npm run typecheck, npx vitest run tests/unit/design-token-contract.test.ts, git diff --check, env PW_PORT=3101 NEXT_DIST_DIR=.next-playwright-public npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium, and npx playwright test tests/e2e/mobile-nav-state.spec.ts --project=mobile-chromium; refreshed after screenshots in output/programs-token-polish-2026-05-18-100027 | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | screenshot-approved | owner approved the corrected /programs lockup screenshot handoff; continuing into npm run verify:pre-pr, commit, push, PR, CI, and npm run verify:pre-merge while still stopping before merge | next: run broad pre-PR gate`
- `2026-05-18 | pre-pr-gate-fix | npm run verify:pre-pr initially failed in lint:quality-gates because the Route / Label / Support Surface Sweep evidence used noncanonical headings; updated the brief to use Identifiers searched and Surfaces checked wording while preserving the same sweep evidence | next: rerun npm run verify:pre-pr`
- `2026-05-18 | pre-pr-pass | npm run verify:pre-pr passed the full public lane after the brief evidence wording fix: lint, typecheck, 1100 unit tests, production build, perf budgets, and 94 passed / 452 skipped Playwright E2E tests; perf budget trend reported 6 consecutive weekly green runs with a tighten recommendation, but this UI slice holds budget thresholds unchanged and records the tighten prompt for owner follow-up in the PR summary because changing performance policy is out of scope for this route polish | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
