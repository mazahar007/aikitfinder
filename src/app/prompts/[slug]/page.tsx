import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FlaskConicalIcon, InfoIcon } from "lucide-react";

import { LevelBadge, SampleBadge } from "@/components/content/badges";
import { GuideCard } from "@/components/content/cards";
import { PromptCard, TestedBadge } from "@/components/content/prompt-card";
import { PromptPlayground } from "@/components/content/prompt-playground";
import { ToolLogo } from "@/components/content/tool-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/content/labels";
import {
  getAllCategories,
  getGuides,
  getPrompt,
  getPrompts,
  getToolsBySlugs,
} from "@/lib/content/repository";
import { reveal } from "@/lib/motion";

export async function generateStaticParams() {
  const prompts = await getPrompts();
  return prompts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/prompts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPrompt(slug);
  if (!prompt) return {};
  return {
    title: `${prompt.title}: prompt with fill-in blanks`,
    description: prompt.useCase,
    alternates: { canonical: `/prompts/${prompt.slug}` },
  };
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t pt-8">
      <h2
        id={`${id}-heading`}
        className="text-xl font-bold tracking-tight text-heading sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function PromptPage({ params }: PageProps<"/prompts/[slug]">) {
  const { slug } = await params;
  const prompt = await getPrompt(slug);
  if (!prompt) notFound();

  const [categories, tools, allPrompts, guides] = await Promise.all([
    getAllCategories(),
    getToolsBySlugs(prompt.toolSlugs),
    getPrompts(),
    getGuides(),
  ]);
  const categoryNames = prompt.categorySlugs
    .map((s) => categories.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const relatedGuides = guides.filter((g) => g.toolSlugs.some((s) => prompt.toolSlugs.includes(s)));
  const related = allPrompts
    .filter(
      (p) =>
        p.slug !== prompt.slug &&
        (p.categorySlugs.some((c) => prompt.categorySlugs.includes(c)) ||
          p.toolSlugs.some((t) => prompt.toolSlugs.includes(t))),
    )
    .slice(0, 3);
  const toolNames = async (slugs: string[]) => (await getToolsBySlugs(slugs)).map((t) => t.name);
  const relatedWithTools = await Promise.all(
    related.map(async (p) => ({ prompt: p, names: await toolNames(p.toolSlugs) })),
  );

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Prompts", href: "/prompts" },
          { label: prompt.title },
        ]}
      />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-h1">
          {prompt.title}
        </h1>
        <p className="mt-2 text-lead text-muted-foreground">{prompt.useCase}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <LevelBadge level={prompt.skillLevel} />
          <TestedBadge tested={prompt.tested} />
          {categoryNames.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`}>
              <Badge variant="info">{c.name.replace(/^AI /, "")}</Badge>
            </Link>
          ))}
          {prompt.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
          {prompt.isSample ? <SampleBadge /> : null}
        </div>
      </header>

      {prompt.isSample ? (
        <p className="mt-6 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm">
          <FlaskConicalIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-warning">Sample prompt:</strong> it is written for
            this prototype and uses fictional tools. It has not been run against a real tool.
          </span>
        </p>
      ) : null}

      <div className="mt-8 max-w-4xl space-y-10">
        <div id="use">
          <PromptPlayground text={prompt.text} variables={prompt.variables} />
        </div>

        <Section id="how" title="How to use it">
          <ol className="space-y-3">
            {prompt.instructions.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-learn text-xs font-bold text-learn-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="expect" title="What to expect">
          <p>{prompt.expectedOutput}</p>
          {prompt.exampleOutput ? (
            <figure className="mt-4 rounded-md border border-dashed bg-card p-4">
              <figcaption className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <InfoIcon className="size-3.5" aria-hidden="true" />
                Illustrative example, not a guaranteed result
              </figcaption>
              <pre className="mt-2 overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {prompt.exampleOutput}
              </pre>
            </figure>
          ) : null}
          {prompt.caveats ? (
            <p className="mt-4 text-sm">
              <span className="font-semibold text-heading">Watch out:</span>{" "}
              <span className="text-muted-foreground">{prompt.caveats}</span>
            </p>
          ) : null}
        </Section>

        <Section id="tools" title="Works with">
          {tools.length ? (
            <ul className="flex flex-wrap gap-3">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tools/${t.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium hover:border-primary"
                  >
                    <ToolLogo name={t.name} className="size-7 text-[11px]" />
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              We haven’t confirmed which tools this suits, so none are listed.
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            Only tools we have checked are listed. The prompt may work in others, but we can’t say
            so yet.
          </p>
        </Section>

        {relatedGuides.length ? (
          <Section id="guides" title="Related guides">
            <ul className="grid gap-4 sm:grid-cols-2">
              {relatedGuides.slice(0, 2).map((g) => (
                <li key={g.slug}>
                  <GuideCard guide={g} />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section id="source" title="Source and review">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Author
              </dt>
              <dd className="mt-1">{prompt.author}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Origin
              </dt>
              <dd className="mt-1">{prompt.originNote}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Last reviewed
              </dt>
              <dd className="mt-1">
                {prompt.lastReviewedAt ? formatDate(prompt.lastReviewedAt) : "Not reviewed yet"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Tested
              </dt>
              <dd className="mt-1">
                {prompt.tested ? "Yes, someone ran it and checked the result." : "Not tested yet."}
              </dd>
            </div>
          </dl>
          <Link
            href="/contact"
            className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
          >
            Report a problem with this prompt
          </Link>
        </Section>
      </div>

      {relatedWithTools.length ? (
        <section aria-labelledby="related-heading" className="mt-14 border-t pt-8">
          <h2
            id="related-heading"
            className="text-xl font-bold tracking-tight text-heading sm:text-2xl"
          >
            More prompts like this
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {relatedWithTools.map(({ prompt: p, names }, i) => (
              <li key={p.slug} {...reveal(i)}>
                <PromptCard prompt={p} toolNames={names} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
