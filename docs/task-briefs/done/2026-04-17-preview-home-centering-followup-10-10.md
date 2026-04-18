# Task Brief: Preview And Home Centering Follow-Up (10/10)

## Metadata

- `id`: `2026-04-17-preview-home-centering-followup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-17`
- `updated`: `2026-04-18`

## Goal

Make `/preview-access` read as a centered mobile hero plus centered card composition, and make the home hero inside its centered desktop card read as one centered intro block.

## Why This Brief Exists

- The current preview-access mobile surface is close, but the composition still reads slightly split instead of intentionally centered:
  - hero copy should read as one centered block,
  - the card should sit as a centered object,
  - the form internals should still stay left-aligned for readability.
- The current desktop home card is centered in the viewport, but the intro copy still reads as a left-aligned block inside a centered object:
  - [/Users/stianvikra/freeswimming/app/page.tsx](/Users/stianvikra/freeswimming/app/page.tsx)
  - [/Users/stianvikra/freeswimming/app/preview-access/page.tsx](/Users/stianvikra/freeswimming/app/preview-access/page.tsx)
- This is a narrow public-surface polish slice only:
  - no auth change,
  - no preview-access password behavior change,
  - no contact-form contract change,
  - no builder/library/poolside change.

## Dependencies And Boundaries

- Related public-surface lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-home-preview-contact-hero-revert-early-access-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-preview-access-brand-forward-visitor-facing-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-preview-access-brand-forward-visitor-facing-10-10.md)
- Existing brand assets remain authoritative:
  - [/Users/stianvikra/freeswimming/lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts)
  - [/Users/stianvikra/freeswimming/public/logos/brand/manifest.json](/Users/stianvikra/freeswimming/public/logos/brand/manifest.json)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/app/preview-access/page.tsx](/Users/stianvikra/freeswimming/app/preview-access/page.tsx)
  - [/Users/stianvikra/freeswimming/app/page.tsx](/Users/stianvikra/freeswimming/app/page.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/a11y-home.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/a11y-home.spec.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/mobile-screenshots.spec.ts)
- This slice owns:
  - preview mobile hero centering,
  - preview mobile card placement,
  - home desktop intro-block centering.
- This slice does not own:
  - preview copy changes,
  - preview password flow semantics,
  - contact route changes,
  - builder/library/poolside changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                  | Evidence                              | Expected Closeout |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | Preview and home must each read as one intentional hero composition before the primary action stack begins.                               | screenshot QA + route review          | `5/5`             |
