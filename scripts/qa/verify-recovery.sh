#!/usr/bin/env bash
# Proves the recovery path on a throwaway local PostgreSQL:
#   1. a logical snapshot restores into a database built from the migrations,
#      with the same row fingerprints as the source;
#   2. migrations 0008-0010 apply on top of that data without changing it;
#   3. the rollback scripts return the database to its exact earlier shape.
#
#   scripts/qa/verify-recovery.sh <snapshot.json>
set -euo pipefail
SNAP="$1"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
DIR="$(mktemp -d)"; PORT=54333; RUNAS=""
if [ "$(id -u)" = "0" ]; then RUNAS="runuser -u postgres --"; chown postgres "$DIR"; fi
trap '$RUNAS "$PGBIN/pg_ctl" -D "$DIR/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
$RUNAS "$PGBIN/initdb" -D "$DIR/data" -U postgres -A trust >/dev/null
$RUNAS "$PGBIN/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR -c listen_addresses=''" -w start >/dev/null
PSQL="$RUNAS $PGBIN/psql -X -q -At -v ON_ERROR_STOP=1 -h $DIR -p $PORT -U postgres -d postgres"
$PSQL <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema supabase_migrations;
create table supabase_migrations.schema_migrations (version text primary key, statements text[], name text);
create table auth.users (id uuid primary key default gen_random_uuid(), email text,
  email_confirmed_at timestamptz, last_sign_in_at timestamptz, created_at timestamptz not null default now());
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
SQL
for v in 0001 0002 0003 0004 0005 0006 0007; do
  $PSQL -f "$ROOT"/supabase/migrations/${v}_*.sql >/dev/null
  $PSQL -c "insert into supabase_migrations.schema_migrations (version) values ('$v')"
done
cp "$SNAP" "$DIR/snap.json"; chmod 644 "$DIR/snap.json"

# 1. Restore the snapshot. The account trigger is off so restored rows keep their own IDs.
$PSQL -v snap="$DIR/snap.json" <<'SQL'
\set content `cat :snap`
create temp table s as select :'content'::jsonb as j;
alter table auth.users disable trigger on_auth_user_created;
insert into auth.users (id, email, email_confirmed_at, last_sign_in_at, created_at)
  select (u->>'id')::uuid, u->>'email', (u->>'email_confirmed_at')::timestamptz, (u->>'last_sign_in_at')::timestamptz, (u->>'created_at')::timestamptz
  from s, jsonb_array_elements(j->'auth_users') u;
alter table auth.users enable trigger on_auth_user_created;
insert into public.profiles select (jsonb_populate_record(null::public.profiles, p)).* from s, jsonb_array_elements(j->'profiles') p;
insert into public.workspaces select (jsonb_populate_record(null::public.workspaces, w)).* from s, jsonb_array_elements(j->'workspaces') w;
SQL
fp() { $PSQL -c "select md5(coalesce(string_agg(p::text, ',' order by p.id), '')) from public.profiles p" -c "select md5(coalesce(string_agg(w::text, ',' order by w.id), '')) from public.workspaces w" | tr '\n' ' '; }
shape() { $PSQL -c "select (select count(*) from pg_tables where schemaname='public') || ' tables, ' || (select count(*) from pg_policies where schemaname='public') || ' policies, ' || (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public') || ' functions, ' || (select count(*) from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and typtype='e') || ' enums, migrations ' || (select string_agg(version, ',' order by version) from supabase_migrations.schema_migrations)"; }
WANT="$(python3 -c "import json,sys; f=json.load(open(sys.argv[1]))['fingerprints']; print(f['profiles'], f['workspaces'], end=' ')" "$SNAP")"
RESTORED="$(fp)"; BASE="$(shape)"
echo "restored fingerprints : $RESTORED"
echo "source fingerprints   : $WANT"
[ "$RESTORED" = "$WANT" ] || { echo "RESTORE MISMATCH"; exit 1; }
echo "1. PASS  snapshot restores with identical profile and workspace rows"
echo "   shape before: $BASE"

# 2. Apply 0008-0010 on top of the restored data.
for v in 0008 0009 0010; do
  $PSQL -f "$ROOT"/supabase/migrations/${v}_*.sql >/dev/null
  $PSQL -c "insert into supabase_migrations.schema_migrations (version) values ('$v')"
done
[ "$(fp)" = "$WANT" ] || { echo "DATA CHANGED BY MIGRATIONS"; exit 1; }
echo "2. PASS  migrations 0008-0010 apply; existing rows are byte-for-byte unchanged"
echo "   shape after : $(shape)"
OWNER="$($PSQL -c "select id from auth.users limit 1")"
$PSQL -c "select bootstrap_first_super_admin('$OWNER')" >/dev/null
[ "$(fp)" = "$WANT" ] || { echo "DATA CHANGED BY BOOTSTRAP"; exit 1; }
echo "   PASS  owner bootstrap adds a role without changing the profile or workspaces"

# 3. Roll back in reverse order.
for v in 0010 0009 0008; do $PSQL -f "$ROOT"/supabase/rollback/${v}_*.down.sql >/dev/null; done
AFTER="$(shape)"
echo "   shape rolled back: $AFTER"
[ "$AFTER" = "$BASE" ] || { echo "ROLLBACK DID NOT RESTORE THE SHAPE"; exit 1; }
[ "$(fp)" = "$WANT" ] || { echo "DATA CHANGED BY ROLLBACK"; exit 1; }
echo "3. PASS  rollback returns the database to its earlier shape with the same rows"
echo "RECOVERY PATH VERIFIED"
