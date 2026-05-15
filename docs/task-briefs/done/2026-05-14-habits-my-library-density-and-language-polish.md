# Task Brief: Habits My Library Density And Language Polish

## Metadata

- `id`: `2026-05-14-habits-my-library-density-and-language-polish`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-14`
- `updated`: `2026-05-15`

## Goal

Make Habits in My Library easier to scan and edit by reducing duplicated labels, collapsing the add form by default, and using clearer habit mode language.

## Audit Findings

Owner UI audit on `2026-05-14` identified these Habits issues:

1. `Cold Water` shows `Done only` twice.
2. The `Add habit` form is always expanded and pushes active habits down the page.
3. The primary `Add habit` action should open the form from the Habits surface in My Library.
4. The text under the `Habits` heading wraps to two lines and feels heavier than the job requires.
5. `Build` is unclear as a habit mode label; the recommended mode labels are `Do`, `Quit`, and `Timed`.

Implementation audit on `2026-05-15` confirmed the slice should stay display-first and avoid data migration:

1. `habit_mode` is an existing persisted text contract with a database check constraint for `build`, `quit`, and `timed`; changing storage to `do` would require a migration and export/API compatibility work that is not needed for this polish slice.
2. `getHabitModeLabel()` is the main display seam for row chips and add/edit mode controls, so `build` can remain the internal value while rendering as `Do`.
3. Desktop currently opens the add form by default; mobile active focus already collapses it when active habits exist. The implementation should make the compact collapsed default consistent while preserving the empty-state path.
4. The duplicate `Done only` comes from showing both the binary habit target/status and the expanded details type/target chips. The implementation should suppress redundant details chips for binary `build` habits instead of changing the domain target label.
5. Support-language fallout is concentrated in `docs/user-flow-map.md` and `docs/runbooks/auth-account-support.md`; unrelated `Build` usage in workouts, guides, course content, and task briefs is out of scope.

## Product Decision

Habits should open as a compact management surface: active habits first, details collapsed by default, and creation behind a clear `Add habit` action. The habit mode vocabulary should be literal:

- `Do`: a habit the swimmer wants to perform.
- `Quit`: a habit the swimmer wants to stop.
- `Timed`: a habit measured by duration.

Storage/API decision: keep persisted `habit_mode = "build"` and render it as `Do` in user-facing Habits UI and support copy. No Supabase migration, generated database type update, or export schema change is planned for this slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                         | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits prioritizes active habit scan/edit work before creation details; `Add habit` opens creation inline without burying the list.                                        | screenshot handoff + route review             | `5/5`                   |
| UX flow clarity                               | `target`     | No duplicate `Done only`; habit modes read as `Do`, `Quit`, `Timed`; details and add form are collapsed until requested.                                                   | component tests + manual QA                   | `5/5`                   |
| Visual design quality                         | `target`     | Heading copy is short, does not wrap awkwardly at desktop/mobile target widths, and habit cards stay compact without text overlap.                                         | after/reference screenshots                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Mode rename is display/contract-safe or migrated explicitly; existing habit type semantics and check-in history remain unchanged.                                          | unit tests + domain diff review               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing Habits surface, not an admin editor workflow.                                                                                            | explicit admin scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Collapsed sections use labelled controls with `aria-expanded`; add/edit/details actions remain keyboard reachable and screen-reader clear.                                 | Testing Library assertions + Playwright smoke | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, polling, or extra authenticated fetch; collapsed form reduces initial visible DOM noise and `/my-library` payload remains within current budget.        | perf budget check + dependency diff           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Habit records and check-ins remain server-canonical; expanded/collapsed UI state stays local-only.                                                                         | data-boundary review                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Authenticated Habits routes keep existing dynamic read/mutation refresh behavior; no new cache layer ships.                                                                | route/cache diff review                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Add/edit/check-in failure states keep existing visible data and expose retry or recoverable feedback.                                                                      | component tests + manual QA                   | `5/5`                   |
| Security and authz                            | `supporting` | Existing owner-scoped habit API boundaries remain fail-closed; no new protected API is introduced unless covered by negative-path tests.                                   | API diff review                               | `4/5`                   |
| Privacy and compliance                        | `supporting` | No new personal data category, third-party service, notification token, or analytics payload is introduced.                                                                | privacy/no-event review                       | `4/5`                   |
| Content governance                            | `target`     | `Build`/`Quit`/`Timed`, `Done only`, and Habits heading/support copy are swept across code, tests, docs, and Help/Guide surfaces for stale language.                       | route/label/support sweep                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, operator action, moderation path, or admin content editability changes.                                                                     | explicit admin workflow rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Habits is an authenticated/private route and no public metadata, sitemap, robots, canonical, or crawlable content changes.                                     | explicit private-route rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable route, structured public entity data, or crawl-safe content model changes.                                                           | explicit AI-discoverability rationale         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | No new event taxonomy is required; if existing habit events are touched, payloads must remain route-stable and no-PII.                                                     | no-event review or event diff review          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation changes.                                                        | explicit commerce scope rationale             | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs can explain habit mode labels, collapsed creation, and how to recover if add/edit/check-in feedback fails.                                                    | support/user-flow docs                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reporting, invoice, subscription, payout, revenue recognition, or reconciliation data changes.                                                      | explicit finance scope rationale              | `N/A`                   |
| i18n operational readiness                    | `supporting` | New mode labels and helper copy stay short, literal, and localizable; no locale routing or translation workflow ships.                                                     | copy review                                   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Habits/My Library components, typed habit contracts, mutation paths, and Tailwind primitives; add no dependency.                                            | dependency diff + code review                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover collapsed add form, mode label rendering, no duplicate type chip, and critical add/edit/check-in actions.                                                      | targeted Vitest/Playwright + verify gates     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Collapsed UI is local render state only and must not add extra queries, polling, or unbounded client state.                                                                | query/runtime review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/config/dependency is expected; rollback is a normal code/docs/test revert, or migration rollback is explicitly documented if mode storage changes are needed. | no-migration review + verify gates            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse the existing Habits/My Library route and components;
  - do not introduce a new route for adding habits unless the audit proves inline collapse is not viable.
- TypeScript/domain contracts:
  - preserve existing habit mode/type/check-in contracts;
  - use a display-only label mapping from stored `build` to user-facing `Do`.
- Supabase/data layer:
  - no schema/RLS/generated type change is expected;
  - no enum/storage migration is scoped.
- UI system:
  - use existing My Library/Habits primitives, compact cards, labelled disclosure controls, and screenshot handoff.
- Testing:
  - targeted unit/component tests for labels, collapse, and duplicate-chip removal;
  - Playwright/screenshot coverage for desktop and mobile.

## Data Placement And Sync Contract

- Server-canonical:
  - habit records,
  - habit mode/type/category/cadence,
  - check-in history.
- Local-only:
  - add-form expanded/collapsed state,
  - details expanded/collapsed state,
  - transient submit pending/error state.
- Sync policy:
  - existing habit mutations remain authoritative;
  - failed mutation must keep last visible server data and show recoverable feedback.
- Cache/invalidation:
  - authenticated route behavior remains dynamic; existing mutation refresh behavior remains the invalidation path.

## Identity And Rename Contract

- Canonical stable IDs:
  - habit ids and check-in ids remain the source of truth.
- Human-readable identifiers:
  - habit names remain renameable display labels.
- Mode labels:
  - `Do`, `Quit`, `Timed` are user-facing labels;
  - storage remains `build`, `quit`, `timed`.
- Rename vs repurpose policy:
  - changing a habit name does not repurpose historical check-ins unless the user explicitly edits the habit.
- Compatibility:
  - existing `Build` records must still render safely after the label change.

## Scope

- Remove duplicate `Done only` display for habit rows/cards.
- Rename user-facing mode labels to `Do`, `Quit`, `Timed` using display-only mapping.
- Collapse `Add habit` by default and expose a primary `Add habit` action near the top of Habits.
- Keep active habits visible before the creation form.
- Shorten or remove the explanatory copy under `Habits`.
- Keep details/edit/archive behind explicit row actions.
- Update targeted tests, docs/support surfaces, and screenshot handoff.

## Out Of Scope

- New reminder/notification system.
- New habit analytics dashboard.
- Habit streak algorithm redesign.
- Dryland/Micro Session changes.
- Commerce, admin, course, or public marketing changes.
- Habit mode storage migration from `build` to `do`.
- Unrelated `Build` labels for swim workouts, guides, course content, or implementation task briefs.

## Acceptance Criteria

1. Habits opens with active habits visible before the add form.
2. `Add habit` opens the creation form inline and can be collapsed again if the existing UI pattern supports it.
3. `Cold Water` or any similar habit displays `Done only` at most once.
4. Habit mode labels are clear: `Do`, `Quit`, `Timed`, with persisted compatibility validated.
5. Text under `Habits` is short enough not to wrap awkwardly at supported desktop/mobile widths, or is removed.
6. Keyboard and screen-reader users can open details, edit, archive, and add habits.
7. No new dependency, migration, polling, or extra authenticated fetch is added unless explicitly justified in the implementation update.
8. Targeted tests and screenshots cover the changed Habits surfaces.

## Validation Plan

- `npm run lint:briefs`
- Targeted Habits unit/component tests.
- Targeted Playwright/screenshot handoff for `/my-library/habits` and My Library Habits entry points.
- `npm run lint`
- `npm run typecheck`
- `npm run verify:pre-pr` after screenshot approval.
- `npm run verify:pre-merge` before merge recommendation.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/habits`
  - relevant My Library route that embeds Habits.
