
"use client";

import { Calendar, Trash2 } from "lucide-react";
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
            "bg-linear-to-br from-primary/10 via-card to-card border-b border-border/50 rounded-3xl p-6 space-y-5 animate-in zoom-in-95 duration-500 w-full group/pending",
            isCancelled ? "opacity-50 border-destructive/20 grayscale-[0.5]" : ""
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-12 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                        isCancelled ? "bg-destructive/10 border-destructive/20 text-destructive rotate-12" : "bg-primary/10 border-primary/20 text-primary"
                    )}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                            {isCancelled ? "Voided Request" : "Pending Request"}
                        </p>
                        <h4 className="font-black text-lg text-foreground tracking-tight italic uppercase">{type}</h4>
                    </div>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    isCancelled ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-amber-500/10 border-amber-500/20 text-amber-600 shadow-sm"
                )}>
                    {isCancelled ? "Cancelled" : "Reviewing"}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ">From - To</p>
                    <p className="text-xs font-bold text-foreground leading-none mt-1 border bg-slate-300 rounded-xl p-2">{moment(from).format("DD/MM/YYYY")} {moment(to).format("DD/MM/YYYY")}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Duration</p>
                    <p className="text-xs font-bold text-foreground mt-1">{duration} Operational Days</p>
                </div>
            </div>

            {reason && (
                <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">
                    "{reason}"
                </p>
            )}

            {!isCancelled && (
                <button
                    onClick={() => onCancel(id)}
                    className="w-full py-4 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                    Void Request
                </button>
            )}
        </div>
    );
};
