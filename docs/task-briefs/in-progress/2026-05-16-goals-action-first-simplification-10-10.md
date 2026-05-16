# Task Brief: Goals Action-First Simplification (10/10)

## Metadata

- `id`: `2026-05-16-goals-action-first-simplification-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-16`
- `updated`: `2026-05-16`

## Brief Audit Record

- `last_audited`: `2026-05-16`
- `base`: `main@475c946`
- `audit_status`: `ready`
- `decision`: Implement the locked scope on branch `goals-action-first-simplification`.
- `reason`: `main` is clean; current Goals paths, reference surfaces, scorecard requirements, UI screenshot handoff rules, and the coaching CTA decision were audited and locked; existing in-progress briefs are `revise-before-use` and should not be reused for this slice.
- `must_refresh_before_execution_if`: `main` changes around Goals, My Training, Habits, Micro Sessions, route labels, support docs, scorecard/lint rules, or the owner changes any scope decision below.

## Goal

Simplify `/my-library/goals` into a compact, action-first goals workspace where current goals come first, each goal exposes one clear primary action, management is tucked behind `Details` or `Add goal`, and the existing server-canonical goals contract remains unchanged.

## Audit Findings

Owner audit on `2026-05-16` established the direction:

1. `main` is clean.
2. Existing `in-progress` briefs are stale `revise-before-use` records and must not drive this implementation directly.
3. Goals should follow the Habits/Bubbles principle: action first, less explanatory text, one primary action per goal, management behind `Details`/`Add goal`, and one filter control.
4. Reference surfaces:
   - `components/my-library/goals/GoalsHub.tsx`
   - `app/my-library/goals/page.tsx`
   - `components/my-library/habits/HabitPerfectDayHub.tsx`
   - `components/my-library/dryland/DrylandMicroPlanPanel.tsx`

Implementation audit on `2026-05-16` found:

1. `GoalsHub` currently has duplicate filter affordances: three summary/filter cards plus a second filter button row.
2. The page shows several explanatory panels before or around the goal list: My Training bridge, instruction strip, templates placeholder, custom creator placeholder, and coaching CTA.
3. Each active goal card can expose several competing actions at once: `Use as focus`, `Add note`, `Log result`, `Clear best result`, and `Archive`.
4. The existing domain contract already has the needed action seam through `GoalView.primaryAction`; the simplification should prefer that contract over inventing new goal state.
5. Goals are server-canonical through the existing authenticated `/api/goals` and `/api/goals/[goalId]` routes; this slice should not need Supabase migrations, generated DB type changes, new APIs, or new dependencies.
6. Existing tests and e2e flows reference current labels such as `Use as focus`, `Add note`, `Browse templates`, `Open creator`, and `Archive`; moving these behind details requires targeted test updates.

## Product Decision

Scope locked by owner on `2026-05-16`:

- `/my-library/goals` becomes list-first and compact:
  - short route header,
  - one `Add goal` control,
  - one filter control,
  - current goal cards before explanatory or management content.
- Keep the default filter on active/current goals when active goals exist.
- Use exactly one filter control for `Active`, `Achieved`, `Archived`, and `All`, with counts where useful.
- Each goal card shows:
  - goal title/status,
  - compact progress/target state,
  - one visible primary action derived from `GoalView.primaryAction` when the goal is actionable,
  - a `Details` disclosure for secondary/management actions.
- Secondary/management actions live behind `Details`:
  - `Use as focus`,
  - `Add note`,
  - `Archive`,
  - `Restore`,
  - `Clear best result`,
  - target metadata.
- `Add goal` owns creation:
  - combine template and custom creation under one add surface,
  - keep active-limit feedback inline,
  - empty state may open or strongly emphasize `Add goal`, but non-empty state keeps creation collapsed.
- `Request coaching schedule` stays on `/my-library/goals` as one secondary footer CTA after the Goals work surface:
  - keep existing href `/contact?source=goals_coaching`,
  - do not place it inside every goal `Details`,
  - do not let it compete with goal-card primary actions,
  - do not change Contact/admin intake behavior in this slice.
