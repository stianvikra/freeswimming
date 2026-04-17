# Task Brief: Home And Contact Mobile Follow-Up Polish (10/10)

## Metadata

- `id`: `2026-04-17-home-contact-mobile-followup-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-17`
- `updated`: `2026-04-17`

## Goal

Tighten the mobile quality of `/` and `/contact` so both routes read higher, calmer, and more intentional above the fold without changing route truth or contact submission behavior.

## Why This Brief Exists

- The latest home hero is directionally right, but it still sits lower than necessary under the blue site header on iPhone-width screens:
  - [/Users/stianvikra/freeswimming/app/page.tsx](/Users/stianvikra/freeswimming/app/page.tsx)
  - [/Users/stianvikra/freeswimming/components/PageTemplate.tsx](/Users/stianvikra/freeswimming/components/PageTemplate.tsx)
- The reassurance line on home wraps awkwardly on smaller phones even though the sentiment should read as one calm line:
  - [/Users/stianvikra/freeswimming/app/page.tsx](/Users/stianvikra/freeswimming/app/page.tsx)
- When only one library/auth CTA is visible, the current alignment reads accidental instead of intentional:
  - [/Users/stianvikra/freeswimming/app/page.tsx](/Users/stianvikra/freeswimming/app/page.tsx)
- The default contact route still carries too much self-explanatory form copy and example UI for a surface that should feel lighter:
  - [/Users/stianvikra/freeswimming/components/ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx)
  - [/Users/stianvikra/freeswimming/app/contact/page.tsx](/Users/stianvikra/freeswimming/app/contact/page.tsx)
- The contact container also lands lower than the newer public surfaces, which makes the page feel less finished on mobile:
  - [/Users/stianvikra/freeswimming/app/contact/page.tsx](/Users/stianvikra/freeswimming/app/contact/page.tsx)
  - [/Users/stianvikra/freeswimming/components/PageTemplate.tsx](/Users/stianvikra/freeswimming/components/PageTemplate.tsx)
- This is a follow-up presentation slice only:
  - no new contact fields,
  - no preview-access change,
  - no builder/workout behavior,
  - no backend contract change.

## Dependencies And Boundaries

- Related shipped/public-surface lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-17-mobile-polish-preview-contact-home-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-17-mobile-polish-preview-contact-home-10-10.md)
- Existing contact submission contract remains authoritative:
  - [/Users/stianvikra/freeswimming/app/api/contact/route.ts](/Users/stianvikra/freeswimming/app/api/contact/route.ts)
  - [/Users/stianvikra/freeswimming/docs/api-contracts.md](/Users/stianvikra/freeswimming/docs/api-contracts.md)
- Existing brand/library assets remain authoritative:
  - [/Users/stianvikra/freeswimming/lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts)
  - [/Users/stianvikra/freeswimming/public/logos/brand/manifest.json](/Users/stianvikra/freeswimming/public/logos/brand/manifest.json)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/app/page.tsx](/Users/stianvikra/freeswimming/app/page.tsx)
  - [/Users/stianvikra/freeswimming/app/contact/page.tsx](/Users/stianvikra/freeswimming/app/contact/page.tsx)
  - [/Users/stianvikra/freeswimming/components/ContactForm.tsx](/Users/stianvikra/freeswimming/components/ContactForm.tsx)
  - [/Users/stianvikra/freeswimming/components/PageTemplate.tsx](/Users/stianvikra/freeswimming/components/PageTemplate.tsx)
  - [/Users/stianvikra/freeswimming/components/ActionButton.tsx](/Users/stianvikra/freeswimming/components/ActionButton.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/contact-form.test.tsx](/Users/stianvikra/freeswimming/tests/unit/contact-form.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/a11y-home.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/a11y-home.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts)
- This slice owns:
  - mobile top spacing and hero/card placement for `/` and `/contact`,
  - default contact copy reduction,
  - default contact submit-label clarity,
  - lone-CTA alignment on home.
