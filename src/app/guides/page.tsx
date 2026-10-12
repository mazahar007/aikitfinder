import type { Metadata } from "next";

import { GuideCard } from "@/components/content/cards";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { skillLevelLabel, skillLevels } from "@/lib/content/labels";
import { getGuides, getTools } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step AI tutorials that take you from setup to a finished result.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage() {
  const [guides, tools] = await Promise.all([getGuides(), getTools()]);
  const toolNames = (slugs: string[]) =>
    slugs.map((s) => tools.find((t) => t.slug === s)?.name).filter((n): n is string => !!n);

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">Guides</h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Practical, step-by-step tutorials. Each one lists what you need, the steps, and what result
        to expect.
      </p>
      <SampleNotice className="mt-6" />

      {/* Grouped by level so beginners can start at the top. */}
      {skillLevels.map((level) => {
        const items = guides.filter((g) => g.skillLevel === level);
        if (!items.length) return null;
        return (
          <section key={level} aria-labelledby={`level-${level}`} className="mt-10">
            <h2 id={`level-${level}`} className="text-xl font-bold text-heading sm:text-2xl">
              {skillLevelLabel[level]}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((g) => (
                <li key={g.slug}>
                  <GuideCard guide={g} toolNames={toolNames(g.toolSlugs)} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Container>
  );
}
