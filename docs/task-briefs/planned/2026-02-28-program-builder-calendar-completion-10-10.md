# Task Brief: Program Builder Calendar And Completion Tracking (10/10)

## Metadata

- `id`: `2026-02-28-program-builder-calendar-completion-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-20`

## Goal

Enable users to manually turn workouts into clear weekly programs with deterministic scheduling, readable calendar review, and a clean handoff into completion/history workflows.

## Why This Brief Exists

- Planned workout features need a scorecard-complete execution brief before implementation starts.
- Calendar scheduling and completion logging are stateful flows and require explicit data-boundary decisions up front.
- Calendar scheduling and planner-visible completion state are stateful flows and require explicit data-boundary decisions up front.
- This brief sets measurable 10/10 thresholds so later slices can ship with predictable quality gates.
- This brief is the manual program-building track.
- AI-generated session/program creation belongs to a separate generator brief and must not be conflated with this manual planner flow.
- Accepted AI-generated plans across supported fixed-duration, date-range, and competition-date horizons should still hand off into one editable planner surface after canonical save.
- Canonical training-history state, manual done/cancel/comments, and Garmin-completed reconciliation belong to a separate history brief and must not be hidden inside planner-only flags.

## Scope

- Weekly calendar/program builder:
  - assign workouts to days,
  - simple progression controls,
  - rest day support,
  - editing/review of canonically saved programs regardless of whether the original source was manual assembly or an accepted AI-generated plan.
- Planner-facing status visibility:
  - show scheduled vs completed vs cancelled state from canonical history/completion records,
  - expose clear handoff entry points into completion/history flows where needed.
- Program summary:
  - weekly meters,
  - intensity distribution,
  - consistency indicators.

## Out Of Scope

- AI-generated program creation.
- Choosing planning horizon, competition date, or peak/taper intent for a new AI generation run.
- Goal-based automatic planning.
- External activity imports.
- Garmin partner sync.
- Canonical training-history detail, manual completion/cancel comments, and retrospective evaluation logic.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - program weeks and workout-to-day assignments,
  - planner-visible completion/cancelled indicators only insofar as they are derived from canonical history/completion records owned by the training-history slice.
- Local-only:
  - unsaved builder draft edits before explicit save,
  - temporary UI filters/sort state in builder views.
- Sync behavior:
  - optimistic UI allowed only for non-destructive edits,
  - server response remains source of truth for persisted schedule state,
  - planner surfaces must read canonical completion/history state rather than maintaining a separate completion truth,
  - stale writes must return deterministic conflict guidance and refresh canonical state.
- Invalidation:
  - any assignment mutation invalidates weekly summary, adherence metrics, and day cells for affected week,
  - any upstream history/completion mutation invalidates planner completion indicators and affected summaries for the relevant week.

## Identity And Rename Contract

- Canonical stable IDs:
  - `program`, `program_week`, and `program_assignment`/`plan_session` records must use immutable canonical IDs that do not depend on week/day position or workout title.
  - planner-visible completion/history state may reference separate canonical history IDs, but those are owned by the training-history slice rather than planner-local identity.
- Human-readable identifiers:
  - workout/program names and optional slugs are editorial/operator-facing only,
  - calendar placement labels such as week/day are presentation, not identity.
- Mutability rules:
  - rescheduling and reordering must not mint or rewrite canonical IDs for the same underlying assignment,
  - title/label edits must not change completion linkage.
- Rename vs repurpose:
  - rename a workout/program in place only when it is still the same underlying object,
  - if a scheduled item is materially repurposed into a different workout intent, create a new entity/assignment so historical completion remains semantically correct.
- Compatibility contract:
  - deep links, analytics, exports, and review views must resolve canonical IDs even if human-readable labels later change,
  - no completion or adherence logic may infer identity from week/day ordinal text alone.
- Observability and repair:
  - duplicate/orphan assignment or completion references must be detected deterministically and surfaced in repair guidance/logging.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                            | Evidence                                     |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Product goals and IA                          | `target`     | Program builder IA supports create/edit/review of weekly schedules with clear transition into later completion/history workflows.           | UX spec + e2e journey assertions             |
