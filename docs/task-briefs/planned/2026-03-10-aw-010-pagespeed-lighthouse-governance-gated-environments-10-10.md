# Task Brief: AW-010 PageSpeed/Lighthouse Governance For Gated Environments (10/10)

## Metadata

- `id`: `2026-03-10-aw-010-pagespeed-lighthouse-governance-gated-environments-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-10`
- `updated`: `2026-03-10`

## Goal

Establish deterministic, repeatable performance governance for both password-gated and unlocked states across core routes.

## Why This Brief Exists

- AW-010 is `planned` in backlog but did not have a dedicated implementation brief.
- Performance gates must stay valid even when site lock is enabled for non-public operations windows.
- This brief defines measurable 10/10 thresholds before implementation starts.

## Scope

- Define canonical Lighthouse/PageSpeed route matrix for:
  - unlocked/public mode,
  - password-gated mode.
- Define execution contract for:
  - local/manual runs,
  - CI runs,
  - evidence capture and trend comparison.
- Define budget policy for core routes:
  - threshold targets,
  - tighten/hold/revert decision path.
- Define operator runbook expectations for regressions and rollback-safe release decisions.

## Out Of Scope

- Large UX redesign or bundle-architecture rewrite.
- Replacing existing test stack or hosting platform.
- Unrelated admin/content workflow changes.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - performance evidence tied to commit SHA and route profile (`public` vs `gated`).
  - release decision state (`pass`, `hold`, `revert`) for each measured slice.
- Local-only:
  - temporary Lighthouse artifacts generated during local debug runs.
- Sync behavior:
  - CI/manual runs must publish deterministic evidence schema for both access states.
  - budget decision is updated only after verified run evidence is present.
  - stale evidence cannot be reused for a newer merge candidate SHA.
- Invalidation:
  - route-level budget evidence is invalidated whenever related route/layout payload changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                             | Evidence                                     |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Product goals and IA                          | `target`     | Core route matrix and pass/fail criteria are explicit for both gated and public states.                      | brief matrix + runbook                       |
| UX flow clarity                               | `supporting` | N/A                                                                                                          | N/A                                          |
| Visual design quality                         | `supporting` | N/A                                                                                                          | N/A                                          |
| Business logic correctness and data integrity | `target`     | Performance budget verdicts are SHA-bound and cannot be reported without matching evidence artifact.         | verify logs + artifacts                      |
| Admin editor ergonomics                       | `supporting` | N/A                                                                                                          | N/A                                          |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                                          | N/A                                          |
| Performance (CWV + payloads)                  | `target`     | All target routes meet defined Lighthouse/CWV budgets in both gated and public profiles before merge.        | CI run outputs + trend log                   |
| Data placement and sync boundaries            | `target`     | Evidence ownership and lifecycle for local vs CI artifacts is explicit and deterministic.                    | brief contract + runbook                     |
| Caching and invalidation strategy             | `target`     | Budget evidence invalidates on route payload changes; stale runs never satisfy current gate.                 | gate enforcement notes + SHA checks          |
| Reliability and failure handling              | `target`     | Failed budget run returns deterministic next action (`rerun`, `fix`, or `rollback hold`) in <=5 minutes.     | runbook failure section + sample output      |
| Security and authz                            | `target`     | Gated-state runs use approved access context without exposing secrets/tokens in logs or artifacts.           | run command contract + sanitized artifacts   |
| Privacy and compliance                        | `target`     | Performance evidence stores only technical metrics and non-sensitive route metadata.                         | artifact schema + redaction policy           |
| Content governance                            | `supporting` | N/A                                                                                                          | N/A                                          |
| Admin workflow and editability                | `supporting` | N/A                                                                                                          | N/A                                          |
| SEO and crawlability                          | `supporting` | N/A                                                                                                          | N/A                                          |
| AI discoverability                            | `supporting` | N/A                                                                                                          | N/A                                          |
| Analytics and KPI observability               | `target`     | Trend history records budget deltas and tighten/hold/revert decisions per weekly checkpoint.                 | trend log + brief checkpoints                |
| Commerce and revenue ops                      | `supporting` | No commerce/entitlement mutation in scope; this slice is performance governance only.                        | scope statement + changed-files diff         |
| Incident response and support operations      | `target`     | On-call/support can identify latest valid performance evidence and rollback guidance in <=5 minutes.         | runbook incident section                     |
| Finance and reporting operations              | `supporting` | No finance/reporting contract mutation; performance budgets are operational quality gates only.              | scope statement + architecture review        |
| i18n operational readiness                    | `supporting` | No locale-routing/content model change; route matrix remains locale-extensible for future profile expansion. | route matrix design + scope statement        |
| Stack-fit and dependency discipline           | `target`     | Uses existing Lighthouse/Playwright/CI stack without introducing unnecessary dependencies.                   | package diff + command inventory             |
| Testing and QA automation                     | `target`     | Budget checks are integrated in `verify:pre-pr` / `verify:pre-merge` contracts with deterministic pass/fail. | gate logs + CI checks                        |
| Scalability and cost efficiency               | `target`     | Route matrix and cadence remain bounded so perf governance is sustainable for each merge slice.              | run-time budget + cadence policy             |
| DevOps and rollback readiness                 | `target`     | Performance regressions have explicit hold/revert criteria and rollback-safe release decision workflow.      | runbook rollback section + release checklist |

## Acceptance Criteria

- Core route performance matrix is defined for both gated and public profiles.
- Budget thresholds and gate behavior are deterministic and evidence-bound.
- Trend reporting supports tighten/hold/revert decisions with explicit rationale.
- Runbook specifies operator actions for regression and rollback-safe release handling.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Never expose gate credentials or raw env values in logs or artifacts.
- Avoid brittle one-off perf commands that cannot be repeated in CI.
- Keep route matrix focused on highest-signal user/admin surfaces.

## 10/10 Quality Bar

- Same commit SHA yields reproducible perf evidence for both access profiles.
- Budget failures produce actionable, deterministic next steps.
- Trend decisions are documented and auditable week-over-week.
- Release decisions never claim green without matching performance evidence.

## Checkpoint Log

- `2026-03-10 | working tree | created AW-010 planned implementation brief with scorecard-complete thresholds for gated/public performance governance and deterministic evidence contracts | next: link this brief in backlog and use it as canonical scope when implementation starts`
