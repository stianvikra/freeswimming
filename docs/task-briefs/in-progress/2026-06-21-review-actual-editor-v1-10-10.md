# Task Brief: Review Actual Editor V1 (10/10)

## Metadata

- `id`: `2026-06-21-review-actual-editor-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-21`
- `updated`: `2026-06-22`
- `mode`: `runtime child / implementation`
- `parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `calendar_parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `previous_child`: `docs/task-briefs/done/2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10.md`
- `garmin_send_boundary`: `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
- `garmin_receive_boundary`: `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@a417271c`
- `audit_status`: `revise-before-use`
- `decision`: Continue the current branch only after correcting the v1 granularity mismatch: Review Actual must keep the planned swim session read-only and provide an editable actual swim session at the same step/repeat granularity as the manual pool builder.
- `reason`: The first runtime passes edited only actual summary fields, then only displayed planned steps read-only. Owner review correctly caught that a swimmer expects `Review actual` to correct what was performed: stroke, repeat count, skipped/extra work, rest, distance/time, and target details. A 10/10 v1 must use the established swim-session builder semantics for the actual session while never mutating the plan/source workout.
- `must_refresh_before_execution_if`: Refresh if `completed_activity_events`, `planned_workout_instances`, Calendar selected-day rendering, workout/session contracts, Garmin/Strava/Apple/Health Connect official docs, TrainingPeaks sync/support behavior, Help/Guide contracts, scorecard categories, verification lanes, or route labels change before implementation starts.

## Goal

Enable a dedicated `Review actual` editor for manual swim actual history so users can correct what happened while seeing the planned swim session at the same step/repeat granularity it was built, while planned, actual, sent, received, and future provider evidence remain separate auditable truths.

## Pre-Implementation Owner Explanation

Codex skal bygge en egen redigeringsflate for faktisk utførte svømmeøkter. Det betyr at brukeren kan rette status, dato, starttid og notat, se planen slik den ble bygget, og redigere selve utførte øktens steps/repeats i samme type øktbygger som brukes for å lage svømmeøkter. Utenfor scope er Garmin/Strava/Apple Health/Health Connect-integrasjon, provider-import, automatisk provider-reconciliation, AI-retrospektiv, Perfect Day i Calendar, source-workout-revisjoner, performance-ratchet og `Ja.docx`.

## Current Repo State

- Calendar Plan shows manual actual rows as read-only plan-vs-actual overview.
- `Review actual` is enabled from Calendar selected-day detail for owner-scoped manual actual rows in this branch.
- `completed_activity_events` is the first actual-history storage layer for manual swim actuals.
- Existing `PATCH /api/my-library/calendar/planned-instances/[instanceId]/completion` corrects the server-canonical manual actual row and is now used by the dedicated editor route.
- Actual outcomes already include legacy alias `completed`, `completed_as_planned`, `completed_different`, `partial`, `completed_on_another_day`, `cancelled_as_actual`, and `needs_review`.
- Current runtime pass stores a separate `actual_session_snapshot` on manual actual history, initializes it from the planned/source workout where possible, shows planned steps read-only, and edits the actual session through the shared manual swim-session builder surface; screenshot handoff is pending owner approval before this branch can proceed to `npm run verify:pre-pr` and PR gates.
- Garmin send and Garmin received reconciliation remain blocked by partner/API facts and provider samples.

## Online Integration And Success-Pattern Audit

Checked on `2026-06-21`:

- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/
- Garmin Connect Developer Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Strava API reference and webhooks: https://developers.strava.com/docs/reference/ and https://developers.strava.com/docs/webhooks/
- Android Health Connect sync, permissions, data display, and testing:
  - https://developer.android.com/health-and-fitness/health-connect/sync-data
  - https://developer.android.com/health-and-fitness/health-connect/ui/permissions
  - https://developer.android.com/health-and-fitness/health-connect/ui/data
  - https://developer.android.com/health-and-fitness/health-connect/test/test-cases
- Apple Health and fitness platform overview: https://developer.apple.com/health-fitness/
- TrainingPeaks Garmin sync/support references:
  - https://help.trainingpeaks.com/hc/en-us/articles/204070854-How-to-Sync-Garmin-Connect-With-TrainingPeaks
  - https://help.trainingpeaks.com/hc/en-us/articles/204070864-Garmin-Connect-AutoSync-FAQ-and-tips-activities-workouts-and-daily-health-metrics
  - https://help.trainingpeaks.com/hc/en-us/articles/204070234-Why-is-there-a-difference-in-my-data-between-Garmin-Connect-and-TrainingPeaks

Interpretation for this brief:

- Garmin Training API is a planned-workout send path, not completion truth.
- Garmin Activity API is a received-activity evidence path after user consent and device sync; FIT files can carry detailed activity evidence and require provider-aware parsing later.
- Strava webhook events are lightweight change notifications; future Strava runtime must acknowledge quickly and process asynchronously.
- Health Connect guidance emphasizes app-owned source of truth, client-record identity/versioning, permission revocation handling, and clear data-source attribution.
- Apple Health positions health/workout data as permissioned user-controlled data.
- TrainingPeaks-style successful integrations distinguish completed activities, planned structured workouts, daily metrics, historical backfill, disconnect behavior, unsupported workout types, and data differences caused by device recording settings.

## Scope

- Enable the Calendar `Review actual` action for editable manual actual rows and route to a dedicated actual editor surface.
- Reuse existing Calendar/My Library design language while keeping Calendar itself read-only for actual rows.
- Show planned truth and actual truth side by side:
  - planned date and source workout/program labels,
  - planned distance/duration/context where available,
  - planned swim-session steps/repeats read-only using the established session step surface contract,
  - actual outcome, date, start time, bounded correction note,
  - editable actual swim-session steps/repeats using the established manual builder semantics, with actual distance/duration/context derived from the saved actual session draft where possible.
- Show source/evidence metadata:
  - `Manual` source badge in v1,
  - actual-history ID,
  - planned-instance link when present,
  - last updated timestamp,
  - provider-ready placeholder states without provider runtime.
- Let users update manual actual metadata and the performed-session draft through the existing owner-scoped correction contract.
- Preserve stale-write guard using actual-row `updated_at`.
- Keep source workout/program editing out of the editor; links may open source context for review only.
- Keep planned steps read-only, but make actual step-by-step correction part of v1. If Garmin or a user says the performed workout differed, the user must be able to correct the actual session instead of squeezing that into summary text.
- Keep unknown outcome/source/provider values in `needs_review` or unmapped states, excluded from completed/as-planned counts.
- Add support-visible recovery copy for stale, duplicate, missing planned reference, schema missing, unsupported outcome/source, and future provider mismatch states.
- Update docs/runbooks/help assertions that describe `Review actual`, Calendar actual rows, and future provider boundaries.
- Provide screenshot handoff before `npm run verify:pre-pr`.

## Explicit 10/10 Requirements

- Dedicated actual editor, not inline Calendar editing.
- Plan vs actual comparison remains visible before, during, and after edits.
- Planned session child structure is visible read-only when the source workout/session has steps/repeats; the actual session is editable at step/repeat granularity; a summary-only Review Actual screen cannot claim 10/10.
- Source badge is visible and separate from actual outcome.
- Manual actual edits mutate only actual-history fields, including the separate `actual_session_snapshot`.
- Actual step-level editing, repeat count changes, skipped/changed/extra performed work, rest, stroke, distance/time, target, and note corrections are included through the actual session builder surface.
- Detailed FIT/provider step evidence and automated provider reconciliation are deferred to a dedicated child and must not be implied by v1 controls.
- Planned instance, source workout, source program, Garmin send jobs, and future raw provider evidence are never mutated by this editor.
- Every save has loading, success, stale, validation, and retry states.
- Every protected read/write is owner-scoped and fail-closed.
- Unknown outcome/source/provider values have deterministic review copy and are excluded from completion totals.
- Form labels, status chips, and provider/source labels are display strings only, not identity.
- Screenshot handoff covers mobile and desktop before broad gates.
- Strict 10/10 mode: every target category in the scorecard must close at `5/5`; any target below `5/5` blocks a 10/10 claim and requires fix or explicit owner deferral.

## Out Of Scope

- Garmin OAuth, credentials, send jobs, Activity API ingestion, FIT parsing, webhooks, provider samples, or live provider calls.
- Strava API, Strava webhooks, activity upload, or Strava export/import runtime.
- Apple Health, Apple Watch, WorkoutKit, HealthKit, or iOS native sync runtime.
- Android Health Connect runtime, permission screens, on-device storage, or native integration.
- TrainingPeaks integration runtime.
- Raw provider evidence tables or reconciliation decisions beyond provider-ready display/contract placeholders.
- Editing canonical source workouts/programs from actual history.
- Automated Garmin/FIT/Strava/Apple/Health Connect step evidence matching, provider confidence scoring, or raw provider file inspection.
- Workout revision/versioning and `Save as new revision` vs `Update shared workout`.
- Automatic replanning after an actual differs from the plan.
- AI retrospective evaluation or coaching recommendations.
- Perfect Day Calendar layer.
- Finance/admin reporting mutation.
- Performance-ratchet tightening before at least two new green weekly cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical:
  - `completed_activity_events.id` as the actual-history ID,
  - owner ID,
  - planned instance reference when available,
  - workout/program references when available,
  - source kind (`manual` in v1),
  - actual outcome,
  - actual date via `completed_on`,
  - actual start timestamp,
  - actual duration seconds,
  - actual distance meters,
  - actual environment,
  - actual pool length/unit,
  - actual session snapshot (`actual_session_snapshot`) containing the corrected performed swim-session draft,
  - bounded correction note,
  - planned snapshot/reference payload,
  - `updated_at` for stale-write protection.
- Local-only:
  - unsaved form draft,
  - open/closed field groups,
  - transient success/error banner state,
  - return-to-Calendar URL/date/view intent.
- Sync behavior:
  - actual edits update actual-history only, including `actual_session_snapshot`;
  - actual distance, duration, environment, and pool length are derived from the corrected actual session draft when that draft is saved;
  - successful edits refresh editor data, Calendar selected-day state, Calendar comparison summaries, and future history views;
  - duplicate manual actual remains one row per planned instance in this slice;
  - stale saves are rejected and require refresh before retry;
  - future provider evidence may link/detach/ignore through reconciliation only, not through this v1 manual editor.
- Conflict policy:
  - unknown outcome/source/provider values fail closed to review/unmapped;
  - missing planned row shows support-safe orphan actual state if owner scope is valid;
  - provider/manual disagreement remains future `needs_review`;
  - actual edits cannot overwrite raw provider evidence once provider tables exist.
- Retention and sensitivity:
  - actual swim history is private personal training data;
  - notes are bounded and excluded from logs/events;
  - no raw Garmin/FIT/Strava/Apple/Health Connect payload belongs in this v1.
- Cache/invalidation:
  - private route should stay dynamic/no-store unless a later cached history surface adds explicit `revalidatePath`/tag invalidation;
  - mutation success must trigger route refresh or server invalidation for Calendar/history views.

## Identity And Rename Contract

- Canonical stable IDs:
  - actual-history ID: `completed_activity_events.id`,
  - planned occurrence ID: `planned_workout_instances.id`,
  - corrected actual session: `completed_activity_events.actual_session_snapshot`,
  - future provider activity IDs: foreign aliases only,
  - future provider send job IDs: foreign delivery aliases only.
- Human-readable identifiers:
  - workout title, program title, date labels, status labels, source badges, and action labels are presentation only.
- Mutability rules:
  - actual fields are editable through this editor when source is manual and row is owner-scoped;
  - planned fields must be edited only through planned-instance/calendar/program flows;
  - source workout/program changes must not rewrite existing actual evidence.
- Rename vs repurpose:
  - renaming workout/program preserves references;
  - materially repurposing a workout/program should create a new canonical entity before future actuals attach.
- Compatibility contract:
  - analytics, Calendar, future provider reconciliation, exports, and AI review resolve IDs and typed states, not labels.
- Observability and repair:
  - duplicate actuals, missing planned references, stale rows, schema drift, unknown source/outcome/provider, and future provider conflicts must be diagnosable through support copy/logs/tests.

## Domain Granularity Gate

- User's mental object:
  - a swim session as planned/built and then actually completed, not a summary completion event alone.
- Canonical objects:
  - planned occurrence: `planned_workout_instances.id`,
  - source swim workout/session: `workouts.id` plus the existing structured swim session payload or planned snapshot where available,
  - manual actual summary: `completed_activity_events.id`,
  - future provider evidence: deferred child objects owned by later reconciliation briefs.
- Detail-level decisions:
  - session summary: `view` and `edit` actual outcome/date/start/note in v1; duration/distance/context/pool derive from the actual session draft where possible,
  - planned session metadata: `view`,
  - planned steps/repeats: `view` read-only in v1, with no mutation,
  - actual per-step/repeat values: `edit` in v1 through the builder surface,
  - extra/skipped/changed performed work: `edit` in v1 by adding/removing/reordering actual steps/repeats and changing repeat counts,
  - source workout/program: `support-only` read context/links; no mutation,
  - provider sent/received/reconciled evidence: `support-only` placeholders/future review states; no mutation.
- Mature reference surface:
  - `docs/design/session-step-surface-contract.md`,
  - manual pool session builder as the reference for swim-session `View`, `Edit`, and `Rearrange` semantics.
- 10/10 implication:
  - this branch cannot proceed to `npm run verify:pre-pr`, PR creation, or a 10/10 claim until tests and screenshot handoff show planned step/repeat breakdown read-only and actual step/repeat editing using the builder surface.

## Provider-Ready Future Integration Contract

Future provider integrations are not part of v1, but v1 must leave room for:

- Garmin Activity API: provider activity alias, FIT/GPX/TCX file reference, sync/backfill status, attribution requirement, and received evidence link to actual history only through reconciliation.
- Garmin Training API: local send job ID, planned references, payload snapshot/fingerprint, provider aliases if returned, and send status that never counts as completion.
- Strava: external activity ID, webhook event status (`create`, `update`, `delete`), async processing state, and `external_id`/fingerprint if FreeSwimming later uploads activity files.
- Apple Health / Apple Watch: user-authorized workout sample/source metadata, app/device source attribution, and permission revoked/insufficient-access state.
- Android Health Connect: source app attribution, client record ID/version-style mapping, sync paused/resumed/revoked state, and on-device permission failure handling.
- TrainingPeaks-style success behavior: separate completed activities, planned workouts, daily metrics, historical backfill, visible sync status, waiting/backfill copy, unsupported-workout copy, and data-difference explanations.

Provider-ready fields and UI copy in v1 must be generic and inactive unless backed by canonical v1 data. Do not create fake connected-provider states.

## User-Success Feature Requirements

- `Review actual` entry from Calendar must preserve return context.
- The editor must explain the difference between plan and actual through layout, not instructional walls of text.
- Save button must be disabled only when invalid or saving; validation errors must point to the affected field.
- Numeric fields must accept empty/unknown as valid when outcome allows unknown.
- `Partly done`, `Changed`, `Another day`, `Cancelled actual`, and `Review needed` must have distinct visible outcomes.
- Source badge must read `Manual` in v1 and be ready for provider labels later.
- `Last updated` or equivalent audit cue must be visible enough for stale-write support.
- Missing or unsupported provider/source states must not look like a successful manual actual.
- The page must work on mobile as a first-class editing surface, not only desktop.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/calendar` selected-day detail as the entrypoint and reference surface;
  - reuse `docs/design/session-step-surface-contract.md` and the manual pool session builder as the planned swim-step reference surface;
  - add a dedicated actual review route or detail surface under My Library rather than editing in Calendar month cells;
  - keep server components responsible for owner-scoped load where practical;
  - keep client form state local and submit to typed API/action boundary.
