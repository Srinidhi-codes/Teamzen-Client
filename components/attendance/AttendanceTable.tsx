import { DataTable, Column } from "@/components/common/DataTable";
import moment from "moment";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, RotateCcw, PenLine, SquareArrowOutUpRight } from "lucide-react";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    actualLoginTime?: string | null;
    actualLogoutTime?: string | null;
    status: string;
    correctionStatus?: string;
    correctionId?: string;
    workedHours?: string | number | null;
    correctionReason?: string;
    approvalComment?: string;
    faceVerified?: boolean;
    faceMatchScore?: number | null;
    checkInSelfieUrl?: string | null;
    checkOutSelfieUrl?: string | null;
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
                    <div className="flex items-center gap-1">
                        {status === "pending" && row.correctionId && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => onCancelCorrection(row.correctionId!)}
                                title="Cancel correction"
                                aria-label="Cancel correction"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        {(!status || status === "rejected" || status === "cancelled") && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => onRequestCorrection(row)}
                                title={status ? "Request again" : "Request correction"}
                                aria-label={status ? "Request again" : "Request correction"}
                            >
                                <SquareArrowOutUpRight/>
                            </Button>
                        )}
                    </div>
                );
            },
        }] : []),
    ];

    const renderMobileCard = (row: AttendanceRow) => {
        const isToday = moment().isSame(moment(row.attendanceDate), 'day');
        const isLive = isToday && row.loginTime && !row.logoutTime;
        
        let workedHoursDisplay = row.workedHours ? `${Number(row.workedHours).toFixed(1)}h` : "0.0h";
        if (isLive) {
            const start = moment(`${row.attendanceDate} ${row.loginTime}`);
            const diffMs = Math.max(0, moment().diff(start));
            const duration = moment.duration(diffMs);
            workedHoursDisplay = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
        }

        const correctionConfig = row.correctionStatus ? STATUS_CONFIG[row.correctionStatus] || { label: row.correctionStatus, variant: "info" } : null;
        const mainStatusConfig = STATUS_CONFIG[row.status] || { label: row.status, variant: "info" };

        return (
            <div key={row.id} className="bg-card border border-border/60 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-base tracking-tight text-foreground">{moment(row.attendanceDate).format("dddd")}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">{moment(row.attendanceDate).format("DD MMM YYYY")}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className="inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-muted/60 text-muted-foreground border border-border/50">
                            {mainStatusConfig.label}
                        </span>
                        {correctionConfig && (
                            <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                                correctionConfig.variant === "success" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                                correctionConfig.variant === "danger" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                correctionConfig.variant === "warning" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                                "bg-muted text-muted-foreground border-border/50"
                            }`}>
                                {correctionConfig.label}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 bg-muted/20 p-3 rounded-xl border border-border/30">
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Check In</p>
                        <div className="flex items-center gap-2 font-semibold tabular-nums text-sm text-foreground">
                            <Clock className="w-4 h-4 text-primary/70" />
                            {row.loginTime ? moment(row.loginTime, "HH:mm:ss").format("hh:mm A") : "—"}
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Check Out</p>
                        <div className="flex items-center gap-2 font-semibold tabular-nums text-sm text-foreground">
                            <Clock className="w-4 h-4 text-primary/70" />
                            {row.logoutTime ? moment(row.logoutTime, "HH:mm:ss").format("hh:mm A") : "—"}
                        </div>
                    </div>
                </div>

                {row.correctionReason && (
                    <div className="mb-4 bg-primary/5 border border-primary/10 p-3 rounded-xl">
                        <p className="text-xs text-foreground/80 leading-relaxed italic">
                            <span className="font-semibold not-italic text-primary/80 mr-1">Note:</span>"{row.correctionReason}"
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5 bg-background border border-border/60 px-3 py-1.5 rounded-lg shadow-sm">
                        <TrendingUp className={`w-4 h-4 ${Number(row.workedHours) >= 8 || isLive ? "text-emerald-500" : "text-amber-500"}`} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Duration</span>
                            <span className="font-bold tabular-nums text-sm leading-none text-foreground">
                                {workedHoursDisplay}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {row.correctionStatus === "pending" && row.correctionId && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-3.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive border-border shadow-sm rounded-lg"
                                onClick={() => onCancelCorrection(row.correctionId!)}
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Cancel
                            </Button>
                        )}
                        {(!row.correctionStatus || row.correctionStatus === "rejected" || row.correctionStatus === "cancelled") && (
                            <Button
                                size="sm"
                                variant="default"
                                className="h-9 p-5 text-xs font-bold shadow-sm rounded-lg"
                                onClick={() => onRequestCorrection(row)}
                            >
                               Request
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden p-1 sm:p-2">
                {isLoading ? (
                    <div className="p-4">
                        <PageSkeleton variant="list" />
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <DataTable
                            columns={columns}
                            data={data}
                            total={total}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {isLoading ? (
                    <div className="p-2">
                        <PageSkeleton variant="list" />
                    </div>
                ) : data?.length ? (
                    <div className="space-y-1 pb-4">
                        {data.map(renderMobileCard)}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground border border-border border-dashed rounded-xl bg-muted/20">
                        No records found
                    </div>
                )}
            </div>
        </>
    );
}
