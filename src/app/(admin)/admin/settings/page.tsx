import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "General Settings" };

export default function Page() {
  return (
    <SectionPage
      title="General Settings"
      description="Platform-wide settings."
      permission="settings.write"
      notBuilt="Product availability, maintenance mode, feature flags and email settings. Dependency settings are under Dependencies & Integrations."
    />
  );
}
