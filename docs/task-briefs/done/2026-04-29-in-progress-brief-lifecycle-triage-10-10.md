# Task Brief: In-Progress Brief Lifecycle Triage (10/10)

## Metadata

- `id`: `2026-04-29-in-progress-brief-lifecycle-triage-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-29`
- `updated`: `2026-04-29`

## Goal

Reduce stale lifecycle noise by reviewing the active `docs/task-briefs/in-progress/` queue, moving only clearly shipped briefs to `done/`, and documenting which remaining briefs still need a separate closeout or owner decision.

## Why This Brief Exists

- The dependency-maintenance wave and follow-up governance work left the repo in a clean state, but older implementation briefs were still sitting in `in-progress/`.
- A stale in-progress queue makes it harder to choose the next real workstream and increases the chance of reopening completed work by mistake.
- This triage is docs-only lifecycle hygiene. It does not change product behavior, routes, UI, dependencies, CI, runtime config, or performance budgets.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Content governance`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                    | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Active task planning must distinguish completed shipped work from genuinely open product work.                                    | triage table + moved lifecycle files     | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this docs-only lifecycle slice changes no user/admin flows, labels, actions, routes, or visible product journeys.     | explicit UX scope rationale              | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, brand, or visual rendering behavior changes.                                                    | explicit visual scope rationale          | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no runtime logic, persistence, schema, entitlement, progress, or user-owned data behavior changes.                    | explicit business/data scope rationale   | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin editing, publishing, notes, and operator CRUD surfaces are untouched.                                           | explicit admin editor scope rationale    | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered semantics, focus order, labels, keyboard behavior, or visual surfaces change.                             | explicit a11y scope rationale            | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime bundle, route payload, rendering path, or performance budget changes.                                      | explicit performance scope rationale     | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local/server data ownership, sync, retention, or conflict behavior changes.                                        | explicit data-boundary scope rationale   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, artifact cache, CDN policy, or invalidation trigger changes.                                     | explicit cache scope rationale           | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: clearer lifecycle state reduces planning mistakes, but no runtime failure behavior changes.                      | triage decisions                         | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, authorization, secrets, dependency, policy, or security control changes.                                     | explicit security scope rationale        | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no analytics, consent, retention, policy, processor, or sensitive-data behavior changes.                              | explicit privacy scope rationale         | `N/A`                   |
| Content governance                            | `target`     | Each lifecycle move must include concrete merged-PR or supersession evidence, and uncertain briefs must stay open with rationale. | moved briefs + remaining-queue rationale | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because admin workflow states, editability, audit trails, and recovery paths are untouched.                                   | explicit admin workflow scope rationale  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonical, or public crawl surface changes.                                       | explicit SEO scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, route copy, or AI-discoverable content model changes.                    | explicit AI discovery scope rationale    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: brief status now better reflects shipped vs active work for planning metrics.                                    | lifecycle queue before/after             | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, billing, invoice, entitlement, revenue, payout, or finance-facing behavior changes.                        | explicit commerce scope rationale        | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: stale brief reduction improves operator recovery context, but no incident workflow changes.                      | remaining-open rationale                 | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reports, invoices, payouts, reconciliation, or accounting data contracts change.                           | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, language metadata, or future i18n storage model changes.                      | explicit i18n scope rationale            | `N/A`                   |
| Stack-fit and dependency discipline           | `supporting` | Supporting only: lifecycle hygiene keeps dependency and maintenance work from being obscured by completed implementation briefs.  | triage table                             | `4/5`                   |
| Testing and QA automation                     | `target`     | Docs-only validation passes through brief lint and normal pre-PR/pre-merge gates.                                                 | validation evidence                      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: lower lifecycle noise reduces future triage cost without adding tooling.                                         | in-progress queue reduction              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The change is docs-only and revertable as one PR with no runtime rollback, data repair, or dependency downgrade.                  | PR diff + rollback plan                  | `5/5`                   |

## Data Placement And Sync Contract

- N/A because this brief changes only task-brief lifecycle metadata and file locations.
- No product data, local storage, Supabase data, generated types, cache ownership, or sync behavior changes.

## Identity And Rename Contract

- Existing brief IDs remain unchanged.
- File paths move only from `in-progress/` to `done/`; no brief is renamed, repurposed, or split in this PR.

## Scope

- Review the current in-progress brief queue.
- Move only briefs with clear merge/supersession evidence to `done/`.
- Add final lifecycle checkpoint notes to the moved briefs.
- Document remaining open briefs and why they were not moved.

## Out Of Scope

- Closing broad umbrella briefs without owner-confirmed completion.
- Creating new product, UI, dependency, CI, performance, or runtime work.
- Rewriting historical brief content beyond lifecycle metadata and closeout checkpoint notes.

## Triage Decisions

### Moved To Done

| Brief                                                                        | Evidence                                                                                  | Rationale                                                                                                         |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `2026-03-20-my-library-goals-focus-workflow-bridge-10-10.md`                 | PR #256 merged as `753c9a8`                                                               | Shipped goal-to-focus/note bridge follow-up.                                                                      |
| `2026-03-21-my-library-goals-progress-reset-and-ia-cleanup-10-10.md`         | PR #254 merged as `164eb2e`                                                               | Shipped goals reset and IA cleanup.                                                                               |
| `2026-03-28-generator-intake-ux-clarity-and-progressive-disclosure-10-10.md` | PR #312 merged as `f67a808`; PR #320 merged as `7ab585b`; PR #334 later closed superseded | Shipped generator intake clarity and follow-up simplification; no active implementation remains under this brief. |
| `2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10.md`     | PR #318 merged as `2083f70`                                                               | Shipped dryland builder foundation.                                                                               |
| `2026-04-09-platform-containment-and-border-hierarchy-audit-10-10.md`        | PR #400 merged as `9d0f020`; follow-up PR #402 merged as `90702ad`                        | Audit and primary containment follow-up are historical evidence, not active implementation.                       |
| `2026-04-15-poolside-note-composition-final-polish-10-10.md`                 | PR #439 merged as `5863abb`                                                               | Shipped poolside final composition polish.                                                                        |
| `2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md`       | PR #439 merged as `5863abb`                                                               | Shipped poolside popup and print delivery stabilization.                                                          |
| `2026-04-16-poolside-header-lockup-stability-10-10.md`                       | PR #449 merged as `cadf5b2`                                                               | Shipped poolside header lockup stability.                                                                         |
| `2026-04-16-poolside-note-print-stability-and-density-10-10.md`              | PR #448 merged as `70a01ba`                                                               | Shipped poolside print stability and density hardening.                                                           |

### Kept In Progress

| Brief                                                                             | Rationale                                                                                                                  |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `2026-02-17-additional-work-backlog.md`                                           | Rolling backlog; not a completed implementation slice.                                                                     |
| `2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`                 | Broad admin/content umbrella with explicit remaining/deferred lifecycle context.                                           |
| `2026-02-22-admin-full-content-edit-workflow-10-10.md`                            | Broad admin workflow umbrella; needs separate closeout review before lifecycle move.                                       |
| `2026-02-25-content-production-v1-admin-editorial-run.md`                         | Rolling content-production/editorial run, not a single shipped slice.                                                      |
| `2026-02-28-workout-builder-and-poolside-execution-10-10.md`                      | Parent umbrella with poolside execution deferral; candidate for explicit deferred/closeout decision, not silent done move. |
| `2026-03-16-stable-course-runtime-ids-and-semantic-slugs-10-10.md`                | Multi-slice migration history; requires separate evidence review before closeout.                                          |
| `2026-03-19-admin-lesson-edit-continuity-and-common-mistakes-visibility-10-10.md` | Appears implemented, but PR/merge mapping was not verified enough for this safe triage.                                    |
| `2026-03-20-ai-session-generator-v1-garmin-minimum-draft-review-10-10.md`         | Generator parent/acceptance brief with follow-up history; needs separate closeout review.                                  |
| `2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`             | Admin notes workflow has later production follow-up history; needs separate closeout review.                               |

## Acceptance Criteria

1. Completed briefs are moved from `in-progress/` to `done/` only when merged PR/supersession evidence is recorded.
2. Moved briefs have status `done`, updated date `2026-04-29`, and a final checkpoint.
3. Remaining in-progress briefs are documented with a rationale for why they were not moved.
4. The diff is docs-only and passes brief lint plus normal docs-only pre-PR/pre-merge gates.

## Validation Plan

- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `npm run lint:briefs:all`: PASS for all `211` brief files.
- `npm run verify:pre-pr`: PASS on docs-only lane at `artifacts/test-runs/20260429-092540/verify.log`.

## Help/Guide And Operator Training Impact

- Help/Guide content: `N/A` because no user/admin workflow labels, actions, recovery UX, or support-facing product behavior changed.
- Operator training impact: this brief itself is the durable lifecycle handoff for the queue cleanup.

## Rollback Plan

- Revert the docs-only PR to restore the previous lifecycle file locations and metadata.
- No runtime rollback, data repair, migration, dependency downgrade, secret rotation, or customer communication is required.

## Checkpoint Log

- `2026-04-29 | done | moved nine clearly shipped in-progress briefs to done, recorded merge/supersession evidence on each moved brief, documented nine remaining in-progress briefs that need separate closeout/deferred decisions, and passed docs-only pre-PR verification | next: open PR, monitor CI, and run verify:pre-merge before merge recommendation`
