import "server-only";

import type { ContentStatus, Verification } from "@/lib/admin/catalog-shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export { platformOptions, statusLabel, verificationLabel } from "@/lib/admin/catalog-shared";
export type { ContentStatus, Verification };

/**
 * Directory content for the admin panel, read through permission-checked
 * database functions (migration 0011). Staff see drafts and archived tools;
 * the public site still sees only published ones.
 */

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  parent_id: string | null;
  parent_name: string | null;
  tool_count: number;
  child_count: number;
  updated_at: string;
};

export type AdminToolRow = {
  id: string;
  slug: string;
  name: string;
  status: ContentStatus;
  verification: Verification;
  last_verified_at: string | null;
  featured: boolean;
  is_sample: boolean;
  category: string | null;
  source_count: number;
  updated_at: string;
};

export type AdminTool = {
  id: string;
  slug: string;
  name: string;
  official_url: string;
  docs_url: string | null;
  short_description: string;
  overview: string;
  skill_level: "beginner" | "intermediate" | "advanced";
  pricing_model: "free" | "freemium" | "paid" | "open-source" | null;
  free_plan: string | null;
  free_trial: string | null;
  pricing_note: string | null;
  pricing_source_url: string | null;
  pricing_checked_at: string | null;
  platforms: string[] | null;
  api_available: boolean | null;
  api_notes: string | null;
  tags: string[];
  use_cases: string[];
  audience: string[];
  features: string[];
  limitations: string[];
  quick_start: string[];
  verification: Verification;
  status: ContentStatus;
  featured: boolean;
  last_verified_at: string | null;
  is_sample: boolean;
  updated_at: string;
  category_ids: string[];
  sources: { id: string; title: string; url: string; checked_at: string | null }[];
  pricing: {
    pricing_url: string;
    api_pricing_url: string | null;
    checked_at: string;
    verification: Verification;
    admin_notes: string | null;
  } | null;
  plans: {
    name: string;
    price: number | null;
    currency: string | null;
    interval: "month" | "year" | "one-time" | "usage" | null;
    price_note: string | null;
    usage_limits: string | null;
    contact_sales: boolean;
  }[];
};

/** Null when the call failed, for example before migration 0011 is applied. */
async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(fn, args);
  return error ? null : (data as T);
}

export const listCategories = () => call<AdminCategory[]>("admin_list_categories");
export const listTools = (search?: string, status?: string) =>
  call<AdminToolRow[]>("admin_list_tools", { p_search: search || null, p_status: status || null });
export const getTool = (id: string) => call<AdminTool | null>("admin_get_tool", { p_id: id });
