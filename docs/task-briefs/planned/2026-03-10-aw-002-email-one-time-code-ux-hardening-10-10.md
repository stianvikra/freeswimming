# Task Brief: AW-002 Email One-Time-Code UX Hardening (10/10)

## Metadata

- `id`: `2026-03-10-aw-002-email-one-time-code-ux-hardening-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-10`
- `updated`: `2026-03-10`

## Goal

Define a deterministic 10/10 implementation contract for OTP fallback UX that keeps magic-link first, removes ambiguous code-copy behavior, and improves recovery clarity across email clients and devices.

## Why This Brief Exists

- AW-002 was triaged in backlog but had no dedicated planned implementation brief.
- OTP fallback quality and reliability requirements need scorecard-complete measurable thresholds before implementation.
- This brief creates the canonical scope contract for future AW-002 slices.

## Scope

- Define sign-in UX contract for email one-time-code fallback:
  - keep magic-link as primary path,
  - keep OTP fallback explicit and easy to recover,
  - avoid clipboard-dependent assumptions across email clients.
- Define deep-link and fallback behavior contract:
  - use deep-link-to-prefill where supported,
  - provide deterministic manual entry path when deep-link/prefill is unavailable.
- Define UX quality requirements for `/auth/sign-in` fallback states:
  - clear first action,
  - cooldown clarity,
  - provider-failure guidance,
  - retry/recovery messaging.
- Define test and release gate requirements for OTP fallback behavior.

## Out Of Scope

- Replacing the existing auth provider.
- Reworking unrelated account creation/onboarding flows.
- Introducing third-party clipboard/email parsing dependencies.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - OTP generation/validation state and cooldown policy remain server-canonical.
  - auth send/verify outcomes remain canonical in auth backend responses.
- Local-only:
  - temporary input state for code entry and non-sensitive UI status hints.
- Sync behavior:
  - UI state must reflect server-auth outcomes deterministically (`sent`, `cooldown`, `error`, `retry`).
  - no local state may claim final success before server confirmation.
- Invalidation:
  - resend/verify attempts invalidate stale local sent-state and refresh guidance text.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                   | Evidence                                            |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Product goals and IA                          | `target`     | Sign-in entry hierarchy remains explicit: magic-link primary, OTP fallback secondary, with deterministic recovery. | UX contract + sign-in flow checklist                |
| UX flow clarity                               | `target`     | No ambiguous OTP fallback state on required matrix; users always get clear next action and retry guidance.         | e2e auth UX scenarios + manual matrix notes         |
| Visual design quality                         | `supporting` | Supporting only: fallback messaging remains readable and visually consistent with existing auth surface hierarchy. | UI copy/state review + screenshot evidence          |
| Business logic correctness and data integrity | `target`     | OTP resend/verify state transitions are deterministic and no false-positive success state is shown.                | unit tests for state transitions + route assertions |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin workflows are unaffected by this user-auth scope.                                           | scope rationale                                     |
| Accessibility (a11y)                          | `target`     | OTP fallback input, error, and retry controls remain keyboard/label/focus accessible.                              | e2e a11y checks + keyboard QA                       |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no meaningful route payload/perf regression on `/auth/sign-in`.                                   | perf budget gate + build artifacts                  |
| Data placement and sync boundaries            | `target`     | Local vs server-canonical auth state ownership is explicit and enforced for resend/verify flows.                   | data placement contract + tests                     |
| Caching and invalidation strategy             | `supporting` | Supporting only: auth UI state invalidation rules are documented for resend/verify transitions.                    | flow contract + test assertions                     |
| Reliability and failure handling              | `target`     | Cooldown/provider-failure paths provide deterministic non-dead-end recovery actions.                               | negative-path tests + UX state contract             |
| Security and authz                            | `target`     | OTP/auth endpoints continue fail-closed behavior and do not leak sensitive verification details.                   | security negative-path tests + response assertions  |
| Privacy and compliance                        | `supporting` | Supporting only: no new sensitive fields are persisted or exposed in OTP fallback UX instrumentation.              | payload review + scope rationale                    |
| Content governance                            | `supporting` | Supporting only: content model/governance remains unchanged.                                                       | scope rationale                                     |
| Admin workflow and editability                | `supporting` | Supporting only: no admin edit workflow changes in this auth UX slice.                                             | scope rationale                                     |
| SEO and crawlability                          | `supporting` | Supporting only: auth route discoverability/indexing posture remains unchanged.                                    | metadata regression check                           |
| AI discoverability                            | `supporting` | Supporting only: no AI discoverability contract changes in auth fallback scope.                                    | scope rationale                                     |
| Analytics and KPI observability               | `target`     | OTP fallback events capture success/failure/cooldown outcomes with stable non-sensitive payload schema.            | analytics contract + event assertions               |
| Commerce and revenue ops                      | `supporting` | Supporting only: auth fallback scope does not alter commerce reconciliation logic.                                 | scope rationale                                     |
| Incident response and support operations      | `supporting` | Supporting only: support runbook should include OTP fallback diagnostics for cooldown/provider failure states.     | runbook update requirement + scope rationale        |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reporting/reconciliation mutation in this auth-only scope.                             | scope rationale                                     |
| i18n operational readiness                    | `supporting` | Supporting only: OTP copy/error strings should remain locale-extensible for future localization.                   | string contract + scope rationale                   |
| Stack-fit and dependency discipline           | `target`     | Implementation remains within existing auth/ui/testing stack and adds no unnecessary dependencies.                 | dependency diff + implementation notes              |
| Testing and QA automation                     | `target`     | `verify:pre-pr`/`verify:pre-merge` and required auth fallback tests must pass before merge.                        | gate logs + CI checks                               |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new heavy runtime/job costs introduced by fallback UX hardening.                               | scope rationale                                     |
| DevOps and rollback readiness                 | `target`     | Release gate includes rollback path to last known-good sign-in UX if fallback regression is detected.              | rollback notes + release checklist                  |

## Acceptance Criteria

- AW-002 has a scorecard-complete, lintable planned brief with measurable target thresholds.
- Magic-link-first plus OTP fallback behavior is defined as deterministic and testable.
- Recovery/error/cooldown UX expectations are explicit for implementation and QA.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Keep magic-link as primary sign-in path.
- Avoid clipboard-dependent success assumptions.
- Keep copy plain-language and action-oriented.
- Do not weaken security failure semantics to simplify UX.

## 10/10 Quality Bar

- Users always understand what happened and what to do next in OTP fallback states.
- Error/cooldown/retry behavior is deterministic and not contradictory.
- Accessibility and security expectations remain explicit and testable.
- Follow-up implementation can be scored objectively against target categories.

## Checkpoint Log

- `2026-03-10 | working tree | created AW-002 canonical planned 10/10 brief with deterministic OTP fallback UX thresholds and scorecard-complete gating contract | next: link brief in backlog AW-002 section and run verify gates`
