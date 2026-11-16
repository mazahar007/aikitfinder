"use client";

import * as React from "react";

import { FormMessage } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { grantRole, revokeRole, type AdminFormState } from "@/lib/admin/actions";
import { assignableRoles, roleLabel } from "@/lib/admin/permissions";

const input = "h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground";

/** Assign a staff role to an existing, confirmed account. Super Admin only; the database enforces it. */
export function GrantRoleForm({ candidates }: { candidates: { id: string; email: string }[] }) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(grantRole, {});
  const id = React.useId();
  return (
    <form action={action} className="p-4" aria-busy={pending}>
      {state.error || state.notice ? (
        <div className="mb-4">
          <FormMessage error={state.error} notice={state.notice} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${id}-user`} className="mb-1.5 block text-sm font-medium">
            Account
          </label>
          <select
            id={`${id}-user`}
            name="userId"
            required
            className={`${input} w-full`}
            defaultValue=""
          >
            <option value="" disabled>
              Choose an account
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-role`} className="mb-1.5 block text-sm font-medium">
            Role
          </label>
          <select id={`${id}-role`} name="role" required className={input} defaultValue="editor">
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {roleLabel[r]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending || candidates.length === 0}>
          {pending ? "Saving…" : "Assign role"}
        </Button>
      </div>
      {candidates.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          There are no other confirmed accounts to assign a role to.
        </p>
      ) : null}
    </form>
  );
}

export function RevokeRoleButton({ userId, email }: { userId: string; email: string }) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(revokeRole, {});
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Remove the staff role from ${email}?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? "Removing…" : "Remove role"}
      </Button>
      {state.error ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
