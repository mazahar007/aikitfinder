import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- ribbons */

function RibbonWords({ words }: { words: string[] }) {
  // Repeated so the track is always wider than the screen while it slides.
  const sequence = [...words, ...words, ...words];
  return (
    <>
      {sequence.map((word, i) => (
        <span key={i} className="inline-flex items-center gap-[0.35em]">
          {word}
          <span className="ribbon-star" />
        </span>
      ))}
    </>
  );
}

/** Three tilted pills of oversized words that drift as the page scrolls. */
export function Ribbons() {
  return (
    // Purely decorative: the same ideas are told in words by <Story /> below.
    <div data-ribbons aria-hidden="true" className="ribbons bg-card">
      <div className="-mx-[10vw] [&>div]:origin-center">
        <div className="-rotate-[4deg]">
          <div data-ribbon="left" className="ribbon bg-brand text-white">
            <RibbonWords words={["Discover", "Learn", "Create", "Automate"]} />
          </div>
        </div>
        <div className="relative z-10 rotate-[3deg]">
          <div
            data-ribbon="right"
            className="ribbon border-[3px] border-heading bg-card text-heading"
          >
            <RibbonWords words={["Find it", "Learn it", "Use it"]} />
          </div>
        </div>
        <div className="-rotate-[2deg]">
          <div data-ribbon="left" className="ribbon bg-primary text-primary-foreground">
            <RibbonWords words={["AI tools", "Guides", "Prompts", "Workflows"]} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- marquee */

/** A single line of huge outlined words that slides with the scroll. */
export function OutlineMarquee({ words }: { words: string[] }) {
  const sequence = [...words, ...words, ...words];
  return (
    <div data-ribbons aria-hidden="true" className="overflow-hidden py-6 sm:py-10">
      <div
        data-ribbon="right"
        className="flex w-max items-center gap-[0.4em] text-[clamp(3rem,10vw,8rem)] leading-none font-extrabold tracking-tight whitespace-nowrap text-transparent uppercase [-webkit-text-stroke:2px_var(--heading)]"
      >
        {sequence.map((word, i) => (
          <span key={i} className="inline-flex items-center gap-[0.4em]">
            {word}
            <ArrowRightIcon
              className="size-[0.7em] [stroke-width:2.5] text-primary"
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- dividers */

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("squiggle", className)}
    >
      <path
        d="M0 12 Q 25 0 50 12 T 100 12 T 150 12 T 200 12 T 250 12 T 300 12 T 350 12 T 400 12 T 450 12 T 500 12 T 550 12 T 600 12 T 650 12 T 700 12 T 750 12 T 800 12 T 850 12 T 900 12 T 950 12 T 1000 12 T 1050 12 T 1100 12 T 1150 12 T 1200 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------ line art */

const stroke = {
  pathLength: 1,
  stroke: "currentColor",
  strokeWidth: 3,
} as const;
const accent = { ...stroke, stroke: "var(--primary-hover)" } as const;

function LineArt({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 240 200"
      role="img"
      aria-label={label}
      data-draw
      className="line-art h-auto w-full max-w-sm text-heading"
    >
      {children}
    </svg>
  );
}

function DiscoverArt() {
  return (
    <LineArt label="A magnifying glass over a stack of tool cards">
      <rect x="22" y="36" width="112" height="72" rx="12" {...stroke} />
      <path d="M38 58 H96 M38 74 H118 M38 90 H80" {...stroke} />
      <rect x="52" y="76" width="112" height="72" rx="12" {...stroke} />
      <path d="M68 100 H130 M68 116 H146" {...stroke} />
      <circle cx="162" cy="112" r="40" {...accent} />
      <path d="M190 141 L218 172" {...accent} strokeWidth={6} />
      <path
        data-draw-fill
        d="M162 96 L166 108 L178 112 L166 116 L162 128 L158 116 L146 112 L158 108 Z"
        fill="var(--primary-hover)"
      />
    </LineArt>
  );
}

function LearnArt() {
  return (
    <LineArt label="An open book with a bookmark">
      <path d="M120 58 C 96 42 56 42 28 54 L 28 162 C 56 150 96 150 120 166 Z" {...stroke} />
      <path d="M120 58 C 144 42 184 42 212 54 L 212 162 C 184 150 144 150 120 166 Z" {...stroke} />
      <path
        d="M48 80 Q 74 72 100 80 M48 102 Q 74 94 100 102 M48 124 Q 74 116 100 124"
        {...stroke}
      />
      <path d="M140 80 Q 166 72 192 80 M140 102 Q 166 94 192 102" {...stroke} />
      <path d="M172 46 L 172 96 L 182 86 L 192 96 L 192 46" {...accent} />
      <circle data-draw-fill cx="166" cy="128" r="8" fill="var(--primary-hover)" />
    </LineArt>
  );
}

function CreateArt() {
  return (
    <LineArt label="Three settings sliders and a spark">
      <path d="M30 62 H190 M30 104 H190 M30 146 H190" {...stroke} />
      <circle data-draw-fill cx="88" cy="62" r="11" fill="var(--primary-hover)" />
      <circle data-draw-fill cx="152" cy="104" r="11" fill="var(--heading)" />
      <circle data-draw-fill cx="66" cy="146" r="11" fill="var(--primary-hover)" />
      <path
        d="M212 22 L 218 40 L 236 46 L 218 52 L 212 70 L 206 52 L 188 46 L 206 40 Z"
        {...accent}
      />
      <path d="M196 156 L 214 174 M214 156 L 196 174" {...stroke} />
    </LineArt>
  );
}

function AutomateArt() {
  return (
    <LineArt label="Four connected steps in a loop">
      <circle cx="56" cy="100" r="24" {...stroke} />
      <circle cx="120" cy="40" r="24" {...stroke} />
      <circle cx="184" cy="100" r="24" {...stroke} />
      <circle cx="120" cy="160" r="24" {...stroke} />
      <path d="M72 82 L 102 56 M138 56 L 168 82 M168 118 L 138 144 M102 144 L 72 118" {...accent} />
      <path
        d="M96 52 L 104 54 L 101 62 M162 76 L 170 80 L 166 88 M144 140 L 136 146 L 134 138 M78 124 L 70 120 L 74 112"
        {...accent}
      />
      <circle data-draw-fill cx="120" cy="100" r="9" fill="var(--primary-hover)" />
    </LineArt>
  );
}

/* --------------------------------------------------------------- story */

const chapters = [
  {
    token: "--story-1",
    kicker: "Discover",
    title: "Search for what you want to do",
    body: "Type a task like “make a video from a blog post”. We match it to tools, guides and prompts, and you can filter by skill level and budget.",
    href: "/tools",
    cta: "Explore tools",
    art: <DiscoverArt />,
  },
  {
    token: "--story-2",
    kicker: "Learn",
    title: "Understand it before you sign up",
    body: "Every tool page explains setup, settings and limits in plain English, with sources and the date we last checked.",
    href: "/guides",
    cta: "Browse guides",
    art: <LearnArt />,
  },
  {
    token: "--story-3",
    kicker: "Create",
    title: "Copy a prompt. Get a result.",
    body: "Prompt templates show exactly which parts to change and what result to expect, so your first try is a good one.",
    href: "/tools/storyreel#prompts",
    cta: "See an example",
    art: <CreateArt />,
  },
  {
    token: "--story-4",
    kicker: "Automate",
    title: "Chain tools into workflows",
    body: "Follow step-by-step recipes that pass one tool’s output into the next, and repeat them whenever you need.",
    href: "/workflows",
    cta: "See workflows",
    art: <AutomateArt />,
  },
];

/**
 * Four chapters (Discover → Learn → Create → Automate). Without motion each
 * chapter shows its own colour; with motion the whole section fades between
 * the colours as you scroll (see ScrollScenes).
 */
export function Story() {
  return (
    <section data-story aria-labelledby="story-heading" className="group/story bg-background">
      <h2 id="story-heading" className="sr-only">
        How AIKitFinder works
      </h2>
      {chapters.map((c, i) => (
        <article
          key={c.kicker}
          data-chapter={c.token}
          className="flex min-h-[85vh] items-center py-16 group-data-[scenes=on]/story:bg-transparent!"
          style={{ backgroundColor: `var(${c.token})` }}
        >
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            <div className={cn("flex justify-center", i % 2 === 1 && "md:order-2")}>{c.art}</div>
            <div data-chapter-text>
              <p className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="text-6xl font-extrabold tracking-tighter text-transparent [-webkit-text-stroke:1.5px_var(--heading)] sm:text-7xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-heading px-3 py-0.5 text-sm font-semibold tracking-wide text-heading uppercase">
                  {c.kicker}
                </span>
              </p>
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
          </div>
        </article>
      ))}
    </section>
  );
}
