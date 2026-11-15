"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LockIcon } from "lucide-react";

import { useAuthDialog, type AuthPrompt } from "@/components/auth/auth-provider";
import { LevelBadge, SampleBadge } from "@/components/content/badges";
import { EmptyState } from "@/components/content/empty-state";
import { GuestSearchCounter } from "@/components/search/guest-search-counter";
import { SearchForm } from "@/components/search/search-form";
import { SearchLink } from "@/components/search/search-link";
import { Button } from "@/components/ui/button";
import {
  searchGroupOrder,
  type SearchResult,
  type SearchResultType,
} from "@/lib/content/search-types";
import { formatReset, publishSearchAccess } from "@/lib/guest-search/client";
import {
  SEARCH_QUERY_MAX_LENGTH,
  type GuestAccess,
  type SearchAccess,
  type SearchErrorCode,
} from "@/lib/guest-search/config";
import { cn } from "@/lib/utils";

type Result = Omit<SearchResult, "score">;

/** What the server answered for one submission (`key` is its request ID and query). */
type Outcome = { key: string } & (
  | { status: "results"; results: Result[] }
  | { status: "blocked"; code: SearchErrorCode; access: GuestAccess | null; message: string }
  | { status: "error"; message: string }
);

type State =
  | { status: "idle" }
  /** A query in the address without a request ID: wait for an explicit submit. */
  | { status: "unsubmitted" }
  | { status: "loading" }
  | Outcome;

const suggestions = ["make a video", "summarize", "code", "thumbnail", "automation"];
const chip =
  "inline-flex min-h-9 items-center rounded-full border bg-card px-3.5 text-sm hover:border-primary hover:bg-primary-tint hover:text-primary-hover pointer-coarse:min-h-11";
const UUID = /^[0-9a-f-]{36}$/i;

function limitPrompt(access: GuestAccess | null): AuthPrompt {
  return {
    title: "You've used all 3 free searches today.",
    description: "Create a free AIKitFinder account to continue discovering AI tools.",
    note: `Prefer not to sign up? Your free searches reset ${formatReset(access?.reset_at ?? null)}. Browsing tools, categories, guides, prompts and workflows stays open.`,
  };
}

function ResultItem({ result }: { result: Result }) {
  return (
    <li>
      <article className="relative rounded-md border bg-card p-4 transition-[box-shadow,border-color] hover:border-input hover:shadow-card-hover">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">
            <Link
              href={result.href}
              className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {result.title}
            </Link>
          </h3>
          {result.isSample ? <SampleBadge /> : null}
          {result.skillLevel ? <LevelBadge level={result.skillLevel} /> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.description}</p>
        {result.context ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {result.type === "tool" ? result.context : `In ${result.context}`}
          </p>
        ) : null}
      </article>
    </li>
  );
}

/**
 * The search page. The address carries the query and the request ID of one
 * submission (`?q=…&rid=…`); this component sends that request to the server
 * once and shows what comes back. The server decides whether the search may
 * run. Reloading repeats the same request ID, which the server treats as the
 * same search.
 */
