# Task Brief: Training History Actuals, Corrections, And Plan Vs Actual (10/10)

## Metadata

- `id`: `2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-21`
- `updated`: `2026-06-21`
- `mode`: `planned runtime child / audit-ready`
- `parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `calendar_parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `garmin_send_boundary`: `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
- `garmin_receive_boundary`: `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@ffd36d9e`
- `audit_status`: `ready`
- `decision`: Use this as the next local training-history child before any Garmin runtime work or provider reconciliation.
- `reason`: Calendar now has planned instances, planned-only edits, manual completion, and daily Habits/Micro layers. The next integrity gap is that actual swim history can differ from the plan and must be editable without rewriting the planned session or pretending Garmin data is authoritative.
- `must_refresh_before_execution_if`: Refresh if `completed_activity_events`, `planned_workout_instances`, Calendar Plan rendering, workout/session step contracts, Garmin provider access/payload samples, Help/Guide support contracts, scorecard categories, or verification lanes change.

## Goal

Let users record and correct what actually happened in a swim session, then compare plan vs actual without collapsing planned, manual, sent, received, and reconciled truth into one mutable flag.

## Pre-Implementation Owner Explanation

Codex skal senere gjøre faktisk utførte svømmeøkter redigerbare som egen historikk. Det betyr at en planlagt økt kan stå som planen, mens brukeren kan registrere at de faktisk svømte kortere, flyttet dato, stoppet halvveis, byttet stil, eller gjorde noe annet. Utenfor scope er Garmin-kobling, Garmin-import, automatisk AI-evaluering, Perfect Day, performance-ratchet og `Ja.docx`.

## Current Repo State

- `planned_workout_instances` owns intended occurrences.
- `completed_activity_events` exists for manual `completed` events from Calendar.
- Calendar can show planned, rescheduled, skipped, cancelled, recovered, completed, review, Habits, and Micro Session daily layer states.
- Calendar Stats still shows `Swimming` as not included until completed swim history is explicitly mapped into comparison totals.
- Garmin Training API and Activity API work remains blocked until partner/API credentials, provider samples, and support/attribution facts exist.

## Source Separation Contract

| Layer                    | Canonical owner                   | Meaning                                                     | Must not do                                            |
| ------------------------ | --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| Planned occurrence       | `planned_workout_instances`       | What the user intended to do.                               | Must not be rewritten to look like the actual session. |
| Manual actual            | training-history actuals          | What the user says actually happened.                       | Must not overwrite the plan or raw provider evidence.  |
| Garmin send job          | future Garmin Training API tables | What FreeSwimming sent or tried to send.                    | Must not count as completed.                           |
| Garmin received evidence | future Garmin Activity API tables | What Garmin reports from the device.                        | Must not silently replace manual actuals.              |
| Reconciliation           | future review state               | How planned, sent, received, and actual records are linked. | Must not hide conflicts or ambiguous matches.          |

## Scope

- Extend the local actual-history contract beyond simple `completed`:
  - `completed_as_planned`,
  - `completed_different`,
  - `partial`,
  - `completed_on_another_day`,
  - `cancelled_as_actual`,
  - `needs_review`.
- Let users correct an existing manual completed swim event without changing the planned instance.
- Store actual date/time, actual duration and/or distance where available, actual pool/open-water context where available, and structured correction notes when this child implements runtime code.
- Preserve the planned snapshot and canonical planned/workout/program references for plan-vs-actual comparison.
- Show plan and actual side by side in Calendar selected-day detail or a dedicated history detail surface, using the existing Calendar/My Library design language.
- Add deterministic plan-vs-actual signals:
  - as planned,
  - changed,
  - partial,
  - done on another day,
  - missed/no actual yet,
  - review needed.
- Keep Calendar month cells scan-first; detailed correction actions belong in selected-day detail or history detail.
- Prepare the actual-history model so future Garmin received activities can be linked, detached, ignored, or reviewed without replacing manual history.

## Out Of Scope

- Garmin OAuth, send jobs, Activity API ingestion, FIT parsing, provider webhooks, provider matching, or live provider calls.
- Automatic replanning of future workouts after an actual differs from plan.
- AI retrospective evaluation or coaching recommendations.
- Editing the canonical source workout/program from an actual-history correction.
- Stats Swimming aggregation unless explicitly included in the execution refresh.
- Finance/admin dashboards, checkout, entitlement, or public SEO surfaces.
- Performance-ratchet tightening before at least two new green weekly cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical:
  - immutable actual-history/completed-event ID,
  - owner ID,
  - planned instance reference when available,
  - workout/program references when available,
  - source kind (`manual` in this child),
  - actual outcome state,
  - actual date/time and measured values when supplied,
  - planned snapshot/reference payload needed for comparison,
  - correction audit timestamps.
- Local-only:
  - open correction form state,
  - unsaved correction notes,
  - selected comparison filters.
- Sync behavior:
  - planned rows remain planning truth;
  - actual rows remain what happened;
  - correction writes update actual-history state only;
  - Calendar, history detail, and any future Stats Swimming mapping invalidate after correction;
  - duplicate submissions stay idempotent for the same planned actual unless the user explicitly creates a separate actual record.
- Conflict policy:
  - stale actual rows, stale planned references, unknown outcomes, duplicate actuals, and completed-vs-cancelled conflicts fail closed to review/retry states;
  - corrections never mutate raw future provider evidence;
  - provider evidence later attaches through reconciliation, not actual-row overwrite.
- Retention and sensitivity:
  - actual swim history is private personal training data;
  - notes and measured values must be minimized in logs/events;
  - no raw Garmin files or provider payloads belong in this local-only child.
- Cache/invalidation:
  - private routes stay authenticated and owner-scoped;
  - writes refresh the affected Calendar/history windows, not unrelated source layers.

## Identity And Rename Contract

- Canonical stable IDs:
  - `planned_workout_instances.id` identifies the intended occurrence;
  - actual-history/completed-event ID identifies what happened;
  - future provider activity IDs and send job IDs are foreign aliases only.
- Human-readable identifiers:
  - workout title, program title, date labels, and status labels are presentation only.
- Mutability rules:
  - correcting what happened updates the actual-history row or creates a new explicit actual row according to the execution refresh;
  - correcting the plan uses planned-instance actions, not actual-history fields;
  - changing the source workout/program after the fact must not rewrite existing actual evidence silently.
- Rename vs repurpose:
  - renaming a workout/program preserves references;
  - materially repurposing a workout/program should create a new canonical entity before future actuals attach.
- Compatibility contract:
  - analytics, Calendar, future Garmin reconciliation, exports, and AI review resolve canonical IDs and state enums, not titles.
- Observability and repair:
  - duplicate actuals, stale planned references, missing workout references, unknown outcomes, and future provider conflicts must be measurable and supportable.

## Forward Compatibility Contract

- Extensibility surfaces:
  - actual outcome states,
  - source kinds,
  - correction actions,
  - provider aliases,
  - reconciliation states,
  - Calendar status labels,
  - Stats Swimming mappings,
  - analytics event values,
  - export formats,
  - locales.
- Source of truth:
  - planned truth derives from `planned_workout_instances`;
  - actual truth derives from training-history actuals;
  - Garmin send state derives from future send jobs;
  - Garmin received evidence derives from future Activity API evidence tables.
- Additive behavior:
  - new manual actual rows using known outcome/source contracts should appear in Calendar/history summaries automatically;
  - new provider evidence should remain hidden or review-only until reconciliation explicitly maps it.
- Explicit mapping requirements:
  - new actual outcomes, source kinds, provider states, reconciliation actions, Stats Swimming fields, analytics events, or public export formats require typed mapping, copy, docs, and tests.
- Unknown or deprecated values:
  - fail closed to `needs_review`/unmapped;
  - never count as completed, matched, or as-planned without explicit mapping.
- Test/evidence:
  - runtime execution must include unknown-outcome fixtures, duplicate/stale correction tests, plan-vs-actual fixtures, and route/label/support sweep evidence.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/calendar` selected-day detail and/or a My Library history detail route;
  - keep Calendar month cells scan-only;
  - keep correction actions in selected-day/detail surfaces with clear loading/error states.
