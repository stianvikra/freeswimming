# Task Brief: Visual Coaching Scale Governance And Production Ops (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-scale-governance-and-production-ops-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Turn the visual coaching system into a sustainable internal production framework for 100+ drills, multiple lessons/courses, future editors, and future video refreshes.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 architecture completed.
- Asset pack completed.
- Verified FCP recipe runbook completed.
- Pilot lesson completed and reviewed.

## Scope Summary

Define governance and operations for:

- production backlog,
- lesson/drill status workflow,
- file naming enforcement,
- asset versioning,
- FCP library/project versioning,
- export QA checklist,
- review/approval process,
- production issue log,
- update cadence,
- future editor onboarding,
- reusable templates,
- archive and recovery.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- Content governance
- Reliability and failure handling
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                           | Evidence                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Governance clearly supports many drills, multiple courses, and future editors without confusing production ownership.                        | ops docs review                  | `5/5`                   |
| UX flow clarity                               | `target`     | Editors can move from raw footage to reviewed export using a clear status workflow and checklist.                                            | workflow walkthrough             | `5/5`                   |
| Visual design quality                         | `target`     | Governance prevents visual drift and defines when design exceptions require a new asset or rule update.                                      | design exception policy          | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no app runtime data changes; production records must preserve source footage, asset, and export lineage.                    | production register review       | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because production ops changes no app admin editor, CRUD, publishing, or operator UI.                                                    | explicit scope rationale         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Export QA checklist includes readability, contrast, mobile review, and non-color-only meaning checks.                                        | QA checklist                     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: export presets should prepare for web/course delivery, but no runtime payload or route changes happen here.                 | export policy                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Governance defines where source footage, FCP libraries, generated assets, review exports, final exports, archives, and repo docs live.       | storage/path policy              | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this ops brief changes no app cache, revalidation, data fetch, CDN, or runtime freshness behavior.                               | explicit scope rationale         | `N/A`                   |
| Reliability and failure handling              | `target`     | Governance includes production issue log, troubleshooting escalation, version rollback, bad export handling, and recipe drift review.        | ops runbook                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: private footage, source projects, and licensed media must not be placed in public/runtime paths.                            | storage policy                   | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: production workflow must avoid exposing personal/private footage, private locations, or unapproved raw clips.               | privacy/storage checklist        | `4/5`                   |
| Content governance                            | `target`     | Each drill/lesson has status, owner, source footage link policy, asset version, recipe version, export version, and approval evidence.       | production register + checklist  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no app admin workflow, support queue, Help/Guide action, or operator editability surface changes.                                | explicit scope rationale         | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: future public publishing should map exports to metadata, but this brief controls production before publishing.              | publish boundary note            | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: future public video pages may benefit, but this ops brief does not change public semantic markup or crawlable routes.       | scope rationale                  | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: production metrics can track throughput/rework, but no product analytics events are added.                                  | production KPI notes             | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: production quality supports course value but does not change checkout, entitlements, pricing, invoices, or revenue reports. | scope rationale                  | `4/5`                   |
| Incident response and support operations      | `target`     | Operators can diagnose missing assets, bad exports, unclear overlays, recipe drift, and storage mistakes with clear next steps.              | runbook + issue log policy       | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because production ops changes no finance reconciliation, payouts, refunds, subscriptions, invoices, or reporting workflows.             | explicit finance scope rationale | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: governance records whether text-bearing assets and exports are localizable later, but does not implement localization.      | text/version policy              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Markdown runbooks, existing brand assets, FCP workflows, and simple registers before adding new production tooling.                      | dependency/tooling review        | `5/5`                   |
| Testing and QA automation                     | `target`     | Governance includes repeatable export QA, artifact review, docs lint, and future checks for asset/register consistency where practical.      | QA checklist + verify gates      | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Workflow supports 100+ drills with low search friction, reusable templates, versioned assets, and limited manual recreation.                 | scale walkthrough                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Production docs define rollback from bad asset/template/recipe/export versions and archive recovery.                                         | rollback policy                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Docs:
  - use production runbooks and registers under `docs/video-production/visual-coaching-system/`.
- Assets:
  - governance must reference asset IDs and versions.
- FCP:
  - governance must reference verified recipe versions.
- Review:
  - exported artifacts must be reviewed, not only timelines.
- Tooling:
  - do not add a new production system tool unless manual Markdown/register workflow fails in practice.

## Data Placement And Sync Contract

- Source footage: production storage, never accidental public runtime.
- FCP libraries/projects: versioned production storage.
- Generated assets/templates: governed by asset manifest.
- Review exports: dated artifact folders.
- Final exports: production delivery folder with status.
- Repo docs: rules, checklists, registers without private raw footage or credentials.

## Identity And Rename Contract

- Each production item should have a stable production ID.
- Human-readable drill/lesson titles can be renamed before publish.
- Repurposing a production ID for a materially different technique is not allowed.
- Export filenames must preserve production ID, version, platform, aspect ratio, and status where practical.

## Scope

- Production governance docs.
- Production QA checklist.
- Production issue log structure.
- Versioning and rollback policy.
- Future editor onboarding outline.

## Out Of Scope

- Creating new assets.
- Editing videos.
- Publishing videos to the app.
- Changing runtime routes.
- Adding a paid production-management SaaS.

## Acceptance Criteria

1. Governance covers backlog, status, owner, naming, assets, recipes, QA, exports, archive, and rollback.
2. A future editor can onboard without prior Codex context.
3. Production issue handling is clear.
4. Governance prevents visual and file-structure drift.
5. Docs-only gates pass.

## Validation

- workflow walkthrough
- docs review
- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

N/A because this is internal production governance and does not change app Help/Guide content, user/admin labels, workflow actions, recovery behavior, or support UI.

## Checkpoint Log

- `2026-05-08 | planned | created scale/governance child brief so the visual coaching system can become an internal production framework for many drills and future editors | next: execute after pilot lesson proves the system`
