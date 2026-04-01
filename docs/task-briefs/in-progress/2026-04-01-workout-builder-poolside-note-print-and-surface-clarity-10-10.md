# Task Brief: Workout Builder Poolside Note Print And Surface Clarity (10/10)

## Metadata

- `id`: `2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-01`
- `updated`: `2026-04-01`

## Goal

Make the saved-workout editing flow calm and focused, and make the Poolside Note print/PDF output intentional, compact, and trustworthy across Safari print, PDF preview, and real paper.

## Why This Brief Exists

- Review of the saved-workout flow shows two connected UX problems in the same authoring/execution surface:
  - the workout builder pushes too much secondary information above the actual workout steps,
  - the Poolside Note looks reasonable in-app but breaks down in Safari print/PDF flows by stretching to full A4 and losing important visual intent.
- Current user pain from the review:
  - Poolside Note stretches across the full A4 print canvas instead of staying compact,
  - background colors do not survive print unless the browser explicitly prints backgrounds,
  - the footer text `Compact lane-side...` reads like implementation guidance instead of useful athlete-facing output,
  - the current logo treatment is not production-ready for print,
  - users cannot choose which open focuses should appear on the Poolside Note before printing,
  - the top of the Swim session builder is overloaded with support/export/detail surfaces before the actual workout,
  - existing-session editing should prioritize the workout itself, not a stack of secondary panels.
- This is primarily a builder IA, print-output, and progressive-disclosure cleanup slice.

## Dependencies And Boundaries

