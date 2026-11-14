# Motion and Accessibility Specification — Parent Homepage

Covers all motion on the AIKitFinder parent homepage, of which the fish is one part. For approval;
not yet implemented in the application.

## 1. Principles

1. Motion supports the content and never competes with the two product buttons.
2. Only a few things move at once, and slowly.
3. Everything works, and reads the same, with motion off.
4. The visitor is always in control.

## 2. Motion inventory

| Motion                      | Where                                     | Detail                                                                                                                                     | Persistent? |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| Hero entrance               | Kicker, headline, copy, buttons, previews | Rise 14 px and fade in, staggered 60–80 ms, 0.8 s, once                                                                                    | No          |
| Fish                        | Hero background                           | See `FISH_ANIMATION_SPEC.md`                                                                                                               | Yes         |
| Particles and pointer light | Hero background                           | Slow rise and twinkle; light follows the pointer                                                                                           | Yes         |
| Mist                        | Hero background                           | Two bands drift sideways, 48 s and 64 s per pass                                                                                           | Yes         |
| Orbit rings                 | Behind the previews                       | One rotation per 140 s and 200 s                                                                                                           | Yes         |
| Search caret                | Directory preview                         | Blinks about once a second (a 2 px line)                                                                                                   | Yes         |
| Preview depth               | Hero previews                             | Shift 5–13 px with the pointer                                                                                                             | On pointer  |
| Section reveal              | Each section                              | Fade up 18 px, 0.8 s, once, when 10% into view                                                                                             | No          |
| Header                      | Top bar                                   | Becomes a blurred panel after 24 px of scroll                                                                                              | No          |
| Card hover                  | Product cards                             | Lift 4 px, brighter border, soft accent glow, 0.35 s                                                                                       | No          |
| Button hover                | All buttons                               | Lift 1 px; arrow moves 3 px, 0.25 s                                                                                                        | No          |
| FAQ                         | Questions                                 | Plus icon rotates to a cross, 0.3 s                                                                                                        | No          |
| Sign-up overlay             | Modal                                     | Fade and slight scale in, 0.2–0.3 s; on mobile the sheet slides up                                                                         | No          |
| Page transitions            | Between routes                            | A short cross-fade of the page content (about 0.25 s); the header stays still. Uses the view-transition approach already in the repository | No          |

Easing throughout: one ease-out curve (`cubic-bezier(0.2, 0.7, 0.2, 1)`).

## 3. What is deliberately absent

| Avoided                           | Status                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Excessive parallax                | Only the 5–13 px preview shift; nothing is tied to scroll position                                    |
| Fast or chaotic movement          | Fastest moving object is the fish at about 60 px per second                                           |
| Flashing                          | Nothing flashes. The caret is a 2 px line; particles twinkle slowly between 5% and 65% opacity        |
| Everything moving at once         | Text, buttons, cards and sections are still after they appear                                         |
| Distraction from the buttons      | No motion on or beside the buttons except their own hover state; the fish swims below and around them |
| Scroll hijacking, pinned sections | None                                                                                                  |
| Autoplay video or sound           | None                                                                                                  |

## 4. Pause/Resume control

| Property | Specification                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Purpose  | Lets anyone stop all persistent decorative motion (WCAG 2.2.2 Pause, Stop, Hide)                                           |
| Position | Desktop and tablet: in the header, beside the theme control. Phone: under the status lines, inside the first screen        |
| Label    | "Pause motion" / "Play motion", with a matching icon. Always visible text, not icon-only                                   |
| Element  | A real button, 44 px high, with `aria-pressed`                                                                             |
| Effect   | Stops the fish, particles, pointer light, mist, orbit rings and caret. Hover states and one-time reveals are unaffected    |
| Memory   | The choice is stored on the device and applied on the next visit                                                           |
| Keyboard | In the normal tab order (in the header on desktop; after the two product buttons on a phone); operated with Enter or Space |

## 5. Reduced motion

When the operating system asks for reduced motion:

- No entrance, reveal, hover-lift or overlay animation. Content is simply present.
- The fish, particles and mist do not move. The fish is drawn once as a still image.
- The control shows "Play motion". A visitor may opt in to the canvas animation; the CSS
  animations stay off.
- Layout, content and contrast are identical. See `screenshots/fish-motion-off.png`.

## 6. Accessibility requirements

| Requirement                                          | How it is met                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decorative motion can be paused (WCAG 2.2.2)         | The Pause/Resume control                                                                                                                                     |
| No flashing (WCAG 2.3.1)                             | Nothing flashes                                                                                                                                              |
| Motion from interaction can be disabled (WCAG 2.3.3) | Reduced-motion setting and the control                                                                                                                       |
| Animation is not announced                           | Canvas and decorative layers are `aria-hidden`                                                                                                               |
| Animation never blocks interaction                   | Canvas has no pointer events and sits behind content                                                                                                         |
| Text contrast is unaffected                          | The fish never passes behind text at full strength; it fades to 16% inside the text zone. All text pairs measured at 4.83:1 or better on the base background |
| Focus is always visible                              | 2 px violet focus ring with offset on every control                                                                                                          |
| Targets                                              | At least 44 px high, including the Pause control                                                                                                             |
| Keyboard order                                       | Skip link, header (including the Pause control on desktop), product buttons, then sections                                                                   |
| Works without JavaScript                             | All content and links render; only the animation and overlays need script                                                                                    |
| Overlays                                             | Focus is trapped, Escape closes, focus returns to the trigger (behavior specified in Phase 0A wireframes)                                                    |

**To verify at implementation:** contrast of the status lines and scroll cue with the fish
directly behind them (the route keeps it below the status lines, but this must be measured on the
built page), and a screen-reader pass.

## 7. Acceptance checks for the built page

- [ ] With reduced motion on, nothing on the page moves.
- [ ] The Pause control stops every persistent motion and is announced with its state.
- [ ] Scrolling past the hero stops the animation loop (no frames are drawn).
- [ ] The fish is never in front of text, a button or a preview at any viewport from 320 to 1920 px.
- [ ] Both product buttons are fully usable while the animation runs.
- [ ] No element flashes more than three times in a second.
- [ ] The page is fully usable by keyboard with the animation running.
