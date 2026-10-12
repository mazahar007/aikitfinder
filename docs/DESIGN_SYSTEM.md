# AIKitFinder design system

Approved by the owner on 2026-10-12. Implemented as CSS variables in `src/app/globals.css` and exposed
as Tailwind utilities (e.g. `bg-primary`, `text-learn`, `bg-warning-tint`).

This design is a reasoned starting point. It passes contrast checks, but **no users have tested it
yet**. Validate it with a few real users after the Phase 2 prototype.

## Principles

1. **Personalise by task and skill level, never by age.** The 14–45 audience ranges from
   beginners to professionals, so filters and labels use skill level and goal.
2. **Each colour has one job.** Blue always means "clickable". Teal always means "learning content".
   Status colours always come with an icon and a word.
3. **Calm, documentation-grade look.** No neon glow or heavy gradients, which lower text contrast and
   date quickly.
4. **Light and dark themes.** The site follows the device setting until the visitor picks one
   with the sun/moon button in the header; the choice is remembered on that device. An inline script
   in `<head>` applies the theme before the first paint, so there is no flash.

## Colour tokens (light theme)

| Token (CSS variable)      | Hex                   | Job                                           | Contrast                   |
| ------------------------- | --------------------- | --------------------------------------------- | -------------------------- |
| `--brand`                 | `#0B1B3A`             | Logo, headings, footer background             | 17.04:1 on white (AAA)     |
| `--on-brand`              | `#CBD5E1`             | Body text on navy                             | 11.48:1 on brand (AAA)     |
| `--on-brand-accent`       | `#7DD3FC`             | Logo accent on navy                           | 10.22:1 on brand (AAA)     |
| `--primary`               | `#2563EB`             | Buttons, links, active states (actions only)  | 5.17:1 with white (AA)     |
| `--primary-hover`         | `#1D4ED8`             | Hover / pressed                               | 6.70:1 with white (AA)     |
| `--primary-tint`          | `#EFF6FF`             | Selected chip, "Featured" badge, info callout | 6.16:1 with primary-hover  |
| `--learn`                 | `#0F766E`             | Guides, workflow steps, quick starts          | 5.47:1 with white (AA)     |
| `--learn-tint`            | `#F0FDFA`             | Guide badge and tip callout background        | 5.25:1 with learn (AA)     |
| `--background`            | `#F7F8FA`             | Page canvas                                   | 16.80:1 with text (AAA)    |
| `--card`                  | `#FFFFFF`             | Cards, panels, inputs                         | 17.85:1 with text (AAA)    |
| `--surface-subtle`        | `#F1F4F8`             | Prompt/code blocks, sidebars                  | 16.18:1 with text (AAA)    |
| `--border`                | `#DDE3EA`             | Decorative dividers                           | decorative only            |
| `--input`                 | `#8592A3`             | Form-field borders                            | 3.16:1 on white (UI ≥ 3:1) |
| `--foreground`            | `#0F172A`             | Primary text                                  | 17.85:1 on white (AAA)     |
| `--muted-foreground`      | `#475569`             | Secondary text, metadata                      | 7.58:1 on white (AAA)      |
| `--success` / `-tint`     | `#15803D` / `#F0FDF4` | "Verified"                                    | 4.79:1 (AA)                |
| `--warning` / `-tint`     | `#B45309` / `#FFFBEB` | "Needs review"                                | 4.84:1 (AA)                |
| `--destructive` / `-tint` | `#B91C1C` / `#FEF2F2` | Errors, delete                                | 5.91:1 (AA)                |
| `--ring`                  | `#2563EB`             | 2px focus ring, 2px offset                    | 4.86:1 on background       |

All ratios were calculated with the WCAG 2.2 relative-luminance formula.

## Dark theme

Same token names, redefined under `:root[data-theme="dark"]`. The base is deep navy, not pure black,
which causes less glare and keeps the brand feel. Accents are lighter so they stay readable, and
filled buttons switch to dark text.

| Token                     | Hex                   | Check                                   | Contrast       |
| ------------------------- | --------------------- | --------------------------------------- | -------------- |
| `--background`            | `#0B1220`             | foreground `#E6EBF2` on it              | 15.63:1 (AAA)  |
| `--card`                  | `#111A2E`             | foreground on it                        | 14.48:1 (AAA)  |
| `--surface-subtle`        | `#18233A`             | foreground on it                        | 13.08:1 (AAA)  |
| `--heading`               | `#F8FAFC`             | on card                                 | 16.57:1 (AAA)  |
| `--muted-foreground`      | `#A3B1C6`             | on card                                 | 7.98:1 (AAA)   |
| `--primary`               | `#60A5FA`             | link text on card / dark text on button | 6.82 / 7.36:1  |
| `--primary-hover`         | `#93C5FD`             | on `--primary-tint` `#172A4D`           | 7.90:1         |
| `--learn`                 | `#2DD4BF`             | on card / dark text on button           | 9.32 / 10.06:1 |
| `--success` / `-tint`     | `#4ADE80` / `#0B2A17` | text on tint                            | 8.88:1         |
| `--warning` / `-tint`     | `#FBBF24` / `#2B1D07` | text on tint                            | 9.82:1         |
| `--destructive` / `-tint` | `#F87171` / `#2E1215` | text on tint                            | 6.26:1         |
| `--input`                 | `#64748B`             | border on card (UI)                     | 3.64:1         |
| `--brand` (footer)        | `#070D1A`             | `--on-brand` text on it                 | 13.08:1 (AAA)  |

## Typography

- **Inter** for all interface and reading text. Its tall lowercase letters and clear look-alike
  glyphs (I, l, 1) suit screens.
