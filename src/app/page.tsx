import Link from "next/link";

import {
  CategoryCard,
  GuideCard,
  SectionHeader,
  ToolCard,
  WorkflowCard,
} from "@/components/content/cards";
import { SampleNotice } from "@/components/content/sample-notice";
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
  getRecentlyUpdated,
  getTools,
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

      <Container className="pt-8">
        <SampleNotice />
      </Container>

      <section aria-labelledby="categories-heading">
        <Container className="py-12">
          <SectionHeader
            id="categories-heading"
            title="Browse by category"
            description="Start from what you want to make or get done."
            href="/categories"
            linkLabel="All categories"
          />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((c, i) => (
              <li key={c.slug} {...reveal(i, 4)}>
                <CategoryCard category={c} toolCount={counts[c.slug] ?? 0} compact />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="featured-heading" className="border-y bg-card">
        <Container className="py-12">
          <SectionHeader
            id="featured-heading"
            title="Featured tools"
            description="Chosen by our editors for being useful and beginner-friendly."
            href="/tools"
            linkLabel="Explore all tools"
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((t, i) => (
              <li key={t.slug} {...reveal(i)}>
                <ToolCard tool={t} categoryName={categoryName(t.categorySlugs[0])} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="guides-heading">
        <Container className="py-12">
          <SectionHeader
            id="guides-heading"
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
          <SectionHeader id="recent-heading" title="Recently updated" />
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
    </>
  );
}
