# Phase 1 Final Audit Report

15 Nov 2026. Branch `feature/phase-1-platform-foundation`. Audit of the finished Phase 1 against
the Phase 1 brief and the Supabase integration brief. Nothing was deployed.

## 1. Verdict

Phase 1 is complete as a foundation. Log-in, sessions, protected routes and data isolation are
live and verified against the real Supabase project. Two things are not: public sign-up has not
been verified end to end because email delivery is not configured, and AutoFlow has no working
stage. Neither is presented as working.

## 2. Supabase

| Item                 | Finding                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| Connection           | Verified                                                                           |
| Project              | `aikitfinder` (`lethjnizehfshztmsiah`)                                             |
| Region               | **ap-southeast-2, Sydney** (detected from the API; not Singapore)                  |
| Database             | PostgreSQL 17.11                                                                   |
| State before work    | Empty: no public tables, no migration history, no users                            |
| Migrations applied   | 0001–0007, each in one transaction, recorded in migration history                  |
| Conflicts found      | None. No duplicate definitions, no destructive statements                          |
| Tables               | 20, all with row level security; 23 policies                                       |
| Security advisor     | 0 findings after 0007                                                              |
| Performance advisor  | Informational only: 4 foreign keys without an index, unused indexes (empty tables) |
| Data left by testing | None: 0 users, 0 profiles, 0 workspaces, 0 projects                                |

### Migration review

| Migration | Contents                               | Review result                                                                                 |
| --------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| 0001      | Catalog: categories, tools, sources    | Read-only for the public; no write policies                                                   |
| 0002      | Deals                                  | Column-level read grants                                                                      |
| 0003      | Pricing                                | Column-level read grants                                                                      |
| 0004      | Prompts                                | Column-level read grants                                                                      |
| 0005      | Workflows                              | Read-only for the public                                                                      |
| 0006      | Profiles, workspaces, projects, stages | Narrowed before apply: no visitor access, column-level grants, trigger functions not callable |
| 0007      | Search path of two trigger functions   | Added after the advisor flagged them                                                          |

Foreign keys cascade from the account down, so deleting an account removes its workspaces,
projects and stages (verified). One workspace per user per product is enforced by a unique
constraint. A project can only belong to an AutoFlow workspace (trigger, verified).

## 3. Secrets

| Check                                | Result                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| Secret or service-role key in source | None                                                                               |
| Secret key used by the app           | No. Publishable key only                                                           |
| `.env.local` tracked by Git          | No (ignored)                                                                       |
| Keys printed in reports or logs      | No                                                                                 |
| Secret key use                       | Test script only, from the environment, to create and delete throwaway users       |
| Supabase access token                | Held by the environment's credential store; never visible to the code or the agent |

## 4. Authentication

| Capability               | Status                                                   |
| ------------------------ | -------------------------------------------------------- |
| Log in                   | Verified                                                 |
| Log out                  | Verified                                                 |
| Session persistence      | Verified (reload, new tab, across products)              |
| Protected routes         | Verified (`/autoflow/app/*`; `/account` prompts)         |
| Shared identity          | Verified                                                 |
| Profile and workspaces   | Verified (created by trigger on account creation)        |
| Error and loading states | Verified for log-in; sign-up validation verified         |
| Sign-up                  | Built. **Not verified end to end**: needs email delivery |
| Password reset           | Not built                                                |

Session security: HttpOnly, Secure, SameSite=Lax cookies; token signature verified on the server;
no token in browser storage; safe return path; fixed error messages.

## 5. Scope check against the Phase 1 brief

| Area                  | Result                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Approved homepage     | Implemented without redesign. Only change this round: small controls reach 44 px on touch screens |
| Mobile-first UX       | Verified at eleven widths                                                                         |
| Navigation and themes | Verified                                                                                          |
| Directory foundations | Implemented on labeled sample data                                                                |
| AutoFlow foundations  | Landing and protected workspace implemented; stages are structure only                            |
| Shared UI system      | Implemented                                                                                       |
| Account architecture  | Implemented and live                                                                              |
| Database foundation   | Applied                                                                                           |
| Phase 2 features      | None started. Creating projects, AI stages and the backend were left out on purpose               |

## 6. Open risks

1. Public sign-up depends on SMTP and URL settings in Supabase (see `remaining-work.md`).
2. Supabase's project password minimum (6) is lower than the app's (8).
3. No CAPTCHA or app-level rate limit on the account forms; Supabase's own limits apply.
4. Only headless Chromium was tested.
5. The Directory's database tables are empty and unused; the site still shows sample data.
