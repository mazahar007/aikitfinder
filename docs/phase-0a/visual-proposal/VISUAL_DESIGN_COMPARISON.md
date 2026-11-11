# Visual Design Proposal — Comparison with the Original Sample

High-fidelity visual proposal for the AIKitFinder parent homepage, built on the approved Phase 0A
structure and content. **A design proposal for approval only: no application code was changed,
nothing was deployed, and Phase 1 has not started.**

**Reference reviewed:** `https://nectarline-sejxx523.manus.space/`, opened in a browser on
11 Nov 2026 at 1440 px and 390 px. Its CSS was read to identify the type and colour system.

## Files

| File                                                               | What it is                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [`homepage-visual-proposal.html`](homepage-visual-proposal.html)   | The proposal itself. Open in a browser; it is responsive and animated |
| [`screenshots/desktop-full.png`](screenshots/desktop-full.png)     | Full page, 1440 px                                                    |
| [`screenshots/desktop-hero.png`](screenshots/desktop-hero.png)     | First screen, 1440×900 at 2× (2880×1800)                              |
| [`screenshots/desktop-modal.png`](screenshots/desktop-modal.png)   | Sign-up modal over the page, 2×                                       |
| [`screenshots/tablet-hero.png`](screenshots/tablet-hero.png)       | First screen, 834×1112                                                |
| [`screenshots/mobile-full.png`](screenshots/mobile-full.png)       | Full page, 390 px at 2× (780 px wide)                                 |
| [`screenshots/mobile-hero.png`](screenshots/mobile-hero.png)       | First screen, 390×844 at 2×                                           |
| [`screenshots/mobile-modal.png`](screenshots/mobile-modal.png)     | Sign-up as a bottom sheet, 2×                                         |
| [`screenshots/mobile-menu.png`](screenshots/mobile-menu.png)       | Navigation menu, 2×                                                   |
| [`screenshots/identity-board.png`](screenshots/identity-board.png) | The three product identities side by side                             |

URL states for the HTML file: `?state=modal`, `?state=menu`, `?view=identity`.

## 1. Retained from the original sample

The reference's personality comes from five things. All five are kept.

| Signature element                                   | In the reference                                        | In the proposal                                                                               |
| --------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Light, tightly tracked display type                 | Inter Tight at weight 300, negative tracking            | Same family and weight, used for every display heading                                        |
| Italic serif second line                            | Instrument Serif italic in lavender ("Build the next.") | Same pairing: "Create content with AI." and one accent phrase per section heading             |
| Monospace uppercase kickers                         | "THE AI TOOL DISCOVERY PLATFORM", "01 · DISCOVER"       | "ONE ACCOUNT · TWO AI PRODUCTS"; product cards keep "01 · DISCOVER" / "02 · CREATE"           |
| Glass product cards with an icon tile and mono tags | Two translucent cards over the hero                     | Two cards with glass depth, refined borders and mono status pills                             |
| Misty, dreamlike violet atmosphere                  | Photographic lake, lotus flowers and fog                | Recreated in CSS: violet glow, drifting mist bands, a glowing horizon line and its reflection |

Also kept: the hairline-divided column grid used for the "how it works" steps, the deep indigo
base, periwinkle-violet buttons, and a scroll cue in the hero.

## 2. Improved

