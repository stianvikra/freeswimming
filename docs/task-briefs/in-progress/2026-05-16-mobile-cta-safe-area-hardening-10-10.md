# Task Brief: Mobile CTA Safe-Area Hardening (10/10)

## Metadata

- `id`: `2026-05-16-mobile-cta-safe-area-hardening-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-16`
- `updated`: `2026-05-16`
- `execution mode`: `end-to-end implementation after owner explicitly asked to execute the agreed first UX/UI audit task`

## Brief Audit Record

- `last_audited`: `2026-05-16`
- `base`: `main@be554e9`
- `audit_status`: `ready`
- `decision`: Use this focused mobile safe-area slice before larger design-system, auth, course-player, or commerce-conversion work.
- `reason`: UX audit found fixed mobile bottom navigation can visually cover or crowd primary CTAs on `/plans` and contact-style forms, creating a high-impact usability issue with low implementation risk.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, screenshot handoff rules, mobile navigation shell, `PageTemplate`, `ContactForm`, `/plans`, `/contact`, `/analysis`, Tailwind/CSS layout utilities, or validation lanes change.

## Goal

Ensure primary mobile CTAs and form submit actions stay fully visible, tappable, and visually clear above the fixed bottom navigation on affected public routes.

## Product Decisions

- This brief fixes a concrete mobile usability defect; it does not redesign the app shell, nav IA, plan conversion content, or form copy.
- The fixed bottom navigation remains in place.
- The solution should prefer a shared safe-area/layout pattern over route-specific spacer hacks when practical.
- Screenshot handoff is required before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                  | Evidence                                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: public route purpose and navigation hierarchy stay unchanged while primary mobile actions remain reachable.                                                        | route review + screenshot handoff                                      | `4/5`                   |
| UX flow clarity                               | `target`     | On affected mobile public routes, the primary CTA or submit action is never hidden behind fixed bottom nav and remains the obvious next action.                                     | mobile screenshots + targeted browser QA                               | `5/5`                   |
| Visual design quality                         | `target`     | Added safe spacing must look intentional, not like an empty gap, and must preserve current public-page visual language on mobile and desktop.                                       | before/after screenshots                                               | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes layout spacing only and does not alter business state, persistence, mutations, validation, or data transformations.                                  | explicit non-stateful layout scope rationale                           | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editing, publishing, moderation, or operator CRUD workflow.                                                                                       | explicit admin scope rationale                                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Touch targets and keyboard focus must remain reachable and visible; spacing must not create focus traps, hidden submit buttons, or nav-obscured controls.                           | a11y-focused route review + targeted Playwright/Testing Library checks | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: layout fix must add no dependency, no new client boundary, and no meaningful payload or render-cost increase.                                                      | dependency diff + build evidence                                       | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no stateful feature, local storage, server-canonical data, sync, cache mutation, or conflict behavior.                                            | explicit layout-only rationale                                         | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route data fetching, cache mode, revalidation, or invalidation behavior changes.                                                                                     | explicit cache scope rationale                                         | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: existing form error/success states must not become obscured or unreachable near the mobile bottom nav.                                                             | contact/analysis mobile QA                                             | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no auth, authorization, protected route, API, cookies, credentials, or security-sensitive inputs.                                                          | explicit security scope rationale                                      | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this changes no data collection, logs, analytics payloads, consent, retention, or private user data display.                                                            | explicit privacy scope rationale                                       | `N/A`                   |
| Content governance                            | `N/A`        | N/A because this changes no labels, editorial content ownership, publish workflow, help content, or copy contract.                                                                  | explicit content scope rationale                                       | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, support console, admin mutation, or operator editability changes.                                                                                        | explicit admin workflow scope rationale                                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no metadata, robots, sitemap, canonical, structured content, route availability, or crawl behavior.                                                        | explicit SEO scope rationale                                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic content, structured data, crawl-safe docs, or entity modeling.                                                                          | explicit AI discoverability scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no event taxonomy, analytics payload, KPI definition, dashboard, or persistence.                                                                           | explicit analytics scope rationale                                     | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: `/plans` purchase CTA visibility improves mobile purchase path, but checkout, pricing, catalog, entitlements, and revenue logic remain untouched.                  | mobile `/plans` screenshot QA + code review                            | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A because this layout-only public UI fix changes no support workflow, runbook, alert path, operational diagnostic, or recovery behavior.                                          | explicit support-ops scope rationale                                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this changes no pricing, checkout transaction, refund, payout, invoice, entitlement, revenue report, or reconciliation surface.                                         | explicit finance scope rationale                                       | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this changes no user-facing strings, locale routing, metadata text, or grammar-coupled copy.                                                                            | explicit i18n scope rationale                                          | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next/Tailwind route shells and mobile nav primitives; add no dependency and avoid broad design-system refactors outside this slice.                                  | architecture review + no-dependency diff                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests or screenshot checks must cover mobile `/plans` and at least one contact-style form route, followed by screenshot handoff and broad gates before PR/merge readiness. | targeted tests + screenshot handoff + verify gates                     | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this adds no backend work, polling, storage, scheduled job, external service, or traffic-dependent cost behavior.                                                       | explicit cost scope rationale                                          | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal CSS/component revert with no migration or config state; validation and screenshot artifacts must make the visual change reviewable.           | git diff + screenshot artifacts + gate logs                            | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface is the existing public app shell in `components/SiteChrome.tsx`, shared public-page wrappers in `components/PageTemplate.tsx`, and current `/plans` and contact form behavior.
  - Keep existing route boundaries for `/plans`, `/contact`, and `/analysis`.
  - Do not introduce new server/client boundaries or route data fetching.
