"use client";

import { useState } from "react";
import {
    Calendar,
    ArrowRight,
    CheckCircle2,
    Info,
    Loader2,
    ScanFace,
    AlertTriangle,
    UploadCloud,
    FileText,
    ShieldAlert,
} from "lucide-react";
import moment from "moment";
import { FormTextarea } from "../common/FormTextArea";
import { FormInput } from "../common/FormInput";
import { PremiumModal } from "../common/PremiumModal";
import { PhotoOverlay } from "../common/PhotoOverlay";
import { resolveAvatarUrl } from "@/lib/utils";
import { useRegularizationQuota } from "@/lib/graphql/attendance/attendanceHooks";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    actualLoginTime?: string | null;
    actualLogoutTime?: string | null;
    loginTime?: string | null;
    logoutTime?: string | null;
    correctionReason?: string | null;
    correctionCategory?: string | null;
    isPayrollLocked?: boolean;
    faceVerified?: boolean;
    faceMatchScore?: number | null;
    checkInSelfieUrl?: string | null;
    checkOutSelfieUrl?: string | null;
};

type Props = {
    record: AttendanceRow;
    onClose: () => void;
    onSubmit?: (data: CorrectionPayload) => Promise<void> | void;
};

export type CorrectionPayload = {
    attendanceRecordId: string;
    correctedLoginTime: string;
    correctedLogoutTime: string;
    reason: string;
    category?: string;
    supportingEvidenceBase64?: string;
};

const CATEGORIES = [
    { value: "FORGOT_TO_PUNCH", label: "Forgot to punch / Biometric miss" },
    { value: "BIOMETRIC_DEVICE_ERROR", label: "Biometric / Hardware scanner error" },
    { value: "CLIENT_VISIT_ON_DUTY", label: "Client visit / On-duty assignment" },
    { value: "POWER_INTERNET_OUTAGE", label: "Power or network outage" },
    { value: "OTHER_EXCEPTION", label: "Other authorized exception" },
];

