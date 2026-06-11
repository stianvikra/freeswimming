# Task Brief: Codex Local Automation Friction + Visual Capture Defaults (10/10)

## Metadata

- `id`: `2026-06-11-codex-local-automation-friction-visual-capture-defaults-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `execution_mode`: `docs-governance`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: branch `codex-local-automation-friction-visual-capture-defaults` from clean synced `main@af277c01` after PR `#1087` and repo-managed closeout PR `#1088`
- `audit_status`: `ready`
- `decision`: Execute this bounded docs/governance slice before returning to the workout commercial analytics parent; keep runtime app code, tests, scripts, dependencies, local Codex configuration, and product scope out of this PR.
- `reason`: The owner identified repeated safe-but-noisy prompts and repeated screenshot/CI/debug fallback patterns that should become durable process instead of chat memory. Existing governance covers skill/stack radar, sandbox reality, screenshot handoff, and PR flow, but it does not yet centralize the known-good local automation decision ladder.
- `must_refresh_before_execution_if`: Refresh if `AGENTS.md`, screenshot handoff rules, sandbox approval guidance, GitHub/PR flow, `docs/runbooks/ui-debug-hypothesis-and-handoff.md`, `docs/runbooks/codex-sandbox-approval-cadence.md`, `docs/runbooks/pr-flow-and-chat-handoff.md`, Codex/Playwright/browser availability, or the workout commercial analytics parent status changes.

## Goal

Make recurring Codex local automation friction predictable by documenting when to go directly to known-good screenshot, CI, process-cleanup, and approval patterns, while preserving the return path to workout commercial analytics.

## Pre-Implementation Owner Explanation

Vi lager en kort systemregel for de tingene som ofte stopper arbeidet med unodvendige "ja/ok"-sporsmal: skjermbilder, Chromium/Playwright, Supabase-egress ved lokal innlogging, hengende prosesser, GitHub Actions som ikke starter, og smale sandbox-godkjenninger. Dette betyr at Codex kan bruke den beste kjente metoden raskere neste gang, uten a late som repoet kan auto-godkjenne lokale sandbox-valg. Utenfor scope er appkode, habits, workout analytics runtime, tester/scripts, dependencies, lokale Codex-installasjoner, Supabase/Stripe/Vercel-endringer og produktbeslutninger.

Forward-compatibility intent: nye gjentatte friksjonsmonster skal kunne legges til som smale runbook-regler eller bounded briefs, mens nye produktideer fortsatt skal tilbake til riktig parent/child-brief for prioritering.

## Current Capability And Systemization Audit Snapshot

Evidence from the 2026-06-11 audit:

- `AGENTS.md` already contains stack best-practice, skill/stack radar, screenshot, automation-first, sandbox approval, and merge-gate rules.
- `docs/runbooks/codex-skill-stack-readiness-radar.md` already says repeated CI, screenshot, approval, or debugging patterns should become durable process.
- `docs/runbooks/codex-sandbox-approval-cadence.md` already explains that repo docs cannot auto-persist sandbox approvals; only local Codex approval UI can.
- `docs/runbooks/ui-debug-hypothesis-and-handoff.md` already defines the known-good local screenshot baseline.
- `docs/runbooks/pr-flow-and-chat-handoff.md` already owns PR flow, closeout, and chat handoff.
- Historical done briefs show repeated local visual harness, stale Next type cache, dev overlay, Chromium sandbox, and GitHub check-start recovery patterns.

Top three systemic findings for this slice:

| Surface                  | Finding                                                                                                                                                                                | Severity | Recommended Type           | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | --------------------- | -------------------- |
| Local screenshot capture | Known-good capture defaults exist, but the Supabase-egress/dev-login harness fallback, concrete waits, dev-overlay hiding, and cleanup sequence are scattered across done briefs.      | `medium` | `safe process/docs update` | `no`                  | this brief           |
| Sandbox approval cadence | Existing guidance lists common prefixes, but recurring process cleanup, Playwright browser install, local Next dev, and safe GitHub check triage prompts need narrower decision rules. | `medium` | `safe process/docs update` | `no`                  | this brief           |
| GitHub/CI recovery       | PR checks that fail to start should prefer repo/CLI/API recovery before Safari/MCP UI, but that sequence is not explicit in the PR-flow runbook.                                       | `low`    | `safe process/docs update` | `no`                  | this brief           |

