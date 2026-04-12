# Task Brief: Swim Session Builder Support Tools, Pool Size, And Poolside Focus Polish (10/10)

## Metadata

- `id`: `2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-08`
- `updated`: `2026-04-08`

## Goal

The saved swim-session builder feels calmer on first load, supports yard-pool authoring without changing the meter-canonical workout contract, and keeps the Poolside Note focus selector compact and readable.

## Why This Brief Exists

- Live owner review on `2026-04-08` surfaced two remaining open `Swim Session Builder` notes after the earlier create-vs-edit and step-detail slices shipped.
- The remaining notes point to three still-open UX seams on `/my-library/workouts`:
  - support/export boxes still feel too visible even when collapsed,
  - pool-size authoring does not support yards like Garmin users expect,
  - the Poolside Note focus selector grows too much and repeats redundant `Primary focus` / `Optional focus` helper text.
- These are polish-level improvements on the saved session builder and should ship as one owner-led cleanup slice instead of reopening the broader Garmin roadmap.

## Dependencies And Boundaries

- Parent brief that remains authoritative for the broader saved-workout builder wave:
- `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Related already-shipped child briefs to preserve rather than reopen:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-builder-owner-note-3a29feae-step-detail-polish-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-field-parity-10-10.md`
- Core implementation surfaces in scope:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Locked product boundary for this slice:
  - `workouts.pool_length_m` and workout export/handoff stay meter-canonical,
  - this slice may add a builder-side `meters / yards` authoring preference, but it must not reopen export-step distance parity, Garmin delivery scope, or open-water contract work,
  - support/export tooling stays available, but the collapsed builder state should reveal less explanatory chrome by default.

## Admin Notes Triage Disposition

- `54f170f7-63dc-48f4-ae8e-3f784b04870a` `Swim Session Builder`
  - disposition: owned by this brief.
  - reason: the note asks for a truly collapsed support-tools surface and yard-pool authoring support on the saved swim-session builder.
- `66e90451-f008-4fcd-8e9d-810f2b1ef740` `Swim Session Builder - Poolside Note`
  - disposition: owned by this brief.
  - reason: the note asks to remove redundant focus helper text and keep the focus picker visually contained instead of letting the box grow indefinitely.
- `3a29feae-c00d-4088-b72f-c265f8253ca2` `Swim Session Builder`
  - disposition: already shipped outside this brief.
  - reason: the step-detail polish slice merged on `main` earlier and should only be marked done in admin notes, not reopened here.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                 | Evidence                              |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Product goals and IA                          | `target`     | The saved swim-session route stays focused on editing the session first, with support tooling and Poolside Note choices reading as secondary polish rather than primary work.  | manual QA + targeted tests            |
