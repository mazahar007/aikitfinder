import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";
import { Panel, StatCard } from "@/components/admin/ui";
import { PipelineDependencies } from "@/components/autoflow/pipeline-dependencies";
import { getIntegrationStatuses, getOverview } from "@/lib/admin/data";

export const metadata: Metadata = { title: "AutoFlow Projects" };

export default async function Page() {
  const [o, statuses] = await Promise.all([getOverview(), getIntegrationStatuses()]);
  return (
    <SectionPage
      title="AutoFlow Projects"
      description="Project counts and what each pipeline stage depends on. Users' scripts, audio and video are private and are not shown here."
      permission="projects.status.read"
      notBuilt="Project lists by user, generation job monitoring, failed-job inspection and render status. No pipeline stage runs yet."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Projects" value={o?.projects_total ?? "—"} />
        <StatCard label="Generation jobs" unavailable="The job system is not built yet." />
        <StatCard label="Failed jobs" unavailable="The job system is not built yet." />
      </div>
      <Panel title="Pipeline dependencies">
        <div className="p-4">
          <PipelineDependencies statuses={statuses} />
        </div>
      </Panel>
    </SectionPage>
  );
}
