# Task Brief: Pool Swim Builder Repeat Rest And Pool Size Clarity (10/10)

## Metadata

- `id`: `2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-09`
- `updated`: `2026-04-09`

## Goal

The manual pool builder reaches Garmin-level structural clarity or better for repeat/rest authoring and pool-size authoring while keeping the UI cleaner than Garmin and preserving Garmin-compatible canonical save/export semantics.

## Why This Brief Exists

- Owner review on `2026-04-09` locked a broader manual-pool polish slice than the earlier same-day repeat/time/CSS notes.
- Current `main` already ships:
  - pool-only `Use last rest interval` vs `Skip last rest interval`,
  - partial yard-aware pool-size authoring,
  - `MM:SS` time editing for manual pool steps,
  - CSS-seeded new manual pool drafts.
- The remaining owner-locked gaps are structural clarity and canonical truthfulness:
  - `Rest` steps still open a broad swim-step editor instead of a minimal rest editor,
  - repeat blocks still read as a generic contiguous block instead of explicitly reading as work plus between-rep recovery plus separate post-set rest,
  - external post-set rest after a repeat set is not preserved as its own reversible canonical concept,
  - current yard handling only covers pool-size entry and still leaves the rest of the workout meter-fixed in summaries, distance editing, totals, handoff, PDF, and Garmin-ready export,
  - `Unspecified` pool size remains visible even though the owner has now chosen exact-size entry instead,
  - open admin note `814ced4c-77e9-4b62-afaf-7ca8424d9ae0` must be absorbed as part of exact pool-size authoring ergonomics.

## Dependencies And Boundaries

- Parent brief:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Preserve already-shipped pool-builder work:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-06-pool-swim-builder-repeat-rest-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-compatible-device-execution-truthfulness-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-pool-swim-session-builder-owner-notes-repeat-copy-rest-time-and-pool-size-polish-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/CreateManualWorkoutButton.tsx`
  - `/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/manual.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/server.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-server.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
  - `/Users/stianvikra/freeswimming/supabase/migrations/`
- Boundaries:
  - no open-water contract work,
  - no Garmin API delivery,
  - no generator intake redesign,
  - no generic PDF/support-tools redesign beyond truthful output updates,
  - no unrelated session-overview cleanup.

## Product Direction Locked By This Brief

- Use Garmin expressions and pool-workout semantics unless the owner explicitly chooses otherwise.
- The chosen pool unit applies to the full manual pool workout, not only the pool-size field.
- Pool-size authoring must support `Meters` and `Yards`.
- Exact pool-size input must support whole values and decimal values with up to `2` decimals in the selected unit.
- Both `,` and `.` are valid exact pool-size input separators.
- `Unspecified` pool size is removed from the manual pool builder in this slice.
- Exact pool size becomes the only non-preset path for uncommon pool sizes.
- `Rest` remains a real canonical step, not UI-only metadata.
- Repeat recovery inside the repeat block remains a separate canonical step.
- Post-set rest after the repeat block remains a separate canonical step outside the repeat block.
- `Skip last rest interval` means:
  - internal recovery runs between reps only,
  - final internal recovery is skipped,
  - external post-set rest remains the after-set rest.
- `Use last rest interval` means:
  - internal recovery also runs after the last rep,
  - external post-set rest becomes redundant in active execution/export semantics.
