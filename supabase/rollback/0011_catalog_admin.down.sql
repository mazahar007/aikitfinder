-- Removes only what migration 0011 created: the Directory management
-- functions and the catalog.publish permission. Tools, categories, sources
-- and pricing entered through the admin panel are kept. Run before the 0010
-- rollback.
begin;
drop function if exists public.admin_set_tool_verification(uuid, boolean);
drop function if exists public.admin_set_tool_status(uuid, public.content_status, boolean);
drop function if exists public.admin_save_tool_pricing(uuid, jsonb, jsonb);
drop function if exists public.admin_delete_tool_source(uuid);
drop function if exists public.admin_add_tool_source(uuid, text, text, date);
drop function if exists public.admin_set_tool_categories(uuid, jsonb);
drop function if exists public.admin_save_tool(uuid, jsonb);
drop function if exists public.admin_delete_category(uuid);
drop function if exists public.admin_save_category(uuid, text, text, text, text, uuid);
drop function if exists public.admin_get_tool(uuid);
drop function if exists public.admin_list_tools(text, text);
drop function if exists public.admin_list_categories();
drop function if exists public.catalog_url(text, text, boolean);
drop function if exists public.catalog_text_array(jsonb, text, integer);
delete from public.role_permissions where permission = 'catalog.publish';
delete from supabase_migrations.schema_migrations where version = '0011';
commit;
