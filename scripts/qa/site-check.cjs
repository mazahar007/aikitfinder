#!/usr/bin/env node
/**
 * Browser checks for a running production build.
 *
 *   pnpm build && PORT=3111 pnpm start &
 *   node scripts/qa/site-check.cjs http://localhost:3111
 *
 * Needs Playwright with Chromium available to Node (it is not a project
 * dependency). Exits with code 1 if any check fails.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const { chromium } = require("playwright");

const BASE = process.argv[2] || "http://localhost:3111";
const phone = (width, height) => ({ viewport: { width, height }, hasTouch: true, isMobile: true });
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  tablet: { viewport: { width: 834, height: 1112 } },
  mobile: phone(390, 844),
};
/** Every route is loaded at each of these widths. */
const WIDTHS = {
  320: phone(320, 640),
  360: phone(360, 740),
  375: phone(375, 812),
  390: phone(390, 844),
  414: phone(414, 896),
  430: phone(430, 932),
  768: { viewport: { width: 768, height: 1024 }, hasTouch: true },
  1024: { viewport: { width: 1024, height: 768 } },
  1280: { viewport: { width: 1280, height: 800 } },
  1440: { viewport: { width: 1440, height: 900 } },
  1920: { viewport: { width: 1920, height: 1080 } },
};
/** The hero animation is exercised at these. */
const HERO = {
  320: WIDTHS[320],
  mobile: VIEWPORTS.mobile,
  tablet: VIEWPORTS.tablet,
  desktop: VIEWPORTS.desktop,
  1920: WIDTHS[1920],
};
const ROUTES = [
  ["/", "parent"],
  ["/about", "parent"],
  ["/contact", "parent"],
  ["/privacy", "parent"],
  ["/terms", "parent"],
  ["/editorial-policy", "parent"],
  ["/account", "parent"],
  ["/directory", "directory"],
  ["/tools", "directory"],
  ["/tools/storyreel", "directory"],
  ["/categories", "directory"],
  ["/guides", "directory"],
  ["/guides/first-ai-image", "directory"],
  ["/prompts", "directory"],
  ["/workflows", "directory"],
  ["/workflows/blog-to-social-video", "directory"],
  ["/compare", "directory"],
  ["/search?q=video", "directory"],
  ["/deals", "directory"],
  ["/voicehub", "directory"],
  ["/autoflow", "autoflow"],
  ["/autoflow/app", "autoflow"],
  ["/autoflow/app/projects", "autoflow"],
  ["/autoflow/app/projects/sample", "autoflow"],
];

const results = [];
function check(group, name, pass, detail = "") {
  results.push({ group, name, pass: !!pass, detail: String(detail) });
  console.log(`${pass ? "PASS" : "FAIL"}  [${group}] ${name}${detail ? "  — " + detail : ""}`);
}

async function open(browser, path, options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
  const response = await page.goto(BASE + path, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, errors, status: response.status() };
}

/** A cheap fingerprint of what the hero canvas currently shows. */
const canvasHash = (page) =>
  page.evaluate(() => {
    const c = document.querySelector("canvas.life");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let h = 0,
      lit = 0;
    for (let i = 3; i < d.length; i += 16) {
      h = (h * 31 + d[i] + d[i - 1]) | 0;
      if (d[i] > 40) lit++;
    }
    return { h, lit };
  });
const motion = (page) => page.evaluate(() => document.documentElement.dataset.motion);

/** Controls that are too small to tap, and text that is too small to read. */
const audit = (page) =>
  page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      );
    };
    const label = (el) =>
      (el.getAttribute("aria-label") || el.textContent || el.tagName)
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 24);
    // Buttons, form fields and navigation links. Links inside running text are exempt (WCAG 2.5.8).
    const controls = [
      ...document.querySelectorAll(
        'button, [role="button"], [role="tab"], input:not([type="hidden"]), select, summary, header a, nav a, a.btn, footer a',
      ),
    ];
    const small = controls
      .filter(visible)
      .filter((el) => !el.closest("p"))
      .filter((el) => {
        // Layout size, so entrance animations do not count. A text field is as tall as its bordered wrapper.
        const box =
          el.tagName === "INPUT" && el.parentElement.offsetHeight > el.offsetHeight
            ? el.parentElement
            : el;
        return box.offsetHeight < 44 || box.offsetWidth < 24;
      })
      .map((el) => `${label(el)} ${el.offsetWidth}x${el.offsetHeight}`);
    const tiny = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement;
      if (
        !n.textContent.trim() ||
        !el ||
        !visible(el) ||
        el.closest("[aria-hidden='true'], svg, canvas")
      )
        continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 11) tiny.add(`${n.textContent.trim().slice(0, 20)} ${size}px`);
    }
    return { small: [...new Set(small)], tiny: [...tiny] };
  });

