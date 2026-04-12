# Task Brief: Swim Session Builder Brief Reconciliation And Remaining Scope Clarity (10/10)

## Metadata

- `id`: `2026-04-12-swim-session-builder-brief-reconciliation-and-remaining-scope-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-12`
- `updated`: `2026-04-12`

## Goal

Make the swim-session-builder brief set truthful, non-duplicated, and operationally usable so the next product track starts from the right parent brief and the remaining swim-builder scope is explicit.

## Why This Brief Exists

- The swim-session-builder wave now has many shipped child slices, but several older builder briefs still remain open.
- At least one brief is a stale duplicate of an existing done brief.
- At least one open brief is effectively superseded by later merged poolside-note work.
- The current brief state makes it harder than necessary to answer a simple question:
  - what is actually still left on the swim-session-builder track?
- The owner explicitly wants the platform to prioritize other tracks ahead of any future interactive poolside-execution mode:
  - dryland / land training,
  - AI-created sessions and programs,
  - and only later, if still needed, poolside execution.

## Dependencies And Boundaries

- Swim-builder foundation brief that remains the main lineage source:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- Builder umbrella to reconcile and close out if no real scope remains:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Poolside/print brief to reconcile as delivered or superseded:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10.md`
- Metadata-panel authoritative closeout:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-metadata-panel-clarity-10-10.md`
- Recent swim-builder closeouts that now define the latest delivered truth:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md`
- Adjacent higher-priority tracks that must stay visible after reconciliation:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-28-generator-intake-ux-clarity-and-progressive-disclosure-10-10.md`
- Locked boundary decisions for this slice:
  - no product-code changes,
  - no builder UI changes,
  - no new admin-note triage pass,
  - no reopening of delivered swim-builder scope just to keep an umbrella brief alive,
  - no promotion of `poolside execution` to a recommended next slice unless the owner explicitly reprioritizes it later.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The swim-session-builder brief set makes it obvious which brief is authoritative, which briefs are historical/done, and what remaining swim-builder scope is deferred. | brief diff + reconciliation summary     | `5`                     |
| UX flow clarity                               | `target`     | An operator can identify the correct next swim-builder action, or conclude that no immediate swim-builder slice is recommended, without reading multiple stale briefs. | brief review + final sequencing summary | `5`                     |
| Visual design quality                         | `N/A`        | N/A because this slice changes repository brief governance only, not product visuals or UI composition.                                                                | scope rationale                         | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: the slice must keep dependencies and ownership aligned to the briefs that actually own the current product contract.                                  | lineage review + diff                   | `4`                     |
| Admin editor ergonomics                       | `N/A`        | N/A because this is not an admin/editor product-surface change.                                                                                                        | scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no runtime UI is changed.                                                                                                                                  | scope rationale                         | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, bundle, or runtime rendering path changes in this docs-only slice.                                                                               | scope rationale                         | `N/A`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: the brief set must clearly state whether swim-builder work is active, done, or deferred so stateful follow-up work starts from the right contract.    | brief contract review                   | `4`                     |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache or invalidation behavior changes.                                                                                                         | scope rationale                         | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: brief moves and lifecycle changes should not leave broken internal references or ambiguous ownership.                                                 | `rg` link audit + brief diff            | `4`                     |
| Security and authz                            | `N/A`        | N/A because no authenticated route, auth boundary, or write path is changed.                                                                                           | scope rationale                         | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes no personal-data handling, disclosure policy, or protected output surface.                                                              | scope rationale                         | `N/A`                   |
| Content governance                            | `target`     | Every swim-session-builder brief touched in this slice gets an explicit disposition: active lineage, done, superseded, duplicate removal, or deferred priority.        | reconciliation notes + file lifecycle   | `5`                     |
| Admin workflow and editability                | `supporting` | Supporting only: repo operators should be able to resume swim-builder planning from one truthful brief set instead of stale umbrella files.                            | brief review                            | `4`                     |
| SEO and crawlability                          | `N/A`        | N/A because the slice changes no public route, sitemap, metadata, or crawl contract.                                                                                   | scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public AI-discoverable route or metadata surface.                                                                                     | scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy or KPI surface changes in this docs-only reconciliation.                                                                       | scope rationale                         | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, or commercial workflow is changed.                                                                                       | scope rationale                         | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice reconciles internal product-brief ownership only and does not change incident runbooks or support workflows.                                    | explicit docs-only scope rationale      | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, invoicing, or reporting workflow changes in this brief-governance cleanup.                                              | explicit docs-only scope rationale      | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes internal brief files only and does not alter localization architecture, runtime copy, or translation storage.                           | explicit docs-only scope rationale      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The reconciliation must reuse the existing brief lifecycle structure and avoid inventing parallel tracking files or ad-hoc status systems.                             | file diff + lifecycle review            | `5`                     |
| Testing and QA automation                     | `target`     | Changed brief files pass `npm run lint:briefs:all`, `npm run verify:docs-only`, `npm run verify:pre-pr`, and `npm run verify:pre-merge`.                               | command output                          | `5`                     |
| Scalability and cost efficiency               | `N/A`        | N/A because no runtime compute, rendering, storage, or third-party service cost changes here.                                                                          | scope rationale                         | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: brief lifecycle changes should be fully reversible via normal git rollback without losing the authoritative done lineage.                             | git diff + PR rollback simplicity       | `4`                     |

