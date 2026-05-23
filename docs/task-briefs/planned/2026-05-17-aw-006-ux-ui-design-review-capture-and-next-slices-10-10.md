# Task Brief: AW-006 UX/UI Design Review Capture And Next Slices (10/10)

## Metadata

- `id`: `2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-23`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-03-10-aw-006-cross-platform-ux-design-hardening-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@ce74758`
- `audit_status`: `ready`
- `decision`: Keep this brief as the canonical repo capture for the 2026-05-16 full UX/UI design review and PR-sized AW-006 follow-up queue.
- `reason`: The original review lived only in chat after `main@be554e9`; shipped follow-ups through `#814` are recorded below. Plans Funnel Analytics Payload Hardening is complete and no next AW-006 implementation slice is selected.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, mobile nav, auth sign-in, course/player, plans/payment copy, `/about`, design tokens, admin state primitives, task-brief closeout rules, screenshot handoff rules, or verification lanes change before the next UX/UI slice starts.

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
- Completed follow-up execution:
  - `docs/task-briefs/done/2026-05-19-aw-006-admin-messages-state-primitive-second-wave-10-10.md`
  - shipped through `#772`, scoped to applying the admin-local state primitive to Admin Messages loading, warning, error+retry, action feedback, empty/no-results, and no-selection states without changing message data, authz, API behavior, delivery diagnostics, copy, or workflow labels.
- Completed auth feedback cleanup:
  - `docs/task-briefs/done/2026-05-19-aw-006-auth-feedback-source-of-truth-cleanup-10-10.md`
  - shipped through `#774/#775`, scoped to keeping `/auth/sign-in` on one maintained request-feedback source and hydration-safe cooldown labels without changing auth behavior, cooldown cadence, redirects, provider calls, or sign-in copy.
- Completed guide tracker follow-up:
  - `docs/task-briefs/done/2026-05-19-aw-006-guide-tracker-sync-state-clarity-10-10.md`
  - shipped through `#776/#777`, scoped to making 0-1000m and Poolside guide tracker saved/syncing/offline/error status clearer and consistent without changing guide progress storage, API shape, auth, entitlements, or localStorage keys.
- Completed checkout and claim recovery follow-up:
  - `docs/task-briefs/done/2026-05-20-aw-006-checkout-success-claim-recovery-clarity-10-10.md`
  - shipped through `#778/#779`, scoped to improving `/checkout/success` and `/claim` post-purchase recovery clarity without changing Stripe Checkout Sessions, webhooks, entitlements, auth, email delivery, Supabase, analytics taxonomy, or finance behavior.
- Completed Admin Context QR follow-up:
  - `docs/task-briefs/done/2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10.md`
  - shipped through `#780/#781`, scoped to applying the existing admin-local state primitive to the contextual QR panel inside admin content editing without changing QR APIs, slug/status behavior, authz, content editor workflows, or support procedures.
- Completed follow-up execution:
  - `docs/task-briefs/done/2026-05-22-aw-006-admin-note-screenshot-capture-feedback-state-parity-10-10.md`
  - shipped through `#804`, scoped to reusing the admin-local state primitive for admin note screenshot-capture recovery/save-error feedback without changing screenshot capture, crop, upload, note attachment, recovery, authz, API, database, or support behavior.
- Completed lifecycle repair:
  - `docs/task-briefs/done/2026-05-20-aw-006-closeout-queue-gate-repair-10-10.md`
  - shipped through `#782`, scoped to repairing AW-006 queue/inventory closeout state and strict docs-only brief lint coverage before the next visible UI state-primitive slice.
- Completed Admin Notes and Content Manager state-parity follow-ups:
  - `docs/task-briefs/done/2026-05-20-aw-006-admin-notes-manager-top-level-state-primitive-parity-10-10.md`
  - shipped through `#784/#785`, scoped to applying the admin-local state primitive to Admin Notes top-level states.
  - `docs/task-briefs/done/2026-05-20-aw-006-admin-context-notes-panel-state-primitive-parity-10-10.md`
  - shipped through `#786/#787`, scoped to applying the same primitive to the contextual notes panel.
  - `docs/task-briefs/done/2026-05-20-aw-006-post-closeout-queue-design-inventory-repair-10-10.md`
  - shipped through `#788/#789`, scoped to repairing stale queue/design-inventory references after Context Notes.
  - `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-top-level-state-parity-10-10.md`
  - shipped through `#790/#791`, scoped to applying the primitive to Admin Content Manager top-level states.
