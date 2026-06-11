# Task Brief Audit Gate

## Purpose

Use this gate before creating, moving, or executing a task brief.

The goal is to stop stale briefs from being treated as current implementation instructions. A brief
is only ready when its scope, repo paths, scorecard mapping, validation lane, and support-surface
impact still match the current repository state.

## When To Run This Gate

Run the gate when:

- creating a new brief,
- picking a brief from `planned/`,
- resuming a long-running `in-progress/` parent brief,
- moving a deferred brief back into `planned/`,
- changing scope before implementation,
- scorecard, AGENTS.md, verification, Help/Guide, route labels, runbooks, or support surfaces have
  changed since the brief was written.

Do not use this gate to rewrite historical `done/` briefs unless a lint or closeout workflow
requires a targeted fix.

## Required Record

Every new or refreshed brief should include:

```md
## Brief Audit Record

- `last_audited`: `YYYY-MM-DD`
- `base`: `main@<short-sha>`
- `audit_status`: `ready | revise-before-use | blocked | superseded`
- `decision`: ...
- `reason`: ...
- `must_refresh_before_execution_if`: ...
```

## Status Meanings

`ready`:

- use only when current scope, paths, scorecard mapping, validation lane, and support/Help impact
  were checked against the stated base.

`revise-before-use`:

- conservative default for old planned or long-running in-progress briefs,
- implementation must not start until the brief is refreshed.

`blocked`:

- use when execution depends on missing credentials, provider access, owner decision, external
  approval, or unresolved production facts.

`superseded`:

- use when another brief, backlog item, or shipped PR replaced the scope.

## Pre-Use Checklist

Before marking a brief `ready`, check:

- lifecycle status matches the folder,
- Codex has given the owner a short Norwegian explanation for a non-programmer covering what will be done, why it matters, and what is intentionally out of scope,
- scope still matches the current repo and owner request,
- affected paths still exist,
- scorecard categories are correct for the current scope,
- Codex skill/stack readiness radar applicability is checked with
  `docs/runbooks/codex-skill-stack-readiness-radar.md` when the work starts a broad slice, changes
  primary goal after merge/closeout, or touches high-risk auth/payments/admin/data/analytics/UI/deploy
  surfaces,
- target thresholds are measurable,
- forward compatibility is explicit for new products, labels, workflow states, identifiers, routes,
  locales, providers, exports, analytics payloads, and unknown values, or explicitly `N/A`,
  using `docs/runbooks/task-brief-forward-compatibility-contract.md`,
- validation lane is correct:
  - docs-only for pure Markdown/governance diffs,
  - full lane for runtime, scripts, tests, config, workflow, schema, or package changes,
- data placement and identity contracts are present when stateful or persisted entities are touched,
- Help/Guide impact is updated or explicitly `N/A`,
- route/label/support-surface sweep is required when labels, routes, actions, recovery, or runbooks
  change,
- visual screenshot handoff is required when UI, print, layout, brand, or rendered output changes,
- no secrets, env values, tokens, cookies, request IPs, personal data, raw provider responses, or
  user free text are included.

## Existing Brief Triage

For old planned or long-running in-progress briefs, prefer:

```md
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief was not fully re-audited in the current workstream.
```

Only mark an existing brief `ready` when the current workstream actually audits it against the
current base and records why it is ready.

## Update Triggers

Refresh the audit record when:

- implementation starts from a newer `main` after significant changes,
- AGENTS.md or the task-brief template changes,
- scorecard categories or lint rules change,
- Codex skill/plugin availability, local `.codex` capability state, or the skill/stack readiness
  radar changes,
- forward compatibility rules, task-brief template requirements, or AGENTS.md slice-recommendation
  rules change,
- validation commands or docs-only/full-lane rules change,
- route names, labels, workflow actions, Help/Guide, runbooks, or support paths change,
- provider/control-plane facts are confirmed or disproven,
- scope changes from docs-only to runtime, UI, schema, auth, payments, or admin workflow work.

## Closeout

For implementation PRs:

- update the active in-progress brief checkpoint log,
- run the validation lane named in the brief,
- keep the audit record accurate if scope changed during implementation,
- move to `done/` only after merge and closeout evidence are recorded.
