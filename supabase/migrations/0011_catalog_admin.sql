-- Directory content management for the admin panel.
--
-- Additive: only new functions and one new permission. The catalog tables
-- from 0001 and 0003 are unchanged, and so are their public read policies
-- (visitors still see only published tools).
--
-- Every function checks the caller's permission (catalog.write, or
-- catalog.publish for publishing and verification) and writes the audit log.
-- Browser roles still have no write privileges on any catalog table.
--
-- Truthfulness rules enforced here:
--   * A tool can be published only with a description, an official address,
--     a category and at least one official source.
--   * A tool can be marked Verified only with a source that has a check date;
--     the verified date is the day it is marked, from the database clock.
--   * A sample record can never be published.

insert into role_permissions (role, permission) values
  ('super_admin', 'catalog.publish'), ('admin', 'catalog.publish'), ('editor', 'catalog.publish')
on conflict do nothing;

-- Helpers -------------------------------------------------------------------------------

create or replace function catalog_text_array(p jsonb, p_key text, p_max integer default 40)
returns text[]
language sql immutable set search_path = public, pg_temp as $$
  select coalesce(array_agg(left(btrim(v), 300)) filter (where btrim(v) <> ''), '{}')
  from (select jsonb_array_elements_text(case when jsonb_typeof(p -> p_key) = 'array' then p -> p_key else '[]'::jsonb end) v
        limit p_max) x;
$$;

create or replace function catalog_url(p_value text, p_label text, p_required boolean)
returns text
language plpgsql immutable set search_path = public, pg_temp as $$
declare v text := nullif(btrim(coalesce(p_value, '')), '');
begin
  if v is null then
    if p_required then raise exception '% is required', p_label using errcode = '22023'; end if;
    return null;
  end if;
  if v !~ '^https?://[^\s/$.?#][^\s]*$' or char_length(v) > 500 then
    raise exception '% must be a full web address', p_label using errcode = '22023';
  end if;
  return v;
end;
$$;

-- Reads ------------------------------------------------------------------------------------

create or replace function admin_list_categories()
returns table (id uuid, slug text, name text, description text, icon text, parent_id uuid,
               parent_name text, tool_count bigint, child_count bigint, updated_at timestamptz)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('catalog.write');
  return query
    select c.id, c.slug, c.name, c.description, c.icon, c.parent_id, p.name,
           (select count(*) from tool_categories tc where tc.category_id = c.id),
           (select count(*) from categories k where k.parent_id = c.id),
           c.updated_at
    from categories c left join categories p on p.id = c.parent_id
    order by coalesce(p.name, c.name), c.parent_id nulls first, c.name;
end;
$$;

create or replace function admin_list_tools(p_search text default null, p_status text default null)
returns table (id uuid, slug text, name text, status content_status, verification verification_status,
               last_verified_at date, featured boolean, is_sample boolean, category text,
               source_count bigint, updated_at timestamptz)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('catalog.write');
  return query
    select t.id, t.slug, t.name, t.status, t.verification, t.last_verified_at, t.featured, t.is_sample,
           (select c.name from tool_categories tc join categories c on c.id = tc.category_id
             where tc.tool_id = t.id order by tc.position limit 1),
           (select count(*) from tool_sources s where s.tool_id = t.id),
           t.updated_at
    from tools t
    where (p_search is null or p_search = '' or t.name ilike '%' || replace(replace(p_search, '%', '\%'), '_', '\_') || '%'
           or t.slug ilike '%' || replace(replace(p_search, '%', '\%'), '_', '\_') || '%')
      and (p_status is null or p_status = '' or t.status::text = p_status)
    order by t.updated_at desc
    limit 500;
end;
$$;

create or replace function admin_get_tool(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare out jsonb;
begin
  perform require_permission('catalog.write');
  select to_jsonb(t) || jsonb_build_object(
    'category_ids', coalesce((select jsonb_agg(tc.category_id order by tc.position) from tool_categories tc where tc.tool_id = t.id), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'title', s.title, 'url', s.url, 'checked_at', s.checked_at) order by s.title) from tool_sources s where s.tool_id = t.id), '[]'::jsonb),
    'pricing', (select to_jsonb(p) from tool_pricing p where p.tool_id = t.id),
    'plans', coalesce((select jsonb_agg(to_jsonb(pl) order by pl.position) from pricing_plans pl where pl.tool_id = t.id), '[]'::jsonb))
  into out from tools t where t.id = p_id;
  return out;
