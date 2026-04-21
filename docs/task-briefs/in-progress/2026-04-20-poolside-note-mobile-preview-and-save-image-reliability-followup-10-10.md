# Task Brief: Poolside Note Mobile Preview And Save Image Reliability Followup (10/10)

## Metadata

- `id`: `2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-20`
- `updated`: `2026-04-21`

## Goal

Make the owner-facing poolside note preview and `Save image` flow fully reliable on mobile so the note always renders, exports the full note surface without cropping, and can be saved again without getting stuck.

## Sequencing Lock

- Run this brief after:
  - [2026-04-20-swim-session-builder-library-default-entry-action-density-and-workspace-nav-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-20-swim-session-builder-library-default-entry-action-density-and-workspace-nav-10-10.md)
- Run this brief before:
  - [2026-04-18-maintenance-baseline-pre-live-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-18-maintenance-baseline-pre-live-10-10.md)
- Keep this as a narrow mobile preview/export reliability pass, not a general poolside redesign umbrella.

## Why This Brief Exists

- The owner found remaining real-device reliability issues in the shipped poolside preview/export flow:
  - mobile preview can show the settings shell while the embedded note area stays blank,
  - mobile `Save image` can crop the note or cut the right/top edge,
  - repeated `Save image` attempts can become no-op after the first save,
  - the export contract must stay note-surface-only, not the larger pale-blue preview container.
- The current exported PNG target is correct in principle, but the mobile runtime contract is not yet stable enough to call 10/10.
- The owner wants this handled before maintenance baseline work begins.

## Dependencies And Boundaries

- Depends on shipped poolside preview/export lineage:
  - [2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10.md)
  - [2026-04-20-poolside-note-save-as-image-export-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-poolside-note-save-as-image-export-10-10.md)
  - [2026-04-20-poolside-note-rest-formatting-and-filter-contract-consistency-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-20-poolside-note-rest-formatting-and-filter-contract-consistency-10-10.md)
