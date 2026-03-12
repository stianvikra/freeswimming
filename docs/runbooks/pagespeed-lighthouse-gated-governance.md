# PageSpeed And Lighthouse Governance (Gated + Public)

## Purpose

Run repeatable performance checks for core routes in both public mode and password-gated mode, with SHA-bound evidence for release decisions.

## Guardrails

- Never paste real bypass tokens in docs, PR comments, or screenshots.
- Always record the commit SHA and profile (`public`, `gated-shell`, or `gated-bypass`) with the result.
- Do not claim merge-ready performance without matching artifacts for the current HEAD SHA.

## Core Route Matrix

- `/`
- `/plans`
- `/course`
- `/my-library`

## Profiles

| Profile        | Site Lock | Bypass Header                    | What It Measures                                                         |
| -------------- | --------- | -------------------------------- | ------------------------------------------------------------------------ |
| `public`       | off       | no                               | standard unlocked user route performance                                 |
| `gated-shell`  | on        | no                               | performance of locked-site entry shell (`/preview-access` redirect path) |
| `gated-bypass` | on        | yes (`x-site-lock-bypass-token`) | unlocked route performance while site lock remains enabled               |

## Local Commands

Public baseline:

```bash
SITE_LOCK_ENABLED=0 npm run test:perf:budgets
```

Gated shell baseline:

```bash
SITE_LOCK_ENABLED=1 npm run test:perf:budgets
```

Gated bypass baseline (preferred for real route budgets during private windows):

```bash
SITE_LOCK_ENABLED=1 \
PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN="$SITE_LOCK_BYPASS_TOKEN" \
npm run test:perf:budgets
```

Optional JSON artifact output:

```bash
PERF_BUDGET_OUTPUT="artifacts/perf-budgets/<profile>-$(date -u +%Y%m%dT%H%M%SZ).json" \
npm run test:perf:budgets
```

## CI And Merge Contract

1. Before PR update: `npm run verify:pre-pr`.
2. Before merge: `npm run verify:pre-merge`.
3. Required CI checks must be green.
4. If release target is private-gated, add at least one `gated-bypass` perf sample in the PR evidence for the current SHA.

## Decision Policy (Tighten/Hold/Revert)

- `tighten`: two consecutive weekly green runs with clear margin to budgets.
- `hold`: single regression or noisy variance without user-visible impact.
- `revert`: repeated regression or clear user-visible route slowdown.

Record each decision in the active brief checkpoint log with:

- date (UTC),
- SHA,
- profile,
- decision (`tighten`/`hold`/`revert`),
- rationale.

## Failure Protocol

1. Confirm profile and SHA are correct.
2. Re-run once to rule out transient noise.
3. If still failing, treat as regression:
   - identify the route and metric delta,
   - hold merge or roll back recent perf-impacting change,
   - record mitigation and follow-up owner.
