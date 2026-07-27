
"use client";

import { cn } from "@/lib/utils";
import { Info, Calendar } from "lucide-react";

interface LeaveBalanceCardProps {
    name: string;
    total: string | number;
    used: string | number;
    available: string | number;
    pending?: string | number;
}

export const LeaveBalanceCard = ({ name, total, used, available, pending }: LeaveBalanceCardProps) => {
    const totalNum = typeof total === 'string' ? parseFloat(total) : total;
    const usedNum = typeof used === 'string' ? parseFloat(used) : used;
    const availableNum = typeof available === 'string' ? parseFloat(available) : available;
    const pendingNum = pending ? (typeof pending === 'string' ? parseFloat(pending) : pending) : 0;

    const percentage = Math.min((usedNum / totalNum) * 100, 100);

    return (
        <div className="group relative bg-card border border-border rounded-xl p-5 transition-all overflow-hidden w-full animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-primary/60 mb-0.5">Leave balance</p>
                        <h4 className="font-semibold text-lg text-foreground">{name || "Unnamed Leave"}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-2xl text-primary leading-none tabular-nums">{availableNum}</p>
                    <p className="text-[10px] font-medium text-muted-foreground mt-1">Days left</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[9px] font-medium text-muted-foreground/60">Consumed</p>
                        <p className="text-sm font-semibold text-foreground">{usedNum} <span className="text-[10px] font-medium text-muted-foreground">Units</span></p>
                    </div>
                    {pendingNum > 0 && (
                        <div className="text-center space-y-1">
                            <p className="text-[9px] font-medium text-yellow-600 dark:text-yellow-500">Pending</p>
                            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">{pendingNum} <span className="text-[10px] font-medium opacity-80">Units</span></p>
                        </div>
                    )}
                    <div className="text-right space-y-1">
                        <p className="text-[9px] font-medium text-muted-foreground/60">Total</p>
                        <p className="text-sm font-semibold text-foreground">{totalNum} <span className="text-[10px] font-medium text-muted-foreground">Units</span></p>
                    </div>
                </div>

                <div className="h-2 w-full bg-muted/50 rounded-full border border-border relative overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-2 mt-2">
                    <Info className="w-3 h-3 text-primary/60" />
                    <span>You have used {percentage.toFixed(0)}% of your allocated leave for this year.</span>
                </p>
            </div>
        </div>
    );
};
