# AGENTS.md

## Purpose

This file defines how coding agents should collaborate in this repository.

## Tech Baseline

- Next.js 16 App Router
- TypeScript (strict)
- Tailwind CSS
- Playwright E2E
- Vitest + Testing Library unit/component tests

## Repo Map

- `app/`: routes, layouts, metadata, and API handlers.
- `components/`: page-level and feature components.
- `components/ui/`: reusable UI primitives and helpers.
- `tests/unit/`: fast unit/component tests.
- `tests/e2e/`: browser flows, navigation behavior, and accessibility checks.
- `docs/`: architecture, product rules, API contracts, testing and UX principles.

## Definition Of Done

1. Requested behavior is implemented and scoped correctly.
2. Relevant tests are added or updated.
3. `npm run verify:pre-pr` passes locally; use `npm run verify:pre-merge` before merge. For pure docs/governance diffs these commands may auto-select the docs-only lane; any code-touching diff still requires the full lane.
4. Accessibility semantics are preserved for changed UI.
5. Related docs are updated when rules/contracts change.
6. If admin/user workflow labels, actions, or recovery behavior changed, `Help/Guide` and relevant runbooks are updated in the same PR.
7. Business logic invariants and data integrity constraints for changed scope are explicitly validated (tests and/or deterministic runtime guards).
8. Changed task briefs pass `npm run lint:briefs` (scorecard categories + target threshold/evidence checks).
9. Help-center assertions are updated when Help/Guide content contract changes.

## Platform 10/10 Governance

- Use `docs/quality/platform-10-10-scorecard.md` as the canonical cross-cut quality standard.
- For every new or updated task brief, include explicit scorecard mapping:
  - categories marked `target`, `supporting`, or `N/A`,
  - measurable thresholds for each `target` category.
- Enforcement:
  - changed task briefs must pass `npm run lint:briefs`,
  - scorecard table must include all canonical categories from `docs/quality/platform-10-10-scorecard.md`,
  - each `target` row must include measurable threshold + evidence.
  - for `Incident response and support operations`, `Finance and reporting operations`, and `i18n operational readiness`:
    - if mapped `N/A`, threshold or evidence must include explicit scope rationale (plain `N/A` is not accepted).
- In final handoff for implementation work, include:
  - achieved score per target category (`0-5`),
  - remaining gaps (if any),
  - defer/fix recommendation when a target score is `<4`.
  - if claiming `10/10`, explicitly list critical target categories and confirm each is `5/5`.
- Gate interpretation:
  - release gate: all target categories `>=4/5` (`8/10` minimum),
  - 10/10 claim gate: all critical target categories `5/5` (`10/10`).
- Treat these categories as first-class quality gates across the full platform:
  - UX, UI/design, business logic correctness, data integrity, admin workflow, security/privacy, performance, reliability, SEO/AI discoverability, analytics/KPI, testing, and release/rollback readiness.
  - Include enterprise readiness where relevant:
    - incident response/support operations,
    - finance/reporting operations,
    - i18n operational readiness.
- For stateful features, always require explicit data-boundary decisions in the brief:
  - what is local-only,
  - what is server-canonical,
  - sync/conflict/invalidation behavior.
- For persisted domain entities that have names, slugs, route params, or operator-visible identifiers, briefs must also define an explicit identity contract:
  - canonical stable ID vs human-readable slug/title,
  - whether each identifier is immutable, write-once, or intentionally renameable,
  - `rename` vs `repurpose` policy (when to edit in place vs create a new row/entity),
  - compatibility/alias/redirect behavior if legacy identifiers may still be read anywhere.
- For performance-sensitive work, always set route-level speed targets (CWV/payload) for changed core routes.
- For admin/user workflow changes, briefs must include explicit Help/Guide impact:
  - required Help/Guide update in same PR, or
  - explicit `N/A` rationale.

## Guardrails

- Keep changes minimal and targeted.
- Avoid new dependencies unless they materially improve quality or velocity.
- Preserve existing visual language unless the task explicitly asks for redesign.
- Do not change unrelated behavior in shared components.

## Collaboration Preferences

- Default to one actionable step at a time when guiding the repository owner in UI or terminal flows.
- Keep instructions short and concrete.
- Only provide multi-step batches when explicitly requested.
- Automation-first default:
  - assistant should execute implement/test/git/PR prep steps directly whenever tooling + permissions allow,
  - assistant should only hand off manual steps when they require owner credentials, UI-only actions, or explicit escalation approval.
