# Task Brief: Pre-Merge Playwright Regression Hardening

## Metadata

- `id`: `2026-04-04-pre-merge-playwright-regression-hardening`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-04`
- `updated`: `2026-04-04`

## Goal

Restore strict local `verify:pre-merge` reliability by hardening the `course common mistakes` and `generator intake reopen` Playwright contracts against legitimate app-load timing.

## Scope

- Harden the course page with non-user-facing test hooks that expose content-resolution readiness.
- Update `course-common-mistakes-visibility` to wait for resolved course content before asserting lesson-local collapse state.
- Update `my-library-generator-intake` to wait for builder client readiness before toggling metadata and reopening generated drafts.
- Validate the repaired baseline with targeted tests and a full local `npm run verify:pre-merge`.

## Out Of Scope

- No new product UX or copy changes.
- No schema, API contract, or data-model changes.
- No changes to course pedagogy, workout builder authoring rules, or admin-note workflows.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                 | Evidence                                            |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Product goals and IA                          | `supporting` | Existing route purpose and navigation stay unchanged while test contracts align to real page readiness.          | scope review                                        |
| UX flow clarity                               | `supporting` | Hardening must not change visible flow or introduce new dead-end states.                                         | out-of-scope review + local regression coverage     |
| Visual design quality                         | `N/A`        | N/A because this hotfix adds non-visual test hooks and test wait logic only.                                     | explicit scope rationale                            |
| Business logic correctness and data integrity | `target`     | Test assertions must bind to the resolved active lesson and hydrated builder state, not stale transitional UI.   | updated tests + full `verify:pre-merge`             |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing surface is changed.                                                                  | explicit scope rationale                            |
| Accessibility (a11y)                          | `supporting` | Added attributes must not alter semantics or focus behavior on changed routes.                                   | route review + full e2e sweep                       |
| Performance (CWV + payloads)                  | `supporting` | Test-only attributes and waits add no material runtime regression on `/course` or builder routes.               | `npm run build` + perf budgets in pre-merge         |
| Data placement and sync boundaries            | `N/A`        | N/A because no new local/server ownership or sync contract is introduced.                                         | explicit scope rationale                            |
| Caching and invalidation strategy             | `supporting` | Tests must wait for server-canonical content resolution instead of assuming immediate client parity.             | updated course test flow                            |
| Reliability and failure handling              | `target`     | Strict local `verify:pre-merge` must pass without the previous deterministic Playwright blockers.                | targeted playwright + full `verify:pre-merge`       |
| Security and authz                            | `supporting` | New test hooks must remain non-sensitive and not relax existing protected-route behavior.                        | code review + full regression gate                  |
| Privacy and compliance                        | `supporting` | Exposed test attributes must not reveal secret or user-sensitive data.                                           | code review                                         |
| Content governance                            | `N/A`        | N/A because no content source-of-truth or publishing policy changes.                                             | explicit scope rationale                            |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels or operations change.                                                       | explicit scope rationale                            |
| SEO and crawlability                          | `N/A`        | N/A because changed attributes are internal testing aids on authenticated/interactive flows.                     | explicit scope rationale                            |
| AI discoverability                            | `N/A`        | N/A because this hotfix does not alter public semantic content strategy.                                         | explicit scope rationale                            |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy or KPI instrumentation changes.                                                    | explicit scope rationale                            |
| Commerce and revenue ops                      | `N/A`        | N/A because no purchase, entitlement, or checkout behavior changes.                                              | explicit scope rationale                            |
| Incident response and support operations      | `supporting` | Restored deterministic regression coverage improves confidence in release triage for unrelated PRs.              | full `verify:pre-merge` pass evidence               |
| Finance and reporting operations              | `N/A`        | N/A because this hotfix does not affect billing, payouts, or reconciliation surfaces.                           | explicit scope rationale                            |
| i18n operational readiness                    | `N/A`        | N/A because no new user-facing copy or locale-bound model fields are introduced.                                | explicit scope rationale                            |
| Stack-fit and dependency discipline           | `target`     | Fix stays within existing Next.js and Playwright patterns with no new dependencies.                              | scope review + diff                                 |
| Testing and QA automation                     | `target`     | Targeted tests and full local release gate must both pass after the hardening.                                   | targeted playwright + `npm run verify:pre-merge`    |
| Scalability and cost efficiency               | `supporting` | Reliability fix should avoid repeated reruns and reduce wasted local/CI cycles.                                  | restored green gate                                 |
| DevOps and rollback readiness                 | `supporting` | Changes remain isolated and easy to revert if a narrower test strategy is later preferred.                       | small diff + no schema/runtime contract migrations  |

## Acceptance Criteria

- `tests/e2e/course-common-mistakes-visibility.spec.ts` no longer fails because it races unresolved course content.
- `tests/e2e/my-library-generator-intake.spec.ts` no longer fails because it toggles builder metadata before client readiness.
- `/course` exposes only neutral, non-sensitive readiness markers for tests.
- Local `npm run verify:pre-merge` passes from a clean slate on the hotfix branch.

## Validation

- `npx eslint app/course/page.tsx tests/e2e/course-common-mistakes-visibility.spec.ts tests/e2e/my-library-generator-intake.spec.ts`
- `npm run typecheck`
- `npx playwright test tests/e2e/course-common-mistakes-visibility.spec.ts tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium`
- `npm run verify:pre-merge`

## Constraints

- Keep the fix minimal and regression-focused.
- Do not change user-visible labels, layouts, or workflow semantics.
- Do not reintroduce the previous `verify:pre-merge` blockers via brittle waits or arbitrary long sleeps.

## 10/10 Quality Bar

- Deterministic test contracts that bind to canonical route readiness instead of transitional UI state.
- No new flaky waits; synchronization must reflect actual application state.
- Added runtime attributes must be inert for users and safe for production.
- Full local release gate must pass without manual intervention.

## Implementation Checkpoint Log

- `2026-04-04` | `working tree` | hotfix brief created after reproducing strict local `verify:pre-merge` blockers on `course-common-mistakes-visibility` and `my-library-generator-intake`. | next: land minimal readiness/test hardening and rerun targeted validation.
- `2026-04-04` | `working tree` | implemented readiness hardening:
  - added neutral course readiness attributes on `app/course/page.tsx`,
  - updated `course-common-mistakes-visibility` to wait for resolved content and active lesson parity,
  - updated `my-library-generator-intake` to wait for builder client readiness and stable metadata-toggle interaction.
  - validation:
    - `npx eslint app/course/page.tsx tests/e2e/course-common-mistakes-visibility.spec.ts tests/e2e/my-library-generator-intake.spec.ts`,
    - `npm run typecheck`,
    - `npx playwright test tests/e2e/course-common-mistakes-visibility.spec.ts tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium`,
    - `npm run verify:pre-merge`.
  - next: package hotfix branch, run pre-pr gate on final diff, and open PR.
