# Hybrid Interactive Homepage — Proposal and Comparison

A design proposal for final visual approval. **No application code was changed, nothing was
deployed, and Phase 1 has not started.** Date: 11 Nov 2026.

The hybrid keeps the approved Fable visual design and brings back the living, interactive
character of the original Nectarline sample: a fish that swims slowly through the hero, ambient
light and particles, and gentle pointer response.

## Refined final visual (12 Nov 2026)

The owner approved **Option A, the code-drawn crystal betta, for desktop and mobile**, with
refinements. This is the version shown in the screenshots and the HTML file.

| Refinement requested                                           | What was done                                                                                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop fish 20–25% larger, same proportions                   | About 22% larger: 353 px long at a 1440 px window (was 288 px). Every part scales together                                                                            |
| Behind all content, outside text and button zones              | The route is now built from the measured positions of the header, text and previews. Verified by pixel test at eight widths (see `FISH_ANIMATION_SPEC.md` section 12) |
| Slow, smooth, natural                                          | Same speeds. The fish now eases off through turns and, when it must reverse, turns downward away from the text                                                        |
| Lightweight mobile version preserved                           | Same small fish and 14 particles. Its lane moved up so the fish is inside the first screen, and it turns around off-screen                                            |
| Pause/Resume, reduced motion, off-screen stop, static fallback | All retained and re-tested                                                                                                                                            |
| Approved layout, type, identities, content                     | Unchanged, apart from the three small layout adjustments below                                                                                                        |

Layout adjustments the larger fish required, for your awareness:

1. The hero is 40 px taller (960 px minimum instead of 920) and its content starts 24 px higher,
   so the larger fish fits under the buttons inside a 1440×900 first screen.
2. On desktop the Pause control moved from the hero's top-right corner into the header, beside
   the theme control. This frees the band above the previews for the fish and keeps the control
   reachable while scrolling.
3. On mobile there is 84 px of open space above the previews for the fish's lane (as in the
   first hybrid proposal, where a styling error had left it at 0).

Known limit: on a short laptop screen (for example 1366×768), the fish's lower lane sits partly
below the first screen. It is still visible on its upper pass and beside the previews.

Defects found and fixed while refining: the route was first calculated before web fonts loaded,
using stale positions; a mobile spacing rule was being overridden; and the automatic low-power
fallback switched a slow desktop to the phone's route.

## Deliverables

| #   | Deliverable                              | File                                                                                     |
| --- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Hybrid desktop hero                      | [`screenshots/hybrid-desktop-hero.png`](screenshots/hybrid-desktop-hero.png) (2880×1800) |
| 2   | Hybrid mobile hero                       | [`screenshots/hybrid-mobile-hero.png`](screenshots/hybrid-mobile-hero.png) (780×1688)    |
| 3   | Full desktop homepage                    | [`screenshots/hybrid-desktop-full.png`](screenshots/hybrid-desktop-full.png)             |
| 4   | Full mobile homepage                     | [`screenshots/hybrid-mobile-full.png`](screenshots/hybrid-mobile-full.png)               |
| 5   | Fish animation interaction specification | [`FISH_ANIMATION_SPEC.md`](FISH_ANIMATION_SPEC.md)                                       |
| 6   | Motion and accessibility specification   | [`MOTION_AND_ACCESSIBILITY_SPEC.md`](MOTION_AND_ACCESSIBILITY_SPEC.md)                   |
| 7   | Performance implementation plan          | [`PERFORMANCE_PLAN.md`](PERFORMANCE_PLAN.md)                                             |

Supporting material:

| File                                                             | What it shows                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [`homepage-hybrid-proposal.html`](homepage-hybrid-proposal.html) | The working proposal. Open it in a browser to see the motion and move the pointer over the hero |
| [`hybrid-hero-motion.webm`](hybrid-hero-motion.webm)             | 20-second screen recording: swimming, pointer response, a button hover, pause and resume        |
| `screenshots/fish-closeup.png`                                   | The fish at 3× scale                                                                            |
| `screenshots/fish-route-desktop.png`, `fish-route-mobile.png`    | The swim route (yellow) and the protected text zone (cyan)                                      |
| `screenshots/fish-pose-right-side.png`, `fish-pose-top.png`      | The fish elsewhere on its route                                                                 |
| `screenshots/fish-motion-off.png`                                | The page with motion off (reduced-motion setting)                                               |
| `screenshots/hybrid-tablet-hero.png`                             | 834 px width                                                                                    |

## The fish decision (now closed: Option A approved)

The original sample's fish is a 3D model rendered with the Three.js library. Measured on the live
reference site: the model file is **6.2 MB**, loaded from a third-party file host, plus the 3D
library itself. Who owns or licenses that model is not something this audit could confirm.

The proposal therefore shows an **original fish drawn entirely in code** on a 2D canvas: a
crystal betta with a faceted body, flowing veil tail and translucent fins, in the parent's violet
and pink. Its script is 17.5 KB (5.9 KB compressed) and it downloads nothing.

