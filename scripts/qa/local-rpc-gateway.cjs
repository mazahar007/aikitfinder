#!/usr/bin/env node
/**
 * Test-only stand-in for the Supabase REST endpoint the app uses to call the
 * guest-search database functions. It forwards
 *   POST /rest/v1/rpc/consume_guest_search
 *   POST /rest/v1/rpc/guest_search_status
 * to a local PostgreSQL through psql, running as the `service_role` role so
 * the function grants are exercised. Started by guest-search-check.sh; never
 * used in production.
 *
 *   node local-rpc-gateway.cjs <port> <api-key> -- <psql command and arguments…>
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const http = require("node:http");
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const { spawn } = require("node:child_process");

const [port, apiKey, , ...psql] = process.argv.slice(2);
const HASH = /^[0-9a-f]{64}$/;
const UUID = /^[0-9a-f-]{36}$/i;

function sql(text, role = "service_role") {
  return new Promise((resolve, reject) => {
    const child = spawn(psql[0], [...psql.slice(1), "-At", "-f", "-"]);
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(err.trim()))));
    child.stdin.end(`${role ? `set role ${role};\n` : ""}${text}\n`);
  });
}

// Arguments are validated against strict patterns above before being placed in SQL.
const lit = (value, pattern) => {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "string" || !pattern.test(value)) throw new Error("bad argument");
  return `'${value}'`;
};

const handlers = {
  "/rest/v1/rpc/consume_guest_search": (b) =>
    sql(
      `select consume_guest_search(${lit(b.p_guest_hash, HASH)}, ${lit(b.p_request_id, UUID)}::uuid, ${lit(b.p_ip_hash, HASH)});`,
    ),
  "/rest/v1/rpc/guest_search_status": (b) =>
    sql(`select guest_search_status(${lit(b.p_guest_hash, HASH)});`),
  // Test controls (not part of Supabase): simulate the passing of a UTC day, and read totals.
  "/__test/next-day": () =>
    sql(
      `update guest_search_usage set usage_date = usage_date - 1;
       update guest_search_requests set usage_date = usage_date - 1;
       update guest_search_ip_usage set usage_date = usage_date - 1;
       select '{"ok":true}';`,
      null,
    ),
  "/__test/totals": () =>
    sql(
      `select json_build_object(
         'guests', (select count(*) from guest_search_usage),
         'max_count', (select coalesce(max(search_count), 0) from guest_search_usage),
         'accepted_today', (select coalesce(sum(search_count), 0) from guest_search_usage where usage_date = (now() at time zone 'utc')::date),
         'requests', (select count(*) from guest_search_requests));`,
      null,
    ),
  // What a browser role gets when it tries the tables or functions directly.
  "/__test/as-anon": () =>
    sql(
      `do $$ declare n int; denied int := 0; begin
         begin select count(*) into n from guest_search_usage; exception when insufficient_privilege then denied := denied + 1; end;
         begin insert into guest_search_usage (guest_hash, usage_date) values (repeat('9', 64), current_date); exception when insufficient_privilege then denied := denied + 1; end;
         begin perform consume_guest_search(repeat('9', 64), gen_random_uuid(), null); exception when insufficient_privilege then denied := denied + 1; end;
         begin perform guest_search_status(repeat('9', 64)); exception when insufficient_privilege then denied := denied + 1; end;
         perform set_config('akf.denied', denied::text, false);
       end $$;
       select json_build_object('denied', current_setting('akf.denied')::int);`,
      "anon",
    ),
};

// ---------------------------------------------------------------------------
// Stand-in for Supabase Auth and PostgREST, enough for the admin panel checks:
// a signing key with a JWKS endpoint, test tokens, generic function calls as
// the signed-in user (so permissions and row level security apply), and the
// one table read the app makes for a profile. Test use only.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-require-imports -- plain Node script
const crypto = require("node:crypto");
const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const KID = "local-test-key";
const b64 = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64url");
const origin = () => `http://127.0.0.1:${port}`;

function mintToken(sub, email) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: "ES256", typ: "JWT", kid: KID });
  const body = b64({
    iss: `${origin()}/auth/v1`,
    aud: "authenticated",
    role: "authenticated",
    sub,
    email,
    iat: now,
    exp: now + 3600,
    is_anonymous: false,
  });
  const signature = crypto.sign("sha256", Buffer.from(`${head}.${body}`), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return `${head}.${body}.${signature.toString("base64url")}`;
}

/** The verified subject of a bearer token, or null (visitor). */
function subjectOf(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const [head, body, signature] = token.split(".");
  if (!head || !body || !signature) return null;
  try {
    const ok = crypto.verify(
      "sha256",
      Buffer.from(`${head}.${body}`),
      { key: publicKey, dsaEncoding: "ieee-p1363" },
      Buffer.from(signature, "base64url"),
    );
    const claims = JSON.parse(Buffer.from(body, "base64url").toString());
    return ok && claims.exp > Date.now() / 1000 && /^[0-9a-f-]{36}$/.test(claims.sub)
      ? claims.sub
      : null;
  } catch {
    return null;
  }
}

