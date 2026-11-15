-- Accounts, product workspaces and AutoFlow projects (Phase 1 foundation).
--
-- Validated on a local PostgreSQL with a stand-in `auth` schema before being
-- applied to the Supabase project (see docs/phase-1/testing-report.md).
--
-- Model: one shared identity (Supabase Auth, `auth.users`), one profile per
-- user, and one personal workspace per product. Directory and AutoFlow data
-- hang off different workspaces, so the products stay separate while the
-- sign-in is shared. No teams and no billing (owner decision).
--
-- Security model: row level security is on for every table. A signed-in user
-- can reach only rows they own; visitors (anon) can reach nothing. Profiles
-- and workspaces are created by a trigger when the account is created, not by
-- the browser.
--
-- Mirrors: src/lib/auth/config.ts (SessionUser), src/lib/autoflow/stages.ts,
-- src/lib/autoflow/projects.ts. Keep them in step.

-- Enumerations --------------------------------------------------------------

create type product_id as enum ('directory', 'autoflow');

create type autoflow_stage as enum (
  'research', 'script', 'voice', 'video_assembly', 'thumbnail_metadata', 'review'
);
create type autoflow_stage_status as enum (
  'not_started', 'in_progress', 'needs_review', 'approved'
);
create type autoflow_project_status as enum (
  'draft', 'in_progress', 'ready_for_review', 'approved', 'archived'
);

-- Profiles: the app's view of an account ----------------------------------------

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Workspaces: one per user per product ------------------------------------------

create table workspaces (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references profiles (id) on delete cascade,
  product    product_id not null,
  name       text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_one_per_product unique (owner_id, product)
);
create trigger workspaces_updated_at
  before update on workspaces
  for each row execute function set_updated_at();

-- A new account gets its profile and both workspaces.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id);
  insert into workspaces (owner_id, product, name) values
    (new.id, 'directory', 'My Directory'),
    (new.id, 'autoflow', 'My Studio');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- AutoFlow projects ---------------------------------------------------------------

create table autoflow_projects (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 160),
  status        autoflow_project_status not null default 'draft',
  current_stage autoflow_stage not null default 'research',
  -- The first workflow is 16:9 video only; widen the check when more exist.
  aspect_ratio  text not null default '16:9' check (aspect_ratio in ('16:9')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index autoflow_projects_workspace_idx on autoflow_projects (workspace_id, updated_at desc);
create trigger autoflow_projects_updated_at
  before update on autoflow_projects
  for each row execute function set_updated_at();

-- Projects may only live in an AutoFlow workspace. Runs with definer rights so
-- the check sees the workspace whoever asks; ownership is enforced separately
-- by the row level security policy below.
create or replace function autoflow_projects_workspace_check() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from workspaces where id = new.workspace_id and product = 'autoflow'
  ) then
    raise exception 'projects belong to an AutoFlow workspace';
  end if;
  return new;
end;
$$;
create trigger autoflow_projects_workspace
  before insert or update of workspace_id on autoflow_projects
  for each row execute function autoflow_projects_workspace_check();

-- One row per stage per project. Stage content (scripts, audio, video) gets its
-- own tables when each stage is built.
create table autoflow_project_stages (
  project_id uuid not null references autoflow_projects (id) on delete cascade,
  stage      autoflow_stage not null,
  status     autoflow_stage_status not null default 'not_started',
  updated_at timestamptz not null default now(),
  primary key (project_id, stage)
);
create trigger autoflow_project_stages_updated_at
  before update on autoflow_project_stages
  for each row execute function set_updated_at();

-- A new project starts with all six stages, not started.
create or replace function autoflow_projects_seed_stages() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into autoflow_project_stages (project_id, stage)
  select new.id, s from unnest(enum_range(null::autoflow_stage)) as s;
  return new;
end;
$$;
create trigger autoflow_projects_stages
  after insert on autoflow_projects
  for each row execute function autoflow_projects_seed_stages();

-- Row level security ------------------------------------------------------------

alter table profiles                enable row level security;
alter table workspaces              enable row level security;
alter table autoflow_projects       enable row level security;
alter table autoflow_project_stages enable row level security;

-- Profiles: read and edit your own. Created and deleted with the account.
create policy "own profile is readable" on profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "own profile is editable" on profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Workspaces: read and rename your own. Created by the account trigger.
create policy "own workspaces are readable" on workspaces
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "own workspaces are editable" on workspaces
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- Projects: full control inside your own workspace only.
create policy "own projects" on autoflow_projects
  for all to authenticated
  using (exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid())))
  with check (exists (
    select 1 from workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid())));

-- Stages: read and update for your own projects. Rows are created by the
-- project trigger and removed with the project.
create policy "stages of own projects are readable" on autoflow_project_stages
  for select to authenticated
  using (exists (
    select 1 from autoflow_projects p join workspaces w on w.id = p.workspace_id
    where p.id = project_id and w.owner_id = (select auth.uid())));
create policy "stages of own projects are editable" on autoflow_project_stages
  for update to authenticated
  using (exists (
    select 1 from autoflow_projects p join workspaces w on w.id = p.workspace_id
    where p.id = project_id and w.owner_id = (select auth.uid())))
  with check (exists (
    select 1 from autoflow_projects p join workspaces w on w.id = p.workspace_id
    where p.id = project_id and w.owner_id = (select auth.uid())));

-- Privileges ----------------------------------------------------------------------
--
-- Supabase grants every privilege on new public tables to `anon` and
-- `authenticated` and relies on row level security. These tables are narrowed
-- further, so a mistake in a policy cannot expose or alter more than intended.

-- Visitors have no business with account data at all.
revoke all on profiles, workspaces, autoflow_projects, autoflow_project_stages from anon;

-- Signed-in users: only the operations and columns the app needs.
revoke all on profiles, workspaces, autoflow_project_stages from authenticated;
grant select on profiles, workspaces, autoflow_project_stages to authenticated;
grant update (display_name) on profiles to authenticated;
grant update (name) on workspaces to authenticated;
grant update (status) on autoflow_project_stages to authenticated;

revoke all on autoflow_projects from authenticated;
grant select, delete on autoflow_projects to authenticated;
grant insert (workspace_id, title, aspect_ratio) on autoflow_projects to authenticated;
grant update (title, status, current_stage) on autoflow_projects to authenticated;

-- Trigger functions are never meant to be called directly.
revoke execute on function handle_new_user() from public, anon, authenticated;
revoke execute on function autoflow_projects_workspace_check() from public, anon, authenticated;
revoke execute on function autoflow_projects_seed_stages() from public, anon, authenticated;
