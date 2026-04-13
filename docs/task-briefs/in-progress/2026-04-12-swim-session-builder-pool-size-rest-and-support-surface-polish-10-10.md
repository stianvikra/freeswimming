# Task Brief: Swim Session Builder Pool Size, Rest, And Support Surface Polish (10/10)

## Metadata

- `id`: `2026-04-12-swim-session-builder-pool-size-rest-and-support-surface-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-12`
- `updated`: `2026-04-12`

## Goal

Make the remaining swim-session-builder surfaces calmer, tighter, and more trustworthy by simplifying the pool-size composer, removing low-value support/save chrome, and making rest/read summaries feel human instead of schema-like.

## Why This Brief Exists

- The recent swim-builder wave already shipped the heavy structural work:
  - Garmin-compatible repeat/rest semantics,
  - poolside-note redesign,
  - read/edit scanability improvements,
  - delete-flow trust improvements,
  - and broader builder polish.
- The remaining owner findings are now narrower and more presentation-contract focused:
  - pool-size UI still carries too much sectional chrome,
  - save/export/support surfaces still expose too much implementation framing,
  - high-visibility estimated-time summaries still read as less trustworthy than the distance/session-type summary,
  - and rest rows still sound too much like internal duration enums instead of simple human swim language.
- This should be a narrow follow-up child brief, not a new umbrella:
  - it must extend the shipped swim-builder contract,
  - not reopen delivered repeat/rest business logic,
  - and not absorb unrelated My Library, private-gate, landing, or dryland work.

## Dependencies And Boundaries

