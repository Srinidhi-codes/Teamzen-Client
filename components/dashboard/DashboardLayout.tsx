"use client"
import { useState } from "react";
import { Sidebar } from "../common/Sidebar";
import { Menu } from "lucide-react";
import { Navbar } from "../common/Navbar";
import AssistantWidget from "../ai";

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
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-8 bg-background">
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
    </div >
  );
}