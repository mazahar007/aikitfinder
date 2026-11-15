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
