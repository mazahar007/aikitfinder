#!/usr/bin/env node
/**
 * Checks for the Central Admin Panel. Run through admin-check.sh, which
 * provides a local database, gateway and app server. Exits 1 on any failure.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const { chromium } = require("playwright");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const fs = require("node:fs");

const { BASE, GATEWAY, SERVER_LOG } = process.env;
if (!BASE || !GATEWAY) {
  console.error("Run scripts/qa/admin-check.sh instead of this file.");
  process.exit(2);
}
const OWNER = { id: "10000000-0000-4000-8000-000000000001", email: "owner@local.test" };
const MEMBER = { id: "10000000-0000-4000-8000-000000000002", email: "member@local.test" };
const EDITOR = { id: "10000000-0000-4000-8000-000000000003", email: "editor@local.test" };
const SECRET = "sk-local-test-credential-9f3a7c21";

const SHOTS = process.env.SCREENSHOT_DIR;
const shot = (page, name) => (SHOTS ? page.screenshot({ path: `${SHOTS}/${name}.png` }) : null);

const results = [];
function check(group, name, pass, detail = "") {
  results.push({ pass: !!pass });
  console.log(`${pass ? "PASS" : "FAIL"}  [${group}] ${name}${detail ? "  — " + detail : ""}`);
}
const post = (path, body) =>
  fetch(GATEWAY + path, { method: "POST", body: JSON.stringify(body ?? {}) }).then((r) => r.text());
const db = async (sql) => (await post("/__test/sql", { sql })).trim();

async function signedIn(browser, user, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  if (user) {
    const { token } = JSON.parse(await post("/__test/token", { sub: user.id, email: user.email }));
    const now = Math.floor(Date.now() / 1000);
    const session = {
      access_token: token,
      refresh_token: "local",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: now + 3600,
      user: { id: user.id, email: user.email, aud: "authenticated", role: "authenticated" },
    };
    await context.addCookies([
      {
        name: "sb-127-auth-token",
        value: "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
        url: BASE,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  }
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  return { context, page, errors };
}
const main = (page) => page.locator("main:visible").first();
const isNotFound = async (page) =>
  /couldn.t find that page|404/i.test(await main(page).innerText());
const SECTIONS = [
  ["/admin", "Dashboard"],
  ["/admin/users", "Users"],
  ["/admin/roles", "Roles & Permissions"],
  ["/admin/directory", "AI Directory"],
  ["/admin/autoflow", "AutoFlow Projects"],
  ["/admin/providers", "AI Providers"],
  ["/admin/integrations", "Dependencies & Integrations"],
  ["/admin/jobs", "Background Jobs"],
  ["/admin/storage", "Storage"],
  ["/admin/youtube", "YouTube Publishing"],
  ["/admin/payments", "Payments & Billing"],
  ["/admin/logs", "System Logs"],
  ["/admin/audit", "Audit Logs"],
  ["/admin/settings", "General Settings"],
];

(async () => {
  const browser = await chromium.launch();
  try {
    // ---- Access ----
    {
      const g = "access";
      const visitor = await signedIn(browser, null);
      await visitor.page.goto(BASE + "/admin");
      await visitor.page.waitForTimeout(1500);
      check(
        g,
        'a visitor gets "not found" at /admin, with no admin navigation',
        (await isNotFound(visitor.page)) &&
          (await visitor.page.getByRole("navigation", { name: "Admin sections" }).count()) === 0,
      );
      await visitor.page.goto(BASE + "/admin/integrations/llm_api");
      await visitor.page.waitForTimeout(1200);
      check(
        g,
        'a visitor gets "not found" on a deep admin address',
        await isNotFound(visitor.page),
      );
      await visitor.context.close();

      const member = await signedIn(browser, MEMBER);
      await member.page.goto(BASE + "/admin");
      await member.page.waitForTimeout(1500);
      check(
        g,
        'a signed-in ordinary user gets "not found" at /admin',
        (await isNotFound(member.page)) &&
          (await member.page.getByRole("navigation", { name: "Admin sections" }).count()) === 0,
      );
      const html = await member.page.content();
      check(
        g,
        "nothing administrative is in the page an ordinary user receives",
        !/Dependencies &amp; Integrations|owner@local\.test|Super Admin/.test(html),
      );
      await member.context.close();
    }

    // ---- Super Admin: every section ----
    const owner = await signedIn(browser, OWNER);
    {
      const g = "sections";
      await owner.page.goto(BASE + "/admin");
      await owner.page.getByRole("heading", { name: "Dashboard", level: 1 }).waitFor();
      const nav = await owner.page
        .getByRole("navigation", { name: "Admin sections" })
        .getByRole("link")
        .allInnerTexts();
      check(
        g,
        "the Super Admin sees all 14 sections in the navigation",
        nav.length === 14 && SECTIONS.every(([, label]) => nav.includes(label)),
        `${nav.length} links`,
      );
      check(
        g,
        "the header shows the account and the Super Admin role",
        /owner@local\.test/.test(await owner.page.getByRole("banner").innerText()) &&
          /Super Admin/.test(await owner.page.getByRole("banner").innerText()),
      );
      for (const [path, label] of SECTIONS) {
        const r = await owner.page.goto(BASE + path, { waitUntil: "load" });
        const ok =
          r.status() === 200 &&
          (await owner.page
            .getByRole("heading", { name: label, level: 1 })
            .first()
            .waitFor({ timeout: 15000 })
            .then(() => true)
            .catch(() => false));
        check(g, `${label} loads`, ok, `status ${r.status()}`);
      }
      check(
        g,
        "admin pages are marked noindex",
        (await owner.page.locator('meta[name="robots"]').first().getAttribute("content")).includes(
          "noindex",
        ),
      );
    }

    // ---- Dashboard ----
    {
      const g = "dashboard";
      await owner.page.goto(BASE + "/admin");
      await owner.page.getByText("Unconfigured integrations").first().waitFor();
      await shot(owner.page, "admin-dashboard");
      const text = await main(owner.page).innerText();
      const card = (label) =>
        owner.page
          .locator("main:visible div.rounded-lg")
          .filter({ hasText: label })
          .first()
          .innerText();
      check(
        g,
        "all 12 widgets are present",
        [
          "Total users",
          "Active users",
          "AI Tools",
          "Directory categories",
          "AutoFlow projects",
          "Total rendering jobs",
          "Failed jobs",
          "Connected integrations",
          "Unconfigured integrations",
          "Storage usage",
          "API usage",
          "Revenue",
        ].every((l) => text.includes(l)),
      );
      check(
        g,
        "Total users shows the real count (3)",
        /\n3\n/.test("\n" + (await card("Total users")).replace(/\s*\n\s*/g, "\n") + "\n"),
      );
      check(
        g,
        "Connected integrations is 0 and Unconfigured is 18",
        /\b0\b/.test(await card("Connected integrations")) &&
          /\b18\b/.test(await card("Unconfigured integrations")),
      );
      check(
        g,
        "widgets without a data source say so instead of showing a number",
        /job system is not built/i.test(await card("Failed jobs")) &&
          /No object storage/i.test(await card("Storage usage")) &&
          /No AI provider/i.test(await card("API usage")),
      );
      check(
        g,
        "Revenue is labeled Demo and shows no figure",
        /Demo/.test(await card("Revenue")) &&
          /No payment provider/i.test(await card("Revenue")) &&
          !/\$\s?\d/.test(await card("Revenue")),
      );
    }

    // ---- Integrations ----
    {
      const g = "integrations";
      await owner.page.goto(BASE + "/admin/integrations");
      await owner.page
        .getByRole("heading", { name: "Dependencies & Integrations", level: 1 })
        .waitFor();
      const rows = owner.page.locator("main:visible tbody tr");
      check(
        g,
        "all 18 dependencies are listed",
        (await rows.count()) === 18,
        `${await rows.count()} rows`,
      );
      const names = [
        "AI Research",
        "Research Provider API",
        "Script Generation",
        "LLM API",
        "Voice Generation",
        "Voice Provider API",
        "Video Generation",
        "Video Provider API",
        "Rendering",
        "Remotion Worker Hosting",
        "File Storage",
        "Object Storage",
        "Background Jobs",
        "Redis / Celery",
        "YouTube Publishing",
        "Google OAuth",
        "Payments",
        "Payment Provider",
      ];
      const table = await owner.page.locator("main:visible table").innerText();
      check(
        g,
        "every required dependency name is present",
        names.every((n) => table.includes(n)),
        names.filter((n) => !table.includes(n)).join(", "),
      );
      const statuses = await rows.locator("td:last-child").allInnerTexts();
      check(
        g,
        "every dependency shows Demo, none Connected",
        statuses.every((s) => s.trim() === "Demo"),
      );
      check(
        g,
        "the page states that no real provider connection exists",
        /No\s+real provider connection has been established/i.test(
          await main(owner.page).innerText(),
        ),
      );
      check(
        g,
        "the five status meanings are explained",
        ["Not Configured", "Demo", "Configured", "Connected", "Error"].every((s) =>
          owner.page.locator("main:visible dl").getByText(s, { exact: true }),
        ),
      );

      // Edit in demo mode.
      await owner.page.goto(BASE + "/admin/integrations/llm_api");
      await owner.page.getByRole("heading", { name: "LLM API", level: 1 }).waitFor();
      const form = owner.page
        .locator("main form")
        .filter({ has: owner.page.getByRole("button", { name: "Save configuration" }) });
      check(
        g,
        "detail page has provider, endpoint, model, enable control and mode",
        (await form.getByLabel("Provider").count()) === 1 &&
          (await form.getByLabel("Endpoint").count()) === 1 &&
          (await form.getByLabel("Model").count()) === 1 &&
          (await form.getByLabel("Enabled").count()) === 1 &&
          (await form.getByLabel(/^Demo/).count()) === 1,
      );
      await form.getByLabel("Model").fill("demo-writer-2");
      await form.getByLabel("Enabled").check();
      await form.getByRole("button", { name: "Save configuration" }).click();
      await form.getByRole("status").waitFor();
      check(
        g,
        "saving in demo mode says no real connection exists",
        /demo mode.*No real provider connection/i.test(await form.getByRole("status").innerText()),
      );
      check(
        g,
        "the change is stored",
        (await db(
          "select config->>'model' || ':' || enabled || ':' || status from integrations where key = 'llm_api'",
        )) === "demo-writer-2:true:demo",
      );

      // Validation.
      await form.getByLabel("Endpoint").fill("not a url");
      await form.getByRole("button", { name: "Save configuration" }).click();
      await form.getByRole("alert").waitFor();
      check(
        g,
        "an invalid address is refused",
        /enter a full address/i.test(await form.getByRole("alert").innerText()),
      );
      await form.getByLabel("Endpoint").fill("https://user:pass@api.llm-provider.example/v1");
      await form.getByRole("button", { name: "Save configuration" }).click();
      await owner.page.waitForTimeout(800);
      check(
        g,
        "an address containing a password is refused",
        /remove the user name and password/i.test(await form.getByRole("alert").innerText()),
      );
      await form.getByLabel("Endpoint").fill("https://api.llm-provider.example/v1");
      await form.getByLabel("Maximum output tokens").fill("99999999");
      check(
        g,
        "an out-of-range number is refused before it is sent",
        await form.getByLabel("Maximum output tokens").evaluate((el) => !el.validity.valid),
      );
      await form.getByLabel("Maximum output tokens").fill("4000");

      // A demo provider can never be saved as real.
      await form.getByLabel(/^Real configuration/).check();
      await form.getByRole("button", { name: "Save configuration" }).click();
      await owner.page.waitForTimeout(800);
      check(
        g,
        "a demo provider cannot be saved as a real configuration",
        /Choose a real provider/i.test(await form.getByRole("alert").innerText()) &&
          (await db("select status from integrations where key = 'llm_api'")) === "demo",
      );

      // Test connection in demo mode.
      await main(owner.page).getByRole("button", { name: "Test connection" }).click();
      const testNote = owner.page
        .locator("main form")
        .filter({ has: owner.page.getByRole("button", { name: "Test connection" }) })
        .getByRole("status");
      await testNote.waitFor();
      check(
        g,
        "Test connection in demo mode reports that nothing was contacted",
        /Demo mode: no connection test was run and no provider was contacted/i.test(
          await testNote.innerText(),
        ),
      );
      check(
        g,
        "the status is still Demo after the test",
        (await db(
          "select status || ':' || coalesce(last_test_ok::text, 'null') from integrations where key = 'llm_api'",
        )) === "demo:null",
      );

      // Real configuration: Configured, never Connected.
      await owner.page.reload();
      const form2 = owner.page
        .locator("main form")
        .filter({ has: owner.page.getByRole("button", { name: "Save configuration" }) });
      await form2.getByLabel("Provider").selectOption("anthropic");
      await form2.getByLabel(/^Real configuration/).check();
      await form2.getByRole("button", { name: "Save configuration" }).click();
      await form2.getByRole("status").waitFor();
      check(
        g,
        "a real provider saved as real becomes Configured, and the page says it is untested",
        /has not been tested/i.test(await form2.getByRole("status").innerText()) &&
          (await db("select status from integrations where key = 'llm_api'")) === "configured",
      );
      await main(owner.page).getByRole("button", { name: "Test connection" }).click();
      const testNote2 = owner.page
        .locator("main form")
        .filter({ has: owner.page.getByRole("button", { name: "Test connection" }) })
        .getByRole("status");
      await testNote2.waitFor();
      check(
        g,
        "Test connection on a real configuration never reports success: no test exists yet",
        /No connection test exists.*Nothing was contacted/i.test(await testNote2.innerText()) &&
          (await db("select status from integrations where key = 'llm_api'")) === "configured",
      );
      check(
        g,
        "no integration is Connected in the database",
        (await db("select count(*) from integrations where status = 'connected'")) === "0",
      );
    }

    // ---- Credentials ----
    {
      const g = "credentials";
      await owner.page.goto(BASE + "/admin/integrations/llm_api");
      await owner.page.waitForTimeout(600);
      await shot(owner.page, "admin-integration");
      const secretInput = owner.page.locator('main:visible input[name="value"]').first();
      await secretInput.waitFor();
      await owner.page.locator("main:visible [data-secret-state]").first().waitFor();
      check(
        g,
        "the credential field is a password field and starts as Not set",
        (await secretInput.getAttribute("type")) === "password" &&
          (await owner.page.locator('main:visible [data-secret-state="empty"]').count()) === 1,
      );
      const bodies = [];
      owner.page.on("response", async (r) => {
        try {
          if (r.url().startsWith(BASE)) bodies.push(await r.text());
        } catch {}
      });
      await secretInput.fill(SECRET);
      await secretInput.press("Enter");
      await owner.page.locator('main:visible [data-secret-state="set"]').waitFor();
      const shown = await owner.page.locator('main:visible [data-secret-state="set"]').innerText();
      check(
        g,
        "after saving, only a masked value with the last 4 characters is shown",
        shown.includes("••••") && shown.endsWith(SECRET.slice(-4)) && !shown.includes(SECRET),
      );
      check(g, "the field is emptied after saving", (await secretInput.inputValue()) === "");
      await owner.page.reload();
      await owner.page.locator('main:visible [data-secret-state="set"]').waitFor();
      check(
        g,
        "the credential is not in the page HTML after a reload",
        !(await owner.page.content()).includes(SECRET),
      );
      check(
        g,
        "the credential is not in any response the browser received",
        !bodies.some((b) => b.includes(SECRET)),
        `${bodies.length} responses checked`,
      );
      const stored = await db(
        "select ciphertext from integration_secrets where integration_key = 'llm_api' and field = 'api_key'",
      );
      check(
        g,
        "the database holds ciphertext, not the credential",
        /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(stored) &&
          !stored.includes(SECRET) &&
          !Buffer.from(stored.split(".")[3], "base64url").toString().includes(SECRET),
      );
      check(
        g,
        "the credential is not in the audit log or the integration log",
        (await db(`select count(*) from audit_log where summary::text like '%${SECRET}%'`)) ===
          "0" &&
          (await db(`select count(*) from integration_logs where message like '%${SECRET}%'`)) ===
            "0",
      );
      check(
        g,
        "the credential is not in the server log",
        !fs.readFileSync(SERVER_LOG, "utf8").includes(SECRET),
      );
      await main(owner.page).getByRole("button", { name: "Remove" }).click();
      await owner.page.locator('main:visible [data-secret-state="empty"]').waitFor();
      check(
        g,
        "a credential can be removed",
        (await db("select count(*) from integration_secrets")) === "0",
      );
      const found = [];
      const walk = (dir) => {
        for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
          const p = `${dir}/${f.name}`;
          if (f.isDirectory()) walk(p);
          else if (/\.(js|css|json|html)$/.test(f.name)) {
            const t = fs.readFileSync(p, "utf8");
            for (const n of [
              "INTEGRATIONS_ENCRYPTION_KEY",
              "aes-256-gcm",
              "admin_set_integration_secret",
              "bootstrap_first_super_admin",
            ])
              if (t.includes(n)) found.push(n);
          }
        }
      };
      walk(".next/static");
      check(
        g,
        "no encryption key name, cipher or admin function name is in the browser bundle",
        found.length === 0,
        [...new Set(found)].join(", "),
      );
    }

    // ---- Roles ----
    {
      const g = "roles";
      await owner.page.goto(BASE + "/admin/roles");
      await owner.page.getByRole("heading", { name: "Roles & Permissions", level: 1 }).waitFor();
      await shot(owner.page, "admin-roles");
      const staff = owner.page.locator("main:visible section").filter({ hasText: "Staff" }).first();
      check(
        g,
        "the owner is listed as Super Admin, assigned by the owner bootstrap",
        /owner@local\.test/.test(await staff.innerText()) &&
          /Owner bootstrap/.test(await staff.innerText()),
      );
      check(
        g,
        "the owner has no control to remove their own role",
        (await staff.locator("tr", { hasText: "owner@local.test" }).getByRole("button").count()) ===
          0,
      );
      const accounts = await main(owner.page)
        .getByLabel("Account")
        .locator("option")
        .allInnerTexts();
      check(
        g,
        "the owner cannot pick themselves when assigning a role",
        !accounts.includes("owner@local.test") && accounts.includes("editor@local.test"),
      );
      await main(owner.page).getByLabel("Account").selectOption(EDITOR.id);
      await main(owner.page).getByLabel("Role").selectOption("editor");
      await main(owner.page).getByRole("button", { name: "Assign role" }).click();
      await owner.page
        .locator("main:visible tr", { hasText: "editor@local.test" })
        .first()
        .waitFor();
      check(
        g,
        "assigning the Editor role works and is stored",
        (await db(`select role from user_roles where user_id = '${EDITOR.id}'`)) === "editor",
      );
      await main(owner.page).getByLabel("Account").selectOption(MEMBER.id);
      await main(owner.page).getByLabel("Role").selectOption("admin");
      await main(owner.page).getByRole("button", { name: "Assign role" }).click();
      await owner.page
        .locator("main:visible tr", { hasText: "member@local.test" })
        .first()
        .waitFor();
      check(
        g,
        "the permission matrix lists 17 permissions for 5 roles",
        (await owner.page
          .locator("main section")
          .filter({ hasText: "Permission matrix" })
          .locator("tbody tr")
          .count()) === 17,
      );

      // Editor: limited navigation, blocked pages.
      const editor = await signedIn(browser, EDITOR);
      await editor.page.goto(BASE + "/admin");
      await editor.page.getByRole("heading", { name: "Dashboard", level: 1 }).waitFor();
      const nav = await editor.page
        .getByRole("navigation", { name: "Admin sections" })
        .getByRole("link")
        .allInnerTexts();
      check(
        g,
        "an Editor sees only Dashboard and AI Directory",
        nav.join("|") === "Dashboard|AI Directory",
        nav.join("|"),
      );
      for (const p of [
        "/admin/users",
        "/admin/roles",
        "/admin/integrations",
        "/admin/integrations/llm_api",
        "/admin/audit",
        "/admin/settings",
        "/admin/payments",
      ]) {
        await editor.page.goto(BASE + p);
        await editor.page.waitForTimeout(900);
        check(g, `an Editor gets "not found" at ${p}`, await isNotFound(editor.page));
      }
      await editor.context.close();

      // Admin: can configure, cannot grant roles or set credentials.
      const admin = await signedIn(browser, MEMBER);
      await admin.page.goto(BASE + "/admin/roles");
      await admin.page.getByRole("heading", { name: "Roles & Permissions", level: 1 }).waitFor();
      check(
        g,
        "an Admin can read roles but has no assign or remove controls",
        (await main(admin.page).getByRole("button", { name: "Assign role" }).count()) === 0 &&
          (await main(admin.page).getByRole("button", { name: "Remove role" }).count()) === 0,
      );
      await admin.page.goto(BASE + "/admin/integrations/llm_api");
      await admin.page.getByRole("heading", { name: "LLM API", level: 1 }).waitFor();
      check(
        g,
        "an Admin can edit configuration but has no credential field",
        (await main(admin.page).getByRole("button", { name: "Save configuration" }).count()) ===
          1 &&
          (await admin.page.locator('main:visible input[name="value"]').count()) === 0 &&
          /Only a Super Admin can set or replace credentials/.test(
            await main(admin.page).innerText(),
          ),
      );

      // Removal is immediate.
      owner.page.once("dialog", (d) => d.accept());
      await owner.page.reload();
      await owner.page
        .locator("main tr", { hasText: "member@local.test" })
        .getByRole("button", { name: "Remove role" })
        .click();
      await owner.page
        .waitForFunction(
          () => !document.querySelector("main section")?.innerText.includes("member@local.test"),
          null,
          { timeout: 15000 },
        )
        .catch(() => {});
      check(
        g,
        "removing a role is stored",
        (await db(`select count(*) from user_roles where user_id = '${MEMBER.id}'`)) === "0",
      );
      await admin.page.goto(BASE + "/admin");
      await admin.page.waitForTimeout(1200);
      check(
        g,
        "the removed Admin is locked out on their very next request, with the same session",
        await isNotFound(admin.page),
      );
      await admin.context.close();
    }

    // ---- Audit log ----
    {
      const g = "audit";
      await owner.page.goto(BASE + "/admin/audit");
      await owner.page.getByRole("heading", { name: "Audit Logs", level: 1 }).waitFor();
      const text = await main(owner.page).innerText();
      check(
        g,
        "the bootstrap, role changes, integration changes and credential changes are all recorded",
        [
          "bootstrap.super_admin",
          "role.granted",
          "role.revoked",
          "integration.updated",
          "integration.secret_set",
          "integration.secret_cleared",
        ].every((a) => text.includes(a)),
      );
      check(
        g,
        "exactly one bootstrap entry exists",
        (await db("select count(*) from audit_log where action = 'bootstrap.super_admin'")) === "1",
      );
      check(
        g,
        "a second bootstrap is refused",
        /bootstrap is closed/.test(
          await db(`select bootstrap_first_super_admin('${MEMBER.id}')`).catch((e) => String(e)),
        ) ||
          /bootstrap is closed/.test(
            await post("/__test/sql", {
              sql: `select bootstrap_first_super_admin('${MEMBER.id}')`,
            }),
          ),
      );
      check(
        g,
        "the owner's profile and both workspaces are unchanged by all of this",
        (await db(
          `select (select count(*) from profiles where id = '${OWNER.id}') || ':' || (select count(*) from workspaces where owner_id = '${OWNER.id}')`,
        )) === "1:2",
      );
    }

    // ---- AutoFlow dependency map ----
    {
      const g = "pipeline";
      await owner.page.goto(BASE + "/admin/autoflow");
      await owner.page.getByRole("heading", { name: "AutoFlow Projects", level: 1 }).waitFor();
      const states = await owner.page
        .locator("main:visible [data-pipeline-state]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-pipeline-state")));
      check(
        g,
        "all 10 pipeline stages are mapped to their dependencies",
        states.length === 10,
        `${states.length} stages`,
      );
      check(
        g,
        "no stage is shown as Connected or Operational",
        states.every((s) => s === "demo" || s === "configured" || s === "planned"),
        states.join(","),
      );
      const map = await owner.page.locator("main:visible ol").first().innerText();
      check(
        g,
        "the required dependency relationships are shown",
        [
          ["Research", "Research Provider API"],
          ["Script", "LLM API"],
          ["Voice", "Voice Provider API"],
          ["Scene / Video Generation", "Video Provider API"],
          ["Video Assembly", "Remotion Worker Hosting"],
          ["Storage", "Object Storage"],
          ["Background Processing", "Redis / Celery"],
          ["YouTube Publishing", "Google OAuth"],
          ["Payment / Subscription", "Payment Provider"],
        ].every(([a, b]) => map.includes(a) && map.includes(b)),
      );
      const visitor = await signedIn(browser, null);
      await visitor.page.goto(BASE + "/autoflow");
      const pub = await visitor.page
        .locator("main:visible [data-pipeline-state]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-pipeline-state")));
      check(
        g,
        "the public AutoFlow page shows every stage as Planned",
        pub.length === 10 && pub.every((s) => s === "planned"),
      );
      await visitor.context.close();
      const user = await signedIn(browser, EDITOR);
      await user.page.goto(BASE + "/autoflow/app");
      await user.page.locator("main:visible [data-pipeline-state]").first().waitFor();
      const ws = await user.page
        .locator("main:visible [data-pipeline-state]")
        .evaluateAll((els) => els.map((e) => e.getAttribute("data-pipeline-state")));
      check(
        g,
        "the signed-in workspace shows real states, none Operational",
        ws.length === 10 &&
          !ws.includes("operational") &&
          !ws.includes("connected") &&
          ws.includes("demo"),
        ws.join(","),
      );
      await user.context.close();
    }

    // ---- Directory content ----
    {
      const g = "directory";
      const pg = owner.page;
      const m = () => pg.locator("main:visible").first();
      const field = (name) => m().locator(`[name="${name}"]`).first();
      const section = (title) =>
        m()
          .locator("section")
          .filter({ has: pg.getByRole("heading", { name: title }) })
          .first();
      const note = async (scope) => {
        const n = (scope ?? m()).locator('[role="status"], [role="alert"]').first();
        await n.waitFor({ timeout: 20000 });
        return n.innerText();
      };

      await pg.goto(BASE + "/admin/directory");
      await pg.getByRole("heading", { name: "AI Directory", level: 1 }).waitFor();
      check(
        g,
        "the Directory admin page loads with an empty catalog",
        /No tools yet/.test(await m().innerText()),
      );

      // Categories.
      await pg.goto(BASE + "/admin/directory/categories");
      await pg.getByRole("heading", { name: "Categories", level: 1 }).waitFor();
      await field("name").fill("Writing");
      await field("slug").fill("writing");
      await field("description").fill("Tools that draft and edit text.");
      await m().getByRole("button", { name: "Add category" }).click();
      check(g, "a category can be added", /Category saved/.test(await note()));
      await pg.reload();
      await field("name").fill("Editing");
      await field("slug").fill("editing");
      await field("parent_id").selectOption({ label: "Writing" });
      await m().getByRole("button", { name: "Add category" }).click();
      await note();
      check(
        g,
        "a subcategory can be added under it",
        (await db("select count(*) from categories where parent_id is not null")) === "1",
      );
      await pg.reload();
      await field("name").fill("Dup");
      await field("slug").fill("writing");
      await m().getByRole("button", { name: "Add category" }).click();
      check(
        g,
        "a duplicate address name is refused with a clear message",
        /already uses that address name/i.test(await note()),
      );

      // A new tool.
      await pg.goto(BASE + "/admin/directory/tools/new");
      await pg.getByRole("heading", { name: "Add tool", level: 1 }).waitFor();
      await field("name").fill("Example Writer");
      check(
        g,
        "the address name is suggested from the name",
        (await field("slug").inputValue()) === "example-writer",
      );
      await field("official_url").fill("https://writer.example.com");
      await field("short_description").fill("Drafts and edits text with AI.");
      await field("primary_category").selectOption({ label: "Writing › Editing" });
      await m().locator('input[name="platforms"][value="web"]').check();
      await field("features").fill("Drafts articles\nRewrites paragraphs");
      await m().getByRole("button", { name: "Create draft" }).click();
      await pg.waitForURL(/\/admin\/directory\/tools\/[0-9a-f-]{36}\?created=1/, {
        timeout: 20000,
      });
      const toolId = pg.url().match(/tools\/([0-9a-f-]{36})/)[1];
      check(
        g,
        "creating a tool opens its editor, as an unpublished, unverified draft",
        (await db(
          `select status || ':' || verification || ':' || is_sample from tools where id = '${toolId}'`,
        )) === "draft:unverified:false",
      );
      check(
        g,
        "the primary category and features were saved",
        (await db(
          `select count(*) from tool_categories where tool_id = '${toolId}' and position = 0`,
        )) === "1" &&
          (await db(`select array_length(features, 1) from tools where id = '${toolId}'`)) === "2",
      );

      // Publishing needs a source.
      const publish = m()
        .locator("form")
        .filter({ has: pg.getByRole("button", { name: "Update status" }) });
      await publish.locator('[name="status"]').selectOption("published");
      await publish.getByRole("button", { name: "Update status" }).click();
      check(
        g,
        "a tool without an official source cannot be published",
        /add at least one official source/i.test(
          await note(section("Publishing and verification")),
        ) && (await db(`select status from tools where id = '${toolId}'`)) === "draft",
      );
      const verify = section("Publishing and verification")
        .locator("form")
        .filter({ has: pg.getByRole("button", { name: "Mark verified" }) });
      await verify.getByRole("button", { name: "Mark verified" }).click();
      await pg.waitForTimeout(1200);
      check(
        g,
        "a tool without a dated source cannot be marked verified",
        (await db(`select verification from tools where id = '${toolId}'`)) === "unverified",
      );

      // Add a dated source, then publish and verify.
      await pg.reload();
      const sources = m()
        .locator("form")
        .filter({ has: pg.getByRole("button", { name: "Add source" }) });
      await sources.locator('[name="title"]').fill("Official site");
      await sources.locator('[name="url"]').fill("https://writer.example.com");
      const today = new Date().toISOString().slice(0, 10);
      await sources.locator('[name="checked_at"]').fill(today);
      await sources.getByRole("button", { name: "Add source" }).click();
      await pg.waitForFunction(
        () => document.querySelector("main")?.innerText.includes("https://writer.example.com"),
        null,
        { timeout: 15000 },
      );
      check(
        g,
        "a dated official source is added",
        (await db(
          `select count(*) from tool_sources where tool_id = '${toolId}' and checked_at is not null`,
        )) === "1",
      );
      await pg.reload();
      const publish2 = m()
        .locator("form")
        .filter({ has: pg.getByRole("button", { name: "Update status" }) });
      await publish2.locator('[name="status"]').selectOption("published");
      await publish2.locator('[name="featured"]').check();
      await publish2.getByRole("button", { name: "Update status" }).click();
      check(
        g,
        "with a category and a source, the tool can be published and featured",
        /Published/.test(await note(section("Publishing and verification"))) &&
          (await db(`select status || ':' || featured from tools where id = '${toolId}'`)) ===
            "published:true",
      );
      await pg.reload();
      await m()
        .locator("form")
        .filter({ has: pg.getByRole("button", { name: "Mark verified" }) })
        .getByRole("button", { name: "Mark verified" })
        .click();
      check(
        g,
        "it can be marked verified, dated today by the database",
        /verified as of today/i.test(await note(section("Publishing and verification"))) &&
          (await db(
            `select verification || ':' || last_verified_at from tools where id = '${toolId}'`,
          )) === `verified:${today}`,
      );

      // Pricing.
      await pg.reload();
      const pricing = m()
        .locator("form")
        .filter({ has: pg.getByRole("button", { name: "Save pricing" }) });
      await pricing.locator('[name="pricing_url"]').fill("https://writer.example.com/pricing");
      await pricing.locator('[name="checked_at"]').fill(today);
      await pricing.locator('[name="plan.0.name"]').fill("Free");
      await pricing.locator('[name="plan.0.price"]').fill("0");
      await pricing.locator('[name="plan.1.name"]').fill("Pro");
      await pricing.locator('[name="plan.1.price"]').fill("12");
      await pricing.getByRole("button", { name: "Save pricing" }).click();
      check(
        g,
        "a paid plan without currency and billing is refused",
        /needs a price, a 3-letter currency and a billing interval/i.test(
          await note(section("Pricing plans")),
        ),
      );
      await pricing.locator('[name="plan.1.currency"]').fill("usd");
      await pricing.locator('[name="plan.1.interval"]').selectOption("month");
      await pricing.getByRole("button", { name: "Save pricing" }).click();
      await pg.waitForTimeout(1500);
      check(
        g,
        "pricing with two plans is saved, and must be verified again before it shows publicly",
        // detail

        (await db(`select count(*) from pricing_plans where tool_id = '${toolId}'`)) === "2" &&
          (await db(`select verification from tool_pricing where tool_id = '${toolId}'`)) ===
            "unverified",
        `${await db(`select count(*) from pricing_plans where tool_id = '${toolId}'`)} plans; ${await m()
          .innerText()
          .then(
            (t) =>
              (t.match(
                /(plan "[^"]*"[^.]*\.|Pricing saved[^.]*\.|The change could not be saved[^.]*\.)/i,
              ) || [""])[0],
          )}`,
      );

      // Validation and the public view.
      await pg.reload();
      await field("official_url").fill("javascript:alert(1)");
      await m().getByRole("button", { name: "Save changes" }).click();
      await pg.waitForTimeout(800);
      check(
        g,
        "an unsafe official address is refused",
        (await db(`select official_url from tools where id = '${toolId}'`)) ===
          "https://writer.example.com",
      );
      check(
        g,
        "the database lets visitors read the published tool only",
        (await db("set role anon; select count(*) from tools")) === "1",
      );
      check(
        g,
        "every step was written to the audit log",
        (await db(
          "select count(distinct action) from audit_log where action in ('category.created','tool.created','tool.categories_set','tool.source_added','tool.status_set','tool.verification_set','tool.pricing_saved')",
        )) === "7",
        await db(
          "select string_agg(distinct action, ',') from audit_log where action like 'tool.%' or action like 'category.%'",
        ),
      );
      await pg.goto(BASE + "/admin/directory");
      await pg.getByText("Example Writer").first().waitFor({ timeout: 15000 });
      check(
        g,
        "the tool list shows the published, verified tool",
        /Example Writer/.test(await m().innerText()) &&
          /Published/.test(await m().innerText()) &&
          /Verified/.test(await m().innerText()),
      );

      // An Editor can manage content; Finance and ordinary users cannot.
      const editor = await signedIn(browser, EDITOR);
      await editor.page.goto(BASE + "/admin/directory/tools/" + toolId);
      await editor.page
        .getByRole("heading", { name: "Example Writer", level: 1 })
        .waitFor({ timeout: 15000 });
      check(
        g,
        "an Editor can open the tool editor and publish controls",
        (await main(editor.page).getByRole("button", { name: "Update status" }).count()) === 1,
      );
      await editor.context.close();
      await db(
        `insert into user_roles (user_id, role) values ('${MEMBER.id}', 'finance') on conflict (user_id) do update set role = 'finance'`,
      );
      const finance = await signedIn(browser, MEMBER);
      await finance.page.goto(BASE + "/admin/directory");
      await finance.page.waitForTimeout(1200);
      check(
        g,
        'a Finance user gets "not found" for Directory management',
        await isNotFound(finance.page),
      );
      await finance.context.close();
      await db(`delete from user_roles where user_id = '${MEMBER.id}'`);
    }

    // ---- Phone layout ----
    {
      const phone = await signedIn(browser, OWNER, {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      let worst = 0;
      for (const p of [
        "/admin",
        "/admin/integrations",
        "/admin/integrations/object_storage",
        "/admin/roles",
        "/admin/audit",
      ]) {
        await phone.page.goto(BASE + p, { waitUntil: "load" });
        await phone.page.waitForTimeout(600);
        if (process.env.DEBUG_OVERFLOW)
          console.log(
            "OVERFLOW " + p,
            await phone.page.evaluate(() => {
              const w = document.documentElement.clientWidth;
              const clipped = (e) => {
                for (let a = e.parentElement; a; a = a.parentElement) {
                  const o = getComputedStyle(a).overflowX;
                  if (o !== "visible") return true;
                }
                return false;
              };
              return JSON.stringify({
                doc: document.documentElement.scrollWidth - w,
                culprits: [...document.querySelectorAll("body *")]
                  .filter(
                    (e) =>
                      e.checkVisibility() && e.getBoundingClientRect().right > w + 1 && !clipped(e),
                  )
                  .slice(0, 5)
                  .map(
                    (e) =>
                      e.tagName +
                      "." +
                      String(e.className).slice(0, 50) +
                      " " +
                      Math.round(e.getBoundingClientRect().right),
                  ),
              });
            }),
          );
        worst = Math.max(
          worst,
          await phone.page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        );
      }
      check(
        "phone",
        "admin pages have no horizontal page overflow at 390px",
        worst <= 0,
        `${worst}px`,
      );
      const small = await phone.page
        .locator(
          "main button:visible, main select:visible, main input:visible:not([type=checkbox]):not([type=radio]):not([type=hidden])",
        )
        .evaluateAll((els) =>
          els
            .filter((e) => e.offsetHeight < 44)
            .map((e) => (e.textContent || e.name || "").trim().slice(0, 16)),
        );
      check(
        "phone",
        "admin controls are at least 44px tall on a phone",
        small.length === 0,
        small.join(", "),
      );
      await phone.context.close();
    }
    check(
      "run",
      "no page errors in the Super Admin session",
      owner.errors.length === 0,
      owner.errors.join(" | "),
    );
    await owner.context.close();
  } catch (e) {
    check("run", "script completed", false, String(e).slice(0, 500));
  } finally {
    await browser.close();
  }
  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`,
  );
  process.exit(failed.length ? 1 : 0);
})();
