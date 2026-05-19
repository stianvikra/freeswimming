# Task Brief: AW-006 Sample Deliverable Proof (10/10)

## Metadata

- `id`: `2026-05-18-aw-006-sample-deliverable-proof-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-18`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `feat/aw-006-sample-deliverable-proof`
- `merged_pr`: `#754`
- `merged_commit`: `e68d713`

## Pre-Implementation Owner Explanation

Vi gjør de offentlige sidene for Poolside PDF og Video Analysis tydeligere på hva kunden faktisk får se eller motta. Det betyr små, sannferdige proof-/sample-seksjoner på `/programs` og `/analysis`, pluss oppdatert AW-006-kø og tester. Utenfor scope er Stripe/checkout, innsending/API, entitlements, PDF-generator, falske testimonials/før-etter-resultater, og bred design-system-rollout.

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@88ff6ee`
- `audit_status`: `ready`
- `decision`: Execute the next small AW-006 UX/UI queue slice by adding truthful sample deliverable proof to public Poolside PDF and Video Analysis surfaces.
- `reason`: PRs `#750/#751` completed anonymous course progress/admin-note noise, and `#752/#753` added the owner-readable start gate. The canonical AW-006 queue therefore needs to move past anonymous course noise and make Sample Deliverable Proof the next active public UX/conversion slice.
- `must_refresh_before_execution_if`: Refresh if `/programs`, `/analysis`, `ContactForm`, public IA tests, commerce/checkout copy, contact API contracts, Poolside PDF delivery semantics, Video Analysis delivery semantics, AW-006 scope, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Visitors evaluating Poolside PDF and Video Analysis should see a truthful, concrete preview of the deliverable shape before they contact or buy, without changing checkout, contact submission, entitlements, or generated deliverables.

## Mature Reference Surfaces

- `/programs` is the current public program-card route and already uses the AW-006 token proof with 8px cards/actions.
- `/analysis` reuses `ContactForm` as the reference for analysis request guidance, validation, honeypot, focus handling, and `POST /api/contact` payload shape.
- `/plans` is the reference for truthful paid-offer expectations and secure Stripe Checkout copy; this slice should not change checkout behavior or product catalog logic.
- Poolside/PDF and Video Analysis proof must be expectation copy and lightweight UI only, not fabricated testimonials or final generated artifacts.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Content governance`
- `Commerce and revenue ops`
- `Accessibility (a11y)`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence                                                         | Achieved Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/programs` still presents Poolside PDF and Video Analysis as the public program paths; `/analysis` remains the Video Analysis request route with no route identity change. | public IA E2E + screenshot handoff                               | `5/5`                   |
| UX flow clarity                               | `target`     | Each changed public surface explains the sample deliverable shape, then keeps the existing CTA path visible and understandable.                                             | public IA E2E + screenshot handoff                               | `5/5`                   |
| Visual design quality                         | `target`     | Proof content uses existing AW-006 card tokens, 8px radius, stable spacing, and no nested card stack or mobile text overlap.                                                | screenshot handoff + CSS assertions where practical              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing contact payload, form validation, checkout/catalog behavior, CTA hrefs, and product availability logic remain unchanged.                                           | unit tests + public IA E2E + diff review                         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, content CRUD, publish workflow, admin labels, or operator editing surface.                                                  | explicit admin scope rationale                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New proof content is semantic text/list content inside existing headings/sections; form controls, labels, focus, and CTA accessible names remain intact.                    | unit tests + public IA E2E + screenshot/DOM review               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: add no dependency, no image/media asset, no API call, and no new client component boundary beyond existing route/component usage.                          | package diff review + broad gates after screenshot approval      | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no local storage, server-canonical data, sync, cache mutation, retention rule, or sensitive data handling.                                | explicit stateless scope rationale                               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no fetch path, route cache mode, revalidation trigger, mutation response, or stale-data behavior.                                            | explicit cache scope rationale                                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing contact error/success handling and unavailable-product recovery remain unchanged; the new proof content introduces no new network/failure path.                    | contact unit tests + diff review                                 | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because this slice changes no protected route, authz check, auth provider behavior, token handling, cookies, or server-side input validation.                           | explicit security scope rationale                                | `N/A`                   |
| Privacy and compliance                        | `target`     | Video Analysis proof keeps the existing privacy boundary: no payment details, passwords, sign-in codes, or private medical details in request copy.                         | contact unit tests + public IA E2E                               | `5/5`                   |
| Content governance                            | `target`     | Proof copy stays substantiated by current product behavior and avoids testimonials, guaranteed outcomes, fabricated before/after claims, or unsupported sample assets.      | copy review + canonical queue update                             | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow labels, edit actions, support recovery behavior, Help/Guide assertions, or operator-facing procedure.                      | explicit admin-workflow scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public semantic text becomes clearer, but no metadata, sitemap, robots, canonical, structured data, or route indexability changes are in scope.            | rendered content review                                          | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public pages expose clearer product semantics in crawlable text; no structured entity model or AI-facing documentation contract changes.                   | rendered content review                                          | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no event taxonomy, analytics payload, dashboard, metric, logging event, or KPI definition.                                                   | explicit analytics scope rationale                               | `N/A`                   |
| Commerce and revenue ops                      | `target`     | Paid/lead-gen copy remains accurate about Poolside PDF and Video Analysis expectations while preserving Stripe Checkout and final-price behavior unchanged.                 | public IA E2E + plans/contact diff review                        | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this slice changes no alert path, support workflow, recovery behavior, support diagnostics, runbook, incident response process, or on-call action.                     | explicit support-ops scope rationale                             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or reporting workflow.                   | explicit finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new strings are plain product copy without hard-coded layout assumptions; no locale routing, translation workflow, or metadata localization changes.       | copy/layout review                                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React/Tailwind primitives and public tests; add no dependency, API route, Supabase query, schema, feature flag, or external service integration.             | package diff review + code review                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Update targeted unit/E2E coverage for the new proof copy and unchanged CTA/form contracts; capture screenshot handoff before broad gates.                                   | targeted Vitest + Playwright + screenshot artifacts              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: static copy/UI adds no runtime data fetch, provider call, media payload, or infrastructure cost.                                                           | diff review                                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR revert restores prior public copy; no migration, env var, dependency, provider, data repair, or release flag rollback is required.                                   | git diff review + pre-pr/pre-merge gates after screenshot review | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing route components: `app/programs/page.tsx` and `components/ContactForm.tsx`.
  - Keep `/analysis` on the existing `ContactForm` client component; do not introduce a new route boundary, server action, API route, cache mode, or revalidation behavior.
