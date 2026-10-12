import type { Metadata } from "next";

import { WorkflowCard } from "@/components/content/cards";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { getWorkflows } from "@/lib/content/repository";
import { reveal } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Workflows",
  description: "Combine AI tools into step-by-step workflows you can repeat.",
  alternates: { canonical: "/workflows" },
};

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Workflows" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">Workflows</h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Recipes that chain several tools together. Each step shows what goes in, what comes out and
        which tool to use.
      </p>
      <SampleNotice className="mt-6" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.map((w, i) => (
          <li key={w.slug} {...reveal(i)}>
            <WorkflowCard workflow={w} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
