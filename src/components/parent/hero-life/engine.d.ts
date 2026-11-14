export declare const MOTION_STORAGE_KEY: string;

export type HeroLifeOptions = {
  /** Called whenever motion is paused or resumed, including the initial state. */
  onPausedChange?: (paused: boolean) => void;
  /** Force the phone layout (own lane, smaller fish). */
  lite?: boolean;
  /** Force economy drawing (same route, cheaper drawing). */
  eco?: boolean;
  /** Disable the automatic fallback to economy drawing. */
  full?: boolean;
  /** Seconds of swimming to simulate for the first, still frame. */
  pose?: number;
  /** Build the QA hooks (`debug`). */
  debug?: boolean;
};

export type HeroLifeDebug = {
  bench(frames: number): number;
  sim(
    seconds: number,
    zones: Record<string, [number, number, number, number]>,
  ): {
    max: Record<string, number>;
    len: number;
    head: [number, number];
    lite: boolean;
    eco: boolean;
  };
};

export type HeroLife = {
  isPaused(): boolean;
  setPaused(paused: boolean): void;
  debug: HeroLifeDebug | null;
  destroy(): void;
};

export declare function createHeroLife(
  hero: HTMLElement,
  canvas: HTMLCanvasElement,
  options?: HeroLifeOptions,
): HeroLife | null;
