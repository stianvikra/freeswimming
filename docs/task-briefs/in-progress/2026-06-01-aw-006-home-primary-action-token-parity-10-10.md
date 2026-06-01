# Task Brief: AW-006 Home Primary Action Token/Action Parity (10/10)

## Metadata

- `id`: `2026-06-01-aw-006-home-primary-action-token-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-01`
- `updated`: `2026-06-01`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-home-primary-action-token-parity`
- `execution_mode`: `owner approved slice; execute through screenshot handoff, then stop before pre-PR/PR/pre-merge gates until owner visual approval`

## Brief Audit Record

- `last_audited`: `2026-06-01`
- `base`: `main@fd6ad01`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded Home primary-action token/action parity pass.
- `reason`: `main` is clean and synced after Public Policy And QR Fallback Token/Action Parity PR `#932` and repo-managed closeout PR `#933`; `npm run post-merge:preflight` passed with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and found Home still using the older route-local `ActionButton` gradients, rounded action cards, and small nav buttons while adjacent public recovery, member, guide, and admin surfaces now use the newer AW-006 `fs-library-card` and `fs-cta-*` token/action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `app/page.tsx`, `components/ActionButton.tsx`, `components/PageTemplate.tsx`, `components/SiteChrome.tsx`, Home routine quick-action contract, home E2E/unit tests, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Align the Home page primary actions, signed-in routine shortcuts, and auth/admin exits with current AW-006 token/card/action hierarchy while preserving Home copy, routing, auth detection, routine data loading, admin role detection, and browse-first behavior.

## Pre-Implementation Owner Explanation

Vi gjør forsiden mer konsistent med resten av de nylig polerte flatene, særlig hovedknappene, rutineknappene og innlogging/admin-lenkene.

Hvorfor det betyr noe: forsiden er førsteinntrykket og hovedveien inn til gratis kurs, programmer, analyse og Min side; den bør ikke føles som eldre UI enn resten av appen.

Utenfor scope: ingen ny tekst, ny informasjonsarkitektur, auth-endringer, adminlogikk, rutinedata, betaling, API-er, analytics, Help/Guide eller bred redesign.

