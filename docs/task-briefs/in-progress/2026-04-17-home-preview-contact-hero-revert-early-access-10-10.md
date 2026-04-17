# Task Brief: Home, Preview Access, And Contact Hero Revert With Early-Access Language

## Metadata

- `id`: `2026-04-17-home-preview-contact-hero-revert-early-access-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-17`
- `updated`: `2026-04-17`

## Goal

Restore the sharper brand voice and cleaner mobile hierarchy on `/`, `/preview-access`, and `/contact` by removing redundant lockups, bringing back the stronger `Olympic dreams? Wrong channel.` copy, and changing the preview-interest flow from passive notify language to early-access application language.

## Why This Brief Exists

- The latest mobile polish made the surfaces calmer, but it also softened the voice too much on the home hero:
  - `/Users/stianvikra/freeswimming/app/page.tsx`
- The preview-access page still reads too explanatory and product-generic for a password gate:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
- The default contact route still uses the shared intro component with a squeezed/cropped-feeling symbol treatment instead of the intended library lockup:
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`
  - `/Users/stianvikra/freeswimming/components/PageIntro.tsx`
- The preview-interest CTA should now read as an application for early access rather than a passive notify list:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`
- This slice is strictly public/mobile presentation and copy hierarchy:
  - no auth logic change,
  - no contact API contract change,
  - no new persistence or admin flow.

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
  - `/Users/stianvikra/freeswimming/app/page.tsx`
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/contact-form.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/contact-form-a11y.spec.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/a11y-home.spec.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts`
- This slice owns:
  - home hero copy and top-of-page brand choice,
  - preview-access hero copy and gate CTA language,
  - contact intro logo treatment,
  - preview-interest terminology shift to early access.
- This slice does not own:
  - backend preview-access auth/session behavior,
  - new contact fields or routing changes,
  - analysis/goals coaching redesign,
  - header/navigation redesign beyond the changed pages.

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

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                     | Evidence                                      | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | The first mobile viewport on each changed route makes the page purpose obvious with one hero lockup, one voice, and one clear next action.                   | route review + iPhone-width QA                | `5/5`             |
| UX flow clarity                               | `target`     | Home lands on the strong existing brand voice, preview-access keeps password as the only unlock action, and early-access apply language reads intentionally. | code review + mobile QA + targeted assertions | `5/5`             |
| Visual design quality                         | `target`     | No squeezed/cropped-feeling contact intro symbol remains; redundant hero lockups and explanatory copy are removed on mobile.                                 | screenshot QA + code review                   | `5/5`             |
| Business logic correctness and data integrity | `target`     | Copy/layout changes do not alter preview auth logic, contact API payload shape, or CTA destinations.                                                         | code review + targeted tests                  | `5/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes only public presentation and copy hierarchy.                                                                                  | explicit scope rationale                      | `N/A`             |
| Accessibility (a11y)                          | `target`     | Headings, form labels, focus behavior, and tap targets remain correct after the hero simplification and intro swap.                                          | targeted unit/e2e + route QA                  | `5/5`             |
| Performance (CWV + payloads)                  | `target`     | The slice reuses existing brand assets/components, adds no dependency, and reduces above-the-fold clutter without new runtime cost.                          | diff review + verify gates                    | `5/5`             |
| Data placement and sync boundaries            | `target`     | No new persistence or sync path is introduced; preview access remains server-canonical and contact remains the same POST contract.                           | brief contract + code review                  | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Route cache/dynamic behavior remains unchanged.                                                                                                              | route review                                  | `4/5`             |
| Reliability and failure handling              | `target`     | Invalid password, validation error, sending, and success states remain readable after the copy and intro changes.                                            | targeted tests + manual QA                    | `5/5`             |
| Security and authz                            | `target`     | Early-access language must not imply access is granted or broaden the private-gate surface.                                                                  | code review + existing negative-path coverage | `5/5`             |
| Privacy and compliance                        | `target`     | The application wording still collects the same minimal contact data and does not imply any new storage/eligibility contract.                                | code review + form contract review            | `5/5`             |
| Content governance                            | `supporting` | All changed logos are pulled from the existing brand library.                                                                                                | brand asset review                            | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or operator UI changes in this slice.                                                                                          | explicit scope rationale                      | `N/A`             |
| SEO and crawlability                          | `supporting` | Home remains crawl-safe and preview-access remains noindex/private.                                                                                          | route review + existing metadata              | `4/5`             |
| AI discoverability                            | `supporting` | Home keeps clearer public-facing messaging without duplicate hero noise.                                                                                     | route review                                  | `4/5`             |
| Analytics and KPI observability               | `supporting` | CTA destinations remain stable; no new analytics contract is required for this presentation-only change.                                                     | code review                                   | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout or entitlement surface changes.                                                                                                      | explicit scope rationale                      | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice does not change operational procedures or support tooling.                                                                            | explicit scope rationale                      | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because no payment or reporting path changes.                                                                                                            | explicit scope rationale                      | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice updates English-only presentation without changing localization infrastructure.                                                       | explicit scope rationale                      | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Changes stay inside existing routes/components and introduce zero new dependencies.                                                                          | dependency diff + code review                 | `5/5`             |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage is updated for the new early-access labels and restored home/preview hero copy, and both verification gates pass.                 | targeted tests + verify gates + CI            | `5/5`             |
| Scalability and cost efficiency               | `supporting` | No new API/storage/runtime cost path is introduced.                                                                                                          | diff review                                   | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice is route-scoped and fully reversible by PR revert with no migration fallout.                                                                       | PR diff + rollback simplicity review          | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - preview-access password validation and session cookie,
  - contact form POST handling,
  - auth state for header/library/dashboard links.
