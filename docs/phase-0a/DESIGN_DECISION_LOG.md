# Design Decision Log — Phase 0A

Records what has been decided, what is proposed, and what is still open. Updated as decisions are
made; earlier entries are not rewritten.

Status values: **Decided** (by the owner) · **Proposed** (recommendation awaiting approval) ·
**Open** (needs owner input).

## 1. Decisions made by the owner (11 Nov 2026)

| ID   | Decision                                                                                                                                                                                         | Source       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| O-01 | Developer Handoff v18 is the governing requirements document. `MASTER_BRIEF.md` and earlier roadmaps are historical; they are kept, and conflicts are documented                                 | Approval §1  |
| O-02 | The Next.js homepage in the repository is the authoritative source. Standalone HTML files are references only and must not replace the application                                               | Approval §2  |
| O-03 | Three distinct visual experiences: parent (dark-first, deep navy/near-black, violet, restrained pink), Directory (clean, search-first, cyan/blue/teal), AutoFlow (dark cinematic studio, violet) | Approval §3  |
| O-04 | Navigation, dashboards, layouts and identities of the products are not merged                                                                                                                    | Approval §3  |
| O-05 | Kolibrie is inspiration only. Phase 0A is not blocked by missing reference screenshots                                                                                                           | Approval §3  |
| O-06 | VoiceHub becomes the foundation of AutoFlow's Voiceover Studio and is not a product in the launcher. Its code and the external deployment are preserved until a tested migration                 | Approval §4  |
| O-07 | One shared identity; public Directory browsing; shared Sign up / Log in modal; individual registration allowed; return to the intended destination; switch products without re-login             | Approval §7  |
| O-08 | No billing, subscriptions, teams or multi-tenant onboarding in the first release                                                                                                                 | Approval §7  |
| O-09 | Remove unverified claims (free usage, unlimited functionality). No verified-tool count unless computed from real records                                                                         | Approval §10 |
| O-10 | Keep Guides and Workflows in the Directory if useful and maintainable. Hide or postpone Deals until real data exists                                                                             | Approval §10 |
| O-11 | Demo data is always clearly distinguished from real data                                                                                                                                         | Approval §10 |
| O-12 | Product UI is English-only; generated content is multilingual                                                                                                                                    | Approval §11 |
| O-13 | Human approval before public publishing is mandatory and cannot be disabled                                                                                                                      | Approval §13 |

## 2. Proposed decisions (awaiting approval)

