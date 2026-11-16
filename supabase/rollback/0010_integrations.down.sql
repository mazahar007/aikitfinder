-- Removes only what migration 0010 created, and restores admin_overview() to
-- its 0009 definition. Run before the 0009 rollback.
begin;
drop function if exists public.admin_list_integrations();
drop function if exists public.admin_list_integration_logs(text, integer);
drop function if exists public.integration_statuses();
drop function if exists public.admin_update_integration(text, text, jsonb, boolean, boolean);
drop function if exists public.admin_set_integration_secret(text, text, text, text);
drop function if exists public.admin_clear_integration_secret(text, text);
drop function if exists public.admin_record_integration_test(text, boolean, text);
drop table if exists public.integration_usage, public.integration_logs, public.integration_secrets, public.integrations;
drop type if exists public.integration_status;

create or replace function public.admin_overview() returns jsonb
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
delete from supabase_migrations.schema_migrations where version = '0010';
commit;
