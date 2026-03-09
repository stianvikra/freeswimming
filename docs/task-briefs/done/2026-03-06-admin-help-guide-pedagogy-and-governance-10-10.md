# Task Brief: Admin Help/Guide Pedagogy And Governance Controls (10/10)

## Metadata

- `id`: `2026-03-06-admin-help-guide-pedagogy-and-governance-10-10`
- `status`: `done`
- `priority`: `P1`
- `owner`: `stianvikra`
- `created`: `2026-03-06`
- `updated`: `2026-03-09`

## Goal

Make Admin Help/Guide a 10/10 operator training surface (pedagogical, action-first, and current), and enforce governance so relevant app changes always update Help/Guide + brief documentation.

## Why This Brief Exists

- Current Help/Guide misses the new QR Links workflow and feels outdated for daily operations.
- Operators need one current training source that explains flows, recovery, and ownership in plain language.
- Governance needs an explicit control so workflow changes cannot ship without Help/Guide alignment.

## Dependencies And Boundaries

- Related briefs:
  - `docs/task-briefs/done/2026-02-21-admin-help-center-and-ops-handbook.md`
  - `docs/task-briefs/in-progress/2026-02-28-qr-video-redirect-links-and-admin-controls-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Scope is docs/admin-help content, governance controls, and test contract updates.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - N/A (no new persistence model).
- Local-only:
  - Help tab navigation state and in-page anchor navigation only.
- Sync policy:
  - Help/Guide copy is source-controlled; changes ship via PR and CI.
- Retention/sensitivity:
  - no secrets/tokens/internal sensitive values in help copy.
- Cache/invalidation:
  - admin page reload fetches latest client bundle after deployment.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                 | Evidence                                      |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Product goals and IA                          | `target`     | Help/Guide IA exposes clear onboarding path and section purpose for all admin tabs.              | help e2e + manual QA                          |
| UX flow clarity                               | `target`     | Operator can find what to do next for content, QR, and recovery workflows in <=15 seconds.       | manual QA timing + heading/assertion coverage |
| Visual design quality                         | `target`     | Help surface remains scannable (short blocks, consistent cards, no text-wall regressions).       | visual QA                                     |
| Business logic correctness and data integrity | `supporting` | N/A (docs/control slice only; no data mutations added).                                          | scope review                                  |
| Admin editor ergonomics                       | `target`     | Help content maps button labels to outcomes for Content/QR/Ops without ambiguity.                | e2e text assertions                           |
| Accessibility (a11y)                          | `target`     | Heading hierarchy + link/button semantics preserved for keyboard/screen reader navigation.       | e2e navigation + code review                  |
| Performance (CWV + payloads)                  | `supporting` | Static help content only; no added heavy dependency.                                             | dependency diff                               |
| Data placement and sync boundaries            | `supporting` | N/A                                                                                              | N/A                                           |
| Caching and invalidation strategy             | `supporting` | N/A                                                                                              | N/A                                           |
| Reliability and failure handling              | `target`     | Help includes deterministic recovery steps for setup warning, failed actions, and QR rollback.   | help copy + runbook references                |
| Security and authz                            | `target`     | Governance explicitly requires no secret/internal-sensitive exposure in help/training docs.      | docs diff + review                            |
| Privacy and compliance                        | `supporting` | N/A                                                                                              | N/A                                           |
| Content governance                            | `target`     | Brief/template/agent controls require help-update impact declaration on workflow-changing tasks. | docs template + AGENTS updates                |
| Admin workflow and editability                | `target`     | Help coverage includes all active admin tabs and key actions including QR registry.              | e2e + manual QA                               |
| SEO and crawlability                          | `N/A`        | N/A (admin-only surface).                                                                        | N/A                                           |
| AI discoverability                            | `N/A`        | N/A (admin-only surface).                                                                        | N/A                                           |
| Analytics and KPI observability               | `supporting` | N/A                                                                                              | N/A                                           |
| Commerce and revenue ops                      | `supporting` | Help includes operator guidance for commerce tab ownership and safe-change handling.             | help section                                  |
| Incident response and support operations      | `target`     | Help links to runbooks and includes escalation-first troubleshooting actions.                    | help content + runbook links                  |
| Finance and reporting operations              | `supporting` | Help documents where finance-affecting edits happen and cautions against silent mismatch.        | help copy                                     |
| i18n operational readiness                    | `target`     | Help governance requires i18n-safe wording and no logic coupling to raw copy labels.             | template/governance text                      |
| Stack-fit and dependency discipline           | `target`     | No dependency added; existing React/Tailwind/test stack only.                                    | package diff                                  |
| Testing and QA automation                     | `target`     | Admin help e2e updated with QR + governance copy assertions; local checks pass.                  | test output                                   |
| Scalability and cost efficiency               | `supporting` | Docs-first governance reduces support overhead without runtime infra changes.                    | docs design review                            |
| DevOps and rollback readiness                 | `target`     | Governance controls require help/runbook alignment in same PR for workflow mutations.            | template + brief README/AGENTS updates        |

## Scope

- Upgrade `Help/Guide` content in admin with:
  - onboarding path,
  - full-tab coverage including QR Links,
  - explicit button-to-outcome guidance,
  - 10/10 category coverage matrix for help/training,
  - update/governance controls and runbook links,
  - explicit `Last updated` stamp.
- Update governance controls so briefs document Help/Guide impact on workflow changes.
- Update in-progress briefs missing explicit help-alignment requirement.
- Update E2E assertions for help content contract.

## Out Of Scope

- New backend APIs or schema migrations.
- Public-facing help center redesign.
- Changes to role model/auth implementation.

## Acceptance Criteria

1. Help/Guide includes QR Links workflow and recovery guidance in plain language.
2. Help/Guide includes explicit operator training path and documentation freshness controls.
3. Governance docs require Help/Guide update impact for relevant app/admin workflow changes.
4. In-progress briefs missing help-alignment requirement are patched.
5. `tests/e2e/admin-help-center.spec.ts` covers new QR/governance guidance.
6. `npm run lint:briefs` and `npm run verify:pre-pr` pass.

## Validation

- `npm run lint:briefs`
- `npx playwright test tests/e2e/admin-help-center.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Keep existing admin visual language.
- Keep copy short, concrete, and non-technical.
- Do not remove current admin functions.

