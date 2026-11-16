import type { Metadata } from "next";
import Link from "next/link";

import { ToolForm } from "@/components/admin/catalog-forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { listCategories } from "@/lib/admin/catalog";

export const metadata: Metadata = { title: "Add tool" };

export default async function NewToolPage() {
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
        title="Add tool"
        description="A new tool starts as an unpublished, unverified draft. Add sources, then publish and verify it."
      />
      <Panel>
        <ToolForm tool={null} categories={categories} />
      </Panel>
    </>
  );
}
