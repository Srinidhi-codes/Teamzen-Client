"use client";

import { Sparkles, ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
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
            <div className="h-[160px] w-full bg-muted/20 animate-pulse rounded-xl border border-border p-5 flex flex-col justify-between">
                <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/40" />
                    <div className="space-y-2 mt-1 flex-1">
                        <div className="h-2 w-20 bg-muted/40 rounded" />
                        <div className="h-3 w-full bg-muted/40 rounded" />
                    </div>
                </div>
                <div className="h-9 w-full bg-muted/40 rounded-md" />
            </div>
        );
    }

    const isWarning = type === "warning" || type === "anomaly";
    const isStats = type === "stats";

    const handleAskAI = () => {
        setAssistantQuery(query);
        setAssistantOpen(true);
    };

    return (
        <div
            className={cn(
                "relative bg-card border border-border rounded-xl p-5 flex flex-col justify-between h-full min-h-[160px]",
                isWarning && "border-amber-500/20"
            )}
        >
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            isWarning
                                ? "bg-amber-500/10 text-amber-600"
                                : isStats
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-primary/10 text-primary"
                        )}
                    >
                        {isWarning ? (
                            <AlertCircle className="w-4 h-4" />
                        ) : isStats ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                    </div>
                    <h4
                        className={cn(
                            "text-sm font-medium",
                            isWarning
                                ? "text-amber-600"
                                : isStats
                                    ? "text-emerald-600"
                                    : "text-muted-foreground"
                        )}
                    >
                        {title || "Insight"}
                    </h4>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {message}
                </p>
            </div>

            <button
                onClick={handleAskAI}
                className={cn(
                    "mt-4 flex items-center justify-between w-full h-9 px-3 rounded-md border text-sm font-medium transition-colors",
                    isWarning
                        ? "bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/10 text-amber-700"
                        : "bg-primary/5 border-primary/15 hover:bg-primary/10 text-primary"
                )}
            >
                <span>Ask assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};
