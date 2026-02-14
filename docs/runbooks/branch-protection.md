# Branch Protection Runbook

## Purpose

Keep `main` protected while still allowing predictable PR merges.

## Target

- Repository: `stianvikra/freeswimming`
- Branch: `main`

## Required Status Checks (current naming)

Use exact check names as they appear in PR checks:

- `CI / verify (pull_request)`
- `CodeQL / Analyze (javascript-typescript) (pull_request)`
- `PR Size / size-check (pull_request)`

## Apply Protection With Script

From repo root:

```bash
read -s GITHUB_TOKEN
echo
export GITHUB_TOKEN
bash ./scripts/apply-branch-protection.sh main \
  "CI / verify (pull_request)" \
  "CodeQL / Analyze (javascript-typescript) (pull_request)" \
  "PR Size / size-check (pull_request)"
unset GITHUB_TOKEN
```

Notes:

- Token must be a GitHub PAT with admin rights for this repo.
- Do not store token values in files.

## Quick Verification

1. Open repo settings branch rules for `main`.
2. Confirm PRs are required for merge.
3. Confirm required checks match exact names above.
4. Confirm push to `main` is blocked without PR.

## If Checks Show As Stuck `Expected`

See `docs/runbooks/ci-unblock.md`.
