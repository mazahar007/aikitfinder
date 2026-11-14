"use client";

import * as React from "react";

import { AuthDialog } from "@/components/auth/auth-dialog";

export type AuthMode = "signup" | "login";

type OpenAuth = (mode?: AuthMode, options?: { returnTo?: string; returnLabel?: string }) => void;

const AuthContext = React.createContext<OpenAuth>(() => {});

/** Opens the shared Sign up / Log in dialog from anywhere in the three products. */
export function useAuthDialog(): OpenAuth {
  return React.useContext(AuthContext);
}

/**
 * One account dialog for the whole site (owner decision F-07: no
 * product-specific login pages). Mounted once in the root layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    open: boolean;
    mode: AuthMode;
    returnTo?: string;
    returnLabel?: string;
  }>({ open: false, mode: "signup" });

  const openAuth = React.useCallback<OpenAuth>((mode = "signup", options) => {
    setState({ open: true, mode, returnTo: options?.returnTo, returnLabel: options?.returnLabel });
  }, []);

  return (
    <AuthContext.Provider value={openAuth}>
      {children}
      <AuthDialog
        open={state.open}
        mode={state.mode}
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
