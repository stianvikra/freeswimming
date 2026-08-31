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
10. Forward compatibility is explicit for changed scope: new products, labels, workflow states, identifiers, routes, locales, providers, exports, or analytics values either follow from canonical data automatically or require a documented mapping/update path with tests or rationale.

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
  - a short plain-language done summary: what changed and why it matters, readable without code knowledge,
  - exactly one recommended next step, or `No next step: <rationale>` when the workstream is fully closed,
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
- For every brief that touches an existing domain object, workflow, editor, review surface, import/export, provider sync, admin workflow, or user-facing correction flow, include an explicit domain granularity contract:
  - user's mental object, for example session, workout, program, habit, invoice, entitlement, provider activity, or admin content item,
  - canonical persisted object(s) and child object(s),
  - mature reference surface and view-model/component contract,
  - all relevant levels of detail, for example summary, section/block, repeat, step, set, check-in, line item, invoice row, provider evidence, note, or attachment,
  - for each level, whether the active slice supports `view`, `edit`, `create`, `delete`, `reorder`, `reconcile`, or is explicitly out of scope,
  - if a domain object has child structure, the active slice must at least show the child structure read-only when that structure is part of the user's mental model, or include a concrete `N/A` rationale.
- Do not claim `10/10` for a workflow if the UI, tests, or screenshot handoff operate only at a summary level while the user-facing object is built, reviewed, reconciled, or trusted at a child-object level.
- Every new or refreshed implementation brief must include a forward compatibility contract:
  - which future additions should be data-driven automatically, for example products, catalog rows, categories, workflow states, locales, export formats, or analytics payload values,
  - which future additions require an explicit mapping or owner decision,
  - the safe fallback for unknown, deprecated, or unmapped values,
  - the test/evidence that proves the active slice is not hardcoded to today-only values, or an explicit `N/A` rationale for docs-only work.
  - Use `docs/runbooks/task-brief-forward-compatibility-contract.md` as the checklist.
- For performance-sensitive work, always set route-level speed targets (CWV/payload) for changed core routes.
- For admin/user workflow changes, briefs must include explicit Help/Guide impact:
  - required Help/Guide update in same PR, or
  - explicit `N/A` rationale.

## Stack Best-Practice And Architecture Gate

- Every feature, refactor, integration, or data brief must state the impacted stack surfaces and the expected best-practice pattern before implementation.
- At minimum, consider these stack surfaces when relevant:
  - React/Next.js component composition, shared view-models, route boundaries, server/client component split, actions/API routes, and cache behavior,
  - TypeScript contracts, validation, error modeling, and deterministic domain invariants,
  - Supabase schema, migrations, RLS, auth boundaries, indexes, storage, and generated DB types,
  - external services and SDKs, including official docs, least-privilege credentials, idempotency, retries, webhooks, and observability,
  - Tailwind/UI primitives, accessibility, responsive behavior, and reference-surface reuse,
  - test strategy across unit, integration, Playwright, negative paths, and screenshot handoff.
- For React UI, identify the mature reference surface or shared component first. Reuse it directly, or adapt new data into its contract before creating new markup.
- For Supabase or persisted data changes, use explicit migrations, fail-closed RLS/authz, typed contract updates, and negative-path tests.
- For external services, prefer official SDK/docs and document webhook/retry/idempotency/secret-handling rules in the brief.
- If the best-practice fix is larger than the active slice, keep the active patch safe and create a dated follow-up brief with the architectural target, scorecard mapping, and acceptance criteria.
- Do not claim `10/10` architecture unless the active brief names the relevant stack surfaces, proves reuse or a justified exception, and validates the critical invariants with tests or direct evidence.
- Do not claim forward compatibility when the code is hardcoded to today's known rows, labels, or product IDs unless the brief explicitly says that future values require a mapping update and includes the fallback behavior for unmapped values.

## Codex Skill And Stack Readiness Radar

- Use `docs/runbooks/codex-skill-stack-readiness-radar.md` when a merge/closeout leaves no active child and the next primary goal changes, when creating or refreshing a broad brief, or before high-risk auth/payments/admin/data/analytics/UI/deploy work.
- Use `docs/runbooks/codex-local-automation-friction-defaults.md` when repeated safe prompts, local screenshot/browser failures, stuck PR checks, stale generated local artifacts, or current-workstream process cleanup start slowing normal execution.
- Treat Codex skills/plugins/MCP tools as local/session capabilities, not repo state. Audit availability from current session metadata and local evidence before relying on them.
- Do not install, enable, disable, or configure local Codex skills/plugins/MCP servers unless the owner explicitly approves that local config change.
- Radar findings must be classified as `safe process/docs update`, `bounded implementation child`, `deferred architecture decision`, or `do not do`, with at most three recommended next improvements in the handoff.
- Stack or capability findings must not expand an active product/runtime slice; create or update a bounded task brief when implementation is needed.

## Guardrails

