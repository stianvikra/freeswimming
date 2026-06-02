# Mobile Action Layout Contract

## Purpose

This contract defines the shared mobile action layout direction for AW-006 follow-up work. It is a
design-system rule, not a completed app-wide migration.

## Button Semantics

- Primary actions: save, continue, confirm, complete, or the one clear next step. Use
  `fs-cta-primary`.
- Secondary actions: view, details, download, copy, retry, dismiss, or support actions. Use
  `fs-cta-secondary`.
- Mode choices: use a segmented control with equal segments, for example `Edit / Rearrange / View`.
- Danger actions: delete, remove, discard, or destructive reset. Use danger color treatment and keep
  the action visually distinct from primary save/continue.
- Recovery actions: undo/restore in a notice or toast. Keep the recovery action near the message and
  visually clear without looking like a normal save action.

## Mobile Group Rules

- One visible action: full-width on mobile.
- Two equal actions: two equal columns on mobile.
- Three equal short choices: three equal columns only when the labels fit comfortably, especially
  segmented controls.
- Three mixed or longer actions: two equal actions plus the third full-width below.
- Text-fit override: if any visible action label wraps, nearly wraps, or is likely to be longer in
  translation, stack the whole mobile action group as full-width rows unless the surface is an
  intentional short segmented control. Do not ship half-width buttons with wrapped primary labels.
- Four actions: two-by-two grid.
- Five actions: acceptable only after prioritization review; use two-by-two plus the fifth full-width
  or promote one primary full-width above secondary actions.
- Six or more actions: do not expose all as equal visible buttons on mobile. Group, split, or move
  lower-priority actions into overflow.

## Forward Compatibility

Action layout helpers must support an arbitrary count of actions. The UX threshold is not a hard
technical limit: new actions should either inherit the appropriate group behavior or be explicitly
prioritized into a group, secondary panel, or overflow.

Unknown or newly added actions must not create orphan final-row buttons, text overflow, or
inconsistent color semantics.
