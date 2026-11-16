import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";

import { AutoflowFooter } from "@/components/autoflow/autoflow-footer";
import { AutoflowHeader } from "@/components/autoflow/autoflow-header";
import { PipelineDependencies } from "@/components/autoflow/pipeline-dependencies";
import { StageRail } from "@/components/autoflow/stage-rail";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authStatus } from "@/lib/auth/config";
import { products } from "@/config/products";

export const metadata: Metadata = {
  title: { absolute: "AutoFlow AI: plan and produce video content | AIKitFinder" },
  description:
    "AutoFlow AI is a studio for planning and producing video content, with your approval required before anything is published. It is in development.",
  alternates: { canonical: "/autoflow" },
};

const decided = [
  {
    title: "Video first",
    body: "The first workflow produces 16:9 videos for YouTube from your own images, a voiceover and subtitles.",
  },
  {
    title: "Private by default",
    body: "Uploads are planned to go to YouTube as Private. You choose when a video becomes visible.",
  },
  {
    title: "Your account, your channel",
    body: "Channels will be connected through your own sign-in with the platform. No shared credentials.",
  },
  {
    title: "Multilingual content",
    body: "The interface is in English. Scripts, voiceovers and subtitles are planned in many languages.",
  },
];

export default function AutoflowLandingPage() {
  return (
    <>
      <AutoflowHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[480px] max-w-3xl rounded-full bg-primary/20 blur-[120px]"
          />
          <Container className="relative py-20 lg:py-28">
            <Badge variant="info">{products.autoflow.status.label}</Badge>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-light tracking-tight text-balance text-heading sm:text-6xl">
              From topic to publish-ready video.{" "}
              <em className="font-serif text-primary">You approve every step.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              AutoFlow AI is a studio for planning and producing video content: research, script,
              voiceover, assembly, thumbnail and metadata, then your review. It is being built now
              and cannot be used yet.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/autoflow/app">
                  {authStatus.enabled ? "Open the workspace" : "See the workspace preview"}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={products.directory.home}>Explore AI Tools</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {authStatus.enabled
                ? "The workspace needs an account. It shows your projects; no stage can be run yet."
                : "The preview shows the layout only. Nothing is generated and nothing is saved."}
            </p>
          </Container>
        </section>

        <section id="pipeline" aria-labelledby="pipeline-title" className="scroll-mt-20 border-b">
          <Container className="py-16 lg:py-20">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              The pipeline · planned
            </p>
            <h2
              id="pipeline-title"
              className="mt-3 font-display text-3xl font-light tracking-tight text-heading sm:text-4xl"
            >
              Six stages, in order
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Each project moves through the same stages. This is the structure the workspace is
              built around; the stages themselves are not built yet.
            </p>
            <StageRail className="mt-8" />
            <h3 className="mt-12 font-display text-2xl font-light tracking-tight text-heading">
              What each stage depends on
            </h3>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Every stage needs an outside service or piece of infrastructure. None is connected
              yet.
            </p>
            <div className="mt-5">
              <PipelineDependencies statuses={null} />
            </div>
          </Container>
        </section>

        <section aria-labelledby="approval-title" className="border-b">
          <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-20">
            <div>
              <ShieldCheckIcon className="size-8 text-primary" aria-hidden="true" />
              <h2
                id="approval-title"
                className="mt-4 font-display text-3xl font-light tracking-tight text-heading"
              >
                Nothing is published without your approval
              </h2>
              <p className="mt-3 text-muted-foreground">
                The Review stage is part of every project and cannot be switched off. AutoFlow AI
                will not post to a channel on its own.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {decided.map((d) => (
                <li key={d.title} className="rounded-lg border bg-card p-5">
                  <h3 className="font-display text-base font-medium text-heading">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.body}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section aria-labelledby="status-title">
          <Container className="py-16 lg:py-20">
            <h2
              id="status-title"
              className="font-display text-3xl font-light tracking-tight text-heading"
            >
              Where it stands
            </h2>
            <ul className="mt-6 max-w-2xl space-y-3 text-muted-foreground">
              <li>Built: this page, the workspace layout and the project structure.</li>
              <li>
                Not built yet: accounts, AI generation, voiceover, video assembly, publishing.
              </li>
              <li>Pricing has not yet been announced.</li>
            </ul>
          </Container>
        </section>
      </main>
      <AutoflowFooter />
    </>
  );
}
