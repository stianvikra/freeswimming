# Task Brief: AW-006 My Library Dashboard Desktop Value Hierarchy (10/10)

## Metadata

- `id`: `2026-06-02-aw-006-my-library-dashboard-desktop-value-hierarchy-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-02`
- `updated`: `2026-06-02`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-library-dashboard-desktop-hierarchy`

## Brief Audit Record

- `last_audited`: `2026-06-02`
- `base`: `main@f87f3dc`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice.
- `reason`: `main` is clean and synced after Download Resend Form Token/Input Parity PR `#953` and repo-managed closeout PR `#954`; post-merge preflight was reported green with no active AW-006 product/UI slice selected. A fresh queue/design/code re-audit found that most token/action parity gaps are now closed, while the AW-006 review still records desktop/dashboard hierarchy as future-slice material. `AdminWorkspace` already has a sticky two-column desktop shell, but `/my-library` remains a flatter scan list on large screens even though `docs/user-flow-map.md` calls it the top-level owner dashboard. The owner approved this slice and explicitly said `execute My Library Dashboard Desktop Value Hierarchy`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library`, `MyLibraryHub`, `ContinueCourseCard`, `MyLibraryNewContentNotice`, checkout/portal/claim actions, library section contracts, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, verification lanes, or post-merge closeout rules change before screenshot handoff.

## Goal

Make the signed-in `/my-library` hub read more like a desktop-native member dashboard, with clearer value hierarchy and action grouping, while preserving existing data, destinations, auth, commerce, analytics, recovery, and mobile behavior.

## Pre-Implementation Owner Explanation

Denne slicen gjor `My Library` mer oversiktlig pa stor skjerm, slik at viktigste neste steg, medlemsomrader og kjopte/tilgjengelige produkter blir lettere a skanne. Det betyr noe fordi biblioteket er brukerens hoveddashboard etter innlogging, og dagens desktopflate fortsatt er ganske flat selv om de mindre knappestilene er ryddet. Utenfor scope er nye funksjoner, nye data/API-er, Stripe/auth-endringer, admin-layout, brand-media-system og redesign av underliggende My Library-ruter.

