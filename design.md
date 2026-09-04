# Design - Mary.MattyMovies

This is the locked design system for Mary.MattyMovies. It keeps the existing
Mary & Matty / My Melody identity while giving the home, details, and player
pages one considered after-dark cinema voice.

## Genre

Atmospheric, with an intimate rose-cinema tone.

## Macrostructure Family

- Home: Marquee Hero with a film-library browse surface below it.
- Details: Split Studio, with the poster as the visual counterweight to credits and actions.
- Player: Workbench-minimal, where playback stays dominant and chrome is quiet.

## Theme

- Canvas: near-black berry, never pure black.
- Surfaces: plum-black and mulberry for clear depth.
- Accent: radiant rose, concentrated around the featured film, primary actions, focus, and selected states.
- My Melody: a small signature asset, never a replacement for hierarchy.

## Typography

- Display: DM Serif Display, 400, roman only.
- Body: DM Sans, 400-700.
- Display tracking: normal.

## Spacing

Named 4-point spacing tokens live in `tokens.css`. Layouts use broad page gutters
and varied vertical rhythms instead of identical section padding.

## Motion

- Easing: named ease-out / ease-in-out tokens.
- Motion: a gentle My Melody float plus small transform feedback; light is static and never decorative animation.
- Reduced motion: near-instant transitions with no repeating animation.

## Interaction

- Focus rings use the rose focus token.
- Search is a quiet command surface, not a decorative overlay.
- Watchlist feedback remains functional and fixed-position.

## What Pages Share

- Mary.MattyMovies wordmark, rose placement, typography, card treatment, and button voice.
- A dark berry canvas, elevated plum surfaces, and cinematic rose light around primary moments.
- The same search and watchlist affordances.

## Per-page Allowances

- Home may use the existing My Melody hero image as a single signature moment.
- Details may use the poster as the primary visual proof.
- Player is functional and avoids decorative treatment.
