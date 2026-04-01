# FreeSwimming Brand Usage

## Canonical Source

- Symbol source: `/Users/stianvikra/freeswimming/public/logos/logo_master_symbol.png`
- Local UI font: `/Users/stianvikra/freeswimming/app/fonts/Manrope-VariableFont_wght.ttf`
- Public font for PDF/export views: `/Users/stianvikra/freeswimming/public/fonts/Manrope-VariableFont_wght.ttf`
- Generated asset pack: `/Users/stianvikra/freeswimming/public/logos/brand/`
- Apparel-ready exports: `/Users/stianvikra/freeswimming/public/logos/brand/apparel/`
- Generated manifest: `/Users/stianvikra/freeswimming/public/logos/brand/manifest.json`

## Chosen Direction

- Typeface: `Manrope`
- Symbol role: angular, compact, structural
- Wordmark role: calm, readable, premium without feeling formal or corporate
- Primary color logic:
  - symbol: blue
  - wordmark: ink
  - domain suffix: slate, never louder than the core name
  - accent: blue on the symbol and optionally on `Swim.`
- Core palette:
  - blue: `#2856D7`
  - ink: `#101828`
  - slate support: `#475467`
  - reverse white: `#FFFFFF`

## Usage Rules

- `symbol-*`
  - Use for compact UI placements where the page title or nearby copy already names the product.
  - Current use: `PageIntro`, compact course/video surfaces.

- `wordmark-name-*`
  - Use for text-first brand placement where `freeswimming` should appear without the domain suffix.
  - Current use: reusable pack only for now.

- `wordmark-domain-*`
  - Use for text-only domain branding where the full website identity should read cleanly without the symbol.
  - Current use: reusable pack only for now.

- `tagline-inline-*`
  - Use when `Learn. Drill. Swim.` should stand alone on one line.
  - Current use: reusable pack only for now.

- `lockup-domain-*`
  - Use for primary recognition surfaces where users should immediately know they are inside FreeSwimming.
  - Current use: top navigation, menu drawer, workout/program PDF headers.

- `lockup-tagline-*`
  - Use when the method statement should appear as a compact supporting brand signal, not the main page title.
  - Current use: homepage method strip.

- `tagline-stacked-*`
  - Use on spacious, brand-forward surfaces where the three-word rhythm can breathe vertically.
  - Current use: homepage hero support mark.

- `stacked-domain-*`
  - Use where vertical room is available and a taller lockup feels more intentional than a long horizontal wordmark.
  - Current use: compatibility export and reusable brand-pack asset only for now.

- `full-lockup-horizontal-*`
  - Use for wide placements where the symbol, `freeswimming`, and `Learn. Drill. Swim.` should travel together.
  - Current use: apparel, signage, sponsor sheets, and reusable pack asset.

- `full-lockup-vertical-*`
  - Use for taller placements where the symbol, `freeswimming`, and `Learn. Drill. Swim.` should stack with calm spacing.
  - Current use: apparel back prints, posters, and reusable pack asset.

## Website Mapping

- Header: `lockup-domain-white`
- Menu drawer: `lockup-domain-primary`
- Home hero: `lockup-domain-primary`
- Home supporting brand statement: `tagline-stacked-primary`
- Home method strip: `lockup-tagline-primary`
- Page intros: `symbol-primary`
- Compact course/video overlays: `symbol-primary`
- Favicon + PWA icons + apple-touch icon: new symbol-based app icon set derived from the same canonical source

## PDF Mapping

- Program PDF: `lockup-domain-ink`
- Workout PDF: `lockup-domain-ink`
- Poolside Note: `lockup-domain-ink`
- PDF/export font: public Manrope file via absolute URL

## Apparel Mapping

- Transparent apparel masters live in `/Users/stianvikra/freeswimming/public/logos/brand/apparel/`
- Recommended apparel-ready families:
  - front chest or cap: `symbol-*`
  - narrow front print: `lockup-domain-*`
  - slogan-only placement: `tagline-inline-*` or `tagline-stacked-*`
  - wide shirt or banner: `full-lockup-horizontal-*`
  - tall back print or poster: `full-lockup-vertical-*`
- Apparel exports are higher-resolution transparent PNGs than the standard web pack.

## Compatibility Files

These are regenerated from the new system so older references keep rendering the new brand direction:

- `/Users/stianvikra/freeswimming/public/logos/01_icon_transparent.png`
- `/Users/stianvikra/freeswimming/public/logos/01_icon_white_transparent.png`
- `/Users/stianvikra/freeswimming/public/logos/03_stacked_transparent.png`
- `/Users/stianvikra/freeswimming/public/logos/logo_black_print.png`
- `/Users/stianvikra/freeswimming/app/favicon.ico`
- `/Users/stianvikra/freeswimming/public/icons/icon-192.png`
- `/Users/stianvikra/freeswimming/public/icons/icon-512.png`
- `/Users/stianvikra/freeswimming/public/icons/icon-maskable-512.png`
- `/Users/stianvikra/freeswimming/public/apple-touch-icon.png`

## Format Notes

- The pack includes transparent PNGs for standard web/app use.
- The pack also includes SVG wrappers for compatibility and easy placement in design tools.
- Because the canonical symbol source is currently a PNG, the generated SVG files wrap high-quality raster exports rather than introducing a newly redrawn symbol.
- If a future embroidery or print vendor requires path-native vector production files, treat that as a separate export-prep step rather than silently redrawing the symbol in this repo.

## Regeneration

Run:

```bash
python3 scripts/generate-brand-assets.py
```

This refreshes:

- the full PNG + SVG wrapper logo pack,
- `manifest.json`,
- compatibility logo files used by legacy paths.
