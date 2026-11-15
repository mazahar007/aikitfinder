import "server-only";

import { authStatus, type SessionUser } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Who may see the AutoFlow workspace.
 *
 * - "member": signed in. Sees their own workspace.
 * - "signed-out": accounts are open but the visitor is not signed in. The
 *   workspace is not rendered; they are asked to sign in.
 * - "preview": accounts are not configured on this machine or build. The
 *   layout is shown read-only with a labeled sample, because there is no user
 *   data that could be exposed and nothing can be created.
 */
export type WorkspaceAccess =
  { mode: "member"; user: SessionUser } | { mode: "signed-out" } | { mode: "preview" };

export async function getWorkspaceAccess(): Promise<WorkspaceAccess> {
  const user = await getCurrentUser();
  if (user) return { mode: "member", user };
  return authStatus.enabled ? { mode: "signed-out" } : { mode: "preview" };
}
