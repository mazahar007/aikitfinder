/**
 * Supabase connection settings. Both values are public by design: the
 * publishable key identifies the project and grants nothing beyond what row
 * level security allows. No secret key is used by the app.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False on a build or machine without the two variables; accounts are then switched off. */
export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