- Completed export/action feedback follow-ups:
  - `docs/task-briefs/done/2026-05-22-aw-006-guide-pdf-download-feedback-clarity-10-10.md`
  - shipped through `#808`, scoped to Guide PDF download pending/error feedback without changing PDF generation, APIs, entitlements, analytics, filenames, or guide content.
  - `docs/task-briefs/done/2026-05-22-aw-006-commerce-action-feedback-semantics-10-10.md`
  - shipped through `#810`, scoped to checkout start, billing portal, and access-link resend feedback semantics without changing Stripe/API payloads, entitlements, email delivery, analytics taxonomy, finance behavior, or route design.
  - `docs/task-briefs/done/2026-05-22-aw-006-poolside-preview-save-image-feedback-clarity-10-10.md`
  - shipped through `#812`, scoped to Poolside preview save-image feedback clarity without changing image capture, filenames, share/download mechanics, PDF/print layout, data, or APIs.

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

| Slice                                                        | Status    | Evidence                                                                                                                | Notes                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile CTA safe-area hardening                               | `done`    | `#730/#731`, `docs/task-briefs/done/2026-05-16-mobile-cta-safe-area-hardening-10-10.md`                                 | Completed the first approved UX/UI audit task.                                                                                                                                                                                                                    |
| Auth sign-in fallback clarity                                | `partial` | `#732/#733`, `docs/task-briefs/done/2026-05-17-auth-sign-in-link-first-otp-fallback-clarity-10-10.md`                   | Covered link-first + one-time-code fallback and iPhone Home Screen guidance; contextual `next` copy still needs a focused audit before marking the review item fully done.                                                                                        |
| Goals action-first                                           | `done`    | `#726/#727`, `docs/task-briefs/done/2026-05-16-goals-action-first-simplification-10-10.md`                              | Shipped before the captured full review; aligns with the review's action-first dashboard/member direction.                                                                                                                                                        |
| My Swim Profile action-first                                 | `done`    | `#728/#729`, `docs/task-briefs/done/2026-05-16-my-swim-profile-action-first-setup-and-capability-safety-10-10.md`       | Shipped before the captured full review; aligns with onboarding/member readiness findings.                                                                                                                                                                        |
| Course desktop player polish                                 | `done`    | `#735/#736`, `docs/task-briefs/done/2026-05-17-course-desktop-player-polish-10-10.md`                                   | Shipped the first viewport desktop course/player polish that was originally the top remaining AW-006 item.                                                                                                                                                        |
| Plans conversion baseline                                    | `done`    | `#737/#738`, `docs/task-briefs/done/2026-05-17-aw-006-plans-conversion-baseline-10-10.md`                               | Shipped clearer `/plans` value, proof, and checkout expectation copy without changing Stripe mechanics.                                                                                                                                                           |
| Public IA / about cleanup                                    | `done`    | `#740/#741`, `docs/task-briefs/done/2026-05-17-aw-006-public-ia-about-cleanup-10-10.md`                                 | Retired the stale `/about` page surface, corrected legacy redirect behavior, and made `/our-method` the canonical method page.                                                                                                                                    |
| Design token foundation proof                                | `done`    | `#742/#743`, `docs/task-briefs/done/2026-05-18-aw-006-design-token-foundation-public-proof-10-10.md`                    | Established the first global token foundation and proved it on `/our-method` only.                                                                                                                                                                                |
| Programs Poolside PDF polish                                 | `done`    | `#744/#745`, `docs/task-briefs/done/2026-05-18-aw-006-programs-poolside-pdf-token-polish-10-10.md`                      | Applied the token foundation to `/programs` Poolside/PDF cards and refreshed the public value path without changing checkout, entitlement, guide, or PDF internals.                                                                                               |
| Contextual sign-in clarity                                   | `done`    | `#746/#747`, `docs/task-briefs/done/2026-05-17-aw-006-contextual-sign-in-clarity-audit-10-10.md`                        | Added contextual `/auth/sign-in` explanation for admin, My Library, checkout success, and claim/download contexts without changing auth, Stripe, or entitlement behavior.                                                                                         |
| Contact and analysis trust copy                              | `done`    | `#748/#749`, `docs/task-briefs/done/2026-05-18-aw-006-contact-analysis-trust-copy-10-10.md`                             | Strengthened `/contact` and `/analysis` trust copy, response expectation, privacy boundary, and input guidance without changing contact delivery behavior.                                                                                                        |
| Anonymous course progress noise                              | `done`    | `#750/#751`, `docs/task-briefs/done/2026-05-18-aw-006-anonymous-course-progress-noise-10-10.md`                         | Stopped guest `/course` browsing from mounting admin lesson notes or calling protected admin notes APIs while preserving signed-in progress/admin behavior.                                                                                                       |
| Owner-readable slice start gate                              | `done`    | `#752/#753`, `docs/task-briefs/done/2026-05-18-owner-readable-slice-start-governance-10-10.md`                          | Added the required Norwegian non-programmer explanation before each new brief or implementation slice.                                                                                                                                                            |
| Sample deliverable proof                                     | `done`    | `#754/#755`, `docs/task-briefs/done/2026-05-18-aw-006-sample-deliverable-proof-10-10.md`                                | Added truthful sample/proof expectations for Poolside PDF and Video Analysis on `/programs` and `/analysis` without changing checkout, contact delivery, entitlements, or generated deliverables.                                                                 |
| My Library surface polish                                    | `done`    | `#758/#759`, `docs/task-briefs/done/2026-05-19-aw-006-my-library-surface-token-action-hierarchy-polish-10-10.md`        | Applied AW-006 token-backed hierarchy to the signed-in `/my-library` hub with screenshot-reviewed desktop/mobile polish and no member data, auth, commerce, or child route behavior changes.                                                                      |
| Shared notice/empty inventory                                | `done`    | `#760`, `docs/task-briefs/done/2026-05-19-aw-006-shared-notice-empty-state-pattern-inventory-10-10.md`                  | Inventoried repeated state treatments and selected the admin management feedback/list-state primitive pilot without changing rendered UI or runtime behavior.                                                                                                     |
| Admin state primitive pilot                                  | `done`    | `#762/#763`, `docs/task-briefs/done/2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10.md`    | Added a bounded admin-local state helper for Commerce, Operations, and QR registry loading/warning/error/action/empty/no-results states without changing admin data, authz, mutations, or labels.                                                                 |
| Stable visual baseline pilot                                 | `done`    | `#764/#765`, `docs/task-briefs/done/2026-05-19-aw-006-stable-visual-baseline-snapshot-pilot-10-10.md`                   | Added on-demand mobile/desktop reference screenshots for the public AW-006 route set without committing artifacts or changing product rendering.                                                                                                                  |
| Queue lifecycle automation                                   | `done`    | `#766/#767`, `docs/task-briefs/done/2026-05-19-aw-006-canonical-queue-lifecycle-automation-10-10.md`                    | Added lint and post-merge preflight coverage so done child briefs with canonical queues cannot remain listed as active in-progress queue items unnoticed.                                                                                                         |
| Shared notice/state expansion                                | `done`    | `#768/#769`, `docs/task-briefs/done/2026-05-19-aw-006-shared-notice-empty-state-primitive-expansion-10-10.md`           | Expanded the admin-local state helper to Email templates loading, warning, error, action, empty, and revision-history states without changing admin data, authz, mutations, or labels.                                                                            |
| Admin Categories state primitive completion                  | `done`    | `#770/#771`, `docs/task-briefs/done/2026-05-19-aw-006-admin-categories-state-primitive-completion-10-10.md`             | Completed the low-risk admin-management state primitive pass on Admin Categories warning, loading, error+retry, empty, and action-error states without changing admin data, authz, mutations, labels, or support procedures.                                      |
| Admin Messages state primitive second-wave                   | `done`    | `#772/#773`, `docs/task-briefs/done/2026-05-19-aw-006-admin-messages-state-primitive-second-wave-10-10.md`              | Applied the admin-local state helper to Admin Messages loading, warning, load error+retry, action feedback, empty/no-results, and no-selection states without changing message data, authz, delivery diagnostics, labels, or support procedures.                  |
| Auth feedback source-of-truth cleanup                        | `done`    | `#774/#775`, `docs/task-briefs/done/2026-05-19-aw-006-auth-feedback-source-of-truth-cleanup-10-10.md`                   | Cleaned up overlapping auth feedback ownership so `/auth/sign-in` keeps one maintained request-feedback source and stable cooldown hydration without changing auth behavior, cooldown rules, redirects, or copy.                                                  |
| Guide tracker sync-state clarity                             | `done`    | `#776/#777`, `docs/task-briefs/done/2026-05-19-aw-006-guide-tracker-sync-state-clarity-10-10.md`                        | Makes 0-1000m and Poolside guide tracker saved/syncing/offline/error status clearer and consistent without changing guide progress storage, API shape, auth, entitlements, or localStorage keys.                                                                  |
| Checkout success and claim recovery clarity                  | `done`    | `#778/#779`, `docs/task-briefs/done/2026-05-20-aw-006-checkout-success-claim-recovery-clarity-10-10.md`                 | Improved `/checkout/success` and `/claim` post-purchase next-step clarity and recovery presentation without changing Stripe, auth, entitlement, email, Supabase, analytics, or finance behavior.                                                                  |
| Admin Context QR Panel state parity                          | `done`    | `#780/#781`, `docs/task-briefs/done/2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10.md`           | Applied the proven admin-local state primitive to the contextual QR panel inside admin content editing without changing QR APIs, authz, content editor workflows, labels, or support procedures.                                                                  |
| AW-006 closeout queue/gate repair                            | `done`    | `#782`, `docs/task-briefs/done/2026-05-20-aw-006-closeout-queue-gate-repair-10-10.md`                                   | Repaired stale AW-006 queue/inventory state after `#780/#781` and made docs-only verification run strict changed-brief closeout lint before the next UI slice.                                                                                                    |
| Admin Notes Manager top-level state parity                   | `done`    | `#784`, `docs/task-briefs/done/2026-05-20-aw-006-admin-notes-manager-top-level-state-primitive-parity-10-10.md`         | Applied the admin-local state primitive to Admin Notes top-level warning, loading, load error+retry, action feedback, empty, and no-results states without changing notes APIs, authz, filters, attachments, related-note behavior, or labels.                    |
| Admin Context Notes Panel state parity                       | `done`    | `#786/#787`, `docs/task-briefs/done/2026-05-20-aw-006-admin-context-notes-panel-state-primitive-parity-10-10.md`        | Applied the proven admin-local state primitive to the contextual notes panel inside admin content editing without changing notes APIs, authz, attachments, related-note behavior, labels, or support procedures.                                                  |
| AW-006 post-closeout queue repair                            | `done`    | `#788/#789`, `docs/task-briefs/done/2026-05-20-aw-006-post-closeout-queue-design-inventory-repair-10-10.md`             | Repaired the stale Context Notes queue/inventory lifecycle state after `#786/#787`, leaving no active UI slice until the next fresh re-audit.                                                                                                                     |
| Admin Content Manager top-level state parity                 | `done`    | `#790/#791`, `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-top-level-state-parity-10-10.md`            | Applied the proven admin-local state primitive to Admin Content Manager top-level warning, loading, load error+retry, action feedback, empty, and no-results states without changing content APIs, authz, Context Notes/QR, labels, or workflows.                 |
| AW-006 closeout reference guard                              | `done`    | `#792`, `docs/task-briefs/done/2026-05-21-aw-006-closeout-reference-guard-10-10.md`                                     | Added lint and post-merge preflight coverage for stale completed-slice status references in the canonical queue and design inventory without changing runtime UI or product behavior.                                                                             |
| Admin Content Manager revision-history state parity          | `done`    | `#794`, `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-revision-history-state-parity-10-10.md`          | Applied the admin-local state primitive to Admin Content Manager revision-history loading, error+retry, and empty states using Email templates revision history as the reference, without changing content revision APIs, restore payloads, labels, or workflows. |
| Admin Content Manager course workspace empty-state parity    | `done`    | `#796`, `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-course-workspace-empty-state-parity-10-10.md`    | Reused the admin-local `AdminManagerState` helper for scoped course-workspace empty states without changing content APIs, module/lesson behavior, labels, ordering, Context Notes, or QR.                                                                         |
| Admin Content Manager inline form feedback state parity      | `done`    | `#798/#799`, `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-inline-form-feedback-state-parity-10-10.md` | Reused the admin-local `AdminManagerState` helper for inline form feedback without changing content APIs, labels, course-structure recovery behavior, Context Notes, Context QR, or support procedures.                                                           |
| Admin Content Manager course-structure feedback state parity | `done`    | `#800`, `docs/task-briefs/done/2026-05-22-aw-006-admin-content-manager-course-structure-feedback-state-parity-10-10.md` | Reused the admin-local `AdminManagerState` helper for course-structure follow-up feedback without changing content APIs, labels, normalize/delete behavior, Context Notes, Context QR, or support procedures.                                                     |
| Admin QR Registry asset feedback state parity                | `done`    | `#802/#803`, `docs/task-briefs/done/2026-05-22-aw-006-admin-qr-registry-asset-feedback-state-parity-10-10.md`           | Reused the admin-local `AdminManagerState` helper for QR asset generation loading/error feedback without changing QR APIs, stable links, status behavior, downloads, authz, or support procedures.                                                                |
| Admin Note Screenshot Capture feedback state parity          | `done`    | `#804`, `docs/task-briefs/done/2026-05-22-aw-006-admin-note-screenshot-capture-feedback-state-parity-10-10.md`          | Reused the admin-local `AdminManagerState` helper for screenshot-capture recovery/save-error feedback without changing screenshot capture, crop, upload, note attachment, recovery, authz, API, database, or support behavior.                                    |
| Guide PDF Download Feedback Clarity                          | `done`    | `#808`, `docs/task-briefs/done/2026-05-22-aw-006-guide-pdf-download-feedback-clarity-10-10.md`                          | Made shared guide PDF download pending/error feedback clearer and accessible without changing PDF generation, APIs, entitlements, analytics, filenames, or guide content.                                                                                         |
| Commerce Action Feedback Semantics                           | `done`    | `#810`, `docs/task-briefs/done/2026-05-22-aw-006-commerce-action-feedback-semantics-10-10.md`                           | Gave checkout start, billing portal, and download access resend actions consistent feedback semantics without changing Stripe, API payloads, entitlements, email delivery, analytics taxonomy, finance behavior, or route design.                                 |
| Poolside Preview Save Image Feedback Clarity                 | `done`    | `#812`, `docs/task-briefs/done/2026-05-22-aw-006-poolside-preview-save-image-feedback-clarity-10-10.md`                 | Made Poolside preview save-image pending/success/error feedback clearer and accessible without changing image capture, filenames, share/download mechanics, PDF/print layout, data, or APIs.                                                                      |

