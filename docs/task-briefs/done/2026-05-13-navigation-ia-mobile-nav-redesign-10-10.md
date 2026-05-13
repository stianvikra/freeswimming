# Task Brief: Navigation IA And Contextual Mobile Navigation Redesign (10/10)

## Metadata

- `id`: `2026-05-13-navigation-ia-mobile-nav-redesign-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-13`
- `updated`: `2026-05-13`

## Goal

Audit and redesign app navigation so global and contextual controls are predictable across Home, My Library, Habits, Micro Sessions, Course, and Admin, with direct Habits ↔ Micro Sessions movement and no ambiguous Home/Back/Course actions.

## Product Decision

Use this brief for Navigation IA/UI only. Habit cadence, habit priority sorting, monthly cadence, and habit timing/slip prioritization are deferred to a separate Habits Cadence & Priority UX brief.

Recommended navigation model before implementation:

- Keep one stable global escape hatch through topbar/hamburger/main drawer.
- Make the floating mobile nav route-aware and contextual, with at most three high-value actions for the current route family.
- Keep `Home` as a stable global destination. Use `Back` only as a local parent/previous-context action with deterministic fallback, not as a dynamic relabel of `Home` based on visit history.
- Do not depend on database state for nav labels. Navigation state must be derived from route context, explicit URL state, or local transient UI state only.
- Re-evaluate the current mobile hamburger suppression. The preferred outcome is that global navigation stays discoverable on mobile even when contextual floating nav is present.
- Keep Course navigation as a special learning-flow surface only where it is actively useful; do not show `Course` as a generic floating action on unrelated route families unless the audit justifies it.
- Add a direct sibling transition between Habits and Micro Sessions after entering from Home quick actions, without forcing the user through Home or My Library.

If the implementation audit proves a better model, update this brief before runtime changes and record the evidence in the checkpoint log.

Implementation audit decision on `2026-05-13`:

- Keep Home as a stable global destination through the topbar logo, drawer, and public route floating nav.
- Keep the mobile hamburger visible even when contextual floating nav or Course bottom nav is present.
- Remove `Menu` from the default floating nav because hamburger now owns global drawer access.
- Keep Course's custom bottom nav as the learning-flow surface, with `Prev` disabled on the first lesson instead of a duplicate global `Menu`; make the Course topbar hamburger open the main menu rather than the lessons drawer.
- Rename the Course drawer view switcher from `Menu` to `Main` so the drawer has explicit `Main / Close / Lessons` view controls and `Menu` no longer competes with the global hamburger concept.
- Keep the public-route floating nav as `Home / Course / Programs` for this slice. The owner identified that `Programs` on `/contact` may be less context-relevant than a future utility-route model, but approved deferring that refinement because manual menu review and release-gate validation are still pending.
- Use route-aware floating nav:
  - public routes: `Home / Course / Programs`;
  - My Library routine routes: `Library / Micro / Habits`;
  - other My Library routes: `Library / Routines / <current section>`;
  - Admin: `Home / Library / Dashboard`;
  - Auth: `Home / Course / Login`.
