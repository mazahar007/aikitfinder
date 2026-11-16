import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Storage" };

export default function Page() {
  return (
    <SectionPage
      title="Storage"
      description="Where images, audio and video will be kept."
      permission="integrations.read"
      integrationKeys={["file_storage", "object_storage"]}
      notBuilt="Uploads, the file browser and usage figures. No bucket is connected, so nothing is stored."
    />
  );
}
