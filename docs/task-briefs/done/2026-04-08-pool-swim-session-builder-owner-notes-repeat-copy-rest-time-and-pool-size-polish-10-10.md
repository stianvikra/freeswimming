# Task Brief: Pool Swim Session Builder Owner Notes Repeat, Copy, Rest-Time, And Pool-Size Polish (10/10)

## Metadata

- `id`: `2026-04-08-pool-swim-session-builder-owner-notes-repeat-copy-rest-time-and-pool-size-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-08`
- `updated`: `2026-04-08`

## Goal

The saved pool swim-session builder removes the latest owner-noted filler copy and layout friction, defaults new repeat blocks to the preferred final-rest behavior, and upgrades pool rest-time and pool-size authoring without changing the canonical workout contract.

## Why This Brief Exists

- Production owner review on `2026-04-08` surfaced a new cluster of six still-open admin notes on the same saved-session builder route:
  - `/my-library/workouts/8082725f-26de-4efe-876f-9e84148bba45`
- The notes are tightly related and should ship as one bounded owner-led polish slice instead of reopening the broader Garmin roadmap:
  - repeat-block default and header density,
  - placeholder/helper-copy cleanup,
  - rest-time entry UX,
  - support-panel copy cleanup,
  - pool-size selected-state copy and wide-screen layout.
- This is explicitly not a new Garmin follow-up slice. It is owner-led builder polish on top of the pool builder already shipped on `main`.

## Dependencies And Boundaries