- Before reporting `npm`/`node` as missing, always attempt `nvm` bootstrap first:
  - `export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"`
  - `[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
  - `nvm use --silent`
- At implementation checkpoints, explicitly prompt the owner to run the next recommended gate:
  - before PR update: `npm run verify:pre-pr`
  - before merge: `npm run verify:pre-merge`
- After `2` consecutive weekly green runs on baseline performance budgets:
  - explicitly prompt the owner to tighten one stretch target step.
  - record tighten/hold/revert decision in the active brief or PR summary.
- Codex sandbox efficiency default:
  - for known port-binding or local web-server commands, run with escalated permissions first (do not attempt a failing sandbox run first).
  - treat these as escalation-first commands:
    - `npm run verify`
    - `npm run verify:pre-pr`
    - `npm run verify:pre-merge`
    - `npm run build`
    - `npm run test:e2e*` / `npx playwright test`
    - `npm run dev`
  - if owner is prompted for command approval, recommend one-time scoped approvals (`Yes, and don't ask again`) for recurring safe prefixes to reduce repeated interruptions.

## Screenshot Review Rule

- For UI, print, layout, branding, or other visibly user-facing changes, assistant must provide a screenshot handoff before merge recommendation.
- Screenshot handoff must happen after targeted implementation QA is stable, but before final merge-ready handoff.
- Required sequence for visual work:
  1. implement the scoped change,
  2. capture screenshot handoff + give a short explanation,
  3. wait for owner approval or visual corrections,
  4. run `npm run verify:pre-pr`,
  5. open/update PR,
  6. run `npm run verify:pre-merge` and summarize merge readiness.
- For visual work, this screenshot approval stop overrides the normal automation-first flow. Assistant should not continue into `verify:pre-pr`, PR creation, or `verify:pre-merge` until the owner has approved the screenshot handoff or explicitly waived that review.
- Handoff must include:
  - an absolute filesystem folder link to the full-resolution screenshot artifacts,
  - `2-4` representative screenshots from the changed surface,
  - one short explanation per screenshot describing what changed and what the owner should verify,
  - explicit note of any known visual caveat or remaining judgment call.
- Chat-embedded screenshot previews are secondary only; owner review should be possible from the linked artifact folder without relying on compressed chat thumbnails.
- Screenshot filenames must make the comparison type explicit:
  - use `before-<surface>-<viewport>.*` and `after-<surface>-<viewport>.*` when the same surface is shown before and after,
  - use `after-<changed-surface>-<viewport>.*` and `reference-<comparison-surface>-<viewport>.*` when the handoff is comparing the changed surface to a separate reference surface instead of a true before-state,
  - assistant must also say explicitly whether the handoff is `before/after` or `after/reference`; ambiguous filenames like `<surface>.png` are not sufficient.
- Owner may request visual corrections from the screenshot handoff before merge; assistant should apply those corrections, refresh the screenshots, and only then proceed to final merge readiness.
- This is required by default for UI/print/layout/brand work, and optional for backend, docs, tooling, and other non-visual changes.

## Sandbox Approval Reality

- Repo docs can record recommended approval habits, but they cannot auto-persist Codex sandbox approvals across chats or machines.
- The only durable reduction in repeated prompts comes from the local tool approval UI when the owner chooses a scoped recurring approval such as `Yes, and don't ask again`.
- Prefer narrow recurring approvals for safe high-frequency prefixes in this repo:
  - `git pull`, `git push`, `git fetch`, `git checkout`, `git worktree add/remove/prune`, `git branch -d/-D`
  - `gh pr checks/view/create/edit/merge`
  - `gh run view/watch/rerun`
  - `npm run verify:pre-pr`, `npm run verify:pre-merge`, `npm run build`, `npm run typecheck`
  - `npx playwright test`, `npx vitest run`
- Expect occasional new prompts anyway when:
  - a command shape has not been approved before,
  - the tool needs elevated access to `.git` refs or protected filesystem paths,
  - the command is destructive or otherwise safety-sensitive.
- Never treat a repo file such as `AGENTS.md` as a substitute for local sandbox consent.
- Operational guidance for this repo lives in:
  - `docs/runbooks/codex-sandbox-approval-cadence.md`

## Automation-First Delivery Contract (Required)

- For normal feature slices, assistant owns end-to-end execution by default:
  - create/switch branch from `main`,
  - implement scoped changes,
  - run required local validation,
  - commit + push,
  - open/update PR in Safari (`npm run pr:create:safari` preferred),
  - monitor required checks and summarize merge readiness.
- Assistant should not pause for permission between normal sub-steps unless blocked by:
  - missing credentials/secrets,
  - sandbox/escalation requirement,
  - explicit owner decision needed for product tradeoff.
- Exception for visual work:
  - when the slice changes UI/print/layout/brand behavior, assistant must pause after screenshot handoff and owner review before continuing to `verify:pre-pr`, PR creation, and `verify:pre-merge`.
- Required gate sequence under automation:
  - before PR update/push: `npm run verify:pre-pr`,
  - before merge recommendation: `npm run verify:pre-merge` + required CI green.
  - pure docs/governance diffs may auto-select the docs-only lane inside those commands; scripts/package/tests/config/workflow/runtime changes must still run the full lane.
