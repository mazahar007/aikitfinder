import { Suspense } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { AccountControls } from "@/components/auth/account-controls";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { MainNav, NavLinks } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchForm } from "@/components/search/search-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { products } from "@/config/products";

export function SiteHeader() {
  return (
    // Named so page transitions leave the header still (see motion.css).
    <header
      style={{ viewTransitionName: "site-header" }}
      className="header-scroll sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <Container className="flex h-16 items-center gap-4 lg:gap-6">
        <Logo href={products.directory.home} descriptor="Directory" />
        <nav aria-label="Main" className="hidden lg:block">
          {/* The active link depends on the URL, so it streams in; the
              fallback renders the same links without highlighting. */}
          <Suspense fallback={<NavLinks pathname={null} />}>
            <MainNav />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchForm shortcut className="hidden w-56 md:block lg:w-44 xl:w-56 2xl:w-72" />
          <Button asChild variant="ghost" size="icon" className="text-foreground md:hidden">
            <Link href="/search">
              <SearchIcon className="size-5!" aria-hidden="true" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Link
            href="/#products"
            className="hidden h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-surface-subtle hover:text-foreground xl:inline-flex"
          >
            All products
          </Link>
          <ThemeToggle />
          <span className="hidden lg:contents">
            <AccountControls
              showLogin={false}
              showLogout={false}
              signupClassName={buttonVariants({ variant: "secondary", size: "sm" })}
            />
          </span>
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