- Existing parent builder/poolside brief that remains authoritative for the broader editor direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- Existing generator/builder compatibility work that must stay intact:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-28-generator-intake-ux-clarity-and-progressive-disclosure-10-10.md`
- Locked boundaries unless explicitly changed later:
  - the canonical workout schema stays authoritative,
  - this slice does not redesign the workout step model,
  - this slice does not add new AI generation logic,
  - this slice does not change who can access workout routes or export routes,
  - the Poolside Note remains a compact derivative view of the same canonical workout, not a second editable workout entity.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                          | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Existing-session users can immediately understand the difference between editing the workout and preparing a compact poolside handoff, without competing top-level UI.  | IA review + manual QA + unit/e2e                    | `5/5`                   |
| UX flow clarity                               | `target`     | Existing saved sessions open with the workout itself visible first, and Poolside Note choices (focus selection + print style) are understandable before print.          | timed manual QA + targeted e2e                      | `5/5`                   |
| Visual design quality                         | `target`     | Poolside Note looks intentional in builder preview, browser print preview, exported PDF, and printed A4; scaling, logo, spacing, and optional color mode all hold.      | screenshot review + Safari print QA + e2e snapshots | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Selected open focuses, print style, and collapse state never mutate the canonical workout or training-context data, and output matches the user’s explicit choices.     | unit tests + runtime guards + e2e                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes authenticated end-user workout editing and print handoff, not an admin authoring workflow.                                               | explicit scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Collapse controls, focus selectors, and print-style controls are keyboard reachable, properly labeled, and announce state/selection clearly.                            | targeted unit/e2e + manual keyboard QA              | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Builder route changes add no material payload regression, and opening the Poolside Note remains responsive without extra blocking network hops for already-loaded data. | build/perf budgets + targeted interaction QA        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Print-specific choices stay local-only, while workout content and open-focus source data remain server-canonical and explicitly separated.                              | brief contract + tests                              | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: this slice must not introduce stale poolside or builder reads after workout or training-context changes.                                               | code review + targeted tests                        | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing logo asset, popup-blocked print view, no-open-focus state, and stale/closed focus references all fail gracefully with clear recovery UI.                        | negative-path review + unit/e2e                     | `5/5`                   |
| Security and authz                            | `target`     | Workout and poolside print surfaces remain owner-scoped, and any print-specific selection inputs are validated against the authenticated user’s visible focus set.      | route guards + negative-path tests + code review    | `5/5`                   |
| Privacy and compliance                        | `target`     | Poolside Note includes only workout data plus the explicit subset of open focuses the user chose, with no accidental leakage of unrelated training-context data.        | code review + unit/e2e + manual QA                  | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: print/output copy, labels, and logo usage must stay coherent with the My Library and workout-builder naming model.                                     | copy review + lineage review                        | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow, publishing state, or admin route label changes are part of this slice.                                                          | explicit scope rationale                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated workout builder and poolside print surfaces are private owner routes, not public crawl targets.                                               | explicit scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata or public AI-discoverable route content.                                                                              | explicit scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing export/open-print flows should remain truthful, and new builder/poolside option selections should be trackable if events already exist.       | analytics review + code review                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or billing behavior changes in this builder/poolside refinement slice.                                                   | explicit scope rationale                            | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: support notes/runbooks should explain the new print-style choice, focus-selection behavior, and collapsed builder metadata behavior.                   | runbook/help review                                 | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no finance reconciliation, payout, or reporting workflows.                                                                               | explicit scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new print-style and collapse labels must stay locale-extensible and avoid browser-specific jargon that is hard to localize later.                      | copy review + explicit scope rationale              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | The slice reuses existing Next.js/TypeScript/print-render patterns, adds no new dependency for logo handling or print toggles, and uses a committed derived asset.      | dependency diff + code review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Poolside print rendering, focus selection, style toggles, and collapsed-vs-expanded builder states are covered with targeted unit/e2e plus full pre-PR verification.    | targeted tests + `npm run verify:pre-pr`            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: print preview generation should avoid wasteful duplicate work or server roundtrips for data already present in the builder.                            | code review + interaction review                    | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this slice must be easy to rollback without schema migration or irreversible content transformation.                                                   | PR diff + rollback notes                            | `4/5`                   |

Score gate policy:

- release gate: all `target` categories must close at `>=4/5`
- `10/10` claim gate: all critical target categories must close at `5/5`

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout metadata and step structure,
  - open-focus source data from the training-context snapshot,
  - authenticated owner access to workout/export routes.
- Local-only data:
  - whether the top builder metadata section is expanded or collapsed,
  - which open focuses are selected for the current Poolside Note output,
  - whether the current Poolside Note output is `full color` or `ink saver`,
  - temporary print-preview/open-popup state.
- Sync policy:
  - changing poolside focus selection or print style must not write back to the workout or training-context source data,
  - if local print selections reference a focus that is no longer open/available, the UI must drop or flag that selection explicitly before output,
  - collapse state may be local-device state only; if persisted locally, it must remain scoped to the current user/device and never affect server-canonical workout content.
- Retention and sensitivity:
  - Poolside Note should only include explicitly selected open focuses, not the full training-context snapshot by default,
  - no extra sensitive note text or unrelated private data may be injected into print output.
- Cache/invalidation:
  - no new fetch path should be required just to print already-loaded workout data,
  - if the builder refreshes workout or training-context data, the next print view must reflect the refreshed canonical data plus the current local print selections.

## Identity And Rename Contract

- Canonical stable IDs:
  - workout identity remains the canonical workout ID,
  - open-focus selection must be keyed by canonical focus IDs, not by visible focus titles.
- Human-readable identifiers:
  - session title, focus title, print labels, and logo alt text are presentation-level identifiers and may be renamed for clarity.
- Mutability rules:
  - selecting or deselecting a focus for Poolside Note output is local presentation state only,
  - editing builder title/environment/equipment remains canonical workout editing as before.
- Rename vs repurpose policy:
  - changing which focuses appear on the Poolside Note changes only the generated handoff output,
  - it must not repurpose or silently mutate the underlying focus entities.
- Compatibility contract:
  - existing `variant=poolside` export/open flows must keep working,
  - new print-style or focus-selection options must degrade gracefully when absent so older links and workflows still open a valid Poolside Note.
- Observability and repair:
  - unresolved focus IDs, missing derived logo assets, or popup-open failures should surface deterministic UI guidance rather than silently producing broken output.

## Scope

- Simplify the saved-workout editing surface in `/my-library/workouts/[workoutId]` so existing-session users can focus on the workout itself first.
- Keep only the core workout metadata form section in the top builder block:
  - title through equipment,
  - with a clear collapse/expand control.
- Collapse that top metadata block by default when editing an existing saved session, while keeping it reopenable on demand.
- Move or collapse secondary non-core panels so they do not dominate the top of the builder when the user is actively editing a session.
- Rework the Poolside Note print/PDF presentation so the note stays intentionally compact and does not stretch across the full A4 print canvas at default print settings.
- Remove the footer/helper copy:
  - `Compact lane-side note for the saved canonical workout. Print at actual size on A6 or quarter-A4.`
- Add a print-ready brand mark using a derived asset from:
  - `public/logos/logo_black.psd`
  - required deliverable: `public/logos/logo_black_print.png` as a committed transparent print-safe PNG derived from the PSD, so runtime can embed it directly without reading PSD at runtime.
- Add pre-print focus selection so the user can choose which open focuses appear on the Poolside Note.
- Add a pre-print style choice so the user can choose:
  - a background-preserving color mode,
  - or an ink-saver text-first mode.
- Ensure the print preview itself visibly reflects the chosen mode before the browser print dialog opens.
- Preserve existing owner-scoped access, PDF/open-print flows, and canonical workout editing behavior.

## Out Of Scope

- Rewriting the workout step model or changing canonical workout schema.
- Redesigning the full manual-builder information architecture beyond the changed top metadata/support surfaces.
- New AI generator behavior.
- Weekly program export redesign.
- Public guide or course print surfaces.
- Adding a new persistent `poolside preferences` entity unless a later brief explicitly introduces one.

## Acceptance Criteria

1. Existing saved sessions open with the workout steps prioritized visually, and the top metadata form is collapsed by default with an explicit reopen control.
2. The top editable metadata section contains only the core workout form content needed for routine editing, from title through equipment.
3. Secondary non-core surfaces above the workout are removed, moved lower, or collapsed so the builder no longer feels overloaded before the actual workout.
4. Poolside Note print preview no longer scales into a full-bleed A4-style sheet at default `100%` print settings; it remains intentionally compact and layout-stable in Safari preview and saved PDF.
5. The footer text `Compact lane-side...` is removed from the Poolside Note.
6. Poolside Note uses `public/logos/logo_black_print.png`, derived from `public/logos/logo_black.psd`, as the committed print-safe logo asset.
7. Users can choose which open focuses appear on the Poolside Note before opening print/PDF output.
8. If there are no open focuses, the UI explains that clearly and still allows a valid Poolside Note without a focus block.
9. Users can choose between a color-preserving print mode and an ink-saver mode before print, and the chosen mode is reflected in preview/output.
10. Color mode preserves intended backgrounds when the browser allows it; ink-saver mode remains legible and intentional even when backgrounds are suppressed.
11. Focus selection and print-style choices never mutate canonical workout content or training-context source data.
12. Missing logo asset, popup-blocked print windows, or invalid/stale focus selections fail with explicit recovery guidance.
13. Changed copy, labels, and print controls remain keyboard accessible and screen-reader understandable.
14. Relevant targeted tests plus full `npm run verify:pre-pr` pass before PR handoff.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - poolside print HTML/model generation,
  - focus-selection state and fallback handling,
  - collapsed-vs-expanded builder top section defaults,
  - print-style mode switching without canonical mutation
- targeted e2e for:
  - saved workout builder default-collapsed behavior,
  - poolside note print flow with selected focuses,
  - poolside note color vs ink-saver preview states
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local iteration:
  - `http://127.0.0.1:3000/my-library/workouts/<saved-workout-id>`
  - browsers/devices:
    - Desktop Safari with native print preview
    - Desktop Chrome
    - Desktop Firefox
    - tablet viewport for builder collapse sanity
