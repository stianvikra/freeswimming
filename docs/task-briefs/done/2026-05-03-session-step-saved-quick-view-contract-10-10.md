# Task Brief: Session Step Saved Quick View Contract (10/10)

## Metadata

- `id`: `2026-05-03-session-step-saved-quick-view-contract-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-03`
- `updated`: `2026-05-03`
- `mode`: `merged + closeout`

## Goal

Make saved-workout `Quick View` consume the shared session-step `View` display contract so saved session previews do not drift from the manual builder reference surface.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim: `UX flow clarity`, `Visual design quality`, `Business logic correctness and data integrity`, `Stack-fit and dependency discipline`, `Testing and QA automation`.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                               | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Saved session previews use the same session-step view section contract as the reference builder surface.                         | component diff + screenshot handoff       | `5/5`                   |
| UX flow clarity                               | `target`     | `Quick View` remains a compact read-only preview with clear section grouping, rest summaries, and total distance.                | unit tests + screenshot handoff           | `5/5`                   |
| Visual design quality                         | `target`     | Saved quick-view sections reuse the shared view styling, category tones, and spacing without introducing a separate card system. | after/reference screenshots               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Preview sections preserve contiguous workout order, category identity, linked rests, repeat rests, and total labels.             | `workouts-shared` + component tests       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private end-user saved-session preview does not change admin editing or publishing workflows.                   | explicit admin scope rationale            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Read-only quick-view rows remain semantic sections without misleading edit buttons, and builder view buttons keep labels.        | Testing Library assertions                | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency and no new server read; preview adapts existing summary data into the shared renderer.                         | dependency diff + targeted tests          | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Saved workout rows remain server-canonical; quick view uses derived display-only preview data.                                   | brief + code review                       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no route cache changes; previews refresh through existing saved-workout reads after save/delete.                | scope review                              | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing legacy category data falls back deterministically instead of breaking saved preview rendering.                           | backward-compat component tests           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected workout routes and APIs are unchanged and keep existing authz gates.                                  | scope review + existing gates             | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, logging, export destination, or retention behavior.                                       | data review                               | `4/5`                   |
| Content governance                            | `target`     | Section labels, rest wording, and repeat wording remain centralized through the session-step display contract.                   | contract tests + docs update              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/user recovery workflow, status label, or support queue behavior changes.                                    | explicit workflow scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this authenticated app UI changes no public route metadata, sitemap, robots, or crawlable content.                   | explicit SEO scope rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private saved-workout preview changes no public AI-discoverable entity or semantic content.                     | explicit AI-discovery scope rationale     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing quick-view action/test IDs remain stable; no event taxonomy is added.                                  | test-id diff review                       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, pricing, billing, refund, or revenue workflow changes.                                     | explicit commerce scope rationale         | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this preview-only UI change adds no alerting, incident path, support queue, or customer recovery workflow.           | explicit support-ops scope rationale      | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no payout, invoice, ledger, entitlement report, refund, or finance reconciliation data changes.                      | explicit finance scope rationale          | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: shared labels improve later localization, but no locale routing/storage or translation layer changes.           | label centralization review               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse React/TypeScript shared renderer, existing preview data, Tailwind tokens, and zero new dependencies.                       | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/component tests pass before screenshot handoff; `verify:pre-pr` waits for owner visual approval.                   | tests + screenshots + later gate evidence | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Reuse reduces future saved-preview drift without additional runtime services, exports, or duplicate render engines.              | architecture closeout + diff review       | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Code-only, no migration, no cache purge; rollback is a single PR revert.                                                         | PR diff + rollback note                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reference surface is `SessionStepSurfaceRenderer` and its `View` sections. Saved `Quick View` stays client-rendered inside `SavedWorkoutsPanel`; no route, action, API, or cache boundary changes.
- TypeScript/domain contracts: extend `WorkoutSummaryPreviewSection` with optional category identity and adapt it to `SessionStepViewSection`; legacy summaries without category fall back from section title.
- Supabase/data layer: N/A with rationale: no schema, RLS, auth, storage, migration, or generated DB type changes.
- External services/tools: N/A with rationale: no SDK, webhook, secret, retry, or idempotency behavior changes.
- UI system: use `docs/design/session-step-surface-contract.md`; screenshot handoff is `after/reference` comparing saved Quick View with the builder `View` reference.
- Testing: update focused unit/component tests for summary sections, saved quick view rendering, and shared renderer read-only behavior.

