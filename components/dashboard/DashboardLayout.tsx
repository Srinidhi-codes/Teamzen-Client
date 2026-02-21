"use client"
import { useState } from "react";
import { Sidebar } from "../common/Sidebar";
import { Menu } from "lucide-react";
import { Navbar } from "../common/Navbar";
import { AssistantWidget } from "../ai/AssistantWidget";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground" style={{ scrollbarGutter: 'stable' }}>

      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${isCollapsed ? "md:ml-24" : "md:ml-72"}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between sticky top-0 z-30 border-b border-sidebar-border">
          <h1 className="text-xl font-black tracking-tighter uppercase">HRMS <span className="text-primary">CORE</span></h1>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <Navbar />

        <main className="flex-1 p-8 overflow-x-hidden bg-background">
          {children}
        </main>

        <footer className="p-8 border-t border-border bg-muted/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">© 2025 HRMS <span className="text-primary/50">Core</span>. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
      <AssistantWidget />
    </div>
  );
}