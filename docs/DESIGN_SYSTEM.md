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
4. **Light theme first** for long reading sessions. Dark mode can be added later by redefining the
   variables.

## Colour tokens

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