| ID   | Topic                 | Proposal                                                                                                                                   | Why                                                               | Alternative considered                                                                                                             |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Role of `/`           | `/` becomes the parent gateway                                                                                                             | Required by spec 13 §5                                            | Keep the Directory at `/` and put the gateway elsewhere — contradicts the handoff                                                  |
| D-02 | Existing homepage     | Move its sections to the Directory home rather than delete them                                                                            | Preserves working, well-built components                          | Rebuild the Directory home from scratch                                                                                            |
| D-03 | Hero headline         | "Discover AI tools. Create content with AI."                                                                                               | Names both jobs in six words; suggested direction in spec 13 §5.2 | "One home for finding and using AI" — vaguer                                                                                       |
| D-04 | CTA labels            | "Explore AI Tools" and "Explore AutoFlow AI"                                                                                               | Spec 13 §4.1; parallel, unambiguous                               | "Get started" — does not say where                                                                                                 |
| D-05 | Header content        | Products menu, How it works, Trust, Help, theme, Log in, Sign up. No search                                                                | Search belongs to the Directory; the parent header stays short    | Keep the Directory search in the parent header                                                                                     |
| D-06 | Page length           | About 4–5 screens on desktop, 6–7 on mobile                                                                                                | A gateway should be scannable; today's page is 13                 | Keep a long narrative page                                                                                                         |
| D-07 | Directory home route  | New `/directory` route; `/tools` and all existing URLs unchanged                                                                           | No URL churn; spec 09 §F suggests a `/directory` namespace        | Make `/tools` the Directory home and move the listing to `/tools/search` — matches spec 13 §4.2 literally but changes working URLs |
| D-08 | AutoFlow destination  | A public `/autoflow` landing stub labelled "In development" from Phase 2                                                                   | The AutoFlow CTA needs a real destination before Phase 4          | Hide the AutoFlow CTA until Phase 4 — hides half the product family                                                                |
| D-09 | Default theme         | Parent and AutoFlow default to dark; Directory follows the saved choice, then the device. One toggle, one saved preference across products | Meets "dark-first" without forcing dark on Directory readers      | All three default to dark                                                                                                          |
| D-10 | Motion on the parent  | CSS entrance and reveal only. No GSAP, no scroll pinning, no ribbons                                                                       | Handoff asks for restrained motion; keeps the page light          | Reuse the current GSAP showcase on the parent                                                                                      |
| D-11 | Motion in Directory   | Keep the story, shortened; replace the pinned horizontal rail with a normal row                                                            | Spec 14 advises against pinned sequences for discovery            | Keep as is                                                                                                                         |
| D-12 | Status labels         | Product status pills ("Available · sample data", "In development") come from configuration                                                 | Copy stays truthful as the products change                        | Hard-coded copy                                                                                                                    |
| D-13 | Auth modal            | One dialog with Sign up / Log in tabs, opened from the header and from protected actions                                                   | Spec 09 §10                                                       | Separate pages                                                                                                                     |
| D-14 | Returning users       | Do not auto-redirect from `/`; show the account menu with the product switcher                                                             | Keeps `/` predictable; spec 09 §10.3 says not to force a choice   | Redirect to the last-used product                                                                                                  |
| D-15 | Deals                 | Unlink from navigation, footer and sitemap; keep code and routes behind a switch                                                           | Owner decision O-10; nothing is deleted                           | Delete the feature                                                                                                                 |
| D-16 | VoiceHub link         | Remove from the main navigation now; the page stays reachable by URL until migrated                                                        | Owner decision O-06                                               | Leave in the nav until migration                                                                                                   |
| D-17 | Editorial labels      | "Editor's picks" → "Sample tools"; "Popular" → "Example" until real signals exist                                                          | Truth check                                                       | Keep the labels                                                                                                                    |
| D-18 | Sample disclosure     | Sample status shown at first contact (hero status line, product card pill), not mid-page                                                   | Audit finding T1                                                  | Keep the single notice                                                                                                             |
| D-19 | Product previews      | HTML/CSS previews built from real components; AutoFlow preview labelled until real                                                         | Spec 13 §12: use real UI, label placeholders                      | Illustrations or screenshots                                                                                                       |
| D-20 | FAQ component         | Native disclosure elements                                                                                                                 | Accessible without JavaScript                                     | Custom accordion                                                                                                                   |
| D-21 | Spelling              | American English across the product ("Summarize")                                                                                          | Global audience; American Car Saga content                        | Keep British spelling                                                                                                              |
| D-22 | Workflow wording      | Directory uses "Workflows" for written step-by-step recipes; AutoFlow uses "Production workflows" and "Social automations" (v18)           | Three meanings of one word otherwise                              | Rename the Directory section                                                                                                       |
| D-23 | Social features (v18) | Not mentioned on the parent homepage until built; may appear as "Planned" on the AutoFlow landing                                          | Truth rules                                                       | Promote them now                                                                                                                   |

## 3. Open questions for the owner

| ID   | Question                                                                                                      | Blocks           |
| ---- | ------------------------------------------------------------------------------------------------------------- | ---------------- |
| Q-01 | Approve D-07: is `/directory` acceptable as the Directory home?                                               | Phase 2          |
| Q-02 | Approve D-09: default theme behaviour                                                                         | Phase 1 tokens   |
| Q-03 | FAQ "Is AIKitFinder free?" — is the draft answer acceptable?                                                  | Phase 2          |
| Q-04 | FAQ on providers — will users connect their own provider accounts, or will the owner's keys be used?          | Phase 2, Phase 5 |
| Q-05 | Who writes Privacy, Terms, Contact, About and Editorial policy copy?                                          | Launch           |
| Q-06 | Should the P0 honesty fixes be done now as a small separate task?                                             | —                |
| Q-07 | Is there a logo or wordmark direction for the parent, Directory and AutoFlow, or should placeholders be used? | Phase 2          |
| Q-08 | Approve D-21: American English?                                                                               | Copy             |

## 4. Kolibrie reference review

The Kolibrie Studio brief itself (`Pasted markdown(20261111-052847).md`) is **not in the handoff
ZIP**. This review is based only on the description of it inside spec 14. No Kolibrie site, asset
or source was viewed.

Do-not-copy list: the Kolibrie name and wordmark, its copy, fictional studio content, photography
and video, exact layouts, card titles, and its cream/tomato/butter palette.

