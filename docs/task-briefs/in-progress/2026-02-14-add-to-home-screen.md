# Task Brief: Add To Home Screen

## Metadata

- `id`: `2026-02-14-add-to-home-screen`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-14`
- `updated`: `2026-02-14`

## Goal

Engaged learners should get a high-quality, non-intrusive install experience that combines a one-time contextual prompt after first lesson completion and a permanent manual install option in the menu.

## Scope

- Add install UX with two entry points:
  - contextual prompt for course users after first completion,
  - persistent manual install option in the main menu/drawer.
- Trigger prompt on the first successful `Mark as done` action.
- Define exact trigger contract:
  - source event name/component,
  - what counts as "successful",
  - delay start timing.
- Show prompt after a short delay (about 1-2 seconds), not instantly on click.
- Never show install prompt on initial page paint.
- Add fixed menu item copy and placement for consistency:
  - label: `Install app`,
  - placement: main menu/drawer near primary navigation actions.
- Implement platform-aware behavior:
  - use native install prompt when available (`beforeinstallprompt`),
  - show iOS fallback instructions when native prompt is not available.
- Persist dismissal/install state in browser storage so users are not repeatedly prompted.
- Define browser storage keys and cooldown policy explicitly:
  - `a2hs_prompt_seen` (boolean),
  - `a2hs_dismissed_at` (timestamp),
  - cooldown: 30 days.
- Add explicit eligibility/skip rules:
  - skip if app already installed (`display-mode: standalone` or iOS equivalent),
  - skip when platform/browser does not support install flow and no valid fallback,
  - skip if cooldown is active.
- Add a simple kill-switch (feature flag) so install prompt can be disabled quickly.
- Add/confirm web app metadata and icons for install surfaces:
  - `manifest`,
  - `apple-touch-icon`,
  - Android icons including maskable variant.
- Keep prompt UI aligned with current design language (mobile-first, clean, clear CTA/close).
- Make the install UI feel premium and intentional:
  - clear visual hierarchy (title, value statement, primary action),
  - strong contrast and readable typography,
  - touch-first spacing and tap targets,
  - subtle motion only (no noisy animation).
- Add/adjust tests for:
  - first-completion trigger logic,
  - one-time/cooldown behavior,
  - menu-entry install flow availability,
  - already-installed behavior,
  - platform-specific fallback behavior,
  - basic accessibility semantics.

## 10/10 UX/UI Quality Bar

- The prompt must feel like a natural continuation of the existing FreeSwimming visual system.
- The user must understand what happens in under 2 seconds:
  - why install is useful,
  - what button to tap,
  - how to dismiss safely.
- Install prompt must never block core learning flow or create interruption anxiety.
- All interactive elements must be comfortable on mobile (`>=44px` touch target guidance).
- Copy must be plain-language, short, and confidence-building.
- Motion should be purposeful (fast fade/slide), not decorative.
- Accessibility quality should be first-class:
  - visible focus states,
  - keyboard operability,
  - semantic labels/roles,
  - sufficient contrast.

## Out Of Scope

- No broad redesign of existing pages.
- No push notifications.
- No large offline-first rewrite beyond what is needed for install prompt behavior.
- No analytics vendor migration (only lightweight event hooks if already available).

## Acceptance Criteria

- Prompt appears only after the user's first successful `Mark as done`.
- Prompt does not appear on first paint or before any lesson completion.
- Prompt appears at most once, and respects cooldown after `Not now`.
- Prompt does not show when app is already installed (standalone mode).
- Menu contains a persistent install action users can access manually later.
- Manual menu action works even if contextual prompt was previously dismissed.
- Native install flow is used when supported.
- iOS users get a short, clear manual install guide.
- Prompt has explicit close action and keyboard-accessible controls.
- Icon assets look sharp on iOS and Android home screens.
- Existing navigation and page performance are not degraded.
- Prompt and menu action match existing app styling (not visually "new system").
- CTA and dismiss actions are clear, easy to tap, and readable on small screens.
- Prompt does not cause layout jump or visual instability.
- iOS install guidance is understandable without extra explanation.
- A11y checks pass for the install prompt surface (labels/roles/focus/contrast).
- Storage keys and cooldown logic are deterministic and covered by tests.
- Kill-switch can disable contextual prompt without removing menu install action.

## Success Metrics

- Install prompt interaction rate is measurable (open, dismiss, accept).
- Baseline KPIs are captured before rollout and compared after rollout:
  - install acceptance rate,
  - dismiss rate,
  - return usage (optional if analytics exists).
- If user experience degrades (complaints/drop-off), kill-switch can be used immediately.

## Validation

Which commands should pass?

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Constraints

- Keep copy concise and friendly; avoid blocking modal behavior.
- Keep visual style consistent with existing FreeSwimming UI.
- For icon design, use a high-contrast mark with enough padding for masked icon shapes.
- Prioritize mobile UX quality over aggressive install prompting.
- Prioritize trust and clarity over growth tactics (no dark patterns, no repeated nagging).
