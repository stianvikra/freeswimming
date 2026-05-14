# Task Brief: Micro Bubble Timer And Readability Polish (10/10)

## Metadata

- `id`: `2026-05-14-micro-bubble-timer-readability-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-14`
- `updated`: `2026-05-14`
- `execution mode`: `end-to-end implementation after owner explicitly approved the scoped follow-up`

## Goal

Make Micro Session bubbles clearer and more trustworthy by fixing timed-bubble completion labels, adding a short early-completion timeout, improving default bubble text readability, and making different exercises visually distinct without changing existing server-confirmed completion semantics.

## Product Decision

This is a narrow follow-up to `docs/task-briefs/done/2026-05-14-habits-row-polish-and-micro-bubble-timers-10-10.md`.

Audit outcome before implementation:

- Reps/count bubbles already use the whole bubble as the click target.
- Reps/count bubbles already show `Complete?` after first click and disappear after server-confirmed completion.
- Failed completion already keeps the bubble visible with an error.
- Timed bubbles currently use `Done?` / `Done`, which is inconsistent with the bubble completion model.
- Timed early-completion confirmation currently remains armed until user action or `Escape`, instead of timing out and resuming countdown.
- Timed bubbles already auto-complete at `0` through the existing owner-scoped server mutation and are removed after success.
- Bubble colors currently derive from a direct name hash and can collide, so different exercise names may show the same tone in the same plan.

Locked behavior:

- Leave normal reps/count bubble completion behavior unchanged.
- Timed bubbles use `Complete?` for early confirmation.
- Timed bubbles do not show a final `Done` state.
- If the user taps a running timed bubble early, the bubble pauses and shows `Complete?`.
- If the user does not confirm within about `1` second, the bubble resumes the countdown from the remaining time.
- If the user confirms, completion uses the existing server-confirmed mutation and the bubble disappears after success.
- If the timer reaches `0`, it auto-completes through the same existing server-confirmed mutation and the bubble disappears after success.
- If the server/network fails, keep the bubble visible and recoverable; do not show false completion.
- Increase default bubble title and target text by about `15%` to improve readability without adding a new preference toggle.
- Keep repeated sets of the same exercise on the same bubble tone.
- Give different exercise names unique bubble tones before any tone is reused.

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
- Stack-fit and dependency discipline

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                              | Evidence                                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Micro bubble execution remains a direct task surface; timed completion aligns with reps/count completion and no management flow is introduced.                                  | component audit + screenshot handoff                                             | `5/5`                   |
| UX flow clarity                               | `target`     | Users see `Complete?` as the only confirmation prompt; timed early confirmation either completes on second tap or resumes countdown after about `1` second.                     | component tests + screenshot review                                              | `5/5`                   |
| Visual design quality                         | `target`     | Bubble title/target text is about `15%` larger, different exercise names use distinct tones before reuse, and mobile wrapping/spacing preserve the existing bubble language.    | before/after screenshots                                                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Completion remains server-canonical; no local-only completion, offline queue, duplicate write, or false-success path is introduced.                                             | code review + targeted tests                                                     | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated user Micro Session execution UI, not admin editing, publishing, moderation, or operator CRUD.                                            | explicit admin scope rationale                                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Whole-bubble button semantics, accessible names, keyboard activation, `Escape` cancel, visible focus, and confirmation labels remain clear.                                     | Testing Library assertions + screenshot review                                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency or route payload growth; countdown still uses one active interval and one short confirmation timeout at most.                                                     | dependency diff + code review                                                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Micro-plan blocks and completion remain server-canonical; active timer, confirm timeout, and presentation text sizing remain local-only UI state/style.                         | data-boundary review                                                             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing mutation response continues to refresh/apply the plan snapshot; no route cache or invalidation contract changes.                                      | updateBlock/applyPlanState review                                                | `4/5`                   |
| Reliability and failure handling              | `target`     | Failed completion keeps the bubble visible; early confirm timeout resumes the countdown; auto-complete at zero remains deterministic and recoverable.                           | negative-path and timer tests                                                    | `5/5`                   |
| Security and authz                            | `target`     | No client-only bypass is introduced; protected owner-scoped Micro Session PATCH route remains the only completion truth.                                                        | no API contract change + existing route tests remain valid                       | `5/5`                   |
| Privacy and compliance                        | `target`     | No new analytics/log payloads, local storage, offline queue, or sensitive exercise notes are added.                                                                             | diff review                                                                      | `5/5`                   |
| Content governance                            | `target`     | User-facing labels use one consistent completion term: `Complete?`; docs/support references are swept if label behavior changes.                                                | route/label/support sweep                                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin role, support console, admin mutation, or operator editability workflow.                                                                      | explicit admin workflow scope rationale                                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Micro Sessions are authenticated/private and no public metadata, robots, sitemap, canonical, or crawlable content changes.                                          | explicit private-route rationale                                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this creates no public AI-discoverable route, structured data, public docs page, or crawl-safe entity surface.                                                      | explicit private-route rationale                                                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no event taxonomy, KPI dashboard, tracking call, or persisted analytics payload.                                                                 | explicit analytics scope rationale                                               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no checkout, entitlement, subscription, refund, pricing, payout, invoice, or revenue operation.                                                        | explicit commerce scope rationale                                                | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs remain accurate for timed bubbles, early confirmation, auto-completion, failed completion, and undo/retry behavior.                                                | `docs/runbooks/auth-account-support.md` review/update or explicit no-change note | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because private Micro Session execution UI has no finance, payout, refund, entitlement, invoice, subscription, reporting export, or reconciliation impact.                  | explicit finance scope rationale                                                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels remain short and locale-ready: `Start`, countdown, `Complete?`, `Saving...`, and error/retry copy avoid grammar-coupled strings.                                         | copy review + component assertions                                               | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `DrylandMicroPlanPanel`, existing Micro Session PATCH flow, Tailwind/UI primitives, and current test stack; add no dependency.                                            | no-dependency diff + architecture review                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Component tests cover timed labels, early confirmation timeout, auto-completion, failed completion, and existing reps/count behavior; screenshot handoff covers mobile bubbles. | targeted Vitest + screenshot handoff + later `verify:pre-pr`/`verify:pre-merge`  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | No polling, offline write queue, persisted timer stream, or extra server call is added; only one active timer and one confirmation timeout can run.                             | code review                                                                      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration or config change; rollback is a scoped UI/component/test/docs revert.                                                                                              | diff review + gate logs                                                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface is `components/my-library/dryland/DrylandMicroPlanPanel.tsx`.
  - Keep route boundaries unchanged: `/my-library/dryland?view=micro`.
  - Keep server-canonical completion through the existing Micro Session PATCH path.
  - Use client state only for active bubble, countdown, early-confirm timeout, and transient pending/error UI.
- TypeScript/domain contracts:
  - Reuse existing `DrylandMicroBlockStatus`, `DrylandMicroPlanRecord`, `BubbleTimerState`, and `UnitView` contracts.
  - Do not add persisted timer/completion fields.
  - Early confirm timeout must not change completion truth.
- Supabase/data layer:
  - No migration, generated types, RLS, storage, or schema drift change.
- External services:
  - No PWA background sync, push notification, offline queue, analytics vendor, or external integration.
- UI system:
  - Use existing bubble button markup, tone classes, ring/focus states, and Tailwind sizing.
  - Keep whole-bubble click/keyboard target.
  - Default text grows about `15%`; no new readability toggle in this slice.
  - Assign bubble tones per plan so repeated sets share a tone and different exercise names avoid same-tone collisions until the palette is exhausted.
  - Screenshot handoff comparison type is before/after for Micro Sessions bubbles where practical.
- Testing:
  - Targeted component tests for reps/count unchanged behavior, timed labels, early confirm timeout, auto-completion, and failure behavior.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data:
  - Micro-plan identity, block status, completion/skipped timestamps, progress, and undoable completion facts through existing API response snapshots.
