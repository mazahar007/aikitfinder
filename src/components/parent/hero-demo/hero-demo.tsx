"use client";

import * as React from "react";

import { advance, useDemoTick } from "@/components/parent/hero-demo/clock";
import {
  gateFrame,
  sceneNumber,
  searchFrame,
  searches,
  TICK_MS,
  timecode,
} from "@/components/parent/hero-demo/timeline";
import { useMotionPaused } from "@/components/parent/motion-store";

/**
 * Runs the demo clock while all of these hold: motion is not paused (the
 * global Pause control), the visitor has not asked for reduced motion, the
 * hero visual is on screen, and the tab is visible. Otherwise nothing ticks.
 * It also tells the stylesheet, through `data-demo` on the stage, so the CSS
 * parts of the animation stop at the same moment.
 */
export function HeroDemoClock() {
  const paused = useMotionPaused();
  const anchor = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const stage = anchor.current?.closest<HTMLElement>(".stage");
    if (!stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;
    let timer = 0;

    const sync = () => {
      const run = !paused && !reduced.matches && onScreen && !document.hidden;
      stage.dataset.demo = run ? "on" : "off";
      if (run && !timer) timer = window.setInterval(advance, TICK_MS);
      if (!run && timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      if (timer) window.clearInterval(timer);
      stage.dataset.demo = "off";
    };
  }, [paused]);

  return <span ref={anchor} hidden />;
}

/** The Directory panel's search field and results: a query is typed, results arrive, then it changes. */
export function HeroSearchDemo() {
  const frame = searchFrame(useDemoTick());
  const { results } = searches[frame.index];
  return (
    <>
      <div className="srch">
        <svg>
          <use href="#i-search" />
        </svg>
        {frame.text}
        <span className="caret"></span>
      </div>
      <ul className="res">
        {results.map((tool, i) => (
          <li
            // A new key per search, so each row slides in again when the results change.
            key={`${frame.index}-${tool.name}`}
            className={i >= frame.shown ? "row-pending" : frame.clearing ? "row-out" : "row-in"}
          >
            <span className="ini" style={{ background: tool.tint }}>
              {tool.initial}
            </span>
            <span>
              <strong>{tool.name}</strong>
              <em>{tool.kind}</em>
            </span>
            <span className="s">DEMO</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Scene label and running timecode on the studio preview. */
export function HeroStudioReadouts() {
  const tick = useDemoTick();
  return (
    <>
      <span className="sc">SCENE {String(sceneNumber(tick)).padStart(2, "0")} · 16:9</span>
      <span className="tc">{timecode(tick)}</span>
    </>
  );
}

/**
 * The approval chip: an illustrative render fills up, waits for review, and
 * arrives at the message that never changes: nothing publishes without the
 * owner's approval. The render is labeled as a demo; it is not a real job.
 */
export function HeroGateDemo() {
  const frame = gateFrame(useDemoTick());
  return (
    <div className="gate" data-phase={frame.phase}>
      <span className="ic">
        <svg>
          <use href="#i-shield" />
        </svg>
      </span>
      <span>
        {frame.phase === "approval" ? (
          <>
            <b>Your approval comes first</b>
            <small>Nothing publishes without it</small>
          </>
        ) : frame.phase === "render" ? (
          <>
            <b>Rendering preview</b>
            <small>
              Demo · {frame.percent}%
              <i className="bar">
                <i style={{ width: `${frame.percent}%` }}></i>
              </i>
            </small>
          </>
        ) : (
          <>
            <b>Ready for your review</b>
            <small>Demo · waiting for approval</small>
          </>
        )}
      </span>
    </div>
  );
}