- The external post-set rest value must still be preserved and restored if the owner switches back to `Skip last rest interval`.
- Preservation of that post-set rest value must survive `save + reload`.
- Legacy saved workouts that have no explicit pool unit must read through as `meters`.
- This slice may simplify and regroup controls, but must not flatten away Garmin-relevant repeat structure.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category | Mapping | Target Threshold (if `target`) | Evidence |
| --- | --- | --- | --- |
| Product goals and IA | `target` | The manual pool builder must expose one readable mental model for pool size, internal recovery, final skipped rest, and separate post-set rest with no hidden structural rule. | brief review + manual QA + unit/e2e |
| UX flow clarity | `target` | A swimmer can author common passive-rest sets and active-recovery sets without guessing which rest belongs inside the repeat and which rest belongs after the set. | manual QA + targeted e2e |
| Visual design quality | `target` | Wide-screen pool-size layout and repeat-rest presentation feel intentional, balanced, and calmer than the current generic editor. | screenshot review + manual QA |
| Business logic correctness and data integrity | `target` | Pool unit, exact pool size, internal recovery, external post-set rest, and final-rest behavior must save/reload/export deterministically with no double-rest or unit-corruption path. | unit tests + integration review |
| Admin editor ergonomics | `target` | Common passive-rest pool authoring is materially calmer, while active-recovery sets remain fully editable. | manual QA + targeted tests |
| Accessibility (a11y) | `supporting` | Supporting only: updated unit controls, exact inputs, and repeat/rest controls remain keyboard- and screen-reader-usable. | code review + targeted tests |
| Performance (CWV + payloads) | `supporting` | Supporting only: builder responsiveness does not regress materially. | diff review + verify |
| Data placement and sync boundaries | `target` | Pool unit and reversible post-set rest state must have one explicit canonical contract with compatibility behavior for legacy saves. | brief contract + code review |
| Caching and invalidation strategy | `supporting` | Supporting only: existing builder load/save refresh behavior remains authoritative. | integration review |
| Reliability and failure handling | `target` | Invalid pool-size values, unit mismatches, and contradictory repeat-rest states fail clearly before mutation. | negative-path tests + manual QA |
| Security and authz | `supporting` | Supporting only: scope remains inside existing authenticated owner workout boundaries. | existing boundaries |
| Privacy and compliance | `N/A` | N/A because this slice changes owner-scoped workout authoring semantics only and introduces no new sensitive-data path. | explicit scope rationale |
| Content governance | `target` | Garmin-like wording for pool size and repeat-rest structure stays centralized in one builder contract instead of drifting across helper copy. | brief review + code review |
| Admin workflow and editability | `target` | Repeated editing, save/reload, and unit switching remain trustworthy and reversible for the owner. | manual QA + targeted tests |
| SEO and crawlability | `N/A` | N/A because this is an authenticated My Library route with no public crawl contract. | explicit scope rationale |
| AI discoverability | `N/A` | N/A because this slice changes no public AI-facing metadata or route. | explicit scope rationale |
| Analytics and KPI observability | `supporting` | Supporting only: no new analytics required for this bounded editor-fidelity slice. | scope review |
| Commerce and revenue ops | `N/A` | N/A because no pricing, billing, entitlement, or checkout path changes. | explicit scope rationale |
| Incident response and support operations | `supporting` | Supporting only: if any help/runbook text already claims old pool-size or repeat-rest behavior, it must be updated in this same slice; otherwise closeout records explicit `N/A`. | doc review or explicit rationale |
| Finance and reporting operations | `N/A` | N/A because no finance or reporting behavior changes. | explicit scope rationale |
| i18n operational readiness | `N/A` | N/A because this slice improves current English builder wording only and introduces no new locale blocker. | explicit scope rationale |
| Stack-fit and dependency discipline | `target` | Reuse the existing workout stack; add no unnecessary dependency. | dependency diff + architecture review |
| Testing and QA automation | `target` | Unit and e2e coverage must protect unit persistence, exact-size parsing, rest minimal editor, repeat structure, post-set rest restoration, and last-rest semantics before PR update. | tests + `verify:pre-pr` |
| Scalability and cost efficiency | `supporting` | Supporting only: no extra persistence layer or runaway output complexity. | code review |
| DevOps and rollback readiness | `supporting` | Supporting only: if canonical unit persistence needs schema support, it ships as one explicit migration with rollback-visible scope. | migration review + diff review |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - saved workout row top-level pool metadata,
  - chosen pool unit for pool workouts,
  - canonical pool-size value,
  - canonical step order and repeat metadata,
  - explicit reversible post-set rest semantics.
