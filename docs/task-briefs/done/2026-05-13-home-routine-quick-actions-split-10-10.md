# Task Brief: Home Routine Quick Actions Split (10/10)

## Metadata

- `id`: `2026-05-13-home-routine-quick-actions-split`
- `status`: `done`
- `owner`: Codex
- `created`: `2026-05-13`
- `updated`: `2026-05-13`

## Goal

Make signed-in Home a faster daily-use surface by replacing the single `My Routines` launcher with direct `Micro Sessions` and `Habits` actions, while keeping `/my-library/routines` as the organized My Library overview.

## Context

The previous Home slice added one `My Routines` action below `Free course`. Owner review clarified that Home should optimize for doing the next routine quickly, not choosing inside a routines hub. `Micro Sessions` and `Habits` should be reachable in one tap from Home, and empty states should explain the creation path without sending the user through extra navigation.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Accessibility (a11y)
- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                    | Evidence                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Home exposes two direct signed-in routine actions under `Free course`; `/my-library/routines` remains the grouped My Library overview.                | code review + route/label sweep + screenshots        | `5/5`                   |
| UX flow clarity                               | `target`     | `Micro Sessions` opens the active micro plan or creation state; `Habits` opens today's habit work or add-habit state without a routines chooser step. | targeted tests + screenshots                         | `5/5`                   |
| Visual design quality                         | `target`     | Two Home routine actions fit side-by-side on mobile without text overflow, nested-card clutter, or inconsistent spacing.                              | mobile/desktop screenshot handoff                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Routing and UI state only read existing dryland/habit snapshots; no mutation, schema, analytics, or persistence contract changes.                     | diff review + unit tests                             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes signed-in user Home/My Library routine navigation, not admin editing workflows.                                              | explicit admin scope rationale                       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New links have clear accessible names, stable keyboard targets, and no duplicate hidden focus traps.                                                  | component/e2e assertions + screenshot review         | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Signed-in Home may reuse existing dryland/habit snapshot loaders, adds no dependency, polling, or extra client bundle beyond route-local markup.      | dependency diff + targeted tests + later verify gate | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Dryland micro plans and habit definitions/check-ins remain server-canonical; Home only renders read-derived link/status state.                        | brief contract + code review                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Home remains `force-dynamic`; target routes keep existing authenticated loaders and mutation refresh behavior.                       | route diff review                                    | `4/5`                   |
| Reliability and failure handling              | `target`     | Snapshot load failures degrade to existing target routes with syncing/error copy; empty states offer one creation path.                               | unit/e2e coverage                                    | `5/5`                   |
| Security and authz                            | `target`     | Routine actions only render for signed-in users; protected target routes keep existing redirects and owner-scoped loaders.                            | existing auth route behavior + e2e                   | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new user data category, public exposure, export, or sharing path.                                                                 | diff review                                          | `4/5`                   |
| Content governance                            | `target`     | Home and support docs use stable labels: `Micro Sessions`, `Habits`, and retained `My Routines` overview copy where appropriate.                      | route/label/support sweep                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, operator action, moderation path, or admin editability changes.                                                        | explicit admin workflow scope rationale              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because signed-in routine actions and target routes are authenticated/private; public crawl metadata does not change.                             | explicit private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public structured data, crawlable docs page, or public semantic entity surface changes.                                                | explicit public-surface rationale                    | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice intentionally adds no analytics taxonomy or events.                                                                            | explicit no-analytics scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: `Free course`, programs, analysis, and contact Home actions remain present; no entitlement, checkout, or revenue path changes.       | Home action regression test                          | `4/5`                   |
| Incident response and support operations      | `target`     | Support docs/user-flow map describe direct Home routine actions and retained My Routines overview so stale navigation can be diagnosed.               | docs update + support sweep                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, payout, refund, entitlement, subscription, reporting, or reconciliation behavior changes.                                     | explicit finance scope rationale                     | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new copy stays short, literal, and localizable; no locale routing or translation workflow ships.                                     | copy review                                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Home, `TodaySurfaceState`, dryland/habit snapshot loaders, protected target routes, Tailwind/PressLink primitives, and test stack.     | code review + no-dependency diff                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/e2e tests cover split Home actions, direct target hrefs, routines overview retention, and mobile bubbles initial state.                 | Vitest/Playwright targeted tests + screenshots       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new storage, background job, polling, or high-cardinality runtime transform is introduced.                                        | no-migration/no-dependency review                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a normal code/docs/test revert; no migration, config, feature flag, or release sequencing required.                                       | no-migration review + later gates                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `app/page.tsx`, `TodaySurfaceState`, `buildTodayMicroSessionsState`, `buildTodayHabitsState`, and existing target routes.
  - Keep Home as a server component with route-local markup and existing `ActionButton` pattern for non-routine actions.
  - Keep `/my-library/routines` unchanged as the grouped overview.