Lower-priority findings:

- Habit timer/quit/start questions belong to the existing planned habits parent and must not be implemented or reprioritized in this docs/governance slice.
- The older session-step shared renderer prompt is stale enough to require audit-only refresh before any new refactor; it is not part of this slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: every canonical category is a `target` for the docs/governance scope. Every target category is critical for the 10/10 claim.

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin editor ergonomics
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Admin workflow and editability
- SEO and crawlability
- AI discoverability
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                             | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | Workflow friction rules must preserve the active parent and prevent automation cleanup from becoming product scope.                            | return contract + PR handoff          | `5/5`                   |
| UX flow clarity                               | `target` | Manual prompts should become fewer, clearer, and tied to one next action when owner input is truly needed.                                     | runbook decision ladder + AGENTS link | `5/5`                   |
| Visual design quality                         | `target` | Screenshot work must use artifact-quality capture defaults, hide capture-only overlays, and preserve visual approval stops.                    | UI debug runbook update               | `5/5`                   |
| Business logic correctness and data integrity | `target` | Harness and screenshot fallbacks must never write app data, bypass production guards, or change business logic.                                | scope contract + runbook guardrails   | `5/5`                   |
| Admin editor ergonomics                       | `target` | Admin/GitHub/UI triage should prefer CLI/API evidence before asking for manual Safari steps.                                                   | PR-flow recovery sequence             | `5/5`                   |
| Accessibility (a11y)                          | `target` | Capture/debug guidance must not weaken existing screenshot/a11y owner-review requirements for UI work.                                         | AGENTS + UI debug linkage             | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | Docs-only changes must add no runtime payload; future capture guidance should avoid repeated failed browser attempts.                          | docs-only diff + validation           | `5/5`                   |
| Data placement and sync boundaries            | `target` | Local Codex approvals, temp harnesses, local caches, and app server-canonical data must remain explicitly separated.                           | data contract + runbook guardrails    | `5/5`                   |
| Caching and invalidation strategy             | `target` | Stale generated Next type/cache cleanup may be used only for local generated artifacts from the current capture flow.                          | local cleanup rule                    | `5/5`                   |
| Reliability and failure handling              | `target` | Known failure modes must route to deterministic fallbacks: Chromium sandbox escalation, concrete waits, harness fallback, and process cleanup. | local automation runbook              | `5/5`                   |
| Security and authz                            | `target` | Supabase egress and auth guards must remain fail-closed; no production DB/API writes for screenshots.                                          | security guardrail text               | `5/5`                   |
| Privacy and compliance                        | `target` | Screenshot/harness guidance must avoid secrets, raw env values, customer data, private tokens, and cloud write traffic.                        | privacy guardrails                    | `5/5`                   |
| Content governance                            | `target` | Durable rules must live in canonical runbooks/AGENTS and this active brief, not only in chat or historical done briefs.                        | changed docs + brief lint             | `5/5`                   |
| Admin workflow and editability                | `target` | PR/GitHub recovery should not mutate PR state unless it is a narrow check-trigger action with evidence and normal PR ownership.                | PR-flow docs                          | `5/5`                   |
| SEO and crawlability                          | `target` | Docs-only automation guidance must not change public routes, metadata, sitemap, robots, canonical URLs, or structured data.                    | explicit scope rationale              | `5/5`                   |
| AI discoverability                            | `target` | No public AI-discoverable content changes; future AI/content findings remain routed through bounded briefs.                                    | explicit scope rationale              | `5/5`                   |
| Analytics and KPI observability               | `target` | Return path must preserve workout commercial analytics sequencing instead of allowing tooling cleanup to consume analytics scope.              | return contract                       | `5/5`                   |
| Commerce and revenue ops                      | `target` | No checkout, Stripe, entitlement, price, finance, or reporting behavior changes; future commerce friction remains bounded.                     | explicit scope rationale              | `5/5`                   |
| Incident response and support operations      | `target` | Runbooks must make repeated local CI/screenshot/debug recovery faster and supportable without relying on chat memory.                          | runbook updates + high-cost log       | `5/5`                   |
| Finance and reporting operations              | `target` | No finance data or reporting operations change; any future finance/provider automation needs a separate owner-approved brief.                  | explicit finance scope rationale      | `5/5`                   |
| i18n operational readiness                    | `target` | No user-facing copy/locales change; future prompt/runbook labels remain English repo docs unless a locale/content brief owns translation.      | explicit i18n scope rationale         | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Use repo-native docs/runbooks only; add no dependency, script, workflow, local Codex install, or runtime abstraction.                          | diff review                           | `5/5`                   |
| Testing and QA automation                     | `target` | Changed briefs/runbooks must pass brief lint, docs-only verification, pre-PR gate, CI, and pre-merge gate.                                     | validation commands                   | `5/5`                   |
| Scalability and cost efficiency               | `target` | Fewer failed browser/CI/debug attempts should reduce local execution time without increasing runtime/cloud cost.                               | runbook defaults + docs-only diff     | `5/5`                   |
| DevOps and rollback readiness                 | `target` | The PR must be docs-only and revertable; no config, migration, package, workflow, or local machine state change required.                      | git diff + rollback note              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

