# Task Brief: Training History Completion Reconciliation And Retrospective Evaluation (10/10)

## Metadata

- `id`: `2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-20`
- `updated`: `2026-06-22`
- `mode`: `parent boundary / plan only`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@ba4e6024`
- `audit_status`: `ready`
- `decision`: Use this as the training-history parent contract; no active provider/runtime child is selected after Provider Evidence Boundary Intake, Schema Foundation, and Fixture Import V1 all shipped and closed.
- `reason`: Calendar now has stable planned instances, planned-only edit/status actions, manual completion events, read-only Habits/Micro daily layers, read-only plan-vs-actual overview, a dedicated Review Actual editor, completed provider-evidence boundary intake, provider-evidence schema foundation, and a disabled-by-default `manual_fixture` provider-evidence import proof. Perfect Day is closed as Habits-only for now. Real Garmin/provider runtime remains blocked until owner/provider decisions and external prerequisites are concrete.
- `must_refresh_before_execution_if`: Refresh again if `planned_workout_instances`, workout/session data contracts, Garmin official API docs, Garmin partner status, provider payload samples, Help/Guide/support surfaces, scorecard categories, verification lanes, or route labels change.

## Goal

Establish the canonical training-history system for actual swim outcomes so planned sessions, manual completions, future Garmin Activity API imports, and later retrospective review share one identity-safe source of truth.

## Pre-Implementation Owner Explanation

Codex skal sikre at faktisk trening lagres som historikk, ikke som endringer direkte i planen. Det betyr noe fordi vi senere skal kunne sammenligne planlagt, sendt til Garmin og faktisk gjennomført uten dobbeltelling eller stille overskriving. Utenfor scope i første child er Garmin-kobling, Garmin-import, partial/cancelled historikk, kommentarer, AI-retrospektiv, økonomi/adminrapportering, performance-ratchet og `Ja.docx`.

## Current Repo State

- `planned_workout_instances` is the current planned-session identity layer.
- Calendar can reschedule, skip, cancel, and recover planned-only instances without creating actual outcome truth.
- `completed_activity_events` now stores owner-scoped manual completed swim events from Calendar.
- Calendar Plan can show manual completion plus read-only Habits and Micro Session daily layers.
- Workout/program Garmin-ready exports are handoff JSON/PDF surfaces only; they do not call Garmin APIs.
- Existing Calendar Compare shows Swimming as not included until completed swim activity events are explicitly mapped into Stats.
- Manual actual history now supports completed-as-planned, changed, partly done, another-day, cancelled-as-actual, and review-needed outcomes, with Calendar showing read-only plan-vs-actual overview and a dedicated `Review actual` editor for manual actual corrections.
- Provider Evidence Schema Foundation V1 now stores provider connection, import-run, and activity evidence summaries separately from manual actual history, with export/delete coverage and no Calendar/Stats counting.
- Provider Evidence Fixture Import V1 now proves a disabled-by-default authenticated `manual_fixture` route can write private provider evidence idempotently without creating completion truth.

## Source Separation Contract

Training history must keep these layers separate:

| Layer                      | Canonical owner                             | Meaning                                             | Must not do                                                |
| -------------------------- | ------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| Planned occurrence         | `planned_workout_instances`                 | What the user intended to do on a date.             | Must not become actual outcome truth.                      |
| Garmin send job            | future Garmin Training API provider tables  | What FreeSwimming sent or tried to send to Garmin.  | Must not count as completed.                               |
| Completed activity/history | this training-history contract              | What actually happened, including corrections.      | Must not overwrite planned identity or provider send logs. |
| Reconciliation/review      | future Garmin Activity reconciliation child | How sent/received/manual records match or conflict. | Must not silently coerce conflicts.                        |

## Child Slice Sequencing

1. Calendar Child `D`: manual completed swim event from planned Calendar rows.
   - Owns: `completed` outcome for eligible planned swims, idempotency, owner scope, Calendar rendering.
   - Does not own: partial/cancelled/comments/Garmin.
   - Status: shipped in `docs/task-briefs/done/2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10.md`.
2. Actuals/corrections and plan-vs-actual child:
   - Path: `docs/task-briefs/done/2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10.md`.
   - Owns: actual outcome storage and read-only Calendar plan-vs-actual display for completed-as-planned, completed-different, partial, completed-on-another-day, cancelled-as-actual, review-needed, and legacy completed alias.
   - Does not own: Garmin provider ingestion, AI evaluation, or source workout/program edits.
3. Review actual editor v1 child:
   - Path: `docs/task-briefs/done/2026-06-21-review-actual-editor-v1-10-10.md`.
   - Owns: dedicated user-facing manual actual editor, plan-vs-actual edit flow, source badge, stale-write recovery, support diagnostics, and provider-ready contracts for future Garmin/Strava/Apple Health/Health Connect style integrations.
   - Does not own: provider runtime, provider imports, raw FIT parsing, source workout/program edits, or AI evaluation.
   - Status: shipped in PR `#1203` and closed by PR `#1204`.
