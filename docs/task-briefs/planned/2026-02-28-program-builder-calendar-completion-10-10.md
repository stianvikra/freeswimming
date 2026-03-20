# Task Brief: Program Builder Calendar And Completion Tracking (10/10)

## Metadata

- `id`: `2026-02-28-program-builder-calendar-completion-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-19`

## Goal

Enable users to manually turn workouts into clear weekly programs with deterministic completion tracking and review.

## Why This Brief Exists

- Planned workout features need a scorecard-complete execution brief before implementation starts.
- Calendar scheduling and completion logging are stateful flows and require explicit data-boundary decisions up front.
- This brief sets measurable 10/10 thresholds so later slices can ship with predictable quality gates.
- This brief is the manual program-building track.
- AI-generated session/program creation belongs to a separate generator brief and must not be conflated with this manual planner flow.

## Scope

- Weekly calendar/program builder:
  - assign workouts to days,
  - simple progression controls,
  - rest day support.
- Completion logging:
  - manual `done`,
  - notes on completed sessions,
  - completion source metadata.
- Program summary:
  - weekly meters,
  - intensity distribution,
  - consistency indicators.

## Out Of Scope

- AI-generated program creation.
- Goal-based automatic planning.
- External activity imports.
- Garmin partner sync.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - program weeks, workout-to-day assignments, completion records, completion notes, completion source metadata.
- Local-only:
  - unsaved builder draft edits before explicit save,
  - temporary UI filters/sort state in builder views.
- Sync behavior:
  - optimistic UI allowed only for non-destructive edits,
  - server response remains source of truth for persisted schedule/completion state,
  - stale writes must return deterministic conflict guidance and refresh canonical state.
- Invalidation:
  - any assignment/completion mutation invalidates weekly summary, adherence metrics, and day cells for affected week.

## Identity And Rename Contract

- Canonical stable IDs:
  - `program`, `program_week`, `program_assignment`/`plan_session`, and `completed_session` records must use immutable canonical IDs that do not depend on week/day position or workout title.
- Human-readable identifiers:
  - workout/program names and optional slugs are editorial/operator-facing only,
  - calendar placement labels such as week/day are presentation, not identity.
- Mutability rules:
  - rescheduling, reordering, and completion toggles must not mint or rewrite canonical IDs for the same underlying assignment/completion record,
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

| Category                                      | Mapping      | Target Threshold                                                                                       | Evidence                                     |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Product goals and IA                          | `target`     | Program builder IA supports create/edit/complete/review in one continuous weekly flow.                 | UX spec + e2e journey assertions             |
| UX flow clarity                               | `target`     | Users can schedule one week and mark one workout complete in <=3 minutes without documentation.        | timed manual QA + e2e                        |
| Visual design quality                         | `supporting` | N/A                                                                                                    | N/A                                          |
| Business logic correctness and data integrity | `target`     | No duplicate or orphan completion records after retries/rapid edits; state transitions deterministic.  | unit/integration invariants                  |
| Admin editor ergonomics                       | `supporting` | N/A                                                                                                    | N/A                                          |
| Accessibility (a11y)                          | `target`     | Keyboard-only users can assign/edit/complete workouts with no critical a11y violations on core views.  | e2e a11y + manual keyboard QA                |
| Performance (CWV + payloads)                  | `target`     | Changed builder routes stay within route budgets and avoid >10% JS payload regression.                 | perf budget checks + bundle diff             |
| Data placement and sync boundaries            | `target`     | Local-vs-server ownership and conflict policy are explicitly documented and reflected in tests.        | brief contract + integration tests           |
| Caching and invalidation strategy             | `target`     | Week summary and day-cell views refresh deterministically after any mutation with no stale totals.     | integration tests + cache notes              |
| Reliability and failure handling              | `target`     | Failure states provide retry/recover paths; no dead-end states for save/complete actions.              | e2e failure-path coverage                    |
| Security and authz                            | `target`     | Unauthorized schedule/completion mutations fail closed (`401/403`) and never mutate state.             | negative-path API tests                      |
| Privacy and compliance                        | `supporting` | N/A                                                                                                    | N/A                                          |
| Content governance                            | `supporting` | N/A                                                                                                    | N/A                                          |
| Admin workflow and editability                | `supporting` | N/A                                                                                                    | N/A                                          |
| SEO and crawlability                          | `supporting` | N/A                                                                                                    | N/A                                          |
| AI discoverability                            | `supporting` | N/A                                                                                                    | N/A                                          |
| Analytics and KPI observability               | `target`     | Schedule and completion events emit with stable taxonomy and safe payloads for adherence KPI tracking. | analytics event tests + event catalog        |
| Commerce and revenue ops                      | `supporting` | N/A                                                                                                    | N/A                                          |
| Incident response and support operations      | `supporting` | N/A                                                                                                    | N/A                                          |
| Finance and reporting operations              | `supporting` | N/A                                                                                                    | N/A                                          |
| i18n operational readiness                    | `supporting` | N/A                                                                                                    | N/A                                          |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing Next.js/TypeScript/test stack without unnecessary new dependencies.       | package diff + architecture review           |
| Testing and QA automation                     | `target`     | Critical schedule/complete/edit paths and negative paths are covered in unit+integration+e2e gates.    | test matrix + verify outputs                 |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                                    | N/A                                          |
| DevOps and rollback readiness                 | `target`     | Feature rollout includes rollback path and deterministic data repair guidance for partial failures.    | runbook + release notes + rollback checklist |

## Acceptance Criteria

- Users can manually build and edit their own weekly programs quickly.
- Completion status is reliable and audit-friendly.
- Program metrics align with canonical workout data.
- Data-boundary and conflict rules are implemented exactly as specified in this brief.
- Calendar and completion identity stays stable across reorder, rename, and reschedule operations.
- The manual planner flow remains distinct from later AI-generated program creation.

## Validation

- targeted unit/integration tests for schedule + completion state
- e2e for schedule/edit/complete flow
- `npm run lint:briefs`
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-09 | working tree | upgraded planned brief to canonical 10/10 scorecard mapping with explicit state-boundary contract and measurable target thresholds | next: use this brief as source when implementation branch starts`
- `2026-03-16 | working tree | added explicit identity-and-rename contract so future program-builder implementation cannot couple canonical IDs to week/day order, editable labels, or reschedule flows | next: carry the same contract into implementation slices before schema/UI work starts`
- `2026-03-19 | planning | clarified product direction that this brief owns manual program building from user-authored workouts, while AI goal-based session/program generation stays in a separate generator brief | next: request owner detail later on how AI-generated plans should hand off into editable builder/program flows`
