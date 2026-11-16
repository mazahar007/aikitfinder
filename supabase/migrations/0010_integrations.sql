-- Dependencies and integrations for the Central Admin Panel.
--
-- NOT applied anywhere yet. Additive. Seeds 18 integration records in DEMO
-- mode: every value below is fictional (".example" hosts, "demo-" names) and
-- no provider is contacted. No real credential is stored by this migration.
--
-- Separation
--   integrations          non-secret configuration and status
--   integration_secrets   credentials, encrypted by the app server before they
--                         arrive here; never readable by a browser role
--   integration_logs      what happened (tests, changes), without secrets
--   integration_usage     units and cost per use, for adapters to write later
--
-- A record can only be "connected" after a real, successful connection test
-- on a non-demo configuration; a constraint enforces that.

create type integration_status as enum ('not_configured', 'demo', 'configured', 'connected', 'error');

create table integrations (
  key            text primary key check (key ~ '^[a-z][a-z0-9_]{1,40}$'),
  name           text not null,
  category       text not null,
  -- 'module' is a feature area; 'provider' and 'infrastructure' are what it depends on.
  kind           text not null check (kind in ('module', 'provider', 'infrastructure')),
  depends_on     text references integrations (key),
  sort_order     smallint not null default 0,
  provider       text,
  enabled        boolean not null default false,
  status         integration_status not null default 'demo',
  is_demo        boolean not null default true,
  config         jsonb not null default '{}'::jsonb
                 check (jsonb_typeof(config) = 'object' and pg_column_size(config) <= 8192),
  last_test_at      timestamptz,
  last_test_ok      boolean,
  last_test_message text,
  updated_by     uuid references auth.users (id) on delete set null,
  updated_at     timestamptz not null default now(),
  -- Demo records are always 'demo'; real ones never are.
  constraint integrations_demo_status check ((status = 'demo') = is_demo),
  -- "Connected" requires a real test that passed.
  constraint integrations_connected_needs_test
    check (status <> 'connected' or (last_test_ok is true and last_test_at is not null))
);

create table integration_secrets (
  integration_key text not null references integrations (key) on delete cascade,
  field           text not null check (field ~ '^[a-z][a-z0-9_]{1,40}$'),
  -- Produced by the app server (AES-256-GCM): "v1.<iv>.<tag>.<data>". The
  -- format check keeps a plain-text value from being stored by mistake.
  ciphertext      text not null check (ciphertext ~ '^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]+$'),
  -- The last characters of the value, for recognition only.
  hint            text not null default '' check (char_length(hint) <= 4),
  updated_by      uuid references auth.users (id) on delete set null,
  updated_at      timestamptz not null default now(),
  primary key (integration_key, field)
);

create table integration_logs (
  id              bigint generated always as identity primary key,
  integration_key text not null references integrations (key) on delete cascade,
  event           text not null check (char_length(event) between 1 and 60),
  level           text not null default 'info' check (level in ('info', 'warning', 'error')),
  message         text not null default '' check (char_length(message) <= 500),
  actor_id        uuid,
  created_at      timestamptz not null default now()
);
create index integration_logs_key_idx on integration_logs (integration_key, id desc);

create table integration_usage (
  id              bigint generated always as identity primary key,
  integration_key text not null references integrations (key) on delete cascade,
  units           numeric not null check (units >= 0),
  unit            text not null,
  cost_usd        numeric check (cost_usd is null or cost_usd >= 0),
  reference       text,
  created_at      timestamptz not null default now()
);
create index integration_usage_key_idx on integration_usage (integration_key, created_at desc);

-- Demo records -------------------------------------------------------------------------

