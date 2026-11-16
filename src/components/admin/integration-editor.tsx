"use client";

import * as React from "react";

import { keepValues } from "@/components/admin/use-keep-values";

import { FormMessage } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import {
  clearIntegrationSecret,
  saveIntegration,
  setIntegrationSecret,
  testIntegration,
  type AdminFormState,
} from "@/lib/admin/actions";
import type { IntegrationRecord } from "@/lib/admin/data";
import type { IntegrationDefinition } from "@/lib/integrations/registry";

const input =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60";
const label = "mb-1.5 block text-sm font-medium text-foreground";

function Message({ state }: { state: AdminFormState }) {
  return state.error || state.notice ? (
    <div className="mb-4">
      <FormMessage error={state.error} notice={state.notice} />
    </div>
  ) : null;
}

/** Non-secret settings, provider, enable switch and demo/real mode. */
export function IntegrationConfigForm({
  definition,
  record,
  canEdit,
}: {
  definition: IntegrationDefinition;
  record: IntegrationRecord;
  canEdit: boolean;
}) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(
    saveIntegration,
    {},
  );
  const id = React.useId();
  return (
    <form onSubmit={keepValues(action)} className="p-4" aria-busy={pending}>
      <Message state={state} />
      <input type="hidden" name="key" value={record.key} />
      <fieldset disabled={!canEdit || pending} className="grid gap-4 sm:grid-cols-2">
        {definition.providers ? (
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-provider`} className={label}>
              Provider
            </label>
            <select
              id={`${id}-provider`}
              name="provider"
              defaultValue={record.provider ?? ""}
              className={input}
            >
              {definition.providers.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {definition.fields.map((field) => {
          const value = record.config[field.key];
          const fieldId = `${id}-${field.key}`;
          const name = `config.${field.key}`;
          return (
            <div key={field.key} className={field.type === "url" ? "sm:col-span-2" : undefined}>
              {field.type === "boolean" ? (
                <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={value === true}
                    className="size-5"
                  />
                  {field.label}
                </label>
              ) : (
                <>
                  <label htmlFor={fieldId} className={label}>
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={fieldId}
                      name={name}
                      defaultValue={String(value ?? "")}
                      className={input}
                    >
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={fieldId}
                      name={name}
                      type={field.type === "number" ? "number" : "text"}
                      inputMode={field.type === "url" ? "url" : undefined}
                      step={field.type === "number" ? "any" : undefined}
                      min={field.min}
                      max={field.max}
                      maxLength={300}
                      defaultValue={value === undefined || value === null ? "" : String(value)}
                      autoComplete="off"
                      spellCheck={false}
                      className={input}
                    />
                  )}
                </>
              )}
              {field.help ? (
                <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
              ) : null}
            </div>
          );
        })}

        <div className="sm:col-span-2">
          <p className={label}>Mode</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <input
                type="radio"
                name="mode"
                value="demo"
                defaultChecked={record.is_demo}
                className="mt-0.5 size-5"
              />
              <span>
                <span className="font-medium text-foreground">Demo</span>
                <span className="block text-muted-foreground">
                  Placeholder values. Nothing is contacted.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <input
                type="radio"
                name="mode"
                value="real"
                defaultChecked={!record.is_demo}
                className="mt-0.5 size-5"
              />
              <span>
                <span className="font-medium text-foreground">Real configuration</span>
                <span className="block text-muted-foreground">
                  Marks these as real settings. Status becomes Configured, not Connected.
                </span>
              </span>
            </label>
          </div>
        </div>

        <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-foreground sm:col-span-2">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={record.enabled}
            className="size-5"
          />
          Enabled
        </label>
      </fieldset>
      {canEdit ? (
        <Button type="submit" className="mt-4" disabled={pending}>
          {pending ? "Saving…" : "Save configuration"}
        </Button>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Your role can view this configuration but not change it.
        </p>
      )}
    </form>
  );
}

/** One credential: write-only. Shows whether one is set and its last characters, never the value. */
export function IntegrationSecretForm({
  integrationKey,
  field,
  fieldLabel,
  current,
  canEdit,
  storageReady,
}: {
  integrationKey: string;
  field: string;
  fieldLabel: string;
  current?: { hint: string; updated_at: string };
  canEdit: boolean;
  storageReady: boolean;
}) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(
    setIntegrationSecret,
    {},
  );
  const [clearState, clearAction, clearing] = React.useActionState<AdminFormState, FormData>(
    clearIntegrationSecret,
    {},
  );
  const id = React.useId();
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    // Never leave a credential sitting in the field after it has been handled.
    if (state.notice || state.error) formRef.current?.reset();
  }, [state]);

  return (
    <div className="border-b p-4 last:border-b-0">
      <Message state={state.error || state.notice ? state : clearState} />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={`${id}-value`} className="text-sm font-medium text-foreground">
          {fieldLabel}
        </label>
        <p
          className="font-mono text-xs text-muted-foreground"
          data-secret-state={current ? "set" : "empty"}
        >
          {current ? `Set · ••••••••${current.hint}` : "Not set"}
        </p>
      </div>
      {canEdit ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <form ref={formRef} action={action} className="flex min-w-0 flex-1 gap-2">
            <input type="hidden" name="key" value={integrationKey} />
            <input type="hidden" name="field" value={field} />
            <input
              id={`${id}-value`}
              name="value"
              type="password"
              autoComplete="off"
              placeholder={current ? "Enter a new value to replace it" : "Enter the credential"}
              disabled={!storageReady || pending}
              className={input}
            />
            <Button type="submit" variant="secondary" disabled={!storageReady || pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </form>
          {current ? (
            <form action={clearAction}>
              <input type="hidden" name="key" value={integrationKey} />
              <input type="hidden" name="field" value={field} />
              <Button type="submit" variant="ghost" disabled={clearing}>
                {clearing ? "Removing…" : "Remove"}
              </Button>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Only a Super Admin can set or replace credentials.
        </p>
      )}
    </div>
  );
}

export function TestConnectionButton({
  integrationKey,
  canEdit,
}: {
  integrationKey: string;
  canEdit: boolean;
}) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(
    testIntegration,
    {},
  );
  return (
    <form action={action} className="p-4">
      <input type="hidden" name="key" value={integrationKey} />
      <Button type="submit" variant="secondary" disabled={!canEdit || pending}>
        {pending ? "Checking…" : "Test connection"}
      </Button>
      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.notice ? (
        // Deliberately neutral: this is never a success message unless a real request succeeded.
        <p
          role="status"
          className="mt-3 rounded-md border border-warning/40 bg-warning-tint px-3 py-2 text-sm text-foreground"
        >
          {state.notice}
        </p>
      ) : null}
    </form>
  );
}