- Local-only data:
  - Active bubble id.
  - Countdown remaining seconds.
  - Timer started/paused state.
  - Early `Complete?` confirmation state and timeout.
  - Pending/error/success presentation.
  - Text size CSS classes.
  - Per-plan presentation-only bubble tone assignment.
- Sync policy:
  - Completion becomes truth only after successful existing Micro Session PATCH response.
  - Timed auto-completion at zero calls the same PATCH path.
  - Early confirmation calls the same PATCH path only after second tap/keyboard confirmation.
  - Failed completion leaves the bubble visible with recoverable error feedback.
- Conflict policy:
  - If the unit is already completed elsewhere, the response snapshot removes/demotes the bubble.
  - If the browser loses network, do not mark durable success locally; show the existing error/retry state.
- Retention and sensitivity:
  - No new persisted local queue, raw exercise notes, analytics payloads, or logs.
- Cache/invalidation:
  - No route cache change.
  - Existing mutation response applies the refreshed plan snapshot.

## Identity And Rename Contract

- Canonical stable ID:
  - Micro-plan/block identity remains the existing block id used by the PATCH route.
- Human-readable identifiers:
  - Exercise title, target label, `Start`, countdown, `Complete?`, and `Saving...` are display-only labels.
- Mutability rules:
  - This slice changes presentation and transient timer confirmation only.
  - No block, saved session, exercise, or plan identity is renamed or repurposed.
- Compatibility contract:
  - Existing timed and reps/count bubbles remain readable and completable.
  - Existing undo behavior remains valid after completed bubbles disappear.
- Observability and repair:
  - Existing support diagnostics distinguish failed PATCH/completion from local timer interruption without adding new telemetry.

## Scope

- `components/my-library/dryland/DrylandMicroPlanPanel.tsx`
- `tests/unit/dryland-micro-plan-panel.test.tsx`
- `docs/runbooks/auth-account-support.md` and `docs/user-flow-map.md` only if label/support sweep shows wording drift.
- This in-progress brief.

## Out Of Scope

- Offline completion queue or PWA background sync.
- Persistent timers, pause/resume across reloads, haptics, sound, notifications, widgets, or native app behavior.
- New large-text/readability preference toggle.
- Reworking bubble layout, progress math, undo model, dryland session builder, Habits, Home, navigation, admin, or API routes.
- Schema, migration, generated DB types, RLS, external services, analytics, or dependencies.
- Merge without explicit owner approval.

## Acceptance Criteria

1. Reps/count bubbles keep existing whole-bubble `Complete?` two-step behavior.
2. Reps/count bubbles still disappear only after server-confirmed completion.
3. Failed reps/count or timed completion keeps the bubble visible with recoverable error feedback.
4. Timed bubbles show `Start` before countdown starts.
5. Timed bubbles show countdown while running.
6. Tapping a running timed bubble early shows `Complete?`, not `Done?`.
7. If early `Complete?` is not confirmed within about `1` second, the timed bubble returns to countdown and continues from the remaining time.
8. Confirming timed `Complete?` uses the existing server-confirmed completion mutation and removes the bubble after success.
9. Timed bubbles do not show a terminal `Done` label.
10. Timer reaching `0` still auto-completes through the existing server-confirmed mutation and removes the bubble after success.
11. Bubble title/target text is about `15%` larger and still fits representative mobile bubble names.
12. Repeated sets of the same exercise share the same bubble tone.
13. Different exercise names use different bubble tones before palette reuse.
14. Whole-bubble click target, keyboard `Enter`/space, and `Escape` cancellation remain supported.
15. No new dependency, migration, offline queue, or analytics payload is added.
16. Screenshot handoff covers mobile bubbles before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run lint:briefs:all`
- `git diff --check`

Screenshot gate:

- Required because this changes user-facing UI text, sizing, and bubble tones.
- Capture against `http://127.0.0.1:3000`.
- Use `after/reference` screenshots where practical:
  - `reference-micro-bubble-timer-running-mobile.png`
  - `reference-micro-bubble-reps-confirm-mobile.png`
  - `after-micro-bubbles-mobile.png`
  - `after-micro-bubbles-distinct-colors-mobile.png`
  - `after-micro-bubbles-timed-complete-confirm-mobile.png`
  - `after-micro-bubbles-timed-confirm-timeout-mobile.png`