- This slice does not own:
  - preview-access,
  - early-access notify variant copy,
  - contact API schema,
  - global header redesign,
  - course/program/analysis route redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                  | Evidence                                | Expected Closeout |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | Mobile home and contact must each make their purpose obvious within the first viewport, with less dead air above the useful content.                      | screenshot QA + route review            | `5/5`             |
| UX flow clarity                               | `target`     | Home must lead directly into the core CTA stack, and contact must feel like a straightforward message form without redundant explanation blocks.          | code review + mobile QA                 | `5/5`             |
| Visual design quality                         | `target`     | Hero/card spacing, copy density, and CTA alignment must feel intentionally composed on iPhone, with no awkward wraps or accidental lone-button placement. | screenshot QA + code review             | `5/5`             |
| Business logic correctness and data integrity | `target`     | The polish must not change contact submission payloads, auth CTA destinations, or route truth.                                                            | code review + targeted tests            | `5/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes public user-facing surfaces only and no admin/editor workflow.                                                             | explicit scope rationale                | `N/A`             |
| Accessibility (a11y)                          | `target`     | Heading order, field labels, tap targets, and readable line lengths must remain correct after the tighter mobile layout.                                  | targeted unit/e2e + browser QA          | `5/5`             |
| Performance (CWV + payloads)                  | `target`     | The slice must reuse current components and assets, add no dependency, and keep the routes effectively static/presentational in cost.                     | diff review + verify gates              | `5/5`             |
| Data placement and sync boundaries            | `target`     | Contact field state remains local-only and submissions remain server-canonical; the home page remains presentational only.                                | brief contract + code review            | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Existing route cache/dynamic behavior must remain unchanged and unambiguous.                                                                              | route review                            | `4/5`             |
| Reliability and failure handling              | `target`     | Validation errors, sending state, success state, and empty/default state on contact must remain stable and readable after copy removal.                   | targeted tests + manual QA              | `5/5`             |
| Security and authz                            | `target`     | No route should imply broader access, leak auth state, or weaken current contact/API handling.                                                            | code review + unchanged route semantics | `5/5`             |
| Privacy and compliance                        | `target`     | The contact route must keep the same minimal-input contract and avoid introducing new expectation-setting copy that implies service guarantees.           | code review + form contract review      | `5/5`             |
| Content governance                            | `supporting` | Existing home/contact copy and brand assets must remain the source of truth; no screenshot/example text becomes runtime content.                          | brand/copy review                       | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no mutable admin surface or operator workflow changes in this slice.                                                                          | explicit scope rationale                | `N/A`             |
| SEO and crawlability                          | `supporting` | Home and contact must keep their public crawl-safe structure and metadata behavior.                                                                       | route review                            | `4/5`             |
| AI discoverability                            | `supporting` | The public home page should remain semantically clean and less visually noisy, improving public comprehension without adding hidden complexity.           | route review                            | `4/5`             |
| Analytics and KPI observability               | `supporting` | Existing CTA routes and contact-submit behavior remain the observable contract; no new event wiring is required.                                          | unchanged route/action review           | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, refund, or entitlement path changes.                                                                                    | explicit scope rationale                | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice changes mobile presentation only and adds no support tooling, alerting path, or operational recovery flow.                         | explicit scope rationale                | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because no finance, billing, or reporting path changes in this slice.                                                                                 | explicit scope rationale                | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts English-only presentation and does not alter the app's localization architecture or content model.                         | explicit scope rationale                | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Use the existing page/template/button/form patterns with zero new dependencies and narrowly scoped file changes.                                          | dependency diff + code review           | `5/5`             |
| Testing and QA automation                     | `target`     | Targeted contact/home tests must be updated where contracts change, and both verify gates must still pass before merge.                                   | targeted tests + verify gates           | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The slice must remain cheap static UI polish with no new API/storage/runtime cost path.                                                                   | diff review                             | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The work must stay route-scoped and fully reversible by PR revert with no migration fallout.                                                              | PR diff review                          | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - contact form submission handling and validation,
  - auth state used to determine the library CTA target/label.
- Local-only:
  - transient contact field state,
  - mobile spacing and visual layout decisions.
- Sync policy:
  - unchanged,
  - home remains render-only,
  - contact continues to POST through the current API contract.
- Retention and sensitivity:
  - no new PII fields,
  - no new persistence path,
  - no new client-side storage.
- Cache/invalidation:
  - unchanged route behavior; this slice is presentation-only.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice adds no new persisted entity, slug, route param, or renameable identifier.

## Scope

- Reduce mobile top spacing on `/` and `/contact` so the main content sits higher under the blue header.
- Keep `You're exactly where you should be.` on one line on supported phone widths when space allows without introducing overflow.
- Center the home auth/library CTA when it renders alone.
- Add a touch more breathing room under the `Free course` reassurance line.
- Simplify the default contact route by removing redundant form-title/subtitle text inside the card.
- Remove the default contact `Example` helper box.
- Remove the default contact reply-time microcopy.
- Change the default contact submit label from `Send` to `Send message`.

