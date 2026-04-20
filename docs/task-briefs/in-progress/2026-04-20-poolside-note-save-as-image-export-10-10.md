# Task Brief: Poolside Note Save As Image Export (10/10)

## Metadata

- `id`: `2026-04-20-poolside-note-save-as-image-export-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-20`
- `updated`: `2026-04-20`

## Goal

Let the owner-facing poolside note preview export the current note as a high-quality image without introducing a second renderer or drifting away from the current preview state.

## Sequencing Lock

- Run this brief before `2026-04-18-maintenance-baseline-pre-live-10-10.md`.
- Keep this as a focused poolside export follow-up, not a mixed poolside polish umbrella.

## Why This Brief Exists

- The poolside preview now owns print presentation settings, but the export surface still stops at `Print / Save PDF`.
- The owner explicitly wants `Save as image` for the poolside note/guide-style preview output.
- The best 10/10 path is to export the exact current preview note surface:
  - same title,
  - same swimmer,
  - same focus,
  - same layout,
  - same abbreviations/complete words mode,
  - same rest placement,
  - same brand lockup.
- This should ship as a narrow export capability:
  - no new builder controls,
  - no new persistence layer,
  - no second image-specific renderer,
  - no reopening of unrelated poolside layout work.

## Dependencies And Boundaries

