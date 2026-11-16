import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import type { SessionUser } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";
import type { Permission, PlatformRole } from "@/lib/admin/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminContext = { user: SessionUser; role: PlatformRole; permissions: Set<Permission> };

/**
 * Who is asking, and what they may do in the admin panel.
 *
 * The role is read from the database on every request, as the signed-in user,
 * through functions that only return the caller's own role. It is never taken
 * from the session token or from anything the browser sends. Null for
 * visitors, ordinary users, and when the role tables do not exist yet.
 *
 * This decides what to show. Every admin action is checked again by the
 * database function that performs it.
 */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const [role, permissions] = await Promise.all([
    supabase.rpc("current_platform_role"),
    supabase.rpc("my_permissions"),
  ]);
  if (role.error || permissions.error || !role.data) return null;
  const set = new Set((permissions.data as string[] | null) ?? []) as Set<Permission>;
  if (!set.has("admin.access")) return null;
  return { user, role: role.data as PlatformRole, permissions: set };
});

/** For admin pages: anyone without the permission gets "not found", not "forbidden". */
export async function requireAdmin(permission: Permission = "admin.access"): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context || !context.permissions.has(permission)) notFound();
  return context;
}
