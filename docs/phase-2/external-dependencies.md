# Phase 2 Step 1 — External Dependencies

15 Nov 2026. What the platform needs from outside. "Connected" means verified working today.

## 1. Status

| Dependency                 | Needed for                         | Status today                                                                                | Owner action                                                                                   |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Vercel                     | Frontend hosting                   | Connected; live at `aikitfinder.vercel.app`                                                 | —                                                                                              |
| Supabase (Postgres, Auth)  | Database, accounts                 | Connected; Sydney; free plan                                                                | Review plan limits and backups before launch                                                   |
| GitHub                     | Source, deploys                    | Connected                                                                                   | —                                                                                              |
| SMTP email provider        | Confirmation, reset, notifications | **Not configured**                                                                          | Choose a provider; verify a sending domain                                                     |
| Custom domain              | Brand, email sending domain        | Not connected (`aikitfinder.com` unconfirmed)                                               | Register and connect, or decide to stay on the Vercel address                                  |
| Python backend hosting     | API, workers, renderer             | **Not decided**                                                                             | See `hosting-evaluation.md`                                                                    |
| Redis                      | Queue, rate limits                 | None                                                                                        | Comes with the hosting decision                                                                |
| Object storage             | Media files                        | None (Supabase Storage available but unused)                                                | Choose Supabase Storage or Cloudflare R2                                                       |
| Text AI provider           | Research, script, metadata         | None                                                                                        | Choose provider; create an account and key                                                     |
| Web search or research API | Cited research                     | None                                                                                        | Choose provider                                                                                |
| ElevenLabs                 | Voice                              | Legacy code exists; whether a key is set in Vercel is unknown; generation is off by default | Confirm account and plan                                                                       |
| YouTube Data API           | Upload as Private                  | None                                                                                        | Google Cloud project, OAuth consent screen, verification for the upload scope (can take weeks) |
| Payment provider           | Subscriptions, credits             | None                                                                                        | Choose one that supports the business's country                                                |
| Error tracking             | Production diagnostics             | None                                                                                        | Choose (for example Sentry)                                                                    |
| Uplika                     | Optional publishing provider       | Not integrated                                                                              | Optional                                                                                       |

## 2. API requirements by feature

| Feature          | External API                            | Credentials                                                          | Stored                           |
| ---------------- | --------------------------------------- | -------------------------------------------------------------------- | -------------------------------- |
| Research         | Text model + search                     | Platform API keys                                                    | Encrypted in the database        |
| Script, metadata | Text model                              | Platform API key                                                     | Encrypted in the database        |
| Voice            | ElevenLabs (TTS, voices, models)        | Platform API key                                                     | Encrypted in the database        |
| Rendering        | None (Remotion and FFmpeg run in-house) | A Remotion company license may be required depending on team size    | —                                |
| Upload           | YouTube Data API v3                     | The owner's own Google sign-in (OAuth); no shared social credentials | Encrypted refresh token per user |
| Email            | SMTP                                    | Provider credentials                                                 | In Supabase                      |
| Billing          | Payment provider API and webhooks       | Secret key, webhook secret                                           | Service environment              |

Rules already decided: provider keys are central and server-side, never in the browser, a
response or a log; users connect social accounts only through their own sign-in.

## 3. Costs to expect

AI usage is the main variable cost and depends on the providers chosen; it cannot be estimated
honestly before they are. It should be measured on a handful of real projects before any price
is shown to customers. AutoFlow pricing has not been announced.

## 4. Decisions needed before building

1. The open questions in `access-and-seo-strategy.md` (route changes, AutoFlow landing, homepage
   buttons, first real content).
2. Backend hosting provider and region.
3. Storage provider.
4. Text and research AI providers.
5. SMTP provider and sending domain.
6. A staging Supabase project for tests, or continue testing against production.
7. Payment provider (can wait).
