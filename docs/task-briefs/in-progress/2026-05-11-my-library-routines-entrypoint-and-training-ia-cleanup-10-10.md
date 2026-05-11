# Task Brief: My Library Routines Entrypoint And Training IA Cleanup (10/10)

## Metadata

- `id`: `2026-05-11-my-library-routines-entrypoint-and-training-ia-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-11`
- `updated`: `2026-05-11`

## Goal

Make authenticated My Library easier to scan by keeping `My routines` directly under `Free Course`, removing duplicated routine/training entrypoints, and adding clear `Open`/`Edit` actions where users actually continue or adjust routines.

## Product Decision

`My routines` should be visible to all signed-in users because it is a retention and habit surface, not a subscriber-only upsell. Anonymous users still enter through sign-in before personal routine data is shown. Subscribers can get advanced routine features later, but the core launcher should be validated broadly first.

`Habits` should not also appear as a separate top-level My Library card when it already lives inside `My routines`. `My Training` should not be a top-level My Library menu item in this slice because focus/observations are better as contextual actions inside session/program/history flows. The existing `/my-library/training` route stays available for compatibility and deeper contextual links until a later observations/history slice moves or retires it fully.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                    | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library` keeps `Free Course` first, then one `My routines` launcher with no duplicate `Habits` or top-level `My Training` card.  | code review + screenshot handoff + e2e      | `5/5`                   |
| UX flow clarity                               | `target`     | Users can open or edit the active Micro Sessions/Habits routine from the Routines panel without competing duplicate cards.            | component tests + Playwright route smoke    | `5/5`                   |
| Visual design quality                         | `target`     | `NEW CONTENT` badge/actions align vertically and the landing card rhythm remains compact on mobile/desktop.                           | screenshot handoff                          | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: this slice changes navigation/actions only and must not alter habit, course, or routine completion truth.            | no data mutation review + tests             | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an authenticated user landing page cleanup and does not change admin editor workflows.                            | explicit scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Routines tabs and `Open`/`Edit` links remain keyboard/screen-reader usable with clear link names.                                     | component/e2e assertions                    | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, polling, or additional server data load may be added to `/my-library`.                                | dependency diff + build/perf gate           | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Selected Routines tab remains local-only; routine/habit/micro-session facts remain server-canonical in their existing stores.         | data-boundary review + tests                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: authenticated `/my-library` remains dynamic and existing routine/habit invalidation behavior is unchanged.           | route/cache review                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing schema/fallback copy for habits and micro sessions still leaves core My Library navigation usable.                            | regression tests + manual QA                | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no new protected API path ships; existing authenticated route guard remains in place.                                | route guard review                          | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, analytics payload, notification token, or subscription gate is introduced.                     | privacy/no-event review                     | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: My Library labels change, and stale route/runbook mentions must be swept.                                            | route/label/support sweep                   | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, admin CRUD, or operator editability surface is introduced.                                             | explicit scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library` is authenticated and no public metadata, sitemap, robots, or crawlability behavior changes.                 | explicit scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content or structured public entity surface is introduced.                                      | explicit scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new event taxonomy ships; existing New Content analytics must remain intact.                                      | test/review of unchanged analytics          | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Free Course and owned/purchase recovery surfaces must remain visible; no entitlement or checkout behavior changes.   | My Library QA + verify gate                 | `4/5`                   |
| Incident response and support operations      | `target`     | Support docs must describe Routines, removed top-level duplicates, and where training focus/notes remain reachable.                   | runbook/user-flow update + support sweep    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no invoice, payout, refund, entitlement, subscription, revenue recognition, or finance reporting data. | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: copy remains short and structurally localizable; no locale routing or translation workflow ships here.               | copy review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing My Library, Today/Routines, Link, Tailwind, and test stack; add no dependency.                                         | dependency diff + code review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/component/e2e coverage protects Routines actions, removed duplicate cards, and New Content alignment contract.          | targeted tests + screenshot handoff + gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new queries, polling, or dashboard framework may be introduced.                                                   | query/dependency review                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | UI cleanup can roll back by reverting the PR; no migration or data backfill is required.                                              | no-migration review + verify gates          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `app/my-library/page.tsx`, `TodayTabsPanel`, and `lib/my-library/today.ts`,
  - keep authenticated data loading server-side and tab state client-local,
  - use normal `Link` navigation for `Open`/`Edit`.
- TypeScript/domain contracts:
  - extend the existing Routines view-model with edit links only,
  - do not create new persistence or completion truth.
- Supabase/data layer:
  - no schema or RLS change.
- UI system:
  - preserve existing My Library card shape,
  - no nested card sprawl,
  - screenshot handoff is required as `before/after` evidence for `/my-library`.
- Testing:
  - update `TodayTabsPanel` and My Library landing coverage,
  - run route/label/support sweep for changed entrypoint labels.

## Data Placement And Sync Contract

- Server-canonical:
  - existing habits, micro-plan, course progress, entitlements, profile, workout, program, and dryland facts.
- Local-only:
  - selected `My routines` tab.
