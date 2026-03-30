# Task Brief: PWA Offline Resilience and Data Strategy

## Metadata

- `id`: `2026-02-15-pwa-offline-resilience-and-data-strategy`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-17`

## Goal

Learners should get a reliable offline and weak-network experience for core learning flows, with clear status feedback and zero confusion about what is available offline.

## Scope

- Define and implement explicit caching policy by content type:
  - app shell/static assets,
  - course/lesson read content,
  - API responses with safe caching rules.
- Define explicit storage and sync contract by auth state:
  - guest users: local-first progress on device,
  - signed-in users: local-first UX + server sync for durable progress.
- Define parity contract for installed PWA vs browser web:
  - same data semantics and sync rules across both,
  - differences only in install/offline UX surfaces and cache behavior.
- Add deterministic cache strategy per bucket:
  - `cache-first` for immutable static assets,
  - `stale-while-revalidate` for low-risk read content,
  - `network-first` for mutable or sensitive responses.
- Add user-facing connection and availability feedback:
  - lightweight online/offline indicator,
  - clear copy when action requires network,
  - no blocking or noisy banners.
- Ensure safe failure behavior:
  - if offline and content is not cached, show useful fallback with next-best action,
  - avoid broken/blank states.
- Add explicit write-safety contract for network-dependent actions:
  - do not show permanent "saved/done" state until server confirms,
  - show clear retry path when offline/server unavailable,
  - keep local UI state honest about sync status.
- Define sync efficiency rules to minimize server resource usage:
  - use debounced/batched writes for non-critical progress updates,
  - trigger immediate sync only for high-value milestones (for example lesson/session completed),
  - avoid aggressive polling loops for progress state.
- Define cache invalidation/version rules for each release.
- Add/update tests for:
  - offline navigation to cached content,
  - fallback behavior for uncached routes,
  - online->offline transitions without UI breakage.
  - behavior after cache/storage is manually cleared.

## Out Of Scope

- No push notifications.
- No background sync for write operations unless explicitly approved in separate task.
- No auth/session architecture changes.
- No separate business logic forks for installed PWA vs web app progress semantics.

## Acceptance Criteria

- Core learner path can be completed in weak/offline mode for already-cached content.
- Users always understand whether they are offline and what they can do next.
- Uncached pages show graceful fallback instead of hard errors.
- Cache deletion/eviction does not break app flow; fallback appears and recovery path is clear.
- Cache behavior is deterministic and documented.
- No stale-cache bugs after release (old cache versions are cleaned up safely).
- Network-dependent actions never end in false-success UI.
- Guest progress remains usable locally without account; clear backup prompt is shown at defined milestone.
- Signed-in progress sync is durable and recoverable across devices after reconnect.
- Installed PWA and browser web follow the same progress/sync semantics (no contradictory behavior).
- Progress sync avoids high-frequency polling and uses batched/event-driven updates.
- No visible performance regression in normal online browsing.
- Unit + e2e coverage for offline transition and fallback paths are green.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Manual QA Environments

- Local dev URL:
  - browser devtools offline simulation (desktop Chrome/Safari),
  - iOS Safari manual network toggling,
  - Android Chromium manual network toggling.
- Installed-mode validation:
  - iOS added-to-home-screen web app,
  - Android installed PWA,
  - compare key progress/sync behavior vs normal browser mode.
- Vercel preview:
  - repeat offline/weak-network checks on at least one mobile and one desktop browser.
- Required eviction QA:
  - clear browser website data/cache, reload while offline, verify fallback path,
  - reconnect and verify normal state restoration.

## Constraints

- Keep UX calm and confidence-building (no alarmist copy).
- Do not cache sensitive/private response bodies by default.
- Keep cache strategy maintainable and easy to reason about.
- Server remains source of truth for completion/progress state.
- Prefer local compute and batched sync over chatty server writes for routine progress updates.
- No continuous polling for progress sync unless explicitly justified and bounded.

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

## Storage and Sync Contract (PWA + Web)

- Guest mode:
  - progress writes to local storage/indexedDB immediately for responsive UX,
  - no durability guarantee across reinstall/storage clear,
  - show explicit upgrade prompt for account backup/sync.
- Signed-in mode:
  - progress writes locally first, then syncs to server,
  - server-confirmed state is durable source for cross-device restore.
- Conflict handling:
  - define deterministic conflict rule (for example server timestamp precedence) and surface non-blocking sync notice.
- Milestone sync:
  - force sync on meaningful completion events (lesson/session complete),
  - defer routine edits via debounce/batch.
- Platform parity:
  - installed PWA and browser web use same write/sync semantics and data contracts.

## Server Resource Strategy

- Sync efficiency goals:
  - avoid per-keystroke server writes,
  - batch routine updates,
  - prefer event-driven sync over interval polling.
- Backoff and retry:
  - use bounded exponential backoff on failed sync attempts,
  - avoid retry storms during unstable connectivity.
- Observability:
  - track sync success/failure rates and retry counts to tune cost/reliability tradeoffs.

## 10/10 UX/UI and Reliability Bar

- Offline behavior must feel intentional, not degraded:
  - users always know what works now and what requires network.
- Required UI states must exist and be testable for changed flows:
  - `loading`,
  - `empty`,
  - `error`,
  - `offline`,
  - `retry`.
- No false success on write actions when server confirmation is missing.
- Recovery actions must always be obvious and actionable.
- Accessibility semantics must remain intact for status and error messaging.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief file.
- Checkpoint cadence: commit at each completed milestone or every 60-90 minutes of active coding.
- Every checkpoint should record:
  - latest commit hash,
  - completed milestone,
  - next milestone.
- Recovery protocol if session/chat is interrupted:
  1. run `git status -sb`,
  2. run `git log --oneline -n 10`,
  3. reopen this brief and continue from the recorded next milestone.

## PR Browser Rule

- Open PR create/review/merge links in Safari by default:
  - `open -a Safari "<PR_URL>"`
- Use another browser only if the owner explicitly asks for it.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                  | Evidence                          |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Product goals and IA                          | `target`     | Offline and weak-network behavior is honest about what works now, what syncs later, and what still needs network. | goal + acceptance criteria        |
| UX flow clarity                               | `target`     | Users always understand current connectivity, cached availability, and the next recovery action.                  | acceptance criteria + quality bar |
| Visual design quality                         | `supporting` | Offline indicators and fallback states remain calm, confidence-building, and visually consistent.                 | constraints + quality bar         |
| Business logic correctness and data integrity | `target`     | Write actions never claim durable success before server confirmation and sync rules remain deterministic.         | scope + acceptance criteria       |
| Admin editor ergonomics                       | `N/A`        | N/A                                                                                                               | N/A                               |
| Accessibility (a11y)                          | `target`     | Status, error, and retry messaging remain accessible across changed offline/online states.                        | quality bar                       |
| Performance (CWV + payloads)                  | `target`     | Cache strategy and sync efficiency preserve normal online performance and avoid noisy background work.            | acceptance criteria + constraints |
| Data placement and sync boundaries            | `target`     | Guest local progress, signed-in server durability, and parity between installed PWA and browser web are explicit. | scope + storage and sync contract |
| Caching and invalidation strategy             | `target`     | Content buckets, versioning, and eviction behavior are deterministic and documented.                              | scope + required eviction QA      |
| Reliability and failure handling              | `target`     | Cached, uncached, cleared-storage, and reconnect paths avoid blank screens and false-success states.              | acceptance criteria + validation  |
| Security and authz                            | `supporting` | Sensitive/private responses are not cached by default and auth boundaries remain unchanged.                       | constraints                       |
| Privacy and compliance                        | `supporting` | Offline support preserves server truth for durable account data and avoids unnecessary sensitive persistence.     | constraints + storage contract    |
| Content governance                            | `supporting` | Availability messaging and backup prompts remain aligned with the actual sync model.                              | scope review                      |
| Admin workflow and editability                | `N/A`        | N/A                                                                                                               | N/A                               |
| SEO and crawlability                          | `supporting` | Offline fallback behavior does not alter public crawl/index semantics.                                            | scope review                      |
| AI discoverability                            | `N/A`        | N/A                                                                                                               | N/A                               |
| Analytics and KPI observability               | `supporting` | Sync success/failure and retry behavior remain measurable for tuning reliability vs cost.                         | server resource strategy          |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                               | N/A                               |
| Incident response and support operations      | `supporting` | Offline failure and retry behavior remain diagnosable through explicit sync and fallback rules.                   | server resource strategy          |
| Finance and reporting operations              | `N/A`        | N/A because this offline-resilience brief does not change billing, payouts, or finance reconciliation.            | explicit scope rationale          |
| i18n operational readiness                    | `supporting` | Connectivity and retry language stays concise and structurally ready for later localization.                      | quality bar                       |
| Stack-fit and dependency discipline           | `target`     | Offline strategy stays within current web/PWA architecture without introducing parallel product semantics.        | scope + constraints               |
| Testing and QA automation                     | `target`     | Offline navigation, uncached fallback, reconnect, and cache-clear paths are protected by automated coverage.      | validation + required eviction QA |
| Scalability and cost efficiency               | `target`     | Sync uses bounded batching/backoff rather than expensive polling or per-action chatter.                           | server resource strategy          |
| DevOps and rollback readiness                 | `target`     | Cache versioning and rollout rules remain explicit enough for safe release and recovery.                          | scope + validation                |

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