- Screenshot handoff:
  - after/reference mobile and desktop screenshots for Habits overview,
  - add form collapsed and expanded,
  - representative habit details row.

## Help / Guide Impact

Required. Update user-flow/support docs if labels or recovery behavior change:

- `Build` to `Do` label mapping,
- what `Quit` and `Timed` mean,
- where to add a habit,
- how to recover from failed add/edit/check-in.

## Route / Label / Support Surface Sweep

Run targeted sweep before broad gates for:

- `Habits`
- `Add habit`
- `Build`
- `Do`
- `Quit`
- `Timed`
- `Done only`
- `Cold Water`
- `/my-library/habits`

Surfaces to check: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, and Help/Guide assertions where relevant.

Implementation-audit sweep completed on `2026-05-15`:

- Product route/header: `app/my-library/habits/page.tsx`.
- Primary UI and reference surface: `components/my-library/habits/HabitPerfectDayHub.tsx`.
- Domain/storage contract: `lib/habits/shared.ts`, `lib/habits/server.ts`, `app/api/my-library/habits/**`, `supabase/migrations/20260512103000_habits_v2_build_quit_timed_tracking.sql`.
- User-flow/support fallout: `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`.
- Tests to update: `tests/unit/habit-perfect-day-hub.test.tsx`, `tests/unit/habits.test.ts`, `tests/e2e/my-library-habits.spec.ts` if screenshot/route smoke assertions need stable text.

