"use client";

import { Fragment, useId, useState } from "react";
import { RotateCcwIcon } from "lucide-react";

import { CopyButton } from "@/components/content/copy-button";
import { Button } from "@/components/ui/button";
import { fillPrompt, filledCount, placeholderNames } from "@/lib/content/prompt-utils";
import type { PromptVariable } from "@/lib/content/types";

/** Shows the prompt with filled-in values plain and empty blanks highlighted. */
function Preview({ text, values }: { text: string; values: Record<string, string> }) {
  return text.split(/(\[[^\]\n]+\])/g).map((part, i) => {
    const match = /^\[([^\]\n]+)\]$/.exec(part);
    if (!match) return <Fragment key={i}>{part}</Fragment>;
    const value = values[match[1]]?.trim();
    return value ? (
      <span key={i} className="rounded-sm bg-success-tint px-0.5 text-foreground">
        {value}
      </span>
    ) : (
      <mark key={i} className="rounded-sm bg-primary-tint px-0.5 text-primary-hover">
        {part}
      </mark>
    );
  });
}

/**
 * Fill in the blanks and copy the finished prompt. Nothing is sent anywhere:
 * the values stay in this page. Blanks left empty stay as [name] in the copy.
 */
export function PromptPlayground({
  text,
  variables,
}: {
  text: string;
  variables: PromptVariable[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const id = useId();
  const names = placeholderNames(text);
  const done = filledCount(names, values);
  const finished = fillPrompt(text, values);

  return (
    <div className="rounded-lg border bg-card">
      {variables.length ? (
        <form
          className="space-y-4 border-b p-4 sm:p-5"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Fill in the blanks"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-heading">Fill in the blanks</h3>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {done} of {names.length} filled
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {variables.map((v, i) => {
              const inputId = `${id}-${i}`;
              return (
                <div key={v.name} className="min-w-0">
                  <label htmlFor={inputId} className="block text-sm font-medium text-heading">
                    {v.name}
                  </label>
                  <p id={`${inputId}-hint`} className="mt-0.5 text-xs text-muted-foreground">
                    {v.description}
                  </p>
                  <textarea
                    id={inputId}
                    rows={2}
                    value={values[v.name] ?? ""}
                    placeholder={v.example}
                    aria-describedby={`${inputId}-hint`}
                    onChange={(e) => setValues((prev) => ({ ...prev, [v.name]: e.target.value }))}
                    className="mt-1.5 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary sm:text-sm"
                  />
                </div>
              );
            })}
          </div>
        </form>
      ) : null}

      <div className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-heading">Your prompt</h3>
        <pre className="mt-2 max-h-96 overflow-auto rounded-md border bg-surface-subtle p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          <Preview text={text} values={values} />
        </pre>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {done < names.length
              ? "Highlighted [parts] are still blank and will be copied as they are."
              : "All blanks are filled in."}
          </p>
          <div className="flex items-center gap-2">
            {done > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setValues({})}>
                <RotateCcwIcon aria-hidden="true" />
                Reset
              </Button>
            ) : null}
            <CopyButton text={finished} label="Copy prompt" />
          </div>
        </div>
      </div>
    </div>
  );
}
