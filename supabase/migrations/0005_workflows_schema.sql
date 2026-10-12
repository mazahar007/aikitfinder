-- AIKitFinder workflow library (draft, Phase 6). Depends on 0001.
--
-- NOT applied anywhere yet. Mirrors `Workflow` and `WorkflowStep` in
-- src/lib/content/types.ts.
--
-- A step is either 'manual' (you do it, possibly with a tool) or
-- 'automatable' (a tool could run it). This does NOT mean AIKitFinder runs
-- anything: there is no workflow engine, and a step's mode is a label only.
-- Time figures are editorial estimates, so they must be positive when given;
-- the app never adds up prices.

create type step_mode as enum ('manual', 'automatable');

create table workflows (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null,
  summary          text not null,
  skill_level      skill_level not null default 'beginner',
  -- Editorial estimate for a first run; the UI labels it as such.
  estimated_minutes integer not null check (estimated_minutes > 0),
  outcome          text not null,
  prerequisites    text[] not null default '{}',
  verification     verification_status not null default 'unverified',
  status           content_status not null default 'draft',
  featured         boolean not null default false,
  last_verified_at date,
  admin_notes      text,
  is_sample        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint workflows_verified_has_date check (verification <> 'verified' or last_verified_at is not null)
);
create index workflows_status_idx on workflows (status);
create trigger workflows_updated_at before update on workflows
  for each row execute function set_updated_at();

create table workflow_steps (
  id                uuid primary key default gen_random_uuid(),
  workflow_id       uuid not null references workflows (id) on delete cascade,
  position          smallint not null check (position >= 1),
  title             text not null,
  instructions      text not null,
  input_description text not null,
  output_description text not null,
  mode              step_mode not null default 'manual',
  -- The tool we suggest. Null when the step needs no tool.
  tool_id           uuid references tools (id) on delete set null,
  -- Becomes a foreign key when the guides table has its own migration.
  guide_slug        text,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  note              text,
  unique (workflow_id, position)
);
create index workflow_steps_tool_idx on workflow_steps (tool_id);

-- Other tools that could do the same step. Only from reliable knowledge.
create table workflow_step_alternatives (
  step_id uuid not null references workflow_steps (id) on delete cascade,
  tool_id uuid not null references tools (id) on delete cascade,
  primary key (step_id, tool_id)
);

alter table workflows                  enable row level security;
alter table workflow_steps             enable row level security;
alter table workflow_step_alternatives enable row level security;

create policy "published workflows are public" on workflows
  for select using (status = 'published');

create policy "steps of published workflows are public" on workflow_steps
  for select using (exists (select 1 from workflows w where w.id = workflow_id and w.status = 'published'));

create policy "alternatives of published workflows are public" on workflow_step_alternatives
  for select using (
    exists (
      select 1 from workflow_steps s join workflows w on w.id = s.workflow_id
      where s.id = step_id and w.status = 'published'
    )
    and exists (select 1 from tools t where t.id = tool_id and t.status = 'published')
  );

-- Keep admin_notes away from visitors (same approach as deals, pricing, prompts).
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on workflows from anon;
    grant select (id, slug, title, summary, skill_level, estimated_minutes, outcome, prerequisites,
                  verification, status, featured, last_verified_at, is_sample, created_at,
                  updated_at) on workflows to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on workflows from authenticated;
    grant select (id, slug, title, summary, skill_level, estimated_minutes, outcome, prerequisites,
                  verification, status, featured, last_verified_at, is_sample, created_at,
                  updated_at) on workflows to authenticated;
  end if;
end
$$;
