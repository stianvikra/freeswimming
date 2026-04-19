# Task Brief: Poolside Note Width Reclaim, Flow, Notation, And Brand Lockup Follow-Up (10/10)

## Metadata

- `id`: `2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-19`
- `updated`: `2026-04-19`

## Goal

Close the remaining poolside-note print polish seams so portrait and landscape both reclaim unnecessary whitespace, preserve coherent step flow, use complete abbreviation coverage, and render the brand lockup with the intended proportions.

## Why This Brief Exists

- The recent poolside print passes improved content-aware sizing and header balance, but fresh manual QA found a second, narrower follow-up slice:
  - portrait still leaves avoidable right-side whitespace in some real notes,
  - landscape can still read as structurally off when `Focus` lands between swim-step groups,
  - long totals like `5000m` can stretch the total pill too far,
  - the swimmer chip still reads slightly undersized,
  - abbreviated notation is missing `S = Snorkel`,
  - the poolside brand lockup may still be rendering with the wrong aspect or `.org` placement.
- The owner has already locked the wording of the main layout finding:
  - `portrait and landscape width reclaim / fjerne unødvendig høyre whitespace`.
- This follow-up remains a print artifact/layout truthfulness pass only:
  - no workout schema change,
  - no admin-panel abbreviation management yet,
  - no builder editing workflow redesign,
  - no unrelated workout PDF parity work.

## Dependencies And Boundaries

