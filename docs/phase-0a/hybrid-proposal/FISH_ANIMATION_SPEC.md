# Fish Animation — Interaction Specification

Describes the behavior demonstrated in `homepage-hybrid-proposal.html`. Values are the ones
running in that file. A specification for approval; not yet implemented in the application.

## 1. Role

A single decorative fish that gives the parent homepage hero a living quality. It carries no
information, is hidden from assistive technology (`aria-hidden`), and never receives pointer
events. The page is complete without it.

## 2. Appearance

| Part    | Description                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| Body    | Front half of the length; pale lilac nose shading to violet; faceted light and dark panels for a crystal look |
| Tail    | Back half: a translucent veil that opens toward the end, with fine rays, violet fading to pink                |
| Fins    | Translucent dorsal and ventral fins, one pectoral fin that beats slowly, a small dark eye                     |
| Halo    | A faint violet glow around the body                                                                           |
| Size    | Desktop: 20% of the hero width, between 220 and 320 px long. Mobile: 116–150 px                               |
| Opacity | Desktop 0.9 in open water; mobile 0.72                                                                        |

See `screenshots/fish-closeup.png`.

## 3. Layering

```
top      header, headline, copy, buttons, product previews, approval chip
         ─────────────────────────────────────────────────────────────────
         fish, particles, pointer light        (one canvas, no pointer events)
bottom   mist, horizon line, background gradients
```

The fish is always behind content. Where a product preview covers its route, the fish passes
behind the preview and re-emerges.

## 4. Route

The fish follows a closed loop through open space. See `screenshots/fish-route-desktop.png` and
`fish-route-mobile.png` (route in yellow, protected text zone in cyan).

**Desktop:** along the band beneath the buttons, left to right → up the far right side (mostly
hidden behind the AutoFlow preview) → back across the top, above the previews → down the gap
between the text and the previews → returns to the lower band. The loop is computed from the
actual position of the preview area, so it adapts to the layout.

**Mobile:** one horizontal lane in the open space between the status lines and the previews,
swimming across and back.

| Property      | Desktop                         | Mobile              |
| ------------- | ------------------------------- | ------------------- |
| Speed         | 36–62 px per second             | 24–50 px per second |
| One full loop | Roughly 80 seconds              | Roughly 20 seconds  |
| Turning       | At most 0.75 radians per second | Same                |
| Vertical bob  | ±12 px, slow                    | ±5 px               |

There are no sudden starts, darts or direction snaps. When the fish reverses direction its fins
fold as it turns, as a real fish seen side-on would appear.

## 5. Swimming motion

- A wave travels down the body about 2.4 radians per second, small at the head and largest at the
  tail tip (5.5% of body length).
- The tail edges and fin heights ripple by about 10–15%.
- The pectoral fin beats about once every two seconds.

## 6. Protection of content

| Rule                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The route avoids the headline, copy, buttons and status lines                                                                                                                       |
| A protected zone surrounds the text column. If the fish's head enters it (for example when drawn by the pointer), the fish fades to 16% opacity (20% on mobile) over about a second |
| The canvas ignores pointer events, so it can never block a click                                                                                                                    |
| The fish never appears in front of text, buttons or previews                                                                                                                        |

## 7. Pointer interaction (desktop only)

| Behavior         | Detail                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Curiosity        | While the pointer has moved within the last 4 seconds, the fish's target leans toward it by 30% of the distance, capped at 150 px. The fish drifts closer; it does not chase |
| Easing           | Pointer position is smoothed (about half a second to settle); interest fades in and out over about a second                                                                  |
| Light            | A soft violet light (420 px radius, 5–12% strength) follows the smoothed pointer                                                                                             |
| Particles        | Shift up to 14 px against the pointer, scaled by depth                                                                                                                       |
| Product previews | Move 5–13 px in depth (the nearer layer moves more)                                                                                                                          |
| Pointer leaves   | After 4 seconds without movement everything returns to its idle state                                                                                                        |
| Touch            | Ignored. There is no touch-follow behavior                                                                                                                                   |

No click, drag or scroll interaction. The original sample reacted to scroll speed; that is
intentionally not carried over.

## 8. Particles and light

| Item          | Desktop                                                  | Mobile |
| ------------- | -------------------------------------------------------- | ------ |
| Particles     | 44, radius 0.5–2 px                                      | 14     |
| Movement      | Rise 4–11 px per second with a slight sway; slow twinkle | Same   |
| Colors        | 60% violet, 25% pink, 15% cyan                           | Same   |
| Pointer light | Yes                                                      | No     |

## 9. States

| State                              | Behavior                                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Loading                            | The page renders fully first. The fish appears already in a composed position; there is no pop-in sequence |
| Running                            | As described above                                                                                         |
| Paused by the visitor              | Everything freezes in place; the button reads "Play motion"; the choice is remembered on that device       |
| Hero scrolled out of view          | Animation stops completely; resumes when at least 5% of the hero returns                                   |
| Browser tab hidden                 | Stops                                                                                                      |
| Reduced-motion setting             | A single still frame; nothing moves unless the visitor presses "Play motion"                               |
| Mobile, touch or low-power         | Lightweight mode (section 10)                                                                              |
| Canvas unsupported or script fails | The hero appears exactly as the approved static design; nothing is missing                                 |
| Window resized                     | Route and sizes are recalculated after 150 ms                                                              |

## 10. Lightweight mode

Used when the hero is narrower than 721 px, the device's primary pointer is touch, the device
reports two or fewer processor cores or 2 GB or less of memory, the visitor has data-saver on, or
the full mode cannot hold its frame rate.

| Aspect            | Full                                           | Lightweight                               |
| ----------------- | ---------------------------------------------- | ----------------------------------------- |
| Fish detail       | 24 segments, facets, fin rays, two tail layers | 16 segments, flat shading, one tail layer |
| Particles         | 44                                             | 14                                        |
| Pointer effects   | All                                            | None                                      |
| Frame rate        | Display rate                                   | Capped at 30 per second                   |
| Canvas resolution | Up to 1.5× device pixels                       | Up to 1.25×                               |

## 11. Open decision

Whether production uses this code-drawn fish (recommended) or the original 3D model on desktop.
See `HYBRID_DESIGN_COMPARISON.md`. The behavior in this document applies to either.
