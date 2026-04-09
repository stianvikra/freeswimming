# Task Brief: Pool Builder Repeat Rest, Time, And CSS Profile Alignment (10/10)

## Metadata

- `id`: `2026-04-09-pool-builder-repeat-rest-time-and-css-profile-alignment-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-09`
- `updated`: `2026-04-09`

## Goal

The manual pool builder makes repeat-rest behavior explicit, uses `MM:SS` for time-based pool durations, and seeds new manual pool sessions from the swimmer's saved CSS pace instead of a hardcoded default.

## Why This Brief Exists

- Manual review on `2026-04-09` flagged three builder-quality issues on:
  - `https://freeswimming.org/my-library/workouts/e4b0eb22-20de-4880-a3a8-8494850caff2?entry=manual-pool`
- Findings confirmed in current `main`:
  - repeat blocks still store an internal rest step, but the UI does not make it obvious enough that `Skip last rest interval` only affects the final internal rest after the last round,
  - manual-pool `Time` still uses a single numeric minutes field instead of one `MM:SS` field,
  - new manual pool sessions still start with hardcoded `basePaceSecondsPer100m = 120` instead of the swimmer's saved athlete-profile CSS pace when available.
- This is owner-led pool-builder polish and must remain scoped to manual pool authoring.

## Dependencies And Boundaries

- Preserve recently shipped pool-builder work:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-pool-swim-session-builder-garmin-duration-and-terminology-polish-10-10.md`
- Primary surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/CreateManualWorkoutButton.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/manual.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Boundaries:
  - no open-water contract changes,
  - no DB schema changes,
  - no generator intake changes,
  - no new help center surface,
  - no merge in this slice until owner morning review.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category | Mapping | Target Threshold (if `target`) | Evidence |
| --- | --- | --- | --- |
| Product goals and IA | `target` | Repeat-block controls must describe internal rest vs final skipped rest truthfully, `Time` must match swimmer mental model as `MM:SS`, and new manual pool sessions must inherit saved CSS pace when available. | manual QA + code review + unit/e2e |
| UX flow clarity | `target` | A swimmer editing a repeat block can tell whether rest happens between rounds and after the last round without inferring from hidden logic. | manual QA + targeted e2e |
| Visual design quality | `target` | The repeat block remains calm and uncluttered while making internal-rest semantics clearer than before. | manual QA + screenshot review |
| Business logic correctness and data integrity | `target` | `skip_last_rest` must continue skipping only the final internal rest, `Time` `MM:SS` input must round-trip deterministically through `timeMin`, and CSS defaults must seed only new manual pool drafts without mutating saved workouts unexpectedly. | unit tests + code review |
| Admin editor ergonomics | `target` | Pool builders can author time-based steps and repeat blocks without translating hidden timing conventions or manual CSS defaults. | manual QA + targeted tests |
| Accessibility (a11y) | `supporting` | Supporting only: updated labels and `MM:SS` inputs remain keyboard- and screen-reader-usable. | code review + e2e |
| Performance (CWV + payloads) | `supporting` | Supporting only: no material route or client cost regression. | diff review |
| Data placement and sync boundaries | `target` | Athlete-profile CSS is used only as a creation-time default for new manual pool drafts; persisted workout draft pace remains workout-canonical afterward. | brief contract + code review |
| Caching and invalidation strategy | `supporting` | Supporting only: existing no-store builder/load behavior remains unchanged. | integration review |
| Reliability and failure handling | `target` | Builder continues to render valid repeat summaries and duration fields for existing drafts, including drafts created before this slice. | unit tests + manual QA |
| Security and authz | `supporting` | Supporting only: scope stays inside authenticated builder/profile routes. | existing boundaries |
| Privacy and compliance | `N/A` | N/A because this slice only reuses the authenticated owner's existing CSS metric as a local builder default and does not expand sharing or retention. | explicit scope rationale |
| Content governance | `supporting` | Supporting only: repeat/rest microcopy must be grounded in actual builder behavior. | code review |
| Admin workflow and editability | `target` | Manual pool editing must no longer imply that internal rest disappeared when `skip_last_rest` is selected. | manual QA + tests |
| SEO and crawlability | `N/A` | N/A because this is an authenticated route with no public indexing contract. | explicit scope rationale |
| AI discoverability | `N/A` | N/A because no public metadata or crawlable route changes. | explicit scope rationale |
| Analytics and KPI observability | `supporting` | Supporting only: no new analytics required for this bounded editor-fidelity slice. | scope review |
| Commerce and revenue ops | `N/A` | N/A because no billing or entitlement flow changes. | explicit scope rationale |
| Incident response and support operations | `N/A` | N/A because no support tooling or runbook contract changes are introduced in this builder-only slice. | explicit scope rationale |
| Finance and reporting operations | `N/A` | N/A because no finance or reconciliation path changes. | explicit scope rationale |
| i18n operational readiness | `N/A` | N/A because this slice only improves current English builder wording and input behavior. | explicit scope rationale |
| Stack-fit and dependency discipline | `target` | Reuse existing workout-builder and athlete-profile loaders; add no dependencies. | dependency diff + architecture review |
| Testing and QA automation | `target` | Unit and e2e coverage must prove repeat-rest clarity, `MM:SS` time entry, CSS prefill behavior, and `npm run verify:pre-pr` must pass before PR update. | tests + verify gate |
| Scalability and cost efficiency | `supporting` | Supporting only: CSS defaulting should add at most one already-owned server snapshot read on relevant routes. | code review |
| DevOps and rollback readiness | `supporting` | Supporting only: no schema migration; rollback remains a code-only revert. | diff review |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout draft payload,
  - `basePaceSecondsPer100m` and `usedCssPaceLabel` once a workout exists,
  - repeat-step order and `repeatEndingRestMode`,
  - `timeMin` for step durations.
- Local-only:
  - `MM:SS` editing string representation,
  - repeat-rest explanatory UI copy,
  - athlete-profile CSS value used to seed the POST body for new manual pool sessions.
- Sync policy:
  - new manual pool draft creation may prefill CSS pace from the current athlete profile snapshot,
  - once the workout exists, the workout draft remains canonical until explicitly edited/saved,
  - no background profile-to-workout resync is introduced in this slice.
- Retention and sensitivity:
  - no new data class,
  - existing owner-only CSS metric remains owner-only.
- Cache/invalidation:
  - existing dynamic route loads remain authoritative,
  - no extra cache layer is added.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains canonical.
- Human-readable identifiers:
  - labels and helper copy are mutable UI only.
- Mutability rules:
  - repeat-rest copy can change in place,
  - `timeMin` and pace fields retain current canonical schema.
- Rename vs repurpose policy:
  - improve UI wording before changing underlying repeat/rest structure,
  - do not repurpose saved workout identity or route params.
- Compatibility contract:
  - existing saved workouts must still open,
  - existing manual pool drafts with `timeMin` values continue to render and save correctly after `MM:SS` editor changes.
- Observability and repair:
  - targeted tests must cover prefilled CSS creation and repeat-rest summaries so regressions surface before merge.

## Scope

- Make repeat-block UI truthfully explain internal rest behavior when a repeat ends with a rest step.
- Keep `skip_last_rest` semantics unchanged in the data model unless deterministic defects are found.
- Change manual-pool `Time` editing from numeric minutes to a single `MM:SS` input.
- Seed new manual pool workouts from athlete-profile CSS pace when available.
- Preserve existing saved workout pace values after creation.
- Update unit/e2e coverage for:
  - repeat-rest clarity,
  - `Time` `MM:SS`,
  - CSS-based creation defaults.

## Out Of Scope

- Open-water builder work
- Garmin export schema changes
- AI generator behavior
- New help center or guide surface
- Live resync of existing saved workout pace from athlete profile after creation

## Acceptance Criteria

1. Selecting `Skip last rest interval` still leaves internal repeat rest between rounds intact.
2. Repeat-block UI makes it clear that only the final internal rest is skipped.
3. Manual-pool `Time` edits use one `MM:SS` field and persist correctly to canonical `timeMin`.
4. New manual pool sessions use athlete-profile CSS pace as `basePaceSecondsPer100m` and `usedCssPaceLabel` when a saved CSS metric exists.
5. Existing saved workouts keep their stored pace values unless the owner edits and saves them.
6. Targeted tests and `npm run verify:pre-pr` pass.

## Validation

- `npm run lint:briefs:all`
- `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts tests/unit/my-library-new-content-signal-route.test.ts`
- `npx playwright test tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run typecheck`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed
- validation runs from repo root

## Manual QA Environments

- Production comparison route:
  - `https://freeswimming.org/my-library/workouts/e4b0eb22-20de-4880-a3a8-8494850caff2?entry=manual-pool`
