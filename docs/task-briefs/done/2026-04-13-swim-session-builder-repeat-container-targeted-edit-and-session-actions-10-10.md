# Task Brief: Swim Session Builder Repeat Container, Targeted Edit, And Session Actions (10/10)

## Metadata

- `id`: `2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-13`
- `updated`: `2026-04-14`

## Goal

Make repeat blocks scan and edit as first-class session sections, let view-mode cards jump directly into targeted edit, and move save/session actions into the session header so the manual pool builder feels denser and more intentional.

## Dependencies And Boundaries

- Parent lineage:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Recently merged residual cleanup slice:
  - [2026-04-13-swim-session-builder-residual-density-starter-scaffold-and-library-cleanup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-13-swim-session-builder-residual-density-starter-scaffold-and-library-cleanup-10-10.md)
- Relevant delivered swim-builder slices:
  - [2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md)
  - [2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md)
- Locked scope decisions for this slice:
  - implement repeat-container summary and collapse/edit behavior now,
  - implement targeted edit entry from `View` cards now,
  - move save/PDF/reset actions into `Session details` now,
  - do not add drag-and-drop in this slice,
  - do not do private-preview/global-logo/poolside-brand full-pass work in this slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                    | Evidence                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: builder surfaces should read as session sections rather than disconnected cards/actions.                                                                             | code review + QA               | `4`                     |
| UX flow clarity                               | `target`     | Repeat containers, single steps, and session-level actions should each have one obvious scan path and one obvious edit/save path on desktop and mobile.                               | manual QA + e2e                | `5`                     |
| Visual design quality                         | `target`     | The builder should reclaim vertical space, reduce detached control boxes, and make repeat containers look structurally deliberate instead of like one expanded form block.            | preview QA + screenshot review | `5`                     |
| Business logic correctness and data integrity | `target`     | Repeat groups must remain Garmin-compatible canonical structures; only presentation and local editing state may change.                                                               | code review + unit/e2e         | `5`                     |
| Admin editor ergonomics                       | `supporting` | Supporting only: the private authoring surface should reduce pointer travel and repeated mode switching.                                                                              | manual QA                      | `4`                     |
| Accessibility (a11y)                          | `supporting` | Click-to-edit view cards must stay keyboard reachable, and repeat/session action controls must preserve labels, focus order, and clear state.                                         | code review + e2e              | `4`                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no material route slowdown or client-state churn should be introduced by the interaction changes.                                                                    | build + verify                 | `4`                     |
| Data placement and sync boundaries            | `target`     | View/edit mode, open-card state, and repeat expand/collapse state remain local authoring state; saved workout content remains server-canonical and unchanged in meaning.              | brief contract + code review   | `5`                     |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no cache mode or invalidation policy; it only changes local editor presentation and interactions.                                                      | explicit scope rationale       | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: save/reset/delete must still behave predictably after moving actions into the session header.                                                                        | manual QA + e2e                | `4`                     |
| Security and authz                            | `N/A`        | N/A because no auth boundary, entitlement rule, or protected API write policy changes in this slice.                                                                                  | explicit scope rationale       | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal-data scope, storage, or disclosure behavior changes here.                                                                                                     | explicit scope rationale       | `N/A`                   |
| Content governance                            | `N/A`        | N/A because this slice changes UI structure and interaction design, not content governance flows or source-of-truth text policy.                                                      | explicit scope rationale       | `N/A`                   |
| Admin workflow and editability                | `target`     | Authors should be able to scan the workout in `View`, jump into the exact section they want, collapse repeat blocks, and save from the session header without extra vertical hunting. | manual QA + targeted e2e       | `5`                     |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, or crawl behavior changes.                                                                                                             | explicit scope rationale       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable route or metadata surface changes.                                                                                                              | explicit scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not change analytics events or KPI reporting.                                                                                                             | explicit scope rationale       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or billing behavior changes.                                                                                                                     | explicit scope rationale       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no support/incident workflow, only private builder presentation.                                                                                       | explicit scope rationale       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, invoicing, or reporting workflow changes.                                                                                                      | explicit scope rationale       | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes English-only private builder copy and interaction placement, not localization architecture.                                                            | explicit scope rationale       | `N/A`                   |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: implement using the existing `WorkoutEditor` state model and current design system primitives without adding dependencies.                                           | diff review                    | `4`                     |
| Testing and QA automation                     | `target`     | Coverage must protect targeted edit entry, repeat-container collapse behavior, and relocated session actions; `verify:pre-pr` must pass.                                              | updated tests + verify         | `5`                     |
| Scalability and cost efficiency               | `N/A`        | N/A because no backend compute/storage or third-party service footprint changes.                                                                                                      | explicit scope rationale       | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the UI/control refactor should remain easy to rollback as one scoped diff if regressions are found.                                                                  | git diff + PR scope            | `4`                     |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout title, metadata, step list, repeat semantics, rests, and export-facing canonical structure remain source-of-truth on the server.
- Local-only data:
  - `View` vs `Edit` mode,
  - currently opened step card,
  - currently opened repeat container,
  - unsaved form edits before save,
  - temporary save-status and removal-confirmation UI.
- Sync policy:
  - clicking a card in `View` moves the editor into targeted local edit state only; no server write occurs,
  - save/reset/delete continue to use existing write/reset paths,
  - repeat collapse state is presentation-only and never mutates canonical step ordering or semantics.