- Preview:
  - PR Vercel preview URL for the implementation branch
  - browsers/devices:
    - Desktop Safari
    - Desktop Chrome
- Required manual checks:
  - builder opens existing saved session with calm default hierarchy,
  - Poolside Note popup/preview reflects selected focuses,
  - Safari print preview and saved PDF preserve intended compact scale,
  - color mode and ink-saver mode are both legible and intentional.

## Constraints

- Preserve canonical workout identity and save semantics.
- Do not require runtime use of the PSD source file; commit and serve only the derived print asset.
- Do not add new dependencies for logo conversion, print styling, or collapse state.
- Keep the visual language aligned with the existing My Library builder surfaces while clearly reducing overload.
- Do not expose more private training-context detail than the user explicitly chooses to print.
- Keep the standard full-session PDF flow truthful and intact while refining the Poolside Note variant.

## 10/10 Quality Bar

- Existing-session editing should feel immediately calmer:
  - the workout itself is visible first,
  - the metadata form is available but not dominant,
  - secondary export/support panels do not compete with the main editing task.
- Poolside Note should feel like a deliberate handoff artifact, not a browser print accident:
  - compact scale,
  - clear brand mark,
  - clean spacing,
  - no implementation-instruction footer copy.
- Required UI states for changed surfaces:
  - `loading` existing workout
  - `empty` open-focus selection
  - `error` print-window open failure or missing asset
  - `offline`/network fallback if a route-backed export path is unavailable
  - `retry` for blocked/failed print opening
