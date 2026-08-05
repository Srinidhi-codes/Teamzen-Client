"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../common/Sidebar";
import { Navbar } from "../common/Navbar";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";
import { useFirstDayWizard } from "@/lib/graphql/ai/firstDayHook";

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

  const [wizardOpen, setWizardOpen] = useState(false);
  const { wizard, isLoading, refetch } = useFirstDayWizard(!!user);

  const closeWizard = () => {
    markFirstDayWizardDismissed(user?.id);
    setWizardOpen(false);
  };

  useEffect(() => {
    if (!user || isLoading || !wizard?.shouldShow) return;
    if (wasFirstDayWizardDismissed(user.id)) return;
    if (wizardOpen) return;
    // Already marked seen in profile and no incomplete nudge needed
    if (user.hasSeenAiOnboarding === true) return;

    const timer = setTimeout(() => setWizardOpen(true), 1800);
    return () => clearTimeout(timer);
  }, [user, isLoading, wizard, wizardOpen]);

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
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <AssistantWidget />
      <OnboardingTour />
      {wizardOpen && wizard?.shouldShow && (
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
