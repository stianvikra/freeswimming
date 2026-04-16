# Task Brief: Poolside Header Lockup Stability (10/10)

## Metadata

- `id`: `2026-04-16-poolside-header-lockup-stability-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-16`
- `updated`: `2026-04-16`

## Goal

Make the poolside note header branding deterministic so the print preview always shows the intended blue symbol + dark `freeswimming` + gray `.org` lockup instead of occasionally falling back to the old plain-text header.

## Why This Brief Exists

- The poolside print hardening in `#448` fixed blank/vanishing preview delivery, but owner review exposed a remaining brand-surface instability:
  - the poolside popup can still intermittently render the old plain `freeswimming.org` fallback text,
  - even though the intended header design is the newer lockup with symbol + differentiated wordmark treatment.
- The problem is not the desired visual direction itself.
  - The current poolside renderer still depends on an image-loading path plus a generic fallback.
  - When that image path does not resolve consistently in popup/print timing, the fallback becomes visible and visually regresses the header.
- This slice exists to remove that instability on the poolside note only.

## Dependencies And Boundaries

- Parent workout/poolside work:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Direct predecessor:
  - [2026-04-16-poolside-note-print-stability-and-density-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-16-poolside-note-print-stability-and-density-10-10.md)
- Primary implementation surfaces:
  - [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [workouts-routes.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-routes.test.ts)
- Locked boundaries:
  - no Garmin/export payload changes,
  - no workout-step or rest-semantics changes,
  - no builder-list UX change for opening poolside note from `My Swim Sessions`,
  - no broader brand-system rewrite outside the poolside note header.

## Product Direction Locked By This Brief

1. The poolside note must keep the newer brand lockup direction.
2. Poolside header branding must not rely on a flaky image-load fallback path.
3. When the poolside note opens, the owner should get the intended brand lockup every time.
4. The stable fallback must visually match the intended lockup, not an older plain-text domain treatment.
5. The fix must stay scoped to the poolside note print surface.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `UX flow clarity`
- `Visual design quality`
- `Reliability and failure handling`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                              | Evidence                                   | Expected Closeout |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------- |
| Product goals and IA                          | `supporting` | The poolside note should keep a stable, immediately recognizable brand header without changing the lane-side information hierarchy.                   | code review + screenshot QA                | `4/5`             |
| UX flow clarity                               | `target`     | Opening the poolside note should show the intended header lockup consistently, with no visible regression to the old plain-text fallback.             | targeted unit assertions + owner visual QA | `5/5`             |
| Visual design quality                         | `target`     | The poolside note header must consistently render blue symbol + dark `freeswimming` + gray `.org` in both portrait and landscape.                     | targeted unit assertions + screenshot QA   | `5/5`             |
| Business logic correctness and data integrity | `supporting` | Branding hardening must not affect workout totals, focus points, print options, or export truthfulness.                                               | code review + existing tests               | `4/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not change builder editing flows, admin publish tasks, or operator click-count ergonomics.                                | explicit scope rationale                   | `N/A`             |
| Accessibility (a11y)                          | `supporting` | The stable lockup must remain readable with proper contrast and should not remove human-readable brand text.                                          | code review + visual QA                    | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | The fix must stay within the existing HTML/CSS renderer and add no dependency or heavy runtime path.                                                  | diff review + `npm run build`              | `4/5`             |
| Data placement and sync boundaries            | `target`     | The lockup fix must stay presentation-only with no persistence, no new local storage, and no workout writeback.                                       | brief contract + code review               | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Each preview open must render the same deterministic lockup without depending on transient image-load success.                                        | code review + targeted tests               | `4/5`             |
| Reliability and failure handling              | `target`     | Poolside preview branding must no longer degrade into the old fallback presentation when the popup/render timing changes.                             | targeted unit assertions + verify evidence | `5/5`             |
| Security and authz                            | `N/A`        | N/A because no auth, entitlement, or authorization rule changes exist in this branding-only slice.                                                    | explicit scope rationale                   | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A because this slice introduces no new personal data fields, retention changes, or sensitive logging surfaces.                                      | explicit scope rationale                   | `N/A`             |
| Content governance                            | `supporting` | The brand lockup should reflect the existing chosen visual direction instead of introducing an ad hoc alternate source of truth.                      | code review + design comparison            | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because this slice does not change admin workflow state, save behavior, role-gated mutation paths, or edit confirmations.                         | explicit scope rationale                   | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because the poolside note preview is an authenticated private artifact, not a crawl target.                                                       | explicit scope rationale                   | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata or retrieval surface.                                                                               | explicit scope rationale                   | `N/A`             |
| Analytics and KPI observability               | `N/A`        | N/A because success is evaluated through deterministic rendering and tests, not new analytics events.                                                 | explicit scope rationale                   | `N/A`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or checkout behavior is touched.                                                                                 | explicit scope rationale                   | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice introduces no new runbook or operational workflow; it simply removes a known rendering instability on an owner-facing surface. | explicit scope rationale                   | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because the work has no finance or reporting effect.                                                                                              | explicit scope rationale                   | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice preserves the existing English poolside contract and adds no locale architecture.                                              | explicit scope rationale                   | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The fix must stay inside the existing poolside renderer and test stack with no new dependency.                                                        | diff review + validation evidence          | `5/5`             |
| Testing and QA automation                     | `target`     | Unit coverage must lock the poolside header lockup contract in generated HTML and popup preview output; repo pre-PR verification must pass.           | updated tests + `npm run verify:pre-pr`    | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The fix should reduce future print-preview brand flakes by removing dependence on a transient fallback path.                                          | code review + diff review                  | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain a reversible code-only change with no migration or rollout coordination burden.                                                 | PR diff + rollback simplicity              | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical data:
  - workout content, focus points, swimmer name, and print options continue to come from the existing draft/export model.
- Local-only data:
  - preview-open state remains local-only.
- Sync policy:
  - the lockup hardening must not save anything,
  - opening the preview still rebuilds from current local state each time.
- Retention and sensitivity:
  - unchanged from the current owner-only workout preview contract.
- Cache/invalidation:
  - the poolside header must render deterministically from inline markup/CSS rather than transient image fallback state.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice changes no persisted entity identity, slug, title contract, or route parameter.

## Scope

- Stabilize the poolside header lockup so it consistently matches the intended design.
- Remove reliance on the visually regressive generic fallback for poolside note branding.
- Keep standard workout PDF branding behavior unchanged unless a tiny shared helper update is needed.
- Update targeted tests for generated poolside HTML and popup preview HTML.

## Out Of Scope

- Changing how `Poolside Note` opens from the `My Swim Sessions` list.
- New collapse/dropdown UX in the saved-sessions list.
- Builder rest/step wording changes.
- Standard PDF redesign.

## Acceptance Criteria

1. Poolside note header no longer intermittently renders as plain blue `freeswimming.org`.
2. Poolside note header renders the intended stable lockup with blue symbol, dark `freeswimming`, and gray `.org`.
3. The same header contract holds in both portrait and landscape poolside HTML.
4. No workout content, totals, focus points, or print-option semantics change.
5. Targeted tests pass.
6. `npm run verify:pre-pr` passes.

## Validation

- `npm run lint:briefs`
- targeted unit:
  - `npx vitest run tests/unit/workouts-shared.test.ts tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-routes.test.ts`
- `npm run verify:pre-pr`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local poolside print preview:
  - portrait
  - landscape
- Stress check:
  - open preview repeatedly to confirm the header no longer flips between correct and regressed lockups.

## Constraints

- Keep copy in English.
- Keep the fix as small and isolated as possible.
- Do not weaken the print-stability changes already shipped in `#448`.
- Do not introduce a new dependency.

## 10/10 Quality Bar

- The owner should not have to wonder whether the correct brand header will appear this time.
- The poolside note should render the intended lockup every time it opens.
- The fix should read as a clean hardening pass, not a new redesign.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes only poolside preview branding stability, not user-facing workflow guidance.

## Checkpoint Log

- `2026-04-16 | implementation start | created a dedicated follow-up slice after #448 to stabilize the poolside header lockup and remove the visually regressive fallback path without reopening the broader print-density scope | next: implement deterministic poolside brand lockup + update targeted tests`
- `2026-04-16 | implementation checkpoint | switched poolside header branding to a deterministic inline lockup so the popup no longer depends on transient logo-image fallback behavior; updated poolside html/popup/route tests to assert the stable lockup contract | next: run full pre-PR verification, then commit and open the fix PR`
