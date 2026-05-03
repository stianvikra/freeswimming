# Task Brief: 10/10 Closeout Evidence Enforcement

## Metadata

- `id`: `2026-05-03-10-10-closeout-evidence-enforcement`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-03`
- `updated`: `2026-05-03`

## Goal

Make 10/10 closeout claims systemically enforceable by requiring changed `done` task briefs to record achieved target-category scores, evidence, critical target categories, and an explicit 10/10 claim state.

## Why This Brief Exists

- The repo already requires scorecard mapping before work starts.
- `npm run lint:briefs` currently validates planned scorecard structure, but it does not hard-fail a changed closeout brief that lacks achieved `0-5` scores and evidence.
- Without a closeout lint gate, "10/10" can remain a chat/process claim instead of a repository-enforced contract.
- The first fix should be narrow: enforce future changed closeout briefs without retroactively breaking historical briefs that are not touched.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Future closeout briefs must make 10/10 readiness auditable through explicit achieved scores and claim state.                                                            | script tests + docs review                     | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this is a lint/tooling governance slice with no user-facing runtime flow or UI state.                                                                       | explicit UX scope rationale                    | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no UI, layout, typography, or visual artifact.                                                                                                 | explicit visual scope rationale                | `N/A`                   |
| Business logic correctness and data integrity | `target`     | The linter must deterministically detect changed `done` briefs missing achieved target scores, evidence, critical targets, or 10/10 claim state without mutating files. | unit tests + lint runs                         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, CRUD surface, or operator input flow changes.                                                                                     | explicit admin scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no interactive UI or semantic markup changes.                                                                                                               | explicit a11y scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: lint additions should stay lightweight and not add runtime payload or dependency cost.                                                                 | dependency diff + targeted test runtime        | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no runtime data storage, local sync, server-canonical entity, or browser/device state changes.                                                              | explicit data-boundary rationale               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route data, fetch cache, revalidation, or stale-read behavior changes.                                                                                   | explicit cache scope rationale                 | `N/A`                   |
| Reliability and failure handling              | `target`     | The linter must fail closed for malformed closeout evidence and produce actionable errors.                                                                              | negative-path unit tests                       | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth boundary changes, but stricter closeout gates reduce chance that security target gaps are undocumented.                                        | scope review                                   | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no privacy behavior changes, but closeout evidence enforcement makes future privacy/compliance target gaps explicit.                                   | scope review                                   | `4/5`                   |
| Content governance                            | `target`     | Task-brief lifecycle docs/template must define the required closeout evidence shape as the source of truth.                                                             | docs diff + lint tests                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin status/publish/edit workflow changes.                                                                                                              | explicit admin workflow rationale              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, or crawlable content changes.                                                                                   | explicit SEO scope rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content or AI-discoverable entity surface changes.                                                                                       | explicit AI discoverability rationale          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no runtime events, dashboards, KPI taxonomy, or analytics payload changes.                                                                                  | explicit analytics scope rationale             | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, billing, or revenue workflow changes.                                                                                    | explicit commerce scope rationale              | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: enforcement can make future support-ops target gaps explicit, but this slice changes no incident workflow or runbook execution path.                   | scope review                                   | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, refund, invoice, or reconciliation data changes.                                                                                        | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: future i18n target gaps become harder to omit at closeout, but this slice adds no locale routing or translation system.                                | scope review                                   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use the existing Node lint script and Vitest stack with zero new dependencies and no new CI service.                                                                    | dependency diff + unit tests                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused tests for valid and invalid closeout evidence plus run the relevant repo gates.                                                                             | targeted Vitest + verify gates                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: changed-brief-only enforcement avoids expensive full historical migration while improving future quality.                                              | script behavior review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The change must be code/docs-only, reversible as one PR, and integrated into existing `lint:briefs` / verify gates.                                                     | PR diff + `verify:pre-pr` / `verify:pre-merge` | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - `N/A` because no app component, route, API handler, cache, or server/client boundary changes.
- TypeScript/domain contracts:
  - use deterministic parser logic in the existing Node script,
  - expose focused helpers for tests only where useful,
  - avoid broad markdown parser dependencies.
- Supabase/data layer:
  - `N/A` because no database, RLS, migration, storage, or generated DB type changes.
- External services/tools:
  - `N/A` because no new external service, SDK, webhook, secret, or network integration changes.
- UI system:
  - `N/A` because no UI or screenshot handoff is needed.
- Testing:
  - add unit tests for scorecard/closeout lint behavior,
  - run brief lint and relevant script tests,
  - run full gates before PR/merge readiness because scripts/tests are touched.

## Data Placement And Sync Contract

- Server-canonical data:
  - `N/A`; no runtime data entity changes.
- Local-only data:
  - lint script reads repository files and git diff only.
- Sync policy:
  - no sync behavior.
- Retention and sensitivity:
  - no storage or sensitive data.
- Cache/invalidation:
  - no route or data cache changes.

## Identity And Rename Contract

- Canonical stable ID:
  - task-brief file paths remain lifecycle identity.
- Human-readable identifiers:
  - brief titles remain editable documentation labels.
- Mutability rules:
  - this slice may update template wording and script helper names only.
- Rename vs repurpose policy:
  - no existing brief is repurposed.
- Compatibility contract:
  - historical untouched briefs must not start failing normal changed-brief lint.
- Observability and repair:
  - linter error messages must point to the missing closeout evidence field.

## Scope

- Extend `scripts/lint-task-brief-scorecard.mjs` so changed `done` briefs require:
  - `## Completion Record`,
  - achieved score table covering every target category,
  - score values in `0-5` or `0/5-5/5` form,
  - non-empty evidence per target,
  - critical target categories for 10/10 claim,
  - explicit `10/10 claim: yes/no` state,
  - all critical target categories scored `5/5` when claiming 10/10.
