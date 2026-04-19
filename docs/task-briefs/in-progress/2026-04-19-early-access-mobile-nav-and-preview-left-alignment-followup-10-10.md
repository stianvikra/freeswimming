# Task Brief: Early-Access Mobile Nav And Preview Left-Alignment Follow-Up (10/10)

## Metadata

- `id`: `2026-04-19-early-access-mobile-nav-and-preview-left-alignment-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-19`
- `updated`: `2026-04-19`

## Goal

Keep the early-access public flow calm and focused on mobile by removing the fixed utility bottom nav from the early-access routes and left-aligning the full `/preview-access` intro stack so the preview and notify surfaces read as one coherent family.

## Why This Brief Exists

- The recent public-surface polish landed the right hierarchy, but two mobile-specific seams remain:
  - the fixed bottom nav still competes with the early-access CTA flow on mobile,
  - `/preview-access` still uses a centered intro stack that no longer matches the left-led early-access notify form.
- The owner has now locked two follow-up decisions:
  - early-access flows should not carry the floating mobile utility nav,
  - `/preview-access` should use one left-aligned mobile intro stack instead of mixing centered and left-aligned rules.
- This is a narrow public polish slice only:
  - no unlock/auth/backend behavior change,
  - no contact API schema change,
  - no global header redesign,
  - no home-page redesign.

## Dependencies And Boundaries

- Related public-surface lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-mobile-polish-preview-contact-home-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-mobile-polish-preview-contact-home-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-contact-mobile-followup-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-contact-mobile-followup-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-home-preview-contact-header-rhythm-and-early-access-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-home-preview-contact-header-rhythm-and-early-access-polish-10-10.md)
- Existing route and variant contracts remain authoritative:
  - [/Users/stianvikra/freeswimming/app/preview-access/page.tsx](/Users/stianvikra/freeswimming/app/preview-access/page.tsx)
  - [/Users/stianvikra/freeswimming/app/contact/page.tsx](/Users/stianvikra/freeswimming/app/contact/page.tsx)
  - [/Users/stianvikra/freeswimming/components/ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx)
  - [/Users/stianvikra/freeswimming/components/SiteChrome.tsx](/Users/stianvikra/freeswimming/components/SiteChrome.tsx)
  - [/Users/stianvikra/freeswimming/docs/runbooks/private-access-gate.md](/Users/stianvikra/freeswimming/docs/runbooks/private-access-gate.md)
- Primary implementation and validation surfaces:
  - [/Users/stianvikra/freeswimming/app/preview-access/page.tsx](/Users/stianvikra/freeswimming/app/preview-access/page.tsx)
  - [/Users/stianvikra/freeswimming/app/contact/page.tsx](/Users/stianvikra/freeswimming/app/contact/page.tsx)
  - [/Users/stianvikra/freeswimming/components/ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx)
  - [/Users/stianvikra/freeswimming/components/SiteChrome.tsx](/Users/stianvikra/freeswimming/components/SiteChrome.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts)
  - [/Users/stianvikra/freeswimming/docs/interaction-regression-checklist.md](/Users/stianvikra/freeswimming/docs/interaction-regression-checklist.md)
- Locked product decisions for this brief:
  - on mobile, `/preview-access` uses one shared left alignment for the full intro stack,
  - do not center only the `Olympic dreams? Wrong channel.` line while the rest of the intro is left-aligned,
  - early-access routes should not show the fixed bottom nav on mobile,
  - keep the default `/contact` route behavior unchanged unless required only for shared implementation plumbing.

## Must Now

- Remove the fixed mobile bottom nav from the early-access public flow.
- Left-align the full `/preview-access` mobile intro stack.
- Keep preview and notify surfaces visually coherent without redesigning them.
- Update the regression/test contract so it reflects the new mobile-nav rule truthfully.

## Before Live

- Verify the early-access CTA remains obvious without the floating nav.
- Verify `/preview-access` and `/contact?source=preview_access_notify` still feel related rather than patched separately.
- Verify desktop/tablet behavior stays stable where the mobile exception does not apply.

## Ongoing Cadence

