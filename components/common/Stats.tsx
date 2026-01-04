"use client";

interface StatProps {
  icon: string;
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  gradient?: string;
}

export function Stat({ icon, label, value, change, gradient = "from-indigo-500 to-purple-600" }: StatProps) {
  return (
    <div className="glass p-6 rounded-2xl border border-white/30 card-hover card-shadow animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${change.type === "increase"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            <span>{change.type === "increase" ? "↑" : "↓"}</span>
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}