import { DataTable, Column } from "@/components/common/DataTable";
import moment from "moment";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    status: string;
    correctionStatus?: string;
    correctionId?: string;
    workedHours?: string | number | null;
    correctionReason?: string;
    approvalComment?: string;
};

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    late_login: { label: "Late Login", variant: "warning" },
    early_logout: { label: "Early Logout", variant: "warning" },
    half_day: { label: "Half Day", variant: "warning" },
    absent: { label: "Absent", variant: "danger" },
    present: { label: "Active", variant: "success" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Rejected", variant: "danger" },
    pending: { label: "Pending", variant: "warning" },
    cancelled: { label: "Cancelled", variant: "info" },
};

export function AttendanceTable({
    data,
    isLoading,
    onRequestCorrection,
    onCancelCorrection,
    total,
    currentPage,
    pageSize,
    onPageChange
}: {
    data: AttendanceRow[];
    isLoading: boolean;
    onRequestCorrection: (row: AttendanceRow) => void;
    onCancelCorrection: (correctionId: string) => void;
    total?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
}) {
    const columns: Column<AttendanceRow>[] = [
        {
            key: "attendanceDate",
            label: "Date",
            render: (value: string) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-bold tabular-nums">
                        {moment(value).format("ddd, DD MMM")}
                    </span>
                </div>
            )
        },
        {
            key: "loginTime",
            label: "Login Time",
            render: (value: string) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-foreground font-black tabular-nums text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                    </div>
                </div>
            ),
        },
        {
            key: "logoutTime",
            label: "Logout Time",
            render: (value: string) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-foreground font-black tabular-nums text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                    </div>
                </div>
            ),
        },
        {
            key: "workedHours",
            label: "Productivity",
            render: (value: string | number) => (
                <div className="flex items-center gap-2">
                    <TrendingUp className={`w-3.5 h-3.5 ${Number(value) >= 8 ? "text-emerald-500" : "text-amber-500"}`} />
                    <span className="font-black tabular-nums text-foreground">
                        {value ? `${Number(value).toFixed(1)}h` : "0.0h"}
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value: string) => {
                const config = STATUS_CONFIG[value] || { label: value, variant: "info" };
                return (
                    <Badge variant={config.variant}>
                        {value}
                    </Badge>
                );
            },
        },
        {
            key: "correctionStatus",
            label: "Approval Status",
            render: (value: string, row: AttendanceRow) => {
                if (!value && !row.correctionReason) return <span className="text-muted-foreground/30 font-black italic">--</span>;
                const config = STATUS_CONFIG[value] || { label: value || "Pending Request", variant: "info" };
                return (
                    <div className="flex flex-col gap-1.5">
                        <div className="w-fit">
                            <Badge variant={config.variant}>
                                {config.label}
                            </Badge>
                        </div>
                        {row.correctionReason && (
                            <p className="text-[9px] text-muted-foreground italic truncate max-w-[120px]" title={row.correctionReason}>
                                "{row.correctionReason}"
                            </p>
                        )}
                    </div>
                )
            },
        },
        ...(data?.some(row => row.correctionStatus !== "approved") ? [{
            key: "correctionActions",
            label: "Terminal Actions",
            render: (_: unknown, row: AttendanceRow) => {
                const status = row.correctionStatus;
                if (status === "approved") {
                    return null;
                }
                return (
                    <div className="flex items-center justify-start gap-2">
                        {status === "pending" && row.correctionId && (
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 px-4 text-[9px] font-black tracking-widest"
                                onClick={() => onCancelCorrection(row.correctionId!)}
                            >
                                <RotateCcw className="w-3 h-3 mr-1.5" />
                                Cancel
                            </Button>
                        )}
                        {(!status || status === "rejected" || status === "cancelled") && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-4 text-[9px] font-black tracking-widest bg-primary/5 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                onClick={() => onRequestCorrection(row)}
                            >
                                {status ? "RE-INITIATE" : "CORRECT"}
                            </Button>
                        )}

                    </div>
                );
            },
        }] : []),
    ];

    return (
        <div className="bg-card rounded-3xl sm:rounded-4xl border border-border shadow-2xl overflow-hidden p-1 sm:p-2">
            <div className="overflow-x-auto custom-scrollbar">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}