- Do not add database state, persisted nav preferences, or browser-history-dependent labels.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                      | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Complete a route-by-route inventory of global nav, floating nav, drawers, course nav, local back links, tabs, and mode switchers; define one owner for each navigation job.             | brief/PR route matrix + screenshot handoff                      | `5/5`                   |
| UX flow clarity                               | `target`     | Users can move Home → Habits, Home → Micro Sessions, Habits ↔ Micro Sessions, Course lesson flow, My Library, and Admin without dead ends or duplicate ambiguous controls.              | Playwright route flows + manual QA + screenshot handoff         | `5/5`                   |
| Visual design quality                         | `target`     | Floating nav, hamburger/topbar, drawer, course nav, and contextual links use consistent spacing, labels, active states, and mobile/desktop behavior with no text overlap.               | before/after screenshots on mobile/tablet/desktop               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Navigation derivation is deterministic from route/context and does not mutate domain data, require database reads, or depend on fragile browser history for primary navigation.         | unit tests for nav item derivation + code review                | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Admin remains reachable and does not lose existing workspace navigation, but this brief does not redesign admin editor CRUD workflows.                                 | admin route smoke/manual QA                                     | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Menu buttons, drawers, active nav states, back links, tabs, and contextual mobile actions have correct labels, focus behavior, keyboard flow, and dialog semantics.                     | Testing Library/Playwright assertions + drawer focus-trap tests | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, data fetch, or heavy client runtime is introduced; core routes `/`, `/course`, and `/my-library` stay within existing CWV/payload budgets.                           | dependency diff + build/perf budget checks                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Nav context is local-only or URL-derived; server-canonical domain state remains unchanged; no Supabase schema or persisted preference is added without explicit brief update.           | data contract review + no-migration diff                        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route navigation changes do not alter authenticated route cache policy, server loaders, or revalidation behavior unless explicitly documented.                         | route diff review                                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Deep links, refresh, direct URL entry, anonymous/private-gate flows, and first render all show deterministic nav without requiring prior history or successful optional client effects. | Playwright deep-link/refresh/private-gate checks                | `5/5`                   |
| Security and authz                            | `target`     | Navigation changes do not expose protected content/actions to anonymous users; protected route affordances still fail closed and do not bypass existing auth boundaries.                | protected route/private gate tests + diff review                | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, analytics payload, storage category, or consent surface is introduced by navigation UI changes.                                                  | diff review                                                     | `4/5`                   |
| Content governance                            | `target`     | Route labels, drawer labels, floating actions, Help/Guide references, tests, and user-flow docs use one consistent navigation vocabulary.                                               | route/label/support-surface sweep + docs/test updates           | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin remains reachable through global navigation; no admin publishing/editing workflow or operator mutation path is changed.                                          | admin reachability smoke + explicit no-admin-workflow diff      | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route links, metadata expectations, sitemap visibility, and private-route no-index behavior are not regressed by label/link changes.                            | route metadata/sitemap diff review where touched                | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public navigation labels remain semantically stable for crawlable pages; no structured data or public content model change is expected.                                | public route/link review                                        | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics taxonomy is required unless audit finds existing nav telemetry; if touched, payloads must be safe and route labels stable.                            | analytics diff review or explicit no-analytics evidence         | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Programs/plans/payment-relevant routes remain discoverable where they already are; no checkout, entitlement, pricing, refund, or subscription behavior changes.        | link reachability smoke + commerce scope review                 | `4/5`                   |
| Incident response and support operations      | `target`     | Any renamed/repositioned workflow label that support users rely on is updated in docs/runbooks/Help references or explicitly recorded as no support impact.                             | route/label/support sweep + Help/Guide/runbook impact note      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief changes navigation UI only and does not touch invoices, payouts, refunds, subscriptions, revenue recognition, reporting exports, or reconciliation data.         | explicit finance scope rationale                                | `N/A`                   |
| i18n operational readiness                    | `target`     | New/changed labels are short, literal, consistent, and localizable; no route/label pattern blocks future locale routing or translation extraction.                                      | copy review + route label matrix                                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, `MenuDrawer`, `MobileSegmentedNav`, `mainMenuItems`, `PageTemplate`, `BackButton`, and existing route patterns before adding new abstractions.                      | code review + no-dependency diff                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update unit and Playwright coverage for route-aware nav, drawer behavior, deep links, Course contextual nav, and Habits ↔ Micro Sessions movement; screenshot handoff before PR.    | targeted tests + screenshot handoff + later verify gates        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new polling, background job, server query, large bundle, or persisted nav preference is introduced.                                                                 | runtime/dependency diff review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a normal code/docs/test revert; no migration, config flag, data backfill, or release sequencing is required unless explicitly added to this brief first.                    | no-migration/config review + verify gates                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - audit and reuse `components/SiteChrome.tsx`, `components/MenuDrawer.tsx`, `components/ui/MobileSegmentedNav.tsx`, `components/navigation/mainMenuItems.ts`, `components/PageTemplate.tsx`, and `components/BackButton.tsx`;
  - preserve App Router route boundaries and avoid route-local nav forks unless a route has a proven workflow-specific need;
  - keep nav item derivation deterministic from pathname/search params/explicit props;
  - do not add server actions or API routes for navigation context.
