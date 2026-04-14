# Task Brief: Global PR Merge Discipline And Post-Merge Preflight (10/10)

## Metadata

- `id`: `2026-04-14-global-pr-merge-discipline-and-post-merge-preflight-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-14`
- `updated`: `2026-04-14`

## Goal

Make merge handoff and immediate post-merge cleanup deterministic enough that current-HEAD merge evidence, brief closeout follow-through, and local branch hygiene stop drifting apart.

## Why This Brief Exists

- Current merge guidance is spread across PR body generation, release checklist text, and post-merge runbooks.
- The repo already enforces current-HEAD `verify:pre-merge`, but there is no explicit merge-preflight summary that fails fast when merge evidence is missing or local tracked drift remains.
- Post-merge branch/brief cleanup is documented, but it is still easy to leave a merged brief in `in-progress/` or skip the immediate local sync.
- The fix should reduce stale PR/closeout misses without changing runtime product behavior.

## Dependencies And Boundaries

- Current merge gate scripts and PR guidance:
  - `/Users/stianvikra/freeswimming/scripts/run-pre-merge-gate.sh`
  - `/Users/stianvikra/freeswimming/scripts/generate-pr-body.mjs`
  - `/Users/stianvikra/freeswimming/docs/checklists/release-pr-checklist.md`
  - `/Users/stianvikra/freeswimming/docs/runbooks/post-merge-local-sync.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/README.md`
- Current pre-merge marker path:
  - `/Users/stianvikra/freeswimming/artifacts/verify-pre-merge/latest.json`
- Relevant tests:
  - `/Users/stianvikra/freeswimming/tests/unit/`
- Out of scope:
  - verification-lane performance/reuse changes,
  - product/runtime behavior,
  - CI required-check renames,
  - automatic merge execution.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Content governance`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                  | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Merge-ready handoff and post-merge cleanup use one repo-native workflow with exact next commands instead of scattered reminders.                    | script output + checklist/runbook review  | `5/5`                   |
| UX flow clarity                               | `target`     | `gate:pre-merge` ends with a clear current-HEAD readiness summary, and post-merge preflight prints the exact closeout/sync actions.                 | terminal output review + unit tests       | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes repo tooling/docs only, not a visual product surface.                                                                | explicit scope rationale                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Merge preflight fails closed when current-HEAD pre-merge evidence is missing/stale or tracked file drift remains after the gate.                    | unit tests + local gate runs              | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing/runtime UI changes.                                                                                                    | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no changed interactive runtime surface exists beyond terminal/log output.                                                               | explicit scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because the slice does not change route payloads or runtime performance behavior.                                                               | explicit scope rationale                  | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Merge and post-merge scripts derive readiness from local git/marker state only and do not invent a second source of truth.                          | script review + unit tests                | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache or invalidation behavior changes.                                                                                      | explicit scope rationale                  | `N/A`                   |
| Reliability and failure handling              | `target`     | Post-merge preflight detects merged in-progress briefs from the latest main commit and prints exact closeout commands instead of relying on memory. | unit tests + local CLI review             | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, permission, or protected-route behavior changes.                                                                               | explicit scope rationale                  | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user-data handling or compliance workflow changes.                                                                                   | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | Brief lifecycle follow-through is mechanically surfaced so merged briefs are less likely to remain stale in `in-progress/`.                         | post-merge preflight output + docs review | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator product workflow changes.                                                                                             | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route/indexing behavior changes.                                                                                              | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic/canonical content changes.                                                                                           | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: merge/post-merge state becomes easier to audit through deterministic local CLI output and existing PR evidence.                    | CLI output review                         | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing/commercial workflow changes.                                                                                                 | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes repo delivery workflow only; it does not alter production support/on-call procedures.                                | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow changes.                                                                                               | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale/translation workflow changes.                                                                                                 | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The improvement reuses repo-native Node/shell tooling and adds no dependency.                                                                       | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Automated coverage protects merge-preflight failure rules and post-merge closeout detection.                                                        | new unit tests + local verify             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: clearer preflight/closeout automation reduces repeated manual recovery work without changing release-gate coverage.                | workflow review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The slice is narrow, reversible, and improves merge/cleanup safety without renaming existing gate commands.                                         | diff review + local gate evidence         | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - GitHub PR status/checks remain canonical for merge readiness.
- Local-only:
  - current branch name,
  - current HEAD SHA,
  - local pre-merge marker JSON,
  - latest synced main commit inspected by post-merge preflight.
- Sync policy:
  - merge preflight evaluates current local state after `verify:pre-merge` and PR-body refresh,
  - post-merge preflight evaluates the latest local main commit after pull/sync,
  - if evidence is missing or ambiguous, scripts fail closed or emit explicit follow-up commands.
- Cache/invalidation:
  - no new cache layer; scripts read fresh git state and the latest pre-merge marker on each run.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice changes repo workflow only, not persisted route/entity identifiers.

## Scope

- Add a repo-native merge preflight command that summarizes current-HEAD merge readiness and fails closed on stale/missing local merge evidence.
- Add a repo-native post-merge preflight command that inspects the latest synced main commit and surfaces pending brief-closeout/local-sync follow-up commands.
- Wire the merge preflight into `npm run gate:pre-merge`.
- Update repo docs/checklists/runbooks so merge and post-merge flows reference the new commands.
- Add focused unit coverage for both preflight helpers.

## Out Of Scope

- Changing verify lane selection or reusing previous verify runs.
- Product/admin/runtime behavior.
- Automatic brief moves or automatic branch deletion.
- GitHub merge execution.

## Acceptance Criteria

1. `npm run gate:pre-merge` ends with an explicit merge-preflight summary and fails if the current HEAD lacks a matching PASS pre-merge marker or tracked file drift remains.
2. The repo exposes a post-merge preflight command that, on synced `main`, detects just-merged `in-progress` briefs from the latest commit and prints the exact `task-brief:move ... done` follow-up when needed.
3. Release checklist/runbook/docs describe when to run both preflight commands.
4. New unit tests cover success and failure paths for merge preflight plus pending-closeout detection for post-merge preflight.
5. Local `npm run verify:pre-pr` and `npm run verify:pre-merge` pass on this slice.

## Validation

- `npx vitest run tests/unit/merge-preflight.test.ts`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Constraints

- Keep the change narrow and repo-native.
- Fail closed on ambiguous merge readiness.
- Do not weaken required test/verify coverage or rename existing operator commands.

## Help/Guide Impact

- `N/A` for product/admin Help/Guide.
- Repo operator docs/checklists/runbooks are in scope and must be updated in the same PR.

## Checkpoint Log

- `2026-04-14 | in-progress | opened a dedicated tooling/governance slice to tighten current-HEAD merge discipline and make post-merge brief/local-sync follow-through explicit, with verification-lane performance work intentionally kept out of scope for a separate follow-up brief | next: implement merge/post-merge preflight helpers, add unit coverage, and run full repo gates before PR handoff`
