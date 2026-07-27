
"use client";

import { Calendar, Trash2, Clock, ChevronRight } from "lucide-react";
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
            "group relative bg-card border border-border rounded-xl p-5 transition-all overflow-hidden w-full animate-in zoom-in-95 duration-500",
            isCancelled ? "opacity-60" : ""
        )}>
            {/* Status Indicator */}
            <div className={cn(
                "absolute top-0 right-0 px-3 py-1 rounded-bl-md text-[10px] font-medium border-l border-b",
                isCancelled ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
            )}>
                {isCancelled ? "Cancelled" : "Pending"}
            </div>

            <div className="flex items-start gap-3 mb-5">
                <div className={cn(
                    "w-10 h-10 rounded-md flex items-center justify-center border",
                    isCancelled ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/10 border-primary/20 text-primary"
                )}>
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-medium text-primary/60 mb-0.5">Leave</p>
                    <h4 className="font-semibold text-lg text-foreground">{type}</h4>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border relative">
                <div className="space-y-1">
                    <p className="text-[9px] font-medium text-muted-foreground/60">Duration</p>
                    <div className="flex items-center gap-2">
                         <p className="text-xs font-semibold text-foreground tabular-nums">{moment(from).format("MMM DD")}</p>
                         <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                         <p className="text-xs font-semibold text-foreground tabular-nums">{moment(to).format("MMM DD")}</p>
                    </div>
                    <p className="text-[9px] font-medium text-muted-foreground">{moment(from).format("YYYY")}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[9px] font-medium text-muted-foreground/60">Days</p>
                    <p className="text-sm font-semibold text-foreground">{duration} <span className="text-[10px] font-medium text-muted-foreground">Days</span></p>
                </div>
            </div>

            {reason && !isCancelled && (
                <div className="my-4 p-3 rounded-md bg-muted/30 border border-border text-[11px] font-medium text-foreground/70 leading-relaxed">
                    "{reason}"
                </div>
            )}

            {!isCancelled ? (
                <button
                    onClick={() => onCancel(id)}
                    className="mt-5 w-full py-2.5 rounded-md bg-destructive/5 text-destructive hover:bg-destructive hover:text-white text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 group/btn"
                >
                    <Trash2 className="w-4 h-4" />
                    Cancel leave
                </button>
            ) : (
                <div className="mt-5 w-full py-2.5 rounded-md bg-muted/50 text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 border border-border">
                    <Clock className="w-4 h-4" />
                    Cancelled
                </div>
            )}
        </div>
    );
};
