# Task Brief: Workout Builder Saved Session Density (10/10)

## Metadata

- `id`: `2026-04-02-workout-builder-saved-session-density-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-02`
- `updated`: `2026-04-03`

## Goal

Keep the dedicated `My sessions` browse route calmer by showing only the first `3` saved sessions by default and revealing the rest through one deterministic `Load more` action.

## Why This Brief Exists

- The active production umbrella still carries one explicit builder follow-up:
  - `d76825bd-4b5c-4e7e-aa22-49e6c25350ba` `Saved workouts list density follow-up`
- The parent builder brief already shipped the browse-first `My sessions` route, inline preview, and explicit `View sessions` / `Create session` split.
- Live follow-up feedback narrowed the remaining gap:
  - the browse list still feels too dense when many saved sessions are present,
  - the owner wants the list to open with only the first `3` rows visible,
  - the rest should stay discoverable but secondary.
- This slice intentionally handles only the density follow-up before the broader drill/kick taxonomy and notice-placement slices.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/done/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Parent builder brief:
- `docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Main product surfaces in scope:
  - `components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/my-library-workout-builder.spec.ts`
- This slice owns:
  - browse-list density on `My sessions`,
  - deterministic `Load more` reveal behavior,
  - regression coverage and brief updates.
- This slice does not own:
  - drill/kick taxonomy redesign,
  - builder notice placement or audience policy,
  - removal of any manual swim-session builder input fields.

## Triage Disposition

- `d76825bd-4b5c-4e7e-aa22-49e6c25350ba` `Saved workouts list density follow-up`
  - disposition: owned by this brief.
  - reason: the note maps directly to browse-list density and a deterministic reveal pattern.
- `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up`
  - disposition: out of scope for this slice.
  - reason: taxonomy clarity should land separately from browse density so the behavioral change stays easy to QA and revert.
- `854d3f39-9275-4d80-a624-a687e47db320` `Workout builder notice placement and audience follow-up`
  - disposition: out of scope for this slice.
  - reason: notice placement is a different decision surface than session-list density.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                    | Evidence                                 |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product goals and IA                          | `target`     | `My sessions` opens in a browse-first state that keeps list density secondary until the owner explicitly asks for more rows.                      | UI review + unit coverage                |
| UX flow clarity                               | `target`     | Owners can scan the first `3` sessions without the browse route feeling overloaded, and can still reveal the rest in one obvious step.            | manual QA + unit/e2e                     |
| Visual design quality                         | `target`     | The reveal control feels like a calm continuation of the existing builder UI and does not introduce a second competing browse hierarchy.          | screenshot review + UI diff              |
| Business logic correctness and data integrity | `target`     | Revealing more rows does not change canonical session identity, edit targets, preview targets, or delete targets.                                 | unit tests + e2e                         |
| Admin editor ergonomics                       | `supporting` | Supporting only: the calmer browse list should make it easier to reopen and clean up sessions without changing admin-only tooling.                | manual QA + scope rationale              |
| Accessibility (a11y)                          | `supporting` | Supporting only: the reveal control must remain keyboard accessible with clear button semantics.                                                  | unit/e2e + code review                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: list density control adds no material route payload or client-side slowdown on the browse route.                                 | `verify:pre-pr` + diff review            |
| Data placement and sync boundaries            | `target`     | Browse density stays local-only UI state; saved sessions, previews, deletes, and edit routes remain server-canonical.                             | brief contract + code review             |
| Caching and invalidation strategy             | `supporting` | Supporting only: loading more rows never creates a second fetch path or stale duplication; normal refresh/delete invalidation still works.        | unit tests + route review                |
| Reliability and failure handling              | `target`     | Delete, preview, and edit actions remain reachable and deterministic after hidden rows are revealed.                                              | unit tests + targeted e2e                |
| Security and authz                            | `supporting` | Supporting only: the density change does not widen access beyond the existing authenticated `My sessions` route.                                  | existing auth coverage + scope rationale |
| Privacy and compliance                        | `N/A`        | N/A because this slice only changes list density on an owner-scoped saved-session route, not personal-data policy or exposure.                    | explicit scope rationale                 |
| Content governance                            | `supporting` | Supporting only: button copy and browse labels must stay aligned with the canonical `My sessions` wording.                                        | copy review                              |
| Admin workflow and editability                | `supporting` | Supporting only: saved-session cleanup/edit workflows remain intact while the route becomes calmer.                                               | targeted QA                              |
| SEO and crawlability                          | `N/A`        | N/A because `My sessions` is an authenticated/private route and the slice adds no public crawl surface.                                           | explicit scope rationale                 |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata, content schema, or AI-facing route.                                                            | explicit scope rationale                 |
| Analytics and KPI observability               | `supporting` | Supporting only: success remains inferable through existing session-save/open flows without adding new analytics events in this slice.            | scope rationale + PR summary             |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or billing behavior changes.                                                                                 | explicit scope rationale                 |
| Incident response and support operations      | `N/A`        | N/A because this slice changes a private saved-session browse surface and requires no new runbook or support escalation flow.                     | explicit scope rationale                 |
| Finance and reporting operations              | `N/A`        | N/A because there is no reconciliation, payout, or finance reporting impact in this browse-density change.                                        | explicit scope rationale                 |
| i18n operational readiness                    | `N/A`        | N/A because the slice only adds one structural button label and does not change locale-bound route or schema contracts.                           | explicit scope rationale                 |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `SavedWorkoutsPanel` and builder route state without adding dependencies or parallel list components.                          | dependency diff + code review            |
| Testing and QA automation                     | `target`     | Coverage proves that only `3` sessions render by default, the hidden remainder reveals through `Load more`, and the slice passes `verify:pre-pr`. | unit tests + targeted e2e + gate output  |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice only changes local render density and introduces no new storage, query, or background job cost.                        | diff review                              |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the density change is reversible in one component path with no schema or content migration.                                      | rollback note + PR summary               |

## Data Placement And Sync Contract

- Server-canonical:
  - saved swim-session rows,
  - canonical workout IDs,
  - preview text, delete targets, and edit routes derived from the saved session model.
- Local-only:
  - whether the owner has clicked `Load more`,
  - any transient open preview state in the browse list.
- Sync policy:
  - revealing more rows does not trigger a new fetch,
  - existing refresh/delete behavior remains authoritative after mutations.
- Retention and sensitivity:
  - density state is ephemeral client UI state only,
  - no new sensitive data is stored or exposed.
- Cache/invalidation:
  - existing refresh/delete flows stay unchanged and must continue to invalidate the browse list deterministically.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical session identity used for edit, preview, delete, and export actions.
- Human-readable identifiers:
  - session titles remain editable labels only.
- Mutability rules:
  - this slice must not change session naming, route params, or canonical IDs.
- Rename vs repurpose policy:
  - out of scope; the slice only changes list density.
- Compatibility contract:
  - existing deep links to `/my-library/workouts/[workoutId]` and row actions keep the same targets.
- Observability and repair:
  - regression tests must catch any hidden-row reveal that breaks edit/delete targeting.

## Scope

- Show only the first `3` saved sessions by default on the dedicated `My sessions` browse surface.
- Add one deterministic `Load more` reveal action for the remaining saved sessions.
- Keep inline preview, edit, PDF, poolside note, and delete actions working after reveal.
- Update active brief/checkpoint notes for the new slice.

## Out Of Scope

- Any removal of manual `Swim session builder` authoring fields/input boxes.
- Drill/kick taxonomy, field naming, or authoring-model changes.
- Notice placement or notice audience changes.
- New builder-route copy overhauls beyond what is necessary for the density control.

## Acceptance Criteria

1. `My sessions` renders at most the first `3` saved session rows by default when more than `3` exist.
2. A single deterministic `Load more` control reveals the remaining saved sessions without changing route or data source.
3. Revealed rows preserve working preview, edit, PDF, poolside-note, and delete actions.
4. Routes with `3` or fewer saved sessions render without an unnecessary density control.
5. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep the change scoped to browse density on `My sessions`.
- Do not add pagination, filters, or another list mode in this slice.
- Do not remove any manual swim-session builder input fields.
- Preserve existing row actions and canonical routes.

## 10/10 Quality Bar

- The browse route should feel calmer immediately on load.
- The first screenful should bias toward scanning, not management overload.
- Required states stay explicit:
  - `default limited`
  - `revealed`
  - `empty`
  - `error`
  - `delete pending`
  - `delete success`
- The reveal affordance must feel intentional, not like missing content.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because no Help/Guide or admin workflow labels change; the behavior is confined to the authenticated owner browse list and existing actions keep the same names.

## Security, Privacy, and Compliance

- Authentication and owner-scoped routing remain unchanged.
- The density control must not expose sessions outside the existing fetched list.
- No new storage, secret handling, or sensitive payload fields are introduced.

## Observability And KPI Contract

- Success signal for this slice:
  - owners can reopen the `My sessions` route and scan the top of the list without being hit by every historical session at once.
- No new instrumentation is required in this slice.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated browse-density slice.
- Open/update PR after `npm run verify:pre-pr` is green.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-02 | working tree | created the saved-session-density child slice under the production admin-notes umbrella and parent builder brief so the remaining builder follow-up can land as an isolated browse-density adjustment | next: implement the 3-row default + load-more behavior, add targeted regression coverage, and run targeted validation`
- `2026-04-02 | working tree | implemented the 3-row default reveal in the dedicated My sessions browse route, added a deterministic load-more control, passed targeted vitest, passed typecheck, passed brief lint, and reran the targeted desktop Chromium workout-builder spec with the shared .env.local loaded (the route-specific Playwright scenario stayed schema-gated and skipped in this environment) | next: run npm run verify:pre-pr, then commit/push/open the PR if the full gate stays green`
