# Task Brief: Micro Sessions Mobile Execution V2 (10/10)

## Metadata

- `id`: `2026-05-08-micro-sessions-mobile-execution-v2-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-09`

## Goal

Turn Micro Sessions into a mobile-first execution experience where one set is one completion unit, with a calm ordered mode and an optional rewarding game mode using the same underlying data.

## Product Decision

Micro Sessions V2 should make small dryland work easy and rewarding to finish on mobile. The first step is composition: the user must be able to select one or more saved Dryland Sessions and build one weekly Micro Session from them without duplicating the source sessions. A dryland exercise with `5` sets should then create `5` tappable units. Example: `Hang ups`, `5` sets, `20` reps creates five units labelled `Hang ups 20`.

- The creation surface should say `Select sessions` / `Create micro session`, not imply that a single saved session is being duplicated.
- The source list must make clear that `blocks` are generated work units from selected sessions, while the saved Dryland Sessions list remains the source library.
- A Micro Session can combine multiple saved dryland sessions, for example three strength/stretching sessions in one week plan.
- A quick manual session can be added to Micro Sessions from the Quick Session builder; if it is unsaved, save-and-add once, otherwise reference the existing saved session.
- Source dryland sessions are not duplicated when added to a Micro Session.
- Release/unlock scheduling belongs to Micro Sessions and bubbles only. Saved Swim Sessions and Dryland Sessions remain open in the library; full-session planning belongs to a future calendar/week-plan workflow.
- Micro Sessions can use release modes: `available now`, `weekday release`, or `manual release`.
- The default multi-session weekly pattern should distribute source sessions across sensible training days, for example `Mon/Wed/Fri` for three strength sessions.
- Catch-up behavior must keep unfinished earlier units visible before newly released units, for example Monday units before Wednesday units.
- Users can override the schedule with `Release now` / `Move to today` so release pacing supports autonomy instead of hard locking.
- Ordered mode is the default because it is fast, accessible, predictable, and testable.
- Game mode is optional and experimental: floating set buttons can animate away when completed.
- Audio/haptics are opt-in and muted by default.
- Motion must respect `prefers-reduced-motion`.
- Full stats, habits, streaks, and dashboards are deferred to the Training Stats And Habits Foundation brief.

## Dependencies And Reference Surfaces

- Must follow Micro Sessions readiness:
  - `docs/task-briefs/planned/2026-05-08-micro-sessions-production-readiness-10-10.md`
- Shipped references:
  - `docs/task-briefs/done/2026-05-07-micro-sessions-exercise-level-completion-10-10.md`
  - `docs/task-briefs/done/2026-05-08-dryland-library-ia-visual-polish-10-10.md`
- Current code references:
  - `components/my-library/dryland/DrylandMicroPlanPanel.tsx`
  - `lib/dryland/micro-plans.ts`
  - `app/api/my-library/dryland/micro-plans/route.ts`
  - `app/api/my-library/dryland/micro-plans/[planId]/route.ts`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                  | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Micro Sessions V2 clearly supports multi-session composition, release-paced micro units/bubbles, and quick set-level dryland execution without replacing full Dryland Sessions or future habit dashboards.          | IA review + owner QA + screenshot handoff           | `5/5`                   |