## Remaining PR-Sized UX/UI Slices

No AW-006 implementation slice is selected after Plans Funnel Analytics Payload Hardening shipped in PR `#814`. Run a fresh queue/design/code re-audit before starting the next AW-006 slice.

| Slice                                        | Status | Evidence                                                                                                | Notes                                                                                                                                                        |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Plans Funnel Analytics Payload Hardening     | `done` | `#814`, `docs/task-briefs/done/2026-05-23-aw-006-plans-funnel-analytics-payload-hardening-10-10.md`     | Added safe product-availability context to existing `/plans` analytics payloads without changing event taxonomy, UI, Stripe, checkout, prices, or user data. |
| Poolside Preview Save Image Feedback Clarity | `done` | `#812`, `docs/task-briefs/done/2026-05-22-aw-006-poolside-preview-save-image-feedback-clarity-10-10.md` | Completed Poolside preview save-image feedback clarity.                                                                                                      |
| Guide PDF Download Feedback Clarity          | `done` | `#808`, `docs/task-briefs/done/2026-05-22-aw-006-guide-pdf-download-feedback-clarity-10-10.md`          | Completed shared guide PDF download feedback clarity.                                                                                                        |
| Commerce Action Feedback Semantics           | `done` | `#810`, `docs/task-briefs/done/2026-05-22-aw-006-commerce-action-feedback-semantics-10-10.md`           | Completed feedback semantics for checkout start, billing portal, and access-link resend only.                                                                |

