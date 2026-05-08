# Visual Coaching System

## Purpose

This folder is the source of truth for FreeSwimming visual coaching video production.

Phase 1 defines the design language, format rules, lesson structure, production architecture, naming, exports, asset requirements, and Final Cut Pro verification plan before reusable assets, templates, or pilot videos are created.

Generated assets must not be treated as production-ready until a real FCP/Motion pilot has been approved on representative swim footage.

## Status

- Phase: `Phase 1 complete; manual FCP/Motion pilot pending`
- Scope: production docs and pilot planning
- Runtime impact: none
- Asset impact: no generated asset pack is approved; final overlays/templates must be proven in FCP/Motion first
- FCP impact: no recipe is production-ready until verified in the dedicated recipe brief

## Brand Source

Use the existing FreeSwimming brand system. Do not create a new brand or sub-brand.

- Brand usage: `docs/design/brand-logo-usage.md`
- Canonical symbol: `public/logos/logo_master_symbol.png`
- Brand pack: `public/logos/brand/`
- Typography: `Manrope`
- Core palette:
  - blue: `#2856D7`
  - ink: `#101828`
  - slate: `#475467`
  - white: `#FFFFFF`

## Required Formats

The visual system must work across these baseline formats:

| Format | Primary use                                                       | Design implication                                                   |
| ------ | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `16:9` | course videos, website lessons, desktop review, landscape exports | most complete coaching layout with wider labels and comparison views |
| `9:16` | social vertical cutdowns, mobile-first technique cues             | tighter safe zones, fewer simultaneous overlays, larger text         |
| `1:1`  | social feed, ads, compact comparisons                             | centered swimmer priority, short text, balanced top/bottom overlays  |

All formats use one FreeSwimming visual language. They must not become separate design systems.

## Document Map

- `brand-extension.md`: video use of existing FreeSwimming brand assets.
- `format-and-channel-matrix.md`: 16:9, 9:16, and 1:1 rules.
- `overlay-language.md`: overlay components, hierarchy, sizing, and anti-patterns.
- `lesson-blueprints.md`: course lesson and social cutdown structure.
- `production-architecture.md`: storage, source/generated/public boundaries, and workflow structure.
- `naming-and-file-structure.md`: stable IDs, folders, versions, and filename patterns.
- `export-system.md`: export profiles, review/final naming, and delivery boundaries.
- `asset-requirements.md`: future asset pack requirements and manifest fields.
- `audio-caption-policy.md`: voiceover, pool sound, music, subtitle, and caption rules.
- `fcp-recipe-verification-plan.md`: how recipes become verified later.
- `review-checklist.md`: required checks before a video is approved.
- `unknowns-and-decisions.md`: confirmed decisions and open items to verify.

## Phase Boundaries

Phase 1 may:

- define rules,
- define architecture,
- define naming and export policies,
- define asset requirements,
- define review and verification standards.

Phase 1 must not:

- create final overlay assets,
- create Final Cut Pro templates,
- edit a pilot lesson,
- add runtime website code,
- place production source files in `public/`,
- publish unverified FCP instructions as production-ready.

## Operating Rule

Every later asset, template, FCP recipe, and pilot export should trace back to these Phase 1 rules. If a later production need contradicts these rules, update this system explicitly instead of creating one-off visual behavior.