| UX flow clarity                               | `target`     | User can select one or more source sessions, understand source vs micro work units, choose release pacing, switch between ordered/game modes, complete one set at a time, undo, skip, and finish without ambiguity. | Playwright mobile flow + component tests            | `5/5`                   |
| Visual design quality                         | `target`     | Ordered pills and game units are polished, responsive, legible, stable, and consistent with updated My Library/dryland visual language.                                                                             | before/after mobile + desktop screenshots           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Multi-session composition, quick-session save-and-add, set-unit generation, completion, undo, skip, progress math, and migration from exercise blocks are deterministic and backwards-compatible.                   | domain tests + API tests + migration tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing My Library execution mode and does not change admin editors or publishing flows.                                                                                                  | explicit scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Ordered mode is fully keyboard/screen-reader usable; game mode has equivalent accessible controls and respects reduced motion/mute preferences.                                                                     | a11y assertions + Playwright keyboard/mobile checks | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Animations add no heavy dependency, do not bloat `/my-library/dryland`, and remain smooth on mobile with bounded unit counts.                                                                                       | dependency diff + perf/build budget + mobile QA     | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Set units are server-canonical within the micro plan snapshot; local animation state never becomes business truth.                                                                                                  | data-boundary review + tests                        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Completion updates refresh/invalidate active micro plan state and never show stale completed units after server confirmation.                                                                                       | route/cache review + e2e refresh coverage           | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed completion/undo/skip keeps the set unit recoverable, avoids duplicate completion, and gives retryable feedback.                                                                                              | negative-path tests + manual latency/failure QA     | `5/5`                   |
| Security and authz                            | `target`     | APIs remain authenticated, owner-scoped, and validate unit ids/status transitions.                                                                                                                                  | API negative-path tests                             | `5/5`                   |
| Privacy and compliance                        | `target`     | Labels, completion events, haptic/audio preferences, and logs avoid unnecessary personal detail and stay private.                                                                                                   | code/log review + preference persistence review     | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: set labels come from dryland session snapshots and must remain readable even if source sessions change.                                                                                            | model review                                        | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, admin CRUD, moderation, or operator content workflow is introduced.                                                                                                                  | explicit scope rationale                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is authenticated/private My Library UI and no public metadata, sitemap, robots, or crawlable page changes.                                                                                         | explicit scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable pages or structured data are introduced.                                                                                                                                      | explicit scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: persist fields needed for later stats; full analytics taxonomy and dashboards belong to the stats/habits foundation brief.                                                                         | explicit deferred analytics contract                | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because execution modes do not change pricing, checkout, subscriptions, entitlements, refunds, payouts, or revenue operations.                                                                                  | explicit scope rationale                            | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose stuck units, failed mutations, disabled animations/audio, and migration compatibility issues.                                                                                                  | support-surface review + runbook/help note          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance, payout, subscription, entitlement, invoice, or reconciliation impact.                                                                                                        | explicit scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels and completion copy remain structurally localizable, but no locale routing or translation system ships here.                                                                                | copy review                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React/Tailwind/CSS animation primitives; avoid new animation/audio dependencies unless explicitly justified.                                                                                           | dependency diff + architecture review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/API/component/e2e/screenshot coverage protects set-unit generation, mode switching, completion, undo, skip, reduced motion, and mobile UI.                                                                     | targeted tests + screenshot handoff + verify gates  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Unit count is bounded, animations are client-only presentation, and server writes happen only on explicit user actions.                                                                                             | unit-count guard + no-polling evidence              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Schema/data changes are migration-backed and V2 can be rolled back without losing V1-readable progress state.                                                                                                       | migration/rollback note + pre-pr/pre-merge gates    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse the existing dryland route and panel,
  - split ordered and game renderers behind one shared view-model,
  - keep server data loading in existing route boundaries and mutations in existing API routes.
- TypeScript/domain contracts:
  - model source session references separately from generated micro units,
  - add canonical set-unit types derived from dryland exercise snapshots,
  - support one micro plan containing units from multiple source dryland sessions,
  - define release status and completion status separately: `upcoming`/`available` for release pacing, plus `queued`, `completed`, `skipped`, and any transient local-only state for execution,
  - keep progress math pure and deterministic.
- Supabase/data layer:
  - decide whether V2 can store set units inside existing `blocks` JSON safely or needs an explicit schema migration,
  - preserve backwards compatibility for exercise-level V1 blocks,
  - update generated types if schema changes.
- UI system:
  - ordered mode uses stable row + pill layout,
  - game mode uses responsive bounded floating units, not random inaccessible chaos,
  - audio/haptic controls are opt-in and visible only where supported,
  - screenshot handoff is required with mobile as the primary viewport.
- Testing:
  - domain tests for unit generation from sets/reps/load,
  - migration/backwards-compat tests,
  - component tests for ordered/game mode,
  - e2e mobile flow,
  - screenshot handoff and full verification gates.

## Data Placement And Sync Contract

- Server-canonical:
  - selected source dryland session ids, source session snapshot metadata, release mode, release days/dates, set-unit ids, labels, reps/load/rest snapshot, source exercise id/index, release status, completion status, completed/skipped timestamps, and plan status.
- Local-only:
  - animation positions, burst/pop state, selected mode preference if non-sensitive, pending transition state before server confirmation.
- Sync policy:
  - selecting source sessions creates one micro plan snapshot and does not duplicate source dryland sessions,
  - quick-session `Add to micro session` saves the source session once if needed, then references that saved session,
  - release scheduling applies only to generated micro units/bubbles, not to the saved source sessions,
  - `available now`, `weekday release`, and `manual release` are explicit user choices,
  - unfinished earlier released units remain available as catch-up before newer units are emphasized,
  - each tap creates one explicit unit mutation,
  - server confirmation updates canonical progress,
  - failed writes revert or mark retry without playing a false success state.
- Conflict policy:
  - stale unit updates are rejected or reconciled deterministically,
  - multiple tabs must not duplicate completion.
- Retention and sensitivity:
  - set-level completion is personal training data,
  - audio/haptic preference is local or user preference data, not analytics truth.
- Cache/invalidation:
  - active plan is refreshed after each mutation or updated from the returned server payload.

## Identity And Rename Contract

- Canonical stable ID:
  - micro plan id, selected source session ids, source exercise ids, and each set-unit id are stable.
- Scheduling identifiers:
  - release schedule ids/dates are scheduling metadata and do not replace stable source or unit identity.
- Human-readable identifiers:
  - session titles and labels such as `Hang ups 20` are display snapshots, not identity.