- TypeScript/domain contracts:
  - No domain contract changes.
  - Preserve existing CTA/button and form submit semantics.
- Supabase/data layer:
  - N/A; no database, RLS, authz, migration, generated types, or persisted entities are touched.
- External services/tools:
  - N/A; Stripe, email, analytics vendors, and other external services are not touched.
- UI system:
  - Reuse existing Tailwind/CSS patterns and mobile nav safe-area behavior.
  - Prefer a shared spacing helper or existing wrapper adjustment over duplicated per-route padding.
  - Screenshot handoff type is `before/after` for `/plans` mobile and contact-style mobile forms, with desktop smoke screenshots only if the layout code can affect desktop.
- Testing:
  - Targeted local browser/screenshot QA for mobile `/plans`, `/contact`, and `/analysis`.
  - Relevant existing tests for mobile nav/contact behavior.
  - `npm run lint:briefs`, targeted tests, screenshot handoff, then broad gates after owner screenshot approval.

## Data Placement And Sync Contract

N/A. This is layout-only work. It introduces no local-only data, server-canonical data, sync policy, retention behavior, cache mutation, or invalidation event.

## Identity And Rename Contract

N/A. This changes no persisted entity, route param, slug, title identity, analytics identity, admin-visible identifier, or rename/repurpose behavior.

## Help / Guide Impact

N/A. This does not change user/admin workflow labels, recovery behavior, Help/Guide assertions, support runbooks, or operator-facing instructions.

## Route / Label / Support Surface Sweep

- Sweep status: complete for this layout-only slice before re-running `npm run verify:pre-pr`.
- Identifiers searched:
  - `mobile-fixed-nav`
  - `bottom nav`
  - `bottom-nav`
  - `safe-area`
  - `withBottomSafeArea`
  - `topInset`
  - `PageTemplate`
  - `/plans`
  - `/contact`
  - `/analysis`
  - `Plans`
  - `Contact`
  - `Video Analysis`
