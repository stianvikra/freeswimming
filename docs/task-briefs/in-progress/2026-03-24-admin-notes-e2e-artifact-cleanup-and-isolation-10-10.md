# Task Brief: Admin Notes E2E Artifact Cleanup And Isolation (10/10)

## Metadata

- `id`: `2026-03-24-admin-notes-e2e-artifact-cleanup-and-isolation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-24`
- `updated`: `2026-03-25`

## Goal

Admin Notes stays trustworthy on `freeswimming.org` because E2E/test-created note artifacts are cleaned up deterministically and future test runs do not pollute the production admin queue.

## Admin Notes Triage (Required When Relevant)

- Canonical source of truth:
  - relevant admin notes in `freeswimming.org` production admin on the production database.
- Reviewed production artifact notes during 2026-03-25 recheck:
  - `43ce339d-5a47-4ec4-9a7f-9a57fc4da48a` - `Test data`
  - `b70acb8e-107f-4891-97c9-d819789aefc4` - `Dashboard Quick Note 1774369768587-86`
  - `d690933f-1957-4743-8120-c9455161e9fe` - `Plans Note 1774369718902-853`
  - `cca6f7ef-176a-479c-be4b-697a1d250efa` - `E2E Note Updated 1774369753468-199`
  - `5bcf9fcc-17a7-4c35-8443-0f3232c39d6f` - `E2E Note 1774358007042-69`
  - `d76c7213-066c-47fb-9fbb-32d163cf5e4f` - `E2E Note 1774357772295-34`
  - `6416ebff-a915-44e0-932e-1dd7212088ea` - `E2E Related Note 1774369753468-199`
  - `64307f4d-397f-49b8-9903-dca37a699a33` - `E2E Related Note 1774358507020-148`
  - `9fe20fee-74e6-41a3-bc45-b06fe5f08424` - `E2E Related Note 1774358007042-69`
  - `c94decd2-e9c8-4c66-ad9e-2184d0c72fd0` - `E2E Related Note 1774357772295-34`
  - `8adbf4fa-ce7c-4c9b-aa69-3cd43fa405ff` - `E2E Related Note 1774354272781-867`
  - `b51577ad-21d0-4e8a-ae39-ea917020250a` - `E2E Related Note 1774354130028-332`
- Disposition:
  - `in this brief` for the admin-note artifact cleanup portion of `43ce339d-5a47-4ec4-9a7f-9a57fc4da48a` plus the currently open artifact rows and durable prevention of future admin-note artifact pollution.
  - `partial coverage -> new residual admin note required` for the non-admin-note test-data remainder from `43ce339d-5a47-4ec4-9a7f-9a57fc4da48a` (for example email-template pollution and other non-note artifacts).
- Rules:
  - test artifacts should never be mistaken for real operator work,
  - cleanup and prevention both matter; this cannot stop at one manual production sweep.

## Why This Brief Exists

- Admin note triage exposed a real queue-quality problem:
  - the production notes list contains dozens of obvious E2E/test artifacts,
  - that dilutes the signal from real operational notes.
- Similar cleanup discipline already proved valuable for admin content QA rows.
- This deserves a dedicated slice because it crosses:
  - production data hygiene,
  - test design,
  - admin trust and supportability.

## Dependencies And Boundaries

- Existing foundations and evidence:
  - `/Users/stianvikra/freeswimming/tests/e2e/admin-notes-workflow.spec.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/admin-contextual-notes.spec.ts`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/route.ts`
  - `/Users/stianvikra/freeswimming/app/api/admin/notes/[id]/route.ts`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- This slice owns:
  - admin-note E2E artifact naming/identification contract,
  - cleanup path for existing stale test notes,
  - prevention so future runs stop leaving production residue.
- This slice does not own:
  - a full admin-notes taxonomy redesign,
  - normal operator note triage,
  - public-user note systems.

## Scope

- Define a durable contract for identifying admin-note test artifacts.
- Remove or close existing stale test notes from the production queue through a deliberate cleanup path.
- Harden E2E flows so new test runs do not leave open artifacts in the canonical admin queue.
- Ensure the admin notes surface remains truthful even if cleanup fails or stale artifacts still exist temporarily.
- Document the recovery/cleanup path for operators.

## Out Of Scope

- Replacing the admin-notes feature itself.
- Broad test-environment architecture changes outside what this slice needs.
- Rewriting all admin E2E tests unrelated to notes.

## Data Placement And Sync Contract

- Server-canonical data:
  - real admin note rows,
  - any durable marker or cleanup contract used to distinguish intentional operator notes from test artifacts,
  - canonical done/cleanup state after a production cleanup pass.
- Local-only data:
  - transient test identifiers,
  - temporary test-run cleanup bookkeeping.
- Sync policy:
  - tests must either clean up what they create or create rows in a way that deterministic cleanup can remove later,
  - production queue state is the canonical success metric, not only local test pass/fail.
- Reliability boundary:
  - cleanup must fail visibly rather than silently leaving artifact rows to be mistaken for real notes.

## Identity And Rename Contract

- Canonical stable ID:
  - `admin_note.id` remains canonical for every note row, including test-created rows.
- Human-readable identifiers:
  - test note titles may help identification but should not be the only cleanup signal if a stronger contract is needed.
- Mutability rules:
  - cleanup should target only explicit test artifacts and must not risk real operator notes.
- Compatibility contract:
  - normal operator notes remain untouched,
  - existing admin-note workflows stay valid after cleanup/isolation hardening.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Admin workflow and editability`
