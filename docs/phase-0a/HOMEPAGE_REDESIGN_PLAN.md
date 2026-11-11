# Homepage Redesign Plan — Phase 0A

A plan only. Nothing here is implemented, and nothing should be until the owner approves it.
Implementation belongs to Phase 2, after the Phase 1 foundation.

## 1. Goal

Turn `/` into the AIKitFinder parent gateway: one clear statement of what AIKitFinder is, two
distinct product choices, one shared sign-in entry, and honest status — while keeping the working
Directory intact.

## 2. The central move

The current homepage is not thrown away. It becomes the Directory's home.

| Today                     | Proposed                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `/` = Directory homepage  | `/` = new parent gateway (short, dark-first, violet)                                             |
| No Directory home         | Directory home receives today's hero search, categories, guides, workflows and a shortened story |
| No AutoFlow destination   | `/autoflow` = public landing page, labelled "In development" until the product exists            |
| One header for everything | Parent header on `/`; Directory header on Directory routes; AutoFlow header on AutoFlow routes   |

**Where the Directory home lives is an owner decision** (`DESIGN_DECISION_LOG.md`, D-07). The
recommendation is a new `/directory` route, leaving `/tools` and every other existing URL
unchanged.

## 3. Proposed page

Section order, copy and behaviour are specified in `HOMEPAGE_WIREFRAME_DESKTOP.md` and
`HOMEPAGE_WIREFRAME_MOBILE.md`.

| Section             | Headline copy                                |
| ------------------- | -------------------------------------------- |
| Hero                | "Discover AI tools. Create content with AI." |
| Choose your product | "Two products. Use either one on its own."   |
| How it works        | "How AIKitFinder fits together"              |
| Trust               | "What you can rely on"                       |
| FAQ                 | "Questions"                                  |
| Final CTA           | "Where would you like to start?"             |

CTAs: "Explore AI Tools" and "Explore AutoFlow AI" throughout; "Log in" and "Sign up" in the
header.

## 4. Changes, by priority

### P0 — content honesty (small, can precede the redesign)

These correct statements that are wrong today. They touch application code, so they are **not**
done in Phase 0A; they are listed first because they do not depend on the foundation phase.

| #    | Change                                                                         | Where                                         |
| ---- | ------------------------------------------------------------------------------ | --------------------------------------------- |
| P0-1 | Remove "Free to use · No sign-up" and "Free to use · No sign-up needed"        | `src/app/page.tsx`, `showcase-scenes.tsx`     |
| P0-2 | Stop showing "Verified" on sample records                                      | Sample data, or a rule in the badge component |
| P0-3 | Remove "Tested" on the sample prompt and "Verified" in the showcase mock       | `story.tsx`, `showcase-scenes.tsx`            |
| P0-4 | Rename "Editor's picks", "Popular workflows", "Popular searches"               | Homepage sections                             |
| P0-5 | Remove Deals from header, mobile menu, footer and sitemap paths; keep the code | `src/config/site.ts`, `sitemap.ts`            |
| P0-6 | Remove VoiceHub from the main navigation; keep the route and code              | `src/config/site.ts`                          |
| P0-7 | Show the sample-data notice before the first sample record                     | `src/app/page.tsx`                            |
| P0-8 | Remove the unconfirmed domain from the mock address bar                        | `showcase-scenes.tsx`                         |

### P1 — the parent gateway (Phase 2)

| #     | Change                                                                | Depends on                   |
| ----- | --------------------------------------------------------------------- | ---------------------------- |
| P1-1  | Route groups with separate layouts for parent, Directory and AutoFlow | Phase 1                      |
| P1-2  | Parent theme tokens (dark-first, violet, restrained pink)             | Phase 1 tokens               |
| P1-3  | Parent header with Products menu, anchors, theme, Log in, Sign up     | Dialog/menu primitives       |
| P1-4  | Hero with two product CTAs and two distinct previews                  | P1-2                         |
| P1-5  | "Choose your product" cards with configurable status pills            | P1-2                         |
| P1-6  | "How it works" with the pipeline strip and approval step              | —                            |
| P1-7  | Trust section                                                         | Editorial policy copy        |
| P1-8  | FAQ                                                                   | Owner-confirmed answers      |
| P1-9  | Parent footer                                                         | Privacy, Terms, Contact copy |
| P1-10 | Parent metadata, Open Graph image                                     | —                            |
| P1-11 | Directory home that receives today's homepage content                 | D-07 decision                |
| P1-12 | `/autoflow` landing stub, labelled "In development"                   | AutoFlow tokens              |
| P1-13 | Shared authentication modal wired to Log in / Sign up                 | Phase 1 authentication       |
| P1-14 | Account menu and product switcher for signed-in users                 | Phase 1 authentication       |

### P2 — refinement (after the gateway works)

| #    | Change                                                                                    |
| ---- | ----------------------------------------------------------------------------------------- |
| P2-1 | Shorten the Directory story to three chapters; remove scroll pinning on the featured rail |
| P2-2 | Use-case pathways (creators, marketers, developers) once real content supports them       |
| P2-3 | Real workspace screenshot in the AutoFlow preview once a screen exists                    |
| P2-4 | Privacy-conscious analytics after consent and legal review                                |
| P2-5 | Measured performance budget and Core Web Vitals tracking                                  |
| P2-6 | Tablet-specific layout review, real-device and screen-reader testing                      |

## 5. What is preserved

