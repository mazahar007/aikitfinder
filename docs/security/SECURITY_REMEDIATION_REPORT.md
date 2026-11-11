# Security Remediation Report

A limited task, authorised separately from Phase 0A, covering the two issues the Phase 0 security
review ranked highest. Date: 11 Nov 2026.

## 1. Summary

| Finding                                | Before                               | After                                              | Commit    |
| -------------------------------------- | ------------------------------------ | -------------------------------------------------- | --------- |
| S1 — vulnerable Next.js                | `next@16.4.0`: 2 critical, 1 high    | `next@16.4.6`: no known production vulnerabilities | `c2edb24` |
| S2 — open paid text-to-speech endpoint | Anyone could trigger paid generation | Generation refused unless a server flag is set     | `f43a278` |

Both commits are on `claude/main`. **Nothing was deployed to production by this work.** Nothing
was merged into the default branch.

## 2. S1 — Next.js upgrade

### Advisories affecting 16.4.0

| Advisory            | Severity | Title                                                                                       | Patched in |
| ------------------- | -------- | ------------------------------------------------------------------------------------------- | ---------- |
| GHSA-2464-fhr4-w9xw | Critical | Unauthenticated remote code execution in the Image Optimization API when SVG files are used | 16.4.1     |
| GHSA-673q-mjm6-r5xr | Critical | Unauthenticated remote code execution in `use cache` functions returning typed arrays       | 16.4.1     |
| GHSA-p3m5-59mp-jv5r | High     | Denial of service in App Router using Server Actions                                        | 16.4.1     |

### Version chosen

The advisories are fixed from 16.4.1. The registry's current `latest` release is **16.4.6**, in the
same minor line, so the upgrade goes to 16.4.6 rather than stopping at the first patched version.

| Package              | From   | To     |
| -------------------- | ------ | ------ |
| `next`               | 16.4.0 | 16.4.6 |
| `eslint-config-next` | 16.4.0 | 16.4.6 |

Files changed: `package.json`, `pnpm-lock.yaml`. No application code needed changing. React stays
at 19.3.0.

### Verification

| Check               | Result                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm audit --prod` | No known vulnerabilities                                                                                              |
| `pnpm audit` (all)  | 1 moderate, development-only: `minimatch` via ESLint tooling (GHSA-g3hv-75wg-m249). Not shipped to users; not changed |
| `pnpm typecheck`    | Pass                                                                                                                  |
| `pnpm build`        | Pass on the first run; no security warning; 89 static pages, same route table                                         |
| Route check         | `/`, `/tools`, `/tools/storyreel`, `/compare`, `/prompts`, `/voicehub`, `/search?q=video` all return 200              |
| `pnpm lint`         | 1 error — unchanged, pre-existing (`src/app/voicehub/page.tsx`, `react-hooks/set-state-in-effect`)                    |
| `pnpm format:check` | 5 files — unchanged, pre-existing, all VoiceHub                                                                       |

The lint and format failures existed before this work and are unrelated to it. They were left
alone to keep the change limited; fixing them is a small separate task.

Not verified: whether any deployed copy was ever exploited, and behaviour on the hosting platform.

## 3. S2 — VoiceHub text-to-speech endpoint

### Problem

`POST /api/voicehub/tts` forwarded any request to ElevenLabs with the server's API key. There was
no sign-in and no rate limit, and the only cap was an in-memory counter that resets on restart and
is separate per server instance.

### Change

Public generation is now **off by default**.

| File                                   | Change                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/lib/voicehub/elevenlabs.ts`       | New `isPublicGenerationEnabled()`: true only when `VOICEHUB_PUBLIC_GENERATION` is exactly `enabled` |
| `src/app/api/voicehub/tts/route.ts`    | Returns 503 before reading the request or touching the API key when the flag is off                 |
| `src/app/api/voicehub/health/route.ts` | Reports `generation_enabled`                                                                        |
| `src/app/voicehub/page.tsx`            | Shows a "Temporarily turned off" notice and disables the Generate button                            |
| `.env.example`                         | Documents `ELEVENLABS_API_KEY` and the new flag, with a warning                                     |

The existing interface and all voice-generation code are preserved. Nothing was deleted.

### Tested behaviour

| Configuration                                   | `POST /api/voicehub/tts`                                 |
| ----------------------------------------------- | -------------------------------------------------------- |
| Flag unset (default)                            | 503, "Voice generation is temporarily turned off…"       |
| `VOICEHUB_PUBLIC_GENERATION=true` (wrong value) | 503, same message                                        |
| `VOICEHUB_PUBLIC_GENERATION=enabled`, no key    | Falls through to the previous "API key not set" response |

`/api/voicehub/health` reported `generation_enabled: false` and `true` respectively.

**Not tested:** generation with a real ElevenLabs key. No key was available, and none was
requested.

### What this does and does not do

- It closes the exposure on any deployment where the flag is not set.
- It is containment, not the final design. Setting the flag to `enabled` re-opens the endpoint to
  everyone who can reach the site; use it only on a private environment for testing.
- Proper protection — sign-in, rate limiting, per-user limits, abuse controls — arrives with
  authentication in Phase 1 and the Voiceover Studio migration.

### Deployment impact

| Item                   | Impact                                                                            |
| ---------------------- | --------------------------------------------------------------------------------- |
| When it takes effect   | Only when this branch is deployed                                                 |
| Visible change         | The VoiceHub page shows a notice and the Generate button is disabled              |
| Other pages            | None                                                                              |
| Environment variables  | None required. Do **not** set `VOICEHUB_PUBLIC_GENERATION` on a public deployment |
| `voicehubo.vercel.app` | Untouched. It is a separate deployment whose code is not in this repository       |
| Rollback               | Revert commit `f43a278`                                                           |

If a preview deployment is created automatically for this branch, it will already have generation
turned off.

## 4. Still open from the Phase 0 security review

| Finding                                             | Status                                               |
| --------------------------------------------------- | ---------------------------------------------------- |
| S3 no rate limiting                                 | Open — Phase 1                                       |
| S4 no security response headers                     | Open                                                 |
| S5 no origin check on the POST endpoint             | Open; lower risk now the endpoint refuses by default |
| S6 no automated security checks or CI               | Open                                                 |
| S7 health endpoint discloses configuration          | Open                                                 |
| S8 page copy names the hosting project and variable | Open                                                 |
| S9 `voice_id` not format-checked                    | Open                                                 |
| S10 user text kept in browser storage               | Open                                                 |
| S11 `ELEVENLABS_API_KEY` undocumented               | **Closed** — documented in `.env.example`            |
| Bengali text in one API error                       | Open (English-only policy, not security)             |

## 5. Recommendation

Deploy these two commits when convenient; they are low-risk and independent of the redesign.
Before deploying, confirm that `VOICEHUB_PUBLIC_GENERATION` is not set in the hosting dashboard.
