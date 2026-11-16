import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "AI Providers" };

export default function Page() {
  return (
    <SectionPage
      title="AI Providers"
      description="The outside AI services AutoFlow will call. Keys are stored encrypted on the server and are never shown again after saving."
      permission="integrations.read"
      integrationKeys={["research_provider", "llm_api", "voice_provider", "video_provider"]}
      notBuilt="Provider adapters, real connection tests, usage and cost tracking, and rate limits. No AI provider is connected."
    />
  );
}