- TypeScript/domain contracts:
  - define typed nav item/context contracts if route-aware behavior grows beyond simple constants;
  - keep active-state and destination selection testable without DOM-only assertions;
  - fail closed to stable global links when an unknown route context is encountered.
- Supabase/data layer:
  - no migration, RLS, generated type, or query change is expected;
  - if implementation discovers a need for persisted preferences, stop and update this brief before proceeding.
- External services/tools:
  - N/A; no new external service, SDK, analytics vendor, or secret is in scope.
- UI system:
  - floating mobile nav and drawer must reuse existing Tailwind tokens and icon/button patterns;
  - use lucide icons when adding icon-only controls;
  - keep Course-specific controls visually distinct from global app navigation;
  - screenshot handoff comparison type is before/after for changed navigation surfaces and after/reference where comparing Course-specific nav to app-wide nav.
- Testing:
  - unit/component tests cover nav item derivation and labels where practical;
  - Playwright covers mobile/desktop route flows, drawer focus behavior, deep links/refresh, protected/private-gate behavior, Course first/middle/last lesson states, and Habits ↔ Micro Sessions movement.

Reference surface evidence:

- Reference surface: `components/SiteChrome.tsx` remains the global shell owner; `components/MenuDrawer.tsx` remains the shared global/course drawer; `components/ui/MobileSegmentedNav.tsx` remains the shared floating/bottom segmented nav primitive.
- Shared component reuse: the route-aware default floating nav reuses `MobileSegmentedNav`, existing `mainMenuItems`, existing auth/dashboard visibility checks, and existing Course custom bottom-bar injection rather than adding a parallel navigation system.
- Justified exception: Course keeps a custom bottom bar because it is an existing learning-flow reference surface with first/last lesson behavior, and this slice only changes the conflicting `Menu` label/owner contract.

## Data Placement And Sync Contract

- Server-canonical data:
  - none added or changed; user progress, routines, habits, course content, entitlements, and admin data remain owned by existing server/Supabase contracts.
- Local data:
  - drawer open/closed, focus return target, and transient UI affordance state may remain browser-local only.
  - preferred nav labels or route family state must not be persisted unless this brief is updated.
- URL-derived state:
  - route path and explicit search params may determine contextual nav slots when the state needs to survive refresh or direct links.
- Sync policy:
  - no cross-device sync or conflict resolution is introduced.
- Retention and sensitivity:
  - no new retained data; no sensitive data may be added to nav labels, URLs, logs, or analytics payloads.
- Cache/invalidation:
  - no route cache or revalidation behavior should change; authenticated/private routes keep their existing dynamic behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - no persisted entity identity changes are in scope.
- Human-readable identifiers:
  - route labels such as `Home`, `Back`, `Menu`, `Course`, `Lessons`, `Habits`, and `Micro Sessions` are display copy only unless an implementation explicitly changes routes.
- Mutability rules:
  - labels may be renamed only after the route/label/support sweep confirms docs, tests, Help/Guide assertions, and runbooks remain consistent.
- Rename vs repurpose policy:
  - do not repurpose an existing nav label for a different destination without updating tests/docs and screenshot handoff evidence.
- Compatibility contract:
  - route paths should remain stable; any route path or alias change requires an explicit brief update with redirect/compatibility acceptance criteria.
- Observability and repair:
  - broken or stale navigation should be detected through Playwright coverage, route/link sweeps, and support-surface review rather than runtime database repair.

## Scope

