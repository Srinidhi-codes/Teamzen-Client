
"use client";

import { Sparkles, BookOpen, TrendingUp, AlertTriangle, Zap, ArrowRight, MessageSquare } from "lucide-react";
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
            "group relative overflow-hidden bg-card border border-border/50 rounded-4xl p-6 shadow-xl transition-all hover:shadow-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-1000",
            "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-[0.03] before:pointer-events-none",
            isWarning ? "before:from-amber-600 before:to-transparent border-amber-500/20" : isPolicy ? "before:from-emerald-600 before:to-transparent border-emerald-500/20" : "before:from-primary before:to-transparent"
        )}>
            {/* Ambient background glow */}
            <div className={cn(
                "absolute -right-20 -top-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none transition-opacity duration-1000",
                isWarning ? "bg-amber-500 opacity-20" : isPolicy ? "bg-emerald-500 opacity-20" : "bg-primary opacity-20"
            )} />

            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110",
                        isWarning ? "bg-amber-600/10 border-amber-500/20 text-amber-600" : isPolicy ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-600" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        {isWarning ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : isPolicy ? <BookOpen className="w-6 h-6" /> : isStats ? <TrendingUp className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
                            isWarning ? "text-amber-600" : isPolicy ? "text-emerald-600" : "text-primary/60"
                        )}>{type || "AI Intelligence"}</p>
                        <h4 className="font-black text-lg text-foreground tracking-tighter uppercase italic leading-none">{title}</h4>
                    </div>
                </div>
                
                {topic && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-muted/50 border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                         <div className={cn("w-1 h-1 rounded-full", isWarning ? "bg-amber-500" : isPolicy ? "bg-emerald-500" : "bg-primary")} />
                         {topic}
                    </div>
                )}
            </div>

            <div className="relative">
                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent pr-2 mb-6">
                    <p className="text-[14px] font-medium text-foreground/80 leading-relaxed whitespace-pre-line group-hover:text-foreground transition-colors duration-300">
                        {message}
                    </p>
                </div>
                
                {parsedStats.length > 0 && (
                    <div className="pt-6 border-t border-border/40 grid grid-cols-2 gap-6 relative">
                        {parsedStats.map((s, i) => (
                            <div key={i} className="group/stat">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 group-hover/stat:text-primary/60 transition-colors">{s.label}</p>
                                <p className="text-sm font-black text-foreground tabular-nums tracking-tight">{s.value}</p>
                            </div>
                        ))}
                        
                        <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                             <Zap className="w-8 h-8 text-primary/10" />
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-6 flex items-center justify-end">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary/70 transition-colors">
                    <span>Generated Insight</span>
                    <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};