- Keep changes minimal and targeted.
- Avoid new dependencies unless they materially improve quality or velocity.
- Preserve existing visual language unless the task explicitly asks for redesign.
- Do not change unrelated behavior in shared components.

## Collaboration Preferences

- Default to one actionable step at a time when guiding the repository owner in UI or terminal flows.
- Keep instructions short and concrete.
- Only provide multi-step batches when explicitly requested.
- Before starting a new brief or implementation slice, Codex must first give a short Norwegian explanation for a non-programmer:
  - what will be done,
  - why it matters,
  - what is intentionally out of scope.
- Before recommending a next slice, Codex must include the same non-programmer explanation plus one sentence on the forward-compatibility intent:
  - what should automatically keep working when new products/labels/workflows/data values are added,
  - or what future addition will require an explicit mapping/update.
- Do not begin implementation until that explanation has been given, unless the owner already provided an equally clear explanation in the current request.
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
  - a clickable absolute filesystem folder link to the full-resolution screenshot artifacts, labeled `Screenshot artifacts`,
  - the capture timestamp as `Captured: YYYY-MM-DD HH:MM` in local time,
  - `2-4` representative screenshots from the changed surface,
  - one short explanation per screenshot describing what changed and what the owner should verify,
  - explicit note of any known visual caveat or remaining judgment call.
- Screenshot artifact folders must include date and time in the folder name, for example `output/<scope>-YYYY-MM-DD-HHMMSS`, so screenshot evidence cannot be confused with later commit, gate, or PR timestamps.
- Do not provide screenshot artifact folders only as backticked text paths; every screenshot handoff and final merge-ready handoff for UI/print/layout/brand work must repeat the same clickable `Screenshot artifacts` folder link.
- If product-rendering files, styles, assets, or export HTML change after screenshot capture, regenerate the screenshots before continuing. If no visual/rendering files changed after capture, state that explicitly in the final merge-ready handoff.
- Chat-embedded screenshot previews are secondary only; owner review should be possible from the linked artifact folder without relying on compressed chat thumbnails.
- Screenshot filenames must make the comparison type explicit:
  - use `before-<surface>-<viewport>.*` and `after-<surface>-<viewport>.*` when the same surface is shown before and after,
  - use `after-<changed-surface>-<viewport>.*` and `reference-<comparison-surface>-<viewport>.*` when the handoff is comparing the changed surface to a separate reference surface instead of a true before-state,
  - assistant must also say explicitly whether the handoff is `before/after` or `after/reference`; ambiguous filenames like `<surface>.png` are not sufficient.
- Local Freeswimming screenshot default:
  - before trying MCP/browser-channel capture, use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` and start Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`,
  - capture against `http://127.0.0.1:3000` consistently,
  - if Playwright browser binaries are missing, run `npx playwright install chromium`,
  - on macOS/Codex, run Chromium screenshot scripts with escalated permissions when sandbox launch fails,
  - when dev-login or Supabase egress blocks screenshot-only capture, use the temporary local visual-harness fallback in `docs/runbooks/codex-local-automation-friction-defaults.md` instead of widening cloud access.
- Owner may request visual corrections from the screenshot handoff before merge; assistant should apply those corrections, refresh the screenshots, and only then proceed to final merge readiness.
- This is required by default for UI/print/layout/brand work, and optional for backend, docs, tooling, and other non-visual changes.

## Reference Surface Reuse Gate

- Before building or materially changing a UI surface that represents an existing domain object or workflow, identify the most mature reference surface in this repo.
- Reuse the same component, view-model contract, or renderer first. If direct reuse is not practical, adapt the new data into the same display contract.
- Before choosing a summary-only UI for an existing object, compare the UI granularity against the reference surface and the user's mental object. If the reference object is built from children, such as swim-session steps/repeats, dryland exercises/sets, program weeks/days/assignments, habit cadence/check-ins, admin content modules/lessons/fields, commerce customer/session/invoice/entitlement records, or provider sent/received/reconciled evidence, the brief must state why each child level is viewable, editable, deferred, or irrelevant.
- If the new surface intentionally differs from the reference, document the reason in the active brief and screenshot handoff.
- For swim-session step UI, use `docs/design/session-step-surface-contract.md` and the manual pool session builder as the reference for `Edit`, `Rearrange`, and `View`.
- Screenshot handoff for parity work must include `after/reference` artifacts where practical, not only standalone after-screenshots.
- When changing a reference surface, sweep sibling surfaces that use the same domain object and either update them in the same PR or record the deferred parity decision in the active brief.

## UI Debugging And High-Cost Bug Protocol

- For visual, screenshot, export, browser, or layout bugs, use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- If a fix attempt fails twice, the observed symptom contradicts the claimed fix, or the owner flags that the same issue remains, stop patching by intuition and switch to a ranked hypothesis loop:
  - restate the exact observed failure,
  - list plausible causes in likelihood order,
  - verify or eliminate them one by one with targeted evidence,
  - make the smallest fix,
  - regenerate the relevant full-resolution artifacts before presenting again.
