// VoiceHub credit system — in-memory DEMO ledger.
// This ledger is the ONLY record until a database is wired, and it
// resets on every redeploy / server restart. The UI must always
// label it DEMO. Generations store lengths, voice and model ONLY —
// never the user's text and never any API key.

export type GenerationRecord = {
  id: string;
  createdAt: string;
  chars: number;
  voice_id: string;
  voice_name: string;
  model_id: string;
};

// Mirror of the ElevenLabs free tier (10,000 credits/month) used as the
// demo wallet. This is a demo guard, not a payment system: when it
// runs out, /api/voicehub/tts stops with 402.
export const DEMO_TOTAL_CHARS = 10000;

type Store = { used: number; generations: GenerationRecord[] };

function store(): Store {
  const g = globalThis as unknown as { __voicehubDemoStore?: Store };
  if (!g.__voicehubDemoStore) g.__voicehubDemoStore = { used: 0, generations: [] };
  return g.__voicehubDemoStore;
}

export function demoCredits() {
  const s = store();
  return {
    total: DEMO_TOTAL_CHARS,
    used: s.used,
    remaining: Math.max(0, DEMO_TOTAL_CHARS - s.used),
    demo: true,
  };
}

export function canSpend(chars: number): boolean {
  return store().used + chars <= DEMO_TOTAL_CHARS;
}

// Call ONLY after ElevenLabs returned a successful audio response,
// so a failed generation never spends demo credit.
export function recordGeneration(rec: Omit<GenerationRecord, "id" | "createdAt">): GenerationRecord {
  const s = store();
  const entry: GenerationRecord = {
    ...rec,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  s.used += rec.chars;
  s.generations.push(entry);
  if (s.generations.length > 100) s.generations.splice(0, s.generations.length - 100);
  return entry;
}