insert into integrations (key, name, category, kind, depends_on, sort_order, provider, config) values
  ('research_provider', 'Research Provider API', 'research', 'provider', null, 11, 'demo_research',
    '{"endpoint": "https://api.research-provider.example/v1", "max_sources": 8, "region": "us"}'),
  ('ai_research', 'AI Research', 'research', 'module', 'research_provider', 10, null,
    '{"default_depth": "standard", "require_sources": true, "max_brief_words": 800}'),
  ('llm_api', 'LLM API', 'script', 'provider', null, 21, 'demo_llm',
    '{"endpoint": "https://api.llm-provider.example/v1", "model": "demo-writer-1", "max_output_tokens": 4000}'),
  ('script_generation', 'Script Generation', 'script', 'module', 'llm_api', 20, null,
    '{"model": "demo-writer-1", "default_language": "en", "target_minutes": 8, "scenes_per_minute": 4}'),
  ('voice_provider', 'Voice Provider API', 'voice', 'provider', null, 31, 'demo_voice',
    '{"endpoint": "https://api.voice-provider.example/v1", "model": "demo-voice-multilingual", "output_format": "mp3_44100_128"}'),
  ('voice_generation', 'Voice Generation', 'voice', 'module', 'voice_provider', 30, null,
    '{"default_voice": "demo-narrator", "default_language": "en", "stability": 0.5, "subtitles": true}'),
  ('video_provider', 'Video Provider API', 'video', 'provider', null, 41, 'demo_video',
    '{"endpoint": "https://api.video-provider.example/v1", "model": "demo-motion-1", "max_seconds": 8}'),
  ('video_generation', 'Video Generation', 'video', 'module', 'video_provider', 40, null,
    '{"aspect_ratio": "16:9", "resolution": "1080p", "use_owner_images": true}'),
  ('remotion_worker', 'Remotion Worker Hosting', 'rendering', 'infrastructure', null, 51, 'self_hosted',
    '{"worker_url": "https://render-worker.internal.example", "concurrency": 1, "timeout_seconds": 1800}'),
  ('rendering', 'Rendering', 'rendering', 'module', 'remotion_worker', 50, null,
    '{"engine": "remotion", "codec": "h264", "fps": 30, "resolution": "1920x1080"}'),
  ('object_storage', 'Object Storage', 'storage', 'infrastructure', null, 61, 's3_compatible',
    '{"bucket": "akf-demo-media", "region": "demo-region-1", "endpoint": "https://storage.example", "public_base_url": ""}'),
  ('file_storage', 'File Storage', 'storage', 'module', 'object_storage', 60, null,
    '{"max_upload_mb": 200, "retention_days": 90, "allowed_types": "image/jpeg,image/png,audio/mpeg,video/mp4"}'),
  ('redis_celery', 'Redis / Celery', 'jobs', 'infrastructure', null, 71, 'redis',
    '{"redis_url": "redis://queue.internal.example:6379/0", "default_queue": "default", "worker_concurrency": 2}'),
  ('background_jobs', 'Background Jobs', 'jobs', 'module', 'redis_celery', 70, null,
    '{"max_retries": 3, "retry_backoff_seconds": 30, "job_timeout_seconds": 900}'),
  ('google_oauth', 'Google OAuth', 'publishing', 'provider', null, 81, 'google',
    '{"client_id": "demo-client-id.apps.googleusercontent.example", "redirect_uri": "https://aikitfinder.vercel.app/auth/google/callback", "scopes": "youtube.upload"}'),
  ('youtube_publishing', 'YouTube Publishing', 'publishing', 'module', 'google_oauth', 80, null,
    '{"default_privacy": "private", "require_owner_approval": true, "category_id": "22"}'),
  ('payment_provider', 'Payment Provider', 'payments', 'provider', null, 91, 'demo_payments',
    '{"endpoint": "https://api.payment-provider.example/v1", "webhook_url": "https://aikitfinder.vercel.app/api/webhooks/payments", "mode": "test"}'),
  ('payments', 'Payments', 'payments', 'module', 'payment_provider', 90, null,
    '{"currency": "USD", "billing_interval": "monthly", "tax_inclusive": false}');

-- Reads ---------------------------------------------------------------------------------

-- Everything the admin screens need. Secrets appear only as field name, hint and date.
create or replace function admin_list_integrations() returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('integrations.read');
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'key', i.key, 'name', i.name, 'category', i.category, 'kind', i.kind,
      'depends_on', i.depends_on, 'provider', i.provider, 'enabled', i.enabled,
      'status', i.status, 'is_demo', i.is_demo, 'config', i.config,
      'last_test_at', i.last_test_at, 'last_test_ok', i.last_test_ok,
      'last_test_message', i.last_test_message, 'updated_at', i.updated_at,
      'secrets', coalesce((
        select jsonb_agg(jsonb_build_object('field', s.field, 'hint', s.hint, 'updated_at', s.updated_at)
                         order by s.field)
        from integration_secrets s where s.integration_key = i.key), '[]'::jsonb)
    ) order by i.sort_order)
    from integrations i), '[]'::jsonb);
