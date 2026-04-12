# Task Brief: Repo Verification Blocker Stabilization (10/10)

## Metadata

- `id`: `2026-04-12-repo-unit-timeout-stabilization-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-12`
- `updated`: `2026-04-12`

## Goal

Stabilize the known repo-wide verification blockers so `npm run verify:pre-pr` and `npm run verify:pre-merge` are no longer blocked by unrelated test-timeout or admin-notes workflow flake/regression issues.

## Why This Brief Exists

- The swim-builder branch now passes its own targeted tests.
- Full repo verification was initially blocked by two unrelated unit tests timing out at Vitest's default `5000ms`.
- After those were stabilized, full repo verification still failed on two deterministic `admin-notes-workflow` E2E blockers:
  - transient Supabase cleanup fetch failures in test artifact cleanup,
  - quick-capture overlay state persisting into Notes and intercepting interactions.
- Those failures block merge readiness even though they are outside the swim-builder slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                       | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Repo operators can run the normal verification commands without the currently known false-negative blockers in unit and admin-notes E2E coverage.    | local verify output                       | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice changes repo test stability only, not a user-facing workflow.                                                                 | explicit scope rationale                  | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no visual surface changes.                                                                                                               | explicit scope rationale                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Stabilization must preserve the existing assertions, fix the quick-capture-to-Notes transition cleanly, and avoid masking real admin-notes failures. | test diff review + targeted runs          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin UX or edit flow changes are intended.                                                                                           | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no product UI semantics change.                                                                                                          | explicit scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route/runtime performance budget changes are in scope.                                                                                | explicit scope rationale                  | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice changes verification tests only, not state ownership boundaries.                                                              | explicit scope rationale                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache behavior changes.                                                                                                               | explicit scope rationale                  | `N/A`                   |
| Reliability and failure handling              | `target`     | The known unit timeouts and the two admin-notes E2E blockers no longer fail under local isolated runs or the repo-wide pre-PR gate.                  | targeted vitest + `npm run verify:pre-pr` | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth or access-control behavior changes.                                                                                              | explicit scope rationale                  | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data handling changes.                                                                                                           | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `N/A`        | N/A because no content model or publishing contract changes.                                                                                         | explicit scope rationale                  | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice does not change admin workflow behavior, only a repo test around it.                                                          | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata or crawl behavior changes.                                                                                             | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic/canonical content changes.                                                                                            | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics contract changes.                                                                                                           | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing or entitlement behavior changes.                                                                                              | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice stabilizes local verification only; it does not change production support or incident workflows.                              | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow changes.                                                                                                | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale, translation, or multilingual behavior changes.                                                                                | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Vitest/test patterns only; add no dependency and avoid broad harness rewrites.                                                          | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | The known timeout tests and affected admin-notes E2E flow pass deterministically, and the full pre-PR lane is no longer blocked by them.             | targeted vitest + full verify             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: use minimal stabilization rather than widening repo-wide global test timeouts.                                                      | test diff review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The change is narrow, easy to revert, and validated through the standard pre-PR/pre-merge gates.                                                     | git diff + verify output                  | `5/5`                   |

## Data Placement And Sync Contract

- `N/A`
- Rationale: this slice changes repo tests/verification only, not persisted runtime state.

## Identity And Rename Contract

- `N/A`
- Rationale: no persisted or linkable entity identity changes.

## Scope

- Stabilize `tests/unit/admin-context-notes-panel.test.tsx`.
- Stabilize `tests/unit/session-generator-panel.test.tsx`.
- Stabilize the failing `tests/e2e/admin-notes-workflow.spec.ts` coverage with the smallest safe fix:
  - keep quick-capture → Notes transition usable,
  - add transient retry only to test cleanup helpers where network flake is the real failure mode,
  - avoid weakening the admin-notes assertions themselves.
- Re-run targeted tests and full repo verification gates.

## Out Of Scope

- New product features.
- Swim-builder feature behavior beyond what is needed to confirm this branch.
- Broad global `testTimeout` increases for the entire repo.
- Broad admin-notes product redesign beyond what is needed to restore verification stability.
- Unrelated test cleanup beyond what blocks the standard verify gates right now.

## Acceptance Criteria

1. `tests/unit/admin-context-notes-panel.test.tsx` passes locally.
2. `tests/unit/session-generator-panel.test.tsx` passes locally.
3. The stabilization preserves the existing behavioral assertions in both tests.
4. `tests/e2e/admin-notes-workflow.spec.ts` targeted failures are stabilized without weakening the intended admin-notes coverage.
5. `npm run verify:pre-pr` is no longer blocked by these known failures.
6. If `verify:pre-pr` passes, `npm run verify:pre-merge` is run before merge recommendation.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/admin-context-notes-panel.test.tsx`
- `npx vitest run tests/unit/session-generator-panel.test.tsx`
- `npx playwright test tests/e2e/admin-notes-workflow.spec.ts --project=desktop-chromium --grep "shows recovery when clipboard image paste is blocked|allowlisted admin can quick-capture a dashboard note and jump into Notes"`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm available locally.
- Validation runs from repo root.

## Manual QA Environments

- `N/A`
- Rationale: repo-test stabilization only.

## Constraints

- Do not hide real assertion failures behind blanket global timeouts or broad E2E retries.
- Prefer per-test explicit timeouts and narrow test-helper retry over repo-wide timeout changes.
- Keep the diff narrow enough to revert independently from the swim-builder slice.

## 10/10 Quality Bar

- Verification should fail on real regressions, not just on slow-but-correct tests or transient cleanup fetches.
- Stabilization must stay local to the known blockers.
- The repo gate should become more trustworthy, not just more permissive.

## Help/Guide Impact

- `N/A`
- Rationale: no operator-facing product Help/Guide contract changes.

## Checkpoint Log

- `2026-04-12 | done | merged with the swim-builder follow-up via PR #415; local npm run verify:pre-pr and npm run verify:pre-merge were green before merge recommendation, and required CI checks passed before merge | next: move brief to done`
- `2026-04-12 | in-progress | opened focused follow-up slice after swim-builder work proved green in targeted coverage but full repo verify stayed blocked by isolated unit-test timeouts in admin-context-notes-panel and session-generator-panel | next: stabilize the two tests, rerun targeted unit coverage, then retry full verify`
- `2026-04-12 | in-progress | unit-timeout blockers fixed and targeted vitest runs passed; first full pre-PR rerun then exposed two remaining admin-notes E2E blockers in cleanup fetch stability and quick-capture overlay transition into Notes | next: fix the two admin-notes blockers, rerun targeted Playwright, then rerun full verify`
- `2026-04-12 | in-progress | follow-up verification stabilization is green locally: targeted vitest + targeted Playwright passed, then full npm run verify:pre-pr and npm run verify:pre-merge both passed after the quick-capture closeout fix and transient cleanup retry hardening | next: commit, push, open PR, and confirm CI merge readiness`
