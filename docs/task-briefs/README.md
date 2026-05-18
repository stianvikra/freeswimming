# Task Briefs

Store concrete task briefs in this folder using lifecycle subfolders.

## Lifecycle

- `planned/`: approved briefs not yet started.
- `in-progress/`: currently being implemented.
- `done/`: completed and merged work.
- `deferred/`: explicitly postponed follow-up work accepted during closeout.
- `blocked/`: paused due to external dependency/decision.

Default flow:

1. create in `planned/`
2. give the owner a short Norwegian non-programmer explanation of what will be done, why it matters, and what is out of scope
3. refresh or add the Brief Audit Record before use
4. move to `in-progress/` when implementation starts
5. move to `done/` after merge
6. move explicit postponed scope to `deferred/` with rationale and re-entry trigger

## Brief Audit Gate

Before creating, moving, or executing a task brief, add or refresh `## Brief Audit Record`.

Required fields:

- `last_audited`
- `base`
- `audit_status`
- `decision`
- `reason`
- `must_refresh_before_execution_if`

Allowed `audit_status` values:

- `ready`: scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support/runbook
  impact were checked against the stated base.
- `revise-before-use`: do not execute yet; refresh the brief before implementation.
- `blocked`: do not execute until the blocker is resolved.
- `superseded`: do not execute; use the replacement brief named in the decision.

Conservative default for old planned or long-running in-progress briefs is `revise-before-use`.
Do not mark an old brief `ready` just because it has a scorecard table; current repo scope, paths,
validation lane, and support-surface impact must be checked first.

Use `docs/runbooks/task-brief-audit-gate.md` as the operational checklist.

Deferred re-entry flow:

1. move from `deferred/` to `planned/` when reprioritized
2. refresh `## Brief Audit Record`
3. resume standard lifecycle (`planned` -> `in-progress` -> `done`)

When moving to `done/`, add a completion record:

- PR link and merge info
- delivered feature/files summary
- test evidence summary (local + Vercel preview for changed flows)
- achieved score + evidence table covering every scorecard category mapped `target`
- explicit `10/10 claim: yes/no` line
- DevOps/workflow changes
- secrets used (names only, never values)
- continuity notes (how to reconstruct context from git/PR if chat history is unavailable)

## 10/10 Brief Standard

Each new brief should explicitly include:

- measurable acceptance criteria,
- quality bar for UX/UI (including required `loading`/`empty`/`error`/`offline`/`retry` states where relevant),
- business logic correctness and data integrity expectations (deterministic transitions, invariants, no silent corruption),
- security/privacy/compliance expectations when handling auth/data/payments,
- observability/KPI contract for production-facing behavior,
- session continuity and recovery protocol (checkpoint cadence + resume steps).
- platform 10/10 scorecard mapping with category status (`target`/`supporting`/`N/A`) and measurable thresholds:
  - `docs/quality/platform-10-10-scorecard.md`
- explicit handling of enterprise-readiness rows in planned/in-progress briefs:
  - `Incident response and support operations`
  - `Finance and reporting operations`
  - `i18n operational readiness`
  - if any of these are `N/A`, include concrete scope rationale (not plain `N/A`).

## Final Closeout Gate (Required Before Move To `done`)

Before moving any brief to `done/`, run a final closeout gate:

1. completion audit:
   - all acceptance criteria complete, or explicitly deferred with rationale.
   - any remaining ideas moved to a dedicated follow-up brief/backlog entry in `deferred/` (or `planned/` if scheduled immediately).
2. 10/10 quality + safety sweep:
   - UX/UI quality check on changed surfaces,
   - business logic/data integrity check for changed stateful flows,
   - security/privacy/compliance check for auth/data/payments,
   - performance/regression sanity check so adjacent app flows are not degraded.
   - score target categories from `docs/quality/platform-10-10-scorecard.md` (`0-5`) and record results with evidence.
   - list critical target categories and only claim `10/10` when each critical target is `5/5`.
3. cleanup readiness:
   - tests + manual QA evidence recorded in brief,
   - PR/branch ready for merge and post-merge hygiene.

Docs-only closeout rule:

- If the final diff is pure docs/governance, `npm run verify:pre-pr` and `npm run verify:pre-merge` may close out through the docs-only lane.
- If the closeout diff touches scripts, tests, package/config, workflows, or runtime code, use the full lane even if the intent is "docs cleanup".

Agent should explicitly ask owner before final lifecycle actions:

- `Do you want to move this brief to done now?`
- `Do you want me to run post-merge local sync + branch cleanup now?`
- After merge and local `main` sync, run `npm run post-merge:preflight` before moving any just-merged brief to `done/`.

## Naming Convention

- `YYYY-MM-DD-short-title.md`

Example:

- `2026-02-14-add-to-home-screen.md`

## Agent Rule

Before starting a new brief or implementation slice, the agent must first explain in Norwegian, for a non-programmer, what it will do, why it matters, and what is intentionally out of scope.

When an agent starts implementing a brief, it should move that brief from `planned/` to `in-progress/`.
After the related PR is merged, move it from `in-progress/` to `done/`.
When a PR is ready, agent handoff should include direct merge URL:
`https://github.com/stianvikra/freeswimming/pull/<PR_NUMBER>`.
After merge confirmation, agent handoff should include local sync commands:
`git checkout main`
`git pull --ff-only origin main`
`git branch -d <merged-branch>`

## Branch Hygiene Best Practice

Use this cadence to keep repository branches clean and predictable:

1. After each merged PR (same session):
   - `git checkout main`
   - `git pull --ff-only origin main`
   - `npm run post-merge:preflight`
   - `git branch -d <merged-branch>`
   - if remote branch remains: `git push origin --delete <merged-branch>`
   - `git fetch --prune origin`
2. At least once per active day:
   - `git branch -vv`
   - clean stale local branches that show upstream `: gone` (with owner confirmation).
3. Safety:
   - do not force-delete (`git branch -D`) unless explicitly confirmed by owner or after creating a dated backup/tag.

## PR Browser Rule

Use one browser default for PR handoff links to reduce friction:

- open PR create/review/merge URLs in Safari by default:
  - `osascript -e 'tell application "Safari" to activate' -e 'tell application "Safari" to open location "<PR_URL>"'`
- only use another browser if owner explicitly requests it.

## Manual QA URL Rule

For manual QA steps, reduce owner copy/paste work:

- assistant should open each QA URL in Safari before asking for `done`:
  - `osascript -e 'tell application "Safari" to activate' -e 'tell application "Safari" to open location "<QA_URL>"'`
- then ask for one concrete validation result per step.
- only skip auto-open when owner explicitly asks to open URLs manually or use another browser.