- If automation cannot complete a step, assistant must provide:
  - exact blocker,
  - exact next command/UI click,
  - resume point after owner completes it.

## Merge And Release Gates (Required)

- Before opening/updating PR:
  - run `npm run verify:pre-pr`
- Before merge to `main`:
  - run `npm run verify:pre-merge`
  - ensure required CI checks are green
- Gate selection policy:
  - pure docs/governance diffs may use the docs-only lane automatically through `verify:pre-pr` / `verify:pre-merge`
  - any diff touching runtime code, scripts, tests, configs, workflows, or other non-docs files must run the full lane
- Never merge with known failing required checks, even if failures look unrelated.
- For auth, payments, admin, or access-control changes:
  - include relevant negative-path tests (unauthorized/forbidden/failure-mode).

## Security Defaults (Required)

- Never commit secrets, tokens, API keys, or raw `.env` values.
- Treat all env values and request inputs as untrusted.
- For host/origin allowlists:
  - parse URL and validate exact hostname/protocol.
  - do not use substring checks like `.includes("example.com")`.
- Protected API routes must fail closed:
  - unauthenticated/unauthorized should return `401`/`403`, not `500`.
- Add or update tests for security-sensitive negative paths when behavior changes.

## Test Cadence Contract

- Default local cadence during implementation:
  - run relevant targeted tests after each meaningful change.
  - run `npm run verify:pre-pr` before every PR update/push checkpoint.
- Docs-only closeout rule:
  - for pure docs/governance diffs, `npm run verify:pre-pr` and `npm run verify:pre-merge` auto-select the docs-only lane.
  - use `VERIFY_FORCE_FULL=1` when you intentionally want the full lane on an otherwise docs-only diff.
- For local Playwright:
  - keep isolated defaults (`PW_PORT=3100`, `NEXT_DIST_DIR=.next-playwright`, `SITE_LOCK_ENABLED=0`).
  - only use `PW_REUSE_EXISTING_SERVER=1` as explicit debug override.
- Before merge:
  - run `npm run verify:pre-merge`.
- For private-gate runs (`SITE_LOCK_ENABLED=1`):
  - automation default uses `PW_SITE_LOCK_BYPASS_TOKEN` (auto-wired from `SITE_LOCK_BYPASS_TOKEN` or `.env.local` when available),
  - set `PW_SITE_LOCK_USE_PASSWORD=1` + `PW_SITE_LOCK_PASSWORD` to force real unlock form flow coverage.
- If private-gate UX/password behavior changed, require at least one password-backed run (`PW_SITE_LOCK_USE_PASSWORD=1`).
- Keep Playwright coverage aligned to supported matrix (mobile/tablet/desktop + major engines).
- Do not silently skip tests to make CI pass; document rationale in brief/PR when skips are intentional.
- Execution behavior in Codex:
  - run release-gate commands with escalation-first strategy to avoid redundant failed attempts under sandbox networking restrictions.
  - only fall back to non-escalated runs for fast read-only checks that are known to succeed in sandbox.

## Failure And Flake Protocol

- If CI fails:
  - identify root cause from logs before proposing rerun-only actions.
  - implement fix first when deterministic failure is found.
- For flaky tests:
  - allow one rerun to confirm flake.
  - harden locator/wait strategy and add follow-up note in brief/PR.
- Keep assertions aligned to current product behavior/flags to avoid stale test contracts.

## Database And Schema Discipline

- Prefer explicit migrations for schema/constraint changes; avoid hidden runtime drift.
- Keep TypeScript/data contracts in sync with DB changes in the same workstream.
- For mutable admin/content schemas:
  - preserve backward compatibility or document migration impact clearly.

## Feature Flag And Runtime Policy

- New user-facing behavior should be behind a runtime flag when rollout risk is non-trivial.
- Define fallback behavior for missing/invalid runtime config.
- Keep private-mode/site-lock behavior consistent across UI, metadata, sitemap, and protected APIs.

## PR Handoff Contract

- PR handoff must include:
  - what changed (user-visible + technical),
  - validation evidence (commands + results),
  - risk/regression notes,
  - follow-up items (if any).
- Open PR/review/merge links in Safari and make the Safari tab active when possible.
- Prefer `npm run pr:create:safari` for PR handoff:
  - auto-creates PR when `gh` CLI auth is available,
  - otherwise falls back to Safari PR page.

## Session Recovery And Continuity

- Canonical recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen active task brief and continue from latest checkpoint.
- Update brief checkpoint log at each meaningful milestone:
  - latest commit hash,
  - completed scope,
  - next step.
- If work is paused with a dirty tree:
  - summarize pending changes and intended next action before handoff.

## Task Brief

Use `docs/task-brief-template.md` when giving coding tasks.
Store briefs in lifecycle folders:

- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- `docs/task-briefs/blocked/`

When implementation starts, move brief to `in-progress`.
When merged, move brief to `done`.
