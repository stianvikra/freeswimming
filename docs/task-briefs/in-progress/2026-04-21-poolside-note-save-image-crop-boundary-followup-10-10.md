# Task Brief: Poolside Note Save Image Crop Boundary Followup (10/10)

## Metadata

- `id`: `2026-04-21-poolside-note-save-image-crop-boundary-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-22`

## Goal

Ensure Save image exports only the poolside note surface, with no extra white or blue margin on the left or around the exported note.

## Sequencing Lock

- Run this before maintenance baseline unless explicitly deferred.
- Keep this as a narrow poolside export boundary fix, not a new print preview redesign.
- Depends on the shipped save-image baseline:
  - [2026-04-20-poolside-note-save-as-image-export-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-poolside-note-save-as-image-export-10-10.md)
  - [2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md)

## Why This Brief Exists

- Current saved PNG can still include an unwanted left-side white margin.
- Poolside Save image should behave like a precise export of the note itself, not the surrounding preview container.
- The fix must preserve the current poolside visual language, including the print preview page and the compact poolside note card design already shipped.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                     | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Save image remains a direct poolside note export action and does not imply the surrounding preview UI is part of the asset.        | screenshot and PNG artifact review     | `5/5`                   |
| UX flow clarity                               | `target`     | Users can save once or repeatedly and get a clean note image without extra margins or stale crop state.                            | manual QA and targeted e2e             | `5/5`                   |
| Visual design quality                         | `target`     | Exported portrait and landscape PNGs crop tightly to the note boundary and match the current poolside note design system.          | before/after PNG comparison            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Export crop uses the intended note element and current preview settings without mutating workout data or presentation settings.    | unit/e2e coverage and code review      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes owner-facing poolside export behavior, not admin editing or publishing flows.                             | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: Save image controls keep labels, focus, and disabled/busy state semantics.                                        | semantic review                        | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Cropping/export fix adds no heavy dependency and does not make image export noticeably slower on mobile preview.                   | dependency diff and mobile export QA   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Saved image remains a local browser-generated artifact; no new server persistence or sync path is introduced.                      | code review                            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Changing preview settings before save always exports the current rendered note and crop boundary.                                  | e2e export comparison                  | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing readiness, repeated save, mobile Safari-like viewport, and landscape/portrait states never create blank or clipped images. | targeted Playwright coverage           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: export remains inside existing authenticated owner preview routes with no new public asset endpoint.              | auth boundary review                   | `4/5`                   |
| Privacy and compliance                        | `target`     | Exported PNG contains only intentionally visible poolside note content, not surrounding private UI or browser chrome.              | artifact inspection                    | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: exported image uses the current poolside note content source of truth and does not create alternate copy.         | artifact comparison                    | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no role-gated admin mutation workflow changes.                                                                         | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated export behavior changes no public route metadata, sitemap, robots, or crawlable content.                 | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content or structured data changes.                                                          | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because success is verified through deterministic export artifacts, not product analytics.                                     | explicit scope rationale               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, or revenue path changes.                                                            | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a narrow owner-facing export crop fix and introduces no new support workflow.                                  | explicit scope rationale tied to scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, or reporting path changes.                                                         | explicit scope rationale tied to scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, or public copy architecture changes.                                             | explicit scope rationale tied to scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Fix uses existing browser/export stack and adds no new rendering or image dependency unless unavoidable and explicitly justified.  | dependency diff and code review        | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests and screenshot artifacts cover before/after crop for portrait and landscape and repeated Save image.                         | Playwright artifacts and verify gates  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no server-side export cost or background processing is introduced.                                                | architecture review                    | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: change stays a narrow reversible UI/export diff with no schema or migration.                                      | PR diff review                         | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout content and poolside note data stay unchanged.
- Local-only:
  - generated PNG blob/download state.
- Sync policy:
  - Save image reads the current rendered note surface only.
  - No export action writes back to workout data.