| UX flow clarity                               | `target`     | Users can schedule one week and understand next-step execution/history state in <=3 minutes without documentation.                          | timed manual QA + e2e                        |
| Visual design quality                         | `supporting` | Supporting only: planner visuals must stay production-ready, but no new design system is owned by this brief.                               | scope rationale + planner QA                 |
| Business logic correctness and data integrity | `target`     | No duplicate or orphan assignments after retries/rapid edits; planner status reads canonical history state without forked completion truth. | unit/integration invariants                  |
| Admin editor ergonomics                       | `supporting` | Supporting only: no primary admin content-edit workflow changes in this manual planner brief.                                               | scope rationale                              |
| Accessibility (a11y)                          | `target`     | Keyboard-only users can assign/edit/review scheduled workouts and read planner status with no critical a11y violations on core views.       | e2e a11y + manual keyboard QA                |
| Performance (CWV + payloads)                  | `target`     | Changed builder routes stay within route budgets and avoid >10% JS payload regression.                                                      | perf budget checks + bundle diff             |
| Data placement and sync boundaries            | `target`     | Local-vs-server ownership and conflict policy are explicitly documented and reflected in tests.                                             | brief contract + integration tests           |
| Caching and invalidation strategy             | `target`     | Week summary and day-cell views refresh deterministically after schedule or upstream history mutations with no stale totals.                | integration tests + cache notes              |
| Reliability and failure handling              | `target`     | Failure states provide retry/recover paths; no dead-end states for save or planner-to-history handoff.                                      | e2e failure-path coverage                    |
| Security and authz                            | `target`     | Unauthorized schedule mutations and protected planner status reads fail closed (`401/403`) and never mutate state.                          | negative-path API tests                      |
| Privacy and compliance                        | `supporting` | Supporting only: planner status and summaries must avoid leaking unrelated history comments or personal data.                               | scope rationale + payload review             |
| Content governance                            | `supporting` | Supporting only: canonical workout/program governance is upstream, but planner must preserve stable references to it.                       | linked brief + scope rationale               |
| Admin workflow and editability                | `supporting` | Supporting only: no primary admin workflow is changed in this end-user planner slice.                                                       | scope rationale                              |
| SEO and crawlability                          | `supporting` | Supporting only: authenticated planner surfaces are not primary crawl targets.                                                              | scope rationale                              |
| AI discoverability                            | `supporting` | Supporting only: this brief consumes canonical workout data but does not define public AI-discoverable surfaces.                            | scope rationale                              |
| Analytics and KPI observability               | `target`     | Schedule and planner-status events emit with stable taxonomy and safe payloads for adherence KPI tracking.                                  | analytics event tests + event catalog        |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct checkout or entitlement mutation ships in this planner slice.                                                    | scope rationale                              |
| Incident response and support operations      | `supporting` | Supporting only: planner/history handoff failures should leave support-visible diagnostics and recovery guidance.                           | scope rationale + error contract             |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation is introduced by this planner brief.                                                         | scope rationale                              |
| i18n operational readiness                    | `supporting` | Supporting only: planner labels and status copy must remain locale-extensible later.                                                        | copy contract + scope rationale              |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing Next.js/TypeScript/test stack without unnecessary new dependencies.                                            | package diff + architecture review           |
| Testing and QA automation                     | `target`     | Critical schedule/edit/status-handoff paths and negative paths are covered in unit+integration+e2e gates.                                   | test matrix + verify outputs                 |
| Scalability and cost efficiency               | `supporting` | Supporting only: planner scheduling/status reads must avoid obvious duplicate-write or summary-recompute cost spikes.                       | scope rationale + perf notes                 |
| DevOps and rollback readiness                 | `target`     | Feature rollout includes rollback path and deterministic data repair guidance for partial failures.                                         | runbook + release notes + rollback checklist |

## Acceptance Criteria

- Users can manually build and edit their own weekly programs quickly.
- Accepted AI-generated programs can be edited in the same planner after canonical save without creating a parallel planner identity model.
- Planner completion/cancelled state is reliable because it is read from canonical history/completion records, not planner-local flags.
- Program metrics align with canonical workout data.
- Data-boundary and conflict rules are implemented exactly as specified in this brief.
- Calendar and completion identity stays stable across reorder, rename, and reschedule operations.
- The manual planner flow remains distinct from later AI-generated program creation and from the separate history/reconciliation brief.

## Validation

- targeted unit/integration tests for schedule + planner-status state
- e2e for schedule/edit/status-handoff flow
- `npm run lint:briefs`
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-09 | working tree | upgraded planned brief to canonical 10/10 scorecard mapping with explicit state-boundary contract and measurable target thresholds | next: use this brief as source when implementation branch starts`
- `2026-03-16 | working tree | added explicit identity-and-rename contract so future program-builder implementation cannot couple canonical IDs to week/day order, editable labels, or reschedule flows | next: carry the same contract into implementation slices before schema/UI work starts`
- `2026-03-19 | planning | clarified product direction that this brief owns manual program building from user-authored workouts, while AI goal-based session/program generation stays in a separate generator brief | next: request owner detail later on how AI-generated plans should hand off into editable builder/program flows`
- `2026-03-20 | planning | narrowed this brief to the manual program builder and planner-status track, and moved canonical done/cancel/comments/history ownership into a separate training-history brief so scheduling truth and outcome truth stay cleanly separated | next: keep planner UI aligned to canonical history state instead of adding planner-local completion flags`
- `2026-03-20 | planning | clarified that accepted AI-generated plans across supported fixed-duration, date-range, and competition-date horizons should still converge into this same editable planner after canonical save, while horizon selection and competition intent remain upstream generator concerns | next: keep later planner implementation compatible with AI-authored plan metadata without turning this brief into a generation brief`
