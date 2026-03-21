"use client"
import { useState, useEffect } from "react";
import { Sidebar } from "../common/Sidebar";
import { Menu } from "lucide-react";
import { Navbar } from "../common/Navbar";
import AssistantWidget from "../ai";
import { OnboardingTour } from "../common/OnboardingTour";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";

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
    user
  } = useStore();

  const { updateUserAsync } = useGraphQLUpdateUser();

  // Conversational Onboarding Trigger
  useEffect(() => {
    if (user && user.hasSeenAiOnboarding === false) {
      const timer = setTimeout(() => {
        setAssistantOpen(true);
        // Persist to DB immediately so it doesn't pop up again this session or next
        updateUserAsync({ has_seen_ai_onboarding: true }).catch(console.error);
      }, 5000); // Wait 5 seconds after login to open Assistant
      return () => clearTimeout(timer);
    }
  }, [user, setAssistantOpen, updateUserAsync]);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative" style={{ scrollbarGutter: 'stable' }}>
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow opacity-30" style={{ animationDelay: "2s" }} />
      </div>

      {/* Fixed Floating Navbar - sits above everything */}
      <Navbar isSidebarCollapsed={isCollapsed} onMenuClick={() => setIsMobileOpen(true)} />

      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full relative z-10 md:ml-24">
        <main className="flex-1 p-4 sm:p-8 pt-24 sm:pt-24 bg-transparent">
          {children}
        </main>

        <footer className="p-8 border-t border-border/50 bg-background/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">© 2025 Teamzen <span className="text-primary/50">Core</span>. Tactical Workforce Intelligence.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Privacy Protocol</a>
              <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Neural Support</a>
            </div>
          </div>
        </footer>
      </div>
      <AssistantWidget />
      <OnboardingTour />
    </div>
  );
}