| UX flow clarity                               | `target`     | Support/export tools feel genuinely collapsed on first load, pool-size unit choice is obvious, and the Poolside Note focus list stays scannable without redundant copy.        | manual QA + unit/e2e                  |
| Visual design quality                         | `target`     | The builder becomes calmer by reducing persistent copy blocks and containing the focus selector without introducing cramped or visually inconsistent controls.                 | screenshot review + manual QA         |
| Business logic correctness and data integrity | `target`     | Yard entry converts deterministically into the existing meter-canonical workout save contract with no ambiguous or lossy builder-save behavior.                                | unit tests + code review              |
| Admin editor ergonomics                       | `target`     | The owner can set common yard-pool sizes, inspect support outputs on demand, and manage open Poolside Note focuses without the builder feeling noisy or oversized.             | timed manual QA + targeted tests      |
| Accessibility (a11y)                          | `supporting` | Supporting only: new unit toggles, condensed support disclosure, and focus list scroll area must remain keyboard reachable with explicit labels and stable semantics.          | code review + targeted tests          |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the builder route should not add material client/runtime cost for the new local unit preference or list containment polish.                                   | build/typecheck + review              |
| Data placement and sync boundaries            | `target`     | The brief explicitly keeps `pool_length_m` meter-canonical while any unit preference is UI-local only and must not change export/handoff truth.                                | brief contract + code review          |
| Caching and invalidation strategy             | `supporting` | Supporting only: the slice keeps existing workout refresh/save invalidation behavior unchanged and adds no new server cache boundary.                                          | integration review                    |
| Reliability and failure handling              | `target`     | Invalid custom pool-size input still blocks save deterministically and the builder never silently rewrites support/export state when the user only changes the display unit.   | unit tests + existing route behavior  |
| Security and authz                            | `supporting` | Supporting only: the slice stays inside authenticated owner-scoped builder surfaces and does not widen any protected mutation surface.                                         | existing auth boundaries              |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes authenticated owner-side builder presentation only and introduces no new personal-data collection, sharing, or retention behavior.               | explicit scope rationale              |
| Content governance                            | `supporting` | Supporting only: support/export copy and pool-size wording must remain truthful to the meter-canonical persistence model and existing Garmin-readiness language.               | copy review                           |
| Admin workflow and editability                | `target`     | High-frequency saved-session editing remains calm: support tools stay tucked away until requested, yard-pool entry is fast, and the focus picker stays manageable.             | manual QA + targeted tests            |
| SEO and crawlability                          | `N/A`        | N/A because this work changes authenticated My Library builder surfaces with no public crawl or metadata contract.                                                             | explicit scope rationale              |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public route, metadata, or AI-facing document structure.                                                                                      | explicit scope rationale              |
| Analytics and KPI observability               | `supporting` | Supporting only: the calmer support disclosure and yard toggle should remain inspectable in manual QA without requiring new analytics instrumentation in this slice.           | scope review                          |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, or revenue flow changes in this slice.                                                                                          | explicit scope rationale              |
| Incident response and support operations      | `N/A`        | N/A because the slice keeps the same authenticated builder actions and export surfaces, with no new operational alert/runbook branch beyond existing builder support guidance. | explicit scope rationale              |
| Finance and reporting operations              | `N/A`        | N/A because the slice changes no finance, payout, reconciliation, or commerce reporting path.                                                                                  | explicit scope rationale              |
| i18n operational readiness                    | `N/A`        | N/A because this slice only adjusts internal English builder labels/copy on authenticated surfaces and does not introduce new locale-coupled data shape.                       | explicit scope rationale              |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing workout-builder stack and local component state; do not add dependencies or a new persistence layer for builder display-unit preference.                    | dependency diff + architecture review |
| Testing and QA automation                     | `target`     | Coverage proves collapsed support-tools behavior, yard-pool conversion/save semantics, and the compact Poolside Note focus selector, with verification gates passing.          | unit/e2e coverage + `verify:pre-pr`   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the slice must not add repeated server writes or background fetches for local-only unit preference or focus-list containment.                                 | code review                           |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice remains rollback-safe because it changes no schema and keeps meter-canonical workout storage intact.                                                | rollback note + diff review           |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - persisted `workouts.pool_length_m`,
  - persisted canonical workout draft fields and steps,
  - existing Garmin/export/handoff outputs derived from the canonical meter-based draft.
- Local-only:
  - support-tools disclosure open/closed UI state,
  - Poolside Note focus-selection UI state,
  - builder display-unit preference for editing pool size (`m` vs `yd`) if implemented locally.
- Sync policy:
  - changing the pool-size display unit must not write to the server by itself,
  - saving a workout continues to persist only the normalized meter value already required by the canonical workout save contract,
  - support/export tools and Poolside Note preview must reflect the current draft on screen without implying that changing the display unit or opening disclosures saves anything.
- Retention and sensitivity:
  - no new sensitive data is introduced,
  - any unit preference remains a non-sensitive UI preference only.
- Cache/invalidation:
  - existing workout save/update refresh behavior remains authoritative,
  - no new server cache boundary is introduced by this slice.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only persisted swim-session identity.
- Human-readable identifiers:
  - support-panel labels, pool-size unit labels, and Poolside Note helper copy are mutable UI labels only.
- Mutability rules:
  - UI wording and disclosure presentation may change in place,
  - persisted workout identity and route structure do not change.
- Rename vs repurpose policy:
  - this slice polishes current builder controls only,
  - it does not repurpose support/export tools into a new workflow or create a yard-native workout entity.
