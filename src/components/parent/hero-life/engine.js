/**
 * Living hero layer of the AIKitFinder parent homepage: an original crystal
 * betta drawn in code on a 2D canvas, with ambient light and particles.
 * No 3D library and no external assets.
 *
 * This is the approved animation (docs/phase-0a/hybrid-proposal, commit
 * 0a2c613) moved into a module. The swimming, route, drawing and fallback
 * logic are unchanged; only the wiring differs:
 *  - the caller passes the hero element and the canvas;
 *  - Pause/Resume is driven through the returned controller, and the state is
 *    published on <html data-motion> for the stylesheet;
 *  - on phones the canvas covers only the fish's lane;
 *  - everything it attaches is removed by destroy().
 *
 * Behavior is specified in FISH_ANIMATION_SPEC.md, MOTION_AND_ACCESSIBILITY_SPEC.md
 * and PERFORMANCE_PLAN.md in that folder. Types are in engine.d.ts.
 */

export var MOTION_STORAGE_KEY = "akf-motion";

export function createHeroLife(hero, cv, options) {
  var opts = options || {};
  var root = document.documentElement;
  if (!hero || !cv || !cv.getContext) return null;
  var destroyed = false,
    viewTop = 0,
    viewH = 0;
  var ctx = cv.getContext("2d");
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = matchMedia("(pointer: coarse)").matches;
  var conn = navigator.connection || {};
  var lowPower =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
    conn.saveData === true;
  var W = 0,
    H = 0,
    dpr = 1,
    lite = false,
    eco = false,
    ecoForced = false;
  var seed = 7;
  function rnd() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  var P = { x: 0, y: 0, tx: 0, ty: 0, active: 0, last: -99 }; // pointer, eased
  var fish,
    motes = [],
    textRect = null,
    t = 0;

  function Fish() {
    this.n = eco ? 16 : 24;
    this.pts = [];
    this.h = Math.PI; // heading
    this.alpha = 0;
    this.flip = 1;
  }
  function layout() {
    var r = hero.getBoundingClientRect();
    W = Math.round(r.width);
    H = Math.round(r.height);
    lite = !!opts.lite || W < 721 || coarse; // phone layout: its own lane and smaller fish
    eco = lite || lowPower || ecoForced || !!opts.eco; // lighter drawing, same route
    dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : eco ? 1 : 1.5);
    var col = hero.querySelector(".hero-cols > div");
    if (col) {
      var c = col.getBoundingClientRect();
      textRect = {
        x: c.left - r.left - 30,
        y: c.top - r.top - 30,
        w: Math.min(c.width, 610) + 50,
        h: c.height + 44,
      };
    }
    fish = new Fish();
    fish.len = lite
      ? Math.min(150, Math.max(116, W * 0.36))
      : Math.min(392, Math.max(268, W * 0.245)); // about 22% larger than the first proposal
    buildRoute();
    // Phone: the canvas covers only the fish's lane, not the whole hero (performance plan, section 4).
    viewTop = lite ? Math.max(0, Math.round(route[0][1] - 110)) : 0;
    viewH = lite ? Math.min(220, H - viewTop) : H;
    cv.style.top = viewTop + "px";
    cv.style.height = viewH + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(viewH * dpr);
    seed = 7;
    motes = [];
    var count = eco ? 14 : 44;
    for (var i = 0; i < count; i++)
      motes.push({
        x: rnd() * W,
        y: viewTop + rnd() * viewH,
        r: 0.5 + rnd() * 1.5,
        z: 0.3 + rnd() * 0.7,
        ph: rnd() * 6.28,
        hue: rnd(),
      });
    var seg = fish.len / fish.n;
    carrot = lite ? W * 0.3 : W * 0.34;
    fish.h = 0;
    var sx = route[0][0] + (lite ? W * 0.2 : W * 0.24),
      sy = route[0][1];
    for (var k = 0; k < fish.n; k++) fish.pts.push({ x: sx - k * seg, y: sy });
    P.x = P.tx = W * 0.7;
    P.y = P.ty = H * 0.4;
  }
  var route = [],
    routeLen = 0,
    carrot = 0;
  function buildRoute() {
    var hr = hero.getBoundingClientRect(),
      st = hero.querySelector(".stage").getBoundingClientRect();
    var L0 = st.left - hr.left,
      R0 = st.right - hr.left,
      T0 = st.top - hr.top,
      B0 = st.bottom - hr.top;
    if (lite) {
      // mobile: one calm lane of open water between the status lines and the previews
      // Just below the Pause control, clear of it by the fish's full fin height,
      // so the fish is inside the first screen on a phone.
      var y = Math.min(
        T0 - 44,
        (textRect ? textRect.y + textRect.h - 14 : T0 - 110) + fish.len * 0.31 + 26,
      );
      // The lane runs past both screen edges, so the fish turns around out of
      // sight and glides across the visible lane in a straight, calm pass.
      route = [
        [-W * 0.42, y],
        [W * 1.42, y - 6],
        [W * 1.42, y + 6],
        [-W * 0.42, y],
      ];
    } else {
      // The lane under the buttons is placed from the real text block, so the
      // fish (fins included) always clears the status lines above it.
      // reach = how far the fins extend above the spine, plus the bob and a margin
      var reach = fish.len * 0.31 + 18,
        nav = document.querySelector("header.top .nav"),
        head = nav ? nav.getBoundingClientRect().bottom - hr.top : 76,
        bottom = Math.min(
          H - fish.len * 0.22,
          Math.max(textRect ? textRect.y + textRect.h - 14 + reach : 0, B0 + 40),
        ),
        top = Math.max(head + reach, T0 - 6),
        gap = L0 + 14,
        right = Math.min(W - 40, R0 + 70);
      // under the buttons → right → up the far side → back across the top, half hidden
      // behind the upper preview → down the gap. Both lanes are placed from the real
      // positions of the header and the text block, so the fish clears them at any width.
      route = [
        [W * 0.13, bottom],
        [right, bottom],
        [right, top],
        [gap, top],
        [gap, bottom - 46], // straight down beside the previews, well right of the status line
        [gap - 56, bottom],
      ];
    }
    routeLen = 0;
    for (var i = 0; i < route.length; i++) {
      var a = route[i],
        b = route[(i + 1) % route.length];
      a[2] = Math.hypot(b[0] - a[0], b[1] - a[1]);
      routeLen += a[2];
    }
  }
  function onRoute(d) {
    d = ((d % routeLen) + routeLen) % routeLen;
    for (var i = 0; i < route.length; i++) {
      var a = route[i],
        b = route[(i + 1) % route.length];
      if (d <= a[2]) {
        var k = d / (a[2] || 1);
        return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k };
      }
      d -= a[2];
    }
    return { x: route[0][0], y: route[0][1] };
  }
  function target(tt) {
    var g = onRoute(carrot);
    g.y += Math.sin(tt * 0.5) * (lite ? 5 : 8); // gentle rise and fall
    if (!lite && P.active > 0.02) {
      // curious, never chasing: lean toward the pointer, capped
      var dx = P.x - g.x,
        dy = P.y - g.y,
        dd = Math.hypot(dx, dy) || 1,
        pull = Math.min(150, dd * 0.3) * P.active;
      g.x += (dx / dd) * pull;
      g.y += (dy / dd) * pull;
    }
    return g;
  }
  function step(dt) {
    t += dt;
    P.x += (P.tx - P.x) * Math.min(1, dt * 2.2);
    P.y += (P.ty - P.y) * Math.min(1, dt * 2.2);
    var want = t - P.last < 4 ? 1 : 0;
    P.active += (want - P.active) * Math.min(1, dt * 1.2);
    var hd = fish.pts[0],
      g = target(t);
    var dx = g.x - hd.x,
      dy = g.y - hd.y,
      dist = Math.hypot(dx, dy);
    var desired = Math.atan2(dy, dx),
      d = desired - fish.h;
    while (d > Math.PI) d -= 6.2832;
    while (d < -Math.PI) d += 6.2832;
    // When it has to reverse, the fish turns downward, away from the text and buttons above the lane.
    if (Math.abs(d) > 2.3)
      d = Math.sin(fish.h + 0.4) > Math.sin(fish.h - 0.4) ? Math.abs(d) : -Math.abs(d);
    var maxTurn = 0.75 * dt;
    fish.h += Math.max(-maxTurn, Math.min(maxTurn, d));
    var sp = (lite ? 24 : 36) + Math.min(26, dist * 0.08); // px per second: slow
    sp *= Math.max(0.3, Math.cos(Math.min(1.45, Math.abs(d) * 0.55))); // ease off through turns: a tight, unhurried pivot
    if (dist < (lite ? 90 : 150)) carrot += sp * dt * 1.6; // lead the fish along its route
    hd.x += Math.cos(fish.h) * sp * dt;
    hd.y += Math.sin(fish.h) * sp * dt;
    var seg = fish.len / fish.n;
    for (var i = 1; i < fish.n; i++) {
      var a = fish.pts[i - 1],
        b = fish.pts[i],
        ex = b.x - a.x,
        ey = b.y - a.y,
        l = Math.hypot(ex, ey) || 1;
      b.x = a.x + (ex / l) * seg;
      b.y = a.y + (ey / l) * seg;
    }
    var ft = Math.max(-1, Math.min(1, Math.cos(fish.h) * 3.2));
    fish.flip += (ft - fish.flip) * Math.min(1, dt * 3);
    // stay faint whenever the fish is under the text column
    var inText =
      textRect &&
      hd.x > textRect.x &&
      hd.x < textRect.x + textRect.w &&
      hd.y > textRect.y &&
      hd.y < textRect.y + textRect.h;
    var aT = lite ? (inText ? 0.2 : 0.72) : inText ? 0.16 : 0.9;
    fish.alpha += (aT - fish.alpha) * Math.min(1, dt * 1.6);
    for (var m = 0; m < motes.length; m++) {
      var o = motes[m];
      o.y -= (4 + 7 * o.z) * dt;
      o.x += Math.sin(t * 0.3 + o.ph) * 3 * dt;
      if (o.y < viewTop - 6) {
        o.y = viewTop + viewH + 6;
        o.x = rnd() * W;
      }
    }
  }
  function shape() {
    // displayed spine = chain + travelling wave that grows toward the tail
    var n = fish.n,
      out = [];
    for (var i = 0; i < n; i++) {
      var p = fish.pts[i],
        a = fish.pts[Math.max(0, i - 1)],
        b = fish.pts[Math.min(n - 1, i + 1)];
      var tx = a.x - b.x,
        ty = a.y - b.y,
        l = Math.hypot(tx, ty) || 1,
        nx = -ty / l,
        ny = tx / l;
      var u = i / (n - 1),
        wave = Math.sin(t * 2.4 - u * 5.2) * fish.len * 0.055 * Math.pow(u, 1.5);
      out.push({ x: p.x + nx * wave, y: p.y + ny * wave, nx: nx, ny: ny, u: u });
    }
    return out;
  }
  function bodyW(u) {
    // half-width of the body along its length (0 = nose)
    var b = 0.5;
    if (u > b) return 0;
    var v = u / b;
    return fish.len * 0.105 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.62)), 0.9) * (1 - v * 0.25);
  }
  function veil(v) {
    // tail fan: opens toward the end, with a soft rounded edge
    var e = v < 0.84 ? 0 : (v - 0.84) / 0.16;
    return Math.pow(v, 0.62) * (1 - 0.62 * e * e * (3 - 2 * e));
  }
  function fin(S, i0, i1, side, height, sway, c0, c1) {
    var up = side * fish.flip;
    ctx.beginPath();
    for (var i = i0; i <= i1; i++) {
      var s = S[i],
        w = bodyW(s.u) * 0.7;
      ctx.lineTo(s.x + s.nx * w * up, s.y + s.ny * w * up);
    }
    for (var j = i1; j >= i0; j--) {
      var q2 = S[j],
        v = (j - i0) / (i1 - i0),
        hgt =
          height *
          Math.sin(Math.PI * Math.pow(v, 0.7)) *
          (0.85 + 0.15 * Math.sin(t * 1.7 - j * 0.6 + sway));
      var lag = S[Math.min(S.length - 1, j + 2)];
      ctx.lineTo(
        q2.x + q2.nx * (bodyW(q2.u) * 0.7 + hgt) * up + (lag.x - q2.x) * 0.5,
        q2.y + q2.ny * (bodyW(q2.u) * 0.7 + hgt) * up + (lag.y - q2.y) * 0.5,
      );
    }
    ctx.closePath();
    var a = S[i0],
      b = S[i1],
      gr = ctx.createLinearGradient(a.x, a.y, b.x + b.nx * height * up, b.y + b.ny * height * up);
    gr.addColorStop(0, c0);
    gr.addColorStop(1, c1);
    ctx.fillStyle = gr;
    ctx.fill();
  }
  function drawFish() {
    var S = shape(),
      n = S.length,
      L = fish.len,
      A = fish.alpha;
    if (A < 0.01) return;
    var mid = S[Math.floor(n * 0.3)];
    ctx.save();
    ctx.globalAlpha = A;
    // soft halo
    var hg = ctx.createRadialGradient(mid.x, mid.y, 0, mid.x, mid.y, L * 0.6);
    hg.addColorStop(0, "rgba(170,140,255,0.20)");
    hg.addColorStop(0.5, "rgba(255,124,198,0.06)");
    hg.addColorStop(1, "rgba(120,100,255,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(mid.x, mid.y, L * 0.6, 0, 6.2832);
    ctx.fill();
    var bEnd = Math.round((n - 1) * 0.5);
    // veil tail: a translucent fan that widens, then tapers, behind the body
    var layers = eco ? 1 : 2;
    for (var k = 0; k < layers; k++) {
      ctx.beginPath();
      var i, s, v, w;
      for (i = bEnd - 1; i < n; i++) {
        s = S[i];
        v = (i - bEnd + 1) / (n - bEnd);
        w = L * (0.02 + (0.2 - k * 0.05) * veil(v)) * (0.9 + 0.1 * Math.sin(t * 1.9 - i * 0.5 + k));
        ctx.lineTo(s.x + s.nx * w, s.y + s.ny * w);
      }
      for (i = n - 1; i >= bEnd - 1; i--) {
        s = S[i];
        v = (i - bEnd + 1) / (n - bEnd);
        w =
          L *
          (0.02 + (0.16 - k * 0.04) * veil(v)) *
          (0.9 + 0.1 * Math.sin(t * 1.9 - i * 0.5 + 2 + k));
        ctx.lineTo(s.x - s.nx * w, s.y - s.ny * w);
      }
      ctx.closePath();
      var a = S[bEnd],
        b = S[n - 1],
        tg = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      tg.addColorStop(0, "rgba(176,140,255,0.62)");
      tg.addColorStop(0.55, "rgba(214,150,255,0.34)");
      tg.addColorStop(1, "rgba(255,124,198,0.05)");
      ctx.fillStyle = tg;
      ctx.fill();
    }
    if (!eco) {
      // fin rays
      ctx.strokeStyle = "rgba(240,225,255,0.22)";
      ctx.lineWidth = 1;
      for (var r = -2; r <= 2; r++) {
        ctx.beginPath();
        for (var i2 = bEnd; i2 < n; i2++) {
          var s2 = S[i2],
            v2 = (i2 - bEnd) / (n - 1 - bEnd),
            w2 = L * 0.16 * veil(v2) * (r / 2.6);
          ctx.lineTo(s2.x + s2.nx * w2, s2.y + s2.ny * w2);
        }
        ctx.stroke();
      }
    }
    // dorsal and ventral fins (collapse as the fish turns, like a 3D turn)
    var d0 = Math.round(n * 0.12),
      d1 = Math.round(n * 0.46);
    fin(S, d0, d1, -1, L * 0.2, 0, "rgba(206,184,255,0.62)", "rgba(255,160,224,0.22)");
    fin(
      S,
      Math.round(n * 0.2),
      Math.round(n * 0.44),
      1,
      L * 0.13,
      1.4,
      "rgba(170,150,255,0.5)",
      "rgba(120,220,240,0.10)",
    );
    // body
    ctx.beginPath();
    for (var b1 = 0; b1 <= bEnd; b1++) {
      var s3 = S[b1],
        w3 = bodyW(s3.u);
      ctx.lineTo(s3.x + s3.nx * w3, s3.y + s3.ny * w3);
    }
    for (var b2 = bEnd; b2 >= 0; b2--) {
      var s4 = S[b2],
        w4 = bodyW(s4.u);
      ctx.lineTo(s4.x - s4.nx * w4, s4.y - s4.ny * w4);
    }
    ctx.closePath();
    var bg = ctx.createLinearGradient(S[0].x, S[0].y, S[bEnd].x, S[bEnd].y);
    bg.addColorStop(0, "#f6ecff");
    bg.addColorStop(0.3, "#cdb2ff");
    bg.addColorStop(0.7, "#9a72ff");
    bg.addColorStop(1, "#c07af0");
    ctx.fillStyle = bg;
    ctx.fill();
    if (!eco) {
      // crystal facets and a top highlight
      for (var f = 1; f < bEnd; f++) {
        var p0 = S[f],
          p1 = S[f + 1],
          wa = bodyW(p0.u),
          wb = bodyW(p1.u),
          up = -fish.flip;
        ctx.beginPath();
        ctx.moveTo(p0.x + p0.nx * wa * up, p0.y + p0.ny * wa * up);
        ctx.lineTo(p1.x + p1.nx * wb * up, p1.y + p1.ny * wb * up);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p0.x, p0.y);
        ctx.closePath();
        ctx.fillStyle = f % 2 ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.07)";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p0.x - p0.nx * wa * up, p0.y - p0.ny * wa * up);
        ctx.lineTo(p1.x - p1.nx * wb * up, p1.y - p1.ny * wb * up);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p0.x, p0.y);
        ctx.closePath();
        ctx.fillStyle = f % 2 ? "rgba(60,20,140,0.10)" : "rgba(60,20,140,0.22)";
        ctx.fill();
      }
    }
    // pectoral fin and eye
    var pe = S[Math.round(n * 0.14)],
      flap = 0.5 + 0.5 * Math.sin(t * 3.1),
      sd = fish.flip;
    ctx.beginPath();
    ctx.moveTo(pe.x, pe.y);
    ctx.quadraticCurveTo(
      pe.x + pe.nx * L * 0.1 * sd - Math.cos(fish.h) * L * 0.02,
      pe.y + pe.ny * L * 0.1 * sd,
      pe.x - Math.cos(fish.h) * L * (0.1 + 0.03 * flap) + pe.nx * L * 0.06 * sd,
      pe.y - Math.sin(fish.h) * L * (0.1 + 0.03 * flap) + pe.ny * L * 0.06 * sd,
    );
    ctx.closePath();
    ctx.fillStyle = "rgba(255,235,255,0.42)";
    ctx.fill();
    var e = S[1],
      ew = bodyW(e.u) * 0.35 * -fish.flip;
    ctx.beginPath();
    ctx.arc(e.x + e.nx * ew, e.y + e.ny * ew, Math.max(1.6, L * 0.011), 0, 6.2832);
    ctx.fillStyle = "#2a1058";
    ctx.fill();
    ctx.restore();
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, -viewTop * dpr);
    ctx.clearRect(0, viewTop, W, viewH);
    if (!eco) {
      // ambient light that eases toward the pointer
      var lg = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, 420);
      lg.addColorStop(0, "rgba(150,125,255," + (0.05 + 0.07 * P.active) + ")");
      lg.addColorStop(1, "rgba(150,125,255,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(P.x - 420, P.y - 420, 840, 840); // only the lit square, not the whole canvas
    }
    var ox = lite ? 0 : (P.x / W - 0.5) * -14 * P.active,
      oy = lite ? 0 : (P.y / H - 0.5) * -10 * P.active;
    for (var m = 0; m < motes.length; m++) {
      var o = motes[m],
        tw = 0.35 + 0.3 * Math.sin(t * 0.8 + o.ph);
      ctx.globalAlpha = tw * o.z;
      ctx.fillStyle = o.hue < 0.6 ? "#c9bcff" : o.hue < 0.85 ? "#ffb0dd" : "#a5f3fa";
      ctx.beginPath();
      ctx.arc(o.x + ox * o.z, o.y + oy * o.z, o.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawFish();
  }

  // ── run state: paused / off-screen / hidden tab / reduced motion ──
  var paused = false,
    inView = true,
    raf = 0,
    last = 0,
    acc = 0,
    slow = 0;
  try {
    paused = localStorage.getItem(MOTION_STORAGE_KEY) === "paused";
  } catch {}
  if (reduced) paused = true; // opt-in only
  function running() {
    return !destroyed && !paused && inView && !document.hidden;
  }
  function frame(now) {
    raf = 0;
    if (!running()) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (eco) {
      acc += dt;
      if (acc < 1 / 30) {
        raf = requestAnimationFrame(frame);
        return;
      }
      dt = acc;
      acc = 0;
    }
    step(dt);
    draw();
    // adaptive quality: fall back to the lightweight mode if frames run long
    if (!eco && !opts.full) {
      slow = dt > 0.028 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 90) {
        root.dataset.eco = "1";
        ecoForced = true;
        layout();
      }
    }
    root.style.setProperty("--px", lite ? 0 : ((P.x / W - 0.5) * P.active).toFixed(3));
    root.style.setProperty("--py", lite ? 0 : ((P.y / H - 0.5) * P.active).toFixed(3));
    raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (running() && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function sync() {
    root.setAttribute("data-motion", paused ? "paused" : "running");
    if (opts.onPausedChange) opts.onPausedChange(paused);
    kick();
  }
  function still(sec) {
    for (var i = 0; i < sec * 60; i++) step(1 / 60);
    draw();
  }

  // Review and QA hooks: only built when the caller asks for them.
  var debug = !opts.debug
    ? null
    : {
        /** average script cost of one frame (simulate + draw), in milliseconds */
        bench: function (n) {
          var t0 = performance.now();
          for (var i = 0; i < n; i++) {
            step(1 / 60);
            draw();
          }
          return (performance.now() - t0) / n;
        },
        /**
         * Advance the simulation, draw only the fish, and report the strongest
         * fish pixel (0-255) inside each rectangle given in hero coordinates.
         */
        sim: function (sec, zones) {
          for (var i = 0; i < sec * 30; i++) step(1 / 30);
          ctx.setTransform(dpr, 0, 0, dpr, 0, -viewTop * dpr);
          ctx.clearRect(0, viewTop, W, viewH);
          drawFish();
          var out = {};
          for (var k in zones) {
            var z = zones[k],
              x = Math.max(0, Math.floor(z[0] * dpr)),
              y = Math.max(0, Math.floor((z[1] - viewTop) * dpr));
            var w = Math.min(cv.width - x, Math.ceil((z[2] - z[0]) * dpr)),
              h = Math.min(
                cv.height - y,
                Math.ceil((Math.min(z[3], viewTop + viewH) - Math.max(z[1], viewTop)) * dpr),
              );
            var m = 0;
            if (w > 0 && h > 0) {
              var d = ctx.getImageData(x, y, w, h).data;
              for (var p = 3; p < d.length; p += 4) if (d[p] > m) m = d[p];
            }
            out[k] = m;
          }
          return {
            max: out,
            len: fish.len,
            head: [fish.pts[0].x, fish.pts[0].y],
            lite: lite,
            eco: eco,
          };
        },
      };

  layout();
  var pose = typeof opts.pose === "number" ? opts.pose : lite ? 10 : 12;
  P.last = -99;
  still(pose); // a composed first frame, also what is shown when motion is off
  sync();

  var io = null,
    ro = null,
    rz = 0;
  function onPointer(e) {
    if (e.pointerType === "touch") return;
    var r = hero.getBoundingClientRect();
    P.tx = e.clientX - r.left;
    P.ty = e.clientY - r.top;
    P.last = t;
  }
  // Recompute the route whenever the hero's layout changes: window resize, web
  // fonts arriving, or content reflow. It is never built from stale positions.
  function relayout() {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (destroyed) return;
      layout();
      still(pose);
      kick();
    }, 150);
  }
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      function (es) {
        inView = es[0].isIntersecting;
        kick();
      },
      { threshold: 0.05 },
    );
    io.observe(hero);
  }
  document.addEventListener("visibilitychange", kick);
  hero.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("resize", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if ("ResizeObserver" in window) {
    ro = new ResizeObserver(relayout);
    ro.observe(hero);
  }

  return {
    isPaused: function () {
      return paused;
    },
    /** Pause or resume all persistent motion and remember the choice on this device. */
    setPaused: function (next) {
      paused = !!next;
      try {
        localStorage.setItem(MOTION_STORAGE_KEY, paused ? "paused" : "on");
      } catch {
        // Storage can be unavailable (private mode); the choice still applies for this visit.
      }
      sync();
    },
    debug: debug,
    destroy: function () {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(rz);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      document.removeEventListener("visibilitychange", kick);
      hero.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", relayout);
      root.style.removeProperty("--px");
      root.style.removeProperty("--py");
    },
  };
}
