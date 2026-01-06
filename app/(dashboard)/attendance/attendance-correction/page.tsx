"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { useGraphQlAttendance, useAttendanceMutations } from "@/lib/graphql/attendance/attendanceHooks";
import { AttendanceTable, AttendanceRow } from "@/components/attendance/AttendanceTable";
import { CorrectionModal } from "@/components/attendance/CorrectionModal";

export default function AttendanceCorrectionPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selected, setSelected] = useState<AttendanceRow | null>(null);

    const { attendance, isLoading, refetchAttendance } = useGraphQlAttendance();

    /** Fetch attendance */
    const loadAttendance = () => {
        if (!startDate || !endDate) return;
        refetchAttendance({ startDate, endDate });
    };

    useEffect(() => {
        loadAttendance();
    }, [startDate, endDate]);

    const { requestCorrection, requestCorrectionLoading } = useAttendanceMutations();

    const handleSubmit = async (data: any) => {
        console.log(data, "TEST")
        try {
            await requestCorrection({
                attendanceRecordId: data.attendanceRecordId,
                correctedLoginTime: data.correctedLoginTime,
                correctedLogoutTime: data.correctedLogoutTime,
                reason: data.reason,
            });
            alert("Correction request submitted!");
            setSelected(null);
            refetchAttendance({ startDate, endDate }); // Refresh table
        } catch (err: any) {
            console.error(err);
            alert("Failed to submit correction");
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-black text-3xl font-bold">Attendance Correction</h1>
                <p className="text-gray-600">Request corrections for attendance records</p>
            </header>

            {/* Filters */}
            <Card title="Filter Attendance">
                <div className="grid md:grid-cols-3 gap-4 text-black">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <button className="btn-primary" onClick={loadAttendance}>
                        Search
                    </button>
                </div>
            </Card>

            {/* Table */}
            <Card title="Attendance Records">
                <AttendanceTable
                    data={attendance}
                    isLoading={isLoading}
                    onRequestCorrection={setSelected}
                />
            </Card>

            {/* Correction Modal */}
            {selected && (
                <CorrectionModal
                    record={selected}
                    onClose={() => setSelected(null)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
