import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { InfoIcon } from "lucide-react";

import { EmptyState } from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { PromptCard } from "@/components/content/prompt-card";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { skillLevelLabel, skillLevels } from "@/lib/content/labels";
import {
  hasActivePromptFilters,
  parsePromptQuery,
  promptQueryHref,
  runPromptQuery,
} from "@/lib/content/prompt-query";
import { getAllCategories, getPrompts, getTools } from "@/lib/content/repository";
import { reveal } from "@/lib/motion";

export const metadata: Metadata = {
  title: "AI prompt library",
  description:
    "Ready-to-use prompts with fill-in blanks, instructions and what to expect. Search by task, tool or skill level.",
  alternates: { canonical: "/prompts" },
};

const selectClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary sm:text-sm";

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-heading">
        {label}
      </label>
      {children}
    </div>
  );
}

async function PromptsDirectory({
  searchParams,
}: {
  searchParams: PageProps<"/prompts">["searchParams"];
}) {
  const [params, prompts, categories, tools] = await Promise.all([
    searchParams,
    getPrompts(),
    getAllCategories(),
    getTools(),
  ]);
  // Only offer categories and tools that have at least one prompt.
  const usedCategories = categories.filter((c) =>
    prompts.some((p) => p.categorySlugs.includes(c.slug)),
  );
  const usedTools = tools
    .filter((t) => prompts.some((p) => p.toolSlugs.includes(t.slug)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const query = parsePromptQuery(params, {
    categories: usedCategories.map((c) => c.slug),
    tools: usedTools.map((t) => t.slug),
  });
  const result = runPromptQuery(prompts, query, categories, tools);
  const toolNames = (slugs: string[]) =>
    slugs.map((s) => tools.find((t) => t.slug === s)?.name).filter((n): n is string => !!n);

  return (
    <>
      <Form
        action="/prompts"
        role="search"
        aria-label="Search prompts"
        className="mt-6 rounded-lg border bg-card p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4">
            <label htmlFor="prompts-q" className="mb-1 block text-sm font-medium text-heading">
              Search prompts
            </label>
            <input
              id="prompts-q"
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="A task, a tool or a keyword"
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary sm:text-sm"
            />
          </div>
          <Field id="prompts-category" label="Category">
            <select
              id="prompts-category"
              name="category"
              defaultValue={query.category ?? ""}
              className={selectClass}
            >
              <option value="">All categories</option>
              {usedCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name.replace(/^AI /, "")}
                </option>
              ))}
            </select>
          </Field>
          <Field id="prompts-level" label="Skill level">
            <select
              id="prompts-level"
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
          </Field>
          <Field id="prompts-tool" label="Works with">
            <select
              id="prompts-tool"
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
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">
              Apply filters
            </Button>
            {hasActivePromptFilters(query) ? (
              <Button asChild variant="ghost">
                <Link href="/prompts">Clear</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Form>

      <h2 className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">{result.total}</span>{" "}
        {result.total === 1 ? "prompt" : "prompts"}
      </h2>

      {result.items.length ? (
        <>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((prompt, i) => (
              <li key={prompt.slug} {...reveal(i)}>
                <PromptCard prompt={prompt} toolNames={toolNames(prompt.toolSlugs)} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(page) => promptQueryHref(query, { page })}
            />
          </div>
        </>
      ) : (
        <div className="mt-4">
          <EmptyState title="No prompts match these filters">
            <p>Try fewer words or clear a filter.</p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/prompts">Clear all filters</Link>
            </Button>
          </EmptyState>
        </div>
      )}
    </>
  );
}

function PromptsSkeleton() {
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="h-44 animate-pulse rounded-lg bg-surface-subtle" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-md bg-surface-subtle" />
        ))}
      </div>
    </div>
  );
}

export default function PromptsPage({ searchParams }: PageProps<"/prompts">) {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Prompts" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        AI prompt library
      </h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Copy a prompt, fill in the blanks and get a useful first result. Every prompt says what to
        expect and what to check.
      </p>
      <SampleNotice className="mt-6" />
      <p className="mt-3 flex items-start gap-2 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Results vary between tools and between tries. “Tested” means someone ran the prompt and
          checked the result; “Not tested yet” means they have not. All prompts here are written for
          AIKitFinder, not copied from other collections.
        </span>
      </p>
      <Suspense fallback={<PromptsSkeleton />}>
        <PromptsDirectory searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