async function routes(browser) {
  for (const [vpName, vp] of Object.entries(WIDTHS)) {
    const touch = Number(vpName) <= 768;
    for (const [path, product] of ROUTES) {
      const { context, page, errors, status } = await open(browser, path, vp);
      await page.waitForTimeout(700);
      const m = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        mains: [...document.querySelectorAll("main")].filter((e) => e.checkVisibility()).length,
        h1: [...document.querySelectorAll("h1")].filter((e) => e.checkVisibility()).length,
        product: document.documentElement.dataset.product,
        lang: document.documentElement.lang,
        title: document.title,
      }));
      const a = await audit(page);
      const problems = [];
      if (status !== 200) problems.push(`status ${status}`);
      if (m.overflow > 0) problems.push(`horizontal overflow ${m.overflow}px`);
      if (m.mains !== 1) problems.push(`${m.mains} <main>`);
      if (m.h1 !== 1) problems.push(`${m.h1} <h1>`);
      if (m.product !== product) problems.push(`product ${m.product}`);
      if (!m.title) problems.push("no title");
      if (m.lang !== "en") problems.push(`lang ${m.lang}`);
      // The unlinked legacy VoiceHub page is exempt: it is due to be replaced, not polished.
      if (touch && a.small.length && path !== "/voicehub")
        problems.push(`small targets: ${a.small.join(", ")}`);
      if (a.tiny.length) problems.push(`tiny text: ${a.tiny.slice(0, 4).join(", ")}`);
      if (errors.length) problems.push(`console: ${errors.join(" | ")}`);
      check(`routes ${vpName}px`, path, problems.length === 0, problems.join("; "));
      await context.close();
    }
  }
  // The first request for an unknown project streams a 200 shell and then the
  // not-found content (partial prerendering); later requests return 404. What
  // matters is that the visitor gets the not-found screen and no project.
  const { context, page, status } = await open(browser, "/autoflow/app/projects/does-not-exist");
  await page.waitForTimeout(800);
  const text = await page.locator("main:visible").innerText();
  // With accounts on, a signed-out visitor gets the sign-in prompt for any project address.
  check(
    "routes",
    "unknown project shows not-found or the sign-in prompt",
    /couldn.t find|sign in to open/i.test(text),
    `status ${status}`,
  );
  await context.close();
  const nf = await open(browser, "/no-such-page");
  check("routes", "unknown page returns 404", nf.status === 404, `status ${nf.status}`);
  await nf.context.close();
}

