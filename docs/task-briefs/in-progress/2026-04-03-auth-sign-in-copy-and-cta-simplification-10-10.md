# Task Brief: Auth Sign-In Copy And CTA Simplification (10/10)

## Metadata

- `id`: `2026-04-03-auth-sign-in-copy-and-cta-simplification-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Goal

Make `/auth/sign-in` read faster and feel less heavy by shortening the explanatory copy and simplifying the primary CTA labels without changing any auth behavior.

## Why This Brief Exists

- The production admin-notes umbrella still carries one explicit login-screen note:
  - `3aa25b37-d7b4-4059-9a2f-05de2563f9f7` `Login Screen`
- The current sign-in route is truthful, but it repeats the same auth-story in several places:
  - page intro,
  - passkey-readiness card,
  - request/code form headings,
  - CTA labels.
- The next quality step is not a new auth flow; it is calmer wording:
  - shorter headings,
  - shorter CTA labels,
  - less repetition about the current auth stack.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Main product surfaces in scope:
  - `app/auth/sign-in/page.tsx`
  - `components/auth/AuthPasskeyReadinessCard.tsx`
  - `components/auth/AuthRequestStatus.tsx`
  - `components/auth/AuthResendButton.tsx`
  - `tests/e2e/auth-sign-in-ux.spec.ts`
  - `tests/unit/auth-passkey-readiness-card.test.tsx`
- This slice owns:
  - shorter auth-page intro copy,
  - shorter form headings,
  - shorter request/submit/resend labels,
  - updated regression coverage for the new wording.
- This slice does not own:
  - auth mechanics,
  - rate limiting/cooldown behavior,
  - passkey rollout decisions,
  - preview-access unlock copy.

## Triage Disposition

- `3aa25b37-d7b4-4059-9a2f-05de2563f9f7` `Login Screen`
  - disposition: owned by this brief.
  - reason: the note maps directly to simplifying `/auth/sign-in` copy and CTA labels.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                       | Evidence                                  |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `target`     | `/auth/sign-in` explains the email-code flow in one scan without redundant auth-stack narration.                    | copy review + route QA                    |
| UX flow clarity                               | `target`     | The owner can immediately tell what to do next from both states: request a code, then enter the code.               | e2e assertions + copy review              |
| Visual design quality                         | `target`     | The sign-in surface feels lighter without adding new UI chrome or breaking the current visual language.              | route review + screenshot/QA              |
| Business logic correctness and data integrity | `target`     | The slice changes only labels/copy; request, cooldown, resend, and verify behavior remain unchanged.                | code review + existing auth tests         |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin-editing surface or operator data workflow.                                  | explicit scope rationale                  |
| Accessibility (a11y)                          | `supporting` | Supporting only: headings, labels, and button semantics remain unchanged and readable for screen readers.            | existing e2e + Testing Library            |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the copy-only slice adds no meaningful payload or render-cost regression on `/auth/sign-in`.       | diff review + verify gate                 |
| Data placement and sync boundaries            | `target`     | Sign-in UI state remains request-param + local countdown driven with no new persistence layer.                       | code review + existing helpers            |
| Caching and invalidation strategy             | `N/A`        | N/A because the slice adds no new fetch path, cache key, or invalidation behavior.                                  | explicit scope rationale                  |
| Reliability and failure handling              | `target`     | Success, resend, cooldown, and error states stay deterministic after the copy cleanup.                              | e2e + unit assertions                     |
| Security and authz                            | `supporting` | Supporting only: no auth gate, token flow, or access-control logic changes.                                         | scope rationale + unchanged auth actions  |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes wording only and does not alter personal-data handling.                               | explicit scope rationale                  |
| Content governance                            | `supporting` | Supporting only: sign-in wording stays truthful about email-code auth and does not imply live passkey support.      | copy review                               |
| Admin workflow and editability                | `N/A`        | N/A because the slice changes no admin workflow label or edit surface.                                               | explicit scope rationale                  |
| SEO and crawlability                          | `N/A`        | N/A because the slice changes no crawl/index contract.                                                               | explicit scope rationale                  |
| AI discoverability                            | `N/A`        | N/A because no public metadata/schema/discoverability contract changes beyond shorter route description text.        | explicit scope rationale                  |
| Analytics and KPI observability               | `N/A`        | N/A because the slice adds no new instrumentation.                                                                   | explicit scope rationale                  |
| Commerce and revenue ops                      | `N/A`        | N/A because no entitlement, payment, or offer behavior changes.                                                      | explicit scope rationale                  |
| Incident response and support operations      | `supporting` | Supporting only: copy remains straightforward enough that support can still direct users through request/resend/code. | QA + route review                         |
| Finance and reporting operations              | `N/A`        | N/A because the slice changes no finance or reporting workflow.                                                      | explicit scope rationale                  |
| i18n operational readiness                    | `N/A`        | N/A because the slice adjusts only English copy and does not alter locale infrastructure.                            | explicit scope rationale                  |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing sign-in surface/components with no new dependencies or auth abstractions.                         | dependency diff + code review             |
| Testing and QA automation                     | `target`     | Regression coverage locks the new headings/messages/buttons and the slice passes verify gates before merge.          | unit + e2e + verify output                |
| Scalability and cost efficiency               | `N/A`        | N/A because no new background work, storage, or network cost is introduced.                                          | explicit scope rationale                  |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback remains one small auth-surface revert with no schema/data migration.                       | rollback note + PR summary                |

## Data Placement And Sync Contract

- Server-canonical:
  - auth request/verify actions,
  - email-code issuance and verification,
  - signed-in session state.
- Local-only:
  - countdown timer rendering,
  - in-flight button pending states,
  - purely presentational copy.
- Sync policy:
  - unchanged from the existing sign-in flow.
- Cache/invalidation:
  - unchanged; no new cache layer is introduced.

## Identity And Rename Contract

- Canonical identity:
  - unchanged; auth identity remains email + session handled by the current auth stack.
- Human-readable labels:
  - request/code/resend button text and headings are UI copy only.
- Mutability rules:
  - this slice intentionally renames labels in place without changing the underlying auth actions.

## Scope

- Shorten the sign-in route intro copy.
- Shorten the passkey-readiness card copy while keeping it truthful.
- Simplify the request/code headings and button labels.
- Update regression coverage to the new copy contract.

## Out Of Scope

- Changing sign-in logic, redirects, cooldown math, or resend mechanics.
- Changing preview-access or admin unlock copy.
- Reopening passkey/product-architecture decisions.

## Acceptance Criteria

1. `/auth/sign-in` reads clearly in one scan without repeated “current auth stack” explanation.
2. The request state uses shorter copy and shorter CTA labels than today.
3. The code-entry state uses shorter copy and shorter CTA labels than today.
4. Passkey/device messaging stays truthful and does not imply passkeys are currently enabled.
5. Existing request, cooldown, resend, and code-verification behavior remain unchanged.
6. Targeted auth tests and verify gates pass before PR update/merge.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/auth-passkey-readiness-card.test.tsx`
- targeted `playwright`:
  - `tests/e2e/auth-sign-in-ux.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/auth/sign-in?next=%2Fmy-library`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - mobile Safari

