-- Checks for migration 0011 (Directory content management). Run by
-- validate-migrations.sh after admin-rbac-test.sql, which leaves these roles:
--   ...a1 owner  super_admin    ...a3 editor  editor    ...a4 unconfirmed, no role
-- and one ordinary user is added here.

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-0000000000a5', 'plain@example.test', now());

do $$
declare
  editor constant uuid := '00000000-0000-0000-0000-0000000000a3';
  plain  constant uuid := '00000000-0000-0000-0000-0000000000a5';
  cat uuid; sub uuid; tool uuid; src uuid; n int; j jsonb; r record;
  good jsonb := '{"name": "Example Writer", "slug": "example-writer", "official_url": "https://writer.example.com",
                  "short_description": "Drafts and edits text.", "skill_level": "beginner", "pricing_model": "freemium",
                  "platforms": ["web", "api"], "api_available": "yes", "tags": ["writing", " ", "editing"],
                  "features": ["Drafts", "Rewrites"]}';
begin
  -- ---------- 1. Ordinary users and visitors cannot touch the catalog ----------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', plain::text, true);
  begin perform admin_list_tools(null, null); raise exception 'ordinary user listed tools';
  exception when insufficient_privilege then null; end;
  begin perform admin_save_tool(null, good); raise exception 'ordinary user created a tool';
  exception when insufficient_privilege then null; end;
  begin insert into tools (slug, name, official_url, short_description) values ('x', 'x', 'https://x.example', 'x');
    raise exception 'ordinary user wrote the tools table';
  exception when insufficient_privilege then null; end;
  set local role anon;
  perform set_config('request.jwt.claim.sub', '', true);
  begin perform admin_save_category(null, 'x', 'X', '', '', null); raise exception 'visitor created a category';
  exception when insufficient_privilege then null; end;
  begin perform catalog_url('https://x.example', 'x', true); raise exception 'visitor called a helper';
  exception when insufficient_privilege then null; end;
  reset role;

  -- ---------- 2. Editor: categories ----------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', editor::text, true);
  if not has_permission('catalog.publish') then raise exception 'editor lacks catalog.publish'; end if;
  cat := admin_save_category(null, 'writing', 'Writing', 'Tools for writing.', 'pen', null);
  sub := admin_save_category(null, 'editing', 'Editing', '', '', cat);
  begin perform admin_save_category(null, 'deep', 'Deep', '', '', sub); raise exception 'three-level category';
  exception when invalid_parameter_value then null; end;
  begin perform admin_save_category(null, 'Bad Slug', 'Bad', '', '', null); raise exception 'bad slug accepted';
  exception when invalid_parameter_value then null; end;
  begin perform admin_save_category(null, 'writing', 'Dup', '', '', null); raise exception 'duplicate slug accepted';
  exception when invalid_parameter_value then null; end;
  begin perform admin_save_category(cat, 'writing', 'Writing', '', '', cat); raise exception 'own parent accepted';
  exception when invalid_parameter_value then null; end;
  select count(*) into n from admin_list_categories(); if n <> 2 then raise exception '% categories listed', n; end if;

  -- ---------- 3. Editor: tools ----------
  begin perform admin_save_tool(null, good - 'official_url'); raise exception 'tool without an official address';
  exception when invalid_parameter_value then null; end;
  begin perform admin_save_tool(null, jsonb_set(good, '{official_url}', '"javascript:alert(1)"')); raise exception 'unsafe address accepted';
  exception when invalid_parameter_value then null; end;
  begin perform admin_save_tool(null, jsonb_set(good, '{platforms}', '["moon"]')); raise exception 'bad platform accepted';
  exception when invalid_parameter_value then null; end;
  begin perform admin_save_tool(null, jsonb_set(good, '{short_description}', to_jsonb(repeat('x', 201)))); raise exception 'long description accepted';
  exception when invalid_parameter_value then null; end;
  tool := admin_save_tool(null, good);
  reset role;
  select count(*) into n from tools where id = tool and status = 'draft' and verification = 'unverified' and not featured and not is_sample;
  set local role authenticated;
  if n <> 1 then raise exception 'new tool is not an unverified draft'; end if;
  reset role;
  if (select tags from tools where id = tool) <> array['writing', 'editing'] then raise exception 'tags not cleaned'; end if;
  set local role authenticated;
  reset role;
  if (select api_available from tools where id = tool) is not true then raise exception 'api flag'; end if;
  set local role authenticated;
  begin perform admin_save_tool(null, good); raise exception 'duplicate tool slug accepted';
  exception when invalid_parameter_value then null; end;

  -- Publishing needs a category and a source.
  begin perform admin_set_tool_status(tool, 'published', false); raise exception 'published without a category';
  exception when invalid_parameter_value then null; end;
  perform admin_set_tool_categories(tool, jsonb_build_array(sub, cat));
  reset role;
  if (select category_id from tool_categories where tool_id = tool and position = 0) <> sub then raise exception 'primary category'; end if;
  set local role authenticated;
  begin perform admin_set_tool_status(tool, 'published', false); raise exception 'published without a source';
  exception when invalid_parameter_value then null; end;
  begin perform admin_set_tool_status(tool, 'draft', true); raise exception 'a draft was featured';
  exception when invalid_parameter_value then null; end;

  -- Verification needs a dated source.
  src := admin_add_tool_source(tool, 'Official site', 'https://writer.example.com', null);
  begin perform admin_set_tool_verification(tool, true); raise exception 'verified without a dated source';
  exception when invalid_parameter_value then null; end;
  begin perform admin_add_tool_source(tool, 'Future', 'https://writer.example.com/a', current_date + 1); raise exception 'future check date accepted';
  exception when invalid_parameter_value then null; end;
  perform admin_add_tool_source(tool, 'Pricing page', 'https://writer.example.com/pricing', current_date);
  perform admin_set_tool_status(tool, 'published', true);
  perform admin_set_tool_verification(tool, true);
  reset role;
  select * into r from tools where id = tool;
  set local role authenticated;
  if r.status <> 'published' or not r.featured or r.verification <> 'verified' or r.last_verified_at <> current_date then
    raise exception 'publish/verify result: % % % %', r.status, r.featured, r.verification, r.last_verified_at; end if;

  -- Pricing: paid plans need currency and interval; saving resets verification.
  begin perform admin_save_tool_pricing(tool, '{"pricing_url": "https://writer.example.com/pricing", "checked_at": "2026-11-01"}',
          '[{"name": "Pro", "price": "12"}]'); raise exception 'paid plan without currency';
  exception when invalid_parameter_value then null; end;
  perform admin_save_tool_pricing(tool, jsonb_build_object('pricing_url', 'https://writer.example.com/pricing', 'checked_at', current_date),
          '[{"name": "Free", "price": "0"}, {"name": "Pro", "price": "12", "currency": "usd", "interval": "month"}]');
  reset role;
  select count(*) into n from pricing_plans where tool_id = tool; if n <> 2 then raise exception '% plans', n; end if;
  set local role authenticated;
  reset role;
  if (select currency from pricing_plans where tool_id = tool and name = 'Pro') <> 'USD' then raise exception 'currency not upper-cased'; end if;
  set local role authenticated;
  reset role;
  if (select verification from tool_pricing where tool_id = tool) <> 'unverified' then raise exception 'new pricing should be unverified'; end if;
  set local role authenticated;
  perform admin_set_tool_verification(tool, true);
  reset role;
  if (select verification from tool_pricing where tool_id = tool) <> 'verified' then raise exception 'recent pricing should verify with the tool'; end if;
  set local role authenticated;

  j := admin_get_tool(tool);
  if jsonb_array_length(j -> 'sources') <> 2 or jsonb_array_length(j -> 'plans') <> 2 or jsonb_array_length(j -> 'category_ids') <> 2 then
    raise exception 'admin_get_tool: %', j; end if;
  select count(*) into n from admin_list_tools('writer', 'published'); if n <> 1 then raise exception 'tool search'; end if;