- TypeScript/domain:
  - reuse and extend `lib/my-library/completed-activity-events.ts` outcome/source normalization;
  - load or derive planned step/repeat structure from canonical workout/session data or a planned snapshot when available;
  - keep typed allowlists for outcome, source, environment, pool unit, and provider placeholders;
  - unknown values fail closed to review/unmapped states;
  - absence of structured planned steps is explicit empty/unsupported planned-detail state, not a silent summary-only downgrade.
- Supabase/data:
  - use an explicit additive `actual_session_snapshot jsonb` migration on `completed_activity_events`;
  - keep generated type updates, owner-scoped RLS/authz, and negative-path tests in the same branch;
  - preserve unique manual actual guard for planned-instance completion in this slice.
- External services:
  - no SDK or live external service call in v1;
  - official docs above define future integration constraints only;
  - no secrets, provider tokens, or raw provider payloads in repo or logs.
- UI system:
  - reuse My Library/Calendar primitives, status chips, action density, and form controls;
  - adapt planned steps/repeats into a read-only session-step display and reuse the existing `WorkoutEditor`/session-step builder surface for actual-session editing before creating new swim-step markup;
  - no nested-card clutter;
  - all field labels and buttons must fit at mobile and desktop widths;
  - screenshot handoff is required.
- Testing:
  - route/action tests for owner scope, stale writes, validation, unknown values, duplicate/missing rows, schema-missing paths;
  - component tests for entrypoint, planned step/repeat read-only rendering, actual session step/repeat editing payload, form validation, source badge, plan-vs-actual layout, disabled/loading/error states, and accessibility names;
  - e2e/screenshot coverage for mobile and desktop if the route is visually changed.

