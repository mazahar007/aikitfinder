# Homepage User Journey — Phase 0A

How visitors move through the homepage today, and how they should move through the proposed
parent homepage. Planning only.

## 1. Who arrives

These are working assumptions drawn from the handoff, not from research or analytics. No
analytics exist.

| Visitor                   | Wants                                                  | Should end up in   |
| ------------------------- | ------------------------------------------------------ | ------------------ |
| Tool seeker               | Find or compare an AI tool for a task                  | AI Tools Directory |
| Creator                   | Produce YouTube video content with AI help             | AutoFlow AI        |
| The owner (first release) | Run the American Car Saga production workflow          | AutoFlow workspace |
| Returning signed-in user  | Get back to the product they use                       | Their last product |
| Evaluator                 | Understand what AIKitFinder is and whether to trust it | Trust section, FAQ |

## 2. Today's journey

```
Arrive at /
   │
   ▼
Hero: "Find the right AI tool."  ── search ──► /search
   │
   ├── header nav ──► /tools · /guides · /prompts · /workflows · /deals · /about · /voicehub
   │
   ▼ (scroll, 13 screens)
Ribbons → Story ×4 → Featured rail → Showcase → Sample notice → Categories → Guides →
Workflows → Recently updated → "Start exploring AI tools" ──► /tools
```

| Visitor        | What happens today                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Tool seeker    | Served well: search and browse work immediately                                                                      |
| Creator        | Dead end: AutoFlow AI is not mentioned; "Workflows" and "VoiceHub" are the nearest things and are not what they need |
| Owner          | No way to sign in and no workspace                                                                                   |
| Returning user | No accounts exist                                                                                                    |
| Evaluator      | Finds the prototype notice only after about eight screens; About and Editorial policy are placeholders               |

## 3. Proposed journeys

### J1 — Guest goes to the Directory

```
/  ──►  Hero: sees two products  ──►  "Explore AI Tools"  ──►  Directory home
                                                                  │
                                              search · categories · tool page · compare
                                              (no account at any point)
```

- One click from the first screen.
- The Directory keeps its own header, search and identity.
- Success: the visitor reaches a tool page without being asked to sign in.

### J2 — Guest goes to AutoFlow AI

```
/  ──►  "Explore AutoFlow AI"  ──►  AutoFlow landing page (public)
                                        │
                                        ├─ before AutoFlow ships:  "In development" page that
                                        │                           explains the pipeline; no
                                        │                           workspace button
                                        │
                                        └─ after AutoFlow ships:   "Open AutoFlow"
                                                                       │
                                                             not signed in ──► auth modal (J4)
                                                             signed in     ──► /autoflow/app
```

- The landing page is public; only the workspace needs an account.
- Before AutoFlow exists the visitor is told so plainly, on arrival, not after signing up.

### J3 — Guest uses a protected Directory action

```
Directory tool page  ──►  "Save"  ──►  auth modal opens on Sign up
                                          │
                              ┌───────────┼─────────────┐
                              ▼           ▼             ▼
                          signs up    switches to    closes modal
                              │        Log in           │
                              ▼           │             ▼
                     returns to the same  │      stays on the tool page,
                     tool page, and the   ▼      nothing lost
                     tool is saved     same result
```

- The intended action is remembered and completed after sign-in.
- The return address is validated as an internal route.
- This journey starts in the Directory but uses the one shared modal.

### J4 — Sign up or log in from the homepage

```
/  ──►  "Sign up" or "Log in" (header)  ──►  shared modal
                                                │
                                                ▼
                                    stays on /  with the account menu shown
                                                │
                                                ▼
                                 chooses a product from the hero or the menu
```

- No forced product choice during sign-up (spec 09 §10.3).
- No separate login page for either product.
- If sign-in was triggered by a product button, the user lands in that product.

### J5 — Returning signed-in user

```
/  ──►  header shows account menu  ──►  product switcher  ──►  Directory or AutoFlow
        hero CTAs go straight to each product                  (no second login)
```

- Whether to redirect a returning user automatically to their last product is an open decision
  (see `DESIGN_DECISION_LOG.md`, D-14). The recommendation is not to redirect: keep `/` as a
  stable gateway and make the switcher one click away.

### J6 — Evaluator checks trust

```
/  ──►  "Trust" in header  ──►  #trust  ──►  editorial policy
                              ──►  #help (FAQ)  ──►  Privacy · Terms · Contact
```

- Depends on real Privacy, Terms, Contact and Editorial policy copy, which does not exist yet.

### J7 — Keyboard and screen-reader user

```
Tab 1: Skip to content  →  logo  →  Products  →  How it works  →  Trust  →  Help  →
theme  →  Log in  →  Sign up  →  Explore AI Tools  →  Explore AutoFlow AI  →  …
```

- Both product buttons are reached within the first dozen stops.
- The Products menu and the modal are fully operable by keyboard; Escape closes both; focus
  returns to the trigger.
- Headings alone ("Choose your product", "How it works", "Trust", "Questions") describe the page.

### J8 — Mobile visitor

```
/ (390 px)  ──►  headline + two full-width buttons on the first screen
            ──►  ☰  ──►  the two products are the first two menu items
```

## 4. Error and edge paths

| Situation                                       | Behaviour                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| Wrong password, existing email, weak password   | Inline message in the modal; entered values kept; no page change                      |
| Network or service failure during sign-in       | Message with a retry; the modal stays open                                            |
| Visitor closes the modal                        | Stays on the current page; pending action discarded                                   |
| Deep link to a protected route while signed out | The app shell opens the modal with the destination remembered; no separate login page |
| Return address is external or malformed         | Ignored; user goes to `/`                                                             |
| Signed-in user without access to a product      | Explanation page with a way back; never a blank screen                                |
| Non-admin opens an admin route                  | Refused by the backend; shown "not available"                                         |
| AutoFlow not yet available                      | Landing page says so; no sign-up prompt that leads nowhere                            |
| JavaScript unavailable                          | Content and links work; Log in and Sign up need JavaScript and say so                 |

## 5. Where v18's social features fit

Planning context only; none of this is on the parent homepage.

```
AutoFlow workspace:  … → Preview & approval → Publishing Center → (per-channel results)
                                                    │
                                Channel Connections ┘        Social Inbox · Social Automations
                                (native APIs or an            (separate area; automations start
                                 optional provider)            disabled and never bypass approval)
```

The homepage's only obligation is honesty: the pipeline strip ends at "Your approval → Publish",
and nothing on the page suggests posting happens without the owner's approval.

## 6. What to measure later

Only after consent and legal review (spec 15), and only once real traffic exists:

| Question                           | Signal                         |
| ---------------------------------- | ------------------------------ |
| Do visitors choose a product?      | Clicks on each product button  |
| Which product draws more interest? | Split between the two          |
| Does sign-up complete?             | Modal opened → account created |
| Where do visitors leave?           | Last section reached           |

## 7. Journey acceptance criteria

1. From the first screen, a visitor can reach either product in one click.
2. A guest can browse the Directory end to end without meeting a sign-in prompt.
3. A protected action opens the shared modal and completes after sign-in.
4. Closing the modal never loses the visitor's place.
5. A signed-in user moves between products without signing in again.
6. No path leads to a second, product-specific login page.
7. No path offers an AutoFlow feature that does not exist without saying so.
8. Every journey above can be completed by keyboard alone.
