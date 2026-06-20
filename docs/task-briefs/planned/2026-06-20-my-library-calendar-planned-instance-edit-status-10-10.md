# Task Brief: My Library Calendar Planned Instance Edit And Status Actions (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-planned-instance-edit-status-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `child`: `C`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@1b8f87da`
- `audit_status`: `ready_after_child_a`
- `decision`: Execute after planned workout instances exist and after the owner confirms the edit placement in week/month/day detail.
- `reason`: Planned sessions need safe mutation semantics before the calendar can support editing before completion.
- `must_refresh_before_execution_if`: Refresh if planned instance schema, Program Builder edit behavior, completion/history contracts, or month/day-detail UX changes.

## Goal

Let users edit, move, skip, delete, and recover planned-only workout instances before they are completed, while preserving canonical identity for future completion and Garmin linkage.

## Pre-Implementation Owner Explanation

Codex skal gjøre planlagte kalenderøkter redigerbare før de er utført. Det betyr at en bruker kan flytte, hoppe over, fjerne eller rette en planlagt økt uten at vi later som den er en fullført økt. Utenfor scope er faktisk `mark done`, Garmin, habits, Perfect Day og redigering av fullført historikk.

## Scope

- Add explicit planned-only status/actions for planned instances.
- Support safe move/reschedule for planned-only rows.
- Support skip/delete/recover where data integrity allows it.
- Define rename-vs-repurpose rules for changing workout/program references.
- Keep completed/history-linked rows immutable unless a later completion child owns correction behavior.
- Update calendar day detail or week list placement for actions.
- Add tests for invalid/cross-user/stale planned instance mutations.

## Out Of Scope

- Creating actual completed activity events.
- Garmin/provider sync or reconcile.
- Habit/micro/Perfect Day layer editing.
- Drag/drop recurrence rules without explicit data-boundary tests.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical: planned instance row, status, planned date, program/week/assignment/workout references.
- Local-only: open action menus, selected day/detail panel, unsaved form input.
- Mutation policy: planned-only rows may change; completed/history-linked rows require a later compatibility contract.
- Invalidation: calendar month/week/day views refresh after mutation.

## Identity And Forward Compatibility Contract

- `planned_workout_instances.id` remains stable for the same intended planned occurrence.
- Moving a planned-only instance changes date/status, not identity, unless the user intentionally creates a new planned occurrence.
- Unknown statuses render as review states and cannot be treated as completed.
- Future completion events must link to planned instance IDs instead of copying display labels.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                         | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can safely edit planned-only sessions before completion from the calendar detail flow.                           | UX tests + screenshot handoff               | `5/5`                   |
| UX flow clarity                               | `target`     | Move, skip, delete, recover, and edit actions are clearly distinguished from completion.                               | component tests + copy review               | `5/5`                   |
| Visual design quality                         | `target`     | Actions use existing button/menu patterns and do not crowd month cells or mobile cards.                                | responsive screenshots                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Only owner-scoped planned-only instances mutate; identity and references remain deterministic.                         | mutation tests + invariants                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes end-user calendar planning, not admin editing.                                                | explicit admin non-scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Action menus/forms are keyboard reachable and announce destructive/recovery states.                                    | a11y + keyboard tests                       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Mutations do not add material client bundle growth or unbounded reloads.                                               | bundle/revalidation review                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned edits mutate planned instance state only; actual outcomes remain external.                                     | data contract + route tests                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar views refresh after edit/skip/delete/recover without stale success states.                                    | invalidation tests                          | `5/5`                   |
| Reliability and failure handling              | `target`     | Stale rows, missing refs, invalid dates, and forbidden mutations show recoverable errors.                              | negative-path tests                         | `5/5`                   |
| Security and authz                            | `target`     | Cross-user planned instance mutation fails closed with `401`/`403`, not data leakage.                                  | authz negative-path tests                   | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: mutation payloads include owner-scoped planning data only.                                            | payload review                              | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: source workout/program content remains owned by existing editors.                                     | scope review                                | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflows, labels, or operator actions change.                                                    | explicit admin workflow non-scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because private calendar mutations are not public crawl surfaces.                                                  | private-route rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because planned edits are private user data and not public AI-discoverable content.                                | private-data rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if action events are added, they use stable action/status taxonomy and no completion KPI.             | event review or no-new-event rationale      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: planning mutations do not affect checkout, billing, or entitlement truth.                             | scope review                                | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: support can distinguish forbidden, stale, missing-ref, and invalid-date failures.                     | support-copy/log review                     | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not change revenue, invoices, refunds, payouts, entitlement reporting, or accounting data. | explicit finance non-scope rationale        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: action/status copy avoids identity coupling and is ready for later localization.                      | copy review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing App Router, Supabase helpers, validation patterns, and UI primitives; add no new dependency.            | package diff + architecture review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Include unit, mutation, authz, component, screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`.                     | validation outputs                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: mutations stay single-row/bounded and avoid broad resync unless necessary.                            | query review                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Status/action changes can be reverted without corrupting planned instance identity.                                    | rollback notes + PR validation              | `5/5`                   |

## Acceptance Criteria

- Planned-only instances can be edited/moved/skipped/deleted/recovered through clear actions.
- Completed/history-linked rows are protected until a later child owns correction.
- Invalid and cross-user mutations fail closed.
- Calendar views update after mutation.

## Validation Plan

- `npm run lint:briefs`
- Focused mutation and component tests.
- Screenshot handoff for changed action surfaces.
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-20 | planned | created as Child C after owner asked to systematize edit-before-done and planned status actions | next: execute after Child A and the month/day-detail placement decision`
