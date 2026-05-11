# Task Brief: Dryland Library And Micro Plan IA Cleanup (10/10)

## Metadata

- `id`: `2026-05-11-dryland-library-and-micro-plan-ia-cleanup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-11`
- `updated`: `2026-05-11`

## Goal

Make `/my-library/dryland` understandable by separating saved Dryland Sessions from Micro Session source selection, and remove `Manual release` as a new UI choice while keeping existing manual-release data safe.

## Product Decision

The current page shows the same saved sessions as both normal library rows (`Edit`/`Open`/`Delete`) and source choices for Micro Sessions. That creates two competing meanings for the same object. The cleaned-up UX should keep the normal saved-session library visible by default and only show source checkboxes inside an explicit `Create micro session` or `Edit micro session` mode.

`Manual release` already has domain/API support and existing plan compatibility. It should not be deleted from code in this slice. Instead, remove it from new create/edit UI choices and keep the existing `Release now` support for any older/manual units. If a legacy manual plan is edited, the user must choose `Available now` or `Weekday release` before saving.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Saved Dryland Sessions default to one clear library list; Micro Session source selection appears only inside explicit create/edit mode.                                        | IA/code review + screenshot handoff         | `5/5`                   |
| UX flow clarity                               | `target`     | User can tell when they are opening/deleting a saved session vs selecting sources for a micro plan, with no duplicate simultaneous lists.                                      | component tests + Playwright smoke          | `5/5`                   |
| Visual design quality                         | `target`     | Dryland page remains compact, scan-friendly, and responsive with one active task per visible section.                                                                          | screenshot handoff                          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Removing `Manual release` from UI does not corrupt existing manual plans; release-now and legacy read behavior continue to work.                                               | domain/component/API tests                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is a user-facing Dryland/Micro Sessions surface and does not change admin editor workflows.                                                                   | explicit scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Create/edit modes, source checkboxes, pacing controls, cancel/save buttons, and list actions remain keyboard and screen-reader usable.                                         | component/e2e assertions                    | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency or additional data load may be added; UI state only hides/reveals existing data.                                                                | dependency/query diff + build/perf gate     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Saved sessions remain server-canonical source entities; micro plan selection/edit state remains local until save; plan facts stay server-canonical.                            | data-boundary review + tests                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing mutation-return payload and dynamic authenticated route behavior remain unchanged.                                                                   | route/cache review                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Cancel/create/edit failure states are recoverable and do not hide saved sessions permanently or fake a release/completion.                                                     | negative-path/component tests               | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: existing owner-scoped API routes remain the mutation boundary; no new protected API ships.                                                                    | API route review + existing negative tests  | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, analytics, audio/haptic, or notification storage ships.                                                                                 | privacy/no-event review                     | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: labels such as `Weekly micro plan`, `Choose source sessions`, `Available now`, `Weekday release`, and `Update micro session` must be reflected in docs/tests. | route/label/support sweep                   | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, admin CRUD, moderation, or operator editability surface is introduced.                                                                          | explicit scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/dryland` is authenticated/private and no public metadata, sitemap, robots, or crawlability behavior changes.                                          | explicit scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable page or structured public entity data is introduced.                                                                                     | explicit scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new product events ship; release mode behavior remains observable through existing plan state.                                                             | no-event review + tests                     | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because Dryland/Micro Session IA cleanup changes no pricing, checkout, entitlements, subscriptions, refunds, payouts, or revenue ops.                                      | explicit commerce scope rationale           | `N/A`                   |
| Incident response and support operations      | `target`     | Support can explain default library vs source-selection mode and legacy manual-release behavior.                                                                               | runbook update + support sweep              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no invoice, payout, refund, entitlement, subscription, revenue recognition, or finance reporting data.                                          | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: copy remains short and structurally localizable; no locale routing or translation workflow ships here.                                                        | copy review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing dryland React components, typed micro-plan helpers, API contracts, and Tailwind primitives; add no dependency.                                                  | dependency diff + code review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted component/domain/API tests protect create/edit mode, duplicate-list removal, and manual-release compatibility.                                                        | targeted tests + screenshot handoff + gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new queries, polling, or full-table client load may be introduced.                                                                                         | query/dependency review                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/backfill is required; rollback by revert restores previous UI while existing plan data remains readable.                                                          | no-migration review + verify gates          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `DrylandBuilderHub` and `DrylandMicroPlanPanel`,
  - keep `/my-library/dryland` server-loaded and authenticated,
  - use a query param only to open create/edit mode from `My routines` edit links.
- TypeScript/domain contracts:
  - keep `DrylandMicroReleaseMode` accepting `manual` for backwards compatibility,
  - expose only supported V1 create/edit choices in UI,
  - preserve existing `releaseNow` mutation for legacy/manual and weekday override units.
- Supabase/data layer:
  - no schema or RLS change.
- UI system:
  - one active task per visible list,
  - do not show saved-session `Edit`/`Open`/`Delete` rows while the same sessions are rendered as source checkboxes,
  - source-selection rows show only the saved-session title, type, checkbox, and direct `Edit` link,
  - screenshot handoff is required as `before/after` evidence for `/my-library/dryland`.
- Testing:
  - update component tests for source-selection mode and manual-release UI removal,
  - preserve domain/API tests for legacy manual behavior.

## Data Placement And Sync Contract

- Server-canonical:
  - saved dryland sessions,
  - micro plan source session ids,
  - release mode stored on existing micro-plan blocks,
  - completion/skip/release timestamps.
- Local-only:
  - create/edit panel open state,
  - selected source checkboxes before save,
  - selected release pacing before save,
  - selected execution mode/bubble selection.
- Sync policy:
  - source selection mutates server-canonical micro-plan data only after `Create micro session` or `Update micro session`,
  - saved dryland sessions are never duplicated by selecting them,
  - legacy `manual` plans remain readable; new UI saves only `available_now` or `weekday`.
- Conflict policy:
  - existing API validation and owner scoping remain the source of truth for stale or invalid source ids.
- Retention and sensitivity:
  - no new personal data is stored.
- Cache/invalidation:
  - existing mutation responses update client state; authenticated route remains dynamic.

## Identity And Rename Contract

- Canonical stable ID:
  - saved dryland session ids remain source identity,
  - micro plan id and micro unit ids remain execution identity.
- Human-readable identifiers:
  - session titles and micro plan title are display labels and may be renamed.
- Mutability rules:
  - selecting a source session does not clone or repurpose it,
  - legacy manual release data remains readable.
- Rename vs repurpose policy:
  - materially different dryland work should be a new saved session or new micro plan, not a hidden rewrite.
- Compatibility contract:
  - existing `manual` blocks can still be released through `Release now` and normalized through existing helpers.
- Observability and repair:
  - support docs identify how to diagnose stuck source selection or manual-release legacy units.

## Scope

- Collapse source-selection UI behind explicit `Create micro session` / `Edit micro session` modes.
- Hide the normal saved-session list while source-selection mode is active.
- Keep edit mode configuration-only by hiding `Available units`, ordered/bubbles execution controls, complete buttons, and `Skip today`.
- Keep execution mode exercise-first by grouping repeated units under exercise names and omitting source-session provenance from the main unit list.
- Keep source-selection rows compact by omitting exercise/unit metadata and exposing direct `Edit` links for source-session tuning.
- Rename `Select sessions` copy to `Choose source sessions`.
- Remove `Manual release` from new create/edit release pacing choices.
- Keep legacy manual-release data and `Release now` behavior compatible.
- Allow `/my-library/dryland?micro=edit` to open the relevant source-selection mode from My Library.
- Update tests and support docs.

## Out Of Scope

- Deleting manual release from domain/API/storage.
- New database migration.
- Bubble drag/reorder or day-lane scheduling.
- Automatic week rollover, missed/expired state, or auto-skipping unfinished units.
- Full session calendar/history completion.
- Subscription gating.
- Dryland saved-session vs Micro Session lifecycle redesign, `Clear micro session`, source-session edit impact warnings, and compact quick-session rows. Follow-up is tracked in `docs/task-briefs/planned/2026-05-11-dryland-builder-lifecycle-and-source-session-impact-cleanup-10-10.md`.

## Acceptance Criteria

1. Default `/my-library/dryland` shows the Micro Sessions status/action area and one normal saved-session library list.
2. Source checkboxes appear only after `Create micro session` or `Edit micro session`.
3. The normal saved-session `Edit`/`Open`/`Delete` list is hidden while source checkboxes are visible.
4. Edit mode shows only configuration controls and an `Update micro session` save action for existing plans.
5. Release pacing offers `Available now` and `Weekday release` for new create/edit flows.
6. Existing manual-release plans remain readable and can still release units with `Release now`.
7. Editing a legacy manual plan requires choosing a supported visible release pacing before saving.
8. Tests cover the duplicate-list prevention, compact source rows with direct `Edit`, edit/execution separation, exercise-first ordered units, and manual-release compatibility.

## Validation

- `npm run lint:briefs`
- targeted Vitest for dryland micro plans, routes, panel, and builder hub
- targeted Playwright for dryland page when local auth bypass is available
- screenshot handoff before `npm run verify:pre-pr`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Completion Record

- Merged PR: `#676`
- Merge commit: `df508c9`
- Completed scope: Dryland default library and Micro Session source-selection IA are separated; edit mode is configuration-only; new create/edit release pacing no longer offers `Manual release`; legacy manual-release units remain readable and releasable.
- Verification: `npm run verify:pre-pr` PASS full lane, GitHub CI PASS, and `npm run verify:pre-merge` PASS full lane on `23875d0` before merge.
- Screenshot evidence: `output/playwright/dryland-source-actions-20260511-120753` approved by owner before PR gate; no product-rendering files changed after capture.
- Local caveat: local E2E kept the existing dev-login/Supabase HTML skips (`82 passed`, `380 skipped`), matching pre-PR and pre-merge evidence.
- Follow-up: `docs/task-briefs/planned/2026-05-11-dryland-builder-lifecycle-and-source-session-impact-cleanup-10-10.md` tracks clear-empty micro sessions, source-session impact warnings, and compact quick-session rows.
- Performance decision: hold budget tightening outside this UI PR; perf gate recommended tightening one stretch target after five green weekly runs with 20.1% margin.
- `10/10 claim`: yes for the approved Dryland Library and Micro Plan IA cleanup scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                          | Gaps / Notes                                                |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#676`, screenshot handoff, and merged code separate saved sessions from source selection.                     | Lifecycle redesign is deferred to the planned follow-up.    |
| UX flow clarity                               | `5/5`          | Unit/component tests and screenshot handoff cover default library, source edit mode, and action ordering.         | None for this slice.                                        |
| Visual design quality                         | `5/5`          | Owner-approved screenshots at `output/playwright/dryland-source-actions-20260511-120753`.                         | None for this slice.                                        |
| Business logic correctness and data integrity | `5/5`          | Tests and code preserve legacy manual-release read/release behavior while removing it from new UI choices.        | No schema or data migration shipped.                        |
| Accessibility (a11y)                          | `5/5`          | Component/e2e coverage keeps source checkboxes, edit links, and actions named and keyboard reachable.             | None for this slice.                                        |
| Data placement and sync boundaries            | `5/5`          | Brief contract and code keep saved sessions/server plans canonical and create/edit selections local until save.   | None for this slice.                                        |
| Reliability and failure handling              | `5/5`          | Negative-path/component coverage protects cancel/save failure states and avoids hiding the library permanently.   | Existing local dev-login skip remains unrelated.            |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` and `docs/user-flow-map.md` explain the updated Dryland support behavior. | None for this slice.                                        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Dryland components/helpers and added no dependency or migration.                                  | None for this slice.                                        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, targeted Playwright smoke, full `verify:pre-pr`, GitHub CI, and `verify:pre-merge` passed.       | Local DB-backed E2E tests skipped on known dev-login issue. |
| DevOps and rollback readiness                 | `5/5`          | No migration; rollback is `git revert df508c9`; PR checks and local pre-merge gate passed.                        | None for this slice.                                        |

## Manual QA Environments

- Local: `http://127.0.0.1:3000/my-library/dryland`
- Screenshot handoff: `before/after` desktop and mobile Dryland views, including source-selection mode.