- Preserve existing training-context bridge behavior and URLs, even if the links move behind `Details`.
- Preserve offline/error/retry behavior and existing server-confirmed mutation semantics.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/goals` has one clear page job: review current goals and take the next goal action; add/manage work is behind `Add goal` or `Details`.                                   | route review + before/after screenshot handoff                     | `5/5`                   |
| UX flow clarity                               | `target`     | One filter control exists; each goal has at most one visible primary action plus `Details`; empty, loading, error, offline, retry, active-limit, achieved, and archived states work. | component tests + targeted e2e/manual QA                           | `5/5`                   |
| Visual design quality                         | `target`     | Goals matches the compact Habits/Micro Sessions visual rhythm, avoids nested card clutter, and has no text overlap on supported desktop/mobile widths.                               | before/after and after/reference screenshots                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Goal create/log/reset/archive/restore/celebrate mutations keep using existing server-confirmed APIs; no local-only presentation state becomes goal truth.                            | unit tests + API/domain diff review                                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an authenticated user Goals surface, not an admin editor or publish workflow.                                                                                    | explicit admin scope rationale                                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Filter, `Add goal`, `Details`, result inputs, and all moved actions are keyboard reachable with clear labels, `aria-expanded` where relevant, and preserved focus behavior.          | Testing Library assertions + Playwright smoke                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, polling, route fetch, or unbounded client state; `/my-library/goals` remains within current My Library authenticated route budget expectations.                   | dependency/runtime diff review + build/perf gate                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Goal records/progress/status stay server-canonical; filters, disclosures, add panel state, and result drafts stay local-only/transient.                                              | data-boundary review + component tests                             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing dynamic page and `no-store` API behavior stay unchanged unless explicitly justified; returned mutation payloads remain the client refresh path.                             | route/API cache diff review                                        | `4/5`                   |
| Reliability and failure handling              | `target`     | Failed creates/updates keep existing visible data, preserve drafts where safe, expose retryable feedback, and do not hide the target goal/action.                                    | component tests + manual offline/error QA                          | `5/5`                   |
| Security and authz                            | `supporting` | Existing authenticated owner-scoped APIs remain fail-closed; no new protected route/API is introduced unless covered by negative-path tests.                                         | API diff review + existing goals route tests                       | `4/5`                   |
| Privacy and compliance                        | `supporting` | No new personal data category, third-party service, analytics payload, or sensitive free-text logging is introduced.                                                                 | privacy/no-event review                                            | `4/5`                   |
| Content governance                            | `target`     | Goal action labels, route copy, support docs, and tests use one current vocabulary for `Add goal`, `Details`, filters, goal actions, and training-context bridge links.              | route/label/support sweep                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, moderation, operator workflow, or admin editability changes are in scope.                                                                                 | explicit admin workflow rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/goals` is authenticated/private and no public metadata, sitemap, robots, canonical, or crawlable content changes.                                           | explicit private-route rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable route, structured public entity data, or crawl-safe documentation page changes.                                                                | explicit AI-discoverability rationale                              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | No new analytics event taxonomy is required; if existing goal/training bridge events are touched, payloads must remain route-stable and no-PII.                                      | no-event review or event diff review                               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation changes.                                                                  | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs can explain where to add/manage goals, where focus/note bridge links moved, and how to diagnose failed goal create/log/archive/restore feedback.                        | `docs/runbooks/auth-account-support.md` or explicit no-change note | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this user-facing Goals UI simplification has no finance reporting, invoice, subscription, payout, revenue recognition, or reconciliation data impact.                    | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | New/moved labels stay short, literal, and localizable; no locale routing or translation workflow ships in this slice.                                                                | copy review                                                        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js route, `GoalsHub`, `GoalView.primaryAction`, Goals APIs, Tailwind primitives, and Habits/Dryland reference patterns; add no dependency.                       | dependency diff + architecture review                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover single filter control, one visible primary action per goal, details disclosure, add goal flow, bridge links behind details, and key mutation/failure states.             | targeted Vitest/e2e + verify gates                                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Rendering remains bounded by existing active-goal limit and current list size; no extra query loop, polling, background job, or external service is added.                           | runtime/query diff review                                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/config/dependency is expected; rollback is a normal code/docs/test revert with existing Goals API/data contract intact.                                                 | no-migration review + pre-pr/pre-merge gates                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `/my-library/goals` as the route,
  - reuse `GoalsHub` rather than creating a parallel goals surface,
  - keep the server/client boundary: page loads initial goals on the server, `GoalsHub` owns client interaction,
  - preserve `dynamic = "force-dynamic"` unless a separate cache audit justifies change.
- Reference surfaces:
  - use `HabitPerfectDayHub` for collapsed add/details pattern and action-first rows,
  - use `DrylandMicroPlanPanel` for segmented mode/filter discipline and management separation,
  - adapt Goals data into these patterns rather than copying unrelated markup.
- TypeScript/domain contracts:
  - keep `GoalView`, `GoalPrimaryAction`, `GOALS_ACTIVE_LIMIT`, and existing goal status values as the contract,
  - prefer local render helpers over changing goal schema or persisted values,
  - preserve deterministic parsing for result inputs.
- Supabase/data layer:
  - no migration, generated DB type update, RLS change, or index change expected,
  - if implementation discovers a required schema change, stop and refresh scope before coding it.
- External services/tools:
  - no external service or SDK changes expected,
  - do not change contact/coaching intake storage unless owner explicitly expands scope.
- UI system:
  - use existing Tailwind/My Library primitives and compact cards/rows,
  - avoid adding nested card hierarchy,
  - use labelled buttons/disclosures, stable dimensions, and mobile-safe wrapping,
  - screenshot handoff is required before `npm run verify:pre-pr`.
- Testing:
  - update focused unit/component tests for `GoalsHub`,
  - update e2e training-context bridge tests if link placement changes,
  - capture visual evidence before broad verification.

## Data Placement And Sync Contract

- Server-canonical:
  - goal id, user id, title, type, source, target fields, progress value, status, achieved/celebrated timestamps,
  - training focus/note records created from existing `/my-library/training` flows.
- Local-only/transient:
  - active filter,
  - `Details` expanded/collapsed state,
  - `Add goal` expanded/collapsed state,
  - result input drafts before submit,
  - pending/error/notice state.
- Sync policy:
  - creates use existing `POST /api/goals`,
  - refresh uses existing `GET /api/goals`,
  - log/reset/archive/restore/celebrate use existing `PATCH /api/goals/[goalId]`,
  - server response is authoritative for updating visible goal state,
  - failed writes preserve the last confirmed visible goal and show recoverable feedback.
- Retention and sensitivity:
  - do not persist local disclosure/filter state,
  - do not log raw user-entered goal result values outside existing API behavior,
  - do not add third-party analytics or telemetry.
- Cache/invalidation:
  - route remains authenticated and dynamic,
  - goals API remains `no-store`,
  - mutation response and explicit refresh remain the invalidation path.

## Identity And Rename Contract

- Canonical stable ID:
  - goal `id` remains the source-of-truth identifier in storage, UI test ids, API routes, and training-context bridge URLs.
- Human-readable identifiers:
  - goal `title` remains a display label, not a route param or stable integration key.
- Mutability rules:
  - this slice does not add goal title editing or template renaming.
- Rename vs repurpose policy:
  - no goal rename/repurpose behavior changes in this slice.
- Compatibility contract:
  - existing goals, template goals, custom goals, archived goals, achieved goals, and legacy-read fallback continue to render.
- Observability and repair:
  - unresolved or failed goal reads/mutations keep existing console/error behavior and visible recovery messages.

## Scope

- Simplify `app/my-library/goals/page.tsx` header/container to support a compact list-first workspace.
- Refactor `components/my-library/goals/GoalsHub.tsx` presentation around:
  - one filter control,
  - one `Add goal` surface,
  - one visible primary action per goal,
  - `Details` for management/secondary actions,
  - less explanatory text.
- Preserve existing Goals API/domain behavior.
- Preserve training-context bridge URLs and behavior, even if links move behind `Details`.
- Keep `Request coaching schedule` as one secondary footer CTA that points to `/contact?source=goals_coaching`.
- Update targeted tests for the new action/filter/details contract.
- Update support/user-flow docs if user-facing labels, action placement, or recovery guidance changes.
- Capture UI screenshot handoff before `verify:pre-pr`.

## Out Of Scope

- New goals database schema, migrations, generated DB types, RLS changes, or indexes.
- New API routes or new external services.
- New analytics dashboard, KPI persistence, reminders, notifications, streaks, or rewards.
- Redesigning My Training, Habits, Dryland, Generator Intake, Contact, or My Library landing beyond required compatibility updates.
- Changing `GOALS_ACTIVE_LIMIT`.
- Changing goal creation templates or target math unless a bug is discovered and scope is refreshed.
- Changing contact/coaching intake fields or admin message workflows.
- Moving `Request coaching schedule` into each goal card or goal `Details`.
- Moving or merging `/my-library/goals` into another route.

