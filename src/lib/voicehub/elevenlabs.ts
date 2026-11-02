// VoiceHub (AIKitFinder) — ElevenLabs API, verified facts only.
// Endpoint: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
// Header: xi-api-key. Body: { text, model_id, voice_settings }.
// Response: binary audio (MP3). GET /v1/voices lists voices.
// The API key is read ONLY here, server-side, from process.env.
// It is never sent to the browser and never logged.

export const MODELS = [
  { id: "eleven_flash_v2_5", label: "Flash v2.5 — fast" },
  { id: "eleven_multilingual_v2", label: "Multilingual v2 — multilingual" },
  { id: "eleven_v3", label: "Eleven v3 — flagship" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export const MODEL_IDS: string[] = MODELS.map((m) => m.id);

// ONLY these two voice IDs are hardcoded, because only these two were
// verified. Every other voice must come from the live GET /v1/voices
// response when an API key is present — never from a guessed list.
export const FALLBACK_VOICES = [
  { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
  { voice_id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
] as const;

export type VoiceOption = { voice_id: string; name: string; note?: string };

export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

// Server-only. Never call this from a client component.
export function elevenLabsApiKey(): string {
  return process.env.ELEVENLABS_API_KEY ?? "";
}

export const MAX_CHARS = 5000;
export const MIN_CHARS = 1;

export function validateTtsInput(body: unknown): {
  ok: true;
  text: string;
  voice_id: string;
  model_id: string;
  stability: number;
  similarity_boost: number;
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "No text was sent." };
  const b = body as Record<string, unknown>;
  const text = typeof b.text === "string" ? b.text.trim() : "";
  if (text.length < MIN_CHARS) return { ok: false, error: "Text is empty — please write something." };
  if (text.length > MAX_CHARS)
    return { ok: false, error: `Text is over ${MAX_CHARS} characters — please shorten it.` };
  const voice_id = typeof b.voice_id === "string" ? b.voice_id.trim() : "";
  if (!voice_id || voice_id.length > 128)
    return { ok: false, error: "No voice selected." };
  const model_id = typeof b.model_id === "string" ? b.model_id : "";
  if (!MODEL_IDS.includes(model_id)) return { ok: false, error: "Model is not valid." };
  const num = (v: unknown, fallback: number) => {
    const n = typeof v === "number" ? v : fallback;
    if (Number.isNaN(n)) return fallback;
    return Math.min(1, Math.max(0, n));
  };
  return {
    ok: true,
    text,
    voice_id,
    model_id,
    stability: num(b.stability, 0.5),
    similarity_boost: num(b.similarity_boost, 0.75),
  };
}
