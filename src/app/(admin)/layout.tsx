import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { adminNav } from "@/components/admin/nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { LogoMark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/access";
import { roleLabel } from "@/lib/admin/permissions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | AIKitFinder Admin" },
  // Staff only; nothing here is for search engines.
  robots: { index: false, follow: false },
};

/**
 * Central Admin Panel shell. Every admin route passes through this check: a
 * visitor, an ordinary user, or anyone whose role was removed gets the site's
 * "not found" page. The role comes from the database on each request. Pages
 * and actions check their own permission again; this is not the only gate.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin("admin.access");
  const items = adminNav.filter((item) => admin.permissions.has(item.permission));

  return (
    <div className="akf-admin flex min-h-dvh w-full min-w-0 flex-1 flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2"
            aria-label="Admin dashboard"
          >
            <LogoMark />
            <span className="hidden font-semibold text-heading sm:inline">AIKitFinder</span>
            <Badge variant="info">Admin</Badge>
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
            <span
              className="hidden max-w-64 truncate text-sm text-muted-foreground md:inline"
              title={admin.user.email}
            >
              {admin.user.email}
            </span>
            <Badge variant="neutral" className="hidden sm:inline-flex">
              {roleLabel[admin.role]}
            </Badge>
            <Link
              href="/"
              className="hidden h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-surface-subtle hover:text-foreground sm:inline-flex"
            >
              View site
            </Link>
            <ThemeToggle />
            <LogoutButton className={buttonVariants({ variant: "ghost", size: "sm" })} />
          </div>
        </div>
      </header>
      <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
        <nav
          aria-label="Admin sections"
          className="overflow-x-auto border-b bg-card px-3 py-2 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 lg:py-4"
        >
          <Suspense fallback={<AdminNavLinks items={items} pathname={null} />}>
            <AdminNav items={items} />
          </Suspense>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense
      fallback={
        <main id="main" className="flex-1">
          <p role="status" className="px-4 py-24 text-center text-muted-foreground">
            Checking access…
          </p>
        </main>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
