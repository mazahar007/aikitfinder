import Link from "next/link";
import { ArrowRightIcon, ClockIcon, ListOrderedIcon } from "lucide-react";

import {
  ApiBadge,
  LevelBadge,
  PricingBadge,
  SampleBadge,
  VerificationBadge,
} from "@/components/content/badges";
import { CategoryIcon } from "@/components/content/category-icon";
import { ToolLogo } from "@/components/content/tool-logo";
import { Badge } from "@/components/ui/badge";
import type { Category, Guide, Tool, Workflow } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * Cards use a "stretched link": the title is the only link, and its ::after
 * covers the card so the whole card is clickable without nesting links.
 */
const cardBase =
  "group relative flex h-full flex-col rounded-md border bg-card p-5 transition-[box-shadow,border-color] duration-150 hover:border-input hover:shadow-card-hover focus-within:border-primary";
const stretchedLink =
  "after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring";

export function ToolCard({
  tool,
  categoryName,
  headingLevel = "h3",
}: {
  tool: Tool;
  categoryName?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className={cardBase}>
      <div className="flex items-start gap-3">
        <ToolLogo name={tool.name} />
        <div className="min-w-0">
          <Heading className="text-base leading-snug font-semibold text-foreground">
            <Link href={`/tools/${tool.slug}`} className={stretchedLink}>
              {tool.name}
            </Link>
          </Heading>
          {categoryName ? <p className="text-sm text-muted-foreground">{categoryName}</p> : null}
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tool.shortDescription}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <LevelBadge level={tool.skillLevel} />
        <PricingBadge pricing={tool.pricingModel} />
        {tool.apiAvailable ? <ApiBadge /> : null}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        <VerificationBadge status={tool.verification} date={tool.lastVerifiedAt} />
        {tool.isSample ? <SampleBadge /> : null}
      </div>
    </article>
  );
}

export function GuideCard({ guide, toolNames }: { guide: Guide; toolNames?: string[] }) {
  return (
    <article className={cardBase}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="learn">Guide</Badge>
        {guide.isSample ? <SampleBadge /> : null}
      </div>
      <h3 className="mt-3 text-base leading-snug font-semibold text-foreground">
        <Link href={`/guides/${guide.slug}`} className={stretchedLink}>
          {guide.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{guide.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-sm text-muted-foreground">
        <LevelBadge level={guide.skillLevel} />
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" aria-hidden="true" />
          {guide.estimatedMinutes} min
        </span>
        {toolNames?.length ? <span>· {toolNames.join(", ")}</span> : null}
      </div>
    </article>
  );
}

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  return (
    <article className={cardBase}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="learn">Workflow</Badge>
        {workflow.isSample ? <SampleBadge /> : null}
      </div>
      <h3 className="mt-3 text-base leading-snug font-semibold text-foreground">
        <Link href={`/workflows/${workflow.slug}`} className={stretchedLink}>
          {workflow.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{workflow.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-sm text-muted-foreground">
        <LevelBadge level={workflow.skillLevel} />
        <span className="inline-flex items-center gap-1">
          <ListOrderedIcon className="size-3.5" aria-hidden="true" />
          {workflow.steps.length} steps
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" aria-hidden="true" />
          {workflow.estimatedMinutes} min
        </span>
      </div>
    </article>
  );
}

export function CategoryCard({
  category,
  toolCount,
  compact = false,
}: {
  category: Category;
  toolCount?: number;
  compact?: boolean;
}) {
  return (
    <article className={cn(cardBase, compact ? "p-4" : "p-5")}>
      <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary-tint text-primary-hover">
        <CategoryIcon icon={category.icon} className="size-5" />
      </span>
      <h3 className="mt-3 text-sm leading-snug font-semibold text-foreground sm:text-base">
        <Link href={`/categories/${category.slug}`} className={stretchedLink}>
          {category.name}
        </Link>
      </h3>
      {!compact ? (
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      ) : null}
      {toolCount !== undefined ? (
        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {toolCount === 0 ? "No tools yet" : `${toolCount} ${toolCount === 1 ? "tool" : "tools"}`}
        </p>
      ) : null}
    </article>
  );
}

/** Section heading with an optional "View all" link. */
export function SectionHeader({
  id,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 id={id} className="text-2xl font-bold tracking-tight text-heading sm:text-h2">
          {title}
        </h2>
        {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-semibold text-primary hover:underline"
        >
          {linkLabel ?? "View all"}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
