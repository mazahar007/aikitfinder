import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Our privacy policy will be published before public launch.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <PagePlaceholder
      title="Privacy policy"
      description="Our privacy policy will be published before public launch."
      phase="Phase 7"
    />
  );
}
