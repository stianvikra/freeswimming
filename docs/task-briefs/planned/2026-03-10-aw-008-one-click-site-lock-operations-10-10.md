# Task Brief: AW-008 One-Click Site-Lock Operations (10/10)

## Metadata

- `id`: `2026-03-10-aw-008-one-click-site-lock-operations-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-10`
- `updated`: `2026-03-10`

## Goal

Enable safe, auditable, one-click site lock/unlock operations (`preview` and `production`) without manual env editing.

## Why This Brief Exists

- AW-008 is currently `planned` in backlog but had no dedicated implementation brief.
- Current env-controlled lock model is correct for security, but operators need deterministic ergonomics.
- This brief defines measurable 10/10 thresholds before implementation starts.

## Scope

- Controlled workflow-dispatch operations for:
  - `lock_on`,
  - `lock_off`.
- Explicit environment targets:
  - `preview`,
  - `production`.
- Mandatory deployment + smoke verification after each operation.
- Auditability expectations:
  - who triggered operation,
  - target environment,
  - result,
  - rollback path.
- Operator-facing runbook/checklist requirements.

## Out Of Scope

- Direct runtime toggles in app UI.
- Freeform environment mutation outside allowlisted lock action.
- Broader config management redesign beyond site-lock operations.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `SITE_LOCK_ENABLED` value in target Vercel environment.
  - workflow run logs/artifacts as canonical operation audit evidence.
- Local-only:
  - transient operator input while triggering workflow.
- Sync behavior:
  - workflow dispatch must apply only allowlisted action+environment pairs.
  - successful run must redeploy and validate smoke checks before complete.
  - failed run must return deterministic failure summary + rollback step.
- Invalidation:
  - deploy after lock state change must invalidate affected public-route behavior.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                         | Evidence                                            |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Product goals and IA                          | `target`     | Operators can complete `lock_on` or `lock_off` in <=2 minutes for preview with no manual env editing.    | timed runbook rehearsal + workflow logs             |
| UX flow clarity                               | `target`     | Workflow inputs and run summary are unambiguous for action, env, and next step on failure.               | workflow UI copy + manual QA                        |
| Visual design quality                         | `supporting` | N/A                                                                                                      | N/A                                                 |
| Business logic correctness and data integrity | `target`     | Only allowlisted action/env combinations execute; no accidental mutation outside site-lock scope.        | workflow input guards + negative-path tests         |
| Admin editor ergonomics                       | `supporting` | N/A                                                                                                      | N/A                                                 |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                                      | N/A                                                 |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                                      | N/A                                                 |
| Data placement and sync boundaries            | `target`     | Site-lock ownership remains Vercel env-canonical and is not duplicated in app runtime storage.           | brief contract + implementation review              |
| Caching and invalidation strategy             | `target`     | Post-operation deploy guarantees consistent public-route lock behavior with no stale unlocked responses. | smoke checks + deploy evidence                      |
| Reliability and failure handling              | `target`     | Failures surface deterministic rollback guidance and do not leave unknown lock state.                    | workflow summary + rollback drill                   |
| Security and authz                            | `target`     | Operation trigger is role-restricted and production requires explicit approval before apply.             | GitHub environment protection + run evidence        |
| Privacy and compliance                        | `target`     | Operation logs never expose secret values and include only operational metadata.                         | workflow logs + redaction checks                    |
| Content governance                            | `supporting` | N/A                                                                                                      | N/A                                                 |
| Admin workflow and editability                | `target`     | Operator workflow is documented end-to-end and reproducible without GitHub Actions expertise.            | runbook + checklist                                 |
| SEO and crawlability                          | `supporting` | N/A                                                                                                      | N/A                                                 |
| AI discoverability                            | `supporting` | N/A                                                                                                      | N/A                                                 |
| Analytics and KPI observability               | `supporting` | N/A                                                                                                      | N/A                                                 |
| Commerce and revenue ops                      | `supporting` | N/A                                                                                                      | N/A                                                 |
| Incident response and support operations      | `target`     | Support can prove lock state and last change actor/time within 5 minutes during incident triage.         | workflow audit artifact + support runbook           |
| Finance and reporting operations              | `supporting` | No finance/reporting key mutation is in scope; lock workflow changes only site-access controls.          | scoped action allowlist                             |
| i18n operational readiness                    | `supporting` | No locale-routing/content-localization contract change; scope limited to ops workflow dispatch behavior. | scope statement + changed-files diff                |
| Stack-fit and dependency discipline           | `target`     | Uses existing GitHub Actions + repo scripts without introducing new runtime dependencies.                | package diff + workflow diff                        |
| Testing and QA automation                     | `target`     | Negative-path and smoke-path automation validates lock transitions before merge and after rollout.       | test updates + `verify:pre-pr` + `verify:pre-merge` |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                                      | N/A                                                 |
| DevOps and rollback readiness                 | `target`     | Every operation has deterministic rollback action and post-rollback verification steps.                  | runbook + checklist + rehearsal evidence            |

## Acceptance Criteria

- Dedicated implementation branch can execute lock/unlock safely for preview and production.
- Production operation requires approval and leaves clear audit trail.
- Smoke checks prove expected behavior after both `lock_on` and `lock_off`.
- Failure path always includes deterministic rollback and verification steps.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Never expose secrets in workflow logs, PR bodies, or artifacts.
- Keep operation scope strictly to site-lock control and verification.
- Preserve fail-closed behavior for protected routes during partial failures.

## 10/10 Quality Bar

- Operator can execute and verify lock state with low cognitive load.
- No ambiguous operation state (`unknown`) after workflow completion.
- Rollback path is as short and deterministic as forward path.
- Runbook and checklist remain synchronized with shipped workflow behavior.

## Checkpoint Log

- `2026-03-10 | working tree | created AW-008 planned implementation brief with scorecard-complete thresholds and deterministic ops/rollback contract | next: link this brief in backlog and use it as canonical scope when implementation starts`
