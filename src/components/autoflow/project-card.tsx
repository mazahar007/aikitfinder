import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { projectStatusLabel, type Project } from "@/lib/autoflow/projects";
import { stageIndex, stages } from "@/lib/autoflow/stages";

export function ProjectCard({ project }: { project: Project }) {
  const step = stageIndex(project.currentStage);
  return (
    <Link
      href={`/autoflow/app/projects/${project.id}`}
      className="group block rounded-lg border bg-card p-5 hover:border-primary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-medium text-heading">{project.title}</h3>
        {project.sample ? <Badge variant="warning">Sample · layout only</Badge> : null}
        <Badge variant="neutral" className="ml-auto">
          {projectStatusLabel[project.status]}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Stage {step + 1} of {stages.length}: {stages[step].name} · {project.aspectRatio}
      </p>
      <div className="mt-4 flex gap-1" aria-hidden="true">
        {stages.map((s, i) => (
          <span
            key={s.id}
            className={
              i <= step ? "h-1 flex-1 rounded-full bg-primary" : "h-1 flex-1 rounded-full bg-border"
            }
          />
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Open project
        <ArrowRightIcon
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
