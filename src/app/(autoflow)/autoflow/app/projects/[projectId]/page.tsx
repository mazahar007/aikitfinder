import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { StageRail } from "@/components/autoflow/stage-rail";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getProject, projectStatusLabel, SAMPLE_PROJECT_ID } from "@/lib/autoflow/projects";
import { stageIndex, stages } from "@/lib/autoflow/stages";

/** The labeled sample is prerendered; real projects are looked up per request. */
export function generateStaticParams() {
  return [{ projectId: SAMPLE_PROJECT_ID }];
}

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage({
  params,
}: PageProps<"/autoflow/app/projects/[projectId]">) {
  const { projectId } = await params;
  // Looked up through the current user, so one account can never open another's project.
  const project = await getProject(await getCurrentUser(), projectId);
  if (!project) notFound();

  const stage = stages[stageIndex(project.currentStage)];

  return (
    <>
      <Link
        href="/autoflow/app/projects"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" aria-hidden="true" />
        Projects
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-light tracking-tight text-heading">
          {project.title}
        </h1>
        {project.sample ? <Badge variant="warning">Sample · layout only</Badge> : null}
        <Badge variant="neutral">{projectStatusLabel[project.status]}</Badge>
      </div>

      <dl className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Current stage
          </dt>
          <dd className="mt-1 text-foreground">{stage.name}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Format
          </dt>
          <dd className="mt-1 text-foreground">{project.aspectRatio} video</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Last updated
          </dt>
          <dd className="mt-1 text-foreground">
            {project.updatedAt
              ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(
                  new Date(project.updatedAt),
                )
              : "Never"}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="stages-title" className="space-y-4">
        <h2 id="stages-title" className="font-display text-xl font-medium text-heading">
          Stages
        </h2>
        <StageRail statuses={project.stages} current={project.currentStage} />
      </section>

      <section aria-labelledby="stage-panel-title" className="rounded-lg border border-dashed p-6">
        <h2 id="stage-panel-title" className="font-display text-xl font-medium text-heading">
          {stage.name}
        </h2>
        <p className="mt-2 text-muted-foreground">
          This stage is not built yet. When it is, it will produce: {stage.produces.toLowerCase()}.
        </p>
      </section>
    </>
  );
}
