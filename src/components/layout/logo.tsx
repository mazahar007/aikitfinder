import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Logo mark: a magnifying glass with a spark, drawn in brand tokens. */
export function LogoMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("size-8 shrink-0", className)}
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill={inverted ? "rgb(255 255 255 / 0.12)" : "var(--logo-tile)"}
      />
      <circle cx="14" cy="14" r="6.5" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M19 19l5.5 5.5" stroke="#fff" strokeWidth="2.75" strokeLinecap="round" />
      <path
        d="M14 10.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"
        fill={inverted ? "var(--on-brand-accent)" : "var(--logo-spark)"}
        stroke={inverted ? "var(--on-brand-accent)" : "var(--logo-spark)"}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-extrabold tracking-tight",
        className,
      )}
    >
      <LogoMark inverted={inverted} />
      <span className={cn("text-lg", inverted ? "text-white" : "text-heading")}>
        AIKit<span className={inverted ? "text-on-brand-accent" : "text-primary"}>Finder</span>
      </span>
    </Link>
  );
}
