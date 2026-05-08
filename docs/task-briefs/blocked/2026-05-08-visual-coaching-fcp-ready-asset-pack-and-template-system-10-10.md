# Task Brief: Visual Coaching FCP-Ready Asset Pack And Template System (Blocked)

## Metadata

- `id`: `2026-05-08-visual-coaching-fcp-ready-asset-pack-and-template-system-10-10`
- `status`: `blocked`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Document that the generated asset-pack attempt failed the visual/readability gate, remove it from the active production system, and route final asset/template work through a manual FCP/Motion pilot.

## Blocked Decision

The scripted PNG/composition asset pack is not approved for production use.

Reason:

- Owner review found the review sheets and sample comps did not communicate useful edit decisions.
- The generated overlays did not meet the required visual design, readability, or FCP editability bar on realistic swim footage.
- Stretchable arrows, editable labels, and real-template behavior should be built and judged inside FCP/Motion first.

Removed from active scope:

- `docs/video-production/visual-coaching-system/asset-pack/`
- `scripts/generate-visual-coaching-assets.mjs`
- `scripts/generate-visual-coaching-owner-review.mjs`
- `scripts/generate-visual-coaching-reference-frame-review.mjs`
- `scripts/generate-visual-coaching-review-sheets.mjs`
- `scripts/validate-visual-coaching-assets.mjs`
- generated local review artifacts under `output/visual-coaching-asset-*`, `output/visual-coaching-owner-review-*`, and `output/visual-coaching-reference-frame-review-*`

Kept source of truth:

- Phase 1 docs under `docs/video-production/visual-coaching-system/`
- parent production-system brief
- a new planned manual FCP/Motion pilot brief as the next executable slice

