# Performance Implementation Plan — Hybrid Hero

How the living hero will be built so it never delays the page or drains a device. A plan for
approval; nothing here is implemented in the application yet.

## 1. What the proposal measures today

From `homepage-hybrid-proposal.html`, in headless Chromium:

| Measure                                                                          | Value                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Animation script                                                                 | 25.9 KB, 7.6 KB compressed (this includes review-only test hooks that will not ship)                                                                                                                          |
| Libraries                                                                        | None                                                                                                                                                                                                          |
| Images, models, video                                                            | None                                                                                                                                                                                                          |
| Network requests caused by the animation                                         | 0                                                                                                                                                                                                             |
| Drawing surface                                                                  | One 2D canvas                                                                                                                                                                                                 |
| Script time for one animation frame (simulate and issue drawing commands)        | 0.07 ms desktop, 0.04 ms economy and mobile, measured over 600 frames. Rasterizing is extra and not included                                                                                                  |
| Frames drawn when the hero is off-screen, the tab is hidden, or motion is paused | 0 (verified)                                                                                                                                                                                                  |
| Frame rate in the test                                                           | About 30 per second on a machine with no graphics card. The rate was the same with full and economy drawing, so the limit there is page compositing (blur and large gradients), not the fish. Indicative only |

For comparison, the original sample's hero loads a 6.2 MB 3D model, a 3D library and two large
photographs.

**Not measured:** real phones and laptops, battery use, Core Web Vitals on a deployed page.

## 2. Loading: the animation never delays the page

| Rule                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- |
| The hero's text, buttons and previews are server-rendered HTML and CSS. They do not wait for the animation     |
| The animation is a separate client component, loaded after the page is interactive (dynamic import, idle time) |
| It is loaded only on the parent homepage, never on Directory or AutoFlow routes                                |
| The canvas has fixed CSS dimensions from the start, so it causes no layout shift                               |
| The largest visible element for loading metrics is the headline text, not the canvas                           |
| If the script fails or is blocked, the static hero is the complete experience                                  |
| No animation library is added to the parent page (decision D-10). GSAP stays in the Directory                  |

## 3. Running cost

| Technique                             | Detail                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One animation loop                    | A single `requestAnimationFrame` loop drives fish, particles, light and the preview shift                                                                          |
| Stop when not visible                 | An intersection observer stops the loop when less than 5% of the hero is on screen                                                                                 |
| Stop when the tab is hidden           | Page-visibility check                                                                                                                                              |
| Stop when paused or reduced           | No loop runs at all; one still frame is drawn                                                                                                                      |
| Resolution cap                        | Canvas at most 1.5× device pixels (1.25× in lightweight mode)                                                                                                      |
| Frame cap on mobile                   | 30 frames per second                                                                                                                                               |
| Adaptive quality                      | If frames stay slower than about 35 per second for roughly two seconds, switch to economy drawing for the rest of the visit. The route and fish size do not change |
| Cheap drawing                         | Gradients and paths only. No blur filters or shadows on the canvas; the glow is a radial gradient; the pointer light repaints only its own 840 px square           |
| Pointer handling                      | One passive listener; the position is only stored, and all work happens in the animation loop                                                                      |
| Layout changes                        | Recalculated 150 ms after a resize, after web fonts load, and when the hero changes size                                                                           |
| No per-frame allocation in production | Reuse point arrays and gradients where possible (the proposal allocates small objects per frame; to tidy at implementation)                                        |

## 4. Lightweight modes

Phone mode (hero narrower than 721 px, or touch as the primary pointer) has its own lane and
smaller fish. Economy drawing (two or fewer processor cores, 2 GB or less memory, data-saver, or
the adaptive check) keeps the route and only draws more cheaply. Phone mode always uses economy
drawing.

In phone mode:

| Reduction                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One smaller fish with 16 segments, flat shading, a single tail layer                                                                                                                                                     |
| 14 particles instead of 44                                                                                                                                                                                               |
| No pointer light, no pointer response, no preview shift (economy on desktop keeps the pointer lean)                                                                                                                      |
| 30 frames per second                                                                                                                                                                                                     |
| **To add at implementation:** on mobile, size the canvas to the fish's lane only (about 390×170 px) instead of the whole hero. The proposal's mobile canvas covers the full hero (about 390×1,316 px), which is wasteful |

Two defects were found and fixed during testing: the automatic fallback originally switched a
slow desktop to the phone's route (the two modes are now separate), and an earlier threshold of four cores wrongly put
ordinary desktops into lightweight mode.

## 5. Other hero costs to watch

The fish is not the only cost in the hero.

| Item          | Note                                                                                                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backdrop blur | Used on the Directory preview, approval chip, sticky header and Pause button. Blur over a moving canvas is the most expensive effect on the page. If real-device tests show dropped frames, replace the previews' blur with a solid translucent fill first |
| Mist          | Two large blurred elements animated with `transform` only (compositor-friendly)                                                                                                                                                                            |
| Orbit rings   | `rotate` only                                                                                                                                                                                                                                              |
| Web fonts     | Three families. In the application they will be self-hosted with `next/font`, as the repository already does, with `font-display: swap`                                                                                                                    |

## 6. Budgets for the built page

Targets to be confirmed against a deployed build on real devices; none is a current measurement.

| Budget                          | Target                                             |
| ------------------------------- | -------------------------------------------------- |
| Animation code                  | 8 KB compressed or less, without the test hooks    |
| Added requests                  | 0 (1 if split into its own chunk)                  |
| Layout shift from the hero      | 0                                                  |
| Time for the headline to appear | Unchanged by the animation                         |
| Frame rate while running        | 50+ on a mid-range laptop; 30 on a mid-range phone |
| Main-thread work per frame      | Under 4 ms desktop, under 6 ms mobile              |
| CPU when the hero is off-screen | No animation work                                  |

If option B (the original 3D model on desktop) is chosen, add: model and library loaded only on
desktop, only after the page is idle, only on a fast connection, with the code-drawn fish shown
until they arrive; and the model compressed well below its current 6.2 MB.

## 7. Implementation steps (after approval, in Phase 2)

1. Build the static hybrid hero (no animation) and confirm it matches the approved design.
2. Add the animation as a lazy client component with the canvas, the Pause control and the
   reduced-motion behavior.
3. Add the visibility, tab and adaptive-quality rules; add the mobile lane-sized canvas.
4. Test on real devices: one older Android phone, one iPhone, one low-end laptop, one desktop.
   Record frame rate, CPU and battery impact over five minutes.
5. Measure Core Web Vitals on a deployed preview with and without the animation.
6. Decide on backdrop blur from the device results.
7. Report results before the homepage is considered complete.

## 8. Risks

| Risk                                                       | Mitigation                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| Dropped frames on older phones                             | Lightweight mode, frame cap, lane-sized canvas, adaptive fallback          |
| Battery drain from a constantly running loop               | Stops off-screen and in hidden tabs; visitor can pause                     |
| Blur over moving content is slow on some graphics hardware | Measured in step 4; remove blur from previews if needed                    |
| The animation distracts from the buttons                   | Route and fade rules; to be checked in owner review and, later, with users |
| A future change moves the previews and breaks the route    | The route is computed from the live layout, not fixed coordinates          |
