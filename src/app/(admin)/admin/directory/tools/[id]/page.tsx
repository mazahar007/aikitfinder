import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PricingForm, PublishPanel, SourceList, ToolForm } from "@/components/admin/catalog-forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/access";
import { getTool, listCategories, statusLabel, verificationLabel } from "@/lib/admin/catalog";

export const metadata: Metadata = { title: "Edit tool" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditToolPage({
  params,
  searchParams,
}: PageProps<"/admin/directory/tools/[id]">) {
  const admin = await requireAdmin("catalog.write");
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [tool, categories, sp] = await Promise.all([getTool(id), listCategories(), searchParams]);
  if (!tool) notFound();

  return (
    <>
      <Link
        href="/admin/directory"
        className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← AI Directory
      </Link>
      <PageHeader title={tool.name} description={tool.short_description}>
        <div className="flex flex-wrap gap-2">
          <Badge variant={tool.status === "published" ? "success" : "warning"}>
            {statusLabel[tool.status]}
          </Badge>
          <Badge variant={tool.verification === "verified" ? "success" : "neutral"}>
            {verificationLabel[tool.verification]}
          </Badge>
        </div>
      </PageHeader>
      {sp.created ? (
        <p
          role="status"
          className="rounded-lg border border-success/40 bg-success-tint px-4 py-3 text-sm"
        >
          Draft created. Add official sources below, then publish and verify it.
        </p>
      ) : null}
      {tool.is_sample ? (
        <p
          role="note"
          className="rounded-lg border border-warning/40 bg-warning-tint px-4 py-3 text-sm"
        >
          This is a sample record. It cannot be edited or published.
        </p>
      ) : null}
      <Panel title="Publishing and verification">
        <PublishPanel tool={tool} canPublish={admin.permissions.has("catalog.publish")} />
      </Panel>
      <Panel title="Official sources">
        <SourceList tool={tool} />
      </Panel>
      <Panel title="Details">
        <ToolForm tool={tool} categories={categories ?? []} />
      </Panel>
      <Panel title="Pricing plans">
        <PricingForm tool={tool} />
      </Panel>
    </>
  );
}
