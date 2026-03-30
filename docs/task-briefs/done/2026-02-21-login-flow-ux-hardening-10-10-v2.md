# Task Brief: Login Flow UX Hardening 10/10 V2

## Metadata

- `id`: `2026-02-21-login-flow-ux-hardening-10-10-v2`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-02-21`
- `updated`: `2026-02-22`

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

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                             | Evidence                        |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Product goals and IA                          | `target`     | Sign-in flow exposes one coherent state machine with clear request, wait, resend, and retry meaning.         | scope + acceptance criteria     |
| UX flow clarity                               | `target`     | First click, repeated click, cooldown, and failure states stay understandable across supported devices.      | validation + implementation log |
| Visual design quality                         | `supporting` | Auth request states and CTA hierarchy remain visually consistent with the sign-in surface.                   | UX quality bar                  |
| Business logic correctness and data integrity | `target`     | Request-state transitions are deterministic and do not produce contradictory messages or invalid CTA states. | scope + targeted tests          |
| Admin editor ergonomics                       | `N/A`        | N/A                                                                                                          | N/A                             |
| Accessibility (a11y)                          | `supporting` | Auth state messaging and CTA updates remain readable and operable on desktop and mobile.                     | UX quality bar                  |
| Performance (CWV + payloads)                  | `supporting` | UX hardening adds no material route regression for `/auth/sign-in`.                                          | validation                      |
| Data placement and sync boundaries            | `target`     | Request/cooldown UI state remains explicit and bounded to the current sign-in flow.                          | scope + implementation log      |
| Caching and invalidation strategy             | `supporting` | Reload/cooldown behavior avoids stale contradictory auth UI.                                                 | scope review                    |
| Reliability and failure handling              | `target`     | Error states remain actionable with no dead-end request loop or broken resend path.                          | acceptance criteria + e2e       |
| Security and authz                            | `supporting` | Hardening preserves current provider/auth boundaries while keeping resend behavior explicit.                 | out-of-scope review             |
| Privacy and compliance                        | `supporting` | No new sensitive payload exposure is introduced by the request-state UX changes.                             | scope review                    |
| Content governance                            | `supporting` | Auth copy stays short, concrete, and aligned with button/state semantics.                                    | UX quality bar                  |
| Admin workflow and editability                | `N/A`        | N/A                                                                                                          | N/A                             |
| SEO and crawlability                          | `N/A`        | N/A                                                                                                          | N/A                             |
| AI discoverability                            | `N/A`        | N/A                                                                                                          | N/A                             |
| Analytics and KPI observability               | `target`     | Key failure and success states remain diagnosable through auth UX regression coverage and event hooks.       | scope + validation              |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                          | N/A                             |
| Incident response and support operations      | `supporting` | Deterministic auth states make support/debugging easier during sign-in incidents.                            | implementation checkpoint       |
| Finance and reporting operations              | `N/A`        | N/A because this auth UX hardening does not change billing, payouts, or finance reconciliation.              | explicit scope rationale        |
| i18n operational readiness                    | `supporting` | State names and messages remain structurally translatable and not tied to fragile wording.                   | UX quality bar                  |
| Stack-fit and dependency discipline           | `target`     | Hardening stays within the current auth stack and test surface rather than introducing a new auth subsystem. | scope + implementation log      |
| Testing and QA automation                     | `target`     | Targeted unit and e2e coverage plus `verify:pre-pr` protect request-state regressions.                       | validation + implementation log |
| Scalability and cost efficiency               | `supporting` | Clear resend/cooldown handling helps avoid unnecessary repeated auth requests.                               | business-logic review           |
| DevOps and rollback readiness                 | `supporting` | State-machine UX hardening remains reversible without schema or provider rollback.                           | implementation log              |

## Implementation Checkpoint Log

- `2026-02-22`:
  - moved brief to `in-progress`.
  - started deterministic request-state implementation (`idle/sending/sent/cooldown/error`) and split auth CTA/status UI into dedicated components.
  - added auth UX regression coverage:
    - `tests/unit/sign-in-ui-state.test.ts`,
    - `tests/e2e/auth-sign-in-ux.spec.ts` (desktop-chromium run-once).
  - validation checkpoint:
    - targeted unit + targeted e2e passed,
    - `npm run verify:pre-pr` passed (`66 passed`, `138 skipped`).
  - merged to `main` via PR `#96` (`feat/login-flow-ux-hardening-v2-phase1`) with 9/9 green checks.
