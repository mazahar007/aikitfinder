# Phase 1 Remaining Work

State on 15 Nov 2026. Nothing below is started unless it says so.

## Fully implemented

- Parent homepage at `/` with the approved hero animation, Pause/Resume and reduced motion.
- Route structure: parent, Directory and AutoFlow, each with its own layout; all earlier URLs kept.
- Per-product themes with separate saved preferences.
- Directory browsing on sample data (pre-existing, kept working).
- `/autoflow` landing page.
- Automated checks: `scripts/qa/site-check.cjs`, `scripts/qa/validate-migrations.sh`.

## Foundation implemented

- Account dialog (opens, disabled) and the session seam `getCurrentUser()`.
- AutoFlow workspace layout, project list, project detail, six-stage structure.
- Workspace access check.
- Database schema for profiles, workspaces, projects and stages (migration file only).

## Partially implemented

| Item                                             | Done                             | Missing                                               |
| ------------------------------------------------ | -------------------------------- | ----------------------------------------------------- |
| Parent light theme                               | Works                            | Visual design approval                                |
| About, Contact, Privacy, Terms, Editorial policy | Pages exist in the parent layout | Real content; legal text needs owner and legal review |
| American English                                 | All new copy                     | Older Directory copy not yet reviewed                 |
| Directory identity                               | Existing teal/cyan theme         | Not restyled to the Phase 0A identity board           |

## Deferred

| Item                                             | Depends on                                         |
| ------------------------------------------------ | -------------------------------------------------- |
| Sign-up, log-in, sessions, return to destination | A Supabase project (owner approval)                |
| Applying migrations 0001–0006                    | Same                                               |
| Directory on real data, admin tools              | Database                                           |
| Python FastAPI backend, queue, worker, storage   | Hosting decisions; first needed by AutoFlow stages |
| All six AutoFlow stages; AI providers            | Backend; provider keys held server-side            |
| Voiceover Studio (VoiceHub migration)            | `docs/planning/VOICEHUB_MIGRATION_PLAN.md`         |
| YouTube connection and publishing                | Backend; encrypted token storage design            |
| Rate limits, usage tracking, abuse protection    | Backend and accounts                               |
| CI, unit tests                                   | Owner approval to add test dependencies            |
| README and older checklist documents             | They still describe the pre-Phase 1 structure      |

## Known blockers

1. **No Supabase project.** Blocks all account work and any database use.
2. **No backend hosting decision.** Blocks the Python service and the worker.
3. **No verified company or contact details.** Blocks About, Contact and legal pages.

## Suggested order for the next phase (for approval, not started)

1. Supabase project, apply migrations, live sign-in with the existing dialog.
2. Real projects in the AutoFlow workspace (create, rename, archive).
3. Backend skeleton with the first stage (Research or Script).
