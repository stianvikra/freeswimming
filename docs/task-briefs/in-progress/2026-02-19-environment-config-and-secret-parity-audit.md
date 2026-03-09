# Task Brief: Environment Config And Secret Parity Audit

## Metadata

- `id`: `2026-02-19-environment-config-and-secret-parity-audit`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-19`
- `updated`: `2026-03-09`

## Goal

Local, preview, and production environments are intentionally configured with correct, non-shared secrets so admin access and critical flows behave predictably.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                | Evidence                                                               |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Product goals and IA                          | `supporting` | N/A                                                                                             | N/A                                                                    |
| UX flow clarity                               | `target`     | Runbook includes deterministic admin-access triage with explicit next action per failure state. | `docs/runbooks/environment-config-and-secret-parity.md`                |
| Visual design quality                         | `supporting` | N/A                                                                                             | N/A                                                                    |
| Business logic correctness and data integrity | `target`     | Env matrix classifies all used keys by env + scope with no ambiguous "same everywhere" entries. | runbook matrix + `.env.example`                                        |
| Admin editor ergonomics                       | `supporting` | N/A                                                                                             | N/A                                                                    |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                             | N/A                                                                    |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                             | N/A                                                                    |
| Data placement and sync boundaries            | `supporting` | N/A                                                                                             | N/A                                                                    |
| Caching and invalidation strategy             | `supporting` | N/A                                                                                             | N/A                                                                    |
| Reliability and failure handling              | `target`     | Troubleshooting path resolves common admin-access env failures in <=10 minutes.                 | runbook troubleshooting steps                                          |
| Security and authz                            | `target`     | Secret handling and dev-only bypass boundaries are explicit and fail-closed by environment.     | runbook guardrails + matrix                                            |
| Privacy and compliance                        | `target`     | Rotation/runbook never requires exposing raw secret values in repo/PR/log output.               | runbook guardrails + checklist                                         |
| Content governance                            | `supporting` | N/A                                                                                             | N/A                                                                    |
| Admin workflow and editability                | `target`     | Admin access prerequisites (`allowlist`/role/runtime flag) are documented end-to-end.           | runbook admin troubleshooting                                          |
| SEO and crawlability                          | `supporting` | N/A                                                                                             | N/A                                                                    |
| AI discoverability                            | `supporting` | N/A                                                                                             | N/A                                                                    |
| Analytics and KPI observability               | `supporting` | N/A                                                                                             | N/A                                                                    |
| Commerce and revenue ops                      | `target`     | Stripe-related env keys are explicit and included in post-rotation smoke flow.                  | runbook matrix + checklist smoke step 6                                |
| Incident response and support operations      | `target`     | Env-change rollback + support diagnostics flow is documented and reproducible.                  | runbook update order + checklist rollback                              |
| Finance and reporting operations              | `target`     | Finance-critical secret groups have explicit staged rotation order and validation checks.       | checklist secret groups + smoke checks                                 |
| i18n operational readiness                    | `supporting` | N/A                                                                                             | No locale-routing/content model changes in this slice (ops docs only). |
| Stack-fit and dependency discipline           | `target`     | No new dependencies introduced; docs/config-only changes.                                       | dependency diff + changed-files list                                   |
| Testing and QA automation                     | `target`     | `verify:pre-pr` + `verify:pre-merge` pass with required CI checks green before merge.           | gate logs + PR checks                                                  |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                             | N/A                                                                    |
| DevOps and rollback readiness                 | `target`     | Vercel update order and rollback sequence are explicitly documented.                            | runbook + checklist rollback                                           |

## Data Placement And Sync Contract (Required)

- `N/A` for state-sync ownership changes: this slice documents environment and operational process only.
- Existing server-canonical ownership remains unchanged.

## Scope

- Create full environment-variable inventory used by runtime/CI.
- Classify each variable by:
  - required vs optional,
  - local-only vs preview/prod-required,
  - secret vs public-safe.
- Define environment matrix for:
  - `.env.local`,
  - Vercel Preview,
  - Vercel Production.
- Validate admin-access prerequisites documentation end-to-end:
  - `ADMIN_EMAIL_ALLOWLIST`,
  - auth session,
  - runtime flags (`dashboardVisible`),
  - role resolution behavior.
- Document exact setup/update steps for Vercel env changes and redeploy order.
- Add operational checklist for secret rotation and post-rotation verification.

## Out Of Scope

- Re-architecting auth model.
- Database schema changes unrelated to env handling.
- Replacing existing providers (Supabase/Stripe/Resend/Vercel).

## Acceptance Criteria

1. Env matrix exists with required keys and target environments.
2. No key is ambiguously documented as "same everywhere" unless intentionally shared.
3. Admin access troubleshooting guide exists and is reproducible.
4. Production verification checklist exists for sign-in, `/admin`, and `/api/runtime/flags`.
5. Secret rotation checklist includes rollback and validation steps.

## Deliverables (This Slice)

- `docs/runbooks/environment-config-and-secret-parity.md`
- `docs/checklists/admin-access-and-secret-rotation.md`
- `.env.example` update for missing optional guide asset override key.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000`
- Preview:
  - PR Vercel URL for `/auth/sign-in`, `/api/runtime/flags`, `/admin`
- Production:
  - `https://freeswimming.org` (owner runbook follow-through)

## Constraints

- Never paste secret values into repo files, screenshots, or PR comments.
- Keep runbook/checklist short and deterministic for incident response.
- Do not weaken existing security guardrails to simplify setup.

## 10/10 Quality Bar

- Setup and rotation instructions are deterministic and copy-safe.
- Troubleshooting flow identifies root cause quickly for common admin-access failures.
- Environment differences are explicit with no hidden assumptions.

## Security, Privacy, And Compliance

- Least-privilege handling for secret scopes.
- Production secrets isolated from local/testing credentials.
- Incident notes/docs never contain raw secret values.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-09 | working tree | started manual-smoke evidence hygiene slice: added deterministic preview/production smoke evidence template + closeout rule in admin rotation checklist/runbook so brief move-to-done is proof-based | next: run verify:pre-pr, open PR, run gate:pre-merge, then execute owner preview/prod smoke rows and move brief to done`
- `2026-03-09 | a052609 (main) | PR #163 merged (`docs(ops): deliver env config parity audit baseline`) with required checks green and local verify:pre-merge evidence | next: execute owner manual preview/prod runbook smoke checks (`/auth/sign-in`, `/api/runtime/flags`, `/admin`) and then move brief to done`
- `2026-03-09 | working tree | started env-config parity audit slice: moved brief to in-progress, added env parity runbook + admin secret-rotation checklist, and aligned .env.example with poolside guide asset override key | next: run verify:pre-pr, open PR in Safari, run gate:pre-merge, then execute manual preview/prod runbook smoke checks before moving brief to done`

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
