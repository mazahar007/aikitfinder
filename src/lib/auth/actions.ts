"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { authStatus, PASSWORD_MIN_LENGTH, RECOVERY_COOKIE } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";
import { safeReturnPath } from "@/lib/auth/return-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  /** Shown as an error above the form. */
  error?: string;
  /** Shown as a success message, e.g. "check your email". */
  notice?: string;
  /** The email that was submitted, so the field keeps it after an error. Never the password. */
  email?: string;
  /** Set when the visitor is now signed in (or out); the page reloads there. */
  redirectTo?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function read(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirmPassword") ?? ""),
    returnTo: safeReturnPath(String(formData.get("returnTo") ?? "")),
  };
}

/** Messages a visitor can act on. Provider wording and internals are never passed through. */
function friendly(code: string | undefined, status: number | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "That email and password do not match an account.";
    case "email_not_confirmed":
      return "Confirm your email first. Use the link in the message we sent you.";
    case "user_already_exists":
    case "email_exists":
      return "An account with that email already exists. Log in instead.";
    case "same_password":
      return "Choose a password you have not used on this account before.";
    case "session_not_found":
    case "session_expired":
    case "otp_expired":
      return "This reset link has expired. Request a new one.";
    case "weak_password":
      return `Choose a stronger password of at least ${PASSWORD_MIN_LENGTH} characters.`;
    case "email_address_invalid":
    case "validation_failed":
      return "Enter a valid email address.";
    case "email_address_not_authorized":
    case "signup_disabled":
    case "email_provider_disabled":
      return "Sign-up is not open for this email address yet.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
  }
  if (status === 429) return "Too many attempts. Wait a few minutes and try again.";
  return "Something went wrong on our side. Try again in a moment.";
}

function validateEmail(email: string): string | null {
  if (!authStatus.enabled) return authStatus.reason;
  if (!EMAIL.test(email) || email.length > 254) return "Enter a valid email address.";
  return null;
}

/** Rules for a password being chosen (sign-up and reset). */
function validateNewPassword(password: string, confirm: string): string | null {
  if (!password) return "Enter a password.";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Use a password of at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > 72) return "Use a password of 72 characters or fewer.";
  if (password !== confirm) return "The two passwords do not match.";
  return null;
}

async function requestOrigin(): Promise<string> {
  return (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password, confirm, returnTo } = read(formData);
  const problem = validateEmail(email) ?? validateNewPassword(password, confirm);
  if (problem) return { error: problem, email };

  const origin = await requestOrigin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(returnTo)}` },
  });
  if (error) return { error: friendly(error.code, error.status), email };

  // With email confirmation on there is no session yet. For an address that is
  // already registered Supabase answers the same way and creates nothing, so
  // the same message is shown and this form cannot be used to find out who has
  // an account. One account per email is enforced by Supabase Auth; one
  // profile and one workspace per product are enforced by the database.
  if (!data.session)
    return {
      notice:
        "Check your email. If this address can be registered, we sent a link to confirm your account. The link is valid for one hour.",
    };
  return { redirectTo: returnTo };
}

export async function logIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password, returnTo } = read(formData);
  const problem = validateEmail(email) ?? (password ? null : "Enter your password.");
  if (problem) return { error: problem, email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.code, error.status), email };
  return { redirectTo: returnTo };
}

export async function logOut(): Promise<AuthFormState> {
  if (authStatus.enabled) {
    const supabase = await createSupabaseServerClient();
    // "local": ends this browser's session only.
    await supabase.auth.signOut({ scope: "local" });
  }
  return { redirectTo: "/" };
}

/** Step 1 of password recovery: send the reset link. */
export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email } = read(formData);
  const problem = validateEmail(email);
  if (problem) return { error: problem, email };

  const origin = await requestOrigin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?flow=recovery`,
  });
  // Rate limits are worth telling the visitor about. Everything else gets the
  // same answer, whether or not the address has an account.
  if (error && (error.status === 429 || error.code?.startsWith("over_")))
    return { error: friendly(error.code, error.status), email };
  return {
    notice:
      "If an account exists for that address, we sent a link to reset the password. The link is valid for one hour.",
  };
}

/**
 * Step 2 of password recovery: set the new password. Only works in a session
 * that was opened by a reset link within the last few minutes (the recovery
 * cookie), so an unattended signed-in browser cannot be used to change the
 * password.
 */
export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { password, confirm } = read(formData);
  if (!authStatus.enabled) return { error: authStatus.reason };

  const cookieStore = await cookies();
  const user = await getCurrentUser();
  if (!user || cookieStore.get(RECOVERY_COOKIE)?.value !== user.id)
    return { error: "This reset link has expired. Request a new one." };

  const problem = validateNewPassword(password, confirm);
  if (problem) return { error: problem };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error.code, error.status) };

  cookieStore.delete(RECOVERY_COOKIE);
  // Anyone signed in elsewhere with the old password is signed out.
  await supabase.auth.signOut({ scope: "others" });
  // Redirect from the server: closing the reset window re-renders this page,
  // so the form may be gone before it could navigate by itself.
  redirect("/account?notice=password-updated");
}
