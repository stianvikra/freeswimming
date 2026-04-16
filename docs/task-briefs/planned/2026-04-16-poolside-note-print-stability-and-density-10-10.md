# Task Brief: Poolside Note Print Stability And Density (10/10)

## Metadata

- `id`: `2026-04-16-poolside-note-print-stability-and-density-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-16`
- `updated`: `2026-04-16`

## Goal

Make the poolside note preview stay visible and printable in both portrait and landscape while tightening page density enough that normal sessions use A4 height more efficiently without hurting readability.

## Why This Brief Exists

- The current builder and poolside line semantics are materially better, but two owner-reported poolside problems remain unresolved:
  - the preview can appear briefly and then disappear, turn blank/black, or print an empty page,
  - and the lane-side composition still spends too much vertical space, especially once a session has many sets.
- Landscape also needs a firmer delivery contract:
  - the preview/layout may support landscape composition,
  - but the browser print dialog should not be force-switched into a different orientation unless there is a covered, stable, browser-safe path.
- Existing recent poolside work improved header truthfulness, favicon/tab identity, and line wording, but this next slice must reconcile the remaining operational gaps:
  - print-preview persistence,
  - nonblank print delivery,
  - tighter vertical rhythm,
  - and orientation behavior that stays predictable for the owner.

## Dependencies And Boundaries

- Parent builder/runtime brief:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Direct predecessor poolside briefs:
  - [2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md)
  - [2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10.md)
- Related unresolved poolside planning context:
  - [2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md)
  - [2026-04-15-poolside-note-composition-final-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md)
- Adjacent but explicitly separate work:
  - [2026-04-15-workout-pdf-visual-parity-with-poolside-note-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-15-workout-pdf-visual-parity-with-poolside-note-10-10.md)
