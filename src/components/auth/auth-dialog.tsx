"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, XIcon } from "lucide-react";

import type { AuthMode } from "@/components/auth/auth-provider";
import { siteConfig } from "@/config/site";
import { logIn, signUp, type AuthFormState } from "@/lib/auth/actions";
import { authStatus, PASSWORD_MIN_LENGTH } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const copy = {
  signup: { title: `Create your ${siteConfig.name} account`, submit: "Create account" },
  login: { title: `Log in to ${siteConfig.name}`, submit: "Log in" },
} as const;

/**
 * The shared Sign up / Log in dialog. Built on Radix Dialog: focus is trapped,
 * Escape closes it, and focus returns to the control that opened it. It takes
 * its colors from the current product's tokens, so the same dialog fits the
 * parent site, the Directory and AutoFlow. On phones it is a bottom sheet.
 *
 * The form posts to a Server Action; the password never touches client-side
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

  // One action state per mode, so an error from "Log in" is not shown under "Sign up".
  const [signupState, signupAction, signupPending] = React.useActionState<AuthFormState, FormData>(
    signUp,
    {},
  );
  const [loginState, loginAction, loginPending] = React.useActionState<AuthFormState, FormData>(
    logIn,
    {},
  );
  const state = mode === "signup" ? signupState : loginState;
  const pending = signupPending || loginPending;

  // Signed in: load the destination fresh so every header and page reflects it.
  const redirectTo = state.redirectTo;
  React.useEffect(() => {
    if (redirectTo) window.location.assign(redirectTo);
  }, [redirectTo]);
  const leaving = Boolean(redirectTo);

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
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-8",
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
            One account for the Directory and AutoFlow AI.
          </Dialog.Description>

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

          {disabled ? (
            <p
              role="status"
              className="mt-5 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-tint px-4 py-3 text-sm"
            >
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{authStatus.reason} Nothing you type here is sent or stored.</span>
            </p>
          ) : null}

          {state.error ? (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive-tint px-4 py-3 text-sm"
            >
              <CircleAlertIcon
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <span>{state.error}</span>
            </p>
          ) : null}
          {state.notice ? (
            <p
              role="status"
              className="mt-5 flex items-start gap-2 rounded-xl border border-success/40 bg-success-tint px-4 py-3 text-sm"
            >
              <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span>{state.notice}</span>
            </p>
          ) : null}

          <form
            key={mode}
            className="mt-5 space-y-4"
            action={disabled ? undefined : mode === "signup" ? signupAction : loginAction}
            onSubmit={disabled ? (event) => event.preventDefault() : undefined}
            aria-label={text.submit}
            aria-busy={pending || leaving}
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
                defaultValue={state.email}
                placeholder="you@example.com"
                disabled={disabled}
                className="h-13 w-full rounded-xl border border-input bg-background px-4 text-base placeholder:text-muted-foreground disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor={`${id}-password`} className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id={`${id}-password`}
                name="password"
                required
                minLength={mode === "signup" ? PASSWORD_MIN_LENGTH : undefined}
                maxLength={72}
                aria-describedby={mode === "signup" ? `${id}-pw-hint` : undefined}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                disabled={disabled}
                className="h-13 w-full rounded-xl border border-input bg-background px-4 text-base disabled:opacity-60"
              />
              {mode === "signup" ? (
                <p id={`${id}-pw-hint`} className="mt-2 text-sm text-muted-foreground">
                  At least {PASSWORD_MIN_LENGTH} characters.
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={disabled || pending || leaving}
              className="h-13 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {leaving
                ? "Signed in. One moment…"
                : pending
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Logging in…"
                  : text.submit}
            </button>
          </form>

          {returnLabel ? (
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
