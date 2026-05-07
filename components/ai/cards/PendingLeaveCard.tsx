
"use client";

import { Calendar, Trash2, Clock, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

interface PendingLeaveCardProps {
    id: string;
    type: string;
    from: string;
    to: string;
    duration: string;
    reason?: string;
    isCancelled: boolean;
    onCancel: (id: string) => void;
}

export const PendingLeaveCard = ({ id, type, from, to, duration, reason, isCancelled, onCancel }: PendingLeaveCardProps) => {
    return (
        <div className={cn(
            "group relative bg-card border border-border/50 rounded-4xl p-6 transition-all overflow-hidden w-full animate-in zoom-in-95 duration-700",
            isCancelled ? "opacity-60 grayscale-[0.3]" : ""
        )}>
            {/* Status Indicator */}
            <div className={cn(
                "absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-[0.2em] border-l border-b",
                isCancelled ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-amber-500/10 border-amber-500/20 text-amber-600 animate-pulse"
            )}>
                {isCancelled ? "Request Voided" : "Awaiting Review"}
            </div>

            <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110",
                    isCancelled ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/10 border-primary/20 text-primary"
                )}>
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Leave Application</p>
                    <h4 className="font-black text-xl text-foreground tracking-tighter uppercase italic">{type}</h4>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/40 relative">
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Duration Period</p>
                    <div className="flex items-center gap-2">
                         <p className="text-xs font-black text-foreground tabular-nums">{moment(from).format("MMM DD")}</p>
                         <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                         <p className="text-xs font-black text-foreground tabular-nums">{moment(to).format("MMM DD")}</p>
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground">{moment(from).format("YYYY")}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Total Units</p>
                    <p className="text-sm font-black text-foreground">{duration} <span className="text-[10px] font-medium text-muted-foreground">Days</span></p>
                </div>
            </div>

            {reason && !isCancelled && (
                <div className="my-5 p-4 rounded-2xl bg-muted/30 border border-border/30 italic text-[11px] font-medium text-foreground/70 leading-relaxed">
                    "{reason}"
                </div>
            )}

            {!isCancelled ? (
                <button
                    onClick={() => onCancel(id)}
                    className="mt-6 w-full py-4 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 group/btn"
                >
                    <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                    Void Application
                </button>
            ) : (
                <div className="mt-6 w-full py-4 rounded-2xl bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-border/50">
                    <Clock className="w-4 h-4" />
                    Action Completed
                </div>
            )}
        </div>
    );
};
