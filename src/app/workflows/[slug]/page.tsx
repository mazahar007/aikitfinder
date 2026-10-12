import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownIcon, ClockIcon, FlaskConicalIcon, InfoIcon, TargetIcon } from "lucide-react";

import { LevelBadge, SampleBadge, VerificationBadge } from "@/components/content/badges";
import { StepModeBadge, stepModeText } from "@/components/content/step-mode-badge";
import { ToolLogo } from "@/components/content/tool-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { getGuides, getToday, getTools, getWorkflow, getWorkflows } from "@/lib/content/repository";
import {
  modeCounts,
  pricingPicture,
  suggestedTools,
  summedStepMinutes,
} from "@/lib/content/workflow-utils";

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

function ToolNames({ tools }: { tools: { slug: string; name: string }[] }) {
  return (
    <>
      {tools.map((t, i) => (
        <span key={t.slug}>
          {i > 0 ? ", " : null}
          <Link href={`/tools/${t.slug}`} className="font-medium text-primary hover:underline">
            {t.name}
          </Link>
        </span>
      ))}
    </>
  );
}

export default async function WorkflowPage({ params }: PageProps<"/workflows/[slug]">) {
  const { slug } = await params;
  const workflow = await getWorkflow(slug);
  if (!workflow) notFound();
  const [tools, guides, today] = await Promise.all([getTools(), getGuides(), getToday()]);

  const counts = modeCounts(workflow.steps);
  const summed = summedStepMinutes(workflow.steps);
  const used = suggestedTools(workflow, tools);
  const pricing = pricingPicture(used, today);

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
            About {summed ?? workflow.estimatedMinutes} minutes
            <span className="text-xs">(editor’s estimate for a first run)</span>
          </span>
          <VerificationBadge status={workflow.verification} date={workflow.lastVerifiedAt} />
        </div>
      </header>

      {workflow.isSample ? (
        <p className="mt-6 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm">
          <FlaskConicalIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-warning">Sample workflow:</strong> it uses
            fictional tools and illustrates the layout. It does not show that any real tool does a
            step, or does it for free.
          </span>
        </p>
      ) : null}

      <section aria-labelledby="wf-overview" className="mt-8 rounded-lg border bg-card p-5">
        <h2 id="wf-overview" className="text-sm font-semibold text-heading">
          Before you start
        </h2>
        {workflow.prerequisites?.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {workflow.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No requirements listed yet.</p>
        )}
        <dl className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
          {(["manual", "automatable"] as const).map((mode) => (
            <div key={mode} className="flex flex-wrap items-center gap-2">
              <dt>
                <StepModeBadge mode={mode} />
              </dt>
              <dd className="text-muted-foreground">
                {counts[mode]} {counts[mode] === 1 ? "step" : "steps"}. {stepModeText[mode].meaning}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="wf-steps" className="mt-10">
        <h2 id="wf-steps" className="sr-only">
          Steps
        </h2>
        <ol className="space-y-3">
          {workflow.steps.map((step, i) => {
            const tool = tools.find((t) => t.slug === step.toolSlug);
            const alternatives = (step.alternativeToolSlugs ?? [])
              .map((s) => tools.find((t) => t.slug === s))
              .filter((t): t is NonNullable<typeof t> => !!t);
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
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-lg font-semibold text-heading">{step.title}</h3>
                        <StepModeBadge mode={step.mode} />
                        {step.estimatedMinutes !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <ClockIcon className="size-3.5" aria-hidden="true" />
                            About {step.estimatedMinutes} min
                          </span>
                        ) : null}
                      </div>
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
                      {step.note ? (
                        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                          <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                          <span>{step.note}</span>
                        </p>
                      ) : null}
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
                      {alternatives.length ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Or instead: <ToolNames tools={alternatives} />
                        </p>
                      ) : null}
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

      <section aria-labelledby="wf-cost" className="mt-8 rounded-lg border bg-card p-5">
        <h2 id="wf-cost" className="font-semibold text-heading">
          Time and cost
        </h2>
        <p className="mt-2 text-sm">
          <span className="font-medium text-foreground">Time:</span>{" "}
          {summed !== undefined ? (
            <>
              the step estimates add up to about {summed} minutes. These are editorial estimates for
              a first run, not measurements; your time will vary.
            </>
          ) : (
            <>
              about {workflow.estimatedMinutes} minutes is an editorial estimate for a first run.
              Not every step has its own estimate.
            </>
          )}
        </p>
        <div className="mt-3 text-sm">
          <p className="font-medium text-foreground">Cost of the suggested tools:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {pricing.free.length ? (
              <li>
                Verified free plan: <ToolNames tools={pricing.free} />
              </li>
            ) : null}
            {pricing.paidOnly.length ? (
              <li>
                Verified, no free plan: <ToolNames tools={pricing.paidOnly} />
              </li>
            ) : null}
            {pricing.notVerified.length ? (
              <li>
                Pricing not verified or out of date: <ToolNames tools={pricing.notVerified} />
              </li>
            ) : null}
            {!used.length ? <li>No tools are suggested for this workflow.</li> : null}
          </ul>
          <p className="mt-2 text-muted-foreground">
            We do not add these up into one price: what you pay depends on the plan, its limits and
            how much you use. Check each tool’s pricing section before you start.
          </p>
        </div>
      </section>
    </Container>
  );
}
