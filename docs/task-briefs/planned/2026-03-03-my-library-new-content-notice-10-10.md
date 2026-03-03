# Task Brief: My Library New Content Notice 10/10

## Metadata

- `id`: `2026-03-03-my-library-new-content-notice-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-03`
- `updated`: `2026-03-03`

## Goal

Logged-in learners get a clear, low-friction notice in `My Library` when new `published` lessons are available, with deterministic dismiss/seen behavior and no interruption of active learning flow.

## Why This Brief Exists

- Current library flow has no explicit “new content available” signal.
- Popup-style interruption is worse UX for active learners.
- We need a predictable “seen state” model before content production scale-up.

## Scope

- Add `My Library` notice banner component for new published lesson content.
- Trigger only for `published` changes (never `draft/review/archived`).
- Show concrete delta copy, for example:
  - `+2 nye leksjoner i Free Course`.
- Add actions:
  - `Open new lessons` CTA,
  - `Dismiss` / `Mark as seen`.
- Persist per-user seen state with deterministic signature comparison.
- Keep behavior unobtrusive (banner only, no blocking modal).
- Add tests for visible/hidden transitions and persistence.

## Out Of Scope

- Admin preview mode for draft/review content.
- Push/email notifications.
- Server-side notification inbox.

## Dependencies And Boundaries

- Depends on stable published-content identifiers from course content APIs.
- Depends on auth identity availability for per-user local seen state keying.
- Related brief (separate implementation track):
  - `docs/task-briefs/planned/2026-03-03-admin-preview-mode-and-open-lesson-preview-10-10.md`

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - published content identity/signature derived from canonical content rows.
- Local-only:
  - `lastSeenSignature` per user and library surface.
- Sync policy:
  - fetch current signature on `My Library` load,
  - compare with local seen signature,
  - show banner only on mismatch,
  - store new seen signature when user dismisses/marks seen.
- Conflict/invalidation:
  - if content changes while user is on page, next refresh/navigation updates banner state.
- Retention and sensitivity:
  - local value stores only opaque signature + timestamp,
  - no sensitive personal content in local storage.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                 | Evidence                   |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------- | -------------------------- |
| UX flow clarity                               | `target`     | Notice is non-blocking, self-explanatory, and dismissible in one click.          | e2e + manual QA            |
| Visual design quality                         | `target`     | Banner follows existing library visual language, hierarchy, and spacing.         | visual QA checklist        |
| Business logic correctness and data integrity | `target`     | Banner appears only when signature mismatch exists; never for unchanged content. | unit tests                 |
| Data placement and sync boundaries            | `target`     | Local seen state and server signature boundaries implemented exactly as briefed. | code review + tests        |
| Reliability and failure handling              | `target`     | If signature fetch fails, page remains usable and no false-positive banner spam. | unit + e2e negative-path   |
| Security and authz                            | `supporting` | Seen state is user-scoped; no cross-user leakage.                                | test assertions            |
| Performance (CWV + payloads)                  | `supporting` | No measurable regression on `/my-library` route-level user timing.               | verify + profiler sample   |
| Analytics and KPI observability               | `target`     | Events emitted for notice shown, CTA clicked, and mark-seen action.              | analytics tests/log review |
| Testing and QA automation                     | `target`     | Unit + e2e coverage for show/hide/dismiss/new-content transitions.               | CI test evidence           |
| DevOps and rollback readiness                 | `supporting` | Feature can be disabled safely behind runtime flag if needed.                    | code path review           |

## Acceptance Criteria

1. Banner shows only when new published content exists since last seen.
2. Banner copy includes concrete count/context for changed content.
3. `Dismiss`/`Mark as seen` hides banner and persists across reload.
4. Banner reappears when a new published change arrives after mark-seen.
5. No blocking modal/pop-up is introduced in library flow.
6. Tests cover: first load, unchanged state, changed state, dismiss persistence, fetch failure fallback.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npx playwright test tests/e2e/my-library-new-content-notice.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## 10/10 Quality Bar

- Learner understands instantly what changed and where to go next.
- No visual noise or interruption while studying.
- Required states on changed surface:
  - `loading`, `empty`, `error`, `retry`, `success`.
- Accessibility:
  - semantic region/role,
  - keyboard operable actions,
  - focus-visible,
  - contrast compliant.

## Risks And Mitigations

- Risk: false positives from unstable signature generation.
  - Mitigation: deterministic, sorted signature source + unit tests.
- Risk: cross-device “seen” mismatch with local-only storage.
  - Mitigation: document local-first behavior now; optional server-sync in later slice.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.
