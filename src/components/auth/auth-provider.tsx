"use client";

import * as React from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { logOut } from "@/lib/auth/actions";
import { authStatus } from "@/lib/auth/config";

export type AuthMode = "signup" | "login";

/** What a header may show about the signed-in visitor. */
export type AccountSummary = { email: string; displayName: string | null };

type OpenAuth = (mode?: AuthMode, options?: { returnTo?: string; returnLabel?: string }) => void;

type AuthContextValue = {
  openAuth: OpenAuth;
  /** undefined while it is being looked up, null when signed out. */
  account: AccountSummary | null | undefined;
  signOut: () => void;
  signingOut: boolean;
};

const AuthContext = React.createContext<AuthContextValue>({
  openAuth: () => {},
  account: null,
  signOut: () => {},
  signingOut: false,
});

/** Opens the shared Sign up / Log in dialog from anywhere in the three products. */
export function useAuthDialog(): OpenAuth {
  return React.useContext(AuthContext).openAuth;
}

/** The signed-in visitor (for display only) and a way to log out. */
export function useAccount() {
  const { account, signOut, signingOut } = React.useContext(AuthContext);
  return { account, signOut, signingOut };
}

/**
 * One account dialog and one account state for the whole site (owner decision
 * F-07: no product-specific login pages). Mounted once in the root layout.
 *
 * The session lives in HttpOnly cookies, so the page asks the server who is
 * signed in rather than reading a token itself.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    open: boolean;
    mode: AuthMode;
    returnTo?: string;
    returnLabel?: string;
  }>({ open: false, mode: "signup" });
  const [account, setAccount] = React.useState<AccountSummary | null | undefined>(
    authStatus.enabled ? undefined : null,
  );
  const [signingOut, startSignOut] = React.useTransition();

  React.useEffect(() => {
    if (!authStatus.enabled) return;
    let cancelled = false;
    fetch("/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((body: { user: AccountSummary | null }) => !cancelled && setAccount(body.user))
      .catch(() => !cancelled && setAccount(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const openAuth = React.useCallback<OpenAuth>((mode = "signup", options) => {
    setState({
      open: true,
      mode,
      // Come back to the page the visitor is on unless a destination was given.
      returnTo: options?.returnTo ?? window.location.pathname + window.location.search,
      returnLabel: options?.returnLabel,
    });
  }, []);

  const signOut = React.useCallback(() => {
    startSignOut(async () => {
      const result = await logOut();
      // A full page load, so nothing rendered for the signed-in user survives.
      window.location.assign(result.redirectTo ?? "/");
    });
  }, []);

  const value = React.useMemo(
    () => ({ openAuth, account, signOut, signingOut }),
    [openAuth, account, signOut, signingOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthDialog
        open={state.open}
        mode={state.mode}
        returnTo={state.returnTo}
        returnLabel={state.returnLabel}
        onModeChange={(mode) => setState((s) => ({ ...s, mode }))}
        onOpenChange={(open) => setState((s) => ({ ...s, open }))}
      />
    </AuthContext.Provider>
  );
}

/** A button that opens the account dialog. Renders whatever classes it is given. */
export function AuthButton({
  mode,
  returnTo,
  returnLabel,
  children,
  ...props
}: React.ComponentProps<"button"> & { mode: AuthMode; returnTo?: string; returnLabel?: string }) {
  const openAuth = useAuthDialog();
  return (
    <button type="button" {...props} onClick={() => openAuth(mode, { returnTo, returnLabel })}>
      {children}
    </button>
  );
}
