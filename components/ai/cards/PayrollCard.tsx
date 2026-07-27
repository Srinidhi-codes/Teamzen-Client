
"use client";

import { Banknote, Clock, CalendarDays } from "lucide-react";

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
        <div className="relative overflow-hidden bg-card border border-border rounded-xl p-5 space-y-5 animate-in fade-in zoom-in-95 duration-500 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-primary/70 mb-0.5">Payslip</p>
                        <h4 className="font-semibold text-lg tracking-tight">{month} {year}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-medium">Processed</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-md bg-muted/30 border border-border relative overflow-hidden">
                    <p className="text-[9px] font-medium text-muted-foreground mb-1">Gross</p>
                    <p className="text-sm font-semibold tracking-tight">{gross}</p>
                </div>
                <div className="p-3 rounded-md bg-primary text-primary-foreground relative overflow-hidden">
                    <p className="text-[9px] font-medium text-primary-foreground/70 mb-1">Net</p>
                    <p className="text-lg font-semibold tracking-tight">{net}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/30 border border-border relative overflow-hidden">
                    <p className="text-[9px] font-medium text-muted-foreground mb-1">Deductions</p>
                    <p className="text-sm font-semibold tracking-tight text-rose-600 dark:text-rose-400">{deductions}</p>
                </div>
            </div>

            {/* Attendance & Pro-rata */}
            {(worked_days || lop) && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/20 border border-border">
                        <Clock className="w-4 h-4 text-muted-foreground/60" />
                        <div>
                            <p className="text-[8px] font-medium text-muted-foreground/60 leading-none mb-1">Worked days</p>
                            <p className="text-xs font-semibold leading-none">{worked_days} Days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/20 border border-border">
                        <CalendarDays className="w-4 h-4 text-rose-500/60" />
                        <div>
                            <p className="text-[8px] font-medium text-muted-foreground/60 leading-none mb-1">LOP days</p>
                            <p className="text-xs font-semibold leading-none text-rose-600">{lop} Days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdown Sections */}
            <div className="space-y-4 pt-1">
                {earnings.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-medium text-muted-foreground/80 flex items-center gap-2">
                            Earnings
                            <div className="h-px flex-1 bg-border" />
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                            {earnings.map((e, i) => (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                                    <span className="text-xs font-medium text-foreground/70">{e.k}</span>
                                    <span className="text-xs font-semibold">{e.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {deductionsList.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-medium text-rose-500/70 flex items-center gap-2">
                            Deductions
                            <div className="h-px flex-1 bg-rose-500/10" />
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                            {deductionsList.map((d, i) => (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                                    <span className="text-xs font-medium text-muted-foreground">{d.k}</span>
                                    <span className="text-xs font-semibold text-rose-600/80">{d.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
