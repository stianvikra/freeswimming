# Task Brief: Visual Coaching Pilot Technique Lesson (10/10)

## Metadata

- `id`: `2026-05-08-visual-coaching-pilot-technique-lesson-10-10`
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

Validate the visual coaching production system on one real swim technique lesson before scaling it to many drills and lessons.

## Dependencies

- Parent: [Visual Coaching Production System Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-05-08-visual-coaching-production-system-parent-10-10.md)
- Phase 1 visual language should be approved.
- Asset pack should be available enough for real use.
- Verified FCP recipes should cover the pilot's required edits.

## Pilot Purpose

The pilot must prove that the system works in practice:

- educational clarity,
- premium brand feel,
- underwater readability,
- mobile viewing,
- FCP workflow speed,
- repeatable lesson structure,
- scalable asset use.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                             | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Pilot follows the approved lesson blueprint and proves the system can teach one clear technique objective.                                     | final video review + lesson checklist | `5/5`                   |
| UX flow clarity                               | `target`     | Viewer always knows what to look at, why it matters, and what correct movement looks like.                                                     | owner/video review                    | `5/5`                   |
| Visual design quality                         | `target`     | Pilot feels premium, modern, minimal, brand-consistent, and not cluttered or amateur.                                                          | exported video artifact review        | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no app data changes; project/export naming must preserve lesson/drill identity and source footage lineage.                    | naming/project review                 | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because the pilot changes no admin editor, CRUD, publishing workflow, or operator UI.                                                      | explicit scope rationale              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Overlays are readable on mobile, contrast-safe, not color-only, and do not hide the swimmer or critical motion.                                | mobile export review                  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: exported video file size/format should fit web/course delivery later, but no website runtime route changes here.              | export settings review                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Source footage, FCP library, assets, exports, review files, and final deliverables are stored according to production architecture.            | file structure audit                  | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because the pilot does not change app cache, revalidation, data fetching, or runtime freshness behavior.                                   | explicit scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Pilot records workflow issues, recipe gaps, asset problems, export issues, and fixes before scale-up.                                          | pilot retrospective                   | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: pilot must not expose private footage, private storage paths, credentials, or raw project files through public runtime paths. | artifact/path review                  | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: pilot uses approved footage and avoids embedding personal/private data in public examples or docs.                            | footage/artifact review               | `4/5`                   |
| Content governance                            | `target`     | Pilot updates production docs with what changed, what held, what failed, and which rules need adjustment before scale.                         | retrospective + docs update           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, support queue, moderation, status model, or in-app editability surface is changed.                              | explicit scope rationale              | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: if the pilot is later published, title/description/metadata are separate; this brief mainly validates production.             | publish boundary note                 | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: pilot may later become public educational content, but this brief does not change public AI-discoverable app routes.          | scope rationale                       | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: pilot may define future video review metrics, but no app analytics event is required in this slice.                           | retrospective notes                   | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: pilot supports course quality and conversion but does not change checkout, entitlement, pricing, billing, or reporting.       | scope rationale                       | `4/5`                   |
| Incident response and support operations      | `target`     | Pilot identifies troubleshooting needs for failed exports, unclear overlays, bad sync, asset gaps, and production handoff problems.            | retrospective + runbook update        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because the pilot changes no finance reconciliation, invoices, subscriptions, refunds, payouts, or reporting workflows.                    | explicit finance scope rationale      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: pilot text should remain replaceable/localizable later, but no localization workflow ships here.                              | copy layer review                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Pilot uses approved assets and verified FCP recipes without adding unnecessary plugins, apps, or repo dependencies.                            | workflow review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Pilot has exported artifact review, mobile/desktop playback review, owner approval, and docs-only/repo gates for any changed docs/assets.      | artifact handoff + verify gates       | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pilot proves the system can be repeated for many drills without excessive manual recreation or confusing file search.                          | time/friction retrospective           | `5/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: pilot production files are versioned and removable; no runtime rollback unless a later publish slice changes public delivery. | file/version review                   | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- Production workflow:
  - use Phase 1 file/naming/export architecture,
  - use asset pack IDs,
  - use verified FCP recipes.
- Review:
  - inspect actual exported artifact, not only FCP timeline preview.
- Documentation:
  - update production docs with pilot findings.

## Data Placement And Sync Contract

- Source footage: production storage, not committed unless explicitly approved.
- FCP library/project: production storage with versioned naming.
- Exported review files: approved artifact folder.
- Final publish file: only if publish scope is added.
- Repo docs: retrospective and rule updates only.

## Identity And Rename Contract

- Pilot lesson has stable production ID.
- Human-readable video title can be refined before publish.
- If the pilot changes technique objective materially, create a new pilot ID instead of repurposing the old one.

## Scope

- Select one pilot technique lesson.
- Build lesson using approved system.
- Export and review.
- Record findings and adjust docs.

## Out Of Scope

- Scaling to many drills.
- Public publishing unless separately scoped.
- Creating new brand direction.
- Changing website runtime.

## Acceptance Criteria

1. One full pilot lesson is produced or assembled enough to validate the system.
2. The exported artifact proves overlay readability and swimmer-first hierarchy.
3. Owner reviews desktop and mobile playback.
4. Pilot retrospective records changes needed before scale-up.
5. Production docs are updated with pilot findings.

## Validation

- exported artifact review
- mobile playback review
- desktop playback review
- owner visual approval
- `git diff --check`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help / Guide Impact

N/A unless the pilot is published into the app/course. If published later, Help/Guide and route/support sweep must be scoped in that publish brief.

## Checkpoint Log

- `2026-05-08 | planned | created pilot child brief so the visual coaching system is validated on one real technique lesson before scaling to many drills | next: execute after Phase 1, asset pack, and required FCP recipes are ready`