- Every existing Directory URL and its behaviour.
- The data access layer (`repository.ts`), sample flags, sitemap exclusion and `noindex` rules.
- The mobile sheet, theme toggle, skip link, focus styles and reduced-motion handling.
- Homepage components (`Story`, `FeaturedRail`, `ZoomShowcase`, card components): moved, not
  deleted.
- The Deals and VoiceHub code and routes: unlinked, not removed.
- Historical documents (`MASTER_BRIEF.md`, design system, checklist): kept, with a note that
  Handoff v18 governs.

## 6. Motion and effects

| Current effect           | Parent homepage | Directory home                               |
| ------------------------ | --------------- | -------------------------------------------- |
| Hero entrance (CSS)      | Keep, short     | Keep                                         |
| Scroll reveal (CSS)      | Keep, sparing   | Keep                                         |
| Ribbons, outline marquee | Not used        | Optional, one instance at most               |
| Story colour scenes      | Not used        | Keep, shortened                              |
| Cloud wipes              | Not used        | Remove or reduce to one                      |
| Pinned horizontal rail   | Not used        | Replace with a normal scrolling row          |
| 3D zoom card             | Not used        | Keep without scroll-linked tilt, or simplify |
| Kinetic closing headline | Not used        | Optional                                     |

No new animation library. GSAP stays where it is already used and is not loaded by the parent
page.

## 7. Dependencies

| Dependency                                            | Needed for             | Owner input      |
| ----------------------------------------------------- | ---------------------- | ---------------- |
| Phase 1: route groups, tokens, dialog primitives      | P1-1 to P1-5           | —                |
| Phase 1: Supabase Auth and session handling           | P1-13, P1-14           | Supabase project |
| Decision on the Directory home route (D-07)           | P1-11                  | Yes              |
| Decision on default theme behaviour (D-09)            | P1-2                   | Yes              |
| FAQ answers on pricing and provider keys              | P1-8                   | Yes              |
| Privacy, Terms, Contact, Editorial policy, About copy | P1-7, P1-9             | Yes              |
| Logo treatment for the parent and two products        | P1-3                   | Optional         |
| Production domain                                     | Metadata, mock visuals | Yes              |

If authentication is not ready when Phase 2 starts, the gateway can ship with Log in and Sign up
hidden rather than non-functional. A button that does nothing is not acceptable (spec 13 §11).

## 8. Risks

| #   | Risk                                                                                 | Mitigation                                                                                    |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| R1  | Restructuring layouts breaks working Directory pages; there are no tests             | Add route smoke tests and screenshot checks before Phase 1 moves anything                     |
| R2  | The homepage promotes AutoFlow long before it exists                                 | "In development" labels driven by configuration; landing stub says the same                   |
| R3  | Three identities drift into one, or into three unrelated sites                       | Shared spacing, type scale and primitives; only accent, surfaces and composition differ       |
| R4  | The parent page becomes a second long page                                           | Height targets per section in the wireframe; no feature tours on the parent                   |
| R5  | Auth UI appears before the backend, creating dead controls                           | Ship controls only with working authentication                                                |
| R6  | Legal pages remain placeholders at launch                                            | Tracked as a launch blocker                                                                   |
| R7  | Moving the SEO-relevant homepage content to a new route                              | Site is `noindex` today, so there is no ranking to lose; set canonical URLs on the new routes |
| R8  | Dark-first parent and the Directory's light default feel inconsistent when switching | One persisted theme choice; each product defines both themes                                  |

## 9. Acceptance criteria for the implemented homepage

**Comprehension**

- [ ] The hero names both products and what each is for.
- [ ] Both product buttons are visible without scrolling at 1024×768, 1440×900, 390×844 and 360×740.
- [ ] The two product cards differ in more than colour and text.

**Navigation and actions**

- [ ] Every link and button leads to a real destination or performs a real action.
- [ ] Log in and Sign up open the shared modal; no product-specific login page exists.
- [ ] Deals and VoiceHub are absent from the parent navigation and footer.
- [ ] The mobile menu lists the two products first.

**Honesty**

- [ ] No "free", "unlimited" or "guaranteed" claims.
- [ ] No tool, user or language counts unless computed from real records.
- [ ] No "Verified" badge on any sample record.
- [ ] Every planned AutoFlow capability is labelled as planned.
- [ ] The approval step is shown before Publish wherever the pipeline appears.

**Accessibility**

- [ ] One `h1`; logical heading order; labelled landmarks.
- [ ] All targets at least 44 px high.
- [ ] Modal and menu trap focus, close with Escape and return focus.
- [ ] Reduced motion removes all entrance animation without hiding content.
- [ ] Contrast measured and meeting WCAG 2.2 AA in both themes.

**Performance**

- [ ] The parent page loads no scroll-animation library.
- [ ] No layout shift after load.
- [ ] No horizontal overflow from 320 px to 1920 px.
- [ ] Performance measured on a deployed build and recorded.

**Preservation**

- [ ] All existing Directory routes return the same content as before.
- [ ] `pnpm check` and `pnpm build` pass.
- [ ] Desktop and mobile screenshots of the parent page, Directory home and AutoFlow stub are
      provided.

## 10. Out of scope for the homepage work

- Any change to Directory search, filters, tool pages, compare or prompts beyond re-housing the
  homepage sections.
- The AutoFlow workspace, Publishing Center, Social Inbox or Social Automations.
- Admin tools.
- Real tool data.

## 11. Order of work proposed after approval

1. Owner approves this plan and the open decisions.
2. P0 honesty fixes (small, separately approved).
3. Phase 1 foundation.
4. Phase 2: P1-1 to P1-14.
5. P2 refinements as later phases allow.
