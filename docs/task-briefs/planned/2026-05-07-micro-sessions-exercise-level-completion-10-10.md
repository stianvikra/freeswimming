# Task Brief: Micro Sessions Exercise-Level Completion (10/10)

## Metadata

- `id`: `2026-05-07-micro-sessions-exercise-level-completion-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Draft Status

This brief is a draft planning artifact until execution starts. Before implementation, the owner and assistant must review and finalize scope, UX decisions, data/storage decisions, acceptance criteria, validation gates, scorecard targets, and execution order. Move the brief to `in-progress` only after that final pre-start review is complete.

## Goal

Let a signed-in user split a saved dryland strength or stretching session into small exercise-level blocks, complete those blocks across a week, and see clear progress from `0-100%` without needing to finish the full session in one workout.

## Product Decision

This should be implemented after Manual Dryland Simple Sessions.

- V1 should focus on a healthy habit loop, not manipulative addiction mechanics.
- V1 progress should be simple and explainable: percentage is based on completed micro blocks, not complex reps/load math.
- V1 should support week-based plans before clock-based reminders.
- V1 should not send push notifications.
- V1 should not require a full Home personalization system, but it should expose a future-compatible "continue micro plan" state that the Home brief can later surface.

## Dependencies And Reference Surfaces

- Recommended prerequisite:
  - `docs/task-briefs/planned/2026-05-07-manual-dryland-simple-sessions-10-10.md`
- Existing dryland foundation:
  - `docs/task-briefs/done/2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10.md`
  - `docs/task-briefs/done/2026-05-05-dryland-build-execute-ergonomics-v2-10-10.md`
- Existing dryland code:
  - `lib/dryland/shared.ts`
  - `lib/dryland/server.ts`
  - `components/my-library/dryland/DrylandBuilderHub.tsx`
  - `components/my-library/dryland/DrylandSessionEditor.tsx`
  - `app/my-library/dryland/page.tsx`
  - `app/my-library/dryland/[sessionId]/page.tsx`
- Future related brief:
  - `docs/task-briefs/planned/2026-05-07-home-personalization-and-training-reminders-10-10.md`

## V1 Behavior Contract

- A micro plan starts from one saved dryland session.
- A micro plan snapshots the selected exercise blocks so source session edits do not silently rewrite an active week.
- Default duration is one calendar week in the user's locale/timezone.
- A micro block is one exercise block by default.
- Completion percentage is `completed blocks / total blocks`.
- The UI may also show `3/8 blocks complete`.
- Blocks can be marked `complete`, `not complete`, and optionally `skipped` if skipped is represented honestly and not counted as completed.
- Ufinished blocks remain visible until the plan ends; whether they roll over must be explicit.
- Recovery/rest must not be treated as failure.
- The implementation must avoid shame copy, aggressive streak loss, or pressure to overtrain.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                    | Evidence                                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Micro Sessions has a distinct job: complete small dryland blocks over a week, not replace the full dryland builder or swim-session builder.                           | IA review + screenshot handoff + owner QA notes              | `5/5`                   |
| UX flow clarity                               | `target`     | User can create, continue, complete, pause, and understand a micro plan with one obvious next action and no dead-end states.                                          | Playwright flow + manual QA                                  | `5/5`                   |
| Visual design quality                         | `target`     | Progress, block list, and completion controls are compact, calm, responsive, and consistent with My Library visual language.                                          | before/after or after/reference screenshot handoff           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Completion percent is deterministic, source-session snapshots are stable, repeated completion actions are idempotent, and edits do not silently corrupt active plans. | domain tests + API route tests + e2e completion flow         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing My Library training flow and does not change admin editors, publishing, or operator CRUD.                                           | explicit scope rationale                                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Progress and completion controls are keyboard reachable, labelled, screen-reader understandable, and do not rely on color alone.                                      | component tests + Playwright/a11y smoke                      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Micro plan surfaces add no heavy dependency, no polling, and keep `/my-library/dryland` responsive with bounded payload size.                                         | dependency diff + payload/build review + perf gate           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical micro plan state, local optimistic UI, retry behavior, conflict handling, and source-session snapshot rules are explicit.                            | data-boundary review + tests                                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Micro plan reads use predictable freshness and mutations invalidate or refresh affected dryland/micro surfaces without stale progress.                                | route/cache review + e2e refresh coverage                    | `5/5`                   |
| Reliability and failure handling              | `target`     | Offline/latency/save failure keeps progress recoverable, avoids duplicate completions, and shows retryable errors without claiming false completion.                  | negative-path tests + manual failure-state QA                | `5/5`                   |
| Security and authz                            | `target`     | Micro plan APIs are authenticated, owner-scoped, fail closed, and reject attempts to attach another user's dryland session or micro plan.                             | route negative-path tests                                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Exercise completion history remains private, logs/events avoid sensitive notes/load details, and future reminders require consent boundaries.                         | code/log review + privacy note                               | `5/5`                   |
| Content governance                            | `target`     | Source dryland session snapshots, micro block labels, and future generated plan labels have a clear source-of-truth and rollback path.                                | model review + tests                                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin-managed micro-session content or operator workflow is introduced.                                                                                | explicit scope rationale                                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Micro Sessions are authenticated/private and no public route metadata, sitemap, robots, or crawlable pages are changed.                                   | explicit scope rationale                                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice creates no public AI-discoverable pages, public structured data, or AI-generated training content.                                             | explicit scope rationale                                     | `N/A`                   |
| Analytics and KPI observability               | `target`     | If analytics events are added, they must use safe payloads and answer habit-loop questions such as plan started, block completed, plan completed, plan abandoned.     | event taxonomy review or explicit no-event defer note        | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because Micro Sessions do not change checkout, pricing, subscriptions, entitlements, refunds, payouts, or revenue recognition.                                    | explicit scope rationale                                     | `N/A`                   |
| Incident response and support operations      | `target`     | Support-visible failure modes, recovery behavior, and troubleshooting paths are documented if new APIs/storage are added.                                             | Help/Guide/runbook impact review + support sweep             | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance, payout, reconciliation, subscription, entitlement, or reporting data impact.                                                   | explicit scope rationale                                     | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: time/week/progress copy should be structurally localizable later, but no locale routing or translation system ships in this slice.                   | copy/timezone review                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, Supabase, TypeScript, Tailwind, and test stack; add no scheduling, notification, or gamification dependency in V1.                              | dependency diff + architecture review                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/domain/API/e2e coverage protects plan creation, snapshotting, completion, progress math, authz, retries, and visual states.                                      | targeted Vitest + targeted Playwright + full verify gates    | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Data model avoids high-write polling and keeps weekly plan updates bounded to explicit user actions.                                                                  | persistence review + no-polling evidence                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Any migration is explicit, typed, RLS-reviewed, and rollback-documented; feature can be hidden or reverted without corrupting existing dryland sessions.              | migration/no-migration review + rollback note + verify gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse dryland route boundaries before creating a new top-level route,
  - keep server components responsible for auth/data loading,
  - keep interactive completion controls in client components,
  - decide whether micro plans live under `/my-library/dryland` or a child route only after checking current route complexity.
- TypeScript/domain contracts:
  - define canonical micro plan and micro block types,
  - define exact progress math in a pure helper,
  - make completion idempotent,
  - represent skipped/deferred blocks explicitly if included.
- Supabase/data layer:
  - this likely requires a migration unless a safe existing persistence contract already exists,
  - use owner-scoped RLS,
  - include indexes for owner, active status, week start, and source dryland session where relevant,
  - update generated DB types,
  - add authz negative-path tests.
- External services:
  - no push, email, SMS, calendar, or wearable integration in V1.
- UI system:
  - reuse My Library/dryland visual language,
  - show progress as text plus accessible visual meter,
  - avoid aggressive streak UI or shame copy,
  - screenshot handoff is required.
- Testing:
  - pure progress math tests,
  - API route tests,
  - component tests for progress and block controls,
  - Playwright flow for create/continue/complete/reopen,
  - full pre-PR and pre-merge gates.

## Data Placement And Sync Contract

- Server-canonical:
  - micro plan `id`, owner, source dryland session id, status, week start/end, timezone basis, block snapshot, block completion state, created/updated timestamps.
- Local-only:
  - temporary optimistic completion state before server confirmation,
  - open/collapsed block UI state,
  - unsaved filter or view state,
  - pending retry notice.
- Sync policy:
  - explicit user actions create/update completion,
  - completion mutations are idempotent,
  - failed completion returns to last confirmed state or clearly marks retry pending,
  - no background polling in V1.
- Conflict policy:
  - source session edits do not mutate an active micro plan automatically,
  - active plan may offer "refresh from source" only if the behavior is explicit and tested.
- Retention and sensitivity:
  - completion history is personal training data,
  - no raw notes/load/timing in logs/events without explicit review,
  - deletion/cleanup behavior must be documented.
- Cache/invalidation:
  - authenticated reads should be dynamic or explicitly invalidated after mutation,
  - progress shown after completion must reflect server-confirmed state.

## Identity And Rename Contract

- Canonical stable ID:
  - each micro plan needs a stable server-generated `id`,
  - each micro block needs a stable block id within the plan.
- Human-readable identifiers:
  - plan title and block titles are editable display/snapshot labels, not identity.
- Mutability rules:
  - active plan labels may be edited only if that does not rewrite source dryland sessions,
  - source dryland session changes do not silently repurpose active micro plans.
- Rename vs repurpose policy:
  - edit a plan in place for the same weekly training intent,
  - create a new plan when the source session or weekly goal meaningfully changes.
- Compatibility contract:
  - block snapshots remain readable even if the original dryland exercise changes or is deleted.
- Observability and repair:
  - unresolved source-session references degrade to a readable snapshot state and safe support logs.

## Scope

- Create/continue/complete one active micro plan from a saved dryland strength or stretching session.
- Show block-level completion and `0-100%` progress.
- Use week-based plan duration.
- Provide calm return/continue states inside My Library/dryland.
- Add persistence and RLS only if needed for durable completion.
- Add tests for progress math, authz, persistence, and UI flow.

## Out Of Scope

- Push notifications.
- Clock-time reminders.
- Email/SMS reminders.
- Wearables or calendar integration.
- Replacing the full Home layout.
- Full Home personalization widgets.
- Advanced reps/load-based progress weighting.
- AI-generated micro plans.
- Social sharing, leaderboards, competitive streaks, or shame-based retention mechanics.
- Program planner integration unless explicitly added in a later brief.
- Commerce, entitlement, or pricing changes.

## Acceptance Criteria

1. User can create a micro plan from a saved dryland session.
2. Micro plan snapshots the selected exercise blocks.
3. User can complete individual blocks across the week.
4. Progress displays `0-100%` and a count such as `3/8 complete`.
5. Percentage math is deterministic and covered by tests.
6. Source-session edits do not silently corrupt active micro plans.
7. Authz prevents access to another user's plans or source dryland sessions.
8. Failed completion/save states are recoverable.
9. Copy supports healthy habit formation without aggressive pressure.
10. Screenshot handoff covers active, empty, partial, complete, and mobile states.

## Validation

- `npm run lint:briefs`
- targeted unit tests for micro plan domain/progress helpers
- targeted API route tests for authz, create, update, and invalid payloads
- targeted component tests for progress and completion controls
- targeted Playwright flow for create/continue/complete/reopen
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA And Screenshot Handoff

Required because this is UI work.

- Capture after/reference screenshots comparing Micro Sessions to the current dryland reference surface.
- Required states:
  - no active micro plan,
  - active plan with `0%`,
  - partial plan,
  - complete plan,
  - mobile active plan.
- Owner screenshot approval is required before `verify:pre-pr`, PR creation, and merge-readiness handoff.

## Help / Guide Impact

This changes user workflow behavior.

- Update Help/Guide assertions, `docs/user-flow-map.md`, and runbook/support notes if new labels, recovery states, APIs, or route surfaces are introduced.
- If no support docs are changed, record explicit no-impact rationale with route/label/support sweep evidence.

## Route, Label, And Support-Surface Sweep

Required before `verify:pre-pr`.

Search at minimum:

- `dryland`
- `micro`
- `Micro Sessions`
- `complete`
- `progress`
- `week`
- `/my-library/dryland`
- `api/my-library/dryland`

## Execution Notes

- Start from clean `main`.
- Move this brief to `in-progress` when implementation starts.
- Reassess whether Manual Dryland Simple Sessions has shipped before execution.
- If persistence design is larger than expected, split a schema/data child brief before UI implementation.
- Do not implement Home personalization or push reminders in this PR.

## Checkpoint Log

- `2026-05-07 | planned | created after owner proposed breaking strength/stretching work into micro exercises with 0-100% completion over a week | next: wait until manual simple dryland path is selected or shipped`
