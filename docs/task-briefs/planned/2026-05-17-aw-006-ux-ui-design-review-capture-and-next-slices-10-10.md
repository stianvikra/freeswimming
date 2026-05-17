# Task Brief: AW-006 UX/UI Design Review Capture And Next Slices (10/10)

## Metadata

- `id`: `2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-17`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-03-10-aw-006-cross-platform-ux-design-hardening-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-17`
- `base`: `main@6724077`
- `audit_status`: `ready`
- `decision`: Use this brief as the canonical repo capture for the 2026-05-16 full UX/UI design review and PR-sized AW-006 follow-up queue.
- `reason`: The original review lived only in chat after `main@be554e9`; Mobile CTA Safe Area shipped through `#730/#731`, Auth sign-in fallback shipped through `#732/#733`, Course desktop player polish shipped through `#735/#736`, and the remaining review queue needs a repo-backed source before more UX/UI implementation starts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, mobile nav, auth sign-in, course/player, plans/payment copy, `/about`, design tokens, screenshot handoff rules, or verification lanes change before the next UX/UI slice starts.

## Goal

Make the 2026-05-16 full UX/UI design review durable in the repo, record what has already shipped, and define the next small PR-sized UX/UI slices so future chats do not rely on memory.

## Review Source And Context

- Review prompt: "Full UX/UI Design Review & 10/10 Improvement Plan".
- Review mode: senior product design, UX audit, frontend architecture, conversion/product-quality review.
- Original review base: clean `main@be554e9` after My Swim Profile Action-First and closeout (`#728/#729`).
- Evidence used by the review: repo inspection, routes/layouts/components/design docs, tests, Tailwind/CSS usage, navigation/auth/onboarding/dashboard/course/admin surfaces, and local screenshots.
- Limitation: authenticated member/admin surfaces were primarily code-inspected; no real user data/session was used.
- First approved implementation from the review:
  - `docs/task-briefs/done/2026-05-16-mobile-cta-safe-area-hardening-10-10.md`
  - shipped via `#730/#731`.
- Later related auth work:
  - `docs/task-briefs/done/2026-05-17-auth-sign-in-link-first-otp-fallback-clarity-10-10.md`
  - shipped via `#732/#733`.

## Executive Summary From The Review

The app has a strong technical foundation, clear mobile-first intent, good accessibility primitives, and a calm brand direction. It is not yet a 10/10 product experience because the review found gaps in design-system discipline, desktop-native layout, premium conversion, visual proof/trust, and consistent states across larger member/admin surfaces.

## 25-Category Audit Capture

| #   | Category                                     | Score | Main finding                                                                                                  | Priority | Effort |
| --- | -------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| 1   | First impression / perceived quality         | 7/10  | Home/mobile feel calm and premium, but course desktop and repeated card/glass styling reduce polish.          | High     | Medium |
| 2   | Visual hierarchy                             | 7/10  | Primary CTAs are visible, but many elements still compete with similar visual weight.                         | High     | Medium |
| 3   | Layout and spacing                           | 6/10  | Safe-area intent is good, but fixed bottom nav created CTA crowding before the first follow-up shipped.       | High     | Medium |
| 4   | Typography                                   | 7/10  | Manrope is readable, but scale, caps, and letterspacing are not yet disciplined across surfaces.              | Medium   | Medium |
| 5   | Color system and contrast                    | 7/10  | Blue/slate is consistent, but the product can feel one-note and some status colors need contrast review.      | Medium   | Medium |
| 6   | Mobile experience                            | 7/10  | Home/course are strong; long dense surfaces and CTA/nav spacing still need systematic regression coverage.    | High     | Medium |
| 7   | Desktop experience                           | 6/10  | Several routes feel like scaled-up mobile instead of desktop-native layouts.                                  | Medium   | Large  |
| 8   | Navigation and information architecture      | 7/10  | IA is documented and drawer/focus behavior is solid; `/about` and some sign-in context need cleanup.          | High     | Medium |
| 9   | Onboarding and user guidance                 | 6/10  | Profile readiness exists, but visitor-to-learner-to-paid first-run flow is not unified.                       | Medium   | Large  |
| 10  | Course/lesson experience                     | 7/10  | Progress/drawer/mobile player are strong; desktop course/player first viewport lacks finish and proof.        | High     | Medium |
| 11  | Dashboard experience                         | 6/10  | Action-first rows exist, but summary/value hierarchy can still feel flat across member hubs.                  | Medium   | Large  |
| 12  | Forms and input states                       | 7/10  | ContactForm has labels/errors/focus; auth/member forms need more standardization.                             | Medium   | Medium |
| 13  | Empty states                                 | 6/10  | Empty states exist, but are utilitarian and inconsistent.                                                     | Medium   | Medium |
| 14  | Loading states                               | 6/10  | Course skeletons and pending labels exist; route-level loading strategy is uneven.                            | Medium   | Medium |
| 15  | Error states                                 | 6/10  | Retry/error states exist, but visual treatment and optional anonymous error noise are inconsistent.           | High     | Medium |
| 16  | Authentication experience                    | 6/10  | Email auth/cooldown existed, but sign-in context and iPhone/Home Screen fallback needed clarity.              | High     | Small  |
| 17  | Premium/payment/upgrade flow                 | 5/10  | Stripe foundation is strong; plans lack price/value/proof/comparison and clear purchase expectations.         | High     | Medium |
| 18  | Trust and credibility                        | 5/10  | Privacy and hosted checkout are solid; social proof, samples, and credibility modules are thin.               | High     | Medium |
| 19  | Accessibility                                | 7/10  | Focus, labels, aria-live, and reduced motion are strong; custom tabs/nav and fixed nav need continued audit.  | Medium   | Medium |
| 20  | Performance perception                       | 7/10  | Budgets/local font/lazy YouTube are good; large client components and loading polish remain.                  | Medium   | Large  |
| 21  | Consistency of components                    | 5/10  | PageTemplate and press primitives exist; buttons/cards/fields/notices are still reimplemented.                | High     | Large  |
| 22  | Reuse of design patterns                     | 6/10  | Some shared session/navigation contracts exist; admin/member/forms/tabs/notices still duplicate patterns.     | High     | Large  |
| 23  | Brand identity                               | 6/10  | Logo/font/tagline are clear; app needs stronger media/proof/sample assets to avoid generic SaaS feel.         | Medium   | Medium |
| 24  | Conversion quality                           | 5/10  | Free-course CTA and events exist; paid/contact flows undersell value and trust.                               | High     | Medium |
| 25  | Overall polish compared with top modern apps | 6/10  | Engineering is strong, but design-system, conversion, desktop polish, and visual QA need more focused slices. | High     | Large  |

