# Task Brief: AW-003 Sign-In Cooldown Reliability UX

## Metadata

- `id`: `2026-02-18-aw-003-sign-in-cooldown-reliability`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-18`

## Goal

Make sign-in code request behavior predictable and trustworthy: first request confirms code sent, then resend applies clear progressive cooldown messaging without dead ends.

## Scope

- Harden `/auth/sign-in` resend/request UX flow.
- Adjust cooldown logic so first request in a new browser session does not immediately show 30s cooldown due prior requests elsewhere.
- Keep progressive resend cadence (`30s`, `60s`, `5m`) on repeated resend attempts in same sign-in session.
- Preserve code-entry state when resend fails.
- Improve user-facing error classification for resend outcomes.
- Add/update tests for cooldown and resend behavior.
- Update task briefs and checkpoint logs.

## Out Of Scope

- No auth provider migration.
- No redesign outside sign-in scope.
- No new analytics vendor.

## Acceptance Criteria

- First request shows success (`sent`) if send succeeds.
- Second immediate resend shows `wait 30s`; next immediate resend shows `wait 60s`; then `5m`.
- Resend failures keep code-entry mode active (no jarring reset).
- Cooldown copy is explicit and actionable.
- Unit tests cover cooldown sequencing and session-scoped behavior.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`

## Implementation Checkpoint Log

- `2026-02-18` | `working tree` | brief created and branch started (`feat/auth-aw003-cooldown-ux`) | next: implement session-scoped cooldown + resend state hardening in auth actions/page.
- `2026-02-18` | `working tree` | AW-003 implementation slice completed:
  - cooldown lock/cadence keys are now scoped by email + sign-in session cookie,
  - cooldown pre-check applies only to explicit resend requests,
  - resend failures keep token entry mode (`sent=1`) instead of resetting flow,
  - resend form now sends `resend=1` marker,
  - added helper + unit tests for resend/cooldown decision rules.
  - validation:
    - `npm run lint`,
    - `npm run typecheck` (after clearing stale `.next` from previous branch context),
    - `npm run test:unit`,
    - `npm run build`.
  - next step: checkpoint commit + push, then open PR.
- `2026-02-18` | `1c32579` | AW-003 merged to `main` via PR `#42` and post-merge cleanup completed. | next: move brief to `done`.

## Completion Record

- `PR`: `https://github.com/stianvikra/freeswimming/pull/42`
- `merge`: `feat/auth-aw003-cooldown-ux` -> `main` (squash merge)
- `result`: sign-in cooldown/resend UX hardened with session-scoped throttling and resilient resend flow.