| Idea (as described in spec 14)                        | Parent               | Directory       | AutoFlow public | AutoFlow workspace | Reason                                                            |
| ----------------------------------------------------- | -------------------- | --------------- | --------------- | ------------------ | ----------------------------------------------------------------- |
| Strong editorial hero with clear positioning          | **Adopt**            | Already present | Adopt           | n/a                | Core requirement                                                  |
| Expressive but restrained headline typography         | **Adapt**            | Adapt           | Adapt           | Reject             | Keep Inter; use weight and size, not a new display face           |
| Scroll-triggered text reveals                         | Adapt (CSS only)     | Already present | Adapt           | Reject             | Subtle, no library on the parent                                  |
| Drawn underline details                               | Defer                | Already present | Defer           | Reject             | Decorative; revisit after the page works                          |
| Light-to-dark section transition                      | Reject               | Adapt (one)     | Defer           | Reject             | Parent is dark-first; one transition is enough in the Directory   |
| Marquee motion                                        | Reject               | Defer           | Reject          | Reject             | Adds motion without information                                   |
| Full-screen video hero                                | Reject               | Reject          | Defer           | Reject             | Heavy; no licensed footage; revisit for AutoFlow with real output |
| Cursor-following image card, cursor labels            | Reject               | Reject          | Reject          | Reject             | No touch or keyboard equivalent                                   |
| Pinned 3D card stack                                  | Reject               | Reject          | Defer           | Reject             | Scroll hijacking; spec 14 advises against it for discovery        |
| Sticky headline with parallax portraits               | Reject               | Reject          | Reject          | Reject             | Not relevant to the content                                       |
| Layered cards to explain a pipeline                   | Adapt (static strip) | n/a             | **Adopt**       | n/a                | Suits the research-to-publish story                               |
| Page-theme transitions between sections               | Reject               | Already present | Defer           | Reject             | Keep the parent calm                                              |
| Smooth-scroll library (Lenis)                         | Reject               | Reject          | Reject          | Reject             | Overrides native scrolling; accessibility and performance cost    |
| Additional GSAP plugins (SplitText, DrawSVG, Inertia) | Reject               | Reject          | Defer           | Reject             | No new dependencies without a demonstrated need                   |
| Reduced-motion fallbacks and responsive alternatives  | **Adopt**            | Already present | Adopt           | Adopt              | Already the repository's practice                                 |
| Refined hover and focus states                        | Adopt                | Already present | Adopt           | Adopt              | Low cost, real benefit                                            |
| Clear status and progress transitions                 | n/a                  | n/a             | n/a             | **Adopt**          | Must reflect real job state only                                  |

A separate `DESIGN_REFERENCE_REVIEW.md` (spec 14) should be completed if the actual brief is
supplied. Until then this table is the review of record.

## 5. Conflicts between historical documents and v18

Recorded per decision O-01. The older documents are not edited.

| Topic           | `MASTER_BRIEF.md` / `DESIGN_SYSTEM.md` / checklist | Handoff v18 (governs)                             |
| --------------- | -------------------------------------------------- | ------------------------------------------------- |
| Product         | One directory and knowledge hub                    | Parent brand with two products                    |
| Accounts        | None in the first release                          | Shared authentication from the foundation phase   |
| Pricing message | "Free knowledge platform"                          | No free claims                                    |
| Identity        | One navy/blue/teal identity, light and dark        | Three identities                                  |
| Backend         | Next.js server code with Supabase                  | Python FastAPI plus Supabase                      |
| Deals           | A roadmap phase, built on sample data              | Hidden until real, maintained data exists         |
| Phase numbering | Roadmap phases 0–9                                 | Phases 0, 0A, 1–7, with AutoFlow sub-phases 5D–5F |
| Homepage        | Directory-first with a motion showcase             | Short gateway with restrained motion              |

**Useful material to carry forward from the older documents:** the accessibility baseline, the
token naming approach, the sample-data labelling rules, the pricing-verification workflow, and the
data model notes.

## 6. Final owner decisions on Phase 0A (11 Nov 2026)

These are the approved source of truth. Where they differ from a proposal in section 2, they
replace it; the earlier rows are left as written for the record.

