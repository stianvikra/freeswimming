# Task Brief: Program Builder Scheduled Workout Step Preview Parity (10/10)

## Metadata

- `id`: `2026-05-04-program-builder-scheduled-workout-step-preview-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-04`
- `updated`: `2026-05-04`

## Goal

Make Program Builder scheduled workout cards show compact workout-step sections from the shared session-step display contract so planner review does not hide the actual session structure behind title, meters, and time only.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim: `Product goals and IA`, `Visual design quality`, `Business logic correctness and data integrity`, `Stack-fit and dependency discipline`, `Testing and QA automation`.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                          | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Scheduled workout cards show the same compact workout structure already used by saved previews and Program PDF.                             | component diff + screenshot handoff     | `5/5`                   |
| UX flow clarity                               | `target`     | Users can scan each scheduled day and understand warmup/main/cooldown/repeat/rest structure without opening export/PDF.                     | component test + screenshot handoff     | `5/5`                   |
| Visual design quality                         | `target`     | Added preview sections fit existing Program Builder card rhythm on desktop and mobile without overlap, clipping, or nested-card clutter.    | after/reference screenshots             | `5/5`                   |
| Business logic correctness and data integrity | `target`     | The UI consumes existing `WorkoutSummary.previewSections` only; no schedule assignment, workout draft, or export semantics are mutated.     | unit/component tests + diff review      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this user-facing Program Builder slice does not change admin CRUD, publishing, moderation, or editorial workflows.              | explicit admin scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Preview sections remain readable semantic content inside each scheduled workout card and do not introduce unlabeled controls.               | Testing Library assertions + screenshot | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, no extra client fetch, and no route-level data expansion; changed route stays within existing verify/build budgets.      | dependency diff + local gates           | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Program/workout records remain server-canonical; step previews are read-only derived summary data already present in the library snapshot.  | code review + data contract             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache mode changes; existing library snapshot freshness and program mutation refresh behavior remain in place.          | route/component review                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing workouts and workouts without preview sections still render deterministic fallback card content.                                    | unit/component tests                    | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected program/workout reads and mutations are unchanged; this slice adds no new API path or auth boundary.             | existing route coverage + diff review   | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, logging, analytics payload, sharing destination, or retention behavior is introduced.                | payload/diff review                     | `4/5`                   |
| Content governance                            | `target`     | Section labels, rest wording, and repeat wording stay centralized through existing workout preview-section helpers.                         | shared helper use + tests               | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/user recovery queue, status workflow, operator label, or support action changes in this slice.                         | explicit workflow scope rationale       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated My Library planner UI changes no public metadata, sitemap, robots, canonical tags, or crawlable content.          | explicit SEO scope rationale            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private planner UI change adds no public AI-discoverable entity, structured data, or crawl-safe content.                   | explicit AI-discovery scope rationale   | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy change; existing program save/export actions remain stable.                                              | test-id/event diff review               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, or revenue workflow changes.                                           | explicit commerce scope rationale       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this visual planner card enhancement adds no alerting, incident path, support queue, or customer recovery workflow.             | explicit support-ops scope rationale    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no payout, invoice, ledger, entitlement report, refund, or finance reconciliation data changes.                                 | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: centralized labels reduce future translation drift, but no locale routing/storage or translation layer changes.            | label centralization review             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React/TypeScript Program Builder and shared workout preview-section contracts; add no dependency or parallel step interpreter. | dependency diff + code review           | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused Program Builder component tests, brief lint, targeted validation, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.  | test output + screenshots + gates       | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Rendering uses the already-loaded summary sections and limits visible row volume where needed to avoid large planner-card bloat.            | component diff + screenshot review      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Code/docs-only, no migration, no cache purge; rollback is one PR revert.                                                                    | PR diff + rollback note                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: update `ProgramBuilderHub` only; it stays a client component and consumes existing `WorkoutSummary.previewSections` from the server-loaded program library snapshot. No route/action/API boundary changes.
- TypeScript/domain contracts: use `WorkoutSummaryPreviewSection` and the existing workout summary contract; do not add a program-local parser or new step grouping model.
- Supabase/data layer: N/A with rationale: no schema, migration, RLS, storage, generated DB type, or query change.
- External services/tools: N/A with rationale: no SDK, webhook, secret, retry, idempotency, or provider behavior change.
- UI system: reference `docs/design/session-step-surface-contract.md`; compare changed Program Builder cards with saved-workout Quick View and Program PDF scheduled-workout sections. Screenshot handoff type is `after/reference`.
- Testing: update focused `tests/unit/program-builder-hub.test.tsx`; run targeted tests and screenshot handoff before broad gates.

