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
   - Workflow treats preview `SITE_LOCK_ENABLED` as a global preview env value (deterministic for CLI preview deploys).

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
5. Applies `SITE_LOCK_ENABLED` in target environment (global preview value for `preview`).
6. Refreshes pulled Vercel settings so deploy uses latest lock value.
7. Deploys the target environment with explicit lock value in deploy env/build-env.
8. Runs smoke check:
   - `lock_on`: expects `/api/progress/course` to return `423` and home route to indicate gate (`/preview-access` redirect header when present)
   - `lock_off`: expects `/api/progress/course` to not return `423` and no `/preview-access` redirect on home route
9. Uploads operation artifact with summary + smoke headers + deploy output.

## Admin Unlock During Private Mode

- Public visitors stay on `/preview-access` until they have a valid site-lock cookie.
- The visitor-facing notify flow may still send visitors to `/contact?source=preview_access_notify`, which remains reachable during private mode so they can request preview updates.
- `/preview-access` is intentionally visitor-facing: it shows the shared password entry path first and does not expose signed-in admin status on the route itself.
- Admin operators can still use the current sign-in-then-password flow when needed:
  - sign in through the normal admin email flow,
  - then open `/preview-access`,
  - then use the shared access password.
- Current operator flow:
  1. sign in with the admin email first,
  2. open `/preview-access`,
  3. use the shared access password,
  4. continue into the requested private route.

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
