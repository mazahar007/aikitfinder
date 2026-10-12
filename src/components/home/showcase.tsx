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
