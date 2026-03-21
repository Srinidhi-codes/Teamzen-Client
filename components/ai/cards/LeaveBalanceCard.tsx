
"use client";

import { cn } from "@/lib/utils";
import { TreePine, Info, Calendar } from "lucide-react";

interface LeaveBalanceCardProps {
    name: string;
    total: string | number;
    used: string | number;
    available: string | number;
}

export const LeaveBalanceCard = ({ name, total, used, available }: LeaveBalanceCardProps) => {
    const totalNum = typeof total === 'string' ? parseFloat(total) : total;
    const usedNum = typeof used === 'string' ? parseFloat(used) : used;
    const availableNum = typeof available === 'string' ? parseFloat(available) : available;

    const percentage = Math.min((usedNum / totalNum) * 100, 100);

    return (
        <div className="group relative bg-card border border-border/50 rounded-4xl p-6 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden w-full animate-in zoom-in-95 duration-500">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">Leave Entitlement</p>
                        <h4 className="font-black text-xl text-foreground tracking-tighter uppercase italic">{name || "Unnamed Leave"}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-3xl text-primary leading-none tabular-nums">{availableNum}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Days Left</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Consumed</p>
                        <p className="text-sm font-bold text-foreground">{usedNum} <span className="text-[10px] font-medium text-muted-foreground">Units</span></p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total Allotment</p>
                        <p className="text-sm font-bold text-foreground">{totalNum} <span className="text-[10px] font-medium text-muted-foreground">Units</span></p>
                    </div>
                </div>

                <div className="h-4 w-full bg-muted/50 rounded-full p-1 border border-border/50 relative overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-1500 shadow-md shadow-primary/20"
                        style={{ width: `${percentage}%` }}
                    />

                    {/* Tick for marker */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none opacity-20">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-px h-1 bg-foreground" />
                        ))}
                    </div>
                </div>

                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2 mt-2">
                    <Info className="w-3 h-3 text-primary/60" />
                    <span>You have used {percentage.toFixed(0)}% of your allocated leave for this year.</span>
                </p>
            </div>
        </div>
    );
};
