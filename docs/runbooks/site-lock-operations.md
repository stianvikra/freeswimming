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
   - `site-lock-production` should require manual reviewer approval.
4. Vercel target env requirements for `lock_on`:
   - `SITE_LOCK_PASSWORD_HASH` exists
   - `SITE_LOCK_BYPASS_TOKEN` exists

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
3. For `lock_on`: checks lock prerequisites in target Vercel environment.
4. Applies `SITE_LOCK_ENABLED` in target environment.
5. Deploys the target environment.
6. Runs smoke check:
   - `lock_on`: expects redirect to `/preview-access`
   - `lock_off`: expects no redirect to `/preview-access`
7. Uploads operation artifact with summary + smoke headers + deploy output.

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
