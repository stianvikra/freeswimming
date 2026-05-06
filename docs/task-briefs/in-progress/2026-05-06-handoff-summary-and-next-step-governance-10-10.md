# Task Brief: Handoff Summary And Next Step Governance (10/10)

## Metadata

- `id`: `2026-05-06-handoff-summary-and-next-step-governance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-06`
- `updated`: `2026-05-06`

## Goal

Make every completed workstream end with a plain-language done summary and one explicit recommended next step, enforced through the same final handoff, PR body, and lint path.

## Why This Brief Exists

Recent delivery handoffs have included strong technical evidence, but the owner feedback is that the final summary is too code-focused and does not always make it easy for a non-programmer to understand what actually changed.

The repo also has partial "next step" discipline in `AGENTS.md`, chat-handoff guidance, and checkpoint logs, but it is not yet hard-required in final handoff, PR body generation, or lint.

This slice should make the closeout answer useful in two layers:

- a short human summary: what changed and why it matters, without requiring programming knowledge,
- an operator summary: validation, PR/CI status, risk, rollback, and the single recommended next step.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Content governance`
- `Incident response and support operations`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                           | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Final handoff must state what changed, who benefits, and the recommended next step in owner-readable language.                               | AGENTS/runbook update + PR body fixture         | `5/5`                   |
| UX flow clarity                               | `target`     | Handoff format must avoid burying the next action; one recommended next step appears as a distinct required field.                           | lint fixture + generated PR body review         | `5/5`                   |
| Visual design quality                         | `N/A`        | No product UI, layout, screenshot, or brand surface is changed by this governance/tooling slice.                                             | explicit scope rationale                        | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Any lint or generator change must deterministically require the new fields without false positives on valid docs-only closeouts.             | script tests + lint fixtures                    | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin workstream handoffs should become easier to scan, but no admin runtime editor workflow changes.                       | sample admin PR/handoff fixture                 | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: plain-language summaries improve accessibility of process information; no runtime a11y surface changes.                     | content review                                  | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime payload changes; tooling must not materially slow the docs-only verification lane.                               | command runtime observation                     | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | No user data, browser storage, server persistence, sync, or cache boundary changes are in scope.                                             | explicit non-stateful scope rationale           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | No runtime read/write path or cache behavior changes are in scope.                                                                           | explicit cache scope rationale                  | `N/A`                   |
| Reliability and failure handling              | `target`     | Lint/generator failures must explain exactly which handoff field is missing and how to fix it.                                               | negative-path lint tests                        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no authz surface changes; handoff rules must still avoid leaking secrets or raw env values.                                 | no-secret/privacy wording review                | `4/5`                   |
| Privacy and compliance                        | `target`     | Plain-language summaries must not include raw secrets, private customer text, payment details, or sensitive env values.                      | PR-body/runbook wording + lint guidance         | `5/5`                   |
| Content governance                            | `target`     | Required handoff fields must live in canonical docs/runbooks and, if automated, in the canonical PR-body/lint path.                          | docs diff + generated PR body lint              | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin workstream summaries should call out operator-visible changes; no admin workflow changes in this slice.               | sample admin summary                            | `4/5`                   |
| SEO and crawlability                          | `N/A`        | No public routes, metadata, sitemap, robots, or crawlable content changes are in scope.                                                      | explicit public-surface scope rationale         | `N/A`                   |
| AI discoverability                            | `N/A`        | No public AI-discoverable content or structured entity output changes are in scope.                                                          | explicit AI-discoverability scope rationale     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no product analytics changes; handoff can mention KPI/event changes when future slices touch them.                          | handoff template review                         | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | No Stripe, entitlement, pricing, checkout, billing, or revenue workflow changes are in scope.                                                | explicit commerce scope rationale               | `N/A`                   |
| Incident response and support operations      | `target`     | Closeout must make support-relevant changes, risks, rollback, and recommended next step easy to identify.                                    | runbook update + closeout fixture               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | No finance/reporting behavior changes are in scope; future finance slices must still summarize reconciliation impact in plain language.      | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | Handoff guidance must honor the chat language preference and avoid code-only jargon that blocks later Norwegian/English owner communication. | AGENTS/runbook wording review                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing docs, PR body generator, lint scripts, and Node tooling; add no dependency unless there is a measured need.                   | package diff + script review                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused tests for PR body/lint behavior; docs-only and full-lane gates must remain passable.                                   | targeted tests + `verify:pre-pr`                | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: additional checks must stay cheap and deterministic for frequent closeout work.                                             | runtime observation + no new service dependency | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Handoff must preserve merge/closeout order, rollback note, branch status, and chat-handoff decision without relying on memory.               | runbook + generated PR body/closeout lint       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Documentation:
  - update the narrowest canonical guidance, likely `AGENTS.md` and `docs/runbooks/pr-flow-and-chat-handoff.md`,
  - keep the rule short enough that final handoffs remain readable.
- PR body and lint:
  - inspect the existing PR body generator and generated PR-body lint before adding new fields,
  - prefer structured required sections over ad hoc string matching.
- TypeScript/Node tooling:
  - reuse existing repo-local Node scripts and tests,
  - add no dependency for formatting or parsing unless the current parser cannot express the rule safely.
- Testing:
  - add fixture coverage for a valid handoff, a missing plain-language summary, and a missing recommended next step.

## Data Placement And Sync Contract

N/A because this governance slice does not add user-facing state, storage, database writes, browser persistence, or sync behavior.

## Identity And Rename Contract

N/A because this slice does not create persisted product entities, route params, slugs, admin identifiers, or user-visible entity names.

## Scope

- Final handoff guidance for completed implementation and docs-only closeout work.
- Required plain-language done summary in owner-readable language.
- Required single recommended next step.
- PR body generation and lint enforcement if the existing generator/lint path can support it cleanly.
- Tests/fixtures for the new enforcement.

## Out Of Scope

- Product UI changes.
- New analytics, billing, admin, auth, or data-storage behavior.
- Rewriting all existing historical PR bodies or old done briefs.
- Broad process redesign beyond the closeout/handoff fields.

## Acceptance Criteria

1. Final handoff guidance requires a short, non-programmer-readable "what changed and why it matters" summary.
2. Final handoff guidance requires exactly one recommended next step or an explicit "no next step" rationale.
3. Generated PR body or closeout lint enforces the new fields where automation has a reliable source of truth.
4. Missing-field failures point to the exact section and expected wording.
5. Docs-only and full verification lanes still pass.

## Validation

- `npm run lint:briefs`
- targeted PR body/lint tests for changed scripts
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Route/Label/Support-Surface Impact Sweep Evidence

- Runbook: `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- Identifiers searched: `Plain-language done summary`, `Recommended next step`, `PR handoff must include`, `Handoff must include`, `Closeout Summary Contract`, `final handoff`, `merge readiness`, `next recommended step`, `recommended next`, `What changed and why`, `User-visible changes`, `Technical changes`, `Policy impact`, `Owner Merge Step`, `Post-Merge Local Sync`.
- Surfaces checked: `AGENTS.md`, `.github/`, `docs/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/task-briefs/done/`, `scripts/`, `tests/`, `app/`, and `components/`.
- Fallout handled in this PR: PR template, generated PR body, PR-body lint, PR-body unit fixtures, AGENTS final/PR handoff contract, canonical PR/chat handoff runbook, task brief template, and this active brief.
- Intentional leftovers: historical `done` briefs remain unchanged; `components/my-library/training/TrainingContextHub.tsx` uses "recommended next step" as product goal-note copy, not PR/handoff governance.