- Parent builder live-review brief that remains authoritative for the broader builder wave:
- `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Recently shipped builder lineage that this slice must preserve rather than reopen:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-metadata-panel-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-builder-owner-note-3a29feae-step-detail-polish-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md`
- Parked follow-up that must remain parked in this slice:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-07-pool-swim-builder-garmin-follow-up-map-10-10.md`
- Primary implementation surfaces likely touched:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Boundary decisions for this brief:
  - no new Garmin slice,
  - no open-water contract work,
  - no schema migration,
  - no new Help/Guide surface invention,
  - no change to canonical workout identity or saved workout route contract,
  - no silent rewrite of existing saved repeat-ending-rest values; changed defaults apply only where new repeat scaffolds are created.

## Admin Notes Triage Disposition

Production open queue reviewed directly against `admin_notes` on `2026-04-08`:

- `6a275fc9-191a-486e-9e30-a4f81a8e4479` `Swim session builder`
  - disposition: owned by this brief.
  - reason: asks for `Skip last rest interval` as the default for new repeat scaffolds and removal of the generated repeat-header summary text.
- `98828e5e-6f3b-4997-aee9-843f836db38a` `Swim session builder - title - placeholder removal`
  - disposition: owned by this brief.
  - reason: asks to remove leftover placeholder text in repeat step notes and the top session title field.
- `86be7b06-f7e0-485a-85e0-e9af628abff1` `Swim session builder`
  - disposition: owned by this brief.
  - reason: asks to remove non-essential support/output copy about open focuses and browser print backgrounds.
- `76a1a458-cbf1-4d52-8cf8-57e41e68c2a8` `Swim session builder`
  - disposition: owned by this brief.
  - reason: asks to simplify `Step note` helper text and remove remaining repeat/recovery filler copy that still reads like scaffolding.
- `09e15b9c-0f34-4112-8f3e-d2290607bfd8` `Swim session builder - Rest time`
  - disposition: owned by this brief.
  - reason: asks for `MM:SS` rest-time entry with better interaction design.
- `25286e85-3082-45d0-abf2-1aef88be05df` `Swim session builder`
  - disposition: owned by this brief.
  - reason: asks to remove noisy preset-selected copy and align exact pool-size authoring beside presets on larger screens.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                             | Evidence                               |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| Product goals and IA                          | `target`     | The saved pool builder reads as one coherent authoring surface, with repeat defaults, note labels, pool-size controls, and support copy matching the owner's real manual workflow.         | manual QA + code review + targeted e2e |
| UX flow clarity                               | `target`     | New repeat scaffolds start in the preferred final-rest mode, rest-time entry is clock-like and obvious, and visible copy no longer competes with the actual authoring controls.            | manual QA + targeted e2e               |
| Visual design quality                         | `target`     | Repeat cards, pool-size controls, and support panels feel calmer after filler-copy removal and better wide-screen alignment.                                                               | screenshot review + manual QA          |
| Business logic correctness and data integrity | `target`     | Canonical `repeatEndingRestMode`, `timeMin`, and `pool_length_m` persistence stay deterministic while UI defaults, labels, and editor formatting change.                                   | unit tests + code review               |
| Admin editor ergonomics                       | `target`     | The owner can build a pool set faster because default repeat behavior, rest-time input, and pool-size editing match the intended mental model with less explanatory clutter.               | timed manual QA + targeted tests       |
| Accessibility (a11y)                          | `supporting` | Supporting only: repeat-mode selects, rest-time inputs, placeholder removal, and wide-screen layout changes must remain keyboard- and screen-reader-friendly.                              | code review + targeted tests           |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the builder route should not add meaningful client/runtime cost for clock-style rest entry or pool-size layout polish.                                                    | typecheck + implementation review      |
| Data placement and sync boundaries            | `target`     | The brief explicitly keeps repeat ending-rest mode, normalized duration values, and meter-based pool length in the existing canonical save contract while treating copy/layout as UI-only. | brief contract + code review           |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing workout save/invalidation behavior remains authoritative and no second draft or cache layer is introduced.                                                       | integration review                     |
| Reliability and failure handling              | `target`     | Invalid or partial rest-time entry still fails clearly before save, and default repeat-mode changes do not corrupt or silently rewrite existing saved repeat groups.                       | unit/e2e coverage + manual QA          |
| Security and authz                            | `supporting` | Supporting only: this slice stays inside the existing authenticated owner-only builder surface and does not widen any protected mutation surface.                                          | existing auth boundaries               |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes only owner-facing builder copy, layout, and input ergonomics on authenticated routes; it does not change data-sharing or retention policy.                   | explicit scope rationale               |
| Content governance                            | `supporting` | Supporting only: simplified copy must stay truthful to the shipped pool builder contract and not imply undocumented Garmin/export behavior.                                                | copy review + brief alignment          |
| Admin workflow and editability                | `target`     | High-frequency pool session editing stays calm and fast, with less filler text and more truthful defaults on the most repeated authoring actions.                                          | manual QA + targeted tests             |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/workouts/[workoutId]` is an authenticated owner surface with no public crawl or metadata contract.                                                                | explicit scope rationale               |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, metadata, or AI-facing document surface.                                                                                                   | explicit scope rationale               |
| Analytics and KPI observability               | `supporting` | Supporting only: the changed repeat default and input UX should remain inspectable through existing manual QA and route behavior without requiring new analytics in this slice.            | scope review                           |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, pricing, entitlement, or commercial workflow changes.                                                                                                              | explicit scope rationale               |
| Incident response and support operations      | `N/A`        | N/A because no new operational runbook branch or support escalation flow is introduced; this is owner-facing builder polish only.                                                          | explicit scope rationale               |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, or reporting path changes in this slice.                                                                                                   | explicit scope rationale               |
| i18n operational readiness                    | `N/A`        | N/A because this slice adjusts internal English builder labels and input affordances only and does not change locale architecture.                                                         | explicit scope rationale               |
| Stack-fit and dependency discipline           | `target`     | Reuse the current workout-builder stack and canonical workout model; do not add dependencies or a second duration/pool-size persistence layer.                                             | dependency diff + architecture review  |
| Testing and QA automation                     | `target`     | Unit and e2e coverage protect repeat-ending-rest defaults, rest-time entry formatting, placeholder/helper-copy removal, and pool-size layout/copy changes before PR update.                | targeted tests + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice must not add repeated server writes, polling, or extra preview generation cost for UI-only formatting changes.                                                  | code review                            |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice remains rollback-safe because it changes no schema and keeps canonical workout persistence untouched.                                                           | diff review + rollback note            |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - the canonical saved workout draft payload,
  - `steps[].repeatEndingRestMode`,
  - `steps[].timeMin`,
  - `workouts.pool_length_m`,
  - existing export/handoff outputs derived from the canonical workout draft.
