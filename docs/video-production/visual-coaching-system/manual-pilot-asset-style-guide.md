# Manual Pilot Asset Style Guide

## Purpose

This guide converts the current FreeSwimming app design system into a practical asset brief for
manual video-coaching overlays. It is meant for ChatGPT, Motion, Final Cut Pro, or a designer who
needs to build the first reusable visual coaching asset family.

This guide does not create final assets. It defines the visual target and quality bar that assets
must hit before the system scales to full lessons or a generated asset pack.

## 2026-06-24 App Design Audit

Audited sources:

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/our-method/OurMethodClient.tsx`
- `app/programs/page.tsx`
- `components/PageIntro.tsx`
- `components/SiteChrome.tsx`
- `lib/brand.ts`
- `public/logos/brand/manifest.json`
- `docs/design/brand-logo-usage.md`
- `docs/task-briefs/done/2026-06-08-aw-006-design-parity-reaudit-10-10.md`

Audit conclusions:

- The app uses local Manrope as the brand sans font through `app/fonts/Manrope-VariableFont_wght.ttf`.
- The public/export copy of the same font exists at `public/fonts/Manrope-VariableFont_wght.ttf`.
- The current visible app system is token-led through `app/globals.css`, not Tailwind theme extension.
- The app's current design direction is quiet, premium, light, and focused: rounded 8px controls/cards,
  translucent white surfaces, blue action accents, ink/slate text, and minimal motion/press feedback.
- The video system should inherit the font, palette discipline, compact brand mark usage, and calm
  hierarchy.
- The video system should not copy website cards, large white glass panels, large radial gradients,
  or web CTA styling directly onto footage.
- FCP is acceptable for placement and validation, but it is not precise enough for 10/10 reusable
  asset design. Motion, a design tool, or a generated transparent asset pipeline should create the
  precise primitives; FCP should consume and validate them.

## Font Decision

Use Manrope for video assets.

Source files:

- App runtime: `app/fonts/Manrope-VariableFont_wght.ttf`
- Public/export font: `public/fonts/Manrope-VariableFont_wght.ttf`

Allowed weights:

| Use                                   | Weight         | Rationale                                                            |
| ------------------------------------- | -------------- | -------------------------------------------------------------------- |
| Primary coaching cue                  | `600`          | Matches the app's calm-semibold hierarchy and survives compression.  |
| Secondary label                       | `500` or `600` | Keeps small labels readable without shouting.                        |
| Watermark wordmark if text is rebuilt | `600`          | Only if a brand-pack lockup cannot be used. Prefer brand-pack files. |
| Dense microcopy                       | Avoid          | Video overlays should not use dense paragraphs.                      |

Do not introduce another font unless Manrope is technically unavailable in the production tool. If
Manrope is unavailable, use system `SF Pro` as a temporary working fallback only, and record that the
asset is not final.

## Color Decision

The video system should use current app tokens as the practical source of truth, while preserving
the existing brand-pack colors inside logo assets.

### Primary Video Palette

| Role               | Hex       | Source                            | Use                                                                   |
| ------------------ | --------- | --------------------------------- | --------------------------------------------------------------------- |
| Video accent blue  | `#2563EB` | `--fs-color-brand-600`            | New overlay accents, left rails, arrow accents, active states.        |
| Brand/logo blue    | `#2856D7` | `docs/design/brand-logo-usage.md` | Existing logo assets and cases that must match the brand-pack symbol. |
| Light blue support | `#3B82F6` | `--fs-color-brand-500`            | Secondary emphasis only, never primary text over footage.             |
| Deep blue          | `#1D4ED8` | `--fs-color-brand-700`            | Strong accent on light non-footage frames; use sparingly on footage.  |
| Ink                | `#0F172A` | `--fs-color-ink`                  | Dark plates, dark text on non-footage frames.                         |
| Ink strong         | `#020617` | `--fs-color-ink-strong`           | High-contrast plates and title-card text.                             |
| Slate              | `#475569` | `--fs-color-muted`                | Secondary text on non-footage frames only.                            |
| White              | `#FFFFFF` | app and brand docs                | Text over footage, reverse watermark, high-contrast lines.            |

### State Colors

| Role              | Hex       | Use                                                                            |
| ----------------- | --------- | ------------------------------------------------------------------------------ |
| Fix/support green | `#047857` | Optional correction accent, never without `Fix` label or a check/shape cue.    |
| Error/danger rose | `#F43F5E` | Optional mistake accent, never without `Mistake` label or a shape cue.         |
| Deep danger       | `#BE123C` | Non-footage documentation/state frames only; avoid over footage unless tested. |

### Colors To Avoid On Video