- Foundational lineage:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- Recent shipped swim-builder child briefs this slice must build on rather than duplicate:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-10-swim-session-builder-helper-copy-and-delete-copy-cleanup-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md`
- Primary implementation surfaces expected in scope when this brief is executed:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Locked boundary decisions:
  - no reopening of canonical repeat/rest export semantics,
  - no reopening of already-shipped poolside-note brand/output redesign beyond incidental copy/path updates required by in-scope builder changes,
  - no `My Swim Sessions` cleanup-mode work such as selection-copy cleanup,
  - no private preview gate / landing-surface work,
  - no dryland / land-training work,
  - no new Garmin integration scope,
  - no fake “blank start” or new workout skeleton work in this slice.
- Required preflight before execution:
  - reconcile the final implementation scope against the shipped code and the briefs above so this slice only captures still-live seams and does not duplicate already-merged work.

## Product Direction Locked By This Brief

1. `Pool Size` should read as one compact authoring control, not a mini form split into multiple subsection cards.
2. The normal builder surface should not expose internal support/export readiness chrome unless the user explicitly needs it.
3. Save/export actions should feel like a clean builder toolbar, not a status explanation panel.
4. High-visibility builder summaries should optimize for trustworthy scanability before showing approximate calculated time.
5. Rest rows should use simple swim language:
   - `REST`
   - `Rest: 0:10`
   - or equivalent human wording,
     not internal labels like `Fixed Rest Time` or redundant intensity/context labels like `Recovery`.
6. Existing canonical data and Garmin-compatible semantics remain the source of truth.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Builder chrome and summaries clearly separate primary authoring tasks from secondary/export/debug concerns, and pool-size authoring reads as one coherent control.     | screenshot review + manual QA          | `5`                     |
| UX flow clarity                               | `target`     | Pool-size editing, rest-step scanning, and top-level save/export actions feel self-evident without low-value helper text or schema-like wording.                       | targeted unit/e2e + manual QA          | `5`                     |
| Visual design quality                         | `target`     | The changed builder surfaces feel calmer, less boxed-in, and more intentional, with cleaner hierarchy and less visual noise across desktop and mobile.                 | screenshot review + preview QA         | `5`                     |
| Business logic correctness and data integrity | `target`     | Pool-length/unit persistence, exact-input semantics, rest rendering, and estimated-duration data remain canonical and deterministic even if some summaries are hidden. | targeted tests + code review           | `5`                     |
| Admin editor ergonomics                       | `target`     | High-frequency pool authoring tasks require fewer interpretation steps: pool size is faster to read, support chrome is out of the way, and rest rows scan faster.      | manual QA + targeted tests             | `5`                     |
| Accessibility (a11y)                          | `target`     | Removed visible headings/helper text are replaced with preserved labels/ARIA semantics so keyboard, screen-reader, and touch behavior remain clear.                    | code review + targeted QA              | `5`                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this slice should not materially regress private builder responsiveness or add heavy client work.                                                     | `npm run build` + diff review          | `4`                     |
| Data placement and sync boundaries            | `target`     | The brief and implementation explicitly preserve server-canonical workout fields while treating builder mode, support visibility, and summary presentation as local.   | brief contract + implementation review | `5`                     |
| Caching and invalidation strategy             | `supporting` | Supporting only: summary/panel cleanup should not alter save/delete refresh behavior beyond any in-scope adjacent summary surfaces.                                    | code review + workflow QA              | `4`                     |
| Reliability and failure handling              | `target`     | Removing support/save chrome must not hide important recovery states; users still see clear saved/unsaved/error feedback and exact-input validation behavior.          | targeted tests + manual QA             | `5`                     |
| Security and authz                            | `supporting` | Supporting only: reuse existing authenticated workout APIs and owner-scoped builder routes without changing privilege boundaries.                                      | route review                           | `4`                     |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes no new personal-data collection, disclosure, sharing, or protected-surface policy.                                                      | explicit scope rationale               | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: wording becomes more truthful and lower-noise, but no new content governance workflow or source-of-truth model is introduced.                         | copy review                            | `4`                     |
| Admin workflow and editability                | `target`     | The owner can edit pool workouts with fewer distracting panels and faster scanability, especially around rest and pool-size authoring.                                 | manual QA + targeted unit/e2e          | `5`                     |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated My Library routes with no public crawl contract.                                                                                   | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, metadata, or AI-discoverable content surface.                                                                          | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not add or change analytics event contracts; it is a local authoring-surface polish only.                                                  | explicit scope rationale               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, subscription, entitlement, or billing surface changes.                                                                                         | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice removes normal-user support chrome from the builder surface only and does not change incident/runbook/support tooling workflows.                | explicit docs-only scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, refund, or reporting workflow changes here.                                                                                            | explicit scope rationale               | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice refines private English builder copy/layout only and does not introduce a new localization contract.                                            | explicit scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The slice reuses existing builder utilities, shared workout helpers, and current design language without introducing a new dependency or shadow system.                | dependency diff + code review          | `5`                     |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage protects pool-size labeling/layout behavior, save/export chrome cleanup, and rest-summary rendering; `verify:pre-pr` must pass.             | updated tests + `verify:pre-pr`        | `5`                     |
| Scalability and cost efficiency               | `N/A`        | N/A because this slice changes no background jobs, query strategy, or cost-bearing runtime architecture.                                                               | explicit scope rationale               | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: no schema migration is expected, so rollback should remain a normal code rollback with no data repair step.                                           | diff review + validation               | `4`                     |

## Data Placement And Sync Contract

- Server-canonical data:
  - workout rows and stable workout IDs,
  - canonical workout draft payloads,
  - `poolLengthM`,
  - selected workout pool-length unit,
  - canonical step/repeat/rest semantics,
  - canonical `estimatedDurationMin` when derived and saved today.
- Local-only data:
  - builder `edit` vs `view` mode,
  - visibility of any optional support/debug panels,
  - in-progress exact pool-size input formatting,
  - presentation-only summary decisions such as whether approximate time is shown in a given high-visibility surface.
- Sync policy:
  - save/update/delete remain authoritative only after server confirmation,
  - this slice may simplify or hide presentation of canonical values,
  - but it must not mutate or reinterpret the underlying canonical data model without explicit scope in this brief.
- Retention and sensitivity:
  - no new retained data is introduced,
  - hidden support/export chrome must not silently become the only place critical recoverability information exists.
- Cache/invalidation:
  - existing save/delete/list refresh behavior remains authoritative,
  - any changed summary surfaces must re-read canonical values through the current builder/workout snapshot flow.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical stable identity for builder routes and saved workout operations.
- Human-readable identifiers:
  - workout title is editable display metadata only,
  - labels such as `Pool Size`, `REST`, `View PDF`, and section copy are presentation labels only.
- Mutability rules:
  - this brief may rename visible UI labels in place,
  - but it must not repurpose workout identity, route params, or saved-entity ownership.
- Rename vs repurpose policy:
  - presentation-only wording/layout cleanup is an in-place change,
  - any materially different workout object still requires a new saved row through existing create flows.
- Compatibility contract:
  - older saved workouts must continue to load into the same canonical schema even if top-level summaries are cleaner or shorter.
- Observability and repair:
  - regressions should be detectable through targeted summary/render tests and manual QA on saved workouts created before the slice ships.

## Scope

- Simplify the `Pool Size` surface in the manual pool builder:
  - keep one visible heading: `Pool Size`,
  - remove visible subheadings such as `Unit`, `Common sizes`, and `Exact size`,
  - remove the vertical divider,
  - make the control read as one coherent authoring surface across desktop and mobile,
  - preserve hidden labels / accessibility semantics,
  - keep unit toggle, preset buttons, and exact input,
  - keep a non-editable unit suffix on the exact input (`m` / `yd`) so the typed field is cleaner and unambiguous.
- Simplify normal save/export/support chrome in the builder:
  - remove the visible `Export and handoff support` strip from the standard owner flow,
  - remove the large explanatory save/export panel from the standard builder view,
  - move `Save changes`, `Reset to last saved`, and PDF into a cleaner compact action row/toolbar,
  - rename `PDF` to `View PDF`,
  - use concise save state feedback instead of large explanatory text walls,
  - stop showing the raw draft/support JSON preview in the normal builder flow,
  - keep advanced support/debug output available only behind an explicit secondary support disclosure when it still needs to exist.
- Tighten high-visibility workout summary trust:
  - remove or demote `~N min` from builder/detail/list summary surfaces where the estimate reads as ungrounded to the user,
  - keep canonical estimated-duration data intact unless a later brief explicitly changes the contract,
  - prefer distance + session type + other trustworthy authored values in the highest-visibility summary rows.
- Refine rest-step read treatment:
  - rest rows/cards should read as human swim language, not internal duration-mode jargon,
  - avoid `Fixed Rest Time` in collapsed/read summaries,
  - avoid redundant context labels like `Recovery` when the row is already clearly a rest row,
  - present rest in a compact scan-friendly format such as `REST` plus `Rest: 0:10`,
  - right-align or compactly place the `Edit` action where doing so saves vertical space without harming accessibility,
  - keep rest visually distinct from normal swim steps.
- Update targeted tests and any brief/help contract touched by the changed workflow labels.

## Out Of Scope

- `My Swim Sessions` cleanup-mode wording or bulk-selection polish.
- Private preview gate / first-impression / landing brand work.
- Dryland / land-training work.
- New workout skeleton or starter-template behavior.
- Poolside-note output redesign beyond any incidental label/path changes required by in-scope builder chrome cleanup.
- Canonical repeat/export semantics, Garmin mapping rules, or new workout schema changes.
- Drag-and-drop step reordering.

## Acceptance Criteria

1. Manual pool `Pool Size` shows one visible section heading and no longer reads as three subsection forms.
2. Exact pool-size entry remains unambiguous through the visible unit suffix while preserving current canonical persistence semantics.
3. The standard builder view no longer shows the generic `Export and handoff support` panel.
4. The standard builder view no longer relies on a large explanatory save/export panel; save/reset/View PDF appear in a compact action row instead.
5. The visible PDF action is renamed `View PDF`.
6. Raw draft/support JSON is no longer visible by default in the standard builder flow.
7. High-visibility builder summaries no longer show approximate duration where that estimate is not clearly explained or trusted.
8. Collapsed/read rest rows do not use `Fixed Rest Time` or redundant `Recovery` wording.
9. Rest rows remain clearly distinct from swim steps while staying compact and easy to scan.
10. Existing canonical save/update/delete behavior and Garmin-compatible workout semantics remain unchanged.
11. Relevant tests and any directly affected brief/help copy contracts are updated in the same slice.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run build`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts`
  - `http://127.0.0.1:3000/my-library/workouts/<id>?entry=manual-pool`
