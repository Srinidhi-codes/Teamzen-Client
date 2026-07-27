
"use client";

import { Sparkles, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
    title: string;
    message: string;
    type: string;
    stats?: string;
    topic?: string;
}

export const InsightCard = ({ title, message, type, stats, topic }: InsightCardProps) => {
    const isWarning = type === 'warning' || type === 'anomaly';
    const isPolicy = topic?.toLowerCase().includes('policy') || type === 'policy';
    const isStats = type === 'stats' || !!stats;

    // Parse stats if they exist
    const parsedStats = stats ? stats.replace(/[{}]/g, '').split(',').map((s: string) => {
        const firstColonIndex = s.indexOf(':');
        return {
            label: firstColonIndex !== -1 ? s.slice(0, firstColonIndex).trim() : s.trim(),
            value: firstColonIndex !== -1 ? s.slice(firstColonIndex + 1).trim() : ''
        };
    }).filter(s => s.label) : [];

    return (
        <div className={cn(
            "group relative overflow-hidden bg-card border border-border rounded-xl p-5 transition-all w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
            isWarning ? "border-amber-500/20" : isPolicy ? "border-emerald-500/20" : ""
        )}>
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-md flex items-center justify-center border",
                        isWarning ? "bg-amber-600/10 border-amber-500/20 text-amber-600" : isPolicy ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-600" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        {isWarning ? <AlertTriangle className="w-5 h-5" /> : isPolicy ? <BookOpen className="w-5 h-5" /> : isStats ? <TrendingUp className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className={cn(
                            "text-[10px] font-medium mb-0.5",
                            isWarning ? "text-amber-600" : isPolicy ? "text-emerald-600" : "text-primary/60"
                        )}>{type || "Insight"}</p>
                        <h4 className="font-semibold text-lg text-foreground leading-none">{title}</h4>
                    </div>
                </div>
                
                {topic && (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/50 border border-border text-[10px] font-medium text-muted-foreground/80">
                         <div className={cn("w-1 h-1 rounded-full", isWarning ? "bg-amber-500" : isPolicy ? "bg-emerald-500" : "bg-primary")} />
                         {topic}
                    </div>
                )}
            </div>

            <div className="relative">
                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent pr-2 mb-5">
                    <p className="text-[14px] font-medium text-foreground/80 leading-relaxed whitespace-pre-line">
                        {message}
                    </p>
                </div>
                
                {parsedStats.length > 0 && (
                    <div className="pt-5 border-t border-border grid grid-cols-2 gap-4 relative">
                        {parsedStats.map((s, i) => (
                            <div key={i}>
                                <p className="text-[9px] font-medium text-muted-foreground/60 mb-1">{s.label}</p>
                                <p className="text-sm font-semibold text-foreground tabular-nums">{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
        </div>
    );
};
