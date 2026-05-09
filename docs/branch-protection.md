# Branch Protection

This repository should protect `main` with:

- pull request required before merge
- solo-owner review policy: `0` required approving reviews in GitHub
- explicit owner approval in Codex chat before merge
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

Governance audit note: on `2026-05-09`, the live rule initially reported
`required_pull_request_reviews: 0`, then was briefly raised to `1`. Because this
is a solo-owner repository, the desired live policy is now `0` required GitHub
reviews plus required checks and explicit owner approval in Codex chat. The live
rule was restored to that solo-owner policy the same day.

## Apply Automatically (CLI Script)

1. Create a GitHub token with repository admin scope.
2. Run (defaults include current `verify`, CodeQL, and PR Size check names plus
   the solo-owner review policy):

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

Prefer passing the current live check context names explicitly when restoring
protection so a solo-owner policy fix does not accidentally drift status checks.
