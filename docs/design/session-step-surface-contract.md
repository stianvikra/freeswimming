# Session Step Surface Contract

Use this contract whenever the app displays, edits, rearranges, previews, prints, or exports swim-session steps.

## Reference Surface

- Reference implementation: manual pool session builder in `WorkoutEditor`.
- Shared view-model and display contract: `components/my-library/workouts/sessionStepSurfaceContract.ts`.
- Shared React renderer boundary: `components/my-library/workouts/SessionStepSurfaceRenderer.tsx`.
- Shared export/display model: `buildWorkoutStepDisplaySections` in `lib/workouts/shared.ts`.
- Domain object: canonical workout/session draft steps from `lib/session-generator-v1/shared.ts`.
- Current consumers include manual builder, AI session generator, saved-workout Quick View, Program Builder scheduled-workout cards, and Program PDF scheduled-workout sections.
- Later consumers include poolside note and remaining PDF/export or planner surfaces that still need step-detail parity.
- Architecture target: route-specific surfaces should adapt data into this contract; they should not fork a separate card/tab/rest-summary visual system.

## Required Behavior

- `Edit` mode:
  - show category label and colored left rail,
  - show the compact workout prescription first,
  - show edit actions consistently,
  - keep coaching/detail prose out of collapsed step cards unless the surface has a controlled rationale pattern.
- `Rearrange` mode:
  - keep the same category label, rail, and compact prescription,
  - hide or minimize coach/detail notes,
  - prioritize order controls and readable block identity.
- `View` mode:
  - use grouped section cards in workout order,
  - show the workout prescription as the primary line,
  - show concise coach notes only when the source has a controlled rationale contract,
  - avoid editor controls and support diagnostics.

## Rest Display

- Rest inside a repeat should be embedded in the repeat summary.
- Rest after a set should be shown as linked secondary rest where the data model supports it.
- Standalone rest should remain visible as a rest section/step and must not disappear from View.
- Generator rest preferences that affect the workout must be actual canonical rest steps or repeat rests, not fake display-only text.
- Generator rationale that is not controlled enough for step cards should remain in editable metadata/fields or a separate future rationale surface.

## Reuse Gate

Before implementing a new session-step surface:

1. Identify whether manual pool builder, AI generated session, saved-workout Quick View, poolside note, or PDF/export already solves the same display problem.
2. Reuse the shared renderer/view-model contract where practical.
3. If behavior differs, record the reason in the task brief and screenshot handoff.
4. Capture `after/reference` screenshots when the owner is asked to approve visual parity.

## 10/10 Architecture Target

- One canonical data contract for session steps.
- One canonical display contract per mode: `Edit`, `Rearrange`, `View`.
- Route-specific code may supply copy, callbacks, or data mapping, but should not invent a separate visual system.
- Renderer inputs are display-only; canonical draft mutation, save/export/PDF behavior, and edit-field state stay with the owning route/editor.
- Tests should cover the shared contract once, then route-specific flows only where behavior differs.
- Prior hardening: `docs/task-briefs/done/2026-05-01-session-step-reference-surface-architecture-hardening-10-10.md` extracted the shared view-model/display helpers, and `docs/task-briefs/done/2026-05-03-session-step-shared-view-model-renderer-10-10.md` extracted the shared React renderer. Saved-workout Quick View parity is tracked by `docs/task-briefs/done/2026-05-03-session-step-saved-quick-view-contract-10-10.md`; Program PDF scheduled-workout parity is tracked by `docs/task-briefs/done/2026-05-04-program-pdf-session-step-parity-10-10.md`.
