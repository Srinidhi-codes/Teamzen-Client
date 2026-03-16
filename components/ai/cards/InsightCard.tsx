
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
            "relative overflow-hidden bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full group/insight",
            "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-[0.03] before:pointer-events-none",
            isWarning ? "before:from-amber-500 before:to-transparent border-amber-500/20" : "before:from-primary before:to-transparent"
        )}>
            {/* Ambient background glow */}
            <div className={cn(
                "absolute -right-20 -top-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20",
                isWarning ? "bg-amber-500" : "bg-primary"
            )} />

            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner",
                    isWarning ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-primary/10 border-primary/20 text-primary"
                )}>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                    <h4 className={cn(
                        "font-black text-[10px] uppercase tracking-[0.2em]",
                        isWarning ? "text-amber-600" : "text-primary/70"
                    )}>{title || "AI INTELLIGENCE"}</h4>
                    <div className="h-1 w-8 rounded-full bg-current opacity-20" />
                </div>
            </div>

            <p className="text-[14px] font-medium text-foreground/90 leading-relaxed italic pr-4">
                "{message}"
            </p>

            {stats && (
                <div className="pt-5 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/40 relative">
                    {stats.replace(/[{}]/g, '').split(',').map((s: string, i: number) => {
                        const firstColonIndex = s.indexOf(':');
                        const k = firstColonIndex !== -1 ? s.slice(0, firstColonIndex).trim() : s.trim();
                        const v = firstColonIndex !== -1 ? s.slice(firstColonIndex + 1).trim() : '';
                        if (!k) return null;
                        return (
                            <div key={i} className="group/stat transition-transform duration-300 hover:translate-x-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{k}</p>
                                <p className="text-sm font-bold text-foreground tracking-tight">{v}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
