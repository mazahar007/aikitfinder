"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin/access";
import type { AdminFormState } from "@/lib/admin/actions";
import { DENIED, explain } from "@/lib/admin/errors";
import type { Permission } from "@/lib/admin/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** First check, on the server. The database function checks the permission again. */
async function allowed(permission: Permission) {
  const context = await getAdminContext();
  return Boolean(context?.permissions.has(permission));
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const lines = (form: FormData, key: string) =>
  text(form, key)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 40);
const id = (value: string) => (UUID.test(value) ? value : null);

function refresh(toolId?: string) {
  revalidatePath("/admin/directory", "layout");
  if (toolId) revalidatePath(`/admin/directory/tools/${toolId}`);
}

export async function saveTool(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  if (!(await allowed("catalog.write"))) return { error: DENIED };
  const toolId = id(text(form, "id"));
  const payload = {
    name: text(form, "name"),
    slug: text(form, "slug").toLowerCase(),
    official_url: text(form, "official_url"),
    docs_url: text(form, "docs_url"),
    short_description: text(form, "short_description"),
    overview: text(form, "overview"),
    skill_level: text(form, "skill_level"),
    pricing_model: text(form, "pricing_model"),
    free_plan: text(form, "free_plan"),
    free_trial: text(form, "free_trial"),
    pricing_note: text(form, "pricing_note"),
    pricing_source_url: text(form, "pricing_source_url"),
    pricing_checked_at: text(form, "pricing_checked_at"),
    platforms: form.getAll("platforms").map(String),
    api_available: text(form, "api_available"),
    api_notes: text(form, "api_notes"),
    tags: lines(form, "tags"),
    use_cases: lines(form, "use_cases"),
    audience: lines(form, "audience"),
    features: lines(form, "features"),
    limitations: lines(form, "limitations"),
    quick_start: lines(form, "quick_start"),
  };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_save_tool", { p_id: toolId, p: payload });
  if (error) return { error: explain(error) };

  // Categories are part of the same form: primary first, then the others.
  const primary = id(text(form, "primary_category"));
  const others = form
    .getAll("categories")
    .map(String)
    .filter((c) => id(c) && c !== primary);
  const categories = primary ? [primary, ...others] : others;
  const cat = await supabase.rpc("admin_set_tool_categories", {
    p_tool: data,
    p_category_ids: categories,
  });
  if (cat.error)
    return { error: `The tool was saved, but its categories were not: ${explain(cat.error)}` };

  refresh(data as string);
  if (!toolId) redirect(`/admin/directory/tools/${data}?created=1`);
  return { notice: "Saved." };
}

export async function addToolSource(
  _prev: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("catalog.write"))) return { error: DENIED };
  const toolId = id(text(form, "tool"));
  if (!toolId) return { error: "Unknown tool." };
  const checked = text(form, "checked_at");
  if (checked && !DATE.test(checked)) return { error: "Enter the check date as a date." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_add_tool_source", {
    p_tool: toolId,
    p_title: text(form, "title"),
    p_url: text(form, "url"),
    p_checked_at: checked || null,
  });
  if (error) return { error: explain(error) };
  refresh(toolId);
  return { notice: "Source added." };
}

export async function removeToolSource(
  _prev: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("catalog.write"))) return { error: DENIED };
  const sourceId = id(text(form, "source"));
  if (!sourceId) return { error: "Unknown source." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_delete_tool_source", { p_source: sourceId });
  if (error) return { error: explain(error) };
  refresh(id(text(form, "tool")) ?? undefined);
  return { notice: "Source removed." };
}

export async function saveToolPricing(
  _prev: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("catalog.write"))) return { error: DENIED };
  const toolId = id(text(form, "tool"));
  if (!toolId) return { error: "Unknown tool." };
  const pricingUrl = text(form, "pricing_url");
  const plans: Record<string, unknown>[] = [];
  for (let i = 0; i < 12; i++) {
    const name = text(form, `plan.${i}.name`);
    if (!name) continue;
    const price = text(form, `plan.${i}.price`);
    if (price && !/^\d+(\.\d{1,4})?$/.test(price))
      return { error: `Plan "${name}": enter the price as a number.` };
    plans.push({
      name,
      price,
      currency: text(form, `plan.${i}.currency`),
      interval: text(form, `plan.${i}.interval`),
      price_note: text(form, `plan.${i}.price_note`),
      contact_sales: form.get(`plan.${i}.contact_sales`) === "on",
    });
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_save_tool_pricing", {
    p_tool: toolId,
    p_pricing: pricingUrl
      ? {
          pricing_url: pricingUrl,
          api_pricing_url: text(form, "api_pricing_url"),
          checked_at: text(form, "checked_at"),
          admin_notes: text(form, "admin_notes"),
        }
      : null,
    p_plans: plans,
  });
  if (error) return { error: explain(error) };
  refresh(toolId);
  return {
    notice: pricingUrl
      ? "Pricing saved. It shows publicly only after the tool is verified again."
      : "Pricing removed.",
  };
}

export async function setToolStatus(
  _prev: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("catalog.publish"))) return { error: DENIED };
  const toolId = id(text(form, "tool"));
  const status = text(form, "status");
  if (!toolId || !["draft", "in-review", "published", "needs-update", "archived"].includes(status))
    return { error: "Choose a status." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_tool_status", {
    p_tool: toolId,
    p_status: status,
    p_featured: status === "published" && form.get("featured") === "on",
  });
  if (error) return { error: explain(error) };
  refresh(toolId);
  return { notice: status === "published" ? "Published." : "Status updated." };
}

export async function setToolVerification(
  _prev: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("catalog.publish"))) return { error: DENIED };
  const toolId = id(text(form, "tool"));
  if (!toolId) return { error: "Unknown tool." };
  const verified = text(form, "verified") === "yes";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_tool_verification", {
    p_tool: toolId,
    p_verified: verified,
  });
  if (error) return { error: explain(error) };
  refresh(toolId);
  return { notice: verified ? "Marked verified as of today." : "Sent back for review." };
}

export async function saveCategory(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  if (!(await allowed("catalog.write"))) return { error: DENIED };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_save_category", {
    p_id: id(text(form, "id")),
    p_slug: text(form, "slug").toLowerCase(),
    p_name: text(form, "name"),
    p_description: text(form, "description"),
    p_icon: text(form, "icon"),
    p_parent_id: id(text(form, "parent_id")),
  });
  if (error) return { error: explain(error) };
  refresh();
  return { notice: "Category saved." };
}

export async function deleteCategory(
  _prev: AdminFormState,
  form: FormData,
): Promise<AdminFormState> {
  if (!(await allowed("catalog.write"))) return { error: DENIED };
  const categoryId = id(text(form, "id"));
  if (!categoryId) return { error: "Unknown category." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_delete_category", { p_id: categoryId });
  if (error) return { error: explain(error) };
  refresh();
  return { notice: "Category deleted." };
}