## Shipped Since The Review

| Slice                          | Status    | Evidence                                                                                                          | Notes                                                                                                                                                                      |
| ------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile CTA safe-area hardening | `done`    | `#730/#731`, `docs/task-briefs/done/2026-05-16-mobile-cta-safe-area-hardening-10-10.md`                           | Completed the first approved UX/UI audit task.                                                                                                                             |
| Auth sign-in fallback clarity  | `partial` | `#732/#733`, `docs/task-briefs/done/2026-05-17-auth-sign-in-link-first-otp-fallback-clarity-10-10.md`             | Covered link-first + one-time-code fallback and iPhone Home Screen guidance; contextual `next` copy still needs a focused audit before marking the review item fully done. |
| Goals action-first             | `done`    | `#726/#727`, `docs/task-briefs/done/2026-05-16-goals-action-first-simplification-10-10.md`                        | Shipped before the captured full review; aligns with the review's action-first dashboard/member direction.                                                                 |
| My Swim Profile action-first   | `done`    | `#728/#729`, `docs/task-briefs/done/2026-05-16-my-swim-profile-action-first-setup-and-capability-safety-10-10.md` | Shipped before the captured full review; aligns with onboarding/member readiness findings.                                                                                 |
| Course desktop player polish   | `done`    | `#735/#736`, `docs/task-briefs/done/2026-05-17-course-desktop-player-polish-10-10.md`                             | Shipped the first viewport desktop course/player polish that was originally the top remaining AW-006 item.                                                                 |

## Remaining PR-Sized UX/UI Slices

Recommended order unless the owner explicitly reprioritizes:

1. `Plans conversion baseline`
   - Objective: add clear price/value/proof/checkout expectations without changing Stripe mechanics.
   - Likely files: `app/plans/page.tsx`, `CheckoutButton`, catalog/product copy, plans tests/screenshots.
   - Risks: payment copy can imply unsupported entitlements or guarantees.
   - Protected areas: payments/commerce copy and checkout entry; no Stripe API changes unless separately scoped.
2. `Contextual sign-in clarity audit`
   - Objective: verify whether `#732/#733` fully covers `next=/admin`, `/my-library`, checkout/portal, and claim/download entry contexts; patch only remaining copy gaps.
   - Likely files: `app/auth/sign-in/page.tsx`, auth tests, support docs.
   - Risks: auth messaging, redirect context.
   - Protected areas: auth.
3. `Public IA / about cleanup`
   - Objective: remove or make real any unclear `/about` or method route surface, and keep nav/docs/metadata aligned.
   - Likely files: `app/about/**`, nav config, sitemap/metadata docs/tests.
   - Risks: route/SEO/support references.
   - Protected areas: route/SEO.
