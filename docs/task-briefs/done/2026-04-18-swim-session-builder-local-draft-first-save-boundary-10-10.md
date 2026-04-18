# Task Brief: Swim Session Builder Local Draft First-Save Boundary (10/10)

## Metadata

- `id`: `2026-04-18-swim-session-builder-local-draft-first-save-boundary-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-18`

## Goal

Redesign manual swim-session entry so `Build pool session` and `Build open water session` start from a local-only draft, while canonical saved sessions and stable IDs are created only on the first explicit save.

## Why This Brief Exists

- Current builder behavior still creates a canonical saved session immediately when the user starts a manual session.
- That creates clutter in `My Swim Sessions`, weakens the mental model between “I opened the builder” and “I saved a session,” and makes cleanup harder than it should be.
- The owner chose a stricter product/data boundary:
  - local draft first,
  - no canonical row until first save,
  - no placeholder canonical row just because the builder was opened.
- This is not copy polish. It is a product-flow, storage-boundary, identity-contract, and test-contract change.

## Dependencies And Boundaries

- Parent builder/runtime lineage:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Earlier create-vs-edit slice whose truthfulness boundary now needs to be superseded by this product decision:
  - [2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md)
- Locked product decisions for this brief:
  - starting a manual session creates a local-only draft first,
  - no row appears in `My Swim Sessions` until the first explicit save,
  - canonical stable ID is created only on first save,
  - at most one recoverable local draft per builder mode (`pool`, `open_water`),
  - clicking the same create action should resume the existing local draft if present,
  - local drafts use `Discard draft`,
  - existing saved sessions keep `Save changes` / `Discard changes`,
  - do not introduce `Delete draft` wording for existing canonical sessions.

## Must Now

- Define and ship the local-draft vs canonical-session boundary truthfully.
- Keep unsaved manual builder work local-only on this device/browser.
- Prevent accidental placeholder rows in `My Swim Sessions`.
- Add a clear recover/resume/discard path for local drafts.

## Before Live

- Verify both pool and open-water manual entry follow the same first-save boundary.
- Verify return/recovery behavior after leaving and reopening the builder.
- Confirm saved-session editing still behaves normally after the first save.

## Ongoing Cadence

