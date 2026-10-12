-- AIKitFinder deals schema (draft, Phase 2). Depends on 0001_catalog_schema.sql.
--
-- NOT applied anywhere yet. Mirrors `Deal` in src/lib/content/types.ts.
--
-- The visible status (active / upcoming / expired / needs verification) is
-- NOT stored. It is derived from dates and verification (see
-- src/lib/content/deal-status.ts), so an offer can never stay "active" after
-- its end date or after it stops being checked. `status` below is only the
-- editorial publishing state.

create type deal_type as enum ('credits', 'discount', 'coupon', 'free-trial');
create type deal_eligibility as enum
  ('anyone', 'students', 'educators', 'developers', 'startups', 'nonprofits');

create table deals (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null,
  provider          text not null,
  tool_id           uuid references tools (id) on delete set null,
  type              deal_type not null,
  summary           text not null,
  -- Only what the provider states explicitly. Null means "not stated".
  amount            text,
  coupon_code       text,
  eligibility       deal_eligibility[] not null default '{anyone}',
  eligibility_notes text not null default '',
  regions           text,
  starts_on         date,
  ends_on           date,
  terms_url         text not null check (terms_url ~ '^https?://'),
  claim_url         text not null check (claim_url ~ '^https?://'),
  claim_steps       text[] not null default '{}',
  -- True when the claim link earns a commission; the UI must disclose it.
  affiliate         boolean not null default false,
  verification      verification_status not null default 'unverified',
  status            content_status not null default 'draft',
  last_verified_at  date,
  -- Never shown publicly.
  admin_notes       text,
  is_sample         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint deals_dates_in_order check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint deals_verified_has_date check (verification <> 'verified' or last_verified_at is not null),
  constraint deals_eligibility_not_empty check (cardinality(eligibility) > 0)
);
create index deals_status_idx on deals (status);
create index deals_ends_on_idx on deals (ends_on);
create index deals_tool_idx on deals (tool_id);
create trigger deals_updated_at before update on deals
  for each row execute function set_updated_at();

create table deal_sources (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references deals (id) on delete cascade,
  title      text not null,
  url        text not null check (url ~ '^https?://'),
  checked_at date
);
create index deal_sources_deal_idx on deal_sources (deal_id);

alter table deals        enable row level security;
alter table deal_sources enable row level security;

create policy "published deals are public" on deals
  for select using (status = 'published');

create policy "sources of published deals are public" on deal_sources
  for select using (exists (select 1 from deals d where d.id = deal_id and d.status = 'published'));

-- `admin_notes` must never reach visitors. Row level security works per row,
-- so hide the column with column-level privileges: public roles may read every
-- column except admin_notes. (On Supabase these are the `anon` and
-- `authenticated` roles; the server-side service role is unaffected.)
-- Consequence: public queries must list columns, never `select *`.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on deals from anon;
    grant select (id, slug, title, provider, tool_id, type, summary, amount, coupon_code,
                  eligibility, eligibility_notes, regions, starts_on, ends_on, terms_url,
                  claim_url, claim_steps, affiliate, verification, status, last_verified_at,
                  is_sample, created_at, updated_at) on deals to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on deals from authenticated;
    grant select (id, slug, title, provider, tool_id, type, summary, amount, coupon_code,
                  eligibility, eligibility_notes, regions, starts_on, ends_on, terms_url,
                  claim_url, claim_steps, affiliate, verification, status, last_verified_at,
                  is_sample, created_at, updated_at) on deals to authenticated;
  end if;
end
$$;