- Local-only:
  - placeholder text and helper-copy visibility,
  - repeat header presentation,
  - wide-screen layout arrangement for pool-size controls,
  - rest-time input presentation and parsing state before save.
- Sync policy:
  - changing visible copy or layout never writes on its own,
  - changing `Last rest interval` continues to write through the existing canonical draft field only when the user edits the repeat block,
  - new default `skip_last_rest` applies when the user creates a new repeat starter scaffold,
  - existing saved repeat groups preserve their stored ending-rest mode until the user changes them,
  - rest-time clock input must normalize into the same canonical numeric duration contract already used by workout save/export.
- Retention and sensitivity:
  - no new data class is introduced,
  - the slice only changes owner-facing builder presentation and local parsing ergonomics.
- Cache/invalidation:
  - existing workout save/update refresh behavior remains authoritative,
  - no second draft store or custom invalidation layer is introduced.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the canonical swim-session identity across builder, save, export, poolside note, and admin-note context.
- Human-readable identifiers:
  - repeat summary text, support-panel copy, placeholders, and field labels are mutable UI text only.
- Mutability rules:
  - UI labels and placeholders may change in place,
  - underlying canonical field names and saved route identity remain stable.
- Rename vs repurpose policy:
  - preferred path is to rename or remove presentation copy before changing the underlying workout schema,
  - the brief does not repurpose repeat groups or pool-size storage into a new model.
- Compatibility contract:
  - existing saved workouts remain valid after the slice,
  - any preexisting repeat group with `use_last_rest` must still render and save truthfully after the new starter default is introduced.
- Observability and repair:
  - malformed rest-time input or invalid normalized duration must fail before mutation,
  - targeted tests must cover the new repeat default and clock-input parsing so regressions surface before PR update.

## Scope

- Change the new pool repeat starter default so `Last rest interval` starts as `Skip last rest interval`.
- Remove the auto-generated repeat-header summary line if it is still shown as top-of-card filler on repeat blocks.
- Remove top-field placeholder text that reads like scaffolding:
  - repeat-step placeholder copy,
  - session-title placeholder copy if still present.
- Simplify `Step note` copy:
  - replace `Closest match to Garmin Add Step Note for this pool step.` with a calmer direct instruction,
  - remove repeat/recovery filler lines such as `Edit this into the exact repeat you want to hold.` and `Move the full repeat block from the header.` where they are still visible.
- Remove support-panel text that is not needed for repeated owner use:
  - open-focus count copy,
  - browser print-background instruction copy,
  - any equivalent residual line identified during implementation on the same route.
- Replace minute-only rest-time entry for pool rest steps with an `MM:SS`-style editor that still saves through the current canonical duration contract.
- Remove noisy `Preset selected` copy from pool-size presets.
- On layouts with enough horizontal space, align exact pool-size label/input and supported-range text beside the preset buttons instead of stacking them below.

## Out Of Scope

- New Garmin follow-up work beyond the shipped repeat-rest contract.
- Open-water builder contracts or routing.
- New user Help/Guide patterns or contextual help icons.
- Poolside Note content redesign beyond removing the specific support copy called out by the notes.
- Schema migrations, export adapter rewrites, or a new duration storage model.
- Reopening earlier shipped field-removal decisions unless required by the six notes above.

## Acceptance Criteria

