# Task Brief: Mac Safari Install Guidance

## Metadata

- `id`: `2026-02-14-mac-safari-install-guidance`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-14`
- `updated`: `2026-02-14`

## Goal

Desktop users should get clear, platform-aware install guidance and post-install clarity, instead of generic fallback messaging.

## Scope

- Detect Mac Safari as a separate fallback case in install flow.
- Define platform detection contract explicitly:
  - `isMacSafari` when user agent indicates Safari on macOS and browser is not Chrome/Edge/Firefox variants.
  - `isIOSSafari` remains existing iOS/iPadOS Safari handling.
  - `canNativePrompt` remains based on captured `beforeinstallprompt`.
- Show concise, platform-specific instructions for Safari on macOS:
  - open `File`,
  - choose `Add to Dock`,
  - confirm add/install.
- Keep existing native install flow unchanged for browsers with `beforeinstallprompt`.
- Keep existing iOS Safari fallback unchanged.
- Improve unsupported-browser fallback copy so users know which browsers support install best.
- Add a short post-install success confirmation message (for accepted install flow), with platform-appropriate next step hint (for example open from Dock/Start).
- Apply guidance in both entry points:
  - contextual prompt,
  - persistent menu install action.
- Keep visual style aligned with current FreeSwimming design system.
- Add/adjust tests for:
  - Mac Safari fallback visibility/flow,
  - no regression for iOS fallback,
  - no regression for native install-capable browsers.
- Update related docs/checklists if fallback behavior changes.

## UX Copy Contract (final strings)

Use these exact messages unless implementation constraints require small wording adjustments:

- Mac Safari fallback title:
  - `Install on Mac (Safari)`
- Mac Safari fallback body (steps):
  - `Open File in Safari`
  - `Choose Add to Dock`
  - `Click Add`
- Unsupported-browser message:
  - `Install is not available in this browser yet. For best support, use Safari, Chrome, or Edge.`
- Post-install success confirmation:
  - `App installed. You can open FreeSwimming from your Dock, Start menu, or home screen.`

## Out Of Scope

- No major redesign of install prompt UI.
- No analytics vendor changes.
- No service worker/manifest architecture changes.
- No browser-specific hacks outside maintainable detection/flow rules.
- No OS-level placement controls (desktop/start menu/dock placement remains browser/OS-managed).
- No deep user-agent fingerprinting beyond minimal install-flow detection.

## Acceptance Criteria

- Mac Safari does not show generic "Install is not available..." when manual install is possible via Safari UI.
- Users see short, actionable Mac Safari instructions within the existing install surfaces.
- iOS Safari behavior remains correct and unchanged.
- Chrome/Edge native install behavior remains correct and unchanged.
- Unsupported browsers get clear, short guidance (instead of dead-end generic message).
- After successful install acceptance, user sees a short confirmation with where to find/open the app next.
- Copy is short, plain-language, and understandable in under 2 seconds.
- No layout instability or degraded page performance.
- A11y semantics remain intact (focus, labels, contrast, keyboard behavior).
- Relevant unit/e2e tests pass.
- Action outcomes are deterministic across entry points (contextual prompt + menu action) and documented.

## State Rules

When user taps install from prompt/menu:

- Native install available and user accepts:
  - show success confirmation message once,
  - close contextual prompt if open,
  - keep menu action available but indicate installed state when applicable.
- Native install available and user dismisses:
  - respect existing dismiss behavior/cooldown rules,
  - avoid immediate re-prompting.
- Mac Safari fallback path:
  - show Safari-specific install steps (not generic unsupported).
- Unsupported browser:
  - show unsupported-browser guidance message (with recommended browsers).

When user taps `Not now` or close:

- Contextual prompt:
  - preserve existing cooldown semantics.
- Menu action:
  - dismiss current guidance without blocking future manual access.

## Validation

Which commands should pass?

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Constraints

- Keep UX non-intrusive and aligned with existing app style.
- Prefer deterministic, maintainable platform checks.
- Do not introduce measurable runtime overhead.
- Keep copy platform-aware but minimal.

## Manual QA Matrix

Run and record pass/fail:

- macOS Safari:
  - menu install opens Mac Safari guide,
  - contextual prompt install opens Mac Safari guide,
  - no generic unsupported message for Safari.
- macOS Chrome:
  - native install prompt path still works.
- Windows Edge/Chrome:
  - native install prompt path still works.
- iOS Safari:
  - existing iOS instructions remain unchanged.
- Android Chrome:
  - native install prompt path remains unchanged.

Also verify:

- `Not now` + cooldown behavior unchanged.
- Installed state suppresses inappropriate prompts.
- No visual regressions in prompt/menu surfaces.

## Event Tracking (if analytics hooks exist)

Track these events (no new vendor required):

- `install_prompt_viewed`
  - props: `entry_point` (`contextual`|`menu`), `platform_bucket`
- `install_prompt_action_clicked`
  - props: `action` (`install`|`not_now`|`close`), `entry_point`, `platform_bucket`
- `install_result`
  - props: `result` (`accepted`|`dismissed`|`ios_instructions`|`mac_safari_instructions`|`unsupported`), `entry_point`
- `install_success_message_shown`
  - props: `entry_point`, `platform_bucket`

If no analytics hooks exist in current stack, skip implementation and document as deferred.

## Rollout and Rollback

- Rollout:
  - ship behind existing install prompt feature controls where applicable.
- Rollback:
  - preserve ability to disable contextual install prompt quickly via existing feature flag path,
  - keep manual menu entry functional when contextual flow is disabled,
  - fallback to previous generic message behavior if severe regression is detected.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary

### Delivered Changes

List shipped files/features.

### DevOps / Workflow Changes

Document CI, branch protection, deployment, and environment/process changes made during the task.

### Secrets Used (Names Only)

List secret names and where they are used.
Do not store secret values in this file.

### Post-Merge Notes

Anything temporary that must be reverted or re-hardened after merge.
