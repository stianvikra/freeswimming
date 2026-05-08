# Task Brief: Visual Coaching Production System Parent (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-production-system-parent-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Draft Status

This parent brief preserves the full Visual Coaching Production System intent. It does not authorize implementation by itself. Execute only through explicit child briefs.

## Goal

Create a complete FreeSwimming visual coaching production system for swim technique videos that is educationally clear, premium, brand-consistent, scalable, and practical in Final Cut Pro multicam workflows.

## Source Requirement Snapshot

The owner wants a real production system, not isolated video-design ideas. The system must support:

- underwater GoPro side footage,
- underwater GoPro front footage,
- iPhone/iPad above-water footage,
- Final Cut Pro multicam editing,
- drills, lessons, technique breakdowns, and marketing clips,
- slow motion, freeze frames, annotations, comparisons, and guidance overlays,
- 100+ drills and future editors/coaches without recreating visuals manually.

The system must separate two layers:

- `Design System`: visual language, colors, typography, overlays, motion style, layout rules, safe margins, logo usage, educational hierarchy.
- `FCP Recipes`: exact executable Final Cut Pro workflows using real FCP tools, menus, shortcuts, inspectors, settings, order of operations, troubleshooting, and current-version verification.

The system must preserve:

- visual style guide,
- reusable coaching overlay system,
- verified Final Cut Pro recipes,
- lesson video structure,
- brand consistency integration,
- reusable asset requirements,
- file structure and naming system,
- multicam/drill/lesson/visual-coaching workflows,
- standardized visual coaching language,
- export system,
- troubleshooting and governance.

## Brand Source Of Truth

This video system builds on the existing FreeSwimming brand system. It must not create a new brand or sub-brand.

Canonical references:

- [FreeSwimming Brand Usage](/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md)
- [Brand Logo System And Site Typography](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-brand-logo-system-and-site-typography-10-10.md)
- [Brand Rollout Across Email, Print, Apparel, Caps, And Variant Expansion](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-03-brand-rollout-email-print-apparel-caps-and-variant-expansion-10-10.md)

Existing brand assets:

- canonical symbol: `public/logos/logo_master_symbol.png`
- generated brand pack: `public/logos/brand/`
- apparel-ready exports: `public/logos/brand/apparel/`
- manifest: `public/logos/brand/manifest.json`
- typography: `Manrope`
- palette baseline: blue `#2856D7`, ink `#101828`, slate `#475467`, white `#FFFFFF`

New video assets may only be derived variants for motion/video use, not a replacement brand system.

## Child Briefs

- [Phase 1 - Brand Extension, Overlay Language, And Production Architecture](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10.md)
- [FCP-Ready Asset Pack And Template System - blocked generated-pack attempt](/Users/stianvikra/freeswimming/docs/task-briefs/blocked/2026-05-08-visual-coaching-fcp-ready-asset-pack-and-template-system-10-10.md)
- [Manual FCP/Motion Pilot Template System](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-manual-fcp-motion-pilot-template-system-10-10.md)
- [Verified Final Cut Pro Recipes](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-verified-final-cut-pro-recipes-10-10.md)
- [Pilot Technique Lesson](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-pilot-technique-lesson-10-10.md)
- [Scale Governance And Production Ops](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-scale-governance-and-production-ops-10-10.md)

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                               | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Parent and child briefs define one coherent production system with clear phase boundaries and no duplicate brand direction.                                      | brief review + child links                   | `5/5`                   |
| UX flow clarity                               | `target`     | Future editors can identify which brief owns design, assets, FCP recipes, pilot validation, and production governance.                                           | brief structure review                       | `5/5`                   |
| Visual design quality                         | `target`     | Visual direction explicitly extends the existing FreeSwimming brand and prioritizes swimmer visibility over decoration.                                          | brand-source references + phase-1 acceptance | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: this parent changes no runtime data but preserves production-system invariants and source-of-truth rules.                                       | scope review                                 | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this parent creates no admin authoring, CRUD, workflow, or operator UI changes.                                                                      | explicit scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Video overlays and future templates must preserve mobile readability, contrast, and non-color-only meaning.                                                      | child brief criteria                         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: production assets must not bloat website runtime unless a later runtime slice explicitly scopes delivery.                                       | child asset placement rules                  | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Docs, source assets, generated video assets, runtime public assets, and FCP project files have explicit ownership and placement rules.                           | data placement contract + child briefs       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: this parent changes no runtime cache, but child briefs must keep public asset paths deterministic if runtime assets are added.                  | child asset governance                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Production system must include troubleshooting ownership and avoid unverified FCP instructions or one-off asset drift.                                           | recipe and governance child criteria         | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected app paths change; source files and licensed project assets must not leak into public runtime paths by accident.                    | source/public asset boundary notes           | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: production docs must avoid personal data, raw customer footage samples, private links, or licensed media details unless explicitly approved.    | docs review                                  | `4/5`                   |
| Content governance                            | `target`     | One parent and explicit child briefs preserve the production system, asset lineage, naming, recipe verification, and update ownership.                           | brief diff + owner review                    | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin editing, publishing, moderation, support queue, or operator mutation workflow changes in this parent.                                       | explicit scope rationale                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this parent creates internal production planning docs and no public route, metadata, sitemap, robots, or crawlable content.                          | explicit scope rationale                     | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future public video pages should preserve semantic clarity, but this parent does not change public AI-discoverable routes.                      | scope rationale                              | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: future video performance analytics can be scoped later; this parent does not add tracking events.                                               | scope rationale                              | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: premium video quality supports course conversion, but this parent does not alter checkout, entitlement, pricing, billing, or revenue reporting. | scope rationale                              | `4/5`                   |
| Incident response and support operations      | `target`     | Production docs must include troubleshooting and ownership so missing assets, bad exports, or FCP recipe drift can be repaired quickly.                          | governance child brief                       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this parent does not change finance reconciliation, invoices, refunds, payouts, subscriptions, or reporting workflows.                               | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: video labels and lower-thirds should remain future-localizable, but this parent does not implement locale routing or translation.               | child copy rules                             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing brand assets, Markdown docs, static exported assets, and verified FCP workflows before introducing new tooling or dependencies.                     | dependency diff + child contracts            | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint and docs-only verification; later visual/asset/runtime slices require screenshot or artifact handoff.                             | `npm run lint:briefs:all` + verify gates     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | System supports 100+ drills and future editors through reusable assets, naming, templates, and recipe governance instead of manual recreation.                   | production architecture child brief          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Planning remains docs-only and revertable; future runtime/asset changes must define source/generated/public rollback paths.                                      | PR diff + child rollback rules               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Documentation architecture:
  - keep this parent as the source of scope and child relationships,
  - keep implementation details in child briefs.
