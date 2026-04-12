# Task Brief: Swim Session Builder Garmin Authoring And Poolside Note Redesign (10/10)

## Metadata

- `id`: `2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-11`
- `updated`: `2026-04-12`

## Goal

Make the manual pool swim-session builder and Poolside Note feel materially closer to Garmin-level authoring clarity while reaching a calmer 10/10 FreeSwimming UX for editing, reviewing, and printing workouts.

## Why This Brief Exists

- The recent swim-session builder wave already improved repeat/rest structure, pool-size authoring, helper copy, mobile density, and metadata clarity, but the route still has deeper UX friction:
  - builder labels and option sets still diverge from Garmin in visible ways,
  - action rows still dominate the edit surface,
  - step headers and summaries still read like implementation detail instead of swimmer-first authoring language,
  - time/rest entry is inconsistent,
  - the route still lacks a true calm read-only review mode,
  - Poolside Note still has trust and layout issues around branding, print style, identity, and long-session handling.
- Live production note `e86b5ede-65d7-477e-a641-decc7755116c` still owns one real subset of this work:
  - remove `33.33m` / `33.33yd` as pool-size presets,
  - simplify pool-size copy,
  - auto-create a default rest step after adding a single step.
- Owner live review added broader builder and poolside issues that are not cleanly represented by one existing admin note:
  - remove `Session setup`,
  - simplify exact-size copy,
  - remove `Step 1`-style labeling in favor of type-first labels,
  - improve step summary content,
  - reduce visible step-type and stroke-type divergence from Garmin,
  - revisit target-effort alignment,
  - move action emphasis away from the top of edit cards,
  - unify time-entry UX,
  - add a true `View` mode,
  - redesign Poolside Note header, print controls, and layout choices.
- The platform is still pre-live for this authoring model, so backward compatibility with existing manual pool-workout rows is not a hard requirement if a cleaner canonical model requires reset or cleanup.

## Dependencies And Boundaries

- Parent live-review builder brief:
- [2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md)
- Parent builder/runtime foundation:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Related shipped builder slices that must stay structurally truthful:
  - [2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md)
  - [2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md)
  - [2026-04-11-swim-session-builder-repeat-summary-and-poolside-note-copy-cleanup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-repeat-summary-and-poolside-note-copy-cleanup-10-10.md)
- Related earlier taxonomy slice that this brief may intentionally supersede for manual `pool` authoring:
  - [2026-04-02-workout-builder-drill-kick-taxonomy-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-02-workout-builder-drill-kick-taxonomy-followup-10-10.md)
  - rationale: that slice made `drill` and `kick` explicit top-level builder categories; this new pre-live brief may intentionally remove those top-level pool step types in favor of a cleaner Garmin-5 model if existing pre-live data can be reset.
- Related poolside print/preview surface lineage:
- [2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10.md)
- Primary code surfaces expected in scope:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Locked boundary decisions for this brief:
  - no Garmin Training API push,
  - no program-calendar/planner work,
  - no open-water builder redesign unless shared contract cleanup makes a minimal change unavoidable,
  - no generic site-wide print redesign outside workout builder and Poolside Note.

## Admin Notes And Owner-Requested Scope Disposition

Production/live note and owner-review alignment on `2026-04-11`:

- `e86b5ede-65d7-477e-a641-decc7755116c` `SWIM SESSION BUILDER`
  - disposition: partially owned by this brief.
  - owned here:
    - remove `33.33m` and `33.33yd` as quick presets,
    - simplify visible pool-size copy,
    - auto-create a default rest step after adding a single step.
  - interpretation applied in this brief:
    - removing the preset does not ban the same exact value from exact custom input,
    - quick presets should simplify to the most common choices rather than expose every supported exact size.

Owner-requested scope that should be treated as first-class even without one dedicated admin-note ID:

- remove visible `Session setup` from the metadata panel,
- remove visible `Exact pool size (yd)` / related verbose exact-size helper copy while preserving accessibility semantics,
- replace `Step 1`/`Step 2` style card labels with type-first labels such as `Main` or `Main 1 of 2`,
- enrich step summaries so they read like swimmer-facing set summaries rather than only technical fragments,
- move toward Garmin-style visible step-type choices and stroke-type choices,
- rename `Effort cue` to `Effort`,
- reduce top-heavy action rows on both step cards and repeat blocks,
- unify time entry and rest-time entry into one consistent pattern,
- add a clean read-only `View` mode on the same route,
- rename `Open Poolside Note` to `Print Preview`,
- change `Open focus cues` to `Session Focus`,
- remove contradictory or low-value poolside helper copy,
- make Poolside Note print-style behavior trustworthy,
- add swimmer identity to Poolside Note,
- redesign the Poolside Note header and allow `Portrait` vs `Landscape` print layout.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                            | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Manual pool authoring reads as one coherent swimmer-first workflow: create, review, edit, print, and poolside-preview all feel intentionally connected.                   | brief review + manual QA + targeted e2e | `5/5`                   |
| UX flow clarity                               | `target`     | Step/repeat cards, view mode, pool-size controls, time entry, and Poolside Note controls can be understood in one pass without hidden model translation.                  | manual QA + targeted unit/e2e           | `5/5`                   |
| Visual design quality                         | `target`     | Builder and Poolside Note gain calmer hierarchy, cleaner header structure, better action placement, and more balanced control alignment on desktop and mobile.            | screenshot review + manual QA           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Garmin-like visible simplification does not flatten canonical repeat/rest structure, and any pre-live reset or canonical enum cleanup remains deterministic and explicit. | code review + unit tests + e2e          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: owner authoring stays faster because the pool builder removes noise and makes action placement more predictable.                                         | timed manual QA + scope review          | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: removed visible labels must retain accessible naming, and new view/edit or print-layout controls must stay keyboard and screen-reader friendly.          | Testing Library queries + e2e           | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: calmer UI and extra view/layout toggles must not materially regress builder-route responsiveness or poolside preview rendering.                          | `verify:pre-pr` + targeted review       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief defines exactly what remains server-canonical, what stays local-only, and whether pre-live destructive cleanup is allowed instead of preserving legacy data.    | data contract + code review             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: view/edit mode switches, save/reset, and preview opens must remain deterministic without stale saved-workout or print-preview state.                     | code review + targeted tests            | `4/5`                   |
| Reliability and failure handling              | `target`     | Time-entry normalization, auto-rest creation, print-style selection, and preview/view mode transitions behave predictably with no silent contradictions.                  | targeted unit tests + manual QA         | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: all changed builder and print surfaces remain owner-scoped/authenticated and do not widen access beyond current My Library rules.                        | existing auth coverage + code review    | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because the slice only changes authenticated owner workout authoring and poolside presentation, not public data exposure or compliance handling.                      | explicit scope rationale                | `N/A`                   |
| Content governance                            | `target`     | Garmin-aligned wording, type choices, print labels, and poolside copy stay centralized and truthful instead of drifting across local helper text.                         | copy review + shared-output review      | `5/5`                   |
| Admin workflow and editability                | `target`     | The owner can switch between quiet review and active editing without fighting action clutter, and can prepare a trustworthy poolside printout quickly.                    | manual QA + targeted e2e                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this slice affects authenticated My Library routes and private print previews only, with no public crawl/index contract.                                      | explicit scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata, public route content, or AI-facing discovery surface.                                                                  | explicit scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: view/edit, print-preview, and destructive-action flows should remain observable enough to judge whether the calmer UX reduces friction later.            | event review + code review              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or commercial workflow changes in this builder/poolside slice.                                                              | explicit scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes owner-only authoring and print UX, not support runbooks, alerts, or operational incident response paths.                                   | explicit scope rationale                | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, invoicing, or reporting workflow is changed by this builder/poolside redesign.                                             | explicit scope rationale                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice only reshapes internal English builder/poolside wording and layout, and does not change localization architecture or translation storage.          | explicit scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing builder, saved-session, and poolside preview primitives; do not add a second workout model or unnecessary libraries for layout polish.                     | dependency diff + architecture review   | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage proves the new authoring hierarchy, summary logic, time-entry normalization, Garmin-style visible options, and poolside preview trust contract.                  | unit/e2e + `verify:pre-pr`              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the redesign should reduce authoring friction without adding extra background work, duplicated preview routes, or wasteful client/server churn.          | code review + scope review              | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: if the brief resets pre-live builder data or canonical enums, the rollback path and cleanup instructions must be explicit and reversible during rollout. | migration note + PR rollback plan       | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout rows and `workout.id`,
  - canonical workout draft content,
  - repeat/rest structure and step ordering,
  - manual-pool intensity-target semantics and stored values should align to Garmin as the canonical truth for this slice rather than remain a FreeSwimming-only internal model,
  - saved workout titles/notes and other persisted session metadata,
  - any shared output derived from the current canonical workout.
