# Design Source Assets

This folder stores editable, non-public brand/design source files that should never be referenced directly by runtime code.

Rules:

- Keep source files here or in another non-public design-source directory, not under `public/`.
- Export only approved derived assets into runtime/public paths.
- Treat files here as working masters for future print, apparel, or vendor-prep slices.

Current contents:

- `logo_black.psd`
  - editable source used only to derive approved print-safe logo exports such as `public/logos/logo_black_print.png`
