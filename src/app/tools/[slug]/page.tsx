import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  AlertTriangleIcon,
  BookOpenIcon,
  CheckIcon,
  ExternalLinkIcon,
  FlaskConicalIcon,
} from "lucide-react";

import {
  ApiBadge,
  LevelBadge,
  PricingBadge,
  SampleBadge,
  VerificationBadge,
} from "@/components/content/badges";
import { GuideCard, ToolCard, WorkflowCard } from "@/components/content/cards";
import { CompareButton } from "@/components/compare/compare-button";
import { DealCard } from "@/components/content/deal-card";
import { PromptBlock } from "@/components/content/prompt-block";
import { SourcesList } from "@/components/content/sources-list";
import { ToolLogo } from "@/components/content/tool-logo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPARE_MAX, compareHref } from "@/lib/content/compare";
import { platformLabel, pricingLabel, skillLevelLabel } from "@/lib/content/labels";
import {
  getAllCategories,
  getAlternatives,
  getDealsForTool,
  getGuidesForTool,
  getSimilarTools,
  getTool,
  getTools,
  getWorkflowsForTool,
} from "@/lib/content/repository";
import { reveal } from "@/lib/motion";

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return {};
  return {
    title: `${tool.name}: how to use it, settings and prompts`,
    description: tool.shortDescription,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

const sections = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "features", label: "Features" },
  { id: "settings", label: "Settings explained" },
  { id: "prompts", label: "Prompts" },
  { id: "limitations", label: "Limitations" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "related", label: "Related" },
  { id: "sources", label: "Sources" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-t pt-8">
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

function NotDocumented() {
  return <p className="text-muted-foreground">We haven’t documented this yet.</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <CheckIcon className="mt-1 size-4 shrink-0 text-learn" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) notFound();

  const [categories, guides, workflows, similar, alternatives, deals] = await Promise.all([
    getAllCategories(),
    getGuidesForTool(tool.slug),
    getWorkflowsForTool(tool.slug),
    getSimilarTools(tool),
    getAlternatives(tool),
    getDealsForTool(tool.slug),
  ]);
  const primaryCategory = categories.find((c) => c.slug === tool.categorySlugs[0]);
  const categoryName = (s: string) =>
    categories.find((c) => c.slug === s)?.name.replace(/^AI /, "");

  return (
    <Container className="py-8 sm:py-12">
      <div className="reading-progress" aria-hidden="true" />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Tools", href: "/tools" },
          ...(primaryCategory
            ? [
                {
                  label: primaryCategory.name.replace(/^AI /, ""),
                  href: `/categories/${primaryCategory.slug}`,
                },
              ]
            : []),
          { label: tool.name },
        ]}
      />

      {/* Header */}
      <header className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <ToolLogo name={tool.name} size="lg" morphId={tool.slug} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-h1">
                {tool.name}
              </h1>
              {tool.isSample ? <SampleBadge /> : null}
            </div>
            <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
              {tool.shortDescription}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tool.categorySlugs.map((c) => (
                <Link key={c} href={`/categories/${c}`}>
                  <Badge variant="info" className="hover:underline">
                    {categoryName(c)}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild>
            <a href={tool.officialUrl} target="_blank" rel="noopener noreferrer nofollow">
              Visit official site
              <ExternalLinkIcon aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
          {tool.docsUrl ? (
            <Button asChild variant="secondary">
              <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer nofollow">
                Official docs
                <BookOpenIcon aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          ) : null}
          <CompareButton slug={tool.slug} name={tool.name} />
        </div>
      </header>

      {tool.isSample ? (
        <p className="mt-6 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm">
          <FlaskConicalIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-warning">Sample tool:</strong> {tool.name} is
            fictional. Its features, prices and settings were invented to test this page layout.
          </span>
        </p>
      ) : null}

      {/* At a glance */}
      <section
        aria-labelledby="glance-heading"
        className="mt-6 rounded-lg border bg-card p-5 sm:p-6"
      >
        <h2 id="glance-heading" className="text-sm font-semibold text-heading">
          At a glance
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
          <Fact label="Best for">{tool.useCases[0] ?? "—"}</Fact>
          <Fact label="Skill level">
            <LevelBadge level={tool.skillLevel} />
          </Fact>
          <Fact label="Pricing">
            {tool.pricingModel ? pricingLabel[tool.pricingModel] : <PricingBadge />}
          </Fact>
          <Fact label="Free plan">{tool.freePlan ?? "Not verified yet"}</Fact>
          <Fact label="Free trial">{tool.freeTrial ?? "Not verified yet"}</Fact>
          <Fact label="Platforms">
            {tool.platforms?.length
              ? tool.platforms.map((p) => platformLabel[p]).join(", ")
              : "Not verified yet"}
          </Fact>
          <Fact label="API">
            {tool.apiAvailable === true ? (
              <ApiBadge />
            ) : tool.apiAvailable === false ? (
              "No public API"
            ) : (
              "Not verified yet"
            )}
          </Fact>
          <Fact label="Information">
            <VerificationBadge status={tool.verification} date={tool.lastVerifiedAt} />
          </Fact>
        </dl>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[13rem_1fr]">
        {/* Table of contents */}
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-2 text-sm font-semibold text-heading">On this page</p>
            <ul className="space-y-0.5 border-l text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-3 text-muted-foreground hover:border-input hover:text-foreground"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-10">
          <details className="rounded-md border bg-card lg:hidden">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold text-heading">
              Jump to section
            </summary>
            <ul className="grid grid-cols-2 gap-1 px-2 pb-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-md px-2 py-2 text-sm text-primary hover:bg-surface-subtle"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          <Section id="overview" title="Overview">
            <p className="max-w-[70ch]">{tool.overview}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-heading">Main use cases</h3>
                <div className="mt-2">
                  {tool.useCases.length ? <BulletList items={tool.useCases} /> : <NotDocumented />}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-heading">Who it’s for</h3>
                <p className="mt-2">
                  {tool.audience.length ? tool.audience.join(", ") : "Not documented yet."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recommended level: {skillLevelLabel[tool.skillLevel]}
                </p>
                {tool.inputs.length || tool.outputs.length ? (
                  <dl className="mt-4 space-y-2 text-sm">
                    {tool.inputs.length ? (
                      <div>
                        <dt className="font-semibold text-heading">You provide</dt>
                        <dd className="text-muted-foreground">{tool.inputs.join(" · ")}</dd>
                      </div>
                    ) : null}
                    {tool.outputs.length ? (
                      <div>
                        <dt className="font-semibold text-heading">You get</dt>
                        <dd className="text-muted-foreground">{tool.outputs.join(" · ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </div>
            </div>
          </Section>

          <Section id="quick-start" title="Quick start">
            {tool.setupRequirements.length ? (
              <div className="mb-5 rounded-md bg-surface-subtle p-4 text-sm">
                <p className="font-semibold text-heading">Before you start</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                  {tool.setupRequirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tool.quickStart.length ? (
              <ol className="space-y-4">
                {tool.quickStart.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-learn text-sm font-bold text-learn-foreground">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <NotDocumented />
            )}
            {tool.firstExample ? (
              <div className="mt-6">
                <h3 className="font-semibold text-heading">Try this first</h3>
                <div className="mt-2">
                  <PromptBlock text={tool.firstExample.prompt} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">What to expect:</span>{" "}
                  {tool.firstExample.expectedResult}
                </p>
              </div>
            ) : null}
          </Section>

          <Section id="features" title="Key features">
            {tool.features.length ? <BulletList items={tool.features} /> : <NotDocumented />}
          </Section>

          <Section id="settings" title="Settings explained">
            {tool.settings.length ? (
              <div className="space-y-4">
                {tool.settings.map((s) => (
                  <article key={s.name} className="rounded-md border bg-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-heading">{s.name}</h3>
                      <VerificationBadge status={s.verification} />
                    </div>
                    <p className="mt-2">{s.explanation}</p>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                      {s.options ? (
                        <div>
                          <dt className="font-semibold text-heading">Options</dt>
                          <dd className="font-mono text-muted-foreground">{s.options}</dd>
                        </div>
                      ) : null}
                      {s.whenToAdjust ? (
                        <div>
                          <dt className="font-semibold text-heading">When to change it</dt>
                          <dd className="text-muted-foreground">{s.whenToAdjust}</dd>
                        </div>
                      ) : null}
                      {s.tradeoffs ? (
                        <div>
                          <dt className="font-semibold text-heading">Trade-off</dt>
                          <dd className="text-muted-foreground">{s.tradeoffs}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {s.sourceUrl ? (
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Source <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <NotDocumented />
            )}
          </Section>

          <Section id="prompts" title="Prompt examples">
            {tool.prompts.length ? (
              <div className="space-y-6">
                {tool.prompts.map((p) => (
                  <article key={p.slug} id={`prompt-${p.slug}`} className="scroll-mt-24">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-heading">{p.title}</h3>
                      <Badge variant={p.tested ? "success" : "neutral"}>
                        {p.tested ? "Tested" : "Untested"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.task}</p>
                    <div className="mt-3">
                      <PromptBlock text={p.text} />
                    </div>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-heading">Expected output:</span>{" "}
                      <span className="text-muted-foreground">{p.expectedOutput}</span>
                    </p>
                    {p.caveats ? (
                      <p className="mt-1 text-sm">
                        <span className="font-semibold text-heading">Watch out:</span>{" "}
                        <span className="text-muted-foreground">{p.caveats}</span>
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <NotDocumented />
            )}
          </Section>

          <Section id="limitations" title="Limitations">
            {tool.limitations.length ? (
              <ul className="space-y-2">
                {tool.limitations.map((l) => (
                  <li key={l} className="flex gap-2">
                    <AlertTriangleIcon
                      className="mt-1 size-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <NotDocumented />
            )}
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            {tool.troubleshooting.length ? (
              <div className="space-y-4">
                {tool.troubleshooting.map((t) => (
                  <article
                    key={t.slug}
                    id={`fix-${t.slug}`}
                    className="scroll-mt-24 rounded-md border bg-card p-5"
                  >
                    <h3 className="font-semibold text-heading">{t.problem}</h3>
                    <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="font-semibold text-heading">Possible causes</p>
                        <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                          {t.causes.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-heading">How to fix it</p>
                        <ol className="mt-1 list-decimal pl-5 text-muted-foreground">
                          {t.fixes.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                    {t.whenToContactSupport ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-heading">Contact support:</span>{" "}
                        {t.whenToContactSupport}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <NotDocumented />
            )}
          </Section>

          <Section id="related" title="Related guides and workflows">
            {guides.length || workflows.length ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <GuideCard guide={g} />
                  </li>
                ))}
                {workflows.map((w) => (
                  <li key={w.slug}>
                    <WorkflowCard workflow={w} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No guides for this tool yet.</p>
            )}
            {deals.length ? (
              <>
                <h3 className="mt-8 font-semibold text-heading">Deals and free trials</h3>
                <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {deals.map((d, i) => (
                    <li key={d.slug} {...reveal(i)}>
                      <DealCard deal={d} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {alternatives.length ? (
              <>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-heading">Alternatives</h3>
                  <Link
                    href={compareHref(
                      [tool.slug, ...alternatives.map((a) => a.slug)].slice(0, COMPARE_MAX),
                    )}
                    className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                  >
                    Compare {tool.name} with{" "}
                    {alternatives.length === 1 ? alternatives[0].name : "its alternatives"}
                  </Link>
                </div>
                <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {alternatives.map((t, i) => (
                    <li key={t.slug} {...reveal(i)}>
                      <ToolCard tool={t} categoryName={categoryName(t.categorySlugs[0])} compare />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {similar.length ? (
              <>
                <h3 className="mt-8 font-semibold text-heading">Similar tools</h3>
                <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {similar.map((t, i) => (
                    <li key={t.slug} {...reveal(i)}>
                      <ToolCard tool={t} categoryName={categoryName(t.categorySlugs[0])} compare />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Section>

          <Section id="sources" title="Sources and verification">
            <SourcesList
              sources={tool.sources}
              verification={tool.verification}
              lastVerifiedAt={tool.lastVerifiedAt}
              updatedAt={tool.updatedAt}
            />
          </Section>
        </div>
      </div>
    </Container>
  );
}
