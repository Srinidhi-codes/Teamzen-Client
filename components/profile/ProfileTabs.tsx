interface ProfileTabsProps {
    tabs: { id: string; label: string; icon: React.ReactNode }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, setActiveTab }: ProfileTabsProps) {
    return (
        <div className="p-2 rounded-4xl border glass-dark shadow-lg inline-flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-3xl font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                        ? "bg-linear-to-r from-primary to-primary/50 text-white shadow-lg"
                        : "text-gray-600 hover:bg-primary/30"
                        }`}
                >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
