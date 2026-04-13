# Task Brief: Swim Session Builder Residual Density, Starter Scaffold, And Library Cleanup (10/10)

## Metadata

- `id`: `2026-04-13-swim-session-builder-residual-density-starter-scaffold-and-library-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-13`
- `updated`: `2026-04-13`

## Goal

Finish the remaining high-value swim-session-builder seams by tightening read-card density, compacting pool-size authoring, replacing the fake-blank pool start with a Garmin-like scaffold, and removing leftover bulk-selection noise in saved sessions.

## Why This Brief Exists

- The recent swim-session-builder wave shipped the major structural work, but a few visible seams are still live:
  - collapsed step cards still waste vertical space because the `Edit` action sits below the summary instead of aligning with it,
  - the `Pool Size` exact input still reads too wide and too detached from the presets it belongs with,
  - creating a new manual pool session still starts from a single `100m` step instead of a realistic Garmin-like pool scaffold,
  - and `My Swim Sessions` bulk cleanup still repeats low-value checkbox text on every card.
- These are not new umbrella requirements:
  - they are residual builder ergonomics and scanability issues that should be closed before leaving the swim-session-builder track.
- This brief intentionally does **not** reopen:
  - private preview access,
  - global logo/desktop cleanup,
  - poolside-note full visual brand work,
  - drag-and-drop builder ordering,
  - or dryland/land-training planning.

## Dependencies And Boundaries

- Parent/lineage:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-12-swim-session-builder-brief-reconciliation-and-remaining-scope-clarity-10-10.md`
- Recent shipped child briefs this slice extends rather than duplicates:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-pool-size-rest-and-support-surface-polish-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md`
- Primary implementation surfaces in scope:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/CreateManualWorkoutButton.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/manual.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-server.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/create-manual-workout-button.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Locked product decisions for this slice:
  - exact pool-size input should be compact, left-aligned, and visually grouped with presets,
  - visible subgroup headings such as `Unit`, `Common sizes`, and `Exact size` stay removed,
  - new pool sessions should open with a Garmin-like scaffold that includes warmup, repeat work, internal repeat rest, post-set rest, cooldown, and default `0:30` rests,
  - saved-session bulk selection should not repeat `Select session` text on every card,
  - read-card action alignment should save vertical space without hurting accessibility.

## Product Direction Locked By This Brief

1. Read-mode and collapsed edit-mode step cards should prioritize scanability first, with actions aligned to the card header instead of stacked wastefully below it.
2. `Pool Size` should read as one compact inline authoring strip, not a wide split layout that sends the user across the card to type.
3. New manual pool sessions should start from a useful scaffold, not a fake-blank single-step placeholder.
4. Default scaffold rests should be `0:30`, including between top-level sections and inside repeat rounds.
5. Bulk cleanup in `My Swim Sessions` should keep checkbox behavior but remove redundant repeated selection copy.
6. Existing Garmin-compatible repeat/rest data semantics remain canonical and must not be flattened away.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Builder read/edit surfaces and new-session entry should clearly guide common pool authoring without fake-blank starts or noisy action layout.                  | screenshot review + manual QA          | `5`                     |
| UX flow clarity                               | `target`     | Users can scan collapsed cards faster, type pool size where the presets already are, and start from a credible default pool structure.                         | unit/e2e + manual QA                   | `5`                     |
| Visual design quality                         | `target`     | Step cards and pool-size controls should look denser, calmer, and more intentional on desktop and mobile without boxed-in visual drift.                        | screenshot review + preview QA         | `5`                     |
| Business logic correctness and data integrity | `target`     | New scaffold steps, rests, repeat groups, and pool-size entry must stay valid under current canonical workout schema and Garmin-compatible semantics.          | targeted unit tests + code review      | `5`                     |
| Admin editor ergonomics                       | `target`     | Common manual-pool authoring tasks need fewer pointer miles, less wasted height, and a better first-edit starting point.                                       | manual QA + targeted tests             | `5`                     |
| Accessibility (a11y)                          | `target`     | Action alignment, compact pool-size input, and bulk-selection cleanup preserve labels, focus order, and keyboard/screen-reader clarity.                        | code review + targeted QA              | `5`                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this slice should not add heavy client logic or materially regress private builder responsiveness.                                            | `npm run build` + diff review          | `4`                     |
| Data placement and sync boundaries            | `target`     | Scaffold defaults and view/edit layout state are local authoring concerns; saved workout payloads and canonical server persistence remain the source of truth. | brief contract + implementation review | `5`                     |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new cache layer is introduced; create/save/delete/list flows must continue to refresh deterministically.                                   | workflow QA + code review              | `4`                     |
| Reliability and failure handling              | `target`     | New scaffold creation and card cleanup must not introduce invalid drafts, broken delete states, or confusing hidden actions.                                   | targeted tests + manual QA             | `5`                     |
| Security and authz                            | `supporting` | Supporting only: this slice reuses existing authenticated workout routes and owner-scoped actions without changing privileges.                                 | route review                           | `4`                     |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes no personal-data collection, disclosure, retention, or sharing surface.                                                         | explicit scope rationale               | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: residual UI copy and labels become more truthful and lower-noise, but no new content governance workflow is introduced.                       | copy review                            | `4`                     |
| Admin workflow and editability                | `target`     | Builder and saved-session management should require fewer interpretation steps and less vertical scanning to do common authoring and cleanup tasks.            | manual QA + targeted unit/e2e          | `5`                     |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated My Library routes with no public crawl contract.                                                                           | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public route, metadata, or AI-discoverable surface changes in this slice.                                                                       | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event contract or KPI instrumentation.                                                                             | explicit scope rationale               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or revenue surface is touched.                                                                                   | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident tooling or support-operation workflow; it is private builder and library UX only.                                   | explicit docs-only scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting workflow changes here.                                                                                                        | explicit scope rationale               | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice refines private English builder/library copy only and does not add a localization contract.                                             | explicit scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The slice must reuse existing builder/workout utilities and current design language with no new dependency.                                                    | dependency diff + code review          | `5`                     |
| Testing and QA automation                     | `target`     | Unit/e2e coverage must protect the new pool scaffold, compact pool-size layout, bulk-selection cleanup, and card action placement; `verify:pre-pr` must pass.  | updated tests + `verify:pre-pr`        | `5`                     |
| Scalability and cost efficiency               | `N/A`        | N/A because no background job, query fan-out, or runtime-cost architecture changes are introduced.                                                             | explicit scope rationale               | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: no schema migration is expected, so rollback remains a normal code rollback with no data-repair step.                                         | diff review + validation               | `4`                     |

