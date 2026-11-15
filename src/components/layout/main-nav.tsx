"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop links. Pass `pathname={null}` to render without an active state. */
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1 whitespace-nowrap">
      {mainNav.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-11 items-center rounded-md px-2 text-sm font-medium transition-colors 2xl:px-3",
                active
                  ? "text-foreground after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary 2xl:after:inset-x-3"
                  : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
              )}
            >
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MainNav() {
  return <NavLinks pathname={usePathname()} />;
}