export function SearchExperience() {
  const params = useSearchParams();
  const openAuth = useAuthDialog();
  const query = (params.get("q") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_QUERY_MAX_LENGTH);
  const rid = params.get("rid") ?? "";
  const typeParam = params.get("type");
  const activeType = searchGroupOrder.some((g) => g.type === typeParam)
    ? (typeParam as SearchResultType)
    : undefined;

  const submitted = Boolean(query) && UUID.test(rid);
  const key = submitted ? `${rid}:${query}` : null;
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  // The submission already sent, so a re-render or a tab change never sends it twice.
  const sent = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!key || sent.current === key) return;
    sent.current = key;

    fetch("/api/directory/search", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, request_id: rid }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as {
          results?: Result[];
          access?: SearchAccess;
          error?: { code: SearchErrorCode; message: string };
        } | null;
        if (body?.access) publishSearchAccess(body.access);

        if (response.ok && body?.results) {
          setOutcome({ key, status: "results", results: body.results });
          return;
        }
        const code = body?.error?.code;
        const access = body?.access?.type === "guest" ? body.access : null;
        if (code === "GUEST_SEARCH_LIMIT_REACHED" || code === "GUEST_SEARCH_RATE_LIMITED") {
          setOutcome({
            key,
            status: "blocked",
            code,
            access,
            message: body?.error?.message ?? "You've used all 3 free searches today.",
          });
          // Ask for an account; signing in returns to this same search.
          openAuth("signup", { prompt: limitPrompt(access) });
          return;
        }
        setOutcome({
          key,
          status: "error",
          message: body?.error?.message ?? "Search is temporarily unavailable. Try again shortly.",
        });
      })
      .catch(() => {
        // Not delivered: the same request ID may be sent again safely.
        sent.current = null;
        setOutcome({
          key,
          status: "error",
          message: "Could not reach the server. Check your connection and try again.",
        });
      });
  }, [key, query, rid, openAuth]);

  // What to show follows from the address and the answer for that exact submission.
  const state: State = !query
    ? { status: "idle" }
    : !key
      ? { status: "unsubmitted" }
      : outcome?.key === key
        ? outcome
        : { status: "loading" };

  const results = state.status === "results" ? state.results : [];
  const groups = searchGroupOrder
    .map((g) => ({ ...g, items: results.filter((r) => r.type === g.type) }))
    .filter((g) => g.items.length > 0);
  const visible = activeType ? groups.filter((g) => g.type === activeType) : groups;
  const href = (type?: SearchResultType) =>
    `/search?q=${encodeURIComponent(query)}&rid=${rid}${type ? `&type=${type}` : ""}`;

  return (
    <>
      {/* Remounts with the query so the field shows what was searched. */}
      <SearchForm
        key={query}
        variant="hero"
        id="page-search"
        defaultValue={query}
        className="mt-6"
      />
      <GuestSearchCounter className="mt-3" />

      {state.status === "idle" ? (
        <div className="mt-8">
          <p className="text-muted-foreground">
            Search for a task (“make a video”), a tool, a setting or an error message.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <SearchLink key={s} query={s} className={chip}>
                {s}
              </SearchLink>
            ))}
          </div>
        </div>
      ) : null}

      {state.status === "unsubmitted" ? (
        <p className="mt-8 text-muted-foreground" role="status">
          Press Search to look for “{query}”.
        </p>
      ) : null}

      {state.status === "loading" ? (
        <div className="mt-8 space-y-3" role="status" aria-label={`Searching for ${query}`}>
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-20 rounded-md bg-surface-subtle motion-safe:animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <p
          role="alert"
          className="mt-8 rounded-md border border-destructive/40 bg-destructive-tint px-4 py-3 text-sm text-foreground"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "blocked" ? (
        <section
          aria-labelledby="search-limit-title"
          className="mt-8 rounded-lg border bg-card p-6 text-center"
        >
          <LockIcon className="mx-auto size-6 text-primary" aria-hidden="true" />
          <h2 id="search-limit-title" className="mt-3 text-xl font-bold text-heading">
            {state.code === "GUEST_SEARCH_LIMIT_REACHED"
              ? "You've used all 3 free searches today."
              : "Too many searches from this network today."}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Create a free AIKitFinder account to continue discovering AI tools. Your search for “
            {query}” will run as soon as you sign in.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button onClick={() => openAuth("signup", { prompt: limitPrompt(state.access) })}>
              Create Free Account
            </Button>
            <Button
              variant="ghost"
              onClick={() => openAuth("login", { prompt: limitPrompt(state.access) })}
            >
              Already have an account? Sign in
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Free searches reset {formatReset(state.access?.reset_at ?? null)}. You can keep browsing
            without an account:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/tools">All tools</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/categories">Categories</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/guides">Guides</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/prompts">Prompts</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/workflows">Workflows</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {state.status === "results" && results.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={`No results for “${query}”`}>
            <p>Try a shorter or more general phrase, check the spelling, or browse instead.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/tools">Explore all tools</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/categories">Browse categories</Link>
              </Button>
            </div>
          </EmptyState>
        </div>
      ) : null}

      {state.status === "results" && results.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground" role="status">
            <span className="font-semibold text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "result" : "results"} for “{query}”
          </p>
          <nav aria-label="Result types" className="mt-3 flex flex-wrap gap-2">
            {[
              { type: undefined, label: "All", count: results.length },
              ...groups.map((g) => ({ type: g.type, label: g.label, count: g.items.length })),
            ].map((tab) => {
              const active = tab.type === activeType;
              return (
                <Link
                  key={tab.label}
                  href={href(tab.type)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium pointer-coarse:min-h-11",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:border-primary hover:bg-primary-tint",
                  )}
                >
                  {tab.label}
                  <span className={active ? "" : "text-muted-foreground"}>{tab.count}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 space-y-10">
            {visible.map((group) => (
              <section key={group.type} aria-labelledby={`group-${group.type}`}>
                <h2 id={`group-${group.type}`} className="text-lg font-bold text-heading">
                  {group.label}
                </h2>
                <ul className="mt-3 space-y-3">
                  {group.items.map((r) => (
                    <ResultItem key={`${r.type}-${r.href}-${r.title}`} result={r} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
