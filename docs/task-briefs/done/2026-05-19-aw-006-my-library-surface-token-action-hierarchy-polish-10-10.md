# Task Brief: AW-006 My Library Surface Token And Action Hierarchy Polish (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-my-library-surface-token-action-hierarchy-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-my-library-surface-polish`
- `merged_pr`: `#758`
- `merge_commit`: `main@3658eaf191f577a8d467f8d0af7551a510aa891c`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@9b5c05f`
- `audit_status`: `ready`
- `decision`: Execute the next canonical AW-006 implementation slice on the signed-in `/my-library` hub.
- `reason`: PR `#756` and closeout `#757` left `main` clean and the canonical AW-006 queue recommends `My Library surface token and action hierarchy polish` as the next small PR-sized UX/UI slice.
- `must_refresh_before_execution_if`: Refresh if `/my-library`, `ContinueCourseCard`, `MyLibraryNewContentNotice`, `CheckoutButton`, `PortalButton`, `SiteChrome`, AW-006 token utilities, screenshot handoff rules, auth redirects, entitlement/commerce contracts, or scorecard categories change before PR handoff.

## Goal

Make the authenticated `/my-library` hub feel calmer and more deliberate by applying the AW-006 token direction to the shell, repeated rows, notices, owned/explore cards, and primary/secondary action hierarchy without changing member data, entitlement truth, auth behavior, or destination routes.

## Pre-Implementation Owner Explanation

Denne slicen skal rydde `My Library` visuelt, spesielt design-tokenbruk og hvilke handlinger som fremstar som primaere og sekundaere. Det betyr noe fordi brukeren raskere skal forsta hva som er viktigst a gjore i biblioteket uten at skjermen foles mer rotete. Utenfor scope er nye bibliotekfunksjoner, endringer i dataflyt/lagring, store navigasjonsendringer og redesign av andre AW-006-flater.

## Mature Reference Surfaces