- **JetBrains Mono** for prompts, setting values and code, so copyable text stands out.
- Body text is 16px with 1.65 line height, and reading width is capped at about 70 characters.

| Token     | Desktop | Mobile | Line height | Weight | Use                     |
| --------- | ------- | ------ | ----------- | ------ | ----------------------- |
| `display` | 48px    | 36px   | 1.1         | 800    | Homepage headline only  |
| `h1`      | 36px    | 30px   | 1.2         | 700    | Page titles             |
| `h2`      | 28px    | 24px   | 1.25        | 700    | Section titles          |
| `h3`      | 22px    | 20px   | 1.3         | 600    | Card and step titles    |
| `lead`    | 18px    | 18px   | 1.6         | 400    | Summaries and intros    |
| body      | 16px    | 16px   | 1.65        | 400    | All reading text        |
| small     | 14px    | 14px   | 1.5         | 500    | Meta, badges, buttons   |
| caption   | 12px    | 12px   | 1.4         | 500    | Timestamps (never body) |

## Motion

Implemented in `src/app/motion.css` with CSS, scroll-driven animations and React's
`<ViewTransition>`, with no animation library. Motion always explains something; it is never
decoration for its own sake.

| Effect                             | Where                                    | What it communicates                  |
| ---------------------------------- | ---------------------------------------- | ------------------------------------- |
| Staggered rise-in                  | Homepage hero on load                    | The page is ready; read top to bottom |
| Drifting colour light + faint grid | Homepage hero background                 | A modern, "alive" first impression    |
| Animated gradient on "Use it."     | Hero headline                            | The promise of the product            |
| Typing example searches            | Hero search placeholder (stops on focus) | What you can type here                |
| Rotating light ring                | Hero search while focused                | Where your input goes                 |
| Scroll reveal                      | Card grids, guide steps, workflow steps  | New content arriving                  |
| Card lift + pointer light          | All cards on hover                       | This card is clickable                |
| Logo morph                         | Tool card → tool page                    | Same tool, more detail                |
| Page enter / exit                  | Every navigation (header stays still)    | You moved to a new page               |
| Results crossfade                  | Tool filters                             | Same place, different results         |
| Reading progress bar               | Tool and guide pages                     | How far through the page you are      |
| Header shadow on scroll            | Site header                              | Content is scrolling beneath          |
| Circular theme reveal              | Light/dark switch                        | The theme changed from this button    |
| Check-mark pop                     | Copy buttons                             | Copied successfully                   |

### Homepage showcase (GSAP)

The homepage adds a scroll-linked "story" layer inspired by editorial motion sites, using our own
shapes, words and colours. GSAP 3 (free standard licence) is loaded with a dynamic import inside
`src/components/motion/scroll-scenes.tsx`, so it is downloaded only on the homepage (about 43 KB).

| Effect           | What it does                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Kinetic ribbons  | Three tilted pills of oversized words (Discover · Learn · Create · Automate) slide sideways with the scroll |
| Story chapters   | Four chapters; the section background fades between pastel chapter colours (`--story-1` to `--story-4`)     |
| Line-art drawing | Each chapter's illustration draws its strokes as it scrolls in; accent dots pop in                          |
| Outline marquee  | A line of huge outlined words ("Find it → Learn it → Use it") slides with the scroll                        |
| Squiggle divider | A dashed wavy line between the story and the directory sections                                             |

The server-rendered markup is complete without JavaScript: line art is fully drawn, each chapter
shows its own colour, and ribbons sit still. GSAP only enhances it, and it does not run at all
under reduced motion. Other pages do not load GSAP.

Rules:

- Only `transform` and `opacity` animate, so motion stays smooth on low-end phones.
- Durations: 150ms for feedback, 250ms for UI changes, about 450ms for page and morph transitions.
  Easing is `cubic-bezier(0.22, 1, 0.36, 1)` (fast start, gentle stop).
- Everything is switched off when the device asks for reduced motion. Content is always visible
  without animation.
- Scroll effects are progressive enhancement: browsers without scroll-driven animation support
  show the final, static state.

## Spacing, shape and motion

- **Spacing:** 4px grid (4, 8, 12, 16, 24, 32, 48, 64). 16px page gutters on phones.
- **Radius:** `sm` 6px (badges, inputs), `md` 10px (buttons, cards), `lg` 16px (hero search,
  dialogs), full (chips).
- **Elevation:** 1px borders instead of shadows. A soft shadow appears only when you hover a card.
- **Motion:** 150–200ms ease-out for hover and focus. All motion is turned off under
  `prefers-reduced-motion`.
- **Breakpoints** (Tailwind defaults): `sm` 640, `md` 768 (full top nav), `lg` 1024 (filter sidebar,
  table of contents), `xl` 1280. Content is capped at 1200px.

## Components (Phase 1)

| Component | Variants                                                         | Rules                                           |
| --------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| Button    | primary · secondary · ghost · learn · destructive; sm/md/lg/icon | Min 44px tall at `md`; verb-first labels        |
| Badge     | neutral · info · learn · success · warning · destructive         | Always a word, plus an icon for status          |
| Input     | default · `aria-invalid` error                                   | 44px tall; error text explains the fix          |
| Sheet     | right · left                                                     | Focus-trapped, Esc closes, used for mobile menu |
| Search    | header · hero                                                    | `/` shortcut; submits to `/search?q=`           |

## Navigation

- **Desktop:** logo · Explore Tools · Guides · Workflows · About · search field.
- **Mobile:** logo · search button · menu button that opens a side sheet with search, the main links
  and the footer links.
- Breadcrumbs on every page below the top level (from Phase 2).
- Footer: Explore, AIKitFinder (About, Editorial policy, Contact) and Legal (Privacy, Terms).