- Preview:
  - Vercel preview URL from the PR checks.
- Recommended browser/device matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit

## Constraints

- Preserve the current FreeSwimming builder visual language while reducing noise.
- Do not remove important recovery/error/save feedback just because the explanatory panels are being simplified.
- Do not make pool-size authoring ambiguous when removing visible subgroup headings.
- Prefer presentation cleanup and structural tightening over new concepts.
- Keep the slice narrow and follow-up sized.

## 10/10 Quality Bar

- Pool-size authoring should feel like one intentionally designed control, not a cluster of nested boxes and labels.
- Save/export surfaces should feel calmer and more premium, with the user’s main task in focus.
- Rest rows should read instantly during scanning and not require the user to mentally translate internal terminology.
- Hidden or removed explanatory copy must be replaced by stronger information architecture, not by ambiguity.
- All changed UI states must remain clear across:
  - loading,
  - empty,
  - validation error,
  - save success,
  - save failure,
  - and reopened saved workout flows.
- No silent data corruption, no canonical export drift, and no layout-only cleanup that breaks accessibility semantics.

## Help/Guide Impact

- Update Help/Guide only if the shipped workflow labels or visible owner instructions materially change.
- If no published Help/Guide contract is touched, implementation closeout must state `N/A` explicitly with rationale.