- `/our-method` and `/programs` for the proven AW-006 token foundation, 8px cards, and primary/secondary CTA treatments.
- Existing My Library child routes for protected route/auth behavior and member navigation labels.
- `ContinueCourseCard` and `MyLibraryNewContentNotice` as route-local My Library components to polish in place rather than replacing with a new shared framework.
- Swim session builder, micro sessions, dryland training, habits, Poolside Guide, and PDF/print surfaces remain quality references only; this slice does not migrate those larger workflows.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                           | Evidence                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library` remains the signed-in member hub with the same core destinations, but the hub distinguishes daily/member navigation, optional builder preview, owned items, and explore items. | My Library e2e + screenshot review + route/link diff review    | `5/5`                   |
| UX flow clarity                               | `target`     | Primary actions must not all compete visually; secondary/adminish/account/recovery actions stay available but lower weight; no dead-end state is introduced.                                 | My Library e2e + screenshot review                             | `5/5`                   |
| Visual design quality                         | `target`     | Shell/cards/actions use AW-006 token-backed radii, border, shadow, and text/color tokens; mobile screenshots show no clipped text, overlapping rows, or card-on-card clutter.                | token unit test + before/after desktop/mobile screenshots      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Entitlement, catalog, active-goal, workout, program, dryland, claim, portal, sign-out, and checkout logic stays behaviorally unchanged.                                                      | link/action assertions + code review + targeted e2e            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes a signed-in learner/member hub, not an admin editor, publish workflow, role-gated CRUD flow, or operator editing surface.                                           | explicit admin scope rationale                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `My Library` H1 remains; sections keep semantic headings; links/buttons remain keyboard-focusable with accessible text and 44px-class touch targets where relevant.              | e2e assertions + screenshot/manual review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library` adds no dependency, no media asset, no new API call, and no new broad client component; token polish remains CSS/markup-only.                                                  | package diff review + build/pre-pr gate                        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical data remains Supabase-backed user identity, entitlements, goals, workouts, programs, and dryland snapshots; local-only course resume/new-lesson seen state is unchanged.    | data-boundary review + code diff                               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing `force-dynamic` member route and existing `no-store` new-content signal behavior remain unchanged; no new cache or revalidation path is added.                                      | code diff + route review                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing schema-sync and new-content loading/error/retry states remain available and visually fit the new hierarchy; no expected failure path becomes invisible.                             | component tests + e2e + screenshot review                      | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library` still redirects to contextual sign-in; protected data remains server-authenticated; no raw env, secret, or unauthorized client data exposure is introduced.          | protected-route e2e + security scope review                    | `5/5`                   |
| Privacy and compliance                        | `target`     | The signed-in email remains limited to the protected member surface; screenshots and PR text must not include secrets or raw env values; legal links remain available.                       | screenshot review + privacy link assertion + diff review       | `5/5`                   |
| Content governance                            | `target`     | This active brief links to the canonical AW-006 queue and records any route/label/support sweep fallout; visible copy changes stay route-local and truthful.                                 | this brief + route/label/support sweep                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, Help/Guide operator action, publish state, or editable content model changes.                                                                           | explicit admin workflow scope rationale                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or crawl-facing route.                                         | explicit private-route SEO rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private member hub is not a public AI/crawler discovery surface and no structured data or public entity text changes.                                                       | explicit private-route AI rationale                            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing `library_viewed`, `upsell_presented`, resume, checkout, and new-content notice events remain wired; no event taxonomy change is planned.                           | event diff review + targeted test/code review                  | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Owned/explore/checkout/claim/portal links stay correct; no Stripe, pricing, entitlement, invoice, refund, payout, or reporting behavior changes.                                             | My Library e2e + checkout/portal link review                   | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this visual hierarchy slice changes no alert path, support recovery workflow, operator diagnostics, incident runbook, or Help/Guide support content.                                    | explicit support-ops scope rationale                           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, or revenue recognition data.                                            | explicit finance scope rationale                               | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this slice may reuse existing English labels but introduces no locale routing, translation workflow, dynamic grammar contract, or metadata localization change.                         | explicit i18n scope rationale                                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next/React route-local server page, current My Library client components, CSS custom properties, and Tailwind; add no dependency or broad design-system rewrite.                | diff review + package diff review                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused token/component/e2e coverage, capture before/after screenshots, then stop for owner screenshot approval before `verify:pre-pr`.                                           | targeted tests + screenshot handoff + later gate logs          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token reuse reduces future styling drift; no runtime polling, storage, server work, or third-party cost model changes.                                                      | CSS/markup review                                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is reversible by reverting `/my-library`, affected My Library components, token tests, and this brief; no migration, dependency, config, workflow, or feature flag rollback needed.   | git diff review + pre-pr/pre-merge gates after screenshot stop | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `app/my-library/page.tsx` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome`, `ContinueCourseCard`, `MyLibraryNewContentNotice`, `CheckoutButton`, `PortalButton`, and `CreateManualProgramButton`.
  - Do not add a server action, API route, redirect, cache, metadata, sitemap, or layout boundary.
- TypeScript/domain contracts:
  - Route-local class-name helpers are acceptable for repeated visual treatments.
  - No catalog, entitlement, goal, workout, program, dryland, claim, portal, sign-out, analytics, or domain type contract changes.
- Supabase/data layer:
  - N/A for implementation; no schema, migration, RLS, generated type, index, storage, or query shape change is planned.
- External services/tools:
  - N/A; no Stripe API, email, analytics provider, webhook, SDK, secret, or deployment setting change.
- UI system:
  - Reuse the AW-006 token foundation from `app/globals.css`.
  - If a route-local utility is needed, keep it small, token-backed, and named for My Library.
  - Repeated member hub rows should use 8px card/control radii, restrained shadows, and a clearer primary/secondary action distinction.
  - Hide the fixed mobile bottom nav on the top-level `/my-library` hub if screenshot QA shows it covering hub content; focused My Library subroutes keep contextual mobile nav.
  - Screenshot handoff type: `before/after` for `/my-library` desktop and mobile.
- Testing:
  - Unit: token utility contract and touched client component states where relevant.
  - E2E: signed-in My Library entrypoints and protected anonymous redirect.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data:
  - Authenticated user identity, entitlements, product catalog overrides, active goals, workout snapshot, program snapshot, dryland snapshot, checkout/portal/claim destinations.
- Local data:
  - Existing course resume lesson id in local storage remains local-only.
  - Existing My Library new-content seen state remains local-only per user id.
