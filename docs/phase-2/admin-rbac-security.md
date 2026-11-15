# Phase 2 Step 1 — Admin RBAC and Security Design

15 Nov 2026. A design. No role table, permission or admin account exists today; every account is
an ordinary user. Nothing here has been applied.

## 1. Findings from the existing database

- `profiles` has no role or status column. `workspaces` are personal; there are no teams.
- All existing policies are owner-only or public-read. None refers to a role.
- The app has no secret key, so nothing can currently act outside row level security.
- There is exactly one real account. It is an ordinary user.

New role and permission tables are therefore required. They are separate tables, not columns on
`profiles`, because users can update their own profile row.

## 2. Roles

| Role        | Scope                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Super Admin | Everything, including roles, provider keys and system settings                   |
| Admin       | Platform management; cannot grant roles, cannot see or set provider keys         |
| Editor      | Directory and content only                                                       |
| Support     | User lookup, account status requests, project and job status; no private content |
| Finance     | Billing, payments, credits, usage                                                |

A user has at most one staff role. Ordinary users have no row at all.

## 3. Permissions

Permissions are fixed keys checked in code; roles map to them in a table seeded by migration.

| Permission                | Super Admin | Admin | Editor | Support | Finance |
| ------------------------- | :---------: | :---: | :----: | :-----: | :-----: |
| `admin.access`            |      ✓      |   ✓   |   ✓    |    ✓    |    ✓    |
| `users.read`              |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `users.suspend`           |      ✓      |   ✓   |        |         |         |
| `users.content.read`      |      ✓      |       |        |         |         |
| `roles.read`              |      ✓      |   ✓   |        |         |         |
| `roles.grant`             |      ✓      |       |        |         |         |
| `catalog.write`           |      ✓      |   ✓   |   ✓    |         |         |
| `catalog.publish`         |      ✓      |   ✓   |   ✓    |         |         |
| `content.write`           |      ✓      |   ✓   |   ✓    |         |         |
| `projects.status.read`    |      ✓      |   ✓   |        |    ✓    |         |
| `jobs.read`               |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `jobs.manage`             |      ✓      |   ✓   |        |         |         |
| `jobs.errors.read`        |      ✓      |   ✓   |        |         |         |
| `providers.read`          |      ✓      |   ✓   |        |         |    ✓    |
| `providers.configure`     |      ✓      |   ✓   |        |         |         |
| `providers.secrets.write` |      ✓      |       |        |         |         |
| `credits.read`            |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `credits.adjust`          |      ✓      |   ✓   |        |         |    ✓    |
| `billing.read`            |      ✓      |   ✓   |        |    ✓    |    ✓    |
| `billing.manage`          |      ✓      |       |        |         |    ✓    |
| `email.manage`            |      ✓      |   ✓   |        |         |         |
| `settings.write`          |      ✓      |   ✓   |        |         |         |
| `audit.read`              |      ✓      |   ✓   |        |         |         |

