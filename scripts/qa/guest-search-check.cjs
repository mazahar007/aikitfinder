#!/usr/bin/env node
/**
 * Checks for the guest search limit. Run through guest-search-check.sh, which
 * provides a local database, gateway and app server (see that file).
 * Exits with code 1 if any check fails.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const { chromium } = require("playwright");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const fs = require("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const crypto = require("node:crypto");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const path = require("node:path");

const { BASE, GATEWAY, SERVER_LOG, TEST_KEY, TEST_SECRET } = process.env;
if (!BASE || !GATEWAY || !SERVER_LOG) {
  console.error("Run scripts/qa/guest-search-check.sh instead of this file.");
  process.exit(2);
}
if (fs.existsSync(".env.local"))
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ADMIN = process.env.QA_SUPABASE_ADMIN_KEY;
/** A local test account served by the gateway's stand-in for Supabase Auth. */
const LOCAL = process.env.QA_LOCAL_EMAIL
  ? { email: process.env.QA_LOCAL_EMAIL, password: process.env.QA_LOCAL_PASSWORD }
  : null;

/** Optional: save pictures of the main states here for a visual review. */
const SHOTS = process.env.SCREENSHOT_DIR;
const shot = (page, name) => (SHOTS ? page.screenshot({ path: `${SHOTS}/${name}.png` }) : null);

const results = [];
function check(group, name, pass, detail = "") {
  results.push({ pass: !!pass });
  console.log(`${pass ? "PASS" : "FAIL"}  [${group}] ${name}${detail ? "  — " + detail : ""}`);
}
function skip(group, name, why) {
  console.log(`SKIP  [${group}] ${name}  — ${why}`);
}

let addressCounter = 0;
const newAddress = () => `203.0.113.${++addressCounter}`;
const rid = () => crypto.randomUUID();
const test = (p, body) =>
  fetch(GATEWAY + p, { method: "POST", body: JSON.stringify(body ?? {}) }).then((r) => r.json());
const executed = () =>
  (fs.readFileSync(SERVER_LOG, "utf8").match(/"event":"directory_search_executed"/g) || []).length;
const events = (name) =>
  (fs.readFileSync(SERVER_LOG, "utf8").match(new RegExp(`"event":"${name}"`, "g")) || []).length;

/** A visitor without a browser: keeps only the guest cookie, like a browser would. */
function visitor() {
  const v = { cookie: null, address: newAddress(), setCookies: [] };
  v.request = async (method, body, { headers = {}, rawBody } = {}) => {
    const res = await fetch(BASE + "/api/directory/search", {
      method,
      headers: {
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        "x-real-ip": v.address,
        ...(v.cookie ? { Cookie: `akf_guest=${v.cookie}` } : {}),
        ...headers,
      },
      body: method === "POST" ? (rawBody ?? JSON.stringify(body)) : undefined,
    });
    const set = res.headers.getSetCookie?.() ?? [];
    for (const c of set) {
      v.setCookies.push(c);
      const m = c.match(/^akf_guest=([^;]*)/);
      if (m) v.cookie = m[1];
    }
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return { status: res.status, json, text, set };
  };
  v.search = (query, requestId = rid(), extra) =>
    v.request("POST", { query, request_id: requestId, ...(extra?.body ?? {}) }, extra);
  v.status = () => v.request("GET");
  return v;
}