- Primary implementation surfaces likely touched when execution starts:
  - [/Users/stianvikra/freeswimming/app/my-library/workouts/poolside-preview/page.tsx](/Users/stianvikra/freeswimming/app/my-library/workouts/poolside-preview/page.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts](/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-poolside-preview.test.ts](/Users/stianvikra/freeswimming/tests/unit/workout-poolside-preview.test.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked product decisions for this brief:
  - exported image must include only the note surface, not the surrounding preview canvas/chrome,
  - mobile reliability is the priority:
    - preview must render,
    - full note must export,
    - repeated save must work,
  - support both saved-workout and local-draft preview entry paths,
  - keep `Save image` preview-owned,
  - do not add a second renderer or a server-side image pipeline,
  - do not reopen unrelated layout/branding debates unless they are directly necessary to fix truthful mobile preview/export behavior.

## Must Now

- Prevent blank embedded preview on mobile when the settings shell has already loaded.
- Make mobile `Save image` capture the full note surface without clipping.
- Reset export state cleanly so repeated `Save image` attempts work.
- Preserve the note-surface-only export contract.
- Validate both saved-workout and local-draft preview entry paths.
- Keep the preview usable if export fails and offer a clear retry path.

## Before Live

- Confirm real-device mobile preview never renders an empty preview frame once content is available.
- Confirm portrait mobile export captures the full note surface with correct brand lockup and focus box.
- Confirm landscape still behaves truthfully if the user changes layout on mobile.
- Confirm repeated export attempts do not require closing/reopening preview.

## Ongoing Cadence

- Future poolside mobile follow-ups should treat:
  - preview visibility,
  - capture boundary,
  - export retry behavior
    as one reliability contract rather than separate incidental bugs.
- Do not ship further poolside preview/export surface changes without testing both:
  - saved workout path,
  - live local-draft path.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                             | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Poolside preview must remain the single truthful place to preview and export the current note on mobile, with no ambiguity about what `Save image` captures.               | screenshot review + workflow QA               | `5/5`                   |
| UX flow clarity                               | `target`     | Mobile users must be able to preview and save the current note in one understandable flow, including repeat saves and recoverable failure/retry.                           | manual QA + targeted e2e                      | `5/5`                   |
| Visual design quality                         | `target`     | Embedded mobile preview and exported PNG must show the full note surface without blank areas, clipping, or accidental outer container capture.                             | screenshot review + exported artifact review  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Exported image content must match the current preview state exactly across mobile save attempts and across saved-workout/local-draft entry paths.                          | unit coverage + route review + manual compare | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes owner-facing poolside preview/export behavior, not admin/editor publish workflows.                                                          | explicit scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Mobile preview/export controls and retry messaging must remain keyboard reachable, labeled, focus-visible, and understandable while loading/failing.                       | semantic review + targeted QA                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: mobile preview/export fixes must avoid making the preview route feel heavy or stuck after repeated saves.                                                 | diff review + interaction QA                  | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Preview metrics, export lifecycle, and generated image blobs remain local-only transient state; canonical workout data and preview settings ownership stay unchanged.      | brief contract + code review                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Repeated export must always use the current rendered note state, and changing settings/content must invalidate prior capture results naturally without stale export reuse. | route QA + export comparison                  | `5/5`                   |
| Reliability and failure handling              | `target`     | Mobile preview must not stay blank after content is available, and failed/partial exports must recover cleanly without requiring a page reopen.                            | negative-path QA + targeted tests             | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: all preview/export behavior stays inside the existing authenticated owner boundary with no new public image endpoint.                                     | auth boundary review                          | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this brief improves export reliability for already visible private preview content and adds no new collection, sharing policy, or retention behavior.          | explicit scope rationale                      | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: exported images must remain truthful to the current workout/focus content contract rather than diverging into a separate mobile-specific content variant. | artifact comparison + code review             | `4/5`                   |
| Admin workflow and editability                | `target`     | Saved-workout and local-draft preview entry paths must continue to share the same preview-owned export contract and result quality on mobile.                              | cross-path QA                                 | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this work stays inside an authenticated preview/export flow with no public indexing contract.                                                                  | explicit scope rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public route semantics, metadata, or indexable AI-facing asset path.                                                                     | explicit scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not require new instrumentation; success is verified through screenshots, exported artifacts, and regression coverage.                         | explicit scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, entitlement, or commerce flow changes are involved.                                                                                                | explicit scope rationale                      | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a private owner-facing mobile reliability pass and does not introduce a new incident or support workflow.                                              | explicit scope rationale tied to brief scope  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, reconciliation, or reporting path changes are involved.                                                                                    | explicit scope rationale tied to brief scope  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief improves current English owner-facing export reliability only and does not alter locale architecture.                                               | explicit scope rationale tied to brief scope  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The fix must reuse the current preview renderer/export stack and avoid introducing a second renderer or unnecessary new dependency.                                        | architecture review + dependency diff         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests plus screenshot/export artifact handoff must lock blank-preview prevention, full-note mobile export, and repeated-save recovery before merge.               | targeted tests + screenshot QA + verify       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the reliability fix should simplify long-term preview/export behavior rather than adding parallel mobile-only rendering logic.                            | architecture review                           | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this must remain a narrow reversible preview/export diff with no schema, service, or migration rollout.                                                   | PR plan + rollback review                     | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout content,
  - focus content resolved into preview,
  - existing preview auth boundary,
  - current preview-owned settings encoded in route state.
- Local-only:
  - embedded preview viewport metrics,
  - capture readiness state,
  - export lifecycle state (`idle`, `capturing`, `sharing/downloading`, `failed`, `ready-again`),
  - generated blob/object URL for the current save attempt.
- Sync policy:
  - `Save image` must always export from the currently rendered preview state,
  - settings/content changes invalidate prior export output naturally because capture re-reads the current note surface,
  - repeated export attempts must reset transient export state after success or failure,
  - no mobile preview/export action writes back into canonical workout data or saved preference storage.
- Retention and sensitivity:
  - generated image data is ephemeral and should be released after each attempt when possible,
  - no export history is stored server-side in this slice.
- Cache/invalidation:
  - preview remains derived from the current route state and current note data,
  - blank or partially ready frames must not be treated as capture-ready.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this brief introduces no new persisted entity, slug, route parameter, or canonical identifier.

## Scope

- Fix mobile embedded preview reliability so the note renders whenever preview data is available.
- Fix mobile `Save image` capture bounds so the full note surface exports without clipping.
- Ensure exported output includes only the note/program surface, not the larger pale-blue preview container.
- Fix repeated `Save image` attempts so the second and later attempts work without closing preview.
- Preserve or improve clear success/error/retry feedback around image export.
- Validate both preview entry paths:
  - saved workout,
  - current local builder state.
- Validate both note layouts if the user changes layout from mobile preview:
  - portrait,
  - landscape.

## Out Of Scope

- New public poolside guide/export surfaces.
- Server-side image rendering.
- General poolside brand/layout redesign.
- New saved preferences for export behavior.
- Maintenance baseline or dependency modernization.

## Acceptance Criteria

1. Mobile preview no longer shows a blank note area once preview content is available.
2. Mobile `Save image` exports the full note surface without clipping the right edge, top lockup, swimmer chip, or focus panel.
3. Exported PNG contains only the note surface, not the broader preview container/chrome.
4. Repeated `Save image` attempts work from the same preview session without requiring page close/reopen.
5. Failed export attempts leave the preview usable and expose a clear retry path.
6. Saved-workout and local-draft preview entry paths both satisfy the same mobile preview/export contract.
7. Portrait mobile preview/export works; landscape remains truthful if selected from mobile.
8. Screenshot/export artifact handoff clearly shows mobile preview state and exported output before merge.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for:
  - preview readiness/capture gating,
  - export retry/reset behavior,
  - note-surface capture boundary
- targeted Playwright coverage for mobile preview/export on:
  - saved workout path,
  - local-draft path
- targeted screenshot/export artifact handoff with short explanation before `verify:pre-pr`
- owner screenshot approval or correction pass before `verify:pre-pr`, PR creation, and `verify:pre-merge`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - iPhone-width preview from saved workout
  - iPhone-width preview from current builder state
  - repeated `Save image` on the same preview session
  - portrait and landscape option changes from mobile preview
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - iPhone-width Safari-equivalent
  - Android Chromium-width viewport
  - desktop Chromium for regression comparison
  - desktop Safari/WebKit-equivalent for export regression comparison

## Constraints

- Do not ship a workaround that captures the wrong container just because it looks stable.
- Do not introduce a second renderer just for mobile export.
- Do not leave repeated-save behavior dependent on a full page reload.
- Keep this slice narrow and reliability-focused.

## 10/10 Quality Bar

- Mobile preview should feel trustworthy on first open.
- `Save image` should feel like a stable tool, not a one-shot action.
- Required states remain strong:
  - loading preview,
  - ready preview,
  - export capturing,
  - export success,
  - export failure,
  - retry after failure,
  - repeat save after success.
- Accessibility expectations:
  - labeled buttons,
  - visible focus,
  - readable status copy,
  - no status conveyed by color alone.
- Business-logic expectations:
  - no blank capture,
  - no clipped note export,
  - no stale export from previous settings,
  - no stuck button state after first save.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this brief fixes private owner-facing mobile reliability for an existing preview/export action and does not introduce a new documented Help/Guide workflow by itself.

## Checkpoint Log

- `2026-04-21`: Started implementation on
  `feat/poolside-mobile-preview-save-image-reliability`. Added embedded preview readiness
  gating, explicit note export bounds, repeat-save mobile E2E coverage, and after artifacts under
  `/Users/stianvikra/freeswimming/artifacts/test-runs/20260421-poolside-mobile-preview-save-image/`.
  Targeted validation so far:
  - `npx vitest run tests/unit/poolside-preview-page-client.test.tsx tests/unit/poolside-image-export-client.test.ts tests/unit/workout-poolside-preview.test.ts` PASS.
  - `PW_REUSE_EXISTING_SERVER=1 npx playwright test tests/e2e/poolside-save-image-export.spec.ts --project=mobile-chromium` PASS.
    Awaiting owner review of after artifacts before `verify:pre-pr`.