| Area                | Reference                                                        | Proposal                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero message        | "Find the right AI. Build the next." — names neither product     | Approved headline names both jobs; supporting copy names both products                                                                                     |
| Hero visual         | Decorative 3D fish                                               | Two product "planes" in depth — a Directory search window and an AutoFlow studio window — joined by an approval chip. The visual explains the product      |
| Product distinction | Two near-identical cards, both violet                            | Directory is cyan, editorial and grid-ruled; AutoFlow is near-black and cinematic with film frames and a projector beam                                    |
| CTA styling         | Small lavender buttons                                           | 54 px buttons (56 px on mobile) with inner highlight and soft accent shadow; cyan for Directory, violet for AutoFlow, equal weight                         |
| Honesty             | "1200+ tools", "Search without login", feature claims in Bengali | Status pills "Available · sample data" and "In development"; "Sample" chips; "Preview — not yet available"; pipeline marked "Planned" with dashed outlines |
| Human approval      | Mentioned in a tag                                               | A recurring pink signal: the hero chip, the pipeline step, the trust card                                                                                  |
| Heading hierarchy   | One display size, then small text                                | Display (74 px), section (64 px), card (40 px), body (17–19 px), mono labels                                                                               |
| Spacing             | Uneven                                                           | 112 px desktop / 84 px mobile section rhythm; 8 px base grid; one container width                                                                          |
| Language            | Bengali and English mixed; language toggle                       | American English only; no language toggle (decision F-08)                                                                                                  |
| Sign-up             | Modal opened from "Login"                                        | Proper overlay: blurred, dimmed page; Sign up / Log in switch; shows where the user will return                                                            |
| Accessibility       | Not measured                                                     | All text pairs measured at WCAG AA or better (lowest 4.83:1); 44 px targets; reduced-motion respected                                                      |
| Performance         | WebGL fish and two large hosted photographs                      | No WebGL, no photographs, no video: CSS gradients and inline SVG only                                                                                      |

### Mobile, as requested

Mobile has its own layout, not a shrunken desktop:

| Requirement        | What was done                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero readability   | Headline 48–50 px in two short lines; supporting copy 17 px                                                                                                                                                    |
| CTA visibility     | Both product buttons full-width and above the fold at 390×844 (bottoms at 511 px and 579 px), followed by both status lines                                                                                    |
| Card spacing       | One column, 20 px gaps, 22 px inner padding; the card art shortens to 176 px                                                                                                                                   |
| Section rhythm     | 84 px between sections; the pipeline becomes a vertical timeline; trust becomes an icon list                                                                                                                   |
| Navigation         | Header shows logo, Sign up and a 44 px menu button. The menu lists the two products first, as large labeled rows with their status, then the section links, a theme switch, and Sign up / Log in at the bottom |
| Footer readability | 15.5 px links with 44 px rows, two columns, higher-contrast text                                                                                                                                               |
| Sign-up modal      | Becomes a bottom sheet with a grab handle over a blurred page; 16 px inputs so iOS does not zoom                                                                                                               |

The reference's mobile view placed a floating "Scroll down & discover" card over the Directory
card's button. The proposal has nothing floating over content.

## 3. Intentionally removed

| Removed                                                        | Why                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| The 3D crystal fish and its WebGL renderer                     | A distinctive asset of the reference; also heavy on mobile and unrelated to either product |
| The lake and lotus photographs                                 | The reference's own image assets; replaced by an original CSS atmosphere                   |
| The floating "Scroll down & discover" card                     | Covered content on mobile; replaced by a small in-flow scroll cue on desktop               |
| Bengali/English toggle and Bengali copy                        | Owner decisions: English-only UI, American English                                         |
| "1200+ tools" and "Search without login" tags                  | Unverified claims (decision F-09 and the truth check)                                      |
| vidIQ, "superfast rendering", "Unlisted upload" feature claims | Not built; not supported by real data                                                      |
| The reference's exact layout, wordmark and copy                | Brief: do not copy branding, assets or content                                             |

The fonts (Inter Tight, Instrument Serif) are open-licensed Google Fonts, not the reference's
assets. JetBrains Mono replaces Fira Code because the repository already uses it.

## 4. How the three identities stay distinct

See `screenshots/identity-board.png`.

