-- AIKitFinder prompt library (draft, Phase 5). Depends on 0001.
--
-- NOT applied anywhere yet. Mirrors `Prompt` and `PromptVariable` in
-- src/lib/content/types.ts. Prompts written on a tool page are stored here too
-- (linked to that tool through prompt_tools), so the library has one source.
--
-- Trust rules enforced here:
--  * a prompt cannot be marked tested without a review date;
--  * tool compatibility is a separate list, filled only for tools that were
--    actually checked (an empty list means "not confirmed", not "works with all").

create table prompts (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title          text not null,
  use_case       text not null,
  text           text not null,
  skill_level    skill_level not null default 'beginner',
  -- Task, content type and role tags, e.g. 'summary', 'email', 'student'.
  tags           text[] not null default '{}',
  instructions   text[] not null default '{}',
  expected_output text not null,
  -- Illustration only; the UI labels it "not a guaranteed result".
  example_output text,
  caveats        text,
  author         text not null,
  -- Where the text comes from. Do not copy proprietary prompt collections.
  origin_note    text not null,
  tested         boolean not null default false,
  status         content_status not null default 'draft',
  last_reviewed_at date,
  admin_notes    text,
  is_sample      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint prompts_tested_has_review_date check (not tested or last_reviewed_at is not null)
);
create index prompts_status_idx on prompts (status);
create index prompts_tags_idx on prompts using gin (tags);
create trigger prompts_updated_at before update on prompts
  for each row execute function set_updated_at();

-- The [blanks] in the text, with a description for each.
create table prompt_variables (
  prompt_id   uuid not null references prompts (id) on delete cascade,
  position    smallint not null default 0,
  name        text not null check (name !~ '[\[\]\n]'),
  description text not null,
  example     text,
  primary key (prompt_id, name)
);

create table prompt_categories (
  prompt_id   uuid not null references prompts (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  position    smallint not null default 1,
  primary key (prompt_id, category_id)
);

-- Tools the prompt is known to suit.
create table prompt_tools (
  prompt_id uuid not null references prompts (id) on delete cascade,
  tool_id   uuid not null references tools (id) on delete cascade,
  primary key (prompt_id, tool_id)
);

alter table prompts           enable row level security;
alter table prompt_variables  enable row level security;
alter table prompt_categories enable row level security;
alter table prompt_tools      enable row level security;

create policy "published prompts are public" on prompts
  for select using (status = 'published');

create policy "variables of published prompts are public" on prompt_variables
  for select using (exists (select 1 from prompts p where p.id = prompt_id and p.status = 'published'));

create policy "categories of published prompts are public" on prompt_categories
  for select using (exists (select 1 from prompts p where p.id = prompt_id and p.status = 'published'));

create policy "tools of published prompts are public" on prompt_tools
  for select using (
    exists (select 1 from prompts p where p.id = prompt_id and p.status = 'published')
    and exists (select 1 from tools t where t.id = tool_id and t.status = 'published')
  );

-- Keep admin_notes away from visitors (same approach as deals and pricing).
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on prompts from anon;
    grant select (id, slug, title, use_case, text, skill_level, tags, instructions,
                  expected_output, example_output, caveats, author, origin_note, tested,
                  status, last_reviewed_at, is_sample, created_at, updated_at) on prompts to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on prompts from authenticated;
    grant select (id, slug, title, use_case, text, skill_level, tags, instructions,
                  expected_output, example_output, caveats, author, origin_note, tested,
                  status, last_reviewed_at, is_sample, created_at, updated_at) on prompts to authenticated;
  end if;
end
$$;
