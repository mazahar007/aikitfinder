#!/usr/bin/env node
/**
 * Authentication and data-isolation checks against the real Supabase project
 * and a running production build.
 *
 *   node scripts/qa/auth-check.cjs http://localhost:3111
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from
 * the environment or .env.local. Needs SUPABASE_SECRET_KEY in the environment
 * for one purpose only: creating two confirmed throwaway test users and
 * deleting them afterwards. The app itself never uses that key. Nothing
 * secret is printed. Exits with code 1 if any check fails.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const { chromium } = require("playwright");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const fs = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const crypto = require("node:crypto");

const BASE = process.argv[2] || "http://localhost:3111";
if (fs.existsSync(".env.local"))
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!URL_ || !PUB || !SECRET) {
  console.error(
    "Missing Supabase settings (URL, publishable key, or SUPABASE_SECRET_KEY for test users).",
  );
  process.exit(2);
}

const results = [];
function check(group, name, pass, detail = "") {
  results.push({ group, name, pass: !!pass });
  console.log(`${pass ? "PASS" : "FAIL"}  [${group}] ${name}${detail ? "  — " + detail : ""}`);
}

async function api(path, { method = "GET", token, key = PUB, body, prefer } = {}) {
  const res = await fetch(URL_ + path, {
    method,
    headers: {
      apikey: key,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}
const admin = (path, opts = {}) => api(path, { ...opts, key: SECRET, token: SECRET });

async function createUser(tag) {
  const email = `akf-qa-${tag}-${Date.now()}@example.com`;
  const password = crypto.randomBytes(18).toString("base64url");
  const r = await admin("/auth/v1/admin/users", {
    method: "POST",
    body: { email, password, email_confirm: true },
  });
  if (r.status !== 200) throw new Error(`could not create test user (${r.status})`);
  const login = await api("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  return { id: r.json.id, email, password, token: login.json?.access_token };
}

const rows = (r) => (Array.isArray(r.json) ? r.json.length : -1);

async function database(a, b) {
  const g = "database";
  // Visitors.
  for (const t of ["profiles", "workspaces", "autoflow_projects", "autoflow_project_stages"]) {
    const r = await api(`/rest/v1/${t}?select=*`);
    check(
      g,
      `visitor cannot read ${t}`,
      r.status >= 400 || rows(r) === 0,
      `status ${r.status}, rows ${rows(r)}`,
    );
  }
  const tools = await api("/rest/v1/tools?select=id");
  check(
    g,
    "visitor can read the public catalog (empty)",
    tools.status === 200 && rows(tools) === 0,
    `status ${tools.status}`,
  );
  const anonWrite = await api("/rest/v1/tools", { method: "POST", body: { slug: "x", name: "x" } });
  check(
    g,
    "visitor cannot write to the catalog",
    anonWrite.status >= 400,
    `status ${anonWrite.status}`,
  );
  const authWrite = await api("/rest/v1/categories", {
    method: "POST",
    token: a.token,
    body: { slug: "qa", name: "qa" },
  });
  check(
    g,
    "signed-in user cannot write to the catalog",
    authWrite.status >= 400,
    `status ${authWrite.status}`,
  );

  // User A: own rows only.
  const pa = await api("/rest/v1/profiles?select=id", { token: a.token });
  check(
    g,
    "sign-up created a profile; A sees only their own",
    rows(pa) === 1 && pa.json[0].id === a.id,
  );
  const wa = await api("/rest/v1/workspaces?select=id,product,owner_id", { token: a.token });
  check(
    g,
    "A has exactly two workspaces (directory, autoflow), all owned by A",
    rows(wa) === 2 &&
      wa.json.every((w) => w.owner_id === a.id) &&
      wa.json
        .map((w) => w.product)
        .sort()
        .join() === "autoflow,directory",
  );
  const wb = await api("/rest/v1/workspaces?select=id,product", { token: b.token });
  a.ws = wa.json.find((w) => w.product === "autoflow").id;
  a.wsDir = wa.json.find((w) => w.product === "directory").id;
  b.ws = wb.json.find((w) => w.product === "autoflow").id;

  const made = await api("/rest/v1/autoflow_projects?select=id", {
    method: "POST",
    token: a.token,
    prefer: "return=representation",
    body: { workspace_id: a.ws, title: "QA isolation project" },
  });
  check(
    g,
    "A can create a project in their own workspace",
    made.status === 201 && rows(made) === 1,
    `status ${made.status}`,
  );
  a.project = made.json?.[0]?.id;
  const st = await api(`/rest/v1/autoflow_project_stages?select=stage&project_id=eq.${a.project}`, {
    token: a.token,
  });
  check(g, "the project got its six stages", rows(st) === 6);

  const intr = await api("/rest/v1/autoflow_projects", {
    method: "POST",
    token: a.token,
    body: { workspace_id: b.ws, title: "intruder" },
  });
  check(
    g,
    "A cannot create a project in B's workspace",
    intr.status >= 400,
    `status ${intr.status}`,
  );
  const wrong = await api("/rest/v1/autoflow_projects", {
    method: "POST",
    token: a.token,
    body: { workspace_id: a.wsDir, title: "wrong product" },
  });
  check(
    g,
    "a project cannot be created in a Directory workspace",
    wrong.status >= 400,
    `status ${wrong.status}`,
  );
  const newWs = await api("/rest/v1/workspaces", {
    method: "POST",
    token: a.token,
    body: { owner_id: a.id, product: "autoflow", name: "x" },
  });
  check(g, "A cannot create extra workspaces", newWs.status >= 400, `status ${newWs.status}`);
  const steal = await api(`/rest/v1/workspaces?id=eq.${b.ws}`, {
    method: "PATCH",
    token: a.token,
    prefer: "return=representation",
    body: { name: "taken" },
  });
  check(
    g,
    "A cannot rename B's workspace",
    steal.status >= 400 || rows(steal) === 0,
    `status ${steal.status}`,
  );
  const reown = await api(`/rest/v1/workspaces?id=eq.${a.wsDir}`, {
    method: "PATCH",
    token: a.token,
    body: { owner_id: b.id },
  });
  check(g, "A cannot reassign a workspace's owner", reown.status >= 400, `status ${reown.status}`);
  const move = await api(`/rest/v1/autoflow_projects?id=eq.${a.project}`, {
    method: "PATCH",
    token: a.token,
    body: { workspace_id: b.ws },
  });
  check(
    g,
    "A cannot move a project to another workspace",
    move.status >= 400,
    `status ${move.status}`,
  );

  // User B against A's data.
  const see = await api(`/rest/v1/autoflow_projects?select=id&id=eq.${a.project}`, {
    token: b.token,
  });
  check(g, "B cannot read A's project", rows(see) === 0, `rows ${rows(see)}`);
  const all = await api("/rest/v1/autoflow_projects?select=id", { token: b.token });
  check(g, "B's project list is empty", rows(all) === 0);
  const sts = await api(
    `/rest/v1/autoflow_project_stages?select=stage&project_id=eq.${a.project}`,
    { token: b.token },
  );
  check(g, "B cannot read A's stages", rows(sts) === 0);
  const upd = await api(`/rest/v1/autoflow_projects?id=eq.${a.project}`, {
    method: "PATCH",
    token: b.token,
    prefer: "return=representation",
    body: { title: "hacked" },
  });
  check(g, "B cannot edit A's project", rows(upd) === 0, `status ${upd.status}`);
  const del = await api(`/rest/v1/autoflow_projects?id=eq.${a.project}`, {
    method: "DELETE",
    token: b.token,
    prefer: "return=representation",
  });
  check(g, "B cannot delete A's project", rows(del) === 0, `status ${del.status}`);
  const stu = await api(`/rest/v1/autoflow_project_stages?project_id=eq.${a.project}`, {
    method: "PATCH",
    token: b.token,
    prefer: "return=representation",
    body: { status: "approved" },
  });
  check(g, "B cannot change A's stages", rows(stu) === 0, `status ${stu.status}`);
  const pb = await api(`/rest/v1/profiles?select=id&id=eq.${a.id}`, { token: b.token });
  check(g, "B cannot read A's profile", rows(pb) === 0);
  const still = await api(`/rest/v1/autoflow_projects?select=title&id=eq.${a.project}`, {
    token: a.token,
  });
  check(
    g,
    "A's project is unchanged after B's attempts",
    still.json?.[0]?.title === "QA isolation project",
  );
  const forged = await api("/rest/v1/profiles?select=id", { token: a.token.slice(0, -3) + "abc" });
  check(
    g,
    "a tampered session token is rejected",
    forged.status === 401,
    `status ${forged.status}`,
  );
}

const mainText = (page) => page.locator("main").innerText();

async function fillAndSubmit(page, mode, email, password) {
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("tab", { name: mode === "login" ? "Log in" : "Sign up" }).click();
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Password").fill(password);
  await dialog.locator('button[type="submit"]').click();
  return dialog;
}

async function browserChecks(browser, a, b) {
  const g = "sign-in";
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));

  // Signed out.
  await page.goto(BASE + "/autoflow/app");
  await page
    .getByRole("heading", { name: /sign in to open your workspace/i })
    .first()
    .waitFor();
  check(
    g,
    "signed out: workspace shows only the sign-in prompt",
    (await page.getByRole("navigation", { name: "Workspace" }).count()) === 0,
  );
  await page.goto(`${BASE}/autoflow/app/projects/${a.project}`);
  await page
    .getByRole("heading", { name: /sign in to open your workspace/i })
    .first()
    .waitFor();
  const html = await page.content();
  check(g, "signed out: a project URL reveals nothing", !html.includes("QA isolation project"));
  const s0 = await (await page.request.get(BASE + "/auth/session")).json();
  check(g, "signed out: session endpoint reports no user", s0.user === null);
  await page.goto(BASE + "/account");
  await page.getByText("Log in to see your account.").first().waitFor();
  check(g, "signed out: account page asks to log in", true);

  // Wrong password.
  await page.goto(`${BASE}/autoflow/app/projects/${a.project}`);
  await page.getByRole("main").getByRole("button", { name: "Log in" }).click();
  let dialog = await fillAndSubmit(page, "login", a.email, "definitely-wrong-password");
  await dialog.getByRole("alert").waitFor();
  check(
    g,
    "wrong password: clear error, no session",
    /do not match/i.test(await dialog.getByRole("alert").innerText()) &&
      (await context.cookies()).filter((c) => c.name.startsWith("sb-")).length === 0,
  );

  // Log in, landing on the page that was asked for.
  await dialog.getByLabel("Password").fill(a.password);
  await dialog.locator('button[type="submit"]').click();
  await page.waitForURL(`**/autoflow/app/projects/${a.project}`, { waitUntil: "load" });
  await page.getByRole("heading", { name: "QA isolation project" }).first().waitFor();
  check(g, "log in works and returns to the requested page", true);
  const stages = await page.locator("main ol > li h3:visible").allTextContents();
  check(g, "the owner sees their project with six stages", stages.length === 6);

  const cookies = (await context.cookies()).filter((c) => c.name.startsWith("sb-"));
  check(
    g,
    "session cookies are HttpOnly, Secure and SameSite=Lax",
    cookies.length > 0 && cookies.every((c) => c.httpOnly && c.secure && c.sameSite === "Lax"),
    `${cookies.length} cookie(s)`,
  );
  check(
    g,
    "page scripts cannot read the session",
    !(await page.evaluate(() => document.cookie)).includes("sb-"),
  );
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  check(g, "no token is kept in browser storage", !/access_token|refresh_token|eyJ/.test(stored));

  await page.reload({ waitUntil: "load" });
  await page.getByRole("heading", { name: "QA isolation project" }).first().waitFor();
  check(g, "session survives a reload", true);
  const page2 = await context.newPage();
  await page2.goto(BASE + "/autoflow/app/projects");
  await page2
    .getByRole("link", { name: /QA isolation project/ })
    .first()
    .waitFor();
  check(
    g,
    "session is shared across tabs; project list shows the owner's project",
    (await page2.getByText("Sample · layout only").count()) === 0,
  );
  check(
    g,
    "workspace shows who is signed in",
    (await page2.getByRole("banner").innerText()).includes(a.email),
  );
  check(
    g,
    "New project stays disabled (not built)",
    await page2.getByRole("button", { name: "New project" }).isDisabled(),
  );
  await page2.close();

  // Shared identity: the same session on the parent site and the Directory.
  await page.goto(BASE + "/");
  await page.locator("header").getByRole("link", { name: "Account" }).waitFor();
  check(
    g,
    "parent header shows Account and Log out when signed in",
    (await page.locator("header").getByRole("button", { name: "Log out" }).count()) === 1,
  );
  await page.goto(BASE + "/directory");
  await page.locator("header").getByRole("link", { name: "Account" }).waitFor();
  check(g, "Directory header shows the same account", true);
  await page.goto(BASE + "/account");
  await page.getByText(a.email).first().waitFor();
  const acct = await mainText(page);
  check(
    g,
    "account page shows the email and both workspaces",
    /AI Tools Directory/i.test(acct) && /AutoFlow AI/i.test(acct),
  );

  // Log out.
  await page.getByRole("main").getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(BASE + "/", { waitUntil: "load" });
  await page.locator("header").getByRole("button", { name: "Sign up" }).waitFor();
  check(
    g,
    "log out ends the session and clears its cookies",
    (await context.cookies()).filter((c) => c.name.startsWith("sb-") && c.value).length === 0,
  );
  await page.goto(`${BASE}/autoflow/app/projects/${a.project}`);
  await page
    .getByRole("heading", { name: /sign in to open your workspace/i })
    .first()
    .waitFor();
  check(g, "after log out the workspace is closed again", true);

  // Unsafe return address is ignored.
  await page.getByRole("main").getByRole("button", { name: "Log in" }).click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("tab", { name: "Log in" }).click();
  await dialog
    .locator('input[name="returnTo"]')
    .evaluate((el) => (el.value = "https://example.org/phish"));
  await dialog.getByLabel("Email").fill(a.email);
  await dialog.getByLabel("Password").fill(a.password);
  await dialog.locator('button[type="submit"]').click();
  await page.waitForURL(BASE + "/", { waitUntil: "load" });
  check(
    g,
    "an off-site return address is ignored",
    new URL(page.url()).origin === new URL(BASE).origin,
  );
  check(g, "no page errors during the journey", errors.length === 0, errors.join(" | "));
  await context.close();

  // User B, on a phone, cannot open A's project.
  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const p = await phone.newPage();
  await p.goto(`${BASE}/autoflow/app/projects/${a.project}`);
  await p.getByRole("main").getByRole("button", { name: "Log in" }).click();
  dialog = await fillAndSubmit(p, "login", b.email, b.password);
  await p.waitForURL(`**/autoflow/app/projects/${a.project}`, { waitUntil: "load" });
  await p
    .getByText(/couldn.t find that in your workspace/i)
    .first()
    .waitFor();
  check(
    "isolation",
    "phone: B logs in but A's project is 'not found' for B",
    !(await p.content()).includes("QA isolation project"),
  );
  await p.goto(BASE + "/autoflow/app/projects");
  await p.getByText("No projects yet.").first().waitFor();
  check("isolation", "B's project list is empty in the app", true);
  const overflow = await p.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(
    "isolation",
    "signed-in workspace has no horizontal overflow on a phone",
    overflow <= 0,
    `${overflow}px`,
  );
  await phone.close();

  // Sign-up form: validation and the real response for a new address.
  const su = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const sp = await su.newPage();
  await sp.goto(BASE + "/account");
  await sp.getByRole("main").getByRole("button", { name: "Sign up" }).click();
  dialog = await fillAndSubmit(sp, "signup", `akf-qa-signup-${Date.now()}@example.com`, "short");
  await sp.waitForTimeout(600);
  check(
    "sign-up",
    "a short password is refused before anything is sent",
    (await dialog.getByLabel("Password").evaluate((el) => !el.validity.valid)) &&
      (await dialog.getByRole("status").count()) === 0,
  );
  const box = await dialog.boundingBox();
  check("sign-up", "dialog fits a phone screen", box.width <= 390 && box.x >= 0);
  await su.close();
}

(async () => {
  let a, b;
  const browser = await chromium.launch();
  try {
    a = await createUser("a");
    b = await createUser("b");
    check("setup", "two confirmed test users created and logged in", a.token && b.token);
    await database(a, b);
    await browserChecks(browser, a, b);
  } catch (e) {
    check("run", "script completed", false, String(e).slice(0, 300));
  } finally {
    await browser.close();
    for (const u of [a, b])
      if (u?.id) await admin(`/auth/v1/admin/users/${u.id}`, { method: "DELETE" });
    if (a?.project) {
      const left = await admin(`/rest/v1/autoflow_projects?select=id&id=eq.${a.project}`);
      const ws = await admin(`/rest/v1/workspaces?select=id&owner_id=in.(${a.id},${b.id})`);
      check(
        "cleanup",
        "deleting the test accounts removed their workspaces and projects",
        rows(left) === 0 && rows(ws) === 0,
      );
    }
  }
  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`,
  );
  process.exit(failed.length ? 1 : 0);
})();
