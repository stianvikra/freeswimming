# Task Brief: My Library Calendar Completion Events And Manual Mark Done (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `D`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@1b8f87da`
- `audit_status`: `ready_after_child_a`
- `decision`: Execute after planned instances exist and the training-history/completion boundary is refreshed.
- `reason`: Marking a workout as done must create actual outcome truth, not mutate planned rows into history.
- `must_refresh_before_execution_if`: Refresh if training-history brief, planned instance schema, workout execution contract, Garmin scope, or support diagnostics change.

## Goal

Add canonical completed activity events and a manual "mark as done" flow for planned swim sessions, linking actual outcomes to planned instances without replacing planned identity.

## Pre-Implementation Owner Explanation

Codex skal gjøre det mulig å markere en planlagt økt som utført manuelt. Det er viktig fordi faktisk trening må lagres som egen historikk, ikke som en omskriving av planen. Utenfor scope er Garmin-import, habits/micro/Perfect Day layers, avansert analyse og økonomi/adminrapportering.

## Scope

- Add canonical completed activity event storage or update the training-history contract if it already owns this table.
- Let a user mark a planned swim as completed from the calendar detail flow.
- Link completed event to `planned_workout_instances.id` and `workout.id`.
- Render planned vs completed state deterministically.
- Add correction/recovery copy for duplicate, stale, or forbidden completion attempts.
- Add negative-path authz and duplicate/idempotency tests.

## Out Of Scope

- Garmin import/reconcile.
- Habit, micro session, or Perfect Day aggregation.
- Editing completed history as if it were planned-only.
- Broad analytics dashboards or finance/admin reporting.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical: planned instance, completed activity event, workout reference, user ownership.
- Local-only: confirmation dialog state and pending form input.
- Idempotency: repeated mark-done attempts for the same planned instance must not create duplicate actual truth.
- Invalidation: calendar day/month/week summaries refresh after completion mutation.

## Identity And Forward Compatibility Contract

- `planned_workout_instances.id` identifies the intended planned occurrence.
- Completed event ID identifies actual outcome truth.
- Future provider imports reconcile into completed events, not directly into planned rows.
- Unknown provider/completion states fail closed until explicitly mapped.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                        | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can mark a planned swim as completed and see the distinction between plan and actual outcome.                   | route/component tests + screenshot handoff  | `5/5`                   |
| UX flow clarity                               | `target`     | Completion, duplicate, correction, and already-completed states are clear without docs.                               | copy review + tests                         | `5/5`                   |
| Visual design quality                         | `target`     | Completion actions fit the day/detail surface and do not crowd month cells or planned cards.                          | responsive screenshots                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Completed events are canonical, idempotent, owner-scoped, and linked to planned instances without replacing them.     | mutation/invariant tests                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an end-user completion flow and no admin editor changes.                                          | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Completion dialogs/actions are keyboard reachable and announce success/error/destructive states.                      | a11y + keyboard tests                       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Completion flow avoids material bundle growth and keeps reads bounded to selected calendar windows.                   | bundle/query review                         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned data and actual completion data stay separate with explicit linkage.                                          | data contract + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar views refresh after completion and do not show stale planned-only status.                                    | invalidation tests                          | `5/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, stale, missing-ref, invalid-state, and load failures show deterministic recovery paths.                    | negative-path tests                         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous/cross-user completion attempts fail closed with `401`/`403`.                                                | authz tests                                 | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: completed event payloads include private owner-scoped training data only.                            | payload review                              | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program source content remains owned upstream.                                               | scope review                                | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, operator actions, or role-gated CRUD change.                                    | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because completion data is private and no public metadata/crawl surfaces change.                                  | private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because completed activity events are private user data and not public AI-discoverable content.                   | private-data rationale                      | `N/A`                   |
| Analytics and KPI observability               | `target`     | Completion events use stable event/status taxonomy and avoid double-counting duplicates.                              | event tests or analytics no-op rationale    | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: completion has no checkout, billing, or entitlement mutation.                                        | scope review                                | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can distinguish duplicate, forbidden, stale, and missing-reference completion failures.      | support-copy/log review                     | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not touch revenue, invoices, refunds, payouts, entitlement reporting, or accounting data. | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: completed, already completed, and correction labels avoid identity coupling for localization.        | copy review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing App Router, Supabase/RLS patterns, TypeScript validation, and UI primitives; add no unnecessary deps.  | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include schema, mutation, authz, component, screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`.                  | validation outputs                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: completion writes are idempotent/bounded and summary reads avoid N+1.                                | query tests                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Completion storage/actions can be rolled back without corrupting planned instances.                                   | rollback notes + PR validation              | `5/5`                   |

## Acceptance Criteria

- A planned swim can be manually marked completed.
- Duplicate completion attempts are idempotent or safely rejected.
- Planned and actual identity remain separate.
- Calendar views reflect completion after mutation.

## Validation Plan

- `npm run lint:briefs`
- Schema/mutation/authz tests.
- Component/page tests and screenshot handoff.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created as Child D after owner asked whether workouts can be marked as performed | next: refresh training-history boundary before execution`
