# Guest Search Limit — Production Safety Audit

16 Nov 2026. Audit of commit `7a13de8` before the limit is switched on in production. During the
audit nothing was applied, pushed or changed in production. Checks against production were
read-only.

**Verdict: safe to activate once the approvals in section 6 are given. 0 FAIL, 9 WARNING.**

## 1. Findings

### Migration 0008, line by line

| #    | Check                                                                                | Result                                                      |
| ---- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 1.1  | Creates only new objects: 3 tables, 3 indexes, 1 trigger on a new table, 2 functions | PASS                                                        |
| 1.2  | No `alter`, `drop`, `truncate`, `update` or `delete` on any existing object          | PASS                                                        |
| 1.3  | No foreign key or reference to `auth.users`, `profiles` or `workspaces`              | PASS                                                        |
| 1.4  | Row level security enabled on all three tables; no policies                          | PASS                                                        |
| 1.5  | All table privileges revoked from `anon` and `authenticated`                         | PASS                                                        |
| 1.6  | Both functions are `security definer` with `search_path = public, pg_temp`           | PASS                                                        |
| 1.7  | Execute revoked from `public`, `anon`, `authenticated`; granted to `service_role`    | PASS                                                        |
| 1.8  | Count limited by a conditional upsert and a 0–3 check constraint                     | PASS                                                        |
| 1.9  | Housekeeping deletes only rows older than 1 day (request IDs) or 7 days (counters)   | PASS                                                        |
| 1.10 | No column can hold query text or a raw identifier                                    | PASS                                                        |
| 1.11 | The housekeeping deletes run inside every accepted search                            | WARNING: cheap now; move to a scheduled job if volume grows |

### Compatibility with production (read-only checks)

| #   | Check                                                                           | Result                                                                 |
| --- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 2.1 | Production has migrations 0001–0007 exactly; 0008 is the next number            | PASS                                                                   |
| 2.2 | No existing table or function named like the new ones                           | PASS                                                                   |
| 2.3 | `set_updated_at()` exists (used by the new trigger) and has a fixed search path | PASS                                                                   |
| 2.4 | `gen_random_uuid`, `hashtextextended` and the `service_role` role exist         | PASS                                                                   |
| 2.5 | `service_role` bypasses row level security, as the design assumes               | PASS                                                                   |
| 2.6 | No advisory locks in use that the function's lock could collide with            | PASS                                                                   |
| 2.7 | Validated on PostgreSQL 16 locally; production is 17.11                         | WARNING: no version-specific feature is used, but it has not run on 17 |

### Existing account

| #   | Check                                                                            | Result                |
| --- | -------------------------------------------------------------------------------- | --------------------- |
| 3.1 | Production holds 1 confirmed user, 1 profile, 2 workspaces (directory, autoflow) | PASS (state recorded) |
| 3.2 | The migration cannot touch them: it has no statement on those tables             | PASS                  |
| 3.3 | The feature never reads or writes them: signed-in users skip the quota entirely  | PASS                  |

### Access control and SQL safety

| #   | Check                                                                             | Result                                                                                  |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 4.1 | Browser roles cannot select, insert or update the tables (tested as both roles)   | PASS                                                                                    |
| 4.2 | Browser roles cannot call either function (tested)                                | PASS                                                                                    |
| 4.3 | A temporary table cannot stand in for a real one (tested)                         | PASS                                                                                    |
| 4.4 | Arguments are validated by pattern; no dynamic SQL in the functions               | PASS                                                                                    |
| 4.5 | The app calls the functions with bound parameters; a query containing SQL is text | PASS (tested)                                                                           |
| 4.6 | The app's secret key is used for these two calls only; it reads no table          | PASS                                                                                    |
| 4.7 | The secret key can bypass row level security if server code is ever misused       | WARNING: inherent to holding it. One server-only module, one importer; keep it that way |

### Guest cookie, signature, replay and idempotency

