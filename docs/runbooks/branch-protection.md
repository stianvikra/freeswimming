# Branch Protection Runbook

## Purpose

Keep `main` protected while still allowing predictable PR merges.

## Target

- Repository: `stianvikra/freeswimming`
- Branch: `main`

## Required Status Checks (current naming)

Use exact check names as they appear in PR checks:

- `verify`
- `Analyze (javascript-typescript)`
- `size-check`

## Required Review Settings

- Pull request required before merge.
- At least `1` approving review.
- Code-owner review required.
- Stale review dismissal enabled.
- Required conversation resolution enabled.
- Linear history enabled.
- Force pushes and branch deletions disabled.

## Apply Protection With Script

From repo root:

```bash
read -s GITHUB_TOKEN
echo
export GITHUB_TOKEN
bash ./scripts/apply-branch-protection.sh main \
  "verify" \
  "Analyze (javascript-typescript)" \
  "size-check"
unset GITHUB_TOKEN
```

Notes:

- Token must be a GitHub PAT with admin rights for this repo.
- Do not store token values in files.

## Quick Verification

Run:

```bash
gh api repos/stianvikra/freeswimming/branches/main/protection \
  --jq '{required_status_checks: .required_status_checks.contexts, required_pull_request_reviews: .required_pull_request_reviews.required_approving_review_count, enforce_admins: .enforce_admins.enabled, allow_force_pushes: .allow_force_pushes.enabled, allow_deletions: .allow_deletions.enabled, required_linear_history: .required_linear_history.enabled}'
```

Confirm:

- `required_pull_request_reviews` is `1`.
- `required_status_checks` contains `verify`, `Analyze (javascript-typescript)`, and `size-check`.
- `enforce_admins` and `required_linear_history` are `true`.
- `allow_force_pushes` and `allow_deletions` are `false`.

Governance audit note: on `2026-05-09`, the live rule reported `required_pull_request_reviews: 0`.
Restore the desired review setting before claiming branch protection is fully aligned.

## If Checks Show As Stuck `Expected`

See `docs/runbooks/ci-unblock.md`.