## 10/10 Quality Bar

- Every major section answers:
  - what this does,
  - when to use it,
  - what can fail,
  - how to recover.
- Help content is action-first and scannable on desktop and mobile.
- Labels in help must match live admin UI labels.
- Governance controls are explicit enough to be repeatable in future briefs.

## Security, Privacy, And Compliance

- No secrets/tokens/internal sensitive endpoints in help copy.
- Error/recovery guidance must avoid insecure bypass instructions.

## Observability And KPI Contract

- Qualitative KPI:
  - lower operator confusion and faster self-serve issue recovery.
- Verification signal:
  - help e2e contract green,
  - no stale references to removed/renamed controls.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-06 | 90fdc0c (main) | PR #139 merged and closed; Help/Guide pedagogy + governance controls released with required CI green and local verify:pre-merge PASS | next: brief moved to done`
- `2026-03-06 | working tree | delivered Help/Guide pedagogical refresh (onboarding path, QR workflow, button glossary, 10/10 quality matrix, documentation controls), patched governance docs (AGENTS + task-brief template + task-briefs README + in-progress brief help-alignment clauses), updated admin help e2e assertions, and ran targeted help e2e + full npm run verify:pre-pr PASS | next: commit, push, open PR in Safari`
- `2026-03-06 | kickoff | opened in-progress brief for Help/Guide pedagogy + governance-controls hardening; next: implement help copy refresh + governance docs + e2e updates`

## Completion Record

- `PR`: `https://github.com/stianvikra/freeswimming/pull/139`
- `merge`: `PR #139` -> `main`
- `result`: Help/Guide upgraded to 10/10 operator-training surface with governance controls and updated e2e contract.
