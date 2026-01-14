import { DataTable } from "@/components/common/DataTable";
import moment from "moment";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    status: string;
    correction_status?: string;
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    late_login: { label: "Late Login", className: "badge-warning" },
    early_logout: { label: "Early Logout", className: "badge-warning" },
    absent: { label: "Absent", className: "badge-danger" },
    present: { label: "Present", className: "badge-success" },
    approved: { label: "Approved", className: "badge-success" },
    rejected: { label: "Rejected", className: "badge-danger" },
    pending: { label: "Pending", className: "badge-warning" },
};

export function AttendanceTable({
    data,
    isLoading,
    onRequestCorrection,
}: {
    data: AttendanceRow[];
    isLoading: boolean;
    onRequestCorrection: (row: AttendanceRow) => void;
}) {
    const columns = [
        {
            key: "attendanceDate",
            label: "Date",
            render: (value: string) =>
                new Date(value).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                }),
        },
        {
            key: "loginTime",
            label: "Login",
            render: (value: string) => (
                <span className="font-md">
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                </span>
            ),
        },
        {
            key: "logoutTime",
            label: "Logout",
            render: (value: string) => (
                <span className="font-md">
                    {value ? moment(value, "HH:mm:ss").format("hh:mm:ss A") : "--:--:--"}
                </span>
            ),
        },
        {
            key: "workedHours",
            label: "Worked Hours",
            render: (value: string) => (
                <span
                    className={`capitalize ${Number(value) >= 8 ? "text-black" : "text-red-600"
                        }`}
                >
                    {value ? `${Number(value).toFixed(0)} hrs` : "--:--"}
                </span>

            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value: string) => {
                const s = STATUS_MAP[value];
                return (
                    <span className={`badge ${s?.className ?? "badge-info"}`}>
                        {s?.label ?? value}
                    </span>
                );
            },
        },
        {
            key: "correctionReason",
            label: "Reason",
            render: (value: string) => (
                <span className="font-md text-wrap">{value || "--:--:--"}</span>
            ),
        },
        {
            key: "approvalComment",
            label: "Approval Comment",
            render: (value: string) => (
                <span className="font-md text-wrap">{value || "--:--:--"}</span>
            ),
        },
        {
            key: "correctionStatus",
            label: "Approval Status",
            render: (value: string) => {
                const s = STATUS_MAP[value];
                return (
                    <span className={`badge capitalize ${s?.className ?? "badge-info"}`}> {value || "--:--:--"}</span >
                )
            },
        },
        {
            key: "correction_status",
            label: "Correction",
            render: (value: string | undefined, row: AttendanceRow) => (
                <div className="flex items-center gap-2">
                    {value && <span className="badge badge-info">{value}</span>}
                    {(
                        <button
                            onClick={() => onRequestCorrection(row)}
                            className="text-indigo-600 text-sm font-md cursor-pointer"
                        >
                            Request
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return <DataTable columns={columns} data={data} isLoading={isLoading} />;
}
