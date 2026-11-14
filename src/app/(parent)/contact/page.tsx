import type { Metadata } from "next";

import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach us or report outdated information.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <>
      <ParentHeader />
      <main id="main" tabIndex={-1} className="inner">
        <PagePlaceholder
          title="Contact"
          description="How to reach us or report outdated information."
          phase="Phase 7"
        />
      </main>
      <ParentFooter />
    </>
  );
}
