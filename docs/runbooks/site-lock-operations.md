# Site-Lock Operations Workflow Runbook

## Purpose

Run safe, auditable lock/unlock operations without manual Vercel env editing.

## Workflow

- GitHub Actions workflow: `.github/workflows/site-lock-operations.yml`
- Trigger path: `Actions -> Site Lock Operations -> Run workflow`

## Required Setup

1. Repository secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
2. GitHub environments:
   - `site-lock-preview`
   - `site-lock-production`
3. Environment protection:
   - `site-lock-production` must require at least one manual reviewer.
   - Workflow will fail for `target_environment=production` if no required reviewer is configured.
4. Vercel target env requirements for `lock_on`:
   - `SITE_LOCK_PASSWORD_HASH` exists
   - `SITE_LOCK_BYPASS_TOKEN` exists
5. Preview env scope:
   - Workflow applies `SITE_LOCK_ENABLED` on the active Git ref branch for `preview` (non-interactive CI-safe behavior).

## Run An Operation

1. Open the workflow dispatch form.
2. Set inputs:
   - `action`: `lock_on` or `lock_off`
   - `target_environment`: `preview` or `production`
   - `reason`: short human-readable reason
   - `confirm`: `APPLY`
3. Run workflow.

## What The Workflow Does

1. Validates allowlisted action/environment inputs.
2. Validates required Vercel secrets.
3. For `production`: validates GitHub environment has required reviewer protection.
4. For `lock_on`: checks lock prerequisites in target Vercel environment.
5. Applies `SITE_LOCK_ENABLED` in target environment (branch-scoped for preview).
6. Deploys the target environment.
7. Runs smoke check:
   - `lock_on`: expects `/api/runtime/flags` to return `423` and home route to indicate gate (`/preview-access` redirect header when present)
   - `lock_off`: expects `/api/runtime/flags` to not return `423` and no `/preview-access` redirect on home route
8. Uploads operation artifact with summary + smoke headers + deploy output.

## Rollback

- If last operation was `lock_on`, run `lock_off` on the same environment.
- If last operation was `lock_off`, run `lock_on` on the same environment.
- Verify smoke expectations again after rollback.

## Audit Trail

- Use workflow run summary + uploaded artifact:
  - actor
  - action
  - target environment
  - deployment URL
  - smoke result
  - rollback action