| ID   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Effect on earlier entries                                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| F-01 | **Directory route.** `/` is the AIKitFinder parent gateway. A new `/directory` route is the Directory landing page. `/tools` and every existing tool, category and profile URL are preserved. No bookmarks, external links or SEO URLs are broken; no unnecessary redirects or renames                                                                                                                                                                                                                                                                                        | D-01, D-07 approved; Q-01 closed                                                                            |
| F-02 | **Theme defaults.** Parent: dark by default, manual light/dark switch. AutoFlow: dark by default, manual switch. Directory: the visitor's saved preference, otherwise the operating-system preference, with a manual switch that is remembered. **Theme behavior is independent per product**                                                                                                                                                                                                                                                                                 | D-09 approved with one change: the preference is stored per product, not as one shared setting. Q-02 closed |
| F-03 | **FAQ "Is AIKitFinder free?"** Exact wording: "Browsing the public AI Tools Directory is free and does not require an account. Some features may require sign-in. AI tool providers set their own prices. AutoFlow AI pricing has not yet been announced." Nothing may imply that all listed tools are free or that all future features will be free                                                                                                                                                                                                                          | Q-03 closed; truth check updated                                                                            |
| F-04 | **AI provider keys.** Centrally managed by the owner for the initial personal-use release. Users do not supply Claude, OpenAI, Gemini, Grok or ElevenLabs keys. Keys are stored on the backend, encrypted at rest, and never exposed in frontend code, browser responses or logs. Authentication, rate limits, usage tracking and abuse protection are required. The provider architecture must allow optional bring-your-own-key later. **Social accounts are always connected through the account owner's own OAuth authorization; no centrally shared social credentials** | Q-04 closed; truth check FAQ updated                                                                        |
| F-05 | **Small honesty fixes** approved as a separate, limited task and commit. See `HONESTY_FIX_REPORT.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | D-15, D-16, D-17, D-18 approved and implemented; Q-06 closed                                                |
| F-06 | **Legal and company pages.** Claude may draft About, Editorial Policy, Privacy, Terms and Contact from verified project information only. No invented history, team, achievements, customers, email addresses, phone numbers or addresses. Unconfirmed information is marked. Nothing legal is published without the owner's review and appropriate legal review                                                                                                                                                                                                              | Q-05 closed. Drafting has not started                                                                       |
| F-07 | **Logo direction.** Keep the recognizable AIKitFinder parent identity; do not redesign the parent logo unnecessarily. Separate product identities within one brand family: parent premium modern technology; Directory clean, editorial, discovery-focused; AutoFlow premium cinematic creator studio. Parent and AutoFlow use dark navy, near-black, violet and restrained pink; Directory uses cyan/blue/teal                                                                                                                                                               | Q-07 closed                                                                                                 |
| F-08 | **Language.** American English across all interfaces, dashboards, onboarding, Help Center, Admin Panel and marketing. Product UI is English-only. Generated scripts, voiceovers and subtitles may use any language the selected AI and ElevenLabs models provide                                                                                                                                                                                                                                                                                                              | D-21 approved; Q-08 closed                                                                                  |

### Standing requirements restated by the owner

| ID   | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-09 | Handoff v18 is the master handoff. Its Uplika requirements are preserved as **future AutoFlow work, not part of the homepage**: multi-platform publishing, Channel Connections, Publishing Center, scheduling and publishing history, per-channel status and failed-target retry, Social Inbox, comment-to-DM and social engagement automations. Uplika is optional; native platform API integrations must remain possible |
| F-10 | VoiceHub's source code and its existing deployment are not deleted; they are preserved for the planned migration                                                                                                                                                                                                                                                                                                           |
| F-11 | Guides and Workflows stay in the Directory where the content is useful and maintainable                                                                                                                                                                                                                                                                                                                                    |
| F-12 | Phase 1 is not started, the full homepage redesign is not implemented, and nothing is deployed to production without explicit approval                                                                                                                                                                                                                                                                                     |

### Design consequences to carry into Phase 1 and Phase 2

- **Theme storage (F-02):** three independent settings. The existing single `localStorage` key
  becomes the Directory's; the parent and AutoFlow each get their own, defaulting to dark. The
  no-flash inline script must pick the key from the product being rendered.
- **Routes (F-01):** the Directory home is added at `/directory`; nothing is moved from `/tools`.
  The current homepage sections are re-housed there in Phase 2, not before.
- **Keys (F-04):** provider keys never reach the Next.js frontend runtime. The legacy
  `ELEVENLABS_API_KEY` in the frontend server moves to the backend with the VoiceHub migration.
  Usage is tracked per account from the start so limits and later bring-your-own-key fit without
  redesign.
- **Spelling (F-08):** existing British spellings in the interface (for example "Summarise") are
  still to be converted. This was not part of the honesty-fix task and is listed as follow-up.

### Remaining open items

| ID   | Item                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Q-09 | Approval of the remaining proposals in section 2 (D-02 to D-06, D-08, D-10 to D-14, D-19, D-20, D-22, D-23) together with the wireframes |
| Q-10 | Whether to start the page drafts allowed by F-06 now or with Phase 2                                                                     |
| Q-11 | Whether tool pages should keep showing related sample offers while Deals is unlinked (see `HONESTY_FIX_REPORT.md`)                       |

## 7. Change log

| Date        | Change                                                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 11 Nov 2026 | Log created in Phase 0A. Owner decisions O-01 to O-13 recorded; D-01 to D-23 proposed; Q-01 to Q-08 opened                          |
| 11 Nov 2026 | Final owner decisions F-01 to F-12 recorded. Q-01 to Q-08 closed. D-15 to D-18 implemented in commit `af43db0`. Q-09 to Q-11 opened |