- Future builder entry changes must preserve the same first-save truth unless explicitly rebriefed.
- Any new manual builder mode must declare:
  - local-draft behavior,
  - first-save canonical boundary,
  - recovery/discard behavior,
  - list visibility contract.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Testing and QA automation`
- `Product goals and IA`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                  | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Manual builder clearly separates `local draft` from `saved session`, and `My Swim Sessions` only lists canonical saved sessions.                                | product flow review + manual QA + e2e     | `5/5`                   |
| UX flow clarity                               | `target`     | Starting, resuming, first save, discard draft, and saved-session edit paths each have one obvious meaning with no duplicated or misleading persistence.         | manual QA + e2e                           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: draft-vs-saved states should remain visually calm and truthful without new clutter or accidental duplicate controls.                           | screenshot review + component QA          | `4/5`                   |
| Business logic correctness and data integrity | `target`     | No canonical session row or stable ID is created before first explicit save, and first save creates exactly one canonical row deterministically.                | unit/integration tests + API/state review | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes owner-facing swim-session authoring, not admin/editor workflows.                                                                 | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: draft recovery/discard and save states must remain keyboard/touch accessible with clear labels and semantics.                                  | targeted QA + a11y review                 | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: moving to local-first draft start must not introduce heavy client cost or obvious builder-route lag.                                           | diff review + targeted QA                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Local draft is device-local only, canonical session is server-saved only after first save, and the first save is the explicit boundary between them.            | brief contract + implementation review    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | `My Swim Sessions` remains canonical-only, and cache/list invalidation occurs only after first save or later canonical edits/deletes.                           | list behavior tests + route review        | `5/5`                   |
| Reliability and failure handling              | `target`     | Local draft remains recoverable on return, first-save failure does not create a ghost canonical row, and discard draft removes only the local draft.            | unit/e2e failure-path coverage            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: canonical save/write remains owner-scoped/authenticated, and local draft recovery must not leak between users or identities.                   | auth review + negative-path tests         | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: local drafts stay on the current device/browser and do not introduce broader unintended persistence or disclosure.                             | storage review + scope rationale          | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: list wording, builder copy, and saved/draft naming must stay aligned with the underlying data truth.                                           | copy review + flow review                 | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow changes in this brief.                                                                                                | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated builder flow with no public crawl contract.                                                                                | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public semantic route or discoverability contract.                                                                            | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: builder events should still distinguish local draft start, first save, resume, and discard if instrumentation exists or is later added.        | event contract review + scope note        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or revenue path changes.                                                                                         | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: draft vs saved state should be diagnosable enough that future support/debug flows can tell which side of the boundary failed.                  | error-state review + docs if needed       | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting flow changes in this brief.                                                                                                    | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes English owner-facing workflow copy and state logic only and should not block future localization architecture.                   | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the current builder stack and local storage/state patterns where possible; do not add unnecessary dependencies or a second server-side placeholder model. | architecture review + dependency diff     | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage locks local-draft creation, resume, discard, first save, post-save edit behavior, and `My Swim Sessions` visibility boundaries.                        | unit/e2e coverage + verify gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: removing accidental placeholder rows should reduce list clutter and wasted storage churn rather than creating more hidden complexity.          | product review + data-boundary review     | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the change should remain reversible without data migration surprises or orphan canonical rows.                                                 | rollback notes + PR slicing plan          | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved swim session record,
  - stable canonical session ID,
  - `My Swim Sessions` list membership.
- Local-only:
  - unsaved builder draft for the current mode (`pool` or `open_water`),
  - local draft recovery marker/state,
  - local discard action before first save.
- Sync policy:
  - opening the builder starts or resumes a local draft,
  - first explicit save creates the canonical session and switches the editor into normal saved-session mode,
  - after first save, the current canonical save/discard-changes model remains authoritative.
- Retention and sensitivity:
  - local drafts are device/browser-local only,
  - at most one recoverable local draft per builder mode.
- Cache/invalidation:
  - no list invalidation on local draft start/resume/discard,
  - invalidate canonical list/detail views only after first save or later canonical mutation.

## Identity And Rename Contract

- Canonical stable ID:
  - created only on first save.
- Human-readable identifiers:
  - draft title/copy may exist locally before save but is not canonical identity.
- Mutability rules:
  - local draft has no canonical session ID,
  - saved session follows the existing canonical edit model after first save.
- Rename vs repurpose policy:
  - editing an existing saved session remains in-place canonical editing,
  - local draft before first save is not a canonical entity and must not be repurposed as a ghost saved row.
- Compatibility contract:
  - existing saved sessions remain in `My Swim Sessions`,
  - new manual sessions do not appear there until first save.
- Observability and repair:
  - failed first save should report failure clearly and keep the draft local,
  - no placeholder canonical row should require cleanup after an aborted create.

## Scope

- Manual `Build pool session` and `Build open water session` entry behavior.
- Local draft recovery/discard behavior before first save.
- First-save canonical creation boundary.
- `My Swim Sessions` visibility contract for unsaved vs saved sessions.
- Builder wording/state distinctions between:
  - local draft,
  - saved session,
  - discard draft,
  - save changes,
  - discard changes.
- Targeted tests and state-management updates needed to make this truthful end to end.

## Out Of Scope

- AI-generated session draft flow unless it directly collides with the manual local-draft model.
- Broader builder layout polish unrelated to this data boundary.
- Poolside print/panel polish.
- Maintenance/tooling/ops/governance work.

## Acceptance Criteria

1. Clicking `Build pool session` or `Build open water session` does not create a canonical saved row immediately.
2. No new row appears in `My Swim Sessions` until the first explicit save.
3. Local draft has no canonical session ID before first save.
4. At most one recoverable local draft exists per builder mode.
5. Re-clicking the same create action resumes the existing local draft instead of creating another one.
6. Local drafts expose a clear `Discard draft` action.
7. After first save, the session becomes canonical, appears in `My Swim Sessions`, and uses the normal saved-session model.
8. Existing saved sessions do not adopt `Delete draft` wording.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for local draft state and canonical creation boundary
- targeted e2e coverage for:
  - start manual session,
  - resume local draft,
  - discard draft,
  - first save creates list row,
  - post-save edit flow
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Local validation from repo root.

## Manual QA Environments

- Local:
  - `/my-library`
  - `/my-library/workouts`
  - manual pool/open-water builder entry
- Preview:
  - PR preview URL after implementation

## Constraints

- Treat this as product-flow and data-boundary work, not copy-only polish.
- Keep list truthfulness strict.
- Do not ship a hidden server placeholder model under local-draft wording.
- Prefer one narrow implementation slice sequence rather than a giant builder rewrite.

## 10/10 Quality Bar

- Zero accidental clutter in `My Swim Sessions`.
- Clear mental model between local draft and saved session.
- No accidental server persistence before first save.
- Clear recovery path if the user leaves and returns.
- No confusing duplication between local draft state and canonical session state.

## Checkpoint Log

- `2026-04-18 | working tree | implemented device-local manual draft storage, routed manual pool/open-water entry through local draft URLs, delayed canonical workout creation until the first explicit save, and updated targeted unit + Playwright coverage for resume/discard/first-save list boundaries; targeted validation is green via npx vitest run tests/unit/create-manual-workout-button.test.tsx tests/unit/workout-builder-hub.test.tsx and npx playwright test tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium --project=mobile-chromium | next: run full brief lint + npm run verify:pre-pr, then commit, push, and open/update the PR`
- `2026-04-18 | verification checkpoint | full \`npm run verify:pre-pr\` passed after updating the program-export Playwright flow to follow the same local-draft-first-save boundary; validation finished green with \`158\` unit files / \`805\` tests, full public Playwright \`101 passed\` / \`331 skipped\`, and perf-budget recommendation \`hold\` because the weekly tighten threshold is still at runs \`1/2\` despite a healthy \`36.0%\` margin | next: commit the scoped changes, push the feature branch, open/update the PR, watch CI, then run \`npm run verify:pre-merge\` before merge recommendation`
- `2026-04-18 | merged + closeout | PR #462 merged to \`main\` as squash commit \`29f27dd\`; manual pool/open-water entry now stays device-local until the first explicit save, local \`npm run verify:pre-merge\` passed with \`103 passed\` / \`329 skipped\`, required CI checks were green, and the brief moved from \`in-progress\` to \`done\` in post-merge closeout | next: none`
