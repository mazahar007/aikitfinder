-- AIKitFinder plan-level pricing (draft, Phase 4). Depends on 0001.
--
-- NOT applied anywhere yet. Mirrors `ToolPricing` / `PricingPlan` in
-- src/lib/content/types.ts.
--
-- Rules the database enforces:
--  * pricing may only be marked verified if it says when it was checked;
--  * a price above zero needs a currency and a billing interval;
--  * every figure traces back to one official pricing page (pricing_url).
-- "Is this recent enough to show as current?" is NOT stored: it depends on
-- today's date (see src/lib/content/pricing.ts), so it can never go stale.
-- A history of price changes is intentionally left for later.

create type billing_interval as enum ('month', 'year', 'one-time', 'usage');

create table tool_pricing (
  tool_id         uuid primary key references tools (id) on delete cascade,
  pricing_url     text not null check (pricing_url ~ '^https?://'),
  api_pricing_url text check (api_pricing_url is null or api_pricing_url ~ '^https?://'),
  checked_at      date not null,
  verification    verification_status not null default 'unverified',
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger tool_pricing_updated_at before update on tool_pricing
  for each row execute function set_updated_at();

create table pricing_plans (
  id            uuid primary key default gen_random_uuid(),
  tool_id       uuid not null references tool_pricing (tool_id) on delete cascade,
  position      smallint not null default 0,
  name          text not null,
  -- 0 = free. Null = the provider does not state a price.
  price         numeric(12, 4) check (price is null or price >= 0),
  currency      char(3) check (currency is null or currency ~ '^[A-Z]{3}$'),
  interval      billing_interval,
  price_note    text,
  usage_limits  text,
  contact_sales boolean not null default false,
  unique (tool_id, name),
  constraint paid_plan_has_currency_and_interval
    check (price is null or price = 0 or (currency is not null and interval is not null))
);
create index pricing_plans_tool_idx on pricing_plans (tool_id, position);

alter table tool_pricing  enable row level security;
alter table pricing_plans enable row level security;

-- Visitors only see pricing that has been verified, and only for published tools.
-- (The app also hides figures that were not re-checked recently.)
create policy "verified pricing of published tools is public" on tool_pricing
  for select using (
    verification = 'verified'
    and exists (select 1 from tools t where t.id = tool_id and t.status = 'published')
  );

create policy "plans of public pricing are public" on pricing_plans
  for select using (
    exists (
      select 1 from tool_pricing p
      join tools t on t.id = p.tool_id
      where p.tool_id = pricing_plans.tool_id
        and p.verification = 'verified'
        and t.status = 'published'
    )
  );

-- Keep admin_notes away from visitors (same approach as deals).
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on tool_pricing from anon;
    grant select (tool_id, pricing_url, api_pricing_url, checked_at, verification,
                  created_at, updated_at) on tool_pricing to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on tool_pricing from authenticated;
    grant select (tool_id, pricing_url, api_pricing_url, checked_at, verification,
                  created_at, updated_at) on tool_pricing to authenticated;
  end if;
end
$$;
