"use client";

import * as React from "react";
import { LoaderCircleIcon } from "lucide-react";

import { AuthButton } from "@/components/auth/auth-provider";
import { FormMessage, PasswordField } from "@/components/auth/password-field";
import { updatePassword, type AuthFormState } from "@/lib/auth/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/config";

/** Step 2 of password recovery: choose the new password. */
export function ResetPasswordForm() {
  const id = React.useId();
  const [state, action, pending] = React.useActionState<AuthFormState, FormData>(
    updatePassword,
    {},
  );
  return (
    <form action={action} className="mt-8 max-w-md space-y-4" aria-busy={pending}>
      <FormMessage error={state.error} />
      <PasswordField
        id={`${id}-password`}
        name="password"
        label="New password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
      />
      <PasswordField
        id={`${id}-confirm`}
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircleIcon className="size-5 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

/** Opens the shared dialog on its "forgot password" form. */
export function RequestResetLinkButton({ className }: { className?: string }) {
  return (
    <AuthButton mode="forgot" className={className}>
      Request a new link
    </AuthButton>
  );
}
