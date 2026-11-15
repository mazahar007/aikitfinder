import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseUrl } from "@/lib/supabase/env";

/**
 * A server-only Supabase client with the secret key.
 *
 * It exists for one purpose: calling database functions that browser roles
 * are not allowed to execute (today, the guest search counter). It must never
 * be used to read or write user data, which always goes through the
 * signed-in user's own client and row level security.
 *
 * The key is read from SUPABASE_SECRET_KEY, which has no NEXT_PUBLIC_ prefix
 * and is therefore never included in browser code. `import "server-only"`
 * makes the build fail if this file is ever imported from a client component.
 */
const secretKey = process.env.SUPABASE_SECRET_KEY ?? "";
/** Normally the project URL. The override is for running against a local database gateway in tests. */
const serviceUrl = process.env.SUPABASE_SERVICE_URL || supabaseUrl;

export const serviceClientConfigured = Boolean(serviceUrl && secretKey);

let client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (!serviceClientConfigured) throw new Error("Service client is not configured");
  client ??= createClient(serviceUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
