import Link from "next/link";

import { AuthButton } from "@/components/auth/auth-provider";
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
          <AuthButton mode="login" className="btn btn-ghost btn-sm hide-t">
            Log in
          </AuthButton>
          <AuthButton mode="signup" className="btn btn-af btn-sm">
            Sign up
          </AuthButton>
          <ParentMobileMenu />
        </div>
      </div>
    </header>
  );
}
