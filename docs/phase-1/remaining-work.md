# Phase 1 Remaining Work

State on 15 Nov 2026 (final). Nothing below is started unless it says so.

## Fully implemented

- Parent homepage at `/` with the approved hero animation, Pause/Resume and reduced motion.
- Route structure: parent, Directory and AutoFlow, each with its own layout; all earlier URLs kept.
- Per-product themes with separate saved preferences.
- Directory browsing on sample data.
- `/autoflow` landing page.
- Supabase connection; migrations 0001–0007 applied.
- Log in, log out, session persistence, shared identity across the three products.
- Protected AutoFlow workspace; `/account` page.
- Row level security with verified cross-user isolation.
- Responsive layout verified at eleven widths from 320 to 1920 px.
- Automated checks: `site-check.cjs`, `auth-check.cjs`, `validate-migrations.sh`.

## Foundation implemented

- AutoFlow project list and detail: show the user's real projects, but projects cannot be created
  in the app yet.
- Six-stage structure: defined, nothing runs.
- Profile: created automatically, read-only.
- Catalog database tables: exist, empty, not yet read by the Directory.

## Partially implemented

| Item                                             | Done                                       | Missing                                                                                |
| ------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Sign-up                                          | Form, account creation, confirm link route | Email delivery (SMTP), site URL and redirect URLs in Supabase; not verified end to end |
| Parent light theme                               | Works                                      | Visual design approval                                                                 |
| About, Contact, Privacy, Terms, Editorial policy | Pages exist                                | Real content; legal text needs owner and legal review                                  |
| Directory identity                               | Existing theme                             | Not restyled to the Phase 0A identity board                                            |

## Deferred

| Item                                                       | Depends on                                 |
| ---------------------------------------------------------- | ------------------------------------------ |
| Password reset, email change, profile editing              | Next phase                                 |
| Creating, renaming and archiving projects                  | Next phase                                 |
| Directory on real data, admin tools                        | Content and an admin path                  |
| Python FastAPI backend, queue, worker, storage             | Hosting decision                           |
| All six AutoFlow stages; AI providers                      | Backend; provider keys held server-side    |
| Voiceover Studio (VoiceHub migration)                      | `docs/planning/VOICEHUB_MIGRATION_PLAN.md` |
| YouTube connection and publishing                          | Backend; encrypted token storage design    |
| Rate limits beyond Supabase's own, usage tracking, CAPTCHA | Backend; owner decision on CAPTCHA         |
| CI, unit tests                                             | Owner approval to add test dependencies    |
| README and older checklist documents                       | Still describe the pre-Phase 1 structure   |

## External dependencies (owner actions)

Exact steps for items 1 and 2 are in `account-system-final-report.md`.

1. **Email delivery.** Add an SMTP provider in Supabase (Authentication → Emails). Until then
   public sign-up cannot be relied on: the built-in sender is limited to a few messages per hour.
2. **Site URL and redirect URLs** in Supabase (Authentication → URL Configuration). Site URL is
   still `http://localhost:3000`; set the real domain and add `<domain>/auth/confirm`.
3. **Password policy.** Done: the project minimum is now 8, matching the app.
4. **Hosting environment variables.** `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must be set where the site is deployed. No secret key.
5. **Access token.** The Supabase access token saved for this work can be revoked once no further
   database changes are needed from here.
6. **Backend hosting decision** and **verified company details** for the legal pages.
