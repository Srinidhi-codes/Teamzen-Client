"use client";

import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_PAYSLIPS } from "@/lib/graphql/payroll/queries";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Calendar, Eye, EyeOff, Banknote } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { PayslipDetailsModal } from "@/components/payroll/PayslipDetailsModal";
import { PageHeader } from "@/components/common/PageHeader";
import { ModernStat } from "@/components/common/Stats";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollPage() {
    const { setAssistantOpen, setAssistantPayload, setAssistantQuery } = useStore();
    const [showSalaries, setShowSalaries] = React.useState(false);
    const [selectedPayslip, setSelectedPayslip] = React.useState<any>(null);

    const { data: payslipsData, loading } = useQuery(GET_MY_PAYSLIPS) as any;
    const payslips = payslipsData?.myPayslips || [];
    const latestPayslip = payslips[0];

    return (
        <div className="p-4 sm:p-6 space-y-8 animate-fade-in">
            <PageHeader
                eyebrow="Salary"
                title="My Payroll"
                description="View payslips and download PDFs for each pay period."
                actions={
                    <Button
                        variant="outline"
                        className="h-9 rounded-md text-sm font-medium gap-2"
                        onClick={() => setShowSalaries(!showSalaries)}
                    >
                        {showSalaries ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showSalaries ? "Hide" : "Reveal"}
                    </Button>
                }
            />

            {latestPayslip && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2 rounded-xl border border-border flex flex-col">
                        <div className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-9 sm:h-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                                    <Calendar className="w-5 h-5 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-lg font-semibold text-foreground">{monthNames[latestPayslip.payrollRun.month - 1]} {latestPayslip.payrollRun.year}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Latest payslip</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <Button
                                    variant="outline"
                                    className="h-10 sm:h-9 rounded-xl sm:rounded-lg text-sm font-bold sm:font-medium flex-1 md:flex-initial"
                                    onClick={() => setSelectedPayslip(latestPayslip)}
                                >
                                    Details
                                </Button>
                                <Button
                                    className="h-10 sm:h-9 rounded-xl sm:rounded-lg btn-primary flex-1 md:flex-initial text-sm font-bold sm:font-medium shadow-md shadow-primary/20"
                                    onClick={() => {
                                        if (latestPayslip.payslipPdf?.url) {
                                            window.open(latestPayslip.payslipPdf.url, '_blank');
                                        } else {
                                            toast.error("PDF not yet generated for this cycle");
                                        }
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-4 sm:p-6 pt-0 sm:pt-4 sm:border-t border-border mt-auto">
                            <div className="bg-muted/20 sm:bg-transparent border border-border/50 sm:border-none rounded-xl sm:rounded-none p-3 sm:p-0 space-y-1">
                                <p className="text-[9px] sm:text-sm text-muted-foreground uppercase sm:normal-case font-bold sm:font-normal tracking-wider sm:tracking-normal line-clamp-1">Days worked</p>
                                <p className="text-xs sm:text-xl font-bold sm:font-semibold tabular-nums text-foreground tracking-tighter sm:tracking-tight truncate">{latestPayslip.workedDays}</p>
                            </div>
                            <div className="bg-muted/20 sm:bg-transparent border border-border/50 sm:border-none rounded-xl sm:rounded-none p-3 sm:p-0 space-y-1">
                                <p className="text-[9px] sm:text-sm text-muted-foreground uppercase sm:normal-case font-bold sm:font-normal tracking-wider sm:tracking-normal line-clamp-1">Gross pay</p>
                                <p className="text-xs sm:text-xl font-bold sm:font-semibold tabular-nums text-foreground tracking-tighter sm:tracking-tight truncate">
                                    {showSalaries ? `₹${Number(latestPayslip.grossEarnings).toLocaleString()}` : "₹ ••••••••"}
                                </p>
                            </div>
                            <div className="bg-muted/20 sm:bg-transparent border border-border/50 sm:border-none rounded-xl sm:rounded-none p-3 sm:p-0 space-y-1">
                                <p className="text-[9px] sm:text-sm text-muted-foreground uppercase sm:normal-case font-bold sm:font-normal tracking-wider sm:tracking-normal line-clamp-1">Deductions</p>
                                <p className="text-xs sm:text-xl font-bold sm:font-semibold tabular-nums text-rose-500 sm:text-destructive tracking-tighter sm:tracking-tight truncate">
                                    {showSalaries ? `₹${Number(latestPayslip.totalDeductions).toLocaleString()}` : "₹ •••"}
                                </p>
                            </div>
                            <div className="bg-muted/20 sm:bg-transparent border border-border/50 sm:border-none rounded-xl sm:rounded-none p-3 sm:p-0 space-y-1">
                                <p className="text-[9px] sm:text-sm text-muted-foreground uppercase sm:normal-case font-bold sm:font-normal tracking-wider sm:tracking-normal line-clamp-1">Net pay</p>
                                <p className="text-xs sm:text-xl font-bold sm:font-semibold tabular-nums text-emerald-500 sm:text-emerald-600 tracking-tighter sm:tracking-tight truncate">
                                    {showSalaries ? `₹${Number(latestPayslip.netPay).toLocaleString()}` : "₹ ••••••••"}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 sm:p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 sm:w-9 sm:h-9 bg-emerald-500/20 text-emerald-600 flex items-center justify-center rounded-lg">
                                <Banknote className="w-5 h-5 sm:w-4 sm:h-4" />
                            </div>
                            <p className="text-sm font-semibold text-emerald-700/90 dark:text-emerald-400">Total Net Earnings</p>
                        </div>
                        <div>
                            <p className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground tracking-tight">
                                {showSalaries ? `₹${payslips.reduce((acc: any, p: any) => acc + Number(p.netPay), 0).toLocaleString()}` : "₹ •••••••••"}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">Total net pay received this year</p>
                        </div>
                    </Card>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        Payroll History
                    </h2>
                </div>
                <div className="w-full">
                    {!loading && payslips.length === 0 ? (
                        <EmptyState
                            src={EmptyImages.payslip}
                            title="No payslips yet"
                            description="Your payslip history will appear here after the next payroll run."
                            size="wide"
                        />
                    ) : (
                        <>
                            {/* Mobile View */}
                            <div className="md:hidden flex flex-col gap-3">
                                {payslips.map((row: any) => (
                                    <div key={row.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {monthNames[row.payrollRun.month - 1]} {row.payrollRun.year}
                                                    </p>
                                                    <span className="inline-block mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                                        {row.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground"
                                                onClick={() => setSelectedPayslip(row)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Gross Pay</p>
                                                <p className="text-sm font-semibold text-foreground tabular-nums">
                                                    {showSalaries ? `₹${Number(row.grossEarnings).toLocaleString()}` : "••••••••"}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Deductions</p>
                                                <p className="text-sm font-semibold text-rose-500 tabular-nums">
                                                    {showSalaries ? `₹${Number(row.totalDeductions).toLocaleString()}` : "••••••••"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Net Pay</p>
                                                <p className="text-sm font-semibold text-emerald-600 tabular-nums">
                                                    {showSalaries ? `₹${Number(row.netPay).toLocaleString()}` : "••••••••"}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-9 mt-1 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs shadow-none border border-primary/10"
                                            onClick={() => {
                                                if (row.payslipPdf?.url) {
                                                    window.open(row.payslipPdf.url, '_blank');
                                                } else {
                                                    toast.error("PDF not yet generated");
                                                }
                                            }}
                                        >
                                            <Download className="w-3.5 h-3.5 mr-2" />
                                            Download PDF
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <DataTable
                                    isLoading={loading}
                                    data={payslips}
                                    columns={[
                                        {
                                            key: "payrollRun",
                                            label: "Period",
                                            render: (_val: any, row: any) => (
                                                <div className="text-sm font-medium">
                                                    {monthNames[row.payrollRun.month - 1]} {row.payrollRun.year}
                                                </div>
                                            )
                                        },
                                        {
                                            key: "grossEarnings",
                                            label: "Gross pay",
                                            render: (val: any) => (
                                                <span className="text-sm tabular-nums">
                                                    {showSalaries ? `₹${Number(val).toLocaleString()}` : "••••••••"}
                                                </span>
                                            )
                                        },
                                        {
                                            key: "totalDeductions",
                                            label: "Deductions",
                                            render: (val: any) => (
                                                <span className="text-sm font-medium text-rose-500 tabular-nums">
                                                    {showSalaries ? `₹${Number(val).toLocaleString()}` : "••••••••"}
                                                </span>
                                            )
                                        },
                                        {
                                            key: "netPay",
                                            label: "Net pay",
                                            render: (val: any) => (
                                                <span className="text-sm font-medium text-emerald-600 tabular-nums">
                                                    {showSalaries ? `₹${Number(val).toLocaleString()}` : "••••••••"}
                                                </span>
                                            )
                                        },
                                        {
                                            key: "status",
                                            label: "Status",
                                            render: (val: any) => (
                                                <span className="rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                                    {val}
                                                </span>
                                            )
                                        },
                                        {
                                            key: "actions",
                                            label: "Actions",
                                            render: (_val: any, row: any) => (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setSelectedPayslip(row)}
                                                        title="View details"
                                                        aria-label="View details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => {
                                                            if (row.payslipPdf?.url) {
                                                                window.open(row.payslipPdf.url, '_blank');
                                                            } else {
                                                                toast.error("PDF not yet generated");
                                                            }
                                                        }}
                                                        title="Download PDF"
                                                        aria-label="Download PDF"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )
                                        },
                                    ]}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <PayslipDetailsModal 
                isOpen={!!selectedPayslip} 
                onClose={() => setSelectedPayslip(null)} 
                payslip={selectedPayslip} 
            />
        </div>
    );
}
