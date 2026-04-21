# Task Brief: Swim Session Builder Library Default Entry, Action Density, And Workspace Nav (10/10)

## Metadata

- `id`: `2026-04-20-swim-session-builder-library-default-entry-action-density-and-workspace-nav-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-20`
- `updated`: `2026-04-21`

## Goal

Make the swim-session builder family read as one clear flow: `My Swim Sessions` is the default library entry surface, mobile row actions become calmer and denser, builder workspace routes stop showing browse-style mobile nav, and saved-session/rearrange/detail surfaces remove dead or redundant UI.

## Sequencing Lock

- Run this brief before:
  - [2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md)
  - [2026-04-18-maintenance-baseline-pre-live-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-18-maintenance-baseline-pre-live-10-10.md)
- Treat this as the current highest-priority builder-family follow-up from the latest findings pass.
- Do not fold poolside export/mobile preview reliability or general maintenance/tooling work into this builder brief.

## Why This Brief Exists

- Current builder-family surfaces still have several connected IA and ergonomics mismatches:
  - `/my-library/workouts` and the builder-family shell still mix `My Swim Sessions` browsing with `Swim session builder` wording,
  - mobile saved-session rows are too action-dense,
  - the current library cleanup mode still depends too heavily on small checkbox hits,
  - rearrange mode shows a circular chevron control that currently does nothing,
  - the saved-session detail summary repeats metadata (`5000m`, `25m`, then `5000m · 25m`) instead of keeping one clear summary line,
  - the current detail-route back path still routes through the heavier `/my-library` hub instead of returning directly to the swim-sessions surface,
  - deep builder/workspace routes still inherit browse-style mobile nav that competes with focused editing.
- The owner direction is now clear:
  - `My Swim Sessions` should be the default saved-sessions entry surface,
  - mobile should reduce button noise,
  - dead controls should be removed,
  - focused work surfaces should not carry the floating bottom browse nav,
  - no hamburger-menu redesign is needed in this slice.

## Dependencies And Boundaries

- Depends on recently shipped saved-session groundwork:
  - [2026-04-20-my-swim-sessions-selection-and-action-label-ergonomics-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-my-swim-sessions-selection-and-action-label-ergonomics-10-10.md)
  - [2026-04-18-swim-session-builder-view-mode-structure-rest-grouping-and-section-color-consistency-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-swim-session-builder-view-mode-structure-rest-grouping-and-section-color-consistency-10-10.md)
  - [2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10.md)
- Primary surfaces likely touched when implementation starts:
  - [/Users/stianvikra/freeswimming/app/my-library/workouts/page.tsx](/Users/stianvikra/freeswimming/app/my-library/workouts/page.tsx)
  - [/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx](/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/components/SiteChrome.tsx](/Users/stianvikra/freeswimming/components/SiteChrome.tsx)
- Locked product decisions for this brief:
  - `/my-library/workouts` should default to the saved-sessions surface, not the create-builder surface,
  - headings must be truthful by route:
    - saved-sessions browse surface: `My Swim Sessions`,
    - active editor/workspace surface: builder-specific heading is allowed,
  - on mobile saved-session rows, one clear primary action (`Open`) should remain visible; secondary actions should move behind a details/disclosure pattern,
  - `Quick View` may be absorbed into a mobile details pattern if that produces a calmer row,
  - the dead chevron in rearrange mode should be removed unless it is given a real, labeled function in the same slice,
  - color may support step-type scanning, but rearrange semantics must not rely on color alone,
  - the fixed bottom mobile browse nav should be hidden on deep focused workout work surfaces,
  - do not add a hamburger-menu redesign in this brief.

## Must Now

- Make `My Swim Sessions` the default workout-library browse surface.
- Make saved-session headings truthful on mobile and desktop.
- Reduce mobile row action density while preserving access to `Open`, `View PDF`, `Poolside Note`, and delete actions.
- Keep library-cleanup selection ergonomic beyond the checkbox itself.
- Remove the dead rearrange chevron control and reclaim that space for actual content/actions.
- Tighten session-detail summary metadata so the total-distance pill remains primary and redundant lines disappear.
- Change deep workout-workspace back/return behavior so it routes back to `My Swim Sessions`, not the heavier top-level hub.
- Hide fixed mobile browse nav on focused workout builder/detail/preview work surfaces.

## Before Live

