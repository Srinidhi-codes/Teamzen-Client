import { DataTable } from "@/components/common/DataTable";

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
                <span className="font-mono">{value || "--:--:--"}</span>
            ),
        },
        {
            key: "logoutTime",
            label: "Logout",
            render: (value: string) => (
                <span className="font-mono">{value || "--:--:--"}</span>
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
            key: "correction_status",
            label: "Correction",
            render: (value: string | undefined, row: AttendanceRow) => (
                <div className="flex items-center gap-2">
                    {value && <span className="badge badge-info">{value}</span>}
                    {(
                        <button
                            onClick={() => onRequestCorrection(row)}
                            className="text-indigo-600 text-sm font-medium"
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
