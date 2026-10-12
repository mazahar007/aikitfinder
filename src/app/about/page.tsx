import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "About AIKitFinder",
  description: "Why AIKitFinder exists and how we keep information accurate.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="About AIKitFinder"
      description="Why AIKitFinder exists and how we keep information accurate."
      phase="Phase 2"
    />
  );
}