- Do not claim a UI/export bug is fixed until the validation directly checks the original failure mode. For image/export issues, inspect the actual exported artifact, not only the in-browser preview.
- Log repeated or expensive bugs in `docs/runbooks/high-cost-debug-log.md` with symptom, root cause, fix pattern, detection, and prevention test.
- Before debugging a similar issue later, check `docs/runbooks/high-cost-debug-log.md` for prior causes and probes.

## Route, Label, And Support-Surface Impact Sweep

- For changes that remove, rename, consolidate, or materially reposition routes, route params, user/admin labels, workflow actions, Help/Guide surfaces, runbooks, recovery paths, or operator-facing support surfaces, use `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- Run the targeted `rg` sweep before the first broad gate, not after `verify:pre-pr` or `verify:pre-merge` fails.
- Check at minimum `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, and Help/Guide assertions when relevant.
- Update product code, tests, docs, runbooks, and task brief fallout in the same commit whenever practical. If a fallout item is intentionally deferred, record the rationale and follow-up brief in the active brief or PR body.
- Treat `verify:pre-pr` and `verify:pre-merge` as confirmation gates for this class of work, not as the primary discovery mechanism.

## Session Handoff Timing

- Start a new chat or provide a carry-forward prompt when it is the best way to preserve momentum and reduce risk, not only when context is already heavy.
- Mandatory chat-handoff gate:
  - After every merge + local sync, and before creating a new implementation branch or starting a new active brief, assistant must explicitly assess whether to continue in the current chat or start a new chat.
  - If `npm run post-merge:preflight` surfaces a repo-managed docs-only closeout for the just-merged workstream, complete that closeout PR in the same chat before making the chat-handoff assessment. Treat the closeout as part of the same workstream, not as a new implementation slice.
  - If the owner explicitly approved merging the just-merged workstream, that approval also authorizes exactly one repo-managed docs-only post-merge closeout PR for the same workstream to be created, validated, merged, synced, and pruned automatically when all closeout gates pass.
  - Stop for explicit owner approval instead when the closeout is not exactly one repo-managed docs-only lifecycle/update diff, is not for the just-merged workstream, touches runtime code/scripts/config/tests/workflows, conflicts, fails local or CI gates, or needs a product/scope decision.
  - The post-merge handoff must include exactly one of:
    - `Chat: continue here` with a short rationale, or
    - `Chat: start new chat` with a ready-to-use carry-forward prompt.
  - If the next step changes the primary goal, starts a new implementation slice, changes from docs/maintenance to feature work, or starts UI work with screenshot handoff, default to `Chat: start new chat`.
  - When `Chat: start new chat` is recommended, assistant must stop before implementation work unless the owner explicitly says to continue in the same chat.
- Strong triggers include:
  - the workstream reaches a stable checkpoint and the next primary goal changes,
  - context is mixing multiple briefs or several PRs,
  - repeated tool/connection interruptions make the thread hard to trust,
  - the owner is about to travel, close the machine, or pause for a long period,
  - the next step can run independently in GitHub/CI or a new implementation slice.
- Use `docs/runbooks/pr-flow-and-chat-handoff.md` for the carry-forward prompt shape.

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
  - `docs/runbooks/codex-local-automation-friction-defaults.md`

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
  - this gate must first confirm the current feature branch contains latest `origin/main`; if it fails, rebase before opening/updating the PR
- Before merge to `main`:
  - run `npm run verify:pre-merge`
  - this gate must also confirm the branch is current with latest `origin/main`
  - ensure required CI checks are green
- Post-merge closeout auto-merge exception:
  - after explicit owner approval to merge a workstream PR, the assistant may automatically merge one follow-up PR only when `npm run post-merge:preflight` surfaced it as a repo-managed docs-only closeout for that same just-merged workstream,
  - the closeout PR must contain only docs/brief lifecycle or closeout evidence updates, must use the docs-only lane, must have green required CI, and must pass `npm run verify:pre-merge` on the closeout branch,
  - after auto-merging the closeout PR, sync `main`, prune deleted refs, rerun `npm run post-merge:preflight`, then do the mandatory chat-handoff assessment.
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
  - a plain-language done summary for the repo owner,
  - exactly one recommended next step, or `No next step: <rationale>`,
  - what changed (user-visible + technical),
  - validation evidence (commands + results),
  - risk/regression notes,
  - follow-up items (if any).
- Open PR/review/merge links in Safari without overwriting the owner's active tab:
  - first check whether Safari is open on the same desktop/space as VS Code when practical,
  - reuse an existing tab for the same PR when one is already open,
  - otherwise open a new tab,
  - never replace the URL in the currently active Safari tab unless that tab already belongs to the target PR.
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
Every new brief or slice must start with the pre-implementation owner explanation from Collaboration Preferences before implementation begins.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
