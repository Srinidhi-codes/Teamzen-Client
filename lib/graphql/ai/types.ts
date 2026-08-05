export type FirstDayWizardStep = {
  id: string;
  title: string;
  summary: string;
  route?: string | null;
  routeLabel?: string | null;
  bullets: string[];
};

export type FirstDayWizardData = {
  shouldShow: boolean;
  hasSeenAiOnboarding: boolean;
  onboardingIncomplete: boolean;
  profile: {
    firstName: string;
    fullName: string;
    role: string;
    department?: string | null;
    designation?: string | null;
    organization?: string | null;
  };
  onboarding?: {
    status: string;
    progressPct: number;
    pendingTaskCount: number;
    pendingDocCount: number;
    rejectedDocCount: number;
    nextTaskTitle?: string | null;
    nextTaskPhase?: string | null;
  } | null;
  steps: FirstDayWizardStep[];
};
