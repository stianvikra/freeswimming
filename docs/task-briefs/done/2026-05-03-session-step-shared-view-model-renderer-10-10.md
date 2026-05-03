# Task Brief: Session Step Shared View-Model And Renderer (10/10)

## Metadata

- `id`: `2026-05-03-session-step-shared-view-model-renderer-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-03`
- `updated`: `2026-05-03`
- `mode`: `merged + closeout`

## Goal

Extract the next safe React layer for session-step UI so `Edit`, `Rearrange`, and `View` use a shared renderer contract instead of keeping core presentation chrome in `WorkoutEditor`.

## Audit And Reference

- Canonical contract: `docs/design/session-step-surface-contract.md`.
- Existing shared data layer: `components/my-library/workouts/sessionStepSurfaceContract.ts` from PR #570.
- Remaining concentration point: `WorkoutEditor` still owned mode tabs, view sections, collapsed cards, repeat cards, rearrange controls, delete/undo UI, mobile actions, and edit shells.
- Reference surface: manual pool builder in `WorkoutEditor`; AI generator is a parity consumer through `copyVariant="generator"`.
- Held surfaces: saved-session quick view, poolside note, workout PDF, Garmin-ready export, and program export keep current output paths in this slice.

## Implementation Slice

Add a React-only renderer under `components/my-library/workouts/` for mode shell, empty/undo status, `View` sections, collapsed cards, repeat cards, and rearrange controls. Keep editable fields, draft mutation, persistence/export/PDF logic, save/delete orchestration, and poolside settings in `WorkoutEditor`; document that boundary, update the design contract pointer, add focused tests, capture screenshot handoff, and record perf-budget `tighten`/`hold` without changing budgets unless owner approves.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim: `UX flow clarity`, `Visual design quality`, `Business logic correctness and data integrity`, `Stack-fit and dependency discipline`, `Testing and QA automation`.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                     | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One reference surface and shared renderer contract for manual and generated session-step modes.                        | brief + component diff + screenshots                       | `5/5`                   |
| UX flow clarity                               | `target`     | Edit/Rearrange/View keep current action hierarchy, ordering, and linked-rest behavior.                                 | component tests + screenshot handoff                       | `5/5`                   |
| Visual design quality                         | `target`     | Spacing, rails, labels, tones, and responsive behavior match approved after/reference screenshots.                     | after/reference screenshots                                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Renderer does not mutate drafts and preserves repeats, linked rests, post-set rests, and generated summaries.          | unit tests + diff review                                   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: private editor maintainability improves, no admin CRUD workflow change.                               | scope review                                               | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Mode controls, view lines, mobile toggles, and rearrange buttons keep labels, focus, and keyboard semantics.           | Testing Library assertions + Playwright spot check         | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, no intentional extra step render pass, and no obvious `/my-library/*` payload regression.           | build/perf budgets + local QA                              | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Renderer receives derived presentation input only; server/local draft ownership stays unchanged.                       | code review + tests                                        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no route caching changes; renderer input recomputes from current props/state.                         | component tests                                            | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty, partial, malformed, and pending-delete states render deterministic fallback UI.                                 | negative-path component tests                              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected routes and APIs are unchanged and covered by existing gates.                                | scope review + existing tests                              | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data exposure or storage.                                                             | data review                                                | `4/5`                   |
| Content governance                            | `target`     | Step labels, rest wording, repeat wording, and generated-note suppression stay contract-governed.                      | contract review + tests                                    | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: editor controls stay available, no admin labels/statuses changed.                                     | manual QA                                                  | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is authenticated/private app UI with no metadata, sitemap, robots, or crawlable route changes.        | explicit SEO scope rationale                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content or crawl-safe AI-discoverable entity surface changes.                           | explicit AI discovery scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new event taxonomy; stable test IDs/action semantics are preserved by tests.                       | test-id/event diff review                                  | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, billing, or revenue workflow changes.                                   | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because no alerting, incident, support queue, or customer recovery workflow changes.                               | explicit support-ops scope rationale                       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no payout, refund, invoice, entitlement reporting, or finance reconciliation data changes.                 | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: centralized labels help later translation, no locale routing/storage added.                           | label centralization review                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use React/TypeScript composition, existing contract helpers, Tailwind tokens, lucide icons, and zero new dependencies. | dependency diff + code review                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge` cover the change.                      | tests + screenshots + `verify:pre-pr` / `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Refactor reduces future renderer drift without adding runtime services, heavy assets, or duplicate output engines.     | architecture closeout + diff review                        | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Code-only, no migration, rollbackable as one PR; perf decision recorded but not enacted by default.                    | PR diff + rollback note                                    | `5/5`                   |

