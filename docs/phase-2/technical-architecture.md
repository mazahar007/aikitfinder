# Phase 2 Step 1 — Technical Architecture

15 Nov 2026. A design. Nothing in this document exists yet unless marked "existing".

## 1. Runtime services

```
                       Browser
                          │
        ┌─────────────────┴──────────────────┐
        │  Next.js on Vercel (existing)      │  pages, auth Server Actions, session cookies
        └───────┬───────────────────┬────────┘
                │ Supabase client   │ HTTPS + user's access token
                │ as the user       ▼
                │          ┌──────────────────┐      ┌─────────┐
                │          │ FastAPI  (api)   │─────►│  Redis  │ broker, results, rate limits
                │          └────────┬─────────┘      └────┬────┘
                │                   │                     │
                ▼                   ▼                     ▼
        ┌──────────────────────────────────┐   ┌───────────────────┐   ┌────────────────────┐
        │ Supabase (existing)              │◄──│ Celery workers    │──►│ Remotion renderer  │
        │ Postgres + Auth + RLS            │   │ (Python, FFmpeg)  │   │ (Node.js)          │
        └──────────────────────────────────┘   └─────────┬─────────┘   └─────────┬──────────┘
                                                         ▼                       ▼
                                                 ┌──────────────────────────────────┐
                                                 │ Object storage (media)           │
                                                 └──────────────────────────────────┘
```

Four separately deployed services: **api**, **worker**, **renderer**, **redis**. They share one
repository and one Docker Compose file for local work, but each has its own image, scaling and
failure domain. The API never renders video; the workers never serve HTTP to browsers.

## 2. Repository layout (proposed)

```
backend/
  pyproject.toml            dependencies and tool settings (ruff, mypy, pytest)
  Dockerfile                one image, two entrypoints: api and worker
  app/
    main.py                 FastAPI app factory, middleware, router mounting
    core/
      config.py             typed settings from environment (pydantic-settings)
      security.py           Supabase JWT verification, current-user dependency
      permissions.py        role and permission checks
      db.py                 connection pools, user-scoped and service-scoped sessions
      errors.py             error types and handlers
      logging.py            structured JSON logging, request IDs
      rate_limit.py         Redis-backed limits
    api/
      v1/router.py          mounts every module router under /api/v1
    modules/
      health/               liveness and readiness
      directory/            catalog reads, search, suggestions
      library/              favorites, collections, recently viewed
      projects/             AutoFlow projects and stages
      research/  scripts/  voice/  scenes/  video/  thumbnails/  metadata/
      assets/               uploads, signed URLs
      providers/            AI provider adapters, health, usage
      usage/                credits, ledger
      billing/              plans, subscriptions (provider-neutral)
      admin/                admin endpoints, audit log
      notifications/
    workers/
      celery_app.py         Celery configuration, queues
      tasks/                task entrypoints; call module services
  tests/
    unit/  integration/  security/  conftest.py
renderer/
  package.json  Dockerfile  src/        Remotion compositions and a small job runner
docker-compose.yml          api, worker, renderer, redis for local development
```

Each module has the same four files:

| File            | Responsibility                                                      |
| --------------- | ------------------------------------------------------------------- |
| `router.py`     | HTTP only: parse, authorize, call the service, shape the response   |
| `schemas.py`    | Pydantic request and response models                                |
| `service.py`    | Business rules; the only place that combines repositories and tasks |
| `repository.py` | SQL only; no business rules                                         |

This is a modular monolith: one deployable API, strict module boundaries, no module importing
another module's repository.

## 3. API conventions

| Topic         | Rule                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Versioning    | Path prefix `/api/v1`. Breaking changes go to `/api/v2`; v1 stays until the frontend moves     |
| Format        | JSON; snake_case; ISO 8601 UTC timestamps; UUID identifiers                                    |
| Pagination    | Cursor-based: `?limit=&cursor=`; response `{items, next_cursor}`                               |
| Idempotency   | `Idempotency-Key` header on every request that starts a paid job                               |
| Errors        | One shape: `{error: {code, message, request_id, details?}}`; no stack traces, no provider text |
| Documentation | OpenAPI generated by FastAPI; `/docs` enabled outside production only, or behind admin auth    |
| CORS          | Allow only the site origins; credentials off (bearer tokens, not cookies)                      |

## 4. Authentication and authorization

Supabase Auth stays the only identity system. The frontend keeps handling sign-up, log-in and
cookies. For API calls the Next.js server reads the user's access token from the session and
sends it as `Authorization: Bearer`. The browser never calls the Python API with a cookie.

Verification in `core/security.py`:

1. Fetch and cache the project's public keys from `<supabase-url>/auth/v1/.well-known/jwks.json`
   (ES256, already in use).