async function hero(browser) {
  for (const [vpName, vp] of Object.entries(HERO)) {
    const g = `hero ${vpName}`;
    const { context, page } = await open(browser, "/?akf-debug=1", vp);
    await page.waitForFunction(() => window.__akf, null, { timeout: 15000 });
    await page.waitForTimeout(1200);

    const a = await canvasHash(page);
    await page.waitForTimeout(700);
    const b = await canvasHash(page);
    check(g, "fish is drawn", a.lit > 50, `${a.lit} lit samples`);
    check(g, "animation runs", a.h !== b.h && (await motion(page)) === "running");

    // Pause / Resume: the visible control, its state, and that drawing stops.
    const btn = page.locator(".motion-btn:visible").first();
    check(
      g,
      "one Pause control is visible",
      (await page.locator(".motion-btn:visible").count()) === 1,
    );
    const box = await btn.boundingBox();
    check(
      g,
      "Pause control is at least 44px tall",
      box && box.height >= 44,
      box && `${box.width}x${box.height}`,
    );
    await btn.click();
    await page.waitForTimeout(300);
    const p1 = await canvasHash(page);
    await page.waitForTimeout(700);
    const p2 = await canvasHash(page);
    check(
      g,
      "Pause stops the animation",
      p1.h === p2.h &&
        (await motion(page)) === "paused" &&
        (await btn.getAttribute("aria-pressed")) === "true",
    );
    check(g, "fish stays visible while paused", p1.lit > 50);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => window.__akf);
    await page.waitForTimeout(800);
    check(g, "Pause is remembered after reload", (await motion(page)) === "paused");
    await page.locator(".motion-btn:visible").first().click();
    await page.waitForTimeout(300);
    const r1 = await canvasHash(page);
    await page.waitForTimeout(700);
    const r2 = await canvasHash(page);
    check(g, "Resume restarts the animation", r1.h !== r2.h && (await motion(page)) === "running");

    // Off screen: nothing is drawn while the hero is out of view.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    const o1 = await canvasHash(page);
    await page.waitForTimeout(700);
    const o2 = await canvasHash(page);
    check(g, "animation stops when the hero is off screen", o1.h === o2.h);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    // Protected zones: the strongest fish pixel over text and buttons, 120 s of swimming.
    const zones = await page.evaluate(() => {
      const hero = document.querySelector(".hero").getBoundingClientRect();
      const rel = (r) => [
        r.left - hero.left,
        r.top - hero.top,
        r.right - hero.left,
        r.bottom - hero.top,
      ];
      const zones = {};
      const box = (name, el) =>
        el && el.getClientRects().length && (zones[name] = rel(el.getBoundingClientRect()));
      const lines = (name, el) => {
        if (!el) return;
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n,
          k = 0;
        while ((n = w.nextNode())) {
          if (!n.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) if (r.width > 2) zones[name + k++] = rel(r);
        }
      };
      box("ctaDirectory", document.querySelector(".hero .btn-dir"));
      box("ctaAutoflow", document.querySelector(".hero .btn-af"));
      document.querySelectorAll(".motion-btn").forEach((el, i) => box("pause" + i, el));
      lines("kicker", document.querySelector(".hero .kicker"));
      lines("headline", document.querySelector(".hero h1"));
      lines("status", document.querySelector(".hero .status"));
      const worst = {};
      for (let i = 0; i < 240; i++) {
        const r = window.__akf.sim(0.5, zones);
        for (const k in r.max) worst[k] = Math.max(worst[k] || 0, r.max[k]);
      }
      const pct = {};
      for (const k in worst) {
        const name = k.replace(/[0-9]+$/, "");
        pct[name] = Math.max(pct[name] || 0, Math.round(worst[k] / 2.55));
      }
      return pct;
    });
    const worst = Math.max(0, ...Object.values(zones));
    // Up to 10% is the outer glow only; the body of the fish is far above that.
    check(
      g,
      "fish stays clear of headline, buttons and status",
      worst <= 10,
      JSON.stringify(zones),
    );
    await context.close();

    // Reduced motion: a still frame, no animation, control reflects it.
    const rm = await open(browser, "/?akf-debug=1", { ...vp, reducedMotion: "reduce" });
    await rm.page.waitForFunction(() => window.__akf);
    await rm.page.waitForTimeout(1000);
    const s1 = await canvasHash(rm.page);
    await rm.page.waitForTimeout(700);
    const s2 = await canvasHash(rm.page);
    check(
      g,
      "reduced motion: still frame, not animated",
      s1.h === s2.h && s1.lit > 50 && (await motion(rm.page)) === "paused",
    );
    const running = await rm.page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (x) =>
              x.playState === "running" && x.effect?.getComputedTiming().iterations === Infinity,
          ).length,
    );
    check(g, "reduced motion: no looping CSS animation", running === 0, `${running} running`);
    await rm.context.close();
  }
}

