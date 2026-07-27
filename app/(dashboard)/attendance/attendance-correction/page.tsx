"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGraphQlAttendance,
  useAttendanceMutations,
  useCancelAttendanceCorrection,
} from "@/lib/graphql/attendance/attendanceHooks";
import type { AttendanceRow } from "@/components/attendance/AttendanceTable";
import { CorrectionModal, CorrectionPayload } from "@/components/attendance/CorrectionModal";
import { format } from "date-fns";
import { Search, History, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AttendanceTable = dynamic(
  () =>
    import("@/components/attendance/AttendanceTable").then((m) => m.AttendanceTable),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
    ),
  }
);

export default function AttendanceCorrectionPage() {
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selected, setSelected] = useState<AttendanceRow | null>(null);

  const { cancelAttendanceCorrection } = useCancelAttendanceCorrection();
  const { attendance, isLoading, refetchAttendance } = useGraphQlAttendance();
  const { requestCorrection } = useAttendanceMutations();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const total = attendance?.length || 0;
  const paginatedData =
    attendance?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  const loadAttendance = async (start: string, end: string) => {
    if (!start || !end) return;
    try {
      await refetchAttendance({ startDate: start, endDate: end });
      setCurrentPage(1);
    } catch {
      toast.error("Failed to load attendance records.");
    }
  };

  useEffect(() => {
    loadAttendance(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelCorrection = async (correctionId: string) => {
    try {
      await cancelAttendanceCorrection(correctionId);
      toast.success("Correction request cancelled.");
      await refetchAttendance({ startDate, endDate });
    } catch {
      toast.error("Failed to cancel correction request.");
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
      toast.success("Correction request submitted.");
      setSelected(null);
      await refetchAttendance({ startDate, endDate });
    } catch {
      toast.error("Failed to submit correction request.");
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <button
        type="button"
        onClick={router.back}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <PageHeader
        title="Attendance correction"
        description="Review records and request changes to check-in or check-out times."
      />

      <Card>
        <div className="grid grid-cols-1 items-end gap-6 rounded-xl border border-border/50 bg-muted/5 p-6 md:grid-cols-3">
          <DatePickerSimple
            label="From"
            value={startDate}
            onChange={(date) => date && setStartDate(format(date, "yyyy-MM-dd"))}
            disableFuture={true}
            maxDate={endDate || undefined}
          />
          <DatePickerSimple
            label="To"
            value={endDate}
            onChange={(date) => date && setEndDate(format(date, "yyyy-MM-dd"))}
            disableFuture={true}
            minDate={startDate || undefined}
          />
          <Button
            className="h-9 w-full rounded-md"
            onClick={() => loadAttendance(startDate, endDate)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History className="h-4 w-4 text-primary" />
            Records
          </h2>
          <span className="text-xs text-muted-foreground">
            {attendance?.length || 0} records
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
