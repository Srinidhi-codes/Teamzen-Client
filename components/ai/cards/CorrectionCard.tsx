"use client";

import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

interface CorrectionCardProps {
    id: string;
    date: string;
    login?: string;
    suggested_logout?: string;
    reason?: string;
    isConfirmed?: boolean;
    onConfirm: (id: string, suggestedLogout?: string) => void;
}

export const CorrectionCard = ({
    id,
    date,
    login,
    suggested_logout,
    reason,
    isConfirmed,
    onConfirm,
}: CorrectionCardProps) => {
    return (
        <div
            className={cn(
                "group relative bg-card border border-border rounded-xl p-5 transition-all overflow-hidden w-full animate-in zoom-in-95 duration-500",
                isConfirmed ? "opacity-60" : "border-amber-500/20"
            )}
        >
            <div
                className={cn(
                    "absolute top-0 right-0 px-3 py-1 rounded-bl-md text-[10px] font-medium border-l border-b",
                    isConfirmed
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                )}
            >
                {isConfirmed ? "Confirmed" : "Pending"}
            </div>

            <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-md flex items-center justify-center border bg-amber-500/10 border-amber-500/20 text-amber-600">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-medium text-amber-600/80 mb-0.5">
                        Attendance correction
                    </p>
                    <h4 className="font-semibold text-lg text-foreground">
                        {date ? moment(date).format("MMM D, YYYY") : "Missed checkout"}
                    </h4>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                <div className="space-y-1">
                    <p className="text-[9px] font-medium text-muted-foreground/60">Login</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                        {login || "—"}
                    </p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[9px] font-medium text-muted-foreground/60">
                        Suggested logout
                    </p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                        {suggested_logout || "—"}
                    </p>
                </div>
            </div>

            {reason && !isConfirmed && (
                <div className="my-4 p-3 rounded-md bg-muted/30 border border-border text-[11px] font-medium text-foreground/70 leading-relaxed line-clamp-3">
                    {reason}
                </div>
            )}

            {!isConfirmed ? (
                <button
                    type="button"
                    onClick={() => onConfirm(id, suggested_logout)}
                    className="mt-5 w-full py-2.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm suggested logout
                </button>
            ) : (
                <div className="mt-5 w-full py-2.5 rounded-md bg-muted/50 text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 border border-border">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmed
                </div>
            )}
        </div>
    );
};