Forward compatibility intent: Layouten skal fortsatt drives av eksisterende library-sections, snapshots og produktdata, slik at nye produkter eller medlemsrader arver samme dashboardstruktur uten hardkodet dagens innhold.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                               | Evidence                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library` remains the signed-in member hub with the same destinations, while desktop layout distinguishes resume/today actions, member workspaces, owned/recovery, and explore commerce areas.               | e2e entrypoint assertions + screenshot handoff + route/link diff review | `5/5`                   |
| UX flow clarity                               | `target`     | Primary next-step and member workspace actions are easier to scan on desktop; mobile order remains clear; no route, label, or action becomes hidden or dead-ended.                                               | desktop/mobile screenshots + focused e2e                                | `5/5`                   |
| Visual design quality                         | `target`     | Desktop uses a stable responsive layout with no flat long-scroll feel, card-on-card clutter, clipped text, orphan mobile action rows, or incoherent nesting; mobile remains at least as readable as before.      | before/after screenshots for desktop/mobile/tablet where practical      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Entitlement, catalog, active-goal, workout, program, dryland, claim, portal, sign-out, checkout, and local notice behavior stay unchanged.                                                                       | changed-files review + link/action tests + targeted e2e                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes a signed-in learner/member hub, not an admin editor, publish workflow, role-gated CRUD flow, operator queue, or admin editing surface.                                                  | explicit admin-editor scope rationale                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `My Library` H1 remains; semantic sections/headings remain meaningful; links/buttons keep accessible text, focus styles, and touch-sized controls; desktop grid does not reorder focus incoherently. | e2e assertions + screenshot/manual review                               | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library` adds no dependency, no media asset, no new API call, and no broad client component; route-level budget target remains `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`.                | package diff review + type/build/pre-pr gates after screenshot approval | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical data remains Supabase-backed identity, entitlements, goals, workouts, programs, and dryland snapshots; existing local-only course resume/new-content seen state remains unchanged.              | data-boundary review + code diff                                        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing `force-dynamic` member route and existing `no-store` new-content fetch behavior remain unchanged; no new cache/revalidation path is introduced.                                                         | route/cache diff review                                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing schema-sync, owned-empty, unknown-owned, new-content loading/error, claim/recovery, and explore states remain visible in the new hierarchy.                                                             | component/unit coverage + e2e + screenshot review                       | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library` still redirects to contextual sign-in; protected data remains server-authenticated; no raw env, secret, entitlement detail, or unauthorized client data exposure is introduced.          | protected-route e2e + security scope review                             | `5/5`                   |
| Privacy and compliance                        | `target`     | Signed-in email stays limited to the protected hub; legal links remain available; screenshots/PR text must not include secrets, raw env values, tokens, or payment data.                                         | screenshot review + privacy link assertion + diff review                | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and design inventory record this selected slice and clear stale auth `partial` metadata as re-audit fallout without opening new auth scope.                                               | docs diff + route/label/support sweep + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, Help/Guide operator action, publish state, editable content model, recovery workflow, or support queue behavior changes.                                                    | explicit admin-workflow scope rationale                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or crawl-facing route.                                                             | explicit private-route SEO rationale                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private member hub is not a public AI/crawler discovery surface and no structured data or public entity text changes.                                                                           | explicit private-route AI rationale                                     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing `library_viewed`, `upsell_presented`, checkout, and new-content notice instrumentation remains wired; no event taxonomy, payload, persistence, dashboard, or KPI definition change.    | event diff review + targeted code review                                | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Owned/explore/checkout/claim/portal paths stay correct; no Stripe, pricing, entitlement, invoice, refund, payout, reconciliation, or reporting behavior changes.                                                 | My Library e2e + checkout/portal/claim link review                      | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this slice changes no alert path, support recovery workflow, operator diagnostic, incident runbook, escalation path, or support procedure.                                                                  | explicit incident/support scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, revenue recognition data, or finance operations surface.                                    | explicit finance scope rationale                                        | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing labels remain layout-safe on desktop/mobile without fixed-width or today-only text assumptions that would block later locale expansion.                                                                 | screenshot text-fit review + responsive layout review                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next/React server route, current My Library components, CSS custom properties, Tailwind, and established AW-006 token/action classes; add no dependency or broad design-system rewrite.             | diff review + package diff review                                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused tests/docs, run targeted unit/e2e/type/diff checks, capture screenshot handoff, then stop for owner screenshot approval before `npm run verify:pre-pr`.                                           | targeted test logs + screenshot handoff + later gate logs               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: data-driven layout reduces future styling drift; no runtime polling, storage, server work, third-party service, or cost model change.                                                           | CSS/markup review                                                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is reversible by reverting `MyLibraryHub`, tests, docs, and this brief; no migration, dependency, config, workflow, feature flag, or destructive cleanup is required.                                     | git diff review + pre-pr/pre-merge gates after screenshot approval      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `app/my-library/page.tsx` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Implement the desktop hierarchy in `components/my-library/MyLibraryHub.tsx` only, unless a tiny local helper is needed.
  - Reuse `SiteChrome`, `ContinueCourseCard`, `MyLibraryNewContentNotice`, `CheckoutButton`, `PortalButton`, `DownloadResendForm`, and `CreateManualProgramButton`.
  - Do not add server actions, API routes, redirects, route handlers, cache behavior, metadata, sitemap, or layout boundaries.
- TypeScript/domain contracts:
  - Preserve `LibrarySections`, `CatalogProduct`, workout/program/dryland snapshot contracts, and existing action props.
  - Deterministic invariant: the desktop layout may regroup already-rendered surfaces, but must not change destination hrefs, form actions, analytics events, data filters, ownership checks, or fallback copy meaning.
- Supabase/data layer:
  - N/A for implementation; no schema, migration, RLS, generated type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe API, email, analytics provider, webhook, SDK, secret, or deployment setting change.
- UI system:
  - Mature reference surfaces: the existing `/my-library` token-polished hub, My Library child route shells, `AdminWorkspace` desktop sticky shell as a desktop IA reference only, and AW-006 `fs-library-card` / `fs-cta-*` classes.
  - Use stable responsive grid dimensions and section groupings so desktop/tablet/mobile do not shift unexpectedly.
  - Screenshot handoff comparison type: `before/after` for `/my-library` desktop, mobile, and tablet if practical.
- Testing:
  - Unit/component: update My Library hub/token assertions where existing tests cover class/contract changes.
  - E2E: keep signed-in entrypoints and anonymous redirect assertions aligned.
  - Screenshot: capture after targeted QA and stop before broad gates.

## Data Placement And Sync Contract

- Server-canonical data:
  - Authenticated user identity, entitlements, product catalog overrides, active goals, workout snapshot, program snapshot, dryland snapshot, checkout/portal/claim destinations.
- Local-only data:
  - Existing course resume lesson id in local storage remains local-only.
  - Existing My Library new-content seen state remains local-only per user id.
- Sync policy:
  - No new sync behavior. Existing server reads happen during dynamic route render; existing new-content notice fetch remains unchanged.
- Retention and sensitivity:
  - No new stored values. Signed-in email remains visible only on the protected member page.
- Cache/invalidation:
  - Keep `dynamic = "force-dynamic"` for `/my-library` and existing `cache: "no-store"` for the new-content signal fetch.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing product IDs/slugs and member route URLs must remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - product/catalog rows, entitlements, owned/explore sections, unknown-owned products, member workspace rows, route labels, locale-length variation, and existing analytics payload counts are touched visually.
- Source of truth:
  - Owned/explore products continue to come from `LibrarySections`.
  - Product-specific titles and slugs continue to come from catalog/product rows.
  - Workout/program/dryland availability continues to come from existing snapshot contracts.
- Additive behavior:
  - New owned/explore products should render in the same responsive sections without extra hardcoded layout entries.
  - Unknown owned products should keep the generic purchased-item fallback and recovery/support actions.
  - New labels should fit the responsive cards without fixed-width assumptions.
- Explicit mapping requirements:
  - New top-level member workspaces, new product-specific copy, new commerce recovery behavior, new analytics event semantics, and new Help/Guide/support workflows require explicit mapping, tests, and docs before release.
- Unknown or deprecated values:
  - Unknown product IDs continue to render generic owned fallback copy and recovery/support actions rather than silently disappearing.
  - Missing schema snapshots continue to show existing sync guidance instead of linking to unavailable routes.
- Test/evidence:
  - My Library entrypoint e2e, route/label/support sweep, screenshots, and changed-files review must prove the layout is not hardcoded only to today's product rows.

## Help / Guide Impact

N/A with rationale: this slice changes visual hierarchy on a signed-in user hub only. It does not change admin/user workflow labels, recovery behavior, Help/Guide assertions, auth flow, payment flow, runbook instruction, or operator-facing support surface.

## Route / Label / Support Surface Sweep

Required before broad gates because `/my-library` route layout, visible labels, action hierarchy, and commerce/member support links are touched.

- Search identifiers:
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
  - `Auth sign-in fallback clarity`
  - `Contextual sign-in clarity`
  - `fs-library`
  - `mobile-fixed-nav`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/design/`
  - `docs/runbooks/`
  - `docs/app-knowledge-book/`
