# Homepage Content Truth Check — Phase 0A

Every material claim, label and number on the current Next.js homepage, checked against what the
code actually does at commit `f43a278`.

## Classification

| Status                   | Meaning                                            |
| ------------------------ | -------------------------------------------------- |
| Implemented and verified | True of the running product; checked in this audit |
| Partially implemented    | Partly true                                        |
| Demo/simulated           | True only of fictional sample data                 |
| Planned                  | Not built                                          |
| Unverified / unsupported | Nothing in the product backs it                    |

## 1. Current homepage claims

### Header and metadata

| Text                                                                   | Status                   | Evidence                                             | Action                               |
| ---------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------- | ------------------------------------ |
| Title: "AIKitFinder: Find the right AI tool. Learn it. Use it."        | Partially implemented    | Accurate for a directory; omits AutoFlow             | Rewrite for the parent brand         |
| Description: "…practical guides, settings explanations and workflows." | Demo/simulated           | All guides and workflows are fictional samples       | Rewrite; do not imply a real library |
| Nav: "Deals"                                                           | Demo/simulated           | 8 fictional offers                                   | Remove from navigation               |
| Nav: "VoiceHub"                                                        | Partially implemented    | Page exists; generation is now turned off by default | Remove from navigation               |
| Search placeholder "Search tools and guides"                           | Implemented and verified | Search works across content types                    | Keep (Directory)                     |

### Hero

| Text                                                                                                                                | Status                   | Evidence                                                                  | Action                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- | ---------------------------------- |
| "Free to use · No sign-up"                                                                                                          | Unverified / unsupported | No pricing policy exists; accounts are planned                            | **Remove**                         |
| "Find the right AI tool. Learn it. Use it."                                                                                         | Demo/simulated           | The catalogue is fictional                                                | Move to Directory home             |
| "Explore AI tools, understand their settings, follow practical tutorials, and discover workflows that help you get better results." | Demo/simulated           | Features work; content is fictional; "better results" is an outcome claim | Soften; drop the outcome promise   |
| "What do you want to do?" (search)                                                                                                  | Partially implemented    | Keyword matching, not natural-language understanding                      | Keep; do not describe as AI search |
| "Popular searches" (list label)                                                                                                     | Unverified / unsupported | Four hard-coded strings; no usage data                                    | Rename "Example searches"          |

### Story chapters

| Text                                                                                                 | Status                   | Evidence                                                     | Action                                            |
| ---------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------- |
| "Describe the task. Get the right tools."                                                            | Partially implemented    | Keyword search over 23 samples                               | Keep with honest wording                          |
| "We match it to tools, guides and prompts, and you can filter by skill level and budget."            | Partially implemented    | Filters exist; "match" is keyword overlap                    | Reword "We search tools, guides and prompts"      |
| Preview: "3 matching tools"                                                                          | Demo/simulated           | Three fixed slugs, not a live result                         | Label as an example                               |
| "Step-by-step, in plain English."                                                                    | Demo/simulated           | Six fictional guides                                         | Keep on Directory with sample label               |
| "Tool pages explain settings and limits, with sources and a checked date."                           | Demo/simulated           | Fields exist; sources point to example.com                   | Keep; label samples                               |
| "Copy a prompt. Get a result." / "so your first try is a good one"                                   | Unverified / unsupported | Outcome promise; all sample prompts are marked untested      | Remove the outcome promise                        |
| Preview prompt badge "Tested"                                                                        | Unverified / unsupported | Shown on a fictional prompt                                  | Remove the badge on samples                       |
| Kicker "Automate" / "Chain tools into a workflow." / "Recipes pass one tool's output into the next." | Unverified / unsupported | Workflows are written instructions; nothing is passed or run | Rename "Combine"; say "follow the steps yourself" |

### Featured tools and showcase

