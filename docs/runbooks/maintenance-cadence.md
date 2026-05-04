# Maintenance Cadence Runbook

## Purpose

Keep dependency hygiene, runtime pinning, performance budgets, and release-gate evidence on a predictable rhythm instead of relying on memory during feature work.

## Cadence

| Rhythm    | Owner action                                                                                                        | Evidence location                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Weekly    | Review Dependabot PRs, security alerts, CodeQL, nightly E2E, and audit risk.                                        | GitHub PRs/checks plus active maintenance issue if work is needed.                               |
| Monthly   | Complete one maintenance issue from the monthly reminder workflow, including a lightweight stack/tooling fit check. | GitHub issue created by `.github/workflows/monthly-maintenance-reminder.yml`.                    |
| Quarterly | Run a deeper stack/tooling ecosystem-fit audit and decide whether to open fresh planned briefs.                     | Active maintenance issue plus any fresh planned, in-progress, or done stack/tooling audit brief. |

## Monthly Issue Flow

1. Use the auto-created `Monthly maintenance pass - YYYY-MM` issue.
2. If the issue was not created, run `Monthly Maintenance Reminder` manually from GitHub Actions.
3. Work the checklist in `docs/checklists/monthly-maintenance-pass.md`.
4. Open narrow PRs only for concrete changes.
5. Record each PR, decision, and validation result in the monthly issue.
6. Close the issue only after deferrals have owners or planned briefs.

## Continuous Learning Loop

Maintenance is also where repo lessons become durable process improvements. When a PR, CI run, screenshot handoff, support incident, or release gate exposes a repeatable pattern, record it in the narrowest durable place instead of relying on chat memory:

- update the active brief checkpoint or PR body for one-off evidence and explicit `tighten` / `hold` / `revert` decisions,
- update this runbook or the monthly checklist for recurring maintenance workflow changes,
- update testing, architecture, security, billing, or UI-debug runbooks when the lesson belongs to a specific operating surface,
- open a planned brief when the lesson requires product, architecture, or toolchain work that should not be bundled into the current PR.

Keep the change small and place it where the next operator will naturally look before repeating the same work.

## New Tool/Integration Adoption Gate

Any PR that introduces a new tool or integration must register it in the maintenance system in the same PR or explicitly defer that registration to a named follow-up brief. This applies to:

- npm dependencies and dev dependencies,
- GitHub Actions and reusable workflow actions,
- pinned CLIs in workflows or scripts,
- SaaS/API integrations, SDKs, webhooks, dashboards, and external processors,
- environment variables, secret families, and config surfaces,
- database/platform extensions such as Supabase features, storage, realtime, edge functions, or generated-type tooling,
- recommended editor extensions when they become part of the repo workflow.

The adoption record must answer:

- why the tool is needed and why existing stack-native options are not enough,
- where the tool is registered (`package.json`, workflow, script, runbook, checklist, architecture doc, secrets inventory, policy checklist, or recommended extensions list),
- who owns review and maintenance,
- how updates are discovered and applied (Dependabot, npm audit, GitHub Actions updates, vendor release watch, manual monthly review, or quarterly ecosystem-fit audit),
- whether the decision is `upgrade now`, `hold`, `watch`, or `replace later`,
- security, privacy, policy-impact, secret/config, data-boundary, performance, and rollback/replace implications.

If the tool is not represented in `package.json` or `.github/dependabot.yml`, add it to the narrowest durable maintenance surface so it is still reviewed monthly or quarterly. Do not rely on chat memory or local editor state as the only record.

## Stack/Tooling Ecosystem-Fit Audit

Use maintenance to ask a broader question than "are dependencies outdated?": whether the stack and tools are still the best supported, stable, compatible, and launch-safe choices for this app.

Decision vocabulary:

- `upgrade now`: current version/tool creates security, compatibility, support, or delivery risk and the migration path is clear enough for a narrow PR.
- `hold`: current choice remains the best stable fit; record the reason and the next review point.
- `watch`: ecosystem signal is promising or concerning, but evidence is not mature enough to act.
- `replace later`: current tool is acceptable now, but a planned replacement should be evaluated in a named future brief.

Monthly lightweight audit:

- open Dependabot and human/agent PR queue classification,
- `npm audit --omit=dev --audit-level=high`,
- new tool/integration adoption records since the previous pass, including anything not covered by Dependabot,
- runtime alignment across `.nvmrc`, `package.json`, GitHub Actions, Vercel, and local gates,
- runtime support window/EOL posture for the pinned Node LTS line,
- CI/tooling warnings, release-gate flakes, and recurring non-failing warnings,
- `npm run test:perf:trend` and the current perf-budget `tighten` / `hold` / `revert` decision,
- whether any lesson from recent PRs belongs in a runbook, architecture/testing docs, or a planned brief.

Quarterly deeper audit:

- Next.js, React, Node, npm, TypeScript, ESLint, Tailwind/PostCSS,
- Playwright, Vitest, Testing Library, browser matrix, heap/resource assumptions, and flake posture,
- Supabase, generated database types, migrations, auth/RLS assumptions, and fail-closed behavior,
- Stripe SDK/API posture, Checkout/Billing Portal/webhook/finance reconciliation contracts,
- GitHub Actions, CodeQL, Vercel, branch protection, required checks, and rollback path,
- performance budgets, security/audit posture, secrets/config governance, and support/incident runbooks.

