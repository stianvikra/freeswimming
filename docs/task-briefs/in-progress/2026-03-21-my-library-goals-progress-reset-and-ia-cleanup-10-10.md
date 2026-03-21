# Task Brief: My Library Goals Progress Reset And IA Cleanup (10/10)

## Metadata

- `id`: `2026-03-21-my-library-goals-progress-reset-and-ia-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-21`
- `updated`: `2026-03-21`

## Goal

Users can manage goals on `/my-library/goals` without stale completion state, overloaded screens, or unclear actions, while keeping goal progress truthful and the next step obvious.

## Why This Brief Exists

- A concrete bug exists today:
  - removing a mistaken test/result can leave the goal progress UI showing `100%` and completed state even when the completion evidence is gone.
- The current page shows too much at once:
  - create form,
  - templates,
  - overview,
  - all goals,
  - persistent sync/status copy.
- Key actions are not self-explanatory enough in real use:
  - `Use as focus`
  - `Archive`
- This should be a dedicated cleanup slice instead of being buried inside future builder work.

## Dependencies And Boundaries

- Existing foundations that remain authoritative:
  - `/Users/stianvikra/freeswimming/components/my-library/goals/GoalsHub.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/goals/page.tsx`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-02-15-my-library-commerce-and-progress-sync.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
- Nearby work that must stay compatible:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-20-my-library-goals-focus-workflow-bridge-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-21-my-library-focus-management-v2-multi-open-focuses-10-10.md`
- This slice owns:
  - goal progress correctness,
  - goals-page IA cleanup,
  - explanatory copy and disclosure behavior on the goals route.
- This slice does not own:
  - focus data-model changes,
  - notes behavior,
  - generator/program builder behavior,
  - broad My Library redesign.

## Scope

- Fix mistaken-result reset behavior so goal percentage, status, and celebration state recompute deterministically after delete/reset.
- Make overview cards actionable:
  - `Active` jumps or filters to active goals,
  - `Achieved` jumps or filters to achieved goals.
- Reduce visual overload on `/my-library/goals`:
  - template browser is hidden behind explicit disclosure by default,
  - create-goal composer can collapse when the user already has goals,
  - achieved/archive-heavy content is visually secondary compared with current active work.
- Replace always-on sync noise with actionable status only:
  - offline warning,
  - save/update failure,
  - retry/success states where relevant.
- Clarify action meaning in-product:
  - `Use as focus` must explain that it prefills a focus workflow without changing the goal itself,
  - `Archive` must explain that the goal is hidden from the active list but retained in history.
- Keep mobile-first reading order and low-scroll friction.

## Out Of Scope

- Multi-open focus model changes.
- Training notes model changes.
- New goals schema or template taxonomy.
- Public marketing/copy changes outside authenticated My Library surfaces.
- Program-builder or session-generator implementation.

## Data Placement And Sync Contract

- Server-canonical data:
  - goal rows,
  - logged goal results/progress evidence,
  - canonical goal status,
  - timestamps and source metadata.
- Local-only data:
  - template browser open/closed state,
  - create-composer open/closed state,
  - current UI filter/section selection,
  - temporary banners and retry state.
- Sync policy:
  - goal create/update/delete-result actions remain explicit writes,
  - recomputed progress must reflect server truth after successful mutation,
  - failed writes keep unsaved local text long enough for retry where applicable.
- Retention and sensitivity:
  - archived goals stay recoverable/history-visible unless explicit delete exists in a later slice,
  - no new sensitive-data class is introduced in this cleanup slice.
- Cache/invalidation:
  - after create/update/result-delete, goals list, summary cards, and any linked goal count refresh deterministically,
  - no stale `100%` or stale achieved badge after reset/removal.

## Identity And Rename Contract

- Canonical stable ID:
  - `goal.id` remains the only canonical identity for each goal.
- Human-readable identifiers:
  - goal titles and summary text are editable display fields, not identity.
- Mutability rules:
  - progress is derived from canonical goal/result truth,
  - UI disclosure state must never mutate goal status implicitly,
  - `Use as focus` must never rewrite the goal row.
- Rename vs repurpose policy:
  - wording changes to the same goal stay in-place,
  - materially different training intent should create a new goal row rather than overwriting history.
- Compatibility contract:
  - bridge flows continue to pass goal IDs, not titles,
  - future focus-v2 work may change focus semantics, but goals identity remains unchanged.
- Observability and repair:
  - if progress cannot be recomputed from remaining result data, fail safe to non-achieved state and surface deterministic recovery copy instead of stale success UI.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                       | Evidence                         |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Product goals and IA                          | `target`     | Users can understand current goals, achieved goals, template entry, and create-goal entry without scanning the full page at once.    | IA review + manual QA + e2e      |
| UX flow clarity                               | `target`     | Core goal tasks (open page, create goal, browse templates, reset mistaken progress, use goal for focus) complete without dead ends.  | e2e + manual QA                  |
| Visual design quality                         | `target`     | The page feels calmer and less crowded on phone and desktop while preserving existing My Library visual language.                    | screenshot review + manual QA    |
| Business logic correctness and data integrity | `target`     | Removing mistaken result evidence always recomputes percentage/status truthfully and never leaves stale achieved state behind.       | unit tests + runtime guards      |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user My Library goals, not admin editing workflows.                                       | scope rationale                  |
| Accessibility (a11y)                          | `target`     | New disclosures, summary-card actions, and explanatory affordances remain keyboard/touch accessible with correct labels and focus.   | Playwright + manual QA           |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: IA cleanup must avoid obvious route-render or payload regressions on `/my-library/goals`.                           | build + code review              |
| Data placement and sync boundaries            | `target`     | Goal truth remains server-canonical while filters, disclosure state, and section focus remain local-only.                            | contract review + tests          |
| Caching and invalidation strategy             | `target`     | Summary cards, goal cards, and section counts refresh deterministically after every touched mutation.                                | integration review + e2e         |
| Reliability and failure handling              | `target`     | Offline/error/retry states remain actionable and never leave the user believing a reset succeeded when it did not.                   | negative-path tests + manual QA  |
| Security and authz                            | `supporting` | Existing owner-scoped My Library protections remain fail-closed; this cleanup slice must not weaken them.                            | API regression coverage          |
| Privacy and compliance                        | `supporting` | Supporting only: no new public exposure path or sensitive-data collection is introduced in this private goals cleanup slice.         | scope review + regression checks |
| Content governance                            | `supporting` | Supporting only: template labels and goal status copy remain canonical and consistent with existing goal model.                      | copy review + code review        |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, dashboard tab, or Help/Guide admin label changes are introduced here.                                 | scope rationale                  |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/goals` is a private authenticated route with no public crawl/index contract.                                | scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability or structured-content surface.                                    | scope rationale                  |
| Analytics and KPI observability               | `supporting` | Supporting only: key goal actions should remain measurable enough to confirm whether cleanup reduces confusion and dead-end actions. | analytics event review           |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or commercial reporting path changes in this goals cleanup slice.                               | scope rationale                  |
| Incident response and support operations      | `supporting` | Supporting only: troubleshooting guidance should cover stale-progress complaints and failed goal-result reset behavior.              | runbook/help review              |
| Finance and reporting operations              | `N/A`        | N/A because no billing, payout, reconciliation, or finance reporting logic is touched by this private user UX cleanup.               | scope rationale                  |
| i18n operational readiness                    | `supporting` | Supporting only: new helper copy and section labels must remain localization-safe and not hide logic inside English/Norwegian text.  | copy review                      |
| Stack-fit and dependency discipline           | `target`     | Reuse existing My Library, Next.js, React, and test patterns with no unnecessary new dependencies.                                   | dependency diff + code review    |
| Testing and QA automation                     | `target`     | Automated coverage protects progress-reset correctness, IA disclosures, and action clarity on the changed route.                     | tests + `verify:pre-pr` evidence |
| Scalability and cost efficiency               | `supporting` | Supporting only: cleanup work should avoid extra heavy polling, duplicate fetches, or wasteful recomputation paths.                  | query review + code review       |
| DevOps and rollback readiness                 | `supporting` | Supporting only: route-level UI cleanup and progress fix remain easy to revert without schema rollback.                              | release notes + diff review      |