- Local-only:
  - whether the route is in `View` or `Edit` mode,
  - currently expanded step/repeat cards,
  - unsaved edits,
  - poolside preview selection state such as chosen focus cues, print style, and print layout,
  - ephemeral UI-only summary synthesis such as showing a rest summary on a work-step card.
- Sync policy:
  - normal save keeps the server copy canonical,
  - `View` mode never mutates canonical data,
  - poolside preview preferences remain local unless explicitly promoted in a later brief,
  - if a pre-live reset is chosen for old pool-builder data, it happens as an explicit one-time cleanup rather than hidden read-time compatibility logic.
- Retention and sensitivity:
  - no new public data surface is introduced,
  - swimmer identity shown on Poolside Note should come from the authenticated athlete profile name fields,
  - athlete profile name source should support first name, optional middle name, and last name,
  - no sensitive data beyond the already-authenticated workout context should appear in preview/output.
- Cache/invalidation:
  - saved-workout list, active workout detail, and preview/handoff routes must refresh deterministically after save, reset, delete, or canonical model cleanup.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical workout identity across edit, view, save, preview, PDF, and poolside output.
- Human-readable identifiers:
  - workout title, step labels, summary lines, poolside labels, and swimmer-facing copy are editable or derived presentation labels only.
- Mutability rules:
  - visible builder and poolside labels may change,
  - step/repeat header wording may change,
  - canonical workout IDs do not change,
  - if pre-live cleanup is chosen, old rows may be deleted or reset rather than migrated through permanent compatibility branches.
- Rename vs repurpose policy:
  - editing a workout title or step wording is an in-place presentation change,
  - changing the canonical pool step-type model from `7` visible choices to Garmin-style `5` should be treated as a model cleanup decision, not a silent UI alias over indefinite legacy data.
- Compatibility contract:
  - no backward-compatibility guarantee is required for pre-live manual pool workouts if the owner chooses cleanup over migration,
  - if temporary compatibility is still needed during rollout, it must be explicit and short-lived.
- Observability and repair:
  - any reset/migration path for pre-live pool workouts must be logged in the implementation PR and reflected in validation notes.

## Scope

- Pool Size simplification:
  - remove `33.33m` and `33.33yd` as quick presets,
  - keep only the most common quick presets such as `25` and `50`,
  - simplify visible pool-size copy and headings,
  - remove low-value exact-size helper text in the builder while preserving accessibility semantics,
  - keep exact custom entry available for uncommon sizes, including `33.33`, even when that value no longer appears as a quick preset.
- Metadata-panel cleanup:
  - remove visible `Session setup`,
  - keep the panel focused on actual editable metadata instead of redundant subheadings.
- Single-step rest default:
  - when the owner adds a single step in the manual pool builder through `Add step` or `Add step after`, auto-create a separate canonical rest step below it by default,
  - default that auto-created rest step to `0:30`,
  - keep that rest step fully editable or removable,
  - do not flatten away separate canonical rest structure.