- Full navigation inventory across:
  - topbar/header and hamburger behavior;
  - mobile floating nav/default bottom nav;
  - main drawer and course drawer/menu;
  - Course bottom/contextual nav;
  - page-level back/parent links;
  - My Library tabs, Habits/Micro Sessions transitions, and routine/dryland/workout entry points;
  - Admin workspace reachability and any shared shell behavior;
  - anonymous, private-gate, authenticated, and deep-link/refresh states.
- Likely files and surfaces:
  - `components/SiteChrome.tsx`
  - `components/MenuDrawer.tsx`
  - `components/ui/MobileSegmentedNav.tsx`
  - `components/navigation/mainMenuItems.ts`
  - `components/PageTemplate.tsx`
  - `components/BackButton.tsx`
  - `app/page.tsx`
  - `app/course/page.tsx`
  - `app/my-library/**`
  - `components/my-library/TodayTabsPanel.tsx`
  - `components/my-library/dryland/**`
  - `components/admin/AdminWorkspace.tsx`
  - relevant tests and docs/runbooks/user-flow references.
- Implement the smallest coherent route-aware nav model that satisfies the audit, including direct Habits ↔ Micro Sessions movement.
- Update docs/tests/Help or runbooks when labels, routes, workflow actions, or support-visible instructions change.

## Out Of Scope

- Habit cadence/frequency UX, monthly habits, habit priority sorting, timed habit placement, quit/slip prioritization, or habit data-model changes.
- New database tables, migrations, generated DB types, RLS changes, or persisted navigation preferences.
- Checkout, pricing, subscription, entitlement, refund, or reporting changes.
- Broad visual redesign outside navigation chrome, drawers, contextual nav, and route-level nav links.
- Admin CRUD/publishing workflow redesign.
- New analytics vendor or broad event taxonomy unless an existing nav analytics contract is already present and must be preserved.
- Merge or release without explicit owner approval.

## Acceptance Criteria

1. A route-by-route navigation inventory is recorded in the active brief or PR summary, covering primary and secondary nav surfaces.
2. Mobile users always have an understandable global navigation path, either through visible hamburger/topbar access or a documented equivalent with evidence.
3. Floating mobile nav has a documented global/contextual slot model and does not show irrelevant actions such as `Course` on non-course routes without justification.
4. `Home` remains a stable global destination; `Back` is used only for deterministic parent/previous-context behavior with fallback.
5. No changed route has duplicate controls with the same effective destination and conflicting labels unless the different roles are explicit and tested.
6. Habits and Micro Sessions support direct movement both ways after entry from Home quick actions.
7. Course first/middle/last lesson navigation still behaves correctly and remains understandable as a learning-flow-specific surface.
8. Direct URL entry, refresh, and deep links render correct nav state without relying on prior browser history.
9. Authenticated/private/protected flows remain fail-closed and do not reveal protected destination content to anonymous users.
10. Active/current state is accurate across floating nav, drawer, tabs, and Course nav.
11. Keyboard navigation, focus trap/return, dialog semantics, labels, and screen-reader text are preserved or improved.
12. Public route links, sitemap/metadata expectations, and private-route visibility controls are not regressed.
13. Route/label/support-surface fallout is swept and either updated in the same PR or recorded as an explicit deferral with rationale.
14. Targeted tests cover the changed nav model.
15. Screenshot handoff is delivered and approved before `npm run verify:pre-pr`.

## Validation

Brief-only planning validation:

- `npm run lint:briefs`

Implementation validation before PR update:

- Targeted unit/component tests for nav item derivation and labels where added.
- Targeted Playwright:
  - `tests/e2e/mobile-nav.spec.ts`
  - `tests/e2e/mobile-nav-state.spec.ts`
  - `tests/e2e/course-nav-contextual.spec.ts`
  - `tests/e2e/drawer-focus-trap.spec.ts`
  - `tests/e2e/home-routines-entrypoint.spec.ts`
  - relevant Habits/Micro Sessions route tests.
- Route/label/support-surface sweep before broad gates.
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation.

