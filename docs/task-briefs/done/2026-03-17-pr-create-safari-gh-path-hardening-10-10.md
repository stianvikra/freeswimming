# Task Brief: PR Create Safari `gh` Path Hardening (10/10)

## Metadata

- `id`: `2026-03-17-pr-create-safari-gh-path-hardening-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-17`
- `updated`: `2026-03-17`

## Goal

Make `npm run pr:create:safari` reliably create/open the real GitHub PR in Safari on macOS when `gh` is installed via Homebrew but not present on the script PATH, while preserving a clear fallback when `gh` is genuinely unavailable or unauthenticated.

## Why This Brief Exists

- We hit a real workflow problem:
  - `gh` was installed and authenticated,
  - but `scripts/pr-create-safari.sh` did not find it in the script PATH,
  - so the script fell back to Safari compare/new-PR URL instead of opening the actual PR.
- That fallback is useful when `gh` is genuinely unavailable, but it is the wrong primary behavior when a healthy `gh` exists in common macOS install paths.
- This is dev-tooling friction, not product/admin UX, so it should stay a separate small slice.

## Dependencies And Boundaries

- Existing tooling and governance:
  - `scripts/pr-create-safari.sh`
  - `scripts/open-pr-safari.sh`
  - `package.json` (`pr:create:safari`)
  - `docs/task-brief-template.md`
  - `docs/task-briefs/done/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md`
- Scope is limited to local PR-create/open workflow hardening and any directly related docs/tests.
- No app product behavior, admin UX, or public route behavior should change.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - GitHub remains canonical for PR existence and PR URL/number.
- Local-only:
  - local branch detection,
  - local CLI executable discovery (`PATH` + known Homebrew locations),
  - transient generated PR body file path.
- Sync policy:
  - script should prefer canonical GitHub PR lookup/create when a healthy `gh` is discoverable,
  - fallback compare/new URL is only a navigation fallback, not proof that a PR already exists.
- Cache/invalidation:
  - none beyond normal GitHub CLI/API reads; this slice does not add local caching.

## Identity And Rename Contract (Required)

- Canonical stable ID:
  - GitHub PR URL/number is the canonical identity for an opened PR.
- Human-readable identifiers:
  - branch name is a local locator used to look up or create the PR,
  - Safari compare/new URL is a fallback navigation artifact, not canonical PR identity.
- Mutability rules:
  - the script may look up by current branch but should not treat a fallback URL as an existing PR.
- Rename vs repurpose policy:
  - if branch changes, script should resolve/create against the current branch only; no hidden carry-over from a previous branch.
- Compatibility contract:
  - if `gh` is genuinely missing or unauthenticated, keep the current Safari fallback path.
- Observability and repair:
  - script output should say whether it used:
    - existing PR via `gh`,
    - newly created PR via `gh`,
    - or fallback Safari compare/new URL because `gh` was unavailable/unhealthy.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                           | Evidence                               |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Product goals and IA                          | `target`     | One command reliably opens the real PR in Safari when a healthy `gh` is available.                       | local script QA + command evidence     |
| UX flow clarity                               | `target`     | Script output clearly explains whether it created/opened a PR or fell back, and why.                     | command output review + tests          |
| Visual design quality                         | `N/A`        | N/A for CLI/dev-tooling slice; no user-facing visual surface changes.                                    | scope boundary review                  |
| Business logic correctness and data integrity | `target`     | Script distinguishes canonical PR URL from compare/new fallback and does not silently choose wrong mode. | script tests + manual branch/PR checks |
| Admin editor ergonomics                       | `N/A`        | N/A for repo-tooling slice; no admin/editor product workflow UI changes.                                 | scope boundary review                  |
| Accessibility (a11y)                          | `N/A`        | N/A for CLI/dev-tooling slice; no changed interactive UI surface beyond terminal output.                 | scope boundary review                  |
| Performance (CWV + payloads)                  | `N/A`        | N/A for local tooling slice; no route or payload impact.                                                 | scope boundary review                  |
| Data placement and sync boundaries            | `target`     | Local executable detection and GitHub canonical PR lookup/create rules are explicit and deterministic.   | code review + tests                    |
| Caching and invalidation strategy             | `N/A`        | N/A for ephemeral local script execution; no cache layer is introduced.                                  | scope boundary review                  |
| Reliability and failure handling              | `target`     | Common macOS/Homebrew `gh` installs work without manual PATH edits; genuine failure falls back clearly.  | manual QA + script tests               |
| Security and authz                            | `target`     | No token leakage; script respects `gh auth status` and does not bypass GitHub auth rules.                | code review + negative-path tests      |
| Privacy and compliance                        | `N/A`        | N/A for local repo-tooling slice; no user data collection or retention changes.                          | scope boundary review                  |
| Content governance                            | `N/A`        | N/A for dev-tooling slice; no content model, owner, or revision policy changes.                          | scope boundary review                  |
| Admin workflow and editability                | `N/A`        | N/A for dev-tooling slice; no admin CRUD/status workflow changes.                                        | scope boundary review                  |
| SEO and crawlability                          | `N/A`        | N/A for local tooling slice; no public metadata/indexing changes.                                        | scope boundary review                  |
| AI discoverability                            | `N/A`        | N/A for local tooling slice; no public semantic/canonical changes.                                       | scope boundary review                  |
| Analytics and KPI observability               | `supporting` | Script should emit clear local diagnostics for chosen mode/fallback reason.                              | command output review                  |
| Commerce and revenue ops                      | `N/A`        | N/A for repo-tooling slice; no commerce or entitlement behavior changes.                                 | scope boundary review                  |
| Incident response and support operations      | `supporting` | Troubleshooting steps for `gh` missing/auth fallback should remain documented in tooling comments/docs.  | script comments + brief docs           |
| Finance and reporting operations              | `N/A`        | N/A for repo-tooling slice; no finance/reporting system or reconciliation impact.                        | scope boundary review                  |
| i18n operational readiness                    | `N/A`        | N/A for local developer-tooling slice; no locale-sensitive product model or route changes.               | scope boundary review                  |
| Stack-fit and dependency discipline           | `target`     | Use existing shell/Node/GitHub CLI setup; no new dependency added just for PATH discovery.               | dependency diff                        |
| Testing and QA automation                     | `target`     | Path/fallback behavior is covered by automated tests or deterministic script-level checks.               | targeted tests + `verify:pre-pr`       |
| Scalability and cost efficiency               | `supporting` | Tooling remains lightweight and avoids extra remote calls when not needed.                               | code review                            |
| DevOps and rollback readiness                 | `target`     | Behavior is reversible by single script change; fallback path remains intact if new detection fails.     | diff review + manual fallback QA       |

