# Task Brief: My Library Training Focus Edit, Primary Toggle, And Section Navigation (10/10)

## Metadata

- `id`: `2026-03-22-my-library-training-focus-edit-primary-and-section-nav-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-22`
- `updated`: `2026-03-22`

## Goal

Users can edit an existing open focus, explicitly set or remove which focus is primary, and use the overview cards on `/my-library/training` to jump straight to the currently relevant `Goals`, `Focus`, and `Notes` sections.

## Why This Brief Exists

- Focus v2 now supports multiple open focuses and one optional primary focus.
- The current My Library training UI still has three practical gaps:
  - an open focus can be created, completed, archived, or set primary, but not edited,
  - a primary focus can be assigned, but not explicitly cleared,
  - the overview cards explaining `Goals`, `Focus`, and `Notes` are still passive copy instead of useful navigation.
- These gaps add friction in day-to-day use:
  - swimmers may refine the wording of a cue after trying it,
  - they may want no primary focus selected temporarily,
  - they may want the overview cards to act as direct entry points into the selected content below.

## Dependencies And Boundaries

- Existing authoritative foundations to preserve:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-my-library-focus-management-v2-multi-open-focuses-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-20-my-library-goals-focus-workflow-bridge-10-10.md`
  - `/Users/stianvikra/freeswimming/app/my-library/training/page.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/training/TrainingContextHub.tsx`
  - `/Users/stianvikra/freeswimming/app/api/my-library/training-context/focus/[focusId]/route.ts`
- This slice may update API behavior, client UI, and tests for training-context focus management.
- This slice must not change training-context schema or add new migrations.
- This slice is private end-user My Library work, not admin workflow.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                             |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Users can understand where to edit a focus, how to set or clear primary focus, and how the top cards map to the content below.      | UI review + unit test + manual QA    |
| UX flow clarity                               | `target`     | Focus edit, primary set/clear, and overview-card navigation all work without dead ends in `empty`, `success`, `error`, and `retry`. | unit test + targeted e2e + manual QA |
| Visual design quality                         | `target`     | New edit and navigation controls fit the shipped My Library training visual language and keep the page calm and readable.           | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | Focus edits only affect the targeted focus row, and primary clear never silently reassigns another focus.                           | route tests + UI tests + code review |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice only affects private user training workflow, not admin editing surfaces.                                     | explicit scope rationale             |
| Accessibility (a11y)                          | `target`     | New edit, save, cancel, set-primary, clear-primary, and section-navigation controls remain keyboard and touch accessible.           | unit test + targeted e2e + manual QA |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: changes should reuse the existing snapshot and avoid extra route churn on `/my-library/training`.                  | code review + targeted validation    |
| Data placement and sync boundaries            | `target`     | Saved focus fields and primary state remain server-canonical; section-nav state and unsaved edits remain local until explicit save. | brief contract + tests + code review |
| Caching and invalidation strategy             | `target`     | After focus edit or primary toggle, the returned canonical snapshot replaces stale client state immediately.                        | route behavior + UI tests            |
| Reliability and failure handling              | `target`     | Failed focus edits or primary-clear actions preserve the current view state and show actionable feedback without corrupting data.   | negative-path test + manual QA       |
| Security and authz                            | `target`     | Focus edit and primary-clear routes remain owner-scoped and fail closed for unauthenticated requests.                               | route tests                          |
| Privacy and compliance                        | `supporting` | Supporting only: focus titles/details remain private user data, and no public exposure path is introduced.                          | scope review + code review           |
| Content governance                            | `supporting` | Supporting only: the training-page overview cards must reflect canonical focus/goal/note meaning without changing the data model.   | copy review                          |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or operator editing flow changes in this slice.                                                       | explicit scope rationale             |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/training` is authenticated private UI with no public crawl contract.                                       | explicit scope rationale             |
| AI discoverability                            | `N/A`        | N/A because no public discoverability surface changes here.                                                                         | explicit scope rationale             |
| Analytics and KPI observability               | `supporting` | Supporting only: client analytics should distinguish focus edit and primary set/clear actions where meaningful.                     | analytics review + code inspection   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, entitlement, or revenue-linked flow.                                                     | explicit scope rationale             |
| Incident response and support operations      | `supporting` | Supporting only: runtime errors on focus edit/primary clear should remain diagnosable from existing training-context logging.       | route logs + code review             |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reporting, payout, or reconciliation path is touched in this private workflow slice.                        | explicit scope rationale             |
| i18n operational readiness                    | `supporting` | Supporting only: new labels remain enum-safe and future-localization-friendly rather than encoded as logic.                         | copy review                          |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, React, Tailwind, and Supabase patterns with no new dependency.                                              | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Unit coverage protects focus edit, primary clear, and section-card interaction, and targeted validation passes locally.             | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice should avoid duplicate writes or extra background polling.                                               | query review                         |
| DevOps and rollback readiness                 | `supporting` | Supporting only: API and UI changes remain reversible without schema rollback.                                                      | git diff review                      |

