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



