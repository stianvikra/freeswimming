# Vercel Preview Runbook

## Purpose

Deploy PR previews automatically for review.

## Workflow

- File: `.github/workflows/vercel-preview.yml`
- Trigger: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`)
- Behavior: deploys preview from current PR commit and comments preview URL on PR.

## Required GitHub Secrets (names only)

Set in repo: `Settings -> Secrets and variables -> Actions`.

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

No secret values should be stored in repo files.

## One-Time Project Linking (local)

```bash
npm exec vercel login
npm exec vercel link
```

During linking, choose the correct Vercel scope/project.

## Common Errors

### `The specified token is not valid`

- Regenerate Vercel token in Vercel dashboard.
- Update `VERCEL_TOKEN` secret in GitHub.
- Re-run failed Vercel job.

### Preview skipped because secrets missing

- Add missing secret names above.
- Re-run failed jobs.

### Preview succeeds but PR still blocked

- Usually unrelated to Vercel; see `docs/runbooks/ci-unblock.md`.

## Branch Behavior

- Preview follows PR branch commits automatically.
- Production branch behavior is controlled in Vercel project settings (usually `main`), not by this workflow.

## Token Rotation

1. Create new Vercel token.
2. Update `VERCEL_TOKEN` in GitHub secrets.
3. Re-run a Vercel preview job to verify.
4. Revoke old token.
