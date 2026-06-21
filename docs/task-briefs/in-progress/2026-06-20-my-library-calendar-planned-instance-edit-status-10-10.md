# Task Brief: My Library Calendar Planned Instance Edit And Status Actions (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-planned-instance-edit-status-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-21`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `C`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@6e173c20`
- `audit_status`: `execution_started_after_child_b`
- `decision`: Execute now after Child `A` shipped planned workout instances and Child `B` shipped the month/day-detail placement. Scope is planned-instance-only mutation from selected-day detail.
- `reason`: Planned sessions need safe mutation semantics before completion/history can be added. This child must let users correct the plan without creating actual outcome truth.
- `must_refresh_before_execution_if`: Refresh if planned instance schema, Program Builder edit behavior, completion/history contracts, month/day-detail UX, screenshot handoff rules, verification lanes, or route-label support-surface rules change.

## Goal

Let users edit, reschedule, skip, soft-delete/cancel, and recover planned-only workout instances before they are completed, while preserving canonical identity for future completion and Garmin linkage.

## Pre-Implementation Owner Explanation

Codex skal gjøre planlagte kalenderøkter redigerbare før de er utført. Det betyr at en bruker kan endre dato, hoppe over, skjule/avlyse og gjenopprette en planlagt økt uten at vi later som den er en fullført økt. Utenfor scope er faktisk `mark done`, Garmin, habits, micro sessions, Perfect Day og redigering av fullført historikk.

## Scope

- Add explicit planned-only status/actions for planned instances.
- Support safe reschedule for planned-only rows from selected-day detail.
- Support skip, soft delete/cancel, and recover where data integrity allows it.
- Define rename-vs-repurpose rules for changing workout/program references; this child changes the plan instance, not source workout/program content.
- Add stale-row conflict protection so mutations stop when the instance changed, disappeared, or became completion/history-linked after the page loaded.
- Keep month cells passive and place actions in selected-day detail to preserve scan readability.
- Keep completed/history-linked rows immutable unless a later completion child owns correction behavior.
- Update calendar day detail or week list placement for actions.
- Add tests for invalid/cross-user/stale planned instance mutations.

## Out Of Scope

- Creating actual completed activity events or any `done`/`completed` state.
- Garmin/provider sync or reconcile.
- Habit/micro/Perfect Day layer editing.
- Drag/drop recurrence rules without explicit data-boundary tests.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical: planned instance row, status, planned date, program/week/assignment/workout references.
- Local-only: open action menus, selected day/detail panel, unsaved form input.
- Mutation policy: planned-only rows may change; completed/history-linked rows require a later compatibility contract.
- Delete policy: this child uses reversible soft status for removal/cancellation instead of physical row deletion.
- Conflict policy: stale `updated_at`/status mismatches fail closed and ask the user to refresh before retrying.
- Invalidation: calendar month/week/day views refresh after mutation.

## Identity And Forward Compatibility Contract

- `planned_workout_instances.id` remains stable for the same intended planned occurrence.
- Rescheduling a planned-only instance changes date/status, not identity, unless the user intentionally creates a new planned occurrence.
- Unknown statuses render as review states and cannot be treated as skipped, cancelled, or completed.
- Future completion events must link to planned instance IDs instead of copying display labels.

## Stack And Evidence Notes

- Reference surface: reuse the existing `CalendarPlanWeekHub` selected-day detail and My Library action-button styling; month cells remain passive scan targets and do not become an edit surface.
- Session-step reference contract: `docs/design/session-step-surface-contract.md` is N/A for this slice because no swim-session step renderer, step view-model, `Edit`, `Rearrange`, or step `View` surface changes; source workout editing stays linked through the existing `Open workout` route.
- Route-label-support-surface-impact-sweep: identifiers searched include `planned_workout_instances`, `Calendar`, `Move`, `Moved`, `Reschedule`, `Rescheduled`, `Skip`, `Cancel`, `Recover`, `Review status`, `date_override_kind`, and `completion history`.
- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, and Help/Guide-facing support docs. Fallout handled in `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, route tests, component tests, and this active brief.
- Failure-mode evidence: route tests cover auth failure, cross-user not found, stale conflict, invalid date, unknown future status, Supabase load unexpected 500, and Supabase update unexpected 500 with bounded messages instead of data leakage.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                         | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can safely edit planned-only sessions before completion from the selected-day calendar detail flow.                                              | UX tests + screenshot handoff                | `5/5`                   |
| UX flow clarity                               | `target`     | Reschedule, skip, soft-delete/cancel, recover, and edit actions are clearly distinguished from completion.                                             | component tests + copy review                | `5/5`                   |
| Visual design quality                         | `target`     | Actions use existing button/menu patterns and do not crowd month cells or mobile cards.                                                                | responsive screenshots                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Only owner-scoped planned-only instances mutate; identity, references, soft status, and stale-row checks remain deterministic.                         | mutation tests + invariants                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes end-user calendar planning, not admin editing.                                                                                | explicit admin non-scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Action menus/forms are keyboard reachable and announce destructive/recovery states.                                                                    | a11y + keyboard tests                        | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Mutations do not add material client bundle growth or unbounded reloads.                                                                               | bundle/revalidation review                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned edits mutate planned instance state only; actual outcomes remain external.                                                                     | data contract + route tests                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar views refresh after edit/skip/delete/recover without stale success states.                                                                    | invalidation tests                           | `5/5`                   |
| Reliability and failure handling              | `target`     | Stale rows, missing refs, invalid dates, unknown statuses, forbidden mutations, and unexpected 500/failure-mode paths show bounded recoverable errors. | negative-path tests + 500 failure-mode tests | `5/5`                   |
| Security and authz                            | `target`     | Cross-user planned instance mutation fails closed with `401`/`403`, not data leakage.                                                                  | authz negative-path tests                    | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: mutation payloads include owner-scoped planning data only.                                                                            | payload review                               | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: source workout/program content remains owned by existing editors.                                                                     | scope review                                 | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflows, labels, or operator actions change.                                                                                    | explicit admin workflow non-scope rationale  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because private calendar mutations are not public crawl surfaces.                                                                                  | private-route rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because planned edits are private user data and not public AI-discoverable content.                                                                | private-data rationale                       | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if action events are added, they use stable action/status taxonomy and no completion KPI.                                             | event review or no-new-event rationale       | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: planning mutations do not affect checkout, billing, or entitlement truth.                                                             | scope review                                 | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can distinguish forbidden, stale, missing-ref, and invalid-date failures.                                                     | support-copy/log review                      | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not change revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.                                 | explicit finance non-scope rationale         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: action/status copy avoids identity coupling and is ready for later localization.                                                      | copy review                                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing App Router, Supabase helpers, validation patterns, and UI primitives; add no new dependency.                                            | package diff + architecture review           | `5/5`                   |
| Testing and QA automation                     | `target`     | Include unit, mutation, authz, component, screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`.                                                     | validation outputs                           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: mutations stay single-row/bounded and avoid broad resync unless necessary.                                                            | query review                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Status/action changes can be reverted without corrupting planned instance identity.                                                                    | rollback notes + PR validation               | `5/5`                   |

