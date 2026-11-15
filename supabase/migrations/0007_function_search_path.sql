-- Pin the search path of the two trigger functions from 0001.
--
-- Found by Supabase's security advisor after the first apply
-- ("function_search_path_mutable"). With a fixed search path a function
-- cannot be made to resolve names in a schema an attacker controls. The
-- functions from 0006 already set theirs.

alter function set_updated_at() set search_path = '';
alter function categories_single_level() set search_path = public;
