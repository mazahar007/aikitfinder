# Account System Final Report

15 Nov 2026. Branch `feature/phase-1-platform-foundation`. Covers the remaining Phase 1 account
work. No secrets appear in this document.

## Summary

Sign-up (with confirm password), log-in, log-out, sessions, email-confirmation callback and the
full password-reset flow are built and pass automated tests against the real Supabase project.

Updated 15 Nov 2026 after the production domain was confirmed as
**`https://aikitfinder.vercel.app`**:

1. **Supabase URL settings are applied and verified** (section 6).
2. **Accounts are switched off on the live site.** The live site runs the current code, but the
   Vercel project does not have the two Supabase environment variables, so the live dialog shows
   "Accounts are not open yet" with a disabled form. Nobody can sign up or log in on the live site
   until they are added and the site is redeployed (section 6a).
3. **Email delivery is still pending.** No SMTP provider is configured; no email has been sent or
   received.

## 1. Audit of what existed

| Area                                 | Finding at the start                                           |
| ------------------------------------ | -------------------------------------------------------------- |
| Log in, log out, sessions            | Working, verified                                              |
| Shared identity, protected workspace | Working, verified                                              |
| Profile and workspace creation       | Working (database trigger), verified                           |
| Account page                         | Working, read-only                                             |
| Session renewal                      | Working (`src/proxy.ts`)                                       |
| Email link callback                  | `/auth/confirm` existed; failure led to a page with no message |
| Sign-up                              | Partial: no confirm-password field; not verified               |
| Password reset                       | Missing                                                        |
| Password visibility control          | Missing                                                        |
| Supabase: SMTP                       | Not configured                                                 |
| Supabase: Site URL                   | `http://localhost:3000`                                        |
| Supabase: redirect allow-list        | Empty                                                          |
| Supabase: password minimum           | 6 (the app required 8)                                         |
| Security issues                      | None found in code. Configuration gaps above                   |

## 2. Changes made

| Change                                                                    | Where                                         |
| ------------------------------------------------------------------------- | --------------------------------------------- |
| Confirm password on sign-up, validated on the server                      | `src/lib/auth/actions.ts`, `auth-dialog.tsx`  |
| Forgot password form inside the shared dialog                             | `auth-dialog.tsx`                             |
| `requestPasswordReset` and `updatePassword` actions                       | `src/lib/auth/actions.ts`                     |
| Callback handles confirmation and recovery; clear pages for invalid links | `src/app/auth/confirm/route.ts`               |
| New-password page                                                         | `src/app/(parent)/account/reset-password/`    |
| Show/hide password control; shared message component                      | `src/components/auth/password-field.tsx`      |
| Account page notices: confirmed, password updated, link invalid           | `src/app/(parent)/account/page.tsx`           |
| Tests extended                                                            | `scripts/qa/auth-check.cjs`, `site-check.cjs` |
| Supabase: password minimum raised to 8                                    | Project setting (applied)                     |
| Supabase: `http://localhost:3000/auth/confirm**` added to redirect URLs   | Project setting (applied)                     |

No database migration was needed. Row level security was not changed.

## 3. Sign-up and log-in

| Behavior                               | Status                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Email, password, confirm password      | Built, tested                                                               |
| Minimum 8 characters                   | Enforced in the browser, on the server and in Supabase                      |
| Mismatched passwords                   | Refused with "The two passwords do not match."                              |
| Invalid email                          | Refused before anything is sent                                             |
| Duplicate email                        | Same "check your email" answer as a new address; nothing created or changed |
| Loading and error states               | Built, tested                                                               |
| Success feedback                       | "Check your email…" when confirmation is required                           |
| One profile, one workspace per product | Enforced by primary key and unique constraint; verified                     |
| Real registration through the form     | **Not tested**: it would send an email, and no delivery is configured       |
| Log in, log out, session persistence   | Tested                                                                      |

## 4. Email verification