- TypeScript/domain:
  - model outcomes, sources, correction actions, and reconciliation placeholders as typed allowlists;
  - unknown values fail closed to review states.
- Supabase/data:
  - runtime implementation needs explicit additive migrations or a documented reuse of `completed_activity_events`;
  - RLS must be owner-scoped and negative-path tested;
  - generated DB types must be updated in the same PR if schema changes.
- External services:
  - no provider SDK or network call belongs in this child;
  - future Garmin work must re-check official docs and use provider sample fixtures.
- UI system:
  - reuse My Library/Calendar tokens, status chips, action density, and accessible form controls;
  - screenshot handoff is required before broad PR gates because this changes user-facing history/correction UI.
- Testing:
  - include route/action, data invariant, component, accessibility, stale/duplicate/unknown, and screenshot evidence.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo lint/verify scripts, `playwright` skill for future screenshot handoff, official Garmin docs for provider-boundary facts.
- Evaluate later: Garmin provider runtime may need fresh official-doc review and provider fixtures after partner access; no new local Codex skill/plugin is needed now.
- Install/config changes: none.

Systemic findings:

| Surface                  | Finding                                                                                                                               | Severity | Recommended Type                 | Owner Decision Needed                                         | Follow-Up Brief Path                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Training-history actuals | Manual completion currently records a simple completed event, but real swims can differ from the plan and need editable actual truth. | `high`   | `bounded implementation child`   | `no`                                                          | this brief                                                                               |
| Plan vs actual           | Calendar should compare intended and actual versions without rewriting either side.                                                   | `high`   | `bounded implementation child`   | `no`                                                          | this brief                                                                               |
| Garmin readiness         | Provider send/receive reconciliation needs local actual correction semantics before Garmin can safely attach mismatched evidence.     | `high`   | `deferred architecture decision` | `yes - unblock requires Garmin partner/API facts and samples` | `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md` |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Calendar parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Last merged Calendar workstream: PR `#1197` plus closeout PR `#1198`.
- Next planning step: owner may explicitly execute this child after the docs-only audit PR merges.

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
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can distinguish planned, actual, changed, partial, missed, and review-needed swim states without Garmin assumptions.          | route/state map + UI tests + screenshot handoff | `5/5`                   |
| UX flow clarity                               | `target`     | Correction actions have clear next steps and no dead ends for as-planned, changed, partial, another-day, and review states.         | component/e2e tests + copy review               | `5/5`                   |
| Visual design quality                         | `target`     | Plan-vs-actual detail is readable on mobile/desktop and does not crowd month cells.                                                 | responsive screenshot handoff                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Actual-history corrections are idempotent, owner-scoped, separate from planned rows, and preserve planned snapshots.                | migration/route/invariant tests                 | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: primary workflow is end-user history correction; admin tooling is not required in this child.                      | scope rationale                                 | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Correction forms, status chips, and review states are keyboard and screen-reader usable.                                            | a11y tests + keyboard QA                        | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Calendar/history reads stay window-bounded and add no unnecessary dependency or large client payload.                               | query review + perf gate                        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned, actual, sent, received, and reconciled truths remain separate with explicit invalidation.                                  | data contract + integration tests               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Corrections refresh Calendar/history summaries predictably without stale success states.                                            | invalidation tests                              | `5/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, stale, missing-ref, unknown outcome, schema-missing, and unexpected failure paths have bounded recovery.                 | negative-path tests                             | `5/5`                   |
| Security and authz                            | `target`     | Anonymous and cross-user correction attempts fail closed and leak no private training data.                                         | authz tests                                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Actual-history payloads minimize private notes/measures and exclude raw provider data.                                              | payload/log review + tests                      | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program source content remains upstream; actuals preserve references/snapshots.                            | source contract review                          | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support visibility may come later; no role-gated admin CRUD changes in this child.                                 | support-scope rationale                         | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because actual training history is authenticated private data and no public crawl surface changes.                              | private-route rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private actual-history data does not create public AI-discoverable content.                                             | private-data rationale                          | `N/A`                   |
| Analytics and KPI observability               | `target`     | Correction/review events use stable safe taxonomy and avoid double-counting completion.                                             | event tests or explicit no-new-event rationale  | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: actual-history correction does not mutate checkout, billing, entitlement, or product catalog truth.                | commerce non-impact review                      | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose duplicate, stale, missing-ref, unknown, partial, another-day, and future provider-conflict states.             | runbook/support-copy review                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not change revenue, refunds, payouts, invoices, entitlement reporting, or accounting data.              | explicit finance non-scope rationale            | `N/A`                   |
| i18n operational readiness                    | `target`     | Outcome/source/review labels avoid identity coupling and tolerate translation expansion.                                            | copy contract + responsive tests                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js, TypeScript, Supabase/RLS, Calendar/My Library primitives, and provider-boundary docs; add no unnecessary dependency. | package diff + architecture review              | `5/5`                   |
| Testing and QA automation                     | `target`     | Include unit/integration/component/e2e/negative-path/screenshot evidence plus `verify:pre-pr`, CI, and `verify:pre-merge`.          | validation outputs                              | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Correction writes are bounded/idempotent and summary reads avoid N+1 across Calendar/history windows.                               | query/job tests                                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Schema/action/UI changes are reversible and can be disabled without corrupting planned or future provider evidence.                 | migration/rollback notes + PR validation        | `5/5`                   |

## Help/Guide And Support-Surface Impact

- Runtime implementation changes user recovery behavior and must update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and any Help/Guide assertions in the same PR.
- Route/label/support sweep must include Calendar, History, planned/actual labels, partial/changed states, correction actions, Garmin/provider review labels, and analytics taxonomy.
- If execution stays docs-only, record explicit `N/A` rationale for visible Help/Guide runtime updates.

## Screenshot Contract

- This is UI work when executed.
- Capture `after/reference` screenshots comparing:
  - Calendar selected-day detail with plan-vs-actual,
  - actual correction/edit state,
  - partial/changed/review state,
  - existing completed-as-planned reference.
- Pause for owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Acceptance Criteria

- Users can correct a manual completed swim without mutating the planned instance.
- Plan and actual versions are visible as separate truths.
- Partial, changed, another-day, missed/no-actual, and review-needed states are deterministic.
- Future Garmin received evidence can attach through reconciliation without overwriting manual actuals.
- Unknown outcome/source/provider values fail closed and do not count as completed/as-planned.
- Support docs can diagnose duplicate, stale, missing-reference, unknown, and future provider-conflict states.

## Validation Plan

- `npm run lint:briefs`
- Runtime execution later:
  - migration/type validation if schema changes,
  - route/action/authz/idempotency/stale tests,
  - plan-vs-actual component tests,
  - route-label/support-surface impact sweep,
  - screenshot handoff and owner approval,
  - `npm run verify:pre-pr`,
  - GitHub CI required checks,
  - `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-21 | planned | created after owner asked how to handle planned sessions, manual actual corrections, Garmin returned activities that differ from plan, and the 10/10 boundary between planned, sent, received, and actually performed truth | next: keep this planned until owner explicitly asks for runtime execution`
