import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach us or report outdated information.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Contact"
      description="How to reach us or report outdated information."
      phase="Phase 7"
    />
  );
}
