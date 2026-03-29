# Task Brief: Dryland Builder Foundation For Strength And Stretching (10/10)

## Metadata

- `id`: `2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-29`
- `updated`: `2026-03-29`

## Goal

Ship a clean first dryland builder foundation in My Library so the owner can create, save, reopen, and execute simple `Strength` and `Stretching` sessions with trustworthy UX before deeper history/progression work starts.

## Why This Brief Exists

- The current swim-session builder is now good enough to pause for fresh live testing later in the day.
- A new dryland track is more valuable right now than more speculative swim polish because it can be used personally during platform development.
- The requested dryland experience is materially different from swim sessions:
  - exercise-bank driven,
  - set/reps/hold/rest based,
  - optional load tracking,
  - execution-oriented series completion,
  - later progression/history and richer media support.
- This should not be forced into the swim workout schema because the underlying domain, UI, and progression logic are different enough to justify a separate canonical model.

## Dependencies And Boundaries

- Adjacent swim-builder work that remains paused-but-open:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Adjacent program-builder work that must not be reopened by this slice:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Existing My Library foundation:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-canonical-program-foundation-and-library-shell-10-10.md`
- Locked boundary decisions for this brief:
  - do not retrofit dryland into the swim `workouts` table,
  - do not implement a full progression dashboard or analytics system in the first slice,
  - do not add public marketing routes or SEO work,
  - do not add a media CMS/editor in the first slice,
  - do not reopen swim builder scope unless a shared reusable primitive clearly improves both tracks.

## Admin Notes Triage Disposition

Production admin notes reviewed against this scope on `2026-03-29`.

- Current open production notes do **not** contain a dryland-specific builder request.
- The current open workout-builder follow-ups remain owned by:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- The current open notes-ergonomics follow-ups remain owned by:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-27-admin-notes-ergonomics-multi-image-and-route-surface-followup-10-10.md`
- Disposition for this brief:
  - no existing production admin note is closed by this brief yet,
  - no currently open production admin note conflicts with this brief,
  - this brief is created from a new owner-directed product request rather than an unresolved production-note queue item.

## Product Direction

The dryland track should become a distinct My Library builder with two session kinds:

- `Strength session`
- `Stretching session`

The long-term product direction is:

1. `Foundation`
   - create/edit/save/delete dryland sessions,
   - exercise bank plus custom exercise entry,
   - sets/reps/hold/rest/load model,
   - optional session timing (`start`, `stop`, `actual duration`),
   - execution-friendly session view.
2. `Execution polish`
   - compact thumbnail/media treatment,
   - richer detail modal with larger image/video and instructions,
   - better completed-set interaction and recovery UX.
3. `History and progression`
   - reps/load/hold progression,
   - bodyweight-aware trends,
   - session-level history and development views.

This brief starts with `Foundation`, but the model and UI contract must leave room for `Execution polish` and `History and progression` without schema churn.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `/Users/stianvikra/freeswimming/docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in closeout:

- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Testing and QA automation
- UX flow clarity

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                  | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | My Library clearly separates `Swim session builder` and `Dryland builder`; dryland route clearly separates `Strength` and `Stretching`; no mixed mental models.     | route copy review + e2e route checks    | `5`                     |
| UX flow clarity                               | `target`     | Create/open/save/delete/continue flows are obvious; primary actions are visible; no dead-end create state; execution mode is understandable without explanation.    | unit + e2e + manual QA notes            | `5`                     |
| Visual design quality                         | `target`     | Builder feels native to current FreeSwimming visual language, with clear hierarchy, compact cards, and no placeholder-looking seams in the changed UI.              | screenshots + manual QA                 | `5`                     |
| Business logic correctness and data integrity | `target`     | Dryland session schema enforces valid strength/stretching set models; save/update/delete target canonical IDs only; no silent corruption of sets, rests, or timing. | unit tests + runtime guards             | `5`                     |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice is owner-facing My Library builder work, not an admin content/editor workflow.                                                               | scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Keyboard navigation, labels, focus order, toggle state, and modal/detail semantics work on changed dryland surfaces with no new serious/critical issues.            | e2e a11y checks + code review           | `5`                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: new route and builder UI should not meaningfully regress `/my-library`; no oversized media behavior in phase 1.                                    | perf budget run + bundle review         | `4`                     |
| Data placement and sync boundaries            | `target`     | Brief and implementation explicitly define what is server-canonical, what is local-only, and how execution/timing state syncs or stays transient.                   | brief contract + tests                  | `5`                     |
| Caching and invalidation strategy             | `target`     | Dryland list/editor reads use explicit freshness behavior and refresh deterministically after save/delete.                                                          | route review + e2e save/delete coverage | `5`                     |
| Reliability and failure handling              | `target`     | Failed save/delete/load/timer actions show recoverable errors; no frozen execution state; no unexpected `500` on normal bad input.                                  | negative-path tests + manual QA         | `5`                     |
| Security and authz                            | `target`     | Dryland APIs are user-scoped, fail closed on unauthenticated access, and validate inputs before persistence.                                                        | route tests + negative-path checks      | `5`                     |
| Privacy and compliance                        | `supporting` | Supporting only: no sensitive health data beyond owner-entered training notes/duration/load; UI and logs must avoid unnecessary disclosure.                         | code review + safe logging review       | `4`                     |
| Content governance                            | `target`     | Exercise-bank source of truth is explicit for phase 1; custom exercises are clearly user-authored and do not mutate the shared bank silently.                       | model review + tests                    | `5`                     |
| Admin workflow and editability                | `N/A`        | N/A because this slice introduces no admin workflow or publish-state operations.                                                                                    | scope rationale                         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/dryland` is authenticated/private and introduces no public crawl surface.                                                                  | scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice does not change public AI-discoverable routes or semantic public documentation.                                                              | scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: create/save/delete/start/stop interactions should remain loggable later, but deep KPI instrumentation is not phase-1 scope.                        | code review + event review              | `4`                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no entitlement, catalog, checkout, or revenue workflow changes here.                                                                                    | scope rationale                         | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: new builder route and failure states should be covered by runbook/help updates if labels or recovery patterns change materially.                   | runbook/help diff                       | `4`                     |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, refund, or reconciliation logic is changed.                                                                                         | scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A for this phase because labels are owner-only and the domain model will be kept locale-safe without building localization now.                                   | scope rationale                         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js/Supabase/current component patterns; add no new dependency unless it materially improves the builder and is justified in the PR.                      | dependency diff + architecture review   | `5`                     |
| Testing and QA automation                     | `target`     | Unit + e2e coverage protect create/save/delete, exercise add/remove, set editing, and timing flows; `verify:pre-pr` and `verify:pre-merge` pass before merge.       | test results + CI                       | `5`                     |
| Scalability and cost efficiency               | `supporting` | Supporting only: store compact JSON for phase-1 sessions and avoid media-fetch or per-keystroke persistence patterns that would scale poorly.                       | schema review + code review             | `4`                     |
| DevOps and rollback readiness                 | `target`     | Migration is explicit and reversible; route/UI changes are isolated so rollback is clear; no hidden schema drift.                                                   | migration review + verify results       | `5`                     |

