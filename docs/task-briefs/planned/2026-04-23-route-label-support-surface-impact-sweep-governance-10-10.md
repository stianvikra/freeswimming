# Task Brief: Route, Label, And Support-Surface Impact Sweep Governance (10/10)

## Metadata

- `id`: `2026-04-23-route-label-support-surface-impact-sweep-governance-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-23`
- `updated`: `2026-04-23`

## Goal

Prevent late-cycle regressions when routes, labels, or support surfaces are removed, renamed, or consolidated by making impact sweeps a required part of the repo workflow, with optional low-risk script support if the slice stays small and maintainable.

## Sequencing Lock

- This is a narrow governance/tooling follow-up to the merged docs slice [2026-04-22-ui-debug-hypothesis-bug-log-and-session-handoff-governance-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-22-ui-debug-hypothesis-bug-log-and-session-handoff-governance-10-10.md).
- It should not be expanded into broad tooling modernization, dependency refresh, or CI redesign.
- Preferred sequencing:
  - after the current active product PR is settled,
  - before or alongside future maintenance/governance slices,
  - not as hidden scope inside an unrelated product brief.

## Why This Brief Exists

- Several recent product slices lost time because removed or renamed routes/labels were fixed in product code first, but supporting tests, docs, runbooks, and task briefs were only corrected after broader gates failed.
- That is the wrong discovery order:
  - the impact should be mapped first,
  - contract updates should land in the same commit as the product change,
  - broad gates should confirm the work, not discover obvious fallout late.
