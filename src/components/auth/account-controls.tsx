"use client";

import Link from "next/link";

import { AuthButton, useAccount } from "@/components/auth/auth-provider";

/**
 * The account corner of a header. Signed out: Log in and Sign up. Signed in:
 * a link to the account page and Log out. Each product passes its own button
 * classes, so the control matches that product's header.
 */
export function AccountControls({
  loginClassName,
  signupClassName,
  accountClassName,
  logoutClassName,
  returnTo,
  returnLabel,
  showLogin = true,
  showLogout = true,
}: {
  loginClassName?: string;
  signupClassName?: string;
  /** Defaults to the sign-up style. */
  accountClassName?: string;
  /** Defaults to the log-in style. */
  logoutClassName?: string;
  returnTo?: string;
  returnLabel?: string;
  showLogin?: boolean;
  showLogout?: boolean;
}) {
  const { account, signOut, signingOut } = useAccount();

  if (account) {
    return (
      <>
        {showLogout ? (
          <button
            type="button"
            className={logoutClassName ?? loginClassName}
            onClick={signOut}
            disabled={signingOut}
          >
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        ) : null}
        <Link href="/account" className={accountClassName ?? signupClassName}>
          Account
        </Link>
      </>
    );
  }

  // While the session is being looked up the signed-out controls are shown, so
  // the header never jumps for the common case of a visitor without an account.
  return (
    <>
      {showLogin ? (
        <AuthButton
          mode="login"
          className={loginClassName}
          returnTo={returnTo}
          returnLabel={returnLabel}
        >
          Log in
        </AuthButton>
      ) : null}
      <AuthButton
        mode="signup"
        className={signupClassName}
        returnTo={returnTo}
        returnLabel={returnLabel}
      >
        Sign up
      </AuthButton>
    </>
  );
}