Fremoverkompatibilitet: nye Home-handlinger bør automatisk arve samme knapp-/kortregler via den samme Home-action-kontrakten. Nye prioriterte CTA-typer, nye rutedestinasjoner eller ny førsteinntrykksstrategi krever eksplisitt eierbeslutning, mapping og tester.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                       | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Home keeps the same browse-first page job, action order, route destinations, and signed-in routine placement while matching current AW-006 hierarchy.                                                    | unit/e2e tests + screenshot handoff + changed diff      | `5/5`                   |
| UX flow clarity                               | `target`     | Free course remains the clear primary action; programs, analysis, contact, My Library, Dashboard, and signed-in routine shortcuts keep obvious hierarchy with no mobile text crowding or orphan actions. | unit/e2e tests + screenshot handoff                     | `5/5`                   |
| Visual design quality                         | `target`     | Home action cards and exit links use current `fs-library-card`, token radius/color/shadow, and `fs-cta-*` direction instead of older local gradients/rounded button styling where practical.             | class assertions + before/after screenshots             | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Auth detection, admin role lookup, routine snapshot loading, routine quick-action href order, and anonymous action list remain deterministic and unchanged in meaning.                                   | focused unit tests + e2e + changed-files review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, CRUD flow, operator queue, role workflow, Help Center editing path, Context Notes, QR Registry, or support workflow.                                     | explicit admin-editor scope rationale                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Headings, action links, accessible names, focus rings, contrast, touch targets, and semantic browse-first flow remain reachable and understandable.                                                      | Testing Library roles + Playwright checks + screenshots | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Home keeps its current server/client boundary and adds no dependency, image asset, route fetch, polling loop, or material JS payload.                                                                    | package/diff review + typecheck + later pre-PR gate     | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Home continues to read auth/admin/routine data through existing server-side loaders only; no new browser storage, server-canonical entity, sync mutation, or conflict behavior is introduced.            | data-boundary review + unchanged loader tests           | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing `force-dynamic` Home behavior remains unchanged; no fetch/cache/revalidation/invalidation path is introduced or removed.                                                                        | route diff review                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Anonymous Home stays browse-first; signed-in routine actions stay resilient to empty routine data; admin CTA appears only from existing role resolution.                                                 | unit/e2e tests + unchanged loader review                | `5/5`                   |
| Security and authz                            | `target`     | Admin CTA visibility continues to depend on existing admin role resolution and no protected-route/auth bypass, token, cookie, or redirect behavior changes.                                              | changed-files review + unit tests                       | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: Home does not expose new user data, raw email, token, payment detail, provider diagnostic, analytics payload, consent behavior, or privacy copy.                                        | data/copy review                                        | `4/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record Home as the selected slice without stale active references.                                                                       | docs diff + brief lint                                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin role action, workflow label, mutation path, recovery behavior, operator edit path, Help/Guide assertion, or support procedure.                                         | explicit admin-workflow scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: Home heading/content semantics are preserved; this slice changes no metadata, sitemap, robots, canonical URL, structured data, or public indexability.                                  | diff review + existing route coverage                   | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: Home keeps stable public semantic headings and links, but this slice adds no structured data or AI-facing content model.                                                                | semantic review                                         | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, attribution, KPI definition, logging, or consent behavior.                                                        | explicit analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Home links to commercial/product surfaces, but this slice changes no pricing, checkout, entitlement, catalog, billing, refund, payout, revenue report, or finance data.                 | commerce behavior unchanged review                      | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support diagnostic, recovery workflow, runbook procedure, support escalation, or operator support process.                                                     | explicit support-ops scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, revenue recognition data, or reporting operation.                            | explicit finance scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing Home labels and subtitles remain layout-safe on mobile/desktop without fixed-width assumptions that would block later localization.                                                             | screenshot text-fit review                              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Home route, `ActionButton`, `PressLink`, `SiteChrome`, `PageTemplate`, and global `fs-*` tokens; add no dependency, broad primitive, API, package, config, or workflow.                   | changed-files/dependency diff                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused Home tests for token/action classes and preserved anonymous/signed-in/admin behavior; run targeted tests, lint, typecheck, route sweep, diff check, and screenshot handoff.           | targeted tests + lint/typecheck + screenshot artifacts  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: presentation class changes add no backend polling, storage, scheduled job, image pipeline, third-party call, or traffic-dependent cost.                                                 | implementation review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR is reversible by normal git revert and contains no migration, env/config, package, workflow, deployment setting, or data repair requirement.                                                      | git diff review + validation gates                      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `app/page.tsx` as the current async server route with `dynamic = "force-dynamic"`.
  - Keep `ActionButton` as the route-owned Home action primitive unless the implementation proves a narrower local helper is safer.
  - Preserve `SiteChrome`, `PageTemplate`, auth/admin/routine loader boundaries, and current Home route destinations.
  - Do not change metadata, route cache mode, server actions, APIs, auth redirects, or private-gate behavior.
- TypeScript/domain contracts:
  - Preserve `TodayRoutineQuickAction`, `buildTodayRoutineQuickActions`, routine href generation, admin role resolution call shape, and anonymous action order.
  - No parser, validation, storage, or error model change is planned.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, query, storage, index, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, SDK, retry policy, or observability integration change.
- UI system:
  - Reference surfaces: `/claim`, `/checkout/success`, public policy/QR fallback cards, My Library token cards/actions, and the current `fs-library-card`/`fs-cta-*` token direction.
  - Use `fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, token radius, token colors, and `fs-cta-primary`/`fs-cta-secondary` where practical.
  - Screenshot handoff comparison type: `before/after` for Home desktop and mobile; signed-in Home may be captured as `after/reference` only if local dev auth is not available during screenshot capture.
- Testing:
  - Update `tests/unit/home-page-routines-entrypoint.test.tsx`.
  - Reuse/update `tests/e2e/home-routines-entrypoint.spec.ts` where practical.
  - Keep screenshot QA before broad PR gates.

## Data Placement And Sync Contract

Existing state boundaries remain unchanged.

- Server-canonical data:
  - None added by this slice. Auth identity, admin role, dryland micro-plan data, and habit snapshot data remain owned by existing server loaders and backend contracts.
- Local/UI data:
  - None added by this slice. Home renders route links from existing server-derived data and static public action definitions.
- Sync policy:
  - No sync trigger, mutation, conflict handling, retry/backoff, or invalidation behavior changes.
- Retention and sensitivity:
  - No new personal data, email, secret, token, payment detail, provider diagnostic, or support diagnostic is stored or displayed.
- Cache/invalidation:
  - Existing `dynamic = "force-dynamic"` Home behavior remains unchanged.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, rename rule, or migration behavior. Existing route hrefs and routine action IDs are consumed as today.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - Home primary actions, signed-in routine quick actions, auth/My Library link, and admin Dashboard link.