`users.content.read` (opening a user's script, audio or video) is Super Admin only, requires a
written reason, and is always logged.

## 4. Schema (proposed, migration 0008)

```sql
create type platform_role as enum ('super_admin', 'admin', 'editor', 'support', 'finance');

create table user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       platform_role not null,
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now()
);

create table role_permissions (
  role       platform_role not null,
  permission text not null,
  primary key (role, permission)
);

create table audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  actor_role platform_role,
  action     text not null,
  target_type text,
  target_id  text,
  summary    jsonb not null default '{}',
  ip         inet,
  request_id text,
  created_at timestamptz not null default now()
);
```

| Table              | Row level security | `anon` | `authenticated`                           | Backend role                            |
| ------------------ | ------------------ | ------ | ----------------------------------------- | --------------------------------------- |
| `user_roles`       | On                 | None   | **No grants.** Not readable, not writable | Read; write only through `grant_role()` |
| `role_permissions` | On                 | None   | No grants                                 | Read                                    |
| `audit_log`        | On                 | None   | No grants                                 | Insert, select. No update, no delete    |

Functions:

| Function                   | Kind                       | Purpose                                                                                                    |
| -------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `current_role()`           | `security definer`, stable | The caller's own role, or null. The only way a client learns it                                            |
| `has_permission(text)`     | `security definer`, stable | Used inside policies for staff read access                                                                 |
| `grant_role(target, role)` | `security definer`         | Checks the caller holds `roles.grant`; refuses self-grants; writes the audit entry in the same transaction |
| `revoke_role(target)`      | `security definer`         | Same checks; refuses to remove the last Super Admin                                                        |

An audit entry cannot be changed or removed by any application role: there is no update or delete
grant, and a trigger rejects both.

## 5. Why privilege escalation is not possible

| Attempt                                                | Stopped by                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| A user edits their own role                            | No grants on `user_roles` for `authenticated`; no role column on `profiles` |
| A user signs up as an admin                            | Sign-up creates no `user_roles` row; there is no admin registration         |
| An Admin grants themselves Super Admin                 | `roles.grant` is Super Admin only; `grant_role` refuses self-grants         |
| A forged or edited token claims a role                 | Roles are not in the token; they are read from the database on each request |
| The browser calls an admin endpoint directly           | FastAPI permission dependency on every admin route                          |
| The API has a bug and skips a check                    | Row level security and table grants still apply                             |
| The frontend hides a button but the route is reachable | The route itself returns "not found" without the permission                 |
| A removed admin keeps working until the token expires  | Database lookup per request: removal is immediate                           |
| The last Super Admin is removed                        | `revoke_role` refuses                                                       |

## 6. First Super Admin (bootstrap)

There is deliberately no screen for this.

1. The owner signs up normally and confirms their email.
2. The owner opens the Supabase dashboard (which already requires their Supabase login) → SQL
   Editor, and runs one statement, supplied with the migration, that inserts a `super_admin` row
   for their own account, selected by email.
3. The statement is guarded: it succeeds only when no Super Admin exists. Once one exists, the
   only path is `grant_role()` by a Super Admin.
4. The first request after that writes an audit entry "bootstrap: first Super Admin".
5. The owner turns on two-factor authentication for that account before using the panel.

The statement contains no secret and is safe to keep in the repository. It is not run by a
migration, by the application or by any automated process.

## 7. API authorization

```
request ─► verify Supabase token (signature, expiry, issuer, audience)
        ─► load role and permissions from the database
        ─► route dependency: require_permission("…")           403 or 404 if missing
        ─► service: ownership or scope check for the target
        ─► database: backend role with explicit grants; RLS for user-scoped work
        ─► audit_log entry for every change and every sensitive read
```

- Admin routes live under `/api/v1/admin` and are refused before any work if `admin.access` is
  missing.
- Suspended accounts are refused on every route. Suspension also bans the account in Supabase
  Auth so existing sessions end.
- Admin endpoints have their own, stricter rate limits.

## 8. Secrets

| Secret              | Stored                                                                       | Shown to the frontend                  |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| AI provider keys    | `ai_provider_secrets`, encrypted with a key held only by the API and workers | Last four characters and rotation date |
| SMTP password       | In Supabase (and the email provider)                                         | Never                                  |
| Supabase secret key | API service environment only                                                 | Never                                  |
| Database passwords  | Service environment only                                                     | Never                                  |

Key fields in the panel are write-only. Reading a full key back is not an API operation.

## 9. Audited events

Role granted or revoked; account suspended or reactivated; provider key set or rotated; provider
enabled or disabled; settings and feature flags changed; maintenance mode; credit adjustment;
refund; tool published, unpublished or archived; private user content opened; admin sign-in;
failed permission check.

## 10. Additional controls

- Two-factor authentication required for staff accounts (Supabase supports TOTP); enforced by the
  API for `admin.access`.
- Shorter session lifetime for the panel; re-authentication before the riskiest actions.
- Tests in the security suite: every admin endpoint is called with no token, a user token and
  each role, and the result is compared with the permission table above.