- TypeScript/domain contracts:
  - Add typed helper state only if it adapts existing dryland/habit snapshots into Home links.
  - No new persisted entity, enum, or analytics taxonomy.
- Supabase/data layer:
  - No schema or RLS changes.
  - Existing owner-scoped dryland/habit loaders remain the only data read path.
- UI system:
  - Reference surface: keep Home quick actions on the existing `PressLink` action-card surface, keep `/my-library/routines` as the grouped routines reference surface, and reuse the existing Dryland micro-plan panel and Habits active-row surfaces instead of creating a new routine UI component.
  - Use existing Tailwind and `PressLink` primitives.
  - Home routine actions must be compact enough for mobile two-column use with clear labels and status text.
  - Screenshot handoff is `before/after` for Home mobile/desktop plus targeted after-state for micro/habit destinations if practical.
- Testing:
  - Update Home routines e2e coverage.
  - Add/update focused unit/component coverage for Home quick-action link derivation and micro-panel mobile bubbles initialization.

## Data Placement And Sync Contract

- Server-canonical data:
  - Dryland sessions, dryland micro plans, habit definitions, and habit check-ins remain canonical in Supabase through existing loaders/routes.
- Local data:
  - Home stores no new local state. Micro-panel execution-mode default is local UI state only.
- Sync policy:
  - Home reads the current server snapshot during the dynamic route render. Mutations still happen on the existing target pages.
- Retention and sensitivity:
  - No new retention rules, sensitive fields, exports, or public exposure.
- Cache/invalidation:
  - Home remains `force-dynamic`; `/my-library/dryland`, `/my-library/habits`, and `/my-library/routines` keep their existing cache behavior.

## Identity And Rename Contract

N/A because this slice does not create, rename, repurpose, or route by new persisted entities. Existing dryland/habit stable IDs and editable human-readable titles keep their current contracts.

## Scope

- Split the signed-in Home routine launcher under `Free course` into `Micro Sessions` and `Habits`.
- Keep anonymous Home without routine prompts.
- Keep `/my-library/routines` as the grouped overview.
- Route `Micro Sessions` directly to the micro-plan surface, with active plan focus and mobile bubbles default when opened from Home.
- Route `Habits` directly to today's habit work, or add-habit state when none exists.
- Keep Home mobile target pages execution-first: `Bubbles` collapses micro-plan management/source-session clutter, and `Habits` opens collapsed active rows before weekly stats.
- Add or clarify target-page empty-state anchors/copy only where needed for direct entry.
- Update relevant tests and support/user-flow docs.

## Out Of Scope

- No new database model, migration, RLS change, or generated type update.
- No monthly habit recurrence.
- No new analytics events or taxonomy.
- No broad Home redesign beyond the routine action split.
- No removal of `/my-library/routines`.
- No unrelated Dryland/Habits visual redesign.

## Acceptance Criteria

