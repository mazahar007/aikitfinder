-- AIKitFinder catalog schema (draft, Phase 1a).
--
-- NOT applied anywhere yet. It mirrors src/lib/content/types.ts so the data
-- layer can switch from sample data to Supabase without UI changes. Guides,
-- workflows, prompts, deals and accounts get their own migrations in later
-- phases.
--
-- Security model: row level security is on for every table. Visitors (anon)
-- and signed-in users can only READ published rows. There are no write
-- policies on purpose: the admin CMS (Phase 1d) writes through server-side
-- code with the service-role key, which is never sent to the browser.

create extension if not exists pgcrypto;

-- Enumerations --------------------------------------------------------------

create type skill_level as enum ('beginner', 'intermediate', 'advanced');
create type pricing_model as enum ('free', 'freemium', 'paid', 'open-source');
create type verification_status as enum ('verified', 'needs-review', 'unverified');
create type content_status as enum ('draft', 'in-review', 'published', 'needs-update', 'archived');
create type platform as enum ('web', 'desktop', 'ios', 'android', 'browser-extension', 'api');

-- Shared trigger: keep updated_at current ---------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Categories (one level of subcategories) ------------------------------------------

create table categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  description text not null default '',
  icon        text not null default 'sparkles',
  parent_id   uuid references categories (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_not_own_parent check (parent_id is distinct from id)
);
create index categories_parent_idx on categories (parent_id);

-- Subcategories may not have their own children (keeps navigation simple).
create or replace function categories_single_level() returns trigger
language plpgsql as $$
begin
  if new.parent_id is not null and exists (
    select 1 from categories where id = new.parent_id and parent_id is not null
  ) then
    raise exception 'subcategories cannot have subcategories';
  end if;
  return new;
end;
$$;
create trigger categories_single_level_check
  before insert or update on categories
  for each row execute function categories_single_level();
create trigger categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- Tools --------------------------------------------------------------------------

create table tools (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name               text not null,
  official_url       text not null check (official_url ~ '^https?://'),
  docs_url           text check (docs_url is null or docs_url ~ '^https?://'),
  short_description  text not null,
  overview           text not null default '',
  skill_level        skill_level not null default 'beginner',
  -- Null means "not verified yet"; the UI must show that, never guess.
  pricing_model      pricing_model,
  free_plan          text,
  free_trial         text,
  pricing_note       text,
  pricing_source_url text check (pricing_source_url is null or pricing_source_url ~ '^https?://'),
  pricing_checked_at date,
  platforms          platform[],
  api_available      boolean,
  api_notes          text,
  tags               text[] not null default '{}',
  use_cases          text[] not null default '{}',
  audience           text[] not null default '{}',
  inputs             text[] not null default '{}',
  outputs            text[] not null default '{}',
  features           text[] not null default '{}',
  limitations        text[] not null default '{}',
  setup_requirements text[] not null default '{}',
  quick_start        text[] not null default '{}',
  verification       verification_status not null default 'unverified',
  status             content_status not null default 'draft',
  featured           boolean not null default false,
  last_verified_at   date,
  -- Demo records stay labelled "Sample" in the UI and out of the sitemap.
  is_sample          boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- A record cannot claim to be verified without saying when.
  constraint tools_verified_has_date check (verification <> 'verified' or last_verified_at is not null)
);
create index tools_status_idx on tools (status);
create index tools_tags_idx on tools using gin (tags);
create trigger tools_updated_at
  before update on tools
  for each row execute function set_updated_at();

-- A tool can belong to several categories. `position = 0` is the primary one.
create table tool_categories (
  tool_id     uuid not null references tools (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  position    smallint not null default 1,
  primary key (tool_id, category_id)
);
create index tool_categories_category_idx on tool_categories (category_id);
create unique index tool_categories_one_primary_idx on tool_categories (tool_id) where position = 0;

-- Editorial alternatives. Directional: A lists B, B must list A separately.
create table tool_alternatives (
  tool_id             uuid not null references tools (id) on delete cascade,
  alternative_tool_id uuid not null references tools (id) on delete cascade,
  position            smallint not null default 0,
  primary key (tool_id, alternative_tool_id),
  check (tool_id <> alternative_tool_id)
);

-- Sources behind a tool's changeable claims.
create table tool_sources (
  id         uuid primary key default gen_random_uuid(),
  tool_id    uuid not null references tools (id) on delete cascade,
  title      text not null,
  url        text not null check (url ~ '^https?://'),
  checked_at date
);
create index tool_sources_tool_idx on tool_sources (tool_id);

-- Row level security ------------------------------------------------------------

alter table categories        enable row level security;
alter table tools             enable row level security;
alter table tool_categories   enable row level security;
alter table tool_alternatives enable row level security;
alter table tool_sources      enable row level security;

create policy "categories are public" on categories for select using (true);

create policy "published tools are public" on tools
  for select using (status = 'published');

create policy "links of published tools are public" on tool_categories
  for select using (exists (select 1 from tools t where t.id = tool_id and t.status = 'published'));

create policy "alternatives of published tools are public" on tool_alternatives
  for select using (
    exists (select 1 from tools t where t.id = tool_id and t.status = 'published')
    and exists (select 1 from tools t where t.id = alternative_tool_id and t.status = 'published')
  );

create policy "sources of published tools are public" on tool_sources
  for select using (exists (select 1 from tools t where t.id = tool_id and t.status = 'published'));