Confirmation is required (`mailer_autoconfirm` is off); an unconfirmed account cannot log in
(tested). The callback was tested with a one-time token generated by the admin API, so no email
was involved: it confirms the account, signs the visitor in, and the account has its profile and
both workspaces. A reused link is refused.

**Pending:** receiving a real confirmation email and following its link.

## 5. SMTP

**Not configured. Email delivery is not production-ready.** Supabase's built-in sender is limited
to 2 emails per hour and is meant for testing only.

To configure (Supabase dashboard → Authentication → Emails → SMTP Settings):

| Field                          | Value                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Enable custom SMTP             | On                                                                                                |
| Sender email                   | An address on a domain you own and have verified with the provider, e.g. `no-reply@<your domain>` |
| Sender name                    | `AIKitFinder`                                                                                     |
| Host, port, username, password | From your provider (Resend, Postmark, Amazon SES, Brevo and similar all work). Port 465 or 587    |

The sending domain needs the provider's SPF and DKIM records in DNS, or mail will land in spam.
After saving, raise Authentication → Rate Limits → "emails per hour" from 2 to a realistic value.

### Email templates

Supabase refused the template update: on the free plan templates can be edited only after custom
SMTP is configured. Until then the default templates stay in place; they work with the callback
when the link is opened in the same browser that made the request.

Once SMTP is on, paste these (Authentication → Emails → Templates). They use a token link, which
also works when the email is opened on another device.

**Confirm signup** — subject: `Confirm your AIKitFinder account`

```html
<h2>Confirm your email address</h2>

<p>Thanks for creating an AIKitFinder account. Confirm this email address to finish signing up.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm my email</a>
</p>
<p>
  This link works once and expires in one hour. If you did not create an account, you can ignore
  this email.
</p>
```

**Reset password** — subject: `Reset your AIKitFinder password`

```html
<h2>Reset your password</h2>

<p>We received a request to reset the password for your AIKitFinder account.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery"
    >Choose a new password</a
  >
</p>
<p>
  This link works once and expires in one hour. If you did not ask for this, you can ignore this
  email; your password will not change.
</p>
```

Both rely on the Site URL being the live domain (next section).

## 6. Production URLs

Production domain: **`https://aikitfinder.vercel.app`** (confirmed by the owner).
The callback path, from the code: **`/auth/confirm`** (one route for confirmation and reset).

Supabase settings, applied through the Management API on 15 Nov 2026 and read back afterwards:

| Setting (Authentication → URL Configuration) | Before                                 | Saved value now                                                                         |
| -------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| Site URL                                     | `http://localhost:3000`                | `https://aikitfinder.vercel.app`                                                        |
| Redirect URLs                                | `http://localhost:3000/auth/confirm**` | `https://aikitfinder.vercel.app/auth/confirm**`, `http://localhost:3000/auth/confirm**` |

No other redirect URLs existed, so nothing was removed. Other settings were not touched:
password minimum 8, email confirmation required, sign-ups allowed, SMTP not set.

| Flow               | Address the email leads to                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| Email confirmation | `https://aikitfinder.vercel.app/auth/confirm?…` → `/account`                |
| Password reset     | `https://aikitfinder.vercel.app/auth/confirm?…` → `/account/reset-password` |
| Local development  | `http://localhost:3000/auth/confirm…`                                       |

### Callback review

`src/app/auth/confirm/route.ts` was re-read and not changed.

| Case                                          | Behavior                                                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `?token_hash=…&type=email` or `signup`, valid | Verifies the token, starts the session, goes to `/account?notice=confirmed` (or `next`)                    |
| `?token_hash=…&type=recovery`, valid          | Verifies the token, starts the session, sets the 15-minute reset cookie, goes to `/account/reset-password` |
| `?code=…` (default Supabase templates)        | Exchanges the code; `flow=recovery` marks a reset                                                          |
| Confirmation link invalid, expired or reused  | `/account?notice=link-invalid`                                                                             |
| Reset link invalid, expired or reused         | `/account/reset-password?link=invalid`                                                                     |
| Every response                                | `Referrer-Policy: no-referrer`; `next` limited to same-site paths                                          |