1. Signed-in Home shows `Free course`, then two direct routine actions: `Micro Sessions` and `Habits`.
2. Anonymous Home still hides routine actions.
3. `Micro Sessions` action opens `/my-library/dryland` in a micro-session-focused state rather than a generic routines chooser.
4. When an active micro plan is opened from Home on mobile, the execution surface defaults to `Bubbles`.
5. If no active micro plan exists, the target state explains how to create one from Dryland Sessions and offers one creation path.
6. `Habits` action opens today's habits/check-ins, or the add-habit state when no active habits exist.
7. `/my-library/routines` still shows the grouped `Micro Sessions`/`Habits` overview.
8. Home routine actions fit side-by-side on mobile without text overflow or incoherent nested boxes.
9. Support/user-flow docs reflect the split Home actions and retained My Routines overview.
10. Home mobile `Micro Sessions` entry shows the active `Bubbles` board with compact bubbles and management behind a disclosure.
11. Home mobile `Habits` entry hides top weekly stats and shows collapsed active habit rows with today's primary actions still available.

## Validation

Targeted before screenshot handoff:

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/my-library-today.test.ts tests/unit/today-tabs-panel.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx`
- targeted Home/routines Playwright smoke if local auth bypass is available
- screenshot handoff before `npm run verify:pre-pr`

Full gates after owner screenshot approval:

- `npm run verify:pre-pr`
- PR creation/update
- CI green
- `npm run verify:pre-merge`

## Manual QA Environments

- Local: `http://127.0.0.1:3000`
- Screenshots: before/after Home mobile/desktop, after micro-session direct entry, after habits empty/add or today state where fixture data allows.

## Closeout

- Merged PR: `#696`
- Merge commit: `a5a734f`
- Local validation:
  - `npm run verify:pre-pr`: PASS on `a7db799`
  - `npm run verify:pre-merge`: PASS on `a7db799`
  - `npm run merge:preflight -- --assert-ready`: PASS
- CI validation: GitHub `verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, PR Size, and Vercel passed.
- Screenshot handoff: `output/home-routine-mobile-focus-2026-05-13-150854`, captured `2026-05-13 15:08`, owner approved in chat.
- Product-rendering files changed after screenshot capture: no.
- Remaining gaps: none for this slice. Perf budget trend recommended tightening after five green weekly runs; budget changes are intentionally deferred to a separate performance-budget follow-up because this PR was a UI/flow slice.
- `10/10 claim`: yes.

### Achieved Score

Critical target categories for the `10/10` claim:

- Product goals and IA: `5/5`
- UX flow clarity: `5/5`
- Accessibility (a11y): `5/5`
- Business logic correctness and data integrity: `5/5`
- Reliability and failure handling: `5/5`
- Security and authz: `5/5`
- Stack-fit and dependency discipline: `5/5`
- Testing and QA automation: `5/5`
- DevOps and rollback readiness: `5/5`

All target scorecard categories:

| Target Category                               | Achieved Score | Evidence                                                                                   |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | Home split into direct `Micro Sessions` and `Habits`; `/my-library/routines` retained.     |
| UX flow clarity                               | `5/5`          | Direct mobile focus states for micro sessions and active habits, validated by screenshots. |
| Visual design quality                         | `5/5`          | Owner-approved screenshot handoff with compact Home and target mobile states.              |
| Business logic correctness and data integrity | `5/5`          | Existing server-canonical dryland/habit loaders reused; no schema or mutation change.      |
| Accessibility (a11y)                          | `5/5`          | Link semantics and route headings preserved; a11y/home E2E passed in full gates.           |
| Performance (CWV + payloads)                  | `5/5`          | Perf budget passed; no dependency or polling added.                                        |
| Data placement and sync boundaries            | `5/5`          | Home renders read-derived state only; target pages keep existing mutation/sync behavior.   |
| Reliability and failure handling              | `5/5`          | Empty/fallback route states covered by unit tests and broad gates.                         |
| Security and authz                            | `5/5`          | Signed-in actions stay private; protected route behavior unchanged and CI smoke passed.    |
| Content governance                            | `5/5`          | Route/label/support sweep completed and docs updated.                                      |
| Incident response and support operations      | `5/5`          | Support runbook and user-flow map document split Home actions and retained overview.       |
| Stack-fit and dependency discipline           | `5/5`          | Existing Home, dryland, habit, Tailwind, and test surfaces reused; no new dependency.      |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `verify:pre-pr`, `verify:pre-merge`, and CI all passed.                   |
| DevOps and rollback readiness                 | `5/5`          | Normal revert path; no migration/config/feature-flag rollout required.                     |

## Route, Label, And Support-Surface Impact Sweep

Required before broad gates because Home labels and workflow entrypoints change. Search targets:

- `My Routines`
- `Micro Sessions`
- `Habits`
- `Today's habits and micro-sessions`
- `/my-library/routines`
- `/my-library/dryland`
- `/my-library/habits`
- `Bubbles`
- `Free course`

