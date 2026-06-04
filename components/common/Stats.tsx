"use client";

interface StatProps {
  icon: any;
  label: string;
  value: string | number;
  index?: string | number;
  color?: string;
  gradient?: string;
}

export function Stat({ icon: Icon, label, value, index, color = "text-primary", gradient = "bg-primary/10" }: StatProps) {
  // Logic to determine if Icon is a component (function or forwardRef object)
  const isComponent = typeof Icon === 'function' ||
    (typeof Icon === 'object' && Icon !== null && (Icon.$$typeof || Icon.render));

  return (
    <div className="premium-card card-hover group relative overflow-hidden">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
        {isComponent ? (
          <Icon className={`w-28 h-28 ${color} rotate-12`} />
        ) : (
          <div className="w-28 h-28 rotate-12 scale-150">
            {Icon}
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* Top Section: Icon & Index */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl ${gradient} ${color} flex items-center justify-center shadow-inner`}>
            {isComponent ? (
              <Icon className="w-7 h-7" />
            ) : (
              <div className="w-7 h-7">
                {Icon}
              </div>
            )}
          </div>
          {index && <div className="text-premium-label opacity-40">Index {index}</div>}
        </div>

        {/* Bottom Section: Data */}
        <div className="space-y-1">
          <h3 className={`text-premium-h1 tabular-nums ${color}`}>{value}</h3>
          <p className="text-premium-label">{label}</p>
        </div>
      </div>
    </div>
  );

}

interface ModernStatProps {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
  bg?: string;
  trend?: string;
  className?: string;
}

export function ModernStat({ icon: Icon, label, value, color, bg, trend, className }: ModernStatProps) {
  return (
    <div className={`premium-card card-hover group cursor-default p-6! ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black tracking-tight flex items-center">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  yellow: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  red: "bg-destructive/10 text-destructive border border-destructive/20",
  purple: "bg-primary/10 text-primary border border-primary/20",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  return (
    <div className="group relative bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
      {/* Premium Background Layer */}
      <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-linear-to-br ${color === 'blue' ? 'from-blue-600' : color === 'green' ? 'from-emerald-600' : color === 'yellow' ? 'from-amber-600' : color === 'red' ? 'from-rose-600' : 'from-primary'} to-transparent`} />

      {/* Decorative Large Background Icon */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.05] dark:opacity-[0.1] pointer-events-none group-hover:scale-110 transition-transform duration-700">
        <Icon size={140} className="-rotate-12" />
      </div>

      <div className="relative p-7 flex items-center justify-between z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tighter leading-none">{value}</p>
          {trend && (
            <div
              className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${trend.isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
                }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
              <span className="opacity-60">vs last cycle</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



