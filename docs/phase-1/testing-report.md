# Phase 1 Testing Report

Run on 15 Nov 2026 against the production build (`pnpm build`, `pnpm start`) of the branch,
in headless Chromium. Nothing was deployed.

## Results

| Check               | Command                             | Result                                                  |
| ------------------- | ----------------------------------- | ------------------------------------------------------- |
| Lint                | `pnpm lint`                         | Pass, 0 errors, 0 warnings                              |
| Type check          | `pnpm typecheck`                    | Pass                                                    |
| Formatting          | `pnpm format:check`                 | Pass                                                    |
| Production build    | `pnpm build`                        | Pass, 95 static pages generated                         |
| Browser checks      | `node scripts/qa/site-check.cjs`    | **135 passed, 0 failed**                                |
| Database migrations | `scripts/qa/validate-migrations.sh` | Pass: 0001–0006 apply; 5 groups of security checks pass |

## Browser checks in detail

| Group                 | Checks | What is verified                                                                                                                                                                                                                           |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Routes                | 71     | 23 routes × desktop 1440, tablet 834, phone 390: HTTP 200, correct product, one `<main>`, one `<h1>`, a title, `lang="en"`, no horizontal overflow, no console errors. Plus not-found handling                                             |
| Hero animation        | 36     | Per viewport: fish drawn; animation runs; one visible Pause control, 44 px or taller; Pause stops drawing and keeps the fish visible; state survives reload; Resume restarts; stops off screen; protected zones; reduced motion            |
| Navigation, desktop   | 14     | Skip link first; Products menu and Escape; theme switch; AutoFlow theme independent; parent theme remembered; account dialog opens, is disabled with a notice, closes on Escape; both hero buttons; workspace journey; six stages in order |
| Navigation, Directory | 9      | Six section links; Deals and VoiceHub absent from navigation; tool card opens a tool page                                                                                                                                                  |
| Navigation, phone     | 5      | Menu opens; all targets 44 px or taller; Escape closes; both hero buttons on the first screen                                                                                                                                              |

### Protected zones

Strongest fish pixel found over each element during 120 simulated seconds, as a percentage of
full opacity. The fish body is far above 10%; values here are the outer glow only.

| Viewport | Directory button | AutoFlow button | Pause | Kicker | Headline | Status line |
| -------- | ---------------- | --------------- | ----- | ------ | -------- | ----------- |
| Desktop  | 2%               | 3%              | 3%    | 0%     | 0%       | 7%          |
| Tablet   | 2%               | 2%              | 0%    | 0%     | 0%       | 5%          |
| Phone    | 0%               | 0%              | 2%    | 0%     | 0%       | 0%          |

### Database security checks

On a throwaway local PostgreSQL 16 with a stand-in for Supabase's `auth` schema:

1. A new account gets one profile and two workspaces.
2. A user sees only their own profile and workspaces; a new project gets six stage rows; a user
   cannot create a project in another user's workspace, in a Directory workspace, or create or
   rename workspaces they do not own.
3. Another user cannot see, update or delete those projects or stages.
4. A visitor sees nothing.
5. Deleting the account removes its workspaces and projects.

## Defects found by testing and fixed

| Defect                                                              | Fix                |
| ------------------------------------------------------------------- | ------------------ |
| Phone layout used the desktop gutter (wrong selector under nesting) | `7edd12c` (in CSS) |
| Directory header 5 px too wide at 1280 px                           | `f11faa6`          |
| VoiceHub lost its header and nested two `<main>` elements           | `f11faa6`          |
| Unknown project showed the Directory's not-found page               | `5f6189e`          |
| Workspace check hidden by row level security in a trigger           | `853647b`          |
| Directory header 1 px too wide at 390 px                            | `4879384`          |
| Logo link in the phone menu was 32 px tall                          | `4879384`          |

## Not tested

| Not tested                                                                                   | Why                                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Real devices, Safari, Firefox                                                                | Only headless Chromium is available here                |
| Screen readers                                                                               | Needs a person                                          |
| Automated accessibility audit (axe) and contrast of the new AutoFlow and light parent themes | No audit tool installed; not measured                   |
| Lighthouse or field performance                                                              | Not run. Frame cost was measured for the proposal only  |
| Sign-up, log-in, sessions                                                                    | Not built                                               |
| Migrations on Supabase itself                                                                | No project; validated on plain PostgreSQL only          |
| Each commit building on its own                                                              | Only the final state of the branch was built and tested |
