"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderIcon, LayoutDashboardIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/autoflow/app", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/autoflow/app/projects", label: "Projects", icon: FolderIcon, exact: false },
];

/** Sections that are planned but not built. Listed so the structure is clear; not links. */
const planned = ["Voiceover Studio", "Channels", "Settings"];

export function WorkspaceNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <>
      <ul className="flex gap-1 lg:flex-col">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = pathname
            ? exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`)
            : false;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium whitespace-nowrap",
                  active
                    ? "bg-primary-tint text-heading"
                    : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 hidden lg:block">
        <p className="px-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Planned
        </p>
        <ul className="mt-2">
          {planned.map((label) => (
            <li key={label} className="flex h-10 items-center px-3 text-sm text-muted-foreground">
              {label}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function WorkspaceNav() {
  return <WorkspaceNavLinks pathname={usePathname()} />;
}