- Sync policy:
  - No new sync behavior. Existing server reads happen during the dynamic route render; existing new-content notice fetch remains `no-store`.
- Retention and sensitivity:
  - No new stored values. Signed-in email remains visible only on the protected member page.
- Cache/invalidation:
  - Keep `dynamic = "force-dynamic"` for `/my-library` and existing `cache: "no-store"` for the new-content signal fetch.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing product IDs/slugs and member route URLs must remain unchanged.

## Help / Guide Impact

N/A with rationale: this slice changes visual hierarchy on a signed-in user hub only. It does not change admin/user workflow labels, recovery behavior, Help/Guide assertions, auth flow, payment flow, runbook instruction, or operator-facing support surface.

## Route / Label / Support Surface Sweep

Required because `/my-library` route layout, visible labels, action hierarchy, and commerce/member support links are touched.

- Identifiers searched before PR handoff:
  - `/my-library`
  - `My Library`
  - `Free Course`
  - `My Routines`
  - `My Swim Profile`
  - `Goals`
  - `Swim Sessions`
  - `Dryland Sessions`
  - `Owned library items`
  - `Explore available items`
  - `fs-library`
  - `mobile-fixed-nav`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/app-knowledge-book/`
  - `docs/runbooks/`
- Completed fallout:
  - route-local `/my-library` markup/classes,
  - My Library client component visual classes,
  - token and My Library entrypoint tests,
  - this brief and possibly the canonical AW-006 queue.
  - no Help/Guide runtime update.

## Scope

- Create this in-progress child brief.
- Capture before/after desktop and mobile screenshots for `/my-library`.
- Apply AW-006 token direction to the `/my-library` shell and repeated cards/rows.
- Clarify primary vs secondary actions without changing hrefs, forms, auth, checkout, portal, claim, or analytics behavior.
- Polish `ContinueCourseCard` and `MyLibraryNewContentNotice` visual treatment if needed for route consistency.
- Add/update focused tests for token contracts and My Library entrypoints.

## Out Of Scope

- New My Library features, new data loading, new persistence, Supabase migrations, RLS/authz changes, Stripe/checkout/portal behavior, claim/download recovery behavior, analytics taxonomy changes, admin/help-center changes, sitemap/metadata changes, broad design-system refactors, child route redesigns, PDF/print/export changes, new assets, new dependencies, or merge to `main`.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. `/my-library` still redirects anonymous users to `/auth/sign-in?next=%2Fmy-library`.
2. Signed-in `/my-library` still exposes Free Course, My Routines, My Swim Profile, Goals, Swim Sessions, Dryland Sessions, owned items, explore items, account portal, sign-out, claim/recovery, checkout, and privacy/cookie links as applicable.
3. Repeated route cards/actions use token-backed 8px card/control radii and a calmer primary/secondary hierarchy.
4. Commerce/account/recovery actions remain available but do not visually compete with the main member navigation.
5. Desktop and mobile before/after screenshots show no overlapping text, clipped controls, fixed-nav obstruction, or incoherent card nesting.
6. Targeted tests and `git diff --check` pass before screenshot handoff.
7. `npm run verify:pre-pr`, PR/CI, and `npm run verify:pre-merge` run only after owner screenshot approval or an explicit waiver.

## Validation

- Targeted before screenshot handoff:
  - `npm run lint:briefs:all`
  - `npx vitest run tests/unit/design-token-contract.test.ts tests/unit/continue-course-card.test.tsx tests/unit/my-library-new-content-notice-component.test.tsx tests/unit/portal-button.test.tsx`
  - `npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium`
  - `npm run typecheck`
  - `git diff --check`
- Screenshot:
  - `before/after` `/my-library` desktop and mobile screenshots in `output/my-library-surface-polish-YYYY-MM-DD-HHMMSS/`.
- Broad gates after owner screenshot approval:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Local screenshots use `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000` and capture against `http://127.0.0.1:3000`.

## Closeout Evidence