- Garmin-aligned visible step-type model:
  - reduce visible manual pool `Step Type` choices from `7` to Garmin-style `5`,
  - remove top-level `drill` and `kick` as pool step types,
  - keep drill/kick meaning in the remaining structured fields rather than a second top-level pool category.
- Garmin-aligned visible stroke model:
  - align `Stroke Type` options and ordering more closely with Garmin pool authoring,
  - remove `Drill` as a visible stroke-type choice for manual pool authoring,
  - keep drill semantics in `Drill Type`.
- Target/effort labeling cleanup:
  - rename visible `Effort cue` to `Effort`,
  - adopt Garmin-style intensity-target semantics as the canonical model for manual pool authoring where feasible,
  - prefer canonical Garmin alignment over a long-lived internal mapping layer because the product is still pre-live and existing manual pool data can be normalized or reset if needed.
- Step-card hierarchy redesign:
  - replace `Step 1`/`Step 2` style headers with type-first labels such as `Main` or `Main 1 of 2`,
  - when a type appears only once, show only the type label,
  - when a type appears multiple times, number within that type rather than globally.
- Step-summary redesign:
  - make the summary line read more like `Distance/Time - Stroke - Effort - Rest`,
  - allow the work-step summary to reference the next relevant rest step in a UI-only derived way,
  - preserve the underlying canonical separate rest structure.
- Action-hierarchy cleanup for steps and repeat blocks:
  - reduce top-heavy action rows,
  - keep only the most important top-level controls visible near the header,
  - move natural “after this” authoring actions lower in the card/block,
  - move secondary actions such as move, duplicate, and remove into calmer secondary placement or overflow where appropriate.
- Time-entry consistency:
  - unify timed-step and rest-time entry around one consistent input model,
  - make `0:10` and similar short rests fast and reliable to author,
  - keep displayed duration formatting consistent across cards, summaries, preview, and print.
- Clean `View` mode:
  - add a true read-only session view on the same route,
  - let the owner scroll the whole workout without action clutter,
  - keep a clear path back to `Edit`,
  - keep saved sessions opening in `Edit` when entered from Swim Sessions Overview, with a clearly visible `View` toggle rather than changing the default open mode.
- Poolside Note panel cleanup:
  - rename `Open focus cues` to `Session Focus`,
  - rename `Open Poolside Note` to `Print Preview`,
  - remove the sentence `Choose the focus cues and print style before you open the compact lane-side note.`,
  - improve checkbox and radio alignment and visual rhythm.
- Poolside preview trust and layout:
  - preview must reflect the currently selected print style immediately,
  - remove contradictory color-only helper copy from the preview itself,
  - support both `Portrait` and `Landscape` print layout choices,
  - use `Portrait` as the default print layout,
  - expose print-layout selection as radio buttons in the poolside-note builder,
  - keep `Print style` distinct from `Print layout`.
- Poolside header redesign:
  - add swimmer identity from the athlete profile,
  - redesign the top brand/header area so logo, brand, title, and metadata feel intentional and calmer,
  - improve long-workout readability by using the chosen layout effectively.
- Secondary support/debug de-emphasis:
  - keep authoring primary,
  - reduce the prominence of debug/export/support panels and raw JSON in the main editing flow.

## Locked Decisions Before Implementation

The following owner decisions are already locked for implementation:

1. Swimmer identity source:
   - Poolside Note should use athlete-profile name data,
   - supported source fields are first name, optional middle name, and last name.
2. Default rest value after auto-created single-step rest:
   - use `0:30` as the default,
   - apply the same default to both `Add step` and `Add step after`.
3. Effort/intensity target alignment depth:
   - Garmin intensity-target semantics should become the canonical truth for this manual pool slice,
   - do not stop at relabeling the existing FreeSwimming model if a cleaner Garmin-aligned canonical model can be adopted,
   - if legacy pre-live manual pool data no longer fits cleanly, prefer deterministic normalization/reset over long-lived internal mapping complexity.
