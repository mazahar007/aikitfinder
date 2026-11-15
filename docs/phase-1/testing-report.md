# Phase 1 Testing Report

Final run on 15 Nov 2026 against the production build (`pnpm build`, `pnpm start`) of the branch
at `cd1069b`, in headless Chromium, connected to the real Supabase project. Nothing was deployed.

## Results

| Check                            | Command                             | Result                                      |
| -------------------------------- | ----------------------------------- | ------------------------------------------- |
| Lint                             | `pnpm lint`                         | Pass, 0 errors, 0 warnings                  |
| Type check                       | `pnpm typecheck`                    | Pass                                        |
| Formatting                       | `pnpm format:check`                 | Pass                                        |
| Production build                 | `pnpm build`                        | Pass, 98 pages                              |
| Build with accounts switched off | `pnpm build` without `.env.local`   | Pass                                        |
| Browser and responsive checks    | `node scripts/qa/site-check.cjs`    | **353 passed, 0 failed**                    |
| Authentication and isolation     | `node scripts/qa/auth-check.cjs`    | **54 passed, 0 failed**                     |
| Migration validation (local)     | `scripts/qa/validate-migrations.sh` | Pass: 0001–0007 apply; security checks pass |
| Supabase security advisor        | Management API                      | 0 findings (2 warnings fixed by 0007)       |
| Server log during test runs      | —                                   | 0 errors                                    |

## Responsive checks

24 routes × 11 widths = 264 page loads: **320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440,
1920 px**. Each load checks: HTTP 200, correct product, one visible `<main>`, one visible `<h1>`,
a title, `lang="en"`, no horizontal overflow, no text under 11 px, no console errors, and on touch
widths (320–768) no button, field, navigation link or footer link under 44 px tall.

All 264 pass. The legacy `/voicehub` page is exempt from the tap-target audit only (unlinked, due
to be replaced).

## Hero animation

At 320, 390, 834, 1440 and 1920 px (12 checks each): fish drawn; animation runs; one visible Pause
control of 44 px or more; Pause stops drawing and keeps the fish visible; state survives reload;
Resume restarts; stops off screen; reduced motion gives a still frame with no looping CSS
animation.

Strongest fish pixel over protected elements in 120 simulated seconds (percent of full opacity;
the fish body is far above 10%, these are the outer glow):

| Width   | Directory button | AutoFlow button | Pause | Kicker | Headline | Status line |
| ------- | ---------------- | --------------- | ----- | ------ | -------- | ----------- |
| 320 px  | 0%               | 0%              | 4%    | 0%     | 0%       | 0%          |
| 390 px  | 0%               | 0%              | 2%    | 0%     | 0%       | 0%          |
| 834 px  | 2%               | 2%              | 0%    | 0%     | 0%       | 5%          |
| 1440 px | 2%               | 3%              | 3%    | 0%     | 0%       | 7%          |
| 1920 px | 2%               | 4%              | 4%    | 0%     | 0%       | 7%          |

## Authentication and security (real project)

Two throwaway accounts are created for the run and deleted afterwards. No real user data is used.

| Group                  | Checks | What is verified                                                                                                                                       |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visitors               | 6      | Cannot read profiles, workspaces, projects or stages; can read the public catalog; cannot write to it                                                  |
| Own data               | 5      | Sign-up created one profile and two workspaces; a project can be created in the user's own AutoFlow workspace and gets six stages                      |
| Limits on a user       | 6      | Cannot write to the catalog, create a project in another user's or a Directory workspace, create extra workspaces, reassign an owner or move a project |
| Cross-user isolation   | 9      | User B cannot read, edit or delete A's project, stages, workspace or profile; A's data is unchanged; a tampered token is rejected                      |
| Signed out, in the app | 4      | Workspace and project addresses show only the sign-in prompt; nothing about the project is in the page; `/account` asks to log in                      |
| Log in                 | 5      | Wrong password gives a clear error, keeps the email, clears the password, sets no session; correct password returns to the requested page              |
| Session                | 7      | Cookies are HttpOnly, Secure, SameSite=Lax; scripts cannot read them; no token in browser storage; survives reload; shared across tabs and products    |
| Log out                | 2      | Session ends, cookies cleared, workspace closed again                                                                                                  |
| Redirect safety        | 1      | An off-site return address is ignored                                                                                                                  |
| Isolation in the app   | 3      | On a phone, user B logs in and gets "not found" for A's project; B's list is empty; no overflow                                                        |
| Sign-up form           | 2      | Short password refused before anything is sent; dialog fits a phone                                                                                    |
| Cleanup                | 1      | Deleting the accounts removed their workspaces and projects                                                                                            |

After the run the project holds 0 users, 0 profiles, 0 workspaces, 0 projects.

## Defects found by testing and fixed in this round

| Defect                                                                                   | Fix                  |
| ---------------------------------------------------------------------------------------- | -------------------- |
| Email field cleared after a failed log-in                                                | `906f350`            |
| Session check ran during prefetch and logged server errors                               | `a861b5c`            |
| Workspace check in a trigger was hidden by row level security                            | `853647b`            |
| Two functions with a changeable search path (Supabase advisor)                           | `d02f269`            |
| Directory header 103 px too wide at 1024 px and 22 px at 1280 px with the account button | `e9cc541`, `cd1069b` |
| Tap targets under 44 px: footer links, breadcrumbs, chips, small buttons, logos          | `e9cc541`            |
| Parent footer links 36 px tall on tablets                                                | `e9cc541`            |
| British spellings in Directory and sample copy                                           | `d6b75e9`            |

Earlier defects are listed in `implementation-progress.md`.

## Not tested

| Not tested                                                                                  | Why                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sign-up end to end with a confirmation email                                                | Needs a real inbox. The project has no SMTP; Supabase's built-in sender is limited. A test address at `example.com` was refused by Supabase as invalid, and the form showed that correctly |
| Password reset                                                                              | Not built                                                                                                                                                                                  |
| Real devices, Safari, Firefox, screen readers                                               | Only headless Chromium is available here                                                                                                                                                   |
| Automated accessibility audit (axe), color contrast of the AutoFlow and light parent themes | No audit tool installed                                                                                                                                                                    |
| Lighthouse or field performance                                                             | Not run                                                                                                                                                                                    |
| Behavior on the production host (cookies on the real domain)                                | Nothing is deployed                                                                                                                                                                        |
| Each commit building on its own                                                             | Only the final state was built and tested                                                                                                                                                  |