- `implementation_pr`: `#758`
- `merge_commit`: `main@3658eaf191f577a8d467f8d0af7551a510aa891c`
- `final_screenshot_artifacts`: `output/my-library-surface-polish-final-2026-05-19-085506`
- `screenshot_review`: owner approved the screenshot handoff before broad gates; final screenshots were regenerated after the last render-text change and no product-rendering files changed after that capture.
- `npm run verify:pre-pr`: PASS full lane on branch `aw-006-my-library-surface-polish`.
- `npm run verify:pre-merge`: PASS full lane on branch `aw-006-my-library-surface-polish`.
- `required_ci`: PASS for PR `#758` (`verify`, `e2e-smoke`, `site-lock-smoke`, `size-check`, `CodeQL`, `Vercel`, and deploy preview).
- `perf_budget`: PASS; `/my-library` JS 273.0kb and CSS 103.5kb. Stretch-tighten recommendation was `hold`, not tighten, because worst margin was 14.7% against the 15.0% threshold.
- `remaining_gaps`: No blocking gaps. Final screenshots used deterministic local preview data because auth-backed local capture is intentionally constrained by the safe Supabase/dev-login environment.
- `10/10 claim`: yes for this active slice.
- `critical_target_categories`: `Product goals and IA`, `UX flow clarity`, `Visual design quality`, `Accessibility (a11y)`, `Security and authz`, and `Testing and QA automation` each achieved `5/5`.

Achieved target scores:

- `Product goals and IA`: `5/5`
- `UX flow clarity`: `5/5`
- `Visual design quality`: `5/5`
- `Business logic correctness and data integrity`: `5/5`
- `Accessibility (a11y)`: `5/5`
- `Performance (CWV + payloads)`: `5/5`
- `Data placement and sync boundaries`: `5/5`
- `Caching and invalidation strategy`: `5/5`
- `Reliability and failure handling`: `5/5`
- `Security and authz`: `5/5`
- `Privacy and compliance`: `5/5`
- `Content governance`: `5/5`
- `Commerce and revenue ops`: `5/5`
- `Stack-fit and dependency discipline`: `5/5`
- `Testing and QA automation`: `5/5`
- `DevOps and rollback readiness`: `5/5`

Achieved supporting scores:

- `Analytics and KPI observability`: `4/5`
- `Scalability and cost efficiency`: `4/5`

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@9b5c05f after PR #756 and repo-managed closeout #757; post-merge preflight found no pending closeout; created branch aw-006-my-library-surface-polish; scoped the canonical next AW-006 UI slice to /my-library surface token and action hierarchy polish with screenshot approval stop before broad gates | next: capture before screenshots, implement route-local token/action hierarchy polish, run targeted validation, and present before/after screenshot handoff`
- `2026-05-19 | in-progress | extracted the signed-in /my-library hub into a route-local server presentation component, applied token-backed My Library card/action classes, demoted account/recovery actions, hid the fixed mobile bottom nav on the top-level hub to prevent obstruction, updated focused token/component/e2e coverage, and captured before/after desktop/mobile screenshots in output/my-library-surface-polish-2026-05-19-062325; owner approved screenshot handoff | next: remove temporary capture-only preview files, rerun targeted validation, run verify:pre-pr, then commit/push/open PR`
- `2026-05-19 | in-progress | removed capture-only preview files from the final diff; route/label/support sweep found expected /my-library, label, fs-library token, and mobile-fixed-nav references with fallout handled in product code, tests, docs/user-flow-map.md, and this brief; npm run lint:briefs:all passed; npm run typecheck passed; npx vitest run tests/unit/design-token-contract.test.ts tests/unit/continue-course-card.test.tsx tests/unit/my-library-new-content-notice-component.test.tsx tests/unit/portal-button.test.tsx passed; npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium passed with the safe-env auth-dependent cases skipped and the anonymous protected-route assertion passing; git diff --check passed | next: run npm run verify:pre-pr`
- `2026-05-19 | in-progress | npm run verify:pre-pr passed full lane: lint/quality gates/typecheck/195 unit files/1108 unit tests/build/perf budgets/full Playwright matrix with 98 passed and 472 skipped in the safe local environment; perf trend recorded PASS with hold recommendation, not tighten, because worst margin was 14.7% against the 15.0% tighten threshold | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-19 | done | PR #758 merged as main@3658eaf191f577a8d467f8d0af7551a510aa891c after screenshot approval, local verify:pre-pr, required CI, and local verify:pre-merge all passed; repo-managed closeout moved this brief to done and recorded achieved scores | next: rerun post-merge:preflight after the closeout PR merges`