async function interactions(browser) {
  // Desktop: skip link, Products menu, theme, account dialog, CTAs.
  {
    const g = "navigation desktop";
    const { context, page, errors } = await open(browser, "/", VIEWPORTS.desktop);
    await page.waitForTimeout(800);
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
    check(g, "first Tab stop is the skip link", /skip/i.test(first || ""), first);

    const products = page.locator(".products-menu > button");
    await products.click();
    check(
      g,
      "Products menu opens",
      (await products.getAttribute("aria-expanded")) === "true" &&
        (await page.locator(".products-pop a:visible").count()) >= 2,
    );
    await page.keyboard.press("Escape");
    check(
      g,
      "Escape closes the Products menu",
      (await products.getAttribute("aria-expanded")) === "false",
    );

    const themeBtn = page.locator("header button", { hasText: /theme/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(700);
    const light = await page.evaluate(() => document.documentElement.dataset.theme);
    check(g, "theme switch changes the parent theme", light === "light", light);
    await page.goto(BASE + "/autoflow");
    await page.waitForTimeout(500);
    check(
      g,
      "AutoFlow keeps its own (dark) theme",
      (await page.evaluate(() => document.documentElement.dataset.theme)) === "dark",
    );
    await page.goto(BASE + "/");
    await page.waitForTimeout(500);
    check(
      g,
      "parent theme choice is remembered",
      (await page.evaluate(() => document.documentElement.dataset.theme)) === "light",
    );
    await page.locator("header button", { hasText: /theme/i }).first().click();
    await page.waitForTimeout(700);

    await page.locator("header").getByRole("button", { name: "Sign up" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    const fields = await dialog.locator("input").count();
    const disabled = await dialog.locator("input:disabled").count();
    check(g, "account dialog opens", fields > 0);
    const accountsOn = disabled === 0;
    if (accountsOn)
      check(
        g,
        "account form is live (accounts connected)",
        !(await dialog.locator('button[type="submit"]').isDisabled()),
      );
    else
      check(
        g,
        "account form is disabled with a notice (accounts not connected)",
        fields === disabled &&
          (await dialog.getByRole("status").count()) === 1 &&
          (await dialog.locator('button[type="submit"]').isDisabled()),
      );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    check(g, "Escape closes the account dialog", (await page.getByRole("dialog").count()) === 0);

    await page.locator(".hero .btn-dir").click();
    await page.waitForURL("**/directory");
    check(g, "Explore AI Tools goes to /directory", true);
    await page.goBack();
    await page.locator(".hero .btn-af").click();
    await page.waitForURL("**/autoflow");
    check(g, "Explore AutoFlow AI goes to /autoflow", true);
    await page
      .getByRole("link", { name: /workspace/i })
      .first()
      .click();
    await page.waitForURL("**/autoflow/app");
    if (accountsOn) {
      await page
        .getByRole("heading", { name: /sign in to open your workspace/i })
        .first()
        .waitFor();
      check(
        g,
        "workspace asks a signed-out visitor to sign in",
        (await page.getByRole("navigation", { name: "Workspace" }).count()) === 0,
      );
    } else {
      await page
        .getByRole("navigation", { name: "Workspace" })
        .getByRole("link", { name: "Projects" })
        .click();
      await page.waitForURL("**/autoflow/app/projects");
      check(
        g,
        "workspace New project button is disabled",
        await page.getByRole("button", { name: "New project" }).isDisabled(),
      );
      await page.getByRole("link", { name: /sample project/i }).click();
      await page.waitForURL("**/projects/sample");
      const stages = await page.locator("main ol > li h3:visible").allTextContents();
      check(
        g,
        "project shows the six stages in order",
        stages.join(" > ") ===
          "Research > Script > Voice > Video Assembly > Thumbnail / Metadata > Review",
        stages.join(" > "),
      );
    }
    check(g, "no console errors during the journey", errors.length === 0, errors.join(" | "));
    await context.close();
  }
  // Directory section navigation.
  {
    const g = "navigation directory";
    const { context, page, errors } = await open(browser, "/directory", VIEWPORTS.desktop);
    for (const [label, url] of [
      ["Explore Tools", "/tools"],
      ["Categories", "/categories"],
      ["Guides", "/guides"],
      ["Prompts", "/prompts"],
      ["Workflows", "/workflows"],
      ["Compare", "/compare"],
    ]) {
      await page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: label, exact: true })
        .click();
      await page.waitForURL("**" + url);
      check(g, `${label} opens ${url}`, (await page.locator("h1:visible").count()) === 1);
    }
    const nav = await page.getByRole("navigation", { name: "Main" }).innerText();
    check(g, "Deals and VoiceHub are not in the main navigation", !/deals|voicehub/i.test(nav));
    await page.goto(BASE + "/tools");
    await page.locator('main a[href^="/tools/"]').first().click();
    await page.waitForURL(/\/tools\/.+/);
    check(g, "tool card opens a tool page", true);
    check(g, "no console errors", errors.length === 0, errors.join(" | "));
    await context.close();
  }
  // Mobile menu.
  {
    const g = "navigation mobile";
    const { context, page, errors } = await open(browser, "/", VIEWPORTS.mobile);
    await page.waitForTimeout(800);
    await page.locator("header").getByRole("button", { name: /menu/i }).click();
    const sheet = page.getByRole("dialog");
    await sheet.waitFor();
    const links = await sheet.locator("a").count();
    check(g, "menu opens with product and section links", links >= 6, `${links} links`);
    const small = await sheet
      .locator("a, button")
      .evaluateAll((els) =>
        els
          .filter((e) => e.getBoundingClientRect().height < 44)
          .map((e) => e.textContent.trim().slice(0, 20)),
      );
    check(g, "menu targets are at least 44px tall", small.length === 0, small.join(", "));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    check(g, "Escape closes the menu", (await page.getByRole("dialog").count()) === 0);
    const ctas = await page.evaluate(() =>
      [...document.querySelectorAll(".hero .ctas .btn")].map((b) =>
        Math.round(b.getBoundingClientRect().bottom),
      ),
    );
    check(
      g,
      "both hero buttons are on the first screen",
      ctas.length === 2 && ctas.every((y) => y <= 844),
      ctas.join(", "),
    );
    check(g, "no console errors", errors.length === 0, errors.join(" | "));
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  await routes(browser);
  await hero(browser);
  await interactions(browser);
  await browser.close();
  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length - failed.length} passed, ${failed.length} failed, ${results.length} total`,
  );
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
