# Branch Protection

This repository should protect `main` with:

- pull request required before merge
- at least 1 approving review
- code owner review required
- stale review dismissal enabled
- required conversation resolution
- required passing checks:
  - `CI / verify`
  - `CodeQL / Analyze (javascript-typescript)`
  - `PR Size / size-check`
- linear history
- force pushes disabled
- deletions disabled

## Apply Automatically (CLI Script)

1. Create a GitHub token with repository admin scope.
2. Run (defaults include CI + CodeQL + PR Size checks):

```bash
GITHUB_TOKEN=your_token_here bash ./scripts/apply-branch-protection.sh main
```

If check names differ, pass explicit required checks as additional args:

```bash
GITHUB_TOKEN=your_token_here bash ./scripts/apply-branch-protection.sh main \
  "CI / verify" \
  "CodeQL / Analyze (javascript-typescript)" \
  "PR Size / size-check"
```
