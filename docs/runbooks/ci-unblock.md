# CI Unblock Runbook

## Symptom

PR shows checks as `Expected — Waiting for status to be reported` even when similar checks are already green.

## Most Common Cause

Branch protection required-check names do not exactly match current workflow run names.

Example mismatch:

- Required: `CI / verify`
- Actual run: `CI / verify (pull_request)`

## Recovery Steps

1. Open PR checks and copy exact current check names.
2. Re-apply branch protection with exact names:

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

3. Push a tiny no-op commit if GitHub UI still looks stale:

```bash
git commit --allow-empty -m "chore: trigger required status checks"
git push origin <current-branch>
```

4. Refresh PR page and confirm pending `Expected` entries disappear.

## Temporary Emergency Unblock (last resort)

If a merge is urgent and checks are stale:

1. Temporarily disable "Require status checks to pass before merging" in branch rule.
2. Merge PR.
3. Immediately re-enable status checks and re-apply exact check names.

Always document this temporary bypass in the completed task brief.