- `Testing and QA automation`
- `Incident response and support operations`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                    | Evidence                         |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Product goals and IA                          | `target`     | Operators can trust that open admin notes represent real work rather than stale test artifacts.                   | production queue review          |
| UX flow clarity                               | `target`     | Cleanup and prevention behavior are understandable and do not create mystery rows or hidden exceptions.           | manual QA + docs review          |
| Visual design quality                         | `supporting` | Supporting only: any notes-surface affordance for cleanup remains coherent with existing admin notes UI.          | screenshot review                |
| Business logic correctness and data integrity | `target`     | Cleanup targets only explicit test artifacts and never closes or deletes real operator notes by mistake.          | targeted tests + code review     |
| Admin editor ergonomics                       | `target`     | Admin notes queue becomes materially easier to scan because test noise is removed or clearly isolated.            | manual QA + production review    |
| Accessibility (a11y)                          | `supporting` | Supporting only: any cleanup affordance remains keyboard/touch accessible.                                        | QA review                        |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: cleanup/isolation changes avoid obvious `/admin` responsiveness regressions.                     | build + code review              |
| Data placement and sync boundaries            | `target`     | Test-identification and cleanup state are explicit; production admin-note truth remains canonical and reviewable. | contract review + tests          |
| Caching and invalidation strategy             | `target`     | After cleanup, manager/contextual surfaces refresh deterministically without stale ghost notes.                   | e2e + integration review         |
| Reliability and failure handling              | `target`     | Failed cleanup is visible and recoverable; future test runs do not silently re-pollute the open production queue. | negative-path tests + manual QA  |
| Security and authz                            | `supporting` | Supporting only: cleanup paths remain admin-only and fail closed.                                                 | authz regression checks          |
| Privacy and compliance                        | `supporting` | Supporting only: cleanup does not leak note content or attachment data.                                           | scope review                     |
| Content governance                            | `supporting` | Supporting only: artifact handling remains consistent with note ownership and note lifecycle semantics.           | help/runbook review              |
| Admin workflow and editability                | `target`     | The admin notes queue reflects real operational work instead of being diluted by E2E residue.                     | production review                |
| SEO and crawlability                          | `N/A`        | N/A because admin notes are private admin-only workflows.                                                         | scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing surface.                                                       | scope rationale                  |
| Analytics and KPI observability               | `supporting` | Supporting only: cleanup success/failure should be observable enough to detect regression in note pollution.      | observability review             |
| Commerce and revenue ops                      | `N/A`        | N/A because no commerce/revenue workflow changes.                                                                 | scope rationale                  |
| Incident response and support operations      | `target`     | Runbooks and Help/Guide explain how to recognize, clean up, and prevent admin-note test artifacts.                | docs review                      |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting logic changes.                                                                   | scope rationale                  |
| i18n operational readiness                    | `supporting` | Supporting only: cleanup labels and operator guidance remain localization-safe.                                   | copy review                      |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin note APIs/testing patterns and avoid unnecessary new dependencies.                           | dependency diff + code review    |
| Testing and QA automation                     | `target`     | Automated coverage protects cleanup targeting, stale-artifact prevention, and no-real-note regression safety.     | tests + `verify:pre-pr` evidence |
| Scalability and cost efficiency               | `supporting` | Supporting only: cleanup strategy avoids wasteful repeated scans or manual triage cost over time.                 | workflow review                  |
| DevOps and rollback readiness                 | `supporting` | Supporting only: cleanup/isolation hardening remains easy to revert without schema rollback.                      | diff review                      |

## Acceptance Criteria

1. Existing production admin-note E2E/test artifacts have an explicit cleanup path.
2. Future E2E note workflows do not keep polluting the open production queue.
3. Cleanup targeting is safe and does not hit real operator notes.
4. Admin notes manager/help/rules make artifact handling understandable for operators.
5. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- targeted unit tests for:
  - artifact identification contract,
  - cleanup targeting safety,
  - no-real-note regression
- targeted e2e or deterministic integration checks for:
  - create-and-clean path,
  - stale-artifact detection/recovery
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Do not risk deleting or closing real operator notes through over-broad matching.
- Keep the solution focused on admin-note artifact hygiene, not a general test-infrastructure rewrite.
- Preserve existing admin-note workflows and role gating.

## 10/10 Quality Bar

- Operators should be able to trust the open admin-note queue again.
- Test cleanup should be boring, deterministic, and safe.

## Checkpoint Log

- `2026-03-24 | planning | created dedicated admin-notes E2E artifact cleanup brief during production-note triage after finding 39 open test-pattern notes polluting the canonical queue | next: finish note dispositions, then return execution priority to the manual workout builder before implementation begins`
- `2026-03-25 | recheck | reconciled the missing local triage docs back onto updated main and confirmed the canonical production queue still contains 11 open artifact rows plus the umbrella test-data cleanup request note | next: treat this cleanup/isolation slice as higher priority than the workout export handoff until the admin-note queue is trustworthy again`
- `2026-03-25 | implementation started | moved the cleanup brief into in-progress, added an explicit automated-artifact title contract for admin-note Playwright coverage, and wired deterministic before/after cleanup plus operator recovery guidance so stale test notes stop looking like real work | next: run targeted unit + admin E2E validation, then use the same contract to remove the remaining live artifact rows safely`
- `2026-03-25 | verification | verified the artifact contract with targeted unit coverage, desktop admin-note Playwright coverage, and a full green \`npm run verify:pre-pr\`; also hardened the WebKit drawer-focus keyboard-open assertion so the release gate stops failing on an unrelated menu-toggle delivery race | next: commit/push the cleanup slice and hand off merge readiness`
- `2026-03-25 | ci follow-up | fixed the CI-only placeholder Supabase env path so admin-note artifact cleanup no-ops against injected example credentials, added focused unit coverage for that guard, and reconfirmed the release gate with targeted admin-note Playwright coverage plus another full green \`npm run verify:pre-pr\` | next: push the follow-up commit, update PR handoff, and wait for required checks`
