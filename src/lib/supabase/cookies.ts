import type { CookieOptions } from "@supabase/ssr";

/**
 * Session cookies are set and read on the server only, so they are HttpOnly:
 * page scripts cannot read the tokens. Secure everywhere except local http.
 */
export function sessionCookieOptions(options: CookieOptions | undefined): CookieOptions {
  return {
    ...options,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
