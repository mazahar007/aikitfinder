import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: "How we research, source and verify tool information.",
  alternates: { canonical: "/editorial-policy" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Editorial policy"
      description="How we research, source and verify tool information."
      phase="Phase 7"
    />
  );
}
