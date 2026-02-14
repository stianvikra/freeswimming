# Branch Protection

This repository should protect `main` with:

- pull request required before merge
- at least 1 approving review
- stale review dismissal enabled
- required conversation resolution
- required passing check: `CI / verify`
- linear history
- force pushes disabled
- deletions disabled

## Apply Automatically (CLI Script)

1. Create a GitHub token with repository admin scope.
2. Run:

```bash
GITHUB_TOKEN=your_token_here bash ./scripts/apply-branch-protection.sh main "CI / verify"
```

If your check name is different, pass that name as the second argument.