4. Provider evidence boundary and reconciliation intake v1 child:
   - Path: `docs/task-briefs/done/2026-06-22-provider-evidence-boundary-and-reconciliation-intake-v1-10-10.md`.
   - Owns: docs/schema-intake contract for provider evidence storage boundaries, OAuth/secrets, RLS, export/privacy, support, service-matrix, and runtime blockers before any provider import.
   - Does not own: provider runtime, OAuth, credentials, raw FIT parsing, send jobs, matching, UI, or reconciliation actions.
   - Status: shipped as the docs/schema-intake prerequisite and closed after schema foundation and fixture import proved the boundary.
5. Provider evidence schema foundation v1 child:
   - Path: `docs/task-briefs/done/2026-06-22-provider-evidence-schema-foundation-v1-10-10.md`.
   - Owns: provider connection, import-run, and activity evidence schema foundation, typed helpers, export/delete privacy coverage, and support/GDPR docs.
   - Does not own: provider imports, OAuth, raw files, matching, UI, Calendar/Stats counting, or reconciliation actions.
   - Status: shipped in PR `#1206` and closed by PR `#1207`.
6. Provider evidence fixture import v1 child:
   - Path: `docs/task-briefs/done/2026-06-22-provider-evidence-fixture-import-v1-10-10.md`.
   - Owns: bounded authenticated `manual_fixture` provider-evidence import proof with idempotency, redaction, export/delete coverage, and no completion side effects.
   - Does not own: Garmin/OAuth/live provider calls, FIT storage/parsing, matching, UI, Calendar/Stats, or reconciliation actions.
   - Status: shipped in PR `#1209` and closed by PR `#1210`.
7. Garmin Activity reconciliation child:
   - Owns: Activity API ingestion, provider activity aliases, sent-vs-received matching, conflict/review workflow, and edit/reconcile affordances.
   - Blocked by: Garmin partner/API access, provider payload examples, send-job/import-only decision, provider alias/correlation behavior, matching thresholds, and provider branding/consent requirements.
8. Retrospective evaluation child:
   - Owns: AI/read-only review of completed history and long-term goals without mutating history truth.

## Scope

Parent scope:

- Define canonical training-history identity and ownership.
- Keep manual, system, and provider sources explicit.
- Keep planned, sent, received, matched, reviewed, and completed states separate.
- Define compatibility for future Garmin Activity API reconciliation.
- Define tests and support diagnostics required by child slices.

First shipped runtime child scope is intentionally narrower and owned by:

- `docs/task-briefs/done/2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10.md`

Last shipped actual-history child scope is owned by:

- `docs/task-briefs/done/2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10.md`

Last shipped manual actual editor child scope is owned by:

- `docs/task-briefs/done/2026-06-21-review-actual-editor-v1-10-10.md`

Last shipped provider evidence schema child scope is owned by:

- `docs/task-briefs/done/2026-06-22-provider-evidence-schema-foundation-v1-10-10.md`

Last shipped provider evidence fixture child scope is owned by:

- `docs/task-briefs/done/2026-06-22-provider-evidence-fixture-import-v1-10-10.md`

