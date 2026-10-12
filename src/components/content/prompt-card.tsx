import Link from "next/link";
import { TextCursorInputIcon } from "lucide-react";

import { LevelBadge, SampleBadge } from "@/components/content/badges";
import { Badge } from "@/components/ui/badge";
import type { Prompt } from "@/lib/content/types";

export function TestedBadge({ tested }: { tested: boolean }) {
  return (
    <Badge variant={tested ? "success" : "neutral"}>{tested ? "Tested" : "Not tested yet"}</Badge>
  );
}

export function PromptCard({ prompt, toolNames }: { prompt: Prompt; toolNames: string[] }) {
  return (
    <article className="group card-motion relative flex h-full flex-col rounded-md border bg-card p-5 focus-within:border-primary hover:border-input hover:shadow-card-hover">
      <h3 className="text-base leading-snug font-semibold text-foreground">
        <Link
          href={`/prompts/${prompt.slug}`}
          className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {prompt.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{prompt.useCase}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <LevelBadge level={prompt.skillLevel} />
        <TestedBadge tested={prompt.tested} />
        {prompt.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="neutral">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <TextCursorInputIcon className="size-3.5" aria-hidden="true" />
        {prompt.variables.length === 0
          ? "No blanks to fill in"
          : `${prompt.variables.length} ${prompt.variables.length === 1 ? "blank" : "blanks"} to fill in`}
      </p>
      {toolNames.length ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Suits: <span className="text-foreground">{toolNames.join(", ")}</span>
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        {prompt.isSample ? <SampleBadge /> : null}
      </div>
    </article>
  );
}
