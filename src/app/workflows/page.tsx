import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Workflows",
  description: "Combine several AI tools into a repeatable process.",
  alternates: { canonical: "/workflows" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Workflows"
      description="Combine several AI tools into a repeatable process."
      phase="Phase 2"
    />
  );
}