No active provider/runtime child is currently selected. The next provider/runtime slice requires an owner decision and the relevant provider prerequisites; Garmin reconciliation remains blocked by `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`.

## Out Of Scope

- Executing this whole parent as one runtime PR.
- Garmin OAuth, credentials, provider jobs, webhooks, Activity API ingestion, or provider sample parsing.
- Live Garmin Training API send/publish workflow.
- Full health/biometric ingestion from Garmin Health APIs.
- AI generation of future workouts or programs.
- Automatic replanning of future schedules without explicit user review.
- Public SEO/AI-discoverable history pages.
- Finance/reporting mutation.
- Touching `Ja.docx`.

## Garmin Official Source Baseline

Checked on `2026-06-21`:

- Garmin Connect Developer Program overview: https://developer.garmin.com/gc-developer-program/overview/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
- Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/

Current interpretation from official sources:

- Training API publishes workouts and training plans to Garmin Connect for device sync.
- Activity API provides detailed activity data after end-user consent and device sync, including swimming and activity files.
- Garmin Connect Developer Program APIs use OAuth 2.0 and require business/partner approval.
- Garmin API brand guidelines include attribution requirements for Garmin-sourced and derived data.
- FIT is a forward-compatible activity/workout data format and must be parsed through provider-aware tooling when this becomes runtime scope.

## Garmin Send/Receive/Reconcile Contract

- Sending a planned workout to Garmin creates provider send state only.
- Send jobs should store local planned/workout/program IDs, a payload snapshot/fingerprint, idempotency/correlation values where Garmin supports them, and any provider aliases Garmin returns.
- Local correlation IDs may help matching, but future reconciliation must not depend on Garmin returning them; matching also needs provider alias, date/time, sport/sub-sport, distance/duration, and available FIT/lap/step evidence.
- Receiving a Garmin activity creates provider activity evidence only.
- A completed history entry is created, corrected, or linked only after deterministic manual action, provider match, or explicit review.
- Future reconciliation should compare:
  - planned instance ID,
  - FreeSwimming workout ID,
  - Garmin send job ID / provider workout alias,
  - outbound payload fingerprint/correlation values where available,
  - activity date/time,
  - sport/sub-sport,
  - pool/open-water context,
  - distance/duration,
  - available FIT/lap/step evidence when mapped.
- Conflicts such as manual `completed` vs provider mismatch, manual `cancelled` vs provider activity, duplicate provider matches, or ambiguous activity-to-plan matches enter `needs_review`.
- Review/edit affordances must show planned, sent, received, and actual versions separately, then edit reconciliation state or history correction state, not silently rewrite provider evidence.
- Garmin attribution/branding requirements must be followed on Garmin-sourced or Garmin-derived displays.

## Data Placement And Sync Contract

- Server-canonical:
  - immutable training-history/completed-event ID,
  - owner ID,
  - planned instance reference when available,
  - workout/program references when available,
  - outcome state,
  - source kind (`manual`, future `garmin_activity_api`, future `system_reconciled`),
  - actual completion date/time and measured values where known,
  - actual outcome state (`completed_as_planned`, `completed_different`, `partial`, `completed_on_another_day`, `cancelled_as_actual`, or mapped future values),
  - planned snapshot/references needed for plan-vs-actual,
  - provider aliases and raw-file references only in future provider-specific tables,
  - reconciliation status and review metadata in later children.
- Local-only:
  - filters,
  - unsaved comments,
  - transient confirmation/review UI state.
- Sync behavior:
  - planned rows stay planning truth;
  - history rows stay actual outcome truth;
  - correcting history updates actual truth and does not rewrite the plan;
  - provider send/import state never overrides either without explicit reconciliation rules;
  - history mutations invalidate Calendar completion indicators, history lists/details, comparison summaries, and later retrospective AI inputs.
- Conflict policy:
  - duplicate manual completion is idempotent;
  - actual-history correction is explicit and auditable;
  - duplicate provider match, provider/manual disagreement, missing plan reference, unknown source, or stale planned row becomes review/retry state;
  - provider re-sync must not delete manual notes or rebind history entries silently.
