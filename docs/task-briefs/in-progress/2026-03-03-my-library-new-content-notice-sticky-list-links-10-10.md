# Task Brief: My Library New Content Notice Sticky Dismiss + Linked Lesson List 10/10

## Metadata

- `id`: `2026-03-03-my-library-new-content-notice-sticky-list-links-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-03`
- `updated`: `2026-03-03`

## Goal

Improve `My Library` new-content notice UX so it stays visible until explicit dismiss (`X`) and shows a clear clickable list of newly added lessons.

## Why This Brief Exists

- Current notice can be marked seen by clicking `Open new lessons`, which hides it before explicit confirmation.
- Current notice does not list concrete newly added lessons with direct links.
- We need a tighter UX contract for clarity and control at content scale.

## Scope

- Keep notice visible until user explicitly clicks dismiss `X`.
- Do not mark seen when user opens any lesson link from the notice.
- Show list of newly added lessons with direct links to each lesson.
- Preserve deterministic seen-signature behavior for reappearance on future published additions.
- Update analytics payload usage for explicit dismiss vs open-link interactions.
- Update unit/e2e/API tests for new notice contract.

## Out Of Scope

- Push/email notifications.
- Cross-device server-synced seen state.
- Any redesign outside current library notice surface.

## Dependencies And Boundaries

- Depends on published course lesson metadata (id/title/module) from canonical content rows.
- Depends on user-scoped local seen storage key.
- Prior completed brief:
  - `docs/task-briefs/done/2026-03-03-my-library-new-content-notice-10-10.md`

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - published lesson list used to build signal + metadata for new-item rendering.
- Local-only:
  - seen signature/tokens state for each user.
- Sync policy:
  - compare server signal to local seen state on page load,
  - render list of truly added lessons,
  - persist seen state only on explicit dismiss.
- Conflict/invalidation:
  - on signature mismatch with newly added lessons, notice reappears.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                 | Evidence                 |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------- | ------------------------ |
| UX flow clarity                               | `target`     | Notice remains until explicit dismiss and actions are unambiguous.               | e2e + manual QA          |
| Visual design quality                         | `target`     | List + controls stay readable and aligned with existing library visual language. | visual QA                |
| Business logic correctness and data integrity | `target`     | Only truly new lessons are listed and linked; dismiss reliably persists seen.    | unit tests               |
| Data placement and sync boundaries            | `target`     | Seen state remains local-only and server signal remains canonical.               | code review + tests      |
| Reliability and failure handling              | `target`     | Error/retry states still keep library usable with no false dismiss behavior.     | unit + e2e negative path |
| Security and authz                            | `supporting` | User-scoped behavior with no cross-user leakage.                                 | existing route tests     |
| Analytics and KPI observability               | `target`     | Explicit analytics for shown/open/dismiss with updated payload semantics.        | unit assertions/logs     |
| Testing and QA automation                     | `target`     | Unit + e2e cover sticky visibility and linked-list interactions.                 | CI/local evidence        |

## Acceptance Criteria

1. Notice remains visible after `Open`/lesson-link clicks until explicit dismiss `X`.
2. Notice includes list of newly added lessons with direct lesson links.
3. Dismiss persists seen state and hides notice across reload.
4. New published additions after dismiss re-show notice with updated list.
5. Existing loading/error/retry states remain intact and non-blocking.
6. Tests cover sticky behavior, linked list rendering, and dismiss persistence.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit -- tests/unit/my-library-new-content-notice*.test.ts*`
- `npx playwright test tests/e2e/my-library-new-content-notice.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-03 | implementation complete for sticky-list scope | updated signal model to include lesson metadata + added-lesson diff list, changed notice behavior to persist until explicit X dismiss, added direct per-lesson links, and updated unit/e2e/API tests; npm run verify:pre-pr passed | next: commit, push, and open PR in Safari`
- `2026-03-03 | kickoff from main after PR #124 merge | moved brief planned->in-progress and confirmed scope: sticky notice until explicit X dismiss + linked list of new lessons | next: implement signal/model/UI/test updates and run verify:pre-pr`
- `2026-03-03 | planned | sticky dismiss + linked new lessons follow-up scope captured from owner UX request | next: move brief to in-progress and implement`
