# Task Brief: Training History Completion Reconciliation And Retrospective Evaluation (10/10)

## Metadata

- `id`: `2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-20`
- `updated`: `2026-05-01`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief predates the Brief Audit Record standard and was not fully re-audited in this governance slice; current scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support-surface impact must be checked before use.
- `must_refresh_before_execution_if`: Always refresh before use, and refresh again if AGENTS.md, scorecard categories, verification lanes, route labels, Help/Guide, runbooks, support surfaces, provider facts, or relevant repo paths change.

## Goal

Establish a canonical training-history system so planned sessions can move into `completed` or `cancelled` history with source metadata, manual comments, and later Garmin Activity API reconciliation plus retrospective AI review against long-term goals.

## Why This Brief Exists

- Program scheduling and historical training truth are different responsibilities and should not share one fragile state model.
- Garmin Training API `send to Garmin` and Garmin Activity API `completed activity back from Garmin` are different integration problems and should not be collapsed into one brief.
- Later AI review of completed sessions needs canonical history and explicit outcome states, not ad hoc planner flags.
- Users need manual control even without Garmin integration:
  - mark done manually,
  - cancel when not completed,
  - leave manual comments,
  - review outcome history later.

## Dependencies And Boundaries

- Upstream canonical workout/program/entity contract:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
- Upstream manual program builder:
  - `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Upstream manual session builder:
- `docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- Upstream AI-generated future-plan creation:
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- This brief owns historical outcome truth and reconciliation behavior.
- This brief does not own:
  - future-plan generation,
  - manual program scheduling UX,
  - live `send to Garmin` Training API delivery,
  - or full biometric analysis/health ingestion.

## Scope

- Canonical training-history model:
  - immutable `training_history_entry` identity,
  - linkage to `plan_session`, `workout`, and optional external provider activity,
  - final outcome states:
    - `completed`,
    - `cancelled`,
    - `needs_review` for explicit conflict handling when sources disagree.
- Manual outcome actions:
  - mark scheduled session `done`,
  - mark scheduled session `cancelled`,
  - mark scheduled session `completed_on_another_day`,
  - mark scheduled session `partly_completed`,
  - move an incomplete planned session to a later planned date without pretending it was completed,
  - optional edit/add manual comment on the history entry.
- Planned-vs-actual truth:
  - preserve the original planned program/session/date,
  - capture the actual completion date when different,
  - capture whether the session was completed as planned, completed on another day, partly completed, skipped/cancelled, or moved forward.
- History UX:
  - timeline/list of completed and cancelled sessions,
  - detail surface with outcome source, timestamps, and comments,
  - filters for date/outcome/source where useful.
- Source metadata:
  - `manual`,
  - `garmin_activity_api`,
  - `system_reconciled` or equivalent deterministic source values.
- Reconciliation contract for later provider sync:
  - Garmin-completed activities can attach to canonical scheduled sessions when a deterministic match exists,
  - conflicting final-state outcomes must surface explicit review state, not silently overwrite.
- Retrospective AI-readiness hooks:
  - canonical history payload can later feed AI evaluation of individual sessions and longer-term progress against goals,
  - linked plan-intent metadata should preserve planning horizon, any original date window, and any competition-date/peak intent that shaped the original plan.
  - later adaptive AI should be able to compare planned vs actual behavior without mutating history truth or silently rewriting the active program.

## Child Slice Sequencing

1. History foundation:
   - manual `done`,
   - manual `cancelled`,
   - manual comments,
   - planner/history read model.
2. Garmin Activity API reconciliation:
   - blocked until partner access and activity-ingestion design are ready.
3. Retrospective AI evaluation:
   - evaluate completed history entries individually and against longer-term goals without mutating history truth implicitly.

## Out Of Scope

- Live Garmin Training API send/publish workflow.
- Auto-generation of future workouts or programs.
- Full health/biometric ingestion from Garmin Health APIs.
- Automatic replanning of future schedules without explicit user review.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `training_history_entry`,
  - final outcome state,
  - original planned date/day and actual completion date when known,
  - completion relationship such as `as_planned`, `on_another_day`, `partial`, `skipped`, `moved_forward`, or `needs_review`,
  - source metadata,
  - timestamps,
  - manual comments,
  - external provider references,
  - reconciliation status,
  - plan-intent snapshot or references needed so later retrospective AI can understand original horizon, date window, and competition intent without guessing from mutable labels.
