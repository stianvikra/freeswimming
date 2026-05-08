# Task Brief: Visual Coaching Phase 1 - Brand Overlay Language And Production Architecture (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Draft Status

This is the recommended first execution slice. It should create documentation architecture and design rules only. It should not create the reusable asset pack or claim verified Final Cut Pro recipes yet.

## Goal

Define the FreeSwimming video brand extension, visual coaching overlay language, lesson structure, production folder architecture, naming conventions, and export system before asset or FCP-template production starts.

## Parent Brief

- [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)

## Brand Dependency

Use the existing FreeSwimming brand system as the source of truth:

- [FreeSwimming Brand Usage](/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md)
- [Brand Logo System And Site Typography](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-brand-logo-system-and-site-typography-10-10.md)

Phase 1 must specify video usage for existing brand assets, including logo watermark, intro/outro lockups, lower-third logo treatment, underwater high-contrast needs, and mobile-safe placement. It must not introduce a new brand direction.

## Required Outputs

Create Phase 1 documentation under a dedicated folder such as `docs/video-production/visual-coaching-system/`:

- `README.md`
- `brand-extension.md`
- `overlay-language.md`
- `lesson-blueprints.md`
- `production-architecture.md`
- `naming-and-file-structure.md`
- `export-system.md`
- `asset-requirements.md`
- `fcp-recipe-verification-plan.md`
- `unknowns-and-decisions.md`

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                          | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Phase 1 docs make the production system understandable by separating brand extension, overlays, lessons, naming, exports, and recipe-verification planning. | Phase 1 doc review                       | `5/5`                   |
| UX flow clarity                               | `target`     | Future editors can follow the docs to know what to design, what not to design, how to name files, and how a lesson should flow.                             | owner review + doc checklist             | `5/5`                   |
| Visual design quality                         | `target`     | Style rules define premium, minimal, swimmer-first video design with contrast, hierarchy, safe margins, line weights, opacity, and motion principles.       | visual style guide docs                  | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no runtime data changes; production rules must avoid conflicting naming or source-of-truth ambiguity.                                      | naming architecture review               | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because Phase 1 changes no admin editor, content CRUD, publishing, or operator workflow.                                                                | explicit scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Overlay language includes mobile readability, contrast, minimum text size, non-color-only mistake/correct states, and safe margins.                         | overlay-language acceptance              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: Phase 1 creates docs and must avoid adding heavy runtime assets or website payload.                                                        | docs-only diff review                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Documentation defines source assets, generated assets, FCP library/project files, exports, archives, and public-runtime boundaries.                         | production architecture docs             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no runtime cache changes; export and asset naming rules should support deterministic replacement/versioning later.                         | naming/export docs                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Docs define unknowns, decision points, and how unverified FCP steps are kept out of production recipe docs.                                                 | unknowns + verification plan             | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no app auth changes; docs must keep private footage, private project files, and editable source assets out of public runtime paths.        | data placement docs                      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: docs must avoid embedding personal footage data, private file links, credentials, or customer-identifying production details.              | docs review                              | `4/5`                   |
| Content governance                            | `target`     | Phase 1 creates a clear source-of-truth for visual coaching language, file naming, export naming, and lesson structure.                                     | docs review                              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status model, or support-surface editing is changed.                                                                         | explicit scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Phase 1 creates internal production docs and no public route, metadata, sitemap, robots, or crawlable page.                                     | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future public video pages may benefit from clearer semantic content, but Phase 1 changes no public AI-discoverable surface.                | scope rationale                          | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: Phase 1 may define future production metrics, but it does not add app analytics events.                                                    | optional KPI notes                       | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: better lesson videos support course value, but no pricing, entitlement, checkout, invoice, or revenue logic changes.                       | scope rationale                          | `4/5`                   |
| Incident response and support operations      | `target`     | Docs include decision log and troubleshooting ownership for production-system drift, missing assets, and unverified recipe gaps.                            | unknowns/decisions doc                   | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because Phase 1 changes no billing, finance reconciliation, payouts, refunds, invoices, subscriptions, or reporting workflows.                          | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: text overlays and lower-third rules should be structurally localizable later, but no translation workflow ships.                           | overlay copy rules                       | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Markdown docs and existing brand assets; do not add new video tooling, dependencies, scripts, or runtime code in Phase 1.                               | diff review                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs pass brief lint, docs-only verification, and owner review for completeness before moving to asset production.                                          | `npm run lint:briefs:all` + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Folder/naming/export architecture supports hundreds of drills and future editors without manual recreation or search friction.                              | production architecture review           | `5/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: Phase 1 is docs-only and revertable; later asset/runtime slices must define rollback separately.                                           | PR diff                                  | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- Documentation:
  - use Markdown under `docs/video-production/visual-coaching-system/`,
  - link parent and brand docs directly,
  - separate confirmed decisions from `Unknown / To Verify`.
- Brand:
  - derive visual rules from existing FreeSwimming brand pack,
  - preserve existing color/font/lockup source of truth.
- Video/FCP:
  - define recipe verification plan only,
  - do not publish unverified FCP recipes as final instructions.
- Assets:
  - define required asset families and output locations,
  - do not generate final assets in this phase.

## Data Placement And Sync Contract

This is docs-only planning.

- Runtime state: N/A; no app data, API, database, cache, or browser state changes.
- Documentation source: `docs/video-production/visual-coaching-system/`.
- Future source files: editable video/design sources must not live under `public/`.
- Future generated files: must be in child-owned generated/output folders with manifest or naming rules.

## Identity And Rename Contract

- FreeSwimming remains the only brand identity.
- Overlay component IDs must be stable once asset production begins.
- Human-readable lesson/drill/video titles are editable content labels, not system identity.
- New video asset families must be additive; do not repurpose existing logo IDs for materially different video behavior.

## Scope

- Define video visual style guide.
- Define overlay language and usage rules.
- Define lesson blueprint and pacing.
- Define file structure and naming.
- Define export structure.
- Define asset requirements.
- Define verification plan for future FCP recipes.

## Out Of Scope

- Creating reusable visual assets.
- Creating Final Cut Pro templates.
- Editing a pilot lesson.
- Adding website runtime code.
- Changing existing brand pack.
- Writing final FCP instructions without verification.

## Acceptance Criteria

1. Phase 1 docs exist in the agreed folder.
2. Visual language defines colors, typography, logo usage, opacity, line weights, arrow styles, highlight shapes, safe margins, and mobile-first placement.
3. Overlay system defines title card, drill label, focus label, callout, arrows, body lines, rotation indicators, catch path, kick timing, freeze-frame annotations, slow-motion indicators, split-screen labels, mistake/correction indicators, watermark, and wall-logo treatment.
4. Lesson blueprint defines intro, learning objective, normal-speed demo, slow-motion breakdown, freeze frame, common mistake, correction, drill, practice cue, and summary.
5. Production architecture defines folder structure, naming, exports, versioning, and archive rules.
6. Existing FreeSwimming brand system remains source of truth.
7. FCP recipe verification is explicitly deferred to the recipe child brief.
8. Docs-only validation passes.

## Validation

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

N/A because Phase 1 changes internal production docs only and does not change app Help/Guide content, user/admin labels, workflow actions, or recovery behavior.

## Checkpoint Log

- `2026-05-08 | planned | created as the recommended first execution slice for the visual coaching system; stops at design language and production architecture before assets/FCP recipes | next: owner selects this brief when ready to start Phase 1`
