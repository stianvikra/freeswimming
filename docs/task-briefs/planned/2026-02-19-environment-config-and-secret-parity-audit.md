# Task Brief: Environment Config And Secret Parity Audit

## Metadata

- `id`: `2026-02-19-environment-config-and-secret-parity-audit`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-19`
- `updated`: `2026-02-19`

## Goal

Local, Preview, and Production environments should be intentionally configured with correct, non-shared secrets so admin access and all critical flows behave predictably.

## Scope

- Create a complete env-variable inventory used by app/runtime/CI.
- Classify each variable by:
  - required vs optional,
  - local-only vs preview/prod-required,
  - secret vs public-safe.
- Define environment matrix:
  - `.env.local`,
  - Vercel Preview,
  - Vercel Production.
- Validate admin-access prerequisites end-to-end:
  - `ADMIN_EMAIL_ALLOWLIST`,
  - Supabase auth session,
  - runtime flags (`dashboardVisible`),
  - role resolution behavior.
- Document exact setup steps for:
  - adding/updating env vars in Vercel,
  - redeploy order,
  - logout/login refresh requirements.
- Add a lightweight operational checklist for secret rotation and post-rotation verification.

## Out Of Scope

- Re-architecting auth model.
- Database schema changes unrelated to env handling.
- Replacing existing providers (Supabase/Stripe/Resend/Vercel).

## Acceptance Criteria

- A documented env matrix exists with all required keys and target environments.
- No key is ambiguously documented as "same everywhere" unless intentionally shared.
- Admin access troubleshooting guide exists and is reproducible.
- A production verification checklist exists for:
  - sign-in,
  - `/admin` access,
  - `/api/runtime/flags` -> `dashboardVisible`.
- Secret rotation checklist includes rollback and validation steps.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run verify:pre-pr`
- manual smoke:
  - local admin visibility check,
  - preview admin visibility check,
  - production admin visibility check.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000`
- Vercel preview:
  - PR preview URL
- Production:
  - `https://freeswimming.org`

## Constraints

- Never paste secret values into repo files, screenshots, or PR comments.
- Keep docs actionable and short for fast incident response.
- Do not weaken existing security guardrails to simplify setup.

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

## 10/10 Quality Bar

- Setup instructions are deterministic and copy-safe.
- Troubleshooting flow identifies root cause in under 5 minutes for common admin-access issues.
- Environment differences are explicit (no hidden assumptions).

## Security, Privacy, And Compliance

- Enforce least-privilege handling for all secret scopes.
- Keep production secrets isolated from local/testing credentials.
- Ensure incident notes and docs never contain raw secret values.

## Session Continuity And Recovery

- Canonical source: this brief + active branch.
- Recovery steps:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. continue from latest checklist item.

## Completion Record (fill when done)

- `PR`: link
- `merge`: source -> target
- `result`: short summary

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.
