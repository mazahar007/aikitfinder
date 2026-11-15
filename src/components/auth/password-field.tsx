"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

/** A password input with a show/hide control. Styled with the current product's tokens. */
export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  hint,
  minLength,
  disabled,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: "new-password" | "current-password";
  hint?: string;
  minLength?: number;
  disabled?: boolean;
}) {
  const [shown, setShown] = React.useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          required
          minLength={minLength}
          maxLength={72}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={hint ? `${id}-hint` : undefined}
          disabled={disabled}
          className="h-13 w-full rounded-xl border border-input bg-background pr-13 pl-4 text-base disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          disabled={disabled}
          className="absolute top-1 right-1 inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-60"
        >
          {shown ? (
            <EyeOffIcon className="size-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Error or success message for an account form. */
export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  if (error)
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/40 bg-destructive-tint px-4 py-3 text-sm text-foreground"
      >
        {error}
      </p>
    );
  if (notice)
    return (
      <p
        role="status"
        className="rounded-xl border border-success/40 bg-success-tint px-4 py-3 text-sm text-foreground"
      >
        {notice}
      </p>
    );
  return null;
}
