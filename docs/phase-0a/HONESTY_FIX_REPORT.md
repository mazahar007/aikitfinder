# Honesty Fix Report

A separate, limited task approved by the owner on 11 Nov 2026 (decision F-05). It corrects
misleading labels only. It is not the homepage redesign, and no feature was added.

**Commit:** `af43db0` on `claude/main` · **Not deployed to production.**

## 1. What changed

| Requested fix                                        | What was done                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Remove Verified badges from fictional sample records | `VerificationBadge` takes a `sample` flag. A sample record always shows "Not verified yet" and never a verification date, whatever its demo fields say. Applied on tool cards, tool pages (including each setting), guides, workflows, deals, pricing, sources lists and the compare table |
| Same for "Tested"                                    | `TestedBadge` and the tool-page prompt badge never show "Tested" on a sample record                                                                                                                                                                                                        |
| Clearly identify sample and demo data                | The hero badge now reads "Prototype · sample data". The prototype notice moved from about eight screens down to directly under the hero, before the first sample record. The two homepage mock-ups that said "Tested" and "✓ Verified" now say "Sample"                                    |
| Remove "Free to use" and similar claims              | Removed "Free to use · No sign-up" (hero) and "Free to use · No sign-up needed" (closing section). Removed two outcome promises: "help you get better results" and "so your first try is a good one"                                                                                       |
| Remove or correct unverified tool counts             | The homepage preview "3 matching tools" now reads "3 sample results". No total tool count was ever displayed. Per-category counts are computed from the listed records and sit under the sample notice; they were left as they are                                                         |
| Label simulated analytics and workflow statuses      | No analytics are displayed anywhere in the application, so nothing needed labelling. Workflow step modes already carry an explanation that nothing is run automatically. On sample workflows, "Verified free plan" now reads "Free plan (sample data)"                                     |
| Unsupported editorial labels                         | "Editor's picks" → "Sample tools"; "Popular workflows" → "Example workflows"; "Popular searches" (screen-reader label) → "Example searches"                                                                                                                                                |
| Unconfirmed domain                                   | The mock address bar no longer shows `aikitfinder.com`                                                                                                                                                                                                                                     |
| Unlink Deals                                         | Removed from the header, mobile menu and footer, and from the sitemap's static paths                                                                                                                                                                                                       |
| Unlink VoiceHub                                      | Removed from the header and mobile menu                                                                                                                                                                                                                                                    |

## 2. What was deliberately not changed

- **Deals and VoiceHub code and routes.** `/deals`, `/deals/[slug]`, `/voicehub` and
  `/api/voicehub/*` still exist and still work when opened by URL. Nothing was deleted. The
  `voicehubo.vercel.app` deployment was not touched.
- **Sample data files.** The fictional records keep their demo fields, so the pricing and compare
  layouts can still be demonstrated. The rule is enforced where badges are drawn.
- **Guides and Workflows.** Kept, as decided.
- **Design, layout, motion and routes.** Unchanged.

## 3. Changed files

17 files, 98 insertions, 46 deletions.

| File                                         | Change                                    |
| -------------------------------------------- | ----------------------------------------- |
| `src/components/content/badges.tsx`          | `sample` rule on `VerificationBadge`      |
| `src/components/content/prompt-card.tsx`     | `sample` rule on `TestedBadge`            |
| `src/components/content/cards.tsx`           | Passes the sample flag                    |
| `src/components/content/deal-card.tsx`       | Passes the sample flag                    |
| `src/components/content/pricing-section.tsx` | Passes the sample flag                    |
| `src/components/content/sources-list.tsx`    | New `isSample` prop                       |
| `src/components/compare/compare-table.tsx`   | Passes the sample flag                    |
| `src/app/tools/[slug]/page.tsx`              | Tool, settings, prompts and sources       |
| `src/app/guides/[slug]/page.tsx`             | Guide badge and sources                   |
| `src/app/workflows/[slug]/page.tsx`          | Workflow badge and cost labels            |
| `src/app/prompts/[slug]/page.tsx`            | Tested badge and text                     |
| `src/app/deals/[slug]/page.tsx`              | Sources and "Last checked"                |
| `src/app/page.tsx`                           | Hero badge, copy, labels, notice position |
| `src/components/home/story.tsx`              | Mock labels and copy                      |
| `src/components/home/showcase-scenes.tsx`    | Kicker, mock labels, closing line         |
| `src/config/site.ts`                         | Navigation and footer links               |
| `src/app/sitemap.ts`                         | Static paths                              |

## 4. Test report

| Check               | Result                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`    | Pass                                                                                                                                                                                                |
| `pnpm build`        | Pass; 89 static pages, same route table                                                                                                                                                             |
| `pnpm lint`         | 1 error — pre-existing and unrelated (`src/app/voicehub/page.tsx`); no new problems                                                                                                                 |
| `pnpm format:check` | 5 files — pre-existing and unrelated (VoiceHub); the 17 changed files are formatted                                                                                                                 |
| Automated tests     | None exist in the repository                                                                                                                                                                        |
| Route check         | 20 existing routes return 200, including `/deals`, `/deals/storyreel-extended-trial` and `/voicehub` opened directly                                                                                |
| Rendered-text scan  | 15 pages scanned in a browser: no "Verified" badge, no verification date, no "Tested", no "Free to use" or "No sign-up", no "Editor's picks", no "Popular workflows/searches", no `aikitfinder.com` |
| Navigation scan     | No header or footer link to Deals or VoiceHub on any of the 15 pages; mobile menu lists Explore Tools, Guides, Prompts, Workflows, About                                                            |
| Layout              | No horizontal overflow at 1440 px or 390 px; no page errors                                                                                                                                         |

Pages scanned: `/`, `/tools`, two tool pages, a category, guides index and detail, prompts index
and detail, workflows index and detail, compare with three tools, search, deals index and detail.

`/directory` returns 404. That is expected: the route is approved but belongs to Phase 2.

## 5. Left for follow-up

| Item                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool pages still show related sample offers that link to `/deals/…`. The offers are labelled Sample and no longer show Verified. Hiding them is a small further change if wanted |
| British spellings in the interface (for example "Summarise") are not yet converted to American English                                                                           |
| `README.md` still describes the project as a "free" directory. It is a developer document, not product copy                                                                      |
| The filter legends "Pricing model (verified only)" and "Plans (verified, recently checked)" describe the real rule but sit over sample data                                      |
| The VoiceHub lint and format failures and its Bengali error message                                                                                                              |
