# Task Brief: AW-006 Cross-Platform UX Design Hardening (10/10)

## Metadata

- `id`: `2026-03-10-aw-006-cross-platform-ux-design-hardening-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-10`
- `updated`: `2026-03-10`

## Goal

Define a deterministic 10/10 execution contract for cross-platform UX/design hardening across core user routes and supported device/browser matrix.

## Why This Brief Exists

- AW-006 is `planned` in backlog and needs a canonical 10/10 brief format aligned with current scorecard lint gates.
- The earlier AW-006 draft is useful context but is not structured as the current scorecard-complete baseline.
- This brief sets measurable thresholds and evidence before implementation begins.

## Scope

- Define route-level UX hardening targets for:
  - `/`, `/plans`, `/course`, `/guides/0-1000m`, `/guides/poolside`, `/my-library`, `/auth/sign-in`.
- Define required cross-platform validation matrix:
  - iPhone Safari, Android Chrome, iPad Safari, desktop Chrome, desktop Safari/WebKit, desktop Firefox.
- Define quality requirements for:
  - readability and hierarchy,
  - interaction consistency and focus behavior,
  - platform-specific edge cases (safe-area, orientation, keyboard/focus traps),
  - required UX states (`loading`, `empty`, `error`, `offline`, `retry`).
- Define regression guardrails:
  - visual evidence capture policy,
  - targeted e2e coverage for critical interaction paths,
  - release/rollback decision criteria.

## Out Of Scope

- Full design-system rewrite or rebranding.
- Native app work.
- New product feature scope unrelated to UX/design hardening.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - no new server-canonical domain model introduced in this planning slice.
- Local-only:
  - temporary QA notes/screenshots used during validation.
- Sync behavior:
  - N/A for this planning slice (no runtime sync contract changes).
- Invalidation:
  - QA evidence must be regenerated when route layout/interaction contracts change.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                     | Evidence                                      |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Product goals and IA                          | `target`     | Core route matrix and UX acceptance criteria are explicitly defined for every in-scope route.                        | route matrix + acceptance section             |
| UX flow clarity                               | `target`     | No P0/P1 flow blockers on required matrix for primary tasks (navigate, sign in, open content, start checkout path).  | matrix QA log + e2e coverage                  |
| Visual design quality                         | `target`     | Type scale, spacing, and contrast are consistent on required matrix with no unresolved P1 readability issues.        | visual QA checklist + screenshots             |
| Business logic correctness and data integrity | `supporting` | UX hardening does not change core mutation/state logic in this planning slice.                                       | scope statement + no runtime contract changes |
| Admin editor ergonomics                       | `supporting` | N/A for this slice; focus is end-user core route UX hardening, not admin editor workflows.                           | scope rationale                               |
| Accessibility (a11y)                          | `target`     | Critical actions remain keyboard/focus reachable and semantic landmarks/labels remain valid on changed surfaces.     | e2e a11y checks + manual keyboard QA          |
| Performance (CWV + payloads)                  | `target`     | Hardening work does not regress route budgets beyond agreed thresholds on in-scope routes.                           | perf budget checks + CI evidence              |
| Data placement and sync boundaries            | `supporting` | N/A for this planning slice; no new state ownership boundaries are introduced.                                       | data placement section                        |
| Caching and invalidation strategy             | `supporting` | N/A for this planning slice; cache behavior remains unchanged.                                                       | scope statement                               |
| Reliability and failure handling              | `target`     | Required UX states (`loading/empty/error/offline/retry`) are defined and testable for in-scope routes.               | acceptance criteria + e2e assertions          |
| Security and authz                            | `supporting` | Existing auth/security boundaries must remain fail-closed during UX changes.                                         | negative-path regression checks               |
| Privacy and compliance                        | `supporting` | N/A for this slice; no privacy model or legal text changes.                                                          | scope rationale                               |
| Content governance                            | `supporting` | N/A for this slice; content model/governance remains unchanged.                                                      | scope rationale                               |
| Admin workflow and editability                | `supporting` | N/A for this slice; admin workflows are out of scope.                                                                | out-of-scope statement                        |
| SEO and crawlability                          | `supporting` | N/A for this slice; SEO control changes are handled in dedicated SEO brief.                                          | scope rationale                               |
| AI discoverability                            | `supporting` | N/A for this slice; no AI discoverability metadata contract changes.                                                 | scope rationale                               |
| Analytics and KPI observability               | `target`     | UX hardening defines required KPI signals for route task success/failure without sensitive payload expansion.        | event contract + analytics assertions         |
| Commerce and revenue ops                      | `supporting` | Supporting only where `/plans` and checkout entry UX is touched; no reconciliation model changes.                    | scope notes + targeted test coverage          |
| Incident response and support operations      | `supporting` | Supporting only: add matrix triage notes so support can identify route/device UX regressions quickly.                | QA runbook + triage checklist                 |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reconciliation/reporting logic change in this UX-focused slice.                          | scope rationale                               |
| i18n operational readiness                    | `supporting` | Supporting only: layouts/copy structure should remain locale-extensible without hardcoded fragile assumptions.       | design checklist + scope rationale            |
| Stack-fit and dependency discipline           | `target`     | Hardening plan reuses existing Next.js/Tailwind/Playwright/Vitest stack without new dependency requirements.         | dependency diff + implementation plan         |
| Testing and QA automation                     | `target`     | Cross-platform critical paths and required states are covered by deterministic automated checks + manual matrix log. | verify gates + e2e matrix evidence            |
| Scalability and cost efficiency               | `supporting` | N/A for this planning slice; no architecture/cost model expansion.                                                   | scope rationale                               |
| DevOps and rollback readiness                 | `target`     | Closeout must include explicit rollback criteria when UX hardening introduces regressions on required matrix.        | release checklist + rollback notes            |

## Acceptance Criteria

- AW-006 has a scorecard-complete, lintable 10/10 brief with measurable target thresholds.
- Required cross-platform matrix, core routes, and validation evidence requirements are explicit.
- Closeout gate requirements (`verify:pre-pr`, `verify:pre-merge`, CI green) are documented.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Preserve existing visual language unless explicit redesign scope is later approved.
- Keep scope on contract/governance in this planning slice (no runtime code changes).
- Avoid introducing dependencies in planning-only work.

## 10/10 Quality Bar

- Quality thresholds are measurable and evidence-linked.
- Required UX states and matrix expectations are explicit and auditable.
- Release/rollback readiness criteria are unambiguous.
- Follow-up implementation can be scored objectively against target categories.

## Checkpoint Log

- `2026-03-10 | working tree | created AW-006 canonical planned 10/10 brief with scorecard-complete thresholds and matrix-ready validation contract | next: link brief in backlog AW-006 section and run verify gates`