1. Creating a new repeat block in the pool builder defaults `Last rest interval` to `Skip last rest interval`.
2. Existing saved repeat groups keep their stored ending-rest mode and are not silently rewritten by the new starter default.
3. Repeat cards no longer show the owner-flagged auto-generated top summary text if it remains visible today.
4. Session title, repeat step note, and repeat/recovery helper copy no longer use scaffolding-style placeholder text on the saved pool builder route.
5. `Step note` helper text reads like a plain instruction rather than a Garmin-translation caveat.
6. Pool rest-time entry supports `MM:SS` authoring with clear parsing and validation while preserving the existing canonical workout save/export contract.
7. Pool-size presets no longer show `Preset selected` filler copy, and the exact pool-size input sits beside the preset group on wide screens when space allows.
8. Support/export panel copy no longer includes the owner-flagged focus-count and print-background helper lines.
9. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - any additional unit coverage needed for repeat-ending-rest defaults or rest-time parsing
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Production review source:
  - `https://freeswimming.org/my-library/workouts/8082725f-26de-4efe-876f-9e84148bba45`
- Local iteration:
  - `http://127.0.0.1:3000/my-library/workouts/<workoutId>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the slice tight and owner-led.
- Prefer copy removal or calmer direct wording over adding more helper text.
- Preserve the shipped repeat-rest contract; this slice may change the starter default and surface density, but it must not break the explicit `use last` vs `skip last` model.
- Preserve the canonical `timeMin`/duration contract while improving rest-time entry UX.
- Preserve meter-canonical pool-length storage while changing only layout and selected-state copy.

## 10/10 Quality Bar

- The pool builder should feel cleaner because the UI says less, not because key concepts become hidden or ambiguous.
- Repeat creation should match the owner's preferred default without compromising truthfulness for existing saved workouts.
- Rest-time entry should feel like real swim-set authoring, not like a generic decimal-minutes form.
- Required states stay clear:
  - loading: existing builder load state remains truthful,
  - empty: no-session state remains truthful,
  - error: invalid rest-time input and save failures explain what is wrong,
  - retry: save-again flow remains the normal recovery path.

## Help/Guide And Operator Training Contract

- `N/A` for this slice right now because:
  - there is still no dedicated user-facing builder Help surface to update,
  - the slice is owner-facing builder polish only,
  - automation coverage on `tests/e2e/my-library-workout-builder.spec.ts` remains the contract guard for the changed workflow until a real builder Help/Guide surface exists.

## Checkpoint Log

- `2026-04-08 | done | PR #392 merged to main as squash commit f39fe35e2e1d29f8e92288ded69e6f21b7090fae after local npm run verify:pre-merge and required CI both passed; slice is now shipped and the six production admin notes can be marked done | next: close the shipped admin notes and remove the temporary implementation branch/worktree`
- `2026-04-08 | in-progress | implemented the six-note polish slice in WorkoutEditor and supporting tests: new repeat starters default to skip-last-rest, repeat/title/support filler copy is removed or simplified, pool rest steps use minute+second editing while preserving canonical timeMin, and pool-size/poolside panels are calmer on wide screens; validation green: npm run lint:briefs:all, npm run typecheck, npx vitest run tests/unit/workout-builder-hub.test.tsx, and full npm run verify:pre-pr (96 passed, 318 skipped) after freeing temp Playwright artifacts and running with a local env copy that omits STRIPE_PRICE_ID_POOLSIDE_GUIDE to avoid an unrelated local commerce dependency | next: commit, push, and open the PR in Safari`
- `2026-04-08 | in-progress | moved the brief into active implementation and began the builder pass in a clean worktree; scope locked to the six production owner notes covering repeat default/header cleanup, title and step-note copy cleanup, MM:SS rest entry, poolside support copy removal, and pool-size layout/copy polish | next: finish the WorkoutEditor and test patches, run targeted validation, then verify:pre-pr before PR handoff`
- `2026-04-08 | planning | reviewed the live production admin-notes queue directly and grouped six still-open notes on /my-library/workouts/8082725f-26de-4efe-876f-9e84148bba45 into one owner-led polish slice covering repeat default/copy cleanup, MM:SS rest-time entry, and pool-size selected-state/layout cleanup | next: implement the slice in one bounded pass, validate repeat default persistence and rest-time parsing with targeted unit/e2e coverage, then run verify:pre-pr before PR handoff`
