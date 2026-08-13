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
      className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1"
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
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors",
              active
                ? "bg-card font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