- Directories and surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - active, planned, and done task briefs returned by the targeted `rg` sweep
- Fallout handled:
  - `app/plans/page.tsx`, `app/contact/page.tsx`, and `app/analysis/page.tsx` opt into the new compact `PageTemplate` mobile top inset only where the audit found CTA/nav crowding.
  - `components/SiteChrome.tsx` keeps the same fixed mobile nav items and labels, adding only a backdrop mask so scrolling content does not visually bleed through the nav area.
  - `tests/e2e/mobile-bottom-nav-safe-area.spec.ts` covers the exact affected public routes and `mobile-fixed-nav` clearance.
  - Existing `docs/interaction-regression-checklist.md` assertions remain true: default `/contact` still shows fixed bottom nav, preview notify still hides it, and public bottom nav controls remain `Home`, `Course`, and `Programs`.
  - No Help/Guide, support runbook, public label, route, metadata, auth, checkout, database, RLS, or API fallout was found.

## Scope

- Mobile CTA and submit visibility on:
  - `/plans`,
  - `/contact`,
  - `/analysis`.
- Shared layout or component adjustments needed to keep primary actions above fixed bottom nav.
- Targeted tests and screenshot handoff artifacts.

## Out Of Scope

- Redesigning bottom nav, public IA, plans content, pricing, checkout, contact form copy, auth, database, admin, course player, or design tokens.
- New dependencies.
- Public route rename, metadata/SEO changes, or Help/Guide content changes.
- Merge without explicit owner approval.

## Acceptance Criteria

1. On mobile 390px-wide viewport, `/plans` primary action is fully visible and tappable above the fixed bottom nav on first view: purchase CTA when products are available, support CTA when checkout configuration is unavailable.
2. On mobile 390px-wide viewport, `/contact` and `/analysis` submit actions and final form states are not visually covered or crowded by bottom nav.
3. Fixed bottom nav remains present and visually unchanged.
4. Desktop layout is unchanged except for harmless shared spacing if technically unavoidable.
5. No route, auth, checkout, data, or copy behavior changes.
6. No new dependency is added.
7. Targeted tests and screenshot handoff evidence cover the affected routes before broad gates.

## Validation

- `npm run lint:briefs`
- Targeted mobile screenshot/browser QA for `/plans`, `/contact`, and `/analysis`
- Relevant targeted tests:
  - contact form accessibility/UX tests if affected by component changes
  - mobile nav tests if app-shell spacing changes
- Screenshot handoff before `npm run verify:pre-pr`
- Owner screenshot approval or correction pass before PR creation/update and broad gates
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-16`: Started from clean `main@be554e9`; owner approved end-to-end execution of the first UX/UI audit task; branch `fix/mobile-cta-safe-area` created.
- `2026-05-16`: Implemented scoped mobile `flush` inset for affected public routes, added `/plans` mobile card gap, added Playwright bounding-box regression for CTA clearance, ran targeted mobile tests, and generated screenshot handoff artifacts in `output/mobile-cta-safe-area-2026-05-16-204535`.
- `2026-05-16`: Owner flagged `/plans` still looked problematic; added a shared bottom-nav backdrop mask so scroll-list content no longer bleeds visually through the fixed mobile nav area, regenerated after screenshots, and reran targeted mobile tests.
- `2026-05-16`: Owner approved updated screenshot handoff; proceeding to `npm run verify:pre-pr`, commit, push, PR, CI monitoring, and pre-merge gate.
- `2026-05-16`: `npm run verify:pre-pr` passed full lane from `origin/main@be554e9`: quality gates, lint, typecheck, unit tests, build, perf budgets, and Playwright E2E. Perf trend recommended tightening one stretch target after 5 weekly green runs; decision for this safe-area PR is hold/defer scope and record the tightening prompt in PR handoff.
- `2026-05-16`: CI exposed `/plans` safe-area test config drift: CI has no Stripe price IDs, so `/plans` primary action is `Contact support`, not a purchase button. Hardened the regression to measure the route's actual primary CTA for the active catalog state.
