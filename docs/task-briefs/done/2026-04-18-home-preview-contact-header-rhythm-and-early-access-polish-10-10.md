# Task Brief: Home Preview Contact Header Rhythm And Early Access Polish (10/10)

## Metadata

- `id`: `2026-04-18-home-preview-contact-header-rhythm-and-early-access-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-18`

## Goal

Tighten the public mobile-first header-to-content rhythm and early-access hierarchy across `/`, `/preview-access`, and the early-access contact variant so the first screen feels optically composed, brand-forward, and calm without redesigning the routes.

## Why This Brief Exists

- Recent public-surface work landed the right direction, but a few small seams remain:
  - header-to-first-container spacing still feels too loose on some mobile-first layouts,
  - the preview first screen reads visually too high in the viewport,
  - the early-access contact variant carries a redundant large heading and paragraph under the logo,
  - email placeholders are inconsistent (`you@email.com` vs `your@email.com`).
- These are polish/rhythm issues, not product-truth changes:
  - no new contact fields,
  - no new auth behavior,
  - no preview-access backend change,
  - no global header redesign.

## Dependencies And Boundaries

- Related public-surface lineage:
  - [2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md)
  - [2026-04-17-mobile-polish-preview-contact-home-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-mobile-polish-preview-contact-home-10-10.md)
  - [2026-04-17-home-contact-mobile-followup-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-contact-mobile-followup-polish-10-10.md)
- Locked product decisions for this brief:
  - this is a spacing/rhythm/hierarchy polish pass, not a redesign,
  - preview mobile should feel optically centered, not mathematically centered,
  - `Apply for early access` should become the actual `h1` in the small blue label treatment,
  - the large redundant heading and paragraph under the logo should be removed in the early-access contact variant,
  - use `your@email.com` wherever the neutral placeholder is intended.

## Must Now

- Tighten header-to-content spacing across relevant public surfaces starting with mobile.
- Make preview mobile first-screen composition read as one optically centered stack.
- Simplify the early-access contact hierarchy to small blue `h1`, logo, form.
- Normalize relevant email placeholders to `your@email.com`.

## Before Live

- Verify rhythm still reads correctly on tablet/desktop where the same pattern exists.
- Confirm preview and contact variants remain brand-forward without looking glued to the header.
- Confirm no heading/label semantics regressions after the hierarchy cleanup.

## Ongoing Cadence

