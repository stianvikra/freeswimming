# Task Brief: UI Debug Hypothesis, Bug Log, And Session Handoff Governance (10/10)

## Metadata

- `id`: `2026-04-22-ui-debug-hypothesis-bug-log-and-session-handoff-governance-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-22`
- `updated`: `2026-04-22`

## Goal

Make future UI/debugging work faster and safer by adding a repeatable hypothesis-driven debugging protocol, a reusable high-cost bug log, and a session handoff rule used whenever a new chat is the best working mode.

## Sequencing Lock

- This is a docs/governance slice created before returning to the remaining product findings and maintenance baseline.
- Do not expand into dependency modernization, runtime implementation, or broad process redesign.
- Keep the output directly actionable for future Codex sessions and owner review.

## Why This Brief Exists

- The poolside Save image crop issue consumed several correction loops because preview evidence was treated as enough while the actual exported PNG still failed.
- Future visual/export bugs need a ranked hypothesis loop before more patching.
- Expensive bug patterns should be logged so the same failure class is checked first later.
- New-chat handoff should happen when it is the best way to preserve momentum and reduce risk, not only after the current context is already too heavy.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Repo docs clearly define when to use hypothesis debugging, bug logging, and new-chat handoff.                                       | AGENTS/runbook/template diff                  | `5/5`                   |
| UX flow clarity                               | `target`     | Future visual review flow is explicit: implement, artifact evidence, owner approval, gates, PR, merge readiness.                    | AGENTS and task template review               | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: visual quality improves through artifact naming and review discipline, with no UI changes in this slice.           | runbook review                                | `4/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this docs-only governance slice changes no runtime state transitions, persisted data, or domain logic.                  | explicit scope rationale                      | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor flow, labels, or publishing workflow changes.                                                           | explicit scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future UI debugging guidance encourages artifact-level checks but this slice changes no accessible UI.             | runbook review                                | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime payload changes; process should reduce wasted debugging time for future visual bugs.                    | docs-only diff review                         | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no app data, browser storage, server persistence, sync, or cache state changes.                                         | explicit scope rationale                      | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cached read path, revalidation trigger, or browser cache contract changes.                                           | explicit scope rationale                      | `N/A`                   |
| Reliability and failure handling              | `target`     | Runbook requires ranked causes, deterministic probes, actual-artifact validation, and no fixed claim without direct proof.          | runbook + AGENTS review                       | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: docs reiterate no secrets and no raw env values are logged; no auth path changes.                                  | security scope review                         | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: bug logs must avoid secrets and raw private data while preserving reusable symptom/root-cause detail.              | high-cost log format review                   | `4/5`                   |
| Content governance                            | `target`     | New runbooks and template establish source-of-truth locations for debugging protocol, bug log, and handoff prompt.                  | docs diff review                              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no role-gated admin mutation or operational edit workflow changes.                                                      | explicit scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, robots, canonical, or crawlable page content changes.                                | explicit scope rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public structured data, semantic public page, or AI-discoverable content changes.                                    | explicit scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: high-cost bug log creates qualitative observability for repeated debugging failures, not product analytics.        | high-cost log entry                           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no entitlement, pricing, checkout, invoice, or revenue workflow changes.                                                | explicit scope rationale                      | `N/A`                   |
| Incident response and support operations      | `target`     | High-cost debugging log and UI-debug runbook provide reusable support diagnostics for repeated visual/export failures.              | runbook + seeded log entry                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only slice changes no financial reporting, reconciliation, payouts, refunds, or billing data.                 | explicit scope rationale tied to docs scope   | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, copy extraction, or public metadata architecture changes.                         | explicit scope rationale tied to docs scope   | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Solution uses repo docs/runbooks only and adds no dependency, script, or workflow complexity unless explicitly justified.           | dependency diff review                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief and docs pass brief lint and docs-only verify gates; future UI tasks get artifact/probe requirements in the template. | `lint:briefs`, `lint:briefs:all`, verify gate | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: process reduces repeated debugging cost without new runtime or infrastructure cost.                                | docs-only diff review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes are reversible docs-only governance updates with a clear pre-PR/pre-merge validation lane.                                  | git diff and verify gates                     | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - `N/A`; no runtime or server data changes.
- Local data:
  - documentation and runbook files in the repository.
- Sync policy:
  - repository git history is the source of truth.
- Retention and sensitivity:
  - high-cost bug log must not include secrets, raw env values, tokens, or sensitive private user data.
- Cache/invalidation:
  - `N/A`; no app cache or data cache behavior changes.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice introduces no persisted app entities, route params, slugs, titles, aliases, or renameable user/admin objects.

## Scope

- Update `AGENTS.md` with:
  - UI debugging/high-cost bug protocol,
  - session handoff timing when a new chat is best.
- Add or update runbooks:
  - `docs/runbooks/ui-debug-hypothesis-and-handoff.md`,
  - `docs/runbooks/high-cost-debug-log.md`,
  - `docs/runbooks/pr-flow-and-chat-handoff.md`.
- Update `docs/task-brief-template.md` so future briefs can require the protocol.
- Seed the high-cost bug log with the poolside Save image crop incident.

## Out Of Scope

- Runtime code changes.
- Test implementation changes.
- Dependency/tooling modernization.
- Maintenance baseline execution.
- Product decisions for remaining owner findings.

## Acceptance Criteria

1. Future agents have one canonical runbook for ranked UI-debug hypotheses and artifact-level proof.
2. High-cost bug log exists and includes the poolside Save image crop failure with symptom, cause, fix pattern, probe, and prevention.
3. `AGENTS.md` tells agents to use the runbook and bug log for repeated visual/export failures.
4. New-chat handoff rule says to use it when it is the best working mode, not only when context is heavy.
5. Task brief template prompts future briefs to include debugging and handoff contracts when relevant.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- `N/A`
- Rationale: docs-only governance update, no browser UI or runtime route changes.

## Help/Guide Impact

- `N/A`
- Rationale: changes internal agent/runbook guidance only, not user-facing Help/Guide copy.

## Risk And Rollback

- Main risk:
  - guidance becomes too heavy and slows simple tasks.
- Mitigation:
  - protocol is scoped to repeated/high-risk UI/export failures, while normal simple fixes keep automation-first flow.
- Rollback:
  - revert this docs-only PR.

## Closeout Evidence

- Shipped in PR #500:
  - `https://github.com/stianvikra/freeswimming/pull/500`