## Stack, Data, And Identity Contracts

- React/Next.js: client-side shared renderer; no route/action/API/cache boundary changes.
- TypeScript/domain/data: `SessionDraft`/`SessionDraftStep` stay canonical; renderer input is display-only.
- Supabase/data layer: `N/A` with rationale: no schema, RLS, auth, storage, or generated DB type changes.
- External services/tools: `N/A` with rationale: no external SDK, webhook, secret, retry, or idempotency changes.
- UI/sync/cache: reuse current Tailwind/lucide/responsive patterns; renderer never mutates drafts; existing save APIs and cache behavior stay unchanged.
- Identity/compatibility: workout IDs, step IDs, repeat IDs, display-name mutability, saved draft schema, poolside/PDF/Garmin/program readers remain unchanged.

## Scope

- In scope: audit boundary, shared renderer, `WorkoutEditor` wiring, code documentation, contract doc update, targeted tests, screenshot handoff, perf decision record.
- Out of scope: schema changes, poolside/PDF/Garmin/program renderer migration, new dependencies, and budget tightening without owner approval.

## Acceptance Criteria

1. `WorkoutEditor` no longer owns the top-level React rendering for session-step mode shell, view sections, collapsed cards, repeat cards, and rearrange controls.
2. Manual pool builder remains reference for `Edit`, `Rearrange`, and `View`; AI generator keeps parity through the same renderer contract.
3. Linked top-level rests, repeat interval rests, post-set rests, standalone rests, and generated-note suppression remain unchanged.
4. New code documents ownership, presentation-only input/callback boundary, and non-obvious invariants.
5. Poolside note, PDF, Garmin-ready export, saved quick view, and program export outputs remain unchanged.
6. Screenshot handoff is approved before `verify:pre-pr`; `verify:pre-pr`, CI, and `verify:pre-merge` pass before merge readiness.

## Validation

- Before PR: `npm run lint:briefs`, targeted unit/component tests, screenshot handoff, `npm run verify:pre-pr`.
- Before merge recommendation: required CI green and `npm run verify:pre-merge`.

## Completion Record

