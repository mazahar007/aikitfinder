import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, CompassIcon, WorkflowIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SearchForm } from "@/components/search/search-form";
import { Badge } from "@/components/ui/badge";

const suggestions = [
  "Write a blog post",
  "Make a video from text",
  "Remove an image background",
  "Fix my code",
];

const pillars = [
  {
    title: "Discover",
    body: "Find AI tools by what you want to get done, your skill level and budget.",
    href: "/tools",
    cta: "Explore tools",
    icon: CompassIcon,
    accent: "bg-primary-tint text-primary-hover",
  },
  {
    title: "Learn",
    body: "Follow plain-English guides covering setup, settings, prompts and fixes.",
    href: "/guides",
    cta: "Browse guides",
    icon: BookOpenIcon,
    accent: "bg-learn-tint text-learn",
  },
  {
    title: "Put it to work",
    body: "Combine tools into step-by-step workflows you can repeat.",
    href: "/workflows",
    cta: "See workflows",
    icon: WorkflowIcon,
    accent: "bg-learn-tint text-learn",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-card">
        <Container className="py-14 text-center sm:py-20">
          <Badge variant="info" className="mb-5">
            Free to use · No sign-up
          </Badge>
          <h1 className="mx-auto max-w-3xl text-[2.25rem] leading-tight font-extrabold tracking-tight text-balance text-heading sm:text-display">
            Find the right AI tool. Learn it. Use it.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lead text-muted-foreground">
            Explore AI tools, understand their settings, follow practical tutorials, and discover
            workflows that help you get better results.
          </p>
          <SearchForm variant="hero" id="hero-search" className="mx-auto mt-8 max-w-2xl" />
          <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Popular searches">
            {suggestions.map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="inline-flex min-h-9 items-center rounded-full border bg-card px-3.5 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary-tint hover:text-primary-hover"
              >
                {q}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="how-heading">
        <Container className="py-14 sm:py-16">
          <h2
            id="how-heading"
            className="text-2xl font-bold tracking-tight text-heading sm:text-h2"
          >
            From idea to result, step by step
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every tool page and guide follows the same clear structure, so you always know where to
            look next.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ title, body, href, cta, icon: Icon, accent }) => (
              <li key={title}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-md border bg-card p-6 transition-[box-shadow,border-color] duration-150 hover:border-input hover:shadow-card-hover"
                >
                  <span
                    className={`inline-flex size-10 items-center justify-center rounded-md ${accent}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 text-h3 font-semibold text-foreground">{title}</span>
                  <span className="mt-1 text-muted-foreground">{body}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {cta}
                    <ArrowRightIcon
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