4. Exact custom support for `33.33` after preset removal:
   - keep `33.33` allowed in exact custom input,
   - do not expose it as a dedicated quick preset button.
5. Default entry mode for saved sessions:
   - open saved sessions in `Edit` when entered from Swim Sessions Overview,
   - provide a clearly visible `View` toggle on the same route.
6. Poolside print layout default:
   - `Portrait` is the default layout,
   - `Landscape` remains an available alternative,
   - layout choice should be offered in the builder with radio-button controls.

## Out Of Scope

- Garmin Training API delivery.
- Open-water builder redesign as a separate UX project.
- Weekly program planner/calendar work.
- Generic site-wide form-control redesign outside builder/poolside surfaces.
- Bulk delete in `My Swim Sessions` unless the owner explicitly folds that in later.
- New poolside sharing or collaboration features beyond single-user preview/print preparation.

## Acceptance Criteria

1. The metadata panel no longer shows visible `Session setup`.
2. Manual pool quick presets no longer show `33.33m` or `33.33yd`.
3. Adding a single pool step through `Add step` or `Add step after` auto-creates a separate canonical `0:30` rest step below it by default.
4. Manual pool `Step Type` visible choices are reduced to Garmin-style `5`.
5. Manual pool `Stroke Type` no longer exposes `Drill` as a visible choice, and the visible option ordering is Garmin-aligned.
6. Step cards no longer use global `Step N` headers; they use type-first labels with within-type numbering when needed.
7. Step summaries become swimmer-facing and can include rest context without flattening canonical rest structure.
8. Step-card and repeat-block actions no longer appear as long dominant action rows at the top of the edit surface.
9. Time and rest entry use one consistent authoring model, and short rests such as `0:10` can be entered reliably.
10. The route supports a clean read-only `View` mode distinct from `Edit`.
11. Poolside setup uses `Session Focus`, `Print style`, `Print layout`, and `Print Preview` wording instead of the current mixed copy.
12. Poolside preview text and rendering always match the selected print style.
13. Poolside preview no longer contains the sentence `Color-first print layout. Turn on Print backgrounds in your browser if you want the blue fills.`
14. Poolside header includes swimmer identity and has a calmer, higher-quality top hierarchy.
15. Poolside Note supports both `Portrait` and `Landscape` layout choices, with `Portrait` as the default and radio-button selection in the builder.
16. Manual-pool target/intensity semantics are Garmin-aligned at the canonical data level rather than only relabeled in UI.
17. Secondary support/debug/export UI no longer dominates the builder’s primary editing zone.
18. Relevant tests, brief/help contracts, and validation evidence are updated for the changed behavior.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- before merge:
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Builder and print-preview validation should run from repo root with the shared dependency set available.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<workoutId>?entry=manual-pool`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended browser/device matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

- Keep the builder calmer than Garmin while preserving Garmin-relevant structure.
- Do not flatten separate canonical rest steps into UI-only metadata.
- Preserve repeat/rest semantics already locked by the recent pool repeat/rest brief.
- If pre-live data reset is chosen, prefer a clean one-time cleanup over long-lived compatibility branches.
- Preserve accessible form labeling even when visible helper text or visible labels are removed.
- Keep Poolside Note usable on paper and on-screen; avoid layouts that only look good in the browser preview.

## 10/10 Quality Bar

- The builder should feel authoring-first, not debug-first.
- A swimmer or coach should understand a step or repeat block without deciphering internal model jargon.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `view`
  - `edit`
  - `print preview`
- Action hierarchy must be obvious:
  - primary authoring actions should feel close to the next natural step,
  - destructive or less-common actions should not dominate the card header.
- Poolside Note must feel operationally trustworthy:
  - selected print style and layout are reflected truthfully,
  - swimmer identity is clear,
  - header branding is calm and legible,
  - long sessions remain readable.
- Business logic must stay deterministic:
  - no silent category/summary corruption,
  - no hidden rest flattening,
  - no contradictory preview wording,
  - no time-entry ambiguity between rest and standard timed steps.

## Help/Guide And Operator Training Contract

- If view/edit mode, print layout, or poolside print terminology changes the owner workflow materially, update Help/Guide or the relevant builder runbook in the same implementation PR.
- If the final implementation keeps all changed behavior self-evident inside the owner-only route and does not alter any documented recovery workflow, explicit `N/A` rationale is acceptable in closeout.

## Security, Privacy, and Compliance

- Authentication and owner-scoped routing remain unchanged.
- Poolside preview must not leak other user data or broaden access beyond the authenticated owner.
- If swimmer identity is sourced from existing account/profile data, only the minimally necessary display field should appear in preview/output.

## Observability And KPI Contract

- Success signals for this slice:
  - fewer top-heavy action decisions while editing,
  - clearer distinction between `View`, `Edit`, and `Print Preview`,
  - fewer builder misunderstandings around step type, stroke type, time entry, and poolside print mode.
- No new KPI pipeline is required by default, but changed flows should remain observable enough in QA and future event review.

## Checkpoint Log

- 2026-04-12
  - latest merge commit: `b283544`
  - completed scope:
    - brief closed after merge of the swim-builder Garmin authoring and poolside redesign work via PR `#415`
    - local `npm run verify:pre-pr` and `npm run verify:pre-merge` were green before merge recommendation
    - required CI checks were green before merge
  - blocker:
    - none
  - next step:
    - move brief to `done`
