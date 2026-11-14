"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { InfoIcon, XIcon } from "lucide-react";

import type { AuthMode } from "@/components/auth/auth-provider";
import { siteConfig } from "@/config/site";
import { authStatus } from "@/lib/auth/config";
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
 * Accounts are not connected in Phase 1 (see src/lib/auth/config.ts), so the
 * form is shown disabled with a plain explanation. Nothing typed is sent.
 */
export function AuthDialog({
  open,
  mode,
  returnLabel,
  onModeChange,
  onOpenChange,
}: {
  open: boolean;
  mode: AuthMode;
  returnLabel?: string;
  onModeChange: (mode: AuthMode) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const id = React.useId();
  const disabled = !authStatus.enabled;
  const text = copy[mode];

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

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => event.preventDefault()}
            aria-label={text.submit}
          >
            <div>
              <label htmlFor={`${id}-email`} className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id={`${id}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
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
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                disabled={disabled}
                className="h-13 w-full rounded-xl border border-input bg-background px-4 text-base disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={disabled}
              className="h-13 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {text.submit}
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
