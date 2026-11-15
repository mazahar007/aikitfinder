import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { cookies, headers } from "next/headers";

/**
 * Anonymous guest identity for the search limit.
 *
 * The server creates a random identifier, signs it, and keeps it in an
 * HttpOnly cookie, so page scripts cannot read it and a visitor cannot invent
 * or alter one. The database only ever sees a keyed hash of the identifier.
 * It is never accepted from a request body or query string and never returned
 * in a response body.
 *
 * This identifies a browser, not a person: clearing cookies or using another
 * browser gives a new identity. The per-address cap in the database limits
 * how far that can be abused.
 */
export const GUEST_COOKIE = "akf_guest";
const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

const secret = process.env.GUEST_SEARCH_SECRET ?? "";
/** A short secret would make signatures guessable; refuse to run with one. */
export const guestIdentityConfigured = secret.length >= 32;

const hmac = (purpose: string, value: string) =>
  createHmac("sha256", secret).update(`${purpose}:${value}`).digest();

function sign(id: string): string {
  return hmac("akf-guest-cookie:v1", id).toString("base64url");
}

/** The identifier inside a cookie value, or null if the value was not issued by this server. */
function verify(value: string | undefined): string | null {
  if (!value) return null;
  const [id, signature, ...rest] = value.split(".");
  if (!id || !signature || rest.length || !/^[A-Za-z0-9_-]{43}$/.test(id)) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}

const hashOf = (id: string) => hmac("akf-guest-hash:v1", id).toString("hex");

/** The guest hash for this request if it carries a valid cookie; never creates one. */
export async function readGuestHash(): Promise<string | null> {
  if (!guestIdentityConfigured) return null;
  const id = verify((await cookies()).get(GUEST_COOKIE)?.value);
  return id ? hashOf(id) : null;
}

/**
 * The guest hash for this request, creating a new identity (and setting the
 * cookie) when the request has no valid one. A missing, altered or forged
 * cookie is simply replaced. Only callable where cookies can be set (route
 * handlers and Server Actions).
 */
export async function ensureGuestHash(): Promise<string> {
  if (!guestIdentityConfigured) throw new Error("Guest identity is not configured");
  const store = await cookies();
  let id = verify(store.get(GUEST_COOKIE)?.value);
  if (!id) {
    id = randomBytes(32).toString("base64url");
    store.set(GUEST_COOKIE, `${id}.${sign(id)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    });
  }
  return hashOf(id);
}

/**
 * A keyed hash of the caller's network address, for the daily per-address
 * cap. The address itself is never stored or logged. Null when the platform
 * does not supply one, in which case the cap is not applied.
 */
export async function requestAddressHash(): Promise<string | null> {
  if (!guestIdentityConfigured) return null;
  const h = await headers();
  // Set by the hosting platform; the first entry is the client.
  const address = (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "").trim();
  if (!address || address.length > 64) return null;
  return hmac("akf-guest-address:v1", address).toString("hex");
}
