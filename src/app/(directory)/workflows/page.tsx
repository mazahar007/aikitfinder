import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { WorkflowCard } from "@/components/content/cards";
import { EmptyState } from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { SampleNotice } from "@/components/content/sample-notice";
import { StepModeBadge, stepModeText } from "@/components/content/step-mode-badge";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { skillLevelLabel, skillLevels } from "@/lib/content/labels";
import { getTools, getWorkflows } from "@/lib/content/repository";
import {
  hasActiveWorkflowFilters,
  parseWorkflowQuery,
  runWorkflowQuery,
  workflowQueryHref,
  workflowToolSlugs,
} from "@/lib/content/workflow-query";
import { reveal } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Workflows",
  description:
    "Combine AI tools into step-by-step workflows you can repeat, with a clear label for manual and automatable steps.",
  alternates: { canonical: "/workflows" },
};

const selectClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary sm:text-sm";

async function WorkflowsDirectory({
  searchParams,
}: {
  searchParams: PageProps<"/workflows">["searchParams"];
}) {
  const [params, workflows, tools] = await Promise.all([searchParams, getWorkflows(), getTools()]);
  const usedTools = tools
    .filter((t) => workflows.some((w) => workflowToolSlugs(w).includes(t.slug)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const query = parseWorkflowQuery(
    params,
    usedTools.map((t) => t.slug),
  );
  const result = runWorkflowQuery(workflows, query, tools);

  return (
    <>
      <Form
        action="/workflows"
        role="search"
        aria-label="Search workflows"
        className="mt-6 rounded-lg border bg-card p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="wf-q" className="mb-1 block text-sm font-medium text-heading">
              Search workflows
            </label>
            <input
              id="wf-q"
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="A goal, a tool or a keyword"
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary sm:text-sm"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="wf-level" className="mb-1 block text-sm font-medium text-heading">
              Skill level
            </label>
            <select
              id="wf-level"
              name="level"
              defaultValue={query.level ?? ""}
              className={selectClass}
            >
              <option value="">Any level</option>
              {skillLevels.map((l) => (
                <option key={l} value={l}>
                  {skillLevelLabel[l]}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="wf-tool" className="mb-1 block text-sm font-medium text-heading">
              Uses tool
            </label>
            <select
              id="wf-tool"
              name="tool"
              defaultValue={query.tool ?? ""}
              className={selectClass}
            >
              <option value="">Any tool</option>
              {usedTools.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end">
            <Button type="submit">Apply filters</Button>
            {hasActiveWorkflowFilters(query) ? (
              <Button asChild variant="ghost">
                <Link href="/workflows">Clear</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Form>

      <h2 className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">{result.total}</span>{" "}
        {result.total === 1 ? "workflow" : "workflows"}
      </h2>

      {result.items.length ? (
        <>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((w, i) => (
              <li key={w.slug} {...reveal(i)}>
                <WorkflowCard workflow={w} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(page) => workflowQueryHref(query, { page })}
            />
          </div>
        </>
      ) : (
        <div className="mt-4">
          <EmptyState title="No workflows match these filters">
            <p>Try fewer words or clear a filter.</p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/workflows">Clear all filters</Link>
            </Button>
          </EmptyState>
        </div>
      )}
    </>
  );
}

function WorkflowsSkeleton() {
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="h-40 animate-pulse rounded-lg bg-surface-subtle" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-md bg-surface-subtle" />
        ))}
      </div>
    </div>
  );
}

export default function WorkflowsPage({ searchParams }: PageProps<"/workflows">) {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Workflows" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">Workflows</h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Recipes that chain several tools together. Each step shows what goes in, what comes out,
        which tool to use and whether you do it by hand or a tool could do it for you.
      </p>
      <SampleNotice className="mt-6" />
      <dl className="mt-3 grid gap-3 rounded-md border bg-card px-4 py-3 text-sm sm:grid-cols-2">
        {(["manual", "automatable"] as const).map((mode) => (
          <div key={mode} className="flex flex-wrap items-center gap-2">
            <dt>
              <StepModeBadge mode={mode} />
            </dt>
            <dd className="text-muted-foreground">{stepModeText[mode].meaning}</dd>
          </div>
        ))}
      </dl>
      <Suspense fallback={<WorkflowsSkeleton />}>
        <WorkflowsDirectory searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