| Text                                                                                   | Status                   | Evidence                                           | Action                             |
| -------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------- | ---------------------------------- |
| Kicker "Editor's picks"                                                                | Unverified / unsupported | No editor; fictional tools                         | Rename "Sample tools"              |
| "Useful, beginner-friendly picks. These are fictional sample tools for the prototype." | Implemented and verified | Accurate disclosure                                | Keep the disclosure                |
| Card badge "Verified · 1 Oct 2026" (and similar)                                       | Unverified / unsupported | Fictional records carry `verification: "verified"` | **Remove** on all sample records   |
| Card badge "Sample"                                                                    | Implemented and verified | Driven by `isSample`                               | Keep                               |
| Pricing labels "Freemium", "Paid"; "API" badge                                         | Demo/simulated           | Invented for samples                               | Keep only with the Sample label    |
| "One page. Everything you need."                                                       | Unverified / unsupported | Absolute claim                                     | Reword "What a tool page includes" |
| Mock address bar "aikitfinder.com/tools/storyreel"                                     | Unverified / unsupported | Domain ownership is unconfirmed                    | Remove the domain from the mock    |
| Mock badge "Verified" in the zoom card                                                 | Unverified / unsupported | Decorative, on a fictional tool                    | Replace with "Sample"              |
| "Sources and a checked date — So you know how fresh the information is."               | Demo/simulated           | Feature exists; data is fictional                  | Keep                               |

### Lower sections

| Text                                                                                                   | Status                   | Evidence                                   | Action                             |
| ------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------ | ---------------------------------- |
| "Prototype: every tool, guide and workflow shown here is a fictional sample… Links go to example.com." | Implemented and verified | Accurate                                   | Keep; move above the first sample  |
| Category counts ("1 tool", "3 tools")                                                                  | Demo/simulated           | Computed, not hard-coded, but from samples | Keep computation; label as sample  |
| "Beginner quick starts"                                                                                | Demo/simulated           | Three sample guides                        | Keep on Directory                  |
| "Popular workflows"                                                                                    | Unverified / unsupported | No popularity data                         | Rename "Example workflows"         |
| "3 steps (1 can be automated)"                                                                         | Partially implemented    | A label on a step; nothing is automated    | Keep with the existing explanation |
| "Recently updated" with dates                                                                          | Demo/simulated           | Dates are invented sample values           | Hide until real records exist      |
| "Start exploring AI tools"                                                                             | Implemented and verified | Links to `/tools`                          | Keep on Directory                  |
| "Free to use · No sign-up needed"                                                                      | Unverified / unsupported | As the hero badge                          | **Remove**                         |

### Footer

| Text                                                                      | Status                   | Evidence                                   | Action                           |
| ------------------------------------------------------------------------- | ------------------------ | ------------------------------------------ | -------------------------------- |
| "AIKitFinder is an independent guide. Tool names belong to their owners…" | Implemented and verified | No sponsorship or affiliate code exists    | Keep                             |
| Links: About, Editorial policy, Contact, Privacy, Terms                   | Partially implemented    | Routes exist as "In progress" placeholders | Real copy required before launch |
| Link: Deals                                                               | Demo/simulated           | Fictional offers                           | Remove                           |

## 2. Claims the handoff warns about

| Risk area                                          | On the current homepage? | Note                                                       |
| -------------------------------------------------- | ------------------------ | ---------------------------------------------------------- |
| Tool count ("1200+ tools")                         | No                       | No total is displayed; per-category counts are computed    |
| Verified labels on samples                         | **Yes**                  | Featured rail and zoom mock                                |
| Free / price claims                                | **Yes**                  | Two "Free to use" statements                               |
| Integration claims                                 | No                       |                                                            |
| AI provider status                                 | No                       |                                                            |
| Voice names                                        | No                       | (VoiceHub page lists two voice names; not on the homepage) |
| YouTube / API behaviour                            | No                       |                                                            |
| Rendering time                                     | No                       |                                                            |
| SEO scores                                         | No                       |                                                            |
| Views / CTR metrics                                | No                       |                                                            |
| Publishing privacy options                         | No                       |                                                            |
| Testimonials, ratings, user counts, customer logos | No                       |                                                            |