## Data Placement And Sync Contract

- Server-canonical data:
  - `training_focuses.title`
  - `training_focuses.details`
  - `training_focuses.goal_id`
  - `training_focuses.is_primary`
  - focus status and timestamps
- Local-only data:
  - unsaved create-focus draft
  - unsaved edit-focus draft while the editor is open
  - transient section-navigation focus/scroll behavior
- Sync policy:
  - focus edits and primary set/clear only persist after explicit user action,
  - each successful mutation must replace local rendered state with the returned canonical snapshot,
  - failed mutations must keep local edit text in place for retry,
  - overview-card clicks do not mutate data; they only navigate within the current page state.
- Retention and sensitivity:
  - focus text remains private user data already covered by the training-context feature,
  - this slice adds no new retention or sharing behavior.
- Cache/invalidation:
  - route reads remain no-store/dynamic,
  - post-write UI must reflect the latest snapshot without requiring a manual refresh.

## Identity And Rename Contract

- Canonical stable ID:
  - `focus.id`, `goal.id`, and `note.id` remain the only stable canonical identifiers.
- Human-readable identifiers:
  - focus title and details are editable display fields only.
  - goal and note labels shown in overview cards are display values, not routing keys.
- Mutability rules:
  - focus title, details, and linked goal may be edited in place.
  - `is_primary` may be set or cleared explicitly.
- Rename vs repurpose policy:
  - refining the wording of the same cue is an in-place edit,
  - materially different training cues should still become a new focus row instead of overwriting old meaning.
- Compatibility contract:
  - focus editing must not break downstream primary-focus or generator consumers because canonical ids stay unchanged.
- Observability and repair:
  - missing or unavailable linked goal ids should degrade safely to `No linked goal` rather than corrupting the focus record.

## Scope

- Add inline editing for existing focus cards in `/my-library/training`.
- Add an explicit `Remove primary` action for an open primary focus.
- Allow editing linked goal, title, and detail for an open focus.
- Make the `Goals`, `Focus`, and `Notes` overview cards on `/my-library/training` clickable.
- Show the currently selected goal/focus/note context inside those overview cards so they act as useful entry points rather than static explainer text.
- Add or update targeted API and UI automated coverage for the new behavior.

## Out Of Scope

- New database migrations or training-context schema changes.
- New note taxonomy or note attachments.
- Large-scale visual redesign of the training page.
- Generator, builder, or admin workflow changes.
- Deleting focuses.

## Acceptance Criteria

1. A signed-in user can open an existing focus, edit its title/details/linked goal, and save the changes successfully.
2. A signed-in user can remove the primary designation from an open focus without forcing another focus to become primary automatically.
3. A signed-in user can still set another open focus as primary afterward.
4. Focus edit and primary-clear actions fail safely with actionable error messaging when offline or when the request fails.
5. The `Goals`, `Focus`, and `Notes` overview cards on `/my-library/training` are clickable and jump to the relevant section below.
6. Each overview card reflects the currently selected or most relevant goal/focus/note context when available.
7. Unauthorized training-context focus mutation requests remain fail-closed.
8. `npm run lint:briefs`, targeted unit tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run tests/unit/training-context-hub.test.tsx tests/unit/training-context-routes.test.ts`
- `npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/training`
- Preview:
  - PR preview URL after branch push
- Recommended verification:
  - desktop Chromium
  - iPhone Safari-width viewport

## Constraints

- Preserve the existing training-context data model.
- Keep the change focused on training-page usability and focus-management completeness.
- Avoid new dependencies.
- Do not silently auto-promote another primary focus when the user explicitly clears the current one.

## 10/10 Quality Bar

- The page should feel more operable immediately, not more complex.
- Users should be able to understand:
  - how to adjust an existing focus,
  - how to remove primary when they do not want one,
  - where to click to get to goals, focus, or notes below.
- Required states must remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `offline`
  - `retry`
  - `success`
- No hidden focus mutation, no hidden primary reassignment, and no dead-end navigation cards.

## Help/Guide And Operator Training Contract

- `N/A` for dedicated Help/Guide docs in this slice because the change is a contained private-page usability improvement with self-explanatory labels and no new admin/operator workflow.
- Existing on-page explanatory copy on `/my-library/training` must still make the relationship between `Goals`, `Focus`, and `Notes` clear.

## Checkpoint Log

- `2026-03-22 | planning + implementation start | opened a dedicated follow-up slice for editable focus cards, explicit primary removal, and clickable overview-card navigation after confirming current training-context API only supports set-primary and terminal status updates | next: implement route + UI updates, add tests, and run targeted validation`
- `2026-03-22 | merged to main | PR #262 merged as 5fb3142633cfaa7b0b31c18c8026105c30a3afbc after local verify:pre-pr, local verify:pre-merge, and all required GitHub checks passed | next: manual Safari/iPhone QA if we want to raise the slice from release-ready to full 10/10 confidence`
