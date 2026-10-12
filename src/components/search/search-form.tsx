"use client";

import * as React from "react";
import Form from "next/form";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  /** "header" is compact; "hero" is the large homepage search. */
  variant?: "header" | "hero";
  defaultValue?: string;
  /** Let the "/" key focus this field from anywhere on the page. */
  shortcut?: boolean;
  className?: string;
  id?: string;
  /** Hero only: type example searches into the placeholder to show what's possible. */
  typingExamples?: string[];
};

const STATIC_HERO_PLACEHOLDER = "What do you want to do?";

/**
 * Types example searches into an input's placeholder, one character at a
 * time, until the visitor focuses the field. Placeholder text is not
 * announced repeatedly by screen readers, and the label stays constant.
 */
function useTypingPlaceholder(
  inputRef: React.RefObject<HTMLInputElement | null>,
  examples: string[] | undefined,
) {
  React.useEffect(() => {
    const input = inputRef.current;
    if (!input || !examples?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let stopped = false;
    let example = 0;
    let chars = 0;
    let deleting = false;

    const tick = () => {
      if (stopped) return;
      const text = examples[example];
      chars += deleting ? -1 : 1;
      input.placeholder = `Try “${text.slice(0, chars)}”`;
      let delay = deleting ? 28 : 55 + Math.random() * 45;
      if (!deleting && chars === text.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && chars === 0) {
        deleting = false;
        example = (example + 1) % examples.length;
        delay = 350;
      }
      timer = window.setTimeout(tick, delay);
    };

    const stop = () => {
      stopped = true;
      window.clearTimeout(timer);
      input.placeholder = STATIC_HERO_PLACEHOLDER;
    };

    timer = window.setTimeout(tick, 1200);
    input.addEventListener("focus", stop, { once: true });
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      input.removeEventListener("focus", stop);
    };
  }, [inputRef, examples]);
}

export function SearchForm({
  variant = "header",
  defaultValue,
  shortcut = false,
  className,
  id = "site-search",
  typingExamples,
}: SearchFormProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  useTypingPlaceholder(inputRef, variant === "hero" ? typingExamples : undefined);

  React.useEffect(() => {
    if (!shortcut) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (typing) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  const hero = variant === "hero";

  return (
    <Form action="/search" role="search" className={cn("w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Search AI tools, guides and workflows
      </label>
      <div
        className={cn(
          "flex items-center gap-2 border border-input bg-card focus-within:border-primary",
          // The hero shows an animated light ring on focus (.search-glow);
          // the compact field uses the standard focus outline.
          hero
            ? "search-glow rounded-lg border-2 p-1.5 pl-4 shadow-sm"
            : "h-11 rounded-md pl-3 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring",
        )}
      >
        <SearchIcon
          className={cn(
            "shrink-0 text-muted-foreground",
            hero ? "hidden size-5 sm:block" : "size-4",
          )}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={hero ? STATIC_HERO_PLACEHOLDER : "Search tools and guides"}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none",
            hero ? "h-12 text-base sm:text-lg" : "h-full text-sm",
          )}
        />
        {hero ? (
          <Button type="submit" size="lg" className="px-4 sm:px-6">
            <SearchIcon className="sm:hidden" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
        ) : (
          shortcut && (
            <kbd
              aria-hidden="true"
              className="mr-2 hidden rounded-sm border px-1.5 font-mono text-xs text-muted-foreground lg:inline"
            >
              /
            </kbd>
          )
        )}
      </div>
    </Form>
  );
}
