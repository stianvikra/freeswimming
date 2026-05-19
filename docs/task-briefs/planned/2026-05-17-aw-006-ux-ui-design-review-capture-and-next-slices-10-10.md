# Task Brief: AW-006 UX/UI Design Review Capture And Next Slices (10/10)

## Metadata

- `id`: `2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-03-10-aw-006-cross-platform-ux-design-hardening-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@310de37`
- `audit_status`: `ready`
- `decision`: Keep this brief as the canonical repo capture for the 2026-05-16 full UX/UI design review and PR-sized AW-006 follow-up queue.
- `reason`: The original review lived only in chat after `main@be554e9`; Mobile CTA Safe Area shipped through `#730/#731`, Auth sign-in fallback shipped through `#732/#733`, Course desktop player polish shipped through `#735/#736`, Contact/Analysis trust copy shipped through `#748/#749`, Anonymous Course Progress Noise shipped through `#750/#751`, Owner-Readable Slice Start Governance shipped through `#752/#753`, Sample Deliverable Proof shipped through `#754/#755`, the queue re-audit plus closeout shipped through `#756/#757`, My Library surface polish shipped through `#758/#759`, Shared notice/empty-state inventory shipped through `#760`, admin management feedback/list-state primitive pilot shipped through `#762/#763`, stable visual baseline snapshot pilot shipped through `#764/#765`, and canonical queue lifecycle automation shipped through `#766/#767`. The current AW-006 implementation slice is Shared notice/empty-state primitive expansion, and future closeouts now catch stale active-brief references before a separate cleanup slice is needed.
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
- Completed auth follow-up:
  - `docs/task-briefs/done/2026-05-17-aw-006-contextual-sign-in-clarity-audit-10-10.md`
  - shipped through `#746/#747` as the AW-006 UX/UI slice after Programs shipped.
- Recently shipped follow-up execution:
  - `docs/task-briefs/done/2026-05-18-aw-006-programs-poolside-pdf-token-polish-10-10.md`
  - shipped through `#744/#745` after Design token foundation proof shipped through `#742/#743`.
- Prior shipped follow-up execution:
  - `docs/task-briefs/done/2026-05-18-aw-006-contact-analysis-trust-copy-10-10.md`
  - shipped through `#748/#749`, scoped to public `/contact` and `/analysis` trust copy, response expectation, privacy boundary, and input guidance without changing contact API, provider delivery, admin messages, Stripe, Supabase, or analytics behavior.
- Completed anonymous-course follow-up:
  - `docs/task-briefs/done/2026-05-18-aw-006-anonymous-course-progress-noise-10-10.md`
  - shipped through `#750/#751`, scoped to public `/course` anonymous background noise: guest progress stays local-only and guest course browsing no longer mounts the admin lesson-notes panel or calls protected admin notes APIs, without changing signed-in progress sync, admin notes authorization, Supabase, course content, or visible course design.
- Completed governance follow-up:
  - `docs/task-briefs/done/2026-05-18-owner-readable-slice-start-governance-10-10.md`
  - shipped through `#752/#753`, adding the required Norwegian non-programmer explanation before each new brief or implementation slice.
- Completed sample/proof follow-up:
  - `docs/task-briefs/done/2026-05-18-aw-006-sample-deliverable-proof-10-10.md`
  - shipped through `#754/#755`, scoped to truthful public sample/proof expectations for Poolside PDF and Video Analysis on `/programs` and `/analysis`, without changing Stripe, contact API delivery, entitlements, generated PDFs, analytics, Supabase, Help/Guide, or broad design-system behavior.
- Completed queue refresh execution:
  - `docs/task-briefs/done/2026-05-19-aw-006-remaining-queue-reaudit-10-10.md`
  - shipped through `#756`, scoped to docs-only queue accuracy after `#754/#755`, promoting the next PR-sized AW-006 UX/UI implementation slice without changing rendered UI, product behavior, tests, screenshots, Stripe, Supabase, analytics, Help/Guide, or runtime code.
- Completed signed-in hub polish:
  - `docs/task-briefs/done/2026-05-19-aw-006-my-library-surface-token-action-hierarchy-polish-10-10.md`
  - shipped through `#758/#759`, applying the AW-006 token/action hierarchy direction to `/my-library` without changing member data, auth behavior, entitlement truth, commerce destinations, or child route behavior.
- Completed shared state inventory:
  - `docs/task-briefs/done/2026-05-19-aw-006-shared-notice-empty-state-pattern-inventory-10-10.md`
  - shipped through `#760`, inventorying representative public, member, guide, and admin notice/empty/loading/error states and selecting an admin-local primitive pilot without changing runtime UI.
