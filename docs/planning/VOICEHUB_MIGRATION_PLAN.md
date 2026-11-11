# VoiceHub → AutoFlow Voiceover Studio: Audit and Migration Plan

**Owner decision:** VoiceHub becomes the foundation of AutoFlow AI's Voiceover Studio. It is not a
separate product in the launcher. Its code is not deleted, and the `voicehubo.vercel.app`
deployment stays as a legacy service until the migration is tested and approved.

A plan only. No migration work has started. Date: 11 Nov 2026, commit `f43a278`.

## 1. What exists

Two different things carry the VoiceHub name.

| Thing                               | Where                                               | What is known                                                                                                                              |
| ----------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| VoiceHub section in this repository | `/voicehub`, `/api/voicehub/*`, `src/lib/voicehub/` | Fully audited below                                                                                                                        |
| "Full voice SaaS"                   | `voicehubo.vercel.app`                              | Linked from the page. Its code is **not** in this repository and was not inspected. Its features, data, users and key handling are unknown |

The plan below covers the code in this repository. The external deployment needs its own
inventory before anything about it is decided.

## 2. Audit of the ElevenLabs integration

| Aspect             | Current behaviour                                                                                           | Assessment                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| API key            | `ELEVENLABS_API_KEY` read server-side only; never returned or logged                                        | Good — keep the pattern                                     |
| Generation call    | `POST /v1/text-to-speech/{voice_id}?output_format=mp3_44100_128`; body `text`, `model_id`, `voice_settings` | Works for standard TTS only                                 |
| Response           | Audio stream passed straight to the browser                                                                 | Nothing is stored                                           |
| Models             | Three hard-coded IDs: `eleven_flash_v2_5`, `eleven_multilingual_v2`, `eleven_v3`                            | Must become runtime discovery                               |
| Voices             | `GET /v1/voices`; keeps `voice_id` and `name` only; two hard-coded fallback voices                          | Needs `/v2/voices` with language and verified-language data |
| Voice list caching | The route is prerendered, so the list is fixed at build time                                                | Defect                                                      |
| Languages          | No language control. Bengali and English sample texts only                                                  | Must become a language-first flow                           |
| Text limit         | 1–5,000 characters for every model                                                                          | Must use each model's own limit                             |
| Long scripts       | Not supported                                                                                               | Needs chunking and stitching                                |
| Settings           | Stability and similarity, clamped to 0–1                                                                    | Keep; hide what a model does not support                    |
| Input validation   | Type, length, model allow-list, numeric ranges                                                              | Good — keep                                                 |
| Upstream errors    | Replaced with generic messages; raw bodies never forwarded                                                  | Good — keep                                                 |
| No-key behaviour   | Clear refusal, no fake audio                                                                                | Good — keep                                                 |
| Error language     | One message in Bengali                                                                                      | Must be English                                             |
| Public access      | Off by default since `f43a278`                                                                              | Contained; needs real authentication                        |

## 3. Audit of the credit logic

| Aspect                            | Current behaviour                                                   | Assessment                                           |
| --------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| Storage                           | An object on `globalThis` in server memory                          | Lost on restart; separate per server instance        |
| Allowance                         | 10,000 characters in total, shared by all visitors                  | Not per user; not a real limit on serverless hosting |
| Charging                          | Characters counted only after ElevenLabs returns success            | Correct rule — keep                                  |
| Record kept                       | Length, voice, model, time. Never the text, never the key           | Good privacy rule — keep                             |
| History limit                     | Last 100 generations in memory                                      | Not durable                                          |
| Enforcement                       | 402 when the counter is exhausted                                   | Trivially bypassed by a restart or another instance  |
| Relation to real ElevenLabs usage | None. The counter is not reconciled with the account's actual quota | Must read real usage from the provider               |
| Labelling                         | The interface calls it a DEMO ledger                                | Honest — keep the honesty                            |

Conclusion: the ledger is a demonstration, not usage control. Two of its rules are worth carrying
forward: charge only on success, and store metadata rather than content.

## 4. What to keep, rebuild and retire

