"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Info,
  CheckCircle2,
  UploadCloud,
  FileText,
  ScanFace,
  Loader2,
  Building,
  Check,
  Camera,
  CameraOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/common/FormTextArea";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { PageHeader } from "@/components/common/PageHeader";
import { resolveAvatarUrl } from "@/lib/utils";
import {
  useAttendanceRecord,
  useRegularizationQuota,
  useAttendanceMutations,
  useGraphQlAttendance,
} from "@/lib/graphql/attendance/attendanceHooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "FORGOT_TO_PUNCH", label: "Forgot to punch / Biometric miss" },
  { value: "BIOMETRIC_DEVICE_ERROR", label: "Biometric / Hardware scanner error" },
  { value: "CLIENT_VISIT_ON_DUTY", label: "Client visit / On-duty assignment" },
  { value: "POWER_INTERNET_OUTAGE", label: "Power or network outage" },
  { value: "OTHER_EXCEPTION", label: "Other authorized exception" },
];

type RegularizationMode =
  | "FIX_CHECK_OUT"
  | "FIX_CHECK_IN"
  | "FULL_SHIFT"
  | "HALF_DAY_FIRST"
  | "HALF_DAY_SECOND";

function countElapsedBusinessDays(startDateStr: string): number {
  if (!startDateStr) return 0;
  const start = moment(startDateStr).startOf("day");
  const today = moment().startOf("day");
  if (start.isAfter(today)) return 0;

  let count = 0;
  const cur = start.clone().add(1, "day");
  while (cur.isSameOrBefore(today)) {
    // 0: Sunday, 6: Saturday
    const day = cur.day();
    if (day !== 0 && day !== 6) {
      count++;
    }
    cur.add(1, "day");
  }
  return count;
}

function RegularizationRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("recordId") || "";

  const { record, isLoading: recordLoading, error: recordError } = useAttendanceRecord(recordId);
  const { attendance, isLoading: attendanceListLoading } = useGraphQlAttendance();
  const { requestCorrection, requestCorrectionLoading } = useAttendanceMutations();

  // If recordId not in params or directly loaded, allow falling back to selected record from list
  const activeRecord = useMemo(() => {
    if (record) return record;
    if (recordId && attendance) {
      return attendance.find((r) => String(r.id) === String(recordId)) || null;
    }
    return attendance && attendance.length > 0 ? attendance[0] : null;
  }, [record, recordId, attendance]);

  const targetDate = activeRecord?.attendanceDate || moment().format("YYYY-MM-DD");
  const { quota, isLoading: quotaLoading } = useRegularizationQuota(targetDate);

  // Shift timings from office location or standard fallbacks
  const shiftLoginTime = activeRecord?.officeLocation?.loginTime || "09:30:00";
  const shiftLogoutTime = activeRecord?.officeLocation?.logoutTime || "18:30:00";

  // Determine initial preset based on what's missing
  const initialMode = useMemo<RegularizationMode>(() => {
    if (!activeRecord) return "FULL_SHIFT";
    const hasIn = Boolean(activeRecord.actualLoginTime || activeRecord.loginTime);
    const hasOut = Boolean(activeRecord.actualLogoutTime || activeRecord.logoutTime);
    if (hasIn && !hasOut) return "FIX_CHECK_OUT";
    if (!hasIn && hasOut) return "FIX_CHECK_IN";
    return "FULL_SHIFT";
  }, [activeRecord]);

  const [mode, setMode] = useState<RegularizationMode>(initialMode);
  const [category, setCategory] = useState("FORGOT_TO_PUNCH");
  const [reason, setReason] = useState("");
  const [supportingEvidenceBase64, setSupportingEvidenceBase64] = useState("");
  const [evidenceFileName, setEvidenceFileName] = useState("");
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Compute regularized times strictly according to shift policy (NO manual time editing)
  const computedTimes = useMemo(() => {
    const recordedIn = activeRecord?.actualLoginTime || activeRecord?.loginTime || shiftLoginTime;
    const recordedOut = activeRecord?.actualLogoutTime || activeRecord?.logoutTime || shiftLogoutTime;

    switch (mode) {
      case "FIX_CHECK_OUT":
        return {
          login: recordedIn,
          logout: shiftLogoutTime,
          label: "Fix Check-Out (Applied Shift End)",
        };
      case "FIX_CHECK_IN":
        return {
          login: shiftLoginTime,
          logout: recordedOut,
          label: "Fix Check-In (Applied Shift Start)",
        };
      case "HALF_DAY_FIRST":
        return {
          login: shiftLoginTime,
          logout: "13:30:00",
          label: "First Half Shift (09:30 AM – 01:30 PM)",
        };
      case "HALF_DAY_SECOND":
        return {
          login: "14:00:00",
          logout: shiftLogoutTime,
          label: "Second Half Shift (02:00 PM – 06:30 PM)",
        };
      case "FULL_SHIFT":
      default:
        return {
          login: shiftLoginTime,
          logout: shiftLogoutTime,
          label: "Full Day Shift (Standard Hours)",
        };
    }
  }, [mode, activeRecord, shiftLoginTime, shiftLogoutTime]);

  // Compute duration in hours
  const computedHours = useMemo(() => {
    try {
      const start = moment(`2000-01-01T${computedTimes.login}`);
      const end = moment(`2000-01-01T${computedTimes.logout}`);
      const diffMinutes = end.diff(start, "minutes");
      if (diffMinutes <= 0) return "0.0h";
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      return `${h}h ${m.toString().padStart(2, "0")}m`;
    } catch {
      return "—";
    }
  }, [computedTimes]);

  // Policy validation checks
  const deadlineDays = quota?.deadlineDays ?? 3;
  const elapsedBusinessDays = countElapsedBusinessDays(targetDate);
  const isSlaExpired = elapsedBusinessDays > deadlineDays;
  const isPayrollLocked = Boolean(activeRecord?.isPayrollLocked);
  const isQuotaExhausted = Boolean(quota && quota.isExhausted);
  const isPendingCorrection = activeRecord?.correctionStatus === "pending";

  const isSubmissionBlocked = isSlaExpired || isPayrollLocked || isQuotaExhausted || isPendingCorrection;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((err) => ({ ...err, evidence: "File size exceeds 5MB limit" }));
      return;
    }

    setEvidenceFileName(file.name);
    setErrors((err) => ({ ...err, evidence: "" }));

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSupportingEvidenceBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!reason || reason.trim().length < 10) {
      e.reason = "Please provide an auditable explanation of at least 10 characters.";
    }
    if (category === "CLIENT_VISIT_ON_DUTY" && !supportingEvidenceBase64) {
      e.evidence = "Supporting document or visit proof is required for On-Duty requests.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!activeRecord) {
      toast.error("No attendance record selected.");
      return;
    }
    if (isSubmissionBlocked) {
      toast.error("Submission is barred by company attendance policy.");
      return;
    }
    if (!validate()) return;

    try {
      await requestCorrection({
        attendanceRecordId: String(activeRecord.id),
        correctedLoginTime: computedTimes.login,
        correctedLogoutTime: computedTimes.logout,
        reason: reason.trim(),
        category,
        supportingEvidenceBase64: supportingEvidenceBase64 || undefined,
      });
      toast.success("Regularization request submitted for manager and HR approval.");
      router.push("/attendance/attendance-correction");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit regularization request.");
    }
  };

  const formatTime = (timeStr?: string | null) =>
    timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "Missing (—)";

  const inSelfieUrl = resolveAvatarUrl(activeRecord?.checkInSelfieUrl);
  const outSelfieUrl = resolveAvatarUrl(activeRecord?.checkOutSelfieUrl);
  const hasSelfies = Boolean(inSelfieUrl || outSelfieUrl || activeRecord?.faceVerified);

  if (recordLoading || attendanceListLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading attendance record and policy quota...</p>
      </div>
    );
  }

  if (!activeRecord) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Attendance Record Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested attendance discrepancy could not be located. Please choose a record from your attendance timeline.
        </p>
        <Button onClick={() => router.push("/attendance/attendance-correction")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Attendance
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Page Title & Breadcrumbs */}
      <PageHeader
        title="Attendance Regularization Formality"
        description="System-assisted punch reconciliation. Arbitrary manual time manipulation is locked; regularizations are anchored to authorized shift schedules and subject to multi-tier compliance review."
        breadcrumbs={[
          { label: "Attendance", href: "/attendance" },
          { label: "Correction", href: "/attendance/attendance-correction" },
          { label: "Request" },
        ]}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground shadow-xs">
            <span>Target Date:</span>
            <span className="font-bold text-foreground">
              {moment(activeRecord.attendanceDate).format("dddd, MMMM DD, YYYY")}
            </span>
          </div>
        }
      />

      {/* ⚠️ PROMINENT POLICY WARNING BANNERS */}
      <div className="space-y-3">
        {/* Warning 1: SLA Window Expired */}
        {isSlaExpired && (
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-5 shadow-sm text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                  Submission SLA Window Expired ({elapsedBusinessDays} Business Days Elapsed)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  This attendance incident occurred on <strong>{moment(targetDate).format("MMMM DD, YYYY")}</strong>,
                  which is <strong>{elapsedBusinessDays} business days ago</strong>. The organization's regularization
                  policy enforces a strict deadline of <strong>within {deadlineDays} business days</strong>. Self-service
                  regularization submission is barred. Please contact your reporting manager or HR department for an
                  authorized exception.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning 2: Payroll Locked Period */}
        {isPayrollLocked && (
          <div className="rounded-xl border-2 border-rose-500/40 bg-rose-500/10 p-5 shadow-sm text-rose-900 dark:text-rose-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Payroll Finalized & Locked Period
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-rose-800/90 dark:text-rose-300/90">
                  The payroll cycle for {moment(targetDate).format("MMMM YYYY")} has already been completed and locked.
                  Direct retroactive modifications to completed payroll pay runs are disabled by compliance policy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning 3: Quota Limit Exhausted */}
        {!isPayrollLocked && !isSlaExpired && isQuotaExhausted && (
          <div className="rounded-xl border-2 border-rose-500/40 bg-rose-500/10 p-5 shadow-sm text-rose-900 dark:text-rose-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Monthly Regularization Quota Exhausted ({quota?.usedCount || 3} of {quota?.monthlyLimit || 3} Used)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-rose-800/90 dark:text-rose-300/90">
                  You have reached the maximum allowed limit of {quota?.monthlyLimit || 3} self-service regularization
                  requests for this month. Additional submissions cannot be created without prior HR authorization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notice 4: Tier-2 Escalation Alert (3rd request) */}
        {!isSubmissionBlocked && quota && quota.usedCount === 2 && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-900 dark:text-sky-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Tier-2 HR Escalation Trigger</h4>
                <p className="text-xs text-sky-800/90 dark:text-sky-300/90">
                  This will be your 3rd regularization request this month. Per organization governance policy, this request
                  will automatically escalate directly to the HR Department for formal review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notice 5: Existing Pending Request */}
        {isPendingCorrection && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Pending Correction Under Review</h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90">
                  A regularization request is already pending review for this date. You cannot submit another request until
                  the current one has been decided by management.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quota & Policy KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Monthly Allowance</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            {quota ? `${quota.remainingCount} / ${quota.monthlyLimit}` : "..."}
          </p>
          <span className="text-[11px] text-muted-foreground">Requests remaining this month</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">SLA Submission Window</span>
            <Clock className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            {deadlineDays} Days
          </p>
          <span className="text-[11px] text-muted-foreground">
            {elapsedBusinessDays} business days elapsed ({isSlaExpired ? "Overdue" : "In Window"})
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Assigned Shift</span>
            <Building className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
            {moment(shiftLoginTime, "HH:mm:ss").format("hh:mm A")} – {moment(shiftLogoutTime, "HH:mm:ss").format("hh:mm A")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {activeRecord.officeLocation?.name || "Standard Office Shift"}
          </span>
        </div>
      </div>

      {/* Before / After Punch Audit Comparison Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h2 className="text-base font-bold text-foreground">Punch Times Comparison & Audit</h2>
          <span className="text-xs text-muted-foreground">
            Status: <span className="font-semibold text-foreground capitalize">{activeRecord.status || "Incomplete"}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recorded Biometric Punches */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                1. Original Recorded Punches
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 font-semibold">
                Raw Biometric
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-red-500/10">
                <span className="text-muted-foreground">Check-in punch</span>
                <span className="font-bold tabular-nums text-foreground">
                  {formatTime(activeRecord.actualLoginTime || activeRecord.loginTime)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-red-500/10">
                <span className="text-muted-foreground">Check-out punch</span>
                <span className="font-bold tabular-nums text-foreground">
                  {formatTime(activeRecord.actualLogoutTime || activeRecord.logoutTime)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Recorded Duration</span>
                <span className="font-bold tabular-nums text-foreground">
                  {activeRecord.workedHours ? `${Number(activeRecord.workedHours).toFixed(2)} hrs` : "0.0 hrs"}
                </span>
              </div>
            </div>
          </div>

          {/* System Regularized Shift Times (READ ONLY) */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                2. Regularized Shift Punches
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold">
                Policy Enforced
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-emerald-500/10">
                <span className="text-muted-foreground">Regularized In</span>
                <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {moment(computedTimes.login, "HH:mm:ss").format("hh:mm A")}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-emerald-500/10">
                <span className="text-muted-foreground">Regularized Out</span>
                <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {moment(computedTimes.logout, "HH:mm:ss").format("hh:mm A")}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Resulting Work Hours</span>
                <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {computedHours}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Biometric Selfie Verification Audit */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ScanFace className="h-4 w-4 text-primary" />
              <span>Biometric Punch Audit Trail</span>
            </div>
            {activeRecord.faceVerified && (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Face Verified {activeRecord.faceMatchScore ? `· ${Number(activeRecord.faceMatchScore).toFixed(2)}` : ""}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Check-In Biometric Selfie */}
            <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs">
              {inSelfieUrl ? (
                <button
                  type="button"
                  onClick={() => setPreview({ src: inSelfieUrl, name: "Check-in Selfie" })}
                  className="relative shrink-0 rounded-lg border border-border overflow-hidden hover:opacity-90 transition-opacity group cursor-zoom-in"
                >
                  <img src={inSelfieUrl} alt="Check-in Selfie" className="h-16 w-16 object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">View</span>
                  </div>
                </button>
              ) : (
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground text-center p-1">
                  <CameraOff className="h-5 w-5 mb-0.5 opacity-60" />
                  <span className="text-[9px] font-medium leading-tight">No Selfie</span>
                </div>
              )}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-foreground block">Check-In Selfie</span>
                {inSelfieUrl ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Verified biometric selfie recorded at {formatTime(activeRecord.actualLoginTime || activeRecord.loginTime)}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Biometric punch recorded without selfie attachment.
                  </p>
                )}
              </div>
            </div>

            {/* Check-Out Biometric Selfie */}
            <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs">
              {outSelfieUrl ? (
                <button
                  type="button"
                  onClick={() => setPreview({ src: outSelfieUrl, name: "Check-out Selfie" })}
                  className="relative shrink-0 rounded-lg border border-border overflow-hidden hover:opacity-90 transition-opacity group cursor-zoom-in"
                >
                  <img src={outSelfieUrl} alt="Check-out Selfie" className="h-16 w-16 object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">View</span>
                  </div>
                </button>
              ) : (
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground text-center p-1">
                  <CameraOff className="h-5 w-5 mb-0.5 opacity-60" />
                  <span className="text-[9px] font-medium leading-tight">No Selfie</span>
                </div>
              )}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-foreground block">Check-Out Selfie</span>
                {outSelfieUrl ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Verified biometric selfie recorded at {formatTime(activeRecord.actualLogoutTime || activeRecord.logoutTime)}
                  </p>
                ) : !(activeRecord.actualLogoutTime || activeRecord.logoutTime) ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Check-out punch missing (pending shift regularization).
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Biometric punch recorded without selfie attachment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formality Controls Card: Scope Selection, Category, Evidence, Reason */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">Regularization Scope & Justification</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the authorized adjustment type. Times are fixed strictly according to shift policy.
          </p>
        </div>

        {/* Regularization Scope Selector (Radio Cards instead of raw time inputs) */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            1. Select Regularization Mode
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Fix Missing Check-Out */}
            <div
              onClick={() => !isSubmissionBlocked && setMode("FIX_CHECK_OUT")}
              className={cn(
                "rounded-xl border p-4 transition-all cursor-pointer relative space-y-1.5",
                mode === "FIX_CHECK_OUT"
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                  : "border-border bg-muted/20 hover:border-border/80",
                isSubmissionBlocked && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Fix Missing Check-Out</span>
                {mode === "FIX_CHECK_OUT" && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Keeps recorded check-in ({formatTime(activeRecord.actualLoginTime || activeRecord.loginTime)}). Applies shift end ({moment(shiftLogoutTime, "HH:mm:ss").format("hh:mm A")}).
              </p>
            </div>

            {/* Option 2: Fix Missing Check-In */}
            <div
              onClick={() => !isSubmissionBlocked && setMode("FIX_CHECK_IN")}
              className={cn(
                "rounded-xl border p-4 transition-all cursor-pointer relative space-y-1.5",
                mode === "FIX_CHECK_IN"
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                  : "border-border bg-muted/20 hover:border-border/80",
                isSubmissionBlocked && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Fix Missing Check-In</span>
                {mode === "FIX_CHECK_IN" && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Applies shift start ({moment(shiftLoginTime, "HH:mm:ss").format("hh:mm A")}). Keeps recorded check-out ({formatTime(activeRecord.actualLogoutTime || activeRecord.logoutTime)}).
              </p>
            </div>

            {/* Option 3: Full Day Shift */}
            <div
              onClick={() => !isSubmissionBlocked && setMode("FULL_SHIFT")}
              className={cn(
                "rounded-xl border p-4 transition-all cursor-pointer relative space-y-1.5",
                mode === "FULL_SHIFT"
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                  : "border-border bg-muted/20 hover:border-border/80",
                isSubmissionBlocked && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Full Day Shift</span>
                {mode === "FULL_SHIFT" && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Replaces missing punches with full shift: {moment(shiftLoginTime, "HH:mm:ss").format("hh:mm A")} – {moment(shiftLogoutTime, "HH:mm:ss").format("hh:mm A")}.
              </p>
            </div>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            2. Correction Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmissionBlocked}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Supporting Evidence File Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            3. Supporting Evidence{" "}
            {category === "CLIENT_VISIT_ON_DUTY" ? (
              <span className="text-rose-500 font-bold">* Required for On-Duty</span>
            ) : (
              <span className="text-muted-foreground font-normal">(Optional)</span>
            )}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={cn(
                "flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer",
                isSubmissionBlocked && "opacity-50 pointer-events-none"
              )}
            >
              <UploadCloud className="h-4 w-4 text-primary" />
              <span>Upload Document / Receipt</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isSubmissionBlocked}
                className="hidden"
              />
            </label>
            {evidenceFileName ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <FileText className="h-4 w-4" />
                {evidenceFileName}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Accepted: Gate pass, doctor note, customer approval email (PDF or Image max 5MB)
              </span>
            )}
          </div>
          {errors.evidence && <p className="text-xs text-destructive font-medium">{errors.evidence}</p>}
        </div>

        {/* Reason / Explanation */}
        <div className="space-y-2">
          <FormTextarea
            label="4. Business Reason & Audit Justification *"
            rows={4}
            disabled={isSubmissionBlocked}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors((err) => ({ ...err, reason: "" }));
            }}
            placeholder="Explain the specific reason for missing biometric punches (e.g., biometric scanner power cut, gate pass approved by client, emergency hospital visit)..."
            className="w-full rounded-xl"
          />
          {errors.reason && <p className="text-xs text-destructive font-medium">{errors.reason}</p>}
        </div>

        {/* Submission Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button
            variant="outline"
            onClick={() => router.push("/attendance/attendance-correction")}
            disabled={requestCorrectionLoading}
            className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestCorrectionLoading || isSubmissionBlocked}
            className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold gap-2 shadow-xs"
          >
            {requestCorrectionLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Regularization Request</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <PhotoOverlay
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src}
        name={preview?.name}
      />
    </div>
  );
}

export default function AttendanceCorrectionRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading attendance regularization form...</p>
        </div>
      }
    >
      <RegularizationRequestForm />
    </Suspense>
  );
}
