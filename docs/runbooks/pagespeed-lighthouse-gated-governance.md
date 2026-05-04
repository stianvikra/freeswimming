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

## Current Budget Defaults

| Metric        | Default threshold |
| ------------- | ----------------- |
| LCP           | `2500ms`          |
| CLS           | `0.10`            |
| TBT           | `200ms`           |
| JS transfer   | `400kb`           |
| CSS transfer  | `160kb`           |
| Request count | `130`             |

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

Show latest trend recommendation from recorded history:

```bash
npm run test:perf:trend
```

Optional JSON artifact output:

```bash
PERF_BUDGET_OUTPUT="artifacts/perf-budgets/<profile>-$(date -u +%Y%m%dT%H%M%SZ).json" \
npm run test:perf:budgets
```

By default, each perf run appends a trend entry to:

- `artifacts/perf-budgets/trend-log.ndjson`

This includes SHA, profile, pass/fail, and worst budget margin percentage.

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

Automation note:

- `npm run test:perf:budgets` now prints an automatic recommendation (`tighten`/`hold`/`revert`) based on trend history for the active profile.
- Recommendation thresholds are configurable:
  - `PERF_BUDGET_TIGHTEN_MIN_WEEKLY_GREENS` (default `2`)
  - `PERF_BUDGET_TIGHTEN_MIN_MARGIN_PCT` (default `15`)
- If recommendation is `tighten`, raise one stretch budget step and record the decision in the active brief checkpoint/PR summary.
- Latest ratchet decision: `2026-05-04`, `tighten`, JS transfer default `425kb` -> `400kb`.
- Previous audit decision: `2026-04-29`, `hold`, because trend output still recommended `tighten` from carry-forward green history but two new weekly green cycles had not yet accumulated after the `2026-04-26` ratchet.

## Failure Protocol

1. Confirm profile and SHA are correct.
2. Re-run once to rule out transient noise.
3. If still failing, treat as regression:
   - identify the route and metric delta,
   - hold merge or roll back recent perf-impacting change,
   - record mitigation and follow-up owner.
