# Task Brief: Canonical Program Foundation And Library Shell (10/10)

## Metadata

- `id`: `2026-03-25-canonical-program-foundation-and-library-shell-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-25`
- `updated`: `2026-03-25`

## Goal

Introduce a canonical user-owned program entity, persistence model, and minimal My Library program shell so later planner, AI save, and export work all target one identity-safe program surface.

## Why This Brief Exists

- The program export follow-up is truthfully blocked because the repo still had no canonical `program` entity, `/api/my-library/programs` surface, or editable program route.
- The existing manual planner brief is intentionally broader than the smallest safe unblocking step; it also owns later completion/history handoff and richer planner UX.
- The repo already has canonical workouts, so the next smallest useful slice is to persist programs as first-class entities that reference those workouts instead of inventing parallel export-only or AI-only shapes.
- This brief creates the minimum stable program foundation that later planner, export, and AI acceptance slices can share without forking identity, storage, or schedule semantics.

## Dependencies And Boundaries

- Upstream canonical workout foundation already exists in code and remains the source of truth for referenced workout payloads.
- Broader downstream planner/completion scope remains in:
  - `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Downstream export work now continues in:
  - `docs/task-briefs/in-progress/2026-03-25-program-export-adapters-garmin-ready-pdf-followup-10-10.md`
- AI generation guardrails remain separate in:
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
- This brief owns:
  - canonical persisted `program` rows with stable nested week and assignment identities inside the stored `weeks` payload,
  - user-owned read/write API surface for program shells,
  - minimal My Library route/UI to create, open, title, and schedule referenced workouts into weeks/days,
  - invariant enforcement for stable identity and workout references.
- This brief does not own:
  - AI-authored multi-week plan generation,
  - planner completion/cancel/history truth,
  - rich weekly metrics/adherence summaries,
  - Garmin-ready or PDF export output,
  - marketing `/programs` page redesign.

## Scope

- Persistence and schema:
  - canonical `programs` table with stable program identity and user ownership,
  - atomic `weeks` JSON payload with immutable week + assignment IDs,
  - update-safe save contract that avoids partial multi-table writes in this first slice.
- Program server contract:
  - typed shared program models for editor + summary payloads,
  - loader/normalizer utilities,
  - deterministic validation for week/day placement, referenced workouts, and ordering.
- Protected user API:
  - create manual starter program shell,
  - load selected program,
  - save title/week/day assignment edits for the authenticated owner.
- My Library user surfaces:
  - program entry point on `/my-library`,
  - dedicated `/my-library/programs/[programId]` route,
  - minimal editor shell to title a program and assign existing canonical workouts into week/day cells.

## Out Of Scope

- AI program generation UX or save flows.
- Completion, cancellation, comments, adherence, or retrospective training-history state.
- Program summary analytics beyond the minimum required to render the shell safely.
- Export buttons, Garmin-ready payloads, printable PDF flows, or provider delivery.
- Public marketing/waitlist changes on `/programs`.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - canonical `program` rows,
  - nested week/assignment objects inside the stored `weeks` payload,
  - assignment ordering, day placement, and referenced `workout_id` values,
  - persisted program title and metadata needed to reopen the same shell later.
- Local-only:
  - unsaved editor draft mutations before explicit save,
  - temporary workout picker/query state,
  - optimistic UI state for non-destructive assignment edits.
- Sync behavior:
  - server remains source of truth for persisted program structure,
  - save endpoints must validate referenced workouts belong to the same authenticated owner,
  - optimistic updates are allowed only when they can be deterministically rolled back from canonical response,
  - stale or conflicting writes must fail with explicit recoverable guidance rather than silently reordering/mutating canonical assignments.
- Retention and sensitivity:
  - program records are user-owned training planning data and must delete with the owning account,
  - no unrelated profile/goals/history/comment payloads should be embedded into program rows.
- Cache/invalidation:
  - any program mutation invalidates recent-program summaries and the selected program route,
  - any deleted or missing referenced workout must surface an explicit invalid-reference state rather than being silently dropped.

## Identity And Rename Contract

- Canonical stable IDs:
  - `program.id` plus nested `week.id` and `assignment.id` values are immutable canonical identifiers used across persistence, planner, export, and future AI acceptance flows.
- Human-readable identifiers:
  - program title is editable presentation text,
  - week labels and day placement are presentation/scheduling metadata and must never be treated as identity.
- Mutability rules:
  - moving an assignment between week/day positions or reordering within a day must preserve the same `assignment.id`,
  - renaming a program must preserve the same `program.id`,
  - changing the referenced `workout_id` on an assignment is allowed only when the assignment still represents the same scheduled slot rather than a historical completed record.
- Rename vs repurpose:
  - retitling or rescheduling within the same plan is an in-place edit,
  - materially replacing an entire training plan should create a new `program` entity instead of overwriting one plan into a different one.
- Compatibility contract:
  - later export, planner, and AI save flows must resolve program structures by canonical IDs and may not infer identity from titles, week numbers, or workout names,
  - legacy absence of canonical programs is handled by empty-state/create flow rather than aliasing the public `/programs` page.
- Observability and repair:
  - unresolved referenced workouts, duplicate day-order collisions, and orphaned week/assignment reads must be detected deterministically and surfaced in logs plus user-facing recovery copy.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                                   | Evidence                             |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Signed-in users can create/open one canonical program shell from My Library and understand that workouts are being scheduled into a saved program. | e2e journey + UI copy review         |
| UX flow clarity                               | `target`     | User can create a starter program and place at least one saved workout into a week/day slot in <= 3 minutes without documentation.                 | timed manual QA + e2e                |
| Visual design quality                         | `supporting` | Supporting only: the program shell should match existing My Library/workout-builder language without introducing a new visual system.              | UI QA + scope rationale              |
| Business logic correctness and data integrity | `target`     | No duplicate/orphan week or assignment identities after retries/reorders; assignment references always point to owner-visible workouts.            | unit/integration invariants          |
| Admin editor ergonomics                       | `supporting` | Supporting only: this slice changes end-user My Library flows, not primary admin editing surfaces.                                                 | scope rationale                      |
| Accessibility (a11y)                          | `target`     | Keyboard users can create/open a program shell, assign workouts, and save edits with no critical accessibility violations on changed routes.       | e2e a11y + manual keyboard QA        |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: changed My Library routes should stay within existing route budgets with no obvious payload regression.                           | build/perf review + scope rationale  |
| Data placement and sync boundaries            | `target`     | Program local-vs-server ownership, conflict behavior, and invalidation rules are explicit and reflected in code/tests.                             | brief contract + integration tests   |
| Caching and invalidation strategy             | `target`     | Recent-program summaries and selected program route refresh deterministically after save with no stale assignment ordering.                        | integration tests + cache review     |
| Reliability and failure handling              | `target`     | Missing schema, invalid workout references, and save failures surface actionable recovery without dead-end editor states.                          | negative-path tests + e2e            |
| Security and authz                            | `target`     | Unauthorized reads/writes fail closed (`401/403`), and cross-user workout/program references are rejected without mutating data.                   | API negative-path tests              |
| Privacy and compliance                        | `supporting` | Supporting only: program payloads should not leak unrelated notes/history/profile details beyond explicit workout references.                      | payload review + scope rationale     |
| Content governance                            | `supporting` | Supporting only: canonical workout content remains upstream; this slice preserves references to it.                                                | linked brief + scope rationale       |
| Admin workflow and editability                | `supporting` | Supporting only: no primary admin workflow change ships in this program foundation slice.                                                          | scope rationale                      |
| SEO and crawlability                          | `supporting` | Supporting only: authenticated My Library program routes are not public crawl targets.                                                             | scope rationale                      |
| AI discoverability                            | `supporting` | Supporting only: this slice creates canonical storage for future AI flows but does not publish public AI-discoverable content.                     | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: create/open/save events should remain traceable with canonical program IDs where product already emits library telemetry.         | event review + scope rationale       |
| Commerce and revenue ops                      | `supporting` | Supporting only: no checkout or entitlement logic changes in this slice.                                                                           | scope rationale                      |
| Incident response and support operations      | `supporting` | Supporting only: support-visible diagnostics and recovery copy should exist for invalid/missing program references and schema-sync states.         | error contract + scope rationale     |
| Finance and reporting operations              | `supporting` | Supporting only: no finance/reporting mutation is introduced by canonical program storage.                                                         | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: new user-facing labels/copy must remain locale-extensible and avoid hard-coded identity semantics.                                | copy review + scope rationale        |
| Stack-fit and dependency discipline           | `target`     | Reuse current Next.js/Supabase/TypeScript/test stack and existing workout-library patterns without new dependencies.                               | package diff + architecture review   |
| Testing and QA automation                     | `target`     | Program server/shared invariants, API negative paths, and one create/open/save user journey are covered in unit+e2e before merge.                  | test matrix + verify outputs         |
| Scalability and cost efficiency               | `supporting` | Supporting only: program load/save should avoid duplicate queries and unnecessary nested rewrites for small shells.                                | code review + scope rationale        |
| DevOps and rollback readiness                 | `target`     | Program foundation can be rolled back via isolated schema/API/UI changes without corrupting workouts or export codepaths.                          | migration review + release checklist |

## Acceptance Criteria

- Signed-in users can create a canonical starter program from My Library.
- Users can reopen a saved program on `/my-library/programs/[programId]`.
- Users can assign at least one existing canonical workout into a saved week/day slot and persist that assignment.
- Canonical program, week, and assignment IDs stay stable across rename and reorder/reschedule edits.
- Unauthorized or cross-user program/workout mutations fail closed without partial writes.
- Missing schema or invalid referenced workouts show actionable recovery copy instead of empty success states.
- This foundation leaves planner completion/history and export explicitly for downstream briefs instead of inventing parallel temporary contracts.

## Validation

- `npm run lint:briefs`
- targeted unit/integration tests for program shared/server/api invariants
- targeted e2e for create/open/save program shell flow
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Help/Guide And Operator Training Contract

- `N/A` for admin/operator docs because this slice changes user-owned My Library flows only.
- The shipped UI must still use self-explanatory empty/error/recovery copy; if non-obvious recovery behavior is added, update the relevant My Library/help copy in the same PR.

## Checkpoint Log

- `2026-03-25 | planning | created this narrower upstream slice after PR #292 merged and confirmed that program export is blocked by missing canonical program entity/API/editor surfaces, while the broader planner brief remains intentionally larger than the minimum unblocking step | next: implement schema + API + minimal My Library program shell from updated main without reopening export or completion scope`
- `2026-03-25 | in-progress | started implementation on branch \`feat/program-foundation-2026-03-25\`, chose one canonical \`programs\` row with stable nested week/assignment IDs inside \`weeks\` JSON so saves stay atomic in the existing Supabase stack, and landed initial schema/shared/API/My Library shell plus targeted program unit coverage green | next: run broader validation, then open PR once \`verify:pre-pr\` is green`
- `2026-03-25 | merged | canonical program foundation shipped in PR #293 and merged to \`main\` as \`e1531ff\`, including the new \`programs\` table, user-owned program APIs, and the dedicated My Library program shell route; local \`npm run verify:pre-pr\`, local \`npm run verify:pre-merge\`, and required CI all passed before merge | next: resume the downstream program export follow-up from updated \`main\` now that canonical program identity and editor surfaces exist`
