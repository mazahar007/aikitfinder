"use client";

import * as React from "react";
import Link from "next/link";

import { products } from "@/config/products";

const items = [products.directory, products.autoflow] as const;

/**
 * "Products" in the parent header: a small disclosure menu with the two
 * products. Opens on click, Enter or Space; Escape or a click outside closes
 * it and returns focus to the button.
 */
export function ProductsMenu() {
  const [open, setOpen] = React.useState(false);
  const wrap = React.useRef<HTMLLIElement>(null);
  const button = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <li ref={wrap} className="products-menu">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        Products
        <svg width="16" height="16" aria-hidden="true">
          <use href="#i-down" />
        </svg>
      </button>
      <div id={id} className="products-pop" hidden={!open}>
        {items.map((product) => (
          <Link
            key={product.id}
            href={product.home}
            className={product.id === "directory" ? "dir" : "af"}
            onClick={() => setOpen(false)}
          >
            <b>{product.name}</b>
            <small>{product.tagline}</small>
            <span className={product.id === "directory" ? "pill pill-c" : "pill pill-v"}>
              <i></i>
              {product.status.label}
            </span>
          </Link>
        ))}
      </div>
    </li>
  );
}