- Mutability rules:
  - unit ids do not change when the display label is edited later,
  - source session edits do not silently rewrite active units.
- Rename vs repurpose policy:
  - materially different weekly training intent requires a new plan.
  - adding an existing saved session to a micro plan references the saved session; it must not clone or duplicate the source session.
- Compatibility contract:
  - existing V1 exercise blocks are read through or migrated safely to set units.
- Observability and repair:
  - invalid/stale unit ids are logged as safe diagnostics and surfaced as retryable UI.

## Scope

- Multi-session Micro Session composition from one or more saved Dryland Sessions.
- `Select sessions` / `Create micro session` UX that separates source sessions from generated micro work units.
- Quick Session builder entrypoint to `Add to micro session`, with save-and-add behavior only when the quick session is not already saved.
- Release scheduling for Micro Sessions and bubbles: `available now`, `weekday release`, `manual release`, catch-up, and user override.
- Set-based completion units for Micro Sessions.
- Ordered mobile execution mode with collapsible/reflowing set pills.
- Optional game mode with floating set units and rewarding completion animation.
- Undo and skip for each set unit.
- Reduced motion, mute, and opt-in audio/haptic behavior.
- Backwards compatibility for existing V1 micro plans.

## Out Of Scope

- Full stats dashboards.
- Habit tracker, streaks, weekly consistency analytics, and long-term trends.
- Push/email/SMS/calendar/wearable reminders.
- Release/unlock behavior for normal saved Swim Sessions or Dryland Sessions.
- Full-session calendar planning; saved sessions can later be scheduled as whole sessions in the calendar/week-plan brief.
- Leaderboards, social sharing, or competitive mechanics.
- New top-level route unless the brief is explicitly amended.

## Acceptance Criteria

1. User can select one or more saved Dryland Sessions and create one Micro Session from the selected sources.
2. Adding sessions to Micro Sessions does not duplicate saved Dryland Sessions.
3. Quick Session builder can add the current quick session to Micro Sessions; unsaved quick sessions are saved once before being referenced.
4. The UI clearly separates source sessions from generated micro work units and does not use ambiguous `block` copy for source sessions.
5. Release pacing applies only to Micro Sessions and bubbles; saved full sessions remain open from the library.
6. User can choose `available now`, `weekday release`, or `manual release` when creating a micro plan.
7. Three selected strength sessions can default to a sensible weekly distribution, for example `Mon/Wed/Fri`, while still allowing user override.
8. Unfinished earlier units stay visible as catch-up before newly released units are emphasized.
9. A `5 x 20` exercise produces five completion units labelled clearly, for example `Hang ups 20`.
10. Ordered mode is the default and works well on mobile.
11. Completing a pill removes/collapses it and reflows remaining units toward the exercise text.
12. Game mode renders the same units as tappable floating buttons and plays a non-blocking completion animation.
13. Audio/haptics are opt-in and muted by default.
14. Reduced-motion users get a calm equivalent.
15. Undo and skip work per unit.
16. Progress is deterministic and server-confirmed.
17. Existing V1 plans remain readable.
18. Screenshot handoff covers session selection, release pacing, ordered/game, mobile/desktop, reduced-motion, complete, partial, and failure states.

## Validation

- `npm run lint:briefs`
- targeted domain/unit tests for set-unit generation and progress
- targeted component tests for ordered/game renderers
- targeted API tests for unit status transitions
- targeted Playwright mobile flow
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local mobile viewport.
- Vercel preview mobile viewport.
- Owner device if audio/haptic support is included.

## Help / Guide Impact

Update Help/Guide or runbook copy if user-facing workflow labels, mode names, or recovery behavior change. Closeout must state exact update or explicit N/A rationale.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `Micro Sessions`, `Select sessions`, `Create micro session`, `Add to micro session`, `block`, `complete`, `skip`, `undo`, `ordered`, `game`, `available now`, `weekday release`, `manual release`, `Release now`, `Move to today`, `/my-library/dryland`, and support docs before broad verification.

## Checkpoint Log

- `2026-05-08` - Planned after owner proposed set-based balloons/buttons for Micro Sessions on mobile. Next: execute only after production readiness confirms V1 is active in the target environment.
- `2026-05-08` - Added owner clarification: V2 must support selecting multiple saved Dryland Sessions into one Micro Session, must not duplicate source sessions, must explain source sessions vs generated micro work units clearly, and must allow Quick Session builder sessions to be added through save-and-add semantics. Next: keep this as a V2 product gate before ordered/game execution polish.
- `2026-05-09` - Added release/unlock scheduling decision: release pacing applies only to Micro Sessions and bubbles, not saved Swim/Dryland Sessions; full sessions remain open in the library and belong to future calendar/week-plan planning when scheduled. V2 must support `available now`, `weekday release`, `manual release`, catch-up priority for unfinished earlier units, and user override such as `Release now` / `Move to today`. Next: keep this as a product gate for V2 implementation.
