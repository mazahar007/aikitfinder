import Link from "next/link";

import { AccountControls } from "@/components/auth/account-controls";
import { AutoflowLogo } from "@/components/autoflow/autoflow-logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { authStatus } from "@/lib/auth/config";
import { products } from "@/config/products";

const linkClass =
  "hidden h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-surface-subtle hover:text-foreground sm:inline-flex";

/** Header of the public AutoFlow AI pages. */
export function AutoflowHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center gap-2">
        <AutoflowLogo />
        <nav aria-label="AutoFlow AI" className="ml-auto flex items-center gap-1">
          <Link href="/autoflow#pipeline" className={linkClass}>
            Pipeline
          </Link>
          <Link href="/autoflow/app" className={linkClass}>
            {authStatus.enabled ? "Workspace" : "Workspace preview"}
          </Link>
          <Link href="/#products" className={linkClass}>
            All products
          </Link>
          <ThemeToggle />
          <AccountControls
            showLogin={false}
            showLogout={false}
            returnTo="/autoflow/app"
            returnLabel={products.autoflow.name}
            signupClassName={buttonVariants({ size: "sm" })}
          />
        </nav>
      </Container>
    </header>
  );
}