UI screenshot gate:

- Because this is navigation UI work, stop after targeted implementation QA and before `npm run verify:pre-pr`.
- Provide screenshot handoff with `Screenshot artifacts`, `Captured: YYYY-MM-DD HH:MM`, 2-4 representative screenshots, and explicit before/after or after/reference naming.
- Refresh screenshots if product-rendering files, styles, assets, or export HTML change after capture.
- High-cost UI/export debug path: used `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for local artifact capture, stored the actual consumed artifact folders under `output/navigation-ia-mobile-nav-2026-05-13-194422` and `output/navigation-ia-course-polish-2026-05-13-200125`, inspected full-resolution PNG artifacts, hid the local Next.js dev overlay before final capture, and refreshed screenshots after product-rendering files changed.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/course`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/routines`
  - `http://127.0.0.1:3000/my-library/habits`
  - `http://127.0.0.1:3000/my-library/dryland`
  - `http://127.0.0.1:3000/my-library/workouts`
  - admin route if available in the current environment.
- Viewports:
  - phone mobile width
  - tablet width
  - desktop width
- Browsers:
  - Chromium for automated screenshot handoff;
  - Safari/WebKit spot check where practical for mobile-style nav and drawer focus behavior.
- Screenshot handoff:
  - before/after for changed global/mobile nav surfaces;
  - after/reference for Course nav compared with app-wide contextual nav when useful.
- Vercel preview:
  - test after PR checks if implementation proceeds.

## Help / Guide Impact

Required for implementation if labels, navigation actions, workflow instructions, Help/Guide assertions, or support-visible route guidance change. If the audit confirms no Help/Guide/runbook impact, record the explicit N/A rationale in the PR and active brief checkpoint log.

## Route / Label / Support Surface Sweep

Required before broad gates because this work may rename, reposition, or re-scope user-visible navigation actions.

Search targets include:

- `mobile-fixed-nav`
- `mobile-nav-home`
- `mobile-nav-course`
- `header-menu-toggle`
- `Navigation menu`
- `Main menu`
- `Course menu`
- `Lessons`
- `Home`
- `Course`
- `Back`
- `Back to My Library`
- `Back to My Swim Sessions`
- `Micro Sessions`
- `Habits`
- `/my-library/routines`
- `/my-library/dryland`
- `/my-library/habits`
- `/course`
- `drawer-focus-trap`
- `mobile nav`

Surfaces to sweep:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- Help/Guide assertions if present.

Sweep evidence on `2026-05-13`:

- Ran targeted `rg` sweeps for changed nav test ids, labels, drawer names, bottom nav references, Course/menu copy, and Habits/Micro Sessions labels across `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, and task briefs.
- Identifiers searched: `mobile-nav-menu`, `mobile-nav-course`, `mobile-nav-home`, `mobile-nav-library`, `mobile-nav-micro`, `mobile-nav-habits`, `mobile-nav-programs`, `mobile-fixed-nav`, `header-menu-toggle`, `Toggle main menu`, `Open main menu`, `Course menu`, `Main menu`, `Lessons`, `Menu`, `Home / Course / Programs`, `Library / Micro / Habits`, `/my-library/habits`, `/my-library/dryland`, and `/course`.
- Surfaces checked/directories checked: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, and relevant done briefs surfaced by the targeted search.
- Updated product docs, support runbook, and interaction regression checklist where old `Menu`-in-floating-nav assumptions no longer matched the implemented model.
- Swept the remaining Course `Menu` label usage after polish and updated drawer switcher/tests/docs to use `Main` where it means the main menu view.
- Fallout handled: route paths, sitemap, metadata, Help/Guide assertions, admin mutation workflows, commerce workflows, Supabase schema, and analytics contracts did not require runtime changes; `/contact` showing `Programs` in the public floating nav is intentionally deferred as a future refinement and recorded in the Product Decision.
- No route path, sitemap, metadata, Help/Guide assertion, admin mutation workflow, commerce workflow, Supabase schema, or analytics contract required a runtime change in this slice.

## Completion Record

- `completed`: `2026-05-13`
- `implementation_pr`: `#698`
- `merge_commit`: `b2c4179`
- `10/10 claim`: yes
- Summary: implemented the route-aware mobile navigation model, moved global menu ownership to the always-visible header hamburger, clarified Course contextual navigation, added direct Habits ↔ Micro Sessions movement, updated route/label/support docs, and validated the work with screenshot handoff, local gates, and green CI.
- Screenshot artifacts: `output/navigation-ia-refresh-2026-05-13-205825`
- Validation evidence: `npm run verify:pre-pr` PASS on `0ef7a18`, `npm run verify:pre-merge` PASS on `0ef7a18`, GitHub required checks PASS for PR `#698`, and PR merged as `b2c4179`.
- Remaining gaps: none blocking for this scoped release. Deferred work is tracked separately by `docs/task-briefs/planned/2026-05-13-habits-cadence-priority-ux-10-10.md` plus possible future utility-route nav refinement for public routes such as `/contact`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                        |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Route-aware global/contextual nav model recorded in this brief and implemented in PR `#698`; public utility route deferral explicitly accepted and documented.                  |
| UX flow clarity                               | `5/5`          | Direct Habits ↔ Micro Sessions movement, clearer Course first/middle/last nav, and route-aware My Library/public/Admin/Auth floating nav covered by Playwright and screenshots. |
| Visual design quality                         | `5/5`          | Screenshot handoff captured at `output/navigation-ia-refresh-2026-05-13-205825`; no rendering files changed after approved capture.                                             |
| Business logic correctness and data integrity | `5/5`          | Navigation state derives from route/search context and explicit component props; no database, migration, or persisted preference change.                                        |
| Accessibility (a11y)                          | `5/5`          | Existing shared nav/drawer primitives retained; labels and drawer semantics updated from ambiguous `Menu` to `Main`/`Lessons`; targeted Playwright coverage passed.             |
| Performance (CWV + payloads)                  | `5/5`          | No dependency or data-fetch additions; `npm run verify:pre-pr` and CI verify passed including build/perf budget checks.                                                         |
| Data placement and sync boundaries            | `5/5`          | Local-only drawer state and URL/route-derived nav context preserved; no Supabase or sync behavior touched.                                                                      |
| Reliability and failure handling              | `5/5`          | Suspense-wrapped search-param nav fix restored Next prerender/build reliability; deep/direct route nav behavior covered by e2e tests and CI.                                    |
| Security and authz                            | `5/5`          | No protected content or authz boundary changes; private/site-lock smoke and CI checks passed.                                                                                   |
| Content governance                            | `5/5`          | Route/label/support sweep completed; docs, tests, support runbook, and interaction checklist updated for the new labels and nav ownership.                                      |
| Incident response and support operations      | `5/5`          | Support-visible navigation wording was swept and updated where needed; no Help/Guide contract change required beyond recorded runbook/doc updates.                              |
| i18n operational readiness                    | `5/5`          | Changed labels are short literal UI copy (`Main`, `Lessons`, `Habits`, `Micro`) and avoid history/database-dependent wording.                                                   |
| Stack-fit and dependency discipline           | `5/5`          | Reused `SiteChrome`, `MenuDrawer`, `MobileSegmentedNav`, `mainMenuItems`, and Course bottom-nav surface; no new dependency.                                                     |
| Testing and QA automation                     | `5/5`          | Targeted Playwright, lint, typecheck, unit/build/e2e via `verify:pre-pr`, `verify:pre-merge`, and GitHub CI all passed.                                                         |
| DevOps and rollback readiness                 | `5/5`          | Rollback is normal code/docs/test revert of `b2c4179`; no migration, config flag, data backfill, or release sequencing required.                                                |

## Checkpoint Log

