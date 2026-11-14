/**
 * Account system status.
 *
 * AIKitFinder uses one shared account for the AI Tools Directory and AutoFlow
 * AI (Supabase Auth, see docs/phase-1/architecture.md). In Phase 1 the schema
 * and this abstraction exist, but no Supabase project has been connected, so
 * sign-up and log-in are switched off. Nothing in the app pretends otherwise:
 * there is no placeholder login and no hard-coded user.
 *
 * To switch accounts on in a later phase: connect the project, implement
 * `getCurrentUser` and the two form actions against Supabase Auth, then set
 * `enabled` from the environment.
 */
export const authStatus = {
  enabled: false,
  reason:
    "Accounts are not open yet. Sign-up and log-in will be switched on once the account system is connected.",
} as const;

/** The signed-in user as the rest of the app sees it. */
export type SessionUser = {
  id: string;
  email: string;
  displayName: string | null;
};
