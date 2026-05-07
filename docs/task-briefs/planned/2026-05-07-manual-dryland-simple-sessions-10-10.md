# Task Brief: Manual Dryland Simple Sessions (10/10)

## Metadata

- `id`: `2026-05-07-manual-dryland-simple-sessions-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Draft Status

This brief is a draft planning artifact until execution starts. Before implementation, the owner and assistant must review and finalize scope, UX decisions, data/storage decisions, acceptance criteria, validation gates, scorecard targets, and execution order. Move the brief to `in-progress` only after that final pre-start review is complete.

## Goal

Create a low-friction manual-only dryland session flow where a signed-in user can write their own strength or stretching exercises with sets, reps or hold time, save the session, and train it without needing to choose anything from the exercise bank.

## Product Decision

This is the recommended first slice before Micro Sessions.

- The existing dryland foundation already supports persisted strength/stretching sessions, custom exercises, an exercise bank, set completion, and timing.
- This brief should not create a second dryland domain.
- This brief should add a simpler manual-first path that hides or de-emphasizes the bank for users who only want to type exercises quickly.
- The exercise bank may remain available in the advanced builder, but the simple flow must not require choosing from it.

## Dependencies And Reference Surfaces

- Existing dryland foundation:
  - `docs/task-briefs/done/2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10.md`
  - `docs/task-briefs/done/2026-05-05-dryland-build-execute-ergonomics-v2-10-10.md`
- Existing dryland code surfaces:
  - `app/my-library/dryland/page.tsx`
  - `app/my-library/dryland/[sessionId]/page.tsx`
  - `components/my-library/dryland/DrylandBuilderHub.tsx`
  - `components/my-library/dryland/DrylandSessionEditor.tsx`
  - `components/my-library/dryland/CreateManualDrylandSessionButton.tsx`
  - `lib/dryland/shared.ts`
  - `lib/dryland/manual.ts`
  - `lib/dryland/server.ts`
- Existing tests:
  - `tests/unit/dryland-builder-hub.test.tsx`
  - `tests/unit/create-manual-dryland-session-button.test.tsx`
  - `tests/unit/dryland-routes.test.ts`
  - `tests/e2e/my-library-dryland-builder.spec.ts`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Simple manual dryland has a clear user job distinct from advanced bank-assisted building: type exercises, sets, reps or holds, then save/train.                             | route review + screenshot handoff + owner QA notes        | `5/5`                   |
| UX flow clarity                               | `target`     | A new or returning user can create a manual strength or stretching session in under 60 seconds without touching the exercise bank and with obvious next actions.            | Playwright create flow + manual QA timing note            | `5/5`                   |
| Visual design quality                         | `target`     | Changed dryland UI stays consistent with My Library, keeps compact controls readable on mobile and desktop, and avoids adding another crowded card stack.                   | before/after screenshot handoff                           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Manual exercises persist as custom exercise snapshots; strength and stretching fields normalize deterministically; invalid sets/reps/holds are rejected before persistence. | unit/domain tests + route negative-path tests             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing My Library dryland flow and does not change admin editors, publish queues, or admin CRUD.                                                 | explicit scope rationale                                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | All changed inputs/buttons have labels, keyboard order, visible focus, usable error text, and no serious/critical a11y issue on changed dryland surfaces.                   | Testing Library assertions + Playwright/a11y smoke        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new heavy dependency, media path, or polling; `/my-library` and `/my-library/dryland` should not materially regress.                                    | dependency diff + build/perf gate review                  | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical saved dryland session remains separate from local unsaved simple-form state, with explicit save/failure behavior.                                          | data-boundary review + component tests                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing dynamic/no-store dryland route behavior remains explicit and create/save/delete refreshes list/detail state without stale selected sessions.                       | route review + e2e create/save/delete coverage            | `5/5`                   |
| Reliability and failure handling              | `target`     | Save/load/delete/schema-missing failures are visible, recoverable, and do not destroy typed-in exercises.                                                                   | negative-path tests + manual failure-state QA             | `5/5`                   |
| Security and authz                            | `target`     | Dryland APIs remain fail-closed, authenticated, owner-scoped, and reject invalid payloads without leaking another user's data.                                              | route negative-path tests                                 | `5/5`                   |
| Privacy and compliance                        | `target`     | User-entered exercise names, notes, reps, loads, and timing remain private owner-scoped training data and are not copied into logs, analytics, or public docs.              | code/log review + privacy note in PR                      | `5/5`                   |
| Content governance                            | `target`     | Simple manual exercises do not mutate the code-owned exercise bank; bank content remains a separate source of truth.                                                        | model review + tests for custom exercise source           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin-managed exercise bank, moderation queue, or operator workflow is changed.                                                                              | explicit scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the changed dryland surfaces are authenticated My Library routes and no public metadata, sitemap, robots, or crawlable page changes are planned.                | explicit scope rationale                                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief creates no public AI-discoverable entity pages and no AI-generated dryland content.                                                                  | explicit scope rationale                                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: interactions should stay event-loggable later, but no new analytics taxonomy is required for this simple-session slice.                                    | code review + explicit defer note if no event work ships  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because manual dryland creation does not change pricing, entitlements, checkout, refunds, payouts, or revenue workflow.                                                 | explicit scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: changed labels or recovery behavior must update Help/Guide/runbook surfaces; otherwise record no-impact evidence.                                          | route/label/support sweep + PR notes                      | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance, reconciliation, payout, subscription, entitlement, or reporting data impact.                                                         | explicit scope rationale                                  | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: copy should remain concise and structurally localizable later, but no localization system or translated copy is implemented.                               | copy review                                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current Next.js, Supabase, Tailwind, dryland helpers, and test stack; add no dependency unless the brief is updated with explicit rationale.                          | dependency diff + architecture review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component/e2e coverage protects manual-only creation, validation, save, reopen, train, delete, and no-bank flow.                                                       | targeted Vitest + targeted Playwright + full verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: keep compact JSON session storage and avoid per-keystroke persistence, media processing, or polling.                                                       | persistence review                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Prefer no migration; if one is required it must be explicit, typed, RLS-reviewed, and rollback-documented. The UI-only version must be revertable by one PR revert.         | PR diff + migration/no-migration review + verify gates    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `/my-library/dryland` as the dryland browse route and `/my-library/dryland/[sessionId]` as the focused build/train route,
  - reuse `DrylandBuilderHub`, `DrylandSessionEditor`, and `CreateManualDrylandSessionButton` before adding new route-local components,
  - keep server components responsible for auth/data loading and client components responsible for local form/training state.
- TypeScript/domain contracts:
  - preserve canonical dryland types in `lib/dryland/shared.ts`,
  - manual-only exercises must use `source: "custom"`,
  - strength sets must preserve reps, optional load, and rest,
  - stretching sets must preserve hold duration and rest,
  - validation must reject empty exercise names, invalid set counts, invalid reps/holds, and unsafe payload shape.
- Supabase/data layer:
  - prefer no schema migration by reusing `dryland_sessions`,
  - if schema changes become necessary, add explicit migration, generated type updates, RLS review, and negative-path tests.
- External services:
  - no external services are expected.
- UI system:
  - preserve current My Library visual language,
  - the simple flow should use compact controls and stable responsive dimensions,
  - screenshot handoff is required because this is user-facing UI work.
- Testing:
  - update dryland unit/component tests,
  - update route negative-path tests if validation changes,
  - update targeted Playwright create/save/reopen/train/delete flow,
  - run full pre-PR and pre-merge gates before merge recommendation.

## Data Placement And Sync Contract

- Server-canonical:
  - `dryland_sessions.id`, owner, source kind, session kind, status, title, description, focus, exercises, sets, completion values, timing values, created/updated timestamps.
- Local-only:
  - unsaved typed exercise rows,
  - open editor state,
  - temporary validation errors,
  - pending create/save/delete state,
  - responsive UI disclosure state.
- Sync policy:
  - create/save/delete happens only after explicit user action,
  - no per-keystroke persistence,
  - failed save preserves typed content in the current client state,
  - successful save refreshes canonical list/detail state.
- Conflict policy:
  - no cross-device live editing in this slice,
  - stale or missing selected sessions should show a recoverable state rather than silently overwriting.
- Retention and sensitivity:
  - user-authored training details remain private owner-scoped data,
  - no raw notes/load/timing values in logs or analytics without explicit review.
- Cache/invalidation:
  - dryland pages stay dynamic,
  - API responses stay no-store,
  - mutations refresh the affected route/list.

## Identity And Rename Contract

- Canonical stable ID:
  - `dryland_sessions.id` remains the only canonical route and persistence identity.
- Human-readable identifiers:
  - session title and exercise titles are editable display fields, not identity.
- Mutability rules:
  - manual exercise content can be edited in place while it represents the same session,
  - changing between strength and stretching should create a new session unless a tested conversion flow exists.
- Rename vs repurpose policy:
  - edit in place for the same training intent,
  - create a new session when the user is meaningfully starting over.
- Compatibility contract:
  - custom exercises remain durable snapshots and never depend on future bank labels.
- Observability and repair:
  - invalid stored drafts should produce recoverable load errors and safe logs, not broken UI.

## Scope

- Add or refine a manual-only simple dryland creation/editing path.
- Keep the exercise bank out of the simple path.
- Support strength and stretching simple sessions.
- Support typed exercise name, set count, reps or hold duration, optional load, rest, and notes when useful.
- Preserve train mode and save/reopen/delete behavior.
- Update relevant dryland tests and docs/support surfaces if labels or recovery behavior change.

## Out Of Scope

- Micro Sessions or partial-week completion tracking.
- Push notifications, clock-based reminders, or Home personalization.
- Exercise bank expansion or admin-managed bank editing.
- Video/media CMS.
- AI-generated dryland sessions.
- Program assignment.
- Progress dashboards, streaks, charts, or PR history.
- Commerce, entitlement, or pricing changes.

## Acceptance Criteria

1. User can create a manual-only strength session without choosing from the bank.
2. User can create a manual-only stretching session without choosing from the bank.
3. User can type exercise names and set targets directly.
4. Strength rows support sets and reps, with optional load/rest if included.
5. Stretching rows support sets and hold duration, with optional rest if included.
6. The simple path remains visibly simpler than the advanced bank-assisted builder.
7. Saved sessions reopen with custom exercises intact.
8. Train mode can complete the saved manual exercises without data loss.
9. Save/load/delete failures are visible and recoverable.
10. Screenshot handoff confirms desktop and mobile states before PR gates.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/dryland-builder-hub.test.tsx tests/unit/create-manual-dryland-session-button.test.tsx tests/unit/dryland-routes.test.ts`
- `npx playwright test tests/e2e/my-library-dryland-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA And Screenshot Handoff

Required because this is UI work.

- Capture before/after screenshots for:
  - My Library dryland entrypoint,
  - simple manual creation/edit state,
  - saved/reopened train state,
  - mobile version of the simple flow.
- Owner screenshot approval is required before `verify:pre-pr`, PR creation, and merge-readiness handoff.

## Help / Guide Impact

This changes a user-facing dryland workflow.

- If labels, route descriptions, recovery language, or support-visible behavior change, update relevant Help/Guide assertions, `docs/user-flow-map.md`, and runbooks in the same PR.
- If implementation only adds a simple path without changing existing support contracts, record explicit no-impact rationale in the PR.

## Route, Label, And Support-Surface Sweep

Required before `verify:pre-pr` if labels/actions/recovery states change.

Search at minimum:

- `dryland`
- `Dryland Sessions`
- `Create strength session`
- `Create stretching session`
- `Add custom`
- `exercise bank`
- `/my-library/dryland`
- `api/my-library/dryland`

## Execution Notes

- Start from clean `main`.
- Move this brief to `in-progress` when implementation starts.
- Keep implementation scoped to dryland simple-session UX and validation.
- Do not implement Micro Sessions or Home personalization in this PR.

## Checkpoint Log

- `2026-05-07 | planned | created after owner requested manual dryland/strength simple sessions where users type exercises, reps, and sets without choosing from a bank | next: execute only when this becomes the selected product slice`