## Acceptance Criteria

1. `/my-library/goals` initial view is list-first: current goals, one filter control, and `Add goal` are visible without explanatory panels dominating the surface.
2. There is exactly one Goals filter control for `Active`, `Achieved`, `Archived`, and `All`.
3. Every goal card has at most one visible primary action plus a `Details` control.
4. `Use as focus`, `Add note`, `Archive`, `Restore`, `Clear best result`, and target metadata are not competing with the primary card action.
5. `Add goal` opens one consolidated add surface for templates/custom goals and keeps active-limit feedback inline.
6. `Request coaching schedule` appears once as a secondary footer CTA and keeps the existing `/contact?source=goals_coaching` destination.
7. Empty, active, achieved, archived, offline, error, retry, pending, celebration, and active-limit states remain understandable and recoverable.
8. Training-context bridge links still reach `/my-library/training?goalId=<id>&intent=focus|note` and preserve the existing prefill/highlight behavior.
9. Goal mutations remain server-confirmed through existing APIs; failed mutations do not hide or falsely advance a goal.
10. Keyboard and screen-reader users can operate filters, add goal, details, result input, and moved management actions.
11. No new dependency, migration, polling loop, extra authenticated fetch loop, or third-party telemetry is introduced.
12. Screenshot handoff is completed and approved or corrected before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

## Validation Plan

Planning-only validation for this draft:

- `npm run lint:briefs`

Implementation validation after scope approval:

- `npm run lint:briefs`
- targeted `GoalsHub` unit/component tests
- targeted e2e update for Goals -> My Training bridge if link placement changes
- route/label/support-surface sweep before broad gates
- screenshot handoff before `npm run verify:pre-pr`
- `npm run lint`
- `npm run typecheck`
- `npm run verify:pre-pr` after screenshot approval
- CI required checks green
- `npm run verify:pre-merge` before merge recommendation

## Manual QA Environments

- Local authenticated route:
  - `http://127.0.0.1:3000/my-library/goals`
- Compatibility routes:
  - `http://127.0.0.1:3000/my-library/training?goalId=<goal-id>&intent=focus`
  - `http://127.0.0.1:3000/my-library/training?goalId=<goal-id>&intent=note`
- Screenshot handoff:
  - before/after Goals desktop and mobile,
  - after/reference against Habits or Micro Sessions where practical,
  - include at least one populated active-goal state and one add/details state.

## Help / Guide Impact

Required if labels, action placement, or recovery behavior changes.

Check and update as needed:

- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- any Help/Guide assertions that describe Goals actions, My Training bridge links, add-goal flow, archive/restore behavior, or retry/recovery behavior.

If implementation only changes visual placement without changing supportable behavior, record an explicit no-change rationale in this brief before PR handoff.

## Route / Label / Support Surface Sweep

Run targeted sweep before broad gates for:

- `Goals`
- `Add goal`
- `Details`
- `Use as focus`
- `Add note`
- `Log result`
- `Clear best result`
- `Archive`
- `Restore`
- `Browse templates`
- `Open creator`
- `Request coaching schedule`
- `goals_coaching`
- `/my-library/goals`
- `/my-library/training?goalId`

Surfaces to check:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs where references could affect current support guidance

Initial audit evidence on `2026-05-16`:

- Primary product files exist:
  - `components/my-library/goals/GoalsHub.tsx`
  - `app/my-library/goals/page.tsx`
- Reference files exist:
  - `components/my-library/habits/HabitPerfectDayHub.tsx`
  - `components/my-library/dryland/DrylandMicroPlanPanel.tsx`
- Tests likely requiring updates:
  - `tests/unit/goals-hub.test.tsx`
  - `tests/e2e/my-library-training-context.spec.ts`
- Support/user-flow references likely requiring review:
  - `docs/user-flow-map.md`
  - `docs/runbooks/auth-account-support.md`

Implementation sweep evidence on `2026-05-16`:

- Identifiers searched:
  - `Goals`
  - `Add goal`
  - `Details`
  - `Use as focus`
  - `Add note`
  - `Log result`
  - `Clear best result`
  - `Archive`
  - `Restore`
  - `Browse templates`
  - `Open creator`
  - `Request coaching schedule`
  - `goals_coaching`
  - `/my-library/goals`
  - `/my-library/training?goalId`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - current active/planned task brief locations