|               | Parent (AIKitFinder)                                                | AI Tools Directory                                | AutoFlow AI                                                          |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| Role          | Gateway: explain, then route                                        | Discovery and research                            | Production workstation                                               |
| Base          | Near-black navy `#05050E` → `#151143`                               | Deep teal-navy `#0B2533` → `#091629`              | Darkest black `#040308` → `#0C0A17`                                  |
| Accent        | Violet `#8F7DFF`; pink `#FF7CC6` only for the human-approval moment | Cyan `#5FE3EF`, teal `#2DD4BF`, sky `#38BDF8`     | Violet `#A68FFF` / `#6A52F0`                                         |
| Surface motif | Atmosphere: glow, mist, horizon line                                | Editorial ruled grid, search field as hero        | Projector beam, film frames, crop marks, timecodes, timeline         |
| Type use      | Light display plus serif italic accents                             | Inter Tight 400, denser text, more metadata       | Inter Tight 300 with mono for timecodes and states                   |
| Theme         | Dark by default, manual switch                                      | Follows saved or system preference, manual switch | Dark by default, manual switch                                       |
| Logo          | Existing mark on a violet tile, pink spark                          | Same mark on a cyan tile, "Directory" descriptor  | Same mark on a near-black tile, violet spark, "AutoFlow AI" wordmark |
| Density       | Few sections, generous space                                        | High: many cards, filters, tables                 | Panels, sidebar, inspector, timeline                                 |

**Shared:** the AIKitFinder mark geometry (the existing magnifier and spark, recolored, not
redesigned), the type family, spacing scale, radii, button anatomy and accessibility rules. On
the parent page the two products already appear in their own colors, so a visitor recognizes each
one when they arrive at it.

## 5. Motion (restrained)

Shown live in the HTML file. All motion stops when the visitor's system asks for reduced motion.

| Motion              | Detail                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Hero entrance       | Kicker, headline lines, copy, buttons and visual rise 14 px and fade in, staggered 60–80 ms, about 0.8 s in total                      |
| Ambient             | Mist bands drift sideways over 48–64 s; the orbit rings rotate over 140–200 s; the search caret blinks                                 |
| Section transitions | Sections fade up 18 px once as they enter the viewport; hero, sections and footer blend through gradients rather than hard edges       |
| Header              | Transparent over the hero; becomes a blurred panel after 24 px of scroll                                                               |
| Cards and buttons   | Lift 1–4 px on hover with a brighter border and accent glow; arrows nudge 3 px; focus shows the same state                             |
| Overlays            | Modal fades and scales in; on mobile the sheet slides up                                                                               |
| Not used            | Scroll pinning, scroll hijacking, parallax tied to scroll, WebGL, autoplay video, or any progress animation that is not real job state |

All of this is CSS plus one small visibility observer. The parent page needs no animation
library (decision D-10).

## 6. Content kept exactly as approved

- Eight sections in the approved order: header, hero, choose your product, how it works, trust,
  FAQ, final CTA, footer.
- Headline, supporting copy, CTA labels, status line, product bullets and account lines as in
  `HOMEPAGE_WIREFRAME_DESKTOP.md`.
- FAQ "Is AIKitFinder free?" with the owner's exact wording (F-03), and the provider answer
  reflecting centrally managed keys (F-04).
- Deals and VoiceHub absent; no tool counts; no "free" claims outside the approved FAQ.
- American English throughout.

Small additions for review: the hero chip "Your approval comes first / Nothing publishes without
it", the pipeline caption "Always required", "Contact us" beside the FAQ, and the footer line
"Product interface in English. Generated content can be multilingual." Each is accurate and can be
removed.

## 7. Not in this proposal

| Item                                        | Note                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Light theme of the parent page              | Approved as a manual option (F-02); to be designed in the next round |
| The Products dropdown, open                 | Specified in the wireframe; not drawn                                |
| Signed-in header with product switcher      | Specified in the wireframe; not drawn                                |
| Error and loading states of the modal       | Specified in the wireframe; not drawn                                |
| Real-device and screen-reader testing       | Rendered in headless Chromium only                                   |
| Directory home and AutoFlow landing designs | Outside the homepage scope                                           |
