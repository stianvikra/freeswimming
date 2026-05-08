# Task Brief: Visual Coaching Phase 1 - Brand Overlay Language And Production Architecture (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Completion Status

This Phase 1 docs-only execution slice is complete. It created documentation architecture and design rules only. It did not create the reusable asset pack or claim verified Final Cut Pro recipes.

## Goal

Define the FreeSwimming video brand extension, visual coaching overlay language, lesson structure, production folder architecture, naming conventions, and export system before asset or FCP-template production starts.

## Parent Brief

- [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)

## Brand Dependency

Use the existing FreeSwimming brand system as the source of truth:

- [FreeSwimming Brand Usage](/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md)
- [Brand Logo System And Site Typography](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-brand-logo-system-and-site-typography-10-10.md)

Phase 1 must specify video usage for existing brand assets, including logo watermark, intro/outro lockups, lower-third logo treatment, underwater high-contrast needs, and mobile-safe placement. It must not introduce a new brand direction.

## Multi-Format Production Requirement

Phase 1 must assume that the same coaching system will produce multiple video formats, not only one course-video format.

Required baseline formats:

- `16:9` course and website video:
  - primary long-form course lessons,
  - drill breakdowns,
  - desktop/tablet review,
  - YouTube-style landscape exports where relevant.
- `9:16` social video:
  - Shorts/Reels/TikTok-style vertical cutdowns,
  - mobile-first technique cues,
  - high-contrast overlays with tighter safe zones.
- `1:1` square social video:
  - feed posts,
  - ad/teaser clips,
  - compact before/after comparisons.

Phase 1 docs must define how one visual language adapts across these formats without becoming three separate design systems.

## Additional Required Rules

Include the following Phase 1 rules before asset production starts:

- footage matrix:
  - underwater side GoPro,
  - underwater front GoPro,
  - above-water iPhone/iPad,
  - low-visibility or poor-light footage,
  - wall/lane-line shots where logo placement or alignment overlays may appear.
- subtitle and caption policy:
  - captions must not collide with coaching overlays,
  - captions must remain readable on mobile,
  - text-bearing overlays must remain localizable later.
- audio and voiceover policy:
  - define voiceover, pool sound, optional music, and basic loudness/review expectations,
  - avoid audio rules that require unverified platform-specific assumptions.
- review checklist:
  - course and social exports must be checked on desktop and phone,
  - swimmer visibility, overlay contrast, logo placement, caption readability, and export naming must be checked before final approval.
