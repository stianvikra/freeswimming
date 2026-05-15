# Task Brief: App Knowledge Book Phase 2A - Owner Overview (10/10)

## Metadata

- `id`: `2026-05-15-app-knowledge-book-phase-2-owner-overview-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-15`
- `updated`: `2026-05-15`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `ready`
- `decision`: Use this as the next App Knowledge Book Phase 2A docs-only implementation slice after the owner explicitly says `execute`, `build`, or `implement`.
- `reason`: Scope was selected after Phase 1 PR `#712` and closeout PR `#713` merged; it is narrow, docs-only, and explicitly avoids generated inventories, scripts, runtime code, UI, schema, provider, and config changes.
- `must_refresh_before_execution_if`: Phase 1 App Knowledge Book docs change, the owner chooses a different Phase 2 priority, scorecard/audit-gate rules change, or implementation starts from a newer `main` after significant docs/runtime changes.

## Goal

Create the first owner-readable App Knowledge Book chapter so a non-programmer owner can understand what FreeSwimming.org is, where the main surfaces live, what is safe to change, and where to go next without generating volatile inventories or changing runtime behavior.

## Why This Brief Exists

Phase 1 shipped the App Knowledge Book audit and documentation architecture in PR `#712`, then closed out in PR `#713`. The next safe slice is a narrow Phase 2A owner overview chapter that turns the approved audit structure into one stable, practical learning document.

This brief is intentionally smaller than the full Phase 2 plan. It should validate the chapter shape, owner-facing tone, evidence rules, and maintenance trigger before broader book chapters, diagrams, or generated `docs/system-state/*` inventories are created.

## Execution Mode

- `plan approved`: owner approved this Phase 2A scope on `2026-05-15`.
- `implementation gate`: do not write the chapter until the owner explicitly says `execute`, `build`, or `implement`.
- `automation-first after execution approval`: once execution starts, follow AGENTS.md end-to-end docs workflow: move brief to `in-progress`, implement scoped docs, validate, commit, push, open/update PR, monitor CI, run pre-merge gate, and summarize merge readiness.

## Scope

Create or update only docs needed for Phase 2A:

- Create `docs/app-knowledge-book/chapters/01-owner-overview.md`.
- Update `docs/app-knowledge-book/README.md` only enough to link the new chapter and preserve Phase 1 reading paths.
- Move this brief from `planned` to `in-progress` when implementation starts.
- Use Phase 1 evidence from:
  - `docs/app-knowledge-book/00-repo-audit.md`
  - `docs/app-knowledge-book/proposed-structure.md`
  - `docs/app-knowledge-book/quality-checklist.md`
  - `docs/app-knowledge-book/living-documentation-plan.md`
  - `docs/app-knowledge-book/unknowns-and-risks.md`
  - existing canonical architecture, runbook, testing, release, auth, commerce, and support docs.

The chapter must include:

- what the app is,
- who uses it,
- the main public, member, admin, auth, commerce, and operations surfaces,
- where the code and docs live,
- what not to change casually,
- how to verify or debug common owner questions,
- where current unknowns remain `Unknown / To Verify`,
- the maintenance trigger for updating the chapter.

## Out Of Scope

