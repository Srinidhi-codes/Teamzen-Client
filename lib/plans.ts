export type PlanId = "free" | "pro" | "elite";

export type PlanFeature =
  | "payroll_basic"
  | "payroll_auto_run"
  | "salary_advances"
  | "org_llm_key"
  | "advanced_analytics"
  | "ai_assistant"
  | "custom_accent"
  | "policies"
  | "face_attendance";

export const PLAN_ORDER: PlanId[] = ["free", "pro", "elite"];

const PLAN_FEATURES: Record<PlanId, PlanFeature[]> = {
  free: ["payroll_basic", "policies"],
  pro: [
    "payroll_basic",
    "policies",
    "ai_assistant",
    "custom_accent",
    "payroll_auto_run",
    "salary_advances",
    "face_attendance",
  ],
  elite: [
    "payroll_basic",
    "policies",
    "ai_assistant",
    "custom_accent",
    "payroll_auto_run",
    "salary_advances",
    "face_attendance",
    "org_llm_key",
    "advanced_analytics",
  ],
};

export function normalizePlan(plan?: string | null): PlanId {
  const p = (plan || "free").toLowerCase();
  if (p === "pro" || p === "elite") return p;
  return "free";
}

export function planLabel(plan?: string | null) {
  const p = normalizePlan(plan);
  if (p === "pro") return "Pro";
  if (p === "elite") return "Elite";
  return "Free";
}

/** Paid plan past expiry is treated as Free. */
export function effectivePlan(
  plan?: string | null,
  expiresAt?: string | null
): PlanId {
  const p = normalizePlan(plan);
  if (p === "free") return "free";
  if (!expiresAt) return p;
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return p;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  if (end < today) return "free";
  return p;
}

export function hasPlanFeature(
  plan?: string | null,
  expiresAt?: string | null,
  feature?: PlanFeature
): boolean {
  if (!feature) return true;
  const active = effectivePlan(plan, expiresAt);
  return PLAN_FEATURES[active].includes(feature);
}

export function effectiveAccent(
  accent?: string | null,
  plan?: string | null,
  expiresAt?: string | null
): string {
  if (!hasPlanFeature(plan, expiresAt, "custom_accent")) return "teal";
  return accent || "teal";
}

export function minPlanForFeature(feature: PlanFeature): PlanId {
  if (PLAN_FEATURES.free.includes(feature)) return "free";
  if (PLAN_FEATURES.pro.includes(feature)) return "pro";
  return "elite";
}
