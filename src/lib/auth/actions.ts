"use server";

import { headers } from "next/headers";

import { authStatus, PASSWORD_MIN_LENGTH } from "@/lib/auth/config";
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

function validate(email: string, password: string, signingUp: boolean): string | null {
  if (!authStatus.enabled) return authStatus.reason;
  if (!EMAIL.test(email) || email.length > 254) return "Enter a valid email address.";
  if (!password) return "Enter your password.";
  if (signingUp && password.length < PASSWORD_MIN_LENGTH)
    return `Use a password of at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > 72) return "Use a password of 72 characters or fewer.";
  return null;
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password, returnTo } = read(formData);
  const problem = validate(email, password, true);
  if (problem) return { error: problem, email };

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(returnTo)}` },
  });
  if (error) return { error: friendly(error.code, error.status), email };

  // With email confirmation on there is no session yet. The same message is
  // shown whether or not the address was already registered, so this form
  // cannot be used to find out who has an account.
  if (!data.session)
    return { notice: "Check your email. Open the link we sent to confirm your account." };
  return { redirectTo: returnTo };
}

export async function logIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password, returnTo } = read(formData);
  const problem = validate(email, password, false);
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