- Retention and sensitivity:
  - training history is private personal data;
  - raw provider files, detailed biometric data, comments, and plan snapshots require minimization and support-safe redaction rules.

## Identity And Rename Contract

- Canonical stable IDs:
  - each history/completed event has an immutable internal ID;
  - provider IDs are foreign aliases only;
  - planned instance IDs identify intended occurrences, not actual outcomes.
- Human-readable identifiers:
  - workout/program names, labels, and calendar headings are presentation only.
- Mutability rules:
  - a correction for the same underlying scheduled session should update/review the same canonical history entry unless a later versioning policy says otherwise;
  - editing the actual result changes actual-history fields only and leaves the planned occurrence intact;
  - provider re-sync cannot rebind a history entry to a different planned session implicitly.
- Rename vs repurpose:
  - renaming a workout/program in place preserves history linkage;
  - materially repurposing a workout/program/planned occurrence should create a new canonical entity before future history is attached.
- Compatibility contract:
  - analytics, exports, comments, provider reconciliation, and AI review resolve canonical IDs, not titles or order.
- Observability and repair:
  - duplicate matches, orphan history entries, provider drift, unknown sources, and stale planned references must be measurable and supportable.
  - partial/changed/another-day actuals must be diagnosable separately from skipped/cancelled planned rows.

## Forward Compatibility Contract

- Extensibility surfaces:
  - outcome states,
  - source kinds,
  - provider aliases,
  - Garmin send statuses,
  - Garmin Activity API activity types/files,
  - Strava activity/webhook identifiers,
  - Apple Health workout source metadata,
  - Android Health Connect client record/source metadata,
  - reconciliation statuses,
  - review actions,
  - analytics event values,
  - export formats,
  - localized labels.
- Source of truth:
  - planned values derive from `planned_workout_instances`;
  - actual outcomes derive from training-history/completed-event rows;
  - Garmin send state derives from future provider job tables;
  - Garmin received evidence derives from future Activity API provider tables.
- Additive behavior:
  - new manual history rows should appear in history/calendar summaries when they use canonical outcome/source contracts;
  - new providers should stay hidden/unmapped until explicitly supported.
- Explicit mapping requirements:
  - new outcome/source/provider/reconciliation values require typed unions, support copy, tests, and Help/Guide review.
- Unknown or deprecated values:
  - fail closed to review/unmapped states and stay out of completed counts.
- Test/evidence:
  - child slices must include future-value fixtures or unknown-value negative paths for every touched state machine.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Users can understand planned vs completed vs provider-review states in one coherent planner-to-history IA.                          | child UX flows + route/state map     | `5/5`                   |