- Completed: `2026-05-03`
- Merged PR: `#578`
- Merge commit: `ca16aa2`
- Implementation commit: `474b15a`
- Outcome: `Edit`, `Rearrange`, and `View` session-step chrome now share `SessionStepSurfaceRenderer`; `WorkoutEditor` retains draft mutation, persistence/export/PDF orchestration, and editable fields.
- Screenshot handoff: owner-approved after/reference captures in `/Users/stianvikra/freeswimming/output/session-step-shared-renderer-2026-05-03`.
- Validation:
  - targeted Vitest: PASS, `tests/unit/session-step-surface-renderer.test.tsx`, `tests/unit/session-step-surface-contract.test.ts`, `tests/unit/workout-builder-hub.test.tsx`, `tests/unit/session-generator-panel.test.tsx`;
  - `npm run verify:pre-pr`: PASS, full lane, `artifacts/test-runs/20260503-163254/verify.log`;
  - GitHub CI for PR `#578`: PASS (`Analyze`, `CodeQL`, `Vercel`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`, `size-check`, `verify`);
  - `npm run verify:pre-merge`: PASS on `474b15a`, marker `artifacts/verify-pre-merge/20260503-151333.json`, Playwright `108 passed`, `348 skipped`.
- Perf-budget decision: hold. The gate recommended considering a future stretch-target tighten after green trend evidence, but this renderer extraction intentionally did not change route budgets.
- Rollback: revert merge commit `ca16aa2`; no schema, data repair, cache purge, finance action, or customer communication is required.

## Closeout Score Outcome

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

- `10/10 claim`: yes

| Category                                      | Achieved Score | Evidence                                                                                       | Notes                                                   |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#578`, design contract update, and approved screenshots.                                   | Manual and generated surfaces use the shared renderer.  |
| UX flow clarity                               | `5/5`          | Owner-approved screenshot handoff and renderer unit tests.                                     | Edit/Rearrange/View hierarchy stayed stable.            |
| Visual design quality                         | `5/5`          | After/reference desktop and mobile captures.                                                   | No intended visual drift from the reference surface.    |
| Business logic correctness and data integrity | `5/5`          | Renderer tests, existing contract tests, full pre-PR and pre-merge gates.                      | Renderer is presentation-only and does not mutate data. |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions plus full Playwright lane.                                          | Labels and button semantics preserved.                  |
| Performance (CWV + payloads)                  | `5/5`          | No new dependencies, build/perf budgets passed in gates.                                       | Budget tightening deferred by explicit hold decision.   |
| Data placement and sync boundaries            | `5/5`          | Component boundary docs and diff review.                                                       | Draft/server ownership unchanged.                       |
| Reliability and failure handling              | `5/5`          | Empty, undo, section, repeat, delete, and mobile action tests.                                 | Fallback UI remains deterministic.                      |
| Content governance                            | `5/5`          | Contract review and shared copy/summary rendering.                                             | Step/rest wording remains centralized.                  |
| Stack-fit and dependency discipline           | `5/5`          | React/TypeScript composition with existing Tailwind/lucide patterns and zero new dependencies. | No external service or framework change.                |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot approval, `verify:pre-pr`, CI, and `verify:pre-merge`.              | Local and remote gates passed before merge.             |
| Scalability and cost efficiency               | `5/5`          | Shared renderer replaces duplicated presentation ownership without runtime infrastructure.     | Future session-step parity work has a smaller surface.  |
| DevOps and rollback readiness                 | `5/5`          | Single merged PR with no migration; rollback is `git revert ca16aa2`.                          | Post-merge preflight surfaced this lifecycle closeout.  |

## Checkpoint Log

- `2026-05-03 | planning | audited current session-step architecture after PR #570/#574/#575; shared view-model helpers exist, but WorkoutEditor still owns most React rendering and mode orchestration | next: discuss scope before implementation`
- `2026-05-03 | in-progress | owner approved renderer extraction scope, code-documentation requirements, design-contract cleanup, and perf-budget hold-by-default decision; moved brief to in-progress on branch feat/session-step-shared-renderer | next: implement shared renderer/input boundary`
- `2026-05-03 | in-progress | extracted shared session-step surface chrome/View renderer with presentation-only docs, updated contract pointer, and added renderer unit coverage; targeted vitest, typecheck, lint, and lint:briefs passed | next: screenshot handoff`
- `2026-05-03 | in-progress | owner approved after/reference screenshot handoff for manual builder Edit/Rearrange/View and generator consumer View parity | next: run verify:pre-pr`
- `2026-05-03 | in-progress | npm run verify:pre-pr first hit transient poolside save-image metrics navigation failure outside renderer scope; isolated rerun passed; no e2e helper change is kept in this PR after size-check reduction | next: rerun gate before PR update`
- `2026-05-03 | in-progress | npm run verify:pre-pr passed full lane on size-check-compatible diff (108 passed, 348 skipped; log artifacts/test-runs/20260503-163254/verify.log). Perf trend recommended tighten after 3 weekly green runs, but decision is hold without owner approval to change budgets | next: amend, push, PR, CI, verify:pre-merge`
- `2026-05-03 | merged | PR #578 merged to main as ca16aa2 after owner screenshot approval, local verify:pre-pr, green CI, and local verify:pre-merge | next: post-merge preflight`
- `2026-05-03 | done | post-merge preflight surfaced this lifecycle closeout; brief moved from in-progress to done with all target categories closed at 5/5 and 10/10 claim recorded | next: docs-only closeout PR`