- Confirm the saved-session browse surface feels calmer on mobile without harming desktop speed.
- Confirm builder-family route names and back paths feel intentional rather than mixed between browse and work modes.
- Confirm rearrange mode stays readable after dead-control removal and mobile control compaction.
- Confirm no adjacent builder flow regresses:
  - local draft recovery,
  - first save,
  - delete,
  - poolside entry,
  - PDF entry.

## Ongoing Cadence

- Future builder-family follow-ups should preserve the split between:
  - browse surfaces (`My Swim Sessions`),
  - focused work surfaces (builder/editor/rearrange/view/preview).
- Do not reintroduce browse-style persistent nav into deep focused editor routes without a new explicit brief.
- Keep mobile row density under control by favoring one obvious primary action and progressive disclosure for secondary actions.

## Approved Micro-Fix Pass Before Screenshot Approval

- Tighten the focused session details card:
  - make the total-distance pill content-width instead of input-like full width,
  - keep `View PDF` visible as an output action,
  - keep primary/destructive actions readable without making the card feel heavier.
- Tighten mobile saved-session rows:
  - closed row shows the session title plus a compact actions icon,
  - expanded mobile action panel includes `Open` as the first action,
  - the expanded-state toggle uses a compact collapse icon with `aria-label="Hide actions"`.
- Tighten rearrange mode:
  - replace `Move up` / `Move down` text buttons with compact arrow buttons,
  - preserve accessible labels and titles for each move action,
  - briefly highlight the card that was moved,
  - announce the move through an `aria-live="polite"` region.
- Tighten mobile edit-header alignment:
  - keep the step summary as the main tappable details area,
  - align the details chevron and `...` actions button as one right-side icon cluster,
  - apply the same icon-cluster pattern to repeat headers,
  - preserve explicit text labels for save/delete/output actions.
- After this pass, take new mobile screenshots for browse rows, expanded actions, session details, and rearrange/moved-state before running `verify:pre-pr`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                          | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Workout-library routes must have truthful route purpose: saved-session browsing defaults to `My Swim Sessions`, while deep editor routes read as focused work surfaces. | screenshot review + route QA                 | `5/5`                   |
| UX flow clarity                               | `target`     | Mobile and desktop users must understand where to browse, where to edit, and how to return, with no dead controls and no row-action overload on mobile.                 | manual QA + targeted e2e                     | `5/5`                   |
| Visual design quality                         | `target`     | Saved-session rows, rearrange cards, and detail summaries must feel calmer and more scannable after density cleanup and dead-control removal.                           | screenshot review + viewport QA              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Default entry, row actions, selection mode, back path, rearrange semantics, and delete flows must remain deterministic with no accidental route or mutation drift.      | unit coverage + e2e + route review           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes authenticated owner workout-builder surfaces, not admin/editor publishing workflows.                                                     | explicit scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Mobile disclosure/actions, selection hit areas, and rearrange semantics must remain keyboard reachable, labeled, and not rely on color alone.                           | semantic review + targeted QA                | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the route cleanup should avoid adding new heavy UI/state churn and should reduce unnecessary detours through the heavier `/my-library` shell.          | diff review + route QA                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Saved workout content remains server-canonical while row disclosure, selection mode, route-entry defaults, and focused-nav visibility remain local UI state only.       | brief contract + code review                 | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route cleanup must not silently change workout fetch/cache behavior; disclosure and density state should reset predictably on route change.            | route review + QA                            | `4/5`                   |
| Reliability and failure handling              | `target`     | No browse/workflow surface may expose dead controls, broken return paths, or unreachable secondary actions on mobile after this slice.                                  | negative-path QA + targeted tests            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth boundary changes; saved-session browse, open, PDF, poolside, and delete remain inside the existing authenticated owner workflow.               | route guard review                           | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this brief changes no personal-data collection, retention, export, or disclosure behavior.                                                                  | explicit scope rationale                     | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: labels and headings become more truthful and less noisy, but no content model or publish governance changes.                                           | copy review + screenshot QA                  | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation flow, publish state, or role-gated editor changes are in scope.                                                                           | explicit scope rationale                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library surface with no public crawl/index contract.                                                                            | explicit scope rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route semantics, metadata, or AI-discoverable content surface.                                                                 | explicit scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not require new instrumentation; workflow QA and regression coverage are sufficient.                                                        | explicit scope rationale                     | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or revenue workflow changes here.                                                                                         | explicit scope rationale                     | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a private owner-facing ergonomics pass and does not introduce a new operational support or incident workflow.                                       | explicit scope rationale tied to brief scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, reconciliation, or reporting path changes are involved.                                                                                 | explicit scope rationale tied to brief scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice standardizes current English owner-facing labels and route hierarchy only; it does not change locale architecture.                               | explicit scope rationale tied to brief scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The solution must stay inside the existing workout-library/builder stack with zero new dependency and reuse current route/layout primitives such as `SiteChrome`.       | dependency diff + architecture review        | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage plus screenshot handoff must lock default entry, mobile row density, selection ergonomics, back path, and rearrange cleanup before merge.    | targeted tests + screenshot QA + verify      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the cleanup should reduce future UI branching by clarifying one browse surface and one focused-workspace pattern rather than adding parallel modes.    | diff review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this must remain a narrow reversible builder/library diff with no schema change or external dependency rollout.                                        | PR plan + rollback review                    | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout identities and summaries,
  - saved workout detail content,
  - current workout step structure and ordering,
  - authenticated route access boundaries.