| Option                                      | Look                                             | Weight                                                                          | Risk                                                                                 |
| ------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **A. Code-drawn fish (shown, recommended)** | Stylized, faceted, clearly "ours"                | About 6 KB compressed, no downloads                                             | None known                                                                           |
| B. Original 3D model, desktop only          | The exact fish from the sample; richer, glossier | About 6.2 MB model plus a 3D library; A remains the mobile and fallback version | Needs your confirmation that you own or may use the model; heavier; more to maintain |

Honest note on A: it is simpler than the 3D original. It reads as a graceful stylized fish, not a
photoreal one. If the original's exact look matters more than weight, choose B; everything else
in the specifications stays the same.

## Compared with both references

| Aspect                    | Original Nectarline sample                                              | Fable visual proposal                                  | Hybrid                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Fish                      | 3D crystal fish, large, in front of the hero image, follows the pointer | None                                                   | Code-drawn crystal fish, **behind** all content, circles the product previews, leans gently toward the pointer |
| Fish and content          | Overlaps the headline on mobile                                         | —                                                      | Never over text, buttons or previews; dims if it nears the text column                                         |
| Background                | Photographic lake and lotus                                             | CSS glow, mist, horizon                                | Fable's atmosphere plus a soft light that follows the pointer and 44 slow particles                            |
| Typography                | Inter Tight light + Instrument Serif italic                             | Same, with a full scale                                | As Fable                                                                                                       |
| Hero layout               | Headline, then two cards below                                          | Headline and CTAs left, previews right                 | As Fable                                                                                                       |
| Product previews          | Two similar violet cards                                                | Distinct cyan Directory and cinematic AutoFlow windows | As Fable, with slight depth movement on pointer                                                                |
| CTAs                      | Small, inside the cards                                                 | Two large buttons, above the fold                      | As Fable                                                                                                       |
| Motion control            | None                                                                    | Reduced-motion respected                               | Visible Pause/Resume button; reduced-motion respected; stops off-screen                                        |
| Mobile                    | Same fish over the text; floating card over a button                    | Static                                                 | Smaller, simpler fish in its own lane; 14 particles; no pointer effects                                        |
| Weight of the hero effect | 6.2 MB model + 3D library + two large photos                            | None                                                   | About 6 KB compressed script                                                                                   |
| Language and claims       | Bengali/English mix; unverified claims                                  | Approved English copy                                  | As Fable                                                                                                       |
| Three product identities  | One violet look                                                         | Parent violet, Directory cyan, AutoFlow cinematic      | As Fable (see `../visual-proposal/screenshots/identity-board.png`)                                             |

## Preserved from the Fable proposal

Everything in section A of the brief: the dark violet identity, typography and editorial
headings, hero composition, both product preview windows, the two prominent CTAs, spacing and
hierarchy, the three product identities, the responsive mobile structure, all eight sections, and
all approved copy including the FAQ wording.

Layout changes from the Fable proposal are limited to two: a "Pause motion" button in the hero,
and on mobile about 84 px of extra open space above the previews, which is the fish's lane.

## Brought back from Nectarline

| Requested                          | In the hybrid                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Signature interactive fish         | Yes: an original crystal fish, always present in the hero                                     |
| Living, dynamic hero background    | Drifting mist, slow particles, a rotating orbit ring, a blinking search caret                 |
| Pointer-responsive movement        | The fish leans toward the pointer; the light follows it; previews shift a few pixels in depth |
| Atmospheric lighting and particles | Soft violet light and 44 motes in violet, pink and cyan                                       |
| Delight and personality            | The fish disappears behind the previews and re-emerges on the other side                      |

## What was verified

Tested in a real browser engine (headless Chromium), not just drawn:

| Check                                                            | Result                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Fish moves on load (desktop and mobile)                          | Yes                                                                     |
| Pointer movement changes the scene                               | Yes                                                                     |
| Pause button stops canvas and CSS motion; label and state update | Yes ("Play motion", `aria-pressed="true"`)                              |
| Resume restarts                                                  | Yes                                                                     |
| Scrolling the hero out of view stops the animation               | Yes; resumes when scrolled back                                         |
| Reduced-motion setting                                           | Nothing moves; the fish is drawn as a still image; visitor can opt in   |
| Pause button reachable by keyboard                               | Yes                                                                     |
| Extra network requests caused by the animation                   | None (only the three web fonts load)                                    |
| Horizontal overflow, script errors                               | None at 1440, 834 and 390 px                                            |
| Both mobile CTAs above the fold at 390×844                       | Yes (button bottoms at 511 and 579 px); the Pause button ends at 716 px |

Frame rate in the headless test was about 40 per second on desktop and 60 on mobile, on a machine
with no graphics card. That is not a measurement of real devices; real-device testing is part of
the performance plan.

One defect was found and fixed during testing: the first low-power rule treated any device with
four or fewer processor cores as weak, which switched an ordinary desktop to the mobile mode. The
threshold is now two.

## Not covered

- Real-device testing, particularly older phones and battery impact.
- Screen-reader testing (the animation layer is hidden from assistive technology by design).
- The light theme of the parent page with the fish.
- Page transitions between routes: specified, not demonstrated, because the proposal is one page.