end;
$$;

create or replace function admin_list_integration_logs(p_key text default null, p_limit integer default 50)
returns table (id bigint, created_at timestamptz, integration_key text, event text, level text,
               message text, actor_email text)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('integrations.read');
  return query
    select l.id, l.created_at, l.integration_key, l.event, l.level, l.message, u.email::text
    from integration_logs l left join auth.users u on u.id = l.actor_id
    where p_key is null or l.integration_key = p_key
    order by l.id desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200);
end;
$$;

-- Status only (no configuration), so the AutoFlow workspace can show which
-- stages have what behind them. Any signed-in user may read it.
create or replace function integration_statuses() returns table (key text, status integration_status, enabled boolean)
language sql stable security definer set search_path = public, pg_temp as $$
  select i.key, i.status, i.enabled from integrations i
  where (select auth.uid()) is not null
  order by i.sort_order;
$$;

-- Changes -------------------------------------------------------------------------------

-- Saves non-secret configuration. `p_use_real` false keeps (or returns) the
-- record to demo mode; true marks it as a real configuration. Saving always
-- clears the last test result: a changed configuration is untested.
create or replace function admin_update_integration(
  p_key text, p_provider text, p_config jsonb, p_enabled boolean, p_use_real boolean
) returns integration_status
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_status integration_status;
  v_old integrations%rowtype;
begin
  perform require_permission('integrations.configure');
  if p_config is null or jsonb_typeof(p_config) <> 'object' then
    raise exception 'configuration must be an object' using errcode = '22023';
  end if;
  -- Credentials belong in integration_secrets, never in the readable configuration.
  if exists (select 1 from jsonb_object_keys(p_config) k
             where k ~* '(secret|password|api_?key|access_?key|private_key|_token$|^token$)') then
    raise exception 'credentials cannot be saved in the configuration' using errcode = '22023';
  end if;
  select * into v_old from integrations where key = p_key for update;
  if not found then raise exception 'unknown integration' using errcode = '22023'; end if;

  v_status := case when coalesce(p_use_real, false) then 'configured' else 'demo' end;
  update integrations set
    provider = nullif(p_provider, ''), config = p_config, enabled = coalesce(p_enabled, false),
    is_demo = not coalesce(p_use_real, false), status = v_status,
    last_test_at = null, last_test_ok = null, last_test_message = null,
    updated_by = (select auth.uid()), updated_at = now()
  where key = p_key;

  insert into integration_logs (integration_key, event, message, actor_id)
  values (p_key, 'configuration.saved',
          format('Saved as %s; %s.', v_status, case when coalesce(p_enabled, false) then 'enabled' else 'disabled' end),
          (select auth.uid()));
  perform write_audit('integration.updated', 'integration', p_key, jsonb_build_object(
    'status', v_status, 'previous_status', v_old.status,
    'enabled', coalesce(p_enabled, false), 'previous_enabled', v_old.enabled,
    'provider', nullif(p_provider, ''), 'previous_provider', v_old.provider,
    -- Field names only; values are in the record itself.
    'fields', (select coalesce(jsonb_agg(k order by k), '[]'::jsonb) from jsonb_object_keys(p_config) k)));
  return v_status;
end;
$$;

