import type { Metadata } from "next";

import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "About AIKitFinder",
  description: "Why AIKitFinder exists and how we keep information accurate.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <>
      <ParentHeader />
      <main id="main" tabIndex={-1} className="inner">
        <PagePlaceholder
          title="About AIKitFinder"
          description="Why AIKitFinder exists and how we keep information accurate."
          phase="Phase 2"
        />
      </main>
      <ParentFooter />
    </>
  );
}
