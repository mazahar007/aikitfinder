#!/usr/bin/env bash
# End-to-end checks for the guest search limit, with every quota write going
# to a throwaway LOCAL PostgreSQL. Nothing is written to the production
# database's guest-search tables (they need not even exist there).
#
# It starts: a temporary PostgreSQL with all migrations, a local gateway that
# stands in for Supabase's REST endpoint for the two quota functions, and the
# build of the app pointed at that gateway. The gateway also stands in for
# Supabase Auth, so the sign-in checks use a local test account and nothing is
# created in the real project.
#
# The app is rebuilt for the local gateway. Run `pnpm build` afterwards to
# restore the normal build.
#
#   scripts/qa/guest-search-check.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
DIR="$(mktemp -d)"
PGPORT_LOCAL="${PGPORT_LOCAL:-54331}"
GATEWAY_PORT="${GATEWAY_PORT:-54400}"
APP_PORT="${APP_PORT:-3112}"
RUNAS=""
if [ "$(id -u)" = "0" ]; then RUNAS="runuser -u postgres --"; chown postgres "$DIR"; fi
# Random per run; these protect nothing real.
TEST_KEY="test-$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')"
TEST_SECRET="$(head -c 48 /dev/urandom | od -An -tx1 | tr -d ' \n')"
SERVER_LOG="$DIR/server.log"

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
# One local account for the sign-in checks.
$RUNAS $PSQL -c "insert into auth.users (id, email, email_confirmed_at) values ('20000000-0000-4000-8000-000000000001', 'searcher@local.test', now())"
echo "local database ready (migrations 0001-$(ls "$ROOT"/supabase/migrations | tail -1 | cut -c1-4))"

# shellcheck disable=SC2086
node "$ROOT/scripts/qa/local-rpc-gateway.cjs" "$GATEWAY_PORT" "$TEST_KEY" -- $RUNAS $PSQL >/dev/null &
GW_PID=$!

cd "$ROOT"
export NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:$GATEWAY_PORT" NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="local-publishable-key"
pnpm build >"$DIR/build.log" 2>&1 || { tail -20 "$DIR/build.log"; exit 1; }
pkill -f "next-server" 2>/dev/null || true
SUPABASE_SERVICE_URL="http://127.0.0.1:$GATEWAY_PORT" SUPABASE_SECRET_KEY="$TEST_KEY" \
  GUEST_SEARCH_SECRET="$TEST_SECRET" PORT="$APP_PORT" pnpm start >"$SERVER_LOG" 2>&1 &
APP_PID=$!
for _ in $(seq 1 40); do curl -s -o /dev/null "localhost:$APP_PORT/" && break; sleep 1; done

BASE="http://localhost:$APP_PORT" GATEWAY="http://127.0.0.1:$GATEWAY_PORT" SERVER_LOG="$SERVER_LOG" \
  TEST_KEY="$TEST_KEY" TEST_SECRET="$TEST_SECRET" \
  QA_LOCAL_EMAIL="searcher@local.test" QA_LOCAL_PASSWORD="local-test-password" node "$ROOT/scripts/qa/guest-search-check.cjs"
