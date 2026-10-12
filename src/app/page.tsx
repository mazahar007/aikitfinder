import Link from "next/link";

import { CategoryCard, GuideCard, SectionHeader, WorkflowCard } from "@/components/content/cards";
import { SampleNotice } from "@/components/content/sample-notice";
import { OutlineMarquee, Ribbons, Squiggle } from "@/components/home/showcase";
import {
  ClosingCta,
  CloudWipe,
  FeaturedRail,
  ZoomShowcase,
} from "@/components/home/showcase-scenes";
import { Story } from "@/components/home/story";
import { ScrollScenes } from "@/components/motion/scroll-scenes";
import { Container } from "@/components/layout/container";
import { SearchForm } from "@/components/search/search-form";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/content/labels";
import { enterDelay, reveal } from "@/lib/motion";
import {
  getCategories,
  getCategoryToolCounts,
  getFeaturedGuides,
  getFeaturedTools,
  getFeaturedWorkflows,
  getGuide,
  getRecentlyUpdated,
  getTool,
  getTools,
  getToolsBySlugs,
  getWorkflow,
} from "@/lib/content/repository";

const typingExamples = [
  "make a video from a blog post",
  "remove an image background",
  "summarise a long PDF",
  "explain this code",
  "write a cover letter",
];

const suggestions = [
  "Write a blog post",
  "Make a video from text",
  "Summarise a document",
  "Fix my code",
];

export default async function HomePage() {
  const [categories, counts, tools, featuredTools, guides, workflows, recent] = await Promise.all([
    getCategories(),
    getCategoryToolCounts(),
    getTools(),
    getFeaturedTools(6),
    getFeaturedGuides(3),
    getFeaturedWorkflows(3),
    getRecentlyUpdated(5),
  ]);
  // Content for the story previews (one example per chapter).
  const [discoverTools, storyGuide, promptTool, storyWorkflow] = await Promise.all([
    getToolsBySlugs(["storyreel", "draftwise", "pictora"]),
    getGuide("blog-post-to-video"),
    getTool("storyreel"),
    getWorkflow("blog-to-social-video"),
  ]);
  const storyPrompt = promptTool?.prompts[0];
  const exampleTools = (categorySlug: string) =>
    tools
      .filter((t) => t.categorySlugs.includes(categorySlug))
      .slice(0, 2)
      .map((t) => t.name);
  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name.replace(/^AI /, "");
  const toolNames = (slugs: string[]) =>
    slugs.map((s) => tools.find((t) => t.slug === s)?.name).filter((n): n is string => !!n);
  const recentHref = (r: (typeof recent)[number]) =>
    `/${r.type === "tool" ? "tools" : r.type === "guide" ? "guides" : "workflows"}/${r.item.slug}`;
  const recentTitle = (r: (typeof recent)[number]) =>
    r.type === "tool" ? r.item.name : r.item.title;

  return (
    <>
      <section className="relative overflow-hidden border-b bg-card">
        <div className="aurora" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <Container className="relative py-16 text-center sm:py-24">
          <Badge variant="info" className="enter mb-5" style={enterDelay(0)}>
            Free to use · No sign-up
          </Badge>
          <h1 className="mx-auto max-w-3xl text-[2.25rem] leading-tight font-extrabold tracking-tight text-balance text-heading sm:text-display">
            <span className="enter inline-block" style={enterDelay(1)}>
              Find the right AI tool.
            </span>{" "}
            <span className="enter inline-block" style={enterDelay(2)}>
              Learn it.
            </span>{" "}
            <span className="enter inline-block" style={enterDelay(3)}>
              <span className="text-gradient">Use it.</span>
            </span>
          </h1>
          <p
            className="enter mx-auto mt-4 max-w-2xl text-lead text-muted-foreground"
            style={enterDelay(4)}
          >
            Explore AI tools, understand their settings, follow practical tutorials, and discover
            workflows that help you get better results.
          </p>
          <div className="enter mx-auto mt-8 max-w-2xl" style={enterDelay(5)}>
            <SearchForm variant="hero" id="hero-search" typingExamples={typingExamples} />
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Popular searches">
            {suggestions.map((q, i) => (
              <li key={q} className="enter-fade" style={enterDelay(6 + i)}>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="inline-flex min-h-9 items-center rounded-full border bg-card/80 px-3.5 text-sm text-foreground backdrop-blur transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary-tint hover:text-primary-hover"
                >
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ScrollScenes>
        <Ribbons />
        {storyGuide && promptTool && storyPrompt && storyWorkflow ? (
          <Story
            discoverTools={discoverTools}
            guide={storyGuide}
            promptTool={promptTool}
            prompt={storyPrompt}
            workflow={storyWorkflow}
            workflowTools={tools}
          />
        ) : null}
        <FeaturedRail tools={featuredTools} categoryName={categoryName} />
        <ZoomShowcase />
        <CloudWipe direction="to-light" />

        <Container className="pt-4">
          <SampleNotice />
        </Container>

        <section aria-labelledby="categories-heading">
          <Container className="py-12">
            <SectionHeader
              id="categories-heading"
              kicker="Explore"
              title="Browse by category"
              description="Start from what you want to make or get done."
              href="/categories"
              linkLabel="All categories"
            />
            <ul data-category-grid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c, i) => (
                <li key={c.slug} {...reveal(i, 4)}>
                  <CategoryCard
                    category={c}
                    toolCount={counts[c.slug] ?? 0}
                    toolNames={exampleTools(c.slug)}
                    compact
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <Squiggle className="my-2" />
        <OutlineMarquee words={["Find it", "Learn it", "Use it"]} />

        <section aria-labelledby="guides-heading">
          <Container className="py-12">
            <SectionHeader
              id="guides-heading"
              kicker="Learn"
              title="Beginner quick starts"
              description="Short, step-by-step guides with a clear result at the end."
              href="/guides"
              linkLabel="All guides"
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g, i) => (
                <li key={g.slug} {...reveal(i)}>
                  <GuideCard guide={g} toolNames={toolNames(g.toolSlugs)} />
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section aria-labelledby="workflows-heading" className="border-y bg-card">
          <Container className="py-12">
            <SectionHeader
              id="workflows-heading"
              kicker="Automate"
              title="Popular workflows"
              description="Combine tools into a process you can repeat."
              href="/workflows"
              linkLabel="All workflows"
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workflows.map((w, i) => (
                <li key={w.slug} {...reveal(i)}>
                  <WorkflowCard workflow={w} />
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section aria-labelledby="recent-heading">
          <Container className="py-12">
            <SectionHeader id="recent-heading" kicker="Fresh" title="Recently updated" />
            <ul className="divide-y rounded-md border bg-card">
              {recent.map((r, i) => (
                <li key={`${r.type}-${r.item.slug}`} {...reveal(i, 1)}>
                  <Link
                    href={recentHref(r)}
                    className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-surface-subtle"
                  >
                    <Badge variant={r.type === "tool" ? "info" : "learn"} className="capitalize">
                      {r.type}
                    </Badge>
                    <span className="font-medium text-foreground">{recentTitle(r)}</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      Updated {formatDate(r.item.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <ClosingCta />
      </ScrollScenes>
    </>
  );
}