- Primary implementation surfaces expected in scope:
  - [WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no workout-schema changes,
  - no Garmin/export payload changes,
  - no workout PDF visual-parity implementation in this slice,
  - no builder metadata-panel redesign,
  - no broader brand-system rewrite outside the poolside note print surface.

## Product Direction Locked By This Brief

1. The poolside note is a working lane-side sheet first, not a poster.
2. Print preview must stay visibly open and nonblank long enough to print reliably.
3. Portrait and landscape may use different layout geometry, but both must preserve the same visual system.
4. The poolside note should use A4 height more efficiently by reducing unnecessary vertical whitespace.
5. Density improvements must not make the sheet cramped or harm scan speed.
6. The browser print dialog orientation remains user/browser controlled unless a stable covered override is proven.
7. Layout selection inside the builder may change the preview composition, but it must not silently force a mismatched browser print setting.
8. Longer sessions should fit materially better before spilling onto additional pages.
9. In landscape, `Focus` and the workout body must be height-balanced rather than leaving one very short column and one very tall column.
10. Landscape should begin with the main workout flow on the left and `Focus` on the right, but workout lines may continue below `Focus` on the right side when needed to keep the composition balanced.
11. Until the content naturally needs to break, the bottom edge of the `Focus` block should sit roughly level with the bottom edge of the first visible workout block on the left.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Reliability and failure handling`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                                                   | Evidence                                           | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | Portrait and landscape poolside sheets must read as operational lane-side artifacts where title, total, focus, and step list remain easy to scan while using page height more efficiently. | screenshot review + print-preview QA + code review | `5/5`             |
| UX flow clarity                               | `target`     | Opening the poolside preview must yield one stable, titled, printable tab, and density changes must preserve immediate scan order without making the sheet feel cramped.                   | targeted e2e + browser QA                          | `5/5`             |
| Visual design quality                         | `target`     | Vertical rhythm must be tightened in both portrait and landscape, with no wasted blocks that push common workouts over one A4 page unnecessarily.                                          | screenshot review + print-preview QA               | `5/5`             |
| Business logic correctness and data integrity | `supporting` | Preview and print output must remain truthful to the current local draft, selected layout, selected style, and saved workout semantics.                                                    | unit + e2e + code review                           | `4/5`             |
| Admin editor ergonomics                       | `supporting` | Builder preview controls must remain understandable after any preview-delivery or density adjustments.                                                                                     | builder QA + targeted e2e                          | `4/5`             |
| Accessibility (a11y)                          | `supporting` | Denser layout must remain readable, high-contrast, and semantically grouped, with no illegible shrinkage or confusing print-title behavior.                                                | browser QA + screenshot review                     | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | Preview hardening and density polish must stay within the current HTML/CSS renderer and add no new heavy dependency.                                                                       | diff review + `npm run build` via verify lane      | `4/5`             |
| Data placement and sync boundaries            | `target`     | Preview-delivery and layout fixes must stay local-only and must not persist state just to make printing work.                                                                              | brief contract + code review                       | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Each preview open must reflect current draft and current print options immediately, with no stale cached blank or stale-layout artifact.                                                   | manual QA + targeted e2e                           | `4/5`             |
| Reliability and failure handling              | `target`     | In covered browser QA and regression tests, preview tabs must remain visible/nonblank and print-ready in both portrait and landscape.                                                      | targeted unit + targeted e2e + browser QA          | `5/5`             |
| Security and authz                            | `N/A`        | N/A because this slice changes no auth gate, entitlement, or authorization rule.                                                                                                           | explicit scope rationale                           | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes print delivery and composition only, not data handling or exposure rules.                                                                                    | explicit scope rationale                           | `N/A`             |
| Content governance                            | `supporting` | Density changes must not create a second divergent poolside content contract or duplicate shadow renderer.                                                                                 | code review                                        | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no admin publishing or mutable content workflow changes in this slice.                                                                                                         | explicit scope rationale                           | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because this remains an owner-only preview/print surface, not a public crawl target.                                                                                                   | explicit scope rationale                           | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public retrieval, metadata, or discoverability contract.                                                                                                  | explicit scope rationale                           | `N/A`             |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event or KPI contract change is required for this preview-density slice.                                                                                          | explicit scope rationale                           | `N/A`             |
| Commerce and revenue ops                      | `N/A`        | N/A because there is no billing, plan, or entitlement impact.                                                                                                                              | explicit scope rationale                           | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because the slice adds no new incident/runbook workflow; it reduces preview/print failure risk on an existing owner surface.                                                           | explicit scope rationale                           | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because the work has no reporting or finance-system effect.                                                                                                                            | explicit scope rationale                           | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because the slice preserves the current English poolside contract and adds no locale-routing behavior.                                                                                 | explicit scope rationale                           | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The fix must remain inside the existing Next.js/browser print-preview stack and poolside renderer, with no new dependency.                                                                 | diff review + validation evidence                  | `5/5`             |
| Testing and QA automation                     | `target`     | Coverage must lock stable preview delivery plus denser portrait/landscape rendering without weakening existing poolside/builder tests.                                                     | updated tests + verify gates                       | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The result should reduce future ad hoc print exceptions by clarifying orientation and density rules instead of layering more one-off fixes.                                                | code review + brief contract                       | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain a reversible code-only change with no schema migration or rollout choreography.                                                                                      | PR diff + rollback simplicity                      | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout content, focus selections, totals, and canonical step semantics remain the only persisted source of truth.
- Local data:
  - poolside layout selection, print style, popup state, and current draft preview inputs remain local-only.
- Sync policy:
  - opening or printing a preview must not save or mutate the workout,
  - preview delivery must rebuild from current local state each time,
  - no new local storage is introduced just to preserve preview rendering.
- Retention and sensitivity:
  - unchanged from the current owner-scoped workout preview contract.
- Cache/invalidation:
  - preview output must be regenerated from current draft + current options on each open so density or orientation state never lags behind the builder UI.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice changes no persisted entity identity, slug, or route-parameter contract.

## Scope

- Stabilize poolside preview delivery so the opened tab stays visible and printable.
- Verify the preview remains nonblank in portrait and landscape.
- Tighten poolside note vertical spacing in portrait and landscape so common sessions use page height more efficiently.
- Keep focus, total, swimmer identity, and work/rest scan order readable after density tightening.
- Rework landscape column flow so `Focus` and workout steps stay visually balanced:
  - workout starts on the left,
  - `Focus` starts on the right,
  - workout content may continue under `Focus` on the right when needed,
  - avoid layouts where one side is very short and the other side becomes unnecessarily tall.
- Define and honor the orientation contract:
  - builder layout selection affects poolside composition,
  - browser print-dialog orientation should remain user/browser controlled unless a stable covered override is proven.
- Add or update regression coverage for preview persistence, nonblank print markup, and denser layout expectations.

## Out Of Scope

- Workout PDF visual parity with poolside note.
- Garmin/export schema or payload changes.
- Builder action-row redesign.
- New print variants or new file formats.
- Public marketing/brand redesign beyond the private poolside print artifact.

## Acceptance Criteria

1. Opening the poolside note no longer results in a disappearing, blank, or black preview in covered browser QA.
2. The poolside preview remains visibly present long enough to print or save as PDF reliably.
3. Portrait and landscape previews both remain nonblank and use the correct selected layout styling.
4. Vertical spacing is reduced enough that common multi-set sessions fit materially better within A4 height.
5. Density changes do not make the poolside note cramped or harder to scan.
6. Focus, total, swimmer identity, and steps remain clearly readable in both portrait and landscape.
7. Landscape no longer leaves `Focus` isolated in one short column while the workout becomes a long single-sided column.
8. In landscape, workout content may continue under `Focus` on the right to keep the overall page height more balanced.
9. The app does not silently force the browser print dialog into a mismatched orientation unless that path is explicitly validated and stable.
10. Targeted unit and Playwright coverage pass.
11. `npm run verify:pre-pr` and `npm run verify:pre-merge` pass for the implementation PR.

## Validation

- targeted unit:
  - `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts`
- targeted e2e:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- browser QA:
  - local portrait poolside preview
  - local landscape poolside preview
  - local print dialog smoke check for both layouts
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local environment:
  - builder route with poolside preview enabled
  - desktop Chrome/Chromium
  - desktop Safari/WebKit-equivalent where feasible
- Preview environment:
  - PR Vercel preview after push
- Stress cases:
  - portrait with long focus text,
  - landscape with several sets,
  - longer session likely to challenge one-page A4 fit,
  - repeated open/print cycle to confirm preview persistence.

## Constraints

- Keep user-facing copy in English.
- Do not weaken current rest semantics or poolside truthfulness to gain density.
- Do not add a new dependency.
- Do not force browser print orientation unless there is explicit covered proof that it is stable across the supported browser QA matrix.

## 10/10 Quality Bar

- The owner should open the poolside note once and get a real stable print surface, not a transient disappearing tab.
- The note should feel operational and dense enough to use on deck without wasting half the page.
- Portrait and landscape should both look intentional, readable, and professional.
- Tighter spacing must improve page economy without turning the sheet cramped or brittle.
- The implementation must stay maintainable and easy to rollback.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes poolside print-preview behavior and composition only, not owner-facing help text or workflow terminology.

## Checkpoint Log

- `2026-04-16 | planning | created the dedicated next-step brief after builder closeout to isolate the remaining poolside note problems: disappearing/blank preview behavior, excessive vertical spacing, and orientation-contract clarity for print flows | next: implement the poolside preview hardening + density reconciliation in one scoped follow-up PR`