## Data Placement And Sync Contract

- Server-canonical data: saved workout rows and canonical draft steps remain owned by the existing `workouts` table/API read path.
- Local-only data: quick-view open/closed state remains browser component state only.
- Sync policy: no new sync; saved preview data is regenerated from canonical draft data when workout summaries are loaded or saved.
- Retention and sensitivity: no new persistence or logging; step preview text remains existing saved-workout display data.
- Cache/invalidation: unchanged; save/delete paths already refresh the saved-workout library snapshot.

## Identity And Rename Contract

- Canonical stable ID: workout IDs, step IDs, and repeat IDs remain unchanged.
- Human-readable identifiers: workout titles and section labels remain display-only and renameable.
- Mutability rules: this slice does not mutate entities; preview rows are derived display output.
- Rename vs repurpose: N/A for runtime behavior because no persisted identifier changes.
- Compatibility contract: legacy `previewSections` without category still render with deterministic title-based fallback.
- Observability and repair: invalid stored workout summaries continue to be filtered by existing server safeguards.

## Scope

- `components/my-library/workouts/SavedWorkoutsPanel.tsx`
- `components/my-library/workouts/SessionStepSurfaceRenderer.tsx`
- `lib/workouts/shared.ts`
- Focused unit/component tests for saved quick view and preview section contracts.
- `docs/design/session-step-surface-contract.md`

## Out Of Scope

- Poolside note print/export rendering.
- Workout PDF HTML renderer migration.
- Garmin-ready export payload changes.
- Program PDF/export migration.
- Schema, API, authz, or cache changes.
- New dependencies.

## Acceptance Criteria

1. Saved-workout `Quick View` renders preview sections through the shared session-step view renderer.
2. Builder `View` behavior remains interactive and unchanged.
3. Saved `Quick View` is read-only and does not expose misleading edit/open actions.
4. Preview section category identity is preserved when generated from canonical drafts and falls back safely for legacy test data.
5. Linked rests, repeat interval rests, post-set rests, standalone rests, and total distance labels still render deterministically.
6. Screenshot handoff is approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests:
  - `tests/unit/session-step-surface-renderer.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workouts-server.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- screenshot handoff before `verify:pre-pr`
- after owner screenshot approval:
  - `npm run verify:pre-pr`
  - CI
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js and npm from the repo runtime are available locally.
- Use the repo `nvm` bootstrap before reporting missing `node`/`npm`.

## Manual QA Environments

- Local URL: `http://127.0.0.1:3000`.
- Screenshot handoff required because saved `Quick View` is a user-facing visual surface.
- Handoff comparison type: `after/reference`.
- Representative screenshots:
  - after saved-workout Quick View desktop,
  - after saved-workout Quick View mobile,
  - reference builder `View` desktop or mobile.

## Constraints

- Keep the patch narrow and do not redesign saved-workout cards beyond the shared preview section renderer.
- Preserve existing quick-view button labels and test IDs where practical.
- Do not change poolside/PDF/Garmin/program output paths in this slice.

## Completion Record

