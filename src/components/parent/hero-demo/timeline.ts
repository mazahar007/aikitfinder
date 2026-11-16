/**
 * The hero's illustrative product animation, as pure functions of one tick
 * counter (one tick = 80 ms). Tick 0 is exactly the approved still frame: the
 * first search fully typed with its three results, and the approval message.
 * That is also what is shown when motion is paused or reduced.
 *
 * Everything here is illustration. The tools are fictional demo records and
 * the "render" is not a real job.
 */
export const TICK_MS = 80;

export type DemoTool = { name: string; kind: string; initial: string; tint: string };

const cyan = "linear-gradient(135deg, #7aeaf3, #2bb8d0)";
const blue = "linear-gradient(135deg, #8cc8ff, #3a8ee6)";
const teal = "linear-gradient(135deg, #7ff0d4, #22b59a)";
const tool = (name: string, kind: string, tint: string): DemoTool => ({
  name,
  kind,
  initial: name[0],
  tint,
});

export const searches: { query: string; results: DemoTool[] }[] = [
  {
    query: "voiceover for a documentary",
    results: [
      tool("Voxly", "Audio and voice", cyan),
      tool("Storyreel", "Video generation", blue),
      tool("Notewell", "Audio and voice", teal),
    ],
  },
  {
    query: "summarize a research paper",
    results: [
      tool("Citebird", "Research", teal),
      tool("Draftwise", "Research", cyan),
      tool("Notewell", "Audio and voice", blue),
    ],
  },
  {
    query: "turn a blog post into a video",
    results: [
      tool("Storyreel", "Video generation", blue),
      tool("Pictora", "Images", teal),
      tool("Flowpilot", "Automation", cyan),
    ],
  },
];

const HOLD = 34; // about 2.7 s with the results on screen
const ERASE_PER_TICK = 3;

export type SearchFrame = {
  /** Which search the visible rows belong to. */
  index: number;
  text: string;
  /** How many result rows are visible (0–3). */
  shown: number;
  /** True while the previous query is being cleared. */
  clearing: boolean;
};

const segment = (query: string) => ({
  hold: HOLD,
  erase: Math.ceil(query.length / ERASE_PER_TICK),
});

/** Total ticks for one full loop through every search. */
export const searchLoop = searches.reduce((sum, s, i) => {
  const next = searches[(i + 1) % searches.length];
  const { hold, erase } = segment(s.query);
  return sum + hold + erase + next.query.length;
}, 0);

export function searchFrame(tick: number): SearchFrame {
  let t = ((tick % searchLoop) + searchLoop) % searchLoop;
  for (let i = 0; i < searches.length; i++) {
    const current = searches[i];
    const nextIndex = (i + 1) % searches.length;
    const next = searches[nextIndex];
    const { hold, erase } = segment(current.query);
    if (t < hold) return { index: i, text: current.query, shown: 3, clearing: false };
    t -= hold;
    if (t < erase) {
      const left = Math.max(0, current.query.length - (t + 1) * ERASE_PER_TICK);
      return { index: i, text: current.query.slice(0, left), shown: 3, clearing: true };
    }
    t -= erase;
    if (t < next.query.length) {
      const typed = t + 1;
      // Results arrive as the query takes shape: one row per third typed.
      return {
        index: nextIndex,
        text: next.query.slice(0, typed),
        shown: Math.min(3, Math.floor((typed / next.query.length) * 3.2)),
        clearing: false,
      };
    }
    t -= next.query.length;
  }
  return { index: 0, text: searches[0].query, shown: 3, clearing: false };
}

export type GateFrame =
  { phase: "approval" } | { phase: "render"; percent: number } | { phase: "review" };

const APPROVAL = 56;
const RENDER = 70;
const REVIEW = 28;

export function gateFrame(tick: number): GateFrame {
  const t = tick % (APPROVAL + RENDER + REVIEW);
  if (t < APPROVAL) return { phase: "approval" };
  if (t < APPROVAL + RENDER)
    return { phase: "render", percent: Math.round(((t - APPROVAL + 1) / RENDER) * 100) };
  return { phase: "review" };
}

/** "00:01:12:04" style timecode at 25 frames a second, advancing with the clock. */
export function timecode(tick: number): string {
  const frames = (60 + 12) * 25 + 4 + tick * 2;
  const pad = (n: number) => String(n).padStart(2, "0");
  const seconds = Math.floor(frames / 25);
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frames % 25)}`;
}

export const sceneNumber = (tick: number) => 3 + (Math.floor(tick / 110) % 3);
