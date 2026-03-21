"use client";

import { Sparkles, ArrowRight, TrendingUp, AlertCircle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";

interface AIInsightCardProps {
    title: string;
    message: string;
    type: string;
    query: string;
    isLoading?: boolean;
}

export const AIInsightCard = ({ title, message, type, query, isLoading }: AIInsightCardProps) => {
    const { setAssistantOpen, setAssistantQuery } = useStore();

    if (isLoading) {
        return (
            <div className="h-[180px] w-full bg-muted/20 animate-pulse rounded-4xl border border-border/50 p-6 flex flex-col justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted/40" />
                    <div className="space-y-2 mt-1 flex-1">
                        <div className="h-2 w-20 bg-muted/40 rounded-full" />
                        <div className="h-4 w-full bg-muted/40 rounded-full" />
                    </div>
                </div>
                <div className="h-10 w-full bg-muted/40 rounded-2xl" />
            </div>
        );
    }

    const isWarning = type === 'warning' || type === 'anomaly';
    const isStats = type === 'stats';

    const handleAskAI = () => {
        setAssistantQuery(query);
        setAssistantOpen(true);
    };

    return (
        <div className={cn(
            "relative group overflow-hidden bg-card border border-border/50 rounded-4xl p-6 shadow-md hover:shadow-xl transition-all duration-500 hover:translate-y-[-4px] flex flex-col justify-between h-full min-h-[180px]",
            "before:absolute before:inset-0 before:bg-linear-to-br before:opacity-[0.02] before:pointer-events-none",
            isWarning ? "before:from-amber-600 before:to-transparent border-amber-500/20" : "before:from-primary before:to-transparent"
        )}>
            {/* Ambient background glow */}
            <div className={cn(
                "absolute -right-16 -top-16 w-32 h-32 blur-[60px] rounded-full pointer-events-none transition-opacity duration-1000 group-hover:opacity-40",
                isWarning ? "bg-amber-500 opacity-20" : isStats ? "bg-emerald-500 opacity-20" : "bg-primary opacity-20"
            )} />

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110",
                        isWarning ? "bg-amber-600/10 border-amber-500/20 text-amber-600" : isStats ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-600" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        {isWarning ? <AlertCircle className="w-5 h-5 animate-pulse" /> : isStats ? <TrendingUp className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <div className="space-y-0.5">
                        <h4 className={cn(
                            "font-black text-[10px] uppercase tracking-[0.2em] transition-colors duration-500",
                            isWarning ? "text-amber-600" : isStats ? "text-emerald-600 font-bold" : "text-primary/70"
                        )}>{title || "AI INSIGHT"}</h4>
                    </div>
                </div>

                <p className="text-sm font-medium text-foreground/80 leading-relaxed line-clamp-2">
                    {message}
                </p>
            </div>

            <button
                onClick={handleAskAI}
                className={cn(
                    "mt-4 flex items-center justify-between w-full p-1 pl-4 rounded-2xl border transition-all duration-300",
                    isWarning 
                        ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30 text-amber-600" 
                        : "bg-primary/5 border-primary/10 hover:border-primary/30 text-primary"
                )}
            >
                <span className="text-[10px] font-black uppercase tracking-widest">Ask AI Now</span>
                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                    isWarning ? "bg-amber-500 text-white" : "bg-primary text-white"
                )}>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1" />
                </div>
            </button>
        </div>
    );
};
