# Central Admin Panel — Implementation

16 Nov 2026. What is built, how it is secured, and how to switch it on. **Not active in
production:** it needs migrations 0009 and 0010 applied and the owner bootstrap run, both of
which need approval. Until then `/admin` shows "not found" to everyone.

## 1. What exists

| Area                                                                           | State                                                                                                 |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `/admin` shell, 14 sections                                                    | Built. Navigation shows only the sections a role may use                                              |
| Dashboard, 12 widgets                                                          | Built. Real counts where data exists; a plain "not available" where it does not                       |
| Users                                                                          | Built: list and search (read-only)                                                                    |
| Roles & Permissions                                                            | Built: staff list, assign and remove roles, role descriptions, permission matrix                      |
| Dependencies & Integrations                                                    | Built: 18 records, edit settings, enable or disable, demo or real mode, credentials, test button, log |
| AI Providers, Storage, Background Jobs, YouTube Publishing, Payments & Billing | Built as views of their dependencies, with a plain statement of what is not built                     |
| AI Directory, AutoFlow Projects                                                | Counts and the pipeline dependency map. Management is not built                                       |
| System Logs                                                                    | Built: integration events                                                                             |
| Audit Logs                                                                     | Built                                                                                                 |
| General Settings                                                               | Placeholder with a statement of what is not built                                                     |

Where authority lives: in the database. The earlier plan put it in a Python service; that service
does not exist yet, so every admin read and change goes through a database function that checks
the caller's permission itself. The panel only decides what to show. When the Python API exists
it can call the same functions.

## 2. Roles and permissions

| Permission                   | Super Admin | Admin | Editor | Support | Finance |
| ---------------------------- | :---------: | :---: | :----: | :-----: | :-----: |
| `admin.access`               |      ✓      |   ✓   |   ✓    |    ✓    |    ✓    |
| `users.read`                 |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `users.suspend`              |      ✓      |   ✓   |        |         |         |
| `roles.read`                 |      ✓      |   ✓   |        |         |         |
| `roles.grant`                |      ✓      |       |        |         |         |
| `catalog.write`              |      ✓      |   ✓   |   ✓    |         |         |
| `content.write`              |      ✓      |   ✓   |   ✓    |         |         |
| `projects.status.read`       |      ✓      |   ✓   |        |    ✓    |         |
| `jobs.read`                  |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `integrations.read`          |      ✓      |   ✓   |        |         |    ✓    |
| `integrations.configure`     |      ✓      |   ✓   |        |         |         |
| `integrations.secrets.write` |      ✓      |       |        |         |         |
| `billing.read`               |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `billing.manage`             |      ✓      |       |        |         |    ✓    |
| `settings.write`             |      ✓      |   ✓   |        |         |         |
| `audit.read`                 |      ✓      |   ✓   |        |         |         |

## 3. Why escalation is not possible

| Attempt                                    | Stopped by                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| A user edits their own role                | Browser roles have no privileges on the role table; no role on the profile |
| A user signs up as an admin                | Sign-up creates no role; there is no admin sign-up                         |
| An Admin makes themselves Super Admin      | Only a Super Admin may grant; nobody may change their own role             |
| A forged token claims a role               | Roles are read from the database per request, never from the token         |
| A hidden page is opened by address         | Each page checks its permission and returns "not found"                    |
| A form is submitted without the permission | The action checks, and the database function checks again                  |
| A removed admin keeps working              | Lookup per request: locked out on the next request (tested)                |
| The last Super Admin is removed            | Refused                                                                    |
| The bootstrap is run from the website      | Not executable by any application role                                     |
| The audit log is edited                    | No privileges, and a trigger rejects update, delete and truncate           |

## 4. First Super Admin: owner bootstrap

The owner is the existing account. Nothing about that account, its profile or its two workspaces
is changed; one row is added to the role table and one to the audit log.

`bootstrap_first_super_admin(user_id)`:

- Can be run only by the database owner (the Supabase SQL Editor or the Management API). No
  website request can reach it.
- Takes the account's ID as stored by Supabase Auth; the ID is read from the database by whoever
  runs it, never supplied by a browser.
- Requires a confirmed account that has a profile.
- Succeeds only while no Super Admin exists. Afterwards it refuses any other account.
- Run again for the same account, it changes nothing and says so.
- Writes the audit entry `bootstrap.super_admin` in the same transaction.

Procedure (after migrations 0009 and 0010 are applied):

1. Supabase → Authentication → Users: copy the owner account's User UID.
2. Supabase → SQL Editor:

```sql
select bootstrap_first_super_admin('<owner user UID>');
```

3. Expected reply: `initialized: first Super Admin created`.
4. Sign in on the site and open `/admin`.

## 5. Dependencies and integrations

| Layer         | Where                              | Notes                                                              |
| ------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Definitions   | `src/lib/integrations/registry.ts` | Fields, providers, credentials and pipeline mapping per dependency |
| Configuration | `integrations` table               | Non-secret settings and status                                     |
| Credentials   | `integration_secrets` table        | Encrypted by the server (AES-256-GCM) before storage; write-only   |
| Adapters      | `src/lib/integrations/adapter.ts`  | One interface: validate, health check. **None registered**         |
| Health checks | Adapter `healthCheck`              | None exists, so "Test connection" contacts nothing                 |
| Usage         | `integration_usage` table          | Empty; written by adapters later                                   |
| Logs          | `integration_logs` table           | Configuration, credential and test events                          |
| Errors        | `ProviderError`                    | A safe code for the interface; detail for the log only             |

### The 18 records (all Demo, all disabled)

| Module             | Depends on              |
| ------------------ | ----------------------- |
| AI Research        | Research Provider API   |
| Script Generation  | LLM API                 |
| Voice Generation   | Voice Provider API      |
| Video Generation   | Video Provider API      |
| Rendering          | Remotion Worker Hosting |
| File Storage       | Object Storage          |
| Background Jobs    | Redis / Celery          |
| YouTube Publishing | Google OAuth            |
| Payments           | Payment Provider        |

Seeded values are fictional: `.example` addresses, `demo-` names. No credential is seeded.

### Status rules

| Status         | How a record gets there                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Demo           | Seeded, or saved in demo mode                                                                                           |
| Configured     | Saved as a real configuration with a real provider                                                                      |
| Connected      | Only after a real connection test passes. Enforced by a database constraint. **Not reachable today**: no adapter exists |
| Error          | A real connection test failed                                                                                           |
| Not Configured | Reserved for a record with nothing set                                                                                  |

"Test connection" never reports success unless a real request succeeded. In demo mode, and for
every integration today, it says that nothing was contacted and leaves the status unchanged.

### Credentials

- Typed into a password field, sent once to a server action, encrypted, stored. Never returned.
- The panel shows "Set" and the last four characters only.
- Only a Super Admin can set or remove one.
- Needs `INTEGRATIONS_ENCRYPTION_KEY` on the server. Without it, saving is refused; nothing is
  stored in plain text as a fallback.
- A credential cannot be saved inside the readable settings: the database rejects setting names
  that look like credentials, and addresses containing a password are refused.

## 6. AutoFlow dependency map

| Stage                    | Depends on                           |
| ------------------------ | ------------------------------------ |
| Research                 | AI Research, Research Provider API   |
| Script                   | Script Generation, LLM API           |
| Voice                    | Voice Generation, Voice Provider API |
| Scene / Video Generation | Video Generation, Video Provider API |
| Video Assembly           | Remotion Worker Hosting              |
| Rendering                | Rendering, Remotion Worker Hosting   |
| Storage                  | File Storage, Object Storage         |
| Background Processing    | Background Jobs, Redis / Celery      |
| YouTube Publishing       | YouTube Publishing, Google OAuth     |
| Payment / Subscription   | Payments, Payment Provider           |

