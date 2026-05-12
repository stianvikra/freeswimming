# Task Brief: Micro Sessions Copy Cleanup (10/10)

## Metadata

- `id`: `2026-05-11-micro-sessions-copy-cleanup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-11`
- `updated`: `2026-05-12`

## Goal

Make the Dryland Micro Sessions surface read like a clear action: split dryland sessions into smaller micro sessions, with shorter labels and no internal workflow explanation.

## Product Decision

Micro Sessions are not a separate library of saved dryland sessions. They are a way to split existing dryland work into smaller weekly execution blocks. The UI should use direct language, avoid repeating "saved dryland sessions and weekly micro blocks", remove the internal "Choosing source sessions" explanation below the editor, and treat green as a subtle Micro Sessions status surface rather than coloring the broader Dryland Sessions container.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Content governance
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                        | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Micro Sessions copy explains splitting dryland sessions into manageable micro sessions without implying a separate saved-session library. | screenshot handoff + text sweep        | `5/5`                   |
| UX flow clarity                               | `target`     | Source selection, empty state, progress, and release labels are shorter and action-oriented; internal workflow helper text is removed.    | component tests + screenshot handoff   | `5/5`                   |
| Visual design quality                         | `target`     | Changed copy fits in the existing desktop/mobile containers without overlap, low-value helper blocks, or mismatched green treatment.      | desktop/mobile screenshots             | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: this slice must not alter micro-plan create/edit/clear payloads, progress math, or persisted dryland data.               | targeted component tests + diff review | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated user Micro Sessions copy, not admin editor surfaces.                                               | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Progressbar accessible name changes from `Micro session progress` to `Progress` and tests assert the new name.                            | Testing Library + E2E assertions       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, route fetch, client state, or payload growth.                                                         | dependency/runtime diff review         | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no server-canonical, local-only, sync, retention, cache, or invalidation behavior changes.                                    | explicit scope rationale               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache, mutation, revalidation, or data loading behavior changes.                                                     | explicit scope rationale               | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: clear/create/edit flows must remain reachable after copy cleanup.                                                        | targeted tests                         | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no API route, auth boundary, token, RLS policy, or cross-user access behavior changes.                                        | explicit scope rationale               | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data category, export/delete behavior, analytics payload, or third-party sharing changes.                         | explicit scope rationale               | `N/A`                   |
| Content governance                            | `target`     | Old labels are removed or intentionally left out of scope; tests/docs are updated for new Micro Sessions language.                        | route/label/support sweep              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, operator action, moderation path, or admin editability changes.                                            | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/dryland` is authenticated/private and no public metadata, sitemap, robots, or crawlable content changes.         | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable page, schema, or content model changes.                                                             | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI definition, or logging payload changes.                                                      | explicit scope rationale               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, pricing, entitlement, subscription, refund, payout, or revenue operation.                     | explicit commerce scope rationale      | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this copy cleanup does not change support operations, incident response, recovery steps, or support runbooks.                 | explicit support scope rationale       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, payout, refund, entitlement, subscription, reporting, or reconciliation behavior changes.                         | explicit finance scope rationale       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new copy remains short, literal, and easy to localize; no locale routing or translation workflow ships.                  | copy review                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `DrylandMicroPlanPanel` and `DrylandBuilderHub` surfaces; add no new component system or dependency.                       | code review + dependency diff          | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/component and relevant E2E assertions are updated for new labels; screenshot handoff covers changed surfaces.               | targeted tests + screenshot handoff    | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because no backend reads, polling, compute, storage, or runtime transforms are introduced.                                            | explicit scope rationale               | `N/A`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a normal code/docs/test revert; no migration, config, or release sequencing is required.                                      | no-migration review + verify gates     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `DrylandMicroPlanPanel`, `DrylandBuilderHub`, and `/my-library/dryland`;
  - keep route/server data loading unchanged.
- TypeScript/domain contracts:
  - no domain type or validation behavior should change.
- Supabase/data layer:
  - no schema, migration, RLS, or generated type changes.
- UI system:
  - Reference surface: reuse the existing `DrylandMicroPlanPanel` and `DrylandBuilderHub` shared UI contract for the Dryland Sessions workflow instead of adding a new Micro Sessions container or renderer;
  - preserve existing Tailwind structure and spacing;
  - remove low-value helper text rather than adding new panels;
  - screenshot handoff is before/after for `/my-library/dryland?micro=edit`.
- Testing:
  - update component/E2E accessible-name assertions and label expectations;
  - run targeted tests before screenshot handoff.

## Data Placement And Sync Contract

N/A because this slice changes copy and labels only. Server-canonical dryland sessions and micro plans, local UI state, sync behavior, cache mode, retention, and invalidation are unchanged.

## Identity And Rename Contract

N/A because this slice does not change persisted entity IDs, route params, slugs, titles, aliases, redirects, imports, exports, or operator-visible identifiers. User-facing labels change only inside the existing Micro Sessions UI.

## Scope

- `/my-library/dryland` page helper copy.
- `DrylandBuilderHub` browse header copy and source-selection helper block.
- `DrylandMicroPlanPanel` micro plan heading, source-selection helper, empty state, source-card density, mobile source-list frame reduction, reduced green background treatment, create CTA color, release label, and progress label.
- Unit/component/E2E assertions for changed labels.
- Screenshot handoff artifacts.

## Out Of Scope

- Micro-plan data model, scheduling, release mode behavior, progress math, or API payloads.
- Dryland session editor behavior.
- Habits findings.
- New analytics/events.
- Public SEO/crawlable content.

## Acceptance Criteria

1. The repeated "Saved dryland sessions and weekly micro blocks." copy is removed from the dryland page and browse panel.
2. The Micro Sessions intro reads "Split dryland sessions into manageable micro sessions."
3. The source-selection helper sentence about saved Dryland Sessions staying in the library is removed.
4. The no-session empty state says "Create a dryland exercise, then split it into micro sessions here."
5. The progress label is shortened to "Progress" and the progressbar accessible name follows it.
6. "Release pacing" is renamed to "Release exercises".
7. The "Choosing source sessions" explanatory note is removed from the saved-session list area.
8. Source-session cards do not show the session-type pill and remain readable on desktop and mobile.
9. `Create micro session` remains the CTA label and uses the standard blue primary action color.
10. Mobile source selection avoids nested card frames while preserving readable row grouping and tap targets.
11. Micro Sessions uses the same subtle green panel tint on desktop and mobile, while the broader Dryland Sessions container stays neutral.
12. Existing create/edit/clear Micro Session behavior is unchanged.
13. Desktop and mobile screenshots show no text overlap or confusing helper block.

## Validation

- Targeted unit/component tests for dryland micro plan and builder hub copy.
- Targeted E2E assertion update for the progressbar name.
- Screenshot handoff before `npm run verify:pre-pr`.
- `npm run verify:pre-pr` after owner screenshot approval.
- `npm run verify:pre-merge` before merge.

## Quality Gate Evidence

- `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/dryland-builder-hub.test.tsx tests/unit/my-library-today.test.ts` passed (`3` files, `29` tests).
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run lint:briefs:all` passed (`280` brief files).
- `git diff --check` passed.
- Route/label sweep found no removed Micro Sessions copy in `app/`, `components/`, `lib/`, or `tests/`.
- Screenshot handoff captured: `output/micro-sessions-copy-cleanup-2026-05-12-072128` (`before/after`, desktop and mobile, `/my-library/dryland?micro=edit`).
- `npm run verify:pre-pr` passed full lane on committed HEAD `3e3a81c` (`artifacts/test-runs/20260512-074458`): lint, quality gates, typecheck, `1035` unit tests, build, perf budgets, and Playwright E2E (`82` passed / `380` skipped).
- GitHub CI passed for PR `#684` on `3e3a81c`: CodeQL, PR Size, Vercel, `e2e-smoke`, `site-lock-smoke`, and `verify`.
- `npm run verify:pre-merge` passed for `3e3a81c` (`artifacts/verify-pre-merge/20260512-060757.json`).
- Performance budget ratchet decision: hold in this copy/UI PR and recommend a separate performance-budget tighten slice; this PR does not change route payload policy or budgets.

