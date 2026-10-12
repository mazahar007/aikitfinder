import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Our terms of use will be published before public launch.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Terms of use"
      description="Our terms of use will be published before public launch."
      phase="Phase 7"
    />
  );
}