- Completed: `2026-05-03`
- Merged PR: `#582`
- Merge commit: `a04d9d3`
- Implementation commit: `8c406a0`
- Outcome: saved-workout `Quick View` now adapts preview data into the shared session-step `View` section renderer, including read-only rendering, section category identity, repeat/rest summaries, and legacy category fallback.
- Screenshot handoff: owner-approved after/reference captures in `/Users/stianvikra/freeswimming/output/session-step-saved-quick-view-2026-05-03`.
- Validation:
  - targeted Vitest: PASS, `tests/unit/session-step-surface-renderer.test.tsx`, `tests/unit/workouts-shared.test.ts`, `tests/unit/workouts-server.test.ts`, `tests/unit/workout-builder-hub.test.tsx`;
  - `npm run verify:pre-pr`: PASS on `8c406a0`, full lane, `artifacts/test-runs/20260503-205034`;
  - GitHub CI for PR `#582`: PASS (`Analyze`, `CodeQL`, `Vercel`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`, `size-check`, `verify`);
  - `npm run verify:pre-merge`: PASS on `8c406a0`, marker `artifacts/verify-pre-merge/20260503-192024.json`.
- Perf-budget decision: hold/carry-forward. The gate recommended `tighten` after green trend evidence, but this UI parity slice intentionally did not change public route budgets and defers that decision to the maintenance/performance workstream.
- Rollback: revert merge commit `a04d9d3`; no schema, data repair, cache purge, finance action, or customer communication is required.

## Closeout Score Outcome

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

- `10/10 claim`: yes

| Category                                      | Achieved Score | Evidence                                                                                     | Notes                                                                    |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | PR `#582`, shared renderer reuse, and approved screenshots.                                  | Saved session previews now use the reference view section contract.      |
| UX flow clarity                               | `5/5`          | Owner-approved screenshot handoff and saved quick-view component tests.                      | Preview stays compact, read-only, sectioned, and total-aware.            |
| Visual design quality                         | `5/5`          | After/reference desktop and mobile captures.                                                 | Saved cards reuse shared section styling, tones, spacing, and wrapping.  |
| Business logic correctness and data integrity | `5/5`          | `workouts-shared`, `workouts-server`, and hub tests plus full gates.                         | Categories, linked rests, repeat rests, set rests, and totals preserved. |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions and full Playwright lane.                                         | Quick View is read-only without misleading open/edit controls.           |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency/server read; build and perf budgets passed.                                | Budget tightening deferred by explicit hold/carry-forward decision.      |
| Data placement and sync boundaries            | `5/5`          | Data contract review and code diff.                                                          | Saved workout rows remain server-canonical; preview data is derived.     |
| Reliability and failure handling              | `5/5`          | Legacy category fallback tests and full verification.                                        | Missing historical category data renders deterministically.              |
| Content governance                            | `5/5`          | Contract doc update and shared rest/repeat wording.                                          | Section labels and rest wording remain centralized.                      |
| Stack-fit and dependency discipline           | `5/5`          | React/TypeScript shared renderer reuse, existing Tailwind tokens, and zero new dependencies. | No new framework, API, or external service introduced.                   |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot approval, `verify:pre-pr`, CI, and `verify:pre-merge`.            | Local and remote gates passed before merge.                              |
| Scalability and cost efficiency               | `5/5`          | Shared view contract reduces saved-preview drift without adding runtime infrastructure.      | Future session-step consumers can adapt into the same renderer.          |
| DevOps and rollback readiness                 | `5/5`          | Single merged PR with no migration; rollback is `git revert a04d9d3`.                        | Post-merge preflight surfaced this lifecycle closeout.                   |

## Checkpoint Log

- `2026-05-03 | in-progress | created implementation brief from post-merge scope review; saved-workout Quick View is the next small session-step contract consumer after PR #578/#581 | next: implement shared view-section reuse and targeted tests`
- `2026-05-03 | implementation | exported shared read-only view-section rendering, moved saved-workout Quick View onto the session-step view section contract, added category-preserving summary preview sections with legacy fallback, and updated focused tests/docs | next: screenshot handoff before verify:pre-pr`
- `2026-05-03 | screenshot-review | targeted validation passed: lint, typecheck, lint:briefs:all, and focused Vitest suite; after/reference screenshots captured in /Users/stianvikra/freeswimming/output/session-step-saved-quick-view-2026-05-03 | next: owner visual approval or corrections before verify:pre-pr`
- `2026-05-03 | pre-pr gate | owner approved screenshot handoff; `npm run verify:pre-pr` passed full lane (`167`unit files /`870`unit tests, production build, perf budgets, and Playwright`108 passed`/`348 skipped`) | perf-budget trend recommended `tighten`, decision: `hold/carry-forward` because this UI parity slice does not own public route budgets and repo cadence already records the latest 2026-04-26 ratchet as too recent for another non-maintenance threshold change | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-05-03 | merged | PR #582 merged to main as a04d9d3 after owner screenshot approval, local verify:pre-pr, green CI, and local verify:pre-merge | next: post-merge preflight`
- `2026-05-03 | done | post-merge preflight surfaced this lifecycle closeout; brief moved from in-progress to done with all target categories closed at 5/5 and 10/10 claim recorded | next: docs-only closeout PR`