end $$;

do $$
declare
  editor constant uuid := '00000000-0000-0000-0000-0000000000a3';
  tool uuid := (select id from tools where slug = 'example-writer');
  cat uuid := (select id from categories where slug = 'writing');
  n int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', editor::text, true);
  reset role;
  select id into tool from tools where slug = 'example-writer';
  set local role authenticated;
  perform admin_delete_tool_source((select s.id from admin_get_tool(tool) t, jsonb_to_recordset(t -> 'sources') as s(id uuid, checked_at date) where s.checked_at is not null limit 1));
  reset role;
  if (select verification from tools where id = tool) <> 'needs-review' then raise exception 'losing the dated source kept Verified'; end if;
  set local role authenticated;

  -- Categories in use cannot be deleted.
  begin perform admin_delete_category(cat); raise exception 'deleted a category in use';
  exception when invalid_parameter_value then null; end;

  -- Sample records cannot be edited or published.
  reset role;
  insert into tools (slug, name, official_url, short_description, is_sample) values ('sample-tool', 'Sample', 'https://s.example', 'S', true);
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', editor::text, true);
  begin perform admin_save_tool((select id from tools where slug = 'sample-tool'), '{"name":"S","slug":"sample-tool","official_url":"https://s.example","short_description":"S"}');
    raise exception 'edited a sample';
  exception when invalid_parameter_value then null; end;
  begin perform admin_set_tool_status((select id from tools where slug = 'sample-tool'), 'published', false); raise exception 'published a sample';
  exception when invalid_parameter_value then null; end;

  -- Unpublish and archive.
  perform admin_set_tool_status(tool, 'archived', false);
  reset role;
  if (select status from tools where id = tool) <> 'archived' then raise exception 'archive'; end if;

  -- What visitors can read follows the existing policies.
  set local role anon;
  select count(*) into n from tools; if n <> 0 then raise exception 'visitors see % unpublished tools', n; end if;
  reset role;

  -- Audit trail.
  select count(*) into n from audit_log where action in ('category.created', 'tool.created', 'tool.categories_set', 'tool.source_added',
    'tool.status_set', 'tool.verification_set', 'tool.pricing_saved', 'tool.source_removed');
  if n < 10 then raise exception 'only % catalog audit entries', n; end if;

  -- Function hygiene for this migration.
  select count(*) into n from information_schema.routine_privileges
   where routine_schema = 'public' and grantee in ('anon', 'PUBLIC')
     and routine_name in ('admin_list_categories','admin_list_tools','admin_get_tool','admin_save_category','admin_delete_category',
                          'admin_save_tool','admin_set_tool_categories','admin_add_tool_source','admin_delete_tool_source',
                          'admin_save_tool_pricing','admin_set_tool_status','admin_set_tool_verification','catalog_text_array','catalog_url');
  if n <> 0 then raise exception 'visitors may execute % catalog functions', n; end if;
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname like 'admin\_%' and p.prosecdef and not (p.proconfig @> array['search_path=public, pg_temp']);
  if n <> 0 then raise exception '% admin functions lack a fixed search path', n; end if;

  raise notice 'catalog admin: 3 groups of checks passed';
end $$;
