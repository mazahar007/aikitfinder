/** Staff roles and permission keys. The database (migration 0009) is the authority; this mirrors it for the interface. */
export type PlatformRole = "super_admin" | "admin" | "editor" | "support" | "finance";

export const roleLabel: Record<PlatformRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  support: "Support",
  finance: "Finance",
};

export const roleSummary: Record<PlatformRole, string> = {
  super_admin: "Full platform control, including roles and provider credentials.",
  admin: "Platform management. Cannot grant roles or set credentials.",
  editor: "Directory and content management.",
  support: "User lookup and project status. No private content.",
  finance: "Billing, payments, credits and usage.",
};

export const assignableRoles: PlatformRole[] = [
  "super_admin",
  "admin",
  "editor",
  "support",
  "finance",
];

export type Permission =
  | "admin.access"
  | "users.read"
  | "users.suspend"
  | "roles.read"
  | "roles.grant"
  | "catalog.write"
  | "content.write"
  | "projects.status.read"
  | "jobs.read"
  | "integrations.read"
  | "integrations.configure"
  | "integrations.secrets.write"
  | "billing.read"
  | "billing.manage"
  | "settings.write"
  | "audit.read";
