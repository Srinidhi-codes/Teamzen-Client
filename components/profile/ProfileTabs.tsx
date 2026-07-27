interface ProfileTabsProps {
    tabs: { id: string; label: string; icon: React.ReactNode }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, setActiveTab }: ProfileTabsProps) {
    return (
        <div className="p-1.5 rounded-xl border bg-card flex w-full max-w-full gap-1 overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                >
                    <span className="text-base">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
