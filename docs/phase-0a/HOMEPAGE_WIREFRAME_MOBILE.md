# Homepage Wireframe — Mobile (Phase 0A)

Proposed AIKitFinder **parent** homepage at 320–767 px. Structure and copy only; not a visual
design and not implemented.

**Rendered wireframe:** [`wireframes/homepage-wireframe-mobile.png`](wireframes/homepage-wireframe-mobile.png)
(390 px wide; source: [`wireframes/homepage-wireframe.html`](wireframes/homepage-wireframe.html))

![Mobile wireframe](wireframes/homepage-wireframe-mobile.png)

## 1. Section order

Same order and same content as desktop. Nothing is removed on mobile; layouts stack.

| #   | Section                | Mobile layout                                                                           |
| --- | ---------------------- | --------------------------------------------------------------------------------------- |
| A   | Header                 | Logo · Sign up · menu button                                                            |
| B   | Hero                   | Kicker, headline, copy, two full-width CTAs, status line, then the two previews stacked |
| C   | Choose your product    | Two cards stacked, Directory first                                                      |
| D   | How it works           | Three cards stacked; pipeline strip as a 2-column grid                                  |
| E   | Trust and transparency | Four cards stacked                                                                      |
| F   | FAQ                    | Full-width disclosure rows                                                              |
| G   | Final CTA              | Two full-width buttons                                                                  |
| H   | Footer                 | Brand, then link groups stacked                                                         |

Wireframe height at 390 px: 6,768 px including the two state panels, about 6.5 screens of content.
Today's page is 13.3 screens at the same width.

## 2. Text wireframe

```
┌────────────────────────────────┐
│ [AIKitFinder]   [Sign up] [☰]  │  A  sticky, 56–60 px
├────────────────────────────────┤
│ ( One account · Two AI         │  B
│   products )                   │
│                                │
│ Discover AI tools.             │
│ Create content with AI.        │
│                                │
│ AIKitFinder is home to two     │
│ separate products: a directory │
│ for finding and comparing AI   │
│ tools, and AutoFlow AI, a      │
│ studio for planning and        │
│ producing video content.       │
│                                │
│ [    Explore AI Tools →      ] │  ← both buttons above the fold
│ [   Explore AutoFlow AI →    ] │     at 390×844
│                                │
│ Browsing the directory needs   │
│ no account. AutoFlow AI is in  │
│ development.                   │
│ ┌────────────────────────────┐ │
│ │ AI Tools Directory         │ │
│ │ [ search mock ]            │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ AutoFlow AI                │ │
│ │ [ pipeline mock ]          │ │
│ │ Preview — not yet available│ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ Two products. Use either one   │  C
│ on its own.                    │
│ ┌────────────────────────────┐ │
│ │ ( Available · sample data )│ │
│ │ AI Tools Directory         │ │
│ │ For anyone choosing an AI  │ │
│ │ tool.                      │ │
│ │ • … four bullets           │ │
│ │ Account: not needed to     │ │
│ │ browse.                    │ │
│ │ [  Explore AI Tools →    ] │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ ( In development )         │ │
│ │ AutoFlow AI                │ │
│ │ For creators producing     │ │
│ │ YouTube video content.     │ │
│ │ • … four bullets           │ │
│ │ Account: required.         │ │
│ │ [ Explore AutoFlow AI →  ] │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ How AIKitFinder fits together  │  D
│ [ 1 · Discover ]               │
│ [ 2 · Create ]                 │
│ [ 3 · One account ]            │
│ Tools listed in the Directory  │
│ are not connected to AutoFlow  │
│ AI unless stated.              │
│ [Research ] [Script   ]        │
│ [Voice    ] [Video    ]        │
│ [Thumbnail] [SEO      ]        │
│ [YOUR APPROVAL] [Publish]      │
├────────────────────────────────┤
│ What you can rely on           │  E
│ [ Checked against sources ]    │
│ [ Samples are labelled ]       │
│ [ You approve publishing ]     │
│ [ Honest status ]              │
├────────────────────────────────┤
│ Questions                      │  F
│ Do I need an account?        + │
│ Is AIKitFinder free?         + │
│ … four more                    │
├────────────────────────────────┤
│ Where would you like to start? │  G
│ [    Explore AI Tools →      ] │
│ [   Explore AutoFlow AI →    ] │
├────────────────────────────────┤
│ [AIKitFinder]                  │  H
│ Products · Directory ·         │
│ AIKitFinder · Legal            │
└────────────────────────────────┘
```

## 3. Mobile menu

Reuses the existing sheet component (a focus-trapped Radix dialog).

```
┌───────────────────────────┐
│ Menu                  [✕] │
│ AI Tools Directory  (Product) │
│ AutoFlow AI         (Product) │
│ How it works              │
│ Trust                     │
│ Help                      │
│ ◐ Theme                   │
│                           │
│ [        Sign up        ] │
│ [        Log in         ] │
└───────────────────────────┘
```

| Rule                                                                                  |
| ------------------------------------------------------------------------------------- |
| The two products are the first two items and are labelled as products                 |
| Sign up and Log in are inside the menu as well as (Sign up) in the header             |
| Choosing an in-page link closes the menu, then scrolls                                |
| No search field: search lives in the Directory                                        |
| Signed in: the buttons are replaced by the account name, product switcher and Log out |

## 4. Authentication on mobile

The same modal as desktop, presented full-width with 16 px margins, or as a bottom sheet if that
tests better. Requirements:

- The on-screen keyboard must not cover the submit button; the dialog scrolls internally.
- Email field uses the email keyboard; password field has a show/hide control.
- Inputs use at least 16 px text so iOS does not zoom the page.
- Closing returns focus to the control that opened it.

## 5. Responsive rules

| Width      | Rule                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 320–359 px | Headline scales down to keep "Create content with AI." on two lines at most; header shows logo, Sign up and menu only |
| 360–767 px | As wireframed                                                                                                         |
| All mobile | Side padding 16–18 px; no horizontal page scroll; no fixed or floating elements over the CTAs                         |

The compare tray that floats at the bottom of Directory pages must not appear on the parent
homepage, where it would cover the product CTAs.

## 6. Touch and accessibility

- Every button and link at least 44 px high; FAQ rows at least 48 px.
- Buttons are full width, stacked, with at least 8 px between them.
- The two CTAs differ by label and accent, not accent alone.
- Sticky header stays under 60 px so it does not crowd small screens.
- No hover-only content.
- Reduced motion: no entrance animation.

## 7. Performance on mobile

- No scroll-driven animation library on this page.
- No WebGL, video or autoplay media.
- Preview panels are lightweight HTML; below-the-fold sections need no JavaScript.
- Target: this page's JavaScript well under today's 660 KB (uncompressed) homepage payload. A
  measured budget is set in Phase 2 against a real deployment.

## 8. What changes from today on mobile

| Today                                                        | Proposed                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| 13.3 screens                                                 | About 6.5 screens                                          |
| One product; search is the only hero action                  | Two product buttons above the fold                         |
| No Log in or Sign up                                         | Sign up in the header; both in the menu                    |
| Menu lists seven Directory sections incl. Deals and VoiceHub | Menu lists the two products, three anchors, theme, account |
| Sample notice after about eight screens                      | Status pill on the Directory card in the hero area         |
| Coloured full-screen story panels and ribbons                | Moved to the Directory home, shortened                     |