- Retention and sensitivity:
  - no new retained client storage is introduced,
  - no new sensitive data is collected or exposed.
- Cache/invalidation:
  - unchanged from current builder behavior; successful save/reset/delete continues to drive the same existing refresh/invalidation logic.

## Identity And Rename Contract

- Canonical stable ID:
  - workout IDs, step IDs, and repeat-group IDs remain the canonical identities.
- Human-readable identifiers:
  - labels such as `MAIN 2 OF 3`, `Repeat block`, and `Session details` are presentation-only and may change without data migration.
- Mutability rules:
  - this slice does not rename or repurpose persisted entities.
- Rename vs repurpose policy:
  - N/A for persisted entities because no rename/repurpose behavior changes here.
- Compatibility contract:
  - test IDs that existing coverage depends on should be preserved unless updated in the same slice.
- Observability and repair:
  - regressions are detected by targeted e2e/unit coverage and the standard verify gates.

## Scope

- `components/my-library/workouts/WorkoutEditor.tsx`
- relevant tests covering:
  - manual pool repeat blocks,
  - builder view/edit transitions,
  - session save/reset/delete action placement,
  - manual pool `View` mode behavior
- brief/checkpoint updates tied to this slice

## Out Of Scope

- Drag-and-drop step movement or repeat reordering by gesture.
- Global desktop header/logo cleanup.
- Private preview access page redesign.
- Poolside-note full visual-brand redesign.
- Dryland / land-training builder work.
- New Garmin data contracts or repeat/export semantics beyond presentational clarity.

## Acceptance Criteria

1. Manual-pool repeat containers no longer read only as `Repeat set`; they show top-level section identity and explicit repeat-container meaning in a scan-friendly summary.
2. Repeat containers can collapse/expand in authoring mode without flattening away internal canonical structure.
3. In `View` mode, clicking a single-step card opens targeted edit for that exact section.
4. In `View` mode, clicking a repeat-container card opens targeted edit for that repeat container.
5. `Session details` becomes the home for save/reset/PDF/session-delete actions in the calm manual-pool builder layout.
6. The separate bottom save-actions card is removed for the calm manual-pool builder layout without losing dirty/saved-state clarity.
7. Mobile and desktop layouts both stay readable and avoid cramped destructive/primary-action collisions.
8. Repeat, save, reset, delete, and PDF behaviors remain functionally unchanged apart from the intended interaction and placement updates.
9. Relevant unit/e2e coverage is updated in the same slice.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit/e2e for changed builder behavior
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>?entry=manual-pool`
- Preview:
  - Vercel preview URL from the PR checks
- Recommended browser/device matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit

## Constraints

- Preserve Garmin-compatible canonical repeat/rest semantics.
- Do not flatten the repeat group into fake single-step data.
- Keep destructive actions visually separated from primary save actions.
- Preserve current builder visual language while making the hierarchy denser and clearer.

## 10/10 Quality Bar

- Repeat blocks should scan like real session sections, not like a permanently expanded nested form.
- `View` mode should feel like a clean reading surface with immediate targeted edit entry.
- Session-level actions should live where the user naturally thinks about the workout itself, not in a detached footer card.
- All changed states must remain clear across `view`, `edit`, `collapsed`, `expanded`, `dirty`, `saved`, `delete pending`, and `reset`.
- Business logic must remain deterministic:
  - no change to repeat ordering,
  - no change to post-set-rest suppression rules,
  - no silent canonical data mutation from view/edit toggling,
  - no save-state ambiguity.

## Help / Guide Impact

- `N/A` for public Help/Guide content because this slice changes private builder ergonomics only and does not change a public-facing workflow contract.

## Checkpoint Log

- `2026-04-13 | in-progress | brief created after owner review of residual swim-session-builder findings: repeat containers need top-level section identity and collapse behavior, view cards should enter targeted edit, and save/PDF/reset actions should move into Session details; drag-and-drop remains explicitly deferred | next: implement WorkoutEditor interaction/layout updates, then update targeted tests and run verification gates`
- `2026-04-13 | in-progress | WorkoutEditor now gives repeat containers first-class section summaries/collapse state, view-mode targeted edit entry, and session-level actions inside Session details; targeted typecheck, unit, builder Playwright, and brief lint are green | next: commit and open PR, but note that full verify:pre-pr is currently blocked by unrelated untouched desktop Chromium e2e failures in admin-notes, course-progress, and athlete-profile suites`
- `2026-04-13 | in-progress | commit 1b14686 captured the scoped builder slice after targeted validation; full verify:pre-pr still hit unrelated untouched repo E2E blockers outside builder scope | next: push branch, update/open PR, and report merge readiness as blocked by baseline red suites until those are resolved or waived`
- `2026-04-14 | in-progress | rebased branch cleanly onto main after merge commit 7b41f3a from PR #425 resolved the shared desktop Chromium baseline instability; this slice no longer has the previously recorded repo-baseline blocker and should now be revalidated through the standard gates | next: run lint:briefs plus verify:pre-pr on the rebased branch, force-push PR #424, then run verify:pre-merge before final merge recommendation`
- `2026-04-14 | done | merged to main in PR #424 via commit 48f20cd after rebased pre-pr and pre-merge validation both passed locally and all required GitHub checks were green | closeout: move brief to done`
