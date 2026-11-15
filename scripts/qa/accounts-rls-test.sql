-- Security checks for migration 0006. Run by validate-migrations.sh.
-- Each check raises an exception on failure, which stops the run.

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.test');

do $$
declare n int; ws_a uuid; ws_a_dir uuid; ws_b uuid; proj uuid;
begin
  -- 1. The account trigger made a profile and two workspaces per user.
  select count(*) into n from profiles;   if n <> 2 then raise exception 'profiles: %', n; end if;
  select count(*) into n from workspaces; if n <> 4 then raise exception 'workspaces: %', n; end if;
  select id into ws_a     from workspaces where owner_id = '00000000-0000-0000-0000-00000000000a' and product = 'autoflow';
  select id into ws_a_dir from workspaces where owner_id = '00000000-0000-0000-0000-00000000000a' and product = 'directory';
  select id into ws_b     from workspaces where owner_id = '00000000-0000-0000-0000-00000000000b' and product = 'autoflow';

  -- 2. User A, through row level security.
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', true);

  select count(*) into n from workspaces; if n <> 2 then raise exception 'A sees % workspaces', n; end if;
  select count(*) into n from profiles;   if n <> 1 then raise exception 'A sees % profiles', n; end if;

  insert into autoflow_projects (workspace_id, title) values (ws_a, 'A project') returning id into proj;
  select count(*) into n from autoflow_project_stages where project_id = proj;
  if n <> 6 then raise exception 'stages seeded: %', n; end if;

  -- A cannot create a project in B's workspace.
  begin
    insert into autoflow_projects (workspace_id, title) values (ws_b, 'intruder');
    raise exception 'A inserted into B workspace';
  exception when insufficient_privilege then null; end;

  -- A project cannot live in a Directory workspace.
  begin
    insert into autoflow_projects (workspace_id, title) values (ws_a_dir, 'wrong product');
    raise exception 'project created in a Directory workspace';
  exception when raise_exception then
    if sqlerrm <> 'projects belong to an AutoFlow workspace' then raise; end if;
  end;

  -- A cannot create a second workspace or take over B's.
  begin
    insert into workspaces (owner_id, product, name) values ('00000000-0000-0000-0000-00000000000a', 'autoflow', 'x');
    raise exception 'A created a workspace';
  exception when insufficient_privilege then null; end;
  update workspaces set name = 'taken' where id = ws_b;
  get diagnostics n = row_count; if n <> 0 then raise exception 'A renamed B workspace'; end if;

  -- 3. User B sees none of A's data and cannot change it.
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', true);
  select count(*) into n from autoflow_projects;       if n <> 0 then raise exception 'B sees % projects', n; end if;
  select count(*) into n from autoflow_project_stages; if n <> 0 then raise exception 'B sees % stages', n; end if;
  update autoflow_projects set title = 'x' where id = proj;
  get diagnostics n = row_count; if n <> 0 then raise exception 'B updated A project'; end if;
  delete from autoflow_projects where id = proj;
  get diagnostics n = row_count; if n <> 0 then raise exception 'B deleted A project'; end if;
  update autoflow_project_stages set status = 'approved' where project_id = proj;
  get diagnostics n = row_count; if n <> 0 then raise exception 'B updated A stages'; end if;

  -- 4. A visitor sees nothing.
  set local role anon;
  perform set_config('request.jwt.claim.sub', '', true);
  select count(*) into n from profiles;          if n <> 0 then raise exception 'anon sees profiles'; end if;
  select count(*) into n from workspaces;        if n <> 0 then raise exception 'anon sees workspaces'; end if;
  select count(*) into n from autoflow_projects; if n <> 0 then raise exception 'anon sees projects'; end if;

  -- 5. Back as A: update a stage, then deleting the account removes everything.
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', true);
  update autoflow_project_stages set status = 'in_progress' where project_id = proj and stage = 'research';
  get diagnostics n = row_count; if n <> 1 then raise exception 'A could not update own stage'; end if;

  reset role;
  delete from auth.users where id = '00000000-0000-0000-0000-00000000000a';
  select count(*) into n from autoflow_projects; if n <> 0 then raise exception 'projects survived account deletion'; end if;
  select count(*) into n from workspaces;        if n <> 2 then raise exception 'workspaces after deletion: %', n; end if;

  raise notice 'accounts RLS: 5 groups of checks passed';
end $$;
