"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { useGraphQlAttendance, useAttendanceMutations, useCancelAttendanceCorrection } from "@/lib/graphql/attendance/attendanceHooks";
import { AttendanceTable, AttendanceRow } from "@/components/attendance/AttendanceTable";
import { CorrectionModal, CorrectionPayload } from "@/components/attendance/CorrectionModal";
import moment from "moment";
import { Calendar, Search, Zap, Info, ChevronRight, History, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AttendanceCorrectionPage() {
    const [startDate, setStartDate] = useState(moment().startOf("month").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selected, setSelected] = useState<AttendanceRow | null>(null);

    const { cancelAttendanceCorrection, cancelAttendanceCorrectionLoading } = useCancelAttendanceCorrection();
    const { attendance, isLoading, refetchAttendance } = useGraphQlAttendance();
    const { requestCorrection, requestCorrectionLoading } = useAttendanceMutations();
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const total = attendance?.length || 0;
    const paginatedData = attendance?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

    const loadAttendance = async (start: string, end: string) => {
        if (!start || !end) return;
        try {
            await refetchAttendance({ startDate: start, endDate: end });
            setCurrentPage(1);
        } catch (e) {
            toast.error("Failed to synchronize attendance data.");
        }
    };

    useEffect(() => {
        loadAttendance(startDate, endDate);
    }, []);

    const handleCancelCorrection = async (correctionId: string) => {
        try {
            await cancelAttendanceCorrection(correctionId);
            toast.success("Correction protocol terminated successfully.");
            await refetchAttendance({ startDate, endDate });
        } catch (e) {
            toast.error("Failed to abort correction protocol.");
        }
    };

    const handleSubmit = async (data: CorrectionPayload) => {
        try {
            await requestCorrection({
                attendanceRecordId: data.attendanceRecordId,
                correctedLoginTime: data.correctedLoginTime,
                correctedLogoutTime: data.correctedLogoutTime,
                reason: data.reason,
            });
            toast.success("Correction request broadcasted.");
            setSelected(null);
            await refetchAttendance({ startDate, endDate });
        } catch (err: any) {
            toast.error("Failed to transmit correction request.");
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col justify-start items-start gap-6">
                <div className="hover:scale-110 transition-transform hover:-translate-x-1 cursor-pointer">
                    <ArrowLeftIcon onClick={router.back} />
                </div>
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Attendance Correction</h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        Attendance correction and verification.
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-end p-6 sm:p-8 border border-border/50 rounded-3xl bg-muted/5">
                    <DatePickerSimple
                        label="From"
                        value={startDate}
                        onChange={(date) => setStartDate(moment(date).format("YYYY-MM-DD"))}
                        disableFuture={true}
                        maxDate={endDate || undefined}
                    />
                    <DatePickerSimple
                        label="To"
                        value={endDate}
                        onChange={(date) => setEndDate(moment(date).format("YYYY-MM-DD"))}
                        disableFuture={true}
                        minDate={startDate || undefined}
                    />
                    <Button
                        className="btn-primary h-12 sm:h-[52px] group w-full"
                        onClick={() => loadAttendance(startDate, endDate)}
                    >
                        <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Search Records
                    </Button>
                </div>
            </Card>

            {/* Main Table Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-premium-label flex items-center gap-3">
                        <History className="w-4 h-4 text-primary" />
                        Attendance Correction Ledgers
                    </h2>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                        {attendance?.length || 0} Records Identified
                    </span>
                </div>

                <AttendanceTable
                    data={paginatedData}
                    isLoading={isLoading}
                    onRequestCorrection={setSelected}
                    onCancelCorrection={handleCancelCorrection}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

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