## Completion Record

- Merged PR: `#684`
- Merge commit: `4a39a0d`
- Completed scope: Dryland Micro Sessions copy, source-selection density, progress/release labels, CTA color, and green panel treatment were cleaned up without changing micro-plan persistence, progress math, release behavior, or data contracts.
- Verification: owner-approved screenshot handoff, `npm run verify:pre-pr` PASS full lane, GitHub CI PASS, and `npm run verify:pre-merge` PASS on `3e3a81c` before merge.
- Screenshot evidence: `output/micro-sessions-copy-cleanup-2026-05-12-072128` approved by owner before PR gate; no product-rendering files changed after capture.
- Performance decision: hold budget tightening outside this copy/UI PR; perf gate recommended tightening one stretch target after five green weekly runs with margin.
- `10/10 claim`: yes for the approved Micro Sessions Copy Cleanup scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                               | Gaps / Notes                                                                |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#684`, owner-approved screenshot handoff, and merged copy state Micro Sessions as splitting dryland sessions.      | None for this slice.                                                        |
| UX flow clarity                               | `5/5`          | Source selection, empty-state, progress, and release labels were shortened and covered by component/E2E assertions.    | None for this slice.                                                        |
| Visual design quality                         | `5/5`          | Before/after desktop and mobile screenshots approved at `output/micro-sessions-copy-cleanup-2026-05-12-072128`.        | Existing bottom nav/admin notes overlays are unrelated to this slice.       |
| Business logic correctness and data integrity | `4/5`          | Diff and tests show no micro-plan payload, progress math, persisted dryland data, or release-mode behavior changed.    | Supporting category only; no new data invariant shipped.                    |
| Accessibility (a11y)                          | `5/5`          | Testing Library/E2E assertions cover the updated `Progress` accessible name and source-selection controls.             | None for this slice.                                                        |
| Performance (CWV + payloads)                  | `4/5`          | Full verify perf budget passed; no dependency, route fetch, or payload policy changed.                                 | Separate performance-budget tighten slice recommended by the ratchet trend. |
| Reliability and failure handling              | `4/5`          | Create/edit/cancel/clear flows remain covered by component tests and unchanged runtime behavior.                       | Supporting category only; no new failure path was introduced.               |
| Content governance                            | `5/5`          | Route/label sweep and tests removed old helper copy from product surfaces while keeping brief-only historical context. | None for this slice.                                                        |
| i18n operational readiness                    | `4/5`          | New copy is shorter and literal, with no locale-routing or translation workflow change.                                | Supporting category only; app-wide i18n workflow remains out of scope.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused `DrylandMicroPlanPanel`, `DrylandBuilderHub`, and existing Tailwind primitives; no dependency added.            | None for this slice.                                                        |
| Testing and QA automation                     | `5/5`          | Targeted tests, full `verify:pre-pr`, GitHub CI, screenshot handoff, and `verify:pre-merge` passed.                    | None for this slice.                                                        |
| DevOps and rollback readiness                 | `5/5`          | No migration/config; rollback is `git revert 4a39a0d`; branch and PR gates passed.                                     | None for this slice.                                                        |

