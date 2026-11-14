"use client";

import { useSyncExternalStore } from "react";

import { MOTION_STORAGE_KEY, type HeroLife } from "@/components/parent/hero-life/engine";

/**
 * Pause/Resume state for the parent homepage's persistent decorative motion
 * (fish, particles, mist, orbit rings, caret). One source of truth shared by
 * the two Pause buttons (header on desktop, hero on phones) and the canvas.
 * The state is published on <html data-motion> for the stylesheet.
 */
let paused = false;
let controller: HeroLife | null = null;
const listeners = new Set<() => void>();

function publish(next: boolean) {
  paused = next;
  document.documentElement.setAttribute("data-motion", next ? "paused" : "running");
  listeners.forEach((listener) => listener());
}

/** Called by the canvas once the animation engine has loaded (or unloaded). */
export function connectMotionController(next: HeroLife | null) {
  controller = next;
  if (next) publish(next.isPaused());
}

/** Called by the engine whenever it pauses or resumes. */
export function reportMotionPaused(next: boolean) {
  if (next !== paused) publish(next);
}

export function toggleMotion() {
  const next = !paused;
  if (controller) {
    controller.setPaused(next); // reports back through reportMotionPaused
    return;
  }
  // The engine has not loaded (or cannot): the control still stops the CSS motion.
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, next ? "paused" : "on");
  } catch {
    // Storage can be unavailable (private mode).
  }
  publish(next);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMotionPaused(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => paused,
    () => false,
  );
}
