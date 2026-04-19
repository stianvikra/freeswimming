# Task Brief: Preview Access Visual Parity With Early-Access Apply Surface (10/10)

## Metadata

- `id`: `2026-04-19-preview-access-visual-parity-with-early-access-apply-surface-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-19`
- `updated`: `2026-04-19`

## Goal

Bring `/preview-access` into the same premium visual family as the early-access apply surface while keeping `/preview-access` clearly focused on one job: unlock the private preview with the shared password.

## Why This Brief Exists

- The owner has now compared the two current mobile surfaces directly and locked a clear design finding:
  - the early-access apply surface looks materially more finished, premium, and coherent,
  - `/preview-access` still reads more like a temporary utility page even after recent polish.
- The desired direction is now clear:
  - reuse the stronger header, container framing, form treatment, and overall visual rhythm from the early-access apply surface,
  - keep `/preview-access` semantically truthful as a password gate rather than turning it into a second early-access apply page.
- This is a visual-parity and composition brief, not a product-truth rewrite:
  - no auth/session logic change,
  - no contact API change,
  - no new fields,
  - no public marketing redesign,
  - no change to noindex/private route behavior.

## Dependencies And Boundaries

- Relevant shipped lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-home-preview-contact-header-rhythm-and-early-access-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-home-preview-contact-header-rhythm-and-early-access-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-early-access-mobile-nav-and-preview-left-alignment-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-early-access-mobile-nav-and-preview-left-alignment-followup-10-10.md)
- Current implementation surfaces likely touched when execution starts:
  - [/Users/stianvikra/freeswimming/app/preview-access/page.tsx](/Users/stianvikra/freeswimming/app/preview-access/page.tsx)
  - [/Users/stianvikra/freeswimming/components/ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx)
  - [/Users/stianvikra/freeswimming/components/brand/BrandImage.tsx](/Users/stianvikra/freeswimming/components/brand/BrandImage.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts)
