# ADR: A2HS Prompt Trigger

- Status: Accepted
- Date: 2026-02-14
- Owner: `stianvikra`
- Related PR: `https://github.com/stianvikra/freeswimming/pull/8`

## Context

We needed a high-quality install flow that improves adoption without disrupting learning.
Main UX question: where and when to show "Add to Home Screen" prompt.

## Decision

Use a two-entry install model:

1. Contextual one-time prompt after the first successful `Mark as done` in course flow.
2. Persistent manual install action in the menu at all times.

Trigger rules:

- Never show on first paint.
- Delay auto prompt briefly after completion action (about 1-2 seconds).
- Do not show if already installed.
- Respect dismissal cooldown (`a2hs_dismissed_at`, 30 days).
- Track one-time exposure with `a2hs_prompt_seen`.
- Keep a kill-switch via `NEXT_PUBLIC_FS_A2HS_AUTO_PROMPT_ENABLED`.

Platform handling:

- Use native `beforeinstallprompt` where supported.
- Show iOS Safari install instructions as fallback.

## Consequences

Positive:

- Prompt appears at a moment of demonstrated engagement.
- Install remains available later via menu, reducing pressure.
- Lower interruption risk than first-page modal prompts.

Tradeoffs:

- More state and test complexity.
- Requires careful focus and accessibility handling.

## Implementation References

- `app/course/page.tsx`
- `components/install/install-context.tsx`
- `components/install/install-rules.ts`
- `components/MenuDrawer.tsx`
- `tests/e2e/install-prompt.spec.ts`