Each stage shows one of Planned, Demo, Configured, Connected, Operational. Operational requires
every dependency to be Connected **and** the stage to be listed as built in code; that list is
empty. Shown on the public AutoFlow page (all Planned), in the signed-in workspace and in the
admin panel.

## 7. Database changes (not applied)

| Migration | Adds                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 0009      | `platform_role` enum; `user_roles`, `role_permissions`, `audit_log`; 13 functions                                                    |
| 0010      | `integration_status` enum; `integrations`, `integration_secrets`, `integration_logs`, `integration_usage`; 18 demo rows; 7 functions |

Both are additive. Row level security is on for every new table with no policies; browser roles
have no table privileges.

## 8. Tests (all local)

| Suite                              | Result                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `validate-migrations.sh`           | 0001–0010 apply; 10 groups of role and integration checks, 14 guest-search, 5 account |
| `admin-check.sh`                   | **82 passed, 0 failed** (three runs)                                                  |
| Lint, typecheck, formatting, build | Pass, 115 pages                                                                       |
| `site-check.cjs`                   | 364 passed, 0 failed                                                                  |
| `guest-search-check.sh`            | 90 passed, 0 failed                                                                   |

The admin checks run the real app against a throwaway PostgreSQL and a local stand-in for
Supabase Auth, with three local test accounts. Coverage: access for visitors and ordinary users,
all 14 sections, dashboard values, the 18 dependencies, validation, demo and real modes, the test
button, credential handling (never in a page, a response, a log or the browser bundle), roles for
Super Admin, Admin and Editor, immediate lock-out, the audit log, the one-time bootstrap, the
dependency map, and the phone layout.

## 9. To activate (needs approval)

1. Apply migrations 0009 and 0010.
2. Run the owner bootstrap (section 4).
3. Optional, for saving credentials: add `INTEGRATIONS_ENCRYPTION_KEY` in Vercel and redeploy.

## 10. Not built

Suspending accounts; user detail pages; Directory content management; job monitoring; storage
browser; billing; email management; notifications; feature flags; maintenance mode; two-factor
enforcement for staff; any provider adapter or real connection test; any AutoFlow stage.

## 11. AI Directory content management (added 16 Nov 2026)

Built and tested locally; **needs migration 0011 in production** before it works there. Until
then `/admin/directory` says that management is not available yet.

| Screen                        | What it does                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/admin/directory`            | Tool list with search and status filter; counts                                                       |
| `/admin/directory/tools/new`  | Create a tool as an unpublished, unverified draft                                                     |
| `/admin/directory/tools/[id]` | Edit details and categories; add and remove sources; pricing plans; publish, feature, archive; verify |
| `/admin/directory/categories` | Add, edit and delete categories and subcategories (two levels)                                        |

Rules enforced by the database, not only the page:

- Publishing needs a category and at least one official source. Sample records cannot be published.
- Only published tools can be featured.
- Verified needs a source with a check date; the verified date is set to today by the database.
- Removing the last dated source sends a verified tool back to review.
- Saving pricing marks it unverified; it shows publicly only after the tool is verified again,
  and only if checked within the last 30 days.
- Addresses must be full `http(s)` addresses; check dates cannot be in the future.
- A category in use, or with subcategories, cannot be deleted.
- Every change is written to the audit log.

New permission `catalog.publish` (Super Admin, Admin, Editor). Editors can manage the Directory;
Support and Finance cannot.

Not yet done: the public Directory still reads the labeled sample records from code. Switching
it to read published database records is the next step. Guides, prompts and workflows are not
editable yet.

Fixed along the way: admin forms no longer clear the person's input when the server refuses a
value.

Rollback: `supabase/rollback/0011_catalog_admin.down.sql` removes the functions and the
permission and keeps any content entered.