| Keep (move as is or nearly)                                                        | Rebuild                                       | Retire after migration                     |
| ---------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Server-side key handling                                                           | Model, language and voice discovery           | `/voicehub` as a public Directory nav item |
| Input validation rules                                                             | Generation as a queued job, not a web request | In-memory credit ledger                    |
| Generic error mapping                                                              | Usage tracking in the database, per owner     | Hard-coded model and fallback voice lists  |
| "No fake audio" behaviour                                                          | Audio saved to storage with full metadata     | Browser-only history                       |
| Text editor, character counter, voice and model pickers, sliders, player, download | Interface re-skinned with AutoFlow tokens     |                                            |
| Charge-on-success and metadata-only rules                                          | Long-form chunking and stitching              |                                            |

## 5. Target shape

```
AutoFlow workspace  /autoflow/app/voiceover        (signed-in owner only)
        │
        ▼
FastAPI  /voice/*    ── checks session, ownership, limits
        │
        ├── VoiceProvider interface
        │      ├── ElevenLabsProvider   (TTS and Text-to-Dialogue, capability discovery)
        │      ├── EdgeTtsProvider      (only after a terms-of-use review)
        │      └── UploadedAudio        (owner's own recording)
        │
        ├── capability snapshots (models, languages, limits, voices) cached with a timestamp
        ├── voice jobs on the queue ──► worker ──► audio in storage
        └── usage events in the database
```

Data to store per voiceover (spec 22 §7): script, voiceover and subtitle language codes and names;
model ID; voice ID; voice-language verification and accent; endpoint mode; per-request limit;
capability snapshot reference; audio asset reference; status, errors, duration, format, timestamps.

## 6. Migration stages

Each stage ends at an approval gate. Nothing is removed until the stage that says so.

| Stage | Work                                                                                                                                                             | Depends on                           | Legacy VoiceHub during this stage |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------- |
| M0    | Containment (done): generation off by default; unlink from main navigation (proposed)                                                                            | —                                    | Reachable by URL, generation off  |
| M1    | Inventory of `voicehubo.vercel.app`: what it does, what data and users it has, where its code lives                                                              | Owner supplies access or details     | Unchanged                         |
| M2    | Voice provider interface and ElevenLabs adapter in the Python backend; capability discovery with caching; tests against recorded responses                       | Phase 1 backend                      | Unchanged                         |
| M3    | Database tables for voice jobs, assets, capability snapshots and usage; storage bucket                                                                           | Phase 1 database and storage         | Unchanged                         |
| M4    | Voiceover Studio screen in the AutoFlow workspace, reusing the existing controls; output-language-first flow                                                     | AutoFlow shell (Phase 5)             | Unchanged                         |
| M5    | Queue-based generation, chunking and stitching, real usage tracking                                                                                              | Queue and worker                     | Unchanged                         |
| M6    | Side-by-side test with the owner's ElevenLabs account: English plus two other reported languages, a long script, a voice with and without verified-language data | Owner's key in a private environment | Unchanged                         |
| M7    | Owner approval. `/voicehub` redirects signed-in users to the Studio and shows guests an explanation                                                              | M6 passed                            | Redirected                        |
| M8    | Decision on the external deployment: keep, redirect or retire                                                                                                    | M1 and M7                            | Per owner decision                |
| M9    | Remove the legacy route handlers and the in-memory ledger from this repository                                                                                   | Explicit owner approval              | Removed                           |

## 7. Safety rules throughout

- The ElevenLabs key stays server-side, out of the browser and out of logs.
- No stage enables public, unauthenticated paid generation.
- The legacy deployment is not touched without a separate decision.
- No voice cloning in this migration; it remains out of scope.
- Uploaded personal recordings are private to their owner.
- A language, model or voice is shown only if the connected account reports it.

## 8. Open questions

| #   | Question                                                                             |
| --- | ------------------------------------------------------------------------------------ |
| 1   | Where is the code for `voicehubo.vercel.app`, and does it have users or stored data? |
| 2   | Do both deployments use the same ElevenLabs account and key?                         |
| 3   | Is an ElevenLabs key currently set in the `aikitfinder` deployment?                  |
| 4   | Which ElevenLabs plan is in use? It determines model access and limits               |
| 5   | Should Edge-TTS be evaluated now or only after its terms of use are reviewed?        |
| 6   | Should guests keep any access to a voice demo, or is the Studio owner-only?          |
