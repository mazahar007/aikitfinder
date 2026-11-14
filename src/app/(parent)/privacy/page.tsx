import type { Metadata } from "next";

import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Our privacy policy will be published before public launch.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <>
      <ParentHeader />
      <main id="main" tabIndex={-1} className="inner">
        <PagePlaceholder
          title="Privacy policy"
          description="Our privacy policy will be published before public launch."
          phase="Phase 7"
        />
      </main>
      <ParentFooter />
    </>
  );
}
