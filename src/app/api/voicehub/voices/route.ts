import { NextResponse } from "next/server";
import { FALLBACK_VOICES, elevenLabsApiKey, isElevenLabsConfigured } from "@/lib/voicehub/elevenlabs";
import type { VoiceOption } from "@/lib/voicehub/elevenlabs";

// GET /api/voicehub/voices — live list when a key is configured,
// otherwise the two verified fallback voices only. Never invents voice IDs.
export async function GET() {
  if (!isElevenLabsConfigured()) {
    return NextResponse.json({
      source: "fallback",
      note: "API key is not set — showing the 2 verified default voices only.",
      voices: FALLBACK_VOICES,
    });
  }
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": elevenLabsApiKey() },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({
        source: "fallback",
        note: "Live voice list could not be loaded — showing the 2 verified default voices.",
        voices: FALLBACK_VOICES,
      });
    }
    const data = (await res.json()) as { voices?: Array<{ voice_id?: string; name?: string }> };
    const voices: VoiceOption[] = (data.voices ?? [])
      .filter((v) => typeof v.voice_id === "string" && typeof v.name === "string")
      .map((v) => ({ voice_id: v.voice_id as string, name: v.name as string }));
    if (voices.length === 0) {
      return NextResponse.json({ source: "fallback", voices: FALLBACK_VOICES });
    }
    return NextResponse.json({ source: "live", voices });
  } catch {
    return NextResponse.json({
      source: "fallback",
      note: "Live voice list could not be loaded — showing the 2 verified default voices.",
      voices: FALLBACK_VOICES,
    });
  }
}