- `2026-05-13 | planned | created from owner-requested navigation audit after Home quick actions exposed ambiguity around floating nav, Home/Back, Course label scope, hamburger visibility, and Habits ↔ Micro Sessions movement | next: owner confirms execution scope or says to implement this brief end-to-end`
- `2026-05-13 | in-progress | owner said "implementer end to end"; started branch feature/navigation-ia-mobile-nav-redesign from clean synced main at 7e27d2d, moved brief to in-progress, and set implementation audit decision: always-visible mobile hamburger, route-aware floating nav, Course topbar hamburger opens main menu, and no DB/browser-history dependency | next: finish tests/docs and capture screenshot handoff before verify:pre-pr`
- `2026-05-13 | in-progress | implemented route-aware default mobile nav, direct Habits/Micro Sessions floating actions, always-visible mobile hamburger, Course header main-menu behavior, tests, and docs/support sweep updates | validation: npm run typecheck passed; npm run lint:briefs:all passed; npm run lint passed; ./node_modules/.bin/vitest run tests/unit/today-tabs-panel.test.tsx tests/unit/my-library-today.test.ts passed; npx playwright test tests/e2e/mobile-nav.spec.ts tests/e2e/mobile-nav-state.spec.ts tests/e2e/course-nav-contextual.spec.ts tests/e2e/my-library-habits.spec.ts --project=mobile-chromium passed with 5 passed and 2 expected environment skips for local dev-login/auth; git diff --check passed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-13 | screenshot handoff | captured after/reference mobile screenshots at output/navigation-ia-mobile-nav-2026-05-13-194422 after hiding local Next.js dev overlay; authenticated Habits/Micro screenshots were not captured because local dev-login did not authenticate in this environment, but the route-aware links and Habits ↔ Micro transition are covered by code/test contract | next: wait for owner visual approval or correction request`
- `2026-05-13 | Course nav polish | owner asked whether the work was truly 10/10; audit found the remaining UX ambiguity was Course using Menu both as a first-lesson bottom action and as the drawer switcher label. Changed the first Course bottom slot to disabled Prev and renamed the drawer switcher to Main, so Course bottom navigation is purely lesson-flow and global main menu access has one owner: the header hamburger | next: refresh targeted validation and screenshot handoff`
- `2026-05-13 | Course nav polish validation | refreshed targeted validation after Course/Menu label polish | validation: npm run typecheck passed; npm run lint passed; npm run lint:briefs:all passed; npx playwright test tests/e2e/course-nav-contextual.spec.ts tests/e2e/mobile-screenshots.spec.ts tests/e2e/install-prompt.spec.ts --project=mobile-chromium passed with 8 passed and 1 expected iOS-only skip; npx playwright test tests/e2e/install-entry-desktop-tablet.spec.ts --project=desktop-chromium passed | screenshot: output/navigation-ia-course-polish-2026-05-13-200125 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-13 | screenshot approved | owner approved the refreshed Course nav screenshot handoff and accepted keeping public utility route `/contact`on the current`Home / Course / Programs` floating-nav model for this PR, with future refinement still possible | next: run npm run verify:pre-pr`
- `2026-05-13 | pre-pr evidence fix | npm run verify:pre-pr failed at quality-gate evidence only: missing explicit high-cost UI/export debug path, sweep identifiers/surfaces, and reference surface wording. Added the required evidence to this brief without changing product code | next: rerun npm run verify:pre-pr`
- `2026-05-13 | build fix | rerun npm run verify:pre-pr reached Next build and failed because useSearchParams in SiteChrome was not under a Suspense boundary for prerendered public routes such as /about. Moved search-param-dependent default mobile nav into a Suspense-wrapped child with a stable fallback while keeping the shared SiteChrome/MenuDrawer/MobileSegmentedNav contract | next: rerun npm run verify:pre-pr`
- `2026-05-13 | merged | PR #698 merged to main as b2c4179 after local verify:pre-pr PASS, local verify:pre-merge PASS, approved screenshot handoff, and green GitHub required checks | next: repo-managed docs-only closeout PR`
