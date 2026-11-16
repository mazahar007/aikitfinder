-- Removes only what migration 0009 created: staff roles, permissions, the
-- audit log and their functions. Accounts, profiles and workspaces are not
-- touched. Run the 0010 rollback first.
begin;
drop function if exists public.bootstrap_first_super_admin(uuid);
drop function if exists public.admin_list_audit(integer, bigint);
drop function if exists public.admin_role_matrix();
drop function if exists public.admin_list_staff();
drop function if exists public.admin_list_users(text, integer, integer);
drop function if exists public.admin_overview();
drop function if exists public.revoke_role(uuid);
drop function if exists public.grant_role(uuid, public.platform_role);
drop function if exists public.write_audit(text, text, text, jsonb);
drop function if exists public.require_permission(text);
drop function if exists public.my_permissions();
drop function if exists public.has_permission(text);
drop function if exists public.current_platform_role();
drop table if exists public.audit_log, public.role_permissions, public.user_roles;
drop function if exists public.audit_log_is_append_only();
drop type if exists public.platform_role;
delete from supabase_migrations.schema_migrations where version = '0009';
commit;
