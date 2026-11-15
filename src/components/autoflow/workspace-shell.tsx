import { Suspense } from "react";
import Link from "next/link";

import { AutoflowLogo } from "@/components/autoflow/autoflow-logo";
import { WorkspaceNav, WorkspaceNavLinks } from "@/components/autoflow/workspace-nav";
import { PreviewNotice } from "@/components/autoflow/workspace-notice";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { products } from "@/config/products";

/**
 * AutoFlow workspace frame: top bar, section navigation (a sidebar on desktop,
 * a row under the top bar on smaller screens) and the page area.
 */
export function WorkspaceShell({
  preview,
  accountLabel,
  children,
}: {
  preview: boolean;
  /** Who is signed in; absent in preview mode. */
  accountLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <AutoflowLogo href="/autoflow/app" />
          <span className="hidden font-mono text-[11px] tracking-widest text-muted-foreground uppercase sm:inline">
            Workspace
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href={products.autoflow.home}
              className="hidden h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-surface-subtle hover:text-foreground sm:inline-flex"
            >
              About AutoFlow AI
            </Link>
            <Link
              href="/#products"
              className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-surface-subtle hover:text-foreground"
            >
              All products
            </Link>
            <ThemeToggle />
            {accountLabel ? (
              <>
                <Link
                  href="/account"
                  title={accountLabel}
                  className="ml-1 hidden h-11 max-w-56 items-center truncate rounded-md border px-3 text-sm text-foreground hover:bg-surface-subtle md:inline-flex"
                >
                  <span className="truncate">{accountLabel}</span>
                </Link>
                <LogoutButton className={buttonVariants({ variant: "ghost", size: "sm" })} />
              </>
            ) : (
              <span className="ml-1 hidden rounded-md border px-3 py-1.5 text-xs text-muted-foreground md:inline">
                Not signed in
              </span>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <nav
          aria-label="Workspace"
          className="overflow-x-auto border-b px-3 py-2 lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0 lg:px-3 lg:py-5"
        >
          <Suspense fallback={<WorkspaceNavLinks pathname={null} />}>
            <WorkspaceNav />
          </Suspense>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 lg:px-8 lg:py-8">
            {preview ? <PreviewNotice /> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