- Brand system:
  - reuse `docs/design/brand-logo-usage.md`,
  - reuse `public/logos/brand/`,
  - do not introduce a replacement visual identity.
- Final Cut Pro:
  - recipe details must be verified in the dedicated child brief using current FCP behavior and/or official Apple documentation.
- Asset system:
  - separate editable source assets, generated FCP-ready assets, and public runtime assets.
- Testing:
  - docs-only parent uses brief lint and docs-only verification,
  - visual/asset child slices require artifact review before PR gates.

## Data Placement And Sync Contract

This parent is documentation-only.

- Runtime state: N/A; no app data, database, API, cache, or browser storage changes.
- Documentation source of truth: `docs/task-briefs/planned/` until execution starts.
- Future source assets: non-public design/video source folders only.
- Future generated assets: explicit child-owned output paths with manifests or naming conventions.
- Public runtime assets: only approved derived exports may enter `public/`.

## Identity And Rename Contract

- Canonical brand identity remains FreeSwimming.
- Existing canonical brand asset IDs remain source of truth.
- Video overlay asset IDs must be additive and descriptive.
- Course, lesson, drill, and video names remain content identifiers, not brand replacements.
- Any materially different video production family must become a new named asset family, not a silent repurpose of an old one.

## Scope

- Preserve the visual coaching production-system requirement.
- Define child execution briefs.
- Anchor video/motion work to the existing FreeSwimming brand.
- Require verified FCP recipes before recipe docs are considered complete.

## Out Of Scope

- Creating visual assets.
- Editing videos.
- Adding runtime UI.
- Changing website brand direction.
- Creating a new brand or sub-brand.
- Writing unverified Final Cut Pro instructions as if they were tested.

## Acceptance Criteria

1. Parent brief preserves full visual coaching system intent.
2. Child briefs exist for architecture, assets, FCP recipes, pilot lesson, and scale governance.
3. Existing FreeSwimming brand system is declared the source of truth.
4. New brand/sub-brand creation is explicitly out of scope.
5. Relevant scorecard categories have measurable 10/10 thresholds.
6. Changed briefs pass brief lint and docs-only gates before PR handoff.

## Validation

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

N/A because this parent creates internal production-planning briefs only and changes no user/admin workflow labels, actions, recovery behavior, Help/Guide content, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created parent brief after owner asked to preserve the full visual coaching production-system concept and relate it to the existing FreeSwimming brand system | next: review child briefs and choose Phase 1 when ready`
- `2026-05-08 | planning update | Phase 1 moved to in-progress and expanded to support course videos plus 16:9, 9:16, and 1:1 social/export formats before asset production | next: complete Phase 1 docs-only execution slice`
- `2026-05-08 | phase-1 complete | PR #648 merged Phase 1 docs under docs/video-production/visual-coaching-system and moved the child brief to done in post-merge closeout | next: execute FCP-ready asset pack child brief when ready`
- `2026-05-08 | asset-pack blocked | generated asset-pack attempt failed owner visual/readability/FCP-editability review; pack, scripts, and generated review artifacts were removed; a manual FCP/Motion pilot child brief now owns the next visual decision | next: execute manual FCP/Motion pilot brief`