- Neon cyan/turquoise as a primary cue. Pool footage already contains cyan water.
- Large blue translucent panels that tint the swimmer or water.
- App background gradients copied onto footage.
- Red/green-only mistake/fix meaning.

## Visual Translation From App To Video

Inherit:

- Manrope.
- Short sentence-case labels.
- Blue as a restrained accent, not a dominant wash.
- Ink/slate/white contrast discipline.
- 8px app control radius translated to smaller video label radius.
- `Learn. Drill. Swim.` calm, instructional hierarchy.
- Compact `symbol-*` logo use for watermark.

Do not inherit directly:

- Large web cards or nested cards.
- Website hero typography.
- White glass panels over swim footage.
- CTA gradients.
- Decorative radial backgrounds.
- Dense app paragraphs.

Video overlays should feel like the app's technical coaching layer, not like website UI pasted onto
water.

## Asset Family Contract

All pilot assets must share one visual grammar:

- same geometry across light and dark footage variants,
- same editable controls,
- same naming pattern,
- only contrast treatment changes between variants,
- no component may cover the swimmer's head, catch, shoulder line, hip line, wall contact, or main
  correction area by default.

Pilot IDs:

| Component         | Light-footage ID                           | Dark-footage ID                           |
| ----------------- | ------------------------------------------ | ----------------------------------------- |
| Watermark         | `vc-pilot-watermark-light-footage`         | `vc-pilot-watermark-dark-footage`         |
| Coaching label    | `vc-pilot-label-light-footage`             | `vc-pilot-label-dark-footage`             |
| Direction arrow   | `vc-pilot-arrow-light-footage`             | `vc-pilot-arrow-dark-footage`             |
| Body/catch guide  | `vc-pilot-body-guide-light-footage`        | `vc-pilot-body-guide-dark-footage`        |
| Correction marker | `vc-pilot-correction-marker-light-footage` | `vc-pilot-correction-marker-dark-footage` |

Approved reusable assets later use `vc-template-` instead of `vc-pilot-`.

## Coaching Label Specification

This is the first pilot component and the reference for the rest of the family.

### Text

- Font: Manrope.
- Weight: `600`.
- Case: sentence case.
- Ideal length: `2-5` words.
- Maximum length: `8` words.
- Examples:
  - `Focus: High elbow`
  - `Fix: Press back`
  - `Mistake: Dropped elbow`
  - `Drill: Sculling`

### Size

Use export-relative sizes:

| Export      | Primary label text | Secondary label text |
| ----------- | ------------------ | -------------------- |
| `1920x1080` | `42-52px`          | `34-40px`            |
| `3840x2160` | `84-104px`         | `68-80px`            |
| `1080x1920` | `44-56px`          | `36-44px`            |
| `1080x1080` | `40-50px`          | `34-40px`            |

The FCP manual pilot showed that a `120` title-size value felt too large, while roughly `104` felt
closer to the desired `4K` label scale.

### Plate

| Property  | Light-footage                            | Dark-footage                             |
| --------- | ---------------------------------------- | ---------------------------------------- |
| Fill      | `#0F172A` or `#020617`                   | `#020617`                                |
| Opacity   | `70-76%`                                 | `82-88%`                                 |
| Radius    | `6-8px` at `1080`, `12-16px` at `4K`     | Same geometry                            |
| Padding X | `18-24px` at `1080`, `36-48px` at `4K`   | Same geometry                            |
| Padding Y | `8-12px` at `1080`, `16-24px` at `4K`    | Same geometry                            |
| Blur      | none                                     | none                                     |
| Shadow    | optional very soft `#020617` at `20-30%` | optional very soft `#020617` at `25-35%` |

### Accent Rail

- Position: flush to the left edge of the plate.
- Color: `#2563EB` for new video assets.
- Width: `4-6px` at `1080`, `8-12px` at `4K`.
- Height: same as plate.
- Radius: match plate left radius if the tool supports it.
- Do not use a large blue block. The rail is a brand signature, not a banner.

### Label Quality Bar

A label is not approved unless:

- it remains readable when reviewed at phone size,
- it does not look like a default FCP title,
- the blue accent is visible without becoming the dominant object,
- it still reads over bright pool water and dark underwater footage,
- it has the same geometry in both contrast variants,
- the text remains editable in Motion/FCP or documented as a published parameter.

## Watermark Specification

Use existing brand-pack assets. Do not redraw the logo.

Preferred assets:

- `public/logos/brand/symbol-primary.png`
- `public/logos/brand/symbol-white.png`
- `public/logos/brand/apparel/symbol-primary.png` for higher-resolution source if needed
- `public/logos/brand/apparel/symbol-white.png` for higher-resolution source if needed

