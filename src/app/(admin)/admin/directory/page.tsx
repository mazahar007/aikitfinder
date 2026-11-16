import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";
import { StatCard } from "@/components/admin/ui";
import { getOverview } from "@/lib/admin/data";

export const metadata: Metadata = { title: "AI Directory" };

export default async function Page() {
  const o = await getOverview();
  return (
    <SectionPage
      title="AI Directory"
      description="Tools, categories, pricing, sources and verification."
      permission="catalog.write"
      notBuilt="Creating, editing, publishing and verifying tools, and managing categories, guides, prompts and workflows. The public Directory currently shows labeled sample records from code, not database rows."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tools in the database" value={o?.tools_total ?? "—"} />
        <StatCard label="Published tools" value={o?.tools_published ?? "—"} />
        <StatCard label="Categories in the database" value={o?.categories ?? "—"} />
      </div>
    </SectionPage>
  );
}
