import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangleIcon, ClockIcon, TargetIcon } from "lucide-react";

import { LevelBadge, SampleBadge, VerificationBadge } from "@/components/content/badges";
import { GuideCard } from "@/components/content/cards";
import { PromptBlock } from "@/components/content/prompt-block";
import { SourcesList } from "@/components/content/sources-list";
import { ToolLogo } from "@/components/content/tool-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { getGuide, getGuides, getToolsBySlugs } from "@/lib/content/repository";

export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const [tools, allGuides] = await Promise.all([getToolsBySlugs(guide.toolSlugs), getGuides()]);
  const related = allGuides
    .filter((g) => g.slug !== guide.slug && g.toolSlugs.some((s) => guide.toolSlugs.includes(s)))
    .concat(allGuides.filter((g) => g.slug !== guide.slug && g.skillLevel === guide.skillLevel))
    .filter((g, i, arr) => arr.findIndex((x) => x.slug === g.slug) === i)
    .slice(0, 3);

  return (
    <Container className="max-w-4xl py-8 sm:py-12">
      <div className="reading-progress" aria-hidden="true" />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="learn">Guide</Badge>
          {guide.isSample ? <SampleBadge /> : null}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-heading sm:text-h1">
          {guide.title}
        </h1>
        <p className="mt-3 text-lead text-muted-foreground">{guide.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <LevelBadge level={guide.skillLevel} />
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-4" aria-hidden="true" />
            About {guide.estimatedMinutes} minutes
          </span>
          <VerificationBadge status={guide.verification} date={guide.lastVerifiedAt} />
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="needs-heading" className="rounded-md border bg-card p-5">
          <h2 id="needs-heading" className="font-semibold text-heading">
            What you need
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {guide.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="tools-heading" className="rounded-md border bg-card p-5">
          <h2 id="tools-heading" className="font-semibold text-heading">
            Tools used
          </h2>
          <ul className="mt-3 space-y-2">
            {tools.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="flex items-center gap-3 rounded-md p-1 hover:bg-surface-subtle"
                >
                  <ToolLogo name={t.name} className="size-9 text-xs" />
                  <span>
                    <span className="block text-sm font-semibold text-primary">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t.shortDescription}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="steps-heading" className="mt-10">
        <h2 id="steps-heading" className="text-2xl font-bold tracking-tight text-heading">
          Steps
        </h2>
        <ol className="mt-6 space-y-8">
          {guide.steps.map((step, i) => (
            <li
              key={step.title}
              id={`step-${i + 1}`}
              className="reveal relative flex scroll-mt-24 gap-4"
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-learn text-base font-bold text-learn-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <h3 className="text-lg font-semibold text-heading">{step.title}</h3>
                <p className="mt-1">{step.body}</p>
                {step.example ? (
                  <div className="mt-3">
                    <PromptBlock text={step.example} label="Copy" />
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="outcome-heading"
        className="mt-10 rounded-md border border-success/40 bg-success-tint p-5"
      >
        <h2 id="outcome-heading" className="flex items-center gap-2 font-semibold text-success">
          <TargetIcon className="size-4" aria-hidden="true" />
          Expected result
        </h2>
        <p className="mt-1 text-foreground">{guide.expectedOutcome}</p>
      </section>

      {guide.commonMistakes.length ? (
        <section aria-labelledby="mistakes-heading" className="mt-10">
          <h2 id="mistakes-heading" className="text-2xl font-bold tracking-tight text-heading">
            Common mistakes
          </h2>
          <ul className="mt-4 space-y-2">
            {guide.commonMistakes.map((m) => (
              <li key={m} className="flex gap-2">
                <AlertTriangleIcon
                  className="mt-1 size-4 shrink-0 text-warning"
                  aria-hidden="true"
                />
                {m}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {guide.troubleshooting.length ? (
        <section aria-labelledby="trouble-heading" className="mt-10">
          <h2 id="trouble-heading" className="text-2xl font-bold tracking-tight text-heading">
            Troubleshooting
          </h2>
          <div className="mt-4 space-y-3">
            {guide.troubleshooting.map((t) => (
              <details key={t.slug} className="rounded-md border bg-card">
                <summary className="flex min-h-12 cursor-pointer items-center px-4 font-semibold text-heading">
                  {t.problem}
                </summary>
                <div className="space-y-2 px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Why it happens:</span>{" "}
                    {t.causes.join("; ")}
                  </p>
                  <ul className="list-disc pl-5">
                    {t.fixes.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="sources-heading" className="mt-10 border-t pt-8">
        <h2 id="sources-heading" className="text-xl font-bold text-heading">
          Sources and verification
        </h2>
        <div className="mt-4">
          <SourcesList
            sources={guide.sources}
            verification={guide.verification}
            lastVerifiedAt={guide.lastVerifiedAt}
            updatedAt={guide.updatedAt}
          />
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="related-heading" className="mt-12">
          <h2 id="related-heading" className="text-xl font-bold text-heading">
            Related guides
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((g) => (
              <li key={g.slug}>
                <GuideCard guide={g} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
