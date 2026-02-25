"use client";

import { useState } from "react";
import {
    X,
    Calendar,
    Clock,
    ArrowRight,
    CheckCircle2,
    Info,
    Loader2,

} from "lucide-react";
import moment from "moment";
import { FormTextarea } from "../common/FormTextArea";
import { FormInput } from "../common/FormInput";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    actualLoginTime?: string | null;
    actualLogoutTime?: string | null;
    loginTime?: string | null;
    logoutTime?: string | null;
    correctionReason?: string | null;
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
            if (o.isSameOrBefore(l)) e.correctedLogoutTime = "Must be after entry";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSubmit?.(form);
            // onClose(); // Removed onClose from try block as per new code
        } finally {
            setLoading(false);
        }
    };
    const formatDate = (dateStr: string) => moment(dateStr).format("dddd, MMMM DD, YYYY");
    const formatTime = (timeStr?: string | null) => timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "--:--";

    return (
        <div className="fixed inset-0 -top-20 bg-background/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[2.5rem] w-full max-w-2xl shadow-3xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-linear-to-br from-primary/20 via-primary/5 to-background p-8 text-primary-foreground relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Calendar className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="flex flex-col items-start gap-1 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-black text-black">
                                Attendance Correction
                            </h2>
                        </div>
                        <p className="text-gray-500/70 text-xs font-bold flex items-center gap-2 tracking-wide">
                            Requesting correction for {formatDate(record.attendanceDate)}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-black hover:text-red-500 transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>


                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Comparison Engine */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Connecting Arrow */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-sm items-center justify-center z-10 text-muted-foreground/60">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div className="bg-red-300/5 p-6 rounded-4xl border border-red-500/30 shadow-sm group hover:scale-105 transition-all duration-300">

                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 ml-1">Original Records</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Check In</span>
                                    <span className="text-sm font-black text-red-500">{formatTime(record.actualLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Check Out</span>
                                    <span className="text-sm font-black text-red-500">{formatTime(record.actualLogoutTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-300/5 p-6 rounded-4xl border border-green-500/30 group shadow-sm hover:scale-105 transition-all duration-300">

                            <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4 ml-1">Proposed Correction</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-500/60 uppercase">Check In</span>
                                    <span className="text-sm font-black text-green-500">{formatTime(form.correctedLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-500/60 uppercase">Check Out</span>
                                    <span className="text-sm font-black text-green-500">{formatTime(form.correctedLogoutTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-8 rounded-4xl border border-border/50">
                        <div className="space-y-2">
                            <div className="relative">
                                <FormInput
                                    label="Corrected Login Time"
                                    type="time"
                                    step="1"
                                    value={form.correctedLoginTime}
                                    onChange={(e) => update("correctedLoginTime", e.target.value)}
                                    className={`input pl-12 ${errors.correctedLoginTime ? 'border-destructive' : ''}`}
                                />
                            </div>
                            {errors.correctedLoginTime && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.correctedLoginTime}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <FormInput
                                    label="Corrected Logout Time"
                                    type="time"
                                    step="1"
                                    value={form.correctedLogoutTime}
                                    onChange={(e) => update("correctedLogoutTime", e.target.value)}
                                    className={`input pl-12 ${errors.correctedLogoutTime ? 'border-destructive' : ''}`}
                                />
                            </div>
                            {errors.correctedLogoutTime && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.correctedLogoutTime}</p>}
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div className="space-y-3">
                        <FormTextarea
                            label="Reason"
                            rows={3}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            placeholder="Provide reason"
                        />
                        {errors.reason && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.reason}</p>}
                    </div>
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                            Submission of this adjustment initiates an <span className="text-primary font-bold italic">Attendance Correction</span>.
                            HQ will review the attendance markers against original attendance logs.
                        </p>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-border flex flex-col sm:flex-row justify-end gap-4 bg-muted/20 backdrop-blur-sm">
                    <button
                        onClick={onClose}
                        className="btn-ghost"
                        disabled={loading}
                    >
                        Dismiss
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="btn-primary px-12 gap-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Submit Correction
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
}
