import type { Permission } from "@/lib/admin/permissions";

/** The admin panel's sections, in order. A section is listed only for staff who hold its permission. */
export const adminNav: { href: string; label: string; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", permission: "admin.access" },
  { href: "/admin/users", label: "Users", permission: "users.read" },
  { href: "/admin/roles", label: "Roles & Permissions", permission: "roles.read" },
  { href: "/admin/directory", label: "AI Directory", permission: "catalog.write" },
  { href: "/admin/autoflow", label: "AutoFlow Projects", permission: "projects.status.read" },
  { href: "/admin/providers", label: "AI Providers", permission: "integrations.read" },
  {
    href: "/admin/integrations",
    label: "Dependencies & Integrations",
    permission: "integrations.read",
  },
  { href: "/admin/jobs", label: "Background Jobs", permission: "jobs.read" },
  { href: "/admin/storage", label: "Storage", permission: "integrations.read" },
  { href: "/admin/youtube", label: "YouTube Publishing", permission: "integrations.read" },
  { href: "/admin/payments", label: "Payments & Billing", permission: "billing.read" },
  { href: "/admin/logs", label: "System Logs", permission: "integrations.read" },
  { href: "/admin/audit", label: "Audit Logs", permission: "audit.read" },
  { href: "/admin/settings", label: "General Settings", permission: "settings.write" },
];
