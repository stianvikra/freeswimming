# Task Brief: Training Observation Timestamps And Note Filters (10/10)

## Metadata

- `id`: `2026-04-03-training-observation-timestamps-and-note-filters-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Goal

Make the notes list in `/my-library/training` easier to review by showing when each note was logged and last edited, while adding lightweight search and filter controls that help users find older observations without changing any stored note data.

## Parent And Source Note

- Parent umbrella:
  - [2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md](/private/tmp/freeswimming-training-observations-timestamps-2026-04-03/docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md)
- Production admin note:
  - `99a18e5f-3b91-42d4-96d8-1d5f1343b05c` `Observations should have a date, also last edited.`
- Owner-requested scope extension for this slice:
  - add practical list filtering/search while we are already touching the training notes list.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                       | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Notes list metadata and controls make it obvious how to review older notes without adding route or IA confusion.                    | manual QA + unit coverage                                 | `5/5`                   |
| UX flow clarity                               | `target`     | Users can see logged/last-edited timestamps in one scan and narrow notes by search, type, status, and date without dead ends.      | unit tests + manual QA                                    | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: filters and timestamps should feel calm, compact, and aligned with existing My Library card language.              | screenshot review + code review                           | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Filtering and sorting remain pure client-side views over canonical note data and never mutate note content or timestamps.           | unit tests + code review                                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes end-user training notes review, not admin/operator editing workflows.                                | explicit scope rationale                                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Search, selects, date inputs, and clear-filter action remain labeled, keyboard reachable, and screen-reader understandable.         | semantic markup review + unit coverage                    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Filtering runs on existing snapshot data only and introduces no new network calls or material payload regression on `/my-library/training`. | targeted QA + `verify:pre-pr`                             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Note timestamps remain server-canonical while filter/search UI state stays local-only for the current session.                      | brief contract + code review                              | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: the list should still refresh from the canonical snapshot after note create/edit saves.                            | existing refresh path + regression review                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty-result filter states remain explicit and safe, and invalid timestamps fall back to a non-crashing label.                      | unit tests + code review                                  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: this slice must preserve existing owner-scoped training note access and not widen any protected route surface.     | route review + existing auth coverage                     | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: timestamps and search text stay within the authenticated user’s own training notes surface.                        | scope review + existing user scoping                      | `4/5`                   |
| Content governance                            | `N/A`        | N/A because no editorial publishing, content-source governance, or admin content model changes happen in this slice.               | explicit scope rationale                                  | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, publishing flow, or operator support panel behavior changes here.                                    | explicit scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/training` is an authenticated route and not a crawl target.                                                | explicit scope rationale                                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route semantics or public content discoverability surface.                                 | explicit scope rationale                                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice adds no new analytics contract; existing training-note create/update events remain unchanged.                | explicit scope rationale                                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or commercial messaging changes are in scope.                                        | explicit scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because no help-center or support-runbook contract changes are required for these self-explanatory list controls.              | explicit scope rationale                                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no finance, reconciliation, or reporting workflow.                                                   | explicit scope rationale                                  | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: filter labels and timestamp copy should stay straightforward to externalize later.                                 | copy review + scope rationale                             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React/Next.js state and training-note contracts with no new dependency or server endpoint.                           | dependency diff + code review                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Timestamp and filter behavior ship with targeted regression tests plus full `npm run verify:pre-pr` before PR handoff.             | unit tests + `verify:pre-pr`                              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: list controls should operate on existing note snapshot data without extra fetch or storage cost.                  | code review                                               | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this slice stays rollback-safe because it is a UI-only refinement with no schema change.                          | PR diff + rollback simplicity                             | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - `recentNotes` content, status, `createdAt`, and `updatedAt` values from the training-context snapshot.
- Local-only:
  - note search text,
  - selected type/status/date filters,
  - selected list sort order.
- Sync policy:
  - note create/update writes refresh the canonical snapshot as they do today,
  - timestamp labels and filtered results recompute from the refreshed snapshot only after successful save,
  - list filters do not persist to backend storage.
- Retention and sensitivity:
  - filter/search values are ephemeral UI state only,
  - timestamps and note bodies remain scoped to the authenticated user’s training view.
- Cache/invalidation:
  - no new cache layer is introduced,
  - existing snapshot refresh after note mutations remains authoritative.

## Identity And Rename Contract

- N/A because this slice does not introduce or rename persisted route, slug, or operator-visible entity identifiers.

## Scope

- `/my-library/training` note-list presentation in `TrainingContextHub`.
- Logged and last-edited timestamp labels on each rendered note card.
- Client-side search/filter/sort controls for the existing note list.
- Targeted regression coverage for timestamps and filters.
- Umbrella brief checkpoint updates for this slice.

## Out Of Scope

- Note schema changes or backend timestamp logic changes.
- Pagination, server-side querying, or URL-param-backed filter state.
- Changes to focus flows, goals flows, or note create/edit mutation contracts.
- Any change to manual `Swim session builder` inputs or builder forms elsewhere in the umbrella.

## Acceptance Criteria

1. Every visible training note card shows when it was logged and when it was last edited.
2. Users can search notes by keyword across note text and related context shown in the list.
3. Users can narrow the list by note type, note status, and created-date range.
4. Users can sort the list by newest, oldest, or recently edited.
5. Filtered empty states are explicit and recoverable through a clear reset action.
6. No new fetch path, schema change, or persisted preference is required for the filters to work.
7. The slice ships with targeted regression coverage plus full `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- `npx vitest run tests/unit/training-context-hub.test.tsx`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Worktree must have access to repo `node_modules` before running targeted tests.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/training`
  - desktop Chromium
  - desktop Safari/WebKit
- Preview:
  - PR Vercel preview URL for this slice
- Manual checks:
  - note cards show both timestamps,
  - filters narrow and recover the list cleanly,
  - no visual collision with note edit controls.

## Constraints

- Keep the slice UI-only and reuse the existing training-context snapshot.
- Do not add new dependencies.
- Keep note review calmer, not denser or more admin-like.
- Avoid hiding or mutating note data through filters; they should only change list visibility/order.

## 10/10 Quality Bar

- Timestamps should be easy to spot without overpowering the note body.
- The filters should help a user recover older observations quickly, not feel like a power-user admin panel.
- Required states in scope:
  - default list
  - filtered list
  - filtered empty state
  - note edit state
  - invalid timestamp fallback
- Filter controls must remain compact on smaller widths and readable on desktop.
- Business logic must stay deterministic:
  - created-date filters operate on canonical note created dates,
  - recently-edited sort uses canonical `updatedAt`,
  - clear filters returns the full list reliably.

## Help/Guide Impact

- `N/A`
  - no dedicated Help/Guide article mirrors the internal `/my-library/training` note-list filters, and the UI labels are self-explanatory enough not to require a help-center contract update in this slice.

## Checkpoint Log

- `2026-04-03 | a535de3 | implemented logged/last-edited note metadata plus note-list search, type/status/date filters, and sort controls in TrainingContextHub; targeted vitest, npm run typecheck, npm run lint:briefs:all, and full npm run verify:pre-pr are green | next: push branch, open PR, and take the slice through CI + pre-merge`
- `2026-04-03 | working tree | scoped child slice for admin note 99a18e5f to add logged/last-edited note timestamps plus lightweight note-list search/filter controls in TrainingContextHub | next: implement the UI, add targeted tests, and run validation`

## Completion Record

- `PR`: `TBD`
- `merge`: `TBD`
- `result`: `TBD`
