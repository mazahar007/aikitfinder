-- Security checks for migrations 0009 (roles, audit log) and 0010 (integrations).
-- Run by validate-migrations.sh on a throwaway local PostgreSQL.

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-0000000000a1', 'owner@example.test', now()),
  ('00000000-0000-0000-0000-0000000000a2', 'member@example.test', now()),
  ('00000000-0000-0000-0000-0000000000a3', 'editor@example.test', now()),
  ('00000000-0000-0000-0000-0000000000a4', 'unconfirmed@example.test', null);

do $$
declare
  owner  constant uuid := '00000000-0000-0000-0000-0000000000a1';
  member constant uuid := '00000000-0000-0000-0000-0000000000a2';
  editor constant uuid := '00000000-0000-0000-0000-0000000000a3';
  unconf constant uuid := '00000000-0000-0000-0000-0000000000a4';
  good_cipher constant text := 'v1.' || repeat('A', 16) || '.' || repeat('B', 22) || '.' || repeat('C', 40);
  n int; t text; j jsonb; s integration_status;
  as_user text;
begin
  -- ---------- 1. Before bootstrap: nobody is staff, nothing is reachable ----------
  select count(*) into n from user_roles; if n <> 0 then raise exception 'roles exist before bootstrap'; end if;
  select count(*) into n from integrations; if n <> 18 then raise exception '% integrations seeded, expected 18', n; end if;
  select count(*) into n from integrations where status <> 'demo' or not is_demo or enabled;
  if n <> 0 then raise exception '% seeded integrations are not disabled demo records', n; end if;
  select count(*) into n from integration_secrets; if n <> 0 then raise exception 'a credential was seeded'; end if;
  select count(*) into n from integrations where config::text ~* '(sk-|sb_secret|AKIA|-----BEGIN)';
  if n <> 0 then raise exception 'a seeded value looks like a real credential'; end if;
  select count(*) into n from integrations where config::text ~ 'https?://' and config::text !~ '(\.example|aikitfinder\.vercel\.app)';
  if n <> 0 then raise exception 'a seeded endpoint is not a demo address'; end if;

  set local role authenticated;
  perform set_config('request.jwt.claim.sub', member::text, true);
  if current_platform_role() is not null then raise exception 'an ordinary user has a role'; end if;
  if has_permission('admin.access') then raise exception 'an ordinary user has admin.access'; end if;
  begin perform admin_overview(); raise exception 'ordinary user read the overview';
  exception when insufficient_privilege then null; end;
  begin perform admin_list_users(null, 10, 0); raise exception 'ordinary user listed users';
  exception when insufficient_privilege then null; end;
  begin perform admin_list_integrations(); raise exception 'ordinary user listed integrations';
  exception when insufficient_privilege then null; end;
  begin perform grant_role(member, 'super_admin'); raise exception 'ordinary user granted a role';
  exception when insufficient_privilege then null; end;
  -- The bootstrap is not reachable from an application role.
  begin perform bootstrap_first_super_admin(member); raise exception 'a user ran the bootstrap';
  exception when insufficient_privilege then null; end;
  -- Direct table access is closed.
  begin insert into user_roles (user_id, role) values (member, 'super_admin'); raise exception 'user wrote user_roles';
  exception when insufficient_privilege then null; end;
  begin select count(*) into n from user_roles; raise exception 'user read user_roles';
  exception when insufficient_privilege then null; end;
  begin select count(*) into n from audit_log; raise exception 'user read audit_log';
  exception when insufficient_privilege then null; end;
  begin select count(*) into n from integration_secrets; raise exception 'user read secrets';
  exception when insufficient_privilege then null; end;
  begin update integrations set status = 'connected'; raise exception 'user wrote integrations';
  exception when insufficient_privilege then null; end;
  begin perform write_audit('x', null, null, '{}'); raise exception 'user wrote the audit log';
  exception when insufficient_privilege then null; end;

  set local role anon;
  perform set_config('request.jwt.claim.sub', '', true);
  begin perform has_permission('admin.access'); raise exception 'visitor called has_permission';
  exception when insufficient_privilege then null; end;
  begin perform integration_statuses(); raise exception 'visitor read integration statuses';
  exception when insufficient_privilege then null; end;
  begin perform bootstrap_first_super_admin(member); raise exception 'visitor ran the bootstrap';
  exception when insufficient_privilege then null; end;
  set local role service_role;
  begin perform bootstrap_first_super_admin(member); raise exception 'the server role ran the bootstrap';
  exception when insufficient_privilege then null; end;
  reset role;

  -- ---------- 2. Bootstrap: once, for a confirmed account only ----------
  begin perform bootstrap_first_super_admin(unconf); raise exception 'unconfirmed account bootstrapped';
  exception when invalid_parameter_value then null; end;
  begin perform bootstrap_first_super_admin(gen_random_uuid()); raise exception 'unknown account bootstrapped';
  exception when invalid_parameter_value then null; end;
  t := bootstrap_first_super_admin(owner);
  if t not like 'initialized%' then raise exception 'bootstrap: %', t; end if;
  t := bootstrap_first_super_admin(owner);
  if t not like 'already initialized%' then raise exception 'repeat bootstrap: %', t; end if;
  begin perform bootstrap_first_super_admin(member); raise exception 'a second Super Admin was bootstrapped';
  exception when insufficient_privilege then null; end;
  select count(*) into n from user_roles; if n <> 1 then raise exception '% roles after bootstrap', n; end if;
  select count(*) into n from audit_log where action = 'bootstrap.super_admin' and target_id = owner::text;
  if n <> 1 then raise exception '% bootstrap audit entries, expected exactly 1', n; end if;
  select count(*) into n from profiles where id = owner; if n <> 1 then raise exception 'owner profile changed'; end if;
  select count(*) into n from workspaces where owner_id = owner; if n <> 2 then raise exception 'owner workspaces changed'; end if;

  -- ---------- 3. Super Admin ----------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', owner::text, true);
  if current_platform_role() <> 'super_admin' then raise exception 'owner is not super_admin'; end if;
  j := admin_overview();
  if (j->>'users_total')::int < 4 or (j->>'integrations_demo')::int <> 18 then
    raise exception 'overview: %', j; end if;
  select count(*) into n from admin_list_users(null, 50, 0); if n < 4 then raise exception 'user list: %', n; end if;
  select count(*) into n from admin_list_users('editor@', 50, 0); if n <> 1 then raise exception 'user search: %', n; end if;
  begin perform grant_role(owner, 'admin'); raise exception 'owner changed their own role';
  exception when insufficient_privilege then null; end;
  begin perform revoke_role(owner); raise exception 'owner removed their own role';
  exception when insufficient_privilege then null; end;
  begin perform grant_role(unconf, 'editor'); raise exception 'role granted to an unconfirmed account';
  exception when invalid_parameter_value then null; end;
  perform grant_role(editor, 'editor');
  perform grant_role(member, 'admin');
  select count(*) into n from admin_list_staff(); if n <> 3 then raise exception 'staff list: %', n; end if;

  -- ---------- 4. Admin: manages, but cannot grant roles or touch credentials ----------
  perform set_config('request.jwt.claim.sub', member::text, true);
  if not has_permission('integrations.configure') or has_permission('roles.grant')
     or has_permission('integrations.secrets.write') then raise exception 'admin permissions are wrong'; end if;
  begin perform grant_role(member, 'super_admin'); raise exception 'admin escalated to super_admin';
  exception when insufficient_privilege then null; end;
  begin perform grant_role(editor, 'super_admin'); raise exception 'admin granted super_admin';
  exception when insufficient_privilege then null; end;
  begin perform revoke_role(owner); raise exception 'admin removed the Super Admin';
  exception when insufficient_privilege then null; end;
  begin perform admin_set_integration_secret('llm_api', 'api_key', good_cipher, 'ab12'); raise exception 'admin set a credential';
  exception when insufficient_privilege then null; end;
  s := admin_update_integration('llm_api', 'demo_llm', '{"endpoint": "https://api.llm-provider.example/v1", "model": "demo-writer-2"}', true, false);
  if s <> 'demo' then raise exception 'demo save returned %', s; end if;
  begin perform admin_update_integration('llm_api', 'x', '{"api_key": "plain"}', true, true); raise exception 'a credential was saved in config';
  exception when invalid_parameter_value then null; end;
  begin perform admin_update_integration('llm_api', 'x', '[]', true, true); raise exception 'non-object config saved';
  exception when invalid_parameter_value then null; end;
  begin perform admin_update_integration('nope', 'x', '{}', true, true); raise exception 'unknown integration saved';
  exception when invalid_parameter_value then null; end;
  -- A test in demo mode never changes the status, whatever is claimed.
  s := admin_record_integration_test('llm_api', true, 'claimed success');
  if s <> 'demo' then raise exception 'a demo record became % after a test', s; end if;

  -- ---------- 5. Editor: content only ----------
  perform set_config('request.jwt.claim.sub', editor::text, true);
  if not has_permission('admin.access') or not has_permission('catalog.write') then raise exception 'editor permissions are wrong'; end if;
  begin perform admin_list_users(null, 10, 0); raise exception 'editor listed users';
  exception when insufficient_privilege then null; end;
  begin perform admin_list_integrations(); raise exception 'editor listed integrations';
  exception when insufficient_privilege then null; end;
  begin perform admin_list_audit(10, null); raise exception 'editor read the audit log';
  exception when insufficient_privilege then null; end;
  begin perform admin_update_integration('llm_api', 'x', '{}', true, true); raise exception 'editor changed an integration';
  exception when insufficient_privilege then null; end;
  select count(*) into n from integration_statuses(); if n <> 18 then raise exception 'statuses for a signed-in user: %', n; end if;

  -- ---------- 6. Credentials and status rules (as Super Admin) ----------
  perform set_config('request.jwt.claim.sub', owner::text, true);
  begin perform admin_set_integration_secret('llm_api', 'api_key', 'plain-text-key', 'key'); raise exception 'a plain-text credential was stored';
  exception when check_violation then null; end;
  perform admin_set_integration_secret('llm_api', 'api_key', good_cipher, 'ab12');
  j := admin_list_integrations();
  if j::text like '%' || good_cipher || '%' then raise exception 'ciphertext returned to the client'; end if;
  if (select x->'secrets'->0->>'hint' from jsonb_array_elements(j) x where x->>'key' = 'llm_api') <> 'ab12' then
    raise exception 'credential hint missing'; end if;
  s := admin_update_integration('llm_api', 'demo_llm', '{"endpoint": "https://api.llm-provider.example/v1", "model": "m"}', true, true);
  if s <> 'configured' then raise exception 'real save returned %', s; end if;
  s := admin_record_integration_test('llm_api', null, 'no test available');
  if s <> 'configured' then raise exception 'a skipped test changed the status to %', s; end if;
  s := admin_record_integration_test('llm_api', false, 'refused');
  if s <> 'error' then raise exception 'a failed test gave %', s; end if;
  s := admin_record_integration_test('llm_api', true, 'ok');
  if s <> 'connected' then raise exception 'a passed test gave %', s; end if;
  -- Saving again clears the test: back to configured.
  s := admin_update_integration('llm_api', 'demo_llm', '{"endpoint": "https://api.llm-provider.example/v1", "model": "m2"}', true, true);
  if s <> 'configured' then raise exception 'saving after a test returned %', s; end if;
  perform admin_clear_integration_secret('llm_api', 'api_key');
  select count(*) into n from admin_list_integration_logs('llm_api', 50); if n < 6 then raise exception 'integration log has % entries', n; end if;

  -- ---------- 7. Constraints hold even for the database owner ----------
  reset role;
  begin update integrations set status = 'connected', is_demo = false, last_test_ok = null where key = 'payments';
    raise exception 'connected without a passed test';
  exception when check_violation then null; end;
  begin update integrations set status = 'configured' where key = 'payments' and is_demo;
    raise exception 'a demo record was marked configured';
  exception when check_violation then null; end;

  -- ---------- 8. Audit log: complete and append-only ----------
  select count(*) into n from audit_log where action in ('role.granted', 'integration.updated', 'integration.secret_set', 'integration.secret_cleared', 'integration.tested', 'bootstrap.super_admin');
  if n < 9 then raise exception 'audit log has % relevant entries', n; end if;
  if exists (select 1 from audit_log where summary::text like '%' || good_cipher || '%' or summary::text like '%plain%') then
    raise exception 'a credential reached the audit log'; end if;
  begin update audit_log set action = 'x'; raise exception 'audit log updated';
  exception when insufficient_privilege then null; end;
  begin delete from audit_log; raise exception 'audit log deleted';
  exception when insufficient_privilege then null; end;
  begin truncate audit_log; raise exception 'audit log truncated';
  exception when insufficient_privilege then null; end;

  -- ---------- 9. The last Super Admin cannot be lost; removal is immediate ----------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', owner::text, true);
  perform grant_role(member, 'super_admin');
  perform set_config('request.jwt.claim.sub', member::text, true);
  perform revoke_role(owner);                       -- allowed: another Super Admin remains
  perform set_config('request.jwt.claim.sub', owner::text, true);
  if has_permission('admin.access') then raise exception 'a removed role still works'; end if;
  begin perform admin_overview(); raise exception 'removed admin read the overview';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub', member::text, true);
  begin perform revoke_role(member); raise exception 'self-removal';
  exception when insufficient_privilege then null; end;
  perform grant_role(owner, 'super_admin');
  reset role;

  -- ---------- 10. Function hygiene ----------
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.prosecdef
     and (p.proname like 'admin\_%' or p.proname in ('grant_role','revoke_role','has_permission','current_platform_role','my_permissions','require_permission','write_audit','bootstrap_first_super_admin','integration_statuses'))
     and not (p.proconfig @> array['search_path=public, pg_temp']);
  if n <> 0 then raise exception '% definer functions lack a fixed search path', n; end if;
  select count(*) into n from information_schema.routine_privileges
   where routine_schema = 'public' and grantee in ('anon', 'PUBLIC')
     and (routine_name like 'admin\_%' or routine_name in ('grant_role','revoke_role','has_permission','current_platform_role','my_permissions','require_permission','write_audit','bootstrap_first_super_admin','integration_statuses'));
  if n <> 0 then raise exception 'visitors may execute % admin functions', n; end if;
  select count(*) into n from information_schema.role_table_grants
   where table_schema = 'public' and grantee in ('anon', 'authenticated', 'PUBLIC')
     and table_name in ('user_roles','role_permissions','audit_log','integrations','integration_secrets','integration_logs','integration_usage');
  if n <> 0 then raise exception 'browser roles hold % privileges on admin tables', n; end if;
  select count(*) into n from pg_tables where schemaname = 'public' and not rowsecurity;
  if n <> 0 then raise exception '% tables without row level security', n; end if;

  raise notice 'admin RBAC and integrations: 10 groups of checks passed';
end $$;