| UX flow clarity                               | `target`     | Manual completion and later review states have clear next actions with no dead ends.                                                | e2e + copy review                    | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: child UI slices must use shared Calendar/My Library patterns and screenshot handoff.                               | child screenshot evidence            | `4/5`                   |
| Business logic correctness and data integrity | `target`     | No duplicate/orphan history records under retry/conflict paths; provider/manual conflicts never silently overwrite.                 | unit/integration invariants          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: no high-frequency admin content-edit workflow is introduced in the first history child.                            | scope rationale                      | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Keyboard/screen-reader users can trigger completion and read outcome/review states without critical blockers.                       | a11y checks + keyboard QA            | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | History/calendar overlays stay within route budgets and use bounded reads.                                                          | perf/query checks                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planner, history, Garmin send, Garmin received, and reconciliation ownership are explicit and tested.                               | contract + integration tests         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar indicators, history views, summaries, and future reconciliation views refresh after relevant mutations.                    | integration/cache tests              | `5/5`                   |
| Reliability and failure handling              | `target`     | Manual/provider failure and conflict states produce retry/review guidance with no ambiguous completion state.                       | negative-path tests                  | `5/5`                   |
| Security and authz                            | `target`     | Protected history/provider mutations fail closed and malformed provider payloads cannot mutate another user's state.                | authz/provider negative-path tests   | `5/5`                   |
| Privacy and compliance                        | `target`     | Training history, comments, provider files, and Garmin-derived data are minimized, private, consent-aware, and safely redacted.     | payload/log/legal review             | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program governance is upstream, while history preserves stable references and snapshots.                   | linked brief review                  | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support/admin visibility may be needed later, but primary admin CRUD is not in the first child.                    | support-scope rationale              | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because training history is authenticated private data and no public crawl surfaces change.                                     | private-route rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private training history does not create public AI-discoverable content.                                                | private-data rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Completion, cancellation, source, review, and reconciliation events use stable taxonomy and safe canonical references.              | event catalog/tests                  | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: no billing or entitlement mutation ships in the history foundation slice.                                          | scope rationale                      | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose duplicate, orphan, provider mismatch, stale, unknown-source, and review states.                                | runbook/support diagnostics          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this parent does not change revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.             | explicit finance non-scope rationale | `N/A`                   |
| i18n operational readiness                    | `target`     | Outcome/source/review labels are locale-extensible and do not double as identity.                                                   | copy contract + responsive tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js/TypeScript/Supabase patterns, official Garmin docs when provider work starts, and no unnecessary dependencies. | architecture review + package diff   | `5/5`                   |
| Testing and QA automation                     | `target`     | Child slices include unit/integration/e2e/negative-path/screenshot where relevant plus `verify:pre-pr`, CI, and `verify:pre-merge`. | validation outputs                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | History and reconciliation writes are idempotent/bounded and avoid runaway provider reprocessing.                                   | query/job tests                      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | History schema, provider rollout, and reconciliation jobs include reversible migrations, disable paths, and repair guidance.        | migration/rollback notes             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Calendar child slices should reuse current Calendar selected-day detail and My Library route shells.
  - History list/detail should be a later route or component with a shared view-model, not Calendar-local ad hoc state.
- TypeScript/domain:
  - outcome/source/correction/reconciliation statuses must be typed allowlists with unknown-value review fallback.
  - provider data must be parsed through explicit adapters.
- Supabase:
  - use additive migrations, RLS, owner-scoped indexes, generated type updates, and negative-path tests.
  - raw provider file references should be storage/reference metadata, not broad JSON blobs in user-facing tables unless explicitly justified.
- External services:
  - Garmin runtime work must re-check official docs and partner credentials before implementation.
  - use least-privilege OAuth scopes, encrypted token storage, idempotency, retry/backoff, attribution/branding compliance, and support-visible diagnostics.
- Testing:
  - manual history and actual corrections: unit/integration/component/e2e;
  - provider reconciliation: adapter fixtures, malformed payloads, duplicate matching, authz, replay, and review-state tests.

## Help/Guide And Support-Surface Impact

- Any user-facing completion, cancellation, review, provider, or recovery label must run route-label/support-surface sweep before broad gates.
- Update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and any Help/Guide assertions when workflow labels or recovery behavior change.

## Acceptance Criteria

- Calendar Child `D` can safely use this parent as the canonical history boundary and has shipped as manual completion only.
- Actuals/corrections, Review Actual Editor V1, Provider Evidence Boundary Intake V1, Provider Evidence Schema Foundation V1, and Provider Evidence Fixture Import V1 have shipped, and no active provider/runtime child is selected.
- Manual completion is defined as actual outcome truth, separate from planned rows and Garmin send state.
- Actual-history corrections are defined as actual truth changes, not planned row changes.
- Garmin send, Garmin received activity, and reconciliation/review responsibilities are separated before runtime work starts.
- Future provider/manual conflicts must enter review state, not silent overwrite.
- Scorecard, data placement, identity, forward compatibility, and support impact are explicit.

## Validation

- `npm run lint:briefs`
- Future child implementation:
  - targeted unit/integration tests for completion state transitions and conflict handling,
  - targeted tests for actual correction outcomes and plan-vs-actual rendering,
  - negative-path tests for unauthorized/forbidden mutations,
  - e2e for planner to complete/history review flow where UI changes,
  - `npm run verify:pre-pr`,
  - GitHub CI,
  - `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-03-20 | planning | created a dedicated history/completion parent brief so manual done/cancel/comments, later Garmin Activity API reconciliation, and retrospective AI evaluation have one canonical state model instead of being split across planner and send-to-Garmin slices | next: use this brief to keep planner, Garmin send, and later provider-ingest work from inventing parallel completion/history truth`