- Fallout handled:
  - product/test copy moved from `Browse templates` and `Open creator` to `Add goal`,
  - support docs now point moved goal actions to `Details`,
  - incident runbook now opens `Details` before checking `Use as focus` / `Add note`,
  - remaining matches were either current intended labels, generated implementation references, or historical done-brief evidence not used for current support guidance.

## Screenshot Handoff Requirement

This is UI/layout work, so stop after targeted implementation QA and before `npm run verify:pre-pr`.

Required handoff:

- clickable `Screenshot artifacts` folder under `output/goals-action-first-simplification-YYYY-MM-DD-HHMMSS`,
- `Captured: YYYY-MM-DD HH:MM` in local time,
- `2-4` representative screenshots,
- filenames that make comparison explicit:
  - `before-goals-desktop.*`
  - `after-goals-desktop.*`
  - `before-goals-mobile.*`
  - `after-goals-mobile.*`
  - optional `reference-habits-mobile.*` or `reference-micro-sessions-mobile.*`,
- state clearly whether each set is `before/after` or `after/reference`,
- note any remaining visual judgment call.

If any product-rendering files, styles, assets, or export HTML change after capture, regenerate screenshots before continuing.

## Checkpoint Log

- `2026-05-16` - Created planned scope-review draft from owner audit. `main` is clean at `475c946`; existing in-progress briefs are stale `revise-before-use` and not used. Implementation has not started. Next: owner confirms pending coaching-link decision and approves or edits scope; then move this brief to `in-progress`, refresh audit to `ready`, implement, capture screenshot handoff, and pause for visual approval before `verify:pre-pr`.
- `2026-05-16` - Owner locked scope with coaching retained as one secondary footer CTA on `/my-library/goals`, preserving `/contact?source=goals_coaching` and excluding Contact/admin intake changes. Audit status updated to `ready`; implementation has not started. Next: wait for explicit implementation instruction, then move brief to `in-progress`, implement scoped UI/tests/docs, capture screenshot handoff, and pause for visual approval before `verify:pre-pr`.
- `2026-05-16` - Implementation started after explicit owner instruction. Created branch `goals-action-first-simplification`, moved this brief to `in-progress`, and kept the screenshot approval stop before `verify:pre-pr`. Next: implement Goals UI simplification, update targeted tests/docs, run targeted validation, then capture screenshot handoff.
- `2026-05-16` - Implemented the scoped Goals UI simplification in `GoalsHub` and `/my-library/goals`: compact header, one filter control, consolidated `Add goal`, row primary action plus `Details`, and footer-only coaching CTA. Updated targeted unit/e2e expectations plus `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and `docs/runbooks/core-flow-incident-response.md`.
- `2026-05-16` - Validation so far: `./node_modules/.bin/vitest run tests/unit/goals-hub.test.tsx` PASS; `npm run lint` PASS; `npm run typecheck` PASS; `npm run lint:briefs:all` PASS. Targeted route/label/support sweep completed; current stale `Browse templates` / `Open creator` / moved-action support wording was either updated or confirmed historical/unrelated. Targeted Playwright `npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium` exited `0` but skipped all 4 tests because local dev-login/Supabase test config returned an HTML auth response instead of JSON; full authenticated browser coverage remains for the normal pre-PR/CI gates.
- `2026-05-16` - Owner explicitly waived the screenshot approval stop and approved merge when done. Adjusted the visible goal-card primary action buttons from dark slate to the same blue primary action style used elsewhere in Goals; reran `./node_modules/.bin/vitest run tests/unit/goals-hub.test.tsx` PASS. Next: run `npm run verify:pre-pr`, commit/push, open PR, monitor CI, run `npm run verify:pre-merge`, then merge if gates stay green.
- `2026-05-16` - `npm run verify:pre-pr` PASS on the full public lane: lint/quality gates/admin audit/env parity/generated PR-body lint/lint/typecheck/unit/build/perf/e2e completed; Playwright reported `84 passed`, `408 skipped`. Perf budget trend recommended tightening one stretch target after consecutive green runs; hold/defer for this Goals UI slice and record as separate performance-governance follow-up if owner wants to tune budgets next.