- Local-only:
  - step card open/closed state,
  - temporary input focus state,
  - temporary exact-input editing strings before normalization,
  - unsaved local edits before save.
- Sync policy:
  - pool unit, pool size, internal repeat recovery, and external post-set rest all write through the canonical workout save path,
  - `Use last rest interval` excludes the associated post-set rest from active execution/output semantics while preserving its restore value canonically,
  - invalid exact-size and repeat-rest combinations fail before save with clear guidance.
- Retention and sensitivity:
  - no new sensitive data class,
  - no new retention policy.
- Cache/invalidation:
  - existing builder route loads and save refreshes remain authoritative,
  - no hidden secondary draft store is introduced.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id`
- Human-readable identifiers:
  - labels such as `Pool Size`, `Meters`, `Yards`, `Use last rest interval`, and `Skip last rest interval` are mutable UI labels, not identifiers.
- Mutability rules:
  - pool unit, pool size, repeat-rest choices, and step details remain editable in place.
- Compatibility contract:
  - legacy workouts with no explicit pool unit load as `meters`,
  - legacy repeat groups with no new separate post-set rest linkage remain readable and are upgraded through deterministic compatibility behavior in the editor/save path.
- Observability and repair:
  - invalid legacy payloads surface explicit load/save guidance instead of crashing the route,
  - tests must cover legacy meter-default read-through.

## Scope

- Add canonical pool-unit persistence for manual pool workouts.
- Apply the selected unit across the full manual pool workout experience:
  - pool-size controls,
  - step-distance editing,
  - totals,
  - summaries,
  - handoff text,
  - PDF/poolside output,
  - Garmin-ready export preview.
- Remove `Unspecified` from manual pool pool-size authoring.
- Redesign wide-screen `Pool Size` layout:
  - one heading,
  - left side for unit selector and common sizes,
  - right side for exact pool size.
- Keep exact pool-size entry with whole or decimal values and support both `,` and `.`.
- Make `Rest` steps open with a minimal editor that keeps only the fields needed for real rest authoring.
- Make repeat structure read clearly as:
  - work interval,
  - between-interval recovery,
  - separate post-set rest.
- Introduce explicit canonical linkage for separate post-set rest outside the repeat block.
- Ensure `Use last rest interval` suppresses that post-set rest in active execution/output while preserving restore values.
- Ensure `Skip last rest interval` restores the preserved post-set rest deterministically.
- Absorb admin note `814ced4c-77e9-4b62-afaf-7ca8424d9ae0` into the exact pool-size authoring ergonomics in the chosen design.

## Out Of Scope

- Open-water contract work.
- Garmin API delivery.
- AI generator redesign.
- Generic page-copy cleanup unrelated to repeat/rest or pool size.
- Bulk delete on the session overview.
- Support-tools redesign beyond truthful output updates required by the new canonical behavior.

## Acceptance Criteria

1. `Rest` steps open with a minimal editor that shows only `Step Type`, `Duration`, and `Notes`.
2. Internal repeat recovery remains a separate canonical step inside the repeat block.
3. Owners can switch internal recovery away from `Rest` and immediately get the full relevant editor back.
4. Post-set rest after a repeat is clearly distinct from internal repeat recovery in both UI and canonical behavior.
5. `Skip last rest interval` keeps internal recovery between reps only and keeps external post-set rest as the after-set rest.
6. `Use last rest interval` runs internal recovery after the last rep and excludes the linked post-set rest from active save/output/export semantics.
7. Switching between `Skip` and `Use` is deterministic, reversible, and survives save/reload without losing the preserved post-set rest value.
8. Manual pool `Pool Size` supports `Meters` and `Yards` and applies the chosen unit across the full pool workout.
9. Exact pool-size input supports whole and decimal values in the selected unit, with both `,` and `.` input accepted.
10. `Unspecified` no longer appears in manual pool pool-size authoring.
11. Wide-screen pool-size layout feels balanced and intentional and still works well on mobile.
12. Legacy workouts without explicit unit load safely as `meters`.
13. Relevant tests and `npm run verify:pre-pr` pass.

## Validation

- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workouts-server.test.ts`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed
- validation runs from repo root

