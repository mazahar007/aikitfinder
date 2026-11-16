-- Staff roles, permissions and the admin audit log (Central Admin Panel foundation).
--
-- NOT applied anywhere yet. Additive: no existing table, policy or row is
-- changed. Ordinary accounts are unaffected: a user without a row in
-- `user_roles` is an ordinary user, exactly as today.
--
-- Security model
--   * Roles live in their own table. Browser roles have no privileges on it at
--     all, so nobody can read or change a role directly, including their own.
--   * Roles are looked up in the database on every request; they are never
--     taken from the session token, so removing a role takes effect at once.
--   * Every change goes through a function that checks the caller's permission
--     and writes the audit log in the same transaction.
--   * The audit log is append-only for everyone.
--   * There is no admin sign-up. The first Super Admin is created once, by a
--     function that only the database owner can run (see the end of this file
--     and docs/phase-2/admin-implementation.md).

create type platform_role as enum ('super_admin', 'admin', 'editor', 'support', 'finance');

-- Roles ---------------------------------------------------------------------------

create table user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       platform_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now()
);

create table role_permissions (
  role       platform_role not null,
  permission text not null check (permission ~ '^[a-z]+(\.[a-z]+)+$'),
  primary key (role, permission)
);

insert into role_permissions (role, permission)
select r.role::platform_role, p.permission
from (values
  ('admin.access',             array['super_admin','admin','editor','support','finance']),
  ('users.read',               array['super_admin','admin','support','finance']),
  ('users.suspend',            array['super_admin','admin']),
  ('roles.read',               array['super_admin','admin']),
  ('roles.grant',              array['super_admin']),
  ('catalog.write',            array['super_admin','admin','editor']),
  ('content.write',            array['super_admin','admin','editor']),
  ('projects.status.read',     array['super_admin','admin','support']),
  ('jobs.read',                array['super_admin','admin','support','finance']),
  ('integrations.read',        array['super_admin','admin','finance']),
  ('integrations.configure',   array['super_admin','admin']),
  ('integrations.secrets.write', array['super_admin']),
  ('billing.read',             array['super_admin','admin','support','finance']),
  ('billing.manage',           array['super_admin','finance']),
  ('settings.write',           array['super_admin','admin']),
  ('audit.read',               array['super_admin','admin'])
) as p(permission, roles)
cross join lateral unnest(p.roles) as r(role);

-- Audit log -------------------------------------------------------------------------

create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_role  platform_role,
  action      text not null check (char_length(action) between 1 and 80),
  target_type text,
  target_id   text,
  -- What changed, in words and non-secret values. Never a credential.
  summary     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_log_created_idx on audit_log (created_at desc);
create index audit_log_actor_idx on audit_log (actor_id, created_at desc);

create or replace function audit_log_is_append_only() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'the audit log cannot be changed' using errcode = '42501';
end;
$$;
create trigger audit_log_no_update before update or delete on audit_log
  for each row execute function audit_log_is_append_only();
create trigger audit_log_no_truncate before truncate on audit_log
  for each statement execute function audit_log_is_append_only();

-- Lookups -----------------------------------------------------------------------------

-- The caller's own staff role, or null. The only way a client learns a role.
create or replace function current_platform_role() returns platform_role
language sql stable security definer set search_path = public, pg_temp as $$
  select role from user_roles where user_id = (select auth.uid());
$$;

create or replace function has_permission(p_permission text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from user_roles ur
    join role_permissions rp on rp.role = ur.role
    where ur.user_id = (select auth.uid()) and rp.permission = p_permission
  );
$$;

-- The caller's permissions, for showing the right navigation. Authority is
-- still checked by every function that does something.
create or replace function my_permissions() returns setof text
language sql stable security definer set search_path = public, pg_temp as $$
  select rp.permission from user_roles ur
  join role_permissions rp on rp.role = ur.role
  where ur.user_id = (select auth.uid())
  order by 1;
$$;

-- Raises unless the caller holds the permission. Used by every admin function.
create or replace function require_permission(p_permission text) returns void
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if (select auth.uid()) is null or not has_permission(p_permission) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
end;
$$;

-- Internal: one audit entry for the current caller.
create or replace function write_audit(
  p_action text, p_target_type text, p_target_id text, p_summary jsonb
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into audit_log (actor_id, actor_role, action, target_type, target_id, summary)
  values ((select auth.uid()), current_platform_role(), p_action, p_target_type, p_target_id,
          coalesce(p_summary, '{}'::jsonb));
end;
$$;

-- Role changes --------------------------------------------------------------------------

create or replace function grant_role(p_user_id uuid, p_role platform_role) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_actor uuid := (select auth.uid());
  v_previous platform_role;
begin
  perform require_permission('roles.grant');
  if p_user_id is null or p_role is null then
    raise exception 'a user and a role are required' using errcode = '22023';
  end if;
  if p_user_id = v_actor then
    raise exception 'you cannot change your own role' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id and email_confirmed_at is not null) then
    raise exception 'no confirmed account with that ID' using errcode = '22023';
  end if;

  select role into v_previous from user_roles where user_id = p_user_id for update;
  -- The platform must always keep at least one Super Admin.
  if v_previous = 'super_admin' and p_role <> 'super_admin'
     and (select count(*) from user_roles where role = 'super_admin') <= 1 then
    raise exception 'the last Super Admin cannot be changed' using errcode = '42501';
  end if;

  insert into user_roles (user_id, role, granted_by) values (p_user_id, p_role, v_actor)
  on conflict (user_id) do update
    set role = excluded.role, granted_by = excluded.granted_by, granted_at = now();
  perform write_audit('role.granted', 'user', p_user_id::text,
    jsonb_build_object('role', p_role, 'previous_role', v_previous));