- Completed admin state primitive pilot:
  - `docs/task-briefs/done/2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10.md`
  - shipped through `#762/#763`, introducing an admin-local list-state helper and migrating bounded Commerce, Operations, and QR registry states without changing admin data, authz, mutation behavior, or operator copy.
- Completed visual baseline pilot:
  - `docs/task-briefs/done/2026-05-19-aw-006-stable-visual-baseline-snapshot-pilot-10-10.md`
  - shipped through `#764/#765`, adding an on-demand AW-006 reference screenshot capture path without changing rendered UI, product behavior, runtime data, checkout, auth, or CI gating.
- Completed lifecycle automation:
  - `docs/task-briefs/done/2026-05-19-aw-006-canonical-queue-lifecycle-automation-10-10.md`
  - shipped through `#766/#767`, correcting this queue after `#764/#765` and adding lint/preflight coverage so completed active child briefs cannot keep pointing at stale `in-progress` queue entries.

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

| Slice                           | Status    | Evidence                                                                                                             | Notes                                                                                                                                                                                             |
| ------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile CTA safe-area hardening  | `done`    | `#730/#731`, `docs/task-briefs/done/2026-05-16-mobile-cta-safe-area-hardening-10-10.md`                              | Completed the first approved UX/UI audit task.                                                                                                                                                    |
| Auth sign-in fallback clarity   | `partial` | `#732/#733`, `docs/task-briefs/done/2026-05-17-auth-sign-in-link-first-otp-fallback-clarity-10-10.md`                | Covered link-first + one-time-code fallback and iPhone Home Screen guidance; contextual `next` copy still needs a focused audit before marking the review item fully done.                        |
| Goals action-first              | `done`    | `#726/#727`, `docs/task-briefs/done/2026-05-16-goals-action-first-simplification-10-10.md`                           | Shipped before the captured full review; aligns with the review's action-first dashboard/member direction.                                                                                        |
| My Swim Profile action-first    | `done`    | `#728/#729`, `docs/task-briefs/done/2026-05-16-my-swim-profile-action-first-setup-and-capability-safety-10-10.md`    | Shipped before the captured full review; aligns with onboarding/member readiness findings.                                                                                                        |
| Course desktop player polish    | `done`    | `#735/#736`, `docs/task-briefs/done/2026-05-17-course-desktop-player-polish-10-10.md`                                | Shipped the first viewport desktop course/player polish that was originally the top remaining AW-006 item.                                                                                        |
| Plans conversion baseline       | `done`    | `#737/#738`, `docs/task-briefs/done/2026-05-17-aw-006-plans-conversion-baseline-10-10.md`                            | Shipped clearer `/plans` value, proof, and checkout expectation copy without changing Stripe mechanics.                                                                                           |
| Public IA / about cleanup       | `done`    | `#740/#741`, `docs/task-briefs/done/2026-05-17-aw-006-public-ia-about-cleanup-10-10.md`                              | Retired the stale `/about` page surface, corrected legacy redirect behavior, and made `/our-method` the canonical method page.                                                                    |
| Design token foundation proof   | `done`    | `#742/#743`, `docs/task-briefs/done/2026-05-18-aw-006-design-token-foundation-public-proof-10-10.md`                 | Established the first global token foundation and proved it on `/our-method` only.                                                                                                                |
| Programs Poolside PDF polish    | `done`    | `#744/#745`, `docs/task-briefs/done/2026-05-18-aw-006-programs-poolside-pdf-token-polish-10-10.md`                   | Applied the token foundation to `/programs` Poolside/PDF cards and refreshed the public value path without changing checkout, entitlement, guide, or PDF internals.                               |
| Contextual sign-in clarity      | `done`    | `#746/#747`, `docs/task-briefs/done/2026-05-17-aw-006-contextual-sign-in-clarity-audit-10-10.md`                     | Added contextual `/auth/sign-in` explanation for admin, My Library, checkout success, and claim/download contexts without changing auth, Stripe, or entitlement behavior.                         |
| Contact and analysis trust copy | `done`    | `#748/#749`, `docs/task-briefs/done/2026-05-18-aw-006-contact-analysis-trust-copy-10-10.md`                          | Strengthened `/contact` and `/analysis` trust copy, response expectation, privacy boundary, and input guidance without changing contact delivery behavior.                                        |
| Anonymous course progress noise | `done`    | `#750/#751`, `docs/task-briefs/done/2026-05-18-aw-006-anonymous-course-progress-noise-10-10.md`                      | Stopped guest `/course` browsing from mounting admin lesson notes or calling protected admin notes APIs while preserving signed-in progress/admin behavior.                                       |
| Owner-readable slice start gate | `done`    | `#752/#753`, `docs/task-briefs/done/2026-05-18-owner-readable-slice-start-governance-10-10.md`                       | Added the required Norwegian non-programmer explanation before each new brief or implementation slice.                                                                                            |
| Sample deliverable proof        | `done`    | `#754/#755`, `docs/task-briefs/done/2026-05-18-aw-006-sample-deliverable-proof-10-10.md`                             | Added truthful sample/proof expectations for Poolside PDF and Video Analysis on `/programs` and `/analysis` without changing checkout, contact delivery, entitlements, or generated deliverables. |
| My Library surface polish       | `done`    | `#758/#759`, `docs/task-briefs/done/2026-05-19-aw-006-my-library-surface-token-action-hierarchy-polish-10-10.md`     | Applied AW-006 token-backed hierarchy to the signed-in `/my-library` hub with screenshot-reviewed desktop/mobile polish and no member data, auth, commerce, or child route behavior changes.      |
| Shared notice/empty inventory   | `done`    | `#760`, `docs/task-briefs/done/2026-05-19-aw-006-shared-notice-empty-state-pattern-inventory-10-10.md`               | Inventoried repeated state treatments and selected the admin management feedback/list-state primitive pilot without changing rendered UI or runtime behavior.                                     |
| Admin state primitive pilot     | `done`    | `#762/#763`, `docs/task-briefs/done/2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10.md` | Added a bounded admin-local state helper for Commerce, Operations, and QR registry loading/warning/error/action/empty/no-results states without changing admin data, authz, mutations, or labels. |
| Stable visual baseline pilot    | `done`    | `#764/#765`, `docs/task-briefs/done/2026-05-19-aw-006-stable-visual-baseline-snapshot-pilot-10-10.md`                | Added on-demand mobile/desktop reference screenshots for the public AW-006 route set without committing artifacts or changing product rendering.                                                  |
| Queue lifecycle automation      | `done`    | `#766/#767`, `docs/task-briefs/done/2026-05-19-aw-006-canonical-queue-lifecycle-automation-10-10.md`                 | Added lint and post-merge preflight coverage so done child briefs with canonical queues cannot remain listed as active in-progress queue items unnoticed.                                         |

