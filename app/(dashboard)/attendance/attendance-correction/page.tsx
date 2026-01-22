"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { useGraphQlAttendance, useAttendanceMutations, useCancelAttendanceCorrection } from "@/lib/graphql/attendance/attendanceHooks";
import { AttendanceTable, AttendanceRow } from "@/components/attendance/AttendanceTable";
import { CorrectionModal } from "@/components/attendance/CorrectionModal";
import moment from "moment";

export default function AttendanceCorrectionPage() {
    const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selected, setSelected] = useState<AttendanceRow | null>(null);

    const { cancelAttendanceCorrection, cancelAttendanceCorrectionLoading } = useCancelAttendanceCorrection();
    const { attendance, isLoading, refetchAttendance } = useGraphQlAttendance();

    /** Fetch attendance */
    const loadAttendance = async (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return;
        await refetchAttendance({ startDate, endDate });
    };

    const handleCancelCorrection = async (correctionId: string) => {
        try {
            await cancelAttendanceCorrection(correctionId);
            await refetchAttendance({ startDate, endDate });
        } catch (e) {
            console.error(e);
            alert("Failed to cancel correction");
        }
    };


    useEffect(() => {
        const startDate = moment().startOf("month").format("YYYY-MM-DD");
        const endDate = moment().format("YYYY-MM-DD");

        loadAttendance(startDate, endDate);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            loadAttendance(startDate, endDate);
        }
    }, [startDate, endDate]);



    const { requestCorrection, requestCorrectionLoading } = useAttendanceMutations();

    const handleSubmit = async (data: any) => {
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
                    <button
                        className="btn-primary"
                        onClick={() => loadAttendance(startDate, endDate)}
                    >
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
                    onCancelCorrection={handleCancelCorrection}
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