## Out Of Scope

- Preview-access copy/layout.
- Early-access notify contact variant.
- Contact API schema or delivery logic.
- Global nav/header redesign.
- Any workout-builder, poolside, or authenticated tool work.

## Acceptance Criteria

1. The home hero/card stack sits visibly higher on iPhone-width screens than today without colliding with the header.
2. `You're exactly where you should be.` no longer breaks awkwardly across multiple lines on supported phone widths.
3. When the home page shows only one auth/library CTA, it is centered as an intentional standalone action.
4. The `Free course` primary CTA note gains slightly better bottom breathing room without making the full stack too tall.
5. The contact route lands higher and reads lighter above the fold on mobile.
6. The default contact form no longer shows the internal form heading/subtitle, example card, or reply-time microcopy.
7. The default contact submit button reads `Send message`.
8. Contact submission behavior, validation, and success/error states remain intact.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/contact-form.test.tsx`
- `npx playwright test tests/e2e/contact-form-a11y.spec.ts tests/e2e/a11y-home.spec.ts tests/e2e/mobile-screenshots.spec.ts --project=mobile-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/contact`
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - iPhone Safari-width viewport
  - Android Chromium-width viewport
  - desktop Chromium

## Constraints

- Do not add dependencies.
- Keep the visual language aligned with the shipped home/contact refresh.
- Use existing page chrome and form components unless a narrow local exception is clearly better.
- Keep copy changes minimal and product-facing.
- Do not broaden the contact route into a heavier marketing or helper surface.

## 10/10 Quality Bar

- The first viewport on home and contact must feel deliberate, not padded.
- Main user intent must be obvious with minimal reading.
- Mobile copy should wrap naturally and never feel like desktop text squeezed into a narrow column.
- Required states remain clear:
  - default,
  - validation error,
  - sending,
  - success.
- Accessibility expectations:
  - explicit labels,
  - preserved keyboard/focus behavior,
  - readable contrast and line length,
  - no loss of form clarity from copy reduction.
- Business-logic expectations:
  - no CTA destination drift,
  - no payload change,
  - no silent regression in contact handling.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes public page presentation only and no Help/Guide workflow labels, operator actions, or recovery steps.

## Security, Privacy, And Compliance

- No new secrets or runtime config.
- No new user-data collection fields.
- No new promise or SLA-style copy that could misstate support/response guarantees.

## Observability And KPI Contract

- No new instrumentation is required.
- Existing CTA destinations and contact-submit behavior remain the observable contract.

## Checkpoint Log

- `2026-04-17 | implementation start | moved the brief into in-progress and began the agreed home/contact mobile follow-up so tighter top spacing, lighter contact copy, and lone-CTA alignment can ship as one small public-surface polish slice | next: patch the page/template/form surfaces, update targeted tests, and run the narrowed mobile validation set before the full verify gates`
- `2026-04-17 | planning | split the next public-surface follow-up into a dedicated home/contact brief so mobile spacing, lighter contact copy, and lone-CTA alignment can ship without dragging builder/poolside work into the same PR | next: if approved for execution, move this brief to in-progress, implement the narrow UI polish, and validate with targeted mobile checks plus full verify gates`
