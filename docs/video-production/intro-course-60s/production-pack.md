# Course Intro Video 60s Production Pack

## Purpose

Ship one production-ready 60s intro video for the free freestyle course, optimized for:

- adult beginners (`18-99`),
- coaching tone,
- strong watch retention in first 3-5 seconds,
- clear CTA: `Start the free course now`.

## What This Pack Solves

This pack gives you a complete blueprint so you can build in Camtasia without re-planning:

- exact 60s timeline,
- voiceover script,
- scene-by-scene shot type (`app click video`, `still`, `swim footage`),
- on-screen text specs,
- color/visual system matched to freeswimming UI,
- subtitle file (`.srt`) and YouTube publish copy.

## Source Visual Tokens (from app)

Use these tokens so video looks native to the platform.

- Header gradient: `#4F8FE5 -> #62A8FF`
- Primary CTA blue: `#3B82F6 -> #2563EB`
- Page background light gradient family:
  - `#EAF3FF`
  - `#F7FBFF`
  - `#FFFFFF`
- Text primary: `#0F172A`
- Text secondary: `#334155`
- Success accent: `#10B981`
- Border/light panel: `#E2E8F0`

## Typography

Keep typography simple and consistent:

- Headline: `SF Pro Display` (or `Inter` fallback), `Semibold`
- Body: `SF Pro Text` (or `Inter` fallback), `Regular`
- Numbers/badges: same family, `Medium`

Sizes for 1080p canvas:

- H1: `72-84px`
- H2: `44-56px`
- Body: `30-36px`
- Caption/chip: `24-28px`

## Camtasia Project Settings

- Canvas: `1920x1080` (16:9)
- FPS: `30`
- Audio sample rate: `48kHz`
- Color profile: `Rec.709`
- Max transition length: `180-260ms`
- Motion easing: `Ease out` (avoid bouncy effects)

### Project Settings Dialog (exact values)

Use these exact values in the Camtasia `Project Settings` popup you showed:

- `Dimensions`: `FHD (1920x1080)`
- `Width`: `1920`
- `Height`: `1080`
- `Color`: `#EAF3FF` (light brand background; avoids black edge flashes)
- `Frame Rate`: `30 fps`
- `Auto-normalize loudness`: `Off` (recommended for best control)

If you need speed over precision, you can set `Auto-normalize loudness` to `On`, but then still do a final ear-check for pumping.

## Visual Terms (plain language)

These are the terms used in this pack:

- `Overlay`:
  - anything placed on top of video (text, labels, boxes, badges).
  - use when you need to explain a point while footage keeps playing.
- `Chip`:
  - a small rounded label (example: `Drill`, `Learn`, `Optional`).
  - short, 1-2 words only.
- `Card`:
  - a larger rounded box grouping related text or buttons.
  - use when multiple items should be read as one block.
- `Plate`:
  - a semi-transparent background behind text for readability.
  - mainly used on darker swim footage.
- `Padding`:
  - empty space inside a shape between border and text.
  - more padding = calmer, more premium look.

## Where Each Visual Element Is Used In This 60s Video

- `Overlay`:
  - `[0:00-0:03]` hook headline.
  - `[0:03-0:09]` problem bullets.
  - `[0:52-1:00]` CTA text.
- `Chip`:
  - `[0:19-0:31]` lesson labels (`Learn`, `Drill`, `Pass criteria`) as quick callouts.
  - `[0:31-0:41]` optional support labels.
- `Card`:
  - `[0:31-0:41]` support block (`Need extra help?`).
  - `[0:52-1:00]` CTA block with URL.
- `Plate`:
  - any swim shot where white text is hard to read.
  - primary at `[0:00-0:03]` and `[0:41-0:52]`.
- `Padding`:
  - all chips/cards/plates, always consistent to keep visual rhythm.

## Camtasia Build Recipe (step-by-step)

Use this once, then reuse as presets for all future videos.

### 1) Build a base chip preset

1. `Annotations` -> add `Rounded Rectangle`.
2. Fill:
   - color `#FFFFFF`
   - opacity `90%`
3. Border:
   - color `#E2E8F0`
   - thickness `1px`
4. Corner radius: set high (pill look).
5. Shadow:
   - blur medium
   - opacity `12%`
   - soft downward offset
6. Add text on top:
   - font `SF Pro` or `Inter`
   - size `24-28`
   - color `#0F172A`
7. Inner spacing (`padding` target):
   - top/bottom: `12px`
   - left/right: `18px`
8. Select shape + text -> `Group`.
9. Save group to Library as `FS_Chip_Default`.

### 2) Build a base card preset

1. Duplicate the chip preset.
2. Resize to larger container.
3. Increase padding:
   - top/bottom: `20-24px`
   - left/right: `24-28px`
4. Text sizes:
   - heading `44-56`
   - body `30-36`
5. Save as `FS_Card_Default`.

### 3) Build a dark-footage text plate preset

1. Add `Rounded Rectangle`.
2. Fill:
   - color `#0F172A`
   - opacity `58%`
3. Border: none.
4. Radius: `12px`.
5. Text:
   - color `#FFFFFF`
6. Padding:
   - top/bottom: `16px`
   - left/right: `22px`
7. Save as `FS_Plate_DarkFootage`.

### 4) Build CTA button preset

1. Add rounded rectangle.
2. Fill gradient:
   - top `#3B82F6`
   - bottom `#2563EB`
3. Text:
   - `Semibold`
   - white
4. Padding:
   - top/bottom `14-16px`
   - left/right `28-34px`
5. Save as `FS_Button_Primary`.

### 5) Apply in timeline consistently