## Acceptance Criteria

- Planned-only instances can be edited/rescheduled/skipped/soft-deleted/recovered through clear selected-day actions.
- Soft-deleted/cancelled instances remain reversible where data integrity allows it; no physical delete is required for normal UI removal.
- Stale, unknown-status, completed/history-linked, invalid-date, and cross-user mutations fail closed.
- Completed/history-linked rows are protected until a later child owns correction.
- Calendar views update after mutation.

## Validation Plan

- `npm run lint:briefs`
- Focused mutation, stale-conflict, authz, invalid-date, unknown-status, and component tests.
- Screenshot handoff for changed action surfaces.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created as Child C after owner asked to systematize edit-before-done and planned status actions | next: execute after Child A and the month/day-detail placement decision`
- `2026-06-21 | in-progress | owner approved end-to-end execution from clean main@6e173c20 after PR #1189/#1190; refreshed scope to planned-instance-only mutations, reversible soft status, stale-row protection, selected-day action placement, and no completion/history work | next: map current calendar/program contracts and implement focused mutation flow`
- `2026-06-21 | in-progress | implemented planned-instance-only API and UI actions for reschedule, skip, cancel, and recover; added date_override_kind so manual reschedules survive program sync; status allowlist now supports planned, skipped, and cancelled; unknown statuses fail closed as review states | validation: targeted Vitest calendar/program/route pack 28 passed, npm run typecheck passed, npm run lint passed with 7 existing output/ warnings, npm run lint:briefs:all passed, git diff --check passed | route-label/support sweep updated docs/user-flow-map.md and docs/runbooks/auth-account-support.md | next: capture screenshot handoff and wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-21 | screenshot-gate | owner requested Reschedule terminology and a 1-10 audit; updated UI/docs/tests from Move/Moved to Reschedule/Rescheduled, tightened program sync so manual date overrides preserve date/day/status without becoming a hidden position override, and made Rescheduled visible in month scan targets | validation: targeted Vitest calendar/program/route pack 29 passed, npm run typecheck passed, npm run lint passed with 7 pre-existing output/ warnings, npm run lint:briefs:all passed, git diff --check passed | screenshot artifacts: output/playwright/calendar-planned-actions-reschedule-2026-06-21-111209 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-21 | screenshot-gate-refresh | owner flagged Recover width on mobile; updated Recover to full-width on mobile and compact on larger viewports, refreshed screenshots, removed the temporary visual harness, and stopped the dev server | validation: targeted Vitest action pack 14 passed, npm run typecheck passed, git diff --check passed before screenshot refresh | screenshot artifacts: output/playwright/calendar-planned-actions-reschedule-2026-06-21-112249 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-21 | remote-schema-applied | first npm run verify:pre-pr failed on expected Supabase migration drift for 20260621100000_planned_workout_instance_status_actions.sql; migration list and dry-run showed exactly that one pending migration, npx supabase db push --linked --yes applied it, post-apply dry-run reported Remote database is up to date, and sequential migration list confirmed local/remote parity at 20260621100000 | next: rerun npm run verify:pre-pr`
- `2026-06-21 | quality-gate-fix | npm run verify:pre-pr rerun passed Supabase drift but stopped on missing quality-gate evidence keywords for unexpected 500/failure-mode, route-label/support sweep, and reference surface; added bounded 500 route tests plus explicit reference surface, session-step N/A, Help/Guide support surface, identifiers searched, surfaces checked, and fallout handled evidence | next: rerun targeted tests and npm run verify:pre-pr`
- `2026-06-21 | pre-pr-green | npm run verify:pre-pr passed full lane in artifacts/test-runs/20260621-113123/verify.log: branch-current, Supabase drift, quality gates, lint, typecheck, 1659 unit tests, build, perf budgets, and Playwright 111 passed / 567 skipped | perf-ratchet: script recommended tighten after 10 green runs, but owner direction holds the performance-ratchet brief until at least two new green weekly cycles after 2026-06-19 | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