- Expected fallout:
  - `components/my-library/MyLibraryHub.tsx`
  - focused My Library tests
  - canonical AW-006 queue
  - notice/state inventory
  - this active brief

## Scope

- Update this active brief and AW-006 queue/design inventory for the selected slice.
- Clear stale `Auth sign-in fallback clarity` `partial` queue metadata only if the re-audit confirms existing contextual sign-in evidence already covers it.
- Improve `/my-library` desktop dashboard grouping and value hierarchy in `MyLibraryHub`.
- Preserve mobile order and ensure mobile/tablet regressions are checked by screenshots.
- Keep all current links, form actions, auth redirects, commerce behavior, local notice behavior, and analytics instrumentation unchanged.
- Add/update focused tests for My Library entrypoints and class/contract expectations.
- Capture screenshot handoff before broad gates.

## Out Of Scope

- New My Library features, child route redesigns, new data loading, new persistence, Supabase migrations, RLS/authz changes, Stripe/checkout/portal behavior, claim/download recovery behavior, analytics taxonomy changes, admin layout changes, Help/Guide runtime changes, sitemap/metadata changes, broad design-system refactors, brand-media system, new assets, new dependencies, PDF/print/export changes, or merge to `main`.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. `/my-library` still redirects anonymous users to `/auth/sign-in?next=%2Fmy-library`.
2. Signed-in `/my-library` still exposes Free Course, My Routines, My Swim Profile, Goals, Swim Sessions, Dryland Sessions, Program builder preview, owned items, unknown-owned recovery, explore items, account portal, sign-out, checkout, privacy, and cookie links as applicable.
3. Desktop layout uses clearer dashboard grouping without card-on-card clutter, text overlap, or hardcoded today-only product assumptions.
4. Mobile order remains clear and no fixed mobile nav obstruction is introduced.
5. Existing data-driven rendering, destination hrefs, form actions, auth, commerce, analytics, recovery, and local state behavior are preserved.
6. Canonical AW-006 queue and design inventory record this selected slice and the stale auth `partial` cleanup.
7. Targeted tests, typecheck, brief lint, route/label/support sweep, and `git diff --check` pass before screenshot handoff.
8. Before/after screenshot artifacts are captured and owner approval is requested before `npm run verify:pre-pr`.