async function apiChecks() {
  // ---- A. Guest quota ----
  {
    const g = "A quota";
    const v = visitor();
    const before = executed();
    const s0 = await v.status();
    check(
      g,
      "before any search: 3 of 3 remaining, no cookie created",
      s0.json?.access?.remaining === 3 && s0.json.access.used === 0 && !v.cookie,
    );
    const r1 = await v.search("video");
    check(
      g,
      "search 1 succeeds; remaining = 2",
      r1.status === 200 &&
        r1.json.access.type === "guest" &&
        r1.json.access.limit === 3 &&
        r1.json.access.used === 1 &&
        r1.json.access.remaining === 2,
      `status ${r1.status}`,
    );
    check(
      g,
      "search returns results from the existing Directory search",
      Array.isArray(r1.json.results) &&
        r1.json.results.length > 0 &&
        r1.json.results.every((x) => x.title && x.href && !("score" in x)),
    );
    const r2 = await v.search("summarize");
    check(
      g,
      "search 2 succeeds; remaining = 1",
      r2.status === 200 && r2.json.access.remaining === 1,
    );
    const r3 = await v.search("zzzz-no-such-thing-zzzz");
    check(
      g,
      "search 3 succeeds with zero results and still counts; remaining = 0",
      r3.status === 200 &&
        r3.json.results.length === 0 &&
        r3.json.access.remaining === 0 &&
        r3.json.access.used === 3,
    );
    const r4 = await v.search("code");
    check(
      g,
      "search 4 is refused with 429 GUEST_SEARCH_LIMIT_REACHED, remaining 0 and reset_at",
      r4.status === 429 &&
        r4.json.error.code === "GUEST_SEARCH_LIMIT_REACHED" &&
        r4.json.access.remaining === 0 &&
        !!r4.json.access.reset_at &&
        !("results" in r4.json),
      `status ${r4.status}`,
    );
    check(
      g,
      "the Directory search ran exactly 3 times, not for the refused request",
      executed() - before === 3,
      `${executed() - before} executions`,
    );
    const reset = new Date(r4.json.access.reset_at);
    const now = new Date();
    const nextMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    check(
      g,
      "reset_at is the next UTC midnight",
      reset.getTime() === nextMidnight,
      r4.json.access.reset_at,
    );
    const s = await v.status();
    check(
      g,
      "status reports used 3, remaining 0 without using anything",
      s.json.access.used === 3 && s.json.access.remaining === 0,
    );
    check(
      g,
      "responses are not cacheable",
      (await fetch(BASE + "/api/directory/search")).headers
        .get("cache-control")
        ?.includes("no-store"),
    );

    await test("/__test/next-day");
    const d1 = await v.search("code");
    check(
      g,
      "after the UTC date changes the same guest has 3 searches again",
      d1.status === 200 && d1.json.access.used === 1 && d1.json.access.remaining === 2,
      `status ${d1.status}`,
    );
  }

  // ---- C. Security ----
  {
    const g = "C security";
    const v = visitor();
    const first = await v.search("video");
    const setCookie = first.set.find((c) => c.startsWith("akf_guest=")) ?? "";
    check(g, "a missing guest cookie is created by the server", first.status === 200 && !!v.cookie);
    check(
      g,
      "the cookie is HttpOnly, Secure, SameSite=Lax, Path=/ with a long expiry",
      /HttpOnly/i.test(setCookie) &&
        /Secure/i.test(setCookie) &&
        /SameSite=lax/i.test(setCookie) &&
        /Path=\//i.test(setCookie) &&
        /Max-Age=\d{7,}/i.test(setCookie),
      setCookie.replace(/akf_guest=[^;]*/, "akf_guest=<value>"),
    );
    const [id, signature] = v.cookie.split(".");
    check(
      g,
      "the cookie value is a random identifier plus a signature",
      /^[A-Za-z0-9_-]{43}$/.test(id) && /^[A-Za-z0-9_-]{43}$/.test(signature),
    );
    check(
      g,
      "the raw guest identifier is never in a response body",
      !first.text.includes(id) && !(await v.status()).text.includes(id),
    );
    const hash = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(`akf-guest-hash:v1:${id}`)
      .digest("hex");
    check(
      g,
      "the stored guest hash is never in a response body either",
      !first.text.includes(hash),
    );
    check(
      g,
      "a valid cookie is not re-issued on later requests",
      (await v.search("code")).set.length === 0,
    );

    // Forged: a well-formed identifier with a made-up signature.
    const forged = visitor();
    forged.cookie = `${crypto.randomBytes(32).toString("base64url")}.${crypto.randomBytes(32).toString("base64url")}`;
    const fr = await forged.search("video");
    check(
      g,
      "a forged guest cookie is rejected and replaced with a new identity",
      fr.status === 200 &&
        fr.set.some((c) => c.startsWith("akf_guest=")) &&
        fr.json.access.used === 1,
    );

    // Stolen identifier with the wrong signature: must not reach the victim's allowance.
    const thief = visitor();
    thief.cookie = `${id}.${crypto.randomBytes(32).toString("base64url")}`;
    const tr = await thief.search("video");
    check(
      g,
      "another guest's identifier with a bad signature does not get that guest's usage",
      tr.json.access.used === 1 && (await v.status()).json.access.used === 2,
    );

    // Signed with a different secret.
    const other = visitor();
    const oid = crypto.randomBytes(32).toString("base64url");
    other.cookie = `${oid}.${crypto.createHmac("sha256", "some-other-secret-value-0123456789").update(`akf-guest-cookie:v1:${oid}`).digest("base64url")}`;
    check(
      g,
      "a cookie signed with a different secret is rejected",
      (await other.search("video")).set.some((c) => c.startsWith("akf_guest=")),
    );

    // Guest identifiers supplied anywhere else are ignored.
    const inject = visitor();
    const ir = await inject.search("video", rid(), {
      body: { guest_id: id, guest_hash: hash, akf_guest: v.cookie },
      headers: { "x-guest-id": id },
    });
    check(
      g,
      "guest IDs in the request body or headers are ignored",
      ir.json.access.used === 1 && (await v.status()).json.access.used === 2,
    );

    const denied = await test("/__test/as-anon");
    check(
      g,
      "a browser role cannot read or write the quota tables or call the functions",
      denied.denied === 4,
      `${denied.denied} of 4 attempts denied`,
    );
    const noKey = await fetch(GATEWAY + "/rest/v1/rpc/consume_guest_search", {
      method: "POST",
      body: "{}",
    });
    const pubKey = await fetch(GATEWAY + "/rest/v1/rpc/consume_guest_search", {
      method: "POST",
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "x" },
      body: "{}",
    });
    check(
      g,
      "the quota function cannot be called without the server key",
      noKey.status === 401 && pubKey.status === 401,
    );

    // Nothing secret in what the browser downloads.
    const needles = [
      TEST_KEY,
      TEST_SECRET,
      "SUPABASE_SECRET_KEY",
      "GUEST_SEARCH_SECRET",
      "sb_secret_",
      "service_role",
      "consume_guest_search",
      "akf-guest-hash",
    ];
    const found = new Set();
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) walk(p);
        else if (/\.(js|css|html|json|map)$/.test(f.name)) {
          const text = fs.readFileSync(p, "utf8");
          for (const n of needles) if (text.includes(n)) found.add(n);
        }
      }
    };
    walk(".next/static");
    check(
      g,
      "no secret, key name or quota function name is in the browser bundle",
      found.size === 0,
      [...found].join(", "),
    );
  }

  // ---- C/D. Validation, idempotency, concurrency ----
  {
    const g = "C validation";
    const v = visitor();
    await v.search("video");
    const base = (await v.status()).json.access.used;
    const bad = [
      ["empty query", { query: "", request_id: rid() }],
      ["whitespace-only query", { query: "   \n ", request_id: rid() }],
      ["query over 100 characters", { query: "a".repeat(101), request_id: rid() }],
      ["non-string query", { query: ["video"], request_id: rid() }],
      ["missing request_id", { query: "video" }],
      ["malformed request_id", { query: "video", request_id: "123" }],
      ["array body", ["video"]],
    ];
    for (const [name, body] of bad) {
      const r = await v.request("POST", body);
      check(
        g,
        `${name} is rejected with 400 INVALID_REQUEST`,
        r.status === 400 && r.json?.error?.code === "INVALID_REQUEST",
        `status ${r.status}`,
      );
    }
    const big = await v.request("POST", null, {
      rawBody: JSON.stringify({ query: "video", request_id: rid(), pad: "x".repeat(5000) }),
    });
    check(g, "an oversized request is rejected", big.status === 400);
    const notJson = await v.request("POST", null, { rawBody: "query=video" });
    check(g, "a non-JSON body is rejected", notJson.status === 400);
    const wrongType = await v.request("POST", null, {
      rawBody: JSON.stringify({ query: "video", request_id: rid() }),
      headers: { "Content-Type": "text/plain" },
    });
    check(g, "a non-JSON content type is rejected", wrongType.status === 400);
    check(g, "rejected requests use no search", (await v.status()).json.access.used === base);
    const inj = await v.search(`'; drop table guest_search_usage; --`);
    check(
      g,
      "a query with SQL in it is treated as text",
      inj.status === 200 && (await test("/__test/totals")).guests > 0,
    );
  }
  {
    const g = "D retries";
    const v = visitor();
    const id1 = rid();
    const a = await v.search("video", id1);
    const before = executed();
    const b = await v.search("video", id1);
    const c = await v.search("video", id1);
    check(
      g,
      "the same request ID again does not use another search",
      a.json.access.used === 1 &&
        b.status === 200 &&
        b.json.access.used === 1 &&
        c.json.access.used === 1,
    );
    check(
      g,
      "a retried request returns the same results",
      JSON.stringify(a.json.results) === JSON.stringify(b.json.results),
    );
    await v.search("code");
    await v.search("summarize");
    const blockedId = rid();
    const x = await v.search("thumbnail", blockedId);
    const y = await v.search("thumbnail", blockedId);
    check(
      g,
      "a retried refused request stays refused and uses nothing",
      x.status === 429 && y.status === 429 && y.json.access.used === 3,
    );
    check(
      g,
      "a request ID that was already accepted still works after the limit is reached",
      (await v.search("video", id1)).status === 200,
    );
    void before;
  }
  {
    const g = "D concurrency";
    const v = visitor();
    await v.search("video"); // establishes the cookie; 1 used
    const before = executed();
    const burst = await Promise.all(Array.from({ length: 12 }, () => v.search("code")));
    const ok = burst.filter((r) => r.status === 200).length;
    const refused = burst.filter((r) => r.status === 429).length;
    check(
      g,
      "12 simultaneous searches: exactly 2 more are accepted, 10 refused",
      ok === 2 && refused === 10,
      `${ok} accepted, ${refused} refused`,
    );
    check(
      g,
      "the Directory search ran only for the accepted ones",
      executed() - before === 2,
      `${executed() - before} executions`,
    );
    const totals = await test("/__test/totals");
    check(
      g,
      "no guest's count is above 3 in the database",
      totals.max_count === 3,
      `max ${totals.max_count}`,
    );
    const same = rid();
    const v2 = visitor();
    await v2.search("video");
    const dup = await Promise.all(Array.from({ length: 8 }, () => v2.search("code", same)));
    check(
      g,
      "8 simultaneous copies of one request use one search",
      dup.every((r) => r.status === 200) && (await v2.status()).json.access.used === 2,
    );
  }

  // ---- B. Authentication cannot be claimed ----
  {
    const g = "B authentication";
    const v = visitor();
    const fakeJwt =
      "eyJhbGciOiJIUzI1NiJ9." +
      Buffer.from(
        JSON.stringify({ sub: crypto.randomUUID(), role: "authenticated", exp: 4102444800 }),
      ).toString("base64url") +
      ".x";
    const ref = SUPA ? new URL(SUPA).hostname.split(".")[0] : "project";
    const tries = [
      ["user_id in the body", { body: { user_id: crypto.randomUUID(), authenticated: true } }],
      ["a made-up Authorization header", { headers: { Authorization: `Bearer ${fakeJwt}` } }],
      [
        "a forged session cookie",
        {
          headers: {
            Cookie: `sb-${ref}-auth-token=base64-${Buffer.from(JSON.stringify({ access_token: fakeJwt, refresh_token: "x", user: { id: crypto.randomUUID() } })).toString("base64")}`,
          },
        },
      ],
    ];
    for (const [name, extra] of tries) {
      const r = await v.search("video", rid(), extra);
      check(
        g,
        `${name} does not make a visitor "authenticated"`,
        r.json?.access?.type === "guest" || r.status === 429,
        `status ${r.status}, access ${r.json?.access?.type}`,
      );
    }
  }
}

