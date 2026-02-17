# Task Brief: Additional Work Backlog

## Metadata

- `id`: `2026-02-17-additional-work-backlog`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-17`
- `updated`: `2026-02-17`

## Purpose

Capture good ideas that should be implemented later without blocking the active delivery slice.

## Queue

| ID       | Title                                                                      | Priority | Status    |
| -------- | -------------------------------------------------------------------------- | -------- | --------- |
| `AW-002` | Email one-time-code UX hardening (magic link first + OTP fallback clarity) | `medium` | `triaged` |
| `AW-003` | Sign-in code request reliability + cooldown UX redesign (10/10)            | `high`   | `triaged` |

## AW-002: Email one-time-code UX hardening

- Problem:
  - OTP copy actions inside email are unreliable across clients.
- Direction (locked):
  - Primary sign-in entry should stay one-tap magic link.
  - OTP remains fallback.
  - If clickable behavior is used in email, prefer deep-link-to-prefill over clipboard assumptions.
  - In-product copy control should use explicit text label (not icon-only).
- Acceptance baseline:
  - Works on mobile + desktop mail clients without relying on blocked clipboard APIs.
  - Clear fallback path when deep-link is unavailable.

## AW-003: Sign-in code request reliability + cooldown UX redesign

- Trigger:
  - User can see expected cooldown once, then a generic error (`Could not send sign-in email right now`) on the next request, which feels inconsistent.
- Goal:
  - Make sign-in request flow resilient and transparent so users understand exactly what happened and what to do next.
- Scope (later implementation):
  - classify auth send failures into explicit UX states (`cooldown`, `provider temporary failure`, `email blocked`, `unknown`),
  - preserve code-entry state after resend failures (avoid jarring reset),
  - show actionable next step copy with retry timing,
  - add stronger analytics + operational logs for OTP send/verify failures,
  - improve visual hierarchy and microcopy on `/auth/sign-in` for 10/10 clarity.
- Acceptance baseline:
  - repeat-request flow is predictable and understandable on first try,
  - cooldown and provider failures are visually distinct,
  - no dead-end state after resend failure,
  - validated on Safari + Chrome desktop and mobile.

## Notes

- Backlog items here are intentionally deferred.
- When an item starts implementation, cut a dedicated feature branch and a focused task brief/checkpoint log entry.
- PR create/review/merge links should be opened in Safari by default:
  - `open -a Safari "<PR_URL>"`
