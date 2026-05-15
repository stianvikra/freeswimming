# Task Brief: Visual Coaching Verified Final Cut Pro Recipes (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-verified-final-cut-pro-recipes-10-10`
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

Create a verified Final Cut Pro recipe runbook for the FreeSwimming visual coaching system, with exact executable steps for multicam swim editing and coaching overlays.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 should define visual and production architecture first.
- Asset pack should provide final reusable assets before recipes are finalized.

## Verification Requirement

No hypothetical Final Cut Pro instructions are allowed. Recipes must be verified against current Final Cut Pro behavior and/or official Apple documentation before they are marked production-ready.

Every recipe must include:

- exact menu/tool names,
- exact shortcut when stable,
- inspector fields/settings,
- order of operations,
- expected result,
- troubleshooting notes,
- version/date verified.

## Required Recipes

- import and organize footage,
- multicam sync,
- angle naming and selection,
- local sync correction,
- drill extraction,
- timeline cleanup,
- add logo watermark,
- place logo on a wall realistically,
- distort logo to match perspective,
- create slow motion,
- create freeze frame,
- add arrows,
- add text labels,
- add highlight shapes,
- use blend modes,
- adjust opacity,
- create split screen,
- zoom into technique,
- create before/after comparison,
- export final lesson videos.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                              | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Runbook covers the full FCP production path from import/multicam through overlays and export.                                                   | recipe index + coverage matrix                | `5/5`                   |
| UX flow clarity                               | `target`     | A user without Codex context or advanced editing experience can execute each recipe step-by-step.                                               | manual execution review                       | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: recipes execute the approved visual system but do not define the visual direction.                                             | sample outputs                                | `4/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no app data changes; recipe state and naming must not corrupt project organization or source footage lineage.                  | project workflow review                       | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because FCP recipes do not change admin editor surfaces, CRUD, publishing, or operator app workflows.                                       | explicit scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Recipes preserve overlay readability, contrast, mobile-safe text size, and non-color-only guidance when exporting videos.                       | sample export review                          | `5/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this runbook changes no website route, bundle, CWV budget, or runtime payload.                                                      | explicit scope rationale                      | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Recipes distinguish source media, optimized/proxy media, FCP libraries, generated assets, exports, and archives.                                | workflow docs                                 | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this runbook changes no app cache, revalidation, data fetching, or runtime freshness behavior.                                      | explicit scope rationale                      | `N/A`                   |
| Reliability and failure handling              | `target`     | Each recipe includes troubleshooting for common FCP failure modes such as bad sync, missing asset, wrong blend, bad export, or unreadable text. | troubleshooting sections                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: recipes must not instruct editors to store credentials, private links, or source footage in public/runtime paths.              | data placement review                         | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: recipes must avoid leaking private footage metadata, personal data, or unapproved raw clips in exported examples.              | sample/project review                         | `4/5`                   |
| Content governance                            | `target`     | Recipes have version/date verification, owner, input assets, output names, and update policy.                                                   | runbook metadata                              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, app status model, Help/Guide action, or support queue editability changes.                                       | explicit scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because FCP recipes do not change public pages, metadata, sitemap, robots, structured data, or crawlable content.                           | explicit scope rationale                      | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: exported videos may later support public content clarity, but this runbook publishes no AI-discoverable app surface.           | scope rationale                               | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because recipe docs do not add analytics events, KPI dashboards, attribution, or tracking payloads.                                         | explicit scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: professional videos support course value but do not alter checkout, entitlements, pricing, invoices, or revenue operations.    | scope rationale                               | `4/5`                   |
| Incident response and support operations      | `target`     | Runbook includes recovery steps for failed exports, missing media/assets, sync drift, and unreadable overlay outputs.                           | troubleshooting review                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because FCP recipe docs change no finance reconciliation, payouts, refunds, subscriptions, invoices, or reporting workflows.                | explicit finance scope rationale              | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: text recipe steps should keep labels editable and localizable later, but no translation workflow ships here.                   | recipe text policy                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use real Final Cut Pro workflows and official/current terminology; do not invent unsupported steps or require unnecessary plugins.              | verification notes + official doc links/tests | `5/5`                   |
| Testing and QA automation                     | `target`     | Recipes are manually executed or verified, sample outputs are reviewed, and docs gates pass.                                                    | execution checklist + verify gates            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Recipes optimize low-click repeatable editing for many drills and future editors.                                                               | workflow timing/repeatability review          | `5/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: runbook changes are docs-only and revertable; future project templates/assets must have versioning and rollback rules.         | PR diff + version notes                       | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- External tool:
  - Final Cut Pro is the primary tool,
  - recipe claims must be verified against actual FCP behavior and/or official Apple documentation.
- Documentation:
  - store runbook in `docs/video-production/visual-coaching-system/`,
  - include version/date verified.
- Assets:
  - use asset-pack IDs and paths,
  - do not require manual recreation when a reusable asset exists.
- Testing:
  - manual execution checklist is required because FCP is outside automated repo tests.

## Data Placement And Sync Contract

- Source footage: local/editor-controlled production storage, not repo unless explicitly approved.
- FCP libraries/projects: production storage with naming/versioning rules.
- Reusable recipe docs: repo Markdown.
- Exported sample artifacts: only non-sensitive approved outputs.
- Public runtime: no direct FCP library or raw footage references.

## Identity And Rename Contract

- Recipe IDs must be stable and versioned.
- FCP project/library names should include lesson/drill IDs from the production naming system.
- Human-readable recipe titles may change, but stable recipe IDs should not be repurposed.

## Scope

- Verified recipe runbook.
- Troubleshooting notes.
- Recipe coverage matrix.
- Version/date verification evidence.

## Out Of Scope

- Creating the asset pack.
- Editing the full pilot lesson unless used only for verification evidence.
- Website/runtime changes.
- Unverified generic video-editing advice.

## Acceptance Criteria

1. Every required recipe has exact executable FCP steps.
2. Recipes use real FCP terminology and current UI behavior.
3. Recipes include troubleshooting.
4. Recipes are verified and marked with version/date.
5. No recipe depends on prior Codex context.
6. Docs-only gates pass.

## Validation

- manual FCP execution checklist
- official/current FCP documentation references where needed
- sample output review
- `git diff --check`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

N/A because this runbook is internal production documentation and does not change app Help/Guide content, user/admin labels, workflow actions, recovery behavior, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created verified-FCP-recipes child brief to prevent untested or fabricated Final Cut Pro instructions from entering the production system | next: execute after Phase 1 and asset pack are ready enough for recipe verification`