- `2026-03-20 | planning | clarified that retrospective evaluation should retain original plan-intent context such as planning horizon, explicit date window, and explicit competition-date peak/taper intent, so future AI review can judge sessions against what the plan was actually trying to do | next: keep later history schema and AI evaluation slices aligned to canonical plan-intent metadata rather than mutable week labels`
- `2026-05-01 | roadmap alignment | captured owner real-life scheduling requirements: preserve planned and actual states separately, support completed-as-planned, completed-on-another-day, partly-completed, skipped/cancelled, and moved-forward outcomes, and keep later AI feedback/adaptive replanning dependent on canonical history instead of planner-local flags | next: keep AI session V1 free of history implementation while preserving these contracts for the later program/history slice`
- `2026-06-21 | audit-refresh | refreshed after Calendar planned-instance identity and planned-only status actions shipped through PR #1191/#1192; narrowed the next runtime child to manual completed swim events and added explicit Garmin Training API send vs Activity API receive vs reconciliation boundary from official Garmin docs | next: execute Calendar Child D only after owner explicitly asks for runtime implementation`
- `2026-06-21 | systemic-actuals-audit | refreshed after Calendar manual completion and daily layers shipped through PR #1194/#1197 and closeouts #1195/#1198; added docs/task-briefs/done/2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10.md as the next local child so users can correct actual sessions that differ from plan before Garmin provider evidence is attached | next at the time: implement training-history actuals corrections`
- `2026-06-22 | provider-evidence intake selected | refreshed after Review Actual Editor V1 PR #1203 and closeout PR #1204 merged; added the provider-evidence boundary docs/schema-intake child before any provider import, OAuth, FIT parsing, matching, or reconciliation runtime; child later closed at docs/task-briefs/done/2026-06-22-provider-evidence-boundary-and-reconciliation-intake-v1-10-10.md | next at the time: complete docs-only PR for provider-evidence boundary, then keep Garmin runtime blocked until owner/provider facts unblock it`
- `2026-06-22 | fixture-import child selected | refreshed after Provider Evidence Schema Foundation V1 PR #1206 and closeout PR #1207 merged; added the bounded fixture-import runtime proof before any real Garmin/provider OAuth, FIT parsing, matching, UI, or reconciliation runtime; child later closed at docs/task-briefs/done/2026-06-22-provider-evidence-fixture-import-v1-10-10.md | next at the time: execute fixture-import child only after owner explicitly approves runtime implementation`
- `2026-06-22 | roadmap refresh | refreshed after Provider Evidence Fixture Import V1 PR #1209 and closeout PR #1210 merged; fixture import is now closed in done, no active provider/runtime child is selected, performance-ratchet still waits for two new green weekly cycles after 2026-06-19, the Perfect Day Calendar decision was still pending at that checkpoint, and Garmin/provider runtime reconciliation remains blocked | next: choose a new bounded slice from clean main after owner decision`
- `2026-06-22 | perfect-day decision closeout | refreshed after Perfect Day eligibility PR #1214 and closeout #1215 merged; Perfect Day Calendar product decision is closed as keep-in-Habits-only for now, no Calendar chip/runtime child is selected, performance-ratchet still waits for two new green weekly cycles after 2026-06-19, and Garmin/provider runtime reconciliation remains blocked | next: choose a new bounded slice from clean main after owner decision`
- `2026-06-22 | provider roadmap lock | closed the Provider Evidence Boundary Intake path as done after schema foundation, fixture import, roadmap refresh, and Perfect Day decision closeout; no active provider/runtime, Calendar chip, or performance-ratchet child is selected | next: keep Garmin/provider runtime blocked until owner/provider facts unblock it, or choose a fresh bounded docs/product child`
