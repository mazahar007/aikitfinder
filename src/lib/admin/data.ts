import "server-only";

import type { PlatformRole } from "@/lib/admin/permissions";
import type { IntegrationStatus } from "@/lib/integrations/registry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Reads for the admin panel. Every call runs as the signed-in user through a
 * database function that checks that user's permission; a caller without it
 * gets an error, which these helpers turn into an empty result for the page
 * to explain. No function here can read another user's private content.
 */

export type Overview = {
  users_total: number;
  users_active_30d: number;
  users_new_7d: number;
  staff: number;
  tools_total: number;
  tools_published: number;
  categories: number;
  projects_total: number;
  integrations_total: number;
  integrations_connected: number;
  integrations_configured: number;
  integrations_demo: number;
  integrations_not_configured: number;
  integrations_error: number;
  generated_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  role: PlatformRole | null;
  display_name: string | null;
};

export type StaffMember = {
  user_id: string;
  email: string;
  role: PlatformRole;
  granted_at: string;
  granted_by_email: string | null;
};

export type AuditEntry = {
  id: number;
  created_at: string;
  actor_email: string | null;
  actor_role: PlatformRole | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  summary: Record<string, unknown>;
};

export type IntegrationRecord = {
  key: string;
  name: string;
  category: string;
  kind: string;
  depends_on: string | null;
  provider: string | null;
  enabled: boolean;
  status: IntegrationStatus;
  is_demo: boolean;
  config: Record<string, unknown>;
  last_test_at: string | null;
  last_test_ok: boolean | null;
  last_test_message: string | null;
  updated_at: string;
  secrets: { field: string; hint: string; updated_at: string }[];
};

export type IntegrationLog = {
  id: number;
  created_at: string;
  integration_key: string;
  event: string;
  level: "info" | "warning" | "error";
  message: string;
  actor_email: string | null;
};

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(fn, args);
  return error ? null : (data as T);
}

export const getOverview = () => call<Overview>("admin_overview");
export const listUsers = async (search?: string) =>
  (await call<AdminUser[]>("admin_list_users", {
    p_search: search ?? null,
    p_limit: 100,
    p_offset: 0,
  })) ?? [];
export const listStaff = async () => (await call<StaffMember[]>("admin_list_staff")) ?? [];
export const getRoleMatrix = async () =>
  (await call<{ role: PlatformRole; permission: string }[]>("admin_role_matrix")) ?? [];
export const listAudit = async () =>
  (await call<AuditEntry[]>("admin_list_audit", { p_limit: 200, p_before: null })) ?? [];
export const listIntegrations = async () =>
  (await call<IntegrationRecord[]>("admin_list_integrations")) ?? [];
export const listIntegrationLogs = async (key?: string) =>
  (await call<IntegrationLog[]>("admin_list_integration_logs", {
    p_key: key ?? null,
    p_limit: 50,
  })) ?? [];

/** Status only, for the AutoFlow pipeline. Null when it cannot be read (signed out, or tables not created yet). */
export async function getIntegrationStatuses(): Promise<Map<string, IntegrationStatus> | null> {
  const rows = await call<{ key: string; status: IntegrationStatus }[]>("integration_statuses");
  return rows && rows.length ? new Map(rows.map((r) => [r.key, r.status])) : null;
}