Impacted stack surfaces:

- React/Next.js:
  - No runtime route, component, server action, API, cache, or revalidation behavior changes.
  - Future screenshot harness guidance may render production components locally with mock data, but only as a temporary capture fixture that is removed before validation and PR diff.
- TypeScript/domain contracts:
  - No TypeScript code or domain contract changes.
- Supabase/data:
  - No migrations, RLS, auth, storage, generated types, or DB reads/writes.
  - Supabase egress guard remains authoritative; visual capture must not bypass it for cloud writes.
- External services/tools:
  - GitHub CLI/API recovery is limited to PR/check troubleshooting.
  - No Stripe, Vercel, OpenAI API, MCP, or local Codex config changes.
- UI system:
  - No product UI change.
  - Screenshot guidance preserves existing artifact handoff and owner visual approval stops.
- Testing:
  - Docs-only validation lane is expected.

If implementation pressure suggests scripts or automation code, defer it to a separate brief with explicit owner approval.

## Data Placement And Sync Contract

- Repo-canonical:
  - This brief and the updated runbooks/AGENTS are the durable source of truth.
- Local-only:
  - Codex sandbox approvals, local browser binaries, `.next` generated caches, temporary screenshot scripts, temporary fixture routes, dev servers, and process IDs are local machine state.
- Server-canonical:
  - No app database, Supabase auth, entitlements, commerce, analytics rows, or admin content change.
- Sync policy:
  - Repo docs sync through git.
  - Local approvals cannot sync through repo text; owner must choose scoped recurring approvals in the local Codex UI.
- Retention/sensitivity:
  - Do not store secrets, tokens, raw env values, customer data, raw provider payloads, or private screenshots in repo docs.
- Cache/invalidation:
  - Local generated caches may be cleaned only when they are generated artifacts from the current capture/build flow and are not tracked code.

## Identity And Rename Contract

- Canonical stable IDs:
  - Runbook paths and brief path are stable process identifiers.
  - Safe recurring command prefixes are identified by exact command prefix, not vague intent.
- Human-readable identifiers:
  - Labels such as "local automation friction" and "visual capture defaults" are renameable if path references are updated.
- Mutability:
  - A command prefix may be added to recommended recurring approvals only when it is narrow, repeatable, and safe for normal repo work.
- Rename vs repurpose:
  - Rewording a runbook label is allowed.
  - Turning a docs-only recovery rule into a script, dependency, workflow, or local config change requires a new brief.