4. `Design token foundation`
   - Objective: establish color/type/spacing/radius/shadow tokens and migrate one low-risk public surface as proof.
   - Likely files: `app/globals.css`, `components/ui/*`, `components/PageTemplate.tsx`, one selected public route.
   - Risks: global visual regression.
   - Protected areas: UI/layout/brand; screenshot handoff required.

## 10/10 Phase Plan Capture

### Phase 1: Quick Wins

- Finish mobile safe-area regression coverage. Status: `done`.
- Verify or finish contextual sign-in clarity for admin/member/checkout contexts.
- Improve course desktop first viewport.
- Improve plans price/value/trust/expectation copy without changing checkout mechanics.
- Clarify `/about` versus method/about IA.
- Reduce optional anonymous course-progress console noise if still present.

### Phase 2: Core UX / Design System

- Introduce disciplined tokens for color, radius, shadow, spacing, and type.
- Build or consolidate shared Button, Card, PageShell, Field, Notice, EmptyState, Tabs, and StatusBadge patterns.
- Standardize bottom-nav safe-area and screenshot regression coverage.
- Break up large member/admin monoliths into smaller view/state modules when touched.

### Phase 3: Premium Polish And Conversion

- Redesign `/plans` as comparison plus proof plus secure checkout expectations.
- Add sample deliverables for PDF/video analysis where accurate.
- Improve post-purchase expectation/recovery flow.
- Add safe funnel instrumentation for price seen, checkout clicked, and recovery clicked if not already present.
- Strengthen contact/analysis trust copy, response expectation, and input guidance.

### Phase 4: Advanced Refinement

- Add stable visual baseline snapshots for home, course, plans, contact, and member surfaces.
- Create desktop-native course/dashboard/admin layouts.
- Build a brand media system for course posters/thumbnails/sample assets.
- Complete keyboard, contrast, and semantic audit across core flows.
- Tighten IA and first-run onboarding after the smaller slices land.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this planning/capture brief:

- `Product goals and IA`
- `UX flow clarity`
- `Content governance`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The UX/UI review is captured with a clear done/remaining queue and one recommended next slice, so AW-006 no longer depends on chat memory.                               | this brief + review queue table              | `5/5`                   |
| UX flow clarity                               | `target`     | Remaining UX/UI work is split into small PR-sized slices with objective, likely files, risks, checks, acceptance direction, and protected-area flags.                    | remaining slice table                        | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: the captured review identifies visual hierarchy, desktop polish, color, typography, brand, and component-consistency gaps; no rendered UI changes here. | 25-category audit table                      | `4/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this docs-only capture changes no runtime behavior, persisted data, mutations, validation, or business truth.                                                | explicit docs-only scope review              | `N/A`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin/member duplication and large-surface consistency are captured as future concerns; no admin editor workflow changes here.                          | audit capture and phase plan                 | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: the review preserves a11y findings for later implementation; no semantics, focus behavior, labels, or contrast are changed in this PR.                  | audit capture                                | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: performance-perception gaps and the separate perf-ratchet prompt are noted, but this brief changes no route budget or payload.                          | audit capture + scope rationale              | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this capture introduces no local state, server-canonical state, sync, cache mutation, storage, or conflict behavior.                                         | data contract section                        | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this capture changes no fetch path, route cache mode, revalidation, mutation response, or stale-data behavior.                                               | cache scope rationale                        | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: loading/error/retry-state gaps are captured for future slices, but this docs-only PR changes no failure behavior.                                       | 25-category audit table                      | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this capture changes no protected route, authz check, auth provider behavior, token handling, cookies, or input surface.                                     | security scope rationale                     | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this capture stores no user data, secrets, raw env values, credentials, analytics payloads, or legal/consent behavior.                                       | privacy scope rationale                      | `N/A`                   |
| Content governance                            | `target`     | The review source, shipped slices, partial coverage, and remaining queue are recorded in one planned brief with links to canonical done briefs.                          | source/context + shipped status tables       | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin workflow is part of later pattern-reuse/design-system concern; no admin CRUD or operator workflow changes in this capture.                        | audit capture                                | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/about`/public IA and route/SEO cleanup is captured as a later slice; this capture changes no metadata, sitemap, robots, or canonical.                 | remaining slice table                        | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this capture changes no public semantic content model, structured data, crawl-safe entity surface, or AI-facing documentation contract.                      | explicit AI-discoverability scope rationale  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: conversion/funnel instrumentation is captured as future work; no event taxonomy, logging, dashboard, or payload changes here.                           | phase plan                                   | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: plans conversion and payment expectation gaps are captured for a later protected payments-copy slice; checkout and finance logic are untouched here.    | remaining slice table                        | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this capture changes no support workflow, alert path, recovery behavior, operator runbook, or incident response process.                                            | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this capture changes no billing, invoice, payout, refund, entitlement, revenue report, reconciliation surface, or finance data.                                     | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this capture changes no user-facing product strings, locale routing, translation workflow, metadata text, or grammar-coupled UI copy.                               | explicit i18n scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The follow-up queue names stack-native slices and avoids starting a native iOS, perf-ratchet, design-system, or payment refactor under the wrong brief.                  | remaining slice table + out-of-scope section | `5/5`                   |
| Testing and QA automation                     | `target`     | The capture must pass brief lint and docs-only verification; later UI slices each require targeted tests and screenshot handoff before broad gates.                      | `lint:briefs` + `verify:pre-pr` evidence     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the queue decomposes large UX/design-system work into small PRs to reduce regression and review cost; no runtime cost changes here.                     | PR-sized slice plan                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | This docs-only change can be reverted normally; future UI slices must preserve screenshot approval, pre-pr, CI, and pre-merge gate order.                                | validation plan + branch/PR evidence         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A for this capture PR; no route, component, server/client boundary, action, API, cache, or revalidation behavior changes.
  - Future UI slices must identify their reference surface before implementation.