## 6a. Live site: read-only checks (15 Nov 2026)

No account was created, no email was triggered, and no form that reaches Supabase was submitted.

**Verified on `https://aikitfinder.vercel.app`**

| Check                                                                                            | Result                                                                                                          |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `/`, `/directory`, `/tools`, `/autoflow`, `/autoflow/app`, `/account`, `/account/reset-password` | HTTP 200                                                                                                        |
| Homepage on desktop (1440) and phone (390)                                                       | Loads, one heading, hero canvas present, no horizontal overflow                                                 |
| HTTPS                                                                                            | HSTS header present                                                                                             |
| The live site runs the current branch code                                                       | Yes: the confirm-password field and the reset page are present                                                  |
| `/auth/session`                                                                                  | `{"user":null}`                                                                                                 |
| `/auth/confirm` with no token                                                                    | 307 to `/account?notice=link-invalid`, `Referrer-Policy: no-referrer`                                           |
| `/auth/confirm` with an invalid recovery token                                                   | 307 to `/account/reset-password?link=invalid`                                                                   |
| `/auth/confirm` with an invalid confirmation token                                               | 307 to `/account?notice=link-invalid`                                                                           |
| Sign-up dialog                                                                                   | Opens with email, password and confirm password, **all disabled**, with the notice "Accounts are not open yet…" |
| `/account`                                                                                       | Shows "Accounts are not open yet…"                                                                              |
| `/autoflow/app`                                                                                  | Shows the read-only layout preview, not the sign-in prompt                                                      |

**Finding: the Supabase environment variables are not set in Vercel.** The three results above
are exactly what the code does when `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are missing at build time. The callback redirects are also
the "not configured" path, so they do not yet prove the callback works on the live site.

To switch accounts on (Vercel → Project → Settings → Environment Variables), for Production and
Preview:

| Name                                   | Value                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://lethjnizehfshztmsiah.supabase.co`                                     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The key starting `sb_publishable_` from Supabase → Project Settings → API Keys |

Then **redeploy**: these values are built into the site, so adding them does not change the
running deployment. Do not add a secret or service-role key.

**Cannot be verified on the live site yet**

| Item                                                  | Blocked by                      |
| ----------------------------------------------------- | ------------------------------- |
| Sign-up, log-in, log-out, sessions on the live domain | Environment variables in Vercel |
| Workspace sign-in gate on the live domain             | Environment variables in Vercel |
| Session cookies on the real domain                    | Environment variables in Vercel |
| Confirmation email and its link                       | SMTP                            |
| Reset email and its link                              | SMTP                            |

## 7. Password reset

1. "Forgot password?" in the log-in form opens an email-only form in the same dialog.
2. The request always answers "If an account exists for that address, we sent a link…".
3. The emailed link lands on `/auth/confirm`, which verifies the one-time token, starts a session
   and opens a **15-minute reset window**: an HttpOnly, Secure cookie bound to that user.
4. `/account/reset-password` shows the new-password form only inside that window. An ordinary
   signed-in session cannot use it.
5. New password and confirmation are validated on the server (8–72 characters, must match).
6. On success the window is closed, other sessions are signed out, and the visitor lands on
   `/account` with a confirmation, signed in.
7. Invalid, expired or reused links show "This reset link is not valid" with a button to request
   a new one.

The token is used once, is never logged or displayed, is removed from the address by a redirect,
and the callback sends `Referrer-Policy: no-referrer`.

## 8. Shared account

One Supabase Auth identity and one session cookie serve the parent site, the Directory and
AutoFlow. Tested: after one log-in the parent header, the Directory header, `/account` and the
AutoFlow workspace all show the same account; a newly confirmed account opens the AutoFlow
workspace; log-out closes the workspace again.