## Remaining PR-Sized UX/UI Slices

Recommended order unless the owner explicitly reprioritizes:

1. `Shared notice/empty-state primitive expansion` (current implementation slice)
   - Objective: after the inventory and admin-local pilot, apply the proven notice/list-state contract to one additional bounded surface or shared primitive without broad design-system churn.
   - Active brief: `docs/task-briefs/in-progress/2026-05-19-aw-006-shared-notice-empty-state-primitive-expansion-10-10.md`
   - Likely files: `components/admin/AdminEmailTemplatesManager.tsx`, `components/admin/AdminManagerState.tsx` if a tiny compatibility adjustment is needed, targeted unit tests, and this queue.
   - Risks: turning a PR-sized primitive expansion into a broad Button/Card/PageShell redesign.
   - Protected areas: admin/member data, authz, recovery actions, Help/Guide if workflow labels change, screenshot handoff if rendered UI changes.

## 10/10 Phase Plan Capture

### Phase 1: Quick Wins

- Finish mobile safe-area regression coverage. Status: `done`.
- Verify or finish contextual sign-in clarity for admin/member/checkout contexts.
- Improve course desktop first viewport.
- Improve plans price/value/trust/expectation copy without changing checkout mechanics.
- Clarify `/about` versus method/about IA and remove under-quality method-page presentation found during screenshot review.
- Reduce optional anonymous course-progress console noise if still present. Status: `done`.
- Add truthful sample deliverable proof for Poolside PDF and Video Analysis. Status: `done`.
- Re-audit remaining AW-006 queue after sample proof. Status: `done`.

### Phase 2: Core UX / Design System

- Introduce disciplined tokens for color, radius, shadow, spacing, and type.
- Apply the proven public token direction to one signed-in hub before broad component consolidation. Status: `done` for `/my-library`.
- Inventory shared Notice/EmptyState/Loading/Error patterns. Status: `done`.
- Start with one admin-local primitive pilot before any broad shared-component rollout.
- Build or consolidate shared Button, Card, PageShell, Field, Notice, EmptyState, Tabs, and StatusBadge patterns only after one or more bounded pilots prove the contracts.
- Standardize bottom-nav safe-area and screenshot regression coverage.
- Break up large member/admin monoliths into smaller view/state modules when touched.

### Phase 3: Premium Polish And Conversion

- Redesign `/plans` as comparison plus proof plus secure checkout expectations.
- Add sample deliverables for PDF/video analysis where accurate. Status: `done`.
- Improve post-purchase expectation/recovery flow.
- Add safe funnel instrumentation for price seen, checkout clicked, and recovery clicked if not already present.
- Strengthen contact/analysis trust copy, response expectation, and input guidance.

