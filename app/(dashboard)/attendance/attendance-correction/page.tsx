"use client";

import { useEffect, useState, useMemo } from "react";
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
import { AttendanceTimelineMatrix } from "@/components/attendance/AttendanceTimelineMatrix";
import { format } from "date-fns";
import {
  Search,
  History,
  ArrowLeftIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FilePenLine,
  Table as TableIcon,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");

  const { cancelAttendanceCorrection } = useCancelAttendanceCorrection();
  const { attendance, isLoading, refetchAttendance } = useGraphQlAttendance();
  const { requestCorrection } = useAttendanceMutations();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const total = attendance?.length || 0;
  const pendingCount =
    attendance?.filter((r) => r.correctionStatus === "pending").length || 0;
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

  // Quick stats summary
  const stats = useMemo(() => {
    const list = attendance || [];
    const present = list.filter((r) => r.status === "present").length;
    const late = list.filter((r) => r.status === "late_login").length;
    const earlyOut = list.filter((r) => r.status === "early_logout").length;
    return {
      total: list.length,
      present,
      deficits: late + earlyOut,
      pending: pendingCount,
    };
  }, [attendance, pendingCount]);

  return (
    <div className="w-full space-y-8 animate-fade-in pb-20">
      <button
        type="button"
        onClick={router.back}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Attendance</span>
      </button>

      <PageHeader
        eyebrow="Time Tracking"
        title="Attendance Regularization & Activity"
        description="Review daily timelines, check office hours compliance, and request punch corrections."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 shadow-xs">
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "timeline"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5 text-primary" />
              Timeline View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="h-3.5 w-3.5 text-primary" />
              Table View
            </button>
          </div>
        }
      />

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Logged Days</span>
            <Calendar className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{stats.total}</p>
          <span className="text-[11px] text-muted-foreground">Selected period</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">On-Time Days</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.present}
          </p>
          <span className="text-[11px] text-muted-foreground">Compliant shifts</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Shift Deficits</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {stats.deficits}
          </p>
          <span className="text-[11px] text-muted-foreground">Late arrivals / Early exits</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Regularization</span>
            <FilePenLine className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {stats.pending}
          </p>
          <span className="text-[11px] text-muted-foreground">Pending approval</span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 sm:gap-4 pt-1">
        <div className="w-full sm:w-52">
          <DatePickerSimple
            label="From"
            value={startDate}
            onChange={(date) => date && setStartDate(format(date, "yyyy-MM-dd"))}
            disableFuture={true}
            maxDate={endDate || undefined}
          />
        </div>
        <div className="w-full sm:w-52">
          <DatePickerSimple
            label="To"
            value={endDate}
            onChange={(date) => date && setEndDate(format(date, "yyyy-MM-dd"))}
            disableFuture={true}
            minDate={startDate || undefined}
          />
        </div>
        <Button
          className="h-[45px] px-6 rounded-xl font-semibold shadow-xs gap-2 cursor-pointer"
          onClick={() => loadAttendance(startDate, endDate)}
        >
          <Search className="h-4 w-4" />
          <span>Apply Filter</span>
        </Button>
      </div>

      {/* Main View: Timeline Matrix vs Table */}
      <div className="space-y-4">
        {viewMode === "timeline" ? (
          <AttendanceTimelineMatrix
            records={(attendance || []).map((r) => ({
              id: r.id,
              attendanceDate: r.attendanceDate,
              loginTime: r.loginTime,
              logoutTime: r.logoutTime,
              status: r.status,
              workedHours: r.workedHours,
              correctionStatus: r.correctionStatus,
              correctionReason: r.correctionReason,
              correctionId: r.correctionId,
            }))}
            isLoading={isLoading}
            onRequestCorrection={(rec) => setSelected(rec as AttendanceRow)}
          />
        ) : (
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
        )}
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