- Local-only:
  - hero composition,
  - copy hierarchy,
  - client-side form field state and validation UI.
- Sync policy:
  - no sync behavior changes,
  - preview unlock remains server validated,
  - early-access application continues to POST through the same contact endpoint.
- Retention and sensitivity:
  - no new PII fields,
  - no password values in repo or logs,
  - no new analytics payloads.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new persisted entity, slug, or operator-visible identifier.

## Scope

- Revert the home hero to the stronger `Olympic dreams? Wrong channel.` voice and remove redundant hero lockups/text on mobile.
- Use the `Learn. Drill. Swim.` library lockup at the top of the home hero.
- Change preview-access eyebrow/copy to `UNDER CONSTRUCTION` plus the stronger voice-led hero copy.
- Rename preview-interest language from passive notify copy to early-access application copy.
- Remove the squeezed/cropped default contact intro treatment and replace it with the intended library lockup.
- Keep CTA routes, auth behavior, and contact payload shape intact.

## Out Of Scope

- Backend auth or preview cookie/session changes.
- New contact workflow branching or admin review workflow.
- Analysis/goals coaching form redesign.
- Navigation/header redesign outside the changed pages.

## Acceptance Criteria

1. The mobile home hero starts with the `Learn. Drill. Swim.` lockup, restores `Olympic dreams? Wrong channel.`, and removes the generic descriptive paragraph.
2. The preview-access page uses `UNDER CONSTRUCTION`, restores the stronger voice-led copy, and removes the explanatory password-help paragraph.
3. The preview-access card uses `Early access` language and the secondary CTA reads `Apply for early access`.
4. The preview-interest contact route and default contact route no longer use the squeezed symbol-intro treatment.
5. The preview-interest contact route reads as an early-access application while still allowing an empty optional note.
6. Existing business logic and form validation remain intact.
7. Relevant targeted tests and both verify gates pass.

## Validation

- `npm run lint:briefs -- --all`
- `npx vitest run tests/unit/contact-form.test.tsx`
- `SITE_LOCK_ENABLED=0 PW_PORT=3100 NEXT_DIST_DIR=.next-playwright npx playwright test tests/e2e/contact-form-a11y.spec.ts tests/e2e/a11y-home.spec.ts --project=mobile-chromium`
- `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD="<password>" npx playwright test tests/e2e/private-access-gate.spec.ts --project=mobile-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes public presentation only and does not alter workflow labels, recovery steps, or operator procedures in Help/Guide or runbooks.

## Security, Privacy, and Compliance

- Preview-access remains fail-closed.
- Early-access wording does not broaden access.
- Contact intake keeps the same minimal field contract.

## Observability And KPI Contract

- No new instrumentation is required.
- Existing CTA destinations remain the observable contract.

## Checkpoint Log

- `2026-04-17 | implementation start | created in-progress brief for a tighter public/mobile brand-voice pass across home, preview-access, and contact so the next slice can restore stronger copy, remove redundant hero lockups, and shift notify language to early-access application language | next: implement the hero/contact/preview updates, run targeted validation, and push the slice through the normal verification gates`
- `2026-04-17 | mobile polish follow-up | tightened the same slice with centered mobile hero copy on home + preview, removed the preview password placeholder, and stripped redundant early-access form text so the contact apply flow stays cleaner and more truthful | next: rerun targeted checks, full verify gates, update PR #455, and confirm merge readiness`