- Keep visual elements on dedicated tracks:
  - `Track 1`: base footage
  - `Track 2`: app captures
  - `Track 3`: plates/cards
  - `Track 4`: text/chips
  - `Track 5`: logo/CTA accents
- Never freehand-style a new chip/card mid-edit.
- Always duplicate from Library presets.

## 60s Master Timeline (Locked)

### [0:00-0:03] Hook (swim footage + headline)

- Shot type: `swim footage` (tight shot, clean freestyle glide).
- On-screen text:
  - Line 1: `Learn freestyle as an adult`
  - Line 2: `Without confusion`
- Voiceover:
  - `Learning freestyle as an adult should feel simple.`

### [0:03-0:09] Problem framing (still + subtle UI movement)

- Shot type: `still` (soft background gradient + 2-3 quick phrases).
- Text sequence (stagger 0.8s):
  - `Too many random tips`
  - `No clear order`
  - `Hard to know when you're actually ready`
- Voiceover:
  - `Most people get too many random tips and no clear progression.`

### [0:09-0:19] Product reveal (app click footage)

- Shot type: `app click video` (home -> course entry).
- Focus:
  - logo/header,
  - course card,
  - clear progress context.
- Voiceover:
  - `Freeswimming gives you one step-by-step system with short lessons, clear drills, and simple checkpoints.`

### [0:19-0:31] How lesson works (app click footage)

- Shot type: `app click video`.
- Show:
  - lesson title,
  - goal section,
  - drill section,
  - pass criteria,
  - done action.
- Voiceover:
  - `Every lesson tells you what to focus on, what to practice, and exactly what “done” looks like before you move on.`

### [0:31-0:41] Trust + support (mixed still/app)

- Shot type: `app click video` for support card + `still` for emphasis words.
- Show:
  - Need extra help card,
  - optional support options.
- Voiceover:
  - `If you need help, support options are there. If not, keep progressing in order.`

### [0:41-0:52] Outcome framing (swim footage + app progress)

- Shot type: split sequence:
  - 2s swim footage,
  - 2s app progress,
  - 2s swim footage.
- Voiceover:
  - `The goal is relaxed, repeatable freestyle you can trust, one small win at a time.`

### [0:52-1:00] CTA close (app + founder face optional)

- Shot type:
  - primary: `app CTA screen` + animated button highlight.
  - optional last 2s: founder face shot for credibility.
- Text:
  - `Start the free course now`
  - `freeswimming.org`
- Voiceover:
  - `Start the free course now at freeswimming.org.`

## Shot-Type Rules (10/10 UX)

- Use `app click video` when teaching flow/actions.
- Use `still` when framing concept quickly (faster readability).
- Use `swim footage` for emotion, aspiration, and rhythm breaks.
- Do not stay on one shot type longer than ~8-10 seconds.

## Overlay Design System

Use consistent overlay chips/cards:

- Chip background: `rgba(255,255,255,0.90)`
- Chip border: `1px #E2E8F0`
- Chip radius: `14px`
- Text color: `#0F172A`
- Shadow: `0 8px 24px rgba(15,23,42,0.12)`

For dark swim shots:

- Text plate background: `rgba(15,23,42,0.58)`
- Text color: `#FFFFFF`
- Plate radius: `12px`
- Padding: `16px vertical`, `22px horizontal`

### Overlay spacing rules (fixed)

- Chip text padding: `12px vertical`, `18px horizontal`
- Card text padding: `20-24px vertical`, `24-28px horizontal`
- Minimum gap between stacked overlays: `16px`
- Safe margin from screen edge: `64px` desktop, `90px` if content may be reused in vertical crops

## Motion and Transitions

- Default cut cadence: every `1.8-3.5s` depending on spoken phrase.
- Use 2 transition types only:
  - `Fade` (`120-180ms`)
  - `Position slide` (`180-240ms`, max 24px movement)
- Avoid zoom-heavy style and complex wipes.

## Audio Mix (Target)

- Voiceover LUFS: `-16` (integrated)
- Music bed LUFS: `-27` to `-24`
- Peak limiter: `-1.0 dB`
- Duck music under voice by `-8 dB`

## Founder Shot Guidance

Use founder shot if available and natural:

- Keep to `1.5-2.5s` near ending.
- One short line max, no long monologue.
- If not strong on camera yet, skip founder and keep app CTA ending.

## Final Voiceover Script (exact)

Learning freestyle as an adult should feel simple.  
Most people get too many random tips and no clear progression.  
Freeswimming gives you one step-by-step system with short lessons, clear drills, and simple checkpoints.  
Every lesson tells you what to focus on, what to practice, and exactly what done looks like before you move on.  
If you need help, support options are there. If not, keep progressing in order.  
The goal is relaxed, repeatable freestyle you can trust, one small win at a time.  
Start the free course now at freeswimming.org.

## YouTube Publish Pack

- Title:
  - `Learn Freestyle as an Adult (Step-by-Step Free Course)`
- Description first lines:
  - `Start free: https://freeswimming.org`
  - `A step-by-step freestyle course for adult learners who want calm, repeatable progress.`
- Tags:
  - `freestyle swimming, adult learn to swim, swim drills, swimming technique, beginner freestyle`
- Thumbnail:
  - one strong swim frame + one clean app frame + short text:
    - `Adult Freestyle Made Simple`

## Export Settings

- Format: `MP4`
- Resolution: `1920x1080`
- FPS: `30`
- Bitrate target: `12-16 Mbps`
- Audio: `AAC 320 kbps`

## Acceptance Checklist

- Runtime is `59-61s`
- First hook visible within `0.5s`
- CTA appears clearly in last `8s`
- No text overlap with mobile-safe zones in source captures
- Subtitles included and synced
- Brand colors match app tokens