No `10/10` claim is made for this generated asset-pack attempt.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 source: [Visual Coaching Phase 1](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-05-08-visual-coaching-phase-1-brand-overlay-language-and-production-architecture-10-10.md)
- Replacement path: [Manual FCP/Motion Pilot Template System](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-manual-fcp-motion-pilot-template-system-10-10.md)

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a future `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                 | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Lifecycle truth is clear: generated asset-pack is blocked, not a production source, and manual FCP/Motion pilot owns the next visual decision.     | blocked brief + parent child links             | `4/5`                   |
| UX flow clarity                               | `target`     | Editors must not be directed to use ambiguous generated files; the next step is one manual pilot workflow.                                         | docs review                                    | `4/5`                   |
| Visual design quality                         | `target`     | Generated assets cannot claim production quality until real-frame FCP/Motion comps are owner-approved.                                             | owner visual rejection + removed files         | `0/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no runtime data changes; asset IDs and manifests from the failed attempt are removed from active scope.                           | git diff + deleted generated manifest          | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this blocked asset-pack decision changes no admin editor, CRUD, publishing, or operator UI workflow.                                   | explicit scope rationale                       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Readability on realistic bright and underwater swim footage remains unresolved and must be proven in the manual pilot.                             | owner image review                             | `0/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: removing generated assets avoids accidental website runtime payload growth.                                                       | public/runtime path review                     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Generated asset, review-output, FCP-ready, and runtime-public boundaries are reset; no blocked asset pack remains as a canonical source.           | file removal + docs update                     | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no public runtime asset paths, route cache, CDN cache, or invalidation behavior are introduced.                                        | explicit scope rationale                       | `N/A`                   |
| Reliability and failure handling              | `target`     | The system must fail closed by not shipping low-confidence assets; next recovery path is a manual pilot with explicit approval.                    | blocked decision + manual brief                | `4/5`                   |
| Security and authz                            | `target`     | No generated files enter `public/`, no FCP library internals are modified, and no blocked scripts remain in the active PR.                         | path audit + script removal                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Generated review artifacts are removed and no private footage, credentials, private URLs, or local absolute paths are retained as reusable assets. | output cleanup + docs review                   | `5/5`                   |
| Content governance                            | `target`     | The failed attempt is recorded as blocked instead of silently deleted, and the approved source-of-truth path is explicit.                          | blocked brief + checkpoint log                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, status, action, support path, or editor UI is introduced.                                                           | explicit scope rationale                       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this internal production decision changes no public route metadata, sitemap, robots, or crawlability.                                  | explicit scope rationale                       | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: future public videos may improve clarity, but this blocked brief publishes no AI-discoverable surface.                            | scope rationale                                | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this decision adds no product analytics events, dashboards, or KPI reporting.                                                          | explicit scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: higher video quality can support commercial outcomes later, but this brief changes no checkout, entitlement, pricing, or billing. | scope rationale                                | `4/5`                   |
| Incident response and support operations      | `target`     | The supportable recovery path is documented: do not use the blocked pack; proceed through the manual FCP/Motion pilot.                             | blocked decision + replacement brief           | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this asset-pack block changes no finance reconciliation, invoices, refunds, payouts, subscriptions, or reporting workflow.             | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Text-bearing visual assets must remain editable in FCP/Motion or documented templates before localization-ready assets are generated.              | manual pilot acceptance criteria               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | The failed generated stack is removed; no new dependency or script remains as a misleading production path.                                        | dependency/script diff                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs and docs pass brief lint and diff checks; no visual 10/10 claim is made.                                                            | `npm run lint:briefs:all` + `git diff --check` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Scale work is blocked until a single manual pilot proves the visual grammar; avoid multiplying weak one-off assets across 100+ drills.             | manual pilot link                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is simple because generated files/scripts are removed before PR gate and the blocked decision is docs-only.                               | git diff                                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Asset generation:
  - no generated pack is active,
  - no validator/generator script remains in the scoped PR,
  - future generation must be rebuilt from an approved FCP/Motion reference, not from this failed attempt.
- Brand:
  - Phase 1 and existing FreeSwimming brand remain source of truth.
- FCP/Motion:
  - exact visual decisions move to manual FCP/Motion pilot work,
  - do not patch `.fcpbundle` internals,
  - do not claim template behavior until verified in the editor.
- Testing:
  - this blocked cleanup is docs/filesystem only,
  - visual approval belongs to the replacement manual pilot brief.

## Data Placement And Sync Contract

- Runtime state: N/A; no app, API, database, cache, or browser storage changes.
- Generated asset pack: removed and not canonical.
- Local review output: removed where generated by this failed attempt.
- Public runtime assets: none.
- FCP library boundary: no direct `.fcpbundle` writes or sync behavior.
- Replacement source: the manual FCP/Motion pilot defines the next canonical visual reference.

## Identity And Rename Contract

- Blocked generated asset IDs must not be reused as approved production identifiers.
- Future asset/template IDs should be assigned only after the manual pilot is approved.
- If any old blocked filename is referenced in local FCP experiments, it should be treated as disposable and recreated under the manual pilot naming contract.

## Scope

- Move this brief to `blocked`.
- Remove generated asset-pack files, scripts, and local generated review outputs.
- Remove docs references that imply the generated pack is production-ready or active.
- Add the manual FCP/Motion pilot brief as the next path.

## Out Of Scope

- Building final visual assets.
- Installing Motion templates.
- Editing a full lesson.
- Creating public runtime website assets.
- Claiming visual 10/10 quality.

## Acceptance Criteria

1. Generated asset-pack folder and scripts are removed from active work.
2. Local generated review artifacts from the failed attempt are cleaned up.
3. Docs no longer list `asset-pack/` as an active visual coaching system folder.
4. Parent brief points to this blocked brief and the new manual FCP/Motion pilot path.
5. This brief explicitly records the failed visual gate and does not claim `10/10`.
6. Changed briefs pass brief lint.

## Validation

- `git status -sb`
- `git diff --check`
- `npm run lint:briefs:all`

## Help / Guide Impact

N/A because this cleanup changes internal production-planning docs only and no user/admin workflow labels, actions, recovery behavior, Help/Guide content, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created asset-system child brief for reusable FCP-ready overlays, watermarks, lower thirds, title cards, and visual coaching graphics | next: execute after Phase 1 defines exact asset requirements`
- `2026-05-08 | dependency ready | Phase 1 merged in PR #648 and defines multi-format asset requirements for 16:9, 9:16, and 1:1 outputs | next: execute this asset-pack child brief when ready`
- `2026-05-08 | planning update | added FCP import/sync handoff and Motion Templates boundary so the asset pack can prepare FCP-ready files without directly modifying FCP libraries or claiming verified recipe behavior | next: execute asset-pack brief when ready`
- `2026-05-08 | in-progress | owner approved execution; moved brief to in-progress on branch docs/visual-coaching-asset-pack | next: generate asset pack, manifest, usage docs, and visual artifact handoff`
- `2026-05-08 | failed visual gate | owner rejected the generated asset-pack direction because the review sheets and comps were not decision-useful, did not look 10/10 on realistic swim footage, and did not provide the needed FCP/Motion editability; generated pack, scripts, and review outputs were removed | next: execute manual FCP/Motion pilot template brief`