- TypeScript/domain contracts:
  - Keep `ContactForm` variant names, status model, validation, honeypot, and contact payload shape unchanged.
  - Program-card proof data can stay typed route-local static content.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, index, storage, or server data change.
- External services/tools:
  - No Stripe, email, analytics, Supabase provider, webhook, SDK, secret, retry, or idempotency change.
- UI system:
  - Reuse AW-006 token utilities (`fs-program-card`, `fs-surface-card`, 8px radii, existing CTA classes).
  - Screenshot handoff type: `before/after` for `/programs` and `/analysis` desktop/mobile.
- Testing:
  - Unit: `ContactForm` analysis proof copy and unchanged submit path.
  - E2E: public IA assertions for `/programs` and `/analysis` proof copy and CTA destinations.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Closeout

- `10/10 claim`: `yes`
- `merged_pr`: `#754`
- `merged_commit`: `e68d713`
- `merge_date`: `2026-05-19`
- Critical target categories confirmed `5/5`:
  - Product goals and IA
  - UX flow clarity
  - Visual design quality
  - Content governance
  - Commerce and revenue ops
  - Accessibility (a11y)
  - Testing and QA automation
  - DevOps and rollback readiness
- Remaining gaps: none for the scoped slice.
- Defer/fix recommendation: none; all target categories are `5/5`.
- Screenshot artifacts: `output/aw-006-sample-deliverable-proof-current-head-2026-05-18-223204`
- Validation evidence:
  - `npm run verify:pre-pr`: PASS on `a3ca557`
  - GitHub CI for PR `#754`: PASS
  - `npm run verify:pre-merge`: PASS on `a3ca557`
  - `npm run merge:preflight -- --assert-ready`: PASS before merge

## Data Placement And Sync Contract

N/A with rationale: this is static public copy/UI work. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict handling, cache invalidation, retention rule, or sensitive data flow.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename policy, alias, redirect, or compatibility mapping.

## Help / Guide Impact

N/A with rationale: this slice changes no Help/Guide content, user/admin workflow labels, recovery behavior, support procedure, operator runbook, or admin edit path. It only clarifies public marketing/request expectations.

## Route / Label / Support Surface Sweep

Required because this slice changes public product expectation copy.

- Identifiers searched before PR handoff:
  - `Sample deliverable`
  - `Poolside PDF`
  - `Video Analysis`
  - `Request Video Analysis`
  - `Join PDF waitlist`
  - `Get feedback`
  - `/programs`
  - `/analysis`
- Surfaces checked:
  - `app/programs/page.tsx`
  - `components/ContactForm.tsx`
  - `tests/unit/contact-form.test.tsx`
  - `tests/e2e/public-ia.spec.ts`
  - `docs/task-briefs/`
