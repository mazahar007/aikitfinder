import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon, CopyIcon, SlidersHorizontalIcon } from "lucide-react";

import { ToolCard } from "@/components/content/cards";
import type { Tool } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ cloud wipe */

/** Soft "cloud" top edge: a row of rounded bumps of different sizes. */
function cloudPath() {
  const bumps = [
    [150, 70],
    [190, 95],
    [130, 60],
    [220, 105],
    [160, 75],
    [140, 85],
    [210, 100],
  ];
  let d = "M0 200 L0 110";
  for (const [w, h] of bumps) d += ` a${w / 2} ${h} 0 0 1 ${w} 0`;
  return `${d} L1200 110 L1200 200 Z`;
}
const CLOUD = cloudPath();

/**
 * A band where a cloud-shaped colour rises to cover the screen, handing the
 * page over to the next section's colour. Without motion it is a static
 * cloud edge.
 *
 * - "to-dark":  page background → brand navy (enters the dark zone)
 * - "to-light": brand navy → page background (leaves the dark zone)
 */
export function CloudWipe({ direction }: { direction: "to-dark" | "to-light" }) {
  const toDark = direction === "to-dark";
  return (
    <div
      data-wipe
      aria-hidden="true"
      className={cn("relative h-[38vh] overflow-hidden", toDark ? "bg-background" : "bg-brand")}
    >
      <div
        data-wipe-cloud
        className={cn(
          "absolute inset-x-0 bottom-0 h-full",
          toDark ? "text-brand" : "text-background",
        )}
      >
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-[45%] w-full"
        >
          <path d={CLOUD} fill="currentColor" />
        </svg>
        <div className="absolute inset-x-0 top-[44%] bottom-0 bg-current" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------ horizontal rail */

/**
 * Featured tools on a dark band. Without motion (and on small screens) it is
 * a swipeable row; on wide screens with motion the section pins and the row
 * slides sideways as you scroll down.
 */
export function FeaturedRail({
  tools,
  categoryName,
}: {
  tools: Tool[];
  categoryName: (slug: string) => string | undefined;
}) {
  return (
    <section
      data-hscroll
      aria-labelledby="featured-heading"
      className="relative overflow-hidden bg-brand py-16 text-on-brand lg:flex lg:min-h-screen lg:flex-col lg:justify-center"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-widest text-on-brand-accent uppercase">
            Editor’s picks
          </p>
          <h2
            id="featured-heading"
            className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Featured tools
          </h2>
          <p className="mt-2 max-w-md">
            Useful, beginner-friendly picks. These are fictional sample tools for the prototype.
          </p>
        </div>
        <Link
          href="/tools"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 font-semibold text-white transition-colors hover:bg-white hover:text-brand"
        >
          Explore all tools
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div
        data-hscroll-viewport
        className="mt-10 snap-x snap-mandatory scroll-pl-[max(1rem,calc((100vw_-_1200px)/2_+_2rem))] [scrollbar-width:thin] overflow-x-auto pb-4"
      >
        <ul
          data-hscroll-track
          className="flex w-max gap-5 px-[max(1rem,calc((100vw_-_1200px)/2_+_2rem))]"
        >
          {tools.map((tool) => (
            <li key={tool.slug} className="w-[min(82vw,22rem)] shrink-0 snap-start">
              <ToolCard tool={tool} categoryName={categoryName(tool.categorySlugs[0])} />
            </li>
          ))}
          <li className="w-[min(82vw,22rem)] shrink-0 snap-start">
            <Link
              href="/tools"
              className="group flex h-full min-h-56 flex-col justify-between rounded-md border border-dashed border-white/40 p-6 text-white transition-colors hover:border-white hover:bg-white/5"
            >
              <span className="text-3xl font-extrabold tracking-tight">See every tool</span>
              <ArrowRightIcon
                className="size-10 transition-transform duration-300 group-hover:translate-x-2"
                aria-hidden="true"
              />
            </Link>
          </li>
        </ul>
      </div>

      <div className="mx-auto mt-6 hidden w-full max-w-[1200px] px-8 lg:block" aria-hidden="true">
        <div className="h-0.5 overflow-hidden rounded-full bg-white/15">
          <div data-hscroll-progress className="h-full origin-left bg-on-brand-accent" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ zoom card */

const callouts = [
  {
    icon: SlidersHorizontalIcon,
    title: "Settings in plain English",
    body: "What each option does, when to change it, and the trade-off.",
  },
  {
    icon: CopyIcon,
    title: "Copy-ready prompts",
    body: "The parts you need to change are highlighted.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Sources and a checked date",
    body: "So you know how fresh the information is.",
  },
];

/** A miniature tool page that zooms up to full size while the section is pinned. */
export function ZoomShowcase() {
  return (
    <section
      data-zoom
      aria-labelledby="zoom-heading"
      className="relative overflow-hidden bg-brand py-20 text-on-brand lg:flex lg:min-h-screen lg:items-center"
    >
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-widest text-on-brand-accent uppercase">
            Every tool page
          </p>
          <h2
            id="zoom-heading"
            className="mt-2 text-4xl font-extrabold tracking-tight text-balance text-white sm:text-6xl"
          >
            One page. Everything you need.
          </h2>
          <ul className="mt-8 space-y-5">
            {callouts.map(({ icon: Icon, title, body }) => (
              <li key={title} data-zoom-callout className="flex gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-on-brand-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{title}</span>
                  <span className="block text-sm">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/tools/storyreel"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 font-semibold text-brand transition-transform duration-200 hover:-translate-y-0.5"
          >
            Open a sample tool page
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Decorative miniature of a tool page. */}
        <div aria-hidden="true" className="[perspective:1200px]">
          <div
            data-zoom-frame
            className="overflow-hidden rounded-xl border border-white/10 bg-card text-foreground shadow-2xl"
          >
            <div className="flex items-center gap-1.5 border-b bg-surface-subtle px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
              <span className="ml-3 truncate rounded-md bg-card px-3 py-0.5 text-xs text-muted-foreground">
                aikitfinder.com/tools/storyreel
              </span>
            </div>
            <div className="space-y-4 p-5 text-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-md border bg-primary-tint font-bold text-primary-hover">
                  S
                </span>
                <div>
                  <p className="text-lg font-bold text-heading">Storyreel</p>
                  <p className="text-xs text-muted-foreground">
                    Turns a script into a narrated video
                  </p>
                </div>
                <span className="ml-auto rounded-sm border border-success/40 bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">
                  ✓ Verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-semibold">Beginner</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pricing</p>
                  <p className="font-semibold">Freemium</p>
                </div>
                <div>
                  <p className="text-muted-foreground">API</p>
                  <p className="font-semibold">Yes</p>
                </div>
              </div>
              <div>
                <p className="mb-2 font-semibold text-heading">Quick start</p>
                {["Paste your script", "Pick a format", "Export"].map((step, i) => (
                  <p key={step} className="flex items-center gap-2 py-0.5">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-learn text-[10px] font-bold text-learn-foreground">
                      {i + 1}
                    </span>
                    {step}
                  </p>
                ))}
              </div>
              <div className="rounded-md border bg-surface-subtle p-3 font-mono text-xs">
                Summarise this article into a{" "}
                <mark className="rounded-sm bg-primary-tint px-0.5 text-primary-hover">
                  [length]
                </mark>
                -second script for{" "}
                <mark className="rounded-sm bg-primary-tint px-0.5 text-primary-hover">
                  [audience]
                </mark>
                …
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- closing CTA */

/** Giant words and arrows that slide in, all one link to the directory. */
export function ClosingCta() {
  const lines = ["Start", "exploring", "AI tools"];
  return (
    <section data-cta className="overflow-hidden border-t py-16 sm:py-24">
      <Link
        href="/tools"
        aria-label="Start exploring AI tools"
        className="group mx-auto block w-full max-w-[1200px] px-4 sm:px-6 lg:px-8"
      >
        {lines.map((line, i) => (
          <span
            key={line}
            data-cta-line
            className={cn(
              "flex items-center gap-[0.25em] text-[clamp(3rem,13vw,10rem)] leading-[0.95] font-extrabold tracking-tighter uppercase",
              i === 1 ? "text-gradient" : "text-heading",
              i === 2 && "justify-end",
            )}
          >
            {i === 2 ? (
              <ArrowRightIcon
                className="size-[0.7em] shrink-0 [stroke-width:2.5] text-primary transition-transform duration-300 group-hover:translate-x-3"
                aria-hidden="true"
              />
            ) : null}
            {line}
          </span>
        ))}
        <span className="mt-6 block text-right text-muted-foreground">
          Free to use · No sign-up needed
        </span>
      </Link>
    </section>
  );
}