- Sync policy:
  - no new sync path; links route to existing canonical surfaces.
- Retention and sensitivity:
  - no new data is stored and no notification/subscription token is introduced.
- Cache/invalidation:
  - `/my-library` remains dynamic; existing downstream route mutation behavior is unchanged.

## Identity And Rename Contract

- Canonical stable ID:
  - Routines tab ids `micro-sessions` and `habits` remain stable UI ids.
- Human-readable identifiers:
  - labels such as `My routines`, `Open`, and `Edit` are product copy and can be renamed.
- Mutability rules:
  - removing top-level cards does not remove underlying route identities.
- Rename vs repurpose policy:
  - do not repurpose `/my-library/training`; keep route compatibility until a later observations/history slice decides final ownership.
- Compatibility contract:
  - direct links to `/my-library/habits` and `/my-library/training` keep working.
- Observability and repair:
  - support docs identify where to look if Routines or training-context links are stale.

## Scope

- Align collapsed `NEW CONTENT` badge and actions vertically.
- Add secondary `Edit` action beside `Open` in `My routines`.
- Keep `My routines` under `Free Course` for all signed-in users.
- Remove duplicate top-level `Habits` card from `/my-library`.
- Remove top-level `My Training` card from `/my-library` while keeping the route for contextual/deep links.
- Update My Library tests and support docs.

## Out Of Scope

- Public home redesign.
- Subscription gating for `My routines`.
- Moving training focus/observations into swim session builder or history flows in this PR.
- Deleting `/my-library/training` or its APIs.
- New analytics events or notification/reminder delivery.

## Acceptance Criteria

1. `/my-library` shows `Free Course`, then `My routines`.
2. `My routines` has `Micro Sessions` and `Habits` tabs with `Open` and `Edit` actions.
3. `/my-library` no longer shows separate top-level `Habits` or `My Training` cards.
4. `NEW CONTENT` badge aligns vertically with `Show list` and dismiss actions.
5. Existing direct `/my-library/habits` and `/my-library/training` routes remain available.
6. Support/user-flow docs explain the new My Library entrypoint shape.

## Validation

- `npm run lint:briefs`
- targeted Vitest for `TodayTabsPanel` and New Content component
- targeted Playwright for My Library landing when local auth bypass is available
- screenshot handoff before `npm run verify:pre-pr`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local: `http://127.0.0.1:3000/my-library`
- Screenshot handoff: `before/after` desktop and mobile My Library views.

## Help / Guide Impact

Required: update `docs/user-flow-map.md` and `docs/runbooks/auth-account-support.md` for `My routines`, removed top-level `Habits`/`My Training` cards, and retained contextual `/my-library/training` route.

## Route / Label / Support Surface Sweep

Run targeted sweep for `My routines`, `Routines`, `NEW CONTENT`, `Show list`, `My Training`, `Habits`, `/my-library/training`, `/my-library/habits`, `Open`, `Edit`, and support docs before broad verification.

## Checkpoint Log

- `2026-05-11 | started | owner supplied My Library UI findings and explicitly asked to execute all discussed observations end-to-end; branch my-library-dryland-ia-cleanup-2026-05-11 created from clean main 748d55d | next: implement landing cleanup and update tests/docs`
- `2026-05-11 | implemented | aligned New Content actions, added Routines Open/Edit links, removed duplicate top-level Habits and My Training cards from My Library, kept direct /my-library/habits and /my-library/training routes compatible, and updated user-flow/support docs | validation: targeted Vitest for TodayTabsPanel/New Content/Dryland suite PASS, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS | next: screenshot handoff before verify:pre-pr`
- `2026-05-11 | route-label-support-sweep | identifiers searched: My routines, Routines, NEW CONTENT, Show list, My Training, Habits, /my-library/training, /my-library/habits, Open, Edit | surfaces checked: app/, components/, lib/, tests/, docs/runbooks/, docs/user-flow-map.md, and active task briefs | fallout handled in My Library route, Routines view-model/component, landing e2e, runbook, user-flow map, and this brief; My Training route/tests/goals links intentionally remain because the route is retained for contextual/deep links`
- `2026-05-11 | screenshot-ready | screenshot artifacts captured at output/playwright/my-library-dryland-ia-cleanup-20260511-101559 after temporary local preview cleanup; targeted Vitest 7 files/46 tests PASS, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS; targeted Playwright E2E returned 2 skipped because local dev-login still receives Supabase HTML instead of JSON | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-11 | visual-correction | owner noted the primary Open action should sit to the right of secondary Edit; Routines action order changed to Edit then Open, with unit assertion added; refreshed My routines screenshots at output/playwright/my-routines-action-order-20260511-103310 after temporary preview cleanup | validation: tests/unit/today-tabs-panel.test.tsx PASS, npm run typecheck PASS, npm run lint PASS | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-11 | screenshot-approved | owner approved the visual handoffs for the My Library routines/Dryland IA cleanup; no product-rendering files changed after the final Dryland source-actions capture | next: run npm run verify:pre-pr`