## Data Placement And Sync Contract

- Server-canonical data: saved programs, week/day assignments, and saved workouts remain owned by existing API/database flows.
- Local-only data: existing unsaved Program Builder draft UI state remains local until explicit save; no new local persistence is added.
- Sync policy: unchanged. Program save responses remain canonical; preview sections are read-only summary data from the current library snapshot.
- Retention and sensitivity: no new persistence, logs, analytics payloads, or personal-data exposure.
- Cache/invalidation: unchanged. The existing My Library/program page load and save refresh behavior remains the freshness boundary.

## Identity And Rename Contract

- Canonical stable IDs: program IDs, week IDs, assignment IDs, workout IDs, and workout step source IDs remain unchanged.
- Human-readable identifiers: workout/program titles and section labels remain display-only and renameable.
- Mutability rules: this slice does not mutate IDs or persisted workout/session drafts.
- Rename vs repurpose: N/A for runtime behavior because no entity write semantics change.
- Compatibility contract: missing workouts and workouts without preview sections keep deterministic fallback content.
- Observability and repair: existing missing-workout warnings remain the repair surface; no new telemetry path is introduced.

## Scope

- `components/my-library/programs/ProgramBuilderHub.tsx`
- `tests/unit/program-builder-hub.test.tsx`
- `docs/design/session-step-surface-contract.md` only if the consumer list needs clarification
- screenshot handoff artifacts for Program Builder scheduled workout cards

## Out Of Scope

- Program calendar/completion/history state.
- Adding, removing, or changing program assignment persistence.
- New export/PDF/Garmin behavior.
- New API routes, database schema, authz/RLS, cache behavior, or dependencies.
- Redesigning the full Program Builder page.

## Acceptance Criteria

1. Scheduled workout cards render compact step-section previews when `WorkoutSummary.previewSections` are present.
2. Section labels, row text, repeat/rest wording, and row ordering come from existing workout summary preview sections.
3. Cards still render useful fallback content for missing workouts and workouts without step preview data.
4. The planner grid remains readable on desktop and mobile without overlapping text or hidden controls.
5. Focused component tests pass before screenshot handoff; screenshot handoff is approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests:
  - `tests/unit/program-builder-hub.test.tsx`
- targeted screenshot handoff before `verify:pre-pr`
- after owner screenshot approval:
  - `npm run verify:pre-pr`
  - CI
  - `npm run verify:pre-merge`

## Help/Guide And Operator Training Impact

N/A with rationale: this slice only adds read-only detail inside an authenticated planner card. It does not rename workflow actions, support recovery behavior, admin labels, Help/Guide content contracts, or operator runbooks.

## Manual QA Environments

- Local URL: `http://127.0.0.1:3000`
- Screenshot comparison type: `after/reference`
- Required representative screenshots:
  - `after-program-builder-scheduled-card-desktop`
  - `after-program-builder-scheduled-card-mobile`
  - `reference-saved-quick-view-desktop` or `reference-program-pdf-desktop`

## Rollback Plan

Revert this PR. No schema rollback, data repair, cache purge, finance action, or customer communication is required.

## Closeout Score Outcome

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

- `10/10 claim`: yes