## Data Placement And Sync Contract

- Server-canonical data:
  - workout rows and stable workout IDs,
  - canonical workout draft payloads,
  - pool-length values, unit, steps, repeat groups, and rest semantics,
  - saved list summaries and delete state after server confirmation.
- Local-only data:
  - builder `edit` vs `view` mode,
  - open/collapsed step state,
  - temporary pool-size input formatting and inline layout,
  - bulk-selection UI state before destructive confirmation.
- Sync policy:
  - create/save/delete remain authoritative only after server confirmation,
  - the starter scaffold is seeded locally into the new workout payload before initial create,
  - UI density/layout changes must not reinterpret canonical saved data.
- Retention and sensitivity:
  - no new retained data is introduced,
  - bulk-selection cleanup must not hide destructive-state meaning.
- Cache/invalidation:
  - existing create/save/delete/list refresh behavior remains authoritative,
  - this slice must not introduce stale read-mode vs saved-list divergence.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical stable identity for builder routes and library operations.
- Human-readable identifiers:
  - workout title is editable display metadata only,
  - labels such as `Pool Size`, `Session steps`, `Edit`, and `Delete selected` are presentation-only.
- Mutability rules:
  - this brief may rename visible labels in place,
  - it must not repurpose workout identity or route params.
- Rename vs repurpose policy:
  - starter scaffold, card layout, and cleanup copy are in-place presentation/workflow changes,
  - materially different saved workouts still require new/create flows under the existing model.
- Compatibility contract:
  - older saved workouts must continue to load into the same canonical schema even if new workouts start from a richer default scaffold.
- Observability and repair:
  - regressions should surface through unit/e2e coverage around create payloads, builder rendering, and saved-workout list behavior.

## Scope

- Tighten collapsed builder step-card density:
  - align desktop/tablet `Edit`/`Done` actions with the summary header instead of stacking them below,
  - preserve mobile fallback where progressive action menus already own the narrow layout,
  - apply the same density logic to standard step cards and repeat-internal step cards where relevant.
- Compact the manual-pool `Pool Size` composer further:
  - keep one visible heading only,
  - keep unit toggle, presets, and exact input in one compact left-aligned inline group on large screens,
  - reduce exact-input width to the smallest practical size for normal values,
  - keep the exact input visually grouped with presets,
  - avoid pushing the exact input to the far right,
  - preserve unit clarity and current canonical exact-input semantics.
- Replace the current single-step manual pool empty draft with a Garmin-like starter scaffold:
  - warmup step,
  - rest after warmup,
  - repeat block with work step and internal between-interval rest,
  - separate post-set rest,
  - cooldown step,
  - rest after cooldown,
  - default all auto scaffold rests to `0:30`,
  - preserve Garmin-compatible repeat/rest structure and canonical export semantics.