### Phase 4: Advanced Refinement

- Add stable visual baseline snapshots for home, course, plans, contact, and member surfaces. Status: `done` for the public-route pilot.
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
  - `Sample deliverable`
  - `My Library`
  - `Shared notice`
  - `Empty state`
  - `Admin management feedback`
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
- `2026-05-18 | planned | refreshed after Contextual Sign-In Clarity #746/#747 on clean main@b9f3b7d; marked contextual sign-in done and promoted Contact and Analysis Trust Copy as the next small PR-sized AW-006 UX/UI slice | next: execute docs/task-briefs/in-progress/2026-05-18-aw-006-contact-analysis-trust-copy-10-10.md`
- `2026-05-18 | planned | refreshed after Contact/Analysis Trust Copy #748/#749 on clean main@2ed797f; marked contact/analysis done and promoted Anonymous Course Progress Noise as the next small PR-sized AW-006 UX/UI slice | next: execute docs/task-briefs/in-progress/2026-05-18-aw-006-anonymous-course-progress-noise-10-10.md`
- `2026-05-18 | planned | refreshed after Anonymous Course Progress Noise #750/#751 and Owner-Readable Slice Start Governance #752/#753 on clean main@88ff6ee; marked anonymous course noise and start-governance done, and promoted Sample Deliverable Proof as the next small PR-sized AW-006 UX/UI slice | next: execute docs/task-briefs/in-progress/2026-05-18-aw-006-sample-deliverable-proof-10-10.md`
- `2026-05-19 | planned | refreshed after Sample Deliverable Proof #754/#755 on clean main@61d7f8a; marked sample proof done, recorded this docs-only re-audit slice, and promoted My Library surface token and action hierarchy polish as the next small AW-006 UX/UI implementation slice | next: execute a new active brief for /my-library surface token and action hierarchy polish`
- `2026-05-19 | planned | refreshed after AW-006 queue re-audit #756 on clean main@7963705; marked the re-audit done and kept My Library surface token and action hierarchy polish as the next small AW-006 UX/UI implementation slice | next: create and execute a new active brief for /my-library surface token and action hierarchy polish`
- `2026-05-19 | planned | refreshed after repo-managed closeout #757 on clean main@9b5c05f; linked the active /my-library surface token and action hierarchy polish brief as the current canonical AW-006 implementation slice | next: complete screenshot-reviewed implementation before broad gates`
- `2026-05-19 | planned | refreshed after My Library surface polish #758/#759 on clean main@5f6f27e; marked My Library done and promoted Shared notice and empty-state pattern inventory as the current AW-006 slice, with an admin management feedback/list-state primitive pilot as the recommended next implementation slice after inventory | next: complete docs-only inventory and validation`
- `2026-05-19 | planned | refreshed after Shared notice and empty-state inventory #760 on clean main@1d41a84; marked inventory done and promoted Admin management feedback and list-state primitive pilot as the next small AW-006 UX/UI implementation slice | next: create and execute a new active brief for the admin management feedback/list-state primitive pilot`
- `2026-05-19 | planned | refreshed after repo-managed closeout #761 on clean main@20320df; linked the active Admin management feedback and list-state primitive pilot brief as the current canonical AW-006 implementation slice | next: complete screenshot-reviewed implementation before broad gates`
- `2026-05-19 | planned | refreshed after Admin management feedback/list-state primitive pilot #762 and repo-managed closeout #763 on clean main@6a2cada; marked admin primitive done and linked the active Stable visual baseline snapshot pilot as the current canonical AW-006 implementation slice | next: complete bounded on-demand screenshot baseline tooling and validation`
- `2026-05-19 | planned | refreshed after Stable visual baseline snapshot pilot #764 and repo-managed closeout #765 on clean main@efdb262; marked visual baseline done and linked the active Canonical queue lifecycle automation slice so future done child briefs with canonical queues cannot leave stale active in-progress references unnoticed | next: complete lint/preflight automation, then use the updated queue to start the shared notice/empty-state primitive expansion candidate`
- `2026-05-19 | planned | refreshed after Canonical queue lifecycle automation #766 and repo-managed closeout #767 on clean main@310de37; marked queue automation done and promoted Shared notice/empty-state primitive expansion as the next AW-006 implementation candidate | next: create and execute a new active brief for the shared notice/empty-state primitive expansion slice`
- `2026-05-19 | planned | refreshed after clean main@d0f978c and post-merge preflight; linked the active Shared notice/empty-state primitive expansion brief as the current canonical AW-006 implementation slice, scoped to Admin Email templates state rendering | next: complete screenshot-reviewed implementation before broad gates`
