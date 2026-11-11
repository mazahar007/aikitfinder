# Security Review — Phase 0

Covers the code at commit `fad9055`. No secrets are reproduced in this document. No key values
were available to, or seen by, the audit.

## 1. Summary

The site has a small attack surface today because it has no accounts, no database and no user
data. Two issues need attention before anything else, and almost every security control the
handoff requires is still to be built.

| Severity | Count | Items                                                                                                                    |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------ |
| Critical | 1     | S1 vulnerable Next.js version                                                                                            |
| High     | 1     | S2 open, unmetered text-to-speech endpoint                                                                               |
| Medium   | 4     | S3 no rate limiting · S4 no security headers · S5 no origin check on the POST endpoint · S6 no automated security checks |
| Low      | 5     | S7–S11                                                                                                                   |

## 2. Findings

### S1 — Critical — `next@16.4.0` has known vulnerabilities

`pnpm audit --prod` reports three advisories for `next` 16.0.0–16.4.0, all patched in 16.4.1:

| Advisory            | Severity | Title                                                                                       |
| ------------------- | -------- | ------------------------------------------------------------------------------------------- |
| GHSA-2464-fhr4-w9xw | Critical | Unauthenticated remote code execution in the Image Optimization API when SVG files are used |
| GHSA-673q-mjm6-r5xr | Critical | Unauthenticated remote code execution in `use cache` functions returning typed arrays       |
| GHSA-p3m5-59mp-jv5r | High     | Denial of service in App Router using Server Actions                                        |

`next build` itself stops on the first run to show this warning.

Exposure in this codebase, as far as static inspection shows:

- `"use cache"` is used twice in `src/lib/content/repository.ts`. Whether those functions meet the
  advisory's conditions was **not verified**.
- No `next/image` usage and no Server Actions were found. The Image Optimization endpoint is still
  present by default in any Next.js deployment.

Whether a deployed copy is exploitable was not tested. Treat it as exploitable until upgraded.

**Recommendation:** upgrade `next` and `eslint-config-next` to 16.4.1 or later as the first
change after approval, then rebuild and redeploy. This is a dependency change and was not made in
this phase.

### S2 — High — public text-to-speech endpoint spends the owner's credits

`POST /api/voicehub/tts` forwards any request to ElevenLabs using the server's key.

- No authentication: anyone who can reach the site can call it.
- The only limit is `credits.ts`, a 10,000-character counter on `globalThis`. It resets on every
  restart and is separate per server instance, so on serverless hosting it is not an effective cap.
- Up to 5,000 characters per request, with no per-client limit.

Effect once `ELEVENLABS_API_KEY` is set in a deployed environment: a script can exhaust the
account's quota or run up charges. Whether the key is set in production is unknown.

**Recommendation:** until authentication exists, keep the key unset in public deployments, or
put the endpoint behind an owner-only check. Longer term: authenticated calls, durable per-user
quotas and rate limits.

### S3 — Medium — no rate limiting anywhere

Applies to all three API routes today and to every future endpoint. Spec 07 §7 requires rate
limits and request validation.

### S4 — Medium — no security response headers

The production server sends none of: `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Frame-Options` / `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`. `X-Powered-By: Next.js` is sent. The hosting platform may add some of these;
that was not verified. A content security policy must allow the inline theme script in
`layout.tsx`.

### S5 — Medium — no origin or CSRF check on the POST endpoint

`/api/voicehub/tts` accepts JSON from any origin without checking `Origin`. With no session there
is nothing to forge today, but the pattern must not carry into authenticated endpoints.

### S6 — Medium — no automated security checks

No CI, dependency audit, secret scanning or tests. The vulnerable dependency above was found only
because the build prints a warning.

### S7 — Low — `/api/voicehub/health` discloses configuration

Publicly returns whether the ElevenLabs key is configured, the model list and demo-credit usage.
No secret is exposed, but it tells an attacker whether S2 is worth exploiting.

### S8 — Low — page copy discloses deployment details

The VoiceHub demo notice names the environment variable and the hosting project
("ELEVENLABS_API_KEY in the aikitfinder Vercel project (Production)").

### S9 — Low — `voice_id` is not format-checked

It is length-limited and URL-encoded before being placed in the ElevenLabs URL path, so path
injection is not possible, but any string is accepted. An allow-list from the fetched voice list
would be stricter.

### S10 — Low — user text kept in browser storage

