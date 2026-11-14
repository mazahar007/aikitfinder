"use client";

import { toggleMotion, useMotionPaused } from "@/components/parent/motion-store";
import { cn } from "@/lib/utils";

/**
 * Visible Pause/Resume control for all persistent decorative motion on the
 * parent homepage (WCAG 2.2.2). It appears twice in the markup, in the header
 * for wider screens and under the status lines on phones; the stylesheet shows
 * one of them. Both read and write the same state.
 */
export function MotionToggle({ className }: { className?: string }) {
  const paused = useMotionPaused();
  return (
    <button
      type="button"
      className={cn("motion-btn", className)}
      aria-pressed={paused}
      onClick={toggleMotion}
    >
      <svg className="i-pause" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <svg className="i-play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5l11 7-11 7z" fill="currentColor" />
      </svg>
      <span>{paused ? "Play motion" : "Pause motion"}</span>
    </button>
  );
}
