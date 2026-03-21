# Task Brief: My Library Athlete Profile Collapse And IA Cleanup (10/10)

## Metadata

- `id`: `2026-03-21-my-library-athlete-profile-collapse-and-ia-cleanup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-21`
- `updated`: `2026-03-21`

## Goal

Users can maintain profile, metrics, preferences, and records on `/my-library/profile` through a calmer, collapse-first information architecture that reduces scroll fatigue, returns sections to compact summaries after save, and preserves clear edit intent on mobile.

## Why This Brief Exists

- The profile surface has become useful, but long:
  - many stacked cards,
  - multiple edit forms,
  - too much always-visible detail.
- Real usage feedback says the page should feel cleaner:
  - saved edit sections should collapse again,
  - cards should be manually collapsible,
  - the route should not require constant long scrolling.
- The product choice here should be deliberate:
  - use collapsible summary cards/accordion behavior,
  - do not switch to tab-only UI in this slice unless strong implementation evidence later proves it is better.

## Dependencies And Boundaries

- Existing foundations to reuse:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-athlete-profile-foundation-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-personal-records-foundation-10-10.md`
  - `/Users/stianvikra/freeswimming/components/my-library/profile/AthleteProfileHub.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/profile/page.tsx`
- Nearby work that must stay compatible:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-21-my-library-goals-progress-reset-and-ia-cleanup-10-10.md`
- This slice owns profile-page IA and disclosure behavior.
- This slice does not own:
  - new profile fields,
  - new generator features,
  - broad My Library navigation redesign.

## Scope

- Convert profile route to collapse-first IA with compact summary cards for in-scope sections:
  - athlete profile,
  - training metrics/CSS,
  - training preferences,
  - personal records where applicable.
- After successful save:
  - the edited section collapses back to summary mode,
  - success state remains visible enough to reassure the user,
  - failed save keeps the section open with inline recovery guidance.
- Allow manual expand/collapse per section.
- Persist section open/closed state locally per device/user context where safe:
  - disclosure state may persist,
  - unsaved draft text remains separate and must not be lost because a section is collapsed.
- Prefer concise summaries when collapsed:
  - current saved values,
  - completion gaps,
  - last meaningful update hint if useful.
- Keep empty-state sections easy to discover:
  - if no data exists yet, the route should still clearly show what to fill in first.

## Out Of Scope

- New schema/model fields.
- Converting the route to tabs as the primary IA in this slice.
- Goals/focus/notes model changes.
- Generator/program implementation.
- Public profile or sharing features.

## Data Placement And Sync Contract

- Server-canonical data:
  - athlete profile row,
  - metrics/preferences rows,
  - personal record rows,
  - timestamps and ownership.
- Local-only data:
  - section open/closed state,
  - unsaved form drafts,
  - transient success/error banners,
  - local route-focus/scroll state.
- Sync policy:
  - save remains explicit per section,
  - successful save updates server truth and then collapses the section back to summary mode,
  - failed save preserves draft input and leaves the section open.
- Retention and sensitivity:
  - profile and training data remain private user data,
  - locally persisted disclosure state must not contain the underlying sensitive values.
- Cache/invalidation:
  - profile page summaries and My Library entry summaries refresh deterministically after save or delete of in-scope data.

## Identity And Rename Contract

- Canonical stable ID:
  - `athlete_profile.id` and related canonical record IDs remain source-of-truth.
- Human-readable identifiers:
  - labels, names, and summary text are editable display values.
- Mutability rules:
  - collapse state is purely UI state and must never mutate canonical saved data,
  - summary cards reflect server truth, not unsaved draft values, unless explicitly labeled as draft.
- Rename vs repurpose policy:
  - normal wording updates stay in-place for the same entity,
  - materially different domain entities still require their own canonical rows as defined by existing foundations.
- Compatibility contract:
  - generator-intake and export surfaces continue to read canonical saved data, not local disclosure state.
- Observability and repair:
  - if local disclosure state becomes invalid after a schema/UI change, fail safe to deterministic default-open behavior rather than broken hidden sections.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                         | Evidence                         |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Product goals and IA                          | `target`     | Users can understand each profile section and reach the right editor quickly without scanning every field on the page.                 | IA review + manual QA + e2e      |
