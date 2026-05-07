"use client";

import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_PAYSLIPS } from "@/lib/graphql/payroll/queries";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Calendar, ArrowRight, DollarSign, Sparkles, Eye, EyeOff, LayoutPanelLeft } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { PayslipDetailsModal } from "@/components/payroll/PayslipDetailsModal";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollPage() {
    const { setAssistantOpen, setAssistantPayload, setAssistantQuery } = useStore();
    const [showSalaries, setShowSalaries] = React.useState(false);
    const [selectedPayslip, setSelectedPayslip] = React.useState<any>(null);

    // Queries
    const { data: payslipsData, loading } = useQuery(GET_MY_PAYSLIPS) as any;
    const payslips = payslipsData?.myPayslips || [];
    const latestPayslip = payslips[0];

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-premium-h1">My Ledger</h1>
                    <p className="text-muted-foreground font-medium mt-1">Unified view of your financial disbursements and cycle history.</p>
                </div>
                <Button
                    variant="outline"
                    className="premium-card bg-card/50 backdrop-blur-sm border-border/40 font-black text-[10px] uppercase tracking-widest gap-2"
                    onClick={() => setShowSalaries(!showSalaries)}
                >
                    {showSalaries ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showSalaries ? "Hide Values" : "Show Values"}
                </Button>
            </div>

            {/* Quick Stats / Summary of Latest Payslip */}
            {latestPayslip && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="premium-card lg:col-span-2 overflow-hidden relative group/card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 animate-pulse-slow group-hover/card:scale-150 transition-transform duration-700" />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">{monthNames[latestPayslip.payrollRun.month - 1]} {latestPayslip.payrollRun.year}</h3>
                                    <p className="text-premium-label">LATEST CYCLE</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    className="premium-card bg-card font-black text-[10px] uppercase tracking-widest gap-2 flex-1 md:flex-initial"
                                    onClick={() => setSelectedPayslip(latestPayslip)}
                                >
                                    <LayoutPanelLeft className="w-4 h-4" /> View Details
                                </Button>
                                <Button
                                    className="btn-primary flex-1 md:flex-initial"
                                    onClick={() => {
                                        if (latestPayslip.payslipPdf?.url) {
                                            window.open(latestPayslip.payslipPdf.url, '_blank');
                                        } else {
                                            toast.error("PDF not yet generated for this cycle");
                                        }
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-border/50 relative z-10">
                            <div className="space-y-1">
                                <p className="text-premium-label">Connectivity</p>
                                <p className="text-2xl font-black italic">{latestPayslip.workedDays} Days</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-premium-label">Gross Value</p>
                                <p className="text-2xl font-black italic text-primary">
                                    {showSalaries ? `₹${Number(latestPayslip.grossEarnings).toLocaleString()}` : "₹ ••••••••"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-premium-label">Deductions</p>
                                <p className="text-2xl font-black italic text-destructive">
                                    {showSalaries ? `₹${Number(latestPayslip.totalDeductions).toLocaleString()}` : "₹ •••"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-premium-label">Net Credit</p>
                                <p className="text-2xl font-black italic text-emerald-600">
                                    {showSalaries ? `₹${Number(latestPayslip.netPay).toLocaleString()}` : "₹ ••••••••"}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="premium-card bg-linear-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl shadow-indigo-500/20 relative overflow-hidden group/yield">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover/yield:scale-150 transition-transform duration-700" />
                        <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black mt-2 tracking-tight">Annual Yield</h3>
                                    <p className="text-sm text-indigo-100/70 font-medium">Cumulative net distribution for the active fiscal year.</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-4xl font-black tracking-tighter italic">
                                    {showSalaries ? `₹${payslips.reduce((acc: any, p: any) => acc + Number(p.netPay), 0).toLocaleString()}` : "₹ •••••••••"}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/50 mt-2">Authenticated Total</p>
                            </div>
                            <button className="flex items-center text-sm font-bold gap-2 text-indigo-100 hover:text-white transition-colors whitespace-nowrap group/link">
                                View Tax Projections
                                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* History Table */}
            <div className="space-y-6">
                <h2 className="text-premium-label flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    Historical Archive
                </h2>
                <Card className="premium-card overflow-hidden p-2">
                    <DataTable
                        isLoading={loading}
                        data={payslips}
                        columns={[
                            {
                                key: "payrollRun",
                                label: "Date",
                                render: (_val: any, row: any) => (
                                    <div className="font-bold flex items-center gap-2">
                                        {monthNames[row.payrollRun.month - 1]} {row.payrollRun.year}
                                    </div>
                                )
                            },
                            {
                                key: "grossEarnings",
                                label: "Gross Value",
                                render: (val: any) => (
                                    <span className="font-bold tabular-nums">
                                        {showSalaries ? `₹${Number(val).toLocaleString()}` : "••••••••"}
                                    </span>
                                )
                            },
                            {
                                key: "netPay",
                                label: "Net Distribution",
                                render: (val: any) => (
                                    <span className="font-black text-primary tabular-nums">
                                        {showSalaries ? `₹${Number(val).toLocaleString()}` : "••••••••"}
                                    </span>
                                )
                            },
                            {
                                key: "status",
                                label: "State",
                                render: (val: any) => (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100/50 text-emerald-700 border border-emerald-200 backdrop-blur-sm">
                                        {val}
                                    </span>
                                )
                            },
                            {
                                key: "actions",
                                label: "Operations",
                                render: (_val: any, row: any) => (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            className="font-bold h-10 hover:bg-primary/5"
                                            onClick={() => setSelectedPayslip(row)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="font-bold h-10 hover:bg-primary/5"
                                            onClick={() => {
                                                if (row.payslipPdf?.url) {
                                                    window.open(row.payslipPdf.url, '_blank');
                                                } else {
                                                    toast.error("PDF not yet generated");
                                                }
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>
                                )
                            },
                            {
                                key: "ai",
                                label: "AI Insight",
                                render: (_val: any, row: any) => (
                                    <Button
                                        variant="ghost"
                                        className="font-bold h-10 hover:bg-primary/5 text-primary gap-2"
                                        onClick={() => {
                                            setAssistantPayload({ payslip_id: row.id });
                                            setAssistantQuery(`Explain my payslip for ${monthNames[row.payrollRun.month - 1]} ${row.payrollRun.year} in detail.`);
                                            setAssistantOpen(true);
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Analyze
                                    </Button>
                                )
                            },
                        ]}
                    />
                </Card>
            </div>

            <PayslipDetailsModal 
                isOpen={!!selectedPayslip} 
                onClose={() => setSelectedPayslip(null)} 
                payslip={selectedPayslip} 
            />
        </div>
    );
}
