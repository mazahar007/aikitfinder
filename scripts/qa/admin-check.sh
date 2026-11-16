#!/usr/bin/env bash
# End-to-end checks for the Central Admin Panel, entirely local.
#
# Starts a throwaway PostgreSQL with all migrations, a local gateway that
# stands in for Supabase Auth and its REST API, and a build of the app pointed
# at that gateway. Three local test accounts are created in the throwaway
# database; the first is bootstrapped as Super Admin with the real bootstrap
# function. Nothing touches the production project.
#
# The app is rebuilt for the local gateway. Run `pnpm build` afterwards to
# restore the normal build.
#
#   scripts/qa/admin-check.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
DIR="$(mktemp -d)"
PGPORT_LOCAL="${PGPORT_LOCAL:-54332}"
GATEWAY_PORT="${GATEWAY_PORT:-54401}"
APP_PORT="${APP_PORT:-3113}"
RUNAS=""
if [ "$(id -u)" = "0" ]; then RUNAS="runuser -u postgres --"; chown postgres "$DIR"; fi
SERVER_LOG="$DIR/server.log"
GATEWAY="http://127.0.0.1:$GATEWAY_PORT"

cleanup() {
  [ -n "${APP_PID:-}" ] && kill "$APP_PID" 2>/dev/null || true
  [ -n "${GW_PID:-}" ] && kill "$GW_PID" 2>/dev/null || true
  pkill -f "next-server" 2>/dev/null || true
  $RUNAS "$PGBIN/pg_ctl" -D "$DIR/data" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$DIR"
}
trap cleanup EXIT

$RUNAS "$PGBIN/initdb" -D "$DIR/data" -U postgres -A trust >/dev/null
$RUNAS "$PGBIN/pg_ctl" -D "$DIR/data" -o "-p $PGPORT_LOCAL -k $DIR -c listen_addresses='' -c max_connections=200" -w start >/dev/null
PSQL="$PGBIN/psql -X -q -v ON_ERROR_STOP=1 -h $DIR -p $PGPORT_LOCAL -U postgres -d postgres"
$RUNAS $PSQL <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text,
  email_confirmed_at timestamptz, last_sign_in_at timestamptz, created_at timestamptz not null default now());
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
SQL
for f in "$ROOT"/supabase/migrations/*.sql; do $RUNAS $PSQL -f "$f" >/dev/null; done
# Three local accounts. The account trigger gives each a profile and two workspaces.
$RUNAS $PSQL <<'SQL'
insert into auth.users (id, email, email_confirmed_at, last_sign_in_at) values
  ('10000000-0000-4000-8000-000000000001', 'owner@local.test', now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'member@local.test', now(), now()),
  ('10000000-0000-4000-8000-000000000003', 'editor@local.test', now(), null);
select bootstrap_first_super_admin('10000000-0000-4000-8000-000000000001');
SQL
echo "local database ready (migrations 0001-$(ls "$ROOT"/supabase/migrations | tail -1 | cut -c1-4)); owner bootstrapped"

# shellcheck disable=SC2086
node "$ROOT/scripts/qa/local-rpc-gateway.cjs" "$GATEWAY_PORT" "local-test-key" -- $RUNAS $PSQL >/dev/null &
GW_PID=$!

cd "$ROOT"
export NEXT_PUBLIC_SUPABASE_URL="$GATEWAY" NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="local-test-key"
export INTEGRATIONS_ENCRYPTION_KEY="$(head -c 32 /dev/urandom | base64)"
pnpm build >"$DIR/build.log" 2>&1 || { tail -20 "$DIR/build.log"; exit 1; }
pkill -f "next-server" 2>/dev/null || true
PORT="$APP_PORT" pnpm start >"$SERVER_LOG" 2>&1 &
APP_PID=$!
for _ in $(seq 1 40); do curl -s -o /dev/null "localhost:$APP_PORT/" && break; sleep 1; done

BASE="http://localhost:$APP_PORT" GATEWAY="$GATEWAY" SERVER_LOG="$SERVER_LOG" node "$ROOT/scripts/qa/admin-check.cjs"