- 2026-04-12
  - latest base commit: `96c5202`
  - completed scope:
    - Garmin-style manual-pool authoring labels and option sets tightened
    - pool-size presets reduced to `25` and `50` while keeping exact `33.33` entry support
    - builder got explicit `View` / `Edit` modes, calmer action hierarchy, and 0:30 auto-rest insertion for manual-pool standalone step adds
    - poolside panel and print preview updated with swimmer name, portrait/landscape layout, simplified copy, and calmer header treatment
    - targeted unit tests, targeted route/shared tests, and targeted workout-builder Playwright coverage passed
  - blocker:
    - full `npm run verify:pre-pr` hit unrelated flaky desktop Playwright failures outside this slice during repo-wide e2e (`tests/e2e/my-library-generator-intake.spec.ts`, `tests/e2e/my-library-new-content-notice.spec.ts`, and later `tests/e2e/admin-contextual-notes.spec.ts`)
    - all three failing desktop tests passed when rerun in isolation, so current blocker is repo-wide verification instability rather than a reproduced regression in this slice
  - next step:
    - either obtain one clean full `verify:pre-pr` rerun, or stabilize the unrelated flaky desktop e2e path before claiming merge readiness
- 2026-04-12
  - latest local follow-up:
    - added workout-create navigation hardening for the `/my-library` -> new workout route handoff
    - hardened the mobile workout-builder Playwright route wait so first-load builder compilation no longer fails the mobile density scenario
    - raised explicit timeouts on the heaviest `workout-builder-hub` integration tests so full-suite load does not fail this slice's own builder tests
  - verification evidence:
    - `npx vitest run tests/unit/create-manual-workout-button.test.tsx` passed
    - `npx vitest run tests/unit/workout-builder-hub.test.tsx` passed
    - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts --project=mobile-chromium -g "reclaims mobile width and keeps secondary builder actions behind progressive disclosure on phone widths"` passed
  - current blocker:
    - repeated full `npm run verify:pre-pr` attempts are now blocked by unrelated repo-wide unit timeouts outside this slice
    - confirmed outside-slice failures:
      - `tests/unit/admin-context-notes-panel.test.tsx`
      - `tests/unit/session-generator-panel.test.tsx`
    - both outside-slice tests also fail in isolation with their own `5000ms` test timeout, so this is not caused by the swim-builder brief changes
  - next step:
    - fix or explicitly defer the unrelated repo-wide unit timeout debt before claiming this branch merge-ready
