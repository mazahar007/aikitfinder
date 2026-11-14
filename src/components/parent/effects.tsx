"use client";

import * as React from "react";

/**
 * Small page behaviors of the parent site, kept out of the server components:
 *  - the header becomes a blurred fixed bar after 24px of scroll;
 *  - sections fade up once as they enter the viewport.
 * With reduced motion (or without IntersectionObserver) sections are simply
 * visible. Renders nothing.
 */
export function ParentEffects() {
  React.useEffect(() => {
    const root = document.documentElement;
    const header = document.getElementById("top");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let observer: IntersectionObserver | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "IntersectionObserver" in window) {
      root.setAttribute("data-reveal", "on");
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              observer?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px" },
      );
      document.querySelectorAll(".akf-parent .fade-up").forEach((el) => observer?.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      root.removeAttribute("data-reveal");
    };
  }, []);

  return null;
}
