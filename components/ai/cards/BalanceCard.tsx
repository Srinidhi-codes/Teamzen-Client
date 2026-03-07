
"use client";

import { Calendar } from "lucide-react";

interface BalanceCardProps {
    name: string;
    total: string;
    used: string;
    available: string;
}

export const BalanceCard = ({ name, total, used, available }: BalanceCardProps) => {
    const usedNum = parseFloat(used) || 0;
    const totalNum = parseFloat(total) || 1;
    const percent = Math.min((usedNum / totalNum) * 100, 100);

    return (
        <div className="bg-linear-to-br from-primary/10 via-card to-card border-b border-border/50 rounded-3xl p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Leave balance</p>
                        <h4 className="font-black text-lg text-foreground tracking-tight italic uppercase">{name}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 text-right">Available</p>
                    <p className="font-black text-2xl text-primary leading-none">{available} <span className="text-[10px] text-muted-foreground">Units</span></p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Depleted: {used}</span>
                    <span>Allocation: {total}</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5">
                    <div
                        className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 shadow-md shadow-primary/20"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
