import { supabaseConfigured } from "@/lib/supabase/env";

/**
 * Account system status.
 *
 * AIKitFinder uses one shared account for the AI Tools Directory and AutoFlow
 * AI, on Supabase Auth. Accounts are on when the Supabase project is
 * configured (see .env.example). On a machine or build without it they are
 * off, and the app says so: there is no placeholder login and no hard-coded
 * user.
 */
export const authStatus = {
  enabled: supabaseConfigured,
  reason:
    "Accounts are not open yet. Sign-up and log-in will be switched on once the account system is connected.",
} as const;

/** The signed-in user as the rest of the app sees it. Deliberately narrow. */
export type SessionUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Set by the reset-link callback for a few minutes and bound to the user it
 * was issued for. Required to set a new password. HttpOnly.
 */
export const RECOVERY_COOKIE = "akf-recovery";
export const RECOVERY_WINDOW_SECONDS = 15 * 60;