- Source of truth:
  - Public Home actions remain defined by the current Home route rendering.
  - Signed-in routine actions continue to derive from `buildTodayRoutineQuickActions`.
  - Admin CTA visibility continues to derive from `resolveAdminRoleFromSupabase`.
- Additive behavior:
  - Existing future routine quick-action variants should inherit the same compact Home shortcut styling automatically through the shared Home quick-action renderer.
  - Adding another Home action that uses `ActionButton` should inherit the same token/action shell automatically.
- Explicit mapping requirements:
  - A new primary CTA, new Home action type, new signed-in shortcut group, new admin/operator shortcut, or changed first-viewport strategy requires explicit owner decision, copy/mapping review, tests, and screenshots.
- Unknown or deprecated values:
  - Empty routine data continues to render the existing setup-oriented routine actions for signed-in users.
  - Anonymous users continue to see no routine quick actions.
- Test/evidence:
  - Focused unit and E2E tests prove anonymous action order, signed-in routine placement, href preservation, admin role behavior, and token/action class adoption.

## Help / Guide Impact

N/A with rationale: this slice preserves visible workflow labels, route destinations, auth/admin/routine behavior, support procedures, Help/Guide assertions, and operator-facing instructions. Help/Guide or runbook updates are required only if implementation changes labels, workflow meaning, recovery behavior, support procedure, auth, payments, or private-gate behavior.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice touches the public Home route and signed-in Home shortcuts.

- Identifiers to search:
  - `Adult learner?`
  - `Free course`
  - `Swim programs`
  - `Video analysis`
  - `Contact`
  - `Open My Library`
  - `Log in to My Library`
  - `Open Dashboard`
  - `Routine quick actions`
  - `home-primary-actions`
  - `home-routine-action`
  - `ActionButton`