end;
$$;

-- Categories -----------------------------------------------------------------------------------

create or replace function admin_save_category(
  p_id uuid, p_slug text, p_name text, p_description text, p_icon text, p_parent_id uuid
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  perform require_permission('catalog.write');
  if coalesce(btrim(p_name), '') = '' or char_length(p_name) > 80 then
    raise exception 'a name of up to 80 characters is required' using errcode = '22023';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(p_slug) > 80 then
    raise exception 'the address name may use lowercase letters, digits and single hyphens' using errcode = '22023';
  end if;
  if p_parent_id is not null and p_parent_id = p_id then
    raise exception 'a category cannot be its own parent' using errcode = '22023';
  end if;
  if p_id is not null and p_parent_id is not null and exists (select 1 from categories where parent_id = p_id) then
    raise exception 'a category with subcategories cannot become a subcategory' using errcode = '22023';
  end if;
  if exists (select 1 from categories where slug = p_slug and id is distinct from p_id) then
    raise exception 'another category already uses that address name' using errcode = '22023';
  end if;

  if p_id is null then
    insert into categories (slug, name, description, icon, parent_id)
    values (p_slug, btrim(p_name), left(coalesce(p_description, ''), 600), coalesce(nullif(p_icon, ''), 'sparkles'), p_parent_id)
    returning id into v_id;
    perform write_audit('category.created', 'category', v_id::text, jsonb_build_object('slug', p_slug, 'name', p_name));
  else
    update categories set slug = p_slug, name = btrim(p_name), description = left(coalesce(p_description, ''), 600),
      icon = coalesce(nullif(p_icon, ''), 'sparkles'), parent_id = p_parent_id
    where id = p_id returning id into v_id;
    if v_id is null then raise exception 'unknown category' using errcode = '22023'; end if;
    perform write_audit('category.updated', 'category', v_id::text, jsonb_build_object('slug', p_slug, 'name', p_name));
  end if;
  return v_id;
exception when raise_exception then
  -- The single-level trigger from 0001.
  raise exception '%', sqlerrm using errcode = '22023';
end;
$$;

create or replace function admin_delete_category(p_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_slug text;
begin
  perform require_permission('catalog.write');
  if exists (select 1 from tool_categories where category_id = p_id) then
    raise exception 'remove the tools from this category first' using errcode = '22023';
  end if;
  if exists (select 1 from categories where parent_id = p_id) then
    raise exception 'delete or move its subcategories first' using errcode = '22023';
  end if;
  delete from categories where id = p_id returning slug into v_slug;
  if v_slug is null then return; end if;
  perform write_audit('category.deleted', 'category', p_id::text, jsonb_build_object('slug', v_slug));
end;
$$;

-- Tools ----------------------------------------------------------------------------------------

-- Creates or updates a tool's content. Status, verification and featured are
-- changed only by admin_set_tool_status and admin_set_tool_verification.
create or replace function admin_save_tool(p_id uuid, p jsonb) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_id uuid;
  v_slug text := btrim(coalesce(p ->> 'slug', ''));
  v_name text := btrim(coalesce(p ->> 'name', ''));
  v_short text := btrim(coalesce(p ->> 'short_description', ''));
  v_api boolean := case p ->> 'api_available' when 'yes' then true when 'no' then false else null end;
  v_platforms platform[];
  v_pricing pricing_model;
  v_level skill_level;
  v_checked date;
begin
  perform require_permission('catalog.write');
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'invalid request' using errcode = '22023'; end if;
  if v_name = '' or char_length(v_name) > 80 then raise exception 'a name of up to 80 characters is required' using errcode = '22023'; end if;
  if v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_slug) > 80 then
    raise exception 'the address name may use lowercase letters, digits and single hyphens' using errcode = '22023';
  end if;
  if v_short = '' or char_length(v_short) > 200 then
    raise exception 'a short description of up to 200 characters is required' using errcode = '22023';
  end if;
  if exists (select 1 from tools where slug = v_slug and id is distinct from p_id) then
    raise exception 'another tool already uses that address name' using errcode = '22023';
  end if;
  begin
    v_level := coalesce(nullif(p ->> 'skill_level', ''), 'beginner')::skill_level;
    v_pricing := nullif(p ->> 'pricing_model', '')::pricing_model;
    v_platforms := (select array_agg(x::platform) from jsonb_array_elements_text(coalesce(p -> 'platforms', '[]'::jsonb)) x);
    v_checked := nullif(p ->> 'pricing_checked_at', '')::date;
  exception when invalid_text_representation or datetime_field_overflow or invalid_datetime_format then
    raise exception 'one of the choices is not valid' using errcode = '22023';
  end;
  if v_checked > current_date then raise exception 'the pricing check date cannot be in the future' using errcode = '22023'; end if;

  if p_id is null then
    insert into tools (slug, name, official_url, short_description) values (v_slug, v_name, 'https://placeholder.invalid', v_short)
    returning id into v_id;
  else
    select id into v_id from tools where id = p_id for update;
    if v_id is null then raise exception 'unknown tool' using errcode = '22023'; end if;
    if (select is_sample from tools where id = v_id) then
      raise exception 'sample records cannot be edited here' using errcode = '22023';
    end if;
  end if;

  update tools set
    slug = v_slug, name = v_name, short_description = v_short,
    official_url = catalog_url(p ->> 'official_url', 'the official address', true),
    docs_url = catalog_url(p ->> 'docs_url', 'the documentation address', false),
    overview = left(coalesce(p ->> 'overview', ''), 4000),
    skill_level = v_level, pricing_model = v_pricing,
    free_plan = nullif(left(btrim(coalesce(p ->> 'free_plan', '')), 300), ''),
    free_trial = nullif(left(btrim(coalesce(p ->> 'free_trial', '')), 300), ''),
    pricing_note = nullif(left(btrim(coalesce(p ->> 'pricing_note', '')), 600), ''),
    pricing_source_url = catalog_url(p ->> 'pricing_source_url', 'the pricing source', false),
    pricing_checked_at = v_checked,
    platforms = v_platforms, api_available = v_api,
    api_notes = nullif(left(btrim(coalesce(p ->> 'api_notes', '')), 600), ''),
    tags = catalog_text_array(p, 'tags'), use_cases = catalog_text_array(p, 'use_cases'),
    audience = catalog_text_array(p, 'audience'), features = catalog_text_array(p, 'features'),
    limitations = catalog_text_array(p, 'limitations'), quick_start = catalog_text_array(p, 'quick_start')
  where id = v_id;

  perform write_audit(case when p_id is null then 'tool.created' else 'tool.updated' end, 'tool', v_id::text,
    jsonb_build_object('slug', v_slug, 'name', v_name));
  return v_id;
end;
$$;

-- The first category is the primary one.
create or replace function admin_set_tool_categories(p_tool uuid, p_category_ids jsonb) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_ids uuid[];
begin
  perform require_permission('catalog.write');
  if not exists (select 1 from tools where id = p_tool) then raise exception 'unknown tool' using errcode = '22023'; end if;
  begin
    select coalesce(array_agg(x::uuid order by o), '{}') into v_ids
    from jsonb_array_elements_text(coalesce(p_category_ids, '[]'::jsonb)) with ordinality as e(x, o);
  exception when invalid_text_representation then
    raise exception 'unknown category' using errcode = '22023';
  end;
  if array_length(v_ids, 1) > 6 then raise exception 'choose up to 6 categories' using errcode = '22023'; end if;
  if exists (select 1 from unnest(v_ids) c where not exists (select 1 from categories k where k.id = c)) then
    raise exception 'unknown category' using errcode = '22023';
  end if;
  delete from tool_categories where tool_id = p_tool;
  insert into tool_categories (tool_id, category_id, position)
  select p_tool, c, (o - 1)::smallint from unnest(v_ids) with ordinality as u(c, o)
  on conflict do nothing;
  perform write_audit('tool.categories_set', 'tool', p_tool::text, jsonb_build_object('count', coalesce(array_length(v_ids, 1), 0)));
end;
$$;

create or replace function admin_add_tool_source(p_tool uuid, p_title text, p_url text, p_checked_at date)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  perform require_permission('catalog.write');
  if not exists (select 1 from tools where id = p_tool) then raise exception 'unknown tool' using errcode = '22023'; end if;
  if coalesce(btrim(p_title), '') = '' or char_length(p_title) > 120 then
    raise exception 'a source title of up to 120 characters is required' using errcode = '22023';
  end if;
  if p_checked_at > current_date then raise exception 'the check date cannot be in the future' using errcode = '22023'; end if;
  if (select count(*) from tool_sources where tool_id = p_tool) >= 20 then
    raise exception 'a tool can have up to 20 sources' using errcode = '22023';
  end if;
  insert into tool_sources (tool_id, title, url, checked_at)
  values (p_tool, btrim(p_title), catalog_url(p_url, 'the source address', true), p_checked_at)
  returning id into v_id;
  perform write_audit('tool.source_added', 'tool', p_tool::text, jsonb_build_object('url', p_url));
  return v_id;
end;
$$;

create or replace function admin_delete_tool_source(p_source uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_tool uuid; v_url text;
begin
  perform require_permission('catalog.write');
  delete from tool_sources where id = p_source returning tool_id, url into v_tool, v_url;
  if v_tool is null then return; end if;
  -- A verified tool must keep a dated source.
  if (select verification from tools where id = v_tool) = 'verified'
     and not exists (select 1 from tool_sources where tool_id = v_tool and checked_at is not null) then
    update tools set verification = 'needs-review' where id = v_tool;
  end if;
  perform write_audit('tool.source_removed', 'tool', v_tool::text, jsonb_build_object('url', v_url));
end;
$$;

-- Replaces the pricing record and its plans. p_plans: [{name, price, currency, interval, price_note, usage_limits, contact_sales}]
create or replace function admin_save_tool_pricing(p_tool uuid, p_pricing jsonb, p_plans jsonb) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_checked date; v_plan jsonb; v_pos integer := 0;
begin
  perform require_permission('catalog.write');
  if not exists (select 1 from tools where id = p_tool) then raise exception 'unknown tool' using errcode = '22023'; end if;
  if p_pricing is null or jsonb_typeof(p_pricing) <> 'object' then
    delete from tool_pricing where tool_id = p_tool;
    perform write_audit('tool.pricing_removed', 'tool', p_tool::text, '{}'::jsonb);
    return;
  end if;
  begin
    v_checked := (p_pricing ->> 'checked_at')::date;
  exception when others then
    raise exception 'enter the date the pricing page was checked' using errcode = '22023';
  end;
  if v_checked is null then raise exception 'enter the date the pricing page was checked' using errcode = '22023'; end if;
  if v_checked > current_date then raise exception 'the check date cannot be in the future' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_plans, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_plans, '[]'::jsonb)) > 12 then
    raise exception 'up to 12 plans' using errcode = '22023';
  end if;

  insert into tool_pricing (tool_id, pricing_url, api_pricing_url, checked_at, verification, admin_notes)
  values (p_tool, catalog_url(p_pricing ->> 'pricing_url', 'the pricing page', true),
          catalog_url(p_pricing ->> 'api_pricing_url', 'the API pricing page', false), v_checked,
          'unverified', nullif(left(btrim(coalesce(p_pricing ->> 'admin_notes', '')), 600), ''))
  on conflict (tool_id) do update set pricing_url = excluded.pricing_url, api_pricing_url = excluded.api_pricing_url,
    checked_at = excluded.checked_at, admin_notes = excluded.admin_notes,
    -- Changed pricing must be verified again.
    verification = 'unverified';

  delete from pricing_plans where tool_id = p_tool;
  for v_plan in select * from jsonb_array_elements(coalesce(p_plans, '[]'::jsonb)) loop
    if coalesce(btrim(v_plan ->> 'name'), '') = '' then raise exception 'every plan needs a name' using errcode = '22023'; end if;
    begin
      insert into pricing_plans (tool_id, position, name, price, currency, interval, price_note, usage_limits, contact_sales)
      values (p_tool, v_pos, left(btrim(v_plan ->> 'name'), 80),
              nullif(v_plan ->> 'price', '')::numeric, upper(nullif(btrim(coalesce(v_plan ->> 'currency', '')), '')),
              nullif(v_plan ->> 'interval', '')::billing_interval,
              nullif(left(btrim(coalesce(v_plan ->> 'price_note', '')), 300), ''),
              nullif(left(btrim(coalesce(v_plan ->> 'usage_limits', '')), 300), ''),
              coalesce((v_plan ->> 'contact_sales')::boolean, false));
    exception
      when check_violation then
        raise exception 'plan "%": a paid plan needs a price, a 3-letter currency and a billing interval', v_plan ->> 'name' using errcode = '22023';
      when unique_violation then
        raise exception 'two plans are named "%"', v_plan ->> 'name' using errcode = '22023';
      when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'plan "%": the price or interval is not valid', v_plan ->> 'name' using errcode = '22023';
    end;
    v_pos := v_pos + 1;
  end loop;
  perform write_audit('tool.pricing_saved', 'tool', p_tool::text, jsonb_build_object('plans', v_pos, 'checked_at', v_checked));
