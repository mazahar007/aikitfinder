import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Explore AI tools",
  description: "Search and filter AI tools by task, category, skill level and pricing.",
  alternates: { canonical: "/tools" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Explore AI tools"
      description="Search and filter AI tools by task, category, skill level and pricing."
      phase="Phase 2"
    />
  );
}
