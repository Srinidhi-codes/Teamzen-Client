"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../common/Sidebar";
import { Navbar } from "../common/Navbar";
import { LocationSyncBanner } from "../common/LocationSyncBanner";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { useFirstDayWizard } from "@/lib/graphql/ai/firstDayHook";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";

const AssistantWidget = dynamic(() => import("../ai"), {
  ssr: false,
  loading: () => null,
});
const OnboardingTour = dynamic(
  () => import("../common/OnboardingTour").then((mod) => mod.OnboardingTour),
  { ssr: false, loading: () => null }
);
const FirstDayWizard = dynamic(
  () => import("../ai/FirstDayWizard").then((mod) => mod.FirstDayWizard),
  { ssr: false, loading: () => null }
);

function wizardDismissKey(userId?: string | number | null) {
  return `teamzen_first_day_wizard_dismissed_${userId || "x"}`;
}

export function markFirstDayWizardDismissed(userId?: string | number | null) {
  try {
    sessionStorage.setItem(wizardDismissKey(userId), "1");
  } catch {
    // ignore
  }
}

function wasFirstDayWizardDismissed(userId?: string | number | null) {
  try {
    return sessionStorage.getItem(wizardDismissKey(userId)) === "1";
  } catch {
    return false;
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed: setIsCollapsed,
    sidebarMobileOpen: isMobileOpen,
    setSidebarMobileOpen: setIsMobileOpen,
    user,
  } = useStore();
  const { can } = useOrgPlan();
  const canUseAssistant = can("ai_assistant");

  const [wizardOpen, setWizardOpen] = useState(false);
  const { wizard, isLoading, refetch } = useFirstDayWizard(!!user && canUseAssistant);

  const closeWizard = () => {
    markFirstDayWizardDismissed(user?.id);
    setWizardOpen(false);
  };

  useEffect(() => {
    if (!canUseAssistant) return;
    if (!user || isLoading || !wizard?.shouldShow) return;
    if (wasFirstDayWizardDismissed(user.id)) return;
    if (wizardOpen) return;
    // Already marked seen in profile and no incomplete nudge needed
    if (user.hasSeenAiOnboarding === true) return;

    const timer = setTimeout(() => setWizardOpen(true), 1800);
    return () => clearTimeout(timer);
  }, [user, isLoading, wizard, wizardOpen, canUseAssistant]);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ scrollbarGutter: "stable" }}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-200 ease-out",
          isCollapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        <LocationSyncBanner />
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {canUseAssistant && <AssistantWidget />}
      <OnboardingTour />
      {canUseAssistant && wizardOpen && wizard?.shouldShow && (
        <FirstDayWizard
          data={wizard}
          onClose={closeWizard}
          onCompleted={() => {
            markFirstDayWizardDismissed(user?.id);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