Protected areas:

- QR API changes,
- QR slug/status behavior changes,
- stable redirect or `/go/v/[slug]` behavior changes,
- QR asset generation internals or SVG/PNG download behavior changes,
- content API changes,
- Context Notes or Context QR behavior changes,
- admin content editor redesign,
- admin notes upload/recovery behavior,
- broad app-wide Notice/EmptyState primitives,
- guide offline/sync states,
- guide PDF API routes,
- guide PDF generation/assets,
- guide entitlement behavior,
- Poolside preview image capture driver changes,
- Poolside preview generated filename changes,
- Poolside preview PDF/print layout changes,
- dryland/micro session state flows,
- public visual redesign,
- commerce API or Stripe behavior,
- checkout, portal, or resend payloads,
- entitlement or email delivery behavior,
- Supabase, Stripe, auth, analytics, or API behavior.

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
- Continue bounded admin-local primitive parity only where a mature reference surface already exists. Prior contextual/admin content, QR Registry, and admin note screenshot-capture parity passes are shipped; the next slice needs a fresh re-audit before selection.
- Build or consolidate shared Button, Card, PageShell, Field, Notice, EmptyState, Tabs, and StatusBadge patterns only after one or more bounded pilots prove the contracts.
- Standardize bottom-nav safe-area and screenshot regression coverage.
- Break up large member/admin monoliths into smaller view/state modules when touched.