## Checkpoint Log

- `2026-04-12 | planning | created a new planned follow-up brief after the remaining swim-session-builder findings narrowed to pool-size composition, support/save chrome cleanup, summary trust, and rest-row wording; adjacent My Swim Sessions cleanup, private-gate, landing, and dryland work stay intentionally separate | next: use this as the next swim-builder child brief if the owner prioritizes these remaining builder seams over adjacent tracks`
- `2026-04-12 | in-progress | execution started on branch feat/swim-session-builder-pool-size-rest-support-polish-2026-04-12; scope was tightened to explicitly own the still-visible raw draft/support JSON preview inside the same support-surface cleanup slice so the standard builder flow ends up fully calm by default | next: implement WorkoutEditor and SavedWorkoutsPanel cleanup, then update unit/e2e coverage`
- `2026-04-12 | in-progress | implemented the builder polish slice, updated unit/e2e coverage, and verified the changed swim-builder paths locally; targeted runs passed for workout-builder hub, workout shared logic, generator-intake, program-export, and workout-builder desktop coverage, but full \`npm run verify:pre-pr\` remains blocked by unrelated desktop-Chromium failures in \`admin-contextual-notes\`, \`my-library-athlete-profile\`, and long-suite program export readiness drift | next: decide whether to keep this slice parked as functionally ready but gate-blocked, or open a separate repo-stability pass for the unrelated failing specs before PR/merge work continues`
- `2026-04-13 | in-progress | stabilized the unrelated long-suite E2E drift inside the same worktree, finished the builder support-surface polish, and passed full \`npm run verify:pre-pr\` locally with log at \`artifacts/test-runs/20260413-054307/verify.log\`; shipped state now includes one-piece pool-size authoring, calmer save/support chrome, hidden-by-default draft JSON, clearer rest summaries, and \`View PDF\` wording across builder surfaces; performance-budget trend is held, not tightened, because this slice does not own the public AW-010 budget routes | next: commit, push, open/update PR, monitor CI, then run \`npm run verify:pre-merge\` before merge recommendation`
