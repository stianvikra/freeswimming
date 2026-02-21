# Task Brief: Login Flow UX Hardening 10/10 V2

## Metadata

- `id`: `2026-02-21-login-flow-ux-hardening-10-10-v2`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-21`
- `updated`: `2026-02-21`

## Goal

Make sign-in request UX deterministic and clear on first click and repeated attempts, with stable success/cooldown behavior across devices.

## Scope

- Review current auth request UI/logic and remove inconsistent state transitions.
- Implement explicit request state machine:
  - `idle`,
  - `sending`,
  - `sent`,
  - `cooldown`,
  - `error`.
- Ensure countdown and resend UX behavior is consistent:
  - first click feedback is immediate and clear,
  - second click behavior is deterministic and not contradictory,
  - cooldown state persists correctly through retry/reload windows where applicable.
- Improve copy and affordances for non-technical users:
  - what happened,
  - what to do now,
  - when retry is available.
- Add analytics/diagnostic events for key failure modes.

## Out Of Scope

- Replacing Supabase auth provider.
- Major redesign of entire auth surface beyond flow clarity and consistency.

## Acceptance Criteria

- No contradictory status messaging on repeated clicks.
- Countdown visibility and behavior is stable and predictable.
- Resend action is disabled/enabled by explicit state rules.
- Error handling is actionable and non-ambiguous.
- Behavior validated on desktop + mobile browsers.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- targeted e2e for repeated sign-in request/cooldown flows
- `npm run verify:pre-pr`

## UX Quality Bar (10/10)

- One primary action per step.
- Progress and wait states are always visible.
- No dead-end state after error.
- Copy is short, concrete, and consistent with button labels.

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.
