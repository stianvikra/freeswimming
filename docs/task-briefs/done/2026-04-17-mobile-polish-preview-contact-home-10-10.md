# Task Brief: Mobile Polish For Preview, Preview Notify Contact, And Home (10/10)

## Metadata

- `id`: `2026-04-17-mobile-polish-preview-contact-home-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-17`
- `updated`: `2026-04-18`

## Goal

Raise the iPhone-quality bar for `/preview-access`, `/contact?source=preview_access_notify`, and `/` by reducing brand repetition, simplifying card hierarchy, and making the primary action land cleanly within the first viewport.

## Why This Brief Exists

- The latest preview-access refresh made the flow truthful and visitor-facing, but the iPhone composition still overuses the large stacked `Learn. Drill. Swim.` lockup:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
- The preview-notify contact route currently reads like an over-explained intake flow instead of a simple notify form:
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`
  - `/Users/stianvikra/freeswimming/app/contact/page.tsx`
- The mobile home page is directionally stronger than before, but it still feels too card-heavy and repeats brand marks more than necessary above the fold:
  - `/Users/stianvikra/freeswimming/app/page.tsx`
- The app already has the right raw ingredients:
  - canonical logo assets from `/Users/stianvikra/freeswimming/lib/brand.ts`
  - reusable brand rendering in `/Users/stianvikra/freeswimming/components/brand/BrandImage.tsx`
  - existing CTA components and page chrome patterns in `/Users/stianvikra/freeswimming/components/ActionButton.tsx`, `/Users/stianvikra/freeswimming/components/PageTemplate.tsx`, and `/Users/stianvikra/freeswimming/components/SiteChrome.tsx`
- This slice is about mobile-first visual discipline, not product-strategy change:
  - the routes already say the right thing,
  - the problem is that the visual hierarchy still spends too much of the first screen on decoration.

## Dependencies And Boundaries

- Existing brand asset manifest remains authoritative:
  - `/Users/stianvikra/freeswimming/lib/brand.ts`
  - `/Users/stianvikra/freeswimming/public/logos/brand/manifest.json`
- Existing preview-access contract remains authoritative:
  - `/Users/stianvikra/freeswimming/app/preview-access/actions.ts`
  - `/Users/stianvikra/freeswimming/docs/runbooks/private-access-gate.md`
- Existing contact submission contract remains authoritative:
  - `/Users/stianvikra/freeswimming/app/api/contact/route.ts`
  - `/Users/stianvikra/freeswimming/docs/api-contracts.md`
- In-scope implementation surfaces:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
  - `/Users/stianvikra/freeswimming/app/page.tsx`
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`
  - `/Users/stianvikra/freeswimming/components/PageIntro.tsx` only if needed for narrow polish support
  - `/Users/stianvikra/freeswimming/tests/unit/contact-form.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts` only if assertions need to track the new notify layout
- This slice owns:
  - mobile visual hierarchy,
  - logo choice and sizing on the notify contact route,
  - removal of over-explanatory helper/example UI from the preview-notify form,
  - calmer home-page above-the-fold composition on iPhone.
- This slice does not own:
  - new analytics instrumentation,
  - new contact fields or backend schema,
  - changes to preview-access auth logic,
  - broader redesign of `/analysis`, `/contact` default variant, or admin tools.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                        | Evidence                                      | Expected Closeout |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | Each changed route reads clearly in one mobile viewport: brand, purpose, and primary next step are obvious without scrolling through decorative repetition.     | iPhone-width screenshot QA + route review     | `5/5`             |
