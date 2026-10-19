"use client";

import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  tabs: { id: string; label: string; icon: React.ReactNode }[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div
      role="tablist"
      className="flex w-full sm:w-auto items-center gap-1 overflow-x-auto rounded-xl border border-border/80 bg-muted/40 p-1"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
              active
                ? "bg-background text-foreground shadow-xs font-semibold border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 transition-colors",
                active && "text-primary"
              )}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
