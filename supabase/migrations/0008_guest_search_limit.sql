-- Daily guest search limit for the public AI Tools Directory ("3 Free Searches").
--
-- A visitor without an account gets 3 searches per UTC calendar day. The app
-- server identifies a guest by a signed, HttpOnly cookie and passes only a
-- derived hash here; the raw identifier never reaches the database.
--
-- These tables are a counter, not a search history: no query text is stored.
--
-- Security model: row level security is on and there are NO policies, so no
-- browser role can read or write these tables. They are reached only through
-- the two functions below, which only the server-side `service_role` may
-- execute. Additive: nothing existing is changed.

-- One row per guest per UTC day ---------------------------------------------------

create table guest_search_usage (
  id           uuid primary key default gen_random_uuid(),
  guest_hash   text not null check (guest_hash ~ '^[0-9a-f]{64}$'),
  usage_date   date not null,
  search_count smallint not null default 0 check (search_count between 0 and 3),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Also the lookup index for (guest_hash, usage_date).
  constraint guest_search_usage_guest_day unique (guest_hash, usage_date)
);
create index guest_search_usage_date_idx on guest_search_usage (usage_date);
create trigger guest_search_usage_updated_at
  before update on guest_search_usage
  for each row execute function set_updated_at();

-- Processed request IDs, so a retried request cannot use another search -------------

create table guest_search_requests (
  guest_hash text not null check (guest_hash ~ '^[0-9a-f]{64}$'),
  request_id uuid not null,
  usage_date date not null,
  allowed    boolean not null,
  used       smallint not null check (used between 0 and 3),
  created_at timestamptz not null default now(),
  primary key (guest_hash, request_id)
);
create index guest_search_requests_date_idx on guest_search_requests (usage_date);

-- Accepted guest searches per network address per day (abuse control) ----------------
-- Holds a keyed hash of the address, never the address itself.

create table guest_search_ip_usage (
  ip_hash      text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  usage_date   date not null,
  search_count integer not null default 0 check (search_count >= 0),
  primary key (ip_hash, usage_date)
);
create index guest_search_ip_usage_date_idx on guest_search_ip_usage (usage_date);

-- Use one search, atomically ------------------------------------------------------
--
-- Returns jsonb:
--   allowed    boolean   whether the search may run
--   code       text      null, 'GUEST_SEARCH_LIMIT_REACHED' or 'GUEST_SEARCH_RATE_LIMITED'
--   limit      int       3
--   used       int       searches used today, after this call
--   remaining  int
--   reset_at   timestamptz  the next UTC midnight
--   replayed   boolean   true when this request ID was already processed today
--
-- The date comes from the database clock. The increment is a single
-- conditional upsert, so concurrent calls can never take the count past 3; a
-- per-guest transaction lock additionally makes the request-ID check and the
-- increment one step.