## Codex Skill / Stack Readiness Radar

Capability audit:

- Available now: local shell tools, repo validation scripts, existing TypeScript/Supabase/Next patterns, `playwright` skill for screenshots.
- Available now: official web docs for Garmin, Strava, Health Connect, Apple Health, and TrainingPeaks support behavior as planning sources.
- Not available/needed now: Garmin credentials, Strava app credentials, Apple developer/native runtime setup, Android native Health Connect runtime, external provider samples.

Systemic findings:

| Surface            | Finding                                                                                                                            | Severity | Recommended Type                 | Owner Decision Needed                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------- |
| Actual editor      | Calendar intentionally stopped at read-only actual overview; a dedicated editor is now the next integrity step.                    | `high`   | `bounded implementation child`   | `no`                                                    |
| Provider readiness | Successful integrations separate planned send, completed receive, source attribution, sync status, backfill, and mismatch support. | `high`   | `bounded implementation child`   | `no for v1 contract; yes before provider runtime`       |
| Workout revisions  | Editing source workout/program from actual history is unsafe until the workout data-contract brief decides revision semantics.     | `high`   | `deferred architecture decision` | `yes before source-workout editing from actual history` |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Calendar parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Previous child: `docs/task-briefs/done/2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10.md`

## Forward Compatibility Contract