- Add focused unit tests for valid and invalid closeout evidence.
- Update task brief template and PR checklist wording to document the enforced shape.
- Keep enforcement changed-brief scoped to avoid mass historical cleanup.

## Out Of Scope

- Retrofitting all historical `done` briefs.
- Reworking the whole brief lifecycle toolchain.
- Changing product runtime code.
- Changing CI provider configuration.
- Changing the planned session-step renderer brief.
- Merging without owner approval.

## Acceptance Criteria

1. `npm run lint:briefs` still validates planned/in-progress scorecard mapping as before.
2. Changed `done` briefs without closeout score evidence fail with actionable errors.
3. Changed `done` briefs with complete achieved scores and explicit `10/10 claim` pass.
4. 10/10 claims fail if any critical target category is not scored `5/5`.
5. Historical untouched briefs are not forced through a mass migration by normal changed-brief lint.
6. Template/checklist docs describe the enforced closeout evidence shape.
7. Targeted tests and full pre-PR/pre-merge gates pass before merge readiness.

## Validation

- Targeted:
  - `npm run test:unit -- tests/unit/task-brief-scorecard-lint.test.ts`
  - `npm run lint:briefs:all` if the new in-progress brief is still uncommitted or to sanity-check broad parsing behavior.
- Before PR:
  - `npm run verify:pre-pr`
- Before merge recommendation:
  - required CI green,
  - `npm run verify:pre-merge`.

## Local Tooling Prerequisite

- Use repo Node/npm through `.nvmrc`.
- Before reporting `npm`/`node` missing, bootstrap `nvm`.

## Manual QA Environments

- `N/A` because this is non-visual tooling and docs governance work.

## Constraints

- No new dependencies.
- Keep linter output actionable and concise.
- Do not include the separate planned session-step renderer brief in this PR unless explicitly approved.

## Completion Record

- To be filled after merge.

## Checkpoint Log

- `2026-05-03 | working tree | created in-progress governance brief after owner approved doing the systemic 10/10 enforcement slice before the session-step renderer implementation | next: implement closeout lint enforcement, tests, and docs updates`
- `2026-05-03 | working tree | implemented changed-done closeout lint enforcement, focused Vitest coverage, and template/PR checklist docs updates; targeted tests, lint:briefs:all, lint, and typecheck pass | next: run pre-PR gate, commit, push, and open PR`