- Clean up `My Swim Sessions` bulk-selection noise:
  - remove repeated visible `Select session` card text,
  - keep clear checkbox affordance and accessible labeling,
  - keep bulk toolbar semantics,
  - unify selected-delete copy where the current flow says both `Delete selected` and `Delete selected sessions`.
- Update targeted tests and any directly affected workflow copy contracts.

## Out Of Scope

- Private preview access page or first-impression redesign.
- Global desktop/logo cleanup.
- Poolside-note full visual/brand pass.
- Drag-and-drop step movement.
- Dryland / land-training builder planning or implementation.
- New Garmin export semantics, repeat/rest canonical rewrites, or schema changes beyond the starter scaffold defaults allowed by current schema.

## Acceptance Criteria

1. Collapsed desktop/tablet step cards no longer waste a separate row for `Edit`/`Done`; the action aligns with the summary header where it reduces height cleanly.
2. Manual-pool `Pool Size` exact input is compact, left-aligned, and visually grouped with presets instead of sitting far right in a wide split layout.
3. `Pool Size` still exposes only one visible heading and preserves current accessibility semantics and canonical save behavior.
4. Creating a new manual pool session no longer seeds a single `100m` step; it opens with a Garmin-like scaffold that includes warmup, repeat work, internal repeat rest, post-set rest, cooldown, and default `0:30` rests.
5. The starter scaffold remains valid under current workout schema rules and Garmin-compatible repeat semantics.
6. `My Swim Sessions` bulk-selection mode no longer repeats visible `Select session` text on every card.
7. Bulk delete copy is consistent and remains clear in toolbar and confirmation states.
8. Existing save/update/delete and builder view/edit behavior remain intact.
9. Relevant unit/e2e coverage is updated in the same slice.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-server.test.ts`
  - `tests/unit/create-manual-workout-button.test.tsx`
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

- Preserve the current FreeSwimming builder visual language while making it tighter and calmer.
- Do not flatten away Garmin-relevant repeat/rest structure.
- Do not make the pool-size control ambiguous while compacting it.
- Keep the slice focused on residual swim-session-builder/library seams only.

## 10/10 Quality Bar

- Builder step cards should feel dense and deliberate, not vertically padded by low-value action placement.
- `Pool Size` should feel like one precise control cluster with minimal pointer travel.
- A brand-new pool session should open in a way that already resembles a real swim set, not a fake placeholder.
- Bulk cleanup should feel cleaner and calmer without losing destructive-action clarity.
- All changed UI states must remain clear across loading, empty, error, retry, and destructive-confirmation states.
- Business logic must stay deterministic:
  - valid repeat group structure,
  - valid rest placement,
  - stable pool-size persistence,
  - no silent draft corruption.

## Help / Guide Impact

- `N/A` for Help-center content because this slice changes private builder/list ergonomics only and does not change a public-facing help contract.

## Checkpoint Log

- `2026-04-13 | in-progress | brief created on branch feat/swim-builder-residual-density-starter-scaffold-2026-04-13 | next: implement WorkoutEditor, SavedWorkoutsPanel, manual draft scaffold, then update targeted tests`
- `2026-04-13 | in-progress | implemented compact pool-size inline cluster, Garmin-like pool starter scaffold, saved-session bulk-selection cleanup, and builder test updates | next: run targeted validation + full pre-pr gate`
- `2026-04-13 | blocked-by-external-gate | targeted vitest passed for workout builder/server/create flows; targeted builder mobile E2E passed; full verify:pre-pr rerun passed unit/build/perf and builder E2E checks but was later blocked by unrelated desktop E2E failures in my-library-new-content-notice, my-library-program-export, and my-library-training-context; isolated rerun of those three desktop spec files passed (7/7) | next: commit/push this slice and treat full-suite desktop E2E instability as external merge blocker unless a fresh clean-room rerun clears it`
- `2026-04-13 | note | perf-budget trend recommended "tighten" after 2 consecutive weekly green runs with 36.2% margin; no perf-budget threshold change made in this slice because it is outside the scoped builder/library residual cleanup work | next: record tighten/hold decision in the next relevant perf-focused checkpoint or PR summary`
- `2026-04-13 | in-progress | post-1798cca stability pass added runtime-flags JSON fallback in SiteChrome plus Playwright route/save-state hardening for my-library-program-export and my-library-workout-builder; local lint and typecheck passed, isolated desktop reruns for both affected specs passed, and a warm-server verify:pre-merge rerun kept all swim-builder/program-export/training-context coverage green but still failed on 5 unrelated desktop-chromium specs outside this slice (course-common-mistakes-visibility, drawer-focus-trap, my-library-athlete-profile, my-library-dryland-builder, my-library-new-content-notice) | next: commit/push final stability patch and use PR CI as the merge-readiness gate for this scoped work`
