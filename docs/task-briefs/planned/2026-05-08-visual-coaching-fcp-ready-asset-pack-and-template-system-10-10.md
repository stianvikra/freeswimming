# Task Brief: Visual Coaching FCP-Ready Asset Pack And Template System (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-fcp-ready-asset-pack-and-template-system-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Create a reusable FreeSwimming visual coaching asset pack optimized for Final Cut Pro, underwater readability, mobile viewing, and fast lesson production.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 should define the asset requirements first:
  - [Visual Coaching Phase 1](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10.md)
- Existing brand source:
  - [FreeSwimming Brand Usage](/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md)

## Scope Summary

Produce a reusable asset ecosystem:

- watermark variants,
- intro/outro lockups,
- lower thirds,
- title cards,
- drill labels,
- technique focus labels,
- arrows,
- highlight circles/boxes/strokes,
- body alignment guides,
- rotation indicators,
- catch path overlays,
- kick timing markers,
- split-screen labels/elements,
- freeze-frame labels,
- mistake/correction indicators,
- wall-placement logo variants,
- export manifest and usage documentation.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Visual design quality
- Accessibility (a11y)
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Asset families map clearly to the production-system overlay language and can be found quickly by future editors.                                               | manifest + folder review                      | `5/5`                   |
| UX flow clarity                               | `target`     | Editors can select the correct asset for watermark, title, callout, arrow, highlight, mistake, correction, split-screen, or freeze-frame use without guessing. | asset docs + pilot use review                 | `5/5`                   |
| Visual design quality                         | `target`     | Assets feel premium, minimal, underwater-readable, mobile-readable, and consistent with the existing FreeSwimming brand.                                       | exported asset review + sample frames         | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no app runtime data changes; asset IDs and manifest entries must not conflict or silently repurpose existing brand IDs.                       | manifest review                               | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this asset pack changes no admin editor, CRUD, publishing, or operator workflow.                                                                   | explicit scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Text, shapes, and color states remain readable on mobile and underwater footage; mistake/correct meaning is not color-only.                                    | contrast/readability review                   | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: production assets must not be wired into website runtime bundles unless a later runtime slice explicitly opts in.                             | public/runtime path review                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Editable sources, exported PNG/SVG assets, FCP-ready assets, and public-runtime assets have distinct folders and no accidental source leakage.                 | path audit + manifest                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: if public derived assets are created, filenames and manifest keys are deterministic and cache-friendly.                                       | manifest review                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Asset pack includes fallback choices for dark/light/underwater/high-contrast use and avoids single fragile one-off files.                                      | asset matrix review                           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected app paths change; source assets and project files must stay out of public runtime unless intentionally exported.                 | source/public boundary review                 | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no customer data or private footage is embedded in reusable assets or manifests.                                                              | asset review                                  | `4/5`                   |
| Content governance                            | `target`     | Every asset has stable ID, purpose, use case, source lineage, output path, and owner guidance.                                                                 | manifest + usage docs                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status, action, support path, or editor UI is introduced.                                                                       | explicit scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because reusable FCP/video production assets do not alter public route metadata, sitemap, robots, or crawlability.                                         | explicit scope rationale                      | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future videos may improve public content clarity, but this asset pack does not publish AI-discoverable pages.                                 | scope rationale                               | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because asset generation does not add product analytics events or KPI reporting.                                                                           | explicit scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: assets support commercial-quality content but do not change checkout, entitlement, pricing, billing, or revenue reporting.                    | scope rationale                               | `4/5`                   |
| Incident response and support operations      | `target`     | Asset docs make it fast to repair missing/broken/wrong variants and identify canonical fallback files.                                                         | troubleshooting notes                         | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this asset pack changes no finance reconciliation, invoices, subscriptions, payouts, refunds, or reporting workflows.                              | explicit finance scope rationale              | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: text-bearing assets should be templateable or editable for later localization; no translation workflow ships here.                            | text asset policy                             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Prefer existing brand generator/static asset patterns; add no new dependency unless it materially improves reproducible asset generation.                      | dependency diff + generation notes            | `5/5`                   |
| Testing and QA automation                     | `target`     | Asset manifest, expected files, and sample-frame rendering are validated; visual handoff artifacts are owner-approved before PR gates.                         | manifest checks + screenshot/artifact handoff | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Assets support hundreds of drills and avoid uncontrolled duplication through family naming, variants, and reusable templates.                                  | asset taxonomy review                         | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Asset generation is reproducible or clearly documented, additive where possible, and rollback-safe if a variant family is rejected.                            | generation docs + PR diff                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Brand:
  - derive from existing FreeSwimming brand pack,
  - do not redraw or replace the canonical symbol without separate approval.
- Assets:
  - use explicit source/generated/public folder boundaries,
  - use a manifest for asset ID, purpose, source, and output path.
- FCP:
  - optimize exports for Final Cut Pro import and timeline use,
  - keep templates editable where practical.
- Testing:
  - validate file existence and manifest consistency,
  - provide visual artifact handoff with representative sample frames.

## Data Placement And Sync Contract

- Source assets: non-public design/video source folders.
- Generated FCP-ready assets: child-owned generated folder under docs or a clearly named asset output folder.
- Public runtime assets: only if explicitly approved; otherwise keep production assets out of runtime.
- Sync: regeneration must be deterministic or documented enough for manual reproduction.
- Retention: no private footage or personal data in reusable assets.

## Identity And Rename Contract

- Stable asset IDs must be assigned before use in FCP templates.
- Human-readable labels can change, but asset IDs should not be repurposed.
- New geometry or behavior requires a new asset family.
- Deprecated assets must remain documented until projects using them are migrated.

## Scope

- Create asset families and documentation.
- Create or update manifest.
- Capture representative visual artifact handoff.

## Out Of Scope

- Full lesson edit.
- Verified FCP recipe runbook.
- Runtime website integration unless separately scoped.
- New brand direction.

## Acceptance Criteria

1. Asset pack covers all required overlay and branding families.
2. Assets are reusable, scalable, editable where practical, and FCP-friendly.
3. Underwater and mobile readability are proven with sample frames.
4. Asset IDs and folders support fast search and 100+ drills.
5. Existing FreeSwimming brand remains source of truth.
6. Visual artifact handoff is approved before PR gates.

## Validation

- `git diff --check`
- `npm run lint:briefs`
- asset manifest/file checks if implemented
- visual artifact handoff
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

N/A because this asset pack changes internal production assets only and no user/admin app workflow labels, actions, recovery behavior, Help/Guide content, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created asset-system child brief for reusable FCP-ready overlays, watermarks, lower thirds, title cards, and visual coaching graphics | next: execute after Phase 1 defines exact asset requirements`
- `2026-05-08 | dependency ready | Phase 1 merged in PR #648 and defines multi-format asset requirements for 16:9, 9:16, and 1:1 outputs | next: execute this asset-pack child brief when ready`