### Phase 3: Premium Polish And Conversion

- Redesign `/plans` as comparison plus proof plus secure checkout expectations.
- Add sample deliverables for PDF/video analysis where accurate. Status: `done`.
- Improve post-purchase expectation/recovery flow. Status: `done`.
- Add safe funnel instrumentation for price seen, checkout clicked, and recovery clicked if not already present. Status: `done` for `/plans` product-availability payload hardening in PR `#814`.
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
- `2026-05-19 | planned | refreshed after Shared notice/state expansion #768 and repo-managed closeout #769 on clean main@a88a9ff; marked shared state expansion done and linked the active Admin Categories state primitive completion brief as the current canonical AW-006 implementation slice | next: complete screenshot-reviewed implementation before broad gates`
- `2026-05-19 | planned | refreshed after Admin Categories state primitive completion #770 and repo-managed closeout #771 on clean main@c9fb29d; marked Admin Categories done and linked the active Admin Messages state primitive second-wave brief as the current canonical AW-006 implementation slice | next: complete screenshot-reviewed implementation before broad gates`
- `2026-05-19 | planned | refreshed after Admin Messages state primitive second-wave #772 on clean main@49c8a3f; marked Admin Messages done and replaced the stale active implementation pointer with a queue re-audit next step | next: start a new chat before selecting the next AW-006 implementation slice`
- `2026-05-19 | planned | refreshed after Admin Messages closeout #773 on clean main@53b569b; post-merge preflight found no pending closeout and a short re-audit promoted Auth Feedback Source Of Truth Cleanup as the current bounded AW-006 implementation slice | next: execute docs/task-briefs/in-progress/2026-05-19-aw-006-auth-feedback-source-of-truth-cleanup-10-10.md`
- `2026-05-19 | planned | refreshed after Auth Feedback Source Of Truth Cleanup #774 and repo-managed closeout #775 on clean main@79c0d9d; post-merge preflight found no pending closeout and a short re-audit promoted Guide Tracker Sync State Clarity as the current bounded AW-006 implementation slice | next: execute docs/task-briefs/in-progress/2026-05-19-aw-006-guide-tracker-sync-state-clarity-10-10.md`
- `2026-05-20 | planned | refreshed after Guide Tracker Sync State Clarity #776 and repo-managed closeout #777 on clean main@7529c73; post-merge preflight found no pending closeout and a short re-audit promoted Checkout Success And Claim Recovery Clarity as the current bounded AW-006 implementation slice | next: execute docs/task-briefs/in-progress/2026-05-20-aw-006-checkout-success-claim-recovery-clarity-10-10.md`
- `2026-05-20 | planned | refreshed after Checkout Success And Claim Recovery Clarity #778 and repo-managed closeout #779 on clean main@92ef0db; post-merge preflight found no pending closeout and a short re-audit promoted Admin Context QR Panel State Primitive Parity as the current bounded AW-006 implementation slice | next: execute docs/task-briefs/in-progress/2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10.md`
- `2026-05-20 | planned | refreshed after Admin Context QR Panel State Primitive Parity #780 and repo-managed closeout #781 on clean main@ac82cbf; post-merge preflight found no pending closeout, but npm run lint:briefs failed on the latest closeout heading and this queue still marked Context QR current; promoted AW-006 Closeout Queue And Gate Repair as the current lifecycle repair before the next UI slice | next: execute docs/task-briefs/in-progress/2026-05-20-aw-006-closeout-queue-gate-repair-10-10.md`
- `2026-05-20 | planned | refreshed after AW-006 Closeout Queue And Gate Repair #782 on clean main@af6e641; marked the lifecycle repair done and kept Admin Notes Manager top-level state parity as the next bounded AW-006 UI slice | next: start a new chat before creating the Admin Notes Manager implementation brief`
- `2026-05-20 | planned | refreshed after repo-managed closeout #783 on clean main@bf48007; post-merge preflight found no pending closeout and linked the active Admin Notes Manager top-level state primitive parity brief as the current bounded AW-006 implementation slice | next: complete screenshot-reviewed implementation before broad gates`
- `2026-05-20 | planned | refreshed after Admin Notes Manager top-level state parity #784 on clean main@a8ae452; marked Admin Notes done and left the next AW-006 UI slice unselected pending post-closeout queue/design-inventory re-audit | next: complete repo-managed closeout, rerun post-merge preflight, then start a new chat before selecting the next slice`
- `2026-05-20 | planned | refreshed after Admin Notes Manager closeout #785 on clean main@803aafe; post-merge preflight found no pending closeout and a short queue/design/code re-audit promoted Admin Context Notes Panel State Primitive Parity as the then-current bounded AW-006 implementation slice | next: execute the Context Notes implementation brief, later moved to done by #787`
- `2026-05-20 | closeout | PR #786 merged and repo-managed closeout moved the Admin Context Notes Panel state parity brief to done; queue now records the slice as done with no active next slice selected | next: run a short queue/design inventory re-audit before starting any new AW-006 implementation slice`
- `2026-05-20 | planned | refreshed after repo-managed closeout #787 on clean main@f45ac94; post-merge preflight found no pending closeout, but the short re-audit found stale Context Notes active/current references in this queue and the design inventory | next: execute docs/task-briefs/in-progress/2026-05-20-aw-006-post-closeout-queue-design-inventory-repair-10-10.md before selecting the next AW-006 UI slice`
- `2026-05-21 | planned | refreshed after AW-006 post-closeout queue repair #788 and repo-managed closeout #789 on clean main@293eb38; post-merge preflight found no pending closeout and the short queue/design/code re-audit selected Admin Content Manager top-level state parity as the next bounded AW-006 UI slice | next: execute docs/task-briefs/in-progress/2026-05-21-aw-006-admin-content-manager-top-level-state-parity-10-10.md`
- `2026-05-21 | planned | refreshed after Admin Content Manager top-level state parity #790 and repo-managed closeout #791 on clean main@0a9aa7d; enhanced local post-merge preflight proved the old guard missed stale title-based active/current/candidate references in this queue and the design inventory | next: execute docs/task-briefs/in-progress/2026-05-21-aw-006-closeout-reference-guard-10-10.md before selecting the next AW-006 UI slice`
- `2026-05-21 | closeout | refreshed after closeout reference guard #792 on clean main@601a5bc; moved the guard brief to done and left no next AW-006 UI slice selected | next: run a fresh queue/design/code re-audit before selecting another AW-006 implementation slice`
- `2026-05-21 | closeout | PR #794 shipped the latest Admin Content Manager revision-history state work and this repo-managed closeout moves its brief to done; the queue/design inventory now leave no selected next AW-006 UI slice | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-21 | planned | refreshed after Admin Content Manager course workspace empty-state parity #796 and repo-managed closeout #797 on clean main@44df95d; post-merge preflight was reported green with no pending closeout and a short queue/design/code re-audit selected Admin Content Manager inline form feedback state parity as the next bounded AW-006 UI slice | next: execute docs/task-briefs/in-progress/2026-05-21-aw-006-admin-content-manager-inline-form-feedback-state-parity-10-10.md`
- `2026-05-22 | closeout | PR #798 shipped the selected Admin Content Manager inline feedback parity slice and this repo-managed closeout moves its brief to done; the queue now leaves no active AW-006 UI slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-22 | planned | refreshed after Admin Content Manager inline feedback closeout #799 on clean main@8bab696; post-merge preflight was reported green with no pending closeout and a short queue/design/code re-audit selected the course-structure feedback slice that later shipped via #800 | next: completed by PR #800`
- `2026-05-22 | closeout | PR #800 shipped the selected Admin Content Manager course-structure feedback parity slice and this repo-managed closeout moves its brief to done; the queue now leaves no active AW-006 UI slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-22 | planned | refreshed after PR #800 and repo-managed closeout #801 on clean main@37736ae; post-merge preflight was reported green with no pending closeout and a short queue/design/code re-audit selected Admin QR Registry asset feedback state parity as the current bounded AW-006 UI slice | next: execute docs/task-briefs/in-progress/2026-05-22-aw-006-admin-qr-registry-asset-feedback-state-parity-10-10.md`
- `2026-05-22 | closeout | PR #802 shipped the selected Admin QR Registry asset feedback parity slice and this repo-managed closeout moves its brief to done; the queue now leaves no active AW-006 UI slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-22 | planned | refreshed after PR #802 and repo-managed closeout #803 on clean main@2f41bb6; post-merge preflight was reported green with no pending closeout and a short queue/design/code re-audit selected the admin note screenshot capture feedback parity slice for execution | next: executed through PR #804`
- `2026-05-22 | closeout | PR #804 shipped the selected Admin Note Screenshot Capture feedback parity slice and this repo-managed closeout moves its brief to done; the queue now leaves no active AW-006 UI slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-22 | closeout | PR #808 shipped Guide PDF Download Feedback Clarity and this repo-managed closeout moves its brief to done; the queue now leaves no active AW-006 UI slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-22 | planned | refreshed after Guide PDF Download Feedback Clarity #808 and repo-managed closeout #809 on clean main@016b2e5; post-merge preflight was reported green with no pending closeout and a short queue/design/code re-audit selected Commerce Action Feedback Semantics for the now-shipped #810 slice | next: completed by PR #810`
- `2026-05-22 | closeout | PR #810 shipped Commerce Action Feedback Semantics and this repo-managed closeout moves its brief to done; the queue now leaves no active AW-006 UI slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-22 | planned | refreshed after the #810/#811 closeout cycle on clean main@6237ebe; post-merge preflight was reported green with no pending closeout and a short queue/design/code re-audit selected the Poolside Preview Save Image Feedback Clarity slice that later shipped via #812 | next: completed by PR #812`
- `2026-05-23 | closeout | PR #812 shipped Poolside Preview Save Image Feedback Clarity and this repo-managed closeout moves its brief to done; the queue now leaves no AW-006 implementation slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
- `2026-05-23 | in-progress | refreshed after Poolside Save Image Feedback closeout #813 on clean main@ce74758; post-merge preflight was reported green with no pending closeout and a fresh queue/design/code re-audit selected Plans Funnel Analytics Payload Hardening as the then-selected AW-006 analytics slice | next: complete implementation, tests, PR gates, and closeout`
- `2026-05-23 | closeout | PR #814 shipped Plans Funnel Analytics Payload Hardening; this repo-managed closeout moves its brief to done and leaves no AW-006 implementation slice selected | next: rerun post-merge preflight after closeout merge, then complete the mandatory chat-handoff assessment before starting any new implementation slice`
