"use client";

import * as React from "react";

import type { HeroLife as HeroLifeController } from "@/components/parent/hero-life/engine";
import { connectMotionController, reportMotionPaused } from "@/components/parent/motion-store";

/**
 * The living layer behind the hero: the canvas plus the code that drives it.
 *
 * It is decorative and never blocks anything: the hero's text, buttons and
 * previews are server-rendered and complete without it. The animation code is
 * a separate chunk, fetched once the browser is idle, so it cannot delay the
 * page. If it fails to load, the static hero is the whole experience.
 *
 * QA flags (query string): akf-debug, akf-lite, akf-eco, akf-full, akf-pose=<seconds>.
 */
export function HeroLife() {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const cv = canvas.current;
    const hero = cv?.closest<HTMLElement>(".hero");
    if (!cv || !hero) return;

    let controller: HeroLifeController | null = null;
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const pose = Number(params.get("akf-pose"));

    const start = () => {
      import("@/components/parent/hero-life/engine")
        .then(({ createHeroLife }) => {
          if (cancelled) return;
          controller = createHeroLife(hero, cv, {
            onPausedChange: reportMotionPaused,
            debug: params.has("akf-debug"),
            lite: params.has("akf-lite"),
            eco: params.has("akf-eco"),
            full: params.has("akf-full"),
            pose: Number.isFinite(pose) && pose > 0 ? pose : undefined,
          });
          connectMotionController(controller);
          if (controller?.debug) {
            (window as unknown as { __akf?: unknown }).__akf = controller.debug;
          }
        })
        .catch(() => {
          // The static hero stays as it is.
        });
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 200);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      connectMotionController(null);
      controller?.destroy();
    };
  }, []);

  return <canvas ref={canvas} className="life" aria-hidden="true" />;
}