## Data Placement And Sync Contract

- Server-canonical:
  - dryland session rows,
  - session type (`strength` / `stretching`),
  - title, description, focus,
  - exercise entries and set definitions,
  - optional actual duration/start-stop timestamps when explicitly saved,
  - session updated timestamps and owner scope.
- Local-only:
  - expanded/collapsed exercise detail state,
  - open/closed detail modal state,
  - transient execution toggles before save,
  - unsaved inline edits,
  - transient notices and confirmation dialogs.
- Sync policy:
  - create/save/delete mutate only after server confirmation,
  - editor draft remains local until save,
  - browse list and selected session refresh deterministically after mutation,
  - if execution-state persistence is deferred for a sub-flow, the UI must state that clearly rather than implying automatic history capture.
- Retention and sensitivity:
  - dryland sessions are owner-scoped personal training artifacts,
  - no cross-user sharing in phase 1,
  - no hidden background analytics of user-entered load or timing beyond standard product logging.
- Cache/invalidation:
  - list and selected session snapshots must invalidate after create/save/delete,
  - route/API responses should use no-store patterns consistent with the existing My Library builder flows.

## Identity And Rename Contract

- Canonical stable ID:
  - each dryland session gets a stable server-generated `id` and remains the only canonical identity across list, editor, and future history/progression.
- Human-readable identifiers:
  - title is editable display metadata and is never the canonical key,
  - exercise-bank labels are display labels and may evolve without changing persisted session identity.
- Mutability rules:
  - session title, description, focus, timing, and exercise content are editable in place,
  - session kind (`strength` / `stretching`) is intentionally editable only if the schema can safely normalize incompatible fields; otherwise it must be confirmed or blocked.
- Rename vs repurpose policy:
  - rename/edit a session in place when the workout intent is still the same training entry,
  - create a new session when the user is meaningfully starting over from scratch.
- Compatibility contract:
  - phase-1 exercise-bank items can be referenced by stable bank IDs plus snapshot labels in the saved session,
  - custom exercises remain durable even if the shared bank later changes.
- Observability and repair:
  - invalid/missing bank references must degrade gracefully to a `custom` or `legacy` display state instead of breaking the editor.

## Scope

- Introduce a distinct authenticated `Dryland builder` surface in My Library.
- Introduce two dryland session kinds:
  - `Strength session`
  - `Stretching session`
- Create a first canonical persistence layer for dryland sessions with:
  - title,
  - optional description,
  - optional focus,
  - exercise list,
  - set definitions,
  - optional actual duration / start-stop fields.
- Ship a first exercise bank in code with enough metadata to support:
  - compact list presentation,
  - a detail modal or detail sheet,
  - `how`,
  - `what it trains/touches`,
  - optional media slot for future image/video.
- Support custom exercises that the owner can add manually without mutating the shared bank.
- Support set-level authoring for:
  - strength: reps, optional weight/load, sets, rest,
  - stretching: hold duration, sets, rest.
