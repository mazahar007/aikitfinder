import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GuideCard, SectionHeader, ToolCard } from "@/components/content/cards";
import { CategoryIcon } from "@/components/content/category-icon";
import { EmptyState } from "@/components/content/empty-state";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getCategory,
  getGuidesInCategory,
  getSubcategories,
  getToolsInCategory,
} from "@/lib/content/repository";
import { reveal } from "@/lib/motion";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} tools`,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const [tools, guides, subcategories, parent] = await Promise.all([
    getToolsInCategory(slug),
    getGuidesInCategory(slug),
    getSubcategories(slug),
    category.parentSlug ? getCategory(category.parentSlug) : undefined,
  ]);
  const shortName = category.name.replace(/^AI /, "");

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          ...(parent
            ? [{ label: parent.name.replace(/^AI /, ""), href: `/categories/${parent.slug}` }]
            : []),
          { label: shortName },
        ]}
      />
      <div className="mt-4 flex items-start gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-tint text-primary-hover">
          <CategoryIcon icon={category.icon} className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-h1">
            {category.name}
          </h1>
          <p className="mt-1 max-w-2xl text-lead text-muted-foreground">{category.description}</p>
        </div>
      </div>
      {tools.length ? <SampleNotice className="mt-6" /> : null}

      {subcategories.length ? (
        <nav aria-label={`${shortName} subcategories`} className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {subcategories.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/categories/${s.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <section aria-labelledby="category-tools" className="mt-10">
        <SectionHeader
          id="category-tools"
          title={`Tools (${tools.length})`}
          href={tools.length && !category.parentSlug ? `/tools?category=${slug}` : undefined}
          linkLabel="Filter these tools"
        />
        {tools.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t, i) => (
              <li key={t.slug} {...reveal(i)}>
                <ToolCard tool={t} compare />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={`No ${shortName.toLowerCase()} tools yet`}>
            <p>We’re still researching this category. In the meantime, explore all tools.</p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/tools">Explore all tools</Link>
            </Button>
          </EmptyState>
        )}
      </section>

      {guides.length ? (
        <section aria-labelledby="category-guides" className="mt-14">
          <SectionHeader
            id="category-guides"
            title="Guides"
            href="/guides"
            linkLabel="All guides"
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g, i) => (
              <li key={g.slug} {...reveal(i)}>
                <GuideCard guide={g} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
