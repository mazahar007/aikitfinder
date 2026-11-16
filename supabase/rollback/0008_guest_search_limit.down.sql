-- Removes only what migration 0008 created. Nothing else depends on these objects.
begin;
drop function if exists public.consume_guest_search(text, uuid, text);
drop function if exists public.guest_search_status(text);
drop table if exists public.guest_search_requests, public.guest_search_ip_usage, public.guest_search_usage;
delete from supabase_migrations.schema_migrations where version = '0008';
commit;