- Future public-surface polish should reuse the same header-to-content rhythm logic instead of route-by-route ad hoc top padding.
- Future early-access copy changes should preserve the “small label as semantic heading, minimal form-first hierarchy” rule unless explicitly rebriefed.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                        | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/`, `/preview-access`, and the early-access contact variant each communicate purpose clearly within the first screen, with less dead air and no hierarchy confusion. | screenshot QA + route review           | `5/5`                   |
| UX flow clarity                               | `target`     | Header-to-content rhythm and early-access hierarchy make the first useful action feel obvious without extra explanatory copy.                                         | mobile QA + route review               | `5/5`                   |
| Visual design quality                         | `target`     | Public first screens feel optically composed, calmer under the header, and more intentionally branded across mobile-first layouts.                                    | screenshot QA across viewports         | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no contact payload, auth route target, or preview unlock behavior may change in this polish slice.                                                   | code review + unchanged test contracts | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes public surfaces only and no admin/editor workflow.                                                                                     | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Semantic heading order remains correct, the small blue early-access label can be the actual `h1`, and form labels/placeholders remain clear and accessible.           | semantic review + targeted tests       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: polish must reuse current components/patterns and add no new dependency or obvious route-cost regression.                                            | diff review + verify evidence          | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: contact field state remains local-only and submissions/preview unlocks remain server-canonical as before.                                            | brief contract + route review          | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this brief changes presentation and hierarchy only, not route cache policy.                                                                               | explicit scope rationale               | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: validation, sending, success, and error states on contact/early-access forms must remain readable after the hierarchy and spacing pass.              | targeted form QA + tests               | `4/5`                   |
| Security and authz                            | `supporting` | Supporting only: preview and contact auth/security behavior must remain unchanged.                                                                                    | unchanged route semantics + tests      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: form copy cleanup must not imply new promises or collect new data.                                                                                   | copy review + form contract review     | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: home/preview/contact copy and brand assets remain the source of truth; no screenshot-only text should drift into runtime arbitrarily.                | copy review + brand review             | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow changes in this brief.                                                                                                                  | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route structure and metadata semantics remain crawl-safe after heading/hierarchy cleanup.                                                     | route review                           | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public pages remain semantically clean and less noisy in the first screen.                                                                           | route review                           | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not add event instrumentation; CTA and form behavior remain the same observable contract.                                                 | explicit scope rationale               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, or entitlement logic changes.                                                                                                       | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is presentational polish only and does not add or change support/incident workflows.                                                                 | explicit scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting workflow changes in this brief.                                                                                                      | explicit scope rationale               | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief adjusts English presentation and should not affect future localization architecture.                                                           | explicit scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing public-surface components/layout patterns with zero new dependencies and narrowly scoped file changes.                                                 | architecture review + dependency diff  | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests/screenshots cover the changed rhythm/hierarchy/placeholder contracts, and verify gates remain green.                                                   | targeted tests + verify gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this remains cheap presentational polish with no new API/storage/runtime cost.                                                                       | diff review                            | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: route-scoped UI polish remains fully reversible by code revert with no migration fallout.                                                            | PR diff review                         | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - contact submission handling,
  - preview unlock handling,
  - auth state used for CTA routing.
- Local-only:
  - spacing rhythm,
  - first-screen composition,
  - placeholder text,
  - form layout and presentational hierarchy.
- Sync policy:
  - unchanged;
  - this brief changes no persistence model or API shape.
- Retention and sensitivity:
  - no new PII field,
  - no new storage path,
  - no new local draft/persistence behavior.
- Cache/invalidation:
  - unchanged route behavior.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this brief introduces no new persisted entity, slug, route param, or canonical identifier.

## Scope

- Public header-to-first-container spacing/rhythm polish on relevant shared layouts, starting mobile-first.
- Preview mobile first-screen optical composition polish.
- Early-access contact hierarchy cleanup:
  - small blue semantic `h1`,
  - logo,
  - form,
  - remove redundant large heading and paragraph.
- Normalize relevant email placeholders from `you@email.com` to `your@email.com`.
- Preserve page-specific optical adjustments where needed, especially preview mobile.

## Out Of Scope

- Preview unlock backend behavior.
- Contact API schema or delivery behavior.
- Global header redesign.
- New marketing sections or hero redesign.
- Workout/poolside/builder changes.

## Acceptance Criteria

1. Header-to-content spacing is visibly tighter and more intentional on the affected public mobile-first layouts.
2. Preview mobile first-screen stack reads as one optically centered composition instead of feeling glued to the top.
3. In the early-access contact variant, the small blue label becomes the semantic `h1` while keeping the same visual style.
4. The redundant large `Apply for early access` heading and its paragraph under the logo are removed.
5. Relevant email placeholders read `your@email.com`.
6. Contact/preview behavior and form semantics remain intact.

## Validation

- `npm run lint:briefs`
- targeted unit/e2e coverage for changed public surfaces
- targeted screenshot QA on mobile/tablet/desktop where applicable
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Local validation from repo root.

## Manual QA Environments

- Local:
  - `/`
  - `/preview-access`
  - early-access contact variant
- Preview:
  - PR preview URL after implementation

## Constraints

- This is polish, not redesign.
- Do not force identical numeric spacing everywhere if a page needs optical adjustment.
- Preserve the current visual language and brand system.
- Keep changes narrow and presentational.

## 10/10 Quality Bar

- Less dead air under the header.
- Enough breathing room that content does not feel glued to the header.
- Preview mobile reads like one composed first screen.
- Early-access contact feels brand-forward and minimal.
- No truth, semantics, or form-behavior regressions.

## Checkpoint Log

- `2026-04-18 | implementation start | moved the brief from planned to in-progress on branch \`feat/home-preview-contact-header-rhythm-and-early-access-polish\` and started a narrow public-surface polish pass across \`/\`, \`/preview-access\`, and the early-access contact variant to tighten header rhythm, simplify hierarchy, and normalize placeholders without changing route behavior | next: implement the route-scoped UI adjustments, add/update targeted public-surface tests, then run verify gates before PR handoff`
- `2026-04-18 | implementation checkpoint | tightened shared tight-top inset rhythm for the public header layouts, optically centered the preview-access first screen on mobile, collapsed the early-access contact variant to a single small-label \`h1\` above the lockup and form, normalized the email placeholder to \`your@email.com\`, and passed targeted unit/e2e coverage plus \`npm run lint:briefs:all\` and \`npm run verify:pre-pr\` | next: stage the scoped diff, commit, push, open/update the PR, then run \`npm run verify:pre-merge\` before merge readiness`
- `2026-04-18 | merged + closeout | PR #464 merged to \`main\` as squash commit \`b854384\`; the public home/preview/contact polish is live on \`main\`, local \`npm run verify:pre-merge\` passed in the docs-only closeout lane with the brief now moved from \`in-progress\` to \`done\`, and the implementation evidence remains: targeted unit/e2e coverage green, \`npm run verify:pre-pr\` green, \`npm run verify:pre-merge\` green before merge, and required CI checks green on the PR | next: none`