- Surfaces to check:
  - `app/page.tsx`
  - `components/ActionButton.tsx`
  - `components/PageTemplate.tsx`
  - `components/SiteChrome.tsx`
  - `lib/my-library/today.ts`
  - `tests/unit/home-page-routines-entrypoint.test.tsx`
  - `tests/e2e/home-routines-entrypoint.spec.ts`
  - `tests/e2e/a11y-home.spec.ts`
  - `tests/e2e/mobile-nav.spec.ts`
  - `tests/e2e/aw-006-visual-baseline-screenshots.spec.ts`
  - `docs/design/brand-logo-usage.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - Home presentation updates,
  - focused unit/e2e assertions,
  - active brief checkpoint updates,
  - canonical AW-006 queue and design inventory update,
  - screenshot artifacts,
  - no Help/Guide, runbook, auth, admin role, routine data, API, analytics, Supabase, Stripe, entitlement, package, config, or workflow change.
- Sweep execution evidence (`2026-06-01`):
  - Identifiers searched: `Adult learner?`, `Free course`, `Swim programs`, `Video analysis`, `Contact`, `Open My Library`, `Log in to My Library`, `Open Dashboard`, `Routine quick actions`, `home-primary-actions`, `home-routine-action`, and `ActionButton`.
  - Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/design/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, and non-done task-brief references.
  - Fallout handled: implementation/test/docs updates are limited to Home presentation, Home action tests, this active brief, the AW-006 queue, and the design inventory. Existing contact, commerce, admin-content support toggles, mobile nav, visual-baseline, and private-access tests remain valid because labels, destinations, auth/admin/routine data, APIs, analytics, Help/Guide, and support procedures are unchanged.

## Scope

- `ActionButton` visual token/action shell used by Home primary actions.
- `app/page.tsx` signed-in routine shortcut styling and auth/admin exit link styling.
- Focused assertions for preserved anonymous Home action order, signed-in routine action placement, admin CTA behavior, and token/action class adoption.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts before broad PR gates.

## Out Of Scope

- Home copy changes, Home IA changes, action destinations, action order, route metadata, `dynamic` cache behavior, auth provider behavior, admin role logic, dryland/habit loaders, routine action builder, analytics taxonomy, APIs, Supabase, Stripe, entitlement behavior, commerce logic, Help/Guide, support procedures, broad public redesign, broad design-system primitive, new dependencies, package/config/workflow changes, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. Anonymous Home still renders the same primary action href order: `/course`, `/programs`, `/analysis`, `/contact`.
2. Signed-in Home still renders routine quick actions directly below `Free course` with unchanged href generation.
3. Admin Dashboard CTA still appears only when the existing admin role resolver returns an admin role.
4. Home action cards and exit links use current AW-006 token/card/action classes instead of older local gradient/rounded button styling where practical.
5. Mobile and desktop screenshots show no text overlap, incoherent nested-card feel, orphan mobile action rows, or broken card/action spacing.
6. No route, auth, admin role, routine data, API, analytics, Help/Guide, support, Supabase, Stripe, entitlement, package, config, or workflow behavior changes are introduced.
7. Focused tests, brief lint, quality gates, typecheck, route/label/support sweep, `git diff --check`, and screenshot handoff are completed before broad gates.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/home-page-routines-entrypoint.test.tsx` - PASS (`1` file, `3` tests).
- `env SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/home-routines-entrypoint.spec.ts --project=desktop-chromium` - PASS for anonymous Home (`1` passed); signed-in variant skipped because local dev-login/Supabase test account returned HTML instead of JSON before the signed-in page assertions could run.
- `npm run lint:briefs:all` - PASS (`404` brief files).
- `npm run lint:quality-gates` - PASS.
- `npm run typecheck` - PASS.
- `npx eslint app/page.tsx components/ActionButton.tsx tests/unit/home-page-routines-entrypoint.test.tsx tests/e2e/home-routines-entrypoint.spec.ts` - PASS.
- targeted route/label/support sweep with identifiers listed above - completed; fallout limited to Home presentation/tests, this brief, AW-006 queue, and design inventory.
- `git diff --check` - PASS.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `before/after` screenshots against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`.

Broad gates after screenshot approval:

- `npm run verify:pre-pr` - PASS after owner screenshot approval; full lane selected because Home runtime/test files changed (`102` E2E passed, `492` skipped due project/dev-login gating).
- required PR CI checks
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Screenshot Handoff

Required because this slice changes visible Home UI.

- artifact folder: `output/playwright/aw-006-home-primary-action-token-parity-<YYYY-MM-DD-HHMMSS>`
- comparison type: `before/after`
- representative filenames:
  - `before-home-mobile-390.png`
  - `after-home-mobile-390.png`
  - `before-home-desktop-1440.png`
  - `after-home-desktop-1440.png`
- Optional signed-in/admin screenshots may use `after/reference` if dev auth is available and helpful.
- Captured (`2026-06-01 10:48` local time):
  - artifact folder: `output/playwright/aw-006-home-primary-action-token-parity-2026-06-01-104821`
  - comparison type: `before/after`
  - captured files: `before-home-mobile-390.png`, `after-home-mobile-390.png`, `before-home-desktop-1440.png`, `after-home-desktop-1440.png`, and `manifest.json`
  - visual review: mobile `390x844` and desktop `1440x1100` show no text overlap, clipped action labels, incoherent nested-card feel, or broken spacing in the changed Home action stack.
  - known capture caveat: the `before` temp worktree used Next webpack mode because Turbopack rejects a symlinked `node_modules` outside the temp worktree; the captured route state is still `fd6ad01`.

## Checkpoint Log

- `2026-06-01 | in-progress | started from clean main@fd6ad01 after PR #932 and repo-managed closeout #933; post-merge preflight passed with no closeout remaining; owner approved AW-006 Home Primary Action Token/Action Parity after fresh queue/design/code re-audit | next: implement scoped Home token/action parity, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-06-01 | targeted QA | implemented scoped Home token/action parity; Home unit test, TypeScript, and focused ESLint are green; first quality-gate run correctly required concrete sweep evidence, which was added after the targeted route/label/support sweep | next: rerun quality gates, run targeted E2E if local browser server is available, then capture screenshot handoff`
- `2026-06-01 | targeted QA complete | Home unit test, focused ESLint, typecheck, quality gates, all-brief lint, diff check, and anonymous Home E2E are green; signed-in Home E2E remains skipped by local dev-login/Supabase environment response before signed-in assertions | next: capture before/after Home screenshots and stop for owner visual approval`
- `2026-06-01 | screenshot handoff | captured before/after Home mobile and desktop artifacts in output/playwright/aw-006-home-primary-action-token-parity-2026-06-01-104821; no product-rendering files changed after capture | next: stop for owner visual approval before verify:pre-pr, PR, CI, or pre-merge gates`
- `2026-06-01 | pre-pr gate | owner approved screenshots and npm run verify:pre-pr passed full lane; no product-rendering files changed after screenshot capture | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge-ready handoff`

## Completion Record

TBD after merge.