Route/label/support sweep completed on `2026-05-15`:

- identifiers searched: `Habits`, `Add habit`, `Build`, `Do`, `Quit`, `Timed`, `Done only`, `Cold Water`, `/my-library/habits`, `habit_mode`, `HABIT_MODE_VALUES`, `build_quit_timed`.
- surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, Supabase migrations, generated database type references, and active task briefs.
- fallout handled: Habits route heading copy, `HabitPerfectDayHub` labels/collapse/details behavior, component tests, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and this active brief.
- fallout intentionally retained: stored/API/export `habit_mode = build`, migration filenames, analytics payload keys, and unrelated swim-session/workout/course `Build` labels because they are outside this Habits user-facing mode vocabulary slice.

## Checkpoint Log

- `2026-05-14 | planned | owner UI audit captured Habits density/language findings while Dryland/offline recovery slice was in progress; scope parked as a separate planned brief to keep Dryland PR clean | next: start this brief after Dryland/offline recovery PR is reviewed/merged`
- `2026-05-15 | in-progress | branch habits-my-library-density-language-polish created; implementation audit completed; scope clarified as display-only mode language polish with no habit_mode migration | next: owner scope confirmation before product-code implementation`
- `2026-05-15 | implemented + screenshot stop | implemented compact Habits management surface: add form is collapsed behind Add habit, active rows/details are collapsed by default, stored build mode renders as Do, binary details show Done only once, header copy is shorter, and support/user-flow docs are aligned | validation: targeted Habits Vitest PASS (3 files, 36 tests), npm run typecheck PASS, npm run lint PASS, npm run lint:briefs -- --all PASS, git diff --check PASS, targeted Habits Playwright exited 0 with 4 skips because local dev-login Supabase returned HTML instead of JSON; screenshots captured at output/habits-density-language-polish-2026-05-15-091053 using a temporary local fixture route that was removed before handoff | next: owner screenshot approval before npm run verify:pre-pr, commit, push, and PR automation`
- `2026-05-15 | screenshot approved | owner approved screenshot handoff and asked to check top spacing; Habits top spacing matches existing My Library route shell spacing (`pt-24 sm:pt-28` / rounded white shell), so no product-rendering change was made after capture | next: run npm run verify:pre-pr`
- `2026-05-15 | pre-pr gate passed | npm run verify:pre-pr PASS after route/label/support sweep evidence was added to this brief; full lane passed lint, typecheck, unit tests, build, perf budgets, and Playwright with expected auth-dependent skips from local dev-login/Supabase returning HTML; perf budget trend recommended tightening after 5 consecutive weekly green runs, but this Habits UI slice holds budgets unchanged and records the tighten decision as a follow-up governance prompt instead of expanding scope | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