| UX flow clarity                               | `target`     | `/preview-access` keeps password unlock visually primary, preview-notify contact reads as a simple form, and `/` makes the free course the clearest first move. | code review + mobile QA + targeted assertions | `5/5`             |
| Visual design quality                         | `target`     | One brand mark per mobile hero, calmer spacing, reduced card nesting, and no oversized out-of-proportion logo treatment on the notify contact route.            | screenshot QA + code review                   | `5/5`             |
| Business logic correctness and data integrity | `target`     | No copy/layout change may alter route truth: preview password remains the unlock path, notify contact remains notify-only, and home CTAs route correctly.       | code review + targeted tests                  | `5/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not change admin editing or publishing workflows; it only improves public/mobile presentation.                                      | explicit scope rationale                      | `N/A`             |
| Accessibility (a11y)                          | `target`     | Heading hierarchy, form labels, focus behavior, contrast, and tap targets remain correct after layout simplification.                                           | targeted unit/e2e + route QA                  | `5/5`             |
| Performance (CWV + payloads)                  | `target`     | The redesign reuses existing assets/components, adds no dependency, and does not add meaningful JS or image-payload regression on changed routes.               | diff review + build output + verify gates     | `5/5`             |
| Data placement and sync boundaries            | `target`     | No new persistence is introduced; preview unlock remains server-canonical and contact/home changes stay presentational only.                                    | brief contract + code review                  | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Changed routes keep their current cache/dynamic behavior with no new ambiguity.                                                                                 | route review + existing route contracts       | `4/5`             |
| Reliability and failure handling              | `target`     | Error, empty, invalid-password, submit, and success states remain readable and layout-stable on mobile after the polish.                                        | targeted tests + manual QA                    | `5/5`             |
| Security and authz                            | `target`     | The visual refresh must not broaden access, leak auth state, or confuse notify interest with preview unlock.                                                    | code review + existing negative-path coverage | `5/5`             |
| Privacy and compliance                        | `target`     | Notify contact continues to collect the same minimal data, and no new sensitive copy or password-handling confusion is introduced.                              | code review + form contract review            | `5/5`             |
| Content governance                            | `supporting` | Existing brand-library assets remain the single source of truth for logos and lockups used on these routes.                                                     | brand asset review                            | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or edit UI is changed in this slice.                                                                                              | explicit scope rationale                      | `N/A`             |
| SEO and crawlability                          | `supporting` | Home keeps crawl-safe structure, while preview-access remains noindex/private.                                                                                  | existing metadata + route review              | `4/5`             |
| AI discoverability                            | `supporting` | The home page keeps stable semantic structure and clearer copy hierarchy for public understanding, with no hidden/duplicate hero confusion.                     | home route review                             | `4/5`             |
| Analytics and KPI observability               | `supporting` | Existing CTA destinations remain intact; no new event contract is required for this visual-only slice.                                                          | code review + unchanged event surface         | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, or catalog flow changes in this slice.                                                                                    | explicit scope rationale                      | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice adds no operational runbook surface; it only improves mobile presentation on existing public/private routes.                             | explicit scope rationale                      | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because no payment, refund, entitlement, or revenue-reporting path changes in this slice.                                                                   | explicit scope rationale                      | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes English-only presentation without introducing route/model blockers for later localization work.                                  | explicit scope rationale                      | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The slice uses existing route/component patterns and brand assets, with zero new dependencies and narrowly scoped file changes.                                 | dependency diff + code review                 | `5/5`             |
| Testing and QA automation                     | `target`     | Unit/e2e coverage is updated where layout/copy contracts changed, and `verify:pre-pr` plus `verify:pre-merge` both pass.                                        | targeted tests + verify gates + CI            | `5/5`             |
| Scalability and cost efficiency               | `supporting` | No new runtime/storage/API cost path is introduced; mobile polish remains mostly static UI.                                                                     | diff review                                   | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice is code-only, route-scoped, and trivially reversible by PR revert with no migration fallout.                                                          | PR diff + rollback simplicity review          | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - site-lock state and preview session cookie,
  - contact-form submission handling,
  - auth state for header/library/dashboard links.
- Local-only:
  - visual arrangement of route sections,
  - transient contact-form field state and client validation state.
- Sync policy:
  - no sync behavior changes,
  - preview unlock continues to redirect after server-side validation,
  - notify form continues to POST to the existing contact API without new storage paths.
- Retention and sensitivity:
  - no new PII fields,
  - no preview password values in repo/tests/logs,
  - no new analytics payloads.
- Cache/invalidation:
  - `/preview-access` remains dynamic,
  - `/` and `/contact` keep current route behavior; the slice is presentational only.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new persisted entity, slug, route identifier, or renameable operator object.

## Scope

- Simplify `/preview-access` mobile composition so the password card lands sooner and oversized stacked branding no longer dominates the viewport.
- Replace the preview-notify contact header treatment with a canonical brand lockup from the app logo library.
- Remove the preview-notify helper card and example-note box so the form explains itself.
- Tighten the home page mobile hierarchy so the hero feels calmer and less card-stacked while keeping core CTA routes intact.
- Preserve all current business logic and route destinations.
- Update targeted tests that protect the new mobile/notify contracts.

## Out Of Scope

- Changing preview-access auth logic or cookie/session behavior.
- Adding/removing contact fields or changing backend submission storage.
- Redesigning analysis/goals coaching forms.
- Reworking the global header, menu drawer, or mobile segmented nav beyond what these pages need.
- Hiding or refactoring admin notes as a separate product slice.

## Acceptance Criteria

1. On iPhone-width viewports, `/preview-access` shows one clear brand hierarchy and keeps the password card high enough that the page no longer feels dominated by stacked logo art.
2. `/contact?source=preview_access_notify` uses a canonical freeswimming lockup from the brand library instead of the out-of-proportion symbol intro treatment.
3. The preview-notify contact route no longer renders `What to include` or `Optional note ideas`.
4. The preview-notify form still accepts name + email with optional note and still routes through the existing API contract.
5. The home page above-the-fold mobile composition feels less card-stacked and makes the free course CTA more immediate.
6. No changed route introduces broken labels, focus regressions, dead ends, or routing regressions.
7. Relevant targeted tests and brief lint pass.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/contact-form.test.tsx`
- `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD="<password>" npx playwright test tests/e2e/private-access-gate.spec.ts --project=mobile-chromium`
- `npx playwright test tests/e2e/contact-form-a11y.spec.ts --project=mobile-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/preview-access?next=%2F`
  - `http://127.0.0.1:3000/contact?source=preview_access_notify`
  - `http://127.0.0.1:3000/`