- Support an execution-friendly right-side series representation that can be marked complete per set in the active session view.
- Support save/reopen/delete for dryland sessions.
- Support optional timing UX:
  - manual start,
  - manual stop,
  - persisted actual duration when chosen.
- Keep the first route and builder visually coherent with existing My Library design language.

## Out Of Scope

- Full progression dashboards or charts.
- Historical comparisons across many sessions.
- Automatic weight/reps trend recommendations.
- Rich media CMS or admin-managed exercise-bank editing.
- Cross-device live execution sync.
- Program-planner assignment of dryland sessions.
- Public-facing route or SEO work.
- PDF/export for dryland sessions in phase 1.

## Acceptance Criteria

1. My Library exposes a clear `Dryland builder` entry without confusing it with the swim-session builder.
2. The dryland route lets the owner create either a `Strength session` or a `Stretching session`.
3. A saved dryland session can be reopened, edited, and deleted from the same authenticated account.
4. The builder supports both:
   - selecting an exercise from the shared bank,
   - adding a custom exercise directly.
5. Strength exercises support editable series with reps, optional load, and rest.
6. Stretching exercises support editable series with hold duration and rest.
7. The active session view shows a compact execution representation for each set/series that can be toggled complete without confusing saved vs transient state.
8. The builder supports optional timing capture so the owner can record how long the session actually took.
9. Errors on load/save/delete are visible, recoverable, and do not silently destroy in-progress edits.
10. The new route and builder pass local release gates for targeted tests and full `verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- `npx vitest run <relevant dryland unit tests>`
- `npx playwright test <relevant dryland e2e tests> --project=desktop-chromium`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite (Required)

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local release gates for this slice should run through existing repo scripts and Playwright setup.

## Manual QA Environments

- Local environment:
  - `http://127.0.0.1:3100`
  - Desktop Chromium first for rapid validation.
- Vercel preview:
  - required before merge because this is user-facing My Library workflow UI.
- Recommended manual QA focus later:
  - Desktop Chrome
  - Desktop Safari/WebKit
  - iPad/tablet viewport

## Constraints

- Preserve current My Library visual language.
- Do not introduce a second hidden concept of “draft” that is not understandable in the UI.
- Do not depend on real image/video assets to make the first slice usable; the detail surface must still feel intentional without them.
- Keep the first dryland schema simple enough to migrate safely now and extend later.

## 10/10 Quality Bar (Required For User-Facing Work)

- Primary actions must be obvious:
  - create,
  - save,
  - reopen,
  - delete,
  - start/stop timing,
  - mark set complete.
- Empty state must explain what dryland builder is for and how it differs from swim sessions.
- Error state must keep the editor recoverable and never silently discard the session.
- The active builder should feel focused, not crowded.
- Compact exercise cards must be easy to scan and complete in live use.
- Detail modal/drawer content must explain the exercise in plain language without feeling like admin tooling.
- Strength and stretching terminology must be human-readable and operational, not schema-like.

## Implementation Phases

### Phase 1: Foundation (This Workstream)

- persisted dryland session schema,
- route and builder entry,
- strength/stretching session creation,
- exercise bank + custom exercise,
- save/reopen/delete,
- start/stop duration capture,
- first execution chips/toggles,
- detail modal with instructional text and future-media slot.

### Phase 2: Execution Polish

- richer per-set interaction,
- better completion-state visuals,
- stronger thumbnail/media treatment,
- smoother session-in-progress ergonomics.

### Phase 3: History And Progression

- session history,
- load/reps/hold trends,
- bodyweight-aware progression,
- clearer development views.

## Checkpoint Log

- `2026-03-29 | kickoff | opened a new dryland-builder brief after owner requested a separate builder for strength and stretching while pausing live swim-builder testing until later in the day | triaged current production admin notes and confirmed no current open prod note directly owns this dryland scope | next: implement phase-1 foundation as a distinct persisted My Library domain, not an extension of the swim workouts table`
- `2026-03-29 | branch fix/dryland-builder-foundation-2026-03-29 | implemented the first persisted dryland foundation: schema + server helpers + API routes + My Library dryland card + browse route + focused builder route + create buttons + set-completion editor + detail modal + optional start/stop timing + targeted unit/e2e coverage | evidence: npm run typecheck; npx vitest run tests/unit/create-manual-dryland-session-button.test.tsx tests/unit/dryland-routes.test.ts tests/unit/dryland-builder-hub.test.tsx; npx playwright test tests/e2e/my-library-dryland-builder.spec.ts --project=desktop-chromium | next: run full npm run verify:pre-pr, then assess PR-ready scope vs any follow-up polish`
- `2026-03-29 | verify:pre-pr green | full local gate passed on the dryland foundation slice with 90 passed / 276 skipped and no failing tests; repo-level lint:briefs still reports "No changed task briefs found" for newly added briefs, so lint:briefs:all remains the evidence path for the brief itself while the product slice uses the standard full gate | evidence: npm run verify:pre-pr | next: remove generated artifacts, commit the staged foundation slice, push branch, and open PR`
