#!/usr/bin/env bash
# Applies every migration to a throwaway local PostgreSQL cluster and checks
# the account/workspace security rules. Touches no real database.
#
# Needs PostgreSQL 16 binaries (initdb, pg_ctl, psql). Usage:
#   scripts/qa/validate-migrations.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
DIR="$(mktemp -d)"
PORT="${PGPORT:-54329}"
RUNAS=""
# PostgreSQL refuses to run as root; use the postgres user when we are root.
if [ "$(id -u)" = "0" ]; then RUNAS="runuser -u postgres --"; chown postgres "$DIR"; fi

cleanup() { $RUNAS "$PGBIN/pg_ctl" -D "$DIR/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$DIR"; }
trap cleanup EXIT

$RUNAS "$PGBIN/initdb" -D "$DIR/data" -U postgres -A trust >/dev/null
$RUNAS "$PGBIN/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR -c listen_addresses=''" -w start >/dev/null
PSQL="$RUNAS $PGBIN/psql -X -q -v ON_ERROR_STOP=1 -h $DIR -p $PORT -U postgres"

# Stand-in for what Supabase provides: the auth schema, auth.uid() and the two roles.
$PSQL -d postgres <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text,
  email_confirmed_at timestamptz, last_sign_in_at timestamptz, created_at timestamptz not null default now());
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
-- Supabase's defaults: both roles get every privilege on new public objects.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
SQL

for f in "$ROOT"/supabase/migrations/*.sql; do
  $PSQL -d postgres -f "$f" >/dev/null
  echo "applied $(basename "$f")"
done

$PSQL -d postgres -f "$ROOT/scripts/qa/accounts-rls-test.sql"
$PSQL -d postgres -f "$ROOT/scripts/qa/guest-search-test.sql"
$PSQL -d postgres -f "$ROOT/scripts/qa/admin-rbac-test.sql"
$PSQL -d postgres -f "$ROOT/scripts/qa/catalog-admin-test.sql"
echo "ALL MIGRATION CHECKS PASSED"
