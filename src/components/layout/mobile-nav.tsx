"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { isActivePath } from "@/components/layout/main-nav";
import { SearchForm } from "@/components/search/search-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { footerNav, mainNav } from "@/config/site";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground md:hidden">
          <MenuIcon className="size-5!" aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby="mobile-nav-desc">
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription id="mobile-nav-desc" className="sr-only">
          Site navigation and search
        </SheetDescription>
        <div onSubmit={() => setOpen(false)}>
          <SearchForm id="mobile-search" />
        </div>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center rounded-md px-3 text-base font-medium",
                      active
                        ? "bg-primary-tint text-primary-hover"
                        : "text-foreground hover:bg-surface-subtle",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 text-sm">
          {footerNav
            .flatMap((group) => group.items)
            .filter((item) => !mainNav.some((m) => m.href === item.href))
            .map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              </li>
            ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