## Data Placement And Sync Contract

- Server-canonical:
  - the git-tracked brief files on `main` are the only authoritative planning record for swim-session-builder scope.
- Local-only:
  - temporary analysis notes during reconciliation,
  - no browser/local runtime state is introduced by this slice.
- Sync policy:
  - lifecycle changes become authoritative only when committed and merged,
  - if a brief is moved between lifecycle folders, internal references must be updated in the same diff.
- Retention and sensitivity:
  - authoritative delivered briefs should remain in repository history and in the correct lifecycle folder,
  - stale duplicates may be removed only when an authoritative replacement already exists.
- Cache/invalidation:
  - internal brief references and lineage notes must be updated in the same slice so there is no stale path ambiguity after merge.

## Identity And Rename Contract

- Canonical stable ID:
  - each brief's `id` remains the canonical identity across lifecycle folders and lineage references.
- Human-readable identifiers:
  - brief title and goal text are editable description only.
- Mutability rules:
  - status, updated date, and lifecycle folder may change during reconciliation,
  - the `id` should not change unless the brief is being split into a genuinely new scope.
- Rename vs repurpose policy:
  - if scope is materially different, create a new brief instead of repurposing an older one,
  - if scope is already delivered, close or supersede the existing brief rather than keeping it open as a generic umbrella.
- Compatibility contract:
  - any path move between `in-progress`, `done`, or `deferred` must update internal references in the same slice.
- Observability and repair:
  - use repository search plus brief lint to detect stale or broken references before PR handoff.

## Scope

- Review swim-session-builder-related briefs in `planned`, `in-progress`, and relevant `done`.
- Give each still-open swim-builder brief an explicit disposition:
  - active lineage,
  - done,
  - superseded,
  - stale duplicate removed,
  - or deferred.
- Remove the stale duplicate `in-progress` metadata-panel brief when the authoritative done brief already exists.
- Close out the older live-review umbrella and the older poolside/print slice if their scope is already delivered through later merged briefs.
- Update lineage references in affected briefs so they point to the correct lifecycle path after reconciliation.
- Clarify in the foundational builder brief that interactive `poolside execution` remains deferred and is not the recommended next slice.
- Record the new priority order explicitly:
  1. dryland / land training,
  2. AI-created sessions and programs,
  3. only later, if explicitly needed, interactive poolside execution.

## Out Of Scope

- Product-code changes.
- UI or UX changes in runtime surfaces.
- New admin-note sweep.
- New feature brief for a fresh swim-builder product slice beyond naming what is currently deferred.
- Rewriting historical done briefs beyond the minimum metadata and lineage needed for accurate closeout.

## Acceptance Criteria

1. No stale duplicate swim-session-builder brief remains open when an authoritative done brief already exists.
2. The older live-review swim-builder umbrella is no longer left open as if it still owned active product scope.
3. The older poolside-note print brief is no longer left open as if it were the current authority after the later redesign/polish slices merged.
4. The foundational builder brief explicitly says that `poolside execution` is deferred and not the recommended next slice.
5. The reconciliation records that higher-priority adjacent tracks are dryland and AI session/program work.
6. Updated lineage references point to the correct moved brief paths.
7. `npm run lint:briefs:all`, `npm run verify:docs-only`, `npm run verify:pre-pr`, and `npm run verify:pre-merge` pass.

## Validation

- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Constraints

- Keep the reconciliation narrow and truthful.
- Do not reopen delivered swim-session-builder scope just because an older umbrella brief is still open.
- Do not create a fake active swim-builder next step if the owner's current priority is elsewhere.
- Keep the foundational builder brief as lineage/foundation if needed, but document the deferred priority clearly.

## 10/10 Quality Bar

- The brief set should read like an intentionally maintained product backlog, not like leftover execution residue.
- A future agent or operator should be able to answer these questions in one pass:
  - what shipped,
  - what is still relevant lineage,
  - what is actually deferred,
  - what should happen next.
- No ambiguous duplicate ownership should remain for swim-session-builder work.

## Checkpoint Log

- `2026-04-12 | planning | created a docs-only reconciliation slice after confirming that multiple swim-session-builder briefs remained open even though later child slices had already merged; the owner also clarified that dryland and AI work should stay ahead of any future interactive poolside-execution mode | next: reconcile lifecycle state, update lineage paths, then run docs-only validation gates`
- `2026-04-12 | in-progress | moved the older live-review umbrella and older poolside-note print brief into done, removed the stale in-progress metadata-panel duplicate, refreshed affected lineage links, and clarified in the foundational builder brief that interactive poolside execution stays deferred behind dryland and AI priorities; \`npm run lint:briefs:all\`, \`npm run verify:docs-only\`, \`npm run verify:pre-pr\`, and \`npm run verify:pre-merge\` all passed locally | next: commit, push, open the docs-only PR, and hold for merge approval`
