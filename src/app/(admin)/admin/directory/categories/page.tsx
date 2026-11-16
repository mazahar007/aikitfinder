import type { Metadata } from "next";
import Link from "next/link";

import { CategoryForm } from "@/components/admin/catalog-forms";
import { EmptyRow, PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { listCategories } from "@/lib/admin/catalog";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin("catalog.write");
  const categories = (await listCategories()) ?? [];
  return (
    <>
      <Link
        href="/admin/directory"
        className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← AI Directory
      </Link>
      <PageHeader
        title="Categories"
        description="Two levels: top-level categories and their subcategories."
      />
      <Panel title="Add a category">
        <CategoryForm parents={categories} />
      </Panel>
      <Panel title={`Existing categories (${categories.length})`}>
        {categories.length === 0 ? (
          <EmptyRow>No categories yet.</EmptyRow>
        ) : (
          <ul className="divide-y">
            {categories.map((c) => (
              <li key={c.id}>
                <details>
                  <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-3 px-4 py-2 text-sm">
                    <span className="font-medium text-foreground">
                      {c.parent_name ? `${c.parent_name} › ${c.name}` : c.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{c.slug}</span>
                    <span className="ml-auto text-muted-foreground">
                      {c.tool_count} {c.tool_count === 1 ? "tool" : "tools"}
                    </span>
                  </summary>
                  <CategoryForm category={c} parents={categories} />
                </details>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