- TypeScript/domain contracts:
  - N/A for this capture PR; no domain type, parser, validation layer, invariant, or error model changes.
  - Future slices must preserve existing domain contracts unless their brief explicitly scopes a contract change.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated type, index, or data contract change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, or deployment setting change.
- UI system:
  - This brief captures UI findings only.
  - Any later UI/print/layout/brand implementation requires screenshot handoff before `npm run verify:pre-pr`.
  - Reference surfaces must be named per slice.
- Testing:
  - This capture PR should run docs/brief validation only.
  - Each later implementation slice must add targeted tests and screenshots for its changed route/surface.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only review-capture brief. It introduces no local-only data, server-canonical data, browser storage, sync behavior, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this capture creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, or rename/repurpose behavior.

## Help / Guide Impact

N/A with rationale: this capture changes no user/admin workflow labels, support recovery behavior, Help/Guide assertions, or operator-facing instructions. Future slices must update Help/Guide or runbooks when they change labels, workflows, recovery, auth, payments, or support paths.

## Route / Label / Support Surface Sweep

Required only as a documentation-link sweep for this capture.

- Terms to sweep before PR handoff:
  - `AW-006`
  - `cross-platform UX`
  - `UX/UI`
  - `Mobile CTA`
  - `Course desktop`
  - `Plans conversion`
  - `Contextual sign-in`
  - `about`
  - `design token`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - no product copy or Help/Guide update in this capture PR,
  - future implementation briefs should reference this capture when choosing the next AW-006 slice.

## Scope

- Add this planned AW-006 child brief.
- Preserve the 25-category UX/UI review scores and primary findings.
- Record shipped/partial/remaining status for review-derived slices.
- Define the recommended next PR-sized queue.
- Document validation and screenshot expectations for future slices.

## Out Of Scope

- Runtime code, tests, scripts, configs, migrations, workflows, assets, package files, or generated files.
- UI implementation.
- Screenshot capture.
- Performance budget tightening.
- Native iOS shell / Universal Links work.
- Stripe API or checkout behavior changes.
- Any route, label, Help/Guide, or support workflow change.

## Acceptance Criteria

1. The 25-category UX/UI review is captured in a planned brief with scores, findings, priority, and effort.
2. Completed and partial follow-up work is linked to the relevant done briefs and PRs.
3. Remaining UX/UI follow-up work is split into small PR-sized slices with likely files, risks, and protected-area flags.
4. The brief explicitly recommends the next UX/UI implementation slice unless the owner reprioritizes.
5. The brief passes `npm run lint:briefs` and docs-only pre-PR verification.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- before merge recommendation:
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- This is docs-only; `verify:pre-pr` and `verify:pre-merge` should auto-select the docs-only lane.

## Checkpoint Log

- `2026-05-17 | planned | captured the owner-provided 2026-05-16 UX/UI design review into a repo-backed AW-006 child brief from clean main@65059ee; no runtime code, UI, tests, scripts, configs, or screenshots are in scope | next: run brief lint and docs-only verification, then commit/push/open PR`
- `2026-05-17 | planned | refreshed after Course desktop player polish #735/#736 on clean main@6724077; marked course desktop done and promoted Plans conversion baseline as the next remaining PR-sized AW-006 UX/UI slice | next: execute docs/task-briefs/in-progress/2026-05-17-aw-006-plans-conversion-baseline-10-10.md`
