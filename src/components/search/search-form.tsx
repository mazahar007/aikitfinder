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
};

export function SearchForm({
  variant = "header",
  defaultValue,
  shortcut = false,
  className,
  id = "site-search",
}: SearchFormProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

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
          "flex items-center gap-2 border border-input bg-card focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring",
          hero ? "rounded-lg p-1.5 pl-4 shadow-sm" : "h-11 rounded-md pl-3",
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
          placeholder={hero ? "What do you want to do?" : "Search tools and guides"}
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
