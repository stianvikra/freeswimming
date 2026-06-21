# Task Brief: Training History Completion Reconciliation And Retrospective Evaluation (10/10)

## Metadata

- `id`: `2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-20`
- `updated`: `2026-06-21`
- `mode`: `parent boundary / plan only`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@de761db3`
- `audit_status`: `ready`
- `decision`: Use this as the training-history parent contract for Calendar Child `D`; do not execute the whole parent as one implementation slice.
- `reason`: Calendar now has stable planned instances and planned-only edit/status actions. The next safe runtime step is manual completed swim history only, while partial/cancelled history, comments, Garmin Activity API ingestion, provider reconciliation, and retrospective AI stay in later bounded children.
- `must_refresh_before_execution_if`: Refresh again if `planned_workout_instances`, workout/session data contracts, Garmin official API docs, Garmin partner status, provider payload samples, Help/Guide/support surfaces, scorecard categories, verification lanes, or route labels change.

## Goal

Establish the canonical training-history system for actual swim outcomes so planned sessions, manual completions, future Garmin Activity API imports, and later retrospective review share one identity-safe source of truth.

## Pre-Implementation Owner Explanation

Codex skal sikre at faktisk trening lagres som historikk, ikke som endringer direkte i planen. Det betyr noe fordi vi senere skal kunne sammenligne planlagt, sendt til Garmin og faktisk gjennomført uten dobbeltelling eller stille overskriving. Utenfor scope i første child er Garmin-kobling, Garmin-import, partial/cancelled historikk, kommentarer, AI-retrospektiv, økonomi/adminrapportering, performance-ratchet og `Ja.docx`.

## Current Repo State

- `planned_workout_instances` is the current planned-session identity layer.
- Calendar can reschedule, skip, cancel, and recover planned-only instances without creating actual outcome truth.
- Workout/program Garmin-ready exports are handoff JSON/PDF surfaces only; they do not call Garmin APIs.
- No saved-swim completed-history table exists yet.
- Existing Calendar Compare shows Swimming as not included until saved swim sessions have a canonical completed-on date.

## Source Separation Contract

Training history must keep these layers separate:

| Layer                      | Canonical owner                             | Meaning                                             | Must not do                                                |
| -------------------------- | ------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| Planned occurrence         | `planned_workout_instances`                 | What the user intended to do on a date.             | Must not become actual outcome truth.                      |
| Garmin send job            | future Garmin Training API provider tables  | What FreeSwimming sent or tried to send to Garmin.  | Must not count as completed.                               |
| Completed activity/history | this training-history contract              | What actually happened.                             | Must not overwrite planned identity or provider send logs. |
| Reconciliation/review      | future Garmin Activity reconciliation child | How sent/received/manual records match or conflict. | Must not silently coerce conflicts.                        |

## Child Slice Sequencing

1. Calendar Child `D`: manual completed swim event from planned Calendar rows.
   - Owns: `completed` outcome for eligible planned swims, idempotency, owner scope, Calendar rendering.
   - Does not own: partial/cancelled/comments/Garmin.
2. History expansion child:
   - Owns: manual comments, cancelled-as-history, completed-on-another-day, partly-completed, moved-forward outcome records, history list/detail.
3. Garmin Activity reconciliation child:
   - Owns: Activity API ingestion, provider activity aliases, sent-vs-received matching, conflict/review workflow, and edit/reconcile affordances.
   - Blocked by: Garmin partner/API access, provider payload examples, and provider branding/consent requirements.
4. Retrospective evaluation child:
   - Owns: AI/read-only review of completed history and long-term goals without mutating history truth.

## Scope

Parent scope:

- Define canonical training-history identity and ownership.
- Keep manual, system, and provider sources explicit.
- Keep planned, sent, received, matched, reviewed, and completed states separate.
- Define compatibility for future Garmin Activity API reconciliation.
- Define tests and support diagnostics required by child slices.

First runtime child scope is intentionally narrower and owned by:

- `docs/task-briefs/planned/2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10.md`

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
- Receiving a Garmin activity creates provider activity evidence only.
- A completed history entry is created or linked only after deterministic manual action, provider match, or explicit review.
- Future reconciliation should compare:
  - planned instance ID,
  - FreeSwimming workout ID,
  - Garmin send job ID / provider workout alias,
  - activity date/time,
  - sport/sub-sport,
  - pool/open-water context,
  - distance/duration,
  - available FIT/lap/step evidence when mapped.
- Conflicts such as manual `completed` vs provider mismatch, manual `cancelled` vs provider activity, duplicate provider matches, or ambiguous activity-to-plan matches enter `needs_review`.
- Review/edit affordances must edit reconciliation state or history correction state, not silently rewrite provider evidence.
- Garmin attribution/branding requirements must be followed on Garmin-sourced or Garmin-derived displays.

## Data Placement And Sync Contract

- Server-canonical:
  - immutable training-history/completed-event ID,
  - owner ID,
  - planned instance reference when available,
  - workout/program references when available,
  - outcome state,
  - source kind (`manual`, future `garmin_activity_api`, future `system_reconciled`),
  - actual completion date/time where known,
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
  - provider send/import state never overrides either without explicit reconciliation rules;
  - history mutations invalidate Calendar completion indicators, history lists/details, comparison summaries, and later retrospective AI inputs.
- Conflict policy:
  - duplicate manual completion is idempotent;
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
  - provider re-sync cannot rebind a history entry to a different planned session implicitly.
- Rename vs repurpose:
  - renaming a workout/program in place preserves history linkage;
  - materially repurposing a workout/program/planned occurrence should create a new canonical entity before future history is attached.
- Compatibility contract:
  - analytics, exports, comments, provider reconciliation, and AI review resolve canonical IDs, not titles or order.
- Observability and repair:
  - duplicate matches, orphan history entries, provider drift, unknown sources, and stale planned references must be measurable and supportable.

## Forward Compatibility Contract

- Extensibility surfaces:
  - outcome states,
  - source kinds,
  - provider aliases,
  - Garmin send statuses,
  - Garmin Activity API activity types/files,
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
  - outcome/source/reconciliation statuses must be typed allowlists with unknown-value review fallback.
  - provider data must be parsed through explicit adapters.
- Supabase:
  - use additive migrations, RLS, owner-scoped indexes, generated type updates, and negative-path tests.
  - raw provider file references should be storage/reference metadata, not broad JSON blobs in user-facing tables unless explicitly justified.
- External services:
  - Garmin runtime work must re-check official docs and partner credentials before implementation.
  - use least-privilege OAuth scopes, encrypted token storage, idempotency, retry/backoff, attribution/branding compliance, and support-visible diagnostics.
- Testing:
  - manual history: unit/integration/component/e2e;
  - provider reconciliation: adapter fixtures, malformed payloads, duplicate matching, authz, replay, and review-state tests.

## Help/Guide And Support-Surface Impact

- Any user-facing completion, cancellation, review, provider, or recovery label must run route-label/support-surface sweep before broad gates.
- Update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and any Help/Guide assertions when workflow labels or recovery behavior change.

## Acceptance Criteria

- Calendar Child `D` can safely use this parent as the canonical history boundary.
- Manual completion is defined as actual outcome truth, separate from planned rows and Garmin send state.
- Garmin send, Garmin received activity, and reconciliation/review responsibilities are separated before runtime work starts.
- Future provider/manual conflicts must enter review state, not silent overwrite.
- Scorecard, data placement, identity, forward compatibility, and support impact are explicit.

## Validation

- `npm run lint:briefs`
- Future child implementation:
  - targeted unit/integration tests for completion state transitions and conflict handling,
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
