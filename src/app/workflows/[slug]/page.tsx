import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownIcon, ClockIcon, TargetIcon } from "lucide-react";

import { LevelBadge, SampleBadge, VerificationBadge } from "@/components/content/badges";
import { ToolLogo } from "@/components/content/tool-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { getGuides, getTools, getWorkflow, getWorkflows } from "@/lib/content/repository";

export async function generateStaticParams() {
  const workflows = await getWorkflows();
  return workflows.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/workflows/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const workflow = await getWorkflow(slug);
  if (!workflow) return {};
  return {
    title: workflow.title,
    description: workflow.summary,
    alternates: { canonical: `/workflows/${workflow.slug}` },
  };
}

export default async function WorkflowPage({ params }: PageProps<"/workflows/[slug]">) {
  const { slug } = await params;
  const workflow = await getWorkflow(slug);
  if (!workflow) notFound();
  const [tools, guides] = await Promise.all([getTools(), getGuides()]);

  return (
    <Container className="max-w-4xl py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Workflows", href: "/workflows" },
          { label: workflow.title },
        ]}
      />
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="learn">Workflow</Badge>
          {workflow.isSample ? <SampleBadge /> : null}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-heading sm:text-h1">
          {workflow.title}
        </h1>
        <p className="mt-3 text-lead text-muted-foreground">{workflow.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <LevelBadge level={workflow.skillLevel} />
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-4" aria-hidden="true" />
            About {workflow.estimatedMinutes} minutes
          </span>
          <VerificationBadge status={workflow.verification} date={workflow.lastVerifiedAt} />
        </div>
      </header>

      <section aria-labelledby="wf-steps" className="mt-10">
        <h2 id="wf-steps" className="sr-only">
          Steps
        </h2>
        <ol className="space-y-3">
          {workflow.steps.map((step, i) => {
            const tool = tools.find((t) => t.slug === step.toolSlug);
            const guide = guides.find((g) => g.slug === step.guideSlug);
            return (
              <li key={step.title} className="reveal">
                {i > 0 ? (
                  <ArrowDownIcon
                    className="mx-auto mb-3 size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : null}
                <article className="rounded-md border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-learn font-bold text-learn-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-heading">{step.title}</h3>
                      <p className="mt-1">{step.instructions}</p>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-md bg-surface-subtle p-3">
                          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Input
                          </dt>
                          <dd className="mt-0.5 text-foreground">{step.input}</dd>
                        </div>
                        <div className="rounded-md bg-surface-subtle p-3">
                          <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Output
                          </dt>
                          <dd className="mt-0.5 text-foreground">{step.output}</dd>
                        </div>
                      </dl>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        {tool ? (
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                          >
                            <ToolLogo name={tool.name} className="size-7 text-[10px]" />
                            Use {tool.name}
                          </Link>
                        ) : null}
                        {guide ? (
                          <Link
                            href={`/guides/${guide.slug}`}
                            className="font-semibold text-learn hover:underline"
                          >
                            Step-by-step guide →
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="wf-outcome"
        className="mt-8 rounded-md border border-success/40 bg-success-tint p-5"
      >
        <h2 id="wf-outcome" className="flex items-center gap-2 font-semibold text-success">
          <TargetIcon className="size-4" aria-hidden="true" />
          What you end up with
        </h2>
        <p className="mt-1 text-foreground">{workflow.outcome}</p>
      </section>
    </Container>
  );
}