## Help / Guide Impact

N/A. This changes in-app authenticated copy only and does not change workflow semantics, recovery behavior, support action labels, or help-center contracts.

## Route / Label / Support Surface Sweep

Identifiers searched: `Saved Dryland Sessions stay`, `Create a saved dryland session first`, `Build one weekly Micro Session`, `Saved dryland sessions and weekly micro blocks`, `Choosing source sessions`, `Micro session progress`, `Release pacing`, `Release exercises`, `Progress`, `manageable micro sessions`.

Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, and this active task brief. Fallout handled in product code, unit tests, E2E assertions, and brief evidence; remaining old-copy hits are intentionally limited to this brief's acceptance/sweep context and one negative unit-test assertion.

## Checkpoint Log

- `2026-05-11 | in-progress | branch micro-sessions-copy-cleanup-2026-05-11 created from clean main 958339d after PR #682 and closeout PR #683 landed; owner requested Micro Sessions copy cleanup and removal of confusing source-selection helper text | next: implement scoped copy/test updates, run targeted validation, then capture screenshot handoff before PR gates`
- `2026-05-11 | in-progress | copy/test updates implemented; targeted unit tests, typecheck, lint, brief lint, diff check, old-copy sweep, and before/after screenshot capture passed; screenshot artifacts captured at 2026-05-11 22:53 | next: wait for owner screenshot approval before running verify:pre-pr and preparing PR`
- `2026-05-11 | in-progress | owner requested source-card density and CTA color correction; removed visible session-type pills from Micro Sessions source cards, kept Create micro session label, switched micro create CTAs to blue primary, regenerated before/after screenshots at 2026-05-11 23:06, and targeted unit/eslint/typecheck stayed green | next: wait for owner screenshot approval before running verify:pre-pr and preparing PR`
- `2026-05-11 | in-progress | owner asked whether mobile needed all frames; mobile source selection was flattened by removing the inner form frame and using divider rows, while desktop keeps card rows; regenerated before/after screenshots at 2026-05-11 23:12 and targeted unit/eslint/typecheck stayed green | next: wait for owner screenshot approval before running verify:pre-pr and preparing PR`
- `2026-05-12 | in-progress | owner approved reducing the mobile green treatment; Micro Sessions panel now uses a white mobile background with green border/label and only a subtle desktop tint; regenerated before/after screenshots at 2026-05-12 07:02 and targeted unit/eslint/typecheck stayed green | next: wait for owner screenshot approval before running verify:pre-pr and preparing PR`
- `2026-05-12 | in-progress | owner chose the recommended middle path; Micro Sessions now uses the same subtle green tint on mobile and desktop while the outer Dryland Sessions container stays neutral; targeted unit/eslint/typecheck/brief-lint/diff-check passed and before/after screenshots regenerated at 2026-05-12 07:21 | next: wait for owner screenshot approval before running verify:pre-pr and preparing PR`
- `2026-05-12 | in-progress | owner approved screenshot handoff; npm run verify:pre-pr passed full lane on committed HEAD at artifacts/test-runs/20260512-074458; perf-budget trend recommended tighten, recorded as hold/defer to separate performance-budget slice because this PR is copy/UI scoped | next: commit, push, open PR, monitor CI, then run verify:pre-merge`
- `2026-05-12 | done | PR #684 merged to main as 4a39a0d after owner approval, green GitHub CI, green local verify:pre-pr on committed HEAD 3e3a81c, and green local verify:pre-merge; post-merge preflight surfaced this repo-managed docs-only closeout, moved brief from in-progress to done, and recorded achieved scores/evidence | next: docs-only closeout PR`
