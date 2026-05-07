
"use client";

import { Banknote, TrendingUp, TrendingDown, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayrollCardProps {
    month: string;
    year: string;
    gross: string;
    net: string;
    deductions: string;
    worked_days?: string;
    lop?: string;
    earnings_breakdown?: string;
    deductions_breakdown?: string;
}

export const PayrollCard = ({
    month,
    year,
    gross,
    net,
    deductions,
    worked_days,
    lop,
    earnings_breakdown,
    deductions_breakdown
}: PayrollCardProps) => {
    const parseBreakdown = (str?: string) => {
        if (!str) return [];
        return str.replace(/[{}]/g, '').split(',').map(s => {
            const [k, v] = s.split(':').map(x => x.trim());
            return { k, v };
        }).filter(item => item.k);
    };

    const earnings = parseBreakdown(earnings_breakdown);
    const deductionsList = parseBreakdown(deductions_breakdown);

    return (
        <div className="relative overflow-hidden bg-card border border-border/50 rounded-4xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-700 w-full group/payroll">
            {/* Aesthetic background elements */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-0.5">Salary Insights</p>
                        <h4 className="font-black text-lg tracking-tight">{month} {year}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Processed</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-3xl bg-muted/30 border border-border/40 relative overflow-hidden group/stat">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/stat:scale-110 transition-transform">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Gross Earnings</p>
                    <p className="text-sm font-black tracking-tight">{gross}</p>
                </div>
                <div className="p-4 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden group/stat">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/70 mb-1">Net Payable</p>
                    <p className="text-lg font-black tracking-tighter">{net}</p>
                </div>
                <div className="p-4 rounded-3xl bg-muted/30 border border-border/40 relative overflow-hidden group/stat">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/stat:scale-110 transition-transform text-rose-500">
                        <TrendingDown className="w-8 h-8" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deductions</p>
                    <p className="text-sm font-black tracking-tight text-rose-600 dark:text-rose-400">{deductions}</p>
                </div>
            </div>

            {/* Attendance & Pro-rata */}
            {(worked_days || lop) && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/20 border border-border/30">
                        <Clock className="w-4 h-4 text-muted-foreground/60" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Worked Days</p>
                            <p className="text-xs font-bold leading-none">{worked_days} Days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/20 border border-border/30">
                        <CalendarDays className="w-4 h-4 text-rose-500/60" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">LOP Days</p>
                            <p className="text-xs font-bold leading-none text-rose-600">{lop} Days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdown Sections */}
            <div className="space-y-4 pt-2">
                {earnings.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 flex items-center gap-2">
                            Earnings Breakdown
                            <div className="h-[1px] flex-1 bg-border/40" />
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                            {earnings.map((e, i) => (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0 group/line">
                                    <span className="text-xs font-semibold text-foreground/70 group-hover/line:text-primary transition-colors">{e.k}</span>
                                    <span className="text-xs font-black">{e.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {deductionsList.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-500/70 flex items-center gap-2">
                            Deductions Breakdown
                            <div className="h-[1px] flex-1 bg-rose-500/10" />
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                            {deductionsList.map((d, i) => (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0 group/line">
                                    <span className="text-xs font-semibold text-muted-foreground group-hover/line:text-rose-500 transition-colors">{d.k}</span>
                                    <span className="text-xs font-bold text-rose-600/80">{d.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