- Future public-surface mobile polish should prefer route-purpose-first navigation chrome rather than default utility chrome everywhere.
- Early-access public routes should keep one stable alignment model per intro stack unless explicitly rebriefed.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                       | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Mobile early-access routes must prioritize their one primary action without competing utility chrome or mixed alignment logic.                                       | route review + mobile screenshot QA       | `5/5`                   |
| UX flow clarity                               | `target`     | `/preview-access` and the early-access notify variant must feel calmer and easier to scan on mobile, with no extra navigation weight around the primary CTA.         | mobile QA + e2e                           | `5/5`                   |
| Visual design quality                         | `target`     | The preview intro stack must read as one deliberate left-aligned composition, and the early-access routes must feel more composed after the nav removal.             | screenshot QA + code review               | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: route targets, preview unlock flow, and contact submission payloads must remain unchanged while the presentation contract is tightened.             | code review + unchanged route tests       | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes public visitor-facing routes only and no admin/editor workflow.                                                                       | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Focus order, heading semantics, tap targets, and menu access must remain clear after the mobile-nav exception and preview alignment change.                          | targeted e2e + semantic review            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the slice must reuse current components and add no dependency or meaningful route-cost increase.                                                    | dependency diff + verify evidence         | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: local presentation rules change, but contact submissions and preview unlock remain server-canonical under the existing route contracts.             | brief contract + route review             | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this brief changes route presentation only and does not alter cache behavior or invalidation rules.                                                      | explicit scope rationale                  | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: error/help/success states on preview unlock and early-access contact remain readable and reachable after the mobile layout cleanup.                 | manual QA + targeted tests                | `4/5`                   |
| Security and authz                            | `supporting` | Supporting only: private-gate behavior, preview password handling, and auth routes stay unchanged.                                                                   | route review + unchanged security tests   | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: the early-access notify variant keeps the same minimal-input contract and does not imply new collection or promise behavior.                        | form contract review                      | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: preview/notify copy and brand assets remain canonical, with no one-off mobile wording drift.                                                        | copy review + brand review                | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow changes in this slice.                                                                                                        | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route structure stays semantically clean and crawl-safe after the presentation cleanup.                                                      | route review                              | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: the public route hierarchy stays clearer and less noisy without changing core content meaning.                                                      | route review                              | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not add or change analytics instrumentation; existing CTA/navigation behavior remains the observable contract.                           | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or revenue flow is touched.                                                                                           | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a public-surface mobile polish slice only and does not add support tooling, escalation paths, or incident runbooks.                              | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, or finance reporting behavior changes in this slice.                                                                         | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts current English presentation only and does not alter locale architecture or translation workflow.                                     | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing public layout, SiteChrome, and early-access form components with zero new dependencies and narrowly scoped route exceptions only where necessary. | architecture review + dependency diff     | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests/checklists must be updated so the early-access mobile-nav exception and preview left-alignment rule are protected from regression.                    | updated tests/checklist + verify evidence | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this is a tiny route-presentational cleanup with no meaningful runtime or CI cost impact beyond normal validation.                                       | explicit scope rationale                  | `N/A`                   |
| DevOps and rollback readiness                 | `N/A`        | N/A because this is a narrow, fully reversible public UI polish slice with no migration or operational rollout complexity.                                           | explicit scope rationale                  | `N/A`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - preview unlock handling,
  - contact submission routing and validation,
  - auth state used for route actions.
- Local-only:
  - mobile bottom-nav visibility for early-access routes,
  - mobile alignment and spacing decisions on `/preview-access`.
- Sync policy:
  - unchanged;
  - this brief changes no persistence model, request payload, or route target.
- Retention and sensitivity:
  - no new PII,
  - no new storage path,
  - no new local persistence.
- Cache/invalidation:
  - unchanged route behavior.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new persisted entity, route param, slug, or canonical identifier.

## Scope

- Remove the fixed mobile bottom nav from `/preview-access`.
- Remove the fixed mobile bottom nav from `/contact?source=preview_access_notify`.
- Keep the default `/contact` route out of scope unless shared route/chrome plumbing requires a narrowly scoped exception hook.
- Left-align the full `/preview-access` mobile intro stack:
  - `Under construction`
  - logo
  - `Olympic dreams? Wrong channel.`
  - `Adult learner?`
  - supporting line
- Update regression docs/tests that currently assume fixed bottom nav remains visible on all contact variants.

## Out Of Scope

- Default `/contact` copy/layout polish.
- Home-page layout changes.
- Private-access backend/auth behavior.
- Contact API schema or delivery behavior.
- Global header or full mobile-nav redesign.

## Acceptance Criteria

1. `/preview-access` does not show the fixed mobile bottom nav.
2. `/contact?source=preview_access_notify` does not show the fixed mobile bottom nav.
3. `/preview-access` uses one left-aligned mobile intro stack instead of mixed centered/left alignment.
4. The `Olympic dreams? Wrong channel.` line is not centered independently inside an otherwise left-aligned intro stack.
5. The early-access CTA remains obvious and easier to scan on mobile after the nav removal.
6. Preview unlock and early-access contact behavior remain unchanged.
7. Relevant tests/checklists are updated to the new mobile-nav contract.

## Validation

- `npm run lint:briefs`
- targeted public-surface unit/e2e coverage for preview-access and early-access contact variant
- targeted mobile screenshot QA for:
  - `/preview-access`
  - `/contact?source=preview_access_notify`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Local validation from repo root.

## Manual QA Environments

- Local:
  - `/preview-access`
  - `/contact?source=preview_access_notify`
- Preview:
  - Vercel preview URL after implementation
- Recommended matrix:
  - iPhone Safari-width viewport
  - Android Chromium-width viewport
  - desktop Chromium/Safari sanity check

## Constraints

- This is a narrow public/mobile polish slice, not a redesign.
- Keep preview and notify routes visually related.
- Do not broaden the mobile-nav change into a whole-site navigation rethink.
- Keep all copy product-facing and English.

## 10/10 Quality Bar

- Mobile early-access routes should feel quieter and more intentional.
- The primary action must stay obvious without extra utility chrome.
- The preview intro should read as one aligned composition, not a stack of mixed alignment rules.
- Required states remain clear:
  - default,
  - error,
  - success,
  - retry.
- Accessibility expectations:
  - preserved focus order,
  - preserved heading semantics,
  - no hidden-only navigation escape,
  - clear touch targets.
- Business-logic expectations:
  - no route-target drift,
  - no submission payload change,
  - no preview-unlock behavior regression.

## Checkpoint Log

- `2026-04-19 | in-progress | moved the brief into in-progress and started the scoped early-access follow-up: hide fixed mobile nav on the preview-access notify route, align the /preview-access mobile intro to one left axis, and update the regression contract so the new mobile behavior is explicit before validation and PR handoff | next: finish the route/chrome patch, update targeted e2e coverage, then run verify gates`
- `2026-04-19 | in-progress | implemented the route-scoped mobile-nav suppression for the preview-access notify contact variant, left-aligned the full /preview-access intro stack on mobile, updated the regression checklist, and passed targeted public-surface tests plus npm run verify:pre-pr | next: stage the scoped diff, commit, push, open the PR, and run npm run verify:pre-merge before merge readiness`