-- Stores a credential that the app server has already encrypted.
create or replace function admin_set_integration_secret(
  p_key text, p_field text, p_ciphertext text, p_hint text
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('integrations.secrets.write');
  if not exists (select 1 from integrations where key = p_key) then
    raise exception 'unknown integration' using errcode = '22023';
  end if;
  insert into integration_secrets (integration_key, field, ciphertext, hint, updated_by)
  values (p_key, p_field, p_ciphertext, left(coalesce(p_hint, ''), 4), (select auth.uid()))
  on conflict (integration_key, field) do update
    set ciphertext = excluded.ciphertext, hint = excluded.hint,
        updated_by = excluded.updated_by, updated_at = now();
  -- A new credential is untested.
  update integrations set status = case when is_demo then status else 'configured'::integration_status end,
    last_test_at = null, last_test_ok = null, last_test_message = null, updated_at = now()
  where key = p_key;
  insert into integration_logs (integration_key, event, message, actor_id)
  values (p_key, 'credential.set', format('Credential "%s" was set.', p_field), (select auth.uid()));
  perform write_audit('integration.secret_set', 'integration', p_key, jsonb_build_object('field', p_field));
end;
$$;

create or replace function admin_clear_integration_secret(p_key text, p_field text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('integrations.secrets.write');
  delete from integration_secrets where integration_key = p_key and field = p_field;
  if not found then return; end if;
  update integrations set status = case when is_demo then status else 'configured'::integration_status end,
    last_test_at = null, last_test_ok = null, last_test_message = null, updated_at = now()
  where key = p_key;
  insert into integration_logs (integration_key, event, message, actor_id)
  values (p_key, 'credential.cleared', format('Credential "%s" was removed.', p_field), (select auth.uid()));
  perform write_audit('integration.secret_cleared', 'integration', p_key, jsonb_build_object('field', p_field));
end;
$$;

-- Records the outcome of "Test connection".
--   p_ok null  : no real test exists for this integration, or it is in demo
--                mode. Logged; the status does not change.
--   p_ok true  : a real test passed. Only then can a record become "connected".
--   p_ok false : a real test failed.
create or replace function admin_record_integration_test(p_key text, p_ok boolean, p_message text)
returns integration_status
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_row integrations%rowtype;
  v_status integration_status;
begin
  perform require_permission('integrations.configure');
  select * into v_row from integrations where key = p_key for update;
  if not found then raise exception 'unknown integration' using errcode = '22023'; end if;

  if p_ok is null or v_row.is_demo then
    insert into integration_logs (integration_key, event, level, message, actor_id)
    values (p_key, 'connection.test_skipped', 'warning', left(coalesce(p_message, ''), 500), (select auth.uid()));
    return v_row.status;
  end if;

  v_status := case when p_ok then 'connected' else 'error' end;
  update integrations set status = v_status, last_test_at = now(), last_test_ok = p_ok,
    last_test_message = left(coalesce(p_message, ''), 500), updated_at = now()
  where key = p_key;
  insert into integration_logs (integration_key, event, level, message, actor_id)
  values (p_key, case when p_ok then 'connection.test_passed' else 'connection.test_failed' end,
          case when p_ok then 'info' else 'error' end, left(coalesce(p_message, ''), 500), (select auth.uid()));
  perform write_audit('integration.tested', 'integration', p_key, jsonb_build_object('ok', p_ok));
  return v_status;
end;
$$;

-- Dashboard: add integration counts to the overview.
create or replace function admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform require_permission('admin.access');
  return jsonb_build_object(
    'users_total',      (select count(*) from auth.users),
    'users_active_30d', (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days'),
    'users_new_7d',     (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'staff',            (select count(*) from user_roles),
    'tools_total',      (select count(*) from tools),
    'tools_published',  (select count(*) from tools where status = 'published'),
    'categories',       (select count(*) from categories),
    'projects_total',   (select count(*) from autoflow_projects),
    'integrations_total',          (select count(*) from integrations),
    'integrations_connected',      (select count(*) from integrations where status = 'connected'),
    'integrations_configured',     (select count(*) from integrations where status = 'configured'),
    'integrations_demo',           (select count(*) from integrations where status = 'demo'),
    'integrations_not_configured', (select count(*) from integrations where status = 'not_configured'),
    'integrations_error',          (select count(*) from integrations where status = 'error'),
    'generated_at',     now()
  );
end;
$$;

-- Access --------------------------------------------------------------------------------

alter table integrations        enable row level security;
alter table integration_secrets enable row level security;
alter table integration_logs    enable row level security;
alter table integration_usage   enable row level security;

revoke all on integrations, integration_secrets, integration_logs, integration_usage
  from anon, authenticated;

do $$
declare f text;
begin
  foreach f in array array[
    'admin_list_integrations()', 'admin_list_integration_logs(text, integer)', 'integration_statuses()',
    'admin_update_integration(text, text, jsonb, boolean, boolean)',
    'admin_set_integration_secret(text, text, text, text)',
    'admin_clear_integration_secret(text, text)',
    'admin_record_integration_test(text, boolean, text)', 'admin_overview()'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