create or replace function consume_guest_search(
  p_guest_hash text,
  p_request_id uuid,
  p_ip_hash    text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  c_limit        constant smallint := 3;
  -- 20 full guest allowances per address per day. Generous for shared
  -- networks; it resets with the day and never blocks an address for longer.
  c_ip_daily_cap constant integer := 60;
  v_today    date := (now() at time zone 'utc')::date;
  v_reset_at timestamptz := ((v_today + 1)::timestamp at time zone 'utc');
  v_prior    guest_search_requests%rowtype;
  v_count    smallint;
  v_ip_count integer;
  v_allowed  boolean;
begin
  if p_guest_hash is null or p_guest_hash !~ '^[0-9a-f]{64}$' or p_request_id is null
     or (p_ip_hash is not null and p_ip_hash !~ '^[0-9a-f]{64}$') then
    raise exception 'invalid arguments' using errcode = '22023';
  end if;

  -- Serialize calls for the same guest for the rest of this transaction.
  perform pg_advisory_xact_lock(hashtextextended(p_guest_hash, 0));

  -- A request already processed today returns its first answer and uses nothing.
  select * into v_prior from guest_search_requests
   where guest_hash = p_guest_hash and request_id = p_request_id and usage_date = v_today;
  if found then
    return jsonb_build_object(
      'allowed', v_prior.allowed,
      'code', case when v_prior.allowed then null else 'GUEST_SEARCH_LIMIT_REACHED' end,
      'limit', c_limit, 'used', v_prior.used, 'remaining', c_limit - v_prior.used,
      'reset_at', v_reset_at, 'replayed', true);
  end if;

  -- Abuse control: too many accepted guest searches from one address today.
  -- Checked before anything is used, and not recorded, so the same request
  -- can succeed later.
  if p_ip_hash is not null then
    select search_count into v_ip_count from guest_search_ip_usage
     where ip_hash = p_ip_hash and usage_date = v_today;
    if coalesce(v_ip_count, 0) >= c_ip_daily_cap then
      select search_count into v_count from guest_search_usage
       where guest_hash = p_guest_hash and usage_date = v_today;
      v_count := coalesce(v_count, 0);
      return jsonb_build_object(
        'allowed', false, 'code', 'GUEST_SEARCH_RATE_LIMITED',
        'limit', c_limit, 'used', v_count, 'remaining', c_limit - v_count,
        'reset_at', v_reset_at, 'replayed', false);
    end if;
  end if;

  -- The increment: one statement, only while the count is below the limit.
  insert into guest_search_usage as u (guest_hash, usage_date, search_count)
  values (p_guest_hash, v_today, 1)
  on conflict (guest_hash, usage_date) do update
    set search_count = u.search_count + 1
    where u.search_count < c_limit
  returning u.search_count into v_count;

  v_allowed := v_count is not null;
  if not v_allowed then
    v_count := c_limit;
  elsif p_ip_hash is not null then
    insert into guest_search_ip_usage as i (ip_hash, usage_date, search_count)
    values (p_ip_hash, v_today, 1)
    on conflict (ip_hash, usage_date) do update set search_count = i.search_count + 1;
  end if;

  insert into guest_search_requests (guest_hash, request_id, usage_date, allowed, used)
  values (p_guest_hash, p_request_id, v_today, v_allowed, v_count)
  on conflict (guest_hash, request_id) do update
    set usage_date = excluded.usage_date, allowed = excluded.allowed,
        used = excluded.used, created_at = now();

  -- Housekeeping: nothing here is needed once its day has passed.
  delete from guest_search_requests where usage_date < v_today - 1;
  delete from guest_search_usage    where usage_date < v_today - 7;
  delete from guest_search_ip_usage where usage_date < v_today - 7;

  return jsonb_build_object(
    'allowed', v_allowed,
    'code', case when v_allowed then null else 'GUEST_SEARCH_LIMIT_REACHED' end,
    'limit', c_limit, 'used', v_count, 'remaining', c_limit - v_count,
    'reset_at', v_reset_at, 'replayed', false);
end;
$$;

-- Read today's usage without using a search (for the counter) -------------------------

create or replace function guest_search_status(p_guest_hash text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  c_limit constant smallint := 3;
  v_today date := (now() at time zone 'utc')::date;
  v_count smallint;
begin
  if p_guest_hash is not null and p_guest_hash ~ '^[0-9a-f]{64}$' then
    select search_count into v_count from guest_search_usage
     where guest_hash = p_guest_hash and usage_date = v_today;
  end if;
  v_count := coalesce(v_count, 0);
  return jsonb_build_object(
    'limit', c_limit, 'used', v_count, 'remaining', c_limit - v_count,
    'reset_at', ((v_today + 1)::timestamp at time zone 'utc'));
end;
$$;

-- Access --------------------------------------------------------------------------

alter table guest_search_usage    enable row level security;
alter table guest_search_requests enable row level security;
alter table guest_search_ip_usage enable row level security;

-- No policies on purpose, and no table privileges for browser roles either.
revoke all on guest_search_usage, guest_search_requests, guest_search_ip_usage
  from anon, authenticated;

-- Only the server may call the functions.
revoke execute on function consume_guest_search(text, uuid, text) from public, anon, authenticated;
revoke execute on function guest_search_status(text) from public, anon, authenticated;
grant execute on function consume_guest_search(text, uuid, text) to service_role;
grant execute on function guest_search_status(text) to service_role;
