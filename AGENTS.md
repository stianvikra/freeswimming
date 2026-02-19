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
3. `npm run verify:pre-pr` passes locally; use `npm run verify:pre-merge` before merge.
4. Accessibility semantics are preserved for changed UI.
5. Related docs are updated when rules/contracts change.

## Guardrails

- Keep changes minimal and targeted.
- Avoid new dependencies unless they materially improve quality or velocity.
- Preserve existing visual language unless the task explicitly asks for redesign.
- Do not change unrelated behavior in shared components.

## Collaboration Preferences

- Default to one actionable step at a time when guiding the repository owner in UI or terminal flows.
- Keep instructions short and concrete.
- Only provide multi-step batches when explicitly requested.
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

## Merge And Release Gates (Required)

- Before opening/updating PR:
  - run `npm run verify:pre-pr`
- Before merge to `main`:
  - run `npm run verify:pre-merge`
  - ensure required CI checks are green
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
- Before merge:
  - run `npm run verify:pre-merge`.
- Keep Playwright coverage aligned to supported matrix (mobile/tablet/desktop + major engines).
- Do not silently skip tests to make CI pass; document rationale in brief/PR when skips are intentional.

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
