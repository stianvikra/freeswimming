# Task Brief: Visual Coaching Manual FCP/Motion Pilot Template System (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-manual-fcp-motion-pilot-template-system-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-06-24`

## Brief Audit Record

- `last_audited`: `2026-06-24`
- `base`: `main@2a24c56a`
- `audit_status`: `in_progress_manual_asset_style_guide`
- `decision`: Use this brief as the next visual-coaching execution path after the blocked generated asset-pack attempt, but first create a precise video asset style guide from the current app design system before more FCP/Motion asset work.
- `reason`: The manual FCP test proved the label direction but also showed that FCP generator primitives are too imprecise for 10/10 reusable asset construction. The useful next step is a stable style guide that translates the current app font, palette, brand assets, and overlay rules into a Motion/ChatGPT-ready asset brief.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, verification lanes, Final Cut Pro/Motion behavior, Phase 1 visual-coaching docs, brand assets, output artifact rules, route labels, Help/Guide, runbooks, or support surfaces change.

## Goal

Build one owner-approved visual coaching template pilot manually in Final Cut Pro and/or Motion, using real swim frames, before any reusable repo asset pack is regenerated.

## Pre-Implementation Owner Explanation

Codex skal ikke lage en full video eller en automatisk asset pack i denne slicen. Codex skal guide eieren ett steg om gangen mens eieren lager et lite sett med redigerbare FCP/Motion-assets manuelt pa ekte svommebilder.

Hvorfor det betyr noe: overlays for svommevideo ma fungere pa bade lyse bassengbilder og morkere undervannsbilder. Hvis vi masseproduserer assets for tidlig, risikerer vi at piler, labels og body-lines ikke er lesbare eller redigerbare nar de faktisk brukes i Final Cut Pro.

Utenfor scope er full leksjonsredigering, publisering, nettsideintegrasjon, automatisert asset-pack-generering, nye repo-scripts, raw private footage i repoet og endringer i FreeSwimming-brandet.

Fremoverkompatibilitet: pilotfamilien skal bevise en gjenbrukbar visuell grammatikk som senere kan skaleres til flere drills, formater og redigerere. Nye assets skal enten folge samme familie/variant-kontrakt eller kreve en eksplisitt ny template-familie.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 source: [Visual Coaching Phase 1](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10.md)
- Blocked generated-pack attempt: [FCP-Ready Asset Pack And Template System](/Users/stianvikra/freeswimming/docs/task-briefs/blocked/2026-05-08-visual-coaching-fcp-ready-asset-pack-and-template-system-10-10.md)
- Manual pilot asset guide: [Manual Pilot Asset Style Guide](/Users/stianvikra/freeswimming/docs/video-production/visual-coaching-system/manual-pilot-asset-style-guide.md)

## Scope Summary

This is a manual visual-quality slice. The output should be a small, real FCP/Motion pilot that proves the look and editability before scaling.

Target pilot components:

- one watermark / brand mark placement,
- one coaching label with matched light-footage and dark-footage variants,
- one stretchable/editable direction arrow,
- one body-line or catch-path guide,
- one mistake/correction state,
- one above-water/light-pool placement rule for the light-footage variant,
- one underwater/dark-or-cyan placement rule for the dark-footage variant,
- one short validation film assembled from real frames before full lesson work,
- screenshot or exported still evidence from real frames.

## Contrast Variant Contract

The pilot must create one visual family with two contrast variants for each approved component. The variants should be visually identical in geometry, naming, motion behavior, editable controls, and placement logic; only contrast treatment may differ.

Required variants:

- `light-footage`: for bright pool surface, white splash, pale deck, and bright cyan underwater frames.
- `dark-footage`: for darker underwater, shadowed water, navy/black backgrounds, or low-contrast body footage.

Required pilot asset IDs:

| Component                 | Light-footage ID                           | Dark-footage ID                           | Required editable controls                                  |
| ------------------------- | ------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------- |
| Watermark / brand mark    | `vc-pilot-watermark-light-footage`         | `vc-pilot-watermark-dark-footage`         | position, scale, opacity, safe-margin preset                |
| Coaching label            | `vc-pilot-label-light-footage`             | `vc-pilot-label-dark-footage`             | text, position, width, opacity, emphasis state              |
| Direction arrow           | `vc-pilot-arrow-light-footage`             | `vc-pilot-arrow-dark-footage`             | start/end position, length, rotation, color/contrast preset |
| Body-line or catch guide  | `vc-pilot-body-guide-light-footage`        | `vc-pilot-body-guide-dark-footage`        | start/end position, curvature/angle, opacity                |
| Mistake/correction marker | `vc-pilot-correction-marker-light-footage` | `vc-pilot-correction-marker-dark-footage` | label text, state, position, non-color cue, opacity         |

Variant rules:

- Do not create separate visual designs for light and dark footage.
- Do not let the dark variant become heavier or more decorative than the light variant.
- Text-bearing assets must remain editable as text or documented FCP/Motion parameters.
- Mistake/correction meaning must use shape, icon, label, or pattern in addition to color.
- Every component must remain swimmer-first: no overlay may hide the catch, head position, shoulder line, hip line, or main correction area.

## Validation Film And Still Handoff

Before scaling to a full lesson or asset pack, create one short validation film:

- target length: `20-40` seconds;
- primary format: `16:9`;
- optional second pass: one `9:16` crop/cutdown if the first pass is visually promising;
- include at least one bright above-water or bright-pool frame;
- include at least one underwater or darker/cyan frame;
- include one moving segment, one slow-motion segment, and one freeze-frame or hold;
- include one intentionally dense "too much on screen" moment to define the upper limit.

Required exported evidence:

- `after-light-footage-16x9.*`: light variant on bright footage;
- `after-dark-footage-16x9.*`: dark variant on underwater/darker footage;
- `after-motion-segment-16x9.*`: overlay readability during movement or slow motion;
- `after-overload-limit-16x9.*`: deliberately dense frame used to decide what not to do;
- optional `after-light-footage-9x16.*` and `after-dark-footage-9x16.*` if vertical crop is tested.

The screenshot/artifact folder must follow:

- `output/visual-coaching-manual-fcp-motion-pilot-YYYY-MM-DD-HHMMSS/`

Owner review must happen from full-resolution exported evidence, not only compressed chat previews or the FCP timeline.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Incident response and support operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                           | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Pilot defines one concrete visual coaching template set and the next production path without restarting the whole system.                                    | FCP/Motion pilot notes + parent checkpoint       | `5/5`                   |
| UX flow clarity                               | `target`     | Editor can identify which overlay and which contrast variant to use for focus text, arrow, body guide, mistake/correction, watermark, and footage type.      | manual pilot recipe + owner review               | `5/5`                   |
| Visual design quality                         | `target`     | Pilot looks premium, minimal, readable, and brand-consistent on realistic bright and dark/underwater swim frames.                                            | exported validation film stills + owner approval | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Template names, version labels, editable parameters, contrast variants, and pilot asset IDs are stable and not repurposed from the blocked pack.             | naming contract + pilot inventory                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, CRUD, publishing, or operator UI workflow.                                                                   | explicit scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Text and visual cues are readable on mobile exports across light/dark variants; mistake/correction meaning is not color-only.                                | mobile still review + non-color cue check        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no website runtime route or bundle changes; future exports should remain external production assets unless explicitly scoped.               | runtime path review                              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | FCP library, Motion template location, exported stills, repo docs, and future generated assets have explicit boundaries.                                     | data placement notes + screenshot artifact path  | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no public runtime asset path, route cache, CDN cache, or invalidation behavior changes in this manual production slice.                          | explicit scope rationale                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Pilot documents what to do if FCP media links break, Motion templates are missing, or a placement fails on bright/underwater footage.                        | troubleshooting notes                            | `5/5`                   |
| Security and authz                            | `target`     | No protected app path changes; no `.fcpbundle` internals are patched; no raw private footage or generated production files are placed in `public/`.          | path audit + recipe boundary notes               | `5/5`                   |
| Privacy and compliance                        | `target`     | Pilot artifacts avoid credentials, private URLs, customer footage, and unnecessary local absolute paths in committed docs.                                   | artifact review + docs diff                      | `5/5`                   |
| Content governance                            | `target`     | Pilot records owner-approved visual decisions, version, source relationship to Phase 1, and conditions for regenerating a repo asset pack.                   | decision log + pilot notes                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status, action, support path, or editor UI is introduced.                                                                     | explicit scope rationale                         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the manual pilot creates internal production assets only and no public route, metadata, sitemap, robots, or crawlable content.                   | explicit scope rationale                         | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future public videos may become clearer, but this slice publishes no AI-discoverable page or structured content.                            | scope rationale                                  | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice adds no product analytics events, dashboards, or KPI reporting.                                                                       | explicit scope rationale                         | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: better coaching videos support course value later, but this slice changes no checkout, entitlement, pricing, billing, or revenue reporting. | scope rationale                                  | `4/5`                   |
| Incident response and support operations      | `target`     | Pilot notes must make it clear how to recover missing templates/assets and where the approved reference stills live.                                         | troubleshooting section + artifact link          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this manual video-template slice changes no finance reconciliation, invoices, refunds, payouts, subscriptions, or reporting workflow.            | explicit finance scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Text-bearing labels must remain editable as text or documented parameters so future localization does not require rebuilding geometry.                       | Motion/FCP parameter review                      | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use FCP/Motion-native editable tools first; add no repo dependency or generator until the manual reference is approved.                                      | dependency diff + recipe notes                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Manual screenshot/export handoff is owner-approved before PR gates; changed briefs pass brief lint and diff checks.                                          | screenshot handoff + `npm run lint:briefs:all`   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pilot proves a reusable template grammar before scaling to 100+ drills, avoiding mass production of weak one-off assets.                                     | pilot reuse checklist                            | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Repo changes stay docs-only until approved visuals exist; rejected pilot files can be discarded without runtime or FCP library mutation.                     | git diff + rollback notes                        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- FCP/Motion:
  - build the first usable overlay look with native FCP/Motion controls,
  - prioritize editable text, published controls, stretchable arrow geometry, and simple transform controls,
  - build matched `light-footage` and `dark-footage` variants for every approved component,
  - validate the variants in a short real-footage film before any full lesson or asset-pack work,
  - do not automate writes into `.fcpbundle`.
