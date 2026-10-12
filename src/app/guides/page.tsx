import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step tutorials that take you from setup to a finished result.",
  alternates: { canonical: "/guides" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Guides"
      description="Step-by-step tutorials that take you from setup to a finished result."
      phase="Phase 2"
    />
  );
}