- Preview URL after PR push

## Constraints

- Use Garmin expressions already established in the manual pool builder.
- Do not claim the repeat/rest model changed if the fix is only UI clarity.
- Keep the builder calm; prefer short, precise clarifications over verbose helper copy.
- Do not merge in this slice without next-day owner go-ahead.

## 10/10 Quality Bar

- Repeat-block behavior must be at least Garmin-clear and easier to read than before.
- `Time` entry must feel precise and swimmer-native, not like a generic numeric field.
- CSS-based send-off and CSS-based target pace controls must reflect the swimmer's real saved CSS pace in newly created manual pool sessions.
- Required states remain truthful:
  - loading: existing builder load state remains accurate
  - empty: existing no-session state remains accurate
  - error: invalid time/CSS/save states remain clear
  - retry: existing save-again path remains recovery

## Help/Guide And Operator Training Contract

- `N/A` for this slice because no dedicated user-facing builder help surface exists yet, and the fix is scoped to direct UI truthfulness plus automated test coverage.

## Checkpoint Log

- `2026-04-09 | in-progress | created clean worktree feat/pool-builder-repeat-time-css-2026-04-09 from origin/main, confirmed repeat blocks still contain an internal rest step and that skip_last_rest only skips the final internal rest, confirmed manual-pool Time still uses plain numeric minutes, and confirmed new manual pool drafts still seed CSS/base pace from hardcoded 120 instead of athlete profile | next: patch builder UI, creation defaults, and tests`
- `2026-04-09 | in-progress | patched manual-pool builder so repeat blocks state clearly that skip_last_rest only skips the final internal rest, manual-pool Time edits use one MM:SS field that round-trips through canonical timeMin, and new manual pool sessions inherit athlete-profile CSS pace defaults at creation time | next: run full validation and prepare PR without merge`
- `2026-04-09 | in-progress | validation green: npm run lint:briefs:all, targeted vitest, targeted playwright, npm run typecheck, npm run verify:pre-pr, and npm run verify:pre-merge including private-gate regression | next: commit, push, and open PR for morning merge review`
- `2026-04-09 | done | PR #396 merged to main as 87f91b82cab53f06bcd7047dc3253f640374a002 after required CI passed and local npm run verify:pre-merge finished green; moved brief to done on closeout branch docs/pool-builder-repeat-time-css-closeout-2026-04-09 | next: none`