- Local-only:
  - which sub-surface is expanded or disclosed on mobile,
  - selection mode on/off and selected row IDs,
  - active inline details/quick-preview state,
  - focused workspace nav visibility,
  - any transient route-intent state used to return users to `My Swim Sessions`.
- Sync policy:
  - entering `/my-library/workouts` without an active draft should default to saved sessions,
  - opening a session transitions into the focused editor route without rewriting canonical workout data,
  - mobile disclosure/selection state resets on route change unless already backed by explicit URL state,
  - back from a focused workout route should return to the saved-session surface rather than the heavier `/my-library` hub.
- Retention and sensitivity:
  - new state in this slice is ephemeral UI state only,
  - no new local-storage durability is required beyond existing draft behavior.
- Cache/invalidation:
  - existing workout data ownership and refresh rules remain unchanged,
  - route-level UI state should not become stale across hard refreshes in a way that changes canonical workout truth.

## Identity And Rename Contract

- Canonical stable ID:
  - saved workouts continue to use the existing workout ID as the only canonical identity.
- Human-readable identifiers:
  - titles remain editable display labels only,
  - route headings (`My Swim Sessions`, builder-specific workspace headings) are presentation labels, not identifiers.
- Mutability rules:
  - this brief does not change workout ID mutability or route identity.
- Rename vs repurpose policy:
  - `Open`/heading wording changes are UI-language cleanup only and must not imply entity renaming or canonical record changes.
- Compatibility contract:
  - existing workout-detail links keep working; only return path and entry defaults are refined.
- Observability and repair:
  - if stale routes or missing workouts are encountered, preserve the current explicit missing/return handling instead of silently redirecting into the wrong surface.

## Scope

- Make `My Swim Sessions` the default browse surface when entering the swim-session library area.
- Align route/page headings so saved-sessions browse surfaces read as `My Swim Sessions`.
- Keep builder-specific headings on actual focused work surfaces where the user is editing a session.
- On mobile saved-session rows:
  - keep one primary visible row action (`Open`),
  - move secondary actions behind a calmer disclosure/details pattern,
  - ensure `View PDF`, `Poolside Note`, and delete actions remain reachable.
- Final mobile saved-session-row decision:
  - keep `Open` visible on desktop,
  - on mobile place `Open` first inside the expanded row actions panel,
  - use a compact actions icon on the collapsed mobile row so more of the session name can fit.
- Preserve or improve row/container selection ergonomics in library cleanup mode.
- Remove the dead rearrange chevron control unless it receives a real labeled function in the same implementation.
- Reclaim rearrange card space on mobile:
  - stack or compact move controls,
  - keep step content readable,
  - preserve section semantics without relying on color alone.
- Tighten saved-session detail summary metadata so redundant total/pool-length repetition disappears.
- Change back/return behavior from workout-detail/editor routes to return directly to `My Swim Sessions`.
- Hide `SiteChrome` fixed mobile browse nav on focused workout routes such as:
  - `/my-library/workouts/[workoutId]`
  - `/my-library/workouts/poolside-preview`
  - any explicit workout-workspace route opened for focused editing.

## Out Of Scope

- New hamburger menu or global app-shell redesign.
- Poolside note export reliability fixes.
- General My Library homepage redesign.
- New persistence model for route/default tab state.
- Maintenance baseline, dependency work, or tooling modernization.
- Workout schema changes.

## Acceptance Criteria