Surfaces to check:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/user-flow-map.md`
- `docs/runbooks/`
- active/planned/done task briefs touched by the label contract

## Checkpoint Log

- `2026-05-13 | in-progress | branch feature/home-routine-quick-actions-split created from clean synced main c6af142 after #694/#695; owner approved Home split recommendations and requested end-to-end execution stopping at screenshot handoff | next: implement scoped Home direct actions, target route focus, tests, docs, and screenshots`
- `2026-05-13 | implemented | split signed-in Home routine launcher into Micro Sessions and Habits, added direct target hrefs/anchors for active or creation states, kept /my-library/routines unchanged, added micro-focused dryland entry and mobile-bubbles default for Home direct entry, and updated support/user-flow docs | validation: lint:briefs:all PASS, targeted Vitest 4 files/27 tests PASS, npm run typecheck PASS, npm run lint PASS, targeted Home Playwright PASS for anonymous and SKIP for signed-in dev-bypass because local Supabase URL resolves to example.com | next: capture screenshot handoff before verify:pre-pr`
- `2026-05-13 | route-label-support-sweep | identifiers searched: My Routines, Micro Sessions, Habits, Today's habits and micro-sessions, /my-library/routines, /my-library/dryland, /my-library/habits, Bubbles, Free course | surfaces checked: app/, components/, lib/, tests/, docs/runbooks/, docs/user-flow-map.md, and active brief | fallout handled in Home route, Today state helper, Dryland micro entry, Habits anchors/empty copy, Home e2e/unit tests, support runbook, user-flow map, and this brief; /my-library/routines intentionally remains as the grouped overview`
- `2026-05-13 | screenshot-handoff-ready | fixed mobile micro direct-entry hydration stability so the server hydrates ordered mode before the client applies bubbles on mobile, reran targeted Vitest for dryland micro panel/Home/today state (3 files/24 tests PASS), captured signed-in screenshots with local fake Supabase fixture at output/home-routine-quick-actions-split-2026-05-13-131249, and confirmed no hydration mismatch in Next logs after final capture | next: owner screenshot review; pause before npm run verify:pre-pr`
- `2026-05-13 | mobile-execution-focus | owner requested collapsing Bubbles and Habits target pages further for fast mobile use. Updated Home Habits hrefs to /my-library/habits?view=active, hid weekly Habit stats on mobile active entry, kept active habit rows collapsed with inline count save controls, collapsed the Add habit form behind the Add action when active habits exist, reduced bubble sizes/gaps, moved micro management behind a disclosure in Bubbles mode, hid mobile micro page chrome/intro for direct active entries, and hid source dryland session list on mobile micro-focused active entries | validation: targeted Vitest 4 files/35 tests PASS, npm run typecheck PASS, npm run lint PASS, final screenshot handoff captured at output/home-routine-mobile-focus-2026-05-13-150854 with no hydration mismatch in server logs | next: owner screenshot review; pause before npm run verify:pre-pr`
- `2026-05-13 | screenshot-approved | owner approved the final mobile focus screenshot handoff in output/home-routine-mobile-focus-2026-05-13-150854 | next: run npm run verify:pre-pr, commit, push, and open/update PR`
- `2026-05-13 | merged | PR #696 merged to main as a5a734f after npm run verify:pre-pr PASS, npm run verify:pre-merge PASS, GitHub CI green, and merge preflight PASS | next: repo-managed docs-only closeout`