2. Verify signature, `exp`, `iss` (the project's auth URL) and `aud` (`authenticated`).
3. Reject anonymous sessions.
4. Return `CurrentUser(id, email)`.

Authorization has three independent layers, and every one must pass:

| Layer    | Enforced by                                       |
| -------- | ------------------------------------------------- |
| Route    | FastAPI dependency: signed in, has the permission |
| Service  | Ownership check on the specific record            |
| Database | Row level security                                |

Admin permissions are looked up in the database on each request, not read from the token, so
removing a role takes effect immediately.

## 5. Database access

Migrations stay in `supabase/migrations` as plain SQL: one source of truth, validated by the
existing script. No second migration tool.

| Session type   | Used for                          | How                                                                                                                          |
| -------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| User-scoped    | Every request on behalf of a user | Transaction that sets `role authenticated` and the verified token claims, so RLS applies exactly as it does for the frontend |
| Service-scoped | Workers, admin operations         | A dedicated database role with explicit grants per table; never the Supabase service-role key                                |

Driver: SQLAlchemy 2 Core with asyncpg, through Supabase's connection pooler in transaction
mode. Repositories write explicit SQL; no ORM models that could drift from the migrations.

**One writer per table.** A table is written either by Next.js or by Python, never both. The
owner of each table is listed in `migration-plan.md`.

## 6. Background work

| Queue     | Runs                                         | Notes                           |
| --------- | -------------------------------------------- | ------------------------------- |
| `default` | Short tasks: notifications, cleanup          |                                 |
| `ai`      | Provider calls: research, script, voice      | Network-bound; high concurrency |
| `media`   | FFmpeg: stitching, normalization, thumbnails | CPU-bound; low concurrency      |
| `render`  | Hands jobs to the Remotion renderer          | One job per renderer slot       |

Every job is a row in a jobs table (see `database-design.md`) with status, attempts, error code
and cost. Tasks are idempotent, acknowledge late, retry with backoff, and have hard time limits.
Credits are reserved when a job is accepted and settled when it finishes; a failed job refunds.

The renderer is a small Node service that takes a job from a Redis list, renders with Remotion,
uploads the file, and reports back. It holds no database credentials: it receives signed upload
URLs and reports through the API.

## 7. Errors and logging

- Structured JSON logs with `request_id`, `user_id` (never email), `module`, `duration_ms`.
- Never logged: tokens, API keys, passwords, prompt or script text, provider responses.
- Provider errors are mapped to internal codes; the raw body is stored only in the job's private
  error record, visible to admins with the right permission.
- Error tracking service: to be chosen (see `external-dependencies.md`).

## 8. Testing

| Level       | Tooling                     | Covers                                                                           |
| ----------- | --------------------------- | -------------------------------------------------------------------------------- |
| Unit        | pytest                      | Services with fake repositories and fake providers                               |
| Integration | pytest + local PostgreSQL   | Repositories against the real migrations                                         |
| Security    | pytest                      | Missing token, wrong signature, expired, wrong owner, wrong role; every endpoint |
| Contract    | OpenAPI snapshot            | Unplanned API changes fail the build                                             |
| Providers   | Recorded responses          | Adapters, without spending money                                                 |
| End to end  | Existing Playwright scripts | Extended as features land                                                        |

CI (GitHub Actions) runs lint, types, tests and the existing frontend checks on every push. Not
set up yet.

## 9. Docker

| Image      | Base                | Contains                                        |
| ---------- | ------------------- | ----------------------------------------------- |
| `api`      | `python:3.12-slim`  | App, uvicorn; non-root user; health check       |
| `worker`   | Same image as `api` | Plus FFmpeg; started with the Celery entrypoint |
| `renderer` | `node:22-slim`      | Remotion, headless Chromium, fonts              |
| `redis`    | Official image      | Persistence on; password required               |

Multi-stage builds, pinned versions, no secrets in images.

## 10. Environment variables

| Variable                                      | Service               | Secret | Notes                                                                                   |
| --------------------------------------------- | --------------------- | ------ | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                    | Next.js               | No     | Existing                                                                                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`        | Next.js               | No     | Existing                                                                                |
| `API_BASE_URL`                                | Next.js server        | No     | Where the Python API lives                                                              |
| `SUPABASE_URL`                                | api, worker           | No     | For JWKS and Auth admin calls                                                           |
| `DATABASE_URL_APP`                            | api                   | Yes    | Pooler connection for user-scoped work                                                  |
| `DATABASE_URL_SERVICE`                        | api, worker           | Yes    | Dedicated backend role                                                                  |
| `SUPABASE_SECRET_KEY`                         | api only              | Yes    | Only for Auth admin actions (suspend, list users)                                       |
| `REDIS_URL`                                   | api, worker, renderer | Yes    |                                                                                         |
| `STORAGE_*`                                   | api, worker           | Yes    | Bucket credentials                                                                      |
| `SECRETS_ENCRYPTION_KEY`                      | api, worker           | Yes    | Encrypts provider keys at rest                                                          |
| Provider keys                                 | —                     | —      | Stored encrypted in the database, managed in the admin panel; not environment variables |
| `ENVIRONMENT`, `LOG_LEVEL`, `ALLOWED_ORIGINS` | all                   | No     |                                                                                         |

Rules: nothing secret has a `NEXT_PUBLIC_` prefix; local values live in untracked `.env` files;
production values live in the host's secret store; each service gets only what it needs.

## 11. What stays in Next.js

Sign-up, log-in, log-out, password reset, the email callback, session cookies, and page
rendering. Supabase Auth already does this work; rebuilding it in Python would add risk and no
benefit. Python is the system of record for everything that costs money, runs long, or needs
admin authority.