- Extensibility surfaces:
  - actual outcome states,
  - source kinds,
  - provider labels,
  - planned session step/repeat labels and stable child identifiers where available,
  - future actual-step statuses,
  - provider aliases,
  - sync statuses,
  - review actions,
  - Calendar status labels,
  - analytics payload values,
  - export formats,
  - locales.
- Source of truth:
  - planned truth derives from `planned_workout_instances`;
  - manual actual truth derives from `completed_activity_events`;
  - future sent truth derives from provider send jobs;
  - future received truth derives from provider evidence tables;
  - source labels derive from typed source mapping, not free-form row labels.
- Additive behavior:
  - new manual actual rows with known outcome/source values appear in editor/Calendar/history views;
  - new planned step/repeat structures render read-only when the canonical session contract can adapt them;
  - new actual step/repeat structures stay editable when they can be represented by the canonical session draft contract;
  - new provider evidence stays hidden/review-only until explicitly mapped;
  - unknown labels render as review/unmapped without counting as completed.
- Explicit mapping requirements:
  - new outcomes, sources, planned child-level formats, actual session draft formats, provider step statuses, providers, provider file types, sync statuses, review actions, analytics events, or export formats require typed mapping, support copy, tests, and Help/Guide review.
- Unknown or deprecated values:
  - fail closed to `needs_review`/unmapped;
  - never count as completed/as-planned;
  - show support-safe recovery copy and diagnostic state.
