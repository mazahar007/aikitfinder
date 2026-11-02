import { NextResponse } from "next/server";
import { isElevenLabsConfigured, MODEL_IDS, FALLBACK_VOICES } from "@/lib/voicehub/elevenlabs";
import { demoCredits } from "@/lib/voicehub/credits";

// Health check — presence only, never validates the key against
// ElevenLabs here (no extra API call, no key in the response).
export async function GET() {
  const configured = isElevenLabsConfigured();
  return NextResponse.json({
    status: "ok",
    service: "voicehub",
    version: "1.0.0",
    elevenlabs_configured: configured,
    demo_mode: !configured,
    supabase: false,
    supabase_note: "VoiceHub V1 runs on the in-memory DEMO credit ledger; database wiring is a later step.",
    models: MODEL_IDS,
    fallback_voices: FALLBACK_VOICES.length,
    demo_credits: demoCredits(),
    timestamp: new Date().toISOString(),
  });
}