| UX flow clarity                               | `target`     | Preview must read as centered hero first and form second, while the home card must read as a single intro block before the CTA stack.     | code review + browser QA              | `5/5`             |
| Visual design quality                         | `target`     | Centering changes must improve balance without turning forms into poster-style centered UI or weakening scanability.                      | screenshot QA + code review           | `5/5`             |
| Business logic correctness and data integrity | `target`     | The slice must not alter preview unlock behavior, next-path handling, CTA targets, or any saved/public data contract.                     | targeted tests + code review          | `5/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes public presentation only and no admin/editor workflow.                                                     | explicit scope rationale              | `N/A`             |
| Accessibility (a11y)                          | `target`     | Heading structure, visible labels, readable line lengths, and left-aligned form internals must remain intact after centering adjustments. | targeted e2e + browser QA             | `5/5`             |
| Performance (CWV + payloads)                  | `target`     | Reuse existing assets/components only, add no dependency, and keep this as pure presentation polish with no material runtime cost.        | diff review + verify gates            | `5/5`             |
| Data placement and sync boundaries            | `target`     | Preview unlock state remains server/cookie-canonical and home remains presentational; centering choices remain local UI only.             | brief contract + code review          | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Existing route dynamic/caching behavior must remain unchanged.                                                                            | route review                          | `4/5`             |
| Reliability and failure handling              | `target`     | Preview error state and default state must remain readable and actionable after the visual re-centering.                                  | targeted private-gate test + QA       | `5/5`             |
| Security and authz                            | `target`     | Site-lock protection, password handling, and home CTA visibility must remain unchanged.                                                   | code review + private-gate regression | `5/5`             |
| Privacy and compliance                        | `supporting` | No new fields, cookies, tracking, or promises are added by this layout-only slice.                                                        | diff review                           | `4/5`             |
| Content governance                            | `supporting` | Existing locked copy and brand lockups remain the source of truth; no extra brand repetition or stacked lockup insertion is introduced.   | copy/brand review                     | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no mutable admin surface or operator workflow changes.                                                                        | explicit scope rationale              | `N/A`             |
| SEO and crawlability                          | `supporting` | Home and preview metadata/robots behavior remain unchanged.                                                                               | route review                          | `4/5`             |
| AI discoverability                            | `supporting` | Home should remain semantically clean and easier to parse visually after the centering pass.                                              | route review                          | `4/5`             |
| Analytics and KPI observability               | `supporting` | Existing CTA flows and preview unlock flow remain the observable contract; no new events are needed.                                      | unchanged route/action review         | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, refund, or entitlement path changes.                                                                    | explicit scope rationale              | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice changes public presentation only and introduces no support tooling or operational recovery behavior.               | explicit scope rationale              | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because no finance, billing, or reporting path changes in this slice.                                                                 | explicit scope rationale              | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts English presentation only and does not change localization architecture or content model.                  | explicit scope rationale              | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Stay inside current app-page and preview-access patterns with zero new dependencies and tightly scoped class changes.                     | dependency diff + code review         | `5/5`             |
| Testing and QA automation                     | `target`     | Targeted public-surface tests plus full verify gates must pass, including private-gate coverage for the preview route.                    | targeted tests + verify gates         | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The slice must remain static UI polish with no new server/API/storage/runtime cost path.                                                  | diff review                           | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The work must stay route-scoped and fully reversible by PR revert with no migration fallout.                                              | PR diff review                        | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - preview unlock validation and session-cookie state,
  - auth-derived home CTA behavior.
- Local-only:
  - visual centering, spacing, and composition choices.
- Sync policy:
  - unchanged,
  - preview route still posts through the current server action,
  - home remains render-only.
- Retention and sensitivity:
  - no new stored personal data,
  - no new client storage,
  - no new cookie behavior.
- Cache/invalidation:
  - unchanged route behavior; this slice is presentation-only.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice adds no new persisted entity, slug, route param, or renameable identifier.

## Scope

- Center the preview hero block on mobile.
- Center the preview card composition on mobile while keeping labels, inputs, and the primary action inside the card left-aligned.
- Keep preview desktop composition effectively unchanged.
- Center the entire home intro block inside the centered desktop card instead of leaving only parts of it left-aligned.
- Avoid inserting any extra stacked brand wordmark between hero copy and form/card.

## Out Of Scope

- Preview-access copy changes.
- Preview password flow or server action changes.
- Contact route changes.
- Builder/library/poolside changes.
- Global header redesign.

## Acceptance Criteria

1. On mobile, `/preview-access` reads as a centered hero plus centered card composition.
2. On mobile, the preview form internals remain left-aligned and easy to scan.
3. On desktop, `/preview-access` remains materially unchanged in hierarchy and behavior.
4. On desktop, the home hero inside the centered card reads as one centered intro block.
5. No extra repeated/staked brand lockup is inserted between the preview hero and the form card.
6. Preview unlock behavior, error handling, and next-path routing remain intact.

## Validation

- `npm run lint:briefs`
- `npx playwright test tests/e2e/a11y-home.spec.ts tests/e2e/mobile-screenshots.spec.ts --project=mobile-chromium --project=desktop-chromium`
- `set -a && source .env.local && set +a && SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_PORT=3100 NEXT_DIST_DIR=.next-playwright npx playwright test tests/e2e/private-access-gate.spec.ts --project=mobile-chromium --project=desktop-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/preview-access?next=%2F`
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - iPhone Safari-width viewport
  - desktop Chromium
  - desktop Safari/WebKit-equivalent

## Constraints

- Do not add dependencies.
- Keep the existing public-surface visual language.
- Keep copy changes at zero unless a test contract requires wording parity.
- Form internals inside the preview card must remain left-aligned.

## 10/10 Quality Bar

- Preview mobile should feel centered and calm without looking like a poster instead of a utility gate.
- Home desktop should feel like one composed hero block inside the existing centered card.
- Required states remain clear:
  - preview default,
  - preview invalid-password error,
  - home default.
- Accessibility expectations:
  - preserved heading semantics,
  - explicit form label,
  - readable line lengths,
  - no loss of usability from centering changes.
- Business-logic expectations:
  - no preview unlock regression,
  - no CTA destination drift,
  - no route-truth change.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes public page presentation only and no Help/Guide workflow labels, operator actions, or recovery steps.

## Security, Privacy, And Compliance

- No new secrets or runtime config.
- No new data collection.
- No new auth, site-lock, or cookie semantics.

## Observability And KPI Contract

- No new instrumentation is required.
- Existing preview unlock and home CTA flows remain the observable contract.

## Checkpoint Log

- `2026-04-17 | planning | split a dedicated public follow-up brief for preview mobile centering and home desktop intro centering so the work can ship separately from builder/library/poolside changes | next: move brief to in-progress, implement the layout pass, run targeted public/private-gate validation, then complete pre-pr and pre-merge gates`
- `2026-04-17 | implementation start | moved the brief to in-progress and started the scoped layout pass for preview mobile composition and home desktop hero centering on a dedicated branch | next: finish the route updates, run targeted playwright coverage including password-backed preview gate validation, then run pre-pr gate`
- `2026-04-17 | targeted validation | implemented the centered preview mobile card/hero composition and centered home hero block; targeted public playwright and password-backed private-access-gate runs passed locally | next: run npm run verify:pre-pr, then commit, push, and open the public-polish PR`
- `2026-04-18 | housekeeping closeout | moved brief to done after the centering follow-up landed on main in merged PR #457 | next: none`
