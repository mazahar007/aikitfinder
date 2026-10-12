import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, CopyIcon, SearchIcon, SparklesIcon } from "lucide-react";

import { LevelBadge } from "@/components/content/badges";
import { ToolLogo } from "@/components/content/tool-logo";
import { CloudWipe } from "@/components/home/showcase-scenes";
import { Kicker } from "@/components/content/kicker";
import type { Guide, PromptTemplate, Tool, Workflow } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/*
 * The story shows the real product, not decoration: each chapter's preview is
 * built from the same (sample) data and visual language as the pages it links
 * to. Elements marked [data-preview-item] rise in one by one on scroll, and
 * [pathLength] strokes draw themselves (see ScrollScenes).
 */

function PreviewCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full max-w-md rounded-xl border bg-card p-4 text-left text-foreground shadow-xl shadow-heading/5 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function DiscoverPreview({ tools }: { tools: Tool[] }) {
  return (
    <PreviewCard>
      <div
        data-preview-item
        className="flex items-center gap-2 rounded-lg border-2 border-primary bg-card px-3 py-2.5 text-sm"
      >
        <SearchIcon className="size-4 text-muted-foreground" />
        <span className="flex-1 truncate">make a video from a blog post</span>
        <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          Search
        </span>
      </div>
      <p data-preview-item className="mt-3 text-xs font-medium text-muted-foreground">
        {tools.length} matching tools
      </p>
      <ul className="mt-2 space-y-2">
        {tools.map((t) => (
          <li
            key={t.slug}
            data-preview-item
            className="flex items-center gap-3 rounded-lg border p-2.5"
          >
            <ToolLogo name={t.name} className="size-9 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-heading">{t.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {t.shortDescription}
              </span>
            </span>
            <LevelBadge level={t.skillLevel} />
          </li>
        ))}
      </ul>
    </PreviewCard>
  );
}

function LearnPreview({ guide }: { guide: Guide }) {
  return (
    <PreviewCard>
      <p data-preview-item className="text-xs font-semibold tracking-wide text-learn uppercase">
        Guide · {guide.estimatedMinutes} min
      </p>
      <p data-preview-item className="mt-1 font-bold text-heading">
        {guide.title}
      </p>
      <ol className="mt-3 space-y-2.5">
        {guide.steps.slice(0, 4).map((s, i) => (
          <li key={s.title} data-preview-item className="flex items-start gap-3 text-sm">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-learn text-xs font-bold text-learn-foreground">
              {i + 1}
            </span>
            <span className="pt-0.5">{s.title}</span>
          </li>
        ))}
      </ol>
      <p
        data-preview-item
        className="mt-4 flex items-center gap-2 rounded-md border border-success/40 bg-success-tint px-3 py-2 text-xs text-foreground"
      >
        <CheckIcon className="size-4 text-success" />
        <span>
          <span className="font-semibold text-success">Expected result: </span>
          {guide.expectedOutcome}
        </span>
      </p>
    </PreviewCard>
  );
}

function CreatePreview({ tool, prompt }: { tool: Tool; prompt: PromptTemplate }) {
  const parts = prompt.text.split(/(\[[^\]]+\])/g);
  return (
    <PreviewCard>
      <div data-preview-item className="flex items-center gap-2">
        <ToolLogo name={tool.name} className="size-8 text-[11px]" />
        <span className="text-sm font-semibold text-heading">{prompt.title}</span>
        <span className="ml-auto rounded-sm border border-success/40 bg-success-tint px-1.5 text-[11px] font-semibold text-success">
          Tested
        </span>
      </div>
      <div
        data-preview-item
        className="mt-3 rounded-lg border bg-surface-subtle p-3 font-mono text-xs leading-relaxed sm:text-[13px]"
      >
        {parts.map((part, i) =>
          /^\[[^\]]+\]$/.test(part) ? (
            <mark
              key={i}
              data-preview-item
              className="rounded-sm bg-primary-tint px-0.5 text-primary-hover"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </div>
      <div data-preview-item className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{prompt.expectedOutput}</span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-input px-2 py-1 font-semibold text-primary-hover">
          <CopyIcon className="size-3.5" />
          Copy
        </span>
      </div>
    </PreviewCard>
  );
}

function AutomatePreview({ workflow, tools }: { workflow: Workflow; tools: Tool[] }) {
  const steps = workflow.steps.slice(0, 3);
  return (
    <PreviewCard>
      <p
        data-preview-item
        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Workflow · {workflow.estimatedMinutes} min
      </p>
      <p data-preview-item className="mt-1 font-bold text-heading">
        {workflow.title}
      </p>
      <ol className="relative mt-4 space-y-5">
        {/* Connector drawn down the left side as the chapter scrolls in. */}
        <svg
          data-draw
          className="line-art absolute top-5 left-[18px] h-[calc(100%-2.5rem)] w-1 overflow-visible text-primary"
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
        >
          <path
            d="M1 0 V100"
            pathLength={1}
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {steps.map((s) => {
          const tool = tools.find((t) => t.slug === s.toolSlug);
          return (
            <li key={s.title} data-preview-item className="relative flex items-center gap-3">
              {tool ? (
                <ToolLogo name={tool.name} className="z-10 size-9 text-xs" />
              ) : (
                <span className="z-10 size-9 rounded-md border bg-card" />
              )}
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold text-heading">{s.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {s.input} → {s.output}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p
        data-preview-item
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-heading px-3 py-1 text-xs font-semibold text-background"
      >
        <SparklesIcon className="size-3.5" />
        {workflow.outcome}
      </p>
    </PreviewCard>
  );
}

type StoryProps = {
  discoverTools: Tool[];
  guide: Guide;
  promptTool: Tool;
  prompt: PromptTemplate;
  workflow: Workflow;
  workflowTools: Tool[];
};

/**
 * Four chapters (Discover → Learn → Create → Automate), each pairing a short
 * promise with a live preview of the feature that keeps it. Without motion
 * each chapter shows its own colour; with motion the section cross-fades
 * between the colours and ends in a cloud that carries the page into the
 * dark "featured" zone.
 */
export function Story(props: StoryProps) {
  const chapters = [
    {
      token: "--story-1",
      kicker: "Discover",
      title: "Describe the task. Get the right tools.",
      body: "Type what you want to do in plain words. We match it to tools, guides and prompts, and you can filter by skill level and budget.",
      href: "/tools",
      cta: "Explore tools",
      preview: <DiscoverPreview tools={props.discoverTools} />,
    },
    {
      token: "--story-2",
      kicker: "Learn",
      title: "Step-by-step, in plain English.",
      body: "Guides show what you need, each step, and the result to expect. Tool pages explain settings and limits, with sources and a checked date.",
      href: "/guides",
      cta: "Browse guides",
      preview: <LearnPreview guide={props.guide} />,
    },
    {
      token: "--story-3",
      kicker: "Create",
      title: "Copy a prompt. Get a result.",
      body: "Ready-made prompts highlight exactly which parts to change and tell you what output to expect, so your first try is a good one.",
      href: `/tools/${props.promptTool.slug}#prompts`,
      cta: "See prompts",
      preview: <CreatePreview tool={props.promptTool} prompt={props.prompt} />,
    },
    {
      token: "--story-4",
      kicker: "Automate",
      title: "Chain tools into a workflow.",
      body: "Recipes pass one tool’s output into the next. Follow them once, then repeat them whenever you need.",
      href: "/workflows",
      cta: "See workflows",
      preview: <AutomatePreview workflow={props.workflow} tools={props.workflowTools} />,
    },
  ];

  return (
    <section data-story aria-labelledby="story-heading" className="group/story bg-background">
      <h2 id="story-heading" className="sr-only">
        What AIKitFinder does for you
      </h2>
      {chapters.map((c, i) => (
        <article
          key={c.kicker}
          data-chapter={c.token}
          className="flex items-center py-16 group-data-[scenes=on]/story:bg-transparent! sm:py-20 lg:min-h-[78vh]"
          style={{ backgroundColor: `var(${c.token})` }}
        >
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:gap-16 lg:px-8">
            <div data-chapter-text className={cn("min-w-0", i % 2 === 1 && "md:order-2")}>
              <Kicker index={i + 1} label={c.kicker} />
              <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-balance text-heading sm:text-5xl">
                {c.title}
              </h3>
              <p className="mt-4 max-w-md text-lead text-foreground/80">{c.body}</p>
              <Link
                href={c.href}
                className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-heading px-5 font-semibold text-background transition-transform duration-200 hover:-translate-y-0.5"
              >
                {c.cta}
                <ArrowRightIcon
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
            <div className="flex min-w-0 justify-center">{c.preview}</div>
          </div>
        </article>
      ))}
      {/* The cloud rises out of the last chapter's colour, so there is no seam. */}
      <div
        className="group-data-[scenes=on]/story:bg-transparent!"
        style={{ backgroundColor: "var(--story-4)" }}
      >
        <CloudWipe direction="to-dark" seamless />
      </div>
    </section>
  );
}
