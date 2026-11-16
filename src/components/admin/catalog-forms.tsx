"use client";

import * as React from "react";

import { keepValues } from "@/components/admin/use-keep-values";

import { FormMessage } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import type { AdminFormState } from "@/lib/admin/actions";
import {
  addToolSource,
  deleteCategory,
  removeToolSource,
  saveCategory,
  saveTool,
  saveToolPricing,
  setToolStatus,
  setToolVerification,
} from "@/lib/admin/catalog-actions";
import type { AdminCategory, AdminTool } from "@/lib/admin/catalog";
import { platformOptions } from "@/lib/admin/catalog-shared";

const input =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";
const area =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

function Message({ state }: { state: AdminFormState }) {
  return state.error || state.notice ? (
    <div className="mb-4">
      <FormMessage error={state.error} notice={state.notice} />
    </div>
  ) : null;
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  hint,
  max,
  wide,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  hint?: string;
  max?: number;
  wide?: boolean;
}) {
  const id = React.useId();
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        maxLength={max}
        defaultValue={defaultValue ?? ""}
        autoComplete="off"
        className={input}
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Lines({ label, name, value }: { label: string; name: string; value: string[] }) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea id={id} name={name} rows={4} defaultValue={value.join("\n")} className={area} />
      <p className="mt-1 text-xs text-muted-foreground">One per line.</p>
    </div>
  );
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Content, categories and links for one tool. Creates the tool when `tool` is null. */
export function ToolForm({
  tool,
  categories,
}: {
  tool: AdminTool | null;
  categories: AdminCategory[];
}) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(saveTool, {});
  const slugRef = React.useRef<HTMLInputElement>(null);
  const [slugTouched, setSlugTouched] = React.useState(Boolean(tool));
  const id = React.useId();
  const primary = tool?.category_ids[0] ?? "";
  const others = new Set(tool?.category_ids.slice(1) ?? []);

  return (
    <form onSubmit={keepValues(action)} className="space-y-6 p-4" aria-busy={pending}>
      <Message state={state} />
      {tool ? <input type="hidden" name="id" value={tool.id} /> : null}
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            Name<span className="text-destructive"> *</span>
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            maxLength={80}
            defaultValue={tool?.name ?? ""}
            onChange={(e) => {
              if (!slugTouched && slugRef.current) slugRef.current.value = slugify(e.target.value);
            }}
            className={input}
          />
        </div>
        <div>
          <label htmlFor={`${id}-slug`} className={labelClass}>
            Address name<span className="text-destructive"> *</span>
          </label>
          <input
            id={`${id}-slug`}
            ref={slugRef}
            name="slug"
            required
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={tool?.slug ?? ""}
            onChange={() => setSlugTouched(true)}
            className={`${input} font-mono`}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lowercase letters, digits and hyphens. Used in the page address.
          </p>
        </div>
        <Field
          label="Official website"
          name="official_url"
          type="url"
          required
          defaultValue={tool?.official_url}
          wide
        />
        <Field
          label="Documentation"
          name="docs_url"
          type="url"
          defaultValue={tool?.docs_url}
          wide
        />
        <Field
          label="Short description"
          name="short_description"
          required
          max={200}
          defaultValue={tool?.short_description}
          hint="One sentence, up to 200 characters. Shown on cards and in search results."
          wide
        />
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-overview`} className={labelClass}>
            Overview
          </label>
          <textarea
            id={`${id}-overview`}
            name="overview"
            rows={5}
            maxLength={4000}
            defaultValue={tool?.overview ?? ""}
            className={area}
          />
        </div>
        <div>
          <label htmlFor={`${id}-level`} className={labelClass}>
            Skill level
          </label>
          <select
            id={`${id}-level`}
            name="skill_level"
            defaultValue={tool?.skill_level ?? "beginner"}
            className={input}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-api`} className={labelClass}>
            API available
          </label>
          <select
            id={`${id}-api`}
            name="api_available"
            defaultValue={
              tool?.api_available === true ? "yes" : tool?.api_available === false ? "no" : ""
            }
            className={input}
          >
            <option value="">Not checked</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <Field label="API notes" name="api_notes" defaultValue={tool?.api_notes} wide />
        <fieldset className="sm:col-span-2">
          <legend className={labelClass}>Platforms</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {platformOptions.map(([value, label]) => (
              <label key={value} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="platforms"
                  value={value}
                  defaultChecked={tool?.platforms?.includes(value)}
                  className="size-5"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <fieldset disabled={pending} className="grid gap-4 border-t pt-6 sm:grid-cols-2">
        <legend className="sr-only">Categories</legend>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-primary`} className={labelClass}>
            Primary category
          </label>
          <select
            id={`${id}-primary`}
            name="primary_category"
            defaultValue={primary}
            className={input}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_name ? `${c.parent_name} › ${c.name}` : c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              There are no categories yet. Create them under Categories.
            </p>
          ) : null}
        </div>
        {categories.length ? (
          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Also listed in</legend>
            <div className="grid gap-x-5 sm:grid-cols-2">
              {categories.map((c) => (
                <label key={c.id} className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.id}
                    defaultChecked={others.has(c.id)}
                    className="size-5"
                  />
                  {c.parent_name ? `${c.parent_name} › ${c.name}` : c.name}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </fieldset>

      <fieldset disabled={pending} className="grid gap-4 border-t pt-6 sm:grid-cols-2">
        <legend className="sr-only">Pricing summary</legend>
        <div>
          <label htmlFor={`${id}-pm`} className={labelClass}>
            Pricing model
          </label>
          <select
            id={`${id}-pm`}
            name="pricing_model"
            defaultValue={tool?.pricing_model ?? ""}
            className={input}
          >
            <option value="">Not checked</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
            <option value="open-source">Open source</option>
          </select>
        </div>
        <Field
          label="Pricing checked on"
          name="pricing_checked_at"
          type="date"
          defaultValue={tool?.pricing_checked_at}
        />
        <Field label="Free plan" name="free_plan" defaultValue={tool?.free_plan} />
        <Field label="Free trial" name="free_trial" defaultValue={tool?.free_trial} />
        <Field
          label="Pricing source"
          name="pricing_source_url"
          type="url"
          defaultValue={tool?.pricing_source_url}
          wide
        />
        <Field label="Pricing note" name="pricing_note" defaultValue={tool?.pricing_note} wide />
      </fieldset>

      <fieldset disabled={pending} className="grid gap-4 border-t pt-6 sm:grid-cols-2">
        <legend className="sr-only">Details</legend>
        <Lines label="Features" name="features" value={tool?.features ?? []} />
        <Lines label="Limitations" name="limitations" value={tool?.limitations ?? []} />
        <Lines label="Use cases" name="use_cases" value={tool?.use_cases ?? []} />
        <Lines label="Who it is for" name="audience" value={tool?.audience ?? []} />
        <Lines label="Quick start steps" name="quick_start" value={tool?.quick_start ?? []} />
        <Lines label="Tags" name="tags" value={tool?.tags ?? []} />
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : tool ? "Save changes" : "Create draft"}
      </Button>
    </form>
  );
}

export function SourceList({ tool }: { tool: AdminTool }) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(
    addToolSource,
    {},
  );
  const [removeState, removeAction, removing] = React.useActionState<AdminFormState, FormData>(
    removeToolSource,
    {},
  );
  const formRef = React.useRef<HTMLFormElement>(null);
  const id = React.useId();
  React.useEffect(() => {
    if (state.notice) formRef.current?.reset();
  }, [state]);
  return (
    <div className="p-4">
      <Message state={state.error || state.notice ? state : removeState} />
      {tool.sources.length ? (
        <ul className="mb-4 divide-y rounded-md border">
          {tool.sources.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="font-medium text-foreground">{s.title}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-primary hover:underline"
                >
                  {s.url}
                </a>
              </span>
              <span className="text-muted-foreground">
                {s.checked_at ? `Checked ${s.checked_at}` : "No check date"}
              </span>
              <form action={removeAction}>
                <input type="hidden" name="source" value={s.id} />
                <input type="hidden" name="tool" value={tool.id} />
                <Button type="submit" variant="ghost" size="sm" disabled={removing}>
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          No sources yet. A tool needs at least one official source to be published.
        </p>
      )}
      <form
        ref={formRef}
        onSubmit={keepValues(action)}
        className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end"
        aria-busy={pending}
      >
        <input type="hidden" name="tool" value={tool.id} />
        <div>
          <label htmlFor={`${id}-t`} className={labelClass}>
            Title
          </label>
          <input
            id={`${id}-t`}
            name="title"
            required
            maxLength={120}
            placeholder="Official site"
            className={input}
          />
        </div>
        <div>
          <label htmlFor={`${id}-u`} className={labelClass}>
            Address
          </label>
          <input id={`${id}-u`} name="url" type="url" required className={input} />
        </div>
        <div>
          <label htmlFor={`${id}-d`} className={labelClass}>
            Checked on
          </label>
          <input id={`${id}-d`} name="checked_at" type="date" className={input} />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Adding…" : "Add source"}
        </Button>
      </form>
    </div>
  );
}

const intervals = [
  ["", "—"],
  ["month", "Per month"],
  ["year", "Per year"],
  ["one-time", "One time"],
  ["usage", "Usage-based"],
] as const;

export function PricingForm({ tool }: { tool: AdminTool }) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(
    saveToolPricing,
    {},
  );
  const id = React.useId();
  const rows = [
    ...tool.plans,
    ...Array.from({ length: Math.max(2, 4 - tool.plans.length) }, () => null),
  ];
  return (
    <form onSubmit={keepValues(action)} className="space-y-4 p-4" aria-busy={pending}>
      <Message state={state} />
      <input type="hidden" name="tool" value={tool.id} />
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Official pricing page"
          name="pricing_url"
          type="url"
          defaultValue={tool.pricing?.pricing_url}
          hint="Leave empty to remove the pricing record."
          wide
        />
        <Field
          label="API pricing page"
          name="api_pricing_url"
          type="url"
          defaultValue={tool.pricing?.api_pricing_url}
          wide
        />
        <Field
          label="Checked on"
          name="checked_at"
          type="date"
          defaultValue={tool.pricing?.checked_at}
        />
        <Field
          label="Internal note"
          name="admin_notes"
          defaultValue={tool.pricing?.admin_notes}
          hint="Not shown publicly."
        />
      </fieldset>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Plans</caption>
          <thead>
            <tr>
              {["Plan", "Price", "Currency", "Billing", "Note", "Contact sales"].map((h) => (
                <th key={h} className="px-1 py-2 font-semibold text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i}>
                <td className="px-1 py-1">
                  <input
                    aria-label={`Plan ${i + 1} name`}
                    name={`plan.${i}.name`}
                    defaultValue={p?.name ?? ""}
                    className={input}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    aria-label={`Plan ${i + 1} price`}
                    name={`plan.${i}.price`}
                    inputMode="decimal"
                    defaultValue={p?.price ?? ""}
                    className={input}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    aria-label={`Plan ${i + 1} currency`}
                    name={`plan.${i}.currency`}
                    maxLength={3}
                    defaultValue={p?.currency ?? ""}
                    className={`${input} uppercase`}
                  />
                </td>
                <td className="px-1 py-1">
                  <select
                    aria-label={`Plan ${i + 1} billing`}
                    name={`plan.${i}.interval`}
                    defaultValue={p?.interval ?? ""}
                    className={input}
                  >
                    {intervals.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <input
                    aria-label={`Plan ${i + 1} note`}
                    name={`plan.${i}.price_note`}
                    defaultValue={p?.price_note ?? ""}
                    className={input}
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <input
                    aria-label={`Plan ${i + 1} contact sales`}
                    type="checkbox"
                    name={`plan.${i}.contact_sales`}
                    defaultChecked={p?.contact_sales}
                    className="size-5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        A price of 0 is a free plan. Leave the price empty if the provider does not state one. Saved
        pricing shows publicly only once the tool is verified.
      </p>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Save pricing"}
      </Button>
      <span className="sr-only" id={id} />
    </form>
  );
}

export function PublishPanel({ tool, canPublish }: { tool: AdminTool; canPublish: boolean }) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(
    setToolStatus,
    {},
  );
  const [vState, vAction, verifying] = React.useActionState<AdminFormState, FormData>(
    setToolVerification,
    {},
  );
  const id = React.useId();
  if (!canPublish)
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Your role can edit this tool but not publish or verify it.
      </p>
    );
  return (
    <div className="space-y-5 p-4">
      <Message state={state.error || state.notice ? state : vState} />
      <form
        onSubmit={keepValues(action)}
        className="flex flex-wrap items-end gap-3"
        aria-busy={pending}
      >
        <input type="hidden" name="tool" value={tool.id} />
        <div>
          <label htmlFor={`${id}-s`} className={labelClass}>
            Status
          </label>
          <select id={`${id}-s`} name="status" defaultValue={tool.status} className={input}>
            <option value="draft">Draft</option>
            <option value="in-review">In review</option>
            <option value="published">Published</option>
            <option value="needs-update">Needs update</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={tool.featured}
            className="size-5"
          />
          Featured
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Update status"}
        </Button>
      </form>
      <form
        onSubmit={keepValues(vAction)}
        className="flex flex-wrap items-center gap-3 border-t pt-4"
        aria-busy={verifying}
      >
        <input type="hidden" name="tool" value={tool.id} />
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          {tool.verification === "verified"
            ? `Verified on ${tool.last_verified_at}. Re-verify after checking the sources again.`
            : "Mark verified only after checking the official sources yourself. The date recorded is today."}
        </p>
        <Button type="submit" name="verified" value="yes" variant="secondary" disabled={verifying}>
          {tool.verification === "verified" ? "Re-verify today" : "Mark verified"}
        </Button>
        {tool.verification === "verified" ? (
          <Button type="submit" name="verified" value="no" variant="ghost" disabled={verifying}>
            Send back to review
          </Button>
        ) : null}
      </form>
    </div>
  );
}

export function CategoryForm({
  category,
  parents,
}: {
  category?: AdminCategory;
  parents: AdminCategory[];
}) {
  const [state, action, pending] = React.useActionState<AdminFormState, FormData>(saveCategory, {});
  const [dState, dAction, deleting] = React.useActionState<AdminFormState, FormData>(
    deleteCategory,
    {},
  );
  const formRef = React.useRef<HTMLFormElement>(null);
  const id = React.useId();
  React.useEffect(() => {
    if (state.notice && !category) formRef.current?.reset();
  }, [state, category]);
  return (
    <div className="p-4">
      <Message state={state.error || state.notice ? state : dState} />
      <form
        ref={formRef}
        onSubmit={keepValues(action)}
        className="grid gap-3 sm:grid-cols-2"
        aria-busy={pending}
      >
        {category ? <input type="hidden" name="id" value={category.id} /> : null}
        <Field label="Name" name="name" required max={80} defaultValue={category?.name} />
        <div>
          <label htmlFor={`${id}-slug`} className={labelClass}>
            Address name<span className="text-destructive"> *</span>
          </label>
          <input
            id={`${id}-slug`}
            name="slug"
            required
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={category?.slug ?? ""}
            className={`${input} font-mono`}
          />
        </div>
        <Field
          label="Description"
          name="description"
          max={600}
          defaultValue={category?.description}
          wide
        />
        <div>
          <label htmlFor={`${id}-parent`} className={labelClass}>
            Parent category
          </label>
          <select
            id={`${id}-parent`}
            name="parent_id"
            defaultValue={category?.parent_id ?? ""}
            className={input}
          >
            <option value="">None (top level)</option>
            {parents
              .filter((p) => !p.parent_id && p.id !== category?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
        <Field
          label="Icon name"
          name="icon"
          defaultValue={category?.icon}
          hint="A Lucide icon name, for example pen or video."
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : category ? "Save category" : "Add category"}
          </Button>
        </div>
      </form>
      {category ? (
        <form
          action={dAction}
          className="mt-2"
          onSubmit={(e) => {
            if (!window.confirm(`Delete the category "${category.name}"?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={category.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={deleting || category.tool_count > 0 || category.child_count > 0}
          >
            Delete category
          </Button>
          {category.tool_count > 0 || category.child_count > 0 ? (
            <span className="ml-2 text-xs text-muted-foreground">
              Only empty categories can be deleted.
            </span>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
