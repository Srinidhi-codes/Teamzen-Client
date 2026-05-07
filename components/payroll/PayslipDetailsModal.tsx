"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { 
    Download, 
    Sparkles, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    CalendarDays,
    ArrowRight
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface PayslipDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    payslip: any;
}

export function PayslipDetailsModal({ isOpen, onClose, payslip }: PayslipDetailsModalProps) {
    const { setAssistantOpen, setAssistantPayload, setAssistantQuery } = useStore();

    if (!payslip) return null;

    const earnings = payslip.components?.filter((c: any) => c.componentType === 'earning') || [];
    const deductions = payslip.components?.filter((c: any) => c.componentType === 'deduction') || [];

    const handleAnalyze = () => {
        setAssistantPayload({ payslip_id: payslip.id });
        setAssistantQuery(`Explain my payslip for ${monthNames[payslip.payrollRun.month - 1]} ${payslip.payrollRun.year} in detail. Why is my net pay ₹${Number(payslip.netPay).toLocaleString()}?`);
        setAssistantOpen(true);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-none sm:rounded-[2.5rem] rounded-none h-full sm:h-auto shadow-3xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
                
                <DialogHeader className="p-6 sm:p-8 pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-4">
                        <div className="flex flex-col items-center sm:items-start">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-3 animate-in fade-in slide-in-from-left-4 duration-500">
                                <Sparkles className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Financial Insight</span>
                            </div>
                            <DialogTitle className="text-2xl sm:text-3xl font-black italic tracking-tight leading-none">
                                {monthNames[payslip.payrollRun.month - 1]} {payslip.payrollRun.year}
                            </DialogTitle>
                            <p className="text-muted-foreground font-medium mt-1 text-xs">Computation cycle #{payslip.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-premium-label mb-0 sm:mb-1">Net Distribution</p>
                            <p className="text-3xl sm:text-4xl font-black italic text-primary tracking-tighter">
                                ₹{Number(payslip.netPay).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/40">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Gross</p>
                            <p className="text-xs sm:text-sm font-black italic">₹{Number(payslip.grossEarnings).toLocaleString()}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/40">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deductions</p>
                            <p className="text-xs sm:text-sm font-black italic text-destructive">₹{Number(payslip.totalDeductions).toLocaleString()}</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/40">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Worked</p>
                            <p className="text-xs sm:text-sm font-black italic">{payslip.workedDays} Days</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/40">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">LOP</p>
                            <p className="text-xs sm:text-sm font-black italic text-amber-600">{payslip.lopDays} Days</p>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {/* Earnings */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Earnings</h4>
                            </div>
                            <div className="space-y-2">
                                {earnings.map((e: any) => (
                                    <div key={e.id} className="flex justify-between items-center group/item">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground/80 group-hover/item:text-primary transition-colors">{e.componentName}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">{e.componentCode}</span>
                                        </div>
                                        <span className="text-sm font-black">₹{Number(e.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                    <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Deductions</h4>
                            </div>
                            <div className="space-y-2">
                                {deductions.map((d: any) => (
                                    <div key={d.id} className="flex justify-between items-center group/item">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground/80 group-hover/item:text-rose-500 transition-colors">{d.componentName}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">{d.componentCode}</span>
                                        </div>
                                        <span className="text-sm font-black text-rose-600">₹{Number(d.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                                {deductions.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic font-medium">No statutory deductions recorded.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Call to Action */}
                    <Card className="p-5 sm:p-6 bg-primary/5 border border-primary/20 rounded-3xl sm:rounded-4xl relative overflow-hidden group">
                        <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 relative z-10">
                            <div className="space-y-1.5 text-center">
                                <h4 className="text-base sm:text-lg font-black italic flex items-center gap-2 justify-center">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
                                    AI Salary Explainer
                                </h4>
                                <p className="text-[11px] sm:text-sm text-muted-foreground font-medium max-w-sm">
                                    Confused about the deductions or LOP? Let our AI assistant break down exactly how your salary was calculated.
                                </p>
                            </div>
                            <Button onClick={handleAnalyze} className="btn-primary w-full sm:w-auto px-8 py-5 h-auto rounded-2xl group-hover:scale-105 transition-transform text-xs uppercase tracking-widest font-black">
                                Analyze Breakdown
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                    </Card>
                </div>

                <div className="p-6 sm:p-8 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <Button variant="ghost" className="w-full sm:w-auto font-black text-[10px] uppercase tracking-widest gap-2" onClick={onClose}>
                        Close Ledger
                    </Button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="premium-card bg-card font-black text-[10px] uppercase tracking-widest gap-2 flex-1 sm:flex-initial justify-center"
                            onClick={() => {
                                if (payslip.payslipPdf?.url) {
                                    window.open(payslip.payslipPdf.url, '_blank');
                                }
                            }}
                        >
                            <Download className="w-4 h-4" /> Export PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
