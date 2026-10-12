import type { CSSProperties } from "react";

/**
 * Props for an item that rises into view on scroll (see `.reveal` in
 * motion.css). `index` staggers items that share a row.
 */
export function reveal(index = 0, perRow = 3) {
  return {
    className: "reveal",
    style: { "--reveal-i": index % perRow } as CSSProperties,
  };
}

/** Delay step for staggered entrance animations (see `.enter` in motion.css). */
export function enterDelay(step: number) {
  return { "--enter-delay": step } as CSSProperties;
}