## Help / Guide Impact

Required: update `docs/runbooks/auth-account-support.md` for source-selection vs saved-session library mode and legacy manual-release behavior.

## Route / Label / Support Surface Sweep

Run targeted sweep for `Dryland Sessions`, `Micro Sessions`, `Weekly micro plan`, `Select sessions`, `Choose source sessions`, `Manual release`, `Release now`, `Move to today`, `Available now`, `Weekday release`, `Update micro session`, `Skip today`, `/my-library/dryland`, and support docs before broad verification.

## Checkpoint Log

- `2026-05-11 | started | owner identified duplicate source/library session lists and unclear `Manual release`; code review confirmed manual release has domain/API support, so this slice removes it from new UI while preserving legacy compatibility | next: implement explicit create/edit source-selection mode and update tests/docs`
- `2026-05-11 | implemented | default Dryland page keeps saved-session library rows as the library view; Micro Session source checkboxes now appear only after Create/Edit mode and hide the normal list while active; /my-library/dryland?micro=edit opens the relevant source-selection mode from My routines; Manual release is removed from new create/edit choices while legacy manual units retain Release now | validation: targeted Vitest for Dryland builder/micro-plan panel/domain/routes PASS, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS | next: screenshot handoff before verify:pre-pr`
- `2026-05-11 | route-label-support-sweep | identifiers searched: Dryland Sessions, Micro Sessions, Select sessions, Choose source sessions, Manual release, Release now, Move to today, Available now, Weekday release, /my-library/dryland | surfaces checked: app/, components/, lib/, tests/, docs/runbooks/, docs/user-flow-map.md, and active task briefs | fallout handled in Dryland page/component/tests/runbook/user-flow map and this brief; remaining `Manual release`references are intentional legacy-read/Release now support, and unrelated`Select sessions` in the swim-session saved-workouts panel is outside this Dryland/Micro Sessions scope`
- `2026-05-11 | screenshot-ready | screenshot capture exposed and fixed a direct-open edge case where /my-library/dryland?micro=edit could leave the normal saved-session list visible after hydration; added unit coverage for direct-open source selection; screenshot artifacts captured at output/playwright/my-library-dryland-ia-cleanup-20260511-101559 after temporary local preview cleanup; targeted Vitest 7 files/46 tests PASS, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS; targeted Playwright E2E returned 2 skipped because local dev-login still receives Supabase HTML instead of JSON | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-11 | visual-correction | owner flagged edit mode as mixing configuration and training execution; edit mode now hides `Available units`, ordered/bubbles controls, and completion/skip controls, existing-plan save copy is `Update micro session`, source-selection cards are compact, and ordered execution groups repeated units by exercise without source-session provenance | validation: tests/unit/dryland-micro-plan-panel.test.tsx PASS, npm run typecheck PASS, npm run lint PASS | next: refreshed screenshot handoff before verify:pre-pr`
- `2026-05-11 | source-actions-correction | owner asked whether exercise/unit counts are needed and whether source sessions should be editable before use; source-selection rows now omit exercise/unit metadata, include direct `Edit`links, normal saved rows expose`Edit`before`Open`, and execution skip copy is clarified as `Skip today` because it marks that set skipped for this plan rather than deleting it | validation: targeted Dryland/My routines Vitest PASS, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS, git diff --check PASS; targeted Playwright E2E exited 0 with 2 skipped because local dev-login still receives Supabase HTML instead of JSON; screenshots captured at output/playwright/dryland-source-actions-20260511-120753 after temporary preview cleanup | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-11 | screenshot-approved | owner approved the Dryland source-actions screenshot handoff captured at output/playwright/dryland-source-actions-20260511-120753; no product-rendering files changed after capture | next: run npm run verify:pre-pr`
- `2026-05-11 | follow-up-planned | owner raised additional lifecycle/IA findings after screenshot approval: saved Dryland Sessions should remain the main library, Micro Sessions need clear-to-empty recovery, saved-session editor needs current-vs-future micro-plan impact warning, and quick-session exercises should become compact rows without default per-exercise notes; captured as planned follow-up brief `2026-05-11-dryland-builder-lifecycle-and-source-session-impact-cleanup-10-10` so this approved slice can finish without scope creep | next: rerun npm run verify:pre-pr after docs update`
