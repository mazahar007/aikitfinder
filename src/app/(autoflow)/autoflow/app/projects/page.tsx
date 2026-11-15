import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";

import { ProjectCard } from "@/components/autoflow/project-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects } from "@/lib/autoflow/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listProjects(await getCurrentUser());

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight text-heading">Projects</h1>
          <p className="mt-2 text-muted-foreground">One project per video.</p>
        </div>
        <div className="text-right">
          <Button disabled aria-describedby="new-project-note">
            <PlusIcon aria-hidden="true" />
            New project
          </Button>
          <p id="new-project-note" className="mt-1 text-xs text-muted-foreground">
            Not available yet
          </p>
        </div>
      </div>

      {projects.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
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
    </>
  );
}
