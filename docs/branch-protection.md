# Branch Protection

This repository should protect `main` with:

- pull request required before merge
- at least 1 approving review
- code owner review required
- stale review dismissal enabled
- required conversation resolution
- required passing checks:
  - `verify`
  - `Analyze (javascript-typescript)`
  - `size-check`
- linear history
- force pushes disabled
- deletions disabled

## Audit Current Protection

Use the live GitHub rule as the enforcement source, not this file:

```bash
gh api repos/stianvikra/freeswimming/branches/main/protection \
  --jq '{required_status_checks: .required_status_checks.contexts, required_pull_request_reviews: .required_pull_request_reviews.required_approving_review_count, enforce_admins: .enforce_admins.enabled, allow_force_pushes: .allow_force_pushes.enabled, allow_deletions: .allow_deletions.enabled, required_linear_history: .required_linear_history.enabled}'
```

Governance audit note: on `2026-05-09`, the live rule reported `required_pull_request_reviews: 0`.
Restore the desired `1` approving review + code-owner review setting before claiming branch
protection is fully aligned.

## Apply Automatically (CLI Script)

1. Create a GitHub token with repository admin scope.
2. Run (defaults include CI + CodeQL + PR Size checks):

```bash
GITHUB_TOKEN=your_token_here bash ./scripts/apply-branch-protection.sh main
```

If check names differ, pass explicit required checks as additional args:

```bash
GITHUB_TOKEN=your_token_here bash ./scripts/apply-branch-protection.sh main \
  "verify" \
  "Analyze (javascript-typescript)" \
  "size-check"
```