1. Entering the workout library without an active local draft lands on the `My Swim Sessions` browse surface by default.
2. Saved-session browse surfaces use truthful `My Swim Sessions` headings on both mobile and desktop.
3. Focused workout editor/detail routes return to `My Swim Sessions`, not the heavier `/my-library` hub.
4. Mobile saved-session rows show one obvious primary action and no longer present the full dense desktop action stack inline.
5. Secondary row actions remain reachable on mobile through a disclosure/details pattern, with `Open` first inside the expanded mobile action panel.
6. Library cleanup mode allows ergonomic row/name/container selection beyond the small checkbox target.
7. Rearrange mode no longer exposes a dead chevron control or oversized move labels.
8. Rearrange mode preserves section semantics in text, not color alone, while reclaiming space for step content on mobile and visibly highlighting the moved card.
9. Session detail summary no longer repeats redundant total and pool-length metadata under the total pill.
10. Fixed bottom mobile browse nav is hidden on focused workout builder/detail/preview work surfaces.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for:
  - route/default-surface state,
  - mobile row disclosure/selection contract,
  - focused-route return path,
  - rearrange control semantics
- targeted Playwright coverage for mobile + desktop workout-library/workout-detail flows
- targeted screenshot handoff with short explanation before `verify:pre-pr`
- owner screenshot approval or correction pass before `verify:pre-pr`, PR creation, and `verify:pre-merge`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - `/my-library/workouts` on desktop
  - `/my-library/workouts` on mobile-width viewport
  - saved workout open/detail route
  - rearrange mode on mobile-width viewport
  - poolside-preview route only for nav-visibility regression checks
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit-equivalent
  - iPhone-width Safari-equivalent
  - Android Chromium-width viewport

## Constraints

- Keep desktop behavior calm; desktop is mostly acceptable and should not be over-redesigned.
- Favor route truthfulness and workspace focus over adding more navigation chrome.
- Do not reintroduce `Edit` as the primary saved-session row action.
- Do not keep a control that does nothing.
- Prefer progressive disclosure on mobile instead of stacking five equal row buttons.
- No new dependency.

## 10/10 Quality Bar

- The builder family should read like one system:
  - browse first,
  - open session,
  - work in a focused workspace,
  - return to `My Swim Sessions`.
- Mobile rows should feel calm, not busy.
- Rearrange mode should feel purposeful, not like unfinished tooling.
- Required states remain clear:
  - default browse state,
  - selection mode,
  - disclosed row details/actions,
  - focused editor route,
  - missing/deleted workout,
  - delete confirmation,
  - rearrange mode.
- Accessibility expectations:
  - labeled disclosure/actions,
  - keyboard reachability,
  - visible focus,
  - no color-only section semantics.
- Business-logic expectations:
  - no accidental deletes,
  - no accidental row-action/selection crossover,
  - no broken back path,
  - no route heading drift between browse and focused work.

## Help/Guide Impact

- Audit current Help/Guide or inline owner-facing guidance for references to:
  - `Swim session builder`,
  - `My Swim Sessions`,
  - row actions such as `Open`,
  - return-path wording.
- If any shipped help text or assertions reference the old workflow/labels, update them in the same PR.
- If no Help/Guide surface currently documents these private builder-family labels, record explicit `N/A` at closeout with audit evidence.

## Checkpoint Log

- `2026-04-20`: Created a clean feature worktree from `origin/main`, moved this brief to `in-progress`, and scoped the slice to truthful builder/library route IA, focused mobile-nav behavior, calmer saved-session mobile rows, rearrange cleanup, and metadata-summary cleanup. Next: implement, capture screenshots, and stop for approval before `verify:pre-pr`.
- `2026-04-21`: Implemented the owner-approved micro-fix pass for mobile saved-session actions, compact detail pills, rearrange arrow controls, moved-card highlight, and mobile edit-header chevron/`...` alignment. Targeted unit validation passed with `./node_modules/.bin/vitest run tests/unit/workout-builder-hub.test.tsx`; refreshed screenshots live in `output/playwright/`. Next: owner screenshot approval, then `npm run verify:pre-pr`.
- `2026-04-21`: Owner approved screenshots. First `npm run verify:pre-pr` run hit one unrelated mobile-nav flake on `preview notify route hides fixed mobile nav and keeps header menu access`; targeted rerun passed, then full `npm run verify:pre-pr` passed. Next: commit, push, open PR, and run merge-readiness checks.
- `2026-04-21`: PR #490 merged to `main` as `48ce827547b4dffecce18ea30bd1a8336f84bc81`. Local `npm run verify:pre-merge` passed before merge-readiness handoff, and GitHub checks were green. This closeout sweep moved the brief to `done`; target scorecard categories remain at `5/5` with no known follow-up gaps in this brief.