Major migration rule:

- Treat major upgrades such as Next, React, Tailwind, TypeScript, ESLint, Stripe, Supabase, Node, or Playwright as controlled migration briefs unless the change is demonstrably risk-free and local/CI gates prove it.
- Do not bundle major toolchain migrations into feature PRs.
- Do not use "latest" as the decision rule. Prefer the best stable choice for the product, runtime, hosting platform, CI, tests, and launch risk.

Pre-live or major-release audit:

- Re-run the ecosystem-fit audit with stricter launch criteria: rollback, secrets/config, monitoring, performance, security, billing, support, and incident diagnostics must be launch-safe before claiming readiness.

## Triage Rules

- Patch/minor dependency PRs: merge when CI and local release gates are green.
- High/critical production advisories: prioritize immediately, keep the PR narrow, and run `npm audit --omit=dev --audit-level=high`.
- Major dependency changes: do not batch into routine maintenance; open or update a planned brief first.
- Workflow/runtime/tooling changes: full validation lane is required.
- Pure docs/governance updates: docs-only lane is allowed when the verification scripts select it.

## Dependency PR Promotion Gate

Use this order before merging routine dependency PRs:

1. Start from a clean, up-to-date `main`.
2. Review open PRs and classify each as:
   - `auto-dependency`: Dependabot or another trusted automation,
   - `human/agent`: owner or agent-created feature/docs work,
   - `superseded`: replaced by newer merged work,
   - `dirty/stale`: cannot be rebased or merged without product review.
3. Close `superseded` PRs with a comment that names the replacing PR, brief, or current `main` evidence. Do not delete branches unless the owner explicitly asks.
4. Hold `dirty/stale` human or agent PRs out of dependency maintenance. Either close as superseded or reopen as a fresh named brief.
5. Promote only one dependency PR at a time:
   - rebase onto current `main`,
   - confirm the PR body/gate evidence is current,
   - run the local release gate before merge recommendation.
6. If local full-lane E2E fails on unrelated tests:
   - keep the dependency PR open,
   - run the failing specs as a targeted baseline pack from `main`,
   - fix or document the baseline blocker before promoting the next dependency PR.

Dependabot PRs are created automatically. They should be treated as a queue of proposals, not as merge-ready work. The right time to promote them is during weekly/monthly maintenance after the baseline gates are green, or immediately for high/critical production security advisories.

## Perf-Budget Ratchet

- Run `npm run test:perf:trend` during monthly maintenance.
- If the recommendation is `tighten`, tighten one metric one step, then run `npm run test:perf:budgets` and the normal release gate.
- If the recommendation is `hold`, record the reason and keep thresholds unchanged.
- If the recommendation is `revert`, stop the maintenance pass and triage the regression before merging unrelated changes.
- After a threshold has just been tightened, treat repeated `tighten` recommendations from pre-existing trend history as `hold` until at least two new weekly green cycles have accumulated after the latest threshold change.

Current ratchet baseline:

| Date       | Decision  | Metric              | Change             | Rationale                                                                                                                                                                                                        |
| ---------- | --------- | ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-26 | `tighten` | JS transfer default | `450kb` -> `425kb` | Multiple green weekly runs kept the worst margin above the tighten threshold; recent route medians remained about `305kb`.                                                                                       |
| 2026-04-29 | `hold`    | JS transfer default | none               | `npm run test:perf:trend` still recommended `tighten` (`3` weekly green runs, `25.2%` worst margin), but the latest ratchet was only on `2026-04-26`; wait for two new weekly green cycles after that threshold. |
| 2026-05-04 | `tighten` | JS transfer default | `425kb` -> `400kb` | `npm run test:perf:trend` recommended `tighten` with `4` weekly green runs and `25.1%` worst margin; latest route JS transfer medians stayed around `318kb` or lower.                                            |

Do not take another stretch-target step until at least two weekly green runs have accumulated after the latest threshold change.

## Dependency-Wave Baseline Audit

After a controlled dependency wave, run one short maintenance-baseline audit before opening more maintenance work:

- confirm the open PR queue is empty or classified,
- run `npm run test:perf:trend` and record `tighten` / `hold` / `revert`,
- run or review `npm audit --omit=dev --audit-level=high`,
- confirm architecture/testing docs match the current major stack and local gate assumptions,
- record recurring non-failing E2E warnings as diagnostics with an owner or planned hardening brief if they repeat.

## Billing Carry-Forward

The Stripe sandbox invoice follow-up is not part of routine maintenance cadence. It was resolved on `2026-04-26` with one fresh post-`bd3a9e5` sandbox purchase that confirmed invoice-backed Checkout, finance reconciliation, and Billing Portal invoice-history evidence. Repeat this check before live billing confidence only if the checkout, portal, webhook, or finance reconciliation contract changes.

## Release Gate

Before opening or updating a maintenance PR:

```bash
npm run verify:pre-pr
```

Before merge:

```bash
npm run verify:pre-merge
```

For local Playwright-heavy gates, use the repo's normal Node runtime from `.nvmrc`. Playwright's managed Next devserver defaults to `8192` MB through `playwright.config.ts` after the Tailwind 4 migration. If a local machine needs a different ceiling, override it with:

```bash
PW_NEXT_DEV_MAX_OLD_SPACE_SIZE_MB=8192 npm run verify:pre-merge
```
