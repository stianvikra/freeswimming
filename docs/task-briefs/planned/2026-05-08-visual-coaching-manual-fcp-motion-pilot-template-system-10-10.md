# Task Brief: Visual Coaching Manual FCP/Motion Pilot Template System (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-manual-fcp-motion-pilot-template-system-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief predates the Brief Audit Record standard and was not fully re-audited in this governance slice; current scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support-surface impact must be checked before use.
- `must_refresh_before_execution_if`: Always refresh before use, and refresh again if AGENTS.md, scorecard categories, verification lanes, route labels, Help/Guide, runbooks, support surfaces, provider facts, or relevant repo paths change.

## Goal

Build one owner-approved visual coaching template pilot manually in Final Cut Pro and/or Motion, using real swim frames, before any reusable repo asset pack is regenerated.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 source: [Visual Coaching Phase 1](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10.md)
- Blocked generated-pack attempt: [FCP-Ready Asset Pack And Template System](/Users/stianvikra/freeswimming/docs/task-briefs/blocked/2026-05-08-visual-coaching-fcp-ready-asset-pack-and-template-system-10-10.md)

## Scope Summary

This is a manual visual-quality slice. The output should be a small, real FCP/Motion pilot that proves the look and editability before scaling.

Target pilot components:

- one watermark / brand mark placement,
- one dark-backed coaching label,
- one stretchable/editable direction arrow,
- one body-line or catch-path guide,
- one mistake/correction state,
- one above-water/light-pool placement rule,
- one underwater/bright-cyan placement rule,
- screenshot or exported still evidence from real frames.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                           | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Pilot defines one concrete visual coaching template set and the next production path without restarting the whole system.                                    | FCP/Motion pilot notes + parent checkpoint      | `5/5`                   |
| UX flow clarity                               | `target`     | Editor can identify which overlay to use for focus text, arrow, body guide, mistake/correction, watermark, and bright/dark footage.                          | manual pilot recipe + owner review              | `5/5`                   |
| Visual design quality                         | `target`     | Pilot looks premium, minimal, readable, and brand-consistent on realistic bright and underwater swim frames.                                                 | exported stills/screenshots + owner approval    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Template names, version labels, editable parameters, and pilot asset IDs are stable and not repurposed from the blocked pack.                                | naming contract + pilot inventory               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, CRUD, publishing, or operator UI workflow.                                                                   | explicit scope rationale                        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Text and visual cues are readable on mobile exports; mistake/correction meaning is not color-only.                                                           | mobile still review + non-color cue check       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no website runtime route or bundle changes; future exports should remain external production assets unless explicitly scoped.               | runtime path review                             | `4/5`                   |
| Data placement and sync boundaries            | `target`     | FCP library, Motion template location, exported stills, repo docs, and future generated assets have explicit boundaries.                                     | data placement notes + screenshot artifact path | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no public runtime asset path, route cache, CDN cache, or invalidation behavior changes in this manual production slice.                          | explicit scope rationale                        | `N/A`                   |
| Reliability and failure handling              | `target`     | Pilot documents what to do if FCP media links break, Motion templates are missing, or a placement fails on bright/underwater footage.                        | troubleshooting notes                           | `5/5`                   |
| Security and authz                            | `target`     | No protected app path changes; no `.fcpbundle` internals are patched; no raw private footage or generated production files are placed in `public/`.          | path audit + recipe boundary notes              | `5/5`                   |
| Privacy and compliance                        | `target`     | Pilot artifacts avoid credentials, private URLs, customer footage, and unnecessary local absolute paths in committed docs.                                   | artifact review + docs diff                     | `5/5`                   |
| Content governance                            | `target`     | Pilot records owner-approved visual decisions, version, source relationship to Phase 1, and conditions for regenerating a repo asset pack.                   | decision log + pilot notes                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status, action, support path, or editor UI is introduced.                                                                     | explicit scope rationale                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the manual pilot creates internal production assets only and no public route, metadata, sitemap, robots, or crawlable content.                   | explicit scope rationale                        | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future public videos may become clearer, but this slice publishes no AI-discoverable page or structured content.                            | scope rationale                                 | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice adds no product analytics events, dashboards, or KPI reporting.                                                                       | explicit scope rationale                        | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: better coaching videos support course value later, but this slice changes no checkout, entitlement, pricing, billing, or revenue reporting. | scope rationale                                 | `4/5`                   |
| Incident response and support operations      | `target`     | Pilot notes must make it clear how to recover missing templates/assets and where the approved reference stills live.                                         | troubleshooting section + artifact link         | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this manual video-template slice changes no finance reconciliation, invoices, refunds, payouts, subscriptions, or reporting workflow.            | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | Text-bearing labels must remain editable as text or documented parameters so future localization does not require rebuilding geometry.                       | Motion/FCP parameter review                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use FCP/Motion-native editable tools first; add no repo dependency or generator until the manual reference is approved.                                      | dependency diff + recipe notes                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Manual screenshot/export handoff is owner-approved before PR gates; changed briefs pass brief lint and diff checks.                                          | screenshot handoff + `npm run lint:briefs:all`  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pilot proves a reusable template grammar before scaling to 100+ drills, avoiding mass production of weak one-off assets.                                     | pilot reuse checklist                           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Repo changes stay docs-only until approved visuals exist; rejected pilot files can be discarded without runtime or FCP library mutation.                     | git diff + rollback notes                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- FCP/Motion:
  - build the first usable overlay look with native FCP/Motion controls,
  - prioritize editable text, published controls, stretchable arrow geometry, and simple transform controls,
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
- Exported review stills: local `output/visual-coaching-manual-fcp-motion-pilot-YYYY-MM-DD-HHMMSS/` artifact folder for owner review.
- Repo docs: pilot decisions, recipe notes, naming, and recovery instructions.
- Public runtime assets: none in this slice.
- Sync: manual FCP/Motion changes are the source until an approved recipe explains export/regeneration.
- Retention: no private raw footage, customer data, credentials, private URLs, or unnecessary absolute local paths in committed docs.