## Scope

- Harden `scripts/pr-create-safari.sh` so it can discover `gh` in common macOS install locations when not already on PATH:
  - `/opt/homebrew/bin/gh`
  - `/usr/local/bin/gh`
  - and any safe existing PATH resolution already available.
- Keep current behavior hierarchy explicit:
  - use existing PR if open,
  - create PR if missing,
  - refresh PR body when requested,
  - fall back to Safari compare/new URL only when `gh` is genuinely unavailable or unhealthy.
- Improve diagnostic output so the user can tell which path the script used.
- Add or update automated coverage for the resolution/fallback rules.

## Out Of Scope

- Changing PR body format/content contract.
- Replacing `gh` with direct custom GitHub API implementation.
- Browser changes beyond Safari-focused current workflow.
- Product/admin feature work.

## Acceptance Criteria

1. On macOS with Homebrew-installed authenticated `gh`, `npm run pr:create:safari` opens the real PR URL in Safari instead of the compare/new fallback page.
2. When `gh` is truly missing or unauthenticated, the script still opens the fallback Safari compare/new URL.
3. Script output states which path was used and why.
4. No token values or secret-bearing environment variables are printed.
5. `--print` and existing fallback behavior remain deterministic for automation and debugging.
6. `npm run verify:pre-pr` and targeted script/path validation pass before PR update.

## Validation

- targeted script/unit validation for:
  - `gh` found on PATH,
  - `gh` found via Homebrew fallback path,
  - `gh` unavailable,
  - `gh auth` unavailable/unhealthy,
  - `--print` behavior
- `npm run lint`
- `npm run typecheck` (if helper extraction touches JS/TS files)
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite (Required)

- macOS with Safari available.
- `gh` authenticated for the success-path QA case.
- Node.js LTS + npm installed on the machine used for local validation.

## Manual QA Environments

- Local terminal on macOS
- Safari as foreground browser target for the script
- Test cases:
  - `gh` on PATH
  - `gh` only in Homebrew default path
  - `gh` unavailable
  - `gh` authenticated vs unauthenticated

## Constraints

- Keep the script readable and shell-native.
- Avoid broad environment mutation; only discover safe common executable paths.
- Preserve current fallback behavior rather than removing it.

## 10/10 Quality Bar

- One command should either:
  - open the real PR in Safari,
  - or clearly explain why it had to fall back.
- No silent downgrade from "real PR created/opened" to "compare page only".
- Failure mode should be actionable without reading the script source.

## Help/Guide And Operator Training Contract

- `N/A` for product/admin Help/Guide:
  - this is repo-tooling workflow hardening, not a shipped admin/user workflow.
- If troubleshooting comments or repo tooling instructions change, update the script comments or directly related docs in the same PR.

## Risks And Mitigations

- Risk: new path probing picks the wrong executable or masks auth failure.
  - Mitigation: keep auth check explicit and log chosen executable path/mode deterministically.
- Risk: hardening breaks the existing fallback.
  - Mitigation: preserve fallback contract and add explicit tests for the fallback branch.
- Risk: shell logic becomes too opaque.
  - Mitigation: keep helper logic small, commented, and testable.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-03-17 | kickoff | moved brief from planned to in-progress on branch feat/admin-workspace-hierarchy-and-safari-pr-hardening; implementation started for Homebrew gh discovery, explicit success/fallback diagnostics, and deterministic --print regression coverage | next: finish script-level validation, run `npm run verify:pre-pr`, then open/update PR`
- `2026-03-17 | checkpoint | fixed PR #229 CI by making gh-resolution tests independent of runner PATH (`GH_SKIP_PATH_LOOKUP=1`for deterministic missing-gh scenarios); local`npm run verify:pre-pr` passed after the fix | next: commit and push the CI hardening, then let fresh GitHub verify rerun on the updated SHA`
- `2026-03-17 | 1b99034 (main) | merged via PR #229 after local `npm run verify:pre-pr`, local `npm run verify:pre-merge`, and green required GitHub checks; Safari PR tooling now resolves Homebrew gh reliably and explains create/reuse/fallback mode clearly, and the brief is lifecycle-closed in done | next: use `npm run pr:create:safari` as the normal PR-open path and log only new tooling friction if it reappears`