- The repo already has better UI-debug and handoff governance; this brief closes the adjacent gap for route/label/support-surface impact sweeps.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Content governance`
- `Testing and QA automation`
- `Stack-fit and dependency discipline`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                  | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Repo workflow makes route/label/support-surface impact checking explicit enough that future slices stop rediscovering the same fallout late.    | AGENTS/template/runbook diff            | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: the operator/agent workflow should be simpler and more predictable, but this slice changes no user-facing UI.                  | guidance review                         | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice adds no user-facing visual changes.                                                                                      | explicit scope rationale                | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: impact sweeps should reduce accidental route/label drift, but no runtime domain logic changes directly in this slice.          | scope review                            | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor UI or workflow is directly changed here.                                                                            | explicit scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice changes internal workflow guidance only, not accessible UI behavior.                                                     | explicit scope rationale                | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this slice adds no runtime payload or route-performance changes.                                                                    | explicit scope rationale                | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this governance/tooling slice introduces no new app state, local cache, or server sync contract.                                    | explicit scope rationale                | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache or invalidation behavior is changed.                                                                                       | explicit scope rationale                | `N/A`                   |
| Reliability and failure handling              | `target`     | Future route/label removals and renames must require a ranked impact sweep before the first full gate, reducing late deterministic failures.    | AGENTS/template/runbook diff + examples | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: renamed auth/account/help surfaces must not silently leave stale docs/tests or broken recovery paths behind.                   | sweep contract coverage                 | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no data retention, consent, or privacy behavior changes.                                                                            | explicit scope rationale                | `N/A`                   |
| Content governance                            | `target`     | One canonical rule set defines where impact sweeps must look: code, tests, docs, runbooks, Help/Guide assertions, and active task briefs.       | source-of-truth docs review             | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no live admin CRUD/edit workflow changes are introduced.                                                                            | explicit scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes no public metadata, sitemap, or crawlable route behavior directly.                                               | explicit scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-discoverable content or structured data.                                                            | explicit scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice adds no product analytics instrumentation.                                                                               | explicit scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, billing, or entitlement flow.                                                              | explicit scope rationale                | `N/A`                   |
| Incident response and support operations      | `target`     | Route/label/support-surface impact sweeps must include support/runbook fallout so recovery paths and operator guidance stay current.            | runbook/template/AGENTS review          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow changes are involved.                                                                              | explicit scope rationale                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation workflow, or multilingual content contract changes are made here.                                    | explicit scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Core solution should be docs/rule-first and script-light; any optional script support must use repo-native tooling and add no unnecessary deps. | diff review + package review            | `5/5`                   |
| Testing and QA automation                     | `target`     | The repo rules explicitly require same-commit test-contract updates and position full `verify:pre-merge` as confirmation, not discovery.        | AGENTS/template/runbook diff            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: process should reduce wasted reruns and repeated regression triage without adding heavy tooling maintenance.                   | governance review                       | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: any script addition should be easily reversible and must not become a brittle new gate without proven value.                   | narrow diff + rollback review           | `4/5`                   |

## Data Placement And Sync Contract

- `N/A`
- Rationale: this is a governance/tooling slice with no new runtime or persisted product state.

## Identity And Rename Contract

- This brief exists to protect identity and rename safety in other slices.
- This brief itself introduces no new persisted product entity, route param, slug, or renameable record.

## Scope

### Required

- Add an explicit `route/label/support-surface impact sweep` rule to the canonical workflow docs, including:
  - when the sweep is required,
  - which directories/surfaces must be checked,
  - what must be updated in the same commit as the product change.
- Make the rule cover at least:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - active and planned task briefs
  - Help/Guide assertions when relevant
- State that for removed/renamed routes, labels, and support surfaces:
  - targeted `rg` sweep happens before the first broad gate,
  - test contracts are updated in the same commit as the product change,
  - `verify:pre-merge` is a final confirmation layer, not the primary discovery mechanism.

### Optional If Low-Risk

- Add a simple repo-native helper such as:
  - `npm run lint:impact-sweep`
  - or a lightweight checklist/search helper script
- Guardrails for optional script support:
  - no new dependency unless strongly justified,
  - no fragile “smart” parser that becomes higher-maintenance than the problem,
  - fail closed into manual guidance when the script cannot determine intent safely,
  - if the script makes the slice meaningfully larger, defer it and still ship the manual rule set.

## Out Of Scope

- Broad CI pipeline redesign
- Dependency/tooling modernization backlog
- General-purpose static analysis framework
- Runtime product changes
- Rewriting all historical briefs/runbooks for old terminology unless needed as part of canonical source-of-truth updates

## Acceptance Criteria

1. The repo has one explicit impact-sweep rule for removed/renamed routes, labels, and support surfaces.
2. The rule says exactly where to look before broad verification: code, tests, docs, runbooks, Help/Guide assertions, and relevant task briefs.
3. The rule requires same-commit updates for product change + test/docs/runbook fallout where relevant.
4. The workflow guidance explicitly says full `verify:pre-pr` / `verify:pre-merge` should confirm the slice, not be the first place obvious fallout is discovered.
5. Optional script support is either:
   - shipped as a narrow low-risk helper with no unnecessary dependency cost, or
   - explicitly deferred in closeout with rationale.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

For an implementation PR that includes optional script support:

- add targeted tests for the helper if the repo already has a suitable low-cost place for them,
- ensure the helper works on representative route/label rename cases without noisy false positives.

## Constraints

- Manual governance rule is the minimum acceptable outcome; do not block the slice on script support.
- Prefer `rg`-first, repo-native, low-magic solutions over clever tooling.
- Keep the script optional unless it proves clearly maintainable and low-noise.
- Do not create a second overlapping source of truth; AGENTS, template, and runbook must align.

## 10/10 Quality Bar

- The cheapest correct action should become the default:
  - sweep first,
  - patch code/tests/docs together,
  - then run broad gates.
- The repo should stop paying repeated time cost for predictable rename/remove fallout.
- Optional script support is only worth shipping if it stays boring, transparent, and easy to trust.

## Checkpoint Log

- `2026-04-23 | planned | created as the explicit follow-up for route/label/support-surface impact-sweep governance after the broader UI-debug/handoff slice landed; direction locked: ship the manual repo rule first and treat any helper script as optional only if the diff stays low-risk and low-maintenance | next: decide execution timing relative to the current active product PR, then implement the governance updates and defer or include a tiny helper based on final scope size`