end;
$$;

create or replace function revoke_role(p_user_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_actor uuid := (select auth.uid());
  v_previous platform_role;
begin
  perform require_permission('roles.grant');
  if p_user_id = v_actor then
    raise exception 'you cannot change your own role' using errcode = '42501';
  end if;
  select role into v_previous from user_roles where user_id = p_user_id for update;
  if v_previous is null then return; end if;
  if v_previous = 'super_admin'
     and (select count(*) from user_roles where role = 'super_admin') <= 1 then
    raise exception 'the last Super Admin cannot be removed' using errcode = '42501';
  end if;
  delete from user_roles where user_id = p_user_id;
  perform write_audit('role.revoked', 'user', p_user_id::text,
    jsonb_build_object('previous_role', v_previous));
end;
$$;

-- Admin reads (aggregates and lists; no private user content) ---------------------------

create or replace function admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('admin.access');
  return jsonb_build_object(
    'users_total',      (select count(*) from auth.users),
    'users_active_30d', (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days'),
    'users_new_7d',     (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'staff',            (select count(*) from user_roles),
    'tools_total',      (select count(*) from tools),
    'tools_published',  (select count(*) from tools where status = 'published'),
    'categories',       (select count(*) from categories),
    'projects_total',   (select count(*) from autoflow_projects),
    'generated_at',     now()
  );
end;
$$;

create or replace function admin_list_users(
  p_search text default null, p_limit integer default 50, p_offset integer default 0
) returns table (
  id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz,
  confirmed boolean, role platform_role, display_name text
)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('users.read');
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at,
           u.email_confirmed_at is not null, ur.role, p.display_name
    from auth.users u
    left join user_roles ur on ur.user_id = u.id
    left join profiles p on p.id = u.id
    where p_search is null or p_search = ''
       or u.email ilike '%' || replace(replace(p_search, '%', '\%'), '_', '\_') || '%'
       or u.id::text = p_search
    order by u.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 100)
    offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

create or replace function admin_list_staff() returns table (
  user_id uuid, email text, role platform_role, granted_at timestamptz, granted_by_email text
)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('roles.read');
  return query
    select ur.user_id, u.email::text, ur.role, ur.granted_at, g.email::text
    from user_roles ur
    join auth.users u on u.id = ur.user_id
    left join auth.users g on g.id = ur.granted_by
    order by ur.granted_at;
end;
$$;

create or replace function admin_role_matrix() returns table (role platform_role, permission text)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('roles.read');
  return query select rp.role, rp.permission from role_permissions rp order by 2, 1;
end;
$$;

create or replace function admin_list_audit(p_limit integer default 100, p_before bigint default null)
returns table (
  id bigint, created_at timestamptz, actor_email text, actor_role platform_role,
  action text, target_type text, target_id text, summary jsonb
)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('audit.read');
  return query
    select a.id, a.created_at, u.email::text, a.actor_role, a.action, a.target_type, a.target_id, a.summary
    from audit_log a left join auth.users u on u.id = a.actor_id
    where p_before is null or a.id < p_before
    order by a.id desc
    limit least(greatest(coalesce(p_limit, 100), 1), 200);
end;
$$;

-- First Super Admin ---------------------------------------------------------------------
--
-- Run once, by the database owner, from the Supabase SQL editor or the
-- Management API. Not executable by any application role, so it cannot be
-- reached from the website. It refuses once a Super Admin exists; calling it
-- again for the same account changes nothing.

create or replace function bootstrap_first_super_admin(p_user_id uuid) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_existing uuid;
begin
  -- One bootstrap at a time.
  perform pg_advisory_xact_lock(hashtextextended('akf.bootstrap_first_super_admin', 0));
  select user_id into v_existing from user_roles where role = 'super_admin' limit 1;
  if v_existing is not null then
    if v_existing = p_user_id then return 'already initialized: this account is the Super Admin'; end if;
    raise exception 'bootstrap is closed: a Super Admin already exists' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id and email_confirmed_at is not null) then
    raise exception 'no confirmed account with that ID' using errcode = '22023';
  end if;
  if not exists (select 1 from profiles where id = p_user_id) then
    raise exception 'that account has no profile' using errcode = '22023';
  end if;

  insert into user_roles (user_id, role, granted_by) values (p_user_id, 'super_admin', null);
  insert into audit_log (actor_id, actor_role, action, target_type, target_id, summary)
  values (null, null, 'bootstrap.super_admin', 'user', p_user_id::text,
          jsonb_build_object('role', 'super_admin', 'method', 'owner bootstrap, run by the database owner'));
  return 'initialized: first Super Admin created';
end;
$$;

-- Access -------------------------------------------------------------------------------

alter table user_roles       enable row level security;
alter table role_permissions enable row level security;
alter table audit_log        enable row level security;

-- No policies, and no table privileges for browser roles: these tables are
-- reached only through the functions above.
revoke all on user_roles, role_permissions, audit_log from anon, authenticated;

-- Internal helpers and the bootstrap are not callable by application roles.
revoke execute on function write_audit(text, text, text, jsonb) from public, anon, authenticated, service_role;
revoke execute on function audit_log_is_append_only() from public, anon, authenticated;
revoke execute on function bootstrap_first_super_admin(uuid) from public, anon, authenticated, service_role;

-- Everything else: signed-in users only (each function checks its permission).
do $$
declare f text;
begin
  foreach f in array array[
    'current_platform_role()', 'has_permission(text)', 'my_permissions()', 'require_permission(text)',
    'grant_role(uuid, platform_role)', 'revoke_role(uuid)', 'admin_overview()',
    'admin_list_users(text, integer, integer)', 'admin_list_staff()', 'admin_role_matrix()',
    'admin_list_audit(integer, bigint)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