## Validation

- Targeted before screenshot handoff:
  - `npm run lint:briefs:all`
  - `./node_modules/.bin/vitest run tests/unit/continue-course-card.test.tsx tests/unit/my-library-new-content-notice-component.test.tsx tests/unit/portal-button.test.tsx tests/unit/my-library-today.test.ts`
  - `npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium`
  - `npm run typecheck`
  - route/label/support sweep listed above
  - `git diff --check`
- Screenshot:
  - `before/after` `/my-library` desktop, mobile, and tablet if practical in `output/aw-006-my-library-dashboard-desktop-hierarchy-YYYY-MM-DD-HHMMSS/`.
- Broad gates after owner screenshot approval:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Local screenshots use `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000` and capture against `http://127.0.0.1:3000`.

## Checkpoint Log

- `2026-06-02 | in-progress | started from clean main@f87f3dc after PR #953 and repo-managed closeout #954; owner approved and explicitly executed My Library Dashboard Desktop Value Hierarchy after fresh queue/design/code re-audit | next: implement scoped /my-library desktop dashboard hierarchy, update queue/inventory/tests, run targeted validation, and capture screenshot handoff before broad gates`
- `2026-06-02 | screenshot-ready | implemented route-local /my-library desktop dashboard grouping with Start here, Member dashboard, Owned access, and sticky desktop Next options while preserving existing cards, actions, links, forms, auth, commerce, analytics, and mobile sequence; updated focused e2e assertions, AW-006 queue, design inventory, and user-flow map; targeted validation passed: npm run lint:briefs:all, npm run typecheck, targeted Vitest (4 files / 16 tests), route/label/support sweep, and git diff --check; targeted Playwright my-library landing returned 1 anonymous protected-route pass and 2 auth-dependent skips because local dev-login/Supabase returned the known HTML/JSON parse failure; screenshot artifacts captured in output/aw-006-my-library-dashboard-desktop-hierarchy-2026-06-02-215535 with a temporary local preview route and deterministic data/API mocks, then capture-only files were removed; no scoped product-rendering files changed after final capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-02 | pre-pr-pass | owner approved the before/after screenshot handoff; committed aa0dfd3; npm run verify:pre-pr passed full lane on aa0dfd3 after an initial pre-commit PR-body lint attempt exposed the expected no-branch-commit fallback edge; final green run included brief lint, quality gates, admin/env/pr-body lint, eslint with one unrelated warning in output/capture-aw006-dryland-feedback.mjs, typecheck, 224 unit files / 1312 unit tests, build, perf budgets, and Playwright 102 passed / 492 skipped in safe local environment; perf trend recorded PASS with hold recommendation because worst margin was 13.8% against the 15.0% tighten threshold | next: amend lifecycle evidence into the commit, rerun npm run verify:pre-pr on the amended HEAD, then push and open PR`