export function CorrectionModal({ record, onClose, onSubmit }: Props) {
    const { quota, isLoading: quotaLoading } = useRegularizationQuota(record.attendanceDate);

    const [form, setForm] = useState<CorrectionPayload>({
        attendanceRecordId: record.id,
        correctedLoginTime: record.loginTime ?? "",
        correctedLogoutTime: record.logoutTime ?? "",
        reason: record.correctionReason ?? "",
        category: record.correctionCategory || "FORGOT_TO_PUNCH",
        supportingEvidenceBase64: "",
    });

    const [evidenceFileName, setEvidenceFileName] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);

    const update = (key: keyof CorrectionPayload, value: string) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((e) => ({ ...e, [key]: "" }));
    };

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
            setForm((p) => ({ ...p, supportingEvidenceBase64: result }));
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.correctedLoginTime) e.correctedLoginTime = "Required";
        if (!form.correctedLogoutTime) e.correctedLogoutTime = "Required";
        if (!form.reason || form.reason.trim().length < 10)
            e.reason = "Please provide an explanation of at least 10 characters";

        if (form.correctedLoginTime && form.correctedLogoutTime) {
            const l = moment(`2000-01-01T${form.correctedLoginTime}`);
            const o = moment(`2000-01-01T${form.correctedLogoutTime}`);
            if (o.isSameOrBefore(l)) e.correctedLogoutTime = "Check-out must be after check-in";
        }

        if (form.category === "CLIENT_VISIT_ON_DUTY" && !form.supportingEvidenceBase64) {
            e.evidence = "Supporting document or visit proof required for On-Duty requests";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSubmit?.(form);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeStr?: string | null) =>
        timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "—";
    const inUrl = resolveAvatarUrl(record.checkInSelfieUrl);
    const outUrl = resolveAvatarUrl(record.checkOutSelfieUrl);
    const hasSelfies = Boolean(inUrl || outUrl || record.faceVerified);

    const isExhausted = Boolean(quota && quota.isExhausted);
    const isLocked = Boolean(record.isPayrollLocked);
    const isSubmissionBlocked = isExhausted || isLocked;

    return (
        <>
        <PremiumModal
            isOpen={true}
            onClose={onClose}
            title="Attendance Regularization"
            subtitle={`Request a controlled correction for ${moment(record.attendanceDate).format("MMMM DD, YYYY")}`}
        >
            <div className="space-y-6 sm:space-y-8">
                {/* Policy Quota & SLA Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>
                            Monthly Quota:{" "}
                            <strong>
                                {quota ? `${quota.remainingCount} of ${quota.monthlyLimit} requests remaining` : "..."}
                            </strong>
                        </span>
                    </div>
                    {quota && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>SLA Window: within {quota.deadlineDays} business days</span>
                        </div>
                    )}
                </div>

                {/* Payroll Locked Banner */}
                {isLocked && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
                        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Payroll Locked Period</h4>
                            <p className="mt-1 text-xs opacity-90">
                                Attendance for this period is locked because payroll has already been finalized.
                                Direct adjustments are disabled; please contact HR for an authorized payroll exception.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quota Exhausted Banner */}
                {!isLocked && isExhausted && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-800 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Monthly Limit Reached</h4>
                            <p className="mt-1 text-xs opacity-90">
                                You have exhausted your self-service regularization allowance for this month.
                                Additional requests require direct HR review.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-6 overflow-x-hidden">
                    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div className="absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground/60 shadow-sm sm:flex">
                            <ArrowRight className="h-5 w-5" />
                        </div>

                        <div className="rounded-xl border border-red-500/30 bg-red-300/5 p-5 sm:p-6">
                            <h3 className="mb-3 ml-1 text-xs font-medium text-red-600 sm:mb-4">
                                Recorded punch times
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-red-600">Check in</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {formatTime(record.actualLoginTime || record.loginTime)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-red-600">Check out</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {formatTime(record.actualLogoutTime || record.logoutTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-300/5 p-5 sm:p-6">
                            <h3 className="mb-3 ml-1 text-xs font-medium text-emerald-600 sm:mb-4">
                                Requested times
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-600/80">Check in</span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        {formatTime(form.correctedLoginTime)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-600/80">Check out</span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        {formatTime(form.correctedLogoutTime)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasSelfies && (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <ScanFace className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-medium text-foreground">Biometric Punch Audit</h3>
                                {record.faceVerified && (
                                    <span className="inline-flex rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                        Face verified
                                        {record.faceMatchScore != null &&
                                            ` · ${Number(record.faceMatchScore).toFixed(2)}`}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {inUrl ? (
                                    <button
                                        type="button"
                                        className="block cursor-zoom-in overflow-hidden rounded-md border border-border"
                                        onClick={() =>
                                            setPreview({
                                                src: inUrl,
                                                name: "Check-in selfie",
                                            })
                                        }
                                    >
                                        <img
                                            src={inUrl}
                                            alt="Check-in selfie"
                                            className="h-20 w-20 object-cover"
                                        />
                                        <span className="block bg-muted px-1.5 py-0.5 text-center text-[10px] text-muted-foreground">
                                            Check in
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground">
                                        No in selfie
                                    </div>
                                )}
                                {outUrl ? (
                                    <button
                                        type="button"
                                        className="block cursor-zoom-in overflow-hidden rounded-md border border-border"
                                        onClick={() =>
                                            setPreview({
                                                src: outUrl,
                                                name: "Check-out selfie",
                                            })
                                        }
                                    >
                                        <img
                                            src={outUrl}
                                            alt="Check-out selfie"
                                            className="h-20 w-20 object-cover"
                                        />
                                        <span className="block bg-muted px-1.5 py-0.5 text-center text-[10px] text-muted-foreground">
                                            Check out
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground">
                                        No out selfie
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">Correction Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => update("category", e.target.value)}
                            disabled={isSubmissionBlocked}
                            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/50 bg-muted/30 p-6 sm:grid-cols-2 sm:gap-8 sm:p-8">
                        <div className="space-y-2">
                            <FormInput
                                label="Corrected check in"
                                type="time"
                                step="1"
                                disabled={isSubmissionBlocked}
                                value={form.correctedLoginTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    update("correctedLoginTime", e.target.value)
                                }
                                className={`input h-9 transition-all ${errors.correctedLoginTime ? "border-destructive" : ""}`}
                            />
                            {errors.correctedLoginTime && (
                                <p className="ml-1 text-xs text-destructive">{errors.correctedLoginTime}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <FormInput
                                label="Corrected check out"
                                type="time"
                                step="1"
                                disabled={isSubmissionBlocked}
                                value={form.correctedLogoutTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    update("correctedLogoutTime", e.target.value)
                                }
                                className={`input h-9 transition-all ${errors.correctedLogoutTime ? "border-destructive" : ""}`}
                            />
                            {errors.correctedLogoutTime && (
                                <p className="ml-1 text-xs text-destructive">{errors.correctedLogoutTime}</p>
                            )}
                        </div>
                    </div>

                    {/* Supporting Evidence File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground">
                            Supporting Evidence {form.category === "CLIENT_VISIT_ON_DUTY" && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/50">
                                <UploadCloud className="h-4 w-4 text-primary" />
                                <span>Upload File</span>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    disabled={isSubmissionBlocked}
                                    className="hidden"
                                />
                            </label>
                            {evidenceFileName ? (
                                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                                    <FileText className="h-4 w-4" />
                                    {evidenceFileName}
                                </span>
                            ) : (
                                <span className="text-xs text-muted-foreground">PDF or images (max 5MB)</span>
                            )}
                        </div>
                        {errors.evidence && <p className="ml-1 text-xs text-destructive">{errors.evidence}</p>}
                    </div>

                    <div className="space-y-3">
                        <FormTextarea
                            label="Reason / Explanation"
                            rows={3}
                            disabled={isSubmissionBlocked}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            placeholder="Provide a clear, auditable explanation for the discrepancy..."
                        />
                        {errors.reason && <p className="ml-1 text-xs text-destructive">{errors.reason}</p>}
                    </div>

                    <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:gap-4 sm:p-6">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Requests are validated against shift bounds, business-day deadlines, and monthly limits.
                            Manager or HR approval is required before attendance hours and payroll are reconciled.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col justify-end gap-3 pt-6 sm:flex-row sm:gap-4">
                    <button
                        onClick={onClose}
                        className="btn-outline order-2 h-9 rounded-md px-6 text-sm font-medium sm:order-1"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading || isSubmissionBlocked}
                        className="btn-primary order-1 h-9 gap-2 rounded-md px-6 text-sm font-medium sm:order-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            ""
                        )}
                        Request Regularization
                    </button>
                </div>
            </div>
        </PremiumModal>
        <PhotoOverlay
            open={Boolean(preview)}
            onOpenChange={(open) => !open && setPreview(null)}
            src={preview?.src}
            name={preview?.name}
        />
        </>
    );
}
