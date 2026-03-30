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

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                             | Evidence                             |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Product goals and IA                          | `target`     | Sign-in flow exposes a clear request-first then resend/cooldown progression without ambiguous state changes. | goal + acceptance criteria           |
| UX flow clarity                               | `target`     | First send, resend, cooldown, and failure states remain understandable and actionable.                       | acceptance criteria                  |
| Visual design quality                         | `supporting` | Auth messaging stays visually aligned with the existing sign-in surface.                                     | scope review                         |
| Business logic correctness and data integrity | `target`     | Cooldown cadence and session scoping remain deterministic across resend attempts.                            | implementation checkpoint + tests    |
| Admin editor ergonomics                       | `N/A`        | N/A                                                                                                          | N/A                                  |
| Accessibility (a11y)                          | `supporting` | Status and resend messaging remain readable and operable on the auth surface.                                | acceptance criteria                  |
| Performance (CWV + payloads)                  | `supporting` | Cooldown hardening adds no material route regression.                                                        | validation                           |
| Data placement and sync boundaries            | `target`     | Cooldown state is scoped to the active email/session context instead of leaking across unrelated sessions.   | scope + implementation checkpoint    |
| Caching and invalidation strategy             | `supporting` | Session-scoped resend behavior avoids stale browser-state contradictions.                                    | implementation checkpoint            |
| Reliability and failure handling              | `target`     | Resend failures preserve code-entry mode and avoid dead-end resets.                                          | acceptance criteria + implementation |
| Security and authz                            | `supporting` | Existing auth throttling and provider boundaries remain intact.                                              | out-of-scope review                  |
| Privacy and compliance                        | `supporting` | Session scoping avoids exposing cross-device/cross-user resend behavior.                                     | scope review                         |
| Content governance                            | `supporting` | Cooldown copy remains consistent with sign-in terminology.                                                   | acceptance criteria                  |
| Admin workflow and editability                | `N/A`        | N/A                                                                                                          | N/A                                  |
| SEO and crawlability                          | `N/A`        | N/A                                                                                                          | N/A                                  |
| AI discoverability                            | `N/A`        | N/A                                                                                                          | N/A                                  |
| Analytics and KPI observability               | `supporting` | Resend and cooldown behavior remains diagnosable through existing auth test/log surfaces.                    | implementation checkpoint            |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                          | N/A                                  |
| Incident response and support operations      | `supporting` | Auth resend failures become easier to reproduce and support through deterministic state handling.            | implementation checkpoint            |
| Finance and reporting operations              | `N/A`        | N/A because this auth UX hardening does not change billing, payouts, or finance reconciliation.              | explicit scope rationale             |
| i18n operational readiness                    | `supporting` | Cooldown states are expressed as stable, translatable auth messages.                                         | acceptance criteria                  |
| Stack-fit and dependency discipline           | `target`     | Hardening stays within the current auth stack and helper/test patterns.                                      | scope + implementation checkpoint    |
| Testing and QA automation                     | `target`     | Unit coverage protects resend sequencing, session scoping, and resilient code-entry behavior.                | validation + checkpoint log          |
| Scalability and cost efficiency               | `supporting` | Session-scoped cooldown logic avoids unnecessary repeated auth requests.                                     | implementation checkpoint            |
| DevOps and rollback readiness                 | `supporting` | UX hardening remains reversible without schema or provider rollback.                                         | completion record                    |

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