- Local-only:
  - transient history filters,
  - unsaved comment draft,
  - temporary optimistic UI for non-destructive view state.
- Sync behavior:
  - scheduled program/session records remain planning truth until a final outcome is created,
  - marking `done` or `cancelled` must create or update one canonical history entry deterministically,
  - planner views must read history state rather than storing a separate completion truth,
  - provider reconciliation must never silently delete manual comments or overwrite conflicting outcomes.
- Conflict policy:
  - `manual_cancelled` vs provider `completed`, duplicate provider matches, or unresolved provider-to-session matches must enter explicit `needs_review` state instead of silent coercion.
  - If the app prompts about an uncompleted planned session, the user choice must produce an explicit planned-vs-actual record or planning update; it must not silently delete plan evidence.
- Invalidation:
  - any history mutation invalidates planner completion indicators, adherence summaries, history lists/details, and later retrospective-AI input views.

## Identity And Rename Contract

- Canonical stable IDs:
  - every history entry gets an immutable canonical ID independent of workout title, calendar position, or provider identifiers.
- Foreign references:
  - history entries may reference canonical `plan_session`, `workout`, and optional provider activity IDs, but those foreign IDs do not replace the history entry's own canonical ID.
- Human-readable identifiers:
  - workout/program names shown in history are presentation fields and may change later without rewriting history identity.
- Mutability rules:
  - outcome updates for the same underlying scheduled session must update the same canonical history entry unless product rules explicitly require a new versioned entry,
  - provider re-sync must not rebind one history entry onto a different scheduled session implicitly.
- Rename vs repurpose:
  - renaming a workout/program in place must preserve history linkage,
  - materially repurposing a future scheduled session should create a new canonical planning entity so older history remains semantically correct.
- Compatibility contract:
  - analytics, comments, retrospective AI, and later exports must resolve history by canonical IDs even if titles or calendar positions change.
- Observability and repair:
  - duplicate matches, orphan history entries, and provider-link drift must be measurable and surfaced with repair guidance.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                      | Evidence                              |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | Users can understand planned vs completed vs cancelled vs needs-review states with one coherent planner-to-history IA.                | UX flows + route/state map            |
| UX flow clarity                               | `target`     | User can mark a scheduled session done or cancelled and find it again in history in <= 2 minutes without documentation.               | e2e + timed manual QA                 |
| Visual design quality                         | `supporting` | Supporting only: history views must feel production-ready, but broader visual system ownership lives in shared app UI patterns.       | design QA + scope rationale           |
| Business logic correctness and data integrity | `target`     | No duplicate/orphan history records under retry/conflict paths; conflicting outcomes never silently overwrite each other.             | unit/integration invariants           |
| Admin editor ergonomics                       | `supporting` | Supporting only: no high-frequency admin content-edit workflow is introduced in this user-history slice.                              | scope rationale                       |
| Accessibility (a11y)                          | `target`     | Keyboard/screen-reader users can trigger done/cancel actions, read outcome state, and manage comments without critical blockers.      | a11y checks + manual keyboard QA      |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: history routes and planner overlays must avoid obvious regressions and stay within normal route budgets.             | perf checks + scope rationale         |
| Data placement and sync boundaries            | `target`     | Planner state vs canonical history truth vs provider reconciliation ownership is explicit and reflected in tests.                     | brief contract + integration tests    |
| Caching and invalidation strategy             | `target`     | Planner indicators, adherence summaries, and history views refresh deterministically after any history mutation or reconciliation.    | integration tests + cache notes       |
| Reliability and failure handling              | `target`     | Manual/provider failure and conflict states always produce retry/review guidance with no dead-end or ambiguous outcome state.         | e2e + negative-path tests             |
| Security and authz                            | `target`     | Protected history mutations and comments fail closed (`401/403`) and malformed provider payloads cannot mutate another user's state.  | negative-path API tests               |
| Privacy and compliance                        | `supporting` | Supporting only: manual comments and provider metadata must avoid leaking unrelated personal or prompt data beyond defined scope.     | payload review + scope rationale      |
| Content governance                            | `supporting` | Supporting only: canonical workout/program governance is upstream, but history must preserve stable references to it.                 | linked briefs + scope rationale       |
| Admin workflow and editability                | `supporting` | Supporting only: support/ops visibility may be needed later, but primary admin tooling is not owned by this foundation brief.         | scope rationale                       |
| SEO and crawlability                          | `supporting` | Supporting only: authenticated history pages are not primary public crawl targets for this slice.                                     | scope rationale                       |
| AI discoverability                            | `supporting` | Supporting only: this brief prepares retrospective AI inputs, but does not create public AI-discoverable pages.                       | scope rationale                       |
| Analytics and KPI observability               | `target`     | Completion, cancellation, source, and review-state events emit with stable taxonomy and safe canonical references.                    | event catalog + analytics tests       |
| Commerce and revenue ops                      | `supporting` | Supporting only: no direct billing or entitlement mutation ships in this history foundation slice.                                    | scope rationale                       |
| Incident response and support operations      | `supporting` | Supporting only: repair guidance and support diagnostics must exist for provider mismatch/conflict states before those slices launch. | runbook notes + scope rationale       |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation is introduced; training-history status must not affect finance truth.                  | scope rationale                       |
| i18n operational readiness                    | `supporting` | Supporting only: outcome labels, comments UI, and review-state copy must remain locale-extensible later.                              | copy contract + scope rationale       |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js/TypeScript/Supabase/job patterns first; avoid unnecessary activity-sync or comment-editor dependencies.          | architecture review + dependency diff |
| Testing and QA automation                     | `target`     | Manual complete/cancel/comment flows, conflict paths, and protected API paths are covered with low-flake unit/integration/e2e tests.  | test matrix + verify outputs          |
| Scalability and cost efficiency               | `supporting` | Supporting only: reconciliation and later AI review hooks must avoid runaway duplicate writes or expensive reprocessing loops.        | scope rationale + architecture review |
| DevOps and rollback readiness                 | `target`     | History schema and reconciliation rollout include reversible migrations, repair guidance, and safe disable paths for provider sync.   | migration notes + rollback checklist  |