VoiceHub saves the last 20 texts in `localStorage` in plain form. On a shared computer the next
person can read them. The page does state that history is stored in the browser.

### S11 — Low — `ELEVENLABS_API_KEY` is undocumented

It is not in `.env.example` or the README, so its server-only nature is not written down for the
next developer.

## 3. Things checked and found acceptable

| Check                                   | Result                                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets committed to the repository     | None found; `.env*` is git-ignored except the example                                                                                  |
| Secrets exposed to the browser          | None; only `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SITE_INDEXABLE` are public                                                          |
| ElevenLabs key handling                 | Read server-side only; not logged; not returned                                                                                        |
| Upstream error bodies                   | Not forwarded to the client; generic messages only                                                                                     |
| `dangerouslySetInnerHTML`               | One use: a constant theme script with no user input                                                                                    |
| Search and filter parameters            | Rendered through React (escaped); no raw HTML                                                                                          |
| Compare tray data from `sessionStorage` | Shape-validated before use                                                                                                             |
| Outbound links                          | All sample links point to `example.com`                                                                                                |
| Preview hosts                           | `robots.txt` disallows all and metadata sets `noindex` unless explicitly enabled                                                       |
| SQL drafts                              | Row level security on every table; public read limited to published rows; `admin_notes` hidden by column privileges; no write policies |

The SQL policies are **untested** because the migrations have never been applied.

## 4. Authentication and authorisation

None exists. Nothing in the application is protected because nothing private exists yet. This is
acceptable for a sample-data prototype and becomes the central security task of Phase 1.

## 5. Security controls the handoff requires that are not built

| Control                                                         | Source              |
| --------------------------------------------------------------- | ------------------- |
| Shared authentication with secure sessions and password hashing | Spec 09 §10.4       |
| Backend-enforced authorisation; frontend hiding is not security | Spec 13 §8          |
| Admin role checked in the backend; no public admin registration | Spec 09 §C          |
| Product entitlements separate from identity                     | Spec 09 §F          |
| Return-URL validation against open redirects                    | Spec 09 §10.4       |
| CSRF and OAuth `state` protection                               | Spec 07 §7          |
| OAuth tokens encrypted at rest; never sent to the browser       | Spec 07 §5.10       |
| Provider keys in secret storage; masked in admin views          | Spec 09 §C          |
| Owner-scoped data (`owner_account_id`) and row level security   | Spec 07 §7          |
| Upload validation by type, size and signature                   | Spec 07 §7          |
| Private storage for personal voice recordings                   | Spec 07 §5.4        |
| Rate limits and request validation                              | Spec 07 §7          |
| Audit log of admin and security events, without secrets         | Spec 09 §C          |
| Sanitised job and render logs                                   | Spec 13 §7.6        |
| Publishing blocked until approval is recorded, server-side      | Spec 07 §5.9        |
| Idempotent publish jobs (no duplicate posts)                    | Spec 07 §5.10       |
| Admin approval enforced server-side for Directory records       | Spec 11 §5          |
| Abuse controls on submissions, reviews and live prompt demos    | Spec 10 §8, spec 11 |
| Disconnect and revoke for connected platforms                   | Spec 07 §7          |
| `noindex` on workspace and admin routes                         | Spec 13 §13         |

## 6. Design cautions for later phases

- **Service-role key.** The repository's plan writes to Supabase with the service-role key from
  server code. That key bypasses row level security, so every write path must carry its own
  authorisation check. Keep it out of the Next.js runtime if the Python API owns writes.
- **Two runtimes, one identity.** The frontend and the Python API must verify the same session
  token; do not introduce a second user store.
- **Prompt injection.** AutoFlow will pass research results and user instructions to LLMs, and the
  Directory will pass scraped content to an enrichment model. Treat all such text as untrusted and
  never let model output trigger publishing or approval.
- **Third-party content.** Discovery and social prompt collection carry legal as well as security
  risk; each source's terms need review before a collector is written.
- **Cost exposure.** Any endpoint that calls a paid provider (LLM, voice, image, render) needs
  authentication, quotas and rate limits before it is reachable — S2 is the first example.

## 7. Recommended order

1. Upgrade Next.js to a patched version (S1).
2. Contain the VoiceHub endpoint (S2).
3. Add security headers and a dependency audit step (S4, S6).
4. Design authentication and authorisation as the first Phase 1 task, with tests.
5. Apply and test the row level security policies against a real database before any real data
   is loaded.