| #    | Check                                                                                   | Result                                         |
| ---- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 5.1  | Identifier: 32 bytes from the cryptographic generator                                   | PASS                                           |
| 5.2  | Signature: HMAC-SHA-256 with a server secret of at least 32 characters                  | PASS                                           |
| 5.3  | Verification on every guest search, constant-time comparison                            | PASS                                           |
| 5.4  | Forged, altered or differently-signed cookies are replaced, not trusted (tested)        | PASS                                           |
| 5.5  | Another guest's identifier with a wrong signature does not reach their usage            | PASS (tested)                                  |
| 5.6  | Cookie is HttpOnly, Secure in production, SameSite=Lax; not readable by scripts         | PASS (tested)                                  |
| 5.7  | Identifier and hash never appear in a response body or log                              | PASS (tested)                                  |
| 5.8  | Guest identifiers in the body, query or headers are ignored                             | PASS (tested)                                  |
| 5.9  | Repeated request ID uses nothing; 8 simultaneous copies use one search                  | PASS (tested)                                  |
| 5.10 | Request IDs are scoped to the guest: one guest cannot replay another's                  | PASS                                           |
| 5.11 | Another website cannot spend a visitor's searches (JSON content type required, no CORS) | PASS                                           |
| 5.12 | Clearing cookies gives a new identity and three more searches                           | WARNING: by design; bounded by the address cap |

### Daily quota and address limit

| #   | Check                                                                       | Result                                                                                                                  |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 6.1 | Searches 1–3 allowed, 4th refused before the search runs                    | PASS (tested; execution counted in the server log)                                                                      |
| 6.2 | 12 simultaneous requests cannot pass 3                                      | PASS (tested)                                                                                                           |
| 6.3 | Date and `reset_at` come from the database clock, in UTC                    | PASS                                                                                                                    |
| 6.4 | A new UTC day gives 3 again; yesterday's blocked request ID is not replayed | PASS (tested)                                                                                                           |
| 6.5 | 60 accepted guest searches per hashed address per UTC day                   | PASS (tested)                                                                                                           |
| 6.6 | The address cap is read then written without a shared lock                  | WARNING: can be passed by a few under simultaneous load. It is a soft control                                           |
| 6.7 | The address comes from a header set by the host                             | WARNING: Vercel overwrites it. Behind another proxy this needs review                                                   |
| 6.8 | No per-second throttle                                                      | WARNING: every request costs one database call. Add a Vercel Firewall rule or an in-process limiter before real traffic |

Change since `7a13de8` (in the next push): when the host supplies no address, all such requests
now share one bucket instead of skipping the cap.

### Failure behavior

| #   | Situation                                            | Behavior                                       | Result                                                                                                                   |
| --- | ---------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 7.1 | Database unreachable, function missing, or bad reply | 503, search does not run                       | PASS                                                                                                                     |
| 7.2 | Variables set but migration not applied              | 503 for guests until it is                     | PASS (hence the order in section 4)                                                                                      |
| 7.3 | Invalid request                                      | 400 before the quota is touched                | PASS (tested, 10 cases)                                                                                                  |
| 7.4 | Session cannot be verified                           | Treated as a visitor; the quota applies        | PASS                                                                                                                     |
| 7.5 | Either variable missing                              | Limit off, search unlimited, `enforced: false` | WARNING: this is the off switch, but a removed variable disables the limit silently. Check `enforced` after every deploy |

### Secrets

| #   | Check                                                                          | Result                                                                |
| --- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 8.1 | Neither variable has a `NEXT_PUBLIC_` prefix                                   | PASS                                                                  |
| 8.2 | Modules that read them are marked server-only; a client import fails the build | PASS                                                                  |
| 8.3 | Scan of browser files for key names, function names and test values            | PASS (none found)                                                     |
| 8.4 | Server log holds event names and times only                                    | PASS (tested)                                                         |
| 8.5 | Database errors are discarded; visitors get a generic message                  | PASS                                                                  |
| 8.6 | The local-gateway override accepts only this machine's address                 | PASS                                                                  |
| 8.7 | No secret in any commit or tracked file                                        | PASS                                                                  |
| 8.8 | A hashed address is kept up to 7 days                                          | WARNING: pseudonymous personal data; mention it in the privacy policy |