The current page is cleaner than the handoff's HTML prototype was. Its problems are the "free"
claims, Verified-on-sample badges, and editorial labels ("Editor's picks", "Popular") with nothing
behind them.

## 3. Proposed homepage copy, pre-checked

Every statement proposed in the wireframes, with the condition under which it is true.

| Proposed text                                                                                    | True when                                      | Status today                                               |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------- |
| "One account · Two AI products"                                                                  | Shared authentication is live                  | Planned — show only after Phase 1                          |
| "Discover AI tools. Create content with AI."                                                     | Describes the two products' purposes           | Acceptable as positioning                                  |
| "a directory for finding and comparing AI tools"                                                 | Directory search and compare work              | Demo/simulated — pair with a sample-data label             |
| "AutoFlow AI, a studio for planning and producing video content"                                 | AutoFlow exists                                | Planned — must carry "In development"                      |
| "Browsing the directory needs no account."                                                       | Public routes stay open                        | Implemented and verified                                   |
| "AutoFlow AI is in development."                                                                 | Until AutoFlow ships                           | Accurate today                                             |
| Directory card: "Available · sample data"                                                        | Until real records are published               | Accurate today                                             |
| "Compare up to four tools side by side"                                                          | `COMPARE_MAX` is 4                             | Implemented and verified                                   |
| "Sources and a last-checked date on every profile"                                               | Real records carry both                        | Demo/simulated — reword "on tool profiles" until real data |
| "Voiceover and subtitles in many languages"                                                      | Multilingual output is built                   | Planned — label; never name a language count               |
| "You review and approve before anything is published"                                            | Approval gate is enforced server-side          | Planned — binding design rule; label                       |
| "One login works in both products."                                                              | Shared authentication is live                  | Planned                                                    |
| "tools listed in the Directory are not connected to AutoFlow AI unless an integration is stated" | Always                                         | Accurate                                                   |
| "Demo records are marked 'Sample' and never shown as verified."                                  | Verified badges are removed from samples       | **False today** — fix first (see redesign plan, P0)        |
| "AutoFlow AI will never publish without your explicit approval."                                 | Enforced in the backend                        | Planned — a commitment the build must honour               |
| "Features that are not built yet are labelled as planned."                                       | Every planned item on the page carries a label | Must be made true by the redesign                          |

### Wording rules for the redesign

- No totals of tools, users, videos, views or languages unless computed from real records.
- No "free", "unlimited", "guaranteed", "instant", "best" or "fully automated".
- No provider or platform logos until the integration works. Text labels with a status only.
- "Verified" appears only on a real record with a verification date.
- AutoFlow features are written in the future or labelled "Planned" until they run.
- Social publishing, inbox and comment automation (v18) are not mentioned on the parent homepage
  until they exist. They may appear on the AutoFlow landing page as "Planned".
- The SEO score, when it exists, is always "Estimated AutoFlow SEO Score".

## 4. FAQ answers, pre-checked

Draft answers for the proposed FAQ. Two need owner confirmation.

| Question                                            | Draft answer                                                                                                                                    | Check                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Do I need an account?                               | No account is needed to browse the Directory. An account is needed to save items and to use AutoFlow AI.                                        | True once auth ships                     |
| Is AIKitFinder free?                                | Browsing the Directory does not require payment. Pricing for AutoFlow AI has not been announced.                                                | **Owner to confirm**                     |
| How is tool information verified?                   | Each fact is checked against the tool's official source and dated. Anything not yet checked is labelled. Records marked "Sample" are fictional. | True of the design; real records pending |
| Which AI providers does AutoFlow AI use?            | AutoFlow AI is being built to work with several providers, starting with Claude. You connect your own provider accounts.                        | **Owner to confirm** wording on keys     |
| Will AutoFlow AI post to my channels automatically? | No. Nothing is published until you review and approve it.                                                                                       | Binding design rule                      |
| What happens to my data?                            | Link to the Privacy page.                                                                                                                       | Privacy copy does not exist yet          |