- Merged to `main` as squash commit `c39cb8f`.
- Implementation summary:
  - added `docs/runbooks/ui-debug-hypothesis-and-handoff.md` as the canonical ranked-hypothesis UI/debug runbook,
  - added `docs/runbooks/high-cost-debug-log.md` and seeded the poolside Save image crop incident,
  - updated `AGENTS.md` so repeated visual/export failures must switch to hypothesis/probe/debug-log mode,
  - updated `docs/runbooks/pr-flow-and-chat-handoff.md` so new-chat handoff happens when it is the best working mode, not only when context is heavy,
  - updated `docs/task-brief-template.md` so future briefs can require visual artifact, high-cost debug, and handoff contracts.
- Validation:
  - `npm run lint:briefs:all` PASS.
  - `npm run verify:pre-pr` PASS docs-only lane.
  - GitHub PR #500 checks PASS.
  - `npm run verify:pre-merge` PASS docs-only lane.
  - `npm run post-merge:preflight` PASS and identified this brief for closeout.
- Remaining gaps:
  - none for this governance slice.

## Closeout Score Outcome

| Target Category                          | Score | Evidence                                                                                                              |
| ---------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                     | `5/5` | AGENTS, runbook, task-template, and brief all point to one clear protocol.                                            |
| UX flow clarity                          | `5/5` | Visual flow now explicitly requires artifact handoff and owner approval before gates.                                 |
| Reliability and failure handling         | `5/5` | Ranked hypotheses, deterministic probes, and actual-artifact validation are required for repeated UI/export failures. |
| Content governance                       | `5/5` | Source-of-truth docs are established for debug protocol, bug log, and handoff prompt.                                 |
| Incident response and support operations | `5/5` | High-cost debug log captures reusable symptom/root-cause/fix/probe/prevention data.                                   |
| Stack-fit and dependency discipline      | `5/5` | Docs-only solution, no new dependencies, scripts, runtime behavior, or workflow complexity.                           |
| Testing and QA automation                | `5/5` | Brief lint, docs-only pre-PR, CI, and docs-only pre-merge gates passed.                                               |
| DevOps and rollback readiness            | `5/5` | Docs-only PR is reversible and has clean PR/CI/merge-gate evidence.                                                   |

## Checkpoint Log

- `2026-04-22 | merged + closeout | PR #500 merged to main as squash commit c39cb8f; UI debug hypothesis runbook, high-cost debug log, session handoff rule, AGENTS guidance, and task-template hooks are now live; validation passed through lint:briefs:all, verify:pre-pr, GitHub CI, verify:pre-merge, and post-merge:preflight | next: none`
- `2026-04-22 | validation | added AGENTS rule, UI-debug runbook, high-cost bug log, handoff runbook update, task brief template hooks, and seeded poolside Save image incident; npm run lint:briefs:all passed; npm run verify:pre-pr passed docs-only lane | next: commit, push, open PR`
- `2026-04-22 | in-progress | created docs/governance branch and scoped UI-debug hypothesis, high-cost bug log, and session handoff guidance | next: run lint/verify gates and open PR`
