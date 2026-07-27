"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    Download, 
    TrendingUp, 
    TrendingDown, 
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
            <DialogContent className="max-w-2xl overflow-hidden bg-card border border-border sm:rounded-xl rounded-none h-full sm:h-auto py-3">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Payslip details</p>
                            <DialogTitle className="text-xl font-semibold tracking-tight">
                                {monthNames[payslip.payrollRun.month - 1]} {payslip.payrollRun.year}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">Payslip #{payslip.id.slice(-6)}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-sm text-muted-foreground mb-0.5">Net pay</p>
                            <p className="text-2xl font-semibold text-primary tabular-nums">
                                ₹{Number(payslip.netPay).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-xs text-muted-foreground mb-0.5">Gross</p>
                            <p className="text-sm font-medium tabular-nums">₹{Number(payslip.grossEarnings).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-xs text-muted-foreground mb-0.5">Deductions</p>
                            <p className="text-sm font-medium tabular-nums text-destructive">₹{Number(payslip.totalDeductions).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-xs text-muted-foreground mb-0.5">Days worked</p>
                            <p className="text-sm font-medium tabular-nums">{payslip.workedDays}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-xs text-muted-foreground mb-0.5">LOP days</p>
                            <p className="text-sm font-medium tabular-nums text-amber-600">{payslip.lopDays}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-sm font-medium">Earnings</h4>
                            </div>
                            <div className="space-y-2">
                                {earnings.map((e: any) => (
                                    <div key={e.id} className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-foreground">{e.componentName}</span>
                                            <span className="text-xs text-muted-foreground">{e.componentCode}</span>
                                        </div>
                                        <span className="text-sm font-medium tabular-nums">₹{Number(e.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-sm font-medium">Deductions</h4>
                            </div>
                            <div className="space-y-2">
                                {deductions.map((d: any) => (
                                    <div key={d.id} className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-foreground">{d.componentName}</span>
                                            <span className="text-xs text-muted-foreground">{d.componentCode}</span>
                                        </div>
                                        <span className="text-sm font-medium tabular-nums text-rose-600">₹{Number(d.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                                {deductions.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No deductions recorded.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Need help understanding this payslip?</h4>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Ask the AI assistant to explain deductions, LOP, or how your net pay was calculated.
                                </p>
                            </div>
                            <Button onClick={handleAnalyze} className="h-9 rounded-md btn-primary shrink-0 text-sm font-medium">
                                Explain payslip
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <Button variant="ghost" className="h-9 rounded-md text-sm font-medium" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="outline"
                        className="h-9 rounded-md text-sm font-medium gap-2"
                        onClick={() => {
                            if (payslip.payslipPdf?.url) {
                                window.open(payslip.payslipPdf.url, '_blank');
                            }
                        }}
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
