"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { InfoIcon, LoaderCircleIcon, XIcon } from "lucide-react";

import type { AuthMode } from "@/components/auth/auth-provider";
import { FormMessage, PasswordField } from "@/components/auth/password-field";
import { siteConfig } from "@/config/site";
import { logIn, requestPasswordReset, signUp, type AuthFormState } from "@/lib/auth/actions";
import { authStatus, PASSWORD_MIN_LENGTH } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const copy = {
  signup: {
    title: `Create your ${siteConfig.name} account`,
    description: "One account for the Directory and AutoFlow AI.",
    submit: "Create account",
    pending: "Creating account…",
  },
  login: {
    title: `Log in to ${siteConfig.name}`,
    description: "One account for the Directory and AutoFlow AI.",
    submit: "Log in",
    pending: "Logging in…",
  },
  forgot: {
    title: "Reset your password",
    description: "Enter your account email and we will send you a link to choose a new password.",
    submit: "Send reset link",
    pending: "Sending…",
  },
} as const;

/**
 * The shared Sign up / Log in / Forgot password dialog. Built on Radix Dialog:
 * focus is trapped, Escape closes it, and focus returns to the control that
 * opened it. It takes its colors from the current product's tokens, so the
 * same dialog fits the parent site, the Directory and AutoFlow. On phones it
 * is a bottom sheet.
 *
 * Each form posts to a Server Action; passwords never touch client-side
 * state. If accounts are not configured (see src/lib/auth/config.ts) the form
 * is shown disabled with a plain explanation and nothing typed is sent.
 */
export function AuthDialog({
  open,
  mode,
  returnTo,
  returnLabel,
  onModeChange,
  onOpenChange,
}: {
  open: boolean;
  mode: AuthMode;
  returnTo?: string;
  returnLabel?: string;
  onModeChange: (mode: AuthMode) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const id = React.useId();
  const disabled = !authStatus.enabled;
  const text = copy[mode];

  // One action state per form, so a message from one is not shown under another.
  const [signupState, signupAction, signupPending] = React.useActionState<AuthFormState, FormData>(
    signUp,
    {},
  );
  const [loginState, loginAction, loginPending] = React.useActionState<AuthFormState, FormData>(
    logIn,
    {},
  );
  const [forgotState, forgotAction, forgotPending] = React.useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    {},
  );
  const state = { signup: signupState, login: loginState, forgot: forgotState }[mode];
  const action = { signup: signupAction, login: loginAction, forgot: forgotAction }[mode];
  const pending = signupPending || loginPending || forgotPending;

  // Signed in: load the destination fresh so every header and page reflects it.
  const redirectTo = state.redirectTo;
  React.useEffect(() => {
    if (redirectTo) window.location.assign(redirectTo);
  }, [redirectTo]);
  const leaving = Boolean(redirectTo);
  const busy = pending || leaving;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-md" />
        <Dialog.Content
          aria-describedby={`${id}-desc`}
          className={cn(
            "fixed z-50 w-full overflow-hidden border bg-card text-foreground shadow-2xl focus:outline-none",
            // phone: bottom sheet
            "inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl px-6 pt-4 pb-7",
            // larger screens: centered dialog
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[94dvh] sm:max-w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-8",
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-[#ff7cc6]"
          />
          <span
            aria-hidden="true"
            className="mx-auto mb-5 block h-1.5 w-11 rounded-full bg-border sm:hidden"
          />
          <Dialog.Close className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-xl border text-muted-foreground hover:text-foreground">
            <XIcon className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <Dialog.Title className="pr-12 font-display text-[1.75rem] leading-tight font-normal tracking-tight text-heading">
            {text.title}
          </Dialog.Title>
          <Dialog.Description id={`${id}-desc`} className="mt-2 text-muted-foreground">
            {text.description}
          </Dialog.Description>

          {mode === "forgot" ? null : (
            <div
              role="tablist"
              aria-label="Account"
              className="mt-6 grid grid-cols-2 rounded-2xl border bg-surface-subtle p-1"
            >
              {(["signup", "login"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => onModeChange(m)}
                  className={cn(
                    "h-11 rounded-xl text-[15px] font-semibold",
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "signup" ? "Sign up" : "Log in"}
                </button>
              ))}
            </div>
          )}

          {disabled ? (
            <p
              role="status"
              className="mt-5 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-tint px-4 py-3 text-sm"
            >
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{authStatus.reason} Nothing you type here is sent or stored.</span>
            </p>
          ) : null}

          <div className="mt-5 empty:hidden">
            <FormMessage error={state.error} notice={state.notice} />
          </div>

          <form
            key={mode}
            className="mt-5 space-y-4"
            action={disabled ? undefined : action}
            onSubmit={disabled ? (event) => event.preventDefault() : undefined}
            aria-label={text.submit}
            aria-busy={busy}
          >
            <input type="hidden" name="returnTo" value={returnTo ?? "/"} />
            <div>
              <label htmlFor={`${id}-email`} className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id={`${id}-email`}
                name="email"
                required
                maxLength={254}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                defaultValue={state.email}
                placeholder="you@example.com"
                disabled={disabled}
                className="h-13 w-full rounded-xl border border-input bg-background px-4 text-base placeholder:text-muted-foreground disabled:opacity-60"
              />
            </div>

            {mode === "forgot" ? null : (
              <PasswordField
                id={`${id}-password`}
                name="password"
                label="Password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? PASSWORD_MIN_LENGTH : undefined}
                hint={mode === "signup" ? `At least ${PASSWORD_MIN_LENGTH} characters.` : undefined}
                disabled={disabled}
              />
            )}
            {mode === "signup" ? (
              <PasswordField
                id={`${id}-confirm`}
                name="confirmPassword"
                label="Confirm password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                disabled={disabled}
              />
            ) : null}

            {mode === "login" ? (
              <div className="-mt-1 text-right">
                <button
                  type="button"
                  onClick={() => onModeChange("forgot")}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={disabled || busy}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircleIcon className="size-5 animate-spin" aria-hidden="true" />
              ) : null}
              {leaving ? "Signed in. One moment…" : pending ? text.pending : text.submit}
            </button>

            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => onModeChange("login")}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back to log in
              </button>
            ) : null}
          </form>

          {returnLabel && mode !== "forgot" ? (
            <p className="mt-4 text-sm text-muted-foreground">
              After you {mode === "signup" ? "sign up" : "log in"} you will continue to{" "}
              <span className="font-medium text-foreground">{returnLabel}</span>.
            </p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