- No runtime code changes.
- No UI, print, layout, brand, screenshot, or interactive behavior changes.
- No provider dashboard verification.
- No Supabase migrations or generated DB type changes.
- No scripts, workflows, dependency updates, or generated inventories.
- No `docs/system-state/*` files.
- No full Phase 2 book generation.
- No raw secrets, env values, cookies, tokens, request IPs, provider response bodies, personal data, or free-text user content.
- No claims about production provider/control-plane settings unless repo evidence or owner-provided evidence exists.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this Phase 2A docs slice:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                | Evidence                                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Owner overview explains the app purpose, audience, primary route groups, and where the owner should start without requiring code knowledge.                       | `01-owner-overview.md` structure + README link                            | `5/5`                   |
| UX flow clarity                               | `target`     | Chapter gives clear next-reading paths for learning, debugging, release, auth/access, admin, payments, and training-domain questions.                             | chapter sections + exact path references                                  | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs-only slice does not change rendered UI, layout, typography, color, screenshots, print, or brand assets.                                     | docs-only diff review                                                     | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Chapter separates repo-proven behavior from `Unknown / To Verify` and does not describe planned features as shipped behavior.                                     | evidence citations + unknown markers                                      | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Owner overview names admin workspace purpose, high-frequency admin surfaces, Help/Guide, and safe owner paths without duplicating the admin runbooks.             | chapter admin section + links to admin docs/runbooks                      | `5/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this Markdown-only slice does not change interactive semantics, focus behavior, labels, contrast, or screen-reader flow.                              | docs-only diff review                                                     | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: overview must point to existing performance budgets and verification docs; it does not change route payloads or CWV behavior.                    | link to performance/testing docs                                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Overview names owner-level data boundaries: server-canonical, provider-canonical, local-only, and generated-doc state at a high level.                            | chapter data-boundary section + Phase 1 audit references                  | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: chapter links to cache/dynamic-route docs where relevant; it does not change any cache or revalidation behavior.                                 | exact links to architecture/testing docs                                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Chapter gives owner-safe debugging direction and links to incident/support runbooks without inventing unverified recovery paths.                                  | debugging/recovery section + runbook links                                | `5/5`                   |
| Security and authz                            | `target`     | Chapter explains private gate, auth, admin access, and secret-handling boundaries at owner level, with no secret values or overclaims about provider settings.    | auth/access/security section + no-secret review                           | `5/5`                   |
| Privacy and compliance                        | `target`     | Chapter avoids personal data and links to existing privacy/GDPR/policy docs for real procedures rather than copying sensitive examples.                           | privacy section + safe examples review                                    | `5/5`                   |
| Content governance                            | `target`     | Chapter states that stable book chapters are manual and evidence-linked, while volatile inventories remain deferred until explicitly approved.                    | overview maintenance section + README update                              | `5/5`                   |
| Admin workflow and editability                | `target`     | Overview describes where owner/admin workflows live and when Help/Guide/runbooks must be updated after workflow label/action changes.                             | admin/workflow section + links to Help/Guide/runbooks                     | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: overview should point to sitemap/robots/private-posture docs; it does not change metadata, crawl rules, or public route rendering.               | links to SEO/crawl docs                                                   | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: overview should explain that owner-readable docs help human/AI navigation, but no public structured-data or crawl behavior changes.              | AI discoverability note + scope review                                    | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: overview links to analytics/KPI surfaces and safe-payload rules; it does not add or change events.                                               | analytics section + existing docs links                                   | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Owner overview names commerce, checkout, entitlement, finance, and reconciliation docs without asserting Stripe dashboard state beyond repo evidence.             | commerce/revenue section + `Unknown / To Verify` where needed             | `5/5`                   |
| Incident response and support operations      | `target`     | Chapter provides owner-level path to support, incident, rollback, and debugging runbooks; no raw logs, tickets, messages, or provider responses are copied.       | support/incident section + runbook links                                  | `5/5`                   |
| Finance and reporting operations              | `target`     | Chapter points to finance/reporting and entitlement reconciliation docs and marks live payout/reporting/provider facts as `Unknown / To Verify` unless evidenced. | finance section + unknown markers                                         | `5/5`                   |
| i18n operational readiness                    | `target`     | Chapter states current single-language posture and links to i18n readiness docs without pretending multilingual operations are shipped.                           | i18n section + existing decision/checklist links                          | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Diff remains Markdown-only, uses existing docs structure, adds no dependency/tooling, and follows Phase 1 quality checklist.                                      | changed-files diff + checklist review                                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief and docs pass brief lint plus docs-only verification before PR update; no skipped validation is hidden.                                             | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Overview stays concise, links to canonical docs instead of duplicating large inventories, and keeps generated docs deferred until reviewable tooling is approved. | chapter length/reviewability check + no generated inventory diff          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only rollback remains normal git revert; overview links to release/verification/post-merge docs and does not modify release tooling.                         | rollback/release section + docs-only diff review                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no app route, component, server/client, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - no TypeScript contracts or runtime invariants change.
  - documentation claims must cite exact repo paths instead of inferring behavior.
- Supabase/data layer:
  - no migrations, RLS changes, generated type updates, or live data inspection.
  - mark live row counts, backup proof, and provider settings as `Unknown / To Verify` unless owner-provided evidence exists.
- External services/tools:
  - no provider dashboard reads or SDK/config changes.
  - record env variable names only if needed; never values.
- UI system:
  - no rendered UI changes and no screenshot handoff required.
- Testing:
  - docs-only validation with brief lint and pre-PR/pre-merge gates after execution approval.

## Data Placement And Sync Contract

N/A for runtime state because this slice creates Markdown documentation only.

Documentation state boundaries:

- Server-canonical app data remains unchanged.
- Provider-canonical state remains `Unknown / To Verify` unless evidenced.
- Local-only state remains out of scope.
- The chapter is stable manual documentation under git.
- Volatile generated inventories remain deferred and must not be created in this slice.

## Identity And Rename Contract

N/A for persisted product entities because this slice creates documentation only and does not create or mutate users, routes, slugs, database rows, notes, workouts, programs, commerce entities, or provider records.

Documentation identity:

- Stable chapter path: `docs/app-knowledge-book/chapters/01-owner-overview.md`.
- Human-readable title may be edited for clarity, but the numbered chapter path should remain stable once shipped.
- If Phase 2 chapter structure changes materially later, update README links and this chapter reference in the same PR.

## Help / Guide Impact

N/A for admin Help/Guide runtime content because this docs-only slice does not change admin labels, actions, recovery behavior, or user/admin workflow behavior.

The owner overview may link to Help/Guide and runbooks, but it must not redefine those workflows.

## Route / Label / Support Surface Impact Sweep

Before execution closeout, run a targeted repo sweep for:

- `App Knowledge Book`
- `Owner overview`
- `Phase 2`
- `docs/system-state`
- `Unknown / To Verify`

Any changed route, label, Help/Guide, support, or runbook behavior discovered during the sweep must either be excluded from this docs-only slice or captured as a separate follow-up brief.

## Acceptance Criteria

1. Brief is approved and moved to `in-progress` only when implementation starts.
2. `01-owner-overview.md` exists and is owner-readable without code expertise.
3. The chapter uses exact path references for important claims.
4. The chapter uses `Unknown / To Verify` for external/control-plane facts not proven by repo evidence.
5. README links the new chapter without removing Phase 1 reading paths.
6. No generated inventories, scripts, workflows, runtime code, UI, schema, provider, or config files are changed.
7. Changed docs pass brief lint and docs-only verification gates before PR update.

## Validation

Planning-only brief creation:

- `npm run lint:briefs`

After execution approval and docs implementation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

Docs-only lane is expected while the diff remains Markdown documentation under `docs/`.

## Manual QA

N/A because this slice does not change rendered UI, browser behavior, print/export output, routes, or screenshots.

Owner review should focus on whether the chapter is understandable, accurate, and useful as the first learning document.

## Checkpoint Log

- `2026-05-15 | planning | Phase 2A owner overview scope approved after Phase 1 PR #712 and closeout PR #713 merged; planned brief created to lock scope before implementation | next: wait for explicit execute/build/implement before moving brief to in-progress and writing the chapter`
