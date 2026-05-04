# Quality Gates Calibration

Use this runbook when `npm run lint:quality-gates` is too noisy, misses a high-risk class, or the repo has shipped several PRs on the same surface and the evidence policy needs a quick truth audit.

## Calibration Rule

Do not tighten everything. Tighten only deterministic evidence that can be checked before PR review:

- screenshot artifacts, comparison naming, and owner screenshot approval stop for UI/print/PDF/export/layout/brand work,
- route-label-support-surface-impact-sweep details for route, label, workflow, Help/Guide, runbook, recovery, and support changes,
- negative-path or fail-closed evidence for API, auth, data, payment, and protected workflow changes,
- reconciliation evidence for Stripe, entitlement, billing, refund, invoice, finance, and reporting changes,
- route-level CWV, LCP, JS transfer, payload budget, or cost evidence for performance-sensitive changes,
- classification rationale for unknown runtime surfaces.

Human judgment still owns whether the evidence is materially sufficient. The gate only blocks missing objective evidence.

## Recent PR Calibration Sample

Use a first-parent sample from local `main` before changing policy:

```sh
git log --first-parent --oneline -n 20
git show --name-only --format='%h %s' -m --first-parent HEAD~15..HEAD
```

Current 2026-05-04 calibration sample:

| Commit / PR                               | Changed Surface                 | Gate Decision                                                                           |
| ----------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| `#595` close performance governance brief | docs closeout                   | docs-only fast path stays valid                                                         |
| `#594` JS transfer ratchet                | performance docs + perf script  | require route-level budget or JS transfer evidence                                      |
| `#593` close systemic quality gates brief | docs closeout                   | docs-only fast path stays valid                                                         |
| `#591` systemic quality gates foundation  | policy script, docs, unit tests | require policy matrix, targeted script tests, rollback/devops evidence                  |
| `#590` close program preview brief        | docs closeout                   | docs-only fast path stays valid                                                         |
| `#589` program builder preview parity     | UI + session-step domain        | require reference surface, screenshot artifacts, owner approval stop, domain invariants |
| `#588` close export display model brief   | docs closeout                   | docs-only fast path stays valid                                                         |
| `#587` export display model               | shared workout domain           | require deterministic invariant tests and shared contract evidence                      |
| `fc1381d` program PDF parity              | PDF/export + session-step       | require actual consumed artifact validation and visual approval stop                    |
| `#583` close saved quick view brief       | docs closeout                   | docs-only fast path stays valid                                                         |
| `#582` saved quick view parity            | UI + saved workout/session-step | require screenshot comparison naming and shared renderer/reference evidence             |
| `#581` close workout PDF brief            | docs closeout                   | docs-only fast path stays valid                                                         |
| `#580` workout PDF print parity           | print/export + domain           | require artifact-level validation and actual consumed artifact evidence                 |
| `#579` close renderer brief               | docs closeout                   | docs-only fast path stays valid                                                         |
| `#578` session step renderer extraction   | UI component + domain tests     | require reference contract, accessibility/responsive evidence, targeted tests           |

## How To Handle False Positives

1. Check whether the changed file is classified correctly.
2. If the class is wrong, adjust the path pattern and add a unit test.
3. If the class is right but the requirement is too broad, narrow the keyword set and document the exception.
4. If the requirement is right but the brief lacks evidence, update the brief rather than weakening the gate.
5. If the rule needs a product decision, keep it as human judgment and do not pretend the script can decide it.

## Evidence Names To Prefer

- `Screenshot artifacts`: full-resolution artifact folder path.
- `Captured`: timestamp for visual handoff.
- `before/after` or `after/reference`: screenshot comparison type.
- `owner screenshot approval`: explicit visual approval stop before `verify:pre-pr`.
- `identifiers searched`: old/new route, label, action, status, runbook, or support terms.
- `surfaces checked`: directories and support surfaces swept.
- `negative-path`: unauthorized, forbidden, validation failure, no unexpected `500`, and recovery-path tests.
- `reconciliation`: entitlement, invoice, refund, finance, and reporting checks.
- `route-level`: CWV, LCP, JS transfer, payload, or cost budget tied to changed routes.

## Validation

After changing the policy:

```sh
npm run lint:quality-gates
npx vitest run tests/unit/quality-gate-evidence.test.ts
npm run lint:briefs
npm run verify:pre-pr
```

Before merge readiness:

```sh
npm run verify:pre-merge
```