- PR preview:
  - Vercel preview URL from PR checks
- Recommended matrix:
  - iPhone Safari-width viewport
  - Android Chromium-width viewport
  - desktop Chromium

## Constraints

- Use brand assets from the repo’s logo library; do not use owner-provided screenshots as runtime assets.
- Keep the slice mobile-first and route-scoped.
- Do not add dependencies.
- Avoid new card nesting on mobile where an unframed layout reads cleaner.
- Keep all existing CTA destinations and route semantics intact.

## 10/10 Quality Bar

- Changed routes must feel intentionally composed on iPhone, not like desktop layouts squeezed smaller.
- Primary actions must appear before decorative repetition.
- Required states stay clear:
  - default/locked,
  - invalid password,
  - form validation error,
  - sending,
  - success.
- Accessibility expectations:
  - explicit labels,
  - strong focus visibility,
  - readable type and contrast,
  - no information conveyed only by decorative imagery.
- Performance expectations:
  - no extra dependency,
  - no heavy client logic,
  - no noticeable payload increase.
- Business-logic expectations:
  - notify interest never implies access,
  - preview password remains the only unlock action,
  - home CTAs remain honest and correctly routed.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes mobile presentation only and does not alter workflow labels, recovery steps, or operator procedures in Help/Guide or runbooks.

## Security, Privacy, and Compliance

- No new secrets, tokens, or password hints in copy.
- Contact form keeps the current minimal-input contract and server validation.
- Preview access remains fail-closed.

## Observability And KPI Contract

- No new instrumentation is required.
- Existing CTA destinations and contact-submit success behavior remain the observable contract.

## Session Continuity And Recovery

- Canonical recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit after local validation for this slice.
- Push and open/update PR after `verify:pre-pr` passes.

## Automation Mode

- `automation-first`

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Default UI QA links for this slice:
  - `/preview-access?next=%2F`
  - `/contact?source=preview_access_notify`
  - `/`

## Checkpoint Log

- `2026-04-17 | implementation start | created in-progress brief for a mobile-only quality pass on preview access, preview-notify contact, and home so the next slice can target first-viewport clarity, calmer hierarchy, and canonical logo use on iPhone | next: implement the three route/component updates, run targeted mobile validation, and then push the slice through pre-PR verification`
- `2026-04-17 | targeted validation pass | reduced preview-access hero weight, rebuilt preview-notify intro around the canonical lockup, removed preview-notify helper/example UI, and simplified the home mobile hierarchy; targeted unit + mobile Playwright checks are green, including a password-backed private-gate run | next: stage the brief so lint:briefs sees it, then run verify:pre-pr and prepare commit/push/PR`
- `2026-04-18 | housekeeping closeout | moved brief to done after the mobile preview/contact/home polish landed on main via the merged PR chain for this slice and its follow-ups | next: none`
