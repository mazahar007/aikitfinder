import { Fragment } from "react";

import { CopyButton } from "@/components/content/copy-button";

/** Highlights [placeholders] so readers see what to replace before using a prompt. */
function withPlaceholders(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="rounded-sm bg-primary-tint px-0.5 text-primary-hover">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function PromptBlock({ text, label = "Copy prompt" }: { text: string; label?: string }) {
  return (
    <div className="rounded-md border bg-surface-subtle">
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {withPlaceholders(text)}
      </pre>
      <div className="flex items-center justify-between gap-3 border-t px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {text.includes("[") ? "Replace the highlighted [parts] before using it." : " "}
        </span>
        <CopyButton text={text} label={label} />
      </div>
    </div>
  );
}
