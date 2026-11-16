"use client";

import { useSyncExternalStore } from "react";

/**
 * One shared tick counter for the hero's illustrative animation. It advances
 * only while <HeroDemoClock> says the animation may run, so every part of the
 * demo stops together and resumes from where it was.
 */
let tick = 0;
const listeners = new Set<() => void>();

export function advance() {
  tick += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current tick. On the server and before the clock starts it is 0: the approved still frame. */
export function useDemoTick(): number {
  return useSyncExternalStore(
    subscribe,
    () => tick,
    () => 0,
  );
}