- Expected fallout:
  - public copy/UI and targeted tests only,
  - no API, checkout, analytics, Help/Guide, Supabase, admin, or generated PDF changes.
- Sweep evidence:
  - `2026-05-18`: ran `rg -n "Sample deliverable|Poolside PDF|Video Analysis|Request Video Analysis|Join PDF waitlist|Get feedback|/programs|/analysis" app components tests docs/task-briefs`.
  - Expected fallout was limited to `app/programs/page.tsx`, `components/ContactForm.tsx`, `tests/e2e/public-ia.spec.ts`, `tests/unit/contact-form.test.tsx`, this brief, and the canonical AW-006 queue. Other matches were pre-existing route/menu/admin/test references and required no behavior change.

## Scope

- Create this in-progress AW-006 child brief.
- Refresh the canonical AW-006 queue to mark anonymous course noise and owner-readable governance shipped, and mark Sample Deliverable Proof active.
- Add truthful sample/proof sections to `/programs` Poolside PDF and Video Analysis cards.
- Add truthful Video Analysis deliverable-shape proof to the `/analysis` request guidance.
- Update targeted unit/E2E assertions.
- Capture before/after screenshots for `/programs` and `/analysis`.

## Out Of Scope

- Stripe Checkout, product catalog, prices, invoices, entitlements, refunds, payouts, or reporting.
- Contact API payloads, provider delivery, storage, rate limits, spam controls, or admin message workflows.
- Poolside PDF generator/download internals, generated PDF assets, guide entitlement logic, or final deliverable artifacts.
- Testimonials, guaranteed results, fabricated before/after claims, new sample media assets, new routes, new dependencies, analytics events, metadata/sitemap, Help/Guide, Supabase, migrations, and broad design-system rollout.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge to `main`.

## Acceptance Criteria

1. `/programs` shows concrete, truthful proof expectations for Poolside PDF and Video Analysis.
2. `/analysis` explains the shape of the reply without changing the request form, validation, success/error behavior, or API payload.
3. Existing CTA destinations remain unchanged: Poolside PDF waitlist goes to `/contact`, Video Analysis goes to `/analysis`.
4. No checkout, contact API, entitlement, generated PDF, Supabase, analytics, metadata, or Help/Guide behavior changes.
5. New UI remains readable on desktop and mobile, with 8px token-backed surfaces/actions and no nested card stack.
6. Targeted unit/E2E tests and `git diff --check` pass before screenshot handoff.
7. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

- Targeted before screenshot handoff:
  - `npx vitest run tests/unit/contact-form.test.tsx`
  - `npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium`
  - `npm run lint:briefs:all`
  - `git diff --check`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/aw-006-sample-deliverable-proof-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - representative filenames:
    - `before-programs-desktop-1440.png`
    - `after-programs-desktop-1440.png`
    - `before-analysis-mobile-390.png`
    - `after-analysis-mobile-390.png`
- After screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-18 | in-progress | started from clean main@88ff6ee after PR #752 and closeout #753; post-merge preflight found no repo-managed closeout; selected Sample Deliverable Proof because #750/#751 closed anonymous course noise and this is the next remaining AW-006 public trust/conversion slice; captured before screenshots for /programs and /analysis in output/aw-006-sample-deliverable-proof-2026-05-18-213725 | next: update canonical AW-006 queue, implement truthful proof copy/UI, run targeted tests, capture after screenshots, and stop for owner screenshot approval before broad gates`
- `2026-05-18 | screenshot-review | refreshed the canonical AW-006 queue, added truthful sample/proof copy to /programs Poolside PDF and Video Analysis cards, added Video Analysis reply-shape proof to ContactForm without changing validation or payload behavior, and updated targeted tests; targeted validation passed with npm run typecheck, npx vitest run tests/unit/contact-form.test.tsx, npm run lint:briefs:all, git diff --check, and npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium; captured before/after screenshots plus focused after proof captures in output/aw-006-sample-deliverable-proof-2026-05-18-213725; metrics showed bodyWidth equals viewportWidth and no console/request failures on captured /programs and /analysis routes | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | screenshot-approved | owner approved screenshot handoff; no product-rendering files changed after screenshot capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-18 | pre-pr-green | npm run verify:pre-pr passed full lane after a brief evidence wording fix; lint, quality gates, typecheck, 1108 unit tests, build, perf budgets, and E2E passed locally (98 passed, 472 skipped). Performance gate recommended hold because margin was 14.8% against a 15.0% tighten threshold despite 6 weekly green runs | next: rerun npm run verify:pre-pr after this checkpoint update, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
