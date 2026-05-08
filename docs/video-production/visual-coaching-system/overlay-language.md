# Overlay Language

## Design Principles

- The swimmer is the subject. Overlays are support.
- One teaching point should be visually dominant at a time.
- Use motion and timing sparingly.
- Prefer clarity over decoration.
- Use the same component family across course and social exports.
- Every overlay must survive mobile review.

## Visual Hierarchy

1. Swimmer motion.
2. Primary coaching cue.
3. Supporting annotation.
4. Brand watermark.
5. Captions or subtitle track.

If an overlay competes with the swimmer, remove or simplify it.

## Core Overlay Components

| Component                    | Purpose                          | Default behavior                                    |
| ---------------------------- | -------------------------------- | --------------------------------------------------- |
| title card                   | identify lesson or drill         | clean lockup, short title, optional objective       |
| drill label                  | name current drill               | compact, persistent only while useful               |
| focus label                  | name the active cue              | high contrast, one cue at a time                    |
| callout                      | explain a movement or mistake    | short phrase, anchored near but not over key motion |
| arrow                        | direct eye to movement direction | thick enough for mobile, minimal count              |
| body line                    | show alignment                   | thin high-contrast line, no decorative glow         |
| rotation indicator           | show roll timing                 | curved arrow or arc, short duration                 |
| catch path                   | show hand/forearm path           | simple path line, not a full trace clutter          |
| kick timing marker           | show timing relation             | small ticks or rhythm marks                         |
| freeze-frame annotation      | explain a paused frame           | label + one or two guides                           |
| slow-motion indicator        | tell viewer speed changed        | small label, no fake technical UI                   |
| split-screen label           | identify before/after or angle   | label each panel clearly                            |
| mistake/correction indicator | contrast wrong vs right          | use label + shape, not color alone                  |
| watermark                    | brand recognition                | subtle, never over key movement                     |
| wall-logo treatment          | optional brand scene detail      | only when physically plausible and verified         |

## Text Rules

- Use Manrope.
- Use sentence case.
- Keep labels short:
  - ideal: `2-5` words,
  - maximum: `8` words unless on a static title card.
- Avoid technical paragraphs over footage.
- Use consistent wording:
  - `Focus`
  - `Mistake`
  - `Fix`
  - `Drill`
  - `Practice cue`

## Sizing Rules

Use export-relative sizing so the same design adapts across formats.

- Primary cue text:
  - at least `4.5%` of the short edge,
  - never below `42px` on a `1080` short-edge export.
- Secondary annotation:
  - at least `3.5%` of the short edge,
  - never below `34px` on a `1080` short-edge export.
- Lines:
  - at least `4px` on `1080` exports,
  - thicker for underwater or compressed social clips.
- Arrow heads:
  - clear at phone size,
  - no tiny technical arrows.

## Opacity And Contrast

- Text must remain readable over moving water.
- Use subtle backing only when needed:
  - dark translucent plate behind text,
  - edge shadow,
  - thin outline.
- Avoid large opaque panels over the swimmer.
- Use higher contrast for underwater footage than above-water footage.

## Motion Rules

- Keep overlay animations short and purposeful.
- Use fade or slight slide for labels.
- Use draw-on for path lines only when it helps timing.
- Avoid bouncing, elastic, or attention-seeking movement.
- Freeze-frame annotations should appear after the viewer has seen the motion once at normal speed.

## Mistake And Correction Rules

Use non-color meaning:

- `Mistake` label,
- `Fix` label,
- different shape treatment,
- optional X/check only if not childish or distracting,
- side-by-side labels for comparison.

Do not rely on red vs green alone.

## Caption Separation

Captions are not coaching overlays. They must have their own reserved area and must not collide with:

- lower thirds,
- drill labels,
- callouts,
- social platform UI zones,
- swimmer's breathing/head area in vertical crops.

## Do Not Use

- More than two arrows in one active moment.
- Thick boxes covering the body.
- Decorative bokeh, glow, or gradient effects.
- Tiny labels that only work on desktop.
- Overlays that explain what the voiceover already says without adding visual value.
- A logo over the swimmer or the coaching cue.
- Any style that makes the clip look like a generic sports broadcast instead of FreeSwimming coaching.
