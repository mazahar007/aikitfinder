import Link from "next/link";

import { AccountControls } from "@/components/auth/account-controls";
import { ParentLogo } from "@/components/parent/logo";
import { ParentMobileMenu } from "@/components/parent/mobile-menu";
import { MotionToggle } from "@/components/parent/motion-toggle";
import { ProductsMenu } from "@/components/parent/products-menu";
import { ParentThemeButton } from "@/components/parent/theme-button";

/**
 * Parent site header: brand, Products menu, section links, Pause control,
 * theme, Log in and Sign up. Transparent over the hero; <ParentEffects> turns
 * it into a blurred fixed bar once the page scrolls. Below 1100px the links
 * collapse into the menu button.
 */
export function ParentHeader({ withMotionToggle = false }: { withMotionToggle?: boolean }) {
  return (
    <header className="top" id="top">
      <div className="wrap nav">
        <ParentLogo />
        <nav aria-label="Main">
          <ul>
            <ProductsMenu />
            <li>
              <Link href="/#how">How it works</Link>
            </li>
            <li>
              <Link href="/#trust">Trust</Link>
            </li>
            <li>
              <Link href="/#faq">Help</Link>
            </li>
          </ul>
        </nav>
        <div className="right">
          {withMotionToggle ? <MotionToggle className="in-header" /> : null}
          <ParentThemeButton />
          <AccountControls
            loginClassName="btn btn-ghost btn-sm hide-t"
            signupClassName="btn btn-af btn-sm"
          />
          <ParentMobileMenu />
        </div>
      </div>
    </header>
  );
}
