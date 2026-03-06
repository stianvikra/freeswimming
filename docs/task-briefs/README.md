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
2. move to `in-progress/` when implementation starts
3. move to `done/` after merge
4. move explicit postponed scope to `deferred/` with rationale and re-entry trigger

Deferred re-entry flow:

1. move from `deferred/` to `planned/` when reprioritized
2. resume standard lifecycle (`planned` -> `in-progress` -> `done`)

When moving to `done/`, add a completion record:

- PR link and merge info
- delivered feature/files summary
- test evidence summary (local + Vercel preview for changed flows)
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
- Help/Guide impact declaration:
  - if workflow labels/actions/recovery behavior changed, Help/Guide + relevant runbook updates are required in the same PR,
  - otherwise explicit `N/A` rationale is required.

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
   - score target categories from `docs/quality/platform-10-10-scorecard.md` (`0-5`) and record results.
   - verify Help/Guide freshness for changed workflows (and runbook links where relevant).
3. cleanup readiness:
   - tests + manual QA evidence recorded in brief,
   - PR/branch ready for merge and post-merge hygiene.

Agent should explicitly ask owner before final lifecycle actions:

- `Do you want to move this brief to done now?`
- `Do you want me to run post-merge local sync + branch cleanup now?`

## Naming Convention

- `YYYY-MM-DD-short-title.md`

Example:

- `2026-02-14-add-to-home-screen.md`

## Agent Rule

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