end;
$$;

-- Status and featured. Publishing requires complete, sourced content.
create or replace function admin_set_tool_status(p_tool uuid, p_status content_status, p_featured boolean)
returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v tools%rowtype;
begin
  perform require_permission('catalog.publish');
  select * into v from tools where id = p_tool for update;
  if not found then raise exception 'unknown tool' using errcode = '22023'; end if;
  if p_status = 'published' then
    if v.is_sample then raise exception 'sample records cannot be published' using errcode = '22023'; end if;
    if v.official_url = 'https://placeholder.invalid' then raise exception 'add the official address before publishing' using errcode = '22023'; end if;
    if not exists (select 1 from tool_categories where tool_id = p_tool) then
      raise exception 'choose at least one category before publishing' using errcode = '22023';
    end if;
    if not exists (select 1 from tool_sources where tool_id = p_tool) then
      raise exception 'add at least one official source before publishing' using errcode = '22023';
    end if;
  end if;
  if coalesce(p_featured, false) and p_status <> 'published' then
    raise exception 'only published tools can be featured' using errcode = '22023';
  end if;
  update tools set status = p_status, featured = coalesce(p_featured, false) where id = p_tool;
  perform write_audit('tool.status_set', 'tool', p_tool::text, jsonb_build_object(
    'status', p_status, 'previous_status', v.status, 'featured', coalesce(p_featured, false)));
