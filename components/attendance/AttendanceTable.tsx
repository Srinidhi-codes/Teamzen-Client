import { DataTable, Column } from "@/components/common/DataTable";
import moment from "moment";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, RotateCcw } from "lucide-react";

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
    late_login: { label: "Late login", variant: "warning" },
    early_logout: { label: "Early logout", variant: "warning" },
    half_day: { label: "Half day", variant: "warning" },
    absent: { label: "Absent", variant: "danger" },
    present: { label: "Present", variant: "success" },
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
    currentTime?: string;
}) {
    const columns: Column<AttendanceRow>[] = [
        {
            key: "attendanceDate",
            label: "Date",
            render: (value: string) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-medium tabular-nums text-sm">
                        {moment(value).format("ddd, DD MMM")}
                    </span>
                </div>
            )
        },
        {
            key: "loginTime",
            label: "Check in",
            render: (value: string) => (
                <div className="flex items-center gap-2 text-foreground font-medium tabular-nums text-sm">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "—"}
                </div>
            ),
        },
        {
            key: "logoutTime",
            label: "Check out",
            render: (value: string) => (
                <div className="flex items-center gap-2 text-foreground font-medium tabular-nums text-sm">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "—"}
                </div>
            ),
        },
        {
            key: "workedHours",
            label: "Hours",
            render: (value: string | number, row: AttendanceRow) => {
                const isToday = moment().isSame(moment(row.attendanceDate), 'day');
                const isLive = isToday && row.loginTime && !row.logoutTime;

                if (isLive) {
                    const loginStr = `${row.attendanceDate} ${row.loginTime}`;
                    const start = moment(loginStr);
                    const now = moment();
                    const diffMs = Math.max(0, now.diff(start));
                    const duration = moment.duration(diffMs);
                    const h = Math.floor(duration.asHours());
                    const m = duration.minutes();
                    const s = duration.seconds();

                    return (
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-medium tabular-nums text-sm">
                                {h}h {m}m {s}s
                            </span>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-3.5 h-3.5 ${Number(value) >= 8 ? "text-emerald-500" : "text-amber-500"}`} />
                        <span className="font-medium tabular-nums text-sm text-foreground">
                            {value ? `${Number(value).toFixed(1)}h` : "0.0h"}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            render: (value: string) => {
                const config = STATUS_CONFIG[value] || { label: value, variant: "info" as const };
                return (
                    <span className="inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize bg-muted text-foreground">
                        {config.label}
                    </span>
                );
            },
        },
        {
            key: "correctionStatus",
            label: "Correction",
            render: (value: string, row: AttendanceRow) => {
                if (!value && !row.correctionReason) return <span className="text-muted-foreground/40 text-sm">—</span>;
                const config = STATUS_CONFIG[value] || { label: value || "Pending", variant: "info" as const };
                return (
                    <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex w-fit rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize ${
                            config.variant === "success" ? "bg-emerald-500/10 text-emerald-700" :
                            config.variant === "danger" ? "bg-destructive/10 text-destructive" :
                            config.variant === "warning" ? "bg-amber-500/10 text-amber-700" :
                            "bg-muted text-muted-foreground"
                        }`}>
                            {config.label}
                        </span>
                        {row.correctionReason && (
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]" title={row.correctionReason}>
                                {row.correctionReason}
                            </p>
                        )}
                    </div>
                )
            },
        },
        ...(data?.some(row => row.correctionStatus !== "approved") ? [{
            key: "correctionActions",
            label: "Actions",
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
                                className="h-9 rounded-md px-3 text-xs font-medium"
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
                                className="h-9 rounded-md px-3 text-xs font-medium"
                                onClick={() => onRequestCorrection(row)}
                            >
                                {status ? "Request again" : "Request correction"}
                            </Button>
                        )}

                    </div>
                );
            },
        }] : []),
    ];

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden p-1 sm:p-2">
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