- Compatibility:
  - Unknown future prompts default to one-time approval or owner decision until classified.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Future screenshot tools, browser binaries, GitHub check behavior, Codex sandbox prompts, local dev server behavior, generated caches, and CI recovery patterns.
- Source of truth:
  - Durable behavior is in AGENTS and runbooks.
  - Actual sandbox approval persistence remains local Codex UI state.
- Additive behavior:
  - New repeated safe patterns can be added to the local automation runbook and linked from the relevant specific runbook.
- Explicit mapping requirements:
  - New destructive commands, credential-sensitive flows, production service access, scripts, workflows, or local config changes need explicit owner approval and a bounded brief.
- Unknown/deprecated values:
  - Unknown command prompts use one-time approval or owner decision until classified.
  - Unknown browser/CI failures use evidence-first triage, not blind reruns.
- Test/evidence:
  - `npm run lint:briefs`, `npm run lint:briefs:all`, docs-only verification, PR CI, and `npm run verify:pre-merge`.

## Scope

- Create a local automation friction runbook for repeated safe prompts, visual capture fallbacks, process cleanup, and PR-check recovery.
- Update existing runbooks and AGENTS only where needed to point future agents to the new decision ladder.
- Record high-cost repeated patterns so future work starts from the known-good path.
- Preserve explicit return to workout commercial analytics.

Expected files:

- `docs/task-briefs/in-progress/2026-06-11-codex-local-automation-friction-visual-capture-defaults-10-10.md`
- `docs/runbooks/codex-local-automation-friction-defaults.md`
- `AGENTS.md`
- `docs/runbooks/codex-sandbox-approval-cadence.md`
- `docs/runbooks/ui-debug-hypothesis-and-handoff.md`
- `docs/runbooks/pr-flow-and-chat-handoff.md`
- `docs/runbooks/codex-skill-stack-readiness-radar.md`
- `docs/runbooks/high-cost-debug-log.md`
- `docs/task-brief-template.md`

## Out Of Scope

- Runtime app code, UI, routes, API handlers, migrations, tests, scripts, workflows, package files, dependencies, generated DB types, or provider integrations.
- Installing or configuring Codex skills/plugins/MCP servers.
- Persisting sandbox approvals from repo files.
- Bypassing Supabase egress guard or using production Supabase/API writes for screenshots.
- Selecting or implementing habits, session-step, workout analytics, Stripe, finance, export, or product runtime work.
- Rewriting historical done briefs except for future repo-managed closeout requirements.

## Acceptance Criteria

1. A canonical runbook defines the local automation decision ladder for recurring safe prompts, visual capture, process cleanup, GitHub check recovery, and known fallback order.
2. Sandbox approval guidance states which recurring prefixes are good candidates, which require one-time approval, and why repo docs cannot auto-approve.
3. UI debug guidance includes the Supabase-egress/dev-login harness fallback, concrete element waits instead of `networkidle`, Next dev overlay hiding, artifact inspection, and cleanup.
4. PR flow guidance includes a bounded recovery sequence for required checks that do not start.
5. Skill/stack radar points repeated automation friction to the canonical runbook.
6. High-cost debug log records the recurring pattern and prevention path.
7. The return contract points back to `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`.
8. The diff remains docs-only.
9. Changed briefs pass `npm run lint:briefs`; the full brief set passes `npm run lint:briefs:all`.
10. `npm run verify:pre-pr` passes before PR; `npm run verify:pre-merge` passes before merge recommendation.

