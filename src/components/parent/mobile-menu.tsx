"use client";

import * as React from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";

import { useAuthDialog } from "@/components/auth/auth-provider";
import { ParentLogo } from "@/components/parent/logo";
import { useThemeToggle } from "@/components/theme/theme-toggle";
import { products } from "@/config/products";

/**
 * Phone and tablet navigation for the parent site. The two products come
 * first, as large labeled rows with their status; then the section links, the
 * theme switch, and Sign up / Log in. Built on Radix Dialog (focus trap,
 * Escape to close, focus returns to the menu button).
 */
export function ParentMobileMenu() {
  const [open, setOpen] = React.useState(false);
  const openAuth = useAuthDialog();
  const toggleTheme = useThemeToggle();
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="icon-btn menu-btn" type="button">
          <svg aria-hidden="true">
            <use href="#i-menu" />
          </svg>
          <span className="sr">Open menu</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Rendered outside the page wrapper, so it carries the parent scope itself. */}
        <div className="akf-parent">
          <Dialog.Overlay className="overlay menu" />
          <Dialog.Content className="sheet" aria-describedby={undefined}>
            <div className="sheet-top">
              <ParentLogo onNavigate={close} />
              <Dialog.Close className="icon-btn" type="button">
                <svg aria-hidden="true">
                  <use href="#i-x" />
                </svg>
                <span className="sr">Close menu</span>
              </Dialog.Close>
            </div>
            <Dialog.Title className="sr">Menu</Dialog.Title>

            <p className="grp">Products</p>
            <Link className="prow dir" href={products.directory.home} onClick={close}>
              <span className="ti">
                <svg aria-hidden="true">
                  <use href="#i-search" />
                </svg>
              </span>
              <span>
                <b>{products.directory.name}</b>
                <small>{products.directory.tagline}</small>
                <span className="pill pill-c">
                  <i></i>
                  {products.directory.status.label}
                </span>
              </span>
              <svg aria-hidden="true">
                <use href="#i-arrow" />
              </svg>
            </Link>
            <Link className="prow af" href={products.autoflow.home} onClick={close}>
              <span className="ti">
                <svg aria-hidden="true">
                  <use href="#i-play" />
                </svg>
              </span>
              <span>
                <b>{products.autoflow.name}</b>
                <small>{products.autoflow.tagline}</small>
                <span className="pill pill-v">
                  <i></i>
                  {products.autoflow.status.label}
                </span>
              </span>
              <svg aria-hidden="true">
                <use href="#i-arrow" />
              </svg>
            </Link>

            <p className="grp">AIKitFinder</p>
            <div className="mlinks">
              {[
                ["How it works", "/#how"],
                ["Trust", "/#trust"],
                ["Help", "/#faq"],
              ].map(([label, href]) => (
                <Link key={href} href={href} onClick={close}>
                  {label}
                  <svg width="16" height="16" aria-hidden="true">
                    <use href="#i-arrow" />
                  </svg>
                </Link>
              ))}
              <button type="button" className="theme-row" onClick={toggleTheme}>
                Dark theme
                <span className="tog" aria-hidden="true"></span>
              </button>
            </div>

            <div className="acts">
              <button
                type="button"
                className="btn btn-af"
                onClick={() => {
                  close();
                  openAuth("signup");
                }}
              >
                Sign up
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  close();
                  openAuth("login");
                }}
              >
                Log in
              </button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