async function typeAndSearch(page, query) {
  const field = page.locator("#page-search");
  await field.fill(query);
  await field.press("Enter");
}
const counterText = async (page) => {
  const c = page.locator('main p[role="status"][data-remaining]');
  return (await c.count()) ? await c.first().getAttribute("data-remaining") : null;
};

async function browserChecks(browser) {
  const g = "E experience";
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { "x-real-ip": newAddress() },
  });
  const page = await context.newPage();
  const posts = [];
  page.on(
    "request",
    (r) =>
      r.method() === "POST" && r.url().endsWith("/api/directory/search") && posts.push(r.url()),
  );
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));

  await page.goto(BASE + "/directory");
  await page.locator('p[role="status"][data-remaining="3"]').first().waitFor();
  check(
    g,
    'Directory home shows "Free searches remaining 3/3" next to the search field',
    /Free searches remaining/.test(await page.locator("p[data-remaining]").first().innerText()) &&
      /3\/3/.test(await page.locator("p[data-remaining]").first().innerText()),
  );

  await page.goto(BASE + "/search");
  await page.locator('p[data-remaining="3"]').first().waitFor();
  const before = await test("/__test/totals");
  await page.locator("#page-search").pressSequentially("make a vid", { delay: 30 });
  await page.waitForTimeout(500);
  check(
    g,
    "typing in the search field uses nothing and sends nothing",
    posts.length === 0 && (await test("/__test/totals")).accepted_today === before.accepted_today,
  );

  await typeAndSearch(page, "video");
  await page.locator('p[data-remaining="2"]').first().waitFor();
  await page.getByRole("heading", { name: "Tools" }).first().waitFor();
  check(
    g,
    "search 1 shows results and the counter becomes 2/3",
    /\/search\?q=video&rid=/.test(page.url()),
  );
  check(
    g,
    "the guest cookie cannot be read by page scripts",
    !(await page.evaluate(() => document.cookie)).includes("akf_guest") &&
      (await context.cookies()).some((c) => c.name === "akf_guest" && c.httpOnly),
  );

  const postsBefore = posts.length;
  await page.reload({ waitUntil: "load" });
  await page.getByRole("heading", { name: "Tools" }).first().waitFor();
  check(g, "reloading the results does not use another search", (await counterText(page)) === "2");
  await page.getByRole("navigation", { name: "Result types" }).getByRole("link").nth(1).click();
  await page.waitForTimeout(600);
  check(
    g,
    "changing the result type tab sends no new search",
    posts.length === postsBefore + 1 && (await counterText(page)) === "2",
    `${posts.length - postsBefore} request(s) after reload`,
  );

  await page.goto(BASE + "/search?q=thumbnail");
  await page.getByText("Press Search to look for").first().waitFor();
  await page.locator('p[data-remaining="2"]').first().waitFor();
  check(
    g,
    "opening a search address without a submission runs nothing",
    (await counterText(page)) === "2",
  );

  await typeAndSearch(page, "summarize");
  await page.locator('p[data-remaining="1"]').first().waitFor();
  await shot(page, "1-last-search");
  check(
    g,
    'search 2: counter 1/3 with a "last free search" notice',
    /Last free search today/.test(await page.locator('p[data-remaining="1"]').first().innerText()),
  );

  // A double submit is one search.
  await page.locator("#page-search").fill("automation");
  await page.locator("#page-search").evaluate((el) => {
    el.form.requestSubmit();
    el.form.requestSubmit();
  });
  await page.locator('p[data-remaining="0"]').first().waitFor();
  await page.waitForTimeout(500);
  check(
    g,
    "search 3 (submitted twice at once) counts once; counter 0/3 with the reset time",
    /Resets (today|tomorrow) at/.test(
      await page.locator('p[data-remaining="0"]').first().innerText(),
    ) && (await test("/__test/totals")).max_count === 3,
  );

  const executedBefore = executed();
  await typeAndSearch(page, "code review");
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await shot(page, "2-limit-dialog");
  check(
    g,
    "search 4 opens the sign-up dialog with the required heading",
    (await dialog
      .getByRole("heading", { name: "You've used all 3 free searches today." })
      .count()) === 1,
  );
  const dText = await dialog.innerText();
  check(
    g,
    "dialog copy, primary and secondary actions match the specification",
    dText.includes("Create a free AIKitFinder account to continue discovering AI tools.") &&
      (await dialog.getByRole("button", { name: "Create Free Account" }).count()) === 1 &&
      (await dialog.getByRole("button", { name: "Already have an account? Sign in" }).count()) ===
        1,
  );
  check(
    g,
    "dialog explains the daily reset",
    /free searches reset (today|tomorrow) at/i.test(dText),
  );
  check(
    g,
    "no results are shown and the Directory search did not run",
    (await page.locator("main article").count()) === 0 && executed() === executedBefore,
  );
  check(
    g,
    "focus is inside the dialog",
    await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')),
  );
  await page.keyboard.press("Tab");
  check(
    g,
    "Tab keeps focus inside the dialog",
    await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')),
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await shot(page, "3-limit-page");
  check(
    g,
    "Escape closes the dialog; the page still explains the limit and offers browsing",
    (await page.getByRole("dialog").count()) === 0 &&
      (await page
        .getByRole("heading", { name: "You've used all 3 free searches today." })
        .count()) === 1 &&
      (await page.getByRole("main").getByRole("link", { name: "All tools" }).count()) === 1,
  );

  // Public browsing stays open after the limit.
  for (const p of [
    "/tools",
    "/tools/storyreel",
    "/categories",
    "/guides",
    "/guides/first-ai-image",
    "/prompts",
    "/workflows",
    "/compare",
    "/directory",
    "/",
  ]) {
    const r = await page.goto(BASE + p, { waitUntil: "load" });
    const ok =
      r.status() === 200 &&
      (await page.locator("h1:visible").count()) === 1 &&
      (await page.getByRole("dialog").count()) === 0;
    check("E browsing", `${p} stays open after the limit is reached`, ok, `status ${r.status()}`);
  }
  const listFilter = await page.goto(BASE + "/tools?q=video&pricing=free&sort=name", {
    waitUntil: "load",
  });
  check(
    "E browsing",
    "list filters, sorting and paging are not counted",
    listFilter.status() === 200 && (await test("/__test/totals")).max_count === 3,
  );

  // Reduced motion: the loading placeholder does not animate.
  const rm = await browser.newContext({
    reducedMotion: "reduce",
    extraHTTPHeaders: { "x-real-ip": newAddress() },
  });
  const rp = await rm.newPage();
  await rp.route("**/api/directory/search", async (route) =>
    route.request().method() === "POST"
      ? (await new Promise((r) => setTimeout(r, 1200)), route.continue())
      : route.continue(),
  );
  await rp.goto(BASE + "/search");
  await typeAndSearch(rp, "video");
  await rp.locator('main [role="status"][aria-label^="Searching"]').waitFor();
  const animated = await rp
    .locator('main [role="status"][aria-label^="Searching"] div')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  check(
    g,
    "loading state is announced and does not animate under reduced motion",
    animated === "none",
    animated,
  );
  await rm.close();

  // ---- Sign in and continue the pending search ----
  // These need one throwaway account in the real sign-in project, so they run only when asked.
  const signInChecks = async () => {
    const email = LOCAL ? LOCAL.email : `akf-qa-search-${Date.now()}@example.com`;
    const password = LOCAL ? LOCAL.password : crypto.randomBytes(18).toString("base64url");
    const H = {
      apikey: ADMIN,
      Authorization: `Bearer ${ADMIN}`,
      "Content-Type": "application/json",
    };
    const made = LOCAL
      ? null
      : await (
          await fetch(`${SUPA}/auth/v1/admin/users`, {
            method: "POST",
            headers: H,
            body: JSON.stringify({
              email,
              password,
              email_confirmed_at: true,
              email_confirm: true,
            }),
          })
        ).json();
    try {
      const g2 = "B/E sign-in";
      await page.goto(BASE + "/search");
      await typeAndSearch(page, "code review");
      const d = page.getByRole("dialog");
      await d.waitFor();
      const pending = page.url();
      const guestTotals = await test("/__test/totals");
      const authBefore = events("authenticated_search");
      posts.length = 0;
      await d.getByRole("button", { name: "Already have an account? Sign in" }).click();
      await d.getByLabel("Email").fill(email);
      await d.getByLabel("Password", { exact: true }).fill(password);
      await d.locator('button[type="submit"]').click();
      await page.waitForURL(pending, { waitUntil: "load" });
      await page
        .getByText(/results? for “code review”/)
        .first()
        .waitFor();
      check(
        g2,
        "the pending search query survives sign-in and its results are shown",
        new URL(page.url()).searchParams.get("q") === "code review" &&
          (await page.locator("main article").count()) > 0,
      );
      await page.waitForTimeout(800);
      check(
        g2,
        "the search resumes exactly once after sign-in",
        posts.length === 1 && events("authenticated_search") - authBefore === 1,
        `${posts.length} request(s), ${events("authenticated_search") - authBefore} server search(es)`,
      );
      check(
        g2,
        "the counter is hidden for a signed-in user",
        (await counterText(page)) === null &&
          (await page.getByText("Free searches remaining").count()) === 0,
      );
      const status = await (await page.request.get(BASE + "/api/directory/search")).json();
      check(
        g2,
        "the API reports access.type = authenticated with no guest counter",
        status.access.type === "authenticated" && !("remaining" in status.access),
      );
      for (const q of ["video", "summarize", "automation", "thumbnail", "code"]) {
        await typeAndSearch(page, q);
        await page
          .getByText(new RegExp(`for “${q}”`))
          .first()
          .waitFor();
      }
      check(
        g2,
        "a signed-in user runs 6 searches in a row without a limit",
        (await page.getByRole("dialog").count()) === 0,
      );
      const after = await test("/__test/totals");
      check(
        g2,
        "signed-in searches use no guest quota",
        after.accepted_today === guestTotals.accepted_today &&
          after.requests === guestTotals.requests,
      );

      await page.goto(BASE + "/account");
      await page.getByRole("main").getByRole("button", { name: "Log out" }).click();
      await page.waitForURL(BASE + "/", { waitUntil: "load" });
      await page.goto(BASE + "/search");
      await page.locator('p[data-remaining="0"]').first().waitFor();
      check(g2, "after log out the same browser is a guest again, still at its limit", true);
    } finally {
      if (made?.id)
        await fetch(`${SUPA}/auth/v1/admin/users/${made.id}`, { method: "DELETE", headers: H });
    }
  };
  if (LOCAL || (ADMIN && SUPA)) await signInChecks();
  else
    for (const n of [
      "pending search survives sign-in",
      "search resumes once after sign-in",
      "counter hidden when signed in",
      "signed-in users are not limited",
    ])
      skip("B/E sign-in", n, "no test account available");
  check(g, "no page errors", errors.length === 0, errors.join(" | "));
  await context.close();

  // Phone layout.
  const phone = await browser.newContext({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
    extraHTTPHeaders: { "x-real-ip": newAddress() },
  });
  const pp = await phone.newPage();
  await pp.goto(BASE + "/search");
  await pp.locator('p[data-remaining="3"]').first().waitFor();
  for (const q of ["video", "summarize", "code"]) {
    await typeAndSearch(pp, q);
    await pp
      .getByText(new RegExp(`for “${q}”`))
      .first()
      .waitFor();
  }
  await typeAndSearch(pp, "thumbnail");
  const pd = pp.getByRole("dialog");
  await pd.waitFor();
  const box = await pd.boundingBox();
  const overflow = await pp.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  await shot(pp, "4-phone-dialog");
  check(
    "E phone",
    "at 360px the counter, results and limit dialog fit the screen",
    box.x >= 0 && box.width <= 360 && overflow <= 0,
    `overflow ${overflow}px`,
  );
  const small = await pd
    .locator("button, input")
    .evaluateAll((els) =>
      els
        .filter((e) => e.offsetHeight > 0 && e.offsetHeight < 44)
        .map((e) => (e.textContent || e.name || "").trim().slice(0, 20)),
    );
  check("E phone", "dialog controls are at least 44px tall", small.length === 0, small.join(", "));
  await phone.close();
}

