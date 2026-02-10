# Interaction Regression Checklist

Use this checklist after UI interaction changes.

## Navigation + Press Feel

- [ ] On `/contact` mobile viewport, fixed bottom nav is visible and tappable.
- [ ] Bottom nav `Menu` button toggles open/close state and does not get stuck.
- [ ] Bottom nav `Home` and `Course` controls are links (`<a>`) and navigate correctly.
- [ ] Home page CTA buttons (`FREE COURSE`, `SWIM PROGRAMS`, etc.) feel stronger than utility nav buttons.
- [ ] Utility buttons (drawer controls, icon buttons) feel subtler than CTAs.

## Focus + Keyboard

- [ ] Tabbing shows a consistent focus ring on interactive controls.
- [ ] Opening menu drawer moves focus inside the drawer.
- [ ] `Tab` and `Shift+Tab` stay trapped inside open drawer.
- [ ] Pressing `Escape` closes the drawer.
- [ ] Closing the drawer restores focus to the previously focused trigger.

## Semantics + ARIA

- [ ] Toggle buttons use `aria-pressed` only when they represent an on/off state.
- [ ] Drawer trigger uses `aria-expanded` and updates with state changes.
- [ ] Current-route navigation links expose `aria-current="page"` where appropriate.
- [ ] Disabled controls are non-interactive and visually disabled.

## Course Page

- [ ] `Prev` and `Next` disable at boundaries.
- [ ] `Lessons` toggle opens/closes drawer in both mobile and desktop controls.
- [ ] Lesson selection closes drawer and scrolls to video section.
- [ ] External YouTube link opens in a new tab.

## Touch + Hover

- [ ] Hover-only styling appears only on devices that support hover.
- [ ] Touch interactions do not leave sticky hover artifacts on iOS.
- [ ] Press/tap feedback is immediate on buttons and links.