| Category                                      | Achieved Score | Evidence                                                                                                      | Notes                                                                                                     |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#589`, Program Builder diff, session-step surface contract update, and approved screenshot handoff.       | Scheduled workouts now expose the same compact step structure as reference surfaces.                      |
| UX flow clarity                               | `5/5`          | Focused component tests and desktop/mobile screenshot approval.                                               | Users can scan assigned day structure without opening export/PDF.                                         |
| Visual design quality                         | `5/5`          | After/reference screenshots in `output/program-builder-step-preview-parity-2026-05-04-131036`.                | Desktop/mobile cards fit without overlap; no product-rendering files changed after capture.               |
| Business logic correctness and data integrity | `5/5`          | Component tests, typecheck, code review, local gates, and green CI.                                           | The UI consumes existing read-only `WorkoutSummary.previewSections`; assignment semantics did not change. |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions and full verification lane.                                                        | Preview text remains semantic readable content; no new unlabeled controls were added.                     |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency/fetch; `npm run verify:pre-pr`, perf budgets, CI, and `verify:pre-merge` passed.            | Perf trend tightening is deferred to the dedicated AW-010 track.                                          |
| Data placement and sync boundaries            | `5/5`          | Data-boundary review and unchanged API/database diff.                                                         | Saved programs/workouts remain server-canonical; previews are derived from the current snapshot.          |
| Reliability and failure handling              | `5/5`          | Tests cover missing preview sections and fallback content.                                                    | Missing workouts and no-preview workouts keep deterministic useful cards.                                 |
| Content governance                            | `5/5`          | Shared preview-section contract reuse and `docs/design/session-step-surface-contract.md` update.              | Section labels/rest wording remain centralized through existing workout summary helpers.                  |
| Stack-fit and dependency discipline           | `5/5`          | Existing React/TypeScript contracts reused; zero new dependencies.                                            | No program-local parser or parallel step interpreter was introduced.                                      |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot approval, `verify:pre-pr`, green CI, `verify:pre-merge`, and post-merge preflight. | Local and remote gates passed before merge; PR-body CI failure was corrected and rerun green.             |
| Scalability and cost efficiency               | `5/5`          | Row-limited rendering and already-loaded summary data.                                                        | Planner cards avoid unbounded step expansion and add no service/runtime cost.                             |
| DevOps and rollback readiness                 | `5/5`          | PR `#589` merged, no migration, and post-merge closeout.                                                      | Rollback is `git revert eb1ab50`.                                                                         |

## Checkpoint Log

- `2026-05-04 | in-progress | created implementation brief from owner command to implement Program Builder scheduled workout step preview parity from clean main | next: render existing workout preview sections in scheduled cards and add focused tests`
- `2026-05-04 | implementation | Program Builder scheduled workout cards now render compact read-only step previews from existing workout summary preview sections with fallback coverage for missing preview data; widened the planner day grid and fixed mobile overflow with min-width/full-width controls; targeted component test, typecheck, scoped ESLint, and lint:briefs:all pass | next: capture after/reference screenshot handoff before verify:pre-pr`
- `2026-05-04 | screenshot-review | captured after/reference artifacts in /Users/stianvikra/freeswimming/output/program-builder-step-preview-parity-2026-05-04-131036 for Program Builder scheduled cards on desktop/mobile plus Program PDF reference; visual files were regenerated after the mobile overflow fix | next: owner screenshot approval or corrections before npm run verify:pre-pr`
- `2026-05-04 | pre-pr | owner approved screenshot handoff; npm run verify:pre-pr passed the full lane on commit eca3cf6 with lint, typecheck, unit tests, build, perf budgets, and E2E (107 passed, 349 skipped); perf trend recommended tightening after four consecutive weekly green runs, held out of this parity PR and recorded for PR summary follow-up | next: commit, push, open PR, monitor CI`
- `2026-05-04 | merged | PR #589 merged to main as eb1ab50 after owner screenshot approval, local verify:pre-pr, green CI after PR-body correction and rerun, local verify:pre-merge, and post-merge preflight | next: brief lifecycle closeout`
- `2026-05-04 | done | post-merge preflight surfaced this lifecycle closeout; brief moved from in-progress to done with all target categories closed at 5/5 and 10/10 claim recorded | next: docs-only closeout PR`