## Acceptance Criteria

- Users can mark a scheduled session `done` manually and see it appear in training history as `completed`.
- Users can mark a scheduled session `cancelled` manually and see it appear in training history as `cancelled`.
- Users can record that a planned session was completed on another day, partly completed, skipped, or moved forward without losing the original planned date.
- Manual comments persist on history entries without breaking canonical identity or later reconciliation.
- Program history can show planned vs actual adherence for a saved program without rewriting the original plan.
- Planner/calendar views read canonical history outcome state rather than maintaining a second completion truth.
- Conflicting provider/manual outcomes enter explicit `needs_review` state instead of silent overwrite.
- Later retrospective AI evaluation can consume canonical history entries and comments without becoming the source of truth for outcome state.
- Later retrospective AI evaluation can also consume original plan-intent metadata, including planning horizon, original date window, and competition-date/peak intent where present, without becoming the source of truth for outcome state.
- Brief is scorecard-complete and identity-safe before implementation starts.

## Validation

- targeted unit/integration tests for done/cancel/comment state transitions and conflict handling
- negative-path tests for unauthorized/forbidden history mutations
- e2e for planner -> complete/cancel -> history review flow
- `npm run lint:briefs`
- `npm run verify:pre-pr`

## Checkpoint Log

- `2026-03-20 | planning | created a dedicated history/completion parent brief so manual done/cancel/comments, later Garmin Activity API reconciliation, and retrospective AI evaluation have one canonical state model instead of being split across planner and send-to-Garmin slices | next: use this brief to keep planner, Garmin send, and later provider-ingest work from inventing parallel completion/history truth`
- `2026-03-20 | planning | clarified that retrospective evaluation should retain original plan-intent context such as planning horizon, explicit date window, and explicit competition-date peak/taper intent, so future AI review can judge sessions against what the plan was actually trying to do | next: keep later history schema and AI evaluation slices aligned to canonical plan-intent metadata rather than mutable week labels`
- `2026-05-01 | roadmap alignment | captured owner real-life scheduling requirements: preserve planned and actual states separately, support completed-as-planned, completed-on-another-day, partly-completed, skipped/cancelled, and moved-forward outcomes, and keep later AI feedback/adaptive replanning dependent on canonical history instead of planner-local flags | next: keep AI session V1 free of history implementation while preserving these contracts for the later program/history slice`