Rules:

- Default placement: top right safe area for `16:9`.
- Use white symbol over dark footage.
- Use primary or ink symbol over bright footage only when it does not compete with water highlights.
- Opacity target: `42-58%`.
- Size: `3.0-4.5%` of short edge.
- Never place over head, hands, catch path, shoulder line, hip line, wall push-off, or active cue.
- Do not use full lockups over active swim footage unless the frame is an intro/outro or static title
  card.

## Direction Arrow Specification

Purpose: direct attention to movement direction, not decorate the frame.

Geometry:

- Straight arrow and curved arrow variants.
- Rounded caps.
- Simple triangular or chevron head.
- Stroke at `1080`: `6-9px`.
- Stroke at `4K`: `12-18px`.
- Arrowhead at `1080`: `18-26px`.
- Arrowhead at `4K`: `36-52px`.

Color/contrast:

- Light footage: `#FFFFFF` stroke with optional `#0F172A` shadow/outline at `35-45%`.
- Dark footage: `#FFFFFF` stroke at higher opacity, optional `#2563EB` secondary accent.
- Accent-only arrows may use `#2563EB`, but only if they remain clear on cyan water.

Behavior:

- Publish start/end position, length, rotation, opacity, and contrast preset.
- Avoid more than two arrows in one active moment.
- Do not animate unless draw-on timing improves teaching.

## Body Guide And Catch Path Specification

Purpose: show alignment or motion path while keeping the swimmer primary.

Geometry:

- Stroke at `1080`: `4-6px`.
- Stroke at `4K`: `8-12px`.
- Rounded caps.
- No glow.
- No full-body tracing unless it is a single clear teaching moment.
- Catch path should be a partial path, not a full technical diagram.

Color/contrast:

- Light footage: `#0F172A` at `55-70%` or `#2563EB` at `70-85%` when not competing with water.
- Dark footage: `#FFFFFF` at `75-90%`, or `#2563EB` with white/ink outline if tested.

Behavior:

- Publish start/end position, curvature/angle, opacity, and variant.
- Use draw-on only for timing moments.
- Keep guides away from face and breathing area unless that area is the explicit cue.

## Correction Marker Specification

Mistake/fix meaning must not rely on color alone.

### Mistake

- Label prefix: `Mistake:`
- Accent: `#F43F5E` only as a support cue.
- Shape: dashed border, small notch, slash mark, or compact `x` icon.
- Plate: same base plate as labels.
- Do not use large red boxes.

### Fix

- Label prefix: `Fix:`
- Accent: `#2563EB` or `#047857`.
- Shape: solid border, check mark, or corrected path line.
- Plate: same base plate as labels.
- Do not use green alone to mean correct.

Pairing:

- In split-screen, place `Mistake:` and `Fix:` in matching positions.
- In one-frame correction, show only one primary state at a time unless the frame is a deliberate
  comparison.
- The non-color cue must still communicate the state in grayscale.

## Title Card And Intro/Outro Rules

Use title cards sparingly. The active coaching experience should start quickly.

Use:

- `lockup-domain-primary` or `lockup-tagline-primary` on light/non-footage title cards.
- `lockup-domain-white` or `lockup-tagline-white` on dark/footage-backed title cards.
- Manrope title text in `#020617`, `#0F172A`, or `#FFFFFF` depending on background.

Avoid:

- full-screen blue gradients,
- decorative animated backgrounds,
- long objectives,
- logo plus large text plus multiple labels at once.

Course intro target: `1.5-3.0s`.
Social intro target: `0.5-1.5s`, or skip when the first frame already brands clearly.

## Format Rules

### `16:9`

- Best for full coaching context.
- May include label + one guide/arrow + watermark.
- Avoid filling the wide frame with unnecessary annotations.
- Keep captions separate from coaching labels.

### `9:16`

- One primary cue at a time.
- Text inside middle `80%` width.
- Larger text than landscape.
- Avoid wide horizontal callouts.
- Watermark may move to the least busy upper safe corner.

### `1:1`

- Short labels only.
- Keep top/bottom areas uncrowded.
- Avoid simultaneous caption + lower-third + correction marker.

## Motion/FCP Production Rules

### Best Tool Split

- Motion/design tool: build exact assets and editable templates.
- FCP: place templates, adjust text, validate on footage, export stills/film.
- Repo: store docs, recipe notes, small approved references, and future generated manifests only.

### Required Published Controls

For Motion templates, publish:

- text,
- position,
- scale,
- opacity,
- width,
- contrast variant,
- accent visibility,
- emphasis state,
- safe-margin preset,
- start/end points for arrows and guides,
- state for correction markers.

