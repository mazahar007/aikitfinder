"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-linked "showcase" motion for the homepage, powered by GSAP.
 *
 * The children are ordinary server-rendered markup that is complete and
 * readable on its own. This component only *enhances* elements it finds by
 * data attribute, so nothing is hidden if JavaScript is slow, fails, or the
 * visitor prefers reduced motion:
 *
 *   [data-ribbon]           a track that slides sideways as you scroll
 *                           (value = direction: "left" | "right")
 *   [data-draw]             an SVG whose [pathLength] strokes draw on scroll
 *   [data-chapter]          a story chapter; its value is the background
 *                           colour token the [data-story] section fades to
 *   [data-story]            the section whose background changes per chapter
 *
 * GSAP is imported dynamically, so it is downloaded only on pages that use
 * this component (currently the homepage).
 */
export function ScrollScenes({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const story = el.querySelector<HTMLElement>("[data-story]");
      if (story) {
        // Hand chapter colours over to the section so they can cross-fade.
        story.dataset.scenes = "on";
        const first = el.querySelector<HTMLElement>("[data-chapter]")?.dataset.chapter;
        if (first) story.style.backgroundColor = `var(${first})`;
      }
      const ctx = gsap.context(() => {
        // Kinetic ribbons: each track drifts sideways while the band is on screen.
        el.querySelectorAll<HTMLElement>("[data-ribbon]").forEach((track) => {
          const dir = track.dataset.ribbon === "right" ? 1 : -1;
          gsap.fromTo(
            track,
            { xPercent: dir > 0 ? -18 : 0 },
            {
              xPercent: dir > 0 ? 0 : -18,
              ease: "none",
              scrollTrigger: {
                trigger: track.closest("[data-ribbons]") ?? track,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });

        // Line art draws itself as it scrolls into view.
        el.querySelectorAll<SVGSVGElement>("[data-draw]").forEach((svg) => {
          const strokes = svg.querySelectorAll<SVGGeometryElement>("[pathLength]");
          gsap.fromTo(
            strokes,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: { trigger: svg, start: "top 85%", end: "top 35%", scrub: 0.8 },
            },
          );
          gsap.fromTo(
            svg.querySelectorAll("[data-draw-fill]"),
            { scale: 0, transformOrigin: "50% 50%" },
            {
              scale: 1,
              ease: "back.out(2)",
              stagger: 0.1,
              scrollTrigger: {
                trigger: svg,
                start: "top 45%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });

        // Story: the section background shifts colour chapter by chapter, and
        // each chapter's text rises in.
        el.querySelectorAll<HTMLElement>("[data-chapter]").forEach((chapter) => {
          const colour = chapter.dataset.chapter;
          if (story && colour) {
            ScrollTrigger.create({
              trigger: chapter,
              start: "top 55%",
              end: "bottom 55%",
              // Set the token itself (not a resolved colour) so a theme
              // switch updates it; CSS transitions the change.
              onToggle: (self) => {
                if (self.isActive) story.style.backgroundColor = `var(${colour})`;
              },
            });
          }
          gsap.from(chapter.querySelectorAll("[data-chapter-text] > *"), {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: chapter, start: "top 75%" },
          });
        });
      }, el);

      cleanup = () => {
        ctx.revert();
        if (story) {
          story.style.backgroundColor = "";
          delete story.dataset.scenes;
        }
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