- explicit `Do not use` rules:
  - too many arrows,
  - heavy boxes over the swimmer,
  - logo over the swimmer or key movement,
  - decorative effects that do not teach,
  - tiny text,
  - color-only mistake/correction meaning.

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
- `format-and-channel-matrix.md`
- `audio-caption-policy.md`
- `review-checklist.md`

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                           | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Phase 1 docs make the production system understandable by separating brand extension, overlays, lessons, formats, naming, exports, and recipe-verification planning.         | Phase 1 doc review                       | `5/5`                   |
| UX flow clarity                               | `target`     | Future editors can follow the docs to know what to design, what not to design, how to adapt 16:9/9:16/1:1 formats, how to name files, and how a lesson should flow.          | owner review + doc checklist             | `5/5`                   |
| Visual design quality                         | `target`     | Style rules define premium, minimal, swimmer-first video design with contrast, hierarchy, safe margins, line weights, opacity, motion principles, and format-safe placement. | visual style guide docs                  | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no runtime data changes; production rules must avoid conflicting naming or source-of-truth ambiguity.                                                       | naming architecture review               | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because Phase 1 changes no admin editor, content CRUD, publishing, or operator workflow.                                                                                 | explicit scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Overlay language includes mobile readability, caption policy, contrast, minimum text size, non-color-only mistake/correct states, and safe margins for 16:9/9:16/1:1.        | overlay-language acceptance              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: Phase 1 creates docs and must avoid adding heavy runtime assets or website payload.                                                                         | docs-only diff review                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Documentation defines source assets, generated assets, FCP library/project files, exports, archives, and public-runtime boundaries.                                          | production architecture docs             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no runtime cache changes; export and asset naming rules should support deterministic replacement/versioning later.                                          | naming/export docs                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Docs define unknowns, decision points, and how unverified FCP steps are kept out of production recipe docs.                                                                  | unknowns + verification plan             | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no app auth changes; docs must keep private footage, private project files, and editable source assets out of public runtime paths.                         | data placement docs                      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: docs must avoid embedding personal footage data, private file links, credentials, or customer-identifying production details.                               | docs review                              | `4/5`                   |
| Content governance                            | `target`     | Phase 1 creates a clear source-of-truth for visual coaching language, format policy, file naming, export naming, and lesson structure.                                       | docs review                              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status model, or support-surface editing is changed.                                                                                          | explicit scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Phase 1 creates internal production docs and no public route, metadata, sitemap, robots, or crawlable page.                                                      | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future public video pages may benefit from clearer semantic content, but Phase 1 changes no public AI-discoverable surface.                                 | scope rationale                          | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: Phase 1 may define future production metrics, but it does not add app analytics events.                                                                     | optional KPI notes                       | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: better lesson videos support course value, but no pricing, entitlement, checkout, invoice, or revenue logic changes.                                        | scope rationale                          | `4/5`                   |
| Incident response and support operations      | `target`     | Docs include decision log and troubleshooting ownership for production-system drift, missing assets, and unverified recipe gaps.                                             | unknowns/decisions doc                   | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because Phase 1 changes no billing, finance reconciliation, payouts, refunds, invoices, subscriptions, or reporting workflows.                                           | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: text overlays and lower-third rules should be structurally localizable later, but no translation workflow ships.                                            | overlay copy rules                       | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Markdown docs and existing brand assets; do not add new video tooling, dependencies, scripts, or runtime code in Phase 1.                                                | diff review                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs pass brief lint, docs-only verification, and owner review for completeness before moving to asset production.                                                           | `npm run lint:briefs:all` + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Folder/naming/export architecture supports hundreds of drills and future editors without manual recreation or search friction.                                               | production architecture review           | `5/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: Phase 1 is docs-only and revertable; later asset/runtime slices must define rollback separately.                                                            | PR diff                                  | `4/5`                   |

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
- Define format and channel rules for `16:9`, `9:16`, and `1:1`.
- Define footage-source handling for underwater side, underwater front, and above-water footage.
- Define subtitle/caption and audio/voiceover rules.
- Define lesson blueprint and pacing.
- Define file structure and naming.
- Define export structure.
- Define asset requirements.
- Define verification plan for future FCP recipes.
- Define production review checklist and explicit anti-patterns.

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
4. Format matrix defines `16:9`, `9:16`, and `1:1` use cases, safe zones, crop guidance, overlay placement, and export naming.
5. Footage matrix covers underwater side, underwater front, above-water, low-visibility, and wall/lane-line shots.
6. Caption/subtitle and audio/voiceover policies are defined with mobile readability and localization readiness.
7. Lesson blueprint defines intro, learning objective, normal-speed demo, slow-motion breakdown, freeze frame, common mistake, correction, drill, practice cue, course export, and social cutdown.
8. Production architecture defines folder structure, naming, exports, versioning, and archive rules.
9. Review checklist defines desktop/mobile, course/social, visual, audio, caption, and export-name checks.
10. Existing FreeSwimming brand system remains source of truth.
11. FCP recipe verification is explicitly deferred to the recipe child brief.
12. Docs-only validation passes.

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
- `2026-05-08 | in-progress | owner approved execution and added requirement that the system must support course videos plus social formats; expanded Phase 1 scope to cover 16:9, 9:16, and 1:1 formats, footage matrix, caption/audio rules, review checklist, and anti-patterns before asset production | next: create docs/video-production/visual-coaching-system Phase 1 documentation, run docs-only gates, then open PR`
- `2026-05-08 | local validation | created the Phase 1 documentation set under docs/video-production/visual-coaching-system and updated parent/child brief links; local docs-only validation passed: git diff --check PASS, npm run lint:briefs:all PASS, npm run verify:pre-pr PASS (docs-only lane) | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
- `2026-05-08 | 40471bb (main) | PR #648 merged after local npm run verify:pre-pr PASS, local npm run verify:pre-merge PASS, and required GitHub checks PASS; Phase 1 system docs are now on main under docs/video-production/visual-coaching-system | next: move to asset-pack child brief when ready`

## Closeout Record

- `PR`: `#648`
- `merge`: `docs/visual-coaching-phase-1` -> `main`
- `commit`: `40471bb`
- `result`: Phase 1 visual coaching system documentation is complete for brand extension, overlay language, 16:9/9:16/1:1 formats, lesson blueprints, production architecture, naming, exports, asset requirements, audio/caption policy, FCP recipe verification planning, review checklist, and unknowns/decisions.
- `validation`: `npm run verify:pre-pr` PASS (docs-only lane), `npm run verify:pre-merge` PASS (docs-only lane), GitHub required checks PASS.
- `10/10 claim`: yes for the Phase 1 docs-only scope.

## Achieved Target Scores

| Category                                 | Score | Evidence                                                                                                           |
| ---------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| Product goals and IA                     | `5/5` | Phase 1 docs separate brand, overlays, formats, lessons, naming, exports, and FCP verification.                    |
| UX flow clarity                          | `5/5` | Future editors have one documented map for what to design, what not to design, and how to adapt formats.           |
| Visual design quality                    | `5/5` | Swimmer-first, format-safe, brand-aligned overlay and anti-pattern rules are documented.                           |
| Accessibility (a11y)                     | `5/5` | Mobile readability, caption separation, contrast, safe zones, and non-color-only meaning are required.             |
| Data placement and sync boundaries       | `5/5` | Source footage, FCP libraries, generated assets, public runtime assets, and exports have explicit boundaries.      |
| Reliability and failure handling         | `5/5` | FCP verification plan, review checklist, unknowns, and troubleshooting ownership prevent unverified recipe drift.  |
| Content governance                       | `5/5` | Stable production IDs, asset IDs, format naming, export naming, and decision logging are defined.                  |
| Incident response and support operations | `5/5` | Review checklist and unknowns/decisions create repair paths for bad exports, missing assets, and recipe gaps.      |
| Stack-fit and dependency discipline      | `5/5` | Docs-only Markdown approach reused existing brand assets and added no dependencies or runtime code.                |
| Testing and QA automation                | `5/5` | `lint:briefs:all`, `verify:pre-pr`, `verify:pre-merge`, and GitHub checks passed.                                  |
| Scalability and cost efficiency          | `5/5` | Folder, naming, asset, and format architecture supports many drills and future editors without one-off recreation. |
