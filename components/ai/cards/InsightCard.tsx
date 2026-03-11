
"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
    title: string;
    message: string;
    type: string;
    stats?: string;
}

export const InsightCard = ({ title, message, type, stats }: InsightCardProps) => {
    const isWarning = type === 'warning' || type === 'anomaly';

    return (
        <div className={cn(
            "bg-linear-to-br border-b border-border/50 rounded-3xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-500 w-full group/insight",
            isWarning ? "from-amber-500/10 via-card to-card" : "from-primary/10 via-card to-card"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center border",
                    isWarning ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-primary/10 border-primary/20 text-primary"
                )}>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className={cn(
                    "font-black text-[10px] uppercase tracking-widest",
                    isWarning ? "text-amber-600" : "text-muted-foreground"
                )}>{title || "AI INTELLIGENCE"}</h4>
            </div>
            <p className="text-[13px] font-bold text-foreground leading-relaxed italic opacity-90">
                {message}
            </p>
            {stats && (
                <div className="pt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-border">
                    {stats.split(',').map((s: string, i: number) => {
                        const [k, v] = s.split(':').map(str => str.trim());
                        return (
                            <div key={i}>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{k}</p>
                                <p className="text-sm font-black text-foreground italic">{v}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