- Stop for owner approval before `npm run verify:pre-pr`.

After screenshot approval:

- `npm run verify:pre-pr`
- commit, push, open/update PR
- monitor CI
- `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/dryland?view=micro`
- Viewports:
  - mobile phone width first,
  - desktop if the text size change has obvious desktop effect.
- QA scenarios:
  - reps/count bubble first tap, second tap, failed completion path,
  - timed bubble start,
  - timed bubble early `Complete?`,
  - early confirm timeout returning to countdown,
  - timed auto-complete at `0`,
  - larger text with representative names such as `Stabilizing Push-Ups`.

## Help / Guide Impact

Route/label/support sweep required because this changes a workflow label from `Done?` to `Complete?` and adjusts timed-bubble recovery behavior.

Expected docs impact:

- Update support/user-flow wording if it names timed early completion as `Done?`.
- If existing docs are already generic enough after the code change, record explicit no-change rationale in the checkpoint log.

## Route / Label / Support Surface Sweep

Identifiers searched:

- `Done?`
- `Done`
- `Complete?`
- `Start`
- `Saving...`
- `countdown`
- `timer`
- `Bubbles`
- `Micro Sessions`
- `/my-library/dryland`

Surfaces checked:

- `components/my-library/dryland/`
- `tests/unit/dryland-micro-plan-panel.test.tsx`
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- relevant task briefs.

Fallout handled:

- Updated active product/test/docs references to `Complete?` and the `1` second timed early-confirm recovery.
- Left historical `Done?` references in the closed #702 brief unchanged because they document prior shipped scope rather than current user-facing behavior.

## Checkpoint Log

- `2026-05-14 | audit | started from clean `main` after #702/#703; initial owner question asked whether normal bubbles already disappear and whether offline queue should be included; audit found reps/count bubbles already work as intended, timed labels/timeout need a small fix, and offline queue should wait for a dedicated PWA/offline data strategy slice | validation: targeted dryland micro panel Vitest PASS before edits | next: implement only timed-bubble label/timeout and 15% default readability polish, leaving reps/count completion semantics untouched`
- `2026-05-14 | implemented + targeted validation | changed only `DrylandMicroPlanPanel`, the dryland micro panel component test, user-flow map, support runbook, and this brief; timed bubbles now use `Complete?`, never a terminal `Done`label, resume countdown after an unconfirmed early`Complete?`timeout, and keep server-confirmed completion as the only truth; bubble title/target text grew about 15%; bubble tones are assigned per plan so repeated sets share a tone and different exercise names get a distinct tone before reuse; reps/count bubble behavior remains covered and unchanged | route-label/support sweep searched`Done?`, `Done`, `Complete?`, `Start`, `Saving...`, `countdown`, `timer`, `Bubbles`, `Micro Sessions`, and `/my-library/dryland`across component, tests, user-flow map, support runbook, in-progress brief, and prior done brief; historical done-brief`Done?`mentions intentionally remain as closed-scope evidence | validation: targeted dryland micro panel Vitest PASS (19 tests),`npm run lint`PASS,`npm run typecheck`PASS,`npm run lint:briefs:all`PASS,`git diff --check`PASS | next: capture screenshot handoff and stop before`npm run verify:pre-pr``
- `2026-05-14 | screenshot-ready | regenerated after/reference mobile screenshots after the color correction in `output/micro-bubble-timer-readability-20260514-124325`; capture-only preview route and capture script were removed after artifact generation, and no scoped product-rendering files changed after capture | validation: targeted dryland micro panel Vitest PASS (19 tests), `npm run lint`PASS,`npm run typecheck`PASS,`npm run lint:briefs:all`PASS,`git diff --check`PASS | next: owner screenshot approval before`npm run verify:pre-pr``