## Checkpoint Log

- `2026-05-06 | planned | captured owner feedback from PR #617 closeout: final summaries should include a plain-language explanation of what changed, and the existing "next recommended step" discipline should become hard-required in final handoff/PR body/lint | next: execute as a small governance/tooling slice before the next long feature workstream`
- `2026-05-06 | working tree | moved brief to in-progress on branch governance/handoff-summary-next-step; added PR-body generator/lint enforcement for plain-language done summary and a single recommended next step, plus canonical AGENTS/runbook/template guidance and focused unit coverage | next: run targeted PR-body tests, lint:briefs, generated PR-body lint, then verify:pre-pr`
- `2026-05-06 | working tree | targeted PR-body Vitest passed (25 tests), generated PR-body lint passed, lint:briefs:all passed, ESLint passed, typecheck passed, and git diff --check passed | next: checkpoint commit, run npm run verify:pre-pr on committed HEAD, then push/open PR`
- `2026-05-06 | 9d2c2e3 | first verify:pre-pr failed in quality-gate evidence because the support-surface sweep was not recorded; ran docs/runbooks/route-label-support-surface-impact-sweep.md identifiers across AGENTS, .github, docs, task briefs, scripts, tests, app, and components; product TrainingContextHub matches are intentional runtime copy and not handoff-governance fallout | next: amend checkpoint with sweep evidence and rerun npm run verify:pre-pr`
- `2026-05-06 | 8048a1b | npm run verify:pre-pr passed full lane: branch-current, lint:briefs, quality-gate, admin/env/PR-body lint, ESLint, typecheck, 919 unit tests, build, perf budgets, and Playwright 82 passed / 374 skipped; perf trend recommended tighten after 4 green weekly runs, decision is hold for this governance/tooling slice because it does not alter public runtime budget routes | next: amend checkpoint, push branch, open PR, monitor CI, then run npm run verify:pre-merge`
