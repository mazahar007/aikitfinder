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
    let mm: { revert: () => void } | undefined;
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

        // Cloud wipes: the cloud rises from below to cover the band.
        el.querySelectorAll<HTMLElement>("[data-wipe]").forEach((band) => {
          gsap.fromTo(
            band.querySelector("[data-wipe-cloud]"),
            { yPercent: 75 },
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: band, start: "top bottom", end: "bottom 60%", scrub: 0.5 },
            },
          );
        });

        // Closing call to action: giant words slide in from alternating sides.
        el.querySelectorAll<HTMLElement>("[data-cta-line]").forEach((line, i) => {
          gsap.fromTo(
            line,
            { xPercent: i % 2 ? -25 : 25, opacity: 0.15 },
            {
              xPercent: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: line, start: "top 95%", end: "top 55%", scrub: 0.6 },
            },
          );
        });

        // Story previews: the feature preview builds itself piece by piece.
        el.querySelectorAll<HTMLElement>("[data-chapter]").forEach((chapter) => {
          const items = chapter.querySelectorAll("[data-preview-item]");
          if (!items.length) return;
          gsap.from(items, {
            y: 18,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.09,
            scrollTrigger: { trigger: chapter, start: "top 62%" },
          });
        });

        // Category grid: icons pop and example tools appear in sequence.
        el.querySelectorAll<HTMLElement>("[data-category-grid]").forEach((grid) => {
          // Explicit end values, and the icon's own hover transition switched
          // off while GSAP drives it; inline styles are cleared afterwards.
          gsap.fromTo(
            grid.querySelectorAll(".card-icon"),
            { scale: 0, rotate: -25, transition: "none" },
            {
              scale: 1,
              rotate: 0,
              duration: 0.6,
              ease: "back.out(2.2)",
              stagger: 0.05,
              clearProps: "transform,scale,rotate,transition",
              scrollTrigger: { trigger: grid, start: "top 80%" },
            },
          );
          gsap.from(grid.querySelectorAll("[data-tool-chip]"), {
            y: 8,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.03,
            delay: 0.25,
            scrollTrigger: { trigger: grid, start: "top 80%" },
          });
        });

        // Zoom card (all sizes): the miniature tool page tilts up into view.
        el.querySelectorAll<HTMLElement>("[data-zoom]").forEach((section) => {
          gsap.from(section.querySelectorAll("[data-zoom-callout]"), {
            x: -40,
            opacity: 0,
            stagger: 0.15,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 60%" },
          });
        });
      }, el);

      // Wide screens only: pinned sections (sideways rail, zooming card).
      // Small screens keep the native swipeable row and normal scrolling.
      const media = gsap.matchMedia();
      mm = media;
      media.add("(min-width: 1024px)", () => {
        el.querySelectorAll<HTMLElement>("[data-hscroll]").forEach((section) => {
          const viewport = section.querySelector<HTMLElement>("[data-hscroll-viewport]");
          const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
          if (!viewport || !track) return;
          viewport.style.overflow = "hidden";
          const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          tl.to(track, { x: () => -distance(), ease: "none" }, 0);
          const bar = section.querySelector("[data-hscroll-progress]");
          if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
          // Stickers drift upward at different speeds while the rail slides.
          section.querySelectorAll<HTMLElement>("[data-sticker]").forEach((sticker) => {
            const speed = Number(sticker.dataset.speed ?? 1);
            tl.fromTo(sticker, { y: 40 * speed }, { y: -60 * speed, ease: "none" }, 0);
          });
          return () => {
            viewport.style.overflow = "";
          };
        });

        el.querySelectorAll<HTMLElement>("[data-zoom]").forEach((section) => {
          const frame = section.querySelector("[data-zoom-frame]");
          if (!frame) return;
          gsap.fromTo(
            frame,
            { scale: 0.62, rotateX: 18, rotateZ: -4, y: 60 },
            {
              scale: 1,
              rotateX: 0,
              rotateZ: 0,
              y: 0,
              ease: "power1.out",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=80%",
                pin: true,
                scrub: 0.6,
              },
            },
          );
        });
      });

      // Pinned sections add scroll space, so every trigger below them must be
      // measured after they exist: sort by page position and re-measure, and
      // again once web fonts have settled the layout.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      document.fonts?.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      cleanup = () => {
        mm?.revert();
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
