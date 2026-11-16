import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "YouTube Publishing" };

export default function Page() {
  return (
    <SectionPage
      title="YouTube Publishing"
      description="Uploads go to an owner's own channel, as Private by default, and only after that owner's approval."
      permission="integrations.read"
      integrationKeys={["youtube_publishing", "google_oauth"]}
      notBuilt="Channel connection, uploads and publishing history. No Google project is connected, and nothing can be published."
    />
  );
}
