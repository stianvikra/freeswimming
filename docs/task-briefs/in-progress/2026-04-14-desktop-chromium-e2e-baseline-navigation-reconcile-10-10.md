# Task Brief: Desktop Chromium E2E Baseline Navigation Reconcile (10/10)

## Metadata

- `id`: `2026-04-14-desktop-chromium-e2e-baseline-navigation-reconcile-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-14`
- `updated`: `2026-04-14`

## Goal

Restore local `verify:pre-merge` stability by fixing the current desktop-Chromium baseline failures caused by transient route/navigation instability across auth, course, and My Library end-to-end flows.

## Dependencies And Boundaries

- Triggering blocker:
  - local `npm run verify:pre-merge` after PR `#424` passed GitHub CI but failed on unrelated desktop-Chromium Playwright coverage outside the swim-builder slice.
- Adjacent but out-of-scope slice:
  - [2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10.md)
- Locked scope decisions for this slice:
  - keep swim-builder UI/code unchanged unless a direct shared test-helper dependency requires a harmless adjustment,
  - fix route/navigation flake only where the current baseline is red,
  - prefer shared Playwright helper hardening over one-off per-test hacks,
  - do not fold in new product UX work, private-preview redesign, or poolside-brand work.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                       | Evidence                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------- |
| Product goals and IA                          | `N/A`        | N/A because this slice does not change product IA; it restores local baseline verification only.                                                         | explicit scope rationale        | `N/A`                   |
| UX flow clarity                               | `supporting` | Supporting only: navigation into covered auth/My Library routes should become deterministic again during automated QA.                                   | targeted e2e                    | `4`                     |
| Visual design quality                         | `N/A`        | N/A because this slice does not change visual presentation or component styling.                                                                         | explicit scope rationale        | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Route retries/fallbacks must not change app truth or bypass real assertions; tests must still validate the same canonical outcomes after stabilization.  | code review + targeted e2e      | `5`                     |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing UX or workflow labels change here.                                                                                          | explicit scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice changes automation/navigation resilience only, not rendered accessibility semantics.                                              | explicit scope rationale        | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: helper changes must not materially slow covered route entry or introduce unbounded retry loops.                                         | targeted e2e + verify           | `4`                     |
| Data placement and sync boundaries            | `supporting` | Supporting only: fixes may need clearer wait/retry boundaries around server-canonical auth/progress/library state, but must not move ownership.          | brief contract + code review    | `4`                     |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice does not change runtime caching strategy; it only hardens test navigation and readiness handling.                                 | explicit scope rationale        | `N/A`                   |
| Reliability and failure handling              | `target`     | The current seven desktop-Chromium failures must pass locally without introducing hangs, cascading page closes, or frame-detach flake in covered routes. | targeted e2e + verify:pre-merge | `5`                     |
| Security and authz                            | `target`     | Auth/dev-bypass related test stabilization must preserve fail-closed behavior and existing auth assertions; no helper may silently bypass missing auth.  | code review + auth e2e          | `5`                     |
| Privacy and compliance                        | `N/A`        | N/A because no user-data handling, retention, or disclosure contract changes here.                                                                       | explicit scope rationale        | `N/A`                   |
| Content governance                            | `N/A`        | N/A because no content source-of-truth or publishing workflow changes here.                                                                              | explicit scope rationale        | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow contract changes here.                                                                                                     | explicit scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because route metadata, sitemap, and robots behavior are unchanged by this reconcile slice.                                                          | explicit scope rationale        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic/discoverability surface changes here.                                                                                     | explicit scope rationale        | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics schema or event payload contract changes here.                                                                                  | explicit scope rationale        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, or billing behavior changes.                                                                                       | explicit scope rationale        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice fixes local verification stability only; no support runbook or incident path changes are required.                                | explicit scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, or reporting behavior changes in this slice.                                                                     | explicit scope rationale        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale model, route structure, or translatable content contract changes here.                                                             | explicit scope rationale        | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Playwright and repo-native helper patterns only; do not add dependencies for flake handling.                                                | diff review                     | `5`                     |
| Testing and QA automation                     | `target`     | The current failing desktop-Chromium tests plus full local `verify:pre-merge` must pass, and the fix must reduce repeat flake rather than widen skips.   | targeted tests + verify gates   | `5`                     |
| Scalability and cost efficiency               | `N/A`        | N/A because no backend/runtime cost model changes here beyond bounded retry logic inside tests.                                                          | explicit scope rationale        | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the reconcile diff should remain small, test-focused, and easy to revert if it masks a deeper product bug.                              | git diff + PR scope             | `4`                     |

## Data Placement And Sync Contract

- Server-canonical data:
  - auth session state,
  - course progress rows,
  - athlete profile data,
  - dryland session records,
  - generated workout drafts saved into My Library,
  - new-content notice API payloads.
- Local data:
  - Playwright navigation retries,
  - route-ready waits,
  - transient retry/fallback behavior inside test helpers only.
- Sync policy:
  - helpers may retry route entry or wait for client readiness when transient route compilation/session refresh races occur,
  - helpers must not fabricate canonical success; all assertions still rely on real server/API/UI state.
- Retention and sensitivity:
  - no new stored client data is introduced,
  - no secrets or raw credentials are added to tests.
- Cache/invalidation:
  - unchanged; this slice only stabilizes the test path into existing routes.

## Identity And Rename Contract

- Canonical stable ID:
  - existing lesson IDs, workout IDs, dryland session IDs, and profile record IDs remain canonical.