- Test/evidence:
  - include future-source fixtures for `manual` plus unknown source/provider;
  - include planned step/repeat fixtures and proof that planned content is read-only while actual content is editable without summary-only assumptions;
  - include unknown outcome/source negative tests;
  - include route/label/support-surface sweep for `Review actual`, `Manual`, `Provider`, `sync`, `backfill`, `Garmin`, `Strava`, `Apple Health`, `Health Connect`, and `TrainingPeaks`.

## Quality Gate Evidence

- API/server failure-mode evidence:
  - no unexpected 500 is part of the route contract for expected user/data failures;
  - validation errors return bounded `400` responses;
  - stale writes return bounded `409` responses;
  - missing manual actual rows, missing planned references, unsupported source/outcome states, schema drift, and cross-user/unauthorized paths fail closed with bounded state/copy instead of leaking private data;
  - targeted route tests cover success, validation, stale-write, duplicate/manual guard, unknown source/outcome, schema-missing, and actual-session-draft payload paths.
- Route-label/support sweep evidence:
  - identifiers searched: `Review actual`, `Manual actual`, `Manual`, `Actual source`, `Provider`, `Garmin`, `Strava`, `Apple Health`, `Health Connect`, `TrainingPeaks`, `sync`, `backfill`, `needs_review`, `completed_activity_events`, `actual_session_snapshot`, `actualSessionDraft`, and `/my-library/calendar/actuals`;
  - surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, planned/in-progress/done task briefs, API contracts, and user-flow docs;
  - fallout handled in this slice: Calendar entrypoint, dedicated route, completion API contract, actual-session snapshot data contract, support runbook, user-flow map, focused unit tests, and active brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all target categories must close at `5/5`.

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
- Incident response and support operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                                                                                                         | Evidence                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can reach a dedicated `Review actual` editor from Calendar, see the planned session step/repeat structure read-only, edit the performed actual session at builder granularity, and understand planned vs actual vs source evidence without provider assumptions. | route map + component/e2e tests + screenshot handoff | `5/5`                   |
| UX flow clarity                               | `target`     | Editing actual metadata and actual session steps/repeats has clear save, cancel, stale, invalid, success, and retry states, while planned steps/repeats are visibly read-only.                                                                                         | component tests + manual QA + screenshot review      | `5/5`                   |
| Visual design quality                         | `target`     | Mobile and desktop editor reuse My Library/Calendar visual language, avoid nested cards, and have no text overflow or incoherent overlap.                                                                                                                              | responsive screenshot handoff                        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Actual edits update only actual-history metadata plus `actual_session_snapshot`, planned steps/repeats remain read-only, planned/source/provider boundaries are preserved, and duplicate/stale/unknown paths fail deterministically.                                   | route/domain invariant tests                         | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: no high-frequency admin CRUD is introduced, but support diagnostics must be readable for owner/admin troubleshooting.                                                                                                                                 | support-scope rationale + runbook review             | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Editor fields, source badge, plan-vs-actual sections, validation errors, and actions are keyboard/screen-reader usable with no serious/critical issues.                                                                                                                | component a11y assertions + e2e/keyboard QA          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library/calendar` and the new actual editor stay within existing route budgets and add no large client dependency.                                                                                                                                                | perf budget gate + package diff                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Local draft, server-canonical actual metadata/session snapshot, planned rows/steps, source workout/program, and future provider evidence ownership are explicit and tested.                                                                                            | data contract + mutation tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Successful saves refresh editor, Calendar, and comparison/history summaries predictably; cached future reads require explicit invalidation.                                                                                                                            | route/cache review + tests                           | `5/5`                   |
| Reliability and failure handling              | `target`     | Validation, stale writes, missing row, missing planned reference, schema drift, duplicate, unknown values, and unexpected DB failure have bounded recovery.                                                                                                            | negative-path tests                                  | `5/5`                   |
| Security and authz                            | `target`     | Anonymous and cross-user reads/writes fail closed and leak no private training data.                                                                                                                                                                                   | authz tests + RLS review if data changes             | `5/5`                   |
| Privacy and compliance                        | `target`     | Actual-history notes/measures are minimized, private, redacted from logs/events, and no raw provider data is stored in v1.                                                                                                                                             | payload/log review + tests                           | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program content stays upstream; actual editor preserves references and labels without becoming a content editor.                                                                                                                              | source contract review                               | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support may diagnose actual states, but no role-gated admin mutation workflow changes in v1.                                                                                                                                                          | support-scope rationale                              | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because actual training history is authenticated private data and this brief changes no public crawl route, sitemap, canonical, or metadata surface.                                                                                                               | explicit private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private actual-history data does not create public AI-discoverable content or structured public entities.                                                                                                                                                  | explicit private-data rationale                      | `N/A`                   |
| Analytics and KPI observability               | `target`     | Any edit/review events use stable safe taxonomy and do not double-count completions; if no events are added, rationale is explicit.                                                                                                                                    | event tests or no-new-event rationale                | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: actual-history editing does not mutate checkout, billing, entitlement, product catalog, or paid-access truth.                                                                                                                                         | commerce non-impact review                           | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose duplicate, stale, missing-ref, schema drift, unknown source/outcome, future provider mismatch, revoked provider access, and backfill states.                                                                                                      | runbook/support diagnostics                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not change revenue, refunds, payouts, invoices, entitlement reporting, accounting data, or finance reconciliation.                                                                                                                         | explicit finance non-scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Outcome/source/review/sync labels avoid identity coupling and tolerate translation expansion without mobile overflow.                                                                                                                                                  | copy contract + responsive tests                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js, TypeScript, Supabase/RLS, Calendar/My Library primitives, the session-step surface contract, and official external docs as future boundaries; add no unnecessary dependency.                                                                     | architecture review + package diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Include targeted route/domain/component/e2e/negative-path/screenshot coverage, including planned read-only fixtures and actual step/repeat edit payload tests, plus `verify:pre-pr`, CI, and `verify:pre-merge` when executed.                                         | validation outputs                                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Reads/writes are bounded by actual ID/planned ID and avoid provider backfill, raw-file parsing, N+1 Calendar reloads, or repeated heavy processing.                                                                                                                    | query review + tests                                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff is reversible; any migration is additive; rollback cannot corrupt planned rows, actual rows, or future provider evidence.                                                                                                                                         | migration/rollback notes + gates                     | `5/5`                   |

## Help/Guide And Support-Surface Impact

- Update `docs/runbooks/auth-account-support.md` for:
  - where `Review actual` lives,
  - how to diagnose stale saves,
  - why planned steps/repeats are visible read-only in v1,
  - why actual steps/repeats are editable through the performed-session builder,
  - how to distinguish manual actual from future provider evidence,
  - why source workout/program edits are not done from actual history.
- Update `docs/user-flow-map.md` if user-facing route/action flow changes.
- Update API contracts if route payloads or response shapes change.
- Update Help/Guide assertions if an existing test covers Calendar/actual labels.
- Route-label/support sweep must include `Review actual`, `Manual actual`, `Manual`, `Actual source`, `Provider`, `Garmin`, `Strava`, `Apple Health`, `Health Connect`, `TrainingPeaks`, `sync`, `backfill`, `needs_review`, and `completed_activity_events`.

## Screenshot Contract

- This is UI work when executed.
- Required handoff type: `after/reference`.
- Reference surface: current Calendar selected-day read-only actual overview.
- Changed surface: dedicated `Review actual` editor.
- Capture at least:
  - desktop Calendar selected-day with enabled `Review actual`,
  - desktop Review actual editor with planned step/repeat breakdown visible read-only and actual session builder visible,
  - mobile Review actual editor with planned step/repeat breakdown visible read-only and actual session builder visible,
  - one validation/stale or review-needed state where practical.
- If practical, include an `after/reference` comparison against the manual pool session builder or session-step surface contract for planned step/repeat parity.
- Stop after screenshot handoff for owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Acceptance Criteria

- `Review actual` is enabled only for editable owner-scoped manual actual rows.
- A dedicated actual editor shows plan and actual as separate truths.
- Planned swim-session steps/repeats are shown read-only when available, using the established session-step surface contract or an explicitly adapted view-model.
- Actual swim-session steps/repeats are editable through the existing builder surface, including stroke, distance/time, rest, target, repeat count, add/delete/reorder, and step notes.
- User can update supported manual actual metadata and actual session draft without mutating planned instance, source workout, source program, or future provider evidence.
- Source badge displays `Manual` and the data model/UI remains provider-ready without fake provider states.
- Unknown outcome/source/provider values fail closed to review/unmapped and do not count as completed/as-planned.
- Stale writes and cross-user attempts fail closed with support-safe messages.
- Support docs explain manual actual, future provider evidence, sync/backfill/revoked-access placeholders, and data-difference troubleshooting.
- Screenshots are approved before broad gates.
- Strict 10/10 closeout requires all target categories at `5/5`.

## Validation Plan

Docs/brief refresh before implementation:

- `npm run lint:briefs`

Runtime execution later:

- targeted route/domain/component tests for actual editor and completion route
- planned step/repeat read-only fixture test
- actual session step/repeat edit payload test
- targeted a11y/component tests
- route-label/support-surface impact sweep
- screenshot handoff showing planned child structure and owner approval
- `npm run verify:pre-pr`
- GitHub required CI checks
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-21 | planned | created after owner required Review actual editor v1 to be 10/10 and asked to add online best-practice findings; scope is a manual actual editor with provider-ready contracts for Garmin, Strava, Apple Health, Health Connect, and TrainingPeaks-style sync/support behavior, but no provider runtime | next: wait for explicit owner approval before moving to in-progress and implementing`
- `2026-06-22 | in-progress | owner explicitly asked to implement Review actual editor v1; moved brief to in-progress on branch review-actual-editor-v1 from main@a417271c with plan-only updates carried forward | next: implement dedicated editor, focused tests/docs, then screenshot handoff before broad gates`
- `2026-06-22 | in-progress | implemented dedicated /my-library/calendar/actuals/[instanceId] editor, Calendar entrypoint, owner-scoped loader, manual actual form, support docs, API route contract, and focused unit coverage; targeted vitest and typecheck passed before docs closeout edits | next: rerun targeted validation, route-label sweep, lint:briefs, and screenshot handoff before broad gates`
- `2026-06-22 | screenshot handoff pending owner review | validation before visual stop: targeted vitest 4 files / 28 tests passed, typecheck passed, Prettier check passed, diff whitespace check passed, ESLint passed with only pre-existing output/ warnings, lint:briefs:all passed; after/reference screenshots captured in output/review-actual-editor-v1-2026-06-22-085729 via temporary local visual harness that rendered production components with deterministic mock data, then harness was removed from the diff | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, push, PR, and pre-merge gates`
- `2026-06-22 | revise-before-use | owner review caught a domain-granularity miss: current editor only edits actual summary fields while the user expects Review Actual to show the swim session as built; added repo-level Domain Granularity Gate and tightened this brief so v1 must show planned steps/repeats read-only before PR gates | next: adjust runtime to render planned step/repeat breakdown read-only, rerun focused tests, regenerate screenshots, then wait for owner visual approval`
- `2026-06-22 | screenshot handoff pending owner review | adjusted runtime to load planned workout preview sections, store them in new manual-completion planned snapshots, and render planned swim steps/repeats read-only through the shared session-step view renderer while actual editing remains summary-only; validation: targeted vitest 4 files / 29 tests passed, typecheck passed, diff whitespace check passed, ESLint passed with only pre-existing output/ warnings, lint:briefs:all passed, and route/label/support sweep was rerun; after/reference screenshots captured in output/review-actual-editor-v1-2026-06-22-100735 via temporary local visual harness that rendered production components with deterministic mock data, then harness was removed from the diff | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, push, PR, and pre-merge gates`
- `2026-06-22 | implementation rescope | owner rejected summary-only/read-only actual handling and confirmed Review Actual V1 must edit the performed session itself; updated scope to add actual_session_snapshot, initialize it from the planned/source workout, reuse the existing swim-session builder for actual steps/repeats, keep planned/source/provider truth immutable, and derive actual load/context from the corrected actual draft; validation so far: targeted vitest 5 files / 35 tests passed and typecheck passed | next: update API/support docs, rerun lint/brief gates, capture new screenshot handoff, then stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-22 | screenshot approved | after/reference screenshots captured in output/review-actual-editor-v1-2026-06-22-105347 using a temporary local harness that rendered Calendar reference plus Review actual editor with the actual swim-session builder; harness was removed from the diff, owner approved visuals, and the builder uses the same WorkoutEditor/step-surface colors as the manual swim session builder | next: run npm run verify:pre-pr, commit, push, open/update PR, monitor CI, then run npm run verify:pre-merge`
- `2026-06-22 | pre-pr passed | npm run verify:pre-pr passed full lane after applying the additive linked Supabase migration; evidence includes lint/quality gates, typecheck, 256 unit files / 1692 tests, production build, perf budgets, and Playwright 111 passed / 567 skipped; perf budget reported a tighten recommendation after 11 green weekly runs, but decision is hold because the owner previously required waiting for at least two new green weekly cycles after 2026-06-19 before tightening | next: commit, push, open/update PR, monitor CI, then run npm run verify:pre-merge`