## Constraints

- Keep scope limited to copy and labels on the existing sign-in surface.
- Do not change auth action contracts or redirect behavior.
- Do not add new dependencies.

## 10/10 Quality Bar

- The request state should feel lighter immediately on first scan.
- The code-entry state should feel equally simple:
  - check email,
  - enter code,
  - sign in.
- Passkey messaging must remain truthful but quieter than today.

## Help/Guide And Operator Training Contract

- `N/A` for dedicated Help/Guide updates in this slice because no help-center article or runbook currently mirrors the exact `/auth/sign-in` button labels; the change is local route copy only.

## Security, Privacy, And Compliance

- No secrets, tokens, or auth policy changes.
- The slice must not imply any new sign-in method that the current stack cannot perform.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated login-copy slice.
- Open/update PR after `npm run verify:pre-pr` is green.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-03 | working tree | simplified /auth/sign-in intro copy, request/code headings, request-resend-submit labels, and passkey-readiness wording; targeted vitest, targeted desktop-chromium auth e2e, npm run typecheck, and full npm run verify:pre-pr are green | next: stage the auth copy slice, commit, push, and open the PR`
- `2026-04-03 | working tree | created the login-screen child slice under the production admin-notes umbrella for note 3aa25b37 and scoped it to shorter /auth/sign-in copy + CTA labels only | next: implement the tighter auth copy, update targeted auth tests, and run validation`
