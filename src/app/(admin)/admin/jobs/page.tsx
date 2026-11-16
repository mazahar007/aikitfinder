import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";

export const metadata: Metadata = { title: "Background Jobs" };

export default function Page() {
  return (
    <SectionPage
      title="Background Jobs"
      description="Queue, workers and job history."
      permission="jobs.read"
      integrationKeys={["background_jobs", "redis_celery", "rendering", "remotion_worker"]}
      notBuilt="The job system itself: there is no queue, worker or renderer running, so there are no jobs to list, retry or cancel."
    />
  );
}