## Manual QA Environments

- Local route:
  - `http://127.0.0.1:3000/my-library/workouts/<id>?entry=manual-pool`
- Production comparison route:
  - `https://freeswimming.org/my-library/workouts/e4b0eb22-20de-4880-a3a8-8494850caff2?entry=manual-pool`
- Preview route after PR push

## Constraints

- Keep the builder calmer than Garmin while preserving Garmin-relevant structure.
- Do not flatten away internal recovery and post-set rest into one generic hidden rule.
- Reuse the existing workout stack first; only add the minimum schema support needed for canonical pool-unit persistence.
- Keep new copy short and concrete.

## 10/10 Quality Bar

- Common passive-rest sets must be faster and calmer to author than today.
- Active-recovery sets must remain structurally explicit and fully editable.
- Yard-selected workouts must not silently fall back to meter-only summaries after save/reload.
- Required states stay truthful:
  - loading: existing builder load state remains accurate
  - empty: existing no-workout state remains accurate
  - error: invalid pool-size and invalid repeat-rest states are explicit
  - retry: existing save-again path remains valid

## Help/Guide And Operator Training Contract

- `N/A` unless current help/runbook text is found to claim the old `Unspecified` or old repeat-rest behavior; if so, update in the same slice.

## Checkpoint Log

- `2026-04-09 | in-progress | created clean worktree feat/pool-repeat-rest-pool-size-clarity-2026-04-09 from main, verified that current main already ships pool-only last-rest toggle, partial yard-aware pool-size entry, MM:SS time editing, and CSS-seeded manual pool defaults, and confirmed the remaining owner-locked gaps are minimal rest editing, separate reversible post-set rest, global workout-level unit truthfulness, and removal of Unspecified | next: patch canonical workout model, editor UI, outputs, and tests`
- `2026-04-09 | in-progress | completed manual pool repeat/rest and pool-size clarity slice, added canonical pool-unit persistence plus linked post-set rest semantics, updated manual builder/editor/output surfaces, added migration for pool units and decimal distances, and validated with targeted vitest, targeted playwright, npm run typecheck, npm run lint:briefs:all, and npm run verify:pre-pr | next: commit, push, open/update PR, watch CI, and run npm run verify:pre-merge before merge recommendation`
- `2026-04-09 | in-progress | committed implementation as bae5464 (Clarify pool repeat rest and unit semantics) and pushed branch feat/pool-repeat-rest-pool-size-clarity-2026-04-09 to origin | next: create/update PR, watch CI, and run npm run verify:pre-merge before merge recommendation`
- `2026-04-09 | in-progress | confirmed the Supabase account exposed to this repo currently has only one project (`freeswimming-org-prod` / `sazgjhgxvmxcyowovond`), linked the worktree to that project, and ran \`supabase db push --dry-run\`, which reported exactly one pending migration: \`20260409121500_workouts_pool_units_and_decimal_distances.sql\`; there is no discoverable preview/non-prod database target to validate against first | next: get explicit owner approval before any live prod \`supabase db push\`, then rerun preview/schema follow-up on the applied schema`
- `2026-04-09 | in-progress | applied \`20260409121500_workouts_pool_units_and_decimal_distances.sql\` to the linked project, reran schema-dependent workout flows, and found one real yard-roundtrip precision bug: whole-yard custom step distances and totals could reopen as \`333.01yd\`/\`1533.01yd\` because canonical meter normalization was still limited to 2 decimals; patched internal distance precision to 4 decimals, added a follow-up migration for top-level stored distances, and revalidated with targeted vitest plus desktop Chromium workout/generator/program Playwright coverage | next: run full verify on the follow-up precision patch, push it, apply the new distance-precision migration, and then recheck PR merge readiness`
