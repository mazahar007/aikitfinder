import "server-only";

import { authStatus, type SessionUser } from "@/lib/auth/config";
import { stageIds, type StageId, type StageStatus } from "@/lib/autoflow/stages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Mirrors the `autoflow_project_status` enum in supabase/migrations/0006. */
export type ProjectStatus = "draft" | "in_progress" | "ready_for_review" | "approved" | "archived";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  currentStage: StageId;
  stages: Record<StageId, StageStatus>;
  /** Output format; the first supported workflow is 16:9 video. */
  aspectRatio: "16:9";
  updatedAt: string | null;
  /** True only for the built-in layout sample. It is not stored anywhere. */
  sample: boolean;
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  ready_for_review: "Ready for review",
  approved: "Approved",
  archived: "Archived",
};

/**
 * A fixed example used to show the project screens where accounts are not
 * configured. It is labeled as a sample everywhere it appears, cannot be
 * edited, and is never shown to a signed-in user.
 */
export const SAMPLE_PROJECT_ID = "sample";

const notStarted = () =>
  Object.fromEntries(stageIds.map((id) => [id, "not_started"])) as Record<StageId, StageStatus>;

const sampleProject: Project = {
  id: SAMPLE_PROJECT_ID,
  title: "Sample project",
  status: "draft",
  currentStage: "research",
  stages: notStarted(),
  aspectRatio: "16:9",
  updatedAt: null,
  sample: true,
};

const COLUMNS =
  "id, title, status, current_stage, aspect_ratio, updated_at, autoflow_project_stages (stage, status)";

type Row = {
  id: string;
  title: string;
  status: ProjectStatus;
  current_stage: StageId;
  aspect_ratio: "16:9";
  updated_at: string;
  autoflow_project_stages: { stage: StageId; status: StageStatus }[];
};

function toProject(row: Row): Project {
  const stages = notStarted();
  for (const s of row.autoflow_project_stages) stages[s.stage] = s.status;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    currentStage: row.current_stage,
    stages,
    aspectRatio: row.aspect_ratio,
    updatedAt: row.updated_at,
    sample: false,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Projects owned by the user, newest first.
 *
 * Queries run as the signed-in user, so row level security returns only their
 * own rows; the user is not passed as a filter that could be forged. Where
 * accounts are not configured, the labeled sample is returned instead.
 */
export async function listProjects(user: SessionUser | null): Promise<Project[]> {
  if (!user) return authStatus.enabled ? [] : [sampleProject];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("autoflow_projects")
    .select(COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Could not load projects");
  return (data as unknown as Row[]).map(toProject);
}

/** One project, or null when it does not exist or belongs to someone else. */
export async function getProject(user: SessionUser | null, id: string): Promise<Project | null> {
  if (!user) return !authStatus.enabled && id === SAMPLE_PROJECT_ID ? sampleProject : null;
  if (!UUID.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("autoflow_projects")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Could not load the project");
  return data ? toProject(data as unknown as Row) : null;
}
