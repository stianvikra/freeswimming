# Vercel Preview Setup

This repo includes `.github/workflows/vercel-preview.yml` for PR preview deploys.

## Required GitHub Secrets

Set these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Without these secrets, preview deployment is skipped.

## Recommended Usage

- Keep Vercel Preview as a review aid for UI/UX checks.
- Keep `CI / verify`, `CodeQL`, and `PR Size` as required merge gates.
- Do not block merges on preview if secrets are unavailable for forked PRs.