- Upstream shipped poolside lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md)
- Adjacent future print lineage that stays separate:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-15-workout-pdf-visual-parity-with-poolside-note-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-15-workout-pdf-visual-parity-with-poolside-note-10-10.md)
- Likely implementation and validation surfaces when execution starts:
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/brand-assets.test.ts](/Users/stianvikra/freeswimming/tests/unit/brand-assets.test.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked product decisions for this brief:
  - reclaim width in both portrait and landscape rather than only portrait,
  - keep the `Focus` block from visually splitting the swim sequence in landscape,
  - add `S = Snorkel` to the abbreviation contract used by the poolside note,
  - keep admin-managed abbreviation authoring out of scope for now and defer it to a separate later brief if still wanted,
  - audit existing poolside logo/lockup asset usage first and only create/reconstruct a replacement if the canonical library cannot render the approved lockup correctly.

## Must Now

- Reclaim unnecessary right-side whitespace in both portrait and landscape.
- Keep landscape reading order truthful so `Focus` does not interrupt the main swim-step sequence awkwardly.
- Add missing poolside abbreviation coverage for `S = Snorkel`.
- Keep the total pill visually stable on longer totals such as `5000m`.
- Increase swimmer identity prominence slightly in both orientations without bloating the header.
- Fix brand lockup rendering if the current poolside note output still squeezes, mirrors, or misplaces the `.org` lockup details.

## Before Live

- Verify portrait and landscape with the same real session both feel intentionally narrow rather than roomy.
- Verify very short, medium, and long step lists still behave coherently when width is reclaimed.
- Verify the final screenshot review explains the actual visual changes before merge, not just that tests passed.

## Ongoing Cadence

- Future poolside print polish should keep whitespace reclaim and structural scan order coupled, not treat them as separate visual tweaks.
- Any future admin-managed abbreviation work should build on the shipped note contract instead of redefining it ad hoc per print surface.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                              | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The poolside note must read as one compact lane-side artifact in both orientations, with width and grouping driven by real content rather than roomy fallback space.        | screenshot review + print-preview QA    | `5/5`                   |
| UX flow clarity                               | `target`     | Portrait and landscape must both scan cleanly without dead right-side whitespace, broken reading order, or a focus rail that interrupts the swim narrative.                 | screenshot review + manual print QA     | `5/5`                   |
| Visual design quality                         | `target`     | The total pill, swimmer chip, and brand lockup must feel proportionate and optically balanced across portrait and landscape.                                                | screenshot review + browser print QA    | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: layout and abbreviation changes must preserve canonical workout structure, totals, rests, and sequence semantics with no print-truth drift.                | code review + regression coverage       | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not add admin editing controls; admin-managed abbreviations are explicitly deferred to a separate later brief if still needed.                  | explicit scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: tighter width and larger header chips must remain readable, high-contrast, and unclipped in preview and print.                                             | screenshot QA + semantic review         | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: stay inside the current print renderer and existing asset pipeline with no new heavy dependency or extra runtime fetch path.                               | diff review + verify evidence           | `4/5`                   |
| Data placement and sync boundaries            | `target`     | All changes remain presentation-only; no new saved print preferences, no new abbreviation storage layer, and no write-back from print layout into workout data.             | brief contract + code review            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: portrait/landscape output must rebuild deterministically from the current draft plus current print options after each open/render.                         | preview QA + existing renderer review   | `4/5`                   |
| Reliability and failure handling              | `supporting` | Supporting only: long totals, long swimmer names, long focus text, and long line mixes must degrade gracefully without stretched chips, clipping, or blank space.           | visual QA + targeted tests              | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this brief changes only the owner-facing print artifact composition and does not alter auth, access control, or API guards.                                     | explicit scope rationale                | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no new personal data fields, exposure rules, or storage path are introduced by this layout/notation follow-up.                                                  | explicit scope rationale                | `N/A`                   |
| Content governance                            | `target`     | Poolside notation and brand rendering must stay canonical: `S = Snorkel` is available where the abbreviated note contract needs it, and the lockup uses approved branding.  | notation audit + brand review + tests   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no operator workflow changes here; the brief deliberately excludes admin abbreviation management.                                                               | explicit scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an owner-only print preview surface, not a crawl target.                                                                                                | explicit scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the work changes no public semantic surface or model-retrieval metadata.                                                                                        | explicit scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this print-layout follow-up does not add analytics instrumentation; success is judged through screenshot QA and regression coverage.                            | explicit scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, or revenue flow is changed here.                                                                                              | explicit scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes print composition only and does not add support workflows, incident playbooks, or operational tooling.                                       | explicit scope rationale                | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting path changes in this slice.                                                                                                                | explicit scope rationale                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief tightens the current English poolside print contract only and does not add locale architecture or translation workflow.                              | explicit scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Stay inside the current poolside HTML/CSS renderer, brand manifest, and test stack with zero new dependency; prefer fixing asset selection/CSS before inventing new assets. | dependency diff + architecture review   | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests and screenshot review must lock width reclaim, landscape grouping, `S = Snorkel`, chip stability, and brand-lockup rendering before merge.                            | targeted tests + screenshot QA + verify | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the follow-up should reduce print bloat and special-case awkwardness rather than add a heavier rendering system.                                           | code review + output review             | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this remains a reversible code-only print contract change with no migration or rollout complexity.                                                         | PR diff + rollback review               | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - unchanged saved workout/session content, title, swimmer name, focus, and step structure.
- Local-only:
  - portrait vs landscape preview composition,
  - chip sizing/layout decisions,
  - abbreviation rendering choices inside the existing print artifact.
- Sync policy:
  - no new persistence of layout or abbreviation preferences,
  - no output-layout rule may write back into canonical workout/session rows,
  - all rendering changes rebuild from the current draft plus current options on each open/render.
- Retention and sensitivity:
  - unchanged from the current owner-scoped poolside preview contract,
  - no new PII fields or storage.
- Cache/invalidation:
  - output stays deterministic from the current preview model and existing renderer invalidation rules.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new entity, slug, route parameter, or persistent identifier.

## Scope

- `S = Snorkel` in the poolside abbreviation contract.
- `portrait and landscape width reclaim / fjerne unødvendig høyre whitespace`.
- Landscape layout rule so `Focus` does not split the swim-step sequence awkwardly.
- Stable max-width/proportion rule for the total pill on long totals such as `5000m`.
- Slightly larger swimmer chip treatment in portrait and landscape.
- Poolside logo/wordmark lockup audit and rendering fix if the current output still looks squeezed, mirrored, or misaligned.
- Screenshot handoff for owner review before merge when this brief is executed.

## Out Of Scope

- Admin-panel controls to add/remove/edit abbreviations.
- Workout PDF parity work outside the poolside note.
- Workout/session schema changes.
- Builder authoring UX redesign.
- New analytics, new dependencies, or a whole new print engine.

## Acceptance Criteria

1. The abbreviated poolside note contract includes `S` as `Snorkel` where that notation is rendered.
2. Portrait reclaims unnecessary right-side whitespace without clipping or making the note feel cramped.
3. Landscape reclaims unnecessary right-side whitespace without breaking the main reading order.
4. `Focus` no longer lands in a way that visually splits the swim-step sequence awkwardly in landscape.
5. The total pill remains proportionate and does not stretch excessively on longer totals like `5000m`.
6. The swimmer chip is slightly larger and more balanced in both orientations.
7. The poolside brand lockup renders with the intended aspect and `.org` placement, or the brief closes with a documented asset-audit rationale if a deeper brand-asset follow-up is needed.
8. Admin-managed abbreviation editing remains explicitly deferred to a separate later brief.

## Validation

- `npm run lint:briefs`
- targeted poolside unit coverage
- targeted brand-asset/unit coverage if lockup rendering changes
- portrait and landscape screenshot QA
- short screenshot handoff with explanation for the owner before merge
- targeted print-preview/browser QA
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local poolside preview in portrait and landscape with the same real workout draft.
- PR preview after implementation.
- Recommended matrix:
  - iPhone Safari-width viewport
  - iPad/tablet landscape viewport
  - desktop Chromium print preview
  - desktop Safari/WebKit print preview

## Constraints

- This is still a narrow poolside-note print follow-up, not a whole new print-system redesign.
- Prefer fixing layout math, grouping rules, and current asset usage before introducing replacement assets.
- Keep the smallest clean printable footprint without crowding or clipping.
- Do not broaden abbreviation work into admin tooling in this brief.

## 10/10 Quality Bar

- No avoidable right-side whitespace in portrait or landscape.
- No visually awkward interruption between main step flow and `Focus`.
- Header chips feel calm, compact, and proportionate.
- The brand lockup feels deliberate and canonical, not stretched or improvised.
- Required states remain strong:
  - long total,
  - long swimmer name,
  - long focus copy,
  - short note,
  - dense note.
- Accessibility expectations:
  - readable type sizes,
  - preserved contrast,
  - no clipped chips,
  - no hidden content caused by width reclaim.
- Business-logic expectations:
  - no workout-content drift,
  - no notation mismatch,
  - no landscape grouping that misrepresents sequence semantics.

## Checkpoint Log

- `2026-04-19 | verify-pre-pr-pass | reran full pre-pr verification after removing local generated .next QA artifacts that polluted lint scope; full lane passed including lint, typecheck, unit, build, perf budgets, and Playwright, while the approved screenshot handoff artifacts remain available under output/playwright for PR context but stay uncommitted | next: commit, push, and update/open PR for owner merge review`
- `2026-04-19 | visual-qa-pass-3 | applied the owner-aligned width rule: portrait squeezes one more notch while landscape stays calmer by default as long as it still fits within A4 width plus print margins; current dense-fixture candidate is about 98mm portrait and 160mm landscape, with remaining landscape wrapping treated as acceptable when auto mode hits the A4-fit boundary and users can tighten further through abbreviations or below-step rests | next: owner screenshot review before any PR update / verify:pre-pr pass`
- `2026-04-19 | visual-qa-pass-2 | tightened poolside width reclaim further so sizing is now line-driven with narrower physical widths in both orientations; current screenshot candidate lands at roughly 100mm portrait and 156mm landscape for the dense 5000m fixture, keeps focus below the landscape step columns, and preserves the canonical brand lockup asset while targeted unit coverage stays green | next: owner screenshot review before any PR update / verify:pre-pr pass`
- `2026-04-19 | implementation-start | moved the poolside width/flow/notation/brand follow-up into in-progress on branch \`feat/poolside-note-width-reclaim-followup\`; next is a scoped renderer pass for width reclaim, landscape flow ordering, snorkel abbreviation coverage, chip sizing, and brand-lockup proportion fixes before screenshot QA`
- `2026-04-19 | planning | created the dedicated planned follow-up brief for the remaining poolside-note print seams: width reclaim in portrait and landscape, landscape flow/order polish, missing snorkel abbreviation coverage, chip proportion cleanup, and brand-lockup rendering review; admin-managed abbreviation controls stay explicitly deferred to a separate later brief if still wanted | next: execute this brief after owner approval, then validate with screenshot handoff before merge`
