# Task Brief: Admin All Content Scope-First + Mirror Launchers (10/10)

## Metadata

- `id`: `2026-03-05-admin-all-content-scope-first-mirror-launchers-10-10`
- `status`: `in-progress`
- `priority`: `P1`
- `owner`: `stianvikra`
- `created`: `2026-03-05`
- `updated`: `2026-03-05`

## Goal

Make `All Content` scope-first (one group at a time) so editors avoid long mixed scrolling, while `Platform mirror snapshot` cards act as direct launchers into that scope.

## Why This Brief Exists

- Current `All Content` can become a long mixed list when set to `all`.
- Editorial flow is faster when scope is explicit (`modules`, `lessons`, `0-1000 sessions`, `poolside drills`, `programs/products`, `pages`).
- Mirror cards already communicate structure; they should remain a primary jump control.

## Dependencies And Boundaries

- Depends on:
  - `docs/task-briefs/in-progress/2026-03-05-admin-content-course-workspace-vs-all-content-tabs-10-10.md`
- Scope limited to admin UI orchestration + help copy + test contracts.
- No API/schema changes.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items` and mirror snapshot payload from `/api/admin/content`.
- Local-only:
  - selected `All Content` scope (stored in browser to keep editor preference).
- Sync policy:
  - mirror-card click sets local filters only.
  - no hidden writes to server.
- Cache/invalidation:
  - unchanged (`no-store` reads + explicit refresh/load).

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                          | Evidence                    |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------- | --------------------------- |
| Product goals and IA                          | `target`     | `All Content` defaults to scoped view, with explicit `All content (audit)` mode.          | e2e assertions + manual QA  |
| UX flow clarity                               | `target`     | Editors can switch scope in one click and avoid mixed-list overload by default.           | e2e + manual walkthrough    |
| Visual design quality                         | `target`     | Scope controls + mirror active-state fit existing admin style without visual regressions. | visual QA                   |
| Business logic correctness and data integrity | `supporting` | Filtering behavior is deterministic and does not mutate server data.                      | regression tests            |
| Admin editor ergonomics                       | `target`     | Mirror cards and scope chips launch users directly into the intended content group.       | e2e + manual editorial flow |
| Accessibility (a11y)                          | `target`     | Scope controls and mirror cards remain keyboard-operable with clear state.                | Playwright interactions     |
| Performance (CWV + payloads)                  | `supporting` | N/A (UI/filter orchestration only).                                                       | N/A                         |
| Data placement and sync boundaries            | `target`     | Scope preference is local-only and stable across reloads.                                 | code review + manual QA     |
| Caching and invalidation strategy             | `supporting` | N/A                                                                                       | N/A                         |
| Reliability and failure handling              | `target`     | Filter/focus/empty states remain coherent when scope changes.                             | e2e + manual QA             |
| Security and authz                            | `supporting` | N/A                                                                                       | unchanged route guards      |
| Privacy and compliance                        | `N/A`        | N/A                                                                                       | N/A                         |
| Content governance                            | `supporting` | N/A                                                                                       | N/A                         |
| Admin workflow and editability                | `target`     | Existing edit/create/publish actions remain available in scoped mode.                     | e2e regression              |
| SEO and crawlability                          | `N/A`        | N/A                                                                                       | N/A                         |
| AI discoverability                            | `N/A`        | N/A                                                                                       | N/A                         |
| Analytics and KPI observability               | `supporting` | N/A                                                                                       | N/A                         |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                       | N/A                         |
| Incident response and support operations      | `supporting` | Help/Guide text stays aligned with updated scope behavior.                                | help-center test            |
| Finance and reporting operations              | `N/A`        | N/A                                                                                       | N/A                         |
| i18n operational readiness                    | `supporting` | Scope labels remain explicit constants and easy to localize later.                        | code review                 |
| Stack-fit and dependency discipline           | `target`     | No new dependency added.                                                                  | dependency diff             |
| Testing and QA automation                     | `target`     | Updated e2e contracts pass in `verify:pre-pr`.                                            | command evidence            |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                       | N/A                         |
| DevOps and rollback readiness                 | `supporting` | UI-only rollback remains simple (single PR revert).                                       | PR diff review              |

## Scope

- Default `All Content` to scoped view (`course_module`) instead of `all`.
- Persist selected scope locally for editor continuity.
- Keep explicit `All content (audit)` scope option.
- Ensure mirror snapshot cards launch and indicate active scope.
- Update Help/Guide copy to reflect scope-first behavior.
- Update e2e assertions for new default scope behavior.

## Out Of Scope

- API contract/schema changes.
- New analytics event contracts.
- Redesign outside current admin visual language.

## Acceptance Criteria

1. `All Content` no longer defaults to fully mixed list.
2. Mirror cards open correct scope and visually indicate active scope.
3. `All content (audit)` remains available as an explicit user choice.
4. Existing edit/create/status actions remain intact.
5. Help/Guide text matches new behavior.
6. `npm run verify:pre-pr` passes before PR update.

## Validation

- targeted e2e:
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-content-parity.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Checkpoint Log

- `2026-03-05 | working tree | implemented scope-first All Content (default scope + explicit audit mode), mirror-card active-state focus, local scope persistence, updated Help/Guide copy, and adjusted admin foundation e2e assertions for new clear-focus behavior | npm run verify:pre-pr passed (73 passed / 179 skipped) | next: commit, push, update PR in Safari`
- `2026-03-05 | kickoff | follow-up slice started for scope-first All Content + mirror launcher UX to reduce mixed-list friction | next: implement UI/filter state + update tests + run verify:pre-pr`