const asUser = (sub, statement) =>
  sql(
    `begin;
     set local role ${sub ? "authenticated" : "anon"};
     select set_config('request.jwt.claim.sub', '${sub ?? ""}', true) \\gset ignored_
     ${statement}
     commit;`,
    null,
  );

const signatures = new Map();
async function describe(fn) {
  if (!/^[a-z_][a-z0-9_]*$/.test(fn)) throw new Error("bad function name");
  if (!signatures.has(fn)) {
    const row = await sql(
      `select json_build_object('names', coalesce(proargnames, '{}'), 'types', (select coalesce(array_agg(t::regtype::text), '{}') from unnest(proargtypes) t),
              'set', proretset, 'ret', prorettype::regtype::text)
       from pg_proc where proname = '${fn}' and pronamespace = 'public'::regnamespace limit 1;`,
      null,
    );
    if (!row) throw new Error("unknown function");
    signatures.set(fn, JSON.parse(row));
  }
  return signatures.get(fn);
}

async function callFunction(fn, body, sub) {
  const sig = await describe(fn);
  const literal = `'${JSON.stringify(body ?? {}).replace(/'/g, "''")}'::jsonb`;
  const args = sig.types
    .map((type, i) => {
      const name = sig.names[i];
      if (!(name in (body ?? {}))) return null;
      return type === "jsonb"
        ? `${name} => (${literal} -> '${name}')`
        : `${name} => (${literal} ->> '${name}')::${type}`;
    })
    .filter(Boolean)
    .join(", ");
  const call = `public.${fn}(${args})`;
  const statement = sig.set
    ? `select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from ${call} t;`
    : sig.ret === "void"
      ? `select ${call}; select 'null';`
      : `select coalesce(to_jsonb(${call}), 'null'::jsonb);`;
  const out = await asUser(sub, statement);
  return out.split("\n").filter(Boolean).pop() ?? "null";
}

/** psql reports errors as "ERROR:  message"; map the ones the app distinguishes. */
function pgError(e) {
  const message = String(e.message || e);
  const text = (message.match(/ERROR:\s+(.*)/) || [null, message])[1].split("\n")[0];
  const code =
    /permission denied|not allowed|cannot change|cannot be|bootstrap is closed|your own role/.test(
      text,
    )
      ? "42501"
      : /violates check constraint/.test(text)
        ? "23514"
        : "22023";
  return { code, message: text };
}

Object.assign(handlers, {
  "/__test/token": (b) => JSON.stringify({ token: mintToken(b.sub, b.email) }),
  "/__test/sql": (b) => sql(b.sql, null),
});

http
  .createServer((req, res) => {
    let raw = "";
    req.on("data", (d) => (raw += d));
    req.on("end", async () => {
      const path = req.url.split("?")[0];
      const send = (status, body) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(typeof body === "string" ? body : JSON.stringify(body));
      };
      if (path === "/auth/v1/.well-known/jwks.json")
        return send(200, {
          keys: [
            {
              ...publicKey.export({ format: "jwk" }),
              kid: KID,
              alg: "ES256",
              use: "sig",
              key_ops: ["verify"],
            },
          ],
        });
      const rpc = path.match(/^\/rest\/v1\/rpc\/([a-z_0-9]+)$/);
      if (rpc && !handlers[path]) {
        try {
          return send(200, await callFunction(rpc[1], raw ? JSON.parse(raw) : {}, subjectOf(req)));
        } catch (e) {
          const error = pgError(e);
          return send(error.code === "42501" ? 403 : 400, error);
        }
      }
      if (path === "/rest/v1/profiles") {
        const id = (new URL(req.url, origin()).searchParams.get("id") || "").replace(/^eq\./, "");
        if (!/^[0-9a-f-]{36}$/.test(id)) return send(400, { message: "bad id" });
        const row = await asUser(
          subjectOf(req),
          `select coalesce((select to_jsonb(p) from (select display_name from profiles where id = '${id}') p)::text, '');`,
        ).catch(() => "");
        const last = row.split("\n").filter(Boolean).pop();
        return last ? send(200, last) : send(406, { code: "PGRST116", message: "no rows" });
      }
      // The local test accounts have no projects.
      if (path === "/rest/v1/autoflow_projects") return send(200, []);
      const handler = handlers[path];
      if (!handler) return send(404, { message: "not found" });
      if (!path.startsWith("/__test/") && req.headers.apikey !== apiKey)
        return send(401, { message: "invalid api key" });
      try {
        send(200, await handler(raw ? JSON.parse(raw) : {}));
      } catch (e) {
        send(400, { message: String(e.message || e).slice(0, 200) });
      }
    });
  })
  .listen(Number(port), "127.0.0.1", () => console.log(`gateway on ${port}`));
