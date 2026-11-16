import type { Metadata } from "next";
import Link from "next/link";

import { PipelineDependencies } from "@/components/autoflow/pipeline-dependencies";
import { ProjectCard } from "@/components/autoflow/project-card";
import { StageRail } from "@/components/autoflow/stage-rail";
import { Button } from "@/components/ui/button";
import { getIntegrationStatuses } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects } from "@/lib/autoflow/projects";

export const metadata: Metadata = { title: "Overview" };

export default async function WorkspaceOverviewPage() {
  const projects = await listProjects(await getCurrentUser());
  const recent = projects.slice(0, 3);
  const statuses = await getIntegrationStatuses();

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-light tracking-tight text-heading">Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Your projects and where each one stands in the pipeline.
        </p>
      </div>

      <section aria-labelledby="recent-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-title" className="font-display text-xl font-medium text-heading">
            Recent projects
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/autoflow/app/projects">All projects</Link>
          </Button>
        </div>
        {recent.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {recent.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No projects yet.
          </p>
        )}
      </section>

      <section aria-labelledby="stages-title" className="space-y-4">
        <div>
          <h2 id="stages-title" className="font-display text-xl font-medium text-heading">
            How a project moves
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The six stages every project follows. The stages are not built yet.
          </p>
        </div>
        <StageRail />
      </section>

      <section aria-labelledby="deps-title" className="space-y-4">
        <div>
          <h2 id="deps-title" className="font-display text-xl font-medium text-heading">
            What each stage depends on
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The services behind the pipeline and how far along each one really is. No stage is
            operational yet.
          </p>
        </div>
        <PipelineDependencies statuses={statuses} />
      </section>
    </>
  );
}