/** Every place a main Directory search can start, and everything that must not count as one. */
async function entryPointChecks(browser) {
  const g = "D entry points";
  const fresh = async (options = {}) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      ...options,
      extraHTTPHeaders: { "x-real-ip": newAddress() },
    });
    const page = await context.newPage();
    const posts = [];
    page.on(
      "request",
      (r) => r.method() === "POST" && r.url().endsWith("/api/directory/search") && posts.push(1),
    );
    return { context, page, posts };
  };
  const resultsFor = (page, q) =>
    page
      .getByText(new RegExp(`for “${q}”`))
      .first()
      .waitFor();
  const cards = async (page) => {
    const list = page.locator("main:visible article:visible");
    await list.first().waitFor();
    await page.waitForTimeout(400);
    return list.count();
  };
  const remaining = (page, n) => page.locator(`p[data-remaining="${n}"]`).first().waitFor();

  // Header search, Directory home search, suggested search.
  {
    const { context, page } = await fresh();
    await page.goto(BASE + "/tools");
    await page.locator("header #site-search").fill("video");
    await page.locator("header #site-search").press("Enter");
    await resultsFor(page, "video");
    await remaining(page, 2);
    check(
      g,
      "header search runs one search and lands on results (2/3 left)",
      /[?&]rid=[0-9a-f-]{36}/.test(page.url()),
    );

    await page.goto(BASE + "/directory");
    await remaining(page, 2);
    await page.locator("#hero-search").fill("summarize");
    await page.locator("#hero-search").press("Enter");
    await resultsFor(page, "summarize");
    await remaining(page, 1);
    check(g, "Directory home search runs one search (1/3 left)", true);

    await page.goto(BASE + "/directory");
    await remaining(page, 1);
    const suggestion = page.locator('ul[aria-label="Example searches"] button').first();
    const label = (await suggestion.innerText()).trim();
    await suggestion.click();
    await page.waitForURL(/\/search\?q=.*&rid=/);
    await remaining(page, 0);
    check(
      g,
      "choosing a suggested search counts as one search (0/3 left)",
      new URL(page.url()).searchParams.get("q") === label,
      label,
    );

    // Back and forward replay the same request IDs.
    const before = await test("/__test/totals");
    await page.goBack({ waitUntil: "load" });
    await page.goBack({ waitUntil: "load" });
    await resultsFor(page, "summarize");
    await page.goForward({ waitUntil: "load" });
    await page.goForward({ waitUntil: "load" });
    await page.waitForURL(/\/search\?q=.*&rid=/);
    await page.locator("main:visible article:visible").first().waitFor();
    const after = await test("/__test/totals");
    check(
      g,
      "browser back and forward show earlier results without using a search",
      after.accepted_today === before.accepted_today &&
        (await page.getByRole("dialog").count()) === 0,
      `${after.accepted_today - before.accepted_today} used`,
    );
    await context.close();
  }

  // Not-found page search and the phone menu search.
  {
    const { context, page } = await fresh();
    const r = await page.goto(BASE + "/no-such-page-here");
    await page.locator("#notfound-search").fill("code");
    await page.locator("#notfound-search").press("Enter");
    await resultsFor(page, "code");
    await remaining(page, 2);
    check(g, "search from the not-found page runs one search", r.status() === 404);
    await context.close();

    const phone = await fresh({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    await phone.page.goto(BASE + "/tools");
    await phone.page.getByRole("button", { name: /menu/i }).click();
    await phone.page.locator("#mobile-search").fill("thumbnail");
    await phone.page.locator("#mobile-search").press("Enter");
    await resultsFor(phone.page, "thumbnail");
    await remaining(phone.page, 2);
    check(g, "search from the phone menu runs one search", true);
    await phone.context.close();
  }

  // List pages: keyword filter, category filter, sorting and paging are not searches.
  {
    const { context, page, posts } = await fresh();
    await page.goto(BASE + "/search");
    await typeAndSearch(page, "video");
    await remaining(page, 2);
    const before = await test("/__test/totals");
    posts.length = 0;

    await page.goto(BASE + "/tools");
    const total = await cards(page);
    await page.locator("#tools-q:visible").fill("write");
    await page.locator("#tools-q:visible").press("Enter");
    await page.waitForURL(/\/tools\?.*q=write/);
    const filtered = await cards(page);
    check(
      g,
      "the tool list's keyword box filters the list",
      filtered > 0 && filtered < total,
      `${filtered} of ${total}`,
    );
    await page.goto(BASE + "/tools?sort=name");
    const sortedOk = (await cards(page)) === total;
    await page.goto(BASE + "/tools?pricing=free&level=beginner");
    await page.goto(BASE + "/tools?page=2");
    const pager = page.getByRole("navigation", { name: "Pagination" });
    if (await pager.count())
      await pager
        .getByRole("link")
        .first()
        .click()
        .catch(() => {});
    await page.goto(BASE + "/prompts?q=email");
    await page.goto(BASE + "/workflows?q=video");
    await page.goto(BASE + "/categories");
    await page.locator('main a[href^="/categories/"]').first().click();
    await page.waitForURL(/\/categories\/.+/);
    const after = await test("/__test/totals");
    check(
      g,
      "list keyword filters, category filters, sorting and paging use no search and call no search API",
      sortedOk &&
        posts.length === 0 &&
        after.accepted_today === before.accepted_today &&
        after.requests === before.requests,
      `${posts.length} API calls, ${after.accepted_today - before.accepted_today} used`,
    );
    await page.goto(BASE + "/search");
    await remaining(page, 2);
    check(g, "the counter is unchanged after all of that (2/3)", true);

    // Use the rest, then confirm the list keyword filter still works at the limit.
    await typeAndSearch(page, "code");
    await remaining(page, 1);
    await typeAndSearch(page, "summarize");
    await remaining(page, 0);
    await typeAndSearch(page, "thumbnail");
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.goto(BASE + "/tools?q=write");
    check(
      g,
      "at the limit, the list keyword filter still works (unmetered by the current decision)",
      (await cards(page)) === filtered && (await page.getByRole("dialog").count()) === 0,
    );
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    await apiChecks();
    await entryPointChecks(browser);
    await browserChecks(browser);
  } catch (e) {
    check("run", "script completed", false, String(e).slice(0, 400));
  } finally {
    await browser.close();
  }
  const log = fs.readFileSync(SERVER_LOG, "utf8");
  check(
    "privacy",
    "the server log contains no guest cookie, hash, secret or search text",
    !/akf_guest|[0-9a-f]{64}|code review|summarize/.test(log.replace(/"event":"[a-z_]+"/g, "")) &&
      !log.includes(TEST_SECRET) &&
      !log.includes(TEST_KEY),
  );
  check(
    "privacy",
    "aggregate events are logged",
    events("guest_search_allowed") > 0 && events("guest_search_limit_reached") > 0,
  );
  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`,
  );
  process.exit(failed.length ? 1 : 0);
})();
