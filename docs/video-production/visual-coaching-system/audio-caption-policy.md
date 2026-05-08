# Audio And Caption Policy

## Audio Roles

| Layer      | Role                             | Rule                                          |
| ---------- | -------------------------------- | --------------------------------------------- |
| voiceover  | primary explanation              | clear, calm, concise                          |
| pool sound | realism and motion context       | low enough to never compete with voice        |
| music      | optional energy or marketing use | never compete with instruction                |
| silence    | focus                            | allowed when movement should speak for itself |

## Voiceover Rules

- Explain what the viewer should see.
- Keep sentences short.
- Avoid repeating every visible label.
- Do not overtalk slow-motion moments.
- End with a practical cue the swimmer can use.

## Pool Sound Rules

- Keep pool sound subtle in course lessons.
- Use pool sound more freely in social hooks when it adds energy.
- Reduce distracting splashes when voiceover is active.

## Music Rules

- Music is optional.
- Course lessons can avoid music if it reduces clarity.
- Marketing/social clips may use music, but instruction remains primary.
- Do not use licensed music unless rights are clear and recorded.

## Loudness Guidance

Working review target:

- voice-led web/social export: approximately `-16 LUFS` integrated,
- true peak: `<= -1 dBTP`.

This is a Phase 1 working target. Final platform-specific audio settings must be verified during the FCP recipe and pilot phases before they become production-ready.

## Caption Strategy

Captions support:

- accessibility,
- mobile silent playback,
- social comprehension,
- future localization.

Captions must be treated as a separate text layer from coaching overlays.

## Caption Placement

### `16:9`

- Default: lower safe zone.
- Move captions if lower thirds or swimmer key motion occupy the bottom.
- Avoid crowding split-screen labels.

### `9:16`

- Keep captions away from platform UI zones.
- Use fewer simultaneous coaching labels.
- If captions are burned in, test on phone before approval.

### `1:1`

- Keep captions short.
- Avoid stacking captions and coaching callouts in the same bottom area.

## Caption Copy Rules

- Use natural spoken language.
- Keep line length short.
- Avoid unexplained jargon.
- Preserve technique terms consistently:
  - catch,
  - body line,
  - rotation,
  - kick timing,
  - breathing rhythm.

## Localization Readiness

Text-bearing overlays and captions should be replaceable later.

Do not flatten critical long-form instructional text into non-editable assets unless an approved template or asset system explicitly defines how localization variants are generated.

## Review Rule

Every final review must check:

- voice intelligibility,
- caption readability on phone,
- caption and overlay collision,
- music rights if music is present,
- no private or identifying audio content.