- Compatibility contract:
  - saved workouts created before this slice continue to load under the same route and remain meter-canonical,
  - support/export outputs remain compatible with existing downstream meter-based logic.
- Observability and repair:
  - invalid pool-size input remains visible in the builder before save,
  - no silent rewrite of existing saved workout IDs or route params is allowed.

## Scope

- Make the calm builder support-tools disclosure feel truly collapsed on first load by removing persistent body copy from the closed state while keeping the same optional export/handoff actions behind the disclosure.
- Add builder-side pool-size authoring support for yards on pool workouts while keeping canonical workout save/export data meter-based.
- Remove redundant `Primary focus` / `Optional focus` helper text from the Poolside Note focus selector and keep the list visually contained with internal scrolling when it grows.
- Update targeted unit/e2e coverage and the brief checkpoint log.

## Out Of Scope

- Any new Garmin delivery slice or partner API work.
- Open-water contract work.
- Reworking step distances, workout totals, or export payloads to become yard-native.
- Schema changes or a new persisted workout-unit field.
- Reopening already-shipped step-detail changes from note `3a29feae`.

## Acceptance Criteria

1. The saved swim-session builder support-tools surface shows as a compact disclosure header by default, with the detailed support cards revealed only after explicit expansion.
2. Pool workouts can be authored in either meters or yards from the builder pool-size control, while save/export/handoff continue to use the existing meter-canonical workout contract.
3. Invalid custom pool-size input still disables save with deterministic inline feedback.
4. The Poolside Note focus selector no longer shows the per-item `Primary focus` / `Optional focus` helper text.
5. The Poolside Note focus selector keeps a contained scrollable area instead of expanding indefinitely when many open focuses exist.
6. Existing support/export actions (`PDF`, `Poolside Note`, `Garmin-ready JSON`, `Workout handoff`) still work after the disclosure polish.
7. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts`
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the slice narrow and owner-led.
- Do not reopen the parked Garmin follow-up map.
- Keep the canonical workout contract truthful: meters remain the persisted/exported unit.
- Do not add a new dependency or a schema migration for unit selection.

## 10/10 Quality Bar

- The builder should feel calmer before the owner opens any support tooling.
- A Garmin-familiar swimmer should be able to set a yard pool without mental conversion math.
- The Poolside Note selector should stay compact and legible even when many open focuses exist.
- Save-state, export-state, and Garmin-readiness truthfulness must remain explicit and deterministic.
- Keyboard and touch interactions must remain intact for the new disclosure and unit controls.

## Help/Guide Impact

- `N/A` for this slice because it changes only authenticated builder presentation details, keeps the existing support/export action names, and does not change the documented recovery flow or public Help/Guide content contract.

## Checkpoint Log

- `2026-04-08 | planning + implementation start | created owner-led child brief for the two remaining open Swim Session Builder notes (`54f170f7`, `66e90451`) after confirming the earlier note `3a29feae` was already shipped; scoped this slice to calmer support disclosure, yard-pool authoring over the existing meter-canonical contract, and compact Poolside Note focus selection | next: implement the builder polish, update targeted coverage, mark shipped note 3a29 done in admin notes, and run verification before PR handoff`
- `2026-04-08 | implementation + validation complete on branch | implemented truly collapsed support-tools copy, yard-pool authoring with meter-canonical save conversion, and compact Poolside Note focus selection; marked shipped admin note `3a29feae`done in production while leaving the two newly implemented notes open until merge; passed`npm run lint:briefs:all`, targeted `vitest`, targeted `playwright`, `npm run typecheck`, and full `npm run verify:pre-pr`in clean worktree`/private/tmp/freeswimming-swim-session-builder-owner-notes-2026-04-08`from base commit`bef9edc` | next: commit, push, open PR, and summarize before merge`
- `2026-04-08 | merged + production note closeout | PR #390 merged to \`main\` as squash commit \`4b257b5\`; local \`npm run verify:pre-merge\` passed on commit \`6c9d8a2\`; production admin notes \`54f170f7\`, \`66e90451\`, and previously shipped \`3a29feae\` are all confirmed \`is_done = true\` after merge | next: delete temporary branches/worktrees and keep future builder polish in new owner-led briefs`