- Locked product decisions for this brief:
  - `/preview-access` should visually belong to the same family as the early-access apply surface,
  - reuse the same top/header language, outer shell treatment, card framing, and form styling direction where possible,
  - do not make `/preview-access` a 1:1 clone if that weakens the password-gate job,
  - keep password entry as the obvious primary action above the fold,
  - keep the current stronger copy direction (`Under construction`, `Olympic dreams? Wrong channel.`, `Adult learner?`) unless a later brief explicitly reopens copy.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                 | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/preview-access` must immediately read as a premium private-entry surface with one obvious job, and the relationship to the early-access apply surface must feel intentional. | mobile screenshot QA + route review      | `5/5`                   |
| UX flow clarity                               | `target`     | The password field and submit action must remain clearer than the secondary apply CTA even after visual parity improvements.                                                   | mobile QA + targeted e2e                 | `5/5`                   |
| Visual design quality                         | `target`     | Header, outer shell, card treatment, field styling, spacing, and button treatment on `/preview-access` must feel aligned with the apply surface rather than ad hoc.            | screenshot QA across mobile/desktop      | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: visual parity must not change preview unlock semantics, route targets, error handling, or password submission behavior.                                       | code review + unchanged route assertions | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes a visitor-facing private gate only and no admin/editor workflow.                                                                                | explicit scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Heading order, labels, focus states, contrast, touch targets, and error clarity must remain strong after the visual parity pass.                                               | semantic review + targeted tests         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the route must reuse existing patterns and add no new dependency or heavy client-side behavior.                                                               | diff review + verify evidence            | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: route presentation changes remain local-only while site-lock/session handling stays server-canonical.                                                         | brief contract + route review            | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this brief changes visual composition only and does not alter the dynamic/no-store contract for `/preview-access`.                                                 | explicit scope rationale                 | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: invalid-password, retry, and successful unlock flows must stay clear and reachable after the design pass.                                                     | targeted QA + route tests                | `4/5`                   |
| Security and authz                            | `supporting` | Supporting only: the site-lock password gate must remain fail-closed, with no weaker affordance or public-route drift introduced by the redesign.                              | existing auth guard review + e2e         | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no new personal data field, retention policy, or consent surface is introduced here.                                                                               | explicit scope rationale                 | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: preview-access continues to use canonical brand assets and approved route copy rather than ad hoc layout-only wording drift.                                  | copy review + brand review               | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow is changed.                                                                                                                             | explicit scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: the route remains private/noindex and the parity pass must not weaken that contract.                                                                          | route review                             | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this route remains private and non-indexed, so no public discoverability contract changes here.                                                                    | explicit scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not add instrumentation; success is measured through screenshots, QA, and regression coverage.                                                     | explicit scope rationale                 | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or revenue flow changes here.                                                                                                    | explicit scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice adjusts route presentation only and does not add support tooling or incident workflow.                                                                  | explicit scope rationale                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting path changes in this slice.                                                                                                                   | explicit scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief adjusts the current English private-entry surface only and does not alter locale architecture.                                                          | explicit scope rationale                 | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing public/private route layout patterns and current brand/form primitives with zero new dependency and no second parallel design system.                           | architecture review + dependency diff    | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests and screenshot handoff must protect the new visual parity while preserving the password-gate behavior contract before merge.                                    | targeted tests + screenshot QA + verify  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the change should reduce one-off route styling drift rather than add more maintenance surface.                                                                | diff review                              | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the route-scoped design pass remains fully reversible with no migration or operational rollout complexity.                                                    | PR diff review                           | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - site-lock/session validation,
  - preview unlock success/failure handling,
  - current `/preview-access` auth boundary.
- Local-only:
  - layout, spacing, framing, and visual treatment on the page,
  - button/input styling and container composition.
- Sync policy:
  - unchanged;
  - this brief changes no persistence model, request payload, or route target.
- Retention and sensitivity:
  - no new PII field,
  - no new storage path,
  - no new local persistence.
- Cache/invalidation:
  - `/preview-access` remains dynamic/no-store as today.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new persisted entity, slug, or route parameter.

## Scope

- Align `/preview-access` visually with the early-access apply surface:
  - top/header treatment,
  - outer container and page framing,
  - form-card treatment,
  - input and button styling,
  - spacing/rhythm.
- Preserve the current `/preview-access` content contract:
  - `Under construction`
  - method lockup
  - stronger voice-led copy
  - password gate as the primary action
  - apply CTA as a secondary path
- Ensure the password field and submit button remain the most prominent functional elements.
- Require screenshot handoff before merge if/when this brief is executed.

## Out Of Scope

- Site-lock backend/session changes.
- Contact form API/schema changes.
- New marketing copy strategy for `/preview-access`.
- New public route creation.
- Global header redesign outside this route family.

## Acceptance Criteria

1. `/preview-access` clearly reads as the same visual family as the early-access apply surface.
2. The page still reads as a password gate first, not as a second application form.
3. Header, outer shell, and form framing on `/preview-access` feel materially more finished than the current utility-style treatment.
4. The password field and `Enter early access` action remain the clearest primary action above the fold.
5. Existing invalid-password and retry states remain visually clear and semantically unchanged.
6. No auth/noindex/private-route behavior regresses.
7. Screenshot handoff shows `/preview-access` beside the apply surface before merge recommendation.

## Validation

- `npm run lint:briefs`
- targeted route/unit coverage for `/preview-access`
- targeted Playwright coverage for the private access flow
- screenshot handoff with short explanation before merge
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - `/preview-access`
  - `/contact?source=preview_access_notify`
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - iPhone Safari-width viewport
  - Android Chromium-width viewport
  - desktop Chromium
  - desktop Safari/WebKit-equivalent

## Constraints

- This is a narrow visual-parity brief, not a route rewrite.
- The final result should feel closer to the early-access apply surface without becoming a literal clone.
- Keep the password gate visually primary.
- Keep all copy and behavior truthful to the current preview-access contract unless explicitly rebriefed.

## 10/10 Quality Bar

- `/preview-access` should feel finished, intentional, and brand-forward.
- The route should no longer read like a temporary utility screen when compared side-by-side with the apply surface.
- The user should instantly understand what to do first.
- Required states remain strong:
  - default,
  - invalid password,
  - retry,
  - successful unlock path,
  - secondary apply CTA visible but clearly secondary.
- Accessibility expectations:
  - preserved focus order,
  - visible focus styles,
  - labeled password field,
  - sufficient contrast,
  - stable tap targets.
- Business-logic expectations:
  - no route-target drift,
  - no password-submit behavior drift,
  - no weakening of the private gate contract.

## Checkpoint Log

- `2026-04-19 | planning | created the dedicated preview-access visual-parity brief after the owner confirmed that the early-access apply surface is the stronger design reference; the next desired move is to bring /preview-access into the same visual family while keeping it clearly a password gate rather than a second apply form | next: if approved, move this brief to in-progress and implement the route-scoped design parity pass end to end`
- `2026-04-19 | implementation | moved the brief to in-progress on branch feat/preview-access-visual-parity and locked the implementation contract: reuse the same route shell, card framing, and field/button system as the early-access apply variant while preserving preview-access copy, password-first hierarchy, and existing unlock behavior | next: implement the route-scoped UI pass, then validate with targeted e2e coverage and screenshot handoff`
- `2026-04-19 | validation | shipped the route-scoped parity pass in app/preview-access/page.tsx, tightened private-access-gate e2e coverage for hidden mobile nav plus header menu access, captured before-merge screenshots for preview-access vs apply surface, and passed npm run verify:pre-pr after clearing local generated .next QA artifacts that polluted repo-wide eslint scope | next: commit, push, open/update PR, run verify:pre-merge, and summarize merge readiness with screenshot paths`
- `2026-04-19 | visual-qa + validation | added a route-scoped desktop tone parity pass by extending PageTemplate with an optional brand surface tone and applying it only to /preview-access and the preview-access-notify contact variant, captured updated after/reference desktop screenshots, received owner approval ("okei nå"), confirmed the initial desktop-admin e2e failures were flake by rerunning the two failing tests under SITE_LOCK_ENABLED=0, and reran npm run verify:pre-pr to a green pass | next: commit and push the scoped desktop parity diff, then run verify:pre-merge and monitor PR #476 checks`