- Accessibility:
  - collapse toggle exposes expanded/collapsed state,
  - focus choices use proper checkbox/radio semantics as appropriate,
  - print-style mode is clearly labeled,
  - keyboard navigation works in builder and pre-print controls,
  - contrast remains sufficient in both color and ink-saver modes.
- Performance:
  - opening the Poolside Note should feel immediate after workout load,
  - no material route payload regression on `/my-library/workouts/[workoutId]`.
- Business logic:
  - explicit focus selection only,
  - no silent fallback from one focus to another,
  - no canonical data mutation from print-only choices,
  - no broken or stretched output when browser background printing is disabled.

## Help/Guide And Operator Training Contract

- Required if visible user workflow labels or export/print recovery steps change in a way that affects support language:
  - update the relevant private My Library help/runbook copy in the same PR,
  - or include explicit `N/A` rationale if no dedicated help surface needs to change.
- `AdminHelpCenter` remains `N/A` unless this slice also changes a shared admin/operator help surface.

## Security, Privacy, and Compliance

- Workout builder and poolside print flows remain authenticated and owner-scoped.
- Any print-selection input must be validated against the authenticated user’s available focus data.
- Poolside output must not include unrelated training notes or hidden private data by default.
- No raw `.env` values, secrets, or cross-user data may appear in print markup, asset paths, or error handling.

## Observability and KPI Contract

- Existing export/open-print analytics remain sufficient if they stay truthful after the new options are added.
- Add or preserve truthful event context for:
  - opening Poolside Note,
  - selected focus count,
  - selected print style mode,
  - metadata section collapsed/expanded interaction if existing builder events already support it.
- Success KPI for this slice:
  - a user can open an existing session and reach the workout itself immediately,
  - a user can predict what the printed Poolside Note will contain before opening the browser print dialog.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief path.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated builder/poolside slice.

## Checkpoint Log

- `2026-04-01 | planning | brief created from live review findings covering poolside print scaling, print-style controls, explicit focus selection, derived logo asset, and calmer existing-session builder hierarchy | next: decide exact UI shape for pre-print controls and the collapsed metadata surface before implementation starts`
- `2026-04-01 | in-progress | implementation started on feat/poolside-note-print-clarity-2026-04-01; mapped builder, export route, poolside HTML, and current test coverage before UI/print changes | next: implement collapsible metadata surface, explicit poolside options, and print-safe asset wiring`
- `2026-04-01 | in-progress | base head f0b4cdf; implemented compact poolside print layout, derived print-safe logo asset, focus/style pre-print controls, calmer collapsible workout metadata, and matching unit/e2e coverage; full npm run verify:pre-pr passed locally | next: commit, push, and open PR for manual visual QA + review`