- Brand:
  - use the existing FreeSwimming symbol and Phase 1 brand-extension rules,
  - do not create a new sub-brand.
- Repo:
  - commit docs, decision records, recipes, and approved still references only,
  - do not commit raw private video or large FCP libraries,
  - do not regenerate a repo asset pack until this pilot is approved.
- Testing:
  - visual evidence is manual screenshot/export handoff,
  - docs-only checks validate brief and repo hygiene.

## Data Placement And Sync Contract

- FCP/Motion working files: local production workspace, not committed unless explicitly approved and small enough for repo policy.
- Exported validation film and review stills: local `output/visual-coaching-manual-fcp-motion-pilot-YYYY-MM-DD-HHMMSS/` artifact folder for owner review.
- Repo docs: pilot decisions, recipe notes, naming, and recovery instructions.
- Public runtime assets: none in this slice.
- Sync: manual FCP/Motion changes are the source until an approved recipe explains export/regeneration.
- Retention: no private raw footage, customer data, credentials, private URLs, or unnecessary absolute local paths in committed docs.

## Identity And Rename Contract

- Pilot template family prefix: `vc-pilot-`.
- Approved reusable family prefix after owner approval: `vc-template-`.
- Contrast variant suffixes: `light-footage` and `dark-footage`.
- Human-readable labels can change; stable template IDs should not be repurposed.
- A materially different visual behavior requires a new template family, not an in-place rename.
- Blocked generated-pack asset IDs are not production identifiers.

## Scope

- Guide the owner through a manual FCP/Motion pilot one actionable step at a time.
- Create matched light-footage and dark-footage variants for each pilot component.
- Assemble a short validation film before any full lesson or automated asset-pack work.
- Capture or reference owner-exported stills showing the pilot on realistic swim frames.
- Record the final approved visual decisions and rejected alternatives.
- Define whether a future repo-generated asset pack should be rebuilt from the pilot.

## Out Of Scope

- Automated asset-pack generation.
- Full lesson editing.
- Full final video publishing.
- Public website integration.
- Direct `.fcpbundle` mutation.
- Bulk Motion template library rollout.
- New brand direction.

## Acceptance Criteria

1. One FCP/Motion pilot comp shows the approved overlay look on realistic bright/underwater swim frames.
2. Each approved component has matched `light-footage` and `dark-footage` variants with the same geometry and editable controls.
3. Arrow behavior is editable/stretchable in the editor, not only a fixed PNG.
4. Text labels are editable and readable on mobile-size review.
5. Brand mark placement works without hiding swimmer/body-line information.
6. Mistake/correction meaning does not rely on color only.
7. Above-water/light and underwater/dark placement rules are documented separately.
8. A `20-40` second validation film or equivalent exported sequence proves the variants on real footage.
9. Exported stills include light, dark, motion/slow-motion, and overload-limit evidence.
10. Owner approves the visual evidence before any PR gate or future asset-pack rebuild.
11. The brief records whether automation should be retried, deferred, or avoided.

## Validation

- manual FCP/Motion screenshot or still-export handoff
- short validation film or equivalent exported sequence review
- `git diff --check`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr` after owner visual approval or explicit waiver
- `npm run verify:pre-merge` before merge readiness

## Help / Guide Impact

N/A because this slice changes internal video-production workflow only and no user/admin workflow labels, actions, recovery behavior, Help/Guide content, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created after generated asset-pack visual gate failed; next source of truth should be a manually built FCP/Motion pilot on realistic swim frames | next: owner and assistant build one FCP/Motion pilot step by step`
- `2026-06-23 | contrast-variant pilot updated | owner clarified that the pilot should create identical light-footage and dark-footage variants for each asset, then assemble a short validation film and export stills before scaling; brief now requires matched contrast variants, validation-film evidence, and full-resolution still handoff | next: when owner explicitly starts this video slice, guide one manual FCP/Motion step at a time`
- `2026-06-24 | in-progress | moved brief to in-progress on branch docs/video-asset-guide and created a current-app-design audit path for a manual video asset style guide; FCP manual label test reached a provisional 8.5/10 direction but FCP primitive editing was judged too imprecise for final reusable assets | next: finish docs-only style guide validation, then use the guide for Motion/ChatGPT asset production before renewed FCP placement/export evidence`