- Human-readable identifiers:
  - route labels and test names may change only if needed for clarity; no user-facing rename is planned.
- Mutability rules:
  - this slice does not mutate persisted identity contracts.
- Rename vs repurpose policy:
  - N/A because no persisted entity is renamed or repurposed here.
- Compatibility contract:
  - existing test IDs and route contracts should be preserved unless updated in the same targeted test slice.
- Observability and repair:
  - failures are tracked via targeted Playwright reruns and full `verify:pre-merge`.

## Scope

- `tests/e2e/auth-sign-in-ux.spec.ts`
- `tests/e2e/contact-form-a11y.spec.ts`
- `tests/e2e/course-common-mistakes-visibility.spec.ts`
- `tests/e2e/course-progress-sync.spec.ts`
- `tests/e2e/drawer-focus-trap.spec.ts`
- `tests/e2e/my-library-athlete-profile.spec.ts`
- `tests/e2e/my-library-dryland-builder.spec.ts`
- `tests/e2e/my-library-generator-intake.spec.ts`
- `tests/e2e/my-library-new-content-notice.spec.ts`
- `tests/e2e/my-library-program-export.spec.ts`
- `tests/e2e/my-library-training-context.spec.ts`
- `tests/e2e/my-library-workout-builder.spec.ts`
- `tests/e2e/soft-launch-banner.spec.ts`
- `tests/e2e/utils/transient-navigation.ts`
- this brief and checkpoint updates tied to the reconcile slice

## Out Of Scope

- Swim-session-builder product/UI changes.
- Poolside-note visual/brand work.
- Private preview access redesign.
- Global logo/header cleanup.
- Dryland product expansion beyond current failing baseline test coverage.
- New feature work or broad refactors unrelated to the failing routes.

## Acceptance Criteria

1. The current local baseline blockers in `auth-sign-in-ux`, `contact-form-a11y`, `course-common-mistakes-visibility`, `course-progress-sync`, `drawer-focus-trap`, `my-library-athlete-profile`, `my-library-dryland-builder`, `my-library-generator-intake`, `my-library-new-content-notice`, `my-library-program-export`, `my-library-training-context`, `my-library-workout-builder`, and `soft-launch-banner` pass locally where the environment supports them.
2. Any new route retry helper is bounded, deterministic, and reused across relevant failing specs instead of copied ad hoc.
3. Auth/dev-bypass and route fallback logic still skips cleanly when the environment truly lacks the required schema/session capability.
4. The swim-builder route coverage still passes after the reconcile changes.
5. `npm run verify:pre-pr` passes locally on this branch before PR update, and `npm run verify:pre-merge` passes locally before merge recommendation.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted Playwright runs for the previously failing specs
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100`
  - Desktop Chromium is the required primary environment because the current failures are desktop-Chromium-only.
- Preview:
  - N/A for this slice unless a product bug, rather than a local baseline/test issue, is discovered.

## Constraints

- Do not mask real regressions by converting failing assertions into skips.
- Do not weaken auth/progress/library assertions just to make the suite green.
- Keep the reconcile diff narrow and test-focused.
- Prefer extracting a shared helper if three or more specs need the same transient navigation hardening.

## 10/10 Quality Bar

- Covered test routes must become deterministic without inflating timeouts blindly.
- Required states remain explicit: route compiling, session refresh, transient 404/abort, and environment-not-available skip conditions.
- Retry logic must stay bounded and observable.
- Assertions must still prove the real user/admin workflow outcomes, not just successful navigation.
- No silent data corruption, fake success state, or auth bypass weakening is allowed.

## Help / Guide Impact

- `N/A` because this slice changes local baseline verification behavior only and does not change any public or operator-facing workflow contract.

## Checkpoint Log

- `2026-04-14 | in-progress | brief created after local pre-merge failed outside PR #424 scope; initial desktop-chromium blockers were auth-sign-in sent-state route load, course progress sync poll readiness, athlete profile route fallback, dryland route fallback after delete, generator-intake reopen route fallback, and new-content notice route fallback/retry behavior | next: extract the common route-transient pattern, patch failing specs, run targeted desktop-chromium verification, then rerun full verify:pre-merge`
- `2026-04-14 | in-progress | full verify:pre-pr later exposed additional desktop-chromium blockers in my-library-program-export and my-library-training-context, plus longer full-matrix timeout pressure in generator-intake/new-content-notice long flows | next: replace fragile client-nav clicks with deterministic href navigation where UI click behavior is not the assertion target, widen only the longest My Library flow timeouts, rerun targeted desktop-chromium specs, then rerun full verify`
- `2026-04-14 | in-progress | targeted desktop-chromium rest-pack is now green after shared transient navigation helper extraction and route-entry stabilization across generator intake, new-content notice, program export, and training context flows | next: run brief lint with the tracked brief, then rerun full verify:pre-pr and, if green, continue to PR closeout and verify:pre-merge`
- `2026-04-14 | in-progress | full \`npm run verify:pre-pr\` is now green (\`94 passed\`, \`326 skipped\`, \`0 failed\`) after expanding the shared transient-navigation helper into remaining red baseline specs including contact-form-a11y, course-common-mistakes-visibility, drawer-focus-trap, soft-launch-banner, and my-library-workout-builder | next: lint the updated brief if needed, stage the reconcile diff, commit/push, update the PR, then run \`npm run verify:pre-merge\` before merge recommendation`