| UX flow clarity                               | `target`     | Open, edit, save, collapse, and reopen flows are deterministic on mobile and desktop with no dead-end section state.                   | e2e + manual QA                  |
| Visual design quality                         | `target`     | The route feels calmer, less cluttered, and more summary-driven while preserving existing My Library visual language.                  | screenshot review + manual QA    |
| Business logic correctness and data integrity | `target`     | Collapse/disclosure behavior never loses saved data, never overwrites server truth, and never hides failed-save state.                 | unit tests + runtime guards      |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user My Library profile workflow, not admin editing flows.                                  | scope rationale                  |
| Accessibility (a11y)                          | `target`     | Expand/collapse triggers, edit forms, summaries, and save feedback remain keyboard/touch accessible with proper semantics and labels.  | Playwright + manual QA           |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: collapse-first IA must avoid obvious route-render or hydration regressions on `/my-library/profile`.                  | build + code review              |
| Data placement and sync boundaries            | `target`     | Canonical profile data remains server-owned while disclosure state and drafts remain local-only and well separated.                    | contract review + tests          |
| Caching and invalidation strategy             | `target`     | Saved summaries refresh deterministically after per-section saves and record mutations.                                                | integration review + e2e         |
| Reliability and failure handling              | `target`     | Failed saves never collapse the editor prematurely and never drop draft input; success collapses only after canonical save completes.  | negative-path tests + manual QA  |
| Security and authz                            | `supporting` | Existing owner-only profile protections remain fail-closed and unchanged by IA cleanup.                                                | API regression coverage          |
| Privacy and compliance                        | `target`     | Private training/profile values remain private, and persisted disclosure state does not leak actual sensitive field content.           | scope review + storage review    |
| Content governance                            | `supporting` | Supporting only: labels and summaries must remain consistent with the canonical profile/metrics/records models.                        | copy review + code review        |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, admin Help/Guide, or editorial label changes are introduced here.                                       | scope rationale                  |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/profile` is an authenticated/private route with no public crawl/index contract.                               | scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                            | scope rationale                  |
| Analytics and KPI observability               | `supporting` | Supporting only: section-open, section-save, and route-return behavior should remain measurable enough to judge reduced friction.      | analytics event review           |
| Commerce and revenue ops                      | `N/A`        | N/A because no entitlement, billing, or commercial reporting logic is touched in this private profile cleanup slice.                   | scope rationale                  |
| Incident response and support operations      | `supporting` | Supporting only: support/runbook notes should explain how to recover from stuck-collapsed or failed-save profile states if they occur. | runbook/help review              |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or finance reporting path changes in this private IA cleanup.                          | scope rationale                  |
| i18n operational readiness                    | `supporting` | Supporting only: summary labels and helper copy must remain enum-backed or localization-safe.                                          | copy review                      |
| Stack-fit and dependency discipline           | `target`     | Reuse existing My Library patterns and avoid new dependencies for accordion/disclosure behavior.                                       | dependency diff + code review    |
| Testing and QA automation                     | `target`     | Automated coverage protects save-then-collapse behavior, draft preservation, disclosure persistence, and empty-state clarity.          | tests + `verify:pre-pr` evidence |
| Scalability and cost efficiency               | `supporting` | Supporting only: disclosure persistence and section summaries should avoid extra heavy fetch loops or duplicated data loads.           | query review + code review       |
| DevOps and rollback readiness                 | `supporting` | Supporting only: UI-only IA cleanup remains easy to disable or revert without schema rollback.                                         | release notes + diff review      |

## Acceptance Criteria

1. Profile-page sections are collapsible and summary-driven by default once data exists.
2. After a successful save, the edited section collapses back to a clear summary state.
3. Failed saves keep the section open with inline actionable feedback.
4. Local disclosure-state persistence reduces repeated scrolling without storing sensitive values.
5. Empty or incomplete sections remain easy to find and start.
6. The route reads cleaner on mobile than the current long-form stacked layout.
7. Existing generator/export compatibility remains intact because canonical data ownership does not change.
8. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - section disclosure-state behavior,
  - save-success collapse behavior,
  - failed-save keep-open behavior,
  - local persistence fallback behavior
- targeted e2e for:
  - edit/save/collapse/reopen flow,
  - mobile scroll-reduction flow,
  - empty-state first-use flow
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/profile`
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

- Prefer collapsible cards over tabs in this slice.
- Preserve existing visual language and data boundaries.
- Keep the implementation targeted to profile-route IA and not a broad My Library redesign.
- Do not collapse away validation errors or unsaved input.

## 10/10 Quality Bar

- The page must feel more like a dashboard of editable training summaries than a long settings form.
- The user should never wonder whether a save succeeded after the section collapses.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `offline`
  - `retry`
  - `success`
- Collapse behavior must reduce scroll fatigue without hiding important incomplete or failing states.
- Mobile readability and edit confidence are higher priorities than showing every field at once.

## Checkpoint Log

- `2026-03-21 | merged | PR #257 merged to main as commit 21779969ce7fd2576f382cdd4351d74a9db7f75f after local verify:pre-pr + verify:pre-merge and green CI | next: continue with the next prioritized slice`
- `2026-03-21 | implementation started | moved the athlete-profile IA cleanup slice into in-progress to ship collapse-first summaries, save-then-collapse behavior, and persisted disclosure state on `/my-library/profile` without changing canonical profile ownership | next: implement section disclosure model in the hub, add save/failure coverage, and run targeted validation`
- `2026-03-21 | planning | created dedicated athlete-profile IA cleanup brief from real usage feedback: saved sections should collapse again, the route should scroll less, and the page should prefer compact summaries over always-open forms | next: implement collapse-first profile route behavior with targeted save/draft/disclosure tests`