## 9. Database and security

| Check                                                                | Result                                       |
| -------------------------------------------------------------------- | -------------------------------------------- |
| Row level security                                                   | On for all 20 tables; 23 policies; unchanged |
| Visitor cannot read profiles, workspaces, projects, stages           | Passed                                       |
| User B cannot read or change A's profile, workspace, project, stages | Passed                                       |
| Tampered token                                                       | Rejected (401)                               |
| Old sessions after a password change                                 | Ended                                        |
| Service-role or secret key in app source                             | None                                         |
| `.env.local` in Git                                                  | No                                           |
| Supabase security advisor                                            | 0 findings                                   |
| Test data left in the project                                        | None (0 users)                               |

## 10. Test results

**Automated, local production build against the real Supabase project**

| Suite                               | Result                     |
| ----------------------------------- | -------------------------- |
| `pnpm lint`                         | Pass, 0 errors, 0 warnings |
| `pnpm typecheck`                    | Pass                       |
| `pnpm format:check`                 | Pass                       |
| `pnpm build`                        | Pass                       |
| `scripts/qa/auth-check.cjs`         | **83 passed, 0 failed**    |
| `scripts/qa/site-check.cjs`         | **364 passed, 0 failed**   |
| `scripts/qa/validate-migrations.sh` | Pass                       |

Auth checks by group: database 26, sign-in 21, password reset 14, sign-up 11, email confirmation
6, isolation 3, setup 1, cleanup 1. There are no unit tests in the repository.

Test accounts are throwaway addresses created through the admin API and deleted at the end of
each run. Confirmation and reset links come from the admin API, so no email is sent.

**Against your test table**

| Test                          | Result                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Open Sign Up                  | Passed (local)                                                                 |
| Register with valid data      | **Pending** — needs email delivery                                             |
| Invalid email                 | Passed (local)                                                                 |
| Weak password                 | Passed (local)                                                                 |
| Confirm password mismatch     | Passed (local)                                                                 |
| Duplicate email               | Passed (local): safe response, nothing created                                 |
| Email confirmation            | Callback passed with an admin-generated link; **real email pending**           |
| Sign In                       | Passed (local)                                                                 |
| Session persistence           | Passed (local)                                                                 |
| Sign Out                      | Passed (local)                                                                 |
| Forgot Password               | Form and safe response passed; **real email pending**                          |
| Password reset callback       | Passed with an admin-generated link                                            |
| Expired or invalid reset link | Passed (invalid and reused links; a naturally expired link was not waited for) |
| Update password               | Passed (local)                                                                 |
| AutoFlow access               | Passed (local)                                                                 |
| Workspace ownership           | Passed                                                                         |
| Cross-user access             | Passed                                                                         |

**Production (live site):** read-only checks done (section 6a). Routes, callback redirects and the
account UI were verified; accounts are switched off there, so no sign-in behavior could be tested.
No production account was created and no email was triggered.

## 11. Pending manual configuration

1. **Vercel:** add the two public environment variables and redeploy (section 6a). Without this
   the live site has no accounts.
2. **SMTP:** configure a provider (section 5).
3. Paste the two email templates (section 5); possible only after SMTP is on.
4. Raise the email rate limit after SMTP is on.

Done: Supabase Site URL and redirect URLs; password minimum 8.

## 12. External dependencies

An SMTP provider and a sending domain with DNS access; Vercel project settings.

## 13. Known limitations

- No email has been sent or received; steps that need an inbox are pending.
- The default-template link style (`?code=`) is handled in code but was not exercised, because it
  only occurs in a real email.
- Changing password or email from the account page, and editing the profile, are not built.
- No CAPTCHA; Supabase's own rate limits apply.
- Tested in headless Chromium only.
- Accounts are off on the live site until the Vercel variables are set; everything account-related
  was verified on a local production build only.
- Vercel build logs and settings are not accessible from here; the deployed commit was inferred
  from the live pages, not read from Vercel.