## Acceptance Criteria

1. Removing or resetting mistaken result evidence recalculates goal percentage and non-achieved state deterministically.
2. The goals page no longer dumps templates, create form, and all history at full height by default.
3. Overview cards for `Active` and `Achieved` take the user to the relevant goal section or filtered view.
4. `Use as focus` and `Archive` are self-explanatory without needing outside explanation.
5. Always-on sync chrome is removed or demoted unless it is actionable.
6. Mobile users can reach the primary goal action quickly without scrolling past all templates/history first.
7. Existing owner-only protection and bridge compatibility remain intact.
8. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - result-delete progress recomputation,
  - achieved-state reset,
  - goals summary filtering/jump logic
- targeted e2e for:
  - mistaken-result reset flow,
  - template disclosure,
  - create-goal collapse/expand flow,
  - `Use as focus` explanatory path
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/goals`
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

- Keep the slice focused on one route and its linked goal behavior.
- Do not silently change focus semantics in this brief.
- Preserve existing My Library visual language.
- Prefer disclosure and summarization over tabs or broad route split unless implementation evidence proves otherwise.

## 10/10 Quality Bar

- The page must feel lighter and more intentional on first load.
- The main next action must be obvious on mobile.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `offline`
  - `retry`
  - `success`
- Progress truth must be deterministic:
  - no stale completion,
  - no stale percentage,
  - no silent failure after reset/delete.
- The route must stay accessible and easy to scan even with multiple saved goals.

## Checkpoint Log

- `2026-03-21 | perf trend decision: hold | \`npm run verify:pre-pr\` reported two consecutive weekly green perf-budget runs and recommended tightening one stretch target step; decision is \`hold\` for this goals slice because changed scope does not alter the public budget routes tracked by AW-010 | next: revisit tighten/revert choice in the next perf-focused slice or AW-010 checkpoint/PR summary`
- `2026-03-21 | working tree validated | implemented reset-result route support, calmer goals IA disclosure, summary filtering, action clarity copy, and automated coverage updates; validated with targeted vitest, eslint, typecheck, targeted Playwright, and full \`npm run verify:pre-pr\` | next: stage slice-only files, commit, and prepare PR handoff while leaving unrelated local planning files untouched`
- `2026-03-21 | implementation started on branch \`fix/my-library-goals-reset-ia-2026-03-21\` | moved brief to in-progress and locked first implementation scope to progress-reset bugfix plus calmer goals-route IA cleanup before focus-v2 work | next: implement reset-result action, route disclosure cleanup, and targeted tests`
- `2026-03-21 | planning | created dedicated goals cleanup brief from real user friction: stale reset bug, overloaded goals page, unclear focus/archive actions, and too much always-visible content on /my-library/goals | next: implement the bugfix first, then the route IA cleanup with targeted tests`
