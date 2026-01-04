interface ProfileTabsProps {
    tabs: { id: string; label: string; icon: string }[];
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export function ProfileTabs({ tabs, activeTab, setActiveTab }: ProfileTabsProps) {
    return (
        <div className="glass p-2 rounded-2xl border border-white/30 shadow-lg inline-flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-white/50"
                        }`}
                >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
