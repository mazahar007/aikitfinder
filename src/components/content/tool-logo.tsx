import { ViewTransition } from "react";

import { cn } from "@/lib/utils";

const tones = [
  "bg-primary-tint text-primary-hover",
  "bg-learn-tint text-learn",
  "bg-surface-subtle text-heading",
];

/**
 * Placeholder mark built from the tool's initials. Real logos are only shown
 * when the vendor permits it (master brief, section 10), so we never invent one.
 */
export function ToolLogo({
  name,
  size = "md",
  className,
  morphId,
}: {
  name: string;
  size?: "md" | "lg";
  className?: string;
  /**
   * Gives the logo a shared identity so it visibly travels from a tool card
   * to the tool page header on navigation. Use only where a tool appears once.
   */
  morphId?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tone = tones[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % tones.length];
  const logo = (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border font-bold",
        size === "lg" ? "size-16 text-xl" : "size-11 text-sm",
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
  if (!morphId) return logo;
  return (
    <ViewTransition name={`tool-logo-${morphId}`} share="morph" default="none">
      {logo}
    </ViewTransition>
  );
}