- Depends on the shipped preview-owned settings baseline:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10.md)
- Supporting poolside note lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md)
- Likely implementation surfaces:
  - [/Users/stianvikra/freeswimming/app/my-library/workouts/poolside-preview/page.tsx](/Users/stianvikra/freeswimming/app/my-library/workouts/poolside-preview/page.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts](/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
- Locked product decisions for this brief:
  - the export button lives in preview, not in builder,
  - default export format is `PNG`,
  - export captures the note surface only, not preview controls/chrome,
  - export must derive from the current preview state instead of a second rendering contract,
  - mobile may use native share when available, but the user-facing capability remains "Save image",
  - public `guides/poolside` route is out of scope unless a later brief explicitly targets it.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                   | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Preview must present `Save image` as a first-class export next to `Print / Save PDF` without reintroducing builder/export responsibility drift.                                  | screenshot review + workflow QA                    | `5/5`                   |
| UX flow clarity                               | `target`     | Users must be able to export the exact current note image from preview in one clear action, with deterministic download/share behavior and no hidden extra step.                 | manual QA + targeted e2e                           | `5/5`                   |
| Visual design quality                         | `target`     | Exported images must look like the preview note itself: no preview chrome, no clipped brand lockup, no accidental whitespace frame, and no degraded typography or color.        | screenshot review + exported artifact review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Image export must reflect the current preview state exactly, with no drift between rendered note content and exported PNG output.                                                | unit coverage + route review + manual comparison   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: the export action should feel native to the preview-owned poolside workflow and avoid new builder complexity.                                                   | workflow QA + diff review                          | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Export controls must remain keyboard reachable, labeled, focus-visible, and understandable while loading/failing/retrying.                                                      | semantic review + targeted QA                      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: image export should not make normal preview interaction feel heavy or stall the route after capture completes.                                                 | manual QA + diff review                            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Export state must remain local-only and derived from the current preview state; no image export action may write back into canonical workout data or saved preferences.          | brief contract + code review                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Re-exporting from the same preview state must deterministically yield the same note content, while changed preview settings/content must invalidate the export result naturally. | route QA + export comparison                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed capture, asset readiness issues, and share/download fallbacks must fail cleanly with recoverable UI and no stuck preview state.                                          | negative-path QA + targeted tests                  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: the export action must stay inside the existing owner-facing preview boundary and must not create a new public image endpoint or leak protected note content.   | auth boundary review + existing route contract     | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this brief adds owner-triggered export of already visible private preview content and does not add new personal-data collection, sharing policy, or retention path. | explicit scope rationale                           | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: exported images must stay truthful to the current workout/focus content contract rather than inventing a separate image-only content variant.                   | code review + artifact comparison                  | `4/5`                   |
| Admin workflow and editability                | `target`     | Saved-workout and local-draft preview flows must both export from the same preview-owned note surface with the same control model and result quality.                            | workflow QA across both entry paths                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this work stays inside the authenticated owner-facing preview/export flow and does not create a crawlable public route.                                             | explicit scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public semantic content surface, retrieval metadata, or indexable AI-facing asset path.                                                       | explicit scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not require new instrumentation; success is verified through workflow QA, screenshots, and export artifact checks.                                  | explicit scope rationale                           | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, entitlement, pricing, or revenue workflow changes in this slice.                                                                                        | explicit scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a private export ergonomics slice and does not introduce a new operational support surface or incident playbook requirement.                                 | explicit scope rationale tied to export-only scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not touch reconciliation, reporting, payouts, or finance-affecting logic.                                                                           | explicit scope rationale tied to export-only scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief adds export behavior for the current English owner workflow only and does not alter locale architecture or translation flow.                              | explicit scope rationale tied to export-only scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The implementation must reuse the current preview note renderer and avoid introducing a second backend/image-rendering pipeline; any helper dependency must stay narrowly scoped. | architecture review + dependency diff              | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted test coverage plus screenshot/export artifact handoff must lock saved-workout + local-draft image export behavior before merge.                                        | targeted tests + screenshot QA + verify            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: export should stay lightweight enough that future poolside evolutions do not require maintaining two divergent output systems.                                  | architecture review                                | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: image export must remain a narrow reversible diff with no migration or external service dependency.                                                             | PR diff + rollback review                          | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout/session content,
  - swimmer name,
  - open focus content already resolved into the preview,
  - existing owner-facing preview auth boundary.
- Local-only:
  - current preview export settings already represented in URL/local preview state,
  - transient export lifecycle state such as `idle`, `capturing`, `sharing`, `failed`,
  - generated image blob/object URL during the current export action.
- Sync policy:
  - `Save image` always exports from the current preview state,
  - changing preview settings changes the export result naturally because export reads from the current note surface/state,
  - no export action writes into canonical workout rows, local draft structure, or saved preference storage.
- Retention and sensitivity:
  - generated image data is ephemeral and should be released after download/share when possible,
  - no export history, analytics payload, or server-side storage is added in this slice.
- Cache/invalidation:
  - preview remains `no-store`,
  - same preview state should produce the same visible content and materially equivalent PNG output,
  - changed preview content/settings should invalidate the export result by recomputing from current state.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this brief introduces no new persisted entity, slug, route parameter, or canonical identifier.

## Scope

- Add `Save image` to the owner-facing poolside preview surface.
- Export the note surface itself as a branded PNG image.
- Ensure export honors the current preview state:
  - current title,
  - current swimmer chip,
  - current focus content,
  - current layout,
  - current notation mode,
  - current rest placement,
  - current color/ink mode if that affects note rendering.
- Support both preview entry paths:
  - saved workouts,
  - live local-draft preview.
- Provide mobile-friendly delivery:
  - native share sheet when available,
  - reliable fallback when not available.
- Provide desktop-friendly delivery:
  - direct download with predictable filename.
- Include loading/error/retry behavior for failed capture/download/share states.
- Provide screenshot/export artifact handoff before `verify:pre-pr`.

## Out Of Scope

- New builder controls.
- Public `guides/poolside` export changes.
- Server-side image rendering pipeline.
- Background job/export queue.
- Admin-managed export presets or filename templates.
- Reopening general poolside spacing/layout issues unless they directly block truthful image export.
- Replacing or redesigning the existing PDF export in the same brief.

## Acceptance Criteria

1. Preview shows a clear `Save image` action beside the existing export actions.
2. Exported output is `PNG`, not `JPG`, and contains only the note surface without preview controls/chrome.
3. Exported content matches the currently visible preview state without drift.
4. Fonts, brand lockup, and note content are fully ready before capture; no blank or fallback-branded image may ship silently.
5. Desktop browsers receive a predictable downloaded file name based on the session title and current orientation/layout.
6. Mobile browsers use native share when available and otherwise provide a working fallback path.
7. Failed image capture/share/download shows recoverable feedback and keeps the preview usable.
8. Saved-workout and local-draft preview flows produce the same export quality and semantics.
9. Screenshot/export artifact handoff clearly shows the exported result before merge.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for export state/filename/render contracts
- targeted preview/export Playwright coverage for saved-workout + local-draft flows
- targeted screenshot/export artifact handoff with short explanation before `verify:pre-pr`
- owner screenshot approval or correction pass before `verify:pre-pr`, PR creation, and `verify:pre-merge`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - owner-facing poolside preview from saved workout
  - owner-facing poolside preview from local draft
  - mobile-width export flow
  - desktop export flow
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - iPhone-width Safari-equivalent
  - Android Chromium-width viewport
  - desktop Chromium
  - desktop Safari/WebKit-equivalent

## Constraints

- Keep this brief tightly scoped to image export.
- Do not create a second note renderer just for PNG export.
- Do not persist export settings or image history.
- Do not weaken the current preview-owned settings contract.
- Prefer one calm, explicit export action over multiple overlapping image buttons.

## 10/10 Quality Bar

- Export should feel like a natural extension of preview, not a workaround.
- The exported PNG should look presentation-ready on first try.
- Required states remain strong:
  - default ready-to-export,
  - capturing,
  - mobile share available,
  - download fallback,
  - export failure,
  - retry after failure.
- Accessibility expectations:
  - keyboard reachable action,
  - clear loading/error text,
  - visible focus,
  - no status conveyed by color alone.
- Visual consistency expectations:
  - exported result matches the current note styling and brand hierarchy,
  - no accidental outer whitespace frame,
  - no clipped focus box, swimmer chip, or logo lockup.
- Business-logic expectations:
  - no drift between preview state and exported image,
  - no accidental write-back of export-only transient state,
  - no blank capture caused by race conditions with asset readiness.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes a private owner-facing export action only and does not alter Help/Guide workflow labels or operator procedures.

## Checkpoint Log

- `2026-04-20 | pre-pr gate green | owner approved the save-image screenshots/export artifacts, embedded canonical preview assets were normalized to relative paths for image-capture parity, targeted unit + Playwright coverage passed, and \`npm run verify:pre-pr\` finished green after confirming two unrelated desktop-chromium flakes as environment/backend noise rather than save-image regressions | next: stage only the scoped source/test/brief files, commit, push, open/update the PR, monitor CI, and run \`npm run verify:pre-merge\` before merge recommendation`
- `2026-04-20 | implementation + artifact checkpoint | wired preview-owned PNG export into the poolside preview, added focused unit coverage for filename/export state, added a desktop Playwright export path, and generated local approval artifacts in \`output/playwright/poolside-save-image-export/\`; targeted \`vitest\` and \`typecheck\` passed, while the dedicated Playwright spec currently skips its auth/schema branch in this local environment and is documented as an environment-limited signal rather than a product failure | next: owner review of the generated screenshots/export artifact, then \`npm run lint:briefs\` + \`npm run verify:pre-pr\` before PR update`
- `2026-04-20 | implementation start | created a clean implementation worktree from \`origin/main\`, moved the save-as-image export brief into \`in-progress\`, and started the narrow poolside PNG-export slice scoped to the existing preview renderer plus transient client-side export state | next: wire the export path, add focused coverage, and produce before/after/export artifacts for owner approval before \`verify:pre-pr\``
- `2026-04-20 | planning | created the dedicated follow-up brief for poolside note save-as-image export after the preview-owned settings slice shipped; locked the recommendation to keep the work preview-owned, PNG-first, note-surface-only, and separate from broader poolside polish or maintenance baseline work | next: if approved for execution, move this brief to in-progress and implement the export flow end to end`