- Retention and sensitivity:
  - exported PNG is owner-triggered and local to the browser/device.
- Cache/invalidation:
  - preview setting changes must invalidate the rendered export target before save.

## Identity And Rename Contract

- `N/A`
- Rationale: no persisted entities, route params, slugs, titles, or aliases are introduced or renamed.

## Scope

- Fix Save image crop boundary for poolside note.
- Validate portrait and landscape.
- Validate preview surface versus actual downloaded PNG.
- Preserve current poolside print preview controls and design rhythm.

## Out Of Scope

- Session/step note display options.
- New image formats beyond the current PNG path.
- Server-side rendering/export service.
- Print/PDF redesign.

## Acceptance Criteria

1. Saved PNG has no asymmetric left/right white margin.
2. Saved PNG has no excess preview-container background beyond the note boundary.
3. Portrait and landscape exports both crop to the intended note surface.
4. Repeated Save image attempts work without stale or blank exports.
5. Exported image still includes the full visible poolside note content.

## Validation

- `npm run lint:briefs`
- targeted unit/e2e coverage for export target selection and repeated save
- targeted screenshot handoff before `verify:pre-pr`
- owner screenshot/artifact approval before PR gate
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local and Vercel preview.
- Mobile portrait viewport.
- Desktop landscape viewport.
- Actual downloaded PNG inspected in addition to in-browser preview.

## Design Constraints

- Match current poolside preview page design.
- Preserve the cleaner exported note surface from the latest save-image work.
- Screenshot names must explicitly mark `before-` and `after-` crop artifacts.

## Help/Guide Impact

- `N/A` unless implementation changes the user-facing Save image workflow text.

## Checkpoint Log

- `2026-04-21 | planned | created from owner finding that Save image still leaves left-side white margin | next: implement or defer before maintenance baseline`
- `2026-04-21 | in-progress | moved to implementation branch fix/poolside-save-image-crop-boundary-2026-04-21; exact note capture width and PNG-vs-note metric tests in progress | next: targeted validation and screenshot/artifact handoff before PR gates`
- `2026-04-22 | in-progress | targeted unit and mobile Playwright export tests pass; after-artifacts saved in output/playwright/poolside-save-image-crop-boundary-2026-04-21 | next: owner artifact approval before verify:pre-pr`
- `2026-04-22 | in-progress | tightened export boundary to include measured visual overflow and added tagline edge padding so brand lockup is not clipped in exported PNGs | next: owner artifact approval before verify:pre-pr`
- `2026-04-22 | in-progress | revised approach: export now crops to exact note surface, e2e asserts visible content stays inside note bounds, and hero safe-inset was increased to improve optical alignment | next: owner artifact approval before verify:pre-pr`
- `2026-04-22 | in-progress | removed horizontal scrollWidth from export bounds and regenerated full-res portrait/landscape PNG artifacts; width now follows visible note surface while height may still use scrollHeight | next: owner artifact approval before verify:pre-pr`
- `2026-04-22 | in-progress | fixed embedded preview loading race with layout-effect readiness reset; changed save-image capture to symmetric 8px canvas padding using translate so the note is not hard-clipped at the right edge; regenerated artifacts after stricter ready checks | next: owner artifact approval before verify:pre-pr`
- `2026-04-22 | in-progress | replaced transform-based export padding with a real white capture wrapper around a shadowless note clone; e2e now checks all four PNG edges for hard-clipped note content and full-res artifacts were regenerated | next: owner artifact approval before verify:pre-pr`
- `2026-04-22 | in-progress | owner approved regenerated artifacts; npm run verify:pre-pr passed full public lane with 104 passed / 340 skipped | next: commit, push, open PR`
- `2026-04-22 | in-progress | pre-merge exposed an unrelated admin-context-notes API probe ECONNRESET; aligned the remaining direct probes with the existing unavailable-API skip contract; npm run verify:pre-pr passed full public lane with 106 passed / 338 skipped | next: commit, push, refresh PR evidence`
