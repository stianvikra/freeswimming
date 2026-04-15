# Task Brief: Poolside Note Layout And Preview Favicon Polish (10/10)

## Metadata

- `id`: `2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the poolside note preview feel production-finished by aligning portrait/landscape hierarchy with the agreed composition and restoring branded tab identity through the proper favicon/app icons.

## Why This Brief Exists

- The poolside note print surface is now close, but two clarity gaps remain:
  - the preview tab can open without the FreeSwimming favicon,
  - portrait and landscape still need the final agreed placement rules locked into the HTML/CSS.
- The owner-approved layout direction is explicit:
  - landscape: steps left, focus right, total visually attached to the session rather than the focus block,
  - portrait: steps before focus, with focus moved to the bottom and a slightly stronger but still secondary `Learn. Drill. Swim.` lockup.
- This is still a presentation refinement slice:
  - no workout-model change,
  - no Garmin/export semantic change,
  - no new printable controls or sharing workflow.

## Dependencies And Boundaries

- Parent builder/poolside lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Relevant delivered poolside lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no change to canonical workout draft structure,
  - no change to poolside line derivation semantics beyond already-shipped copy rules,
  - no public route metadata work outside the poolside preview HTML document.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Portrait and landscape poolside notes must present the session in the agreed reading order, with no visual confusion about what is primary versus supporting information. | brief review + generated HTML QA          | `5/5`                   |
| UX flow clarity                               | `target`     | Landscape reads `title -> total -> steps` first, then `focus`; portrait reads `title -> total/swimmer -> steps -> focus`.                                                 | unit/e2e + screenshot review              | `5/5`                   |
| Visual design quality                         | `target`     | Poolside note output feels balanced, branded, and print-ready in both portrait and landscape, with no missing tab icon or obviously misplaced support cards.              | screenshot review + popup QA              | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: the layout polish must not alter step derivation or poolside output truth.                                                                               | code review + existing tests              | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the private poolside preview/print surface, not an admin/editor workflow.                                                                  | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | The preview document keeps sensible heading order, semantic list structure, and usable brand/icon metadata without harming readability.                                   | code review + targeted QA                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: CSS/head additions stay lightweight and do not materially change preview rendering cost.                                                                 | `npm run build` + targeted review         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Poolside note composition and favicon links remain presentation-only; no server data ownership or sync contract changes are introduced.                                   | brief contract + implementation diff      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new invalidation or persistence behavior is introduced because the popup still renders from the current local/canonical draft snapshot.               | code review                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Poolside preview tabs continue to open truthfully with the correct content, title, and now icon metadata across portrait and landscape.                                   | unit/e2e + manual QA                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: owner-only preview scope remains unchanged.                                                                                                              | route/path review                         | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this private print-preview polish changes no personal-data exposure model.                                                                                    | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | Poolside brand placement, focus placement, and tab identity must match the agreed product language and remain consistent with the FreeSwimming brand system.              | code review + generated HTML assertions   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow, moderation flow, or publish model changes here.                                                                                   | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the authenticated poolside preview popup is not a public crawl target.                                                                                        | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route metadata or AI-discoverable public content.                                                                                | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no new analytics or tracking contract is needed for this preview polish.                                                                                      | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no commerce, entitlement, or billing behavior changes here.                                                                                                   | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice affects only private preview composition and does not change support operations or incident tooling.                                               | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, or reporting path is touched.                                                                                                             | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts private English brand/layout presentation only and does not alter localization architecture.                                               | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing poolside HTML/CSS generation and brand assets; add no new dependencies or a second preview pipeline.                                                       | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage must verify favicon/head metadata plus the agreed portrait/landscape content ordering and popup trust contract.                                         | updated tests + `verify:pre-pr` evidence  | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because the slice adds no background cost or persistent storage.                                                                                                      | explicit scope rationale                  | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback stays easy because this is preview HTML/CSS/head polish with no schema or API change.                                                           | diff review + `verify:pre-merge` evidence | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - workout title,
  - swimmer name,
  - focus selections already provided to the preview model,
  - step line items already derived from the draft.
- Local-only data:
  - portrait/landscape presentation,
  - print-style choice,
  - favicon/icon head markup in the popup document.
- Sync policy:
  - unchanged; the popup continues to reflect the current draft snapshot passed into HTML generation.
- Retention and sensitivity:
  - no new persistence,
  - no new sensitive data.
- Cache/invalidation:
  - unchanged; save/delete behavior and current preview generation remain authoritative.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the canonical identity across builder, preview, and export.
- Human-readable identifiers:
  - `Learn. Drill. Swim.`, `Total`, `Swimmer`, and focus labels are mutable presentation strings only.
- Mutability rules:
  - layout position and visible brand emphasis may change in place,
  - file names and preview titles remain compatible with current popup handling.
- Rename vs repurpose policy:
  - this brief changes placement and presentation only; it does not define a new poolside product or route identity.
- Compatibility contract:
  - existing poolside popup flows and print/save behavior must continue to work without user reconfiguration.
- Observability and repair:
  - unit/e2e assertions must catch missing favicon metadata or misplaced content ordering before merge.

## Scope

- Add FreeSwimming favicon/app-icon links to the generated poolside preview HTML head so the popup tab shows branded identity.
- Keep the existing truthful title contract for the popup.
- Update poolside composition to match the agreed hierarchy:
  - landscape: steps left, focus right,
  - total remains attached to the session/title rather than the focus block,
  - swimmer and toned-down brand block remain support information.
- Update portrait composition so:
  - steps appear before focus,
  - focus moves to the bottom beneath steps,
  - the stacked `Learn. Drill. Swim.` lockup can be slightly stronger than before while still secondary to the title.
- Preserve the already-shipped rest wording contract in poolside note output.

## Out Of Scope

- Builder action-row/delete cleanup.
- Manual-pool step-card labels and summaries inside the builder.
- Standard workout PDF layout.
- New poolside controls, share links, or collaboration features.
- Workout model/export/Garmin semantics.

## Acceptance Criteria

1. Poolside preview tabs include FreeSwimming favicon/icon metadata in the generated HTML head.
2. The popup title remains truthful and branded.
3. In landscape, steps render before focus and occupy the primary reading column.
4. In portrait, focus renders after steps rather than above them.
5. `Learn. Drill. Swim.` can gain modest portrait emphasis without overtaking the title.
6. The layout polish does not reintroduce implementation/debug copy into the poolside output.
7. Existing rest wording and poolside data truth remain unchanged.
8. Relevant tests and `verify:pre-pr` / `verify:pre-merge` pass.

## Validation

- `npm run lint:briefs`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - Vercel preview URL from the PR checks.
- Recommended matrix:
  - iPhone Safari
  - Desktop Safari
  - Desktop Chrome

## Constraints

- Keep the poolside note premium and calm, not overloaded.
- Do not let brand treatment compete with the title or step content.
- Treat the entire slice as presentation-only and preserve popup stability.

## 10/10 Quality Bar

- Landscape must privilege execution readability over decorative symmetry.
- Portrait must put the actual workout before support/focus content.
- The preview tab must look like a real branded document, not a temporary blob page.
- Required states remain clear:
  - loading: unchanged popup-open behavior,
  - empty: focus section omitted cleanly when no focuses are selected,
  - error: existing popup-blocked messaging remains truthful,
  - retry: unchanged,
  - print/save: unchanged.

## Checkpoint Log

- `2026-04-15 | planning | created final poolside polish brief from owner-approved follow-up scope: restore favicon/tab identity and lock portrait/landscape placement around steps-first readability | next: patch generated poolside HTML/CSS, add assertions, and validate through targeted tests plus full pre-PR gate`
- `2026-04-15 | implementation | completed poolside preview favicon/head metadata plus portrait/landscape ordering polish so steps lead the reading flow; targeted unit/e2e plus full verify:pre-pr passed locally | next: commit, push, open/update PR, then run verify:pre-merge and monitor CI`
