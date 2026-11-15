-- Database checks for migration 0008 (guest search limit). Run by
-- validate-migrations.sh on a throwaway local PostgreSQL. Each check raises an
-- exception on failure, which stops the run.

do $$
declare
  g  constant text := repeat('a', 64);
  g2 constant text := repeat('b', 64);
  ip constant text := repeat('c', 64);
  r jsonb; n int; i int;
  rid uuid := gen_random_uuid();
begin
  -- 1. Three searches are allowed, the fourth is not.
  r := consume_guest_search(g, gen_random_uuid(), ip);
  if not (r->>'allowed')::boolean or (r->>'remaining')::int <> 2 then raise exception 'search 1: %', r; end if;
  r := consume_guest_search(g, rid, ip);
  if not (r->>'allowed')::boolean or (r->>'remaining')::int <> 1 then raise exception 'search 2: %', r; end if;

  -- 2. The same request ID again uses nothing and returns the first answer.
  r := consume_guest_search(g, rid, ip);
  if not (r->>'allowed')::boolean or (r->>'remaining')::int <> 1 or not (r->>'replayed')::boolean then
    raise exception 'replay: %', r; end if;

  r := consume_guest_search(g, gen_random_uuid(), ip);
  if not (r->>'allowed')::boolean or (r->>'remaining')::int <> 0 then raise exception 'search 3: %', r; end if;
  rid := gen_random_uuid();
  r := consume_guest_search(g, rid, ip);
  if (r->>'allowed')::boolean or r->>'code' <> 'GUEST_SEARCH_LIMIT_REACHED' or (r->>'remaining')::int <> 0 then
    raise exception 'search 4 was not blocked: %', r; end if;
  r := consume_guest_search(g, rid, ip);
  if (r->>'allowed')::boolean or not (r->>'replayed')::boolean then raise exception 'blocked replay: %', r; end if;
  select search_count into n from guest_search_usage where guest_hash = g;
  if n <> 3 then raise exception 'count is %, expected 3', n; end if;

  -- 3. reset_at is the next UTC midnight; status reads without using a search.
  if (r->>'reset_at')::timestamptz <> (((now() at time zone 'utc')::date + 1)::timestamp at time zone 'utc') then
    raise exception 'reset_at: %', r->>'reset_at'; end if;
  r := guest_search_status(g);
  if (r->>'used')::int <> 3 or (r->>'remaining')::int <> 0 then raise exception 'status: %', r; end if;
  r := guest_search_status(g2);
  if (r->>'used')::int <> 0 or (r->>'remaining')::int <> 3 then raise exception 'status of a new guest: %', r; end if;
  select count(*) into n from guest_search_usage where guest_hash = g2;
  if n <> 0 then raise exception 'status created a row'; end if;

  -- 4. Another guest has their own allowance.
  r := consume_guest_search(g2, gen_random_uuid(), ip);
  if not (r->>'allowed')::boolean or (r->>'remaining')::int <> 2 then raise exception 'second guest: %', r; end if;

  -- 5. A new UTC day gives three searches again (yesterday's row stays at 3).
  update guest_search_usage set usage_date = usage_date - 1 where guest_hash = g;
  update guest_search_requests set usage_date = usage_date - 1 where guest_hash = g;
  r := consume_guest_search(g, rid, ip);  -- yesterday's blocked request ID, retried today
  if not (r->>'allowed')::boolean or (r->>'remaining')::int <> 2 or (r->>'replayed')::boolean then
    raise exception 'new day: %', r; end if;

  -- 6. The count can never be stored above 3.
  begin
    update guest_search_usage set search_count = 4 where guest_hash = g;
    raise exception 'count above 3 was stored';
  exception when check_violation then null; end;

  -- 7. Bad input is refused.
  begin perform consume_guest_search('not-a-hash', gen_random_uuid(), null); raise exception 'bad hash accepted';
  exception when invalid_parameter_value then null; end;
  begin perform consume_guest_search(g, null, null); raise exception 'null request id accepted';
  exception when invalid_parameter_value then null; end;

  -- 8. Address cap: after 60 accepted searches from one address the next guest is
  --    throttled, nothing is used, and other addresses are unaffected.
  delete from guest_search_ip_usage;
  for i in 1..20 loop
    perform consume_guest_search(md5(i::text) || md5('x' || i), gen_random_uuid(), ip);
    perform consume_guest_search(md5(i::text) || md5('x' || i), gen_random_uuid(), ip);
    perform consume_guest_search(md5(i::text) || md5('x' || i), gen_random_uuid(), ip);
  end loop;
  r := consume_guest_search(repeat('d', 64), gen_random_uuid(), ip);
  if (r->>'allowed')::boolean or r->>'code' <> 'GUEST_SEARCH_RATE_LIMITED' or (r->>'used')::int <> 0 then
    raise exception 'address cap: %', r; end if;
  r := consume_guest_search(repeat('d', 64), gen_random_uuid(), repeat('e', 64));
  if not (r->>'allowed')::boolean then raise exception 'other address was blocked: %', r; end if;

  -- 9. Browser roles cannot touch the tables or call the functions.
  set local role anon;
  begin select count(*) into n from guest_search_usage; raise exception 'anon read usage';
  exception when insufficient_privilege then null; end;
  begin insert into guest_search_usage (guest_hash, usage_date) values (repeat('f', 64), current_date); raise exception 'anon wrote usage';
  exception when insufficient_privilege then null; end;
  begin select count(*) into n from guest_search_requests; raise exception 'anon read requests';
  exception when insufficient_privilege then null; end;
  begin perform consume_guest_search(repeat('f', 64), gen_random_uuid(), null); raise exception 'anon called consume';
  exception when insufficient_privilege then null; end;
  begin perform guest_search_status(repeat('f', 64)); raise exception 'anon called status';
  exception when insufficient_privilege then null; end;
  set local role authenticated;
  begin select count(*) into n from guest_search_usage; raise exception 'authenticated read usage';
  exception when insufficient_privilege then null; end;
  begin update guest_search_usage set search_count = 0; raise exception 'authenticated wrote usage';
  exception when insufficient_privilege then null; end;
  begin perform consume_guest_search(repeat('f', 64), gen_random_uuid(), null); raise exception 'authenticated called consume';
  exception when insufficient_privilege then null; end;

  -- 10. The server role can call the functions.
  set local role service_role;
  r := consume_guest_search(repeat('f', 64), gen_random_uuid(), null);
  if not (r->>'allowed')::boolean then raise exception 'service_role could not consume: %', r; end if;
  reset role;

  -- 11. No query text is stored anywhere.
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name like 'guest_search%'
     and (column_name ~ 'query|term|text|keyword' or column_name = 'q');
  if n <> 0 then raise exception 'a guest_search table has a text column'; end if;

  raise notice 'guest search limit: 11 groups of checks passed';
end $$;