## Validation

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge`
- `npm run post-merge:preflight` after merge

Docs-only lane is expected. Any non-docs file requires stopping, updating this brief, and getting explicit owner approval for the expanded scope.

## Route, Label, Support, And Help/Guide Impact

- No app route, user/admin label, Help/Guide content, support surface, or workflow action changes.
- This slice updates operator/developer runbooks only.
- Targeted sweep required across `AGENTS.md`, `docs/runbooks/`, `docs/task-brief-template.md`, and active/planned/done briefs for overlapping automation/screenshot/approval/PR-flow guidance.

## Risk And Rollback

- Risk: over-broad approval guidance could encourage unsafe automatic consent.
  - Mitigation: keep recurring approvals narrow and keep destructive/credential-sensitive commands one-time or owner-decision.
- Risk: harness fallback could be mistaken for product behavior.
  - Mitigation: require real production component rendering with deterministic mock data, no API/DB traffic, and fixture removal before validation.
- Risk: CI recovery could mutate PR state unnecessarily.
  - Mitigation: require evidence first and limit close/reopen/rerun actions to the active PR/check recovery path.
- Rollback:
  - Revert the docs-only PR; no runtime or local config rollback should be needed.

## Execution Handoff Contract

- Mode: automation-first docs/governance implementation.
- Keep branch: `codex-local-automation-friction-visual-capture-defaults`.
- Run required docs-only validation.
- Commit, push, open/update PR, monitor CI, and run `npm run verify:pre-merge`.
- Do not merge without explicit owner merge approval.

## Return Contract / Session Continuity

After this brief is created, executed, merged, paused, or closed, return to:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Current parent status at creation: no active child and no planned child selected.
- Latest stable base before this brief: clean synced `main@af277c01` after PR `#1087` (`8850c52b`) and closeout PR `#1088` (`af277c01`).
- Next product planning action after this governance slice: reopen the workout commercial analytics parent, re-audit current base, and propose one bounded child before any checkout completion, entitlement, provider/webhook, support diagnostics, dashboard, direct checkout, Stripe, finance, export, vendor, raw drilldown, migration, RLS, pricing, route, shop, builder, generator, habits, or session-step runtime work.

Resume prompt after this brief is done or deferred:

```text
Fortsett i /Users/stianvikra/freeswimming. Folg AGENTS.md.

Status:
- main er ren og synket etter Codex Local Automation Friction + Visual Capture Defaults governance-slicen.
- Reopen parent: docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md
- Ingen aktiv/planned workout commercial analytics child er valgt med mindre parent sier noe annet.

Start med:
1. git status -sb
2. git log --oneline -n 10
3. reopen parent brief
4. bli i planmodus og foresla neste bounded child; ikke implementer uten eksplisitt godkjenning.
```

## Checkpoint Log

- `2026-06-11 | in-progress | owner approved creating and executing the local automation friction governance slice in this chat; started from clean main@af277c01 on branch codex-local-automation-friction-visual-capture-defaults; audited AGENTS, scorecard, sandbox approval cadence, UI debug, PR flow, high-cost log, skill/stack radar, and historical done-brief evidence | next: implement docs-only runbook updates and run brief lint`
- `2026-06-11 | implementation | added local automation friction runbook and linked it from AGENTS, sandbox approval cadence, UI debug, PR flow, skill/stack radar, and high-cost debug log; git diff --check passed; npm run lint:briefs skipped because the new in-progress brief was untracked; npm run lint:briefs:all passed for all briefs; targeted rg sweep confirmed the new canonical runbook references | next: run docs-only verification and pre-PR gate`
- `2026-06-11 | docs-only validation | npm run verify:docs-only passed on docs-only lane with log artifacts/test-runs/20260611-221831/verify.log; quality-gate marked human sufficiency review for docs-governance categories and the active brief evidence covers those categories for this scope | next: commit, run npm run verify:pre-pr on committed branch, push, and open PR`
- `2026-06-11 | audit expansion | owner asked whether similar issues should be audited and included; added a narrow task-brief-template prompt reminder so future briefs consider local automation friction defaults when screenshot/browser/CI/sandbox/process-cleanup/generated-artifact friction is likely, without expanding into product/runtime scope | next: amend commit and rerun pre-PR gate`
- `2026-06-11 | pre-pr validation | npm run verify:pre-pr passed on docs-only lane for branch current with origin/main@af277c01; log artifacts/test-runs/20260611-221941/verify.log; changed files remain docs/governance only | next: final amend, rerun pre-PR on final HEAD, push, open PR, monitor CI, then run npm run verify:pre-merge`
