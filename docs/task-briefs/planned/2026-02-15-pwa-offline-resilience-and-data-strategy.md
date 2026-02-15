# Task Brief: PWA Offline Resilience and Data Strategy

## Metadata

- `id`: `2026-02-15-pwa-offline-resilience-and-data-strategy`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-15`
- `updated`: `2026-02-15`

## Goal

Learners should get a reliable offline and weak-network experience for core learning flows, with clear status feedback and zero confusion about what is available offline.

## Scope

- Define and implement explicit caching policy by content type:
  - app shell/static assets,
  - course/lesson read content,
  - API responses with safe caching rules.
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

## Acceptance Criteria

- Core learner path can be completed in weak/offline mode for already-cached content.
- Users always understand whether they are offline and what they can do next.
- Uncached pages show graceful fallback instead of hard errors.
- Cache deletion/eviction does not break app flow; fallback appears and recovery path is clear.
- Cache behavior is deterministic and documented.
- No stale-cache bugs after release (old cache versions are cleaned up safely).
- Network-dependent actions never end in false-success UI.
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

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary
