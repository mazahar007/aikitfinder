# Homepage UX Audit — Phase 0A

**Audited:** the Next.js homepage in this repository (`src/app/page.tsx` and its components), at
commit `f43a278`, running as a production build.
**Not audited as the product:** the standalone HTML prototypes in the handoff. They are design
references only (owner decision 2).
**Date:** 11 Nov 2026. Planning only: no homepage code was changed.

## 1. Verdict

The current homepage is a well-made **AI Tools Directory homepage**. It is not the AIKitFinder
parent gateway that Handoff v18 requires.

A first-time visitor learns that AIKitFinder is a tool directory. They cannot learn that AutoFlow
AI exists, cannot choose between two products, and cannot log in or sign up. The page is also
very long (13 screens) and heavily animated, which works against the handoff's "restrained
motion" and "understand in five seconds" requirements.

Most of the page is worth keeping — as the **Directory's** home, not the parent's.

Screenshots: [`desktop, top`](screenshots/current-home-desktop-top.png) ·
[`desktop, full page`](screenshots/current-home-desktop-full.jpg) ·
[`desktop, dark`](screenshots/current-home-desktop-dark-full.jpg) ·
[`mobile, top`](screenshots/current-home-mobile-top.png) ·
[`mobile, full page`](screenshots/current-home-mobile-full.jpg) ·
[`mobile menu`](screenshots/current-home-mobile-menu.png)

## 2. What the page contains today

In order, from `src/app/page.tsx`:

| #   | Section                    | Component                            | Notes                                                                                   |
| --- | -------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | Header                     | `SiteHeader`, `MainNav`, `MobileNav` | Explore Tools, Guides, Prompts, Workflows, Deals, About, VoiceHub; search; theme toggle |
| 2   | Hero                       | inline + `SearchForm`                | Badge "Free to use · No sign-up"; H1; search; four suggested searches                   |
| 3   | Ribbons                    | `Ribbons`                            | Three large rotating text bands; decorative, `aria-hidden`                              |
| 4   | Story, four chapters       | `Story`                              | Discover, Learn, Create, Automate; full-height coloured panels with mock previews       |
| 5   | Cloud wipe + Featured rail | `CloudWipe`, `FeaturedRail`          | "Editor's picks"; horizontally pinned card rail on desktop                              |
| 6   | Zoom showcase              | `ZoomShowcase`                       | "One page. Everything you need." with a mock tool page                                  |
| 7   | Sample notice              | `SampleNotice`                       | Appears after roughly eight screens of content                                          |
| 8   | Browse by category         | `CategoryCard`                       | 12 categories with counts                                                               |
| 9   | Squiggle + marquee         | `Squiggle`, `OutlineMarquee`         | Decorative                                                                              |
| 10  | Beginner quick starts      | `GuideCard`                          | Three guides                                                                            |
| 11  | Popular workflows          | `WorkflowCard`                       | Two workflows shown                                                                     |
| 12  | Recently updated           | inline list                          | Five items                                                                              |
| 13  | Closing CTA                | `ClosingCta`                         | "Start exploring AI tools" · "Free to use · No sign-up needed"                          |
| 14  | Footer                     | `SiteFooter`                         | Explore, AIKitFinder, Legal                                                             |

## 3. Measurements

Taken from the local production build with headless Chromium. Local timings say nothing about
real-network speed and are not reported as performance results.

| Measure                              | Desktop 1440×900 | Mobile 390×844 | Small 320×640 |
| ------------------------------------ | ---------------- | -------------- | ------------- |
| Page height                          | 11,704 px        | 11,217 px      | 12,029 px     |
| Screens of scrolling                 | 13               | 13.3           | 18.8          |
| Horizontal overflow                  | None             | None           | None          |
| JavaScript downloaded (uncompressed) | 679 KB           | 660 KB         | 660 KB        |
| CSS (uncompressed)                   | 61 KB            | 61 KB          | 61 KB         |
| Fonts                                | 87 KB            | 87 KB          | 87 KB         |
| DOM nodes                            | 1,225            | 1,220          | 1,220         |
| Decorative `aria-hidden` elements    | 125              | 125            | 125           |
| Layout shift after load              | 0                | 0              | 0             |
| Links on the page                    | 66               | 66             | 66            |
| Interactive targets under 40 px high | 42               | 42             | 38            |

Not measured: Core Web Vitals on real devices or networks, colour contrast, screen-reader output.

## 4. Findings by audit area

Severity: **High** blocks the handoff's requirements; **Medium** harms the experience;
**Low** is polish.

### 4.1 Brand clarity and first-screen comprehension

| #   | Finding                                                                                                                                         | Severity |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| B1  | The first screen says "Find the right AI tool. Learn it. Use it." — a clear message for a directory, but it presents AIKitFinder as one product | High     |
| B2  | AutoFlow AI is not mentioned anywhere on the page, in the header or in the footer                                                               | High     |
| B3  | The identity is navy/blue/teal on a light default. The approved parent identity is dark-first violet with restrained pink                       | High     |
| B4  | The page title and description describe a directory only                                                                                        | Medium   |

### 4.2 Hero and product choices

| #   | Finding                                                                                                             | Severity |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| H1  | There are no product choices. The hero's only action is search                                                      | High     |
| H2  | The badge "Free to use · No sign-up" is an unverified claim the owner has asked to remove                           | High     |
| H3  | The search hero itself is strong: one field, plain-language placeholder, examples. It belongs on the Directory home | — (keep) |

### 4.3 Distinction between Directory and AutoFlow

| #   | Finding                                                                                                                                                    | Severity |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| P1  | No distinction exists because only one product is presented                                                                                                | High     |
| P2  | The story chapter "Automate — Chain tools into a workflow" describes written recipes, but the word "Automate" will collide with AutoFlow's real automation | Medium   |
| P3  | VoiceHub sits in the Directory navigation as if it were a third product                                                                                    | High     |

### 4.4 Navigation

| #   | Finding                                                                                                                                                | Severity |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| N1  | Desktop header has seven links plus search; all are Directory sections. A parent header needs Products, How it works, Trust, Help                      | High     |
| N2  | Deals is in the header, footer and mobile menu while all deal data is fictional (owner: hide or postpone)                                              | High     |
| N3  | Mobile menu works: a labelled Radix dialog with search at the top (Escape-to-close comes from Radix and was not separately tested). Keep the component | — (keep) |
| N4  | No anchor navigation to page sections; a 13-screen page has no way to jump                                                                             | Medium   |
| N5  | Active-link highlighting and the skip link work                                                                                                        | — (keep) |

### 4.5 Login and sign-up

| #   | Finding                                                                                        | Severity |
| --- | ---------------------------------------------------------------------------------------------- | -------- |
| A1  | No Log in or Sign up entry anywhere. The homepage must be the single login entry point         | High     |
| A2  | No modal/dialog component for authentication exists in the UI kit (`sheet` only)               | High     |
| A3  | The closing CTA says "No sign-up needed", which will be wrong for AutoFlow and for saved items | Medium   |

### 4.6 CTA hierarchy and destinations

| #   | Finding                                                                                           | Severity |
| --- | ------------------------------------------------------------------------------------------------- | -------- |
| C1  | Every CTA leads into the Directory (`/tools`, `/guides`, `/prompts`, `/workflows`, a sample tool) | High     |
| C2  | Many CTAs compete at similar weight; none is primary for the page as a whole                      | Medium   |
| C3  | All links resolve. No dead buttons, no `#` links                                                  | — (keep) |

### 4.7 Trust, verification and demo status

| #   | Finding                                                                                                                                   | Severity |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| T1  | The prototype notice appears only after the story, featured rail and showcase — about eight screens down. Sample tools are shown above it | High     |
| T2  | Sample cards in the featured rail show a green "Verified · date" badge beside the "Sample" badge                                          | High     |
| T3  | "Editor's picks" labels fictional tools                                                                                                   | Medium   |
| T4  | No explanation of how tool data is verified, and no link to the editorial policy from the body                                            | Medium   |
| T5  | Nothing about human approval before publishing (no AutoFlow content at all)                                                               | High     |
| T6  | The featured rail does say "These are fictional sample tools for the prototype" under its heading                                         | — (keep) |

See `HOMEPAGE_CONTENT_TRUTH_CHECK.md` for every claim.

### 4.8 Content hierarchy and length

| #   | Finding                                                                          | Severity |
| --- | -------------------------------------------------------------------------------- | -------- |
| L1  | 13 screens on desktop and mobile, nearly 19 on a 320 px phone                    | High     |
| L2  | The four story chapters each take a full screen to make one point                | Medium   |
| L3  | Tools, guides and workflows each appear twice (story preview, then real section) | Medium   |
| L4  | "Popular workflows" shows two cards in a three-column grid, leaving a gap        | Low      |

### 4.9 FAQ and footer

| #   | Finding                                                                                                                  | Severity           |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| F1  | There is no FAQ                                                                                                          | Medium             |
| F2  | Footer links are all real routes, but About, Contact, Privacy, Terms and Editorial policy are "In progress" placeholders | High before launch |
| F3  | Footer has no product section and lists Deals                                                                            | Medium             |
| F4  | The independence disclaimer in the footer is good and should stay                                                        | — (keep)           |

### 4.10 English-only interface

No language toggle or locale selector. `lang="en"`. All homepage copy is English, with British
spelling in places ("Summarise"). One Bengali string remains in the VoiceHub API error, outside the
homepage. **Pass**, with a spelling-convention decision to make.

### 4.11 Responsive layout

