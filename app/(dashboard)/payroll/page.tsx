"use client";

import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_PAYSLIPS } from "@/lib/graphql/payroll/queries";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Download, Calendar, Eye, EyeOff } from "lucide-react";
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
                title="My payroll"
                description="View payslips and download PDFs for each pay period."
                actions={
                    <Button
                        variant="outline"
                        className="h-9 rounded-md text-sm font-medium gap-2"
                        onClick={() => setShowSalaries(!showSalaries)}
                    >
                        {showSalaries ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showSalaries ? "Hide values" : "Show values"}
                    </Button>
                }
            />

            {latestPayslip && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2 rounded-xl border border-border">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{monthNames[latestPayslip.payrollRun.month - 1]} {latestPayslip.payrollRun.year}</h3>
                                    <p className="text-sm text-muted-foreground">Latest payslip</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-md text-sm font-medium gap-2 flex-1 md:flex-initial"
                                    onClick={() => setSelectedPayslip(latestPayslip)}
                                >
                                    View details
                                </Button>
                                <Button
                                    className="h-9 rounded-md btn-primary flex-1 md:flex-initial text-sm font-medium"
                                    onClick={() => {
                                        if (latestPayslip.payslipPdf?.url) {
                                            window.open(latestPayslip.payslipPdf.url, '_blank');
                                        } else {
                                            toast.error("PDF not yet generated for this cycle");
                                        }
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                            <div className="space-y-0.5">
                                <p className="text-sm text-muted-foreground">Days worked</p>
                                <p className="text-xl font-semibold tabular-nums">{latestPayslip.workedDays}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm text-muted-foreground">Gross pay</p>
                                <p className="text-xl font-semibold tabular-nums text-primary">
                                    {showSalaries ? `₹${Number(latestPayslip.grossEarnings).toLocaleString()}` : "₹ ••••••••"}
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm text-muted-foreground">Deductions</p>
                                <p className="text-xl font-semibold tabular-nums text-destructive">
                                    {showSalaries ? `₹${Number(latestPayslip.totalDeductions).toLocaleString()}` : "₹ •••"}
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm text-muted-foreground">Net pay</p>
                                <p className="text-xl font-semibold tabular-nums text-emerald-600">
                                    {showSalaries ? `₹${Number(latestPayslip.netPay).toLocaleString()}` : "₹ ••••••••"}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <ModernStat
                        icon={FileText}
                        label="Year-to-date net pay"
                        value={showSalaries ? `₹${payslips.reduce((acc: any, p: any) => acc + Number(p.netPay), 0).toLocaleString()}` : "₹ •••••••••"}
                        color="text-primary"
                        bg="bg-primary/10"
                    />
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Payslip history
                </h2>
                <Card className="rounded-xl border border-border overflow-hidden">
                    {!loading && payslips.length === 0 ? (
                        <EmptyState
                            src={EmptyImages.payslip}
                            title="No payslips yet"
                            description="Your payslip history will appear here after the next payroll run."
                            size="wide"
                        />
                    ) : (
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
                                key: "netPay",
                                label: "Net pay",
                                render: (val: any) => (
                                    <span className="text-sm font-medium text-primary tabular-nums">
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
                            {
                                key: "ai",
                                label: "Ask AI",
                                render: (_val: any, row: any) => (
                                    <Button
                                        variant="ghost"
                                        className="h-9 rounded-md text-sm font-medium hover:bg-primary/5 text-primary"
                                        onClick={() => {
                                            setAssistantPayload({ payslip_id: row.id });
                                            setAssistantQuery(`Explain my payslip for ${monthNames[row.payrollRun.month - 1]} ${row.payrollRun.year} in detail.`);
                                            setAssistantOpen(true);
                                        }}
                                    >
                                        Explain
                                    </Button>
                                )
                            },
                        ]}
                    />
                    )}
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
