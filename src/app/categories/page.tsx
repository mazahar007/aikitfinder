import type { Metadata } from "next";

import { CategoryCard } from "@/components/content/cards";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { getCategories, getCategoryToolCounts } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "AI tool categories",
  description: "Browse AI tools by what they help you do: video, images, writing, code and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getCategoryToolCounts()]);
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        Browse by category
      </h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Start from what you want to make or get done.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <CategoryCard category={c} toolCount={counts[c.slug] ?? 0} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