| #   | Finding                                                                           | Severity |
| --- | --------------------------------------------------------------------------------- | -------- |
| R1  | No horizontal overflow at 1440, 390 or 320 px                                     | — (keep) |
| R2  | On mobile the story previews stack under the text, doubling each chapter's height | Medium   |
| R3  | At 320 px the hero still fits search and two suggestion chips above the fold      | — (keep) |
| R4  | Tablet widths (768–1023 px) were not captured in this audit                       | Open     |

### 4.12 Accessibility

| #   | Finding                                                                                                                                                                                                     | Severity      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| X1  | One `h1`, one `main`, one `header`, one `footer`, labelled sections. Good                                                                                                                                   | — (keep)      |
| X2  | Heading order has a skip: footer group titles are `h2` after page sections; acceptable, but the story's real heading is screen-reader-only                                                                  | Low           |
| X3  | Keyboard order is logical: skip link, logo, nav, search, theme, hero search, suggestions                                                                                                                    | — (keep)      |
| X4  | 42 targets are under 40 px high (suggestion chips at 36 px; text links inside cards at 17–20 px). Card titles sit inside larger clickable cards, so the practical impact is smaller than the count suggests | Medium        |
| X5  | Decorative layers are correctly hidden from assistive technology (125 `aria-hidden` nodes)                                                                                                                  | — (keep)      |
| X6  | Story previews are `aria-hidden`, so screen-reader users get the text but not the examples — acceptable, since the examples are duplicated lower down                                                       | Low           |
| X7  | With reduced motion, GSAP is never loaded and the page is fully static                                                                                                                                      | — (keep)      |
| X8  | No dialog component exists for the future auth modal; focus trapping and return focus must be designed in                                                                                                   | High (future) |
| X9  | Contrast was not measured in this audit. The design system document claims WCAG 2.2 AA                                                                                                                      | Open          |

### 4.13 Effects, loading and performance

| #   | Finding                                                                                                                                                                       | Severity |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| M1  | Motion is the page's main character: ribbons, four coloured story scenes, two cloud wipes, a pinned horizontal rail, a 3D zoom card, a marquee and a kinetic closing headline | High     |
| M2  | The pinned featured rail converts vertical scrolling into horizontal movement on desktop — the scroll-hijacking pattern spec 14 warns against                                 | Medium   |
| M3  | About 660 KB of JavaScript is downloaded on mobile, including GSAP and ScrollTrigger                                                                                          | Medium   |
| M4  | No images, video, canvas or WebGL. Icons are inline SVG. Fonts are self-hosted                                                                                                | — (keep) |
| M5  | No layout shift                                                                                                                                                               | — (keep) |
| M6  | GSAP is imported dynamically and skipped for reduced-motion users                                                                                                             | — (keep) |

### 4.14 SEO structure

| #   | Finding                                                                | Severity |
| --- | ---------------------------------------------------------------------- | -------- |
| S1  | Title, description, Open Graph and canonical are present               | — (keep) |
| S2  | Preview hosts are `noindex` and the sitemap excludes sample records    | — (keep) |
| S3  | Metadata describes a directory, not the parent brand                   | Medium   |
| S4  | No structured data. Correct for now: there is nothing real to describe | — (keep) |
| S5  | No social preview image                                                | Low      |

## 5. What to preserve

| Asset                                                   | Where it should live after the redesign   |
| ------------------------------------------------------- | ----------------------------------------- |
| Hero search with typing examples and suggestions        | Directory home                            |
| Category grid, guide cards, workflow cards, recent list | Directory home                            |
| Story chapters (Discover, Learn, Create)                | Directory home, shortened                 |
| Featured rail and zoom showcase                         | Directory home, without scroll pinning    |
| Header shell, mobile sheet, theme toggle, skip link     | Shared primitives, re-skinned per product |
| Sample badge, sample notice, verification badge         | Everywhere sample data appears            |
| Footer disclaimer                                       | Parent and Directory footers              |
| Reduced-motion and lazy-loading approach                | All three products                        |

## 6. Top problems, in priority order

1. The homepage presents one product; two are required, each with its own CTA.
2. There is no login or sign-up entry.
3. The visual identity is the Directory's, not the parent's.
4. Unverified "free" and "no sign-up" claims, and Verified badges on fictional tools.
5. Sample-data disclosure arrives too late on the page.
6. Deals and VoiceHub are in the navigation against owner decisions.
7. The page is too long and too animated for a gateway.
8. No trust section and no FAQ.

The proposed answer to each is in `HOMEPAGE_REDESIGN_PLAN.md`.

## 7. Verified findings versus assumptions

**Verified by inspection or measurement:** everything in sections 2–4 not marked "Open".

**Assumptions:**

- That a visitor needs to understand both products within the first screen (from spec 13 §5 and
  spec 15, not from user research).
- That page length harms comprehension here. No analytics or user testing exists.
- That the 36 px suggestion chips are a practical problem on touch devices.

**Not done:** real-device testing, screen-reader testing, contrast measurement, tablet captures,
field performance measurement, user testing.
