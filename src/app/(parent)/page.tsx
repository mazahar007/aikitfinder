import type { Metadata } from "next";

import { Faq } from "@/components/parent/faq";
import { FinalCta } from "@/components/parent/final-cta";
import { ParentFooter } from "@/components/parent/footer";
import { ParentHeader } from "@/components/parent/header";
import { Hero } from "@/components/parent/hero";
import { HowItWorks } from "@/components/parent/how-it-works";
import { ProductCards } from "@/components/parent/product-cards";
import { Trust } from "@/components/parent/trust";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name}: Discover AI tools. Create content with AI.` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/**
 * AIKitFinder parent homepage: the gateway to the two products. Eight
 * sections in the approved order (docs/phase-0a/hybrid-proposal).
 */
export default function ParentHomePage() {
  return (
    <>
      <ParentHeader withMotionToggle />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ProductCards />
        <HowItWorks />
        <Trust />
        <Faq />
        <FinalCta />
      </main>
      <ParentFooter />
    </>
  );
}