### Authentication regression

| #    | Check                                                      | Result                                                             |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| 10.1 | `auth-check.cjs` (83 checks) since this feature            | WARNING: **not run**; it creates accounts in the real Auth project |
| 10.2 | Sign-in resume, counter hidden, unlimited signed-in search | Passed once before the block; not re-run                           |
| 10.3 | A visitor cannot claim to be signed in                     | PASS (tested locally)                                              |

## 2. Safe testing method for sign-in (no owner account involved)

A local stand-in for Supabase Auth now exists (built for the admin panel checks): a test signing
key with its public-key endpoint, test tokens, and database calls made as the signed-in user,
all against a throwaway local PostgreSQL. It lets the app be driven as a signed-in user without
any account in the real project.

| Option                                    | What it covers                                                           | Production impact                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| A. Local stand-in (recommended next step) | Signed-in search: unlimited, counter hidden, pending search resumes once | None                                                                                                      |
| B. Separate Supabase test project         | Everything, including real sign-up, confirmation and reset               | None; needs your approval to create                                                                       |
| C. Throwaway accounts in production Auth  | Everything                                                               | Creates and deletes `akf-qa-…@example.com` accounts; never touches the owner account; needs your approval |

The local stand-in cannot test real sign-up, email confirmation or password reset, because those
are Supabase Auth's own behavior. For those, option B or C is needed.

## 3. What activation changes in production

| Object                                 | Change                                  |
| -------------------------------------- | --------------------------------------- |
| Existing tables, policies, functions   | None                                    |
| `auth.users`, `profiles`, `workspaces` | None                                    |
| New tables                             | 3, empty                                |
| New functions                          | 2                                       |
| Migration history                      | One row, `0008`                         |
| Vercel                                 | Two server-only variables, one redeploy |

## 4. Activation plan

1. **Before:** confirm `GET /api/directory/search` shows `"enforced": false`, and record the
   row counts of `auth.users`, `profiles`, `workspaces`.
2. **Apply 0008** in one transaction, together with its migration-history row. If any statement
   fails, the whole transaction rolls back and nothing is created.
3. **Verify the database:** 3 tables with row level security, 0 policies, 0 browser-role
   privileges, 2 functions executable by `service_role` only; account row counts unchanged.
4. **Add the two variables** in Vercel (Production and Preview) and redeploy.
5. **Verify live:** `enforced: true`; three searches work; the fourth opens the dialog; browsing
   stays open; a signed-in search is not counted.

The migration must come before the variables. Reversed, guests get 503 until it is applied.

## 5. Rollback and recovery

| Situation                 | Action                                                        | Effect                        |
| ------------------------- | ------------------------------------------------------------- | ----------------------------- |
| Limit misbehaves          | Remove `GUEST_SEARCH_SECRET` in Vercel, redeploy              | Limit off within one deploy   |
| Guests see 503            | Same; then investigate                                        | Search works, unmetered       |
| Wrong counts for one day  | Nothing; counters reset at the next UTC midnight              | —                             |
| Remove the feature's data | Run the statement below                                       | Tables and functions removed  |
| Secret leaked             | Replace `GUEST_SEARCH_SECRET`; rotate the Supabase secret key | All guests get a new identity |

Removal, only if ever wanted (it deletes only this feature's objects):

```sql
begin;
drop function if exists public.consume_guest_search(text, uuid, text);
drop function if exists public.guest_search_status(text);
drop table if exists public.guest_search_requests, public.guest_search_ip_usage, public.guest_search_usage;
delete from supabase_migrations.schema_migrations where version = '0008';
commit;
```

Nothing else depends on these objects, so removing them cannot affect accounts or content.

## 6. Requires your approval

1. Applying migration 0008 to the production database.
2. Adding `GUEST_SEARCH_SECRET` and `SUPABASE_SECRET_KEY` in Vercel (you do this; I cannot).
3. How to re-run the sign-in checks: option A, B or C in section 2.
4. Whether to add a short-window throttle before activation or after.
