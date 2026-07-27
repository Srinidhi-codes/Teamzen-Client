"use client";

import { useEffect } from "react";
import { Sidebar } from "../common/Sidebar";
import { Navbar } from "../common/Navbar";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";
import { cn } from "@/lib/utils";

const AssistantWidget = dynamic(() => import("../ai"), {
  ssr: false,
  loading: () => null,
});
const OnboardingTour = dynamic(
  () => import("../common/OnboardingTour").then((mod) => mod.OnboardingTour),
  { ssr: false, loading: () => null }
);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed: setIsCollapsed,
    sidebarMobileOpen: isMobileOpen,
    setSidebarMobileOpen: setIsMobileOpen,
    setAssistantOpen,
    user,
  } = useStore();

  const { updateUserAsync } = useGraphQLUpdateUser();

  useEffect(() => {
    if (user && user.hasSeenAiOnboarding === false) {
      const timer = setTimeout(() => {
        setAssistantOpen(true);
        updateUserAsync({ has_seen_ai_onboarding: true }).catch(console.error);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, setAssistantOpen, updateUserAsync]);

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
    </div>
  );
}
