# Task Brief: Additional Work Backlog

## Metadata

- `id`: `2026-02-17-additional-work-backlog`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-17`
- `updated`: `2026-02-21`

## Purpose

Capture good ideas that should be implemented later without blocking the active delivery slice.

## Queue

| ID       | Title                                                                      | Priority | Status    |
| -------- | -------------------------------------------------------------------------- | -------- | --------- |
| `AW-002` | Email one-time-code UX hardening (magic link first + OTP fallback clarity) | `medium` | `triaged` |
| `AW-003` | Sign-in code request reliability + cooldown UX redesign (10/10)            | `high`   | `done`    |
| `AW-004` | Admin Help/Guide center + non-technical operations handbook                | `high`   | `planned` |
| `AW-005` | Contextual admin notes on lesson/drill/product pages                       | `high`   | `planned` |
| `AW-006` | Full cross-platform visual/UX/readability hardening pass                   | `high`   | `planned` |
| `AW-007` | Login flow UX/state-machine stabilization (success + cooldown continuity)  | `high`   | `planned` |

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

## AW-004: Admin Help/Guide center + operations handbook (non-technical)

- Trigger:
  - Admin needs one clear place explaining how app/admin works, integrations, and workflows without technical language.
- Goal:
  - Add a 10/10 Help/Guide experience for admins, with clear onboarding and day-2 operations guidance.
- Direction (locked):
  - dedicated `Help/Guide` entry in admin navigation,
  - plain-language explanations for app structure, connected services, admin features, and expected workflows,
  - maintenance contract: this guide must be updated whenever features/processes change.
- Acceptance baseline:
  - non-technical admin can understand and execute core workflows from guide alone,
  - guide has clear sections (`what`, `why`, `how`, `when`, `troubleshoot`),
  - update responsibility is codified in brief/process docs.
- planned brief:
  - `docs/task-briefs/planned/2026-02-21-admin-help-center-and-ops-handbook.md`

## AW-005: Contextual admin notes on lesson/drill/product pages

- Trigger:
  - Notes created in dashboard should also be usable directly where content is reviewed (lesson/drill/product pages).
- Goal:
  - Let admins capture and edit contextual notes in-place, admin-only, with low-friction UX.
- Direction (locked):
  - note can be linked to content entity (`module`, `lesson`, `drill`, `product`, and route),
  - admin-only note icon/state visible on linked surfaces,
  - collapsible panel at page bottom with inline create/edit/toggle/delete.
- Acceptance baseline:
  - linked notes are discoverable and editable from both dashboard and content surface,
  - notes are hidden for non-admin users,
  - UX supports compact/collapsed mode by default on dense pages.
- owner brief:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md` (next slice)

## AW-006: Full cross-platform visual/UX/readability hardening

- Trigger:
  - Need systematic 10/10 quality pass for UI/UX/readability across devices, screen sizes, and OS/browser matrix.
- Goal:
  - Close remaining cross-platform UX/design gaps with measurable criteria and regression guardrails.
- Acceptance baseline:
  - no P1 layout/readability issues on required matrix,
  - consistent spacing/type hierarchy/interactions across breakpoints,
  - validated through device matrix + visual/e2e checks.
- owner brief:
  - `docs/task-briefs/planned/2026-02-18-cross-platform-ux-design-hardening.md`

## AW-007: Login flow UX/state-machine stabilization

- Trigger:
  - inconsistent success/cooldown behavior after first click and on repeat attempts.
- Goal:
  - make login feedback deterministic and understandable on every attempt.
- Direction (locked):
  - explicit state machine for request lifecycle (`idle/sending/sent/cooldown/error`),
  - countdown visibility and continuity guaranteed across retries/reloads,
  - clear user feedback without contradictory “success + blocked” states.
- Acceptance baseline:
  - same action sequence always yields same UI state and guidance,
  - repeat-click path is predictable and validated on desktop/mobile.
- planned brief:
  - `docs/task-briefs/planned/2026-02-21-login-flow-ux-hardening-10-10-v2.md`

## Recommended Execution Order

1. `AW-007` login UX stabilization (highest user-impact, smallest scope).
2. `AW-005` contextual admin notes on content surfaces.
3. `AW-004` admin Help/Guide center + maintenance contract.
4. `AW-006` cross-platform UX/design hardening sweep (ongoing validation track).

## 10/10 Cross-Cut Categories (Apply When Relevant)

Apply these when backlog items graduate to dedicated implementation briefs:

- Content governance and source-of-truth
- Taxonomy and category management
- Workflow and publishing safety (`draft/review/published/archived`)
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
- RBAC and auditability
- UX/UI quality contract (`loading`, `empty`, `error`, `retry`)
- Performance contract
- Testing contract (critical + negative paths, no duplicate tests)
- Observability and KPI tracking
- Migration and rollback readiness
- Definition-of-done quant targets

## Notes

- Backlog items here are intentionally deferred.
- When an item starts implementation, cut a dedicated feature branch and a focused task brief/checkpoint log entry.
  - completed:
    - `AW-003` -> `docs/task-briefs/done/2026-02-18-aw-003-sign-in-cooldown-reliability.md` (merged PR `#42`)
- PR create/review/merge links should be opened in Safari by default:
  - `open -a Safari "<PR_URL>"`
- Before moving any spawned implementation brief to `done`, run final closeout gate:
  - completion audit,
  - 10/10 quality + security + regression sweep,
  - explicit owner prompt for `move to done` and `post-merge cleanup`.

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.
