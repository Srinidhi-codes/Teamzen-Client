"use client";

import { useState } from "react";
import {
    Calendar,
    ArrowRight,
    CheckCircle2,
    Info,
    Loader2,
    ScanFace,
} from "lucide-react";
import moment from "moment";
import { FormTextarea } from "../common/FormTextArea";
import { FormInput } from "../common/FormInput";
import { PremiumModal } from "../common/PremiumModal";
import { PhotoOverlay } from "../common/PhotoOverlay";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    actualLoginTime?: string | null;
    actualLogoutTime?: string | null;
    loginTime?: string | null;
    logoutTime?: string | null;
    correctionReason?: string | null;
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
};

export function CorrectionModal({ record, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<CorrectionPayload>({
        attendanceRecordId: record.id,
        correctedLoginTime: record.loginTime ?? "",
        correctedLogoutTime: record.logoutTime ?? "",
        reason: record.correctionReason ?? "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);

    const update = (key: keyof CorrectionPayload, value: string) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((e) => ({ ...e, [key]: "" }));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.correctedLoginTime) e.correctedLoginTime = "Required";
        if (!form.correctedLogoutTime) e.correctedLogoutTime = "Required";
        if (!form.reason || form.reason.length < 10)
            e.reason = "Min 10 characters";

        if (form.correctedLoginTime && form.correctedLogoutTime) {
            const l = moment(`2000-01-01T${form.correctedLoginTime}`);
            const o = moment(`2000-01-01T${form.correctedLogoutTime}`);
            if (o.isSameOrBefore(l)) e.correctedLogoutTime = "Must be after check-in";
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
    const hasSelfies = !!(
        record.checkInSelfieUrl ||
        record.checkOutSelfieUrl ||
        record.faceVerified
    );

    return (
        <>
        <PremiumModal
            isOpen={true}
            onClose={onClose}
            title="Attendance correction"
            subtitle={`Request a change for ${moment(record.attendanceDate).format("MMMM DD, YYYY")}`}
            badge="Correction request"
            icon={Calendar}
        >
            <div className="space-y-8">
                <div className="space-y-6 overflow-y-auto overflow-x-hidden p-6 sm:space-y-8 sm:p-8 custom-scrollbar">
                    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div className="absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground/60 shadow-sm sm:flex">
                            <ArrowRight className="h-5 w-5" />
                        </div>

                        <div className="rounded-xl border border-red-500/30 bg-red-300/5 p-5 sm:p-6">
                            <h3 className="mb-3 ml-1 text-xs font-medium text-red-600 sm:mb-4">
                                Recorded times
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-red-600">Check in</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {formatTime(record.actualLoginTime)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-red-600">Check out</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        {formatTime(record.actualLogoutTime)}
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
                                <h3 className="text-sm font-medium text-foreground">Punch selfies</h3>
                                {record.faceVerified && (
                                    <span className="inline-flex rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                        Face verified
                                        {record.faceMatchScore != null &&
                                            ` · ${Number(record.faceMatchScore).toFixed(2)}`}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {record.checkInSelfieUrl ? (
                                    <button
                                        type="button"
                                        className="block cursor-zoom-in overflow-hidden rounded-md border border-border"
                                        onClick={() =>
                                            setPreview({
                                                src: record.checkInSelfieUrl!,
                                                name: "Check-in selfie",
                                            })
                                        }
                                    >
                                        <img
                                            src={record.checkInSelfieUrl}
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
                                {record.checkOutSelfieUrl ? (
                                    <button
                                        type="button"
                                        className="block cursor-zoom-in overflow-hidden rounded-md border border-border"
                                        onClick={() =>
                                            setPreview({
                                                src: record.checkOutSelfieUrl!,
                                                name: "Check-out selfie",
                                            })
                                        }
                                    >
                                        <img
                                            src={record.checkOutSelfieUrl}
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

                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/50 bg-muted/30 p-6 sm:grid-cols-2 sm:gap-8 sm:p-8">
                        <div className="space-y-2">
                            <FormInput
                                label="Corrected check in"
                                type="time"
                                step="1"
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

                    <div className="space-y-3">
                        <FormTextarea
                            label="Reason"
                            rows={3}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            placeholder="Explain why this correction is needed"
                        />
                        {errors.reason && <p className="ml-1 text-xs text-destructive">{errors.reason}</p>}
                    </div>
                    <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:gap-4 sm:p-6">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Your request will be reviewed by your manager. Times may be checked against system logs.
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
                        disabled={loading}
                        className="btn-primary order-1 h-9 gap-2 rounded-md px-6 text-sm font-medium sm:order-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        Submit request
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
