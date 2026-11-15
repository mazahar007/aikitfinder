import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { sessionCookieOptions } from "@/lib/supabase/cookies";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * A Supabase client that acts as the current visitor: it carries their session
 * cookie, so every query is subject to row level security. There is no
 * service-role client in the app.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  // Session checks compare token expiry with the current time, so they belong
  // to a real request only, never to a prefetched or prerendered shell.
  await connection();
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list)
            cookieStore.set(name, value, sessionCookieOptions(options));
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the
          // session on every request, so this is safe to ignore here.
        }
      },
    },
  });
}