end;
$$;

-- Marks a tool verified as of today, or sends it back to review.
create or replace function admin_set_tool_verification(p_tool uuid, p_verified boolean) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_prev verification_status;
begin
  perform require_permission('catalog.publish');
  select verification into v_prev from tools where id = p_tool for update;
  if not found then raise exception 'unknown tool' using errcode = '22023'; end if;
  if p_verified then
    if not exists (select 1 from tool_sources where tool_id = p_tool and checked_at is not null) then
      raise exception 'add an official source with the date you checked it before marking this verified' using errcode = '22023';
    end if;
    update tools set verification = 'verified', last_verified_at = current_date where id = p_tool;
    -- Pricing is verified with the tool only if it was checked recently enough to trust.
    update tool_pricing set verification = 'verified' where tool_id = p_tool and checked_at >= current_date - 30;
  else
    update tools set verification = 'needs-review' where id = p_tool;
    update tool_pricing set verification = 'needs-review' where tool_id = p_tool;
  end if;
  perform write_audit('tool.verification_set', 'tool', p_tool::text, jsonb_build_object(
    'verified', p_verified, 'previous', v_prev));
end;
$$;

-- Access -------------------------------------------------------------------------------------

do $$
declare f text;
begin
  foreach f in array array[
    'admin_list_categories()', 'admin_list_tools(text, text)', 'admin_get_tool(uuid)',
    'admin_save_category(uuid, text, text, text, text, uuid)', 'admin_delete_category(uuid)',
    'admin_save_tool(uuid, jsonb)', 'admin_set_tool_categories(uuid, jsonb)',
    'admin_add_tool_source(uuid, text, text, date)', 'admin_delete_tool_source(uuid)',
    'admin_save_tool_pricing(uuid, jsonb, jsonb)', 'admin_set_tool_status(uuid, content_status, boolean)',
    'admin_set_tool_verification(uuid, boolean)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
  -- Helpers are internal.
  execute 'revoke execute on function catalog_text_array(jsonb, text, integer) from public, anon, authenticated';
  execute 'revoke execute on function catalog_url(text, text, boolean) from public, anon, authenticated';
end $$;
