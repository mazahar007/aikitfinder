import type { Metadata } from "next";

import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Editorial policy",
  description: "How we research, source and verify tool information.",
  alternates: { canonical: "/editorial-policy" },
};

export default function Page() {
  return (
    <>
      <ParentHeader />
      <main id="main" tabIndex={-1} className="inner">
        <PagePlaceholder
          title="Editorial policy"
          description="How we research, source and verify tool information."
          phase="Phase 7"
        />
      </main>
      <ParentFooter />
    </>
  );
}
