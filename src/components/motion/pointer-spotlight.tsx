"use client";

import { useEffect } from "react";

/**
 * One listener for the whole page: as the pointer moves over a `.card-motion`
 * element, store the pointer position on it (--mx / --my) so its CSS light
 * can follow. Skipped for touch input and for reduced-motion users.
 */
export function PointerSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      if (!last) return;
      const target = (last.target as Element | null)?.closest?.<HTMLElement>(".card-motion");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${last.clientX - rect.left}px`);
      target.style.setProperty("--my", `${last.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
