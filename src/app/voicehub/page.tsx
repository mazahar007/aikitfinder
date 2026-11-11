"use client";

import { useEffect, useRef, useState } from "react";
import { MODELS, MAX_CHARS, FALLBACK_VOICES } from "@/lib/voicehub/elevenlabs";
import type { VoiceOption } from "@/lib/voicehub/elevenlabs";

const BN_SAMPLE =
  "আজকের গল্পটা ছোট, কিন্তু শিক্ষাটা বড়। যে প্রতিদিন একটু একটু করে শেখে, সে একদিন অনেক দূর এগিয়ে যায়।";
const EN_SAMPLE =
  "Every great video starts with a clear voice. Write your script, pick a voice, and let your story be heard.";

type HistoryEntry = {
  text: string;
  voice_id: string;
  voice_name: string;
  model_id: string;
  chars: number;
  createdAt: string;
};

export default function VoiceHubPage() {
  const [text, setText] = useState(BN_SAMPLE);
  const [voices, setVoices] = useState<VoiceOption[]>([...FALLBACK_VOICES]);
  const [voiceSource, setVoiceSource] = useState<"fallback" | "live">("fallback");
  const [voiceId, setVoiceId] = useState<string>(FALLBACK_VOICES[0].voice_id);
  const [modelId, setModelId] = useState<string>(MODELS[0].id);
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [health, setHealth] = useState<{
    elevenlabs_configured: boolean;
    demo_mode: boolean;
    generation_enabled?: boolean;
    demo_credits?: { remaining: number; used: number; total: number };
  } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/voicehub/health")
      .then((r) => r.json())
      .then((d) => setHealth(d))
      .catch(() => setHealth(null));
    fetch("/api/voicehub/voices")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.voices) && d.voices.length > 0) {
          setVoices(d.voices);
          setVoiceSource(d.source === "live" ? "live" : "fallback");
          const first = d.voices[0] as VoiceOption;
          if (first?.voice_id) setVoiceId(first.voice_id);
        }
      })
      .catch(() => undefined);
    try {
      const raw = localStorage.getItem("voicehub-history");
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      // History is a convenience only; ignore corrupt storage.
    }
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveHistory(entry: HistoryEntry) {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 20);
      try {
        localStorage.setItem("voicehub-history", JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }

  async function generate() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/voicehub/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          model_id: modelId,
          stability,
          similarity_boost: similarity,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Voice could not be created.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      const voiceName = voices.find((v) => v.voice_id === voiceId)?.name ?? "Voice";
      saveHistory({
        text,
        voice_id: voiceId,
        voice_name: voiceName,
        model_id: modelId,
        chars: text.trim().length,
        createdAt: new Date().toISOString(),
      });
      const h = await fetch("/api/voicehub/health").then((r) => r.json()).catch(() => null);
      if (h) setHealth(h);
    } catch {
      setError("Could not reach the server — please try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  const chars = text.trim().length;
  const overLimit = chars > MAX_CHARS;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">VoiceHub</h1>
      <p className="mt-2 text-slate-600">
        Write text in Bengali or English, pick a voice, and generate natural-sounding
        speech. This is a separate VoiceHub section inside AIKitFinder — it does not
        change the AI tool finder pages.
      </p>

      {health && health.generation_enabled === false && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Temporarily turned off:</strong> Voice generation is paused while sign-in and
          usage limits are added. You can still write and review text here; no audio is created.
        </div>
      )}
      {health && !health.elevenlabs_configured && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Demo mode:</strong> The ElevenLabs API key is not set for this
          AIKitFinder project yet. Generate will show a clear message — no fake
          audio is created. Real voice generation needs ELEVENLABS_API_KEY in the
          aikitfinder Vercel project (Production) plus a redeploy.
        </div>
      )}
      {health?.demo_credits && (
        <p className="mt-4 text-sm text-slate-600">
          Demo credits (DEMO ledger, resets on redeploy):{" "}
          <strong>{health.demo_credits.remaining.toLocaleString("en-US")}</strong> /{" "}
          {health.demo_credits.total.toLocaleString("en-US")} characters remaining
        </p>
      )}

      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="voicehub-text">Text</label>
          <textarea
            id="voicehub-text"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write Bengali or English text…"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className={overLimit ? "font-bold text-red-600" : "text-slate-600"}>
              {chars.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")} characters
              {chars > 0 && ` · about ${Math.max(1, Math.round(chars / 1000))} minute(s)`}
            </span>
            <span className="flex gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm" onClick={() => setText(BN_SAMPLE)}>
                Bengali sample
              </button>
              <button type="button" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm" onClick={() => setText(EN_SAMPLE)}>
                English sample
              </button>
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="voicehub-voice">
              Voice {voiceSource === "live" ? "(live list)" : "(verified defaults)"}
            </label>
            <select id="voicehub-voice" className="w-full rounded-md border border-slate-300 px-3 py-2" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
              {voices.map((v) => (
                <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-slate-500">
              With an API key, the live voice list loads; without one, only the 2 verified voices are shown.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="voicehub-model">Model</label>
            <select id="voicehub-model" className="w-full rounded-md border border-slate-300 px-3 py-2" value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-slate-500">
              Test Bengali text across models — pronunciation can differ by model.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="voicehub-stability">Stability: {stability.toFixed(2)}</label>
            <input
              id="voicehub-stability"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={stability}
              onChange={(e) => setStability(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-slate-500">Higher is steadier, lower is more expressive.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="voicehub-similarity">Similarity: {similarity.toFixed(2)}</label>
            <input
              id="voicehub-similarity"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={similarity}
              onChange={(e) => setSimilarity(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-slate-500">How closely it matches the original voice.</p>
          </div>
        </div>

        {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <button
          type="button"
          className="rounded-md bg-slate-900 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          disabled={busy || chars === 0 || overLimit || health?.generation_enabled === false}
          onClick={generate}
        >
          {busy ? "Generating voice…" : "Generate voice"}
        </button>

        {audioUrl && (
          <div className="rounded-md border border-green-300 bg-green-50 p-4">
            <p className="font-bold">Voice ready — listen and download</p>
            <audio ref={audioRef} controls src={audioUrl} className="mt-2 w-full" />
            <a href={audioUrl} download="voicehub.mp3" className="mt-3 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Download MP3
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">Voice cloning — coming soon</h2>
        <p className="mt-1 text-slate-600">
          VoiceHub V1 has no cloning. Cloning will be paid-plan only, and only with
          the voice owner&apos;s written consent. It is never offered on the free tier.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">Full SaaS</h2>
        <p className="mt-1 text-slate-600">
          This studio is the VoiceHub section inside AIKitFinder. The standalone
          full voice SaaS lives separately at{" "}
          <a className="underline" href="https://voicehubo.vercel.app">voicehubo.vercel.app</a>.
          This page does not claim to be that full SaaS.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">History (this browser)</h2>
        {history.length === 0 ? (
          <p className="mt-1 text-slate-600">No voice generated yet. Download the MP3 to keep it — history stores only the text details, not the audio.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {history.map((h, i) => (
              <li key={`${h.createdAt}-${i}`} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-bold">
                  {h.voice_name} · {h.model_id} · {h.chars} characters
                </p>
                <p className="truncate text-sm text-slate-600">{h.text}</p>
                <button
                  type="button"
                  className="mt-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  onClick={() => {
                    setText(h.text);
                    setVoiceId(h.voice_id);
                    setModelId(h.model_id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Reuse this text
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
