import { hasFreePlan, pricingFreshness } from "@/lib/content/pricing";
import type { Tool, Workflow, WorkflowStep } from "@/lib/content/types";

export function modeCounts(steps: WorkflowStep[]) {
  return {
    manual: steps.filter((s) => s.mode === "manual").length,
    automatable: steps.filter((s) => s.mode === "automatable").length,
  };
}

/** Total of the per-step estimates, only when every step has one. */
export function summedStepMinutes(steps: WorkflowStep[]): number | undefined {
  if (!steps.length || steps.some((s) => s.estimatedMinutes === undefined)) return undefined;
  return steps.reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0);
}

/** The distinct tools suggested in a workflow's steps (not the alternatives), in step order. */
export function suggestedTools(workflow: Workflow, tools: Tool[]): Tool[] {
  const seen = new Set<string>();
  const result: Tool[] = [];
  for (const step of workflow.steps) {
    const tool = tools.find((t) => t.slug === step.toolSlug);
    if (tool && !seen.has(tool.slug)) {
      seen.add(tool.slug);
      result.push(tool);
    }
  }
  return result;
}

/**
 * Honest pricing picture for the suggested tools. It uses only pricing that is
 * verified and recently checked; everything else is "not verified", never a
 * guess. It is not a total cost: plans, limits and what you actually need vary.
 */
export function pricingPicture(tools: Tool[], today: string) {
  const free: Tool[] = [];
  const paidOnly: Tool[] = [];
  const notVerified: Tool[] = [];
  for (const tool of tools) {
    if (pricingFreshness(tool.pricing, today) !== "current") notVerified.push(tool);
    else if (hasFreePlan(tool, today)) free.push(tool);
    else paidOnly.push(tool);
  }
  return { free, paidOnly, notVerified };
}