### FCP Limitation Record

The manual FCP pilot showed that FCP generator primitives are too slow and imprecise for 10/10 asset
construction. FCP can still validate a design direction on real frames. Do not treat manually tweaked
FCP primitives as the final reusable asset system.

## 10/10 Visual Quality Gate

An asset family can claim 10/10 only after full-resolution review proves:

- readable on bright pool footage,
- readable on dark/underwater footage,
- readable after phone-size review,
- same geometry across light and dark variants,
- no key movement is covered,
- text is editable or published,
- arrows/guides are editable, not fixed PNG-only,
- mistake/fix meaning works without color,
- watermark is subtle and placed safely,
- style feels like FreeSwimming, not generic sports broadcast,
- evidence includes `16:9` stills and at least one short motion segment.

Minimum evidence before scaling:

- `after-light-footage-16x9.*`
- `after-dark-footage-16x9.*`
- `after-motion-segment-16x9.*`
- `after-overload-limit-16x9.*`

## ChatGPT / Designer Brief

Use this prompt when handing the asset work to ChatGPT, Motion, or a designer:

```text
Create a premium FreeSwimming visual coaching overlay asset family for swim technique videos.

Source design:
- Use Manrope as the font.
- Use FreeSwimming app palette: accent blue #2563EB, logo blue #2856D7 only when matching existing logo assets, ink #0F172A, ink strong #020617, slate #475569, white #FFFFFF.
- Use existing FreeSwimming brand assets from public/logos/brand; do not redraw or invent a new logo.
- Style should feel calm, premium, technical, swimmer-first, and consistent with the FreeSwimming app.

Do not create website cards pasted over video. Do not use large gradients, decorative glow, heavy boxes, neon cyan, or generic sports-broadcast graphics.

Build matched light-footage and dark-footage variants for:
- vc-pilot-watermark-light-footage / vc-pilot-watermark-dark-footage
- vc-pilot-label-light-footage / vc-pilot-label-dark-footage
- vc-pilot-arrow-light-footage / vc-pilot-arrow-dark-footage
- vc-pilot-body-guide-light-footage / vc-pilot-body-guide-dark-footage
- vc-pilot-correction-marker-light-footage / vc-pilot-correction-marker-dark-footage

The two variants must use the same geometry, naming, controls, and placement logic. Only contrast treatment may change.

Primary label:
- Manrope 600.
- Sentence case.
- Example text: Focus: High elbow.
- Compact ink plate #0F172A or #020617.
- Light footage plate opacity 70-76%.
- Dark footage plate opacity 82-88%.
- Left accent rail #2563EB, 4-6px at 1080 or 8-12px at 4K.
- Rounded radius 6-8px at 1080 or 12-16px at 4K.
- Primary label size 42-52px at 1080, 84-104px at 4K.

Arrow:
- Rounded caps, simple head, 6-9px stroke at 1080 or 12-18px at 4K.
- White with subtle ink shadow/outline on footage; optional #2563EB accent only if readable.

Body/catch guide:
- Thin high-contrast line, 4-6px at 1080 or 8-12px at 4K.
- No glow, no clutter, no full-body tracing unless specifically needed.

Correction marker:
- Use Mistake: and Fix: labels.
- Pair color with shape/icon/pattern. Do not rely on red/green alone.
- Mistake may use #F43F5E with dashed/notched treatment.
- Fix may use #2563EB or #047857 with solid/check treatment.

Watermark:
- Use symbol-primary or symbol-white from the brand pack.
- Keep opacity 42-58%.
- Keep size 3.0-4.5% of short edge.
- Never cover the swimmer's head, hands, catch, body line, wall contact, or active cue.

Output requirements:
- 16:9 primary assets for 4K and 1080.
- Optional 9:16 and 1:1 adaptations.
- Transparent backgrounds where appropriate.
- Editable Motion/FCP templates preferred over fixed PNGs.
- Publish controls for text, position, scale, opacity, width, contrast variant, accent visibility, safe margin, arrow endpoints, guide endpoints, and correction state.
- Provide full-resolution stills on bright above-water footage and dark underwater footage before scaling to a full lesson.
```

## Follow-Up Decision

Recommended production path:

1. Use this guide as the visual spec.
2. Build the pilot assets in Motion or a design/generation workflow that can export precise
   transparent assets/templates.
3. Use FCP only to place the assets on the existing validation stills/film.
4. Export full-resolution stills and one `20-40s` validation film.
5. Only after owner approval, decide whether to rebuild a repo-generated asset pack.

No automated asset-pack generation should restart until this manual visual target is approved on
real swim footage.