## Identity And Rename Contract

- Pilot template family prefix: `vc-pilot-`.
- Approved reusable family prefix after owner approval: `vc-template-`.
- Human-readable labels can change; stable template IDs should not be repurposed.
- A materially different visual behavior requires a new template family, not an in-place rename.
- Blocked generated-pack asset IDs are not production identifiers.

## Scope

- Guide the owner through a manual FCP/Motion pilot one actionable step at a time.
- Capture or reference owner-exported stills showing the pilot on realistic swim frames.
- Record the final approved visual decisions and rejected alternatives.
- Define whether a future repo-generated asset pack should be rebuilt from the pilot.

## Out Of Scope

- Automated asset-pack generation.
- Full lesson editing.
- Public website integration.
- Direct `.fcpbundle` mutation.
- Bulk Motion template library rollout.
- New brand direction.

## Acceptance Criteria

1. One FCP/Motion pilot comp shows the approved overlay look on realistic bright/underwater swim frames.
2. Arrow behavior is editable/stretchable in the editor, not only a fixed PNG.
3. Text labels are editable and readable on mobile-size review.
4. Brand mark placement works without hiding swimmer/body-line information.
5. Mistake/correction meaning does not rely on color only.
6. Above-water and underwater placement rules are documented separately.
7. Owner approves the visual evidence before any PR gate or future asset-pack rebuild.
8. The brief records whether automation should be retried, deferred, or avoided.

## Validation

- manual FCP/Motion screenshot or still-export handoff
- `git diff --check`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr` after owner visual approval or explicit waiver
- `npm run verify:pre-merge` before merge readiness

## Help / Guide Impact

N/A because this slice changes internal video-production workflow only and no user/admin workflow labels, actions, recovery behavior, Help/Guide content, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created after generated asset-pack visual gate failed; next source of truth should be a manually built FCP/Motion pilot on realistic swim frames | next: owner and assistant build one FCP/Motion pilot step by step`
